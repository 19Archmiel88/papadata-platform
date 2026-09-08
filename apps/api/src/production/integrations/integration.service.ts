import { ConflictException, Inject, Injectable } from "@nestjs/common";
import {
  BillingRepository,
  IntegrationRepository,
  ProductionDatabase,
} from "@papadata/database";
import {
  entitlementsForMigratedPlan,
  type CreateIntegrationConnectionRequest,
  type MvpIntegrationCatalogProviderId,
  type StartIntegrationBackfillRequest,
  type StartIntegrationSyncRequest,
} from "@papadata/contracts";
import { ProviderRegistry, type CredentialProvider } from "@papadata/integrations";
import { IntegrationQueueService } from "../queue/queue.service.js";
import { INTEGRATION_CREDENTIAL_PROVIDER } from "./credential-provider.js";
import { createProviderRegistry } from "./provider.factory.js";
import {
  buildIntegrationCatalog,
  buildIntegrationCompleteness,
  buildIntegrationLogs,
  buildIntegrationRuntimeStatus,
  isMvpProviderId,
  testProviderCredential,
  type IntegrationCredentialTestRequest,
  type IntegrationCredentialTestResult,
  type IntegrationRuntimeStatus,
} from "./integration-runtime.js";

// A large backfill (e.g. a client's first-ever import of years of order
// history) is split into consecutive date-range sub-jobs of at most this
// many days each, rather than one job spanning the whole requested range.
// This bounds how much work is lost if one sub-job fails after exhausting
// its retries -- only that chunk needs POST /jobs/:id/retry, not the whole
// backfill -- and, since each sub-job is scheduled independently, spreads
// the real HTTP traffic across RedisProviderRateLimiter's window rather
// than one job trying to page through years of data inside a single
// provider-imposed rate-limit budget. Configurable because the right chunk
// size trades off against how many separate jobs a very long backfill
// produces.
const BACKFILL_CHUNK_DAYS = readPositiveIntEnv("BACKFILL_CHUNK_DAYS", 30);

@Injectable()
export class IntegrationService {
  private readonly repository: IntegrationRepository;
  private readonly billing: BillingRepository;
  private readonly registry: ProviderRegistry = createProviderRegistry();

  constructor(
    @Inject(ProductionDatabase)
    database: ProductionDatabase,
    @Inject(IntegrationQueueService)
    private readonly queue: IntegrationQueueService,
    @Inject(INTEGRATION_CREDENTIAL_PROVIDER)
    private readonly credentialProvider: CredentialProvider,
  ) {
    this.repository = new IntegrationRepository(database);
    this.billing = new BillingRepository(database);
  }

  async listProviders(
    tenantId: string,
    workspaceId: string,
  ): Promise<object> {
    const connections = await this.repository.listConnections(tenantId, workspaceId);
    const providers = buildIntegrationCatalog({
      connections,
      descriptors: this.registry.listTargetDescriptors(),
      hasAdapter: (provider) => this.registry.hasAdapter(provider),
    });

    return {
      enabled: providers.filter((provider) => provider.connectable),
      providers,
      releasePolicy: "Provider is connectable only when backend readiness is production_ready, an adapter exists and environment status is ready.",
      targetOnly: providers.filter((provider) => !provider.connectable),
    };
  }

  listConnections(
    tenantId: string,
    workspaceId: string,
  ): Promise<readonly Record<string, unknown>[]> {
    return this.repository.listConnections(tenantId, workspaceId);
  }

  listJobs(
    tenantId: string,
    workspaceId: string,
  ): Promise<readonly Record<string, unknown>[]> {
    return this.repository.listJobs(tenantId, workspaceId);
  }

  async readStatus(
    tenantId: string,
    workspaceId: string,
  ): Promise<IntegrationRuntimeStatus> {
    return this.readRuntimeStatusSnapshot(tenantId, workspaceId);
  }

  async readCatalog(
    tenantId: string,
    workspaceId: string,
  ): Promise<object> {
    const connections = await this.repository.listConnections(tenantId, workspaceId);
    return {
      generatedAt: new Date().toISOString(),
      providers: buildIntegrationCatalog({
        connections,
        descriptors: this.registry.listTargetDescriptors(),
        hasAdapter: (provider) => this.registry.hasAdapter(provider),
      }),
    };
  }

  async readLogs(
    tenantId: string,
    workspaceId: string,
  ): Promise<object> {
    const [jobs, reconciliationRows] = await Promise.all([
      this.repository.listJobs(tenantId, workspaceId),
      this.repository.listReconciliationRuns(tenantId, workspaceId),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      logs: buildIntegrationLogs({
        descriptors: this.registry.listTargetDescriptors(),
        jobs,
        reconciliationRows,
      }),
    };
  }

  async readCompleteness(
    tenantId: string,
    workspaceId: string,
  ): Promise<object> {
    const status = await this.readRuntimeStatusSnapshot(tenantId, workspaceId);
    return buildIntegrationCompleteness(status);
  }

  async testProviderConnection(
    provider: string,
    request: IntegrationCredentialTestRequest,
  ): Promise<IntegrationCredentialTestResult> {
    if (!isMvpProviderId(provider)) {
      throw new Error("Unsupported integration provider");
    }

    if (!this.registry.hasAdapter(provider)) {
      throw new Error("Integration provider adapter is not registered");
    }

    return testProviderCredential(provider, request);
  }

  findJob(
    tenantId: string,
    workspaceId: string,
    jobId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.repository.findJob(
      tenantId,
      workspaceId,
      jobId,
    );
  }

  async createConnection(
    tenantId: string,
    workspaceId: string,
    request: CreateIntegrationConnectionRequest,
  ): Promise<Record<string, unknown>> {
    // Real enforcement of the plan's maxDataSources entitlement -- until
    // now nothing checked it server-side; the billing.* read endpoints
    // merely displayed it (and, before BillingRepository existed, displayed
    // a hardcoded connectedDataSources: 0 that could never have triggered a
    // limit anyway).
    const [subscription, existingConnections] = await Promise.all([
      this.billing.readSubscription(tenantId, workspaceId),
      this.repository.listConnections(tenantId, workspaceId),
    ]);
    const entitlements = entitlementsForMigratedPlan(subscription.planId);
    if (existingConnections.length >= entitlements.maxDataSources) {
      throw new ConflictException({
        code: "PLAN_DATA_SOURCE_LIMIT_REACHED",
        message: `Plan limit reached: at most ${entitlements.maxDataSources} connected data sources.`,
      });
    }

    return this.repository.createConnection({
      tenantId,
      workspaceId,
      providerId: request.providerId,
      credentialReference: request.credentialReference,
      requestedScopes: request.requestedScopes,
      idempotencyKey: String(request.idempotencyKey),
    });
  }

  async disconnect(
    tenantId: string,
    workspaceId: string,
    connectionId: string,
  ): Promise<void> {
    const deleted = await this.repository.markConnectionDeleted(
      tenantId,
      workspaceId,
      connectionId,
    );

    if (!deleted) {
      throw new Error(
        "Integration connection was not found or was already disconnected",
      );
    }
  }

  async retryJob(
    tenantId: string,
    workspaceId: string,
    jobId: string,
  ): Promise<void> {
    const job = await this.repository.findJob(
      tenantId,
      workspaceId,
      jobId,
    );

    if (!job) {
      throw new Error("Integration job not found");
    }

    await this.queue.retry(jobId);
  }

  async cancelJob(
    tenantId: string,
    workspaceId: string,
    jobId: string,
  ): Promise<void> {
    const cancelled = await this.repository.markJobCancelled(
      tenantId,
      workspaceId,
      jobId,
    );

    if (!cancelled) {
      throw new Error("Integration job cannot be cancelled");
    }

    await this.queue.cancel(jobId);
  }

  async startSync(input: {
    tenantId: string;
    workspaceId: string;
    connectionId: string;
    providerId: MvpIntegrationCatalogProviderId;
    request:
      | StartIntegrationSyncRequest
      | StartIntegrationBackfillRequest;
    operation: "incremental_sync" | "backfill";
  }): Promise<Record<string, unknown>> {
    const connection = await this.repository.findConnection(
      input.tenantId,
      input.workspaceId,
      input.connectionId,
    );

    if (
      !connection
      || connection.provider_id !== input.providerId
    ) {
      throw new Error("Integration connection scope mismatch");
    }

    const credentialReference = readConnectionCredentialReference(connection);
    await this.credentialProvider.resolve({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      connectionId: input.connectionId,
      credentialReference,
      provider: input.providerId,
    });

    const from = "from" in input.request
      ? input.request.from
      : null;

    const to = "to" in input.request
      ? input.request.to
      : null;

    const chunks = input.operation === "backfill" && from && to
      ? chunkBackfillRange(from, to, BACKFILL_CHUNK_DAYS)
      : [{ from, to }];

    const jobs = await Promise.all(chunks.map((chunk, index) => this.createAndEnqueueJob({
      connectionId: input.connectionId,
      from: chunk.from,
      idempotencyKey: chunks.length > 1
        ? `${String(input.request.idempotencyKey)}:chunk-${index + 1}-of-${chunks.length}`
        : String(input.request.idempotencyKey),
      operation: input.operation,
      providerId: input.providerId,
      streams: input.request.streams,
      tenantId: input.tenantId,
      to: chunk.to,
      workspaceId: input.workspaceId,
    })));

    // Callers of the pre-existing single-job shape (incremental_sync, and
    // any backfill request small enough to fit in one chunk) keep getting
    // exactly that -- only a genuinely multi-chunk backfill grows the
    // response, so nothing that reads a single job object off this call
    // breaks.
    return jobs.length === 1
      ? jobs[0]!
      : { chunkCount: jobs.length, jobs };
  }

  private async createAndEnqueueJob(input: {
    tenantId: string;
    workspaceId: string;
    connectionId: string;
    providerId: MvpIntegrationCatalogProviderId;
    operation: "incremental_sync" | "backfill";
    streams: readonly string[];
    from: string | null;
    to: string | null;
    idempotencyKey: string;
  }): Promise<Record<string, unknown>> {
    const job = await this.repository.createJob({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      connectionId: input.connectionId,
      providerId: input.providerId,
      operation: input.operation,
      streams: input.streams,
      from: input.from,
      to: input.to,
      idempotencyKey: input.idempotencyKey,
    });

    await this.queue.enqueue({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      jobId: String(job.id),
      connectionId: input.connectionId,
      providerId: input.providerId,
      operation: input.operation,
      streams: input.streams,
      from: input.from,
      to: input.to,
    });

    return job;
  }

  private async readRuntimeStatusSnapshot(
    tenantId: string,
    workspaceId: string,
  ): Promise<IntegrationRuntimeStatus> {
    const now = new Date();
    const from = new Date(now);
    from.setUTCDate(from.getUTCDate() - 90);
    const [
      connections,
      jobs,
      checkpoints,
      issues,
      coverageRows,
      reconciliationRows,
    ] = await Promise.all([
      this.repository.listConnections(tenantId, workspaceId),
      this.repository.listJobs(tenantId, workspaceId),
      this.repository.listSyncCheckpoints(tenantId, workspaceId),
      this.repository.listOpenDataIssues(tenantId, workspaceId),
      this.repository.listCanonicalCoverageByDay(tenantId, workspaceId, {
        from: from.toISOString(),
        to: now.toISOString(),
      }),
      this.repository.listReconciliationRuns(tenantId, workspaceId),
    ]);

    return buildIntegrationRuntimeStatus({
      checkpoints,
      connections,
      coverageRows,
      descriptors: this.registry.listTargetDescriptors(),
      hasAdapter: (provider) => this.registry.hasAdapter(provider),
      issues,
      jobs,
      now,
      reconciliationRows,
    });
  }
}

function readConnectionCredentialReference(
  connection: Record<string, unknown>,
): string {
  const credentialReference = connection.credential_ref;
  if (
    typeof credentialReference !== "string"
    || credentialReference.trim().length === 0
  ) {
    throw new Error("Integration connection has no credential reference");
  }
  return credentialReference;
}

/**
 * Splits [from, to) into consecutive windows of at most `chunkDays` days.
 * Returns a single [from, to] window unchanged when the range already fits,
 * when it isn't chronological, or when the dates don't parse -- callers
 * (startSync) already validate `from`/`to` are real ISO8601 values via the
 * DTO layer, so a parse failure here would mean this ran on already-invalid
 * input, in which case falling through to the single-job path lets the
 * existing downstream validation reject it the same way it always has.
 */
function chunkBackfillRange(
  fromIso: string,
  toIso: string,
  chunkDays: number,
): readonly { readonly from: string; readonly to: string }[] {
  const fromMs = Date.parse(fromIso);
  const toMs = Date.parse(toIso);
  const chunkMs = chunkDays * 24 * 60 * 60 * 1_000;

  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || toMs <= fromMs || chunkMs <= 0) {
    return [{ from: fromIso, to: toIso }];
  }

  if (toMs - fromMs <= chunkMs) {
    return [{ from: fromIso, to: toIso }];
  }

  const chunks: { from: string; to: string }[] = [];
  let cursorMs = fromMs;
  while (cursorMs < toMs) {
    const chunkEndMs = Math.min(cursorMs + chunkMs, toMs);
    chunks.push({
      from: new Date(cursorMs).toISOString(),
      to: new Date(chunkEndMs).toISOString(),
    });
    cursorMs = chunkEndMs;
  }
  return chunks;
}

function readPositiveIntEnv(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
