import assert from "node:assert/strict";
import { test } from "node:test";
import { createRealMetricEngineInput, type CommandCenterDataSource } from "./command-center-metrics.real-source.ts";

const tenantId = "tenant_real_source";
const workspaceId = "workspace_real_source";
const periodStart = "2026-08-01T00:00:00.000Z";
const periodEnd = "2026-08-08T00:00:00.000Z";
const generatedAt = periodEnd;

function row(
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

function dataSourceWithRows(rows: readonly Record<string, unknown>[]): CommandCenterDataSource {
  return {
    async listCanonicalRecords() {
      return rows;
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

test("maps a real order row into a CanonicalOrderRecord using the ingested entity fields", async () => {
  const dataSource = dataSourceWithRows([
    row("woocommerce", "orders", "ext-order-1", "2026-08-03T10:00:00.000Z", {
      currency: "PLN",
      grossAmount: 199.5,
      orderId: "ext-order-1",
      orderNumber: "WC-100",
      updatedAt: "2026-08-03T10:00:00.000Z",
    }),
  ]);

  const input = await createRealMetricEngineInput({
    dataSource,
    generatedAt: generatedAt as any,
    periodEnd: periodEnd as any,
    periodStart: periodStart as any,
    tenantId,
    workspaceId,
  });

  assert.equal(input.canonicalOrders.length, 1);
  const order = input.canonicalOrders[0]!;
  assert.equal(order.externalOrderId, "ext-order-1");
  assert.equal(order.orderNumber, "WC-100");
  assert.equal(order.currency, "PLN");
  assert.equal(order.grossAmount, "199.50");
  assert.equal(order.providerId, "woocommerce");
  assert.equal(order.canonicalOrderId, "woocommerce:ext-order-1");
});

test("joins a refund to its order via the same deterministic id, without a lookup table", async () => {
  const dataSource = dataSourceWithRows([
    row("allegro", "orders", "ext-order-9", "2026-08-02T10:00:00.000Z", {
      currency: "PLN",
      grossAmount: 100,
      orderId: "ext-order-9",
      orderNumber: "AL-9",
    }),
    row("allegro", "refunds", "ext-refund-9", "2026-08-04T10:00:00.000Z", {
      amount: 20,
      currency: "PLN",
      orderId: "ext-order-9",
      refundId: "ext-refund-9",
    }),
  ]);

  const input = await createRealMetricEngineInput({
    dataSource,
    generatedAt: generatedAt as any,
    periodEnd: periodEnd as any,
    periodStart: periodStart as any,
    tenantId,
    workspaceId,
  });

  assert.equal(input.canonicalRefunds.length, 1);
  const refund = input.canonicalRefunds[0]!;
  assert.equal(refund.canonicalOrderId, "allegro:ext-order-9");
  assert.equal(refund.canonicalOrderId, input.canonicalOrders[0]!.canonicalOrderId);
});

test("skips rows missing their required numeric field instead of fabricating a zero", async () => {
  const dataSource = dataSourceWithRows([
    row("woocommerce", "orders", "ext-order-incomplete", "2026-08-03T10:00:00.000Z", {
      currency: "PLN",
      orderId: "ext-order-incomplete",
      orderNumber: "WC-INCOMPLETE",
      // grossAmount deliberately missing
    }),
  ]);

  const input = await createRealMetricEngineInput({
    dataSource,
    generatedAt: generatedAt as any,
    periodEnd: periodEnd as any,
    periodStart: periodStart as any,
    tenantId,
    workspaceId,
  });

  assert.equal(input.canonicalOrders.length, 0, "an order with no gross amount must not become a fabricated $0 order");
});

test("sets canonicalProductId on an inventory snapshot only when a matching product was also ingested in the window", async () => {
  const withProduct = dataSourceWithRows([
    row("woocommerce", "products", "sku-1", "2026-08-02T10:00:00.000Z", {
      name: "Mug",
      productId: "sku-1",
      sku: "PAPA-MUG",
    }),
    row("woocommerce", "inventory", "sku-1", "2026-08-03T10:00:00.000Z", {
      availableQuantity: 12,
      productId: "sku-1",
    }),
  ]);
  const withoutProduct = dataSourceWithRows([
    row("woocommerce", "inventory", "sku-2", "2026-08-03T10:00:00.000Z", {
      availableQuantity: 12,
      productId: "sku-2",
    }),
  ]);

  const mapped = await createRealMetricEngineInput({
    dataSource: withProduct,
    generatedAt: generatedAt as any,
    periodEnd: periodEnd as any,
    periodStart: periodStart as any,
    tenantId,
    workspaceId,
  });
  const unmapped = await createRealMetricEngineInput({
    dataSource: withoutProduct,
    generatedAt: generatedAt as any,
    periodEnd: periodEnd as any,
    periodStart: periodStart as any,
    tenantId,
    workspaceId,
  });

  assert.equal(mapped.canonicalInventorySnapshots[0]!.canonicalProductId, "woocommerce:sku-1");
  assert.equal(unmapped.canonicalInventorySnapshots[0]!.canonicalProductId, null);
});

test("an empty ingestion window produces empty canonical arrays, no primary inventory source, and no product costs", async () => {
  const input = await createRealMetricEngineInput({
    dataSource: dataSourceWithRows([]),
    generatedAt: generatedAt as any,
    periodEnd: periodEnd as any,
    periodStart: periodStart as any,
    tenantId,
    workspaceId,
  });

  assert.deepEqual(input.canonicalOrders, []);
  assert.deepEqual(input.canonicalOrderLines, []);
  assert.deepEqual(input.canonicalCustomerReturns, []);
  assert.deepEqual(input.productCosts, []);
  assert.equal(input.primaryInventorySource, null);
  assert.deepEqual(input.reconciliationReports, []);
});

test("a failed reconciliation run produces a global mismatch report", async () => {
  const dataSource: CommandCenterDataSource = {
    ...dataSourceWithRows([]),
    async latestReconciliationRun() {
      return { created_at: new Date("2026-08-05T00:00:00.000Z"), id: "run-1", status: "failed" };
    },
  };

  const input = await createRealMetricEngineInput({
    dataSource,
    generatedAt: generatedAt as any,
    periodEnd: periodEnd as any,
    periodStart: periodStart as any,
    tenantId,
    workspaceId,
  });

  assert.equal(input.reconciliationReports.length, 1);
  assert.equal(input.reconciliationReports[0]!.status, "mismatch");
});
