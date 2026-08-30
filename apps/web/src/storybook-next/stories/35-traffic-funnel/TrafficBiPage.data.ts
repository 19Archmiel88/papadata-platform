import type {
  PapaDataIconName,
} from '../../../design-system';

export type TrafficTone =
  | 'amber'
  | 'emerald'
  | 'indigo'
  | 'rose'
  | 'slate';

export const trafficSections = [
  {
    icon: 'trend',
    id: 'wynik',
    navLabel: 'Wynik',
    title: 'Wynik ruchu',
  },
  {
    icon: 'integration',
    id: 'kanaly',
    navLabel: 'Kanały',
    title: 'Kanały ruchu',
  },
  {
    icon: 'search',
    id: 'strony',
    navLabel: 'Strony',
    title: 'Strony wejścia',
  },
  {
    icon: 'billing',
    id: 'lejek',
    navLabel: 'Lejek',
    title: 'Lejek konwersji',
  },
  {
    icon: 'customers',
    id: 'urzadzenia',
    navLabel: 'Urządzenia',
    title: 'Urządzenia i geografia',
  },
  {
    icon: 'security',
    id: 'jakosc',
    navLabel: 'Jakość',
    title: 'Jakość danych',
  },
  {
    icon: 'warning',
    id: 'alerty',
    navLabel: 'Alerty',
    title: 'Alerty i anomalie',
  },
  {
    icon: 'assistant',
    id: 'papa-ai',
    navLabel: 'Papa AI',
    title: 'Diagnostyka Papa AI',
  },
] as const satisfies readonly {
  readonly icon: PapaDataIconName;
  readonly id: string;
  readonly navLabel: string;
  readonly title: string;
}[];

export type TrafficSectionId = typeof trafficSections[number]['id'];

export const trafficSectionsById = trafficSections.reduce((accumulator, section) => {
  accumulator[section.id] = section;
  return accumulator;
}, {} as Record<TrafficSectionId, typeof trafficSections[number]>);

export const trafficTimeRangeOptions = [
  {
    label: 'Ostatnie 30 dni',
    value: '30d',
  },
  {
    label: 'Ostatnie 7 dni',
    value: '7d',
  },
  {
    label: 'Ostatnie 90 dni',
    value: '90d',
  },
  {
    label: 'Dzisiaj',
    value: 'today',
  },
] as const;

export const trafficCompareOptions = [
  {
    label: 'vs Poprzedni okres (30d)',
    value: 'prev_period',
  },
  {
    label: 'vs Poprzedni rok (YoY)',
    value: 'yoy',
  },
  {
    label: 'Brak porównania',
    value: 'none',
  },
] as const;

export const trafficChannelOptions = [
  {
    label: 'Wszystkie kanały',
    value: 'all',
  },
  {
    label: 'Organic Search',
    value: 'Organic Search',
  },
  {
    label: 'Paid Search',
    value: 'Paid Search',
  },
  {
    label: 'Paid Social',
    value: 'Paid Social',
  },
  {
    label: 'Direct',
    value: 'Direct',
  },
  {
    label: 'Email',
    value: 'Email',
  },
  {
    label: 'Referral',
    value: 'Referral',
  },
  {
    label: 'Unassigned',
    value: 'Unassigned',
  },
] as const;

export const trafficDeviceOptions = [
  {
    label: 'Wszystkie urządzenia',
    value: 'all',
  },
  {
    label: 'Mobile (Smartfony)',
    value: 'mobile',
  },
  {
    label: 'Desktop (Komputery)',
    value: 'desktop',
  },
  {
    label: 'Tablet',
    value: 'tablet',
  },
] as const;

export type TrafficGlobalFilters = {
  readonly channelFilter: typeof trafficChannelOptions[number]['value'];
  readonly compare: typeof trafficCompareOptions[number]['value'];
  readonly deviceFilter: typeof trafficDeviceOptions[number]['value'];
  readonly timeRange: typeof trafficTimeRangeOptions[number]['value'];
};

export const trafficDefaultFilters: TrafficGlobalFilters = {
  channelFilter: 'all',
  compare: 'prev_period',
  deviceFilter: 'all',
  timeRange: '30d',
};

export type TrafficDataBadge =
  | 'Addytywne'
  | 'Exact-Range'
  | 'GA4 E-commerce'
  | 'Jakość Ruchu'
  | 'Wyliczone';

export const trafficKpis = [
  {
    title: 'Sesje (Sessions)',
    value: '128 420',
    badge: 'Addytywne',
    badgeTone: 'slate',
    trend: '▲ +8.4%',
    trendTone: 'emerald',
    note: 'vs poprz. 30d',
    footerLeft: 'Źródło: GA4',
    footerRight: 'Cel: 120k',
  },
  {
    title: 'Aktywni Użytkownicy',
    value: '82 419',
    badge: 'Exact-Range',
    badgeTone: 'amber',
    trend: '▲ +5.2%',
    trendTone: 'emerald',
    note: 'unikalni (30d)',
    footerLeft: 'Nie-addytywne',
    footerRight: 'GA4 Active',
  },
  {
    title: 'CR Zakupowy',
    value: '3.12%',
    badge: 'Wyliczone',
    badgeTone: 'indigo',
    trend: '▼ -0.34 pp',
    trendTone: 'rose',
    note: 'vs poprz. 30d',
    footerLeft: 'Wzór: Zakupy/Sesje',
    footerRight: 'Baseline: 3.46%',
  },
  {
    title: 'Zakupy (GA4)',
    value: '4 006',
    badge: 'Addytywne',
    badgeTone: 'slate',
    trend: '▲ +2.1%',
    trendTone: 'emerald',
    note: 'vs poprz. 30d',
    footerLeft: 'Commerce: 4 248',
    footerRight: '94.3% Match',
  },
  {
    title: 'Przychód GA4',
    value: '1 188 220 zł',
    badge: 'GA4 E-commerce',
    badgeTone: 'slate',
    trend: '▲ +4.6%',
    trendTone: 'emerald',
    note: 'vs poprz. 30d',
    footerLeft: 'Commerce: 1.26M zł',
    footerRight: 'Rozbieżność: -5.7%',
  },
  {
    title: 'Przychód / Sesję',
    value: '9.25 zł',
    badge: 'Jakość Ruchu',
    badgeTone: 'indigo',
    featured: true,
    trend: '▼ -0.35 zł',
    trendTone: 'rose',
    note: 'vs poprz. 30d',
    footerLeft: 'Liczony z GA4 Rev',
    footerRight: 'Średnia 90d: 9.60 zł',
  },
] as const satisfies readonly {
  readonly badge: TrafficDataBadge;
  readonly badgeTone: TrafficTone;
  readonly featured?: boolean;
  readonly footerLeft: string;
  readonly footerRight: string;
  readonly note: string;
  readonly title: string;
  readonly trend: string;
  readonly trendTone: TrafficTone;
  readonly value: string;
}[];

export const trafficTrendModes = [
  {
    label: 'Sesje',
    value: 'sessions',
  },
  {
    label: 'Użytkownicy',
    value: 'users',
  },
  {
    label: 'Conversion Rate %',
    value: 'cr',
  },
  {
    label: 'Zakupy GA4',
    value: 'purchases',
  },
  {
    label: 'Przychód GA4',
    value: 'revenue',
  },
  {
    label: 'Przychód/Sesję',
    value: 'revPerSession',
  },
] as const;

export type TrafficTrendMode = typeof trafficTrendModes[number]['value'];

export const trafficTrendLabels: Record<TrafficTrendMode, string> = {
  cr: 'Conversion Rate %',
  purchases: 'Zakupy GA4',
  revenue: 'Przychód GA4',
  revPerSession: 'Przychód/Sesję',
  sessions: 'Sesje',
  users: 'Użytkownicy',
};

export const trafficTrendSeries: Record<TrafficTrendMode, {
  readonly current: readonly number[];
  readonly previous: readonly number[];
}> = {
  sessions: {
    current: [3800, 4100, 3950, 4200, 4500, 4300, 4150, 4400, 4600, 4250, 4100, 4350, 4550, 3900, 3850, 3700, 3950, 4100, 4300, 4450, 4650, 4800, 4600, 4400, 4300, 4500, 4700, 4900, 5100, 4850],
    previous: [3500, 3700, 3800, 3900, 4100, 4000, 3900, 4050, 4200, 4100, 3950, 4000, 4100, 4050, 3900, 3800, 3850, 3900, 4000, 4100, 4200, 4300, 4250, 4150, 4100, 4200, 4300, 4400, 4500, 4450],
  },
  users: {
    current: [2400, 2650, 2510, 2700, 2890, 2760, 2640, 2810, 2980, 2720, 2600, 2740, 2860, 2460, 2390, 2320, 2520, 2660, 2780, 2910, 3030, 3110, 2990, 2840, 2740, 2860, 3010, 3140, 3290, 3100],
    previous: [2250, 2390, 2450, 2510, 2650, 2570, 2490, 2590, 2710, 2630, 2500, 2550, 2620, 2580, 2480, 2420, 2460, 2510, 2580, 2650, 2740, 2820, 2760, 2660, 2610, 2680, 2760, 2830, 2910, 2860],
  },
  cr: {
    current: [3.4, 3.5, 3.2, 3.6, 3.8, 3.5, 3.4, 3.3, 3.5, 3.1, 2.9, 2.8, 2.7, 2.6, 2.5, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.4, 3.3, 3.2, 3.4, 3.5, 3.6, 3.7, 3.5],
    previous: [3.5, 3.6, 3.4, 3.5, 3.6, 3.5, 3.4, 3.5, 3.6, 3.5, 3.4, 3.5, 3.5, 3.4, 3.4, 3.5, 3.5, 3.5, 3.6, 3.5, 3.5, 3.6, 3.5, 3.4, 3.5, 3.5, 3.6, 3.5, 3.6, 3.5],
  },
  purchases: {
    current: [120, 140, 130, 150, 160, 145, 140, 138, 152, 130, 122, 118, 115, 110, 108, 114, 132, 140, 148, 155, 162, 170, 158, 150, 145, 152, 160, 168, 175, 165],
    previous: [110, 120, 125, 130, 140, 135, 130, 132, 138, 135, 128, 130, 132, 130, 125, 128, 130, 132, 138, 140, 142, 148, 145, 140, 138, 140, 142, 145, 148, 146],
  },
  revenue: {
    current: [35000, 38000, 36000, 41000, 45000, 42000, 39000, 40000, 43000, 37000, 34000, 33000, 32000, 31000, 30000, 32000, 38000, 41000, 43000, 46000, 48000, 52000, 49000, 46000, 44000, 47000, 50000, 53000, 56000, 52000],
    previous: [32000, 34000, 35000, 37000, 40000, 38000, 36000, 38000, 40000, 39000, 37000, 38000, 39000, 38000, 36000, 37000, 38000, 39000, 41000, 42000, 43000, 45000, 44000, 43000, 42000, 43000, 44000, 46000, 47000, 46000],
  },
  revPerSession: {
    current: [9.2, 9.3, 9.1, 9.8, 10, 9.8, 9.4, 9.1, 9.3, 8.7, 8.3, 7.6, 7.0, 7.9, 7.8, 8.6, 9.6, 10.0, 10.0, 10.3, 10.3, 10.8, 10.7, 10.5, 10.2, 10.4, 10.6, 10.8, 11.0, 10.7],
    previous: [9.1, 9.2, 9.2, 9.5, 9.8, 9.5, 9.2, 9.4, 9.5, 9.5, 9.4, 9.5, 9.5, 9.4, 9.2, 9.5, 9.6, 9.7, 9.9, 10.0, 10.2, 10.4, 10.4, 10.4, 10.2, 10.2, 10.2, 10.5, 10.4, 10.3],
  },
};

export type TrafficChannelQuality =
  | 'Good'
  | 'Risk'
  | 'Watch';

export type TrafficChannelRow = {
  readonly cr: number;
  readonly group: typeof trafficChannelOptions[number]['value'];
  readonly purchases: number;
  readonly quality: TrafficChannelQuality;
  readonly revenue: number;
  readonly revPerSession: number;
  readonly sessions: number;
  readonly users: number;
};

export const trafficChannelRows = [
  { group: 'Organic Search', sessions: 42820, users: 28400, purchases: 1420, cr: 3.32, revenue: 412000, revPerSession: 9.62, quality: 'Good' },
  { group: 'Paid Search', sessions: 31420, users: 21200, purchases: 980, cr: 3.12, revenue: 310000, revPerSession: 9.87, quality: 'Watch' },
  { group: 'Paid Social', sessions: 24150, users: 17800, purchases: 520, cr: 2.15, revenue: 148000, revPerSession: 6.13, quality: 'Watch' },
  { group: 'Direct', sessions: 14280, users: 8900, purchases: 580, cr: 4.06, revenue: 178000, revPerSession: 12.46, quality: 'Good' },
  { group: 'Email', sessions: 8920, users: 4100, purchases: 410, cr: 4.60, revenue: 124000, revPerSession: 13.90, quality: 'Good' },
  { group: 'Referral', sessions: 2720, users: 1600, purchases: 72, cr: 2.65, revenue: 14220, revPerSession: 5.23, quality: 'Watch' },
  { group: 'Unassigned', sessions: 4110, users: 3100, purchases: 24, cr: 0.58, revenue: 2000, revPerSession: 0.48, quality: 'Risk' },
] as const satisfies readonly TrafficChannelRow[];

export type LandingPageTone =
  | 'all'
  | 'high_cr'
  | 'high_traffic_low_cr'
  | 'tracking_issue';

export const landingPageFilterOptions = [
  {
    label: 'Wszystkie',
    value: 'all',
  },
  {
    label: 'Duży Ruch / Niski CR',
    value: 'high_traffic_low_cr',
  },
  {
    label: 'Wysoki CR',
    value: 'high_cr',
  },
  {
    label: 'Problem z trackingiem',
    value: 'tracking_issue',
  },
] as const satisfies readonly {
  readonly label: string;
  readonly value: LandingPageTone;
}[];

export type LandingPageRow = {
  readonly cr: number | null;
  readonly mobileRatio: number;
  readonly path: string;
  readonly revenue: number;
  readonly revPerSession: number | null;
  readonly sessions: number;
  readonly tone: Exclude<LandingPageTone, 'all'>;
  readonly users: number;
};

export const landingPageRows = [
  { path: '/products/serum-c-vitamin', sessions: 18420, users: 15820, cr: 3.80, revenue: 284000, revPerSession: 15.42, mobileRatio: 64, tone: 'high_cr' },
  { path: '/collections/bestsellers-new', sessions: 14230, users: 11450, cr: 1.40, revenue: 82600, revPerSession: 5.81, mobileRatio: 78, tone: 'high_traffic_low_cr' },
  { path: '/products/hydration-cream', sessions: 12100, users: 9800, cr: 4.10, revenue: 215000, revPerSession: 17.76, mobileRatio: 52, tone: 'high_cr' },
  { path: '/blog/how-to-build-skincare-routine', sessions: 9840, users: 8900, cr: 0.45, revenue: 14200, revPerSession: 1.44, mobileRatio: 82, tone: 'high_traffic_low_cr' },
  { path: '/checkout/step-1', sessions: 6500, users: 5900, cr: null, revenue: 0, revPerSession: null, mobileRatio: 71, tone: 'tracking_issue' },
] as const satisfies readonly LandingPageRow[];

export const landingDrawerSources = [
  {
    label: 'Google / Organic',
    value: '42% ruchu',
  },
  {
    label: 'Meta Ads / Paid Social',
    value: '38% ruchu',
  },
  {
    label: 'Direct',
    value: '20% ruchu',
  },
] as const;

export const landingDrawerInsight = 'Strona posiada wysoki Purchase CR na Desktopie (5.2%), ale ruch mobilny przynosi stratę konwersji ze względu na zbyt wolno ładującą się galerię zdjęć produktu.';

export const trafficFunnelSteps = [
  {
    label: 'Wszystkie Sesje',
    meta: '100% bazy ruchu',
    progress: 100,
    step: 'Krok 1',
    tone: 'slate',
    value: '128 420',
  },
  {
    label: 'Oglądanie Produktu',
    meta: '65.5% przejścia',
    progress: 65.5,
    step: 'Krok 2',
    tone: 'slate',
    value: '84 112',
  },
  {
    label: 'Dodanie do Koszyka',
    meta: '22.5% z produktów',
    progress: 22.5,
    step: 'Krok 3',
    tone: 'slate',
    value: '18 920',
  },
  {
    label: 'Rozpoczęcie Checkoutu',
    meta: '59.3% z koszyków',
    progress: 59.3,
    step: 'Krok 4 (Wąskie gardło)',
    tone: 'amber',
    value: '11 218',
  },
  {
    label: 'Finalny Zakup',
    meta: '57.8% z checkoutu',
    progress: 57.8,
    step: 'Krok 5',
    tone: 'emerald',
    value: '6 482',
  },
] as const satisfies readonly {
  readonly label: string;
  readonly meta: string;
  readonly progress: number;
  readonly step: string;
  readonly tone: TrafficTone;
  readonly value: string;
}[];

export const funnelScenario = {
  aov: 296,
  baseCompletionRate: 57.8,
  checkoutSessions: 11218,
  maxCompletionRate: 68.0,
} as const;

export const trafficDeviceRows = [
  {
    cr: '1.84%',
    icon: 'mobile',
    label: 'Mobile (Smartfony)',
    revPerSession: '5.45 zł',
    sessions: '91 690',
    share: '71.4% Ruchu',
    tone: 'rose',
    users: '58 840',
  },
  {
    cr: '3.82%',
    icon: 'desktop',
    label: 'Desktop (Komputery)',
    revPerSession: '11.80 zł',
    sessions: '33 520',
    share: '26.1% Ruchu',
    tone: 'emerald',
    users: '21 540',
  },
  {
    cr: '2.10%',
    icon: 'tablet',
    label: 'Tablet',
    revPerSession: '6.20 zł',
    sessions: '3 210',
    share: '2.5% Ruchu',
    tone: 'slate',
    users: '2 039',
  },
] as const satisfies readonly {
  readonly cr: string;
  readonly icon: string;
  readonly label: string;
  readonly revPerSession: string;
  readonly sessions: string;
  readonly share: string;
  readonly tone: TrafficTone;
  readonly users: string;
}[];

export const trafficGeoRows = [
  {
    country: 'Polska (Poland)',
    cr: '3.25%',
    flag: 'PL',
    revenue: '1 042 100 zł',
    sessions: '112 400',
    tone: 'emerald',
  },
  {
    country: 'Niemcy (Germany)',
    cr: '2.41%',
    flag: 'DE',
    revenue: '92 400 zł',
    sessions: '8 920',
    tone: 'slate',
  },
  {
    country: 'Czechy (Czechia)',
    cr: '2.80%',
    flag: 'CZ',
    revenue: '38 200 zł',
    sessions: '4 210',
    tone: 'slate',
  },
  {
    country: 'Słowacja (Slovakia)',
    cr: '1.95%',
    flag: 'SK',
    revenue: '15 520 zł',
    sessions: '2 890',
    tone: 'slate',
  },
] as const satisfies readonly {
  readonly country: string;
  readonly cr: string;
  readonly flag: string;
  readonly revenue: string;
  readonly sessions: string;
  readonly tone: TrafficTone;
}[];

export const trackingQualityCards = [
  {
    label: 'Pokrycie Zakupów (Purchase Coverage)',
    meta: 'GA4: 4 006 / Commerce: 4 248',
    tone: 'emerald',
    value: '94.3%',
  },
  {
    label: 'Uzgodnienie Przychodu (Revenue Gap)',
    meta: 'GA4: 1.188M zł / Commerce: 1.26M zł',
    tone: 'slate',
    value: '-5.7% rozbieżności',
  },
  {
    label: 'Ruch Nieprzypisany (Unassigned Traffic)',
    meta: 'Norma poniżej 5%',
    tone: 'emerald',
    value: '3.2%',
  },
  {
    label: 'Ostatnia Synchronizacja (GA4 Connector)',
    meta: 'Faktyczna synchro bez opóźnień',
    tone: 'emerald',
    value: '14 minut temu',
  },
] as const satisfies readonly {
  readonly label: string;
  readonly meta: string;
  readonly tone: TrafficTone;
  readonly value: string;
}[];

export type TrafficBacklogPriority =
  | 'P0'
  | 'P1';

export type TrafficBacklogFilter =
  | 'all'
  | TrafficBacklogPriority;

export const backlogFilterOptions = [
  {
    label: 'Wszystkie (12)',
    value: 'all',
  },
  {
    label: 'Blokery P0 (7)',
    value: 'P0',
  },
  {
    label: 'Rozbudowa P1 (5)',
    value: 'P1',
  },
] as const satisfies readonly {
  readonly label: string;
  readonly value: TrafficBacklogFilter;
}[];

export const trafficBacklogRows = [
  { id: 'P0.1', priority: 'P0', title: 'Brak ID-6 w canonical product surface registry', status: 'Fix Plan', desc: 'Frontend dodawał "Ruch na stronie" ręcznie. Dodano kanoniczny wpis ID-6 z endpointem /dashboard/traffic.' },
  { id: 'P0.2', priority: 'P0', title: 'Brak traffic.overview w rejestrze AI Screen Governance', status: 'Fix Plan', desc: 'Powiązano ekran z kontekstami AI: traffic.sessions, traffic.conversion, traffic.funnel itd.' },
  { id: 'P0.3', priority: 'P0', title: 'Regex brandów kwalifikował organic search jako paid', status: 'Fix Plan', desc: 'Zastąpiono walidacją źródło+medium oraz GA4 defaultChannelGroup. google/organic ≠ paid.' },
  { id: 'P0.4', priority: 'P0', title: 'Wszystko non-paid trafiało do organicSessions', status: 'Fix Plan', desc: 'Wdrożono pełną taksonomię: Direct, Referral, Email, Organic Social, Unassigned.' },
  { id: 'P0.5', priority: 'P0', title: 'Sumowanie nie-addytywnej metryki Users (SUM usersCount)', status: 'Fix Plan', desc: 'Wdrożono koncepcję exact-range users aggregate zamiast prostej sumy wierszy.' },
  { id: 'P0.6', priority: 'P0', title: 'Cost per Purchase dzielił wydatki reklamowe przez całą sprzedaż', status: 'Fix Plan', desc: 'Usunięto Cost per Purchase z głównego modułu Traffic. Przeniesiono do Kampanii Płatnych (ID-2).' },
  { id: 'P0.7', priority: 'P0', title: 'Mieszany lejek kampanii (Ads impressions + GA4 carts)', status: 'Fix Plan', desc: 'Rozdzielono na spójny Onsite Ecommerce Funnel bazujący na jednolitej populacji sesji.' },
  { id: 'P0.8', priority: 'P0', title: 'Sztuczne generowanie delta CR (+-0.3 pp) przez frontend', status: 'Naprawione', desc: 'Usunięto sztuczne delty. Deltas są wyświetlane wyłącznie z realnych danych porównawczych.' },
  { id: 'P0.9', priority: 'P0', title: 'Prezentowanie braku danych (null) jako 0.00%', status: 'Naprawione', desc: 'Brak danych jest teraz opisywany jawnie jako "Brak danych" / N/A, a nie 0.00%.' },
  { id: 'P1.1', priority: 'P1', title: 'Brak modułu Landing Page Explorer', status: 'Wdrożone', desc: 'Dodano pełny eksplorator stron wejścia z podglądem w dedykowanym drawerze.' },
  { id: 'P1.2', priority: 'P1', title: 'Brak wskaźnika Pokrycia Zakupów (Tracking Coverage Index)', status: 'Wdrożone', desc: 'Wprowadzono porównanie GA4 Purchases vs Commerce FactOrder Orders.' },
  { id: 'P1.3', priority: 'P1', title: 'Brak metryki Przychód / Sesję (Rev/Session)', status: 'Wdrożone', desc: 'Wprowadzono hybrydową metrykę łączącą ruch i wartość koszyka.' },
] as const satisfies readonly {
  readonly desc: string;
  readonly id: string;
  readonly priority: TrafficBacklogPriority;
  readonly status: string;
  readonly title: string;
}[];

export type PapaTerminalType =
  | 'direct_spike'
  | 'mobile_drop'
  | 'ready'
  | 'tracking_gap';

export const papaTerminalReports: Record<PapaTerminalType, {
  readonly contextLabel: string;
  readonly lines: readonly {
    readonly label: string;
    readonly tone: TrafficTone;
    readonly value: string;
  }[];
  readonly title: string;
}> = {
  ready: {
    contextLabel: '[Papa Data AI - System Diagnostic Ready]',
    title: 'Kliknij jeden z powyższych przycisków, aby wygenerować analizę...',
    lines: [],
  },
  mobile_drop: {
    contextLabel: 'PAPA AI DIAGNOSTIC REPORT: MOBILE CONVERSION DROP',
    title: 'Mobile CR Drop',
    lines: [
      { label: '1. Obserwacja:', tone: 'amber', value: 'Współczynnik konwersji (CR) na smartfonach spadł z 2.45% do 1.84% w ciągu ostatnich 14 dni.' },
      { label: '2. Dowód:', tone: 'indigo', value: 'Baza 91 690 sesji mobilnych. Spadek skumulowany w kroku Begin Checkout ➔ Purchase (-11.2 pp vs desktop).' },
      { label: '3. Interpretacja:', tone: 'indigo', value: 'Ruch reklamowy z Paid Social dowozi właściwą grupę docelową. Problem występuje wyłącznie na formularzu checkoutu mobilnego po wdrożeniu nowej bramki płatności.' },
      { label: '4. Rekomendacja:', tone: 'emerald', value: 'Przeprowadź audyt UX walidacji pól adresu oraz czasu ładowania widgetu BLIK na urządzeniach mobilnych iOS. Nie zmniejszaj budżetu reklamowego.' },
      { label: '5. Potencjalny wpływ:', tone: 'emerald', value: 'Powrót do mediany 90d (2.45% CR) przyniesie ok. 180 dodatkowych zamówień (+84-116 tys. zł przychodu / mies.).' },
      { label: '6. Pewność & Ograniczenia:', tone: 'slate', value: 'Wysoka (94%). Pokrycie zakupów GA4 vs Commerce wynosi 94.3%.' },
    ],
  },
  tracking_gap: {
    contextLabel: 'PAPA AI DIAGNOSTIC REPORT: GA4 VS COMMERCE RECONCILIATION',
    title: 'GA4 vs Commerce Gap',
    lines: [
      { label: '1. Obserwacja:', tone: 'amber', value: 'GA4 odnotowało 4 006 zakupów, podczas gdy Commerce FactOrder zarejestrował 4 248 zamówień (Gap: -5.7%).' },
      { label: '2. Dowód:', tone: 'indigo', value: 'Liczba brakujących zdarzeń purchase w GA4 wynosi 242 zamówienia. Przychód GA4 (1.188M zł) vs Commerce (1.260M zł).' },
      { label: '3. Interpretacja:', tone: 'indigo', value: 'Rozbieżność mieści się w dopuszczalnej normie branżowej (< 10%). Główną przyczyną są bloki cookie-consent oraz szybkie zamknięcie karty dziękujemy na mobile safari.' },
      { label: '4. Rekomendacja:', tone: 'emerald', value: 'Wdróż Server-Side Measurement Protocol dla zdarzenia purchase, aby domknąć 5.7% luki bez polegania wyłącznie na tagu przeglądarkowym.' },
      { label: '5. Pewność & Ograniczenia:', tone: 'slate', value: 'Bardzo wysoka (98%). Źródło prawdy sprzedaży pozostaje po stronie Commerce FactOrder.' },
    ],
  },
  direct_spike: {
    contextLabel: 'PAPA AI DIAGNOSTIC REPORT: DIRECT TRAFFIC DIAGNOSTICS',
    title: 'Skok ruchu Direct',
    lines: [
      { label: '1. Obserwacja:', tone: 'amber', value: 'Ruch Direct odnotował wzrost o +18.4% z wysokim CR (4.06%) i przychodem 178 000 zł.' },
      { label: '2. Dowód:', tone: 'indigo', value: '14 280 sesji Direct, z czego 64% wpada na strona główna, a 22% bezpośrednio na karty produktów.' },
      { label: '3. Interpretacja:', tone: 'indigo', value: 'Część tego ruchu to powracający klienci, jednak wykryto utratę parametrów UTM przy przekierowaniach z domeny skróconej w newsletterze.' },
      { label: '4. Rekomendacja:', tone: 'emerald', value: 'Sprawdź reguły 301/302 w pliku htaccess/CDN, aby upewnić się, że query string z UTM nie jest odcinany przy przekierowaniach HTTP➔HTTPS.' },
    ],
  },
};
