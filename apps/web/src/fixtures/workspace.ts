export type WorkspaceSurface =
  | 'selection'
  | 'creation'
  | 'company'
  | 'business'
  | 'dataSource'
  | 'status'
  | 'preparation'
  | 'blocked';

export type WorkspaceSurfaceIcon =
  | 'building'
  | 'databaseZap'
  | 'fileCheck'
  | 'gauge'
  | 'lock'
  | 'refresh'
  | 'store'
  | 'waypoints';

export type WorkspaceSurfaceDefinition = {
  accent: string;
  action: string;
  cards: readonly {
    description: string;
    label: string;
    status: 'ready' | 'waiting' | 'blocked';
    title: string;
  }[];
  icon: WorkspaceSurfaceIcon;
  kicker: string;
  sideTitle: string;
  summary: string;
  title: string;
};

export const workspaceSurfaces: Record<
  WorkspaceSurface,
  WorkspaceSurfaceDefinition
> = {
  selection: {
    accent: 'oklch(68% 0.13 188)',
    action: 'Wybierz workspace',
    icon: 'waypoints',
    kicker: 'Wybór workspace',
    sideTitle: 'Kontekst decyzji',
    summary:
      'Użytkownik wybiera tylko workspace, do którego ma aktualne uprawnienie wejścia.',
    title: 'Wybierz aktywny workspace',
    cards: [
      {
        description: 'Pełna gotowość danych sprzedażowych.',
        label: 'ready',
        status: 'ready',
        title: 'Northstar Commerce',
      },
      {
        description: 'Czeka na administratora integracji.',
        label: 'waiting',
        status: 'waiting',
        title: 'Retail Lab EU',
      },
    ],
  },
  creation: {
    accent: 'oklch(62% 0.17 252)',
    action: 'Utwórz workspace',
    icon: 'store',
    kicker: 'Utworzenie workspace',
    sideTitle: 'Zakres formularza',
    summary:
      'Powierzchnia zbiera tylko minimalne dane potrzebne do utworzenia workspace.',
    title: 'Utwórz roboczy workspace',
    cards: [
      {
        description: 'Nazwa unikalna w organizacji prawnej.',
        label: 'ready',
        status: 'ready',
        title: 'Nazwa workspace',
      },
      {
        description: 'Limit planu może dać stan gated zamiast płatności.',
        label: 'waiting',
        status: 'waiting',
        title: 'Eligibility planu',
      },
    ],
  },
  company: {
    accent: 'oklch(70% 0.13 74)',
    action: 'Potwierdź dane firmy',
    icon: 'building',
    kicker: 'Dane firmy',
    sideTitle: 'Dane prawne',
    summary:
      'Ekran rozdziela dane prawne od profilu działalności i nie ujawnia duplikatów.',
    title: 'Potwierdź dane organizacji',
    cards: [
      {
        description: 'Kraj, nazwa prawna i identyfikator rejestrowy.',
        label: 'ready',
        status: 'ready',
        title: 'Identyfikacja',
      },
      {
        description: 'Źródło danych rejestrowych wymaga potwierdzenia.',
        label: 'waiting',
        status: 'waiting',
        title: 'Weryfikacja',
      },
    ],
  },
  business: {
    accent: 'oklch(65% 0.16 295)',
    action: 'Zapisz profil',
    icon: 'fileCheck',
    kicker: 'Profil działalności',
    sideTitle: 'Kontekst analityczny',
    summary:
      'Profil ustawia branżę, model biznesowy, rynek, walutę i strefę czasu.',
    title: 'Opisz działalność workspace',
    cards: [
      {
        description: 'Waluta i strefa czasu wpływają na KPI.',
        label: 'ready',
        status: 'ready',
        title: 'Raportowanie',
      },
      {
        description: 'Pola opcjonalne nie blokują dashboardu.',
        label: 'ready',
        status: 'ready',
        title: 'Dodatkowy kontekst',
      },
    ],
  },
  dataSource: {
    accent: 'oklch(68% 0.13 188)',
    action: 'Połącz źródło',
    icon: 'databaseZap',
    kicker: 'Połączenie źródła danych',
    sideTitle: 'Minimalny dataset',
    summary:
      'Provider, OAuth, test połączenia i walidacja danych należą do jednej powierzchni.',
    title: 'Połącz źródło sprzedaży',
    cards: [
      {
        description: 'OAuth preferowany; sekrety pozostają write-only.',
        label: 'ready',
        status: 'ready',
        title: 'Shopify',
      },
      {
        description: 'Pominięcie daje tylko ograniczoną powłokę.',
        label: 'waiting',
        status: 'waiting',
        title: 'Odroczenie',
      },
    ],
  },
  status: {
    accent: 'oklch(72% 0.14 76)',
    action: 'Oceń ponownie',
    icon: 'gauge',
    kicker: 'Stan konfiguracji workspace',
    sideTitle: 'Wymagania',
    summary:
      'Ekran pokazuje aktualne wymagania ocenione przez runtime, właściciela akcji i wpływ.',
    title: 'Sprawdź, co blokuje pełną gotowość',
    cards: [
      {
        description: 'Profil działalności ukończony przez administratora.',
        label: 'ready',
        status: 'ready',
        title: 'Profil działalności',
      },
      {
        description: 'Integracja czeka na osobę z capability.',
        label: 'waiting',
        status: 'waiting',
        title: 'Źródło danych',
      },
    ],
  },
  preparation: {
    accent: 'oklch(62% 0.17 252)',
    action: 'Przejdź do dashboardu',
    icon: 'refresh',
    kicker: 'Przygotowanie dashboardu',
    sideTitle: 'Proces bez fikcyjnego postępu',
    summary:
      'Powierzchnia pojawia się tylko przy realnej walidacji, imporcie albo synchronizacji.',
    title: 'Przygotowujemy pierwsze użyteczne dane',
    cards: [
      {
        description: 'Mapowanie zamówień i waluty.',
        label: 'ready',
        status: 'ready',
        title: 'Walidacja datasetu',
      },
      {
        description: 'Synchronizacja może przejść w delayed.',
        label: 'waiting',
        status: 'waiting',
        title: 'Import danych',
      },
    ],
  },
  blocked: {
    accent: 'oklch(63% 0.16 32)',
    action: 'Skontaktuj się ze wsparciem',
    icon: 'lock',
    kicker: 'Dostęp zablokowany',
    sideTitle: 'Bezpieczna blokada',
    summary:
      'Widok nie ujawnia wrażliwej przyczyny blokady konta, membershipu ani workspace.',
    title: 'Ten workspace wymaga wyjaśnienia',
    cards: [
      {
        description: 'Brak bezpiecznej ścieżki self-service.',
        label: 'blocked',
        status: 'blocked',
        title: 'Membership',
      },
      {
        description: 'Dostępna jest kontrolowana eskalacja.',
        label: 'waiting',
        status: 'waiting',
        title: 'Support',
      },
    ],
  },
};
