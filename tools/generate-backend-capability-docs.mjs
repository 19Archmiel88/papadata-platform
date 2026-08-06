import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve, relative } from "node:path";

const root = resolve(process.cwd());
const check = process.argv.includes("--check");
const controllerRoot = resolve(root, "apps/api/src/production");
const targetContractPath = resolve(root, "contracts/openapi-1.0.json");
const files = await collectFiles(controllerRoot);
const operations = [];

for (const file of files.filter((item) => item.endsWith(".controller.ts"))) {
  const source = await readFile(file, "utf8");
  const controllerPath = source.match(/@Controller\("([^"]*)"\)/u)?.[1] ?? "";
  const decoratorPattern = /@(Get|Post|Put|Patch|Delete)(?:\("([^"]*)"\)|\(\))([\s\S]*?)(?=\n\s*(?:async\s+)?[A-Za-z_$][\w$]*\s*\()/gu;
  for (const match of source.matchAll(decoratorPattern)) {
    const method = match[1].toUpperCase();
    const route = match[2] ?? "";
    const decorators = match[3];
    const operationId = decorators.match(/@OperationId\("([^"]+)"\)/u)?.[1];
    if (!operationId) continue;
    const servicePath = normalizePath(`/${controllerPath}/${route}`)
      .replace(/:([A-Za-z0-9_]+)/gu, "{$1}");
    const controllerFile = relative(root, file);
    operations.push({
      operationId,
      method,
      servicePath,
      bffPath: `/api${servicePath}`,
      controllerFile,
      auth: readAuth(decorators),
      releaseStatus: readReleaseStatus(operationId, controllerFile),
      implementation: implementationFor(operationId, controllerFile),
    });
  }
}
operations.sort((a, b) => a.operationId.localeCompare(b.operationId));

const openApi = JSON.parse(await readFile(targetContractPath, "utf8"));
const targetOperations = collectTargetOperations(openApi);
const runtimeByRoute = new Map(
  operations.map((item) => [`${item.method} ${item.servicePath}`, item]),
);
const targetCoverage = targetOperations.map((target) => {
  const runtime = runtimeByRoute.get(`${target.method} ${target.servicePath}`) ?? null;
  return {
    ...target,
    runtimeOperationId: runtime?.operationId ?? null,
    exact: runtime?.operationId === target.operationId,
    implementation: runtime?.implementation ?? null,
  };
});
const exactTargetOperations = targetCoverage.filter((item) => item.exact).length;
const extraOperations = operations.filter((operation) =>
  !targetOperations.some((target) =>
    target.method === operation.method && target.servicePath === operation.servicePath,
  ),
).length;

const providers = [
  "woocommerce",
  "shopify",
  "baselinker",
  "allegro",
  "google_ads",
  "meta_ads",
  "ga4",
];
const manifest = {
  schemaVersion: 3,
  releaseName: "backend-migration-implementation-2026-08",
  baseHead: "ff6854e001ef61b8745c8f2db61f44618464f6c8",
  generatedAtPolicy: "deterministic-no-timestamp",
  contractPosition: {
    targetContract: "contracts/openapi-1.0.json",
    targetOperations: targetOperations.length,
    exactTargetOperations,
    extraHardeningOperations: extraOperations,
    routeMethodOperationIdParity: exactTargetOperations === targetOperations.length,
    targetReleaseClaimed: false,
    semanticConformanceClaimed: false,
    liveEnvironmentAcceptanceRequired: true,
    statement: "The implementation package preserves the hardened BFF/API/worker architecture, exposes exact method/path/operationId parity for the target contract, and contains adapter implementations for all seven MVP providers. Selected access, billing, data-quality and command-center operations now use migrated semantic policies and canonical records. Remaining compatibility handlers and every live-provider claim remain evidence-gated.",
  },
  operations,
  targetCoverage,
  semanticImplementationCounts: Object.fromEntries(
    [...new Set(operations.map((operation) => operation.implementation))]
      .sort()
      .map((implementation) => [
        implementation,
        operations.filter((operation) => operation.implementation === implementation).length,
      ]),
  ),
  migration: {
    donorRepository: "papadata-main",
    strategy: "selective-port-no-full-merge",
    preservedStrengths: [
      "BFF session boundary",
      "durable worker with leases/checkpoints/reconciliation",
      "tenant-aware repositories and RLS foundation",
      "signed internal principal and capability guards",
      "supply-chain and release evidence",
    ],
    adaptedNow: [
      "explicit Nest dependency injection",
      "canonical provider record v2 for seven adapters",
      "access precedence policy",
      "billing status, entitlement, VAT and KSeF readiness policies",
      "data-quality source-priority and readiness semantics",
      "command-center canonical summary",
    ],
    fullLegacyFeatureParityClaimed: false,
  },
  featureBoundaries: {
    providers: {
      enabled: providers,
      targetOnly: [],
      adapterImplementationCount: providers.length,
      liveAcceptanceCount: 0,
      releaseStatus: "implementation-present-live-acceptance-pending",
    },
    webhooks: {
      enabled: ["woocommerce", "shopify", "meta_ads"],
      polling: ["baselinker", "allegro", "google_ads", "ga4"],
      releaseStatus: "enabled_with_provider_specific_delivery",
    },
    reports: {
      enabledFormats: ["json", "csv"],
      blockedFormats: ["pdf", "xlsx"],
      requiresMetricData: true,
    },
    privacy: {
      identityEvidenceRequired: true,
      externalProviderAndBackupErasureVerified: false,
      releaseStatus: "limited",
    },
    ai: {
      deterministicLocalProvider: true,
      externalProviderApproved: false,
      sideEffectsEnabled: false,
    },
    mvpDomains: {
      included: [
        "identity",
        "security",
        "tenancy",
        "onboarding",
        "integrations",
        "dashboard",
        "metrics",
        "campaigns",
        "orders",
        "products",
        "customers",
        "traffic",
        "data-quality",
        "notifications",
        "targets",
        "annotations",
        "search",
        "settings",
        "billing",
        "support",
        "reports",
        "privacy",
        "audit",
        "papa-ai-governed",
      ],
      targetOnly: [
        "mobile-native-client",
        "pdf-xlsx-renderers",
        "external-ai-side-effects",
      ],
    },
  },
};

const outputs = [
  [
    resolve(root, "config/backend-release-scope.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  ],
  [
    resolve(root, "docs/backend-remediation/CAPABILITY-MATRIX.md"),
    renderCapabilityDoc(manifest),
  ],
  [
    resolve(root, "docs/backend-remediation/INTEGRATION-RUNTIME.md"),
    renderIntegrationDoc(manifest),
  ],
];

let mismatch = false;
for (const [path, content] of outputs) {
  if (check) {
    const current = await readFile(path, "utf8").catch(() => "");
    if (current !== content) {
      console.error(`CAPABILITY_DOCS_DRIFT=${relative(root, path)}`);
      mismatch = true;
    }
  } else {
    await writeFile(path, content, "utf8");
  }
}
if (mismatch) process.exitCode = 1;
else {
  console.log(
    `BACKEND_CAPABILITY_DOCS=PASS runtime=${operations.length} target=${targetOperations.length} exact=${exactTargetOperations} providers=${providers.length}`,
  );
}

function collectTargetOperations(document) {
  const result = [];
  for (const [publicPath, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [methodName, operation] of Object.entries(pathItem)) {
      if (!["get", "post", "put", "patch", "delete"].includes(methodName)) continue;
      if (!operation || typeof operation.operationId !== "string") continue;
      result.push({
        operationId: operation.operationId,
        method: methodName.toUpperCase(),
        servicePath: normalizePath(publicPath.replace(/^\/api/u, "")),
      });
    }
  }
  return result.sort((a, b) => a.operationId.localeCompare(b.operationId));
}

function readAuth(decorators) {
  if (decorators.includes("@PublicEndpoint")) return "public";
  if (decorators.includes("@InfrastructureEndpoint")) return "infrastructure";
  if (decorators.includes("@ExternalProviderEndpoint")) return "external_provider";
  if (decorators.includes('@RequireAuthLevel("step_up")')) return "step_up+capability";
  if (decorators.includes('@RequireAuthLevel("mfa")')) return "mfa+capability";
  return "capability";
}

function implementationFor(operationId, controllerFile) {
  if (!controllerFile.includes("contract-runtime/generated/")) {
    return "native-hardened-runtime";
  }
  if (["auth.login", "auth.register.email"].includes(operationId)) {
    return "native-identity-service";
  }
  if (operationId === "access.resolve" || operationId === "auth.access.resolve") {
    return "migrated-access-policy";
  }
  if (operationId.startsWith("billing.")) {
    return "migrated-billing-policy";
  }
  if ([
    "data-quality.source-priority.read",
    "data-quality.readiness.read",
    "data-quality.center.read",
    "data-quality.reconciliation.read",
  ].includes(operationId)) {
    return "migrated-data-quality-policy";
  }
  if (operationId.startsWith("command-center.")) {
    return "canonical-command-center-runtime";
  }
  if ([
    "integrations.catalog.read",
    "integrations.read",
    "integrations.sync-history.read",
    "integrations.sync-run.read",
  ].includes(operationId)) {
    return "native-integration-service";
  }
  if (operationId.startsWith("auth.password.recovery.")
    || operationId.startsWith("auth.oauth.")
    || operationId === "auth.account.link"
    || operationId === "auth.email.resend"
    || operationId === "invitation.validate"
    || operationId === "invitation.accept") {
    return "explicit-limited-handler";
  }
  return "contract-compatibility-runtime";
}

function readReleaseStatus(operationId, controllerFile) {
  if (operationId.startsWith("privacy.")) return "limited";
  if (["papa.ai.action.execute", "papa.ai.action.rollback"].includes(operationId)) {
    return "blocked-until-live-approval";
  }
  return controllerFile.includes("contract-runtime/generated/")
    ? "compatibility"
    : "enabled";
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...await collectFiles(path));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}

function normalizePath(value) {
  return value.replace(/\/+/gu, "/").replace(/\/$/u, "") || "/";
}

function renderCapabilityDoc(value) {
  const rows = value.operations.map((operation) =>
    `| ${operation.operationId} | ${operation.method} | \`${operation.servicePath}\` | ${operation.auth} | ${operation.implementation} | ${operation.releaseStatus} |`,
  ).join("\n");
  return `# Macierz możliwości backendu\n\n> Plik generowany przez \`tools/generate-backend-capability-docs.mjs\`. Nie edytować ręcznie.\n\n**Wydanie:** ${value.releaseName}<br>\n**Operacje runtime:** ${value.operations.length}<br>\n**Kontrakt docelowy:** ${value.contractPosition.exactTargetOperations}/${value.contractPosition.targetOperations} dokładnych metod, ścieżek i operationId<br>\n**Dodatkowe operacje hardeningowe:** ${value.contractPosition.extraHardeningOperations}<br>\n**Integracje runtime:** 7/7<br>\n**Pełna zgodność semantyczna i odbiór live:** jeszcze nie zadeklarowane\n\n| OperationId | Metoda | Ścieżka | Autoryzacja | Implementacja | Status |\n|---|---|---|---|---|---|\n${rows}\n`;
}

function renderIntegrationDoc(value) {
  const rows = value.featureBoundaries.providers.enabled.map((provider) => {
    const delivery = value.featureBoundaries.webhooks.enabled.includes(provider)
      ? "podpisany webhook + replay protection"
      : "incremental polling/checkpoint";
    return `| ${provider} | implementation present; live acceptance pending | ${delivery} | durable ingestion + canonical v2 |`;
  }).join("\n");
  return `# Runtime integracji 7/7\n\n> Plik generowany automatycznie z manifestu i kodu. Nie edytować ręcznie.\n\n| Provider | Adapter | Dostarczanie zmian | Pipeline |\n|---|---|---|---|\n${rows}\n\nWebhooki są aktywne tylko dla providerów posiadających zweryfikowany model podpisanego callbacku. Pozostałe integracje korzystają z checkpointowanego pollingu i są pełnoprawnymi adapterami runtime. Pełne uznanie produkcyjne wymaga testów live z rzeczywistymi kontami providerów.\n`;
}
