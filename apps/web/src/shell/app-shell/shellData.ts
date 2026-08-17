import type {
  ShellCommandResult,
  ShellNavigationGroup,
  ShellNotification,
  ShellOperation,
  ShellUser,
  ShellWorkspace,
} from './shellTypes';

export const defaultShellUser: ShellUser = {
  displayName: 'Artur Wiśniewski',
  email: 'artur@papadata.local',
  role: 'Owner workspace',
};

export const defaultShellWorkspaces = [
  {
    capabilities: [
      'analytics.read',
      'integrations.manage',
      'billing.read',
    ],
    id: 'commerce',
    name: 'Commerce PL',
    role: 'Owner',
    statusText: 'Aktywny',
    tone: 'success',
  },
  {
    capabilities: [
      'analytics.read',
    ],
    id: 'marketplace',
    name: 'Marketplace EU',
    role: 'Analityk',
    statusText: 'Tylko odczyt',
    tone: 'info',
  },
  {
    capabilities: [],
    disabled: true,
    id: 'archive',
    name: 'Archiwum 2025',
    role: 'Brak dostępu',
    statusText: 'Zablokowany',
    tone: 'warning',
  },
] satisfies readonly ShellWorkspace[];

export const defaultShellNavigation = [
  {
    id: 'analytics',
    label: 'Analiza',
    items: [
      {
        icon: 'home',
        id: 'command-center',
        label: 'Centrum Dowodzenia',
        path: '/app/command-center',
      },
      {
        icon: 'trend',
        id: 'campaigns',
        label: 'Kampanie płatne',
        path: '/app/campaigns',
      },
      {
        icon: 'data',
        id: 'orders',
        label: 'Zamówienia',
        path: '/app/orders',
      },
      {
        icon: 'products',
        id: 'products',
        label: 'Produkty',
        path: '/app/products',
      },
      {
        icon: 'customers',
        id: 'customers',
        label: 'Klienci',
        path: '/app/customers',
      },
      {
        icon: 'trend',
        id: 'traffic',
        label: 'Ruch na stronie',
        path: '/app/traffic',
      },
    ],
  },
  {
    id: 'ai',
    label: 'AI',
    items: [
      {
        icon: 'assistant',
        id: 'papa',
        label: 'Laboratorium Papa Asystenta',
        path: '/app/papa/laboratorium-ai',
      },
    ],
  },
  {
    id: 'data-integrations',
    label: 'Dane i integracje',
    items: [
      {
        disabled: true,
        disabledReason: 'Moduł nie jest jeszcze aktywny w bieżącym środowisku.',
        icon: 'integration',
        id: 'integrations',
        label: 'Integracje',
        path: '/app/integrations/katalog-integracji',
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administracja',
    items: [
      {
        disabled: true,
        disabledReason: 'Moduł nie jest jeszcze aktywny w bieżącym środowisku.',
        icon: 'security',
        id: 'settings',
        label: 'Ustawienia',
        path: '/app/settings/organizacja',
      },
      {
        badge: 'Nowe',
        icon: 'billing',
        id: 'billing',
        label: 'Subskrypcja i płatności',
        path: '/app/billing/subskrypcja',
        status: 'Sekcja 70',
      },
    ],
  },
  {
    id: 'support',
    label: 'Wsparcie',
    items: [
      {
        badge: 'Nowe',
        icon: 'decisions',
        id: 'decisions',
        label: 'Wsparcie w marketingu',
        path: '/app/decisions/centrum-decyzji',
        status: 'Sekcja 80',
      },
      {
        disabled: true,
        disabledReason: 'Moduł nie jest jeszcze aktywny w bieżącym środowisku.',
        icon: 'help',
        id: 'help',
        label: 'Centrum Pomocy',
        path: '/app/help/strona-glowna-pomocy',
      },
    ],
  },
] satisfies readonly ShellNavigationGroup[];

export const defaultShellCommands = [
  {
    action: 'open-papa',
    description: 'Otwiera globalny czat Papa z kontekstem bieżącego ekranu.',
    id: 'open-papa-assistant',
    keywords: [
      'papa',
      'asystent',
      'czat',
      'ai',
    ],
    label: 'Otwórz Papa Asystenta',
    path: '/app/papa/laboratorium-ai',
    section: 'Papa',
  },
  {
    action: 'analyze-screen',
    description: 'Tworzy snapshot bieżącego dashboardu i prosi Papa o analizę.',
    id: 'analyze-current-screen',
    keywords: [
      'analiza',
      'ekran',
      'kontekst',
      'snapshot',
    ],
    label: 'Analizuj bieżący ekran',
    path: '/app/papa/panel-kontekstowy-papa',
    section: 'Papa',
  },
  {
    description: 'Otwiera główny widok po zalogowaniu.',
    id: 'open-command-center',
    keywords: [
      'dashboard',
      'kpi',
      'centrum',
    ],
    label: 'Przejdź do Centrum Dowodzenia',
    path: '/app/command-center',
    section: 'Nawigacja',
  },
  {
    description: 'Sprawdza stan połączeń i ostatnie synchronizacje.',
    id: 'open-integrations',
    keywords: [
      'integracje',
      'sync',
      'provider',
    ],
    label: 'Otwórz katalog integracji',
    path: '/app/integrations/katalog-integracji',
    section: 'Dane',
  },
  {
    description: 'Pokazuje ustawienia organizacji i workspace.',
    id: 'open-settings',
    keywords: [
      'role',
      'workspace',
      'zespół',
    ],
    label: 'Otwórz ustawienia organizacji',
    path: '/app/settings/organizacja',
    section: 'Administracja',
  },
  {
    description: 'Pokazuje aktualną subskrypcję, limity, faktury i ryzyka rozliczeniowe.',
    id: 'open-billing',
    keywords: [
      'billing',
      'faktury',
      'subskrypcja',
    ],
    label: 'Otwórz subskrypcję i płatności',
    path: '/app/billing/subskrypcja',
    section: 'Administracja',
  },
  {
    description: 'Pokazuje centrum decyzji marketingowych, rekomendacje i pomiar działań.',
    id: 'open-decisions',
    keywords: [
      'decyzje',
      'rekomendacje',
      'marketing',
    ],
    label: 'Otwórz decyzje i działania',
    path: '/app/decisions/centrum-decyzji',
    section: 'Wsparcie',
  },
] satisfies readonly ShellCommandResult[];

export const defaultShellNotifications = [
  {
    actionLabel: 'Sprawdź',
    actionPath: '/app/command-center/kolejka-uwagi',
    canSnooze: true,
    category: 'data',
    createdAt: '2026-08-17T12:18:00+02:00',
    id: 'readiness',
    message: 'Readiness danych dla Commerce PL jest częściowy: brakuje świeżego kosztu reklam.',
    priority: 'high',
    readAt: null,
    snoozedUntil: null,
    time: '2 min temu',
    title: 'Dane wymagają uwagi',
    tone: 'warning',
    unread: true,
  },
  {
    actionLabel: 'Otwórz integracje',
    actionPath: '/app/integrations',
    canSnooze: true,
    category: 'integrations',
    createdAt: '2026-08-17T12:02:00+02:00',
    id: 'sync-done',
    message: 'Synchronizacja WooCommerce zakończyła się bez nowych konfliktów.',
    priority: 'medium',
    readAt: '2026-08-17T12:10:00+02:00',
    snoozedUntil: null,
    time: '18 min temu',
    title: 'Synchronizacja zakończona',
    tone: 'success',
    unread: false,
  },
] satisfies readonly ShellNotification[];

export const defaultShellOperations = [
  {
    action: 'cancel',
    actionLabel: 'Anuluj',
    description: 'Pobieranie zamówień i refundów z ostatnich 30 dni.',
    errorCode: null,
    id: 'sync-woo-20260812',
    progress: 64,
    startedAt: '12:18',
    status: 'running',
    statusText: 'W toku',
    title: 'Synchronizacja WooCommerce',
  },
  {
    action: 'retry',
    actionLabel: 'Ponów',
    description: 'Google Ads zwrócił limit rate limit. Retry jest bezpieczny.',
    errorCode: 'ADS-429',
    id: 'ads-cost-refresh',
    progress: null,
    startedAt: '12:05',
    status: 'failed',
    statusText: 'Wymaga retry',
    title: 'Odświeżenie kosztów Google Ads',
  },
] satisfies readonly ShellOperation[];
