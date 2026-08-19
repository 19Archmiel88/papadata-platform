import type {
  ApiProblem,
  AttributionView,
  CampaignsRecord,
  CampaignsSummary,
  CommandCenterRecord,
  CommandCenterSummary,
  DiagnosticFinding,
  DriverMetricView,
  FunnelStepView,
  PageInfo,
  PlanTrajectoryPointView,
  RecommendationView,
  WaterfallItem,
} from '../../../../../contracts/api-schemas';
import type {
  ChartSeries,
  DataSourceRef,
  DateRange,
  EvidenceRef,
  WorkspaceContext,
} from '../../../../../contracts/ui-contract-types';

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
  readonly documentPath: string;
  readonly fixturePath: string;
  readonly group: BusinessScreenGroup;
  readonly id: BusinessScreenId;
  readonly operationId: string;
  readonly route: `/app/${string}`;
  readonly storyExport: string;
  readonly storyName: string;
  readonly storyTitle: string;
  readonly summary: string;
  readonly variant: BusinessScreenVariant;
};

export type CommandCenterApiData = {
  readonly drivers?: readonly DriverMetricView[];
  readonly forecastMethod?: 'linear-run-rate';
  readonly forecastTotal?: number;
  readonly pageInfo: PageInfo;
  readonly planTotal?: number;
  readonly records: readonly CommandCenterRecord[];
  readonly recommendations?: readonly RecommendationView[];
  readonly steps?: readonly FunnelStepView[];
  readonly summary: CommandCenterSummary;
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
      readonly drivers: readonly DriverMetricView[] | null;
      readonly evidence: readonly EvidenceRef[];
      readonly forecastMethod: 'linear-run-rate' | null;
      readonly forecastTotal: number | null;
      readonly funnelSteps: readonly FunnelStepView[];
      readonly generatedAt: string;
      readonly group: 'command-center';
      readonly operationId: string;
      readonly pageInfo: PageInfo;
      readonly planTotal: number | null;
      readonly records: readonly CommandCenterRecord[];
      readonly recommendations: readonly RecommendationView[];
      readonly sources: readonly DataSourceRef[];
      readonly summary: CommandCenterSummary;
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
    documentPath: '07-centrum-dowodzenia/30-01-widok-glowny.md',
    fixturePath: 'fixtures/storybook/166-30-01-widok-glowny.json',
    group: 'command-center',
    id: '30.01',
    operationId: 'command-center.overview.read',
    route: '/app/command-center/widok-glowny',
    storyExport: 'CommandCenterOverviewStory',
    storyName: '30.01 Widok główny',
    storyTitle: '30 Centrum Dowodzenia/Widok główny',
    summary: 'Poranny przegląd KPI, stanu danych, czynników wyniku i decyzji wymagających uwagi.',
    variant: 'overview',
  },
  {
    apiPath: '/api/v1/command-center/kolejka-uwagi',
    displayTitle: 'Kolejka uwagi',
    documentPath: '07-centrum-dowodzenia/30-02-kolejka-uwagi.md',
    fixturePath: 'fixtures/storybook/157-30-02-kolejka-uwagi.json',
    group: 'command-center',
    id: '30.02',
    operationId: 'command-center.attention.queue.read',
    route: '/app/command-center/kolejka-uwagi',
    storyExport: 'CommandCenterAttentionQueueStory',
    storyName: '30.02 Kolejka uwagi',
    storyTitle: '30 Centrum Dowodzenia/Kolejka uwagi',
    summary: 'Priorytetyzuje decyzje i blokady wpływające na bieżący wynik.',
    variant: 'attention',
  },
  {
    apiPath: '/api/v1/command-center/kpi',
    displayTitle: 'KPI',
    documentPath: '07-centrum-dowodzenia/30-03-kpi.md',
    fixturePath: 'fixtures/storybook/155-30-03-kpi.json',
    group: 'command-center',
    id: '30.03',
    operationId: 'command-center.kpi.read',
    route: '/app/command-center/kpi',
    storyExport: 'CommandCenterKpiStory',
    storyName: '30.03 KPI',
    storyTitle: '30 Centrum Dowodzenia/KPI',
    summary: 'Analiza KPI z trendem, prognozą, celem i alternatywą tabelaryczną.',
    variant: 'kpi',
  },
  {
    apiPath: '/api/v1/command-center/plan-vs-wynik',
    displayTitle: 'Plan vs wynik',
    documentPath: '07-centrum-dowodzenia/30-04-plan-vs-wynik.md',
    fixturePath: 'fixtures/storybook/159-30-04-plan-vs-wynik.json',
    group: 'command-center',
    id: '30.04',
    operationId: 'command-center.plan-performance.read',
    route: '/app/command-center/plan-vs-wynik',
    storyExport: 'CommandCenterPlanPerformanceStory',
    storyName: '30.04 Plan vs wynik',
    storyTitle: '30 Centrum Dowodzenia/Plan vs wynik',
    summary: 'Porównuje wykonanie planu, tempo i prognozę końca okresu.',
    variant: 'plan',
  },
  {
    apiPath: '/api/v1/command-center/drivery-wyniku',
    displayTitle: 'Drivery wyniku',
    documentPath: '07-centrum-dowodzenia/30-05-drivery-wyniku.md',
    fixturePath: 'fixtures/storybook/154-30-05-drivery-wyniku.json',
    group: 'command-center',
    id: '30.05',
    operationId: 'command-center.drivers.read',
    route: '/app/command-center/drivery-wyniku',
    storyExport: 'CommandCenterDriversStory',
    storyName: '30.05 Drivery wyniku',
    storyTitle: '30 Centrum Dowodzenia/Drivery wyniku',
    summary: 'Wyjaśnia, które czynniki najbardziej zmieniają wynik.',
    variant: 'drivers',
  },
  {
    apiPath: '/api/v1/command-center/zrodla-sprzedazy',
    displayTitle: 'Źródła sprzedaży',
    documentPath: '07-centrum-dowodzenia/30-06-zrodla-sprzedazy.md',
    fixturePath: 'fixtures/storybook/167-30-06-zrodla-sprzedazy.json',
    group: 'command-center',
    id: '30.06',
    operationId: 'command-center.sales-sources.read',
    route: '/app/command-center/zrodla-sprzedazy',
    storyExport: 'CommandCenterSalesSourcesStory',
    storyName: '30.06 Źródła sprzedaży',
    storyTitle: '30 Centrum Dowodzenia/Źródła sprzedaży',
    summary: 'Pokazuje udział kanałów sprzedaży oraz gotowość danych źródłowych.',
    variant: 'sales-sources',
  },
  {
    apiPath: '/api/v1/command-center/ruch',
    displayTitle: 'Ruch',
    documentPath: '07-centrum-dowodzenia/30-07-ruch.md',
    fixturePath: 'fixtures/storybook/162-30-07-ruch.json',
    group: 'command-center',
    id: '30.07',
    operationId: 'command-center.traffic-summary.read',
    route: '/app/command-center/ruch',
    storyExport: 'CommandCenterTrafficStory',
    storyName: '30.07 Ruch',
    storyTitle: '30 Centrum Dowodzenia/Ruch',
    summary: 'Łączy ruch, konwersję i jakość eventów bez utraty stanów błędu.',
    variant: 'traffic',
  },
  {
    apiPath: '/api/v1/command-center/produkty',
    displayTitle: 'Produkty',
    documentPath: '07-centrum-dowodzenia/30-08-produkty.md',
    fixturePath: 'fixtures/storybook/160-30-08-produkty.json',
    group: 'command-center',
    id: '30.08',
    operationId: 'command-center.products-summary.read',
    route: '/app/command-center/produkty',
    storyExport: 'CommandCenterProductsStory',
    storyName: '30.08 Produkty',
    storyTitle: '30 Centrum Dowodzenia/Produkty',
    summary: 'Analizuje produkty, pagination i filtrację bez lokalnych tabel.',
    variant: 'products',
  },
  {
    apiPath: '/api/v1/command-center/klienci',
    displayTitle: 'Klienci',
    documentPath: '07-centrum-dowodzenia/30-09-klienci.md',
    fixturePath: 'fixtures/storybook/156-30-09-klienci.json',
    group: 'command-center',
    id: '30.09',
    operationId: 'command-center.customers-summary.read',
    route: '/app/command-center/klienci',
    storyExport: 'CommandCenterCustomersStory',
    storyName: '30.09 Klienci',
    storyTitle: '30 Centrum Dowodzenia/Klienci',
    summary: 'Pokazuje zagregowane segmenty klientów z maskowaniem i brakiem PII.',
    variant: 'customers',
  },
  {
    apiPath: '/api/v1/command-center/lejek',
    displayTitle: 'Lejek',
    documentPath: '07-centrum-dowodzenia/30-10-lejek.md',
    fixturePath: 'fixtures/storybook/158-30-10-lejek.json',
    group: 'command-center',
    id: '30.10',
    operationId: 'command-center.funnel.read',
    route: '/app/command-center/lejek',
    storyExport: 'CommandCenterFunnelStory',
    storyName: '30.10 Lejek',
    storyTitle: '30 Centrum Dowodzenia/Lejek',
    summary: 'Ujawnia odpływ i konwersję kroków z alternatywą tekstową.',
    variant: 'funnel',
  },
  {
    apiPath: '/api/v1/command-center/rekomendacje-ai-skrot',
    displayTitle: 'Rekomendacje AI',
    documentPath: '07-centrum-dowodzenia/30-11-rekomendacje-ai-skrot.md',
    fixturePath: 'fixtures/storybook/161-30-11-rekomendacje-ai-skrot.json',
    group: 'command-center',
    id: '30.11',
    operationId: 'command-center.ai-recommendations.read',
    route: '/app/command-center/rekomendacje-ai-skrot',
    storyExport: 'CommandCenterRecommendationsStory',
    storyName: '30.11 Rekomendacje AI',
    storyTitle: '30 Centrum Dowodzenia/Rekomendacje AI — skrót',
    summary: 'Łączy pewność, dowody i akceptację człowieka przed działaniem.',
    variant: 'recommendations',
  },
  {
    apiPath: '/api/v1/command-center/sygnaly-sprzedazowe',
    displayTitle: 'Sygnały sprzedażowe',
    documentPath: '07-centrum-dowodzenia/30-12-sygnaly-sprzedazowe.md',
    fixturePath: 'fixtures/storybook/163-30-12-sygnaly-sprzedazowe.json',
    group: 'command-center',
    id: '30.12',
    operationId: 'command-center.sales-signals.read',
    route: '/app/command-center/sygnaly-sprzedazowe',
    storyExport: 'CommandCenterSalesSignalsStory',
    storyName: '30.12 Sygnały sprzedażowe',
    storyTitle: '30 Centrum Dowodzenia/Sygnały sprzedażowe',
    summary: 'Porządkuje sygnały według statusu, priorytetu i właściciela.',
    variant: 'sales-signals',
  },
  {
    apiPath: '/api/v1/command-center/waterfall',
    displayTitle: 'Waterfall',
    documentPath: '07-centrum-dowodzenia/30-13-waterfall.md',
    fixturePath: 'fixtures/storybook/165-30-13-waterfall.json',
    group: 'command-center',
    id: '30.13',
    operationId: 'command-center.waterfall.read',
    route: '/app/command-center/waterfall',
    storyExport: 'CommandCenterWaterfallStory',
    storyName: '30.13 Waterfall',
    storyTitle: '30 Centrum Dowodzenia/Waterfall',
    summary: 'Rozbija zmianę wyniku na wkłady dodatnie, ujemne i sumę.',
    variant: 'waterfall',
  },
  {
    apiPath: '/api/v1/command-center/warianty',
    displayTitle: 'Analiza wariantów',
    documentPath: '07-centrum-dowodzenia/30-14-warianty-centrum-dowodzenia.md',
    fixturePath: 'fixtures/storybook/164-30-14-warianty-centrum-dowodzenia.json',
    group: 'command-center',
    id: '30.14',
    operationId: 'command-center.variants.read',
    route: '/app/command-center/warianty',
    storyExport: 'CommandCenterVariantsStory',
    storyName: '30.14 Analiza wariantów',
    storyTitle: '30 Centrum Dowodzenia/Analiza wariantów',
    summary: 'Porównuje scenariusze wyniku, ryzyka i gotowości danych dla wybranego zakresu.',
    variant: 'command-variants',
  },
  {
    apiPath: '/api/v1/campaigns/przeglad',
    displayTitle: 'Przegląd',
    documentPath: '08-kampanie-platne/31-01-przeglad.md',
    fixturePath: 'fixtures/storybook/172-31-01-przeglad.json',
    group: 'campaigns',
    id: '31.01',
    operationId: 'campaigns.overview.read',
    route: '/app/campaigns/przeglad',
    storyExport: 'CampaignsOverviewStory',
    storyName: '31.01 Przegląd',
    storyTitle: '31 Kampanie płatne/Przegląd',
    summary: 'Przegląd wydatków, ROAS, statusów i trendu kampanii.',
    variant: 'campaign-overview',
  },
  {
    apiPath: '/api/v1/campaigns/lista-kampanii',
    displayTitle: 'Lista kampanii',
    documentPath: '08-kampanie-platne/31-02-lista-kampanii.md',
    fixturePath: 'fixtures/storybook/171-31-02-lista-kampanii.json',
    group: 'campaigns',
    id: '31.02',
    operationId: 'campaigns.list.read',
    route: '/app/campaigns/lista-kampanii',
    storyExport: 'CampaignsListStory',
    storyName: '31.02 Lista kampanii',
    storyTitle: '31 Kampanie płatne/Lista kampanii',
    summary: 'Lista kampanii z filtrowaniem, sortowaniem, paginacją i akcjami.',
    variant: 'campaign-list',
  },
  {
    apiPath: '/api/v1/campaigns/szczegoly-kampanii',
    displayTitle: 'Szczegóły kampanii',
    documentPath: '08-kampanie-platne/31-03-szczegoly-kampanii.md',
    fixturePath: 'fixtures/storybook/174-31-03-szczegoly-kampanii.json',
    group: 'campaigns',
    id: '31.03',
    operationId: 'campaigns.detail.read',
    route: '/app/campaigns/szczegoly-kampanii',
    storyExport: 'CampaignsDetailStory',
    storyName: '31.03 Szczegóły kampanii',
    storyTitle: '31 Kampanie płatne/Szczegóły kampanii',
    summary: 'Szczegół kampanii bez utraty kontekstu listy i filtrów.',
    variant: 'campaign-detail',
  },
  {
    apiPath: '/api/v1/campaigns/atrybucja-i-sprzedaz',
    displayTitle: 'Atrybucja i sprzedaż',
    documentPath: '08-kampanie-platne/31-04-atrybucja-i-sprzedaz.md',
    fixturePath: 'fixtures/storybook/168-31-04-atrybucja-i-sprzedaz.json',
    group: 'campaigns',
    id: '31.04',
    operationId: 'campaigns.attribution-sales.read',
    route: '/app/campaigns/atrybucja-i-sprzedaz',
    storyExport: 'CampaignsAttributionStory',
    storyName: '31.04 Atrybucja',
    storyTitle: '31 Kampanie płatne/Atrybucja i sprzedaż',
    summary: 'Porównuje modele atrybucji i wpływ na sprzedaż.',
    variant: 'attribution',
  },
  {
    apiPath: '/api/v1/campaigns/budzet',
    displayTitle: 'Budżet',
    documentPath: '08-kampanie-platne/31-05-budzet.md',
    fixturePath: 'fixtures/storybook/169-31-05-budzet.json',
    group: 'campaigns',
    id: '31.05',
    operationId: 'campaigns.budget.read',
    route: '/app/campaigns/budzet',
    storyExport: 'CampaignsBudgetStory',
    storyName: '31.05 Budżet',
    storyTitle: '31 Kampanie płatne/Budżet',
    summary: 'Pokazuje pacing budżetu, prognozę i decyzję wymagającą approval.',
    variant: 'budget',
  },
  {
    apiPath: '/api/v1/campaigns/diagnostyka',
    displayTitle: 'Diagnostyka',
    documentPath: '08-kampanie-platne/31-06-diagnostyka.md',
    fixturePath: 'fixtures/storybook/170-31-06-diagnostyka.json',
    group: 'campaigns',
    id: '31.06',
    operationId: 'campaigns.diagnostics.read',
    route: '/app/campaigns/diagnostyka',
    storyExport: 'CampaignsDiagnosticsStory',
    storyName: '31.06 Diagnostyka',
    storyTitle: '31 Kampanie płatne/Diagnostyka',
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
    drivers: null,
    evidence,
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
    records,
    recommendations,
    sources: dataSources,
    summary: buildStoryCommandSummary(records),
    trajectory: null,
    warnings: [],
    waterfall,
  };
}

export function createCommandCenterBusinessData(
  definition: BusinessScreenDefinition,
  data: CommandCenterApiData,
): BusinessScreenData {
  return {
    drivers: data.drivers ?? null,
    evidence: [],
    forecastMethod: data.forecastMethod ?? null,
    forecastTotal: data.forecastTotal ?? null,
    funnelSteps: data.steps ?? [],
    generatedAt: data.summary.updatedAt,
    group: 'command-center',
    operationId: definition.operationId,
    pageInfo: data.pageInfo,
    planTotal: data.planTotal ?? null,
    records: data.records,
    recommendations: data.recommendations ?? [],
    sources: [],
    summary: data.summary,
    trajectory: data.trajectory ?? null,
    warnings: [],
    waterfall: data.waterfall ?? [],
  };
}

export function applyCommandCenterDateRange(
  data: Extract<BusinessScreenData, { readonly group: 'command-center' }>,
  range: DateRange,
): Extract<BusinessScreenData, { readonly group: 'command-center' }> {
  const scale = resolveDateRangeScale(range);
  const generatedAt = new Date().toISOString();

  return {
    ...data,
    funnelSteps: data.funnelSteps.map((step) => ({
      ...step,
      completions: scaleWholeNumber(step.completions, scale),
      entrants: scaleWholeNumber(step.entrants, scale),
    })),
    generatedAt,
    records: data.records.map((record) => scaleCommandRecord(record, scale)),
    summary: {
      ...data.summary,
      updatedAt: generatedAt,
    },
    waterfall: scaleWaterfall(data.waterfall, scale),
  };
}

function resolveDateRangeScale(range: DateRange): number {
  const baselineDays = 12;
  const days = getDateRangeDayCount(range);

  return Math.min(
    Math.max(days / baselineDays, 1 / baselineDays),
    90 / baselineDays,
  );
}

function getDateRangeDayCount(range: DateRange): number {
  const from = parseDateRangeInput(range.from);
  const to = parseDateRangeInput(range.to);

  if (!from || !to) {
    switch (range.preset) {
      case 'last90d':
        return 90;
      case 'last30d':
        return 30;
      case 'last7d':
        return 7;
      case 'today':
      default:
        return 1;
    }
  }

  const dayMs = 24 * 60 * 60 * 1_000;
  const diff = Math.round((to.getTime() - from.getTime()) / dayMs);

  return Math.max(diff + 1, 1);
}

function parseDateRangeInput(value: string): Date | null {
  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function scaleCommandRecord(
  record: CommandCenterRecord,
  scale: number,
): CommandCenterRecord {
  if (!shouldScaleCommandRecord(record)) {
    return record;
  }

  return {
    ...record,
    target: typeof record.target === 'number'
      ? scaleMetric(record.target, record.unit, scale)
      : record.target,
    value: scaleMetric(record.value, record.unit, scale),
  };
}

function shouldScaleCommandRecord(
  record: CommandCenterRecord,
): boolean {
  if (
    record.unit === 'percent'
    || record.unit === 'ratio'
    || record.unit === 'duration'
  ) {
    return false;
  }

  const label = record.label.toLocaleLowerCase('pl-PL');

  return !(
    label.includes('strumienie')
    || label.includes('domeny')
    || label.includes('gotowość')
    || label.includes('pewność')
  );
}

function scaleMetric(
  value: number,
  unit: CommandCenterRecord['unit'],
  scale: number,
): number {
  const nextValue = value * scale;

  return unit === 'currency' || unit === 'number'
    ? Math.round(nextValue)
    : Number(nextValue.toFixed(4));
}

function scaleWholeNumber(
  value: number,
  scale: number,
): number {
  return Math.max(Math.round(value * scale), 0);
}

function scaleWaterfall(
  waterfall: readonly WaterfallItem[],
  scale: number,
): readonly WaterfallItem[] {
  return waterfall.map((item) => ({
    ...item,
    cumulativeValue: Math.round(item.cumulativeValue * scale),
    value: Math.round(item.value * scale),
  }));
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
