import { describe, expect, it, vi } from "vitest";
import { FetchProviderHttpClient } from "./http.js";
import { ProviderAdapterError } from "./provider-adapter.js";

function jsonResponse(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), { headers, status });
}

// Every test below injects a synchronous no-op-ish delayImpl (recording the
// requested ms instead of actually waiting) so these run fast and
// deterministically -- FetchProviderHttpClient's real default delay is
// node:timers/promises' setTimeout, which this constructor argument exists
// specifically to let callers replace (see http.ts's constructor comment).

describe("FetchProviderHttpClient retry/backoff", () => {
  it("honours a 429 response's Retry-After header exactly, not the exponential backoff formula", async () => {
    const responses = [
      jsonResponse(429, { message: "slow down" }, { "Retry-After": "7" }),
      jsonResponse(200, { ok: true }),
    ];
    const fetchImpl = vi.fn(async () => responses.shift());
    const delays: number[] = [];
    const client = new FetchProviderHttpClient(
      fetchImpl as unknown as typeof fetch,
      async (ms) => { delays.push(ms); },
    );

    const result = await client.requestJson<{ ok: boolean }>({ url: "https://example.test/orders" });

    expect(result.data).toEqual({ ok: true });
    expect(result.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    // Exactly the Retry-After value (7s -> 7000ms), not baseDelayMs*2**0.
    expect(delays).toEqual([7_000]);
  });

  it("retries a 5xx response with exponential backoff when no Retry-After header is present", async () => {
    const responses = [
      jsonResponse(503, { message: "down" }),
      jsonResponse(503, { message: "still down" }),
      jsonResponse(200, { ok: true }),
    ];
    const fetchImpl = vi.fn(async () => responses.shift());
    const delays: number[] = [];
    const client = new FetchProviderHttpClient(
      fetchImpl as unknown as typeof fetch,
      async (ms) => { delays.push(ms); },
    );

    const result = await client.requestJson<{ ok: boolean }>({
      baseDelayMs: 100,
      maxAttempts: 3,
      url: "https://example.test/orders",
    });

    expect(result.data).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    // baseDelayMs * 2**(attempt-1) for each of the two failed attempts.
    expect(delays).toEqual([100, 200]);
  });

  it("succeeds after N failed attempts, returning the eventual success response", async () => {
    const responses = [
      jsonResponse(500, { message: "boom" }),
      jsonResponse(500, { message: "boom again" }),
      jsonResponse(200, { orders: [1, 2, 3] }),
    ];
    const fetchImpl = vi.fn(async () => responses.shift());
    const client = new FetchProviderHttpClient(
      fetchImpl as unknown as typeof fetch,
      async () => {},
    );

    const result = await client.requestJson<{ orders: number[] }>({
      maxAttempts: 3,
      url: "https://example.test/orders",
    });

    expect(result.status).toBe(200);
    expect(result.data).toEqual({ orders: [1, 2, 3] });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("gives up once maxAttempts is exhausted and throws the mapped ProviderAdapterError", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(503, { message: "down" }));
    const client = new FetchProviderHttpClient(
      fetchImpl as unknown as typeof fetch,
      async () => {},
    );

    const error = await client
      .requestJson({ baseDelayMs: 10, maxAttempts: 2, url: "https://example.test/orders" })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ProviderAdapterError);
    expect((error as ProviderAdapterError).failureClass).toBe("provider_outage");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not retry a non-retryable failure (401) even with attempts remaining", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(401, { message: "bad token" }));
    const client = new FetchProviderHttpClient(
      fetchImpl as unknown as typeof fetch,
      async () => {},
    );

    const error = await client
      .requestJson({ maxAttempts: 5, url: "https://example.test/orders" })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ProviderAdapterError);
    expect((error as ProviderAdapterError).failureClass).toBe("authentication");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
