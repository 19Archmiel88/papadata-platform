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
      const streams = await client.query<{ readonly stream: string; readonly records: number; readonly latest: string | null }>(
        `select stream, count(*)::int as records,
                coalesce(max(business_time), max(ingested_at))::text as latest
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
        generatedAt: new Date().toISOString(),
        readiness: streams.rows.length > 0 ? "ready" : "not_ready",
        integrationStreams: streams.rows,
        domainCounts: domainCounts.rows,
      };
    });
  }
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

  // Consumes the signed token, creates the identity + membership and marks
  // the invitation accepted in ONE database transaction. If any later step
  // fails, the token consumption is rolled back as well, so a transient
  // failure cannot burn a valid invitation.
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
    const membershipId = randomUUID();
    const tokenHash = createHash("sha256").update(input.token).digest("hex");
    const dataScope = dataScopeForRole(invitation.role);
    const capabilities = resolveMembershipCapabilities({
      dataScope,
      jitExpiresAt: null,
      role: invitation.role,
      status: "active",
    });

    return this.database.withIdentityTenantWorkspace(
      identityKey,
      null,
      invitation.tenantId,
      invitation.workspaceId,
      async (client) => {
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
          [
            invitation.invitationId,
            invitation.tenantId,
            invitation.workspaceId,
            tokenHash,
          ],
        );
        if (!lockedInvitation.rows[0]) return null;

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
        if ((consumed.rowCount ?? 0) !== 1) return null;

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
          `insert into app.memberships (
             membership_id, tenant_id, workspace_id, user_id, role, status, data_scope
           ) values ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5, 'active', $6)`,
          [
            membershipId,
            invitation.tenantId,
            invitation.workspaceId,
            userId,
            invitation.role,
            dataScope,
          ],
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
          [
            invitation.invitationId,
            invitation.tenantId,
            invitation.workspaceId,
            user.userId,
            tokenHash,
          ],
        );
        if ((accepted.rowCount ?? 0) !== 1) {
          throw new Error("INVITATION_STATE_CHANGED");
        }

        return {
          user,
          membership: readMembership(requiredRow(membershipResult.rows[0])),
        };
      },
    );
  }

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
