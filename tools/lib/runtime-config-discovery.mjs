// Pure (no file I/O) discovery and comparison functions for runtime config
// parity. Kept dependency-free and side-effect-free so they can be unit
// tested against synthetic fixtures (see runtime-config-parity.test.mjs)
// without touching the real repository.
//
// "Pure" here means: every function takes already-read text/JSON as input
// and returns data. All file/network I/O lives in the CLI wrapper
// (verify-production-parity-env-contract.mjs).

const ENV_NAME = "[A-Z][A-Z0-9_]*";

// ---------------------------------------------------------------------------
// Runtime source discovery (apps/*/src, packages/*/src)
// ---------------------------------------------------------------------------

// Extracts every statically-discoverable environment variable name a given
// source file reads, plus a best-effort marker for dynamic (template
// literal / computed key) access that can't be resolved to a concrete name.
export function discoverEnvVarsInSource(text) {
  const names = new Set();

  for (const match of text.matchAll(new RegExp(String.raw`\bprocess\.env\.(${ENV_NAME})\b`, "gu"))) {
    names.add(match[1]);
  }
  for (const match of text.matchAll(new RegExp(String.raw`\bprocess\.env\[\s*["'](${ENV_NAME})["']\s*\]`, "gu"))) {
    names.add(match[1]);
  }
  // `env.NAME`, where `env` is the conventional parameter name every
  // config loader in this repo uses for a NodeJS.ProcessEnv-shaped object
  // (readProductionConfig(env), readBffConfig(env), readWorkerConfig(env),
  // packages/integrations adapters, packages/ai-runtime, packages/papa-runtime).
  // Excludes Vite's unrelated `import.meta.env.NAME` (e.g. import.meta.env.DEV),
  // which is a *build-time* well-known constant, not a process env var.
  for (const match of text.matchAll(new RegExp(String.raw`(?<!meta\.)\benv\.(${ENV_NAME})\b`, "gu"))) {
    names.add(match[1]);
  }
  // Helper calls shaped like `someHelper(env, "NAME", ...)` or
  // `someHelper(process.env, "NAME", "OTHER_NAME")` -- covers
  // requiredText/requiredSecret/optionalSecret/readEnum/readCredentials etc,
  // including multi-name calls (OAuth's readCredentials takes two) and
  // multi-line calls (arguments on their own line).
  for (const match of text.matchAll(/\(\s*(?:process\.env|env)\s*,\s*((?:"[A-Z][A-Z0-9_]*"[\s,]*)+)\)/gu)) {
    for (const nameMatch of match[1].matchAll(new RegExp(`"(${ENV_NAME})"`, "gu"))) {
      names.add(nameMatch[1]);
    }
  }
  // Helper calls shaped like `readPositiveNumberEnv("NAME", fallback)` --
  // local helpers that read process.env[name]/process.env[name] internally
  // rather than taking `env`/`process.env` as an explicit argument. Scoped
  // to function names that look like they read env (rather than any call
  // whose first argument happens to be an uppercase-snake string, e.g.
  // error/finding reason codes like unavailable("MISSING_X", "message")).
  for (const match of text.matchAll(
    new RegExp(String.raw`\b(?:read(?:Positive)?(?:Int|Number|Bounded)?Env|readBoundedSeconds|readEnv|positive|requiredEnv|optionalEnv)\(\s*"(${ENV_NAME})"\s*[,)]`, "gu"),
  )) {
    names.add(match[1]);
  }

  const dynamicAccessSites = [];
  // `process.env[`...${...}...`]` -- a computed/template-literal key that
  // cannot be resolved to a concrete name by static analysis. Every such
  // site must be registered in the contract's dynamicNameSites so the
  // resolved names it can produce are still tracked.
  for (const match of text.matchAll(/process\.env\[\s*`([^`]*)`\s*\]/gu)) {
    dynamicAccessSites.push(match[0]);
  }

  return { names, dynamicAccessSites };
}

// ---------------------------------------------------------------------------
// Terraform discovery (main.tf)
// ---------------------------------------------------------------------------

// Finds every top-level balanced-brace block whose header matches
// `headerPattern` (a RegExp with the 'g' flag, matched against the start of
// a block). Returns [{ header: [...matchGroups], body: "inner text" }].
export function findBlocks(text, headerPattern) {
  const blocks = [];
  const re = new RegExp(headerPattern.source, headerPattern.flags.includes("g") ? headerPattern.flags : `${headerPattern.flags}g`);
  let match;
  while ((match = re.exec(text)) !== null) {
    const searchFrom = match.index + match[0].length;
    const openBraceIndex = text.indexOf("{", searchFrom);
    // Guard against a header pattern matching as a PREFIX of a longer,
    // unrelated identifier (e.g. bare `env` matching inside
    // `var.environment == "production"`): only accept the brace if nothing
    // but whitespace separates the end of the header match from it. A real
    // header (e.g. `env {`, `resource "x" "y" {`) always has just
    // whitespace there; a false match like `environment` does not, because
    // the next `{` belongs to some unrelated, possibly much later block.
    if (openBraceIndex === -1 || text.slice(searchFrom, openBraceIndex).trim() !== "") {
      re.lastIndex = match.index + 1;
      continue;
    }
    let depth = 1;
    let index = openBraceIndex + 1;
    while (index < text.length && depth > 0) {
      if (text[index] === "{") depth += 1;
      else if (text[index] === "}") depth -= 1;
      index += 1;
    }
    blocks.push({ match, body: text.slice(openBraceIndex + 1, index - 1) });
    re.lastIndex = index;
  }
  return blocks;
}

// Removes every `dynamic "env" { ... }` block from `text`, returning
// { withoutDynamicEnvBlocks, dynamicEnvBlocks: [bodyText, ...] }.
function extractDynamicEnvBlocks(text) {
  const blocks = findBlocks(text, /dynamic\s+"env"\s*/u);
  let withoutDynamicEnvBlocks = text;
  // Replace from the end so earlier indices stay valid.
  for (const { match, body } of [...blocks].reverse()) {
    const openBraceIndex = text.indexOf("{", match.index);
    const closeIndex = text.indexOf(body, openBraceIndex) + body.length + 1;
    withoutDynamicEnvBlocks = withoutDynamicEnvBlocks.slice(0, match.index) + withoutDynamicEnvBlocks.slice(closeIndex);
  }
  return { withoutDynamicEnvBlocks, dynamicEnvBlocks: blocks.map((b) => b.body) };
}

// Discovers every Cloud Run env var Terraform injects, grouped by service
// (the second label of `resource "google_cloud_run_v2_service" "X" { ... }`).
// Returns Map<service, Map<envName, { secret: boolean }>>.
export function discoverTerraformEnvVars(mainTfText) {
  const byService = new Map();
  // The worker runs as a `google_cloud_run_v2_worker_pool`, not a
  // `google_cloud_run_v2_service` like api/bff/web -- both resource types
  // use the same `env { name = ... }` / `dynamic "env"` shape internally.
  const serviceBlocks = findBlocks(
    mainTfText,
    /resource\s+"google_cloud_run_v2_(?:service|worker_pool)"\s+"([a-z]+)"\s*/u,
  );

  for (const { match, body } of serviceBlocks) {
    const service = match[1];
    const vars = new Map();
    const { withoutDynamicEnvBlocks, dynamicEnvBlocks } = extractDynamicEnvBlocks(body);

    // Plain `env { name = "X" ... }` blocks: never secret in this codebase
    // (secrets always flow through `dynamic "env"` + secret_key_ref).
    for (const { body: envBody } of findBlocks(withoutDynamicEnvBlocks, /\benv\s*/u)) {
      const nameMatch = envBody.match(new RegExp(`name\\s*=\\s*"(${ENV_NAME})"`, "u"));
      if (nameMatch) vars.set(nameMatch[1], { secret: envBody.includes("secret_key_ref") });
    }

    for (const dynamicBody of dynamicEnvBlocks) {
      const secret = dynamicBody.includes("secret_key_ref");
      // Bare-identifier-key map form: `KEY = "secret_manager_key"`.
      for (const lineMatch of dynamicBody.matchAll(new RegExp(`^\\s*(${ENV_NAME})\\s*=\\s*"`, "gmu"))) {
        vars.set(lineMatch[1], { secret });
      }
      // List-of-objects form: `{ name = "KEY", key = "secret_manager_key" }`.
      for (const nameMatch of dynamicBody.matchAll(new RegExp(`\\bname\\s*=\\s*"(${ENV_NAME})"`, "gu"))) {
        vars.set(nameMatch[1], { secret });
      }
    }

    byService.set(service, vars);
  }

  return byService;
}

// ---------------------------------------------------------------------------
// Compose discovery
// ---------------------------------------------------------------------------

// `${VAR}` / `${VAR:-default}` interpolations anywhere in a compose file.
export function discoverComposeInterpolations(composeText) {
  return new Set(
    [...composeText.matchAll(/\$\{([A-Z0-9_]+)(?::[^}]*)?\}/gu)].map((m) => m[1]),
  );
}

// Extracts one service's literal `environment:` block from compose YAML as a
// Map<key, value> -- deliberately simple (this repo's overrides are a short,
// flat `KEY: value` list) rather than a full YAML parser.
export function discoverComposeServiceEnvironmentOverride(composeText, serviceName) {
  const serviceHeader = new RegExp(`^  ${serviceName}:\\s*$`, "mu");
  const headerMatch = serviceHeader.exec(composeText);
  if (!headerMatch) return new Map();
  const rest = composeText.slice(headerMatch.index + headerMatch[0].length);
  // The service block ends at the next line indented exactly 2 spaces
  // (i.e. the next top-level service key).
  const nextServiceMatch = rest.match(/\n {2}\S/u);
  const serviceBody = nextServiceMatch ? rest.slice(0, nextServiceMatch.index) : rest;
  const environmentMatch = serviceBody.match(/\n {4}environment:\s*\n((?:\s{6}.+\n?)+)/u);
  if (!environmentMatch) return new Map();
  const overrides = new Map();
  for (const line of environmentMatch[1].split("\n")) {
    const kv = line.trim();
    if (!kv) continue;
    const separator = kv.indexOf(":");
    if (separator <= 0) continue;
    overrides.set(kv.slice(0, separator).trim(), kv.slice(separator + 1).trim());
  }
  return overrides;
}

// ---------------------------------------------------------------------------
// Symmetric comparison (failure classes A-G; class H lives in
// checkEnvironmentBehaviorExceptions since it needs source snippets, not
// just name sets).
// ---------------------------------------------------------------------------

export function compareRuntimeAgainstContract(discoveredNames, contract) {
  const failures = [];
  const contractNames = new Set(contract.entries.map((e) => e.name));
  for (const name of discoveredNames) {
    if (!contractNames.has(name)) {
      failures.push(`[A] Runtime code reads ${name}, but it is absent from the canonical contract.`);
    }
  }
  return failures;
}

export function compareTerraformAgainstContract(terraformByService, contract) {
  const failures = [];
  const byName = new Map(contract.entries.map((e) => [e.name, e]));

  for (const [service, vars] of terraformByService) {
    for (const [name, { secret }] of vars) {
      const entry = byName.get(name);
      if (!entry) {
        failures.push(`[B] Terraform injects ${name} into ${service}, but it is absent from the canonical contract.`);
        continue;
      }
      if (!entry.services.includes(service)) {
        failures.push(`[G] Terraform injects ${name} into service '${service}', but the contract scopes it to [${entry.services.join(", ")}].`);
      }
      if (entry.secret !== secret) {
        failures.push(
          secret
            ? `[E] Terraform sources ${name} from Secret Manager (secret_key_ref), but the contract declares secret: ${entry.secret}.`
            : `[E] Terraform injects ${name} as a plain value, but the contract declares secret: ${entry.secret}.`,
        );
      }
      if (!entry.environments.includes("staging") || !entry.environments.includes("production")) {
        failures.push(`[D] Terraform injects ${name}, but the contract's environments [${entry.environments.join(", ")}] do not include staging/production.`);
      }
    }
  }

  return failures;
}

// Class C, generation half: required.production-parity=true is a claim that
// `pnpm prepare:production-parity` will actually put a value in
// .env.production-parity for this variable -- generatedEntries() (see
// tools/lib/production-parity-env.mjs) only writes entries whose `source` is
// non-null. A required-for-parity entry with source: null is silently
// omitted by the generator while this same script's own coverage check
// (below) still reports it "available" merely because it's required --
// exactly the PAPADATA_COOKIE_CONSENT_VERSION defect this check exists to
// catch: prepare succeeds, verify reports pass, and the API fails at
// runtime. The only sanctioned escape hatch is operatorSuppliedReason: a
// non-null string documenting that the variable is deliberately filled in
// through some other supported local mechanism (never a silent gap).
export function checkProductionParityRequiredHasSource(contract) {
  const failures = [];
  for (const entry of contract.entries) {
    if (!entry.required["production-parity"]) continue;
    if (entry.source != null) continue;
    if (entry.operatorSuppliedReason) continue;
    failures.push(
      `[C] ${entry.name} has required["production-parity"]=true but source: null and no `
      + "operatorSuppliedReason -- pnpm prepare:production-parity would silently omit it from "
      + ".env.production-parity while this verifier still reports pass. Give it a concrete "
      + "production-parity source, or set operatorSuppliedReason explaining the supported local "
      + "override that fills it in instead.",
    );
  }
  return failures;
}

// Class C: a variable REQUIRED in staging/production must either be
// available in production-parity (required there too, or at least
// generatable), or carry an explicit, reviewed productionOnlyReason.
export function checkProductionParityCoverage(contract) {
  const failures = [];
  for (const entry of contract.entries) {
    const requiredInProd = entry.required.production || entry.required.staging;
    if (!requiredInProd) continue;
    const availableInParity = entry.environments.includes("production-parity")
      && (entry.required["production-parity"] || entry.source != null);
    if (!availableInParity && !entry.productionOnlyReason) {
      failures.push(
        `[C] ${entry.name} is required in production/staging but not available in production-parity, `
        + "and carries no productionOnlyReason explaining the gap.",
      );
    }
  }
  return failures;
}

// Class D: a variable scoped ONLY to compose/local (never staging/production)
// must not appear anywhere Terraform could inject it, and must carry a
// parityOnlyReason.
export function checkLocalOnlyNeverReachesProduction(contract, terraformByService) {
  const failures = [];
  const terraformNames = new Set(
    [...terraformByService.values()].flatMap((vars) => [...vars.keys()]),
  );
  for (const entry of contract.entries) {
    const localOnly = !entry.environments.includes("staging") && !entry.environments.includes("production");
    if (!localOnly) continue;
    if (terraformNames.has(entry.name)) {
      failures.push(`[D] ${entry.name} is declared local-only but Terraform injects it -- it would reach staging/production.`);
    }
    if (!entry.parityOnlyReason) {
      failures.push(`[D] ${entry.name} is scoped to environments [${entry.environments.join(", ")}] only, but carries no parityOnlyReason.`);
    }
  }
  return failures;
}

// Class E, name-heuristic half: a name that looks secret-shaped must be
// declared secret: true (catches a fresh entry that forgot the flag, even
// before Terraform/runtime cross-checks would find it).
const SECRET_NAME_PATTERN = /(SECRET|PASSWORD|_KEY$|_KEY_BASE64$|API_KEY|TOKEN|CERTIFICATE_REF|_URL$)/u;
// Reviewed false positives from the heuristic above, each with a reason a
// human confirmed at classification time. Anything added here should be
// re-justified, not silently grown.
const SECRET_HEURISTIC_EXCEPTIONS = new Map([
  // *_URL that is a plain endpoint/origin, not a credential-bearing connection string.
  ["PAPADATA_STORAGE_ENDPOINT", "MinIO endpoint URL, no embedded credentials"],
  ["PAPADATA_WEB_ORIGIN", "public web origin"],
  ["GUS_BIR_BASE_URL", "public GUS/BIR API base URL"],
  ["KSEF_BASE_URL", "public KSeF API base URL"],
  ["PAPADATA_PAPA_REMOTE_ENDPOINT", "AI provider endpoint URL, credential is the separate _API_KEY var"],
  ["PAPADATA_BILLING_RETURN_ORIGIN", "public redirect origin"],
  ["PAPADATA_TERMS_URL", "public legal document URL"],
  ["PAPADATA_PRIVACY_URL", "public legal document URL"],
  ["BFF_UPSTREAM_IDENTITY_AUDIENCE", "Cloud Run service URL used as a token audience, not a credential"],
  ["API_ORIGIN", "internal service URL, no embedded credentials"],
  // Matches "TOKEN"/"SECRET" as a name-compound substring, not a credential value.
  ["BFF_INTERNAL_TOKEN_TTL_SECONDS", "a duration in seconds, not a token"],
  ["AUTH_INTERNAL_TOKEN_MAX_AGE_SECONDS", "a duration in seconds, not a token"],
  ["PAPADATA_INTEGRATION_SECRET_LOCATION", "a GCP region string naming where secrets are provisioned, not a secret value"],
  ["PAPADATA_INTEGRATION_SECRET_PROJECT", "a GCP project id naming where secrets are provisioned, not a secret value"],
  ["PAPADATA_INTEGRATION_SECRET_WRITE_ENABLED", "a boolean feature flag, not a secret value"],
]);

export function checkSecretNameHeuristic(contract) {
  const failures = [];
  for (const entry of contract.entries) {
    const looksSecret = SECRET_NAME_PATTERN.test(entry.name) && !SECRET_HEURISTIC_EXCEPTIONS.has(entry.name);
    if (looksSecret && !entry.secret) {
      failures.push(`[E] ${entry.name} looks secret-shaped by name but is declared secret: false.`);
    }
  }
  return failures;
}

// Class F: required/optional consistency within the contract itself --
// every environment key in `required` must be one of the declared
// environments, and required=true for an environment must imply that
// environment is in `environments`.
export function checkRequiredOptionalConsistency(contract) {
  const failures = [];
  for (const entry of contract.entries) {
    for (const [env, isRequired] of Object.entries(entry.required)) {
      if (!contract.environments.includes(env)) {
        failures.push(`[F] ${entry.name} declares required.${env}, which is not a known environment.`);
      }
      if (isRequired && !entry.environments.includes(env)) {
        failures.push(`[F] ${entry.name} is required in '${env}' but '${env}' is not in its environments list.`);
      }
    }
  }
  return failures;
}

export function checkDuplicateNames(contract) {
  const seen = new Map();
  for (const entry of contract.entries) {
    seen.set(entry.name, (seen.get(entry.name) ?? 0) + 1);
  }
  return [...seen.entries()]
    .filter(([, count]) => count > 1)
    .map(([name, count]) => `Duplicate contract entry for ${name} (${count} occurrences).`);
}

// An entry the runtime code never reads and Terraform never injects is dead
// weight in the contract (ETAP 8: "nie dodawaj setek envów na wszelki
// wypadek"). Local-only compose primitives are exempt (they're never read
// via process.env by app code by design -- they're inputs to the generator).
// Class H: an exact `runtimeEnvironment === "production"` (or similar
// literal-environment) fork is only safe when that service's
// production-parity NODE_ENV differs from its real production/staging
// NODE_ENV -- see the module doc comment on environmentBehaviorExceptions
// in the contract for the full reasoning. This function assumes the caller
// has already determined which services actually diverge; it:
//   1. asserts every registered exception's file still contains its
//      registered substring (catches a stale/renamed exception silently
//      stopping being true), and
//   2. asserts the number of exact-string forks found in that file equals
//      the number of registered exceptions for that file (catches a new,
//      undeclared fork).
export function checkEnvironmentBehaviorExceptions(contract, sourceFilesByPath, divergingServices) {
  const failures = [];
  const exceptions = contract.environmentBehaviorExceptions ?? [];

  for (const exception of exceptions) {
    const text = sourceFilesByPath.get(exception.file);
    if (text === undefined) {
      failures.push(`[H] environmentBehaviorExceptions[${exception.id}] references missing file ${exception.file}.`);
      continue;
    }
    if (!divergingServices.has(exception.service)) {
      failures.push(
        `[H] environmentBehaviorExceptions[${exception.id}] is registered for service '${exception.service}', `
        + "but that service's production-parity NODE_ENV no longer diverges from production -- the exception is stale.",
      );
      continue;
    }
    if (!text.includes(exception.mustContainSubstring)) {
      failures.push(`[H] environmentBehaviorExceptions[${exception.id}] substring no longer found in ${exception.file} (code changed under the exception).`);
    }
  }

  const exceptionsByFile = new Map();
  for (const exception of exceptions) {
    if (!exceptionsByFile.has(exception.file)) exceptionsByFile.set(exception.file, []);
    exceptionsByFile.get(exception.file).push(exception);
  }

  for (const service of divergingServices) {
    const serviceEntry = Object.entries(contract.services).find(([name]) => name === service);
    if (!serviceEntry) continue;
    const file = serviceEntry[1].configLoader;
    const text = sourceFilesByPath.get(file);
    if (text === undefined) continue;
    const registered = exceptionsByFile.get(file) ?? [];
    // A `runtimeEnvironment === "production"` check that also ORs in
    // `runtimeEnvironment === "production-parity"` nearby treats both
    // environments identically -- it's explicitly UNIFIED, not a hidden
    // fork, so it doesn't need to be registered. Only count checks that
    // test "production" without that nearby unification.
    const forkMatches = [...text.matchAll(/runtimeEnvironment\s*===\s*"production"/gu)].filter((match) => {
      const windowStart = Math.max(0, match.index - 80);
      const windowEnd = Math.min(text.length, match.index + match[0].length + 80);
      return !text.slice(windowStart, windowEnd).includes('"production-parity"');
    });
    const totalForks = forkMatches.length;
    if (totalForks > registered.length) {
      failures.push(
        `[H] ${file} contains ${totalForks} exact runtimeEnvironment === "production" fork(s) but only `
        + `${registered.length} are registered in environmentBehaviorExceptions -- a new undeclared `
        + "environment-specific behavior fork was introduced.",
      );
    }
  }

  return failures;
}

// Verifies every registered dynamic-name access site (a bracket + template
// literal env lookup that static name-extraction can't resolve) still
// exists in its file, and that all names it can resolve to are present in
// the contract. Also flags any dynamic-access site found in source that
// isn't covered by a registered site (a new undeclared dynamic pattern).
export function checkDynamicNameSites(contract, sourceFilesByPath, discoveredDynamicSitesByFile) {
  const failures = [];
  const sites = contract.dynamicNameSites ?? [];
  const contractNames = new Set(contract.entries.map((e) => e.name));

  for (const site of sites) {
    const text = sourceFilesByPath.get(site.file);
    if (text === undefined || !text.includes(site.pattern)) {
      failures.push(`[dynamic] dynamicNameSites[${site.file}] pattern no longer found in source.`);
      continue;
    }
    for (const name of site.resolvedNames) {
      if (!contractNames.has(name)) {
        failures.push(`[A] dynamicNameSites[${site.file}] resolves to ${name}, which is absent from the canonical contract.`);
      }
    }
  }

  const registeredFiles = new Set(sites.map((s) => s.file));
  for (const [file, dynamicSites] of discoveredDynamicSitesByFile) {
    if (dynamicSites.length > 0 && !registeredFiles.has(file)) {
      failures.push(`[dynamic] ${file} contains a dynamic (template-literal-keyed) env access not registered in dynamicNameSites: ${dynamicSites[0]}`);
    }
  }

  return failures;
}

export function checkUnusedContractEntries(contract, discoveredRuntimeNames, terraformByService) {
  const failures = [];
  const terraformNames = new Set([...terraformByService.values()].flatMap((vars) => [...vars.keys()]));
  for (const entry of contract.entries) {
    // Local-only compose credential primitives are never read directly by
    // application code via process.env -- they exist only to feed the
    // local generator's template/reference sources (see parityOnlyReason).
    if (entry.services.includes("compose")) continue;
    if (discoveredRuntimeNames.has(entry.name)) continue;
    if (terraformNames.has(entry.name)) continue;
    failures.push(`[unused] ${entry.name} is declared in the contract but not read by any discovered runtime source and not injected by Terraform.`);
  }
  return failures;
}
