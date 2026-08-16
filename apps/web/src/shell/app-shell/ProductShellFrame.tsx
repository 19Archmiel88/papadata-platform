import type {
  ReactNode,
} from 'react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Drawer,
  InlineNotice,
} from '../../design-system';
import {
  CommandPalette,
} from '../command-palette';
import {
  OperationCenter,
} from '../operation-center';
import {
  PapaAssistantRuntimeProvider,
  PapaAssistantSidecar,
  type PapaAssistantOpenRequest,
  PapaScreenContextProvider,
} from '../papa-assistant';
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
  ShellCommandAction,
  ShellCommandResult,
  ShellNavigate,
  ShellNavigationGroup,
  ShellNotification,
  ShellOperation,
  ShellOverlay,
  ShellUser,
  ShellWorkspace,
} from './shellTypes';
import {
  ShellDateRangeContext,
} from './ShellDateRangeContext';
import {
  createInitialShellDateRange,
  formatShellDateRangeLabel,
  getShellDateRangeKey,
  writeStoredShellDateRange,
} from './shellDateRange';
import './product-shell.css';

const shellSidebarCollapsedStorageKey =
  'papadata.shell-sidebar-collapsed.v1';

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
  sidebarCollapsed,
  sidebarDense = false,
  user = defaultShellUser,
  workspaceError = null,
  workspaces = defaultShellWorkspaces,
}: ProductShellFrameProps) {
  const [overlay, setOverlay] = useState<ShellOverlay>(initialOverlay);
  const [papaAssistantRequest, setPapaAssistantRequest] =
    useState<PapaAssistantOpenRequest | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    useState(activeWorkspaceId);
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(() => readInitialSidebarCollapsed(sidebarCollapsed));
  const [dateRange, setDateRange] = useState(
    createInitialShellDateRange,
  );
  const dateRangeKey = getShellDateRangeKey(dateRange);
  const dateRangeContext = useMemo(() => ({
    dateRange,
    dateRangeKey,
    setDateRange,
  }), [
    dateRange,
    dateRangeKey,
  ]);

  useEffect(() => {
    setOverlay(initialOverlay);
  }, [initialOverlay]);

  useEffect(() => {
    if (typeof sidebarCollapsed === 'boolean') {
      setIsSidebarCollapsed(sidebarCollapsed);
    }
  }, [sidebarCollapsed]);

  const updateSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    writeStoredSidebarCollapsed(collapsed);
  }, []);

  useEffect(() => {
    document.body.classList.add(
      'pd-product-shell-scroll-lock',
    );

    return () => {
      document.body.classList.remove(
        'pd-product-shell-scroll-lock',
      );
    };
  }, []);

  useEffect(() => {
    writeStoredShellDateRange(dateRange);
  }, [
    dateRange,
  ]);

  useEffect(() => {
    function handleCommandShortcut(event: KeyboardEvent) {
      if (
        event.key.toLowerCase() !== 'k'
        || (!event.ctrlKey && !event.metaKey)
      ) {
        return;
      }

      event.preventDefault();
      setOverlay('command');
    }

    document.addEventListener('keydown', handleCommandShortcut);

    return () => {
      document.removeEventListener('keydown', handleCommandShortcut);
    };
  }, []);

  useEffect(() => {
    function handlePapaAssistantRequest(event: Event) {
      const detail = event instanceof CustomEvent
        ? event.detail
        : null;
      const request = buildPapaAssistantRequest(detail);

      setPapaAssistantRequest(request);
      setOverlay('papa-assistant');
    }

    window.addEventListener(
      'papadata:papa-assistant',
      handlePapaAssistantRequest,
    );

    return () => {
      window.removeEventListener(
        'papadata:papa-assistant',
        handlePapaAssistantRequest,
      );
    };
  }, []);

  function closeOverlay() {
    setOverlay(null);
  }

  function navigateInsideShell(path: string) {
    closeOverlay();
    onNavigate(path);
  }

  function handleCommandAction(action: ShellCommandAction) {
    if (action === 'open-papa') {
      setPapaAssistantRequest(createPapaAssistantRequest({
        action: 'open',
        mode: 'screen',
      }));
      setOverlay('papa-assistant');
      return;
    }

    if (action === 'analyze-screen') {
      setPapaAssistantRequest(createPapaAssistantRequest({
        action: 'analyze-screen',
        mode: 'screen',
      }));
      setOverlay('papa-assistant');
    }
  }

  const activeOperationCount = operations.filter(
    (item) => (
      item.status === 'running'
      || item.status === 'failed'
    ),
  ).length;
  const selectedWorkspace =
    workspaces.find((workspace) => workspace.id === selectedWorkspaceId)
    ?? workspaces[0]
    ?? null;
  const sectionLabel = resolveShellSectionLabel(
    activePath,
    navigationGroups,
  );

  return (
    <ShellDateRangeContext.Provider value={dateRangeContext}>
      <PapaScreenContextProvider
        activePath={activePath}
        dateRangeLabel={formatShellDateRangeLabel(dateRange)}
        sectionLabel={sectionLabel}
        userLabel={user.displayName}
        workspaceId={selectedWorkspace?.id ?? selectedWorkspaceId ?? null}
        workspaceName={selectedWorkspace?.name ?? 'Workspace'}
      >
        <PapaAssistantRuntimeProvider>
        <div className="pd-product-shell">
          <AuthenticatedTopbar
            activePath={activePath}
            dateRange={dateRange}
            loggingOut={loggingOut}
            navigationGroups={navigationGroups}
            notificationOpen={overlay === 'notifications'}
            notifications={notifications}
            onDateRangeChange={setDateRange}
            onLogout={onLogout}
            onNavigate={navigateInsideShell}
            onOpenOverlay={setOverlay}
            operationCount={activeOperationCount}
            papaAssistantOpen={overlay === 'papa-assistant'}
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
                onCollapsedChange={updateSidebarCollapsed}
                onNavigate={navigateInsideShell}
              />
            </div>

            <main className="pd-product-shell__content">
              {problem ? (
                <InlineNotice
                  message={problem}
                  title="Problem aplikacji"
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
            onCommandAction={handleCommandAction}
            onNavigate={navigateInsideShell}
            onOpenChange={(open) => setOverlay(open ? 'command' : null)}
            open={overlay === 'command'}
          />

          <OperationCenter
            onOpenChange={(open) => setOverlay(open ? 'operations' : null)}
            open={overlay === 'operations'}
            operations={operations}
          />

          <PapaAssistantSidecar
            onNavigate={navigateInsideShell}
            onOpenChange={(open) => setOverlay(open ? 'papa-assistant' : null)}
            open={overlay === 'papa-assistant'}
            request={papaAssistantRequest}
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
        </PapaAssistantRuntimeProvider>
      </PapaScreenContextProvider>
    </ShellDateRangeContext.Provider>
  );
}

function createPapaAssistantRequest(
  request: Omit<PapaAssistantOpenRequest, 'id'>,
): PapaAssistantOpenRequest {
  return {
    ...request,
    id: `papa-request-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
}

function buildPapaAssistantRequest(
  detail: unknown,
): PapaAssistantOpenRequest {
  if (!isRecord(detail)) {
    return createPapaAssistantRequest({
      action: 'open',
      mode: 'screen',
    });
  }

  const action = resolvePapaAssistantAction(detail.action);
  const explicitMode = resolvePapaAssistantMode(detail.mode);
  const elementId = typeof detail.elementId === 'string'
    ? detail.elementId
    : null;

  return createPapaAssistantRequest({
    action,
    elementId,
    mode: explicitMode ?? resolvePapaAssistantModeForAction(action),
  });
}

function resolvePapaAssistantAction(
  value: unknown,
): PapaAssistantOpenRequest['action'] {
  switch (value) {
    case 'analyze-screen':
    case 'open-element':
    case 'report':
      return value;
    case 'open':
    default:
      return 'open';
  }
}

function resolvePapaAssistantMode(
  value: unknown,
): PapaAssistantOpenRequest['mode'] {
  switch (value) {
    case 'element':
    case 'report':
    case 'screen':
      return value;
    default:
      return null;
  }
}

function resolvePapaAssistantModeForAction(
  action: PapaAssistantOpenRequest['action'],
): PapaAssistantOpenRequest['mode'] {
  switch (action) {
    case 'open-element':
      return 'element';
    case 'report':
      return 'report';
    case 'analyze-screen':
    case 'open':
    default:
      return 'screen';
  }
}

function readInitialSidebarCollapsed(
  controlledValue: boolean | undefined,
): boolean {
  if (typeof controlledValue === 'boolean') {
    return controlledValue;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(
      shellSidebarCollapsedStorageKey,
    );

    if (!raw) {
      return false;
    }

    const parsed = JSON.parse(raw) as unknown;

    return parsed === true
      || (
        isRecord(parsed)
        && parsed.collapsed === true
      );
  } catch {
    return false;
  }
}

function writeStoredSidebarCollapsed(collapsed: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      shellSidebarCollapsedStorageKey,
      JSON.stringify({ collapsed }),
    );
  } catch {
    // Sidebar preference is progressive enhancement only.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function resolveShellSectionLabel(
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
