import type {
  FormEvent,
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

import {
  Button,
} from '../../../design-system';
import type {
  SettingsRoleScopeMap,
  SettingsTabId,
  SettingsTarget,
} from './SettingsGovernanceBiPage.data';
import {
  settingsAiMemory,
  settingsAuditPostureBreakdown,
  settingsInvitations,
  settingsLegalDocs,
  settingsP0AuditItems,
  settingsPasskeys,
  settingsRailGroups,
  settingsRoleDescriptions,
  settingsRoleScopes,
  settingsSearchIndex,
  settingsSessions,
  settingsSubprocessors,
  settingsTargets,
  settingsTeamMembers,
} from './SettingsGovernanceBiPage.data';

import './SettingsGovernanceBiPage.css';

const chartColors = {
  amber: 'rgb(var(--pd-set-amber-600))',
  emerald: 'rgb(var(--pd-set-emerald-600))',
  indigo: 'rgb(var(--pd-set-indigo-600))',
  slate: 'rgb(var(--pd-set-slate-400))',
} as const;

const noop = () => undefined;

type ToastTone = 'success' | 'info' | 'error';

type ToastState = {
  readonly message: string;
  readonly tone: ToastTone;
} | null;

export function SettingsGovernanceBiPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('account-profile');
  const [revision, setRevision] = useState(124);
  const [toast, setToast] = useState<ToastState>(null);
  const [targets, setTargets] = useState<readonly SettingsTarget[]>(settingsTargets);
  const [searchOpen, setSearchOpen] = useState(false);
  const [totpOpen, setTotpOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [targetModalOpen, setTargetModalOpen] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setTotpOpen(false);
        setInviteOpen(false);
        setTargetModalOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function announce(message: string, tone: ToastTone = 'success') {
    setToast({ message, tone });
  }

  function handleConcurrencyConflict() {
    setRevision(125);
    announce('Przeładowano najnowszą wersję ustawień z serwera (#125)', 'info');
  }

  function handleCompanySave() {
    setRevision((value) => value + 1);
    announce('Ustawienia Workspace zapisane.', 'success');
  }

  function handleCreateTarget(target: SettingsTarget) {
    setTargets((current) => [...current, target]);
    setTargetModalOpen(false);
    announce('Zapisano nowy cel w API /targets', 'success');
  }

  return (
    <div className="pd-set">
      <SettingsHeader onOpenSearch={() => setSearchOpen(true)} revision={revision} />
      <SettingsP0Banner onViewAudit={() => setActiveTab('audit-p0')} />
      <SettingsNav activeTab={activeTab} onSelect={setActiveTab} />

      <main className="pd-set-content">
        <div className="pd-set-view">
          {activeTab === 'account-profile' && (
            <SettingsAccountProfile onSave={() => announce('Zapisano preferencje profilu w /settings/account/profile', 'success')} />
          )}
          {activeTab === 'account-security' && (
            <SettingsAccountSecurity
              onOpenTotpWizard={() => setTotpOpen(true)}
              onRevokeSession={(label) => announce(`Unieważniono token sesji ${label}`, 'success')}
            />
          )}
          {activeTab === 'ws-company' && (
            <SettingsWorkspaceCompany
              onSave={handleCompanySave}
              onSimulateConflict={handleConcurrencyConflict}
              revision={revision}
            />
          )}
          {activeTab === 'ws-team' && (
            <SettingsWorkspaceTeam onOpenInvite={() => setInviteOpen(true)} />
          )}
          {activeTab === 'ws-analytics' && (
            <SettingsWorkspaceAnalytics onOpenCreateTarget={() => setTargetModalOpen(true)} targets={targets} />
          )}
          {activeTab === 'ws-ai' && <SettingsWorkspaceAi onSave={() => announce('Zapisano ustawienia zachowania Papa AI', 'success')} />}
          {activeTab === 'ws-notifications' && (
            <SettingsWorkspaceNotifications
              onSave={() => announce('Zapisano reguły Quiet Hours i harmonogramy dostarczania', 'success')}
              onTestDelivery={() => announce('Wysłano prawdziwy testowy email z podsumowaniem na: anna@casadiorfeo.pl', 'info')}
            />
          )}
          {activeTab === 'ws-compliance' && (
            <SettingsWorkspaceCompliance onDownload={(title) => announce(`Pobieranie dokumentu: ${title}`, 'info')} />
          )}
          {activeTab === 'audit-p0' && <SettingsAuditP0 />}
        </div>
      </main>

      {toast && <SettingsToast message={toast.message} tone={toast.tone} />}

      {searchOpen && <SettingsSearchModal onClose={() => setSearchOpen(false)} onNavigate={setActiveTab} />}
      {totpOpen && (
        <SettingsTotpWizardModal
          onClose={() => setTotpOpen(false)}
          onVerified={() => {
            setTotpOpen(false);
            announce('TOTP 2FA zweryfikowane i aktywowane pomyślnie!', 'success');
          }}
        />
      )}
      {inviteOpen && (
        <SettingsInviteModal
          onClose={() => setInviteOpen(false)}
          onSent={(email, role) => {
            setInviteOpen(false);
            announce(`Wysłano zaproszenie email do ${email} z rolą ${role}`, 'success');
          }}
        />
      )}
      {targetModalOpen && (
        <SettingsTargetModal onClose={() => setTargetModalOpen(false)} onSave={handleCreateTarget} />
      )}
    </div>
  );
}

function SettingsHeader({
  onOpenSearch = noop,
  revision,
}: {
  readonly onOpenSearch?: () => void;
  readonly revision: number;
}) {
  return (
    <header className="pd-set-header">
      <div className="pd-set-brand">
        <span className="pd-set-brand__mark">PapaData</span>
        <div>
          <h1 className="pd-set-brand__title">
            <span>Ustawienia Workspace &amp; Governance Center</span>
            <span className="pd-set-brand__tag">ID-9 Canonical</span>
          </h1>
          <p className="pd-set-brand__subtitle">Centrum zarządzania bezpieczeństwem, uprawnieniami i analityką organizacyjną</p>
        </div>
      </div>
      <div className="pd-set-header__actions">
        <button className="pd-set-search-trigger" onClick={onOpenSearch} type="button">
          <span>🔍</span>
          <span>Szukaj ustawień...</span>
          <kbd>Ctrl + K</kbd>
        </button>
        <div className="pd-set-workspace-badge">
          <span className="pd-set-workspace-badge__label">Workspace:</span>
          <span className="pd-set-workspace-badge__name">Casa di Orfeo Sp. z o.o.</span>
          <span className="pd-set-workspace-badge__role">Właściciel</span>
        </div>
        <div className="pd-set-revision" title="Optimistic Concurrency Control">
          <span className="pd-set-revision__dot" />
          <span>rev: <strong>{revision}</strong></span>
        </div>
      </div>
    </header>
  );
}

function SettingsP0Banner({
  onViewAudit = noop,
}: {
  readonly onViewAudit?: () => void;
}) {
  return (
    <div className="pd-set-p0-banner">
      <div className="pd-set-p0-banner__lede">
        <span className="pd-set-p0-banner__tag">AUDYT AUD-2026</span>
        <span>Stan Architektury: <strong>Przejście z lokalnych symulacji na Canonical Backend API</strong></span>
      </div>
      <div className="pd-set-p0-banner__status">
        <span className="pd-set-p0-banner__ok"><span>✓</span> <span>Ground Truth Policy Active</span></span>
        <span className="pd-set-p0-banner__warn"><span>⚠️</span> 8 Poprawek Krytycznych P0</span>
        <Button onClick={onViewAudit} size="small" variant="ghost">Zobacz Raport Audytu →</Button>
      </div>
    </div>
  );
}

/** Floating pill nav that appears on scroll -- same pattern as every other BI mockup (Command Center/Campaigns/Orders/Products/Customers/Traffic/Wsparcie w marketingu), replacing the header-embedded nav bar. */
function SettingsNav({
  activeTab,
  onSelect = noop,
}: {
  readonly activeTab: SettingsTabId;
  readonly onSelect?: (tab: SettingsTabId) => void;
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const scrollContainer = document.querySelector('.pd-set-content');
    if (!scrollContainer) return undefined;

    function handleScroll() {
      setIsScrolled(scrollContainer!.scrollTop > 24);
    }

    handleScroll();
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  function selectAndScrollToTop(tab: SettingsTabId) {
    onSelect(tab);
    document.querySelector('.pd-set-content')?.scrollTo({ behavior: 'smooth', top: 0 });
  }

  return (
    <nav aria-label="Nawigacja ustawień" className={isScrolled ? 'pd-set-nav is-visible' : 'pd-set-nav'}>
      {settingsRailGroups.map((group) => (
        <div className="pd-set-nav-group" key={group.label}>
          <span className="pd-set-nav-group__label">{group.label}:</span>
          {group.items.map((item) => (
            <button
              className="pd-set-nav-button"
              data-active={activeTab === item.id}
              key={item.id}
              onClick={() => selectAndScrollToTop(item.id)}
              type="button"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ))}
      <div className="pd-set-nav-group">
        <button
          className="pd-set-nav-button pd-set-nav-button--audit"
          data-active={activeTab === 'audit-p0'}
          onClick={() => selectAndScrollToTop('audit-p0')}
          type="button"
        >
          <span>🚨</span>
          <span>Audyt P0</span>
        </button>
      </div>
    </nav>
  );
}

export function SettingsAccountProfile({
  onSave = noop,
}: {
  readonly onSave?: () => void;
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave();
  }

  return (
    <>
      <div className="pd-set-intro">
        <div>
          <div className="pd-set-intro__heading">
            <h2>Moje konto</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--personal">Zakres: Tylko moje konto</span>
          </div>
          <p className="pd-set-intro__body">
            Ta sekcja odpowiada za Twoją indywidualną tożsamość w systemie PapaData, preferencje językowe oraz formatowanie liczb.
            Zmiany wprowadzone w tym miejscu wpływają wyłącznie na Twój profil i nie zmieniają widoku pozostałych członków organizacji.
          </p>
        </div>
        <span className="pd-set-scope-badge pd-set-scope-badge--success">Email Zweryfikowany ✓</span>
      </div>

      <div className="pd-set-grid">
        <div className="pd-set-card pd-set-grid--span2">
          <div className="pd-set-card__head">
            <h3>Dane Osobowe i Profil</h3>
            <span className="pd-set-card__meta">Identyfikator użytkownika: usr_9942a78</span>
          </div>

          <form className="pd-set-view" onSubmit={handleSubmit} style={{ gap: 16 }}>
            <div className="pd-set-field-row">
              <div className="pd-set-field">
                <label htmlFor="set-prof-name">Imię i Nazwisko Wyświetlane</label>
                <input className="pd-set-input" defaultValue="Anna Kowalska" id="set-prof-name" type="text" />
              </div>
              <div className="pd-set-field">
                <label htmlFor="set-prof-title">Stanowisko / Rola Operacyjna</label>
                <input className="pd-set-input" defaultValue="Head of Ecommerce & Growth" id="set-prof-title" type="text" />
              </div>
            </div>

            <div className="pd-set-panel-note pd-set-panel-note--amber">
              <div className="pd-set-panel-note__title"><span>🔒</span><span>Adres Email Tożsamości: anna@casadiorfeo.pl</span></div>
              <p>
                Zgodnie z wymogami audytu bezpieczeństwa, zmiana adresu email wymaga podania aktualnego hasła, weryfikacji tokenem
                wysłanym na nowy adres oraz unieważnienia aktywnych sesji tokenowych.
              </p>
              <button className="pd-set-button pd-set-button--muted" style={{ justifySelf: 'start' }} type="button">
                Rozpocznij Procedurę Zmiany Emaila
              </button>
            </div>

            <div className="pd-set-field-row">
              <div className="pd-set-field">
                <label htmlFor="set-prof-lang">Język Interfejsu (UI Language)</label>
                <select className="pd-set-select" defaultValue="pl-PL" id="set-prof-lang">
                  <option value="pl-PL">Polski (pl-PL)</option>
                  <option value="en-US">English (en-US)</option>
                  <option value="de-DE">Deutsch (de-DE)</option>
                </select>
              </div>
              <div className="pd-set-field">
                <label htmlFor="set-prof-format">Format Liczb i Dat</label>
                <select className="pd-set-select" defaultValue="PL" id="set-prof-format">
                  <option value="PL">1 234,56 PLN / DD.MM.YYYY</option>
                  <option value="US">$1,234.56 / MM/DD/YYYY</option>
                  <option value="ISO">1 234,56 / YYYY-MM-DD</option>
                </select>
              </div>
            </div>

            <div className="pd-set-form-footer">
              <span className="pd-set-form-footer__hint">Zapis wysyła request do: <code>PATCH /settings/account/profile</code></span>
              <button className="pd-set-button pd-set-button--primary" type="submit">Zapisz Preferencje Profilu</button>
            </div>
          </form>
        </div>

        <div className="pd-set-card">
          <div className="pd-set-card__head"><h3>Status Konta i Autentykacja</h3></div>
          <dl className="pd-set-kv-list">
            <div className="pd-set-kv-row"><dt>Metoda Logowania:</dt><dd>Hasło + TOTP 2FA</dd></div>
            <div className="pd-set-kv-row"><dt>Dostawca SSO:</dt><dd className="pd-set-mono">Brak (Konto Lokalne)</dd></div>
            <div className="pd-set-kv-row"><dt>Ostatnie Udane Logowanie:</dt><dd className="pd-set-mono">Dzisiaj, 09:42 CEST</dd></div>
            <div className="pd-set-kv-row"><dt>Rola w Workspace:</dt><dd><span className="pd-set-pill pd-set-pill--indigo">Właściciel (OWNER)</span></dd></div>
          </dl>
          <div className="pd-set-panel-note pd-set-panel-note--slate">
            <div className="pd-set-panel-note__title" style={{ color: 'rgb(var(--pd-set-slate-800))' }}>Personal Notification Scope:</div>
            <p>Powiadomienia o Twoich przypisaniach zadań oraz podsumowaniach będą wysyłane na powyższy e-mail.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export function SettingsAccountSecurity({
  onOpenTotpWizard = noop,
  onRevokeSession = noop,
}: {
  readonly onOpenTotpWizard?: () => void;
  readonly onRevokeSession?: (sessionId: string) => void;
}) {
  return (
    <>
      <div className="pd-set-intro">
        <div>
          <div className="pd-set-intro__heading">
            <h2>Bezpieczeństwo i Dostęp</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--domain">Domain: Security &amp; Auth</span>
          </div>
          <p className="pd-set-intro__body">
            Dedykowany moduł bezpieczeństwa konta i organizacyjnych zasad dostępu. System wspiera wyłącznie prawdziwy backendowy flow
            TOTP (Google/Microsoft Authenticator/1Password) oraz zarządzanie aktywnymi sesjami — bez pozornego SMS 2FA.
          </p>
        </div>
        <span className="pd-set-scope-badge pd-set-scope-badge--success"><span>🛡️</span> 2FA TOTP Aktywne</span>
      </div>

      <div className="pd-set-grid pd-set-grid--halves">
        <div className="pd-set-card">
          <div className="pd-set-card__head">
            <div>
              <h3>Uwierzytelnianie Dwuskładnikowe (2FA / TOTP)</h3>
              <p>Zgodność z API: <code>/auth/2fa/totp/*</code></p>
            </div>
            <span className="pd-set-pill pd-set-pill--emerald">AKTYWNE</span>
          </div>

          <div className="pd-set-info-block">
            <div className="pd-set-info-block__row">
              <div className="pd-set-info-block__icon">🔑</div>
              <div>
                <div className="pd-set-info-block__title">Aplikacja Uwierzytelniająca (TOTP)</div>
                <p className="pd-set-info-block__text">
                  Konto jest zabezpieczone czasowym kodem jednorazowym. Wszystkie próby zalogowania z nowych urządzeń wymagają
                  podania 6-cyfrowego kodu.
                </p>
              </div>
            </div>
            <div className="pd-set-status-grid">
              <div className="pd-set-status-tile">
                <span className="pd-set-status-tile__label">Dostawca:</span>
                <span className="pd-set-status-tile__value">Standard RFC 6238 TOTP</span>
              </div>
              <div className="pd-set-status-tile">
                <span className="pd-set-status-tile__label">Backup Codes:</span>
                <span className="pd-set-status-tile__value">8 z 10 pozostało</span>
              </div>
            </div>
          </div>

          <div className="pd-set-form-footer">
            <button className="pd-set-button pd-set-button--primary" onClick={onOpenTotpWizard} type="button">
              <span>🔄</span> Ponownie Skonfiguruj TOTP / Wygeneruj QR
            </button>
            <button className="pd-set-linklike" type="button">Wyłącz 2FA (Wymaga Step-up)</button>
          </div>
        </div>

        <div className="pd-set-card">
          <div className="pd-set-card__head">
            <div>
              <h3>Klucze Dostępu (Passkeys / WebAuthn)</h3>
              <p>Logowanie biometryczne (TouchID, FaceID, Windows Hello)</p>
            </div>
            <span className="pd-set-pill pd-set-pill--slate">FIDO2</span>
          </div>
          <div className="pd-set-view" style={{ gap: 8 }}>
            {settingsPasskeys.map((passkey) => (
              <div className="pd-set-list-item" key={passkey.id}>
                <div className="pd-set-list-item__lead">
                  <span>{passkey.icon}</span>
                  <div>
                    <div className="pd-set-list-item__title">{passkey.label}</div>
                    <div className="pd-set-list-item__meta">{passkey.meta}</div>
                  </div>
                </div>
                <button className="pd-set-linklike" type="button">Usuń</button>
              </div>
            ))}
          </div>
          <button className="pd-set-button pd-set-button--dark pd-set-button--block" type="button">
            <span>➕</span> Dodaj Nowy Klucz Dostępu (Passkey)
          </button>
        </div>

        <div className="pd-set-card pd-set-grid--span2">
          <div className="pd-set-card__head">
            <div>
              <h3>Aktywne Sesje i Urządzenia</h3>
              <p>Endpoint: <code>GET /settings/security/sessions</code></p>
            </div>
            <button className="pd-set-button pd-set-button--danger-outline" onClick={() => onRevokeSession('all')} type="button">
              Wyloguj Wszystkie Inne Sesje
            </button>
          </div>
          <div className="pd-set-table-wrap">
            <table className="pd-set-table">
              <thead>
                <tr>
                  <th>Urządzenie / Przeglądarka</th>
                  <th>Adres IP</th>
                  <th>Ostatnia Aktywność</th>
                  <th>Status</th>
                  <th className="pd-set-cell-right">Akcja</th>
                </tr>
              </thead>
              <tbody>
                {settingsSessions.map((session) => (
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
    </>
  );
}

export function SettingsWorkspaceCompany({
  onSave = noop,
  onSimulateConflict = noop,
  revision = 124,
}: {
  readonly onSave?: () => void;
  readonly onSimulateConflict?: () => void;
  readonly revision?: number;
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave();
  }

  return (
    <>
      <div className="pd-set-intro">
        <div>
          <div className="pd-set-intro__heading">
            <h2>Firma i Workspace</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--workspace">Zakres: Cały Workspace</span>
          </div>
          <p className="pd-set-intro__body">
            Konfiguracja tożsamości prawnej organizacji, strefy czasowej oraz waluty raportowania. Zmiany w tej sekcji wpływają na
            agregacje danych, granice dni w raportach oraz reguły alertów w całej organizacji.
          </p>
        </div>
        <span className="pd-set-pill pd-set-pill--slate" style={{ fontFamily: 'var(--pd-font-mono)' }}>Revision: #{revision}</span>
      </div>

      <div className="pd-set-grid">
        <div className="pd-set-card pd-set-grid--span2">
          <div className="pd-set-card__head">
            <h3>Dane Prawne Organizacji</h3>
            <span className="pd-set-scope-badge pd-set-scope-badge--success">✓ Zweryfikowano w GUS</span>
          </div>

          <form className="pd-set-view" onSubmit={handleSubmit} style={{ gap: 16 }}>
            <div className="pd-set-field-row">
              <div className="pd-set-field">
                <label htmlFor="set-comp-trade">Nazwa Handlowa / Trade Name</label>
                <input className="pd-set-input" defaultValue="Casa di Orfeo" id="set-comp-trade" type="text" />
              </div>
              <div className="pd-set-field">
                <label htmlFor="set-comp-legal">Pełna Nazwa Rejestrowa (Prawna)</label>
                <input className="pd-set-input" defaultValue="Casa di Orfeo Spółka z o.o." id="set-comp-legal" type="text" />
              </div>
            </div>

            <div className="pd-set-field-row pd-set-field-row--thirds">
              <div className="pd-set-field">
                <label htmlFor="set-comp-nip">NIP / Tax ID</label>
                <input className="pd-set-input" defaultValue="7312049912" disabled id="set-comp-nip" type="text" />
              </div>
              <div className="pd-set-field">
                <label htmlFor="set-comp-regon">REGON</label>
                <input className="pd-set-input" defaultValue="381902441" disabled id="set-comp-regon" type="text" />
              </div>
              <div className="pd-set-field">
                <label htmlFor="set-comp-industry">Branża Analityczna</label>
                <select className="pd-set-select" defaultValue="ecommerce_fashion" id="set-comp-industry">
                  <option value="ecommerce_fashion">E-commerce (Odzież &amp; Obuwie)</option>
                  <option value="ecommerce_electronics">E-commerce (Elektronika)</option>
                  <option value="saas">SaaS / Subskrypcje</option>
                </select>
              </div>
            </div>

            <div className="pd-set-panel-note pd-set-panel-note--slate">
              <div className="pd-set-panel-note__title" style={{ color: 'rgb(var(--pd-set-slate-900))', justifyContent: 'space-between' }}>
                <span>Konfiguracja Raportowania &amp; FX</span>
                <span className="pd-set-pill pd-set-pill--slate">Zasada Semantyczna</span>
              </div>
              <div className="pd-set-field-row">
                <div className="pd-set-field">
                  <label htmlFor="set-comp-currency">Waluta Raportowania Workspace</label>
                  <select className="pd-set-select" defaultValue="PLN" id="set-comp-currency">
                    <option value="PLN">PLN — Polski Złoty</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="USD">USD — US Dollar</option>
                  </select>
                </div>
                <div className="pd-set-field">
                  <label htmlFor="set-comp-tz">Strefa Czasowa Workspace</label>
                  <select className="pd-set-select" defaultValue="Europe/Warsaw" id="set-comp-tz">
                    <option value="Europe/Warsaw">Europe/Warsaw (UTC+02:00)</option>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">America/New_York (UTC-04:00)</option>
                  </select>
                </div>
              </div>
              <p style={{ borderTop: '1px solid rgb(var(--pd-set-slate-200))', paddingTop: 8 }}>
                ⚠️ <strong>Ważne:</strong> Dane źródłowe (zamówienia, koszty reklamowe) pozostają w walutach transakcyjnych. Zmiana
                waluty raportowania przelicza agregaty według dziennych kursów NBP/ECB. Zmiana strefy czasowej przesuwa granice dni
                w agregatach analitycznych.
              </p>
            </div>

            <div className="pd-set-form-footer">
              <button className="pd-set-linklike pd-set-linklike--amber" onClick={onSimulateConflict} type="button">
                🧪 Symuluj Konflikt Edycji (409 Revision Conflict)
              </button>
              <button className="pd-set-button pd-set-button--primary" type="submit">Zapisz Zmiany Workspace</button>
            </div>
          </form>
        </div>

        <div className="pd-set-view" style={{ gap: 20 }}>
          <div className="pd-set-card">
            <div className="pd-set-card__head"><h3>Logo Workspace (Object Storage)</h3></div>
            <p className="pd-set-info-block__text" style={{ marginTop: 0 }}>
              Assety nie są zapisywane jako Base64 w rekordzie settings, lecz przetwarzane do CDN S3.
            </p>
            <div className="pd-set-logo-row">
              <div className="pd-set-logo-tile">CdO</div>
              <div className="pd-set-logo-meta">
                <span className="pd-set-logo-meta__name">logo_v4_cdn.webp</span>
                <span className="pd-set-logo-meta__dims">Wymiary: 512×512 • Object Storage S3</span>
                <button className="pd-set-button pd-set-button--muted" style={{ justifySelf: 'start', marginTop: 4 }} type="button">
                  Wgraj Nowe Logo
                </button>
              </div>
            </div>
          </div>

          <div className="pd-set-danger-zone">
            <div className="pd-set-danger-zone__title"><span>⚠️</span><span>Strefa Krytyczna (Danger Zone)</span></div>
            <p className="pd-set-danger-zone__body">
              Operacje nieodwracalne lub wymagające pełnego uprawnienia Właściciela (OWNER). Wymagają uwierzytelnienia step-up.
            </p>
            <button className="pd-set-danger-row pd-set-danger-row--outline" type="button">
              <span>Eksportuj Wszystkie Dane (ZIP/CSV)</span><span>📥</span>
            </button>
            <button className="pd-set-danger-row pd-set-danger-row--solid" type="button">
              <span>Usuń Workspace Permanentnie</span><span>💣</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function SettingsWorkspaceTeam({
  onOpenInvite = noop,
}: {
  readonly onOpenInvite?: () => void;
}) {
  return (
    <>
      <div className="pd-set-intro">
        <div>
          <div className="pd-set-intro__heading">
            <h2>Zespół i Uprawnienia (RBAC)</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--domain">RBAC Ground Truth</span>
          </div>
          <p className="pd-set-intro__body">
            Zarządzanie członkami organizacji, rolami systemowymi oraz zaproszeniami. Backend jest wyłącznym źródłem prawdy dla
            katalogu ról (<code>OWNER</code>, <code>ADMIN</code>, <code>MEMBER</code>, <code>ANALYST</code>,{' '}
            <code>GROWTH_OPERATOR</code>, <code>VIEWER</code>).
          </p>
        </div>
        <button className="pd-set-button pd-set-button--primary" onClick={onOpenInvite} type="button">
          <span>➕</span> Zaproś Nowego Użytkownika
        </button>
      </div>

      <div className="pd-set-card">
        <div className="pd-set-card__head">
          <h3>Aktywni Członkowie Zespołu ({settingsTeamMembers.length})</h3>
          <span className="pd-set-card__meta">Endpoint API: <code>GET /settings/team/members</code></span>
        </div>
        <div className="pd-set-table-wrap">
          <table className="pd-set-table">
            <thead>
              <tr>
                <th>Użytkownik</th>
                <th>Rola Systemowa</th>
                <th>Status 2FA</th>
                <th>Ostatnia Aktywność</th>
                <th className="pd-set-cell-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {settingsTeamMembers.map((member) => (
                <tr key={member.id}>
                  <td className="pd-set-cell-strong">
                    <div>{member.name}</div>
                    <div style={{ color: 'rgb(var(--pd-set-slate-400))', fontWeight: 400, fontSize: 'var(--pd-type-size-micro)' }}>{member.email}</div>
                  </td>
                  <td><span className="pd-set-pill pd-set-pill--slate" style={{ fontFamily: 'var(--pd-font-mono)' }}>{member.role}</span></td>
                  <td>
                    {member.mfa
                      ? <span className="pd-set-pill pd-set-pill--emerald">✓ TOTP Aktywne</span>
                      : <span className="pd-set-pill pd-set-pill--amber">Wymaga aktywacji</span>}
                  </td>
                  <td className="pd-set-cell-muted">{member.lastSeen}</td>
                  <td className="pd-set-cell-right">
                    {member.role === 'OWNER'
                      ? <span style={{ color: 'rgb(var(--pd-set-slate-400))' }}>Właściciel</span>
                      : <button className="pd-set-linklike pd-set-linklike--indigo" type="button">Zmień rolę</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pd-set-card">
        <div className="pd-set-card__head">
          <h3>Oczekujące Zaproszenia ({settingsInvitations.length})</h3>
          <span className="pd-set-pill pd-set-pill--amber">Wygasają po 7 dniach</span>
        </div>
        <div className="pd-set-table-wrap">
          <table className="pd-set-table">
            <thead>
              <tr>
                <th>Email Zaproszonego</th>
                <th>Przypisana Rola</th>
                <th>Wysłano</th>
                <th>Wygasa</th>
                <th className="pd-set-cell-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {settingsInvitations.map((invite) => (
                <tr key={invite.id}>
                  <td className="pd-set-cell-strong">{invite.email}</td>
                  <td><span className="pd-set-pill pd-set-pill--slate" style={{ fontFamily: 'var(--pd-font-mono)' }}>{invite.role}</span></td>
                  <td className="pd-set-cell-muted">{invite.sentAt}</td>
                  <td className="pd-set-cell-muted">{invite.expiresAt}</td>
                  <td className="pd-set-cell-right">
                    <button className="pd-set-linklike pd-set-linklike--indigo" style={{ marginRight: 12 }} type="button">Wyślij ponowny email</button>
                    <button className="pd-set-linklike" type="button">Anuluj</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function SettingsWorkspaceAnalytics({
  onOpenCreateTarget = noop,
  targets = settingsTargets,
}: {
  readonly onOpenCreateTarget?: () => void;
  readonly targets?: readonly SettingsTarget[];
}) {
  const chartData = targets.map((target) => ({
    name: target.metricKey === 'roas_target' ? 'ROAS (x10)' : target.name.split(' ')[0],
    cel: target.metricKey === 'roas_target' ? target.value * 10 : target.value / (target.metricKey === 'revenue_monthly' ? 1000 : 1),
    aktualnie: target.metricKey === 'roas_target' ? target.actual * 10 : target.actual / (target.metricKey === 'revenue_monthly' ? 1000 : 1),
  }));

  return (
    <>
      <div className="pd-set-intro">
        <div>
          <div className="pd-set-intro__heading">
            <h2>Analityka i Cele Biznesowe</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--success">API: /targets CRUD</span>
          </div>
          <p className="pd-set-intro__body">
            Konfiguracja wskaźników targetowych oraz parametrów atrybucji. Wszystkie cele operują na prawdziwym backendowym
            endpoincie <code>/targets</code> — bez lokalnego zapisu w <code>localStorage</code>.
          </p>
        </div>
        <button className="pd-set-button pd-set-button--primary" onClick={onOpenCreateTarget} type="button">
          <span>🎯</span> Dodaj Nowy Cel Biznesowy
        </button>
      </div>

      <div className="pd-set-grid">
        <div className="pd-set-card pd-set-grid--span2">
          <div className="pd-set-card__head">
            <h3>Postęp Realizacji Celów (Sierpień 2026)</h3>
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
          <div className="pd-set-card__head"><h3>Konfiguracja Atrybucji</h3></div>
          <div className="pd-set-field">
            <label htmlFor="set-attr-model">Model Atrybucji Raportowej</label>
            <select className="pd-set-select" defaultValue="data-driven" id="set-attr-model">
              <option value="data-driven">Data-Driven (Algorytmiczny Papa AI)</option>
              <option value="last-touch">Last Interaction (Ostatnie kliknięcie)</option>
              <option value="first-touch">First Interaction (Pierwszy kontakt)</option>
            </select>
          </div>
          <div className="pd-set-field">
            <label htmlFor="set-attr-window">Okno Atrybucji Konwersji</label>
            <select className="pd-set-select" defaultValue="30" id="set-attr-window">
              <option value="30">30 Dni (Domyślne E-commerce)</option>
              <option value="14">14 Dni (Krótki cykl)</option>
              <option value="90">90 Dni (Długi cykl SaaS/B2B)</option>
            </select>
          </div>
          <div className="pd-set-panel-note pd-set-panel-note--slate">
            <p>⚠️ Zmiana metodyki atrybucji wymaga ponownej kalkulacji agregatów przychodu w tle.</p>
          </div>
          <button className="pd-set-button pd-set-button--dark pd-set-button--block" type="button">Zapisz Parametry Atrybucji</button>
        </div>

        <div className="pd-set-card pd-set-grid--span3">
          <div className="pd-set-card__head"><h3>Zdefiniowane Cele Biznesowe (/targets)</h3></div>
          <div className="pd-set-table-wrap">
            <table className="pd-set-table">
              <thead>
                <tr>
                  <th>Nazwa Celu</th>
                  <th>Klucz Metryki</th>
                  <th>Wartość Docelowa</th>
                  <th>Próg Alertu</th>
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
                    <td className="pd-set-cell-right"><button className="pd-set-linklike pd-set-linklike--indigo" type="button">Edytuj w API</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export function SettingsWorkspaceAi({
  onSave = noop,
}: {
  readonly onSave?: () => void;
}) {
  const [style, setStyle] = useState<'concise' | 'standard' | 'detailed'>('standard');

  return (
    <>
      <div className="pd-set-intro">
        <div>
          <div className="pd-set-intro__heading">
            <h2>Papa Asystent AI — Konfiguracja i Pamięć</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--ai">Domain: AI Governance</span>
          </div>
          <p className="pd-set-intro__body">
            Zarządzanie zachowaniem asystenta, proaktywnością rekomendacji oraz słownikiem pamięci workspace. Asystent respektuje
            uprawnienia RBAC zalogowanego użytkownika (<code>User Scopes ∩ AI Scope</code>).
          </p>
        </div>
        <span className="pd-set-scope-badge pd-set-scope-badge--ai" style={{ fontWeight: 600 }}>Model: Papa-Analytics-v4</span>
      </div>

      <div className="pd-set-grid pd-set-grid--halves">
        <div className="pd-set-card">
          <div className="pd-set-card__head"><h3>Ton i Proaktywność Odpowiedzi</h3></div>
          <div className="pd-set-field">
            <label>Styl Komunikacji Rekomendacji</label>
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
            <div className="pd-set-panel-note__title"><span>🔒</span><span>AI Security Guardrail:</span></div>
            <p>Secrets TOTP, podgląd haseł, tokeny API oraz klucze sesji są technicznie wykluczone z kontekstu promptów Papa AI.</p>
          </div>
          <button className="pd-set-button pd-set-button--ai pd-set-button--block" onClick={onSave} type="button">
            Zapisz Ustawienia Zachowania AI
          </button>
        </div>

        <div className="pd-set-card">
          <div className="pd-set-card__head">
            <div>
              <h3>Słownik Pamięci Workspace (Context Memory)</h3>
              <p>Własne definicje biznesowe dla modeli AI</p>
            </div>
            <button className="pd-set-button pd-set-button--dark" type="button">Dodaj Pojęcie</button>
          </div>
          <div className="pd-set-view" style={{ gap: 8 }}>
            {settingsAiMemory.map((entry) => (
              <div className={`pd-set-memory-item pd-set-memory-item--${entry.kind}`} key={entry.term}>
                <div>
                  <div className="pd-set-memory-item__head">
                    <span className="pd-set-memory-item__term">{entry.term}</span>
                    <span className="pd-set-memory-item__kind">{entry.kind === 'custom' ? 'Workspace Custom' : 'Definicja Systemowa'}</span>
                  </div>
                  <p className="pd-set-memory-item__definition">{entry.definition}</p>
                </div>
                <span className="pd-set-memory-item__author">Autor: {entry.author}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function SettingsWorkspaceNotifications({
  onSave = noop,
  onTestDelivery = noop,
}: {
  readonly onSave?: () => void;
  readonly onTestDelivery?: () => void;
}) {
  return (
    <>
      <div className="pd-set-intro">
        <div>
          <div className="pd-set-intro__heading">
            <h2>Powiadomienia i Harmonogramy Raportów</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--domain">Model ReportSchedule</span>
          </div>
          <p className="pd-set-intro__body">
            Zarządzanie kanałami dostarczania alertów oraz automatyczną wysyłką cyklicznych raportów PDF. Model{' '}
            <code>ReportSchedule</code> zastąpił wcześniejsze wyliczanie harmonogramów z indeksu w podglądzie.
          </p>
        </div>
        <button className="pd-set-button pd-set-button--primary" onClick={onTestDelivery} type="button">
          <span>✉️</span> Wykonaj Prawdziwy Test Wysyłki Email
        </button>
      </div>

      <div className="pd-set-grid pd-set-grid--halves">
        <div className="pd-set-card">
          <div className="pd-set-card__head"><h3>Harmonogramy Raportów (ReportSchedule)</h3></div>
          <div className="pd-set-info-block">
            <div className="pd-set-info-block__row" style={{ justifyContent: 'space-between', width: '100%' }}>
              <strong style={{ color: 'rgb(var(--pd-set-slate-900))' }}>Weekly Executive Brief</strong>
              <span className="pd-set-pill pd-set-pill--emerald">AKTYWNY</span>
            </div>
            <div className="pd-set-status-grid">
              <div>Kadencja: <strong>Poniedziałek 08:00</strong></div>
              <div>Format: <strong>PDF + Email Summary</strong></div>
              <div>Strefa: <strong>Europe/Warsaw</strong></div>
              <div>Odbiorcy: <strong>Właściciele &amp; Admini</strong></div>
            </div>
          </div>
        </div>

        <div className="pd-set-card">
          <div className="pd-set-card__head"><h3>Godziny Ciszy (Quiet Hours)</h3></div>
          <div className="pd-set-field-row">
            <div className="pd-set-field">
              <label htmlFor="set-quiet-start">Początek Ciszy</label>
              <input className="pd-set-input" defaultValue="22:00" id="set-quiet-start" type="time" />
            </div>
            <div className="pd-set-field">
              <label htmlFor="set-quiet-end">Koniec Ciszy</label>
              <input className="pd-set-input" defaultValue="07:00" id="set-quiet-end" type="time" />
            </div>
          </div>
          <label className="pd-set-toggle-row">
            <input defaultChecked type="checkbox" />
            <span>Krytyczne alerty bezpieczeństwa mogą omijać godziny ciszy</span>
          </label>
          <button className="pd-set-button pd-set-button--dark pd-set-button--block" onClick={onSave} type="button">
            Zapisz Reguły Dostarczania
          </button>
        </div>
      </div>
    </>
  );
}

export function SettingsWorkspaceCompliance({
  onDownload = noop,
}: {
  readonly onDownload?: (title: string) => void;
}) {
  return (
    <>
      <div className="pd-set-intro">
        <div>
          <div className="pd-set-intro__heading">
            <h2>Prywatność i Zgodność (Customer Legal Center)</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--domain">B2B Customer Governance</span>
          </div>
          <p className="pd-set-intro__body">
            Dokumenty prawne, powierzenie przetwarzania danych (DPA), oficjalna lista podprocesorów oraz historia zgód —
            bez wewnętrznej checklisty gotowości produkcyjnej, która nie należy do widoku klienta.
          </p>
        </div>
        <span className="pd-set-scope-badge pd-set-scope-badge--success">Status: RODO / GDPR Compliant</span>
      </div>

      <div className="pd-set-grid pd-set-grid--halves">
        <div className="pd-set-card">
          <div className="pd-set-card__head"><h3>Obowiązujące Dokumenty Prawne</h3></div>
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
          <div className="pd-set-card__head"><h3>Lista Podprocesorów Danych</h3></div>
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
    </>
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
    <>
      <div className="pd-set-intro pd-set-intro--audit">
        <div>
          <div className="pd-set-intro__heading">
            <h2>Raport Audytu Architektury Ustawień (P0 Fixes)</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--rule">Zasada: Zero Fake Persistence</span>
          </div>
          <p className="pd-set-intro__body">
            Poniższe zestawienie podsumowuje 8 priorytetowych poprawek architektonicznych P0 wyznaczonych w celu usunięcia
            fejkowej persistencji na frontendzie i doprowadzenia do pełnej spójności z canonical backend API.
          </p>
        </div>
      </div>

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
    </>
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
}: {
  readonly onClose?: () => void;
  readonly onNavigate?: (tab: SettingsTabId) => void;
}) {
  const [query, setQuery] = useState('');
  const matches = query.trim()
    ? settingsSearchIndex.filter((entry) =>
      entry.key.toLowerCase().includes(query.toLowerCase()) || entry.desc.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="pd-set-modal-backdrop pd-set-modal-backdrop--search" onClick={onClose}>
      <div className="pd-set-search-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-label="Szukaj ustawień" aria-modal="true">
        <div className="pd-set-search-modal__bar">
          <span>🔍</span>
          <input
            autoFocus
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj ustawienia (np. 2FA, waluta, zaproszenie, ROAS, quiet hours)..."
            value={query}
          />
          <kbd onClick={onClose}>ESC</kbd>
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
      </div>
    </div>
  );
}

function SettingsTotpWizardModal({
  onClose = noop,
  onVerified = noop,
}: {
  readonly onClose?: () => void;
  readonly onVerified?: () => void;
}) {
  const [code, setCode] = useState('');

  function handleVerify() {
    if (code.length !== 6) return;
    onVerified();
  }

  return (
    <div className="pd-set-modal-backdrop" onClick={onClose}>
      <div className="pd-set-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-label="Konfiguracja TOTP 2FA" aria-modal="true">
        <div className="pd-set-modal__head">
          <div>
            <h3>Konfiguracja TOTP 2FA (Real API Flow)</h3>
            <p>Endpoint: <code>/auth/2fa/totp/setup</code></p>
          </div>
          <button aria-label="Zamknij" className="pd-set-modal__close" onClick={onClose} type="button">✕</button>
        </div>

        <div className="pd-set-panel-note pd-set-panel-note--indigo" style={{ background: 'rgb(var(--pd-set-indigo-50))', border: '1px solid rgb(var(--pd-set-indigo-200))', color: 'rgb(var(--pd-set-indigo-950))' }}>
          <div className="pd-set-panel-note__title">Step 1: Zeskanuj Kod QR w Aplikacji Authenticator</div>
          <p>Użyj Google Authenticator, Microsoft Authenticator lub 1Password.</p>
        </div>

        <div className="pd-set-qr-block">
          <div className="pd-set-qr-tile">SECRET: JBSWY3DPEHPK3PXP</div>
          <span className="pd-set-qr-secret">Secret Key: JBSWY3DPEHPK3PXP</span>
        </div>

        <div className="pd-set-field">
          <label htmlFor="set-totp-code">Step 2: Wpisz 6-cyfrowy kod z aplikacji</label>
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
          <button className="pd-set-button pd-set-button--primary" onClick={handleVerify} type="button">Potwierdź i Włącz 2FA</button>
        </div>
      </div>
    </div>
  );
}

function SettingsInviteModal({
  onClose = noop,
  onSent = noop,
}: {
  readonly onClose?: () => void;
  readonly onSent?: (email: string, role: keyof SettingsRoleScopeMap) => void;
}) {
  const [role, setRole] = useState<keyof SettingsRoleScopeMap>('ANALYST');
  const [email, setEmail] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email) return;
    onSent(email, role);
  }

  return (
    <div className="pd-set-modal-backdrop" onClick={onClose}>
      <div className="pd-set-modal pd-set-modal--wide" onClick={(event) => event.stopPropagation()} role="dialog" aria-label="Zaproś członka zespołu" aria-modal="true">
        <div className="pd-set-modal__head">
          <div>
            <h3>Zaproś Członka Zespołu</h3>
            <p>Przypisanie roli systemowej oraz bezpośrednich uprawnień</p>
          </div>
          <button aria-label="Zamknij" className="pd-set-modal__close" onClick={onClose} type="button">✕</button>
        </div>

        <form className="pd-set-view" onSubmit={handleSubmit} style={{ gap: 14 }}>
          <div className="pd-set-field">
            <label htmlFor="set-invite-email">Adres Email Użytkownika</label>
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

          <div className="pd-set-field">
            <label htmlFor="set-invite-role">Rola Systemowa (Backend Source of Truth)</label>
            <select
              className="pd-set-select"
              id="set-invite-role"
              onChange={(event) => setRole(event.target.value as keyof SettingsRoleScopeMap)}
              style={{ fontFamily: 'var(--pd-font-mono)' }}
              value={role}
            >
              {(Object.keys(settingsRoleScopes) as Array<keyof SettingsRoleScopeMap>).map((roleKey) => (
                <option key={roleKey} value={roleKey}>{roleKey} — {settingsRoleDescriptions[roleKey]}</option>
              ))}
            </select>
          </div>

          <div className="pd-set-scope-preview">
            <div className="pd-set-scope-preview__title">Podsumowanie przyznawanych uprawnień (Capabilities):</div>
            <div className="pd-set-scope-chips">
              {settingsRoleScopes[role].map((scope) => (
                <span className="pd-set-scope-chip" key={scope}>{scope}</span>
              ))}
            </div>
          </div>

          <div className="pd-set-modal__actions">
            <button className="pd-set-button pd-set-button--muted" onClick={onClose} type="button">Anuluj</button>
            <button className="pd-set-button pd-set-button--primary" type="submit">Wyślij Zaproszenie Email</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SettingsTargetModal({
  onClose = noop,
  onSave = noop,
}: {
  readonly onClose?: () => void;
  readonly onSave?: (target: SettingsTarget) => void;
}) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [threshold, setThreshold] = useState('90');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const numericValue = Number.parseFloat(value);
    if (!name || Number.isNaN(numericValue)) return;
    onSave({
      id: `tgt_${Date.now()}`,
      name,
      metricKey: 'custom_kpi',
      value: numericValue,
      actual: 0,
      currency: 'PLN',
      threshold: Number.parseFloat(threshold) || 90,
      cadence: 'MONTHLY',
    });
  }

  return (
    <div className="pd-set-modal-backdrop" onClick={onClose}>
      <div className="pd-set-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-label="Edycja celu biznesowego" aria-modal="true">
        <div className="pd-set-modal__head">
          <div>
            <h3>Edycja Celu Biznesowego (/targets)</h3>
            <p>Zapis bezpośrednio do bazy backendowej</p>
          </div>
          <button aria-label="Zamknij" className="pd-set-modal__close" onClick={onClose} type="button">✕</button>
        </div>

        <form className="pd-set-view" onSubmit={handleSubmit} style={{ gap: 12 }}>
          <div className="pd-set-field">
            <label htmlFor="set-target-name">Nazwa Celu</label>
            <input className="pd-set-input" id="set-target-name" onChange={(event) => setName(event.target.value)} required value={name} />
          </div>
          <div className="pd-set-field-row">
            <div className="pd-set-field">
              <label htmlFor="set-target-value">Wartość Docelowa</label>
              <input className="pd-set-input" id="set-target-value" onChange={(event) => setValue(event.target.value)} required step="0.01" type="number" value={value} />
            </div>
            <div className="pd-set-field">
              <label htmlFor="set-target-threshold">Próg Alertu (%)</label>
              <input className="pd-set-input" id="set-target-threshold" onChange={(event) => setThreshold(event.target.value)} required type="number" value={threshold} />
            </div>
          </div>

          <div className="pd-set-modal__actions">
            <button className="pd-set-button pd-set-button--muted" onClick={onClose} type="button">Anuluj</button>
            <button className="pd-set-button pd-set-button--primary" type="submit">Zapisz Cel w Backendzie</button>
          </div>
        </form>
      </div>
    </div>
  );
}
