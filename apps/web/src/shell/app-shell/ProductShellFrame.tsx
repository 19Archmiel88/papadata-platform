import type {
  ReactNode,
} from 'react';
import {
  useEffect,
  useState,
} from 'react';

import {
  Drawer,
  InlineNotice,
  StatusBadge,
} from '../../design-system';
import {
  CommandPalette,
} from '../command-palette';
import {
  OperationCenter,
} from '../operation-center';
import {
  Sidebar,
} from '../sidebar';
import {
  AuthenticatedTopbar,
} from '../topbar';
import {
  WorkspaceSwitcher,
} from '../workspace-switcher';
import {
  defaultShellCommands,
  defaultShellNavigation,
  defaultShellNotifications,
  defaultShellOperations,
  defaultShellUser,
  defaultShellWorkspaces,
} from './shellData';
import type {
  ShellCommandResult,
  ShellNavigate,
  ShellNavigationGroup,
  ShellNotification,
  ShellOperation,
  ShellOverlay,
  ShellUser,
  ShellWorkspace,
} from './shellTypes';
import './product-shell.css';

export type ProductShellFrameProps = {
  readonly activePath: string;
  readonly activeWorkspaceId?: string | null;
  readonly children: ReactNode;
  readonly commands?: readonly ShellCommandResult[];
  readonly initialOverlay?: ShellOverlay;
  readonly loggingOut?: boolean;
  readonly navigationGroups?: readonly ShellNavigationGroup[];
  readonly notifications?: readonly ShellNotification[];
  readonly onLogout?: () => void;
  readonly onNavigate?: ShellNavigate;
  readonly operations?: readonly ShellOperation[];
  readonly problem?: string | null;
  readonly sidebarCollapsed?: boolean;
  readonly sidebarDense?: boolean;
  readonly user?: ShellUser;
  readonly workspaceError?: string | null;
  readonly workspaces?: readonly ShellWorkspace[];
};

export function ProductShellFrame({
  activePath,
  activeWorkspaceId = 'commerce',
  children,
  commands = defaultShellCommands,
  initialOverlay = null,
  loggingOut = false,
  navigationGroups = defaultShellNavigation,
  notifications = defaultShellNotifications,
  onLogout = () => undefined,
  onNavigate = () => undefined,
  operations = defaultShellOperations,
  problem = null,
  sidebarCollapsed = false,
  sidebarDense = false,
  user = defaultShellUser,
  workspaceError = null,
  workspaces = defaultShellWorkspaces,
}: ProductShellFrameProps) {
  const [overlay, setOverlay] = useState<ShellOverlay>(initialOverlay);
  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    useState(activeWorkspaceId);
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(sidebarCollapsed);

  useEffect(() => {
    setOverlay(initialOverlay);
  }, [initialOverlay]);

  useEffect(() => {
    setIsSidebarCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed]);

  function closeOverlay() {
    setOverlay(null);
  }

  function navigateInsideShell(path: string) {
    closeOverlay();
    onNavigate(path);
  }

  const activeOperationCount = operations.filter(
    (item) => (
      item.status === 'running'
      || item.status === 'failed'
    ),
  ).length;

  return (
    <div className="pd-product-shell">
      <AuthenticatedTopbar
        activePath={activePath}
        loggingOut={loggingOut}
        navigationGroups={navigationGroups}
        notificationOpen={overlay === 'notifications'}
        notifications={notifications}
        onLogout={onLogout}
        onNavigate={navigateInsideShell}
        onOpenOverlay={setOverlay}
        operationCount={activeOperationCount}
        user={user}
      />

      <div
        className="pd-product-shell__body"
        data-sidebar-collapsed={
          isSidebarCollapsed ? true : undefined
        }
      >
        <div
          className="pd-product-shell__sidebar-column"
          data-collapsed={
            isSidebarCollapsed ? true : undefined
          }
        >
          <WorkspaceSwitcher
            activeWorkspaceId={selectedWorkspaceId}
            collapsed={isSidebarCollapsed}
            error={workspaceError}
            onSelectWorkspace={setSelectedWorkspaceId}
            workspaces={workspaces}
          />
          <Sidebar
            activePath={activePath}
            collapsed={isSidebarCollapsed}
            dense={sidebarDense}
            groups={navigationGroups}
            onCollapsedChange={setIsSidebarCollapsed}
            onNavigate={navigateInsideShell}
          />
        </div>

        <main className="pd-product-shell__content">
          <div className="pd-product-shell__content-toolbar">
            <div>
              <p>Runtime shell</p>
              <h1>Powłoka produktu</h1>
            </div>
            <StatusBadge
              status="Status"
              text="P0 ready"
              tone="success"
            />
          </div>

          {problem ? (
            <InlineNotice
              message={problem}
              title="Problem runtime"
              tone="warning"
            />
          ) : null}

          <div className="pd-product-shell__content-region">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette
        commands={commands}
        onNavigate={navigateInsideShell}
        onOpenChange={(open) => setOverlay(open ? 'command' : null)}
        open={overlay === 'command'}
      />

      <OperationCenter
        onOpenChange={(open) => setOverlay(open ? 'operations' : null)}
        open={overlay === 'operations'}
        operations={operations}
      />

      <Drawer
        description="Mobilna nawigacja produktu z focus restore i zamknięciem Escape."
        dismissible
        onOpenChange={(open) => setOverlay(open ? 'mobile-navigation' : null)}
        open={overlay === 'mobile-navigation'}
        side="left"
        title="Nawigacja"
        width={340}
      >
        <div className="pd-product-shell__mobile-drawer">
          <WorkspaceSwitcher
            activeWorkspaceId={selectedWorkspaceId}
            error={workspaceError}
            onSelectWorkspace={setSelectedWorkspaceId}
            workspaces={workspaces}
          />
          <Sidebar
            activePath={activePath}
            collapsible={false}
            groups={navigationGroups}
            onNavigate={navigateInsideShell}
          />
        </div>
      </Drawer>
    </div>
  );
}
