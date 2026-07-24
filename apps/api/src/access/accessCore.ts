import type { IsoDateTime } from "@papadata/contracts";

import {
  addMs,
  normalizeEmail,
  responseMeta,
  safeSession,
  toIso,
} from "../auth/authCore.ts";
import type {
  AuthErrorCode,
  AuthRandomSource,
  AuthService,
  AuthServiceResult,
  AuthenticatedPrincipal,
  RequestContext,
  SafeSession,
} from "../auth/authCore.ts";

export const ACCESS_POLICY_VERSION = "tenant-workspace-policy.v1";

export const roleNames = [
  "Tenant Owner",
  "Workspace Admin",
  "Analyst",
  "Marketing Operator",
  "Viewer",
  "Billing Admin",
  "Auditor/Security",
  "Internal Support/Operations",
] as const;

export type RoleName = (typeof roleNames)[number];

export type TenantStatus = "active" | "blocked" | "pending_verification";

export type WorkspaceStatus = "active" | "blocked" | "archived";

export type MembershipStatus = "active" | "blocked" | "invited" | "revoked";

export type InvitationStatus = "accepted" | "pending" | "revoked";

export type OnboardingStepStatus = "completed" | "not_started";

export type DataScope =
  | "assigned_workspace"
  | "audit"
  | "billing"
  | "none"
  | "support_jit"
  | "tenant"
  | "workspace";

export type Entitlement =
  | "ai_assistant"
  | "analytics"
  | "audit"
  | "billing"
  | "core_access"
  | "exports"
  | "onboarding"
  | "reports"
  | "support_operations"
  | "workspace_management";

export type Capability =
  | "analytics.read"
  | "assistant.approve"
  | "assistant.use"
  | "audit.read"
  | "billing.manage"
  | "billing.read"
  | "export.aggregate"
  | "export.detail"
  | "invitation.accept"
  | "invitation.resend"
  | "invitation.revoke"
  | "legal.acceptance.write"
  | "legal.read"
  | "notification.read"
  | "notification.update"
  | "onboarding.business_profile.update"
  | "onboarding.company.update"
  | "onboarding.complete"
  | "onboarding.data_sources.update"
  | "onboarding.platform.update"
  | "onboarding.read"
  | "privacy.consent.manage"
  | "report.create"
  | "report.read"
  | "support.operations"
  | "tenant.bootstrap"
  | "tenant.read"
  | "tenant.verify"
  | "workspace.create"
  | "workspace.read"
  | "workspace.update";

export type ResourceState = "active" | "blocked" | "deleted" | "pending";

export type TenantRecord = {
  readonly createdAt: IsoDateTime;
  readonly createdByUserId: string;
  readonly entitlements: readonly Entitlement[];
  readonly name: string;
  readonly status: TenantStatus;
  readonly tenantId: string;
  readonly updatedAt: IsoDateTime;
  readonly verificationCode: string;
  readonly verifiedAt: IsoDateTime | null;
};

export type WorkspaceRecord = {
  readonly createdAt: IsoDateTime;
  readonly createdByUserId: string;
  readonly name: string;
  readonly status: WorkspaceStatus;
  readonly tenantId: string;
  readonly updatedAt: IsoDateTime;
  readonly workspaceId: string;
};

export type MembershipRecord = {
  readonly createdAt: IsoDateTime;
  readonly dataScope: DataScope;
  readonly jitExpiresAt: IsoDateTime | null;
  readonly membershipId: string;
  readonly role: RoleName;
  readonly status: MembershipStatus;
  readonly tenantId: string;
  readonly updatedAt: IsoDateTime;
  readonly userId: string;
  readonly workspaceId: string;
};

export type InvitationRecord = {
  readonly acceptedAt: IsoDateTime | null;
  readonly acceptedByUserId: string | null;
  readonly createdAt: IsoDateTime;
  readonly email: string;
  readonly expiresAt: IsoDateTime;
  readonly invitationId: string;
  readonly invitedByUserId: string;
  readonly resendCount: number;
  readonly revokedAt: IsoDateTime | null;
  readonly role: RoleName;
  readonly status: InvitationStatus;
  readonly tenantId: string;
  readonly token: string;
  readonly updatedAt: IsoDateTime;
  readonly workspaceId: string;
};

export type OnboardingStateRecord = {
  readonly completedAt: IsoDateTime | null;
  readonly company: OnboardingStepStatus;
  readonly dataSources: OnboardingStepStatus;
  readonly platform: OnboardingStepStatus;
  readonly businessProfile: OnboardingStepStatus;
  readonly tenantId: string;
  readonly updatedAt: IsoDateTime;
  readonly workspaceId: string;
};

export type CompanyProfileRecord = {
  readonly companyName: string;
  readonly country: string;
  readonly legalName: string;
  readonly tenantId: string;
  readonly taxId: string;
  readonly updatedAt: IsoDateTime;
  readonly website: string;
};

export type BusinessProfileRecord = {
  readonly averageOrderValueBand: string;
  readonly currency: string;
  readonly primaryMarket: string;
  readonly salesModel: string;
  readonly tenantId: string;
  readonly timezone: string;
  readonly updatedAt: IsoDateTime;
  readonly workspaceId: string;
};

export type AccessStateSnapshot = {
  readonly businessProfiles: readonly BusinessProfileRecord[];
  readonly companyProfiles: readonly CompanyProfileRecord[];
  readonly invitations: readonly InvitationRecord[];
  readonly memberships: readonly MembershipRecord[];
  readonly onboardingStates: readonly OnboardingStateRecord[];
  readonly tenants: readonly TenantRecord[];
  readonly workspaces: readonly WorkspaceRecord[];
};

export type AccessStateStore = {
  findBusinessProfile: (
    tenantId: string,
    workspaceId: string,
  ) => MaybePromise<BusinessProfileRecord | undefined>;
  findCompanyProfile: (tenantId: string) => MaybePromise<CompanyProfileRecord | undefined>;
  findInvitation: (invitationId: string) => MaybePromise<InvitationRecord | undefined>;
  findInvitationByToken: (token: string) => MaybePromise<InvitationRecord | undefined>;
  findMembership: (
    userId: string,
    tenantId: string,
    workspaceId: string,
  ) => MaybePromise<MembershipRecord | undefined>;
  findOnboardingState: (
    tenantId: string,
    workspaceId: string,
  ) => MaybePromise<OnboardingStateRecord | undefined>;
  findTenant: (tenantId: string) => MaybePromise<TenantRecord | undefined>;
  findWorkspace: (workspaceId: string) => MaybePromise<WorkspaceRecord | undefined>;
  listMembershipsByUser: (userId: string) => MaybePromise<readonly MembershipRecord[]>;
  listWorkspacesByTenant: (tenantId: string) => MaybePromise<readonly WorkspaceRecord[]>;
  saveBusinessProfile: (profile: BusinessProfileRecord) => MaybePromise<void>;
  saveCompanyProfile: (profile: CompanyProfileRecord) => MaybePromise<void>;
  saveInvitation: (invitation: InvitationRecord) => MaybePromise<void>;
  saveMembership: (membership: MembershipRecord) => MaybePromise<void>;
  saveOnboardingState: (state: OnboardingStateRecord) => MaybePromise<void>;
  saveTenant: (tenant: TenantRecord) => MaybePromise<void>;
  saveWorkspace: (workspace: WorkspaceRecord) => MaybePromise<void>;
  snapshot: () => MaybePromise<AccessStateSnapshot>;
};

export type MaybePromise<TValue> = TValue | Promise<TValue>;

export class InMemoryAccessState implements AccessStateStore {
  private readonly businessProfiles = new Map<string, BusinessProfileRecord>();

  private readonly companyProfiles = new Map<string, CompanyProfileRecord>();

  private readonly invitations = new Map<string, InvitationRecord>();

  private readonly memberships = new Map<string, MembershipRecord>();

  private readonly onboardingStates = new Map<string, OnboardingStateRecord>();

  private readonly tenants = new Map<string, TenantRecord>();

  private readonly workspaces = new Map<string, WorkspaceRecord>();

  findTenant(tenantId: string): TenantRecord | undefined {
    return this.tenants.get(tenantId);
  }

  saveTenant(tenant: TenantRecord): void {
    this.tenants.set(tenant.tenantId, tenant);
  }

  findWorkspace(workspaceId: string): WorkspaceRecord | undefined {
    return this.workspaces.get(workspaceId);
  }

  saveWorkspace(workspace: WorkspaceRecord): void {
    this.workspaces.set(workspace.workspaceId, workspace);
  }

  listWorkspacesByTenant(tenantId: string): readonly WorkspaceRecord[] {
    return [...this.workspaces.values()]
      .filter((workspace) => workspace.tenantId === tenantId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  findMembership(
    userId: string,
    tenantId: string,
    workspaceId: string,
  ): MembershipRecord | undefined {
    return [...this.memberships.values()].find(
      (membership) =>
        membership.userId === userId &&
        membership.tenantId === tenantId &&
        membership.workspaceId === workspaceId,
    );
  }

  saveMembership(membership: MembershipRecord): void {
    this.memberships.set(membership.membershipId, membership);
  }

  listMembershipsByUser(userId: string): readonly MembershipRecord[] {
    return [...this.memberships.values()]
      .filter((membership) => membership.userId === userId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  findInvitation(invitationId: string): InvitationRecord | undefined {
    return this.invitations.get(invitationId);
  }

  findInvitationByToken(token: string): InvitationRecord | undefined {
    return [...this.invitations.values()].find((invitation) => invitation.token === token);
  }

  saveInvitation(invitation: InvitationRecord): void {
    this.invitations.set(invitation.invitationId, invitation);
  }

  findOnboardingState(
    tenantId: string,
    workspaceId: string,
  ): OnboardingStateRecord | undefined {
    return this.onboardingStates.get(scopeKey(tenantId, workspaceId));
  }

  saveOnboardingState(state: OnboardingStateRecord): void {
    this.onboardingStates.set(scopeKey(state.tenantId, state.workspaceId), state);
  }

  findCompanyProfile(tenantId: string): CompanyProfileRecord | undefined {
    return this.companyProfiles.get(tenantId);
  }

  saveCompanyProfile(profile: CompanyProfileRecord): void {
    this.companyProfiles.set(profile.tenantId, profile);
  }

  findBusinessProfile(
    tenantId: string,
    workspaceId: string,
  ): BusinessProfileRecord | undefined {
    return this.businessProfiles.get(scopeKey(tenantId, workspaceId));
  }

  saveBusinessProfile(profile: BusinessProfileRecord): void {
    this.businessProfiles.set(scopeKey(profile.tenantId, profile.workspaceId), profile);
  }

  snapshot(): AccessStateSnapshot {
    return {
      businessProfiles: [...this.businessProfiles.values()],
      companyProfiles: [...this.companyProfiles.values()],
      invitations: [...this.invitations.values()],
      memberships: [...this.memberships.values()],
      onboardingStates: [...this.onboardingStates.values()],
      tenants: [...this.tenants.values()],
      workspaces: [...this.workspaces.values()],
    };
  }
}

export type AccessPolicyDecision = {
  readonly allowed: boolean;
  readonly authStrength: "mfa" | "none" | "password";
  readonly capabilities: readonly Capability[];
  readonly code?: AuthErrorCode;
  readonly dataScope: DataScope;
  readonly entitlements: readonly Entitlement[];
  readonly membership: {
    readonly membershipId: string | null;
    readonly role: RoleName | null;
    readonly status: MembershipStatus | "missing";
  };
  readonly policyVersion: typeof ACCESS_POLICY_VERSION;
  readonly resourceState: ResourceState;
  readonly session: {
    readonly present: boolean;
    readonly status: "active" | "missing" | "revoked";
  };
  readonly tenantStatus: TenantStatus | "missing";
  readonly workspaceStatus: WorkspaceStatus | "missing";
};

export type AuthorizedSelectedContext =
  | {
      readonly decision: AccessPolicyDecision;
      readonly ok: true;
      readonly principal: AuthenticatedPrincipal;
      readonly tenantId: string;
      readonly workspaceId: string;
    }
  | {
      readonly ok: false;
      readonly result: AuthServiceResult<never>;
    };

export type RegisterOrganizationInput = {
  readonly name: string;
};

export type VerifyOrganizationInput = {
  readonly tenantId: string;
  readonly verificationCode: string;
};

export type BootstrapOrganizationInput = {
  readonly tenantId: string;
  readonly workspaceName: string;
};

export type InvitationTokenInput = {
  readonly email?: string;
  readonly invitationToken: string;
};

export type InvitationAcceptInput = {
  readonly invitationToken: string;
};

export type InvitationResendInput = {
  readonly invitationId: string;
};

export type WorkspaceCreateInput = {
  readonly name: string;
  readonly tenantId?: string;
};

export type ContextSelectInput = {
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type OnboardingCompanyInput = {
  readonly companyName: string;
  readonly country: string;
  readonly legalName: string;
  readonly taxId: string;
  readonly tenantId?: string;
  readonly website: string;
  readonly workspaceId?: string;
};

export type OnboardingBusinessProfileInput = {
  readonly averageOrderValueBand: string;
  readonly currency: string;
  readonly primaryMarket: string;
  readonly salesModel: string;
  readonly tenantId?: string;
  readonly timezone: string;
  readonly workspaceId?: string;
};

export type OnboardingPlatformInput = {
  readonly platformName: string;
  readonly tenantId?: string;
  readonly workspaceId?: string;
};

export type OnboardingDataSourcesInput = {
  readonly dataSources: readonly string[];
  readonly tenantId?: string;
  readonly workspaceId?: string;
};

export type SafeTenant = {
  readonly name: string;
  readonly status: TenantStatus;
  readonly tenantId: string;
};

export type SafeWorkspace = {
  readonly name: string;
  readonly status: WorkspaceStatus;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type SafeMembership = {
  readonly dataScope: DataScope;
  readonly membershipId: string;
  readonly role: RoleName;
  readonly status: MembershipStatus;
  readonly tenantId: string;
  readonly userId: string;
  readonly workspaceId: string;
};

export type SafeInvitation = {
  readonly email: string;
  readonly expiresAt: IsoDateTime;
  readonly invitationId: string;
  readonly role: RoleName;
  readonly status: InvitationStatus;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export class AccessService {
  private readonly authService: AuthService;

  private readonly now: () => Date;

  private readonly random: AuthRandomSource;

  private readonly state: AccessStateStore;

  constructor(options: {
    readonly authService: AuthService;
    readonly now?: () => Date;
    readonly random: AuthRandomSource;
    readonly state?: AccessStateStore;
  }) {
    this.authService = options.authService;
    this.now = options.now ?? (() => new Date());
    this.random = options.random;
    this.state = options.state ?? new InMemoryAccessState();
  }

  async getSnapshot(): Promise<AccessStateSnapshot> {
    return this.state.snapshot();
  }

  async authorizeSelectedContext(
    context: RequestContext,
    capability: Capability,
    inputTenantId?: string,
    inputWorkspaceId?: string,
  ): Promise<AuthorizedSelectedContext> {
    const scope = await this.resolveSelectedScope(
      context,
      capability,
      inputTenantId,
      inputWorkspaceId,
    );

    if ("result" in scope) {
      return {
        ok: false,
        result: scope.result,
      };
    }

    return {
      decision: scope.decision,
      ok: true,
      principal: scope.principal,
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
    };
  }

  async registerOrganization(
    input: RegisterOrganizationInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ tenant: SafeTenant; verificationCodePreview: string }>> {
    const principal = await this.requirePrincipal(context);

    if (!principal) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    if (input.name.trim().length < 2) {
      return this.fail("VALIDATION_FAILED", "Organization name is required.", 422, context);
    }

    const tenantId = this.random.uuid();
    const now = toIso(context.now);
    const verificationCode = this.random.token("org", 12);
    const tenant: TenantRecord = {
      createdAt: now,
      createdByUserId: principal.user.userId,
      entitlements: defaultEntitlements,
      name: input.name.trim(),
      status: "pending_verification",
      tenantId,
      updatedAt: now,
      verificationCode,
      verifiedAt: null,
    };
    await this.state.saveTenant(tenant);

    return this.ok(
      {
        tenant: safeTenant(tenant),
        verificationCodePreview: verificationCode,
      },
      201,
      context,
    );
  }

  async verifyOrganization(
    input: VerifyOrganizationInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ tenant: SafeTenant }>> {
    const principal = await this.requirePrincipal(context);

    if (!principal) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const tenant = await this.state.findTenant(input.tenantId);

    if (!tenant || tenant.createdByUserId !== principal.user.userId) {
      return this.fail("NOT_FOUND", "Organization was not found.", 404, context);
    }

    if (tenant.verificationCode !== input.verificationCode) {
      return this.fail("VALIDATION_FAILED", "Organization verification failed.", 422, context);
    }

    const verified = {
      ...tenant,
      status: "active",
      updatedAt: toIso(context.now),
      verifiedAt: toIso(context.now),
    } satisfies TenantRecord;
    await this.state.saveTenant(verified);

    return this.ok({ tenant: safeTenant(verified) }, 200, context);
  }

  async bootstrapOrganization(
    input: BootstrapOrganizationInput,
    context: RequestContext,
  ): Promise<
    AuthServiceResult<{
      membership: SafeMembership;
      session: SafeSession;
      tenant: SafeTenant;
      workspace: SafeWorkspace;
    }>
  > {
    const principal = await this.requirePrincipal(context);

    if (!principal) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const tenant = await this.state.findTenant(input.tenantId);

    if (!tenant || tenant.createdByUserId !== principal.user.userId) {
      return this.fail("NOT_FOUND", "Organization was not found.", 404, context);
    }

    if (tenant.status === "blocked") {
      return this.fail("TENANT_BLOCKED", "Tenant is blocked.", 423, context, true);
    }

    if (tenant.status !== "active") {
      return this.fail("VALIDATION_FAILED", "Organization must be verified before bootstrap.", 422, context);
    }

    const existingWorkspace = (await this.state.listWorkspacesByTenant(tenant.tenantId))[0];
    const workspace = existingWorkspace ?? (await this.createInitialWorkspace(tenant, principal, input, context));
    const existingMembership = await this.state.findMembership(
      principal.user.userId,
      tenant.tenantId,
      workspace.workspaceId,
    );
    const membership = existingMembership ?? (await this.createMembership(
      principal.user.userId,
      tenant.tenantId,
      workspace.workspaceId,
      "Tenant Owner",
      "tenant",
      context,
    ));
    const session = await this.authService.setSessionContext(
      context,
      tenant.tenantId,
      workspace.workspaceId,
    );

    if (!session) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    await this.ensureOnboardingState(tenant.tenantId, workspace.workspaceId, context);

    return this.ok(
      {
        membership: safeMembership(membership),
        session: safeSession(session, context.sessionId),
        tenant: safeTenant(tenant),
        workspace: safeWorkspace(workspace),
      },
      201,
      context,
    );
  }

  async validateInvitation(
    input: InvitationTokenInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ invitation: SafeInvitation }>> {
    const invitation = await this.state.findInvitationByToken(input.invitationToken);

    if (!invitation) {
      return this.fail("NOT_FOUND", "Invitation was not found.", 404, context);
    }

    const invalid = await this.validateInvitationState(invitation, input.email, context);

    if (invalid) {
      return invalid;
    }

    return this.ok({ invitation: safeInvitation(invitation) }, 200, context);
  }

  async acceptInvitation(
    input: InvitationAcceptInput,
    context: RequestContext,
  ): Promise<
    AuthServiceResult<{
      invitation: SafeInvitation;
      membership: SafeMembership;
      session: SafeSession;
    }>
  > {
    const principal = await this.requirePrincipal(context);

    if (!principal) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const invitation = await this.state.findInvitationByToken(input.invitationToken);

    if (!invitation) {
      return this.fail("NOT_FOUND", "Invitation was not found.", 404, context);
    }

    const invalid = await this.validateInvitationState(invitation, principal.user.email, context);

    if (invalid) {
      return invalid;
    }

    const membership = await this.createMembership(
      principal.user.userId,
      invitation.tenantId,
      invitation.workspaceId,
      invitation.role,
      dataScopeForRole(invitation.role),
      context,
    );
    const accepted = {
      ...invitation,
      acceptedAt: toIso(context.now),
      acceptedByUserId: principal.user.userId,
      status: "accepted",
      updatedAt: toIso(context.now),
    } satisfies InvitationRecord;
    await this.state.saveInvitation(accepted);
    const session = await this.authService.setSessionContext(
      context,
      invitation.tenantId,
      invitation.workspaceId,
    );

    if (!session) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    return this.ok(
      {
        invitation: safeInvitation(accepted),
        membership: safeMembership(membership),
        session: safeSession(session, context.sessionId),
      },
      200,
      context,
    );
  }

  async resendInvitation(
    input: InvitationResendInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ invitation: SafeInvitation; tokenPreview: string }>> {
    const principal = await this.requirePrincipal(context);

    if (!principal) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const invitation = await this.state.findInvitation(input.invitationId);

    if (!invitation) {
      return this.fail("NOT_FOUND", "Invitation was not found.", 404, context);
    }

    const decision = await this.evaluateAccess(principal, context, {
      capability: "invitation.resend",
      resourceState: resourceStateFromInvitation(invitation, context),
      tenantId: invitation.tenantId,
      workspaceId: invitation.workspaceId,
    });

    if (!decision.allowed) {
      return this.failFromDecision(decision, context);
    }

    const invalid = await this.validateInvitationState(invitation, invitation.email, context);

    if (invalid) {
      return invalid;
    }

    const resent = {
      ...invitation,
      expiresAt: toIso(addMs(context.now, invitationTtlMs)),
      resendCount: invitation.resendCount + 1,
      updatedAt: toIso(context.now),
    } satisfies InvitationRecord;
    await this.state.saveInvitation(resent);

    return this.ok(
      {
        invitation: safeInvitation(resent),
        tokenPreview: resent.token,
      },
      202,
      context,
    );
  }

  async revokeInvitation(
    invitationId: string,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ invitation: SafeInvitation; revoked: true }>> {
    const principal = await this.requirePrincipal(context);

    if (!principal) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const invitation = await this.state.findInvitation(invitationId);

    if (!invitation) {
      return this.fail("NOT_FOUND", "Invitation was not found.", 404, context);
    }

    const decision = await this.evaluateAccess(principal, context, {
      capability: "invitation.revoke",
      resourceState: resourceStateFromInvitation(invitation, context),
      tenantId: invitation.tenantId,
      workspaceId: invitation.workspaceId,
    });

    if (!decision.allowed) {
      return this.failFromDecision(decision, context);
    }

    const revoked = {
      ...invitation,
      revokedAt: toIso(context.now),
      status: "revoked",
      updatedAt: toIso(context.now),
    } satisfies InvitationRecord;
    await this.state.saveInvitation(revoked);

    return this.ok(
      {
        invitation: safeInvitation(revoked),
        revoked: true,
      },
      200,
      context,
    );
  }

  async listWorkspaces(
    context: RequestContext,
  ): Promise<AuthServiceResult<{ workspaces: CursorPage<SafeWorkspace> }>> {
    const principal = await this.requirePrincipal(context);

    if (!principal) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const memberships = (await this.state.listMembershipsByUser(principal.user.userId)).filter(
      (membership) => membership.status === "active",
    );
    const tenantIds = uniqueStrings(memberships.map((membership) => membership.tenantId));
    const workspaces = (
      await Promise.all(
        tenantIds.map(async (tenantId) => this.state.listWorkspacesByTenant(tenantId)),
      )
    ).flat();
    const allowedWorkspaces = workspaces.filter((workspace) =>
      memberships.some(
        (membership) =>
          membership.tenantId === workspace.tenantId &&
          (membership.workspaceId === workspace.workspaceId || membership.role === "Tenant Owner"),
      ),
    );

    return this.ok(
      {
        workspaces: toCursorPage(allowedWorkspaces.map(safeWorkspace)),
      },
      200,
      context,
    );
  }

  async createWorkspace(
    input: WorkspaceCreateInput,
    context: RequestContext,
  ): Promise<
    AuthServiceResult<{
      membership: SafeMembership;
      policyDecision: AccessPolicyDecision;
      workspace: SafeWorkspace;
    }>
  > {
    const principal = await this.requirePrincipal(context);

    if (!principal) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const tenantId = input.tenantId || principal.session.activeTenantId;

    if (!tenantId || input.name.trim().length < 2) {
      return this.fail("VALIDATION_FAILED", "Workspace payload is invalid.", 422, context);
    }

    const decision = await this.evaluateAccess(principal, context, {
      capability: "workspace.create",
      tenantId,
      workspaceId: principal.session.activeTenantId === tenantId
        ? principal.session.activeWorkspaceId
        : undefined,
    });

    if (!decision.allowed) {
      return this.failFromDecision(decision, context);
    }

    const workspace: WorkspaceRecord = {
      createdAt: toIso(context.now),
      createdByUserId: principal.user.userId,
      name: input.name.trim(),
      status: "active",
      tenantId,
      updatedAt: toIso(context.now),
      workspaceId: this.random.uuid(),
    };
    await this.state.saveWorkspace(workspace);
    await this.ensureOnboardingState(tenantId, workspace.workspaceId, context);
    const membership = await this.createMembership(
      principal.user.userId,
      tenantId,
      workspace.workspaceId,
      "Workspace Admin",
      "workspace",
      context,
    );

    return this.ok(
      {
        membership: safeMembership(membership),
        policyDecision: decision,
        workspace: safeWorkspace(workspace),
      },
      201,
      context,
    );
  }

  async selectContext(
    input: ContextSelectInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ policyDecision: AccessPolicyDecision; session: SafeSession }>> {
    const principal = await this.requirePrincipal(context);

    if (!principal) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const decision = await this.evaluateAccess(principal, context, {
      capability: "workspace.read",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    });

    if (!decision.allowed) {
      return this.failFromDecision(decision, context);
    }

    const session = await this.authService.setSessionContext(
      context,
      input.tenantId,
      input.workspaceId,
    );

    if (!session) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    return this.ok(
      {
        policyDecision: decision,
        session: safeSession(session, context.sessionId),
      },
      200,
      context,
    );
  }

  async workspaceReadiness(
    workspaceId: string,
    context: RequestContext,
  ): Promise<
    AuthServiceResult<{
      policyDecision: AccessPolicyDecision;
      readiness: {
        readonly checkedAt: IsoDateTime;
        readonly limitations: readonly string[];
        readonly state: "partial" | "ready";
      };
      workspace: SafeWorkspace;
    }>
  > {
    const principal = await this.requirePrincipal(context);

    if (!principal) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const workspace = await this.state.findWorkspace(workspaceId);

    if (!workspace) {
      return this.fail("NOT_FOUND", "Workspace was not found.", 404, context);
    }

    const decision = await this.evaluateAccess(principal, context, {
      capability: "workspace.read",
      tenantId: workspace.tenantId,
      workspaceId,
    });

    if (!decision.allowed) {
      return this.failFromDecision(decision, context);
    }

    return this.ok(
      {
        policyDecision: decision,
        readiness: await this.workspaceReadinessData(workspace, context),
        workspace: safeWorkspace(workspace),
      },
      200,
      context,
    );
  }

  async onboardingStatus(
    context: RequestContext,
  ): Promise<
    AuthServiceResult<{
      businessProfile: BusinessProfileRecord | null;
      companyProfile: CompanyProfileRecord | null;
      onboarding: OnboardingStateRecord;
      policyDecision: AccessPolicyDecision;
    }>
  > {
    const scope = await this.resolveSelectedScope(context, "onboarding.read");

    if ("result" in scope) {
      return scope.result;
    }

    const onboarding = await this.ensureOnboardingState(scope.tenantId, scope.workspaceId, context);

    return this.ok(
      {
        businessProfile:
          (await this.state.findBusinessProfile(scope.tenantId, scope.workspaceId)) ?? null,
        companyProfile: (await this.state.findCompanyProfile(scope.tenantId)) ?? null,
        onboarding,
        policyDecision: scope.decision,
      },
      200,
      context,
    );
  }

  async updateCompany(
    input: OnboardingCompanyInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ companyProfile: CompanyProfileRecord; policyDecision: AccessPolicyDecision }>> {
    const scope = await this.resolveSelectedScope(
      context,
      "onboarding.company.update",
      input.tenantId,
      input.workspaceId,
    );

    if ("result" in scope) {
      return scope.result;
    }

    if (input.companyName.trim().length < 1 || input.legalName.trim().length < 1) {
      return this.fail("VALIDATION_FAILED", "Company profile payload is invalid.", 422, context);
    }

    const profile: CompanyProfileRecord = {
      companyName: input.companyName.trim(),
      country: input.country.trim(),
      legalName: input.legalName.trim(),
      taxId: input.taxId.trim(),
      tenantId: scope.tenantId,
      updatedAt: toIso(context.now),
      website: input.website.trim(),
    };
    await this.state.saveCompanyProfile(profile);
    await this.markOnboardingStep(scope.tenantId, scope.workspaceId, "company", context);

    return this.ok(
      {
        companyProfile: profile,
        policyDecision: scope.decision,
      },
      200,
      context,
    );
  }

  async updateBusinessProfile(
    input: OnboardingBusinessProfileInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ businessProfile: BusinessProfileRecord; policyDecision: AccessPolicyDecision }>> {
    const scope = await this.resolveSelectedScope(
      context,
      "onboarding.business_profile.update",
      input.tenantId,
      input.workspaceId,
    );

    if ("result" in scope) {
      return scope.result;
    }

    if (input.currency.trim().length !== 3 || input.timezone.trim().length < 3) {
      return this.fail("VALIDATION_FAILED", "Business profile payload is invalid.", 422, context);
    }

    const profile: BusinessProfileRecord = {
      averageOrderValueBand: input.averageOrderValueBand.trim(),
      currency: input.currency.trim().toUpperCase(),
      primaryMarket: input.primaryMarket.trim(),
      salesModel: input.salesModel.trim(),
      tenantId: scope.tenantId,
      timezone: input.timezone.trim(),
      updatedAt: toIso(context.now),
      workspaceId: scope.workspaceId,
    };
    await this.state.saveBusinessProfile(profile);
    await this.markOnboardingStep(scope.tenantId, scope.workspaceId, "businessProfile", context);

    return this.ok(
      {
        businessProfile: profile,
        policyDecision: scope.decision,
      },
      200,
      context,
    );
  }

  async updatePlatform(
    input: OnboardingPlatformInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ onboarding: OnboardingStateRecord; policyDecision: AccessPolicyDecision }>> {
    const scope = await this.resolveSelectedScope(
      context,
      "onboarding.platform.update",
      input.tenantId,
      input.workspaceId,
    );

    if ("result" in scope) {
      return scope.result;
    }

    if (input.platformName.trim().length < 2) {
      return this.fail("VALIDATION_FAILED", "Platform payload is invalid.", 422, context);
    }

    const onboarding = await this.markOnboardingStep(
      scope.tenantId,
      scope.workspaceId,
      "platform",
      context,
    );

    return this.ok(
      {
        onboarding,
        policyDecision: scope.decision,
      },
      200,
      context,
    );
  }

  async updateDataSources(
    input: OnboardingDataSourcesInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ onboarding: OnboardingStateRecord; policyDecision: AccessPolicyDecision }>> {
    const scope = await this.resolveSelectedScope(
      context,
      "onboarding.data_sources.update",
      input.tenantId,
      input.workspaceId,
    );

    if ("result" in scope) {
      return scope.result;
    }

    if (input.dataSources.length < 1 || input.dataSources.some((source) => source.trim().length < 2)) {
      return this.fail("VALIDATION_FAILED", "Data sources payload is invalid.", 422, context);
    }

    const onboarding = await this.markOnboardingStep(
      scope.tenantId,
      scope.workspaceId,
      "dataSources",
      context,
    );

    return this.ok(
      {
        onboarding,
        policyDecision: scope.decision,
      },
      200,
      context,
    );
  }

  async completeOnboarding(
    context: RequestContext,
  ): Promise<AuthServiceResult<{ onboarding: OnboardingStateRecord; policyDecision: AccessPolicyDecision }>> {
    const scope = await this.resolveSelectedScope(context, "onboarding.complete");

    if ("result" in scope) {
      return scope.result;
    }

    const onboarding = await this.ensureOnboardingState(scope.tenantId, scope.workspaceId, context);

    if (
      onboarding.company !== "completed" ||
      onboarding.businessProfile !== "completed" ||
      onboarding.platform !== "completed" ||
      onboarding.dataSources !== "completed"
    ) {
      return this.fail("VALIDATION_FAILED", "Onboarding is incomplete.", 422, context);
    }

    const completed = {
      ...onboarding,
      completedAt: toIso(context.now),
      updatedAt: toIso(context.now),
    } satisfies OnboardingStateRecord;
    await this.state.saveOnboardingState(completed);

    return this.ok(
      {
        onboarding: completed,
        policyDecision: scope.decision,
      },
      200,
      context,
    );
  }

  async createInvitationForTest(input: {
    readonly email: string;
    readonly invitedByUserId: string;
    readonly role: RoleName;
    readonly tenantId: string;
    readonly ttlMs?: number;
    readonly workspaceId: string;
  }): Promise<InvitationRecord> {
    const now = this.now();
    const invitation: InvitationRecord = {
      acceptedAt: null,
      acceptedByUserId: null,
      createdAt: toIso(now),
      email: normalizeEmail(input.email),
      expiresAt: toIso(addMs(now, input.ttlMs ?? invitationTtlMs)),
      invitationId: this.random.uuid(),
      invitedByUserId: input.invitedByUserId,
      resendCount: 0,
      revokedAt: null,
      role: input.role,
      status: "pending",
      tenantId: input.tenantId,
      token: this.random.token("inv", 24),
      updatedAt: toIso(now),
      workspaceId: input.workspaceId,
    };
    await this.state.saveInvitation(invitation);
    return invitation;
  }

  async setWorkspaceStatusForTest(
    workspaceId: string,
    status: WorkspaceStatus,
    context: RequestContext,
  ): Promise<void> {
    const workspace = await this.state.findWorkspace(workspaceId);

    if (!workspace) {
      return;
    }

    await this.state.saveWorkspace({
      ...workspace,
      status,
      updatedAt: toIso(context.now),
    });
  }

  private async requirePrincipal(
    context: RequestContext,
  ): Promise<AuthenticatedPrincipal | undefined> {
    return this.authService.getAuthenticatedPrincipal(context);
  }

  private async evaluateAccess(
    principal: AuthenticatedPrincipal,
    context: RequestContext,
    requirement: {
      readonly capability: Capability;
      readonly resourceState?: ResourceState;
      readonly tenantId: string;
      readonly workspaceId?: string;
    },
  ): Promise<AccessPolicyDecision> {
    const tenant = await this.state.findTenant(requirement.tenantId);
    const workspace = requirement.workspaceId
      ? await this.state.findWorkspace(requirement.workspaceId)
      : undefined;
    const membership = workspace
      ? await this.effectiveMembership(principal.user.userId, requirement.tenantId, workspace.workspaceId, context)
      : await this.tenantMembership(principal.user.userId, requirement.tenantId, context);
    const capabilities = membership
      ? capabilitiesForMembership(membership, context)
      : [];
    const resourceState = requirement.resourceState ?? resourceStateFromRecords(tenant, workspace);
    const baseDecision = {
      authStrength: principal.session.authStrength,
      capabilities,
      dataScope: membership?.dataScope ?? "none",
      entitlements: tenant?.entitlements ?? [],
      membership: {
        membershipId: membership?.membershipId ?? null,
        role: membership?.role ?? null,
        status: membership?.status ?? "missing",
      },
      policyVersion: ACCESS_POLICY_VERSION,
      resourceState,
      session: {
        present: true,
        status: "active",
      },
      tenantStatus: tenant?.status ?? "missing",
      workspaceStatus: workspace?.status ?? "missing",
    } satisfies Omit<AccessPolicyDecision, "allowed" | "code">;

    if (!tenant) {
      return deny(baseDecision, "NOT_FOUND");
    }

    if (workspace && workspace.tenantId !== tenant.tenantId) {
      return deny(baseDecision, "WORKSPACE_TENANT_MISMATCH");
    }

    if (tenant.status === "blocked") {
      return deny(baseDecision, "TENANT_BLOCKED");
    }

    if (tenant.status !== "active") {
      return deny(baseDecision, "FORBIDDEN");
    }

    if (workspace && workspace.status === "blocked") {
      return deny(baseDecision, "WORKSPACE_BLOCKED");
    }

    if (workspace && workspace.status !== "active") {
      return deny(baseDecision, "FORBIDDEN");
    }

    if (!membership || membership.status !== "active") {
      return deny(baseDecision, "FORBIDDEN");
    }

    if (!capabilities.includes(requirement.capability)) {
      return deny(baseDecision, "CAPABILITY_REQUIRED");
    }

    if (resourceState === "blocked") {
      return deny(baseDecision, "FORBIDDEN");
    }

    return {
      ...baseDecision,
      allowed: true,
    };
  }

  private async effectiveMembership(
    userId: string,
    tenantId: string,
    workspaceId: string,
    context: RequestContext,
  ): Promise<MembershipRecord | undefined> {
    const exact = await this.state.findMembership(userId, tenantId, workspaceId);

    if (exact) {
      return exact;
    }

    const memberships = await this.state.listMembershipsByUser(userId);
    return memberships.find(
      (membership) =>
        membership.tenantId === tenantId &&
        membership.status === "active" &&
        (membership.role === "Tenant Owner" || membershipRoleHasActiveJit(membership, context)),
    );
  }

  private async tenantMembership(
    userId: string,
    tenantId: string,
    context: RequestContext,
  ): Promise<MembershipRecord | undefined> {
    const memberships = await this.state.listMembershipsByUser(userId);
    return memberships.find(
      (membership) =>
        membership.tenantId === tenantId &&
        membership.status === "active" &&
        (membership.role === "Tenant Owner" ||
          membership.role === "Billing Admin" ||
          membershipRoleHasActiveJit(membership, context)),
    );
  }

  private async resolveSelectedScope(
    context: RequestContext,
    capability: Capability,
    inputTenantId?: string,
    inputWorkspaceId?: string,
  ): Promise<
    | {
        readonly decision: AccessPolicyDecision;
        readonly principal: AuthenticatedPrincipal;
        readonly tenantId: string;
        readonly workspaceId: string;
      }
    | { readonly result: AuthServiceResult<never> }
  > {
    const principal = await this.requirePrincipal(context);

    if (!principal) {
      return {
        result: this.fail("UNAUTHENTICATED", "Session is required.", 401, context),
      };
    }

    const tenantId = principal.session.activeTenantId;
    const workspaceId = principal.session.activeWorkspaceId;

    if (!tenantId || !workspaceId) {
      return {
        result: this.fail("FORBIDDEN", "Workspace context is required.", 403, context),
      };
    }

    if ((inputTenantId && inputTenantId !== tenantId) || (inputWorkspaceId && inputWorkspaceId !== workspaceId)) {
      return {
        result: this.fail("WORKSPACE_TENANT_MISMATCH", "Selected context does not match payload.", 403, context),
      };
    }

    const decision = await this.evaluateAccess(principal, context, {
      capability,
      tenantId,
      workspaceId,
    });

    if (!decision.allowed) {
      return {
        result: this.failFromDecision(decision, context),
      };
    }

    return {
      decision,
      principal,
      tenantId,
      workspaceId,
    };
  }

  private async createInitialWorkspace(
    tenant: TenantRecord,
    principal: AuthenticatedPrincipal,
    input: BootstrapOrganizationInput,
    context: RequestContext,
  ): Promise<WorkspaceRecord> {
    const workspace: WorkspaceRecord = {
      createdAt: toIso(context.now),
      createdByUserId: principal.user.userId,
      name: input.workspaceName.trim() || tenant.name,
      status: "active",
      tenantId: tenant.tenantId,
      updatedAt: toIso(context.now),
      workspaceId: this.random.uuid(),
    };
    await this.state.saveWorkspace(workspace);
    return workspace;
  }

  private async createMembership(
    userId: string,
    tenantId: string,
    workspaceId: string,
    role: RoleName,
    dataScope: DataScope,
    context: RequestContext,
  ): Promise<MembershipRecord> {
    const existing = await this.state.findMembership(userId, tenantId, workspaceId);

    if (existing) {
      const updated = {
        ...existing,
        dataScope,
        role,
        status: "active",
        updatedAt: toIso(context.now),
      } satisfies MembershipRecord;
      await this.state.saveMembership(updated);
      return updated;
    }

    const membership: MembershipRecord = {
      createdAt: toIso(context.now),
      dataScope,
      jitExpiresAt: null,
      membershipId: this.random.uuid(),
      role,
      status: "active",
      tenantId,
      updatedAt: toIso(context.now),
      userId,
      workspaceId,
    };
    await this.state.saveMembership(membership);
    return membership;
  }

  private async ensureOnboardingState(
    tenantId: string,
    workspaceId: string,
    context: RequestContext,
  ): Promise<OnboardingStateRecord> {
    const existing = await this.state.findOnboardingState(tenantId, workspaceId);

    if (existing) {
      return existing;
    }

    const onboarding: OnboardingStateRecord = {
      businessProfile: "not_started",
      company: "not_started",
      completedAt: null,
      dataSources: "not_started",
      platform: "not_started",
      tenantId,
      updatedAt: toIso(context.now),
      workspaceId,
    };
    await this.state.saveOnboardingState(onboarding);
    return onboarding;
  }

  private async markOnboardingStep(
    tenantId: string,
    workspaceId: string,
    step: keyof Pick<
      OnboardingStateRecord,
      "businessProfile" | "company" | "dataSources" | "platform"
    >,
    context: RequestContext,
  ): Promise<OnboardingStateRecord> {
    const onboarding = await this.ensureOnboardingState(tenantId, workspaceId, context);
    const updated = {
      ...onboarding,
      [step]: "completed",
      updatedAt: toIso(context.now),
    } satisfies OnboardingStateRecord;
    await this.state.saveOnboardingState(updated);
    return updated;
  }

  private async workspaceReadinessData(
    workspace: WorkspaceRecord,
    context: RequestContext,
  ): Promise<{
    readonly checkedAt: IsoDateTime;
    readonly limitations: readonly string[];
    readonly state: "partial" | "ready";
  }> {
    const onboarding = await this.ensureOnboardingState(
      workspace.tenantId,
      workspace.workspaceId,
      context,
    );
    const incomplete = [
      onboarding.company === "completed" ? undefined : "company",
      onboarding.businessProfile === "completed" ? undefined : "businessProfile",
      onboarding.platform === "completed" ? undefined : "platform",
      onboarding.dataSources === "completed" ? undefined : "dataSources",
    ].filter((value): value is string => Boolean(value));

    return {
      checkedAt: toIso(context.now),
      limitations: incomplete,
      state: incomplete.length === 0 && onboarding.completedAt ? "ready" : "partial",
    };
  }

  private async validateInvitationState(
    invitationOrError: InvitationRecord,
    email: string | undefined,
    context: RequestContext,
  ): Promise<AuthServiceResult<never> | undefined> {
    const tenant = await this.state.findTenant(invitationOrError.tenantId);
    const workspace = await this.state.findWorkspace(invitationOrError.workspaceId);

    if (email && normalizeEmail(email) !== invitationOrError.email) {
      return this.fail("INVITATION_EMAIL_MISMATCH", "Invitation email does not match.", 403, context);
    }

    if (invitationOrError.status === "accepted") {
      return this.fail("INVITATION_USED", "Invitation has already been used.", 409, context);
    }

    if (invitationOrError.status === "revoked" || invitationOrError.revokedAt) {
      return this.fail("INVITATION_REVOKED", "Invitation has been revoked.", 410, context);
    }

    if (Date.parse(invitationOrError.expiresAt) <= context.now.getTime()) {
      return this.fail("INVITATION_EXPIRED", "Invitation has expired.", 410, context);
    }

    if (!tenant || !workspace) {
      return this.fail("NOT_FOUND", "Invitation scope was not found.", 404, context);
    }

    if (workspace.tenantId !== tenant.tenantId) {
      return this.fail("WORKSPACE_TENANT_MISMATCH", "Workspace does not belong to tenant.", 403, context);
    }

    if (tenant.status === "blocked") {
      return this.fail("TENANT_BLOCKED", "Tenant is blocked.", 423, context, true);
    }

    if (tenant.status !== "active") {
      return this.fail("FORBIDDEN", "Tenant is not active.", 403, context);
    }

    if (workspace.status === "blocked") {
      return this.fail("WORKSPACE_BLOCKED", "Workspace is blocked.", 423, context, true);
    }

    if (workspace.status !== "active") {
      return this.fail("FORBIDDEN", "Workspace is not active.", 403, context);
    }

    return undefined;
  }

  private ok<TData>(
    data: TData,
    status: number,
    context: RequestContext,
  ): AuthServiceResult<TData> {
    return {
      body: {
        data,
        meta: responseMeta(context),
      },
      status,
    };
  }

  private fail(
    code: AuthErrorCode,
    message: string,
    status: number,
    context: RequestContext,
    retryable = false,
  ): AuthServiceResult<never> {
    return {
      body: {
        error: {
          code,
          contractVersion: responseMeta(context).contractVersion,
          correlationId: context.correlationId,
          message,
          retryable,
        },
        meta: {
          ...responseMeta(context),
          limitations: [code],
        },
      },
      status,
    };
  }

  private failFromDecision(
    decision: AccessPolicyDecision,
    context: RequestContext,
  ): AuthServiceResult<never> {
    const code = decision.code ?? "FORBIDDEN";
    const status = statusForCode(code);
    return this.fail(code, messageForCode(code), status, context, status === 423);
  }
}

export function safeTenant(tenant: TenantRecord): SafeTenant {
  return {
    name: tenant.name,
    status: tenant.status,
    tenantId: tenant.tenantId,
  };
}

export function safeWorkspace(workspace: WorkspaceRecord): SafeWorkspace {
  return {
    name: workspace.name,
    status: workspace.status,
    tenantId: workspace.tenantId,
    workspaceId: workspace.workspaceId,
  };
}

export function safeMembership(membership: MembershipRecord): SafeMembership {
  return {
    dataScope: membership.dataScope,
    membershipId: membership.membershipId,
    role: membership.role,
    status: membership.status,
    tenantId: membership.tenantId,
    userId: membership.userId,
    workspaceId: membership.workspaceId,
  };
}

export function safeInvitation(invitation: InvitationRecord): SafeInvitation {
  return {
    email: invitation.email,
    expiresAt: invitation.expiresAt,
    invitationId: invitation.invitationId,
    role: invitation.role,
    status: invitation.status,
    tenantId: invitation.tenantId,
    workspaceId: invitation.workspaceId,
  };
}

export type CursorPage<TItem> = {
  readonly items: readonly TItem[];
  readonly pageInfo: {
    readonly endCursor: string | null;
    readonly hasNextPage: false;
    readonly hasPreviousPage: false;
    readonly startCursor: string | null;
  };
};

function toCursorPage<TItem>(items: readonly TItem[]): CursorPage<TItem> {
  return {
    items,
    pageInfo: {
      endCursor: items.length ? String(items.length - 1) : null,
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: items.length ? "0" : null,
    },
  };
}

function capabilitiesForMembership(
  membership: MembershipRecord,
  context: RequestContext,
): readonly Capability[] {
  if (membership.status !== "active") {
    return [];
  }

  if (membership.role === "Internal Support/Operations") {
    return membershipRoleHasActiveJit(membership, context)
      ? ["audit.read", "support.operations", "tenant.read", "workspace.read"]
      : [];
  }

  return roleCapabilities[membership.role];
}

function dataScopeForRole(role: RoleName): DataScope {
  if (role === "Tenant Owner") {
    return "tenant";
  }

  if (role === "Billing Admin") {
    return "billing";
  }

  if (role === "Auditor/Security") {
    return "audit";
  }

  if (role === "Internal Support/Operations") {
    return "support_jit";
  }

  return role === "Viewer" ? "assigned_workspace" : "workspace";
}

function membershipRoleHasActiveJit(
  membership: MembershipRecord,
  context: RequestContext,
): boolean {
  return (
    membership.role === "Internal Support/Operations" &&
    Boolean(membership.jitExpiresAt && Date.parse(membership.jitExpiresAt) > context.now.getTime())
  );
}

function resourceStateFromRecords(
  tenant: TenantRecord | undefined,
  workspace: WorkspaceRecord | undefined,
): ResourceState {
  if (!tenant || (workspace === undefined && tenant.status === "pending_verification")) {
    return "pending";
  }

  if (tenant.status === "blocked" || workspace?.status === "blocked") {
    return "blocked";
  }

  if (workspace?.status === "archived") {
    return "deleted";
  }

  return "active";
}

function resourceStateFromInvitation(
  invitation: InvitationRecord,
  context: RequestContext,
): ResourceState {
  if (invitation.status === "revoked") {
    return "blocked";
  }

  if (invitation.status === "accepted") {
    return "deleted";
  }

  return Date.parse(invitation.expiresAt) <= context.now.getTime() ? "deleted" : "active";
}

function deny(
  baseDecision: Omit<AccessPolicyDecision, "allowed" | "code">,
  code: AuthErrorCode,
): AccessPolicyDecision {
  return {
    ...baseDecision,
    allowed: false,
    code,
  };
}

function statusForCode(code: AuthErrorCode): number {
  if (code === "NOT_FOUND") {
    return 404;
  }

  if (code === "CAPABILITY_REQUIRED" || code === "FORBIDDEN" || code === "WORKSPACE_TENANT_MISMATCH") {
    return 403;
  }

  if (code === "TENANT_BLOCKED" || code === "WORKSPACE_BLOCKED") {
    return 423;
  }

  if (code === "UNAUTHENTICATED") {
    return 401;
  }

  return 400;
}

function messageForCode(code: AuthErrorCode): string {
  if (code === "CAPABILITY_REQUIRED") {
    return "Required capability is missing.";
  }

  if (code === "TENANT_BLOCKED") {
    return "Tenant is blocked.";
  }

  if (code === "WORKSPACE_BLOCKED") {
    return "Workspace is blocked.";
  }

  if (code === "WORKSPACE_TENANT_MISMATCH") {
    return "Workspace does not belong to tenant.";
  }

  if (code === "NOT_FOUND") {
    return "Resource was not found.";
  }

  if (code === "UNAUTHENTICATED") {
    return "Session is required.";
  }

  return "Access denied.";
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function scopeKey(tenantId: string, workspaceId: string): string {
  return `${tenantId}:${workspaceId}`;
}

const invitationTtlMs = 7 * 24 * 60 * 60 * 1000;

const defaultEntitlements = [
  "ai_assistant",
  "analytics",
  "audit",
  "billing",
  "core_access",
  "exports",
  "onboarding",
  "reports",
  "workspace_management",
] as const satisfies readonly Entitlement[];

const roleCapabilities = {
  "Tenant Owner": [
    "analytics.read",
    "assistant.approve",
    "assistant.use",
    "audit.read",
    "billing.manage",
    "billing.read",
    "export.aggregate",
    "export.detail",
    "invitation.accept",
    "invitation.resend",
    "invitation.revoke",
    "legal.acceptance.write",
    "legal.read",
    "notification.read",
    "notification.update",
    "onboarding.business_profile.update",
    "onboarding.company.update",
    "onboarding.complete",
    "onboarding.data_sources.update",
    "onboarding.platform.update",
    "onboarding.read",
    "privacy.consent.manage",
    "report.create",
    "report.read",
    "tenant.bootstrap",
    "tenant.read",
    "tenant.verify",
    "workspace.create",
    "workspace.read",
    "workspace.update",
  ],
  "Workspace Admin": [
    "analytics.read",
    "assistant.approve",
    "assistant.use",
    "export.aggregate",
    "invitation.accept",
    "invitation.resend",
    "invitation.revoke",
    "legal.acceptance.write",
    "legal.read",
    "notification.read",
    "notification.update",
    "onboarding.business_profile.update",
    "onboarding.company.update",
    "onboarding.complete",
    "onboarding.data_sources.update",
    "onboarding.platform.update",
    "onboarding.read",
    "privacy.consent.manage",
    "report.create",
    "report.read",
    "tenant.read",
    "workspace.create",
    "workspace.read",
    "workspace.update",
  ],
  Analyst: [
    "analytics.read",
    "assistant.use",
    "export.aggregate",
    "legal.acceptance.write",
    "legal.read",
    "notification.read",
    "notification.update",
    "onboarding.read",
    "privacy.consent.manage",
    "report.create",
    "report.read",
    "tenant.read",
    "workspace.read",
  ],
  "Marketing Operator": [
    "analytics.read",
    "assistant.use",
    "export.aggregate",
    "legal.acceptance.write",
    "legal.read",
    "notification.read",
    "notification.update",
    "onboarding.data_sources.update",
    "onboarding.read",
    "privacy.consent.manage",
    "report.create",
    "report.read",
    "tenant.read",
    "workspace.read",
  ],
  Viewer: [
    "analytics.read",
    "assistant.use",
    "legal.acceptance.write",
    "legal.read",
    "notification.read",
    "notification.update",
    "onboarding.read",
    "privacy.consent.manage",
    "report.read",
    "tenant.read",
    "workspace.read",
  ],
  "Billing Admin": [
    "billing.manage",
    "billing.read",
    "legal.acceptance.write",
    "legal.read",
    "notification.read",
    "notification.update",
    "privacy.consent.manage",
    "tenant.read",
    "workspace.read",
  ],
  "Auditor/Security": [
    "analytics.read",
    "audit.read",
    "export.aggregate",
    "legal.acceptance.write",
    "legal.read",
    "notification.read",
    "notification.update",
    "onboarding.read",
    "privacy.consent.manage",
    "report.read",
    "tenant.read",
    "workspace.read",
  ],
  "Internal Support/Operations": [],
} as const satisfies Record<RoleName, readonly Capability[]>;
