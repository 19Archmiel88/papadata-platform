import assert from "node:assert/strict";
import { test } from "node:test";
import { commandCenterOnePageDataScreenIds, findBusinessScreenDefinition, mergeCommandCenterOnePageApiData } from "./businessData.ts";

test("Command Center one-page data contract always includes KPI, Plan and Drivers", () => {
  assert.deepEqual(commandCenterOnePageDataScreenIds, ["30.03", "30.04", "30.05"]);
});

test("findBusinessScreenDefinition resolves each command-center deep link to its own screen, not 30.01", () => {
  const kpi = findBusinessScreenDefinition("/app/command-center/kpi");
  assert.ok(kpi, "expected a definition for /app/command-center/kpi");
  assert.equal(kpi?.id, "30.03");

  const planVsWynik = findBusinessScreenDefinition("/app/command-center/plan-vs-wynik");
  assert.ok(planVsWynik);
  assert.equal(planVsWynik?.id, "30.04");

  const drivers = findBusinessScreenDefinition("/app/command-center/drivery-wyniku");
  assert.ok(drivers);
  assert.equal(drivers?.id, "30.05");
});

test("findBusinessScreenDefinition also resolves a trailing sub-path (e.g. a detail record) under a screen route", () => {
  const definition = findBusinessScreenDefinition("/app/command-center/kpi/some-record-id");
  assert.ok(definition, "expected the parent screen definition for a nested detail path");
  assert.equal(definition?.id, "30.03");
});

test("findBusinessScreenDefinition resolves by screen id directly", () => {
  const definition = findBusinessScreenDefinition("30.04");
  assert.ok(definition);
  assert.equal(definition?.route, "/app/command-center/plan-vs-wynik");
});

test("findBusinessScreenDefinition returns null for an unknown path", () => {
  assert.equal(findBusinessScreenDefinition("/app/does-not-exist"), null);
});


test("mergeCommandCenterOnePageApiData composes KPI, Plan and Drivers without synthetic funnel/waterfall data", () => {
  const summary = { critical: 0, ready: 1, total: 1, updatedAt: "2026-08-20T12:00:00.000Z", warning: 0 };
  const base = {
    pageInfo: { nextCursor: null, total: 1 },
    records: [{ delta: null, label: "Przychód netto", metricId: "revenue", readiness: "ready" as const, target: null, unit: "currency" as const, value: 100 }],
    summary,
  };
  const trajectory = [{ actual: 100, date: "2026-08-20T00:00:00.000Z", forecast: null, plan: 110 }];
  const driverRelationships = {
    efficiency: {
      basis: "insufficient-data" as const,
      coefficient: null,
      points: [],
      sampleSize: 0,
      xLabel: "Koszt mediów",
      xMetricId: "spend",
      yLabel: "Przychód przypisany",
      yMetricId: "attributed",
    },
    volume: {
      basis: "decomposition" as const,
      endValue: 100,
      priceEffect: 0,
      priceLabel: "AOV",
      sampleSize: 2,
      startValue: 100,
      unit: "currency" as const,
      volumeEffect: 0,
      volumeLabel: "Zamówienia",
    },
  };

  const merged = mergeCommandCenterOnePageApiData(
    { ...base, steps: [{ completions: 1, conversionRate: 1, entrants: 1, label: "fake", stepId: "fake" }], waterfall: [] },
    { ...base, forecastMethod: "linear-run-rate", forecastTotal: 120, planTotal: 110, trajectory },
    { ...base, driverRelationships },
  );

  assert.deepEqual(merged.trajectory, trajectory);
  assert.equal(merged.planTotal, 110);
  assert.equal(merged.forecastTotal, 120);
  assert.deepEqual(merged.driverRelationships, driverRelationships);
  assert.deepEqual(merged.steps, []);
  assert.deepEqual(merged.waterfall, []);
});
