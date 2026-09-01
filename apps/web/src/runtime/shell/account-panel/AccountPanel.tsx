import type {
  ReactElement,
} from 'react';

import type {
  PapaDataRuntimeLocale,
  PapaDataRuntimeTheme,
} from '../../../design-system/foundations/runtime/index';
import type {
  ShellNavigate,
  ShellUser,
  ShellWorkspace,
} from '../app-shell/shellTypes';
import {
  Icon,
  SegmentedControl,
} from '../../../design-system/index';
import type {
  PapaDataIconName,
} from '../../../design-system/index';
import {
  AnchoredShellOverlay,
} from '../overlays/index';
import './account-panel.css';

type AccountPanelLocale = PapaDataRuntimeLocale;
type AccountPanelTheme = PapaDataRuntimeTheme;

export type AccountPanelProps = {
  readonly locale: AccountPanelLocale;
  readonly loggingOut?: boolean;
  readonly onLocaleChange: (locale: AccountPanelLocale) => void;
  readonly onLogout: () => void;
  readonly onNavigate: ShellNavigate;
  readonly onOpenChange: (open: boolean) => void;
  readonly onOpenOperations: () => void;
  readonly onThemeChange: (theme: AccountPanelTheme) => void;
  readonly open: boolean;
  readonly operationCount: number;
  readonly theme: AccountPanelTheme;
  readonly trigger: ReactElement;
  readonly user: ShellUser;
  readonly workspace: ShellWorkspace | null;
};

export function AccountPanel({
  locale,
  loggingOut = false,
  onLocaleChange,
  onLogout,
  onNavigate,
  onOpenChange,
  onOpenOperations,
  onThemeChange,
  open,
  operationCount,
  theme,
  trigger,
  user,
  workspace,
}: AccountPanelProps) {
  const copy = accountCopy(locale);
  const languageOptions = [
    { label: 'PL', value: 'pl' },
    { label: 'EN', value: 'en' },
  ] as const;
  const themeOptions = [
    { icon: 'theme', label: copy.light, value: 'light' },
    { icon: 'moon', label: copy.dark, value: 'dark' },
  ] as const;
  const operationBadge = operationCount > 99
    ? '99+'
    : String(operationCount);

  function navigateTo(path: string) {
    onOpenChange(false);
    onNavigate(path);
  }

  function openOperations() {
    onOpenChange(false);
    onOpenOperations();
  }

  return (
    <AnchoredShellOverlay
      className="pd-shell-account-overlay"
      closeLabel={copy.close}
      description={copy.description}
      onOpenChange={onOpenChange}
      open={open}
      title={copy.title}
      trigger={trigger}
      width="medium"
    >
      <div className="pd-shell-account-panel">
        <header className="pd-shell-account-panel__identity">
          <span
            aria-hidden="true"
            className="pd-shell-account-panel__avatar"
          >
            {getInitials(user.displayName)}
          </span>
          <div className="pd-shell-account-panel__identity-copy">
            <strong className="pd-shell-account-panel__name">
              {user.displayName}
            </strong>
            <span className="pd-shell-account-panel__email">
              {user.email}
            </span>
            <div
              aria-label={`${copy.workspace}: ${workspace?.name ?? copy.noWorkspace}`}
              className="pd-shell-account-panel__workspace"
              role="group"
            >
              <span className="pd-shell-account-panel__workspace-name">
                {workspace?.name ?? copy.noWorkspace}
              </span>
              {workspace ? (
                <small className="pd-shell-account-panel__role">
                  {formatWorkspaceRole(workspace.role, locale)}
                </small>
              ) : null}
            </div>
          </div>
        </header>

        <AccountGroup label={copy.securityGroup}>
          <AccountAction
            description={copy.securityDescription}
            icon="security"
            label={copy.security}
            onClick={() => navigateTo('/app/settings/bezpieczenstwo-konta')}
          />
          <AccountAction
            description={copy.sessionsDescription}
            icon="security"
            label={copy.sessions}
            onClick={() => navigateTo('/app/settings/sesje')}
          />
        </AccountGroup>

        <AccountGroup label={copy.preferences}>
          <div className="pd-shell-account-panel__preference">
            <span className="pd-shell-account-panel__preference-label">
              {copy.language}
            </span>
            <SegmentedControl
              ariaLabel={copy.language}
              className="pd-shell-account-panel__segmented"
              items={languageOptions}
              onValueChange={(nextLocale) => {
                onLocaleChange(nextLocale as AccountPanelLocale);
              }}
              size="compact"
              value={locale}
            />
          </div>
          <div className="pd-shell-account-panel__preference">
            <span className="pd-shell-account-panel__preference-label">
              {copy.theme}
            </span>
            <SegmentedControl
              ariaLabel={copy.theme}
              className="pd-shell-account-panel__segmented"
              items={themeOptions}
              onValueChange={(nextTheme) => {
                onThemeChange(nextTheme as AccountPanelTheme);
              }}
              size="compact"
              value={theme}
            />
          </div>
        </AccountGroup>

        <AccountGroup label={copy.activity}>
          <AccountAction
            ariaLabel={operationCount > 0
              ? formatOperationCount(copy.operations, operationCount, locale)
              : copy.operations}
            badge={operationCount > 0 ? operationBadge : null}
            description={copy.operationsDescription}
            icon="data"
            label={copy.operations}
            onClick={openOperations}
          />
        </AccountGroup>

        <AccountGroup label={copy.help}>
          <AccountAction
            description={copy.helpCenterDescription}
            icon="help"
            label={copy.helpCenter}
            onClick={() => navigateTo('/app/help/strona-glowna-pomocy')}
          />
        </AccountGroup>

        <footer className="pd-shell-account-panel__footer">
          <button
            aria-busy={loggingOut ? true : undefined}
            className="pd-shell-account-panel__logout"
            disabled={loggingOut}
            onClick={() => {
              onOpenChange(false);
              onLogout();
            }}
            type="button"
          >
            <span>{loggingOut ? copy.loggingOut : copy.logout}</span>
          </button>
        </footer>
      </div>
    </AnchoredShellOverlay>
  );
}

function AccountGroup({
  children,
  label,
}: {
  readonly children: ReactElement | readonly ReactElement[];
  readonly label: string;
}) {
  return (
    <section className="pd-shell-account-panel__group">
      <h3 className="pd-shell-account-panel__group-title">{label}</h3>
      <div className="pd-shell-account-panel__group-content">
        {children}
      </div>
    </section>
  );
}

function AccountAction({
  ariaLabel,
  badge = null,
  description,
  icon,
  label,
  onClick,
}: {
  readonly ariaLabel?: string;
  readonly badge?: string | null;
  readonly description: string;
  readonly icon: PapaDataIconName;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="pd-shell-account-panel__action"
      data-has-badge={badge ? true : undefined}
      onClick={onClick}
      type="button"
    >
      <span aria-hidden="true" className="pd-shell-account-panel__action-icon">
        <Icon decorative name={icon} size={16} />
      </span>
      <span className="pd-shell-account-panel__action-copy">
        <span className="pd-shell-account-panel__action-label">{label}</span>
        <small className="pd-shell-account-panel__action-description">
          {description}
        </small>
      </span>
      <span className="pd-shell-account-panel__action-end">
        {badge ? (
          <span
            aria-hidden={ariaLabel ? true : undefined}
            className="pd-shell-account-panel__badge"
          >
            {badge}
          </span>
        ) : null}
        <span aria-hidden="true">›</span>
      </span>
    </button>
  );
}

function getInitials(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatWorkspaceRole(
  role: string,
  locale: AccountPanelLocale,
) {
  const normalizedRole = role.trim().toLowerCase();
  const labels = locale === 'en'
    ? {
        admin: 'Admin',
        analyst: 'Analyst',
        member: 'Member',
        owner: 'Owner',
        support: 'Support',
        viewer: 'Viewer',
      }
    : {
        admin: 'Administrator',
        analyst: 'Analityk',
        member: 'Użytkownik',
        owner: 'Właściciel',
        support: 'Wsparcie',
        viewer: 'Odbiorca',
      };

  if (normalizedRole.includes('owner')) return labels.owner;
  if (normalizedRole.includes('admin')) return labels.admin;
  if (normalizedRole.includes('analyst')) return labels.analyst;
  if (normalizedRole.includes('viewer')) return labels.viewer;
  if (normalizedRole.includes('support')) return labels.support;
  if (normalizedRole.includes('member')) return labels.member;
  return role;
}

function formatOperationCount(
  label: string,
  count: number,
  locale: AccountPanelLocale,
) {
  if (locale === 'en') {
    return `${label}, ${count} active ${count === 1 ? 'operation' : 'operations'}`;
  }

  const absoluteCount = Math.abs(count);
  const lastDigit = absoluteCount % 10;
  const lastTwoDigits = absoluteCount % 100;
  const noun = count === 1
    ? 'aktywna operacja'
    : lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)
      ? 'aktywne operacje'
      : 'aktywnych operacji';

  return `${label}, ${count} ${noun}`;
}

function accountCopy(locale: AccountPanelLocale) {
  return locale === 'en'
    ? {
        activity: 'Activity',
        close: 'Close',
        dark: 'Dark',
        description: 'Account, personal preferences, activity and help.',
        help: 'Help',
        helpCenter: 'Help Center',
        helpCenterDescription: 'Guides, procedures and support contact',
        language: 'Interface language',
        light: 'Light',
        loggingOut: 'Signing out…',
        logout: 'Sign out',
        noWorkspace: 'No active workspace',
        operations: 'Background operations',
        operationsDescription: 'Synchronizations, exports and queued jobs',
        preferences: 'Preferences',
        security: 'Account & security',
        securityDescription: 'Password, MFA and sign-in methods',
        securityGroup: 'Security',
        sessions: 'Sessions & devices',
        sessionsDescription: 'Active sign-ins and trusted devices',
        theme: 'Interface theme',
        title: 'Account',
        workspace: 'Workspace',
      }
    : {
        activity: 'Aktywność',
        close: 'Zamknij',
        dark: 'Ciemny',
        description: 'Konto, preferencje osobiste, aktywność i pomoc.',
        help: 'Pomoc',
        helpCenter: 'Centrum Pomocy',
        helpCenterDescription: 'Poradniki, procedury i kontakt ze wsparciem',
        language: 'Język interfejsu',
        light: 'Jasny',
        loggingOut: 'Wylogowanie…',
        logout: 'Wyloguj',
        noWorkspace: 'Brak aktywnego workspace',
        operations: 'Operacje w tle',
        operationsDescription: 'Synchronizacje, eksporty i zadania w kolejce',
        preferences: 'Preferencje',
        security: 'Konto i bezpieczeństwo',
        securityDescription: 'Hasło, MFA i metody logowania',
        securityGroup: 'Bezpieczeństwo',
        sessions: 'Sesje i urządzenia',
        sessionsDescription: 'Aktywne logowania i zaufane urządzenia',
        theme: 'Motyw interfejsu',
        title: 'Konto',
        workspace: 'Workspace',
      };
}
