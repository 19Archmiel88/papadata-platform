import type {
  ReactElement,
} from 'react';
import {
  useMemo,
  useState,
} from 'react';

import {
  Icon,
  TextAction,
} from '../../../../design-system/index';
import type {
  ShellNotification,
  ShellNotificationCategory,
} from '../app-shell/shellTypes';
import {
  AnchoredShellOverlay,
} from '../overlays/index';
import './notification-center.css';

type NotificationFilter = 'all' | 'unread' | 'critical' | 'snoozed';
type NotificationLocale = 'pl' | 'en';
type NotificationMutation = (
  notification: ShellNotification,
) => void | Promise<void>;

export type NotificationCenterProps = {
  readonly error?: string | null;
  readonly locale?: NotificationLocale;
  readonly notifications: readonly ShellNotification[];
  readonly onMarkAllRead?: (() => void | Promise<void>) | undefined;
  readonly onMarkRead?: NotificationMutation | undefined;
  readonly onMarkUnread?: NotificationMutation | undefined;
  readonly onNotificationAction?: NotificationMutation | undefined;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSnooze?: ((notification: ShellNotification, until: string) => void | Promise<void>) | undefined;
  readonly onUnsnooze?: NotificationMutation | undefined;
  readonly open: boolean;
  readonly trigger?: ReactElement | undefined;
  readonly unreadCount: number;
};

export function NotificationCenter({
  error = null,
  locale = 'pl',
  notifications,
  onMarkAllRead,
  onMarkRead,
  onMarkUnread,
  onNotificationAction,
  onOpenChange,
  onSnooze,
  onUnsnooze,
  open,
  trigger,
  unreadCount,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const copy = notificationCopy(locale);
  const now = Date.now();
  const resolvedTrigger = trigger ?? (
    <button className="pd-shell-notification-standalone-trigger" type="button">
      {copy.notifications}
    </button>
  );

  const visibleNotifications = useMemo(() => notifications.filter((notification) => {
    const snoozed = isSnoozed(notification, now);
    if (filter === 'snoozed') return snoozed;
    if (snoozed) return false;
    if (filter === 'unread') return notification.unread;
    if (filter === 'critical') return notification.priority === 'critical';
    return true;
  }), [filter, notifications, now]);
  const previewNotifications = visibleNotifications.slice(0, 4);
  const hiddenNotificationCount = Math.max(
    0,
    visibleNotifications.length - previewNotifications.length,
  );

  async function mutate(
    notification: ShellNotification,
    operation: () => void | Promise<void>,
  ) {
    setMutationError(null);
    setPendingId(notification.id);
    try {
      await operation();
    } catch (cause) {
      setMutationError(cause instanceof Error ? cause.message : copy.mutationFailed);
    } finally {
      setPendingId(null);
    }
  }

  async function markAllRead() {
    if (!onMarkAllRead || unreadCount === 0) return;
    setMutationError(null);
    setMarkingAll(true);
    try {
      await onMarkAllRead();
    } catch (cause) {
      setMutationError(cause instanceof Error ? cause.message : copy.mutationFailed);
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <AnchoredShellOverlay
      className="pd-shell-notification-overlay"
      description={copy.description}
      onOpenChange={onOpenChange}
      open={open}
      title={copy.notifications}
      trigger={resolvedTrigger}
      width="wide"
    >
      <div className="pd-shell-notification-center">
        <div className="pd-shell-notification-center__overview">
          <span aria-hidden="true">
            <Icon decorative name={unreadCount > 0 ? 'notifications' : 'success'} size={20} />
          </span>
          <div>
            <strong>{formatUnreadSummary(unreadCount, locale)}</strong>
            <small>{copy.previewDescription}</small>
          </div>
        </div>

        <div className="pd-shell-notification-center__toolbar">
          <div
            aria-label={copy.filters}
            className="pd-shell-notification-center__filters"
            role="group"
          >
            {([
              ['all', copy.all],
              ['unread', copy.unread],
              ['critical', copy.critical],
              ['snoozed', copy.snoozed],
            ] as const).map(([value, label]) => (
              <button
                aria-pressed={filter === value}
                key={value}
                onClick={() => setFilter(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <button
            className="pd-shell-notification-center__mark-all"
            disabled={!onMarkAllRead || unreadCount === 0 || markingAll}
            onClick={() => void markAllRead()}
            type="button"
          >
            {markingAll ? copy.saving : copy.markAllRead}
          </button>
        </div>

        {mutationError ? (
          <div className="pd-shell-notification-center__mutation-error" role="status">
            {mutationError}
          </div>
        ) : null}

        {error ? (
          <NotificationNotice
            message={error}
            title={copy.errorTitle}
            tone="warning"
          />
        ) : previewNotifications.length === 0 ? (
          <NotificationNotice
            message={filter === 'snoozed' ? copy.emptySnoozed : copy.empty}
            title={copy.emptyTitle}
            tone="neutral"
          />
        ) : (
          <>
            <div className="pd-shell-notification-center__list" role="list">
              {previewNotifications.map((notification) => (
                <NotificationItem
                  copy={copy}
                  key={notification.id}
                  locale={locale}
                  notification={notification}
                  onMarkRead={onMarkRead}
                  onMarkUnread={onMarkUnread}
                  onMutate={mutate}
                  onNotificationAction={onNotificationAction}
                  onSnooze={onSnooze}
                  onUnsnooze={onUnsnooze}
                  pending={pendingId === notification.id}
                />
              ))}
            </div>

            {hiddenNotificationCount > 0 ? (
              <div className="pd-shell-notification-center__footer-note">
                {formatHiddenSummary(hiddenNotificationCount, locale)}
              </div>
            ) : null}
          </>
        )}
      </div>
    </AnchoredShellOverlay>
  );
}

function NotificationItem({
  copy,
  locale,
  notification,
  onMarkRead,
  onMarkUnread,
  onMutate,
  onNotificationAction,
  onSnooze,
  onUnsnooze,
  pending,
}: {
  readonly copy: ReturnType<typeof notificationCopy>;
  readonly locale: NotificationLocale;
  readonly notification: ShellNotification;
  readonly onMarkRead?: NotificationMutation | undefined;
  readonly onMarkUnread?: NotificationMutation | undefined;
  readonly onMutate: (notification: ShellNotification, operation: () => void | Promise<void>) => Promise<void>;
  readonly onNotificationAction?: NotificationMutation | undefined;
  readonly onSnooze?: ((notification: ShellNotification, until: string) => void | Promise<void>) | undefined;
  readonly onUnsnooze?: NotificationMutation | undefined;
  readonly pending: boolean;
}) {
  const snoozed = isSnoozed(notification, Date.now());
  const stateLabel = snoozed
    ? copy.snoozed
    : notification.unread
      ? copy.unread
      : copy.read;

  return (
    <article
      aria-labelledby={`${notification.id}-title`}
      className="pd-shell-notification"
      data-tone={notification.tone}
      data-unread={notification.unread ? true : undefined}
      role="listitem"
    >
      <span aria-hidden="true" className="pd-shell-notification__tone-mark">
        <Icon decorative name={notification.tone === 'success' ? 'success' : 'warning'} size={16} />
      </span>

      <div className="pd-shell-notification__content">
        <header>
          <div>
            <h3 id={`${notification.id}-title`}>{notification.title}</h3>
            <div className="pd-shell-notification__meta">
              <span>{notification.time}</span>
              <span>{categoryLabel(notification.category, locale)}</span>
              <span className="pd-shell-notification__state">{stateLabel}</span>
            </div>
          </div>
        </header>

        <p>{notification.message}</p>

        {snoozed && notification.snoozedUntil ? (
          <p className="pd-shell-notification__snooze-until">
            {copy.returnsAt}: {formatDateTime(notification.snoozedUntil, locale)}
          </p>
        ) : null}

        <div className="pd-shell-notification__primary-actions">
          {notification.actionLabel && notification.actionPath && onNotificationAction ? (
            <TextAction
              onClick={() => {
                void onMutate(notification, () => onNotificationAction(notification));
              }}
              size="small"
            >
              {notification.actionLabel}
            </TextAction>
          ) : null}

          <details className="pd-shell-notification__actions">
            <summary>{copy.more}</summary>
            <div className="pd-shell-notification__actions-panel">
              {notification.unread ? (
                <button
                  disabled={pending || !onMarkRead}
                  onClick={() => {
                    if (onMarkRead) void onMutate(notification, () => onMarkRead(notification));
                  }}
                  type="button"
                >
                  {copy.markRead}
                </button>
              ) : (
                <button
                  disabled={pending || !onMarkUnread}
                  onClick={() => {
                    if (onMarkUnread) void onMutate(notification, () => onMarkUnread(notification));
                  }}
                  type="button"
                >
                  {copy.markUnread}
                </button>
              )}

              {snoozed ? (
                <button
                  disabled={pending || !onUnsnooze}
                  onClick={() => {
                    if (onUnsnooze) void onMutate(notification, () => onUnsnooze(notification));
                  }}
                  type="button"
                >
                  {copy.unsnooze}
                </button>
              ) : notification.canSnooze === false ? (
                <span className="pd-shell-notification__policy-note">
                  {copy.snoozeUnavailable}
                </span>
              ) : onSnooze ? (
                <div className="pd-shell-notification__snooze-controls">
                  <span>{copy.remindLater}</span>
                  <div className="pd-shell-notification__preset-grid">
                    {snoozePresets(locale).slice(0, 3).map((preset) => (
                      <button
                        disabled={pending}
                        key={preset.label}
                        onClick={() => {
                          void onMutate(notification, () => onSnooze(notification, preset.until()));
                        }}
                        type="button"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </details>
        </div>
      </div>
    </article>
  );
}

function NotificationNotice({
  message,
  title,
  tone,
}: {
  readonly message: string;
  readonly title: string;
  readonly tone: 'neutral' | 'warning';
}) {
  return (
    <div className="pd-shell-notification-center__notice" data-tone={tone} role="status">
      <span aria-hidden="true">
        <Icon decorative name={tone === 'warning' ? 'warning' : 'notifications'} size={20} />
      </span>
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

function isSnoozed(notification: ShellNotification, now: number) {
  if (!notification.snoozedUntil) return false;
  const until = Date.parse(notification.snoozedUntil);
  return Number.isFinite(until) && until > now;
}

function categoryLabel(category: ShellNotificationCategory, locale: NotificationLocale) {
  const labels: Record<ShellNotificationCategory, readonly [string, string]> = {
    ai: ['AI', 'AI'],
    billing: ['Płatności', 'Billing'],
    data: ['Dane', 'Data'],
    integrations: ['Integracje', 'Integrations'],
    reports: ['Raporty', 'Reports'],
    support: ['Wsparcie', 'Support'],
    system: ['System', 'System'],
  };
  return labels[category][locale === 'en' ? 1 : 0];
}

function snoozePresets(locale: NotificationLocale) {
  return [
    {
      label: locale === 'en' ? 'In 1 hour' : 'Za godzinę',
      until: () => new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
    {
      label: locale === 'en' ? 'In 3 hours' : 'Za 3 godziny',
      until: () => new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      label: locale === 'en' ? 'Tomorrow 09:00' : 'Jutro 09:00',
      until: () => nextMorning(1).toISOString(),
    },
    {
      label: locale === 'en' ? 'Next workday 09:00' : 'Najbliższy dzień roboczy 09:00',
      until: () => nextWorkdayMorning().toISOString(),
    },
  ] as const;
}

function nextMorning(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  return date;
}

function nextWorkdayMorning() {
  const date = nextMorning(1);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function formatDateTime(value: string, locale: NotificationLocale) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatUnreadSummary(unreadCount: number, locale: NotificationLocale) {
  if (locale === 'en') {
    if (unreadCount === 0) return 'No unread notifications';
    if (unreadCount === 1) return '1 unread notification';
    return `${unreadCount} unread notifications`;
  }

  if (unreadCount === 0) return 'Brak nowych powiadomień';
  if (unreadCount === 1) return '1 nowe powiadomienie';
  if (unreadCount < 5) return `${unreadCount} nowe powiadomienia`;
  return `${unreadCount} nowych powiadomień`;
}

function formatHiddenSummary(count: number, locale: NotificationLocale) {
  if (locale === 'en') {
    return `${count} more item${count === 1 ? '' : 's'} hidden by the compact preview.`;
  }

  if (count === 1) return 'Jeszcze 1 wpis poza kompaktowym podglądem.';
  if (count < 5) return `Jeszcze ${count} wpisy poza kompaktowym podglądem.`;
  return `Jeszcze ${count} wpisów poza kompaktowym podglądem.`;
}

function notificationCopy(locale: NotificationLocale) {
  return locale === 'en'
    ? {
        all: 'All',
        confirmCustom: 'Set reminder',
        critical: 'Critical',
        customTime: 'Choose date and time',
        description: 'Durable product events for the current workspace.',
        empty: 'No notifications match this filter.',
        emptySnoozed: 'No notifications are snoozed.',
        emptyTitle: 'No notifications',
        errorTitle: 'Notifications unavailable',
        filters: 'Notification filters',
        markAllRead: 'Mark all as read',
        markRead: 'Mark as read',
        markUnread: 'Mark as unread',
        more: 'Actions',
        mutationFailed: 'The notification could not be updated.',
        notifications: 'Notifications',
        previewDescription: 'Compact preview for the active workspace.',
        read: 'Read',
        remindLater: 'Remind later',
        returnsAt: 'Returns',
        saving: 'Saving…',
        snoozed: 'Snoozed',
        snoozeUnavailable: 'This critical notification cannot be snoozed.',
        unread: 'Unread',
        unsnooze: 'Bring back now',
      }
    : {
        all: 'Wszystkie',
        confirmCustom: 'Ustaw przypomnienie',
        critical: 'Krytyczne',
        customTime: 'Wybierz datę i godzinę',
        description: 'Trwałe zdarzenia produktu dla aktywnego workspace.',
        empty: 'Brak powiadomień pasujących do wybranego filtra.',
        emptySnoozed: 'Nie masz odłożonych powiadomień.',
        emptyTitle: 'Brak powiadomień',
        errorTitle: 'Powiadomienia niedostępne',
        filters: 'Filtry powiadomień',
        markAllRead: 'Oznacz wszystkie jako przeczytane',
        markRead: 'Oznacz jako przeczytane',
        markUnread: 'Oznacz jako nieprzeczytane',
        more: 'Akcje',
        mutationFailed: 'Nie udało się zaktualizować powiadomienia.',
        notifications: 'Powiadomienia',
        previewDescription: 'Kompaktowy podgląd dla aktywnego workspace.',
        read: 'Przeczytane',
        remindLater: 'Przypomnij później',
        returnsAt: 'Ponownie pojawi się',
        saving: 'Zapisywanie…',
        snoozed: 'Odłożone',
        snoozeUnavailable: 'Tego krytycznego powiadomienia nie można odłożyć.',
        unread: 'Nieprzeczytane',
        unsnooze: 'Przywróć teraz',
      };
}
