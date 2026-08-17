import type {
  ReactElement,
} from 'react';

import type {
  PapaDataRuntimeLocale,
  PapaDataRuntimeTheme,
} from '../../design-system/foundations/runtime';
import type {
  ShellNavigate,
  ShellUser,
} from '../app-shell/shellTypes';
import {
  AnchoredShellOverlay,
} from '../overlays';
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
}: AccountPanelProps) {
  const copy = accountCopy(locale);

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
          <div>
            <strong>{user.displayName}</strong>
            <span>{user.email}</span>
            <small>{user.role}</small>
          </div>
        </header>

        <AccountGroup label={copy.account}>
          <AccountAction
            label={copy.security}
            onClick={() => navigateTo('/app/settings/bezpieczenstwo-konta')}
          />
          <AccountAction
            label={copy.sessions}
            onClick={() => navigateTo('/app/settings/sesje')}
          />
        </AccountGroup>

        <AccountGroup label={copy.preferences}>
          <div className="pd-shell-account-panel__preference">
            <span>{copy.language}</span>
            <div
              aria-label={copy.language}
              className="pd-shell-account-panel__segmented"
              role="group"
            >
              <button
                aria-pressed={locale === 'pl'}
                onClick={() => onLocaleChange('pl')}
                type="button"
              >
                PL
              </button>
              <button
                aria-pressed={locale === 'en'}
                onClick={() => onLocaleChange('en')}
                type="button"
              >
                EN
              </button>
            </div>
          </div>
          <div className="pd-shell-account-panel__preference">
            <span>{copy.theme}</span>
            <div
              aria-label={copy.theme}
              className="pd-shell-account-panel__segmented"
              role="group"
            >
              <button
                aria-pressed={theme === 'light'}
                onClick={() => onThemeChange('light')}
                type="button"
              >
                {copy.light}
              </button>
              <button
                aria-pressed={theme === 'dark'}
                onClick={() => onThemeChange('dark')}
                type="button"
              >
                {copy.dark}
              </button>
            </div>
          </div>
        </AccountGroup>

        <AccountGroup label={copy.activity}>
          <AccountAction
            badge={operationCount > 0 ? String(operationCount) : null}
            label={copy.operations}
            onClick={openOperations}
          />
        </AccountGroup>

        <AccountGroup label={copy.help}>
          <AccountAction
            label={copy.helpCenter}
            onClick={() => navigateTo('/app/help/strona-glowna-pomocy')}
          />
        </AccountGroup>

        <footer className="pd-shell-account-panel__footer">
          <button
            className="pd-shell-account-panel__logout"
            disabled={loggingOut}
            onClick={() => {
              onOpenChange(false);
              onLogout();
            }}
            type="button"
          >
            {loggingOut ? copy.loggingOut : copy.logout}
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
      <h3>{label}</h3>
      <div className="pd-shell-account-panel__group-content">
        {children}
      </div>
    </section>
  );
}

function AccountAction({
  badge = null,
  label,
  onClick,
}: {
  readonly badge?: string | null;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className="pd-shell-account-panel__action"
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      <span className="pd-shell-account-panel__action-end">
        {badge ? (
          <span className="pd-shell-account-panel__badge">
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

function accountCopy(locale: AccountPanelLocale) {
  return locale === 'en'
    ? {
        account: 'Account',
        activity: 'Activity',
        dark: 'Dark',
        description: 'Account, personal preferences, activity and help.',
        help: 'Help',
        helpCenter: 'Help Center',
        language: 'Language',
        light: 'Light',
        loggingOut: 'Signing out…',
        logout: 'Sign out',
        operations: 'Background operations',
        preferences: 'Preferences',
        security: 'Account & security',
        sessions: 'Sessions & devices',
        theme: 'Theme',
        title: 'Account',
      }
    : {
        account: 'Konto',
        activity: 'Aktywność',
        dark: 'Ciemny',
        description: 'Konto, preferencje osobiste, aktywność i pomoc.',
        help: 'Pomoc',
        helpCenter: 'Centrum Pomocy',
        language: 'Język',
        light: 'Jasny',
        loggingOut: 'Wylogowanie…',
        logout: 'Wyloguj',
        operations: 'Operacje w tle',
        preferences: 'Preferencje',
        security: 'Konto i bezpieczeństwo',
        sessions: 'Sesje i urządzenia',
        theme: 'Motyw',
        title: 'Konto',
      };
}
