import type {
  DataColumn,
  DataRow,
} from '../../../../../contracts/component-shared';

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
