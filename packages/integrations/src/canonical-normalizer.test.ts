import assert from "node:assert/strict";
import test from "node:test";
import { normalizeProviderRecord } from "./canonical-normalizer.ts";

test("normalizes WooCommerce order into canonical v2 shape", () => {
  const record = normalizeProviderRecord({
    providerId: "woocommerce",
    stream: "orders",
    externalId: "42",
    observedAt: "2026-08-06T00:00:00.000Z",
    payload: {
      id: 42,
      status: "processing",
      currency: "pln",
      total: "123.45",
      date_modified_gmt: "2026-08-05T10:00:00Z",
      line_items: [{ id: 1 }, { id: 2 }],
      customer_id: 9,
    },
  });
  assert.equal(record.version, "integration.canonical.v2");
  assert.equal(record.entity.orderId, "42");
  assert.equal(record.entity.currency, "PLN");
  assert.equal(record.entity.grossAmount, 123.45);
  assert.equal(record.entity.lineItemCount, 2);
  assert.equal(record.quality.status, "valid");
});

test("preserves real per-line productId/quantity/amount for a WooCommerce order, without fabricating values for a malformed line", () => {
  const record = normalizeProviderRecord({
    providerId: "woocommerce",
    stream: "orders",
    externalId: "42",
    observedAt: "2026-08-06T00:00:00.000Z",
    payload: {
      id: 42,
      status: "processing",
      currency: "pln",
      total: "150.00",
      line_items: [
        { product_id: 7, quantity: 2, total: "100.00" },
        { garbage: true }, // no recognizable product/quantity/amount fields.
      ],
    },
  });

  const lineItems = record.entity.lineItems as ReadonlyArray<Record<string, unknown>>;
  assert.equal(lineItems.length, 2);
  assert.deepEqual(lineItems[0], { externalProductId: "7", grossAmount: 100, quantity: 2 });
  assert.deepEqual(lineItems[1], { externalProductId: null, grossAmount: null, quantity: null });
});

test("normalizes Google Ads micros and conversion metrics", () => {
  const spend = normalizeProviderRecord({
    providerId: "google_ads",
    stream: "ad_spend",
    externalId: "campaign-1:2026-08-05",
    observedAt: "2026-08-06T00:00:00.000Z",
    payload: {
      segments: { date: "2026-08-05" },
      campaign: { id: "campaign-1", name: "Brand" },
      customer: { currency_code: "EUR" },
      metrics: { cost_micros: "1250000", impressions: "50", clicks: "4" },
    },
  });
  assert.equal(spend.entity.spend, 1.25);
  assert.equal(spend.entity.currency, "EUR");
  assert.equal(spend.entity.campaignId, "campaign-1");
  assert.equal(spend.quality.status, "valid");
});
