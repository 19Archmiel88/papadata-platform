import type {
  PapaDataIconName,
} from '../../design-system';

export type CommandCenterTone =
  | 'amber'
  | 'blue'
  | 'cyan'
  | 'emerald'
  | 'indigo'
  | 'rose'
  | 'slate'
  | 'violet';

export const commandCenterSections = [
  {
    icon: 'trend',
    id: 'pulse',
    navLabel: 'KPI',
    title: 'KPI',
  },
  {
    icon: 'assistant',
    id: 'guardian',
    navLabel: 'Guardian',
    title: 'Guardian',
  },
  {
    icon: 'success',
    id: 'plan',
    navLabel: 'Plan vs Wynik',
    title: 'Plan vs Wynik',
  },
  {
    icon: 'trend',
    id: 'drivers',
    navLabel: 'Drivery',
    title: 'Drivery wyniku',
  },
  {
    icon: 'warning',
    id: 'alerts',
    navLabel: 'Ryzyka',
    title: 'Ryzyka i alerty',
  },
  {
    icon: 'data',
    id: 'funnel',
    navLabel: 'Lejek',
    title: 'Lejek konwersji',
  },
  {
    icon: 'billing',
    id: 'sources',
    navLabel: 'Przychód',
    title: 'Źródła przychodu',
  },
  {
    icon: 'products',
    id: 'products',
    navLabel: 'Produkty',
    title: 'Produkty',
  },
  {
    icon: 'customers',
    id: 'customers',
    navLabel: 'Klienci',
    title: 'Struktura klientów',
  },
  {
    icon: 'integration',
    id: 'data-health',
    navLabel: 'Integracje i dane',
    title: 'Stan integracji i pochodzenie danych',
  },
] as const satisfies readonly {
  readonly icon: PapaDataIconName;
  readonly id: string;
  readonly navLabel: string;
  readonly title: string;
}[];

export type CommandCenterSectionId = typeof commandCenterSections[number]['id'];

export const commandCenterSectionsById = commandCenterSections.reduce(
  (accumulator, section) => {
    accumulator[section.id] = section;
    return accumulator;
  },
  {} as Record<CommandCenterSectionId, typeof commandCenterSections[number]>,
);

export const commandDateRanges = [
  { label: '1D', value: '1d' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: 'Własny', value: 'custom' },
] as const;

export type CommandDateRange = typeof commandDateRanges[number]['value'];

export const commandCompareOptions = [
  { label: 'vs poprzedni okres', value: 'previous_period' },
  { label: 'vs rok wcześniej (r/r)', value: 'same_period_last_year' },
] as const;

export type CommandCompareMode = typeof commandCompareOptions[number]['value'];

export type CommandKpiStatus =
  | 'critical'
  | 'insight'
  | 'normal'
  | 'warning';

export type CommandKpiKey =
  | 'ad_spend'
  | 'aov'
  | 'cac'
  | 'gmv'
  | 'orders'
  | 'roas';

export type CommandKpi = {
  readonly change: number;
  readonly description: string;
  readonly icon: PapaDataIconName;
  readonly id: CommandKpiKey;
  readonly metricKey: string;
  readonly name: string;
  readonly previous: number;
  readonly sparkline: readonly number[];
  readonly status: CommandKpiStatus;
  readonly unit: string;
  readonly value: number;
};

export const commandTrendMetrics = [
  { label: 'Sprzedaż (GMV)', tone: 'blue', unit: 'PLN', value: 'gmv' },
  { label: 'Koszt Reklamy', tone: 'rose', unit: 'PLN', value: 'adSpend' },
  { label: 'Zamówienia', tone: 'emerald', unit: 'szt.', value: 'orders' },
  { label: 'ROAS', tone: 'violet', unit: 'x', value: 'roas' },
] as const satisfies readonly {
  readonly label: string;
  readonly tone: CommandCenterTone;
  readonly unit: string;
  readonly value: CommandTrendMetric;
}[];

export type CommandTrendMetric =
  | 'adSpend'
  | 'gmv'
  | 'orders'
  | 'roas';

export type CommandDecision = {
  readonly category: string;
  readonly confidence: string;
  readonly id: string;
  readonly impact: string;
  readonly impactValue: number;
  readonly reason: string;
  readonly simulatable: boolean;
  readonly sourceMetricKeys: readonly string[];
  readonly title: string;
  readonly type: 'ai' | 'rule';
};

export type CommandDriverType =
  | 'base'
  | 'negative'
  | 'positive'
  | 'total';

export type CommandRiskSeverity =
  | 'critical'
  | 'info'
  | 'warning';

export type CommandRiskStatus =
  | 'acknowledged'
  | 'dismissed'
  | 'open';

export type CommandRisk = {
  readonly action: string;
  readonly desc: string;
  readonly id: string;
  readonly impact: string;
  readonly severity: CommandRiskSeverity;
  readonly status: CommandRiskStatus;
  readonly title: string;
};

export type CommandProductSort =
  | 'gmv'
  | 'margin';

export type CommandIntegrationStatus =
  | 'fresh'
  | 'partial'
  | 'stale';

export type CommandCenterSection = typeof commandCenterSections[number];

export type CommandKpiData = CommandKpi;

export type CommandTrendMetricConfig = typeof commandTrendMetrics[number];

export type CommandTimeSeriesPoint = {
  readonly adSpend: number;
  readonly date: string;
  readonly gmv: number;
  readonly orders: number;
  readonly roas: number;
};

export type CommandGuardianData = {
  readonly action: string;
  readonly summary: string;
  readonly why: string;
};

export type CommandDecisionData = CommandDecision;

export type CommandPlanData = {
  readonly actual: number;
  readonly completion: number;
  readonly forecast: number;
  readonly forecastCompletion: number;
  readonly statusText: string;
  readonly target: number;
};

export type CommandDriverData = {
  readonly amount: number;
  readonly name: string;
  readonly type: CommandDriverType;
};

export type CommandRiskData = CommandRisk;

export type CommandFunnelStep = {
  readonly count: number;
  readonly delta: string;
  readonly description: string;
  readonly pctOfTotal: number;
  readonly rate: string;
  readonly stage: string;
  readonly tone: CommandCenterTone;
};

export type CommandSourceData = {
  readonly change: string;
  readonly cr: string;
  readonly gmv: number;
  readonly name: string;
  readonly share: number;
  readonly tone: CommandCenterTone;
};

export type CommandProductData = {
  readonly gmv: number;
  readonly id: string;
  readonly margin: number;
  readonly name: string;
  readonly quadrant: string;
  readonly share: number;
  readonly signal: string;
  readonly trend: 'down' | 'up';
};

export type CommandCustomerCohort = {
  readonly newCount: number;
  readonly newGmv: number;
  readonly retCount: number;
  readonly retGmv: number;
  readonly week: string;
};

export type CommandCustomersData = {
  readonly newAov: string;
  readonly newCount: number;
  readonly repeatPurchaseRate: string;
  readonly retAov: string;
  readonly retCount: number;
  readonly returningShare: string;
  readonly takeaway: string;
};

export type CommandIntegrationData = {
  readonly lastSync: string;
  readonly latency: string;
  readonly name: string;
  readonly status: CommandIntegrationStatus;
  readonly type: string;
};

export type CommandMetaData = {
  readonly currency: string;
  readonly dataQualityScore: number;
  readonly lastSync: string;
  readonly tenantId: string;
};

export type CommandCenterScreenData = {
  readonly compareMode: CommandCompareMode;
  readonly customerCohorts: readonly CommandCustomerCohort[];
  readonly customers: CommandCustomersData;
  readonly decisions: readonly CommandDecisionData[];
  readonly driversWaterfall: readonly CommandDriverData[];
  readonly funnel: readonly CommandFunnelStep[];
  readonly guardian: CommandGuardianData;
  readonly integrations: readonly CommandIntegrationData[];
  readonly kpis: readonly CommandKpiData[];
  readonly meta: CommandMetaData;
  readonly plan: CommandPlanData;
  readonly products: readonly CommandProductData[];
  readonly risks: readonly CommandRiskData[];
  readonly sections: readonly CommandCenterSection[];
  readonly sources: readonly CommandSourceData[];
  readonly timeSeries: readonly CommandTimeSeriesPoint[];
  readonly trendMetrics: readonly CommandTrendMetricConfig[];
};

export type CommandCenterScreenProps = {
  readonly data: CommandCenterScreenData;
};
