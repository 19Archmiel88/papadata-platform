import { createHash } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import { Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { PlatformDatabase, PrivacyRepository, ProductionDatabase } from "@papadata/database";
import { LocalDeterministicProvider } from "@papadata/ai-runtime";
import { ObjectStorageClient } from "@papadata/storage";
import { readWorkerConfig } from "./config.js";

export type PlatformJobPayload = {
  readonly jobType: "report" | "privacy_request" | "reconciliation" | "retention" | "ai_evaluation";
  readonly tenantId: string;
  readonly workspaceId: string | null;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly idempotencyKey: string;
};

@Injectable()
export class PlatformWorkerService implements OnModuleDestroy {
  private readonly logger = new Logger(PlatformWorkerService.name);
  private readonly config = readWorkerConfig();
  private readonly connection = new IORedis(this.config.redisUrl, {
    connectTimeout: 5_000,
    maxRetriesPerRequest: null,
    ...(this.config.redisCaBase64
      ? { tls: { ca: Buffer.from(this.config.redisCaBase64, "base64").toString("utf8") } }
      : {}),
  });
  private readonly database = new ProductionDatabase({
    connectionString: this.config.databaseUrl,
    max: 8,
    statementTimeoutMs: 30_000,
  });
  private readonly systemDatabase = new PlatformDatabase({
    connectionString: this.config.schedulerDatabaseUrl,
    max: 2,
    statementTimeoutMs: 60_000,
  });
  private readonly storage = new ObjectStorageClient({
    driver: this.config.storageDriver,
    bucket: this.config.storageBucket,
    endpoint: this.config.storageEndpoint,
    accessKey: this.config.storageAccessKey,
    secretKey: this.config.storageSecretKey,
    projectId: this.config.gcpProjectId,
  });
  private readonly worker = new Worker<PlatformJobPayload>(
    "papadata-platform-jobs",
    (job) => this.process(job),
    {
      connection: this.connection,
      concurrency: this.config.platformWorkerConcurrency,
      lockDuration: this.config.leaseDurationMs,
      stalledInterval: Math.max(5_000, Math.floor(this.config.leaseDurationMs / 2)),
    },
  );

  private async process(job: Job<PlatformJobPayload>): Promise<object> {
    this.logger.log(`Processing platform job ${job.data.jobType}`);
    switch (job.data.jobType) {
      case "report":
        return this.processReport(job.data);
      case "privacy_request":
        return this.processPrivacy(job.data);
      case "reconciliation":
        return this.processReconciliation(job.data);
      case "retention":
        return this.processRetention(job.data);
      case "ai_evaluation":
        return this.processAiEvaluation(job.data);
    }
  }

  private async processReport(data: PlatformJobPayload): Promise<object> {
    if (!data.workspaceId) throw new Error("Report job requires workspace scope");
    const reportId = requiredPayloadString(data.payload, "reportId");

    return this.database.withTenantWorkspace(
      data.tenantId,
      data.workspaceId,
      async (client) => {
        const report = (await client.query<Record<string, unknown>>(
          `select * from app.report_requests
           where id = $1 and tenant_id::text = $2 and workspace_id::text = $3
           limit 1 for update`,
          [reportId, data.tenantId, data.workspaceId],
        )).rows[0];
        if (!report) throw new Error("Report request not found");

        const format = String(report.format);
        if (format !== "json" && format !== "csv") {
          await client.query(
            `update app.report_requests
             set status = 'failed', error_code = 'FORMAT_NOT_ENABLED'
             where id = $1`,
            [reportId],
          );
          return {
            reportId,
            status: "failed",
            errorCode: "FORMAT_NOT_ENABLED",
            limitation: "Hardened beta enables JSON and CSV only.",
          };
        }

        await client.query(
          "update app.report_requests set status = 'generating', error_code = null where id = $1",
          [reportId],
        );
        const rows = (await client.query<Record<string, unknown>>(
          `select metric_code, definition_version, period_start, period_end,
                  currency, value, value_kind, readiness, reason_codes,
                  limitations, generated_at
           from app.metric_snapshots
           where tenant_id::text = $1
             and workspace_id::text = $2
             and period_start >= $3::timestamptz
             and period_end <= $4::timestamptz
           order by period_start, metric_code`,
          [data.tenantId, data.workspaceId, report.date_from, report.date_to],
        )).rows;

        if (rows.length === 0) {
          await client.query(
            `update app.report_requests
             set status = 'failed', error_code = 'NO_REPORT_DATA'
             where id = $1`,
            [reportId],
          );
          return { reportId, status: "failed", errorCode: "NO_REPORT_DATA" };
        }

        const artifact = renderReport(format, {
          reportId,
          generatedAt: new Date().toISOString(),
          reportType: report.report_type,
          dateFrom: report.date_from,
          dateTo: report.date_to,
          filters: report.filters,
          rows,
        });
        const objectKey = `reports/${data.tenantId}/${data.workspaceId}/${reportId}.${format}`;
        const stored = await this.storage.put(objectKey, artifact.body, artifact.contentType);

        await client.query(
          `update app.report_requests
           set status = 'ready', object_key = $2, checksum_sha256 = $3,
               size_bytes = $4, content_type = $5, ready_at = now(),
               expires_at = now() + interval '7 days', error_code = null
           where id = $1`,
          [
            reportId,
            stored.key,
            stored.checksumSha256,
            stored.sizeBytes,
            artifact.contentType,
          ],
        );
        return {
          reportId,
          status: "ready",
          objectKey,
          rowCount: rows.length,
          checksumSha256: stored.checksumSha256,
        };
      },
    );
  }

  private async processPrivacy(data: PlatformJobPayload): Promise<object> {
    const requestId = requiredPayloadString(data.payload, "requestId");
    const repository = new PrivacyRepository(this.database);
    const evidenceKey = `privacy/${data.tenantId}/${requestId}/orchestration.json`;
    const evidence = {
      requestId,
      tenantId: data.tenantId,
      workspaceId: data.workspaceId,
      requestType: data.payload.requestType,
      subjectReferenceHash: sha256(String(data.payload.subjectReference ?? "")),
      evaluatedAt: new Date().toISOString(),
      completedHandlers: ["database_inventory", "object_storage_evidence"],
      externalHandlersRequired: ["provider", "ai", "backup"],
    };
    const stored = await this.storage.put(
      evidenceKey,
      Buffer.from(JSON.stringify(evidence, null, 2), "utf8"),
      "application/json",
    );

    await repository.updateTarget({
      tenantId: data.tenantId,
      workspaceId: data.workspaceId,
      requestId,
      system: "object_storage",
      status: "completed",
      evidenceReference: `${stored.bucket}/${stored.key}#${stored.checksumSha256}`,
      errorCode: null,
    });
    for (const system of ["cache", "search_index", "queue"] as const) {
      await repository.updateTarget({
        tenantId: data.tenantId,
        workspaceId: data.workspaceId,
        requestId,
        system,
        status: "not_applicable",
        evidenceReference: `${stored.bucket}/${stored.key}#${stored.checksumSha256}`,
        errorCode: null,
      });
    }
    for (const system of ["database", "provider", "ai", "backup"] as const) {
      await repository.updateTarget({
        tenantId: data.tenantId,
        workspaceId: data.workspaceId,
        requestId,
        system,
        status: "verification_pending",
        evidenceReference: `${stored.bucket}/${stored.key}#${stored.checksumSha256}`,
        errorCode: system === "database"
          ? "DATA_HANDLER_NOT_ENABLED"
          : "EXTERNAL_EVIDENCE_REQUIRED",
      });
    }

    await this.database.withTenantWorkspace(
      data.tenantId,
      data.workspaceId,
      async (client) => {
        await client.query(
          `update app.privacy_requests
           set status = 'partial'
           where id = $1 and tenant_id::text = $2`,
          [requestId, data.tenantId],
        );
      },
    );
    return {
      requestId,
      status: "partial",
      verified: false,
      evidenceReference: `${stored.bucket}/${stored.key}#${stored.checksumSha256}`,
      externalEvidenceRequired: ["database", "provider", "ai", "backup"],
    };
  }

  private async processReconciliation(data: PlatformJobPayload): Promise<object> {
    const rows = await this.systemDatabase.query<Record<string, unknown>>(
      `select provider_id, count(*)::int as connection_count,
              count(*) filter (where status = 'active')::int as active_count
       from app.integration_connections
       where deleted_at is null
       group by provider_id
       order by provider_id`,
    );
    await this.completeSchedule("reconciliation", data, null);
    return {
      status: "completed",
      providers: rows,
      evaluatedAt: new Date().toISOString(),
    };
  }

  private async processRetention(data: PlatformJobPayload): Promise<object> {
    const expired = await this.systemDatabase.query<{
      id: string;
      object_key: string | null;
      tenant_id: string;
      workspace_id: string;
    }>(
      `select id::text, object_key, tenant_id::text, workspace_id::text
       from app.report_requests
       where status = 'ready' and expires_at <= now()
       order by expires_at
       limit 1000`,
    );
    let deleted = 0;
    let failed = 0;
    for (const report of expired) {
      if (!report.object_key) continue;
      const correlationId = `retention:${String(data.idempotencyKey)}:${report.id}`;
      try {
        const result = await this.storage.deleteAllVersions(report.object_key);
        await this.systemDatabase.withTransaction(async (client) => {
          await client.query(
            `update app.report_requests
             set status = 'expired', object_key = null
             where id = $1 and status = 'ready'`,
            [report.id],
          );
          await client.query(
            `insert into app.artifact_deletion_ledger (
               tenant_id, workspace_id, object_key, object_class, reason,
               versions_deleted, correlation_id, evidence
             ) values ($1, $2, $3, 'report_export', 'retention_expiry', $4, $5, $6::jsonb)
             on conflict (tenant_id, object_key, reason) do nothing`,
            [
              report.tenant_id,
              report.workspace_id,
              report.object_key,
              result.versionsDeleted,
              correlationId,
              JSON.stringify({ reportId: report.id, bucket: result.bucket }),
            ],
          );
        });
        deleted += 1;
      } catch (error) {
        failed += 1;
        this.logger.error(`Retention failed for report ${report.id}`, error);
      }
    }
    await this.completeSchedule("retention", data, failed > 0 ? "RETENTION_PARTIAL_FAILURE" : null);
    return {
      status: failed > 0 ? "partial" : "completed",
      deletedReportArtifacts: deleted,
      failedReportArtifacts: failed,
    };
  }

  private async processAiEvaluation(data: PlatformJobPayload): Promise<object> {
    const provider = new LocalDeterministicProvider({ seed: data.idempotencyKey });
    const response = await provider.complete({
      modelId: "local-deterministic-v1",
      messages: [{ role: "user", content: String(data.payload.prompt ?? "health") }],
      maxOutputTokens: 256,
      temperature: 0,
    });
    return {
      status: "completed",
      providerId: provider.providerId,
      outputHash: sha256(response.output),
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
    };
  }

  private async completeSchedule(
    scheduleKey: string,
    data: PlatformJobPayload,
    errorCode: string | null,
  ): Promise<void> {
    const scheduledFor = typeof data.payload.scheduledFor === "string"
      ? data.payload.scheduledFor
      : new Date().toISOString();
    await this.systemDatabase.query(
      `update app.platform_schedule_runs
       set status = $3, completed_at = now(), error_code = $4
       where schedule_key = $1
         and scheduled_for = date_trunc('hour', $2::timestamptz)`,
      [scheduleKey, scheduledFor, errorCode ? "failed" : "completed", errorCode],
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker.close();
    await this.connection.quit();
    await this.database.close();
    await this.systemDatabase.close();
  }
}

function requiredPayloadString(payload: Readonly<Record<string, unknown>>, key: string): string {
  const value = payload[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Platform job payload is missing ${key}`);
  }
  return value;
}

function renderReport(
  format: string,
  document: Record<string, unknown> & { rows: readonly Record<string, unknown>[] },
): { readonly body: Buffer; readonly contentType: string } {
  if (format === "json") {
    return {
      body: Buffer.from(JSON.stringify(document, null, 2), "utf8"),
      contentType: "application/json",
    };
  }

  const columns = [
    "metric_code",
    "definition_version",
    "period_start",
    "period_end",
    "currency",
    "value",
    "value_kind",
    "readiness",
    "generated_at",
  ];
  const lines = [columns.join(",")];
  for (const row of document.rows) {
    lines.push(columns.map((column) => csvCell(row[column])).join(","));
  }
  return {
    body: Buffer.from(`\uFEFF${lines.join("\n")}\n`, "utf8"),
    contentType: "text/csv; charset=utf-8",
  };
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined
    ? ""
    : typeof value === "string"
      ? value
      : JSON.stringify(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
