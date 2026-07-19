export type DashboardModule =
  | 'shell'
  | 'command'
  | 'orders'
  | 'products'
  | 'customers'
  | 'traffic'
  | 'campaigns'
  | 'integrations'
  | 'settings'
  | 'subscription'
  | 'support'
  | 'assistant';

export type DashboardStatus = 'ready' | 'warning' | 'blocked';

export type DashboardDefinition = {
  headline: string;
  metricA: string;
  metricB: string;
  metricC: string;
  module: string;
  status: DashboardStatus;
  summary: string;
};

export type DashboardNavigationIcon =
  | 'home'
  | 'shoppingCart'
  | 'packageSearch'
  | 'users'
  | 'lineChart'
  | 'megaphone'
  | 'plugZap'
  | 'settings';

export type DashboardTopbarIcon = 'calendarDays' | 'search' | 'bell';

export type DashboardInsightIcon =
  | 'checkCircle'
  | 'circleDollar'
  | 'helpCircle';

export const dashboardDefinitions: Record<
  DashboardModule,
  DashboardDefinition
> = {
  shell: {
    headline: 'Dashboard',
    metricA: '98%',
    metricB: '24 h',
    metricC: '7 modułów',
    module: 'Shell',
    status: 'ready',
    summary:
      'Powłoka pokazuje workspace, zakres dat, świeżość danych, wyszukiwanie i wejście do Asystenta.',
  },
  command: {
    headline: 'Centrum Dowodzenia',
    metricA: '12,4%',
    metricB: '3 ryzyka',
    metricC: '5 akcji',
    module: 'Centrum Dowodzenia',
    status: 'warning',
    summary:
      'Pierwsza powierzchnia decyzyjna dla priorytetów sprzedaży, marży i operacji z jawnym wpływem brakujących danych.',
  },
  orders: {
    headline: 'Zamówienia',
    metricA: '128 tys.',
    metricB: '4,8%',
    metricC: '312',
    module: 'Zamówienia',
    status: 'ready',
    summary:
      'Zdrowie zamówień, przychód, anulowania, zwroty i ryzyka realizacji.',
  },
  products: {
    headline: 'Produkty',
    metricA: '48',
    metricB: '17%',
    metricC: '9',
    module: 'Produkty',
    status: 'warning',
    summary:
      'Produkty wymagające akcji handlowej, stock/range i wpływ na wynik.',
  },
  customers: {
    headline: 'Klienci',
    metricA: '8,2 tys.',
    metricB: '31%',
    metricC: '4 segmenty',
    module: 'Klienci',
    status: 'ready',
    summary:
      'Retencja, wartość segmentów i sygnały jakości bazy klientów.',
  },
  traffic: {
    headline: 'Ruch na stronie',
    metricA: '42 tys.',
    metricB: '2,9%',
    metricC: '48 h',
    module: 'Ruch',
    status: 'warning',
    summary:
      'Źródła popytu i jakość ruchu z jawnym oznaczeniem świeżości danych.',
  },
  campaigns: {
    headline: 'Kampanie płatne',
    metricA: '4,1 ROAS',
    metricB: '18 tys.',
    metricC: '2 alerty',
    module: 'Kampanie płatne',
    status: 'ready',
    summary:
      'Wydatki, zwrot, budżet i ryzyka kampanii bez ukrywania braków danych.',
  },
  integrations: {
    headline: 'Integracje',
    metricA: '2 aktywne',
    metricB: '1 opóźniona',
    metricC: 'logowanie',
    module: 'Integracje',
    status: 'warning',
    summary:
      'Połączenia, diagnostyka, ponowienie próby i bezpieczne odłączenie źródeł.',
  },
  settings: {
    headline: 'Ustawienia',
    metricA: '6 domen',
    metricB: 'MFA',
    metricC: 'audyt',
    module: 'Ustawienia',
    status: 'ready',
    summary:
      'Rozdzielone domeny konta, workspace, bezpieczeństwa, uprawnień i integracji.',
  },
  subscription: {
    headline: 'Subskrypcja',
    metricA: 'Pro',
    metricB: '82%',
    metricC: '3 limity',
    module: 'Subskrypcja',
    status: 'ready',
    summary:
      'Plan, faktury i limity użycia bez automatycznego działania finansowego.',
  },
  support: {
    headline: 'Pomoc',
    metricA: '24/7',
    metricB: '6 tematów',
    metricC: 'SLA',
    module: 'Pomoc',
    status: 'ready',
    summary:
      'Samoobsługa, kontakt z człowiekiem i bezpieczna eskalacja problemu.',
  },
  assistant: {
    headline: 'Papa Asystent',
    metricA: '3 źródła',
    metricB: 'częściowe',
    metricC: '5 cyt.',
    module: 'Papa Asystent',
    status: 'warning',
    summary:
      'Kontekstowe wsparcie decyzyjne ograniczone uprawnieniami i jakością danych.',
  },
};

export const dashboardNavigationItems = [
  { key: 'command', label: 'Centrum Dowodzenia', icon: 'home' },
  { key: 'orders', label: 'Zamówienia', icon: 'shoppingCart' },
  { key: 'products', label: 'Produkty', icon: 'packageSearch' },
  { key: 'customers', label: 'Klienci', icon: 'users' },
  { key: 'traffic', label: 'Ruch', icon: 'lineChart' },
  { key: 'campaigns', label: 'Kampanie', icon: 'megaphone' },
  { key: 'integrations', label: 'Integracje', icon: 'plugZap' },
  { key: 'settings', label: 'Ustawienia', icon: 'settings' },
] as const satisfies readonly {
  icon: DashboardNavigationIcon;
  key: DashboardModule;
  label: string;
}[];

export const dashboardWorkspaceContext = {
  dataLabel: 'dane sprzedażowe',
  timezone: 'Europe/Warsaw',
  workspaceName: 'Northstar Commerce',
} as const;

export const dashboardTopbarControls = [
  { icon: 'calendarDays', label: 'Ostatnie 30 dni' },
  { icon: 'search', label: 'Szukaj' },
  { icon: 'bell', label: '4' },
] as const satisfies readonly {
  icon: DashboardTopbarIcon;
  label: string;
}[];

export const dashboardChartBars = [
  42,
  58,
  47,
  76,
  61,
  88,
  69,
  81,
] as const;

export const dashboardDecisionInsights = [
  {
    icon: 'checkCircle',
    text: 'Priorytet pokazuje źródło danych, zakres i wpływ.',
  },
  {
    icon: 'circleDollar',
    text: 'Rekomendacje nie udają pewności przy częściowych danych.',
  },
  {
    icon: 'helpCircle',
    text: 'Odzyskanie działania pozostaje dostępne bez opuszczania kontekstu.',
  },
] as const satisfies readonly {
  icon: DashboardInsightIcon;
  text: string;
}[];

export const dashboardSignalRows = [
  {
    impact: 'Wysoki',
    signal: 'Tempo sprzedaży',
    source: 'Zamówienia',
    state: 'ready',
  },
  {
    impact: 'Średni',
    signal: 'Ruch płatny',
    source: 'Kampanie',
    state: 'warning',
  },
  {
    impact: 'Wymaga ponowienia',
    signal: 'Stan integracji',
    source: 'Shopify',
    state: 'delayed',
  },
] as const;

export type DashboardComponentControlIcon =
  | 'bell'
  | 'calendarDays'
  | 'download'
  | 'search';

export type CommandCenterSignalIcon =
  | 'badgeAlert'
  | 'checkCircle'
  | 'sparkles';

export const commandCenterCards = [
  {
    description: 'Wpływ: kampanie płatne i rabaty w 2 kategoriach.',
    label: 'Wniosek',
    value: 'Marża rośnie wolniej niż przychód',
  },
  {
    description: 'Zamówienia gotowe, kampanie częściowe, ruch opóźniony.',
    label: 'Źródła',
    value: '3 aktywne',
  },
  {
    description: 'Najbliższy krok bez automatycznego działania AI.',
    label: 'Akcja',
    value: 'Przejrzyj kampanie',
  },
] as const;

export const commandCenterSignals = [
  {
    icon: 'sparkles',
    text: 'Rekomendacja AI pokazuje ograniczenia danych i cytacje.',
  },
  {
    icon: 'badgeAlert',
    text: 'Alerty nie są ukryte w tooltipach i mają tekstowy wpływ.',
  },
  {
    icon: 'checkCircle',
    text: 'Akcja wymaga świadomego kliknięcia użytkownika.',
  },
] as const satisfies readonly {
  icon: CommandCenterSignalIcon;
  text: string;
}[];

export const dashboardComponentControls = [
  { icon: 'calendarDays', label: 'Ostatnie 30 dni' },
  { icon: 'search', label: 'Szukaj' },
  { icon: 'download', label: 'Eksport' },
  { icon: 'bell', label: 'Alerty' },
] as const satisfies readonly {
  icon: DashboardComponentControlIcon;
  label: string;
}[];

export const dashboardComponentCards = [
  {
    description: 'Dane kompletne dla jawnego zakresu.',
    label: 'gotowy',
    value: '128 tys.',
  },
  {
    description: 'Brak danych o ruchu wpływa na interpretację.',
    label: 'częściowe',
    value: '2 źródła',
  },
  {
    description: 'Ostatnia udana synchronizacja przekroczyła próg.',
    label: 'opóźnione',
    value: '48 h',
  },
] as const;
