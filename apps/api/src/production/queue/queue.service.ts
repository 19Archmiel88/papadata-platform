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
  private readonly connection: IORedis;
  private readonly queue: Queue<IntegrationQueuePayload>;

  constructor() {
    const config = readProductionConfig();
    this.connection = new IORedis(config.redisUrl, { maxRetriesPerRequest: null });
    this.queue = new Queue<IntegrationQueuePayload>("papadata-integrations", {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    });
  }

  async enqueue(payload: IntegrationQueuePayload): Promise<void> {
    await this.queue.add(payload.operation, payload, {
      jobId: payload.jobId,
    });
  }

  async retry(jobId: string): Promise<void> {
    const job = await this.queue.getJob(jobId);
    if (!job) throw new Error("Queue job not found");
    await job.retry();
  }

  async cancel(jobId: string): Promise<void> {
    const job = await this.queue.getJob(jobId);
    if (!job) throw new Error("Queue job not found");
    await job.remove();
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
    await this.connection.quit();
  }
}
