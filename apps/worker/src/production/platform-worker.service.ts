import { projectStripeBilling } from './stripe-billing-projection.js';
import { createHash } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import { Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { AssistantConversationRepository, BillingRepository, PlatformDatabase, PrivacyRepository, ProductionDatabase } from "@papadata/database";
import { AiBudgetGuard, createPapaProviderRuntime, LocalDeterministicProvider, redactText } from "@papadata/ai-runtime";
import type { MembershipAuthorizationInput } from "@papadata/contracts";
import { generatePapaAnswer } from "@papadata/papa-runtime";
import { ObjectStorageClient } from "@papadata/storage";
import { readWorkerConfig } from "./config.js";
import { assistantGenerationLeaseDurationMs, canRunAssistantGeneration, decideAssistantGenerationFailure } from "./assistant-generation.policy.js";
import { privacyTargetDisposition, reportFormatEnabled } from "./platform-worker.policy.js";

export type PlatformJobPayload = {
  readonly jobType: "report" | "privacy_request" | "reconciliation" | "retention" | "ai_evaluation" | "stripe_webhook" | "assistant_generation";
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
      case "stripe_webhook":
        return this.processStripeWebhook(job.data);
      case "assistant_generation":
        return this.processAssistantGeneration(job);
    }
  }

  private async processAssistantGeneration(job: Job<PlatformJobPayload>): Promise<object> {
    const data = job.data;
    if (!data.workspaceId) throw new Error("Assistant generation requires workspace scope");
    const runId = requiredPayloadString(data.payload, "runId");
    const leaseMs = assistantGenerationLeaseDurationMs(this.config.leaseDurationMs);
    const leaseSeconds = Math.ceil(leaseMs / 1000);
    const maxAttempts = Math.max(1, Number(job.opts.attempts ?? 1));

    const claim = await this.database.withTenantWorkspace(
      data.tenantId,
      data.workspaceId,
      async (client) => {
        const result = await client.query<{
          id: string;
          user_id: string;
          conversation_id: string;
          case_thread_id: string | null;
          request_payload: Record<string, unknown>;
          status: string;
        }>(
          `update app.assistant_generation_runs
              set status='running', attempt_count=attempt_count+1,
                  last_heartbeat_at=now(), lease_expires_at=now()+($4::int * interval '1 second'),
                  error_code=null, updated_at=now()
            where tenant_id=$1 and workspace_id=$2 and id=$3
              and (
                status in ('queued','interrupted')
                or (status='running' and (lease_expires_at is null or lease_expires_at < now()))
              )
            returning id,user_id,conversation_id,case_thread_id,request_payload,status`,
          [data.tenantId, data.workspaceId, runId, leaseSeconds],
        );
        return result.rows[0] ?? null;
      },
    );

    if (!claim) {
      const current = await this.database.withTenantWorkspace(
        data.tenantId,
        data.workspaceId,
        async (client) => (await client.query<{ status: string }>(
          `select status from app.assistant_generation_runs
            where tenant_id=$1 and workspace_id=$2 and id=$3`,
          [data.tenantId, data.workspaceId, runId],
        )).rows[0] ?? null,
      );
      if (!current) throw new Error("Assistant generation run not found");
      return { runId, status: current.status, claimed: false };
    }

    const request = claim.request_payload ?? {};
    const prompt = requiredPayloadString(request, "prompt");
    const policyVersion = Number(request.policyVersion);
    const historyEnabled = request.historyEnabled !== false;
    const contextDays = Number(request.contextDays ?? 30);
    const supplementaryContext = Array.isArray(request.supplementaryContext)
      ? request.supplementaryContext.filter((value): value is string => typeof value === "string")
      : [];

    const controller = new AbortController();
    let partialText = "";
    let heartbeatBusy = false;
    const heartbeat = setInterval(() => {
      if (heartbeatBusy || controller.signal.aborted) return;
      heartbeatBusy = true;
      void this.database.withTenantWorkspace(data.tenantId, data.workspaceId as string, async (client) => {
        const state = (await client.query<{
          status: string;
          policy_version: number | null;
        }>(
          `select r.status, p.version as policy_version
             from app.assistant_generation_runs r
             left join app.assistant_preferences p
               on p.tenant_id=r.tenant_id and p.workspace_id=r.workspace_id
            where r.tenant_id=$1 and r.workspace_id=$2 and r.id=$3`,
          [data.tenantId, data.workspaceId, runId],
        )).rows[0];
        if (!state || state.status === "cancelled" || state.policy_version !== policyVersion) {
          controller.abort("assistant_generation_authority_changed");
          return;
        }
        await client.query(
          `update app.assistant_generation_runs
              set last_heartbeat_at=now(), lease_expires_at=now()+($4::int * interval '1 second'), updated_at=now()
            where tenant_id=$1 and workspace_id=$2 and id=$3 and status='running'`,
          [data.tenantId, data.workspaceId, runId, leaseSeconds],
        );
      }).catch(() => controller.abort("assistant_generation_heartbeat_failed")).finally(() => {
        heartbeatBusy = false;
      });
    }, Math.max(5_000, Math.floor(leaseMs / 3)));

    try {
      const memberships = await this.database.withTenantWorkspace(
        data.tenantId,
        data.workspaceId,
        async (client) => (await client.query<MembershipAuthorizationInput>(
          `select role,status,data_scope as "dataScope",jit_expires_at::text as "jitExpiresAt"
             from app.memberships
            where tenant_id=$1 and user_id=$2
              and (workspace_id=$3 or (role='Tenant Owner' and data_scope='tenant'))`,
          [data.tenantId, claim.user_id, data.workspaceId],
        )).rows,
      );
      if (!canRunAssistantGeneration(memberships)) {
        controller.abort("assistant_generation_capability_revoked");
        throw new Error("ASSISTANT_CAPABILITY_REVOKED");
      }

      const provider = createPapaProviderRuntime();
      const repository = new AssistantConversationRepository(this.database);
      const billing = new BillingRepository(this.database);
      const result = await generatePapaAnswer({
        repository,
        billing,
        budgetGuard: new AiBudgetGuard(),
        provider: provider.provider,
        modelId: provider.modelId,
        maxOutputTokens: provider.nativeStreaming ? 1536 : 512,
        tenantId: data.tenantId,
        workspaceId: data.workspaceId,
        userId: claim.user_id,
        conversationId: claim.conversation_id,
        caseThreadId: claim.case_thread_id,
        parentConversationId: null,
        prompt,
        idempotencyKey: `run:${runId}`,
        signal: controller.signal,
        historyEnabled,
        contextDays: Number.isFinite(contextDays) ? contextDays : 30,
        supplementaryContext,
        ...(provider.nativeStreaming
          ? {
              onDelta: async (chunk: string) => {
                controller.signal.throwIfAborted();
                partialText += chunk;
                await this.database.withTenantWorkspace(data.tenantId, data.workspaceId as string, (client) => client.query(
                  `update app.assistant_generation_runs
                      set partial_text=$4,last_heartbeat_at=now(),lease_expires_at=now()+($5::int * interval '1 second'),updated_at=now()
                    where tenant_id=$1 and workspace_id=$2 and id=$3 and status='running'`,
                  [data.tenantId, data.workspaceId, runId, redactText(partialText), leaseSeconds],
                ));
              },
            }
          : {}),
      });
      if (!result) throw new Error("THREAD_UNAVAILABLE");
      controller.signal.throwIfAborted();
      await this.database.withTenantWorkspace(data.tenantId, data.workspaceId, (client) => client.query(
        `update app.assistant_generation_runs
            set status='completed',result=$4::jsonb,partial_text='',error_code=null,
                last_heartbeat_at=now(),lease_expires_at=null,updated_at=now()
          where tenant_id=$1 and workspace_id=$2 and id=$3 and status='running'`,
        [data.tenantId, data.workspaceId, runId, JSON.stringify(result)],
      ));
      return { runId, status: "completed", claimed: true };
    } catch (error) {
      const cancelled = controller.signal.aborted || await this.database.withTenantWorkspace(
        data.tenantId,
        data.workspaceId,
        async (client) => (await client.query<{ status: string }>(
          `select status from app.assistant_generation_runs where tenant_id=$1 and workspace_id=$2 and id=$3`,
          [data.tenantId, data.workspaceId, runId],
        )).rows[0]?.status === "cancelled",
      );
      const decision = decideAssistantGenerationFailure({ cancelled, attemptsMade: job.attemptsMade, maxAttempts });
      const status = decision === "retry" ? "interrupted" : decision === "cancel" ? "cancelled" : "failed";
      const code = decision === "retry" ? "WORKER_RETRY" : decision === "cancel" ? "GENERATION_STOPPED" : "GENERATION_FAILED";
      await this.database.withTenantWorkspace(data.tenantId, data.workspaceId, (client) => client.query(
        `update app.assistant_generation_runs
            set status=$4,error_code=$5,partial_text=$6,lease_expires_at=null,last_heartbeat_at=now(),updated_at=now()
          where tenant_id=$1 and workspace_id=$2 and id=$3 and status in ('running','interrupted','cancelled')`,
        [data.tenantId, data.workspaceId, runId, status, code, redactText(partialText)],
      ));
      if (decision === "retry") throw error;
      return { runId, status, errorCode: code };
    } finally {
      clearInterval(heartbeat);
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
          `select assistant_report_export_id::text as id, *
           from app.assistant_report_exports
           where assistant_report_export_id = $1::uuid
             and tenant_id::text = $2
             and workspace_id::text = $3
           limit 1 for update`,
          [reportId, data.tenantId, data.workspaceId],
        )).rows[0];
        if (!report) throw new Error("Report request not found");

        const format = String(report.format);
        if (!reportFormatEnabled(format)) {
          await client.query(
            `update app.assistant_report_exports
             set status = 'failed', error_code = 'FORMAT_NOT_ENABLED'
             where assistant_report_export_id = $1::uuid`,
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
          "update app.assistant_report_exports set status = 'generating', error_code = null where assistant_report_export_id = $1::uuid",
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
            `update app.assistant_report_exports
             set status = 'failed', error_code = 'NO_REPORT_DATA'
             where assistant_report_export_id = $1::uuid`,
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
          `update app.assistant_report_exports
           set status = 'ready', object_key = $2, checksum_sha256 = $3,
               size_bytes = $4, content_type = $5, ready_at = now(),
               expires_at = now() + interval '7 days', error_code = null
           where assistant_report_export_id = $1::uuid`,
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
        status: privacyTargetDisposition(system),
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
        status: privacyTargetDisposition(system),
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
      `select assistant_report_export_id::text as id, object_key, tenant_id::text, workspace_id::text
       from app.assistant_report_exports
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
            `update app.assistant_report_exports
             set status = 'expired', object_key = null
             where assistant_report_export_id = $1::uuid and status = 'ready'`,
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

  /**
   * Runs on systemDatabase (bypass-RLS PlatformDatabase), not the tenant-
   * scoped ProductionDatabase -- see StripeWebhookService's doc comment for
   * why: only checkout.session.completed carries the workspace's own
   * identity (via Checkout Session's client_reference_id, expected to be
   * "<tenantId>:<workspaceId>"); every later subscription event is only
   * addressable by Stripe's own ids, which this table indexes uniquely.
   *
   * Untestable end-to-end without a real Stripe account (this whole
   * platform has none configured yet -- see the scaling architecture
   * audit), but every write here is a plain, real SQL statement exercised
   * the same way any other repository method in this codebase would be.
   */
  private async processStripeWebhook(data: PlatformJobPayload): Promise<object> {
    return projectStripeBilling(this.systemDatabase,data.payload);
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
