import type {
  PapaDataIconName,
} from '../../../design-system';
import {
  papaAssistantLabStages,
} from '../../../screens/papa-assistant/lab/PapaAssistantLabScreen.model';
import type {
  PapaAssistantLabScreenData,
} from '../../../screens/papa-assistant/lab/PapaAssistantLabScreen.model';

export const papaLabTabs = [
  {
    id: 'overview',
    icon: 'home',
    label: '1. Koncepcja',
  },
  {
    id: 'shell',
    icon: 'assistant',
    label: '2. AssistantShell (UI)',
  },
  {
    id: 'context',
    icon: 'data',
    label: '3. Context Basket',
  },
  {
    id: 'queue',
    icon: 'decisions',
    label: '4. DecisionQueue',
  },
  {
    id: 'analytics',
    icon: 'warning',
    label: '5. Pewność & Odmowy',
  },
  {
    id: 'builder',
    icon: 'trend',
    label: '6. Studio Wykresów',
  },
  {
    id: 'innovation',
    icon: 'integration',
    label: '7. Symulator What-If & AI',
  },
  {
    id: 'lab',
    icon: 'security',
    label: '8. Laboratorium & AI Act',
  },
] as const satisfies readonly {
  readonly icon: PapaDataIconName;
  readonly id: string;
  readonly label: string;
}[];

export type PapaLabTabId = typeof papaLabTabs[number]['id'];

export const papaLabOverviewCards = [
  {
    icon: 'decisions',
    title: 'Zawsze Jawny Kontekst',
    tone: 'indigo',
    body: 'Każde zapytanie trafia do AI razem z jawnym kontekstem: ID tenanta, workspace, aktywnego ekranu, zakresem dat, wybranymi KPI i uprawnieniami.',
  },
  {
    icon: 'trend',
    title: 'Studio Wykresów Klienta',
    tone: 'amber',
    body: 'Użytkownik sam projektuje wygląd raportów: dodaje własne typy wykresów, dobiera palety kolorystyczne i modyfikuje serie danych na żywo.',
  },
  {
    icon: 'integration',
    title: 'Symulacje What-If (Innowacja)',
    tone: 'emerald',
    body: 'Unikalny na polskim rynku silnik symulacji przyczynowo-skutkowych pozwalający przetestować skutki zmian rynkowych przed modyfikacją budżetu.',
  },
] as const satisfies readonly {
  readonly body: string;
  readonly icon: PapaDataIconName;
  readonly title: string;
  readonly tone: PapaLabTone;
}[];

export const papaLabWorkModes = [
  {
    id: 'brief',
    icon: 'assistant',
    label: 'Szybki brief',
    summary: 'Podsumowanie aktywnego ekranu w 3 punktach',
  },
  {
    id: 'interpretation',
    icon: 'search',
    label: 'Interpretacja',
    summary: 'Wyjaśnienie zmian KPI i kluczowych driverów',
  },
  {
    id: 'diagnosis',
    icon: 'warning',
    label: 'Diagnoza',
    summary: 'Szukanie wąskich gardeł i brakujących danych',
  },
  {
    id: 'decision',
    icon: 'decisions',
    label: 'Decyzja',
    summary: 'Warianty działania i kalkulacja Przed / Po',
  },
  {
    id: 'report',
    icon: 'data',
    label: 'Raport',
    summary: 'Inicjowanie asynchronicznego Report Joba',
  },
  {
    id: 'plan',
    icon: 'calendar',
    label: 'Plan działań',
    summary: 'Struktura zadań, właścicieli i terminów',
  },
] as const satisfies readonly {
  readonly icon: PapaDataIconName;
  readonly id: string;
  readonly label: string;
  readonly summary: string;
}[];

export type PapaLabWorkModeId = typeof papaLabWorkModes[number]['id'];

export const papaLabWorkbenchModes = [
  {
    id: 'diagnosis',
    icon: 'warning',
    label: 'Diagnoza',
    summary: 'Źródła problemu, fakty, hipotezy i ograniczenia danych.',
  },
  {
    id: 'decision',
    icon: 'decisions',
    label: 'Decyzja',
    summary: 'Warianty działania, What-If i kontrola human-in-the-loop.',
  },
  {
    id: 'report',
    icon: 'data',
    label: 'Raport',
    summary: 'Artefakty, wykresy i asynchroniczny Report Job.',
  },
  {
    id: 'plan',
    icon: 'calendar',
    label: 'Plan działań',
    summary: 'Kolejne kroki, właściciele, terminy i status wykonania.',
  },
] as const satisfies readonly {
  readonly icon: PapaDataIconName;
  readonly id: string;
  readonly label: string;
  readonly summary: string;
}[];

export type PapaLabWorkbenchModeId = typeof papaLabWorkbenchModes[number]['id'];

export const papaLabCanvasTabs = [
  {
    id: 'project',
    label: 'Projekt',
  },
  {
    id: 'result',
    label: 'Wynik',
  },
  {
    id: 'comparison',
    label: 'Porównanie',
  },
] as const;

export type PapaLabCanvasTabId = typeof papaLabCanvasTabs[number]['id'];

export const papaLabInspectorTabs = [
  {
    id: 'context',
    icon: 'data',
    label: 'Kontekst',
  },
  {
    id: 'evidence',
    icon: 'security',
    label: 'Dowody',
  },
  {
    id: 'quality',
    icon: 'decisions',
    label: 'Jakość',
  },
  {
    id: 'actions',
    icon: 'integration',
    label: 'Akcje',
  },
] as const satisfies readonly {
  readonly icon: PapaDataIconName;
  readonly id: string;
  readonly label: string;
}[];

export type PapaLabInspectorTabId = typeof papaLabInspectorTabs[number]['id'];

export const papaLabWorkbenchAnalyses = [
  {
    id: 'checkout-conversion',
    marker: 'rose',
    meta: 'Dzisiaj, 10:42',
    name: 'Spadek konwersji checkout',
  },
  {
    id: 'ads-budget',
    marker: 'emerald',
    meta: 'Wczoraj, 15:30',
    name: 'Budżet Ads - scenariusze',
  },
  {
    id: 'returns',
    marker: 'amber',
    meta: '16 maj, 09:12',
    name: 'Zwroty i reklamacje - diagnoza',
  },
  {
    id: 'sales-funnel',
    marker: 'emerald',
    meta: '15 maj, 11:08',
    name: 'Lejek sprzedażowy - audyt',
  },
  {
    id: 'aov-margin',
    marker: 'amber',
    meta: '14 maj, 16:44',
    name: 'AOV i marża - optymalizacja',
  },
] as const;

export const papaLabLibrarySections = [
  {
    count: 12,
    icon: 'data',
    label: 'Raporty i wykresy',
  },
  {
    count: 6,
    icon: 'decisions',
    label: 'Szablony Studio',
  },
  {
    count: 4,
    icon: 'integration',
    label: 'Scenariusze What-If',
  },
  {
    count: 2,
    icon: 'assistant',
    label: 'Artefakty AI (PapaScreen)',
  },
] as const satisfies readonly {
  readonly count: number;
  readonly icon: PapaDataIconName;
  readonly label: string;
}[];

export const papaLabHistorySections = [
  {
    icon: 'decisions',
    label: 'Dziennik interakcji',
  },
  {
    icon: 'success',
    label: 'Wykonane analizy',
  },
  {
    icon: 'data',
    label: 'Eksporty i raporty',
  },
] as const satisfies readonly {
  readonly icon: PapaDataIconName;
  readonly label: string;
}[];

export const papaLabRunStates = [
  {
    id: 'draft',
    label: 'Szkic',
    tone: 'slate',
    summary: 'Analiza przygotowana, jeszcze bez uruchomienia.',
  },
  {
    id: 'validating',
    label: 'Walidacja',
    tone: 'blue',
    summary: 'System sprawdza kontekst, dostęp i kompletność danych.',
  },
  {
    id: 'running',
    label: 'W toku',
    tone: 'indigo',
    summary: 'Retrieval, analiza i symulacje są wykonywane.',
  },
  {
    id: 'partial',
    label: 'Dane częściowe',
    tone: 'amber',
    summary: 'Wynik dostępny z ograniczeniami i brakującymi źródłami.',
  },
  {
    id: 'failed',
    label: 'Błąd analizy',
    tone: 'rose',
    summary: 'Analiza zatrzymana, wymagane odzyskanie lub ponowienie.',
  },
  {
    id: 'completed',
    label: 'Zakończono',
    tone: 'emerald',
    summary: 'Wynik, artefakty i rekomendacje są gotowe do przeglądu.',
  },
  {
    id: 'noData',
    label: 'Brak danych',
    tone: 'rose',
    summary: 'Brak próby danych dla wybranego zakresu i filtrów.',
  },
  {
    id: 'staleData',
    label: 'Dane przestarzałe',
    tone: 'amber',
    summary: 'Część snapshotów wymaga odświeżenia przed decyzją.',
  },
  {
    id: 'permissionDenied',
    label: 'Brak dostępu',
    tone: 'rose',
    summary: 'Użytkownik nie ma capability wymaganej dla źródła lub akcji.',
  },
  {
    id: 'aiRefusal',
    label: 'Odmowa AI',
    tone: 'amber',
    summary: 'Papa Asystent odmawia z powodu ograniczeń kontraktu.',
  },
  {
    id: 'providerError',
    label: 'Błąd providera',
    tone: 'rose',
    summary: 'Integracja zewnętrzna zwróciła błąd podczas retrieval.',
  },
  {
    id: 'cancelled',
    label: 'Anulowano',
    tone: 'slate',
    summary: 'Analiza została zatrzymana przed syntezą wyniku.',
  },
  {
    id: 'recovery',
    label: 'Odzyskiwanie',
    tone: 'blue',
    summary: 'System ponawia bezpieczne etapy i zachowuje audit trail.',
  },
] as const satisfies readonly {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly tone: PapaLabTone;
}[];

export type PapaLabRunStateId = typeof papaLabRunStates[number]['id'];

export const papaLabRunSteps = [
  {
    elapsed: '00:00:07',
    id: 'context',
    label: 'Walidacja kontekstu',
    status: 'done',
  },
  {
    elapsed: '00:00:11',
    id: 'access',
    label: 'Sprawdzenie dostępu',
    status: 'done',
  },
  {
    elapsed: '00:00:18',
    id: 'retrieval',
    label: 'Pobieranie danych / Retrieval',
    status: 'done',
  },
  {
    elapsed: '00:01:25',
    id: 'analysis',
    label: 'Analiza',
    status: 'active',
  },
  {
    elapsed: '00:00:57',
    id: 'simulation',
    label: 'Symulacje',
    status: 'queued',
  },
  {
    elapsed: '00:00:00',
    id: 'synthesis',
    label: 'Synteza wyniku',
    status: 'queued',
  },
] as const;

export type PapaLabModeResponse = {
  readonly facts: readonly string[];
  readonly hypotheses: readonly string[];
  readonly interpretations: readonly string[];
  readonly limitations: readonly string[];
  readonly nextSteps: readonly string[];
  readonly recommendations: readonly string[];
};

export const papaLabModeResponses: Record<PapaLabWorkModeId, PapaLabModeResponse> = {
  brief: {
    facts: [
      'Współczynnik konwersji w weekend spadł o 1.4 p.p.',
      'Unikalne sesje wzrosły o +12% r/r.',
    ],
    hypotheses: [
      'Problem na bramce płatności mobilnych wywołał porzucenie koszyków.',
    ],
    interpretations: [
      'Ruch z social media charakteryzował się niższą intencją zakupu.',
    ],
    limitations: [
      'Brak 8% danych przez AdBlock.',
    ],
    nextSteps: [
      'Przejdź do Studia Wykresów lub zrób symulację.',
    ],
    recommendations: [
      'Sprawdź logi bramki płatniczej dla ruchu iOS.',
    ],
  },
  interpretation: {
    facts: [
      'MRR wzrósł o +4,200 PLN w 14 dni.',
      'Pakiet Pro zanotował +28 nowych subskrypcji.',
    ],
    hypotheses: [
      'Skalowanie triala przyniesie +15k PLN do końca kwartału.',
    ],
    interpretations: [
      'Automatyczny onboarding mailowy podniósł aktywację z 14% do 22%.',
    ],
    limitations: [
      'Dane dotyczą płatności kartami.',
    ],
    nextSteps: [
      'Uruchom symulator What-If.',
    ],
    recommendations: [
      'Zwiększ budżet na pozyskiwanie leadów o 10%.',
    ],
  },
  diagnosis: {
    facts: [
      '32 porzucone transakcje o wartości 14,500 PLN.',
      'Błąd API ERP: 504 Timeout.',
    ],
    hypotheses: [
      'Brak buforowania Redis paraliżuje checkout.',
    ],
    interpretations: [
      'Serwer ERP nie nadążał z aktualizacją stanu magazynu.',
    ],
    limitations: [
      'Brak dostępu do logów serwera VPS.',
    ],
    nextSteps: [
      'Powiadom zespół DevOps.',
    ],
    recommendations: [
      'Włącz tymczasowy cache stanów magazynowych.',
    ],
  },
  decision: {
    facts: [
      'Rekomendacja zwiększenia CPC o 0.20 PLN na kluczowe frazy.',
    ],
    hypotheses: [
      'Zysk netto przewyższy wzrost kosztów reklamowych 3.4x.',
    ],
    interpretations: [
      'Przed = 450 konwersji | Po = 540 konwersji (+20%).',
    ],
    limitations: [
      'Symulacja zakłada stały koszt u konkurencji.',
    ],
    nextSteps: [
      'Zatwierdź akcję w DecisionQueue.',
    ],
    recommendations: [
      'Przekaż wniosek do zatwierdzenia przez Managera.',
    ],
  },
  report: {
    facts: [
      'Inicjalizacja Report Joba.',
    ],
    hypotheses: [
      'Czas generowania: 25 s.',
    ],
    interpretations: [
      'Zadanie w kolejce ze statusem QUEUED.',
    ],
    limitations: [
      'Raport wygaśnie po 14 dniach.',
    ],
    nextSteps: [
      'Sprawdź sekcję Biblioteka.',
    ],
    recommendations: [
      'Możesz kontynuować pracę w Studio Wykresów.',
    ],
  },
  plan: {
    facts: [
      'Plan optymalizacji wydatków w 3 krokach.',
    ],
    hypotheses: [
      'Krok 2: Uruchomienie remarketingu wykluczonego.',
    ],
    interpretations: [
      'Krok 1: Wstrzymanie kampanii o niskiej efektywności.',
    ],
    limitations: [
      'Wymaga capability manage_campaigns.',
    ],
    nextSteps: [
      'Wydeleguj zadania.',
    ],
    recommendations: [
      'Krok 3: Walidacja wyników po 7 dniach.',
    ],
  },
};

export type PapaLabContextBasketItem = {
  readonly freshness: string;
  readonly id: string;
  readonly name: string;
  readonly scope: string;
  readonly type: 'KPI' | 'Plik' | 'Procedura' | 'Raport' | 'Rekomendacja' | 'Tabela' | 'Wykres';
};

export const papaLabContextBasketSeed: readonly PapaLabContextBasketItem[] = [
  {
    freshness: 'Real-time (0m)',
    id: 'cb1',
    name: 'Współczynnik Konwersji (CR)',
    scope: 'Workspace Sales',
    type: 'KPI',
  },
  {
    freshness: '5m temu',
    id: 'cb2',
    name: 'Lejek Sprzedażowy Q3',
    scope: 'Ekran Analytics',
    type: 'Wykres',
  },
  {
    freshness: '1h temu',
    id: 'cb3',
    name: 'Zamówienia z błędami płatności',
    scope: 'Filtr: Failed',
    type: 'Tabela',
  },
  {
    freshness: 'Wersja v2.4',
    id: 'cb4',
    name: 'SOP-09: Procedura Reklamacji',
    scope: 'Dokumentacja',
    type: 'Procedura',
  },
  {
    freshness: 'Real-time',
    id: 'cb5',
    name: 'Bounce checkout mobile',
    scope: 'Dodany z widoku',
    type: 'Wykres',
  },
];

export const papaLabDecisionStates = [
  {
    id: 'proposed',
    description: 'AI przygotowało propozycję akcji.',
    tone: 'amber',
  },
  {
    id: 'needsReview',
    description: 'Wymagany przegląd człowieka.',
    tone: 'amber',
  },
  {
    id: 'approved',
    description: 'Użytkownik zatwierdził zmianę.',
    tone: 'emerald',
  },
  {
    id: 'rejected',
    description: 'Człowiek odrzucił propozycję akcji.',
    tone: 'rose',
  },
  {
    id: 'deferred',
    description: 'Decyzja odłożona, ale pozostaje w audycie.',
    tone: 'amber',
  },
  {
    id: 'expired',
    description: 'Wniosek utracił ważność przed zatwierdzeniem.',
    tone: 'slate',
  },
  {
    id: 'invalidated',
    description: 'Dane wejściowe zmieniły się i unieważniły propozycję.',
    tone: 'slate',
  },
  {
    id: 'executing',
    description: 'Wywoływanie operacji w API po zatwierdzeniu.',
    tone: 'indigo',
  },
  {
    id: 'succeeded',
    description: 'Operacja zakończona sukcesem.',
    tone: 'emerald',
  },
  {
    id: 'failed',
    description: 'Operacja wymaga odzyskania lub kompensacji.',
    tone: 'rose',
  },
  {
    id: 'partiallySucceeded',
    description: 'Część operacji została wykonana i wymaga dopięcia.',
    tone: 'blue',
  },
  {
    id: 'compensated',
    description: 'Operacja kompensacyjna została zapisana w audycie.',
    tone: 'blue',
  },
] as const satisfies readonly {
  readonly description: string;
  readonly id: string;
  readonly tone: PapaLabTone;
}[];

export type PapaLabDecisionStateId = typeof papaLabDecisionStates[number]['id'];

export const papaLabDecisionTransitions: Record<PapaLabDecisionStateId, readonly PapaLabDecisionStateId[]> = {
  approved: ['executing', 'invalidated'],
  compensated: ['proposed'],
  deferred: ['needsReview', 'expired'],
  executing: ['succeeded', 'partiallySucceeded', 'failed'],
  expired: ['proposed'],
  failed: ['compensated', 'proposed'],
  invalidated: ['proposed'],
  needsReview: ['approved', 'rejected', 'deferred'],
  partiallySucceeded: ['compensated', 'succeeded'],
  proposed: ['needsReview', 'rejected', 'deferred', 'expired'],
  rejected: ['proposed'],
  succeeded: ['proposed'],
};

export const papaLabRefusalReasons = [
  {
    code: 'insufficient_evidence',
    text: 'Papa Asystent nie może przygotować odpowiedzi z powodu niewystarczających dowodów.',
  },
  {
    code: 'insufficient_data',
    text: 'Brak wystarczającej próby danych statystycznych.',
  },
  {
    code: 'out_of_scope',
    text: 'Zapytanie wykracza poza zakres uprawnień.',
  },
  {
    code: 'missing_capability',
    text: 'Brak capability [execute_financial_changes].',
  },
  {
    code: 'prompt_injection_detected',
    text: 'Wykryto próbę manipulacji instrukcją systemową.',
  },
] as const;

export const papaLabConfidenceSegments = [
  {
    name: 'Wysoka Pewność',
    tone: 'emerald',
    value: 65,
  },
  {
    name: 'Ograniczona Pewność',
    tone: 'amber',
    value: 25,
  },
  {
    name: 'Niewystarczająca (Refusal)',
    tone: 'rose',
    value: 10,
  },
] as const satisfies readonly {
  readonly name: string;
  readonly tone: PapaLabTone;
  readonly value: number;
}[];

export const papaLabDataStatus = [
  { count: 42, status: 'ready' },
  { count: 14, status: 'partial' },
  { count: 8, status: 'stale' },
  { count: 5, status: 'restricted' },
  { count: 2, status: 'empty' },
  { count: 1, status: 'error' },
  { count: 3, status: 'no_access' },
] as const;

export const papaLabChartTypes = [
  {
    id: 'line',
    icon: 'trend',
    label: 'Liniowy (Trend)',
  },
  {
    id: 'bar',
    icon: 'data',
    label: 'Słupkowy',
  },
  {
    id: 'doughnut',
    icon: 'integration',
    label: 'Pierścieniowy',
  },
  {
    id: 'radar',
    icon: 'security',
    label: 'Radarowy',
  },
] as const satisfies readonly {
  readonly icon: PapaDataIconName;
  readonly id: string;
  readonly label: string;
}[];

export type PapaLabChartTypeId = typeof papaLabChartTypes[number]['id'];

export const papaLabBusinessDatasets = [
  {
    id: 'sales',
    label: 'Przychody ze Sprzedaży (PLN)',
    metric: 'Sales (PLN)',
    values: [45, 52, 58, 64, 61, 75],
  },
  {
    id: 'conversion',
    label: 'Współczynnik Konwersji (%)',
    metric: 'Conversion %',
    values: [2.1, 2.4, 2.8, 3.1, 2.9, 3.5],
  },
  {
    id: 'cac',
    label: 'Koszt Pozyskania Klienta (CAC PLN)',
    metric: 'CAC PLN',
    values: [140, 135, 128, 122, 115, 108],
  },
  {
    id: 'mrr',
    label: 'Miesięczny Przychód Powtarzalny (MRR)',
    metric: 'MRR',
    values: [24000, 26500, 29000, 31500, 34000, 38500],
  },
] as const;

export type PapaLabBusinessDatasetId = typeof papaLabBusinessDatasets[number]['id'];

export const papaLabChartLabels = [
  'Tydz 1',
  'Tydz 2',
  'Tydz 3',
  'Tydz 4',
  'Tydz 5',
  'Tydz 6',
] as const;

export const papaLabTimeframes = [
  { id: '7d', label: 'Ostatnie 7 dni' },
  { id: '30d', label: 'Ostatnie 30 dni' },
  { id: '90d', label: 'Ostatnie 90 dni' },
] as const;

export const papaLabAggregations = [
  { id: 'sum', label: 'Suma' },
  { id: 'avg', label: 'Średnia' },
  { id: 'max', label: 'Maksimum' },
] as const;

export const papaLabPalettes = [
  {
    id: 'indigo',
    label: 'Indigo',
    swatchClassName: 'pd-pal-swatch--indigo',
    tone: 'indigo',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    swatchClassName: 'pd-pal-swatch--emerald',
    tone: 'emerald',
  },
  {
    id: 'amber',
    label: 'Amber',
    swatchClassName: 'pd-pal-swatch--amber',
    tone: 'amber',
  },
  {
    id: 'teal',
    label: 'Cyber Teal',
    swatchClassName: 'pd-pal-swatch--teal',
    tone: 'teal',
  },
] as const satisfies readonly {
  readonly id: string;
  readonly label: string;
  readonly swatchClassName: string;
  readonly tone: PapaLabTone;
}[];

export type PapaLabPaletteId = typeof papaLabPalettes[number]['id'];

export type PapaLabSavedChart = {
  readonly id: string;
  readonly metric: string;
  readonly title: string;
  readonly type: PapaLabChartTypeId;
};

export const papaLabSavedCharts: readonly PapaLabSavedChart[] = [
  {
    id: 'sc1',
    metric: 'Sales (PLN)',
    title: 'Trend Przychodów ze Sprzedaży',
    type: 'line',
  },
  {
    id: 'sc2',
    metric: 'Conversion %',
    title: 'Struktura Konwersji według Kanałów',
    type: 'doughnut',
  },
];

export const papaLabCausalBasePoints = [
  { month: 'Miesiąc 1', base: 100 },
  { month: 'Miesiąc 2', base: 105 },
  { month: 'Miesiąc 3', base: 110 },
  { month: 'Miesiąc 4', base: 108 },
  { month: 'Miesiąc 5', base: 115 },
  { month: 'Miesiąc 6', base: 120 },
] as const;

export const papaLabCompliancePillars = [
  {
    axis: 'Bias Check',
    score: 95,
  },
  {
    axis: 'Evidence Trace',
    score: 90,
  },
  {
    axis: 'Pewność Stat.',
    score: 92,
  },
  {
    axis: 'Bezpieczeństwo',
    score: 98,
  },
  {
    axis: 'Human Supervision',
    score: 96,
  },
] as const;

export const papaLabArtifactRows = [
  {
    action: 'Pobierz PDF',
    name: 'Raport Konwersji Q3 (PDF)',
    status: 'ready',
    type: 'Raport',
    version: 'v1.2',
  },
  {
    action: 'Edytuj w Studio',
    name: 'Szablon Studio: Analiza Churn i CAC',
    status: 'ready',
    type: 'Studio Chart',
    version: 'v2.0',
  },
] as const;

export const papaAssistantLabScreenFixture: PapaAssistantLabScreenData = {
  analyses: papaLabWorkbenchAnalyses.map((analysis, index) => ({
    id: analysis.id,
    meta: analysis.meta,
    name: analysis.name,
    status: index === 0 ? 'completed' : index === 1 ? 'running' : 'draft',
  })),
  artifacts: papaLabArtifactRows.map((artifact, index) => ({
    actionLabel: artifact.action,
    id: `artifact-${index + 1}`,
    name: artifact.name,
    status: artifact.status,
    type: artifact.type,
    version: artifact.version,
  })),
  chart: {
    description: 'Porównanie scenariusza prawdopodobnego z wariantami granicznymi.',
    points: papaLabCausalBasePoints.map((point, index) => ({
      label: point.month,
      optimistic: Math.round(point.base * (1.18 + index * 0.004)),
      pessimistic: Math.round(point.base * (0.88 - index * 0.003)),
      probable: Math.round(point.base * (1.08 + index * 0.002)),
    })),
    status: 'ready',
    statusLabel: 'Dane kompletne',
    title: 'Trajektoria konwersji checkout',
  },
  confidenceLabel: 'Wysoka',
  contextItems: papaLabContextBasketSeed.map((item) => ({
    detail: `${item.scope} · ${item.freshness}`,
    id: item.id,
    label: item.name,
    type: item.type,
  })),
  decision: {
    audit: [
      '10:42 · Papa utworzył propozycję.',
      '10:43 · Propozycja została skierowana do przeglądu.',
    ],
    id: 'DQ-2026-8891',
    label: 'Alokacja budżetu Google Ads (+15%)',
    owner: 'Growth Team',
    status: 'Do przeglądu',
  },
  evidence: [
    {
      detail: 'Filtr: payment_status=failed',
      id: 'evidence-orders',
      label: 'Zdarzenia checkout',
      source: 'orders.checkout_events',
    },
    {
      detail: 'Zakres: ostatnie 7 dni',
      id: 'evidence-payments',
      label: 'Logi operatora płatności',
      source: 'payments.gateway_logs',
    },
    {
      detail: 'Retry policy aktywne',
      id: 'evidence-erp',
      label: 'Aktualizacje stanów magazynowych',
      source: 'erp.stock_updates',
    },
    {
      detail: 'Dokumentacja v2.4',
      id: 'evidence-sop',
      label: 'Procedura reklamacji',
      source: 'SOP-09',
    },
  ],
  id: 'checkout-conversion',
  initialStage: 'diagnosis',
  initialView: 'result',
  loading: false,
  project: {
    datasets: 'sales',
    datasetOptions: [
      { label: 'orders, sessions, payments, erp_stock', value: 'sales' },
      { label: 'google_ads, meta_ads, attribution', value: 'ads' },
      { label: 'returns, complaints, procedures', value: 'support' },
    ],
    filters: 'device=mobile, payment_status=failed',
    goal: 'Wyjaśnić spadek CR w checkout mobile',
    instruction: 'Zdiagnozuj spadek konwersji checkout i przygotuj rekomendację możliwą do zatwierdzenia przez człowieka.',
    kpi: 'conversion',
    kpiOptions: [
      { label: 'CR, checkout drop-off, płatności nieudane', value: 'conversion' },
      { label: 'AOV, marża, CAC', value: 'margin' },
      { label: 'Zwroty, reklamacje, SLA', value: 'returns' },
    ],
    limit: 42,
    period: '7d',
    periodOptions: [
      { label: 'Ostatnie 7 dni', value: '7d' },
      { label: 'Ostatnie 30 dni', value: '30d' },
      { label: 'Ostatnie 90 dni', value: '90d' },
    ],
  },
  quality: {
    completeness: '92%',
    freshness: '0–5 min',
    issues: [
      'Brak pełnych logów VPS dla ścieżki błędu ERP.',
      '8% sesji jest częściowo blokowanych przez mechanizmy prywatności.',
    ],
    readiness: 'Gotowe do rekomendacji',
    score: '92%',
  },
  response: {
    diagnosis: {
      facts: ['Spadek dotyczy przede wszystkim checkoutu mobilnego.', 'Wzrost błędów płatności koreluje ze spadkiem konwersji.'],
      hypotheses: ['Timeout ERP wydłuża potwierdzenie dostępności.', 'Brak ponowienia płatności zwiększa porzucenia.'],
      interpretation: ['Problem ma charakter operacyjny i UX, nie popytowy.', 'Największy wpływ mają płatności i synchronizacja stanów.'],
      nextSteps: ['Włączyć cache dostępności produktu.', 'Dodać bezpieczne ponowienie płatności.', 'Monitorować konwersję przez 7 dni.'],
      recommendation: 'Najpierw ogranicz timeouty ERP i dodaj bezpieczne ponowienie płatności.',
    },
    decision: {
      facts: ['Dostępne są trzy warianty o różnym koszcie i ryzyku.'],
      hypotheses: ['Połączenie cache i retry przyniesie największy efekt.'],
      interpretation: ['Wariant prawdopodobny równoważy wpływ i ryzyko.'],
      nextSteps: ['Skierować wariant prawdopodobny do akceptacji.', 'Przypisać właściciela technicznego.'],
      recommendation: 'Wybierz wariant prawdopodobny: cache stanów i ponowienie płatności.',
    },
    report: {
      facts: ['Wynik opiera się na czterech jawnych źródłach.'],
      hypotheses: ['Raport tygodniowy ułatwi ocenę trwałości poprawy.'],
      interpretation: ['Najważniejszy jest trend CR wraz z błędami płatności.'],
      nextSteps: ['Zapisać definicję raportu.', 'Udostępnić raport właścicielom procesu.'],
      recommendation: 'Zapisz raport z trendem CR, błędami płatności i stanem ERP.',
    },
    plan: {
      facts: ['Plan zawiera trzy kroki i wymaga kontroli po wdrożeniu.'],
      hypotheses: ['Efekt powinien być widoczny w ciągu siedmiu dni.'],
      interpretation: ['Kolejność prac ogranicza ryzyko i ułatwia walidację.'],
      nextSteps: ['Wdrożyć cache.', 'Uruchomić retry płatności.', 'Zweryfikować wynik po 7 dniach.'],
      recommendation: 'Krok 3: zweryfikuj wynik po siedmiu dniach i zamknij decyzję.',
    },
  },
  runState: 'completed',
  sources: ['orders', 'sessions', 'payments', 'erp_stock'],
  stages: papaAssistantLabStages,
  timeframeLabel: 'Ostatnie 7 dni',
  title: 'Dlaczego konwersja checkout mobile spadła?',
  updatedAtLabel: 'Dzisiaj, 10:42',
};

export type PapaLabTone =
  | 'amber'
  | 'blue'
  | 'emerald'
  | 'indigo'
  | 'rose'
  | 'slate'
  | 'teal';
