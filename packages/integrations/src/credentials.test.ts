import assert from "node:assert/strict";
import test from "node:test";
import {
  CredentialResolutionError,
  ScopedCredentialProvider,
  SecretManagerCredentialSecretStore,
  type CredentialAccessAuditEvent,
  type CredentialMetadata,
  type CredentialMetadataReader,
  type CredentialResolutionInput,
  type CredentialSecretReadInput,
  type CredentialSecretStore,
} from "./credentials.ts";

const baseInput = {
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  connectionId: "connection-a",
  credentialReference: "credential-ref-a",
  provider: "baselinker",
} as const satisfies CredentialResolutionInput;

test("scoped credential resolver isolates two tenants and does not audit secret material", async () => {
  const reader = new MapMetadataReader([
    metadata(),
    metadata({
      tenantId: "tenant-b",
      workspaceId: "workspace-b",
      connectionId: "connection-b",
      credentialReference: "credential-ref-b",
      secretResource: "projects/p/secrets/baselinker-b",
    }),
  ]);
  const store = new MapSecretStore();
  store.set(metadata(), JSON.stringify({ token: "tenant-a-secret" }));
  store.set(
    metadata({
      tenantId: "tenant-b",
      workspaceId: "workspace-b",
      connectionId: "connection-b",
      credentialReference: "credential-ref-b",
      secretResource: "projects/p/secrets/baselinker-b",
    }),
    JSON.stringify({ token: "tenant-b-secret" }),
  );

  const provider = new ScopedCredentialProvider({
    metadataReader: reader,
    secretStore: store,
  });

  const tenantA = await provider.resolve(baseInput);
  const tenantB = await provider.resolve({
    tenantId: "tenant-b",
    workspaceId: "workspace-b",
    connectionId: "connection-b",
    credentialReference: "credential-ref-b",
    provider: "baselinker",
  });

  assert.equal(tenantA.providerId, "baselinker");
  assert.equal(tenantB.providerId, "baselinker");
  if (tenantA.providerId !== "baselinker" || tenantB.providerId !== "baselinker") {
    throw new Error("Expected BaseLinker credentials");
  }
  assert.equal(tenantA.material.token, "tenant-a-secret");
  assert.equal(tenantB.material.token, "tenant-b-secret");
  assert.deepEqual(store.accesses.map((access) => access.secretResource), [
    "projects/p/secrets/baselinker-a",
    "projects/p/secrets/baselinker-b",
  ]);
  assert.doesNotMatch(JSON.stringify(reader.events), /tenant-a-secret|tenant-b-secret/);
});

test("resolver fails closed for credential scope mismatch and revoked credentials", async () => {
  const cases: readonly {
    readonly name: string;
    readonly row: CredentialMetadata | null;
    readonly expectedCode: string;
  }[] = [
    { name: "missing", row: null, expectedCode: "missing_metadata" },
    {
      name: "tenant mismatch",
      row: metadata({ tenantId: "tenant-b" }),
      expectedCode: "tenant_mismatch",
    },
    {
      name: "workspace mismatch",
      row: metadata({ workspaceId: "workspace-b" }),
      expectedCode: "workspace_mismatch",
    },
    {
      name: "connection mismatch",
      row: metadata({ connectionId: "connection-b" }),
      expectedCode: "connection_mismatch",
    },
    {
      name: "reference mismatch",
      row: metadata({ credentialReference: "credential-ref-b" }),
      expectedCode: "credential_reference_mismatch",
    },
    {
      name: "provider mismatch",
      row: metadata({
        providerId: "shopify",
        secretResource: "projects/p/secrets/shopify-a",
      }),
      expectedCode: "provider_mismatch",
    },
    {
      name: "revoked",
      row: metadata({ revokedAt: "2026-07-21T10:00:00.000Z" }),
      expectedCode: "revoked_credential",
    },
    {
      name: "inactive",
      row: metadata({ status: "pending_verification" }),
      expectedCode: "inactive_credential",
    },
    {
      name: "expired",
      row: metadata({ expiresAt: "2026-07-21T10:00:00.000Z" }),
      expectedCode: "expired_credential",
    },
  ];

  for (const scenario of cases) {
    const reader = new FixedMetadataReader(scenario.row);
    const store = new MapSecretStore();
    const provider = new ScopedCredentialProvider({
      metadataReader: reader,
      secretStore: store,
      now: () => new Date("2026-07-22T10:00:00.000Z"),
    });

    await assertRejectsCredentialCode(
      () => provider.resolve(baseInput),
      scenario.expectedCode,
    );
    assert.equal(store.accesses.length, 0, scenario.name);
    assert.equal(reader.events[0]?.outcome, "denied", scenario.name);
  }
});

test("resolver uses the active credential version during rotation", async () => {
  const row = metadata({
    activeVersion: "7",
    previousVersion: "6",
    rotationState: "rotating",
  });
  const reader = new FixedMetadataReader(row);
  const store = new MapSecretStore();
  store.set(row, JSON.stringify({ token: "rotated-secret" }));

  const provider = new ScopedCredentialProvider({
    metadataReader: reader,
    secretStore: store,
  });
  const resolved = await provider.resolve(baseInput);

  assert.equal(resolved.version, "7");
  assert.equal(resolved.providerId, "baselinker");
  if (resolved.providerId !== "baselinker") {
    throw new Error("Expected BaseLinker credentials");
  }
  assert.equal(resolved.material.token, "rotated-secret");
  assert.equal(store.accesses[0]?.version, "7");
});

test("Secret Manager store reads an explicit resource and version", async () => {
  const requestedUrls: string[] = [];
  const requestedAuthorization: string[] = [];
  const payload = JSON.stringify({ token: "secret-manager-token" });
  const store = new SecretManagerCredentialSecretStore({
    accessTokenProvider: async () => "metadata-token",
    fetchImpl: (async (input, init) => {
      requestedUrls.push(String(input));
      requestedAuthorization.push(readHeader(init?.headers, "Authorization") ?? "");
      return new Response(
        JSON.stringify({
          payload: { data: Buffer.from(payload, "utf8").toString("base64") },
        }),
        { status: 200 },
      );
    }) as typeof fetch,
  });

  const secret = await store.readSecret({
    providerId: "baselinker",
    credentialReference: "credential-ref-a",
    secretResource: "projects/p/secrets/baselinker-a",
    version: "7",
  });

  assert.equal(secret, payload);
  assert.equal(
    requestedUrls[0],
    "https://secretmanager.googleapis.com/v1/projects/p/secrets/baselinker-a/versions/7:access",
  );
  assert.deepEqual(requestedAuthorization, ["Bearer metadata-token"]);
});

test("in-memory credential secret store is blocked outside NODE_ENV=test", async () => {
  const { InMemoryCredentialSecretStore } = await import("./credentials.ts");
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  try {
    assert.throws(
      () => new InMemoryCredentialSecretStore(),
      (error: unknown) =>
        error instanceof CredentialResolutionError
        && error.code === "test_store_not_allowed",
    );
  } finally {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
  }
});

class FixedMetadataReader implements CredentialMetadataReader {
  readonly events: CredentialAccessAuditEvent[] = [];
  private readonly row: CredentialMetadata | null;

  constructor(row: CredentialMetadata | null) {
    this.row = row;
  }

  async findCredentialMetadata(): Promise<CredentialMetadata | null> {
    return this.row;
  }

  async recordCredentialAccess(event: CredentialAccessAuditEvent): Promise<void> {
    this.events.push(event);
  }
}

class MapMetadataReader implements CredentialMetadataReader {
  readonly events: CredentialAccessAuditEvent[] = [];
  private readonly rows: Map<string, CredentialMetadata>;

  constructor(rows: readonly CredentialMetadata[]) {
    this.rows = new Map(rows.map((row) => [metadataKey(row), row]));
  }

  async findCredentialMetadata(
    input: CredentialResolutionInput,
  ): Promise<CredentialMetadata | null> {
    return this.rows.get(inputKey(input)) ?? null;
  }

  async recordCredentialAccess(event: CredentialAccessAuditEvent): Promise<void> {
    this.events.push(event);
  }
}

class MapSecretStore implements CredentialSecretStore {
  readonly accesses: CredentialSecretReadInput[] = [];
  private readonly secrets = new Map<string, string>();

  set(row: CredentialMetadata, secretPayload: string): void {
    this.secrets.set(
      secretKey({
        providerId: row.providerId,
        credentialReference: row.credentialReference,
        secretResource: row.secretResource,
        version: row.activeVersion,
      }),
      secretPayload,
    );
  }

  async readSecret(input: CredentialSecretReadInput): Promise<string> {
    this.accesses.push(input);
    const payload = this.secrets.get(secretKey(input));
    if (!payload) {
      throw new CredentialResolutionError("secret_not_found");
    }
    return payload;
  }
}

function metadata(
  overrides: Partial<CredentialMetadata> = {},
): CredentialMetadata {
  return {
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    connectionId: "connection-a",
    credentialReference: "credential-ref-a",
    providerId: "baselinker",
    secretResource: "projects/p/secrets/baselinker-a",
    activeVersion: "1",
    previousVersion: null,
    rotationState: "active",
    status: "active",
    expiresAt: null,
    revokedAt: null,
    lastVerifiedAt: "2026-07-22T09:00:00.000Z",
    ...overrides,
  };
}

async function assertRejectsCredentialCode(
  action: () => Promise<unknown>,
  code: string,
): Promise<void> {
  await assert.rejects(
    action,
    (error: unknown) =>
      error instanceof CredentialResolutionError
      && error.code === code,
  );
}

function inputKey(input: CredentialResolutionInput): string {
  return [
    input.tenantId,
    input.workspaceId,
    input.connectionId,
    input.provider,
    input.credentialReference,
  ].join(":");
}

function metadataKey(row: CredentialMetadata): string {
  return [
    row.tenantId,
    row.workspaceId,
    row.connectionId,
    row.providerId,
    row.credentialReference,
  ].join(":");
}

function secretKey(input: CredentialSecretReadInput): string {
  return [
    input.providerId,
    input.credentialReference,
    input.secretResource,
    input.version,
  ].join(":");
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
