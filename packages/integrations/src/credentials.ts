import type { MvpIntegrationCatalogProviderId } from "@papadata/contracts";

export type CredentialRotationState =
  | "active"
  | "verifying_new"
  | "rotating"
  | "previous"
  | "revoked";

export type CredentialResolutionInput = {
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly connectionId: string;
  readonly credentialReference: string;
  readonly provider: MvpIntegrationCatalogProviderId;
};

export type CredentialMetadata = {
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly connectionId: string;
  readonly credentialReference: string;
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly secretResource: string;
  readonly activeVersion: string;
  readonly previousVersion: string | null;
  readonly rotationState: CredentialRotationState;
  readonly status: string;
  readonly expiresAt: string | null;
  readonly revokedAt: string | null;
  readonly lastVerifiedAt: string | null;
};

export type CredentialAccessAuditEvent = CredentialResolutionInput & {
  readonly outcome: "granted" | "denied";
  readonly failureReason: string | null;
  readonly credentialVersion: string | null;
};

export interface CredentialMetadataReader {
  findCredentialMetadata(
    input: CredentialResolutionInput,
  ): Promise<CredentialMetadata | null>;
  recordCredentialAccess?(event: CredentialAccessAuditEvent): Promise<void>;
}

export type CredentialSecretReadInput = {
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly credentialReference: string;
  readonly secretResource: string;
  readonly version: string;
};

export interface CredentialSecretStore {
  readSecret(input: CredentialSecretReadInput): Promise<string>;
}

export interface CredentialProvider {
  resolve(input: CredentialResolutionInput): Promise<ResolvedCredentialMaterial>;
}

export type WooCommerceCredentialMaterial = {
  readonly storeUrl: string;
  readonly consumerKey: string;
  readonly consumerSecret: string;
  readonly webhookSecret?: string;
};

export type ShopifyCredentialMaterial = {
  readonly shopDomain: string;
  readonly accessToken: string;
  readonly apiVersion: string;
  readonly webhookSecret?: string;
};

export type BaseLinkerCredentialMaterial = {
  readonly token: string;
};

export type AllegroCredentialMaterial = {
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly clientId?: string;
  readonly clientSecret?: string;
  readonly tokenUri?: string;
  readonly expiresAt?: string | null;
  readonly apiBaseUrl?: string;
  readonly marketplaceId?: string;
};

export type GoogleAdsCredentialMaterial = {
  readonly developerToken: string;
  readonly customerId: string;
  readonly loginCustomerId?: string;
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly clientId?: string;
  readonly clientSecret?: string;
  readonly tokenUri?: string;
  readonly expiresAt?: string | null;
  readonly apiVersion?: string;
};

export type MetaAdsCredentialMaterial = {
  readonly accountId: string;
  readonly accessToken: string;
  readonly apiVersion?: string;
  readonly appSecret?: string;
};

export type Ga4CredentialMaterial = {
  readonly propertyId: string;
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly clientId?: string;
  readonly clientSecret?: string;
  readonly tokenUri?: string;
  readonly expiresAt?: string | null;
};

export type ResolvedCredentialMaterial =
  | {
      readonly providerId: "woocommerce";
      readonly credentialReference: string;
      readonly secretResource: string;
      readonly version: string;
      readonly material: WooCommerceCredentialMaterial;
    }
  | {
      readonly providerId: "shopify";
      readonly credentialReference: string;
      readonly secretResource: string;
      readonly version: string;
      readonly material: ShopifyCredentialMaterial;
    }
  | {
      readonly providerId: "baselinker";
      readonly credentialReference: string;
      readonly secretResource: string;
      readonly version: string;
      readonly material: BaseLinkerCredentialMaterial;
    }
  | {
      readonly providerId: "allegro";
      readonly credentialReference: string;
      readonly secretResource: string;
      readonly version: string;
      readonly material: AllegroCredentialMaterial;
    }
  | {
      readonly providerId: "google_ads";
      readonly credentialReference: string;
      readonly secretResource: string;
      readonly version: string;
      readonly material: GoogleAdsCredentialMaterial;
    }
  | {
      readonly providerId: "meta_ads";
      readonly credentialReference: string;
      readonly secretResource: string;
      readonly version: string;
      readonly material: MetaAdsCredentialMaterial;
    }
  | {
      readonly providerId: "ga4";
      readonly credentialReference: string;
      readonly secretResource: string;
      readonly version: string;
      readonly material: Ga4CredentialMaterial;
    };

export class CredentialResolutionError extends Error {
  readonly code: string;

  constructor(code: string, message = "Credential resolution failed") {
    super(message);
    this.name = "CredentialResolutionError";
    this.code = code;
  }
}

export class ScopedCredentialProvider implements CredentialProvider {
  private readonly metadataReader: CredentialMetadataReader;
  private readonly secretStore: CredentialSecretStore;
  private readonly now: () => Date;

  constructor(input: {
    readonly metadataReader: CredentialMetadataReader;
    readonly secretStore: CredentialSecretStore;
    readonly now?: () => Date;
  }) {
    this.metadataReader = input.metadataReader;
    this.secretStore = input.secretStore;
    this.now = input.now ?? (() => new Date());
  }

  async resolve(input: CredentialResolutionInput): Promise<ResolvedCredentialMaterial> {
    const metadata = await this.metadataReader.findCredentialMetadata(input);

    if (!metadata) {
      await this.audit(input, "denied", "missing_metadata", null);
      throw new CredentialResolutionError("missing_metadata");
    }

    const mismatchCode = findMetadataMismatch(input, metadata);
    if (mismatchCode) {
      await this.audit(input, "denied", mismatchCode, metadata.activeVersion);
      throw new CredentialResolutionError(mismatchCode);
    }

    if (metadata.status !== "active") {
      await this.audit(input, "denied", "inactive_credential", metadata.activeVersion);
      throw new CredentialResolutionError("inactive_credential");
    }

    if (metadata.rotationState === "revoked" || metadata.revokedAt) {
      await this.audit(input, "denied", "revoked_credential", metadata.activeVersion);
      throw new CredentialResolutionError("revoked_credential");
    }

    if (metadata.expiresAt && new Date(metadata.expiresAt).getTime() <= this.now().getTime()) {
      await this.audit(input, "denied", "expired_credential", metadata.activeVersion);
      throw new CredentialResolutionError("expired_credential");
    }

    const secretPayload = await this.secretStore.readSecret({
      providerId: metadata.providerId,
      credentialReference: metadata.credentialReference,
      secretResource: metadata.secretResource,
      version: metadata.activeVersion,
    });
    const material = parseCredentialSecret(metadata.providerId, secretPayload);

    await this.audit(input, "granted", null, metadata.activeVersion);
    return {
      providerId: material.providerId,
      credentialReference: metadata.credentialReference,
      secretResource: metadata.secretResource,
      version: metadata.activeVersion,
      material: material.material,
    } as ResolvedCredentialMaterial;
  }

  private async audit(
    input: CredentialResolutionInput,
    outcome: CredentialAccessAuditEvent["outcome"],
    failureReason: string | null,
    credentialVersion: string | null,
  ): Promise<void> {
    await this.metadataReader.recordCredentialAccess?.({
      ...input,
      outcome,
      failureReason,
      credentialVersion,
    });
  }
}

function findMetadataMismatch(
  input: CredentialResolutionInput,
  metadata: CredentialMetadata,
): string | null {
  const checks: readonly [boolean, string][] = [
    [metadata.tenantId === input.tenantId, "tenant_mismatch"],
    [metadata.workspaceId === input.workspaceId, "workspace_mismatch"],
    [metadata.connectionId === input.connectionId, "connection_mismatch"],
    [metadata.credentialReference === input.credentialReference, "credential_reference_mismatch"],
    [metadata.providerId === input.provider, "provider_mismatch"],
    [metadata.secretResource.trim().length > 0, "missing_secret_resource"],
    [metadata.activeVersion.trim().length > 0, "missing_active_version"],
  ];

  for (const [passes, code] of checks) {
    if (!passes) {
      return code;
    }
  }
  return null;
}

export class InMemoryCredentialSecretStore implements CredentialSecretStore {
  private readonly secrets = new Map<string, string>();

  constructor(entries: readonly CredentialSecretReadInput[] = []) {
    if (process.env.NODE_ENV !== "test") {
      throw new CredentialResolutionError("test_store_not_allowed");
    }

    for (const entry of entries) {
      this.secrets.set(secretStoreKey(entry), "");
    }
  }

  setSecret(input: CredentialSecretReadInput, secretPayload: string): void {
    this.secrets.set(secretStoreKey(input), secretPayload);
  }

  async readSecret(input: CredentialSecretReadInput): Promise<string> {
    const payload = this.secrets.get(secretStoreKey(input));
    if (!payload) {
      throw new CredentialResolutionError("secret_not_found");
    }
    return payload;
  }
}

export type SecretManagerCredentialSecretStoreOptions = {
  readonly fetchImpl?: typeof fetch;
  readonly accessTokenProvider?: () => Promise<string>;
  readonly timeoutMs?: number;
  readonly maxAttempts?: number;
};

export class SecretManagerCredentialSecretStore implements CredentialSecretStore {
  private readonly fetchImpl: typeof fetch;
  private readonly accessTokenProvider: () => Promise<string>;
  private readonly timeoutMs: number;
  private readonly maxAttempts: number;

  constructor(options: SecretManagerCredentialSecretStoreOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 3_000;
    this.maxAttempts = Math.max(1, options.maxAttempts ?? 2);
    this.accessTokenProvider = options.accessTokenProvider ?? (() => this.readMetadataServerAccessToken());
  }

  async readSecret(input: CredentialSecretReadInput): Promise<string> {
    if (!input.secretResource.startsWith("projects/")) {
      throw new CredentialResolutionError("invalid_secret_resource");
    }

    const token = await this.accessTokenProvider();
    const encodedResource = input.secretResource
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");
    const encodedVersion = encodeURIComponent(input.version);
    const url = `https://secretmanager.googleapis.com/v1/${encodedResource}/versions/${encodedVersion}:access`;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      const response = await this.fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const body = await response.json() as SecretManagerAccessResponse;
        const data = body.payload?.data;
        if (!data || typeof data !== "string") {
          throw new CredentialResolutionError("invalid_secret_payload");
        }
        return Buffer.from(data, "base64").toString("utf8");
      }

      if (!isRetryableSecretManagerStatus(response.status) || attempt === this.maxAttempts) {
        throw new CredentialResolutionError("secret_access_denied");
      }
    }

    throw new CredentialResolutionError("secret_access_denied");
  }

  private async readMetadataServerAccessToken(): Promise<string> {
    const response = await this.fetchWithTimeout(
      "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
      { headers: { "Metadata-Flavor": "Google" } },
    );

    if (!response.ok) {
      throw new CredentialResolutionError("metadata_token_unavailable");
    }

    const body = await response.json() as { access_token?: unknown };
    if (typeof body.access_token !== "string" || body.access_token.length === 0) {
      throw new CredentialResolutionError("metadata_token_unavailable");
    }
    return body.access_token;
  }

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await this.fetchImpl(url, { ...init, signal: controller.signal });
    } catch {
      throw new CredentialResolutionError("secret_store_unavailable");
    } finally {
      clearTimeout(timeout);
    }
  }
}

type SecretManagerAccessResponse = {
  readonly payload?: {
    readonly data?: unknown;
  };
};

function isRetryableSecretManagerStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function secretStoreKey(input: CredentialSecretReadInput): string {
  return [
    input.providerId,
    input.credentialReference,
    input.secretResource,
    input.version,
  ].join("\u001f");
}

function parseCredentialSecret(
  providerId: MvpIntegrationCatalogProviderId,
  secretPayload: string,
): ResolvedCredentialMaterial {
  const payload = parseJsonObject(secretPayload);
  const common = {
    credentialReference: "",
    secretResource: "",
    version: "",
  } as const;

  switch (providerId) {
    case "woocommerce":
      return {
        ...common,
        providerId,
        material: {
          storeUrl: requiredString(payload.storeUrl),
          consumerKey: requiredString(payload.consumerKey),
          consumerSecret: requiredString(payload.consumerSecret),
          ...(optionalString(payload.webhookSecret)
            ? { webhookSecret: optionalString(payload.webhookSecret) ?? undefined }
            : {}),
        },
      };
    case "shopify":
      return {
        ...common,
        providerId,
        material: {
          shopDomain: requiredString(payload.shopDomain),
          accessToken: requiredString(payload.accessToken),
          apiVersion: optionalString(payload.apiVersion) ?? "2026-07",
          ...(optionalString(payload.webhookSecret)
            ? { webhookSecret: optionalString(payload.webhookSecret) ?? undefined }
            : {}),
        },
      };
    case "baselinker":
      return {
        ...common,
        providerId,
        material: {
          token: requiredString(payload.token),
        },
      };
    case "allegro":
      return {
        ...common,
        providerId,
        material: {
          ...optionalOAuthMaterial(payload),
          ...(optionalString(payload.apiBaseUrl)
            ? { apiBaseUrl: optionalString(payload.apiBaseUrl) ?? undefined }
            : {}),
          ...(optionalString(payload.marketplaceId)
            ? { marketplaceId: optionalString(payload.marketplaceId) ?? undefined }
            : {}),
        },
      };
    case "google_ads":
      return {
        ...common,
        providerId,
        material: {
          developerToken: requiredString(payload.developerToken),
          customerId: requiredString(payload.customerId),
          ...optionalOAuthMaterial(payload),
          ...(optionalString(payload.loginCustomerId)
            ? { loginCustomerId: optionalString(payload.loginCustomerId) ?? undefined }
            : {}),
          ...(optionalString(payload.apiVersion)
            ? { apiVersion: optionalString(payload.apiVersion) ?? undefined }
            : {}),
        },
      };
    case "meta_ads":
      return {
        ...common,
        providerId,
        material: {
          accountId: requiredString(payload.accountId),
          accessToken: requiredString(payload.accessToken),
          ...(optionalString(payload.apiVersion)
            ? { apiVersion: optionalString(payload.apiVersion) ?? undefined }
            : {}),
          ...(optionalString(payload.appSecret)
            ? { appSecret: optionalString(payload.appSecret) ?? undefined }
            : {}),
        },
      };
    case "ga4":
      return {
        ...common,
        providerId,
        material: {
          propertyId: requiredString(payload.propertyId),
          ...optionalOAuthMaterial(payload),
        },
      };
  }
  throw new CredentialResolutionError("provider_not_supported");
}

function optionalOAuthMaterial(
  payload: Record<string, unknown>,
): {
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly clientId?: string;
  readonly clientSecret?: string;
  readonly tokenUri?: string;
  readonly expiresAt?: string | null;
} {
  return {
    ...(optionalString(payload.accessToken)
      ? { accessToken: optionalString(payload.accessToken) ?? undefined }
      : {}),
    ...(optionalString(payload.refreshToken)
      ? { refreshToken: optionalString(payload.refreshToken) ?? undefined }
      : {}),
    ...(optionalString(payload.clientId)
      ? { clientId: optionalString(payload.clientId) ?? undefined }
      : {}),
    ...(optionalString(payload.clientSecret)
      ? { clientSecret: optionalString(payload.clientSecret) ?? undefined }
      : {}),
    ...(optionalString(payload.tokenUri)
      ? { tokenUri: optionalString(payload.tokenUri) ?? undefined }
      : {}),
    ...(optionalNullableString(payload.expiresAt) !== undefined
      ? { expiresAt: optionalNullableString(payload.expiresAt) }
      : {}),
  };
}

function parseJsonObject(payload: string): Record<string, unknown> {
  try {
    const value = JSON.parse(payload) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new CredentialResolutionError("invalid_secret_payload");
    }
    return value as Record<string, unknown>;
  } catch (error) {
    if (error instanceof CredentialResolutionError) {
      throw error;
    }
    throw new CredentialResolutionError("invalid_secret_payload");
  }
}

function requiredString(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new CredentialResolutionError("invalid_secret_payload");
  }
  return value;
}

function optionalString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  return requiredString(value);
}

function optionalNullableString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return requiredString(value);
}
