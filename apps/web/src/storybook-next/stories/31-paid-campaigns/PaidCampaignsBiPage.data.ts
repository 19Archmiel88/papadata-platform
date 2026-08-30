import type {
  PapaDataIconName,
} from '../../../design-system';

/**
 * Single source of truth for every business section this module renders:
 * section headers, the floating topbar, and anchor navigation are all
 * generated from this one array — none of them hand-type a title/label
 * or an anchor id separately. Same model as Command Center's
 * `commandCenterSections`.
 */
export const paidCampaignsSections = [
  {
    icon: 'decisions',
    id: 'wynik',
    navLabel: 'Wynik',
    title: 'Wynik kampanii',
  },
  {
    icon: 'trend',
    id: 'platformy',
    navLabel: 'Platformy',
    title: 'Platformy i kampanie',
  },
  {
    icon: 'warning',
    id: 'ryzyka',
    navLabel: 'Ryzyka',
    title: 'Ryzyka i alerty',
  },
  {
    icon: 'data',
    id: 'kampanie',
    navLabel: 'Kampanie',
    title: 'Analiza kampanii',
  },
  {
    icon: 'products',
    id: 'kreacje',
    navLabel: 'Kreacje',
    title: 'Kreacje reklamowe',
  },
  {
    icon: 'integration',
    id: 'atrybucja',
    navLabel: 'Atrybucja',
    title: 'Atrybucja i deduplikacja',
  },
  {
    icon: 'billing',
    id: 'budzet',
    navLabel: 'Budżet',
    title: 'Budżet i pacing',
  },
  {
    icon: 'assistant',
    id: 'symulator',
    navLabel: 'Symulator',
    title: 'Symulator budżetu',
  },
] as const satisfies readonly {
  readonly icon: PapaDataIconName;
  readonly id: string;
  readonly navLabel: string;
  readonly title: string;
}[];

export type PaidCampaignsSectionId = typeof paidCampaignsSections[number]['id'];

export const paidCampaignsSectionsById = paidCampaignsSections.reduce(
  (accumulator, section) => {
    accumulator[section.id] = section;
    return accumulator;
  },
  {} as Record<PaidCampaignsSectionId, typeof paidCampaignsSections[number]>,
);

export const paidCampaignsRangeOptions = [
  {
    label: 'Ostatnie 7 dni',
    value: '7d',
  },
  {
    label: 'Ostatnie 30 dni',
    value: '30d',
  },
  {
    label: 'Ostatnie 90 dni',
    value: '90d',
  },
] as const;

export const paidCampaignsCompareOptions = [
  {
    label: 'Poprzedni okres',
    value: 'prev_period',
  },
  {
    label: 'Rok do roku (YoY)',
    value: 'yoy',
  },
  {
    label: 'Brak porównania',
    value: 'none',
  },
] as const;

export const paidCampaignsPlatformOptions = [
  {
    label: 'Wszystkie (Google + Meta)',
    value: 'all',
  },
  {
    label: 'Google Ads (Prod Ready)',
    value: 'google_ads',
  },
  {
    label: 'Meta Ads (Prod Ready)',
    value: 'meta_ads',
  },
] as const;

export const paidCampaignsAttributionOptions = [
  {
    label: 'Last Click (Standard)',
    value: 'last_click',
  },
  {
    label: 'First Click',
    value: 'first_click',
  },
  {
    label: 'Liniowy (Linear)',
    value: 'linear',
  },
  {
    label: 'Papa Data-Driven (Estymacja)',
    value: 'data_driven',
  },
] as const;

export type PaidCampaignsPlatformFilter = typeof paidCampaignsPlatformOptions[number]['value'];
export type PaidCampaignsDecision = 'SKALUJ' | 'UTRZYMAJ' | 'MONITORUJ' | 'OGRANICZ';
export type PaidCampaignsPlatform = 'google_ads' | 'meta_ads';
export type PaidCampaignsMetricBadge = '[POMIAR]' | '[WYLICZONE]' | '[ESTYMACJA]' | '[BRAK DANYCH]';
export type PaidCampaignsTone = 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'violet';

export type PaidCampaignsFilterState = {
  readonly attribution: typeof paidCampaignsAttributionOptions[number]['value'];
  readonly compare: typeof paidCampaignsCompareOptions[number]['value'];
  readonly platform: PaidCampaignsPlatformFilter;
  readonly range: typeof paidCampaignsRangeOptions[number]['value'];
};

export const paidCampaignsDefaultFilters: PaidCampaignsFilterState = {
  attribution: 'last_click',
  compare: 'prev_period',
  platform: 'all',
  range: '30d',
};

export const paidCampaignsDecisionOptions = [
  'all',
  'SKALUJ',
  'UTRZYMAJ',
  'MONITORUJ',
  'OGRANICZ',
] as const;

export type PaidCampaignsDecisionFilter = typeof paidCampaignsDecisionOptions[number];

export type PaidCampaignKpi = {
  readonly badge: PaidCampaignsMetricBadge;
  readonly change: string;
  readonly key: PaidCampaignsProvenanceKey;
  readonly label: string;
  readonly note: string;
  readonly tone: PaidCampaignsTone;
  readonly value: string;
};

export const paidCampaignsKpis = [
  {
    key: 'spend',
    label: 'Wydatki (Spend)',
    badge: '[POMIAR]',
    value: '77 400 zł',
    change: '+4.2% vs popr.',
    note: 'Meta + Google',
    tone: 'slate',
  },
  {
    key: 'attributed_revenue',
    label: 'Przychód Przip.',
    badge: '[ESTYMACJA]',
    value: '325 800 zł',
    change: '+11.8% vs popr.',
    note: 'Model: Last Click',
    tone: 'slate',
  },
  {
    key: 'roas',
    label: 'ROAS',
    badge: '[WYLICZONE]',
    value: '4,21',
    change: '+0.28 vs target',
    note: 'B-even: 3,10',
    tone: 'indigo',
  },
  {
    key: 'ncac',
    label: 'nCAC / CPA',
    badge: '[WYLICZONE]',
    value: '94 zł',
    change: '-6 zł vs limit',
    note: 'Target: 100 zł',
    tone: 'slate',
  },
  {
    key: 'media_surplus',
    label: 'Nadwyżka Mediowa',
    badge: '[WYLICZONE]',
    value: '248 400 zł',
    change: '+14.5% vs popr.',
    note: 'Brak COGS',
    tone: 'slate',
  },
  {
    key: 'budget_pacing',
    label: 'Pacing Budżetu',
    badge: '[ESTYMACJA]',
    value: '64,5%',
    change: 'Zgodnie z planem',
    note: 'FC: 113.8k / 120k',
    tone: 'slate',
  },
] as const satisfies readonly PaidCampaignKpi[];

export type PaidCampaign = {
  readonly badge: PaidCampaignsMetricBadge;
  readonly cpa: number;
  readonly cpc: number;
  readonly cpm: number;
  readonly ctr: number;
  readonly decision: PaidCampaignsDecision;
  readonly id: string;
  readonly name: string;
  readonly ncac: number;
  readonly platform: PaidCampaignsPlatform;
  readonly revenue: number;
  readonly roas: number;
  readonly spend: number;
  readonly status: 'Active';
  readonly surplus: number;
};

export const paidCampaignsCampaigns = [
  {
    id: 'g_camp_992182',
    name: 'Google — Shopping Brand & Retargeting',
    platform: 'google_ads',
    status: 'Active',
    decision: 'SKALUJ',
    spend: 14200,
    revenue: 82600,
    roas: 5.82,
    cpa: 42,
    ncac: 64,
    ctr: 3.82,
    cpc: 1.42,
    cpm: 54.20,
    surplus: 68400,
    badge: '[POMIAR]',
  },
  {
    id: 'm_camp_881920',
    name: 'Meta — Prospecting Advantage+ Broad',
    platform: 'meta_ads',
    status: 'Active',
    decision: 'UTRZYMAJ',
    spend: 18500,
    revenue: 76775,
    roas: 4.15,
    cpa: 58,
    ncac: 92,
    ctr: 2.14,
    cpc: 2.10,
    cpm: 44.92,
    surplus: 58275,
    badge: '[POMIAR]',
  },
  {
    id: 'm_camp_104922',
    name: 'Meta — Retargeting Dynamic Catalog',
    platform: 'meta_ads',
    status: 'Active',
    decision: 'OGRANICZ',
    spend: 9800,
    revenue: 19110,
    roas: 1.95,
    cpa: 98,
    ncac: 164,
    ctr: 0.92,
    cpc: 3.40,
    cpm: 31.28,
    surplus: 9310,
    badge: '[POMIAR]',
  },
  {
    id: 'g_camp_334190',
    name: 'Google — Non-Brand Search Generic',
    platform: 'google_ads',
    status: 'Active',
    decision: 'MONITORUJ',
    spend: 12000,
    revenue: 34800,
    roas: 2.90,
    cpa: 72,
    ncac: 118,
    ctr: 4.10,
    cpc: 2.90,
    cpm: 118.90,
    surplus: 22800,
    badge: '[POMIAR]',
  },
  {
    id: 'g_camp_771029',
    name: 'Google — Performance Max All-Products',
    platform: 'google_ads',
    status: 'Active',
    decision: 'SKALUJ',
    spend: 10000,
    revenue: 78800,
    roas: 7.88,
    cpa: 31,
    ncac: 52,
    ctr: 2.95,
    cpc: 1.15,
    cpm: 33.93,
    surplus: 68800,
    badge: '[POMIAR]',
  },
  {
    id: 'm_camp_552190',
    name: 'Meta — Lookalike 1% Buyers Video',
    platform: 'meta_ads',
    status: 'Active',
    decision: 'UTRZYMAJ',
    spend: 12900,
    revenue: 33715,
    roas: 2.61,
    cpa: 68,
    ncac: 105,
    ctr: 1.48,
    cpc: 2.45,
    cpm: 36.26,
    surplus: 20815,
    badge: '[POMIAR]',
  },
] as const satisfies readonly PaidCampaign[];

export type PaidCampaignsProvenanceKey =
  | 'attributed_revenue'
  | 'budget_pacing'
  | 'media_surplus'
  | 'ncac'
  | 'roas'
  | 'spend';

export type PaidCampaignsProvenance = {
  readonly badge: PaidCampaignsMetricBadge;
  readonly formula: string;
  readonly freshness: string;
  readonly limitations: string;
  readonly model: string;
  readonly name: string;
  readonly sources: readonly string[];
};

export const paidCampaignsProvenanceDict: Record<PaidCampaignsProvenanceKey, PaidCampaignsProvenance> = {
  spend: {
    name: 'Wydatki Reklamowe (Ad Spend)',
    badge: '[POMIAR]',
    formula: 'Direct Sum of Ad Spend from Meta Ads API + Google Ads API',
    sources: [
      'Meta Ads Account \u0023991823',
      'Google Ads Account \u0023331-112-90',
    ],
    freshness: 'Dzisiaj, 22:04 CEST',
    model: 'Bezpośredni odczyt faktów',
    limitations: 'Brak opóźnień (lag). Kwoty przewalutowane po średnim kursie NBP z dnia emisji.',
  },
  attributed_revenue: {
    name: 'Przychód Przypisany Reklamom',
    badge: '[ESTYMACJA]',
    formula: 'Sum of Commerce Revenue matched to Ad Touchpoints via Attribution Rules',
    sources: [
      'Meta Ads Pixel/API',
      'GA4 Session Join',
      'Shopify Orders API',
    ],
    freshness: 'Dzisiaj, 21:50 CEST',
    model: 'Last Click 7d (Default)',
    limitations: 'Zawiera estymacje modeliatrybucyjnych. Część przychodu z iOS14+ jest modelowana przez Meta Conversions API.',
  },
  roas: {
    name: 'ROAS (Return on Ad Spend)',
    badge: '[WYLICZONE]',
    formula: 'Attributed Revenue / Ad Spend',
    sources: [
      'Wyliczenie deterministyczne z potwierdzonych faktów wydatków i przychodu',
    ],
    freshness: 'Dzisiaj, 22:04 CEST',
    model: 'Wyliczenie ze wzoru matematycznego',
    limitations: 'Wartość ROAS zależy bezpośrednio od wybranego modelu atrybucji przychodu.',
  },
  ncac: {
    name: 'nCAC (Koszt Pozyskania Nowego Klienta)',
    badge: '[WYLICZONE]',
    formula: 'Ad Spend / Count(Orders where is_new_customer == true)',
    sources: [
      'Papa Data Engine',
      'Shopify Customer Order History',
    ],
    freshness: 'Dzisiaj, 20:30 CEST',
    model: 'Wymaga jawnej flagi is_new_customer',
    limitations: 'Gdy flaga new_customer jest niedostępna, system zwraca status BRAK DANYCH zamiast podstawiać CPA.',
  },
  media_surplus: {
    name: 'Nadwyżka po Koszcie Mediów (Media Surplus)',
    badge: '[WYLICZONE]',
    formula: 'Attributed Revenue - Ad Spend',
    sources: [
      'Papa Data Engine',
    ],
    freshness: 'Dzisiaj, 22:04 CEST',
    model: 'Nadwyżka finansowa przed kosztami stałymi i towarowymi',
    limitations: '⚠️ ZMIANA SEMANTYCZNA: To NIE JEST Marża po reklamach. Prawdziwa marża zostanie odblokowana po wprowadzeniu COGS.',
  },
  budget_pacing: {
    name: 'Pacing Budżetu Miesięcznego',
    badge: '[ESTYMACJA]',
    formula: '(Actual Spend To Date / Planned Monthly Budget) vs (Passed Days / Month Days)',
    sources: [
      'Papa Budget Settings',
      'Real-time Daily Spend Accumulator',
    ],
    freshness: 'Dzisiaj, 22:04 CEST',
    model: 'Linear Spend Exhaustion Projection',
    limitations: 'Zakłada równomierne tempo wydatków. Wyłącza wahania weekendowe.',
  },
};

export const paidCampaignsTrendModes = [
  {
    id: 'financial',
    label: 'Wynik (Spend / Rev)',
  },
  {
    id: 'efficiency',
    label: 'Efektywność (ROAS)',
  },
  {
    id: 'acquisition',
    label: 'Pozyskanie (nCAC/CPA)',
  },
  {
    id: 'traffic',
    label: 'Ruch (CPC/CTR)',
  },
] as const;

export type PaidCampaignsTrendMode = typeof paidCampaignsTrendModes[number]['id'];

export type PaidCampaignsTrendSeries = {
  readonly color: 'blue' | 'emerald' | 'indigo' | 'pink' | 'rose' | 'sky' | 'violet' | 'amber';
  readonly dash?: boolean;
  readonly key: string;
  readonly label: string;
  readonly values: readonly number[];
};

export const paidCampaignsTrendLabels = [
  '01 Aug',
  '04 Aug',
  '07 Aug',
  '10 Aug',
  '13 Aug',
  '16 Aug',
  '19 Aug',
  '22 Aug',
  '25 Aug',
  '27 Aug',
] as const;

export const paidCampaignsTrendSeries: Record<PaidCampaignsTrendMode, readonly PaidCampaignsTrendSeries[]> = {
  financial: [
    {
      key: 'spend',
      label: 'Wydatki (Ad Spend PLN)',
      values: [
        2200,
        2400,
        2300,
        2600,
        2500,
        2700,
        2900,
        2800,
        2750,
        2800,
      ],
      color: 'indigo',
    },
    {
      key: 'revenue',
      label: 'Przychód Przypisany (PLN)',
      values: [
        8800,
        9600,
        9900,
        11200,
        10800,
        11800,
        12900,
        12200,
        11900,
        12100,
      ],
      color: 'emerald',
    },
  ],
  efficiency: [
    {
      key: 'roas',
      label: 'Faktyczny ROAS',
      values: [
        4.00,
        4.00,
        4.30,
        4.30,
        4.32,
        4.37,
        4.44,
        4.35,
        4.32,
        4.32,
      ],
      color: 'violet',
    },
    {
      key: 'target',
      label: 'Target ROAS (3.80)',
      values: [
        3.8,
        3.8,
        3.8,
        3.8,
        3.8,
        3.8,
        3.8,
        3.8,
        3.8,
        3.8,
      ],
      color: 'amber',
      dash: true,
    },
    {
      key: 'break_even',
      label: 'Break-even ROAS (3.10)',
      values: [
        3.1,
        3.1,
        3.1,
        3.1,
        3.1,
        3.1,
        3.1,
        3.1,
        3.1,
        3.1,
      ],
      color: 'rose',
      dash: true,
    },
  ],
  acquisition: [
    {
      key: 'cpa',
      label: 'CPA (Koszt Zamówienia PLN)',
      values: [
        62,
        59,
        58,
        56,
        57,
        58,
        55,
        56,
        58,
        58,
      ],
      color: 'sky',
    },
    {
      key: 'ncac',
      label: 'nCAC (Koszt Nowego Klienta PLN)',
      values: [
        98,
        95,
        94,
        91,
        92,
        94,
        89,
        90,
        94,
        94,
      ],
      color: 'pink',
    },
  ],
  traffic: [
    {
      key: 'cpc',
      label: 'CPC (PLN)',
      values: [
        2.10,
        2.15,
        2.12,
        2.18,
        2.22,
        2.30,
        2.28,
        2.25,
        2.32,
        2.35,
      ],
      color: 'indigo',
    },
    {
      key: 'ctr',
      label: 'CTR (%)',
      values: [
        2.10,
        2.15,
        2.20,
        2.18,
        2.10,
        2.05,
        1.98,
        1.95,
        1.90,
        1.88,
      ],
      color: 'emerald',
    },
  ],
};

export const paidCampaignsPlatformComparison = [
  {
    budgetShare: 46.8,
    label: 'Google Ads',
    revenueShare: 60.2,
  },
  {
    budgetShare: 53.2,
    label: 'Meta Ads',
    revenueShare: 39.8,
  },
] as const;

export const paidCampaignsPlatformCards = [
  {
    decision: 'SKALUJ',
    label: 'Google Ads',
    marker: '🔵',
    revenue: '196 200 zł (60.2%)',
    roas: '5,42',
    ncac: '78 zł',
    spend: '36 200 zł',
    share: '46.8%',
    tone: 'emerald',
  },
  {
    decision: 'UTRZYMAJ',
    label: 'Meta Ads',
    marker: '🔷',
    revenue: '129 600 zł (39.8%)',
    roas: '3,15',
    ncac: '112 zł',
    spend: '41 200 zł',
    share: '53.2%',
    tone: 'blue',
  },
] as const;

export const paidCampaignsPerformers = [
  {
    name: 'Google — Shopping Brand & Retargeting',
    spend: '14 200 zł',
    revenue: '82 600 zł',
    roas: '5,82',
    decision: 'SKALUJ',
    group: 'top',
    tone: 'emerald',
  },
  {
    name: 'Meta — Prospecting Advantage+ Broad',
    spend: '18 500 zł',
    revenue: '76 775 zł',
    roas: '4,15',
    decision: 'UTRZYMAJ',
    group: 'top',
    tone: 'blue',
  },
  {
    name: 'Meta — Retargeting Dynamic Catalog',
    spend: '9 800 zł',
    revenue: '19 110 zł',
    roas: '1,95',
    decision: 'OGRANICZ',
    group: 'bottom',
    reason: 'Wypalenie kreacji',
    tone: 'rose',
  },
  {
    name: 'Google — Non-Brand Search Generic',
    spend: '12 000 zł',
    revenue: '34 800 zł',
    roas: '2,90',
    decision: 'MONITORUJ',
    group: 'bottom',
    reason: 'Wysoki CPC',
    tone: 'amber',
  },
] as const;

export const paidCampaignsAlerts = [
  {
    action: 'Podmień kreacje ➔',
    contextKey: 'creative_analysis',
    body: 'Częstotliwość zestawu "Founder Story" przekroczyła 4,8. CTR spadł o -27% w 7 dni.',
    label: 'Creative Fatigue Spike',
    platform: 'Meta Ads',
    tab: 'kreacje',
    tone: 'amber',
  },
  {
    action: 'Analizuj z AI ➔',
    contextKey: 'cpc_spike',
    body: 'CPC na frazach ogólnych wzrósł o +38% (z 2,10 zł do 2,90 zł) bez wzrostu współczynnika konwersji.',
    label: 'Cost Spike Anomaly',
    platform: 'Google Search',
    tone: 'rose',
  },
  {
    action: 'Zwiększ limit ➔',
    body: 'Kampania realizuje tylko 82% planowanego budżetu dziennego przy utrzymaniu wysokiego ROAS 5,42.',
    label: 'Budget Underpacing Opportunity',
    platform: 'Google Shopping',
    tab: 'budzet',
    tone: 'emerald',
  },
] as const;

export const paidCampaignsCreativeMetrics = [
  {
    badge: '2 Reklamy',
    body: 'Kryterium: Częstotliwość > 3.8 i spadek CTR > 20% w 7 dni.',
    label: 'Wypalone Kreacje (Fatigue)',
    tone: 'rose',
    value: '28.5% wydatków Meta',
  },
  {
    badge: 'Format Reels/Shorts',
    body: 'Benchmark branżowy dla e-commerce: 28.0%.',
    label: 'Średni Video Hook Rate (3-sec)',
    tone: 'indigo',
    value: '34.2%',
  },
  {
    badge: 'Zaangażowanie',
    body: 'Odsetek osób oglądających co najmniej 15 sekund wideo.',
    label: 'Średni Hold Rate (ThruPlay)',
    tone: 'emerald',
    value: '14.8%',
  },
] as const;

export const paidCampaignsCreatives = [
  {
    action: 'Zastosuj rekomendację podmiany ➔',
    format: 'Vertical Video (9:16)',
    id: 'ad_meta_882',
    name: 'Meta — Founder Story Video Reel #3',
    preview: 'Preview: [Founder Story Video]',
    previewIcon: '🖼️',
    roas: '2,10',
    spend: '8 400 zł',
    status: 'WYPALENIE (FATIGUE)',
    stats: [
      ['Spend', '8 400 zł'],
      ['ROAS', '2,10'],
      ['Freq', '5.2'],
      ['CTR', '0.92% (-24%)'],
    ],
    tone: 'rose',
  },
  {
    action: 'Zwiększ budżet zestawu ➔',
    format: 'Carousel Image + Quotes',
    id: 'ad_meta_901',
    name: 'Meta — Social Proof / UGC Reviews',
    preview: 'Preview: [User Reviews Montage]',
    previewIcon: '🖼️',
    roas: '4.85',
    spend: '14 200 zł',
    status: 'SKALOWANIE (WINNER)',
    stats: [
      ['Spend', '14 200 zł'],
      ['ROAS', '4.85'],
      ['Freq', '2.1'],
      ['CTR', '2.84% (+18%)'],
    ],
    tone: 'emerald',
  },
  {
    action: 'Szczegóły klastra ➔',
    format: 'Product Feed Image',
    id: 'ad_goog_412',
    name: 'Google — Shopping Main Product Image',
    preview: 'Preview: [Product Hero Shot]',
    previewIcon: '🛍️',
    roas: '5.40',
    spend: '19 500 zł',
    status: 'STABILNA',
    stats: [
      ['Spend', '19 500 zł'],
      ['ROAS', '5.40'],
      ['Freq', '1.4'],
      ['CTR', '3.12%'],
    ],
    tone: 'slate',
  },
  {
    action: 'Szczegóły klastra ➔',
    format: 'Square Video (1:1)',
    id: 'ad_meta_104',
    name: 'Meta — Problem / Solution Video',
    preview: 'Preview: [Problem-Solution Demo]',
    previewIcon: '🖼️',
    roas: '3.40',
    spend: '11 100 zł',
    status: 'STABILNA',
    stats: [
      ['Spend', '11 100 zł'],
      ['ROAS', '3.40'],
      ['Freq', '2.8'],
      ['CTR', '1.65%'],
    ],
    tone: 'slate',
  },
] as const;

export const paidCampaignsAttributionData = [
  {
    google: 196200,
    meta: 129600,
    model: 'Last Click',
  },
  {
    google: 168000,
    meta: 157800,
    model: 'First Click',
  },
  {
    google: 182000,
    meta: 143800,
    model: 'Linear Decay',
  },
  {
    google: 189000,
    meta: 136800,
    model: 'Papa Data-Driven',
  },
] as const;

export const paidCampaignsRealityGap = [
  {
    body: 'Każda konwersja z widocznością w oknie 7-dniowym',
    label: 'Meta Ads Zaraportowane:',
    tone: 'slate',
    value: '180 000 zł',
  },
  {
    body: 'Każde kliknięcie przed zakupem',
    label: 'Google Ads Zaraportowane:',
    tone: 'slate',
    value: '140 000 zł',
  },
  {
    body: 'Meta + Google Ads',
    label: 'Suma Zaraportowana przez Platformy:',
    tone: 'indigo',
    value: '320 000 zł',
  },
  {
    body: 'Zweryfikowane zamówienia w sklepie',
    label: 'Faktyczna Całkowita Sprzedaż E-commerce:',
    tone: 'emerald',
    value: '250 000 zł',
  },
  {
    body: 'Platformy obiecują +70 000 zł więcej niż realny sklep',
    label: 'Wskaźnik Over-reportingu (Dublowania):',
    tone: 'amber',
    value: '+28.0% Overlap',
  },
] as const;

export const paidCampaignsDrawerAdGroups = [
  {
    label: 'Shopping — Top Products Best Sellers',
    roas: '6,10',
    spend: '9 800 zł',
    status: 'Aktywna',
  },
  {
    label: 'Shopping — Brand Name Keywords',
    roas: '5,20',
    spend: '4 400 zł',
    status: 'Aktywna',
  },
] as const;

export const paidCampaignsDrawerDivergence = [
  'CTR: wzrósł o +14% dzięki optymalizacji nagłówków reklam.',
  'CPC: utrzymał się na stabilnym poziomie 1,42 zł.',
  'Conversion Rate (CVR): wzrósł o +0.8 pp ze względu na promocję darmowej dostawy.',
] as const;

export type PaidCampaignsAiContextKey =
  | 'cpc_spike'
  | 'creative_analysis'
  | 'creative_fatigue_replace'
  | 'skaluj_google';

export type PaidCampaignsAiResponse = {
  readonly sections: readonly {
    readonly body: readonly string[];
    readonly label: string;
    readonly tone?: PaidCampaignsTone;
  }[];
  readonly tone: PaidCampaignsTone;
};

export const paidCampaignsAiResponses: Record<PaidCampaignsAiContextKey, PaidCampaignsAiResponse> = {
  skaluj_google: {
    tone: 'indigo',
    sections: [
      {
        label: '1. OBSERWACJA',
        body: [
          'Google Shopping generuje ROAS 5,42 przy nCAC 78 zł (vs limit 100 zł).',
        ],
      },
      {
        label: '2. DOWODY (DATA EVIDENCE)',
        body: [
          'Spend: 36 200 PLN (46.8% budżetu)',
          'Przychód: 196 200 PLN (60.2% przychodu)',
          'Częstotliwość: 1.4 (brak saturacji)',
        ],
      },
      {
        label: '3. DIAGNOZA',
        body: [
          'Popyt w Google Shopping przewyższa obecną alokację. Kampania traci udział w wyświetleniach z powodu limitu budżetowego.',
        ],
      },
      {
        label: '4. REKOMENDOWANA AKCJA',
        body: [
          'Przenieś +8 000 PLN z Meta Retargeting do Google Shopping.',
        ],
      },
      {
        label: '5. WPŁYW FINANSOWY & PEWNOŚĆ',
        tone: 'emerald',
        body: [
          '+18 400 PLN przychodu / mies. | Pewność AI: 82%',
        ],
      },
    ],
  },
  creative_analysis: {
    tone: 'amber',
    sections: [
      {
        label: 'DIAGNOZA KREACJI META',
        body: [
          'Zestaw "Founder Story Video" wykazuje objawy zmęczenia materiału.',
          'CTR spadł o -24% w 7 dni przy wzrost częstotliwości do 5.2. Zalecana natychmiastowa podmiana na format Social Proof Carousel.',
        ],
      },
    ],
  },
  cpc_spike: {
    tone: 'rose',
    sections: [
      {
        label: 'COST SPIKE ANOMALY',
        body: [
          'CPC na frazach ogólnych wzrósł o +38% bez wzrostu współczynnika konwersji.',
          'Najpierw ogranicz ekspozycję fraz o niskiej intencji, potem sprawdź stawki konkurencji i jakość landing page.',
        ],
      },
    ],
  },
  creative_fatigue_replace: {
    tone: 'rose',
    sections: [
      {
        label: 'REKOMENDACJA PODMIANY',
        body: [
          'Founder Story Video Reel #3 przekroczył próg fatigue. Podmień materiał na Social Proof / UGC Reviews i utrzymaj test przez 72 godziny.',
        ],
      },
    ],
  },
};

export const paidCampaignsBudgetPlan = {
  currentSpend: 77400,
  forecast: 113800,
  googleBudget: 36200,
  metaBudget: 41200,
  month: 'Sierpień 2026',
  monthlyBudget: 120000,
  passedDays: 20,
  pacing: 64.5,
  reservePercent: 5.2,
  totalDays: 31,
} as const;
