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

import type {
  SettingsRoleScopeMap,
  SettingsTabId,
  SettingsTarget,
} from '../../fixtures/settings-governance/settingsGovernanceDemoSeed';
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
} from '../../fixtures/settings-governance/settingsGovernanceDemoSeed';

import './SettingsGovernanceScreen.css';

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

export function SettingsGovernanceScreen() {
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

  function handleCompanySave() {
    setRevision((value) => value + 1);
    announce('Ustawienia Workspace zapisane.', 'success');
  }

  function handleCreateTarget(target: SettingsTarget) {
    setTargets((current) => [...current, target]);
    setTargetModalOpen(false);
    announce('Dodano nowy cel biznesowy.', 'success');
  }

  return (
    <div className="pd-set">
      <main className="pd-set-content">
        <div className="pd-set-view">
          <header className="pd-set-page-header">
            <div>
              <span className="pd-set-page-header__eyebrow">Casa di Orfeo Sp. z o.o.</span>
              <h1>Ustawienia</h1>
              <p>Zarządzaj swoim kontem oraz konfiguracją workspace.</p>
            </div>
            <button className="pd-set-search-trigger" onClick={() => setSearchOpen(true)} type="button">
              <span aria-hidden="true">⌕</span>
              <span>Szukaj ustawień</span>
              <kbd>Ctrl K</kbd>
            </button>
          </header>
          <SettingsNav activeTab={activeTab} onSelect={setActiveTab} />
          {activeTab === 'account-profile' && (
            <SettingsAccountProfile
              onOpenSecurity={() => setActiveTab('account-security')}
              onSave={() => announce('Zapisano preferencje profilu.', 'success')}
            />
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
              onSave={() => announce('Zapisano ustawienia powiadomień.', 'success')}
              onTestDelivery={() => announce('Wysłano wiadomość testową na anna@casadiorfeo.pl.', 'info')}
            />
          )}
          {activeTab === 'ws-compliance' && (
            <SettingsWorkspaceCompliance onDownload={(title) => announce(`Pobieranie dokumentu: ${title}`, 'info')} />
          )}
        </div>
      </main>

      {toast && <SettingsToast message={toast.message} tone={toast.tone} />}

      {searchOpen && <SettingsSearchModal onClose={() => setSearchOpen(false)} onNavigate={setActiveTab} />}
      {totpOpen && (
        <SettingsTotpWizardModal
          onClose={() => setTotpOpen(false)}
          onVerified={() => {
            setTotpOpen(false);
            announce('Weryfikacja dwuetapowa została aktywowana.', 'success');
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

function SettingsNav({
  activeTab,
  onSelect = noop,
}: {
  readonly activeTab: SettingsTabId;
  readonly onSelect?: (tab: SettingsTabId) => void;
}) {
  function selectAndScrollToTop(tab: SettingsTabId) {
    onSelect(tab);
    document.querySelector('.pd-set-content')?.scrollTo({ behavior: 'smooth', top: 0 });
  }

  return (
    <nav aria-label="Sekcje ustawień" className="pd-set-nav">
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
    </nav>
  );
}

export function SettingsAccountProfile({
  onOpenSecurity = noop,
  onSave = noop,
}: {
  readonly onOpenSecurity?: () => void;
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
            <span className="pd-set-scope-badge pd-set-scope-badge--personal">Ustawienia osobiste</span>
          </div>
          <p className="pd-set-intro__body">
            Zaktualizuj dane profilu i sposób prezentacji informacji w PapaData.
          </p>
        </div>
      </div>

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
              <div className="pd-set-field">
                  <label htmlFor="set-prof-lang">Język interfejsu</label>
                <select className="pd-set-select" defaultValue="pl-PL" id="set-prof-lang">
                    <option value="pl-PL">Polski</option>
                    <option value="en-US">English</option>
                    <option value="de-DE">Deutsch</option>
                </select>
              </div>
              <div className="pd-set-field">
                  <label htmlFor="set-prof-format">Format liczb i dat</label>
                <select className="pd-set-select" defaultValue="PL" id="set-prof-format">
                  <option value="PL">1 234,56 PLN / DD.MM.YYYY</option>
                  <option value="US">$1,234.56 / MM/DD/YYYY</option>
                  <option value="ISO">1 234,56 / YYYY-MM-DD</option>
                </select>
              </div>
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
            <button className="pd-set-linklike pd-set-linklike--indigo" type="button">Zmień adres e-mail</button>
          </div>
        </aside>
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
            <h2>Bezpieczeństwo i dostęp</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--personal">Ustawienia osobiste</span>
          </div>
          <p className="pd-set-intro__body">
            Chroń konto dodatkowym kodem, kluczem dostępu i kontroluj urządzenia, na których jesteś zalogowany.
          </p>
        </div>
        <span className="pd-set-scope-badge pd-set-scope-badge--success"><span aria-hidden="true">✓</span> Weryfikacja dwuetapowa aktywna</span>
      </div>

      <div className="pd-set-grid pd-set-grid--halves">
        <div className="pd-set-card">
          <div className="pd-set-card__head">
            <div>
              <h3>Weryfikacja dwuetapowa</h3>
              <p>Dodatkowy kod z aplikacji podczas logowania</p>
            </div>
            <span className="pd-set-pill pd-set-pill--emerald">AKTYWNE</span>
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
              Skonfiguruj ponownie
            </button>
            <button className="pd-set-linklike" type="button">Wyłącz weryfikację dwuetapową</button>
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
  revision = 124,
}: {
  readonly onSave?: () => void;
  readonly revision?: number;
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave();
  }

  return (
    <>
      <div className="pd-set-intro" data-revision={revision}>
        <div>
          <div className="pd-set-intro__heading">
            <h2>Firma i workspace</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--workspace">Dotyczy całego workspace</span>
          </div>
          <p className="pd-set-intro__body">
            Konfiguracja tożsamości prawnej organizacji, strefy czasowej oraz waluty raportowania. Zmiany w tej sekcji wpływają na
            agregacje danych, granice dni w raportach oraz reguły alertów w całej organizacji.
          </p>
        </div>
        <span className="pd-set-scope-badge pd-set-scope-badge--success"><span aria-hidden="true">✓</span> Dane firmy zweryfikowane</span>
      </div>

      <div className="pd-set-grid">
        <div className="pd-set-card pd-set-grid--span2">
          <div className="pd-set-card__head">
            <h3>Dane organizacji</h3>
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
                <input className="pd-set-input" defaultValue="7312049912" disabled id="set-comp-nip" type="text" />
              </div>
              <div className="pd-set-field">
                <label htmlFor="set-comp-regon">REGON</label>
                <input className="pd-set-input" defaultValue="381902441" disabled id="set-comp-regon" type="text" />
              </div>
              <div className="pd-set-field">
                <label htmlFor="set-comp-industry">Branża</label>
                <select className="pd-set-select" defaultValue="ecommerce_fashion" id="set-comp-industry">
                  <option value="ecommerce_fashion">E-commerce (Odzież &amp; Obuwie)</option>
                  <option value="ecommerce_electronics">E-commerce (Elektronika)</option>
                  <option value="saas">SaaS / Subskrypcje</option>
                </select>
              </div>
            </div>

            <div className="pd-set-panel-note pd-set-panel-note--slate">
              <div className="pd-set-panel-note__title" style={{ color: 'rgb(var(--pd-set-slate-900))', justifyContent: 'space-between' }}>
                <span>Raportowanie</span>
              </div>
              <div className="pd-set-field-row">
                <div className="pd-set-field">
                  <label htmlFor="set-comp-currency">Waluta raportowania</label>
                  <select className="pd-set-select" defaultValue="PLN" id="set-comp-currency">
                    <option value="PLN">PLN — Polski Złoty</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="USD">USD — US Dollar</option>
                  </select>
                </div>
                <div className="pd-set-field">
                  <label htmlFor="set-comp-tz">Strefa czasowa</label>
                  <select className="pd-set-select" defaultValue="Europe/Warsaw" id="set-comp-tz">
                    <option value="Europe/Warsaw">Europe/Warsaw (UTC+02:00)</option>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">America/New_York (UTC-04:00)</option>
                  </select>
                </div>
              </div>
              <p style={{ borderTop: '1px solid rgb(var(--pd-set-slate-200))', paddingTop: 8 }}>
                <strong>Wpływ zmiany:</strong> waluta przelicza wartości w raportach, a strefa czasowa zmienia granice dni w analizach.
              </p>
            </div>

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
                <span className="pd-set-logo-meta__name">Logo Casa di Orfeo</span>
                <span className="pd-set-logo-meta__dims">512 × 512 px • WEBP</span>
                <button className="pd-set-button pd-set-button--muted" style={{ justifySelf: 'start', marginTop: 4 }} type="button">
                  Zmień logo
                </button>
              </div>
            </div>
          </div>

          <div className="pd-set-danger-zone">
            <div className="pd-set-danger-zone__title"><span aria-hidden="true">⚠</span><span>Operacje zaawansowane</span></div>
            <p className="pd-set-danger-zone__body">
              Eksport lub usunięcie danych wymaga potwierdzenia przez właściciela workspace.
            </p>
            <button className="pd-set-danger-row pd-set-danger-row--outline" type="button">
              <span>Eksportuj wszystkie dane</span><span aria-hidden="true">↓</span>
            </button>
            <button className="pd-set-danger-row pd-set-danger-row--solid" type="button">
              <span>Usuń workspace</span><span aria-hidden="true">→</span>
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
            <h2>Zespół i uprawnienia</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--workspace">Dotyczy całego workspace</span>
          </div>
          <p className="pd-set-intro__body">
            Zapraszaj osoby do zespołu i przypisuj im role odpowiednie do zakresu pracy.
          </p>
        </div>
        <button className="pd-set-button pd-set-button--primary" onClick={onOpenInvite} type="button">
          Zaproś osobę
        </button>
      </div>

      <div className="pd-set-card">
        <div className="pd-set-card__head">
          <h3>Członkowie zespołu ({settingsTeamMembers.length})</h3>
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
              {settingsTeamMembers.map((member) => (
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
          <h3>Oczekujące zaproszenia ({settingsInvitations.length})</h3>
          <span className="pd-set-pill pd-set-pill--amber">Wygasają po 7 dniach</span>
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
            <h2>Analityka i cele biznesowe</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--workspace">Dotyczy całego workspace</span>
          </div>
          <p className="pd-set-intro__body">
            Ustal cele, progi alertów i sposób przypisywania konwersji do kanałów marketingowych.
          </p>
        </div>
        <button className="pd-set-button pd-set-button--primary" onClick={onOpenCreateTarget} type="button">
          Dodaj cel
        </button>
      </div>

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
          <div className="pd-set-field">
            <label htmlFor="set-attr-model">Model atrybucji</label>
            <select className="pd-set-select" defaultValue="data-driven" id="set-attr-model">
              <option value="data-driven">Data-Driven (Algorytmiczny Papa AI)</option>
              <option value="last-touch">Last Interaction (Ostatnie kliknięcie)</option>
              <option value="first-touch">First Interaction (Pierwszy kontakt)</option>
            </select>
          </div>
          <div className="pd-set-field">
            <label htmlFor="set-attr-window">Okno atrybucji</label>
            <select className="pd-set-select" defaultValue="30" id="set-attr-window">
              <option value="30">30 Dni (Domyślne E-commerce)</option>
              <option value="14">14 Dni (Krótki cykl)</option>
              <option value="90">90 Dni (Długi cykl SaaS/B2B)</option>
            </select>
          </div>
          <div className="pd-set-panel-note pd-set-panel-note--slate">
            <p>⚠️ Zmiana metodyki atrybucji wymaga ponownej kalkulacji agregatów przychodu w tle.</p>
          </div>
          <button className="pd-set-button pd-set-button--dark pd-set-button--block" type="button">Zapisz atrybucję</button>
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
                    <td className="pd-set-cell-right"><button className="pd-set-linklike pd-set-linklike--indigo" type="button">Edytuj</button></td>
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
            <h2>Papa Asystent</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--workspace">Dotyczy całego workspace</span>
          </div>
          <p className="pd-set-intro__body">
            Dostosuj styl odpowiedzi, proaktywne alerty i definicje biznesowe używane przez Asystenta.
          </p>
        </div>
      </div>

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
            <button className="pd-set-button pd-set-button--dark" type="button">Dodaj pojęcie</button>
          </div>
          <div className="pd-set-view" style={{ gap: 8 }}>
            {settingsAiMemory.map((entry) => (
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
            <h2>Powiadomienia i raporty</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--workspace">Dotyczy całego workspace</span>
          </div>
          <p className="pd-set-intro__body">
            Ustal, kiedy zespół otrzymuje alerty i cykliczne podsumowania.
          </p>
        </div>
        <button className="pd-set-button pd-set-button--primary" onClick={onTestDelivery} type="button">
          Wyślij wiadomość testową
        </button>
      </div>

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
            <h2>Prywatność i zgodność</h2>
            <span className="pd-set-scope-badge pd-set-scope-badge--workspace">Dokumenty workspace</span>
          </div>
          <p className="pd-set-intro__body">
            Sprawdź dokumenty prawne, umowę powierzenia danych oraz listę podmiotów przetwarzających dane.
          </p>
        </div>
        <span className="pd-set-scope-badge pd-set-scope-badge--success"><span aria-hidden="true">✓</span> Zgodność z RODO</span>
      </div>

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
      <div className="pd-set-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-label="Konfiguracja weryfikacji dwuetapowej" aria-modal="true">
        <div className="pd-set-modal__head">
          <div>
            <h3>Skonfiguruj weryfikację dwuetapową</h3>
            <p>Potrzebujesz aplikacji uwierzytelniającej.</p>
          </div>
          <button aria-label="Zamknij" className="pd-set-modal__close" onClick={onClose} type="button">✕</button>
        </div>

        <div className="pd-set-panel-note pd-set-panel-note--indigo" style={{ background: 'rgb(var(--pd-set-indigo-50))', border: '1px solid rgb(var(--pd-set-indigo-200))', color: 'rgb(var(--pd-set-indigo-950))' }}>
          <div className="pd-set-panel-note__title">1. Zeskanuj kod QR</div>
          <p>Użyj Google Authenticator, Microsoft Authenticator lub 1Password.</p>
        </div>

        <div className="pd-set-qr-block">
          <div className="pd-set-qr-tile" aria-label="Kod QR do konfiguracji aplikacji">Kod QR</div>
          <button className="pd-set-linklike pd-set-linklike--indigo" type="button">Nie możesz zeskanować kodu?</button>
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
            <h3>Zaproś osobę do zespołu</h3>
            <p>Wybierz rolę odpowiednią do zakresu jej pracy.</p>
          </div>
          <button aria-label="Zamknij" className="pd-set-modal__close" onClick={onClose} type="button">✕</button>
        </div>

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

          <div className="pd-set-field">
            <label htmlFor="set-invite-role">Rola</label>
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
            <div className="pd-set-scope-preview__title">Uprawnienia przypisane do tej roli</div>
            <div className="pd-set-scope-chips">
              {settingsRoleScopes[role].map((scope) => (
                <span className="pd-set-scope-chip" key={scope}>{scope}</span>
              ))}
            </div>
          </div>

          <div className="pd-set-modal__actions">
            <button className="pd-set-button pd-set-button--muted" onClick={onClose} type="button">Anuluj</button>
            <button className="pd-set-button pd-set-button--primary" type="submit">Wyślij zaproszenie</button>
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
            <h3>Nowy cel biznesowy</h3>
            <p>Ustaw wartość docelową i próg alertu.</p>
          </div>
          <button aria-label="Zamknij" className="pd-set-modal__close" onClick={onClose} type="button">✕</button>
        </div>

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
            <button className="pd-set-button pd-set-button--primary" type="submit">Dodaj cel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
