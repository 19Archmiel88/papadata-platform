import assert from "node:assert/strict";
import { test } from "node:test";
import {
  fetchOrderDetail,
  fetchOrdersList,
  type OrdersDataSource,
} from "./orders-analytics.real-source.ts";

const tenantId = "tenant_orders_real_source";
const workspaceId = "workspace_orders_real_source";
const generatedAt = "2026-08-08T00:00:00.000Z";

function row(
  providerId: string,
  externalId: string,
  effectiveTimeIso: string,
  entity: Record<string, unknown>,
): Record<string, unknown> {
  return {
    canonical_payload: { entity },
    effective_time: new Date(effectiveTimeIso),
    external_id: externalId,
    provider_id: providerId,
    stream: "orders",
  };
}

function dataSourceWithRows(rows: readonly Record<string, unknown>[]): OrdersDataSource & {
  readonly calls: Array<{ businessTimeFrom: string; businessTimeTo: string }>;
} {
  const calls: Array<{ businessTimeFrom: string; businessTimeTo: string }> = [];
  return {
    calls,
    async listCanonicalRecords(_tenantId, _workspaceId, input) {
      calls.push({ businessTimeFrom: input.businessTimeFrom, businessTimeTo: input.businessTimeTo });
      return rows;
    },
  };
}

test("maps a real canonical order row into an OrdersRecord-shaped record", async () => {
  const dataSource = dataSourceWithRows([
    row("woocommerce", "ext-1", "2026-08-03T10:00:00.000Z", {
      currency: "PLN",
      grossAmount: 199.5,
      status: "completed",
      updatedAt: "2026-08-03T10:00:00.000Z",
    }),
  ]);

  const result = await fetchOrdersList({
    dataSource,
    dateRange: null,
    generatedAt,
    tenantId,
    workspaceId,
  });

  assert.equal(result.records.length, 1);
  const record = result.records[0]!;
  assert.equal(record.orderId, "woocommerce:ext-1");
  assert.equal(record.externalOrderId, "ext-1");
  assert.equal(record.source, "woocommerce");
  assert.equal(record.amount.amount, 199.5);
  assert.equal(record.amount.currency, "PLN");
  assert.equal(record.status, "fulfilled");
  assert.equal(record.customerPseudonym, null, "no real customer identity source exists yet -- must not fabricate one");
});

test("drops a row missing its required grossAmount instead of fabricating zero", async () => {
  const dataSource = dataSourceWithRows([
    row("woocommerce", "ext-missing-amount", "2026-08-03T10:00:00.000Z", {
      currency: "PLN",
      status: "completed",
    }),
  ]);

  const result = await fetchOrdersList({ dataSource, dateRange: null, generatedAt, tenantId, workspaceId });
  assert.equal(result.records.length, 0);
});

test("buckets known raw provider statuses into the contract's OrderStatus vocabulary; unknown falls to 'new'", async () => {
  const cases: ReadonlyArray<[string | undefined, string]> = [
    ["pending", "new"],
    ["on-hold", "new"],
    ["processing", "paid"],
    ["completed", "fulfilled"],
    ["refunded", "refunded"],
    ["cancelled", "cancelled"],
    ["failed", "cancelled"],
    ["some-unrecognized-status", "new"],
    [undefined, "new"],
  ];

  for (const [rawStatus, expected] of cases) {
    const entity: Record<string, unknown> = { currency: "PLN", grossAmount: 10 };
    if (rawStatus !== undefined) {
      entity.status = rawStatus;
    }
    const dataSource = dataSourceWithRows([row("woocommerce", "ext-status", "2026-08-03T10:00:00.000Z", entity)]);
    const result = await fetchOrdersList({ dataSource, dateRange: null, generatedAt, tenantId, workspaceId });
    assert.equal(
      result.records[0]!.status,
      expected,
      `raw status ${String(rawStatus)} should map to ${expected}`,
    );
  }
});

test("summary counts ready/warning/critical from the readiness bucket, over the full filtered set not just the page", async () => {
  const dataSource = dataSourceWithRows([
    row("woocommerce", "ext-fulfilled", "2026-08-03T10:00:00.000Z", { currency: "PLN", grossAmount: 10, status: "completed" }),
    row("woocommerce", "ext-paid", "2026-08-03T10:00:00.000Z", { currency: "PLN", grossAmount: 10, status: "processing" }),
    row("woocommerce", "ext-pending", "2026-08-03T10:00:00.000Z", { currency: "PLN", grossAmount: 10, status: "pending" }),
    row("woocommerce", "ext-cancelled", "2026-08-03T10:00:00.000Z", { currency: "PLN", grossAmount: 10, status: "cancelled" }),
  ]);

  const result = await fetchOrdersList({
    dataSource,
    dateRange: null,
    generatedAt,
    page: { cursor: null, limit: 1 },
    tenantId,
    workspaceId,
  });

  assert.equal(result.records.length, 1, "page itself must respect the requested limit");
  assert.deepEqual(
    { critical: result.summary.critical, ready: result.summary.ready, total: result.summary.total, warning: result.summary.warning },
    { critical: 1, ready: 2, total: 4, warning: 1 },
    "summary must reflect the whole filtered set, not just the one record on this page",
  );
});

test("filters: search matches externalOrderId/orderId, status and source narrow the result set", async () => {
  const dataSource = dataSourceWithRows([
    row("woocommerce", "ext-alpha", "2026-08-03T10:00:00.000Z", { currency: "PLN", grossAmount: 10, status: "completed" }),
    row("allegro", "ext-beta", "2026-08-03T10:00:00.000Z", { currency: "PLN", grossAmount: 10, status: "pending" }),
  ]);

  const bySearch = await fetchOrdersList({
    dataSource,
    dateRange: null,
    filters: { search: "alpha" },
    generatedAt,
    tenantId,
    workspaceId,
  });
  assert.deepEqual(bySearch.records.map((r) => r.externalOrderId), ["ext-alpha"]);

  const byStatus = await fetchOrdersList({
    dataSource,
    dateRange: null,
    filters: { status: ["new"] },
    generatedAt,
    tenantId,
    workspaceId,
  });
  assert.deepEqual(byStatus.records.map((r) => r.externalOrderId), ["ext-beta"]);

  const bySource = await fetchOrdersList({
    dataSource,
    dateRange: null,
    filters: { source: ["allegro"] },
    generatedAt,
    tenantId,
    workspaceId,
  });
  assert.deepEqual(bySource.records.map((r) => r.externalOrderId), ["ext-beta"]);
});

test("pagination: cursor advances through the filtered set and nextCursor is null once exhausted", async () => {
  const rows = ["a", "b", "c"].map((suffix, index) =>
    row("woocommerce", `ext-${suffix}`, `2026-08-0${3 + index}T10:00:00.000Z`, {
      currency: "PLN",
      grossAmount: 10,
      status: "completed",
    }),
  );
  const dataSource = dataSourceWithRows(rows);

  const firstPage = await fetchOrdersList({
    dataSource,
    dateRange: null,
    generatedAt,
    page: { cursor: null, limit: 2 },
    tenantId,
    workspaceId,
  });
  assert.equal(firstPage.records.length, 2);
  assert.ok(firstPage.pageInfo.nextCursor, "more records remain -- nextCursor must not be null");
  assert.equal(firstPage.pageInfo.total, 3);

  const secondPage = await fetchOrdersList({
    dataSource,
    dateRange: null,
    generatedAt,
    page: { cursor: firstPage.pageInfo.nextCursor, limit: 2 },
    tenantId,
    workspaceId,
  });
  assert.equal(secondPage.records.length, 1);
  assert.equal(secondPage.pageInfo.nextCursor, null, "exhausted set must not offer a further cursor");

  const combinedIds = [...firstPage.records, ...secondPage.records].map((r) => r.orderId).sort();
  assert.deepEqual(combinedIds, ["woocommerce:ext-a", "woocommerce:ext-b", "woocommerce:ext-c"].sort());
});

test("fetchOrderDetail finds a single order by orderId and returns null when it doesn't exist", async () => {
  const dataSource = dataSourceWithRows([
    row("woocommerce", "ext-1", "2026-08-03T10:00:00.000Z", { currency: "PLN", grossAmount: 10, status: "completed" }),
  ]);

  const found = await fetchOrderDetail({
    dataSource,
    dateRange: null,
    generatedAt,
    orderId: "woocommerce:ext-1",
    tenantId,
    workspaceId,
  });
  assert.ok(found);
  assert.equal(found!.externalOrderId, "ext-1");

  const missing = await fetchOrderDetail({
    dataSource,
    dateRange: null,
    generatedAt,
    orderId: "woocommerce:does-not-exist",
    tenantId,
    workspaceId,
  });
  assert.equal(missing, null);
});

test("fetchOrderDetail widens to a full-history floor when no date range is given, unlike the list's 30-day default", async () => {
  const dataSource = dataSourceWithRows([]);

  await fetchOrderDetail({ dataSource, dateRange: null, generatedAt, orderId: "woocommerce:x", tenantId, workspaceId });
  assert.equal(dataSource.calls.length, 1);
  assert.equal(dataSource.calls[0]!.businessTimeFrom, "2020-01-01T00:00:00.000Z");
  assert.equal(dataSource.calls[0]!.businessTimeTo, generatedAt);

  const listDataSource = dataSourceWithRows([]);
  await fetchOrdersList({ dataSource: listDataSource, dateRange: null, generatedAt, tenantId, workspaceId });
  assert.equal(listDataSource.calls.length, 1);
  assert.notEqual(
    listDataSource.calls[0]!.businessTimeFrom,
    "2020-01-01T00:00:00.000Z",
    "the list view's default window is a trailing 30 days, not full history",
  );
});
