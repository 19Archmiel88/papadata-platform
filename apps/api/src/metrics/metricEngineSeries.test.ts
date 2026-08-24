import assert from "node:assert/strict";
import { test } from "node:test";
import {
  computeMetricEngineSeries,
  createMetricEngineInput,
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

test("computeMetricEngineSeries: surfaces real per-metric aggregate readiness, not just values", () => {
  const readyInput = {
    ...createMetricEngineSeriesInput({
      days: 21,
      generatedAt: "2026-08-19T00:00:00.000Z" as any,
      tenantId: "tenant_readiness_check",
      workspaceId: "workspace_readiness_check",
    }),
    // The sandbox's checkpoint fixture is anchored near its own template
    // date, not this test's generatedAt — clear it so this test verifies
    // readiness propagation, not sandbox freshness-fixture coincidence.
    syncCheckpoints: [],
  };
  const ready = computeMetricEngineSeries(readyInput, ["orders", "ad_spend"]);
  assert.equal(ready.readiness.orders, "ready");
  assert.equal(ready.readiness.ad_spend, "ready");
  assert.deepEqual(ready.reasonCodes.orders, []);

  const emptyInput = {
    ...readyInput,
    canonicalAdSpend: [],
    canonicalOrders: [],
    canonicalOrderLines: [],
  };
  const empty = computeMetricEngineSeries(emptyInput, ["orders", "ad_spend"]);
  assert.equal(empty.readiness.orders, "no_data");
  assert.equal(empty.readiness.ad_spend, "no_data");
  assert.deepEqual(empty.reasonCodes.orders, ["NO_DATA"]);
});

test("computeMetricEngineSeries: providers/lastSuccessfulSyncAt mirror per-metric attribution, not the whole input", () => {
  const input = createMetricEngineInput();

  const commerceProviders = [...new Set(input.canonicalOrders.map((order) => order.providerId))].sort();
  const adProviders = [...new Set(input.canonicalAdSpend.map((spend) => spend.providerId))].sort();
  assert.ok(commerceProviders.length > 0, "fixture must ship at least one canonical order");
  assert.ok(adProviders.length > 0, "fixture must ship at least one canonical ad spend record");

  const latestCheckpointFor = (providers: readonly string[]) => input.syncCheckpoints
    .filter((checkpoint) => providers.includes(checkpoint.providerId))
    .map((checkpoint) => checkpoint.updatedAt)
    .sort()
    .at(-1) ?? null;

  const { lastSuccessfulSyncAt, providers } = computeMetricEngineSeries(input, ["gross_order_value", "ad_spend"]);

  assert.deepEqual(providers.gross_order_value, commerceProviders, "gross_order_value must not report ad providers as a source");
  assert.equal(lastSuccessfulSyncAt.gross_order_value, latestCheckpointFor(commerceProviders));

  assert.deepEqual(providers.ad_spend, adProviders, "ad_spend must not report a commerce provider as a source");
  assert.equal(lastSuccessfulSyncAt.ad_spend, latestCheckpointFor(adProviders));

  const emptyInput = createMetricEngineInput({ noData: true });
  const empty = computeMetricEngineSeries(emptyInput, ["gross_order_value"]);
  assert.deepEqual(empty.providers.gross_order_value, [], "no evidence means no providers -- must not fabricate an attribution");
  assert.equal(empty.lastSuccessfulSyncAt.gross_order_value, null, "no evidence means no known sync time");
});

test("computeMetricEngineSeries aligns daily buckets to the input timezone across DST", () => {
  const template = createMetricEngineSeriesInput({
    days: 1,
    generatedAt: "2026-08-19T00:00:00.000Z" as any,
    tenantId: "tenant_dst_check",
    workspaceId: "workspace_dst_check",
  });
  const input = {
    ...template,
    canonicalAdSpend: [],
    canonicalAttributedConversions: [],
    canonicalCustomerReturns: [],
    canonicalOrderLines: [],
    canonicalOrders: [],
    canonicalRefunds: [],
    periodStart: "2026-03-28T23:00:00.000Z" as any, // 2026-03-29 00:00 Europe/Warsaw
    periodEnd: "2026-03-30T22:00:00.000Z" as any,   // 2026-03-31 00:00 Europe/Warsaw
    timezone: "Europe/Warsaw",
  };

  const { daily } = computeMetricEngineSeries(input, ["orders"]);

  assert.deepEqual(
    daily.map((day) => day.date),
    ["2026-03-29", "2026-03-30"],
    "the spring DST transition must still produce exactly the two requested local calendar days",
  );
});

test("days_of_inventory counts elapsed local-day equivalents instead of touched calendar dates", () => {
  const input = createMetricEngineInput();

  const fullWindow = computeMetricEngineSeries(
    input,
    ["days_of_inventory"],
  );

  assert.equal(
    fullWindow.aggregate.days_of_inventory,
    "12.0000",
    "48 elapsed hours must equal two day equivalents even when Europe/Warsaw touches three calendar dates",
  );

  const partialWindow = computeMetricEngineSeries(
    {
      ...input,
      periodEnd: "2026-07-19T12:00:00.000Z" as any,
    },
    ["days_of_inventory"],
  );

  assert.equal(
    partialWindow.aggregate.days_of_inventory,
    "3.0000",
    "12 elapsed hours inside a normal 24-hour local day must contribute half of one day equivalent",
  );
});

test("days_of_inventory treats two complete Warsaw calendar days across DST as two day equivalents", () => {
  const input = createMetricEngineInput();

  const dstInput = {
    ...input,
    canonicalOrders: input.canonicalOrders.map((order, index) => ({
      ...order,
      orderedAt: (
        index % 2 === 0
          ? "2026-03-29T08:00:00.000Z"
          : "2026-03-30T08:00:00.000Z"
      ) as any,
    })),
    periodStart: "2026-03-28T23:00:00.000Z" as any,
    periodEnd: "2026-03-30T22:00:00.000Z" as any,
    timezone: "Europe/Warsaw",
  };

  const result = computeMetricEngineSeries(
    dstInput,
    ["days_of_inventory"],
  );

  assert.equal(
    result.aggregate.days_of_inventory,
    "12.0000",
    "two complete local calendar days must remain two day equivalents across the spring DST transition",
  );
});
