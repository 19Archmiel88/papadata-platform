import { Injectable, Logger, type OnModuleDestroy } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { PlatformDatabase } from "@papadata/database";
import { readWorkerConfig } from "./config.js";
import type { PlatformJobPayload } from "./platform-worker.service.js";

@Injectable()
export class ReconciliationScheduler implements OnModuleDestroy {
  private readonly logger = new Logger(ReconciliationScheduler.name);
  private readonly config = readWorkerConfig();
  private readonly connection = new IORedis(this.config.redisUrl, {
    connectTimeout: 5_000,
    maxRetriesPerRequest: null,
    ...(this.config.redisCaBase64
      ? { tls: { ca: Buffer.from(this.config.redisCaBase64, "base64").toString("utf8") } }
      : {}),
  });
  private readonly queue = new Queue<PlatformJobPayload>("papadata-platform-jobs", {
    connection: this.connection,
  });
  private readonly database = new PlatformDatabase({
    connectionString: this.config.schedulerDatabaseUrl,
    max: 2,
    statementTimeoutMs: 30_000,
  });

  @Cron(process.env.RECONCILIATION_CRON ?? "0 */6 * * *")
  async scheduleReconciliation(): Promise<void> {
    await this.enqueueSingleton("reconciliation", new Date());
  }

  @Cron(process.env.RETENTION_CRON ?? "30 2 * * *")
  async scheduleRetention(): Promise<void> {
    await this.enqueueSingleton("retention", new Date());
  }

  private async enqueueSingleton(
    jobType: "reconciliation" | "retention",
    scheduledFor: Date,
  ): Promise<void> {
    const scheduledAt = dateTruncatedToHour(scheduledFor);
    const jobId = `platform:${jobType}:${scheduledAt}`;

    await this.database.withTransaction(async (client) => {
      const lock = await client.query<{ acquired: boolean }>(
        "select pg_try_advisory_xact_lock(hashtext($1)) as acquired",
        [`scheduler:${jobType}`],
      );
      if (lock.rows[0]?.acquired !== true) return;

      const reservation = await client.query<{ inserted: boolean }>(
        `insert into app.platform_schedule_runs (
           schedule_key, scheduled_for, job_id, status
         ) values ($1, $2::timestamptz, $3, 'enqueued')
         on conflict (schedule_key, scheduled_for) do nothing
         returning true as inserted`,
        [jobType, scheduledAt, jobId],
      );
      if (reservation.rows[0]?.inserted !== true) return;

      try {
        await this.queue.add(jobType, {
          jobType,
          tenantId: "system",
          workspaceId: null,
          payload: { scheduledFor: scheduledAt },
          idempotencyKey: jobId,
        }, {
          jobId,
          attempts: 5,
          backoff: { type: "exponential", delay: 5_000 },
          removeOnComplete: 1_000,
          removeOnFail: 5_000,
        });
      } catch (error) {
        await client.query(
          `delete from app.platform_schedule_runs
           where schedule_key = $1 and scheduled_for = $2::timestamptz
             and status = 'enqueued'`,
          [jobType, scheduledAt],
        );
        throw error;
      }
      this.logger.log(`Enqueued ${jobId}`);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
    await this.connection.quit();
    await this.database.close();
  }
}

function dateTruncatedToHour(value: Date): string {
  const copy = new Date(value);
  copy.setUTCMinutes(0, 0, 0);
  return copy.toISOString();
}
