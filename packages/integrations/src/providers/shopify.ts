import { randomUUID } from "node:crypto";
import type { IntegrationProviderAdapter, ProviderFetchRequest, ProviderFetchResult } from "../provider-adapter.js";
import { ProviderAdapterError } from "../provider-adapter.js";

export type ShopifyAdapterConfig = {
  readonly shopDomain: string;
  readonly accessToken: string;
  readonly apiVersion: string;
};

export class ShopifyAdapter implements IntegrationProviderAdapter {
  readonly providerId = "shopify" as const;
  readonly requiredScopes = ["read_orders", "read_products", "read_inventory"] as const;
  readonly optionalScopes = ["read_customers"] as const;

  private readonly config: ShopifyAdapterConfig | null;

  constructor(config: ShopifyAdapterConfig | null) {
    this.config = config;
  }

  isConfigured(): boolean {
    return Boolean(this.config?.shopDomain && this.config.accessToken);
  }

  async verifyConnection(): Promise<void> {
    await this.request("shop.json");
  }

  async fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult> {
    const records = [];
    const from = request.from ? `&created_at_min=${encodeURIComponent(request.from)}` : "";
    const to = request.to ? `&created_at_max=${encodeURIComponent(request.to)}` : "";

    for (const stream of request.streams) {
      const endpoint = stream === "orders"
        ? `orders.json?status=any&limit=250${from}${to}`
        : stream === "products"
          ? "products.json?limit=250"
          : stream === "inventory"
            ? "inventory_levels.json?limit=250"
            : stream === "refunds"
              ? `orders.json?status=any&limit=250${from}${to}`
              : null;
      if (!endpoint) {
        continue;
      }
      const payload = await this.request(endpoint);
      const items = this.extractItems(stream, payload);
      for (const item of items) {
        const id = this.readId(item);
        records.push({
          stream,
          externalId: id,
          observedAt: new Date().toISOString(),
          payload: item,
        });
      }
    }

    return {
      records,
      nextCheckpoint: new Date().toISOString(),
      partial: false,
      limitations: [],
    };
  }

  private async request(path: string): Promise<unknown> {
    if (!this.config) {
      throw new ProviderAdapterError("Shopify is not configured", "authentication");
    }
    const url = `https://${this.config.shopDomain}/admin/api/${this.config.apiVersion}/${path}`;
    const response = await fetch(url, {
      headers: { "X-Shopify-Access-Token": this.config.accessToken },
    });
    if (response.status === 429) {
      throw new ProviderAdapterError("Shopify rate limit", "rate_limit", 60);
    }
    if (response.status >= 500) {
      throw new ProviderAdapterError("Shopify temporary failure", "transient", 30);
    }
    if (!response.ok) {
      throw new ProviderAdapterError(`Shopify request failed: ${response.status}`, "permanent");
    }
    return response.json();
  }

  private extractItems(stream: string, payload: unknown): readonly unknown[] {
    if (!payload || typeof payload !== "object") return [];
    const record = payload as Record<string, unknown>;
    const key = stream === "orders" || stream === "refunds" ? "orders" : stream;
    const value = record[key];
    return Array.isArray(value) ? value : [];
  }

  private readId(item: unknown): string {
    if (item && typeof item === "object" && "id" in item) {
      return String((item as { id: unknown }).id);
    }
    return randomUUID();
  }
}
