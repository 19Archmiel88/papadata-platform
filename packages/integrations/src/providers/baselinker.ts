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

export class BaseLinkerAdapter implements IntegrationProviderAdapter {
  readonly providerId = "baselinker" as const;
  readonly requiredScopes = ["api"] as const;
  readonly optionalScopes = [] as const;

  private readonly token: string | null;
  private readonly http: ProviderHttpClient;

  constructor(
    token: string | null,
    http: ProviderHttpClient = new FetchProviderHttpClient(),
  ) {
    this.token = token;
    this.http = http;
  }

  isConfigured(): boolean {
    return Boolean(this.token?.trim());
  }

  async verifyConnection(): Promise<void> {
    await this.call("getInventories", {});
  }

  async fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult> {
    const records: ProviderRecord[] = [];
    const observedAt = new Date().toISOString();
    const from = request.from ?? checkpointDate(request.checkpoint);

    for (const stream of request.streams) {
      if (stream === "orders") {
        const orders = await this.fetchOrders(from);
        records.push(...orders.map((order) => ({
          stream,
          externalId: readStringField(order, "order_id") ?? randomUUID(),
          observedAt,
          payload: order,
        })));
        continue;
      }
      if (stream === "products" || stream === "inventory") {
        const inventories = readArrayField(await this.call("getInventories", {}), "inventories");
        for (const inventory of inventories) {
          const inventoryId = readStringField(inventory, "inventory_id");
          if (!inventoryId) continue;
          const products = await this.fetchInventoryProducts(inventoryId);
          for (const product of products) {
            records.push({
              stream,
              externalId: `${inventoryId}:${readStringField(product, "id", "product_id", "sku") ?? randomUUID()}`,
              observedAt,
              payload: { inventoryId, product },
            });
          }
        }
      }
    }

    return {
      records,
      nextCheckpoint: JSON.stringify({ dateConfirmedFrom: Math.floor(Date.now() / 1000) }),
      partial: false,
      limitations: [],
    };
  }

  private async fetchOrders(from: string | null): Promise<readonly unknown[]> {
    const rows: unknown[] = [];
    let dateFrom = toUnixSeconds(from);
    let guard = 0;
    while (guard < 10_000) {
      const payload = await this.call("getOrders", {
        date_confirmed_from: dateFrom,
        get_unconfirmed_orders: true,
      });
      const page = readArrayField(payload, "orders");
      rows.push(...page);
      if (page.length < 100) break;
      const timestamps = page
        .map((order) => Number(readStringField(order, "date_confirmed", "date_add") ?? "0"))
        .filter((value) => Number.isFinite(value) && value > dateFrom);
      if (timestamps.length === 0) break;
      dateFrom = Math.max(...timestamps) + 1;
      guard += 1;
    }
    return rows;
  }

  private async fetchInventoryProducts(inventoryId: string): Promise<readonly unknown[]> {
    const rows: unknown[] = [];
    let page = 1;
    while (page <= 10_000) {
      const payload = await this.call("getInventoryProductsData", {
        inventory_id: Number(inventoryId),
        page,
      });
      const products = isRecord(payload.products)
        ? Object.entries(payload.products).map(([id, product]) => ({
            ...(isRecord(product) ? product : { value: product }),
            id,
          }))
        : readArrayField(payload, "products");
      rows.push(...products);
      if (products.length < 1000) break;
      page += 1;
    }
    return rows;
  }

  private async call(method: string, parameters: object): Promise<Record<string, unknown>> {
    if (!this.token) {
      throw new ProviderAdapterError("BaseLinker is not configured", "authentication");
    }
    const response = await this.http.requestJson<unknown>({
      body: new URLSearchParams({ method, parameters: JSON.stringify(parameters) }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-BLToken": this.token,
      },
      maxAttempts: 4,
      method: "POST",
      timeoutMs: 30_000,
      url: "https://api.baselinker.com/connector.php",
    });
    if (!isRecord(response.data)) {
      throw new ProviderAdapterError("BaseLinker returned an invalid response", "validation");
    }
    if (response.data.status === "ERROR") {
      throw new ProviderAdapterError(
        readStringField(response.data, "error_message") ?? "BaseLinker request failed",
        "permanent",
      );
    }
    return response.data;
  }
}

function toUnixSeconds(value: string | null): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : Number(value) || 0;
}

function checkpointDate(checkpoint: string | null): string | null {
  if (!checkpoint) return null;
  try {
    const parsed = JSON.parse(checkpoint) as unknown;
    if (isRecord(parsed) && typeof parsed.dateConfirmedFrom === "number") {
      return new Date(parsed.dateConfirmedFrom * 1000).toISOString();
    }
  } catch {
    return checkpoint;
  }
  return null;
}
