import {
  mvpIntegrationCatalogProviderIds,
  type IntegrationProviderDescriptor,
  type MvpIntegrationCatalogProviderId,
} from "@papadata/contracts";
import type { IntegrationProviderAdapter } from "./provider-adapter.js";

const descriptors: readonly IntegrationProviderDescriptor[] = [
  {
    providerId: "woocommerce",
    displayName: "WooCommerce",
    category: "commerce",
    supportedStreams: ["orders", "products", "refunds", "inventory"],
    requiredScopes: ["read"],
    optionalScopes: ["write_webhooks"],
    supportsWebhooks: true,
  },
  {
    providerId: "shopify",
    displayName: "Shopify",
    category: "commerce",
    supportedStreams: ["orders", "products", "refunds", "inventory"],
    requiredScopes: ["read_orders", "read_products", "read_inventory"],
    optionalScopes: ["read_customers"],
    supportsWebhooks: true,
  },
  {
    providerId: "baselinker",
    displayName: "BaseLinker",
    category: "commerce",
    supportedStreams: ["orders", "products", "inventory"],
    requiredScopes: ["api"],
    optionalScopes: [],
    supportsWebhooks: false,
  },
  {
    providerId: "allegro",
    displayName: "Allegro",
    category: "commerce",
    supportedStreams: ["orders", "products", "refunds", "inventory"],
    requiredScopes: ["allegro:api:sale:orders:read"],
    optionalScopes: ["allegro:api:sale:offers:read"],
    supportsWebhooks: false,
  },
  {
    providerId: "google_ads",
    displayName: "Google Ads",
    category: "advertising",
    supportedStreams: ["ad_spend", "attributed_conversions"],
    requiredScopes: ["https://www.googleapis.com/auth/adwords"],
    optionalScopes: [],
    supportsWebhooks: false,
  },
  {
    providerId: "meta_ads",
    displayName: "Meta Ads",
    category: "advertising",
    supportedStreams: ["ad_spend", "attributed_conversions"],
    requiredScopes: ["ads_read"],
    optionalScopes: [],
    supportsWebhooks: true,
  },
  {
    providerId: "ga4",
    displayName: "Google Analytics 4",
    category: "analytics",
    supportedStreams: ["traffic", "events", "conversions"],
    requiredScopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    optionalScopes: [],
    supportsWebhooks: false,
  },
];

export class ProviderRegistry {
  private readonly adapters = new Map<
    MvpIntegrationCatalogProviderId,
    IntegrationProviderAdapter
  >();

  constructor(adapters: readonly IntegrationProviderAdapter[]) {
    for (const adapter of adapters) {
      this.adapters.set(adapter.providerId, adapter);
    }
  }

  listDescriptors(input: { readonly includeUnavailable?: boolean } = {}): readonly IntegrationProviderDescriptor[] {
    return input.includeUnavailable
      ? descriptors
      : descriptors.filter((descriptor) => this.adapters.has(descriptor.providerId));
  }

  listTargetDescriptors(): readonly IntegrationProviderDescriptor[] {
    return descriptors;
  }

  getAdapter(providerId: MvpIntegrationCatalogProviderId): IntegrationProviderAdapter {
    const adapter = this.adapters.get(providerId);
    if (!adapter) {
      throw new Error(`Provider adapter is not registered: ${providerId}`);
    }
    return adapter;
  }

  hasAdapter(providerId: MvpIntegrationCatalogProviderId): boolean {
    return this.adapters.has(providerId);
  }

  configuredProviderIds(): readonly MvpIntegrationCatalogProviderId[] {
    return mvpIntegrationCatalogProviderIds.filter((providerId: MvpIntegrationCatalogProviderId) =>
      this.adapters.get(providerId)?.isConfigured() === true,
    );
  }
}
