import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { ResolvedCredentialMaterial } from "./credentials.js";
import { verifyProviderWebhook } from "./provider-webhook.js";

function wooCommerceCredential(webhookSecret?: string): ResolvedCredentialMaterial {
  return {
    credentialReference: "ref",
    material: {
      consumerKey: "ck_test",
      consumerSecret: "cs_test",
      storeUrl: "https://shop.example.com",
      ...(webhookSecret ? { webhookSecret } : {}),
    },
    providerId: "woocommerce",
    secretResource: "resource",
    version: "1",
  };
}

function metaAdsCredential(appSecret?: string): ResolvedCredentialMaterial {
  return {
    credentialReference: "ref",
    material: {
      accessToken: "test-access-token",
      accountId: "act_123",
      ...(appSecret ? { appSecret } : {}),
    },
    providerId: "meta_ads",
    secretResource: "resource",
    version: "1",
  };
}

describe("verifyProviderWebhook", () => {
  describe("woocommerce (hmac-sha256-base64)", () => {
    it("accepts a correctly signed payload", () => {
      const secret = "whsec_test";
      const rawBody = Buffer.from(JSON.stringify({ id: 1 }));
      const signature = createHmac("sha256", secret).update(rawBody).digest("base64");

      const result = verifyProviderWebhook({
        credential: wooCommerceCredential(secret),
        providerId: "woocommerce",
        rawBody,
        signature,
      });

      expect(result).toEqual({ algorithm: "hmac-sha256-base64", failureReason: null, valid: true });
    });

    it("rejects a payload signed with the wrong secret", () => {
      const rawBody = Buffer.from(JSON.stringify({ id: 1 }));
      const wrongSignature = createHmac("sha256", "a-different-secret").update(rawBody).digest("base64");

      const result = verifyProviderWebhook({
        credential: wooCommerceCredential("whsec_test"),
        providerId: "woocommerce",
        rawBody,
        signature: wrongSignature,
      });

      expect(result).toEqual({ algorithm: "hmac-sha256-base64", failureReason: "invalid_signature", valid: false });
    });

    it("rejects a payload with a missing signature", () => {
      const rawBody = Buffer.from(JSON.stringify({ id: 1 }));

      const result = verifyProviderWebhook({
        credential: wooCommerceCredential("whsec_test"),
        providerId: "woocommerce",
        rawBody,
        signature: "",
      });

      expect(result).toEqual({ algorithm: "hmac-sha256-base64", failureReason: "invalid_signature", valid: false });
    });

    it("rejects every signature when the connection has no webhook secret configured", () => {
      const rawBody = Buffer.from(JSON.stringify({ id: 1 }));
      const signature = createHmac("sha256", "whatever").update(rawBody).digest("base64");

      const result = verifyProviderWebhook({
        credential: wooCommerceCredential(undefined),
        providerId: "woocommerce",
        rawBody,
        signature,
      });

      expect(result).toEqual({ algorithm: "hmac-sha256-base64", failureReason: "missing_secret", valid: false });
    });
  });

  describe("meta_ads (hmac-sha256-hex, sha256= prefix)", () => {
    it("accepts a correctly signed payload with the sha256= prefix stripped before comparison", () => {
      const secret = "app-secret";
      const rawBody = Buffer.from(JSON.stringify({ entry: [] }));
      const digest = createHmac("sha256", secret).update(rawBody).digest("hex");

      const result = verifyProviderWebhook({
        credential: metaAdsCredential(secret),
        providerId: "meta_ads",
        rawBody,
        signature: `sha256=${digest}`,
      });

      expect(result).toEqual({ algorithm: "hmac-sha256-hex", failureReason: null, valid: true });
    });

    it("rejects a payload signed with the wrong app secret", () => {
      const rawBody = Buffer.from(JSON.stringify({ entry: [] }));
      const wrongDigest = createHmac("sha256", "a-different-secret").update(rawBody).digest("hex");

      const result = verifyProviderWebhook({
        credential: metaAdsCredential("app-secret"),
        providerId: "meta_ads",
        rawBody,
        signature: `sha256=${wrongDigest}`,
      });

      expect(result).toEqual({ algorithm: "hmac-sha256-hex", failureReason: "invalid_signature", valid: false });
    });

    it("rejects every signature when the connection has no app secret configured", () => {
      const rawBody = Buffer.from(JSON.stringify({ entry: [] }));
      const digest = createHmac("sha256", "whatever").update(rawBody).digest("hex");

      const result = verifyProviderWebhook({
        credential: metaAdsCredential(undefined),
        providerId: "meta_ads",
        rawBody,
        signature: `sha256=${digest}`,
      });

      expect(result).toEqual({ algorithm: "hmac-sha256-hex", failureReason: "missing_secret", valid: false });
    });
  });
});
