import { createHmac, timingSafeEqual } from "node:crypto";
import type { MvpIntegrationCatalogProviderId } from "@papadata/contracts";
import type { ResolvedCredentialMaterial } from "./credentials.js";

export type ProviderWebhookVerificationInput = {
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly rawBody: Buffer;
  readonly signature: string;
  readonly credential: ResolvedCredentialMaterial;
};

export type ProviderWebhookVerificationResult = {
  readonly valid: boolean;
  readonly algorithm: "hmac-sha256-base64" | "hmac-sha256-hex";
  readonly failureReason: "invalid_signature" | "missing_secret" | null;
};

export function verifyProviderWebhook(
  input: ProviderWebhookVerificationInput,
): ProviderWebhookVerificationResult {
  const secret = webhookSecret(input.credential);
  const algorithm = input.providerId === "meta_ads"
    ? "hmac-sha256-hex" as const
    : "hmac-sha256-base64" as const;
  if (!secret) return { valid: false, algorithm, failureReason: "missing_secret" };
  const digest = createHmac("sha256", secret).update(input.rawBody).digest(
    algorithm === "hmac-sha256-hex" ? "hex" : "base64",
  );
  const actual = algorithm === "hmac-sha256-hex"
    ? input.signature.replace(/^sha256=/iu, "")
    : input.signature;
  const valid = safeEqual(digest, actual);
  return { valid, algorithm, failureReason: valid ? null : "invalid_signature" };
}

function webhookSecret(credential: ResolvedCredentialMaterial): string | null {
  if (credential.providerId === "woocommerce") return credential.material.webhookSecret ?? null;
  if (credential.providerId === "shopify") return credential.material.webhookSecret ?? null;
  if (credential.providerId === "meta_ads") return credential.material.appSecret ?? null;
  return null;
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
