import type {
  DataColumn,
  DataRow,
} from '../../../../../../../contracts/component-shared';

export type IntegrationScreenId =
  | '40.01'
  | '40.02'
  | '40.03'
  | '40.04'
  | '40.05'
  | '40.06'
  | '40.07'
  | '40.08'
  | '40.09'
  | '40.10';

export type IntegrationScreenVariant =
  | 'catalog'
  | 'connect'
  | 'detail'
  | 'history'
  | 'sync-run'
  | 'scope'
  | 'reconnect'
  | 'disconnect'
  | 'provider-outage'
  | 'variants';

export type IntegrationScreenDefinition = {
  readonly apiPath: `/api/v1/${string}`;
  readonly displayTitle: string;
  readonly id: IntegrationScreenId;
  readonly navigation: boolean;
  readonly operationId: string;
  readonly requiresResourceId: boolean;
  readonly route: `/app/${string}`;
  readonly routeBase: `/app/${string}`;
  readonly summary: string;
  readonly variant: IntegrationScreenVariant;
};

export type IntegrationRecord = {
  readonly id: string;
  readonly name: string;
  readonly provider: string;
  readonly status: 'connected' | 'degraded' | 'disconnected' | 'syncing';
  readonly owner: string;
  readonly lastSyncAt: string | null;
  readonly objects: number;
  readonly errors: number;
};

export type IntegrationEvent = {
  readonly id: string;
  readonly title: string;
  readonly status: 'done' | 'failed' | 'running' | 'queued';
  readonly timestamp: string;
  readonly detail: string;
};

export type IntegrationsData = {
  readonly generatedAt: string;
  readonly integrations: readonly IntegrationRecord[];
  readonly events: readonly IntegrationEvent[];
  readonly selectedIntegration: IntegrationRecord | null;
  readonly summary: {
    readonly connected: number;
    readonly degraded: number;
    readonly disconnected: number;
    readonly syncing: number;
    readonly total: number;
  };
};

export const integrationScreenDefinitions: readonly IntegrationScreenDefinition[] = [
  {
    apiPath: '/api/v1/integrations/catalog',
    displayTitle: 'Katalog integracji',
    id: '40.01',
    navigation: true,
    operationId: 'integrations.catalog.read',
    requiresResourceId: false,
    route: '/app/integrations/katalog',
    routeBase: '/app/integrations/katalog',
    summary: 'Lista dostępnych i połączonych integracji ze stanem gotowości, właścicielem i ostatnią synchronizacją.',
    variant: 'catalog',
  },
  {
    apiPath: '/api/v1/integrations/connect',
    displayTitle: 'Kreator połączenia',
    id: '40.02',
    navigation: true,
    operationId: 'integrations.connection.wizard.read',
    requiresResourceId: false,
    route: '/app/integrations/kreator-polaczenia',
    routeBase: '/app/integrations/kreator-polaczenia',
    summary: 'Kroki połączenia providera z zakresem uprawnień, autoryzacją i testem połączenia.',
    variant: 'connect',
  },
  {
    apiPath: '/api/v1/integrations/detail',
    displayTitle: 'Szczegóły integracji',
    id: '40.03',
    navigation: false,
    operationId: 'integrations.detail.read',
    requiresResourceId: true,
    route: '/app/integrations/szczegoly/:resourceId',
    routeBase: '/app/integrations/szczegoly',
    summary: 'Szczegół integracji z zakresem danych, statusem i historią ostatnich zdarzeń.',
    variant: 'detail',
  },
  {
    apiPath: '/api/v1/integrations/sync-history',
    displayTitle: 'Historia synchronizacji',
    id: '40.04',
    navigation: true,
    operationId: 'integrations.sync.history.read',
    requiresResourceId: false,
    route: '/app/integrations/historia-synchronizacji',
    routeBase: '/app/integrations/historia-synchronizacji',
    summary: 'Chronologiczny rejestr synchronizacji, błędów i ręcznych ponowień.',
    variant: 'history',
  },
  {
    apiPath: '/api/v1/integrations/sync-run',
    displayTitle: 'Przebieg synchronizacji',
    id: '40.05',
    navigation: true,
    operationId: 'integrations.sync.run.read',
    requiresResourceId: false,
    route: '/app/integrations/przebieg-synchronizacji',
    routeBase: '/app/integrations/przebieg-synchronizacji',
    summary: 'Aktualny przebieg synchronizacji z etapami, kolejką i błędami źródła.',
    variant: 'sync-run',
  },
  {
    apiPath: '/api/v1/integrations/scope',
    displayTitle: 'Zakres synchronizacji',
    id: '40.06',
    navigation: true,
    operationId: 'integrations.sync.scope.read',
    requiresResourceId: false,
    route: '/app/integrations/zakres-synchronizacji',
    routeBase: '/app/integrations/zakres-synchronizacji',
    summary: 'Zakres obiektów, uprawnień i zbiorów danych objętych synchronizacją.',
    variant: 'scope',
  },
  {
    apiPath: '/api/v1/integrations/reconnect',
    displayTitle: 'Ponowne połączenie',
    id: '40.07',
    navigation: true,
    operationId: 'integrations.reconnect.read',
    requiresResourceId: false,
    route: '/app/integrations/ponowne-polaczenie',
    routeBase: '/app/integrations/ponowne-polaczenie',
    summary: 'Kontekst ponownego połączenia z wpływem na dane i potrzebą odnowienia autoryzacji.',
    variant: 'reconnect',
  },
  {
    apiPath: '/api/v1/integrations/disconnect',
    displayTitle: 'Odłączenie',
    id: '40.08',
    navigation: true,
    operationId: 'integrations.disconnect.read',
    requiresResourceId: false,
    route: '/app/integrations/odlaczenie',
    routeBase: '/app/integrations/odlaczenie',
    summary: 'Bezpieczny przegląd skutków odłączenia integracji przed operacją destrukcyjną.',
    variant: 'disconnect',
  },
  {
    apiPath: '/api/v1/integrations/provider-outage',
    displayTitle: 'Awaria providera',
    id: '40.09',
    navigation: true,
    operationId: 'integrations.provider.outage.read',
    requiresResourceId: false,
    route: '/app/integrations/awaria-providera',
    routeBase: '/app/integrations/awaria-providera',
    summary: 'Stan awarii providera z wpływem na dane, retry i komunikatem dla operatora.',
    variant: 'provider-outage',
  },
  {
    apiPath: '/api/v1/integrations/variants',
    displayTitle: 'Warianty integracji',
    id: '40.10',
    navigation: true,
    operationId: 'integrations.variants.read',
    requiresResourceId: false,
    route: '/app/integrations/warianty-integracji',
    routeBase: '/app/integrations/warianty-integracji',
    summary: 'Zbiorczy widok stanów connected, syncing, degraded, disconnected, outage, empty i forbidden.',
    variant: 'variants',
  },
] as const;

export const integrationColumns: readonly DataColumn[] = [
  { id: 'name', label: 'Integracja', sortable: true, width: 240 },
  { id: 'provider', label: 'Provider', sortable: true },
  { id: 'statusLabel', label: 'Status', sortable: true },
  { id: 'owner', label: 'Właściciel', sortable: true },
  { id: 'lastSyncAt', label: 'Ostatnia synchronizacja', sortable: true },
  { align: 'right', id: 'objects', label: 'Obiekty', sortable: true },
  { align: 'right', id: 'errors', label: 'Błędy', sortable: true },
];

const generatedAt = '2026-08-14T09:30:00+02:00';

const integrationRecords: readonly IntegrationRecord[] = [
  { errors: 0, id: 'shopify', lastSyncAt: '2026-08-14T08:56:00+02:00', name: 'Shopify Orders', objects: 18420, owner: 'Operacje przychodu', provider: 'Shopify', status: 'connected' },
  { errors: 2, id: 'google-ads', lastSyncAt: '2026-08-14T08:40:00+02:00', name: 'Google Ads', objects: 1280, owner: 'Media płatne', provider: 'Google', status: 'degraded' },
  { errors: 0, id: 'ga4', lastSyncAt: '2026-08-14T09:20:00+02:00', name: 'GA4 Events', objects: 420000, owner: 'Analityka', provider: 'Google', status: 'syncing' },
  { errors: 0, id: 'meta-ads', lastSyncAt: '2026-08-13T22:10:00+02:00', name: 'Meta Ads', objects: 940, owner: 'Media płatne', provider: 'Meta', status: 'connected' },
  { errors: 1, id: 'mailchimp', lastSyncAt: null, name: 'Mailchimp Audiences', objects: 0, owner: 'CRM i retencja', provider: 'Mailchimp', status: 'disconnected' },
];

const integrationEvents: readonly IntegrationEvent[] = [
  { detail: 'Zamówienia i refundacje zsynchronizowane bez błędów.', id: 'evt-01', status: 'done', timestamp: '2026-08-14T08:56:00+02:00', title: 'Shopify Orders zakończone' },
  { detail: 'Część kosztów kampanii wymaga ponowienia po stronie Google Ads.', id: 'evt-02', status: 'failed', timestamp: '2026-08-14T08:41:00+02:00', title: 'Google Ads częściowo niekompletne' },
  { detail: 'Kompakcja eventów trwa; dane będą oznaczone jako częściowe do końca przebiegu.', id: 'evt-03', status: 'running', timestamp: '2026-08-14T09:20:00+02:00', title: 'GA4 Events w toku' },
  { detail: 'Ponowne pobranie audiences czeka na odnowienie tokenu.', id: 'evt-04', status: 'queued', timestamp: '2026-08-14T09:24:00+02:00', title: 'Mailchimp w kolejce' },
];

export function findIntegrationScreenDefinition(
  idOrRoute: string,
): IntegrationScreenDefinition | null {
  const normalized = idOrRoute.split('?')[0] ?? idOrRoute;
  return integrationScreenDefinitions.find((definition) => (
    definition.id === idOrRoute
    || definition.routeBase === normalized
    || (
      definition.requiresResourceId
      && normalized.startsWith(`${definition.routeBase}/`)
    )
  )) ?? null;
}

export function getIntegrationNavigation() {
  return integrationScreenDefinitions
    .filter((definition) => definition.navigation)
    .map((definition) => ({
      href: definition.routeBase,
      id: definition.id,
      label: definition.displayTitle,
    }));
}

export function createIntegrationsStorybookData(
  definition: IntegrationScreenDefinition,
): IntegrationsData {
  const selectedIntegration = definition.requiresResourceId
    ? integrationRecords[0] ?? null
    : null;
  const summary = {
    connected: integrationRecords.filter((item) => item.status === 'connected').length,
    degraded: integrationRecords.filter((item) => item.status === 'degraded').length,
    disconnected: integrationRecords.filter((item) => item.status === 'disconnected').length,
    syncing: integrationRecords.filter((item) => item.status === 'syncing').length,
    total: integrationRecords.length,
  };

  return {
    events: integrationEvents,
    generatedAt,
    integrations: integrationRecords,
    selectedIntegration,
    summary,
  };
}

export function integrationRows(
  records: readonly IntegrationRecord[],
): readonly DataRow[] {
  return records.map((record) => ({
    errors: record.errors,
    id: record.id,
    lastSyncAt: record.lastSyncAt ? formatDateTime(record.lastSyncAt) : 'Wymaga połączenia',
    name: record.name,
    objects: record.objects.toLocaleString('pl-PL'),
    owner: record.owner,
    provider: record.provider,
    status: record.status,
    statusLabel: resolveIntegrationStatusLabel(record.status),
  }));
}

export function resolveIntegrationStatusLabel(
  status: IntegrationRecord['status'],
) {
  switch (status) {
    case 'connected':
      return 'Połączona';
    case 'degraded':
      return 'Częściowa';
    case 'disconnected':
      return 'Odłączona';
    case 'syncing':
      return 'Synchronizacja';
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}

export type IntegrationRuntimeTabId =
  | 'sources'
  | 'add'
  | 'data-health';

export type IntegrationProviderId =
  | 'woocommerce'
  | 'shopify'
  | 'baselinker'
  | 'allegro'
  | 'google_ads'
  | 'meta_ads'
  | 'ga4';

export type ProviderReadiness =
  | 'production_ready'
  | 'pilot_ready'
  | 'runtime_flagged'
  | 'internal_only'
  | 'disabled';

export type EnvironmentStatus =
  | 'ready'
  | 'missing'
  | 'disabled'
  | 'not_required';

export type RuntimeSourceBusinessStatus =
  | 'working'
  | 'syncing'
  | 'action_required';

export type RuntimeCompletenessStatus =
  | 'COMPLETE'
  | 'PARTIAL'
  | 'MISSING';

export type IntegrationRuntimeLog = {
  readonly jobId: string;
  readonly integrationId: string;
  readonly provider: IntegrationProviderId;
  readonly providerDisplayName: string;
  readonly type: string;
  readonly startedAt: string | null;
  readonly finishedAt: string | null;
  readonly durationMs: number | null;
  readonly status: 'completed' | 'running' | 'attention';
  readonly statusLabel: string;
  readonly recordsRead: number | null;
  readonly recordsWritten: number | null;
  readonly errorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly createdAt: string | null;
};

export type IntegrationCompletenessDay = {
  readonly date: string;
  readonly status: RuntimeCompletenessStatus;
  readonly recordCount: number;
  readonly latestIngestedAt: string | null;
};

export type IntegrationRuntimeSource = {
  readonly integrationId: string;
  readonly provider: IntegrationProviderId;
  readonly providerDisplayName: string;
  readonly displayName: string;
  readonly accountName: string | null;
  readonly externalAccountId: string | null;
  readonly externalAccountIdMasked: string | null;
  readonly category: 'commerce' | 'advertising' | 'analytics' | 'import';
  readonly authType: 'oauth' | 'api_key' | 'basic_auth';
  readonly providerReadiness: ProviderReadiness;
  readonly connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  readonly dataSourceStatus: 'ACTIVE' | 'DEGRADED' | 'DISCONNECTED' | 'DISABLED' | 'ERROR';
  readonly lifecycleStatus:
    | 'READY'
    | 'SYNCING'
    | 'REAUTH_REQUIRED'
    | 'RATE_LIMITED'
    | 'FAILED'
    | 'BLOCKED_BY_PLAN';
  readonly syncStatus: 'IDLE' | 'RUNNING' | 'FAILED' | 'SUCCEEDED';
  readonly businessStatus: RuntimeSourceBusinessStatus;
  readonly businessStatusLabel: string;
  readonly nextStep: string;
  readonly primaryAction: {
    readonly id:
      | 'details'
      | 'backfill'
      | 'sync'
      | 'reauth'
      | 'fix'
      | 'plan';
    readonly label: string;
  };
  readonly canManage: boolean;
  readonly blockedByPlan: boolean;
  readonly initialBackfill: {
    readonly status: 'NOT_STARTED' | 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
    readonly progress: number;
    readonly coverageDays: number;
    readonly completedDays: number;
    readonly lastBackfillAt: string | null;
  };
  readonly latestSyncRun: IntegrationRuntimeLog | null;
  readonly completeness: {
    readonly percentage: number;
    readonly status: RuntimeCompletenessStatus;
    readonly days: readonly IntegrationCompletenessDay[];
  };
  readonly freshness: {
    readonly watermark: string | null;
    readonly lastSuccessfulSyncAt: string | null;
    readonly ageMinutes: number | null;
    readonly label: string;
  };
  readonly issue: {
    readonly code: string;
    readonly severity: 'error' | 'warning';
    readonly message: string;
  } | null;
  readonly impact: {
    readonly areas: readonly string[];
    readonly kpis: readonly string[];
    readonly ai: string;
  };
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
};

export type IntegrationRuntimeCatalogProvider = {
  readonly provider: IntegrationProviderId;
  readonly providerId: IntegrationProviderId;
  readonly displayName: string;
  readonly category: 'commerce' | 'advertising' | 'analytics' | 'import';
  readonly categoryLabel: string;
  readonly readiness: ProviderReadiness;
  readonly environmentStatus: EnvironmentStatus;
  readonly connectable: boolean;
  readonly availabilityLabel: string;
  readonly authType: 'oauth' | 'api_key' | 'basic_auth';
  readonly supportedStreams: readonly string[];
  readonly requiredScopes: readonly string[];
  readonly optionalScopes: readonly string[];
  readonly supportsWebhooks: boolean;
  readonly dataCollected: readonly string[];
  readonly unlocks: readonly string[];
  readonly updateCadence: string;
  readonly security: readonly string[];
  readonly limitations: readonly string[];
  readonly connectedCount: number;
};

export type IntegrationDomainReadiness = {
  readonly id: string;
  readonly label: string;
  readonly readiness: number;
  readonly status: RuntimeCompletenessStatus;
  readonly requiredSources: readonly string[];
  readonly connectedRequiredSources: readonly string[];
  readonly missingRequiredSources: readonly string[];
  readonly supportingSources: readonly string[];
  readonly blockedKpis: readonly string[];
};

export type IntegrationRuntimeStatus = {
  readonly generatedAt: string;
  readonly runtime: 'current';
  readonly plan: {
    readonly dataSourcesUsed: number;
    readonly dataSourcesLimit: number;
    readonly overLimit: boolean;
    readonly blockedByPlanCount: number;
  };
  readonly summary: {
    readonly activeSources: number;
    readonly actionRequired: number;
    readonly syncingSources: number;
    readonly completenessPercentage: number;
    readonly queuedBackfills: number;
    readonly runningBackfills: number;
    readonly lockedBackfills: number;
    readonly healthTitle: string;
    readonly healthDescription: string;
    readonly lastUpdatedAt: string;
  };
  readonly sources: readonly IntegrationRuntimeSource[];
  readonly alerts: readonly {
    readonly id: string;
    readonly sourceId: string | null;
    readonly tone: 'critical' | 'warning' | 'info';
    readonly title: string;
    readonly message: string;
    readonly actionLabel: string | null;
  }[];
};

export type IntegrationCatalogRuntime = {
  readonly generatedAt: string;
  readonly providers: readonly IntegrationRuntimeCatalogProvider[];
};

export type IntegrationLogsRuntime = {
  readonly generatedAt: string;
  readonly logs: readonly IntegrationRuntimeLog[];
};

export type IntegrationCompletenessRuntime = {
  readonly generatedAt: string;
  readonly global: {
    readonly title: string;
    readonly percentage: number;
    readonly description: string;
  };
  readonly domains: readonly IntegrationDomainReadiness[];
  readonly sources: readonly Pick<
    IntegrationRuntimeSource,
    'integrationId' | 'provider' | 'providerDisplayName' | 'displayName' | 'completeness' | 'freshness' | 'impact' | 'businessStatus'
  >[];
  readonly blockers: readonly {
    readonly id: string;
    readonly title: string;
    readonly message: string;
    readonly blockedKpis: readonly string[];
  }[];
};

export type IntegrationProviderTestResult = {
  readonly provider: IntegrationProviderId;
  readonly formValidation: {
    readonly status: 'passed' | 'failed';
    readonly message: string;
    readonly fieldErrors: Readonly<Record<string, string>>;
  };
  readonly providerTest: {
    readonly status: 'not_run' | 'passed' | 'failed';
    readonly message: string;
    readonly failureClass?: string;
    readonly retryAfterSeconds?: number | null;
  };
  readonly canSave: boolean;
};

export type IntegrationsRuntimeView = {
  readonly status: IntegrationRuntimeStatus;
  readonly catalog: IntegrationCatalogRuntime;
  readonly logs: IntegrationLogsRuntime;
  readonly completeness: IntegrationCompletenessRuntime;
  readonly demo: boolean;
};

export type IntegrationSourceFilters = {
  readonly query: string;
  readonly provider: 'all' | IntegrationProviderId;
  readonly status: 'all' | RuntimeSourceBusinessStatus;
};

export type IntegrationCatalogFilters = {
  readonly query: string;
  readonly category:
    | 'all'
    | 'available'
    | 'commerce'
    | 'advertising'
    | 'analytics'
    | 'import';
};

export const integrationRuntimeTabs: readonly {
  readonly href: `/app/integrations/${string}`;
  readonly id: IntegrationRuntimeTabId;
  readonly label: string;
}[] = [
  { href: '/app/integrations/sources', id: 'sources', label: 'Źródła danych' },
  { href: '/app/integrations/add', id: 'add', label: 'Dodaj źródło' },
  { href: '/app/integrations/data-health', id: 'data-health', label: 'Stan danych' },
];

const providerNames: Record<IntegrationProviderId, string> = {
  allegro: 'Allegro',
  baselinker: 'BaseLinker',
  ga4: 'Google Analytics 4',
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
};

const providerCategoryLabels: Record<IntegrationRuntimeCatalogProvider['category'], string> = {
  advertising: 'Reklama',
  analytics: 'Analityka i marketing',
  commerce: 'Sprzedaż i marketplace',
  import: 'Import danych',
};

export function resolveIntegrationRuntimeTab(path: string): IntegrationRuntimeTabId {
  if (
    path.includes('/add')
    || path.includes('/kreator-polaczenia')
    || path.includes('/katalog-integracji')
    || path.includes('/katalog')
  ) {
    return 'add';
  }
  if (
    path.includes('/data-health')
    || path.includes('/stan-danych')
    || path.includes('/logs-diagnostics')
    || path.includes('/historia-synchronizacji')
  ) {
    return 'data-health';
  }
  return 'sources';
}

export function filterIntegrationSources(
  sources: readonly IntegrationRuntimeSource[],
  filters: IntegrationSourceFilters,
): readonly IntegrationRuntimeSource[] {
  const normalizedQuery = normalizeSearch(filters.query);
  return sources.filter((source) => {
    if (filters.provider !== 'all' && source.provider !== filters.provider) return false;
    if (filters.status !== 'all' && source.businessStatus !== filters.status) return false;
    if (!normalizedQuery) return true;
    return [
      source.displayName,
      source.providerDisplayName,
      source.accountName,
      source.externalAccountId,
      source.externalAccountIdMasked,
    ].some((value) => normalizeSearch(value ?? '').includes(normalizedQuery));
  });
}

export function filterIntegrationCatalog(
  providers: readonly IntegrationRuntimeCatalogProvider[],
  filters: IntegrationCatalogFilters,
): readonly IntegrationRuntimeCatalogProvider[] {
  const normalizedQuery = normalizeSearch(filters.query);
  return providers.filter((provider) => {
    if (filters.category === 'available' && !provider.connectable) return false;
    if (
      filters.category !== 'all'
      && filters.category !== 'available'
      && provider.category !== filters.category
    ) {
      return false;
    }
    if (!normalizedQuery) return true;
    return [
      provider.displayName,
      provider.categoryLabel,
      provider.availabilityLabel,
      ...provider.dataCollected,
      ...provider.unlocks,
    ].some((value) => normalizeSearch(value).includes(normalizedQuery));
  });
}

export function sourceStatusTone(
  status: RuntimeSourceBusinessStatus,
): 'success' | 'processing' | 'critical' {
  switch (status) {
    case 'working':
      return 'success';
    case 'syncing':
      return 'processing';
    case 'action_required':
      return 'critical';
  }
}

export function completenessTone(
  status: RuntimeCompletenessStatus,
): 'success' | 'warning' | 'critical' {
  switch (status) {
    case 'COMPLETE':
      return 'success';
    case 'PARTIAL':
      return 'warning';
    case 'MISSING':
      return 'critical';
  }
}

export function logStatusTone(
  status: IntegrationRuntimeLog['status'],
): 'success' | 'processing' | 'critical' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'running':
      return 'processing';
    case 'attention':
      return 'critical';
  }
}

export function providerAvailabilityTone(
  provider: IntegrationRuntimeCatalogProvider,
): 'success' | 'warning' | 'neutral' | 'critical' {
  if (provider.connectable) return 'success';
  if (provider.environmentStatus === 'missing' || provider.readiness === 'pilot_ready') return 'warning';
  if (provider.readiness === 'disabled') return 'critical';
  return 'neutral';
}

export function formatIntegrationDateTime(value: string | null): string {
  if (!value) return 'Brak danych';
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}

export function formatDuration(value: number | null): string {
  if (value === null) return '—';
  const seconds = Math.round(value / 1000);
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes} min ${remainingSeconds} s`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
}

export function formatNumber(value: number | null): string {
  if (value === null) return '—';
  return value.toLocaleString('pl-PL');
}

export function createIntegrationsRuntimeFallbackData(
  generatedAt = '2026-08-26T10:18:00.000Z',
): IntegrationsRuntimeView {
  const days = createCompletenessDays(generatedAt, 90);
  const sources: readonly IntegrationRuntimeSource[] = [
    createRuntimeSource({
      account: 'Sklep Polska',
      completeness: 98,
      id: 'src-woocommerce',
      provider: 'woocommerce',
      status: 'working',
    }),
    createRuntimeSource({
      account: 'Paid Search PL',
      completeness: 82,
      id: 'src-google-ads',
      issue: {
        code: 'AUTH_INVALID',
        message: 'Autoryzacja Google wygasła. Dane nie aktualizują się od 6 godzin.',
        severity: 'error',
      },
      lifecycle: 'REAUTH_REQUIRED',
      provider: 'google_ads',
      status: 'action_required',
    }),
    createRuntimeSource({
      account: 'GA4 · papadata.pl',
      completeness: 61,
      id: 'src-ga4',
      lifecycle: 'SYNCING',
      provider: 'ga4',
      status: 'syncing',
    }),
    createRuntimeSource({
      account: 'Meta Ads · EU',
      completeness: 87,
      id: 'src-meta-ads',
      lifecycle: 'RATE_LIMITED',
      provider: 'meta_ads',
      status: 'syncing',
    }),
    createRuntimeSource({
      account: 'BaseLinker · marketplace',
      completeness: 95,
      id: 'src-baselinker',
      provider: 'baselinker',
      status: 'working',
    }),
  ];
  const status: IntegrationRuntimeStatus = {
    alerts: [
      {
        actionLabel: 'Połącz ponownie',
        id: 'src-google-ads:reauth',
        message: 'Google Ads nie aktualizuje danych. ROAS i CAC za dziś mają niższą pewność.',
        sourceId: 'src-google-ads',
        title: 'Google Ads wymaga ponownego połączenia',
        tone: 'critical',
      },
      {
        actionLabel: 'Szczegóły',
        id: 'src-meta-ads:rate-limit',
        message: 'Provider chwilowo ograniczył liczbę zapytań. PapaData ponowi pobieranie automatycznie.',
        sourceId: 'src-meta-ads',
        title: 'Meta Ads jest chwilowo ograniczony',
        tone: 'warning',
      },
    ],
    generatedAt,
    plan: {
      blockedByPlanCount: 0,
      dataSourcesLimit: 7,
      dataSourcesUsed: 5,
      overLimit: false,
    },
    runtime: 'current',
    sources,
    summary: {
      actionRequired: 1,
      activeSources: 5,
      completenessPercentage: 85,
      healthDescription: 'Google Ads wymaga ponownej autoryzacji. GA4 nadal pobiera historię danych.',
      healthTitle: '1 źródło wymaga działania',
      lastUpdatedAt: generatedAt,
      lockedBackfills: 1,
      queuedBackfills: 0,
      runningBackfills: 1,
      syncingSources: 2,
    },
  };
  const catalog = {
    generatedAt,
    providers: createCatalogProviders(),
  };
  const logs = {
    generatedAt,
    logs: [
      createRuntimeLog('job-01', 'src-woocommerce', 'woocommerce', 'backfill', 'completed', generatedAt),
      createRuntimeLog('job-02', 'src-google-ads', 'google_ads', 'incremental_sync', 'attention', generatedAt, 'AUTH_INVALID'),
      createRuntimeLog('job-03', 'src-ga4', 'ga4', 'backfill', 'running', generatedAt),
      createRuntimeLog('job-04', 'src-meta-ads', 'meta_ads', 'incremental_sync', 'running', generatedAt),
    ],
  };
  const completeness = {
    blockers: [
      {
        blockedKpis: ['ROAS', 'CAC'],
        id: 'paid_campaigns',
        message: 'Google Ads wymaga ponownej autoryzacji, a Meta Ads jest częściowe.',
        title: 'Kampanie płatne',
      },
    ],
    domains: [
      createDomain('sales_orders', 'Sprzedaż i zamówienia', 98, [], ['WooCommerce']),
      createDomain('traffic_behavior', 'Ruch i zachowanie', 61, [], ['Google Analytics 4']),
      createDomain('paid_campaigns', 'Kampanie płatne', 82, [], ['Google Ads', 'Meta Ads'], ['ROAS', 'CAC']),
      createDomain('products_inventory', 'Produkty i magazyn', 95, [], ['BaseLinker']),
      createDomain('customers_retention', 'Klienci i retencja', 98, [], ['WooCommerce']),
      createDomain('margin_costs', 'Marża i koszty', 82, [], ['WooCommerce', 'Google Ads'], ['Contribution margin']),
      createDomain('papa_assistant', 'Papa Asystent', 81, [], ['WooCommerce', 'GA4', 'Google Ads'], ['Pewność rekomendacji']),
    ],
    generatedAt,
    global: {
      description: 'Brakuje aktualnych danych Google Ads i części Meta Ads. ROAS oraz CAC mogą być zaniżone.',
      percentage: 85,
      title: 'Dane częściowo gotowe',
    },
    sources: sources.map((source) => ({
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

  return {
    catalog,
    completeness,
    demo: true,
    logs,
    status,
  };
}

function createRuntimeSource(input: {
  readonly account: string;
  readonly completeness: number;
  readonly id: string;
  readonly issue?: IntegrationRuntimeSource['issue'];
  readonly lifecycle?: IntegrationRuntimeSource['lifecycleStatus'];
  readonly provider: IntegrationProviderId;
  readonly status: RuntimeSourceBusinessStatus;
}): IntegrationRuntimeSource {
  const provider = providerNames[input.provider];
  const category = providerCategory(input.provider);
  const lifecycle = input.lifecycle ?? 'READY';
  const completenessStatus = input.completeness >= 95
    ? 'COMPLETE'
    : input.completeness > 0
      ? 'PARTIAL'
      : 'MISSING';
  const syncStatus = lifecycle === 'SYNCING' || lifecycle === 'RATE_LIMITED'
    ? 'RUNNING'
    : input.status === 'action_required'
      ? 'FAILED'
      : 'SUCCEEDED';
  const generatedAt = '2026-08-26T10:18:00.000Z';
  const days = adjustCompletenessDays(
    createCompletenessDays(generatedAt, 90, input.completeness),
    input.status,
    lifecycle,
    generatedAt,
  );
  return {
    accountName: input.account,
    authType: input.provider === 'woocommerce' || input.provider === 'baselinker' ? 'api_key' : 'oauth',
    blockedByPlan: lifecycle === 'BLOCKED_BY_PLAN',
    businessStatus: input.status,
    businessStatusLabel: businessStatusLabel(input.status),
    canManage: true,
    category,
    completeness: {
      days,
      percentage: input.completeness,
      status: completenessStatus,
    },
    connectionStatus: input.status === 'action_required' ? 'ERROR' : 'CONNECTED',
    createdAt: '2026-08-14T08:00:00.000Z',
    dataSourceStatus: input.status === 'action_required'
      ? 'ERROR'
      : completenessStatus === 'COMPLETE'
        ? 'ACTIVE'
        : 'DEGRADED',
    displayName: provider,
    externalAccountId: `${input.provider}:123456789`,
    externalAccountIdMasked: '123...789',
    freshness: {
      ageMinutes: input.status === 'action_required' ? 360 : 18,
      label: input.status === 'action_required' ? '6 h temu' : '18 min temu',
      lastSuccessfulSyncAt: '2026-08-26T09:58:00.000Z',
      watermark: '2026-08-26T09:58:00.000Z',
    },
    impact: providerImpact(input.provider),
    initialBackfill: {
      completedDays: Math.round((input.completeness / 100) * 90),
      coverageDays: 90,
      lastBackfillAt: '2026-08-24T22:00:00.000Z',
      progress: input.completeness,
      status: lifecycle === 'SYNCING' ? 'RUNNING' : 'SUCCEEDED',
    },
    integrationId: input.id,
    issue: input.issue ?? null,
    latestSyncRun: null,
    lifecycleStatus: lifecycle,
    nextStep: nextStepForLifecycle(lifecycle, input.status),
    primaryAction: primaryActionForLifecycle(lifecycle, input.status),
    provider: input.provider,
    providerDisplayName: provider,
    providerReadiness: input.provider === 'shopify' ? 'pilot_ready' : input.provider === 'allegro' ? 'internal_only' : 'production_ready',
    syncStatus,
    updatedAt: '2026-08-26T09:58:00.000Z',
  };
}

function createCatalogProviders(): readonly IntegrationRuntimeCatalogProvider[] {
  return ([
    'woocommerce',
    'baselinker',
    'google_ads',
    'meta_ads',
    'ga4',
    'shopify',
    'allegro',
  ] as const).map((provider) => {
    const category = providerCategory(provider);
    const readiness = provider === 'shopify'
      ? 'pilot_ready'
      : provider === 'allegro'
        ? 'internal_only'
        : 'production_ready';
    const connectable = readiness === 'production_ready';
    return {
      authType: provider === 'woocommerce' || provider === 'baselinker' ? 'api_key' : 'oauth',
      availabilityLabel: connectable ? 'Dostępne' : provider === 'shopify' ? 'Pilot' : 'Tylko wewnętrznie',
      category,
      categoryLabel: providerCategoryLabels[category],
      connectable,
      connectedCount: provider === 'shopify' || provider === 'allegro' ? 0 : 1,
      dataCollected: providerData(provider),
      displayName: providerNames[provider],
      environmentStatus: 'ready',
      limitations: connectable ? [] : ['Provider nie jest dopuszczony do produkcyjnego połączenia w tym runtime.'],
      optionalScopes: [],
      provider,
      providerId: provider,
      readiness,
      requiredScopes: provider === 'ga4' ? ['analytics.readonly'] : ['read'],
      security: [
        'Sekrety są zapisywane jako secret reference.',
        'Po zapisie credential nie jest ponownie pokazywany.',
        'Zmiana dostępu wymaga step-up authentication.',
      ],
      supportedStreams: providerStreams(provider),
      supportsWebhooks: provider === 'woocommerce' || provider === 'meta_ads',
      unlocks: providerUnlocks(provider),
      updateCadence: 'co godzinę po pierwszym pobraniu danych',
    } satisfies IntegrationRuntimeCatalogProvider;
  });
}

function createRuntimeLog(
  jobId: string,
  integrationId: string,
  provider: IntegrationProviderId,
  type: string,
  status: IntegrationRuntimeLog['status'],
  generatedAt: string,
  errorCode: string | null = null,
): IntegrationRuntimeLog {
  return {
    createdAt: generatedAt,
    durationMs: status === 'running' ? null : 184000,
    errorCode,
    finishedAt: status === 'running' ? null : generatedAt,
    integrationId,
    jobId,
    provider,
    providerDisplayName: providerNames[provider],
    recordsRead: status === 'attention' ? 1200 : 2480,
    recordsWritten: status === 'attention' ? 920 : 2478,
    safeErrorMessage: errorCode ? 'Provider odrzucił zapisany dostęp.' : null,
    startedAt: '2026-08-26T09:54:00.000Z',
    status,
    statusLabel: status === 'completed' ? 'Zakończone' : status === 'running' ? 'W toku' : 'Wymaga uwagi',
    type,
  };
}

function createDomain(
  id: string,
  label: string,
  readiness: number,
  missingRequiredSources: readonly string[],
  connectedRequiredSources: readonly string[],
  blockedKpis: readonly string[] = [],
): IntegrationDomainReadiness {
  return {
    blockedKpis,
    connectedRequiredSources,
    id,
    label,
    missingRequiredSources,
    readiness,
    requiredSources: connectedRequiredSources.length > 0 ? connectedRequiredSources : missingRequiredSources,
    status: readiness >= 95 ? 'COMPLETE' : readiness > 0 ? 'PARTIAL' : 'MISSING',
    supportingSources: [],
  };
}

function createCompletenessDays(
  generatedAt: string,
  length: number,
  percentage = 98,
): readonly IntegrationCompletenessDay[] {
  const now = new Date(generatedAt);
  const completeCount = Math.round((percentage / 100) * length);
  return Array.from({ length }, (_, index) => {
    const date = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - index,
    ));
    const complete = index < completeCount;
    return {
      date: date.toISOString().slice(0, 10),
      latestIngestedAt: complete ? generatedAt : null,
      recordCount: complete ? 120 + index : 0,
      status: complete ? 'COMPLETE' : 'MISSING',
    };
  });
}

function adjustCompletenessDays(
  days: readonly IntegrationCompletenessDay[],
  status: RuntimeSourceBusinessStatus,
  lifecycle: IntegrationRuntimeSource['lifecycleStatus'],
  generatedAt: string,
): readonly IntegrationCompletenessDay[] {
  if (status === 'action_required') {
    return days.map((day, index) => {
      if (index < 2) {
        return {
          ...day,
          latestIngestedAt: null,
          recordCount: 0,
          status: 'MISSING',
        };
      }
      if (index === 2) {
        return {
          ...day,
          latestIngestedAt: generatedAt,
          recordCount: Math.max(1, Math.floor(day.recordCount * 0.72)),
          status: 'PARTIAL',
        };
      }
      return day;
    });
  }

  if (lifecycle === 'SYNCING') {
    return days.map((day, index) => (
      index >= 4 && index <= 6
        ? {
          ...day,
          latestIngestedAt: generatedAt,
          recordCount: Math.max(1, Math.floor(day.recordCount * 0.65)),
          status: 'PARTIAL',
        }
        : day
    ));
  }

  if (lifecycle === 'RATE_LIMITED') {
    return days.map((day, index) => (
      index === 0
        ? {
          ...day,
          latestIngestedAt: generatedAt,
          recordCount: Math.max(1, Math.floor(day.recordCount * 0.82)),
          status: 'PARTIAL',
        }
        : day
    ));
  }

  return days;
}

function providerCategory(
  provider: IntegrationProviderId,
): IntegrationRuntimeCatalogProvider['category'] {
  if (provider === 'google_ads' || provider === 'meta_ads') return 'advertising';
  if (provider === 'ga4') return 'analytics';
  return 'commerce';
}

function providerStreams(provider: IntegrationProviderId): readonly string[] {
  if (provider === 'google_ads' || provider === 'meta_ads') return ['ad_spend', 'attributed_conversions'];
  if (provider === 'ga4') return ['traffic', 'events', 'conversions'];
  return ['orders', 'products', 'refunds', 'inventory'];
}

function providerData(provider: IntegrationProviderId): readonly string[] {
  if (provider === 'google_ads' || provider === 'meta_ads') {
    return ['koszt', 'kampanie', 'kliknięcia', 'wyświetlenia', 'konwersje'];
  }
  if (provider === 'ga4') {
    return ['sesje', 'użytkownicy', 'źródła ruchu', 'zdarzenia', 'konwersje'];
  }
  return ['zamówienia', 'produkty', 'refundacje', 'inventory'];
}

function providerUnlocks(provider: IntegrationProviderId): readonly string[] {
  if (provider === 'google_ads' || provider === 'meta_ads') {
    return ['ROAS', 'CAC', 'analiza kampanii', 'rekomendacje budżetowe'];
  }
  if (provider === 'ga4') {
    return ['analiza ruchu', 'konwersja', 'funnel', 'kontekst Papa Asystenta'];
  }
  return ['sprzedaż', 'przychód', 'AOV', 'produkty i magazyn'];
}

function providerImpact(provider: IntegrationProviderId): IntegrationRuntimeSource['impact'] {
  if (provider === 'google_ads' || provider === 'meta_ads') {
    return {
      ai: `Brak ${providerNames[provider]} ogranicza pewność rekomendacji dotyczących budżetu reklamowego.`,
      areas: ['Kampanie płatne', 'ROAS', 'CAC', 'Centrum Dowodzenia', 'Papa Asystent'],
      kpis: ['Wydatki reklamowe', 'ROAS', 'CAC', 'Konwersje'],
    };
  }
  if (provider === 'ga4') {
    return {
      ai: 'Brak GA4 ogranicza pewność odpowiedzi o ruchu, zachowaniu i ścieżce zakupowej.',
      areas: ['Ruch i zachowanie', 'Funnel', 'Konwersja', 'Centrum Dowodzenia', 'Papa Asystent'],
      kpis: ['Sesje', 'Użytkownicy', 'Konwersja', 'Źródła ruchu'],
    };
  }
  return {
    ai: `Brak ${providerNames[provider]} ogranicza pewność odpowiedzi o sprzedaży, produktach, klientach i marży.`,
    areas: ['Sprzedaż i zamówienia', 'Produkty i magazyn', 'Klienci i retencja', 'Centrum Dowodzenia'],
    kpis: ['Przychód', 'Zamówienia', 'AOV', 'Inventory'],
  };
}

function businessStatusLabel(status: RuntimeSourceBusinessStatus): string {
  switch (status) {
    case 'working':
      return 'Działa';
    case 'syncing':
      return 'Pobieranie danych';
    case 'action_required':
      return 'Wymaga działania';
  }
}

function nextStepForLifecycle(
  lifecycle: IntegrationRuntimeSource['lifecycleStatus'],
  status: RuntimeSourceBusinessStatus,
): string {
  if (lifecycle === 'REAUTH_REQUIRED') return 'Odśwież autoryzację';
  if (lifecycle === 'RATE_LIMITED') return 'Poczekaj na automatyczne ponowienie';
  if (lifecycle === 'SYNCING') return 'Poczekaj na zakończenie pobierania';
  if (lifecycle === 'BLOCKED_BY_PLAN') return 'Zwiększ limit planu';
  if (lifecycle === 'FAILED') return 'Sprawdź błąd synchronizacji';
  return status === 'working' ? 'Brak wymaganych działań' : 'Szczegóły źródła';
}

function primaryActionForLifecycle(
  lifecycle: IntegrationRuntimeSource['lifecycleStatus'],
  status: RuntimeSourceBusinessStatus,
): IntegrationRuntimeSource['primaryAction'] {
  if (lifecycle === 'REAUTH_REQUIRED') return { id: 'reauth', label: 'Połącz ponownie' };
  if (lifecycle === 'BLOCKED_BY_PLAN') return { id: 'plan', label: 'Zarządzaj planem' };
  if (lifecycle === 'FAILED') return { id: 'fix', label: 'Napraw' };
  if (status === 'working') return { id: 'sync', label: 'Pobierz najnowsze dane' };
  return { id: 'details', label: 'Szczegóły' };
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase('pl-PL');
}
