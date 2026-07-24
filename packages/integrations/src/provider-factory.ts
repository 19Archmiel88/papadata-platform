import type { IntegrationProviderAdapter } from "./provider-adapter.js";
import { ProviderRegistry } from "./provider-registry.js";
import type { ResolvedCredentialMaterial } from "./credentials.js";
import { CredentialResolutionError } from "./credentials.js";
import { BaseLinkerAdapter } from "./providers/baselinker.js";
import { Ga4Adapter } from "./providers/ga4.js";
import { ShopifyAdapter } from "./providers/shopify.js";

export function createProviderAdapter(
  credential: ResolvedCredentialMaterial,
): IntegrationProviderAdapter {
  switch (credential.providerId) {
    case "shopify":
      return new ShopifyAdapter({
        shopDomain: credential.material.shopDomain,
        accessToken: credential.material.accessToken,
        apiVersion: credential.material.apiVersion,
      });
    case "baselinker":
      return new BaseLinkerAdapter(credential.material.token);
    case "ga4":
      return new Ga4Adapter({
        propertyId: credential.material.propertyId,
        accessToken: credential.material.accessToken,
      });
  }

  throw new CredentialResolutionError("provider_not_supported");
}

export function createProviderCatalogRegistry(): ProviderRegistry {
  return new ProviderRegistry([
    new ShopifyAdapter(null),
    new BaseLinkerAdapter(null),
    new Ga4Adapter(null),
  ]);
}
