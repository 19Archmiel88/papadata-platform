import assert from "node:assert/strict";
import test from "node:test";
import type { CredentialResolutionInput } from "@papadata/integrations";
import {
  createAdapterForIntegrationJob,
  type IntegrationJobPayload,
} from "./worker.service.js";

test("Worker resolves credentials per connection and adapter uses scoped material", async () => {
  const previousToken = process.env.BASELINKER_TOKEN;
  const previousFetch = globalThis.fetch;
  const credentialCalls: CredentialResolutionInput[] = [];
  const capturedTokens: string[] = [];
  const payload = jobPayload();

  process.env.BASELINKER_TOKEN = "global-token-must-not-be-used";
  globalThis.fetch = (async (_input, init) => {
    capturedTokens.push(readHeader(init?.headers, "X-BLToken") ?? "");
    return new Response(JSON.stringify({ status: "SUCCESS" }), { status: 200 });
  }) as typeof fetch;

  try {
    const adapter = await createAdapterForIntegrationJob({
      payload,
      repository: {
        async findConnection(tenantId, workspaceId, connectionId) {
          assert.equal(tenantId, "tenant-a");
          assert.equal(workspaceId, "workspace-a");
          assert.equal(connectionId, "connection-a");
          return {
            provider_id: "baselinker",
            credential_ref: "credential-ref-a",
          };
        },
      },
      credentialProvider: {
        async resolve(input) {
          credentialCalls.push(input);
          return {
            providerId: "baselinker",
            credentialReference: input.credentialReference,
            secretResource: "projects/p/secrets/baselinker-a",
            version: "1",
            material: { token: "scoped-worker-token" },
          };
        },
      },
    });

    await adapter.verifyConnection();

    assert.deepEqual(credentialCalls, [
      {
        tenantId: "tenant-a",
        workspaceId: "workspace-a",
        connectionId: "connection-a",
        credentialReference: "credential-ref-a",
        provider: "baselinker",
      },
    ]);
    assert.deepEqual(capturedTokens, ["scoped-worker-token"]);
    assert.doesNotMatch(JSON.stringify(payload), /scoped-worker-token|credential-ref-a/);
  } finally {
    if (previousToken === undefined) {
      delete process.env.BASELINKER_TOKEN;
    } else {
      process.env.BASELINKER_TOKEN = previousToken;
    }
    globalThis.fetch = previousFetch;
  }
});

test("Worker blocks connection provider mismatch before credential resolution", async () => {
  const credentialCalls: CredentialResolutionInput[] = [];

  await assert.rejects(
    () => createAdapterForIntegrationJob({
      payload: jobPayload(),
      repository: {
        async findConnection() {
          return {
            provider_id: "shopify",
            credential_ref: "credential-ref-a",
          };
        },
      },
      credentialProvider: {
        async resolve(input) {
          credentialCalls.push(input);
          throw new Error("resolve should not be called");
        },
      },
    }),
    /Integration connection scope mismatch/,
  );

  assert.equal(credentialCalls.length, 0);
});

function jobPayload(): IntegrationJobPayload {
  return {
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    jobId: "job-a",
    connectionId: "connection-a",
    providerId: "baselinker",
    operation: "incremental_sync",
    streams: ["orders"],
    from: null,
    to: null,
  };
}

function readHeader(headers: RequestInit["headers"] | undefined, name: string): string | null {
  if (!headers) {
    return null;
  }
  if (headers instanceof Headers) {
    return headers.get(name);
  }
  if (Array.isArray(headers)) {
    const found = headers.find(([key]) => key.toLowerCase() === name.toLowerCase());
    return found?.[1] ?? null;
  }
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lower) {
      return String(value);
    }
  }
  return null;
}
