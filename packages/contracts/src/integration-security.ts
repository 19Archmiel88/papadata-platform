import type { IsoDateTime, TenantWorkspaceScope } from "./index.js";
import type { MvpIntegrationCatalogProviderId } from "./integration-platform.js";

export type CredentialLifecycle = TenantWorkspaceScope & {
  readonly credentialId: string;
  readonly connectionId: string;
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly secretReference: string;
  readonly requiredScopes: readonly string[];
  readonly grantedScopes: readonly string[];
  readonly missingScopes: readonly string[];
  readonly status: "active" | "expiring" | "expired" | "revoked" | "deleted";
  readonly issuedAt: IsoDateTime;
  readonly expiresAt: IsoDateTime | null;
  readonly rotatedAt: IsoDateTime | null;
  readonly revokedAt: IsoDateTime | null;
};

export type IntegrationWebhookEnvelope = {
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly eventId: string;
  readonly eventType: string;
  readonly connectionExternalId: string;
  readonly timestamp: IsoDateTime;
  readonly schemaVersion: string;
  readonly payload: unknown;
};

export type WebhookVerificationResult = {
  readonly valid: boolean;
  readonly signatureValid: boolean;
  readonly timestampValid: boolean;
  readonly replayDetected: boolean;
  readonly connectionResolved: boolean;
  readonly failureReason: string | null;
};

export type WebhookReceipt = TenantWorkspaceScope & {
  readonly receiptId: string;
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly eventId: string;
  readonly eventType: string;
  readonly receivedAt: IsoDateTime;
  readonly verification: WebhookVerificationResult;
};
