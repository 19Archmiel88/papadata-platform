import { createHash } from "node:crypto";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import type { MvpIntegrationCatalogProviderId } from "@papadata/contracts";

export type DatabaseConfig = {
  readonly connectionString: string;
  readonly max: number;
  readonly statementTimeoutMs: number;
};

export class ProductionDatabase {
  readonly pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      connectionString: config.connectionString,
      max: config.max,
      statement_timeout: config.statementTimeoutMs,
      application_name: "papadata-platform",
    });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async checkHealth(): Promise<boolean> {
    const result = await this.pool.query<{ ok: number }>("select 1 as ok");
    return result.rows[0]?.ok === 1;
  }

  async withTenantWorkspace<T>(
    tenantId: string,
    workspaceId: string,
    operation: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query("begin");
      await client.query(
        "select set_config('app.tenant_id', $1, true)",
        [tenantId],
      );
      await client.query(
        "select set_config('app.workspace_id', $1, true)",
        [workspaceId],
      );

      const result = await operation(client);

      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async query<T extends QueryResultRow>(
    text: string,
    values: readonly unknown[] = [],
  ): Promise<readonly T[]> {
    const result = await this.pool.query<T>(text, [...values]);
    return result.rows;
  }
}

export class IntegrationRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  async listConnections(
    tenantId: string,
    workspaceId: string,
  ): Promise<readonly Record<string, unknown>[]> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `select
             connection_id as id,
             connection.*
           from app.integration_connections as connection
           where tenant_id = $1
             and workspace_id = $2
             and deleted_at is null
           order by created_at desc`,
          [tenantId, workspaceId],
        );

        return result.rows;
      },
    );
  }

  async findConnection(
    tenantId: string,
    workspaceId: string,
    connectionId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `select
             connection_id as id,
             connection.*
           from app.integration_connections as connection
           where tenant_id = $1
             and workspace_id = $2
             and connection_id = $3
             and deleted_at is null
           limit 1`,
          [tenantId, workspaceId, connectionId],
        );

        return result.rows[0] ?? null;
      },
    );
  }

  async createConnection(input: {
    tenantId: string;
    workspaceId: string;
    providerId: string;
    credentialReference: string;
    requestedScopes: readonly string[];
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.integration_connections (
             connection_id,
             tenant_id,
             workspace_id,
             provider_id,
             status,
             credential_ref,
             requested_scopes,
             granted_scopes,
             connected_at,
             created_at,
             updated_at
           )
           values (
             gen_random_uuid(),
             $1,
             $2,
             $3,
             'account_selection_required',
             $4,
             $5::jsonb,
             '[]'::jsonb,
             now(),
             now(),
             now()
           )
           returning connection_id as id, *`,
          [
            input.tenantId,
            input.workspaceId,
            input.providerId,
            input.credentialReference,
            JSON.stringify(input.requestedScopes),
          ],
        );

        const row = result.rows[0];

        if (!row) {
          throw new Error("Connection insert did not return a row");
        }

        return row;
      },
    );
  }

  async listJobs(
    tenantId: string,
    workspaceId: string,
  ): Promise<readonly Record<string, unknown>[]> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `select
             sync_job_id as id,
             job.*
           from app.sync_jobs as job
           where tenant_id = $1
             and workspace_id = $2
           order by created_at desc
           limit 100`,
          [tenantId, workspaceId],
        );

        return result.rows;
      },
    );
  }

  async findJob(
    tenantId: string,
    workspaceId: string,
    jobId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `select
             sync_job_id as id,
             job.*
           from app.sync_jobs as job
           where tenant_id = $1
             and workspace_id = $2
             and sync_job_id = $3
           limit 1`,
          [tenantId, workspaceId, jobId],
        );

        return result.rows[0] ?? null;
      },
    );
  }

  async markJobCancelled(
    tenantId: string,
    workspaceId: string,
    jobId: string,
  ): Promise<boolean> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const result = await client.query(
          `update app.sync_jobs
           set
             status = 'cancelled',
             completed_at = coalesce(completed_at, now())
           where tenant_id = $1
             and workspace_id = $2
             and sync_job_id = $3
             and status in (
               'queued',
               'rate_limited',
               'running'
             )
           returning sync_job_id`,
          [tenantId, workspaceId, jobId],
        );

        return result.rowCount === 1;
      },
    );
  }

  async markConnectionDeleted(
    tenantId: string,
    workspaceId: string,
    connectionId: string,
  ): Promise<boolean> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const result = await client.query(
          `update app.integration_connections
           set
             status = 'disconnected',
             disconnected_at = coalesce(disconnected_at, now()),
             deleted_at = coalesce(deleted_at, now()),
             updated_at = now()
           where tenant_id = $1
             and workspace_id = $2
             and connection_id = $3
             and deleted_at is null
           returning connection_id`,
          [tenantId, workspaceId, connectionId],
        );

        return result.rowCount === 1;
      },
    );
  }

  async createJob(input: {
    tenantId: string;
    workspaceId: string;
    connectionId: string;
    providerId: string;
    operation: "backfill" | "incremental_sync";
    streams: readonly string[];
    from: string | null;
    to: string | null;
    idempotencyKey: string;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.sync_jobs (
             sync_job_id,
             tenant_id,
             workspace_id,
             connection_id,
             provider_id,
             job_kind,
             operation,
             status,
             streams,
             from_time,
             to_time,
             idempotency_key,
             attempts,
             max_attempts,
             created_at
           )
           values (
             gen_random_uuid(),
             $1,
             $2,
             $3,
             $4,
             $5,
             $5,
             'queued',
             $6::text[],
             $7,
             $8,
             $9,
             1,
             5,
             now()
           )
           on conflict (
             tenant_id,
             workspace_id,
             idempotency_key
           )
           do update
             set idempotency_key = excluded.idempotency_key
           returning sync_job_id as id, *`,
          [
            input.tenantId,
            input.workspaceId,
            input.connectionId,
            input.providerId,
            input.operation,
            [...input.streams],
            input.from,
            input.to,
            input.idempotencyKey,
          ],
        );

        const row = result.rows[0];

        if (!row) {
          throw new Error("Job insert did not return a row");
        }

        return row;
      },
    );
  }
}

export type IntegrationCredentialMetadata = {
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly connectionId: string;
  readonly credentialReference: string;
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly secretResource: string;
  readonly activeVersion: string;
  readonly previousVersion: string | null;
  readonly rotationState:
    | "active"
    | "verifying_new"
    | "rotating"
    | "previous"
    | "revoked";
  readonly status: string;
  readonly expiresAt: string | null;
  readonly revokedAt: string | null;
  readonly lastVerifiedAt: string | null;
};

export type IntegrationCredentialAccessAuditEvent = {
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly connectionId: string;
  readonly credentialReference: string;
  readonly provider: MvpIntegrationCatalogProviderId;
  readonly outcome: "granted" | "denied";
  readonly failureReason: string | null;
  readonly credentialVersion: string | null;
};

export class IntegrationCredentialRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  async findCredentialMetadata(input: {
    tenantId: string;
    workspaceId: string;
    connectionId: string;
    credentialReference: string;
    provider: MvpIntegrationCatalogProviderId;
  }): Promise<IntegrationCredentialMetadata | null> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<IntegrationCredentialMetadata>(
          `select
             credential.tenant_id::text as "tenantId",
             credential.workspace_id::text as "workspaceId",
             credential.connection_id::text as "connectionId",
             coalesce(credential.credential_reference, credential.secret_reference) as "credentialReference",
             credential.provider_id as "providerId",
             coalesce(credential.secret_resource, credential.secret_reference) as "secretResource",
             coalesce(credential.active_version, 'latest') as "activeVersion",
             credential.previous_version as "previousVersion",
             coalesce(credential.rotation_state, 'active') as "rotationState",
             credential.status,
             credential.expires_at::text as "expiresAt",
             credential.revoked_at::text as "revokedAt",
             credential.last_verified_at::text as "lastVerifiedAt"
           from app.integration_connections as connection
           join app.integration_credentials as credential
             on credential.tenant_id::text = connection.tenant_id::text
            and credential.workspace_id::text = connection.workspace_id::text
            and credential.connection_id = connection.connection_id
            and credential.provider_id = connection.provider_id
           where connection.tenant_id::text = $1
             and connection.workspace_id::text = $2
             and connection.connection_id::text = $3
             and connection.provider_id = $4
             and coalesce(connection.credential_ref, '') = $5
             and coalesce(credential.credential_reference, credential.secret_reference) = $5
             and connection.deleted_at is null
           order by credential.updated_at desc
           limit 1`,
          [
            input.tenantId,
            input.workspaceId,
            input.connectionId,
            input.provider,
            input.credentialReference,
          ],
        );

        return result.rows[0] ?? null;
      },
    );
  }

  async recordCredentialAccess(
    event: IntegrationCredentialAccessAuditEvent,
  ): Promise<void> {
    await this.database.withTenantWorkspace(
      event.tenantId,
      event.workspaceId,
      async (client) => {
        await client.query(
          `insert into app.integration_credential_events (
             tenant_id,
             workspace_id,
             connection_id,
             event_type,
             actor_id,
             required_scopes,
             granted_scopes,
             evidence_reference,
             created_at
           )
           values (
             $1,
             $2,
             $3,
             $4,
             'system:credential-provider',
             '[]'::jsonb,
             '[]'::jsonb,
             $5,
             now()
           )`,
          [
            event.tenantId,
            event.workspaceId,
            event.connectionId,
            `credential_access_${event.outcome}`,
            credentialAuditEvidence(event),
          ],
        );
      },
    );
  }
}

function credentialAuditEvidence(
  event: IntegrationCredentialAccessAuditEvent,
): string {
  const referenceHash = createHash("sha256")
    .update(event.credentialReference)
    .digest("hex")
    .slice(0, 16);
  return [
    "credential",
    event.provider,
    event.outcome,
    referenceHash,
    event.credentialVersion ?? "none",
    event.failureReason ?? "ok",
  ].join(":");
}

export type DurableSourceRecordInput = {
  readonly stream: string;
  readonly externalId: string;
  readonly observedAt: string;
  readonly payload: unknown;
};

export type DurablePersistFetchedPageInput = {
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly connectionId: string;
  readonly providerId: string;
  readonly syncJobId: string;
  readonly checkpointStream: string;
  readonly fetchedRecords: readonly DurableSourceRecordInput[];
  readonly nextCheckpoint: string | null;
  readonly attempt: number;
  readonly correlationId: string;
  readonly fetchStartedAt: string;
  readonly fetchFinishedAt: string;
};

export type DurablePersistFetchedPageResult = {
  readonly sourceBatchId: string;
  readonly fetchedCount: number;
  readonly persistedSourceCount: number;
  readonly duplicateCount: number;
};

export type DurableBatchProcessInput = {
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly connectionId: string;
  readonly providerId: string;
  readonly syncJobId: string;
  readonly sourceBatchId: string;
};

export type DurableBatchProcessResult = {
  readonly count: number;
};

export type DurableReconciliationInput = DurableBatchProcessInput & {
  readonly fetchedCount: number;
  readonly persistedSourceCount: number;
  readonly normalizedCount: number;
  readonly canonicalCount: number;
  readonly duplicateCount: number;
  readonly rejectedCount: number;
  readonly failedCount: number;
};

export type DurableReconciliationResult = {
  readonly reconciliationRunId: string;
  readonly status: "failed" | "passed" | "partial";
  readonly failureReason: string | null;
};

export class DurableIntegrationIngestionRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  async acquireLease(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly syncJobId: string;
    readonly leaseOwner: string;
    readonly leaseExpiresAt: string;
    readonly attempt: number;
  }): Promise<boolean> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query(
          `update app.sync_jobs
           set
             status = 'leased',
             lease_owner = $4,
             lease_expires_at = $5,
             heartbeat_at = now(),
             started_at = coalesce(started_at, now()),
             attempts = greatest(attempts, $6),
             updated_at = now()
           where tenant_id::text = $1
             and workspace_id::text = $2
             and sync_job_id = $3
             and (
               status in (
                 'queued',
                 'retry_wait',
                 'retryable_failed'
               )
               or (
                 status in (
                   'leased',
                   'fetching',
                   'persisting_source',
                   'normalizing',
                   'writing_canonical',
                   'reconciling'
                 )
                 and lease_expires_at < now()
               )
             )
           returning sync_job_id`,
          [
            input.tenantId,
            input.workspaceId,
            input.syncJobId,
            input.leaseOwner,
            input.leaseExpiresAt,
            input.attempt,
          ],
        );

        return result.rowCount === 1;
      },
    );
  }

  async transitionJobState(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly syncJobId: string;
    readonly leaseOwner: string;
    readonly fromState: string;
    readonly toState: string;
  }): Promise<boolean> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query(
          `update app.sync_jobs
           set
             status = $5,
             heartbeat_at = now(),
             updated_at = now()
           where tenant_id::text = $1
             and workspace_id::text = $2
             and sync_job_id = $3
             and lease_owner = $4
             and status = $6
           returning sync_job_id`,
          [
            input.tenantId,
            input.workspaceId,
            input.syncJobId,
            input.leaseOwner,
            input.toState,
            input.fromState,
          ],
        );

        return result.rowCount === 1;
      },
    );
  }

  async isCancelRequested(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly syncJobId: string;
  }): Promise<boolean> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<{ cancel_requested: boolean }>(
          `select
             (
               status = 'cancel_requested'
               or cancel_requested_at is not null
             ) as cancel_requested
           from app.sync_jobs
           where tenant_id::text = $1
             and workspace_id::text = $2
             and sync_job_id = $3
           limit 1`,
          [
            input.tenantId,
            input.workspaceId,
            input.syncJobId,
          ],
        );

        return result.rows[0]?.cancel_requested === true;
      },
    );
  }

  async readCheckpoint(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly connectionId: string;
    readonly providerId: string;
    readonly stream: string;
  }): Promise<string | null> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<{ cursor: string }>(
          `select cursor
           from app.sync_checkpoints
           where tenant_id::text = $1
             and workspace_id::text = $2
             and connection_id = $3
             and provider_id = $4
             and stream = $5
           order by updated_at desc
           limit 1`,
          [
            input.tenantId,
            input.workspaceId,
            input.connectionId,
            input.providerId,
            input.stream,
          ],
        );

        return result.rows[0]?.cursor ?? null;
      },
    );
  }

  async persistFetchedPage(
    input: DurablePersistFetchedPageInput,
  ): Promise<DurablePersistFetchedPageResult> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => persistFetchedPageInTransaction(client, input),
    );
  }

  async normalizeBatch(
    input: DurableBatchProcessInput,
  ): Promise<DurableBatchProcessResult> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<{ normalized_record_id: string }>(
          `insert into app.normalized_records (
             normalized_record_id,
             tenant_id,
             workspace_id,
             source_record_id,
             provider_id,
             stream,
             external_id,
             payload,
             validation_status,
             normalized_at
           )
           select
             gen_random_uuid(),
             tenant_id,
             workspace_id,
             source_record_id,
             provider_id,
             stream,
             external_id,
             jsonb_build_object(
               'providerId', provider_id,
               'stream', stream,
               'externalId', external_id,
               'payload', payload
             ),
             'valid',
             now()
           from app.source_records
           where tenant_id::text = $1
             and workspace_id::text = $2
             and connection_id = $3
             and provider_id = $4
             and source_batch_id = $5
           on conflict (source_record_id)
           do update
             set
               payload = excluded.payload,
               validation_status = excluded.validation_status,
               normalized_at = now()
           returning normalized_record_id::text`,
          [
            input.tenantId,
            input.workspaceId,
            input.connectionId,
            input.providerId,
            input.sourceBatchId,
          ],
        );

        return { count: result.rowCount ?? 0 };
      },
    );
  }

  async writeCanonicalRecords(
    input: DurableBatchProcessInput,
  ): Promise<DurableBatchProcessResult> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<{ canonical_record_id: string }>(
          `insert into app.integration_canonical_records (
             canonical_record_id,
             tenant_id,
             workspace_id,
             source_record_id,
             connection_id,
             provider_id,
             stream,
             external_id,
             canonical_payload,
             canonical_version,
             source_lineage,
             business_time,
             ingested_at,
             updated_at
           )
           select
             gen_random_uuid(),
             source.tenant_id,
             source.workspace_id,
             source.source_record_id,
             source.connection_id,
             source.provider_id,
             source.stream,
             source.external_id,
             normalized.payload,
             'integration.canonical.v1',
             jsonb_build_object(
               'sourceRecordId', source.source_record_id,
               'sourceBatchId', source.source_batch_id,
               'syncJobId', $6::uuid,
               'providerId', source.provider_id
             ),
             source.provider_updated_at,
             now(),
             now()
           from app.source_records as source
           join app.normalized_records as normalized
             on normalized.source_record_id = source.source_record_id
           where source.tenant_id::text = $1
             and source.workspace_id::text = $2
             and source.connection_id = $3
             and source.provider_id = $4
             and source.source_batch_id = $5
           on conflict (source_record_id)
           do update
             set
               canonical_payload = excluded.canonical_payload,
               source_lineage = excluded.source_lineage,
               business_time = excluded.business_time,
               updated_at = now()
           returning canonical_record_id::text`,
          [
            input.tenantId,
            input.workspaceId,
            input.connectionId,
            input.providerId,
            input.sourceBatchId,
            input.syncJobId,
          ],
        );

        return { count: result.rowCount ?? 0 };
      },
    );
  }

  async writeReconciliation(
    input: DurableReconciliationInput,
  ): Promise<DurableReconciliationResult> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const status = reconciliationStatus(input);
        const failureReason = reconciliationFailureReason(input);
        const result = await client.query<{
          reconciliationRunId: string;
          status: "failed" | "passed" | "partial";
          failureReason: string | null;
        }>(
          `insert into app.integration_reconciliation_runs (
             reconciliation_run_id,
             tenant_id,
             workspace_id,
             connection_id,
             provider_id,
             sync_job_id,
             source_batch_id,
             fetched_count,
             persisted_source_count,
             normalized_count,
             canonical_count,
             rejected_count,
             duplicate_count,
             failed_count,
             status,
             failure_reason,
             created_at
           )
           values (
             gen_random_uuid(),
             $1,
             $2,
             $3,
             $4,
             $5,
             $6,
             $7,
             $8,
             $9,
             $10,
             $11,
             $12,
             $13,
             $14,
             $15,
             now()
           )
           returning
             reconciliation_run_id::text as "reconciliationRunId",
             status,
             failure_reason as "failureReason"`,
          [
            input.tenantId,
            input.workspaceId,
            input.connectionId,
            input.providerId,
            input.syncJobId,
            input.sourceBatchId,
            input.fetchedCount,
            input.persistedSourceCount,
            input.normalizedCount,
            input.canonicalCount,
            input.rejectedCount,
            input.duplicateCount,
            input.failedCount,
            status,
            failureReason,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Reconciliation insert did not return a row");
        }
        return row;
      },
    );
  }

  async finalizeSucceeded(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly syncJobId: string;
    readonly leaseOwner: string;
    readonly nextCheckpoint: string | null;
  }): Promise<boolean> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query(
          `update app.sync_jobs
           set
             status = 'succeeded',
             checkpoint = $5::jsonb,
             completed_at = now(),
             heartbeat_at = now(),
             updated_at = now()
           where tenant_id::text = $1
             and workspace_id::text = $2
             and sync_job_id = $3
             and lease_owner = $4
             and status = 'reconciling'
             and exists (
               select 1
               from app.integration_reconciliation_runs
               where sync_job_id = $3
                 and status = 'passed'
             )
           returning sync_job_id`,
          [
            input.tenantId,
            input.workspaceId,
            input.syncJobId,
            input.leaseOwner,
            JSON.stringify({ cursor: input.nextCheckpoint }),
          ],
        );

        return result.rowCount === 1;
      },
    );
  }

  async markCancelled(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly syncJobId: string;
    readonly leaseOwner: string;
  }): Promise<void> {
    await this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        await client.query(
          `update app.sync_jobs
           set
             status = 'cancelled',
             completed_at = coalesce(completed_at, now()),
             heartbeat_at = now(),
             updated_at = now()
           where tenant_id::text = $1
             and workspace_id::text = $2
             and sync_job_id = $3
             and lease_owner = $4`,
          [
            input.tenantId,
            input.workspaceId,
            input.syncJobId,
            input.leaseOwner,
          ],
        );
      },
    );
  }

  async markFailed(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly syncJobId: string;
    readonly connectionId: string;
    readonly providerId: string;
    readonly leaseOwner: string;
    readonly status: "dead_lettered" | "retryable_failed" | "terminal_failed";
    readonly failureClass: string;
    readonly failureReason: string;
    readonly attempt: number;
  }): Promise<void> {
    await this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        await client.query(
          `update app.sync_jobs
           set
             status = $5,
             failure_class = $6,
             error_message = $7,
             completed_at = case
               when $5 in ('dead_lettered', 'terminal_failed')
               then coalesce(completed_at, now())
               else completed_at
             end,
             heartbeat_at = now(),
             updated_at = now()
           where tenant_id::text = $1
             and workspace_id::text = $2
             and sync_job_id = $3
             and lease_owner = $4`,
          [
            input.tenantId,
            input.workspaceId,
            input.syncJobId,
            input.leaseOwner,
            input.status,
            input.failureClass,
            input.failureReason.slice(0, 500),
          ],
        );

        if (input.status === "dead_lettered") {
          await client.query(
            `insert into app.integration_dead_letter_jobs (
               dead_letter_job_id,
               tenant_id,
               workspace_id,
               sync_job_id,
               connection_id,
               provider_id,
               failure_class,
               failure_reason,
               attempt,
               replayable,
               created_at
             )
             values (
               gen_random_uuid(),
               $1,
               $2,
               $3,
               $4,
               $5,
               $6,
               $7,
               $8,
               true,
               now()
             )
             on conflict (tenant_id, workspace_id, sync_job_id)
             do update
               set
                 failure_class = excluded.failure_class,
                 failure_reason = excluded.failure_reason,
                 attempt = excluded.attempt`,
            [
              input.tenantId,
              input.workspaceId,
              input.syncJobId,
              input.connectionId,
              input.providerId,
              input.failureClass,
              input.failureReason.slice(0, 500),
              input.attempt,
            ],
          );
        }
      },
    );
  }
}

async function persistFetchedPageInTransaction(
  client: PoolClient,
  input: DurablePersistFetchedPageInput,
): Promise<DurablePersistFetchedPageResult> {
  const payloadChecksum = digestStable({
    nextCheckpoint: input.nextCheckpoint,
    records: input.fetchedRecords,
  });
  const batchResult = await client.query<{ sourceBatchId: string }>(
    `insert into app.source_batches (
       source_batch_id,
       tenant_id,
       workspace_id,
       connection_id,
       sync_job_id,
       provider_id,
       stream,
       status,
       record_count,
       started_at,
       completed_at,
       provider_cursor,
       fetch_started_at,
       fetch_finished_at,
       payload_checksum,
       schema_version,
       attempt,
       correlation_id
     )
     values (
       gen_random_uuid(),
       $1,
       $2,
       $3,
       $4,
       $5,
       $6,
       'success',
       $7,
       $8,
       $9,
       $10,
       $8,
       $9,
       $11,
       'provider.raw.v1',
       $12,
       $13
     )
     returning source_batch_id::text as "sourceBatchId"`,
    [
      input.tenantId,
      input.workspaceId,
      input.connectionId,
      input.syncJobId,
      input.providerId,
      input.checkpointStream,
      input.fetchedRecords.length,
      input.fetchStartedAt,
      input.fetchFinishedAt,
      input.nextCheckpoint,
      payloadChecksum,
      input.attempt,
      input.correlationId,
    ],
  );
  const sourceBatchId = batchResult.rows[0]?.sourceBatchId;
  if (!sourceBatchId) {
    throw new Error("Source batch insert did not return an id");
  }

  let persistedSourceCount = 0;
  let duplicateCount = 0;

  for (const record of input.fetchedRecords) {
    const recordPayloadChecksum = digestStable(record.payload);
    const idempotencyKey = digestStable({
      connectionId: input.connectionId,
      externalId: record.externalId,
      providerId: input.providerId,
      stream: record.stream,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    });
    const result = await client.query<{ inserted: boolean }>(
      `insert into app.source_records (
         source_record_id,
         tenant_id,
         workspace_id,
         source_batch_id,
         connection_id,
         provider_id,
         stream,
         external_id,
         fingerprint,
         payload,
         provider_object_type,
         provider_object_id,
         provider_updated_at,
         payload_checksum,
         idempotency_key,
         schema_version,
         ingested_at
       )
       values (
         gen_random_uuid(),
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         $7,
         $8,
         $9::jsonb,
         $6,
         $7,
         $10,
         $11,
         $12,
         'provider.raw.v1',
         now()
       )
       on conflict (idempotency_key)
       do update
         set
           source_batch_id = excluded.source_batch_id,
           payload = excluded.payload,
           payload_checksum = excluded.payload_checksum,
           provider_updated_at = excluded.provider_updated_at,
           ingested_at = now()
       returning (xmax = 0) as inserted`,
      [
        input.tenantId,
        input.workspaceId,
        sourceBatchId,
        input.connectionId,
        input.providerId,
        record.stream,
        record.externalId,
        idempotencyKey,
        JSON.stringify(record.payload),
        record.observedAt,
        recordPayloadChecksum,
        idempotencyKey,
      ],
    );

    persistedSourceCount += 1;
    if (result.rows[0]?.inserted === false) {
      duplicateCount += 1;
    }
  }

  if (input.nextCheckpoint !== null) {
    await client.query(
      `insert into app.sync_checkpoints (
         sync_checkpoint_id,
         tenant_id,
         workspace_id,
         connection_id,
         provider_id,
         stream,
         cursor,
         watermark,
         checkpoint_version,
         updated_by_sync_job_id,
         updated_at
       )
       values (
         gen_random_uuid(),
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         now(),
         1,
         $7,
         now()
       )
       on conflict (
         tenant_id,
         workspace_id,
         connection_id,
         provider_id,
         stream
       )
       do update
         set
           cursor = excluded.cursor,
           watermark = excluded.watermark,
           checkpoint_version = app.sync_checkpoints.checkpoint_version + 1,
           updated_by_sync_job_id = excluded.updated_by_sync_job_id,
           updated_at = now()`,
      [
        input.tenantId,
        input.workspaceId,
        input.connectionId,
        input.providerId,
        input.checkpointStream,
        input.nextCheckpoint,
        input.syncJobId,
      ],
    );
  }

  return {
    sourceBatchId,
    fetchedCount: input.fetchedRecords.length,
    persistedSourceCount,
    duplicateCount,
  };
}

function reconciliationStatus(
  input: DurableReconciliationInput,
): "failed" | "passed" | "partial" {
  if (input.failedCount > 0 || input.rejectedCount > 0) {
    return "failed";
  }
  if (
    input.fetchedCount === input.persistedSourceCount
    && input.persistedSourceCount === input.normalizedCount
    && input.normalizedCount === input.canonicalCount
    && input.fetchedCount > 0
  ) {
    return "passed";
  }
  return "failed";
}

function reconciliationFailureReason(
  input: DurableReconciliationInput,
): string | null {
  if (reconciliationStatus(input) === "passed") {
    return null;
  }
  return [
    `fetched=${input.fetchedCount}`,
    `source=${input.persistedSourceCount}`,
    `normalized=${input.normalizedCount}`,
    `canonical=${input.canonicalCount}`,
    `rejected=${input.rejectedCount}`,
    `failed=${input.failedCount}`,
  ].join(" ");
}

function digestStable(value: unknown): string {
  return createHash("sha256")
    .update(stableJson(value))
    .digest("hex");
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export class CurrencyRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  async findRate(input: {
    baseCurrency: string;
    quoteCurrency: string;
    observedAt: string;
  }): Promise<Record<string, unknown> | null> {
    const rows = await this.database.query<Record<string, unknown>>(
      `select *
       from app.fx_rates
       where base_currency = $1
         and quote_currency = $2
         and observed_at <= $3
       order by observed_at desc
       limit 1`,
      [
        input.baseCurrency,
        input.quoteCurrency,
        input.observedAt,
      ],
    );

    return rows[0] ?? null;
  }
}
