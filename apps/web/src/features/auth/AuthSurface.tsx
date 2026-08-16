import type {
  FormEvent,
  ReactNode,
} from 'react';
import {
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Button,
  Checkbox,
  InlineNotice,
  PapaDataBrand,
  PasswordField,
  TextAction,
  TextField,
  VerificationCodeInput,
} from '../../design-system';
import {
  resolveAuthStatePanel,
  resolveAuthSurfaceCopy,
} from './authSurfaceContent';
import './auth-surface.css';

export type AuthSurfaceMode =
  | 'entry'
  | 'login'
  | 'register'
  | 'mfa'
  | 'recover';

export type AuthSurfaceState =
  | 'ready'
  | 'validationError'
  | 'rateLimited'
  | 'blocked'
  | 'serviceUnavailable'
  | 'recoverySent'
  | 'registrationCompleted'
  | 'applicationReady'
  | 'mfaEnrollmentRequired';

export type AuthLoginInput = {
  readonly email: string;
  readonly password: string;
  readonly rememberDevice: boolean;
};

export type AuthRegisterInput = {
  readonly email: string;
  readonly fullName: string;
  readonly password: string;
  readonly passwordConfirmation: string;
};

export type AuthMfaInput = {
  readonly code: string;
};

export type AuthRecoveryRequestInput = {
  readonly email: string;
};

export type AuthPasswordResetInput = {
  readonly email: string;
  readonly newPassword: string;
  readonly newPasswordConfirmation: string;
  readonly otp: string;
  readonly resetToken: string;
};

export type AuthSurfaceProps = {
  readonly initialEmail?: string;
  readonly initialRememberDevice?: boolean;
  readonly initialResetToken?: string | null;
  readonly mode: AuthSurfaceMode;
  readonly onLogin?: (input: AuthLoginInput) => Promise<void> | void;
  readonly onMfaConfirm?: (input: AuthMfaInput) => Promise<void> | void;
  readonly onNavigate?: (path: string) => void;
  readonly onPasswordRecoveryRequest?: (
    input: AuthRecoveryRequestInput,
  ) => Promise<void> | void;
  readonly onPasswordReset?: (
    input: AuthPasswordResetInput,
  ) => Promise<void> | void;
  readonly onRegister?: (input: AuthRegisterInput) => Promise<void> | void;
  readonly onRetry?: () => Promise<void> | void;
  readonly state?: AuthSurfaceState;
};

type FieldProblems = {
  readonly code?: string;
  readonly email?: string;
  readonly fullName?: string;
  readonly newPasswordConfirmation?: string;
  readonly otp?: string;
  readonly password?: string;
  readonly passwordConfirmation?: string;
  readonly resetToken?: string;
};

type RegistrationStage = 'choice' | 'email';

export function AuthSurface({
  initialEmail = '',
  initialRememberDevice = false,
  initialResetToken = null,
  mode,
  onLogin,
  onMfaConfirm,
  onNavigate,
  onPasswordRecoveryRequest,
  onPasswordReset,
  onRegister,
  onRetry,
  state = 'ready',
}: AuthSurfaceProps) {
  const [email, setEmail] = useState(initialEmail);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [code, setCode] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState(initialResetToken ?? '');
  const [rememberDevice, setRememberDevice] = useState(initialRememberDevice);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [
    newPasswordConfirmationVisible,
    setNewPasswordConfirmationVisible,
  ] = useState(false);
  const [registrationStage, setRegistrationStage] = useState<RegistrationStage>(
    state === 'registrationCompleted' ? 'email' : 'choice',
  );
  const [submitting, setSubmitting] = useState(false);
  const [fieldProblems, setFieldProblems] = useState<FieldProblems>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const surfaceRef = useRef<HTMLElement | null>(null);

  const isResetFlow = mode === 'recover' && Boolean(resetToken);
  const copy = resolveAuthSurfaceCopy(mode, state, isResetFlow);
  const statePanel = resolveAuthStatePanel(mode, state, isResetFlow);
  const isHardBlocked = state === 'blocked' || state === 'serviceUnavailable';
  const isSubmissionBlocked = isHardBlocked || state === 'rateLimited';
  const isPassiveState = (
    state === 'blocked'
    || state === 'serviceUnavailable'
    || state === 'recoverySent'
    || state === 'registrationCompleted'
    || state === 'applicationReady'
    || state === 'mfaEnrollmentRequired'
  );
  const presentedSurfaceId = resolvePresentedSurfaceId(
    mode,
    state,
    isResetFlow,
    registrationStage,
  );

  const passwordRequirements = useMemo(() => [
    {
      id: 'length',
      label: 'Co najmniej 12 znaków',
      met: password.length >= 12,
    },
  ], [password.length]);

  const newPasswordRequirements = useMemo(() => [
    {
      id: 'length',
      label: 'Co najmniej 12 znaków',
      met: newPassword.length >= 12,
    },
  ], [newPassword.length]);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmissionBlocked) return;

    const problems = validateLogin(email, password);
    if (!submitIfValid(problems)) return;

    await runSubmit(async () => {
      await onLogin?.({
        email: email.trim(),
        password,
        rememberDevice,
      });
    });
  }

  async function submitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmissionBlocked) return;

    const problems = validateRegistration(
      email,
      fullName,
      password,
      passwordConfirmation,
    );
    if (!submitIfValid(problems)) return;

    await runSubmit(async () => {
      await onRegister?.({
        email: email.trim(),
        fullName: fullName.trim(),
        password,
        passwordConfirmation,
      });
      setSuccess('Rejestracja została przyjęta do dalszego procesu dostępu.');
    });
  }

  async function submitMfa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmissionBlocked) return;

    const problems = validateMfa(code);
    if (!submitIfValid(problems)) return;

    await runSubmit(async () => {
      await onMfaConfirm?.({
        code: code.trim(),
      });
      setSuccess('MFA potwierdzone. Sesja może przejść dalej.');
    });
  }

  async function submitRecoveryRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmissionBlocked) return;

    const problems = validateRecoveryRequest(email);
    if (!submitIfValid(problems)) return;

    await runSubmit(async () => {
      await onPasswordRecoveryRequest?.({
        email: email.trim(),
      });
      setSuccess(
        'Jeżeli konto istnieje, wysłaliśmy instrukcję odzyskania dostępu.',
      );
    });
  }

  async function submitPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmissionBlocked) return;

    const problems = validatePasswordReset(
      email,
      newPassword,
      newPasswordConfirmation,
      otp,
      resetToken,
    );
    if (!submitIfValid(problems)) return;

    await runSubmit(async () => {
      await onPasswordReset?.({
        email: email.trim(),
        newPassword,
        newPasswordConfirmation,
        otp: otp.trim(),
        resetToken: resetToken.trim(),
      });
      setSuccess('Hasło zostało ustawione. Możesz wrócić do logowania.');
    });
  }

  function submitIfValid(problems: FieldProblems) {
    setFieldProblems(problems);
    setProblem(null);
    setSuccess(null);
    const firstProblem = Object.values(problems).find(Boolean);

    if (firstProblem) {
      setProblem('Popraw oznaczone pola, aby bezpiecznie kontynuować.');
      window.requestAnimationFrame(() => {
        surfaceRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
      });
      return false;
    }

    return true;
  }

  async function runSubmit(action: () => Promise<void>) {
    setSubmitting(true);
    setProblem(null);
    try {
      await action();
    } catch (cause) {
      setProblem(
        cause instanceof Error
          ? cause.message
          : 'Operacja nie powiodła się.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function navigateTo(path: string) {
    onNavigate?.(path);
  }

  return (
    <main
      className="pd-auth-surface"
      data-auth-mode={mode}
      data-auth-state={state}
      data-auth-surface={presentedSurfaceId}
      ref={surfaceRef}
    >
      <section
        aria-describedby="auth-description"
        aria-labelledby="auth-title"
        className="pd-auth-surface__canvas"
      >
        <div className="pd-auth-surface__workspace">
          <div className="pd-auth-surface__card-header">
            <div className="pd-auth-surface__brand-mark" aria-hidden="true">
              <PapaDataBrand
                decorative
                size="small"
                variant="mark"
              />
            </div>
            <p className="pd-auth-surface__eyebrow">{copy.eyebrow}</p>
            <h1 id="auth-title">{copy.title}</h1>
            <p className="pd-auth-surface__description" id="auth-description">
              {copy.description}
            </p>
          </div>
          {statePanel ? (
            <AuthStatePanelView
              action={(
                <AuthStateActions
                  actionLabel={statePanel.actionLabel}
                  onNavigate={navigateTo}
                  onRetry={onRetry}
                  state={state}
                />
              )}
              body={statePanel.body}
              eyebrow={statePanel.eyebrow}
              title={statePanel.title}
              tone={statePanel.tone}
            />
          ) : null}

          {problem ? (
            <InlineNotice
              className="pd-auth-surface__notice"
              message={problem}
              title="Sprawdź dane"
              tone="critical"
            />
          ) : null}

          {success ? (
            <InlineNotice
              className="pd-auth-surface__notice"
              message={success}
              title="Operacja przyjęta"
              tone="success"
            />
          ) : null}

          {mode === 'entry' && !isPassiveState ? (
            <AuthEntryActions
              disabled={isHardBlocked}
              onNavigate={navigateTo}
            />
          ) : null}

          {mode === 'login' && !isPassiveState ? (
            <form className="pd-auth-surface__form" noValidate onSubmit={submitLogin}>
              <TextField
                autocomplete="email"
                inputType="email"
                invalid={Boolean(fieldProblems.email)}
                label="E-mail"
                message={fieldProblems.email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                required
                value={email}
              />

              <PasswordField
                autocomplete="current-password"
                invalid={Boolean(fieldProblems.password)}
                label="Hasło"
                message={fieldProblems.password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                onVisibilityChange={setPasswordVisible}
                required
                value={password}
                visible={passwordVisible}
              />

              <Checkbox
                checked={rememberDevice}
                helperText="Zaufanie urządzeniu zależy od polityki organizacji."
                label="Zapamiętaj to urządzenie"
                onChange={(event) => setRememberDevice(event.currentTarget.checked)}
                value="remember-device"
              />

              <Button
                disabled={isSubmissionBlocked}
                fullWidth
                loading={submitting}
                loadingLabel="Logowanie..."
                size="large"
                type="submit"
              >
                Zaloguj się
              </Button>
            </form>
          ) : null}

          {mode === 'register'
            && registrationStage === 'choice'
            && !isPassiveState ? (
              <div
                aria-label="Wybierz metodę rejestracji"
                className="pd-auth-surface__registration-choice"
              >
                <Button
                  fullWidth
                  onClick={() => setRegistrationStage('email')}
                  size="large"
                >
                  Utwórz konto e-mailem
                </Button>
                <Button
                  disabled
                  fullWidth
                  size="large"
                  variant="secondary"
                >
                  Kontynuuj przez OAuth
                </Button>
                <p>Ta metoda nie jest obecnie dostępna.</p>
              </div>
            ) : null}

          {mode === 'register'
            && registrationStage === 'email'
            && !isPassiveState ? (
              <form className="pd-auth-surface__form" noValidate onSubmit={submitRegister}>
                <TextField
                  autocomplete="name"
                  invalid={Boolean(fieldProblems.fullName)}
                  label="Imię i nazwisko"
                  message={fieldProblems.fullName}
                  onChange={(event) => setFullName(event.currentTarget.value)}
                  required
                  value={fullName}
                />

                <TextField
                  autocomplete="email"
                  inputType="email"
                  invalid={Boolean(fieldProblems.email)}
                  label="E-mail"
                  message={fieldProblems.email}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  required
                  value={email}
                />

                <PasswordField
                  autocomplete="new-password"
                  invalid={Boolean(fieldProblems.password)}
                  label="Hasło"
                  message={fieldProblems.password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  onVisibilityChange={setPasswordVisible}
                  requirements={passwordRequirements}
                  required
                  value={password}
                  visible={passwordVisible}
                />

                <PasswordField
                  autocomplete="new-password"
                  invalid={Boolean(fieldProblems.passwordConfirmation)}
                  label="Powtórz hasło"
                  message={fieldProblems.passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.currentTarget.value)}
                  onVisibilityChange={setPasswordConfirmationVisible}
                  required
                  value={passwordConfirmation}
                  visible={passwordConfirmationVisible}
                />

                <Button
                  disabled={isSubmissionBlocked}
                  fullWidth
                  loading={submitting}
                  loadingLabel="Tworzenie konta..."
                  size="large"
                  type="submit"
                >
                  Utwórz konto
                </Button>

                <TextAction
                  onClick={() => setRegistrationStage('choice')}
                  tone="muted"
                >
                  Wybierz inną metodę rejestracji
                </TextAction>
              </form>
            ) : null}

          {mode === 'mfa' && !isPassiveState ? (
            <form className="pd-auth-surface__form" noValidate onSubmit={submitMfa}>
              <VerificationCodeInput
                helperText="Wpisz 6-cyfrowy kod z aplikacji uwierzytelniającej."
                invalid={Boolean(fieldProblems.code)}
                label="Kod MFA"
                message={fieldProblems.code}
                onChange={(event) => setCode(event.currentTarget.value)}
                required
                value={code}
              />

              <Button
                disabled={isSubmissionBlocked}
                fullWidth
                loading={submitting}
                loadingLabel="Weryfikacja..."
                size="large"
                type="submit"
              >
                Potwierdź MFA
              </Button>
            </form>
          ) : null}

          {mode === 'recover' && !isResetFlow && !isPassiveState ? (
            <form
              className="pd-auth-surface__form"
              noValidate
              onSubmit={submitRecoveryRequest}
            >
              <TextField
                autocomplete="email"
                inputType="email"
                invalid={Boolean(fieldProblems.email)}
                label="E-mail konta"
                message={fieldProblems.email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                required
                value={email}
              />

              <Button
                disabled={isSubmissionBlocked}
                fullWidth
                loading={submitting}
                loadingLabel="Wysyłanie..."
                size="large"
                type="submit"
              >
                Wyślij instrukcję
              </Button>
            </form>
          ) : null}

          {mode === 'recover' && isResetFlow && !isPassiveState ? (
            <form
              className="pd-auth-surface__form"
              noValidate
              onSubmit={submitPasswordReset}
            >
              <TextField
                autocomplete="email"
                inputType="email"
                invalid={Boolean(fieldProblems.email)}
                label="E-mail konta"
                message={fieldProblems.email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                required
                value={email}
              />

              <VerificationCodeInput
                helperText="Kod jednorazowy z wiadomości resetu."
                invalid={Boolean(fieldProblems.otp)}
                label="Kod OTP"
                message={fieldProblems.otp}
                onChange={(event) => setOtp(event.currentTarget.value)}
                required
                value={otp}
              />

              <input
                name="resetToken"
                type="hidden"
                value={resetToken}
              />

              <PasswordField
                autocomplete="new-password"
                invalid={Boolean(fieldProblems.password)}
                label="Nowe hasło"
                message={fieldProblems.password}
                onChange={(event) => setNewPassword(event.currentTarget.value)}
                onVisibilityChange={setNewPasswordVisible}
                requirements={newPasswordRequirements}
                required
                value={newPassword}
                visible={newPasswordVisible}
              />

              <PasswordField
                autocomplete="new-password"
                invalid={Boolean(fieldProblems.newPasswordConfirmation)}
                label="Powtórz nowe hasło"
                message={fieldProblems.newPasswordConfirmation}
                onChange={(event) => setNewPasswordConfirmation(event.currentTarget.value)}
                onVisibilityChange={setNewPasswordConfirmationVisible}
                required
                value={newPasswordConfirmation}
                visible={newPasswordConfirmationVisible}
              />

              <Button
                disabled={isSubmissionBlocked}
                fullWidth
                loading={submitting}
                loadingLabel="Ustawianie hasła..."
                size="large"
                type="submit"
              >
                Ustaw nowe hasło
              </Button>
            </form>
          ) : null}

          <AuthSecondaryActions
            mode={mode}
            onNavigate={navigateTo}
          />

          {copy.scopeNote ? (
            <p className="pd-auth-surface__scope-note">
              {copy.scopeNote}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function AuthEntryActions({
  disabled,
  onNavigate,
}: {
  readonly disabled: boolean;
  readonly onNavigate: (path: string) => void;
}) {
  return (
    <div className="pd-auth-surface__choice">
      <Button
        disabled={disabled}
        fullWidth
        onClick={() => onNavigate('/login')}
        size="large"
      >
        Zaloguj się
      </Button>
      <Button
        disabled={disabled}
        fullWidth
        onClick={() => onNavigate('/register')}
        size="large"
        variant="secondary"
      >
        Utwórz konto
      </Button>
      <TextAction
        disabled={disabled}
        onClick={() => onNavigate('/recover-access')}
      >
        Odzyskaj dostęp
      </TextAction>
    </div>
  );
}

function AuthSecondaryActions({
  mode,
  onNavigate,
}: {
  readonly mode: AuthSurfaceMode;
  readonly onNavigate: (path: string) => void;
}) {
  if (mode === 'entry') return null;

  return (
    <div className="pd-auth-surface__links">
      {mode !== 'login' ? (
        <TextAction onClick={() => onNavigate('/login')}>
          Wróć do logowania
        </TextAction>
      ) : null}
      {mode === 'login' ? (
        <>
          <TextAction onClick={() => onNavigate('/register')}>
            Nie masz konta? Utwórz konto
          </TextAction>
          <TextAction
            onClick={() => onNavigate('/recover-access')}
            tone="muted"
          >
            Odzyskaj dostęp
          </TextAction>
        </>
      ) : null}
      {mode === 'register' ? (
        <TextAction
          onClick={() => onNavigate('/auth')}
          tone="muted"
        >
          Wróć do wejścia Auth
        </TextAction>
      ) : null}
    </div>
  );
}

function AuthStateActions({
  actionLabel,
  onNavigate,
  onRetry,
  state,
}: {
  readonly actionLabel?: string;
  readonly onNavigate: (path: string) => void;
  readonly onRetry?: () => Promise<void> | void;
  readonly state: AuthSurfaceState;
}) {
  if (state === 'serviceUnavailable') {
    return (
      <Button
        disabled={!onRetry}
        onClick={() => void onRetry?.()}
        variant="secondary"
      >
        Spróbuj ponownie
      </Button>
    );
  }

  if (state === 'blocked') {
    return (
      <div className="pd-auth-surface__state-actions">
        <Button
          onClick={() => onNavigate('/recover-access')}
          variant="secondary"
        >
          Odzyskaj dostęp
        </Button>
        <TextAction onClick={() => onNavigate('/login')}>
          Wróć do logowania
        </TextAction>
      </div>
    );
  }

  if (state === 'applicationReady') {
    return (
      <Button onClick={() => onNavigate('/app')}>
        Przejdź do aplikacji
      </Button>
    );
  }

  return actionLabel ? <span>{actionLabel}</span> : null;
}

function AuthStatePanelView({
  action,
  body,
  eyebrow,
  title,
  tone,
}: {
  readonly action: ReactNode;
  readonly body: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly tone: 'critical' | 'info' | 'success' | 'warning';
}) {
  return (
    <aside
      className="pd-auth-surface__state-panel"
      data-tone={tone}
      role={tone === 'critical' ? 'alert' : 'status'}
    >
      <p className="pd-auth-surface__state-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{body}</p>
      {action ? (
        <div className="pd-auth-surface__state-action">
          {action}
        </div>
      ) : null}
    </aside>
  );
}

function resolvePresentedSurfaceId(
  mode: AuthSurfaceMode,
  state: AuthSurfaceState,
  isResetFlow: boolean,
  registrationStage: RegistrationStage,
) {
  if (state === 'blocked') return 'auth-28';
  if (state === 'serviceUnavailable') return 'auth-27';
  if (state === 'recoverySent') return 'auth-19';
  if (state === 'registrationCompleted') return 'auth-14';
  if (state === 'applicationReady') return 'auth-29';
  if (state === 'mfaEnrollmentRequired') return 'auth-17';
  if (mode === 'entry') return 'auth-01';
  if (mode === 'login') return 'auth-02';
  if (mode === 'register') {
    return registrationStage === 'choice' ? 'auth-03' : 'auth-04';
  }
  if (mode === 'mfa') return 'auth-16';
  return isResetFlow ? 'auth-20' : 'auth-18';
}

function validateLogin(
  email: string,
  password: string,
): FieldProblems {
  return {
    email: validateEmail(email),
    password: password ? undefined : 'Hasło jest wymagane.',
  };
}

function validateRegistration(
  email: string,
  fullName: string,
  password: string,
  passwordConfirmation: string,
): FieldProblems {
  return {
    email: validateEmail(email),
    fullName: fullName.trim().length >= 2
      ? undefined
      : 'Podaj imię i nazwisko.',
    password: password.length >= 12
      ? undefined
      : 'Hasło musi mieć co najmniej 12 znaków.',
    passwordConfirmation: passwordConfirmation === password
      ? undefined
      : 'Hasła muszą być identyczne.',
  };
}

function validateMfa(code: string): FieldProblems {
  return {
    code: /^\d{6}$/u.test(code.trim())
      ? undefined
      : 'Kod MFA musi mieć 6 cyfr.',
  };
}

function validateRecoveryRequest(email: string): FieldProblems {
  return {
    email: validateEmail(email),
  };
}

function validatePasswordReset(
  email: string,
  newPassword: string,
  newPasswordConfirmation: string,
  otp: string,
  resetToken: string,
): FieldProblems {
  return {
    email: validateEmail(email),
    newPasswordConfirmation: newPasswordConfirmation === newPassword
      ? undefined
      : 'Hasła muszą być identyczne.',
    otp: /^\d{6}$/u.test(otp.trim())
      ? undefined
      : 'Kod potwierdzający musi mieć 6 cyfr.',
    password: newPassword.length >= 12
      ? undefined
      : 'Nowe hasło musi mieć co najmniej 12 znaków.',
    resetToken: resetToken.trim()
      ? undefined
      : 'Link odzyskiwania jest nieprawidłowy lub wygasł.',
  };
}

function validateEmail(email: string): string | undefined {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email.trim())
    ? undefined
    : 'Podaj poprawny adres e-mail.';
}
