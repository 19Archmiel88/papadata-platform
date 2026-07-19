export type AnalyticalListIcon =
  | 'alertTriangle'
  | 'checkCircle'
  | 'clock'
  | 'databaseZap'
  | 'lock'
  | 'refresh';

export const analyticalKpiCards = [
  {
    description: 'Ostatnie 30 dni, orders ready, timezone Europe/Warsaw.',
    label: 'Przychód',
    value: '128 400 PLN',
  },
  {
    description: 'Partial: brak kosztów reklam dla jednego źródła.',
    label: 'Marża',
    value: '31,2%',
  },
  {
    description: 'Traffic stale: ostatnia synchronizacja 48 godzin temu.',
    label: 'Konwersja',
    value: '3,4%',
  },
] as const;

export const analyticalChartBars = [
  42,
  51,
  63,
  48,
  74,
  82,
  69,
  88,
  73,
  91,
] as const;

export const analyticalTrafficRows = [
  {
    conversion: '3,8%',
    revenue: '42 800 PLN',
    source: 'Organic search',
    state: 'ready',
  },
  {
    conversion: '2,4%',
    revenue: '31 200 PLN',
    source: 'Paid social',
    state: 'partial',
  },
  {
    conversion: '5,1%',
    revenue: '18 900 PLN',
    source: 'Email',
    state: 'ready',
  },
] as const;

export const analyticalStateCards = [
  {
    description: 'Zakres danych spełnia warunki KPI.',
    label: 'ready',
    title: 'Gotowe',
  },
  {
    description: 'Widoczny jest wpływ brakujących źródeł.',
    label: 'partial',
    title: 'Częściowe',
  },
  {
    description: 'Ostatnia synchronizacja przekroczyła próg.',
    label: 'stale',
    title: 'Nieświeże',
  },
] as const;

export const analyticalStateItems = [
  {
    icon: 'checkCircle',
    text: 'ready: dane kompletne i aktualne dla zakresu.',
  },
  {
    icon: 'databaseZap',
    text: 'syncing: trwa realne pobieranie albo przetwarzanie.',
  },
  {
    icon: 'clock',
    text: 'waiting: następny krok ma provider albo administrator.',
  },
  {
    icon: 'lock',
    text: 'permissionDenied: brak capability bez ujawniania danych.',
  },
] as const satisfies readonly {
  icon: AnalyticalListIcon;
  text: string;
}[];

export const analyticalQualityItems = [
  {
    icon: 'alertTriangle',
    text: 'Każda metryka wskazuje brakujące źródło i wpływ na decyzję.',
  },
  {
    icon: 'refresh',
    text: 'Retry odróżnia ponowną ocenę gotowości od synchronizacji.',
  },
  {
    icon: 'checkCircle',
    text: 'Dane przykładowe nie udają danych klienta.',
  },
] as const satisfies readonly {
  icon: AnalyticalListIcon;
  text: string;
}[];
