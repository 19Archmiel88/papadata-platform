import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CircleAlert,
  Clock3,
  Eye,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  Mail,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sun,
  User,
  UserRoundCheck,
  Waypoints,
} from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { PapaDataBrand } from '../shared/PapaDataBrand';
import { VerificationCodeInput } from './VerificationCodeInput';
import '../foundations/papadata-brand-surface.css';
import './papadata-auth.css';

type AuthScreen =
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

type PapaDataLanguage = 'pl' | 'en';
type PapaDataTheme = 'light' | 'dark';
type LoginState =
  | 'default'
  | 'submitting'
  | 'invalidCredentials'
  | 'providerUnavailable';
type VerificationKind = 'emailVerification' | 'mfa';
type VerificationCodeState =
  | 'idle'
  | 'incomplete'
  | 'submitting'
  | 'invalid'
  | 'expired'
  | 'resent'
  | 'cooldown'
  | 'success';

type AuthStoryProps = {
  initialLoginState?: LoginState;
  initialScreen: AuthScreen;
  initialTheme: PapaDataTheme;
  initialVerificationState?: VerificationCodeState;
};
type EmailVerificationCopyMode = 'standard' | 'neutral';
type GoToOptions = {
  emailVerificationCopyMode?: EmailVerificationCopyMode;
};
type GoTo = (screen: AuthScreen, options?: GoToOptions) => void;

type FieldProps = {
  ariaDescribedBy?: string;
  autoComplete?: string;
  defaultValue?: string;
  disabled?: boolean;
  helper?: string;
  icon: ReactNode;
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
};

type ScreenCopy = {
  eyebrow: string;
  title: string;
  summary: string;
  visualTitle: string;
  visualText: string;
  status: string;
};

const screenCopy: Record<AuthScreen, ScreenCopy> = {
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

const progressSteps = [
  {
    key: 'entry',
    label: 'Konto',
    icon: User,
  },
  {
    key: 'verification',
    label: 'Weryfikacja',
    icon: Fingerprint,
  },
  {
    key: 'complete',
    label: 'Dostęp',
    icon: Waypoints,
  },
] as const;

function getProgressIndex(screen: AuthScreen): number {
  if (
    screen === 'verification' ||
    screen === 'emailVerification' ||
    screen === 'mfa' ||
    screen === 'recovery' ||
    screen === 'reauthentication'
  ) {
    return 1;
  }

  if (
    screen === 'complete' ||
    screen === 'signedOut' ||
    screen === 'authUnavailable' ||
    screen === 'accessBlocked' ||
    screen === 'accessResolution'
  ) {
    return 2;
  }

  return 0;
}

const verificationCodeLength = 6;
const verificationCooldownSeconds = 60;
const staticCooldownSeconds = 42;

const verificationCodeCopy: Record<
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

function getInitialVerificationCode(
  state: VerificationCodeState,
): string {
  if (state === 'incomplete') {
    return '123';
  }

  if (state === 'submitting' || state === 'success') {
    return '123456';
  }

  if (state === 'expired') {
    return '999999';
  }

  return '';
}

function formatCooldown(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const remainingSeconds = (safeSeconds % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
}

function AuthStorySurface(props: AuthStoryProps) {
  const resetKey = `${props.initialScreen}-${props.initialTheme}-${props.initialLoginState ?? 'default'}-${props.initialVerificationState ?? 'idle'}`;

  return <AuthStorySurfaceState key={resetKey} {...props} />;
}

function AuthStorySurfaceState({
  initialLoginState = 'default',
  initialScreen,
  initialTheme,
  initialVerificationState = 'idle',
}: AuthStoryProps) {
  const [screen, setScreen] = useState<AuthScreen>(initialScreen);
  const [loginState, setLoginState] =
    useState<LoginState>(initialLoginState);
  const [language, setLanguage] = useState<PapaDataLanguage>('pl');
  const [theme, setTheme] = useState<PapaDataTheme>(initialTheme);
  const [showPassword, setShowPassword] = useState(false);
  const [emailVerificationCopyMode, setEmailVerificationCopyMode] =
    useState<EmailVerificationCopyMode>('standard');
  const [verificationCode, setVerificationCode] = useState(() =>
    getInitialVerificationCode(initialVerificationState),
  );

  const copy = screenCopy[screen];
  const progressIndex = getProgressIndex(screen);
  const nextLanguage: PapaDataLanguage =
    language === 'pl' ? 'en' : 'pl';
  const nextTheme: PapaDataTheme =
    theme === 'dark' ? 'light' : 'dark';
  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  const languageLabel =
    language === 'pl'
      ? 'Zmień język na angielski'
      : 'Zmień język na polski';

  const themeLabel =
    theme === 'dark'
      ? 'Przełącz na motyw jasny'
      : 'Przełącz na motyw ciemny';

  const goTo: GoTo = (nextScreen, options) => {
    setVerificationCode('');
    setEmailVerificationCopyMode(
      options?.emailVerificationCopyMode ?? 'standard',
    );
    setLoginState('default');
    setShowPassword(false);
    setScreen(nextScreen);
  };

  return (
    <div
      className={`pds-brand-surface pda-auth-shell${
        screen === 'login' ? ' pda-auth-surface--login' : ''
      }`}
      data-login-state={screen === 'login' ? loginState : undefined}
      data-screen={screen}
      data-theme={theme}
      lang={language}
    >
      <header className="pds-topbar" aria-label="PapaData">
        <div className="pds-topbar__inner">
          <PapaDataBrand />

          <div
            className="pds-preferences"
            aria-label="Ustawienia widoku"
          >
            <button
              aria-label={languageLabel}
              className="pds-preferences__button pds-preferences__button--language"
              onClick={() => setLanguage(nextLanguage)}
              title={languageLabel}
              type="button"
            >
              <span
                className="pds-language-switch"
                aria-hidden="true"
              >
                <span
                  className={
                    language === 'pl'
                      ? 'pds-language-switch__option is-active'
                      : 'pds-language-switch__option'
                  }
                >
                  PL
                </span>

                <span className="pds-language-switch__separator">
                  /
                </span>

                <span
                  className={
                    language === 'en'
                      ? 'pds-language-switch__option is-active'
                      : 'pds-language-switch__option'
                  }
                >
                  EN
                </span>
              </span>
            </button>

            <button
              aria-label={themeLabel}
              aria-pressed={theme === 'dark'}
              className="pds-preferences__button pds-preferences__button--theme"
              onClick={() => setTheme(nextTheme)}
              title={themeLabel}
              type="button"
            >
              <ThemeIcon
                aria-hidden="true"
                size={18}
                strokeWidth={1.75}
              />
            </button>
          </div>
        </div>
      </header>

      {screen === 'login' ? (
        <LoginView
          goTo={goTo}
          loginState={loginState}
          setShowPassword={setShowPassword}
          showPassword={showPassword}
        />
      ) : (
        <main className="pda-auth-main">
          <section
            className="pda-auth-context"
            aria-labelledby="pda-auth-title"
          >
            <div className="pda-auth-context__copy">
              <span className="pda-auth-kicker">
                {copy.eyebrow}
              </span>

              <h1 id="pda-auth-title">{copy.title}</h1>

              <p>{copy.summary}</p>
            </div>

            <AccessVisual copy={copy} progressIndex={progressIndex} />

            <div className="pda-auth-context__status">
              <span
                className="pda-auth-context__pulse"
                aria-hidden="true"
              />

              <span>
                <strong>Stan procesu</strong>
                <span>{copy.status}</span>
              </span>
            </div>
          </section>

          <section
            className="pda-auth-workspace"
            aria-label="Formularz dostępu"
          >
            <AuthProgress currentIndex={progressIndex} />

            <div className="pda-auth-screen" key={screen}>
              <AuthScreenRenderer
                emailVerificationCopyMode={emailVerificationCopyMode}
                goTo={goTo}
                initialVerificationState={initialVerificationState}
                loginState={loginState}
                screen={screen}
                setVerificationCode={setVerificationCode}
                setShowPassword={setShowPassword}
                showPassword={showPassword}
                verificationCode={verificationCode}
              />
            </div>

            <div className="pda-auth-privacy">
              <ShieldCheck
                aria-hidden="true"
                size={16}
                strokeWidth={1.8}
              />
              <span>
                Komunikaty nie ujawniają stanu konta, dostawcy ani
                uprawnień.
              </span>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

function LoginView({
  goTo,
  loginState,
  setShowPassword,
  showPassword,
}: {
  goTo: (screen: AuthScreen) => void;
  loginState: LoginState;
  setShowPassword: (showPassword: boolean) => void;
  showPassword: boolean;
}) {
  return (
    <main className="pda-login-main">
      <LoginBackgroundLines />

      <section
        className="pda-login-panel"
        aria-labelledby="pda-login-title"
      >
        <header className="pda-login-heading">
          <h1 id="pda-login-title">Zaloguj się do PapaData</h1>
          <p>Użyj służbowego adresu e-mail lub konta firmowego.</p>
        </header>

        <div className="pda-auth-screen" key={`login-${loginState}`}>
          <LoginForm
            goTo={goTo}
            loginState={loginState}
            setShowPassword={setShowPassword}
            showPassword={showPassword}
          />
        </div>

        <button
          className="pda-login-registration"
          onClick={() => goTo('register')}
          type="button"
        >
          Nie masz konta? <span>Zarejestruj się</span>
        </button>

        <p className="pda-login-terms">
          Kontynuując, akceptujesz nasz{' '}
          <a href="#regulamin" onClick={(event) => event.preventDefault()}>
            Regulamin
          </a>{' '}
          oraz{' '}
          <a
            href="#polityka-prywatnosci"
            onClick={(event) => event.preventDefault()}
          >
            Politykę prywatności
          </a>.
        </p>
      </section>
    </main>
  );
}

function LoginBackgroundLines() {
  return (
    <div className="pda-login-waves" aria-hidden="true">
      <svg
        className="pda-login-waves__group pda-login-waves__group--left"
        preserveAspectRatio="none"
        viewBox="0 0 460 120"
      >
        <path
          className="pda-login-wave pda-login-wave--blue"
          d="M0 66 C95 18 185 20 270 62 C340 96 398 76 460 48"
        />
        <path
          className="pda-login-wave pda-login-wave--cyan"
          d="M0 72 C110 42 185 92 286 66 C356 48 400 38 460 55"
        />
        <path
          className="pda-login-wave pda-login-wave--teal"
          d="M0 56 C118 102 212 98 310 48 C370 18 415 30 460 50"
        />
      </svg>

      <svg
        className="pda-login-waves__group pda-login-waves__group--right"
        preserveAspectRatio="none"
        viewBox="0 0 460 120"
      >
        <path
          className="pda-login-wave pda-login-wave--blue"
          d="M0 66 C95 18 185 20 270 62 C340 96 398 76 460 48"
        />
        <path
          className="pda-login-wave pda-login-wave--cyan"
          d="M0 72 C110 42 185 92 286 66 C356 48 400 38 460 55"
        />
        <path
          className="pda-login-wave pda-login-wave--teal"
          d="M0 56 C118 102 212 98 310 48 C370 18 415 30 460 50"
        />
      </svg>
    </div>
  );
}

function AuthProgress({
  currentIndex,
}: {
  currentIndex: number;
}) {
  return (
    <ol
      className="pda-auth-progress"
      aria-label="Postęp procesu dostępu"
    >
      {progressSteps.map((step, index) => {
        const StepIcon = step.icon;
        const state =
          index < currentIndex
            ? 'is-complete'
            : index === currentIndex
              ? 'is-active'
              : undefined;

        return (
          <li className={state} key={step.key}>
            <span className="pda-auth-progress__node">
              {index < currentIndex ? (
                <Check
                  aria-hidden="true"
                  size={14}
                  strokeWidth={2.2}
                />
              ) : (
                <StepIcon
                  aria-hidden="true"
                  size={15}
                  strokeWidth={1.8}
                />
              )}
            </span>

            <span className="pda-auth-progress__label">
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function AccessVisual({
  copy,
  progressIndex,
}: {
  copy: ScreenCopy;
  progressIndex: number;
}) {
  return (
    <div className="pda-access-visual" aria-hidden="true">
      <svg
        className="pda-access-network"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 520 340"
      >
        <path
          className="pda-access-network__track pda-access-network__track--entry"
          d="M62 174 C148 174 174 190 242 181"
        />
        <path
          className="pda-access-network__track pda-access-network__track--verification"
          d="M460 72 C383 72 350 124 278 163"
        />
        <path
          className="pda-access-network__track pda-access-network__track--workspace"
          d="M460 270 C380 270 346 226 278 191"
        />

        <path
          className="pda-access-network__signal pda-access-network__signal--entry"
          d="M62 174 C148 174 174 190 242 181"
          pathLength="1"
        />
        <path
          className="pda-access-network__signal pda-access-network__signal--verification"
          d="M460 72 C383 72 350 124 278 163"
          pathLength="1"
        />
        <path
          className="pda-access-network__signal pda-access-network__signal--workspace"
          d="M460 270 C380 270 346 226 278 191"
          pathLength="1"
        />
      </svg>

      <span className="pda-access-visual__orbit pda-access-visual__orbit--outer" />
      <span className="pda-access-visual__orbit pda-access-visual__orbit--inner" />

      <AccessNode
        icon={<UserRoundCheck size={19} strokeWidth={1.7} />}
        label="Konto"
        position="entry"
        state={
          progressIndex > 0
            ? 'complete'
            : progressIndex === 0
              ? 'active'
              : 'idle'
        }
      />

      <AccessNode
        icon={<Fingerprint size={20} strokeWidth={1.7} />}
        label="Sygnał"
        position="verification"
        state={
          progressIndex > 1
            ? 'complete'
            : progressIndex === 1
              ? 'active'
              : 'idle'
        }
      />

      <AccessNode
        icon={<Waypoints size={20} strokeWidth={1.7} />}
        label="Workspace"
        position="workspace"
        state={progressIndex === 2 ? 'active' : 'idle'}
      />

      <div className="pda-access-visual__core">
        <span className="pda-access-visual__core-ring" />
        <ShieldCheck size={28} strokeWidth={1.55} />
      </div>

      <div className="pda-access-visual__readout">
        <span className="pda-access-visual__readout-label">
          {copy.visualTitle}
        </span>
        <span>{copy.visualText}</span>
      </div>
    </div>
  );
}

function AccessNode({
  icon,
  label,
  position,
  state,
}: {
  icon: ReactNode;
  label: string;
  position: 'entry' | 'verification' | 'workspace';
  state: 'active' | 'complete' | 'idle';
}) {
  return (
    <div
      className={`pda-access-node pda-access-node--${position} is-${state}`}
    >
      <span>{state === 'complete' ? <Check size={17} /> : icon}</span>
      <small>{label}</small>
    </div>
  );
}

function AuthScreenRenderer({
  emailVerificationCopyMode,
  goTo,
  initialVerificationState,
  loginState,
  screen,
  setVerificationCode,
  setShowPassword,
  showPassword,
  verificationCode,
}: {
  emailVerificationCopyMode: EmailVerificationCopyMode;
  goTo: GoTo;
  initialVerificationState: VerificationCodeState;
  loginState: LoginState;
  screen: AuthScreen;
  setVerificationCode: (code: string) => void;
  setShowPassword: (showPassword: boolean) => void;
  showPassword: boolean;
  verificationCode: string;
}) {
  if (screen === 'register') {
    return (
      <RegisterForm
        goTo={goTo}
        setShowPassword={setShowPassword}
        showPassword={showPassword}
      />
    );
  }

  if (
    screen === 'emailVerification' ||
    screen === 'mfa' ||
    screen === 'verification'
  ) {
    return (
      <VerificationCodeForm
        code={verificationCode}
        emailVerificationCopyMode={emailVerificationCopyMode}
        goTo={goTo}
        initialState={initialVerificationState}
        kind={screen === 'mfa' ? 'mfa' : 'emailVerification'}
        setCode={setVerificationCode}
      />
    );
  }

  if (screen === 'recovery') {
    return <RecoveryForm goTo={goTo} />;
  }

  if (screen === 'invitation') {
    return <InvitationForm goTo={goTo} />;
  }

  if (screen === 'signedOut') {
    return <SignedOutState goTo={goTo} />;
  }

  if (screen === 'authUnavailable') {
    return <AuthUnavailableState goTo={goTo} />;
  }

  if (screen === 'accessBlocked') {
    return <AccessBlockedState goTo={goTo} />;
  }

  if (screen === 'reauthentication') {
    return (
      <ReauthenticationForm
        goTo={goTo}
        setShowPassword={setShowPassword}
        showPassword={showPassword}
      />
    );
  }

  if (screen === 'accessResolution') {
    return <AccessResolutionState goTo={goTo} />;
  }

  if (screen === 'complete') {
    return <CompleteState goTo={goTo} />;
  }

  return (
    <LoginForm
      goTo={goTo}
      loginState={loginState}
      setShowPassword={setShowPassword}
      showPassword={showPassword}
    />
  );
}

function LoginForm({
  goTo,
  loginState,
  setShowPassword,
  showPassword,
}: {
  goTo: (screen: AuthScreen) => void;
  loginState: LoginState;
  setShowPassword: (showPassword: boolean) => void;
  showPassword: boolean;
}) {
  const isInvalid = loginState === 'invalidCredentials';
  const isProviderUnavailable = loginState === 'providerUnavailable';
  const isSubmitting = loginState === 'submitting';
  const messageId =
    isInvalid || isProviderUnavailable ? 'login-status-message' : undefined;

  return (
    <form
      aria-busy={isSubmitting}
      aria-describedby={messageId}
      className="pda-login-form"
      onSubmit={(event) => {
        event.preventDefault();

        if (!isSubmitting) {
          goTo('mfa');
        }
      }}
    >
      {isInvalid ? (
        <div
          className="pda-login-alert pda-login-alert--error"
          id="login-status-message"
          role="alert"
        >
          <CircleAlert aria-hidden="true" size={17} strokeWidth={1.8} />
          <span>
            Nie udało się zalogować. Sprawdź dane lub odzyskaj dostęp.
          </span>
        </div>
      ) : null}

      <div className="pda-login-fields">
        <label className="pda-login-field" htmlFor="login-email">
          <span className="pda-login-field__label">Adres e-mail</span>
          <input
            aria-describedby={isInvalid ? messageId : undefined}
            autoComplete="email"
            className="pda-login-input"
            disabled={isSubmitting}
            id="login-email"
            placeholder="m@example.com"
            required
            type="email"
          />
        </label>

        <div className="pda-login-field">
          <div className="pda-login-field__head">
            <label className="pda-login-field__label" htmlFor="login-password">
              Hasło
            </label>

            <button
              className="pda-login-forgot"
              disabled={isSubmitting}
              onClick={() => goTo('recovery')}
              type="button"
            >
              Nie pamiętam hasła
            </button>
          </div>

          <div className="pda-login-password">
            <input
              aria-describedby={isInvalid ? messageId : undefined}
              autoComplete="current-password"
              className="pda-login-input"
              disabled={isSubmitting}
              id="login-password"
              required
              type={showPassword ? 'text' : 'password'}
            />

            <button
              aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
              className="pda-login-password__toggle"
              disabled={isSubmitting}
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" size={18} strokeWidth={1.8} />
              ) : (
                <Eye aria-hidden="true" size={18} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        className="pda-login-submit"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <RefreshCw
            aria-hidden="true"
            className="pda-login-submit__status"
            size={16}
            strokeWidth={1.8}
          />
        ) : null}
        {isSubmitting ? 'Sprawdzanie dostępu' : 'Zaloguj się'}
      </button>

      <div className="pda-login-divider">
        <span>lub kontynuuj przez</span>
      </div>

      {isProviderUnavailable ? (
        <div
          className="pda-login-alert pda-login-alert--warning"
          id="login-status-message"
          role="status"
        >
          <CircleAlert aria-hidden="true" size={17} strokeWidth={1.8} />
          <span>
            Logowanie przez Microsoft jest chwilowo niedostępne. Użyj
            innej metody.
          </span>
        </div>
      ) : null}

      <div className="pda-login-providers">
        <ProviderButton
          describedBy={isProviderUnavailable ? messageId : undefined}
          disabled={isSubmitting || isProviderUnavailable}
          label="Microsoft"
          onClick={() => goTo('mfa')}
          provider="microsoft"
          unavailable={isProviderUnavailable}
        />

        <ProviderButton
          disabled={isSubmitting}
          label="Google"
          onClick={() => goTo('mfa')}
          provider="google"
        />
      </div>

      <span className="pds-sr-only" role="status" aria-live="polite">
        {isSubmitting ? 'Trwa sprawdzanie dostępu.' : ''}
      </span>
    </form>
  );
}

function RegisterForm({
  goTo,
  setShowPassword,
  showPassword,
}: {
  goTo: (screen: AuthScreen) => void;
  setShowPassword: (showPassword: boolean) => void;
  showPassword: boolean;
}) {
  return (
    <form
      className="pda-auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        goTo('emailVerification');
      }}
    >
      <FormHeader
        eyebrow="Nowa tożsamość"
        title="Konto firmowe"
        text="Podstawowe dane wystarczą do rozpoczęcia weryfikacji."
      />

      <div className="pda-field-grid pda-field-grid--two">
        <AuthField
          autoComplete="name"
          defaultValue="Anna Kowalska"
          icon={<User aria-hidden="true" size={18} strokeWidth={1.8} />}
          id="register-name"
          label="Imię i nazwisko"
          required
        />

        <AuthField
          autoComplete="organization"
          defaultValue="Northstar Retail"
          icon={
            <BriefcaseBusiness
              aria-hidden="true"
              size={18}
              strokeWidth={1.8}
            />
          }
          id="register-company"
          label="Organizacja"
          required
        />
      </div>

      <AuthField
        autoComplete="email"
        defaultValue="anna@northstar.example"
        helper="Użyj domeny przypisanej do organizacji."
        icon={<Mail aria-hidden="true" size={18} strokeWidth={1.8} />}
        id="register-email"
        label="E-mail służbowy"
        required
        type="email"
      />

      <PasswordField
        autoComplete="new-password"
        helper="Reguły hasła pochodzą z polityki workspace."
        id="register-password"
        label="Hasło"
        setShowPassword={setShowPassword}
        showPassword={showPassword}
      />

      <label className="pda-checkbox">
        <input defaultChecked type="checkbox" />
        <span>
          Potwierdzam użycie konta w kontekście służbowym.
        </span>
      </label>

      <div className="pda-form-actions">
        <button
          className="pda-auth-button pda-auth-button--primary"
          type="submit"
        >
          Utwórz i zweryfikuj
          <ArrowRight
            aria-hidden="true"
            size={18}
            strokeWidth={1.9}
          />
        </button>

        <button
          className="pda-auth-link"
          onClick={() => goTo('login')}
          type="button"
        >
          Mam już konto
        </button>
      </div>
    </form>
  );
}

function VerificationCodeForm({
  code,
  emailVerificationCopyMode,
  goTo,
  initialState,
  kind,
  setCode,
}: {
  code: string;
  emailVerificationCopyMode: EmailVerificationCopyMode;
  goTo: GoTo;
  initialState: VerificationCodeState;
  kind: VerificationKind;
  setCode: (code: string) => void;
}) {
  const copy =
    kind === 'emailVerification' &&
    emailVerificationCopyMode === 'neutral'
      ? {
          ...verificationCodeCopy.emailVerification,
          headerText:
            'Jeżeli proces może być kontynuowany, wpisz 6-cyfrowy kod z bieżącej próby.',
          headerTitle: 'Kontynuuj weryfikację',
        }
      : verificationCodeCopy[kind];
  const inputRef = useRef<HTMLInputElement>(null);
  const submitTimerRef = useRef<number | undefined>(undefined);
  const resendTimerRef = useRef<number | undefined>(undefined);
  const [status, setStatus] =
    useState<VerificationCodeState>(initialState);
  const [cooldownRemaining, setCooldownRemaining] = useState(
    initialState === 'cooldown' ? staticCooldownSeconds : 0,
  );
  const [ariaLiveMessage, setAriaLiveMessage] = useState(() => {
    if (initialState === 'submitting') {
      return 'Trwa sprawdzanie kodu.';
    }

    if (initialState === 'invalid') {
      return 'Kod jest nieprawidłowy. Sprawdź wpisane cyfry i spróbuj ponownie.';
    }

    if (initialState === 'expired') {
      return 'Ten kod wygasł. Wyślij nowy kod, aby kontynuować.';
    }

    if (initialState === 'resent') {
      return 'Nowy kod został wysłany.';
    }

    if (initialState === 'success') {
      return 'Kod został potwierdzony.';
    }

    return '';
  });
  const isStaticScenario = initialState !== 'idle';
  const isSubmitting = status === 'submitting';
  const isExpired = status === 'expired';
  const isSuccess = status === 'success';
  const isCooldown = status === 'cooldown';
  const isInvalid = status === 'invalid';
  const isInputDisabled = isSubmitting || isExpired || isSuccess;
  const isCodeComplete = code.length === verificationCodeLength;
  const cooldownLabel = formatCooldown(cooldownRemaining);
  const primaryLabel = isExpired
    ? 'Wyślij nowy kod'
    : isSubmitting
      ? 'Sprawdzanie kodu'
      : isSuccess
        ? 'Kod potwierdzony'
        : copy.submitLabel;
  const resendLabel = isCooldown
    ? `Wyślij ponownie za ${cooldownLabel}`
    : copy.resendLabel;
  const statusMessage =
    status === 'submitting'
      ? 'Sprawdzanie kodu.'
      : status === 'invalid'
        ? 'Kod jest nieprawidłowy. Sprawdź wpisane cyfry i spróbuj ponownie.'
        : status === 'expired'
          ? 'Ten kod wygasł. Wyślij nowy kod, aby kontynuować.'
          : status === 'resent'
            ? 'Nowy kod został wysłany.'
            : status === 'cooldown'
              ? `Wyślij kod ponownie za ${cooldownLabel}.`
              : status === 'success'
                ? 'Kod został potwierdzony.'
                : '';
  const statusTone =
    status === 'invalid'
      ? 'error'
      : status === 'expired'
        ? 'warning'
        : status === 'resent' || status === 'success'
          ? 'success'
          : 'neutral';
  const StatusIcon =
    statusTone === 'error' || statusTone === 'warning'
      ? CircleAlert
      : statusTone === 'success'
        ? BadgeCheck
        : Clock3;

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== undefined) {
        window.clearTimeout(submitTimerRef.current);
      }

      if (resendTimerRef.current !== undefined) {
        window.clearTimeout(resendTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (status !== 'cooldown' || isStaticScenario) {
      return undefined;
    }

    if (cooldownRemaining <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCooldownRemaining((currentValue) => {
        if (currentValue <= 1) {
          setStatus('idle');
          return 0;
        }

        return currentValue - 1;
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldownRemaining, isStaticScenario, status]);

  useEffect(() => {
    if (status === 'invalid' || status === 'resent') {
      inputRef.current?.focus();
    }
  }, [status]);

  const updateStatus = (
    nextStatus: VerificationCodeState,
    nextAriaLiveMessage = '',
  ) => {
    setStatus(nextStatus);
    setAriaLiveMessage(nextAriaLiveMessage);
  };

  const handleCodeChange = (nextCode: string) => {
    setCode(nextCode);

    if (
      status === 'invalid' ||
      status === 'incomplete' ||
      status === 'resent'
    ) {
      updateStatus('idle');
    }
  };

  const sendNewCode = () => {
    if (isSubmitting || isSuccess || isCooldown) {
      return;
    }

    if (resendTimerRef.current !== undefined) {
      window.clearTimeout(resendTimerRef.current);
    }

    setCode('');
    setCooldownRemaining(verificationCooldownSeconds);
    updateStatus('resent', 'Nowy kod został wysłany.');
    window.requestAnimationFrame(() => inputRef.current?.focus());

    if (!isStaticScenario) {
      resendTimerRef.current = window.setTimeout(() => {
        updateStatus('cooldown');
      }, 900);
    }
  };

  const verifyCode = () => {
    if (isExpired) {
      sendNewCode();
      return;
    }

    if (isSubmitting || isSuccess) {
      return;
    }

    if (!isCodeComplete) {
      updateStatus('incomplete');
      inputRef.current?.focus();
      return;
    }

    updateStatus('submitting', 'Trwa sprawdzanie kodu.');

    if (submitTimerRef.current !== undefined) {
      window.clearTimeout(submitTimerRef.current);
    }

    submitTimerRef.current = window.setTimeout(() => {
      if (code === '123456') {
        updateStatus('success', 'Kod został potwierdzony.');
        return;
      }

      if (code === '999999') {
        updateStatus(
          'expired',
          'Ten kod wygasł. Wyślij nowy kod, aby kontynuować.',
        );
        return;
      }

      setCode('');
      updateStatus(
        'invalid',
        'Kod jest nieprawidłowy. Sprawdź wpisane cyfry i spróbuj ponownie.',
      );
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }, 420);
  };

  return (
    <form
      aria-busy={isSubmitting}
      className="pda-auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        verifyCode();
      }}
    >
      <FormHeader
        eyebrow={copy.headerEyebrow}
        title={copy.headerTitle}
        text={copy.headerText}
      />

      <VerificationCodeInput
        ariaLiveMessage={ariaLiveMessage}
        autoFocus
        disabled={isInputDisabled}
        errorMessage={
          isInvalid
            ? 'Kod jest nieprawidłowy. Sprawdź wpisane cyfry i spróbuj ponownie.'
            : undefined
        }
        hint={
          isInvalid || isExpired || isSuccess
            ? undefined
            : 'Wpisz dokładnie sześć cyfr.'
        }
        id={`${kind}-code`}
        invalid={isInvalid}
        label={copy.fieldLabel}
        name={copy.name}
        onChange={handleCodeChange}
        ref={inputRef}
        value={code}
      />

      {statusMessage ? (
        <div
          className={`pda-code-status pda-code-status--${statusTone}`}
          role={statusTone === 'error' ? 'alert' : 'status'}
        >
          <StatusIcon
            aria-hidden="true"
            size={16}
            strokeWidth={1.8}
          />
          <span>{statusMessage}</span>
        </div>
      ) : null}

      <div className="pda-form-actions">
        <button
          className="pda-auth-button pda-auth-button--primary"
          disabled={
            isExpired
              ? false
              : isSubmitting || isSuccess || !isCodeComplete
          }
          type={isExpired ? 'button' : 'submit'}
          onClick={isExpired ? sendNewCode : undefined}
        >
          {isSubmitting ? (
            <RefreshCw
              aria-hidden="true"
              className="pda-login-submit__status"
              size={16}
              strokeWidth={1.8}
            />
          ) : null}
          {primaryLabel}
          {!isSubmitting ? (
            <ArrowRight
              aria-hidden="true"
              size={18}
              strokeWidth={1.9}
            />
          ) : null}
        </button>

        {!isExpired ? (
          <button
            className="pda-auth-button pda-auth-button--secondary"
            disabled={isSubmitting || isCooldown || isSuccess}
            onClick={sendNewCode}
            type="button"
          >
            <RefreshCw
              aria-hidden="true"
              size={17}
              strokeWidth={1.8}
            />
            {resendLabel}
          </button>
        ) : null}

        <button
          className="pda-auth-link"
          disabled={isSubmitting || isSuccess}
          onClick={() => goTo(copy.changeTarget)}
          type="button"
        >
          {copy.changeLabel}
        </button>
      </div>
    </form>
  );
}

function RecoveryForm({
  goTo,
}: {
  goTo: GoTo;
}) {
  return (
    <form
      className="pda-auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        goTo('emailVerification', {
          emailVerificationCopyMode: 'neutral',
        });
      }}
    >
      <FormHeader
        eyebrow="Bezpieczne odzyskiwanie"
        title="Znajdź ścieżkę dostępu"
        text="Odpowiedź pozostanie neutralna niezależnie od wyniku."
      />

      <AuthField
        autoComplete="email"
        defaultValue="anna@northstar.example"
        helper="Jeżeli proces może być kontynuowany, pokażemy kolejny krok."
        icon={<Mail aria-hidden="true" size={18} strokeWidth={1.8} />}
        id="recovery-email"
        label="E-mail służbowy"
        required
        type="email"
      />

      <div className="pda-form-actions">
        <button
          className="pda-auth-button pda-auth-button--primary"
          type="submit"
        >
          Kontynuuj
          <ArrowRight
            aria-hidden="true"
            size={18}
            strokeWidth={1.9}
          />
        </button>

        <button
          className="pda-auth-link"
          onClick={() => goTo('login')}
          type="button"
        >
          Wróć do logowania
        </button>
      </div>
    </form>
  );
}

function InvitationForm({
  goTo,
}: {
  goTo: (screen: AuthScreen) => void;
}) {
  return (
    <form
      className="pda-auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        goTo('emailVerification');
      }}
    >
      <FormHeader
        eyebrow="Zaproszenie do workspace"
        title="Potwierdź adres"
        text="Szczegóły organizacji pozostają ukryte do zakończenia weryfikacji."
      />

      <div className="pda-inline-context">
        <BriefcaseBusiness
          aria-hidden="true"
          size={19}
          strokeWidth={1.7}
        />
        <span>
          <strong>Zaproszenie organizacyjne</strong>
          <span>Identyfikator: INV-NR-2048</span>
        </span>
      </div>

      <AuthField
        autoComplete="email"
        defaultValue="anna@northstar.example"
        icon={<Mail aria-hidden="true" size={18} strokeWidth={1.8} />}
        id="invitation-email"
        label="E-mail zaproszonej osoby"
        required
        type="email"
      />

      <div className="pda-form-actions">
        <button
          className="pda-auth-button pda-auth-button--primary"
          type="submit"
        >
          Przyjmij i zweryfikuj
          <ArrowRight
            aria-hidden="true"
            size={18}
            strokeWidth={1.9}
          />
        </button>

        <button
          className="pda-auth-link"
          onClick={() => goTo('login')}
          type="button"
        >
          Użyj innego konta
        </button>
      </div>
    </form>
  );
}

function ReauthenticationForm({
  goTo,
  setShowPassword,
  showPassword,
}: {
  goTo: (screen: AuthScreen) => void;
  setShowPassword: (showPassword: boolean) => void;
  showPassword: boolean;
}) {
  return (
    <form
      className="pda-auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        goTo('complete');
      }}
    >
      <FormHeader
        eyebrow="Potwierdzenie czasowe"
        title="Zabezpiecz wrażliwą akcję"
        text="Ponowne uwierzytelnienie dotyczy tylko bieżącego celu."
      />

      <AuthField
        autoComplete="email"
        defaultValue="anna@northstar.example"
        icon={<Mail aria-hidden="true" size={18} strokeWidth={1.8} />}
        id="reauth-email"
        label="E-mail służbowy"
        required
        type="email"
      />

      <PasswordField
        autoComplete="current-password"
        id="reauth-password"
        label="Hasło"
        setShowPassword={setShowPassword}
        showPassword={showPassword}
      />

      <div className="pda-form-actions">
        <button
          className="pda-auth-button pda-auth-button--primary"
          type="submit"
        >
          Potwierdź akcję
          <ArrowRight
            aria-hidden="true"
            size={18}
            strokeWidth={1.9}
          />
        </button>

        <div className="pda-form-actions__secondary">
          <button
            className="pda-auth-link"
            onClick={() => goTo('recovery')}
            type="button"
          >
            Odzyskaj dostęp
          </button>

          <button
            className="pda-auth-link"
            onClick={() => goTo('login')}
            type="button"
          >
            Anuluj
          </button>
        </div>
      </div>
    </form>
  );
}

function SignedOutState({
  goTo,
}: {
  goTo: (screen: AuthScreen) => void;
}) {
  return (
    <DecisionState
      icon={<Fingerprint size={28} strokeWidth={1.65} />}
      goTo={goTo}
      note="Poprzednia sesja nie zostanie przywrócona automatycznie."
      primaryLabel="Zaloguj ponownie"
      primaryTarget="login"
      secondaryLabel="Odzyskaj dostęp"
      secondaryTarget="recovery"
      title="Sesja została zakończona"
      tone="neutral"
    />
  );
}

function AuthUnavailableState({
  goTo,
}: {
  goTo: (screen: AuthScreen) => void;
}) {
  return (
    <DecisionState
      icon={<RefreshCw size={28} strokeWidth={1.65} />}
      goTo={goTo}
      note="Przerwana próba nie może zostać bezpiecznie wznowiona."
      primaryLabel="Zacznij od nowa"
      primaryTarget="login"
      secondaryLabel="Wybierz wsparcie"
      secondaryTarget="accessResolution"
      title="Kontekst dostępu wygasł"
      tone="warning"
    />
  );
}

function AccessBlockedState({
  goTo,
}: {
  goTo: (screen: AuthScreen) => void;
}) {
  return (
    <DecisionState
      icon={<LockKeyhole size={28} strokeWidth={1.65} />}
      goTo={goTo}
      note="Powód ograniczenia pozostaje neutralny na publicznej powierzchni."
      primaryLabel="Rozwiąż dostęp"
      primaryTarget="accessResolution"
      secondaryLabel="Wróć do logowania"
      secondaryTarget="login"
      title="Dostęp jest ograniczony"
      tone="critical"
    />
  );
}

function AccessResolutionState({
  goTo,
}: {
  goTo: (screen: AuthScreen) => void;
}) {
  return (
    <DecisionState
      icon={<Waypoints size={28} strokeWidth={1.65} />}
      goTo={goTo}
      note="Konta nie zostaną połączone wyłącznie na podstawie adresu e-mail."
      primaryLabel="Restartuj dostęp"
      primaryTarget="login"
      secondaryLabel="Potwierdź ponownie"
      secondaryTarget="reauthentication"
      title="Wybierz kolejną ścieżkę"
      tone="warning"
    />
  );
}

function CompleteState({
  goTo,
}: {
  goTo: (screen: AuthScreen) => void;
}) {
  return (
    <div className="pda-state pda-state--success">
      <div className="pda-state__symbol">
        <span />
        <BadgeCheck size={32} strokeWidth={1.65} />
      </div>

      <FormHeader
        eyebrow="Weryfikacja zakończona"
        title="Dostęp potwierdzony"
        text="Tożsamość może zostać przekazana do wyboru workspace albo dalszej konfiguracji."
      />

      <div className="pda-state__handoff">
        <span>Stan przekazania</span>
        <strong>Tożsamość zweryfikowana</strong>
        <span>Proces wejścia wybierze następny ekran.</span>
      </div>

      <div className="pda-form-actions">
        <button
          className="pda-auth-button pda-auth-button--primary"
          type="button"
        >
          Przejdź dalej
          <ArrowRight
            aria-hidden="true"
            size={18}
            strokeWidth={1.9}
          />
        </button>

        <button
          className="pda-auth-link"
          onClick={() => goTo('login')}
          type="button"
        >
          Zacznij od nowa
        </button>
      </div>
    </div>
  );
}

function DecisionState({
  goTo,
  icon,
  note,
  primaryLabel,
  primaryTarget,
  secondaryLabel,
  secondaryTarget,
  title,
  tone,
}: {
  goTo: (screen: AuthScreen) => void;
  icon: ReactNode;
  note: string;
  primaryLabel: string;
  primaryTarget: AuthScreen;
  secondaryLabel: string;
  secondaryTarget: AuthScreen;
  title: string;
  tone: 'critical' | 'neutral' | 'warning';
}) {
  return (
    <div className={`pda-state pda-state--${tone}`}>
      <div className="pda-state__symbol">
        <span />
        {icon}
      </div>

      <FormHeader
        eyebrow="Bezpieczna decyzja"
        title={title}
        text={note}
      />

      <div className="pda-state__notice">
        <CircleAlert
          aria-hidden="true"
          size={18}
          strokeWidth={1.7}
        />
        <span>
          Publiczny komunikat nie ujawnia stanu konta,
          dostawcy ani szczegółów decyzji.
        </span>
      </div>

      <div className="pda-form-actions">
        <button
          className="pda-auth-button pda-auth-button--primary"
          onClick={() => goTo(primaryTarget)}
          type="button"
        >
          {primaryLabel}
          <ArrowRight
            aria-hidden="true"
            size={18}
            strokeWidth={1.9}
          />
        </button>

        <button
          className="pda-auth-link"
          onClick={() => goTo(secondaryTarget)}
          type="button"
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}

function ProviderButton({
  describedBy,
  disabled = false,
  label,
  onClick,
  provider,
  unavailable = false,
}: {
  describedBy?: string;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  provider: 'google' | 'microsoft';
  unavailable?: boolean;
}) {
  return (
    <button
      aria-describedby={describedBy}
      className={`pda-provider-button pda-provider-button--${provider}${
        unavailable ? ' is-unavailable' : ''
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {provider === 'microsoft' ? (
        <svg
          aria-hidden="true"
          className="pda-provider-logo"
          viewBox="0 0 20 20"
        >
          <rect fill="#f25022" height="8.5" width="8.5" x="1" y="1" />
          <rect fill="#7fba00" height="8.5" width="8.5" x="10.5" y="1" />
          <rect fill="#00a4ef" height="8.5" width="8.5" x="1" y="10.5" />
          <rect fill="#ffb900" height="8.5" width="8.5" x="10.5" y="10.5" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          className="pda-provider-logo"
          viewBox="0 0 24 24"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285f4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34a853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#fbbc05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#ea4335"
          />
        </svg>
      )}
      <span>{label}</span>
    </button>
  );
}

function AuthField({
  ariaDescribedBy,
  autoComplete,
  defaultValue,
  disabled,
  helper,
  icon,
  id,
  label,
  placeholder,
  required,
  type = 'text',
}: FieldProps) {
  return (
    <label className="pda-field" htmlFor={id}>
      <span className="pda-field__label">{label}</span>

      <span className="pda-input-frame">
        {icon}

        <input
          aria-describedby={ariaDescribedBy}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          disabled={disabled}
          id={id}
          placeholder={placeholder}
          required={required}
          type={type}
        />

        <span
          className="pda-input-frame__signal"
          aria-hidden="true"
        />
      </span>

      {helper ? (
        <span className="pda-field__hint">{helper}</span>
      ) : null}
    </label>
  );
}

function PasswordField({
  ariaDescribedBy,
  autoComplete,
  disabled = false,
  helper,
  id,
  label,
  setShowPassword,
  showPassword,
}: {
  ariaDescribedBy?: string;
  autoComplete: string;
  disabled?: boolean;
  helper?: string;
  id: string;
  label: string;
  setShowPassword: (showPassword: boolean) => void;
  showPassword: boolean;
}) {
  return (
    <div className="pda-field">
      <label className="pda-field__label" htmlFor={id}>
        {label}
      </label>

      <span className="pda-input-frame">
        <LockKeyhole
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
        />

        <input
          aria-describedby={ariaDescribedBy}
          autoComplete={autoComplete}
          disabled={disabled}
          id={id}
          required
          type={showPassword ? 'text' : 'password'}
        />

        <button
          aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
          className="pda-field-action"
          disabled={disabled}
          onClick={() => setShowPassword(!showPassword)}
          type="button"
        >
          {showPassword ? (
            <EyeOff
              aria-hidden="true"
              size={18}
              strokeWidth={1.8}
            />
          ) : (
            <Eye
              aria-hidden="true"
              size={18}
              strokeWidth={1.8}
            />
          )}
        </button>
      </span>

      {helper ? (
        <span className="pda-field__hint">{helper}</span>
      ) : null}
    </div>
  );
}

function FormHeader({
  eyebrow,
  text,
  title,
}: {
  eyebrow: string;
  text: string;
  title: string;
}) {
  return (
    <header className="pda-auth-form__header">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </header>
  );
}

const meta = {
  title: 'PapaData/Dostęp do konta/Proces dostępu',
  component: AuthStorySurface,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    initialLoginState: {
      control: 'select',
      options: [
        'default',
        'submitting',
        'invalidCredentials',
        'providerUnavailable',
      ],
    },
    initialScreen: {
      control: 'select',
      options: [
        'login',
        'register',
        'emailVerification',
        'mfa',
        'recovery',
        'invitation',
        'signedOut',
        'authUnavailable',
        'accessBlocked',
        'reauthentication',
        'accessResolution',
        'complete',
      ],
    },
    initialTheme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
    initialVerificationState: {
      control: 'select',
      options: [
        'idle',
        'incomplete',
        'submitting',
        'invalid',
        'expired',
        'resent',
        'cooldown',
        'success',
      ],
    },
  },
} satisfies Meta<typeof AuthStorySurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CalyProces: Story = {
  name: 'Cały proces',
  args: {
    initialScreen: 'login',
    initialTheme: 'dark',
  },
};

export const Logowanie: Story = {
  args: {
    initialLoginState: 'default',
    initialScreen: 'login',
    initialTheme: 'dark',
  },
};

export const LogowanieWTrakcie: Story = {
  name: 'Stan wysyłania',
  args: {
    initialLoginState: 'submitting',
    initialScreen: 'login',
    initialTheme: 'dark',
  },
};

export const LogowanieBledneDane: Story = {
  name: 'Błędne dane',
  args: {
    initialLoginState: 'invalidCredentials',
    initialScreen: 'login',
    initialTheme: 'dark',
  },
};

export const LogowanieProviderNiedostepny: Story = {
  name: 'Provider niedostępny',
  args: {
    initialLoginState: 'providerUnavailable',
    initialScreen: 'login',
    initialTheme: 'dark',
  },
};

export const Rejestracja: Story = {
  name: 'Rejestracja — wariant warunkowy',
  args: {
    initialScreen: 'register',
    initialTheme: 'dark',
  },
};

export const EmailVerificationPodstawowy: Story = {
  name: 'Email verification — podstawowy',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'idle',
  },
};

export const EmailVerificationWysylanie: Story = {
  name: 'Email verification — wysyłanie',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'submitting',
  },
};

export const EmailVerificationBlednyKod: Story = {
  name: 'Email verification — błędny kod',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'invalid',
  },
};

export const EmailVerificationKodWygasl: Story = {
  name: 'Email verification — kod wygasł',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'expired',
  },
};

export const EmailVerificationKodWyslanyPonownie: Story = {
  name: 'Email verification — kod wysłany ponownie',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'resent',
  },
};

export const EmailVerificationCooldown: Story = {
  name: 'Email verification — cooldown',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'cooldown',
  },
};

export const EmailVerificationKodPotwierdzony: Story = {
  name: 'Email verification — kod potwierdzony',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'success',
  },
};

export const MfaPodstawowy: Story = {
  name: 'MFA — podstawowy',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'idle',
  },
};

export const MfaWysylanie: Story = {
  name: 'MFA — wysyłanie',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'submitting',
  },
};

export const MfaBlednyKod: Story = {
  name: 'MFA — błędny kod',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'invalid',
  },
};

export const MfaKodWygasl: Story = {
  name: 'MFA — kod wygasł',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'expired',
  },
};

export const MfaCooldown: Story = {
  name: 'MFA — cooldown',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'cooldown',
  },
};

export const MfaKodPotwierdzony: Story = {
  name: 'MFA — kod potwierdzony',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'success',
  },
};

export const OdzyskiwanieDostepu: Story = {
  name: 'Odzyskiwanie dostępu',
  args: {
    initialScreen: 'recovery',
    initialTheme: 'dark',
  },
};

export const AkceptacjaZaproszenia: Story = {
  name: 'Akceptacja zaproszenia',
  args: {
    initialScreen: 'invitation',
    initialTheme: 'dark',
  },
};

export const SesjaZakonczona: Story = {
  name: 'Sesja zakończona',
  args: {
    initialScreen: 'signedOut',
    initialTheme: 'dark',
  },
};

export const StanDostepuNiedostepny: Story = {
  name: 'Stan dostępu niedostępny',
  args: {
    initialScreen: 'authUnavailable',
    initialTheme: 'dark',
  },
};

export const DostepZablokowany: Story = {
  name: 'Dostęp zablokowany',
  args: {
    initialScreen: 'accessBlocked',
    initialTheme: 'dark',
  },
};

export const PonowneUwierzytelnienie: Story = {
  name: 'Ponowne uwierzytelnienie',
  args: {
    initialScreen: 'reauthentication',
    initialTheme: 'dark',
  },
};

export const RozwiazanieDostepu: Story = {
  name: 'Rozwiązanie dostępu',
  args: {
    initialScreen: 'accessResolution',
    initialTheme: 'dark',
  },
};

export const DostepGotowy: Story = {
  name: 'Dostęp gotowy',
  args: {
    initialScreen: 'complete',
    initialTheme: 'dark',
  },
};
