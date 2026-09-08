// Proves DurableIngestionPipeline's page-level checkpoint survives a real
// mid-fetch crash against REAL Postgres (app.sync_jobs.resume_page_cursor),
// not the in-memory fake repository used by the unit-style test written
// during initial development of this feature. A fake provider adapter is
// used deliberately (not a real WooCommerce sandbox) so this isolates the
// pipeline+repository's own resume behavior from any external API's
// pagination quirks.
//
// Requires: compose.yaml's postgres + migrate up (DATABASE_URL pointing at
// papadata_app). Run with:
//   pnpm --filter @papadata/worker exec tsx scripts/page-checkpoint-crash-resume-check.ts
process.env.NODE_ENV = "test";

import { randomUUID } from "node:crypto";
import { hostname } from "node:os";
import {
  DurableIntegrationIngestionRepository,
  IdentityRepository,
  IntegrationRepository,
  ProductionDatabase,
} from "@papadata/database";
import { ProviderAdapterError } from "@papadata/integrations";
import type {
  IntegrationProviderAdapter,
  ProviderFetchRequest,
  ProviderFetchResult,
} from "@papadata/integrations";
import { DurableIngestionPipeline } from "../src/production/ingestion-pipeline.js";

const databaseUrl = process.env.DATABASE_URL?.trim()
  || "postgres://papadata_app:change-me-local-only@127.0.0.1:5432/papadata";
const failures: string[] = [];
const evidence: Record<string, unknown>[] = [];

const TOTAL_PAGES = 5;
const RECORDS_PER_PAGE = 10;
const CRASH_ON_PAGE_INDEX = 2;

const database = new ProductionDatabase({
  connectionString: databaseUrl,
  max: 4,
  statementTimeoutMs: 30_000,
});

class FakePagedAdapter implements IntegrationProviderAdapter {
  readonly providerId = "woocommerce" as const;
  readonly requiredScopes = [] as const;
  readonly optionalScopes = [] as const;

  constructor(
    private readonly callLog: string[],
    private readonly crashOnPageIndex: number | null,
  ) {}

  isConfigured(): boolean {
    return true;
  }

  async verifyConnection(): Promise<void> {}

  async fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult> {
    const pageIndex = request.pageCursor
      ? (JSON.parse(request.pageCursor) as { page: number }).page
      : 0;
    this.callLog.push(`page-${pageIndex}`);

    if (this.crashOnPageIndex === pageIndex) {
      throw new ProviderAdapterError("Simulated crash mid-fetch", "transient");
    }

    const isLastPage = pageIndex >= TOTAL_PAGES - 1;
    const records = Array.from({ length: RECORDS_PER_PAGE }, (_, i) => ({
      stream: "orders",
      externalId: `order-${pageIndex}-${i}`,
      observedAt: new Date().toISOString(),
      payload: { id: `order-${pageIndex}-${i}`, page: pageIndex },
    }));

    return {
      records,
      nextCheckpoint: isLastPage ? JSON.stringify({ date: "2026-01-31" }) : request.checkpoint,
      nextPageCursor: isLastPage ? null : JSON.stringify({ page: pageIndex + 1 }),
      partial: false,
      limitations: [],
    };
  }
}

try {
  await run();
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

async function run(): Promise<void> {
  const identity = new IdentityRepository(database);
  const integrations = new IntegrationRepository(database);
  const ingestion = new DurableIntegrationIngestionRepository(database);
  const pipeline = new DurableIngestionPipeline({ repository: ingestion });

  const runId = randomUUID().slice(0, 8);
  const { membership } = await identity.register({
    email: `page-checkpoint-crash-${runId}@papadata.test`,
    passwordHash: "not-used-by-this-test",
    displayName: "Page Checkpoint Crash Test",
    tenantName: `Page Checkpoint Crash ${runId}`,
    workspaceName: "Primary",
    capabilities: [],
  });
  const tenantId = membership.tenantId;
  const workspaceId = membership.workspaceId;

  const connection = await integrations.createConnection({
    tenantId,
    workspaceId,
    providerId: "woocommerce",
    credentialReference: `page-checkpoint-crash-cred-${runId}`,
    requestedScopes: ["read"],
    idempotencyKey: `page-checkpoint-crash-connection-${runId}`,
  });
  const connectionId = String(connection.id);

  const job = await integrations.createJob({
    tenantId,
    workspaceId,
    connectionId,
    providerId: "woocommerce",
    operation: "backfill",
    streams: ["orders"],
    from: "2026-01-01T00:00:00.000Z",
    to: "2026-01-31T00:00:00.000Z",
    idempotencyKey: `page-checkpoint-crash-job-${runId}`,
  });
  const jobId = String(job.id);

  const callLog: string[] = [];

  const jobPayload = {
    tenantId,
    workspaceId,
    jobId,
    connectionId,
    providerId: "woocommerce" as const,
    operation: "backfill",
    streams: ["orders"],
    from: "2026-01-01T00:00:00.000Z",
    to: "2026-01-31T00:00:00.000Z",
  };

  // Attempt 1: crashes while fetching page index 2, after pages 0 and 1
  // have already been fetched, persisted, normalized, canonicalized and
  // reconciled (all durable writes against the real Postgres instance).
  const crashingAdapter = new FakePagedAdapter(callLog, CRASH_ON_PAGE_INDEX);
  let attempt1Threw = false;
  try {
    await pipeline.run({
      payload: jobPayload,
      adapterFactory: async () => crashingAdapter,
      attempt: 1,
      maxAttempts: 5,
      leaseOwner: `page-checkpoint-crash:${hostname()}:1`,
      correlationId: `page-checkpoint-crash-${runId}-attempt-1`,
    });
  } catch (error) {
    attempt1Threw = true;
    evidence.push({ action: "attempt-1-threw", message: message(error) });
  }
  if (!attempt1Threw) {
    failures.push("Attempt 1 was expected to throw (simulated crash on page index 2) but did not.");
  }

  const jobStateAfterCrash = await readJobState(tenantId, workspaceId, jobId);
  evidence.push({ action: "job-state-after-crash", ...jobStateAfterCrash });

  if (jobStateAfterCrash.status !== "retryable_failed") {
    failures.push(
      `Expected job status 'retryable_failed' after a transient crash on attempt 1/5, `
      + `got '${jobStateAfterCrash.status}'.`,
    );
  }
  const expectedResumeCursor = JSON.stringify({ page: CRASH_ON_PAGE_INDEX });
  if (jobStateAfterCrash.resumePageCursor !== expectedResumeCursor) {
    failures.push(
      `Expected resume_page_cursor to be persisted as ${expectedResumeCursor} after pages 0-1 `
      + `succeeded and page 2 crashed, got ${JSON.stringify(jobStateAfterCrash.resumePageCursor)}.`,
    );
  }

  const canonicalCountAfterCrash = await countCanonicalRecords(tenantId, workspaceId, connectionId);
  evidence.push({ action: "canonical-count-after-crash", count: canonicalCountAfterCrash });
  if (canonicalCountAfterCrash !== RECORDS_PER_PAGE * CRASH_ON_PAGE_INDEX) {
    failures.push(
      `Expected ${RECORDS_PER_PAGE * CRASH_ON_PAGE_INDEX} canonical records durably persisted from `
      + `pages 0-1 before the crash, got ${canonicalCountAfterCrash}.`,
    );
  }

  // Attempt 2: retries the SAME job. A correct implementation resumes from
  // resume_page_cursor (page index 2) instead of refetching pages 0-1.
  const resumingAdapter = new FakePagedAdapter(callLog, null);
  const secondRun = await pipeline.run({
    payload: jobPayload,
    adapterFactory: async () => resumingAdapter,
    attempt: 2,
    maxAttempts: 5,
    leaseOwner: `page-checkpoint-crash:${hostname()}:2`,
    correlationId: `page-checkpoint-crash-${runId}-attempt-2`,
  });
  evidence.push({ action: "attempt-2-result", status: secondRun.status, canonicalCount: secondRun.canonicalCount });

  if (secondRun.status !== "succeeded") {
    failures.push(`Attempt 2 (resume) was expected to succeed, got status '${secondRun.status}'.`);
  }

  evidence.push({ action: "call-log", calls: callLog });
  // callLog spans BOTH pipeline.run() invocations sharing one array. Pages
  // 0 and 1 were durably persisted before the crash, so a correct resume
  // must call fetch() for them exactly ZERO additional times. Page 2 is
  // called twice: once on attempt 1 (where it threw before anything was
  // persisted -- so that call "doesn't count" as far as durable state goes)
  // and once on attempt 2 where it actually succeeds. Pages 3-4 only ever
  // run on attempt 2.
  const expectedCallLog = ["page-0", "page-1", "page-2", "page-2", "page-3", "page-4"];
  const actualCallLog = [...callLog];
  if (JSON.stringify(actualCallLog) !== JSON.stringify(expectedCallLog)) {
    failures.push(
      `Expected call log ${JSON.stringify(expectedCallLog)} (pages 0-1 fetched only once, since they were `
      + `durably persisted before the crash), got ${JSON.stringify(actualCallLog)}.`,
    );
  }

  const finalCanonicalCount = await countCanonicalRecords(tenantId, workspaceId, connectionId);
  evidence.push({ action: "final-canonical-count", count: finalCanonicalCount });
  const expectedTotal = RECORDS_PER_PAGE * TOTAL_PAGES;
  if (finalCanonicalCount !== expectedTotal) {
    failures.push(
      `Expected ${expectedTotal} total canonical records after successful resume, got ${finalCanonicalCount} `
      + "-- either data was lost or duplicated across the crash/resume boundary.",
    );
  }

  const finalJobState = await readJobState(tenantId, workspaceId, jobId);
  evidence.push({ action: "final-job-state", ...finalJobState });
  if (finalJobState.status !== "succeeded") {
    failures.push(`Expected final job status 'succeeded', got '${finalJobState.status}'.`);
  }
}

async function readJobState(
  tenantId: string,
  workspaceId: string,
  jobId: string,
): Promise<{ status: string; resumePageCursor: string | null }> {
  return database.withTenantWorkspace(tenantId, workspaceId, async (client) => {
    const result = await client.query<{ status: string; resume_page_cursor: string | null }>(
      `select status, resume_page_cursor
         from app.sync_jobs
        where tenant_id::text = $1 and workspace_id::text = $2 and sync_job_id = $3`,
      [tenantId, workspaceId, jobId],
    );
    const row = result.rows[0];
    return { status: row?.status ?? "missing", resumePageCursor: row?.resume_page_cursor ?? null };
  });
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

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
