import assert from "node:assert/strict";
import { test } from "node:test";
import { commandCenterContractData } from "./contract-runtime.service.ts";
import type { CommandCenterDataSource } from "./command-center-metrics.real-source.ts";

const tenantId = "tenant_contract_runtime";
const workspaceId = "workspace_contract_runtime";
const generatedAt = "2026-08-25T10:00:00.000Z";
const dateRange = {
  from: "2026-08-01",
  preset: "monthToDate",
  timezone: "Europe/Warsaw",
  to: "2026-08-25",
};
const repositorySummary = {
  generatedAt,
  readiness: "ready",
  integrationStreams: [{ latest: generatedAt, records: 10, stream: "orders" }],
  domainCounts: [],
};

test("Command Center section endpoints do not build full KPI records before their own data", async () => {
  const canonicalReads: string[][] = [];
  const source: CommandCenterDataSource = {
    async readMetricEngineInputRows() {
      throw new Error("funnel must not build a metric-engine input for KPI records");
    },
    async listCanonicalRecords(_tenantId, _workspaceId, input) {
      canonicalReads.push([...input.streams]);
      return [];
    },
    async listConnections() {
      throw new Error("funnel must not read KPI metadata");
    },
    async listSyncCheckpoints() {
      throw new Error("funnel must not read KPI checkpoints");
    },
    async latestReconciliationRun() {
      throw new Error("funnel must not read reconciliation state for KPI records");
    },
    async listOpenDataIssues() {
      throw new Error("funnel must not read data issues for KPI records");
    },
  };

  const result = await commandCenterContractData(
    "command-center.funnel.read",
    repositorySummary,
    dateRange,
    tenantId,
    workspaceId,
    source,
  ) as {
    readonly pageInfo: { readonly total: number };
    readonly records: readonly { readonly label: string }[];
    readonly steps: readonly unknown[];
  };

  assert.deepEqual(canonicalReads, [["traffic"]]);
  assert.equal(result.pageInfo.total, 2, "section envelopes should contain only cheap source-readiness records");
  assert.deepEqual(result.records.map((record) => record.label), [
    "Strumienie integracji",
    "Domeny z danymi",
  ]);
  assert.deepEqual(result.steps, []);
});

test("Command Center recommendation endpoints still build KPI records because recommendations depend on them", async () => {
  let metricInputReads = 0;
  let trafficReads = 0;
  const source: CommandCenterDataSource = {
    async readMetricEngineInputRows() {
      metricInputReads += 1;
      return {
        canonicalRows: [],
        catalogRows: [],
        connectionRows: [],
        checkpointRows: [],
        reconciliationRun: null,
        openIssueRows: [],
      };
    },
    async listCanonicalRecords(_tenantId, _workspaceId, input) {
      if (input.streams.length === 1 && input.streams[0] === "traffic") {
        trafficReads += 1;
        return [];
      }
      throw new Error(`unexpected canonical read: ${input.streams.join(",")}`);
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

  const result = await commandCenterContractData(
    "command-center.ai-recommendations.read",
    repositorySummary,
    dateRange,
    tenantId,
    workspaceId,
    source,
  ) as {
    readonly committedActions: readonly unknown[];
    readonly pageInfo: { readonly total: number };
    readonly records: readonly { readonly label: string }[];
  };

  assert.equal(metricInputReads, 1);
  assert.equal(trafficReads, 2);
  assert.equal(result.pageInfo.total, 11);
  assert.ok(result.records.some((record) => record.label === "Przychód netto"));
  assert.equal(result.committedActions.length, 3);
});
