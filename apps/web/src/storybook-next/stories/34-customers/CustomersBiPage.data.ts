import type {
  PapaDataIconName,
} from '../../../design-system';

export type CustomersTone =
  | 'amber'
  | 'blue'
  | 'cyan'
  | 'emerald'
  | 'indigo'
  | 'rose'
  | 'slate'
  | 'violet';

export const customerSections = [
  {
    icon: 'decisions',
    id: 'wynik',
    navLabel: 'Wynik',
    title: 'Wynik klientów',
  },
  {
    icon: 'calendar',
    id: 'retencja',
    navLabel: 'Retencja',
    title: 'Retencja klientów',
  },
  {
    icon: 'customers',
    id: 'segmentacja',
    navLabel: 'Segmentacja',
    title: 'Segmentacja klientów',
  },
  {
    icon: 'billing',
    id: 'wartosc',
    navLabel: 'LTV',
    title: 'Wartość klienta',
  },
  {
    icon: 'integration',
    id: 'pozyskanie',
    navLabel: 'Pozyskanie',
    title: 'Pozyskanie klientów',
  },
  {
    icon: 'products',
    id: 'preferencje',
    navLabel: 'Produkty',
    title: 'Preferencje produktowe',
  },
  {
    icon: 'search',
    id: 'eksplorator',
    navLabel: 'Klienci',
    title: 'Eksplorator klientów',
  },
  {
    icon: 'assistant',
    id: 'insight',
    navLabel: 'Papa AI',
    title: 'Podsumowanie Papa AI',
  },
] as const satisfies readonly {
  readonly icon: PapaDataIconName;
  readonly id: string;
  readonly navLabel: string;
  readonly title: string;
}[];

export type CustomerSectionId = typeof customerSections[number]['id'];

export const customerSectionsById = customerSections.reduce((accumulator, section) => {
  accumulator[section.id] = section;
  return accumulator;
}, {} as Record<CustomerSectionId, typeof customerSections[number]>);

export const customerPeriodOptions = [
  {
    label: 'Ostatnie 30 dni',
    value: '30',
  },
  {
    label: 'Ostatnie 90 dni',
    value: '90',
  },
  {
    label: 'Ostatnie 12 miesięcy',
    value: '365',
  },
] as const;

export const customerSourceOptions = [
  {
    label: 'Wszystkie kanały (Woo + Base)',
    value: 'all',
  },
  {
    label: 'WooCommerce Sklep',
    value: 'woo',
  },
  {
    label: 'BaseLinker Marketplaces',
    value: 'baselinker',
  },
] as const;

export type CustomerGlobalFilters = {
  readonly period: typeof customerPeriodOptions[number]['value'];
  readonly source: typeof customerSourceOptions[number]['value'];
};

export const customerDefaultFilters: CustomerGlobalFilters = {
  period: '30',
  source: 'all',
};

export const customerPeriodActiveCustomers = {
  30: '3 842',
  90: '8 420',
  365: '18 920',
} as const;

export type CustomerDataBadge =
  | 'Model'
  | 'Wyliczone';

export type CustomerProvenanceKey =
  | 'active_customers'
  | 'at_risk'
  | 'new_customers'
  | 'observed_ltv'
  | 'repeat_rate'
  | 'returning_share';

export const customerKpis = [
  {
    title: 'Aktywni Klienci',
    value: '3 842',
    periodValues: customerPeriodActiveCustomers,
    badge: 'Wyliczone',
    badgeTone: 'emerald',
    trend: '↑ 5.2%',
    note: 'vs poprz. okres',
    footer: 'Kupujący z min. 1 zamówieniem w okresie',
    provenanceKey: 'active_customers',
  },
  {
    title: 'Nowi Klienci',
    value: '2 366',
    badge: 'Wyliczone',
    badgeTone: 'emerald',
    trend: '↑ 3.8%',
    note: '61,6% aktywnych',
    footer: 'Pierwsze kwalifikowane zamówienie',
    provenanceKey: 'new_customers',
  },
  {
    title: 'Udział Powracających',
    value: '38,4%',
    badge: 'Wyliczone',
    badgeTone: 'emerald',
    trend: '↑ 1.4 pp',
    note: '1 476 klientów',
    footer: '% aktywnych pozyskanych wcześniej',
    provenanceKey: 'returning_share',
  },
  {
    title: 'Repeat Purchase Rate',
    value: '41,1%',
    badge: 'Wyliczone',
    badgeTone: 'emerald',
    trend: '↑ 0.8 pp',
    note: 'kohorta M1+',
    footer: '% klientów z min. 2. zakupy w kohorcie',
    provenanceKey: 'repeat_rate',
  },
  {
    title: 'Observed Avg Value',
    value: '482 zł',
    badge: 'Wyliczone',
    badgeTone: 'emerald',
    trend: '↑ 12 zł',
    note: 'historical sum/cust',
    footer: 'Rzeczywista skumulowana wartość',
    provenanceKey: 'observed_ltv',
  },
  {
    title: 'High-Value At-Risk',
    value: '318',
    badge: 'Model',
    badgeTone: 'amber',
    trend: '↑ 24',
    note: 'przekroczony cykl',
    footer: 'Wymagają natychmiastowej akcji',
    provenanceKey: 'at_risk',
  },
] as const satisfies readonly {
  readonly badge: CustomerDataBadge;
  readonly badgeTone: CustomersTone;
  readonly footer: string;
  readonly note: string;
  readonly periodValues?: typeof customerPeriodActiveCustomers;
  readonly provenanceKey: CustomerProvenanceKey;
  readonly title: string;
  readonly trend: string;
  readonly value: string;
}[];

export const customerProvenanceDict: Record<CustomerProvenanceKey, {
  readonly badge: CustomerDataBadge;
  readonly coverage: string;
  readonly notes: string;
  readonly source: string;
  readonly title: string;
}> = {
  active_customers: {
    title: 'Aktywni Klienci',
    badge: 'Wyliczone',
    source: 'Kwalifikowane zamówienia w okresie',
    coverage: 'Identity Coverage 94,3%',
    notes: 'Kupujący z minimum jednym zamówieniem w aktywnym zakresie czasu.',
  },
  new_customers: {
    title: 'Nowi Klienci',
    badge: 'Wyliczone',
    source: 'Pierwsze kwalifikowane zamówienie klienta',
    coverage: 'Identity Coverage 94,3%',
    notes: 'Klient jest nowy, jeśli pierwsze kwalifikowane zamówienie przypada na badany okres.',
  },
  returning_share: {
    title: 'Udział Powracających',
    badge: 'Wyliczone',
    source: 'Aktywni klienci pozyskani wcześniej',
    coverage: 'Identity Coverage 94,3%',
    notes: 'Nowi i powracający są rozłącznymi podzbiorami aktywnych kupujących.',
  },
  repeat_rate: {
    title: 'Repeat Purchase Rate',
    badge: 'Wyliczone',
    source: 'Kohorty M1+',
    coverage: 'Right-censoring obsługiwany jako N/A',
    notes: 'Nie zaniża przyszłych miesięcy przez wpisywanie 0% dla niezamkniętych kohort.',
  },
  observed_ltv: {
    title: 'Observed Avg Value',
    badge: 'Wyliczone',
    source: 'Historyczna suma wartości klienta',
    coverage: 'Observed LTV',
    notes: 'Rzeczywista skumulowana wartość, bez predykcyjnego mnożnika.',
  },
  at_risk: {
    title: 'High-Value At-Risk',
    badge: 'Model',
    source: 'Observed LTV + RFM + interpurchase interval',
    coverage: '318 klientów',
    notes: 'Klienci wysokiej wartości po przekroczeniu indywidualnego cyklu ponownego zakupu.',
  },
};

export const customerTrendModes = [
  {
    label: 'Klienci',
    value: 'customers',
  },
  {
    label: 'Przychód (zł)',
    value: 'revenue',
  },
  {
    label: 'Zamówienia',
    value: 'orders',
  },
  {
    label: 'AOV (zł)',
    value: 'aov',
  },
  {
    label: 'Marża Brutto (%)',
    value: 'margin',
  },
] as const;

export type CustomerTrendMode = typeof customerTrendModes[number]['value'];

export const customerTrendLabels = [
  'Tydzień 1',
  'Tydzień 2',
  'Tydzień 3',
  'Tydzień 4',
] as const;

export const customerTrendSeries = {
  customers: {
    newCustomers: [540, 580, 610, 636],
    returningCustomers: [340, 370, 376, 390],
    newValue: '2 366 (61.6%)',
    returningValue: '1 476 (38.4%)',
  },
  revenue: {
    newCustomers: [118800, 127600, 134200, 139920],
    returningCustomers: [106080, 115440, 117312, 121680],
    newValue: '520 520 zł (45.8%)',
    returningValue: '460 512 zł (54.2%)',
  },
  orders: {
    newCustomers: [540, 580, 610, 636],
    returningCustomers: [420, 460, 480, 510],
    newValue: '2 366 zamówień',
    returningValue: '1 870 zamówień',
  },
  aov: {
    newCustomers: [220, 220, 220, 220],
    returningCustomers: [312, 312, 312, 312],
    newValue: '220 zł (Średni AOV)',
    returningValue: '312 zł (Średni AOV)',
  },
  margin: {
    newCustomers: [42, 43, 41, 42],
    returningCustomers: [54, 55, 54, 56],
    newValue: '42.0% Średnia Marża',
    returningValue: '54.8% Średnia Marża',
  },
} as const;

export const customerCohortOptions = [
  {
    label: 'Średnia Mediana Kohort',
    value: 'all',
  },
  {
    label: 'Styczeń 2026 (1 420 cust)',
    value: '2026-01',
  },
  {
    label: 'Luty 2026 (1 618 cust)',
    value: '2026-02',
  },
  {
    label: 'Marzec 2026 (1 742 cust)',
    value: '2026-03',
  },
  {
    label: 'Kwiecień 2026 (1 810 cust)',
    value: '2026-04',
  },
] as const;

export type CustomerCohortSelection = typeof customerCohortOptions[number]['value'];

export const customerCohortRows = [
  {
    cohort: 'Styczeń 2026',
    base: 1420,
    m0: '100%',
    m1: '35,2%',
    m2: '28,1%',
    m3: '24,0%',
    m4: '21,2%',
    m6: '18,4%',
  },
  {
    cohort: 'Luty 2026',
    base: 1618,
    m0: '100%',
    m1: '38,0%',
    m2: '30,2%',
    m3: '26,1%',
    m4: '23,0%',
    m6: '19,1%',
  },
  {
    cohort: 'Marzec 2026',
    base: 1742,
    m0: '100%',
    m1: '41,1%',
    m2: '33,4%',
    m3: '28,8%',
    m4: '25,1%',
    m6: 'N/A',
  },
  {
    cohort: 'Kwiecień 2026',
    base: 1810,
    m0: '100%',
    m1: '37,4%',
    m2: '29,8%',
    m3: 'N/A',
    m4: 'N/A',
    m6: 'N/A',
  },
] as const;

export const customerRetentionCurve = {
  all: [100, 37.9, 30.4, 26.3, 23.1, 18.8],
  '2026-01': [100, 35.2, 28.1, 24, 21.2, 18.4],
  '2026-02': [100, 38, 30.2, 26.1, 23, 19.1],
  '2026-03': [100, 41.1, 33.4, 28.8, 25.1, null],
  '2026-04': [100, 37.4, 29.8, null, null, null],
} as const satisfies Record<CustomerCohortSelection, readonly (number | null)[]>;

export const customerRetentionLabels = [
  'M0',
  'M1',
  'M2',
  'M3',
  'M4',
  'M6',
] as const;

export const customerRfmSegments = [
  {
    name: 'Champions',
    count: '1 842',
    numericCount: 1842,
    score: '555',
    description: 'Najwyższa częstotliwość i przychód',
    tone: 'indigo',
  },
  {
    name: 'Loyal Customers',
    count: '3 114',
    numericCount: 3114,
    score: '444',
    description: 'Regularne zakupy, wysoki LTV',
    tone: 'emerald',
  },
  {
    name: 'Potential Loyalist',
    count: '2 410',
    numericCount: 2410,
    score: '343',
    description: 'Ostatnie zakupy, powtarzalni',
    tone: 'cyan',
  },
  {
    name: 'At Risk',
    count: '816',
    numericCount: 816,
    score: '244',
    description: 'Wysoka wartość, długa przerwa',
    tone: 'amber',
  },
  {
    name: 'Hibernating',
    count: '421',
    numericCount: 421,
    score: '122',
    description: 'Niska aktywność, dawny zakup',
    tone: 'slate',
  },
  {
    name: 'Lost Buyers',
    count: '286',
    numericCount: 286,
    score: '111',
    description: 'Brak zakupu >180 dni',
    tone: 'rose',
  },
] as const satisfies readonly {
  readonly count: string;
  readonly description: string;
  readonly name: string;
  readonly numericCount: number;
  readonly score: string;
  readonly tone: CustomersTone;
}[];

export const customerLtvPareto = [
  {
    bucket: '<200 zł',
    customers: 12400,
    cumulativeRevenue: 18,
  },
  {
    bucket: '200-499 zł',
    customers: 7800,
    cumulativeRevenue: 44,
  },
  {
    bucket: '500-999 zł',
    customers: 3200,
    cumulativeRevenue: 68,
  },
  {
    bucket: '1000-1999 zł',
    customers: 1100,
    cumulativeRevenue: 85,
  },
  {
    bucket: '2000+ zł',
    customers: 360,
    cumulativeRevenue: 100,
  },
] as const;

export const customerParetoConcentration = [
  {
    label: 'Top 1% Klientów:',
    value: '18,4% Prchodu',
  },
  {
    label: 'Top 5% Klientów:',
    value: '36,2% Prchodu',
  },
  {
    label: 'Top 10% Klientów:',
    value: '52,8% Prchodu',
  },
] as const;

export const customerAcquisitionRows = [
  {
    source: 'Google Ads',
    newCust: 842,
    cac: 72,
    cacLabel: '72 zł',
    ltv: 612,
    ltvLabel: '612 zł',
    ratio: '8.5x',
  },
  {
    source: 'Meta Ads',
    newCust: 1204,
    cac: 54,
    cacLabel: '54 zł',
    ltv: 418,
    ltvLabel: '418 zł',
    ratio: '7.7x',
  },
  {
    source: 'Organic Search',
    newCust: 182,
    cac: 12,
    cacLabel: '12 zł',
    ltv: 520,
    ltvLabel: '520 zł',
    ratio: '43.3x',
  },
  {
    source: 'Direct',
    newCust: 94,
    cac: 5,
    cacLabel: '5 zł',
    ltv: 490,
    ltvLabel: '490 zł',
    ratio: '98.0x',
  },
  {
    source: 'Newsletter',
    newCust: 44,
    cac: 18,
    cacLabel: '18 zł',
    ltv: 580,
    ltvLabel: '580 zł',
    ratio: '32.2x',
  },
] as const;

export const customerAffinity = {
  newProducts: [
    {
      name: 'Serum Witamina C 30ml',
      orders: 842,
      revenue: '185 240 zł',
    },
    {
      name: 'Starter Set Pielęgnacyjny',
      orders: 612,
      revenue: '153 000 zł',
    },
    {
      name: 'Krem Nawilżający Mini 15ml',
      orders: 420,
      revenue: '46 200 zł',
    },
  ],
  returningProducts: [
    {
      name: 'Refill Serum Witamina C 50ml',
      orders: 1120,
      revenue: '313 600 zł',
    },
    {
      name: 'Krem Odbudowujący Barrier 50ml',
      orders: 890,
      revenue: '249 200 zł',
    },
    {
      name: 'Zestaw Uzupełniający XXL',
      orders: 410,
      revenue: '184 500 zł',
    },
  ],
} as const;

export type CustomerRiskStatus =
  | 'active'
  | 'at_risk'
  | 'lapsed';

export type CustomerExplorerRow = {
  readonly aov: string;
  readonly id: string;
  readonly ltv: string;
  readonly orders: number;
  readonly recency: string;
  readonly risk: CustomerRiskStatus;
  readonly riskLabel: string;
  readonly score: string;
  readonly segment: string;
};

const customerIdPrefix = 'Klient #';

export const customerExplorerRows = [
  {
    id: `${customerIdPrefix}A73F21`,
    segment: 'Champions',
    score: '545',
    recency: '9 dni',
    orders: 14,
    ltv: '4 820 zł',
    aov: '344 zł',
    risk: 'active',
    riskLabel: 'Active',
  },
  {
    id: `${customerIdPrefix}B18F92`,
    segment: 'At Risk',
    score: '244',
    recency: '74 dni',
    orders: 8,
    ltv: '3 910 zł',
    aov: '488 zł',
    risk: 'at_risk',
    riskLabel: 'At Risk',
  },
  {
    id: `${customerIdPrefix}D82A11`,
    segment: 'Loyal',
    score: '444',
    recency: '18 dni',
    orders: 6,
    ltv: '2 840 zł',
    aov: '473 zł',
    risk: 'active',
    riskLabel: 'Active',
  },
  {
    id: `${customerIdPrefix}E99C04`,
    segment: 'Champions',
    score: '555',
    recency: '4 dni',
    orders: 21,
    ltv: '8 920 zł',
    aov: '424 zł',
    risk: 'active',
    riskLabel: 'Active',
  },
  {
    id: `${customerIdPrefix}F22B88`,
    segment: 'Hibernating',
    score: '122',
    recency: '140 dni',
    orders: 2,
    ltv: '640 zł',
    aov: '320 zł',
    risk: 'lapsed',
    riskLabel: 'Lapsed',
  },
  {
    id: `${customerIdPrefix}C33190`,
    segment: 'At Risk',
    score: '255',
    recency: '68 dni',
    orders: 11,
    ltv: '5 400 zł',
    aov: '490 zł',
    risk: 'at_risk',
    riskLabel: 'At Risk',
  },
  {
    id: 'Klient #G44102',
    segment: 'New',
    score: '511',
    recency: '2 dni',
    orders: 1,
    ltv: '280 zł',
    aov: '280 zł',
    risk: 'active',
    riskLabel: 'Active',
  },
  {
    id: 'Klient #H99182',
    segment: 'Need Attention',
    score: '323',
    recency: '42 dni',
    orders: 4,
    ltv: '1 420 zł',
    aov: '355 zł',
    risk: 'active',
    riskLabel: 'Active',
  },
  {
    id: 'Klient #K11029',
    segment: 'Champions',
    score: '554',
    recency: '12 dni',
    orders: 16,
    ltv: '6 780 zł',
    aov: '423 zł',
    risk: 'active',
    riskLabel: 'Active',
  },
  {
    id: 'Klient #L88371',
    segment: 'At Risk',
    score: '144',
    recency: '82 dni',
    orders: 7,
    ltv: '3 120 zł',
    aov: '445 zł',
    risk: 'at_risk',
    riskLabel: 'At Risk',
  },
] as const satisfies readonly CustomerExplorerRow[];

export const customerSegmentFilterOptions = [
  {
    label: 'Wszystkie Segmenty RFM',
    value: 'all',
  },
  {
    label: 'Champions (555)',
    value: 'Champions',
  },
  {
    label: 'Loyal Customers',
    value: 'Loyal',
  },
  {
    label: 'At Risk (Wysoka wartość)',
    value: 'At Risk',
  },
  {
    label: 'Hibernating',
    value: 'Hibernating',
  },
] as const;

export const customerRiskFilterOptions = [
  {
    label: 'Wszystkie Statusy Ryzyka',
    value: 'all',
  },
  {
    label: 'Active (Kupujący)',
    value: 'active',
  },
  {
    label: 'At Risk (Zagrożony)',
    value: 'at_risk',
  },
  {
    label: 'Lapsed (Utracony proxy)',
    value: 'lapsed',
  },
] as const;

export const customerAiInsights = [
  {
    title: 'Spadek Retencji M1 Kohorty Majowej',
    confidence: 'Pewność: Wysoka',
    tone: 'amber',
    lines: [
      ['Obserwacja:', 'Retencja M1 dla kohorty z maja spadła z 31,8% do 25,6% (-6.2 pp).'],
      ['Dowód:', 'Analiza 1 842 klientów pozyskanych w maju przy pierwszej akcji rabatowej >20%.'],
      ['Interpretacja:', 'Promocyjni klienci nie convertują bez dodatkowego bodźca w pierwszych 30 dniach.'],
      ['Rekomendacja:', 'Przygotuj sekwencję win-back opartą na rekomendacji produktów powtórnych z wysoką marżą.'],
    ],
    impact: 'Szacowany wpływ: +114 klientów repeat',
    action: 'Pokaż Dowody →',
    actionKind: 'filter',
  },
  {
    title: 'Potencjał Kros-sellingu Champions',
    confidence: 'Pewność: Wysoka',
    tone: 'emerald',
    lines: [
      ['Obserwacja:', 'Segment Champions wykazuje marżę brutto na poziomie 54.2% i niska stopę zwrotów (1.8%).'],
      ['Dowód:', '1 842 klientów odpowiada za 41.2% całkowitej marży portfela.'],
      ['Interpretacja:', 'Brak programu lojalnościowego lub priorytetowej obsługi ogranicza ich LTV.'],
      ['Rekomendacja:', 'Wdrożenie VIP Early Access do nowych kolekcji produktów.'],
    ],
    impact: 'Szacowany wpływ: +84 000 zł LTV',
    action: 'Analizuj Szczegóły →',
    actionKind: 'modal',
  },
] as const satisfies readonly {
  readonly action: string;
  readonly actionKind: 'filter' | 'modal';
  readonly confidence: string;
  readonly impact: string;
  readonly lines: readonly (readonly [string, string])[];
  readonly title: string;
  readonly tone: CustomersTone;
}[];

export const customerFreshInsight = {
  title: 'Nowy Wnioski: Optymalizacja Interpurchase Cycle',
  confidence: 'Świeży',
  tone: 'indigo',
  lines: [
    ['Obserwacja:', 'Średni odstęp między zakupy 1. a 2. wynosi 42 dni dla kategorii Serum.'],
    ['Dowód:', '3 114 zamówień z historii 18 miesięcy.'],
    ['Rekomendacja:', 'Ustaw automatyczne przypomnienie o zużyciu produktu w 35. dniu.'],
  ],
  impact: 'Szacowany wpływ: -14% Churn Rate',
  action: 'Zastosuj →',
  actionKind: 'filter',
} as const;
