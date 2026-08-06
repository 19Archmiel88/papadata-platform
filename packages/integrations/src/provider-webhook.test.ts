import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import type { ResolvedCredentialMaterial } from "./credentials.ts";
import { verifyProviderWebhook } from "./provider-webhook.ts";

const rawBody = Buffer.from('{"event":"updated"}', "utf8");

test("WooCommerce webhook validates base64 HMAC and rejects altered signatures", () => {
  const credential: ResolvedCredentialMaterial = {
    providerId: "woocommerce",
    credentialReference: "credential-1",
    secretResource: "projects/test/secrets/woo",
    version: "1",
    material: {
      storeUrl: "https://shop.example.test",
      consumerKey: "key",
      consumerSecret: "secret",
      webhookSecret: "webhook-secret",
    },
  };
  const signature = createHmac("sha256", "webhook-secret")
    .update(rawBody)
    .digest("base64");
  assert.equal(verifyProviderWebhook({
    providerId: "woocommerce",
    rawBody,
    signature,
    credential,
  }).valid, true);
  assert.equal(verifyProviderWebhook({
    providerId: "woocommerce",
    rawBody,
    signature: `${signature}x`,
    credential,
  }).valid, false);
});

test("Shopify webhook requires a configured webhook secret", () => {
  const credential: ResolvedCredentialMaterial = {
    providerId: "shopify",
    credentialReference: "credential-2",
    secretResource: "projects/test/secrets/shopify",
    version: "1",
    material: {
      shopDomain: "shop.example.test",
      accessToken: "token",
      apiVersion: "2026-07",
    },
  };
  const result = verifyProviderWebhook({
    providerId: "shopify",
    rawBody,
    signature: "signature",
    credential,
  });
  assert.equal(result.valid, false);
  assert.equal(result.failureReason, "missing_secret");
});

test("Meta webhook accepts sha256-prefixed hexadecimal HMAC", () => {
  const credential: ResolvedCredentialMaterial = {
    providerId: "meta_ads",
    credentialReference: "credential-3",
    secretResource: "projects/test/secrets/meta",
    version: "1",
    material: {
      accountId: "act_123",
      accessToken: "token",
      appSecret: "app-secret",
    },
  };
  const digest = createHmac("sha256", "app-secret")
    .update(rawBody)
    .digest("hex");
  assert.equal(verifyProviderWebhook({
    providerId: "meta_ads",
    rawBody,
    signature: `sha256=${digest}`,
    credential,
  }).valid, true);
});
