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
  private readonly http: ProviderHttpClient;

  constructor(
    config: ShopifyAdapterConfig | null,
    http: ProviderHttpClient = new FetchProviderHttpClient(),
  ) {
    this.config = config;
    this.http = http;
  }

  isConfigured(): boolean {
    return Boolean(this.config?.shopDomain && this.config.accessToken);
  }

  async verifyConnection(): Promise<void> {
    await this.graphql<{ readonly shop?: unknown }>(
      "query VerifyShop { shop { id name myshopifyDomain } }",
      {},
    );
  }

  /**
   * Real page-level resumability (see WooCommerceAdapter.fetch's doc comment
   * for the full rationale) -- one call fetches exactly one page of exactly
   * one stream. Shopify's GraphQL connections already paginate by opaque
   * cursor rather than page number, so the resume cursor here carries that
   * cursor string straight through instead of a page index.
   */
  async fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult> {
    const observedAt = new Date().toISOString();
    const cursor = parseShopifyPageCursor(request.pageCursor);
    const streamIndex = cursor?.streamIndex ?? 0;
    const stream = request.streams[streamIndex];

    if (stream === undefined) {
      // Guards a stale resume cursor (e.g. left over from a job whose
      // streams list changed) -- the pipeline itself stops calling fetch()
      // once nextPageCursor is null.
      return {
        records: [],
        nextCheckpoint: JSON.stringify({ updatedAt: observedAt }),
        nextPageCursor: null,
        partial: false,
        limitations: [],
      };
    }

    const records: ProviderRecord[] = [];
    const limitations: string[] = [];
    let hasNextPage = false;
    let endCursor: string | null = null;

    if (stream === "orders" || stream === "refunds") {
      const page = await this.fetchOnePage(
        `query Orders($cursor: String, $query: String) {
           orders(first: 100, after: $cursor, query: $query, sortKey: UPDATED_AT) {
             pageInfo { hasNextPage endCursor }
             nodes {
               id name createdAt updatedAt cancelledAt closedAt displayFinancialStatus
               displayFulfillmentStatus currencyCode currentTotalPriceSet { shopMoney { amount currencyCode } }
               customer { id email phone }
               shippingAddress { city countryCodeV2 zip }
               lineItems(first: 250) { nodes { id sku name quantity originalUnitPriceSet { shopMoney { amount currencyCode } } } }
               refunds { id createdAt note totalRefundedSet { shopMoney { amount currencyCode } } refundLineItems(first: 250) { nodes { quantity lineItem { id sku } } } }
             }
           }
         }`,
        "orders",
        cursor?.cursor ?? null,
        buildOrderQuery(request),
      );
      hasNextPage = page.hasNextPage;
      endCursor = page.endCursor;

      if (stream === "orders") {
        records.push(...page.nodes.map((order) => ({
          stream,
          externalId: globalId(order),
          observedAt,
          payload: order,
        })));
        limitations.push("Shopify orders older than the granted historical window require read_all_orders approval.");
      } else {
        for (const order of page.nodes) {
          const orderId = globalId(order);
          for (const refund of readArrayField(order, "refunds")) {
            records.push({
              stream,
              externalId: readStringField(refund, "id") ?? `${orderId}:${randomUUID()}`,
              observedAt,
              payload: { orderId, refund },
            });
          }
        }
      }
    } else if (stream === "products") {
      const page = await this.fetchOnePage(
        `query Products($cursor: String) {
           products(first: 100, after: $cursor, sortKey: UPDATED_AT) {
             pageInfo { hasNextPage endCursor }
             nodes { id title handle status vendor productType createdAt updatedAt
               variants(first: 250) { nodes { id sku barcode title price inventoryQuantity inventoryItem { id tracked } } }
             }
           }
         }`,
        "products",
        cursor?.cursor ?? null,
      );
      hasNextPage = page.hasNextPage;
      endCursor = page.endCursor;
      records.push(...page.nodes.map((product) => ({
        stream,
        externalId: globalId(product),
        observedAt,
        payload: product,
      })));
    } else if (stream === "inventory") {
      const page = await this.fetchOnePage(
        `query Inventory($cursor: String) {
           inventoryItems(first: 100, after: $cursor) {
             pageInfo { hasNextPage endCursor }
             nodes { id tracked sku variant { id displayName product { id title } } inventoryLevels(first: 100) { nodes { id location { id name } quantities(names: ["available", "committed", "on_hand"]) { name quantity } } } }
           }
         }`,
        "inventoryItems",
        cursor?.cursor ?? null,
      );
      hasNextPage = page.hasNextPage;
      endCursor = page.endCursor;
      records.push(...page.nodes.map((item) => ({
        stream,
        externalId: globalId(item),
        observedAt,
        payload: item,
      })));
    }

    const nextStreamIndex = streamIndex + 1;
    const nextPageCursor = hasNextPage && endCursor
      ? serializeShopifyPageCursor({ streamIndex, cursor: endCursor })
      : nextStreamIndex < request.streams.length
        ? serializeShopifyPageCursor({ streamIndex: nextStreamIndex, cursor: null })
        : null;

    return {
      records,
      nextCheckpoint: JSON.stringify({ updatedAt: observedAt }),
      nextPageCursor,
      partial: false,
      limitations,
    };
  }

  private async fetchOnePage(
    query: string,
    connectionName: string,
    cursor: string | null,
    searchQuery?: string,
  ): Promise<{ readonly nodes: readonly unknown[]; readonly hasNextPage: boolean; readonly endCursor: string | null }> {
    const payload = await this.graphql<unknown>(query, {
      cursor,
      ...(searchQuery ? { query: searchQuery } : {}),
    });
    if (!isRecord(payload) || !isRecord(payload[connectionName])) {
      throw new ProviderAdapterError("Shopify returned an invalid connection", "validation");
    }
    const connection = payload[connectionName];
    const pageInfo = isRecord(connection.pageInfo) ? connection.pageInfo : {};
    return {
      nodes: readArrayField(connection, "nodes"),
      hasNextPage: pageInfo.hasNextPage === true,
      endCursor: readStringField(pageInfo, "endCursor"),
    };
  }

  private async graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    if (!this.config) {
      throw new ProviderAdapterError("Shopify is not configured", "authentication");
    }
    const domain = normalizeShopDomain(this.config.shopDomain);
    const version = normalizeApiVersion(this.config.apiVersion);
    const response = await this.http.requestJson<unknown>({
      body: JSON.stringify({ query, variables }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": this.config.accessToken,
      },
      maxAttempts: 4,
      method: "POST",
      timeoutMs: 30_000,
      url: `https://${domain}/admin/api/${version}/graphql.json`,
    });
    if (!isRecord(response.data)) {
      throw new ProviderAdapterError("Shopify returned an invalid response", "validation");
    }
    const errors = readArrayField(response.data, "errors");
    if (errors.length > 0) {
      throw new ProviderAdapterError("Shopify GraphQL request failed", "validation");
    }
    return response.data.data as T;
  }
}

function buildOrderQuery(request: ProviderFetchRequest): string | undefined {
  const terms: string[] = [];
  const checkpoint = checkpointDate(request.checkpoint);
  const from = request.from ?? checkpoint;
  if (from) terms.push(`updated_at:>=${from}`);
  if (request.to) terms.push(`updated_at:<=${request.to}`);
  return terms.length > 0 ? terms.join(" ") : undefined;
}

function checkpointDate(checkpoint: string | null): string | null {
  if (!checkpoint) return null;
  try {
    const parsed = JSON.parse(checkpoint) as unknown;
    return isRecord(parsed) && typeof parsed.updatedAt === "string"
      ? parsed.updatedAt
      : null;
  } catch {
    return Number.isFinite(Date.parse(checkpoint)) ? checkpoint : null;
  }
}

type ShopifyPageCursor = {
  readonly streamIndex: number;
  readonly cursor: string | null;
};

function parseShopifyPageCursor(cursor: string | null): ShopifyPageCursor | null {
  if (!cursor) return null;
  try {
    const value = JSON.parse(cursor) as unknown;
    if (
      isRecord(value)
      && typeof value.streamIndex === "number"
      && Number.isInteger(value.streamIndex)
      && value.streamIndex >= 0
      && (value.cursor === null || typeof value.cursor === "string")
    ) {
      return { streamIndex: value.streamIndex, cursor: value.cursor as string | null };
    }
  } catch {
    // fall through to null
  }
  return null;
}

function serializeShopifyPageCursor(cursor: ShopifyPageCursor): string {
  return JSON.stringify(cursor);
}

function normalizeShopDomain(value: string): string {
  const normalized = value.trim().replace(/^https?:\/\//iu, "").replace(/\/$/u, "");
  if (!/^[a-z0-9][a-z0-9.-]*\.myshopify\.com$/iu.test(normalized)) {
    throw new ProviderAdapterError("Shopify domain is invalid", "validation");
  }
  return normalized;
}

function normalizeApiVersion(value: string): string {
  if (!/^\d{4}-\d{2}$/u.test(value)) {
    throw new ProviderAdapterError("Shopify API version is invalid", "validation");
  }
  return value;
}

function globalId(value: unknown): string {
  return readStringField(value, "id") ?? randomUUID();
}
