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
  Icon,
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

const shellSidebarCollapsedStorageKey = 'papadata.shell-sidebar-collapsed.v1';

const fallbackShellUser: ShellUser = {
  displayName: 'Użytkownik PapaData',
  email: 'Aktywna sesja',
  role: 'Użytkownik',
};

type NotificationMutation = (
  notification: ShellNotification,
) => void | Promise<void>;

export type ProductShellFrameProps = {
  readonly activePath: string;
  readonly activeTenantId?: string | null;
  readonly activeUserId?: string | null;
  readonly activeWorkspaceId?: string | null;
  readonly children: ReactNode;
  readonly commands?: readonly ShellCommandResult[];
  readonly initialOverlay?: ShellOverlay;
  readonly loggingOut?: boolean;
  readonly navigationGroups?: readonly ShellNavigationGroup[];
  readonly notificationError?: string | null;
  readonly notificationUnreadCount?: number;
  readonly notifications?: readonly ShellNotification[];
  readonly onLogout?: () => void;
  readonly onMarkAllNotificationsRead?: (() => void | Promise<void>) | undefined;
  readonly onMarkNotificationRead?: NotificationMutation | undefined;
  readonly onMarkNotificationUnread?: NotificationMutation | undefined;
  readonly onNavigate?: ShellNavigate;
  readonly onOperationAction?: ((operation: ShellOperation) => void) | undefined;
  readonly onSelectWorkspace?: ((workspaceId: string) => void | Promise<void>) | undefined;
  readonly onSnoozeNotification?: ((notification: ShellNotification, until: string) => void | Promise<void>) | undefined;
  readonly onUnsnoozeNotification?: NotificationMutation | undefined;
  readonly operationError?: string | null;
  readonly operations?: readonly ShellOperation[];
  readonly problem?: string | null;
  readonly sidebarCollapsed?: boolean;
  readonly sidebarDense?: boolean;
  readonly user?: ShellUser;
  readonly workspaceError?: string | null;
  readonly workspacePending?: boolean;
  readonly workspaces?: readonly ShellWorkspace[];
};

export function ProductShellFrame({
  activePath,
  activeTenantId = null,
  activeUserId = null,
  activeWorkspaceId = null,
  children,
  commands = [],
  initialOverlay = null,
  loggingOut = false,
  navigationGroups = [],
  notificationError = null,
  notificationUnreadCount = 0,
  notifications = [],
  onLogout = () => undefined,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  onMarkNotificationUnread,
  onNavigate = () => undefined,
  onOperationAction,
  onSelectWorkspace,
  onSnoozeNotification,
  onUnsnoozeNotification,
  operationError = null,
  operations = [],
  problem = null,
  sidebarCollapsed,
  sidebarDense = false,
  user = fallbackShellUser,
  workspaceError = null,
  workspacePending = false,
  workspaces = [],
}: ProductShellFrameProps) {
  const [overlay, setOverlay] = useState<ShellOverlay>(initialOverlay);
  const [papaAssistantRequest, setPapaAssistantRequest] = useState<PapaAssistantOpenRequest | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => readInitialSidebarCollapsed(sidebarCollapsed),
  );
  const [heightForcesRail, setHeightForcesRail] = useState(false);
  const [dateRange, setDateRange] = useState(createInitialShellDateRange);
  const effectiveSidebarCollapsed = isSidebarCollapsed || heightForcesRail;
  const dateRangeKey = getShellDateRangeKey(dateRange);
  const dateRangeContext = useMemo(() => ({
    dateRange,
    dateRangeKey,
    setDateRange,
  }), [dateRange, dateRangeKey]);
  const papaAvailable = useMemo(() => navigationGroups.some((group) => (
    group.items.some((item) => item.id === 'papa' && !item.disabled)
  )), [navigationGroups]);

  useEffect(() => {
    setOverlay(initialOverlay);
  }, [initialOverlay]);

  useEffect(() => {
    if (typeof sidebarCollapsed === 'boolean') {
      setIsSidebarCollapsed(sidebarCollapsed);
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const query = window.matchMedia('(max-height: 760px) and (min-width: 1101px)');
    const update = () => setHeightForcesRail(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const updateSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    writeStoredSidebarCollapsed(collapsed);
  }, []);

  useEffect(() => {
    document.body.classList.add('pd-product-shell-scroll-lock');
    return () => document.body.classList.remove('pd-product-shell-scroll-lock');
  }, []);

  useEffect(() => {
    writeStoredShellDateRange(dateRange);
  }, [dateRange]);

  useEffect(() => {
    function handleCommandShortcut(event: KeyboardEvent) {
      if (
        event.key.toLowerCase() !== 'k'
        || (!event.ctrlKey && !event.metaKey)
        || isEditableTarget(event.target)
      ) return;

      event.preventDefault();
      setOverlay('command');
    }

    document.addEventListener('keydown', handleCommandShortcut);
    return () => document.removeEventListener('keydown', handleCommandShortcut);
  }, []);

  useEffect(() => {
    function handlePapaAssistantRequest(event: Event) {
      if (!papaAvailable) return;
      const detail = event instanceof CustomEvent ? event.detail : null;
      setPapaAssistantRequest(buildPapaAssistantRequest(detail));
      setOverlay('papa-assistant');
    }

    window.addEventListener('papadata:papa-assistant', handlePapaAssistantRequest);
    return () => window.removeEventListener('papadata:papa-assistant', handlePapaAssistantRequest);
  }, [papaAvailable]);

  function closeOverlay() {
    setOverlay(null);
  }

  function navigateInsideShell(path: string) {
    closeOverlay();
    onNavigate(path);
  }

  function handleCommandAction(action: ShellCommandAction) {
    if (!papaAvailable) return;

    if (action === 'open-papa') {
      setPapaAssistantRequest(createPapaAssistantRequest({ action: 'open', mode: 'screen' }));
      setOverlay('papa-assistant');
      return;
    }

    if (action === 'analyze-screen') {
      setPapaAssistantRequest(createPapaAssistantRequest({ action: 'analyze-screen', mode: 'screen' }));
      setOverlay('papa-assistant');
    }
  }

  const activeOperationCount = operations.filter((item) => (
    item.status === 'running'
    || item.status === 'queued'
    || item.status === 'failed'
  )).length;
  const selectedWorkspace = workspaces.find((workspace) => (
    workspace.id === activeWorkspaceId
  )) ?? workspaces[0] ?? null;
  const sectionLabel = resolveShellSectionLabel(activePath, navigationGroups);

  return (
    <ShellDateRangeContext.Provider value={dateRangeContext}>
      <PapaScreenContextProvider
        activePath={activePath}
        dateRange={dateRange}
        dateRangeLabel={formatShellDateRangeLabel(dateRange)}
        sectionLabel={sectionLabel}
        userLabel={user.displayName}
        workspaceId={selectedWorkspace?.id ?? activeWorkspaceId}
        workspaceName={selectedWorkspace?.name ?? 'Workspace'}
      >
        <PapaAssistantRuntimeProvider
          scope={{
            tenantId: activeTenantId,
            userId: activeUserId ?? user.email,
            workspaceId: selectedWorkspace?.id ?? activeWorkspaceId,
          }}
        >
          <div className="pd-product-shell">
            <AuthenticatedTopbar
              activeOverlay={overlay}
              activePath={activePath}
              dateRange={dateRange}
              loggingOut={loggingOut}
              navigationGroups={navigationGroups}
              notificationError={notificationError}
              notificationUnreadCount={notificationUnreadCount}
              notifications={notifications}
              onDateRangeChange={setDateRange}
              onLogout={onLogout}
              onMarkAllNotificationsRead={onMarkAllNotificationsRead}
              onMarkNotificationRead={onMarkNotificationRead}
              onMarkNotificationUnread={onMarkNotificationUnread}
              onNavigate={navigateInsideShell}
              onOpenOverlay={setOverlay}
              onSnoozeNotification={onSnoozeNotification}
              onUnsnoozeNotification={onUnsnoozeNotification}
              operationCount={activeOperationCount}
              papaAssistantOpen={overlay === 'papa-assistant'}
              user={user}
            />

            <div
              className="pd-product-shell__body"
              data-sidebar-collapsed={effectiveSidebarCollapsed ? true : undefined}
            >
              <div
                className="pd-product-shell__sidebar-column"
                data-collapsed={effectiveSidebarCollapsed ? true : undefined}
                data-height-rail={heightForcesRail ? true : undefined}
              >
                <Sidebar
                  activePath={activePath}
                  collapsed={effectiveSidebarCollapsed}
                  dense={sidebarDense || heightForcesRail}
                  groups={navigationGroups}
                  onNavigate={navigateInsideShell}
                />

                <section
                  aria-label="Kontekst workspace"
                  className="pd-product-shell__sidebar-footer"
                >
                  <WorkspaceSwitcher
                    activeWorkspaceId={activeWorkspaceId}
                    collapsed={effectiveSidebarCollapsed}
                    error={workspaceError}
                    onCreateWorkspace={() => navigateInsideShell('/app/settings/organizacja')}
                    onSelectWorkspace={onSelectWorkspace}
                    pending={workspacePending}
                    workspaces={workspaces}
                  />

                  {!heightForcesRail ? (
                    <button
                      aria-label={
                        effectiveSidebarCollapsed
                          ? 'Rozwiń nawigację'
                          : 'Zwiń nawigację'
                      }
                      aria-pressed={!effectiveSidebarCollapsed}
                      className="pd-product-shell__sidebar-footer-toggle"
                      onClick={() => updateSidebarCollapsed(!effectiveSidebarCollapsed)}
                      type="button"
                    >
                      <Icon decorative name="menu" size={20} />
                      <span>
                        {effectiveSidebarCollapsed ? 'Rozwiń' : 'Zwiń'}
                      </span>
                    </button>
                  ) : null}
                </section>
              </div>

              <main className="pd-product-shell__content">
                {problem ? (
                  <InlineNotice
                    message={problem}
                    title="Problem aplikacji"
                    tone="warning"
                  />
                ) : null}

                <div
                  className="pd-product-shell__content-region"
                  key={activeWorkspaceId ?? 'no-workspace'}
                >
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
              error={operationError}
              onAction={onOperationAction}
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
              className="pd-product-shell__mobile-navigation-drawer"
              description="Mobilna nawigacja produktu z focus restore i zamknięciem Escape."
              dismissible
              onOpenChange={(open) => setOverlay(open ? 'mobile-navigation' : null)}
              open={overlay === 'mobile-navigation'}
              side="left"
              title="Nawigacja"
              width={340}
            >
              <div className="pd-product-shell__mobile-drawer">
                <Sidebar
                  activePath={activePath}
                  groups={navigationGroups}
                  onNavigate={navigateInsideShell}
                />

                <section
                  aria-label="Kontekst workspace"
                  className="pd-product-shell__sidebar-footer pd-product-shell__sidebar-footer--mobile"
                >
                  <WorkspaceSwitcher
                    activeWorkspaceId={activeWorkspaceId}
                    error={workspaceError}
                    onCreateWorkspace={() => navigateInsideShell('/app/settings/organizacja')}
                    onSelectWorkspace={onSelectWorkspace}
                    pending={workspacePending}
                    workspaces={workspaces}
                  />
                </section>
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

function buildPapaAssistantRequest(detail: unknown): PapaAssistantOpenRequest {
  if (!isRecord(detail)) {
    return createPapaAssistantRequest({ action: 'open', mode: 'screen' });
  }

  const action = resolvePapaAssistantAction(detail.action);
  const explicitMode = resolvePapaAssistantMode(detail.mode);
  const elementId = typeof detail.elementId === 'string' ? detail.elementId : null;

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

function readInitialSidebarCollapsed(controlledValue: boolean | undefined): boolean {
  if (typeof controlledValue === 'boolean') return controlledValue;
  if (typeof window === 'undefined') return false;

  try {
    const raw = window.localStorage.getItem(shellSidebarCollapsedStorageKey);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as unknown;
    return parsed === true || (isRecord(parsed) && parsed.collapsed === true);
  } catch {
    return false;
  }
}

function writeStoredSidebarCollapsed(collapsed: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      shellSidebarCollapsedStorageKey,
      JSON.stringify({ collapsed }),
    );
  } catch {
    // Sidebar preference is progressive enhancement only.
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable
    || target.tagName === 'INPUT'
    || target.tagName === 'TEXTAREA'
    || target.tagName === 'SELECT';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function resolveShellSectionLabel(
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
