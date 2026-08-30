import type {
  ChangeEvent,
  FormEvent,
  ReactNode,
} from 'react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  navigate,
} from '../../app/routing/navigation';
import {
  createIntegrationsRuntimeFallbackData,
  filterIntegrationCatalog,
  filterIntegrationSources,
  formatDuration,
  formatIntegrationDateTime,
  formatNumber,
  resolveIntegrationRuntimeTab,
} from './integrationsData';
import type {
  IntegrationCatalogFilters,
  IntegrationCompletenessRuntime,
  IntegrationProviderId,
  IntegrationProviderTestResult,
  IntegrationRuntimeCatalogProvider,
  IntegrationRuntimeLog,
  IntegrationRuntimeSource,
  IntegrationRuntimeTabId,
  IntegrationScreenDefinition,
  IntegrationsData,
  IntegrationsRuntimeView,
  IntegrationSourceFilters,
  RuntimeSourceBusinessStatus,
} from './integrationsData';
import './integrations-workspace.css';

type PartialFailure = {
  readonly id: 'catalog' | 'logs' | 'completeness';
  readonly title: string;
  readonly message: string;
};

export type IntegrationsWorkspaceProps = {
  readonly data?: IntegrationsData | null;
  readonly definition?: IntegrationScreenDefinition | null;
  readonly loading?: boolean;
  readonly mode?: 'runtime' | 'storybook';
  readonly onCreateConnection?: (
    provider: IntegrationRuntimeCatalogProvider,
    input: {
      readonly credentialReference: string;
      readonly requestedScopes: readonly string[];
    },
  ) => Promise<void>;
  readonly onDisconnectConnection?: (
    source: IntegrationRuntimeSource,
  ) => Promise<void>;
  readonly onProviderTest?: (
    provider: IntegrationRuntimeCatalogProvider,
    input: Readonly<Record<string, unknown>>,
  ) => Promise<IntegrationProviderTestResult>;
  readonly onReload?: () => void;
  readonly onSourceCommand?: (
    source: IntegrationRuntimeSource,
    actionId: IntegrationRuntimeSource['primaryAction']['id'],
  ) => Promise<void>;
  readonly partialFailures?: readonly PartialFailure[];
  readonly path?: string;
  readonly problem?: string | null;
  readonly runtime?: IntegrationsRuntimeView | null;
};

type OperationNotice = {
  readonly tone: 'critical' | 'info' | 'success' | 'warning';
  readonly title: string;
  readonly message: string;
} | null;

type Toast = {
  readonly id: string;
  readonly message: string;
  readonly tone: 'error' | 'info' | 'success';
};

const sourceStatusFilters: readonly {
  readonly id: 'all' | RuntimeSourceBusinessStatus;
  readonly label: string;
}[] = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'working', label: 'Działające' },
  { id: 'syncing', label: 'Pobieranie' },
  { id: 'action_required', label: 'Wymaga działania' },
];

const catalogFilterOptions: readonly {
  readonly id: IntegrationCatalogFilters['category'];
  readonly label: string;
}[] = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'commerce', label: 'Sprzedaż i E-commerce' },
  { id: 'advertising', label: 'Reklamy & PPC' },
  { id: 'analytics', label: 'Analityka i Marketing' },
  { id: 'available', label: 'Dostępne' },
];

const recommendedFlow = [
  {
    detail: 'WooCommerce, BaseLinker',
    status: 'Podłączone (100%)',
    tone: 'success',
    title: '1. Sklep / Zamówienia',
  },
  {
    detail: 'Google Analytics 4',
    status: 'Backfill w toku',
    tone: 'processing',
    title: '2. Analityka Ruchu',
  },
  {
    detail: 'Google Ads',
    status: 'Wymaga ponownego łączenia',
    tone: 'warning',
    title: '3. Reklamy PPC',
  },
  {
    detail: 'Meta Ads, CSV Import',
    status: 'Podłączone',
    tone: 'success',
    title: '4. Social Ads & Koszty',
  },
] as const;

export function IntegrationsWorkspace({
  data,
  definition,
  loading = false,
  mode = 'runtime',
  onCreateConnection,
  onDisconnectConnection,
  onProviderTest,
  onReload,
  onSourceCommand,
  partialFailures = [],
  path = '/app/integrations/sources',
  problem = null,
  runtime,
}: IntegrationsWorkspaceProps) {
  const resolvedRuntime = useMemo(
    () => (
      runtime
        ? runtime
        : data
          ? createIntegrationsRuntimeFallbackData(data.generatedAt)
          : null
    ),
    [data, runtime],
  );
  const activeTab = resolveIntegrationRuntimeTab(path);
  const [sourceFilters, setSourceFilters] = useState<IntegrationSourceFilters>({
    provider: 'all',
    query: '',
    status: 'all',
  });
  const [catalogFilters, setCatalogFilters] = useState<IntegrationCatalogFilters>({
    category: 'all',
    query: '',
  });
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [connectProviderId, setConnectProviderId] = useState<IntegrationProviderId | null>(null);
  const [disconnectSource, setDisconnectSource] = useState<IntegrationRuntimeSource | null>(null);
  const [readinessOpen, setReadinessOpen] = useState(false);
  const [sseOpen, setSseOpen] = useState(false);
  const [sseProgress, setSseProgress] = useState(42);
  const [operationNotice, setOperationNotice] = useState<OperationNotice>(null);
  const [toasts, setToasts] = useState<readonly Toast[]>([]);

  const showToast = (message: string, tone: Toast['tone'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((items) => [...items, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3500);
  };

  if (!resolvedRuntime && loading) {
    return <IntegrationsPrototypeSkeleton />;
  }

  if (!resolvedRuntime) {
    return (
      <div className="pd-integrations-id8" data-mode={mode}>
        <PrototypeHeader
          loading={loading}
          onReload={onReload}
          onSseOpen={() => setSseOpen(true)}
          planLabel="0 / 0 źródeł"
        />
        <main className="pd-id8-main">
          <section className="pd-id8-notice" data-tone="critical">
            <strong>Integracje nie są dostępne</strong>
            <span>{problem ?? 'Nie udało się pobrać runtime Integracji.'}</span>
            {onReload ? (
              <button onClick={onReload} type="button">Spróbuj ponownie</button>
            ) : null}
          </section>
        </main>
      </div>
    );
  }

  const filteredSources = filterIntegrationSources(
    resolvedRuntime.status.sources,
    sourceFilters,
  );
  const filteredProviders = filterIntegrationCatalog(
    resolvedRuntime.catalog.providers,
    catalogFilters,
  );
  const selectedSource = selectedSourceId
    ? resolvedRuntime.status.sources.find((source) => source.integrationId === selectedSourceId) ?? null
    : null;
  const connectProvider = connectProviderId
    ? resolvedRuntime.catalog.providers.find((provider) => provider.provider === connectProviderId) ?? null
    : null;
  const actionRequired = resolvedRuntime.status.summary.actionRequired;
  const healthTone = actionRequired > 0
    ? 'warning'
    : resolvedRuntime.status.summary.syncingSources > 0
      ? 'processing'
      : 'success';

  async function executeSourceCommand(
    source: IntegrationRuntimeSource,
    actionId: IntegrationRuntimeSource['primaryAction']['id'],
  ) {
    if (actionId === 'details') {
      setSelectedSourceId(source.integrationId);
      return;
    }
    try {
      await onSourceCommand?.(source, actionId);
      showToast(`${source.providerDisplayName}: operacja została przekazana do runtime.`, 'success');
    } catch (cause) {
      setOperationNotice({
        message: cause instanceof Error ? cause.message : 'Nie udało się wykonać operacji.',
        title: 'Operacja nie powiodła się',
        tone: 'critical',
      });
      showToast('Operacja nie powiodła się.', 'error');
    }
  }

  return (
    <div
      className="pd-integrations-id8"
      data-demo={resolvedRuntime.demo ? true : undefined}
      data-mode={mode}
      data-screen-id={definition?.id ?? 'ID-8'}
      data-tab={activeTab}
    >
      <ToastStack toasts={toasts} />
      <PrototypeHeader
        loading={loading}
        onReload={() => {
          showToast('Odświeżanie stanu integracji...');
          onReload?.();
        }}
        onSseOpen={() => setSseOpen(true)}
        planLabel={`${resolvedRuntime.status.plan.dataSourcesUsed} / ${resolvedRuntime.status.plan.dataSourcesLimit} źródeł`}
      />

      <GlobalHealthBar
        onFix={() => {
          navigate('/app/integrations/sources');
          setSourceFilters((filters) => ({ ...filters, status: 'action_required' }));
        }}
        runtime={resolvedRuntime}
        tone={healthTone}
      />

      <main className="pd-id8-main">
        <section className="pd-id8-title-row">
          <div>
            <h1>Integracje i Jakość Danych</h1>
            <p>Zarządzaj połączeniami, monitoruj kompletność i sprawdzaj gotowość danych dla analiz oraz Papa Asystenta.</p>
          </div>
        </section>

        <KpiDashboard runtime={resolvedRuntime} />

        {resolvedRuntime.demo ? (
          <section className="pd-id8-notice" data-tone="info">
            <strong>Tryb demonstracyjny</strong>
            <span>Pokazujemy lokalne dane demonstracyjne, ponieważ runtime BFF nie zwrócił pełnego snapshotu. W produkcji ten fallback jest wyłączony.</span>
          </section>
        ) : null}

        {problem ? (
          <section className="pd-id8-notice" data-tone="warning">
            <strong>Część danych Integracji wymaga odświeżenia</strong>
            <span>{problem}</span>
            {onReload ? (
              <button onClick={onReload} type="button">Spróbuj ponownie</button>
            ) : null}
          </section>
        ) : null}

        {partialFailures.length > 0 ? (
          <div className="pd-id8-notice-stack">
            {partialFailures.map((failure) => (
              <section className="pd-id8-notice" data-tone="warning" key={failure.id}>
                <strong>{failure.title}</strong>
                <span>{failure.message}</span>
                {onReload ? (
                  <button onClick={onReload} type="button">Spróbuj ponownie</button>
                ) : null}
              </section>
            ))}
          </div>
        ) : null}

        {operationNotice ? (
          <section className="pd-id8-notice" data-tone={operationNotice.tone}>
            <strong>{operationNotice.title}</strong>
            <span>{operationNotice.message}</span>
            <button onClick={() => setOperationNotice(null)} type="button">Zamknij</button>
          </section>
        ) : null}

        <RuntimeTabs
          activeTab={activeTab}
          catalogFilters={catalogFilters}
          completeness={resolvedRuntime.completeness}
          filteredProviders={filteredProviders}
          filteredSources={filteredSources}
          logs={resolvedRuntime.logs.logs}
          onCatalogFiltersChange={setCatalogFilters}
          onConnect={(provider) => setConnectProviderId(provider.provider)}
          onDisconnect={setDisconnectSource}
          onOpenDetails={setSelectedSourceId}
          onReadinessOpen={() => setReadinessOpen(true)}
          onSourceCommand={executeSourceCommand}
          onSourceFiltersChange={setSourceFilters}
          sourceFilters={sourceFilters}
          sources={resolvedRuntime.status.sources}
        />
      </main>

      <PrototypeFooter />

      <SourceInspector
        onClose={() => setSelectedSourceId(null)}
        onDisconnect={setDisconnectSource}
        onSourceCommand={executeSourceCommand}
        source={selectedSource}
      />

      <ConnectModal
        onClose={() => setConnectProviderId(null)}
        onCreateConnection={onCreateConnection}
        onProviderTest={onProviderTest}
        onSaved={() => {
          setConnectProviderId(null);
          showToast('Połączenie zapisane. Uruchamianie pierwszego backfillu...', 'success');
          navigate('/app/integrations/sources');
        }}
        provider={connectProvider}
        setOperationNotice={setOperationNotice}
        showToast={showToast}
      />

      <SseConsole
        onClose={() => setSseOpen(false)}
        open={sseOpen}
        progress={sseProgress}
        setProgress={setSseProgress}
        showToast={showToast}
      />

      <ReadinessModal
        onClose={() => setReadinessOpen(false)}
        open={readinessOpen}
      />

      <DisconnectModal
        onClose={() => setDisconnectSource(null)}
        onConfirm={async (source) => {
          try {
            await onDisconnectConnection?.(source);
            showToast('Źródło zostało wyrejestrowane.', 'success');
          } catch (cause) {
            setOperationNotice({
              message: cause instanceof Error ? cause.message : 'Nie udało się rozłączyć źródła.',
              title: 'Rozłączenie nie powiodło się',
              tone: 'critical',
            });
            showToast('Rozłączenie nie powiodło się.', 'error');
          } finally {
            setDisconnectSource(null);
          }
        }}
        source={disconnectSource}
      />
    </div>
  );
}

function PrototypeHeader({
  loading,
  onReload,
  onSseOpen,
  planLabel,
}: {
  readonly loading: boolean;
  readonly onReload?: () => void;
  readonly onSseOpen: () => void;
  readonly planLabel: string;
}) {
  return (
    <header className="pd-id8-topbar">
      <div className="pd-id8-topbar__inner">
        <div className="pd-id8-topbar__actions">
          <button className="pd-id8-sse-button" onClick={onSseOpen} type="button">
            <span />
            Konsola SSE Stream
          </button>
          <div className="pd-id8-plan-chip">
            <span>Limit planu:</span>
            <strong>{planLabel}</strong>
            <i aria-hidden="true"><b /></i>
          </div>
          <button className="pd-id8-refresh" disabled={loading} onClick={onReload} type="button">
            <span aria-hidden="true">↻</span>
            {loading ? 'Odświeżanie' : 'Odśwież status'}
          </button>
        </div>
      </div>
    </header>
  );
}

function GlobalHealthBar({
  onFix,
  runtime,
  tone,
}: {
  readonly onFix: () => void;
  readonly runtime: IntegrationsRuntimeView;
  readonly tone: 'processing' | 'success' | 'warning';
}) {
  const actionRequired = runtime.status.summary.actionRequired;
  const prefix = actionRequired > 0
    ? `${actionRequired} źródło wymaga akcji:`
    : runtime.status.summary.syncingSources > 0
      ? 'Pobieranie danych:'
      : 'Dane gotowe do analizy:';

  return (
    <section className="pd-id8-health-bar" data-tone={tone}>
      <div className="pd-id8-health-bar__inner">
        <div>
          <span className="pd-id8-dot" />
          <strong>{prefix}</strong>
          <span>{runtime.status.summary.healthDescription}</span>
        </div>
        {actionRequired > 0 ? (
          <button onClick={onFix} type="button">Napraw problem</button>
        ) : null}
      </div>
    </section>
  );
}

function KpiDashboard({
  runtime,
}: {
  readonly runtime: IntegrationsRuntimeView;
}) {
  const confidence = Math.max(0, Math.min(100, Math.round(
    (runtime.status.summary.completenessPercentage * 0.72)
    + (averageDomainReadiness(runtime.completeness) * 0.28),
  )));
  const syncing = runtime.status.summary.syncingSources
    + runtime.status.summary.runningBackfills
    + runtime.status.summary.queuedBackfills;

  return (
    <dl className="pd-id8-kpis">
      <div>
        <dt>Aktywne źródła</dt>
        <dd>
          {runtime.status.summary.activeSources}
          {' '}
          <span>/ {runtime.status.plan.dataSourcesLimit} limit</span>
        </dd>
        <p>Poprawnie zamapowane</p>
      </div>
      <div data-tone="warning">
        <dt>Wymagają działania</dt>
        <dd>
          {runtime.status.summary.actionRequired}
          {' '}
          <span>źródło</span>
        </dd>
        <p>{runtime.status.alerts[0]?.title ?? 'Brak blokad operacyjnych'}</p>
      </div>
      <div>
        <dt>Globalna kompletność</dt>
        <dd>{runtime.status.summary.completenessPercentage}%</dd>
        <p>Średnia waży domeny</p>
      </div>
      <div>
        <dt>Zadania synchronizacji</dt>
        <dd>
          {syncing}
          {' '}
          <span>W toku</span>
        </dd>
        <p>{runtime.status.summary.runningBackfills} backfill w toku</p>
      </div>
      <div>
        <dt>Papa Asystent Confidence</dt>
        <dd>
          {confidence}
          %
          {' '}
          <span>Pewności</span>
        </dd>
        <p>{runtime.completeness.blockers[0]?.blockedKpis[0] ?? 'Kontekst danych dostępny'}</p>
      </div>
    </dl>
  );
}

function RuntimeTabs({
  activeTab,
  catalogFilters,
  completeness,
  filteredProviders,
  filteredSources,
  logs,
  onCatalogFiltersChange,
  onConnect,
  onDisconnect,
  onOpenDetails,
  onReadinessOpen,
  onSourceCommand,
  onSourceFiltersChange,
  sourceFilters,
  sources,
}: {
  readonly activeTab: IntegrationRuntimeTabId;
  readonly catalogFilters: IntegrationCatalogFilters;
  readonly completeness: IntegrationCompletenessRuntime;
  readonly filteredProviders: readonly IntegrationRuntimeCatalogProvider[];
  readonly filteredSources: readonly IntegrationRuntimeSource[];
  readonly logs: readonly IntegrationRuntimeLog[];
  readonly onCatalogFiltersChange: (filters: IntegrationCatalogFilters) => void;
  readonly onConnect: (provider: IntegrationRuntimeCatalogProvider) => void;
  readonly onDisconnect: (source: IntegrationRuntimeSource) => void;
  readonly onOpenDetails: (sourceId: string) => void;
  readonly onReadinessOpen: () => void;
  readonly onSourceCommand: (
    source: IntegrationRuntimeSource,
    actionId: IntegrationRuntimeSource['primaryAction']['id'],
  ) => Promise<void>;
  readonly onSourceFiltersChange: (filters: IntegrationSourceFilters) => void;
  readonly sourceFilters: IntegrationSourceFilters;
  readonly sources: readonly IntegrationRuntimeSource[];
}) {
  return (
    <section className="pd-id8-runtime">
      <nav aria-label="Tabs" className="pd-id8-tabs">
        <TabLink active={activeTab === 'sources'} href="/app/integrations/sources">
          <span>Źródła danych</span>
          <em>{sources.length}</em>
        </TabLink>
        <TabLink active={activeTab === 'add'} href="/app/integrations/add">
          <span>Dodaj źródło</span>
          <em>Katalog</em>
        </TabLink>
        <TabLink active={activeTab === 'data-health'} href="/app/integrations/data-health">
          <span>Stan danych & Diagnostyka</span>
          <em>Ready</em>
        </TabLink>
      </nav>

      {activeTab === 'sources' ? (
        <SourcesView
          filteredSources={filteredSources}
          filters={sourceFilters}
          onDisconnect={onDisconnect}
          onFiltersChange={onSourceFiltersChange}
          onOpenDetails={onOpenDetails}
          onSourceCommand={onSourceCommand}
          sources={sources}
        />
      ) : null}

      {activeTab === 'add' ? (
        <CatalogView
          filteredProviders={filteredProviders}
          filters={catalogFilters}
          onConnect={onConnect}
          onFiltersChange={onCatalogFiltersChange}
        />
      ) : null}

      {activeTab === 'data-health' ? (
        <HealthView
          completeness={completeness}
          logs={logs}
          onReadinessOpen={onReadinessOpen}
        />
      ) : null}
    </section>
  );
}

function TabLink({
  active,
  children,
  href,
}: {
  readonly active: boolean;
  readonly children: ReactNode;
  readonly href: `/app/integrations/${string}`;
}) {
  return (
    <a
      aria-current={active ? 'page' : undefined}
      data-active={active ? true : undefined}
      href={href}
      onClick={(event) => {
        event.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

function SourcesView({
  filteredSources,
  filters,
  onDisconnect,
  onFiltersChange,
  onOpenDetails,
  onSourceCommand,
  sources,
}: {
  readonly filteredSources: readonly IntegrationRuntimeSource[];
  readonly filters: IntegrationSourceFilters;
  readonly onDisconnect: (source: IntegrationRuntimeSource) => void;
  readonly onFiltersChange: (filters: IntegrationSourceFilters) => void;
  readonly onOpenDetails: (sourceId: string) => void;
  readonly onSourceCommand: (
    source: IntegrationRuntimeSource,
    actionId: IntegrationRuntimeSource['primaryAction']['id'],
  ) => Promise<void>;
  readonly sources: readonly IntegrationRuntimeSource[];
}) {
  const counts = {
    action_required: sources.filter((source) => source.businessStatus === 'action_required').length,
    all: sources.length,
    syncing: sources.filter((source) => source.businessStatus === 'syncing').length,
    working: sources.filter((source) => source.businessStatus === 'working').length,
  };

  return (
    <div className="pd-id8-tab-content">
      <section className="pd-id8-info-card">
        <p>
          <strong>Konstrukcja operacyjna ID-8:</strong>
          {' '}
          Widok prezentuje podłączone integracje, ich stan połączenia technicznego, poziom kompletności oraz opóźnienie freshness. Pozwala odróżnić awarię połączenia od przetwarzania danych.
        </p>
        <div className="pd-id8-source-toolbar">
          <label>
            <span>Szukaj źródła</span>
            <input
              onChange={(event) => onFiltersChange({
                ...filters,
                query: event.target.value,
              })}
              placeholder="Szukaj źródła, konta, ID..."
              type="search"
              value={filters.query}
            />
          </label>
          <div className="pd-id8-filter-pills" role="group" aria-label="Filtr statusu źródeł">
            {sourceStatusFilters.map((filter) => (
              <button
                data-active={filters.status === filter.id ? true : undefined}
                key={filter.id}
                onClick={() => onFiltersChange({
                  ...filters,
                  status: filter.id,
                })}
                type="button"
              >
                {filter.label}
                {' '}
                <span>({counts[filter.id]})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pd-id8-table-card">
        <div className="pd-id8-table-wrap">
          <table aria-label="Źródła danych i jakość danych">
            <thead>
              <tr>
                <th>Źródło danych / Konto</th>
                <th>Połączenie</th>
                <th>Kompletność danych</th>
                <th>Aktualność (Freshness)</th>
                <th>Rekomendowana akcja</th>
                <th>Zarządzanie</th>
              </tr>
            </thead>
            <tbody>
              {filteredSources.length > 0 ? filteredSources.map((source) => (
                <SourceRow
                  key={source.integrationId}
                  onDisconnect={onDisconnect}
                  onOpenDetails={onOpenDetails}
                  onSourceCommand={onSourceCommand}
                  source={source}
                />
              )) : (
                <tr>
                  <td colSpan={6}>
                    <div className="pd-id8-empty">Nie znaleźliśmy pasującego źródła.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SourceRow({
  onDisconnect,
  onOpenDetails,
  onSourceCommand,
  source,
}: {
  readonly onDisconnect: (source: IntegrationRuntimeSource) => void;
  readonly onOpenDetails: (sourceId: string) => void;
  readonly onSourceCommand: (
    source: IntegrationRuntimeSource,
    actionId: IntegrationRuntimeSource['primaryAction']['id'],
  ) => Promise<void>;
  readonly source: IntegrationRuntimeSource;
}) {
  return (
    <tr>
      <td>
        <button className="pd-id8-source-cell" onClick={() => onOpenDetails(source.integrationId)} type="button">
          <ProviderMark label={source.providerDisplayName} provider={source.provider} />
          <span>
            <strong>{source.providerDisplayName}</strong>
            <small>
              {source.accountName ?? source.displayName}
              {source.externalAccountIdMasked ? ` — ${source.externalAccountIdMasked}` : ''}
            </small>
          </span>
        </button>
      </td>
      <td><StatusPill status={source.businessStatus} /></td>
      <td>
        <div className="pd-id8-progress-cell">
          <span><b style={{ inlineSize: `${source.completeness.percentage}%` }} data-status={source.completeness.status} /></span>
          <strong>{source.completeness.percentage}%</strong>
        </div>
      </td>
      <td>{source.freshness.label}</td>
      <td><strong className="pd-id8-next-action">{source.nextStep}</strong></td>
      <td>
        <div className="pd-id8-row-actions">
          <button
            data-primary={source.businessStatus === 'action_required' ? true : undefined}
            onClick={() => void onSourceCommand(source, source.primaryAction.id)}
            type="button"
          >
            {source.businessStatus === 'action_required' ? 'Napraw' : source.primaryAction.label}
          </button>
          <button onClick={() => onOpenDetails(source.integrationId)} type="button">Szczegóły</button>
          <button onClick={() => onDisconnect(source)} type="button">Rozłącz</button>
        </div>
      </td>
    </tr>
  );
}

function CatalogView({
  filteredProviders,
  filters,
  onConnect,
  onFiltersChange,
}: {
  readonly filteredProviders: readonly IntegrationRuntimeCatalogProvider[];
  readonly filters: IntegrationCatalogFilters;
  readonly onConnect: (provider: IntegrationRuntimeCatalogProvider) => void;
  readonly onFiltersChange: (filters: IntegrationCatalogFilters) => void;
}) {
  return (
    <div className="pd-id8-tab-content">
      <section className="pd-id8-recommended">
        <span>Rekomendowana Ścieżka Integracji PapaData</span>
        <h2>Zbuduj PEŁNY obraz analityczny w 4 krokach</h2>
        <p>Aby PapaData mogła precyzyjnie wyliczyć ROAS, CAC oraz dostarczać wiarygodne rekomendacje AI, podłącz źródła według poniższej hierarchii priorytetów.</p>
        <div>
          {recommendedFlow.map((item) => (
            <article data-tone={item.tone} key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
              <small>{item.status}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="pd-id8-catalog-toolbar">
        <div role="group" aria-label="Kategorie katalogu integracji">
          {catalogFilterOptions.map((filter) => (
            <button
              data-active={filters.category === filter.id ? true : undefined}
              key={filter.id}
              onClick={() => onFiltersChange({
                ...filters,
                category: filter.id,
              })}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        <label>
          <span>Szukaj konektora</span>
          <input
            onChange={(event) => onFiltersChange({
              ...filters,
              query: event.target.value,
            })}
            placeholder="Szukaj konektora..."
            type="search"
            value={filters.query}
          />
        </label>
      </section>

      <section className="pd-id8-catalog-grid">
        {filteredProviders.map((provider) => (
          <ProviderCard
            key={provider.provider}
            onConnect={onConnect}
            provider={provider}
          />
        ))}
      </section>
    </div>
  );
}

function ProviderCard({
  onConnect,
  provider,
}: {
  readonly onConnect: (provider: IntegrationRuntimeCatalogProvider) => void;
  readonly provider: IntegrationRuntimeCatalogProvider;
}) {
  return (
    <article className="pd-id8-provider-card">
      <header>
        <div>
          <ProviderMark label={provider.displayName} provider={provider.provider} />
          <span>
            <h3>{provider.displayName}</h3>
            <small>{provider.categoryLabel}</small>
          </span>
        </div>
        <AvailabilityBadge provider={provider} />
      </header>
      <div className="pd-id8-provider-copy">
        <p><strong>Co pobierzemy:</strong> {provider.dataCollected.slice(0, 4).join(', ')}</p>
        <p><strong>Odblokuje:</strong> {provider.unlocks.slice(0, 4).join(', ')}</p>
      </div>
      <footer>
        <span>{authLabel(provider.authType)}</span>
        <button
          disabled={!provider.connectable}
          onClick={() => onConnect(provider)}
          type="button"
        >
          {provider.connectable ? 'Połącz' : 'Niedostępne'}
        </button>
      </footer>
    </article>
  );
}

function HealthView({
  completeness,
  logs,
  onReadinessOpen,
}: {
  readonly completeness: IntegrationCompletenessRuntime;
  readonly logs: readonly IntegrationRuntimeLog[];
  readonly onReadinessOpen: () => void;
}) {
  return (
    <div className="pd-id8-tab-content">
      <section className="pd-id8-health-intro">
        <div>
          <h2>Diagnostyka Gotowości Biznesowej i Pipeline Danych (ID-8 Sekcja 31-38)</h2>
          <p>Ten widok odpowiada na kluczowe pytanie biznesowe: „Czy dane w PapaData są wystarczająco kompletne i aktualne, żeby podejmować decyzje?”.</p>
        </div>
        <span>Backend Source of Truth</span>
      </section>

      <section className="pd-id8-health-grid">
        <article className="pd-id8-domain-list">
          <header>
            <h3>Gotowość Obszarów Biznesowych</h3>
            <button onClick={onReadinessOpen} type="button">Wyjaśnij Wzór</button>
          </header>
          <div>
            {completeness.domains.map((domain) => (
              <article data-status={domain.status} key={domain.id}>
                <span>
                  <strong>{domain.label}</strong>
                  <small>{domain.missingRequiredSources.length > 0
                    ? `${domain.missingRequiredSources.join(', ')} wymagany`
                    : domain.connectedRequiredSources.join(', ') || 'Źródła wspierające'}</small>
                </span>
                <b>{domain.status === 'COMPLETE' ? `${domain.readiness}% READY` : domain.status === 'MISSING' ? 'NIEGOTOWY' : `${domain.readiness}% PARTIAL`}</b>
              </article>
            ))}
          </div>
          <p>
            Logika ID-8: ogólna średnia arytmetyczna nie maskuje braku w wymaganym źródle. Required source blokuje domenę przy krytycznej luce.
          </p>
        </article>

        <article className="pd-id8-chart-card">
          <header>
            <div>
              <h3>Trend Kompletności Danych (Ostatnie 7 Dni)</h3>
              <p>Wykres prezentuje dzienny wskaźnik dostępności rekordów w podziale na kluczowe źródła danych.</p>
            </div>
            <span>Data Watermark: {formatIntegrationDateTime(completeness.generatedAt)}</span>
          </header>
          <CompletenessCanvas completeness={completeness} />
        </article>
      </section>

      <section className="pd-id8-daily-grid">
        <header>
          <h3>Dzienny Kalendarz Pokrycia Danych (Drill-down)</h3>
          <span>Automatyczny audyt ciągłości danych</span>
        </header>
        <div className="pd-id8-table-wrap">
          <table aria-label="Dzienny kalendarz pokrycia danych">
            <thead>
              <tr>
                <th>Źródło</th>
                {dateColumns(completeness).map((date) => (
                  <th key={date}>{shortDate(date)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completeness.sources.map((source) => (
                <tr key={source.integrationId}>
                  <td><strong>{source.providerDisplayName}</strong></td>
                  {dateColumns(completeness).map((date) => {
                    const day = source.completeness.days.find((item) => item.date === date);
                    return (
                      <td key={date}>
                        <span data-status={day?.status ?? 'MISSING'}>
                          {day?.status === 'COMPLETE' ? '100%' : day?.status === 'PARTIAL' ? `${source.completeness.percentage}%` : '0%'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pd-id8-logs-card">
        <header>
          <div>
            <h3>Historia Pobrań i Zadań Pipeline (`/integrations/logs`)</h3>
            <p>Ostatnie wykonania synchronizacji cyklicznej i zadań historycznych.</p>
          </div>
        </header>
        <div className="pd-id8-table-wrap">
          <table aria-label="Historia pobrań danych">
            <thead>
              <tr>
                <th>Źródło</th>
                <th>Typ Zadania</th>
                <th>Rozpoczęto</th>
                <th>Czas trwania</th>
                <th>Rekordy</th>
                <th>Status</th>
                <th>Szczegóły / Błąd</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <LogRow key={log.jobId} log={log} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CompletenessCanvas({
  completeness,
}: {
  readonly completeness: IntegrationCompletenessRuntime;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    drawCompletenessChart(ctx, rect.width, rect.height, completeness);
  }, [completeness]);

  return (
    <div className="pd-id8-chart-container">
      <canvas aria-label="Trend kompletności danych" ref={canvasRef} role="img" />
    </div>
  );
}

function LogRow({
  log,
}: {
  readonly log: IntegrationRuntimeLog;
}) {
  return (
    <tr>
      <td><strong>{log.providerDisplayName}</strong></td>
      <td>{log.type}</td>
      <td>{formatIntegrationDateTime(log.startedAt)}</td>
      <td>{formatDuration(log.durationMs)}</td>
      <td>{formatNumber(log.recordsWritten ?? log.recordsRead)}</td>
      <td><LogStatus status={log.status} /></td>
      <td>{log.safeErrorMessage ?? log.errorCode ?? 'OK (200)'}</td>
    </tr>
  );
}

function SourceInspector({
  onClose,
  onDisconnect,
  onSourceCommand,
  source,
}: {
  readonly onClose: () => void;
  readonly onDisconnect: (source: IntegrationRuntimeSource) => void;
  readonly onSourceCommand: (
    source: IntegrationRuntimeSource,
    actionId: IntegrationRuntimeSource['primaryAction']['id'],
  ) => Promise<void>;
  readonly source: IntegrationRuntimeSource | null;
}) {
  if (!source) return null;
  return (
    <div className="pd-id8-modal pd-id8-modal--drawer" role="dialog" aria-modal="true" aria-label={`Szczegóły ${source.providerDisplayName}`}>
      <aside>
        <div className="pd-id8-drawer-body">
          <header>
            <div>
              <ProviderMark label={source.providerDisplayName} provider={source.provider} />
              <span>
                <h2>{source.providerDisplayName}</h2>
                <small>{source.accountName ?? source.displayName} — ID: {source.externalAccountIdMasked ?? 'zamaskowane'}</small>
              </span>
            </div>
            <button onClick={onClose} type="button">✕</button>
          </header>
          {source.issue || source.businessStatus === 'action_required' ? (
            <section className="pd-id8-problem-box">
              <strong>Problem z Połączeniem</strong>
              <p>{source.issue?.message ?? source.nextStep}</p>
              <button onClick={() => void onSourceCommand(source, 'reauth')} type="button">Połącz ponownie (Reauth OAuth)</button>
            </section>
          ) : null}
          <section>
            <h3>Stan Techniczny & Lifecycle</h3>
            <dl className="pd-id8-key-grid">
              <div><dt>Status Połączenia</dt><dd>{source.connectionStatus}</dd></div>
              <div><dt>Kompletność Danych</dt><dd>{source.completeness.percentage}%</dd></div>
              <div><dt>Aktualność (Freshness)</dt><dd>{source.freshness.label}</dd></div>
              <div><dt>Pierwsze Pobranie (Backfill)</dt><dd>{source.initialBackfill.status} ({source.initialBackfill.coverageDays} dni)</dd></div>
            </dl>
          </section>
          <section className="pd-id8-impact-box">
            <h3>Wpływ na Moduły Analityczne PapaData</h3>
            <p>To źródło zasila następujące wskaźniki i funkcjonalności:</p>
            <div>
              {uniqueLabels([
                ...source.impact.kpis,
                ...source.impact.areas,
                source.impact.ai,
              ]).slice(0, 8).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>
        </div>
        <footer>
          <button onClick={() => void onSourceCommand(source, 'sync')} type="button">Pobierz najnowsze dane</button>
          <button onClick={() => onDisconnect(source)} type="button">Rozłącz źródło...</button>
        </footer>
      </aside>
    </div>
  );
}

function ConnectModal({
  onClose,
  onCreateConnection,
  onProviderTest,
  onSaved,
  provider,
  setOperationNotice,
  showToast,
}: {
  readonly onClose: () => void;
  readonly onCreateConnection?: (
    provider: IntegrationRuntimeCatalogProvider,
    input: {
      readonly credentialReference: string;
      readonly requestedScopes: readonly string[];
    },
  ) => Promise<void>;
  readonly onProviderTest?: (
    provider: IntegrationRuntimeCatalogProvider,
    input: Readonly<Record<string, unknown>>,
  ) => Promise<IntegrationProviderTestResult>;
  readonly onSaved: () => void;
  readonly provider: IntegrationRuntimeCatalogProvider | null;
  readonly setOperationNotice: (notice: OperationNotice) => void;
  readonly showToast: (message: string, tone?: Toast['tone']) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<IntegrationProviderTestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft({});
    setTestResult(null);
  }, [provider?.provider]);

  if (!provider) return null;

  const activeProvider = provider;
  const canSave = testResult?.canSave === true
    && testResult.provider === activeProvider.provider
    && activeProvider.connectable;

  async function handleTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTesting(true);
    setTestResult(null);
    try {
      if (!onProviderTest) {
        setTestResult({
          canSave: false,
          formValidation: {
            fieldErrors: {},
            message: 'Frontend nie ma podłączonego endpointu testu providera.',
            status: 'failed',
          },
          provider: activeProvider.provider,
          providerTest: {
            message: 'Zapis pozostaje zablokowany, bo nie wykonano realnego testu providera.',
            status: 'failed',
          },
        });
        return;
      }
      const result = await onProviderTest(activeProvider, draft);
      setTestResult(result);
      showToast(
        result.canSave
          ? 'Test P0 zaliczony — poświadczenia aktywne.'
          : 'Test providera nie odblokował zapisu.',
        result.canSave ? 'success' : 'error',
      );
    } catch (cause) {
      setTestResult({
        canSave: false,
        formValidation: {
          fieldErrors: {},
          message: 'Nie udało się uruchomić testu połączenia.',
          status: 'failed',
        },
        provider: activeProvider.provider,
        providerTest: {
          message: cause instanceof Error
            ? cause.message
            : 'Test providera zakończył się błędem. Zapis pozostaje zablokowany.',
          status: 'failed',
        },
      });
      showToast('Test providera zakończył się błędem.', 'error');
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    if (!canSave) {
      showToast('Brak testu połączenia u dostawcy.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (!onCreateConnection) {
        setOperationNotice({
          message: 'Test przeszedł, ale bieżący runtime nie wystawił zapisu secret reference.',
          title: 'Zapis połączenia niedostępny',
          tone: 'warning',
        });
        return;
      }
      await onCreateConnection(activeProvider, {
        credentialReference: draft.credentialReference?.trim() || `secret://${activeProvider.provider}`,
        requestedScopes: activeProvider.requiredScopes,
      });
      onSaved();
    } catch (cause) {
      setOperationNotice({
        message: cause instanceof Error ? cause.message : 'Nie udało się zapisać połączenia.',
        title: 'Zapis nie powiódł się',
        tone: 'critical',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pd-id8-modal" role="dialog" aria-modal="true" aria-label={`Połącz ${activeProvider.displayName}`}>
      <section className="pd-id8-connect-modal">
        <header>
          <div>
            <ProviderMark label={activeProvider.displayName} provider={activeProvider.provider} />
            <span>
              <h2>Połącz {activeProvider.displayName}</h2>
              <small>{authLabel(activeProvider.authType)} · {activeProvider.updateCadence}</small>
            </span>
          </div>
          <button onClick={onClose} type="button">✕</button>
        </header>
        <div className="pd-id8-connect-body">
          <section>
            <strong>Co zostanie pobrane:</strong>
            <p>{activeProvider.dataCollected.join(', ')}</p>
          </section>
          <form onSubmit={handleTest}>
            {providerFields(activeProvider).map((field) => (
              <label key={field.name}>
                <span>{field.label}</span>
                <input
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft((current) => ({
                    ...current,
                    [field.name]: event.target.value,
                  }))}
                  placeholder={field.placeholder}
                  required={field.required}
                  type={field.secret ? 'password' : field.type}
                  value={draft[field.name] ?? ''}
                />
              </label>
            ))}
            <section className="pd-id8-live-test">
              <div>
                <strong>Weryfikacja Połączenia (P0 Live Test)</strong>
                <button disabled={testing} type="submit">
                  {testing ? 'Testowanie...' : 'Testuj połączenie'}
                </button>
              </div>
              <p data-status={testResult?.providerTest.status ?? 'not_run'}>
                {testResult
                  ? `${testResult.formValidation.message} ${testResult.providerTest.message}`
                  : 'Status: Nieprzeprowadzono żywego testu u dostawcy.'}
              </p>
            </section>
          </form>
        </div>
        <footer>
          <button onClick={onClose} type="button">Anuluj</button>
          <button disabled={!canSave || saving} onClick={() => void handleSave()} type="button">
            {saving ? 'Zapisywanie...' : 'Zapisz i Pobierz Dane'}
          </button>
        </footer>
      </section>
    </div>
  );
}

function SseConsole({
  onClose,
  open,
  progress,
  setProgress,
  showToast,
}: {
  readonly onClose: () => void;
  readonly open: boolean;
  readonly progress: number;
  readonly setProgress: (progress: number) => void;
  readonly showToast: (message: string, tone?: Toast['tone']) => void;
}) {
  if (!open) return null;
  const next = Math.min(100, progress + 5);
  return (
    <div className="pd-id8-modal" role="dialog" aria-modal="true" aria-label="SSE Live Stream Viewer">
      <section className="pd-id8-sse-modal">
        <header>
          <div><span /> <strong>Server-Sent Events (SSE) Live Stream Viewer</strong></div>
          <button onClick={onClose} type="button">✕</button>
        </header>
        <p>Na żywo podglądaj zdarzenia backfill_progress przesyłane przez backend bez agresywnego pollingu HTTP.</p>
        <pre>{`[15:10:01] SSE Connection established to /api/v1/integrations/stream...
[15:10:02] event: backfill_progress
data: {"integrationId":"src_ga4_03", "provider":"ga4", "progressPercentage":${progress}.0, "status":"RUNNING"}`}</pre>
        <footer>
          <button
            onClick={() => {
              setProgress(next);
              showToast(`SSE Event Received: GA4 Backfill ${next}%`);
            }}
            type="button"
          >
            Wygeneruj zdarzenie SSE (+5%)
          </button>
          <span>Endpoint: /api/v1/integrations/stream</span>
        </footer>
      </section>
    </div>
  );
}

function ReadinessModal({
  onClose,
  open,
}: {
  readonly onClose: () => void;
  readonly open: boolean;
}) {
  if (!open) return null;
  return (
    <div className="pd-id8-modal" role="dialog" aria-modal="true" aria-label="Formuła Gotowości Biznesowej">
      <section className="pd-id8-readiness-modal">
        <header>
          <h2>Formuła Gotowości Biznesowej (Domain Readiness)</h2>
          <button onClick={onClose} type="button">✕</button>
        </header>
        <p>PapaData odrzuca proste średnie arytmetyczne kompletności. Wskaźnik gotowości domeny jest zerowany, jeśli źródło wymagane nie spełnia progu kompletności.</p>
        <code>Readiness(Domain) = Product[Completeness(Required) &gt;= 0.95] × Mean(Supporting)</code>
        <button onClick={onClose} type="button">Rozumiem</button>
      </section>
    </div>
  );
}

function DisconnectModal({
  onClose,
  onConfirm,
  source,
}: {
  readonly onClose: () => void;
  readonly onConfirm: (source: IntegrationRuntimeSource) => Promise<void>;
  readonly source: IntegrationRuntimeSource | null;
}) {
  if (!source) return null;
  return (
    <div className="pd-id8-modal" role="dialog" aria-modal="true" aria-label={`Rozłączyć ${source.providerDisplayName}?`}>
      <section className="pd-id8-readiness-modal">
        <header>
          <h2>Rozłączyć {source.providerDisplayName}?</h2>
          <button onClick={onClose} type="button">✕</button>
        </header>
        <p>Po rozłączeniu PapaData przestanie pobierać nowe dane, zapisany dostęp zostanie unieważniony, a bieżące analizy mogą stracić aktualność.</p>
        <div className="pd-id8-modal-actions">
          <button onClick={onClose} type="button">Anuluj</button>
          <button data-danger onClick={() => void onConfirm(source)} type="button">Rozłącz źródło</button>
        </div>
      </section>
    </div>
  );
}

function PrototypeFooter() {
  return (
    <footer className="pd-id8-footer">
      <div>
        <span>PapaData Platform — Specyfikacja Integracji ID-8 target-state • Wersja 1.0</span>
        <span>Architektura API: OAuth 2.0 / SSE Stream / Multi-tenant SaaS</span>
      </div>
    </footer>
  );
}

function ToastStack({
  toasts,
}: {
  readonly toasts: readonly Toast[];
}) {
  return (
    <div className="pd-id8-toasts" aria-live="polite">
      {toasts.map((toast) => (
        <div data-tone={toast.tone} key={toast.id}>{toast.message}</div>
      ))}
    </div>
  );
}

function ProviderMark({
  label,
  provider,
}: {
  readonly label: string;
  readonly provider: IntegrationProviderId;
}) {
  return (
    <span className="pd-id8-provider-mark" data-provider={provider}>
      {provider === 'ga4' ? 'GA' : label.charAt(0)}
    </span>
  );
}

function StatusPill({
  status,
}: {
  readonly status: RuntimeSourceBusinessStatus;
}) {
  const label = status === 'working'
    ? 'Działa'
    : status === 'syncing'
      ? 'Pobieranie'
      : 'Wymaga działania';
  const icon = status === 'working' ? '✓' : status === 'syncing' ? '↻' : '⚠';
  return (
    <span className="pd-id8-status-pill" data-status={status}>
      {icon}
      {' '}
      {label}
    </span>
  );
}

function AvailabilityBadge({
  provider,
}: {
  readonly provider: IntegrationRuntimeCatalogProvider;
}) {
  return (
    <span className="pd-id8-availability" data-connectable={provider.connectable ? true : undefined}>
      {provider.connectable ? 'Dostępne' : provider.availabilityLabel}
    </span>
  );
}

function LogStatus({
  status,
}: {
  readonly status: IntegrationRuntimeLog['status'];
}) {
  const label = status === 'completed' ? 'Zakończone' : status === 'running' ? 'W toku' : 'Błąd';
  return <span className="pd-id8-log-status" data-status={status}>{label}</span>;
}

function IntegrationsPrototypeSkeleton() {
  return (
    <div className="pd-integrations-id8">
      <PrototypeHeader
        loading
        onSseOpen={() => undefined}
        planLabel="..."
      />
      <main className="pd-id8-main">
        <section className="pd-id8-skeleton" />
        <section className="pd-id8-skeleton" />
        <section className="pd-id8-skeleton" />
      </main>
    </div>
  );
}

function authLabel(type: IntegrationRuntimeCatalogProvider['authType']) {
  switch (type) {
    case 'api_key':
      return 'API Key / Basic Auth';
    case 'basic_auth':
      return 'Basic Auth';
    case 'oauth':
      return 'Konto OAuth2';
  }
}

function providerFields(provider: IntegrationRuntimeCatalogProvider): readonly {
  readonly label: string;
  readonly name: string;
  readonly placeholder: string;
  readonly required: boolean;
  readonly secret: boolean;
  readonly type: 'text' | 'url';
}[] {
  if (provider.authType === 'oauth') {
    return [
      {
        label: 'Nazwa źródła',
        name: 'displayName',
        placeholder: `${provider.displayName} produkcyjny`,
        required: true,
        secret: false,
        type: 'text',
      },
      {
        label: 'Secret reference po OAuth callback',
        name: 'credentialReference',
        placeholder: `secret://${provider.provider}`,
        required: false,
        secret: true,
        type: 'text',
      },
    ];
  }
  return [
    {
      label: 'Nazwa Źródła (Własna)',
      name: 'displayName',
      placeholder: `Sklep produkcyjny ${provider.displayName}`,
      required: true,
      secret: false,
      type: 'text',
    },
    {
      label: 'Adres URL Sklepu / Host API',
      name: 'storeUrl',
      placeholder: 'https://sklep.example.com',
      required: provider.provider === 'woocommerce',
      secret: false,
      type: provider.provider === 'woocommerce' ? 'url' : 'text',
    },
    {
      label: provider.provider === 'baselinker' ? 'API Token' : 'Consumer Key',
      name: 'consumerKey',
      placeholder: provider.provider === 'baselinker' ? 'token_live_...' : 'ck_live_...',
      required: true,
      secret: true,
      type: 'text',
    },
    {
      label: 'Consumer Secret',
      name: 'consumerSecret',
      placeholder: 'cs_live_...',
      required: provider.provider === 'woocommerce',
      secret: true,
      type: 'text',
    },
  ];
}

function uniqueLabels(labels: readonly (string | undefined)[]) {
  return Array.from(new Set(labels.filter((label): label is string => Boolean(label))));
}

function averageDomainReadiness(completeness: IntegrationCompletenessRuntime) {
  if (completeness.domains.length === 0) return completeness.global.percentage;
  const total = completeness.domains.reduce((sum, domain) => sum + domain.readiness, 0);
  return total / completeness.domains.length;
}

function dateColumns(completeness: IntegrationCompletenessRuntime): readonly string[] {
  const first = completeness.sources[0]?.completeness.days ?? [];
  return first.slice(0, 7).map((day) => day.date).reverse();
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function drawCompletenessChart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  completeness: IntegrationCompletenessRuntime,
) {
  const palette = ['rgb(16 185 129)', 'rgb(244 63 94)', 'rgb(99 102 241)', 'rgb(245 158 11)'];
  const padding = { bottom: 42, left: 38, right: 16, top: 18 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const labels = dateColumns(completeness);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgb(255 255 255)';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgb(226 232 240)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let line = 0; line <= 4; line += 1) {
    const y = padding.top + (chartHeight / 4) * line;
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
  }
  ctx.stroke();

  ctx.fillStyle = 'rgb(100 116 139)';
  ctx.font = '11px Inter, sans-serif';
  [0, 50, 100].forEach((tick) => {
    const y = padding.top + chartHeight - ((tick / 100) * chartHeight);
    ctx.fillText(`${tick}%`, 4, y + 4);
  });

  completeness.sources.slice(0, 4).forEach((source, index) => {
    const data = labels.map((label) => {
      const day = source.completeness.days.find((item) => item.date === label);
      if (!day) return 0;
      if (day.status === 'COMPLETE') return 100;
      if (day.status === 'PARTIAL') return source.completeness.percentage;
      return 0;
    });
    ctx.strokeStyle = palette[index % palette.length];
    ctx.lineWidth = index === 1 ? 2.5 : 2;
    ctx.beginPath();
    data.forEach((value, pointIndex) => {
      const x = padding.left + (labels.length <= 1 ? 0 : (chartWidth / (labels.length - 1)) * pointIndex);
      const y = padding.top + chartHeight - ((value / 100) * chartHeight);
      if (pointIndex === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });

  labels.forEach((label, index) => {
    const x = padding.left + (labels.length <= 1 ? 0 : (chartWidth / (labels.length - 1)) * index);
    ctx.fillStyle = 'rgb(100 116 139)';
    ctx.fillText(shortDate(label), x - 18, height - 16);
  });
}
