import type {
  PapaDataIconName,
} from '../../design-system';

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
export type PaidCampaignsDecision = 'SKALUJ' | 'UTRZYMAJ' | 'MONITORUJ' | 'OGRANICZ';
export type PaidCampaignsPlatform = 'google_ads' | 'meta_ads';
export type PaidCampaignsMetricBadge = '[POMIAR]' | '[WYLICZONE]' | '[ESTYMACJA]' | '[BRAK DANYCH]';
export type PaidCampaignsTone = 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'violet';

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

export type PaidCampaignsAiContextKey =
  | 'cpc_spike'
  | 'creative_analysis'
  | 'creative_fatigue_replace'
  | 'skaluj_google';

export const paidCampaignsBudgetPlan = {
  currentSpend: 77400,
  forecast: 113800,
  googleBudget: 36200,
  metaBudget: 41200,
  month: 'Sierpień 2026',
  monthlyBudget: 300000,
  passedDays: 20,
  pacing: 64.5,
  reservePercent: 5.2,
  totalDays: 31,
} as const;
