import { createHash, randomUUID } from "node:crypto";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import type { MvpIntegrationCatalogProviderId } from "@papadata/contracts";

export type DatabaseConfig = {
  readonly connectionString: string;
  readonly max: number;
  readonly statementTimeoutMs: number;
};

export class ProductionDatabase {
  private readonly pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = createPool(config, "papadata-application");
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
    workspaceId: string | null,
    operation: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    assertTenantScope(tenantId);

    return withTransaction(this.pool, async (client) => {
      await setTenantWorkspaceScope(client, tenantId, workspaceId);
      return operation(client);
    });
  }

  async withIdentity<T>(
    identityKey: string,
    userId: string | null,
    operation: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    assertIdentityKey(identityKey);

    return withTransaction(this.pool, async (client) => {
      await setIdentityScope(client, identityKey, userId);
      return operation(client);
    });
  }

  async withIdentityTenantWorkspace<T>(
    identityKey: string,
    userId: string | null,
    tenantId: string,
    workspaceId: string | null,
    operation: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    assertIdentityKey(identityKey);
    assertTenantScope(tenantId);

    return withTransaction(this.pool, async (client) => {
      await setIdentityScope(client, identityKey, userId);
      await setTenantWorkspaceScope(client, tenantId, workspaceId);
      return operation(client);
    });
  }

  async queryGlobalReadonly<T extends QueryResultRow>(
    text: string,
    values: readonly unknown[] = [],
  ): Promise<readonly T[]> {
    if (!/^\s*(select|with)\b/iu.test(text) || /;\s*\S/iu.test(text)) {
      throw new Error("Global application database access is read-only.");
    }
    const result = await this.pool.query<T>(text, [...values]);
    return result.rows;
  }

  // For tables with genuinely no tenant/identity RLS boundary to scope by
  // (e.g. app.security_oauth_transactions, whose rows exist before any
  // identity is resolved). Use withTenantWorkspace/withIdentity instead
  // whenever a real boundary exists — this bypasses RLS scoping entirely,
  // so it must only ever touch tables that were deliberately left without
  // a tenant_id/identity_key RLS policy.
  async withSystem<T>(
    operation: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    return withTransaction(this.pool, operation);
  }
}

/**
 * Dedicated database boundary for platform-wide schedulers and retention jobs.
 * The supplied credential must use the separately managed `papadata_platform`
 * role. It must never be reused by API or BFF request handling.
 */
export class PlatformDatabase {
  private readonly pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = createPool(config, "papadata-platform-operator");
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async checkHealth(): Promise<boolean> {
    const result = await this.pool.query<{ ok: number }>("select 1 as ok");
    return result.rows[0]?.ok === 1;
  }

  async query<T extends QueryResultRow>(
    text: string,
    values: readonly unknown[] = [],
  ): Promise<readonly T[]> {
    const result = await this.pool.query<T>(text, [...values]);
    return result.rows;
  }

  withTransaction<T>(
    operation: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    return withTransaction(this.pool, operation);
  }
}

function assertIdentityKey(identityKey: string): void {
  if (!/^[a-f0-9]{64}$/u.test(identityKey)) {
    throw new Error("Identity key is invalid.");
  }
}

function assertTenantScope(tenantId: string): void {
  if (!tenantId.trim()) {
    throw new Error("Tenant scope is required for application database access.");
  }
}

async function setIdentityScope(
  client: PoolClient,
  identityKey: string,
  userId: string | null,
): Promise<void> {
  await client.query(
    "select set_config('app.identity_key', $1, true)",
    [identityKey],
  );
  await client.query(
    "select set_config('app.identity_user_id', $1, true)",
    [userId ?? ""],
  );
}

async function setTenantWorkspaceScope(
  client: PoolClient,
  tenantId: string,
  workspaceId: string | null,
): Promise<void> {
  await client.query(
    "select set_config('app.tenant_id', $1, true)",
    [tenantId],
  );
  await client.query(
    "select set_config('app.workspace_id', $1, true)",
    [workspaceId ?? ""],
  );
}

function createPool(config: DatabaseConfig, applicationName: string): Pool {
  return new Pool({
    connectionString: config.connectionString,
    max: config.max,
    statement_timeout: config.statementTimeoutMs,
    application_name: applicationName,
  });
}

async function withTransaction<T>(
  pool: Pool,
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
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
    idempotencyKey: string;
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
             idempotency_key,
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
             $6,
             now(),
             now(),
             now()
           )
           on conflict (tenant_id, workspace_id, idempotency_key)
           where idempotency_key is not null
           do update set idempotency_key = excluded.idempotency_key
           returning connection_id as id, *`,
          [
            input.tenantId,
            input.workspaceId,
            input.providerId,
            input.credentialReference,
            JSON.stringify(input.requestedScopes),
            input.idempotencyKey,
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

  async findConnectionForWebhook(
    connectionId: string,
    providerId: string,
  ): Promise<Record<string, unknown> | null> {
    const rows = await this.database.queryGlobalReadonly<Record<string, unknown>>(
      `select connection_id::text as id, tenant_id::text, workspace_id::text,
              provider_id, credential_ref, requested_scopes
         from app.integration_connections
        where connection_id = $1::uuid and provider_id = $2
          and deleted_at is null
        limit 1`,
      [connectionId, providerId],
    );
    return rows[0] ?? null;
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
             status = 'cancel_requested',
             cancel_requested_at = coalesce(cancel_requested_at, now()),
             updated_at = now()
           where tenant_id = $1
             and workspace_id = $2
             and sync_job_id = $3
             and status in (
               'queued',
               'rate_limited',
               'leased',
               'fetching',
               'persisting_source',
               'normalizing',
               'writing_canonical',
               'reconciling',
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

  async listCanonicalRecords(
    tenantId: string,
    workspaceId: string,
    input: {
      readonly streams: readonly string[];
      readonly businessTimeFrom: string;
      readonly businessTimeTo: string;
    },
  ): Promise<readonly Record<string, unknown>[]> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `select
             canonical_record_id as id,
             provider_id,
             stream,
             external_id,
             canonical_payload,
             ingested_at,
             updated_at,
             coalesce(
               nullif(canonical_payload ->> 'occurredAt', '')::timestamptz,
               business_time,
               ingested_at
             ) as effective_time
           from app.integration_canonical_records
           where tenant_id = $1
             and workspace_id = $2
             and stream = any($3::text[])
             and coalesce(
               nullif(canonical_payload ->> 'occurredAt', '')::timestamptz,
               business_time,
               ingested_at
             ) >= $4
             and coalesce(
               nullif(canonical_payload ->> 'occurredAt', '')::timestamptz,
               business_time,
               ingested_at
             ) < $5
           order by coalesce(
             nullif(canonical_payload ->> 'occurredAt', '')::timestamptz,
             business_time,
             ingested_at
           ) asc`,
          [tenantId, workspaceId, [...input.streams], input.businessTimeFrom, input.businessTimeTo],
        );

        return result.rows;
      },
    );
  }

  async readMetricEngineInputRows(
    tenantId: string,
    workspaceId: string,
    input: {
      readonly periodStart: string;
      readonly periodEnd: string;
    },
  ): Promise<{
    readonly canonicalRows: readonly Record<string, unknown>[];
    readonly catalogRows: readonly Record<string, unknown>[];
    readonly connectionRows: readonly Record<string, unknown>[];
    readonly checkpointRows: readonly Record<string, unknown>[];
    readonly reconciliationRun: Record<string, unknown> | null;
    readonly openIssueRows: readonly Record<string, unknown>[];
  }> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const records = await client.query<Record<string, unknown>>(
          `with scoped_records as (
             select
               canonical_record_id as id,
               provider_id,
               stream,
               external_id,
               canonical_payload,
               coalesce(
                 nullif(canonical_payload ->> 'occurredAt', '')::timestamptz,
                 business_time,
                 ingested_at
               ) as effective_time
             from app.integration_canonical_records
             where tenant_id = $1
               and workspace_id = $2
               and stream = any($3::text[])
           )
           select *
             from scoped_records
            where effective_time >= case
                    when stream = 'products' then $4::timestamptz
                    else $5::timestamptz
                  end
              and effective_time < $6::timestamptz
            order by effective_time asc`,
          [
            tenantId,
            workspaceId,
            [
              "ad_spend",
              "attributed_conversions",
              "inventory",
              "orders",
              "products",
              "refunds",
            ],
            "1970-01-01T00:00:00.000Z",
            input.periodStart,
            input.periodEnd,
          ],
        );
        const connectionRows = await client.query<Record<string, unknown>>(
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
        const checkpointRows = await client.query<Record<string, unknown>>(
          `select
             sync_checkpoint_id as id,
             checkpoint.*
           from app.sync_checkpoints as checkpoint
           where tenant_id = $1
             and workspace_id = $2
           order by updated_at desc`,
          [tenantId, workspaceId],
        );
        const reconciliationRun = await client.query<Record<string, unknown>>(
          `select
             reconciliation_run_id as id,
             run.*
           from app.integration_reconciliation_runs as run
           where tenant_id = $1
             and workspace_id = $2
           order by created_at desc
           limit 1`,
          [tenantId, workspaceId],
        );
        const openIssueRows = await client.query<Record<string, unknown>>(
          `select
             data_issue_id as id,
             issue.*
           from app.data_issues as issue
           where tenant_id = $1
             and workspace_id = $2
             and status = 'open'
           order by created_at desc`,
          [tenantId, workspaceId],
        );

        return {
          canonicalRows: records.rows.filter((row) => row.stream !== "products"),
          catalogRows: records.rows.filter((row) => row.stream === "products"),
          connectionRows: connectionRows.rows,
          checkpointRows: checkpointRows.rows,
          reconciliationRun: reconciliationRun.rows[0] ?? null,
          openIssueRows: openIssueRows.rows,
        };
      },
    );
  }

  async listSyncCheckpoints(
    tenantId: string,
    workspaceId: string,
  ): Promise<readonly Record<string, unknown>[]> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `select
             sync_checkpoint_id as id,
             checkpoint.*
           from app.sync_checkpoints as checkpoint
           where tenant_id = $1
             and workspace_id = $2
           order by updated_at desc`,
          [tenantId, workspaceId],
        );

        return result.rows;
      },
    );
  }

  async listCanonicalCoverageByDay(
    tenantId: string,
    workspaceId: string,
    input: {
      readonly from: string;
      readonly to: string;
    },
  ): Promise<readonly Record<string, unknown>[]> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `with scoped_records as (
             select
               connection_id::text as connection_id,
               provider_id,
               stream,
               coalesce(business_time, ingested_at) as effective_time,
               ingested_at
             from app.integration_canonical_records
             where tenant_id = $1
               and workspace_id = $2
               and coalesce(business_time, ingested_at) >= $3::timestamptz
               and coalesce(business_time, ingested_at) < $4::timestamptz
           )
           select
             connection_id,
             provider_id,
             stream,
             to_char(date_trunc('day', effective_time at time zone 'UTC'), 'YYYY-MM-DD') as day,
             count(*)::int as record_count,
             max(ingested_at)::text as latest_ingested_at
           from scoped_records
           group by connection_id, provider_id, stream, day
           order by day desc, provider_id asc, stream asc`,
          [tenantId, workspaceId, input.from, input.to],
        );

        return result.rows;
      },
    );
  }

  async listReconciliationRuns(
    tenantId: string,
    workspaceId: string,
  ): Promise<readonly Record<string, unknown>[]> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `select
             reconciliation_run_id as id,
             run.*
           from app.integration_reconciliation_runs as run
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

  async latestReconciliationRun(
    tenantId: string,
    workspaceId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `select
             reconciliation_run_id as id,
             run.*
           from app.integration_reconciliation_runs as run
           where tenant_id = $1
             and workspace_id = $2
           order by created_at desc
           limit 1`,
          [tenantId, workspaceId],
        );

        return result.rows[0] ?? null;
      },
    );
  }

  async listOpenDataIssues(
    tenantId: string,
    workspaceId: string,
  ): Promise<readonly Record<string, unknown>[]> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `select
             data_issue_id as id,
             issue.*
           from app.data_issues as issue
           where tenant_id = $1
             and workspace_id = $2
             and status = 'open'
           order by created_at desc`,
          [tenantId, workspaceId],
        );

        return result.rows;
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

  async renewLease(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly syncJobId: string;
    readonly leaseOwner: string;
    readonly leaseExpiresAt: string;
  }): Promise<boolean> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query(
          `update app.sync_jobs
           set
             lease_expires_at = $5,
             heartbeat_at = now(),
             updated_at = now()
           where tenant_id::text = $1
             and workspace_id::text = $2
             and sync_job_id = $3
             and lease_owner = $4
             and cancel_requested_at is null
             and status in (
               'leased',
               'fetching',
               'persisting_source',
               'normalizing',
               'writing_canonical',
               'reconciling'
             )
           returning sync_job_id`,
          [
            input.tenantId,
            input.workspaceId,
            input.syncJobId,
            input.leaseOwner,
            input.leaseExpiresAt,
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
             case
               when jsonb_typeof(payload -> 'canonical') = 'object'
                 then payload -> 'canonical'
               else jsonb_build_object(
                 'version', 'integration.canonical.v1',
                 'providerId', provider_id,
                 'stream', stream,
                 'externalId', external_id,
                 'entity', payload,
                 'quality', jsonb_build_object(
                   'status', 'partial',
                   'missingFields', jsonb_build_array('canonical_normalizer')
                 )
               )
             end,
             case
               when payload #>> '{canonical,quality,status}' = 'valid' then 'valid'
               else 'partial'
             end,
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
             coalesce(
               nullif(normalized.payload ->> 'version', ''),
               'integration.canonical.v1'
             ),
             jsonb_build_object(
               'sourceRecordId', source.source_record_id,
               'sourceBatchId', source.source_batch_id,
               'syncJobId', $6::uuid,
               'providerId', source.provider_id
             ),
             coalesce(
               nullif(normalized.payload ->> 'occurredAt', '')::timestamptz,
               source.provider_updated_at
             ),
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
  ) {
    // An empty provider window is a valid successful reconciliation when all
    // stages agree on zero records. Connectivity/authentication/partial-data
    // failures are handled separately and must not be conflated with a
    // legitimate business period containing no data.
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
    const rows = await this.database.queryGlobalReadonly<Record<string, unknown>>(
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

export class AssistantConversationRepository {
  private readonly database: ProductionDatabase;

  constructor(database: ProductionDatabase) {
    this.database = database;
  }

  async findThread(
    tenantId: string,
    workspaceId: string,
    threadId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `select *
           from app.assistant_threads
           where tenant_id = $1
             and workspace_id = $2
             and assistant_thread_id = $3
           limit 1`,
          [tenantId, workspaceId, threadId],
        );

        return result.rows[0] ?? null;
      },
    );
  }

  async createThread(input: {
    tenantId: string;
    workspaceId: string;
    createdByUserId: string;
    title: string;
    context: unknown;
    threadKind: "conversation" | "case";
    parentThreadId: string | null;
    idempotencyKey: string | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_threads (
             assistant_thread_id,
             tenant_id,
             workspace_id,
             title,
             context,
             created_by_user_id,
             thread_kind,
             parent_thread_id,
             creation_idempotency_key
           ) values ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9)
           on conflict (tenant_id, workspace_id, creation_idempotency_key)
             where creation_idempotency_key is not null
           do update set creation_idempotency_key = excluded.creation_idempotency_key
           returning *`,
          [
            randomUUID(),
            input.tenantId,
            input.workspaceId,
            input.title,
            JSON.stringify(input.context ?? {}),
            input.createdByUserId,
            input.threadKind,
            input.parentThreadId,
            input.idempotencyKey,
          ],
        );

        const thread = result.rows[0];
        if (!thread) {
          throw new Error("Failed to create assistant thread.");
        }

        return thread;
      },
    );
  }

  async touchThread(
    tenantId: string,
    workspaceId: string,
    threadId: string,
  ): Promise<void> {
    await this.database.withTenantWorkspace(
      tenantId,
      workspaceId,
      async (client) => {
        await client.query(
          `update app.assistant_threads
           set updated_at = now()
           where tenant_id = $1
             and workspace_id = $2
             and assistant_thread_id = $3`,
          [tenantId, workspaceId, threadId],
        );
      },
    );
  }

  async appendMessage(input: {
    tenantId: string;
    workspaceId: string;
    threadId: string;
    role: "assistant" | "system" | "user";
    content: string;
    confidence: number;
    limitations: readonly string[];
    recommendations: readonly string[];
    refusalCode: string | null;
    auditReference: string;
    idempotencyKey: string | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_messages (
             assistant_message_id,
             assistant_thread_id,
             tenant_id,
             workspace_id,
             role,
             content,
             confidence,
             limitations,
             recommendations,
             refusal_code,
             audit_reference,
             idempotency_key
           ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           on conflict (tenant_id, workspace_id, assistant_thread_id, role, idempotency_key)
             where idempotency_key is not null
           do update set idempotency_key = excluded.idempotency_key
           returning *`,
          [
            randomUUID(),
            input.threadId,
            input.tenantId,
            input.workspaceId,
            input.role,
            input.content,
            input.confidence,
            [...input.limitations],
            [...input.recommendations],
            input.refusalCode,
            input.auditReference,
            input.idempotencyKey,
          ],
        );

        const message = result.rows[0];
        if (!message) {
          throw new Error("Failed to append assistant message.");
        }

        return message;
      },
    );
  }

  async findMessageByIdempotencyKey(input: {
    tenantId: string;
    workspaceId: string;
    threadId: string;
    role: "assistant" | "system" | "user";
    idempotencyKey: string;
  }): Promise<Record<string, unknown> | null> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `select *
           from app.assistant_messages
           where tenant_id = $1
             and workspace_id = $2
             and assistant_thread_id = $3
             and role = $4
             and idempotency_key = $5
           limit 1`,
          [
            input.tenantId,
            input.workspaceId,
            input.threadId,
            input.role,
            input.idempotencyKey,
          ],
        );

        return result.rows[0] ?? null;
      },
    );
  }

  async listMessages(input: {
    tenantId: string;
    workspaceId: string;
    threadId?: string | null;
    limit?: number | null;
  }): Promise<readonly Record<string, unknown>[]> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);
        const result = await client.query<Record<string, unknown>>(
          input.threadId
            ? `select *
               from app.assistant_messages
               where tenant_id = $1
                 and workspace_id = $2
                 and assistant_thread_id = $3
               order by created_at desc
               limit $4`
            : `select *
               from app.assistant_messages
               where tenant_id = $1
                 and workspace_id = $2
               order by created_at desc
               limit $3`,
          input.threadId
            ? [input.tenantId, input.workspaceId, input.threadId, limit]
            : [input.tenantId, input.workspaceId, limit],
        );

        return result.rows;
      },
    );
  }

  async listSnapshots(input: {
    tenantId: string;
    workspaceId: string;
    threadId?: string | null;
    limit?: number | null;
  }): Promise<readonly Record<string, unknown>[]> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);
        const result = await client.query<Record<string, unknown>>(
          input.threadId
            ? `select *
               from app.assistant_context_snapshots
               where tenant_id = $1
                 and workspace_id = $2
                 and assistant_thread_id = $3
               order by created_at desc
               limit $4`
            : `select *
               from app.assistant_context_snapshots
               where tenant_id = $1
                 and workspace_id = $2
               order by created_at desc
               limit $3`,
          input.threadId
            ? [input.tenantId, input.workspaceId, input.threadId, limit]
            : [input.tenantId, input.workspaceId, limit],
        );

        return result.rows;
      },
    );
  }

  async findLatestSnapshot(input: {
    tenantId: string;
    workspaceId: string;
    threadId: string;
  }): Promise<Record<string, unknown> | null> {
    const rows = await this.listSnapshots({
      limit: 1,
      tenantId: input.tenantId,
      threadId: input.threadId,
      workspaceId: input.workspaceId,
    });
    return rows[0] ?? null;
  }

  async saveSnapshot(input: {
    tenantId: string;
    workspaceId: string;
    threadId: string;
    captureReason: string;
    snapshot: unknown;
    idempotencyKey: string | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_context_snapshots (
             assistant_context_snapshot_id,
             assistant_thread_id,
             tenant_id,
             workspace_id,
             capture_reason,
             snapshot,
             idempotency_key
           ) values ($1, $2, $3, $4, $5, $6::jsonb, $7)
           on conflict (tenant_id, workspace_id, assistant_thread_id, idempotency_key)
             where idempotency_key is not null
           do update set idempotency_key = excluded.idempotency_key
           returning *`,
          [
            randomUUID(),
            input.threadId,
            input.tenantId,
            input.workspaceId,
            input.captureReason,
            JSON.stringify(input.snapshot ?? {}),
            input.idempotencyKey,
          ],
        );

        const snapshot = result.rows[0];
        if (!snapshot) {
          throw new Error("Failed to save assistant context snapshot.");
        }

        return snapshot;
      },
    );
  }


  async upsertAssistantCase(input: {
    tenantId: string;
    workspaceId: string;
    caseThreadId: string;
    parentThreadId: string;
    sourceElementId: string | null;
    caseType: "action" | "analysis" | "anomaly" | "decision" | "opportunity" | "report" | "risk";
    severity: "critical" | "high" | "low" | "medium";
    status: "analysis" | "approval" | "detected" | "dismissed" | "monitoring" | "recommendation" | "resolved" | "triage";
    title: string;
    metrics: readonly unknown[];
    snapshots: readonly unknown[];
    hypotheses: readonly unknown[];
    evidence: readonly unknown[];
    limitations: readonly unknown[];
    comments: readonly unknown[];
    recommendations: readonly unknown[];
    decisions: readonly unknown[];
    outcome: Record<string, unknown> | null;
    createdByUserId: string;
    ownerUserId: string | null;
    idempotencyKey: string | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_cases (
             assistant_case_id,
             tenant_id,
             workspace_id,
             assistant_thread_id,
             parent_thread_id,
             source_element_id,
             case_type,
             severity,
             status,
             owner_user_id,
             title,
             metrics,
             snapshots,
             hypotheses,
             evidence,
             limitations,
             comments,
             recommendations,
             decisions,
             outcome,
             created_by_user_id,
             idempotency_key,
             created_at,
             updated_at
           ) values (
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
             $12::jsonb,
             $13::jsonb,
             $14::jsonb,
             $15::jsonb,
             $16::jsonb,
             $17::jsonb,
             $18::jsonb,
             $19::jsonb,
             $20::jsonb,
             $21,
             $22,
             now(),
             now()
           )
           on conflict (tenant_id, workspace_id, assistant_thread_id)
           do update set
             source_element_id = excluded.source_element_id,
             case_type = excluded.case_type,
             severity = excluded.severity,
             status = excluded.status,
             owner_user_id = excluded.owner_user_id,
             title = excluded.title,
             metrics = excluded.metrics,
             snapshots = excluded.snapshots,
             hypotheses = excluded.hypotheses,
             evidence = excluded.evidence,
             limitations = excluded.limitations,
             comments = excluded.comments,
             recommendations = excluded.recommendations,
             decisions = excluded.decisions,
             outcome = excluded.outcome,
             updated_at = now()
           returning *`,
          [
            randomUUID(),
            input.tenantId,
            input.workspaceId,
            input.caseThreadId,
            input.parentThreadId,
            input.sourceElementId,
            input.caseType,
            input.severity,
            input.status,
            input.ownerUserId,
            input.title,
            JSON.stringify(input.metrics),
            JSON.stringify(input.snapshots),
            JSON.stringify(input.hypotheses),
            JSON.stringify(input.evidence),
            JSON.stringify(input.limitations),
            JSON.stringify(input.comments),
            JSON.stringify(input.recommendations),
            JSON.stringify(input.decisions),
            input.outcome ? JSON.stringify(input.outcome) : null,
            input.createdByUserId,
            input.idempotencyKey,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to upsert assistant case.");
        }

        const caseId = typeof row.assistant_case_id === "string"
          ? row.assistant_case_id
          : input.caseThreadId;

        await this.upsertAssistantAiNotification({
          caseId,
          caseThreadId: input.caseThreadId,
          createdByUserId: input.createdByUserId,
          deduplicationKey: `assistant-case:${input.workspaceId}:${input.caseThreadId}:${input.status}`,
          deepLink: `/app/papa/laboratorium-ai?caseThreadId=${encodeURIComponent(input.caseThreadId)}`,
          message: input.title,
          severity: input.severity,
          sourceObjectId: caseId,
          sourceObjectType: "assistant_case",
          tenantId: input.tenantId,
          title: input.severity === "critical"
            ? "Krytyczna sprawa AI"
            : "Nowa sprawa AI",
          workspaceId: input.workspaceId,
        });

        return row;
      },
    );
  }

  async appendObservation(input: {
    tenantId: string;
    workspaceId: string;
    threadId: string;
    caseId: string | null;
    content: string;
    observationType: "ai" | "imported" | "manual" | "system";
    confidence: number | null;
    evidence: readonly unknown[];
    limitations: readonly unknown[];
    createdByUserId: string;
    idempotencyKey: string | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_observations (
             assistant_observation_id,
             tenant_id,
             workspace_id,
             assistant_thread_id,
             assistant_case_id,
             content,
             observation_type,
             confidence,
             evidence,
             limitations,
             created_by_user_id,
             idempotency_key,
             created_at
           ) values (
             $1,
             $2,
             $3,
             $4,
             $5::uuid,
             $6,
             $7,
             $8,
             $9::jsonb,
             $10::jsonb,
             $11,
             $12,
             now()
           )
           on conflict (tenant_id, workspace_id, assistant_thread_id, idempotency_key)
             where idempotency_key is not null
           do update set idempotency_key = excluded.idempotency_key
           returning *`,
          [
            randomUUID(),
            input.tenantId,
            input.workspaceId,
            input.threadId,
            input.caseId,
            input.content,
            input.observationType,
            input.confidence,
            JSON.stringify(input.evidence),
            JSON.stringify(input.limitations),
            input.createdByUserId,
            input.idempotencyKey,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to append assistant observation.");
        }

        return row;
      },
    );
  }

  async listObservationRecords(input: {
    tenantId: string;
    workspaceId: string;
    threadId?: string | null;
    limit?: number | null;
  }): Promise<readonly Record<string, unknown>[]> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);
        const result = await client.query<Record<string, unknown>>(
          input.threadId
            ? `select *
               from app.assistant_observations
               where tenant_id = $1
                 and workspace_id = $2
                 and assistant_thread_id = $3
               order by created_at desc
               limit $4`
            : `select *
               from app.assistant_observations
               where tenant_id = $1
                 and workspace_id = $2
               order by created_at desc
               limit $3`,
          input.threadId
            ? [input.tenantId, input.workspaceId, input.threadId, limit]
            : [input.tenantId, input.workspaceId, limit],
        );

        return result.rows;
      },
    );
  }



  async upsertAssistantRecommendation(input: {
    tenantId: string;
    workspaceId: string;
    threadId: string;
    caseId: string | null;
    observationId: string | null;
    sourceRecommendationId: string | null;
    title: string;
    summary: string;
    nextStep: string | null;
    riskLevel: "critical" | "high" | "low" | "medium" | "unknown";
    effortLevel: "high" | "low" | "medium" | "unknown";
    confidence: number | null;
    ownerUserId: string | null;
    evidenceIds: readonly unknown[];
    variants: readonly unknown[];
    baseline: Record<string, unknown> | null;
    status: "accepted" | "converted_to_decision" | "dismissed" | "proposed" | "rejected" | "review";
    idempotencyKey: string | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_recommendations (
             assistant_recommendation_id,
             tenant_id,
             workspace_id,
             assistant_thread_id,
             assistant_case_id,
             assistant_observation_id,
             source_recommendation_id,
             title,
             summary,
             next_step,
             risk_level,
             effort_level,
             confidence,
             owner_user_id,
             evidence_ids,
             variants,
             baseline,
             status,
             idempotency_key,
             created_at,
             updated_at
           ) values (
             $1,
             $2,
             $3,
             $4,
             $5::uuid,
             $6::uuid,
             $7,
             $8,
             $9,
             $10,
             $11,
             $12,
             $13,
             $14,
             $15::jsonb,
             $16::jsonb,
             $17::jsonb,
             $18,
             $19,
             now(),
             now()
           )
           on conflict (tenant_id, workspace_id, idempotency_key)
             where idempotency_key is not null
           do update set
             title = excluded.title,
             summary = excluded.summary,
             next_step = excluded.next_step,
             risk_level = excluded.risk_level,
             effort_level = excluded.effort_level,
             confidence = excluded.confidence,
             owner_user_id = excluded.owner_user_id,
             evidence_ids = excluded.evidence_ids,
             variants = excluded.variants,
             baseline = excluded.baseline,
             status = excluded.status,
             updated_at = now()
           returning *`,
          [
            randomUUID(),
            input.tenantId,
            input.workspaceId,
            input.threadId,
            input.caseId,
            input.observationId,
            input.sourceRecommendationId,
            input.title,
            input.summary,
            input.nextStep,
            input.riskLevel,
            input.effortLevel,
            input.confidence,
            input.ownerUserId,
            JSON.stringify(input.evidenceIds),
            JSON.stringify(input.variants),
            input.baseline ? JSON.stringify(input.baseline) : null,
            input.status,
            input.idempotencyKey,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to upsert assistant recommendation.");
        }

        return row;
      },
    );
  }

  async upsertAssistantDecision(input: {
    tenantId: string;
    workspaceId: string;
    threadId: string;
    caseId: string | null;
    recommendationId: string | null;
    status: "approved" | "dismissed" | "executing" | "monitoring" | "rejected" | "resolved" | "review" | "scheduled";
    decision: string;
    rationale: string | null;
    decidedByUserId: string | null;
    baseline: Record<string, unknown> | null;
    expectedOutcome: Record<string, unknown> | null;
    measuredOutcome: Record<string, unknown> | null;
    idempotencyKey: string | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_decisions (
             assistant_decision_id,
             tenant_id,
             workspace_id,
             assistant_thread_id,
             assistant_case_id,
             assistant_recommendation_id,
             status,
             decision,
             rationale,
             decided_by_user_id,
             baseline,
             expected_outcome,
             measured_outcome,
             idempotency_key,
             created_at,
             updated_at
           ) values (
             $1,
             $2,
             $3,
             $4,
             $5::uuid,
             $6::uuid,
             $7,
             $8,
             $9,
             $10,
             $11::jsonb,
             $12::jsonb,
             $13::jsonb,
             $14,
             now(),
             now()
           )
           on conflict (tenant_id, workspace_id, idempotency_key)
             where idempotency_key is not null
           do update set
             status = excluded.status,
             decision = excluded.decision,
             rationale = excluded.rationale,
             decided_by_user_id = excluded.decided_by_user_id,
             baseline = excluded.baseline,
             expected_outcome = excluded.expected_outcome,
             measured_outcome = excluded.measured_outcome,
             updated_at = now()
           returning *`,
          [
            randomUUID(),
            input.tenantId,
            input.workspaceId,
            input.threadId,
            input.caseId,
            input.recommendationId,
            input.status,
            input.decision,
            input.rationale,
            input.decidedByUserId,
            input.baseline ? JSON.stringify(input.baseline) : null,
            input.expectedOutcome ? JSON.stringify(input.expectedOutcome) : null,
            input.measuredOutcome ? JSON.stringify(input.measuredOutcome) : null,
            input.idempotencyKey,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to upsert assistant decision.");
        }

        return row;
      },
    );
  }

  async upsertAssistantActionProposal(input: {
    tenantId: string;
    workspaceId: string;
    threadId: string;
    caseId: string | null;
    decisionId: string | null;
    operationId: string;
    targetRef: Record<string, unknown>;
    beforeState: Record<string, unknown>;
    proposedAfterState: Record<string, unknown>;
    diff: Record<string, unknown>;
    evidence: readonly unknown[];
    simulation: Record<string, unknown>;
    validation: Record<string, unknown>;
    limits: Record<string, unknown>;
    status: "approval_required" | "approved" | "blocked" | "executed" | "proposed" | "rejected" | "rolled_back" | "validated";
    createdByUserId: string;
    idempotencyKey: string | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_action_proposals (
             assistant_action_proposal_id,
             tenant_id,
             workspace_id,
             assistant_thread_id,
             assistant_case_id,
             assistant_decision_id,
             operation_id,
             target_ref,
             before_state,
             proposed_after_state,
             diff,
             evidence,
             simulation,
             validation,
             limits,
             status,
             idempotency_key,
             created_by_user_id,
             created_at,
             updated_at
           ) values (
             $1,
             $2,
             $3,
             $4,
             $5::uuid,
             $6::uuid,
             $7,
             $8::jsonb,
             $9::jsonb,
             $10::jsonb,
             $11::jsonb,
             $12::jsonb,
             $13::jsonb,
             $14::jsonb,
             $15::jsonb,
             $16,
             $17,
             $18,
             now(),
             now()
           )
           on conflict (tenant_id, workspace_id, idempotency_key)
             where idempotency_key is not null
           do update set
             target_ref = excluded.target_ref,
             before_state = excluded.before_state,
             proposed_after_state = excluded.proposed_after_state,
             diff = excluded.diff,
             evidence = excluded.evidence,
             simulation = excluded.simulation,
             validation = excluded.validation,
             limits = excluded.limits,
             status = excluded.status,
             updated_at = now()
           returning *`,
          [
            randomUUID(),
            input.tenantId,
            input.workspaceId,
            input.threadId,
            input.caseId,
            input.decisionId,
            input.operationId,
            JSON.stringify(input.targetRef),
            JSON.stringify(input.beforeState),
            JSON.stringify(input.proposedAfterState),
            JSON.stringify(input.diff),
            JSON.stringify(input.evidence),
            JSON.stringify(input.simulation),
            JSON.stringify(input.validation),
            JSON.stringify(input.limits),
            input.status,
            input.idempotencyKey,
            input.createdByUserId,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to upsert assistant action proposal.");
        }

        return row;
      },
    );
  }

  async upsertAssistantOutcome(input: {
    tenantId: string;
    workspaceId: string;
    threadId: string;
    caseId: string | null;
    decisionId: string | null;
    recommendationId: string | null;
    baseline: Record<string, unknown>;
    expectedOutcome: Record<string, unknown>;
    measuredOutcome: Record<string, unknown>;
    status: "dismissed" | "measured" | "monitoring" | "pending" | "resolved";
    idempotencyKey: string | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_outcomes (
             assistant_outcome_id,
             tenant_id,
             workspace_id,
             assistant_thread_id,
             assistant_case_id,
             assistant_decision_id,
             assistant_recommendation_id,
             baseline,
             expected_outcome,
             measured_outcome,
             status,
             idempotency_key,
             measured_at,
             created_at,
             updated_at
           ) values (
             $1,
             $2,
             $3,
             $4,
             $5::uuid,
             $6::uuid,
             $7::uuid,
             $8::jsonb,
             $9::jsonb,
             $10::jsonb,
             $11,
             $12,
             case when $11 in ('measured', 'resolved') then now() else null end,
             now(),
             now()
           )
           on conflict (tenant_id, workspace_id, idempotency_key)
             where idempotency_key is not null
           do update set
             baseline = excluded.baseline,
             expected_outcome = excluded.expected_outcome,
             measured_outcome = excluded.measured_outcome,
             status = excluded.status,
             measured_at = excluded.measured_at,
             updated_at = now()
           returning *`,
          [
            randomUUID(),
            input.tenantId,
            input.workspaceId,
            input.threadId,
            input.caseId,
            input.decisionId,
            input.recommendationId,
            JSON.stringify(input.baseline),
            JSON.stringify(input.expectedOutcome),
            JSON.stringify(input.measuredOutcome),
            input.status,
            input.idempotencyKey,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to upsert assistant outcome.");
        }

        return row;
      },
    );
  }



  async readAssistantContextBasket(input: {
    tenantId: string;
    workspaceId: string;
    conversationId: string | null;
    limit: number | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 25, 1), 250);
        const result = await client.query<Record<string, unknown>>(
          `select
             assistant_context_snapshot_id::text as id,
             assistant_thread_id::text as "conversationId",
             capture_reason as "captureReason",
             snapshot,
             created_at as "createdAt"
           from app.assistant_context_snapshots
           where tenant_id = $1
             and workspace_id = $2
             and ($3::uuid is null or assistant_thread_id = $3::uuid)
           order by created_at desc
           limit $4`,
          [
            input.tenantId,
            input.workspaceId,
            input.conversationId,
            limit,
          ],
        );

        const records = result.rows;
        const latest = records[0] ?? null;
        const latestSnapshot = latest?.snapshot;

        return {
          contextItems: extractAssistantContextItems(latestSnapshot),
          latest,
          pageInfo: {
            nextCursor: null,
            total: records.length,
          },
          records,
          summary: {
            latestCapturedAt: latest?.createdAt ?? null,
            source: records.length > 0 ? "assistant_context_snapshots" : "empty",
            total: records.length,
          },
        };
      },
    );
  }

  async readAssistantEvidence(input: {
    tenantId: string;
    workspaceId: string;
    conversationId: string | null;
    caseThreadId: string | null;
    limit: number | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 100, 1), 250);
        const threadId = input.caseThreadId ?? input.conversationId;

        const result = await client.query<Record<string, unknown>>(
          `select
             evidence.assistant_evidence_id::text as id,
             evidence.assistant_message_id::text as "messageId",
             message.assistant_thread_id::text as "conversationId",
             evidence.source_type as "sourceType",
             evidence.source_id as "sourceId",
             evidence.source_label as "sourceLabel",
             evidence.confidence,
             evidence.collected_at as "collectedAt",
             evidence.created_at as "createdAt"
           from app.assistant_evidence as evidence
           inner join app.assistant_messages as message
              on message.assistant_message_id = evidence.assistant_message_id
             and message.tenant_id = evidence.tenant_id
             and message.workspace_id = evidence.workspace_id
           where evidence.tenant_id = $1
             and evidence.workspace_id = $2
             and ($3::uuid is null or message.assistant_thread_id = $3::uuid)
           order by evidence.created_at desc
           limit $4`,
          [
            input.tenantId,
            input.workspaceId,
            threadId,
            limit,
          ],
        );

        return {
          pageInfo: {
            nextCursor: null,
            total: result.rows.length,
          },
          records: result.rows,
          summary: summarizeAssistantRowsByKey(result.rows, "sourceType"),
        };
      },
    );
  }

  async readAssistantLab(input: {
    tenantId: string;
    workspaceId: string;
    conversationId: string | null;
    caseThreadId: string | null;
    limit: number | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 50, 1), 250);
        const threadId = input.caseThreadId ?? input.conversationId;

        const casesResult = await client.query<Record<string, unknown>>(
          `select
             assistant_case_id::text as id,
             assistant_thread_id::text as "caseThreadId",
             parent_thread_id::text as "parentConversationId",
             source_element_id as "sourceElementId",
             case_type as type,
             severity,
             status,
             owner_user_id::text as "ownerUserId",
             title,
             metrics,
             snapshots,
             hypotheses,
             evidence,
             limitations,
             comments,
             recommendations,
             decisions,
             outcome,
             created_at as "createdAt",
             updated_at as "updatedAt",
             resolved_at as "resolvedAt"
           from app.assistant_cases
           where tenant_id = $1
             and workspace_id = $2
             and (
               $3::uuid is null
               or assistant_thread_id = $3::uuid
               or parent_thread_id = $3::uuid
               or assistant_case_id = $3::uuid
             )
           order by updated_at desc
           limit $4`,
          [
            input.tenantId,
            input.workspaceId,
            threadId,
            limit,
          ],
        );

        const caseIds = casesResult.rows
          .map((row) => typeof row.id === "string" ? row.id : null)
          .filter((item): item is string => item !== null);

        const recommendations = caseIds.length > 0
          ? await client.query<Record<string, unknown>>(
              `select
                 assistant_recommendation_id::text as id,
                 assistant_case_id::text as "caseId",
                 title,
                 summary,
                 next_step as "nextStep",
                 risk_level as "riskLevel",
                 effort_level as "effortLevel",
                 confidence,
                 status,
                 created_at as "createdAt",
                 updated_at as "updatedAt"
               from app.assistant_recommendations
               where tenant_id = $1
                 and workspace_id = $2
                 and assistant_case_id = any($3::uuid[])
               order by updated_at desc
               limit $4`,
              [input.tenantId, input.workspaceId, caseIds, limit],
            )
          : { rows: [] };

        const decisions = caseIds.length > 0
          ? await client.query<Record<string, unknown>>(
              `select
                 assistant_decision_id::text as id,
                 assistant_case_id::text as "caseId",
                 assistant_recommendation_id::text as "recommendationId",
                 status,
                 decision,
                 rationale,
                 decided_by_user_id::text as "decidedByUserId",
                 baseline,
                 expected_outcome as "expectedOutcome",
                 measured_outcome as "measuredOutcome",
                 created_at as "createdAt",
                 updated_at as "updatedAt"
               from app.assistant_decisions
               where tenant_id = $1
                 and workspace_id = $2
                 and assistant_case_id = any($3::uuid[])
               order by updated_at desc
               limit $4`,
              [input.tenantId, input.workspaceId, caseIds, limit],
            )
          : { rows: [] };

        const actions = caseIds.length > 0
          ? await client.query<Record<string, unknown>>(
              `select
                 assistant_action_proposal_id::text as id,
                 assistant_case_id::text as "caseId",
                 assistant_decision_id::text as "decisionId",
                 operation_id as "operationId",
                 target_ref as "targetRef",
                 before_state as "beforeState",
                 proposed_after_state as "proposedAfterState",
                 diff,
                 evidence,
                 simulation,
                 validation,
                 limits,
                 status,
                 created_by_user_id::text as "createdByUserId",
                 created_at as "createdAt",
                 updated_at as "updatedAt"
               from app.assistant_action_proposals
               where tenant_id = $1
                 and workspace_id = $2
                 and assistant_case_id = any($3::uuid[])
               order by updated_at desc
               limit $4`,
              [input.tenantId, input.workspaceId, caseIds, limit],
            )
          : { rows: [] };

        const outcomes = caseIds.length > 0
          ? await client.query<Record<string, unknown>>(
              `select
                 assistant_outcome_id::text as id,
                 assistant_case_id::text as "caseId",
                 assistant_decision_id::text as "decisionId",
                 assistant_recommendation_id::text as "recommendationId",
                 baseline,
                 expected_outcome as "expectedOutcome",
                 measured_outcome as "measuredOutcome",
                 status,
                 measured_at as "measuredAt",
                 created_at as "createdAt",
                 updated_at as "updatedAt"
               from app.assistant_outcomes
               where tenant_id = $1
                 and workspace_id = $2
                 and assistant_case_id = any($3::uuid[])
               order by updated_at desc
               limit $4`,
              [input.tenantId, input.workspaceId, caseIds, limit],
            )
          : { rows: [] };

        const experiments = caseIds.length > 0
          ? await client.query<Record<string, unknown>>(
              `select
                 assistant_lab_experiment_id::text as id,
                 assistant_case_id::text as "caseId",
                 title,
                 hypothesis,
                 variant_config as "variantConfig",
                 baseline,
                 expected_outcome as "expectedOutcome",
                 measured_outcome as "measuredOutcome",
                 status,
                 created_by_user_id::text as "createdByUserId",
                 created_at as "createdAt",
                 updated_at as "updatedAt"
               from app.assistant_lab_experiments
               where tenant_id = $1
                 and workspace_id = $2
                 and assistant_case_id = any($3::uuid[])
               order by updated_at desc
               limit $4`,
              [input.tenantId, input.workspaceId, caseIds, limit],
            )
          : { rows: [] };

        return {
          actions: actions.rows,
          cases: casesResult.rows,
          decisions: decisions.rows,
          experiments: experiments.rows,
          outcomes: outcomes.rows,
          recommendations: recommendations.rows,
          summary: {
            actions: actions.rows.length,
            cases: casesResult.rows.length,
            decisions: decisions.rows.length,
            experiments: experiments.rows.length,
            outcomes: outcomes.rows.length,
            recommendations: recommendations.rows.length,
            source: "assistant_lab_domain",
          },
        };
      },
    );
  }

  async readAssistantProposals(input: {
    tenantId: string;
    workspaceId: string;
    conversationId: string | null;
    caseThreadId: string | null;
    limit: number | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 100, 1), 250);
        const threadId = input.caseThreadId ?? input.conversationId;

        const result = await client.query<Record<string, unknown>>(
          `select
             assistant_recommendation_id::text as id,
             assistant_thread_id::text as "conversationId",
             assistant_case_id::text as "caseId",
             assistant_observation_id::text as "observationId",
             source_recommendation_id as "sourceRecommendationId",
             title,
             summary,
             next_step as "nextStep",
             risk_level as "riskLevel",
             effort_level as "effortLevel",
             confidence,
             owner_user_id::text as "ownerUserId",
             evidence_ids as "evidenceIds",
             variants,
             baseline,
             status,
             created_at as "createdAt",
             updated_at as "updatedAt"
           from app.assistant_recommendations
           where tenant_id = $1
             and workspace_id = $2
             and (
               $3::uuid is null
               or assistant_thread_id = $3::uuid
               or assistant_case_id = $3::uuid
             )
           order by updated_at desc
           limit $4`,
          [
            input.tenantId,
            input.workspaceId,
            threadId,
            limit,
          ],
        );

        return {
          pageInfo: {
            nextCursor: null,
            total: result.rows.length,
          },
          records: result.rows,
          summary: summarizeAssistantRowsByKey(result.rows, "status"),
        };
      },
    );
  }

  async readAssistantGovernance(input: {
    tenantId: string;
    workspaceId: string;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `select
             (select count(*)::int from app.assistant_cases
               where tenant_id = $1 and workspace_id = $2 and status not in ('resolved', 'dismissed')) as "openCases",
             (select count(*)::int from app.assistant_action_proposals
               where tenant_id = $1 and workspace_id = $2) as "actionProposals",
             (select count(*)::int from app.assistant_action_approvals
               where tenant_id = $1 and workspace_id = $2) as "actionApprovals",
             (select count(*)::int from app.assistant_outcomes
               where tenant_id = $1 and workspace_id = $2) as "outcomes"`,
          [input.tenantId, input.workspaceId],
        );

        const row = result.rows[0] ?? {};

        return {
          governance: {
            aiMode: "read_only_mvp",
            approvalRequiredForExternalEffects: true,
            externalEffects: {
              execute: "blocked",
              rollback: "blocked",
            },
            idempotencyRequiredForCommands: true,
            tenantWorkspaceScopeRequired: true,
          },
          summary: {
            actionApprovals: numberFromAssistantRow(row.actionApprovals),
            actionProposals: numberFromAssistantRow(row.actionProposals),
            openCases: numberFromAssistantRow(row.openCases),
            outcomes: numberFromAssistantRow(row.outcomes),
            source: "assistant_governance_domain",
          },
        };
      },
    );
  }

  async readAssistantActions(input: {
    tenantId: string;
    workspaceId: string;
    conversationId: string | null;
    caseThreadId: string | null;
    limit: number | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 100, 1), 250);
        const threadId = input.caseThreadId ?? input.conversationId;

        const result = await client.query<Record<string, unknown>>(
          `select
             assistant_action_proposal_id::text as id,
             assistant_thread_id::text as "conversationId",
             assistant_case_id::text as "caseId",
             assistant_decision_id::text as "decisionId",
             operation_id as "operationId",
             target_ref as "targetRef",
             before_state as "beforeState",
             proposed_after_state as "proposedAfterState",
             diff,
             evidence,
             simulation,
             validation,
             limits,
             status,
             created_by_user_id::text as "createdByUserId",
             created_at as "createdAt",
             updated_at as "updatedAt"
           from app.assistant_action_proposals
           where tenant_id = $1
             and workspace_id = $2
             and (
               $3::uuid is null
               or assistant_thread_id = $3::uuid
               or assistant_case_id = $3::uuid
             )
           order by updated_at desc
           limit $4`,
          [
            input.tenantId,
            input.workspaceId,
            threadId,
            limit,
          ],
        );

        return {
          actions: result.rows,
          pageInfo: {
            nextCursor: null,
            total: result.rows.length,
          },
          summary: summarizeAssistantRowsByKey(result.rows, "status"),
        };
      },
    );
  }

  async readAssistantActionApprovals(input: {
    tenantId: string;
    workspaceId: string;
    limit: number | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 100, 1), 250);

        const result = await client.query<Record<string, unknown>>(
          `select
             assistant_action_approval_id::text as id,
             assistant_action_proposal_id::text as "actionProposalId",
             operation_id as "operationId",
             approval_status as status,
             exact_consent as "exactConsent",
             rejection_reason as "rejectionReason",
             validation_result as "validationResult",
             actor_user_id::text as "actorUserId",
             created_at as "createdAt"
           from app.assistant_action_approvals
           where tenant_id = $1
             and workspace_id = $2
           order by created_at desc
           limit $3`,
          [
            input.tenantId,
            input.workspaceId,
            limit,
          ],
        );

        return {
          approvals: result.rows,
          pageInfo: {
            nextCursor: null,
            total: result.rows.length,
          },
          summary: summarizeAssistantRowsByKey(result.rows, "status"),
        };
      },
    );
  }

  async validateAssistantAction(input: {
    tenantId: string;
    workspaceId: string;
    userId: string;
    operationId: string;
    actionProposalId: string | null;
    validationResult: Record<string, unknown>;
    idempotencyKey: string;
  }): Promise<Record<string, unknown>> {
    return this.writeAssistantActionApproval({
      ...input,
      approvalStatus: "validated",
      exactConsent: null,
      rejectionReason: null,
    });
  }

  async approveAssistantAction(input: {
    tenantId: string;
    workspaceId: string;
    userId: string;
    operationId: string;
    actionProposalId: string | null;
    exactConsent: string;
    validationResult: Record<string, unknown>;
    idempotencyKey: string;
  }): Promise<Record<string, unknown>> {
    return this.writeAssistantActionApproval({
      ...input,
      approvalStatus: "approved",
      rejectionReason: null,
    });
  }

  async rejectAssistantAction(input: {
    tenantId: string;
    workspaceId: string;
    userId: string;
    operationId: string;
    actionProposalId: string | null;
    rejectionReason: string;
    validationResult: Record<string, unknown>;
    idempotencyKey: string;
  }): Promise<Record<string, unknown>> {
    return this.writeAssistantActionApproval({
      ...input,
      approvalStatus: "rejected",
      exactConsent: null,
    });
  }

  private async writeAssistantActionApproval(input: {
    tenantId: string;
    workspaceId: string;
    userId: string;
    operationId: string;
    actionProposalId: string | null;
    approvalStatus: "approved" | "rejected" | "validated";
    exactConsent: string | null;
    rejectionReason: string | null;
    validationResult: Record<string, unknown>;
    idempotencyKey: string;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_action_approvals (
             assistant_action_approval_id,
             tenant_id,
             workspace_id,
             assistant_action_proposal_id,
             operation_id,
             approval_status,
             exact_consent,
             rejection_reason,
             validation_result,
             actor_user_id,
             idempotency_key,
             created_at
           ) values (
             $1,
             $2,
             $3,
             $4::uuid,
             $5,
             $6,
             $7,
             $8,
             $9::jsonb,
             $10,
             $11,
             now()
           )
           on conflict (tenant_id, workspace_id, operation_id, idempotency_key)
           do update set
             idempotency_key = excluded.idempotency_key
           returning
             assistant_action_approval_id::text as id,
             assistant_action_proposal_id::text as "actionProposalId",
             operation_id as "operationId",
             approval_status as status,
             exact_consent as "exactConsent",
             rejection_reason as "rejectionReason",
             validation_result as "validationResult",
             actor_user_id::text as "actorUserId",
             created_at as "createdAt"`,
          [
            randomUUID(),
            input.tenantId,
            input.workspaceId,
            input.actionProposalId,
            input.operationId,
            input.approvalStatus,
            input.exactConsent,
            input.rejectionReason,
            JSON.stringify(input.validationResult),
            input.userId,
            input.idempotencyKey,
          ],
        );

        if (input.actionProposalId) {
          await client.query(
            `update app.assistant_action_proposals
             set status = $1,
                 validation = case
                   when $1 = 'validated' then $2::jsonb
                   else validation
                 end,
                 updated_at = now()
             where tenant_id = $3
               and workspace_id = $4
               and assistant_action_proposal_id = $5::uuid`,
            [
              input.approvalStatus,
              JSON.stringify(input.validationResult),
              input.tenantId,
              input.workspaceId,
              input.actionProposalId,
            ],
          );
        }

        const row = result.rows[0];

        return {
          outcomeId: typeof row?.id === "string" ? row.id : null,
          record: row ?? null,
          status: "applied",
        };
      },
    );
  }



  async upsertAssistantReportDefinition(input: {
    tenantId: string;
    workspaceId: string;
    caseId: string | null;
    name: string;
    description: string | null;
    ownerUserId: string | null;
    visibility: "private" | "tenant" | "workspace";
    metricSelection: readonly unknown[];
    metricSnapshotRef: Record<string, unknown> | null;
    filters: Record<string, unknown>;
    dateRange: Record<string, unknown>;
    segmentations: readonly unknown[];
    layout: readonly unknown[];
    chartTypes: readonly unknown[];
    ordering: readonly unknown[];
    dataTables: readonly unknown[];
    comments: readonly unknown[];
    schedule: Record<string, unknown> | null;
    status: "archived" | "draft" | "ready";
    createdByUserId: string;
    idempotencyKey: string | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_report_definitions (
             assistant_report_definition_id,
             tenant_id,
             workspace_id,
             assistant_case_id,
             name,
             description,
             owner_user_id,
             visibility,
             current_version,
             metric_selection,
             metric_snapshot_ref,
             filters,
             date_range,
             segmentations,
             layout,
             chart_types,
             ordering,
             data_tables,
             comments,
             schedule,
             status,
             created_by_user_id,
             idempotency_key,
             created_at,
             updated_at
           ) values (
             gen_random_uuid(),
             $1,
             $2,
             $3::uuid,
             $4,
             $5,
             $6,
             $7,
             1,
             $8::jsonb,
             $9::jsonb,
             $10::jsonb,
             $11::jsonb,
             $12::jsonb,
             $13::jsonb,
             $14::jsonb,
             $15::jsonb,
             $16::jsonb,
             $17::jsonb,
             $18::jsonb,
             $19,
             $20,
             $21,
             now(),
             now()
           )
           on conflict (tenant_id, workspace_id, idempotency_key)
             where idempotency_key is not null
           do update set
             name = excluded.name,
             description = excluded.description,
             owner_user_id = excluded.owner_user_id,
             visibility = excluded.visibility,
             current_version = app.assistant_report_definitions.current_version + 1,
             metric_selection = excluded.metric_selection,
             metric_snapshot_ref = excluded.metric_snapshot_ref,
             filters = excluded.filters,
             date_range = excluded.date_range,
             segmentations = excluded.segmentations,
             layout = excluded.layout,
             chart_types = excluded.chart_types,
             ordering = excluded.ordering,
             data_tables = excluded.data_tables,
             comments = excluded.comments,
             schedule = excluded.schedule,
             status = excluded.status,
             updated_at = now()
           returning *`,
          [
            input.tenantId,
            input.workspaceId,
            input.caseId,
            input.name,
            input.description,
            input.ownerUserId,
            input.visibility,
            JSON.stringify(input.metricSelection),
            input.metricSnapshotRef ? JSON.stringify(input.metricSnapshotRef) : null,
            JSON.stringify(input.filters),
            JSON.stringify(input.dateRange),
            JSON.stringify(input.segmentations),
            JSON.stringify(input.layout),
            JSON.stringify(input.chartTypes),
            JSON.stringify(input.ordering),
            JSON.stringify(input.dataTables),
            JSON.stringify(input.comments),
            input.schedule ? JSON.stringify(input.schedule) : null,
            input.status,
            input.createdByUserId,
            input.idempotencyKey,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to upsert assistant report definition.");
        }

        await client.query(
          `insert into app.assistant_report_versions (
             assistant_report_version_id,
             tenant_id,
             workspace_id,
             assistant_report_definition_id,
             version,
             definition_snapshot,
             change_note,
             created_by_user_id,
             created_at
           ) values (
             gen_random_uuid(),
             $1,
             $2,
             $3,
             $4,
             to_jsonb($5::jsonb),
             $6,
             $7,
             now()
           )
           on conflict (tenant_id, workspace_id, assistant_report_definition_id, version)
           do nothing`,
          [
            input.tenantId,
            input.workspaceId,
            row.assistant_report_definition_id,
            row.current_version,
            JSON.stringify(row),
            input.status === "draft" ? "Draft report definition" : "Report definition update",
            input.createdByUserId,
          ],
        );

        return row;
      },
    );
  }

  async duplicateAssistantReportDefinition(input: {
    tenantId: string;
    workspaceId: string;
    reportDefinitionId: string;
    createdByUserId: string;
    idempotencyKey: string;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_report_definitions (
             assistant_report_definition_id,
             tenant_id,
             workspace_id,
             assistant_case_id,
             name,
             description,
             owner_user_id,
             visibility,
             current_version,
             metric_selection,
             metric_snapshot_ref,
             filters,
             date_range,
             segmentations,
             layout,
             chart_types,
             ordering,
             data_tables,
             comments,
             schedule,
             status,
             duplicated_from_report_id,
             created_by_user_id,
             idempotency_key,
             created_at,
             updated_at
           )
           select
             gen_random_uuid(),
             tenant_id,
             workspace_id,
             assistant_case_id,
             name || ' - kopia',
             description,
             owner_user_id,
             visibility,
             1,
             metric_selection,
             metric_snapshot_ref,
             filters,
             date_range,
             segmentations,
             layout,
             chart_types,
             ordering,
             data_tables,
             comments,
             schedule,
             'draft',
             assistant_report_definition_id,
             $4,
             $5,
             now(),
             now()
           from app.assistant_report_definitions
           where tenant_id = $1
             and workspace_id = $2
             and assistant_report_definition_id = $3::uuid
           on conflict (tenant_id, workspace_id, idempotency_key)
             where idempotency_key is not null
           do update set idempotency_key = excluded.idempotency_key
           returning *`,
          [
            input.tenantId,
            input.workspaceId,
            input.reportDefinitionId,
            input.createdByUserId,
            input.idempotencyKey,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Report definition not found for duplication.");
        }

        return row;
      },
    );
  }

  async readAssistantReportDefinitions(input: {
    tenantId: string;
    workspaceId: string;
    caseId: string | null;
    limit: number | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 50, 1), 250);

        const reports = await client.query<Record<string, unknown>>(
          `select
             assistant_report_definition_id::text as id,
             assistant_case_id::text as "caseId",
             name,
             description,
             owner_user_id::text as "ownerUserId",
             visibility,
             current_version as "currentVersion",
             metric_selection as "metricSelection",
             metric_snapshot_ref as "metricSnapshotRef",
             filters,
             date_range as "dateRange",
             segmentations,
             layout,
             chart_types as "chartTypes",
             ordering,
             data_tables as "dataTables",
             comments,
             schedule,
             status,
             duplicated_from_report_id::text as "duplicatedFromReportId",
             created_at as "createdAt",
             updated_at as "updatedAt"
           from app.assistant_report_definitions
           where tenant_id = $1
             and workspace_id = $2
             and ($3::uuid is null or assistant_case_id = $3::uuid)
           order by updated_at desc
           limit $4`,
          [
            input.tenantId,
            input.workspaceId,
            input.caseId,
            limit,
          ],
        );

        const reportIds = reports.rows
          .map((row) => typeof row.id === "string" ? row.id : null)
          .filter((item): item is string => item !== null);

        const exports = reportIds.length > 0
          ? await client.query<Record<string, unknown>>(
              `select
                 assistant_report_export_id::text as id,
                 assistant_report_definition_id::text as "reportDefinitionId",
                 assistant_report_version_id::text as "reportVersionId",
                 export_scope as "exportScope",
                 format,
                 status,
                 job_id as "jobId",
                 object_key as "objectKey",
                 checksum_sha256 as "checksumSha256",
                 size_bytes as "sizeBytes",
                 content_type as "contentType",
                 error_code as "errorCode",
                 created_at as "createdAt",
                 ready_at as "readyAt",
                 expires_at as "expiresAt"
               from app.assistant_report_exports
               where tenant_id = $1
                 and workspace_id = $2
                 and assistant_report_definition_id = any($3::uuid[])
               order by created_at desc
               limit $4`,
              [
                input.tenantId,
                input.workspaceId,
                reportIds,
                limit,
              ],
            )
          : { rows: [] };

        const schedules = reportIds.length > 0
          ? await client.query<Record<string, unknown>>(
              `select
                 assistant_report_schedule_id::text as id,
                 assistant_report_definition_id::text as "reportDefinitionId",
                 cadence,
                 timezone,
                 recipients,
                 export_formats as "exportFormats",
                 next_run_at as "nextRunAt",
                 status,
                 created_at as "createdAt",
                 updated_at as "updatedAt"
               from app.assistant_report_schedules
               where tenant_id = $1
                 and workspace_id = $2
                 and assistant_report_definition_id = any($3::uuid[])
               order by updated_at desc
               limit $4`,
              [
                input.tenantId,
                input.workspaceId,
                reportIds,
                limit,
              ],
            )
          : { rows: [] };

        return {
          exports: exports.rows,
          pageInfo: {
            nextCursor: null,
            total: reports.rows.length,
          },
          reports: reports.rows,
          schedules: schedules.rows,
          summary: {
            exports: exports.rows.length,
            reports: reports.rows.length,
            schedules: schedules.rows.length,
            source: "assistant_report_builder",
          },
        };
      },
    );
  }

  async createAssistantReportExport(input: {
    tenantId: string;
    workspaceId: string;
    reportDefinitionId: string | null;
    reportVersionId: string | null;
    exportScope: "report" | "section" | "table";
    format: "csv" | "pdf" | "xlsx";
    createdByUserId: string;
    idempotencyKey: string;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_report_exports (
             assistant_report_export_id,
             tenant_id,
             workspace_id,
             assistant_report_definition_id,
             assistant_report_version_id,
             export_scope,
             format,
             status,
             job_id,
             created_by_user_id,
             idempotency_key,
             created_at
           ) values (
             gen_random_uuid(),
             $1,
             $2,
             $3::uuid,
             $4::uuid,
             $5,
             $6,
             'queued',
             $7,
             $8,
             $9,
             now()
           )
           on conflict (tenant_id, workspace_id, idempotency_key)
             where idempotency_key is not null
           do update set idempotency_key = excluded.idempotency_key
           returning
             assistant_report_export_id::text as id,
             assistant_report_definition_id::text as "reportDefinitionId",
             assistant_report_version_id::text as "reportVersionId",
             export_scope as "exportScope",
             format,
             status,
             job_id as "jobId",
             object_key as "objectKey",
             checksum_sha256 as "checksumSha256",
             size_bytes as "sizeBytes",
             content_type as "contentType",
             error_code as "errorCode",
             created_at as "createdAt",
             ready_at as "readyAt",
             expires_at as "expiresAt"`,
          [
            input.tenantId,
            input.workspaceId,
            input.reportDefinitionId,
            input.reportVersionId,
            input.exportScope,
            input.format,
            `assistant-report-export:${input.idempotencyKey}`,
            input.createdByUserId,
            input.idempotencyKey,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to create assistant report export.");
        }

        const exportId = typeof row.id === "string"
          ? row.id
          : input.idempotencyKey;

        await this.upsertAssistantAiNotification({
          caseId: null,
          caseThreadId: null,
          createdByUserId: input.createdByUserId,
          deduplicationKey: `assistant-report-export:${input.workspaceId}:${exportId}:${input.format}`,
          deepLink: `/app/papa/laboratorium-ai?reportExportId=${encodeURIComponent(exportId)}`,
          message: `Eksport ${input.format.toUpperCase()} został przekazany do kolejki backendowej.`,
          severity: "medium",
          sourceObjectId: exportId,
          sourceObjectType: "assistant_report_export",
          tenantId: input.tenantId,
          title: "Eksport raportu Papa",
          workspaceId: input.workspaceId,
        });

        return row;
      },
    );
  }

  async upsertAssistantReportSchedule(input: {
    tenantId: string;
    workspaceId: string;
    reportDefinitionId: string;
    cadence: string;
    timezone: string;
    recipients: readonly unknown[];
    exportFormats: readonly unknown[];
    nextRunAt: string | null;
    status: "active" | "cancelled" | "paused";
    createdByUserId: string;
    idempotencyKey: string;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_report_schedules (
             assistant_report_schedule_id,
             tenant_id,
             workspace_id,
             assistant_report_definition_id,
             cadence,
             timezone,
             recipients,
             export_formats,
             next_run_at,
             status,
             created_by_user_id,
             idempotency_key,
             created_at,
             updated_at
           ) values (
             gen_random_uuid(),
             $1,
             $2,
             $3::uuid,
             $4,
             $5,
             $6::jsonb,
             $7::jsonb,
             $8::timestamptz,
             $9,
             $10,
             $11,
             now(),
             now()
           )
           on conflict (tenant_id, workspace_id, idempotency_key)
             where idempotency_key is not null
           do update set
             cadence = excluded.cadence,
             timezone = excluded.timezone,
             recipients = excluded.recipients,
             export_formats = excluded.export_formats,
             next_run_at = excluded.next_run_at,
             status = excluded.status,
             updated_at = now()
           returning *`,
          [
            input.tenantId,
            input.workspaceId,
            input.reportDefinitionId,
            input.cadence,
            input.timezone,
            JSON.stringify(input.recipients),
            JSON.stringify(input.exportFormats),
            input.nextRunAt,
            input.status,
            input.createdByUserId,
            input.idempotencyKey,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to upsert assistant report schedule.");
        }

        return row;
      },
    );
  }



  async upsertAssistantAiNotification(input: {
    tenantId: string;
    workspaceId: string;
    caseId: string | null;
    caseThreadId: string | null;
    sourceObjectType: string;
    sourceObjectId: string;
    severity: "critical" | "high" | "low" | "medium";
    title: string;
    message: string;
    deepLink: string;
    deduplicationKey: string;
    createdByUserId: string | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_ai_notifications (
             assistant_ai_notification_id,
             tenant_id,
             workspace_id,
             assistant_case_id,
             case_thread_id,
             source_object_type,
             source_object_id,
             category,
             severity,
             title,
             message,
             deep_link,
             deduplication_key,
             created_by_user_id,
             created_at,
             updated_at
           ) values (
             gen_random_uuid(),
             $1,
             $2,
             $3::uuid,
             $4::uuid,
             $5,
             $6,
             'ai',
             $7,
             $8,
             $9,
             $10,
             $11,
             $12,
             now(),
             now()
           )
           on conflict (tenant_id, workspace_id, deduplication_key)
           do update set
             severity = excluded.severity,
             title = excluded.title,
             message = excluded.message,
             deep_link = excluded.deep_link,
             source_object_type = excluded.source_object_type,
             source_object_id = excluded.source_object_id,
             case_thread_id = excluded.case_thread_id,
             updated_at = now()
           returning
             assistant_ai_notification_id::text as id,
             assistant_case_id::text as "caseId",
             case_thread_id::text as "caseThreadId",
             source_object_type as "sourceObjectType",
             source_object_id as "sourceObjectId",
             category,
             severity,
             title,
             message,
             deep_link as "deepLink",
             deduplication_key as "deduplicationKey",
             read_at as "readAt",
             snoozed_until as "snoozedUntil",
             created_at as "createdAt",
             updated_at as "updatedAt"`,
          [
            input.tenantId,
            input.workspaceId,
            input.caseId,
            input.caseThreadId,
            input.sourceObjectType,
            input.sourceObjectId,
            input.severity,
            input.title,
            input.message,
            input.deepLink,
            input.deduplicationKey,
            input.createdByUserId,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to upsert assistant AI notification.");
        }

        return row;
      },
    );
  }

  async readAssistantAiNotifications(input: {
    tenantId: string;
    workspaceId: string;
    caseId: string | null;
    caseThreadId: string | null;
    includeRead: boolean;
    includeSnoozed: boolean;
    limit: number | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 50, 1), 250);

        const result = await client.query<Record<string, unknown>>(
          `select
             assistant_ai_notification_id::text as id,
             assistant_case_id::text as "caseId",
             case_thread_id::text as "caseThreadId",
             source_object_type as "sourceObjectType",
             source_object_id as "sourceObjectId",
             category,
             severity,
             title,
             message,
             deep_link as "deepLink",
             deduplication_key as "deduplicationKey",
             read_at as "readAt",
             snoozed_until as "snoozedUntil",
             created_at as "createdAt",
             updated_at as "updatedAt"
           from app.assistant_ai_notifications
           where tenant_id = $1
             and workspace_id = $2
             and ($3::uuid is null or assistant_case_id = $3::uuid)
             and ($4::uuid is null or case_thread_id = $4::uuid)
             and ($5::boolean = true or read_at is null)
             and (
               $6::boolean = true
               or snoozed_until is null
               or snoozed_until <= now()
             )
           order by
             case severity
               when 'critical' then 1
               when 'high' then 2
               when 'medium' then 3
               else 4
             end,
             created_at desc
           limit $7`,
          [
            input.tenantId,
            input.workspaceId,
            input.caseId,
            input.caseThreadId,
            input.includeRead,
            input.includeSnoozed,
            limit,
          ],
        );

        return {
          notifications: result.rows,
          pageInfo: {
            nextCursor: null,
            total: result.rows.length,
          },
          summary: summarizeAssistantRowsByKey(result.rows, "severity"),
        };
      },
    );
  }

  async markAssistantAiNotificationRead(input: {
    tenantId: string;
    workspaceId: string;
    notificationId: string;
    read: boolean;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `update app.assistant_ai_notifications
           set read_at = case when $4::boolean then now() else null end,
               updated_at = now()
           where tenant_id = $1
             and workspace_id = $2
             and assistant_ai_notification_id = $3::uuid
           returning
             assistant_ai_notification_id::text as id,
             severity,
             read_at as "readAt",
             snoozed_until as "snoozedUntil",
             deep_link as "deepLink"`,
          [
            input.tenantId,
            input.workspaceId,
            input.notificationId,
            input.read,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("AI notification not found.");
        }

        return row;
      },
    );
  }

  async snoozeAssistantAiNotification(input: {
    tenantId: string;
    workspaceId: string;
    notificationId: string;
    snoozedUntil: string | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `update app.assistant_ai_notifications
           set snoozed_until = case
                 when severity = 'critical' then null
                 else $4::timestamptz
               end,
               updated_at = now()
           where tenant_id = $1
             and workspace_id = $2
             and assistant_ai_notification_id = $3::uuid
           returning
             assistant_ai_notification_id::text as id,
             severity,
             read_at as "readAt",
             snoozed_until as "snoozedUntil",
             deep_link as "deepLink"`,
          [
            input.tenantId,
            input.workspaceId,
            input.notificationId,
            input.snoozedUntil,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("AI notification not found.");
        }

        return row;
      },
    );
  }



  async upsertAssistantMetricEngineSnapshot(input: {
    tenantId: string;
    workspaceId: string;
    threadId: string;
    contextSnapshotId: string | null;
    snapshotId: string;
    sourceModule: string;
    metricIdentifiers: readonly unknown[];
    canonicalMetricRefs: readonly unknown[];
    dateRange: Record<string, unknown>;
    filters: Record<string, unknown>;
    attributionContext: Record<string, unknown>;
    currency: string | null;
    timezone: string | null;
    precisionConfig: Record<string, unknown>;
    nullSemantics: string;
    partialDataMetadata: Record<string, unknown>;
    dataQuality: Record<string, unknown>;
    freshness: Record<string, unknown>;
    provenance: Record<string, unknown>;
    createdByUserId: string;
    idempotencyKey: string;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_metric_engine_snapshots (
             assistant_metric_snapshot_id,
             tenant_id,
             workspace_id,
             assistant_thread_id,
             assistant_context_snapshot_id,
             snapshot_id,
             source_module,
             metric_identifiers,
             canonical_metric_refs,
             date_range,
             filters,
             attribution_context,
             currency,
             timezone,
             precision_config,
             null_semantics,
             partial_data_metadata,
             data_quality,
             freshness,
             provenance,
             created_by_user_id,
             idempotency_key,
             created_at
           ) values (
             gen_random_uuid(),
             $1,
             $2,
             $3,
             $4::uuid,
             $5,
             $6,
             $7::jsonb,
             $8::jsonb,
             $9::jsonb,
             $10::jsonb,
             $11::jsonb,
             $12,
             $13,
             $14::jsonb,
             $15,
             $16::jsonb,
             $17::jsonb,
             $18::jsonb,
             $19::jsonb,
             $20,
             $21,
             now()
           )
           on conflict (tenant_id, workspace_id, idempotency_key)
             where idempotency_key is not null
           do update set
             assistant_context_snapshot_id = excluded.assistant_context_snapshot_id,
             snapshot_id = excluded.snapshot_id,
             source_module = excluded.source_module,
             metric_identifiers = excluded.metric_identifiers,
             canonical_metric_refs = excluded.canonical_metric_refs,
             date_range = excluded.date_range,
             filters = excluded.filters,
             attribution_context = excluded.attribution_context,
             currency = excluded.currency,
             timezone = excluded.timezone,
             precision_config = excluded.precision_config,
             null_semantics = excluded.null_semantics,
             partial_data_metadata = excluded.partial_data_metadata,
             data_quality = excluded.data_quality,
             freshness = excluded.freshness,
             provenance = excluded.provenance
           returning
             assistant_metric_snapshot_id::text as id,
             assistant_thread_id::text as "threadId",
             assistant_context_snapshot_id::text as "contextSnapshotId",
             snapshot_id as "snapshotId",
             source_module as "sourceModule",
             metric_identifiers as "metricIdentifiers",
             canonical_metric_refs as "canonicalMetricRefs",
             date_range as "dateRange",
             filters,
             attribution_context as "attributionContext",
             currency,
             timezone,
             precision_config as "precisionConfig",
             null_semantics as "nullSemantics",
             partial_data_metadata as "partialDataMetadata",
             data_quality as "dataQuality",
             freshness,
             provenance,
             created_at as "createdAt"`,
          [
            input.tenantId,
            input.workspaceId,
            input.threadId,
            input.contextSnapshotId,
            input.snapshotId,
            input.sourceModule,
            JSON.stringify(input.metricIdentifiers),
            JSON.stringify(input.canonicalMetricRefs),
            JSON.stringify(input.dateRange),
            JSON.stringify(input.filters),
            JSON.stringify(input.attributionContext),
            input.currency,
            input.timezone,
            JSON.stringify(input.precisionConfig),
            input.nullSemantics,
            JSON.stringify(input.partialDataMetadata),
            JSON.stringify(input.dataQuality),
            JSON.stringify(input.freshness),
            JSON.stringify(input.provenance),
            input.createdByUserId,
            input.idempotencyKey,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to upsert assistant Metric Engine snapshot provenance.");
        }

        return row;
      },
    );
  }

  async appendAssistantEvidenceProvenance(input: {
    tenantId: string;
    workspaceId: string;
    evidenceId: string | null;
    metricSnapshotId: string | null;
    sourceType: AssistantEvidenceSourceType;
    sourceId: string | null;
    sourceLabel: string | null;
    sourcePath: string | null;
    metricIdentifier: string | null;
    canonicalMetricRef: Record<string, unknown> | null;
    freshnessAt: string | null;
    dataQuality: Record<string, unknown>;
    provenance: Record<string, unknown>;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_evidence_provenance (
             assistant_evidence_provenance_id,
             tenant_id,
             workspace_id,
             assistant_evidence_id,
             assistant_metric_snapshot_id,
             source_type,
             source_id,
             source_label,
             source_path,
             metric_identifier,
             canonical_metric_ref,
             freshness_at,
             data_quality,
             provenance,
             created_at
           ) values (
             gen_random_uuid(),
             $1,
             $2,
             $3::uuid,
             $4::uuid,
             $5,
             $6,
             $7,
             $8,
             $9,
             $10::jsonb,
             $11::timestamptz,
             $12::jsonb,
             $13::jsonb,
             now()
           )
           returning
             assistant_evidence_provenance_id::text as id,
             assistant_evidence_id::text as "evidenceId",
             assistant_metric_snapshot_id::text as "metricSnapshotId",
             source_type as "sourceType",
             source_id as "sourceId",
             source_label as "sourceLabel",
             source_path as "sourcePath",
             metric_identifier as "metricIdentifier",
             canonical_metric_ref as "canonicalMetricRef",
             freshness_at as "freshnessAt",
             data_quality as "dataQuality",
             provenance,
             created_at as "createdAt"`,
          [
            input.tenantId,
            input.workspaceId,
            input.evidenceId,
            input.metricSnapshotId,
            input.sourceType,
            input.sourceId,
            input.sourceLabel,
            input.sourcePath,
            input.metricIdentifier,
            input.canonicalMetricRef ? JSON.stringify(input.canonicalMetricRef) : null,
            input.freshnessAt,
            JSON.stringify(input.dataQuality),
            JSON.stringify(input.provenance),
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to append assistant evidence provenance.");
        }

        return row;
      },
    );
  }

  async readAssistantMetricProvenance(input: {
    tenantId: string;
    workspaceId: string;
    conversationId: string | null;
    snapshotId: string | null;
    limit: number | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 50, 1), 250);

        const snapshots = await client.query<Record<string, unknown>>(
          `select
             assistant_metric_snapshot_id::text as id,
             assistant_thread_id::text as "threadId",
             assistant_context_snapshot_id::text as "contextSnapshotId",
             snapshot_id as "snapshotId",
             source_module as "sourceModule",
             metric_identifiers as "metricIdentifiers",
             canonical_metric_refs as "canonicalMetricRefs",
             date_range as "dateRange",
             filters,
             attribution_context as "attributionContext",
             currency,
             timezone,
             precision_config as "precisionConfig",
             null_semantics as "nullSemantics",
             partial_data_metadata as "partialDataMetadata",
             data_quality as "dataQuality",
             freshness,
             provenance,
             created_at as "createdAt"
           from app.assistant_metric_engine_snapshots
           where tenant_id = $1
             and workspace_id = $2
             and ($3::uuid is null or assistant_thread_id = $3::uuid)
             and ($4::text is null or snapshot_id = $4::text)
           order by created_at desc
           limit $5`,
          [
            input.tenantId,
            input.workspaceId,
            input.conversationId,
            input.snapshotId,
            limit,
          ],
        );

        const snapshotIds = snapshots.rows
          .map((row) => typeof row.id === "string" ? row.id : null)
          .filter((item): item is string => item !== null);

        const provenance = snapshotIds.length > 0
          ? await client.query<Record<string, unknown>>(
              `select
                 assistant_evidence_provenance_id::text as id,
                 assistant_evidence_id::text as "evidenceId",
                 assistant_metric_snapshot_id::text as "metricSnapshotId",
                 source_type as "sourceType",
                 source_id as "sourceId",
                 source_label as "sourceLabel",
                 source_path as "sourcePath",
                 metric_identifier as "metricIdentifier",
                 canonical_metric_ref as "canonicalMetricRef",
                 freshness_at as "freshnessAt",
                 data_quality as "dataQuality",
                 provenance,
                 created_at as "createdAt"
               from app.assistant_evidence_provenance
               where tenant_id = $1
                 and workspace_id = $2
                 and assistant_metric_snapshot_id = any($3::uuid[])
               order by created_at desc
               limit $4`,
              [
                input.tenantId,
                input.workspaceId,
                snapshotIds,
                limit,
              ],
            )
          : { rows: [] };

        return {
          provenance: provenance.rows,
          snapshots: snapshots.rows,
          summary: {
            provenance: provenance.rows.length,
            snapshots: snapshots.rows.length,
            source: "assistant_metric_engine_provenance",
          },
        };
      },
    );
  }



  async upsertAssistantAiAnswerContract(input: {
    tenantId: string;
    workspaceId: string;
    threadId: string;
    answerMessageId: string | null;
    thesis: string;
    evidence: readonly unknown[];
    confidence: number | null;
    freshness: Record<string, unknown>;
    assumptions: readonly unknown[];
    limitations: readonly unknown[];
    riskLevel: "critical" | "high" | "low" | "medium" | "unknown";
    humanRequired: boolean;
    refusal: Record<string, unknown>;
    providerMetadata: Record<string, unknown>;
    providerGuardrails: Record<string, unknown>;
    createdByUserId: string;
    idempotencyKey: string;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_ai_answer_contracts (
             assistant_ai_answer_contract_id,
             tenant_id,
             workspace_id,
             assistant_thread_id,
             assistant_message_id,
             thesis,
             evidence,
             confidence,
             freshness,
             assumptions,
             limitations,
             risk_level,
             human_required,
             refusal,
             provider_metadata,
             provider_guardrails,
             created_by_user_id,
             idempotency_key,
             created_at
           ) values (
             gen_random_uuid(),
             $1,
             $2,
             $3,
             $4::uuid,
             $5,
             $6::jsonb,
             $7,
             $8::jsonb,
             $9::jsonb,
             $10::jsonb,
             $11,
             $12,
             $13::jsonb,
             $14::jsonb,
             $15::jsonb,
             $16,
             $17,
             now()
           )
           on conflict (tenant_id, workspace_id, idempotency_key)
             where idempotency_key is not null
           do update set
             assistant_message_id = excluded.assistant_message_id,
             thesis = excluded.thesis,
             evidence = excluded.evidence,
             confidence = excluded.confidence,
             freshness = excluded.freshness,
             assumptions = excluded.assumptions,
             limitations = excluded.limitations,
             risk_level = excluded.risk_level,
             human_required = excluded.human_required,
             refusal = excluded.refusal,
             provider_metadata = excluded.provider_metadata,
             provider_guardrails = excluded.provider_guardrails
           returning
             assistant_ai_answer_contract_id::text as id,
             assistant_thread_id::text as "threadId",
             assistant_message_id::text as "answerMessageId",
             thesis,
             evidence,
             confidence,
             freshness,
             assumptions,
             limitations,
             risk_level as "riskLevel",
             human_required as "humanRequired",
             refusal,
             provider_metadata as "providerMetadata",
             provider_guardrails as "providerGuardrails",
             created_at as "createdAt"`,
          [
            input.tenantId,
            input.workspaceId,
            input.threadId,
            input.answerMessageId,
            input.thesis,
            JSON.stringify(input.evidence),
            input.confidence,
            JSON.stringify(input.freshness),
            JSON.stringify(input.assumptions),
            JSON.stringify(input.limitations),
            input.riskLevel,
            input.humanRequired,
            JSON.stringify(input.refusal),
            JSON.stringify(input.providerMetadata),
            JSON.stringify(input.providerGuardrails),
            input.createdByUserId,
            input.idempotencyKey,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to upsert assistant AI answer contract.");
        }

        return row;
      },
    );
  }

  async appendAssistantProviderGovernanceEvent(input: {
    tenantId: string;
    workspaceId: string;
    threadId: string | null;
    answerMessageId: string | null;
    operationId: string;
    providerName: string;
    modelName: string | null;
    requestId: string | null;
    status: "cancelled" | "completed" | "failed" | "refused" | "timeout";
    timeoutMs: number | null;
    retryCount: number;
    circuitBreakerState: "closed" | "half_open" | "open" | "unknown";
    cost: Record<string, unknown>;
    redaction: Record<string, unknown>;
    telemetry: Record<string, unknown>;
    cancellation: Record<string, unknown>;
    errorCode: string | null;
    errorMessage: string | null;
    idempotencyKey: string;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_provider_governance_events (
             assistant_provider_governance_event_id,
             tenant_id,
             workspace_id,
             assistant_thread_id,
             assistant_message_id,
             operation_id,
             provider_name,
             model_name,
             request_id,
             status,
             timeout_ms,
             retry_count,
             circuit_breaker_state,
             cost,
             redaction,
             telemetry,
             cancellation,
             error_code,
             error_message,
             idempotency_key,
             created_at
           ) values (
             gen_random_uuid(),
             $1,
             $2,
             $3::uuid,
             $4::uuid,
             $5,
             $6,
             $7,
             $8,
             $9,
             $10,
             $11,
             $12,
             $13::jsonb,
             $14::jsonb,
             $15::jsonb,
             $16::jsonb,
             $17,
             $18,
             $19,
             now()
           )
           on conflict (tenant_id, workspace_id, idempotency_key)
             where idempotency_key is not null
           do update set idempotency_key = excluded.idempotency_key
           returning
             assistant_provider_governance_event_id::text as id,
             assistant_thread_id::text as "threadId",
             assistant_message_id::text as "answerMessageId",
             operation_id as "operationId",
             provider_name as "providerName",
             model_name as "modelName",
             request_id as "requestId",
             status,
             timeout_ms as "timeoutMs",
             retry_count as "retryCount",
             circuit_breaker_state as "circuitBreakerState",
             cost,
             redaction,
             telemetry,
             cancellation,
             error_code as "errorCode",
             error_message as "errorMessage",
             created_at as "createdAt"`,
          [
            input.tenantId,
            input.workspaceId,
            input.threadId,
            input.answerMessageId,
            input.operationId,
            input.providerName,
            input.modelName,
            input.requestId,
            input.status,
            input.timeoutMs,
            input.retryCount,
            input.circuitBreakerState,
            JSON.stringify(input.cost),
            JSON.stringify(input.redaction),
            JSON.stringify(input.telemetry),
            JSON.stringify(input.cancellation),
            input.errorCode,
            input.errorMessage,
            input.idempotencyKey,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to append assistant provider governance event.");
        }

        return row;
      },
    );
  }

  async readAssistantAiAnswerContracts(input: {
    tenantId: string;
    workspaceId: string;
    conversationId: string | null;
    answerMessageId: string | null;
    limit: number | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 50, 1), 250);

        const result = await client.query<Record<string, unknown>>(
          `select
             assistant_ai_answer_contract_id::text as id,
             assistant_thread_id::text as "threadId",
             assistant_message_id::text as "answerMessageId",
             thesis,
             evidence,
             confidence,
             freshness,
             assumptions,
             limitations,
             risk_level as "riskLevel",
             human_required as "humanRequired",
             refusal,
             provider_metadata as "providerMetadata",
             provider_guardrails as "providerGuardrails",
             created_at as "createdAt"
           from app.assistant_ai_answer_contracts
           where tenant_id = $1
             and workspace_id = $2
             and ($3::uuid is null or assistant_thread_id = $3::uuid)
             and ($4::uuid is null or assistant_message_id = $4::uuid)
           order by created_at desc
           limit $5`,
          [
            input.tenantId,
            input.workspaceId,
            input.conversationId,
            input.answerMessageId,
            limit,
          ],
        );

        return {
          contracts: result.rows,
          pageInfo: {
            nextCursor: null,
            total: result.rows.length,
          },
          summary: summarizeAssistantRowsByKey(result.rows, "riskLevel"),
        };
      },
    );
  }

  async readAssistantProviderGovernanceEvents(input: {
    tenantId: string;
    workspaceId: string;
    conversationId: string | null;
    answerMessageId: string | null;
    operationId: string | null;
    limit: number | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 50, 1), 250);

        const result = await client.query<Record<string, unknown>>(
          `select
             assistant_provider_governance_event_id::text as id,
             assistant_thread_id::text as "threadId",
             assistant_message_id::text as "answerMessageId",
             operation_id as "operationId",
             provider_name as "providerName",
             model_name as "modelName",
             request_id as "requestId",
             status,
             timeout_ms as "timeoutMs",
             retry_count as "retryCount",
             circuit_breaker_state as "circuitBreakerState",
             cost,
             redaction,
             telemetry,
             cancellation,
             error_code as "errorCode",
             error_message as "errorMessage",
             created_at as "createdAt"
           from app.assistant_provider_governance_events
           where tenant_id = $1
             and workspace_id = $2
             and ($3::uuid is null or assistant_thread_id = $3::uuid)
             and ($4::uuid is null or assistant_message_id = $4::uuid)
             and ($5::text is null or operation_id = $5)
           order by created_at desc
           limit $6`,
          [
            input.tenantId,
            input.workspaceId,
            input.conversationId,
            input.answerMessageId,
            input.operationId,
            limit,
          ],
        );

        return {
          events: result.rows,
          pageInfo: {
            nextCursor: null,
            total: result.rows.length,
          },
          summary: summarizeAssistantRowsByKey(result.rows, "status"),
        };
      },
    );
  }



  async appendAssistantPrivacyRedactionEvent(input: {
    tenantId: string;
    workspaceId: string;
    threadId: string | null;
    operationId: string;
    stage: "export" | "manual_review" | "post_provider" | "pre_provider";
    policyVersion: string;
    rawInputHash: string;
    redactedInputHash: string;
    detectedCategories: readonly unknown[];
    fieldsRedacted: readonly unknown[];
    redactionSummary: Record<string, unknown>;
    sampleFree: boolean;
    blocked: boolean;
    blockReason: string | null;
    createdByUserId: string | null;
    idempotencyKey: string;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_privacy_redaction_events (
             assistant_privacy_redaction_event_id,
             tenant_id,
             workspace_id,
             assistant_thread_id,
             operation_id,
             stage,
             policy_version,
             raw_input_hash,
             redacted_input_hash,
             detected_categories,
             fields_redacted,
             redaction_summary,
             sample_free,
             blocked,
             block_reason,
             created_by_user_id,
             idempotency_key,
             created_at
           ) values (
             gen_random_uuid(),
             $1,
             $2,
             $3::uuid,
             $4,
             $5,
             $6,
             $7,
             $8,
             $9::jsonb,
             $10::jsonb,
             $11::jsonb,
             $12,
             $13,
             $14,
             $15,
             $16,
             now()
           )
           on conflict (tenant_id, workspace_id, idempotency_key)
             where idempotency_key is not null
           do update set
             raw_input_hash = excluded.raw_input_hash,
             redacted_input_hash = excluded.redacted_input_hash,
             detected_categories = excluded.detected_categories,
             fields_redacted = excluded.fields_redacted,
             redaction_summary = excluded.redaction_summary,
             sample_free = excluded.sample_free,
             blocked = excluded.blocked,
             block_reason = excluded.block_reason
           returning
             assistant_privacy_redaction_event_id::text as id,
             assistant_thread_id::text as "threadId",
             operation_id as "operationId",
             stage,
             policy_version as "policyVersion",
             raw_input_hash as "rawInputHash",
             redacted_input_hash as "redactedInputHash",
             detected_categories as "detectedCategories",
             fields_redacted as "fieldsRedacted",
             redaction_summary as "redactionSummary",
             sample_free as "sampleFree",
             blocked,
             block_reason as "blockReason",
             created_at as "createdAt"`,
          [
            input.tenantId,
            input.workspaceId,
            input.threadId,
            input.operationId,
            input.stage,
            input.policyVersion,
            input.rawInputHash,
            input.redactedInputHash,
            JSON.stringify(input.detectedCategories),
            JSON.stringify(input.fieldsRedacted),
            JSON.stringify(input.redactionSummary),
            input.sampleFree,
            input.blocked,
            input.blockReason,
            input.createdByUserId,
            input.idempotencyKey,
          ],
        );

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to append assistant privacy redaction event.");
        }

        return row;
      },
    );
  }

  async readAssistantPrivacyRedactionEvents(input: {
    tenantId: string;
    workspaceId: string;
    conversationId: string | null;
    operationId: string | null;
    stage: string | null;
    includeBlocked: boolean;
    limit: number | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const limit = Math.min(Math.max(input.limit ?? 50, 1), 250);

        const result = await client.query<Record<string, unknown>>(
          `select
             assistant_privacy_redaction_event_id::text as id,
             assistant_thread_id::text as "threadId",
             operation_id as "operationId",
             stage,
             policy_version as "policyVersion",
             raw_input_hash as "rawInputHash",
             redacted_input_hash as "redactedInputHash",
             detected_categories as "detectedCategories",
             fields_redacted as "fieldsRedacted",
             redaction_summary as "redactionSummary",
             sample_free as "sampleFree",
             blocked,
             block_reason as "blockReason",
             created_at as "createdAt"
           from app.assistant_privacy_redaction_events
           where tenant_id = $1
             and workspace_id = $2
             and ($3::uuid is null or assistant_thread_id = $3::uuid)
             and ($4::text is null or operation_id = $4)
             and ($5::text is null or stage = $5)
             and ($6::boolean = true or blocked = false)
           order by created_at desc
           limit $7`,
          [
            input.tenantId,
            input.workspaceId,
            input.conversationId,
            input.operationId,
            input.stage,
            input.includeBlocked,
            limit,
          ],
        );

        return {
          events: result.rows,
          pageInfo: {
            nextCursor: null,
            total: result.rows.length,
          },
          summary: summarizeAssistantRowsByKey(result.rows, "stage"),
        };
      },
    );
  }


  async appendEvidence(input: {
    tenantId: string;
    workspaceId: string;
    messageId: string;
    sourceType: "dashboard_readiness" | "metric_snapshot";
    sourceRef: string;
    metricCode: string | null;
  }): Promise<Record<string, unknown>> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          `insert into app.assistant_evidence (
             assistant_evidence_id,
             assistant_message_id,
             tenant_id,
             workspace_id,
             source_type,
             source_ref,
             metric_code
           ) values ($1, $2, $3, $4, $5, $6, $7)
           on conflict do nothing
           returning *`,
          [
            randomUUID(),
            input.messageId,
            input.tenantId,
            input.workspaceId,
            input.sourceType,
            input.sourceRef,
            input.metricCode,
          ],
        );

        if (result.rows[0]) return result.rows[0];

        const existing = await client.query<Record<string, unknown>>(
          `select *
           from app.assistant_evidence
           where tenant_id = $1
             and workspace_id = $2
             and assistant_message_id = $3
             and source_type = $4
             and source_ref = $5
             and coalesce(metric_code, '') = coalesce($6, '')
           limit 1`,
          [
            input.tenantId,
            input.workspaceId,
            input.messageId,
            input.sourceType,
            input.sourceRef,
            input.metricCode,
          ],
        );
        const row = existing.rows[0];
        if (!row) throw new Error("Failed to append assistant evidence.");
        return row;
      },
    );
  }

  async listEvidence(input: {
    tenantId: string;
    workspaceId: string;
    threadId?: string | null;
  }): Promise<readonly Record<string, unknown>[]> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const result = await client.query<Record<string, unknown>>(
          input.threadId
            ? `select evidence.*
               from app.assistant_evidence as evidence
               inner join app.assistant_messages as message
                 on message.assistant_message_id = evidence.assistant_message_id
                and message.tenant_id = evidence.tenant_id
                and message.workspace_id = evidence.workspace_id
               where evidence.tenant_id = $1
                 and evidence.workspace_id = $2
                 and message.assistant_thread_id = $3
               order by evidence.created_at asc`
            : `select evidence.*
               from app.assistant_evidence as evidence
               where evidence.tenant_id = $1
                 and evidence.workspace_id = $2
               order by evidence.created_at asc`,
          input.threadId
            ? [input.tenantId, input.workspaceId, input.threadId]
            : [input.tenantId, input.workspaceId],
        );

        return result.rows;
      },
    );
  }
}

function extractAssistantContextItems(snapshot: unknown): readonly Record<string, unknown>[] {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return [];
  }

  const record = snapshot as Record<string, unknown>;

  for (const key of ["contextItems", "items", "sources", "evidence", "metrics", "tables"]) {
    const candidate = record[key];

    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is Record<string, unknown> => (
          Boolean(item)
          && typeof item === "object"
          && !Array.isArray(item)
        ))
        .map((item) => ({
          ...item,
          sourceCollection: key,
        }));
    }
  }

  return Object.entries(record)
    .slice(0, 25)
    .map(([key, value]) => ({
      id: key,
      sourceCollection: "snapshot",
      value,
    }));
}

function summarizeAssistantRowsByKey(
  rows: readonly Record<string, unknown>[],
  key: string,
): Record<string, unknown> {
  const counts: Record<string, number> = {};

  for (const row of rows) {
    const rawValue = row[key];
    const value = typeof rawValue === "string" && rawValue.length > 0
      ? rawValue
      : "unknown";

    counts[value] = (counts[value] ?? 0) + 1;
  }

  return {
    byKey: counts,
    key,
    total: rows.length,
  };
}

function numberFromAssistantRow(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && Number.isFinite(Number(value))) return Number(value);
  return 0;
}

type AssistantEvidenceSourceType =
  | "action"
  | "chart"
  | "context_snapshot"
  | "dashboard_readiness"
  | "decision"
  | "integration"
  | "kpi"
  | "manual_note"
  | "metric_engine_snapshot"
  | "metric_snapshot"
  | "notification"
  | "recommendation"
  | "report"
  | "table"
  | "unknown";
