import type {
  PapaDataIconName,
} from '../../../design-system';

export type HelpCenterTone =
  | 'amber'
  | 'blue'
  | 'brand'
  | 'emerald'
  | 'red'
  | 'slate'
  | 'violet';

export type HelpCenterTabId =
  | 'context'
  | 'domain'
  | 'kb'
  | 'truth';

export const helpCenterTabs = [
  {
    badge: null,
    icon: 'help',
    id: 'kb',
    label: 'Baza Wiedzy & Procedury',
  },
  {
    badge: 'Runtime Check',
    icon: 'security',
    id: 'truth',
    label: 'Product Truth Engine',
  },
  {
    badge: null,
    icon: 'data',
    id: 'context',
    label: 'Context Pack & Eskalacja',
  },
  {
    badge: null,
    icon: 'trend',
    id: 'domain',
    label: 'Podział Domenowy & Roadmapa',
  },
] as const satisfies readonly {
  readonly badge: string | null;
  readonly icon: PapaDataIconName;
  readonly id: HelpCenterTabId;
  readonly label: string;
}[];

export type HelpCategoryId =
  | 'ACCOUNT'
  | 'AI'
  | 'ALL'
  | 'FIX'
  | 'REPORTS'
  | 'SETUP'
  | 'UNDERSTAND';

export const helpCategories = [
  { id: 'ALL', label: 'Wszystkie' },
  { id: 'FIX', label: 'Napraw problem' },
  { id: 'SETUP', label: 'Skonfiguruj' },
  { id: 'UNDERSTAND', label: 'Zrozum dane' },
  { id: 'REPORTS', label: 'Raporty i eksport' },
  { id: 'ACCOUNT', label: 'Konto, plan i płatności' },
  { id: 'AI', label: 'Papa Asystent AI' },
] as const satisfies readonly {
  readonly id: HelpCategoryId;
  readonly label: string;
}[];

export type HelpRole =
  | 'ADMIN'
  | 'ANALYST'
  | 'INTEGRATION_MANAGER'
  | 'VIEWER';

export const helpRoleOptions = [
  { label: 'Wszystkie role', value: 'ALL' },
  { label: 'Administrator (Moja rola)', value: 'ADMIN' },
  { label: 'Menedżer Integracji', value: 'INTEGRATION_MANAGER' },
  { label: 'Analityk / Marketer', value: 'ANALYST' },
  { label: 'Przeglądający (Viewer)', value: 'VIEWER' },
] as const satisfies readonly {
  readonly label: string;
  readonly value: HelpRole | 'ALL';
}[];

export type HelpProvider =
  | 'google_analytics_4'
  | 'meta_ads'
  | 'shopify';

export type HelpProviderStatus =
  | 'disabled'
  | 'production_ready';

export type HelpCapability =
  | 'analytics.view'
  | 'billing.configure_ai_limits'
  | 'integrations.connect'
  | 'users.manage';

export type HelpRuntimeState = {
  readonly activeRole: HelpRole;
  readonly capabilities: Record<HelpCapability, boolean>;
  readonly providersReadiness: Record<HelpProvider, HelpProviderStatus>;
};

export const defaultHelpRuntimeState: HelpRuntimeState = {
  activeRole: 'ADMIN',
  capabilities: {
    'analytics.view': true,
    'billing.configure_ai_limits': false,
    'integrations.connect': true,
    'users.manage': true,
  },
  providersReadiness: {
    google_analytics_4: 'production_ready',
    meta_ads: 'production_ready',
    shopify: 'disabled',
  },
};

export type HelpProcedureStep = {
  readonly actionBtnText?: string;
  readonly description: string;
  readonly expectedResult: string;
  readonly hasBranching?: boolean;
  readonly title: string;
};

export type HelpArticle = {
  readonly actionLabel: string;
  readonly actionSectionId: string;
  readonly category: Exclude<HelpCategoryId, 'ALL'>;
  readonly categoryLabel: string;
  readonly difficulty: string;
  readonly errorCode: string | null;
  readonly estimatedTime: string;
  readonly excerpt: string;
  readonly id: string;
  readonly keywords: readonly string[];
  readonly lastVerified: string;
  readonly ownerTeam: string;
  readonly popular: boolean;
  readonly requiredCapabilities: readonly HelpCapability[];
  readonly requiredProvider: HelpProvider | null;
  readonly requiredRole: HelpRole;
  readonly requiredRoleLabel: string;
  readonly steps: readonly HelpProcedureStep[];
  readonly title: string;
};

export const helpArticles = [
  {
    id: 'help-int-meta-reauth',
    title: 'Napraw brak danych i reautoryzuj Meta Ads',
    category: 'FIX',
    categoryLabel: 'Napraw problem',
    excerpt: 'Procedura krok po kroku w przypadku wygaśnięcia tokena autoryzacyjnego Meta Ads (Błąd PD-INT-401).',
    estimatedTime: '3-5 min',
    difficulty: 'Łatwy',
    requiredRole: 'ADMIN',
    requiredRoleLabel: 'Administrator',
    ownerTeam: 'Integrations Team',
    lastVerified: '2026-08-24',
    errorCode: 'PD-INT-401',
    requiredCapabilities: ['integrations.connect'],
    requiredProvider: 'meta_ads',
    actionLabel: 'Otwórz Integracje',
    actionSectionId: 'integrations',
    keywords: ['meta', 'facebook', 'brak danych', 'pd-int-401', 'token', 'reautoryzacja', 'synchro'],
    popular: true,
    steps: [
      {
        title: 'Weryfikacja statusu w panelu Integracji',
        description: 'Przejdź do zakładki Integracje i znajdź kafel Meta Ads. Sprawdź czy widzisz czerwony status "Wymaga uwagi" lub kod błędu PD-INT-401.',
        expectedResult: 'Widoczny status "Wymaga uwagi" oraz data ostatniej synchronizacji starsza niż 12h.',
        actionBtnText: 'Otwórz panel Integracje',
      },
      {
        title: 'Uruchomienie procedury Ponownego Połączenia',
        description: 'Kliknij "Ponownie połącz" przy kafelku Meta Ads. Zostaniesz przekierowany do bezpiecznego okna logowania Facebook Business Manager.',
        expectedResult: 'Otworzy się wyskakujące okno autoryzacyjne Meta z prośbą o potwierdzenie uprawnień.',
        hasBranching: true,
      },
      {
        title: 'Zatwierdzenie zakresem uprawnień i test sync',
        description: 'Upewnij się, że zaznaczono wszystkie konta reklamowe. Po powrocie do PapaData kliknij "Testuj połączenie".',
        expectedResult: 'Status zmieni się na zielony "Połączono", a system rozpocznie natychmiastowy backfill danych.',
      },
    ],
  },
  {
    id: 'help-int-ga4-fix',
    title: 'Napraw brak danych z Google Analytics 4',
    category: 'FIX',
    categoryLabel: 'Napraw problem',
    excerpt: 'Co zrobić gdy wykresy GA4 pokazują 0 lub brak danych po ostatniej aktualizacji zakresu dat.',
    estimatedTime: '4-6 min',
    difficulty: 'Średni',
    requiredRole: 'INTEGRATION_MANAGER',
    requiredRoleLabel: 'Menedżer Integracji',
    ownerTeam: 'Integrations Team',
    lastVerified: '2026-08-22',
    errorCode: 'PD-SYNC-429',
    requiredCapabilities: ['integrations.connect'],
    requiredProvider: 'google_analytics_4',
    actionLabel: 'Sprawdź GA4',
    actionSectionId: 'integrations',
    keywords: ['ga4', 'google analytics', 'brak danych', 'zero', 'puste wykresy'],
    popular: true,
    steps: [
      {
        title: 'Sprawdzenie identyfikatora usługi (Property ID)',
        description: 'Upewnij się, że w ustawieniach integracji podano poprawny strumień danych GA4.',
        expectedResult: 'Identyfikator odpowiada aktywnej usłudze GA4 w Google Cloud Console.',
      },
      {
        title: 'Weryfikacja strefy czasowej i opóźnień API',
        description: 'Google Analytics 4 posiada naturalne opóźnienie przetwarzania danych sięgające od 24 do 48 godzin dla najnowszych zdarzeń.',
        expectedResult: 'Dane z dnia dzisiejszego mogą być niepełne z powodu mechanizmu przetwarzania Google.',
      },
    ],
  },
  {
    id: 'help-int-shopify-setup',
    title: 'Podłącz i skonfiguruj sklep Shopify',
    category: 'SETUP',
    categoryLabel: 'Skonfiguruj',
    excerpt: 'Instrukcja integracji zamówień i danych produktowych bezpośrednio z Shopify App Store.',
    estimatedTime: '5-8 min',
    difficulty: 'Łatwy',
    requiredRole: 'ADMIN',
    requiredRoleLabel: 'Administrator',
    ownerTeam: 'E-commerce Team',
    lastVerified: '2026-08-20',
    errorCode: 'PD-INT-301',
    requiredCapabilities: ['integrations.connect'],
    requiredProvider: 'shopify',
    actionLabel: 'Połącz Shopify',
    actionSectionId: 'integrations',
    keywords: ['shopify', 'sklep', 'e-commerce', 'zamówienia'],
    popular: false,
    steps: [
      {
        title: 'Instalacja aplikacji PapaData w Shopify Store',
        description: 'Przejdź do Shopify App Store i zatwierdź instalację integracji.',
        expectedResult: 'Aplikacja uzyska dostęp do odczytu zamówień.',
      },
    ],
  },
  {
    id: 'help-ai-limits-configure',
    title: 'Ustaw limity i alerty zużycia Papa Asystenta AI',
    category: 'ACCOUNT',
    categoryLabel: 'Konto, plan i płatności',
    excerpt: 'Jak zarządzać budżetem zapytań AI dla zespołu oraz ustalać comiesięczne progi alarmowe.',
    estimatedTime: '2-3 min',
    difficulty: 'Łatwy',
    requiredRole: 'ADMIN',
    requiredRoleLabel: 'Administrator',
    ownerTeam: 'Billing Team',
    lastVerified: '2026-08-25',
    errorCode: 'PD-BILL-003',
    requiredCapabilities: ['billing.configure_ai_limits'],
    requiredProvider: null,
    actionLabel: 'Ustaw Limity AI',
    actionSectionId: 'billing',
    keywords: ['ai', 'limit', 'asystent', 'budżet', 'tokeny', 'płatności'],
    popular: false,
    steps: [
      {
        title: 'Przejście do zakładki Billing & Subskrypcja',
        description: 'Otwórz sekcję Płatności i przejdź do zakładki AI Resource Allocation.',
        expectedResult: 'Widoczny suwak konfiguracji limitu tokenów.',
      },
    ],
  },
  {
    id: 'help-analytics-roas-drop',
    title: 'Jak diagnozować nagły spadek ROAS w kampaniach',
    category: 'UNDERSTAND',
    categoryLabel: 'Zrozum dane',
    excerpt: 'Metodologia sprawdzania czy spadek ROAS wynika z atribucji, wzrostu CPM czy wygaszenia kreacji.',
    estimatedTime: '6-8 min',
    difficulty: 'Zaawansowany',
    requiredRole: 'ANALYST',
    requiredRoleLabel: 'Analityk / Marketer',
    ownerTeam: 'Analytics Team',
    lastVerified: '2026-08-26',
    errorCode: null,
    requiredCapabilities: ['analytics.view'],
    requiredProvider: null,
    actionLabel: 'Przejdź do Kampanii',
    actionSectionId: 'campaigns',
    keywords: ['roas', 'spadek', 'atrybucja', 'kampanie', 'cpm', 'ads'],
    popular: true,
    steps: [
      {
        title: 'Porównanie okna atrybucji',
        description: 'Sprawdź czy okno atrybucji w Meta Ads (7-day click) różni się od modelu atrybucji PapaData (First Touch / Last Touch).',
        expectedResult: 'Zrozumienie różnic w przypisywaniu konwersji między kanałami.',
      },
    ],
  },
  {
    id: 'help-account-add-user',
    title: 'Dodawanie użytkownika i zarządzanie rolami (RBAC)',
    category: 'ACCOUNT',
    categoryLabel: 'Konto, plan i płatności',
    excerpt: 'Jak zaprosić członka zespołu oraz przypisać mu odpowiednią rolę (Admin, Analyst, Viewer).',
    estimatedTime: '2-3 min',
    difficulty: 'Łatwy',
    requiredRole: 'ADMIN',
    requiredRoleLabel: 'Administrator',
    ownerTeam: 'Core Security',
    lastVerified: '2026-08-15',
    errorCode: null,
    requiredCapabilities: ['users.manage'],
    requiredProvider: null,
    actionLabel: 'Zarządzaj Użytkownikami',
    actionSectionId: 'settings_users',
    keywords: ['użytkownik', 'rola', 'rbac', 'zaproszenie', 'admin', 'viewer'],
    popular: true,
    steps: [
      {
        title: 'Wysyłanie zaproszenia e-mail',
        description: 'Wpisz adres e-mail nowego współpracownika i wybierz rolę z rozwijanej listy.',
        expectedResult: 'Użytkownik otrzyma wiadomość e-mail z aktywacyjnym linkiem zabezpieczonym tokenem.',
      },
    ],
  },
] as const satisfies readonly HelpArticle[];

export const quickSearchPhrases = [
  'brak danych GA4',
  'reautoryzacja Meta',
  'dodanie użytkownika',
  'spadek ROAS',
] as const;

export const helpContextPack = {
  sectionId: 'integrations',
  subsectionId: 'meta_ads',
  userRole: 'ADMIN',
  subscriptionPlan: 'Professional',
  errorCode: 'PD-INT-401',
  dataFreshness: '18h delay',
} as const;

export const helpIncludedMetadata = [
  'Identyfikator modułu: integrations/meta_ads',
  'Kod błędu runtime: PD-INT-401 (Auth Expired)',
  'Wykonane kroki procedury: HELP-INT-004 (Kroki 1-2 wykonane)',
  'Timestamp Ostatniej Synchronizacji: 2026-08-27 18:40 CEST',
  'Rola użytkownika i wersja aplikacji',
] as const;

export const helpExcludedMetadata = [
  'Baza klientów, maile, dane osobowe z CRM',
  'Klucze API, tokeny dostępu, hasła',
  'Wartości finansowe przychodów / marż biznesowych',
] as const;

export const helpDomainCards = [
  {
    body: 'Self-service, instrukcje krok-po-kroku, diagnostyka błędów, słownik metryk, Guided Mode.',
    label: '01',
    route: '/help-center',
    title: 'Centrum Pomocy',
    tone: 'brand',
  },
  {
    body: 'Nierozwiązane awarie, kody błędów API, barierki integracyjne wymagające inżyniera.',
    label: '02',
    route: '/support-center',
    title: 'Wsparcie Techniczne',
    tone: 'blue',
  },
  {
    body: 'Konsultacje strategiczne, interpretacja ROAS/AOV, alokacja budżetów reklamowych.',
    label: '03',
    route: '/marketing-support',
    title: 'Wsparcie w Marketingu',
    tone: 'violet',
  },
] as const satisfies readonly {
  readonly body: string;
  readonly label: string;
  readonly route: string;
  readonly title: string;
  readonly tone: HelpCenterTone;
}[];

export const resolutionSegments = [
  {
    label: 'Rozwiązane przez Self-Service',
    tone: 'brand',
    value: 62,
  },
  {
    label: 'Guided Mode Completions',
    tone: 'blue',
    value: 26,
  },
  {
    label: 'Eskalacje Techniczne',
    tone: 'amber',
    value: 12,
  },
] as const satisfies readonly {
  readonly label: string;
  readonly tone: HelpCenterTone;
  readonly value: number;
}[];

export const searchGapCandidates = [
  { label: 'zmiana waluty', value: 42 },
  { label: 'custom webhook', value: 38 },
  { label: 'export PDF', value: 29 },
  { label: 'nowy wydatek', value: 21 },
  { label: 'mfa reset', value: 15 },
] as const;

export const helpRoadmapPhases = [
  {
    items: [
      { done: true, text: 'Rozdzielenie domen: Help, Support i Consulting' },
      { done: true, text: 'Naprawa rozbieżności Shopify (disabled) i AI Limits' },
      { done: true, text: 'Powiązanie artykułów z Capabilities Runtime' },
      { done: true, text: 'Nadanie praw `help.read` dla wszystkich ról' },
    ],
    label: 'FAZA P0 (Krytyczne / Natychmiastowe)',
    status: 'Status: W trakcie realizacji',
    tone: 'red',
  },
  {
    items: [
      { done: false, text: 'Interaktywny Guided Mode z krokami oczekiwanymi' },
      { done: false, text: 'Routing po stałych kodach błędów (np. PD-INT-401)' },
      { done: false, text: 'Przejście na schemat Docs-as-Code (MDX)' },
      { done: false, text: 'Pre-fill formularza eskalacji technicznej' },
    ],
    label: 'FAZA P1 (Nowy UX & Guided Mode)',
    status: 'Sprint +1',
    tone: 'amber',
  },
  {
    items: [
      { done: false, text: 'Wyszukiwanie hybrydowe z embeddingami' },
      { done: false, text: 'Telemetria fraz bez wyników (Search Gap)' },
      { done: false, text: 'Detekcja nieaktualnych treści (`stale content`)' },
      { done: false, text: 'Automatyczne ostrzeżenia przy znanych awariach' },
    ],
    label: 'FAZA P2 (AI Copilot & Semantyka)',
    status: 'Sprint +2',
    tone: 'slate',
  },
] as const;

export const serviceStatusItems = [
  {
    detail: null,
    label: 'Google Analytics 4 API',
    status: 'Działa prawidłowo',
    tone: 'emerald',
  },
  {
    detail: 'Wykryto opóźnienia po stronie API Meta',
    label: 'Meta Ads Insights Backfill',
    status: 'Opóźnienia',
    tone: 'amber',
  },
  {
    detail: null,
    label: 'PapaData Engine & Billing API',
    status: 'Działa prawidłowo',
    tone: 'emerald',
  },
] as const satisfies readonly {
  readonly detail: string | null;
  readonly label: string;
  readonly status: string;
  readonly tone: HelpCenterTone;
}[];
