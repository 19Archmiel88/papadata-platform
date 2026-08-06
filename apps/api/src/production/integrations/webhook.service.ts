import { BadRequestException, ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import { toIdempotencyKey, type MvpIntegrationCatalogProviderId } from "@papadata/contracts";
import {
  IntegrationRepository,
  ProductionDatabase,
  WebhookReceiptRepository,
} from "@papadata/database";
import {
  verifyProviderWebhook,
  type CredentialProvider,
  type ResolvedCredentialMaterial,
} from "@papadata/integrations";
import { IntegrationService } from "./integration.service.js";
import { INTEGRATION_CREDENTIAL_PROVIDER } from "./credential-provider.js";

@Injectable()
export class WebhookService {
  private readonly connections: IntegrationRepository;
  private readonly receipts: WebhookReceiptRepository;

  constructor(
    @Inject(ProductionDatabase) database: ProductionDatabase,
    @Inject(INTEGRATION_CREDENTIAL_PROVIDER) private readonly credentials: CredentialProvider,
    @Inject(IntegrationService) private readonly integrations: IntegrationService,
  ) {
    this.connections = new IntegrationRepository(database);
    this.receipts = new WebhookReceiptRepository(database);
  }

  async receive(input: {
    readonly providerId: MvpIntegrationCatalogProviderId;
    readonly connectionId: string;
    readonly rawBody: Buffer;
    readonly signature: string;
    readonly providerEventId: string;
    readonly providerTimestamp: string | null;
  }): Promise<object> {
    if (!isWebhookProvider(input.providerId)) {
      throw new BadRequestException("Provider uses polling instead of webhooks.");
    }
    if (input.signature.trim().length === 0) {
      throw new ForbiddenException("Webhook signature is required.");
    }
    validateProviderTimestamp(input.providerTimestamp);
    const connection = await this.connections.findConnectionForWebhook(input.connectionId, input.providerId);
    if (!connection) throw new ForbiddenException("Webhook connection was not resolved.");
    const tenantId = requiredString(connection.tenant_id);
    const workspaceId = requiredString(connection.workspace_id);
    const credentialReference = requiredString(connection.credential_ref);
    const credential = await this.credentials.resolve({
      tenantId,
      workspaceId,
      connectionId: input.connectionId,
      credentialReference,
      provider: input.providerId,
    });
    const verification = verifyProviderWebhook({
      providerId: input.providerId,
      rawBody: input.rawBody,
      signature: input.signature,
      credential: credential as ResolvedCredentialMaterial,
    });
    if (!verification.valid) throw new ForbiddenException("Webhook signature is invalid.");
    const reserved = await this.receipts.reserve({
      tenantId,
      workspaceId,
      connectionId: input.connectionId,
      providerId: input.providerId,
      providerEventId: input.providerEventId,
      signatureDigest: sha256(input.signature),
      payloadDigest: sha256(input.rawBody),
      providerTimestamp: input.providerTimestamp,
      ttlSeconds: 7 * 24 * 60 * 60,
    });
    if (!reserved) return { accepted: true, duplicate: true, providerEventId: input.providerEventId };
    const streams = input.providerId === "meta_ads"
      ? ["ad_spend", "attributed_conversions"] as const
      : ["orders", "products", "refunds", "inventory"] as const;
    const job = await this.integrations.startSync({
      tenantId,
      workspaceId,
      connectionId: input.connectionId,
      providerId: input.providerId,
      operation: "incremental_sync",
      request: {
        streams,
        idempotencyKey: toIdempotencyKey(`webhook:${input.providerId}:${input.providerEventId}`),
      },
    });
    return { accepted: true, duplicate: false, providerEventId: input.providerEventId, job };
  }
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}
function requiredString(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) throw new ForbiddenException("Webhook connection is invalid.");
  return value;
}
export function fallbackEventId(input: {
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly connectionId: string;
  readonly rawBody: Buffer;
}): string {
  return `derived:${sha256(Buffer.concat([
    Buffer.from(input.providerId, "utf8"),
    Buffer.from("\0", "utf8"),
    Buffer.from(input.connectionId, "utf8"),
    Buffer.from("\0", "utf8"),
    input.rawBody,
  ]))}`;
}

function isWebhookProvider(
  providerId: MvpIntegrationCatalogProviderId,
): providerId is "woocommerce" | "shopify" | "meta_ads" {
  return providerId === "woocommerce"
    || providerId === "shopify"
    || providerId === "meta_ads";
}

function validateProviderTimestamp(value: string | null): void {
  if (!value) return;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new ForbiddenException("Webhook timestamp is invalid.");
  }
  const driftMs = Math.abs(Date.now() - timestamp);
  if (driftMs > 15 * 60 * 1_000) {
    throw new ForbiddenException("Webhook timestamp is outside the accepted window.");
  }
}
