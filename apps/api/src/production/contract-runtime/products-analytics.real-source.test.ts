import assert from "node:assert/strict";
import { test } from "node:test";
import {
  fetchProductDetail,
  fetchProductsList,
  type ProductsDataSource,
} from "./products-analytics.real-source.ts";

const tenantId = "tenant_products_real_source";
const workspaceId = "workspace_products_real_source";
const generatedAt = "2026-08-08T00:00:00.000Z";

function productRow(
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
    stream: "products",
  };
}

function orderRow(
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

function dataSourceWithRows(
  productRows: readonly Record<string, unknown>[],
  orderRows: readonly Record<string, unknown>[],
): ProductsDataSource & { readonly calls: Array<{ businessTimeFrom: string; businessTimeTo: string; streams: readonly string[] }> } {
  const calls: Array<{ businessTimeFrom: string; businessTimeTo: string; streams: readonly string[] }> = [];
  return {
    calls,
    async listCanonicalRecords(_tenantId, _workspaceId, input) {
      calls.push({
        businessTimeFrom: input.businessTimeFrom,
        businessTimeTo: input.businessTimeTo,
        streams: input.streams,
      });
      if (input.streams.includes("products")) {
        return productRows;
      }
      if (input.streams.includes("orders")) {
        return orderRows;
      }
      return [];
    },
  };
}

test("maps a real canonical product row into a ProductsRecord-shaped record", async () => {
  const dataSource = dataSourceWithRows(
    [productRow("woocommerce", "ext-1", "2026-08-03T10:00:00.000Z", { name: "Kubek termiczny", sku: "MUG-1", status: "publish" })],
    [],
  );

  const result = await fetchProductsList({ dataSource, dateRange: null, generatedAt, tenantId, workspaceId });

  assert.equal(result.records.length, 1);
  const record = result.records[0]!;
  assert.equal(record.productId, "woocommerce:ext-1");
  assert.equal(record.name, "Kubek termiczny");
  assert.equal(record.sku, "MUG-1");
  assert.equal(record.status, "active");
  assert.equal(record.category, null, "no category field exists in the canonical product entity -- must not fabricate one");
  assert.equal(record.margin, null, "no real COGS source exists yet -- must not fabricate a margin");
  assert.equal(record.revenue.amount, 0, "no matching order lines in this window");
  assert.equal(record.units, 0);
});

test("drops a product row missing its required name instead of fabricating one", async () => {
  const dataSource = dataSourceWithRows(
    [productRow("woocommerce", "ext-noname", "2026-08-03T10:00:00.000Z", { sku: "MUG-1", status: "publish" })],
    [],
  );

  const result = await fetchProductsList({ dataSource, dateRange: null, generatedAt, tenantId, workspaceId });
  assert.equal(result.records.length, 0);
});

test("buckets known raw provider statuses into the contract's ProductStatus vocabulary; unknown falls to 'inactive'", async () => {
  const cases: ReadonlyArray<[string | undefined, string]> = [
    ["publish", "active"],
    ["published", "active"],
    ["draft", "inactive"],
    ["private", "inactive"],
    ["trash", "archived"],
    ["some-unrecognized-status", "inactive"],
    [undefined, "inactive"],
  ];

  for (const [rawStatus, expected] of cases) {
    const entity: Record<string, unknown> = { name: "P" };
    if (rawStatus !== undefined) {
      entity.status = rawStatus;
    }
    const dataSource = dataSourceWithRows(
      [productRow("woocommerce", "ext-status", "2026-08-03T10:00:00.000Z", entity)],
      [],
    );
    const result = await fetchProductsList({ dataSource, dateRange: null, generatedAt, tenantId, workspaceId });
    assert.equal(
      result.records[0]!.status,
      expected,
      `raw status ${String(rawStatus)} should map to ${expected}`,
    );
  }
});

test("aggregates order-line revenue/units per catalogued product from real order line items", async () => {
  const dataSource = dataSourceWithRows(
    [
      productRow("woocommerce", "p1", "2026-08-01T00:00:00.000Z", { name: "Product One", sku: "SKU-1", status: "publish" }),
    ],
    [
      orderRow("woocommerce", "order-1", "2026-08-03T10:00:00.000Z", {
        currency: "PLN",
        lineItems: [{ externalProductId: "p1", grossAmount: 50, quantity: 2 }],
      }),
      orderRow("woocommerce", "order-2", "2026-08-04T10:00:00.000Z", {
        currency: "PLN",
        lineItems: [{ externalProductId: "p1", grossAmount: 25, quantity: 1 }],
      }),
    ],
  );

  const result = await fetchProductsList({ dataSource, dateRange: null, generatedAt, tenantId, workspaceId });
  assert.equal(result.records.length, 1);
  const record = result.records[0]!;
  assert.equal(record.revenue.amount, 75);
  assert.equal(record.revenue.currency, "PLN");
  assert.equal(record.units, 3);
});

test("a line referencing a product outside the catalog surfaces as a missingMapping record, not silently dropped", async () => {
  const dataSource = dataSourceWithRows(
    [],
    [
      orderRow("woocommerce", "order-1", "2026-08-03T10:00:00.000Z", {
        currency: "PLN",
        lineItems: [{ externalProductId: "unknown-product", grossAmount: 40, quantity: 2 }],
      }),
    ],
  );

  const result = await fetchProductsList({ dataSource, dateRange: null, generatedAt, tenantId, workspaceId });
  assert.equal(result.records.length, 1);
  const record = result.records[0]!;
  assert.equal(record.productId, "woocommerce:unknown-product");
  assert.equal(record.status, "missingMapping");
  assert.equal(record.name, "unknown-product", "surfaces the real external id, not a fabricated display name");
  assert.equal(record.revenue.amount, 40);
  assert.equal(record.units, 2);
  assert.equal(record.sku, null);
});

test("a line with no externalProductId at all is not attributed to anything", async () => {
  const dataSource = dataSourceWithRows(
    [],
    [
      orderRow("woocommerce", "order-1", "2026-08-03T10:00:00.000Z", {
        currency: "PLN",
        lineItems: [{ grossAmount: 40, quantity: 2 }],
      }),
    ],
  );

  const result = await fetchProductsList({ dataSource, dateRange: null, generatedAt, tenantId, workspaceId });
  assert.equal(result.records.length, 0);
});

test("summary counts ready/warning/critical from the readiness bucket, over the full filtered set not just the page", async () => {
  const dataSource = dataSourceWithRows(
    [
      productRow("woocommerce", "active-1", "2026-08-01T00:00:00.000Z", { name: "A", status: "publish" }),
      productRow("woocommerce", "active-2", "2026-08-01T00:00:00.000Z", { name: "B", status: "publish" }),
      productRow("woocommerce", "draft-1", "2026-08-01T00:00:00.000Z", { name: "C", status: "draft" }),
    ],
    [
      orderRow("woocommerce", "order-1", "2026-08-03T10:00:00.000Z", {
        currency: "PLN",
        lineItems: [{ externalProductId: "orphan", grossAmount: 10, quantity: 1 }],
      }),
    ],
  );

  const result = await fetchProductsList({
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
    "summary must reflect the whole filtered set (2 catalogued active + 1 draft + 1 missingMapping), not just the one record on this page",
  );
});

test("filters: search matches productId/name/sku, status and source narrow the result set", async () => {
  const dataSource = dataSourceWithRows(
    [
      productRow("woocommerce", "ext-alpha", "2026-08-01T00:00:00.000Z", { name: "Alpha Mug", sku: "ALPHA-1", status: "publish" }),
      productRow("allegro", "ext-beta", "2026-08-01T00:00:00.000Z", { name: "Beta Bottle", sku: "BETA-1", status: "draft" }),
    ],
    [],
  );

  const bySearch = await fetchProductsList({
    dataSource,
    dateRange: null,
    filters: { search: "alpha" },
    generatedAt,
    tenantId,
    workspaceId,
  });
  assert.deepEqual(bySearch.records.map((r) => r.productId), ["woocommerce:ext-alpha"]);

  const byStatus = await fetchProductsList({
    dataSource,
    dateRange: null,
    filters: { status: ["inactive"] },
    generatedAt,
    tenantId,
    workspaceId,
  });
  assert.deepEqual(byStatus.records.map((r) => r.productId), ["allegro:ext-beta"]);

  const bySource = await fetchProductsList({
    dataSource,
    dateRange: null,
    filters: { source: ["allegro"] },
    generatedAt,
    tenantId,
    workspaceId,
  });
  assert.deepEqual(bySource.records.map((r) => r.productId), ["allegro:ext-beta"]);
});

test("fetchProductDetail finds a single product by productId and returns null when it doesn't exist", async () => {
  const dataSource = dataSourceWithRows(
    [productRow("woocommerce", "ext-1", "2026-08-01T00:00:00.000Z", { name: "Product One", status: "publish" })],
    [],
  );

  const found = await fetchProductDetail({
    dataSource,
    dateRange: null,
    generatedAt,
    productId: "woocommerce:ext-1",
    tenantId,
    workspaceId,
  });
  assert.ok(found);
  assert.equal(found!.name, "Product One");

  const missing = await fetchProductDetail({
    dataSource,
    dateRange: null,
    generatedAt,
    productId: "woocommerce:does-not-exist",
    tenantId,
    workspaceId,
  });
  assert.equal(missing, null);
});

test("the product catalog itself always looks back to the full-history floor, unlike the revenue window", async () => {
  const dataSource = dataSourceWithRows([], []);

  await fetchProductsList({ dataSource, dateRange: null, generatedAt, tenantId, workspaceId });
  const catalogCall = dataSource.calls.find((call) => call.streams.includes("products"));
  const revenueCall = dataSource.calls.find((call) => call.streams.includes("orders"));
  assert.ok(catalogCall);
  assert.ok(revenueCall);
  assert.equal(catalogCall!.businessTimeFrom, "2020-01-01T00:00:00.000Z");
  assert.notEqual(
    revenueCall!.businessTimeFrom,
    "2020-01-01T00:00:00.000Z",
    "the revenue window's default is a trailing 30 days, not full history",
  );
});

test("fetchProductDetail widens the revenue window to a full-history floor when no date range is given", async () => {
  const dataSource = dataSourceWithRows([], []);

  await fetchProductDetail({ dataSource, dateRange: null, generatedAt, productId: "woocommerce:x", tenantId, workspaceId });
  const revenueCall = dataSource.calls.find((call) => call.streams.includes("orders"));
  assert.ok(revenueCall);
  assert.equal(revenueCall!.businessTimeFrom, "2020-01-01T00:00:00.000Z");
  assert.equal(revenueCall!.businessTimeTo, generatedAt);
});
