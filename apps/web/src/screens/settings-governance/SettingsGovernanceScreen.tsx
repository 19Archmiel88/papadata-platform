import type {
  FormEvent,
  ReactNode,
} from 'react';
import {
  useEffect,
  useState,
} from 'react';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type {
  SettingsInvitation,
  SettingsRoleScopeMap,
  SettingsTabId,
  SettingsTarget,
  SettingsTeamMember,
} from '../../fixtures/settings-governance/settingsGovernanceDemoSeed';
import {
  Dialog,
  ProductSectionFrame,
  ProductSectionTopbar,
  Select,
} from '../../design-system';

import {
  settingsAiMemory,
  settingsAuditPostureBreakdown,
  settingsInvitations,
  settingsLegalDocs,
  settingsP0AuditItems,
  settingsPasskeys,
  settingsRoleDescriptions,
  settingsRoleScopes,
  settingsSearchIndex,
  settingsSessions,
  settingsSubprocessors,
  settingsTargets,
  settingsTeamMembers,
} from '../../fixtures/settings-governance/settingsGovernanceDemoSeed';
import {
  settingsSections,
} from './SettingsGovernanceScreen.data';
import type {
  SettingsSectionId,
} from './SettingsGovernanceScreen.data';

import './SettingsGovernanceScreen.css';

const chartColors = {
  amber: 'rgb(var(--pd-set-amber-600))',
  emerald: 'rgb(var(--pd-set-emerald-600))',
  indigo: 'rgb(var(--pd-set-indigo-600))',
  slate: 'rgb(var(--pd-set-slate-400))',
} as const;

const noop = () => undefined;

type SettingsSelectOption = {
  readonly label: string;
  readonly value: string;
};

function SettingsSelect({
  defaultValue,
  id,
  label,
  onValueChange,
  options,
  value,
}: {
  readonly defaultValue?: string;
  readonly id: string;
  readonly label: string;
  readonly onValueChange?: (value: string) => void;
  readonly options: readonly SettingsSelectOption[];
  readonly value?: string;
}) {
  const [localValue, setLocalValue] = useState(defaultValue ?? options[0]?.value ?? '');
  const resolvedValue = value ?? localValue;

  return (
    <div className="pd-set-field pd-set-field--select">
      <Select
        id={id}
        label={label}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          if (value === undefined) setLocalValue(nextValue);
          onValueChange?.(nextValue);
        }}
        options={options}
        placeholder={label}
        value={resolvedValue}
      />
    </div>
  );
}

// Wires the Team/Memberships section to real data when provided by
// SettingsPage (apps/web/src/app/settings/SettingsPage.tsx). Every other
// section (account profile, workspace company, analytics, AI, notifications,
// compliance) has no backend operation yet -- see the "Ustawienia" checklist
// in docs/audits -- so they stay on the local demo-seed behavior below
// regardless of this prop. When absent (Storybook, and any caller that
// doesn't pass it), the Team section also falls back to the demo seed.
export type SettingsMembershipsRuntime = {
  readonly mode: 'runtime';
  readonly loading: boolean;
  readonly problem: string | null;
  readonly members: readonly SettingsTeamMember[];
  readonly invitations: readonly SettingsInvitation[];
  readonly inviteRoles: readonly { readonly value: string; readonly label: string; readonly description: string }[];
  readonly onInvite: (email: string, role: string) => Promise<void>;
  readonly onCancelInvite: (invitationId: string) => Promise<void>;
  readonly onReload: () => void;
};

type ToastTone = 'success' | 'info' | 'error';

type ToastState = {
  readonly message: string;
  readonly tone: ToastTone;
} | null;

function SettingsSectionFrame({
  actions = null,
  children,
  collapsedSummary,
  description,
  expanded = true,
  onExpandedChange = noop,
  section,
}: {
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly collapsedSummary: string;
  readonly description?: ReactNode;
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly section: typeof settingsSections[number];
}) {
  const bodyId = `pd-set-${section.id}-content`;

  return (
    <ProductSectionFrame
      actions={(
        <>
          {expanded ? actions : null}
          <button
            aria-controls={bodyId}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Zwiń' : 'Rozwiń'} sekcję ${section.title}`}
            className="pd-set-section-toggle"
            onClick={() => onExpandedChange(!expanded)}
            type="button"
          >
            <span className="pd-set-section-toggle__label">{expanded ? 'Zwiń' : 'Rozwiń'}</span>
            <span aria-hidden="true" className="pd-set-section-toggle__icon">
              <svg height="14" viewBox="0 0 24 24" width="14">
                <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </span>
          </button>
        </>
      )}
      className="pd-set-section-frame"
      data-collapsed={expanded ? undefined : 'true'}
      description={expanded ? description ?? null : (
        <span className="pd-set-section-summary">{collapsedSummary}</span>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      {expanded ? (
        <div className="pd-set-section-content" id={bodyId}>{children}</div>
      ) : null}
    </ProductSectionFrame>
  );
}

export function SettingsGovernanceScreen({
  membershipsRuntime,
}: {
  readonly membershipsRuntime?: SettingsMembershipsRuntime;
} = {}) {
  const runtimeTeam = membershipsRuntime?.mode === 'runtime';

  const [activeSection, setActiveSection] = useState<SettingsSectionId>(settingsSections[0]!.id);
  const [expandedSections, setExpandedSections] = useState<Set<SettingsSectionId>>(
    () => new Set(settingsSections.map((section) => section.id)),
  );
  const [revision, setRevision] = useState(124);
  const [toast, setToast] = useState<ToastState>(null);
  const [targets, setTargets] = useState<readonly SettingsTarget[]>(settingsTargets);
  const [teamMembers, setTeamMembers] = useState<readonly SettingsTeamMember[]>(
    runtimeTeam ? membershipsRuntime.members : settingsTeamMembers,
  );
  const [invitations, setInvitations] = useState<readonly SettingsInvitation[]>(
    runtimeTeam ? membershipsRuntime.invitations : settingsInvitations,
  );
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [passkeys, setPasskeys] = useState(() => settingsPasskeys.map((passkey) => ({ ...passkey })));
  const [sessions, setSessions] = useState(() => settingsSessions.map((session) => ({ ...session })));
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [editingTarget, setEditingTarget] = useState<SettingsTarget | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [totpOpen, setTotpOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [targetModalOpen, setTargetModalOpen] = useState(false);

  // Real membership/invitation data arrives asynchronously (SettingsPage
  // fetches it after mount, and again after every invite/cancel via
  // onReload); resync local state whenever the runtime's copy changes
  // instead of only reading it once at the initial useState above.
  useEffect(() => {
    if (membershipsRuntime?.mode !== 'runtime') return;
    setTeamMembers(membershipsRuntime.members);
    setInvitations(membershipsRuntime.invitations);
  }, [membershipsRuntime?.mode, membershipsRuntime?.members, membershipsRuntime?.invitations]);

  const allSectionsExpanded = settingsSections.every((section) => expandedSections.has(section.id));

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    // Escape-to-close is no longer handled here -- each modal is now a
    // shared Dialog with its own closeOnEscape.
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top))[0];

      if (visibleSection?.target.id) {
        setActiveSection(visibleSection.target.id as SettingsSectionId);
      }
    }, {
      rootMargin: '-112px 0px -62% 0px',
      threshold: [0, 0.08],
    });

    settingsSections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  function setSectionExpanded(sectionId: SettingsSectionId, expanded: boolean) {
    setExpandedSections((currentSections) => {
      const nextSections = new Set(currentSections);
      if (expanded) nextSections.add(sectionId);
      else nextSections.delete(sectionId);
      return nextSections;
    });
  }

  function handleToggleAllSections() {
    setExpandedSections(new Set(allSectionsExpanded
      ? []
      : settingsSections.map((section) => section.id)));
  }

  function handleSectionChange(sectionId: SettingsSectionId) {
    setActiveSection(sectionId);
    setSectionExpanded(sectionId, true);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function announce(message: string, tone: ToastTone = 'success') {
    setToast({ message, tone });
  }

  function handleCompanySave() {
    setRevision((value) => value + 1);
    announce('Ustawienia Workspace zapisane.', 'success');
  }

  function handleSaveTarget(target: SettingsTarget) {
    setTargets((current) => editingTarget
      ? current.map((item) => item.id === editingTarget.id ? target : item)
      : [...current, target]);
    setTargetModalOpen(false);
    announce(editingTarget ? 'Zaktualizowano cel biznesowy.' : 'Dodano nowy cel biznesowy.', 'success');
    setEditingTarget(null);
  }

  function downloadWorkspaceExport() {
    const payload = {
      generatedAt: new Date().toISOString(),
      invitations,
      targets,
      teamMembers,
      workspace: 'Casa di Orfeo',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'papadata-workspace-export.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    announce('Eksport danych workspace został przygotowany.', 'success');
  }

  return (
    <div className="pd-set">
      <ProductSectionTopbar
        activeId={activeSection}
        actions={(
          <button
            className="pd-set-section-nav-toggle"
            onClick={handleToggleAllSections}
            type="button"
          >
            {allSectionsExpanded ? 'Zwiń szczegóły' : 'Rozwiń wszystkie'}
          </button>
        )}
        ariaLabel="Sekcje ustawień"
        items={settingsSections.map((section) => ({ icon: section.icon, id: section.id, label: section.navLabel }))}
        onActiveIdChange={(sectionId) => handleSectionChange(sectionId as SettingsSectionId)}
      />

      <div className="pd-set__content">
        <div className="pd-set-page-head">
          <div>
            <span className="pd-set-page-head__eyebrow">Casa di Orfeo Sp. z o.o.</span>
            <h1 className="pd-product-page-title">Ustawienia</h1>
            <p>Zarządzaj swoim kontem oraz konfiguracją workspace.</p>
          </div>
          <button className="pd-set-search-trigger" onClick={() => setSearchOpen(true)} type="button">
            <span aria-hidden="true">⌕</span>
            <span>Szukaj ustawień</span>
            <kbd>Ctrl K</kbd>
          </button>
        </div>

        <SettingsAccountProfile
          expanded={expandedSections.has('account-profile')}
          onChangeEmail={() => announce('Rozpoczęto bezpieczny proces zmiany adresu e-mail.', 'info')}
          onExpandedChange={(expanded) => setSectionExpanded('account-profile', expanded)}
          onOpenSecurity={() => handleSectionChange('account-security')}
          onSave={() => announce('Zapisano preferencje profilu.', 'success')}
        />
        <SettingsAccountSecurity
          expanded={expandedSections.has('account-security')}
          mfaEnabled={mfaEnabled}
          onAddPasskey={() => {
            const id = `pk_${Date.now()}`;
            setPasskeys((current) => [...current, { id, icon: '🔑', label: 'Nowy klucz dostępu', meta: 'Dodano: teraz · Oczekuje na pierwsze użycie' }]);
            announce('Dodano klucz dostępu do wersji demonstracyjnej.', 'success');
          }}
          onDisableTotp={() => {
            setMfaEnabled(false);
            announce('Wyłączono weryfikację dwuetapową w bieżącym stanie demonstracyjnym.', 'info');
          }}
          onExpandedChange={(expanded) => setSectionExpanded('account-security', expanded)}
          onOpenTotpWizard={() => setTotpOpen(true)}
          onRemovePasskey={(passkeyId) => {
            setPasskeys((current) => current.filter((passkey) => passkey.id !== passkeyId));
            announce('Usunięto klucz dostępu.', 'success');
          }}
          onRevokeSession={(sessionId) => {
            setSessions((current) => sessionId === 'all'
              ? current.filter((session) => session.current)
              : current.filter((session) => session.id !== sessionId));
            announce(sessionId === 'all' ? 'Wylogowano wszystkie pozostałe urządzenia.' : 'Unieważniono wybraną sesję.', 'success');
          }}
          passkeys={passkeys}
          sessions={sessions}
        />
        <SettingsWorkspaceCompany
          expanded={expandedSections.has('ws-company')}
          onDeleteWorkspaceRequest={() => announce('Przygotowano żądanie usunięcia workspace. W produkcji wymaga potwierdzenia właściciela.', 'info')}
          onExpandedChange={(expanded) => setSectionExpanded('ws-company', expanded)}
          onExport={downloadWorkspaceExport}
          onSave={handleCompanySave}
          revision={revision}
        />
        <SettingsWorkspaceTeam
          expanded={expandedSections.has('ws-team')}
          invitations={invitations}
          loading={runtimeTeam ? membershipsRuntime.loading : false}
          members={teamMembers}
          mode={runtimeTeam ? 'runtime' : 'demo'}
          onCancelInvite={(inviteId) => {
            if (runtimeTeam) {
              membershipsRuntime.onCancelInvite(inviteId)
                .then(() => announce('Anulowano oczekujące zaproszenie.', 'success'))
                .catch((cause: unknown) => announce(
                  cause instanceof Error ? cause.message : 'Nie udało się anulować zaproszenia.',
                  'error',
                ));
              return;
            }
            setInvitations((current) => current.filter((invite) => invite.id !== inviteId));
            announce('Anulowano oczekujące zaproszenie.', 'success');
          }}
          onExpandedChange={(expanded) => setSectionExpanded('ws-team', expanded)}
          onOpenInvite={() => setInviteOpen(true)}
          onReload={runtimeTeam ? membershipsRuntime.onReload : undefined}
          onResendInvite={(inviteId) => {
            setInvitations((current) => current.map((invite) => invite.id === inviteId
              ? { ...invite, sentAt: 'Teraz', expiresAt: 'Za 7 dni' }
              : invite));
            announce('Wysłano zaproszenie ponownie.', 'success');
          }}
          onRoleChange={(memberId, role) => {
            setTeamMembers((current) => current.map((member) => member.id === memberId ? { ...member, role } : member));
            announce(`Zmieniono rolę użytkownika na ${role}.`, 'success');
          }}
          problem={runtimeTeam ? membershipsRuntime.problem : null}
        />
        <SettingsWorkspaceAnalytics
          expanded={expandedSections.has('ws-analytics')}
          onEditTarget={(target) => {
            setEditingTarget(target);
            setTargetModalOpen(true);
          }}
          onExpandedChange={(expanded) => setSectionExpanded('ws-analytics', expanded)}
          onOpenCreateTarget={() => {
            setEditingTarget(null);
            setTargetModalOpen(true);
          }}
          onSaveAttribution={() => announce('Zapisano model i okno atrybucji.', 'success')}
          targets={targets}
        />
        <SettingsWorkspaceAi
          expanded={expandedSections.has('ws-ai')}
          onExpandedChange={(expanded) => setSectionExpanded('ws-ai', expanded)}
          onMemoryChange={() => announce('Zaktualizowano słownik pojęć Papa AI.', 'success')}
          onSave={() => announce('Zapisano ustawienia zachowania Papa AI', 'success')}
        />
        <SettingsWorkspaceNotifications
          expanded={expandedSections.has('ws-notifications')}
          onExpandedChange={(expanded) => setSectionExpanded('ws-notifications', expanded)}
          onSave={() => announce('Zapisano ustawienia powiadomień.', 'success')}
          onTestDelivery={() => announce('Wysłano wiadomość testową na anna@casadiorfeo.pl.', 'info')}
        />
        <SettingsWorkspaceCompliance
          expanded={expandedSections.has('ws-compliance')}
          onDownload={(title) => announce(`Pobieranie dokumentu: ${title}`, 'info')}
          onExpandedChange={(expanded) => setSectionExpanded('ws-compliance', expanded)}
        />
      </div>

      {toast && <SettingsToast message={toast.message} tone={toast.tone} />}

      <SettingsSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={(tab) => handleSectionChange(tab as SettingsSectionId)} />
      <SettingsTotpWizardModal
        open={totpOpen}
        onClose={() => setTotpOpen(false)}
        onVerified={() => {
          setTotpOpen(false);
          setMfaEnabled(true);
          announce('Weryfikacja dwuetapowa została aktywowana.', 'success');
        }}
      />
      <SettingsInviteModal
        onClose={() => {
          setInviteOpen(false);
          setInviteError(null);
        }}
        onSent={(email, role) => {
          if (runtimeTeam) {
            setInviteSubmitting(true);
            setInviteError(null);
            membershipsRuntime.onInvite(email, role)
              .then(() => {
                setInviteSubmitting(false);
                setInviteOpen(false);
                announce(`Wysłano zaproszenie email do ${email} z rolą ${role}`, 'success');
              })
              .catch((cause: unknown) => {
                setInviteSubmitting(false);
                setInviteError(cause instanceof Error ? cause.message : 'Nie udało się wysłać zaproszenia.');
              });
            return;
          }
          setInvitations((current) => [...current, {
            email,
            expiresAt: 'Za 7 dni',
            id: `inv_${Date.now()}`,
            role,
            sentAt: 'Teraz',
          }]);
          setInviteOpen(false);
          announce(`Wysłano zaproszenie email do ${email} z rolą ${role}`, 'success');
        }}
        open={inviteOpen}
        roles={runtimeTeam ? membershipsRuntime.inviteRoles : undefined}
        submitError={inviteError}
        submitting={inviteSubmitting}
      />
      <SettingsTargetModal
        initialTarget={editingTarget}
        open={targetModalOpen}
        onClose={() => {
          setEditingTarget(null);
          setTargetModalOpen(false);
        }}
        onSave={handleSaveTarget}
      />
    </div>
  );
}

export function SettingsAccountProfile({
  expanded = true,
  onChangeEmail = noop,
  onExpandedChange = noop,
  onOpenSecurity = noop,
  onSave = noop,
}: {
  readonly expanded?: boolean;
  readonly onChangeEmail?: () => void;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onOpenSecurity?: () => void;
  readonly onSave?: () => void;
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave();
  }

  return (
    <SettingsSectionFrame
      actions={<span className="pd-set-scope-badge pd-set-scope-badge--personal">Ustawienia osobiste</span>}
      collapsedSummary="Anna Kowalska · Head of Ecommerce & Growth · e-mail zweryfikowany"
      description="Zaktualizuj dane profilu i sposób prezentacji informacji w PapaData."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={settingsSections[0]!}
    >
      <div className="pd-set-grid pd-set-account-layout">
        <div className="pd-set-card pd-set-account-profile">
          <div className="pd-set-card__head">
            <div className="pd-set-identity">
              <span className="pd-set-avatar" aria-hidden="true">AK</span>
              <div>
                <h3>Anna Kowalska</h3>
                <p>anna@casadiorfeo.pl</p>
              </div>
            </div>
            <span className="pd-set-scope-badge pd-set-scope-badge--success"><span aria-hidden="true">✓</span> E-mail zweryfikowany</span>
          </div>

          <form className="pd-set-account-form" onSubmit={handleSubmit}>
            <fieldset className="pd-set-fieldset">
              <legend>Dane profilu</legend>
            <div className="pd-set-field-row">
              <div className="pd-set-field">
                  <label htmlFor="set-prof-name">Nazwa wyświetlana</label>
                <input className="pd-set-input" defaultValue="Anna Kowalska" id="set-prof-name" type="text" />
              </div>
              <div className="pd-set-field">
                  <label htmlFor="set-prof-title">Stanowisko</label>
                <input className="pd-set-input" defaultValue="Head of Ecommerce & Growth" id="set-prof-title" type="text" />
              </div>
            </div>
            </fieldset>

            <fieldset className="pd-set-fieldset">
              <legend>Język i format danych</legend>
            <div className="pd-set-field-row">
              <SettingsSelect
                defaultValue="pl-PL"
                id="set-prof-lang"
                label="Język interfejsu"
                options={[
                  { label: 'Polski', value: 'pl-PL' },
                  { label: 'English', value: 'en-US' },
                  { label: 'Deutsch', value: 'de-DE' },
                ]}
              />
              <SettingsSelect
                defaultValue="PL"
                id="set-prof-format"
                label="Format liczb i dat"
                options={[
                  { label: '1 234,56 PLN / DD.MM.YYYY', value: 'PL' },
                  { label: '$1,234.56 / MM/DD/YYYY', value: 'US' },
                  { label: '1 234,56 / YYYY-MM-DD', value: 'ISO' },
                ]}
              />
            </div>
            </fieldset>

            <div className="pd-set-form-footer">
              <span className="pd-set-form-footer__hint">Zmiany dotyczą tylko Twojego konta.</span>
              <button className="pd-set-button pd-set-button--primary" type="submit">Zapisz zmiany</button>
            </div>
          </form>
        </div>

        <aside className="pd-set-card pd-set-account-security">
          <div className="pd-set-card__head">
            <div>
              <h3>Bezpieczeństwo konta</h3>
              <p>Logowanie i dostęp do workspace</p>
            </div>
            <span className="pd-set-security-state" aria-label="Konto dobrze zabezpieczone">Dobrze zabezpieczone</span>
          </div>
          <dl className="pd-set-kv-list">
            <div className="pd-set-kv-row"><dt>Logowanie</dt><dd>Hasło + kod 2FA</dd></div>
            <div className="pd-set-kv-row"><dt>Ostatnia aktywność</dt><dd>Dzisiaj, 09:42</dd></div>
            <div className="pd-set-kv-row"><dt>Workspace</dt><dd>Casa di Orfeo</dd></div>
            <div className="pd-set-kv-row"><dt>Rola</dt><dd><span className="pd-set-pill pd-set-pill--indigo">Właściciel</span></dd></div>
          </dl>
          <button className="pd-set-button pd-set-button--muted pd-set-button--block" onClick={onOpenSecurity} type="button">
            Zarządzaj bezpieczeństwem
          </button>
          <div className="pd-set-email-change">
            <strong>Zmiana adresu e-mail</strong>
            <p>Ze względów bezpieczeństwa wymaga ponownego potwierdzenia tożsamości.</p>
            <button className="pd-set-linklike pd-set-linklike--indigo" onClick={onChangeEmail} type="button">Zmień adres e-mail</button>
          </div>
        </aside>
      </div>
    </SettingsSectionFrame>
  );
}

export function SettingsAccountSecurity({
  expanded = true,
  mfaEnabled = true,
  onAddPasskey = noop,
  onDisableTotp = noop,
  onExpandedChange = noop,
  onOpenTotpWizard = noop,
  onRemovePasskey = noop,
  onRevokeSession = noop,
  passkeys = settingsPasskeys,
  sessions = settingsSessions,
}: {
  readonly expanded?: boolean;
  readonly mfaEnabled?: boolean;
  readonly onAddPasskey?: () => void;
  readonly onDisableTotp?: () => void;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onOpenTotpWizard?: () => void;
  readonly onRemovePasskey?: (passkeyId: string) => void;
  readonly onRevokeSession?: (sessionId: string) => void;
  readonly passkeys?: readonly { readonly id: string; readonly icon: string; readonly label: string; readonly meta: string }[];
  readonly sessions?: readonly { readonly id: string; readonly device: string; readonly ip: string; readonly activity: string; readonly current: boolean }[];
}) {
  return (
    <SettingsSectionFrame
      actions={(
        <>
          <span className="pd-set-scope-badge pd-set-scope-badge--personal">Ustawienia osobiste</span>
          <span className={`pd-set-scope-badge ${mfaEnabled ? 'pd-set-scope-badge--success' : 'pd-set-scope-badge--workspace'}`}>
            <span aria-hidden="true">{mfaEnabled ? '✓' : '!'}</span> {mfaEnabled ? 'Weryfikacja dwuetapowa aktywna' : 'Weryfikacja dwuetapowa wyłączona'}
          </span>
        </>
      )}
      collapsedSummary={`${mfaEnabled ? 'Weryfikacja dwuetapowa aktywna' : 'Weryfikacja dwuetapowa wyłączona'} · ${passkeys.length} kluczy dostępu · ${sessions.length} aktywne sesje`}
      description="Chroń konto dodatkowym kodem, kluczem dostępu i kontroluj urządzenia, na których jesteś zalogowany."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={settingsSections[1]!}
    >
      <div className="pd-set-grid pd-set-grid--halves">
        <div className="pd-set-card">
          <div className="pd-set-card__head">
            <div>
              <h3>Weryfikacja dwuetapowa</h3>
              <p>Dodatkowy kod z aplikacji podczas logowania</p>
            </div>
            <span className={`pd-set-pill ${mfaEnabled ? 'pd-set-pill--emerald' : 'pd-set-pill--amber'}`}>{mfaEnabled ? 'AKTYWNE' : 'WYŁĄCZONE'}</span>
          </div>

          <div className="pd-set-info-block">
            <div className="pd-set-info-block__row">
              <div className="pd-set-info-block__icon">🔑</div>
              <div>
                <div className="pd-set-info-block__title">Aplikacja uwierzytelniająca</div>
                <p className="pd-set-info-block__text">
                  Konto jest zabezpieczone czasowym kodem jednorazowym. Wszystkie próby zalogowania z nowych urządzeń wymagają
                  podania 6-cyfrowego kodu.
                </p>
              </div>
            </div>
            <div className="pd-set-status-grid">
              <div className="pd-set-status-tile">
                <span className="pd-set-status-tile__label">Metoda</span>
                <span className="pd-set-status-tile__value">Kod jednorazowy</span>
              </div>
              <div className="pd-set-status-tile">
                <span className="pd-set-status-tile__label">Kody zapasowe</span>
                <span className="pd-set-status-tile__value">8 z 10 pozostało</span>
              </div>
            </div>
          </div>

          <div className="pd-set-form-footer">
            <button className="pd-set-button pd-set-button--primary" onClick={onOpenTotpWizard} type="button">
              {mfaEnabled ? 'Skonfiguruj ponownie' : 'Włącz weryfikację dwuetapową'}
            </button>
            {mfaEnabled ? (
              <button className="pd-set-linklike" onClick={onDisableTotp} type="button">Wyłącz weryfikację dwuetapową</button>
            ) : null}
          </div>
        </div>

        <div className="pd-set-card">
          <div className="pd-set-card__head">
            <div>
              <h3>Klucze dostępu</h3>
              <p>Logowanie odciskiem palca, twarzą lub kodem urządzenia</p>
            </div>
            <span className="pd-set-pill pd-set-pill--slate">FIDO2</span>
          </div>
          <div className="pd-set-view" style={{ gap: 8 }}>
            {passkeys.map((passkey) => (
              <div className="pd-set-list-item" key={passkey.id}>
                <div className="pd-set-list-item__lead">
                  <span>{passkey.icon}</span>
                  <div>
                    <div className="pd-set-list-item__title">{passkey.label}</div>
                    <div className="pd-set-list-item__meta">{passkey.meta}</div>
                  </div>
                </div>
                <button className="pd-set-linklike" onClick={() => onRemovePasskey(passkey.id)} type="button">Usuń</button>
              </div>
            ))}
          </div>
          <button className="pd-set-button pd-set-button--dark pd-set-button--block" onClick={onAddPasskey} type="button">
            Dodaj klucz dostępu
          </button>
        </div>

        <div className="pd-set-card pd-set-grid--span2">
          <div className="pd-set-card__head">
            <div>
              <h3>Sesje i urządzenia</h3>
              <p>Sprawdź, gdzie Twoje konto jest obecnie zalogowane</p>
            </div>
            <button className="pd-set-button pd-set-button--danger-outline" onClick={() => onRevokeSession('all')} type="button">
              Wyloguj na innych urządzeniach
            </button>
          </div>
          <div className="pd-set-table-wrap">
            <table className="pd-set-table">
              <thead>
                <tr>
                  <th>Urządzenie i przeglądarka</th>
                  <th>Adres IP</th>
                  <th>Ostatnia aktywność</th>
                  <th>Status</th>
                  <th className="pd-set-cell-right">Akcja</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr data-current={session.current} key={session.id}>
                    <td className="pd-set-cell-strong">{session.device}</td>
                    <td className="pd-set-cell-muted">{session.ip}</td>
                    <td>{session.activity}</td>
                    <td>
                      {session.current
                        ? <span className="pd-set-pill pd-set-pill--emerald">OBECNA</span>
                        : <span className="pd-set-pill pd-set-pill--slate">Ważna</span>}
                    </td>
                    <td className="pd-set-cell-right">
                      {session.current
                        ? <span style={{ color: 'rgb(var(--pd-set-slate-400))' }}>—</span>
                        : <button className="pd-set-linklike" onClick={() => onRevokeSession(session.id)} type="button">Wyloguj</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SettingsSectionFrame>
  );
}

export function SettingsWorkspaceCompany({
  expanded = true,
  onDeleteWorkspaceRequest = noop,
  onExpandedChange = noop,
  onExport = noop,
  onSave = noop,
  revision = 124,
}: {
  readonly expanded?: boolean;
  readonly onDeleteWorkspaceRequest?: () => void;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onExport?: () => void;
  readonly onSave?: () => void;
  readonly revision?: number;
}) {
  const [logoName, setLogoName] = useState('Logo Casa di Orfeo');
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave();
  }

  return (
    <SettingsSectionFrame
      actions={<span className="pd-set-scope-badge pd-set-scope-badge--workspace">Dotyczy całego workspace</span>}
      collapsedSummary="Casa di Orfeo Sp. z o.o. · PLN · Europe/Warsaw"
      description="Konfiguracja tożsamości prawnej organizacji, strefy czasowej oraz waluty raportowania. Zmiany w tej sekcji wpływają na agregacje danych, granice dni w raportach oraz reguły alertów w całej organizacji."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={settingsSections[2]!}
    >
      <div className="pd-set-grid" data-revision={revision}>
        <div className="pd-set-card pd-set-grid--span2">
          <div className="pd-set-card__head pd-set-card__head--with-status">
            <h3>Dane organizacji</h3>
            <span className="pd-set-scope-badge pd-set-scope-badge--success"><span aria-hidden="true">✓</span> Dane firmy zweryfikowane</span>
          </div>

          <form className="pd-set-view" onSubmit={handleSubmit} style={{ gap: 16 }}>
            <div className="pd-set-field-row">
              <div className="pd-set-field">
                <label htmlFor="set-comp-trade">Nazwa handlowa</label>
                <input className="pd-set-input" defaultValue="Casa di Orfeo" id="set-comp-trade" type="text" />
              </div>
              <div className="pd-set-field">
                <label htmlFor="set-comp-legal">Pełna nazwa rejestrowa</label>
                <input className="pd-set-input" defaultValue="Casa di Orfeo Spółka z o.o." id="set-comp-legal" type="text" />
              </div>
            </div>

            <div className="pd-set-field-row pd-set-field-row--thirds">
              <div className="pd-set-field">
                <label htmlFor="set-comp-nip">NIP</label>
                <input className="pd-set-input pd-set-input--readonly" defaultValue="7312049912" id="set-comp-nip" readOnly type="text" />
              </div>
              <div className="pd-set-field">
                <label htmlFor="set-comp-regon">REGON</label>
                <input className="pd-set-input pd-set-input--readonly" defaultValue="381902441" id="set-comp-regon" readOnly type="text" />
              </div>
              <SettingsSelect
                defaultValue="ecommerce_fashion"
                id="set-comp-industry"
                label="Branża"
                options={[
                  { label: 'E-commerce (Odzież & Obuwie)', value: 'ecommerce_fashion' },
                  { label: 'E-commerce (Elektronika)', value: 'ecommerce_electronics' },
                  { label: 'SaaS / Subskrypcje', value: 'saas' },
                ]}
              />
            </div>

            <section className="pd-set-reporting-group" aria-labelledby="set-reporting-title">
              <div className="pd-set-reporting-group__head">
                <h4 id="set-reporting-title">Raportowanie</h4>
                <span>Wpływa na agregację danych w całym workspace</span>
              </div>
              <div className="pd-set-field-row">
                <SettingsSelect
                  defaultValue="PLN"
                  id="set-comp-currency"
                  label="Waluta raportowania"
                  options={[
                    { label: 'PLN — Polski Złoty', value: 'PLN' },
                    { label: 'EUR — Euro', value: 'EUR' },
                    { label: 'USD — US Dollar', value: 'USD' },
                  ]}
                />
                <SettingsSelect
                  defaultValue="Europe/Warsaw"
                  id="set-comp-tz"
                  label="Strefa czasowa"
                  options={[
                    { label: 'Europe/Warsaw (UTC+02:00)', value: 'Europe/Warsaw' },
                    { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
                    { label: 'America/New_York (UTC-04:00)', value: 'America/New_York' },
                  ]}
                />
              </div>
              <p className="pd-set-reporting-group__note">
                <strong>Wpływ zmiany:</strong> waluta przelicza wartości w raportach, a strefa czasowa zmienia granice dni w analizach.
              </p>
            </section>

            <div className="pd-set-form-footer">
              <span className="pd-set-form-footer__hint">Zmiany będą widoczne dla całego zespołu.</span>
              <button className="pd-set-button pd-set-button--primary" type="submit">Zapisz zmiany</button>
            </div>
          </form>
        </div>

        <div className="pd-set-view" style={{ gap: 20 }}>
          <div className="pd-set-card">
            <div className="pd-set-card__head"><h3>Logo workspace</h3></div>
            <p className="pd-set-info-block__text" style={{ marginTop: 0 }}>
              Używane w nagłówku, raportach i materiałach eksportowanych z PapaData.
            </p>
            <div className="pd-set-logo-row">
              <div className="pd-set-logo-tile">CdO</div>
              <div className="pd-set-logo-meta">
                <span className="pd-set-logo-meta__name">{logoName}</span>
                <span className="pd-set-logo-meta__dims">PNG, JPG lub WEBP · maks. 2 MB</span>
                <label className="pd-set-button pd-set-button--muted" style={{ justifySelf: 'start', marginTop: 4 }}>
                  Zmień logo
                  <input
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) setLogoName(file.name);
                    }}
                    type="file"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="pd-set-danger-zone">
            <div className="pd-set-danger-zone__title"><span aria-hidden="true">⚠</span><span>Operacje zaawansowane</span></div>
            <p className="pd-set-danger-zone__body">
              Eksport lub usunięcie danych wymaga potwierdzenia przez właściciela workspace.
            </p>
            <button className="pd-set-danger-row pd-set-danger-row--outline" onClick={onExport} type="button">
              <span>Eksportuj wszystkie dane</span><span aria-hidden="true">↓</span>
            </button>
            <button className="pd-set-danger-row pd-set-danger-row--solid" onClick={() => {
              if (window.confirm('Czy przygotować żądanie usunięcia workspace? Ta operacja wymaga dodatkowego potwierdzenia właściciela.')) {
                onDeleteWorkspaceRequest();
              }
            }} type="button">
              <span>Usuń workspace</span><span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </SettingsSectionFrame>
  );
}

export function SettingsWorkspaceTeam({
  expanded = true,
  invitations = settingsInvitations,
  loading = false,
  members = settingsTeamMembers,
  mode = 'demo',
  onCancelInvite = noop,
  onExpandedChange = noop,
  onOpenInvite = noop,
  onReload,
  onResendInvite = noop,
  onRoleChange = noop,
  problem = null,
}: {
  readonly expanded?: boolean;
  readonly invitations?: readonly SettingsInvitation[];
  readonly loading?: boolean;
  readonly members?: readonly SettingsTeamMember[];
  readonly mode?: 'demo' | 'runtime';
  readonly onCancelInvite?: (inviteId: string) => void;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onOpenInvite?: () => void;
  readonly onReload?: () => void;
  readonly onResendInvite?: (inviteId: string) => void;
  readonly onRoleChange?: (memberId: string, role: string) => void;
  readonly problem?: string | null;
}) {
  const runtime = mode === 'runtime';

  return (
    <SettingsSectionFrame
      actions={(
        <>
          <span className="pd-set-scope-badge pd-set-scope-badge--workspace">Dotyczy całego workspace</span>
          <button className="pd-set-button pd-set-button--primary" onClick={onOpenInvite} type="button">
            Zaproś osobę
          </button>
        </>
      )}
      collapsedSummary={`${members.length} członków zespołu · ${invitations.length} oczekujące zaproszenia`}
      description="Zapraszaj osoby do zespołu i przypisuj im role odpowiednie do zakresu pracy."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={settingsSections[3]!}
    >
      {runtime && problem ? (
        <div className="pd-set-panel-note pd-set-panel-note--rose">
          <p>{problem}</p>
          {onReload ? (
            <button className="pd-set-linklike" onClick={onReload} type="button">Spróbuj ponownie</button>
          ) : null}
        </div>
      ) : null}

      <div className="pd-set-card">
        <div className="pd-set-card__head">
          <h3>Członkowie zespołu ({members.length})</h3>
        </div>
        <div className="pd-set-table-wrap">
          <table className="pd-set-table">
            <thead>
              <tr>
                <th>Użytkownik</th>
                <th>Rola</th>
                <th>Status 2FA</th>
                <th>Ostatnia aktywność</th>
                <th className="pd-set-cell-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {runtime && loading && members.length === 0 ? (
                <tr><td className="pd-set-cell-muted" colSpan={5}>Wczytywanie członków zespołu…</td></tr>
              ) : null}
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="pd-set-cell-strong">
                    <div>{member.name}</div>
                    <div style={{ color: 'rgb(var(--pd-set-slate-400))', fontWeight: 400, fontSize: 'var(--pd-type-size-micro)' }}>{member.email}</div>
                  </td>
                  <td><span className="pd-set-pill pd-set-pill--slate" style={{ fontFamily: 'var(--pd-font-mono)' }}>{member.role}</span></td>
                  <td>
                    {member.mfa
                      ? <span className="pd-set-pill pd-set-pill--emerald">✓ Aktywne</span>
                      : <span className="pd-set-pill pd-set-pill--amber">Wymaga aktywacji</span>}
                  </td>
                  <td className="pd-set-cell-muted">{member.lastSeen}</td>
                  <td className="pd-set-cell-right">
                    {member.role === 'OWNER' || member.role === 'Tenant Owner'
                      ? <span style={{ color: 'rgb(var(--pd-set-slate-400))' }}>Właściciel</span>
                      : runtime
                        ? (
                          <span style={{ color: 'rgb(var(--pd-set-slate-400))' }} title="Zmiana roli istniejącego członka nie ma jeszcze operacji API — zadanie do wykonania.">
                            Zmiana roli: wkrótce
                          </span>
                        )
                        : (
                          <Select
                            aria-label={`Zmień rolę ${member.name}`}
                            className="pd-set-role-select"
                            label={`Rola ${member.name}`}
                            onChange={(event) => onRoleChange(member.id, event.currentTarget.value)}
                            options={(['ADMIN', 'ANALYST', 'MEMBER', 'GROWTH_OPERATOR', 'VIEWER'] as const).map((role) => ({ label: role, value: role }))}
                            placeholder="Wybierz rolę"
                            value={member.role}
                          />
                        )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pd-set-card">
        <div className="pd-set-card__head">
          <h3>Oczekujące zaproszenia ({invitations.length})</h3>
          {runtime ? null : <span className="pd-set-pill pd-set-pill--amber">Wygasają po 7 dniach</span>}
        </div>
        <div className="pd-set-table-wrap">
          <table className="pd-set-table">
            <thead>
              <tr>
                <th>Adres e-mail</th>
                <th>Rola</th>
                <th>Wysłano</th>
                <th>Wygasa</th>
                <th className="pd-set-cell-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invite) => (
                <tr key={invite.id}>
                  <td className="pd-set-cell-strong">{invite.email}</td>
                  <td><span className="pd-set-pill pd-set-pill--slate" style={{ fontFamily: 'var(--pd-font-mono)' }}>{invite.role}</span></td>
                  <td className="pd-set-cell-muted">{invite.sentAt}</td>
                  <td className="pd-set-cell-muted">{invite.expiresAt}</td>
                  <td className="pd-set-cell-right">
                    {runtime ? null : (
                      <button className="pd-set-linklike pd-set-linklike--indigo" onClick={() => onResendInvite(invite.id)} style={{ marginRight: 12 }} type="button">Wyślij ponowny email</button>
                    )}
                    <button className="pd-set-linklike" onClick={() => onCancelInvite(invite.id)} type="button">Anuluj</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SettingsSectionFrame>
  );
}

export function SettingsWorkspaceAnalytics({
  expanded = true,
  onEditTarget = noop,
  onExpandedChange = noop,
  onOpenCreateTarget = noop,
  onSaveAttribution = noop,
  targets = settingsTargets,
}: {
  readonly expanded?: boolean;
  readonly onEditTarget?: (target: SettingsTarget) => void;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onOpenCreateTarget?: () => void;
  readonly onSaveAttribution?: () => void;
  readonly targets?: readonly SettingsTarget[];
}) {
  const chartData = targets.map((target) => ({
    name: target.metricKey === 'roas_target' ? 'ROAS (x10)' : target.name.split(' ')[0],
    cel: target.metricKey === 'roas_target' ? target.value * 10 : target.value / (target.metricKey === 'revenue_monthly' ? 1000 : 1),
    aktualnie: target.metricKey === 'roas_target' ? target.actual * 10 : target.actual / (target.metricKey === 'revenue_monthly' ? 1000 : 1),
  }));

  return (
    <SettingsSectionFrame
      actions={(
        <>
          <span className="pd-set-scope-badge pd-set-scope-badge--workspace">Dotyczy całego workspace</span>
          <button className="pd-set-button pd-set-button--primary" onClick={onOpenCreateTarget} type="button">
            Dodaj cel
          </button>
        </>
      )}
      collapsedSummary={`${targets.length} zdefiniowanych celów biznesowych`}
      description="Ustal cele, progi alertów i sposób przypisywania konwersji do kanałów marketingowych."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={settingsSections[4]!}
    >
      <div className="pd-set-grid">
        <div className="pd-set-card pd-set-grid--span2">
          <div className="pd-set-card__head">
            <h3>Postęp realizacji celów — sierpień 2026</h3>
          </div>
          <div className="pd-set-chart">
            <ResponsiveContainer height="100%" width="100%">
              <RechartsBarChart data={chartData} margin={{ bottom: 8, left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="rgb(var(--pd-set-slate-200))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={44} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cel" fill={chartColors.indigo} name="Cel Biznesowy" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aktualnie" fill={chartColors.emerald} name="Aktualizacja Sierpień" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pd-set-card">
          <div className="pd-set-card__head"><h3>Atrybucja konwersji</h3></div>
          <SettingsSelect
            defaultValue="data-driven"
            id="set-attr-model"
            label="Model atrybucji"
            options={[
              { label: 'Data-Driven (Algorytmiczny Papa AI)', value: 'data-driven' },
              { label: 'Last Interaction (Ostatnie kliknięcie)', value: 'last-touch' },
              { label: 'First Interaction (Pierwszy kontakt)', value: 'first-touch' },
            ]}
          />
          <SettingsSelect
            defaultValue="30"
            id="set-attr-window"
            label="Okno atrybucji"
            options={[
              { label: '30 dni (domyślne e-commerce)', value: '30' },
              { label: '14 dni (krótki cykl)', value: '14' },
              { label: '90 dni (długi cykl SaaS/B2B)', value: '90' },
            ]}
          />
          <div className="pd-set-panel-note pd-set-panel-note--slate">
            <p>⚠️ Zmiana metodyki atrybucji wymaga ponownej kalkulacji agregatów przychodu w tle.</p>
          </div>
          <button className="pd-set-button pd-set-button--dark pd-set-button--block" onClick={onSaveAttribution} type="button">Zapisz atrybucję</button>
        </div>

        <div className="pd-set-card pd-set-grid--span3">
          <div className="pd-set-card__head"><h3>Cele biznesowe</h3></div>
          <div className="pd-set-table-wrap">
            <table className="pd-set-table">
              <thead>
                <tr>
                  <th>Nazwa celu</th>
                  <th>Metryka</th>
                  <th>Wartość docelowa</th>
                  <th>Próg alertu</th>
                  <th>Kadencja</th>
                  <th className="pd-set-cell-right">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((target) => (
                  <tr key={target.id}>
                    <td className="pd-set-cell-strong">{target.name}</td>
                    <td className="pd-set-cell-muted">{target.metricKey}</td>
                    <td style={{ color: 'rgb(var(--pd-set-indigo-800))', fontWeight: 700 }}>
                      {target.value.toLocaleString('pl-PL')} {target.currency}
                    </td>
                    <td><span className="pd-set-pill pd-set-pill--amber" style={{ fontFamily: 'var(--pd-font-mono)' }}>{target.threshold}%</span></td>
                    <td className="pd-set-cell-muted">{target.cadence}</td>
                    <td className="pd-set-cell-right"><button className="pd-set-linklike pd-set-linklike--indigo" onClick={() => onEditTarget(target)} type="button">Edytuj</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SettingsSectionFrame>
  );
}

export function SettingsWorkspaceAi({
  expanded = true,
  onExpandedChange = noop,
  onMemoryChange = noop,
  onSave = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onMemoryChange?: () => void;
  readonly onSave?: () => void;
}) {
  const [style, setStyle] = useState<'concise' | 'standard' | 'detailed'>('standard');
  const [memory, setMemory] = useState(() => settingsAiMemory.map((entry) => ({ ...entry })));
  const [addingTerm, setAddingTerm] = useState(false);
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');

  function addTerm() {
    if (!term.trim() || !definition.trim()) return;
    setMemory((current) => [...current, {
      author: 'Anna',
      definition: definition.trim(),
      kind: 'custom' as const,
      term: term.trim(),
    }]);
    setTerm('');
    setDefinition('');
    setAddingTerm(false);
    onMemoryChange();
  }

  const styleLabel = style === 'concise' ? 'krótko' : style === 'standard' ? 'standard' : 'szczegółowo';

  return (
    <SettingsSectionFrame
      actions={<span className="pd-set-scope-badge pd-set-scope-badge--workspace">Dotyczy całego workspace</span>}
      collapsedSummary={`Styl odpowiedzi: ${styleLabel} · ${memory.length} pojęć w słowniku`}
      description="Dostosuj styl odpowiedzi, proaktywne alerty i definicje biznesowe używane przez Asystenta."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={settingsSections[5]!}
    >
      <div className="pd-set-grid pd-set-grid--halves">
        <div className="pd-set-card">
          <div className="pd-set-card__head"><h3>Styl odpowiedzi</h3></div>
          <div className="pd-set-field">
            <label>Poziom szczegółowości</label>
            <div className="pd-set-style-picker">
              {(['concise', 'standard', 'detailed'] as const).map((option) => (
                <label className="pd-set-style-option" data-selected={style === option} key={option}>
                  <input checked={style === option} name="ai-style" onChange={() => setStyle(option)} type="radio" />
                  <span>{option === 'concise' ? 'Krótko' : option === 'standard' ? 'Standard' : 'Szczegółowo'}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="pd-set-toggle-row">
            <input defaultChecked type="checkbox" />
            <span>Pozwól Asystentowi Papa wysyłać powiadomienia o anomaliach bez bezpośredniego zapytania</span>
          </label>
          <div className="pd-set-panel-note pd-set-panel-note--rose">
            <div className="pd-set-panel-note__title"><span aria-hidden="true">🔒</span><span>Ochrona danych logowania</span></div>
            <p>Hasła, kody zabezpieczające i klucze dostępu nigdy nie są udostępniane Asystentowi.</p>
          </div>
          <button className="pd-set-button pd-set-button--ai pd-set-button--block" onClick={onSave} type="button">
            Zapisz ustawienia Asystenta
          </button>
        </div>

        <div className="pd-set-card">
          <div className="pd-set-card__head">
            <div>
              <h3>Słownik pojęć</h3>
              <p>Definicje biznesowe używane w odpowiedziach</p>
            </div>
            <button className="pd-set-button pd-set-button--dark" onClick={() => setAddingTerm((value) => !value)} type="button">Dodaj pojęcie</button>
          </div>
          {addingTerm ? (
            <div className="pd-set-view" style={{ gap: 8, marginBottom: 12 }}>
              <input className="pd-set-input" onChange={(event) => setTerm(event.target.value)} placeholder="Nazwa pojęcia" value={term} />
              <textarea className="pd-set-input" onChange={(event) => setDefinition(event.target.value)} placeholder="Definicja biznesowa" rows={3} value={definition} />
              <div className="pd-set-form-footer">
                <button className="pd-set-linklike" onClick={() => setAddingTerm(false)} type="button">Anuluj</button>
                <button className="pd-set-button pd-set-button--primary" disabled={!term.trim() || !definition.trim()} onClick={addTerm} type="button">Dodaj do słownika</button>
              </div>
            </div>
          ) : null}
          <div className="pd-set-view" style={{ gap: 8 }}>
            {memory.map((entry) => (
              <div className={`pd-set-memory-item pd-set-memory-item--${entry.kind}`} key={entry.term}>
                <div>
                  <div className="pd-set-memory-item__head">
                    <span className="pd-set-memory-item__term">{entry.term}</span>
                    <span className="pd-set-memory-item__kind">{entry.kind === 'custom' ? 'Własna' : 'Systemowa'}</span>
                  </div>
                  <p className="pd-set-memory-item__definition">{entry.definition}</p>
                </div>
                <span className="pd-set-memory-item__author">Autor: {entry.author}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingsSectionFrame>
  );
}

export function SettingsWorkspaceNotifications({
  expanded = true,
  onExpandedChange = noop,
  onSave = noop,
  onTestDelivery = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onSave?: () => void;
  readonly onTestDelivery?: () => void;
}) {
  return (
    <SettingsSectionFrame
      actions={(
        <>
          <span className="pd-set-scope-badge pd-set-scope-badge--workspace">Dotyczy całego workspace</span>
          <button className="pd-set-button pd-set-button--primary" onClick={onTestDelivery} type="button">
            Wyślij wiadomość testową
          </button>
        </>
      )}
      collapsedSummary="Cotygodniowe podsumowanie aktywne · godziny ciszy 22:00–07:00"
      description="Ustal, kiedy zespół otrzymuje alerty i cykliczne podsumowania."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={settingsSections[6]!}
    >
      <div className="pd-set-grid pd-set-grid--halves">
        <div className="pd-set-card">
          <div className="pd-set-card__head"><h3>Harmonogram raportu</h3></div>
          <div className="pd-set-info-block">
            <div className="pd-set-info-block__row" style={{ justifyContent: 'space-between', width: '100%' }}>
              <strong style={{ color: 'rgb(var(--pd-set-slate-900))' }}>Cotygodniowe podsumowanie</strong>
              <span className="pd-set-pill pd-set-pill--emerald">AKTYWNY</span>
            </div>
            <div className="pd-set-status-grid">
              <div>Kadencja: <strong>Poniedziałek 08:00</strong></div>
              <div>Format: <strong>PDF + podsumowanie e-mail</strong></div>
              <div>Strefa: <strong>Europe/Warsaw</strong></div>
              <div>Odbiorcy: <strong>Właściciele &amp; Admini</strong></div>
            </div>
          </div>
        </div>

        <div className="pd-set-card">
          <div className="pd-set-card__head"><h3>Godziny ciszy</h3></div>
          <div className="pd-set-field-row">
            <div className="pd-set-field">
              <label htmlFor="set-quiet-start">Od</label>
              <input className="pd-set-input" defaultValue="22:00" id="set-quiet-start" type="time" />
            </div>
            <div className="pd-set-field">
              <label htmlFor="set-quiet-end">Do</label>
              <input className="pd-set-input" defaultValue="07:00" id="set-quiet-end" type="time" />
            </div>
          </div>
          <label className="pd-set-toggle-row">
            <input defaultChecked type="checkbox" />
            <span>Krytyczne alerty bezpieczeństwa mogą omijać godziny ciszy</span>
          </label>
          <button className="pd-set-button pd-set-button--dark pd-set-button--block" onClick={onSave} type="button">
            Zapisz powiadomienia
          </button>
        </div>
      </div>
    </SettingsSectionFrame>
  );
}

export function SettingsWorkspaceCompliance({
  expanded = true,
  onDownload = noop,
  onExpandedChange = noop,
}: {
  readonly expanded?: boolean;
  readonly onDownload?: (title: string) => void;
  readonly onExpandedChange?: (expanded: boolean) => void;
}) {
  return (
    <SettingsSectionFrame
      actions={(
        <>
          <span className="pd-set-scope-badge pd-set-scope-badge--workspace">Dokumenty workspace</span>
          <span className="pd-set-scope-badge pd-set-scope-badge--success"><span aria-hidden="true">✓</span> Zgodność z RODO</span>
        </>
      )}
      collapsedSummary={`${settingsLegalDocs.length} dokumenty prawne · ${settingsSubprocessors.length} podmioty przetwarzające dane`}
      description="Sprawdź dokumenty prawne, umowę powierzenia danych oraz listę podmiotów przetwarzających dane."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={settingsSections[7]!}
    >
      <div className="pd-set-grid pd-set-grid--halves">
        <div className="pd-set-card">
          <div className="pd-set-card__head"><h3>Dokumenty prawne</h3></div>
          <div className="pd-set-view" style={{ gap: 8 }}>
            {settingsLegalDocs.map((doc) => (
              <div className="pd-set-list-item" key={doc.id}>
                <div>
                  <div className="pd-set-list-item__title">{doc.title}</div>
                  <div className="pd-set-list-item__meta">{doc.meta}</div>
                </div>
                <button className="pd-set-linklike pd-set-linklike--indigo" onClick={() => onDownload(doc.title)} type="button">
                  Pobierz PDF 📥
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pd-set-card">
          <div className="pd-set-card__head"><h3>Podmioty przetwarzające dane</h3></div>
          <div className="pd-set-view" style={{ gap: 8 }}>
            {settingsSubprocessors.map((sub) => (
              <div className="pd-set-list-item" key={sub.name}>
                <div>
                  <div className="pd-set-list-item__title">{sub.name}</div>
                  <div className="pd-set-list-item__meta">{sub.purpose}</div>
                </div>
                <span className="pd-set-pill pd-set-pill--emerald">AKTYWNY</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingsSectionFrame>
  );
}

export function SettingsAuditP0() {
  const chartData = settingsAuditPostureBreakdown.map((entry) => ({ name: entry.label, value: entry.value, tone: entry.tone }));
  const toneColor: Record<string, string> = {
    emerald: chartColors.emerald,
    indigo: chartColors.indigo,
    slate: chartColors.slate,
  };

  return (
    <ProductSectionFrame
      actions={<span className="pd-set-scope-badge pd-set-scope-badge--rule">Zasada: Zero Fake Persistence</span>}
      description="Poniższe zestawienie podsumowuje 8 priorytetowych poprawek architektonicznych P0 wyznaczonych w celu usunięcia fejkowej persistencji na frontendzie i doprowadzenia do pełnej spójności z canonical backend API."
      icon="warning"
      title="Raport Audytu Architektury Ustawień (P0 Fixes)"
    >
      <div className="pd-set-grid">
        <div className="pd-set-card">
          <div className="pd-set-card__head"><h3>Zgodność Modułów z Ground Truth</h3></div>
          <div className="pd-set-chart">
            <ResponsiveContainer height="100%" width="100%">
              <RechartsPieChart>
                <Pie cx="50%" cy="50%" data={chartData} dataKey="value" innerRadius={48} nameKey="name" outerRadius={78} paddingAngle={3}>
                  {chartData.map((entry) => (
                    <Cell fill={toneColor[entry.tone] ?? chartColors.slate} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pd-set-card pd-set-grid--span2">
          <div className="pd-set-card__head"><h3>Status Poprawek P0 Architektury Ustawień</h3></div>
          <div className="pd-set-view" style={{ gap: 8 }}>
            {settingsP0AuditItems.map((item) => (
              <div className="pd-set-audit-item" key={item.id}>
                <div className="pd-set-audit-item__check">✓</div>
                <div className="pd-set-audit-item__body">
                  <div className="pd-set-audit-item__head">
                    <h4>P0.#{item.id}: {item.title}</h4>
                    <span className="pd-set-pill pd-set-pill--emerald">GROUND TRUTH OK</span>
                  </div>
                  <p className="pd-set-audit-item__detail">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProductSectionFrame>
  );
}

function SettingsToast({
  message,
  tone,
}: {
  readonly message: string;
  readonly tone: ToastTone;
}) {
  return (
    <div className="pd-set-toast-stack">
      <div aria-live="polite" className={`pd-set-toast pd-set-toast--${tone}`}>
        <span>{tone === 'success' ? '✓' : tone === 'error' ? '✕' : 'ℹ'}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}

function SettingsSearchModal({
  onClose = noop,
  onNavigate = noop,
  open = false,
}: {
  readonly onClose?: () => void;
  readonly onNavigate?: (tab: SettingsTabId) => void;
  readonly open?: boolean;
}) {
  const [query, setQuery] = useState('');
  const matches = query.trim()
    ? settingsSearchIndex.filter((entry) =>
      entry.key.toLowerCase().includes(query.toLowerCase()) || entry.desc.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <Dialog
      className="pd-set-search-dialog"
      closeOnBackdrop
      closeOnEscape
      description={null}
      dismissible
      modal
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
          setQuery('');
        }
      }}
      open={open}
      title="Szukaj ustawień"
    >
      <div className="pd-set-search-modal__bar">
        <span>🔍</span>
        <input
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Szukaj ustawienia (np. 2FA, waluta, zaproszenie, ROAS, quiet hours)..."
          value={query}
        />
      </div>
      <div className="pd-set-search-modal__results">
        {!query.trim() && <div className="pd-set-search-modal__empty">Wpisz frazę wyszukiwania powyżej...</div>}
        {query.trim() && matches.length === 0 && <div className="pd-set-search-modal__empty">Brak pasujących ustawień.</div>}
        {matches.map((entry) => (
          <button
            className="pd-set-search-result"
            key={entry.key}
            onClick={() => {
              onNavigate(entry.section);
              onClose();
            }}
            type="button"
          >
            <div>
              <div className="pd-set-search-result__key">{entry.key}</div>
              <div className="pd-set-search-result__desc">{entry.desc}</div>
            </div>
            <span className="pd-set-search-result__go">Przejdź →</span>
          </button>
        ))}
      </div>
    </Dialog>
  );
}

function SettingsTotpWizardModal({
  onClose = noop,
  onVerified = noop,
  open = false,
}: {
  readonly onClose?: () => void;
  readonly onVerified?: () => void;
  readonly open?: boolean;
}) {
  const [code, setCode] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCode('');
    setShowSecret(false);
  }, [open]);

  function handleVerify() {
    if (code.length !== 6) return;
    onVerified();
  }

  return (
    <Dialog
      closeOnEscape
      description="Potrzebujesz aplikacji uwierzytelniającej."
      dismissible
      modal
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      open={open}
      title="Konfiguracja weryfikacji dwuetapowej"
    >
      <div className="pd-set-panel-note pd-set-panel-note--indigo" style={{ background: 'rgb(var(--pd-set-indigo-50))', border: '1px solid rgb(var(--pd-set-indigo-200))', color: 'rgb(var(--pd-set-indigo-950))' }}>
        <div className="pd-set-panel-note__title">1. Zeskanuj kod QR</div>
        <p>Użyj Google Authenticator, Microsoft Authenticator lub 1Password.</p>
      </div>

      <div className="pd-set-qr-block">
        <div className="pd-set-qr-tile" aria-label="Kod QR do konfiguracji aplikacji">Kod QR</div>
        <button className="pd-set-linklike pd-set-linklike--indigo" onClick={() => setShowSecret((value) => !value)} type="button">Nie możesz zeskanować kodu?</button>
        {showSecret ? <code className="pd-set-totp-secret">PAPA-DATA-DEMO-7J4K-29QX</code> : null}
      </div>

      <div className="pd-set-field">
        <label htmlFor="set-totp-code">2. Wpisz 6-cyfrowy kod z aplikacji</label>
        <input
          className="pd-set-input pd-set-totp-input"
          id="set-totp-code"
          maxLength={6}
          onChange={(event) => setCode(event.target.value)}
          placeholder="482910"
          value={code}
        />
      </div>

      <div className="pd-set-modal__actions">
        <button className="pd-set-button pd-set-button--muted" onClick={onClose} type="button">Anuluj</button>
        <button className="pd-set-button pd-set-button--primary" disabled={code.length !== 6} onClick={handleVerify} type="button">Włącz zabezpieczenie</button>
      </div>
    </Dialog>
  );
}

type SettingsInviteRoleOption = {
  readonly value: string;
  readonly label: string;
  readonly description: string;
};

const settingsDemoInviteRoles: readonly SettingsInviteRoleOption[] = (
  Object.keys(settingsRoleScopes) as Array<keyof SettingsRoleScopeMap>
).map((roleKey) => ({
  value: roleKey,
  label: roleKey,
  description: settingsRoleDescriptions[roleKey],
}));

function SettingsInviteModal({
  onClose = noop,
  onSent = noop,
  open = false,
  roles,
  submitError = null,
  submitting = false,
}: {
  readonly onClose?: () => void;
  readonly onSent?: (email: string, role: string) => void;
  readonly open?: boolean;
  readonly roles?: readonly SettingsInviteRoleOption[];
  readonly submitError?: string | null;
  readonly submitting?: boolean;
}) {
  const roleOptions = roles ?? settingsDemoInviteRoles;
  const [role, setRole] = useState<string>(roleOptions[0]?.value ?? '');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!open) return;
    setRole(roleOptions[0]?.value ?? '');
    setEmail('');
    // roleOptions intentionally excluded: it's a fresh array reference on
    // every render (inline `roles ?? settingsDemoInviteRoles`), and this
    // reset should only re-run when the dialog opens, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email || submitting) return;
    onSent(email, role);
  }

  const selectedScopes = roles ? null : settingsRoleScopes[role as keyof SettingsRoleScopeMap];
  const selectedDescription = roleOptions.find((option) => option.value === role)?.description ?? null;

  return (
    <Dialog
      className="pd-set-modal--wide"
      closeOnEscape
      description="Wybierz rolę odpowiednią do zakresu jej pracy."
      dismissible
      modal
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      open={open}
      title="Zaproś członka zespołu"
    >
      <form className="pd-set-view" onSubmit={handleSubmit} style={{ gap: 14 }}>
        <div className="pd-set-field">
          <label htmlFor="set-invite-email">Adres e-mail</label>
          <input
            className="pd-set-input"
            id="set-invite-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jan.kowalski@firma.pl"
            required
            type="email"
            value={email}
          />
        </div>

        <div className="pd-set-field pd-set-field--select">
          <Select
            id="set-invite-role"
            label="Rola"
            onChange={(event) => setRole(event.currentTarget.value)}
            options={roleOptions.map((option) => ({
              label: `${option.label} — ${option.description}`,
              value: option.value,
            }))}
            placeholder="Wybierz rolę"
            value={role}
          />
        </div>

        <div className="pd-set-scope-preview">
          <div className="pd-set-scope-preview__title">Uprawnienia przypisane do tej roli</div>
          {selectedScopes ? (
            <div className="pd-set-scope-chips">
              {selectedScopes.map((scope) => (
                <span className="pd-set-scope-chip" key={scope}>{scope}</span>
              ))}
            </div>
          ) : (
            <p className="pd-set-info-block__text" style={{ marginTop: 0 }}>{selectedDescription}</p>
          )}
        </div>

        {submitError ? (
          <div className="pd-set-panel-note pd-set-panel-note--rose">
            <p>{submitError}</p>
          </div>
        ) : null}

        <div className="pd-set-modal__actions">
          <button className="pd-set-button pd-set-button--muted" onClick={onClose} type="button">Anuluj</button>
          <button className="pd-set-button pd-set-button--primary" disabled={submitting} type="submit">
            {submitting ? 'Wysyłanie…' : 'Wyślij zaproszenie'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function SettingsTargetModal({
  initialTarget = null,
  onClose = noop,
  onSave = noop,
  open = false,
}: {
  readonly initialTarget?: SettingsTarget | null;
  readonly onClose?: () => void;
  readonly onSave?: (target: SettingsTarget) => void;
  readonly open?: boolean;
}) {
  const [name, setName] = useState(initialTarget?.name ?? '');
  const [value, setValue] = useState(initialTarget ? String(initialTarget.value) : '');
  const [threshold, setThreshold] = useState(initialTarget ? String(initialTarget.threshold) : '90');

  // The dialog now stays mounted while closed (controlled by `open`), so
  // form state must be re-synced on each open instead of relying on a
  // remount to reset it.
  useEffect(() => {
    if (!open) return;
    setName(initialTarget?.name ?? '');
    setValue(initialTarget ? String(initialTarget.value) : '');
    setThreshold(initialTarget ? String(initialTarget.threshold) : '90');
  }, [open, initialTarget]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const numericValue = Number.parseFloat(value);
    if (!name || Number.isNaN(numericValue)) return;
    onSave({
      id: initialTarget?.id ?? `tgt_${Date.now()}`,
      name,
      metricKey: initialTarget?.metricKey ?? 'custom_kpi',
      value: numericValue,
      actual: initialTarget?.actual ?? 0,
      currency: initialTarget?.currency ?? 'PLN',
      threshold: Number.parseFloat(threshold) || 90,
      cadence: initialTarget?.cadence ?? 'MONTHLY',
    });
  }

  return (
    <Dialog
      closeOnEscape
      description="Ustaw wartość docelową i próg alertu."
      dismissible
      modal
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      open={open}
      title={initialTarget ? 'Edytuj cel biznesowy' : 'Nowy cel biznesowy'}
    >
      <form className="pd-set-view" onSubmit={handleSubmit} style={{ gap: 12 }}>
        <div className="pd-set-field">
          <label htmlFor="set-target-name">Nazwa celu</label>
          <input className="pd-set-input" id="set-target-name" onChange={(event) => setName(event.target.value)} required value={name} />
        </div>
        <div className="pd-set-field-row">
          <div className="pd-set-field">
            <label htmlFor="set-target-value">Wartość docelowa</label>
            <input className="pd-set-input" id="set-target-value" onChange={(event) => setValue(event.target.value)} required step="0.01" type="number" value={value} />
          </div>
          <div className="pd-set-field">
            <label htmlFor="set-target-threshold">Próg alertu (%)</label>
            <input className="pd-set-input" id="set-target-threshold" onChange={(event) => setThreshold(event.target.value)} required type="number" value={threshold} />
          </div>
        </div>

        <div className="pd-set-modal__actions">
          <button className="pd-set-button pd-set-button--muted" onClick={onClose} type="button">Anuluj</button>
          <button className="pd-set-button pd-set-button--primary" type="submit">{initialTarget ? 'Zapisz cel' : 'Dodaj cel'}</button>
        </div>
      </form>
    </Dialog>
  );
}
