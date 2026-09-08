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

  /**
   * Real page-level resumability (see WooCommerceAdapter.fetch's doc
   * comment for the full rationale). BaseLinker's products/inventory
   * streams have a genuinely nested pagination shape -- multiple
   * inventories (warehouses), each with its own paginated product list --
   * so the resume cursor carries both an inventory index and a page number
   * within that inventory, advancing to the next inventory once the
   * current one is exhausted. Orders use BaseLinker's own watermark-style
   * pagination (date_confirmed_from advances to the latest timestamp seen
   * in each page); the resume cursor just carries that timestamp forward.
   */
  async fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult> {
    const observedAt = new Date().toISOString();
    const cursor = parseBaseLinkerPageCursor(request.pageCursor);
    const streamIndex = cursor?.streamIndex ?? 0;
    const stream = request.streams[streamIndex];

    if (stream === undefined) {
      return {
        records: [],
        nextCheckpoint: JSON.stringify({ dateConfirmedFrom: Math.floor(Date.now() / 1000) }),
        nextPageCursor: null,
        partial: false,
        limitations: [],
      };
    }

    const records: ProviderRecord[] = [];
    let nextPageCursor: string | null = null;

    if (stream === "orders") {
      const dateFrom = cursor?.ordersDateFrom
        ?? toUnixSeconds(request.from ?? checkpointDate(request.checkpoint));
      const payload = await this.call("getOrders", {
        date_confirmed_from: dateFrom,
        get_unconfirmed_orders: true,
      });
      const page = readArrayField(payload, "orders");
      records.push(...page.map((order) => ({
        stream,
        externalId: readStringField(order, "order_id") ?? randomUUID(),
        observedAt,
        payload: order,
      })));

      let nextDateFrom = dateFrom;
      if (page.length >= 100) {
        const timestamps = page
          .map((order) => Number(readStringField(order, "date_confirmed", "date_add") ?? "0"))
          .filter((value) => Number.isFinite(value) && value > dateFrom);
        if (timestamps.length > 0) nextDateFrom = Math.max(...timestamps) + 1;
      }
      nextPageCursor = nextDateFrom > dateFrom
        ? serializeBaseLinkerPageCursor({ streamIndex, ordersDateFrom: nextDateFrom })
        : this.nextStreamCursor(streamIndex, request.streams.length);
    } else if (stream === "products" || stream === "inventory") {
      const inventories = readArrayField(await this.call("getInventories", {}), "inventories");
      const inventoryIndex = cursor?.inventoryIndex ?? 0;
      const productPage = cursor?.productPage ?? 1;
      const inventory = inventories[inventoryIndex];
      const inventoryId = inventory ? readStringField(inventory, "inventory_id") : null;

      if (!inventory || !inventoryId) {
        nextPageCursor = this.nextStreamCursor(streamIndex, request.streams.length);
      } else {
        const productPageResult = await this.fetchInventoryProductsPage(inventoryId, productPage);
        for (const product of productPageResult.rows) {
          records.push({
            stream,
            externalId: `${inventoryId}:${readStringField(product, "id", "product_id", "sku") ?? randomUUID()}`,
            observedAt,
            payload: { inventoryId, product },
          });
        }

        nextPageCursor = productPageResult.hasMore
          ? serializeBaseLinkerPageCursor({ streamIndex, inventoryIndex, productPage: productPage + 1 })
          : inventoryIndex + 1 < inventories.length
            ? serializeBaseLinkerPageCursor({ streamIndex, inventoryIndex: inventoryIndex + 1, productPage: 1 })
            : this.nextStreamCursor(streamIndex, request.streams.length);
      }
    } else {
      nextPageCursor = this.nextStreamCursor(streamIndex, request.streams.length);
    }

    return {
      records,
      nextCheckpoint: JSON.stringify({ dateConfirmedFrom: Math.floor(Date.now() / 1000) }),
      nextPageCursor,
      partial: false,
      limitations: [],
    };
  }

  private nextStreamCursor(streamIndex: number, streamCount: number): string | null {
    const nextStreamIndex = streamIndex + 1;
    return nextStreamIndex < streamCount
      ? serializeBaseLinkerPageCursor({ streamIndex: nextStreamIndex })
      : null;
  }

  private async fetchInventoryProductsPage(
    inventoryId: string,
    page: number,
  ): Promise<{ readonly rows: readonly unknown[]; readonly hasMore: boolean }> {
    const payload = await this.call("getInventoryProductsData", {
      inventory_id: Number(inventoryId),
      page,
    });
    const rows = isRecord(payload.products)
      ? Object.entries(payload.products).map(([id, product]) => ({
          ...(isRecord(product) ? product : { value: product }),
          id,
        }))
      : readArrayField(payload, "products");
    return { rows, hasMore: rows.length >= 1000 };
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

type BaseLinkerPageCursor = {
  readonly streamIndex: number;
  readonly ordersDateFrom?: number;
  readonly inventoryIndex?: number;
  readonly productPage?: number;
};

function parseBaseLinkerPageCursor(cursor: string | null): BaseLinkerPageCursor | null {
  if (!cursor) return null;
  try {
    const value = JSON.parse(cursor) as unknown;
    if (
      isRecord(value)
      && typeof value.streamIndex === "number"
      && Number.isInteger(value.streamIndex)
      && value.streamIndex >= 0
    ) {
      return {
        streamIndex: value.streamIndex,
        ordersDateFrom: typeof value.ordersDateFrom === "number" ? value.ordersDateFrom : undefined,
        inventoryIndex: typeof value.inventoryIndex === "number" ? value.inventoryIndex : undefined,
        productPage: typeof value.productPage === "number" ? value.productPage : undefined,
      };
    }
  } catch {
    // fall through to null
  }
  return null;
}

function serializeBaseLinkerPageCursor(cursor: BaseLinkerPageCursor): string {
  return JSON.stringify(cursor);
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
