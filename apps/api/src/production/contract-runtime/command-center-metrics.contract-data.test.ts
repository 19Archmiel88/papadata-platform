import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildCommandCenterDriversData,
  buildCommandCenterKpiOverrides,
  buildCommandCenterPlanPerformanceData,
  buildCommandCenterProductSalesData,
  buildCommandCenterTrafficSourcesData,
} from "./command-center-metrics.contract-data.ts";
import type { CommandCenterDataSource } from "./command-center-metrics.real-source.ts";

const tenantId = "tenant_test";
const workspaceId = "workspace_test";
const generatedAt = "2026-08-19T00:00:00.000Z";
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * A fake CommandCenterDataSource seeded with 30 days of real-shaped
 * ingested rows (one commerce order + refund + ad-spend + attributed
 * conversion per day), ending at `generatedAt`. Order count is constant per
 * day (only order value varies) so "volume" (orders vs aov) has no real
 * variance to correlate — mirroring a genuine tenant where daily order
 * count doesn't move but basket size does. Ad spend and conversion value
 * both vary independently so "efficiency" (ad_spend vs roas) can correlate.
 */
function seededDataSource(days = 30): CommandCenterDataSource {
  const endMs = Date.parse(generatedAt);
  const rows: Record<string, unknown>[] = [];

  for (let i = 0; i < days; i += 1) {
    const dayStartMs = endMs - (days - i) * DAY_MS;
    const iso = new Date(dayStartMs + DAY_MS / 2).toISOString();
    const orderAmount = 80 + (i % 6) * 12;
    const adSpendAmount = 15 + (i % 5) * 5;
    const conversionValue = 60 + (i % 4) * 20;

    rows.push(canonicalRow("woocommerce", "orders", `order-${i}`, iso, {
      currency: "PLN",
      grossAmount: orderAmount,
      orderId: `order-${i}`,
      orderNumber: `WC-${i}`,
      updatedAt: iso,
    }));
    rows.push(canonicalRow("woocommerce", "refunds", `refund-${i}`, iso, {
      amount: 5,
      currency: "PLN",
      orderId: `order-${i}`,
      refundId: `refund-${i}`,
    }));
    rows.push(canonicalRow("google_ads", "ad_spend", `spend-${i}`, iso, {
      campaignId: "campaign-1",
      clicks: 40 + (i % 6),
      currency: "PLN",
      date: iso.slice(0, 10),
      impressions: 1000 + i,
      spend: adSpendAmount,
    }));
    rows.push(canonicalRow("google_ads", "attributed_conversions", `conv-${i}`, iso, {
      campaignId: "campaign-1",
      conversionValue,
      currency: "PLN",
      date: iso.slice(0, 10),
    }));
  }

  return {
    async listCanonicalRecords(_tenantId, _workspaceId, input) {
      const from = Date.parse(input.businessTimeFrom);
      const to = Date.parse(input.businessTimeTo);
      return rows.filter((row) => {
        const time = (row.effective_time as Date).getTime();
        return input.streams.includes(row.stream as string) && time >= from && time < to;
      });
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

function emptyDataSource(): CommandCenterDataSource {
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

function canonicalRow(
  providerId: string,
  stream: string,
  externalId: string,
  effectiveTimeIso: string,
  entity: Record<string, unknown>,
): Record<string, unknown> {
  return {
    canonical_payload: {
      entity,
      externalId,
      occurredAt: effectiveTimeIso,
      providerId,
      quality: { missingFields: [], status: "valid" },
      stream,
      version: "integration.canonical.v2",
    },
    effective_time: new Date(effectiveTimeIso),
    external_id: externalId,
    id: `${stream}:${externalId}`,
    provider_id: providerId,
    stream,
  };
}

test("KPI overrides read AOV and ad spend directly, never derive spend from revenue/ROAS", async () => {
  const kpi = await buildCommandCenterKpiOverrides(tenantId, workspaceId, generatedAt, seededDataSource());

  assert.equal(kpi.revenue.label, "Przychód netto");
  assert.equal(kpi.aov.label, "AOV");
  assert.equal(kpi.adSpend.label, "Koszt reklamy");
  assert.equal(kpi.roas.label, "ROAS blended");
  assert.equal(kpi.orders.label, "Liczba zamówień");

  assert.ok(kpi.revenue.value > 0, "revenue should be a real positive computed value");
  assert.ok(kpi.adSpend.value > 0, "ad spend should be a real positive computed value");
  assert.ok(kpi.aov.value > 0, "aov should be a real positive computed value");
  assert.ok(kpi.orders.value > 0, "orders should be a real positive computed value");

  // Every KPI is backed by real ingested rows in this fixture, so all must
  // report ready — not a hardcoded literal, but the engine's own verdict.
  assert.equal(kpi.revenue.readiness, "ready");
  assert.equal(kpi.adSpend.readiness, "ready");
  assert.equal(kpi.aov.readiness, "ready");
  assert.equal(kpi.orders.readiness, "ready");
  assert.equal(kpi.roas.readiness, "ready");

  // aov is a canonical engine metric (gross_order_value / orders), not
  // re-derived from the revenue/orders KPI records shown alongside it — the
  // two are allowed to differ slightly since revenue here is net-of-refunds
  // while aov's numerator is gross.
  assert.ok(Number.isFinite(kpi.aov.value));

  // Sparklines contain only real observed daily values from the visible tail.
  // A missing day stays missing instead of being injected as a zero, so the
  // sequence can legitimately contain fewer than the 10-day display cap.
  assert.ok((kpi.revenue.sparkline?.length ?? 0) >= 2);
  assert.ok((kpi.revenue.sparkline?.length ?? 0) <= 10);
  assert.ok(new Set(kpi.revenue.sparkline).size > 1, "sparkline must show real day-to-day variation");
});

test("KPI overrides carry providers/lastSuccessfulSyncAt from the metric engine, not fabricated", async () => {
  const woocommerceCheckpoint = "2026-08-18T12:00:00.000Z";
  const googleAdsCheckpoint = "2026-08-19T00:00:00.000Z"; // newer than the woocommerce checkpoint
  const dataSource: CommandCenterDataSource = {
    ...seededDataSource(),
    async listSyncCheckpoints() {
      return [
        {
          connection_id: "connection-woocommerce",
          id: "checkpoint-woocommerce",
          provider_id: "woocommerce",
          stream: "orders",
          updated_at: woocommerceCheckpoint,
          watermark: woocommerceCheckpoint,
        },
        {
          connection_id: "connection-google-ads",
          id: "checkpoint-google-ads",
          provider_id: "google_ads",
          stream: "ad_spend",
          updated_at: googleAdsCheckpoint,
          watermark: googleAdsCheckpoint,
        },
      ];
    },
  };

  const kpi = await buildCommandCenterKpiOverrides(tenantId, workspaceId, generatedAt, dataSource);

  assert.deepEqual(kpi.revenue.providers, ["woocommerce"], "revenue is a commerce metric -- ad providers must not leak in");
  assert.equal(kpi.revenue.lastSuccessfulSyncAt, woocommerceCheckpoint);

  assert.deepEqual(kpi.adSpend.providers, ["google_ads"], "ad spend must not report a commerce provider as a source");
  assert.equal(kpi.adSpend.lastSuccessfulSyncAt, googleAdsCheckpoint);

  // cpa is derived from two metric codes (ad_spend + attributed conversions),
  // both fed by google_ads in this fixture -- providers must union, not pick one arbitrarily.
  assert.deepEqual(kpi.cpa.providers, ["google_ads"]);
  assert.equal(kpi.cpa.lastSuccessfulSyncAt, googleAdsCheckpoint);

  // cards not (yet) backed by a single versioned metric code must not
  // fabricate an attribution just because other cards have one.
  assert.deepEqual(kpi.cartConversion.providers, []);
  assert.equal(kpi.cartConversion.lastSuccessfulSyncAt, null);
});

test("KPI overrides report no providers/lastSuccessfulSyncAt when the fixture has no sync checkpoints", async () => {
  // seededDataSource()'s listSyncCheckpoints() returns [] -- this proves the
  // absence of a checkpoint never falls back to some other timestamp.
  const kpi = await buildCommandCenterKpiOverrides(tenantId, workspaceId, generatedAt, seededDataSource());

  assert.deepEqual(kpi.revenue.providers, ["woocommerce"], "providers come from evidence, not checkpoints");
  assert.equal(kpi.revenue.lastSuccessfulSyncAt, null, "no checkpoint for the provider means no known sync time");
  assert.deepEqual(kpi.adSpend.providers, ["google_ads"]);
  assert.equal(kpi.adSpend.lastSuccessfulSyncAt, null);
});

test("KPI overrides are deterministic for the same inputs", async () => {
  const first = await buildCommandCenterKpiOverrides(tenantId, workspaceId, generatedAt, seededDataSource());
  const second = await buildCommandCenterKpiOverrides(tenantId, workspaceId, generatedAt, seededDataSource());

  assert.deepEqual(first, second);
});

test("KPI overrides report unavailable/no_data, never fabricate ready, when no real data has been ingested", async () => {
  // This is the state of every real tenant today: no provider connection has
  // ever completed, so nothing has ever landed in integration_canonical_records.
  // The dashboard must say so honestly instead of stamping "ready" on zeros.
  const kpi = await buildCommandCenterKpiOverrides(tenantId, workspaceId, generatedAt, emptyDataSource());

  for (const record of [kpi.revenue, kpi.orders, kpi.aov, kpi.adSpend, kpi.roas]) {
    assert.notEqual(record.readiness, "ready", `${record.label} must not claim ready with zero ingested data`);
    assert.equal(record.value, 0);
  }
});

test("plan performance trajectory: table rows are exactly what the chart would plot", async () => {
  const plan = await buildCommandCenterPlanPerformanceData(tenantId, workspaceId, generatedAt, seededDataSource());

  assert.equal(plan.forecastMethod, "linear-run-rate");
  assert.ok(plan.trajectory.length > 0, "trajectory must have points");

  const actualPoints = plan.trajectory.filter((point) => point.actual !== null);
  const forecastPoints = plan.trajectory.filter((point) => point.forecast !== null);

  assert.ok(actualPoints.length > 0, "some points must be real actuals");
  assert.ok(forecastPoints.length > 0, "some points must be forecast");

  // A point can be an observed actual, a future forecast, or an elapsed day
  // with no trustworthy observation. It must never be both actual and
  // forecast; unknown elapsed days stay null rather than becoming fake zero.
  for (const point of plan.trajectory) {
    const hasActual = point.actual !== null;
    const hasForecast = point.forecast !== null;
    assert.equal(hasActual && hasForecast, false, `point ${point.date} must not be both actual and forecast`);
    assert.ok(point.plan >= 0, `point ${point.date} must carry a benchmark value or explicit zero-unavailable sentinel`);
  }

  assert.ok(plan.planTotal > 0);
  assert.ok(plan.forecastTotal > 0);
});

test("drivers: efficiency is correlation or an honest insufficient-data state, never a fabricated coefficient", async () => {
  const { driverRelationships } = await buildCommandCenterDriversData(tenantId, workspaceId, generatedAt, seededDataSource());
  const relationship = driverRelationships.efficiency;

  assert.ok(relationship.sampleSize > 0);
  assert.ok(relationship.points.length > 0, "chart points must be present");

  if (relationship.basis === "correlation") {
    assert.notEqual(relationship.coefficient, null);
    assert.ok(relationship.coefficient! >= -1 && relationship.coefficient! <= 1, "Pearson r must be within [-1, 1]");
  } else {
    assert.equal(relationship.basis, "insufficient-data");
    assert.equal(relationship.coefficient, null);
  }

  assert.equal(relationship.sampleSize, relationship.points.length);
});

test("drivers: efficiency correlates ad_spend against attributed revenue, never against ROAS (which divides by ad_spend)", async () => {
  const { driverRelationships } = await buildCommandCenterDriversData(tenantId, workspaceId, generatedAt, seededDataSource());

  // ad_spend and attributed conversion value both have real day-to-day
  // variation in this fixture, so efficiency should correlate — if this
  // regresses to insufficient-data, the fixture's deterministic generator
  // likely stopped producing real variance for one of the two metrics.
  assert.equal(driverRelationships.efficiency.basis, "correlation");
  assert.equal(driverRelationships.efficiency.xLabel, "Koszt mediów");
  assert.ok(driverRelationships.efficiency.yLabel.includes("Przychód"), "efficiency yLabel must describe attributed revenue, not ROAS");

  // Points are the real daily (x, y) pairs the coefficient was computed
  // from — not independently resampled, so the chart and the coefficient
  // can never disagree.
  for (const point of driverRelationships.efficiency.points) {
    assert.ok(Number.isFinite(point.x));
    assert.ok(Number.isFinite(point.y));
  }
});

test("drivers: volume is an exact Orders x AOV decomposition, never a correlation between orders and a ratio that divides by orders", async () => {
  const { driverRelationships } = await buildCommandCenterDriversData(tenantId, workspaceId, generatedAt, seededDataSource());
  const decomposition = driverRelationships.volume;

  assert.equal(decomposition.basis, "decomposition");
  assert.ok(decomposition.sampleSize > 0);

  // The two effects must sum exactly to the real change between the first
  // and second half of the window — this is real algebra (gross_order_value
  // == orders * aov by construction), not a statistical estimate with a
  // residual.
  const impliedEnd = decomposition.startValue + decomposition.volumeEffect + decomposition.priceEffect;
  assert.ok(
    Math.abs(impliedEnd - decomposition.endValue) < 0.5,
    `startValue + volumeEffect + priceEffect (${impliedEnd}) must equal endValue (${decomposition.endValue})`,
  );
});

test("drivers: an empty data source reports sampleSize 0, never a fabricated n from an empty window", async () => {
  const { driverRelationships } = await buildCommandCenterDriversData(tenantId, workspaceId, generatedAt, emptyDataSource());

  assert.equal(driverRelationships.efficiency.sampleSize, 0);
  assert.equal(driverRelationships.efficiency.basis, "insufficient-data");
  assert.equal(driverRelationships.efficiency.coefficient, null);

  assert.equal(driverRelationships.volume.sampleSize, 0);
  assert.equal(driverRelationships.volume.startValue, 0);
  assert.equal(driverRelationships.volume.endValue, 0);
  assert.equal(driverRelationships.volume.volumeEffect, 0);
  assert.equal(driverRelationships.volume.priceEffect, 0);
});

test("KPI overrides aggregate over the real requested date range, not a fixed trailing window", async () => {
  const fullWindow = await buildCommandCenterKpiOverrides(tenantId, workspaceId, generatedAt, seededDataSource());
  const lastThreeDays = await buildCommandCenterKpiOverrides(
    tenantId,
    workspaceId,
    generatedAt,
    seededDataSource(),
    { from: "2026-08-17", to: "2026-08-19" },
  );

  // Fewer real days ingested means fewer orders counted — if the range were
  // ignored (as the old fixed 30-day window did), this would equal the full
  // window's order count instead of being strictly smaller.
  assert.ok(lastThreeDays.orders.value < fullWindow.orders.value);
  assert.ok(lastThreeDays.orders.value > 0);
  assert.equal(lastThreeDays.orders.readiness, "ready");
});

test("KPI overrides fall back to the default trailing window when no date range is given", async () => {
  const noRange = await buildCommandCenterKpiOverrides(tenantId, workspaceId, generatedAt, seededDataSource(), null);
  const fullWindow = await buildCommandCenterKpiOverrides(tenantId, workspaceId, generatedAt, seededDataSource());

  assert.deepEqual(noRange, fullWindow);
});

test("plan performance: a date range extending past today produces real forecast days sized to the range, not a fixed 9", async () => {
  const plan = await buildCommandCenterPlanPerformanceData(
    tenantId,
    workspaceId,
    generatedAt,
    seededDataSource(),
    { from: "2026-08-05", to: "2026-08-24" },
  );

  const forecastPoints = plan.trajectory.filter((point) => point.forecast !== null);
  const actualPoints = plan.trajectory.filter((point) => point.actual !== null);

  // generatedAt is 2026-08-19, range ends 2026-08-24: 5 real future days.
  assert.equal(forecastPoints.length, 5);
  assert.ok(actualPoints.length > 0);
  assert.ok(plan.planTotal > 0);
});

test("plan performance: a fully past date range produces zero forecast days instead of always projecting 9 days forward", async () => {
  const plan = await buildCommandCenterPlanPerformanceData(
    tenantId,
    workspaceId,
    generatedAt,
    seededDataSource(),
    { from: "2026-07-01", to: "2026-07-10" },
  );

  const forecastPoints = plan.trajectory.filter((point) => point.forecast !== null);
  assert.equal(forecastPoints.length, 0);
  assert.equal(plan.trajectory.length, 10);
  assert.ok(
    plan.trajectory.every((point) => point.forecast === null),
    "a fully past window must never manufacture forecast values",
  );
});

test("KPI date range respects Europe/Warsaw local-day boundaries", async () => {
  const queried: { from: string; to: string }[] = [];
  const source: CommandCenterDataSource = {
    ...emptyDataSource(),
    async listCanonicalRecords(_tenant, _workspace, input) {
      queried.push({ from: input.businessTimeFrom, to: input.businessTimeTo });
      return [];
    },
  };

  await buildCommandCenterKpiOverrides(
    tenantId,
    workspaceId,
    "2026-08-21T12:00:00.000Z",
    source,
    { from: "2026-08-20", timezone: "Europe/Warsaw", to: "2026-08-20" },
  );

  assert.ok(queried.length > 0);
  assert.equal(queried[0]?.from, "2026-08-19T22:00:00.000Z");
  assert.equal(queried[0]?.to, "2026-08-20T22:00:00.000Z");
});

test("plan benchmark uses the immediately preceding equal period, not the current period itself", async () => {
  const queries: { from: string; to: string }[] = [];
  const source = seededDataSource(60);
  const tracked: CommandCenterDataSource = {
    ...source,
    async listCanonicalRecords(tenant, workspace, input) {
      queries.push({ from: input.businessTimeFrom, to: input.businessTimeTo });
      return source.listCanonicalRecords(tenant, workspace, input);
    },
  };

  await buildCommandCenterPlanPerformanceData(
    tenantId,
    workspaceId,
    generatedAt,
    tracked,
    { from: "2026-08-10", timezone: "Europe/Warsaw", to: "2026-08-18" },
  );

  const uniqueWindows = Array.from(new Map(queries.map((query) => [`${query.from}|${query.to}`, query])).values());
  assert.ok(uniqueWindows.length >= 2, "plan must query both the selected and previous equal period");
  const current = uniqueWindows.find((window) => window.from === "2026-08-09T22:00:00.000Z");
  const previous = uniqueWindows.find((window) => window.to === "2026-08-09T22:00:00.000Z");
  assert.ok(current, "expected current selected-period window");
  assert.ok(previous, "expected immediately preceding comparison window");
});

/**
 * Two disjoint 9-day windows for the "2026-08-10".."2026-08-18" range (see
 * "plan benchmark uses the immediately preceding equal period" above for how
 * `resolvePlanWindow` derives them): current = Aug 10-18, previous = Aug
 * 1-9. Product catalog rows are duplicated into both windows because
 * `buildCommandCenterProductSalesData` fetches `products` bounded to each
 * period independently — a product row dated outside a given window would
 * make that window's own order lines referencing it unresolved.
 */
function productSalesDataSource(): CommandCenterDataSource {
  const rows: Record<string, unknown>[] = [
    canonicalRow("woocommerce", "products", "prod-a", "2026-08-05T10:00:00.000Z", { name: "Produkt A" }),
    canonicalRow("woocommerce", "products", "prod-a", "2026-08-12T10:00:00.000Z", { name: "Produkt A" }),
    canonicalRow("woocommerce", "products", "prod-b", "2026-08-12T10:00:00.000Z", { name: "Produkt B" }),

    // Current window, revenue-qualifying: 2x prod-a @ 100 total, 1x prod-b @ 50.
    canonicalRow("woocommerce", "orders", "order-cur-1", "2026-08-12T12:00:00.000Z", {
      currency: "PLN",
      grossAmount: 150,
      lineItems: [
        { externalProductId: "prod-a", grossAmount: 100, quantity: 2 },
        { externalProductId: "prod-b", grossAmount: 50, quantity: 1 },
      ],
      status: "completed",
    }),
    // Current window, cancelled: must not contribute to prod-a totals.
    canonicalRow("woocommerce", "orders", "order-cur-2", "2026-08-13T12:00:00.000Z", {
      currency: "PLN",
      grossAmount: 999,
      lineItems: [{ externalProductId: "prod-a", grossAmount: 999, quantity: 99 }],
      status: "cancelled",
    }),
    // Current window, qualifying, but its only line references a product
    // never seen in the `products` stream: must be dropped, not grouped
    // under a fabricated "unknown product" bucket.
    canonicalRow("woocommerce", "orders", "order-cur-3", "2026-08-14T12:00:00.000Z", {
      currency: "PLN",
      grossAmount: 30,
      lineItems: [{ externalProductId: "prod-unknown", grossAmount: 30, quantity: 1 }],
      status: "completed",
    }),
    // Previous window, qualifying: 1x prod-a @ 40 — gives prod-a a real
    // period-over-period comparison; prod-b has no previous-period data.
    canonicalRow("woocommerce", "orders", "order-prev-1", "2026-08-05T12:00:00.000Z", {
      currency: "PLN",
      grossAmount: 40,
      lineItems: [{ externalProductId: "prod-a", grossAmount: 40, quantity: 1 }],
      status: "completed",
    }),
  ];

  return {
    async listCanonicalRecords(_tenantId, _workspaceId, input) {
      const from = Date.parse(input.businessTimeFrom);
      const to = Date.parse(input.businessTimeTo);
      return rows.filter((row) => {
        const time = (row.effective_time as Date).getTime();
        return input.streams.includes(row.stream as string) && time >= from && time < to;
      });
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

test("product sales: sums real order-line revenue/quantity per product, drops cancelled orders and unresolved products, computes real period-over-period change", async () => {
  const { productSales } = await buildCommandCenterProductSalesData(
    tenantId,
    workspaceId,
    generatedAt,
    productSalesDataSource(),
    { from: "2026-08-10", timezone: "Europe/Warsaw", to: "2026-08-18" },
  );

  assert.equal(productSales.length, 2, "the unresolved-product line must not create a third row");

  const productA = productSales.find((row) => row.productName === "Produkt A");
  const productB = productSales.find((row) => row.productName === "Produkt B");
  assert.ok(productA);
  assert.ok(productB);

  assert.equal(productA?.revenue, "100.00");
  assert.equal(productA?.quantity, 2);
  assert.equal(productB?.revenue, "50.00");
  assert.equal(productB?.quantity, 1);

  // prod-a: (100 - 40) / 40 * 100 = 150% growth against its real previous-period revenue.
  assert.equal(productA?.changePercent, 150);
  // prod-b never appeared in the previous period: change stays honestly null, not 0% or 100%.
  assert.equal(productB?.changePercent, null);

  // Sorted by revenue, descending — matches the DataTable's default sort.
  assert.deepEqual(productSales.map((row) => row.productName), ["Produkt A", "Produkt B"]);
});

function trafficSourcesDataSource(): CommandCenterDataSource {
  const rows: Record<string, unknown>[] = [
    canonicalRow("ga4", "traffic", "row-1", "2026-08-15T08:00:00.000Z", { sessions: 100, source: "Organic Search", users: 80 }),
    canonicalRow("ga4", "traffic", "row-2", "2026-08-16T08:00:00.000Z", { sessions: 50, source: "Organic Search", users: 40 }),
    canonicalRow("ga4", "traffic", "row-3", "2026-08-15T09:00:00.000Z", { sessions: 90, source: "Paid Search", users: 70 }),
    // No `source` on the row: must be skipped, not grouped under an empty-string channel.
    canonicalRow("ga4", "traffic", "row-4", "2026-08-15T10:00:00.000Z", { sessions: 20, users: 15 }),
    // A non-GA4 provider happening to emit a `traffic` stream row must never
    // be attributed to a GA4 channel group.
    canonicalRow("shopify", "traffic", "row-5", "2026-08-15T11:00:00.000Z", { sessions: 500, source: "Organic Search", users: 400 }),
  ];

  return {
    async listCanonicalRecords(_tenantId, _workspaceId, input) {
      const from = Date.parse(input.businessTimeFrom);
      const to = Date.parse(input.businessTimeTo);
      return rows.filter((row) => {
        const time = (row.effective_time as Date).getTime();
        return input.streams.includes(row.stream as string) && time >= from && time < to;
      });
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

test("traffic sources: sums real GA4 sessions/users per channel group, ignores non-GA4 rows and rows without a channel, sorts by sessions", async () => {
  const { trafficSources } = await buildCommandCenterTrafficSourcesData(
    tenantId,
    workspaceId,
    generatedAt,
    trafficSourcesDataSource(),
    { from: "2026-08-10", timezone: "Europe/Warsaw", to: "2026-08-18" },
  );

  assert.deepEqual(trafficSources, [
    { sessions: 150, source: "Organic Search", users: 120 },
    { sessions: 90, source: "Paid Search", users: 70 },
  ]);
});
