import type { OrganizationId, WorkspaceId } from './ids';

export type { OrganizationId, WorkspaceId } from './ids';

export type TenantContext = {
  organizationId: OrganizationId;
  workspaceId: WorkspaceId;
};
