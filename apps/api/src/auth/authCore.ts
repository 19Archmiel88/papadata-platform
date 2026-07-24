import type { IsoDateTime, OperationId } from "@papadata/contracts";

export const AUTH_CONTRACT_VERSION = "domain-contracts.v1";
export const AUTH_API_BASE_PATH = "/v1";

export const AUTH_BASE_PATH = `${AUTH_API_BASE_PATH}/auth`;

export const authCookieNames = {
  csrf: "pd_csrf",
  refreshToken: "pd_refresh",
  sessionId: "pd_session",
} as const;

export const csrfHeaderName = "x-papadata-csrf";

export const authEventTypes = [
  "auth.audit_read",
  "auth.csrf_rejected",
  "auth.email_verification_requested",
  "auth.email_verified",
  "auth.lockout_started",
  "auth.login_failed",
  "auth.login_succeeded",
  "auth.logout",
  "auth.mfa_challenge_created",
  "auth.mfa_recovery_code_used",
  "auth.mfa_verified",
  "auth.password_changed",
  "auth.password_reset_completed",
  "auth.password_reset_requested",
  "auth.rate_limited",
  "auth.refresh_reuse_detected",
  "auth.refresh_rotated",
  "auth.registered",
  "auth.session_revoked",
] as const;

export type AuthEventType = (typeof authEventTypes)[number];

export type AuthErrorCode =
  | "ACCOUNT_LOCKED"
  | "CAPABILITY_REQUIRED"
  | "CSRF_INVALID"
  | "EMAIL_NOT_VERIFIED"
  | "FORBIDDEN"
  | "INVALID_CREDENTIALS"
  | "INVALID_OTP"
  | "INVALID_RECOVERY_CODE"
  | "INVALID_RESET_TOKEN"
  | "INVITATION_EMAIL_MISMATCH"
  | "INVITATION_EXPIRED"
  | "INVITATION_REVOKED"
  | "INVITATION_USED"
  | "MFA_REQUIRED"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "SESSION_EXPIRED"
  | "SESSION_REVOKED"
  | "TENANT_BLOCKED"
  | "TOKEN_REUSE_DETECTED"
  | "UNAUTHENTICATED"
  | "VALIDATION_FAILED"
  | "WORKSPACE_BLOCKED"
  | "WORKSPACE_TENANT_MISMATCH";

export type AuthUserStatus = "active" | "locked";

export type AuthUserRecord = {
  readonly createdAt: IsoDateTime;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly failedLoginCount: number;
  readonly fullName: string;
  readonly lockedUntil: IsoDateTime | null;
  readonly mfaEnabled: boolean;
  readonly passwordHash: SecretHash;
  readonly recoveryCodes: readonly RecoveryCodeRecord[];
  readonly status: AuthUserStatus;
  readonly updatedAt: IsoDateTime;
  readonly userId: string;
};

export type RecoveryCodeRecord = {
  readonly codeId: string;
  readonly codeHash: SecretHash;
  readonly usedAt: IsoDateTime | null;
};

export type AuthSessionRecord = {
  readonly activeTenantId?: string;
  readonly activeWorkspaceId?: string;
  readonly authStrength: "mfa" | "password";
  readonly createdAt: IsoDateTime;
  readonly csrfTokenHash: SecretHash;
  readonly expiresAt: IsoDateTime;
  readonly lastSeenAt: IsoDateTime;
  readonly mfaVerified: boolean;
  readonly refreshTokenHash: SecretHash;
  readonly revokedAt: IsoDateTime | null;
  readonly sessionId: string;
  readonly userAgent: string;
  readonly userId: string;
};

export type AuthChallengePurpose =
  | "email_verification"
  | "mfa"
  | "password_reset";

export type AuthChallengeRecord = {
  readonly attempts: number;
  readonly challengeId: string;
  readonly consumedAt: IsoDateTime | null;
  readonly createdAt: IsoDateTime;
  readonly email: string;
  readonly expiresAt: IsoDateTime;
  readonly otpHash: SecretHash;
  readonly purpose: AuthChallengePurpose;
  readonly userId: string;
};

export type PasswordResetRecord = {
  readonly challengeId: string;
  readonly createdAt: IsoDateTime;
  readonly expiresAt: IsoDateTime;
  readonly resetId: string;
  readonly tokenHash: SecretHash;
  readonly usedAt: IsoDateTime | null;
  readonly userId: string;
};

export type EmailOutboxMessage = {
  readonly createdAt: IsoDateTime;
  readonly email: string;
  readonly messageId: string;
  readonly purpose: AuthChallengePurpose;
  readonly tokenPreview?: string;
  readonly otpPreview?: string;
};

export type AuditEvent = {
  readonly actorUserId: string | null;
  readonly auditEventId: string;
  readonly correlationId: string;
  readonly eventType: AuthEventType;
  readonly occurredAt: IsoDateTime;
  readonly operationId: OperationId;
  readonly result: "denied" | "failure" | "success";
  readonly target: {
    readonly email?: string;
    readonly sessionId?: string;
    readonly userId?: string;
  };
};

export type SecretHash = {
  readonly algorithm: "scrypt.v1";
  readonly digest: string;
  readonly salt: string;
};

export type SecretHasher = {
  hashSecret: (value: string, purpose: string) => Promise<SecretHash>;
  verifySecret: (
    value: string,
    purpose: string,
    hash: SecretHash,
  ) => Promise<boolean>;
};

export type AuthRandomSource = {
  operationId: () => OperationId;
  token: (prefix: string, bytes: number) => string;
  uuid: () => string;
};

export type AuthPolicy = {
  readonly lockoutDurationMs: number;
  readonly maxFailedLoginAttempts: number;
  readonly maxOtpAttempts: number;
  readonly passwordResetTtlMs: number;
  readonly rateLimitMaxAttempts: number;
  readonly rateLimitWindowMs: number;
  readonly sessionTtlMs: number;
};

export const defaultAuthPolicy: AuthPolicy = {
  lockoutDurationMs: 15 * 60 * 1000,
  maxFailedLoginAttempts: 5,
  maxOtpAttempts: 5,
  passwordResetTtlMs: 20 * 60 * 1000,
  rateLimitMaxAttempts: 8,
  rateLimitWindowMs: 60 * 1000,
  sessionTtlMs: 30 * 60 * 1000,
};

export type AuthApiSuccess<TData> = {
  readonly data: TData;
  readonly meta: AuthResponseMeta;
};

export type AuthApiFailure = {
  readonly error: {
    readonly code: AuthErrorCode;
    readonly contractVersion: typeof AUTH_CONTRACT_VERSION;
    readonly correlationId: string;
    readonly message: string;
    readonly retryable: boolean;
  };
  readonly meta: AuthResponseMeta;
};

export type AuthResponseMeta = {
  readonly contractVersion: typeof AUTH_CONTRACT_VERSION;
  readonly correlationId: string;
  readonly limitations: readonly string[];
  readonly operationId: OperationId;
  readonly readiness: {
    readonly checkedAt: IsoDateTime;
    readonly limitations: readonly string[];
    readonly state: "ready";
  };
};

export type AuthServiceResult<TData> =
  | {
      readonly body: AuthApiSuccess<TData>;
      readonly cookies?: AuthCookieUpdate;
      readonly status: number;
    }
  | {
      readonly body: AuthApiFailure;
      readonly cookies?: AuthCookieUpdate;
      readonly status: number;
    };

export type AuthCookieUpdate =
  | {
      readonly action: "clear";
    }
  | {
      readonly action: "set";
      readonly csrfToken: string;
      readonly refreshToken: string;
      readonly sessionId: string;
    };

export type RequestContext = {
  readonly correlationId: string;
  readonly ip: string;
  readonly now: Date;
  readonly sessionId?: string;
  readonly userAgent: string;
};

export type RegisterInput = {
  readonly email: string;
  readonly fullName: string;
  readonly password: string;
};

export type LoginInput = {
  readonly email: string;
  readonly password: string;
};

export type RefreshInput = {
  readonly refreshToken?: string;
};

export type PasswordResetRequestInput = {
  readonly email: string;
};

export type PasswordResetConfirmInput = {
  readonly email: string;
  readonly newPassword: string;
  readonly otp: string;
  readonly resetToken: string;
};

export type PasswordChangeInput = {
  readonly currentPassword: string;
  readonly newPassword: string;
};

export type EmailVerifyInput = {
  readonly email: string;
  readonly otp: string;
};

export type MfaVerifyInput = {
  readonly challengeId: string;
  readonly otp: string;
};

export type MfaRecoveryInput = {
  readonly email: string;
  readonly recoveryCode: string;
};

export type SafeUser = {
  readonly email: string;
  readonly emailVerified: boolean;
  readonly fullName: string;
  readonly mfaEnabled: boolean;
  readonly status: AuthUserStatus;
  readonly userId: string;
};

export type SafeSession = {
  readonly activeTenantId?: string;
  readonly activeWorkspaceId?: string;
  readonly authStrength: "mfa" | "password";
  readonly createdAt: IsoDateTime;
  readonly current: boolean;
  readonly expiresAt: IsoDateTime;
  readonly lastSeenAt: IsoDateTime;
  readonly mfaVerified: boolean;
  readonly sessionId: string;
  readonly userAgent: string;
};

export type AuthenticatedPrincipal = {
  readonly session: AuthSessionRecord;
  readonly user: AuthUserRecord;
};

export type AuthStateSnapshot = {
  readonly auditEvents: readonly AuditEvent[];
  readonly challenges: readonly AuthChallengeRecord[];
  readonly emailOutbox: readonly EmailOutboxMessage[];
  readonly passwordResets: readonly PasswordResetRecord[];
  readonly rateLimits: readonly RateLimitRecord[];
  readonly sessions: readonly AuthSessionRecord[];
  readonly users: readonly AuthUserRecord[];
};

export type RateLimitRecord = {
  readonly attempts: number;
  readonly key: string;
  readonly resetAt: IsoDateTime;
};

export type MaybePromise<TValue> = TValue | Promise<TValue>;

export type AuthStateStore = {
  appendAudit: (event: AuditEvent) => MaybePromise<void>;
  appendEmail: (message: EmailOutboxMessage) => MaybePromise<void>;
  findActivePasswordResetByUser: (
    userId: string,
  ) => MaybePromise<PasswordResetRecord | undefined>;
  findChallenge: (challengeId: string) => MaybePromise<AuthChallengeRecord | undefined>;
  findSession: (sessionId: string) => MaybePromise<AuthSessionRecord | undefined>;
  findUserByEmail: (email: string) => MaybePromise<AuthUserRecord | undefined>;
  findUserById: (userId: string) => MaybePromise<AuthUserRecord | undefined>;
  getRateLimit: (key: string) => MaybePromise<RateLimitRecord | undefined>;
  listSessionsByUser: (userId: string) => MaybePromise<readonly AuthSessionRecord[]>;
  saveChallenge: (challenge: AuthChallengeRecord) => MaybePromise<void>;
  savePasswordReset: (reset: PasswordResetRecord) => MaybePromise<void>;
  saveRateLimit: (record: RateLimitRecord) => MaybePromise<void>;
  saveSession: (session: AuthSessionRecord) => MaybePromise<void>;
  saveUser: (user: AuthUserRecord) => MaybePromise<void>;
  snapshot: () => MaybePromise<AuthStateSnapshot>;
};

export class InMemoryAuthState implements AuthStateStore {
  private readonly auditEvents = new Map<string, AuditEvent>();

  private readonly challenges = new Map<string, AuthChallengeRecord>();

  private readonly emailOutbox = new Map<string, EmailOutboxMessage>();

  private readonly passwordResets = new Map<string, PasswordResetRecord>();

  private readonly rateLimits = new Map<string, RateLimitRecord>();

  private readonly sessions = new Map<string, AuthSessionRecord>();

  private readonly users = new Map<string, AuthUserRecord>();

  findUserByEmail(email: string): AuthUserRecord | undefined {
    return [...this.users.values()].find((user) => user.email === normalizeEmail(email));
  }

  findUserById(userId: string): AuthUserRecord | undefined {
    return this.users.get(userId);
  }

  saveUser(user: AuthUserRecord): void {
    this.users.set(user.userId, user);
  }

  findSession(sessionId: string): AuthSessionRecord | undefined {
    return this.sessions.get(sessionId);
  }

  saveSession(session: AuthSessionRecord): void {
    this.sessions.set(session.sessionId, session);
  }

  listSessionsByUser(userId: string): readonly AuthSessionRecord[] {
    return [...this.sessions.values()]
      .filter((session) => session.userId === userId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  saveChallenge(challenge: AuthChallengeRecord): void {
    this.challenges.set(challenge.challengeId, challenge);
  }

  findChallenge(challengeId: string): AuthChallengeRecord | undefined {
    return this.challenges.get(challengeId);
  }

  savePasswordReset(reset: PasswordResetRecord): void {
    this.passwordResets.set(reset.resetId, reset);
  }

  findActivePasswordResetByUser(userId: string): PasswordResetRecord | undefined {
    return [...this.passwordResets.values()]
      .filter((reset) => reset.userId === userId && reset.usedAt === null)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
  }

  appendEmail(message: EmailOutboxMessage): void {
    this.emailOutbox.set(message.messageId, message);
  }

  appendAudit(event: AuditEvent): void {
    this.auditEvents.set(event.auditEventId, event);
  }

  getRateLimit(key: string): RateLimitRecord | undefined {
    return this.rateLimits.get(key);
  }

  saveRateLimit(record: RateLimitRecord): void {
    this.rateLimits.set(record.key, record);
  }

  snapshot(): AuthStateSnapshot {
    return {
      auditEvents: [...this.auditEvents.values()],
      challenges: [...this.challenges.values()],
      emailOutbox: [...this.emailOutbox.values()],
      passwordResets: [...this.passwordResets.values()],
      rateLimits: [...this.rateLimits.values()],
      sessions: [...this.sessions.values()],
      users: [...this.users.values()],
    };
  }
}

export class AuthService {
  private readonly hasher: SecretHasher;

  private readonly policy: AuthPolicy;

  private readonly random: AuthRandomSource;

  private readonly state: AuthStateStore;

  constructor(options: {
    readonly hasher: SecretHasher;
    readonly policy?: Partial<AuthPolicy>;
    readonly random: AuthRandomSource;
    readonly state?: AuthStateStore;
  }) {
    this.hasher = options.hasher;
    this.policy = {
      ...defaultAuthPolicy,
      ...options.policy,
    };
    this.random = options.random;
    this.state = options.state ?? new InMemoryAuthState();
  }

  async getSnapshot(): Promise<AuthStateSnapshot> {
    return this.state.snapshot();
  }

  async getAuthenticatedPrincipal(
    context: RequestContext,
  ): Promise<AuthenticatedPrincipal | undefined> {
    const session = await this.requireSession(context);

    if (!session) {
      return undefined;
    }

    const user = await this.state.findUserById(session.userId);

    if (!user) {
      return undefined;
    }

    return {
      session,
      user,
    };
  }

  async setSessionContext(
    context: RequestContext,
    tenantId: string,
    workspaceId: string,
  ): Promise<AuthSessionRecord | undefined> {
    const session = await this.requireSession(context);

    if (!session) {
      return undefined;
    }

    const updatedSession = {
      ...session,
      activeTenantId: tenantId,
      activeWorkspaceId: workspaceId,
      lastSeenAt: toIso(context.now),
    } satisfies AuthSessionRecord;
    await this.state.saveSession(updatedSession);
    return updatedSession;
  }

  async recordAudit(
    eventType: AuthEventType,
    result: AuditEvent["result"],
    context: RequestContext,
    target: AuditEvent["target"],
    actorUserId: string | null = null,
  ): Promise<void> {
    await this.audit(eventType, result, context, target, actorUserId);
  }

  async register(
    input: RegisterInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ user: SafeUser }>> {
    const email = normalizeEmail(input.email);
    const existing = await this.state.findUserByEmail(email);

    if (!email || input.password.length < 12 || input.fullName.trim().length < 1) {
      return this.fail("VALIDATION_FAILED", "Invalid registration payload.", 422, context);
    }

    if (existing) {
      return this.fail("VALIDATION_FAILED", "Account already exists.", 409, context);
    }

    const now = toIso(context.now);
    const user: AuthUserRecord = {
      createdAt: now,
      email,
      emailVerified: false,
      failedLoginCount: 0,
      fullName: input.fullName.trim(),
      lockedUntil: null,
      mfaEnabled: false,
      passwordHash: await this.hasher.hashSecret(input.password, `password:${email}`),
      recoveryCodes: [],
      status: "active",
      updatedAt: now,
      userId: this.random.uuid(),
    };
    await this.state.saveUser(user);
    await this.createOtpChallenge(user, "email_verification", context);
    await this.audit("auth.registered", "success", context, { email, userId: user.userId }, user.userId);

    return this.ok({ user: safeUser(user) }, 201, context);
  }

  async login(
    input: LoginInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ challengeId?: string; mfaRequired: boolean; user: SafeUser }>> {
    const email = normalizeEmail(input.email);
    const rate = await this.consumeRateLimit(`login:${context.ip}:${email}`, context);

    if (!rate.allowed) {
      await this.audit("auth.rate_limited", "denied", context, { email });
      return this.fail("RATE_LIMITED", "Too many auth attempts.", 429, context, true);
    }

    const user = await this.state.findUserByEmail(email);

    if (!user) {
      await this.audit("auth.login_failed", "failure", context, { email });
      return this.fail("INVALID_CREDENTIALS", "Invalid credentials.", 401, context);
    }

    if (user.lockedUntil && Date.parse(user.lockedUntil) > context.now.getTime()) {
      return this.fail("ACCOUNT_LOCKED", "Account is temporarily locked.", 423, context, true);
    }

    const passwordValid = await this.hasher.verifySecret(
      input.password,
      `password:${email}`,
      user.passwordHash,
    );

    if (!passwordValid) {
      const failedLoginCount = user.failedLoginCount + 1;
      const locked = failedLoginCount >= this.policy.maxFailedLoginAttempts;
      const updatedUser = {
        ...user,
        failedLoginCount,
        lockedUntil: locked
          ? toIso(addMs(context.now, this.policy.lockoutDurationMs))
          : user.lockedUntil,
        updatedAt: toIso(context.now),
      } satisfies AuthUserRecord;
      await this.state.saveUser(updatedUser);
      await this.audit("auth.login_failed", "failure", context, { email, userId: user.userId }, user.userId);

      if (locked) {
        await this.audit("auth.lockout_started", "denied", context, { email, userId: user.userId }, user.userId);
        return this.fail("ACCOUNT_LOCKED", "Account is temporarily locked.", 423, context, true);
      }

      return this.fail("INVALID_CREDENTIALS", "Invalid credentials.", 401, context);
    }

    if (!user.emailVerified) {
      await this.audit("auth.login_failed", "denied", context, { email, userId: user.userId }, user.userId);
      return this.fail("EMAIL_NOT_VERIFIED", "Email verification is required.", 403, context);
    }

    const cleanUser = {
      ...user,
      failedLoginCount: 0,
      lockedUntil: null,
      updatedAt: toIso(context.now),
    } satisfies AuthUserRecord;
    await this.state.saveUser(cleanUser);

    if (cleanUser.mfaEnabled) {
      const challenge = await this.createOtpChallenge(cleanUser, "mfa", context);
      return this.failWithData(
        "MFA_REQUIRED",
        "MFA challenge is required.",
        401,
        context,
        {
          challengeId: challenge.challengeId,
          mfaRequired: true,
          user: safeUser(cleanUser),
        },
      );
    }

    const session = await this.createSession(cleanUser, false, context);
    await this.audit("auth.login_succeeded", "success", context, { email, userId: cleanUser.userId }, cleanUser.userId);

    return {
      ...this.ok(
        {
          mfaRequired: false,
          user: safeUser(cleanUser),
        },
        200,
        context,
      ),
      cookies: {
        action: "set",
        csrfToken: session.csrfToken,
        refreshToken: session.refreshToken,
        sessionId: session.record.sessionId,
      },
    };
  }

  async logout(context: RequestContext): Promise<AuthServiceResult<{ loggedOut: true }>> {
    const session = await this.requireSession(context);

    if (!session) {
      return {
        ...this.ok({ loggedOut: true }, 200, context),
        cookies: {
          action: "clear",
        },
      };
    }

    await this.state.saveSession({
      ...session,
      revokedAt: toIso(context.now),
    });
    await this.audit("auth.logout", "success", context, { sessionId: session.sessionId }, session.userId);

    return {
      ...this.ok({ loggedOut: true }, 200, context),
      cookies: {
        action: "clear",
      },
    };
  }

  async refresh(
    input: RefreshInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ session: SafeSession; user: SafeUser }>> {
    const session = await this.requireSession(context, false);

    if (!session || !input.refreshToken) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const refreshValid = await this.hasher.verifySecret(
      input.refreshToken,
      `refresh:${session.sessionId}`,
      session.refreshTokenHash,
    );
    const user = await this.state.findUserById(session.userId);

    if (!refreshValid) {
      await this.revokeUserSessions(session.userId, context);
      await this.audit(
        "auth.refresh_reuse_detected",
        "denied",
        context,
        { sessionId: session.sessionId, userId: session.userId },
        session.userId,
      );
      return {
        ...this.fail("TOKEN_REUSE_DETECTED", "Refresh token reuse detected.", 401, context),
        cookies: {
          action: "clear",
        },
      };
    }

    if (!user) {
      return this.fail("UNAUTHENTICATED", "Session user is missing.", 401, context);
    }

    const refreshToken = this.random.token("rfr", 32);
    const csrfToken = this.random.token("csrf", 24);
    const rotatedSession = {
      ...session,
      csrfTokenHash: await this.hasher.hashSecret(csrfToken, `csrf:${session.sessionId}`),
      expiresAt: toIso(addMs(context.now, this.policy.sessionTtlMs)),
      lastSeenAt: toIso(context.now),
      refreshTokenHash: await this.hasher.hashSecret(refreshToken, `refresh:${session.sessionId}`),
    } satisfies AuthSessionRecord;
    await this.state.saveSession(rotatedSession);
    await this.audit(
      "auth.refresh_rotated",
      "success",
      context,
      { sessionId: session.sessionId, userId: session.userId },
      session.userId,
    );

    return {
      ...this.ok(
        {
          session: safeSession(rotatedSession, context.sessionId),
          user: safeUser(user),
        },
        200,
        context,
      ),
      cookies: {
        action: "set",
        csrfToken,
        refreshToken,
        sessionId: rotatedSession.sessionId,
      },
    };
  }

  async me(context: RequestContext): Promise<AuthServiceResult<{ session: SafeSession; user: SafeUser }>> {
    const session = await this.requireSession(context);

    if (!session) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const user = await this.state.findUserById(session.userId);

    if (!user) {
      return this.fail("UNAUTHENTICATED", "Session user is missing.", 401, context);
    }

    return this.ok(
      {
        session: safeSession(session, context.sessionId),
        user: safeUser(user),
      },
      200,
      context,
    );
  }

  async requestPasswordReset(
    input: PasswordResetRequestInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ accepted: true }>> {
    const email = normalizeEmail(input.email);
    const rate = await this.consumeRateLimit(`password-reset:${context.ip}:${email}`, context);

    if (!rate.allowed) {
      await this.audit("auth.rate_limited", "denied", context, { email });
      return this.fail("RATE_LIMITED", "Too many password reset attempts.", 429, context, true);
    }

    const user = await this.state.findUserByEmail(email);

    if (user) {
      const challenge = await this.createOtpChallenge(user, "password_reset", context);
      const resetToken = this.random.token("rst", 32);
      const reset: PasswordResetRecord = {
        challengeId: challenge.challengeId,
        createdAt: toIso(context.now),
        expiresAt: toIso(addMs(context.now, this.policy.passwordResetTtlMs)),
        resetId: this.random.uuid(),
        tokenHash: await this.hasher.hashSecret(resetToken, `password-reset:${user.userId}`),
        usedAt: null,
        userId: user.userId,
      };
      await this.state.savePasswordReset(reset);
      await this.state.appendEmail({
        createdAt: toIso(context.now),
        email,
        messageId: this.random.uuid(),
        otpPreview: challenge.localOtp,
        purpose: "password_reset",
        tokenPreview: resetToken,
      });
      await this.audit("auth.password_reset_requested", "success", context, { email, userId: user.userId }, user.userId);
    } else {
      await this.audit("auth.password_reset_requested", "success", context, { email });
    }

    return this.ok({ accepted: true }, 202, context);
  }

  async confirmPasswordReset(
    input: PasswordResetConfirmInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ passwordReset: true }>> {
    const email = normalizeEmail(input.email);
    const user = await this.state.findUserByEmail(email);

    if (!user || input.newPassword.length < 12) {
      return this.fail("INVALID_RESET_TOKEN", "Password reset cannot be confirmed.", 400, context);
    }

    const reset = await this.state.findActivePasswordResetByUser(user.userId);

    if (!reset || Date.parse(reset.expiresAt) <= context.now.getTime()) {
      return this.fail("INVALID_RESET_TOKEN", "Password reset token is invalid.", 400, context);
    }

    const tokenValid = await this.hasher.verifySecret(
      input.resetToken,
      `password-reset:${user.userId}`,
      reset.tokenHash,
    );
    const challengeResult = await this.consumeOtpChallenge(
      reset.challengeId,
      input.otp,
      "password_reset",
      context,
    );

    if (!tokenValid || !challengeResult.valid) {
      return this.fail("INVALID_RESET_TOKEN", "Password reset token is invalid.", 400, context);
    }

    await this.state.savePasswordReset({
      ...reset,
      usedAt: toIso(context.now),
    });
    await this.state.saveUser({
      ...user,
      failedLoginCount: 0,
      lockedUntil: null,
      passwordHash: await this.hasher.hashSecret(input.newPassword, `password:${email}`),
      updatedAt: toIso(context.now),
    });
    await this.revokeUserSessions(user.userId, context);
    await this.audit("auth.password_reset_completed", "success", context, { email, userId: user.userId }, user.userId);

    return {
      ...this.ok({ passwordReset: true }, 200, context),
      cookies: {
        action: "clear",
      },
    };
  }

  async changePassword(
    input: PasswordChangeInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ passwordChanged: true }>> {
    const session = await this.requireSession(context);

    if (!session) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const user = await this.state.findUserById(session.userId);

    if (!user || input.newPassword.length < 12) {
      return this.fail("VALIDATION_FAILED", "Password change payload is invalid.", 422, context);
    }

    const currentValid = await this.hasher.verifySecret(
      input.currentPassword,
      `password:${user.email}`,
      user.passwordHash,
    );

    if (!currentValid) {
      return this.fail("INVALID_CREDENTIALS", "Current password is invalid.", 401, context);
    }

    await this.state.saveUser({
      ...user,
      passwordHash: await this.hasher.hashSecret(input.newPassword, `password:${user.email}`),
      updatedAt: toIso(context.now),
    });
    await this.revokeUserSessions(user.userId, context, session.sessionId);
    await this.audit("auth.password_changed", "success", context, { userId: user.userId }, user.userId);

    return this.ok({ passwordChanged: true }, 200, context);
  }

  async verifyEmail(
    input: EmailVerifyInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ emailVerified: true; user: SafeUser }>> {
    const email = normalizeEmail(input.email);
    const user = await this.state.findUserByEmail(email);

    if (!user) {
      return this.fail("INVALID_OTP", "Email verification code is invalid.", 400, context);
    }

    const challenge = [...(await this.state.snapshot()).challenges]
      .filter((item) => item.userId === user.userId && item.purpose === "email_verification")
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

    if (!challenge) {
      return this.fail("INVALID_OTP", "Email verification code is invalid.", 400, context);
    }

    const challengeResult = await this.consumeOtpChallenge(
      challenge.challengeId,
      input.otp,
      "email_verification",
      context,
    );

    if (!challengeResult.valid) {
      return this.fail("INVALID_OTP", "Email verification code is invalid.", 400, context);
    }

    const verifiedUser = {
      ...user,
      emailVerified: true,
      updatedAt: toIso(context.now),
    } satisfies AuthUserRecord;
    await this.state.saveUser(verifiedUser);
    await this.audit("auth.email_verified", "success", context, { email, userId: user.userId }, user.userId);

    return this.ok({ emailVerified: true, user: safeUser(verifiedUser) }, 200, context);
  }

  async createMfaChallenge(
    context: RequestContext,
  ): Promise<AuthServiceResult<{ challengeId: string; method: "email_otp" }>> {
    const session = await this.requireSession(context);

    if (!session) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const user = await this.state.findUserById(session.userId);

    if (!user) {
      return this.fail("UNAUTHENTICATED", "Session user is missing.", 401, context);
    }

    const challenge = await this.createOtpChallenge(user, "mfa", context);
    await this.audit("auth.mfa_challenge_created", "success", context, { userId: user.userId }, user.userId);

    return this.ok(
      {
        challengeId: challenge.challengeId,
        method: "email_otp",
      },
      201,
      context,
    );
  }

  async verifyMfa(
    input: MfaVerifyInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ recoveryCodes?: readonly string[]; session: SafeSession; user: SafeUser }>> {
    const challenge = await this.state.findChallenge(input.challengeId);

    if (!challenge) {
      return this.fail("INVALID_OTP", "MFA challenge is invalid.", 400, context);
    }

    const challengeResult = await this.consumeOtpChallenge(
      input.challengeId,
      input.otp,
      "mfa",
      context,
    );

    if (!challengeResult.valid) {
      await this.audit("auth.mfa_challenge_created", "failure", context, { userId: challenge.userId }, challenge.userId);
      return this.fail("INVALID_OTP", "MFA challenge is invalid.", 400, context);
    }

    const user = await this.state.findUserById(challenge.userId);

    if (!user) {
      return this.fail("UNAUTHENTICATED", "Challenge user is missing.", 401, context);
    }

    const recovery = user.mfaEnabled ? undefined : await this.generateRecoveryCodes(user, context);
    const updatedUser = {
      ...user,
      mfaEnabled: true,
      recoveryCodes: recovery?.records ?? user.recoveryCodes,
      updatedAt: toIso(context.now),
    } satisfies AuthUserRecord;
    await this.state.saveUser(updatedUser);
    const session = await this.createSession(updatedUser, true, context);
    await this.audit("auth.mfa_verified", "success", context, { userId: user.userId }, user.userId);

    return {
      ...this.ok(
        {
          recoveryCodes: recovery?.codes,
          session: safeSession(session.record, session.record.sessionId),
          user: safeUser(updatedUser),
        },
        200,
        context,
      ),
      cookies: {
        action: "set",
        csrfToken: session.csrfToken,
        refreshToken: session.refreshToken,
        sessionId: session.record.sessionId,
      },
    };
  }

  async recoverMfa(
    input: MfaRecoveryInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ session: SafeSession; user: SafeUser }>> {
    const email = normalizeEmail(input.email);
    const user = await this.state.findUserByEmail(email);

    if (!user || !user.mfaEnabled) {
      return this.fail("INVALID_RECOVERY_CODE", "Recovery code is invalid.", 400, context);
    }

    const match = await findRecoveryCode(
      user.recoveryCodes,
      input.recoveryCode,
      this.hasher,
      user.userId,
    );

    if (!match) {
      return this.fail("INVALID_RECOVERY_CODE", "Recovery code is invalid.", 400, context);
    }

    const updatedCodes = user.recoveryCodes.map((code) =>
      code.codeId === match.codeId
        ? {
            ...code,
            usedAt: toIso(context.now),
          }
        : code,
    );
    const updatedUser = {
      ...user,
      recoveryCodes: updatedCodes,
      updatedAt: toIso(context.now),
    } satisfies AuthUserRecord;
    await this.state.saveUser(updatedUser);
    const session = await this.createSession(updatedUser, true, context);
    await this.audit("auth.mfa_recovery_code_used", "success", context, { userId: user.userId }, user.userId);

    return {
      ...this.ok(
        {
          session: safeSession(session.record, session.record.sessionId),
          user: safeUser(updatedUser),
        },
        200,
        context,
      ),
      cookies: {
        action: "set",
        csrfToken: session.csrfToken,
        refreshToken: session.refreshToken,
        sessionId: session.record.sessionId,
      },
    };
  }

  async listSessions(context: RequestContext): Promise<AuthServiceResult<{ sessions: readonly SafeSession[] }>> {
    const session = await this.requireSession(context);

    if (!session) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const sessions = (await this.state
      .listSessionsByUser(session.userId))
      .filter((item) => item.revokedAt === null)
      .map((item) => safeSession(item, session.sessionId));

    return this.ok({ sessions }, 200, context);
  }

  async revokeSession(
    targetSessionId: string,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ revoked: true }>> {
    const session = await this.requireSession(context);

    if (!session) {
      return this.fail("UNAUTHENTICATED", "Session is required.", 401, context);
    }

    const target = await this.state.findSession(targetSessionId);

    if (!target || target.userId !== session.userId) {
      return this.fail("NOT_FOUND", "Session was not found.", 404, context);
    }

    await this.state.saveSession({
      ...target,
      revokedAt: toIso(context.now),
    });
    await this.audit(
      "auth.session_revoked",
      "success",
      context,
      { sessionId: target.sessionId, userId: target.userId },
      session.userId,
    );

    return {
      ...this.ok({ revoked: true }, 200, context),
      cookies: target.sessionId === session.sessionId ? { action: "clear" } : undefined,
    };
  }

  private async requireSession(
    context: RequestContext,
    enforceExpiry = true,
  ): Promise<AuthSessionRecord | undefined> {
    if (!context.sessionId) {
      return undefined;
    }

    const session = await this.state.findSession(context.sessionId);

    if (!session || session.revokedAt) {
      return undefined;
    }

    if (enforceExpiry && Date.parse(session.expiresAt) <= context.now.getTime()) {
      await this.state.saveSession({
        ...session,
        revokedAt: toIso(context.now),
      });
      return undefined;
    }

    return session;
  }

  private async createSession(
    user: AuthUserRecord,
    mfaVerified: boolean,
    context: RequestContext,
  ): Promise<{
    readonly csrfToken: string;
    readonly record: AuthSessionRecord;
    readonly refreshToken: string;
  }> {
    const sessionId = this.random.uuid();
    const refreshToken = this.random.token("rfr", 32);
    const csrfToken = this.random.token("csrf", 24);
    const record: AuthSessionRecord = {
      createdAt: toIso(context.now),
      authStrength: mfaVerified ? "mfa" : "password",
      csrfTokenHash: await this.hasher.hashSecret(csrfToken, `csrf:${sessionId}`),
      expiresAt: toIso(addMs(context.now, this.policy.sessionTtlMs)),
      lastSeenAt: toIso(context.now),
      mfaVerified,
      refreshTokenHash: await this.hasher.hashSecret(refreshToken, `refresh:${sessionId}`),
      revokedAt: null,
      sessionId,
      userAgent: context.userAgent,
      userId: user.userId,
    };
    await this.state.saveSession(record);

    return {
      csrfToken,
      record,
      refreshToken,
    };
  }

  private async createOtpChallenge(
    user: AuthUserRecord,
    purpose: AuthChallengePurpose,
    context: RequestContext,
  ): Promise<AuthChallengeRecord & { readonly localOtp: string }> {
    const otp = this.random.token("otp", 4).replace(/\D/g, "").slice(0, 6).padEnd(6, "0");
    const challengeId = this.random.uuid();
    const record: AuthChallengeRecord & { readonly localOtp: string } = {
      attempts: 0,
      challengeId,
      consumedAt: null,
      createdAt: toIso(context.now),
      email: user.email,
      expiresAt: toIso(addMs(context.now, this.policy.passwordResetTtlMs)),
      localOtp: otp,
      otpHash: await this.hasher.hashSecret(otp, `otp:${purpose}:${challengeId}`),
      purpose,
      userId: user.userId,
    };
    await this.state.saveChallenge(record);

    if (purpose !== "password_reset") {
      await this.state.appendEmail({
        createdAt: toIso(context.now),
        email: user.email,
        messageId: this.random.uuid(),
        otpPreview: otp,
        purpose,
      });
    }

    if (purpose === "email_verification") {
      await this.audit("auth.email_verification_requested", "success", context, { email: user.email, userId: user.userId }, user.userId);
    }

    return record;
  }

  private async consumeOtpChallenge(
    challengeId: string,
    otp: string,
    purpose: AuthChallengePurpose,
    context: RequestContext,
  ): Promise<{ readonly valid: boolean }> {
    const challenge = await this.state.findChallenge(challengeId);

    if (
      !challenge ||
      challenge.purpose !== purpose ||
      challenge.consumedAt ||
      Date.parse(challenge.expiresAt) <= context.now.getTime()
    ) {
      return { valid: false };
    }

    if (challenge.attempts >= this.policy.maxOtpAttempts) {
      return { valid: false };
    }

    const valid = await this.hasher.verifySecret(
      otp,
      `otp:${purpose}:${challengeId}`,
      challenge.otpHash,
    );

    await this.state.saveChallenge({
      ...challenge,
      attempts: challenge.attempts + 1,
      consumedAt: valid ? toIso(context.now) : challenge.consumedAt,
    });

    return { valid };
  }

  private async generateRecoveryCodes(
    user: AuthUserRecord,
    context: RequestContext,
  ): Promise<{
    readonly codes: readonly string[];
    readonly records: readonly RecoveryCodeRecord[];
  }> {
    const codes = Array.from({ length: 8 }, () => this.random.token("rcv", 8));
    const records: RecoveryCodeRecord[] = [];

    for (const code of codes) {
      records.push({
        codeHash: await this.hasher.hashSecret(code, `recovery:${user.userId}`),
        codeId: this.random.uuid(),
        usedAt: null,
      });
    }

    await this.audit("auth.mfa_verified", "success", context, { userId: user.userId }, user.userId);

    return {
      codes,
      records,
    };
  }

  private async revokeUserSessions(
    userId: string,
    context: RequestContext,
    exceptSessionId?: string,
  ): Promise<void> {
    for (const session of await this.state.listSessionsByUser(userId)) {
      if (session.sessionId === exceptSessionId || session.revokedAt) {
        continue;
      }

      await this.state.saveSession({
        ...session,
        revokedAt: toIso(context.now),
      });
    }
  }

  private async consumeRateLimit(
    key: string,
    context: RequestContext,
  ): Promise<{ readonly allowed: boolean }> {
    const existing = await this.state.getRateLimit(key);

    if (!existing || Date.parse(existing.resetAt) <= context.now.getTime()) {
      await this.state.saveRateLimit({
        attempts: 1,
        key,
        resetAt: toIso(addMs(context.now, this.policy.rateLimitWindowMs)),
      });
      return { allowed: true };
    }

    const next = {
      ...existing,
      attempts: existing.attempts + 1,
    } satisfies RateLimitRecord;
    await this.state.saveRateLimit(next);

    return {
      allowed: next.attempts <= this.policy.rateLimitMaxAttempts,
    };
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
          contractVersion: AUTH_CONTRACT_VERSION,
          correlationId: context.correlationId,
          message,
          retryable,
        },
        meta: responseMeta(context),
      },
      status,
    };
  }

  private failWithData<TData>(
    code: AuthErrorCode,
    message: string,
    status: number,
    context: RequestContext,
    data: TData,
  ): AuthServiceResult<TData> {
    return {
      body: {
        data,
        meta: {
          ...responseMeta(context),
          limitations: [code, message],
        },
      },
      status,
    };
  }

  private async audit(
    eventType: AuthEventType,
    result: AuditEvent["result"],
    context: RequestContext,
    target: AuditEvent["target"],
    actorUserId: string | null = null,
  ): Promise<void> {
    await this.state.appendAudit({
      actorUserId,
      auditEventId: this.random.uuid(),
      correlationId: context.correlationId,
      eventType,
      occurredAt: toIso(context.now),
      operationId: contextOperationId(context, this.random),
      result,
      target: sanitizeAuditTarget(target),
    });
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function safeUser(user: AuthUserRecord): SafeUser {
  return {
    email: user.email,
    emailVerified: user.emailVerified,
    fullName: user.fullName,
    mfaEnabled: user.mfaEnabled,
    status: user.status,
    userId: user.userId,
  };
}

export function safeSession(
  session: AuthSessionRecord,
  currentSessionId: string | undefined,
): SafeSession {
  return {
    activeTenantId: session.activeTenantId,
    activeWorkspaceId: session.activeWorkspaceId,
    authStrength: session.authStrength,
    createdAt: session.createdAt,
    current: session.sessionId === currentSessionId,
    expiresAt: session.expiresAt,
    lastSeenAt: session.lastSeenAt,
    mfaVerified: session.mfaVerified,
    sessionId: session.sessionId,
    userAgent: session.userAgent,
  };
}

export function responseMeta(context: RequestContext): AuthResponseMeta {
  return {
    contractVersion: AUTH_CONTRACT_VERSION,
    correlationId: context.correlationId,
    limitations: [],
    operationId: contextOperationId(context),
    readiness: {
      checkedAt: toIso(context.now),
      limitations: [],
      state: "ready",
    },
  };
}

export function toIso(date: Date): IsoDateTime {
  return date.toISOString() as IsoDateTime;
}

export function addMs(date: Date, milliseconds: number): Date {
  return new Date(date.getTime() + milliseconds);
}

async function findRecoveryCode(
  codes: readonly RecoveryCodeRecord[],
  value: string,
  hasher: SecretHasher,
  userId: string,
): Promise<RecoveryCodeRecord | undefined> {
  for (const code of codes) {
    if (code.usedAt) {
      continue;
    }

    if (await hasher.verifySecret(value, `recovery:${userId}`, code.codeHash)) {
      return code;
    }
  }

  return undefined;
}

function contextOperationId(
  context: RequestContext,
  random?: AuthRandomSource,
): OperationId {
  return (context.correlationId || random?.operationId() || "op_auth") as OperationId;
}

function sanitizeAuditTarget(target: AuditEvent["target"]): AuditEvent["target"] {
  return {
    email: target.email ? maskEmail(target.email) : undefined,
    sessionId: target.sessionId,
    userId: target.userId,
  };
}

function maskEmail(email: string): string {
  const [name = "", domain = ""] = email.split("@");
  return `${name.slice(0, 1) || "*"}***@${domain || "redacted"}`;
}
