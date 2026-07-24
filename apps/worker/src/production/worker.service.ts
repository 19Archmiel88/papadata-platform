import { hostname } from "node:os";
import { Injectable, Logger } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import { Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import {
  DurableIntegrationIngestionRepository,
  IntegrationCredentialRepository,
  IntegrationRepository,
  ProductionDatabase,
} from "@papadata/database";
import {
  createProviderAdapter,
  ScopedCredentialProvider,
  SecretManagerCredentialSecretStore,
  type CredentialProvider,
} from "@papadata/integrations";
import { DurableIngestionPipeline } from "./ingestion-pipeline.js";

export type IntegrationJobPayload = {
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly jobId: string;
  readonly connectionId: string;
  readonly providerId: "woocommerce" | "shopify" | "baselinker" | "allegro" | "google_ads" | "meta_ads" | "ga4";
  readonly operation: string;
  readonly streams: readonly string[];
  readonly from: string | null;
  readonly to: string | null;
};

export type IntegrationConnectionLookup = {
  findConnection(
    tenantId: string,
    workspaceId: string,
    connectionId: string,
  ): Promise<Record<string, unknown> | null>;
};

export async function createAdapterForIntegrationJob(input: {
  readonly payload: IntegrationJobPayload;
  readonly repository: IntegrationConnectionLookup;
  readonly credentialProvider: CredentialProvider;
}) {
  const connection = await input.repository.findConnection(
    input.payload.tenantId,
    input.payload.workspaceId,
    input.payload.connectionId,
  );

  if (!connection || connection.provider_id !== input.payload.providerId) {
    throw new Error("Integration connection scope mismatch");
  }

  const credential = await input.credentialProvider.resolve({
    tenantId: input.payload.tenantId,
    workspaceId: input.payload.workspaceId,
    connectionId: input.payload.connectionId,
    credentialReference: readConnectionCredentialReference(connection),
    provider: input.payload.providerId,
  });

  return createProviderAdapter(credential);
}

@Injectable()
export class IntegrationWorkerService implements OnModuleDestroy {
  private readonly logger = new Logger(IntegrationWorkerService.name);
  private readonly connection = new IORedis(process.env.REDIS_URL ?? "redis://redis-production:6379", { maxRetriesPerRequest: null });
  private readonly database = new ProductionDatabase({
    connectionString: process.env.DATABASE_URL ?? "postgresql://papadata_app:papadata-local@postgres-production:5432/papadata",
    max: 8,
    statementTimeoutMs: 30_000,
  });
  private readonly repository = new IntegrationRepository(this.database);
  private readonly ingestionRepository = new DurableIntegrationIngestionRepository(this.database);
  private readonly credentialProvider: CredentialProvider = new ScopedCredentialProvider({
    metadataReader: new IntegrationCredentialRepository(this.database),
    secretStore: new SecretManagerCredentialSecretStore(),
  });
  private readonly leaseOwner = `worker:${hostname()}:${process.pid}`;
  private readonly worker = new Worker<IntegrationJobPayload>(
    "papadata-integrations",
    (job) => this.process(job),
    {
      connection: this.connection,
      concurrency: Number(process.env.WORKER_CONCURRENCY ?? 4),
      lockDuration: 60_000,
      stalledInterval: 30_000,
    },
  );

  private async process(job: Job<IntegrationJobPayload>): Promise<object> {
    this.logger.log(`Processing ${job.data.operation} for ${job.data.providerId}`);
    const pipeline = new DurableIngestionPipeline({
      repository: this.ingestionRepository,
    });

    return pipeline.run({
      payload: job.data,
      adapterFactory: async () => {
        const adapter = await createAdapterForIntegrationJob({
          payload: job.data,
          repository: this.repository,
          credentialProvider: this.credentialProvider,
        });
        await adapter.verifyConnection();
        return adapter;
      },
      attempt: job.attemptsMade + 1,
      maxAttempts: Number(job.opts.attempts ?? 1),
      leaseOwner: this.leaseOwner,
      correlationId: String(job.id ?? job.data.jobId),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker.close();
    await this.connection.quit();
    await this.database.close();
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
