export type SettingsRuntimeVariant =
  | 'organization'
  | 'workspace'
  | 'memberships'
  | 'roles'
  | 'account-security'
  | 'sessions'
  | 'audit'
  | 'privacy'
  | 'support-access';

export type SettingsRuntimeDefinition = {
  readonly apiPath: `/api/v1/${string}`;
  readonly displayTitle: string;
  readonly id: string;
  readonly routeBase: `/app/${string}`;
  readonly summary: string;
  readonly variant: SettingsRuntimeVariant;
};

export const settingsRuntimeDefinitions: readonly SettingsRuntimeDefinition[] = [
  {
    apiPath: '/api/v1/settings/organizacja',
    displayTitle: 'Organizacja',
    id: '60.01',
    routeBase: '/app/settings/organizacja',
    summary: 'Dane organizacji, właściciel, region i podstawowe ograniczenia administracyjne.',
    variant: 'organization',
  },
  {
    apiPath: '/api/v1/settings/workspace',
    displayTitle: 'Przestrzeń pracy',
    id: '60.02',
    routeBase: '/app/settings/workspace',
    summary: 'Ustawienia przestrzeni pracy, region danych, domyślne role i polityka retencji.',
    variant: 'workspace',
  },
  {
    apiPath: '/api/v1/settings/czlonkostwa',
    displayTitle: 'Członkostwa',
    id: '60.03',
    routeBase: '/app/settings/czlonkostwa',
    summary: 'Członkowie, zaproszenia, status MFA i ostatnia aktywność.',
    variant: 'memberships',
  },
  {
    apiPath: '/api/v1/settings/role-i-uprawnienia',
    displayTitle: 'Role i uprawnienia',
    id: '60.04',
    routeBase: '/app/settings/role-i-uprawnienia',
    summary: 'Role, zakresy uprawnień i dostęp wrażliwy wymagający kontroli.',
    variant: 'roles',
  },
  {
    apiPath: '/api/v1/settings/bezpieczenstwo-konta',
    displayTitle: 'Bezpieczeństwo konta',
    id: '60.05',
    routeBase: '/app/settings/bezpieczenstwo-konta',
    summary: 'Stan MFA, wymagania logowania i ryzyka bezpieczeństwa konta.',
    variant: 'account-security',
  },
  {
    apiPath: '/api/v1/settings/sesje',
    displayTitle: 'Sesje i urządzenia',
    id: '60.06',
    routeBase: '/app/settings/sesje',
    summary: 'Aktywne sesje użytkownika i urządzenia bez wykonywania wylogowania.',
    variant: 'sessions',
  },
  {
    apiPath: '/api/v1/settings/audyt',
    displayTitle: 'Audyt',
    id: '60.07',
    routeBase: '/app/settings/audyt',
    summary: 'Zdarzenia audytowe, aktor, zasób i ryzyko bez ujawniania sekretów.',
    variant: 'audit',
  },
  {
    apiPath: '/api/v1/settings/prywatnosc',
    displayTitle: 'Prywatność',
    id: '60.08',
    routeBase: '/app/settings/prywatnosc',
    summary: 'Prywatność, maskowanie, retencja i status eksportów danych.',
    variant: 'privacy',
  },
  {
    apiPath: '/api/v1/settings/dostep-wsparcia',
    displayTitle: 'Dostęp wsparcia',
    id: '60.09',
    routeBase: '/app/settings/dostep-wsparcia',
    summary: 'Kontrola czasowego dostępu wsparcia, zakresu, wygaśnięcia i śladu audytowego.',
    variant: 'support-access',
  },
] as const;

export function findSettingsRuntimeDefinition(path: string) {
  return settingsRuntimeDefinitions.find((item) => path.startsWith(item.routeBase)) ?? null;
}
