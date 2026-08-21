import assert from "node:assert/strict";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { ProviderAdapterError } from "./provider-adapter.js";
import { FetchProviderHttpClient } from "./http.js";

type ScriptedResponse = {
  readonly status: number;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
};

async function withScriptedServer(
  responses: readonly ScriptedResponse[],
  run: (input: { readonly url: string; readonly requestCount: () => number }) => Promise<void>,
): Promise<void> {
  let requestCount = 0;
  const server: Server = createServer((_request: IncomingMessage, response: ServerResponse) => {
    const scripted = responses[Math.min(requestCount, responses.length - 1)];
    requestCount += 1;
    for (const [key, value] of Object.entries(scripted.headers ?? {})) {
      response.setHeader(key, value);
    }
    response.writeHead(scripted.status, { "content-type": "application/json" });
    response.end(JSON.stringify(scripted.body ?? {}));
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const { port } = server.address() as AddressInfo;
    await run({ url: `http://127.0.0.1:${port}/`, requestCount: () => requestCount });
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

// A server that never responds (or responds far slower than the client's
// timeoutMs), to prove `timeoutMs` actually aborts the request rather than
// only existing as an unused config field.
async function withHangingServer(
  delayMs: number,
  run: (input: { readonly url: string; readonly requestCount: () => number }) => Promise<void>,
): Promise<void> {
  let requestCount = 0;
  const server: Server = createServer((_request: IncomingMessage, response: ServerResponse) => {
    requestCount += 1;
    setTimeout(() => {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true, tooSlow: true }));
    }, delayMs);
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const { port } = server.address() as AddressInfo;
    await run({ url: `http://127.0.0.1:${port}/`, requestCount: () => requestCount });
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

test("A05 retries transient 5xx failures and succeeds once the provider recovers", async () => {
  await withScriptedServer(
    [
      { status: 503, body: { message: "temporarily unavailable" } },
      { status: 503, body: { message: "temporarily unavailable" } },
      { status: 200, body: { ok: true } },
    ],
    async ({ url, requestCount }) => {
      const client = new FetchProviderHttpClient();
      const result = await client.requestJson({
        url,
        maxAttempts: 5,
        baseDelayMs: 5,
        timeoutMs: 2_000,
      });

      assert.deepEqual(result.data, { ok: true });
      assert.equal(requestCount(), 3);
    },
  );
});

test("A05 gives up after maxAttempts instead of retrying forever", async () => {
  await withScriptedServer(
    [{ status: 500, body: { message: "always down" } }],
    async ({ url, requestCount }) => {
      const client = new FetchProviderHttpClient();

      await assert.rejects(
        () => client.requestJson({ url, maxAttempts: 3, baseDelayMs: 5, timeoutMs: 2_000 }),
        (error: unknown) => {
          assert.ok(error instanceof ProviderAdapterError);
          assert.equal(error.failureClass, "provider_outage");
          return true;
        },
      );
      assert.equal(requestCount(), 3);
    },
  );
});

test("A05 classifies 429 as rate_limit and respects the Retry-After header", async () => {
  await withScriptedServer(
    [
      { status: 429, headers: { "retry-after": "1" }, body: { message: "slow down" } },
      { status: 200, body: { ok: true } },
    ],
    async ({ url, requestCount }) => {
      const client = new FetchProviderHttpClient();
      const startedAt = performance.now();
      const result = await client.requestJson({ url, maxAttempts: 3, timeoutMs: 2_000 });
      const elapsedMs = performance.now() - startedAt;

      assert.deepEqual(result.data, { ok: true });
      assert.equal(requestCount(), 2);
      assert.ok(elapsedMs >= 950, `expected the client to honour Retry-After (~1s), waited ${elapsedMs}ms`);
    },
  );
});

test("A05 honours a Retry-After longer than the old 5s backoff ceiling instead of truncating it", async () => {
  await withScriptedServer(
    [
      { status: 429, headers: { "retry-after": "6" }, body: { message: "slow down" } },
      { status: 200, body: { ok: true } },
    ],
    async ({ url, requestCount }) => {
      const client = new FetchProviderHttpClient();
      const startedAt = performance.now();
      const result = await client.requestJson({ url, maxAttempts: 3, timeoutMs: 3_000 });
      const elapsedMs = performance.now() - startedAt;

      assert.deepEqual(result.data, { ok: true });
      assert.equal(requestCount(), 2);
      assert.ok(
        elapsedMs >= 5_800,
        `expected the client to wait ~6s per Retry-After, not truncate to the old 5s cap; waited ${elapsedMs}ms`,
      );
    },
  );
});

test("A05 timeoutMs actually aborts a hanging request instead of waiting for it forever", async () => {
  await withHangingServer(3_000, async ({ url, requestCount }) => {
    const client = new FetchProviderHttpClient();
    const startedAt = performance.now();

    await assert.rejects(
      () => client.requestJson({ url, maxAttempts: 1, timeoutMs: 200 }),
      (error: unknown) => {
        assert.ok(error instanceof ProviderAdapterError);
        assert.equal(error.failureClass, "transient");
        assert.match(error.message, /timed out/iu);
        return true;
      },
    );

    const elapsedMs = performance.now() - startedAt;
    assert.equal(requestCount(), 1);
    assert.ok(
      elapsedMs < 1_500,
      `expected the client to abort around timeoutMs (200ms), not wait for the 3000ms-slow server; took ${elapsedMs}ms`,
    );
  });
});

test("A05 retries after a timeout and eventually succeeds once the provider responds in time", async () => {
  let requestCount = 0;
  const server: Server = createServer((_request: IncomingMessage, response: ServerResponse) => {
    requestCount += 1;
    if (requestCount === 1) {
      // First attempt: never respond within the client's timeout.
      setTimeout(() => {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify({ ok: true, tooSlow: true }));
      }, 3_000);
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true }));
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const { port } = server.address() as AddressInfo;
    const client = new FetchProviderHttpClient();
    const result = await client.requestJson({
      url: `http://127.0.0.1:${port}/`,
      maxAttempts: 3,
      baseDelayMs: 5,
      timeoutMs: 200,
    });

    assert.deepEqual(result.data, { ok: true });
    assert.equal(requestCount, 2, "the timed-out first attempt must not consume all retry attempts");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("A05 honours a Retry-After far beyond the old, now-removed 10-minute ceiling", async () => {
  await withScriptedServer(
    [
      { status: 429, headers: { "retry-after": "900" }, body: { message: "slow down" } },
      { status: 200, body: { ok: true } },
    ],
    async ({ url, requestCount }) => {
      const recordedDelaysMs: number[] = [];
      // Injected so the test doesn't actually have to wait 900s -- it
      // proves the exact, unclamped value reaches the delay call instead.
      const fakeDelay = async (ms: number): Promise<void> => {
        recordedDelaysMs.push(ms);
      };
      const client = new FetchProviderHttpClient(fetch, fakeDelay);
      const result = await client.requestJson({ url, maxAttempts: 3, timeoutMs: 2_000 });

      assert.deepEqual(result.data, { ok: true });
      assert.equal(requestCount(), 2);
      assert.deepEqual(
        recordedDelaysMs,
        [900_000],
        "a 900s (15min) Retry-After must reach the delay call as exactly 900000ms, not be clamped to the old 10-minute (600000ms) ceiling or any other value",
      );
    },
  );
});

test("A05 does not retry a 401 and fails on the first attempt", async () => {
  await withScriptedServer(
    [{ status: 401, body: { message: "invalid credentials" } }],
    async ({ url, requestCount }) => {
      const client = new FetchProviderHttpClient();

      await assert.rejects(
        () => client.requestJson({ url, maxAttempts: 5, baseDelayMs: 5, timeoutMs: 2_000 }),
        (error: unknown) => {
          assert.ok(error instanceof ProviderAdapterError);
          assert.equal(error.failureClass, "authentication");
          return true;
        },
      );
      assert.equal(requestCount(), 1, "authentication failures must not burn retry attempts");
    },
  );
});

test("A05 does not retry a 404 (validation) and fails on the first attempt", async () => {
  await withScriptedServer(
    [{ status: 404, body: { message: "not found" } }],
    async ({ url, requestCount }) => {
      const client = new FetchProviderHttpClient();

      await assert.rejects(
        () => client.requestJson({ url, maxAttempts: 5, baseDelayMs: 5, timeoutMs: 2_000 }),
        (error: unknown) => {
          assert.ok(error instanceof ProviderAdapterError);
          assert.equal(error.failureClass, "validation");
          return true;
        },
      );
      assert.equal(requestCount(), 1);
    },
  );
});
