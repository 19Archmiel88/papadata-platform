export type AuthScreen =
  | 'login'
  | 'register'
  | 'emailVerification'
  | 'mfa'
  | 'verification'
  | 'recovery'
  | 'invitation'
  | 'signedOut'
  | 'authUnavailable'
  | 'accessBlocked'
  | 'reauthentication'
  | 'accessResolution'
  | 'complete';

export type LoginState =
  | 'default'
  | 'submitting'
  | 'invalidCredentials'
  | 'providerUnavailable';

export type VerificationKind = 'emailVerification' | 'mfa';

export type VerificationCodeState =
  | 'idle'
  | 'incomplete'
  | 'submitting'
  | 'invalid'
  | 'expired'
  | 'resent'
  | 'cooldown'
  | 'success';

export type AuthScreenCopy = {
  eyebrow: string;
  title: string;
  summary: string;
  visualTitle: string;
  visualText: string;
  status: string;
};

export type AuthProgressIcon = 'fingerprint' | 'user' | 'waypoints';

export const authScreenCopy: Record<AuthScreen, AuthScreenCopy> = {
  login: {
    eyebrow: 'Dostęp firmowy',
    title: 'Zaloguj się do PapaData',
    summary:
      'Użyj służbowego adresu e-mail lub konta firmowego.',
    visualTitle: 'Bezpieczne logowanie',
    visualText:
      'Metody logowania są weryfikowane po stronie usługi.',
    status: 'Logowanie nie ujawnia stanu konta.',
  },
  register: {
    eyebrow: 'Nowe konto',
    title: 'Utwórz dostęp firmowy',
    summary:
      'Podaj podstawowe dane. Organizacja i uprawnienia zostaną rozstrzygnięte w kolejnych krokach.',
    visualTitle: 'Tworzenie tożsamości roboczej',
    visualText:
      'Dane są przygotowywane do weryfikacji bez automatycznego nadawania dostępu do workspace.',
    status: 'Przygotowanie nowej tożsamości',
  },
  emailVerification: {
    eyebrow: 'Weryfikacja e-mail',
    title: 'Potwierdź adres e-mail',
    summary:
      'Wpisz kod z bieżącej próby. Komunikaty pozostają neutralne dla odzyskiwania dostępu.',
    visualTitle: 'Adres oczekuje na potwierdzenie',
    visualText:
      'Sześciocyfrowy kod potwierdza bieżący kanał bez ujawniania dodatkowych informacji.',
    status: 'Kod e-mail oczekuje na potwierdzenie',
  },
  mfa: {
    eyebrow: 'Bezpieczne logowanie',
    title: 'Potwierdź logowanie',
    summary:
      'Wpisz kod bezpieczeństwa, aby dokończyć aktualną próbę logowania.',
    visualTitle: 'Logowanie wymaga drugiego sygnału',
    visualText:
      'Kod MFA potwierdza bieżącą próbę bez używania copy o adresie e-mail.',
    status: 'Kod bezpieczeństwa oczekuje na potwierdzenie',
  },
  verification: {
    eyebrow: 'Weryfikacja e-mail',
    title: 'Potwierdź adres e-mail',
    summary:
      'Wpisz kod z bieżącej próby. Komunikaty pozostają neutralne dla odzyskiwania dostępu.',
    visualTitle: 'Adres oczekuje na potwierdzenie',
    visualText:
      'Sześciocyfrowy kod potwierdza bieżący kanał bez ujawniania dodatkowych informacji.',
    status: 'Kod e-mail oczekuje na potwierdzenie',
  },
  recovery: {
    eyebrow: 'Odzyskiwanie',
    title: 'Odzyskaj dostęp',
    summary:
      'Podaj firmowy adres e-mail. Odpowiedź pozostanie neutralna niezależnie od wyniku.',
    visualTitle: 'Bezpieczna ścieżka odzyskania',
    visualText:
      'Proces nie ujawnia stanu konta, dostawcy ani aktywnych członkostw.',
    status: 'Analiza możliwej ścieżki',
  },
  invitation: {
    eyebrow: 'Zaproszenie',
    title: 'Przyjmij zaproszenie',
    summary:
      'Potwierdź adres wskazany w zaproszeniu. Szczegóły workspace pojawią się po weryfikacji.',
    visualTitle: 'Zaproszenie czeka na właściciela',
    visualText:
      'Workspace pozostaje odseparowany do czasu potwierdzenia tożsamości zaproszonej osoby.',
    status: 'Zaproszenie gotowe do sprawdzenia',
  },
  signedOut: {
    eyebrow: 'Sesja zakończona',
    title: 'Sesja została zamknięta',
    summary:
      'Możesz rozpocząć nową próbę logowania albo przejść do odzyskiwania dostępu.',
    visualTitle: 'Poprzedni kanał został zamknięty',
    visualText:
      'Nowe logowanie utworzy odrębną próbę i nie przywróci poprzedniego kontekstu automatycznie.',
    status: 'Brak aktywnej sesji',
  },
  authUnavailable: {
    eyebrow: 'Dostęp przerwany',
    title: 'Nie udało się wznowić próby',
    summary:
      'Aktualny kontekst nie może być kontynuowany. Rozpocznij ponownie albo wybierz wsparcie.',
    visualTitle: 'Kanał wymaga restartu',
    visualText:
      'Przerwana próba nie ujawnia tokenu, odpowiedzi dostawcy ani szczegółów technicznych.',
    status: 'Kontekst próby wygasł',
  },
  accessBlocked: {
    eyebrow: 'Dostęp ograniczony',
    title: 'Dostęp wymaga wyjaśnienia',
    summary:
      'Nie pokazujemy publicznie przyczyny ograniczenia. Dostępne są tylko bezpieczne ścieżki.',
    visualTitle: 'Decyzja dostępu jest wstrzymana',
    visualText:
      'Powodem może być konto, członkostwo albo workspace, ale widok nie rozstrzyga tego lokalnie.',
    status: 'Wymagana bezpieczna decyzja',
  },
  reauthentication: {
    eyebrow: 'Ponowne potwierdzenie',
    title: 'Potwierdź wrażliwą akcję',
    summary:
      'Uwierzytelnienie dotyczy konkretnego celu i ma ograniczony czas obowiązywania.',
    visualTitle: 'Akcja oczekuje na potwierdzenie',
    visualText:
      'Dodatkowa weryfikacja zabezpiecza zmianę bez otwierania nowej pełnej sesji.',
    status: 'Oczekiwanie na potwierdzenie',
  },
  accessResolution: {
    eyebrow: 'Rozwiązanie dostępu',
    title: 'Wybierz bezpieczną ścieżkę',
    summary:
      'Konta nie są scalane automatycznie. Możesz zrestartować próbę albo potwierdzić tożsamość.',
    visualTitle: 'Konflikt pozostaje odseparowany',
    visualText:
      'PapaData nie łączy tożsamości wyłącznie na podstawie zgodnego adresu e-mail.',
    status: 'Potrzebna decyzja użytkownika',
  },
  complete: {
    eyebrow: 'Dostęp potwierdzony',
    title: 'Tożsamość została zweryfikowana',
    summary:
      'Proces Auth został zakończony. Następny ekran wybierze właściwy workspace albo konfigurację.',
    visualTitle: 'Kanał dostępu jest potwierdzony',
    visualText:
      'Zweryfikowana tożsamość może zostać przekazana do kolejnej decyzji procesu wejścia.',
    status: 'Tożsamość gotowa do przekazania',
  },
};

export const authProgressSteps = [
  {
    key: 'entry',
    label: 'Konto',
    icon: 'user',
  },
  {
    key: 'verification',
    label: 'Weryfikacja',
    icon: 'fingerprint',
  },
  {
    key: 'complete',
    label: 'Dostęp',
    icon: 'waypoints',
  },
] as const satisfies readonly {
  icon: AuthProgressIcon;
  key: string;
  label: string;
}[];

export const verificationCodeLength = 6;
export const verificationCooldownSeconds = 60;
export const staticCooldownSeconds = 42;

export const verificationCodeSettings: Record<
  VerificationKind,
  {
    changeLabel: string;
    changeTarget: AuthScreen;
    fieldLabel: string;
    headerEyebrow: string;
    headerText: string;
    headerTitle: string;
    name: string;
    resendLabel: string;
    submitLabel: string;
  }
> = {
  emailVerification: {
    changeLabel: 'Zmień adres e-mail',
    changeTarget: 'recovery',
    fieldLabel: 'Kod weryfikacyjny',
    headerEyebrow: 'Kod e-mail',
    headerText:
      'Wpisz 6-cyfrowy kod wysłany na a***@northstar.example.',
    headerTitle: 'Potwierdź adres e-mail',
    name: 'email-verification-code',
    resendLabel: 'Wyślij kod ponownie',
    submitLabel: 'Potwierdź adres',
  },
  mfa: {
    changeLabel: 'Wróć do logowania',
    changeTarget: 'login',
    fieldLabel: 'Kod bezpieczeństwa',
    headerEyebrow: 'Kod bezpieczeństwa',
    headerText:
      'Wpisz 6-cyfrowy kod, aby dokończyć bezpieczne logowanie.',
    headerTitle: 'Potwierdź logowanie',
    name: 'mfa-code',
    resendLabel: 'Wyślij kod ponownie',
    submitLabel: 'Potwierdź logowanie',
  },
};

export const authIdentityFixture = {
  email: 'anna@northstar.example',
  fullName: 'Anna Kowalska',
  invitationIdentifier: 'INV-NR-2048',
  organizationName: 'Northstar Retail',
} as const;

export type AuthCodeExample = {
  disabled?: boolean;
  errorMessage?: string;
  id: string;
  initialValue: string;
  invalid?: boolean;
  label: string;
};

export const authCodeExamples: readonly AuthCodeExample[] = [
  {
    id: 'component-code-empty',
    initialValue: '',
    label: 'Kod dostępu — pusty',
  },
  {
    id: 'component-code-partial',
    initialValue: '123',
    label: 'Kod dostępu — częściowy',
  },
  {
    id: 'component-code-complete',
    initialValue: '123456',
    label: 'Kod dostępu — kompletny',
  },
  {
    errorMessage:
      'Kod jest nieprawidłowy. Sprawdź wpisane cyfry i spróbuj ponownie.',
    id: 'component-code-invalid',
    initialValue: '',
    invalid: true,
    label: 'Kod dostępu — błędny',
  },
  {
    disabled: true,
    id: 'component-code-disabled',
    initialValue: '123456',
    label: 'Kod dostępu — nieaktywny',
  },
];
