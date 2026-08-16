export type DomainComponentReadinessStatus =
  | 'accepted'
  | 'implemented';

export type DomainComponentCatalogItem = {
  readonly name: string;
  readonly owner: string;
  readonly fixture: string;
  readonly status: DomainComponentReadinessStatus;
};

export type DomainP0BacklogItem = {
  readonly id: string;
  readonly story: string;
  readonly document: string;
  readonly fixture: string;
  readonly status: DomainComponentReadinessStatus;
};

export const domainComponentCatalogItems = [
  { name: 'ChartFrame', owner: '15.01', fixture: 'fixtures/storybook/094-15-01-chartframe.json', status: 'accepted' },
  { name: 'MetricCard', owner: '15.02', fixture: 'fixtures/storybook/096-15-02-metriccard.json', status: 'accepted' },
  { name: 'TrendChart', owner: '15.03', fixture: 'fixtures/storybook/102-15-03-trendy.json', status: 'accepted' },
  { name: 'ComparisonChart', owner: '15.04', fixture: 'fixtures/storybook/097-15-04-porownania.json', status: 'accepted' },
  { name: 'CorrelationChart', owner: '15.06', fixture: 'fixtures/storybook/103-15-06-zaleznosci-i-korelacje.json', status: 'accepted' },
  { name: 'ForecastChart', owner: '15.07', fixture: 'fixtures/storybook/098-15-07-prognoza-i-ai.json', status: 'accepted' },
  { name: 'ShareChart', owner: '15.05', fixture: 'fixtures/storybook/101-15-05-struktura-i-udzial.json', status: 'accepted' },
  { name: 'ChartDataState', owner: '15.08', fixture: 'fixtures/storybook/100-15-08-stany-danych.json', status: 'accepted' },
  { name: 'ChartInteractionLayer', owner: '15.09', fixture: 'fixtures/storybook/095-15-09-interakcje-i-filtry.json', status: 'accepted' },
  { name: 'DataStatusBanner', owner: '18.08', fixture: 'fixtures/storybook/110-18-08-status-danych-i-readiness.json', status: 'accepted' },
  { name: 'EvidencePanel', owner: '18.07', fixture: 'fixtures/storybook/108-18-07-panele-szczegolow-dowodow-i-rekomendacji.json', status: 'accepted' },
  { name: 'RecommendationCard', owner: '18.07', fixture: 'fixtures/storybook/108-18-07-panele-szczegolow-dowodow-i-rekomendacji.json', status: 'accepted' },
  { name: 'DecisionQueue', owner: '18.11', fixture: 'fixtures/storybook/230-18-11-data-decision-workspace.json', status: 'accepted' },
  { name: 'BudgetPacing', owner: '15.11', fixture: 'fixtures/storybook/288-component-readiness-domain.json', status: 'implemented' },
  { name: 'AttributionComparison', owner: '15.11', fixture: 'fixtures/storybook/288-component-readiness-domain.json', status: 'implemented' },
  { name: 'ReconciliationPanel', owner: '15.11', fixture: 'fixtures/storybook/288-component-readiness-domain.json', status: 'implemented' },
  { name: 'SyncTimeline', owner: '15.11', fixture: 'fixtures/storybook/288-component-readiness-domain.json', status: 'implemented' },
  { name: 'LineageGraph', owner: '15.11', fixture: 'fixtures/storybook/288-component-readiness-domain.json', status: 'implemented' },
  { name: 'CohortMatrix', owner: '15.11', fixture: 'fixtures/storybook/288-component-readiness-domain.json', status: 'implemented' },
  { name: 'CustomerSegments', owner: '15.11', fixture: 'fixtures/storybook/288-component-readiness-domain.json', status: 'implemented' },
  { name: 'SalesFunnel', owner: '15.11', fixture: 'fixtures/storybook/288-component-readiness-domain.json', status: 'implemented' },
  { name: 'FunnelStep', owner: '35.04', fixture: 'fixtures/storybook/206-35-03-lejek-widok.json', status: 'accepted' },
  { name: 'MorningBrief', owner: '30.01', fixture: 'fixtures/storybook/166-30-01-widok-glowny.json', status: 'accepted' },
  { name: 'AssistantComposer', owner: '50.02', fixture: 'fixtures/storybook/232-50-02-assistantshell.json', status: 'accepted' },
  { name: 'PairingFlow', owner: '15.11', fixture: 'fixtures/storybook/288-component-readiness-domain.json', status: 'implemented' },
] satisfies readonly DomainComponentCatalogItem[];

export const domainP0BacklogItems = [
  {
    id: 'P0.SB09',
    story: '10 Komponenty domenowe/AttributionComparison',
    document: '04-komponenty-domenowe/attribution-comparison.md',
    fixture: 'fixtures/storybook/013-attribution-comparison.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB10',
    story: '10 Komponenty domenowe/BudgetPacing',
    document: '04-komponenty-domenowe/budget-pacing.md',
    fixture: 'fixtures/storybook/014-budget-pacing.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB11',
    story: '10 Komponenty domenowe/CohortMatrix',
    document: '04-komponenty-domenowe/cohort-matrix.md',
    fixture: 'fixtures/storybook/015-cohort-matrix.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB12',
    story: '10 Komponenty domenowe/CustomerSegments',
    document: '04-komponenty-domenowe/customer-segments.md',
    fixture: 'fixtures/storybook/016-customer-segments.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB13',
    story: '10 Komponenty domenowe/DataStatusBanner',
    document: '04-komponenty-domenowe/data-status-banner.md',
    fixture: 'fixtures/storybook/017-data-status-banner.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB14',
    story: '10 Komponenty domenowe/DecisionQueue',
    document: '04-komponenty-domenowe/decision-queue.md',
    fixture: 'fixtures/storybook/018-decision-queue.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB15',
    story: '10 Komponenty domenowe/EvidencePanel',
    document: '04-komponenty-domenowe/evidence-panel.md',
    fixture: 'fixtures/storybook/019-evidence-panel.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB16',
    story: '10 Komponenty domenowe/FunnelStep',
    document: '04-komponenty-domenowe/funnel-step.md',
    fixture: 'fixtures/storybook/020-funnel-step.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB17',
    story: '10 Komponenty domenowe/LineageGraph',
    document: '04-komponenty-domenowe/lineage-graph.md',
    fixture: 'fixtures/storybook/021-lineage-graph.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB18',
    story: '10 Komponenty domenowe/MorningBrief',
    document: '04-komponenty-domenowe/morning-brief.md',
    fixture: 'fixtures/storybook/022-morning-brief.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB19',
    story: '10 Komponenty domenowe/PairingFlow',
    document: '04-komponenty-domenowe/pairing-flow.md',
    fixture: 'fixtures/storybook/023-pairing-flow.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB20',
    story: '10 Komponenty domenowe/PlanPerformance',
    document: '04-komponenty-domenowe/plan-performance.md',
    fixture: 'fixtures/storybook/024-plan-performance.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB21',
    story: '10 Komponenty domenowe/RecommendationCard',
    document: '04-komponenty-domenowe/recommendation-card.md',
    fixture: 'fixtures/storybook/025-recommendation-card.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB22',
    story: '10 Komponenty domenowe/ReconciliationPanel',
    document: '04-komponenty-domenowe/reconciliation-panel.md',
    fixture: 'fixtures/storybook/026-reconciliation-panel.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB23',
    story: '10 Komponenty domenowe/ResultDrivers',
    document: '04-komponenty-domenowe/result-drivers.md',
    fixture: 'fixtures/storybook/027-result-drivers.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB24',
    story: '10 Komponenty domenowe/SalesFunnel',
    document: '04-komponenty-domenowe/sales-funnel.md',
    fixture: 'fixtures/storybook/028-sales-funnel.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB25',
    story: '10 Komponenty domenowe/SalesSources',
    document: '04-komponenty-domenowe/sales-sources.md',
    fixture: 'fixtures/storybook/029-sales-sources.json',
    status: 'implemented',
  },
  {
    id: 'P0.SB26',
    story: '10 Komponenty domenowe/SyncTimeline',
    document: '04-komponenty-domenowe/sync-timeline.md',
    fixture: 'fixtures/storybook/030-sync-timeline.json',
    status: 'implemented',
  },
] satisfies readonly DomainP0BacklogItem[];

export const domainComponentProductionRegistry = [
  ...domainComponentCatalogItems.map((item) => ({
    component: item.name,
    fixture: item.fixture,
    kind: 'catalog',
    owner: item.owner,
    source: '15.11',
    status: item.status,
  })),
  ...domainP0BacklogItems.map((item) => ({
    component: item.story.split('/').at(-1) ?? item.story,
    fixture: item.fixture,
    kind: 'p0',
    owner: 'Analytics UI',
    source: '15.12',
    status: item.status,
  })),
] as const;

export const domainComponentRegistrySummary = {
  catalogItems: domainComponentCatalogItems.length,
  p0Items: domainP0BacklogItems.length,
  registryItems: domainComponentProductionRegistry.length,
  uniqueComponents: new Set(
    domainComponentProductionRegistry.map((item) => item.component),
  ).size,
} as const;
