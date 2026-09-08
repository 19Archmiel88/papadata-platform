// Regenerates config/backend-release-scope.json from the current API
// controllers and contracts/openapi-1.0.json. Run this whenever
// `pnpm verify:backend-release` fails with "contractPosition is stale" after
// adding/removing/renaming an operationId -- it's a snapshot of runtime
// reality, not something to hand-edit.
//
//   node tools/regenerate-backend-release-scope.mjs
import {
  buildBackendManifest,
  collectRuntimeOperations,
  collectTargetOperations,
  readJson,
  writeJson,
} from "./backend-gate-common.mjs";

const manifest = await readJson("config/backend-release-scope.json");
const openApi = await readJson("contracts/openapi-1.0.json");
const runtimeOperations = await collectRuntimeOperations();
const targetOperations = collectTargetOperations(openApi);

const nextManifest = buildBackendManifest(runtimeOperations, targetOperations, manifest);
await writeJson("config/backend-release-scope.json", nextManifest);

console.log(
  `Regenerated config/backend-release-scope.json: ${runtimeOperations.length} runtime operations, ${targetOperations.length} target operations.`,
);
