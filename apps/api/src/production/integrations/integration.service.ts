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

  listProviders(): object {
    const enabled = this.registry.listDescriptors().map((provider) => ({
      ...provider,
      runtimeAvailability: this.registry.hasAdapter(provider.providerId)
        ? "adapter_implemented"
        : "not_implemented",
      releaseStatus: "enabled",
    }));
    const targetOnly = this.registry.listTargetDescriptors()
      .filter((provider) => !this.registry.hasAdapter(provider.providerId))
      .map((provider) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        category: provider.category,
        runtimeAvailability: "not_implemented",
        releaseStatus: "target_only",
        connectable: false,
      }));

    return {
      enabled,
      targetOnly,
      releasePolicy: "Only providers backed by a registered adapter are connectable.",
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
