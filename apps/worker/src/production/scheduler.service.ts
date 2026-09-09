import { Injectable, Logger, type OnModuleDestroy } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { PlatformDatabase } from "@papadata/database";
import { readWorkerConfig } from "./config.js";
import type { PlatformJobPayload } from "./platform-worker.service.js";

type ReprocessJobClaim = {
  readonly affected_metric_codes: readonly string[];
  readonly created_at: string;
  readonly reprocess_job_id: string;
  readonly tenant_id: string;
  readonly workspace_id: string;
};

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

  /**
   * Periodic, traffic-independent half of the Metric Engine reprocessing
   * loop (P0-01 katalog-58-metryk, "Zmiana formuły tworzy nową wersję i
   * kontrolowany reprocessing"). Today the only writer of
   * app.metric_snapshots is request-time and fire-and-forget (see
   * commandCenterContractData's doc comment in
   * apps/api/.../contract-runtime.service.ts) -- a tenant/workspace that
   * gets no traffic after a formula version bump keeps serving snapshots
   * pinned to the old definition_version forever. This finds those and
   * queues a reprocess job; it does not itself recompute anything (see
   * drainMetricReprocessJobs for why apps/worker can't do that).
   *
   * "Current version" for a metric_code is deliberately read from
   * app.metric_definitions (the most-recently-created row per code)
   * instead of any in-process TS constant: apps/worker has no dependency
   * on apps/api's metricEngineCore and must not grow a second copy of its
   * formulas/versions (P0-01 rule 3 -- only the backend Metric Engine may
   * own formulas). Every real snapshot write already reseeds
   * app.metric_definitions with the engine's current metricDefinitions
   * (MetricSnapshotRepository.ensureDefinitionsSeeded in
   * packages/database/src/production.ts), so that table is the one real,
   * DB-only signal for "what version is current" today. Nothing marks a
   * superseded row's lifecycle_status as such (a real, separate gap --
   * see the task summary), so "most recently created" is the honest
   * current-version proxy rather than filtering on lifecycle_status.
   *
   * Runs through the platform-wide (bypassrls) papadata_platform role,
   * the same one ReconciliationScheduler already uses for
   * app.integration_connections -- granted SELECT on
   * app.metric_snapshots/app.metric_definitions and SELECT/INSERT/UPDATE
   * on app.reprocess_jobs by migration 0066, following the precedent
   * migration 0047 set for app.sync_checkpoints.
   */
  @Cron(process.env.METRIC_REPROCESS_DETECT_CRON ?? "0 * * * *")
  async scheduleMetricReprocessDetection(): Promise<void> {
    await this.database.withTransaction(async (client) => {
      const lock = await client.query<{ acquired: boolean }>(
        "select pg_try_advisory_xact_lock(hashtext($1)) as acquired",
        ["metric-reprocess:detect"],
      );
      if (lock.rows[0]?.acquired !== true) return;

      const inserted = await client.query<{ reprocess_job_id: string }>(
        `with current_definitions as (
           select distinct on (metric_code) metric_code, definition_version
           from app.metric_definitions
           order by metric_code, created_at desc
         ),
         stale as (
           select s.tenant_id, s.workspace_id,
                  array_agg(distinct s.metric_code order by s.metric_code) as affected_metric_codes
           from app.metric_snapshots s
           join current_definitions d on d.metric_code = s.metric_code
           where s.definition_version <> d.definition_version
           group by s.tenant_id, s.workspace_id
         )
         insert into app.reprocess_jobs (
           reprocess_job_id, tenant_id, workspace_id, status, reason, affected_metric_codes
         )
         select gen_random_uuid(), stale.tenant_id, stale.workspace_id, 'queued', 'definition_changed',
                stale.affected_metric_codes
         from stale
         where not exists (
           select 1 from app.reprocess_jobs existing
           where existing.tenant_id = stale.tenant_id
             and existing.workspace_id = stale.workspace_id
             and existing.reason = 'definition_changed'
             and existing.status in ('queued', 'running')
         )
         returning reprocess_job_id`,
      );

      if (inserted.rows.length > 0) {
        this.logger.log(`Queued ${inserted.rows.length} metric reprocess job(s) for stale definition versions.`);
      }
    });
  }

  /**
   * Drains app.reprocess_jobs queued by scheduleMetricReprocessDetection.
   *
   * Deliberately simplified: apps/worker cannot itself invoke the Metric
   * Engine. computeMetricEngineSeries/buildMetricSnapshotRecords and the
   * real per-tenant MetricEngineInput construction
   * (createRealMetricEngineInput) live only in apps/api, request-scoped
   * (see contract-runtime.service.ts's commandCenterContractData) --
   * apps/worker has no dependency on that app's source and must not grow
   * a duplicate copy of its formulas (same P0-01 rule as above). Actually
   * recomputing from this worker would need either porting metricEngineCore
   * and its real-data-source plumbing into a shared package, or new
   * cross-service HTTP infrastructure (apps/worker has no API base URL
   * config today) -- both clearly more than "add one cron", so this drains
   * the queue honestly instead of faking a recompute: it claims queued
   * jobs and resolves one only once a *real* fresh snapshot (written by
   * the existing request-time writer, persistCommandCenterMetricSnapshots)
   * has actually landed for every affected metric code; otherwise it
   * releases the claim so a later run retries once real traffic produces
   * one. See the task summary for this deferred half.
   */
  @Cron(process.env.METRIC_REPROCESS_DRAIN_CRON ?? "*/15 * * * *")
  async drainMetricReprocessJobs(): Promise<void> {
    const claimed = await this.database.withTransaction(async (client) => {
      const lock = await client.query<{ acquired: boolean }>(
        "select pg_try_advisory_xact_lock(hashtext($1)) as acquired",
        ["metric-reprocess:drain"],
      );
      if (lock.rows[0]?.acquired !== true) return [];

      const claim = await client.query<ReprocessJobClaim>(
        `update app.reprocess_jobs
         set status = 'running', started_at = now()
         where reprocess_job_id in (
           select reprocess_job_id from app.reprocess_jobs
           where status = 'queued'
           order by created_at
           limit 25
           for update skip locked
         )
         returning reprocess_job_id, tenant_id, workspace_id, affected_metric_codes, created_at`,
      );
      return claim.rows;
    });

    for (const job of claimed) {
      await this.resolveMetricReprocessJob(job);
    }
  }

  private async resolveMetricReprocessJob(job: ReprocessJobClaim): Promise<void> {
    const fresh = await this.database.query<{ metric_code: string }>(
      `select distinct metric_code
       from app.metric_snapshots
       where tenant_id = $1 and workspace_id = $2
         and metric_code = any($3::text[])
         and generated_at > $4::timestamptz`,
      [job.tenant_id, job.workspace_id, job.affected_metric_codes, job.created_at],
    );
    const freshCodes = new Set(fresh.map((row) => row.metric_code));
    const allFresh = job.affected_metric_codes.every((code) => freshCodes.has(code));

    if (allFresh) {
      await this.database.query(
        "update app.reprocess_jobs set status = 'succeeded', completed_at = now() where reprocess_job_id = $1",
        [job.reprocess_job_id],
      );
      this.logger.log(`Metric reprocess job ${job.reprocess_job_id} resolved: fresh snapshots confirmed.`);
      return;
    }

    // Not resolved yet -- release the claim rather than leaving it stuck in
    // 'running' or falsely marking it 'failed'; a later drain retries it
    // once real traffic produces a fresh snapshot for every affected code.
    await this.database.query(
      "update app.reprocess_jobs set status = 'queued', started_at = null where reprocess_job_id = $1",
      [job.reprocess_job_id],
    );
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
