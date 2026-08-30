import { readdir } from "node:fs/promises";
import { relative, resolve } from "node:path";
import {
  buildBackendManifest,
  collectRuntimeOperations,
  collectTargetOperations,
  ensureEvidenceDir,
  evidenceDir,
  gitHead,
  pathExists,
  readJson,
  root,
  runCommand,
  sha256,
  writeJson,
} from "./backend-gate-common.mjs";

await ensureEvidenceDir();

const manifest = await readJson("config/backend-release-scope.json");
const controlMatrix = await readJson("config/backend-security-controls.json");
const openApi = await readJson("contracts/openapi-1.0.json");
const runtimeOperations = await collectRuntimeOperations();
const targetOperations = collectTargetOperations(openApi);
const generatedManifest = buildBackendManifest(
  runtimeOperations,
  targetOperations,
  manifest,
);

let validation = null;
if (pathExists("artifacts/backend-evidence/validation-results.json")) {
  validation = await readJson("artifacts/backend-evidence/validation-results.json");
} else {
  validation = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    gitHead: gitHead(),
    status: "static-only",
    steps: [
      {
        id: "contracts-api",
        covers: ["contracts/API", "release scope", "BFF route map"],
        ...runCommand("pnpm", ["verify:backend-release"]),
      },
      {
        id: "security-controls",
        covers: ["security", "release evidence controls"],
        ...runCommand("pnpm", ["verify:backend-security"]),
      },
      {
        id: "backend-tests",
        covers: ["auth/RBAC", "PostgreSQL/RLS", "Redis/queues", "storage", "integrations"],
        ...runCommand("pnpm", ["test:backend"]),
      },
    ],
  };
  validation.status = validation.steps.every((step) => step.status === "pass")
    ? "pass"
    : "fail";
  await writeJson("artifacts/backend-evidence/validation-results.json", validation);
}

const acceptancePending = controlMatrix.controls
  .filter((item) => !["implemented", "release_scope_control", "excluded_storybook_context"].includes(item.status))
  .map((item) => item.findingId);

const evidence = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  gitHead: gitHead(),
  releaseName: manifest.releaseName,
  targetReleaseClaimed: manifest.contractPosition.targetReleaseClaimed,
  validationStatus: validation.status,
  checkSummary: Object.fromEntries(
    validation.steps.map((step) => [step.id, step.status]),
  ),
  operationCount: generatedManifest.operations.length,
  targetOperationCount: generatedManifest.contractPosition.targetOperations,
  exactTargetOperations: generatedManifest.contractPosition.exactTargetOperations,
  extraHardeningOperations: generatedManifest.contractPosition.extraHardeningOperations,
  controlCount: controlMatrix.controls.length,
  acceptancePending,
  hashes: {
    backendReleaseScope: await sha256("config/backend-release-scope.json"),
    backendSecurityControls: await sha256("config/backend-security-controls.json"),
    openApi: await sha256("contracts/openapi-1.0.json"),
    validationResults: await sha256("artifacts/backend-evidence/validation-results.json"),
  },
};

await writeJson("artifacts/backend-evidence/backend-evidence.json", evidence);
await writeJson("artifacts/backend-evidence/route-map.json", generatedManifest.operations);
await writeJson("artifacts/backend-evidence/security-control-snapshot.json", controlMatrix);

const files = (await readdir(evidenceDir)).sort();
const sums = [];
for (const name of files) {
  if (name === "SHA256SUMS") continue;
  sums.push(`${await sha256(resolve(evidenceDir, name))}  ${relative(evidenceDir, resolve(evidenceDir, name))}`);
}
await import("node:fs/promises").then(({ writeFile }) =>
  writeFile(resolve(evidenceDir, "SHA256SUMS"), `${sums.join("\n")}\n`),
);

console.log(`BACKEND_EVIDENCE=${validation.status === "fail" ? "FAIL" : "PASS"} path=${relative(root, evidenceDir)}`);
if (validation.status === "fail") process.exitCode = 1;
