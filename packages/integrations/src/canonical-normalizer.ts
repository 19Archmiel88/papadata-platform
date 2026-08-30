import { normalizeCurrencyCode } from "@papadata/contracts";
import type { MvpIntegrationCatalogProviderId } from "@papadata/contracts";
import { isRecord, readNumberField, readStringField } from "./http.js";

export const CANONICAL_PROVIDER_RECORD_VERSION = "integration.canonical.v2";

export type CanonicalProviderRecord = {
  readonly version: typeof CANONICAL_PROVIDER_RECORD_VERSION;
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly stream: string;
  readonly externalId: string;
  readonly occurredAt: string | null;
  readonly entity: Readonly<Record<string, unknown>>;
  readonly quality: {
    readonly status: "valid" | "partial";
    readonly missingFields: readonly string[];
  };
};

export function normalizeProviderRecord(input: {
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly stream: string;
  readonly externalId: string;
  readonly observedAt: string;
  readonly payload: unknown;
}): CanonicalProviderRecord {
  const raw = unwrapPayload(input.payload);
  const normalized = normalizeStream(input.stream, raw, input.observedAt);
  const missingFields = requiredFields(input.stream).filter(
    (field) => readPath(normalized.entity, field) === null,
  );
  return {
    version: CANONICAL_PROVIDER_RECORD_VERSION,
    providerId: input.providerId,
    stream: input.stream,
    externalId: input.externalId,
    occurredAt: normalized.occurredAt,
    entity: normalized.entity,
    quality: {
      status: missingFields.length === 0 ? "valid" : "partial",
      missingFields,
    },
  };
}

function normalizeStream(
  stream: string,
  payload: Readonly<Record<string, unknown>>,
  observedAt: string,
): { readonly occurredAt: string | null; readonly entity: Readonly<Record<string, unknown>> } {
  switch (stream) {
    case "orders":
      return normalizeOrder(payload, observedAt);
    case "refunds":
      return normalizeRefund(payload, observedAt);
    case "products":
      return normalizeProduct(payload, observedAt);
    case "inventory":
      return normalizeInventory(payload, observedAt);
    case "ad_spend":
      return normalizeAdSpend(payload, observedAt);
    case "attributed_conversions":
      return normalizeAttributedConversion(payload, observedAt);
    case "traffic":
    case "events":
    case "conversions":
      return normalizeAnalytics(stream, payload, observedAt);
    default:
      return {
        occurredAt: firstDate(payload, observedAt),
        entity: { payload },
      };
  }
}

function normalizeOrder(payload: Readonly<Record<string, unknown>>, observedAt: string) {
  const amount = firstNumber(payload,
    "total", "current_total_price", "totalPrice", "price.amount",
    "currentTotalPriceSet.shopMoney.amount", "summary.totalToPay.amount");
  const currency = firstString(payload,
    "currency", "currencyCode", "price.currency",
    "currentTotalPriceSet.shopMoney.currencyCode", "summary.totalToPay.currency");
  const lineItems = firstArray(payload, "line_items", "lineItems.nodes", "products", "items");
  return {
    occurredAt: firstDate(payload, observedAt),
    entity: {
      orderId: firstString(payload, "id", "order_id", "orderId", "checkoutForm.id"),
      orderNumber: firstString(payload, "number", "name", "order_number", "orderNumber"),
      status: firstString(payload, "status", "displayFinancialStatus", "order_status"),
      fulfillmentStatus: firstString(payload, "displayFulfillmentStatus", "fulfillment_status"),
      currency: normalizeCurrencyCode(currency),
      grossAmount: amount,
      lineItemCount: lineItems.length,
      lineItems: lineItems.map((item) => normalizeOrderLineItem(item)),
      customerReference: firstString(payload,
        "customer.id", "customer.email", "email", "buyer.email", "deliveryAddress.email"),
      updatedAt: firstString(payload, "updated_at", "updatedAt", "date_modified_gmt", "updatedAt"),
    },
  };
}

/**
 * Preserves per-line productId/quantity/amount from a raw order-line payload
 * instead of discarding it down to a bare count — needed for a real
 * "revenue per product" breakdown. Field paths cover the provider shapes
 * seen elsewhere in this file (WooCommerce `line_items`, Shopify
 * `lineItems.nodes`, BaseLinker/Allegro `products`/`items`); a line whose
 * shape doesn't match any known path yields null fields rather than a
 * fabricated value, and is dropped downstream instead of counted.
 */
function normalizeOrderLineItem(item: unknown): Readonly<Record<string, unknown>> {
  if (!isRecord(item)) {
    return { externalProductId: null, grossAmount: null, quantity: null };
  }

  return {
    externalProductId: firstString(item,
      "product_id", "productId", "product.id", "offer.id", "sku"),
    grossAmount: firstNumber(item,
      "total", "totalPrice", "originalTotalSet.shopMoney.amount", "price.amount", "price", "priceBrutto"),
    quantity: firstNumber(item, "quantity", "qty"),
  };
}

function normalizeRefund(payload: Readonly<Record<string, unknown>>, observedAt: string) {
  return {
    occurredAt: firstDate(payload, observedAt),
    entity: {
      refundId: firstString(payload, "id", "refund_id", "refundId", "claim.id"),
      orderId: firstString(payload, "order_id", "orderId", "checkoutForm.id"),
      status: firstString(payload, "status", "state"),
      currency: normalizeCurrencyCode(firstString(payload,
        "currency", "currencyCode", "amount.currency", "totalRefundedSet.shopMoney.currencyCode")),
      amount: firstNumber(payload,
        "amount", "total", "value", "totalRefundedSet.shopMoney.amount"),
      reason: firstString(payload, "reason", "note", "message"),
    },
  };
}

function normalizeProduct(payload: Readonly<Record<string, unknown>>, observedAt: string) {
  const nested = isRecord(payload.product) ? payload.product : payload;
  return {
    occurredAt: firstDate(nested, observedAt),
    entity: {
      productId: firstString(nested, "id", "product_id", "productId", "offer.id"),
      sku: firstString(nested, "sku", "ean", "external_id", "merchantProductNo"),
      name: firstString(nested, "name", "title"),
      status: firstString(nested, "status", "publication.status"),
      currency: normalizeCurrencyCode(firstString(nested,
        "currency", "price.currency", "variants.0.price.currencyCode")),
      price: firstNumber(nested, "price", "regular_price", "price.amount", "variants.0.price.amount"),
      inventoryQuantity: firstNumber(nested,
        "stock_quantity", "quantity", "stock", "sellingMode.stock.available"),
    },
  };
}

function normalizeInventory(payload: Readonly<Record<string, unknown>>, observedAt: string) {
  const nested = isRecord(payload.product) ? payload.product : payload;
  return {
    occurredAt: firstDate(nested, observedAt),
    entity: {
      inventoryId: firstString(payload, "inventoryId", "inventory_id", "location_id"),
      productId: firstString(nested, "id", "product_id", "productId"),
      sku: firstString(nested, "sku", "ean"),
      availableQuantity: firstNumber(nested,
        "stock_quantity", "quantity", "available", "inventoryQuantity", "sellingMode.stock.available"),
    },
  };
}

function normalizeAdSpend(payload: Readonly<Record<string, unknown>>, observedAt: string) {
  return {
    occurredAt: firstDate(payload, observedAt),
    entity: {
      date: firstString(payload, "date", "date_start", "segments.date"),
      accountId: firstString(payload, "account_id", "customer.id", "customerId"),
      campaignId: firstString(payload, "campaign_id", "campaign.id", "campaignId"),
      campaignName: firstString(payload, "campaign_name", "campaign.name", "campaignName"),
      campaignStatus: firstString(payload, "campaign_status", "campaign.status", "campaignStatus"),
      currency: normalizeCurrencyCode(firstString(payload,
        "account_currency", "customer.currency_code", "currency")),
      spend: firstNumber(payload, "spend", "cost", "metrics.cost_micros", "costMicros"),
      impressions: firstNumber(payload, "impressions", "metrics.impressions"),
      clicks: firstNumber(payload, "clicks", "metrics.clicks"),
    },
  };
}

function normalizeAttributedConversion(payload: Readonly<Record<string, unknown>>, observedAt: string) {
  // Google Ads exposes scalar metrics while Meta Ads exposes conversion counts
  // and values as arrays of `{action_type, value}` records. Treating Meta's
  // arrays as scalars silently produced null conversions/revenue. Prefer a
  // single purchase action by deterministic priority so overlapping Meta
  // action types are not summed and double-counted.
  const conversions = firstNumber(payload, "conversions", "metrics.conversions")
    ?? firstMetaPurchaseActionValue(payload, "actions");
  const conversionValue = firstNumber(
    payload,
    "conversion_value",
    "metrics.conversions_value",
    "purchaseValue",
  ) ?? firstMetaPurchaseActionValue(payload, "action_values");

  return {
    occurredAt: firstDate(payload, observedAt),
    entity: {
      date: firstString(payload, "date", "date_start", "segments.date"),
      campaignId: firstString(payload, "campaign_id", "campaign.id", "campaignId"),
      currency: normalizeCurrencyCode(firstString(payload,
        "account_currency", "customer.currency_code", "currency")),
      conversions,
      conversionValue,
    },
  };
}


const META_PURCHASE_ACTION_PRIORITY = [
  "purchase",
  "omni_purchase",
  "offsite_conversion.fb_pixel_purchase",
  "onsite_conversion.purchase",
  "offsite_conversion.purchase",
  "web_in_store_purchase",
] as const;

function firstMetaPurchaseActionValue(
  payload: Readonly<Record<string, unknown>>,
  path: "actions" | "action_values",
): number | null {
  const rows = readPath(payload, path);
  if (!Array.isArray(rows)) return null;

  for (const actionType of META_PURCHASE_ACTION_PRIORITY) {
    for (const row of rows) {
      if (!isRecord(row)) continue;
      const rowType = firstString(row, "action_type", "actionType");
      if (rowType !== actionType) continue;
      const value = firstNumber(row, "value");
      if (value !== null) return Math.max(0, value);
    }
  }
  return null;
}

function normalizeAnalytics(
  stream: string,
  payload: Readonly<Record<string, unknown>>,
  observedAt: string,
) {
  const date = firstString(payload, "date", "dateHour", "firstSessionDate");
  return {
    occurredAt: date ? normalizeDate(date) : firstDate(payload, observedAt),
    entity: {
      analyticsType: stream,
      date,
      source: firstString(payload,
        "sessionSource", "source", "firstUserSource", "sessionSourceMedium"),
      channel: firstString(payload, "sessionDefaultChannelGroup", "defaultChannelGroup"),
      medium: firstString(payload, "sessionMedium", "medium", "firstUserMedium"),
      campaign: firstString(payload, "sessionCampaignName", "campaign", "firstUserCampaignName"),
      landingPage: firstString(payload, "landingPagePlusQueryString", "landingPage"),
      eventName: firstString(payload, "eventName"),
      sessions: firstNumber(payload, "sessions"),
      users: firstNumber(payload, "totalUsers", "activeUsers", "users"),
      newUsers: firstNumber(payload, "newUsers"),
      engagedSessions: firstNumber(payload, "engagedSessions"),
      eventCount: firstNumber(payload, "eventCount", "events"),
      conversions: firstNumber(payload, "keyEvents", "conversions", "transactions"),
      transactions: firstNumber(payload, "transactions"),
      revenue: firstNumber(payload, "purchaseRevenue", "totalRevenue", "revenue"),
      currency: normalizeCurrencyCode(firstString(payload, "currencyCode", "currency")),
    },
  };
}

function requiredFields(stream: string): readonly string[] {
  switch (stream) {
    case "orders": return ["orderId", "currency"];
    case "products": return ["productId"];
    case "inventory": return ["productId"];
    case "refunds": return ["refundId"];
    case "ad_spend": return ["date", "campaignId"];
    case "attributed_conversions": return ["date", "campaignId"];
    case "traffic": return ["date", "channel", "sessions", "users"];
    case "events": return ["date", "eventName", "eventCount"];
    case "conversions": return ["date", "conversions"];
    default: return [];
  }
}

function unwrapPayload(value: unknown): Readonly<Record<string, unknown>> {
  if (!isRecord(value)) return { value };
  if (isRecord(value.payload)) return value.payload;
  return value;
}

function firstString(payload: Readonly<Record<string, unknown>>, ...paths: readonly string[]): string | null {
  for (const path of paths) {
    const value = readPath(payload, path);
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return readStringField(payload, ...paths.filter((path) => !path.includes(".")));
}

function firstNumber(payload: Readonly<Record<string, unknown>>, ...paths: readonly string[]): number | null {
  for (const path of paths) {
    const value = readPath(payload, path);
    if (typeof value === "number" && Number.isFinite(value)) {
      return path.toLowerCase().includes("micros") ? value / 1_000_000 : value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value.replace(",", "."));
      if (Number.isFinite(parsed)) return path.toLowerCase().includes("micros") ? parsed / 1_000_000 : parsed;
    }
  }
  return readNumberField(payload, ...paths.filter((path) => !path.includes(".")));
}

function firstArray(payload: Readonly<Record<string, unknown>>, ...paths: readonly string[]): readonly unknown[] {
  for (const path of paths) {
    const value = readPath(payload, path);
    if (Array.isArray(value)) return value;
  }
  return [];
}

function firstDate(payload: Readonly<Record<string, unknown>>, fallback: string): string | null {
  for (const path of [
    "updated_at", "updatedAt", "date_modified_gmt", "created_at", "createdAt",
    "date_created_gmt", "lineItems.0.boughtAt", "date_start", "segments.date", "date",
  ]) {
    const value = readPath(payload, path);
    if (typeof value === "string") {
      const normalized = normalizeDate(value);
      if (normalized) return normalized;
    }
  }
  return normalizeDate(fallback);
}

function normalizeDate(value: string): string | null {
  if (/^\d{8}$/u.test(value)) {
    const expanded = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00.000Z`;
    return Number.isFinite(Date.parse(expanded)) ? expanded : null;
  }
  if (/^\d{4}-\d{2}-\d{2}$/u.test(value)) return `${value}T00:00:00.000Z`;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function readPath(value: unknown, path: string): unknown {
  let current: unknown = value;
  for (const segment of path.split(".")) {
    if (Array.isArray(current)) {
      const index = Number(segment);
      if (!Number.isInteger(index)) return null;
      current = current[index];
      continue;
    }
    if (!isRecord(current)) return null;
    current = current[segment];
  }
  return current ?? null;
}
