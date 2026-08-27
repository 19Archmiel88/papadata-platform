import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createIntegrationsRuntimeFallbackData,
  filterIntegrationCatalog,
  filterIntegrationSources,
  providerAvailabilityTone,
  resolveIntegrationRuntimeTab,
  sourceStatusTone,
} from './integrationsData.ts';

test('resolveIntegrationRuntimeTab keeps the canonical three-tab model with legacy aliases', () => {
  assert.equal(resolveIntegrationRuntimeTab('/app/integrations/sources'), 'sources');
  assert.equal(resolveIntegrationRuntimeTab('/app/integrations/katalog-integracji'), 'add');
  assert.equal(resolveIntegrationRuntimeTab('/app/integrations/stan-danych'), 'data-health');
});

test('filterIntegrationSources searches source name, provider and masked account id', () => {
  const runtime = createIntegrationsRuntimeFallbackData();

  assert.deepEqual(
    filterIntegrationSources(runtime.status.sources, {
      provider: 'all',
      query: '123...789',
      status: 'all',
    }).map((source) => source.integrationId),
    runtime.status.sources.map((source) => source.integrationId),
  );

  assert.deepEqual(
    filterIntegrationSources(runtime.status.sources, {
      provider: 'google_ads',
      query: '',
      status: 'action_required',
    }).map((source) => source.integrationId),
    ['src-google-ads'],
  );
});

test('source status tone preserves business presentation hierarchy', () => {
  assert.equal(sourceStatusTone('working'), 'success');
  assert.equal(sourceStatusTone('syncing'), 'processing');
  assert.equal(sourceStatusTone('action_required'), 'critical');
});

test('filterIntegrationCatalog uses backend connectability instead of frontend hardcoding', () => {
  const runtime = createIntegrationsRuntimeFallbackData();
  const available = filterIntegrationCatalog(runtime.catalog.providers, {
    category: 'available',
    query: '',
  });
  const shopify = runtime.catalog.providers.find((provider) => provider.provider === 'shopify');

  assert.ok(available.every((provider) => provider.connectable));
  assert.equal(shopify?.connectable, false);
  assert.equal(shopify ? providerAvailabilityTone(shopify) : null, 'warning');
});
