import type { IntegrationProviderAdapter } from "./provider-adapter.js";
import { ProviderRegistry } from "./provider-registry.js";
import type { ResolvedCredentialMaterial } from "./credentials.js";
import { CredentialResolutionError } from "./credentials.js";
import { FetchProviderHttpClient } from "./http.js";
import { AllegroAdapter } from "./providers/allegro.js";
import { BaseLinkerAdapter } from "./providers/baselinker.js";
import { Ga4Adapter } from "./providers/ga4.js";
import { GoogleAdsAdapter } from "./providers/google-ads.js";
import { MetaAdsAdapter } from "./providers/meta-ads.js";
import { ShopifyAdapter } from "./providers/shopify.js";
import { WooCommerceAdapter } from "./providers/woocommerce.js";

export type ProviderRateLimit = {
  readonly maxRequests: number;
  readonly windowMs: number;
};

/**
 * Binds a proactive rate-limit gate to one (provider, credential) pair.
 * `key` scopes the gate per real account/credential, not just per provider
 * -- e.g. two different connected Google Ads accounts must not share one
 * budget. The returned function is passed straight into
 * FetchProviderHttpClient's `acquireSlot` and is called before every HTTP
 * attempt that adapter's http client makes, including retries.
 *
 * No implementation lives in this package on purpose (kept infra-agnostic,
 * same reasoning as ProviderHttpClient's injectable fetch/delay) -- the real
 * Redis-backed implementation is apps/worker's RedisProviderRateLimiter.
 */
export type ProviderRateLimiterFactory = (
  key: string,
  limit: ProviderRateLimit,
) => () => Promise<void>;

/**
 * Conservative starting budgets per provider, deliberately not tuned against
 * each provider's exact published quota (those vary by API tier/region and
 * change over time) -- the goal here is a real per-account gate existing at
 * all, not a precisely calibrated one. Override per-provider via the env
 * vars RATE_LIMIT_<PROVIDER>_MAX_REQUESTS / RATE_LIMIT_<PROVIDER>_WINDOW_MS
 * (read by apps/worker's RedisProviderRateLimiter caller) once real
 * production traffic shows where these need adjusting.
 */
export const defaultProviderRateLimits: Readonly<
  Record<ResolvedCredentialMaterial["providerId"], ProviderRateLimit>
> = {
  allegro: { maxRequests: 9, windowMs: 1_000 },
  baselinker: { maxRequests: 100, windowMs: 60_000 },
  ga4: { maxRequests: 10, windowMs: 1_000 },
  google_ads: { maxRequests: 15, windowMs: 1_000 },
  meta_ads: { maxRequests: 180, windowMs: 3_600_000 },
  shopify: { maxRequests: 2, windowMs: 1_000 },
  woocommerce: { maxRequests: 10, windowMs: 1_000 },
};

export function createProviderAdapter(
  credential: ResolvedCredentialMaterial,
  rateLimiterFactory?: ProviderRateLimiterFactory,
): IntegrationProviderAdapter {
  const http = new FetchProviderHttpClient(
    fetch,
    undefined,
    rateLimiterFactory
      ? rateLimiterFactory(
          `${credential.providerId}:${credential.credentialReference}`,
          defaultProviderRateLimits[credential.providerId],
        )
      : undefined,
  );

  switch (credential.providerId) {
    case "woocommerce":
      return new WooCommerceAdapter(credential.material, http);
    case "shopify":
      return new ShopifyAdapter(credential.material, http);
    case "baselinker":
      return new BaseLinkerAdapter(credential.material.token, http);
    case "allegro":
      return new AllegroAdapter(credential.material, http);
    case "google_ads":
      return new GoogleAdsAdapter(credential.material, http);
    case "meta_ads":
      return new MetaAdsAdapter(credential.material, http);
    case "ga4":
      return new Ga4Adapter(credential.material, http);
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
