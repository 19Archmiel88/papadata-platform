import { createHash } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { IntegrationRepository, PlatformDatabase, ProductionDatabase } from "@papadata/database";
import { readWorkerConfig } from "./config.js";
import type { IntegrationJobPayload } from "./worker.service.js";

/**
 * Streams requested per provider on an automatic dispatch. Mirrors the
 * `provider_id`/`stream` CHECK constraints in
 * packages/database/migrations/000004_integration_canonical_data.sql --
 * only the 4 providers active in production today (google_ads/meta_ads/
 * woocommerce/allegro carry ad_spend+attributed_conversions or
 * products+orders+refunds+inventory respectively). A provider missing from
 * this map is silently skipped by dispatchDueSyncs rather than guessed.
 */
const AUTO_SYNC_PROVIDER_STREAMS: Readonly<Record<string, readonly string[]>> = {
  allegro: ["products", "orders", "refunds", "inventory"],
  google_ads: ["ad_spend", "attributed_conversions"],
  meta_ads: ["ad_spend", "attributed_conversions"],
  woocommerce: ["products", "orders", "refunds", "inventory"],
};

const SYNC_INTERVAL_HOURS = readPositiveNumber(process.env.SYNC_INTERVAL_HOURS, 6);
const SYNC_JITTER_WINDOW_MS = readPositiveNumber(process.env.SYNC_JITTER_WINDOW_MS, 30 * 60 * 1000);

type DueConnectionRow = {
  readonly connection_id: string;
  readonly tenant_id: string;
  readonly workspace_id: string;
  readonly provider_id: string;
};

/**
 * The periodic sync trigger that never existed before this file: until now,
 * provider data was only ever fetched via an inbound webhook or a manual/API
 * "sync now" call (see the platform architecture audit) -- nothing polled
 * providers on a cadence. This dispatches a real `incremental_sync` job for
 * every active connection whose newest sync_checkpoint is missing or older
 * than SYNC_INTERVAL_HOURS.
 *
 * Deliberately staggered rather than firing every due connection at once:
 * each dispatch gets a deterministic delay (hash of its connectionId modulo
 * SYNC_JITTER_WINDOW_MS) so a large tenant base does not all hit Google/Meta/
 * WooCommerce APIs in the same second. The delay is deterministic (not
 * random) so a connection's offset within the window stays stable across
 * cycles, which keeps load spread predictable rather than merely diffuse.
 *
 * Dedup across scheduler replicas and across repeated ticks for the same
 * still-due connection relies on two idempotency layers already built into
 * the sync pipeline: `createJob`'s (tenant, workspace, idempotencyKey)
 * upsert, keyed here by a fixed per-interval time bucket, and BullMQ's own
 * jobId uniqueness (reusing the same sync_job_id as the BullMQ jobId, same
 * as the manual "sync now" path in IntegrationService.startSync) -- so a
 * connection that is still due on the next 15-minute tick, before its
 * previous dispatch has even run, safely no-ops instead of double-enqueuing.
 */
@Injectable()
export class SyncDispatchScheduler implements OnModuleDestroy {
  private readonly logger = new Logger(SyncDispatchScheduler.name);
  private readonly config = readWorkerConfig();
  private readonly connection = new IORedis(this.config.redisUrl, {
    connectTimeout: 5_000,
    maxRetriesPerRequest: null,
    ...(this.config.redisCaBase64
      ? { tls: { ca: Buffer.from(this.config.redisCaBase64, "base64").toString("utf8") } }
      : {}),
  });
  private readonly queue = new Queue<IntegrationJobPayload>("papadata-integrations", {
    connection: this.connection,
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: "exponential", delay: 5_000 },
      removeOnComplete: 1_000,
      removeOnFail: 5_000,
    },
  });
  // Platform-wide (bypasses per-tenant RLS scoping) -- this scheduler does
  // not know which tenants exist in advance, same reasoning as
  // ReconciliationScheduler/PlatformWorkerService's systemDatabase.
  private readonly systemDatabase = new PlatformDatabase({
    connectionString: this.config.schedulerDatabaseUrl,
    max: 2,
    statementTimeoutMs: 30_000,
  });
  // Tenant-scoped -- createJob below always runs inside the real
  // tenant/workspace of the connection it is dispatching for.
  private readonly database = new ProductionDatabase({
    connectionString: this.config.databaseUrl,
    max: 4,
    statementTimeoutMs: 30_000,
  });
  private readonly repository = new IntegrationRepository(this.database);

  @Cron(process.env.SYNC_DISPATCH_CRON ?? "*/15 * * * *")
  async dispatchDueSyncs(): Promise<void> {
    const due = await this.findDueConnections();
    if (due.length === 0) {
      return;
    }

    const bucket = Math.floor(Date.now() / (SYNC_INTERVAL_HOURS * 60 * 60 * 1000));
    let dispatched = 0;

    for (const dueConnection of due) {
      const streams = AUTO_SYNC_PROVIDER_STREAMS[dueConnection.provider_id];
      if (!streams) {
        continue;
      }

      try {
        await this.dispatchOne(dueConnection, streams, bucket);
        dispatched += 1;
      } catch (error) {
        this.logger.error(
          `Failed to dispatch sync for connection ${dueConnection.connection_id}: ${String(error)}`,
        );
      }
    }

    if (dispatched > 0) {
      this.logger.log(`Dispatched ${dispatched}/${due.length} due syncs (bucket ${bucket})`);
    }
  }

  private async dispatchOne(
    dueConnection: DueConnectionRow,
    streams: readonly string[],
    bucket: number,
  ): Promise<void> {
    const job = await this.repository.createJob({
      tenantId: dueConnection.tenant_id,
      workspaceId: dueConnection.workspace_id,
      connectionId: dueConnection.connection_id,
      providerId: dueConnection.provider_id,
      operation: "incremental_sync",
      streams,
      from: null,
      to: null,
      idempotencyKey: `sync-dispatch:${dueConnection.connection_id}:${bucket}`,
    });
    const jobId = String(job.id);

    await this.queue.add(
      "incremental_sync",
      {
        tenantId: dueConnection.tenant_id,
        workspaceId: dueConnection.workspace_id,
        jobId,
        connectionId: dueConnection.connection_id,
        providerId: dueConnection.provider_id as IntegrationJobPayload["providerId"],
        operation: "incremental_sync",
        streams,
        from: null,
        to: null,
      },
      {
        jobId,
        delay: jitterMsFor(dueConnection.connection_id),
      },
    );
  }

  private async findDueConnections(): Promise<readonly DueConnectionRow[]> {
    return this.systemDatabase.query<DueConnectionRow>(
      `select
         connection.connection_id,
         connection.tenant_id,
         connection.workspace_id,
         connection.provider_id
       from app.integration_connections as connection
       left join lateral (
         select max(checkpoint.updated_at) as last_synced_at
         from app.sync_checkpoints as checkpoint
         where checkpoint.connection_id = connection.connection_id
       ) as latest_checkpoint on true
       where connection.status = 'active'
         and connection.deleted_at is null
         and (
           latest_checkpoint.last_synced_at is null
           or latest_checkpoint.last_synced_at < now() - make_interval(hours => $1::int)
         )
       order by connection.connection_id`,
      [SYNC_INTERVAL_HOURS],
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
    await this.connection.quit();
    await this.database.close();
    await this.systemDatabase.close();
  }
}

function jitterMsFor(connectionId: string): number {
  const digest = createHash("sha256").update(connectionId).digest();
  return digest.readUInt32BE(0) % SYNC_JITTER_WINDOW_MS;
}

function readPositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
