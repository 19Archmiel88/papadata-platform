import type { FormEvent } from 'react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Button,
  EmptyState,
  ErrorState,
  InlineNotice,
  PageHeader,
  SectionNavigation,
  Select,
  Skeleton,
  TextAction,
  TextField,
  VerificationCodeInput,
} from '../../design-system';
import { useSession } from '../../app/providers';
import { bffClient } from '../../shared/api/bffClient';
import {
  findSettingsRuntimeDefinition,
  settingsRuntimeDefinitions,
} from './settingsRuntimeDefinitions';
import type {
  SettingsRuntimeDefinition,
} from './settingsRuntimeDefinitions';
import './settings-runtime.css';

type RuntimeRecord = {
  readonly data?: Readonly<Record<string, unknown>>;
  readonly externalKey?: string;
  readonly id?: string;
  readonly status?: string;
  readonly updatedAt?: string;
  // settings.memberships.read's real shape (InvitationRepository.
  // listMembersAndInvitations, packages/database/src/product-domain.ts)
  // doesn't nest into `data` -- these fields sit directly on each item.
  readonly email?: string;
  readonly lastSeenAt?: string | null;
  readonly mfa?: boolean;
  readonly person?: string;
  readonly role?: string;
};

type RuntimeSettingsResponse = {
  readonly items?: readonly RuntimeRecord[];
  readonly operationId?: string;
  readonly source?: string;
};

export function SettingsRuntimeScreen({
  path,
}: {
  readonly path: string;
}) {
  const definition = useMemo(
    () => findSettingsRuntimeDefinition(path) ?? settingsRuntimeDefinitions[0],
    [path],
  );
  const { session } = useSession();
  const [data, setData] = useState<RuntimeSettingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!definition?.apiPath) {
      setData({ items: [], source: 'no-runtime-operation' });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await bffClient.readDomainScreen<RuntimeSettingsResponse>(definition.apiPath);
      setData(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nie udało się odczytać ustawień.');
    } finally {
      setLoading(false);
    }
  }, [definition]);

  useEffect(() => {
    void load();
  }, [load, session?.activeWorkspaceId]);

  if (!definition) return null;

  return (
    <section className="pd-settings-runtime" data-screen-id={definition.id}>
      <PageHeader
        actions={(
          <Button
            disabled={loading}
            onClick={() => void load()}
            size="small"
            variant="secondary"
          >
            {loading ? 'Odświeżanie…' : 'Odśwież'}
          </Button>
        )}
        breadcrumbs={[
          { href: '/app', label: 'Aplikacja' },
          { href: '/app/settings/organizacja', label: 'Ustawienia' },
          { href: null, label: definition.displayTitle },
        ]}
        subtitle={definition.summary}
        title={definition.displayTitle}
      />

      <SectionNavigation
        activeId={definition.id}
        ariaLabel="Widoki ustawień"
        items={settingsRuntimeDefinitions.flatMap((item) => (
          item.routeBase
            ? [{ href: item.routeBase, id: item.id, label: item.displayTitle }]
            : []
        ))}
        orientation="horizontal"
        size="compact"
        sticky
      />

      <RuntimeSessionContext definition={definition} />

      {loading ? (
        <div className="pd-settings-runtime__loading" aria-label="Ładowanie ustawień">
          <Skeleton height="5rem" lines={1} shape="rect" width="100%" />
          <Skeleton height="8rem" lines={1} shape="rect" width="100%" />
        </div>
      ) : error ? (
        <ErrorState
          errorCode="SETTINGS_RUNTIME_ERROR"
          message={error}
          onRetry={() => void load()}
          recoverable
          title="Nie udało się odczytać ustawień"
          variant="system"
        />
      ) : definition.variant === 'memberships' ? (
        <MembershipsPanel items={data?.items ?? []} onChanged={load} />
      ) : definition.variant === 'account-security' ? (
        <AccountSecurityPanel />
      ) : (
        <RuntimeRecords
          definition={definition}
          records={data?.items ?? []}
          source={data?.source ?? null}
        />
      )}
    </section>
  );
}

function RuntimeSessionContext({
  definition,
}: {
  readonly definition: SettingsRuntimeDefinition;
}) {
  const { session } = useSession();
  if (!session) return null;

  if (definition.variant === 'sessions') {
    return (
      <section className="pd-settings-runtime__session-card" aria-labelledby="current-session-title">
        <div>
          <span className="pd-settings-runtime__eyebrow">Aktualna sesja</span>
          <h2 id="current-session-title">To urządzenie</h2>
        </div>
        <dl>
          <div><dt>Session ID</dt><dd>{session.sessionId}</dd></div>
          <div><dt>Poziom uwierzytelnienia</dt><dd>{session.authLevel}</dd></div>
          <div><dt>Workspace</dt><dd>{session.activeWorkspaceId}</dd></div>
          <div><dt>Wygasa</dt><dd>{formatDateTime(session.expiresAt)}</dd></div>
        </dl>
      </section>
    );
  }

  if (definition.variant === 'account-security') {
    return (
      <InlineNotice
        message={`Aktywna sesja działa z poziomem „${session.authLevel}”. Operacje wrażliwe są dodatkowo chronione przez backend capability i step-up/MFA.`}
        title="Bezpieczeństwo aktywnej sesji"
        tone="info"
      />
    );
  }

  return null;
}

const ROLE_LABELS: Readonly<Record<string, string>> = {
  'Tenant Owner': 'Właściciel',
  'Workspace Admin': 'Administrator workspace',
  Analyst: 'Analityk',
  'Marketing Operator': 'Operator marketingu',
  Viewer: 'Obserwator',
  'Billing Admin': 'Administrator rozliczeń',
  'Auditor/Security': 'Audytor / Bezpieczeństwo',
  'Internal Support/Operations': 'Wsparcie wewnętrzne',
};

// "Internal Support/Operations" is deliberately excluded from the invite
// picker -- it's reserved for PapaData's own staff (see the matching
// exclusion server-side in contract-runtime.service.ts's INVITABLE_ROLES).
const INVITE_ROLE_OPTIONS = [
  'Tenant Owner',
  'Workspace Admin',
  'Analyst',
  'Marketing Operator',
  'Viewer',
  'Billing Admin',
  'Auditor/Security',
].map((role) => ({ label: ROLE_LABELS[role] ?? role, value: role }));

const MEMBER_STATUS_LABELS: Readonly<Record<string, string>> = {
  active: 'Aktywny',
  blocked: 'Zablokowany',
  invited: 'Zaproszony',
  revoked: 'Cofnięty',
};

function MembershipsPanel({
  items,
  onChanged,
}: {
  readonly items: readonly RuntimeRecord[];
  readonly onChanged: () => void;
}) {
  const { session, stepUp } = useSession();
  const hasStepUp = session?.authLevel === 'step_up';

  const [stepUpCode, setStepUpCode] = useState('');
  const [stepUpSubmitting, setStepUpSubmitting] = useState(false);
  const [stepUpError, setStepUpError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function confirmStepUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStepUpSubmitting(true);
    setStepUpError(null);
    try {
      // Two-hop dance: a fresh session starts at authLevel "session" and
      // must prove MFA once (-> "mfa") before step-up can be issued
      // (-> "step_up") -- see apps/bff/src/session-assurance.service.ts's
      // hasMfaAssurance(). Both calls reuse the same 6-digit code, valid
      // for its ~30s TOTP window either way.
      await bffClient.confirmMfa({ code: stepUpCode });
      await stepUp(stepUpCode, 'invitation.request');
      setStepUpCode('');
    } catch (cause) {
      setStepUpError(
        cause instanceof Error
          ? cause.message
          : 'Nie udało się potwierdzić kodu. Jeśli MFA nie jest jeszcze skonfigurowane, zrób to najpierw w sekcji „Bezpieczeństwo konta”.',
      );
    } finally {
      setStepUpSubmitting(false);
    }
  }

  async function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!role) {
      setInviteError('Wybierz rolę.');
      return;
    }
    setInviteSubmitting(true);
    setInviteError(null);
    try {
      const result = await bffClient.inviteMember({ email, role });
      setInviteLink(
        `${window.location.origin}/accept-invite?invitationId=${
          encodeURIComponent(result.invitationId)
        }&token=${encodeURIComponent(result.token)}`,
      );
      setEmail('');
      setRole(null);
      onChanged();
    } catch (cause) {
      setInviteError(cause instanceof Error ? cause.message : 'Nie udało się wysłać zaproszenia.');
    } finally {
      setInviteSubmitting(false);
    }
  }

  async function revoke(invitationId: string) {
    await bffClient.revokeInvitation(invitationId);
    onChanged();
  }

  async function copyLink() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="pd-settings-memberships" aria-label="Członkowie zespołu">
      {items.length === 0 ? (
        <EmptyState
          message="Ten workspace nie ma jeszcze żadnych zarejestrowanych członków poza Tobą."
          title="Brak dodatkowych członków"
          variant="empty"
        />
      ) : (
        <table className="pd-settings-memberships__table">
          <thead>
            <tr>
              <th>Osoba</th>
              <th>Rola</th>
              <th>Status</th>
              <th>MFA</th>
              <th>Ostatnia aktywność</th>
              <th aria-label="Akcje" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const id = item.id ?? item.externalKey ?? String(index);
              const status = item.status ?? '';
              return (
                <tr key={id}>
                  <td>{item.person ?? item.email ?? '—'}</td>
                  <td>{ROLE_LABELS[item.role ?? ''] ?? item.role ?? '—'}</td>
                  <td>{MEMBER_STATUS_LABELS[status] ?? status}</td>
                  <td>{item.mfa === true ? 'Tak' : '—'}</td>
                  <td>{item.lastSeenAt ? formatDateTime(item.lastSeenAt) : '—'}</td>
                  <td>
                    {status === 'invited' ? (
                      <TextAction onClick={() => void revoke(id)} tone="muted">
                        Cofnij
                      </TextAction>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="pd-settings-memberships__invite">
        <h3>Zaproś do zespołu</h3>

        {!hasStepUp ? (
          <form className="pd-settings-memberships__form" noValidate onSubmit={confirmStepUp}>
            <p>Zapraszanie nowych osób wymaga dodatkowego potwierdzenia tożsamości (step-up).</p>
            <VerificationCodeInput
              helperText="Wpisz 6-cyfrowy kod z aplikacji uwierzytelniającej."
              invalid={Boolean(stepUpError)}
              label="Kod potwierdzający"
              message={stepUpError}
              onChange={(event) => setStepUpCode(event.currentTarget.value)}
              required
              value={stepUpCode}
            />
            <Button disabled={stepUpCode.length !== 6} loading={stepUpSubmitting} type="submit">
              Potwierdź
            </Button>
          </form>
        ) : inviteLink ? (
          <div className="pd-settings-memberships__invite-link">
            <InlineNotice
              message={`Link jednorazowy, ważny 7 dni. Przekaż go odbiorcy dowolnym kanałem: ${inviteLink}`}
              title="Zaproszenie utworzone"
              tone="success"
            />
            <div className="pd-settings-memberships__invite-link-actions">
              <Button onClick={() => void copyLink()} variant="secondary">
                {copied ? 'Skopiowano' : 'Kopiuj link'}
              </Button>
              <TextAction onClick={() => { setInviteLink(null); setCopied(false); }}>
                Zaproś kolejną osobę
              </TextAction>
            </div>
          </div>
        ) : (
          <form className="pd-settings-memberships__form" noValidate onSubmit={submitInvite}>
            <TextField
              autocomplete="email"
              inputType="email"
              label="E-mail"
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
              value={email}
            />
            <Select
              label="Rola"
              onChange={(event) => setRole(event.currentTarget.value)}
              options={INVITE_ROLE_OPTIONS}
              placeholder="Wybierz rolę"
              required
              value={role}
            />
            {inviteError ? (
              <InlineNotice message={inviteError} title="Nie udało się wysłać zaproszenia" tone="critical" />
            ) : null}
            <Button loading={inviteSubmitting} type="submit">
              Wyślij zaproszenie
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

function AccountSecurityPanel() {
  const [accountName, setAccountName] = useState('');
  const [enrollment, setEnrollment] = useState<{
    readonly otpauthUri: string;
    readonly recoveryCodes: readonly string[];
    readonly secret: string;
  } | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const { refresh } = useSession();

  async function startEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnrolling(true);
    setEnrollError(null);
    try {
      const result = await bffClient.enrollMfa({ accountName: accountName.trim() });
      setEnrollment(result);
    } catch (cause) {
      setEnrollError(cause instanceof Error ? cause.message : 'Nie udało się rozpocząć konfiguracji MFA.');
    } finally {
      setEnrolling(false);
    }
  }

  async function confirmEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirming(true);
    setConfirmError(null);
    try {
      const result = await bffClient.confirmMfa({ code });
      if (!result.verified) {
        setConfirmError('Nieprawidłowy kod. Sprawdź godzinę urządzenia i spróbuj ponownie.');
        return;
      }
      setConfirmed(true);
      await refresh();
    } catch (cause) {
      setConfirmError(cause instanceof Error ? cause.message : 'Nie udało się potwierdzić kodu.');
    } finally {
      setConfirming(false);
    }
  }

  if (confirmed) {
    return (
      <InlineNotice
        message="MFA jest aktywne dla tego konta. Operacje wrażliwe (np. zapraszanie do zespołu) mogą teraz poprosić o dodatkowe potwierdzenie kodem."
        title="MFA skonfigurowane"
        tone="success"
      />
    );
  }

  if (enrollment) {
    return (
      <section className="pd-settings-mfa-enroll" aria-label="Potwierdź konfigurację MFA">
        <InlineNotice
          message={`Dodaj to konto w aplikacji uwierzytelniającej (Google Authenticator, 1Password, Authy...) ręcznie wpisując poniższy klucz, ponieważ ten ekran nie generuje kodu QR.`}
          title="Klucz konfiguracyjny"
          tone="info"
        />
        <dl className="pd-settings-mfa-enroll__secret">
          <div><dt>Klucz (base32)</dt><dd><code>{enrollment.secret}</code></dd></div>
        </dl>
        <details>
          <summary>Kody odzyskiwania (pokaż raz)</summary>
          <p>Zapisz je w bezpiecznym miejscu — nie da się ich wyświetlić ponownie.</p>
          <ul className="pd-settings-mfa-enroll__recovery-codes">
            {enrollment.recoveryCodes.map((recoveryCode) => (
              <li key={recoveryCode}><code>{recoveryCode}</code></li>
            ))}
          </ul>
        </details>
        <form className="pd-settings-memberships__form" noValidate onSubmit={confirmEnrollment}>
          <VerificationCodeInput
            helperText="Wpisz kod wygenerowany przez aplikację uwierzytelniającą, aby potwierdzić konfigurację."
            invalid={Boolean(confirmError)}
            label="Kod potwierdzający"
            message={confirmError}
            onChange={(event) => setCode(event.currentTarget.value)}
            required
            value={code}
          />
          <Button disabled={code.length !== 6} loading={confirming} type="submit">
            Potwierdź konfigurację
          </Button>
        </form>
      </section>
    );
  }

  return (
    <form className="pd-settings-memberships__form" noValidate onSubmit={startEnrollment}>
      <p>MFA nie jest jeszcze skonfigurowane dla tego konta. Wymagają go operacje wrażliwe, np. zapraszanie do zespołu.</p>
      <TextField
        helperText="Etykieta widoczna w aplikacji uwierzytelniającej, np. Twój e-mail."
        label="Nazwa konta"
        onChange={(event) => setAccountName(event.currentTarget.value)}
        required
        value={accountName}
      />
      {enrollError ? (
        <InlineNotice message={enrollError} title="Nie udało się rozpocząć konfiguracji" tone="critical" />
      ) : null}
      <Button disabled={accountName.trim().length < 3} loading={enrolling} type="submit">
        Rozpocznij konfigurację MFA
      </Button>
    </form>
  );
}

function RuntimeRecords({
  definition,
  records,
  source,
}: {
  readonly definition: SettingsRuntimeDefinition;
  readonly records: readonly RuntimeRecord[];
  readonly source: string | null;
}) {
  if (records.length === 0) {
    return (
      <EmptyState
        message={`Backend nie zwrócił jeszcze dodatkowych rekordów dla widoku „${definition.displayTitle}”. Dane sesji i uprawnienia nadal pochodzą z aktywnego kontekstu runtime.`}
        title="Brak dodatkowych danych"
        variant="empty"
      />
    );
  }

  return (
    <section className="pd-settings-runtime__records" aria-label={`Dane: ${definition.displayTitle}`}>
      <header>
        <div>
          <span className="pd-settings-runtime__eyebrow">Źródło runtime</span>
          <h2>Dane aktywnego workspace</h2>
        </div>
        {source ? <span className="pd-settings-runtime__source">{source}</span> : null}
      </header>
      <div className="pd-settings-runtime__record-grid">
        {records.map((record, index) => (
          <article className="pd-settings-runtime__record" key={record.id ?? record.externalKey ?? index}>
            <header>
              <h3>{record.externalKey ?? record.id ?? `Rekord ${index + 1}`}</h3>
              {record.status ? <span>{record.status}</span> : null}
            </header>
            {record.data ? <RuntimeData data={record.data} /> : null}
            {record.updatedAt ? <small>Aktualizacja: {formatDateTime(record.updatedAt)}</small> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function RuntimeData({
  data,
}: {
  readonly data: Readonly<Record<string, unknown>>;
}) {
  const entries = Object.entries(data).filter(([, value]) => (
    typeof value === 'string'
    || typeof value === 'number'
    || typeof value === 'boolean'
    || value === null
  ));

  if (entries.length === 0) {
    return <pre className="pd-settings-runtime__json">{JSON.stringify(data, null, 2)}</pre>;
  }

  return (
    <dl className="pd-settings-runtime__data-list">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt>{humanize(key)}</dt>
          <dd>{value === null ? '—' : String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function humanize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/gu, '$1 $2')
    .replaceAll('_', ' ')
    .replace(/^./u, (letter) => letter.toUpperCase());
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
