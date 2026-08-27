import {
  useEffect,
  useState,
} from 'react';

import {
  InlineNotice,
} from '../design-system';
import {
  bffClient,
  isLocalClientRuntimeAvailable,
} from '../shared/api/bffClient';
import {
  IntegrationsWorkspace,
} from './integrations';
import {
  createIntegrationsRuntimeFallbackData,
} from './integrations/integrationsData';
import type {
  IntegrationCatalogRuntime,
  IntegrationCompletenessRuntime,
  IntegrationProviderTestResult,
  IntegrationRuntimeCatalogProvider,
  IntegrationRuntimeSource,
  IntegrationRuntimeStatus,
  IntegrationsRuntimeView,
} from './integrations/integrationsData';

type PartialFailure = {
  readonly id: 'catalog' | 'logs' | 'completeness';
  readonly title: string;
  readonly message: string;
};

type RuntimeState = {
  readonly data: IntegrationsRuntimeView | null;
  readonly loading: boolean;
  readonly partialFailures: readonly PartialFailure[];
  readonly problem: string | null;
};

export type IntegrationsScreenProps = {
  readonly path?: string;
};

export function IntegrationsScreen({
  path = '/app/integrations/sources',
}: IntegrationsScreenProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState<RuntimeState>({
    data: null,
    loading: true,
    partialFailures: [],
    problem: null,
  });

  useEffect(() => {
    let active = true;
    setState((previous) => ({
      ...previous,
      loading: true,
      partialFailures: [],
      problem: null,
    }));

    Promise.allSettled([
      bffClient.readIntegrationsStatus<IntegrationRuntimeStatus>(),
      bffClient.readIntegrationsCatalog<IntegrationCatalogRuntime>(),
      bffClient.readIntegrationsLogs<{ readonly generatedAt: string; readonly logs: readonly unknown[] }>(),
      bffClient.readIntegrationsCompleteness<IntegrationCompletenessRuntime>(),
    ]).then((results) => {
      if (!active) return;

      setState((previous) => composeRuntimeState(results, previous.data));
    });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  if (
    path !== '/app/integrations'
    && !path.startsWith('/app/integrations/')
  ) {
    return (
      <InlineNotice
        message="Routing wskazuje ekran spoza sekcji Integracje."
        title="Nieobsługiwany ekran"
        tone="critical"
      />
    );
  }

  return (
    <IntegrationsWorkspace
      loading={state.loading}
      onCreateConnection={async (provider, input) => {
        await bffClient.createIntegrationConnection({
          credentialReference: input.credentialReference,
          providerId: provider.providerId,
          requestedScopes: input.requestedScopes,
        });
        setRefreshKey((current) => current + 1);
      }}
      onDisconnectConnection={async (source) => {
        await bffClient.disconnectIntegrationConnection(source.integrationId);
        setRefreshKey((current) => current + 1);
      }}
      onProviderTest={async (provider, input) => {
        const result = await bffClient.testIntegrationProvider(provider.providerId, input);
        if (!isIntegrationProviderTestResult(result)) {
          throw new Error('Backend zwrócił nieobsługiwany wynik testu providera.');
        }
        return result;
      }}
      onReload={() => setRefreshKey((current) => current + 1)}
      onSourceCommand={async (source, actionId) => {
        if (actionId === 'sync' || actionId === 'fix') {
          await bffClient.startIntegrationSync({
            connectionId: source.integrationId,
            providerId: source.provider,
            streams: sourceSupportedStreams(source),
          });
          setRefreshKey((current) => current + 1);
          return;
        }
        if (actionId === 'backfill') {
          await bffClient.startIntegrationBackfill({
            connectionId: source.integrationId,
            providerId: source.provider,
            streams: sourceSupportedStreams(source),
          });
          setRefreshKey((current) => current + 1);
          return;
        }
        if (actionId === 'plan') {
          window.history.pushState(null, '', '/app/billing');
          window.dispatchEvent(new PopStateEvent('popstate'));
          return;
        }
        if (actionId === 'reauth') {
          throw new Error('Źródło wymaga flow ponownej autoryzacji providera. Backend nie może oznaczyć tego jako naprawione bez realnego OAuth.');
        }
      }}
      partialFailures={state.partialFailures}
      path={path}
      problem={state.problem}
      runtime={state.data}
    />
  );
}

function composeRuntimeState(
  results: readonly PromiseSettledResult<unknown>[],
  previous: IntegrationsRuntimeView | null,
): RuntimeState {
  const status = fulfilledValue<IntegrationRuntimeStatus>(results[0], isIntegrationRuntimeStatus)
    ?? previous?.status
    ?? null;
  const partialFailures: PartialFailure[] = [];

  if (!status) {
    if (isLocalClientRuntimeAvailable()) {
      return {
        data: createIntegrationsRuntimeFallbackData(),
        loading: false,
        partialFailures: [
          {
            id: 'catalog',
            message: 'BFF nie zwrócił statusu Integracji, więc użyto lokalnych danych demonstracyjnych.',
            title: 'Runtime niedostępny lokalnie',
          },
        ],
        problem: null,
      };
    }

    return {
      data: null,
      loading: false,
      partialFailures: [],
      problem: rejectedMessage(results[0]) ?? 'Nie udało się pobrać statusu Integracji.',
    };
  }

  const catalog = fulfilledValue<IntegrationCatalogRuntime>(results[1], isIntegrationCatalogRuntime)
    ?? previous?.catalog
    ?? {
      generatedAt: status.generatedAt,
      providers: [],
    };
  if (!isFulfilled(results[1])) {
    partialFailures.push({
      id: 'catalog',
      message: rejectedMessage(results[1]) ?? 'Nie udało się pobrać katalogu providerów.',
      title: 'Nie udało się pobrać katalogu',
    });
  }

  const logs = fulfilledValue<{ readonly generatedAt: string; readonly logs: readonly unknown[] }>(
    results[2],
    isIntegrationLogsPayload,
  );
  if (!isFulfilled(results[2])) {
    partialFailures.push({
      id: 'logs',
      message: rejectedMessage(results[2]) ?? 'Nie udało się pobrać historii synchronizacji.',
      title: 'Nie udało się pobrać historii synchronizacji',
    });
  }

  const completeness = fulfilledValue<IntegrationCompletenessRuntime>(results[3], isIntegrationCompletenessRuntime)
    ?? previous?.completeness
    ?? deriveCompletenessFromStatus(status);
  if (!isFulfilled(results[3])) {
    partialFailures.push({
      id: 'completeness',
      message: rejectedMessage(results[3]) ?? 'Nie udało się pobrać kompletności danych.',
      title: 'Nie udało się pobrać kompletności',
    });
  }

  return {
    data: {
      catalog,
      completeness,
      demo: false,
      logs: {
        generatedAt: logs?.generatedAt ?? previous?.logs.generatedAt ?? status.generatedAt,
        logs: logs?.logs.filter(isIntegrationRuntimeLog) ?? previous?.logs.logs ?? [],
      },
      status,
    },
    loading: false,
    partialFailures,
    problem: null,
  };
}

function sourceSupportedStreams(
  source: IntegrationRuntimeSource,
): readonly string[] {
  switch (source.provider) {
    case 'google_ads':
    case 'meta_ads':
      return ['ad_spend', 'attributed_conversions'];
    case 'ga4':
      return ['traffic', 'events', 'conversions'];
    case 'woocommerce':
    case 'shopify':
    case 'allegro':
      return ['orders', 'products', 'refunds', 'inventory'];
    case 'baselinker':
      return ['orders', 'products', 'inventory'];
  }
}

function deriveCompletenessFromStatus(
  status: IntegrationRuntimeStatus,
): IntegrationCompletenessRuntime {
  return {
    blockers: status.alerts
      .filter((alert) => alert.tone === 'critical')
      .map((alert) => ({
        blockedKpis: [],
        id: alert.id,
        message: alert.message,
        title: alert.title,
      })),
    domains: [],
    generatedAt: status.generatedAt,
    global: {
      description: status.summary.healthDescription,
      percentage: status.summary.completenessPercentage,
      title: status.summary.healthTitle,
    },
    sources: status.sources.map((source) => ({
      businessStatus: source.businessStatus,
      completeness: source.completeness,
      displayName: source.displayName,
      freshness: source.freshness,
      impact: source.impact,
      integrationId: source.integrationId,
      provider: source.provider,
      providerDisplayName: source.providerDisplayName,
    })),
  };
}

function fulfilledValue<TValue>(
  result: PromiseSettledResult<unknown> | undefined,
  guard: (value: unknown) => value is TValue,
): TValue | null {
  if (!result || result.status !== 'fulfilled') return null;
  return guard(result.value) ? result.value : null;
}

function isFulfilled(
  result: PromiseSettledResult<unknown> | undefined,
): result is PromiseFulfilledResult<unknown> {
  return result?.status === 'fulfilled';
}

function rejectedMessage(
  result: PromiseSettledResult<unknown> | undefined,
): string | null {
  if (!result || result.status !== 'rejected') return null;
  return result.reason instanceof Error ? result.reason.message : null;
}

function isIntegrationRuntimeStatus(value: unknown): value is IntegrationRuntimeStatus {
  if (!isRecord(value)) return false;
  return value.runtime === 'current'
    && isRecord(value.summary)
    && isRecord(value.plan)
    && Array.isArray(value.sources)
    && Array.isArray(value.alerts);
}

function isIntegrationCatalogRuntime(value: unknown): value is IntegrationCatalogRuntime {
  return isRecord(value)
    && typeof value.generatedAt === 'string'
    && Array.isArray(value.providers);
}

function isIntegrationLogsPayload(
  value: unknown,
): value is { readonly generatedAt: string; readonly logs: readonly unknown[] } {
  return isRecord(value)
    && typeof value.generatedAt === 'string'
    && Array.isArray(value.logs);
}

function isIntegrationCompletenessRuntime(value: unknown): value is IntegrationCompletenessRuntime {
  return isRecord(value)
    && typeof value.generatedAt === 'string'
    && isRecord(value.global)
    && Array.isArray(value.sources)
    && Array.isArray(value.blockers)
    && Array.isArray(value.domains);
}

function isIntegrationRuntimeLog(value: unknown): value is IntegrationsRuntimeView['logs']['logs'][number] {
  return isRecord(value)
    && typeof value.jobId === 'string'
    && typeof value.integrationId === 'string'
    && typeof value.providerDisplayName === 'string'
    && typeof value.statusLabel === 'string';
}

function isIntegrationProviderTestResult(value: unknown): value is IntegrationProviderTestResult {
  return isRecord(value)
    && typeof value.provider === 'string'
    && isRecord(value.formValidation)
    && isRecord(value.providerTest)
    && typeof value.canSave === 'boolean';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
