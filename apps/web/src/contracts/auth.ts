import type {
  AuthChallengeId,
  CorrelationId,
  InvitationId,
  MembershipId,
  TenantId,
  PasswordResetId,
  SessionId,
  UserId,
  WorkspaceId,
} from './ids';
import type {
  Membership as DomainMembership,
  Tenant as DomainTenant,
  WorkspaceChangeResolution,
  Workspace as DomainWorkspace,
} from '../domain-contracts';
import type { AccessDecision, ActorContext, Capability, Role } from './authz';
import type { TenantContext } from './tenant';

export type {
  AuthChallengeId,
  CorrelationId,
  InvitationId,
  MembershipId,
  TenantId,
  PasswordResetId,
  SessionId,
  UserId,
  WorkspaceId,
};

export type AuthErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_BLOCKED'
  | 'CSRF_INVALID'
  | 'MFA_REQUIRED'
  | 'MFA_INVALID'
  | 'MFA_EXPIRED'
  | 'MFA_RETRY_LIMITED'
  | 'RATE_LIMITED'
  | 'PASSWORD_CHANGE_REQUIRED'
  | 'PASSWORD_RESET_REQUIRED'
  | 'RETURN_URL_INVALID'
  | 'SESSION_NOT_FOUND'
  | 'SESSION_EXPIRED'
  | 'SESSION_REVOKED'
  | 'REFRESH_REUSE_DETECTED'
  | 'RESET_TOKEN_INVALID'
  | 'RESET_TOKEN_EXPIRED'
  | 'RESET_TOKEN_USED'
  | 'INVITATION_INVALID'
  | 'INVITATION_EXPIRED'
  | 'INVITATION_CANCELLED'
  | 'INVITATION_USED'
  | 'INVITATION_EMAIL_MISMATCH'
  | 'MEMBERSHIP_CONFLICT'
  | 'NO_ACTIVE_MEMBERSHIP'
  | 'TENANT_NOT_FOUND'
  | 'WORKSPACE_NOT_FOUND'
  | 'WORKSPACE_TENANT_MISMATCH'
  | 'WORKSPACE_NOT_READY'
  | 'WORKSPACE_BLOCKED'
  | 'WORKSPACE_NO_DATA'
  | 'REAUTHENTICATION_REQUIRED'
  | 'REAUTHENTICATION_EXPIRED'
  | 'REAUTHENTICATION_NOT_FOUND'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR';

export type AuthError = {
  code: AuthErrorCode;
  message: string;
  retrySafe: boolean;
};

export type AuthUserStatus =
  | 'active'
  | 'blocked'
  | 'password_change_required'
  | 'password_reset_required';

export type WorkspaceStatus = 'ready' | 'not_ready' | 'blocked' | 'no_data';

export type MembershipStatus = 'active' | 'inactive' | 'blocked';

export type SessionStatus =
  | 'active'
  | 'expiring'
  | 'expired'
  | 'revoked'
  | 'reauthentication_required';

export type MfaMethod = 'totp_dev';

export type MfaChallengeStatus =
  | 'active'
  | 'verified'
  | 'expired'
  | 'retry_limited'
  | 'cancelled';

export type RecoveryCodeState = 'available' | 'used';

export type InvitationStatus =
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'used';

export type PasswordResetStatus = 'active' | 'expired' | 'used';

export type ReauthenticationPurpose =
  | 'change_password'
  | 'disable_mfa'
  | 'regenerate_recovery_codes'
  | 'revoke_session'
  | 'admin_action'
  | 'export'
  | 'ai_action';

export type AuthUser = {
  email: string;
  fullName: string;
  mfaEnabled: boolean;
  status: AuthUserStatus;
  userId: UserId;
};

export type Tenant = DomainTenant;

export type Workspace = DomainWorkspace;

export type Membership = DomainMembership;

export type AuthSession = {
  clientLabel: string;
  createdAt: string;
  currentTenant?: TenantContext;
  expiresAt: string;
  idleExpiresAt: string;
  lastActivityAt: string;
  mfaSatisfied: boolean;
  reauthenticatedUntil?: string;
  sessionId: SessionId;
  status: SessionStatus;
  userId: UserId;
};

export type MfaChallenge = {
  attempts: number;
  challengeId: AuthChallengeId;
  expiresAt: string;
  method: MfaMethod;
  status: MfaChallengeStatus;
  userId: UserId;
};

export type RecoveryCode = {
  codeId: string;
  state: RecoveryCodeState;
  usedAt?: string;
};

export type PasswordResetRequest = {
  email: string;
  expiresAt: string;
  passwordResetId: PasswordResetId;
  status: PasswordResetStatus;
  userId: UserId;
};

export type Invitation = {
  acceptedAt?: string;
  createdBy: UserId;
  email: string;
  expiresAt: string;
  invitationId: InvitationId;
  tenantId: TenantId;
  requestedRole: Role;
  status: InvitationStatus;
  tokenIssuedAt: string;
  workspaceId: WorkspaceId;
};

export type ReauthenticationContext = {
  expiresAt: string;
  purpose: ReauthenticationPurpose;
  sessionId: SessionId;
  userId: UserId;
};

export type AuditEventType =
  | 'auth.csrf_rejected'
  | 'auth.invitation_checked'
  | 'auth.login_succeeded'
  | 'auth.login_failed'
  | 'auth.logout'
  | 'auth.session_expired'
  | 'auth.refresh_failed'
  | 'auth.refresh_reuse_detected'
  | 'auth.password_reset_requested'
  | 'auth.password_reset_token_checked'
  | 'auth.password_reset_completed'
  | 'auth.password_changed'
  | 'auth.mfa_configured'
  | 'auth.mfa_failed'
  | 'auth.mfa_recovery_code_used'
  | 'auth.mfa_recovery_codes_regenerated'
  | 'auth.mfa_disabled'
  | 'auth.invitation_created'
  | 'auth.invitation_resent'
  | 'auth.invitation_cancelled'
  | 'auth.invitation_accepted'
  | 'auth.membership_changed'
  | 'auth.reauthentication_completed'
  | 'auth.session_revoked'
  | 'auth.rate_limited'
  | 'auth.unauthorized_access_attempt'
  | 'auth.workspace_changed';

export type AuditEvent = {
  actor?: Pick<ActorContext, 'actorId' | 'roles'>;
  auditEventId: string;
  correlationId: CorrelationId;
  eventType: AuditEventType;
  occurredAt: string;
  tenantId?: TenantId;
  reason?: AuthErrorCode | 'granted_by_fixture';
  result: 'success' | 'failure' | 'denied';
  source: 'auth_server' | 'local_auth_adapter' | 'web_ui' | 'storybook' | 'test';
  target?: {
    email?: string;
    invitationId?: InvitationId;
    sessionId?: SessionId;
    userId?: UserId;
    workspaceId?: WorkspaceId;
  };
  workspaceId?: WorkspaceId;
};

export type LoginInput = {
  email: string;
  password: string;
  returnUrl?: string;
};

export type MfaChallengeInput = {
  challengeId: AuthChallengeId;
  code: string;
};

export type PasswordResetStartInput = {
  email: string;
};

export type PasswordResetConfirmInput = {
  confirmPassword: string;
  newPassword: string;
  token: string;
};

export type InvitationAcceptInput = {
  email: string;
  password?: string;
  token: string;
};

export type ReauthenticationInput = {
  password: string;
  purpose: ReauthenticationPurpose;
  sessionId: SessionId;
};

export type PasswordChangeInput = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
  sessionId: SessionId;
};

export type PasswordResetValidateInput = {
  token: string;
};

export type InvitationCheckInput = {
  email?: string;
  token: string;
};

export type ReauthenticationValidationInput = {
  purpose: ReauthenticationPurpose;
  sessionId: SessionId;
};

export type LoginOutcome =
  | {
      status: 'authenticated';
      context: PostLoginContextResolution;
      returnUrl: string;
      session: AuthSession;
      user: AuthUser;
    }
  | {
      status: 'mfa_required';
      challenge: MfaChallenge;
      user: AuthUser;
    }
  | {
      status: 'password_change_required' | 'password_reset_required';
      user: AuthUser;
    }
  | {
      status: 'blocked' | 'error';
      error: AuthError;
    };

export type SessionResult =
  | {
      status: 'active';
      context: PostLoginContextResolution;
      session: AuthSession;
      user: AuthUser;
    }
  | {
      status: 'expired' | 'revoked' | 'missing';
      error: AuthError;
    };

export type OperationResult<TValue> =
  | {
      status: 'success';
      value: TValue;
    }
  | {
      status: 'error';
      error: AuthError;
    };

export type PostLoginContextResolution = {
  workspaceChange?: WorkspaceChangeResolution;
} & (
  | {
      status: 'workspace_selected';
      tenantRecord: Tenant;
      tenant: TenantContext;
      workspace: Workspace;
    }
  | {
      status: 'tenant_selection_required';
      tenants: readonly Tenant[];
    }
  | {
      status: 'workspace_selection_required';
      tenantRecord: Tenant;
      workspaces: readonly Workspace[];
    }
  | {
      status:
        | 'no_active_membership'
        | 'workspace_not_ready'
        | 'workspace_blocked'
        | 'workspace_no_data';
      error: AuthError;
      tenantRecord?: Tenant;
      workspace?: Workspace;
    }
);

export type TestOutboxMessage =
  | {
      channel: 'password_reset';
      email: string;
      expiresAt: string;
      token: string;
    }
  | {
      channel: 'invitation';
      email: string;
      expiresAt: string;
      invitationId: InvitationId;
      token: string;
    };

export type AuthGateway = {
  acceptInvitation(input: InvitationAcceptInput): Promise<LoginOutcome>;
  authorizeOperation(
    sessionId: SessionId,
    capability: Capability,
    tenant: TenantContext,
  ): Promise<OperationResult<AccessDecision>>;
  cancelInvitation(
    actor: ActorContext,
    invitationId: InvitationId,
  ): Promise<OperationResult<Invitation>>;
  changePasswordAfterReauthentication(
    input: PasswordChangeInput,
  ): Promise<OperationResult<AuthUser>>;
  checkInvitationToken(input: InvitationCheckInput): Promise<OperationResult<Invitation>>;
  configureMfa(
    sessionId: SessionId,
  ): Promise<OperationResult<readonly RecoveryCode[]>>;
  createInvitation(
    actor: ActorContext,
    input: {
      email: string;
      tenantId: TenantId;
      requestedRole: Role;
      workspaceId: WorkspaceId;
    },
  ): Promise<OperationResult<Invitation>>;
  disableMfa(sessionId: SessionId): Promise<OperationResult<AuthUser>>;
  getActorContext(sessionId: SessionId): Promise<OperationResult<ActorContext>>;
  getAuditEvents(): readonly AuditEvent[];
  getTestOutbox(): readonly TestOutboxMessage[];
  listSessions(sessionId: SessionId): Promise<OperationResult<readonly AuthSession[]>>;
  logout(sessionId: SessionId): Promise<OperationResult<{ redirectTo: string }>>;
  reauthenticate(input: ReauthenticationInput): Promise<OperationResult<ReauthenticationContext>>;
  refreshSession(sessionId: SessionId): Promise<SessionResult>;
  regenerateRecoveryCodes(
    sessionId: SessionId,
  ): Promise<OperationResult<readonly RecoveryCode[]>>;
  resendInvitation(
    actor: ActorContext,
    invitationId: InvitationId,
  ): Promise<OperationResult<Invitation>>;
  requestPasswordReset(
    input: PasswordResetStartInput,
  ): Promise<OperationResult<{ neutralMessage: string }>>;
  resetPassword(input: PasswordResetConfirmInput): Promise<OperationResult<AuthUser>>;
  restoreSession(sessionId: SessionId): Promise<SessionResult>;
  revokeOtherSessions(sessionId: SessionId): Promise<OperationResult<readonly AuthSession[]>>;
  revokeSession(
    sessionId: SessionId,
    targetSessionId: SessionId,
  ): Promise<OperationResult<AuthSession>>;
  selectWorkspace(
    sessionId: SessionId,
    tenant: TenantContext,
  ): Promise<OperationResult<PostLoginContextResolution>>;
  signIn(input: LoginInput): Promise<LoginOutcome>;
  validatePasswordResetToken(
    input: PasswordResetValidateInput,
  ): Promise<OperationResult<PasswordResetRequest>>;
  validateReauthenticationContext(
    input: ReauthenticationValidationInput,
  ): Promise<OperationResult<ReauthenticationContext>>;
  verifyMfaChallenge(input: MfaChallengeInput): Promise<LoginOutcome>;
};
