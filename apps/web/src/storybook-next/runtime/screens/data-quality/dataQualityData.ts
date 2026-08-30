import type {
  DataColumn,
  DataRow,
} from '../../../../../../../contracts/component-shared';
import type {
  DataSourceRef,
  EvidenceRef,
  ReadinessState,
  WorkspaceContext,
} from '../../../../../../../contracts/ui-contract-types';
import type {
  ComparisonChartDatum,
  ComparisonChartSeries,
  ShareChartSegment,
} from '../../../../design-system/index';

export type DataQualityScreenId =
  | '41.01'
  | '41.02'
  | '41.03'
  | '41.04'
  | '41.05'
  | '41.06'
  | '41.07'
  | '41.08'
  | '41.09'
  | '41.10';

export type DataQualityScreenVariant =
  | 'quality-center'
  | 'dataset'
  | 'lineage'
  | 'source-overlap'
  | 'source-priority'
  | 'conflicts'
  | 'manual-review'
  | 'reprocessing'
  | 'reconciliation'
  | 'variants';

export type DataQualityScreenDefinition = {
  readonly apiPath: `/api/v1/${string}` | null;
  readonly displayTitle: string;
  readonly id: DataQualityScreenId;
  readonly operationId: string | null;
  readonly route: `/app/${string}` | null;
  readonly routeBase: `/app/${string}` | null;
  readonly summary: string;
  readonly variant: DataQualityScreenVariant;
};

export type DataQualityDataset = {
  readonly id: string;
  readonly name: string;
  readonly owner: string;
  readonly readiness: ReadinessState;
  readonly freshnessAt: string;
  readonly completeness: number;
  readonly conflicts: number;
  readonly records: number;
};

export type DataQualityDiagnostic = {
  readonly id: string;
  readonly label: string;
  readonly severity: 'info' | 'warning' | 'critical';
  readonly source: string;
  readonly affectedRecords: number;
};

export type DataQualitySourceRecord = {
  readonly id: string;
  readonly label: string;
  readonly primarySource: string;
  readonly secondarySource: string;
  readonly overlapPercent: number;
  readonly confidence: number;
  readonly rule: string;
};

export type DataQualityConflictRecord = {
  readonly id: string;
  readonly entityType: string;
  readonly sourceA: string;
  readonly sourceB: string;
  readonly proposedResolution: string;
  readonly queue: 'manual' | 'auto' | 'blocked';
  readonly impact: 'low' | 'medium' | 'high';
};

export type DataQualityReviewItem = {
  readonly id: string;
  readonly title: string;
  readonly owner: string;
  readonly dueAt: string;
  readonly status: 'new' | 'review' | 'approved' | 'blocked';
  readonly confidence: number;
};

export type DataQualityVariantRecord = {
  readonly id: string;
  readonly variant: string;
  readonly condition: string;
  readonly composition: string;
  readonly limitation: string;
};

export type DataQualityWorkspaceData = {
  readonly generatedAt: string;
  readonly context: WorkspaceContext;
  readonly datasets: readonly DataQualityDataset[];
  readonly diagnostics: readonly DataQualityDiagnostic[];
  readonly evidence: readonly EvidenceRef[];
  readonly conflicts: readonly DataQualityConflictRecord[];
  readonly reviewItems: readonly DataQualityReviewItem[];
  readonly sources: readonly DataSourceRef[];
  readonly sourceRecords: readonly DataQualitySourceRecord[];
  readonly variants: readonly DataQualityVariantRecord[];
  readonly summary: {
    readonly readiness: ReadinessState;
    readonly completeDatasets: number;
    readonly partialDatasets: number;
    readonly staleDatasets: number;
    readonly conflicts: number;
  };
};

export const dataQualityScreenDefinitions: readonly DataQualityScreenDefinition[] = [
  {
    apiPath: '/api/v1/data-quality/centrum-jakosci',
    displayTitle: 'Centrum jakości',
    id: '41.01',
    operationId: 'data-quality.center.read',
    route: '/app/data-quality/centrum-jakosci',
    routeBase: '/app/data-quality/centrum-jakosci',
    summary: 'Stan gotowości, ograniczenia i najważniejsze blokady danych dla bieżącej przestrzeni pracy.',
    variant: 'quality-center',
  },
  {
    apiPath: '/api/v1/data-quality/zbior-danych',
    displayTitle: 'Zbiór danych',
    id: '41.02',
    operationId: 'data-quality.dataset.read',
    route: '/app/data-quality/zbior-danych',
    routeBase: '/app/data-quality/zbior-danych',
    summary: 'Lista zbiorów z kompletnością, świeżością i liczbą konfliktów wymagających decyzji.',
    variant: 'dataset',
  },
  {
    apiPath: '/api/v1/data-quality/pochodzenie-danych',
    displayTitle: 'Pochodzenie danych',
    id: '41.03',
    operationId: 'data-quality.lineage.read',
    route: '/app/data-quality/pochodzenie-danych',
    routeBase: '/app/data-quality/pochodzenie-danych',
    summary: 'Graf lineage pokazujący źródło, transformacje, metrykę i rekord końcowy.',
    variant: 'lineage',
  },
  {
    apiPath: '/api/v1/data-quality/nakladanie-zrodel',
    displayTitle: 'Nakładanie źródeł',
    id: '41.04',
    operationId: 'data-quality.source-overlap.read',
    route: '/app/data-quality/nakladanie-zrodel',
    routeBase: '/app/data-quality/nakladanie-zrodel',
    summary: 'Porównanie nakładania rekordów między źródłami i wpływ na pewność decyzji.',
    variant: 'source-overlap',
  },
  {
    apiPath: '/api/v1/data-quality/nadrzednosc-zrodla',
    displayTitle: 'Nadrzędność źródła',
    id: '41.05',
    operationId: 'data-quality.source-priority.read',
    route: '/app/data-quality/nadrzednosc-zrodla',
    routeBase: '/app/data-quality/nadrzednosc-zrodla',
    summary: 'Reguły priorytetu źródeł, udział rekordów i porównanie pewności decyzji.',
    variant: 'source-priority',
  },
  {
    apiPath: '/api/v1/data-quality/konflikty',
    displayTitle: 'Konflikty',
    id: '41.06',
    operationId: 'data-quality.conflicts.read',
    route: '/app/data-quality/konflikty',
    routeBase: '/app/data-quality/konflikty',
    summary: 'Lista konfliktów między źródłami, ich wpływ i kolejka rozstrzygnięcia.',
    variant: 'conflicts',
  },
  {
    apiPath: '/api/v1/data-quality/przeglad-reczny',
    displayTitle: 'Przegląd ręczny',
    id: '41.07',
    operationId: 'data-quality.manual-review.read',
    route: '/app/data-quality/przeglad-reczny',
    routeBase: '/app/data-quality/przeglad-reczny',
    summary: 'Kolejka rekordów wymagających decyzji człowieka wraz z poziomem pewności i terminami.',
    variant: 'manual-review',
  },
  {
    apiPath: '/api/v1/data-quality/ponowne-przetwarzanie',
    displayTitle: 'Ponowne przetwarzanie',
    id: '41.08',
    operationId: 'data-quality.reprocessing.read',
    route: '/app/data-quality/ponowne-przetwarzanie',
    routeBase: '/app/data-quality/ponowne-przetwarzanie',
    summary: 'Bezpieczny przegląd zakresu ponownego przetwarzania przed uruchomieniem zadania.',
    variant: 'reprocessing',
  },
  {
    apiPath: '/api/v1/data-quality/rekoncyliacja',
    displayTitle: 'Rekoncyliacja',
    id: '41.09',
    operationId: 'data-quality.reconciliation.read',
    route: '/app/data-quality/rekoncyliacja',
    routeBase: '/app/data-quality/rekoncyliacja',
    summary: 'Panel rekoncyliacji źródeł z proponowanym rozstrzygnięciem i śladem dowodów.',
    variant: 'reconciliation',
  },
  {
    apiPath: null,
    displayTitle: 'Warianty jakości danych',
    id: '41.10',
    operationId: null,
    route: null,
    routeBase: null,
    summary: 'Macierz wariantów jakości danych dla gotowości, konfliktów, przetwarzania i ograniczeń źródeł.',
    variant: 'variants',
  },
] as const;

export const dataQualityColumns: readonly DataColumn[] = [
  { id: 'name', label: 'Zbiór', sortable: true, width: 240 },
  { id: 'owner', label: 'Opiekun', sortable: true },
  { id: 'readinessLabel', label: 'Stan', sortable: true },
  { id: 'freshnessAt', label: 'Świeżość', sortable: true },
  { align: 'right', id: 'completeness', label: 'Kompletność', sortable: true },
  { align: 'right', id: 'records', label: 'Rekordy', sortable: true },
  { align: 'right', id: 'conflicts', label: 'Konflikty', sortable: true },
];

export const sourceQualityColumns: readonly DataColumn[] = [
  { id: 'label', label: 'Reguła', sortable: true, width: 260 },
  { id: 'primarySource', label: 'Źródło nadrzędne', sortable: true },
  { id: 'secondarySource', label: 'Źródło porównane', sortable: true },
  { align: 'right', id: 'overlapPercent', label: 'Nakładanie', sortable: true },
  { align: 'right', id: 'confidence', label: 'Pewność', sortable: true },
  { id: 'rule', label: 'Decyzja', sortable: false },
];

export const conflictColumns: readonly DataColumn[] = [
  { id: 'entityType', label: 'Encja', sortable: true },
  { id: 'sourceA', label: 'Źródło A', sortable: true },
  { id: 'sourceB', label: 'Źródło B', sortable: true },
  { id: 'impactLabel', label: 'Wpływ', sortable: true },
  { id: 'queueLabel', label: 'Kolejka', sortable: true },
  { id: 'proposedResolution', label: 'Propozycja', sortable: false, width: 280 },
];

export const reviewColumns: readonly DataColumn[] = [
  { id: 'title', label: 'Pozycja', sortable: true, width: 260 },
  { id: 'owner', label: 'Zespół', sortable: true },
  { id: 'statusLabel', label: 'Status', sortable: true },
  { align: 'right', id: 'confidence', label: 'Pewność', sortable: true },
  { id: 'dueAt', label: 'Termin', sortable: true },
];

export const variantColumns: readonly DataColumn[] = [
  { id: 'variant', label: 'Wariant', sortable: true, width: 220 },
  { id: 'condition', label: 'Warunek', sortable: false },
  { id: 'composition', label: 'Kompozycja', sortable: false },
  { id: 'limitation', label: 'Ograniczenie', sortable: false },
];

const generatedAt = '2026-08-14T10:10:00+02:00';

const datasets: readonly DataQualityDataset[] = [
  { completeness: 0.992, conflicts: 3, freshnessAt: '2026-08-14T09:42:00+02:00', id: 'orders', name: 'Zamówienia', owner: 'Operacje przychodu', readiness: 'ready', records: 18420 },
  { completeness: 0.947, conflicts: 18, freshnessAt: '2026-08-14T08:36:00+02:00', id: 'campaign-costs', name: 'Koszty kampanii', owner: 'Media płatne', readiness: 'partial', records: 1280 },
  { completeness: 0.884, conflicts: 27, freshnessAt: '2026-08-13T21:18:00+02:00', id: 'customers', name: 'Klienci', owner: 'CRM', readiness: 'stale', records: 92100 },
  { completeness: 0.972, conflicts: 6, freshnessAt: '2026-08-14T09:05:00+02:00', id: 'events', name: 'Zdarzenia GA4', owner: 'Analityka', readiness: 'partial', records: 420000 },
];

const diagnostics: readonly DataQualityDiagnostic[] = [
  { affectedRecords: 18, id: 'diag-cost-lag', label: 'Koszty Google Ads częściowe', severity: 'warning', source: 'Google Ads' },
  { affectedRecords: 27, id: 'diag-customer-stale', label: 'Klienci starsi niż SLA', severity: 'critical', source: 'CRM' },
  { affectedRecords: 6, id: 'diag-event-map', label: 'Mapowanie eventów wymaga reguły', severity: 'warning', source: 'GA4' },
];

const sources: readonly DataSourceRef[] = [
  { completeness: 0.992, dataset: 'orders', lastSyncAt: '2026-08-14T09:42:00+02:00', provider: 'Shopify' },
  { completeness: 0.947, dataset: 'campaign_costs', lastSyncAt: '2026-08-14T08:36:00+02:00', provider: 'Google Ads' },
  { completeness: 0.884, dataset: 'customers', lastSyncAt: '2026-08-13T21:18:00+02:00', provider: 'CRM' },
  { completeness: 0.972, dataset: 'events', lastSyncAt: '2026-08-14T09:05:00+02:00', provider: 'GA4' },
];

const evidence: readonly EvidenceRef[] = [
  { confidence: 0.91, id: 'ev-sync-window', label: 'Okno synchronizacji 08:30-09:45', source: 'Audyt synchronizacji' },
  { confidence: 0.86, id: 'ev-cost-gap', label: 'Rozbieżność kosztów kampanii', source: 'Google Ads' },
  { confidence: 0.79, id: 'ev-identity-map', label: 'Mapowanie tożsamości klientów', source: 'CRM + Shopify' },
];

const sourceRecords: readonly DataQualitySourceRecord[] = [
  { confidence: 0.94, id: 'dq-order-id', label: 'Identyfikator zamówienia', overlapPercent: 98.8, primarySource: 'Shopify', rule: 'Shopify wygrywa dla statusu i refundacji', secondarySource: 'Magazyn' },
  { confidence: 0.86, id: 'dq-campaign-cost', label: 'Koszt kampanii', overlapPercent: 91.2, primarySource: 'Google Ads', rule: 'Koszt z dostawcy, przychód z zamówień', secondarySource: 'Model atrybucji' },
  { confidence: 0.78, id: 'dq-customer-email', label: 'Tożsamość klienta', overlapPercent: 84.5, primarySource: 'CRM', rule: 'CRM wygrywa po pseudonimizowanym skrócie e-mail', secondarySource: 'Shopify' },
  { confidence: 0.82, id: 'dq-ga-session', label: 'Źródło sesji', overlapPercent: 88.1, primarySource: 'GA4', rule: 'GA4 wygrywa dla sesji, reklamy dla kosztu', secondarySource: 'Google Ads' },
];

const conflicts: readonly DataQualityConflictRecord[] = [
  { entityType: 'Zamówienie', id: 'dq-conflict-order-status', impact: 'medium', proposedResolution: 'Status z Shopify, refundacja z magazynu', queue: 'manual', sourceA: 'Shopify', sourceB: 'Magazyn' },
  { entityType: 'Kampania', id: 'dq-conflict-campaign-cost', impact: 'high', proposedResolution: 'Koszt z Google Ads po zakończeniu okna synchronizacji', queue: 'blocked', sourceA: 'Google Ads', sourceB: 'Model atrybucji' },
  { entityType: 'Klient', id: 'dq-conflict-customer-identity', impact: 'high', proposedResolution: 'CRM jako źródło nadrzędne po pseudonimizowanym skrócie', queue: 'manual', sourceA: 'CRM', sourceB: 'Shopify' },
  { entityType: 'Zdarzenie', id: 'dq-conflict-event-source', impact: 'low', proposedResolution: 'GA4 jako źródło sesji, reklamy jako źródło kosztu', queue: 'auto', sourceA: 'GA4', sourceB: 'Google Ads' },
];

const reviewItems: readonly DataQualityReviewItem[] = [
  { confidence: 0.78, dueAt: '2026-08-14T14:00:00+02:00', id: 'dq-review-identity', owner: 'CRM', status: 'review', title: 'Scalenie tożsamości klientów' },
  { confidence: 0.86, dueAt: '2026-08-14T16:30:00+02:00', id: 'dq-review-costs', owner: 'Media płatne', status: 'blocked', title: 'Rozbieżność kosztów Google Ads' },
  { confidence: 0.91, dueAt: '2026-08-15T10:00:00+02:00', id: 'dq-review-events', owner: 'Analityka', status: 'new', title: 'Mapowanie zdarzenia purchase_refund' },
];

const variants: readonly DataQualityVariantRecord[] = [
  { composition: 'Status danych + rejestr zbiorów', condition: 'Dane gotowe i świeże', id: 'dq-variant-ready', limitation: 'Nie ukrywać źródeł ani poziomu pewności', variant: 'gotowe' },
  { composition: 'Ostrzeżenie + diagnostyka + tabela', condition: 'Braki częściowe', id: 'dq-variant-partial', limitation: 'Nie pokazywać pełnej pewności', variant: 'częściowe' },
  { composition: 'Status danych + komunikat pamięci podręcznej', condition: 'Dane historyczne albo offline', id: 'dq-variant-offline', limitation: 'Mutacje zablokowane', variant: 'offline' },
  { composition: 'Panel rekoncyliacji + dowody', condition: 'Konflikty źródeł', id: 'dq-variant-conflict', limitation: 'Każda decyzja wymaga śladu audytu', variant: 'konflikt' },
];

export function findDataQualityScreenDefinition(
  idOrRoute: string,
): DataQualityScreenDefinition | null {
  const normalized = idOrRoute.split('?')[0] ?? idOrRoute;
  return dataQualityScreenDefinitions.find((definition) => (
    definition.id === idOrRoute
    || definition.routeBase === normalized
  )) ?? null;
}

export function getDataQualityNavigation() {
  return dataQualityScreenDefinitions
    .filter((definition) => definition.routeBase !== null)
    .map((definition) => ({
      href: definition.routeBase ?? '/app/data-quality/centrum-jakosci',
      id: definition.id,
      label: definition.displayTitle,
    }));
}

export function createDataQualityStorybookData(
  definition: DataQualityScreenDefinition,
): DataQualityWorkspaceData {
  return {
    context: {
      locale: 'pl',
      range: { from: '2026-08-01', preset: 'monthToDate', timezone: 'Europe/Warsaw', to: '2026-08-14' },
      tenantId: 'tenant-papadata-demo',
      userId: 'user-data-quality',
      workspaceId: 'workspace-commerce-pl',
    },
    datasets,
    diagnostics: definition.variant === 'dataset'
      ? diagnostics.filter((item) => item.severity !== 'critical')
      : diagnostics,
    evidence,
    conflicts,
    generatedAt,
    reviewItems,
    sourceRecords,
    sources,
    variants,
    summary: {
      completeDatasets: datasets.filter((dataset) => dataset.readiness === 'ready').length,
      conflicts: datasets.reduce((sum, dataset) => sum + dataset.conflicts, 0),
      partialDatasets: datasets.filter((dataset) => dataset.readiness === 'partial').length,
      readiness: definition.variant === 'source-priority' ? 'ready' : 'partial',
      staleDatasets: datasets.filter((dataset) => dataset.readiness === 'stale').length,
    },
  };
}

export function conflictRows(
  records: readonly DataQualityConflictRecord[],
): readonly DataRow[] {
  return records.map((record) => ({
    entityType: record.entityType,
    id: record.id,
    impact: record.impact,
    impactLabel: resolveImpactLabel(record.impact),
    proposedResolution: record.proposedResolution,
    queue: record.queue,
    queueLabel: resolveQueueLabel(record.queue),
    sourceA: record.sourceA,
    sourceB: record.sourceB,
  }));
}

export function reviewRows(
  records: readonly DataQualityReviewItem[],
): readonly DataRow[] {
  return records.map((record) => ({
    confidence: formatPercent(record.confidence),
    dueAt: formatDateTime(record.dueAt),
    id: record.id,
    owner: record.owner,
    status: record.status,
    statusLabel: resolveReviewStatusLabel(record.status),
    title: record.title,
  }));
}

export function variantRows(
  records: readonly DataQualityVariantRecord[],
): readonly DataRow[] {
  return records.map((record) => ({
    composition: record.composition,
    condition: record.condition,
    id: record.id,
    limitation: record.limitation,
    variant: record.variant,
  }));
}

export function dataQualityRows(
  records: readonly DataQualityDataset[],
): readonly DataRow[] {
  return records.map((record) => ({
    completeness: formatPercent(record.completeness),
    conflicts: record.conflicts,
    freshnessAt: formatDateTime(record.freshnessAt),
    id: record.id,
    name: record.name,
    owner: record.owner,
    readiness: record.readiness,
    readinessLabel: resolveReadinessLabel(record.readiness),
    records: record.records.toLocaleString('pl-PL'),
  }));
}

export function sourceQualityRows(
  records: readonly DataQualitySourceRecord[],
): readonly DataRow[] {
  return records.map((record) => ({
    confidence: formatPercent(record.confidence),
    id: record.id,
    label: record.label,
    overlapPercent: formatPercent(record.overlapPercent / 100),
    primarySource: record.primarySource,
    rule: record.rule,
    secondarySource: record.secondarySource,
  }));
}

export function readinessShareSegments(
  data: DataQualityWorkspaceData,
): readonly ShareChartSegment[] {
  return [
    { id: 'ready', label: 'Gotowe', percent: data.summary.completeDatasets / data.datasets.length * 100, value: data.summary.completeDatasets },
    { id: 'partial', label: 'Częściowe', percent: data.summary.partialDatasets / data.datasets.length * 100, value: data.summary.partialDatasets },
    { id: 'stale', label: 'Nieświeże', percent: data.summary.staleDatasets / data.datasets.length * 100, value: data.summary.staleDatasets },
  ];
}

export const sourceComparisonSeries: readonly ComparisonChartSeries[] = [
  { key: 'overlap', label: 'Nakładanie' },
  { key: 'confidence', label: 'Pewność' },
];

export function sourceComparisonData(
  records: readonly DataQualitySourceRecord[],
): readonly ComparisonChartDatum[] {
  return records.map((record) => ({
    id: record.id,
    label: record.label,
    values: {
      confidence: Math.round(record.confidence * 1000) / 10,
      overlap: record.overlapPercent,
    },
  }));
}

export function resolveReadinessLabel(readiness: ReadinessState): string {
  switch (readiness) {
    case 'ready':
      return 'Gotowe';
    case 'partial':
      return 'Częściowe';
    case 'stale':
      return 'Nieświeże';
    case 'processing':
      return 'Przetwarzanie';
    case 'noData':
      return 'Brak danych';
    case 'sourceError':
      return 'Błąd źródła';
    case 'blocked':
      return 'Zablokowane';
    default:
      return readiness;
  }
}

export function resolveImpactLabel(
  impact: DataQualityConflictRecord['impact'],
): string {
  switch (impact) {
    case 'high':
      return 'Wysoki';
    case 'medium':
      return 'Średni';
    case 'low':
    default:
      return 'Niski';
  }
}

export function resolveQueueLabel(
  queue: DataQualityConflictRecord['queue'],
): string {
  switch (queue) {
    case 'blocked':
      return 'Zablokowana';
    case 'manual':
      return 'Ręczna';
    case 'auto':
    default:
      return 'Automatyczna';
  }
}

export function resolveReviewStatusLabel(
  status: DataQualityReviewItem['status'],
): string {
  switch (status) {
    case 'approved':
      return 'Zatwierdzone';
    case 'blocked':
      return 'Zablokowane';
    case 'review':
      return 'W przeglądzie';
    case 'new':
    default:
      return 'Nowe';
  }
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(value);
}
