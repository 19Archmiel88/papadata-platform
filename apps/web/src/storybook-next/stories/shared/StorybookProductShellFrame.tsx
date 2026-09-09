import { navigateStorybook, storybookHref, registerStorybookRoute } from './storybookNavigation';
import { commandCenterDemoRange } from '../../../fixtures/command-center/commandCenterDemoSeed';
import { useEffect, type ReactNode } from 'react';

import {
  defaultShellCommands,
  defaultShellNavigation,
  defaultShellNotifications,
  defaultShellOperations,
  defaultShellUser,
  defaultShellWorkspaces,
  ProductShellFrame,
  type ShellNavigationGroup,
} from '../../../runtime/shell/index';

type StorybookProductShellFrameProps = {
  readonly activePath: string;
  readonly children: ReactNode;
};

const noop = () => undefined;

const storybookShellNavigation = defaultShellNavigation.map(
  (group): ShellNavigationGroup => ({
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
  }),
);

export function StorybookProductShellFrame({
  activePath,
  children,
}: StorybookProductShellFrameProps) {
  useEffect(()=>registerStorybookRoute(activePath),[activePath]);
  return (
    <ProductShellFrame
      papaDemo
      activePath={activePath}
      initialDateRange={commandCenterDemoRange}
      activeTenantId="tenant_papadata"
      activeWorkspaceId="commerce"
      commands={defaultShellCommands}
      navigationGroups={storybookShellNavigation.map((group) => ({
        ...group,
        items: group.items.map((item) => ({ ...item, href: storybookHref(item.path) })),
      }))}
      notificationUnreadCount={defaultShellNotifications.filter((item) => item.unread).length}
      notifications={defaultShellNotifications}
      onLogout={noop}
      onMarkAllNotificationsRead={noop}
      onMarkNotificationRead={noop}
      onMarkNotificationUnread={noop}
      onNavigate={navigateStorybook}
      onOperationAction={noop}
      onSelectWorkspace={noop}
      onSnoozeNotification={noop}
      onUnsnoozeNotification={noop}
      operations={defaultShellOperations}
      user={defaultShellUser}
      workspaces={defaultShellWorkspaces}
    >
      {children}
    </ProductShellFrame>
  );
}
