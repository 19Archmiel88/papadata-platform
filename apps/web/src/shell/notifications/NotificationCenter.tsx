import type {
  KeyboardEvent,
  ReactElement,
} from 'react';
import {
  useState,
} from 'react';

import {
  EmptyState,
  ErrorState,
  Popover,
  TextAction,
} from '../../design-system';
import type {
  ShellNotification,
} from '../app-shell/shellTypes';
import './notification-center.css';

type NotificationFilter =
  | 'all'
  | 'unread'
  | 'critical';

type NotificationLocale =
  | 'pl'
  | 'en';

export function NotificationCenter({
  error = null,
  locale = 'pl',
  notifications,
  onNotificationAction,
  onOpenChange,
  open,
  trigger,
}: {
  readonly error?: string | null;
  readonly locale?: NotificationLocale;
  readonly notifications: readonly ShellNotification[];
  readonly onNotificationAction?:
    | ((notification: ShellNotification) => void)
    | undefined;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly trigger?: ReactElement;
}) {
  const [filter, setFilter] =
    useState<NotificationFilter>('all');

  const copy = locale === 'en'
    ? {
        all: 'All',
        critical: 'Critical',
        empty: 'No notifications match this filter.',
        emptyTitle: 'No notifications',
        errorTitle: 'Notifications unavailable',
        notifications: 'Notifications',
        read: 'Read',
        unread: 'Unread',
      }
    : {
        all: 'Wszystkie',
        critical: 'Krytyczne',
        empty:
          'Brak powiadomień pasujących do wybranego filtra.',
        emptyTitle: 'Brak powiadomień',
        errorTitle: 'Powiadomienia niedostępne',
        notifications: 'Powiadomienia',
        read: 'Odczytane',
        unread: 'Nieprzeczytane',
      };

  const visibleNotifications = notifications.filter(
    (notification) => {
      if (filter === 'unread') {
        return Boolean(notification.unread);
      }

      if (filter === 'critical') {
        return notification.tone === 'critical';
      }

      return true;
    },
  );

  function activateNotification(notification: ShellNotification) {
    if (!notification.actionPath || !onNotificationAction) {
      return;
    }

    onNotificationAction?.(notification);
    onOpenChange(false);
  }

  function handleNotificationKeyDown(
    event: KeyboardEvent<HTMLElement>,
    notification: ShellNotification,
  ) {
    if (
      event.key !== 'Enter'
      && event.key !== ' '
    ) {
      return;
    }

    event.preventDefault();
    activateNotification(notification);
  }

  const resolvedTrigger = trigger ?? (
    <button
      className="pd-shell-topbar__control pd-shell-topbar__notifications-trigger"
      type="button"
    >
      {copy.notifications}
    </button>
  );

  return (
    <Popover
      anchorId="pd-shell-notifications"
      className="pd-shell-notification-popover"
      description={
        locale === 'en'
          ? 'Product events and alerts.'
          : 'Zdarzenia i alerty produktu.'
      }
      modal={false}
      onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
      open={open}
      placement="bottom"
      title={copy.notifications}
      trigger={resolvedTrigger}
    >
      <div className="pd-shell-notification-center">
        <div
          aria-label={
            locale === 'en'
              ? 'Notification filters'
              : 'Filtry powiadomień'
          }
          className="pd-shell-notification-center__filters"
          role="group"
        >
          {([
            ['all', copy.all],
            ['unread', copy.unread],
            ['critical', copy.critical],
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

        {error ? (
          <ErrorState
            errorCode="NOTIFICATIONS_ERROR"
            message={error}
            title={copy.errorTitle}
            variant="system"
          />
        ) : visibleNotifications.length === 0 ? (
          <EmptyState
            message={copy.empty}
            title={copy.emptyTitle}
            variant="empty"
          />
        ) : (
          <div
            className="pd-shell-notification-center__list"
            role="list"
          >
            {visibleNotifications.map((notification) => {
              const stateLabel =
                notification.tone === 'critical'
                  ? copy.critical
                  : notification.unread
                    ? copy.unread
                    : copy.read;
              const isActionable =
                Boolean(notification.actionPath && onNotificationAction);

              return (
                <article
                  aria-labelledby={`${notification.id}-title`}
                  className="pd-shell-notification"
                  data-tone={notification.tone}
                  data-actionable={
                    isActionable
                      ? true
                      : undefined
                  }
                  data-unread={
                    notification.unread ? true : undefined
                  }
                  key={notification.id}
                  onClick={() => activateNotification(notification)}
                  onKeyDown={(event) => {
                    handleNotificationKeyDown(event, notification);
                  }}
                  tabIndex={
                    isActionable
                      ? 0
                      : undefined
                  }
                  role="listitem"
                >
                  <header>
                    <div>
                      <h3 id={`${notification.id}-title`}>
                        {notification.title}
                      </h3>
                      <div className="pd-shell-notification__meta">
                        <span>{notification.time}</span>
                        <span
                          className="pd-shell-notification__state"
                        >
                          {stateLabel}
                        </span>
                      </div>
                    </div>
                  </header>

                  <p>{notification.message}</p>

                  {notification.actionLabel
                  && isActionable ? (
                    <TextAction
                      onClick={(event) => {
                        event.stopPropagation();
                        activateNotification(notification);
                      }}
                      size="small"
                    >
                      {notification.actionLabel}
                    </TextAction>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Popover>
  );
}
