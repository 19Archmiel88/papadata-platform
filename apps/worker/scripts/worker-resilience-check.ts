// Exercises DurableIngestionPipeline against real Postgres and a real,
// self-hosted WooCommerce sandbox (see compose.woocommerce-sandbox.yml) --
// not fakes -- to prove two things restart-failure.mjs cannot:
//
//   1. Worker job idempotency: two independently-triggered sync jobs that
//      cover the same data window must not double the canonical record
//      count in Postgres.
//   2. Database connection pooling under concurrent load stays within the
//      worker's configured pool size (see apps/worker/src/production/
//      worker.service.ts, `max: 8`) and does not error out or leak
//      connections beyond it.
//
// Requires: compose.production-parity.yml up (for Postgres) and
// compose.woocommerce-sandbox.yml up (for a real provider to sync against).
// Run with:
//   WOOCOMMERCE_SANDBOX_CONSUMER_KEY=... WOOCOMMERCE_SANDBOX_CONSUMER_SECRET=... \
//     pnpm --filter @papadata/worker exec tsx scripts/worker-resilience-check.ts
process.env.NODE_ENV = "test";
// The WooCommerce sandbox terminates TLS with a throwaway self-signed
// certificate (see .runtime/woo-sandbox-tls) that is not part of any trusted
// CA bundle. This process only ever talks to that one local sandbox, so
// disabling verification here is scoped and does not affect real traffic.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { hostname } from "node:os";
import { join } from "node:path";
import {
  DurableIntegrationIngestionRepository,
  IdentityRepository,
  IntegrationCredentialRepository,
  IntegrationRepository,
  ProductionDatabase,
} from "@papadata/database";
import {
  ScopedCredentialProvider,
  InMemoryCredentialSecretStore,
  createProviderAdapter,
} from "@papadata/integrations";
import { DurableIngestionPipeline } from "../src/production/ingestion-pipeline.js";

const repoRoot = new URL("../../../", import.meta.url).pathname;
const databaseUrl = readDatabaseUrl();
const wooSandboxUrl = process.env.WOOCOMMERCE_SANDBOX_URL?.trim() || "https://127.0.0.1:8543";
const failures: string[] = [];
const evidence: Record<string, unknown>[] = [];

const database = new ProductionDatabase({
  connectionString: databaseUrl,
  max: 8,
  statementTimeoutMs: 30_000,
});

try {
  await runIdempotencyCheck();
  await runConnectionPoolingCheck();
  await runStatementTimeoutCheck();
} finally {
  await database.close();
}

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  result: failures.length === 0 ? "pass" : "fail",
  evidence,
  failures,
}, null, 2));
if (failures.length > 0) process.exitCode = 1;

async function runIdempotencyCheck(): Promise<void> {
  const identity = new IdentityRepository(database);
  const integrations = new IntegrationRepository(database);
  const credentials = new IntegrationCredentialRepository(database);
  const ingestion = new DurableIntegrationIngestionRepository(database);

  const runId = randomUUID().slice(0, 8);
  const email = `worker-resilience-${runId}@papadata.test`;
  const { membership } = await identity.register({
    email,
    passwordHash: "not-used-by-this-test",
    displayName: "Worker Resilience Test",
    tenantName: `Worker Resilience ${runId}`,
    workspaceName: "Primary",
    capabilities: [],
  });
  const tenantId = membership.tenantId;
  const workspaceId = membership.workspaceId;

  const credentialReference = `worker-resilience-cred-${runId}`;
  const connection = await integrations.createConnection({
    tenantId,
    workspaceId,
    providerId: "woocommerce",
    credentialReference,
    requestedScopes: ["read"],
    idempotencyKey: `worker-resilience-connection-${runId}`,
  });
  const connectionId = String(connection.id);

  await insertCredentialMetadata({
    tenantId,
    workspaceId,
    connectionId,
    credentialReference,
  });

  const secretStore = new InMemoryCredentialSecretStore();
  secretStore.setSecret(
    {
      providerId: "woocommerce",
      credentialReference,
      secretResource: credentialReference,
      version: "v1",
    },
    JSON.stringify({
      storeUrl: wooSandboxUrl,
      consumerKey: requireEnv("WOOCOMMERCE_SANDBOX_CONSUMER_KEY"),
      consumerSecret: requireEnv("WOOCOMMERCE_SANDBOX_CONSUMER_SECRET"),
    }),
  );
  const credentialProvider = new ScopedCredentialProvider({
    metadataReader: credentials,
    secretStore,
  });

  const adapterFactory = async () => {
    const resolved = await credentialProvider.resolve({
      tenantId,
      workspaceId,
      connectionId,
      credentialReference,
      provider: "woocommerce",
    });
    const adapter = createProviderAdapter(resolved);
    await adapter.verifyConnection();
    return adapter;
  };

  // Both jobs pin an explicit `from` well before any sandbox order, instead
  // of relying on the connection's checkpoint (which auto-advances after a
  // successful run and would otherwise make the second run fetch nothing to
  // re-observe). That would only prove incremental sync works, not that
  // re-syncing the *same* window is idempotent -- which is the point here.
  const syncFrom = "2020-01-01T00:00:00.000Z";
  const pipeline = new DurableIngestionPipeline({ repository: ingestion });
  const jobPayload = (jobId: string) => ({
    tenantId,
    workspaceId,
    jobId,
    connectionId,
    providerId: "woocommerce" as const,
    operation: "backfill",
    streams: ["orders"],
    from: syncFrom,
    to: null,
  });

  const firstJob = await integrations.createJob({
    tenantId,
    workspaceId,
    connectionId,
    providerId: "woocommerce",
    operation: "backfill",
    streams: ["orders"],
    from: syncFrom,
    to: null,
    idempotencyKey: `worker-resilience-job-a-${runId}`,
  });

  const firstRun = await pipeline.run({
    payload: jobPayload(String(firstJob.id)),
    adapterFactory,
    attempt: 1,
    maxAttempts: 5,
    leaseOwner: `worker-resilience:${hostname()}:1`,
    correlationId: `worker-resilience-${runId}-a`,
  });

  evidence.push({ action: "first-run", ...summarize(firstRun) });

  if (firstRun.status !== "succeeded" || firstRun.fetchedCount === 0) {
    failures.push(`First WooCommerce sync did not succeed with real data: ${JSON.stringify(firstRun)}`);
    return;
  }

  const canonicalCountAfterFirst = await countCanonicalRecords(tenantId, workspaceId, connectionId);

  const secondJob = await integrations.createJob({
    tenantId,
    workspaceId,
    connectionId,
    providerId: "woocommerce",
    operation: "backfill",
    streams: ["orders"],
    from: syncFrom,
    to: null,
    idempotencyKey: `worker-resilience-job-b-${runId}`,
  });

  const secondRun = await pipeline.run({
    payload: jobPayload(String(secondJob.id)),
    adapterFactory,
    attempt: 1,
    maxAttempts: 5,
    leaseOwner: `worker-resilience:${hostname()}:2`,
    correlationId: `worker-resilience-${runId}-b`,
  });

  evidence.push({ action: "second-run-same-window", ...summarize(secondRun) });

  const canonicalCountAfterSecond = await countCanonicalRecords(tenantId, workspaceId, connectionId);
  evidence.push({
    action: "canonical-record-count",
    afterFirstRun: canonicalCountAfterFirst,
    afterSecondRun: canonicalCountAfterSecond,
  });

  if (secondRun.status !== "succeeded") {
    failures.push(`Second (overlapping) WooCommerce sync did not succeed: ${JSON.stringify(secondRun)}`);
  }
  if (secondRun.duplicateCount !== secondRun.fetchedCount) {
    failures.push(
      `Second run fetched ${secondRun.fetchedCount} records but only ${secondRun.duplicateCount} were `
      + "recognised as duplicates of the first run -- idempotency key is not deduplicating as expected.",
    );
  }
  if (canonicalCountAfterSecond !== canonicalCountAfterFirst) {
    failures.push(
      `Canonical record count changed across the second, overlapping sync run `
      + `(${canonicalCountAfterFirst} -> ${canonicalCountAfterSecond}) -- re-syncing the same window `
      + "must not create duplicate canonical records.",
    );
  }
}

async function runConnectionPoolingCheck(): Promise<void> {
  const identity = new IdentityRepository(database);
  const runId = randomUUID().slice(0, 8);
  const { membership } = await identity.register({
    email: `worker-resilience-pool-${runId}@papadata.test`,
    passwordHash: "not-used-by-this-test",
    displayName: "Pool Test",
    tenantName: `Pool Test ${runId}`,
    workspaceName: "Primary",
    capabilities: [],
  });

  const concurrentQueries = 20;
  // performance.now() is monotonic and immune to system clock jumps -- see
  // the equivalent comment in tests/backend-production-parity/restart-failure.mjs,
  // where a WSL2 host clock jump previously produced a nonsensical negative
  // Date.now()-based duration.
  const startedAt = performance.now();
  const results = await Promise.allSettled(
    Array.from({ length: concurrentQueries }, () => (
      database.withTenantWorkspace(
        membership.tenantId,
        membership.workspaceId,
        async (client) => {
          await client.query("select pg_sleep(0.2)");
          return true;
        },
      )
    )),
  );
  const durationMs = Math.round(performance.now() - startedAt);
  const rejected = results.filter((result) => result.status === "rejected");

  evidence.push({
    action: "concurrent-pool-load",
    concurrentQueries,
    poolMax: 8,
    succeeded: results.length - rejected.length,
    rejected: rejected.length,
    durationMs,
  });

  if (rejected.length > 0) {
    failures.push(
      `${rejected.length}/${concurrentQueries} concurrent queries failed against a pool of max 8 `
      + `connections: ${(rejected[0] as PromiseRejectedResult).reason}`,
    );
  }
  // With max 8 connections and 20 queued 200ms queries, pg's own pool queues
  // the overflow rather than erroring -- so 3 serialized batches of 8/8/4
  // must take at least ~600ms (3 * 200ms) if the pool cap is actually being
  // enforced, not silently opening more than 8 connections.
  if (durationMs < 550) {
    failures.push(
      `Concurrent load finished in ${durationMs}ms, faster than 3 serialized batches of a `
      + "max-8 pool would allow -- the pool cap may not be enforced.",
    );
  }
}

// `DatabaseConfig.statementTimeoutMs` is wired into `pg.Pool` as
// `statement_timeout` (packages/database/src/production.ts), but that had
// never been proven against a real server -- a typo'd config key or a
// provider that silently ignores the setting would look identical to a
// correctly-configured pool until a real query actually ran long enough to
// hit it. A dedicated short-timeout database instance + pg_sleep() longer
// than the timeout is the only way to prove Postgres itself cancels the
// query, rather than trusting the config value was plumbed through.
async function runStatementTimeoutCheck(): Promise<void> {
  const timeoutMs = 500;
  const shortTimeoutDatabase = new ProductionDatabase({
    connectionString: databaseUrl,
    max: 2,
    statementTimeoutMs: timeoutMs,
  });

  const runId = randomUUID().slice(0, 8);
  const identity = new IdentityRepository(shortTimeoutDatabase);
  const { membership } = await identity.register({
    email: `worker-resilience-timeout-${runId}@papadata.test`,
    passwordHash: "not-used-by-this-test",
    displayName: "Timeout Test",
    tenantName: `Timeout Test ${runId}`,
    workspaceName: "Primary",
    capabilities: [],
  });

  // performance.now() is monotonic and immune to system clock jumps -- see
  // the equivalent comment in tests/backend-production-parity/restart-failure.mjs.
  const startedAt = performance.now();
  try {
    await shortTimeoutDatabase.withTenantWorkspace(
      membership.tenantId,
      membership.workspaceId,
      async (client) => {
        // Sleeps 4x longer than statement_timeout so this can only resolve
        // by Postgres cancelling the query, never by chance completion.
        await client.query("select pg_sleep(2)");
      },
    );
    failures.push(
      `A query sleeping 2000ms completed despite a ${timeoutMs}ms statement_timeout -- `
      + "the timeout is not actually being enforced by Postgres.",
    );
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);
    const code = (error as { code?: string }).code;
    evidence.push({
      action: "statement-timeout-enforced",
      configuredTimeoutMs: timeoutMs,
      durationMs,
      postgresErrorCode: code,
    });
    if (code !== "57014") {
      failures.push(
        `Expected Postgres to cancel the query with code 57014 (query_canceled) after `
        + `${timeoutMs}ms, got code=${code} after ${durationMs}ms: ${message(error)}`,
      );
    }
    if (durationMs > timeoutMs + 1_000) {
      failures.push(
        `statement_timeout took ${durationMs}ms to fire against a ${timeoutMs}ms configured timeout -- `
        + "too far off to trust the setting is what's actually bounding query duration.",
      );
    }
  } finally {
    await shortTimeoutDatabase.close();
  }
}

async function countCanonicalRecords(
  tenantId: string,
  workspaceId: string,
  connectionId: string,
): Promise<number> {
  return database.withTenantWorkspace(tenantId, workspaceId, async (client) => {
    const result = await client.query<{ count: string }>(
      `select count(*)::text as count
         from app.integration_canonical_records
        where tenant_id::text = $1 and workspace_id::text = $2 and connection_id = $3`,
      [tenantId, workspaceId, connectionId],
    );
    return Number(result.rows[0]?.count ?? "0");
  });
}

async function insertCredentialMetadata(input: {
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly connectionId: string;
  readonly credentialReference: string;
}): Promise<void> {
  await database.withTenantWorkspace(input.tenantId, input.workspaceId, async (client) => {
    await client.query(
      `insert into app.integration_credentials (
         tenant_id, workspace_id, connection_id, provider_id,
         secret_reference, credential_reference, secret_resource, active_version,
         rotation_state, required_scopes, granted_scopes, status, issued_at
       ) values (
         $1, $2, $3, 'woocommerce',
         $4, $4, $4, 'v1',
         'active', '["read"]'::jsonb, '["read"]'::jsonb, 'active', now()
       )`,
      [input.tenantId, input.workspaceId, input.connectionId, input.credentialReference],
    );
  });
}

function summarize(result: {
  readonly status: string;
  readonly fetchedCount: number;
  readonly persistedSourceCount: number;
  readonly normalizedCount: number;
  readonly canonicalCount: number;
  readonly duplicateCount: number;
}) {
  return {
    status: result.status,
    fetchedCount: result.fetchedCount,
    persistedSourceCount: result.persistedSourceCount,
    normalizedCount: result.normalizedCount,
    canonicalCount: result.canonicalCount,
    duplicateCount: result.duplicateCount,
  };
}

function readDatabaseUrl(): string {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();
  const envPath = join(repoRoot, ".env.production-parity");
  const raw = readFileSync(envPath, "utf8");
  const line = raw.split("\n").find((entry) => entry.startsWith("DATABASE_URL="));
  if (!line) throw new Error(`DATABASE_URL not found in ${envPath}`);
  return line
    .slice("DATABASE_URL=".length)
    .trim()
    .replace("postgres-production:5432", "127.0.0.1:55432");
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} must be set (real WooCommerce sandbox REST API credentials).`);
  return value;
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
