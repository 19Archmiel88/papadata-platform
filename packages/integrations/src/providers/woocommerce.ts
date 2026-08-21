import { randomUUID } from "node:crypto";
import type {
  IntegrationProviderAdapter,
  ProviderFetchRequest,
  ProviderFetchResult,
  ProviderRecord,
} from "../provider-adapter.js";
import { ProviderAdapterError } from "../provider-adapter.js";
import {
  FetchProviderHttpClient,
  type ProviderHttpClient,
  isRecord,
  readArrayField,
  readStringField,
} from "../http.js";

export type WooCommerceAdapterConfig = {
  readonly storeUrl: string;
  readonly consumerKey: string;
  readonly consumerSecret: string;
};

export class WooCommerceAdapter implements IntegrationProviderAdapter {
  readonly providerId = "woocommerce" as const;
  readonly requiredScopes = ["read"] as const;
  readonly optionalScopes = ["write_webhooks"] as const;

  private readonly config: WooCommerceAdapterConfig | null;
  private readonly http: ProviderHttpClient;

  constructor(
    config: WooCommerceAdapterConfig | null,
    http: ProviderHttpClient = new FetchProviderHttpClient(),
  ) {
    this.config = config;
    this.http = http;
  }

  isConfigured(): boolean {
    return Boolean(
      this.config?.storeUrl
      && this.config.consumerKey
      && this.config.consumerSecret,
    );
  }

  async verifyConnection(): Promise<void> {
    await this.requestJson("system_status");
  }

  async fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult> {
    const observedAt = new Date().toISOString();
    const records: ProviderRecord[] = [];
    const limitations: string[] = [];
    const from = request.from ?? checkpointDate(request.checkpoint);
    const to = request.to;

    for (const stream of request.streams) {
      if (stream === "orders") {
        const orders = await this.fetchPages("orders", {
          after: from,
          before: to,
          order: "asc",
          orderby: "modified",
          status: "any",
        });
        records.push(...orders.map((order) => ({
          stream,
          externalId: readStringField(order, "id", "number") ?? randomUUID(),
          observedAt,
          payload: order,
        })));
        continue;
      }

      if (stream === "products" || stream === "inventory") {
        const products = await this.fetchPages("products", {
          after: from,
          before: to,
          order: "asc",
          orderby: "modified",
          status: "any",
        });
        records.push(...products.map((product) => ({
          stream,
          externalId: readStringField(product, "id", "sku") ?? randomUUID(),
          observedAt,
          payload: product,
        })));
        continue;
      }

      if (stream === "refunds") {
        records.push(...await this.fetchRefundRecords({
          from,
          to,
          observedAt,
          limitations,
        }));
      }
    }

    return {
      records,
      nextCheckpoint: JSON.stringify({ modifiedAfter: observedAt }),
      partial: false,
      limitations,
    };
  }

  private async fetchRefundRecords(input: {
    readonly from: string | null;
    readonly to: string | null;
    readonly observedAt: string;
    readonly limitations: string[];
  }): Promise<readonly ProviderRecord[]> {
    try {
      // WooCommerce >= 9.0 exposes /wc/v3/refunds independently of parent
      // orders. That is the correct source for a date-bounded refund stream:
      // a refund created today for an order created years ago must still be
      // discoverable without scanning an arbitrary order-history window.
      const refunds = await this.fetchPages("refunds", {
        after: input.from,
        before: input.to,
        order: "asc",
      });
      return this.toRefundRecords(refunds, input);
    } catch (error) {
      if (!isGlobalRefundEndpointUnavailable(error)) {
        throw error;
      }

      input.limitations.push(
        "WooCommerce /wc/v3/refunds is unavailable; used complete paginated order-history fallback without an arbitrary lower-date floor.",
      );
      return this.fetchRefundRecordsViaOrders(input);
    }
  }

  private async fetchRefundRecordsViaOrders(input: {
    readonly from: string | null;
    readonly to: string | null;
    readonly observedAt: string;
    readonly limitations: string[];
  }): Promise<readonly ProviderRecord[]> {
    // Compatibility fallback for WooCommerce < 9.0. Do not add a fixed
    // discovery floor here: completeness is more important than speed for
    // this fallback, because a recent refund can reference an arbitrarily
    // old order. fetchPages() provides full pagination.
    const orders = await this.fetchPages("orders", {
      after: null,
      before: input.to,
      order: "asc",
      orderby: "date",
      status: "any",
    });
    const records: ProviderRecord[] = [];

    for (const order of orders) {
      const orderId = readStringField(order, "id", "number");
      if (!orderId) continue;
      const currency = readStringField(order, "currency");
      const refundRefs = readArrayField(order, "refunds");

      for (const refundRef of refundRefs) {
        const refundId = readStringField(refundRef, "id");
        if (!refundId) continue;

        let refundDetail: unknown = refundRef;
        try {
          const detail = await this.requestJson(`orders/${orderId}/refunds/${refundId}`);
          refundDetail = detail.data;
        } catch {
          input.limitations.push(
            `Could not fetch full refund detail for order ${orderId} refund ${refundId}; using the embedded order reference only.`,
          );
        }

        if (!isRefundWithinWindow(refundDetail, input.from, input.to)) {
          continue;
        }

        const refundPayload = normalizeRefundPayload(
          isRecord(refundDetail) ? refundDetail : { id: refundId },
        );
        records.push({
          stream: "refunds",
          externalId: refundId,
          observedAt: input.observedAt,
          payload: {
            ...refundPayload,
            currency,
            orderId,
          },
        });
      }
    }

    return records;
  }

  private async toRefundRecords(
    refunds: readonly unknown[],
    input: {
      readonly from: string | null;
      readonly to: string | null;
      readonly observedAt: string;
      readonly limitations: string[];
    },
  ): Promise<readonly ProviderRecord[]> {
    const records: ProviderRecord[] = [];
    const currencyByOrderId = new Map<string, string | null>();

    for (const refund of refunds) {
      if (!isRefundWithinWindow(refund, input.from, input.to)) {
        continue;
      }

      const refundId = readStringField(refund, "id", "refund_id", "refundId");
      if (!refundId) {
        input.limitations.push("WooCommerce returned a refund without an id; the record was skipped.");
        continue;
      }

      const orderId = readStringField(refund, "parent_id", "order_id", "orderId");
      let currency: string | null = null;
      if (orderId) {
        if (!currencyByOrderId.has(orderId)) {
          try {
            const order = await this.requestJson(`orders/${orderId}`);
            currencyByOrderId.set(orderId, readStringField(order.data, "currency"));
          } catch {
            currencyByOrderId.set(orderId, null);
            input.limitations.push(
              `Could not fetch order ${orderId} while enriching refund ${refundId} with currency.`,
            );
          }
        }
        currency = currencyByOrderId.get(orderId) ?? null;
      }

      const refundPayload = normalizeRefundPayload(
        isRecord(refund) ? refund : { id: refundId },
      );
      records.push({
        stream: "refunds",
        externalId: refundId,
        observedAt: input.observedAt,
        payload: {
          ...refundPayload,
          currency,
          orderId,
        },
      });
    }

    return records;
  }

  private async fetchPages(
    resource: string,
    filters: Readonly<Record<string, string | null>>,
  ): Promise<readonly unknown[]> {
    const items: unknown[] = [];
    let page = 1;

    while (page <= 10_000) {
      const query = new URLSearchParams({
        page: String(page),
        per_page: "100",
      });
      for (const [key, value] of Object.entries(filters)) {
        if (value) query.set(key, value);
      }
      const result = await this.requestJson(`${resource}?${query.toString()}`);
      const rows = Array.isArray(result.data)
        ? result.data
        : readArrayField(result.data, resource, "data");
      items.push(...rows);

      const totalPages = Number(result.headers.get("x-wp-totalpages") ?? "0");
      if (rows.length < 100 || (Number.isFinite(totalPages) && totalPages > 0 && page >= totalPages)) {
        break;
      }
      page += 1;
    }

    return items;
  }

  private async requestJson(path: string): Promise<{
    readonly data: unknown;
    readonly headers: Headers;
  }> {
    if (!this.config) {
      throw new ProviderAdapterError(
        "WooCommerce is not configured",
        "authentication",
      );
    }

    const base = normalizeStoreUrl(this.config.storeUrl);
    const authorization = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`,
      "utf8",
    ).toString("base64");
    const result = await this.http.requestJson<unknown>({
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${authorization}`,
      },
      maxAttempts: 3,
      timeoutMs: 20_000,
      url: `${base}/wp-json/wc/v3/${path}`,
    });

    if (!Array.isArray(result.data) && !isRecord(result.data)) {
      throw new ProviderAdapterError(
        "WooCommerce returned an invalid response",
        "validation",
      );
    }

    return {
      data: result.data,
      headers: result.headers,
    };
  }
}

function normalizeStoreUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new ProviderAdapterError(
      "WooCommerce store URL must use HTTPS",
      "validation",
    );
  }
  return url.toString().replace(/\/$/u, "");
}

function checkpointDate(checkpoint: string | null): string | null {
  if (!checkpoint) return null;
  try {
    const value = JSON.parse(checkpoint) as unknown;
    if (
      isRecord(value)
      && typeof value.modifiedAfter === "string"
      && Number.isFinite(Date.parse(value.modifiedAfter))
    ) {
      return value.modifiedAfter;
    }
  } catch {
    if (Number.isFinite(Date.parse(checkpoint))) return checkpoint;
  }
  return null;
}

function normalizeRefundPayload(
  refund: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> {
  const gmt = readStringField(refund, "date_created_gmt");
  if (!gmt || /[zZ]|[+-]\d{2}:?\d{2}$/u.test(gmt)) {
    return refund;
  }
  return {
    ...refund,
    date_created_gmt: `${gmt}Z`,
  };
}

function isGlobalRefundEndpointUnavailable(error: unknown): boolean {
  return error instanceof ProviderAdapterError
    && error.failureClass === "validation";
}

function isRefundWithinWindow(
  refund: unknown,
  from: string | null,
  to: string | null,
): boolean {
  if (!from && !to) return true;
  if (!isRecord(refund)) return false;

  const gmt = readStringField(refund, "date_created_gmt");
  const local = readStringField(refund, "date_created", "created_at", "createdAt");
  const raw = gmt ?? local;
  if (!raw) return false;

  const normalized = gmt && !/[zZ]|[+-]\d{2}:?\d{2}$/u.test(gmt)
    ? `${gmt}Z`
    : raw;
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) return false;

  if (from) {
    const fromMs = Date.parse(from);
    if (Number.isFinite(fromMs) && timestamp < fromMs) return false;
  }
  if (to) {
    const toMs = Date.parse(to);
    if (Number.isFinite(toMs) && timestamp >= toMs) return false;
  }
  return true;
}
