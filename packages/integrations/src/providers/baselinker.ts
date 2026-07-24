import { randomUUID } from "node:crypto";
import type { IntegrationProviderAdapter, ProviderFetchRequest, ProviderFetchResult } from "../provider-adapter.js";
import { ProviderAdapterError } from "../provider-adapter.js";

export class BaseLinkerAdapter implements IntegrationProviderAdapter {
  readonly providerId = "baselinker" as const;
  readonly requiredScopes = ["api"] as const;
  readonly optionalScopes = [] as const;

  private readonly token: string | null;

  constructor(token: string | null) {
    this.token = token;
  }

  isConfigured(): boolean {
    return Boolean(this.token);
  }

  async verifyConnection(): Promise<void> {
    await this.call("getInventories", {});
  }

  async fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult> {
    const records = [];
    for (const stream of request.streams) {
      if (stream === "orders") {
        const dateFrom = request.from
          ? Math.floor(new Date(request.from).getTime() / 1000)
          : 0;
        const payload = await this.call("getOrders", { date_confirmed_from: dateFrom });
        const orders = this.readArray(payload, "orders");
        for (const order of orders) {
          records.push({
            stream,
            externalId: this.readId(order, "order_id"),
            observedAt: new Date().toISOString(),
            payload: order,
          });
        }
      }
      if (stream === "products" || stream === "inventory") {
        const payload = await this.call("getInventories", {});
        records.push({
          stream,
          externalId: `inventory-${new Date().toISOString()}`,
          observedAt: new Date().toISOString(),
          payload,
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

  private async call(method: string, parameters: object): Promise<unknown> {
    if (!this.token) {
      throw new ProviderAdapterError("BaseLinker is not configured", "authentication");
    }
    const body = new URLSearchParams({
      method,
      parameters: JSON.stringify(parameters),
    });
    const response = await fetch("https://api.baselinker.com/connector.php", {
      method: "POST",
      headers: {
        "X-BLToken": this.token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (response.status === 429) {
      throw new ProviderAdapterError("BaseLinker rate limit", "rate_limit", 60);
    }
    if (response.status >= 500) {
      throw new ProviderAdapterError("BaseLinker temporary failure", "transient", 30);
    }
    if (!response.ok) {
      throw new ProviderAdapterError(`BaseLinker request failed: ${response.status}`, "permanent");
    }
    const payload = await response.json() as { status?: string; error_message?: string };
    if (payload.status === "ERROR") {
      throw new ProviderAdapterError(payload.error_message ?? "BaseLinker error", "permanent");
    }
    return payload;
  }

  private readArray(payload: unknown, key: string): readonly unknown[] {
    if (!payload || typeof payload !== "object") return [];
    const value = (payload as Record<string, unknown>)[key];
    return Array.isArray(value) ? value : [];
  }

  private readId(item: unknown, key: string): string {
    if (item && typeof item === "object" && key in item) {
      return String((item as Record<string, unknown>)[key]);
    }
    return randomUUID();
  }
}
