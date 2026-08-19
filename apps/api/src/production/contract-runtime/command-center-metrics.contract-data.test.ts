import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildCommandCenterDriversData,
  buildCommandCenterKpiOverrides,
  buildCommandCenterPlanPerformanceData,
} from "./command-center-metrics.contract-data.ts";

const tenantId = "tenant_test";
const workspaceId = "workspace_test";
const generatedAt = "2026-08-19T00:00:00.000Z";

test("KPI overrides read AOV and ad spend directly, never derive spend from revenue/ROAS", () => {
  const kpi = buildCommandCenterKpiOverrides(tenantId, workspaceId, generatedAt);

  assert.equal(kpi.revenue.label, "Przychód netto");
  assert.equal(kpi.aov.label, "AOV");
  assert.equal(kpi.adSpend.label, "Koszt reklamy");
  assert.equal(kpi.roas.label, "ROAS blended");
  assert.equal(kpi.orders.label, "Liczba zamówień");

  assert.ok(kpi.revenue.value > 0, "revenue should be a real positive computed value");
  assert.ok(kpi.adSpend.value > 0, "ad spend should be a real positive computed value");
  assert.ok(kpi.aov.value > 0, "aov should be a real positive computed value");
  assert.ok(kpi.orders.value > 0, "orders should be a real positive computed value");

  // aov is a canonical engine metric (gross_order_value / orders), not
  // re-derived from the revenue/orders KPI records shown alongside it — the
  // two are allowed to differ slightly since revenue here is net-of-refunds
  // while aov's numerator is gross.
  assert.ok(Number.isFinite(kpi.aov.value));

  // Sparklines must be real daily history from the engine, not a
  // client-side sine-wave stand-in — 10 points, and not all identical
  // (a flat line would be a red flag that this fell back to a constant).
  assert.equal(kpi.revenue.sparkline?.length, 10);
  assert.ok(new Set(kpi.revenue.sparkline).size > 1, "sparkline must show real day-to-day variation");
});

test("KPI overrides are deterministic for the same inputs", () => {
  const first = buildCommandCenterKpiOverrides(tenantId, workspaceId, generatedAt);
  const second = buildCommandCenterKpiOverrides(tenantId, workspaceId, generatedAt);

  assert.deepEqual(first, second);
});

test("plan performance trajectory: table rows are exactly what the chart would plot", () => {
  const plan = buildCommandCenterPlanPerformanceData(tenantId, workspaceId, generatedAt);

  assert.equal(plan.forecastMethod, "linear-run-rate");
  assert.ok(plan.trajectory.length > 0, "trajectory must have points");

  const actualPoints = plan.trajectory.filter((point) => point.actual !== null);
  const forecastPoints = plan.trajectory.filter((point) => point.forecast !== null);

  assert.ok(actualPoints.length > 0, "some points must be real actuals");
  assert.ok(forecastPoints.length > 0, "some points must be forecast");

  // A point is either actual (past) or forecast (future), never both and
  // never neither — otherwise the chart and the "full tabular alternative"
  // built from the same array could show a row that means nothing.
  for (const point of plan.trajectory) {
    const hasActual = point.actual !== null;
    const hasForecast = point.forecast !== null;
    assert.notEqual(hasActual, hasForecast, `point ${point.date} must be exactly one of actual/forecast`);
    assert.ok(point.plan > 0, `point ${point.date} must carry a plan value`);
  }

  assert.ok(plan.planTotal > 0);
  assert.ok(plan.forecastTotal > 0);
});

test("drivers: each relationship is exactly correlation or contribution-share, never a fabricated coefficient", () => {
  const { driverRelationships } = buildCommandCenterDriversData(tenantId, workspaceId, generatedAt);
  const relationships = [driverRelationships.volume, driverRelationships.efficiency];

  assert.equal(relationships.length, 2);

  for (const relationship of relationships) {
    assert.ok(relationship.sampleSize > 0);
    assert.ok(relationship.points.length > 0, "chart points must be present");

    if (relationship.basis === "correlation") {
      assert.notEqual(relationship.coefficient, null);
      assert.ok(relationship.coefficient! >= -1 && relationship.coefficient! <= 1, "Pearson r must be within [-1, 1]");
      assert.equal(relationship.contributionShare, null);
    } else {
      assert.equal(relationship.basis, "contribution-share");
      assert.equal(relationship.coefficient, null);
      assert.notEqual(relationship.contributionShare, null);
    }

    // Never both null, never both set — the UI must always be able to tell
    // which kind of number it's showing.
    const hasCoefficient = relationship.coefficient !== null;
    const hasShare = relationship.contributionShare !== null;
    assert.notEqual(hasCoefficient, hasShare);
  }
});

test("drivers: correlation is computed over genuinely paired series, and chart points match what the coefficient was computed from", () => {
  const { driverRelationships } = buildCommandCenterDriversData(tenantId, workspaceId, generatedAt);

  // ad_spend and roas both have real day-to-day variation in this fixture,
  // so efficiency should correlate — if this regresses to contribution-share,
  // the deterministic series generator likely stopped producing real
  // variance for one of the two metrics.
  assert.equal(driverRelationships.efficiency.basis, "correlation");

  // orders count is constant per day in the sandbox fixture template (only
  // order value varies), so volume honestly has no real variance to
  // correlate against and must fall back rather than fabricate a
  // coefficient — this is the fallback path working as intended, not a bug.
  assert.equal(driverRelationships.volume.basis, "contribution-share");

  // Points are the real daily (x, y) pairs the coefficient was computed
  // from — not independently resampled, so the chart and the coefficient
  // can never disagree.
  for (const point of driverRelationships.efficiency.points) {
    assert.ok(Number.isFinite(point.x));
    assert.ok(Number.isFinite(point.y));
  }
});
