import { describe, expect, it } from "vitest";
import type { MvpIntegrationCatalogProviderId } from "@papadata/contracts";
import { parseCredentialSecret } from "./credentials.js";
import { createProviderAdapter, createProviderCatalogRegistry } from "./provider-factory.js";
import { ProviderRegistry } from "./provider-registry.js";
import { verifyProviderWebhook } from "./provider-webhook.js";

// P0-03 (docs/specyfikacja-docelowa/26-priorytety-p0/03-zakres-mvp-cala-aplikacja.md)
// names exactly 7 active providers. listTargetDescriptors() ignores the
// adapters map entirely (see provider-registry.ts), so an empty adapter list
// is enough to read the full canonical descriptor set back out.
const descriptors = new ProviderRegistry([]).listTargetDescriptors();

// Minimal, structurally-valid credential JSON per provider -- just enough
// for parseCredentialSecret's requiredString() checks to accept it (see
// credentials.ts). Values are placeholders never sent over the network by
// this test; only used to prove the factory's dispatch logic doesn't throw.
const sampleCredentialPayloads: Readonly<Record<MvpIntegrationCatalogProviderId, string>> = {
  allegro: JSON.stringify({ accessToken: "test-access-token" }),
  baselinker: JSON.stringify({ token: "test-token" }),
  ga4: JSON.stringify({ propertyId: "properties/123" }),
  google_ads: JSON.stringify({ developerToken: "test-dev-token", customerId: "1234567890" }),
  meta_ads: JSON.stringify({ accountId: "act_123", accessToken: "test-access-token" }),
  shopify: JSON.stringify({ shopDomain: "shop.myshopify.com", accessToken: "test-access-token" }),
  woocommerce: JSON.stringify({
    storeUrl: "https://shop.example.com",
    consumerKey: "ck_test",
    consumerSecret: "cs_test",
  }),
};

describe("provider registry contract (all 7 MVP providers)", () => {
  it("documents exactly the 7 providers named by P0-03's active-integration list", () => {
    const expected: readonly MvpIntegrationCatalogProviderId[] = [
      "woocommerce",
      "shopify",
      "baselinker",
      "allegro",
      "google_ads",
      "meta_ads",
      "ga4",
    ];
    expect([...descriptors.map((descriptor) => descriptor.providerId)].sort()).toEqual(
      [...expected].sort(),
    );
  });

  it.each(descriptors)("$providerId descriptor satisfies the shared registry contract", (descriptor) => {
    expect(descriptor.providerId.length).toBeGreaterThan(0);
    expect(descriptor.displayName.length).toBeGreaterThan(0);
    expect(["commerce", "advertising", "analytics"]).toContain(descriptor.category);
    expect(Array.isArray(descriptor.supportedStreams)).toBe(true);
    expect(descriptor.supportedStreams.length).toBeGreaterThan(0);
    expect(Array.isArray(descriptor.requiredScopes)).toBe(true);
    expect(descriptor.requiredScopes.length).toBeGreaterThan(0);
    expect(Array.isArray(descriptor.optionalScopes)).toBe(true);
    expect(typeof descriptor.supportsWebhooks).toBe("boolean");
  });

  it.each(descriptors)(
    "provider-factory builds a $providerId adapter from real credential material without throwing",
    (descriptor) => {
      const credential = parseCredentialSecret(
        descriptor.providerId,
        sampleCredentialPayloads[descriptor.providerId],
      );

      const adapter = createProviderAdapter(credential);

      expect(adapter.providerId).toBe(descriptor.providerId);
      expect(adapter.requiredScopes.length).toBeGreaterThan(0);
    },
  );

  it("createProviderCatalogRegistry wires an adapter for all 7 target descriptors", () => {
    const registry = createProviderCatalogRegistry();
    for (const descriptor of descriptors) {
      expect(registry.hasAdapter(descriptor.providerId)).toBe(true);
      expect(() => registry.getAdapter(descriptor.providerId)).not.toThrow();
    }
  });

  // §3 explicitly asks that this NOT hardcode ["woocommerce","shopify",
  // "meta_ads"] as the expected webhook-capable set -- instead it re-derives
  // "can this provider's credential material actually carry a usable
  // webhook secret" from the real parseCredentialSecret + verifyProviderWebhook
  // code (credentials.ts only copies a webhookSecret/appSecret field through
  // for woocommerce/shopify/meta_ads; every other provider's parser branch
  // drops it), then cross-checks that against the registry's own
  // supportsWebhooks flag. A future provider whose supportsWebhooks flag and
  // wired secret field disagree fails this test.
  it("supportsWebhooks is true if and only if the provider's credential material carries a usable webhook secret", () => {
    for (const descriptor of descriptors) {
      const basePayload = JSON.parse(sampleCredentialPayloads[descriptor.providerId]) as Record<string, unknown>;
      const withCandidateSecrets = {
        ...basePayload,
        appSecret: "shared-test-secret",
        webhookSecret: "shared-test-secret",
      };
      const credential = parseCredentialSecret(descriptor.providerId, JSON.stringify(withCandidateSecrets));

      const result = verifyProviderWebhook({
        credential,
        providerId: descriptor.providerId,
        rawBody: Buffer.from("{}"),
        signature: "not-a-real-signature",
      });

      const hasUsableWebhookSecret = result.failureReason !== "missing_secret";
      expect(hasUsableWebhookSecret).toBe(descriptor.supportsWebhooks);
    }
  });
});
