import { Injectable } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { readProductionConfig } from "../config.js";

export type IntegrationQueuePayload = {
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly jobId: string;
  readonly connectionId: string;
  readonly providerId: string;
  readonly operation: string;
  readonly streams: readonly string[];
  readonly from: string | null;
  readonly to: string | null;
};

@Injectable()
export class IntegrationQueueService implements OnModuleDestroy {
  private readonly connection: IORedis | null;
  private readonly queue: Queue<IntegrationQueuePayload> | null;
  private readonly inMemoryJobIds: Set<string> | null;

  constructor() {
    if (isTestMemoryQueue()) {
      this.connection = null;
      this.queue = null;
      this.inMemoryJobIds = new Set<string>();
      return;
    }

    const config = readProductionConfig();
    this.connection = new IORedis(config.redisUrl, {
      connectTimeout: config.redisConnectTimeoutMs,
      maxRetriesPerRequest: null,
      ...(config.redisCaBase64
        ? { tls: { ca: Buffer.from(config.redisCaBase64, "base64").toString("utf8") } }
        : {}),
    });
    this.queue = new Queue<IntegrationQueuePayload>("papadata-integrations", {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    });
    this.inMemoryJobIds = null;
  }

  async enqueue(payload: IntegrationQueuePayload): Promise<void> {
    if (this.inMemoryJobIds) {
      this.inMemoryJobIds.add(payload.jobId);
      return;
    }
    await requiredQueue(this.queue).add(payload.operation, payload, {
      jobId: payload.jobId,
    });
  }

  async retry(jobId: string): Promise<void> {
    if (this.inMemoryJobIds) {
      if (!this.inMemoryJobIds.has(jobId)) throw new Error("Queue job not found");
      return;
    }
    const job = await requiredQueue(this.queue).getJob(jobId);
    if (!job) throw new Error("Queue job not found");
    await job.retry();
  }

  async cancel(jobId: string): Promise<void> {
    if (this.inMemoryJobIds) {
      if (!this.inMemoryJobIds.has(jobId)) throw new Error("Queue job not found");
      return;
    }
    const job = await requiredQueue(this.queue).getJob(jobId);
    if (!job) throw new Error("Queue job not found");

    const state = await job.getState();
    if (state === "delayed") {
      await job.promote();
    }
    // The database is the cancellation source of truth. The worker observes
    // cancel_requested_at at safe checkpoints and records the terminal state.
  }

  async onModuleDestroy(): Promise<void> {
    if (this.queue) await this.queue.close();
    if (this.connection) await this.connection.quit();
  }
}

function isTestMemoryQueue(): boolean {
  return process.env.NODE_ENV === "test"
    && process.env.PAPADATA_API_QUEUE_DRIVER === "test-memory";
}

function requiredQueue(
  queue: Queue<IntegrationQueuePayload> | null,
): Queue<IntegrationQueuePayload> {
  if (!queue) throw new Error("Integration queue is unavailable.");
  return queue;
}
