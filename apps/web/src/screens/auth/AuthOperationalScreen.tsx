import {
  Building2,
  CheckCircle2,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { Fragment } from 'react';
import { useEffect, useState } from 'react';

import '../../design-system/foundations/papadata-brand-surface.css';
import { createServerAuthApiClient } from '../../auth/serverAuthApiClient';
import type {
  AuthChallengeId,
  AuthGateway,
  AuthSession,
  PostLoginContextResolution,
  SessionId,
} from '../../contracts/auth';
import { asAuthChallengeId, asSessionId } from '../../contracts/ids';
import {
  authOperationalOrganizations,
  authOperationalScenarios,
  authOperationalSessionFixtures,
  authOperationalWorkspaces,
  authReauthenticationPurposes,
  type AuthOperationalFieldDefaults,
  type AuthOperationalScenario,
} from '../../fixtures/auth-experience';
import {
  ActionArrow,
  AppHeader,
  Button,
  InlineNotice,
  PasswordField,
  StatusBadge,
  TextField,
  VerificationCodeInput,
  type StatusBadgeStatus,
} from '../../design-system';
import './auth-operational.css';

export type AuthOperationalScreenProps = {
  fieldDefaults?: AuthOperationalFieldDefaults;
  gatewayFactory?: () => AuthGateway | Promise<AuthGateway>;
  initialScenario?: AuthOperationalScenario;
  modeLabel?: string;
  theme?: 'light' | 'dark';
};

type ResultState = {
  context?: PostLoginContextResolution;
  message: string;
  tone: 'neutral' | 'success' | 'warning' | 'error';
};

const scenarioOrder: readonly AuthOperationalScenario[] = [
  'login',
  'mfaChallenge',
  'passwordRecovery',
  'resetPassword',
  'invitation',
  'contextSelection',
  'sessionExpired',
  'activeSessions',
  'reauthentication',
  'securitySettings',
  'forbidden',
];

const workspaceStatusToBadge = {
  blocked: 'blocked',
  no_data: 'noData',
  not_ready: 'pending',
  ready: 'ready',
} as const satisfies Record<string, StatusBadgeStatus>;

export function AuthOperationalScreen({
  fieldDefaults = {},
  gatewayFactory = createServerAuthApiClient,
  initialScenario = 'login',
  modeLabel,
  theme = 'dark',
}: AuthOperationalScreenProps) {
  const [scenario, setScenario] = useState<AuthOperationalScenario>(initialScenario);
  const [gateway, setGateway] = useState<AuthGateway | null>(null);
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<SessionId | null>(
    scenario === 'activeSessions' ||
      scenario === 'reauthentication' ||
      scenario === 'securitySettings'
      ? asSessionId('ses_owner_active')
      : null,
  );
  const [challengeId, setChallengeId] = useState<AuthChallengeId | null>(
    scenario === 'mfaExpired' ? asAuthChallengeId('mfa_expired_owner') : null,
  );
  const [sessions, setSessions] = useState<readonly AuthSession[]>(
    authOperationalSessionFixtures,
  );
  const [result, setResult] = useState<ResultState>({
    message: authOperationalScenarios[initialScenario].impact,
    tone: 'neutral',
  });

  const copy = authOperationalScenarios[scenario];
  const isLoadingScenario = scenario === 'loginLoading';

  useEffect(() => {
    let active = true;

    Promise.resolve(gatewayFactory()).then((createdGateway) => {
      if (active) {
        setGateway(createdGateway);
      }
    });

    return () => {
      active = false;
    };
  }, [gatewayFactory]);

  function switchScenario(nextScenario: AuthOperationalScenario) {
    setScenario(nextScenario);
    if (requiresSession(nextScenario)) {
      setSessionId((currentSessionId) => currentSessionId ?? asSessionId('ses_owner_active'));
    }
    setResult({
      message: authOperationalScenarios[nextScenario].impact,
      tone: scenarioTone(nextScenario),
    });
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!gateway) {
      return;
    }

    const form = new FormData(event.currentTarget);
    setBusy(true);
    const login = await gateway.signIn({
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      returnUrl: String(form.get('returnUrl') ?? ''),
    });
    setBusy(false);

    if (login.status === 'mfa_required') {
      setChallengeId(login.challenge.challengeId);
      setScenario('mfaChallenge');
      setResult({
        message: 'MFA jest wymagane przed utworzeniem pełnej sesji.',
        tone: 'warning',
      });
      return;
    }

    if (login.status === 'authenticated') {
      setSessionId(login.session.sessionId);
      setResult({
        context: login.context,
        message: `Sesja aktywna. Bezpieczny powrót: ${login.returnUrl}`,
        tone: 'success',
      });
      return;
    }

    if (login.status === 'blocked' || login.status === 'error') {
      setResult({
        message: login.error.message,
        tone: 'error',
      });
      return;
    }

    setResult({
      message:
        login.status === 'password_change_required'
          ? 'Konto wymaga zmiany hasła przed kontynuacją.'
          : 'Konto wymaga resetu hasła przed kontynuacją.',
      tone: 'warning',
    });
  }

  async function submitMfa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!gateway) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const resolvedChallengeId = challengeId ?? asAuthChallengeId('mfa_active_owner');
    setBusy(true);
    const verified = await gateway.verifyMfaChallenge({
      challengeId: resolvedChallengeId,
      code: String(form.get('code') ?? ''),
    });
    setBusy(false);

    if (verified.status === 'authenticated') {
      setSessionId(verified.session.sessionId);
      setResult({
        context: verified.context,
        message: 'MFA potwierdzone. Sesja została utworzona.',
        tone: 'success',
      });
      return;
    }

    if (verified.status === 'error') {
      setResult({
        message: verified.error.message,
        tone: 'error',
      });
      return;
    }

    setResult({
      message: 'Proces MFA wymaga ponownego rozpoczęcia.',
      tone: 'warning',
    });
  }

  async function submitPasswordRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!gateway) {
      return;
    }

    const form = new FormData(event.currentTarget);
    setBusy(true);
    const response = await gateway.requestPasswordReset({
      email: String(form.get('email') ?? ''),
    });
    setBusy(false);
    setResult({
      message:
        response.status === 'success'
          ? response.value.neutralMessage
          : response.error.message,
      tone: response.status === 'success' ? 'success' : 'error',
    });
  }

  async function submitResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!gateway) {
      return;
    }

    const form = new FormData(event.currentTarget);
    setBusy(true);
    const response = await gateway.resetPassword({
      confirmPassword: String(form.get('confirmPassword') ?? ''),
      newPassword: String(form.get('newPassword') ?? ''),
      token: String(form.get('token') ?? ''),
    });
    setBusy(false);
    setResult({
      message:
        response.status === 'success'
          ? 'Hasło zostało zmienione, a istniejące sesje unieważnione.'
          : response.error.message,
      tone: response.status === 'success' ? 'success' : 'error',
    });
  }

  async function submitInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!gateway) {
      return;
    }

    const form = new FormData(event.currentTarget);
    setBusy(true);
    const response = await gateway.acceptInvitation({
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      token: String(form.get('token') ?? ''),
    });
    setBusy(false);

    if (response.status === 'authenticated') {
      setSessionId(response.session.sessionId);
      setResult({
        context: response.context,
        message: 'Zaproszenie zostało zaakceptowane i audytowane.',
        tone: 'success',
      });
      return;
    }

    if (response.status === 'error') {
      setResult({
        message: response.error.message,
        tone: 'error',
      });
      return;
    }

    setResult({
      message: 'Zaproszenie wymaga dodatkowego kroku auth.',
      tone: 'warning',
    });
  }

  async function runSessionAction(action: 'list' | 'revokeOther') {
    if (!gateway || !sessionId) {
      return;
    }

    setBusy(true);
    const response =
      action === 'list'
        ? await gateway.listSessions(sessionId)
        : await gateway.revokeOtherSessions(sessionId);
    setBusy(false);

    if (response.status === 'success') {
      setSessions(response.value);
      setResult({
        message:
          action === 'list'
            ? 'Lista sesji została odtworzona.'
            : 'Pozostałe sesje zostały unieważnione.',
        tone: 'success',
      });
      return;
    }

    setResult({
      message: response.error.message,
      tone: 'error',
    });
  }

  async function submitReauthentication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!gateway || !sessionId) {
      return;
    }

    const form = new FormData(event.currentTarget);
    setBusy(true);
    const response = await gateway.reauthenticate({
      password: String(form.get('password') ?? ''),
      purpose: 'revoke_session',
      sessionId,
    });
    setBusy(false);
    setResult({
      message:
        response.status === 'success'
          ? `Potwierdzenie ważne do ${response.value.expiresAt}.`
          : response.error.message,
      tone: response.status === 'success' ? 'success' : 'error',
    });
  }

  async function runSecurityAction(action: 'configure' | 'regenerate' | 'disable') {
    if (!gateway || !sessionId) {
      return;
    }

    setBusy(true);
    const response =
      action === 'configure'
        ? await gateway.configureMfa(sessionId)
        : action === 'regenerate'
          ? await gateway.regenerateRecoveryCodes(sessionId)
          : await gateway.disableMfa(sessionId);
    setBusy(false);
    setResult({
      message:
        response.status === 'success'
          ? 'Operacja bezpieczeństwa została wykonana i audytowana.'
          : response.error.message,
      tone: response.status === 'success' ? 'success' : 'error',
    });
  }

  return (
    <div className="pds-brand-surface pda-auth-shell pda-auth-op" data-theme={theme}>
      <AppHeader
        trailing={
          modeLabel ? (
            <span className="pda-auth-op__mode">{modeLabel}</span>
          ) : undefined
        }
      />

      <main className="pda-auth-op__main">
        <nav aria-label="AUTH-001" className="pda-auth-op__rail">
          {scenarioOrder.map((item) => (
            <button
              className={item === scenario ? 'is-active' : ''}
              key={item}
              onClick={() => switchScenario(item)}
              type="button"
            >
              {authOperationalScenarios[item].eyebrow}
            </button>
          ))}
        </nav>

        <section className="pda-auth-op__content" aria-labelledby="auth-op-title">
          <div className="pda-auth-op__heading">
            <span className="pda-auth-kicker">{copy.eyebrow}</span>
            <h1 id="auth-op-title">{copy.title}</h1>
            <p>{copy.impact}</p>
          </div>

          <div className="pda-auth-op__status-grid">
            <StatusPill tone="neutral" icon={<ShieldCheck size={18} />} label={copy.status} />
            <StatusPill
              tone={result.tone}
              icon={result.tone === 'error' ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
              label={result.message}
            />
          </div>

          <Fragment key={scenario}>
            {renderScenarioForm({
              busy: busy || isLoadingScenario || !gateway,
              copy,
              fieldDefaults,
              result,
              runSecurityAction,
              runSessionAction,
              scenario,
              sessions,
              submitInvitation,
              submitLogin,
              submitMfa,
              submitPasswordRecovery,
              submitReauthentication,
              submitResetPassword,
            })}
          </Fragment>
        </section>
      </main>
    </div>
  );
}

type RenderScenarioFormProps = {
  busy: boolean;
  copy: (typeof authOperationalScenarios)[AuthOperationalScenario];
  fieldDefaults: AuthOperationalFieldDefaults;
  result: ResultState;
  runSecurityAction: (action: 'configure' | 'regenerate' | 'disable') => void;
  runSessionAction: (action: 'list' | 'revokeOther') => void;
  scenario: AuthOperationalScenario;
  sessions: readonly AuthSession[];
  submitInvitation: (event: FormEvent<HTMLFormElement>) => void;
  submitLogin: (event: FormEvent<HTMLFormElement>) => void;
  submitMfa: (event: FormEvent<HTMLFormElement>) => void;
  submitPasswordRecovery: (event: FormEvent<HTMLFormElement>) => void;
  submitReauthentication: (event: FormEvent<HTMLFormElement>) => void;
  submitResetPassword: (event: FormEvent<HTMLFormElement>) => void;
};

function renderScenarioForm({
  busy,
  copy,
  fieldDefaults,
  result,
  runSecurityAction,
  runSessionAction,
  scenario,
  sessions,
  submitInvitation,
  submitLogin,
  submitMfa,
  submitPasswordRecovery,
  submitReauthentication,
  submitResetPassword,
}: RenderScenarioFormProps) {
  if (
    scenario === 'login' ||
    scenario === 'loginLoading' ||
    scenario === 'loginInvalidCredentials' ||
    scenario === 'loginAccountBlocked' ||
    scenario === 'noMembership' ||
    scenario === 'forbidden'
  ) {
    return (
      <form className="pda-auth-form pda-auth-op__form" onSubmit={submitLogin}>
        <AuthTextField defaultValue={copy.email} icon={<Mail size={18} />} label="E-mail" name="email" type="email" />
        <AuthPasswordField
          defaultValue={fieldDefaults.passwords?.[scenario] ?? ''}
          label="Hasło"
          name="password"
        />
        <AuthTextField defaultValue="/dashboard" icon={<ActionArrow />} label="Adres powrotu" name="returnUrl" />
        <PrimaryAction busy={busy} label={copy.action} />
      </form>
    );
  }

  if (
    scenario === 'mfaChallenge' ||
    scenario === 'mfaInvalid' ||
    scenario === 'mfaExpired' ||
    scenario === 'mfaRecoveryCode'
  ) {
    const code = fieldDefaults.mfaCodes?.[scenario] ?? '';

    return (
      <form className="pda-auth-form pda-auth-op__form" onSubmit={submitMfa}>
        <AuthCodeField defaultValue={code} label="Kod jednorazowy" name="code" />
        <PrimaryAction busy={busy} label={copy.action} />
      </form>
    );
  }

  if (scenario === 'passwordRecovery' || scenario === 'passwordRecoverySuccess') {
    return (
      <form className="pda-auth-form pda-auth-op__form" onSubmit={submitPasswordRecovery}>
        <AuthTextField defaultValue={copy.email} icon={<Mail size={18} />} label="E-mail" name="email" type="email" />
        <PrimaryAction busy={busy} label={copy.action} />
      </form>
    );
  }

  if (
    scenario === 'resetPassword' ||
    scenario === 'resetExpiredLink' ||
    scenario === 'resetUsedLink'
  ) {
    const token = fieldDefaults.tokens?.[scenario] ?? '';

    return (
      <form className="pda-auth-form pda-auth-op__form" onSubmit={submitResetPassword}>
        <AuthPasswordField defaultValue={token} label="Token procesu" name="token" />
        <AuthPasswordField defaultValue="FreshPassphrase123" label="Nowe hasło" name="newPassword" />
        <AuthPasswordField defaultValue="FreshPassphrase123" label="Powtórz hasło" name="confirmPassword" />
        <PrimaryAction busy={busy} label={copy.action} />
      </form>
    );
  }

  if (
    scenario === 'invitation' ||
    scenario === 'invitationExpired' ||
    scenario === 'invitationUsed' ||
    scenario === 'invitationEmailMismatch'
  ) {
    const token = fieldDefaults.tokens?.[scenario] ?? '';

    return (
      <form className="pda-auth-form pda-auth-op__form" onSubmit={submitInvitation}>
        <AuthTextField defaultValue={copy.email} icon={<Mail size={18} />} label="E-mail" name="email" type="email" />
        <AuthPasswordField defaultValue={fieldDefaults.passwords?.[scenario] ?? ''} label="Hasło" name="password" />
        <AuthPasswordField defaultValue={token} label="Token zaproszenia" name="token" />
        <PrimaryAction busy={busy} label={copy.action} />
      </form>
    );
  }

  if (
    scenario === 'contextSelection' ||
    scenario === 'workspaceNotReady' ||
    scenario === 'workspaceBlocked'
  ) {
    return (
      <div className="pda-auth-op__split">
        <div>
          <h2>Tenant</h2>
          {authOperationalOrganizations.map((organization) => (
            <button className="pda-auth-op__option" key={organization.organizationId} type="button">
              <Building2 size={18} />
              <span>{organization.name}</span>
            </button>
          ))}
        </div>
        <div>
          <h2>Przestrzeń robocza</h2>
          {authOperationalWorkspaces.map((workspace) => (
            <button className="pda-auth-op__option" key={workspace.workspaceId} type="button">
              <UsersRound size={18} />
              <span>{workspace.name}</span>
              <StatusBadge status={workspaceStatusToBadge[workspace.status]} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (scenario === 'activeSessions' || scenario === 'sessionExpired') {
    return (
      <div className="pda-auth-op__form">
        <div className="pda-auth-op__actions">
          <Button
            className="pda-auth-button"
            disabled={busy}
            iconBefore={<RefreshCw size={18} />}
            onClick={() => runSessionAction('list')}
            variant="secondary"
          >
            Lista sesji
          </Button>
          <Button
            className="pda-auth-button"
            disabled={busy}
            iconAfter={<ActionArrow />}
            onClick={() => runSessionAction('revokeOther')}
            variant="primary"
          >
            Unieważnij pozostałe
          </Button>
        </div>
        <SessionList sessions={sessions} />
      </div>
    );
  }

  if (scenario === 'reauthentication') {
    return (
      <form className="pda-auth-form pda-auth-op__form" onSubmit={submitReauthentication}>
        <AuthPasswordField defaultValue={fieldDefaults.passwords?.[scenario] ?? ''} label="Hasło" name="password" />
        <div className="pda-auth-op__purpose-list">
          {authReauthenticationPurposes.map((purpose) => (
            <span key={purpose.value}>{purpose.label}</span>
          ))}
        </div>
        <PrimaryAction busy={busy} label={copy.action} />
      </form>
    );
  }

  return (
    <div className="pda-auth-op__form">
      <div className="pda-auth-op__actions">
        <Button
          className="pda-auth-button"
          disabled={busy}
          onClick={() => runSecurityAction('configure')}
          variant="secondary"
        >
          Skonfiguruj MFA
        </Button>
        <Button
          className="pda-auth-button"
          disabled={busy}
          onClick={() => runSecurityAction('regenerate')}
          variant="secondary"
        >
          Kody odzyskiwania
        </Button>
        <Button
          className="pda-auth-button"
          disabled={busy}
          iconAfter={<ActionArrow />}
          onClick={() => runSecurityAction('disable')}
          variant="danger"
        >
          Wyłącz MFA
        </Button>
      </div>
      <p className="pda-auth-op__recovery">{result.context?.status ?? copy.recovery}</p>
    </div>
  );
}

type AuthTextFieldProps = {
  defaultValue: string;
  icon: ReactNode;
  inputMode?: 'numeric';
  label: string;
  name: string;
  type?: string;
};

function AuthTextField({
  defaultValue,
  icon,
  inputMode,
  label,
  name,
  type = 'text',
}: AuthTextFieldProps) {
  return (
    <TextField
      autoComplete="off"
      defaultValue={defaultValue}
      icon={icon}
      inputMode={inputMode}
      label={label}
      name={name}
      type={type}
    />
  );
}

function AuthPasswordField({
  defaultValue,
  label,
  name,
}: {
  defaultValue: string;
  label: string;
  name: string;
}) {
  return (
    <PasswordField
      autoComplete="off"
      defaultValue={defaultValue}
      label={label}
      name={name}
    />
  );
}

function AuthCodeField({
  defaultValue,
  label,
  name,
}: {
  defaultValue: string;
  label: string;
  name: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <VerificationCodeInput
      hint="Wpisz dokładnie sześć cyfr."
      id={`${name}-field`}
      label={label}
      name={name}
      onChange={setValue}
      value={value}
    />
  );
}

function PrimaryAction({ busy, label }: { busy: boolean; label: string }) {
  return (
    <Button
      className="pda-auth-button"
      disabled={busy}
      iconAfter={!busy ? <ActionArrow /> : undefined}
      loading={busy}
      type="submit"
      variant="primary"
    >
      {busy ? 'Przetwarzanie' : label}
    </Button>
  );
}

function SessionList({ sessions }: { sessions: readonly AuthSession[] }) {
  return (
    <div className="pda-auth-op__sessions">
      {sessions.map((session) => (
        <article key={session.sessionId}>
          <UserRoundCheck size={18} />
          <div>
            <strong>{session.clientLabel}</strong>
            <span>
              {session.status} · ostatnia aktywność {session.lastActivityAt}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function StatusPill({
  icon,
  label,
  tone,
}: {
  icon: ReactNode;
  label: string;
  tone: ResultState['tone'];
}) {
  return (
    <InlineNotice
      className={`pda-auth-op__pill pda-auth-op__pill--${tone}`}
      icon={icon}
      tone={tone === 'neutral' ? 'neutral' : tone}
    >
      {label}
    </InlineNotice>
  );
}

function requiresSession(scenario: AuthOperationalScenario): boolean {
  return (
    scenario === 'activeSessions' ||
    scenario === 'reauthentication' ||
    scenario === 'securitySettings' ||
    scenario === 'sessionExpired'
  );
}

function scenarioTone(scenario: AuthOperationalScenario): ResultState['tone'] {
  if (
    scenario.includes('Expired') ||
    scenario.includes('Invalid') ||
    scenario.includes('Blocked') ||
    scenario === 'forbidden' ||
    scenario === 'noMembership' ||
    scenario === 'sessionExpired'
  ) {
    return 'warning';
  }

  return 'neutral';
}
