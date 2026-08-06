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
          orderby: "date_modified",
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
        const orders = await this.fetchPages("orders", {
          after: from,
          before: to,
          order: "asc",
          orderby: "date_modified",
          status: "any",
        });
        for (const order of orders) {
          const orderId = readStringField(order, "id", "number") ?? randomUUID();
          const refunds = readArrayField(order, "refunds");
          for (const refund of refunds) {
            records.push({
              stream,
              externalId: readStringField(refund, "id") ?? `${orderId}:${randomUUID()}`,
              observedAt,
              payload: {
                orderId,
                refund,
              },
            });
          }
        }
        limitations.push(
          "WooCommerce refunds are derived from order refund references; detailed refund line items are fetched during canonical enrichment.",
        );
      }
    }

    return {
      records,
      nextCheckpoint: JSON.stringify({ modifiedAfter: observedAt }),
      partial: false,
      limitations,
    };
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
      if (rows.length < 100 || (Number.isFinite(totalPages) && page >= totalPages)) {
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
