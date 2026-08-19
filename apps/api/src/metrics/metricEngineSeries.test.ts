import assert from "node:assert/strict";
import { test } from "node:test";
import {
  computeMetricEngineSeries,
  createMetricEngineSeriesInput,
} from "./metricEngineCore.ts";

test("createMetricEngineSeriesInput produces one dated, scaled record set per day, no ID collisions", () => {
  const days = 14;
  const input = createMetricEngineSeriesInput({
    days,
    generatedAt: "2026-08-19T00:00:00.000Z" as any,
    tenantId: "tenant_series_test",
    workspaceId: "workspace_series_test",
  });

  assert.equal(input.canonicalOrders.length, days * 2, "2 template orders cloned per day");
  assert.equal(new Set(input.canonicalOrders.map((order) => order.canonicalOrderId)).size, input.canonicalOrders.length, "no duplicate order IDs across days");
  assert.equal(new Set(input.canonicalAdSpend.map((spend) => spend.canonicalAdSpendId)).size, input.canonicalAdSpend.length, "no duplicate ad spend IDs across days");

  const orderDates = new Set(input.canonicalOrders.map((order) => order.orderedAt.slice(0, 10)));
  assert.ok(orderDates.size >= days - 1, "orders should be spread across (most of) the requested window, not collapsed onto one day");

  // Every order line must still point at an order that actually exists in
  // this same generated set (referential integrity survives the per-day clone).
  const orderIds = new Set(input.canonicalOrders.map((order) => order.canonicalOrderId));
  for (const line of input.canonicalOrderLines) {
    assert.ok(orderIds.has(line.canonicalOrderId), `order line ${line.canonicalLineId} references a missing order`);
  }
});

test("createMetricEngineSeriesInput is deterministic — same inputs, same output, no Math.random", () => {
  const options = {
    days: 10,
    generatedAt: "2026-08-19T00:00:00.000Z" as any,
    tenantId: "tenant_determinism",
    workspaceId: "workspace_determinism",
  };

  const first = createMetricEngineSeriesInput(options);
  const second = createMetricEngineSeriesInput(options);

  assert.deepEqual(first, second);
});

test("computeMetricEngineSeries: daily breakdown sums to (approximately) the aggregate for additive metrics", () => {
  const input = createMetricEngineSeriesInput({
    days: 21,
    generatedAt: "2026-08-19T00:00:00.000Z" as any,
    tenantId: "tenant_sum_check",
    workspaceId: "workspace_sum_check",
  });
  const { aggregate, daily } = computeMetricEngineSeries(input, ["ad_spend", "orders"]);

  assert.equal(daily.length, 21);

  const dailyAdSpendSum = daily.reduce((sum, day) => sum + Number(day.values.ad_spend ?? 0), 0);
  const aggregateAdSpend = Number(aggregate.ad_spend);
  assert.ok(
    Math.abs(dailyAdSpendSum - aggregateAdSpend) < 0.05,
    `daily ad_spend sum (${dailyAdSpendSum}) should match the aggregate (${aggregateAdSpend})`,
  );

  const dailyOrdersSum = daily.reduce((sum, day) => sum + Number(day.values.orders ?? 0), 0);
  assert.equal(dailyOrdersSum, Number(aggregate.orders));
});

test("computeMetricEngineSeries: ratio metrics (roas, aov) stay within a sane range per day", () => {
  const input = createMetricEngineSeriesInput({
    days: 30,
    generatedAt: "2026-08-19T00:00:00.000Z" as any,
    tenantId: "tenant_ratio_check",
    workspaceId: "workspace_ratio_check",
  });
  const { daily } = computeMetricEngineSeries(input, ["roas", "aov"]);

  for (const day of daily) {
    if (day.values.roas !== null && day.values.roas !== undefined) {
      const roas = Number(day.values.roas);
      assert.ok(roas > 0 && roas < 20, `roas ${roas} on ${day.date} is out of a sane range`);
    }

    if (day.values.aov !== null && day.values.aov !== undefined) {
      const aov = Number(day.values.aov);
      assert.ok(aov > 0, `aov ${aov} on ${day.date} should be positive`);
    }
  }
});
