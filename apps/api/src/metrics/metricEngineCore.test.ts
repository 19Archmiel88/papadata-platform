import type { IsoDateTime } from "@papadata/contracts";
import { defaultReportConfig } from "@papadata/contracts/saved-reports";
import { describe, expect, it } from "vitest";
import {
  buildCommandCenterKpiOverrides,
} from "../production/contract-runtime/command-center-metrics.contract-data.ts";
import type { CommandCenterDataSource } from "../production/contract-runtime/command-center-metrics.real-source.ts";
import { projectLiveReport } from "../production/reports/saved-reports.snapshot.ts";
import {
  buildMetricSnapshotRecords,
  centsToDecimal,
  computeMetricEngineSeries,
  createMetricEngineInput,
  createMetricEngineSeriesInput,
  decimalToCents,
  metricDefinitions,
  type DashboardMetricCode,
  type MetricEngineInput,
} from "./metricEngineCore.ts";

// P0-01 (docs/specyfikacja-docelowa/26-priorytety-p0/01-katalog-58-metryk.md)
// requires: "58/58 definicji" (covered by metricCatalogParity.test.ts --
// deliberately not duplicated here), "testy formul", "zero/no-data/partial/
// stale/invalid" and "zgodnosc snapshotu Dashboard-raport-AI".

describe("metricDefinitions formulas match their own documented test vectors", () => {
  // Representative of the formula *shapes* the spec asks for, not all 28:
  // ad_spend is a plain SUM, revenue_after_refunds is a derived subtraction
  // of two other metrics, roas and aov are ratios (count/count and
  // money/count respectively). Each MetricDefinitionRecord already embeds
  // its own "prompt7-ready-fixture" testVectors[0] (see the `definition()`
  // helper in metricEngineCore.ts) but nothing ever executed the engine
  // against it before this test -- it turns that dormant documentation into
  // a real regression check instead of hand-deriving expected numbers here.
  const representative: readonly DashboardMetricCode[] = [
    "ad_spend",
    "revenue_after_refunds",
    "roas",
    "aov",
  ];

  it.each(representative)("%s: runtime output matches its documented fixture vector", (code) => {
    const metricDefinition = metricDefinitions.find((candidate) => candidate.metricCode === code);
    if (!metricDefinition) {
      throw new Error(`No MetricDefinitionRecord for ${code}`);
    }
    const vector = metricDefinition.testVectors[0];
    if (!vector) {
      throw new Error(`No documented test vector for ${code}`);
    }

    const [record] = buildMetricSnapshotRecords(createMetricEngineInput(), [code]);

    expect(record?.readiness).toBe(vector.expectedReadiness);
    expect(record?.value).toBe(vector.expectedValue);
  });
});

describe("period-over-period comparison (e.g. week-over-week dashboard deltas)", () => {
  // Splits one 14-day synthetic fact set into two disjoint 7-day windows and
  // recomputes independently over each -- the same technique real
  // comparison-period code (buildCommandCenterPlanPerformanceData's
  // current/previous split, weekOverWeekDelta) relies on. Rather than
  // hardcoding an expected number (re-deriving business logic in the test),
  // this asserts additivity: summing the two disjoint half-window totals
  // must equal the one full-window total exactly, using the engine's own
  // exported decimalToCents/centsToDecimal for the addition so there is no
  // floating point drift and no re-implementation of any filtering/business
  // rule under test.
  const days = 14;
  const seriesInput = createMetricEngineSeriesInput({ days });
  const startMs = Date.parse(seriesInput.periodStart);
  const endMs = Date.parse(seriesInput.periodEnd);
  const midMs = startMs + (endMs - startMs) / 2;
  const firstHalf: MetricEngineInput = {
    ...seriesInput,
    periodEnd: new Date(midMs).toISOString() as IsoDateTime,
  };
  const secondHalf: MetricEngineInput = {
    ...seriesInput,
    periodStart: new Date(midMs).toISOString() as IsoDateTime,
  };

  it("ad_spend (money) is exactly additive across two adjacent sub-periods", () => {
    const full = computeMetricEngineSeries(seriesInput, ["ad_spend"], { includeDaily: false });
    const first = computeMetricEngineSeries(firstHalf, ["ad_spend"], { includeDaily: false });
    const second = computeMetricEngineSeries(secondHalf, ["ad_spend"], { includeDaily: false });

    expect(full.readiness.ad_spend).toBe("ready");
    expect(first.readiness.ad_spend).toBe("ready");
    expect(second.readiness.ad_spend).toBe("ready");

    const firstCents = decimalToCents(first.aggregate.ad_spend as string);
    const secondCents = decimalToCents(second.aggregate.ad_spend as string);
    const fullCents = decimalToCents(full.aggregate.ad_spend as string);

    expect(centsToDecimal(firstCents + secondCents)).toBe(centsToDecimal(fullCents));
    // Genuinely period-sensitive (not a cached/constant value): the
    // synthetic series' day-of-week + trend curve makes the two halves
    // differ in practice.
    expect(first.aggregate.ad_spend).not.toBe(second.aggregate.ad_spend);
  });

  it("orders (count) is exactly additive across two adjacent sub-periods", () => {
    const full = computeMetricEngineSeries(seriesInput, ["orders"], { includeDaily: false });
    const first = computeMetricEngineSeries(firstHalf, ["orders"], { includeDaily: false });
    const second = computeMetricEngineSeries(secondHalf, ["orders"], { includeDaily: false });

    expect(Number(first.aggregate.orders) + Number(second.aggregate.orders)).toBe(Number(full.aggregate.orders));
  });
});

describe("readiness semantics: never a false zero", () => {
  // The engine already implements this (confirmed in metricEngineCore.ts:
  // calculateMetric's early returns around the no_data/invalid branches,
  // and unavailable() at the bottom of the file) -- these tests confirm
  // that existing behaviour rather than re-implementing it.

  it("no_data: missing canonical facts return value=null (never a false zero)", () => {
    const input = createMetricEngineInput({ noData: true });
    const [record] = buildMetricSnapshotRecords(input, ["ad_spend"]);

    expect(record?.value).toBeNull();
    expect(record?.readiness).toBe("no_data");
    expect(record?.reasonCodes).toContain("NO_DATA");
  });

  it("invalid: a reconciliation mismatch blocks the value even though the underlying facts exist", () => {
    const input = createMetricEngineInput({ invalid: true });
    // Sanity: this is not secretly a no_data case -- the facts are there.
    expect(input.canonicalAdSpend.length).toBeGreaterThan(0);

    const [record] = buildMetricSnapshotRecords(input, ["ad_spend"]);

    expect(record?.value).toBeNull();
    expect(record?.readiness).toBe("invalid");
    expect(record?.reasonCodes).toContain("INVALID_RECONCILIATION");
  });

  it("partial: open data issues degrade readiness but keep the real computed value visible", () => {
    const partialInput = createMetricEngineInput({ partial: true });
    const readyInput = createMetricEngineInput();
    const [partialRecord] = buildMetricSnapshotRecords(partialInput, ["ad_spend"]);
    const [readyRecord] = buildMetricSnapshotRecords(readyInput, ["ad_spend"]);

    expect(partialRecord?.readiness).toBe("partial");
    expect(partialRecord?.value).not.toBeNull();
    expect(partialRecord?.value).toBe(readyRecord?.value);
  });

  it("stale: sync checkpoints past the freshness threshold degrade readiness but keep the value", () => {
    const staleInput = createMetricEngineInput({ stale: true });
    const readyInput = createMetricEngineInput();
    const [staleRecord] = buildMetricSnapshotRecords(staleInput, ["ad_spend"]);
    const [readyRecord] = buildMetricSnapshotRecords(readyInput, ["ad_spend"]);

    expect(staleRecord?.readiness).toBe("stale");
    expect(staleRecord?.reasonCodes).toContain("STALE_CANONICAL_FACTS");
    expect(staleRecord?.value).not.toBeNull();
    expect(staleRecord?.value).toBe(readyRecord?.value);
  });

  it("confirmed zero: a real zero is reported honestly, distinct from no_data", () => {
    const base = createMetricEngineInput();
    // A refund with no logged physical return (e.g. a shipping-fee-only
    // refund) is a legitimate, real scenario: hasRequiredData for
    // returned_units is satisfied by refunds OR returns, so this is
    // "ready" with a genuine 0 -- not "no_data".
    const input: MetricEngineInput = { ...base, canonicalCustomerReturns: [] };
    expect(input.canonicalRefunds.length).toBeGreaterThan(0);

    const [record] = buildMetricSnapshotRecords(input, ["returned_units"]);

    expect(record?.readiness).toBe("ready");
    expect(record?.value).toBe("0");
  });
});

describe("Dashboard/Report snapshot consistency", () => {
  // AI: verified (repo-wide search for metricEngineCore/computeMetricEngineSeries/
  // dashboardMetricCodes/app.metric_snapshots across apps/api/src) that there is
  // currently NO AI consumer of the Metric Engine at all -- apps/api/src/production/
  // assistant-workspace and contract-runtime/papa-conversation.real-source.ts never
  // call into metricEngineCore.ts or read app.metric_snapshots. The one place that
  // even mentions MetricSnapshotWriter in that area is a doc-comment noting it
  // follows "the same convention", not an actual dependency. This is a real,
  // reportable gap (see task summary) rather than something coverable by a test --
  // only Dashboard and Report are checked below.
  //
  // Dashboard (buildCommandCenterKpiOverrides) and Report (projectLiveReport) both
  // resolve their MetricEngineInput through createRealMetricEngineInput and then
  // compute through computeMetricEngineSeries -- the same shared functions in
  // metricEngineCore.ts (verified by reading both call sites). CommandCenterDataSource's
  // createMetricEngineInput hook is used here to feed both consumers the exact same
  // MetricEngineInput "from each one's own perspective" (Dashboard via the data
  // source it's given, Report by calling the pure projector directly), then their
  // real, exported, production entry points are compared -- not a re-implementation
  // of either.
  function fakeDataSource(input: MetricEngineInput): CommandCenterDataSource {
    return {
      createMetricEngineInput: async () => input,
      listCanonicalRecords: async () => [],
      listConnections: async () => [],
      listSyncCheckpoints: async () => [],
      latestReconciliationRun: async () => null,
      listOpenDataIssues: async () => [],
    };
  }

  it("revenue/ad spend/orders agree between the real Dashboard KPI path and the real Report path", async () => {
    const input = createMetricEngineInput();

    const kpi = await buildCommandCenterKpiOverrides(
      input.tenantId,
      input.workspaceId,
      input.generatedAt,
      fakeDataSource(input),
    );

    const reportConfig = {
      ...defaultReportConfig("overview"),
      from: input.periodStart.slice(0, 10),
      to: input.periodEnd.slice(0, 10),
    };
    const report = projectLiveReport(input, reportConfig);
    const reportValue = (id: string) => report.metrics.find((metric) => metric.id === id)?.value ?? null;

    expect(kpi.revenue.value).toBe(reportValue("revenue"));
    expect(kpi.adSpend.value).toBe(reportValue("marketingSpend"));
    expect(kpi.orders.value).toBe(reportValue("orders"));
    // Sanity: these are real, non-trivial numbers, not two sides both
    // silently reporting zero/null.
    expect(kpi.revenue.value).toBeGreaterThan(0);
  });
});
