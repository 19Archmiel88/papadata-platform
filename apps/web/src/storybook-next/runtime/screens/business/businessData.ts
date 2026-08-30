import type {
  ApiProblem,
  AttributionView,
  CampaignsRecord,
  CampaignsSummary,
  CommandCenterRecord,
  CommandCenterSummary,
  DecisionStatus,
  DiagnosticFinding,
  DriverRelationships,
  FunnelStepView,
  PageInfo,
  PlanTrajectoryPointView,
  RecommendationView,
  WaterfallItem,
} from '../../../../../../../contracts/api-schemas';
import type {
  ChartSeries,
  DataSourceRef,
  DateRange,
  EvidenceRef,
  WorkspaceContext,
} from '../../../../../../../contracts/ui-contract-types';

export type BusinessScreenId =
  | '30.01'
  | '30.02'
  | '30.03'
  | '30.04'
  | '30.05'
  | '30.06'
  | '30.07'
  | '30.08'
  | '30.09'
  | '30.10'
  | '30.11'
  | '30.12'
  | '30.13'
  | '30.14'
  | '31.01'
  | '31.02'
  | '31.03'
  | '31.04'
  | '31.05'
  | '31.06';

export type BusinessScreenGroup =
  | 'command-center'
  | 'campaigns';

export type BusinessScreenVariant =
  | 'overview'
  | 'attention'
  | 'kpi'
  | 'plan'
  | 'drivers'
  | 'sales-sources'
  | 'traffic'
  | 'products'
  | 'customers'
  | 'funnel'
  | 'recommendations'
  | 'sales-signals'
  | 'waterfall'
  | 'command-variants'
  | 'campaign-overview'
  | 'campaign-list'
  | 'campaign-detail'
  | 'attribution'
  | 'budget'
  | 'diagnostics';

export type BusinessScreenDefinition = {
  readonly apiPath: `/api/v1/${string}`;
  readonly displayTitle: string;
  readonly group: BusinessScreenGroup;
  readonly id: BusinessScreenId;
  readonly operationId: string;
  readonly route: `/app/${string}`;
  readonly summary: string;
  readonly variant: BusinessScreenVariant;
};

/** Canonical read contracts required to assemble the Command Center one-page. */
export const commandCenterOnePageDataScreenIds = [
  '30.02',
  '30.03',
  '30.04',
  '30.05',
  '30.07',
  '30.08',
  '30.09',
  '30.10',
  '30.11',
  '30.13',
] as const satisfies readonly BusinessScreenId[];

/** Sessions/users per GA4 channel group — see `buildCommandCenterTrafficSourcesData` on the API. */
export type TrafficSourceRow = {
  readonly sessions: number;
  readonly source: string;
  readonly users: number;
};

/** Real per-product revenue/quantity — see `buildCommandCenterProductSalesData` on the API. */
export type ProductSalesRow = {
  readonly canonicalProductId: string;
  readonly changePercent: number | null;
  readonly productName: string;
  readonly quantity: number;
  readonly revenue: string;
};

export type CustomerSegmentRow = {
  readonly arpu: number;
  readonly customers: number;
  readonly frequency: number;
  readonly id: 'new' | 'returning';
  readonly productsPerOrder: number;
  readonly rawRevenue: number;
  readonly revenue: string;
  readonly segment: string;
};

export type CommittedActionRow = {
  readonly dueLabel: string;
  readonly expectedImpactLabel: string;
  readonly goal: string;
  readonly id: string;
  readonly measurement: {
    readonly baselineLabel: string;
    readonly resultLabel: string;
  } | null;
  readonly owner: string;
  readonly progress: number;
  readonly registryHref: `/app/decisions/${string}`;
  readonly status: DecisionStatus;
  readonly title: string;
};

export type CommandCenterApiData = {
  readonly benchmarkSemantics?: 'previous-period-run-rate';
  readonly committedActions?: readonly CommittedActionRow[];
  readonly customerSegments?: readonly CustomerSegmentRow[];
  readonly driverRelationships?: DriverRelationships;
  readonly forecastMethod?: 'linear-run-rate';
  readonly forecastTotal?: number;
  readonly pageInfo: PageInfo;
  readonly planTotal?: number;
  readonly productSales?: readonly ProductSalesRow[];
  readonly records: readonly CommandCenterRecord[];
  readonly recommendations?: readonly RecommendationView[];
  readonly steps?: readonly FunnelStepView[];
  readonly summary: CommandCenterSummary;
  readonly trafficSources?: readonly TrafficSourceRow[];
  readonly trajectory?: readonly PlanTrajectoryPointView[];
  readonly waterfall?: readonly WaterfallItem[];
};

export type CampaignsApiData = {
  readonly attribution?: readonly AttributionView[];
  readonly diagnostics?: readonly DiagnosticFinding[];
  readonly pageInfo?: PageInfo;
  readonly record?: CampaignsRecord;
  readonly records?: readonly CampaignsRecord[];
  readonly recommendations?: readonly RecommendationView[];
  readonly summary?: CampaignsSummary;
};

export type BusinessScreenData =
  | {
      readonly attribution: readonly AttributionView[];
      readonly diagnostics: readonly DiagnosticFinding[];
      readonly evidence: readonly EvidenceRef[];
      readonly generatedAt: string;
      readonly group: 'campaigns';
      readonly operationId: string;
      readonly pageInfo: PageInfo;
      readonly records: readonly CampaignsRecord[];
      readonly recommendations: readonly RecommendationView[];
      readonly sources: readonly DataSourceRef[];
      readonly summary: CampaignsSummary;
      readonly warnings: readonly ApiProblem[];
    }
  | {
      readonly driverRelationships: DriverRelationships | null;
      readonly evidence: readonly EvidenceRef[];
      readonly benchmarkSemantics: 'previous-period-run-rate' | null;
      readonly committedActions: readonly CommittedActionRow[];
      readonly customerSegments: readonly CustomerSegmentRow[];
      readonly forecastMethod: 'linear-run-rate' | null;
      readonly forecastTotal: number | null;
      readonly funnelSteps: readonly FunnelStepView[];
      readonly generatedAt: string;
      readonly group: 'command-center';
      readonly operationId: string;
      readonly pageInfo: PageInfo;
      readonly planTotal: number | null;
      readonly productSales: readonly ProductSalesRow[];
      readonly records: readonly CommandCenterRecord[];
      readonly recommendations: readonly RecommendationView[];
      readonly sources: readonly DataSourceRef[];
      readonly summary: CommandCenterSummary;
      readonly trafficSources: readonly TrafficSourceRow[];
      readonly trajectory: readonly PlanTrajectoryPointView[] | null;
      readonly waterfall: readonly WaterfallItem[];
      readonly warnings: readonly ApiProblem[];
    };

export const defaultWorkspaceContext: WorkspaceContext = {
  locale: 'pl',
  range: {
    from: '2026-08-01',
    preset: 'monthToDate',
    timezone: 'Europe/Warsaw',
    to: '2026-08-12',
  },
  tenantId: 'tenant_contract_pl',
  userId: 'user_owner_pl',
  workspaceId: 'workspace_commerce_pl',
};

export const defaultDateRange: DateRange = {
  from: '2026-08-01',
  preset: 'monthToDate',
  timezone: 'Europe/Warsaw',
  to: '2026-08-12',
};

export const dateRangePresets = [
  {
    label: '1 dzień',
    value: 'today',
  },
  {
    label: 'Ostatnie 7 dni',
    value: 'last7d',
  },
  {
    label: 'Ostatnie 30 dni',
    value: 'last30d',
  },
  {
    label: 'Ostatnie 90 dni',
    value: 'last90d',
  },
  {
    label: 'Miesiąc do dziś',
    value: 'monthToDate',
  },
  {
    label: 'Zakres własny',
    value: 'custom',
  },
] as const;

export const businessScreenDefinitions: readonly BusinessScreenDefinition[] = [
  {
    apiPath: '/api/v1/command-center/widok-glowny',
    displayTitle: 'Widok główny',
    group: 'command-center',
    id: '30.01',
    operationId: 'command-center.overview.read',
    route: '/app/command-center/widok-glowny',
    summary: 'Poranny przegląd KPI, stanu danych, czynników wyniku i decyzji wymagających uwagi.',
    variant: 'overview',
  },
  {
    apiPath: '/api/v1/command-center/kolejka-uwagi',
    displayTitle: 'Kolejka uwagi',
    group: 'command-center',
    id: '30.02',
    operationId: 'command-center.attention.queue.read',
    route: '/app/command-center/kolejka-uwagi',
    summary: 'Priorytetyzuje decyzje i blokady wpływające na bieżący wynik.',
    variant: 'attention',
  },
  {
    apiPath: '/api/v1/command-center/kpi',
    displayTitle: 'KPI',
    group: 'command-center',
    id: '30.03',
    operationId: 'command-center.kpi.read',
    route: '/app/command-center/kpi',
    summary: 'Analiza KPI z trendem, prognozą, celem i alternatywą tabelaryczną.',
    variant: 'kpi',
  },
  {
    apiPath: '/api/v1/command-center/plan-vs-wynik',
    displayTitle: 'Benchmark vs wynik',
    group: 'command-center',
    id: '30.04',
    operationId: 'command-center.plan-performance.read',
    route: '/app/command-center/plan-vs-wynik',
    summary: 'Porównuje wynik z tempem poprzedniego okresu i liniową prognozą końca zakresu; nie udaje zatwierdzonego planu biznesowego.',
    variant: 'plan',
  },
  {
    apiPath: '/api/v1/command-center/drivery-wyniku',
    displayTitle: 'Drivery wyniku',
    group: 'command-center',
    id: '30.05',
    operationId: 'command-center.drivers.read',
    route: '/app/command-center/drivery-wyniku',
    summary: 'Wyjaśnia, które czynniki najbardziej zmieniają wynik.',
    variant: 'drivers',
  },
  {
    apiPath: '/api/v1/command-center/zrodla-sprzedazy',
    displayTitle: 'Źródła sprzedaży',
    group: 'command-center',
    id: '30.06',
    operationId: 'command-center.sales-sources.read',
    route: '/app/command-center/zrodla-sprzedazy',
    summary: 'Pokazuje udział kanałów sprzedaży oraz gotowość danych źródłowych.',
    variant: 'sales-sources',
  },
  {
    apiPath: '/api/v1/command-center/ruch',
    displayTitle: 'Ruch',
    group: 'command-center',
    id: '30.07',
    operationId: 'command-center.traffic-summary.read',
    route: '/app/command-center/ruch',
    summary: 'Łączy ruch, konwersję i jakość eventów bez utraty stanów błędu.',
    variant: 'traffic',
  },
  {
    apiPath: '/api/v1/command-center/produkty',
    displayTitle: 'Produkty',
    group: 'command-center',
    id: '30.08',
    operationId: 'command-center.products-summary.read',
    route: '/app/command-center/produkty',
    summary: 'Analizuje produkty, pagination i filtrację bez lokalnych tabel.',
    variant: 'products',
  },
  {
    apiPath: '/api/v1/command-center/klienci',
    displayTitle: 'Klienci',
    group: 'command-center',
    id: '30.09',
    operationId: 'command-center.customers-summary.read',
    route: '/app/command-center/klienci',
    summary: 'Pokazuje zagregowane segmenty klientów z maskowaniem i brakiem PII.',
    variant: 'customers',
  },
  {
    apiPath: '/api/v1/command-center/lejek',
    displayTitle: 'Lejek',
    group: 'command-center',
    id: '30.10',
    operationId: 'command-center.funnel.read',
    route: '/app/command-center/lejek',
    summary: 'Ujawnia odpływ i konwersję kroków z alternatywą tekstową.',
    variant: 'funnel',
  },
  {
    apiPath: '/api/v1/command-center/rekomendacje-ai-skrot',
    displayTitle: 'Rekomendacje AI',
    group: 'command-center',
    id: '30.11',
    operationId: 'command-center.ai-recommendations.read',
    route: '/app/command-center/rekomendacje-ai-skrot',
    summary: 'Łączy pewność, dowody i akceptację człowieka przed działaniem.',
    variant: 'recommendations',
  },
  {
    apiPath: '/api/v1/command-center/sygnaly-sprzedazowe',
    displayTitle: 'Sygnały sprzedażowe',
    group: 'command-center',
    id: '30.12',
    operationId: 'command-center.sales-signals.read',
    route: '/app/command-center/sygnaly-sprzedazowe',
    summary: 'Porządkuje sygnały według statusu, priorytetu i właściciela.',
    variant: 'sales-signals',
  },
  {
    apiPath: '/api/v1/command-center/waterfall',
    displayTitle: 'Waterfall',
    group: 'command-center',
    id: '30.13',
    operationId: 'command-center.waterfall.read',
    route: '/app/command-center/waterfall',
    summary: 'Rozbija zmianę wyniku na wkłady dodatnie, ujemne i sumę.',
    variant: 'waterfall',
  },
  {
    apiPath: '/api/v1/campaigns/przeglad',
    displayTitle: 'Przegląd',
    group: 'campaigns',
    id: '31.01',
    operationId: 'campaigns.overview.read',
    route: '/app/campaigns/przeglad',
    summary: 'Przegląd wydatków, ROAS, statusów i trendu kampanii.',
    variant: 'campaign-overview',
  },
  {
    apiPath: '/api/v1/campaigns/lista-kampanii',
    displayTitle: 'Lista kampanii',
    group: 'campaigns',
    id: '31.02',
    operationId: 'campaigns.list.read',
    route: '/app/campaigns/lista-kampanii',
    summary: 'Lista kampanii z filtrowaniem, sortowaniem, paginacją i akcjami.',
    variant: 'campaign-list',
  },
  {
    apiPath: '/api/v1/campaigns/szczegoly-kampanii',
    displayTitle: 'Szczegóły kampanii',
    group: 'campaigns',
    id: '31.03',
    operationId: 'campaigns.detail.read',
    route: '/app/campaigns/szczegoly-kampanii',
    summary: 'Szczegół kampanii bez utraty kontekstu listy i filtrów.',
    variant: 'campaign-detail',
  },
  {
    apiPath: '/api/v1/campaigns/atrybucja-i-sprzedaz',
    displayTitle: 'Atrybucja i sprzedaż',
    group: 'campaigns',
    id: '31.04',
    operationId: 'campaigns.attribution-sales.read',
    route: '/app/campaigns/atrybucja-i-sprzedaz',
    summary: 'Porównuje modele atrybucji i wpływ na sprzedaż.',
    variant: 'attribution',
  },
  {
    apiPath: '/api/v1/campaigns/budzet',
    displayTitle: 'Budżet',
    group: 'campaigns',
    id: '31.05',
    operationId: 'campaigns.budget.read',
    route: '/app/campaigns/budzet',
    summary: 'Pokazuje pacing budżetu, prognozę i decyzję wymagającą approval.',
    variant: 'budget',
  },
  {
    apiPath: '/api/v1/campaigns/diagnostyka',
    displayTitle: 'Diagnostyka',
    group: 'campaigns',
    id: '31.06',
    operationId: 'campaigns.diagnostics.read',
    route: '/app/campaigns/diagnostyka',
    summary: 'Macierz gotowości i błędów źródeł bez ukrywania ograniczeń.',
    variant: 'diagnostics',
  },
] as const;

const pageInfo: PageInfo = {
  nextCursor: null,
  total: 8,
};

const generatedAt = '2026-08-12T08:30:00.000Z';

const campaignSummary: CampaignsSummary = {
  critical: 1,
  ready: 4,
  total: 6,
  updatedAt: generatedAt,
  warning: 1,
};

const commandCenterRecords: readonly CommandCenterRecord[] = [
  {
    delta: 0.12,
    label: 'Przychód netto',
    metricId: '11111111-1111-4111-8111-111111111101',
    readiness: 'ready',
    target: 840000,
    unit: 'currency',
    value: 912400,
  },
  {
    delta: -0.07,
    label: 'Konwersja koszyka',
    metricId: '11111111-1111-4111-8111-111111111102',
    readiness: 'partial',
    target: 0.035,
    unit: 'percent',
    value: 0.031,
  },
  {
    delta: 0.18,
    label: 'ROAS blended',
    metricId: '11111111-1111-4111-8111-111111111103',
    readiness: 'ready',
    target: 4.1,
    unit: 'ratio',
    value: 4.62,
  },
  {
    delta: -0.03,
    label: 'Świeżość eventów GA4',
    metricId: '11111111-1111-4111-8111-111111111104',
    readiness: 'stale',
    target: 0.98,
    unit: 'percent',
    value: 0.91,
  },
  {
    delta: 0.09,
    label: 'Marża brutto',
    metricId: '11111111-1111-4111-8111-111111111105',
    readiness: 'ready',
    target: 0.32,
    unit: 'percent',
    value: 0.36,
  },
];


function commandStoryMetric(
  id: string,
  label: string,
  value: number,
  unit: CommandCenterRecord['unit'],
  delta: number | null,
  target: number | null,
  readiness: CommandCenterRecord['readiness'],
): CommandCenterRecord {
  return {
    delta,
    label,
    metricId: id,
    readiness,
    target,
    unit,
    value,
  };
}

const commandCenterStoryRecordsById: Readonly<
  Record<string, readonly CommandCenterRecord[]>
> = {
  '30.01': commandCenterRecords,
  '30.02': [
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110201',
      'Konwersja checkout',
      0.026,
      'percent',
      -0.11,
      0.032,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110202',
      'Świeżość eventów GA4',
      0.91,
      'percent',
      -0.03,
      0.98,
      'stale',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110203',
      'CPA Meta',
      72,
      'number',
      0.18,
      61,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110204',
      'Odrzucone płatności',
      0.048,
      'percent',
      0.26,
      0.03,
      'unavailable',
    ),
  ],
  '30.03': [
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110301',
      'Przychód netto',
      912400,
      'currency',
      0.12,
      840000,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110302',
      'Liczba zamówień',
      5410,
      'number',
      0.08,
      5100,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110303',
      'Średnia wartość zamówienia',
      168.65,
      'currency',
      0.037,
      162,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110304',
      'Konwersja sprzedażowa',
      0.031,
      'percent',
      -0.07,
      0.035,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110305',
      'Marża brutto',
      0.36,
      'percent',
      0.09,
      0.32,
      'ready',
    ),
  ],
  '30.04': [
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110401',
      'Przychód netto',
      912400,
      'currency',
      0.086,
      840000,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110402',
      'Google Ads',
      421000,
      'currency',
      0.079,
      390000,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110403',
      'Meta Ads',
      256000,
      'currency',
      -0.086,
      280000,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110404',
      'Organic',
      147000,
      'currency',
      0.131,
      130000,
      'ready',
    ),
  ],
  '30.05': [
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110501',
      'Search high intent',
      421000,
      'currency',
      0.14,
      390000,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110502',
      'Mix produktów wysokomarżowych',
      0.38,
      'percent',
      0.09,
      0.34,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110503',
      'CPA Meta',
      72,
      'number',
      -0.12,
      61,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110504',
      'Zwroty',
      0.041,
      'percent',
      -0.05,
      0.035,
      'partial',
    ),
  ],
  '30.06': [
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110601',
      'Google Ads',
      421000,
      'currency',
      0.11,
      390000,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110602',
      'Meta Ads',
      256000,
      'currency',
      -0.04,
      280000,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110603',
      'Organic',
      147000,
      'currency',
      0.08,
      130000,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110604',
      'Direct',
      88400,
      'currency',
      0.03,
      85000,
      'ready',
    ),
  ],
  '30.07': [
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110701',
      'Sesje produktowe',
      142000,
      'number',
      0.07,
      135000,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110702',
      'Dodanie do koszyka',
      0.118,
      'percent',
      -0.03,
      0.125,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110703',
      'Checkout',
      0.0558,
      'percent',
      0.02,
      0.054,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110704',
      'Zakup',
      0.0381,
      'percent',
      -0.01,
      0.04,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110705',
      'Kompletność eventów GA4',
      0.93,
      'percent',
      -0.03,
      0.98,
      'stale',
    ),
  ],
  '30.08': [
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110801',
      'Przychód top 20 produktów',
      488000,
      'currency',
      0.12,
      445000,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110802',
      'Produkty bez mapowania',
      18,
      'number',
      -0.18,
      0,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110803',
      'Dostępność bestsellerów',
      0.94,
      'percent',
      -0.02,
      0.97,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110804',
      'Marża top produktów',
      0.39,
      'percent',
      0.06,
      0.36,
      'ready',
    ),
  ],
  '30.09': [
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110901',
      'Nowi klienci',
      2210,
      'number',
      0.09,
      2100,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110902',
      'Udział klientów powracających',
      0.41,
      'percent',
      0.04,
      0.39,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110903',
      'Repeat purchase rate',
      0.284,
      'percent',
      -0.03,
      0.3,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111110904',
      'AOV klientów powracających',
      182.4,
      'currency',
      0.07,
      175,
      'ready',
    ),
  ],
  '30.10': [
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111001',
      'Sesja → koszyk',
      0.118,
      'percent',
      -0.03,
      0.125,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111002',
      'Koszyk → checkout',
      0.47,
      'percent',
      0.05,
      0.44,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111003',
      'Checkout → zakup',
      0.683,
      'percent',
      -0.02,
      0.7,
      'partial',
    ),
  ],
  '30.11': [
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111101',
      'Rekomendacje wysokiego wpływu',
      1,
      'number',
      0,
      1,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111102',
      'Średnia pewność',
      0.83,
      'percent',
      0.04,
      0.8,
      'ready',
    ),
  ],
  '30.12': [
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111201',
      'Spadek konwersji Meta',
      0.026,
      'percent',
      -0.12,
      0.031,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111202',
      'Wzrost ROAS Search',
      4.82,
      'ratio',
      0.16,
      4.2,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111203',
      'Wzrost odrzuceń płatności',
      0.048,
      'percent',
      0.26,
      0.03,
      'unavailable',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111204',
      'Świeżość danych GA4',
      0.91,
      'percent',
      -0.03,
      0.98,
      'stale',
    ),
  ],
  '30.13': [
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111301',
      'Plan okresu',
      840000,
      'currency',
      0,
      840000,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111302',
      'Wpływ Search',
      57000,
      'currency',
      0.068,
      0,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111303',
      'Wpływ mixu marży',
      39000,
      'currency',
      0.046,
      0,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111304',
      'Wpływ Meta CPA',
      -23600,
      'currency',
      -0.028,
      0,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111305',
      'Wynik okresu',
      912400,
      'currency',
      0.086,
      840000,
      'ready',
    ),
  ],
  '30.14': [
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111401',
      'Scenariusz bazowy przychodu',
      912400,
      'currency',
      0.12,
      840000,
      'ready',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111402',
      'Scenariusz wzrostowy Search',
      969400,
      'currency',
      0.18,
      840000,
      'partial',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111403',
      'Scenariusz ostrożny Meta CPA',
      888800,
      'currency',
      -0.03,
      840000,
      'stale',
    ),
    commandStoryMetric(
      '11111111-1111-4111-8111-111111111404',
      'Pewność decyzji AI',
      0.79,
      'percent',
      0.04,
      0.86,
      'unavailable',
    ),
  ],
};

function buildStoryCommandSummary(
  records: readonly CommandCenterRecord[],
): CommandCenterSummary {
  return {
    critical: records.filter((record) => record.readiness === 'unavailable').length,
    ready: records.filter((record) => record.readiness === 'ready').length,
    total: records.length,
    updatedAt: generatedAt,
    warning: records.filter((record) => (
      record.readiness === 'partial'
      || record.readiness === 'stale'
    )).length,
  };
}

const campaignRecords: readonly CampaignsRecord[] = [
  {
    budget: { amount: 180000, currency: 'PLN' },
    campaignId: '22222222-2222-4222-8222-222222222201',
    channel: 'googleAds',
    name: 'Google Search - brand + high intent',
    revenue: { amount: 642000, currency: 'PLN' },
    roas: 4.82,
    spend: { amount: 133200, currency: 'PLN' },
    status: 'active',
  },
  {
    budget: { amount: 120000, currency: 'PLN' },
    campaignId: '22222222-2222-4222-8222-222222222202',
    channel: 'metaAds',
    name: 'Meta prospecting - lookalike revenue',
    revenue: { amount: 318000, currency: 'PLN' },
    roas: 3.14,
    spend: { amount: 101300, currency: 'PLN' },
    status: 'active',
  },
  {
    budget: { amount: 42000, currency: 'PLN' },
    campaignId: '22222222-2222-4222-8222-222222222203',
    channel: 'tiktokAds',
    name: 'TikTok creators - product discovery',
    revenue: { amount: 79000, currency: 'PLN' },
    roas: 1.88,
    spend: { amount: 42100, currency: 'PLN' },
    status: 'paused',
  },
  {
    budget: { amount: 28000, currency: 'PLN' },
    campaignId: '22222222-2222-4222-8222-222222222204',
    channel: 'other',
    name: 'Affiliate - marketplace partners',
    revenue: { amount: 145000, currency: 'PLN' },
    roas: 5.24,
    spend: { amount: 27700, currency: 'PLN' },
    status: 'active',
  },
];

const dataSources: readonly DataSourceRef[] = [
  {
    completeness: 0.98,
    dataset: 'Zamówienia i przychód',
    lastSyncAt: '2026-08-12T07:44:00.000Z',
    provider: 'Shopify',
  },
  {
    completeness: 0.93,
    dataset: 'Eventy GA4',
    lastSyncAt: '2026-08-12T06:58:00.000Z',
    provider: 'GA4',
  },
  {
    completeness: 0.96,
    dataset: 'Koszty kampanii',
    lastSyncAt: '2026-08-12T07:12:00.000Z',
    provider: 'Google Ads / Meta',
  },
];

const evidence: readonly EvidenceRef[] = [
  {
    confidence: 0.92,
    id: 'ev-orders-revenue',
    label: 'Zamówienia opłacone, bez anulacji',
    source: 'Zamówienia i przychód',
  },
  {
    confidence: 0.86,
    id: 'ev-ga4-events',
    label: 'Eventy koszyka i checkoutu',
    source: 'Eventy GA4',
  },
  {
    confidence: 0.89,
    id: 'ev-ad-spend',
    label: 'Koszt kampanii po normalizacji waluty',
    source: 'Koszty kampanii',
  },
];

const funnelSteps: readonly FunnelStepView[] = [
  {
    completions: 59800,
    conversionRate: 0.42,
    entrants: 142000,
    label: 'Sesje produktowe',
    stepId: 'sessions',
  },
  {
    completions: 16840,
    conversionRate: 0.282,
    entrants: 59800,
    label: 'Dodanie do koszyka',
    stepId: 'cart',
  },
  {
    completions: 7920,
    conversionRate: 0.47,
    entrants: 16840,
    label: 'Checkout',
    stepId: 'checkout',
  },
  {
    completions: 5410,
    conversionRate: 0.683,
    entrants: 7920,
    label: 'Zakup',
    stepId: 'purchase',
  },
];

const recommendations: readonly RecommendationView[] = [
  {
    confidence: 0.87,
    impact: 'high',
    rationale: 'Wzrost kosztu Meta przy spadku konwersji wymaga przesunięcia budżetu do Search high intent.',
    recommendationId: '33333333-3333-4333-8333-333333333301',
    title: 'Przenieś 12% budżetu Meta do kampanii Search',
  },
  {
    confidence: 0.79,
    impact: 'medium',
    rationale: 'Produkty o wysokiej marży mają niski udział w rekomendacjach onsite.',
    recommendationId: '33333333-3333-4333-8333-333333333302',
    title: 'Podbij ekspozycję produktów z marżą powyżej 38%',
  },
];

const waterfall: readonly WaterfallItem[] = [
  {
    cumulativeValue: 840000,
    key: 'plan',
    label: 'Plan',
    value: 840000,
  },
  {
    cumulativeValue: 897000,
    key: 'search',
    label: 'Search intent',
    value: 57000,
  },
  {
    cumulativeValue: 936000,
    key: 'margin',
    label: 'Mix marży',
    value: 39000,
  },
  {
    cumulativeValue: 912400,
    key: 'meta',
    label: 'Meta CPA',
    value: -23600,
  },
  {
    cumulativeValue: 912400,
    key: 'actual',
    label: 'Wynik',
    value: 912400,
  },
];

const attribution: readonly AttributionView[] = [
  {
    contribution: 0.46,
    model: 'data-driven',
    orders: 2180,
    revenue: { amount: 421000, currency: 'PLN' },
    source: 'Google Ads',
  },
  {
    contribution: 0.28,
    model: 'data-driven',
    orders: 1390,
    revenue: { amount: 256000, currency: 'PLN' },
    source: 'Meta Ads',
  },
  {
    contribution: 0.16,
    model: 'data-driven',
    orders: 740,
    revenue: { amount: 147000, currency: 'PLN' },
    source: 'Organic',
  },
  {
    contribution: 0.1,
    model: 'data-driven',
    orders: 420,
    revenue: { amount: 88400, currency: 'PLN' },
    source: 'Partners',
  },
];

const diagnostics: readonly DiagnosticFinding[] = [
  {
    code: 'GA4_EVENT_DELAY',
    findingId: '44444444-4444-4444-8444-444444444401',
    message: 'Eventy add_to_cart mają opóźnienie większe niż 90 minut.',
    severity: 'warning',
    sourceRef: 'Eventy GA4',
  },
  {
    code: 'ADS_COST_RECONCILIATION',
    findingId: '44444444-4444-4444-8444-444444444402',
    message: 'Koszt TikTok przekroczył budżet dzienny i wymaga potwierdzenia źródła.',
    severity: 'error',
    sourceRef: 'Koszty kampanii',
  },
  {
    code: 'SHOPIFY_READY',
    findingId: '44444444-4444-4444-8444-444444444403',
    message: 'Źródło zamówień jest kompletne i gotowe do odczytu.',
    severity: 'info',
    sourceRef: 'Zamówienia i przychód',
  },
];

export const businessTrendSeries: readonly ChartSeries[] = [
  {
    id: 'actual',
    label: 'Wynik',
    points: [
      { x: '1 sie', y: 690000 },
      { x: '3 sie', y: 712000 },
      { x: '5 sie', y: 746000 },
      { x: '7 sie', y: 792000 },
      { x: '9 sie', y: 853000 },
      { x: '12 sie', y: 912400 },
    ],
    unit: 'PLN',
  },
  {
    id: 'plan',
    label: 'Plan',
    points: [
      { x: '1 sie', y: 680000 },
      { x: '3 sie', y: 705000 },
      { x: '5 sie', y: 732000 },
      { x: '7 sie', y: 768000 },
      { x: '9 sie', y: 806000 },
      { x: '12 sie', y: 840000 },
    ],
    unit: 'PLN',
  },
];

const productSales: readonly ProductSalesRow[] = [
  { canonicalProductId: 'prod-coffee-premium-1kg', changePercent: 14.2, productName: 'Zestaw kawowy Premium 1kg', quantity: 640, revenue: '128400.00' },
  { canonicalProductId: 'prod-espresso-x200', changePercent: 6.5, productName: 'Ekspres przelewowy X200', quantity: 210, revenue: '96200.00' },
  { canonicalProductId: 'prod-filters-v60-100', changePercent: -3.1, productName: 'Filtry papierowe V60 (100 szt.)', quantity: 3100, revenue: '54300.00' },
  { canonicalProductId: 'prod-grinder-slim', changePercent: 9.8, productName: 'Młynek ręczny Slim', quantity: 540, revenue: '48800.00' },
  { canonicalProductId: 'prod-thermo-mug-400', changePercent: -11.4, productName: 'Kubek termiczny 400ml', quantity: 1380, revenue: '41200.00' },
  { canonicalProductId: 'prod-barista-starter', changePercent: 2.0, productName: 'Zestaw startowy Barista', quantity: 190, revenue: '36700.00' },
  { canonicalProductId: 'prod-coffee-ethiopia-250', changePercent: null, productName: 'Kawa mielona Etiopia 250g', quantity: 990, revenue: '29800.00' },
  { canonicalProductId: 'prod-scale-kitchen-01', changePercent: -5.6, productName: 'Waga kuchenna 0.1g', quantity: 410, revenue: '22500.00' },
];

const trafficSources: readonly TrafficSourceRow[] = [
  { sessions: 18400, source: 'Organic', users: 14200 },
  { sessions: 15200, source: 'Google Ads', users: 11800 },
  { sessions: 9800, source: 'Meta Ads', users: 7600 },
  { sessions: 7200, source: 'Direct', users: 6100 },
  { sessions: 3400, source: 'Email', users: 2900 },
  { sessions: 2100, source: 'Partners', users: 1750 },
];

const customerSegments: readonly CustomerSegmentRow[] = [
  {
    arpu: 169.78,
    customers: 1840,
    frequency: 1,
    id: 'new',
    productsPerOrder: 1.4,
    rawRevenue: 312400,
    revenue: '312400.00',
    segment: 'Nowi klienci',
  },
  {
    arpu: 446.77,
    customers: 960,
    frequency: 2.6,
    id: 'returning',
    productsPerOrder: 2.1,
    rawRevenue: 428900,
    revenue: '428900.00',
    segment: 'Powracający klienci',
  },
];

export function findBusinessScreenDefinition(
  idOrRoute: string,
): BusinessScreenDefinition | null {
  const normalizedPath = idOrRoute.split('?')[0] ?? idOrRoute;

  return businessScreenDefinitions.find((definition) => (
    definition.id === idOrRoute
    || definition.route === normalizedPath
    || normalizedPath.startsWith(`${definition.route}/`)
  )) ?? null;
}

/**
 * Storybook/demo fixture builder only — the real runtime path
 * (CommandCenterScreen) uses createCommandCenterBusinessData over the real
 * API response and shows an error/empty state rather than falling back to
 * this. Import only from `*.stories.tsx` files.
 */
export function createStorybookBusinessData(
  definition: BusinessScreenDefinition,
): BusinessScreenData {
  if (definition.group === 'campaigns') {
    return {
      attribution,
      diagnostics,
      evidence,
      generatedAt,
      group: 'campaigns',
      operationId: definition.operationId,
      pageInfo,
      records: campaignRecords,
      recommendations,
      sources: dataSources,
      summary: campaignSummary,
      warnings: [],
    };
  }

  const records = commandCenterStoryRecordsById[definition.id]
    ?? commandCenterRecords;

  return {
    benchmarkSemantics: null,
    driverRelationships: null,
    evidence,
    committedActions: [],
    customerSegments,
    forecastMethod: null,
    forecastTotal: null,
    funnelSteps,
    generatedAt,
    group: 'command-center',
    operationId: definition.operationId,
    pageInfo: {
      ...pageInfo,
      total: records.length,
    },
    planTotal: null,
    productSales,
    records,
    recommendations,
    sources: dataSources,
    summary: buildStoryCommandSummary(records),
    trafficSources,
    trajectory: null,
    warnings: [],
    waterfall,
  };
}

/**
 * Composes the canonical one-page read contracts into the single view
 * model consumed by the runtime landing page. Each source keeps its own
 * generated contract; the merge happens only at the UI orchestration layer,
 * so no endpoint pretends to return fields that are not part of its schema.
 */
export function mergeCommandCenterOnePageApiData(
  attentionData: CommandCenterApiData,
  kpiData: CommandCenterApiData,
  planData: CommandCenterApiData,
  driversData: CommandCenterApiData,
  trafficData: CommandCenterApiData,
  productsData: CommandCenterApiData,
  customersData: CommandCenterApiData,
  funnelData: CommandCenterApiData,
  recommendationsData: CommandCenterApiData,
  waterfallData: CommandCenterApiData,
): CommandCenterApiData {
  const records = mergeCommandCenterRecords(
    attentionData,
    kpiData,
    planData,
    driversData,
    trafficData,
    productsData,
    customersData,
    funnelData,
    recommendationsData,
    waterfallData,
  );

  return {
    ...kpiData,
    benchmarkSemantics: planData.benchmarkSemantics,
    committedActions: recommendationsData.committedActions ?? kpiData.committedActions,
    customerSegments: customersData.customerSegments ?? kpiData.customerSegments,
    driverRelationships: driversData.driverRelationships,
    forecastMethod: planData.forecastMethod,
    forecastTotal: planData.forecastTotal,
    planTotal: planData.planTotal,
    pageInfo: {
      ...kpiData.pageInfo,
      total: records.length,
    },
    productSales: productsData.productSales,
    records,
    recommendations: recommendationsData.recommendations ?? kpiData.recommendations,
    steps: funnelData.steps ?? [],
    trafficSources: trafficData.trafficSources,
    trajectory: planData.trajectory,
    waterfall: waterfallData.waterfall ?? [],
  };
}

function mergeCommandCenterRecords(
  ...sources: readonly CommandCenterApiData[]
): readonly CommandCenterRecord[] {
  const seen = new Set<string>();
  const records: CommandCenterRecord[] = [];

  sources.forEach((source) => {
    source.records.forEach((record) => {
      if (seen.has(record.metricId)) {
        return;
      }

      seen.add(record.metricId);
      records.push(record);
    });
  });

  return records;
}

export function createCommandCenterBusinessData(
  definition: BusinessScreenDefinition,
  data: CommandCenterApiData,
): BusinessScreenData {
  return {
    benchmarkSemantics: data.benchmarkSemantics ?? null,
    committedActions: data.committedActions ?? [],
    customerSegments: data.customerSegments ?? [],
    driverRelationships: data.driverRelationships ?? null,
    evidence: [],
    forecastMethod: data.forecastMethod ?? null,
    forecastTotal: data.forecastTotal ?? null,
    funnelSteps: data.steps ?? [],
    generatedAt: data.summary.updatedAt,
    group: 'command-center',
    operationId: definition.operationId,
    pageInfo: data.pageInfo,
    planTotal: data.planTotal ?? null,
    productSales: data.productSales ?? [],
    records: data.records,
    recommendations: data.recommendations ?? [],
    sources: [],
    summary: data.summary,
    trafficSources: data.trafficSources ?? [],
    trajectory: data.trajectory ?? null,
    warnings: [],
    waterfall: data.waterfall ?? [],
  };
}

export function createCampaignsBusinessData(
  definition: BusinessScreenDefinition,
  data: CampaignsApiData,
): BusinessScreenData {
  const recordRows = data.record
    ? [data.record]
    : data.records ?? [];

  return {
    attribution: data.attribution ?? [],
    diagnostics: data.diagnostics ?? [],
    evidence: [],
    generatedAt: data.summary?.updatedAt ?? generatedAt,
    group: 'campaigns',
    operationId: definition.operationId,
    pageInfo: data.pageInfo ?? {
      nextCursor: null,
      total: recordRows.length,
    },
    records: recordRows,
    recommendations: data.recommendations ?? [],
    sources: [],
    summary: data.summary ?? {
      critical: 0,
      ready: recordRows.length,
      total: recordRows.length,
      updatedAt: generatedAt,
      warning: 0,
    },
    warnings: [],
  };
}
