import type {
  PapaDataIconName,
} from '../../../design-system';

export type CommandCenterTone =
  | 'amber'
  | 'blue'
  | 'cyan'
  | 'emerald'
  | 'indigo'
  | 'rose'
  | 'slate'
  | 'violet';

/**
 * Single source of truth for every business section this module renders:
 * section headers, the floating topbar, and anchor navigation are all
 * generated from this one array — none of them hand-type a title/label
 * or an anchor id separately.
 */
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
  {
    label: '1D',
    value: '1d',
  },
  {
    label: '7D',
    value: '7d',
  },
  {
    label: '30D',
    value: '30d',
  },
  {
    label: '90D',
    value: '90d',
  },
  {
    label: 'Własny',
    value: 'custom',
  },
] as const;

export type CommandDateRange = typeof commandDateRanges[number]['value'];

export const commandCompareOptions = [
  {
    label: 'vs poprzedni okres',
    value: 'previous_period',
  },
  {
    label: 'vs rok wcześniej (r/r)',
    value: 'same_period_last_year',
  },
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

export const commandMeta = {
  currency: 'PLN',
  dataQualityScore: 85,
  lastSync: 'Dzisiaj, 14:23',
  tenantId: 't-8842-prod',
} as const;

export const commandKpis = [
  {
    id: 'gmv',
    name: 'Sprzedaż (GMV)',
    value: 128450,
    previous: 114280,
    change: 12.4,
    status: 'normal',
    metricKey: 'gmv',
    unit: 'zł',
    icon: 'billing',
    sparkline: [40, 45, 42, 55, 62, 58, 70, 75, 82],
    description: 'Łączna wartość zamówień w wybranym okresie, przed odliczeniem zwrotów i kosztów.',
  },
  {
    id: 'orders',
    name: 'Zamówienia',
    value: 1420,
    previous: 1313,
    change: 8.1,
    status: 'insight',
    metricKey: 'orders',
    unit: '',
    icon: 'data',
    sparkline: [110, 115, 120, 130, 125, 140, 142],
    description: 'Liczba zamówień ze statusem realizowanym lub zakończonym w wybranym okresie.',
  },
  {
    id: 'aov',
    name: 'Średnia wartość zamówienia (AOV)',
    value: 90.45,
    previous: 93.44,
    change: -3.2,
    status: 'warning',
    metricKey: 'aov',
    unit: 'zł',
    icon: 'trend',
    sparkline: [95, 94, 93, 92, 91, 90.45],
    description: 'AOV = Sprzedaż (GMV) ÷ liczba zamówień w tym samym okresie.',
  },
  {
    id: 'roas',
    name: 'Blended ROAS',
    value: 4.15,
    previous: 3.94,
    change: 5.3,
    status: 'normal',
    metricKey: 'roas',
    unit: 'x',
    icon: 'integration',
    sparkline: [3.8, 3.9, 4.0, 4.1, 4.15],
    description: 'Zwrot z wydatków reklamowych łącznie dla wszystkich kanałów: przychód przypisany ÷ wydatek na reklamę.',
  },
  {
    id: 'ad_spend',
    name: 'Koszt reklamy',
    value: 18200,
    previous: 15268,
    change: 19.2,
    status: 'critical',
    metricKey: 'ad_spend',
    unit: 'zł',
    icon: 'warning',
    sparkline: [12, 14, 15, 16, 18.2],
    description: 'Łączny wydatek na kampanie płatne (Meta Ads + Google Ads) w wybranym okresie.',
  },
  {
    id: 'cac',
    name: 'Koszt pozyskania (CAC)',
    value: 32.50,
    previous: 29.50,
    change: 10.1,
    status: 'warning',
    metricKey: 'cac',
    unit: 'zł',
    icon: 'customers',
    sparkline: [28, 29, 30, 31, 32.5],
    description: 'CAC = koszt reklamy ÷ liczba nowych klientów pozyskanych w wybranym okresie.',
  },
] as const satisfies readonly CommandKpi[];

export type CommandTrendMetric =
  | 'adSpend'
  | 'gmv'
  | 'orders'
  | 'roas';

export const commandTrendMetrics = [
  {
    label: 'Sprzedaż (GMV)',
    tone: 'blue',
    unit: 'PLN',
    value: 'gmv',
  },
  {
    label: 'Koszt Reklamy',
    tone: 'rose',
    unit: 'PLN',
    value: 'adSpend',
  },
  {
    label: 'Zamówienia',
    tone: 'emerald',
    unit: 'szt.',
    value: 'orders',
  },
  {
    label: 'ROAS',
    tone: 'violet',
    unit: 'x',
    value: 'roas',
  },
] as const satisfies readonly {
  readonly label: string;
  readonly tone: CommandCenterTone;
  readonly unit: string;
  readonly value: CommandTrendMetric;
}[];

export const commandTimeSeries = [
  { date: '01 Aug', gmv: 7200, adSpend: 1100, orders: 80, roas: 4.2 },
  { date: '03 Aug', gmv: 8100, adSpend: 1250, orders: 88, roas: 4.1 },
  { date: '05 Aug', gmv: 7900, adSpend: 1200, orders: 85, roas: 4.3 },
  { date: '07 Aug', gmv: 9400, adSpend: 1400, orders: 102, roas: 4.4 },
  { date: '09 Aug', gmv: 10200, adSpend: 1600, orders: 110, roas: 4.2 },
  { date: '11 Aug', gmv: 9800, adSpend: 1550, orders: 105, roas: 4.0 },
  { date: '13 Aug', gmv: 11500, adSpend: 1750, orders: 122, roas: 4.3 },
  { date: '15 Aug', gmv: 10900, adSpend: 1700, orders: 118, roas: 4.1 },
  { date: '17 Aug', gmv: 12400, adSpend: 1900, orders: 135, roas: 4.2 },
  { date: '19 Aug', gmv: 13100, adSpend: 2100, orders: 142, roas: 3.9 },
  { date: '21 Aug', gmv: 12800, adSpend: 2000, orders: 138, roas: 4.0 },
  { date: '23 Aug', gmv: 14200, adSpend: 2200, orders: 155, roas: 4.2 },
] as const satisfies readonly {
  readonly adSpend: number;
  readonly date: string;
  readonly gmv: number;
  readonly orders: number;
  readonly roas: number;
}[];

export const commandGuardian = {
  action: 'Zweryfikuj kampanie Meta Ads o najwyższym CPA i przenieś 15% budżetu do wysoko marżowych grup produktów.',
  summary: 'Wynik rośnie (+12.4% GMV), ale wzrost jest coraz silniej zależny od płatnego ruchu przy rosnącym koszcie reklamy (+19.2%).',
  why: 'Zamówienia wzrosły o 8.1%, podczas gdy AOV spadło o 3.2%. Koszt reklamy wzrósł nieproporcjonalnie szybciej niż ogólna sprzedaż.',
} as const;

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

export const commandDecisions = [
  {
    id: 'dec-1',
    title: 'Optymalizacja budżetu kampanii retargetingowych',
    category: 'kampanie',
    reason: 'CPA w kampanii Meta Ads Retargeting wzrosło o 34% przy braku wzrostu konwersji.',
    impact: 'Wysoki (+4 200 zł marży/m-c)',
    impactValue: 4200,
    confidence: 'Wysoka (92%)',
    type: 'rule',
    sourceMetricKeys: ['ad_spend', 'cac', 'roas'],
    simulatable: true,
  },
  {
    id: 'dec-2',
    title: 'Zapobieżenie stockoutowi Produktu Flagowego Alpha',
    category: 'produkty',
    reason: 'Zapasy wystarczą na 4 dni przy obecnym tempie sprzedaży.',
    impact: 'Wysoki (Ryzyko utraty ~12 000 zł przychodu)',
    impactValue: 12000,
    confidence: 'Bardzo wysoka (98%)',
    type: 'ai',
    sourceMetricKeys: ['gmv', 'inventory'],
    simulatable: false,
  },
  {
    id: 'dec-3',
    title: 'Wdrożenie ratowania porzuconych koszyków na etapie Checkout',
    category: 'konwersja',
    reason: 'Spadek konwersji na kroku Checkout -> Zakup o 14% w ciągu ostatnich 7 dni.',
    impact: 'Średni (+2 800 zł / m-c)',
    impactValue: 2800,
    confidence: 'Średnia (84%)',
    type: 'rule',
    sourceMetricKeys: ['conversion_rate', 'funnel_checkout'],
    simulatable: true,
  },
] as const satisfies readonly CommandDecision[];

export const commandPlan = {
  actual: 128450,
  completion: 85.6,
  forecast: 146800,
  forecastCompletion: 97.9,
  statusText: 'Przy obecnym tempie cel jest zagrożony o około 3 200 zł (97.9% realizacji).',
  target: 150000,
} as const;

export type CommandDriverType =
  | 'base'
  | 'negative'
  | 'positive'
  | 'total';

export const commandDriversWaterfall = [
  { name: 'Baza Poprzedni Okres', type: 'base', amount: 114280 },
  { name: 'Liczba Zamówień', type: 'positive', amount: 12210 },
  { name: 'Skalowanie Meta Ads', type: 'positive', amount: 8900 },
  { name: 'Spadek AOV', type: 'negative', amount: -4240 },
  { name: 'Rabat Letni', type: 'negative', amount: -2700 },
  { name: 'Wynik Aktualny (GMV)', type: 'total', amount: 128450 },
] as const satisfies readonly {
  readonly amount: number;
  readonly name: string;
  readonly type: CommandDriverType;
}[];

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

export const commandRisks = [
  {
    id: 'r1',
    severity: 'critical',
    status: 'open',
    title: 'Konwersja na krok Checkout spadła o 14%',
    desc: 'Spadek odpowiada za szacowaną stratę 6 400 zł przychodu.',
    impact: '-6 400 zł',
    action: 'Sprawdź spójność metod płatności i błędy JS w koszyku.',
  },
  {
    id: 'r2',
    severity: 'warning',
    status: 'open',
    title: 'Wzrost budżetu reklamowego o 19% bez wzrostu AOV',
    desc: 'Koszt pozyskania klienta rośnie szybciej niż LTV.',
    impact: '-3 100 zł marży',
    action: 'Przegląd progów rabatowych i darmowej dostawy.',
  },
  {
    id: 'r3',
    severity: 'info',
    status: 'acknowledged',
    title: 'Wysoka koncentracja przychodu (Top 1 produkt = 38% GMV)',
    desc: 'Podatność biznesu na wahania dostaw pojedynczego indeksu.',
    impact: 'Ryzyko operacyjne',
    action: 'Rozwiń promocję alternatywnych linii produktowych.',
  },
] as const satisfies readonly CommandRisk[];

export const commandFunnel = [
  {
    stage: '1. Sesje w sklepie',
    count: 45200,
    rate: '100%',
    delta: '+4.2%',
    pctOfTotal: 100,
    tone: 'blue',
    description: 'Liczba unikalnych sesji w sklepie w wybranym okresie — punkt wejścia lejka.',
  },
  {
    stage: '2. Koszyk',
    count: 3840,
    rate: '8.5%',
    delta: '+0.4%',
    pctOfTotal: 42,
    tone: 'indigo',
    description: 'Sesje, w których dodano co najmniej jeden produkt do koszyka.',
  },
  {
    stage: '3. Checkout',
    count: 2120,
    rate: '55.2%',
    delta: '-2.1%',
    pctOfTotal: 24,
    tone: 'violet',
    description: 'Sesje, które przeszły do procesu finalizacji zamówienia (checkout).',
  },
  {
    stage: '4. Zakup',
    count: 1420,
    rate: '67.0%',
    delta: '-14.0%',
    pctOfTotal: 16,
    tone: 'emerald',
    description: 'Sesje zakończone złożeniem zamówienia — dół lejka konwersji.',
  },
] as const satisfies readonly {
  readonly count: number;
  readonly delta: string;
  readonly description: string;
  readonly pctOfTotal: number;
  readonly rate: string;
  readonly stage: string;
  readonly tone: CommandCenterTone;
}[];

export const commandSources = [
  { name: 'Paid Ads (Meta/Google)', gmv: 62940, share: 49, change: '+18.2%', cr: '3.4%', tone: 'blue' },
  { name: 'Organic Search (SEO)', gmv: 34680, share: 27, change: '+5.1%', cr: '3.1%', tone: 'emerald' },
  { name: 'Direct / Bezpośrednie', gmv: 19268, share: 15, change: '-2.4%', cr: '2.8%', tone: 'amber' },
  { name: 'E-mail Marketing', gmv: 11562, share: 9, change: '+12.0%', cr: '4.8%', tone: 'violet' },
] as const satisfies readonly {
  readonly change: string;
  readonly cr: string;
  readonly gmv: number;
  readonly name: string;
  readonly share: number;
  readonly tone: CommandCenterTone;
}[];

export type CommandProductSort =
  | 'gmv'
  | 'margin';

export const commandProducts = [
  { id: 'p1', name: 'Zestaw Premium Alpha V2', gmv: 48811, share: 38, margin: 42, trend: 'up', signal: 'Koncentracja', quadrant: 'Gwiazdy' },
  { id: 'p2', name: 'Suplement Daily Core 60', gmv: 24405, share: 19, margin: 65, trend: 'up', signal: 'W normie', quadrant: 'Gwiazdy' },
  { id: 'p3', name: 'Akcesorium SmartBand X', gmv: 15414, share: 12, margin: 28, trend: 'down', signal: 'Spadek marży', quadrant: 'Niska marża' },
  { id: 'p4', name: 'Pakiet Startowy Baza', gmv: 11560, share: 9, margin: 50, trend: 'up', signal: 'W normie', quadrant: 'Okazje' },
  { id: 'p5', name: 'Kolekcja Edycja Limitowana', gmv: 8990, share: 7, margin: 35, trend: 'down', signal: 'Niski zapas', quadrant: 'Okazje' },
] as const satisfies readonly {
  readonly gmv: number;
  readonly id: string;
  readonly margin: number;
  readonly name: string;
  readonly quadrant: string;
  readonly share: number;
  readonly signal: string;
  readonly trend: 'down' | 'up';
}[];

export const commandCustomerCohorts = [
  { week: 'Tydz 1', newCount: 210, retCount: 110, newGmv: 17600, retGmv: 11100 },
  { week: 'Tydz 2', newCount: 225, retCount: 125, newGmv: 18900, retGmv: 12600 },
  { week: 'Tydz 3', newCount: 215, retCount: 140, newGmv: 18100, retGmv: 14100 },
  { week: 'Tydz 4', newCount: 240, retCount: 155, newGmv: 20200, retGmv: 15650 },
] as const;

export const commandCustomers = {
  newAov: '84.20 zł',
  newCount: 890,
  repeatPurchaseRate: '24.8%',
  retAov: '101.00 zł',
  retCount: 530,
  returningShare: '37.3%',
  takeaway: 'Wzrost napędzany głównie nowymi klientami. Warto wdrożyć automatyzację drugiego zakupu, gdyż klienci powracający generują o 20% wyższy AOV.',
} as const;

export type CommandIntegrationStatus =
  | 'fresh'
  | 'partial'
  | 'stale';

export const commandIntegrations = [
  { name: 'Shopify Storefront', type: 'commerce', status: 'fresh', lastSync: '3 min temu', latency: '42 ms' },
  { name: 'Google Ads API', type: 'ads', status: 'fresh', lastSync: '12 min temu', latency: '88 ms' },
  { name: 'Meta Ads Manager', type: 'ads', status: 'stale', lastSync: '3 godz. temu (opóźnienie)', latency: '320 ms' },
  { name: 'Subiekt GT ERP', type: 'erp', status: 'partial', lastSync: 'Brak synchronizacji kosztów', latency: '1400 ms' },
] as const satisfies readonly {
  readonly lastSync: string;
  readonly latency: string;
  readonly name: string;
  readonly status: CommandIntegrationStatus;
  readonly type: string;
}[];
