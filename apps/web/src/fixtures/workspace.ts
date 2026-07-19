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
    status: 'ready' | 'pending' | 'blocked';
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
    accent: 'var(--pds-accent)',
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
        label: 'gotowy',
        status: 'ready',
        title: 'Northstar Commerce',
      },
      {
        description: 'Czeka na administratora integracji.',
        label: 'oczekuje',
        status: 'pending',
        title: 'Retail Lab EU',
      },
    ],
  },
  creation: {
    accent: 'var(--pds-accent)',
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
        label: 'gotowy',
        status: 'ready',
        title: 'Nazwa workspace',
      },
      {
        description: 'Limit planu może wymagać kontaktu z administratorem.',
        label: 'oczekuje',
        status: 'pending',
        title: 'Eligibility planu',
      },
    ],
  },
  company: {
    accent: 'var(--pds-accent)',
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
        label: 'gotowy',
        status: 'ready',
        title: 'Identyfikacja',
      },
      {
        description: 'Źródło danych rejestrowych wymaga potwierdzenia.',
        label: 'oczekuje',
        status: 'pending',
        title: 'Weryfikacja',
      },
    ],
  },
  business: {
    accent: 'var(--pds-accent)',
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
        label: 'gotowy',
        status: 'ready',
        title: 'Raportowanie',
      },
      {
        description: 'Pola opcjonalne nie blokują dashboardu.',
        label: 'gotowy',
        status: 'ready',
        title: 'Dodatkowy kontekst',
      },
    ],
  },
  dataSource: {
    accent: 'var(--pds-accent)',
    action: 'Połącz źródło',
    icon: 'databaseZap',
    kicker: 'Połączenie źródła danych',
    sideTitle: 'Minimalny dataset',
    summary:
      'Wybierz dostawcę z katalogu MVP i połącz dane potrzebne do pierwszych KPI.',
    title: 'Połącz źródło sprzedaży',
    cards: [
      {
        description: 'Połączymy zamówienia, produkty, klientów i stany produktów.',
        label: 'gotowy',
        status: 'ready',
        title: 'Shopify',
      },
      {
        description: 'Możesz wrócić później, ale dashboard pokaże ograniczony zakres.',
        label: 'oczekuje',
        status: 'pending',
        title: 'Odroczenie',
      },
    ],
  },
  status: {
    accent: 'var(--pds-accent)',
    action: 'Oceń ponownie',
    icon: 'gauge',
    kicker: 'Stan konfiguracji workspace',
    sideTitle: 'Wymagania',
    summary:
      'Ekran pokazuje aktualne wymagania, osobę odpowiedzialną i wpływ na gotowość.',
    title: 'Sprawdź, co blokuje pełną gotowość',
    cards: [
      {
        description: 'Profil działalności ukończony przez administratora.',
        label: 'gotowy',
        status: 'ready',
        title: 'Profil działalności',
      },
      {
        description: 'Integracja czeka na osobę z capability.',
        label: 'oczekuje',
        status: 'pending',
        title: 'Źródło danych',
      },
    ],
  },
  preparation: {
    accent: 'var(--pds-accent)',
    action: 'Przejdź do dashboardu',
    icon: 'refresh',
    kicker: 'Przygotowanie dashboardu',
    sideTitle: 'Proces bez fikcyjnego postępu',
    summary:
      'Powierzchnia pojawia się przy walidacji, imporcie albo synchronizacji danych.',
    title: 'Przygotowujemy pierwsze użyteczne dane',
    cards: [
      {
        description: 'Mapowanie zamówień i waluty.',
        label: 'gotowy',
        status: 'ready',
        title: 'Walidacja datasetu',
      },
      {
        description: 'Synchronizacja może przejść w delayed.',
        label: 'w toku',
        status: 'pending',
        title: 'Import danych',
      },
    ],
  },
  blocked: {
    accent: 'var(--pds-accent)',
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
        label: 'zablokowany',
        status: 'blocked',
        title: 'Membership',
      },
      {
        description: 'Dostępna jest kontrolowana eskalacja.',
        label: 'oczekuje',
        status: 'pending',
        title: 'Support',
      },
    ],
  },
};
