import {
  buildBackendManifest,
  collectRuntimeOperations,
  collectTargetOperations,
  readJson,
  readText,
} from "./backend-gate-common.mjs";

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const manifest = await readJson("config/backend-release-scope.json");
const openApi = await readJson("contracts/openapi-1.0.json");
const packageJson = await readJson("package.json");
const runtimeOperations = await collectRuntimeOperations();
const targetOperations = collectTargetOperations(openApi);
const expectedManifest = buildBackendManifest(
  runtimeOperations,
  targetOperations,
  manifest,
);

assert(manifest.schemaVersion === 3, "Unsupported backend release scope schemaVersion.");
assert(Array.isArray(manifest.operations), "Release scope operations are missing.");
assert(Array.isArray(manifest.targetCoverage), "Target coverage matrix is missing.");

const runtimeIds = runtimeOperations.map((item) => item.operationId);
const manifestIds = manifest.operations.map((item) => item.operationId);
assert(new Set(runtimeIds).size === runtimeIds.length, "Duplicate operationId in runtime controllers.");
assert(new Set(manifestIds).size === manifestIds.length, "Duplicate operationId in release scope.");
assert(
  JSON.stringify([...runtimeIds].sort()) === JSON.stringify([...manifestIds].sort()),
  "Runtime operationId set differs from config/backend-release-scope.json.",
);

for (const target of targetOperations) {
  const runtime = runtimeOperations.find(
    (item) => item.method === target.method && item.servicePath === target.servicePath,
  );
  assert(Boolean(runtime), `Target route is missing: ${target.method} ${target.servicePath}.`);
  assert(
    runtime?.operationId === target.operationId,
    `Target operation mismatch for ${target.method} ${target.servicePath}: expected ${target.operationId}, received ${runtime?.operationId ?? "missing"}.`,
  );
}

assert(
  manifest.contractPosition.targetOperations === targetOperations.length,
  `Manifest targetOperations must be ${targetOperations.length}.`,
);
assert(
  manifest.contractPosition.exactTargetOperations === targetOperations.length,
  `Manifest exactTargetOperations must be ${targetOperations.length}.`,
);
assert(
  manifest.contractPosition.extraHardeningOperations
    === runtimeOperations.length - targetOperations.length,
  `Manifest extraHardeningOperations must be ${runtimeOperations.length - targetOperations.length}.`,
);
assert(
  manifest.contractPosition.routeMethodOperationIdParity === true,
  "Manifest must report exact route, method and operationId parity.",
);
assert(
  manifest.contractPosition.targetReleaseClaimed === false,
  "Repository evidence must not claim live production acceptance.",
);
assert(
  manifest.contractPosition.semanticConformanceClaimed === false,
  "Compatibility routes must not be described as complete semantic conformance.",
);

const expectedProviders = [
  "allegro",
  "baselinker",
  "ga4",
  "google_ads",
  "meta_ads",
  "shopify",
  "woocommerce",
];
assert(
  JSON.stringify([...(manifest.featureBoundaries?.providers?.enabled ?? [])].sort())
    === JSON.stringify(expectedProviders),
  "Provider runtime must cover all seven MVP providers.",
);
assert(
  (manifest.featureBoundaries?.providers?.targetOnly ?? []).length === 0,
  "No MVP provider may remain target-only.",
);

assert(
  packageJson.scripts["verify:backend"] === "node tools/verify-backend-gate.mjs",
  "verify:backend must point at the canonical backend gate.",
);
assert(
  packageJson.scripts["evidence:backend"] === "node tools/generate-backend-evidence.mjs",
  "evidence:backend must point at the canonical backend evidence generator.",
);
assert(packageJson.scripts["test:migrations"], "Migration test command is not wired.");
assert(packageJson.scripts["verify:licenses"], "License policy command is not wired.");

for (const operation of manifest.operations) {
  assert(["GET", "POST", "PUT", "PATCH", "DELETE"].includes(operation.method), `Invalid method for ${operation.operationId}.`);
  assert(operation.servicePath.startsWith("/"), `Invalid service path for ${operation.operationId}.`);
  assert(operation.bffPath === `/api${operation.servicePath}`, `BFF path mismatch for ${operation.operationId}.`);
  assert(typeof operation.controllerFile === "string" && operation.controllerFile.endsWith(".ts"), `Controller file missing for ${operation.operationId}.`);
}

assert(
  JSON.stringify(manifest.contractPosition) === JSON.stringify(expectedManifest.contractPosition),
  "Release scope contractPosition is stale. Update config/backend-release-scope.json from the current API controllers and OpenAPI contract.",
);

const ci = await readText(".github/workflows/ci.yml");
assert(ci.includes("pnpm verify:backend"), "Backend CI does not run pnpm verify:backend.");
assert(ci.includes("pnpm evidence:backend"), "Backend CI does not generate backend evidence.");
assert(ci.includes("artifacts/backend-evidence"), "Backend CI does not upload backend evidence.");

if (failures.length > 0) {
  console.error("BACKEND_RELEASE_SCOPE=FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `BACKEND_RELEASE_SCOPE=PASS operations=${manifest.operations.length} target=${targetOperations.length} extra=${runtimeOperations.length - targetOperations.length} providers=7 release=${manifest.releaseName}`,
  );
}
