import assert from "node:assert/strict";
import test from "node:test";
import type {
  IntegrationProviderDescriptor,
} from "@papadata/contracts";
import {
  ProviderAdapterError,
  type IntegrationProviderAdapter,
  type ProviderFetchRequest,
  type ProviderFetchResult,
} from "@papadata/integrations";
import {
  buildIntegrationCatalog,
  buildIntegrationRuntimeStatus,
  testProviderCredential,
} from "./integration-runtime.js";

const descriptors: readonly IntegrationProviderDescriptor[] = [
  {
    category: "advertising",
    displayName: "Meta Ads",
    optionalScopes: [],
    providerId: "meta_ads",
    requiredScopes: ["ads_read"],
    supportedStreams: ["ad_spend", "attributed_conversions"],
    supportsWebhooks: true,
  },
  {
    category: "commerce",
    displayName: "Shopify",
    optionalScopes: [],
    providerId: "shopify",
    requiredScopes: ["read_orders"],
    supportedStreams: ["orders"],
    supportsWebhooks: true,
  },
  {
    category: "commerce",
    displayName: "BaseLinker",
    optionalScopes: [],
    providerId: "baselinker",
    requiredScopes: ["api"],
    supportedStreams: ["orders"],
    supportsWebhooks: false,
  },
];

test("runtime catalog gates connectability with backend readiness", () => {
  const catalog = buildIntegrationCatalog({
    connections: [],
    descriptors,
    hasAdapter: () => true,
  });

  assert.equal(
    catalog.find((provider) => provider.provider === "baselinker")?.connectable,
    true,
  );
  assert.equal(
    catalog.find((provider) => provider.provider === "shopify")?.connectable,
    false,
  );
  assert.equal(
    catalog.find((provider) => provider.provider === "shopify")?.availabilityLabel,
    "Pilot",
  );
});

test("runtime source treats rate limit as data fetching, not provider failure", () => {
  const status = buildIntegrationRuntimeStatus({
    checkpoints: [
      {
        connection_id: "connection-a",
        provider_id: "meta_ads",
        stream: "ad_spend",
        watermark: "2026-08-26T09:00:00.000Z",
      },
    ],
    connections: [
      {
        account_name: "Meta Ads EU",
        created_at: "2026-08-01T10:00:00.000Z",
        external_account_id: "act_123456789",
        id: "connection-a",
        provider_id: "meta_ads",
        status: "active",
        updated_at: "2026-08-26T09:02:00.000Z",
      },
    ],
    coverageRows: [
      {
        connection_id: "connection-a",
        day: "2026-08-26",
        latest_ingested_at: "2026-08-26T09:02:00.000Z",
        provider_id: "meta_ads",
        record_count: 24,
        stream: "ad_spend",
      },
    ],
    descriptors,
    hasAdapter: () => true,
    issues: [],
    jobs: [
      {
        connection_id: "connection-a",
        created_at: "2026-08-26T09:01:00.000Z",
        id: "job-a",
        job_kind: "incremental_sync",
        provider_id: "meta_ads",
        status: "rate_limited",
        updated_at: "2026-08-26T09:02:00.000Z",
      },
    ],
    now: new Date("2026-08-26T10:00:00.000Z"),
    reconciliationRows: [],
  });

  const source = status.sources[0];
  assert.equal(source?.lifecycleStatus, "RATE_LIMITED");
  assert.equal(source?.businessStatus, "syncing");
  assert.equal(source?.businessStatusLabel, "Pobieranie danych");
  assert.equal(source?.freshness.watermark, "2026-08-26T09:00:00.000Z");
});

test("provider test failure never unlocks production save", async () => {
  const fakeAdapter: IntegrationProviderAdapter = {
    optionalScopes: [],
    providerId: "baselinker",
    requiredScopes: ["api"],
    async fetch(_request: ProviderFetchRequest): Promise<ProviderFetchResult> {
      return {
        limitations: [],
        nextCheckpoint: null,
        partial: false,
        records: [],
      };
    },
    isConfigured() {
      return true;
    },
    async verifyConnection() {
      throw new ProviderAdapterError("secret provider body", "authentication");
    },
  };

  const result = await testProviderCredential(
    "baselinker",
    { token: "1234567890" },
    () => fakeAdapter,
  );

  assert.equal(result.formValidation.status, "passed");
  assert.equal(result.providerTest.status, "failed");
  assert.equal(result.canSave, false);
  assert.doesNotMatch(result.providerTest.message, /secret provider body/u);
});

test("provider test does not call adapter when form validation fails", async () => {
  let adapterCalled = false;

  const result = await testProviderCredential(
    "woocommerce",
    {
      consumerKey: "",
      consumerSecret: "",
      storeUrl: "ftp://invalid.example",
    },
    () => {
      adapterCalled = true;
      throw new Error("adapter should not be called");
    },
  );

  assert.equal(adapterCalled, false);
  assert.equal(result.formValidation.status, "failed");
  assert.equal(result.providerTest.status, "not_run");
  assert.equal(result.canSave, false);
});
