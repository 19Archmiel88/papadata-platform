import {
  normalizeProviderRecord,
  ProviderAdapterError,
  type IntegrationProviderAdapter,
} from "@papadata/integrations";
import type {
  DurableBatchProcessInput,
  DurableBatchProcessResult,
  DurablePersistFetchedPageInput,
  DurablePersistFetchedPageResult,
  DurableReconciliationInput,
  DurableReconciliationResult,
} from "@papadata/database";
import type { IntegrationJobPayload } from "./worker.service.js";

export const durableIntegrationJobStates = [
  "queued",
  "leased",
  "fetching",
  "persisting_source",
  "normalizing",
  "writing_canonical",
  "reconciling",
  "succeeded",
  "retryable_failed",
  "terminal_failed",
  "cancel_requested",
  "cancelled",
  "dead_lettered",
] as const;

export type DurableIntegrationJobState =
  (typeof durableIntegrationJobStates)[number];

export type DurableIngestionRepository = {
  acquireLease(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly syncJobId: string;
    readonly leaseOwner: string;
    readonly leaseExpiresAt: string;
    readonly attempt: number;
  }): Promise<boolean>;
  renewLease(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly syncJobId: string;
    readonly leaseOwner: string;
    readonly leaseExpiresAt: string;
  }): Promise<boolean>;
  transitionJobState(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly syncJobId: string;
    readonly leaseOwner: string;
    readonly fromState: string;
    readonly toState: string;
  }): Promise<boolean>;
  isCancelRequested(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly syncJobId: string;
  }): Promise<boolean>;
  readCheckpoint(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly connectionId: string;
    readonly providerId: string;
    readonly stream: string;
  }): Promise<string | null>;
  persistFetchedPage(
    input: DurablePersistFetchedPageInput,
  ): Promise<DurablePersistFetchedPageResult>;
  normalizeBatch(
    input: DurableBatchProcessInput,
  ): Promise<DurableBatchProcessResult>;
  writeCanonicalRecords(
    input: DurableBatchProcessInput,
  ): Promise<DurableBatchProcessResult>;
  writeReconciliation(
    input: DurableReconciliationInput,
  ): Promise<DurableReconciliationResult>;
  finalizeSucceeded(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly syncJobId: string;
    readonly leaseOwner: string;
    readonly nextCheckpoint: string | null;
  }): Promise<boolean>;
  markCancelled(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly syncJobId: string;
    readonly leaseOwner: string;
  }): Promise<void>;
  markFailed(input: {
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly syncJobId: string;
    readonly connectionId: string;
    readonly providerId: string;
    readonly leaseOwner: string;
    readonly status: "dead_lettered" | "retryable_failed" | "terminal_failed";
    readonly failureClass: string;
    readonly failureReason: string;
    readonly attempt: number;
  }): Promise<void>;
};

export type DurableIngestionRunInput = {
  readonly payload: IntegrationJobPayload;
  readonly adapterFactory: () => Promise<IntegrationProviderAdapter>;
  readonly attempt: number;
  readonly maxAttempts: number;
  readonly leaseOwner: string;
  readonly correlationId: string;
};

export type DurableIngestionRunResult = {
  readonly status: "cancelled" | "not_leased" | "succeeded";
  readonly jobId: string;
  readonly sourceBatchId: string | null;
  readonly fetchedCount: number;
  readonly persistedSourceCount: number;
  readonly normalizedCount: number;
  readonly canonicalCount: number;
  readonly duplicateCount: number;
  readonly checkpoint: string | null;
};

export class DurableIngestionError extends Error {
  readonly failureClass: string;
  readonly retryable: boolean;

  constructor(message: string, input: {
    readonly failureClass: string;
    readonly retryable: boolean;
  }) {
    super(message);
    this.name = "DurableIngestionError";
    this.failureClass = input.failureClass;
    this.retryable = input.retryable;
  }
}

export class DurableIngestionPipeline {
  private readonly repository: DurableIngestionRepository;
  private readonly clock: () => Date;
  private readonly leaseDurationMs: number;

  constructor(input: {
    readonly repository: DurableIngestionRepository;
    readonly clock?: () => Date;
    readonly leaseDurationMs?: number;
  }) {
    this.repository = input.repository;
    this.clock = input.clock ?? (() => new Date());
    this.leaseDurationMs = input.leaseDurationMs ?? 60_000;
  }

  async run(input: DurableIngestionRunInput): Promise<DurableIngestionRunResult> {
    const context = jobContext(input);
    const leaseExpiresAt = new Date(
      this.clock().getTime() + this.leaseDurationMs,
    ).toISOString();
    const leaseAcquired = await this.repository.acquireLease({
      ...context,
      leaseOwner: input.leaseOwner,
      leaseExpiresAt,
      attempt: input.attempt,
    });

    if (!leaseAcquired) {
      return emptyResult("not_leased", input.payload.jobId);
    }

    let currentState: DurableIntegrationJobState = "leased";
    let leaseLost = false;
    let heartbeatRunning = false;
    const heartbeat = setInterval(() => {
      if (heartbeatRunning || leaseLost) return;
      heartbeatRunning = true;
      const renewedUntil = new Date(
        this.clock().getTime() + this.leaseDurationMs,
      ).toISOString();
      void this.repository.renewLease({
        ...context,
        leaseOwner: input.leaseOwner,
        leaseExpiresAt: renewedUntil,
      }).then((renewed) => {
        leaseLost = !renewed;
      }).catch(() => {
        leaseLost = true;
      }).finally(() => {
        heartbeatRunning = false;
      });
    }, Math.max(1_000, Math.floor(this.leaseDurationMs / 3)));
    heartbeat.unref();

    try {
      if (await this.cancelIfRequested(context, input.leaseOwner)) {
        return emptyResult("cancelled", input.payload.jobId);
      }

      const adapter = await input.adapterFactory();

      currentState = await this.transition(
        context,
        input.leaseOwner,
        currentState,
        "fetching",
      );
      const checkpointStream = chooseCheckpointStream(input.payload.streams);
      const checkpoint = await this.repository.readCheckpoint({
        tenantId: input.payload.tenantId,
        workspaceId: input.payload.workspaceId,
        connectionId: input.payload.connectionId,
        providerId: input.payload.providerId,
        stream: checkpointStream,
      });
      const fetchStartedAt = this.clock().toISOString();
      const fetchResult = await adapter.fetch({
        streams: input.payload.streams,
        from: input.payload.from,
        to: input.payload.to,
        checkpoint,
      });
      const fetchFinishedAt = this.clock().toISOString();
      const fetchedRecords = fetchResult.records.map((record) => ({
        ...record,
        payload: {
          canonical: normalizeProviderRecord({
            providerId: input.payload.providerId,
            stream: record.stream,
            externalId: record.externalId,
            observedAt: record.observedAt,
            payload: record.payload,
          }),
          raw: record.payload,
        },
      }));

      if (leaseLost) {
        throw new DurableIngestionError("Integration job lease was lost", {
          failureClass: "transient",
          retryable: true,
        });
      }

      if (await this.cancelIfRequested(context, input.leaseOwner)) {
        return emptyResult("cancelled", input.payload.jobId);
      }

      currentState = await this.transition(
        context,
        input.leaseOwner,
        currentState,
        "persisting_source",
      );
      const persisted = await this.repository.persistFetchedPage({
        tenantId: input.payload.tenantId,
        workspaceId: input.payload.workspaceId,
        connectionId: input.payload.connectionId,
        providerId: input.payload.providerId,
        syncJobId: input.payload.jobId,
        checkpointStream,
        fetchedRecords,
        nextCheckpoint: fetchResult.nextCheckpoint,
        attempt: input.attempt,
        correlationId: input.correlationId,
        fetchStartedAt,
        fetchFinishedAt,
      });

      if (await this.cancelIfRequested(context, input.leaseOwner)) {
        return partialCancelledResult(input.payload.jobId, persisted);
      }

      const batchInput = {
        tenantId: input.payload.tenantId,
        workspaceId: input.payload.workspaceId,
        connectionId: input.payload.connectionId,
        providerId: input.payload.providerId,
        syncJobId: input.payload.jobId,
        sourceBatchId: persisted.sourceBatchId,
      };

      currentState = await this.transition(
        context,
        input.leaseOwner,
        currentState,
        "normalizing",
      );
      const normalized = await this.repository.normalizeBatch(batchInput);

      if (await this.cancelIfRequested(context, input.leaseOwner)) {
        return partialCancelledResult(input.payload.jobId, persisted, normalized.count);
      }

      currentState = await this.transition(
        context,
        input.leaseOwner,
        currentState,
        "writing_canonical",
      );
      const canonical = await this.repository.writeCanonicalRecords(batchInput);

      if (await this.cancelIfRequested(context, input.leaseOwner)) {
        return partialCancelledResult(
          input.payload.jobId,
          persisted,
          normalized.count,
          canonical.count,
        );
      }

      currentState = await this.transition(
        context,
        input.leaseOwner,
        currentState,
        "reconciling",
      );
      const reconciliation = await this.repository.writeReconciliation({
        ...batchInput,
        fetchedCount: persisted.fetchedCount,
        persistedSourceCount: persisted.persistedSourceCount,
        normalizedCount: normalized.count,
        canonicalCount: canonical.count,
        duplicateCount: persisted.duplicateCount,
        rejectedCount: 0,
        failedCount: 0,
      });

      assertSuccessfulReconciliation({
        persisted,
        normalizedCount: normalized.count,
        canonicalCount: canonical.count,
        reconciliation,
        providerPartial: fetchResult.partial,
      });

      const finalized = await this.repository.finalizeSucceeded({
        ...context,
        leaseOwner: input.leaseOwner,
        nextCheckpoint: fetchResult.nextCheckpoint,
      });

      if (!finalized) {
        throw new DurableIngestionError("Finalization rejected", {
          failureClass: "transient",
          retryable: true,
        });
      }

      return {
        status: "succeeded",
        jobId: input.payload.jobId,
        sourceBatchId: persisted.sourceBatchId,
        fetchedCount: persisted.fetchedCount,
        persistedSourceCount: persisted.persistedSourceCount,
        normalizedCount: normalized.count,
        canonicalCount: canonical.count,
        duplicateCount: persisted.duplicateCount,
        checkpoint: fetchResult.nextCheckpoint,
      };
    } catch (error) {
      const failure = classifyFailure(error, input.attempt, input.maxAttempts);
      await this.repository.markFailed({
        ...context,
        connectionId: input.payload.connectionId,
        providerId: input.payload.providerId,
        leaseOwner: input.leaseOwner,
        status: failure.status,
        failureClass: failure.failureClass,
        failureReason: failure.failureReason,
        attempt: input.attempt,
      });
      throw error;
    } finally {
      clearInterval(heartbeat);
    }
  }

  private async transition(
    context: JobStateContext,
    leaseOwner: string,
    fromState: DurableIntegrationJobState,
    toState: DurableIntegrationJobState,
  ): Promise<DurableIntegrationJobState> {
    assertAllowedJobTransition(fromState, toState);
    const transitioned = await this.repository.transitionJobState({
      ...context,
      leaseOwner,
      fromState,
      toState,
    });

    if (!transitioned) {
      throw new DurableIngestionError("State transition rejected", {
        failureClass: "transient",
        retryable: true,
      });
    }

    return toState;
  }

  private async cancelIfRequested(
    context: JobStateContext,
    leaseOwner: string,
  ): Promise<boolean> {
    if (!(await this.repository.isCancelRequested(context))) {
      return false;
    }

    await this.repository.markCancelled({
      ...context,
      leaseOwner,
    });
    return true;
  }
}

type JobStateContext = {
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly syncJobId: string;
};

const allowedTransitions = new Map<
  DurableIntegrationJobState,
  ReadonlySet<DurableIntegrationJobState>
>([
  ["queued", new Set(["leased", "cancel_requested"])],
  ["leased", new Set(["fetching", "cancelled", "retryable_failed", "terminal_failed", "dead_lettered"])],
  ["fetching", new Set(["persisting_source", "cancelled", "retryable_failed", "terminal_failed", "dead_lettered"])],
  ["persisting_source", new Set(["normalizing", "cancelled", "retryable_failed", "terminal_failed", "dead_lettered"])],
  ["normalizing", new Set(["writing_canonical", "cancelled", "retryable_failed", "terminal_failed", "dead_lettered"])],
  ["writing_canonical", new Set(["reconciling", "cancelled", "retryable_failed", "terminal_failed", "dead_lettered"])],
  ["reconciling", new Set(["succeeded", "cancelled", "retryable_failed", "terminal_failed", "dead_lettered"])],
  ["retryable_failed", new Set(["leased", "dead_lettered"])],
  ["cancel_requested", new Set(["cancelled"])],
  ["succeeded", new Set()],
  ["terminal_failed", new Set()],
  ["cancelled", new Set()],
  ["dead_lettered", new Set()],
]);

export function canTransitionJobState(
  fromState: DurableIntegrationJobState,
  toState: DurableIntegrationJobState,
): boolean {
  return allowedTransitions.get(fromState)?.has(toState) === true;
}

export function assertAllowedJobTransition(
  fromState: DurableIntegrationJobState,
  toState: DurableIntegrationJobState,
): void {
  if (!canTransitionJobState(fromState, toState)) {
    throw new DurableIngestionError(
      `Invalid integration job state transition: ${fromState} -> ${toState}`,
      { failureClass: "validation", retryable: false },
    );
  }
}

function assertSuccessfulReconciliation(input: {
  readonly persisted: DurablePersistFetchedPageResult;
  readonly normalizedCount: number;
  readonly canonicalCount: number;
  readonly reconciliation: DurableReconciliationResult;
  readonly providerPartial: boolean;
}): void {
  if (input.providerPartial) {
    throw new DurableIngestionError("Provider returned partial data", {
      failureClass: "transient",
      retryable: true,
    });
  }

  if (
    input.reconciliation.status !== "passed"
    || input.persisted.fetchedCount === 0
    || input.persisted.fetchedCount !== input.persisted.persistedSourceCount
    || input.persisted.persistedSourceCount !== input.normalizedCount
    || input.normalizedCount !== input.canonicalCount
  ) {
    throw new DurableIngestionError(
      input.reconciliation.failureReason ?? "Integration reconciliation failed",
      { failureClass: "validation", retryable: true },
    );
  }
}

function classifyFailure(
  error: unknown,
  attempt: number,
  maxAttempts: number,
): {
  readonly status: "dead_lettered" | "retryable_failed" | "terminal_failed";
  readonly failureClass: string;
  readonly failureReason: string;
} {
  const retryExhausted = attempt >= maxAttempts;
  const failureClass = readFailureClass(error);
  const retryable = isRetryableFailure(error, failureClass);

  if (retryable && retryExhausted) {
    return {
      status: "dead_lettered",
      failureClass,
      failureReason: sanitizeFailureReason(error),
    };
  }

  return {
    status: retryable ? "retryable_failed" : "terminal_failed",
    failureClass,
    failureReason: sanitizeFailureReason(error),
  };
}

function readFailureClass(error: unknown): string {
  if (error instanceof ProviderAdapterError) {
    return error.failureClass;
  }
  if (error instanceof DurableIngestionError) {
    return error.failureClass;
  }
  return "transient";
}

function isRetryableFailure(error: unknown, failureClass: string): boolean {
  if (error instanceof DurableIngestionError) {
    return error.retryable;
  }
  return new Set([
    "provider_outage",
    "rate_limit",
    "transient",
  ]).has(failureClass);
}

function sanitizeFailureReason(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown integration ingestion failure";
  return message
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gu, "Bearer [redacted]")
    .replace(/[A-Za-z0-9_-]{48,}/gu, "[redacted]")
    .slice(0, 500);
}

function chooseCheckpointStream(streams: readonly string[]): string {
  const [stream] = streams;
  if (!stream) {
    throw new DurableIngestionError("Integration job has no streams", {
      failureClass: "validation",
      retryable: false,
    });
  }
  return stream;
}

function jobContext(input: DurableIngestionRunInput): JobStateContext {
  return {
    tenantId: input.payload.tenantId,
    workspaceId: input.payload.workspaceId,
    syncJobId: input.payload.jobId,
  };
}

function emptyResult(
  status: "cancelled" | "not_leased",
  jobId: string,
): DurableIngestionRunResult {
  return {
    status,
    jobId,
    sourceBatchId: null,
    fetchedCount: 0,
    persistedSourceCount: 0,
    normalizedCount: 0,
    canonicalCount: 0,
    duplicateCount: 0,
    checkpoint: null,
  };
}

function partialCancelledResult(
  jobId: string,
  persisted: DurablePersistFetchedPageResult,
  normalizedCount = 0,
  canonicalCount = 0,
): DurableIngestionRunResult {
  return {
    status: "cancelled",
    jobId,
    sourceBatchId: persisted.sourceBatchId,
    fetchedCount: persisted.fetchedCount,
    persistedSourceCount: persisted.persistedSourceCount,
    normalizedCount,
    canonicalCount,
    duplicateCount: persisted.duplicateCount,
    checkpoint: null,
  };
}
