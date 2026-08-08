import {
  capabilityCatalog,
  type CanonicalCapability,
} from "./capability-catalog.js";

export const authorizationRoles = [
  "Tenant Owner",
  "Workspace Admin",
  "Analyst",
  "Marketing Operator",
  "Viewer",
  "Billing Admin",
  "Auditor/Security",
  "Internal Support/Operations",
] as const;

export type AuthorizationRole = (typeof authorizationRoles)[number];

export const membershipStatuses = [
  "active",
  "blocked",
  "invited",
  "revoked",
] as const;

export type MembershipStatus = (typeof membershipStatuses)[number];

export const membershipDataScopes = [
  "tenant",
  "workspace",
  "assigned_workspace",
  "billing",
  "audit",
  "support_jit",
  "none",
] as const;

export type MembershipDataScope = (typeof membershipDataScopes)[number];

export type MembershipAuthorizationInput = {
  readonly dataScope: string;
  readonly jitExpiresAt: string | null;
  readonly role: string;
  readonly status: string;
};

const capabilityByScope = (
  predicate: (descriptor: (typeof capabilityCatalog)[number]) => boolean,
): readonly CanonicalCapability[] => capabilityCatalog
  .filter(predicate)
  .map((descriptor) => descriptor.capability);

export const platformOnlyCapabilities = capabilityByScope(
  (descriptor) => descriptor.dataScope === "platform",
);

const platformOnlyCapabilitySet = new Set<string>(platformOnlyCapabilities);

export const tenantOwnerBootstrapCapabilities = capabilityByScope(
  (descriptor) => descriptor.dataScope !== "platform",
);

const workspaceOperatorCapabilities = [
  "workspace.read",
  "workspace.manage",
  "analytics.metrics.read",
  "analytics.metrics.compare",
  "analytics.metrics.export",
  "analytics.command_center.read",
  "integrations.catalog.read",
  "integrations.connection.read",
  "integrations.connection.manage",
  "integrations.credentials.manage",
  "integrations.sync.run",
  "integrations.jobs.read",
  "integrations.jobs.manage",
  "reports.create",
  "reports.read",
  "reports.download",
  "ai.assistant.run",
  "ai.action_proposal.create",
  "ai.action_proposal.approve",
  "ai.governance.read",
  "ai.history.read",
  "privacy.tenant_policy.read",
] as const satisfies readonly CanonicalCapability[];

const analystCapabilities = [
  "workspace.read",
  "analytics.metrics.read",
  "analytics.metrics.compare",
  "analytics.metrics.export",
  "analytics.command_center.read",
  "integrations.catalog.read",
  "integrations.connection.read",
  "integrations.jobs.read",
  "reports.create",
  "reports.read",
  "reports.download",
  "ai.assistant.run",
  "ai.history.read",
] as const satisfies readonly CanonicalCapability[];

const marketingOperatorCapabilities = [
  "workspace.read",
  "analytics.metrics.read",
  "analytics.metrics.compare",
  "analytics.metrics.export",
  "analytics.command_center.read",
  "integrations.catalog.read",
  "integrations.connection.read",
  "integrations.sync.run",
  "integrations.jobs.read",
  "integrations.jobs.manage",
  "reports.create",
  "reports.read",
  "reports.download",
  "ai.assistant.run",
  "ai.action_proposal.create",
  "ai.history.read",
] as const satisfies readonly CanonicalCapability[];

const viewerCapabilities = [
  "workspace.read",
  "analytics.metrics.read",
  "analytics.command_center.read",
  "integrations.catalog.read",
  "integrations.connection.read",
  "integrations.jobs.read",
  "reports.read",
  "ai.history.read",
] as const satisfies readonly CanonicalCapability[];

const billingAdminCapabilities = [
  "workspace.read",
  "tenant.membership.read",
  "billing.read",
  "billing.manage",
] as const satisfies readonly CanonicalCapability[];

const auditorSecurityCapabilities = [
  "workspace.read",
  "tenant.membership.read",
  "audit.read",
  "privacy.audit.read",
  "ai.governance.read",
] as const satisfies readonly CanonicalCapability[];

const supportJitCapabilities = [
  "workspace.read",
  "tenant.membership.read",
  "analytics.metrics.read",
  "analytics.command_center.read",
  "integrations.connection.read",
  "integrations.jobs.read",
  "ai.governance.read",
  "privacy.audit.read",
  "audit.read",
  "audit.verify",
  "support.jit.use",
] as const satisfies readonly CanonicalCapability[];

const roleCapabilities: Readonly<Record<AuthorizationRole, readonly CanonicalCapability[]>> = {
  "Analyst": analystCapabilities,
  "Auditor/Security": auditorSecurityCapabilities,
  "Billing Admin": billingAdminCapabilities,
  "Internal Support/Operations": supportJitCapabilities,
  "Marketing Operator": marketingOperatorCapabilities,
  "Tenant Owner": tenantOwnerBootstrapCapabilities,
  "Viewer": viewerCapabilities,
  "Workspace Admin": workspaceOperatorCapabilities,
};

export function isAuthorizationRole(value: string): value is AuthorizationRole {
  return (authorizationRoles as readonly string[]).includes(value);
}

export function isMembershipStatus(value: string): value is MembershipStatus {
  return (membershipStatuses as readonly string[]).includes(value);
}

export function isMembershipDataScope(value: string): value is MembershipDataScope {
  return (membershipDataScopes as readonly string[]).includes(value);
}

export function isPlatformOnlyCapability(
  capability: CanonicalCapability,
): boolean {
  return platformOnlyCapabilitySet.has(capability);
}

export function resolveMembershipCapabilities(
  membership: MembershipAuthorizationInput,
  now: Date = new Date(),
): readonly CanonicalCapability[] {
  if (membership.status !== "active" || !isAuthorizationRole(membership.role)) {
    return [];
  }

  if (membership.role === "Internal Support/Operations") {
    return membership.dataScope === "support_jit"
      && isFutureIsoDate(membership.jitExpiresAt, now)
      ? roleCapabilities[membership.role]
      : [];
  }

  if (membership.role === "Tenant Owner") {
    return membership.dataScope === "tenant"
      ? roleCapabilities[membership.role]
      : [];
  }

  if (membership.role === "Billing Admin") {
    return membership.dataScope === "billing" || membership.dataScope === "tenant"
      ? roleCapabilities[membership.role]
      : [];
  }

  if (membership.role === "Auditor/Security") {
    return membership.dataScope === "audit" || membership.dataScope === "tenant"
      ? roleCapabilities[membership.role]
      : [];
  }

  return membership.dataScope === "workspace"
    || membership.dataScope === "assigned_workspace"
    ? roleCapabilities[membership.role]
    : [];
}

function isFutureIsoDate(value: string | null, now: Date): boolean {
  if (!value) {
    return false;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp > now.getTime();
}
