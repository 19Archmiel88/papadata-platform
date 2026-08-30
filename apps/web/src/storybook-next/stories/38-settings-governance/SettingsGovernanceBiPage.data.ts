export type SettingsTabId =
  | 'account-profile'
  | 'account-security'
  | 'ws-company'
  | 'ws-team'
  | 'ws-analytics'
  | 'ws-ai'
  | 'ws-notifications'
  | 'ws-compliance'
  | 'audit-p0';

export type SettingsRailGroup = {
  readonly label: string;
  readonly items: ReadonlyArray<{
    readonly id: SettingsTabId;
    readonly icon: string;
    readonly label: string;
  }>;
};

export const settingsRailGroups: readonly SettingsRailGroup[] = [
  {
    label: 'Konto',
    items: [
      { id: 'account-profile', icon: '👤', label: 'Moje konto' },
      { id: 'account-security', icon: '🛡️', label: 'Bezpieczeństwo' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { id: 'ws-company', icon: '🏢', label: 'Firma i workspace' },
      { id: 'ws-team', icon: '👥', label: 'Zespół i uprawnienia' },
      { id: 'ws-analytics', icon: '🎯', label: 'Analityka i cele' },
      { id: 'ws-ai', icon: '🤖', label: 'Papa AI' },
      { id: 'ws-notifications', icon: '🔔', label: 'Powiadomienia' },
      { id: 'ws-compliance', icon: '📜', label: 'Prywatność' },
    ],
  },
];

export type SettingsTeamMember = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'OWNER' | 'ADMIN' | 'ANALYST' | 'MEMBER' | 'GROWTH_OPERATOR' | 'VIEWER';
  readonly mfa: boolean;
  readonly lastSeen: string;
};

export const settingsTeamMembers: readonly SettingsTeamMember[] = [
  { id: 'usr_1', name: 'Anna Kowalska', email: 'anna@casadiorfeo.pl', role: 'OWNER', mfa: true, lastSeen: 'Dzisiaj, 09:42' },
  { id: 'usr_2', name: 'Piotr Wiśniewski', email: 'piotr.admin@casadiorfeo.pl', role: 'ADMIN', mfa: true, lastSeen: 'Dzisiaj, 08:10' },
  { id: 'usr_3', name: 'Elżbieta Nowak', email: 'elzbieta.analyst@casadiorfeo.pl', role: 'ANALYST', mfa: false, lastSeen: 'Wczoraj, 16:30' },
];

export type SettingsInvitation = {
  readonly id: string;
  readonly email: string;
  readonly role: SettingsTeamMember['role'];
  readonly sentAt: string;
  readonly expiresAt: string;
};

export const settingsInvitations: readonly SettingsInvitation[] = [
  { id: 'inv_991', email: 'michal.nowak@casadiorfeo.pl', role: 'ANALYST', sentAt: '27.08.2026', expiresAt: '03.09.2026' },
];

export type SettingsRoleScopeMap = Record<
  'ADMIN' | 'ANALYST' | 'GROWTH_OPERATOR' | 'MEMBER' | 'VIEWER',
  readonly string[]
>;

export const settingsRoleScopes: SettingsRoleScopeMap = {
  ADMIN: ['users.invite', 'users.role_manage', 'targets.manage', 'settings.manage', 'analytics.read'],
  ANALYST: ['targets.manage', 'analytics.read', 'ai.query'],
  GROWTH_OPERATOR: ['campaigns.read', 'products.read', 'analytics.read'],
  MEMBER: ['analytics.read', 'ai.query'],
  VIEWER: ['analytics.read_only'],
};

export const settingsRoleDescriptions: Record<keyof SettingsRoleScopeMap, string> = {
  ADMIN: 'Pełne zarządzanie workspace i członkami',
  ANALYST: 'Odczyt i konfiguracja celów analitycznych',
  GROWTH_OPERATOR: 'Kampanie i produkty',
  MEMBER: 'Standardowy dostęp roboczy',
  VIEWER: 'Dostęp wyłącznie do odczytu',
};

export type SettingsTarget = {
  readonly id: string;
  readonly name: string;
  readonly metricKey: string;
  readonly value: number;
  readonly actual: number;
  readonly currency: string;
  readonly threshold: number;
  readonly cadence: 'MONTHLY' | 'WEEKLY';
};

export const settingsTargets: readonly SettingsTarget[] = [
  { id: 'tgt_101', name: 'Przychód Miesięczny (Monthly Revenue)', metricKey: 'revenue_monthly', value: 120000, actual: 104000, currency: 'PLN', threshold: 90, cadence: 'MONTHLY' },
  { id: 'tgt_102', name: 'Docelowy ROAS Kampanii Płatnych', metricKey: 'roas_target', value: 4.2, actual: 3.8, currency: 'RATIO', threshold: 85, cadence: 'WEEKLY' },
  { id: 'tgt_103', name: 'Koszt Pozyskania Klienta (CAC)', metricKey: 'cac_max', value: 45, actual: 41, currency: 'PLN', threshold: 95, cadence: 'MONTHLY' },
];

export type SettingsP0AuditItem = {
  readonly id: number;
  readonly title: string;
  readonly detail: string;
};

export const settingsP0AuditItems: readonly SettingsP0AuditItem[] = [
  { id: 1, title: 'Usunięcie pozoru SMS 2FA na rzecz TOTP', detail: 'Podłączono endpointy /auth/2fa/totp/*. Wygenerowano interaktywny QR Setup.' },
  { id: 2, title: 'Ujednolicenie katalogu ról RBAC (FE vs BE)', detail: 'Usunięto nieistniejące MARKETING i AGENCY_GUEST. Wdrożono rzetelny canonical catalog.' },
  { id: 3, title: 'Przekazywanie Scopes w Zaproszeniach', detail: 'Wizard wylicza i przesyła pełne capabilities overrides w kontrakcie API.' },
  { id: 4, title: 'Przepięcie Celów z localStorage na /targets', detail: 'Usunięto zapis sesyjny w browserze. Pełny CRUD na /targets.' },
  { id: 5, title: 'Demockowanie Pamięci i Konfiguracji Papa AI', detail: 'Wyodrębniono pamięć systemową od zdefiniowanej pamięci workspace.' },
  { id: 6, title: 'Usunięcie Sztucznych Harmonogramów Raportów', detail: 'Model ReportSchedule zastąpił wyliczanie cadence z index % 2.' },
  { id: 7, title: 'Prawdziwa Wysyłka Testowa Powiadomień', detail: 'Przycisk testowy wykonuje realny dispatch pod wskazany adres.' },
  { id: 8, title: 'Rozdzielenie B2B Customer Legal od Internal Release', detail: 'Usunięto wewnętrzne statusy release z panelu klienta.' },
];

export const settingsAuditPostureBreakdown = [
  { label: 'P0 Poprawki Gotowe', value: 8, tone: 'emerald' as const },
  { label: 'Wymaga P1 UI', value: 3, tone: 'indigo' as const },
  { label: 'Enterprise P2', value: 4, tone: 'slate' as const },
];

export type SettingsSearchEntry = {
  readonly key: string;
  readonly section: SettingsTabId;
  readonly desc: string;
};

export const settingsSearchIndex: readonly SettingsSearchEntry[] = [
  { key: '2FA TOTP QR Authenticator', section: 'account-security', desc: 'Uwierzytelnianie dwuskładnikowe kodami czasowymi RFC 6238' },
  { key: 'Waluta Raportowania (PLN/EUR/USD)', section: 'ws-company', desc: 'Główna waluta przeliczeniowa dla raportów i pulpitów' },
  { key: 'Strefa Czasowa (Europe/Warsaw)', section: 'ws-company', desc: 'Granice dni dla raportowania, alertów oraz godzin ciszy' },
  { key: 'Zaproś Członka Zespołu / Zaproszenia', section: 'ws-team', desc: 'Wysyłanie zaproszeń email z rolami RBAC' },
  { key: 'Cele Biznesowe (/targets)', section: 'ws-analytics', desc: 'Konfiguracja docelowych wskaźników przychodu i ROAS' },
  { key: 'Papa AI Pamięć i Słownik Biznesowy', section: 'ws-ai', desc: 'Kontekst definicji pojęć dla asystenta analitycznego' },
  { key: 'Godziny Ciszy (Quiet Hours)', section: 'ws-notifications', desc: 'Okres wstrzymania dostarczania powiadomień niekrytycznych' },
  { key: 'Umowa Powierzenia Przetwarzania (DPA)', section: 'ws-compliance', desc: 'Pobieranie dokumentu DPA oraz RODO compliance' },
];

export type SettingsMemoryEntry = {
  readonly term: string;
  readonly definition: string;
  readonly kind: 'custom' | 'system';
  readonly author: string;
};

export const settingsAiMemory: readonly SettingsMemoryEntry[] = [
  { term: 'VIP_CUSTOMER', definition: 'Klient z zakumulowanym LTV > 2 500 PLN w ciągu ostatnich 12 miesięcy.', kind: 'custom', author: 'Anna' },
  { term: 'ROAS', definition: 'Return on Ad Spend = (Przychód z kampanii / Koszt kampanii). Nieedytowalne.', kind: 'system', author: 'System' },
];

export const settingsSessions = [
  { id: 'sess_current', device: '💻 Chrome 128 (macOS Sonoma)', ip: '185.234.12.99', activity: 'Aktywna teraz (Ta sesja)', current: true },
  { id: 'sess_8821', device: '📱 Safari Mobile (iOS 17.6)', ip: '31.0.42.110', activity: '26.08.2026, 22:14', current: false },
];

export const settingsPasskeys = [
  { id: 'pk_991', label: 'MacBook Pro Touch ID', meta: 'Dodano: 18.08.2026 • Ostatnie użycie: Wczoraj', icon: '💻' },
  { id: 'pk_992', label: 'YubiKey 5 NFC (Hardware Key)', meta: 'Dodano: 02.06.2026 • Backup Hardware', icon: '📱' },
];

export const settingsSubprocessors = [
  { name: 'OpenAI Ireland Ltd.', purpose: 'Cel: Przetwarzanie zapytaniowe AI • Region: EU (Frankfurt)' },
  { name: 'Amazon Web Services EMEA SARL', purpose: 'Cel: Infrastruktura bazodanowa i Object Storage • Region: eu-central-1' },
];

export const settingsLegalDocs = [
  { id: 'dpa', title: 'Umowa Powierzenia Przetwarzania Danych (DPA)', meta: 'Wersja 2.4 • Zaakceptowano: 14.01.2026' },
  { id: 'terms', title: 'Regulamin Usługi PapaData (Terms of Service)', meta: 'Wersja 2026.1 • Zaakceptowano: 14.01.2026' },
];
