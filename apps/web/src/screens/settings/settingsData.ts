import type {
  DataColumn,
  DataRow,
} from '../../../../../contracts/component-shared';
import type {
  DataSourceRef,
  ReadinessState,
  WorkspaceContext,
} from '../../../../../contracts/ui-contract-types';

export type SettingsScreenId =
  | '60.01'
  | '60.02'
  | '60.03'
  | '60.04'
  | '60.05'
  | '60.06'
  | '60.07'
  | '60.08'
  | '60.09'
  | '60.10';

export type SettingsScreenVariant =
  | 'organization'
  | 'workspace'
  | 'memberships'
  | 'roles'
  | 'account-security'
  | 'sessions'
  | 'audit'
  | 'privacy'
  | 'support-access'
  | 'settings-variants';

export type SettingsScreenDefinition = {
  readonly apiPath: `/api/v1/${string}` | null;
  readonly displayTitle: string;
  readonly documentPath: string;
  readonly id: SettingsScreenId;
  readonly operationId: string | null;
  readonly route: `/app/${string}` | null;
  readonly routeBase: `/app/${string}` | null;
  readonly summary: string;
  readonly variant: SettingsScreenVariant;
};

export type SettingsMemberRecord = {
  readonly id: string;
  readonly person: string;
  readonly role: string;
  readonly status: 'active' | 'invited' | 'disabled';
  readonly mfa: boolean;
  readonly lastSeenAt: string;
};

export type SettingsRoleRecord = {
  readonly id: string;
  readonly role: string;
  readonly scope: string;
  readonly members: number;
  readonly sensitiveAccess: boolean;
};

export type SettingsSessionRecord = {
  readonly id: string;
  readonly device: string;
  readonly location: string;
  readonly status: 'current' | 'active' | 'expired';
  readonly lastSeenAt: string;
};

export type SettingsAuditRecord = {
  readonly id: string;
  readonly event: string;
  readonly actor: string;
  readonly resource: string;
  readonly timestamp: string;
  readonly risk: 'low' | 'medium' | 'high';
};

export type SettingsSupportAccessRecord = {
  readonly id: string;
  readonly scope: string;
  readonly holder: string;
  readonly status: 'disabled' | 'time-boxed' | 'pending-review';
  readonly expiresAt: string;
  readonly auditTrail: string;
};

export type SettingsVariantRecord = {
  readonly id: string;
  readonly variant: string;
  readonly condition: string;
  readonly composition: string;
  readonly constraint: string;
};

export type SettingsWorkspaceData = {
  readonly generatedAt: string;
  readonly context: WorkspaceContext;
  readonly audit: readonly SettingsAuditRecord[];
  readonly members: readonly SettingsMemberRecord[];
  readonly roles: readonly SettingsRoleRecord[];
  readonly sessions: readonly SettingsSessionRecord[];
  readonly sources: readonly DataSourceRef[];
  readonly supportAccess: readonly SettingsSupportAccessRecord[];
  readonly variants: readonly SettingsVariantRecord[];
  readonly summary: {
    readonly readiness: ReadinessState;
    readonly activeMembers: number;
    readonly pendingInvites: number;
    readonly mfaCoverage: number;
    readonly openRisks: number;
  };
};

export const settingsScreenDefinitions: readonly SettingsScreenDefinition[] = [
  {
    apiPath: '/api/v1/settings/organizacja',
    displayTitle: 'Organizacja',
    documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-01-organizacja.md',
    id: '60.01',
    operationId: 'settings.organization.read',
    route: '/app/settings/organizacja',
    routeBase: '/app/settings/organizacja',
    summary: 'Dane organizacji, właściciel, region i podstawowe ograniczenia administracyjne.',
    variant: 'organization',
  },
  {
    apiPath: '/api/v1/settings/workspace',
    displayTitle: 'Przestrzeń pracy',
    documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-02-workspace.md',
    id: '60.02',
    operationId: 'settings.workspace.read',
    route: '/app/settings/workspace',
    routeBase: '/app/settings/workspace',
    summary: 'Ustawienia przestrzeni pracy, region danych, domyślne role i polityka retencji.',
    variant: 'workspace',
  },
  {
    apiPath: '/api/v1/settings/czlonkostwa',
    displayTitle: 'Członkostwa',
    documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-03-czlonkostwa.md',
    id: '60.03',
    operationId: 'settings.memberships.read',
    route: '/app/settings/czlonkostwa',
    routeBase: '/app/settings/czlonkostwa',
    summary: 'Członkowie, zaproszenia, status MFA i ostatnia aktywność.',
    variant: 'memberships',
  },
  {
    apiPath: '/api/v1/settings/role-i-uprawnienia',
    displayTitle: 'Role i uprawnienia',
    documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-04-role-i-uprawnienia.md',
    id: '60.04',
    operationId: 'settings.roles.read',
    route: '/app/settings/role-i-uprawnienia',
    routeBase: '/app/settings/role-i-uprawnienia',
    summary: 'Role, zakresy uprawnień i dostęp wrażliwy wymagający kontroli.',
    variant: 'roles',
  },
  {
    apiPath: '/api/v1/settings/bezpieczenstwo-konta',
    displayTitle: 'Bezpieczeństwo konta',
    documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-05-bezpieczenstwo-konta.md',
    id: '60.05',
    operationId: 'settings.account-security.read',
    route: '/app/settings/bezpieczenstwo-konta',
    routeBase: '/app/settings/bezpieczenstwo-konta',
    summary: 'Stan MFA, wymagania logowania i ryzyka bezpieczeństwa konta.',
    variant: 'account-security',
  },
  {
    apiPath: '/api/v1/settings/sesje',
    displayTitle: 'Sesje',
    documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-06-sesje.md',
    id: '60.06',
    operationId: 'settings.sessions.read',
    route: '/app/settings/sesje',
    routeBase: '/app/settings/sesje',
    summary: 'Aktywne sesje użytkownika i urządzenia bez wykonywania wylogowania.',
    variant: 'sessions',
  },
  {
    apiPath: '/api/v1/settings/audyt',
    displayTitle: 'Audyt',
    documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-07-audyt.md',
    id: '60.07',
    operationId: 'settings.audit.read',
    route: '/app/settings/audyt',
    routeBase: '/app/settings/audyt',
    summary: 'Zdarzenia audytowe, aktor, zasób i ryzyko bez ujawniania sekretów.',
    variant: 'audit',
  },
  {
    apiPath: '/api/v1/settings/prywatnosc',
    displayTitle: 'Prywatność',
    documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-08-prywatnosc.md',
    id: '60.08',
    operationId: 'settings.privacy.read',
    route: '/app/settings/prywatnosc',
    routeBase: '/app/settings/prywatnosc',
    summary: 'Prywatność, maskowanie, retencja i status eksportów danych.',
    variant: 'privacy',
  },
  {
    apiPath: '/api/v1/settings/dostep-wsparcia',
    displayTitle: 'Dostęp wsparcia',
    documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-09-dostep-wsparcia.md',
    id: '60.09',
    operationId: 'settings.support-access.read',
    route: '/app/settings/dostep-wsparcia',
    routeBase: '/app/settings/dostep-wsparcia',
    summary: 'Kontrola czasowego dostępu wsparcia, zakresu, wygaśnięcia i śladu audytowego.',
    variant: 'support-access',
  },
  {
    apiPath: null,
    displayTitle: 'Warianty ustawień',
    documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-10-warianty-ustawien.md',
    id: '60.10',
    operationId: null,
    route: null,
    routeBase: null,
    summary: 'Zestaw wariantów polityk dla ustawień, uprawnień i ograniczeń administracyjnych.',
    variant: 'settings-variants',
  },
] as const;

export const settingsMemberColumns: readonly DataColumn[] = [
  { id: 'person', label: 'Osoba', sortable: true, width: 240 },
  { id: 'role', label: 'Rola', sortable: true },
  { id: 'statusLabel', label: 'Status', sortable: true },
  { id: 'mfaLabel', label: 'MFA', sortable: true },
  { id: 'lastSeenAt', label: 'Ostatnio', sortable: true },
];

export const settingsRoleColumns: readonly DataColumn[] = [
  { id: 'role', label: 'Rola', sortable: true },
  { id: 'scope', label: 'Zakres', sortable: true },
  { align: 'right', id: 'members', label: 'Członkowie', sortable: true },
  { id: 'sensitiveAccessLabel', label: 'Dostęp wrażliwy', sortable: true },
];

export const settingsSessionColumns: readonly DataColumn[] = [
  { id: 'device', label: 'Urządzenie', sortable: true, width: 240 },
  { id: 'location', label: 'Lokalizacja', sortable: true },
  { id: 'statusLabel', label: 'Status', sortable: true },
  { id: 'lastSeenAt', label: 'Ostatnio', sortable: true },
];

export const settingsAuditColumns: readonly DataColumn[] = [
  { id: 'event', label: 'Zdarzenie', sortable: true, width: 280 },
  { id: 'actor', label: 'Aktor', sortable: true },
  { id: 'resource', label: 'Zasób', sortable: true },
  { id: 'riskLabel', label: 'Ryzyko', sortable: true },
  { id: 'timestamp', label: 'Czas', sortable: true },
];

export const settingsSupportAccessColumns: readonly DataColumn[] = [
  { id: 'scope', label: 'Zakres', sortable: true },
  { id: 'holder', label: 'Właściciel', sortable: true },
  { id: 'statusLabel', label: 'Status', sortable: true },
  { id: 'expiresAt', label: 'Wygasa', sortable: true },
  { id: 'auditTrail', label: 'Ślad audytu', sortable: true },
];

export const settingsVariantColumns: readonly DataColumn[] = [
  { id: 'variant', label: 'Wariant', sortable: true, width: 220 },
  { id: 'condition', label: 'Warunek', sortable: true },
  { id: 'composition', label: 'Kompozycja', sortable: true },
  { id: 'constraint', label: 'Ograniczenie', sortable: true },
];

const members: readonly SettingsMemberRecord[] = [
  { id: 'set-member-owner', lastSeenAt: '2026-08-14T09:35:00+02:00', mfa: true, person: 'Artur W.', role: 'Właściciel', status: 'active' },
  { id: 'set-member-ops', lastSeenAt: '2026-08-14T08:20:00+02:00', mfa: true, person: 'Operacje przychodu', role: 'Administrator', status: 'active' },
  { id: 'set-member-analyst', lastSeenAt: '2026-08-13T15:44:00+02:00', mfa: false, person: 'Analityk', role: 'Analityk', status: 'active' },
  { id: 'set-member-invite', lastSeenAt: '2026-08-12T11:00:00+02:00', mfa: false, person: 'Partner agencyjny', role: 'Odbiorca', status: 'invited' },
];

const roles: readonly SettingsRoleRecord[] = [
  { id: 'set-role-owner', members: 1, role: 'Właściciel', scope: 'Organizacja + rozliczenia + bezpieczeństwo', sensitiveAccess: true },
  { id: 'set-role-admin', members: 2, role: 'Administrator', scope: 'Przestrzeń pracy + integracje', sensitiveAccess: true },
  { id: 'set-role-analyst', members: 4, role: 'Analityk', scope: 'Odczyt danych i raportów', sensitiveAccess: false },
  { id: 'set-role-viewer', members: 3, role: 'Odbiorca', scope: 'Odczyt ograniczony', sensitiveAccess: false },
];

const sessions: readonly SettingsSessionRecord[] = [
  { device: 'Chrome macOS', id: 'set-session-current', lastSeenAt: '2026-08-14T10:42:00+02:00', location: 'Warszawa', status: 'current' },
  { device: 'Safari iOS', id: 'set-session-mobile', lastSeenAt: '2026-08-13T19:10:00+02:00', location: 'Kraków', status: 'active' },
  { device: 'Chrome Windows', id: 'set-session-old', lastSeenAt: '2026-08-07T09:40:00+02:00', location: 'Poznań', status: 'expired' },
];

const audit: readonly SettingsAuditRecord[] = [
  { actor: 'Artur W.', event: 'Zmieniono rolę członka', id: 'set-audit-role', resource: 'member:analyst', risk: 'medium', timestamp: '2026-08-14T09:30:00+02:00' },
  { actor: 'System', event: 'Wymuszono MFA dla właściciela', id: 'set-audit-mfa', resource: 'security:mfa', risk: 'low', timestamp: '2026-08-13T18:00:00+02:00' },
  { actor: 'Operacje przychodu', event: 'Pobrano eksport audytu', id: 'set-audit-export', resource: 'audit:export', risk: 'high', timestamp: '2026-08-12T14:12:00+02:00' },
];

const supportAccess: readonly SettingsSupportAccessRecord[] = [
  {
    auditTrail: 'odczyt dostępu wsparcia + wymagana zgoda',
    expiresAt: '2026-08-14T18:00:00+02:00',
    holder: 'Lider wsparcia',
    id: 'set-support-disabled',
    scope: 'Brak aktywnego dostępu',
    status: 'disabled',
  },
  {
    auditTrail: 'przegląd bezpieczeństwa zgłoszenie 1842',
    expiresAt: '2026-08-15T09:00:00+02:00',
    holder: 'Operacje przychodu',
    id: 'set-support-timeboxed',
    scope: 'Tylko audyt sesji i integracji',
    status: 'time-boxed',
  },
  {
    auditTrail: 'oczekuje na potwierdzenie właściciela',
    expiresAt: '2026-08-14T16:30:00+02:00',
    holder: 'Właściciel organizacji',
    id: 'set-support-review',
    scope: 'Diagnostyka tenanta i przestrzeni pracy',
    status: 'pending-review',
  },
];

const variants: readonly SettingsVariantRecord[] = [
  {
    composition: 'Nagłówek + status danych + tabela',
    condition: 'Pełne dane i uprawnienie odczytu',
    constraint: 'Zmiany wymagają potwierdzenia administratora',
    id: 'set-variant-ready',
    variant: 'Gotowe',
  },
  {
    composition: 'Ostrzeżenie + zachowany układ tabeli',
    condition: 'Brak MFA lub częściowe źródła',
    constraint: 'Nie ukrywać wpływu na decyzję administracyjną',
    id: 'set-variant-partial',
    variant: 'Częściowe',
  },
  {
    composition: 'Komunikat krytyczny + dowody odczytu',
    condition: 'Brak uprawnienia albo wsparcie poza zakresem',
    constraint: 'Nie ujawniać danych innego tenanta',
    id: 'set-variant-forbidden',
    variant: 'Brak dostępu',
  },
  {
    composition: 'Status danych offline + zablokowane akcje',
    condition: 'Pamięć podręczna historyczna lub brak sieci',
    constraint: 'Zmiany są zablokowane',
    id: 'set-variant-offline',
    variant: 'Offline',
  },
];

const sources: readonly DataSourceRef[] = [
  { completeness: 1, dataset: 'memberships', lastSyncAt: '2026-08-14T10:30:00+02:00', provider: 'Tożsamość' },
  { completeness: 1, dataset: 'roles', lastSyncAt: '2026-08-14T10:30:00+02:00', provider: 'Autoryzacja' },
  { completeness: 0.98, dataset: 'audit_events', lastSyncAt: '2026-08-14T10:28:00+02:00', provider: 'Dziennik audytu' },
];

export function findSettingsScreenDefinition(
  idOrRoute: string,
): SettingsScreenDefinition | null {
  const normalized = idOrRoute.split('?')[0] ?? idOrRoute;
  return settingsScreenDefinitions.find((definition) => (
    definition.id === idOrRoute
    || definition.routeBase === normalized
  )) ?? null;
}

export function getSettingsNavigation() {
  return settingsScreenDefinitions.map((definition) => ({
    href: definition.routeBase ?? `#${definition.id}`,
    id: definition.id,
    label: definition.displayTitle,
  }));
}

export function createSettingsStorybookData(): SettingsWorkspaceData {
  return {
    audit,
    context: {
      locale: 'pl',
      tenantId: 'tenant-papadata-demo',
      userId: 'user-settings',
      workspaceId: 'workspace-commerce-pl',
    },
    generatedAt: '2026-08-14T10:45:00+02:00',
    members,
    roles,
    sessions,
    sources,
    supportAccess,
    summary: {
      activeMembers: members.filter((member) => member.status === 'active').length,
      mfaCoverage: members.filter((member) => member.mfa).length / members.length,
      openRisks: audit.filter((event) => event.risk === 'high').length,
      pendingInvites: members.filter((member) => member.status === 'invited').length,
      readiness: 'partial',
    },
    variants,
  };
}

export function settingsMemberRows(
  records: readonly SettingsMemberRecord[],
): readonly DataRow[] {
  return records.map((record) => ({
    id: record.id,
    lastSeenAt: formatDateTime(record.lastSeenAt),
    mfaLabel: record.mfa ? 'Włączone' : 'Brak',
    person: record.person,
    role: record.role,
    status: record.status,
    statusLabel: resolveMemberStatusLabel(record.status),
  }));
}

export function settingsRoleRows(
  records: readonly SettingsRoleRecord[],
): readonly DataRow[] {
  return records.map((record) => ({
    id: record.id,
    members: record.members,
    role: record.role,
    scope: record.scope,
    sensitiveAccessLabel: record.sensitiveAccess ? 'Tak' : 'Nie',
  }));
}

export function settingsSessionRows(
  records: readonly SettingsSessionRecord[],
): readonly DataRow[] {
  return records.map((record) => ({
    device: record.device,
    id: record.id,
    lastSeenAt: formatDateTime(record.lastSeenAt),
    location: record.location,
    status: record.status,
    statusLabel: resolveSessionStatusLabel(record.status),
  }));
}

export function settingsAuditRows(
  records: readonly SettingsAuditRecord[],
): readonly DataRow[] {
  return records.map((record) => ({
    actor: record.actor,
    event: record.event,
    id: record.id,
    resource: record.resource,
    risk: record.risk,
    riskLabel: resolveRiskLabel(record.risk),
    timestamp: formatDateTime(record.timestamp),
  }));
}

export function settingsSupportAccessRows(
  records: readonly SettingsSupportAccessRecord[],
): readonly DataRow[] {
  return records.map((record) => ({
    auditTrail: record.auditTrail,
    expiresAt: formatDateTime(record.expiresAt),
    holder: record.holder,
    id: record.id,
    scope: record.scope,
    status: record.status,
    statusLabel: resolveSupportAccessStatusLabel(record.status),
  }));
}

export function settingsVariantRows(
  records: readonly SettingsVariantRecord[],
): readonly DataRow[] {
  return records.map((record) => ({
    composition: record.composition,
    condition: record.condition,
    constraint: record.constraint,
    id: record.id,
    variant: record.variant,
  }));
}

function resolveMemberStatusLabel(
  status: SettingsMemberRecord['status'],
): string {
  switch (status) {
    case 'disabled':
      return 'Wyłączone';
    case 'invited':
      return 'Zaproszenie';
    case 'active':
    default:
      return 'Aktywne';
  }
}

function resolveSessionStatusLabel(
  status: SettingsSessionRecord['status'],
): string {
  switch (status) {
    case 'current':
      return 'Bieżąca';
    case 'expired':
      return 'Wygasła';
    case 'active':
    default:
      return 'Aktywna';
  }
}

function resolveRiskLabel(
  risk: SettingsAuditRecord['risk'],
): string {
  switch (risk) {
    case 'high':
      return 'Wysokie';
    case 'medium':
      return 'Średnie';
    case 'low':
    default:
      return 'Niskie';
  }
}

function resolveSupportAccessStatusLabel(
  status: SettingsSupportAccessRecord['status'],
): string {
  switch (status) {
    case 'time-boxed':
      return 'Czasowy';
    case 'pending-review':
      return 'Do przeglądu';
    case 'disabled':
    default:
      return 'Wyłączony';
  }
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}
