import assert from "node:assert/strict";
import test from "node:test";
import type {
  IntegrationProviderAdapter,
  ProviderFetchRequest,
  ProviderFetchResult,
  ProviderRecord,
} from "@papadata/integrations";
import {
  DurableIngestionError,
  DurableIngestionPipeline,
  assertAllowedJobTransition,
  canTransitionJobState,
  type DurableIngestionRepository,
  type DurableIntegrationJobState,
} from "./ingestion-pipeline.js";
import type { IntegrationJobPayload } from "./worker.service.js";

test("A04 state machine allows only explicit durable transitions", () => {
  assert.equal(canTransitionJobState("queued", "leased"), true);
  assert.equal(canTransitionJobState("leased", "fetching"), true);
  assert.equal(canTransitionJobState("reconciling", "succeeded"), true);
  assert.equal(canTransitionJobState("fetching", "succeeded"), false);
  assert.equal(canTransitionJobState("succeeded", "fetching"), false);
  assert.throws(
    () => assertAllowedJobTransition("fetching", "succeeded"),
    DurableIngestionError,
  );
});

test("A04 pipeline persists source, checkpoint, normalization, canonical records and reconciliation before success", async () => {
  const repository = new InMemoryDurableRepository();
  const adapter = new FakeAdapter({
    records: [
      providerRecord("orders", "order-1"),
      providerRecord("orders", "order-2"),
    ],
    nextCheckpoint: "cursor-1",
  });
  const result = await runPipeline(repository, adapter);

  assert.equal(result.status, "succeeded");
  assert.equal(repository.state, "succeeded");
  assert.equal(repository.sourceRecords.size, 2);
  assert.equal(repository.normalizedRecords.size, 2);
  assert.equal(repository.canonicalRecords.size, 2);
  assert.equal(repository.reconciliations.at(-1)?.status, "passed");
  assert.equal(repository.checkpoints.get("orders"), "cursor-1");
  assert.deepEqual(adapter.receivedCheckpoints, [null]);
});

test("A04 resume reads the persisted checkpoint and retry is idempotent", async () => {
  const repository = new InMemoryDurableRepository();
  const firstAdapter = new FakeAdapter({
    records: [
      providerRecord("orders", "order-1"),
      providerRecord("orders", "order-2"),
    ],
    nextCheckpoint: "cursor-1",
  });
  await runPipeline(repository, firstAdapter, jobPayload({ jobId: "job-a" }));

  repository.resetForJob("job-b");
  const retryAdapter = new FakeAdapter({
    records: [
      providerRecord("orders", "order-1"),
      providerRecord("orders", "order-2"),
    ],
    nextCheckpoint: "cursor-2",
  });
  const result = await runPipeline(repository, retryAdapter, jobPayload({ jobId: "job-b" }));

  assert.equal(result.status, "succeeded");
  assert.deepEqual(retryAdapter.receivedCheckpoints, ["cursor-1"]);
  assert.equal(repository.sourceRecords.size, 2);
  assert.equal(result.duplicateCount, 2);
  assert.equal(repository.checkpoints.get("orders"), "cursor-2");
});

test("A04 two workers competing for one job allow only one lease", async () => {
  const repository = new InMemoryDurableRepository();
  const first = runPipeline(
    repository,
    new FakeAdapter({
      records: [providerRecord("orders", "order-1")],
      nextCheckpoint: "cursor-1",
      delayMs: 20,
    }),
  );
  const second = runPipeline(
    repository,
    new FakeAdapter({
      records: [providerRecord("orders", "order-1")],
      nextCheckpoint: "cursor-1",
    }),
    jobPayload(),
    "worker-b",
  );

  const results = await Promise.all([first, second]);

  assert.deepEqual(
    results.map((result) => result.status).sort(),
    ["not_leased", "succeeded"],
  );
  assert.equal(repository.sourceRecords.size, 1);
});

test("A04 reconciliation blocks false-green succeeded when canonical write count is short", async () => {
  const repository = new InMemoryDurableRepository({ canonicalDropCount: 1 });
  const adapter = new FakeAdapter({
    records: [
      providerRecord("orders", "order-1"),
      providerRecord("orders", "order-2"),
    ],
    nextCheckpoint: "cursor-1",
  });

  await assert.rejects(
    () => runPipeline(repository, adapter),
    DurableIngestionError,
  );

  assert.equal(repository.state, "retryable_failed");
  assert.notEqual(repository.state, "succeeded");
  assert.equal(repository.failures.at(-1)?.failureClass, "validation");
});

test("A04 cancellation is durable and cannot become succeeded", async () => {
  const repository = new InMemoryDurableRepository({ cancelRequested: true });
  const adapter = new FakeAdapter({
    records: [providerRecord("orders", "order-1")],
    nextCheckpoint: "cursor-1",
  });
  const result = await runPipeline(repository, adapter);

  assert.equal(result.status, "cancelled");
  assert.equal(repository.state, "cancelled");
  assert.equal(adapter.receivedCheckpoints.length, 0);
});

test("A04 empty provider page without persisted data is not a success", async () => {
  const repository = new InMemoryDurableRepository();
  const adapter = new FakeAdapter({
    records: [],
    nextCheckpoint: null,
  });

  await assert.rejects(
    () => runPipeline(repository, adapter),
    DurableIngestionError,
  );

  assert.equal(repository.state, "retryable_failed");
  assert.equal(repository.sourceRecords.size, 0);
});

async function runPipeline(
  repository: InMemoryDurableRepository,
  adapter: FakeAdapter,
  payload = jobPayload(),
  leaseOwner = "worker-a",
) {
  const pipeline = new DurableIngestionPipeline({
    repository,
    clock: fixedClock(),
  });
  return pipeline.run({
    payload,
    adapterFactory: async () => adapter,
    attempt: 1,
    maxAttempts: 5,
    leaseOwner,
    correlationId: "correlation-a",
  });
}

class FakeAdapter implements IntegrationProviderAdapter {
  readonly providerId = "baselinker" as const;
  readonly requiredScopes = ["api"] as const;
  readonly optionalScopes = [] as const;
  readonly receivedCheckpoints: (string | null)[] = [];
  private readonly result: ProviderFetchResult;
  private readonly delayMs: number;

  constructor(input: {
    readonly records: readonly ProviderRecord[];
    readonly nextCheckpoint: string | null;
    readonly partial?: boolean;
    readonly delayMs?: number;
  }) {
    this.result = {
      records: input.records,
      nextCheckpoint: input.nextCheckpoint,
      partial: input.partial ?? false,
      limitations: [],
    };
    this.delayMs = input.delayMs ?? 0;
  }

  isConfigured(): boolean {
    return true;
  }

  async verifyConnection(): Promise<void> {}

  async fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult> {
    this.receivedCheckpoints.push(request.checkpoint);
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
    return this.result;
  }
}

class InMemoryDurableRepository implements DurableIngestionRepository {
  state: DurableIntegrationJobState = "queued";
  readonly checkpoints = new Map<string, string>();
  readonly sourceRecords = new Map<string, {
    readonly batchId: string;
    readonly record: ProviderRecord;
  }>();
  readonly normalizedRecords = new Map<string, string>();
  readonly canonicalRecords = new Map<string, string>();
  readonly reconciliations: {
    readonly status: "failed" | "passed" | "partial";
    readonly failureReason: string | null;
  }[] = [];
  readonly failures: {
    readonly failureClass: string;
    readonly failureReason: string;
    readonly status: string;
  }[] = [];
  private readonly canonicalDropCount: number;
  private cancelRequested: boolean;
  private leaseOwner: string | null = null;
  private batchCounter = 0;
  private activeJobId = "job-a";

  constructor(input: {
    readonly canonicalDropCount?: number;
    readonly cancelRequested?: boolean;
  } = {}) {
    this.canonicalDropCount = input.canonicalDropCount ?? 0;
    this.cancelRequested = input.cancelRequested ?? false;
  }

  resetForJob(jobId: string): void {
    this.state = "queued";
    this.leaseOwner = null;
    this.activeJobId = jobId;
    this.cancelRequested = false;
  }

  async acquireLease(input: {
    readonly syncJobId: string;
    readonly leaseOwner: string;
  }): Promise<boolean> {
    if (input.syncJobId !== this.activeJobId || this.state !== "queued") {
      return false;
    }
    this.state = "leased";
    this.leaseOwner = input.leaseOwner;
    return true;
  }

  async transitionJobState(input: {
    readonly leaseOwner: string;
    readonly fromState: string;
    readonly toState: string;
  }): Promise<boolean> {
    if (this.leaseOwner !== input.leaseOwner || this.state !== input.fromState) {
      return false;
    }
    this.state = input.toState as DurableIntegrationJobState;
    return true;
  }

  async isCancelRequested(): Promise<boolean> {
    return this.cancelRequested;
  }

  async readCheckpoint(input: { readonly stream: string }): Promise<string | null> {
    return this.checkpoints.get(input.stream) ?? null;
  }

  async persistFetchedPage(input: {
    readonly checkpointStream: string;
    readonly fetchedRecords: readonly ProviderRecord[];
    readonly nextCheckpoint: string | null;
  }) {
    this.batchCounter += 1;
    const sourceBatchId = `batch-${this.batchCounter}`;
    let duplicateCount = 0;

    for (const record of input.fetchedRecords) {
      const key = `${record.stream}:${record.externalId}`;
      if (this.sourceRecords.has(key)) {
        duplicateCount += 1;
      }
      this.sourceRecords.set(key, { batchId: sourceBatchId, record });
    }

    if (input.nextCheckpoint !== null) {
      this.checkpoints.set(input.checkpointStream, input.nextCheckpoint);
    }

    return {
      sourceBatchId,
      fetchedCount: input.fetchedRecords.length,
      persistedSourceCount: input.fetchedRecords.length,
      duplicateCount,
    };
  }

  async normalizeBatch(input: { readonly sourceBatchId: string }) {
    let count = 0;
    for (const [key, value] of this.sourceRecords.entries()) {
      if (value.batchId === input.sourceBatchId) {
        this.normalizedRecords.set(key, input.sourceBatchId);
        count += 1;
      }
    }
    return { count };
  }

  async writeCanonicalRecords(input: { readonly sourceBatchId: string }) {
    const keys = [...this.normalizedRecords.entries()]
      .filter(([, batchId]) => batchId === input.sourceBatchId)
      .map(([key]) => key);
    const writableKeys = keys.slice(0, Math.max(0, keys.length - this.canonicalDropCount));
    for (const key of writableKeys) {
      this.canonicalRecords.set(key, input.sourceBatchId);
    }
    return { count: writableKeys.length };
  }

  async writeReconciliation(input: {
    readonly fetchedCount: number;
    readonly persistedSourceCount: number;
    readonly normalizedCount: number;
    readonly canonicalCount: number;
  }) {
    const status: "failed" | "passed" = input.fetchedCount > 0
      && input.fetchedCount === input.persistedSourceCount
      && input.persistedSourceCount === input.normalizedCount
      && input.normalizedCount === input.canonicalCount
      ? "passed"
      : "failed";
    const failureReason = status === "passed"
      ? null
      : `fetched=${input.fetchedCount} source=${input.persistedSourceCount} normalized=${input.normalizedCount} canonical=${input.canonicalCount}`;
    this.reconciliations.push({ status, failureReason });
    return {
      reconciliationRunId: `reconciliation-${this.reconciliations.length}`,
      status,
      failureReason,
    };
  }

  async finalizeSucceeded(): Promise<boolean> {
    if (
      this.state !== "reconciling"
      || this.reconciliations.at(-1)?.status !== "passed"
    ) {
      return false;
    }
    this.state = "succeeded";
    return true;
  }

  async markCancelled(): Promise<void> {
    this.state = "cancelled";
  }

  async markFailed(input: {
    readonly status: "dead_lettered" | "retryable_failed" | "terminal_failed";
    readonly failureClass: string;
    readonly failureReason: string;
  }): Promise<void> {
    this.state = input.status;
    this.failures.push(input);
  }
}

function jobPayload(overrides: Partial<IntegrationJobPayload> = {}): IntegrationJobPayload {
  return {
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    jobId: "job-a",
    connectionId: "connection-a",
    providerId: "baselinker",
    operation: "incremental_sync",
    streams: ["orders"],
    from: null,
    to: null,
    ...overrides,
  };
}

function providerRecord(stream: string, externalId: string): ProviderRecord {
  return {
    stream,
    externalId,
    observedAt: "2026-07-22T10:00:00.000Z",
    payload: {
      id: externalId,
      total: "100.00",
      currency: "PLN",
    },
  };
}

function fixedClock(): () => Date {
  let tick = 0;
  return () => {
    tick += 1;
    return new Date(1_784_715_000_000 + tick * 1000);
  };
}
