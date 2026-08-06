import { createHash } from "node:crypto";
import { ProductionDatabase } from "./production.js";

function normalizeStable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeStable);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, normalizeStable(item)]),
    );
  }
  return value;
}

function stable(value: unknown): string {
  return JSON.stringify(normalizeStable(value));
}

export class SecurityRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  saveMfaEnrollment(input: {
    tenantId: string;
    userId: string;
    encryptedSecret: string;
    recoveryCodeHashes: readonly string[];
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      "security",
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.security_mfa_enrollments (
             tenant_id, user_id, method, encrypted_secret, status,
             recovery_code_hashes
           ) values ($1, $2, 'totp', $3, 'pending', $4::jsonb)
           on conflict (tenant_id, user_id, method) do update
           set encrypted_secret = excluded.encrypted_secret,
               recovery_code_hashes = excluded.recovery_code_hashes,
               status = 'pending', confirmed_at = null, revoked_at = null
           returning *`,
          [
            input.tenantId,
            input.userId,
            input.encryptedSecret,
            JSON.stringify(input.recoveryCodeHashes),
          ],
        );
        const row = result.rows[0];
        if (!row) throw new Error("MFA enrollment was not persisted");
        return row;
      },
    );
  }

  findMfaEnrollment(
    tenantId: string,
    userId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.database.withTenantWorkspace(
      tenantId,
      "security",
      async (client) => (await client.query<Record<string, unknown>>(
        `select * from app.security_mfa_enrollments
         where tenant_id = $1 and user_id = $2 and method = 'totp'
         limit 1`,
        [tenantId, userId],
      )).rows[0] ?? null,
    );
  }

  async activateMfaEnrollment(tenantId: string, userId: string): Promise<void> {
    await this.database.withTenantWorkspace(
      tenantId,
      "security",
      async (client) => {
        await client.query(
          `update app.security_mfa_enrollments
           set status = 'active', confirmed_at = now()
           where tenant_id = $1 and user_id = $2`,
          [tenantId, userId],
        );
      },
    );
  }

  async saveStepUpProof(input: {
    tenantId: string;
    userId: string;
    sessionId: string;
    proofHash: string;
    assuranceLevel: string;
    operationScope: string;
    targetReference: string | null;
    issuedAt: string;
    expiresAt: string;
  }): Promise<void> {
    await this.database.withTenantWorkspace(
      input.tenantId,
      "security",
      async (client) => {
        await client.query(
          `insert into app.security_step_up_proofs (
             tenant_id, user_id, session_id, proof_hash, assurance_level,
             operation_scope, target_reference, issued_at, expires_at
           ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            input.tenantId,
            input.userId,
            input.sessionId,
            input.proofHash,
            input.assuranceLevel,
            input.operationScope,
            input.targetReference,
            input.issuedAt,
            input.expiresAt,
          ],
        );
      },
    );
  }

  consumeStepUpProof(input: {
    tenantId: string;
    userId: string;
    sessionId: string;
    proofHash: string;
    operationScope: string;
    targetReference: string | null;
  }): Promise<boolean> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      "security",
      async (client) => (await client.query(
        `update app.security_step_up_proofs
         set consumed_at = now()
         where tenant_id = $1 and user_id = $2 and session_id = $3
           and proof_hash = $4 and operation_scope = $5
           and target_reference is not distinct from $6
           and consumed_at is null and revoked_at is null and expires_at > now()
         returning id`,
        [
          input.tenantId,
          input.userId,
          input.sessionId,
          input.proofHash,
          input.operationScope,
          input.targetReference,
        ],
      )).rowCount === 1,
    );
  }

  async saveInvitationToken(input: {
    tenantId: string;
    invitationId: string;
    tokenVersion: number;
    tokenHash: string;
    issuedAt: string;
    expiresAt: string;
  }): Promise<void> {
    await this.database.withTenantWorkspace(
      input.tenantId,
      "security",
      async (client) => {
        await client.query(
          `update app.security_invitation_tokens
           set revoked_at = now(), replaced_by_token_version = $3
           where tenant_id = $1 and invitation_id = $2
             and revoked_at is null and used_at is null`,
          [input.tenantId, input.invitationId, input.tokenVersion],
        );
        await client.query(
          `insert into app.security_invitation_tokens (
             tenant_id, invitation_id, token_version, token_hash,
             issued_at, expires_at
           ) values ($1, $2, $3, $4, $5, $6)`,
          [
            input.tenantId,
            input.invitationId,
            input.tokenVersion,
            input.tokenHash,
            input.issuedAt,
            input.expiresAt,
          ],
        );
      },
    );
  }

  consumeInvitationToken(input: {
    tenantId: string;
    invitationId: string;
    tokenHash: string;
  }): Promise<boolean> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      "security",
      async (client) => (await client.query(
        `update app.security_invitation_tokens
         set used_at = now()
         where tenant_id = $1 and invitation_id = $2 and token_hash = $3
           and used_at is null and revoked_at is null and expires_at > now()
         returning id`,
        [input.tenantId, input.invitationId, input.tokenHash],
      )).rowCount === 1,
    );
  }
}

export type AuditAppendInput = {
  chainScope: string;
  tenantId: string;
  workspaceId: string | null;
  actorId: string;
  actorType: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  outcome: string;
  correlationId: string;
  metadata: Readonly<Record<string, unknown>>;
};

export class AuditRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  append(input: AuditAppendInput): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        await client.query(
          "select pg_advisory_xact_lock(hashtext($1))",
          [input.chainScope],
        );
        await client.query(
          `insert into app.audit_chain_heads (chain_scope)
           values ($1) on conflict do nothing`,
          [input.chainScope],
        );
        const head = (await client.query<{
          latest_sequence: string;
          latest_hash: string | null;
        }>(
          `select latest_sequence, latest_hash
           from app.audit_chain_heads
           where chain_scope = $1
           for update`,
          [input.chainScope],
        )).rows[0] ?? { latest_sequence: "0", latest_hash: null };
        const sequence = BigInt(head.latest_sequence) + 1n;
        const createdAt = new Date().toISOString();
        const eventHash = createHash("sha256").update(stable({
          ...input,
          sequence: sequence.toString(),
          previousHash: head.latest_hash,
          createdAt,
        })).digest("hex");
        const result = await client.query<Record<string, unknown>>(
          `insert into app.security_audit_events (
             chain_scope, sequence_number, tenant_id, workspace_id,
             actor_id, actor_type, action, resource_type, resource_id,
             outcome, correlation_id, metadata, previous_hash, event_hash,
             created_at
           ) values (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
             $12::jsonb, $13, $14, $15
           ) returning *`,
          [
            input.chainScope,
            sequence.toString(),
            input.tenantId,
            input.workspaceId,
            input.actorId,
            input.actorType,
            input.action,
            input.resourceType,
            input.resourceId,
            input.outcome,
            input.correlationId,
            JSON.stringify(input.metadata),
            head.latest_hash,
            eventHash,
            createdAt,
          ],
        );
        await client.query(
          `update app.audit_chain_heads
           set latest_sequence = $2, latest_hash = $3, updated_at = now()
           where chain_scope = $1`,
          [input.chainScope, sequence.toString(), eventHash],
        );
        const row = result.rows[0];
        if (!row) throw new Error("Audit event was not inserted");
        return row;
      },
    );
  }

  verify(
    tenantId: string,
    chainScope: string,
  ): Promise<{
    valid: boolean;
    checkedEvents: number;
    firstInvalidSequence: string | null;
    latestHash: string | null;
  }> {
    return this.database.withTenantWorkspace(
      tenantId,
      null,
      async (client) => {
        const rows = (await client.query<Record<string, unknown>>(
          `select * from app.security_audit_events
           where chain_scope = $1 and tenant_id::text = $2
           order by sequence_number`,
          [chainScope, tenantId],
        )).rows;
        let previousHash: string | null = null;
        let checked = 0;
        for (const row of rows) {
          const createdAt = String(row.created_at);
          const expected: string = createHash("sha256").update(stable({
            chainScope: row.chain_scope,
            tenantId: row.tenant_id,
            workspaceId: row.workspace_id,
            actorId: row.actor_id,
            actorType: row.actor_type,
            action: row.action,
            resourceType: row.resource_type,
            resourceId: row.resource_id,
            outcome: row.outcome,
            correlationId: row.correlation_id,
            metadata: row.metadata,
            sequence: String(row.sequence_number),
            previousHash,
            createdAt,
          })).digest("hex");
          checked += 1;
          if (row.previous_hash !== previousHash || row.event_hash !== expected) {
            return {
              valid: false,
              checkedEvents: checked,
              firstInvalidSequence: String(row.sequence_number),
              latestHash: previousHash,
            };
          }
          previousHash = String(row.event_hash);
        }
        return {
          valid: true,
          checkedEvents: checked,
          firstInvalidSequence: null,
          latestHash: previousHash,
        };
      },
    );
  }
}

export class PrivacyRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  createRequest(input: {
    tenantId: string;
    workspaceId: string | null;
    subjectReference: string;
    requestType: string;
    correlationId: string;
    dueAt: string;
    targets: readonly string[];
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.privacy_requests (
             tenant_id, workspace_id, subject_reference, request_type,
             status, requested_at, due_at, correlation_id
           ) values ($1, $2, $3, $4, 'identity_verification_pending', now(), $5, $6)
           returning *`,
          [
            input.tenantId,
            input.workspaceId,
            input.subjectReference,
            input.requestType,
            input.dueAt,
            input.correlationId,
          ],
        );
        const row = result.rows[0];
        if (!row) throw new Error("Privacy request was not inserted");
        for (const system of input.targets) {
          await client.query(
            `insert into app.privacy_request_targets (request_id, system, status)
             values ($1, $2, 'pending')`,
            [row.id, system],
          );
        }
        return row;
      },
    );
  }

  async updateTarget(input: {
    tenantId: string;
    workspaceId: string | null;
    requestId: string;
    system: string;
    status: string;
    evidenceReference: string | null;
    errorCode: string | null;
  }): Promise<void> {
    await this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        await client.query(
          `update app.privacy_request_targets
           set status = $3, evidence_reference = $4, error_code = $5,
               attempts = attempts + 1, updated_at = now()
           where request_id = $1 and system = $2`,
          [
            input.requestId,
            input.system,
            input.status,
            input.evidenceReference,
            input.errorCode,
          ],
        );
      },
    );
  }

  approveRequest(input: {
    tenantId: string;
    workspaceId: string | null;
    requestId: string;
    approvedBy: string;
  }): Promise<Record<string, unknown> | null> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => (await client.query<Record<string, unknown>>(
        `update app.privacy_requests
         set status = 'approved', approved_by = $3, approved_at = now()
         where tenant_id::text = $1 and id = $2
           and status = 'identity_verification_pending' and legal_hold = false
         returning *`,
        [input.tenantId, input.requestId, input.approvedBy],
      )).rows[0] ?? null,
    );
  }

  async markQueued(input: {
    tenantId: string;
    workspaceId: string | null;
    requestId: string;
  }): Promise<void> {
    await this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        await client.query(
          `update app.privacy_requests
           set status = 'queued'
           where tenant_id::text = $1 and id = $2 and status = 'approved'`,
          [input.tenantId, input.requestId],
        );
      },
    );
  }
}

export class ReportRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  create(input: {
    tenantId: string;
    workspaceId: string;
    reportType: string;
    format: string;
    dateFrom: string;
    dateTo: string;
    filters: Readonly<Record<string, unknown>>;
    idempotencyKey: string;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.report_requests (
             tenant_id, workspace_id, report_type, format, status,
             date_from, date_to, filters, idempotency_key
           ) values ($1, $2, $3, $4, 'queued', $5, $6, $7::jsonb, $8)
           on conflict (tenant_id, workspace_id, idempotency_key) do update
           set idempotency_key = excluded.idempotency_key
           returning *`,
          [
            input.tenantId,
            input.workspaceId,
            input.reportType,
            input.format,
            input.dateFrom,
            input.dateTo,
            JSON.stringify(input.filters),
            input.idempotencyKey,
          ],
        );
        const row = result.rows[0];
        if (!row) throw new Error("Report request was not inserted");
        return row;
      },
    );
  }

  find(
    tenantId: string,
    workspaceId: string,
    reportId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => (await client.query<Record<string, unknown>>(
        `select * from app.report_requests
         where tenant_id::text = $1 and workspace_id::text = $2 and id = $3
         limit 1`,
        [tenantId, workspaceId, reportId],
      )).rows[0] ?? null,
    );
  }
}
