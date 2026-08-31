export const canonicalCapabilities = [
  "auth.session.read", "auth.session.revoke", "auth.mfa.enroll", "auth.mfa.manage", "auth.step_up.issue",
  "tenant.membership.read", "tenant.membership.manage", "workspace.read", "workspace.manage",
  "analytics.metrics.read", "analytics.metrics.compare", "analytics.metrics.export", "analytics.command_center.read",
  "integrations.catalog.read", "integrations.connection.read", "integrations.connection.manage", "integrations.credentials.manage", "integrations.sync.run", "integrations.jobs.read", "integrations.jobs.manage",
  "reports.create", "reports.read", "reports.download",
  "ai.assistant.run", "ai.action_proposal.create", "ai.action_proposal.approve", "ai.action_proposal.execute", "ai.governance.read", "ai.history.read",
  "privacy.own_consent.manage", "privacy.tenant_policy.read", "privacy.tenant_policy.manage", "privacy.dsar.manage", "privacy.deletion.approve", "privacy.audit.read",
  "support.jit.request", "support.jit.approve", "support.jit.use", "audit.read", "audit.verify", "billing.read", "billing.manage",
] as const;
export type CanonicalCapability = (typeof canonicalCapabilities)[number];
export type CapabilityDescriptor = {
  readonly capability: CanonicalCapability;
  readonly dataScope: "self" | "workspace" | "tenant" | "platform";
  readonly riskClass: "low" | "medium" | "high" | "critical";
  readonly mfaRequired: boolean;
  readonly reauthenticationRequired: boolean;
  readonly approvalRequired: boolean;
  readonly entitlement: string | null;
  readonly operations: readonly string[];
};
const descriptor=(capability:CanonicalCapability,dataScope:CapabilityDescriptor["dataScope"],riskClass:CapabilityDescriptor["riskClass"],operations:readonly string[],options:Partial<Pick<CapabilityDescriptor,"mfaRequired"|"reauthenticationRequired"|"approvalRequired"|"entitlement">>={}):CapabilityDescriptor=>({
  capability,dataScope,riskClass,operations,
  mfaRequired:options.mfaRequired??riskClass==="critical",
  reauthenticationRequired:options.reauthenticationRequired??riskClass==="critical",
  approvalRequired:options.approvalRequired??false,
  entitlement:options.entitlement??null,
});
export const capabilityCatalog:readonly CapabilityDescriptor[]=[
  descriptor("auth.session.read","self","low",["GET /v1/auth/sessions"]),
  descriptor("auth.session.revoke","self","high",["DELETE /v1/auth/sessions/:id"],{reauthenticationRequired:true}),
  descriptor("auth.mfa.enroll","self","high",["POST /v1/security/mfa/enroll","POST /v1/security/mfa/confirm","POST /v1/security/mfa/verify","POST /v1/security/mfa/recovery-code/redeem"]),
  descriptor("auth.mfa.manage","self","critical",["DELETE /v1/security/mfa"]),
  descriptor("auth.step_up.issue","self","high",["POST /v1/security/step-up"]),
  descriptor("tenant.membership.read","tenant","medium",["GET /v1/memberships"]),
  descriptor("tenant.membership.manage","tenant","critical",["POST /v1/invitations","POST /v1/security/invitations/token","DELETE /v1/memberships/:id"],{approvalRequired:true}),
  descriptor("workspace.read","workspace","low",["GET /v1/workspaces/:id"]),
  descriptor("workspace.manage","workspace","high",["PATCH /v1/workspaces/:id"]),
  descriptor("analytics.metrics.read","workspace","low",["GET /v1/metrics"]),
  descriptor("analytics.metrics.compare","workspace","medium",["POST /v1/metrics/compare"]),
  descriptor("analytics.metrics.export","workspace","high",[],{reauthenticationRequired:true}),
  descriptor("analytics.command_center.read","workspace","low",["GET /v1/dashboard/command-center"]),
  descriptor("integrations.catalog.read","workspace","low",["GET /v1/integrations/providers"]),
  descriptor("integrations.connection.read","workspace","medium",["GET /v1/integrations/connections"]),
  descriptor("integrations.connection.manage","workspace","high",["POST /v1/integrations/connections","DELETE /v1/integrations/connections/:id"],{reauthenticationRequired:true}),
  descriptor("integrations.credentials.manage","workspace","critical",["POST /v1/integrations/connections/:id/reauthorize"],{approvalRequired:true}),
  descriptor("integrations.sync.run","workspace","high",["POST /v1/integrations/connections/:id/sync","POST /v1/integrations/connections/:id/backfill"]),
  descriptor("integrations.jobs.read","workspace","low",["GET /v1/integrations/jobs","GET /v1/integrations/jobs/:id"]),
  descriptor("integrations.jobs.manage","workspace","high",["POST /v1/integrations/jobs/:id/retry","POST /v1/integrations/jobs/:id/cancel"]),
  descriptor("reports.create","workspace","medium",["POST /v1/reports"]),
  descriptor("reports.read","workspace","low",["GET /v1/reports/:id"]),
  descriptor("reports.download","workspace","high",["GET /v1/reports/:id/download"],{reauthenticationRequired:true}),
  descriptor("ai.assistant.run","workspace","medium",["POST /v1/ai/runs"],{entitlement:"ai_assistant"}),
  descriptor("ai.action_proposal.create","workspace","high",["POST /v1/ai/actions"]),
  descriptor("ai.action_proposal.approve","workspace","critical",["POST /v1/ai/actions/:id/approve"],{approvalRequired:true}),
  descriptor("ai.action_proposal.execute","workspace","critical",["POST /v1/ai/actions/:id/execute"],{approvalRequired:true}),
  descriptor("ai.governance.read","tenant","high",["GET /v1/ai/governance"]),
  descriptor("ai.history.read","workspace","medium",["GET /v1/ai/history"]),
  descriptor("privacy.own_consent.manage","self","low",["PUT /v1/privacy/consent"]),
  descriptor("privacy.tenant_policy.read","tenant","medium",["GET /v1/privacy/policies"]),
  descriptor("privacy.tenant_policy.manage","tenant","critical",["PUT /v1/privacy/policies"]),
  descriptor("privacy.dsar.manage","tenant","critical",["POST /v1/privacy/requests"],{approvalRequired:true}),
  descriptor("privacy.deletion.approve","tenant","critical",["POST /v1/privacy/deletions/:id/approve","POST /v1/privacy/requests/:id/approve"],{approvalRequired:true}),
  descriptor("privacy.audit.read","tenant","high",["GET /v1/privacy/audit"]),
  descriptor("support.jit.request","platform","high",["POST /v1/security/jit-grants"]),
  descriptor("support.jit.approve","platform","critical",["POST /v1/security/jit-grants/:id/approve"],{approvalRequired:true}),
  descriptor("support.jit.use","platform","critical",["POST /v1/security/jit-grants/:id/activate"],{approvalRequired:true}),
  descriptor("audit.read","tenant","critical",["GET /v1/audit/events"]),
  descriptor("audit.verify","platform","critical",["POST /v1/audit/verify"]),
  descriptor("billing.read","tenant","medium",["GET /v1/billing/subscription"]),
  descriptor("billing.manage","tenant","critical",["POST /v1/billing/subscription/change-plan"],{approvalRequired:true}),
];
export const legacyCapabilityAliases:Readonly<Record<string,CanonicalCapability>>={
  "analytics.read":"analytics.metrics.read","assistant.use":"ai.assistant.run","assistant.approve":"ai.action_proposal.approve","export.detail":"analytics.metrics.export","report.create":"reports.create","report.read":"reports.read","support.operations":"support.jit.use",
  "ai:assistant:run":"ai.assistant.run","ai:action-proposal:create":"ai.action_proposal.create","ai:action-proposal:approve":"ai.action_proposal.approve","ai:action-proposal:execute":"ai.action_proposal.execute","ai:governance:view":"ai.governance.read","ai:history:view":"ai.history.read",
  "analytics:metrics:view":"analytics.metrics.read","analytics:metrics:compare":"analytics.metrics.compare","analytics:metrics:export":"analytics.metrics.export","analytics:command-center:view":"analytics.command_center.read",
};
export function resolveCanonicalCapability(value:string):CanonicalCapability|null{
  return (canonicalCapabilities as readonly string[]).includes(value)?value as CanonicalCapability:legacyCapabilityAliases[value]??null;
}
