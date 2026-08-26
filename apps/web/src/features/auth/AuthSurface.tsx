import type {
  FormEvent,
  ReactNode,
} from 'react';
import {
  useEffect,
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
  resolvePasswordStrengthLevel,
  TextAction,
  TextField,
  VerificationCodeInput,
} from '../../design-system';
import {
  papaDataRuntimePreferenceChangeEvent,
} from '../../design-system/foundations/runtime';
import type {
  PapaDataRuntimeLocale,
} from '../../design-system/foundations/runtime';
import {
  resolveAuthStatePanel,
  resolveAuthSurfaceCopy,
} from './authSurfaceContent';
import { AuthDataSourceMarquee } from './AuthDataSourceMarquee';
import { AuthInsightChart } from './AuthInsightChart';
import { AuthRuntimePreferences } from './AuthRuntimePreferences';
import {
  isOAuthProviderEnabled,
  type OAuthAvailability,
  type OAuthProviderId,
} from './oauthOutcomes';
import './auth-surface.css';

export type AuthSurfaceMode =
  | 'entry'
  | 'login'
  | 'register'
  | 'mfa'
  | 'recover'
  | 'reauth'
  | 'workspace'
  | 'accept-invite';

export type AuthSurfaceState =
  | 'ready'
  | 'validationError'
  | 'rateLimited'
  | 'blocked'
  | 'serviceUnavailable'
  | 'recoverySent'
  | 'registrationCompleted'
  | 'applicationReady'
  | 'mfaEnrollmentRequired'
  | 'loggedOut';

export type AuthLoginInput = {
  readonly email: string;
  readonly password: string;
  readonly rememberDevice: boolean;
};

export type AuthRegisterInput = {
  readonly email: string;
  readonly fullName: string;
  readonly organizationName: string;
  readonly password: string;
  readonly passwordConfirmation: string;
  readonly workspaceName: string;
};

export type AuthMfaInput = {
  readonly code: string;
};

export type AuthRecoveryRequestInput = {
  readonly email: string;
};

export type AuthStepUpInput = {
  readonly code: string;
};

export type AuthWorkspaceOption = {
  readonly tenantId: string;
  readonly tenantName?: string;
  readonly workspaceId: string;
  readonly workspaceName?: string;
};

export type AuthPasswordResetInput = {
  readonly email: string;
  readonly newPassword: string;
  readonly newPasswordConfirmation: string;
  readonly otp: string;
  readonly resetToken: string;
};

export type AuthInvitationPreview = {
  readonly email?: string;
  // True when this invitation's email already has a PapaData identity
  // elsewhere (e.g. joining a second tenant) — the accept form must ask the
  // visitor to sign in with their existing password instead of creating a
  // new account.
  readonly existingIdentity?: boolean;
  readonly role?: string;
  readonly status: string;
  readonly tenantName?: string;
  readonly workspaceName?: string;
};

export type AuthAcceptInvitationInput = {
  readonly displayName: string;
  readonly invitationId: string;
  readonly password: string;
  readonly passwordConfirmation: string;
  readonly token: string;
};

export type OAuthIntent =
  | 'login'
  | 'register'
  | 'accept_invitation'
  | 'link_account'
  | 'reauth';

export type AuthSurfaceProps = {
  readonly initialEmail?: string;
  readonly initialInvitationId?: string | null;
  readonly initialInvitationToken?: string | null;
  readonly initialRememberDevice?: boolean;
  readonly initialResetToken?: string | null;
  readonly mode: AuthSurfaceMode;
  // Real per-provider availability from auth.status.read — governs
  // whether the OAuth buttons render enabled or disabled-with-explanation.
  // Absent/undefined is treated the same as "configuration_required" for
  // both providers (safe default while status is still loading).
  readonly oauthAvailability?: OAuthAvailability;
  readonly workspaceOptions?: readonly AuthWorkspaceOption[];
  readonly onAcceptInvitation: (input: AuthAcceptInvitationInput) => Promise<void>;
  readonly onLogin: (input: AuthLoginInput) => Promise<void>;
  readonly onMfaConfirm: (input: AuthMfaInput) => Promise<void>;
  readonly onNavigate?: (path: string) => void;
  // Real navigation (window.location.assign to the provider's consent
  // screen) — never a no-op button. Required, like every other handler
  // here: a missing OAuth handler must be a build error, not a dead
  // button.
  readonly onOAuthContinue: (input: {
    readonly provider: OAuthProviderId;
    readonly intent: OAuthIntent;
  }) => Promise<void>;
  readonly onPasswordRecoveryRequest: (
    input: AuthRecoveryRequestInput,
  ) => Promise<void>;
  readonly onPasswordReset: (
    input: AuthPasswordResetInput,
  ) => Promise<void>;
  readonly onRegister: (input: AuthRegisterInput) => Promise<void>;
  readonly onRetry?: () => Promise<void> | void;
  readonly onSelectWorkspace: (workspaceId: string) => Promise<void>;
  readonly onStepUpConfirm: (input: AuthStepUpInput) => Promise<void>;
  readonly onValidateInvitation?: (
    input: { readonly invitationId: string; readonly token: string },
  ) => Promise<AuthInvitationPreview>;
  readonly state?: AuthSurfaceState;
};

type FieldProblems = {
  readonly code?: string;
  readonly email?: string;
  readonly fullName?: string;
  readonly newPasswordConfirmation?: string;
  readonly organizationName?: string;
  readonly otp?: string;
  readonly password?: string;
  readonly passwordConfirmation?: string;
  readonly resetToken?: string;
  readonly workspaceName?: string;
};

type RegistrationStage = 'choice' | 'email';
type AuthLocale = PapaDataRuntimeLocale;
type AuthFormCopy = ReturnType<typeof resolveAuthFormCopy>;

function readAuthRuntimeLocale(): AuthLocale {
  if (typeof document === 'undefined') return 'pl';
  return document.documentElement.dataset.locale === 'en' ? 'en' : 'pl';
}

function useAuthRuntimeLocale(): AuthLocale {
  const [locale, setLocale] = useState<AuthLocale>(readAuthRuntimeLocale);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    function handleRuntimePreferenceChange(event: Event) {
      if (event instanceof CustomEvent) {
        const detail = event.detail as { readonly locale?: unknown } | null;
        if (detail?.locale === 'pl' || detail?.locale === 'en') {
          setLocale(detail.locale);
          return;
        }
      }

      setLocale(readAuthRuntimeLocale());
    }

    window.addEventListener(
      papaDataRuntimePreferenceChangeEvent,
      handleRuntimePreferenceChange,
    );

    return () => {
      window.removeEventListener(
        papaDataRuntimePreferenceChangeEvent,
        handleRuntimePreferenceChange,
      );
    };
  }, []);

  return locale;
}

export function AuthSurface({
  initialEmail = '',
  initialInvitationId = null,
  initialInvitationToken = null,
  initialRememberDevice = false,
  initialResetToken = null,
  mode,
  oauthAvailability,
  workspaceOptions = [],
  onAcceptInvitation,
  onLogin,
  onMfaConfirm,
  onNavigate,
  onOAuthContinue,
  onPasswordRecoveryRequest,
  onPasswordReset,
  onRegister,
  onRetry,
  onSelectWorkspace,
  onStepUpConfirm,
  onValidateInvitation,
  state = 'ready',
}: AuthSurfaceProps) {
  const [email, setEmail] = useState(initialEmail);
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
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
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState<string | null>(null);
  const [oauthPending, setOauthPending] = useState<OAuthProviderId | null>(null);
  const [invitationPreview, setInvitationPreview] = useState<AuthInvitationPreview | null>(null);
  const [invitationPreviewError, setInvitationPreviewError] = useState<string | null>(null);
  const [invitationPreviewLoading, setInvitationPreviewLoading] = useState(mode === 'accept-invite');
  const surfaceRef = useRef<HTMLElement | null>(null);
  const locale = useAuthRuntimeLocale();
  const formCopy = useMemo(
    () => resolveAuthFormCopy(locale),
    [locale],
  );

  useEffect(() => {
    setFieldProblems({});
    setProblem(null);
    setSuccess(null);
  }, [locale]);

  useEffect(() => {
    if (mode !== 'accept-invite') return;
    if (!initialInvitationId || !initialInvitationToken || !onValidateInvitation) {
      setInvitationPreviewError(formCopy.invitationInvalid);
      setInvitationPreviewLoading(false);
      return;
    }
    let cancelled = false;
    setInvitationPreviewLoading(true);
    onValidateInvitation({
      invitationId: initialInvitationId,
      token: initialInvitationToken,
    }).then((preview) => {
      if (cancelled) return;
      if (preview.status !== 'valid') {
        setInvitationPreviewError(formCopy.invitationExpired);
      } else {
        setInvitationPreview(preview);
      }
    }).catch((cause: unknown) => {
      if (cancelled) return;
      setInvitationPreviewError(
        cause instanceof Error ? cause.message : formCopy.invitationVerifyError,
      );
    }).finally(() => {
      if (!cancelled) setInvitationPreviewLoading(false);
    });
    return () => { cancelled = true; };
  }, [mode, initialInvitationId, initialInvitationToken, formCopy]);

  const isResetFlow = mode === 'recover' && Boolean(resetToken);
  const copy = resolveAuthSurfaceCopy(mode, state, isResetFlow, locale);
  const statePanel = resolveAuthStatePanel(mode, state, isResetFlow, locale);
  const isHardBlocked = state === 'blocked' || state === 'serviceUnavailable';
  const isSubmissionBlocked = isHardBlocked || state === 'rateLimited';
  const isPassiveState = (
    state === 'blocked'
    || state === 'serviceUnavailable'
    || state === 'recoverySent'
    || state === 'registrationCompleted'
    || state === 'applicationReady'
    || state === 'mfaEnrollmentRequired'
    || state === 'loggedOut'
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
      label: formCopy.passwordRequirementLength,
      met: password.length >= 12,
    },
    {
      id: 'lowercase',
      label: formCopy.passwordRequirementLowercase,
      met: /[a-z]/u.test(password),
    },
    {
      id: 'uppercase',
      label: formCopy.passwordRequirementUppercase,
      met: /[A-Z]/u.test(password),
    },
    {
      id: 'digit',
      label: formCopy.passwordRequirementDigit,
      met: /[0-9]/u.test(password),
    },
  ], [formCopy, password]);

  const newPasswordRequirements = useMemo(() => [
    {
      id: 'length',
      label: formCopy.passwordRequirementLength,
      met: newPassword.length >= 12,
    },
    {
      id: 'lowercase',
      label: formCopy.passwordRequirementLowercase,
      met: /[a-z]/u.test(newPassword),
    },
    {
      id: 'uppercase',
      label: formCopy.passwordRequirementUppercase,
      met: /[A-Z]/u.test(newPassword),
    },
    {
      id: 'digit',
      label: formCopy.passwordRequirementDigit,
      met: /[0-9]/u.test(newPassword),
    },
  ], [formCopy, newPassword]);

  const passwordStrength = useMemo(
    () => computePasswordStrength(password, passwordRequirements),
    [password, passwordRequirements],
  );
  const passwordStrengthLabel = passwordStrength === null
    ? null
    : resolvePasswordStrengthLabel(passwordStrength, formCopy);
  const newPasswordStrength = useMemo(
    () => computePasswordStrength(newPassword, newPasswordRequirements),
    [newPassword, newPasswordRequirements],
  );
  const newPasswordStrengthLabel = newPasswordStrength === null
    ? null
    : resolvePasswordStrengthLabel(newPasswordStrength, formCopy);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmissionBlocked) return;

    const problems = validateLogin(email, password, formCopy);
    if (!submitIfValid(problems)) return;

    await runSubmit(async () => {
      await onLogin({
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
      organizationName,
      workspaceName,
      password,
      passwordConfirmation,
      formCopy,
    );
    if (!submitIfValid(problems)) return;

    await runSubmit(async () => {
      await onRegister({
        email: email.trim(),
        fullName: fullName.trim(),
        organizationName: organizationName.trim(),
        password,
        passwordConfirmation,
        workspaceName: workspaceName.trim(),
      });
      setSuccess(formCopy.registrationAccepted);
    });
  }

  async function submitAcceptInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmissionBlocked || !initialInvitationId || !initialInvitationToken) return;

    const isExistingIdentity = invitationPreview?.existingIdentity === true;
    const problems = isExistingIdentity
      ? validateAcceptInvitationExistingIdentity(password, formCopy)
      : validateAcceptInvitation(fullName, password, passwordConfirmation, formCopy);
    if (!submitIfValid(problems)) return;

    await runSubmit(async () => {
      await onAcceptInvitation({
        // The backend only uses displayName/passwordConfirmation for the
        // new-identity path — an existing identity authenticates with its
        // current password instead, so these are simply unused there.
        displayName: isExistingIdentity ? '' : fullName.trim(),
        invitationId: initialInvitationId,
        password,
        passwordConfirmation: isExistingIdentity ? password : passwordConfirmation,
        token: initialInvitationToken,
      });
    });
  }

  async function submitMfa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmissionBlocked) return;

    const problems = validateMfa(code, formCopy);
    if (!submitIfValid(problems)) return;

    await runSubmit(async () => {
      await onMfaConfirm({
        code: code.trim(),
      });
      setSuccess(formCopy.mfaConfirmed);
    });
  }

  async function submitReauth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmissionBlocked) return;

    const problems = validateMfa(code, formCopy);
    if (!submitIfValid(problems)) return;

    await runSubmit(async () => {
      await onStepUpConfirm({
        code: code.trim(),
      });
      setSuccess(formCopy.reauthConfirmed);
    });
  }

  async function startOAuthFlow(provider: OAuthProviderId, intent: OAuthIntent) {
    if (oauthPending) return;
    setProblem(null);
    setOauthPending(provider);
    try {
      // A real navigation follows inside onOAuthContinue
      // (window.location.assign to the provider's consent screen) — this
      // only ever throws for a request that fails before that redirect.
      await onOAuthContinue({ intent, provider });
    } catch (cause) {
      setProblem(
        cause instanceof Error
          ? cause.message
          : formCopy.operationFailed,
      );
      setOauthPending(null);
    }
  }

  async function selectWorkspaceOption(workspaceId: string) {
    if (pendingWorkspaceId) return;
    setProblem(null);
    setPendingWorkspaceId(workspaceId);
    try {
      await onSelectWorkspace(workspaceId);
    } catch (cause) {
      setProblem(
        cause instanceof Error
          ? cause.message
          : formCopy.workspaceSelectError,
      );
    } finally {
      setPendingWorkspaceId(null);
    }
  }

  async function submitRecoveryRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmissionBlocked) return;

    const problems = validateRecoveryRequest(email, formCopy);
    if (!submitIfValid(problems)) return;

    await runSubmit(async () => {
      await onPasswordRecoveryRequest({
        email: email.trim(),
      });
      setSuccess(
        formCopy.recoverySent,
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
      formCopy,
    );
    if (!submitIfValid(problems)) return;

    await runSubmit(async () => {
      await onPasswordReset({
        email: email.trim(),
        newPassword,
        newPasswordConfirmation,
        otp: otp.trim(),
        resetToken: resetToken.trim(),
      });
      setSuccess(formCopy.passwordReset);
    });
  }

  function submitIfValid(problems: FieldProblems) {
    setFieldProblems(problems);
    setProblem(null);
    setSuccess(null);
    const firstProblem = Object.values(problems).find(Boolean);

    if (firstProblem) {
      setProblem(formCopy.fixFields);
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
          : formCopy.operationFailed,
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
      className="pd-auth-surface pd-auth-theme"
      data-auth-mode={mode}
      data-auth-state={state}
      data-auth-surface={presentedSurfaceId}
      ref={surfaceRef}
    >
      <div className="pd-auth-surface__layout">
        <AuthMarketingPanel locale={locale} mode={mode} />

        <section
          aria-describedby="auth-description"
          aria-labelledby="auth-title"
          className="pd-auth-surface__form-panel"
        >
          <AuthRuntimePreferences />

          <div className="pd-auth-surface__workspace">
            <div className="pd-auth-surface__card-header">
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
                    locale={locale}
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
                title={formCopy.problemTitle}
                tone="critical"
              />
            ) : null}

            {success ? (
              <InlineNotice
                className="pd-auth-surface__notice"
                message={success}
                title={formCopy.successTitle}
                tone="success"
              />
            ) : null}

            {mode === 'entry' && !isPassiveState ? (
              <AuthEntryActions
                disabled={isHardBlocked}
                locale={locale}
                onNavigate={navigateTo}
              />
            ) : null}

            {mode === 'login' && !isPassiveState ? (
              <form className="pd-auth-surface__form" noValidate onSubmit={submitLogin}>
                <TextField
                  autocomplete="email"
                  inputType="email"
                  invalid={Boolean(fieldProblems.email)}
                  label={formCopy.email}
                  message={fieldProblems.email}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  required
                  value={email}
                />

                <PasswordField
                  autocomplete="current-password"
                  invalid={Boolean(fieldProblems.password)}
                  label={formCopy.password}
                  message={fieldProblems.password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  onVisibilityChange={setPasswordVisible}
                  required
                  value={password}
                  visible={passwordVisible}
                  visibilityLabelHidden={formCopy.showPassword}
                  visibilityLabelVisible={formCopy.hidePassword}
                />

                <Checkbox
                  checked={rememberDevice}
                  helperText={formCopy.rememberDeviceHelper}
                  label={formCopy.rememberDevice}
                  onChange={(event) => setRememberDevice(event.currentTarget.checked)}
                  value="remember-device"
                />

                <Button
                  disabled={isSubmissionBlocked}
                  fullWidth
                  loading={submitting}
                  loadingLabel={formCopy.loginLoading}
                  size="large"
                  type="submit"
                >
                  {formCopy.login}
                </Button>

                <OAuthProviderButtons
                  formCopy={formCopy}
                  intent="login"
                  oauthAvailability={oauthAvailability}
                  oauthPending={oauthPending}
                  onStart={(provider, intent) => void startOAuthFlow(provider, intent)}
                />
              </form>
            ) : null}

            {mode === 'register'
              && registrationStage === 'choice'
              && !isPassiveState ? (
                <div
                  aria-label={formCopy.registrationChoiceLabel}
                  className="pd-auth-surface__registration-choice"
                >
                  <Button
                    fullWidth
                    onClick={() => setRegistrationStage('email')}
                    size="large"
                  >
                    {formCopy.createByEmail}
                  </Button>
                  <OAuthProviderButtons
                    formCopy={formCopy}
                    intent="register"
                    oauthAvailability={oauthAvailability}
                    oauthPending={oauthPending}
                    onStart={(provider, intent) => void startOAuthFlow(provider, intent)}
                  />
                </div>
              ) : null}

            {mode === 'register'
              && registrationStage === 'email'
              && !isPassiveState ? (
                <form className="pd-auth-surface__form" noValidate onSubmit={submitRegister}>
                  <div className="pd-auth-surface__form-row">
                    <TextField
                      autocomplete="name"
                      invalid={Boolean(fieldProblems.fullName)}
                      label={formCopy.fullName}
                      message={fieldProblems.fullName}
                      onChange={(event) => setFullName(event.currentTarget.value)}
                      required
                      value={fullName}
                    />

                    <TextField
                      autocomplete="organization"
                      invalid={Boolean(fieldProblems.organizationName)}
                      label={formCopy.organization}
                      message={fieldProblems.organizationName}
                      onChange={(event) => setOrganizationName(event.currentTarget.value)}
                      required
                      value={organizationName}
                    />
                  </div>

                  <div className="pd-auth-surface__form-row">
                    <TextField
                      invalid={Boolean(fieldProblems.workspaceName)}
                      label={formCopy.workspace}
                      message={fieldProblems.workspaceName}
                      onChange={(event) => setWorkspaceName(event.currentTarget.value)}
                      required
                      value={workspaceName}
                    />

                    <TextField
                      autocomplete="email"
                      inputType="email"
                      invalid={Boolean(fieldProblems.email)}
                      label={formCopy.email}
                      message={fieldProblems.email}
                      onChange={(event) => setEmail(event.currentTarget.value)}
                      required
                      value={email}
                    />
                  </div>

                  <PasswordField
                    autocomplete="new-password"
                    invalid={Boolean(fieldProblems.password)}
                    label={formCopy.password}
                    message={fieldProblems.password}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                    onVisibilityChange={setPasswordVisible}
                    requirements={passwordRequirements}
                    required
                    strength={passwordStrength}
                    strengthLabel={passwordStrengthLabel}
                    value={password}
                    visible={passwordVisible}
                    visibilityLabelHidden={formCopy.showPassword}
                    visibilityLabelVisible={formCopy.hidePassword}
                  />

                  <PasswordField
                    autocomplete="new-password"
                    invalid={Boolean(fieldProblems.passwordConfirmation)}
                    label={formCopy.passwordConfirmation}
                    message={fieldProblems.passwordConfirmation}
                    onChange={(event) => setPasswordConfirmation(event.currentTarget.value)}
                    onVisibilityChange={setPasswordConfirmationVisible}
                    required
                    value={passwordConfirmation}
                    visible={passwordConfirmationVisible}
                    visibilityLabelHidden={formCopy.showPassword}
                    visibilityLabelVisible={formCopy.hidePassword}
                  />

                  <Button
                    disabled={isSubmissionBlocked}
                    fullWidth
                    loading={submitting}
                    loadingLabel={formCopy.createLoading}
                    size="large"
                    type="submit"
                  >
                    {formCopy.createAccount}
                  </Button>

                  <TextAction
                    onClick={() => setRegistrationStage('choice')}
                    tone="muted"
                  >
                    {formCopy.chooseOtherRegistration}
                  </TextAction>
                </form>
              ) : null}

            {mode === 'accept-invite' && !isPassiveState ? (
              invitationPreviewLoading ? (
                <p className="pd-auth-surface__scope-note">{formCopy.invitationChecking}</p>
              ) : invitationPreviewError ? (
                <InlineNotice
                  className="pd-auth-surface__notice"
                  message={invitationPreviewError}
                  title={formCopy.invitationUnavailable}
                  tone="critical"
                />
              ) : (
                <form className="pd-auth-surface__form" noValidate onSubmit={submitAcceptInvitation}>
                  <p className="pd-auth-surface__scope-note">
                    {invitationPreview?.email}
                    {' — '}
                    {invitationPreview?.role}
                    {formCopy.invitationIn}
                    {invitationPreview?.tenantName}
                    {' / '}
                    {invitationPreview?.workspaceName}
                  </p>

                  {invitationPreview?.existingIdentity ? (
                    <InlineNotice
                      className="pd-auth-surface__notice"
                      message={formCopy.invitationExistingAccountNote}
                      tone="info"
                    />
                  ) : (
                    <TextField
                      autocomplete="name"
                      invalid={Boolean(fieldProblems.fullName)}
                      label={formCopy.fullName}
                      message={fieldProblems.fullName}
                      onChange={(event) => setFullName(event.currentTarget.value)}
                      required
                      value={fullName}
                    />
                  )}

                  <PasswordField
                    autocomplete={invitationPreview?.existingIdentity ? 'current-password' : 'new-password'}
                    invalid={Boolean(fieldProblems.password)}
                    label={formCopy.password}
                    message={fieldProblems.password}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                    onVisibilityChange={setPasswordVisible}
                    requirements={invitationPreview?.existingIdentity ? undefined : passwordRequirements}
                    required
                    strength={invitationPreview?.existingIdentity ? undefined : passwordStrength}
                    strengthLabel={invitationPreview?.existingIdentity ? undefined : passwordStrengthLabel}
                    value={password}
                    visible={passwordVisible}
                    visibilityLabelHidden={formCopy.showPassword}
                    visibilityLabelVisible={formCopy.hidePassword}
                  />

                  {invitationPreview?.existingIdentity ? null : (
                    <PasswordField
                      autocomplete="new-password"
                      invalid={Boolean(fieldProblems.passwordConfirmation)}
                      label={formCopy.passwordConfirmation}
                      message={fieldProblems.passwordConfirmation}
                      onChange={(event) => setPasswordConfirmation(event.currentTarget.value)}
                      onVisibilityChange={setPasswordConfirmationVisible}
                      required
                      value={passwordConfirmation}
                      visible={passwordConfirmationVisible}
                      visibilityLabelHidden={formCopy.showPassword}
                      visibilityLabelVisible={formCopy.hidePassword}
                    />
                  )}

                  <Button
                    disabled={isSubmissionBlocked}
                    fullWidth
                    loading={submitting}
                    loadingLabel={invitationPreview?.existingIdentity ? formCopy.signInAndJoinLoading : formCopy.joiningLoading}
                    size="large"
                    type="submit"
                  >
                    {invitationPreview?.existingIdentity ? formCopy.signInAndJoin : formCopy.joinTeam}
                  </Button>

                  <OAuthProviderButtons
                    formCopy={formCopy}
                    intent="accept_invitation"
                    oauthAvailability={oauthAvailability}
                    oauthPending={oauthPending}
                    onStart={(provider, intent) => void startOAuthFlow(provider, intent)}
                  />
                </form>
              )
            ) : null}

            {mode === 'mfa' && !isPassiveState ? (
              <form className="pd-auth-surface__form" noValidate onSubmit={submitMfa}>
                <VerificationCodeInput
                  helperText={formCopy.mfaHelper}
                  invalid={Boolean(fieldProblems.code)}
                  label={formCopy.mfaCode}
                  message={fieldProblems.code}
                  onChange={(event) => setCode(event.currentTarget.value)}
                  required
                  value={code}
                />

                <Button
                  disabled={isSubmissionBlocked}
                  fullWidth
                  loading={submitting}
                  loadingLabel={formCopy.verifyingLoading}
                  size="large"
                  type="submit"
                >
                  {formCopy.confirmMfa}
                </Button>
              </form>
            ) : null}

            {mode === 'reauth' && !isPassiveState ? (
              <form className="pd-auth-surface__form" noValidate onSubmit={submitReauth}>
                <VerificationCodeInput
                  helperText={formCopy.reauthHelper}
                  invalid={Boolean(fieldProblems.code)}
                  label={formCopy.confirmationCode}
                  message={fieldProblems.code}
                  onChange={(event) => setCode(event.currentTarget.value)}
                  required
                  value={code}
                />

                <Button
                  disabled={isSubmissionBlocked}
                  fullWidth
                  loading={submitting}
                  loadingLabel={formCopy.confirmingLoading}
                  size="large"
                  type="submit"
                >
                  {formCopy.confirm}
                </Button>

                <OAuthProviderButtons
                  formCopy={formCopy}
                  intent="reauth"
                  oauthAvailability={oauthAvailability}
                  oauthPending={oauthPending}
                  onStart={(provider, intent) => void startOAuthFlow(provider, intent)}
                />
              </form>
            ) : null}

            {mode === 'workspace' && !isPassiveState ? (
              <div
                aria-label={formCopy.workspaceListLabel}
                className="pd-auth-surface__option-list"
              >
                {workspaceOptions.map((option) => (
                  <button
                    className="pd-auth-surface__option"
                    disabled={Boolean(pendingWorkspaceId)}
                    key={option.workspaceId}
                    onClick={() => void selectWorkspaceOption(option.workspaceId)}
                    type="button"
                  >
                    <span className="pd-auth-surface__option-title">
                      {option.tenantName ?? option.tenantId}
                    </span>
                    <span className="pd-auth-surface__option-subtitle">
                      {option.workspaceName ?? option.workspaceId}
                      {pendingWorkspaceId === option.workspaceId ? formCopy.selecting : ''}
                    </span>
                  </button>
                ))}
              </div>
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
                  label={formCopy.accountEmail}
                  message={fieldProblems.email}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  required
                  value={email}
                />

                <Button
                  disabled={isSubmissionBlocked}
                  fullWidth
                  loading={submitting}
                  loadingLabel={formCopy.sendingLoading}
                  size="large"
                  type="submit"
                >
                  {formCopy.sendInstructions}
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
                  label={formCopy.accountEmail}
                  message={fieldProblems.email}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  required
                  value={email}
                />

                <VerificationCodeInput
                  helperText={formCopy.otpHelper}
                  invalid={Boolean(fieldProblems.otp)}
                  label={formCopy.otpCode}
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
                  label={formCopy.newPassword}
                  message={fieldProblems.password}
                  onChange={(event) => setNewPassword(event.currentTarget.value)}
                  onVisibilityChange={setNewPasswordVisible}
                  requirements={newPasswordRequirements}
                  required
                  strength={newPasswordStrength}
                  strengthLabel={newPasswordStrengthLabel}
                  value={newPassword}
                  visible={newPasswordVisible}
                  visibilityLabelHidden={formCopy.showPassword}
                  visibilityLabelVisible={formCopy.hidePassword}
                />

                <PasswordField
                  autocomplete="new-password"
                  invalid={Boolean(fieldProblems.newPasswordConfirmation)}
                  label={formCopy.newPasswordConfirmation}
                  message={fieldProblems.newPasswordConfirmation}
                  onChange={(event) => setNewPasswordConfirmation(event.currentTarget.value)}
                  onVisibilityChange={setNewPasswordConfirmationVisible}
                  required
                  value={newPasswordConfirmation}
                  visible={newPasswordConfirmationVisible}
                  visibilityLabelHidden={formCopy.showPassword}
                  visibilityLabelVisible={formCopy.hidePassword}
                />

                <Button
                  disabled={isSubmissionBlocked}
                  fullWidth
                  loading={submitting}
                  loadingLabel={formCopy.settingPasswordLoading}
                  size="large"
                  type="submit"
                >
                  {formCopy.setNewPassword}
                </Button>
              </form>
            ) : null}

            <AuthSecondaryActions
              locale={locale}
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
      </div>
    </main>
  );
}

function AuthMarketingPanel({
  locale,
  mode,
}: {
  readonly locale: AuthLocale;
  readonly mode: AuthSurfaceMode;
}) {
  const copy = resolveAuthMarketingCopy(locale);

  return (
    <aside className="pd-auth-surface__marketing" aria-hidden="true">
      <div className="pd-auth-surface__brand-row">
        <PapaDataBrand decorative size="medium" variant="lockup" />
      </div>

      <div className="pd-auth-surface__marketing-body">
        <p className="pd-auth-surface__marketing-eyebrow">
          {copy.eyebrow}
        </p>
        <h2 className="pd-auth-surface__marketing-headline">
          {copy.headline}
        </h2>
        <p className="pd-auth-surface__marketing-description">
          {copy.description}
        </p>

        <AuthInsightChart locale={locale} mode={mode} />
        <AuthDataSourceMarquee locale={locale} />
      </div>

      <div className="pd-auth-surface__marketing-footer">© PapaData</div>
    </aside>
  );
}

function resolveAuthMarketingCopy(locale: AuthLocale) {
  return locale === 'en'
    ? {
      description: 'Sales, ads, and traffic from every channel combined into one coherent view of your business before the first decision of the day.',
      eyebrow: 'For e-commerce and marketing teams',
      headline: 'Data you can trust for every decision.',
    }
    : {
      description: 'Sprzedaż, reklama i ruch ze wszystkich kanałów — połączone w jeden, spójny obraz Twojego biznesu, gotowy zanim zaczniesz poranną kawę.',
      eyebrow: 'Dla zespołów e-commerce i marketingu',
      headline: 'Dane, którym można zaufać przy każdej decyzji.',
    };
}

function resolveAuthFormCopy(locale: AuthLocale) {
  return locale === 'en'
    ? {
      accountEmail: 'Account e-mail',
      chooseOtherRegistration: 'Choose another registration method',
      confirm: 'Confirm',
      confirmationCode: 'Confirmation code',
      confirmingLoading: 'Confirming...',
      confirmMfa: 'Confirm MFA',
      continueGoogle: 'Continue with Google',
      continueGoogleLoading: 'Redirecting to Google...',
      continueMicrosoft: 'Continue with Microsoft',
      continueMicrosoftLoading: 'Redirecting to Microsoft...',
      continueOAuth: 'Continue with OAuth',
      createAccount: 'Create account',
      createByEmail: 'Create account with e-mail',
      createLoading: 'Creating account...',
      email: 'E-mail',
      fixFields: 'Correct the highlighted fields to continue safely.',
      fullName: 'Full name',
      invitationChecking: 'Checking invitation...',
      invitationExistingAccountNote: 'This e-mail already has a PapaData account — sign in to join this workspace.',
      invitationExpired: 'This invitation has expired or has already been used. Ask for a new one.',
      invitationIn: ' in ',
      invitationInvalid: 'The invitation link is invalid.',
      invitationUnavailable: 'Invitation unavailable',
      invitationVerifyError: 'Could not verify the invitation.',
      joiningLoading: 'Joining...',
      joinTeam: 'Join the team',
      login: 'Sign in',
      loginLoading: 'Signing in...',
      methodUnavailable: 'This method is not currently available.',
      mfaCode: 'MFA code',
      mfaConfirmed: 'MFA confirmed. The session can continue.',
      mfaHelper: 'Enter the 6-digit code from your authenticator app.',
      newPassword: 'New password',
      newPasswordConfirmation: 'Repeat new password',
      operationFailed: 'The operation failed.',
      organization: 'Organization',
      otpCode: 'OTP code',
      otpHelper: 'One-time code from the reset message.',
      password: 'Password',
      passwordConfirmation: 'Repeat password',
      passwordMismatch: 'Passwords must match.',
      passwordRequired: 'Password is required.',
      passwordRequirementDigit: 'Digit',
      passwordRequirementLength: 'At least 12 characters',
      passwordRequirementLowercase: 'Lowercase letter',
      passwordRequirementUppercase: 'Uppercase letter',
      passwordReset: 'The password has been set. You can return to sign in.',
      passwordStrengthExcellent: 'Password strength: excellent',
      passwordStrengthFair: 'Password strength: fair',
      passwordStrengthStrong: 'Password strength: strong',
      passwordStrengthWeak: 'Password strength: weak',
      problemTitle: 'Check details',
      reauthConfirmed: 'Identity confirmed again. You can continue.',
      reauthHelper: 'Enter the current 6-digit code from your authenticator app.',
      recoverySent: 'If the account exists, we have sent access recovery instructions.',
      registrationAccepted: 'Registration has been accepted for the next access step.',
      registrationChoiceLabel: 'Choose registration method',
      rememberDevice: 'Remember this device',
      rememberDeviceHelper: 'Device trust depends on your organization policy.',
      requiredEmail: 'Enter a valid e-mail address.',
      requiredFullName: 'Enter your full name.',
      requiredOrganization: 'Enter organization name.',
      requiredOtpCode: 'The confirmation code must have 6 digits.',
      requiredResetToken: 'The recovery link is invalid or expired.',
      requiredVerificationCode: 'The MFA code must have 6 digits.',
      requiredWorkspace: 'Enter workspace name.',
      sendInstructions: 'Send instructions',
      sendingLoading: 'Sending...',
      selecting: ' - selecting...',
      setNewPassword: 'Set new password',
      settingPasswordLoading: 'Setting password...',
      signInAndJoin: 'Sign in and join',
      signInAndJoinLoading: 'Signing in...',
      hidePassword: 'Hide password',
      showPassword: 'Show password',
      strongPasswordDigit: (label: string) => `${label} must contain a digit.`,
      strongPasswordLength: (label: string) => `${label} must be at least 12 characters.`,
      strongPasswordLowercase: (label: string) => `${label} must contain a lowercase letter.`,
      strongPasswordUppercase: (label: string) => `${label} must contain an uppercase letter.`,
      successTitle: 'Operation accepted',
      verifyingLoading: 'Verifying...',
      workspace: 'Workspace',
      workspaceListLabel: 'Choose organization and workspace',
      workspaceSelectError: 'Could not choose the workspace.',
    }
    : {
      accountEmail: 'E-mail konta',
      chooseOtherRegistration: 'Wybierz inną metodę rejestracji',
      confirm: 'Potwierdź',
      confirmationCode: 'Kod potwierdzający',
      confirmingLoading: 'Potwierdzanie...',
      confirmMfa: 'Potwierdź MFA',
      continueGoogle: 'Kontynuuj przez Google',
      continueGoogleLoading: 'Przekierowanie do Google...',
      continueMicrosoft: 'Kontynuuj przez Microsoft',
      continueMicrosoftLoading: 'Przekierowanie do Microsoft...',
      continueOAuth: 'Kontynuuj przez OAuth',
      createAccount: 'Utwórz konto',
      createByEmail: 'Utwórz konto e-mailem',
      createLoading: 'Tworzenie konta...',
      email: 'E-mail',
      fixFields: 'Popraw oznaczone pola, aby bezpiecznie kontynuować.',
      fullName: 'Imię i nazwisko',
      invitationChecking: 'Sprawdzanie zaproszenia...',
      invitationExistingAccountNote: 'Ten e-mail ma już konto PapaData — zaloguj się, aby dołączyć do tego workspace.',
      invitationExpired: 'To zaproszenie wygasło lub zostało już wykorzystane. Poproś o nowe.',
      invitationIn: ' w ',
      invitationInvalid: 'Link zaproszenia jest nieprawidłowy.',
      invitationUnavailable: 'Zaproszenie niedostępne',
      invitationVerifyError: 'Nie udało się zweryfikować zaproszenia.',
      joiningLoading: 'Dołączanie...',
      joinTeam: 'Dołącz do zespołu',
      login: 'Zaloguj się',
      loginLoading: 'Logowanie...',
      methodUnavailable: 'Ta metoda nie jest obecnie dostępna.',
      mfaCode: 'Kod MFA',
      mfaConfirmed: 'MFA potwierdzone. Sesja może przejść dalej.',
      mfaHelper: 'Wpisz 6-cyfrowy kod z aplikacji uwierzytelniającej.',
      newPassword: 'Nowe hasło',
      newPasswordConfirmation: 'Powtórz nowe hasło',
      operationFailed: 'Operacja nie powiodła się.',
      organization: 'Organizacja',
      otpCode: 'Kod OTP',
      otpHelper: 'Kod jednorazowy z wiadomości resetu.',
      password: 'Hasło',
      passwordConfirmation: 'Powtórz hasło',
      passwordMismatch: 'Hasła muszą być identyczne.',
      passwordRequired: 'Hasło jest wymagane.',
      passwordRequirementDigit: 'Cyfra',
      passwordRequirementLength: 'Co najmniej 12 znaków',
      passwordRequirementLowercase: 'Mała litera',
      passwordRequirementUppercase: 'Wielka litera',
      passwordReset: 'Hasło zostało ustawione. Możesz wrócić do logowania.',
      passwordStrengthExcellent: 'Siła hasła: bardzo silne',
      passwordStrengthFair: 'Siła hasła: średnie',
      passwordStrengthStrong: 'Siła hasła: silne',
      passwordStrengthWeak: 'Siła hasła: słabe',
      problemTitle: 'Sprawdź dane',
      reauthConfirmed: 'Tożsamość potwierdzona ponownie. Możesz kontynuować.',
      reauthHelper: 'Wpisz aktualny 6-cyfrowy kod z aplikacji uwierzytelniającej.',
      recoverySent: 'Jeżeli konto istnieje, wysłaliśmy instrukcję odzyskania dostępu.',
      registrationAccepted: 'Rejestracja została przyjęta do dalszego procesu dostępu.',
      registrationChoiceLabel: 'Wybierz metodę rejestracji',
      rememberDevice: 'Zapamiętaj to urządzenie',
      rememberDeviceHelper: 'Zaufanie urządzeniu zależy od polityki organizacji.',
      requiredEmail: 'Podaj poprawny adres e-mail.',
      requiredFullName: 'Podaj imię i nazwisko.',
      requiredOrganization: 'Podaj nazwę organizacji.',
      requiredOtpCode: 'Kod potwierdzający musi mieć 6 cyfr.',
      requiredResetToken: 'Link odzyskiwania jest nieprawidłowy lub wygasł.',
      requiredVerificationCode: 'Kod MFA musi mieć 6 cyfr.',
      requiredWorkspace: 'Podaj nazwę workspace.',
      sendInstructions: 'Wyślij instrukcję',
      sendingLoading: 'Wysyłanie...',
      selecting: ' — wybieranie...',
      setNewPassword: 'Ustaw nowe hasło',
      settingPasswordLoading: 'Ustawianie hasła...',
      signInAndJoin: 'Zaloguj się i dołącz',
      signInAndJoinLoading: 'Logowanie...',
      hidePassword: 'Ukryj hasło',
      showPassword: 'Pokaż hasło',
      strongPasswordDigit: (label: string) => `${label} musi zawierać cyfrę.`,
      strongPasswordLength: (label: string) => `${label} musi mieć co najmniej 12 znaków.`,
      strongPasswordLowercase: (label: string) => `${label} musi zawierać małą literę.`,
      strongPasswordUppercase: (label: string) => `${label} musi zawierać wielką literę.`,
      successTitle: 'Operacja przyjęta',
      verifyingLoading: 'Weryfikacja...',
      workspace: 'Workspace',
      workspaceListLabel: 'Wybierz organizację i obszar roboczy',
      workspaceSelectError: 'Nie udało się wybrać obszaru roboczego.',
    };
}

function resolveAuthActionCopy(locale: AuthLocale) {
  return locale === 'en'
    ? {
      backToEntry: 'Back to auth entry',
      backToLogin: 'Back to sign in',
      createAccount: 'Create account',
      goToApp: 'Go to application',
      goToLogin: 'Go to sign in',
      login: 'Sign in',
      noAccountCreate: 'No account? Create one',
      recoverAccess: 'Recover access',
      retry: 'Try again',
    }
    : {
      backToEntry: 'Wróć do wejścia Auth',
      backToLogin: 'Wróć do logowania',
      createAccount: 'Utwórz konto',
      goToApp: 'Przejdź do aplikacji',
      goToLogin: 'Przejdź do logowania',
      login: 'Zaloguj się',
      noAccountCreate: 'Nie masz konta? Utwórz konto',
      recoverAccess: 'Odzyskaj dostęp',
      retry: 'Spróbuj ponownie',
    };
}

function OAuthProviderButtons({
  formCopy,
  intent,
  oauthAvailability,
  oauthPending,
  onStart,
}: {
  readonly formCopy: AuthFormCopy;
  readonly intent: OAuthIntent;
  readonly oauthAvailability?: OAuthAvailability;
  readonly oauthPending: OAuthProviderId | null;
  readonly onStart: (provider: OAuthProviderId, intent: OAuthIntent) => void;
}) {
  const googleAvailable = isOAuthProviderEnabled(oauthAvailability, 'google');
  const microsoftAvailable = isOAuthProviderEnabled(oauthAvailability, 'microsoft');
  const pending = Boolean(oauthPending);

  return (
    <div className="pd-auth-surface__oauth-buttons">
      <Button
        disabled={pending || !googleAvailable}
        fullWidth
        loading={oauthPending === 'google'}
        loadingLabel={formCopy.continueGoogleLoading}
        onClick={() => onStart('google', intent)}
        size="large"
        type="button"
        variant="secondary"
      >
        {formCopy.continueGoogle}
      </Button>
      <Button
        disabled={pending || !microsoftAvailable}
        fullWidth
        loading={oauthPending === 'microsoft'}
        loadingLabel={formCopy.continueMicrosoftLoading}
        onClick={() => onStart('microsoft', intent)}
        size="large"
        type="button"
        variant="secondary"
      >
        {formCopy.continueMicrosoft}
      </Button>
      {!googleAvailable || !microsoftAvailable ? <p>{formCopy.methodUnavailable}</p> : null}
    </div>
  );
}

function AuthEntryActions({
  disabled,
  locale,
  onNavigate,
}: {
  readonly disabled: boolean;
  readonly locale: AuthLocale;
  readonly onNavigate: (path: string) => void;
}) {
  const copy = resolveAuthActionCopy(locale);

  return (
    <div className="pd-auth-surface__entry-actions">
      <Button
        disabled={disabled}
        fullWidth
        onClick={() => onNavigate('/login')}
        size="large"
      >
        {copy.login}
      </Button>
      <Button
        disabled={disabled}
        fullWidth
        onClick={() => onNavigate('/register')}
        size="large"
        variant="secondary"
      >
        {copy.createAccount}
      </Button>
      <Button
        disabled={disabled}
        fullWidth
        onClick={() => onNavigate('/recover-access')}
        size="large"
        variant="ghost"
      >
        {copy.recoverAccess}
      </Button>
    </div>
  );
}

function AuthSecondaryActions({
  locale,
  mode,
  onNavigate,
}: {
  readonly locale: AuthLocale;
  readonly mode: AuthSurfaceMode;
  readonly onNavigate: (path: string) => void;
}) {
  if (mode === 'entry') return null;

  const copy = resolveAuthActionCopy(locale);

  return (
    <div className="pd-auth-surface__links">
      {mode !== 'login' ? (
        <TextAction onClick={() => onNavigate('/login')}>
          {copy.backToLogin}
        </TextAction>
      ) : null}
      {mode === 'login' ? (
        <>
          <TextAction onClick={() => onNavigate('/register')}>
            {copy.noAccountCreate}
          </TextAction>
          <TextAction
            onClick={() => onNavigate('/recover-access')}
            tone="muted"
          >
            {copy.recoverAccess}
          </TextAction>
        </>
      ) : null}
      {mode === 'register' ? (
        <TextAction
          onClick={() => onNavigate('/auth')}
          tone="muted"
        >
          {copy.backToEntry}
        </TextAction>
      ) : null}
    </div>
  );
}

function AuthStateActions({
  actionLabel,
  locale,
  onNavigate,
  onRetry,
  state,
}: {
  readonly actionLabel?: string;
  readonly locale: AuthLocale;
  readonly onNavigate: (path: string) => void;
  readonly onRetry?: () => Promise<void> | void;
  readonly state: AuthSurfaceState;
}) {
  const copy = resolveAuthActionCopy(locale);

  if (state === 'serviceUnavailable') {
    return (
      <Button
        disabled={!onRetry}
        onClick={() => void onRetry?.()}
        variant="secondary"
      >
        {copy.retry}
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
          {copy.recoverAccess}
        </Button>
        <TextAction onClick={() => onNavigate('/login')}>
          {copy.backToLogin}
        </TextAction>
      </div>
    );
  }

  if (state === 'applicationReady') {
    return (
      <Button onClick={() => onNavigate('/app')}>
        {copy.goToApp}
      </Button>
    );
  }

  if (state === 'loggedOut') {
    return (
      <Button onClick={() => onNavigate('/login')} variant="secondary">
        {copy.goToLogin}
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
  if (state === 'loggedOut') return 'auth-26';
  if (mode === 'entry') return 'auth-01';
  if (mode === 'login') return 'auth-02';
  if (mode === 'register') {
    return registrationStage === 'choice' ? 'auth-03' : 'auth-04';
  }
  if (mode === 'mfa') return 'auth-16';
  if (mode === 'reauth') return 'auth-24';
  if (mode === 'workspace') return 'auth-23';
  if (mode === 'accept-invite') return 'auth-04';
  return isResetFlow ? 'auth-20' : 'auth-18';
}

function validateLogin(
  email: string,
  password: string,
  copy: AuthFormCopy,
): FieldProblems {
  return {
    email: validateEmail(email, copy),
    password: password ? undefined : copy.passwordRequired,
  };
}

function validateRegistration(
  email: string,
  fullName: string,
  organizationName: string,
  workspaceName: string,
  password: string,
  passwordConfirmation: string,
  copy: AuthFormCopy,
): FieldProblems {
  return {
    email: validateEmail(email, copy),
    fullName: fullName.trim().length >= 2
      ? undefined
      : copy.requiredFullName,
    organizationName: organizationName.trim().length >= 2
      ? undefined
      : copy.requiredOrganization,
    password: validateStrongPassword(password, copy.password, copy),
    passwordConfirmation: passwordConfirmation === password
      ? undefined
      : copy.passwordMismatch,
    workspaceName: workspaceName.trim().length >= 2
      ? undefined
      : copy.requiredWorkspace,
  };
}

function validateAcceptInvitation(
  fullName: string,
  password: string,
  passwordConfirmation: string,
  copy: AuthFormCopy,
): FieldProblems {
  return {
    fullName: fullName.trim().length >= 2
      ? undefined
      : copy.requiredFullName,
    password: validateStrongPassword(password, copy.password, copy),
    passwordConfirmation: passwordConfirmation === password
      ? undefined
      : copy.passwordMismatch,
  };
}

// The invited email already has an account: this is a sign-in, not account
// creation, so only an existing (not "new strong") password is required.
function validateAcceptInvitationExistingIdentity(
  password: string,
  copy: AuthFormCopy,
): FieldProblems {
  return {
    password: password ? undefined : copy.passwordRequired,
  };
}

function validateMfa(
  code: string,
  copy: AuthFormCopy,
): FieldProblems {
  return {
    code: /^\d{6}$/u.test(code.trim())
      ? undefined
      : copy.requiredVerificationCode,
  };
}

function validateRecoveryRequest(
  email: string,
  copy: AuthFormCopy,
): FieldProblems {
  return {
    email: validateEmail(email, copy),
  };
}

function validatePasswordReset(
  email: string,
  newPassword: string,
  newPasswordConfirmation: string,
  otp: string,
  resetToken: string,
  copy: AuthFormCopy,
): FieldProblems {
  return {
    email: validateEmail(email, copy),
    newPasswordConfirmation: newPasswordConfirmation === newPassword
      ? undefined
      : copy.passwordMismatch,
    otp: /^\d{6}$/u.test(otp.trim())
      ? undefined
      : copy.requiredOtpCode,
    password: validateStrongPassword(newPassword, copy.newPassword, copy),
    resetToken: resetToken.trim()
      ? undefined
      : copy.requiredResetToken,
  };
}

function validateEmail(
  email: string,
  copy: AuthFormCopy,
): string | undefined {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email.trim())
    ? undefined
    : copy.requiredEmail;
}

function validateStrongPassword(
  password: string,
  label: string,
  copy: AuthFormCopy,
): string | undefined {
  if (password.length < 12) return copy.strongPasswordLength(label);
  if (!/[a-z]/u.test(password)) return copy.strongPasswordLowercase(label);
  if (!/[A-Z]/u.test(password)) return copy.strongPasswordUppercase(label);
  if (!/[0-9]/u.test(password)) return copy.strongPasswordDigit(label);
  return undefined;
}

/**
 * Score derived from the same 4 requirement checks the checklist already
 * shows (so the bar and the checklist can never visually disagree), plus a
 * length bonus for going beyond the 12-character minimum — rewards a longer
 * password without inventing a 5th, unlisted criterion (e.g. symbols) the
 * checklist doesn't mention. Returns null for an empty password so the bar
 * doesn't render at all before the user has typed anything.
 */
function computePasswordStrength(
  password: string,
  requirements: readonly { readonly met: boolean }[],
): number | null {
  if (password.length === 0) {
    return null;
  }

  const metCount = requirements.filter((requirement) => requirement.met).length;
  const requirementScore = requirements.length > 0
    ? (metCount / requirements.length) * 70
    : 0;
  const lengthBonus = (Math.min(Math.max(password.length - 12, 0), 12) / 12) * 30;

  return Math.round(Math.min(100, requirementScore + lengthBonus));
}

function resolvePasswordStrengthLabel(
  score: number,
  copy: AuthFormCopy,
): string {
  switch (resolvePasswordStrengthLevel(score)) {
    case 'excellent':
      return copy.passwordStrengthExcellent;
    case 'strong':
      return copy.passwordStrengthStrong;
    case 'fair':
      return copy.passwordStrengthFair;
    default:
      return copy.passwordStrengthWeak;
  }
}
