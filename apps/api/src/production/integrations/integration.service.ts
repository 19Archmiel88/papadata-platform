import { Inject, Injectable } from "@nestjs/common";
import {
  IntegrationRepository,
  ProductionDatabase,
} from "@papadata/database";
import type {
  CreateIntegrationConnectionRequest,
  MvpIntegrationCatalogProviderId,
  StartIntegrationBackfillRequest,
  StartIntegrationSyncRequest,
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

@Injectable()
export class IntegrationService {
  private readonly repository: IntegrationRepository;
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

  createConnection(
    tenantId: string,
    workspaceId: string,
    request: CreateIntegrationConnectionRequest,
  ): Promise<Record<string, unknown>> {
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

    const job = await this.repository.createJob({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      connectionId: input.connectionId,
      providerId: input.providerId,
      operation: input.operation,
      streams: input.request.streams,
      from,
      to,
      idempotencyKey: String(
        input.request.idempotencyKey,
      ),
    });

    await this.queue.enqueue({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      jobId: String(job.id),
      connectionId: input.connectionId,
      providerId: input.providerId,
      operation: input.operation,
      streams: input.request.streams,
      from,
      to,
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
