import assert from "node:assert/strict";
import { test } from "node:test";
import type { CommandCenterRecord } from "../../../../../../contracts/api-schemas.ts";
import { buildExecutiveKpiRecords, commandCenterOnePageSectionIds } from "./commandCenterOnePageModel.ts";

function record(
  metricId: string,
  label: string,
  value: number,
  unit: CommandCenterRecord["unit"] = "currency",
): CommandCenterRecord {
  return {
    delta: null,
    label,
    metricId,
    readiness: "ready",
    target: null,
    unit,
    value,
  };
}

test("buildExecutiveKpiRecords reads ad spend from a canonical ad_spend record, not revenue / ROAS", () => {
  const records: readonly CommandCenterRecord[] = [
    record("m-revenue", "Przychód netto", 10_000),
    record("m-roas", "ROAS blended", 5, "ratio"),
    record("m-ad-spend", "Koszt reklamy", 1_234),
    record("m-orders", "Liczba zamówień", 40, "number"),
  ];

  const kpis = buildExecutiveKpiRecords(records);
  const adCost = kpis.find((entry) => entry.metricId === "command-kpi-ad-cost");

  assert.ok(adCost, "expected an ad cost KPI to be derived");
  // The old bug computed this as revenue / roas = 10000 / 5 = 2000. The
  // canonical ad_spend record (1234) must win instead.
  assert.equal(adCost?.value, 1_234);
});

test("buildExecutiveKpiRecords does not show an ad cost KPI when no canonical ad_spend record exists", () => {
  const records: readonly CommandCenterRecord[] = [
    record("m-revenue", "Przychód netto", 10_000),
    record("m-roas", "ROAS blended", 5, "ratio"),
  ];

  const kpis = buildExecutiveKpiRecords(records);
  const adCost = kpis.find((entry) => entry.metricId === "command-kpi-ad-cost");

  // Nothing invented: without a real ad_spend record, the KPI simply does
  // not appear rather than falling back to revenue / roas.
  assert.equal(adCost, undefined);
});

test("buildExecutiveKpiRecords prefers a canonical aov record over the revenue/orders identity", () => {
  const records: readonly CommandCenterRecord[] = [
    record("m-revenue", "Przychód netto", 10_000),
    record("m-orders", "Liczba zamówień", 40, "number"),
    record("m-aov", "AOV", 300),
  ];

  const kpis = buildExecutiveKpiRecords(records);
  const aov = kpis.find((entry) => entry.metricId === "command-kpi-aov");

  // revenue / orders would be 250; the canonical aov record (300) must win.
  assert.equal(aov?.value, 300);
});

test("buildExecutiveKpiRecords never derives AOV from net revenue/orders when the canonical AOV is absent", () => {
  const records: readonly CommandCenterRecord[] = [
    record("m-revenue", "Przychód netto", 10_000),
    record("m-orders", "Liczba zamówień", 40, "number"),
  ];

  const kpis = buildExecutiveKpiRecords(records);
  const aov = kpis.find((entry) => entry.metricId === "command-kpi-aov");

  assert.equal(aov, undefined);
});

test("buildExecutiveKpiRecords never derives CPA from ad spend divided by all store orders", () => {
  const records: readonly CommandCenterRecord[] = [
    record("m-ad-spend", "Koszt reklamy", 1_000),
    record("m-orders", "Liczba zamówień", 100, "number"),
  ];

  const kpis = buildExecutiveKpiRecords(records);
  const cpa = kpis.find((entry) => entry.metricId === "command-kpi-cpa");

  assert.equal(cpa, undefined);
});

test("buildExecutiveKpiRecords maps an explicit canonical CPA record, including unavailable state", () => {
  const canonicalCpa: CommandCenterRecord = {
    ...record("m-cpa", "CPA", 0),
    readiness: "unavailable",
  };

  const kpis = buildExecutiveKpiRecords([canonicalCpa]);
  const cpa = kpis.find((entry) => entry.metricId === "command-kpi-cpa");

  assert.equal(cpa?.value, 0);
  assert.equal(cpa?.readiness, "unavailable");
});

test("commandCenterOnePageSectionIds defines the complete one-page runtime order", () => {
  // Regression test for a real bug: the runtime one-page (CommandCenterOnePage)
  // and its section nav rail (CommandCenterWorkspace) previously hardcoded
  // independent, out-of-sync lists. Both are now built from this single array.
  assert.deepEqual(commandCenterOnePageSectionIds, [
    "command-section-kpi",
    "command-section-plan",
    "command-section-drivers",
    "command-section-funnel",
    "command-section-traffic",
    "command-section-products",
    "command-section-customers",
  ]);
});
