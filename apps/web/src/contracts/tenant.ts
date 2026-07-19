import type { TenantId, WorkspaceId } from './ids';

export type { TenantId, WorkspaceId } from './ids';

export type TenantContext = {
  tenantId: TenantId;
  workspaceId: WorkspaceId;
};
