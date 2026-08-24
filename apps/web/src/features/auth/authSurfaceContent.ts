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
): AuthSurfaceCopy {
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
): AuthStatePanel | null {
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
