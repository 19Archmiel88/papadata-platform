import {
  useState,
} from 'react';
import type {
  DateRange,
} from '../../../../../../../contracts/ui-contract-types';

import {
  Icon,
  PapaDataBrand,
} from '../../../../design-system/index';
import type {
  DateRangePickerPreset,
} from '../../../../design-system/index';
import {
  applyStoredPapaDataRuntimePreference,
  getInitialPapaDataRuntimeGlobals,
} from '../../../../design-system/foundations/runtime/index';
import type {
  PapaDataRuntimeLocale,
  PapaDataRuntimeTheme,
} from '../../../../design-system/foundations/runtime/index';
import {
  AccountPanel,
} from '../account-panel/index';
import {
  DateRangeOverlay,
} from '../date-range-overlay/index';
import type {
  ShellNavigate,
  ShellNavigationGroup,
  ShellNotification,
  ShellOverlay,
  ShellUser,
} from '../app-shell/shellTypes';
import {
  NotificationCenter,
} from '../notifications/index';
import './topbar.css';

type RuntimeLocale = PapaDataRuntimeLocale;
type RuntimeTheme = PapaDataRuntimeTheme;

type NotificationMutation = (
  notification: ShellNotification,
) => void | Promise<void>;

function readRuntimeLocale(): RuntimeLocale {
  if (typeof document === 'undefined') return 'pl';
  return document.documentElement.dataset.locale === 'en' ? 'en' : 'pl';
}

function readRuntimeTheme(): RuntimeTheme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function resolveSectionLabel(
  activePath: string,
  navigationGroups: readonly ShellNavigationGroup[],
) {
  const navigationItems = navigationGroups.flatMap((group) => group.items);
  const matches = navigationItems
    .filter((item) => (
      activePath === item.path
      || activePath.startsWith(`${item.path}/`)
    ))
    .sort((left, right) => right.path.length - left.path.length);

  return matches[0]?.label ?? navigationItems[0]?.label ?? 'PapaData';
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

function preferenceCopy(locale: RuntimeLocale) {
  return locale === 'en'
    ? {
        calendar: 'Calendar',
        calendarDescription: 'Set the global analysis date range.',
        calendarHelper: 'Quick ranges update dashboard data immediately.',
        calendarQuickOptions: 'Quick ranges',
        dateFrom: 'From',
        datePreset: 'Range',
        dateRange: 'Analysis date range',
        dateTo: 'To',
        language: 'Interface language',
        menu: 'Open navigation',
        notifications: 'Notifications',
        papaAssistant: 'Open Papa Assistant',
        profile: 'User account',
        search: 'Search',
        searchFull: 'Search or run a command',
        themeDark: 'Dark',
        themeLight: 'Light',
        themeToDark: 'Switch to dark theme',
        themeToLight: 'Switch to light theme',
      }
    : {
        calendar: 'Kalendarz',
        calendarDescription: 'Ustaw globalny zakres dat analiz.',
        calendarHelper: 'Szybkie zakresy od razu aktualizują dane dashboardu.',
        calendarQuickOptions: 'Szybkie zakresy',
        dateFrom: 'Od',
        datePreset: 'Zakres',
        dateRange: 'Zakres dat analiz',
        dateTo: 'Do',
        language: 'Język interfejsu',
        menu: 'Otwórz nawigację',
        notifications: 'Powiadomienia',
        papaAssistant: 'Otwórz Papa Asystenta',
        profile: 'Konto użytkownika',
        search: 'Szukaj',
        searchFull: 'Szukaj lub uruchom komendę',
        themeDark: 'Ciemny',
        themeLight: 'Jasny',
        themeToDark: 'Zmień motyw na ciemny',
        themeToLight: 'Zmień motyw na jasny',
      };
}

function calendarPresets(
  locale: RuntimeLocale,
): readonly DateRangePickerPreset[] {
  return locale === 'en'
    ? [
        { label: '1 day', value: 'today' },
        { label: 'Last 7 days', value: 'last7d' },
        { label: 'Last 30 days', value: 'last30d' },
        { label: 'Last 90 days', value: 'last90d' },
        { label: 'Month to date', value: 'monthToDate' },
        { label: 'Custom', value: 'custom' },
      ]
    : [
        { label: '1 dzień', value: 'today' },
        { label: 'Ostatnie 7 dni', value: 'last7d' },
        { label: 'Ostatnie 30 dni', value: 'last30d' },
        { label: 'Ostatnie 90 dni', value: 'last90d' },
        { label: 'Bieżący miesiąc', value: 'monthToDate' },
        { label: 'Niestandardowy', value: 'custom' },
      ];
}

function calendarQuickOptions(
  locale: RuntimeLocale,
): readonly DateRangePickerPreset[] {
  return locale === 'en'
    ? [
        { label: '1 day', value: 'today' },
        { label: '7 days', value: 'last7d' },
        { label: '30 days', value: 'last30d' },
        { label: '90 days', value: 'last90d' },
      ]
    : [
        { label: '1 dzień', value: 'today' },
        { label: '7 dni', value: 'last7d' },
        { label: '30 dni', value: 'last30d' },
        { label: '90 dni', value: 'last90d' },
      ];
}

function RuntimePreferenceControls({
  locale,
  onLocaleChange,
  onThemeChange,
  theme,
}: {
  readonly locale: RuntimeLocale;
  readonly onLocaleChange: (locale: RuntimeLocale) => void;
  readonly onThemeChange: (theme: RuntimeTheme) => void;
  readonly theme: RuntimeTheme;
}) {
  const copy = preferenceCopy(locale);
  const nextTheme: RuntimeTheme = theme === 'dark' ? 'light' : 'dark';
  const themeLabel = theme === 'dark' ? copy.themeDark : copy.themeLight;

  return (
    <>
      <div
        aria-label={copy.language}
        className="pd-shell-topbar__language-switch"
        role="group"
      >
        {(['pl', 'en'] as const).map((option) => (
          <button
            aria-pressed={locale === option}
            key={option}
            onClick={() => onLocaleChange(option)}
            type="button"
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>

      <button
        aria-label={nextTheme === 'dark' ? copy.themeToDark : copy.themeToLight}
        className="pd-shell-topbar__control pd-shell-topbar__theme-control"
        onClick={() => onThemeChange(nextTheme)}
        type="button"
      >
        <Icon decorative name="theme" size={20} />
        <strong>{themeLabel}</strong>
      </button>
    </>
  );
}

export function PublicTopbar({
  onNavigate,
}: {
  readonly onNavigate: ShellNavigate;
}) {
  const [locale, setLocale] = useState<RuntimeLocale>(readRuntimeLocale);
  const [theme, setTheme] = useState<RuntimeTheme>(readRuntimeTheme);

  function changeLocale(nextLocale: RuntimeLocale) {
    setLocale(nextLocale);
    applyStoredPapaDataRuntimePreference({ locale: nextLocale });
  }

  function changeTheme(nextTheme: RuntimeTheme) {
    setTheme(nextTheme);
    applyStoredPapaDataRuntimePreference({ theme: nextTheme });
  }

  return (
    <header className="pd-shell-topbar" data-variant="public">
      <button
        aria-label="PapaData — strona główna"
        className="pd-shell-topbar__brand"
        onClick={() => onNavigate('/auth')}
        type="button"
      >
        <PapaDataBrand decorative size="small" variant="lockup" />
      </button>

      <div className="pd-shell-topbar__actions">
        <RuntimePreferenceControls
          locale={locale}
          onLocaleChange={changeLocale}
          onThemeChange={changeTheme}
          theme={theme}
        />
      </div>
    </header>
  );
}

export type AuthenticatedTopbarProps = {
  readonly activeOverlay: ShellOverlay;
  readonly activePath: string;
  readonly dateRange: DateRange;
  readonly loggingOut?: boolean;
  readonly navigationGroups: readonly ShellNavigationGroup[];
  readonly notificationError?: string | null;
  readonly notificationUnreadCount: number;
  readonly notifications: readonly ShellNotification[];
  readonly onDateRangeChange: (range: DateRange) => void;
  readonly onLogout: () => void;
  readonly onMarkAllNotificationsRead?: (() => void | Promise<void>) | undefined;
  readonly onMarkNotificationRead?: NotificationMutation | undefined;
  readonly onMarkNotificationUnread?: NotificationMutation | undefined;
  readonly onNavigate: ShellNavigate;
  readonly onOpenOverlay: (overlay: ShellOverlay) => void;
  readonly onSnoozeNotification?: ((notification: ShellNotification, until: string) => void | Promise<void>) | undefined;
  readonly onUnsnoozeNotification?: NotificationMutation | undefined;
  readonly operationCount: number;
  readonly papaAssistantOpen: boolean;
  readonly user: ShellUser;
};

export function AuthenticatedTopbar({
  activeOverlay,
  activePath,
  dateRange,
  loggingOut = false,
  navigationGroups,
  notificationError = null,
  notificationUnreadCount,
  notifications,
  onDateRangeChange,
  onLogout,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  onMarkNotificationUnread,
  onNavigate,
  onOpenOverlay,
  onSnoozeNotification,
  onUnsnoozeNotification,
  operationCount,
  papaAssistantOpen,
  user,
}: AuthenticatedTopbarProps) {
  const [locale, setLocale] = useState<RuntimeLocale>(readRuntimeLocale);
  const [theme, setTheme] = useState<RuntimeTheme>(readRuntimeTheme);
  const copy = preferenceCopy(locale);
  const notificationCountLabel = notificationUnreadCount > 99
    ? '99+'
    : String(notificationUnreadCount);
  const sectionLabel = resolveSectionLabel(activePath, navigationGroups);
  const papaAvailable = navigationGroups.some((group) => (
    group.items.some((item) => item.id === 'papa' && !item.disabled)
  ));

  function changeLocale(nextLocale: RuntimeLocale) {
    setLocale(nextLocale);
    applyStoredPapaDataRuntimePreference({ locale: nextLocale });
  }

  function changeTheme(nextTheme: RuntimeTheme) {
    setTheme(nextTheme);
    applyStoredPapaDataRuntimePreference({ theme: nextTheme });
  }

  function setShellOverlay(overlay: Exclude<ShellOverlay, null>, open: boolean) {
    onOpenOverlay(open ? overlay : null);
  }

  return (
    <header className="pd-shell-topbar" data-variant="authenticated">
      <div className="pd-shell-topbar__start">
        <button
          aria-label={copy.menu}
          className="pd-shell-topbar__mobile-menu"
          onClick={() => onOpenOverlay('mobile-navigation')}
          type="button"
        >
          <Icon decorative name="menu" size={20} />
        </button>

        <button
          aria-label="PapaData — strona główna"
          className="pd-shell-topbar__brand"
          onClick={() => onNavigate('/app')}
          type="button"
        >
          <PapaDataBrand decorative size="small" variant="lockup" />
        </button>

        <span aria-current="page" className="pd-shell-topbar__section-context">
          {sectionLabel}
        </span>
      </div>

      <button
        aria-label={copy.searchFull}
        className="pd-shell-topbar__command-trigger"
        onClick={() => onOpenOverlay('command')}
        type="button"
      >
        <Icon decorative name="search" size={20} />
        <span>{copy.search}</span>
        <kbd>Ctrl K</kbd>
      </button>

      <div className="pd-shell-topbar__actions">
        <DateRangeOverlay
          copy={copy}
          locale={locale}
          onChange={onDateRangeChange}
          onOpenChange={(open) => setShellOverlay('calendar', open)}
          open={activeOverlay === 'calendar'}
          presets={calendarPresets(locale)}
          quickOptions={calendarQuickOptions(locale)}
          trigger={(
            <button
              aria-label={copy.calendar}
              className="pd-shell-topbar__control pd-shell-topbar__icon-control"
              type="button"
            >
              <Icon decorative name="calendar" size={20} />
            </button>
          )}
          value={dateRange}
        />

        {papaAvailable ? (
          <button
            aria-label={copy.papaAssistant}
            aria-pressed={papaAssistantOpen}
            className="pd-shell-topbar__control pd-shell-topbar__icon-control pd-shell-topbar__papa-control"
            onClick={() => onOpenOverlay('papa-assistant')}
            type="button"
          >
            <Icon decorative name="assistant" size={20} />
          </button>
        ) : null}

        <NotificationCenter
          error={notificationError}
          locale={locale}
          notifications={notifications}
          onMarkAllRead={onMarkAllNotificationsRead}
          onMarkRead={onMarkNotificationRead}
          onMarkUnread={onMarkNotificationUnread}
          onNotificationAction={(notification) => {
            if (!notification.actionPath) return;
            onOpenOverlay(null);
            onNavigate(notification.actionPath);
          }}
          onOpenChange={(open) => setShellOverlay('notifications', open)}
          onSnooze={onSnoozeNotification}
          onUnsnooze={onUnsnoozeNotification}
          open={activeOverlay === 'notifications'}
          unreadCount={notificationUnreadCount}
          trigger={(
            <button
              aria-label={`${copy.notifications}: ${notificationCountLabel}`}
              className="pd-shell-topbar__control pd-shell-topbar__icon-control pd-shell-topbar__notifications-trigger"
              type="button"
            >
              <Icon decorative name="notifications" size={20} />
              {notificationUnreadCount > 0 ? (
                <span aria-hidden="true" className="pd-shell-topbar__notification-count">
                  {notificationCountLabel}
                </span>
              ) : null}
            </button>
          )}
        />

        <AccountPanel
          locale={locale}
          loggingOut={loggingOut}
          onLocaleChange={changeLocale}
          onLogout={onLogout}
          onNavigate={onNavigate}
          onOpenChange={(open) => setShellOverlay('account', open)}
          onOpenOperations={() => onOpenOverlay('operations')}
          onThemeChange={changeTheme}
          open={activeOverlay === 'account'}
          operationCount={operationCount}
          theme={theme}
          trigger={(
            <button
              aria-label={`${copy.profile}: ${user.displayName}`}
              className="pd-shell-topbar__profile-trigger"
              type="button"
            >
              <span aria-hidden="true" className="pd-shell-topbar__profile-avatar">
                {getInitials(user.displayName)}
              </span>
              <span className="pd-shell-topbar__profile-copy">
                <strong>{user.displayName}</strong>
              </span>
              <span aria-hidden="true">▾</span>
            </button>
          )}
          user={user}
        />
      </div>
    </header>
  );
}
