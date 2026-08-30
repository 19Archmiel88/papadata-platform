import type {
  ReactNode,
} from 'react';

import {
  defaultShellCommands,
  defaultShellNavigation,
  defaultShellNotifications,
  defaultShellOperations,
  defaultShellUser,
  defaultShellWorkspaces,
  ProductShellFrame,
  type ShellNavigationGroup,
} from '../../runtime/shell/index';
import './storybook-visual-language.css';

type StorybookProductShellFrameProps = {
  readonly activePath: string;
  readonly children: ReactNode;
};

const noop = () => undefined;

const storybookShellNavigation = defaultShellNavigation.map((group): ShellNavigationGroup => ({
  ...group,
  items: group.items.map((item) => {
    if (item.id === 'settings' || item.id === 'help') {
      return {
        ...item,
        disabled: false,
        disabledReason: undefined,
      };
    }

    return item;
  }),
}));

export function StorybookProductShellFrame({
  activePath,
  children,
}: StorybookProductShellFrameProps) {
  return (
    <div className="pd-storybook-product-shell-frame">
      <ProductShellFrame
        activePath={activePath}
        activeTenantId="tenant_papadata"
        activeWorkspaceId="commerce"
        commands={defaultShellCommands}
        navigationGroups={storybookShellNavigation}
        notificationUnreadCount={defaultShellNotifications.filter((item) => item.unread).length}
        notifications={defaultShellNotifications}
        onLogout={noop}
        onMarkAllNotificationsRead={noop}
        onMarkNotificationRead={noop}
        onMarkNotificationUnread={noop}
        onNavigate={noop}
        onOperationAction={noop}
        onSelectWorkspace={noop}
        onSnoozeNotification={noop}
        onUnsnoozeNotification={noop}
        operations={defaultShellOperations}
        user={defaultShellUser}
        workspaces={defaultShellWorkspaces}
      >
        <div className="pd-storybook-product-shell-page">
          {children}
        </div>
      </ProductShellFrame>
    </div>
  );
}
