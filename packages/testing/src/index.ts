import type {
  TenantId,
  TenantWorkspaceScope,
  WorkspaceId,
} from "@papadata/contracts";

export const createTenantWorkspaceScopeFixture = (
  tenantId: string,
  workspaceId: string,
): TenantWorkspaceScope => ({
  tenantId: tenantId as TenantId,
  workspaceId: workspaceId as WorkspaceId,
});

export const tenantIsolationFixture = {
  own: createTenantWorkspaceScopeFixture("tenant_test_own", "workspace_test_own"),
  foreignTenant: createTenantWorkspaceScopeFixture(
    "tenant_test_foreign",
    "workspace_test_own",
  ),
  foreignWorkspace: createTenantWorkspaceScopeFixture(
    "tenant_test_own",
    "workspace_test_foreign",
  ),
} as const;
