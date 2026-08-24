import assert from "node:assert/strict";
import { test } from "node:test";
import { CommandCenterMetricInputDataSource } from "./command-center-metric-input-data-source.ts";
import type { CommandCenterDataSource } from "./command-center-metrics.real-source.ts";

const tenantId = "tenant_metric_input";
const workspaceId = "workspace_metric_input";
const periodStart = "2026-08-01T00:00:00.000Z";
const generatedAt = "2026-08-25T10:00:00.000Z";
const historicalPeriodEnd = "2026-08-24T00:00:00.000Z";

function emptyMetricInputRows(): Awaited<ReturnType<NonNullable<CommandCenterDataSource["readMetricEngineInputRows"]>>> {
  return {
    canonicalRows: [],
    catalogRows: [],
    connectionRows: [],
    checkpointRows: [],
    reconciliationRun: null,
    openIssueRows: [],
  };
}

function passThroughSource(): CommandCenterDataSource {
  return {
    async listCanonicalRecords() {
      return [];
    },
    async listConnections() {
      return [];
    },
    async listSyncCheckpoints() {
      return [];
    },
    async latestReconciliationRun() {
      return null;
    },
    async listOpenDataIssues() {
      return [];
    },
  };
}

test("coalesces only in-flight live MetricEngineInput builds for the same business window", async () => {
  let underlyingReads = 0;
  let releaseRead!: () => void;
  const gate = new Promise<void>((resolve) => {
    releaseRead = resolve;
  });
  const source: CommandCenterDataSource = {
    ...passThroughSource(),
    async readMetricEngineInputRows() {
      underlyingReads += 1;
      await gate;
      return emptyMetricInputRows();
    },
  };
  const dataSource = new CommandCenterMetricInputDataSource(source);
  const requestA = {
    generatedAt: "2026-08-25T10:00:00.001Z" as any,
    periodEnd: "2026-08-25T10:00:00.001Z" as any,
    periodStart: periodStart as any,
    tenantId,
    timezone: "Europe/Warsaw",
    workspaceId,
  };
  const requestB = {
    ...requestA,
    generatedAt: "2026-08-25T10:00:00.025Z" as any,
    periodEnd: "2026-08-25T10:00:00.025Z" as any,
  };

  const first = dataSource.createMetricEngineInput(requestA);
  const second = dataSource.createMetricEngineInput(requestB);

  assert.equal(underlyingReads, 1, "concurrent live windows should share one underlying input read");

  releaseRead();

  const [firstInput, secondInput] = await Promise.all([first, second]);
  assert.strictEqual(firstInput, secondInput);

  await dataSource.createMetricEngineInput(requestA);
  assert.equal(underlyingReads, 2, "completed input builds must not remain cached");
});

test("does not coalesce live MetricEngineInput builds with different period starts", async () => {
  let underlyingReads = 0;
  const source: CommandCenterDataSource = {
    ...passThroughSource(),
    async readMetricEngineInputRows() {
      underlyingReads += 1;
      return emptyMetricInputRows();
    },
  };
  const dataSource = new CommandCenterMetricInputDataSource(source);
  const baseRequest = {
    generatedAt: generatedAt as any,
    periodEnd: generatedAt as any,
    periodStart: periodStart as any,
    tenantId,
    timezone: "Europe/Warsaw",
    workspaceId,
  };

  await Promise.all([
    dataSource.createMetricEngineInput(baseRequest),
    dataSource.createMetricEngineInput({
      ...baseRequest,
      periodStart: "2026-08-02T00:00:00.000Z" as any,
    }),
  ]);

  assert.equal(underlyingReads, 2, "different live period starts must not share one underlying read");
});

test("does not coalesce historical MetricEngineInput builds with different period ends", async () => {
  let underlyingReads = 0;
  const source: CommandCenterDataSource = {
    ...passThroughSource(),
    async readMetricEngineInputRows() {
      underlyingReads += 1;
      return emptyMetricInputRows();
    },
  };
  const dataSource = new CommandCenterMetricInputDataSource(source);
  const baseRequest = {
    generatedAt: generatedAt as any,
    periodEnd: historicalPeriodEnd as any,
    periodStart: periodStart as any,
    tenantId,
    timezone: "Europe/Warsaw",
    workspaceId,
  };

  await Promise.all([
    dataSource.createMetricEngineInput(baseRequest),
    dataSource.createMetricEngineInput({
      ...baseRequest,
      periodEnd: "2026-08-23T00:00:00.000Z" as any,
    }),
  ]);

  assert.equal(underlyingReads, 2, "historical period ends must keep separate underlying reads");
});
