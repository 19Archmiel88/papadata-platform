import { createProviderCatalogRegistry, ProviderRegistry } from "@papadata/integrations";

export function createProviderRegistry(): ProviderRegistry {
  return createProviderCatalogRegistry();
}
