import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import {
  resolveMembershipCapabilities,
  type CanonicalCapability,
} from "@papadata/contracts";
import { ProductionDatabase } from "./production.js";

export type IdentityUserRow = {
  readonly userId: string;
  readonly identityKey: string;
  readonly normalizedEmail: string;
  readonly passwordHash: string;
  readonly displayName: string;
  readonly status: "active" | "locked" | "disabled";
  readonly emailVerifiedAt: string | null;
  readonly failedLoginAttempts: number;
  readonly lockedUntil: string | null;
};

export type IdentityMembershipRow = {
  readonly membershipId: string;
  readonly userId: string;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly tenantName: string;
  readonly workspaceName: string;
  readonly roles: readonly string[];
  readonly capabilities: readonly CanonicalCapability[];
  readonly status: string;
};

export type ProductDomainRecord = {
  readonly id: string;
  readonly domain: string;
  readonly entityType: string;
  readonly externalKey: string;
  readonly status: string;
  readonly data: Readonly<Record<string, unknown>>;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export class IdentityRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  async findByEmail(email: string): Promise<IdentityUserRow | null> {
    const normalizedEmail = normalizeEmail(email);
    const identityKey = identityKeyForEmail(normalizedEmail);
    return this.database.withIdentity(identityKey, null, async (client) => {
      const result = await client.query<Record<string, unknown>>(
        `select user_id::text, identity_key, normalized_email, password_hash,
                display_name, status, email_verified_at, failed_login_attempts,
                locked_until
           from app.identity_users
          where identity_key = $1 and normalized_email = $2
          limit 1`,
        [identityKey, normalizedEmail],
      );
      return result.rows[0] ? readIdentityUser(result.rows[0]) : null;
    });
  }

  async register(input: {
    readonly email: string;
    readonly passwordHash: string;
    readonly displayName: string;
    readonly tenantName: string;
    readonly workspaceName: string;
    readonly capabilities: readonly CanonicalCapability[];
  }): Promise<{ readonly user: IdentityUserRow; readonly membership: IdentityMembershipRow }> {
    const normalizedEmail = normalizeEmail(input.email);
    const identityKey = identityKeyForEmail(normalizedEmail);
    const userId = randomUUID();
    const tenantId = randomUUID();
    const workspaceId = randomUUID();
    const membershipId = randomUUID();

    return this.database.withIdentityTenantWorkspace(
      identityKey,
      null,
      tenantId,
      workspaceId,
      async (client) => {
        const existing = await client.query<{ readonly user_id: string }>(
          "select user_id::text from app.identity_users where identity_key = $1 limit 1",
          [identityKey],
        );
        if (existing.rows[0]) throw new Error("IDENTITY_EMAIL_EXISTS");

      await client.query(
        `insert into app.users (
           user_id, email, full_name, status, email_verified, mfa_enabled
         ) values ($1::uuid, $2, $3, 'active', false, false)`,
        [userId, normalizedEmail, input.displayName],
      );

      const userResult = await client.query<Record<string, unknown>>(
        `insert into app.identity_users (
           user_id, identity_key, normalized_email, password_hash, display_name
         ) values ($1::uuid, $2, $3, $4, $5)
         returning user_id::text, identity_key, normalized_email, password_hash,
                   display_name, status, email_verified_at, failed_login_attempts,
                   locked_until`,
        [userId, identityKey, normalizedEmail, input.passwordHash, input.displayName],
      );
      const user = readIdentityUser(requiredRow(userResult.rows[0]));
      await setIdentityUser(client, user.userId);

      await client.query(
        `insert into app.tenants (
           tenant_id, created_by_user_id, name, status, entitlements
         ) values ($1::uuid, $2::uuid, $3, 'active', $4::jsonb)`,
        [tenantId, userId, input.tenantName, JSON.stringify(input.capabilities)],
      );
      await client.query(
        `insert into app.workspaces (
           workspace_id, tenant_id, created_by_user_id, name, status
         ) values ($1::uuid, $2::uuid, $3::uuid, $4, 'active')`,
        [workspaceId, tenantId, userId, input.workspaceName],
      );
      await client.query(
        `insert into app.memberships (
           membership_id, tenant_id, workspace_id, user_id, role, status, data_scope
         ) values ($1::uuid, $2::uuid, $3::uuid, $4::uuid,
                   'Tenant Owner', 'active', 'tenant')`,
        [membershipId, tenantId, workspaceId, userId],
      );
      await client.query(
        `insert into app.onboarding_states (tenant_id, workspace_id)
         values ($1::uuid, $2::uuid)
         on conflict (tenant_id, workspace_id) do nothing`,
        [tenantId, workspaceId],
      );

      const membershipResult = await client.query<Record<string, unknown>>(
        `insert into app.identity_memberships (
           membership_id, user_id, tenant_id, workspace_id, tenant_name, workspace_name,
           roles, capabilities
         ) values ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5, $6, $7::jsonb, $8::jsonb)
         returning membership_id::text, user_id::text, tenant_id::text,
                   workspace_id::text, tenant_name, workspace_name, roles,
                   capabilities, status`,
        [
          membershipId,
          user.userId,
          tenantId,
          workspaceId,
          input.tenantName,
          input.workspaceName,
          JSON.stringify(["Tenant Owner"]),
          JSON.stringify(input.capabilities),
        ],
      );
        return { user, membership: readMembership(requiredRow(membershipResult.rows[0])) };
      },
    );
  }

  // For OAuth login, where the identity was already resolved by
  // (provider, subject_id) rather than by email — looks the user up
  // directly by userId/identityKey instead of re-deriving identityKey from
  // a possibly-stale email.
  async findByUserId(userId: string, identityKey: string): Promise<IdentityUserRow | null> {
    return this.database.withIdentity(identityKey, userId, async (client) => {
      const result = await client.query<Record<string, unknown>>(
        `select user_id::text, identity_key, normalized_email, password_hash,
                display_name, status, email_verified_at, failed_login_attempts,
                locked_until
           from app.identity_users
          where user_id = $1::uuid
          limit 1`,
        [userId],
      );
      return result.rows[0] ? readIdentityUser(result.rows[0]) : null;
    });
  }

  // For authenticated flows (OAuth link_account/reauth) that only carry
  // userId, not identityKey — the BFF's internal principal token never
  // includes identityKey. Pre-auth-safe SECURITY DEFINER lookup, migration
  // 0034.
  async findIdentityKeyByUserId(userId: string): Promise<string | null> {
    const rows = await this.database.queryGlobalReadonly<{ readonly identity_key: string | null }>(
      "select app.lookup_identity_key_for_user($1::uuid) as identity_key",
      [userId],
    );
    return rows[0]?.identity_key ?? null;
  }

  async listMemberships(user: IdentityUserRow): Promise<readonly IdentityMembershipRow[]> {
    return this.database.withIdentity(user.identityKey, user.userId, async (client) => {
      const result = await client.query<Record<string, unknown>>(
        `select membership_id::text, user_id::text, tenant_id::text,
                workspace_id::text, tenant_name, workspace_name, roles,
                capabilities, status
           from app.identity_memberships
          where user_id = $1::uuid and status = 'active'
          order by created_at`,
        [user.userId],
      );
      return result.rows.map(readMembership);
    });
  }

  async recordLogin(input: {
    readonly user: IdentityUserRow;
    readonly outcome: "success" | "denied" | "failure";
    readonly correlationId: string | null;
    readonly ipHash: string | null;
    readonly failureReason?: string;
  }): Promise<void> {
    await this.database.withIdentity(input.user.identityKey, input.user.userId, async (client) => {
      if (input.outcome === "success") {
        await client.query(
          `update app.identity_users
              set failed_login_attempts = 0, locked_until = null, updated_at = now()
            where user_id = $1::uuid`,
          [input.user.userId],
        );
      } else {
        await client.query(
          `update app.identity_users
              set failed_login_attempts = failed_login_attempts + 1,
                  locked_until = case when failed_login_attempts + 1 >= 8
                    then now() + interval '15 minutes' else locked_until end,
                  updated_at = now()
            where user_id = $1::uuid`,
          [input.user.userId],
        );
      }
      await client.query(
        `insert into app.identity_audit_events (
           identity_key, user_id, event_type, outcome, correlation_id,
           ip_hash, metadata
         ) values ($1, $2::uuid, 'auth.login', $3, $4, $5, $6::jsonb)`,
        [
          input.user.identityKey,
          input.user.userId,
          input.outcome,
          input.correlationId,
          input.ipHash,
          JSON.stringify(input.failureReason ? { failureReason: input.failureReason } : {}),
        ],
      );
    });
  }
}

export class ProductDomainRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  async list(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly domain: string;
    readonly entityType: string;
    readonly limit?: number;
  }): Promise<readonly ProductDomainRecord[]> {
    return this.database.withTenantWorkspace(input.tenantId, input.workspaceId, async (client) => {
      const limit = Math.min(500, Math.max(1, input.limit ?? 100));
      const result = await client.query<Record<string, unknown>>(
        `select record_id::text, domain, entity_type, external_key, status,
                data, version, created_at, updated_at
           from app.product_domain_records
          where tenant_id = $1::uuid and workspace_id = $2::uuid
            and domain = $3 and entity_type = $4 and deleted_at is null
          order by updated_at desc
          limit $5`,
        [input.tenantId, input.workspaceId, input.domain, input.entityType, limit],
      );
      if (result.rows.length > 0) return result.rows.map(readDomainRecord);
      const stream = sourceStream(input.domain, input.entityType);
      if (stream) {
        const canonical = await client.query<Record<string, unknown>>(
          `select canonical_record_id::text as record_id,
                  $3::text as domain, $4::text as entity_type,
                  external_id as external_key, 'active'::text as status,
                  canonical_payload as data, 1::int as version,
                  ingested_at as created_at, updated_at
             from app.integration_canonical_records
            where tenant_id = $1::uuid and workspace_id = $2::uuid
              and stream = $5
            order by coalesce(business_time, ingested_at) desc
            limit $6`,
          [input.tenantId, input.workspaceId, input.domain, input.entityType, stream, limit],
        );
        return canonical.rows.map(readDomainRecord);
      }
      if (input.domain === "analytics" && input.entityType === "metric_snapshot") {
        const metrics = await client.query<Record<string, unknown>>(
          `select metric_snapshot_id::text as record_id,
                  'analytics'::text as domain, 'metric_snapshot'::text as entity_type,
                  metric_code || ':' || period_start::text || ':' || period_end::text as external_key,
                  readiness as status,
                  jsonb_build_object(
                    'metricCode', metric_code, 'value', value, 'valueKind', value_kind,
                    'currency', currency, 'periodStart', period_start, 'periodEnd', period_end,
                    'readiness', readiness, 'reasonCodes', reason_codes,
                    'limitations', limitations, 'evidence', evidence
                  ) as data,
                  1::int as version, created_at, generated_at as updated_at
             from app.metric_snapshots
            where tenant_id = $1::uuid and workspace_id = $2::uuid
            order by generated_at desc limit $3`,
          [input.tenantId, input.workspaceId, limit],
        );
        return metrics.rows.map(readDomainRecord);
      }
      return [];
    });
  }

  async find(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly domain: string;
    readonly entityType: string;
    readonly externalKey: string;
  }): Promise<ProductDomainRecord | null> {
    return this.database.withTenantWorkspace(input.tenantId, input.workspaceId, async (client) => {
      const result = await client.query<Record<string, unknown>>(
        `select record_id::text, domain, entity_type, external_key, status,
                data, version, created_at, updated_at
           from app.product_domain_records
          where tenant_id = $1::uuid and workspace_id = $2::uuid
            and domain = $3 and entity_type = $4 and external_key = $5
            and deleted_at is null limit 1`,
        [input.tenantId, input.workspaceId, input.domain, input.entityType, input.externalKey],
      );
      return result.rows[0] ? readDomainRecord(result.rows[0]) : null;
    });
  }

  async upsert(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly domain: string;
    readonly entityType: string;
    readonly externalKey: string;
    readonly status: string;
    readonly data: Readonly<Record<string, unknown>>;
    readonly actorUserId: string;
    readonly operationId: string;
    readonly correlationId: string | null;
    readonly idempotencyKey: string | null;
  }): Promise<ProductDomainRecord> {
    return this.database.withTenantWorkspace(input.tenantId, input.workspaceId, async (client) => {
      const before = await client.query<{ readonly data: unknown }>(
        `select data from app.product_domain_records
          where tenant_id = $1::uuid and workspace_id = $2::uuid
            and domain = $3 and entity_type = $4 and external_key = $5
          for update`,
        [input.tenantId, input.workspaceId, input.domain, input.entityType, input.externalKey],
      );
      const result = await client.query<Record<string, unknown>>(
        `insert into app.product_domain_records (
           tenant_id, workspace_id, domain, entity_type, external_key,
           status, data, created_by, updated_by
         ) values ($1::uuid, $2::uuid, $3, $4, $5, $6, $7::jsonb, $8::uuid, $8::uuid)
         on conflict (tenant_id, workspace_id, domain, entity_type, external_key)
         do update set status = excluded.status, data = excluded.data,
                       updated_by = excluded.updated_by, updated_at = now(),
                       deleted_at = null, version = app.product_domain_records.version + 1
         returning record_id::text, domain, entity_type, external_key, status,
                   data, version, created_at, updated_at`,
        [input.tenantId, input.workspaceId, input.domain, input.entityType, input.externalKey, input.status, JSON.stringify(input.data), input.actorUserId],
      );
      const record = readDomainRecord(requiredRow(result.rows[0]));
      await client.query(
        `insert into app.product_domain_events (
           tenant_id, workspace_id, domain, entity_type, entity_key,
           operation_id, actor_user_id, correlation_id, idempotency_key,
           before_state, after_state, outcome
         ) values ($1::uuid, $2::uuid, $3, $4, $5, $6, $7::uuid, $8, $9,
                   $10::jsonb, $11::jsonb, 'success')
         on conflict (tenant_id, workspace_id, operation_id, idempotency_key)
         where idempotency_key is not null
         do nothing`,
        [input.tenantId, input.workspaceId, input.domain, input.entityType, input.externalKey, input.operationId, input.actorUserId, input.correlationId, input.idempotencyKey, JSON.stringify(before.rows[0]?.data ?? null), JSON.stringify(record.data)],
      );
      return record;
    });
  }

  async remove(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly domain: string;
    readonly entityType: string;
    readonly externalKey: string;
    readonly actorUserId: string;
    readonly operationId: string;
  }): Promise<boolean> {
    return this.database.withTenantWorkspace(input.tenantId, input.workspaceId, async (client) => {
      const result = await client.query(
        `update app.product_domain_records
            set deleted_at = now(), updated_by = $6::uuid, updated_at = now(), version = version + 1
          where tenant_id = $1::uuid and workspace_id = $2::uuid
            and domain = $3 and entity_type = $4 and external_key = $5
            and deleted_at is null`,
        [input.tenantId, input.workspaceId, input.domain, input.entityType, input.externalKey, input.actorUserId],
      );
      return (result.rowCount ?? 0) > 0;
    });
  }

  async search(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly query: string;
  }): Promise<readonly ProductDomainRecord[]> {
    return this.database.withTenantWorkspace(input.tenantId, input.workspaceId, async (client) => {
      const result = await client.query<Record<string, unknown>>(
        `select record_id::text, domain, entity_type, external_key, status,
                data, version, created_at, updated_at
           from app.product_domain_records
          where tenant_id = $1::uuid and workspace_id = $2::uuid
            and deleted_at is null
            and (external_key ilike $3 or data::text ilike $3)
          order by updated_at desc limit 100`,
        [input.tenantId, input.workspaceId, `%${escapeLike(input.query)}%`],
      );
      return result.rows.map(readDomainRecord);
    });
  }

  async dashboardSummary(tenantId: string, workspaceId: string): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(tenantId, workspaceId, async (client) => {
      const generatedAt = await client.query<{ readonly generated_at: Date | string | null }>(
        `select transaction_timestamp() as generated_at`,
      );
      const streams = await client.query<{ readonly stream: string; readonly records: number; readonly latest: string | null }>(
        `select stream, count(*)::int as records,
                max(coalesce(
                  nullif(canonical_payload ->> 'occurredAt', '')::timestamptz,
                  business_time,
                  ingested_at
                ))::text as latest
           from app.integration_canonical_records
          where tenant_id = $1::uuid and workspace_id = $2::uuid
          group by stream order by stream`,
        [tenantId, workspaceId],
      );
      const domainCounts = await client.query<{ readonly domain: string; readonly records: number }>(
        `select domain, count(*)::int as records
           from app.product_domain_records
          where tenant_id = $1::uuid and workspace_id = $2::uuid and deleted_at is null
          group by domain order by domain`,
        [tenantId, workspaceId],
      );
      return {
        generatedAt: readGeneratedAt(generatedAt.rows[0]?.generated_at),
        readiness: streams.rows.length > 0 ? "ready" : "not_ready",
        integrationStreams: streams.rows,
        domainCounts: domainCounts.rows,
      };
    });
  }
}

function readGeneratedAt(value: Date | string | null | undefined): string {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  return new Date().toISOString();
}

export class WebhookReceiptRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  async reserve(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly connectionId: string;
    readonly providerId: string;
    readonly providerEventId: string;
    readonly signatureDigest: string;
    readonly payloadDigest: string;
    readonly providerTimestamp: string | null;
    readonly ttlSeconds: number;
  }): Promise<boolean> {
    return this.database.withTenantWorkspace(input.tenantId, input.workspaceId, async (client) => {
      await client.query(
        `delete from app.webhook_replay_receipts
          where tenant_id = $1::uuid and workspace_id = $2::uuid
            and expires_at <= now()`,
        [input.tenantId, input.workspaceId],
      );
      const result = await client.query(
        `insert into app.webhook_replay_receipts (
           tenant_id, workspace_id, connection_id, provider_id,
           provider_event_id, signature_digest, payload_digest,
           provider_timestamp, expires_at
         ) values ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7,
                   $8::timestamptz, now() + make_interval(secs => $9))
         on conflict (connection_id, provider_event_id) do nothing`,
        [input.tenantId, input.workspaceId, input.connectionId, input.providerId, input.providerEventId, input.signatureDigest, input.payloadDigest, input.providerTimestamp, input.ttlSeconds],
      );
      return (result.rowCount ?? 0) === 1;
    });
  }
}

export type InvitationRow = {
  readonly invitationId: string;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly tenantName: string;
  readonly workspaceName: string;
  readonly email: string;
  readonly role: string;
  readonly status: string;
  readonly invitedByUserId: string;
  readonly expiresAt: string;
};

export type MemberListRow = {
  readonly id: string;
  readonly person: string;
  readonly email: string;
  readonly role: string;
  readonly status: string;
  readonly mfa: boolean;
  readonly lastSeenAt: string | null;
};

// Real team-membership and invitation data access. It stays separate from
// IdentityRepository because it owns tenant-scoped membership/invitation
// lifecycle as well as the pre-auth signed-invitation boundary.
export class InvitationRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  async listMembersAndInvitations(
    tenantId: string,
    workspaceId: string,
  ): Promise<readonly MemberListRow[]> {
    return this.database.withTenantWorkspace(tenantId, workspaceId, async (client) => {
      const members = await client.query<Record<string, unknown>>(
        `select m.membership_id::text as id, u.full_name as person, u.email,
                m.role, m.status, u.mfa_enabled as mfa, m.updated_at as last_seen_at
           from app.memberships m
           join app.users u on u.user_id = m.user_id
          where m.tenant_id = $1::uuid and m.workspace_id = $2::uuid
          order by m.created_at asc`,
        [tenantId, workspaceId],
      );
      const invitations = await client.query<Record<string, unknown>>(
        `select invitation_id::text as id, email as person, email,
                role, 'invited'::text as status, false as mfa, created_at as last_seen_at
           from app.invitations
          where tenant_id = $1::uuid and workspace_id = $2::uuid and status = 'pending'
          order by created_at asc`,
        [tenantId, workspaceId],
      );
      return [...members.rows, ...invitations.rows].map(readMemberListRow);
    });
  }

  // Creates the invitation and its one-time token in the same tenant-scoped
  // transaction. The raw token is returned once and never persisted; only
  // its SHA-256 hash is stored.
  async createInvitation(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly email: string;
    readonly role: string;
    readonly invitedByUserId: string;
    readonly ttlHours: number;
  }): Promise<{ readonly invitationId: string; readonly token: string; readonly expiresAt: string }> {
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + input.ttlHours * 3_600_000).toISOString();

    return this.database.withTenantWorkspace(input.tenantId, input.workspaceId, async (client) => {
      const result = await client.query<{ readonly invitation_id: string }>(
        `insert into app.invitations (
           invitation_id, tenant_id, workspace_id, email, role, status,
           token_hash, invited_by_user_id, expires_at
         ) values (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4, 'pending',
                   $5, $6::uuid, $7::timestamptz)
         returning invitation_id::text`,
        [
          input.tenantId,
          input.workspaceId,
          normalizeEmail(input.email),
          input.role,
          tokenHash,
          input.invitedByUserId,
          expiresAt,
        ],
      );
      const invitationId = requiredString(requiredRow(result.rows[0]).invitation_id);

      await client.query(
        `insert into app.security_invitation_tokens (
           tenant_id, invitation_id, token_version, token_hash, issued_at, expires_at
         ) values ($1, $2, 1, $3, $4::timestamptz, $5::timestamptz)`,
        [
          input.tenantId,
          invitationId,
          tokenHash,
          issuedAt.toISOString(),
          expiresAt,
        ],
      );

      return { invitationId, token, expiresAt };
    });
  }

  // Public/pre-auth lookup. The token hash is part of the SECURITY DEFINER
  // lookup itself, so invitation metadata is never disclosed for a bare
  // invitation id. The function is defined by migrations 0021/0022.
  async findInvitationByToken(
    invitationId: string,
    token: string,
  ): Promise<InvitationRow | null> {
    if (!looksLikeUuid(invitationId)) return null;

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const rows = await this.database.queryGlobalReadonly<Record<string, unknown>>(
      `select invitation_id::text, tenant_id::text, workspace_id::text,
              tenant_name, workspace_name,
              email, role, status, invited_by_user_id::text, expires_at
         from app.lookup_invitation_for_acceptance($1::uuid, $2)`,
      [invitationId, tokenHash],
    );
    return rows[0] ? readInvitation(rows[0]) : null;
  }

  async markRevoked(
    tenantId: string,
    workspaceId: string,
    invitationId: string,
  ): Promise<boolean> {
    if (!looksLikeUuid(invitationId)) {
      return false;
    }

    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const revoked = await client.query(
          `update app.invitations
              set status = 'revoked',
                  revoked_at = coalesce(revoked_at, now()),
                  updated_at = now()
            where tenant_id = $1::uuid
              and workspace_id = $2::uuid
              and invitation_id = $3::uuid
              and status = 'pending'
            returning invitation_id`,
          [
            tenantId,
            workspaceId,
            invitationId,
          ],
        );

        if ((revoked.rowCount ?? 0) !== 1) {
          return false;
        }

        await client.query(
          `update app.security_invitation_tokens
              set revoked_at = coalesce(revoked_at, now())
            where tenant_id = $1
              and invitation_id = $2
              and used_at is null
              and revoked_at is null`,
          [
            tenantId,
            invitationId,
          ],
        );

        return true;
      },
    );
  }

  // Consumes the signed token, creates the identity + membership and marks
  // the invitation accepted in ONE database transaction. If any later step
  // fails, the token consumption is rolled back as well, so a transient
  // failure cannot burn a valid invitation.
  //
  // Only for an email with no existing identity — use
  // acceptInvitationForExistingIdentity when one already exists (see there
  // for why a blind password cannot be accepted in that case).
  async acceptInvitation(input: {
    readonly invitation: InvitationRow;
    readonly token: string;
    readonly passwordHash: string;
    readonly displayName: string;
  }): Promise<{ readonly user: IdentityUserRow; readonly membership: IdentityMembershipRow } | null> {
    const invitation = input.invitation;
    const normalizedEmail = normalizeEmail(invitation.email);
    const identityKey = identityKeyForEmail(normalizedEmail);
    const userId = randomUUID();
    const tokenHash = createHash("sha256").update(input.token).digest("hex");

    return this.database.withIdentityTenantWorkspace(
      identityKey,
      null,
      invitation.tenantId,
      invitation.workspaceId,
      async (client) => {
        const locked = await lockAndConsumeInvitationToken(client, invitation, tokenHash);
        if (!locked) return null;

        const existing = await client.query<{ readonly user_id: string }>(
          "select user_id::text from app.identity_users where identity_key = $1 limit 1",
          [identityKey],
        );
        if (existing.rows[0]) throw new Error("IDENTITY_EMAIL_EXISTS");

        await client.query(
          `insert into app.users (
             user_id, email, full_name, status, email_verified, mfa_enabled
           ) values ($1::uuid, $2, $3, 'active', false, false)`,
          [userId, normalizedEmail, input.displayName],
        );

        const userResult = await client.query<Record<string, unknown>>(
          `insert into app.identity_users (
             user_id, identity_key, normalized_email, password_hash, display_name
           ) values ($1::uuid, $2, $3, $4, $5)
           returning user_id::text, identity_key, normalized_email, password_hash,
                     display_name, status, email_verified_at, failed_login_attempts,
                     locked_until`,
          [userId, identityKey, normalizedEmail, input.passwordHash, input.displayName],
        );
        const user = readIdentityUser(requiredRow(userResult.rows[0]));
        await setIdentityUser(client, user.userId);

        const membership = await insertMembershipAndMarkAccepted(
          client,
          invitation,
          user.userId,
          tokenHash,
        );

        return { user, membership };
      },
    );
  }

  // Existing-identity counterpart to acceptInvitation: the invited email
  // already has a PapaData account (e.g. joining a second tenant), so this
  // only adds a membership — it never creates a new app.users/
  // app.identity_users row and never accepts a blind password from the
  // client. The caller must verify the submitted (or, for OAuth accept, the
  // provider-confirmed) credential BEFORE calling this — a failed
  // verification must never reach here, since reaching here always
  // consumes the invitation token.
  async acceptInvitationForExistingIdentity(input: {
    readonly invitation: InvitationRow;
    readonly token: string;
    readonly userId: string;
    readonly identityKey: string;
  }): Promise<{ readonly membership: IdentityMembershipRow } | null> {
    const invitation = input.invitation;
    const tokenHash = createHash("sha256").update(input.token).digest("hex");

    return this.database.withIdentityTenantWorkspace(
      input.identityKey,
      input.userId,
      invitation.tenantId,
      invitation.workspaceId,
      async (client) => {
        const locked = await lockAndConsumeInvitationToken(client, invitation, tokenHash);
        if (!locked) return null;

        const alreadyMember = await client.query<{ readonly membership_id: string }>(
          `select membership_id::text
             from app.memberships
            where tenant_id = $1::uuid and workspace_id = $2::uuid and user_id = $3::uuid
            limit 1`,
          [invitation.tenantId, invitation.workspaceId, input.userId],
        );
        if (alreadyMember.rows[0]) throw new Error("ALREADY_MEMBER");

        const membership = await insertMembershipAndMarkAccepted(
          client,
          invitation,
          input.userId,
          tokenHash,
        );

        return { membership };
      },
    );
  }

}

// Shared by acceptInvitation and acceptInvitationForExistingIdentity: locks
// the invitation row and consumes its one-time token. Returns false (no
// mutation beyond the lock, which the transaction rolls back) if the
// invitation is not in an acceptable state — a failed caller-side
// verification upstream of this call must never reach it in the first
// place, since reaching here always burns the token.
async function lockAndConsumeInvitationToken(
  client: PoolClient,
  invitation: InvitationRow,
  tokenHash: string,
): Promise<boolean> {
  const lockedInvitation = await client.query<{ readonly invitation_id: string }>(
    `select invitation_id::text
       from app.invitations
      where invitation_id = $1::uuid
        and tenant_id = $2::uuid
        and workspace_id = $3::uuid
        and token_hash = $4
        and status = 'pending'
        and expires_at > now()
      for update`,
    [invitation.invitationId, invitation.tenantId, invitation.workspaceId, tokenHash],
  );
  if (!lockedInvitation.rows[0]) return false;

  const consumed = await client.query(
    `update app.security_invitation_tokens
        set used_at = now()
      where tenant_id = $1
        and invitation_id = $2
        and token_hash = $3
        and used_at is null
        and revoked_at is null
        and expires_at > now()
      returning id`,
    [invitation.tenantId, invitation.invitationId, tokenHash],
  );
  return (consumed.rowCount ?? 0) === 1;
}

// Shared by acceptInvitation and acceptInvitationForExistingIdentity: the
// membership insert and invitation status update are identical once the
// target userId is known, whether that user was just created or already
// existed.
async function insertMembershipAndMarkAccepted(
  client: PoolClient,
  invitation: InvitationRow,
  userId: string,
  tokenHash: string,
): Promise<IdentityMembershipRow> {
  const membershipId = randomUUID();
  const dataScope = dataScopeForRole(invitation.role);
  const capabilities = resolveMembershipCapabilities({
    dataScope,
    jitExpiresAt: null,
    role: invitation.role,
    status: "active",
  });

  await client.query(
    `insert into app.memberships (
       membership_id, tenant_id, workspace_id, user_id, role, status, data_scope
     ) values ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5, 'active', $6)`,
    [membershipId, invitation.tenantId, invitation.workspaceId, userId, invitation.role, dataScope],
  );

  const membershipResult = await client.query<Record<string, unknown>>(
    `insert into app.identity_memberships (
       membership_id, user_id, tenant_id, workspace_id, tenant_name, workspace_name,
       roles, capabilities
     ) values ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5, $6, $7::jsonb, $8::jsonb)
     returning membership_id::text, user_id::text, tenant_id::text,
               workspace_id::text, tenant_name, workspace_name, roles,
               capabilities, status`,
    [
      membershipId,
      userId,
      invitation.tenantId,
      invitation.workspaceId,
      invitation.tenantName,
      invitation.workspaceName,
      JSON.stringify([invitation.role]),
      JSON.stringify(capabilities),
    ],
  );

  const accepted = await client.query(
    `update app.invitations
        set status = 'accepted', accepted_by_user_id = $4::uuid,
            accepted_at = now(), updated_at = now()
      where invitation_id = $1::uuid
        and tenant_id = $2::uuid
        and workspace_id = $3::uuid
        and status = 'pending'
        and token_hash = $5
        and expires_at > now()
      returning invitation_id`,
    [invitation.invitationId, invitation.tenantId, invitation.workspaceId, userId, tokenHash],
  );
  if ((accepted.rowCount ?? 0) !== 1) {
    throw new Error("INVITATION_STATE_CHANGED");
  }

  return readMembership(requiredRow(membershipResult.rows[0]));
}

export type PasswordResetTokenLookup = {
  readonly userId: string;
  readonly identityKey: string;
  readonly normalizedEmail: string;
  readonly expiresAt: string;
};

// Real password reset, mirroring InvitationRepository's token pattern
// (single-use, expiring, hashed at rest) instead of building email
// delivery infrastructure that doesn't exist yet in this repo.
export class PasswordResetRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  // Creates the reset token in the same identity-scoped transaction as the
  // user it belongs to. The raw token is returned once and never
  // persisted; only its SHA-256 hash is stored.
  async createResetToken(input: {
    readonly user: IdentityUserRow;
    readonly ttlHours: number;
  }): Promise<{ readonly token: string; readonly expiresAt: string }> {
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + input.ttlHours * 3_600_000).toISOString();

    await this.database.withIdentity(
      input.user.identityKey,
      input.user.userId,
      async (client) => {
        await client.query(
          `insert into app.security_password_reset_tokens (
             user_id, identity_key, token_hash, expires_at
           ) values ($1::uuid, $2, $3, $4::timestamptz)`,
          [input.user.userId, input.user.identityKey, tokenHash, expiresAt],
        );
      },
    );

    return { token, expiresAt };
  }

  // Public/pre-auth lookup, mirrors findInvitationByToken: the token hash
  // is part of the SECURITY DEFINER lookup itself (migration 0033), so a
  // bare guess never discloses whether an account exists.
  async findValidToken(token: string): Promise<PasswordResetTokenLookup | null> {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const rows = await this.database.queryGlobalReadonly<Record<string, unknown>>(
      `select user_id::text, identity_key, normalized_email, expires_at
         from app.lookup_password_reset_token($1)`,
      [tokenHash],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      userId: requiredString(row.user_id),
      identityKey: requiredString(row.identity_key),
      normalizedEmail: requiredString(row.normalized_email),
      expiresAt: requiredString(row.expires_at),
    };
  }

  // Consumes the token and updates the password hash in ONE transaction,
  // mirroring acceptInvitation's lock-consume-mutate shape: re-locks the
  // token row `for update` so a concurrent use of the same token can never
  // succeed twice, and a failure after locking rolls the consumption back
  // too, so a transient failure cannot burn a valid token.
  async consumeAndResetPassword(input: {
    readonly lookup: PasswordResetTokenLookup;
    readonly token: string;
    readonly newPasswordHash: string;
  }): Promise<boolean> {
    const tokenHash = createHash("sha256").update(input.token).digest("hex");

    return this.database.withIdentity(
      input.lookup.identityKey,
      input.lookup.userId,
      async (client) => {
        const lockedToken = await client.query<{ readonly id: string }>(
          `select id
             from app.security_password_reset_tokens
            where user_id = $1::uuid
              and token_hash = $2
              and used_at is null
              and revoked_at is null
              and expires_at > now()
            for update`,
          [input.lookup.userId, tokenHash],
        );
        const lockedTokenRow = lockedToken.rows[0];
        if (!lockedTokenRow) return false;

        const consumed = await client.query(
          `update app.security_password_reset_tokens
              set used_at = now()
            where id = $1::uuid
              and used_at is null
              and revoked_at is null
              and expires_at > now()
            returning id`,
          [lockedTokenRow.id],
        );
        if ((consumed.rowCount ?? 0) !== 1) return false;

        await client.query(
          `update app.identity_users
              set password_hash = $2,
                  failed_login_attempts = 0,
                  locked_until = null,
                  updated_at = now()
            where user_id = $1::uuid`,
          [input.lookup.userId, input.newPasswordHash],
        );

        return true;
      },
    );
  }
}

export type OAuthProvider = "google" | "microsoft";

export type OAuthIntent =
  | "login"
  | "register"
  | "accept_invitation"
  | "link_account"
  | "reauth";

export type OAuthTransactionRow = {
  readonly id: string;
  readonly state: string;
  readonly provider: OAuthProvider;
  readonly intent: OAuthIntent;
  readonly nonce: string;
  readonly pkceCodeVerifier: string;
  readonly invitationId: string | null;
  readonly invitationToken: string | null;
  readonly linkingUserId: string | null;
  readonly linkingIdentityKey: string | null;
  readonly linkingTenantId: string | null;
  readonly linkingSessionId: string | null;
  readonly returnTo: string | null;
};

export type OAuthLinkLookup = {
  readonly userId: string;
  readonly identityKey: string;
};

// Real Google/Microsoft OAuth identity linking (migration 0034). This
// repository only ever resolves/records provider identity <-> user_id
// pairs — it never touches tenant, workspace, role or capability data.
// Every caller must route the actual access decision through
// IdentityRepository/InvitationRepository, the same as email/password auth.
export class IdentityOAuthRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  // Persists PKCE/state/nonce and any invitation/linking context for the
  // handshake round-trip. Deliberately uses withSystem: no identity exists
  // yet for login/register/accept_invitation, so there is no RLS context
  // to scope by (see migration 0034's comment on this table).
  async createTransaction(input: {
    readonly provider: OAuthProvider;
    readonly intent: OAuthIntent;
    readonly nonce: string;
    readonly pkceCodeVerifier: string;
    readonly invitationId?: string | null;
    readonly invitationToken?: string | null;
    readonly linkingUserId?: string | null;
    readonly linkingIdentityKey?: string | null;
    readonly linkingTenantId?: string | null;
    readonly linkingSessionId?: string | null;
    readonly returnTo?: string | null;
    readonly ttlMinutes: number;
  }): Promise<{ readonly state: string; readonly expiresAt: string }> {
    const state = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + input.ttlMinutes * 60_000).toISOString();

    await this.database.withSystem(async (client) => {
      await client.query(
        `insert into app.security_oauth_transactions (
           state, provider, intent, nonce, pkce_code_verifier,
           invitation_id, invitation_token, linking_user_id, linking_identity_key,
           linking_tenant_id, linking_session_id, return_to, expires_at
         ) values ($1, $2, $3, $4, $5, $6::uuid, $7, $8::uuid, $9, $10::uuid, $11, $12, $13::timestamptz)`,
        [
          state,
          input.provider,
          input.intent,
          input.nonce,
          input.pkceCodeVerifier,
          input.invitationId ?? null,
          input.invitationToken ?? null,
          input.linkingUserId ?? null,
          input.linkingIdentityKey ?? null,
          input.linkingTenantId ?? null,
          input.linkingSessionId ?? null,
          input.returnTo ?? null,
          expiresAt,
        ],
      );
    });

    return { state, expiresAt };
  }

  // Single-use: locks and marks the transaction consumed in one step, so a
  // replayed callback (the same `state` opened twice) can never succeed
  // twice.
  async consumeTransaction(state: string): Promise<OAuthTransactionRow | null> {
    return this.database.withSystem(async (client) => {
      const locked = await client.query<Record<string, unknown>>(
        `select id::text, state, provider, intent, nonce, pkce_code_verifier,
                invitation_id::text, invitation_token,
                linking_user_id::text, linking_identity_key,
                linking_tenant_id::text, linking_session_id, return_to
           from app.security_oauth_transactions
          where state = $1
            and consumed_at is null
            and expires_at > now()
          for update`,
        [state],
      );
      const row = locked.rows[0];
      if (!row) return null;

      const consumed = await client.query(
        `update app.security_oauth_transactions
            set consumed_at = now()
          where state = $1
            and consumed_at is null
            and expires_at > now()
          returning id`,
        [state],
      );
      if ((consumed.rowCount ?? 0) !== 1) return null;

      return readOAuthTransaction(row);
    });
  }

  // Public/pre-auth lookup, mirrors findInvitationByToken/findValidToken:
  // resolves a provider identity to a user without any identity RLS
  // context in place yet — that's precisely what this call establishes.
  // Defined by migration 0034.
  async findLinkBySubject(
    provider: OAuthProvider,
    providerSubjectId: string,
  ): Promise<OAuthLinkLookup | null> {
    const rows = await this.database.queryGlobalReadonly<Record<string, unknown>>(
      "select user_id::text, identity_key from app.lookup_oauth_link($1, $2)",
      [provider, providerSubjectId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      userId: requiredString(row.user_id),
      identityKey: requiredString(row.identity_key),
    };
  }

  // Creates or replaces the link for an already-known identity. The
  // (provider, provider_subject_id) unique index — not application logic —
  // is what actually guarantees one provider identity can never attach to
  // two different users: a conflict there surfaces as
  // OAUTH_IDENTITY_ALREADY_LINKED instead of silently overwriting.
  async createLink(input: {
    readonly userId: string;
    readonly identityKey: string;
    readonly provider: OAuthProvider;
    readonly providerSubjectId: string;
    readonly providerEmail: string;
  }): Promise<void> {
    await this.database.withIdentity(input.identityKey, input.userId, async (client) => {
      try {
        await client.query(
          `insert into app.identity_oauth_links (
             user_id, provider, provider_subject_id, provider_email, last_login_at
           ) values ($1::uuid, $2, $3, $4, now())
           on conflict (user_id, provider)
           do update set provider_subject_id = excluded.provider_subject_id,
                          provider_email = excluded.provider_email,
                          last_login_at = now()`,
          [input.userId, input.provider, input.providerSubjectId, input.providerEmail],
        );
      } catch (error) {
        if (isUniqueViolation(error, "identity_oauth_links_provider_subject_uq")) {
          throw new Error("OAUTH_IDENTITY_ALREADY_LINKED");
        }
        throw error;
      }
    });
  }

  async touchLogin(input: {
    readonly userId: string;
    readonly identityKey: string;
    readonly provider: OAuthProvider;
  }): Promise<void> {
    await this.database.withIdentity(input.identityKey, input.userId, async (client) => {
      await client.query(
        `update app.identity_oauth_links
            set last_login_at = now()
          where user_id = $1::uuid and provider = $2`,
        [input.userId, input.provider],
      );
    });
  }
}

function readOAuthTransaction(row: Record<string, unknown>): OAuthTransactionRow {
  return {
    id: requiredString(row.id),
    state: requiredString(row.state),
    provider: requiredString(row.provider) as OAuthProvider,
    intent: requiredString(row.intent) as OAuthIntent,
    nonce: requiredString(row.nonce),
    pkceCodeVerifier: requiredString(row.pkce_code_verifier),
    invitationId: nullableString(row.invitation_id),
    invitationToken: nullableString(row.invitation_token),
    linkingUserId: nullableString(row.linking_user_id),
    linkingIdentityKey: nullableString(row.linking_identity_key),
    linkingTenantId: nullableString(row.linking_tenant_id),
    linkingSessionId: nullableString(row.linking_session_id),
    returnTo: nullableString(row.return_to),
  };
}

function isUniqueViolation(error: unknown, constraintName: string): boolean {
  return (
    typeof error === "object"
    && error !== null
    && (error as { code?: unknown }).code === "23505"
    && (error as { constraint?: unknown }).constraint === constraintName
  );
}

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu.test(value);
}

// Matches resolveMembershipCapabilities' per-role dataScope requirement so
// an invited member receives the capabilities implied by their role.
function dataScopeForRole(role: string): string {
  if (role === "Tenant Owner") return "tenant";
  if (role === "Billing Admin") return "billing";
  if (role === "Auditor/Security") return "audit";
  return "workspace";
}

function readMemberListRow(row: Record<string, unknown>): MemberListRow {
  return {
    id: requiredString(row.id),
    person: requiredString(row.person),
    email: requiredString(row.email),
    role: requiredString(row.role),
    status: requiredString(row.status),
    mfa: row.mfa === true,
    lastSeenAt: nullableString(row.last_seen_at),
  };
}

function readInvitation(row: Record<string, unknown>): InvitationRow {
  return {
    invitationId: requiredString(row.invitation_id),
    tenantId: requiredString(row.tenant_id),
    workspaceId: requiredString(row.workspace_id),
    tenantName: requiredString(row.tenant_name),
    workspaceName: requiredString(row.workspace_name),
    email: requiredString(row.email),
    role: requiredString(row.role),
    status: requiredString(row.status),
    invitedByUserId: requiredString(row.invited_by_user_id),
    expiresAt: requiredString(row.expires_at),
  };
}

export function identityKeyForEmail(email: string): string {
  return createHash("sha256").update(normalizeEmail(email)).digest("hex");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function sourceStream(domain: string, entityType: string): string | null {
  const key = `${domain}:${entityType}`;
  return {
    "commerce:order": "orders",
    "commerce:product": "products",
    "commerce:customer": "customers",
    "marketing:campaign": "ad_spend",
    "analytics:traffic_snapshot": "traffic",
  }[key] ?? null;
}

function readIdentityUser(row: Record<string, unknown>): IdentityUserRow {
  return {
    userId: requiredString(row.user_id),
    identityKey: requiredString(row.identity_key),
    normalizedEmail: requiredString(row.normalized_email),
    passwordHash: requiredString(row.password_hash),
    displayName: requiredString(row.display_name),
    status: requiredString(row.status) as IdentityUserRow["status"],
    emailVerifiedAt: nullableString(row.email_verified_at),
    failedLoginAttempts: Number(row.failed_login_attempts ?? 0),
    lockedUntil: nullableString(row.locked_until),
  };
}

function readMembership(row: Record<string, unknown>): IdentityMembershipRow {
  return {
    membershipId: requiredString(row.membership_id),
    userId: requiredString(row.user_id),
    tenantId: requiredString(row.tenant_id),
    workspaceId: requiredString(row.workspace_id),
    tenantName: requiredString(row.tenant_name),
    workspaceName: requiredString(row.workspace_name),
    roles: readStringArray(row.roles),
    capabilities: readStringArray(row.capabilities) as readonly CanonicalCapability[],
    status: requiredString(row.status),
  };
}

function readDomainRecord(row: Record<string, unknown>): ProductDomainRecord {
  return {
    id: requiredString(row.record_id),
    domain: requiredString(row.domain),
    entityType: requiredString(row.entity_type),
    externalKey: requiredString(row.external_key),
    status: requiredString(row.status),
    data: isRecord(row.data) ? row.data : {},
    version: Number(row.version),
    createdAt: requiredString(row.created_at),
    updatedAt: requiredString(row.updated_at),
  };
}

async function setIdentityUser(client: PoolClient, userId: string): Promise<void> {
  await client.query("select set_config('app.identity_user_id', $1, true)", [userId]);
}


function requiredRow(value: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!value) throw new Error("Database operation did not return a row.");
  return value;
}

function requiredString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "string" || value.length === 0) throw new Error("Database row is invalid.");
  return value;
}

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return requiredString(value);
}

function readStringArray(value: unknown): readonly string[] {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) return value;
  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/gu, "\\$&");
}
