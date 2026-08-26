import assert from "node:assert/strict";
import { test } from "node:test";
import type { CommandCenterRecord } from "../../../../../../contracts/api-schemas.ts";
import {
  buildExecutiveKpiRecords,
  commandCenterOnePageSectionIds,
  resolveMetricFreshnessLabel,
  resolveMetricSourceLabel,
} from "./commandCenterOnePageModel.ts";

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

test("resolveMetricFreshnessLabel reads the real lastSuccessfulSyncAt checkpoint over the generic readiness guess", () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000).toISOString();
  const withCheckpoint = { ...record("m", "Przychód", 1_000), lastSuccessfulSyncAt: fiveMinutesAgo };

  const label = resolveMetricFreshnessLabel(withCheckpoint);

  assert.match(label, /temu$/);
  assert.notEqual(label, "świeże źródła");
});

test("resolveMetricFreshnessLabel falls back to the generic readiness label when there is no real checkpoint", () => {
  const withoutCheckpoint = record("m", "Przychód", 1_000);

  assert.equal(resolveMetricFreshnessLabel(withoutCheckpoint), "świeże źródła");
});

test("resolveMetricFreshnessLabel ignores a stale lastSuccessfulSyncAt from a non-ready record", () => {
  // readiness !== 'ready' still takes the switch's own branch — a checkpoint
  // on a stale/partial/unavailable record must not be read as "fresh".
  const stale = { ...record("m", "Przychód", 1_000), lastSuccessfulSyncAt: new Date().toISOString(), readiness: "stale" as const };

  assert.equal(resolveMetricFreshnessLabel(stale), "wymaga odświeżenia");
});

test("resolveMetricSourceLabel prefers real providers over guessing from the label text", () => {
  const woo = { ...record("m", "Przychód", 1_000), providers: ["woocommerce"] };
  const ads = { ...record("m", "ROAS blended", 4, "ratio"), providers: ["google_ads", "meta_ads"] };

  assert.equal(resolveMetricSourceLabel(woo), "WooCommerce");
  assert.equal(resolveMetricSourceLabel(ads), "Google Ads + Meta Ads");
});

test("resolveMetricSourceLabel falls back to label-text guessing when providers are absent", () => {
  const withoutProviders = record("m", "Ruch GA4", 1_000);

  assert.equal(resolveMetricSourceLabel(withoutProviders), "GA4");
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
    "command-section-products",
    "command-section-traffic",
    "command-section-customers",
  ]);
});
