import type { ReauthenticationPurpose } from '../contracts/auth';
import {
  localAuthOrganizations,
  localAuthSessions,
  localAuthWorkspaces,
} from './auth-domain';

export type AuthOperationalScenario =
  | 'login'
  | 'loginLoading'
  | 'loginInvalidCredentials'
  | 'loginAccountBlocked'
  | 'mfaChallenge'
  | 'mfaInvalid'
  | 'mfaExpired'
  | 'mfaRecoveryCode'
  | 'passwordRecovery'
  | 'passwordRecoverySuccess'
  | 'resetPassword'
  | 'resetExpiredLink'
  | 'resetUsedLink'
  | 'invitation'
  | 'invitationExpired'
  | 'invitationUsed'
  | 'invitationEmailMismatch'
  | 'contextSelection'
  | 'workspaceNotReady'
  | 'workspaceBlocked'
  | 'noMembership'
  | 'sessionExpired'
  | 'activeSessions'
  | 'reauthentication'
  | 'securitySettings'
  | 'forbidden';

export type AuthOperationalScenarioCopy = {
  action: string;
  email: string;
  eyebrow: string;
  impact: string;
  recovery: string;
  status: string;
  title: string;
};

export type AuthOperationalFieldDefaults = {
  mfaCodes?: Partial<Record<AuthOperationalScenario, string>>;
  passwords?: Partial<Record<AuthOperationalScenario, string>>;
  tokens?: Partial<Record<AuthOperationalScenario, string>>;
};

export const authOperationalScenarios: Record<
  AuthOperationalScenario,
  AuthOperationalScenarioCopy
> = {
  activeSessions: {
    action: 'Odśwież listę sesji',
    email: 'owner@northstar.example',
    eyebrow: 'Sesje',
    impact: 'Użytkownik widzi bieżące i inne aktywne sesje bez fingerprintingu.',
    recovery: 'Unieważnienie innych sesji wymaga ponownego potwierdzenia.',
    status: 'Kilka urządzeń',
    title: 'Aktywne sesje',
  },
  contextSelection: {
    action: 'Wybierz workspace',
    email: 'multi-workspace@northstar.example',
    eyebrow: 'Kontekst',
    impact: 'Kontekst organization/workspace jest jawny i walidowany przez gateway.',
    recovery: 'Zmiana workspace czyści stan zależny od poprzedniego kontekstu.',
    status: 'Wybór wymagany',
    title: 'Wybór organization i workspace',
  },
  forbidden: {
    action: 'Sprawdź dostęp',
    email: 'viewer@northstar.example',
    eyebrow: 'Brak uprawnienia',
    impact: 'Ukrycie przycisku nie wystarcza; operacja wraca jako forbidden.',
    recovery: 'Administrator musi nadać jawne capability po decyzji macierzy.',
    status: 'Deny by default',
    title: 'Brak capability',
  },
  invitation: {
    action: 'Przyjmij zaproszenie',
    email: 'new-admin@northstar.example',
    eyebrow: 'Zaproszenie',
    impact: 'Token jest jednorazowy i związany z adresem e-mail.',
    recovery: 'Po sukcesie użytkownik trafia do wskazanego workspace.',
    status: 'Aktywne zaproszenie',
    title: 'Akceptacja zaproszenia',
  },
  invitationEmailMismatch: {
    action: 'Sprawdź zaproszenie',
    email: 'someone-else@northstar.example',
    eyebrow: 'Zaproszenie',
    impact: 'Inny e-mail nie może przejąć membershipu.',
    recovery: 'Użytkownik musi użyć adresu wskazanego w zaproszeniu.',
    status: 'E-mail mismatch',
    title: 'Zaproszenie dla innego adresu',
  },
  invitationExpired: {
    action: 'Sprawdź zaproszenie',
    email: 'expired@northstar.example',
    eyebrow: 'Zaproszenie',
    impact: 'Wygasły token nie otwiera organization ani workspace.',
    recovery: 'Uprawniony użytkownik może wysłać nowe zaproszenie.',
    status: 'Link wygasł',
    title: 'Zaproszenie wygasło',
  },
  invitationUsed: {
    action: 'Sprawdź zaproszenie',
    email: 'used@northstar.example',
    eyebrow: 'Zaproszenie',
    impact: 'Wykorzystany token nie może utworzyć kolejnego membershipu.',
    recovery: 'Należy rozpocząć nowy proces zaproszenia.',
    status: 'Link wykorzystany',
    title: 'Zaproszenie wykorzystane',
  },
  login: {
    action: 'Zaloguj',
    email: 'analyst@northstar.example',
    eyebrow: 'Logowanie',
    impact: 'Poprawne dane tworzą sesję i rozwiązują kontekst workspace.',
    recovery: 'Return URL pozostaje w obrębie aplikacji.',
    status: 'Gotowe',
    title: 'Logowanie e-mail i hasło',
  },
  loginAccountBlocked: {
    action: 'Zaloguj',
    email: 'blocked@northstar.example',
    eyebrow: 'Logowanie',
    impact: 'Konto zablokowane nie ujawnia publicznie szczegółowej przyczyny.',
    recovery: 'Dostęp wymaga bezpiecznej ścieżki wsparcia.',
    status: 'Konto zablokowane',
    title: 'Dostęp wymaga wyjaśnienia',
  },
  loginInvalidCredentials: {
    action: 'Zaloguj',
    email: 'unknown@northstar.example',
    eyebrow: 'Logowanie',
    impact: 'Komunikat nie ujawnia, czy adres istnieje.',
    recovery: 'Użytkownik może ponowić próbę lub przejść do odzyskiwania.',
    status: 'Błędne dane',
    title: 'Nieudane logowanie',
  },
  loginLoading: {
    action: 'Sprawdzanie',
    email: 'analyst@northstar.example',
    eyebrow: 'Logowanie',
    impact: 'Wysyłka formularza jest zablokowana do czasu odpowiedzi.',
    recovery: 'Ponowienie jest bezpieczne po zakończeniu próby.',
    status: 'Loading',
    title: 'Logowanie w trakcie',
  },
  mfaChallenge: {
    action: 'Potwierdź kod',
    email: 'owner@northstar.example',
    eyebrow: 'MFA',
    impact: 'Sesja powstaje dopiero po potwierdzeniu challenge.',
    recovery: 'Challenge ma TTL i limit prób.',
    status: 'MFA wymagane',
    title: 'Kod jednorazowy',
  },
  mfaExpired: {
    action: 'Potwierdź kod',
    email: 'owner@northstar.example',
    eyebrow: 'MFA',
    impact: 'Wygasły challenge wymaga rozpoczęcia nowej próby.',
    recovery: 'Ponowienie challenge jest bezpieczne tylko z aktywnej próby.',
    status: 'MFA wygasło',
    title: 'Challenge wygasł',
  },
  mfaInvalid: {
    action: 'Potwierdź kod',
    email: 'owner@northstar.example',
    eyebrow: 'MFA',
    impact: 'Błędny kod zwiększa licznik prób.',
    recovery: 'Po limicie proces wymaga restartu.',
    status: 'MFA błędne',
    title: 'Nieprawidłowy kod',
  },
  mfaRecoveryCode: {
    action: 'Użyj recovery code',
    email: 'owner@northstar.example',
    eyebrow: 'MFA',
    impact: 'Recovery code działa jednorazowo i jest audytowany.',
    recovery: 'Po użyciu warto wygenerować nowy zestaw kodów.',
    status: 'Recovery code',
    title: 'Kod odzyskiwania',
  },
  noMembership: {
    action: 'Sprawdź członkostwo',
    email: 'nomembership@northstar.example',
    eyebrow: 'Brak membershipu',
    impact: 'Aktywne konto bez membershipu nie otrzymuje danych workspace.',
    recovery: 'Potrzebne jest zaproszenie albo aktywacja membershipu.',
    status: 'No access',
    title: 'Brak aktywnego membershipu',
  },
  passwordRecovery: {
    action: 'Wyślij instrukcje',
    email: 'viewer@northstar.example',
    eyebrow: 'Odzyskiwanie',
    impact: 'Odpowiedź pozostaje neutralna dla istniejących i nieistniejących kont.',
    recovery: 'Token local/test trafia wyłącznie do kontrolowanego outboxa.',
    status: 'Formularz',
    title: 'Odzyskiwanie hasła',
  },
  passwordRecoverySuccess: {
    action: 'Wyślij ponownie',
    email: 'viewer@northstar.example',
    eyebrow: 'Odzyskiwanie',
    impact: 'Użytkownik widzi neutralny sukces bez ujawniania konta.',
    recovery: 'Kolejny reset unieważnia poprzedni proces w warstwie adaptera.',
    status: 'Sukces neutralny',
    title: 'Instrukcje przygotowane',
  },
  reauthentication: {
    action: 'Potwierdź',
    email: 'owner@northstar.example',
    eyebrow: 'Reauthentication',
    impact: 'Wrażliwe akcje dostają krótki, sesyjny kontekst potwierdzenia.',
    recovery: 'Token reauth nie zastępuje zwykłej sesji.',
    status: 'Wymagane potwierdzenie',
    title: 'Potwierdzenie operacji wrażliwej',
  },
  resetExpiredLink: {
    action: 'Ustaw hasło',
    email: 'viewer@northstar.example',
    eyebrow: 'Reset hasła',
    impact: 'Wygasły link nie zmienia hasła ani sesji.',
    recovery: 'Użytkownik może rozpocząć nowy reset.',
    status: 'Link wygasł',
    title: 'Reset wygasł',
  },
  resetPassword: {
    action: 'Ustaw hasło',
    email: 'analyst@northstar.example',
    eyebrow: 'Reset hasła',
    impact: 'Aktywny token działa raz i unieważnia właściwe sesje.',
    recovery: 'Po sukcesie użytkownik przechodzi do logowania.',
    status: 'Aktywny token',
    title: 'Nowe hasło',
  },
  resetUsedLink: {
    action: 'Ustaw hasło',
    email: 'owner@northstar.example',
    eyebrow: 'Reset hasła',
    impact: 'Wykorzystany link nie może zostać powtórzony.',
    recovery: 'Potrzebny jest nowy proces resetu.',
    status: 'Link wykorzystany',
    title: 'Reset już użyty',
  },
  securitySettings: {
    action: 'Regeneruj recovery codes',
    email: 'owner@northstar.example',
    eyebrow: 'Ustawienia bezpieczeństwa',
    impact: 'MFA, recovery codes i revoke sesji wymagają reauthentication.',
    recovery: 'Wyłączenie MFA jest audytowane i nie usuwa historii zdarzeń.',
    status: 'MFA aktywne',
    title: 'Bezpieczeństwo konta',
  },
  sessionExpired: {
    action: 'Zaloguj ponownie',
    email: 'owner@northstar.example',
    eyebrow: 'Sesja',
    impact: 'Wygasła sesja czyści dane zależne od workspace.',
    recovery: 'Bezpieczny cel powrotu jest zachowany po ponownym logowaniu.',
    status: 'Sesja wygasła',
    title: 'Ponowne logowanie',
  },
  workspaceBlocked: {
    action: 'Sprawdź workspace',
    email: 'multi-workspace@northstar.example',
    eyebrow: 'Workspace',
    impact: 'Zablokowany workspace nie ujawnia danych ani integracji.',
    recovery: 'Potrzebna jest decyzja administracyjna.',
    status: 'Workspace blocked',
    title: 'Workspace zablokowany',
  },
  workspaceNotReady: {
    action: 'Sprawdź workspace',
    email: 'multi-workspace@northstar.example',
    eyebrow: 'Workspace',
    impact: 'Workspace bez gotowości nie udaje pełnego dashboardu.',
    recovery: 'Po synchronizacji można ponownie sprawdzić dostęp.',
    status: 'Workspace not ready',
    title: 'Workspace nie jest gotowy',
  },
};

export const authOperationalSessionFixtures = localAuthSessions;
export const authOperationalOrganizations = localAuthOrganizations;
export const authOperationalWorkspaces = localAuthWorkspaces;

export const authReauthenticationPurposes: readonly {
  label: string;
  value: ReauthenticationPurpose;
}[] = [
  { label: 'Zmiana hasła', value: 'change_password' },
  { label: 'Wyłączenie MFA', value: 'disable_mfa' },
  { label: 'Recovery codes', value: 'regenerate_recovery_codes' },
  { label: 'Unieważnienie sesji', value: 'revoke_session' },
];
