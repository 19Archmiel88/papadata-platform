import {
  BadgeCheck,
  BriefcaseBusiness,
  Fingerprint,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  User,
  Waypoints,
  type LucideIcon,
} from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { PapaDataLanguage, PapaDataTheme } from '../../contracts/ui';
import {
  ActionArrow,
  AppHeader,
  Button as DsButton,
  InlineNotice,
  PageHeader,
  PasswordField as DsPasswordField,
  ProviderButton as DsProviderButton,
  StepIndicator,
  TextField as DsTextField,
  VerificationCodeInput,
} from '../../design-system';
import {
  authIdentityFixture,
  authProgressSteps,
  staticCooldownSeconds,
  verificationCodeLength,
  verificationCodeSettings,
  verificationCooldownSeconds,
  type AuthProgressIcon,
  type AuthScreen,
  type LoginState,
  type VerificationCodeState,
  type VerificationKind,
} from '../../fixtures/auth';
import '../../design-system/foundations/papadata-brand-surface.css';
import './papadata-auth.css';

const authProgressIconByName: Record<AuthProgressIcon, LucideIcon> = {
  fingerprint: Fingerprint,
  user: User,
  waypoints: Waypoints,
};

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

  const progressIndex = getProgressIndex(screen);

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
      <AppHeader
        language={language}
        onLanguageChange={setLanguage}
        onThemeChange={setTheme}
        theme={theme}
      />

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

        <DsButton
          className="pda-login-registration"
          onClick={() => goTo('register')}
          variant="ghost"
        >
          Nie masz konta? <span>Zarejestruj się</span>
        </DsButton>

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
    <StepIndicator
      className="pda-auth-progress"
      currentIndex={currentIndex}
      aria-label="Postęp procesu dostępu"
      steps={authProgressSteps.map((step) => {
        const StepIcon = authProgressIconByName[step.icon];

        return {
          icon: (
            <StepIcon
              aria-hidden="true"
              size={15}
              strokeWidth={1.8}
            />
          ),
          key: step.key,
          label: step.label,
        };
      })}
    />
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
        <InlineNotice
          className="pda-login-alert"
          id="login-status-message"
          tone="error"
        >
          Nie udało się zalogować. Sprawdź dane lub odzyskaj dostęp.
        </InlineNotice>
      ) : null}

      <div className="pda-login-fields">
        <DsTextField
          aria-describedby={isInvalid ? messageId : undefined}
          autoComplete="email"
          className="pda-login-field"
          disabled={isSubmitting}
          id="login-email"
          label="Adres e-mail"
          placeholder="m@example.com"
          required
          type="email"
        />

        <DsPasswordField
          aria-describedby={isInvalid ? messageId : undefined}
          autoComplete="current-password"
          className="pda-login-field"
          disabled={isSubmitting}
          id="login-password"
          label="Hasło"
          labelAction={
            <DsButton
              className="pda-login-forgot"
              disabled={isSubmitting}
              onClick={() => goTo('recovery')}
              variant="ghost"
            >
              Nie pamiętam hasła
            </DsButton>
          }
          onVisibleChange={setShowPassword}
          required
          visible={showPassword}
        />
      </div>

      <DsButton
        className="pda-login-submit"
        disabled={isSubmitting}
        loading={isSubmitting}
        type="submit"
        variant="primary"
      >
        {isSubmitting ? 'Sprawdzanie dostępu' : 'Zaloguj się'}
      </DsButton>

      <div className="pda-login-divider">
        <span>lub kontynuuj przez</span>
      </div>

      {isProviderUnavailable ? (
        <InlineNotice
          className="pda-login-alert"
          id="login-status-message"
          tone="warning"
        >
          Logowanie przez Microsoft jest chwilowo niedostępne. Użyj innej
          metody.
        </InlineNotice>
      ) : null}

      <div className="pda-login-providers">
        <DsProviderButton
          aria-describedby={isProviderUnavailable ? messageId : undefined}
          disabled={isSubmitting || isProviderUnavailable}
          onClick={() => goTo('mfa')}
          provider="microsoft"
          unavailable={isProviderUnavailable}
        >
          Microsoft
        </DsProviderButton>

        <DsProviderButton
          disabled={isSubmitting}
          onClick={() => goTo('mfa')}
          provider="google"
        >
          Google
        </DsProviderButton>
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
          defaultValue={authIdentityFixture.fullName}
          icon={<User aria-hidden="true" size={18} strokeWidth={1.8} />}
          id="register-name"
          label="Imię i nazwisko"
          required
        />

        <AuthField
          autoComplete="organization"
          defaultValue={authIdentityFixture.organizationName}
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
        defaultValue={authIdentityFixture.email}
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
        <DsButton
          className="pda-auth-button"
          iconAfter={<ActionArrow />}
          type="submit"
          variant="primary"
        >
          Utwórz i zweryfikuj
        </DsButton>

        <DsButton
          className="pda-auth-link"
          onClick={() => goTo('login')}
          variant="ghost"
        >
          Mam już konto
        </DsButton>
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
          ...verificationCodeSettings.emailVerification,
          headerText:
            'Jeżeli proces może być kontynuowany, wpisz 6-cyfrowy kod z bieżącej próby.',
          headerTitle: 'Kontynuuj weryfikację',
        }
      : verificationCodeSettings[kind];
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
        <InlineNotice
          className="pda-code-status"
          tone={statusTone}
        >
          {statusMessage}
        </InlineNotice>
      ) : null}

      <div className="pda-form-actions">
        <DsButton
          className="pda-auth-button"
          disabled={
            isExpired
              ? false
              : isSubmitting || isSuccess || !isCodeComplete
          }
          iconAfter={!isSubmitting ? <ActionArrow /> : undefined}
          loading={isSubmitting}
          onClick={isExpired ? sendNewCode : undefined}
          type={isExpired ? 'button' : 'submit'}
          variant="primary"
        >
          {primaryLabel}
        </DsButton>

        {!isExpired ? (
          <DsButton
            className="pda-auth-button"
            disabled={isSubmitting || isCooldown || isSuccess}
            iconBefore={<RefreshCw aria-hidden="true" size={17} strokeWidth={1.8} />}
            onClick={sendNewCode}
            variant="secondary"
          >
            {resendLabel}
          </DsButton>
        ) : null}

        <DsButton
          className="pda-auth-link"
          disabled={isSubmitting || isSuccess}
          onClick={() => goTo(copy.changeTarget)}
          variant="ghost"
        >
          {copy.changeLabel}
        </DsButton>
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
        defaultValue={authIdentityFixture.email}
        helper="Jeżeli proces może być kontynuowany, pokażemy kolejny krok."
        icon={<Mail aria-hidden="true" size={18} strokeWidth={1.8} />}
        id="recovery-email"
        label="E-mail służbowy"
        required
        type="email"
      />

      <div className="pda-form-actions">
        <DsButton
          className="pda-auth-button"
          iconAfter={<ActionArrow />}
          type="submit"
          variant="primary"
        >
          Kontynuuj
        </DsButton>

        <DsButton
          className="pda-auth-link"
          onClick={() => goTo('login')}
          variant="ghost"
        >
          Wróć do logowania
        </DsButton>
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
          <span>Identyfikator: {authIdentityFixture.invitationIdentifier}</span>
        </span>
      </div>

      <AuthField
        autoComplete="email"
        defaultValue={authIdentityFixture.email}
        icon={<Mail aria-hidden="true" size={18} strokeWidth={1.8} />}
        id="invitation-email"
        label="E-mail zaproszonej osoby"
        required
        type="email"
      />

      <div className="pda-form-actions">
        <DsButton
          className="pda-auth-button"
          iconAfter={<ActionArrow />}
          type="submit"
          variant="primary"
        >
          Przyjmij i zweryfikuj
        </DsButton>

        <DsButton
          className="pda-auth-link"
          onClick={() => goTo('login')}
          variant="ghost"
        >
          Użyj innego konta
        </DsButton>
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
        defaultValue={authIdentityFixture.email}
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
        <DsButton
          className="pda-auth-button"
          iconAfter={<ActionArrow />}
          type="submit"
          variant="primary"
        >
          Potwierdź akcję
        </DsButton>

        <div className="pda-form-actions__secondary">
          <DsButton
            className="pda-auth-link"
            onClick={() => goTo('recovery')}
            variant="ghost"
          >
            Odzyskaj dostęp
          </DsButton>

          <DsButton
            className="pda-auth-link"
            onClick={() => goTo('login')}
            variant="ghost"
          >
            Anuluj
          </DsButton>
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
        <DsButton
          className="pda-auth-button"
          iconAfter={<ActionArrow />}
          variant="primary"
        >
          Przejdź dalej
        </DsButton>

        <DsButton
          className="pda-auth-link"
          onClick={() => goTo('login')}
          variant="ghost"
        >
          Zacznij od nowa
        </DsButton>
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

      <InlineNotice className="pda-state__notice" tone="warning">
        Publiczny komunikat nie ujawnia stanu konta, dostawcy ani
        szczegółów decyzji.
      </InlineNotice>

      <div className="pda-form-actions">
        <DsButton
          className="pda-auth-button"
          iconAfter={<ActionArrow />}
          onClick={() => goTo(primaryTarget)}
          variant="primary"
        >
          {primaryLabel}
        </DsButton>

        <DsButton
          className="pda-auth-link"
          onClick={() => goTo(secondaryTarget)}
          variant="ghost"
        >
          {secondaryLabel}
        </DsButton>
      </div>
    </div>
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
}: {
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
}) {
  return (
    <DsTextField
      aria-describedby={ariaDescribedBy}
      autoComplete={autoComplete}
      className="pda-field"
      defaultValue={defaultValue}
      disabled={disabled}
      helper={helper}
      icon={icon}
      id={id}
      label={label}
      placeholder={placeholder}
      required={required}
      type={type}
    />
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
    <DsPasswordField
      aria-describedby={ariaDescribedBy}
      autoComplete={autoComplete}
      className="pda-field"
      disabled={disabled}
      helper={helper}
      id={id}
      label={label}
      onVisibleChange={setShowPassword}
      required
      visible={showPassword}
    />
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
    <PageHeader
      className="pda-auth-form__header"
      eyebrow={eyebrow}
      heading="h2"
      text={text}
      title={title}
    />
  );
}

export { AuthStorySurface };
