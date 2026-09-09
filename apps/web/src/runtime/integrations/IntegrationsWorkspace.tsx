import type {
  ChangeEvent,
  FormEvent,
} from 'react';
import {
  useMemo,
  useState,
  useEffect,
} from 'react';

import {
  AlertDialog,
  Button,
  Checkbox,
  DataTable,
  Dialog,
  Drawer,
  Icon,
  InlineNotice,
  Menu,
  PasswordField,
  SearchField,
  StatusBadge,
  Tabs,
  TextField,
} from '../../design-system';
import type {
  DataTableStatusTone,
  MenuItem,
} from '../../design-system';
import type {
  DataRow,
} from '../../../../../contracts/component-shared';
import {
  createIntegrationsRuntimeFallbackData,
  filterIntegrationCatalog,
  filterIntegrationSources,
  formatDuration,
  formatIntegrationDateTime,
  formatNumber,
  integrationWorkspaceTabs,
  providerAvailabilityTone,
  resolveSourceSyntheticStatus,
  streamLabel,
  syntheticStatusTone,
} from './integrationsData';
import type {
  IntegrationCatalogFilters,
  IntegrationProviderId,
  IntegrationProviderTestResult,
  IntegrationRuntimeCatalogProvider,
  IntegrationRuntimeLog,
  IntegrationRuntimeSource,
  IntegrationSourceFilters,
  IntegrationSyncStage,
  IntegrationWorkspaceTabId,
  IntegrationsRuntimeView,
} from './integrationsData';
import './integrations-workspace.css';
import { useProductQuery } from '../app/routing/productRoutes';

type PartialFailure = {
  readonly id: 'catalog' | 'logs' | 'completeness';
  readonly title: string;
  readonly message: string;
};

type HubAreaId = 'sources' | 'catalog' | 'data-quality';

export type IntegrationsWorkspaceProps = {
  readonly loading?: boolean;
  readonly mode?: 'runtime' | 'storybook';
  readonly onBeginConnect?: (provider:IntegrationRuntimeCatalogProvider, source?:IntegrationRuntimeSource)=>void;
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
  readonly onUpdateSourceScope?: (
    source: IntegrationRuntimeSource,
    selectedStreams: readonly string[],
  ) => Promise<void>;
  readonly partialFailures?: readonly PartialFailure[];
  readonly path?: string;
  readonly problem?: string | null;
  readonly runtime?: IntegrationsRuntimeView | null;
  readonly initialArea?: HubAreaId;
  readonly initialSourceId?: string | null;
  readonly initialWorkspaceTab?: IntegrationWorkspaceTabId;
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

const hubAreas: readonly { readonly id: HubAreaId; readonly label: string }[] = [
  { id: 'sources', label: 'Źródła' },
  { id: 'catalog', label: 'Katalog' },
  { id: 'data-quality', label: 'Jakość danych' },
];

const sourceStatusFilters: readonly {
  readonly id: IntegrationSourceFilters['status'];
  readonly label: string;
}[] = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'ready', label: 'Gotowe' },
  { id: 'syncing', label: 'Synchronizacja' },
  { id: 'partial', label: 'Częściowo gotowe' },
  { id: 'action_required', label: 'Wymaga działania' },
  { id: 'provider_error', label: 'Błąd dostawcy' },
  { id: 'no_data', label: 'Brak danych' },
  { id: 'disconnected', label: 'Odłączone' },
];

const catalogFilterOptions: readonly {
  readonly id: IntegrationCatalogFilters['category'];
  readonly label: string;
}[] = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'commerce', label: 'Sprzedaż i marketplace' },
  { id: 'advertising', label: 'Reklama' },
  { id: 'analytics', label: 'Analityka i marketing' },
  { id: 'available', label: 'Dostępne' },
];

const wizardStepDefs = [
  { id: 'account', label: 'Konto' },
  { id: 'access', label: 'Dostęp' },
  { id: 'scope', label: 'Zakres danych' },
  { id: 'test', label: 'Test' },
  { id: 'sync', label: 'Pierwsza synchronizacja' },
] as const;

type WizardStepId = (typeof wizardStepDefs)[number]['id'];

export function IntegrationsWorkspace({
  loading = false,
  mode = 'runtime',
  onBeginConnect,
  onCreateConnection,
  onDisconnectConnection,
  onProviderTest,
  onReload,
  onSourceCommand,
  onUpdateSourceScope,
  partialFailures = [],
  path = '/app/integrations/sources',
  problem = null,
  runtime,
  initialArea,
  initialSourceId = null,
  initialWorkspaceTab = 'overview',
}: IntegrationsWorkspaceProps) {
  const resolvedRuntime = useMemo(
    () => runtime ?? (mode === 'storybook' ? createIntegrationsRuntimeFallbackData() : null),
    [runtime, mode],
  );

  const queryState = useProductQuery();
  const [area, setArea] = useState<HubAreaId>(initialArea ?? resolveHubArea(path));
  const [sourceFilters, setSourceFilters] = useState<IntegrationSourceFilters>({
    provider: 'all',
    query: '',
    status: 'all',
  });
  const [catalogFilters, setCatalogFilters] = useState<IntegrationCatalogFilters>({
    category: 'all',
    query: '',
  });
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(initialSourceId);
  const [workspaceTab, setWorkspaceTab] = useState<IntegrationWorkspaceTabId>(initialWorkspaceTab);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [connectProviderId, setConnectProviderId] = useState<IntegrationProviderId | null>(null);
  const [disconnectSource, setDisconnectSource] = useState<IntegrationRuntimeSource | null>(null);
  const [activityOpen, setActivityOpen] = useState(false);
  const [operationNotice, setOperationNotice] = useState<OperationNotice>(null);
  const [toasts, setToasts] = useState<readonly Toast[]>([]);
  const [scopeOverrides, setScopeOverrides] = useState<Readonly<Record<string, readonly string[]>>>({});

  useEffect(() => {
    const params = new URLSearchParams(queryState.location.split('?')[1] ?? '');
    const requestedArea = params.get('integrationArea');
    setArea(requestedArea === 'catalog' || requestedArea === 'sources' || requestedArea === 'data-quality' ? requestedArea : initialArea ?? resolveHubArea(path));
    setSelectedSourceId(params.get('sourceId') ?? initialSourceId);
    const tab=params.get('sourceTab');
    setWorkspaceTab(tab === 'overview' || tab === 'data' || tab === 'sync' || tab === 'config' ? tab : initialWorkspaceTab);
    const provider=params.get('integrationProvider'),status=params.get('integrationStatus');
    const category=params.get('integrationCatalogCategory');
    setCatalogFilters({query:params.get('integrationCatalogQuery')??'',category:category==='available'||category==='commerce'||category==='import'||category==='advertising'||category==='analytics' ? category as IntegrationCatalogFilters['category'] : 'all'});
    setSourceFilters({query:params.get('integrationQuery') ?? '',provider:provider && ['woocommerce','shopify','baselinker','allegro','google_ads','meta_ads','ga4'].includes(provider) ? provider as IntegrationProviderId : 'all',status:status && ['ready','syncing','partial','action_required','provider_error','no_data','disconnected'].includes(status)? status as IntegrationSourceFilters['status']:'all'});
  },[queryState.location,initialArea,initialSourceId,initialWorkspaceTab,path]);

  function showToast(message: string, tone: Toast['tone'] = 'info') {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((items) => [...items, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3500);
  }

  async function executeSourceCommand(
    source: IntegrationRuntimeSource,
    actionId: IntegrationRuntimeSource['primaryAction']['id'],
  ) {
    if (actionId === 'details') {
      openWorkspace(source.integrationId);
      return;
    }
    if (actionId === 'reauth') {
      const provider=resolvedRuntime?.catalog.providers.find(item=>item.provider===source.provider);
      if(onBeginConnect&&provider){onBeginConnect(provider,source);return;}
      if(mode==='runtime'){showToast('Kreator polaczenia niedostepny.', 'error');return;}
      setConnectProviderId(source.provider);
      return; // Opening a wizard is a local UI action, not a completed reconnection.
    }
    if (!onSourceCommand) {
      showToast(mode === 'storybook' ? 'Demonstracja: nie uruchomiono operacji zewnetrznej.' : 'Operacja jest niedostepna w tym widoku.', 'info');
      return;
    }
    try {
      await onSourceCommand?.(source, actionId);
      if (actionId === 'sync' || actionId === 'backfill') showToast(mode==='storybook'?'Demo: lokalna symulacja, bez zlecenia importu.':`${source.providerDisplayName}: serwer przyjal zlecenie. Wynik sprawdz w historii.`, 'info');
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') return;
      setOperationNotice({
        message: cause instanceof Error ? cause.message : 'Nie udało się wykonać operacji.',
        title: 'Operacja nie powiodła się',
        tone: 'critical',
      });
      showToast('Operacja nie powiodła się.', 'error');
    }
  }

  function requestDisconnect(source:IntegrationRuntimeSource){
    if(!onDisconnectConnection){showToast('Operacja odlaczenia niedostepna dla tego widoku.','info');return;}
    setDisconnectSource(source);
  }

  function openWorkspace(sourceId: string, tab: IntegrationWorkspaceTabId = 'overview') {
    setSelectedSourceId(sourceId);
    setWorkspaceTab(tab);
    setExpandedRunId(null);
    queryState.update({sourceId,sourceTab:tab});
  }

  if (loading && !resolvedRuntime) {
    return (
      <div className="pd-int" data-mode={mode}>
        <div className="pd-int-skeleton">
          <div className="pd-int-skeleton__block" />
          <div className="pd-int-skeleton__block" />
          <div className="pd-int-skeleton__block" />
        </div>
      </div>
    );
  }

  if (!resolvedRuntime) {
    return (
      <div className="pd-int" data-mode={mode}>
        <div className="pd-int-empty-shell">
          <InlineNotice
            message={problem ?? 'Nie udało się pobrać danych o integracjach.'}
            title="Integracje nie są dostępne"
            tone="critical"
          />
          {onReload ? (
            <Button onClick={onReload} size="small" variant="secondary">Spróbuj ponownie</Button>
          ) : null}
        </div>
      </div>
    );
  }

  const selectedSourceBase = selectedSourceId
    ? resolvedRuntime.status.sources.find((source) => source.integrationId === selectedSourceId) ?? null
    : null;
  const selectedSource = selectedSourceBase
    ? {
      ...selectedSourceBase,
      selectedStreams: scopeOverrides[selectedSourceBase.integrationId] ?? selectedSourceBase.selectedStreams,
    }
    : null;
  const connectProvider = connectProviderId
    ? resolvedRuntime.catalog.providers.find((provider) => provider.provider === connectProviderId) ?? null
    : null;
  const syncingSources = resolvedRuntime.status.sources.filter((source) => source.businessStatus === 'syncing');

  return (
    <div className="pd-int" data-demo={resolvedRuntime.demo ? true : undefined} data-mode={mode}>
      {toasts.length > 0 ? (
        <div aria-live="polite" className="pd-int-toast-stack">
          {toasts.map((toast) => (
            <div className="pd-int-toast" data-tone={toast.tone} key={toast.id}>{toast.message}</div>
          ))}
        </div>
      ) : null}

      {selectedSourceId&&!selectedSource?<InlineNotice tone="warning" title="Wybrane zrodlo niedostepne" message="Zrodlo z adresu URL nie wystepuje w tej odpowiedzi. Nie wybrano innego zrodla automatycznie."/>:null}
      {selectedSource ? (
        <ProviderWorkspace
          activeTab={workspaceTab}
          expandedRunId={expandedRunId}
          logs={resolvedRuntime.logs.logs.filter((log) => log.integrationId === selectedSource.integrationId)}
          onBack={() => {setSelectedSourceId(null);queryState.update({sourceId:null,sourceTab:null});}}
          onDisconnect={() => requestDisconnect(selectedSource)}
          onExpandRun={setExpandedRunId}
          availableStreams={resolvedRuntime.catalog.providers.find((provider) => provider.provider === selectedSource.provider)?.supportedStreams ?? selectedSource.selectedStreams}
          onSourceCommand={executeSourceCommand}
          onTabChange={(tab) => {setWorkspaceTab(tab);queryState.update({sourceTab:tab});}}
          onUpdateScope={selectedSource.canManage && (mode === 'storybook' || onUpdateSourceScope) ? async (selectedStreams) => {
            try {
              await onUpdateSourceScope?.(selectedSource, selectedStreams);
              if (mode === 'storybook') setScopeOverrides((current) => ({
                ...current,
                [selectedSource.integrationId]: selectedStreams,
              }));
              showToast(mode==='storybook'?'Demo: zakres zmieniony lokalnie.':'Zakres danych integracji został zaktualizowany.', 'success');
            } catch (cause) {
              if (cause instanceof DOMException && cause.name === 'AbortError') return;
              setOperationNotice({
                message: cause instanceof Error ? cause.message : 'Nie udało się zapisać zakresu danych.',
                title: 'Zmiana zakresu nie powiodła się',
                tone: 'critical',
              });
              showToast('Nie udało się zapisać zakresu danych.', 'error');
              throw cause;
            }
          } : undefined}
          source={selectedSource}
        />
      ) : (
        <IntegrationsHub
          demo={resolvedRuntime.demo}
          canConnect={Boolean(onBeginConnect || onCreateConnection)}
          area={area}
          catalogFilters={catalogFilters}
          catalogProviders={filterIntegrationCatalog(resolvedRuntime.catalog.providers, catalogFilters)}
          completeness={resolvedRuntime.completeness}
          loading={loading}
          logs={resolvedRuntime.logs.logs}
          onAreaChange={(value) => {setArea(value);queryState.update({integrationArea:value,sourceId:null});}}
          onCatalogFiltersChange={value=>{setCatalogFilters(value);queryState.update({integrationCatalogQuery:value.query||null,integrationCatalogCategory:value.category==='all'?null:value.category});}}
          onConnect={(provider) => {if(onBeginConnect)onBeginConnect(provider);else if(mode==='storybook'&&onCreateConnection)setConnectProviderId(provider.provider);else showToast('Kreator niedostepny.','error');}}
          onOpenSource={openWorkspace}
          onReload={onReload}
          onRequestDisconnect={requestDisconnect}
          onSourceFiltersChange={(value) => {setSourceFilters(value);queryState.update({integrationQuery:value.query||null,integrationProvider:value.provider==='all'?null:value.provider,integrationStatus:value.status==='all'?null:value.status});}}
          runtimeStatus={resolvedRuntime.status}
          sourceFilters={sourceFilters}
          sources={filterIntegrationSources(resolvedRuntime.status.sources, sourceFilters)}
          onOpenActivity={() => setActivityOpen(true)}
          onSourceCommand={executeSourceCommand}
        />
      )}

      {problem ? (
        <div className="pd-int-floating-notice">
          <InlineNotice message={problem} title="Część danych Integracji wymaga odświeżenia" tone="warning" />
        </div>
      ) : null}
      {partialFailures.map((failure) => (
        <div className="pd-int-floating-notice" key={failure.id}>
          <InlineNotice message={failure.message} title={failure.title} tone="warning" />
        </div>
      ))}
      {operationNotice ? (
        <div className="pd-int-floating-notice">
          <InlineNotice message={operationNotice.message} title={operationNotice.title} tone={operationNotice.tone} />
        </div>
      ) : null}

      <ConnectWizard
        onClose={() => setConnectProviderId(null)}
        onCreateConnection={onCreateConnection}
        onProviderTest={onProviderTest}
        onSaved={() => {
          setConnectProviderId(null);
          showToast('Demo: zakonczono scenariusz lokalny, bez synchronizacji ani autoryzacji u dostawcy.', 'info');
          setArea('sources');
        }}
        provider={connectProvider}
        showToast={showToast}
      />

      <AlertDialog
        cancelLabel="Anuluj"
        confirmLabel="Odłącz źródło"
        destructive
        message={disconnectSource
          ? `Odłączenie ${disconnectSource.providerDisplayName} (${disconnectSource.accountName ?? ''}) zatrzyma synchronizację danych. Historyczne dane pozostają dostępne w analizach, ale nowe dane przestaną napływać, a powiązane KPI zaczną się starzeć.`
          : ''}
        onCancel={() => setDisconnectSource(null)}
        onConfirm={() => {
          const source = disconnectSource;
          if (!source || !onDisconnectConnection) return;
          void (async () => {
            try {
              await onDisconnectConnection(source);
              showToast(mode==='storybook'?'Demo: lokalne odlaczenie.':'Źródło zostało odłączone.', 'success');
            } catch (cause) {
              setOperationNotice({
                message: cause instanceof Error ? cause.message : 'Nie udało się odłączyć źródła.',
                title: 'Odłączenie nie powiodło się',
                tone: 'critical',
              });
              showToast('Odłączenie nie powiodło się.', 'error');
            } finally {
              setDisconnectSource(null);
              setSelectedSourceId(null);
              queryState.update({sourceId:null,sourceTab:null});
            }
          })();
        }}
        open={disconnectSource !== null}
        title="Odłączyć to źródło?"
      />

      <Drawer
        className="pd-int-activity-drawer"
        dismissible
        onOpenChange={(open) => setActivityOpen(open)}
        open={activityOpen}
        side="right"
        title="Aktywność synchronizacji"
        width={420}
      >
        {syncingSources.length === 0 ? (
          <p className="pd-int-muted-text">Żadne źródło nie synchronizuje się teraz.</p>
        ) : (
          <div className="pd-int-activity-list">
            {syncingSources.map((source) => (
              <article className="pd-int-activity-item" key={source.integrationId}>
                <ProviderMark label={source.providerDisplayName} provider={source.provider} />
                <div>
                  <strong>{source.providerDisplayName}</strong>
                  <p>{source.accountName}</p>
                  <span className="pd-int-muted-text">Synchronizacja w toku · kompletność danych {source.completeness.percentage}%</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
}

function resolveHubArea(path: string): HubAreaId {
  if (path.includes('/add') || path.includes('/katalog')) return 'catalog';
  if (path.includes('/data-health') || path.includes('/jakosc')) return 'data-quality';
  return 'sources';
}

/* ---------------------------------------------------------------------- */
/* Hub: Źródła / Katalog / Jakość danych                                   */
/* ---------------------------------------------------------------------- */

function IntegrationsHub({
  demo,
  canConnect,
  area,
  catalogFilters,
  catalogProviders,
  completeness,
  loading,
  logs,
  onAreaChange,
  onCatalogFiltersChange,
  onConnect,
  onOpenActivity,
  onOpenSource,
  onReload,
  onRequestDisconnect,
  onSourceCommand,
  onSourceFiltersChange,
  runtimeStatus,
  sourceFilters,
  sources,
}: {
  readonly demo: boolean;
  readonly canConnect: boolean;
  readonly area: HubAreaId;
  readonly catalogFilters: IntegrationCatalogFilters;
  readonly catalogProviders: readonly IntegrationRuntimeCatalogProvider[];
  readonly completeness: IntegrationsRuntimeView['completeness'];
  readonly loading: boolean;
  readonly logs: readonly IntegrationRuntimeLog[];
  readonly onAreaChange: (area: HubAreaId) => void;
  readonly onCatalogFiltersChange: (filters: IntegrationCatalogFilters) => void;
  readonly onConnect: (provider: IntegrationRuntimeCatalogProvider) => void;
  readonly onOpenActivity: () => void;
  readonly onOpenSource: (id: string, tab?: IntegrationWorkspaceTabId) => void;
  readonly onReload?: () => void;
  readonly onRequestDisconnect: (source: IntegrationRuntimeSource) => void;
  readonly onSourceCommand: (source: IntegrationRuntimeSource, actionId: IntegrationRuntimeSource['primaryAction']['id']) => void;
  readonly onSourceFiltersChange: (filters: IntegrationSourceFilters) => void;
  readonly runtimeStatus: IntegrationsRuntimeView['status'];
  readonly sourceFilters: IntegrationSourceFilters;
  readonly sources: readonly IntegrationRuntimeSource[];
}) {
  const readyCount = runtimeStatus.sources.filter((source) => resolveSourceSyntheticStatus(source).id === 'ready').length;
  const primaryAlert = runtimeStatus.alerts[0] ?? null;
  const connectedCount = runtimeStatus.sources.filter(source => source.connectionStatus !== 'DISCONNECTED').length;
  const statusCount = (status: IntegrationSourceFilters['status']) => runtimeStatus.sources.filter(source => status === 'all' || resolveSourceSyntheticStatus(source).id === status).length;
  const filterByStatus = (status: IntegrationSourceFilters['status']) => {
    onSourceFiltersChange({ query: '', provider: 'all', status });
    onAreaChange('sources');
  };

  return (
    <div className="pd-int-hub">
      <header className="pd-int-topbar">
        <div>
          <span className="pd-int-eyebrow">Twoje centrum danych</span>
          <div className="pd-int-title-row"><h1>Dane i integracje</h1>{demo && <span className="pd-int-demo-badge" title="Dane przykładowe. Operacje są lokalne. Nie wpisuj prawdziwych sekretów.">Demo</span>}</div>
          <p className="pd-int-lead">Połącz źródła. Dbaj o dane. Analizuj z pewnością.</p>
        </div>
        <div className="pd-int-topbar-actions">
          <Button startIcon={<Icon name="calendar" size={16} />} onClick={onOpenActivity} size="small" variant="ghost">Aktywność synchronizacji</Button>
          {onReload ? (
            <Button disabled={loading} loading={loading} loadingLabel="Odświeżanie…" onClick={onReload} size="small" variant="secondary">
              Odśwież
            </Button>
          ) : null}
          <Button onClick={() => onAreaChange('catalog')} size="small">
            + Połącz źródło
          </Button>
        </div>
      </header>

      <nav aria-label="Obszary integracji" className="pd-int-areas">
        {hubAreas.map((item) => (
          <button
            aria-current={area === item.id ? 'page' : undefined}
            className="pd-int-area-tab"
            key={item.id}
            onClick={() => onAreaChange(item.id)}
            type="button"
          >
            {item.label}
            {item.id === 'sources' && <span className="pd-int-tab-count">{runtimeStatus.sources.length}</span>}
          </button>
        ))}
      </nav>

      {area === 'sources' ? (
        <div className="pd-int-summary-grid" aria-label="Podsumowanie źródeł">
          <SummaryCard icon="integration" label="Połączone źródła" value={`${connectedCount}`} suffix={`/ ${runtimeStatus.plan.dataSourcesLimit}`} description="Limit źródeł w Twoim planie" onClick={() => filterByStatus('all')} active={sourceFilters.status === 'all'} />
          <SummaryCard icon="success" label="Gotowe do analizy" value={`${readyCount}`} description="Dane gotowe do wykorzystania" tone="success" onClick={() => filterByStatus('ready')} active={sourceFilters.status === 'ready'} />
          <SummaryCard icon="data" label="Synchronizacje" value={`${statusCount('syncing')}`} description="Źródła pobierające dane" onClick={() => filterByStatus('syncing')} active={sourceFilters.status === 'syncing'} />
          <SummaryCard icon="warning" label="Wymaga działania" value={`${statusCount('action_required')}`} description="Sprawdź dostęp i ograniczenia" tone={statusCount('action_required') > 0 ? 'warning' : undefined} onClick={() => filterByStatus('action_required')} active={sourceFilters.status === 'action_required'} />
        </div>
      ) : null}

      {area !== 'data-quality' && primaryAlert ? (
        <div className="pd-int-alert" data-tone={primaryAlert.tone}>
          <Icon decorative name="warning" size={16} />
          <div>
            <strong>{primaryAlert.title}</strong>
            <span>{primaryAlert.message}</span>
          </div>
          {primaryAlert.actionLabel && primaryAlert.sourceId ? (
            <Button
              onClick={() => {
                const source = runtimeStatus.sources.find(item => item.integrationId === primaryAlert.sourceId);
                if (source?.primaryAction.id === 'reauth' && source.canManage) onSourceCommand(source, 'reauth');
                else onOpenSource(primaryAlert.sourceId!);
              }}
              size="small"
            >
              {runtimeStatus.sources.find(source => source.integrationId === primaryAlert.sourceId)?.canManage ? primaryAlert.actionLabel : 'Zobacz szczegóły'}
            </Button>
          ) : null}
        </div>
      ) : null}

      {area === 'sources' ? (
        <SourcesView
          filters={sourceFilters}
          onFiltersChange={onSourceFiltersChange}
          onOpenSource={onOpenSource}
          onRequestDisconnect={onRequestDisconnect}
          onSourceCommand={onSourceCommand}
          sources={sources}
          allSources={runtimeStatus.sources}
          onConnect={() => onAreaChange('catalog')}
        />
      ) : null}

      {area === 'sources' && runtimeStatus.sources.length > 0 && <section className="pd-int-readiness-strip" aria-label="Wpływ danych na analizy">
        <div><Icon name="trend" size={20} /><div><h2>Gotowość Twoich analiz</h2><p>Połączenie źródła to pierwszy krok. Liczy się też kompletność danych.</p></div></div>
        <div className="pd-int-readiness-chips">{completeness.domains.map(domain => <button type="button" key={domain.id} onClick={() => onAreaChange('data-quality')}><span data-status={domain.status} />{domain.label}<small>{domain.status === 'COMPLETE' ? 'Gotowe' : domain.status === 'PARTIAL' ? 'Częściowe' : 'Brak danych'}</small></button>)}</div>
        <Button variant="ghost" size="small" onClick={() => onAreaChange('data-quality')}>Sprawdź jakość danych →</Button>
      </section>}

      {area === 'catalog' ? (
        <CatalogView
          canConnect={canConnect}
          filters={catalogFilters}
          onConnect={onConnect}
          onFiltersChange={onCatalogFiltersChange}
          onManageProvider={(source) => onOpenSource(source.integrationId)}
          providers={catalogProviders}
          sources={runtimeStatus.sources}
        />
      ) : null}

      {area === 'data-quality' ? (
        <DataQualityView completeness={completeness} logs={logs} />
      ) : null}
    </div>
  );
}

function SummaryCard({
  icon, description, onClick, active,
  label,
  suffix,
  tone,
  value,
}: {
  readonly icon: 'integration' | 'success' | 'data' | 'warning';
  readonly description: string;
  readonly onClick: () => void;
  readonly active: boolean;
  readonly label: string;
  readonly suffix?: string;
  readonly tone?: 'success' | 'warning';
  readonly value: string;
}) {
  return (
    <button type="button" className="pd-int-summary-card" onClick={onClick} aria-pressed={active}>
      <span className="pd-int-summary-card__label">{label}<Icon name={icon} size={16} /></span>
      <div className="pd-int-summary-card__value" data-tone={tone}>
        {value}
        {suffix ? <small>{suffix}</small> : null}
      </div>
      <span className="pd-int-summary-card__description">{description}<span aria-hidden="true">↗</span></span>
    </button>
  );
}

const sourceStatusToneMap: Record<string, DataTableStatusTone> = {
  'Brak danych': 'neutral',
  'Częściowo gotowe': 'warning',
  'Gotowe': 'success',
  'Odłączone': 'neutral',
  'Problem providera': 'danger',
  'Synchronizacja': 'default',
  'Wymaga działania': 'danger',
};

function SourcesView({
  allSources, onConnect,
  filters,
  onFiltersChange,
  onOpenSource,
  onRequestDisconnect,
  onSourceCommand,
  sources,
}: {
  readonly allSources: readonly IntegrationRuntimeSource[];
  readonly onConnect: () => void;
  readonly filters: IntegrationSourceFilters;
  readonly onFiltersChange: (filters: IntegrationSourceFilters) => void;
  readonly onOpenSource: (id: string, tab?: IntegrationWorkspaceTabId) => void;
  readonly onRequestDisconnect: (source: IntegrationRuntimeSource) => void;
  readonly onSourceCommand: (source: IntegrationRuntimeSource, actionId: IntegrationRuntimeSource['primaryAction']['id']) => void;
  readonly sources: readonly IntegrationRuntimeSource[];
}) {
  const sourceById = new Map(sources.map((source) => [source.integrationId, source] as const));
  const rows: DataRow[] = sources.map((source) => ({
    account: source.accountName ?? '',
    completeness: source.completeness.percentage,
    freshness: source.freshness.label,
    id: source.integrationId,
    impact: source.issue ? source.issue.message : source.impact.kpis.join(' · ') || 'Brak przypisanych KPI',
    source: source.providerDisplayName,
    status: resolveSourceSyntheticStatus(source).label,
  }));

  return (
    <section aria-label="Źródła danych" className="pd-int-panel">
      <div className="pd-int-list-heading"><div><h2>Twoje źródła <span>{allSources.length}</span></h2><p>Stan połączeń, świeżość i kompletność danych w jednym miejscu.</p></div></div>
      <div className="pd-int-toolbar">
        <SearchField
          debounceMs={150}
          hideLabel
          label="Szukaj źródła"
          loading={false}
          onQueryChange={(value) => onFiltersChange({ ...filters, query: value })}
          placeholder="Szukaj źródła lub konta…"
          query={filters.query}
          resultCount={null}
        />
        <div className="pd-int-filter-pills">
          {sourceStatusFilters.filter(item => ['all', 'ready', 'syncing', 'action_required'].includes(item.id) || filters.status === item.id || allSources.some(source => resolveSourceSyntheticStatus(source).id === item.id)).map((item) => (
            <button
              aria-pressed={filters.status === item.id}
              className="pd-int-filter-pill"
              data-active={filters.status === item.id}
              key={item.id}
              onClick={() => onFiltersChange({ ...filters, status: item.id })}
              type="button"
            >
              {item.label}
              <span>{allSources.filter(source => item.id === 'all' || resolveSourceSyntheticStatus(source).id === item.id).length}</span>
            </button>
          ))}
        </div>
      </div>

      <DataTable
        actionsLabel="Akcje"
        actionsMenuItems={(row) => [
          { id: 'sync', label: 'Synchronizuj teraz', disabled: !sourceById.get(String(row.id))?.canManage },
          { id: 'config', label: 'Konfiguracja' },
          { id: 'reauth', label: 'Połącz ponownie', disabled: !sourceById.get(String(row.id))?.canManage },
          { id: 'sep', kind: 'separator' },
          { destructive: true, id: 'disconnect', label: 'Odłącz', disabled: !sourceById.get(String(row.id))?.canManage },
        ]}
        actionsTriggerLabel="•••"
        ariaLabel="Źródła danych i jakość danych"
        summary={`Widoczne źródła: ${sources.length} z ${allSources.length}`}
        cellRenderers={{
          completeness: (row) => {
            const source = sourceById.get(String(row.id));
            if (!source) return null;
            const synthetic = resolveSourceSyntheticStatus(source);
            return (
              <div className="pd-int-completeness-cell">
                <div className="pd-int-completeness-track"><span data-tone={syntheticStatusTone(synthetic.id)} style={{ width: `${source.completeness.percentage}%` }} /></div>
                <span>{source.completeness.percentage}%</span>
              </div>
            );
          },
          openAction: (row) => {
            const source = sourceById.get(String(row.id));
            if (!source) return null;
            const needsAction = source.canManage && (source.primaryAction.id === 'reauth' || source.primaryAction.id === 'fix');
            return (
              <Button
                onClick={() => (
                  needsAction
                    ? onSourceCommand(source, source.primaryAction.id)
                    : onOpenSource(source.integrationId)
                )}
                size="small"
                variant={needsAction ? 'primary' : 'secondary'}
              >
                {needsAction ? source.primaryAction.label : 'Otwórz'}
              </Button>
            );
          },
          source: (row) => {
            const source = sourceById.get(String(row.id));
            if (!source) return null;
            return (
              <div className="pd-int-source-cell">
                <ProviderMark label={source.providerDisplayName} provider={source.provider} />
                <div>
                  <strong>{source.providerDisplayName}</strong>
                  <span>{source.accountName}</span>
                </div>
              </div>
            );
          },
        }}
        columns={[
          { id: 'source', label: 'Źródło / konto', width: 220 },
          { id: 'status', label: 'Stan' },
          { id: 'completeness', label: 'Kompletność danych' },
          { id: 'freshness', label: 'Ostatnia synchronizacja' },
          { id: 'impact', label: 'Wpływ na KPI' },
          { id: 'openAction', label: '' },
        ]}
        emptyMessage="Połącz pierwsze źródło danych, aby zobaczyć je na tej liście."
        emptyTitle="Brak połączonych źródeł"
        loading={false}
        noResults={sources.length === 0 && (filters.query !== '' || filters.status !== 'all' || filters.provider !== 'all')}
        noResultsMessage="Zmień filtry albo wyszukiwanie."
        onAction={(rowId, actionId) => {
          const source = sourceById.get(rowId);
          if (!source) return;
          if (actionId === 'config') {
            onOpenSource(source.integrationId, 'config');
            return;
          }
          if (actionId === 'disconnect') {
            onRequestDisconnect(source);
            return;
          }
          if (actionId === 'reauth') {
            onSourceCommand(source, 'reauth');
            return;
          }
          onSourceCommand(source, 'sync');
        }}
        rowCount={sources.length}
        rowHeaderColumnId="source"
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        statusColumn={{ columnId: 'status', label: 'Stan źródła', mapTone: sourceStatusToneMap }}
      />
      {sources.length === 0 && <div className="pd-int-empty-action"><Button variant="secondary" onClick={() => allSources.length ? onFiltersChange({ query: '', provider: 'all', status: 'all' }) : onConnect()}>{allSources.length ? 'Wyczyść filtry' : 'Połącz pierwsze źródło'}</Button></div>}
    </section>
  );
}

function IntegrationActionsMenu({
  items,
  onAction,
  triggerLabel = 'Więcej akcji',
}: {
  readonly items: readonly MenuItem[];
  readonly onAction: (id: string) => void;
  readonly triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  return (
    <Menu
      activeItemId={activeItemId}
      items={items}
      open={open}
      placement="bottom-end"
      trigger={(
        <button aria-label={triggerLabel} className="pd-int-icon-button" type="button">
          <span aria-hidden="true">•••</span>
        </button>
      )}
      onAction={(id) => {
        onAction(id);
        setOpen(false);
      }}
      onActiveItemIdChange={setActiveItemId}
      onOpenChange={setOpen}
    />
  );
}

function CatalogView({
  canConnect,
  filters,
  onConnect,
  onFiltersChange,
  onManageProvider,
  providers,
  sources,
}: {
  readonly canConnect: boolean;
  readonly filters: IntegrationCatalogFilters;
  readonly onConnect: (provider: IntegrationRuntimeCatalogProvider) => void;
  readonly onFiltersChange: (filters: IntegrationCatalogFilters) => void;
  readonly onManageProvider: (source: IntegrationRuntimeSource) => void;
  readonly providers: readonly IntegrationRuntimeCatalogProvider[];
  readonly sources: readonly IntegrationRuntimeSource[];
}) {
  return (
    <section aria-label="Katalog integracji" className="pd-int-panel">
      <div className="pd-int-source-set">
        <span className="pd-int-source-set__label">Twój zestaw źródeł</span>
        <span className="pd-int-source-set__item">Zapisane źródła: {sources.length}</span>
        <span className="pd-int-source-set__hint">Dostępne do połączenia w tym widoku: {providers.filter(provider => !provider.connectedCount && provider.connectable).length}</span>
      </div>

      <div className="pd-int-toolbar">
        <SearchField
          debounceMs={150}
          hideLabel
          label="Szukaj integracji"
          loading={false}
          onQueryChange={(value) => onFiltersChange({ ...filters, query: value })}
          placeholder="Szukaj integracji…"
          query={filters.query}
          resultCount={null}
        />
        <div className="pd-int-filter-pills">
          {catalogFilterOptions.map((item) => (
            <button
              className="pd-int-filter-pill"
              data-active={filters.category === item.id}
              key={item.id}
              onClick={() => onFiltersChange({ ...filters, category: item.id })}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pd-int-provider-grid">
        {providers.map((provider) => {
          const isConnected = provider.connectedCount > 0;
          const connectedSource = isConnected
            ? sources.find((source) => source.provider === provider.provider) ?? null
            : null;
          return (
            <article className="pd-int-provider-card" key={provider.provider}>
              <div className="pd-int-provider-card__head">
                <ProviderMark label={provider.displayName} provider={provider.provider} size="large" />
                {provider.connectedCount > 0 ? (
                  <StatusBadge status="Dostępność" text="Połączono" tone="success" />
                ) : !provider.connectable ? (
                  <StatusBadge status="Dostępność" text={provider.availabilityLabel} tone={providerAvailabilityTone(provider)} />
                ) : null}
              </div>
              <div>
                <strong>{provider.displayName}</strong>
                <span className="pd-int-provider-card__category">{provider.categoryLabel}</span>
              </div>
              <p className="pd-int-provider-card__copy">
                <strong>Pobierzemy:</strong> {provider.dataCollected.slice(0, 4).join(', ')}
              </p>
              <p className="pd-int-provider-card__copy">
                <strong>Odblokuje:</strong> {provider.unlocks.slice(0, 4).join(', ')}
              </p>
              <Button
                disabled={!connectedSource && (!provider.connectable || !canConnect)}
                title={!connectedSource && !canConnect ? 'Brak uprawnień do łączenia źródeł' : undefined}
                onClick={() => (connectedSource ? onManageProvider(connectedSource) : onConnect(provider))}
                size="small"
                variant={provider.connectedCount > 0 ? 'secondary' : 'primary'}
              >
                {provider.connectedCount > 0 ? 'Zarządzaj' : provider.connectable ? 'Połącz' : provider.availabilityLabel}
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DataQualityView({
  completeness,
  logs,
}: {
  readonly completeness: IntegrationsRuntimeView['completeness'];
  readonly logs: readonly IntegrationRuntimeLog[];
}) {
  return (
    <section aria-label="Jakość danych" className="pd-int-panel">
      <div>
        <h2 className="pd-int-section-title">Jakość danych</h2>
        <p className="pd-int-muted-text">{completeness.global.description}</p>
      </div>

      <div className="pd-int-quality-grid">
        <div className="pd-int-card">
          <span className="pd-int-card__eyebrow">Gotowość obszarów</span>
          <ul className="pd-int-readiness-list">
            {completeness.domains.map((domain) => (
              <li key={domain.id}>
                <span>{domain.label}</span>
                <span className="pd-int-readiness-status" data-status={domain.status}>
                  {domain.status === 'COMPLETE' ? 'Gotowe' : domain.status === 'PARTIAL' ? '▲ Częściowe' : '▲ Ograniczone'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pd-int-card">
          <span className="pd-int-card__eyebrow">Trend kompletności danych</span>
          <div className="pd-int-trend-placeholder">
            <svg height="100%" preserveAspectRatio="none" viewBox="0 0 320 100" width="100%">
              <polyline fill="none" points="0,64 40,58 80,62 120,44 160,48 200,32 240,36 280,20 320,24" stroke="var(--pd-brand-action)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
            <span>{completeness.global.percentage}% kompletności ogółem</span>
          </div>
        </div>

        <div className="pd-int-card pd-int-quality-grid__wide">
          <span className="pd-int-card__eyebrow">Pokrycie danych</span>
          <div className="pd-int-coverage-scroll">
            {completeness.sources.map((source) => (
              <div className="pd-int-coverage-row" key={source.integrationId}>
                <span className="pd-int-coverage-row__label">{source.providerDisplayName}</span>
                <div className="pd-int-coverage-row__days">
                  {source.completeness.days.slice(0, 30).reverse().map((day) => (
                    <span data-status={day.status} key={day.date} title={`${day.date} · ${day.status === 'COMPLETE' ? 'gotowe' : day.status === 'PARTIAL' ? 'częściowe' : 'brak danych'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pd-int-coverage-legend">
            <span><i data-status="COMPLETE" /> Gotowe</span>
            <span><i data-status="PARTIAL" /> Częściowe</span>
            <span><i data-status="MISSING" /> Brak danych</span>
            <span className="pd-int-muted-text">ostatnie 30 dni</span>
          </div>
        </div>

        <div className="pd-int-card pd-int-card--flush pd-int-quality-grid__wide">
          <span className="pd-int-card__eyebrow pd-int-card__eyebrow--padded">Historia synchronizacji</span>
          <DataTable
            ariaLabel="Historia pobrań danych"
            columns={[
              { id: 'source', label: 'Źródło' },
              { id: 'startedAt', label: 'Rozpoczęto' },
              { id: 'records', label: 'Rekordy', align: 'right' },
              { id: 'duration', label: 'Czas trwania', align: 'right' },
              { id: 'status', label: 'Status' },
            ]}
            emptyMessage="Brak zarejestrowanych synchronizacji."
            loading={false}
            noResults={false}
            rowCount={logs.length}
            rows={logs.map((log) => ({
              duration: formatDuration(log.durationMs),
              id: log.jobId,
              records: formatNumber(log.recordsWritten),
              source: log.providerDisplayName,
              startedAt: formatIntegrationDateTime(log.startedAt),
              status: log.statusLabel,
            }))}
            selectedRowIds={[]}
            sort={null}
            statusColumn={{
              columnId: 'status',
              label: 'Status synchronizacji',
              mapTone: {
                'Wymaga uwagi': 'danger',
                'W toku': 'default',
                'Zakończone': 'success',
              },
            }}
          />
        </div>

        {completeness.blockers.length > 0 ? (
          <div className="pd-int-quality-grid__wide">
            {completeness.blockers.map((blocker) => (
              <InlineNotice
                key={blocker.id}
                message={`${blocker.message} Wpływa na: ${blocker.blockedKpis.join(', ')}.`}
                title={blocker.title}
                tone="warning"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Integration Workspace: Przegląd / Dane / Synchronizacja / Konfiguracja  */
/* ---------------------------------------------------------------------- */

function ProviderWorkspace({
  activeTab,
  availableStreams,
  expandedRunId,
  logs,
  onBack,
  onDisconnect,
  onExpandRun,
  onSourceCommand,
  onTabChange,
  onUpdateScope,
  source,
}: {
  readonly activeTab: IntegrationWorkspaceTabId;
  readonly availableStreams: readonly string[];
  readonly expandedRunId: string | null;
  readonly logs: readonly IntegrationRuntimeLog[];
  readonly onBack: () => void;
  readonly onDisconnect: () => void;
  readonly onExpandRun: (id: string | null) => void;
  readonly onSourceCommand: (source: IntegrationRuntimeSource, actionId: IntegrationRuntimeSource['primaryAction']['id']) => void;
  readonly onTabChange: (tab: IntegrationWorkspaceTabId) => void;
  readonly onUpdateScope?: ((selectedStreams: readonly string[]) => Promise<void>) | undefined;
  readonly source: IntegrationRuntimeSource;
}) {
  const synthetic = resolveSourceSyntheticStatus(source);
  const isOutage = synthetic.id === 'provider_error';

  return (
    <div className="pd-int-workspace">
      <div className="pd-int-breadcrumb">
        <button onClick={onBack} type="button">
          <span aria-hidden="true">←</span>
          Integracje
        </button>
      </div>

      <header className="pd-int-workspace-header">
        <div className="pd-int-workspace-header__identity">
          <ProviderMark label={source.providerDisplayName} provider={source.provider} size="large" />
          <div>
            <div className="pd-int-workspace-header__title">
              <span>{source.providerDisplayName}</span>
              <span className="pd-int-workspace-header__category">{source.category === 'commerce' ? 'Sprzedaż i e-commerce' : source.category === 'advertising' ? 'Reklamy i PPC' : 'Analityka'}</span>
            </div>
            <div className="pd-int-workspace-header__meta">
              <span>{source.accountName}</span>
              <StatusBadge status="Stan integracji" text={synthetic.label} tone={syntheticStatusTone(synthetic.id)} />
            </div>
          </div>
        </div>
        <div className="pd-int-workspace-header__actions">
          <Button disabled={!source.canManage} onClick={() => onSourceCommand(source, 'sync')} size="small">Synchronizuj</Button>
          <IntegrationActionsMenu
            items={[
              { id: 'config', label: 'Konfiguracja' },
              { id: 'reauth', label: 'Połącz ponownie', disabled: !source.canManage },
              { id: 'sep', kind: 'separator' },
              { destructive: true, id: 'disconnect', label: 'Odłącz', disabled: !source.canManage },
            ]}
            onAction={(id) => {
              if (id === 'config') onTabChange('config');
              else if (id === 'disconnect') onDisconnect();
              else onSourceCommand(source, 'reauth');
            }}
          />
        </div>
      </header>

      <div className="pd-int-workspace-meta-row">
        <span>Ostatnia synchronizacja: <strong>{source.freshness.label}</strong></span>
        <span>Dane aktualne do: <strong>{formatIntegrationDateTime(source.freshness.lastSuccessfulSyncAt)}</strong></span>
      </div>

      <Tabs
        activation="automatic"
        activeId={activeTab}
        ariaLabel="Widok integracji"
        items={integrationWorkspaceTabs.map((tab) => ({
          id: tab.id,
          label: tab.label,
          panel: null,
        }))}
        onActiveIdChange={(id) => onTabChange(id as IntegrationWorkspaceTabId)}
        orientation="horizontal"
        size="compact"
      />

      <div className="pd-int-workspace-body">
        {isOutage ? <ProviderOutagePanel source={source} /> : null}
        {activeTab === 'overview' ? <OverviewTab source={source} /> : null}
        {activeTab === 'data' ? <DataTab source={source} /> : null}
        {activeTab === 'sync' ? (
          <SyncTab
            expandedRunId={expandedRunId}
            logs={logs}
            onExpandRun={onExpandRun}
            onSourceCommand={onSourceCommand}
            source={source}
          />
        ) : null}
        {activeTab === 'config' ? (
          <ConfigTab
            availableStreams={availableStreams}
            onDisconnect={onDisconnect}
            onSourceCommand={onSourceCommand}
            onUpdateScope={onUpdateScope}
            source={source}
          />
        ) : null}
      </div>
    </div>
  );
}

function ProviderOutagePanel({ source }: { readonly source: IntegrationRuntimeSource }) {
  return (
    <div className="pd-int-card pd-int-outage-card">
      <div className="pd-int-outage-card__title"><Icon decorative name="warning" size={16} />Problem providera</div>
      <p>{source.issue?.message ?? `${source.providerDisplayName} API nie odpowiada.`}</p>
      <p className="pd-int-muted-text">Ostatnie poprawne dane: {formatIntegrationDateTime(source.freshness.lastSuccessfulSyncAt)}</p>
      {source.impact.areas.length > 0 ? (
        <p className="pd-int-muted-text"><strong>Wpływ:</strong> {source.impact.areas.slice(0, 2).join(' / ')} — nieaktualne</p>
      ) : null}
      <p className="pd-int-muted-text">Inne źródła działają bez zakłóceń — PapaData izoluje awarię do tego jednego providera.</p>
    </div>
  );
}

function OverviewTab({ source }: { readonly source: IntegrationRuntimeSource }) {
  return (
    <div className="pd-int-tab-grid">
      <div className="pd-int-card">
        <span className="pd-int-card__eyebrow">Stan integracji</span>
        <div className="pd-int-kv"><span>Autoryzacja</span><strong>{source.lifecycleStatus === 'REAUTH_REQUIRED' ? 'Wygasła' : 'Gotowa'}</strong></div>
        <div className="pd-int-kv"><span>Synchronizacja</span><strong>{source.lifecycleStatus === 'FAILED' ? 'Przerwana' : source.syncStatus === 'RUNNING' ? 'W toku' : 'Gotowa'}</strong></div>
        <div className="pd-int-kv"><span>Świeżość</span><strong>{source.freshness.label}</strong></div>
        <div className="pd-int-kv"><span>Kompletność</span><strong>{source.completeness.percentage}%</strong></div>
        <div className="pd-int-kv"><span>Ostatni poprawny sync</span><strong>{formatIntegrationDateTime(source.freshness.lastSuccessfulSyncAt)}</strong></div>
      </div>
      <div className="pd-int-card">
        <span className="pd-int-card__eyebrow">Wpływ na PapaData</span>
        {source.objectReadiness.map((object) => (
          <div className="pd-int-kv" key={object.id}>
            <span>{object.label}</span>
            <StatusBadge status="Gotowość" text={object.status === 'COMPLETE' ? 'Gotowe' : object.status === 'PARTIAL' ? 'Częściowe' : 'Brak danych'} tone={object.status === 'COMPLETE' ? 'success' : object.status === 'PARTIAL' ? 'warning' : 'neutral'} />
          </div>
        ))}
        <div className="pd-int-kv pd-int-kv--top"><span>KPI</span><strong>{source.impact.kpis.length} powiązanych</strong></div>
      </div>
    </div>
  );
}

function DataTab({ source }: { readonly source: IntegrationRuntimeSource }) {
  return (
    <div className="pd-int-tab-grid">
      <div className="pd-int-card">
        <span className="pd-int-card__eyebrow">Zakres danych</span>
        <ul className="pd-int-check-list">
          {source.selectedStreams.map((stream) => (
            <li key={stream}><Icon decorative name="success" size={16} />{streamLabel(stream)}</li>
          ))}
        </ul>
      </div>
      <div className="pd-int-card">
        <span className="pd-int-card__eyebrow">Gotowość danych</span>
        {source.objectReadiness.map((object) => (
          <div className="pd-int-object-readiness" key={object.id}>
            <div className="pd-int-kv">
              <span>{object.label}</span>
              <StatusBadge status="Gotowość" text={object.status === 'COMPLETE' ? 'Gotowe' : object.status === 'PARTIAL' ? '▲ Częściowe' : 'Brak danych'} tone={object.status === 'COMPLETE' ? 'success' : object.status === 'PARTIAL' ? 'warning' : 'neutral'} />
            </div>
            {object.note ? <p className="pd-int-muted-text">{object.note}</p> : <p className="pd-int-muted-text">Kompletność {object.completeness}%</p>}
          </div>
        ))}
      </div>
      <div className="pd-int-card pd-int-quality-grid__wide">
        <span className="pd-int-card__eyebrow">Wpływ na KPI</span>
        <div className="pd-int-kpi-row">
          {source.impact.kpis.map((kpi) => (
            <span className="pd-int-kpi-chip" data-tone={source.issue ? 'warning' : 'success'} key={kpi}>{kpi}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SyncTab({
  expandedRunId,
  logs,
  onExpandRun,
  onSourceCommand,
  source,
}: {
  readonly expandedRunId: string | null;
  readonly logs: readonly IntegrationRuntimeLog[];
  readonly onExpandRun: (id: string | null) => void;
  readonly onSourceCommand: (source: IntegrationRuntimeSource, actionId: IntegrationRuntimeSource['primaryAction']['id']) => void;
  readonly source: IntegrationRuntimeSource;
}) {
  const expandedRun = logs.find((log) => log.jobId === expandedRunId) ?? logs[0] ?? null;

  return (
    <div className="pd-int-sync-grid">
      <div className="pd-int-card pd-int-card--flush">
        <span className="pd-int-card__eyebrow pd-int-card__eyebrow--padded">Historia synchronizacji</span>
        {logs.map((log) => (
          <button
            className="pd-int-run-row"
            data-active={expandedRun?.jobId === log.jobId}
            key={log.jobId}
            onClick={() => onExpandRun(log.jobId)}
            type="button"
          >
            <div>
              <strong>{formatIntegrationDateTime(log.startedAt)}</strong>
              <span data-tone={log.status}>{log.status === 'completed' ? '✓ Sukces' : log.status === 'running' ? '● W toku' : '▲ Częściowa'}</span>
            </div>
            <span className="pd-int-muted-text">{formatNumber(log.recordsWritten)} rekordów · {formatDuration(log.durationMs)}</span>
          </button>
        ))}
      </div>

      <div className="pd-int-card">
        <span className="pd-int-card__eyebrow">Przebieg {expandedRun ? `· ${formatIntegrationDateTime(expandedRun.startedAt)}` : ''}</span>
        {expandedRun?.stages ? (
          <>
            <ol className="pd-int-stage-list">
              {expandedRun.stages.map((stage) => (
                <StageRow key={stage.id} stage={stage} />
              ))}
            </ol>
            {expandedRun.impactNote ? (
              <div className="pd-int-stage-footer">
                <p><strong>Wpływ:</strong> {expandedRun.impactNote}</p>
                <Button disabled={!source.canManage} onClick={() => onSourceCommand(source, 'sync')} size="small" variant="secondary">Ponów zakres</Button>
              </div>
            ) : null}
          </>
        ) : (
          <p className="pd-int-muted-text">Wybierz zakończony przebieg z listy, aby zobaczyć etapy.</p>
        )}
      </div>
    </div>
  );
}

function StageRow({ stage }: { readonly stage: IntegrationSyncStage }) {
  return (
    <li className="pd-int-stage-row">
      <span className="pd-int-stage-row__icon" data-status={stage.status}>
        {stage.status === 'success' ? '✓' : stage.status === 'warning' ? '!' : stage.status === 'error' ? '✕' : '○'}
      </span>
      <div>
        <strong data-status={stage.status}>{stage.label}</strong>
        <p>{stage.detail ?? `${formatNumber(stage.recordCount)} rekordów`}</p>
      </div>
    </li>
  );
}

function ConfigTab({
  availableStreams,
  onDisconnect,
  onSourceCommand,
  onUpdateScope,
  source,
}: {
  readonly availableStreams: readonly string[];
  readonly onDisconnect: () => void;
  readonly onSourceCommand: (source: IntegrationRuntimeSource, actionId: IntegrationRuntimeSource['primaryAction']['id']) => void;
  readonly onUpdateScope?: ((selectedStreams: readonly string[]) => Promise<void>) | undefined;
  readonly source: IntegrationRuntimeSource;
}) {
  const [editingScope, setEditingScope] = useState(false);
  const [scopeDraft, setScopeDraft] = useState<readonly string[]>(source.selectedStreams);
  const [savingScope, setSavingScope] = useState(false);

  function beginScopeEdit() {
    setScopeDraft(source.selectedStreams);
    setEditingScope(true);
  }

  async function saveScope() {
    if (!onUpdateScope || scopeDraft.length === 0) return;
    setSavingScope(true);
    try {
      await onUpdateScope(scopeDraft);
      setEditingScope(false);
    } catch {
      // Parent presents the operation error; keep the editor open for correction/retry.
    } finally {
      setSavingScope(false);
    }
  }

  return (
    <div className="pd-int-tab-grid">
      <div className="pd-int-card">
        <span className="pd-int-card__eyebrow">Konfiguracja</span>
        <div className="pd-int-kv"><span>Połączone konto</span><strong>{source.accountName}</strong></div>
        <div className="pd-int-kv"><span>Identyfikator</span><strong>{source.externalAccountIdMasked}</strong></div>
        <div className="pd-int-kv"><span>Zakres danych</span><strong>{source.selectedStreams.length} strumieni</strong></div>
        <div className="pd-int-kv"><span>Harmonogram synchronizacji</span><strong>{source.schedule}</strong></div>
        <div className="pd-int-kv"><span>Backfill historyczny</span><strong>{source.initialBackfill.completedDays} / {source.initialBackfill.coverageDays} dni</strong></div>
        <div className="pd-int-kv"><span>Autoryzacja</span><strong>{authLabel(source.authType)}</strong></div>

        {editingScope ? (
          <div className="pd-int-config-scope-editor" aria-label="Edycja zakresu danych">
            <div>
              <strong>Zakres synchronizacji</strong>
              <p className="pd-int-muted-text">Wybierz co najmniej jeden strumień. Zmiana zacznie obowiązywać przy kolejnej synchronizacji.</p>
            </div>
            <div className="pd-int-config-scope-grid">
              {availableStreams.map((stream) => (
                <Checkbox
                  checked={scopeDraft.includes(stream)}
                  key={stream}
                  label={streamLabel(stream)}
                  onChange={() => setScopeDraft((current) => (
                    current.includes(stream)
                      ? current.filter((item) => item !== stream)
                      : [...current, stream]
                  ))}
                  value={stream}
                />
              ))}
            </div>
            <div className="pd-int-config-scope-actions">
              <Button disabled={savingScope} onClick={() => setEditingScope(false)} size="small" variant="ghost">Anuluj</Button>
              <Button
                disabled={scopeDraft.length === 0 || savingScope}
                loading={savingScope}
                loadingLabel="Zapisywanie…"
                onClick={() => void saveScope()}
                size="small"
              >
                Zapisz zakres
              </Button>
            </div>
          </div>
        ) : null}

        <div className="pd-int-config-actions">
          {onUpdateScope ? <Button disabled={!source.canManage} onClick={beginScopeEdit} size="small" variant="secondary">Edytuj zakres</Button> : null}
          <Button disabled={!source.canManage} onClick={() => onSourceCommand(source, 'sync')} size="small" variant="secondary">Synchronizuj teraz</Button>
          <Button disabled={!source.canManage} onClick={() => onSourceCommand(source, 'reauth')} size="small" variant="secondary">Połącz ponownie</Button>
        </div>
      </div>

      <div className="pd-int-card pd-int-danger-zone">
        <span className="pd-int-card__eyebrow pd-int-card__eyebrow--danger">Strefa niebezpieczna</span>
        <p className="pd-int-muted-text">Odłączenie zatrzyma synchronizację. Historyczne dane pozostają dostępne w analizach.</p>
        <Button disabled={!source.canManage} onClick={onDisconnect} size="small" variant="danger">Odłącz integrację</Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Connect wizard (5 steps)                                                */
/* ---------------------------------------------------------------------- */

function ConnectWizard({
  onClose,
  onCreateConnection,
  onProviderTest,
  onSaved,
  provider,
  showToast,
}: {
  readonly onClose: () => void;
  readonly onCreateConnection?: IntegrationsWorkspaceProps['onCreateConnection'];
  readonly onProviderTest?: IntegrationsWorkspaceProps['onProviderTest'];
  readonly onSaved: () => void;
  readonly provider: IntegrationRuntimeCatalogProvider | null;
  readonly showToast: (message: string, tone?: Toast['tone']) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [selectedStreams, setSelectedStreams] = useState<readonly string[]>([]);
  const [testResult, setTestResult] = useState<IntegrationProviderTestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [secretVisibility, setSecretVisibility] = useState<Record<string, boolean>>({});

  const open = provider !== null;

  function reset() {
    setStepIndex(0);
    setDraft({});
    setSelectedStreams(provider?.supportedStreams ?? []);
    setTestResult(null);
    setSaved(false);
    setSecretVisibility({});
  }

  if (!provider) return null;
  const step: WizardStepId = wizardStepDefs[stepIndex]?.id ?? 'account';
  const canSave = testResult?.canSave === true && testResult.provider === provider.provider;

  async function handleTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTesting(true);
    setTestResult(null);
    try {
      const result = onProviderTest
        ? await onProviderTest(provider!, draft)
        : {
          canSave: provider!.connectable,
          formValidation: { fieldErrors: {}, message: 'Dane mają poprawny format.', status: 'passed' as const },
          provider: provider!.provider,
          providerTest: { message: 'Połączenie zweryfikowane.', status: 'passed' as const },
        };
      setTestResult(result);
      showToast(result.canSave ? 'Połączenie zostało zweryfikowane.' : 'Nie udało się potwierdzić połączenia.', result.canSave ? 'success' : 'error');
    } catch (cause) {
      setTestResult({
        canSave: false,
        formValidation: { fieldErrors: {}, message: 'Nie udało się uruchomić testu połączenia.', status: 'failed' },
        provider: provider!.provider,
        providerTest: { message: cause instanceof Error ? cause.message : 'Spróbuj ponownie.', status: 'failed' },
      });
    } finally {
      setTesting(false);
    }
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await onCreateConnection?.(provider!, {
        credentialReference: draft.consumerKey ? `secret://${provider!.provider}` : `oauth://${provider!.provider}`,
        requestedScopes: selectedStreams,
      });
      setSaved(true);
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Nie udało się zapisać połączenia.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      closeOnEscape
      description={null}
      modal
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
          reset();
        }
      }}
      open={open}
      title={`Połącz ${provider.displayName}`}
    >
      <div className="pd-int-wizard">
        <div className="pd-int-wizard__intro">
          <ProviderMark label={provider.displayName} provider={provider.provider} size="large" />
          <span className="pd-int-muted-text">{authLabel(provider.authType)} · {provider.updateCadence}</span>
        </div>

        <ol className="pd-int-wizard-steps">
          {wizardStepDefs.map((item, index) => (
            <li data-state={index < stepIndex ? 'done' : index === stepIndex ? 'current' : 'upcoming'} key={item.id}>
              <span className="pd-int-wizard-steps__dot">{index < stepIndex ? '✓' : index + 1}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ol>

        {saved ? (
          <div className="pd-int-wizard-body">
            <p>Konto zostało uwierzytelnione.</p>
            <p className="pd-int-muted-text">Rozpoczynamy sprawdzanie zakresu i pierwsze pobranie danych.</p>
            <ol className="pd-int-stage-list">
              <li className="pd-int-stage-row"><span className="pd-int-stage-row__icon" data-status="success">✓</span><div><strong data-status="success">Uwierzytelnienie</strong></div></li>
              <li className="pd-int-stage-row"><span className="pd-int-stage-row__icon" data-status="pending">●</span><div><strong>Pierwsze pobranie</strong></div></li>
              <li className="pd-int-stage-row"><span className="pd-int-stage-row__icon" data-status="pending">○</span><div><strong>Walidacja danych</strong></div></li>
              <li className="pd-int-stage-row"><span className="pd-int-stage-row__icon" data-status="pending">○</span><div><strong>Gotowość KPI</strong></div></li>
            </ol>
          </div>
        ) : (
          <div className="pd-int-wizard-body">
            {step === 'account' ? (
              <TextField
                label="Nazwa źródła"
                onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft((current) => ({ ...current, displayName: event.target.value }))}
                placeholder={`${provider.displayName} produkcyjny`}
                value={draft.displayName ?? ''}
              />
            ) : null}

            {step === 'access' ? (
              provider.authType === 'oauth' ? (
                <div className="pd-int-oauth-panel">
                  <p>Zostaniesz przekierowany do {provider.displayName}, aby autoryzować dostęp.</p>
                  <Button onClick={() => setDraft((current) => ({ ...current, oauthAuthorized: 'true' }))} size="small" variant="secondary">
                    {draft.oauthAuthorized ? 'Autoryzowano ✓' : `Autoryzuj przez ${provider.displayName}`}
                  </Button>
                </div>
              ) : (
                <div className="pd-int-form-grid">
                  {providerFields(provider).filter((field) => field.name !== 'displayName').map((field) => (
                    field.secret ? (
                      <PasswordField
                        key={field.name}
                        label={field.label}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft((current) => ({ ...current, [field.name]: event.target.value }))}
                        onVisibilityChange={(visible) => setSecretVisibility((current) => ({ ...current, [field.name]: visible }))}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={draft[field.name] ?? ''}
                        visible={secretVisibility[field.name] ?? false}
                      />
                    ) : (
                      <TextField
                        inputType={field.type === 'url' ? 'url' : 'text'}
                        key={field.name}
                        label={field.label}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft((current) => ({ ...current, [field.name]: event.target.value }))}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={draft[field.name] ?? ''}
                      />
                    )
                  ))}
                </div>
              )
            ) : null}

            {step === 'scope' ? (
              <div className="pd-int-form-grid">
                {provider.supportedStreams.map((stream) => (
                  <Checkbox
                    checked={selectedStreams.includes(stream)}
                    key={stream}
                    label={streamLabel(stream)}
                    onChange={() => setSelectedStreams((current) => (
                      current.includes(stream) ? current.filter((item) => item !== stream) : [...current, stream]
                    ))}
                    value={stream}
                  />
                ))}
              </div>
            ) : null}

            {step === 'test' ? (
              <form onSubmit={(event) => void handleTest(event)}>
                <Button disabled={testing} loading={testing} loadingLabel="Testowanie…" type="submit">Testuj połączenie</Button>
                {testResult ? (
                  <p className="pd-int-test-result" data-status={testResult.providerTest.status}>
                    {testResult.formValidation.message} {testResult.providerTest.message}
                  </p>
                ) : (
                  <p className="pd-int-muted-text">Sprawdź połączenie, zanim je zapiszesz.</p>
                )}
              </form>
            ) : null}

            {step === 'sync' ? (
              <p>Wszystko gotowe. Zapisz, aby uwierzytelnić konto i rozpocząć pierwszą synchronizację.</p>
            ) : null}
          </div>
        )}

        <footer className="pd-int-wizard-footer">
          {saved ? (
            <Button onClick={() => { onSaved(); reset(); }} size="small">Zamknij</Button>
          ) : (
            <>
              <Button disabled={stepIndex === 0} onClick={() => setStepIndex((value) => Math.max(0, value - 1))} size="small" variant="secondary">Wstecz</Button>
              {step === 'sync' ? (
                <Button disabled={saving} loading={saving} loadingLabel="Zapisywanie…" onClick={() => void handleFinish()} size="small">Zakończ</Button>
              ) : (
                <Button
                  disabled={step === 'test' && !canSave}
                  onClick={() => setStepIndex((value) => Math.min(wizardStepDefs.length - 1, value + 1))}
                  size="small"
                >
                  Dalej
                </Button>
              )}
            </>
          )}
        </footer>
      </div>
    </Dialog>
  );
}

/* ---------------------------------------------------------------------- */
/* Shared bits                                                             */
/* ---------------------------------------------------------------------- */

function ProviderMark({
  label,
  provider,
  size = 'default',
}: {
  readonly label: string;
  readonly provider: IntegrationProviderId;
  readonly size?: 'default' | 'large';
}) {
  return (
    <span aria-hidden="true" className="pd-int-provider-mark" data-provider={provider} data-size={size}>
      {({ woocommerce: 'Woo', shopify: 'S', baselinker: 'BL', allegro: 'a', google_ads: 'Ads', meta_ads: 'm', ga4: 'GA4' } as const)[provider] ?? label.slice(0, 2).toUpperCase()}
    </span>
  );
}

function authLabel(authType: IntegrationRuntimeCatalogProvider['authType']): string {
  switch (authType) {
    case 'oauth':
      return 'Konto OAuth2';
    case 'api_key':
      return 'API Key';
    case 'basic_auth':
      return 'Basic Auth';
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
      { label: 'Nazwa źródła', name: 'displayName', placeholder: `${provider.displayName} produkcyjny`, required: true, secret: false, type: 'text' },
    ];
  }
  return [
    { label: 'Nazwa źródła', name: 'displayName', placeholder: `Sklep produkcyjny ${provider.displayName}`, required: true, secret: false, type: 'text' },
    { label: 'Adres sklepu', name: 'storeUrl', placeholder: 'https://sklep.example.com', required: provider.provider === 'woocommerce', secret: false, type: provider.provider === 'woocommerce' ? 'url' : 'text' },
    { label: provider.provider === 'baselinker' ? 'Token dostępu' : 'Klucz dostępu', name: 'consumerKey', placeholder: provider.provider === 'baselinker' ? 'token_live_...' : 'ck_live_...', required: true, secret: true, type: 'text' },
    { label: 'Sekret dostępu', name: 'consumerSecret', placeholder: 'cs_live_...', required: provider.provider === 'woocommerce', secret: true, type: 'text' },
  ];
}
