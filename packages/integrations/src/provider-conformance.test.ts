import assert from "node:assert/strict";
import test from "node:test";
import {
  createProviderAdapter,
  createProviderCatalogRegistry,
  type ResolvedCredentialMaterial,
} from "./index.ts";

const credentialCases: readonly ResolvedCredentialMaterial[] = [
  credential("woocommerce", { storeUrl: "https://store.example.com", consumerKey: "ck", consumerSecret: "cs" }),
  credential("shopify", { shopDomain: "store.myshopify.com", accessToken: "token", apiVersion: "2026-07" }),
  credential("baselinker", { token: "token" }),
  credential("allegro", { accessToken: "token" }),
  credential("google_ads", { developerToken: "dev", customerId: "1234567890", accessToken: "token" }),
  credential("meta_ads", { accountId: "123456789", accessToken: "token" }),
  credential("ga4", { propertyId: "123456", accessToken: "token" }),
];

test("catalog exposes exactly seven runtime adapters", () => {
  const registry = createProviderCatalogRegistry();
  const descriptors = registry.listDescriptors();
  assert.equal(descriptors.length, 7);
  assert.deepEqual(
    descriptors.map((descriptor: { readonly providerId: string }) => descriptor.providerId).sort(),
    ["allegro", "baselinker", "ga4", "google_ads", "meta_ads", "shopify", "woocommerce"],
  );
  assert.equal(
    descriptors.find((descriptor: { readonly providerId: string; readonly supportsWebhooks: boolean }) => descriptor.providerId === "allegro")?.supportsWebhooks,
    false,
  );
});

test("factory creates configured adapters for all seven providers", () => {
  for (const item of credentialCases) {
    const adapter = createProviderAdapter(item);
    assert.equal(adapter.providerId, item.providerId);
    assert.equal(adapter.isConfigured(), true, item.providerId);
    assert.ok(adapter.requiredScopes.length > 0, item.providerId);
  }
});

function credential<TProvider extends ResolvedCredentialMaterial["providerId"]>(
  providerId: TProvider,
  material: Extract<ResolvedCredentialMaterial, { providerId: TProvider }>["material"],
): Extract<ResolvedCredentialMaterial, { providerId: TProvider }> {
  return {
    providerId,
    material,
    credentialReference: "ref",
    secretResource: "projects/p/secrets/s",
    version: "1",
  } as Extract<ResolvedCredentialMaterial, { providerId: TProvider }>;
}
