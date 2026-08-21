import assert from "node:assert/strict";
import test from "node:test";
import type { ProviderHttpClient, ProviderHttpRequest, ProviderHttpResult } from "./http.js";
import { ProviderAdapterError } from "./provider-adapter.js";
import { WooCommerceAdapter } from "./providers/woocommerce.js";

class ScriptedWooClient implements ProviderHttpClient {
  readonly urls: string[] = [];
  private readonly handler: (url: URL) => ProviderHttpResult<unknown> | Promise<ProviderHttpResult<unknown>>;

  constructor(
    handler: (url: URL) => ProviderHttpResult<unknown> | Promise<ProviderHttpResult<unknown>>,
  ) {
    this.handler = handler;
  }

  async requestJson<T>(request: ProviderHttpRequest): Promise<ProviderHttpResult<T>> {
    const url = new URL(request.url);
    this.urls.push(url.toString());
    return await this.handler(url) as ProviderHttpResult<T>;
  }
}

test("WooCommerce refunds use the global wc/v3/refunds endpoint with full pagination", async () => {
  const pageOne = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    parent_id: 500,
    amount: "1.00",
    date_created_gmt: "2026-08-21T12:00:00",
  }));
  const pageTwo = [{
    id: 101,
    parent_id: 500,
    amount: "2.00",
    date_created_gmt: "2026-08-21T13:00:00",
  }];

  const client = new ScriptedWooClient((url) => {
    if (url.pathname.endsWith("/refunds")) {
      const page = Number(url.searchParams.get("page") ?? "1");
      return {
        data: page === 1 ? pageOne : pageTwo,
        headers: new Headers({ "x-wp-totalpages": "2" }),
        status: 200,
      };
    }
    if (url.pathname.endsWith("/orders/500")) {
      return {
        data: { id: 500, currency: "PLN" },
        headers: new Headers(),
        status: 200,
      };
    }
    throw new Error(`Unexpected WooCommerce request: ${url}`);
  });

  const adapter = new WooCommerceAdapter({
    storeUrl: "https://store.example.com",
    consumerKey: "ck",
    consumerSecret: "cs",
  }, client);

  const result = await adapter.fetch({
    streams: ["refunds"],
    from: "2026-08-21T00:00:00.000Z",
    to: "2026-08-22T00:00:00.000Z",
    checkpoint: null,
  });

  assert.equal(result.records.length, 101);
  assert.equal(result.records[100]?.externalId, "101");
  assert.deepEqual(result.records[100]?.payload, {
    id: 101,
    parent_id: 500,
    amount: "2.00",
    date_created_gmt: "2026-08-21T13:00:00Z",
    currency: "PLN",
    orderId: "500",
  });
  assert.ok(client.urls.some((url) => url.includes("/refunds?") && url.includes("page=2")));
  assert.equal(client.urls.filter((url) => url.includes("/orders/500")).length, 1, "order currency lookup must be cached");
  assert.equal(result.limitations.length, 0);
});

test("WooCommerce refunds fall back to complete paginated order history without a fixed discovery floor", async () => {
  const client = new ScriptedWooClient((url) => {
    if (url.pathname.endsWith("/refunds")) {
      throw new ProviderAdapterError("No route was found matching the URL and request method", "validation");
    }
    if (url.pathname.endsWith("/orders") && url.searchParams.has("page")) {
      assert.equal(url.searchParams.has("after"), false, "fallback must not impose an arbitrary lower date floor");
      return {
        data: [{
          id: 12,
          currency: "PLN",
          date_created_gmt: "2018-01-01T10:00:00",
          refunds: [{ id: 900 }],
        }],
        headers: new Headers({ "x-wp-totalpages": "1" }),
        status: 200,
      };
    }
    if (url.pathname.endsWith("/orders/12/refunds/900")) {
      return {
        data: {
          id: 900,
          amount: "50.00",
          date_created_gmt: "2026-08-21T11:30:00",
        },
        headers: new Headers(),
        status: 200,
      };
    }
    throw new Error(`Unexpected WooCommerce request: ${url}`);
  });

  const adapter = new WooCommerceAdapter({
    storeUrl: "https://store.example.com",
    consumerKey: "ck",
    consumerSecret: "cs",
  }, client);

  const result = await adapter.fetch({
    streams: ["refunds"],
    from: "2026-08-21T00:00:00.000Z",
    to: "2026-08-22T00:00:00.000Z",
    checkpoint: null,
  });

  assert.equal(result.records.length, 1);
  assert.equal(result.records[0]?.externalId, "900");
  assert.deepEqual(result.records[0]?.payload, {
    id: 900,
    amount: "50.00",
    date_created_gmt: "2026-08-21T11:30:00Z",
    currency: "PLN",
    orderId: "12",
  });
  assert.ok(result.limitations.some((item) => item.includes("complete paginated order-history fallback")));
});
