import type {
  PapaDataRuntimeLocale,
} from '../../design-system/foundations/runtime';
import type {
  AuthSurfaceMode,
  AuthSurfaceState,
} from './AuthSurface';

export type AuthSurfaceCopy = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly scopeNote: string;
};

export type AuthStatePanelTone =
  | 'info'
  | 'success'
  | 'warning'
  | 'critical';

export type AuthStatePanel = {
  readonly actionLabel?: string;
  readonly body: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly tone: AuthStatePanelTone;
};

export function resolveAuthSurfaceCopy(
  mode: AuthSurfaceMode,
  state: AuthSurfaceState,
  isResetFlow: boolean,
  locale: PapaDataRuntimeLocale = 'pl',
): AuthSurfaceCopy {
  if (locale === 'en') {
    return resolveAuthSurfaceCopyEn(mode, state, isResetFlow);
  }

  if (state === 'blocked') {
    return {
      description: 'Nie możemy teraz przyznać dostępu. Ze względów bezpieczeństwa nie pokazujemy szczegółów reguły, która zatrzymała proces.',
      eyebrow: 'Bezpieczeństwo dostępu',
      scopeNote: 'Skorzystaj wyłącznie z bezpiecznej ścieżki odzyskania dostępu lub pomocy.',
      title: 'Dostęp wymaga dodatkowej weryfikacji',
    };
  }

  if (state === 'serviceUnavailable') {
    return {
      description: 'Nie możemy teraz potwierdzić dostępu. Problem dotyczy dostępności usługi, a nie poprawności Twoich danych.',
      eyebrow: 'Dostępność usługi',
      scopeNote: 'Wprowadzone dane niesekretne pozostają bez zmian. Spróbuj ponownie, gdy usługa będzie dostępna.',
      title: 'Nie możemy teraz sprawdzić dostępu',
    };
  }

  if (state === 'applicationReady') {
    return {
      description: 'Tożsamość i kontekst dostępu zostały potwierdzone. Możesz przejść do właściwego obszaru roboczego.',
      eyebrow: 'Dostęp potwierdzony',
      scopeNote: 'Przejście do aplikacji zachowuje rozpoznany kontekst organizacji i workspace.',
      title: 'Wszystko gotowe',
    };
  }

  if (state === 'registrationCompleted') {
    return {
      description: 'Konto zostało przygotowane. Kolejny krok zależy od wymaganej weryfikacji i kontekstu dostępu.',
      eyebrow: 'Rejestracja',
      scopeNote: 'Dalsze kroki są dobierane zgodnie z wymaganiami bezpieczeństwa i dostępem do organizacji.',
      title: 'Konto zostało utworzone',
    };
  }

  if (state === 'loggedOut') {
    return {
      description: 'Sesja została bezpiecznie zakończona na tym urządzeniu.',
      eyebrow: 'Wylogowano',
      scopeNote: '',
      title: 'Zostałeś wylogowany',
    };
  }

  if (mode === 'entry') {
    return {
      description: 'Zaloguj się lub utwórz konto, aby przejść do właściwego obszaru roboczego PapaData.',
      eyebrow: 'Bezpieczny dostęp',
      scopeNote: 'Neutralne komunikaty chronią prywatność kont i organizacji.',
      title: 'Witaj w PapaData',
    };
  }

  if (mode === 'login') {
    return {
      description: 'Podaj dane logowania. Jeżeli organizacja wymaga dodatkowej weryfikacji, poprosimy o nią w kolejnym kroku.',
      eyebrow: 'Logowanie',
      scopeNote: '',
      title: 'Zaloguj się',
    };
  }

  if (mode === 'register') {
    return {
      description: 'Wybierz sposób utworzenia konta i podaj tylko dane potrzebne na tym etapie.',
      eyebrow: 'Rejestracja',
      scopeNote: 'Identyfikacja firmy, zgody i wybór workspace pozostają osobnymi krokami.',
      title: 'Utwórz konto',
    };
  }

  if (mode === 'mfa') {
    return {
      description: 'Potwierdź logowanie kodem z aplikacji uwierzytelniającej. Liczba prób jest ograniczona.',
      eyebrow: 'Weryfikacja dwuetapowa',
      scopeNote: '',
      title: 'Potwierdź logowanie',
    };
  }

  if (mode === 'accept-invite') {
    return {
      description: 'Zostałeś zaproszony do zespołu w PapaData. Ustaw hasło, aby dołączyć.',
      eyebrow: 'Zaproszenie',
      scopeNote: 'Dołączasz do istniejącej organizacji i workspace — nie tworzysz nowego konta firmowego.',
      title: 'Dołącz do zespołu',
    };
  }

  if (mode === 'reauth') {
    return {
      description: 'Ta czynność wymaga świeżego potwierdzenia tożsamości. Wpisz aktualny kod z aplikacji uwierzytelniającej.',
      eyebrow: 'Ponowne uwierzytelnienie',
      scopeNote: 'Kontekst organizacji i workspace pozostaje bez zmian — potwierdzasz wyłącznie tożsamość.',
      title: 'Potwierdź to jeszcze raz',
    };
  }

  if (mode === 'workspace') {
    return {
      description: 'Masz dostęp do więcej niż jednej organizacji. Wybierz, w którym obszarze roboczym chcesz teraz pracować.',
      eyebrow: 'Wybór obszaru roboczego',
      scopeNote: 'Wybór możesz później zmienić w dowolnym momencie w aplikacji.',
      title: 'Wybierz organizację',
    };
  }

  return isResetFlow
    ? {
      description: 'Ustaw nowe hasło po otwarciu prawidłowego linku odzyskiwania. Nowe hasło powinno być unikalne dla PapaData.',
      eyebrow: 'Nowe hasło',
      scopeNote: 'Po zmianie hasła wcześniejsze sesje mogą zostać zakończone.',
      title: 'Ustaw nowe hasło',
    }
    : {
      description: 'Podaj adres e-mail używany do logowania. Odpowiedź nie potwierdzi, czy konto o tym adresie istnieje.',
      eyebrow: 'Odzyskiwanie dostępu',
      scopeNote: '',
      title: 'Odzyskaj dostęp',
    };
}

export function resolveAuthStatePanel(
  mode: AuthSurfaceMode,
  state: AuthSurfaceState,
  isResetFlow: boolean,
  locale: PapaDataRuntimeLocale = 'pl',
): AuthStatePanel | null {
  if (locale === 'en') {
    return resolveAuthStatePanelEn(mode, state, isResetFlow);
  }

  if (state === 'validationError') {
    return {
      body: 'Sprawdź oznaczone pola. Wprowadzone wartości pozostają w formularzu, a fokus przechodzi do pierwszego błędu.',
      eyebrow: 'Sprawdź dane',
      title: 'Niektóre dane wymagają korekty',
      tone: 'warning',
    };
  }

  if (state === 'rateLimited') {
    return {
      actionLabel: 'Kolejna próba będzie możliwa po zakończeniu blokady czasowej.',
      body: 'Osiągnięto limit prób. Nie wysyłaj kolejnych żądań, dopóki blokada czasowa nie wygaśnie.',
      eyebrow: 'Ochrona przed nadużyciami',
      title: 'Potrzebna jest krótka przerwa',
      tone: 'warning',
    };
  }

  if (state === 'blocked') {
    return {
      actionLabel: 'Skorzystaj z odzyskiwania dostępu lub pomocy administratora.',
      body: 'Dostęp został zatrzymany przez politykę bezpieczeństwa. Nie pokazujemy szczegółów, które mogłyby ujawnić informacje o koncie lub organizacji.',
      eyebrow: 'Bezpieczeństwo',
      title: 'Dostęp jest zablokowany',
      tone: 'critical',
    };
  }

  if (state === 'serviceUnavailable') {
    return {
      actionLabel: 'Spróbuj ponownie, gdy usługa będzie dostępna.',
      body: 'Nie udało się teraz potwierdzić dostępu. Nie oznacza to problemu z kontem ani danymi logowania.',
      eyebrow: 'Dostępność usługi',
      title: 'Usługa dostępu jest chwilowo niedostępna',
      tone: 'critical',
    };
  }

  if (state === 'recoverySent') {
    return {
      body: 'Jeżeli konto kwalifikuje się do odzyskania dostępu, instrukcja została wysłana na podany adres.',
      eyebrow: 'Instrukcja wysłana',
      title: 'Sprawdź skrzynkę e-mail',
      tone: 'success',
    };
  }

  if (state === 'registrationCompleted') {
    return {
      body: 'Konto zostało przygotowane. Następny krok zostanie dobrany na podstawie wymaganej weryfikacji i dostępnego kontekstu.',
      eyebrow: 'Rejestracja zakończona',
      title: 'Konto jest gotowe',
      tone: 'success',
    };
  }

  if (state === 'applicationReady') {
    return {
      actionLabel: 'Możesz przejść do aplikacji.',
      body: 'Sesja oraz wymagany kontekst dostępu zostały potwierdzone.',
      eyebrow: 'Dostęp potwierdzony',
      title: 'Możesz kontynuować',
      tone: 'success',
    };
  }

  if (state === 'mfaEnrollmentRequired') {
    return {
      body: 'Polityka bezpieczeństwa wymaga skonfigurowania dodatkowej metody uwierzytelniania przed dalszym dostępem.',
      eyebrow: 'Dodatkowe zabezpieczenie',
      title: 'Wymagana jest konfiguracja MFA',
      tone: 'info',
    };
  }

  if (state === 'loggedOut') {
    return {
      actionLabel: 'Przejdź do logowania',
      body: 'Sesja i lokalne dane dostępu zostały wyczyszczone na tym urządzeniu.',
      eyebrow: 'Wylogowano',
      title: 'Do zobaczenia',
      tone: 'success',
    };
  }

  if (mode === 'reauth') {
    return {
      body: 'Ta czynność wymaga świeżego potwierdzenia — wpisz aktualny kod, nawet jeśli logowałeś się niedawno. Po kilku nieudanych próbach dalsza weryfikacja może zostać czasowo zablokowana.',
      eyebrow: 'Wymagane potwierdzenie',
      title: 'Świeży dowód tożsamości',
      tone: 'info',
    };
  }

  if (mode === 'workspace') {
    return {
      body: 'Twoje konto należy do więcej niż jednej organizacji. Wybór decyduje, którego kontekstu (danych, integracji, uprawnień) użyjemy w tej sesji.',
      eyebrow: 'Kilka organizacji',
      title: 'Kontynuuj we właściwym kontekście',
      tone: 'info',
    };
  }

  if (mode === 'mfa') {
    return {
      body: 'Wprowadź aktualny sześciocyfrowy kod. Po kilku nieudanych próbach dalsza weryfikacja może zostać czasowo zablokowana.',
      eyebrow: 'Weryfikacja',
      title: 'Kod bezpieczeństwa',
      tone: 'info',
    };
  }

  if (mode === 'recover' && isResetFlow) {
    return {
      body: 'Link odzyskiwania został rozpoznany. Ustaw i potwierdź nowe hasło, aby zakończyć ten etap.',
      eyebrow: 'Odzyskiwanie dostępu',
      title: 'Utwórz nowe hasło',
      tone: 'info',
    };
  }

  return null;
}

function resolveAuthSurfaceCopyEn(
  mode: AuthSurfaceMode,
  state: AuthSurfaceState,
  isResetFlow: boolean,
): AuthSurfaceCopy {
  if (state === 'blocked') {
    return {
      description: 'We cannot grant access right now. For security reasons, we do not expose the policy details that stopped the process.',
      eyebrow: 'Access security',
      scopeNote: 'Use only the secure recovery path or administrator support.',
      title: 'Access needs additional verification',
    };
  }

  if (state === 'serviceUnavailable') {
    return {
      description: 'We cannot verify access right now. This is a service availability issue, not a problem with your credentials.',
      eyebrow: 'Service availability',
      scopeNote: 'Non-secret data stays in place. Try again when the service is available.',
      title: 'We cannot check access right now',
    };
  }

  if (state === 'applicationReady') {
    return {
      description: 'Identity and access context are confirmed. You can continue to the right workspace.',
      eyebrow: 'Access confirmed',
      scopeNote: 'Continuing keeps the recognized organization and workspace context.',
      title: 'Everything is ready',
    };
  }

  if (state === 'registrationCompleted') {
    return {
      description: 'The account has been prepared. The next step depends on required verification and access context.',
      eyebrow: 'Registration',
      scopeNote: 'Next steps follow security requirements and organization access.',
      title: 'Account created',
    };
  }

  if (state === 'loggedOut') {
    return {
      description: 'The session has been safely ended on this device.',
      eyebrow: 'Signed out',
      scopeNote: '',
      title: 'You have been signed out',
    };
  }

  if (mode === 'entry') {
    return {
      description: 'Sign in or create an account to continue to the right PapaData workspace.',
      eyebrow: 'Secure access',
      scopeNote: 'Neutral messages protect account and organization privacy.',
      title: 'Welcome to PapaData',
    };
  }

  if (mode === 'login') {
    return {
      description: 'Enter your credentials. If your organization requires additional verification, we will ask for it in the next step.',
      eyebrow: 'Sign in',
      scopeNote: '',
      title: 'Sign in',
    };
  }

  if (mode === 'register') {
    return {
      description: 'Choose how to create an account and provide only the data needed at this stage.',
      eyebrow: 'Registration',
      scopeNote: 'Company identification, consents, and workspace selection remain separate steps.',
      title: 'Create account',
    };
  }

  if (mode === 'mfa') {
    return {
      description: 'Confirm sign-in with a code from your authenticator app. The number of attempts is limited.',
      eyebrow: 'Two-step verification',
      scopeNote: '',
      title: 'Confirm sign-in',
    };
  }

  if (mode === 'accept-invite') {
    return {
      description: 'You have been invited to a PapaData team. Set a password to join.',
      eyebrow: 'Invitation',
      scopeNote: 'You are joining an existing organization and workspace, not creating a new company account.',
      title: 'Join the team',
    };
  }

  if (mode === 'reauth') {
    return {
      description: 'This action needs a fresh identity confirmation. Enter the current code from your authenticator app.',
      eyebrow: 'Re-authentication',
      scopeNote: 'The organization and workspace context stays unchanged. You only confirm your identity.',
      title: 'Confirm this again',
    };
  }

  if (mode === 'workspace') {
    return {
      description: 'You have access to more than one organization. Choose the workspace you want to use now.',
      eyebrow: 'Workspace selection',
      scopeNote: 'You can change this choice later in the application.',
      title: 'Choose organization',
    };
  }

  return isResetFlow
    ? {
      description: 'Set a new password after opening a valid recovery link. The new password should be unique to PapaData.',
      eyebrow: 'New password',
      scopeNote: 'After the password change, previous sessions may be ended.',
      title: 'Set a new password',
    }
    : {
      description: 'Enter the e-mail address used for sign-in. The response will not confirm whether an account exists.',
      eyebrow: 'Access recovery',
      scopeNote: '',
      title: 'Recover access',
    };
}

function resolveAuthStatePanelEn(
  mode: AuthSurfaceMode,
  state: AuthSurfaceState,
  isResetFlow: boolean,
): AuthStatePanel | null {
  if (state === 'validationError') {
    return {
      body: 'Check the highlighted fields. Entered values stay in the form and focus moves to the first error.',
      eyebrow: 'Check details',
      title: 'Some details need correction',
      tone: 'warning',
    };
  }

  if (state === 'rateLimited') {
    return {
      actionLabel: 'Another attempt will be available after the temporary block ends.',
      body: 'The attempt limit has been reached. Do not send more requests until the temporary block expires.',
      eyebrow: 'Abuse protection',
      title: 'A short pause is required',
      tone: 'warning',
    };
  }

  if (state === 'blocked') {
    return {
      actionLabel: 'Use access recovery or administrator support.',
      body: 'Access was stopped by a security policy. We do not show details that could reveal account or organization information.',
      eyebrow: 'Security',
      title: 'Access is blocked',
      tone: 'critical',
    };
  }

  if (state === 'serviceUnavailable') {
    return {
      actionLabel: 'Try again when the service is available.',
      body: 'Access could not be verified right now. This does not mean there is a problem with your account or credentials.',
      eyebrow: 'Service availability',
      title: 'The access service is temporarily unavailable',
      tone: 'critical',
    };
  }

  if (state === 'recoverySent') {
    return {
      body: 'If the account qualifies for recovery, instructions have been sent to the provided address.',
      eyebrow: 'Instructions sent',
      title: 'Check your inbox',
      tone: 'success',
    };
  }

  if (state === 'registrationCompleted') {
    return {
      body: 'The account has been prepared. The next step will be selected based on required verification and available context.',
      eyebrow: 'Registration completed',
      title: 'The account is ready',
      tone: 'success',
    };
  }

  if (state === 'applicationReady') {
    return {
      actionLabel: 'You can continue to the application.',
      body: 'The session and required access context have been confirmed.',
      eyebrow: 'Access confirmed',
      title: 'You can continue',
      tone: 'success',
    };
  }

  if (state === 'mfaEnrollmentRequired') {
    return {
      body: 'Security policy requires configuring an additional authentication method before access continues.',
      eyebrow: 'Additional security',
      title: 'MFA setup is required',
      tone: 'info',
    };
  }

  if (state === 'loggedOut') {
    return {
      actionLabel: 'Go to sign in',
      body: 'The session and local access data have been cleared on this device.',
      eyebrow: 'Signed out',
      title: 'See you soon',
      tone: 'success',
    };
  }

  if (mode === 'reauth') {
    return {
      body: 'This action needs a fresh confirmation. Enter the current code even if you signed in recently. After several failed attempts, verification may be temporarily blocked.',
      eyebrow: 'Confirmation required',
      title: 'Fresh proof of identity',
      tone: 'info',
    };
  }

  if (mode === 'workspace') {
    return {
      body: 'Your account belongs to more than one organization. The choice decides which context, data, integrations, and permissions are used in this session.',
      eyebrow: 'Multiple organizations',
      title: 'Continue in the right context',
      tone: 'info',
    };
  }

  if (mode === 'mfa') {
    return {
      body: 'Enter the current six-digit code. After several failed attempts, verification may be temporarily blocked.',
      eyebrow: 'Verification',
      title: 'Security code',
      tone: 'info',
    };
  }

  if (mode === 'recover' && isResetFlow) {
    return {
      body: 'The recovery link has been recognized. Set and confirm a new password to finish this step.',
      eyebrow: 'Access recovery',
      title: 'Create a new password',
      tone: 'info',
    };
  }

  return null;
}
