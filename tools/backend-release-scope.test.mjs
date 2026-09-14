import assert from "node:assert/strict";
import test from "node:test";

import {
  buildBackendManifest,
  collectRuntimeOperations,
  collectTargetOperations,
  readJson,
} from "./backend-gate-common.mjs";

test("backend release scope matches runtime controllers and target contract", async () => {
  const manifest = await readJson("config/backend-release-scope.json");
  const openApi = await readJson("contracts/openapi-1.0.json");
  const runtimeOperations = await collectRuntimeOperations();
  const targetOperations = collectTargetOperations(openApi);
  const expectedManifest = buildBackendManifest(
    runtimeOperations,
    targetOperations,
    manifest,
  );

  assert.deepEqual(manifest.operations, expectedManifest.operations);
  assert.deepEqual(manifest.targetCoverage, expectedManifest.targetCoverage);
  assert.deepEqual(manifest.contractPosition, expectedManifest.contractPosition);
});

test("public legal and cookie endpoints are tracked as runtime hardening operations", async () => {
  const manifest = await readJson("config/backend-release-scope.json");
  const openApi = await readJson("contracts/openapi-1.0.json");
  const targetOperations = collectTargetOperations(openApi);
  const targetIds = new Set(targetOperations.map((operation) => operation.operationId));
  const operations = new Map(
    manifest.operations.map((operation) => [operation.operationId, operation]),
  );

  const expectedRuntimeOnlyOperations = [
    {
      auth: "public",
      controllerFile: "apps/api/src/production/cookie-consent/cookie-consent.controller.ts",
      method: "GET",
      operationId: "consent.cookies.read",
      servicePath: "/v1/consent/cookies",
    },
    {
      auth: "public",
      controllerFile: "apps/api/src/production/cookie-consent/cookie-consent.controller.ts",
      method: "PUT",
      operationId: "consent.cookies.write",
      servicePath: "/v1/consent/cookies",
    },
    {
      auth: "public",
      controllerFile: "apps/api/src/production/legal-documents/legal-documents.controller.ts",
      method: "GET",
      operationId: "legal.documents.read",
      servicePath: "/v1/legal/documents/{type}",
    },
  ];

  for (const expected of expectedRuntimeOnlyOperations) {
    const operation = operations.get(expected.operationId);
    assert.equal(targetIds.has(expected.operationId), false);
    assert.deepEqual(
      pick(operation, [
        "auth",
        "controllerFile",
        "method",
        "operationId",
        "servicePath",
      ]),
      expected,
    );
    assert.equal(operation?.implementation, "native-hardened-runtime");
    assert.equal(operation?.releaseStatus, "enabled");
    assert.equal(operation?.bffPath, `/api${expected.servicePath}`);
  }
});

function pick(value, keys) {
  assert.ok(value);
  return Object.fromEntries(keys.map((key) => [key, value[key]]));
}
