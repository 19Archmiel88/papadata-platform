import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const productionSource = readFileSync(
  new URL("./production.ts", import.meta.url),
  "utf8",
);

const productDomainSource = readFileSync(
  new URL("./product-domain.ts", import.meta.url),
  "utf8",
);

test("identity tenant bootstrap uses one transaction with identity and tenant scopes", () => {
  const boundaryStart = productionSource.indexOf(
    "async withIdentityTenantWorkspace<T>(",
  );
  const readonlyStart = productionSource.indexOf(
    "async queryGlobalReadonly<T",
    boundaryStart,
  );

  assert.notEqual(
    boundaryStart,
    -1,
    "ProductionDatabase must expose withIdentityTenantWorkspace().",
  );
  assert.notEqual(
    readonlyStart,
    -1,
    "Unable to determine withIdentityTenantWorkspace() boundary.",
  );

  const boundary = productionSource.slice(boundaryStart, readonlyStart);

  assert.match(
    boundary,
    /return withTransaction\(this\.pool, async \(client\) => \{/u,
  );
  assert.match(
    boundary,
    /await setIdentityScope\(client, identityKey, userId\);/u,
  );
  assert.match(
    boundary,
    /await setTenantWorkspaceScope\(client, tenantId, workspaceId\);/u,
  );

  assert.ok(
    boundary.indexOf("setIdentityScope") < boundary.indexOf("setTenantWorkspaceScope"),
    "Identity scope must be established before tenant/workspace scope.",
  );
});

test("registration establishes tenant and workspace scope before tenant bootstrap writes", () => {
  const registerStart = productDomainSource.indexOf("async register(input:");
  const listMembershipsStart = productDomainSource.indexOf(
    "async listMemberships(",
    registerStart,
  );

  assert.notEqual(registerStart, -1, "IdentityRepository.register() not found.");
  assert.notEqual(
    listMembershipsStart,
    -1,
    "Unable to determine IdentityRepository.register() boundary.",
  );

  const registerSource = productDomainSource.slice(
    registerStart,
    listMembershipsStart,
  );

  assert.match(registerSource, /const tenantId = randomUUID\(\);/u);
  assert.match(registerSource, /const workspaceId = randomUUID\(\);/u);
  assert.match(
    registerSource,
    /withIdentityTenantWorkspace\(\s*identityKey,\s*null,\s*tenantId,\s*workspaceId,/u,
  );
  assert.doesNotMatch(
    registerSource,
    /withIdentity\(identityKey, null,/u,
  );

  const scopedBoundaryIndex = registerSource.indexOf(
    "withIdentityTenantWorkspace",
  );
  const tenantInsertIndex = registerSource.indexOf(
    "insert into app.tenants",
  );
  const workspaceInsertIndex = registerSource.indexOf(
    "insert into app.workspaces",
  );
  const membershipInsertIndex = registerSource.indexOf(
    "insert into app.memberships",
  );

  assert.ok(scopedBoundaryIndex >= 0);
  assert.ok(tenantInsertIndex > scopedBoundaryIndex);
  assert.ok(workspaceInsertIndex > tenantInsertIndex);
  assert.ok(membershipInsertIndex > workspaceInsertIndex);

  assert.match(
    registerSource,
    /await setIdentityUser\(client, user\.userId\);/u,
  );
});
