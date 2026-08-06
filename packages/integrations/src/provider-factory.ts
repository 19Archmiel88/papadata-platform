import type { IntegrationProviderAdapter } from "./provider-adapter.js";
import { ProviderRegistry } from "./provider-registry.js";
import type { ResolvedCredentialMaterial } from "./credentials.js";
import { CredentialResolutionError } from "./credentials.js";
import { AllegroAdapter } from "./providers/allegro.js";
import { BaseLinkerAdapter } from "./providers/baselinker.js";
import { Ga4Adapter } from "./providers/ga4.js";
import { GoogleAdsAdapter } from "./providers/google-ads.js";
import { MetaAdsAdapter } from "./providers/meta-ads.js";
import { ShopifyAdapter } from "./providers/shopify.js";
import { WooCommerceAdapter } from "./providers/woocommerce.js";

export function createProviderAdapter(
  credential: ResolvedCredentialMaterial,
): IntegrationProviderAdapter {
  switch (credential.providerId) {
    case "woocommerce":
      return new WooCommerceAdapter(credential.material);
    case "shopify":
      return new ShopifyAdapter(credential.material);
    case "baselinker":
      return new BaseLinkerAdapter(credential.material.token);
    case "allegro":
      return new AllegroAdapter(credential.material);
    case "google_ads":
      return new GoogleAdsAdapter(credential.material);
    case "meta_ads":
      return new MetaAdsAdapter(credential.material);
    case "ga4":
      return new Ga4Adapter(credential.material);
  }

  throw new CredentialResolutionError("provider_not_supported");
}

export function createProviderCatalogRegistry(): ProviderRegistry {
  return new ProviderRegistry([
    new WooCommerceAdapter(null),
    new ShopifyAdapter(null),
    new BaseLinkerAdapter(null),
    new AllegroAdapter(null),
    new GoogleAdsAdapter(null),
    new MetaAdsAdapter(null),
    new Ga4Adapter(null),
  ]);
}
