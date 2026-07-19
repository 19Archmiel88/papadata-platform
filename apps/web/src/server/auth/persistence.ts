import type {
  AuditEvent,
  AuthSession,
  AuthUser,
  Invitation,
  Membership,
  MfaChallenge,
  Tenant,
  RecoveryCode,
  ReauthenticationContext,
  UserId,
  Workspace,
} from '../../contracts/auth';
import type {
  AuthChallengeId,
  InvitationId,
  PasswordResetId,
  SessionId,
} from '../../contracts/ids';

export type CredentialRecord = {
  passwordHash: string;
  passwordHashAlgorithm: 'pbkdf2_sha256_local_test';
  passwordHashVersion: string;
  saltReference: string;
  userId: UserId;
};

export type TokenDigestRecord<TPurpose extends string> = {
  createdAt: string;
  digest: string;
  expiresAt: string;
  invalidatedAt?: string;
  purpose: TPurpose;
  recordId: string;
  usedAt?: string;
};

export type RecoveryCodeRecord = RecoveryCode & {
  digest: string;
  userId: UserId;
};

export type AuthRepository<TRecord, TId extends string> = {
  get(id: TId): Promise<TRecord | undefined>;
  list(): Promise<readonly TRecord[]>;
  save(record: TRecord): Promise<void>;
};

export type AuthSessionRepository = AuthRepository<AuthSession, SessionId> & {
  listByUser(userId: UserId): Promise<readonly AuthSession[]>;
};

export type AuthAuditRepository = {
  append(event: AuditEvent): Promise<void>;
  list(): Promise<readonly AuditEvent[]>;
};

export type AuthPersistence = {
  audit: AuthAuditRepository;
  credentials: AuthRepository<CredentialRecord, UserId>;
  invitations: AuthRepository<Invitation, InvitationId>;
  memberships: AuthRepository<Membership, string>;
  mfaChallenges: AuthRepository<MfaChallenge, AuthChallengeId>;
  tenants: AuthRepository<Tenant, string>;
  passwordResetTokens: AuthRepository<TokenDigestRecord<'password_reset'>, PasswordResetId>;
  reauthentication: AuthRepository<ReauthenticationContext, string>;
  recoveryCodes: AuthRepository<RecoveryCodeRecord, string>;
  sessions: AuthSessionRepository;
  users: AuthRepository<AuthUser, UserId>;
  workspaces: AuthRepository<Workspace, string>;
};

function createRepository<TRecord, TId extends string>(
  getId: (record: TRecord) => TId,
  seed: readonly TRecord[] = [],
): AuthRepository<TRecord, TId> {
  const records = new Map<TId, TRecord>();

  seed.forEach((record) => {
    records.set(getId(record), record);
  });

  return {
    async get(id) {
      return records.get(id);
    },
    async list() {
      return Array.from(records.values());
    },
    async save(record) {
      records.set(getId(record), record);
    },
  };
}

export function createInMemoryAuthPersistence(): AuthPersistence {
  const auditEvents: AuditEvent[] = [];
  const sessions = createRepository<AuthSession, SessionId>(
    (session) => session.sessionId,
  );

  return {
    audit: {
      async append(event) {
        auditEvents.push(event);
      },
      async list() {
        return auditEvents.map((event) => ({ ...event }));
      },
    },
    credentials: createRepository<CredentialRecord, UserId>(
      (credential) => credential.userId,
    ),
    invitations: createRepository<Invitation, InvitationId>(
      (invitation) => invitation.invitationId,
    ),
    memberships: createRepository<Membership, string>(
      (membership) => membership.membershipId,
    ),
    mfaChallenges: createRepository<MfaChallenge, AuthChallengeId>(
      (challenge) => challenge.challengeId,
    ),
    tenants: createRepository<Tenant, string>(
      (tenant) => tenant.tenantId,
    ),
    passwordResetTokens: createRepository<TokenDigestRecord<'password_reset'>, PasswordResetId>(
      (token) => token.recordId as PasswordResetId,
    ),
    reauthentication: createRepository<ReauthenticationContext, string>(
      (reauthentication) =>
        `${reauthentication.sessionId}:${reauthentication.purpose}`,
    ),
    recoveryCodes: createRepository<RecoveryCodeRecord, string>(
      (recoveryCode) => recoveryCode.codeId,
    ),
    sessions: {
      ...sessions,
      async listByUser(userId) {
        const allSessions = await sessions.list();
        return allSessions.filter((session) => session.userId === userId);
      },
    },
    users: createRepository<AuthUser, UserId>((user) => user.userId),
    workspaces: createRepository<Workspace, string>(
      (workspace) => workspace.workspaceId,
    ),
  };
}
