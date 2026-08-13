import {
  useState,
} from 'react';

import {
  DateRangePicker,
  Icon,
  Menu,
  PapaDataBrand,
  Popover,
} from '../../design-system';
import type {
  DateRangePickerPreset,
  DateRangePickerProps,
  MenuItem,
} from '../../design-system';
import {
  NotificationCenter,
} from '../notifications';
import type {
  ShellNavigate,
  ShellNavigationGroup,
  ShellNotification,
  ShellOverlay,
  ShellUser,
} from '../app-shell/shellTypes';
import './topbar.css';

type RuntimeLocale = 'pl' | 'en';
type RuntimeTheme = 'light' | 'dark';

function readRuntimeLocale(): RuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}

function readRuntimeTheme(): RuntimeTheme {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.dataset.theme === 'dark'
    ? 'dark'
    : 'light';
}

function applyRuntimePreference(
  attribute: 'data-locale' | 'data-theme',
  value: RuntimeLocale | RuntimeTheme,
) {
  if (typeof document === 'undefined') {
    return;
  }

  const targets = new Set<HTMLElement>([
    document.documentElement,
    ...Array.from(
      document.querySelectorAll<HTMLElement>(
        '.pd-storybook-canvas',
      ),
    ),
  ]);

  targets.forEach((target) => {
    target.setAttribute(attribute, value);
  });

  if (attribute === 'data-locale') {
    document.documentElement.lang = value;
  }
}

function formatDateInput(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createInitialDateRange(): DateRangePickerProps['value'] {
  const today = new Date();
  const monthStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  );

  return {
    from: formatDateInput(monthStart),
    preset: 'monthToDate',
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone
      || 'Europe/Warsaw',
    to: formatDateInput(today),
  };
}

function resolveSectionLabel(
  activePath: string,
  navigationGroups: readonly ShellNavigationGroup[],
) {
  const navigationItems = navigationGroups.flatMap(
    (group) => group.items,
  );

  const matches = navigationItems
    .filter((item) => (
      activePath === item.path
      || activePath.startsWith(`${item.path}/`)
    ))
    .sort((left, right) => (
      right.path.length - left.path.length
    ));

  return (
    matches[0]?.label
    ?? navigationItems[0]?.label
    ?? 'PapaData'
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

function preferenceCopy(locale: RuntimeLocale) {
  return locale === 'en'
    ? {
        calendar: 'Calendar',
        calendarDescription:
          'Set the global analysis date range.',
        calendarHelper:
          'The range stays in the shell while you navigate.',
        dateFrom: 'From',
        datePreset: 'Range',
        dateRange: 'Analysis date range',
        dateTo: 'To',
        language: 'Interface language',
        menu: 'Open navigation',
        notifications: 'Notifications',
        operations: 'Background operations',
        profile: 'User profile',
        search: 'Search',
        searchFull: 'Search or run a command',
        themeDark: 'Dark',
        themeLight: 'Light',
        themeToDark: 'Switch to dark theme',
        themeToLight: 'Switch to light theme',
        logout: 'Sign out',
        loggingOut: 'Signing out…',
      }
    : {
        calendar: 'Kalendarz',
        calendarDescription:
          'Ustaw globalny zakres dat analiz.',
        calendarHelper:
          'Zakres pozostaje w powłoce podczas zmiany sekcji.',
        dateFrom: 'Od',
        datePreset: 'Zakres',
        dateRange: 'Zakres dat analiz',
        dateTo: 'Do',
        language: 'Język interfejsu',
        menu: 'Otwórz nawigację',
        notifications: 'Powiadomienia',
        operations: 'Operacje w tle',
        profile: 'Profil użytkownika',
        search: 'Szukaj',
        searchFull: 'Szukaj lub uruchom komendę',
        themeDark: 'Ciemny',
        themeLight: 'Jasny',
        themeToDark: 'Zmień motyw na ciemny',
        themeToLight: 'Zmień motyw na jasny',
        logout: 'Wyloguj',
        loggingOut: 'Wylogowanie…',
      };
}

function calendarPresets(
  locale: RuntimeLocale,
): readonly DateRangePickerPreset[] {
  return locale === 'en'
    ? [
        { label: 'Today', value: 'today' },
        { label: 'Last 7 days', value: 'last7d' },
        { label: 'Last 30 days', value: 'last30d' },
        { label: 'Month to date', value: 'monthToDate' },
        { label: 'Custom', value: 'custom' },
      ]
    : [
        { label: 'Dzisiaj', value: 'today' },
        { label: 'Ostatnie 7 dni', value: 'last7d' },
        { label: 'Ostatnie 30 dni', value: 'last30d' },
        { label: 'Bieżący miesiąc', value: 'monthToDate' },
        { label: 'Niestandardowy', value: 'custom' },
      ];
}

function RuntimePreferenceControls({
  compact = false,
  locale,
  onLocaleChange,
  onThemeChange,
  theme,
}: {
  readonly compact?: boolean;
  readonly locale: RuntimeLocale;
  readonly onLocaleChange: (locale: RuntimeLocale) => void;
  readonly onThemeChange: (theme: RuntimeTheme) => void;
  readonly theme: RuntimeTheme;
}) {
  const copy = preferenceCopy(locale);
  const nextTheme: RuntimeTheme =
    theme === 'dark' ? 'light' : 'dark';
  const themeLabel = theme === 'dark'
    ? copy.themeDark
    : copy.themeLight;

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
        aria-label={
          nextTheme === 'dark'
            ? copy.themeToDark
            : copy.themeToLight
        }
        className="pd-shell-topbar__control pd-shell-topbar__theme-control"
        onClick={() => onThemeChange(nextTheme)}
        type="button"
      >
        <Icon decorative name="theme" size={20} />
        {compact ? null : (
          <strong>{themeLabel}</strong>
        )}
      </button>
    </>
  );
}

export function PublicTopbar({
  onNavigate,
}: {
  readonly onNavigate: ShellNavigate;
}) {
  const [locale, setLocale] =
    useState<RuntimeLocale>(readRuntimeLocale);
  const [theme, setTheme] =
    useState<RuntimeTheme>(readRuntimeTheme);

  function changeLocale(nextLocale: RuntimeLocale) {
    setLocale(nextLocale);
    applyRuntimePreference('data-locale', nextLocale);
  }

  function changeTheme(nextTheme: RuntimeTheme) {
    setTheme(nextTheme);
    applyRuntimePreference('data-theme', nextTheme);
  }

  return (
    <header
      className="pd-shell-topbar"
      data-variant="public"
    >
      <button
        aria-label="PapaData — strona główna"
        className="pd-shell-topbar__brand"
        onClick={() => onNavigate('/auth')}
        type="button"
      >
        <PapaDataBrand
          decorative
          size="small"
          variant="lockup"
        />
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

export function AuthenticatedTopbar({
  activePath,
  loggingOut = false,
  navigationGroups,
  notificationOpen,
  notifications,
  onLogout,
  onNavigate,
  onOpenOverlay,
  operationCount,
  user,
}: {
  readonly activePath: string;
  readonly loggingOut?: boolean;
  readonly navigationGroups: readonly ShellNavigationGroup[];
  readonly notificationOpen: boolean;
  readonly notifications: readonly ShellNotification[];
  readonly onLogout: () => void;
  readonly onNavigate: ShellNavigate;
  readonly onOpenOverlay: (overlay: ShellOverlay) => void;
  readonly operationCount: number;
  readonly user: ShellUser;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateRange, setDateRange] =
    useState<DateRangePickerProps['value']>(
      createInitialDateRange,
    );
  const [locale, setLocale] =
    useState<RuntimeLocale>(readRuntimeLocale);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] =
    useState<RuntimeTheme>(readRuntimeTheme);

  const copy = preferenceCopy(locale);

  const notificationCount = notifications.filter(
    (item) => item.unread,
  ).length;

  const notificationCountLabel =
    notificationCount > 99
      ? '99+'
      : String(notificationCount);

  const sectionLabel = resolveSectionLabel(
    activePath,
    navigationGroups,
  );

  const profileItems: readonly MenuItem[] = [
    {
      disabled: true,
      id: 'identity',
      label: `${user.displayName} · ${user.email}`,
    },
    {
      id: 'operations',
      label: operationCount > 0
        ? `${copy.operations} (${operationCount})`
        : copy.operations,
    },
    {
      id: 'profile-separator',
      kind: 'separator',
    },
    {
      destructive: true,
      disabled: loggingOut,
      id: 'logout',
      label: loggingOut
        ? copy.loggingOut
        : copy.logout,
    },
  ];

  function changeLocale(nextLocale: RuntimeLocale) {
    setLocale(nextLocale);
    applyRuntimePreference('data-locale', nextLocale);
  }

  function changeTheme(nextTheme: RuntimeTheme) {
    setTheme(nextTheme);
    applyRuntimePreference('data-theme', nextTheme);
  }

  function openGlobalOverlay(overlay: ShellOverlay) {
    setCalendarOpen(false);
    setProfileOpen(false);
    onOpenOverlay(overlay);
  }

  return (
    <header
      className="pd-shell-topbar"
      data-variant="authenticated"
    >
      <div className="pd-shell-topbar__start">
        <button
          aria-label={copy.menu}
          className="pd-shell-topbar__mobile-menu"
          onClick={() => openGlobalOverlay('mobile-navigation')}
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
          <PapaDataBrand
            decorative
            size="small"
            variant="lockup"
          />
        </button>

        <span
          aria-current="page"
          className="pd-shell-topbar__section-context"
        >
          {sectionLabel}
        </span>
      </div>

      <button
        aria-label={copy.searchFull}
        className="pd-shell-topbar__command-trigger"
        onClick={() => openGlobalOverlay('command')}
        type="button"
      >
        <Icon decorative name="search" size={20} />
        <span>{copy.search}</span>
        <kbd>Ctrl K</kbd>
      </button>

      <div className="pd-shell-topbar__actions">
        <Popover
          anchorId="pd-shell-calendar"
          className="pd-shell-topbar__calendar-popover"
          description={copy.calendarDescription}
          modal={false}
          onOpenChange={(open) => {
            setCalendarOpen(open);
            if (open) {
              setProfileOpen(false);
              onOpenOverlay(null);
            }
          }}
          open={calendarOpen}
          placement="bottom"
          title={copy.calendar}
          trigger={(
            <button
              aria-label={copy.calendar}
              className="pd-shell-topbar__control pd-shell-topbar__icon-control"
              type="button"
            >
              <Icon decorative name="calendar" size={20} />
            </button>
          )}
        >
          <DateRangePicker
            fromLabel={copy.dateFrom}
            helperText={copy.calendarHelper}
            label={copy.dateRange}
            locale={locale}
            onChange={setDateRange}
            presetLabel={copy.datePreset}
            presets={calendarPresets(locale)}
            timezone={dateRange.timezone}
            toLabel={copy.dateTo}
            value={dateRange}
          />
        </Popover>

        <RuntimePreferenceControls
          compact
          locale={locale}
          onLocaleChange={changeLocale}
          onThemeChange={changeTheme}
          theme={theme}
        />

        <NotificationCenter
          locale={locale}
          notifications={notifications}
          onOpenChange={(open) => {
            if (open) {
              setCalendarOpen(false);
              setProfileOpen(false);
            }

            onOpenOverlay(
              open ? 'notifications' : null,
            );
          }}
          open={notificationOpen}
          trigger={(
            <button
              aria-label={`${copy.notifications}: ${notificationCountLabel}`}
              className="pd-shell-topbar__control pd-shell-topbar__icon-control pd-shell-topbar__notifications-trigger"
              type="button"
            >
              <Icon decorative name="notifications" size={20} />
              {notificationCount > 0 ? (
                <span
                  aria-hidden="true"
                  className="pd-shell-topbar__notification-count"
                >
                  {notificationCountLabel}
                </span>
              ) : null}
            </button>
          )}
        />

        <Menu
          activeItemId="operations"
          className="pd-shell-topbar__profile-menu"
          items={profileItems}
          onAction={(itemId) => {
            if (itemId === 'operations') {
              onOpenOverlay('operations');
              return;
            }

            if (itemId === 'logout') {
              onLogout();
            }
          }}
          onOpenChange={(open) => {
            setProfileOpen(open);

            if (open) {
              setCalendarOpen(false);
              onOpenOverlay(null);
            }
          }}
          open={profileOpen}
          placement="bottom-end"
          trigger={(
            <button
              aria-label={`${copy.profile}: ${user.displayName}`}
              className="pd-shell-topbar__profile-trigger"
              type="button"
            >
              <span
                aria-hidden="true"
                className="pd-shell-topbar__profile-avatar"
              >
                {getInitials(user.displayName)}
              </span>
              <span className="pd-shell-topbar__profile-copy">
                <strong>{user.displayName}</strong>
              </span>
              <span aria-hidden="true">▾</span>
            </button>
          )}
        />
      </div>
    </header>
  );
}
