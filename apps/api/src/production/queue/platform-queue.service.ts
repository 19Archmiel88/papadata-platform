import { Injectable } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { readProductionConfig } from "../config.js";

export type PlatformJobPayload = {
  readonly jobType: "report" | "privacy_request" | "reconciliation" | "retention" | "ai_evaluation";
  readonly tenantId: string;
  readonly workspaceId: string | null;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly idempotencyKey: string;
};

@Injectable()
export class PlatformQueueService implements OnModuleDestroy {
  private readonly connection: IORedis | null;
  private readonly queue: Queue<PlatformJobPayload> | null;
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
    this.queue = new Queue<PlatformJobPayload>("papadata-platform-jobs", {
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

  async enqueue(payload: PlatformJobPayload): Promise<void> {
    if (this.inMemoryJobIds) {
      this.inMemoryJobIds.add(payload.idempotencyKey);
      return;
    }
    await requiredQueue(this.queue).add(payload.jobType, payload, {
      jobId: toBullMqJobId(payload.idempotencyKey),
    });
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
  queue: Queue<PlatformJobPayload> | null,
): Queue<PlatformJobPayload> {
  if (!queue) throw new Error("Platform queue is unavailable.");
  return queue;
}

function toBullMqJobId(value: string): string {
  return value.replaceAll(":", "_");
}
