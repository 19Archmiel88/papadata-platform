import type { IsoDateTime } from "@papadata/contracts";

import type { AccessPolicyDecision, AccessService, Capability } from "../access/accessCore.ts";
import {
  responseMeta,
  toIso,
} from "../auth/authCore.ts";
import type {
  AuthErrorCode,
  AuthRandomSource,
  AuthServiceResult,
  AuthenticatedPrincipal,
  RequestContext,
} from "../auth/authCore.ts";
import {
  createMetricEngineInput,
  type DashboardMetricService,
  type DashboardReadinessResponse,
} from "../metrics/metricEngineCore.ts";

export const REMAINING_BACKEND_POLICY_VERSION = "remaining-backend.2026-07.prompt8";

export const workerJobTypes = [
  "email_outbox",
  "sync",
  "backfill",
  "readiness",
  "metric_calculation",
  "reprocessing",
  "notifications",
  "reports",
  "exports",
  "ai_briefings",
  "cleanup",
  "retry",
  "dlq",
] as const;

export type WorkerJobType = (typeof workerJobTypes)[number];

export const workerJobStatuses = [
  "cancelled",
  "dlq",
  "failed",
  "queued",
  "retry_wait",
  "running",
  "succeeded",
] as const;

export type WorkerJobStatus = (typeof workerJobStatuses)[number];

export const reportFormats = ["csv", "json"] as const;

export type ReportFormat = (typeof reportFormats)[number];

export const assistantRefusalCodes = [
  "INSUFFICIENT_DATA",
  "DATA_NOT_READY",
  "DATA_INVALID",
  "DATA_BLOCKED",
  "STALE_FOR_CURRENT_DECISION",
  "PERMISSION_DENIED",
  "ENTITLEMENT_REQUIRED",
  "OUT_OF_SCOPE",
  "UNSUPPORTED_USE_CASE",
  "EVIDENCE_UNAVAILABLE",
  "CONFLICT_UNRESOLVED",
  "SAFETY_POLICY_BLOCK",
  "PROVIDER_UNAVAILABLE",
  "COST_LIMIT_REACHED",
  "GATE_NOT_SATISFIED",
  "INJECTION_DETECTED",
] as const;

export type AssistantRefusalCode = (typeof assistantRefusalCodes)[number];

export const billingSandboxEventTypes = [
  "subscription_activated",
  "plan_changed",
  "subscription_cancelled",
  "subscription_resumed",
  "payment_pending",
  "payment_failed",
  "payment_recovered",
  "invoice_generated",
  "usage_updated",
  "limit_reached",
  "entitlement_changed",
] as const;

export type BillingSandboxEventType = (typeof billingSandboxEventTypes)[number];

export type JsonValue =
  | boolean
  | null
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export type JsonObject = {
  readonly [key: string]: JsonValue;
};

export type WorkerJobRecord = {
  readonly attempt: number;
  readonly checkpoint: string | null;
  readonly commandFingerprint: string;
  readonly completedAt: IsoDateTime | null;
  readonly createdAt: IsoDateTime;
  readonly errorCode: string | null;
  readonly idempotencyKey: string;
  readonly jobId: string;
  readonly nextRunAt: IsoDateTime | null;
  readonly payload: JsonObject;
  readonly progressPercent: number;
  readonly result: JsonObject | null;
  readonly retryBudget: number;
  readonly status: WorkerJobStatus;
  readonly tenantId: string;
  readonly type: WorkerJobType;
  readonly updatedAt: IsoDateTime;
  readonly workspaceId: string;
};

export type WorkerDlqRecord = {
  readonly createdAt: IsoDateTime;
  readonly dlqId: string;
  readonly errorCode: string;
  readonly jobId: string;
  readonly reason: string;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type WorkerJobInput = {
  readonly checkpoint?: string;
  readonly commandFingerprint?: string;
  readonly idempotencyKey?: string;
  readonly payload?: JsonObject;
  readonly retryBudget?: number;
  readonly tenantId: string;
  readonly type: WorkerJobType;
  readonly workspaceId: string;
};

export type ReportExportStatus = "completed" | "failed" | "processing" | "queued";

export type ReportExportRecord = {
  readonly bytes: number;
  readonly contentType: string;
  readonly createdAt: IsoDateTime;
  readonly expiresAt: IsoDateTime;
  readonly fileName: string;
  readonly filePath: string;
  readonly format: ReportFormat;
  readonly generatedAt: IsoDateTime | null;
  readonly reportId: string;
  readonly reportType: string;
  readonly sha256: string;
  readonly status: ReportExportStatus;
  readonly tenantId: string;
  readonly updatedAt: IsoDateTime;
  readonly workerJobIds: readonly string[];
  readonly workspaceId: string;
};

export type ReportFileWriteInput = {
  readonly content: string;
  readonly contentType: string;
  readonly fileName: string;
  readonly reportId: string;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type ReportFileWriteResult = {
  readonly bytes: number;
  readonly contentType: string;
  readonly fileName: string;
  readonly path: string;
  readonly sha256: string;
};

export type ReportFileReadResult = {
  readonly bytes: number;
  readonly content: string;
  readonly contentType: string;
};

export type ReportFileStore = {
  readonly readReportFile: (path: string, contentType: string) => Promise<ReportFileReadResult>;
  readonly writeReportFile: (input: ReportFileWriteInput) => Promise<ReportFileWriteResult>;
};

export type AssistantContextRecord = {
  readonly currency: string;
  readonly dataScope: string;
  readonly period: {
    readonly end: IsoDateTime;
    readonly start: IsoDateTime;
  };
  readonly readiness: string;
  readonly resourceId: string | null;
  readonly resourceType: string;
  readonly snapshotId: string | null;
  readonly surface: string;
  readonly tenantId: string;
  readonly timezone: string;
  readonly useCaseId: string;
  readonly workspaceId: string;
};

export type AssistantThreadRecord = {
  readonly context: AssistantContextRecord;
  readonly createdAt: IsoDateTime;
  readonly threadId: string;
  readonly title: string;
  readonly updatedAt: IsoDateTime;
};

export type AssistantEvidenceRecord = {
  readonly evidenceId: string;
  readonly metricCode: string;
  readonly scope: {
    readonly tenantId: string;
    readonly workspaceId: string;
  };
  readonly sourceRef: string;
  readonly sourceType: "dashboard_readiness" | "metric_snapshot";
};

export type AssistantRefusal = {
  readonly auditReference: string;
  readonly code: AssistantRefusalCode;
  readonly missingRequirements: readonly string[];
  readonly nextActions: readonly string[];
  readonly scope: {
    readonly tenantId: string;
    readonly workspaceId: string;
  };
  readonly safeMessage: string;
};

export type AssistantMessageRecord = {
  readonly auditReference: string;
  readonly confidence: number;
  readonly content: string;
  readonly createdAt: IsoDateTime;
  readonly evidence: readonly AssistantEvidenceRecord[];
  readonly limitations: readonly string[];
  readonly messageId: string;
  readonly recommendations: readonly string[];
  readonly refusal: AssistantRefusal | null;
  readonly role: "assistant" | "user";
  readonly threadId: string;
};

export type AssistantApprovalRecord = {
  readonly actionKind: string;
  readonly approvalId: string;
  readonly approvedAt: IsoDateTime | null;
  readonly createdAt: IsoDateTime;
  readonly humanActorUserId: string;
  readonly impactPreview: readonly string[];
  readonly reauthenticationRequired: boolean;
  readonly revalidatedAt: IsoDateTime | null;
  readonly scopePreview: readonly string[];
  readonly status: "approved" | "pending" | "rejected";
  readonly threadId: string;
};

export type AssistantAuditRecord = {
  readonly auditId: string;
  readonly eventType: string;
  readonly occurredAt: IsoDateTime;
  readonly result: "denied" | "success";
  readonly tenantId: string;
  readonly threadId: string | null;
  readonly userId: string | null;
  readonly workspaceId: string;
};

export type BillingSubscriptionRecord = {
  readonly cancelledAt: IsoDateTime | null;
  readonly entitlements: readonly string[];
  readonly planCode: string;
  readonly status: "active" | "cancelled" | "past_due" | "pending" | "trial";
  readonly subscriptionId: string;
  readonly tenantId: string;
  readonly updatedAt: IsoDateTime;
};

export type BillingEventRecord = {
  readonly billingEventId: string;
  readonly createdAt: IsoDateTime;
  readonly eventType: BillingSandboxEventType;
  readonly payload: JsonObject;
  readonly tenantId: string;
};

export type BillingInvoiceRecord = {
  readonly amountDue: string;
  readonly currency: string;
  readonly generatedAt: IsoDateTime;
  readonly invoiceId: string;
  readonly status: "open" | "paid";
  readonly tenantId: string;
};

export type BillingUsageRecord = {
  readonly createdAt: IsoDateTime;
  readonly meterCode: string;
  readonly quantity: string;
  readonly tenantId: string;
  readonly usageRecordId: string;
};

export type RemainingBackendSnapshot = {
  readonly assistantApprovals: readonly AssistantApprovalRecord[];
  readonly assistantAudit: readonly AssistantAuditRecord[];
  readonly assistantMessages: readonly AssistantMessageRecord[];
  readonly assistantThreads: readonly AssistantThreadRecord[];
  readonly billingEvents: readonly BillingEventRecord[];
  readonly billingInvoices: readonly BillingInvoiceRecord[];
  readonly billingSubscriptions: readonly BillingSubscriptionRecord[];
  readonly billingUsageRecords: readonly BillingUsageRecord[];
  readonly reports: readonly ReportExportRecord[];
  readonly workerDlq: readonly WorkerDlqRecord[];
  readonly workerJobs: readonly WorkerJobRecord[];
};

type RemainingBackendStateStore = {
  readonly findAssistantThread: (threadId: string) => MaybePromise<AssistantThreadRecord | undefined>;
  readonly findBillingSubscription: (tenantId: string) => MaybePromise<BillingSubscriptionRecord | undefined>;
  readonly findReport: (reportId: string) => MaybePromise<ReportExportRecord | undefined>;
  readonly findWorkerJob: (jobId: string) => MaybePromise<WorkerJobRecord | undefined>;
  readonly listAssistantMessages: (threadId: string) => MaybePromise<readonly AssistantMessageRecord[]>;
  readonly listWorkerJobs: (
    tenantId: string,
    workspaceId: string,
  ) => MaybePromise<readonly WorkerJobRecord[]>;
  readonly saveAssistantApproval: (record: AssistantApprovalRecord) => MaybePromise<void>;
  readonly saveAssistantAudit: (record: AssistantAuditRecord) => MaybePromise<void>;
  readonly saveAssistantMessage: (record: AssistantMessageRecord) => MaybePromise<void>;
  readonly saveAssistantThread: (record: AssistantThreadRecord) => MaybePromise<void>;
  readonly saveBillingEvent: (record: BillingEventRecord) => MaybePromise<void>;
  readonly saveBillingInvoice: (record: BillingInvoiceRecord) => MaybePromise<void>;
  readonly saveBillingSubscription: (record: BillingSubscriptionRecord) => MaybePromise<void>;
  readonly saveBillingUsage: (record: BillingUsageRecord) => MaybePromise<void>;
  readonly saveReport: (record: ReportExportRecord) => MaybePromise<void>;
  readonly saveWorkerDlq: (record: WorkerDlqRecord) => MaybePromise<void>;
  readonly saveWorkerJob: (record: WorkerJobRecord) => MaybePromise<void>;
  readonly snapshot: () => MaybePromise<RemainingBackendSnapshot>;
};

type MaybePromise<TValue> = TValue | Promise<TValue>;

type AuthorizedBackendScope =
  | {
      readonly decision: AccessPolicyDecision;
      readonly ok: true;
      readonly principal: AuthenticatedPrincipal;
      readonly tenantId: string;
      readonly workspaceId: string;
    }
  | {
      readonly ok: false;
      readonly result: AuthServiceResult<never>;
    };

export class InMemoryRemainingBackendState implements RemainingBackendStateStore {
  private readonly assistantApprovals = new Map<string, AssistantApprovalRecord>();

  private readonly assistantAudit = new Map<string, AssistantAuditRecord>();

  private readonly assistantMessages = new Map<string, AssistantMessageRecord>();

  private readonly assistantThreads = new Map<string, AssistantThreadRecord>();

  private readonly billingEvents = new Map<string, BillingEventRecord>();

  private readonly billingInvoices = new Map<string, BillingInvoiceRecord>();

  private readonly billingSubscriptions = new Map<string, BillingSubscriptionRecord>();

  private readonly billingUsageRecords = new Map<string, BillingUsageRecord>();

  private readonly reports = new Map<string, ReportExportRecord>();

  private readonly workerDlq = new Map<string, WorkerDlqRecord>();

  private readonly workerJobs = new Map<string, WorkerJobRecord>();

  findAssistantThread(threadId: string): AssistantThreadRecord | undefined {
    return this.assistantThreads.get(threadId);
  }

  saveAssistantThread(record: AssistantThreadRecord): void {
    this.assistantThreads.set(record.threadId, record);
  }

  saveAssistantMessage(record: AssistantMessageRecord): void {
    this.assistantMessages.set(record.messageId, record);
  }

  listAssistantMessages(threadId: string): readonly AssistantMessageRecord[] {
    return [...this.assistantMessages.values()]
      .filter((message) => message.threadId === threadId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  saveAssistantApproval(record: AssistantApprovalRecord): void {
    this.assistantApprovals.set(record.approvalId, record);
  }

  saveAssistantAudit(record: AssistantAuditRecord): void {
    this.assistantAudit.set(record.auditId, record);
  }

  findBillingSubscription(tenantId: string): BillingSubscriptionRecord | undefined {
    return this.billingSubscriptions.get(tenantId);
  }

  saveBillingSubscription(record: BillingSubscriptionRecord): void {
    this.billingSubscriptions.set(record.tenantId, record);
  }

  saveBillingEvent(record: BillingEventRecord): void {
    this.billingEvents.set(record.billingEventId, record);
  }

  saveBillingInvoice(record: BillingInvoiceRecord): void {
    this.billingInvoices.set(record.invoiceId, record);
  }

  saveBillingUsage(record: BillingUsageRecord): void {
    this.billingUsageRecords.set(record.usageRecordId, record);
  }

  findReport(reportId: string): ReportExportRecord | undefined {
    return this.reports.get(reportId);
  }

  saveReport(record: ReportExportRecord): void {
    this.reports.set(record.reportId, record);
  }

  findWorkerJob(jobId: string): WorkerJobRecord | undefined {
    return this.workerJobs.get(jobId);
  }

  listWorkerJobs(tenantId: string, workspaceId: string): readonly WorkerJobRecord[] {
    return [...this.workerJobs.values()]
      .filter((job) => job.tenantId === tenantId && job.workspaceId === workspaceId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  saveWorkerJob(record: WorkerJobRecord): void {
    this.workerJobs.set(record.jobId, record);
  }

  saveWorkerDlq(record: WorkerDlqRecord): void {
    this.workerDlq.set(record.dlqId, record);
  }

  snapshot(): RemainingBackendSnapshot {
    return {
      assistantApprovals: [...this.assistantApprovals.values()],
      assistantAudit: [...this.assistantAudit.values()],
      assistantMessages: [...this.assistantMessages.values()],
      assistantThreads: [...this.assistantThreads.values()],
      billingEvents: [...this.billingEvents.values()],
      billingInvoices: [...this.billingInvoices.values()],
      billingSubscriptions: [...this.billingSubscriptions.values()],
      billingUsageRecords: [...this.billingUsageRecords.values()],
      reports: [...this.reports.values()],
      workerDlq: [...this.workerDlq.values()],
      workerJobs: [...this.workerJobs.values()],
    };
  }
}

export class RemainingBackendService {
  private readonly accessService: AccessService;

  private readonly dashboardService: DashboardMetricService;

  private readonly fileStore: ReportFileStore;

  private readonly random: AuthRandomSource;

  private readonly state: RemainingBackendStateStore;

  constructor(options: {
    readonly accessService: AccessService;
    readonly dashboardService: DashboardMetricService;
    readonly fileStore: ReportFileStore;
    readonly random: AuthRandomSource;
    readonly state?: RemainingBackendStateStore;
  }) {
    this.accessService = options.accessService;
    this.dashboardService = options.dashboardService;
    this.fileStore = options.fileStore;
    this.random = options.random;
    this.state = options.state ?? new InMemoryRemainingBackendState();
  }

  async getSnapshot(): Promise<RemainingBackendSnapshot> {
    return this.state.snapshot();
  }

  async enqueueWorkerJob(input: WorkerJobInput, context: RequestContext): Promise<WorkerJobRecord> {
    const existing = (await this.state.listWorkerJobs(input.tenantId, input.workspaceId)).find(
      (job) =>
        job.idempotencyKey === input.idempotencyKey &&
        job.commandFingerprint === input.commandFingerprint &&
        job.type === input.type,
    );

    if (existing && input.idempotencyKey) {
      return existing;
    }

    const now = toIso(context.now);
    const job: WorkerJobRecord = {
      attempt: 0,
      checkpoint: input.checkpoint ?? null,
      commandFingerprint: input.commandFingerprint ?? `${input.type}:${now}`,
      completedAt: null,
      createdAt: now,
      errorCode: null,
      idempotencyKey: input.idempotencyKey ?? this.random.token("jobidem", 12),
      jobId: this.random.uuid(),
      nextRunAt: null,
      payload: input.payload ?? {},
      progressPercent: 0,
      result: null,
      retryBudget: input.retryBudget ?? 3,
      status: "queued",
      tenantId: input.tenantId,
      type: input.type,
      updatedAt: now,
      workspaceId: input.workspaceId,
    };
    await this.state.saveWorkerJob(job);
    return job;
  }

  async runWorkerJob(jobId: string, context: RequestContext): Promise<WorkerJobRecord | null> {
    const job = await this.state.findWorkerJob(jobId);

    if (!job || job.status === "cancelled" || job.status === "dlq") {
      return null;
    }

    const running = {
      ...job,
      attempt: job.attempt + 1,
      progressPercent: 50,
      status: "running",
      updatedAt: toIso(context.now),
    } satisfies WorkerJobRecord;
    await this.state.saveWorkerJob(running);
    const completed = {
      ...running,
      completedAt: toIso(context.now),
      progressPercent: 100,
      result: defaultWorkerResult(running),
      status: "succeeded",
      updatedAt: toIso(context.now),
    } satisfies WorkerJobRecord;
    await this.state.saveWorkerJob(completed);
    return completed;
  }

  async failWorkerJob(
    jobId: string,
    errorCode: string,
    context: RequestContext,
  ): Promise<WorkerJobRecord | null> {
    const job = await this.state.findWorkerJob(jobId);

    if (!job) {
      return null;
    }

    const nextAttempt = job.attempt + 1;

    if (nextAttempt >= job.retryBudget) {
      const failed = {
        ...job,
        attempt: nextAttempt,
        completedAt: toIso(context.now),
        errorCode,
        progressPercent: 100,
        status: "dlq",
        updatedAt: toIso(context.now),
      } satisfies WorkerJobRecord;
      await this.state.saveWorkerJob(failed);
      await this.state.saveWorkerDlq({
        createdAt: toIso(context.now),
        dlqId: this.random.uuid(),
        errorCode,
        jobId: failed.jobId,
        reason: "retry_budget_exhausted",
        tenantId: failed.tenantId,
        workspaceId: failed.workspaceId,
      });
      return failed;
    }

    const retry = {
      ...job,
      attempt: nextAttempt,
      errorCode,
      nextRunAt: toIso(new Date(context.now.getTime() + retryDelayMs(nextAttempt))),
      progressPercent: 25,
      status: "retry_wait",
      updatedAt: toIso(context.now),
    } satisfies WorkerJobRecord;
    await this.state.saveWorkerJob(retry);
    return retry;
  }

  async replayDlq(jobId: string, context: RequestContext): Promise<WorkerJobRecord | null> {
    const job = await this.state.findWorkerJob(jobId);

    if (!job || job.status !== "dlq") {
      return null;
    }

    const replayed = {
      ...job,
      attempt: 0,
      completedAt: null,
      errorCode: null,
      nextRunAt: null,
      progressPercent: 0,
      status: "queued",
      updatedAt: toIso(context.now),
    } satisfies WorkerJobRecord;
    await this.state.saveWorkerJob(replayed);
    return replayed;
  }

  async cleanupCompletedJobs(context: RequestContext): Promise<readonly WorkerJobRecord[]> {
    const snapshot = await this.state.snapshot();
    const cleaned: WorkerJobRecord[] = [];

    for (const job of snapshot.workerJobs) {
      if (job.status === "succeeded") {
        const updated = {
          ...job,
          payload: {
            cleanedAt: toIso(context.now),
          },
          updatedAt: toIso(context.now),
        } satisfies WorkerJobRecord;
        await this.state.saveWorkerJob(updated);
        cleaned.push(updated);
      }
    }

    return cleaned;
  }

  async exportReport(
    input: {
      readonly format?: string;
      readonly periodEnd?: string;
      readonly periodStart?: string;
      readonly reportType?: string;
    },
    context: RequestContext,
  ): Promise<AuthServiceResult<{ report: ReportExportRecord; workerJobIds: readonly string[] }>> {
    const authorized = await this.requireScope(context, "report.create");

    if (!authorized.ok) {
      return authorized.result;
    }

    const format = parseReportFormat(input.format);
    const reportId = this.random.uuid();
    const now = toIso(context.now);
    const reportType = input.reportType?.trim() || "dashboard_summary";
    const baseRecord: ReportExportRecord = {
      bytes: 0,
      contentType: contentTypeForFormat(format),
      createdAt: now,
      expiresAt: toIso(new Date(context.now.getTime() + 7 * 24 * 60 * 60 * 1000)),
      fileName: `${reportId}.${format}`,
      filePath: "",
      format,
      generatedAt: null,
      reportId,
      reportType,
      sha256: "",
      status: "processing",
      tenantId: authorized.tenantId,
      updatedAt: now,
      workerJobIds: [],
      workspaceId: authorized.workspaceId,
    };
    await this.state.saveReport(baseRecord);
    const reportJob = await this.enqueueWorkerJob(
      {
        commandFingerprint: `reports:${reportId}`,
        idempotencyKey: `report:${reportId}`,
        payload: {
          reportId,
          reportType,
        },
        tenantId: authorized.tenantId,
        type: "reports",
        workspaceId: authorized.workspaceId,
      },
      context,
    );
    const exportJob = await this.enqueueWorkerJob(
      {
        commandFingerprint: `exports:${reportId}`,
        idempotencyKey: `export:${reportId}`,
        payload: {
          format,
          reportId,
        },
        tenantId: authorized.tenantId,
        type: "exports",
        workspaceId: authorized.workspaceId,
      },
      context,
    );
    const readiness = await this.dashboardReadinessForExport(context);
    const content = renderReportContent({
      format,
      input,
      readiness,
      reportId,
      reportType,
      tenantId: authorized.tenantId,
      workspaceId: authorized.workspaceId,
    });
    const file = await this.fileStore.writeReportFile({
      content,
      contentType: contentTypeForFormat(format),
      fileName: `${reportId}.${format}`,
      reportId,
      tenantId: authorized.tenantId,
      workspaceId: authorized.workspaceId,
    });
    const completed = {
      ...baseRecord,
      bytes: file.bytes,
      contentType: file.contentType,
      fileName: file.fileName,
      filePath: file.path,
      generatedAt: toIso(context.now),
      sha256: file.sha256,
      status: "completed",
      updatedAt: toIso(context.now),
      workerJobIds: [reportJob.jobId, exportJob.jobId],
    } satisfies ReportExportRecord;
    await this.state.saveReport(completed);
    await this.runWorkerJob(reportJob.jobId, context);
    await this.runWorkerJob(exportJob.jobId, context);

    return this.ok(
      {
        report: completed,
        workerJobIds: completed.workerJobIds,
      },
      202,
      context,
    );
  }

  async reportStatus(
    reportId: string,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ report: ReportExportRecord }>> {
    const report = await this.authorizedReport(reportId, context);

    if ("result" in report) {
      return report.result;
    }

    return this.ok({ report: report.record }, 200, context);
  }

  async reportDownload(
    reportId: string,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ content: string; report: ReportExportRecord }>> {
    const report = await this.authorizedReport(reportId, context);

    if ("result" in report) {
      return report.result;
    }

    if (report.record.status !== "completed") {
      return this.fail("VALIDATION_FAILED", "Report export is not ready.", 409, context, true);
    }

    const file = await this.fileStore.readReportFile(
      report.record.filePath,
      report.record.contentType,
    );

    if (file.bytes !== report.record.bytes) {
      return this.fail("VALIDATION_FAILED", "Report file metadata does not match.", 409, context);
    }

    return this.ok(
      {
        content: file.content,
        report: report.record,
      },
      200,
      context,
    );
  }

  async createAssistantThread(
    input: {
      readonly resourceId?: string;
      readonly resourceType?: string;
      readonly surface?: string;
      readonly title?: string;
      readonly useCaseId?: string;
    },
    context: RequestContext,
  ): Promise<AuthServiceResult<{ thread: AssistantThreadRecord }>> {
    const authorized = await this.requireScope(context, "assistant.use");

    if (!authorized.ok) {
      return authorized.result;
    }

    const readiness = await this.dashboardReadinessForExport(context);
    const firstMetric = readiness?.metrics[0];
    const now = toIso(context.now);
    const thread: AssistantThreadRecord = {
      context: {
        currency: firstMetric?.currency ?? "PLN",
        dataScope: authorized.decision.dataScope,
        period: {
          end: firstMetric?.periodEnd ?? now,
          start: firstMetric?.periodStart ?? now,
        },
        readiness: readiness?.readiness ?? "no_data",
        resourceId: input.resourceId ?? null,
        resourceType: input.resourceType ?? "dashboard",
        snapshotId: firstMetric?.snapshotId ?? null,
        surface: input.surface ?? "dashboard",
        tenantId: authorized.tenantId,
        timezone: "Europe/Warsaw",
        useCaseId: input.useCaseId ?? "dashboard_briefing",
        workspaceId: authorized.workspaceId,
      },
      createdAt: now,
      threadId: this.random.uuid(),
      title: input.title?.trim() || "Papa Asystent",
      updatedAt: now,
    };
    await this.state.saveAssistantThread(thread);
    await this.auditAssistant("assistant.thread_created", "success", thread, authorized.principal.user.userId, context);
    return this.ok({ thread }, 201, context);
  }

  async postAssistantMessage(
    input: {
      readonly message?: string;
      readonly simulateNoData?: boolean;
      readonly threadId: string;
    },
    context: RequestContext,
  ): Promise<
    AuthServiceResult<{
      assistantMessage: AssistantMessageRecord;
      userMessage: AssistantMessageRecord;
    }>
  > {
    const thread = await this.authorizedThread(input.threadId, context, "assistant.use");

    if ("result" in thread) {
      return thread.result;
    }

    const now = toIso(context.now);
    const userMessage: AssistantMessageRecord = {
      auditReference: this.random.operationId(),
      confidence: 1,
      content: input.message?.trim() || "",
      createdAt: now,
      evidence: [],
      limitations: [],
      messageId: this.random.uuid(),
      recommendations: [],
      refusal: null,
      role: "user",
      threadId: thread.record.threadId,
    };
    await this.state.saveAssistantMessage(userMessage);
    const readiness = input.simulateNoData
      ? await this.calculateNoData(thread.record, context)
      : await this.dashboardReadinessForExport(context);
    const refusal = readiness && readiness.readiness !== "no_data"
      ? null
      : this.createAssistantRefusal(thread.record, "INSUFFICIENT_DATA");
    const evidence = refusal ? [] : evidenceFromReadiness(readiness);
    const assistantMessage: AssistantMessageRecord = {
      auditReference: this.random.operationId(),
      confidence: refusal ? 0 : 0.78,
      content: refusal
        ? ""
        : "FACT: dashboard metrics are ready. INTERPRETATION: revenue, orders and ROAS can be compared with explicit evidence.",
      createdAt: now,
      evidence,
      limitations: refusal ? ["insufficient_data"] : ["local_sandbox_metrics", "requires_human_review_before_action"],
      messageId: this.random.uuid(),
      recommendations: refusal
        ? []
        : ["Review products with medium stockout risk before approving operational action."],
      refusal,
      role: "assistant",
      threadId: thread.record.threadId,
    };
    await this.state.saveAssistantMessage(assistantMessage);
    await this.auditAssistant(
      refusal ? "assistant.refused" : "assistant.message_created",
      refusal ? "denied" : "success",
      thread.record,
      thread.principalUserId,
      context,
    );

    return this.ok({ assistantMessage, userMessage }, refusal ? 422 : 201, context);
  }

  async streamAssistantThread(
    threadId: string,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ chunks: readonly JsonObject[] }>> {
    const thread = await this.authorizedThread(threadId, context, "assistant.use");

    if ("result" in thread) {
      return thread.result;
    }

    const messages = await this.state.listAssistantMessages(thread.record.threadId);
    const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant");
    const chunks: readonly JsonObject[] = latestAssistant
      ? [
          {
            event: "message.context",
            readiness: thread.record.context.readiness,
            threadId,
          },
          {
            content: latestAssistant.refusal?.code ?? latestAssistant.content.slice(0, 80),
            event: "message.delta",
            messageId: latestAssistant.messageId,
          },
          {
            confidence: latestAssistant.confidence,
            event: "message.done",
            limitations: latestAssistant.limitations,
          },
        ]
      : [
          {
            event: "message.empty",
            threadId,
          },
        ];

    return this.ok({ chunks }, 200, context);
  }

  async simulateAssistantAction(
    input: {
      readonly actionKind?: string;
      readonly threadId: string;
    },
    context: RequestContext,
  ): Promise<AuthServiceResult<{ impactPreview: readonly string[]; scopePreview: readonly string[] }>> {
    const thread = await this.authorizedThread(input.threadId, context, "assistant.use");

    if ("result" in thread) {
      return thread.result;
    }

    const actionKind = input.actionKind?.trim() || "create_report_recommendation";
    const impactPreview = prohibitedAiAction(actionKind)
      ? ["prohibited_action"]
      : ["read_only_analysis", "requires_human_approval", "no_autonomous_execution"];
    const scopePreview = [
      `tenant:${thread.record.context.tenantId}`,
      `workspace:${thread.record.context.workspaceId}`,
      `resource:${thread.record.context.resourceType}`,
    ];
    await this.auditAssistant("assistant.simulated", "success", thread.record, thread.principalUserId, context);
    return this.ok({ impactPreview, scopePreview }, 200, context);
  }

  async createAssistantApproval(
    input: {
      readonly actionKind?: string;
      readonly threadId: string;
    },
    context: RequestContext,
  ): Promise<AuthServiceResult<{ approval: AssistantApprovalRecord }>> {
    const thread = await this.authorizedThread(input.threadId, context, "assistant.approve");

    if ("result" in thread) {
      return thread.result;
    }

    const actionKind = input.actionKind?.trim() || "create_report_recommendation";

    if (prohibitedAiAction(actionKind)) {
      await this.auditAssistant("assistant.approval_denied", "denied", thread.record, thread.principalUserId, context);
      return this.fail("FORBIDDEN", "This AI action is prohibited.", 403, context);
    }

    const approval: AssistantApprovalRecord = {
      actionKind,
      approvalId: this.random.uuid(),
      approvedAt: toIso(context.now),
      createdAt: toIso(context.now),
      humanActorUserId: thread.principalUserId,
      impactPreview: ["no_financial_execution", "no_permission_change", "audited_proposal_only"],
      reauthenticationRequired: true,
      revalidatedAt: null,
      scopePreview: [
        `tenant:${thread.record.context.tenantId}`,
        `workspace:${thread.record.context.workspaceId}`,
      ],
      status: "approved",
      threadId: thread.record.threadId,
    };
    await this.state.saveAssistantApproval(approval);
    await this.auditAssistant("assistant.approved", "success", thread.record, thread.principalUserId, context);
    return this.ok({ approval }, 201, context);
  }

  async revalidateAssistantAction(
    input: {
      readonly idempotencyKey?: string;
      readonly targetId?: string;
      readonly threadId: string;
    },
    context: RequestContext,
  ): Promise<
    AuthServiceResult<{
      dataRevalidated: boolean;
      idempotencyKey: string;
      permissionRevalidated: boolean;
      targetRevalidated: boolean;
    }>
  > {
    const thread = await this.authorizedThread(input.threadId, context, "assistant.approve");

    if ("result" in thread) {
      return thread.result;
    }

    await this.auditAssistant("assistant.revalidated", "success", thread.record, thread.principalUserId, context);
    return this.ok(
      {
        dataRevalidated: true,
        idempotencyKey: input.idempotencyKey?.trim() || this.random.token("aiidem", 12),
        permissionRevalidated: true,
        targetRevalidated: Boolean(input.targetId?.trim()),
      },
      200,
      context,
    );
  }

  async billingSubscription(
    context: RequestContext,
  ): Promise<AuthServiceResult<{ subscription: BillingSubscriptionRecord }>> {
    const authorized = await this.requireTenantBillingScope(context, "billing.read");

    if (!authorized.ok) {
      return authorized.result;
    }

    return this.ok(
      {
        subscription: await this.ensureSubscription(authorized.tenantId, context),
      },
      200,
      context,
    );
  }

  async applyBillingSandboxEvent(
    eventType: BillingSandboxEventType,
    payload: JsonObject,
    context: RequestContext,
  ): Promise<
    AuthServiceResult<{
      event: BillingEventRecord;
      invoice: BillingInvoiceRecord | null;
      subscription: BillingSubscriptionRecord;
      usageRecord: BillingUsageRecord | null;
    }>
  > {
    const authorized = await this.requireTenantBillingScope(context, "billing.manage");

    if (!authorized.ok) {
      return authorized.result;
    }

    const current = await this.ensureSubscription(authorized.tenantId, context);
    const subscription = updateSubscriptionForBillingEvent(current, eventType, payload, context);
    await this.state.saveBillingSubscription(subscription);
    const event: BillingEventRecord = {
      billingEventId: this.random.uuid(),
      createdAt: toIso(context.now),
      eventType,
      payload,
      tenantId: authorized.tenantId,
    };
    await this.state.saveBillingEvent(event);
    const invoice = eventType === "invoice_generated"
      ? {
          amountDue: stringFromJson(payload.amountDue, "199.00"),
          currency: stringFromJson(payload.currency, "PLN"),
          generatedAt: toIso(context.now),
          invoiceId: this.random.uuid(),
          status: "open",
          tenantId: authorized.tenantId,
        } satisfies BillingInvoiceRecord
      : null;

    if (invoice) {
      await this.state.saveBillingInvoice(invoice);
    }

    const usageRecord = eventType === "usage_updated"
      ? {
          createdAt: toIso(context.now),
          meterCode: stringFromJson(payload.meterCode, "workspace_metric_snapshot"),
          quantity: stringFromJson(payload.quantity, "1"),
          tenantId: authorized.tenantId,
          usageRecordId: this.random.uuid(),
        } satisfies BillingUsageRecord
      : null;

    if (usageRecord) {
      await this.state.saveBillingUsage(usageRecord);
    }

    return this.ok(
      {
        event,
        invoice,
        subscription,
        usageRecord,
      },
      200,
      context,
    );
  }

  private async dashboardReadinessForExport(
    context: RequestContext,
  ): Promise<DashboardReadinessResponse | null> {
    const result = await this.dashboardService.dashboardReadiness(context);

    if ("data" in result.body) {
      return result.body.data;
    }

    return null;
  }

  private async calculateNoData(
    thread: AssistantThreadRecord,
    context: RequestContext,
  ): Promise<DashboardReadinessResponse> {
    return this.dashboardService.calculate(
      createMetricEngineInput({
        generatedAt: toIso(context.now),
        noData: true,
        tenantId: thread.context.tenantId,
        workspaceId: thread.context.workspaceId,
      }),
    );
  }

  private async authorizedReport(
    reportId: string,
    context: RequestContext,
  ): Promise<
    | {
        readonly record: ReportExportRecord;
      }
    | {
        readonly result: AuthServiceResult<never>;
      }
  > {
    const authorized = await this.requireScope(context, "report.read");

    if (!authorized.ok) {
      return {
        result: authorized.result,
      };
    }

    const report = await this.state.findReport(reportId);

    if (
      !report ||
      report.tenantId !== authorized.tenantId ||
      report.workspaceId !== authorized.workspaceId
    ) {
      return {
        result: this.fail("NOT_FOUND", "Report export was not found.", 404, context),
      };
    }

    return {
      record: report,
    };
  }

  private async authorizedThread(
    threadId: string,
    context: RequestContext,
    capability: Capability,
  ): Promise<
    | {
        readonly principalUserId: string;
        readonly record: AssistantThreadRecord;
      }
    | {
        readonly result: AuthServiceResult<never>;
      }
  > {
    const authorized = await this.requireScope(context, capability);

    if (!authorized.ok) {
      return {
        result: authorized.result,
      };
    }

    const thread = await this.state.findAssistantThread(threadId);

    if (
      !thread ||
      thread.context.tenantId !== authorized.tenantId ||
      thread.context.workspaceId !== authorized.workspaceId
    ) {
      return {
        result: this.fail("NOT_FOUND", "Assistant thread was not found.", 404, context),
      };
    }

    return {
      principalUserId: authorized.principal.user.userId,
      record: thread,
    };
  }

  private async requireScope(
    context: RequestContext,
    capability: Capability,
  ): Promise<AuthorizedBackendScope> {
    return this.accessService.authorizeSelectedContext(context, capability);
  }

  private async requireTenantBillingScope(
    context: RequestContext,
    capability: Capability,
  ): Promise<
    | {
        readonly ok: true;
        readonly tenantId: string;
      }
    | {
        readonly ok: false;
        readonly result: AuthServiceResult<never>;
      }
  > {
    const selected = await this.accessService.authorizeSelectedContext(context, capability);

    if (!selected.ok) {
      return selected;
    }

    return {
      ok: true,
      tenantId: selected.tenantId,
    };
  }

  private async ensureSubscription(
    tenantId: string,
    context: RequestContext,
  ): Promise<BillingSubscriptionRecord> {
    const existing = await this.state.findBillingSubscription(tenantId);

    if (existing) {
      return existing;
    }

    const created = {
      cancelledAt: null,
      entitlements: ["analytics", "billing", "reports", "ai_assistant"],
      planCode: "sandbox_start",
      status: "trial",
      subscriptionId: this.random.uuid(),
      tenantId,
      updatedAt: toIso(context.now),
    } satisfies BillingSubscriptionRecord;
    await this.state.saveBillingSubscription(created);
    return created;
  }

  private createAssistantRefusal(
    thread: AssistantThreadRecord,
    code: AssistantRefusalCode,
  ): AssistantRefusal {
    return {
      auditReference: this.random.operationId(),
      code,
      missingRequirements: ["ready_dashboard_metrics"],
      nextActions: ["connect_required_sources", "run_sync", "recalculate_readiness"],
      safeMessage: "Brakuje wystarczajacych danych do odpowiedzi w tym zakresie.",
      scope: {
        tenantId: thread.context.tenantId,
        workspaceId: thread.context.workspaceId,
      },
    };
  }

  private async auditAssistant(
    eventType: string,
    result: "denied" | "success",
    thread: AssistantThreadRecord,
    userId: string | null,
    context: RequestContext,
  ): Promise<void> {
    await this.state.saveAssistantAudit({
      auditId: this.random.uuid(),
      eventType,
      occurredAt: toIso(context.now),
      result,
      tenantId: thread.context.tenantId,
      threadId: thread.threadId,
      userId,
      workspaceId: thread.context.workspaceId,
    });
  }

  private ok<TData>(
    data: TData,
    status: number,
    context: RequestContext,
  ): AuthServiceResult<TData> {
    return {
      body: {
        data,
        meta: responseMeta(context),
      },
      status,
    };
  }

  private fail(
    code: AuthErrorCode,
    message: string,
    status: number,
    context: RequestContext,
    retryable = false,
  ): AuthServiceResult<never> {
    return {
      body: {
        error: {
          code,
          contractVersion: responseMeta(context).contractVersion,
          correlationId: context.correlationId,
          message,
          retryable,
        },
        meta: {
          ...responseMeta(context),
          limitations: [code],
        },
      },
      status,
    };
  }
}

function defaultWorkerResult(job: WorkerJobRecord): JsonObject {
  return {
    handledBy: "worker",
    jobType: job.type,
    policyVersion: REMAINING_BACKEND_POLICY_VERSION,
    status: "handled",
  };
}

function retryDelayMs(attempt: number): number {
  const backoff = 2 ** attempt * 1_000;
  const jitter = attempt * 137;
  return backoff + jitter;
}

function parseReportFormat(value: string | undefined): ReportFormat {
  return value === "json" ? "json" : "csv";
}

function contentTypeForFormat(format: ReportFormat): string {
  return format === "json" ? "application/json; charset=utf-8" : "text/csv; charset=utf-8";
}

function renderReportContent(input: {
  readonly format: ReportFormat;
  readonly input: {
    readonly periodEnd?: string;
    readonly periodStart?: string;
  };
  readonly readiness: DashboardReadinessResponse | null;
  readonly reportId: string;
  readonly reportType: string;
  readonly tenantId: string;
  readonly workspaceId: string;
}): string {
  const rows = (input.readiness?.metrics ?? []).map((metric) => ({
    metricCode: metric.metricCode,
    readiness: metric.readiness,
    value: metric.value ?? "",
  }));

  if (input.format === "json") {
    return JSON.stringify(
      {
        generatedAt: input.readiness?.generatedAt ?? null,
        metrics: rows,
        periodEnd: input.input.periodEnd ?? null,
        periodStart: input.input.periodStart ?? null,
        readiness: input.readiness?.readiness ?? "no_data",
        reportId: input.reportId,
        reportType: input.reportType,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
      },
      null,
      2,
    );
  }

  return [
    "reportId,tenantId,workspaceId,metricCode,readiness,value",
    ...rows.map((row) =>
      [
        input.reportId,
        input.tenantId,
        input.workspaceId,
        row.metricCode,
        row.readiness,
        row.value,
      ].join(","),
    ),
  ].join("\n");
}

function evidenceFromReadiness(
  readiness: DashboardReadinessResponse | null,
): readonly AssistantEvidenceRecord[] {
  if (!readiness) {
    return [];
  }

  return readiness.metrics.slice(0, 3).map((metric) => ({
    evidenceId: `evidence_${metric.snapshotId}`,
    metricCode: metric.metricCode,
    scope: {
      tenantId: metric.tenantId,
      workspaceId: metric.workspaceId,
    },
    sourceRef: metric.snapshotId,
    sourceType: "metric_snapshot",
  }));
}

function prohibitedAiAction(actionKind: string): boolean {
  return [
    "payment",
    "role_change",
    "capability_change",
    "delete_data",
    "source_authority_change",
    "kpi_approval",
    "legal_action",
  ].includes(actionKind);
}

function updateSubscriptionForBillingEvent(
  subscription: BillingSubscriptionRecord,
  eventType: BillingSandboxEventType,
  payload: JsonObject,
  context: RequestContext,
): BillingSubscriptionRecord {
  if (eventType === "subscription_activated") {
    return {
      ...subscription,
      cancelledAt: null,
      planCode: stringFromJson(payload.planCode, subscription.planCode),
      status: "active",
      updatedAt: toIso(context.now),
    };
  }

  if (eventType === "plan_changed") {
    return {
      ...subscription,
      planCode: stringFromJson(payload.planCode, subscription.planCode),
      updatedAt: toIso(context.now),
    };
  }

  if (eventType === "subscription_cancelled") {
    return {
      ...subscription,
      cancelledAt: toIso(context.now),
      status: "cancelled",
      updatedAt: toIso(context.now),
    };
  }

  if (eventType === "subscription_resumed" || eventType === "payment_recovered") {
    return {
      ...subscription,
      cancelledAt: null,
      status: "active",
      updatedAt: toIso(context.now),
    };
  }

  if (eventType === "payment_pending") {
    return {
      ...subscription,
      status: "pending",
      updatedAt: toIso(context.now),
    };
  }

  if (eventType === "payment_failed") {
    return {
      ...subscription,
      status: "past_due",
      updatedAt: toIso(context.now),
    };
  }

  if (eventType === "entitlement_changed") {
    return {
      ...subscription,
      entitlements: arrayFromJson(payload.entitlements, subscription.entitlements),
      updatedAt: toIso(context.now),
    };
  }

  return {
    ...subscription,
    updatedAt: toIso(context.now),
  };
}

function stringFromJson(value: JsonValue | undefined, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function arrayFromJson(value: JsonValue | undefined, fallback: readonly string[]): readonly string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : fallback;
}
