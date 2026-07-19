import type {
  AuditEvent,
  AuthChallengeId,
  AuthError,
  AuthErrorCode,
  AuthGateway,
  AuthSession,
  AuthUser,
  Invitation,
  InvitationAcceptInput,
  InvitationCheckInput,
  InvitationId,
  LoginInput,
  LoginOutcome,
  Membership,
  MfaChallenge,
  MfaChallengeInput,
  OperationResult,
  PasswordChangeInput,
  Organization,
  PasswordResetConfirmInput,
  PasswordResetRequest,
  PasswordResetStartInput,
  PasswordResetValidateInput,
  PostLoginContextResolution,
  ReauthenticationContext,
  ReauthenticationInput,
  ReauthenticationValidationInput,
  RecoveryCode,
  SessionId,
  SessionResult,
  TestOutboxMessage,
  UserId,
  Workspace,
} from '../contracts/auth';
import type { AccessDecision, ActorContext, Capability, Role } from '../contracts/authz';
import { denyByDefaultAccessDecision } from '../contracts/authz';
import type { TenantContext } from '../contracts/tenant';
import {
  asAuthChallengeId,
  asAuditEventId,
  asCorrelationId,
  asInvitationId,
  asMembershipId,
  asPasswordResetId,
  asSessionId,
  asUserId,
} from '../contracts/ids';
import {
  localAuthFixtureNow,
  localAuthFixturePasswords,
  localAuthInvitationTokens,
  localAuthInvitations,
  localAuthMemberships,
  localAuthMfaChallenges,
  localAuthOrganizations,
  localAuthPasswordResetTokens,
  localAuthPasswordResets,
  localAuthRecoveryCodeValues,
  localAuthRecoveryCodes,
  localAuthSessions,
  localAuthUsers,
  localAuthWorkspaces,
} from '../fixtures/auth-domain';
import {
  normalizeEmail,
  sanitizeReturnUrl,
  validatePasswordChange,
  validateInvitationAccept,
  validateLoginInput,
  validatePasswordResetConfirm,
  validatePasswordResetStart,
  validatePasswordResetToken,
  validateReauthentication,
  validationAuthError,
} from './validation';

type StoredCredential = {
  hash: string;
  salt: string;
};

type StoredRecoveryCode = RecoveryCode & {
  hash: string;
};

type OneTimeTokenPurpose = 'invitation' | 'password_reset';

type LocalAuthSeed = {
  invitationTokens: Record<string, string>;
  invitations: readonly Invitation[];
  memberships: readonly Membership[];
  mfaChallenges: readonly MfaChallenge[];
  organizations: readonly Organization[];
  passwordResetTokens: Record<string, string>;
  passwordResets: readonly PasswordResetRequest[];
  recoveryCodes: Record<string, readonly RecoveryCode[]>;
  recoveryCodeValues: Record<string, string>;
  sessions: readonly AuthSession[];
  userPasswords: Record<string, string>;
  users: readonly AuthUser[];
  workspaces: readonly Workspace[];
};

export type LocalAuthPolicy = {
  idleSessionTtlMs: number;
  invitationTtlMs: number;
  maxMfaAttempts: number;
  mfaChallengeTtlMs: number;
  passwordResetTtlMs: number;
  reauthenticationTtlMs: number;
  sessionTtlMs: number;
};

export type LocalAuthGatewayOptions = {
  now?: () => Date;
  policy?: Partial<LocalAuthPolicy>;
  seed?: Partial<LocalAuthSeed>;
};

const defaultPolicy: LocalAuthPolicy = {
  idleSessionTtlMs: 15 * 60 * 1000,
  invitationTtlMs: 7 * 24 * 60 * 60 * 1000,
  maxMfaAttempts: 3,
  mfaChallengeTtlMs: 5 * 60 * 1000,
  passwordResetTtlMs: 20 * 60 * 1000,
  reauthenticationTtlMs: 5 * 60 * 1000,
  sessionTtlMs: 30 * 60 * 1000,
};

const neutralLoginMessage =
  'Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.';
const neutralResetMessage =
  'Jeżeli konto może przejść reset hasła, wyślemy dalsze instrukcje.';

const fixturePasswordByEmail: Record<string, string> = {
  'admin@northstar.example': localAuthFixturePasswords.admin,
  'analyst@northstar.example': localAuthFixturePasswords.analyst,
  'blocked@northstar.example': localAuthFixturePasswords.blocked,
  'change-password@northstar.example': localAuthFixturePasswords.changePassword,
  'multi-org@papadata.example': localAuthFixturePasswords.multiOrg,
  'multi-workspace@northstar.example': localAuthFixturePasswords.multiWorkspace,
  'nomembership@northstar.example': localAuthFixturePasswords.noMembership,
  'owner@northstar.example': localAuthFixturePasswords.owner,
  'viewer@northstar.example': localAuthFixturePasswords.viewer,
};

const defaultSeed: LocalAuthSeed = {
  invitationTokens: localAuthInvitationTokens,
  invitations: localAuthInvitations,
  memberships: localAuthMemberships,
  mfaChallenges: localAuthMfaChallenges,
  organizations: localAuthOrganizations,
  passwordResetTokens: localAuthPasswordResetTokens,
  passwordResets: localAuthPasswordResets,
  recoveryCodeValues: localAuthRecoveryCodeValues,
  recoveryCodes: localAuthRecoveryCodes,
  sessions: localAuthSessions,
  userPasswords: fixturePasswordByEmail,
  users: localAuthUsers,
  workspaces: localAuthWorkspaces,
};

function authError(
  code: AuthErrorCode,
  message: string,
  retrySafe = true,
): AuthError {
  return {
    code,
    message,
    retrySafe,
  };
}

function cloneReadonlyArray<TValue>(values: readonly TValue[]): TValue[] {
  return values.map((value) => ({ ...value }));
}

function toTimestamp(date: Date): number {
  return date.getTime();
}

function addMs(date: Date, milliseconds: number): string {
  return new Date(date.getTime() + milliseconds).toISOString();
}

function isPast(isoDate: string, now: Date): boolean {
  return Date.parse(isoDate) <= now.getTime();
}

function maskEmail(email: string): string {
  const [name = '', domain = ''] = email.split('@');
  const first = name.charAt(0) || '*';
  return `${first}***@${domain || 'redacted'}`;
}

function constantTimeEqual(left: string, right: string): boolean {
  const length = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;

  for (let index = 0; index < length; index += 1) {
    diff |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return diff === 0;
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function deriveHash(value: string, salt: string): Promise<string> {
  const cryptoApi = globalThis.crypto?.subtle;

  if (!cryptoApi) {
    throw new Error('Web Crypto API is required for local auth hashing.');
  }

  const encoder = new TextEncoder();
  const key = await cryptoApi.importKey(
    'raw',
    encoder.encode(value),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await cryptoApi.deriveBits(
    {
      hash: 'SHA-256',
      iterations: 120000,
      name: 'PBKDF2',
      salt: encoder.encode(salt),
    },
    key,
    256,
  );

  return bytesToHex(bits);
}

async function digestOneTimeToken(
  value: string,
  purpose: OneTimeTokenPurpose,
): Promise<string> {
  return deriveHash(value, `local-token:${purpose}`);
}

function secureRandomHex(byteLength: number): string {
  const cryptoApi = globalThis.crypto;

  if (!cryptoApi) {
    throw new Error('Web Crypto API is required for local auth token generation.');
  }

  const bytes = new Uint8Array(byteLength);
  cryptoApi.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function createLocalAuthGateway(
  options: LocalAuthGatewayOptions = {},
): Promise<AuthGateway> {
  const seed = {
    ...defaultSeed,
    ...options.seed,
  };
  const policy = {
    ...defaultPolicy,
    ...options.policy,
  };
  const credentials = new Map<UserId, StoredCredential>();
  const recoveryCodeHashes = new Map<UserId, StoredRecoveryCode[]>();
  const invitationTokenDigests = new Map<string, InvitationId>();
  const passwordResetTokenDigests = new Map<
    string,
    PasswordResetRequest['passwordResetId']
  >();

  for (const user of seed.users) {
    const password = seed.userPasswords[normalizeEmail(user.email)];

    if (password) {
      const salt = `local-auth:${user.userId}`;
      credentials.set(user.userId, {
        hash: await deriveHash(password, salt),
        salt,
      });
    }
  }

  for (const [userId, codes] of Object.entries(seed.recoveryCodes)) {
    const storedCodes: StoredRecoveryCode[] = [];

    for (const code of codes) {
      const value = seed.recoveryCodeValues[code.codeId];

      if (value) {
        const salt = `local-recovery:${code.codeId}`;
        storedCodes.push({
          ...code,
          hash: await deriveHash(value, salt),
        });
      }
    }

    recoveryCodeHashes.set(asUserId(userId), storedCodes);
  }

  for (const [id, token] of Object.entries(seed.invitationTokens)) {
    invitationTokenDigests.set(await digestOneTimeToken(token, 'invitation'), asInvitationId(id));
  }

  for (const [id, token] of Object.entries(seed.passwordResetTokens)) {
    passwordResetTokenDigests.set(
      await digestOneTimeToken(token, 'password_reset'),
      asPasswordResetId(id),
    );
  }

  return new LocalAuthGateway(
    seed,
    policy,
    credentials,
    recoveryCodeHashes,
    invitationTokenDigests,
    passwordResetTokenDigests,
    options.now,
  );
}

class LocalAuthGateway implements AuthGateway {
  private readonly auditEvents: AuditEvent[] = [];

  private readonly challenges: MfaChallenge[];

  private readonly credentials: Map<UserId, StoredCredential>;

  private readonly invitationTokenDigests: Map<string, InvitationId>;

  private readonly invitations: Invitation[];

  private readonly memberships: Membership[];

  private readonly now: () => Date;

  private readonly organizations: Organization[];

  private readonly passwordResetTokenDigests: Map<
    string,
    PasswordResetRequest['passwordResetId']
  >;

  private readonly passwordResets: PasswordResetRequest[];

  private readonly policy: LocalAuthPolicy;

  private readonly recoveryCodeHashes: Map<UserId, StoredRecoveryCode[]>;

  private readonly sessions: AuthSession[];

  private readonly testOutbox: TestOutboxMessage[] = [];

  private sequence = 0;

  private readonly users: AuthUser[];

  private readonly workspaces: Workspace[];

  constructor(
    seed: LocalAuthSeed,
    policy: LocalAuthPolicy,
    credentials: Map<UserId, StoredCredential>,
    recoveryCodeHashes: Map<UserId, StoredRecoveryCode[]>,
    invitationTokenDigests: Map<string, InvitationId>,
    passwordResetTokenDigests: Map<string, PasswordResetRequest['passwordResetId']>,
    now?: () => Date,
  ) {
    this.challenges = cloneReadonlyArray(seed.mfaChallenges);
    this.credentials = credentials;
    this.invitationTokenDigests = invitationTokenDigests;
    this.invitations = cloneReadonlyArray(seed.invitations);
    this.memberships = cloneReadonlyArray(seed.memberships);
    this.now = now ?? (() => new Date(localAuthFixtureNow));
    this.organizations = cloneReadonlyArray(seed.organizations);
    this.passwordResets = cloneReadonlyArray(seed.passwordResets);
    this.passwordResetTokenDigests = passwordResetTokenDigests;
    this.policy = policy;
    this.recoveryCodeHashes = recoveryCodeHashes;
    this.sessions = cloneReadonlyArray(seed.sessions);
    this.users = cloneReadonlyArray(seed.users);
    this.workspaces = cloneReadonlyArray(seed.workspaces);

  }

  async acceptInvitation(input: InvitationAcceptInput): Promise<LoginOutcome> {
    const parsed = validateInvitationAccept(input);

    if (!parsed.success) {
      return {
        error: validationAuthError('Nie można użyć tego zaproszenia.'),
        status: 'error',
      };
    }

    const invitationId = this.invitationTokenDigests.get(
      await digestOneTimeToken(parsed.output.token, 'invitation'),
    );
    const invitation = invitationId ? this.findInvitation(invitationId) : undefined;

    if (!invitation) {
      this.audit('auth.unauthorized_access_attempt', 'failure', {
        reason: 'INVITATION_INVALID',
        target: { email: maskEmail(parsed.output.email) },
      });

      return this.errorLoginOutcome('INVITATION_INVALID', 'Zaproszenie jest nieprawidłowe.');
    }

    const now = this.now();
    const invitationStateError = this.invitationStateError(invitation, now);

    if (invitationStateError) {
      this.audit('auth.unauthorized_access_attempt', 'failure', {
        organizationId: invitation.organizationId,
        reason: invitationStateError.code,
        target: {
          email: maskEmail(invitation.email),
          invitationId: invitation.invitationId,
          workspaceId: invitation.workspaceId,
        },
        workspaceId: invitation.workspaceId,
      });

      return {
        error: invitationStateError,
        status: 'error',
      };
    }

    if (normalizeEmail(invitation.email) !== normalizeEmail(parsed.output.email)) {
      this.audit('auth.unauthorized_access_attempt', 'denied', {
        organizationId: invitation.organizationId,
        reason: 'INVITATION_EMAIL_MISMATCH',
        target: {
          email: maskEmail(parsed.output.email),
          invitationId: invitation.invitationId,
          workspaceId: invitation.workspaceId,
        },
        workspaceId: invitation.workspaceId,
      });

      return this.errorLoginOutcome(
        'INVITATION_EMAIL_MISMATCH',
        'Adres e-mail nie pasuje do zaproszenia.',
      );
    }

    let user = this.findUserByEmail(invitation.email);

    if (!user) {
      if (!parsed.output.password) {
        return this.errorLoginOutcome(
          'VALIDATION_ERROR',
          'Zaproszenie wymaga ustawienia hasła dla nowego konta.',
        );
      }

      user = {
        email: normalizeEmail(invitation.email),
        fullName: normalizeEmail(invitation.email).split('@')[0] ?? 'Zaproszony użytkownik',
        mfaEnabled: false,
        status: 'active',
        userId: this.nextUserId(),
      };
      this.users.push(user);
      await this.setPassword(user.userId, parsed.output.password);
    }

    if (this.hasActiveMembership(user.userId, invitation.organizationId, invitation.workspaceId)) {
      this.audit('auth.unauthorized_access_attempt', 'denied', {
        organizationId: invitation.organizationId,
        reason: 'MEMBERSHIP_CONFLICT',
        target: {
          email: maskEmail(invitation.email),
          invitationId: invitation.invitationId,
          userId: user.userId,
          workspaceId: invitation.workspaceId,
        },
        workspaceId: invitation.workspaceId,
      });

      return this.errorLoginOutcome(
        'MEMBERSHIP_CONFLICT',
        'To członkostwo już istnieje i wymaga osobnej decyzji.',
      );
    }

    this.memberships.push({
      membershipId: asMembershipId(this.nextId('mem')),
      organizationId: invitation.organizationId,
      role: invitation.requestedRole,
      status: 'active',
      userId: user.userId,
      workspaceId: invitation.workspaceId,
    });
    invitation.status = 'used';
    invitation.acceptedAt = now.toISOString();
    const session = this.createSession(user, false, {
      organizationId: invitation.organizationId,
      workspaceId: invitation.workspaceId,
    });
    const context = this.resolveContextForUser(user.userId, session);

    this.audit('auth.invitation_accepted', 'success', {
      actor: this.actorFromUser(user),
      organizationId: invitation.organizationId,
      target: {
        email: maskEmail(invitation.email),
        invitationId: invitation.invitationId,
        userId: user.userId,
        workspaceId: invitation.workspaceId,
      },
      workspaceId: invitation.workspaceId,
    });
    this.audit('auth.membership_changed', 'success', {
      actor: this.actorFromUser(user),
      organizationId: invitation.organizationId,
      target: {
        userId: user.userId,
        workspaceId: invitation.workspaceId,
      },
      workspaceId: invitation.workspaceId,
    });

    return {
      context,
      returnUrl: '/',
      session,
      status: 'authenticated',
      user,
    };
  }

  async authorizeOperation(
    sessionId: SessionId,
    capability: Capability,
    tenant: TenantContext,
  ): Promise<OperationResult<AccessDecision>> {
    const sessionResult = await this.restoreSession(sessionId);

    if (sessionResult.status !== 'active') {
      this.audit('auth.unauthorized_access_attempt', 'denied', {
        reason: 'UNAUTHENTICATED',
        target: { sessionId },
      });

      return {
        error: authError('UNAUTHENTICATED', 'Sesja nie jest aktywna.', true),
        status: 'error',
      };
    }

    const membership = this.findMembership(
      sessionResult.user.userId,
      tenant.organizationId,
      tenant.workspaceId,
    );

    if (!membership || membership.status !== 'active') {
      this.audit('auth.unauthorized_access_attempt', 'denied', {
        actor: this.actorFromUser(sessionResult.user),
        organizationId: tenant.organizationId,
        reason: 'FORBIDDEN',
        target: {
          sessionId,
          userId: sessionResult.user.userId,
          workspaceId: tenant.workspaceId,
        },
        workspaceId: tenant.workspaceId,
      });

      return {
        error: authError('FORBIDDEN', 'Brak aktywnego członkostwa.', false),
        status: 'error',
      };
    }

    const actor = this.actorFromMembership(sessionResult.user.userId, membership);
    const capabilities = actor.capabilities ?? [];

    if (!capabilities.includes(capability)) {
      this.audit('auth.unauthorized_access_attempt', 'denied', {
        actor,
        organizationId: tenant.organizationId,
        reason: 'FORBIDDEN',
        target: {
          sessionId,
          userId: sessionResult.user.userId,
          workspaceId: tenant.workspaceId,
        },
        workspaceId: tenant.workspaceId,
      });

      return {
        error: authError('FORBIDDEN', 'Brak wymaganej capability.', false),
        status: 'error',
      };
    }

    return {
      status: 'success',
      value: {
        allowed: true,
        capabilities,
        dataScope: actor.dataScope === 'none' || !actor.dataScope ? 'workspace' : actor.dataScope,
        reason: 'granted_by_policy',
      },
    };
  }

  async cancelInvitation(
    actor: ActorContext,
    invitationId: InvitationId,
  ): Promise<OperationResult<Invitation>> {
    const allowed = this.hasActorCapability(actor, 'auth:invitation:cancel');
    const invitation = this.findInvitation(invitationId);

    if (!allowed || !invitation) {
      this.audit('auth.unauthorized_access_attempt', 'denied', {
        actor,
        organizationId: actor.organizationId,
        reason: allowed ? 'INVITATION_INVALID' : 'FORBIDDEN',
        target: { invitationId, userId: actor.actorId },
        workspaceId: actor.workspaceId,
      });

      return {
        error: authError(
          allowed ? 'INVITATION_INVALID' : 'FORBIDDEN',
          'Nie można anulować zaproszenia.',
          false,
        ),
        status: 'error',
      };
    }

    invitation.status = 'cancelled';
    this.audit('auth.invitation_cancelled', 'success', {
      actor,
      organizationId: invitation.organizationId,
      target: {
        email: maskEmail(invitation.email),
        invitationId: invitation.invitationId,
      },
      workspaceId: invitation.workspaceId,
    });

    return { status: 'success', value: invitation };
  }

  async changePasswordAfterReauthentication(
    input: PasswordChangeInput,
  ): Promise<OperationResult<AuthUser>> {
    const parsed = validatePasswordChange(input);

    if (!parsed.success) {
      return {
        error: validationAuthError('Nie można zmienić hasła.'),
        status: 'error',
      };
    }

    const sessionResult = await this.requireReauthenticatedSession(
      parsed.output.sessionId as SessionId,
      'change_password',
    );

    if (sessionResult.status === 'error') {
      return sessionResult;
    }

    const user = sessionResult.value.user;
    const currentPasswordValid = await this.verifyPassword(
      user.userId,
      parsed.output.currentPassword,
    );

    if (!currentPasswordValid) {
      this.audit('auth.unauthorized_access_attempt', 'denied', {
        actor: this.actorFromUser(user),
        reason: 'INVALID_CREDENTIALS',
        target: {
          sessionId: parsed.output.sessionId as SessionId,
          userId: user.userId,
        },
      });

      return {
        error: authError('INVALID_CREDENTIALS', neutralLoginMessage, true),
        status: 'error',
      };
    }

    await this.setPassword(user.userId, parsed.output.newPassword);
    this.sessions
      .filter(
        (session) =>
          session.userId === user.userId &&
          session.sessionId !== sessionResult.value.session.sessionId,
      )
      .forEach((session) => {
        session.status = 'revoked';
      });
    this.audit('auth.password_changed', 'success', {
      actor: this.actorFromUser(user),
      target: {
        sessionId: sessionResult.value.session.sessionId,
        userId: user.userId,
      },
    });

    return { status: 'success', value: user };
  }

  async checkInvitationToken(
    input: InvitationCheckInput,
  ): Promise<OperationResult<Invitation>> {
    const invitationId = this.invitationTokenDigests.get(
      await digestOneTimeToken(input.token, 'invitation'),
    );
    const invitation = invitationId ? this.findInvitation(invitationId) : undefined;

    if (!invitation) {
      this.audit('auth.invitation_checked', 'failure', {
        reason: 'INVITATION_INVALID',
        target: { email: input.email ? maskEmail(input.email) : undefined },
      });

      return {
        error: authError('INVITATION_INVALID', 'Zaproszenie jest nieprawidłowe.', false),
        status: 'error',
      };
    }

    const stateError = this.invitationStateError(invitation, this.now());

    if (stateError) {
      this.audit('auth.invitation_checked', 'failure', {
        organizationId: invitation.organizationId,
        reason: stateError.code,
        target: {
          email: maskEmail(invitation.email),
          invitationId: invitation.invitationId,
          workspaceId: invitation.workspaceId,
        },
        workspaceId: invitation.workspaceId,
      });

      return {
        error: stateError,
        status: 'error',
      };
    }

    if (input.email && normalizeEmail(input.email) !== normalizeEmail(invitation.email)) {
      this.audit('auth.invitation_checked', 'denied', {
        organizationId: invitation.organizationId,
        reason: 'INVITATION_EMAIL_MISMATCH',
        target: {
          email: maskEmail(input.email),
          invitationId: invitation.invitationId,
          workspaceId: invitation.workspaceId,
        },
        workspaceId: invitation.workspaceId,
      });

      return {
        error: authError(
          'INVITATION_EMAIL_MISMATCH',
          'Adres e-mail nie pasuje do zaproszenia.',
          false,
        ),
        status: 'error',
      };
    }

    this.audit('auth.invitation_checked', 'success', {
      organizationId: invitation.organizationId,
      target: {
        email: maskEmail(invitation.email),
        invitationId: invitation.invitationId,
        workspaceId: invitation.workspaceId,
      },
      workspaceId: invitation.workspaceId,
    });

    return { status: 'success', value: invitation };
  }

  async configureMfa(
    sessionId: SessionId,
  ): Promise<OperationResult<readonly RecoveryCode[]>> {
    const sessionResult = await this.restoreSession(sessionId);

    if (sessionResult.status !== 'active') {
      return { error: sessionResult.error, status: 'error' };
    }

    const user = sessionResult.user;
    user.mfaEnabled = true;
    const codes = await this.replaceRecoveryCodes(user.userId);
    this.audit('auth.mfa_configured', 'success', {
      actor: this.actorFromUser(user),
      target: { userId: user.userId },
    });

    return { status: 'success', value: codes };
  }

  async createInvitation(
    actor: ActorContext,
    input: {
      email: string;
      organizationId: Invitation['organizationId'];
      requestedRole: Role;
      workspaceId: Invitation['workspaceId'];
    },
  ): Promise<OperationResult<Invitation>> {
    if (!this.hasActorCapability(actor, 'auth:invitation:create')) {
      this.audit('auth.unauthorized_access_attempt', 'denied', {
        actor,
        organizationId: input.organizationId,
        reason: 'FORBIDDEN',
        target: { email: maskEmail(input.email), userId: actor.actorId },
        workspaceId: input.workspaceId,
      });

      return {
        error: authError('FORBIDDEN', 'Brak uprawnienia do zaproszeń.', false),
        status: 'error',
      };
    }

    const workspace = this.findWorkspace(input.workspaceId);
    const organization = this.findOrganization(input.organizationId);

    if (!organization || !workspace) {
      return {
        error: authError(
          organization ? 'WORKSPACE_NOT_FOUND' : 'ORGANIZATION_NOT_FOUND',
          'Nie można odnaleźć wskazanego kontekstu.',
          false,
        ),
        status: 'error',
      };
    }

    const now = this.now();
    const invitation: Invitation = {
      createdBy: actor.actorId,
      email: normalizeEmail(input.email),
      expiresAt: addMs(now, this.policy.invitationTtlMs),
      invitationId: asInvitationId(this.nextId('inv')),
      organizationId: input.organizationId,
      requestedRole: input.requestedRole,
      status: 'active',
      tokenIssuedAt: now.toISOString(),
      workspaceId: input.workspaceId,
    };
    const token = this.nextToken('invite');
    this.invitations.push(invitation);
    this.invitationTokenDigests.set(
      await digestOneTimeToken(token, 'invitation'),
      invitation.invitationId,
    );
    this.testOutbox.push({
      channel: 'invitation',
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      invitationId: invitation.invitationId,
      token,
    });
    this.audit('auth.invitation_created', 'success', {
      actor,
      organizationId: input.organizationId,
      target: {
        email: maskEmail(invitation.email),
        invitationId: invitation.invitationId,
        workspaceId: invitation.workspaceId,
      },
      workspaceId: input.workspaceId,
    });

    return { status: 'success', value: invitation };
  }

  async disableMfa(sessionId: SessionId): Promise<OperationResult<AuthUser>> {
    const sessionResult = await this.requireReauthenticatedSession(
      sessionId,
      'disable_mfa',
    );

    if (sessionResult.status === 'error') {
      return sessionResult;
    }

    const user = sessionResult.value.user;
    user.mfaEnabled = false;
    this.recoveryCodeHashes.set(user.userId, []);
    this.audit('auth.mfa_disabled', 'success', {
      actor: this.actorFromUser(user),
      target: { userId: user.userId },
    });

    return { status: 'success', value: user };
  }

  async getActorContext(sessionId: SessionId): Promise<OperationResult<ActorContext>> {
    const sessionResult = await this.restoreSession(sessionId);

    if (sessionResult.status !== 'active') {
      return { error: sessionResult.error, status: 'error' };
    }

    const tenant = sessionResult.session.currentTenant;

    if (tenant) {
      const membership = this.findMembership(
        sessionResult.user.userId,
        tenant.organizationId,
        tenant.workspaceId,
      );

      if (membership?.status === 'active') {
        return {
          status: 'success',
          value: this.actorFromMembership(sessionResult.user.userId, membership),
        };
      }
    }

    return {
      status: 'success',
      value: this.actorFromUser(sessionResult.user),
    };
  }

  getAuditEvents(): readonly AuditEvent[] {
    return this.auditEvents.map((event) => ({ ...event }));
  }

  getTestOutbox(): readonly TestOutboxMessage[] {
    return this.testOutbox.map((message) => ({ ...message }));
  }

  async listSessions(
    sessionId: SessionId,
  ): Promise<OperationResult<readonly AuthSession[]>> {
    const sessionResult = await this.restoreSession(sessionId);

    if (sessionResult.status !== 'active') {
      return { error: sessionResult.error, status: 'error' };
    }

    return {
      status: 'success',
      value: this.sessions
        .filter(
          (session) =>
            session.userId === sessionResult.user.userId &&
            session.status !== 'expired',
        )
        .map((session) => ({ ...session })),
    };
  }

  async logout(
    sessionId: SessionId,
  ): Promise<OperationResult<{ redirectTo: string }>> {
    const session = this.findSession(sessionId);

    if (session && session.status !== 'revoked') {
      session.status = 'revoked';
      this.audit('auth.logout', 'success', {
        target: { sessionId, userId: session.userId },
      });
    }

    return {
      status: 'success',
      value: { redirectTo: '/auth/login' },
    };
  }

  async reauthenticate(
    input: ReauthenticationInput,
  ): Promise<OperationResult<ReauthenticationContext>> {
    const parsed = validateReauthentication(input);

    if (!parsed.success) {
      return { error: validationAuthError(), status: 'error' };
    }

    const sessionResult = await this.restoreSession(parsed.output.sessionId as SessionId);

    if (sessionResult.status !== 'active') {
      return { error: sessionResult.error, status: 'error' };
    }

    const validPassword = await this.verifyPassword(
      sessionResult.user.userId,
      parsed.output.password,
    );

    if (!validPassword) {
      this.audit('auth.unauthorized_access_attempt', 'denied', {
        actor: this.actorFromUser(sessionResult.user),
        reason: 'INVALID_CREDENTIALS',
        target: {
          sessionId: parsed.output.sessionId as SessionId,
          userId: sessionResult.user.userId,
        },
      });

      return {
        error: authError('INVALID_CREDENTIALS', neutralLoginMessage, true),
        status: 'error',
      };
    }

    const expiresAt = addMs(this.now(), this.policy.reauthenticationTtlMs);
    sessionResult.session.reauthenticatedUntil = expiresAt;
    this.audit('auth.reauthentication_completed', 'success', {
      actor: this.actorFromUser(sessionResult.user),
      target: {
        sessionId: sessionResult.session.sessionId,
        userId: sessionResult.user.userId,
      },
    });

    return {
      status: 'success',
      value: {
        expiresAt,
        purpose: parsed.output.purpose,
        sessionId: sessionResult.session.sessionId,
        userId: sessionResult.user.userId,
      },
    };
  }

  async refreshSession(sessionId: SessionId): Promise<SessionResult> {
    const session = this.findSession(sessionId);

    if (!session) {
      this.audit('auth.refresh_failed', 'failure', {
        reason: 'SESSION_NOT_FOUND',
        target: { sessionId },
      });

      return {
        error: authError('SESSION_NOT_FOUND', 'Sesja nie istnieje.', true),
        status: 'missing',
      };
    }

    if (session.status === 'revoked') {
      this.audit('auth.refresh_reuse_detected', 'failure', {
        reason: 'REFRESH_REUSE_DETECTED',
        target: { sessionId, userId: session.userId },
      });

      return {
        error: authError(
          'REFRESH_REUSE_DETECTED',
          'Sesja została unieważniona i wymaga ponownego logowania.',
          false,
        ),
        status: 'revoked',
      };
    }

    const user = this.findUser(session.userId);

    if (!user) {
      return {
        error: authError('SESSION_NOT_FOUND', 'Użytkownik sesji nie istnieje.', false),
        status: 'missing',
      };
    }

    if (this.sessionExpired(session)) {
      session.status = 'expired';
      this.audit('auth.refresh_failed', 'failure', {
        reason: 'SESSION_EXPIRED',
        target: { sessionId, userId: session.userId },
      });

      return {
        error: authError('SESSION_EXPIRED', 'Sesja wygasła.', true),
        status: 'expired',
      };
    }

    session.status = 'revoked';
    const refreshed = this.createSession(user, session.mfaSatisfied, session.currentTenant);
    this.audit('auth.login_succeeded', 'success', {
      actor: this.actorFromUser(user),
      target: {
        sessionId: refreshed.sessionId,
        userId: user.userId,
      },
    });

    return {
      context: this.resolveContextForUser(user.userId, refreshed),
      session: refreshed,
      status: 'active',
      user,
    };
  }

  async regenerateRecoveryCodes(
    sessionId: SessionId,
  ): Promise<OperationResult<readonly RecoveryCode[]>> {
    const sessionResult = await this.requireReauthenticatedSession(
      sessionId,
      'regenerate_recovery_codes',
    );

    if (sessionResult.status === 'error') {
      return sessionResult;
    }

    const codes = await this.replaceRecoveryCodes(sessionResult.value.user.userId);
    this.audit('auth.mfa_recovery_codes_regenerated', 'success', {
      actor: this.actorFromUser(sessionResult.value.user),
      target: {
        sessionId,
        userId: sessionResult.value.user.userId,
      },
    });

    return { status: 'success', value: codes };
  }

  async requestPasswordReset(
    input: PasswordResetStartInput,
  ): Promise<OperationResult<{ neutralMessage: string }>> {
    const parsed = validatePasswordResetStart(input);

    if (!parsed.success) {
      return { error: validationAuthError(), status: 'error' };
    }

    const email = normalizeEmail(parsed.output.email);
    const user = this.findUserByEmail(email);

    if (user && user.status !== 'blocked') {
      const now = this.now();
      const passwordReset: PasswordResetRequest = {
        email,
        expiresAt: addMs(now, this.policy.passwordResetTtlMs),
        passwordResetId: asPasswordResetId(this.nextId('rst')),
        status: 'active',
        userId: user.userId,
      };
      const token = this.nextToken('reset');
      this.passwordResets.push(passwordReset);
      this.passwordResetTokenDigests.set(
        await digestOneTimeToken(token, 'password_reset'),
        passwordReset.passwordResetId,
      );
      this.testOutbox.push({
        channel: 'password_reset',
        email,
        expiresAt: passwordReset.expiresAt,
        token,
      });
    }

    this.audit('auth.password_reset_requested', 'success', {
      reason: user ? undefined : 'INVALID_CREDENTIALS',
      target: { email: maskEmail(email), userId: user?.userId },
    });

    return {
      status: 'success',
      value: { neutralMessage: neutralResetMessage },
    };
  }

  async resetPassword(
    input: PasswordResetConfirmInput,
  ): Promise<OperationResult<AuthUser>> {
    const parsed = validatePasswordResetConfirm(input);

    if (!parsed.success) {
      return {
        error: validationAuthError('Nie można ustawić tego hasła.'),
        status: 'error',
      };
    }

    const resetId = this.passwordResetTokenDigests.get(
      await digestOneTimeToken(parsed.output.token, 'password_reset'),
    );
    const reset = resetId ? this.findPasswordReset(resetId) : undefined;

    if (!reset) {
      return {
        error: authError('RESET_TOKEN_INVALID', 'Link resetu jest nieprawidłowy.', false),
        status: 'error',
      };
    }

    if (reset.status === 'used') {
      return {
        error: authError('RESET_TOKEN_USED', 'Link resetu został już wykorzystany.', false),
        status: 'error',
      };
    }

    if (reset.status === 'expired' || isPast(reset.expiresAt, this.now())) {
      reset.status = 'expired';
      return {
        error: authError('RESET_TOKEN_EXPIRED', 'Link resetu wygasł.', true),
        status: 'error',
      };
    }

    const user = this.findUser(reset.userId);

    if (!user) {
      return {
        error: authError('RESET_TOKEN_INVALID', 'Link resetu jest nieprawidłowy.', false),
        status: 'error',
      };
    }

    await this.setPassword(user.userId, parsed.output.newPassword);
    user.status = 'active';
    reset.status = 'used';
    this.sessions
      .filter((session) => session.userId === user.userId)
      .forEach((session) => {
        session.status = 'revoked';
      });
    this.audit('auth.password_reset_completed', 'success', {
      actor: this.actorFromUser(user),
      target: { userId: user.userId },
    });

    return { status: 'success', value: user };
  }

  async resendInvitation(
    actor: ActorContext,
    invitationId: InvitationId,
  ): Promise<OperationResult<Invitation>> {
    const invitation = this.findInvitation(invitationId);

    if (!this.hasActorCapability(actor, 'auth:invitation:resend') || !invitation) {
      this.audit('auth.unauthorized_access_attempt', 'denied', {
        actor,
        organizationId: actor.organizationId,
        reason: invitation ? 'FORBIDDEN' : 'INVITATION_INVALID',
        target: { invitationId, userId: actor.actorId },
        workspaceId: actor.workspaceId,
      });

      return {
        error: authError('FORBIDDEN', 'Nie można ponowić zaproszenia.', false),
        status: 'error',
      };
    }

    const now = this.now();
    invitation.status = 'active';
    invitation.expiresAt = addMs(now, this.policy.invitationTtlMs);
    invitation.tokenIssuedAt = now.toISOString();
    for (const [tokenDigest, id] of this.invitationTokenDigests.entries()) {
      if (id === invitationId) {
        this.invitationTokenDigests.delete(tokenDigest);
      }
    }
    const token = this.nextToken('invite');
    this.invitationTokenDigests.set(
      await digestOneTimeToken(token, 'invitation'),
      invitation.invitationId,
    );
    this.testOutbox.push({
      channel: 'invitation',
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      invitationId: invitation.invitationId,
      token,
    });
    this.audit('auth.invitation_resent', 'success', {
      actor,
      organizationId: invitation.organizationId,
      target: {
        email: maskEmail(invitation.email),
        invitationId,
        workspaceId: invitation.workspaceId,
      },
      workspaceId: invitation.workspaceId,
    });

    return { status: 'success', value: invitation };
  }

  async restoreSession(sessionId: SessionId): Promise<SessionResult> {
    const session = this.findSession(sessionId);

    if (!session) {
      return {
        error: authError('SESSION_NOT_FOUND', 'Sesja nie istnieje.', true),
        status: 'missing',
      };
    }

    if (session.status === 'revoked') {
      return {
        error: authError('SESSION_REVOKED', 'Sesja została unieważniona.', true),
        status: 'revoked',
      };
    }

    if (this.sessionExpired(session)) {
      session.status = 'expired';
      this.audit('auth.session_expired', 'success', {
        target: { sessionId, userId: session.userId },
      });

      return {
        error: authError('SESSION_EXPIRED', 'Sesja wygasła.', true),
        status: 'expired',
      };
    }

    const user = this.findUser(session.userId);

    if (!user) {
      return {
        error: authError('SESSION_NOT_FOUND', 'Użytkownik sesji nie istnieje.', false),
        status: 'missing',
      };
    }

    session.lastActivityAt = this.now().toISOString();

    return {
      context: this.resolveContextForUser(user.userId, session),
      session,
      status: 'active',
      user,
    };
  }

  async revokeOtherSessions(
    sessionId: SessionId,
  ): Promise<OperationResult<readonly AuthSession[]>> {
    const sessionResult = await this.requireReauthenticatedSession(
      sessionId,
      'revoke_session',
    );

    if (sessionResult.status === 'error') {
      return sessionResult;
    }

    const userId = sessionResult.value.user.userId;
    const revoked: AuthSession[] = [];

    for (const session of this.sessions) {
      if (session.userId === userId && session.sessionId !== sessionId) {
        session.status = 'revoked';
        revoked.push({ ...session });
      }
    }

    this.audit('auth.session_revoked', 'success', {
      actor: this.actorFromUser(sessionResult.value.user),
      target: { sessionId, userId },
    });

    return { status: 'success', value: revoked };
  }

  async revokeSession(
    sessionId: SessionId,
    targetSessionId: SessionId,
  ): Promise<OperationResult<AuthSession>> {
    if (sessionId !== targetSessionId) {
      const reauthResult = await this.requireReauthenticatedSession(
        sessionId,
        'revoke_session',
      );

      if (reauthResult.status === 'error') {
        return reauthResult;
      }
    }

    const sessionResult = await this.restoreSession(sessionId);
    const target = this.findSession(targetSessionId);

    if (sessionResult.status !== 'active') {
      return { error: sessionResult.error, status: 'error' };
    }

    if (!target || target.userId !== sessionResult.user.userId) {
      return {
        error: authError('SESSION_NOT_FOUND', 'Nie znaleziono sesji.', false),
        status: 'error',
      };
    }

    target.status = 'revoked';
    this.audit('auth.session_revoked', 'success', {
      actor: this.actorFromUser(sessionResult.user),
      target: {
        sessionId: target.sessionId,
        userId: target.userId,
      },
    });

    return { status: 'success', value: target };
  }

  async selectWorkspace(
    sessionId: SessionId,
    tenant: TenantContext,
  ): Promise<OperationResult<PostLoginContextResolution>> {
    const sessionResult = await this.restoreSession(sessionId);

    if (sessionResult.status !== 'active') {
      return { error: sessionResult.error, status: 'error' };
    }

    const membership = this.findMembership(
      sessionResult.user.userId,
      tenant.organizationId,
      tenant.workspaceId,
    );

    if (!membership || membership.status !== 'active') {
      return {
        error: authError('NO_ACTIVE_MEMBERSHIP', 'Brak aktywnego membershipu.', false),
        status: 'error',
      };
    }

    sessionResult.session.currentTenant = tenant;
    const context = this.resolveContextForUser(
      sessionResult.user.userId,
      sessionResult.session,
    );
    this.audit('auth.workspace_changed', 'success', {
      actor: this.actorFromUser(sessionResult.user),
      organizationId: tenant.organizationId,
      target: {
        sessionId,
        userId: sessionResult.user.userId,
        workspaceId: tenant.workspaceId,
      },
      workspaceId: tenant.workspaceId,
    });

    return { status: 'success', value: context };
  }

  async signIn(input: LoginInput): Promise<LoginOutcome> {
    const parsed = validateLoginInput(input);

    if (!parsed.success) {
      return {
        error: validationAuthError('Nie można użyć tych danych logowania.'),
        status: 'error',
      };
    }

    const email = normalizeEmail(parsed.output.email);
    const user = this.findUserByEmail(email);
    const validPassword = user
      ? await this.verifyPassword(user.userId, parsed.output.password)
      : false;

    if (!user || !validPassword) {
      this.audit('auth.login_failed', 'failure', {
        reason: 'INVALID_CREDENTIALS',
        target: { email: maskEmail(email) },
      });

      return {
        error: authError('INVALID_CREDENTIALS', neutralLoginMessage, true),
        status: 'error',
      };
    }

    if (user.status === 'blocked') {
      this.audit('auth.login_failed', 'denied', {
        reason: 'ACCOUNT_BLOCKED',
        target: { email: maskEmail(email), userId: user.userId },
      });

      return {
        error: authError(
          'ACCOUNT_BLOCKED',
          'Dostęp wymaga wyjaśnienia bez ujawniania przyczyny publicznie.',
          false,
        ),
        status: 'blocked',
      };
    }

    if (user.status === 'password_change_required') {
      return {
        status: 'password_change_required',
        user,
      };
    }

    if (user.status === 'password_reset_required') {
      return {
        status: 'password_reset_required',
        user,
      };
    }

    if (user.mfaEnabled) {
      const challenge = this.createMfaChallenge(user.userId);
      return {
        challenge,
        status: 'mfa_required',
        user,
      };
    }

    const session = this.createSession(user, false);
    const context = this.resolveContextForUser(user.userId, session);
    this.audit('auth.login_succeeded', 'success', {
      actor: this.actorFromUser(user),
      target: { sessionId: session.sessionId, userId: user.userId },
    });

    return {
      context,
      returnUrl: sanitizeReturnUrl(parsed.output.returnUrl),
      session,
      status: 'authenticated',
      user,
    };
  }

  async validatePasswordResetToken(
    input: PasswordResetValidateInput,
  ): Promise<OperationResult<PasswordResetRequest>> {
    const parsed = validatePasswordResetToken(input);

    if (!parsed.success) {
      return {
        error: validationAuthError('Link resetu jest nieprawidłowy.'),
        status: 'error',
      };
    }

    const resetId = this.passwordResetTokenDigests.get(
      await digestOneTimeToken(parsed.output.token, 'password_reset'),
    );
    const reset = resetId ? this.findPasswordReset(resetId) : undefined;

    if (!reset) {
      this.audit('auth.password_reset_token_checked', 'failure', {
        reason: 'RESET_TOKEN_INVALID',
      });

      return {
        error: authError('RESET_TOKEN_INVALID', 'Link resetu jest nieprawidłowy.', false),
        status: 'error',
      };
    }

    if (reset.status === 'used') {
      this.audit('auth.password_reset_token_checked', 'failure', {
        reason: 'RESET_TOKEN_USED',
        target: { userId: reset.userId },
      });

      return {
        error: authError('RESET_TOKEN_USED', 'Link resetu został już wykorzystany.', false),
        status: 'error',
      };
    }

    if (reset.status === 'expired' || isPast(reset.expiresAt, this.now())) {
      reset.status = 'expired';
      this.audit('auth.password_reset_token_checked', 'failure', {
        reason: 'RESET_TOKEN_EXPIRED',
        target: { userId: reset.userId },
      });

      return {
        error: authError('RESET_TOKEN_EXPIRED', 'Link resetu wygasł.', true),
        status: 'error',
      };
    }

    this.audit('auth.password_reset_token_checked', 'success', {
      target: { userId: reset.userId },
    });

    return { status: 'success', value: reset };
  }

  async validateReauthenticationContext(
    input: ReauthenticationValidationInput,
  ): Promise<OperationResult<ReauthenticationContext>> {
    const sessionResult = await this.restoreSession(input.sessionId);

    if (sessionResult.status !== 'active') {
      return { error: sessionResult.error, status: 'error' };
    }

    if (
      !sessionResult.session.reauthenticatedUntil ||
      isPast(sessionResult.session.reauthenticatedUntil, this.now())
    ) {
      return {
        error: authError(
          'REAUTHENTICATION_EXPIRED',
          'Potwierdzenie operacji wrażliwej wygasło.',
          true,
        ),
        status: 'error',
      };
    }

    return {
      status: 'success',
      value: {
        expiresAt: sessionResult.session.reauthenticatedUntil,
        purpose: input.purpose,
        sessionId: sessionResult.session.sessionId,
        userId: sessionResult.user.userId,
      },
    };
  }

  async verifyMfaChallenge(input: MfaChallengeInput): Promise<LoginOutcome> {
    const challenge = this.findChallenge(input.challengeId);
    const now = this.now();

    if (!challenge) {
      return this.errorLoginOutcome('MFA_INVALID', 'Kod nie może zostać potwierdzony.');
    }

    const user = this.findUser(challenge.userId);

    if (!user) {
      return this.errorLoginOutcome('MFA_INVALID', 'Kod nie może zostać potwierdzony.');
    }

    if (challenge.status === 'retry_limited' || challenge.attempts >= this.policy.maxMfaAttempts) {
      challenge.status = 'retry_limited';

      return this.errorLoginOutcome(
        'MFA_RETRY_LIMITED',
        'Limit prób został osiągnięty. Rozpocznij proces ponownie.',
      );
    }

    if (challenge.status !== 'active' || isPast(challenge.expiresAt, now)) {
      challenge.status = 'expired';

      return this.errorLoginOutcome('MFA_EXPIRED', 'Kod MFA wygasł.');
    }

    const codeIsValid = constantTimeEqual(input.code, '123456');
    const recoveryCode = codeIsValid
      ? undefined
      : await this.findMatchingRecoveryCode(user.userId, input.code);

    if (!codeIsValid && !recoveryCode) {
      challenge.attempts += 1;
      this.audit('auth.mfa_failed', 'failure', {
        actor: this.actorFromUser(user),
        reason: 'MFA_INVALID',
        target: { userId: user.userId },
      });

      return this.errorLoginOutcome('MFA_INVALID', 'Kod MFA jest nieprawidłowy.');
    }

    if (recoveryCode) {
      recoveryCode.state = 'used';
      recoveryCode.usedAt = now.toISOString();
      this.audit('auth.mfa_recovery_code_used', 'success', {
        actor: this.actorFromUser(user),
        target: { userId: user.userId },
      });
    }

    challenge.status = 'verified';
    const session = this.createSession(user, true);
    this.audit('auth.login_succeeded', 'success', {
      actor: this.actorFromUser(user),
      target: { sessionId: session.sessionId, userId: user.userId },
    });

    return {
      context: this.resolveContextForUser(user.userId, session),
      returnUrl: '/',
      session,
      status: 'authenticated',
      user,
    };
  }

  private actorFromMembership(userId: UserId, membership: Membership): ActorContext {
    return {
      actorId: userId,
      capabilities: this.capabilitiesForFixtureRole(membership.role),
      dataScope: 'workspace',
      organizationId: membership.organizationId,
      roles: [membership.role],
      workspaceId: membership.workspaceId,
    };
  }

  private actorFromUser(user: AuthUser): ActorContext {
    const membership = this.memberships.find(
      (candidate) => candidate.userId === user.userId && candidate.status === 'active',
    );

    if (membership) {
      return this.actorFromMembership(user.userId, membership);
    }

    return {
      actorId: user.userId,
      capabilities: [],
      dataScope: 'none',
      organizationId: this.organizations[0]?.organizationId ?? localAuthOrganizations[0].organizationId,
      roles: [],
      workspaceId: this.workspaces[0]?.workspaceId ?? localAuthWorkspaces[0].workspaceId,
    };
  }

  private audit(
    eventType: AuditEvent['eventType'],
    result: AuditEvent['result'],
    details: Partial<Omit<AuditEvent, 'auditEventId' | 'correlationId' | 'eventType' | 'occurredAt' | 'result' | 'source'>>,
  ): void {
    this.auditEvents.push({
      auditEventId: asAuditEventId(this.nextId('aud')),
      correlationId: asCorrelationId(this.nextId('corr')),
      eventType,
      occurredAt: this.now().toISOString(),
      result,
      source: 'local_auth_adapter',
      ...details,
    });
  }

  private capabilitiesForFixtureRole(role: Role): readonly Capability[] {
    if (role === 'organization_owner' || role === 'workspace_admin') {
      return [
        'auth:invitation:create' as Capability,
        'auth:invitation:resend' as Capability,
        'auth:invitation:cancel' as Capability,
        'auth:session:list' as Capability,
        'auth:session:revoke' as Capability,
        'auth:reauthenticate' as Capability,
      ];
    }

    return [];
  }

  private createMfaChallenge(userId: UserId): MfaChallenge {
    const challenge: MfaChallenge = {
      attempts: 0,
      challengeId: asAuthChallengeId(this.nextId('mfa')),
      expiresAt: addMs(this.now(), this.policy.mfaChallengeTtlMs),
      method: 'totp_dev',
      status: 'active',
      userId,
    };
    this.challenges.push(challenge);
    return challenge;
  }

  private createSession(
    user: AuthUser,
    mfaSatisfied: boolean,
    tenant?: TenantContext,
  ): AuthSession {
    const now = this.now();
    const session: AuthSession = {
      clientLabel: 'Local test client',
      createdAt: now.toISOString(),
      currentTenant: tenant,
      expiresAt: addMs(now, this.policy.sessionTtlMs),
      idleExpiresAt: addMs(now, this.policy.idleSessionTtlMs),
      lastActivityAt: now.toISOString(),
      mfaSatisfied,
      sessionId: asSessionId(this.nextId('ses')),
      status: 'active',
      userId: user.userId,
    };
    this.sessions.push(session);
    return session;
  }

  private errorLoginOutcome(code: AuthErrorCode, message: string): LoginOutcome {
    return {
      error: authError(code, message, code !== 'FORBIDDEN'),
      status: 'error',
    };
  }

  private async findMatchingRecoveryCode(
    userId: UserId,
    codeValue: string,
  ): Promise<StoredRecoveryCode | undefined> {
    const codes = this.recoveryCodeHashes.get(userId) ?? [];

    for (const code of codes) {
      if (code.state !== 'available') {
        continue;
      }

      const hash = await deriveHash(codeValue, `local-recovery:${code.codeId}`);

      if (constantTimeEqual(hash, code.hash)) {
        return code;
      }
    }

    return undefined;
  }

  private findChallenge(challengeId: AuthChallengeId): MfaChallenge | undefined {
    return this.challenges.find((challenge) => challenge.challengeId === challengeId);
  }

  private findInvitation(invitationId: InvitationId): Invitation | undefined {
    return this.invitations.find((invitation) => invitation.invitationId === invitationId);
  }

  private findMembership(
    userId: UserId,
    organizationId: TenantContext['organizationId'],
    workspaceId: TenantContext['workspaceId'],
  ): Membership | undefined {
    return this.memberships.find(
      (membership) =>
        membership.userId === userId &&
        membership.organizationId === organizationId &&
        membership.workspaceId === workspaceId,
    );
  }

  private findOrganization(
    organizationId: TenantContext['organizationId'],
  ): Organization | undefined {
    return this.organizations.find(
      (organization) => organization.organizationId === organizationId,
    );
  }

  private findPasswordReset(
    passwordResetId: PasswordResetRequest['passwordResetId'],
  ): PasswordResetRequest | undefined {
    return this.passwordResets.find(
      (reset) => reset.passwordResetId === passwordResetId,
    );
  }

  private findSession(sessionId: SessionId): AuthSession | undefined {
    return this.sessions.find((session) => session.sessionId === sessionId);
  }

  private findUser(userId: UserId): AuthUser | undefined {
    return this.users.find((user) => user.userId === userId);
  }

  private findUserByEmail(email: string): AuthUser | undefined {
    const normalized = normalizeEmail(email);
    return this.users.find((user) => normalizeEmail(user.email) === normalized);
  }

  private findWorkspace(workspaceId: TenantContext['workspaceId']): Workspace | undefined {
    return this.workspaces.find((workspace) => workspace.workspaceId === workspaceId);
  }

  private hasActiveMembership(
    userId: UserId,
    organizationId: TenantContext['organizationId'],
    workspaceId: TenantContext['workspaceId'],
  ): boolean {
    return Boolean(
      this.findMembership(userId, organizationId, workspaceId)?.status === 'active',
    );
  }

  private hasActorCapability(actor: ActorContext, capability: string): boolean {
    return (actor.capabilities ?? []).some(
      (candidate) => candidate === (capability as Capability),
    );
  }

  private invitationStateError(invitation: Invitation, now: Date): AuthError | undefined {
    if (invitation.status === 'cancelled') {
      return authError('INVITATION_CANCELLED', 'Zaproszenie zostało anulowane.', false);
    }

    if (invitation.status === 'used') {
      return authError('INVITATION_USED', 'Zaproszenie zostało już wykorzystane.', false);
    }

    if (invitation.status === 'expired' || isPast(invitation.expiresAt, now)) {
      invitation.status = 'expired';
      return authError('INVITATION_EXPIRED', 'Zaproszenie wygasło.', true);
    }

    return undefined;
  }

  private nextId(prefix: string): string {
    this.sequence += 1;
    return `${prefix}_${this.sequence.toString().padStart(4, '0')}`;
  }

  private nextToken(prefix: string): string {
    return `${prefix}-${this.nextId('tok')}-${toTimestamp(this.now())}-${secureRandomHex(24)}`;
  }

  private nextUserId(): UserId {
    return asUserId(this.nextId('usr'));
  }

  private async replaceRecoveryCodes(userId: UserId): Promise<readonly RecoveryCode[]> {
    const values = ['414141', '525252', '636363', '747474', '858585'];
    const codes: StoredRecoveryCode[] = [];

    for (const [index, value] of values.entries()) {
      const codeId = `rc_${userId}_${index + 1}`;
      codes.push({
        codeId,
        hash: await deriveHash(value, `local-recovery:${codeId}`),
        state: 'available',
      });
    }

    this.recoveryCodeHashes.set(userId, codes);

    return codes.map(({ codeId, state, usedAt }) => ({
      codeId,
      state,
      usedAt,
    }));
  }

  private async requireReauthenticatedSession(
    sessionId: SessionId,
    purpose: ReauthenticationInput['purpose'],
  ): Promise<OperationResult<{ session: AuthSession; user: AuthUser }>> {
    const sessionResult = await this.restoreSession(sessionId);

    if (sessionResult.status !== 'active') {
      return { error: sessionResult.error, status: 'error' };
    }

    if (
      !sessionResult.session.reauthenticatedUntil ||
      isPast(sessionResult.session.reauthenticatedUntil, this.now())
    ) {
      return {
        error: authError(
          'REAUTHENTICATION_REQUIRED',
          `Operacja ${purpose} wymaga ponownego potwierdzenia.`,
          true,
        ),
        status: 'error',
      };
    }

    return {
      status: 'success',
      value: {
        session: sessionResult.session,
        user: sessionResult.user,
      },
    };
  }

  private resolveContextForUser(
    userId: UserId,
    session?: AuthSession,
  ): PostLoginContextResolution {
    const activeMemberships = this.memberships.filter(
      (membership) => membership.userId === userId && membership.status === 'active',
    );

    if (activeMemberships.length === 0) {
      return {
        error: authError(
          'NO_ACTIVE_MEMBERSHIP',
          'Konto nie ma aktywnego membershipu.',
          false,
        ),
        status: 'no_active_membership',
      };
    }

    if (session?.currentTenant) {
      const selectedMembership = this.findMembership(
        userId,
        session.currentTenant.organizationId,
        session.currentTenant.workspaceId,
      );

      if (selectedMembership?.status === 'active') {
        return this.resolveWorkspaceState(selectedMembership);
      }
    }

    const organizationIds = new Set(
      activeMemberships.map((membership) => membership.organizationId),
    );

    if (organizationIds.size > 1) {
      return {
        organizations: this.organizations.filter((organization) =>
          organizationIds.has(organization.organizationId),
        ),
        status: 'organization_selection_required',
      };
    }

    const [organizationId] = organizationIds;
    const workspaces = activeMemberships
      .filter((membership) => membership.organizationId === organizationId)
      .map((membership) => this.findWorkspace(membership.workspaceId))
      .filter((workspace): workspace is Workspace => Boolean(workspace));

    if (workspaces.length > 1) {
      const organization = this.findOrganization(organizationId);

      if (organization) {
        return {
          organization,
          status: 'workspace_selection_required',
          workspaces,
        };
      }
    }

    const [membership] = activeMemberships;
    return this.resolveWorkspaceState(membership);
  }

  private resolveWorkspaceState(membership: Membership): PostLoginContextResolution {
    const workspace = this.findWorkspace(membership.workspaceId);
    const organization = this.findOrganization(membership.organizationId);

    if (!workspace || !organization) {
      return {
        error: authError('WORKSPACE_NOT_FOUND', 'Workspace nie istnieje.', false),
        status: 'no_active_membership',
      };
    }

    if (workspace.status === 'not_ready') {
      return {
        error: authError('WORKSPACE_NOT_READY', 'Workspace nie jest gotowy.', true),
        organization,
        status: 'workspace_not_ready',
        workspace,
      };
    }

    if (workspace.status === 'blocked') {
      return {
        error: authError('WORKSPACE_BLOCKED', 'Workspace jest zablokowany.', false),
        organization,
        status: 'workspace_blocked',
        workspace,
      };
    }

    if (workspace.status === 'no_data') {
      return {
        error: authError('WORKSPACE_NO_DATA', 'Workspace nie ma jeszcze danych.', true),
        organization,
        status: 'workspace_no_data',
        workspace,
      };
    }

    return {
      organization,
      status: 'workspace_selected',
      tenant: {
        organizationId: workspace.organizationId,
        workspaceId: workspace.workspaceId,
      },
      workspace,
    };
  }

  private async setPassword(userId: UserId, password: string): Promise<void> {
    const salt = `local-auth:${userId}`;
    this.credentials.set(userId, {
      hash: await deriveHash(password, salt),
      salt,
    });
  }

  private sessionExpired(session: AuthSession): boolean {
    const now = this.now();
    return isPast(session.expiresAt, now) || isPast(session.idleExpiresAt, now);
  }

  private async verifyPassword(userId: UserId, password: string): Promise<boolean> {
    const credential = this.credentials.get(userId);

    if (!credential) {
      return false;
    }

    const hash = await deriveHash(password, credential.salt);
    return constantTimeEqual(hash, credential.hash);
  }
}

export { defaultPolicy as localAuthDefaultPolicy };
export { denyByDefaultAccessDecision };
