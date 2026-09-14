// Symmetric runtime-config-parity gate.
//
// Historically this script only checked one direction: "does everything in
// config/production-parity-env.contract.json show up in Compose/Terraform?".
// That let the contract silently fall behind the ~70 env vars Terraform and
// the runtime actually use while still reporting a clean pass. This version
// discovers the real variable set from four independent sources -- runtime
// source code, Terraform, the generated production-parity env file, and the
// contract itself -- and cross-checks all of them against each other in
// both directions (see tools/lib/runtime-config-discovery.mjs for the
// failure-class implementations).
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  parseEnv,
  readJson,
  renderExample,
  repoRoot,
  generatedEntries,
} from "./lib/production-parity-env.mjs";
import { listSourceFiles } from "./lib/fs-walk.mjs";
import {
  discoverEnvVarsInSource,
  discoverTerraformEnvVars,
  discoverComposeInterpolations,
  discoverComposeServiceEnvironmentOverride,
  compareRuntimeAgainstContract,
  compareTerraformAgainstContract,
  checkProductionParityCoverage,
  checkProductionParityRequiredHasSource,
  checkLocalOnlyNeverReachesProduction,
  checkSecretNameHeuristic,
  checkRequiredOptionalConsistency,
  checkDuplicateNames,
  checkUnusedContractEntries,
  checkEnvironmentBehaviorExceptions,
  checkDynamicNameSites,
} from "./lib/runtime-config-discovery.mjs";

const FORBIDDEN_LOCAL_AUTH_FALLBACK_TOKENS = [
  "LocalClientAccount",
  "loginWithLocalClient",
  "registerWithLocalClient",
  "readLocalClientSession",
  "writeLocalClientState",
  "canUseLocalAuthFallback",
  "isLocalClientRuntimeAvailable",
  "localClientCapabilities",
];

const SOURCE_ROOTS = [
  "apps/api/src",
  "apps/bff/src",
  "apps/worker/src",
  "apps/web/src",
  "packages/ai-runtime/src",
  "packages/papa-runtime/src",
  "packages/integrations/src",
  "packages/storage/src",
  "packages/database/src",
  "packages/contracts/src",
];

const failures = [];
const contract = await readJson("config/production-parity-env.contract.json");
const localContract = await readJson(contract.localContract);

// --- Structural checks on the contract itself -------------------------------

failures.push(...checkDuplicateNames(contract));
failures.push(...checkRequiredOptionalConsistency(contract));
failures.push(...checkProductionParityCoverage(contract));
failures.push(...checkProductionParityRequiredHasSource(contract));
failures.push(...checkSecretNameHeuristic(contract));

// --- Discover runtime source (Class A + dynamic-name sites) -----------------

const sourceFilesByPath = new Map();
const discoveredRuntimeNames = new Set();
const discoveredDynamicSitesByFile = new Map();

for (const root of SOURCE_ROOTS) {
  const absoluteRoot = resolve(repoRoot, root);
  for (const filePath of await listSourceFiles(absoluteRoot)) {
    const text = await readFile(filePath, "utf8");
    const relativePath = filePath.slice(repoRoot.length + 1).replaceAll("\\", "/");
    sourceFilesByPath.set(relativePath, text);
    const { names, dynamicAccessSites } = discoverEnvVarsInSource(text);
    for (const name of names) discoveredRuntimeNames.add(name);
    if (dynamicAccessSites.length > 0) discoveredDynamicSitesByFile.set(relativePath, dynamicAccessSites);
  }
}

// Dynamic-name sites resolve to concrete names that ARE genuinely read by
// runtime code; fold them into the discovered set so checkUnusedContractEntries
// doesn't flag them as dead, then separately verify the sites/resolutions.
for (const site of contract.dynamicNameSites ?? []) {
  for (const name of site.resolvedNames) discoveredRuntimeNames.add(name);
}

// VITE_BFF_BASE_URL is a Vite build-time constant (import.meta.env), tracked
// separately via contract.frontend rather than as a runtime-process env
// entry -- it is never read via process.env by any deployed container.
discoveredRuntimeNames.delete(contract.frontend.baseUrlVariable);

failures.push(...compareRuntimeAgainstContract(discoveredRuntimeNames, contract));
failures.push(...checkDynamicNameSites(contract, sourceFilesByPath, discoveredDynamicSitesByFile));

// --- Discover Terraform (Class B, D, E, G) -----------------------------------

const terraformText = await readFile(resolve(repoRoot, "infra/terraform/main.tf"), "utf8");
const terraformByService = discoverTerraformEnvVars(terraformText);

failures.push(...compareTerraformAgainstContract(terraformByService, contract));
failures.push(...checkLocalOnlyNeverReachesProduction(contract, terraformByService));

// --- Unused-entry check needs both discovery sources together --------------

failures.push(...checkUnusedContractEntries(contract, discoveredRuntimeNames, terraformByService));

// --- Class H: environment-specific behavior forks ---------------------------
//
// As of the P0-2A fix, no service's production-parity NODE_ENV diverges
// from its real production/staging value anymore -- the BFF's one
// environment-gated behavior (the Cloud Run identity-token hop) is now
// governed by the explicit BFF_UPSTREAM_IDENTITY_MODE capability flag
// instead (see config/production-parity-env.contract.json), so it no
// longer needs a NODE_ENV divergence to differ safely between environments.
// This map (and checkEnvironmentBehaviorExceptions below) is left in place
// as a standing guard: if a future change reintroduces a NODE_ENV
// divergence for any service, update this map, and any exact
// `runtimeEnvironment === "production"` fork in that service's config
// loader must be registered in contract.environmentBehaviorExceptions or
// this gate fails.
const serviceNodeEnv = {
  api: { productionParity: "production", terraform: "production" },
  bff: { productionParity: "production", terraform: "production" },
  worker: { productionParity: "production", terraform: "production" },
};
const divergingServices = new Set(
  Object.entries(serviceNodeEnv)
    .filter(([, { productionParity, terraform }]) => productionParity !== terraform)
    .map(([service]) => service),
);
failures.push(...checkEnvironmentBehaviorExceptions(contract, sourceFilesByPath, divergingServices));

// Verify the compose-level override that CAUSES the one documented
// divergence above is itself really there (not silently removed, which
// would make bff's real production-parity NODE_ENV match production and
// turn the identity-hop exception stale in the other direction).
const composeText = await readFile(resolve(repoRoot, "compose.production-parity.yml"), "utf8");
for (const [service, envs] of Object.entries(contract.serviceEnvironmentOverrides ?? {})) {
  const composeServiceName = contract.services[service]?.composeService;
  const override = discoverComposeServiceEnvironmentOverride(composeText, composeServiceName);
  for (const [environment, vars] of Object.entries(envs)) {
    if (environment !== "production-parity") continue;
    for (const [name, expected] of Object.entries(vars)) {
      const actual = override.get(name);
      if (actual !== expected.value) {
        failures.push(
          `[H] compose.production-parity.yml's ${composeServiceName} does not override ${name} to `
          + `'${expected.value}' (found '${actual ?? "<absent>"}') -- ${expected.reason}`,
        );
      }
    }
  }
}

// --- Compose interpolation check (unchanged in spirit from schemaVersion 1) -

const contractNames = new Set(contract.entries.map((e) => e.name));
for (const name of discoverComposeInterpolations(composeText)) {
  if (!contractNames.has(name)) failures.push(`[B] compose.production-parity.yml references \${${name}}, absent from the canonical contract.`);
}

// --- Generated file checks ---------------------------------------------------

const examplePath = resolve(repoRoot, contract.generatedExampleFile);
const example = await readFile(examplePath, "utf8");
if (example !== renderExample(contract)) {
  failures.push(`${contract.generatedExampleFile} is not generated from the env contract. Run: pnpm generate:production-parity-env-example`);
}

const envPath = resolve(repoRoot, contract.generatedEnvFile);
if (existsSync(envPath)) {
  const actual = parseEnv(await readFile(envPath, "utf8"));
  for (const entry of generatedEntries(contract)) {
    if (!actual.has(entry.name)) failures.push(`${contract.generatedEnvFile} is missing ${entry.name}.`);
  }
  for (const name of actual.keys()) {
    if (!contractNames.has(name)) failures.push(`[C] ${contract.generatedEnvFile} sets ${name}, absent from the canonical contract.`);
  }
  if (actual.get("NODE_ENV") !== "production") {
    failures.push("Generated NODE_ENV must be production for API and Worker parity containers (BFF's override lives in compose.production-parity.yml, not the shared env file).");
  }
  if (actual.get("REDIS_URL") && !actual.get("REDIS_URL").startsWith("rediss://")) {
    failures.push("Generated REDIS_URL must use rediss://.");
  }
  if (actual.get("BFF_SESSION_STORE") === "test-memory") {
    failures.push("Generated BFF_SESSION_STORE must not use test-memory.");
  }
  if (actual.get("BFF_ALLOWED_ORIGINS") !== localContract.canonicalLocalEndpoint.origin) {
    failures.push("Generated BFF_ALLOWED_ORIGINS does not match the LP-0 canonical origin.");
  }
  const expectedHosts = `${localContract.canonicalLocalEndpoint.hostname},${localContract.canonicalLocalEndpoint.hostname}:53001`;
  if (actual.get("BFF_PUBLIC_HOSTS") !== expectedHosts) {
    failures.push("Generated BFF_PUBLIC_HOSTS does not match the LP-0 host contract.");
  }
  if (actual.get("BFF_INTERNAL_AUTH_ACTIVE_SECRET") !== actual.get("PAPADATA_API_AUTH_ACTIVE_SECRET")) {
    failures.push("Generated active API/BFF internal auth secrets differ.");
  }
  if (actual.get("BFF_INTERNAL_AUTH_PREVIOUS_SECRET") !== actual.get("PAPADATA_API_AUTH_PREVIOUS_SECRET")) {
    failures.push("Generated previous API/BFF internal auth secrets differ.");
  }
}

// --- Frontend / BFF client checks (unchanged from schemaVersion 1) ---------

const webClient = await readFrontendBffClient();
if (!webClient.includes(contract.frontend.baseUrlVariable)) {
  failures.push(`Frontend does not reference ${contract.frontend.baseUrlVariable}.`);
}
for (const token of FORBIDDEN_LOCAL_AUTH_FALLBACK_TOKENS) {
  if (webClient.includes(token)) {
    failures.push(`Frontend BFF client must not contain a local auth fallback (found "${token}").`);
  }
}

console.log(JSON.stringify({
  contract: contract.contractId,
  checkedVariables: contract.entries.length,
  discoveredRuntimeNames: discoveredRuntimeNames.size,
  discoveredTerraformServices: [...terraformByService.keys()],
  generatedEnvPresent: existsSync(envPath),
  result: failures.length === 0 ? "pass" : "fail",
  failures,
}, null, 2));

if (failures.length > 0) process.exitCode = 1;

async function readFrontendBffClient() {
  const candidates = [
    "apps/web/src/runtime/shared/api/bffClient.ts",
    "apps/web/src/storybook-next/runtime/shared/api/bffClient.ts",
    "apps/web/src/shared/api/bffClient.ts",
  ];
  for (const candidate of candidates) {
    const path = resolve(repoRoot, candidate);
    if (existsSync(path)) return readFile(path, "utf8");
  }
  failures.push(`Frontend BFF client not found. Checked: ${candidates.join(", ")}`);
  return "";
}
