import type {
  ReactNode,
} from 'react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useSession } from '../app/providers';
import { ErrorBoundary } from '../app/ErrorBoundary';
import {
  navigate,
  useLocationPath,
} from '../app/routing/navigation';
import {
  bffClient,
} from '../shared/api/bffClient';
import type {
  BffIntegrationJob,
  BffNotification,
  BffSession,
} from '../shared/api/bffClient';
import {
  createRuntimeShellCommands,
  createRuntimeShellNavigation,
  ProductShellFrame,
} from './app-shell';
import type {
  ShellNotification,
  ShellNotificationCategory,
  ShellNotificationPriority,
  ShellOperation,
  ShellOperationAction,
  ShellTone,
} from './app-shell';

export function AppShell({
  children,
}: {
  readonly children: ReactNode;
}) {
  const {
    logout,
    selectWorkspace,
    session,
    user,
  } = useSession();
  const activePath = useLocationPath().split('?')[0] || '/app';
  const [loggingOut, setLoggingOut] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [workspacePending, setWorkspacePending] = useState(false);
  const [notifications, setNotifications] = useState<readonly ShellNotification[]>([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [operations, setOperations] = useState<readonly ShellOperation[]>([]);
  const [operationError, setOperationError] = useState<string | null>(null);

  const activeMembership = session?.memberships.find((membership) => (
    membership.workspaceId === session.activeWorkspaceId
  ));
  const activeCapabilities = useMemo(
    () => activeMembership?.capabilities ?? session?.capabilities ?? [],
    [activeMembership?.capabilities, session?.capabilities],
  );
  const role = activeMembership?.roles[0] ?? 'Użytkownik';

  const navigationGroups = useMemo(
    () => createRuntimeShellNavigation(activeCapabilities),
    [activeCapabilities],
  );
  const commands = useMemo(
    () => createRuntimeShellCommands(navigationGroups),
    [navigationGroups],
  );
  const workspaces = session?.memberships.map((membership, index) => ({
    capabilities: membership.capabilities,
    id: membership.workspaceId,
    name: membership.workspaceName ?? `Workspace ${index + 1}`,
    role: membership.roles[0] ?? 'Użytkownik',
    statusText: membership.workspaceId === session.activeWorkspaceId ? 'Aktywny' : 'Dostępny',
    tone: membership.workspaceId === session.activeWorkspaceId ? 'success' as const : 'neutral' as const,
  })) ?? [];

  const loadNotifications = useCallback(async () => {
    if (!session?.activeWorkspaceId) {
      setNotifications([]);
      setNotificationUnreadCount(0);
      return;
    }

    try {
      const result = await bffClient.readNotifications('all');
      setNotifications(result.notifications.map(mapNotification));
      setNotificationUnreadCount(result.unreadCount);
      setNotificationError(null);
    } catch (cause) {
      setNotificationError(errorMessage(cause, 'Nie udało się odczytać powiadomień.'));
    }
  }, [session?.activeWorkspaceId]);

  const loadOperations = useCallback(async () => {
    if (!session?.activeWorkspaceId || !canReadIntegrationJobs(activeCapabilities)) {
      setOperations([]);
      setOperationError(null);
      return;
    }

    try {
      const jobs = await bffClient.readIntegrationJobs();
      setOperations(jobs.map((job) => mapIntegrationJob(job, activeCapabilities)));
      setOperationError(null);
    } catch (cause) {
      setOperationError(errorMessage(cause, 'Nie udało się odczytać operacji w tle.'));
    }
  }, [activeCapabilities, session?.activeWorkspaceId]);

  useEffect(() => {
    void loadNotifications();
    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    void loadOperations();
    const interval = window.setInterval(() => {
      void loadOperations();
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [loadOperations]);

  async function handleLogout() {
    setLoggingOut(true);
    setProblem(null);
    try {
      await logout();
      navigate('/login?loggedOut=1', { replace: true });
    } catch (cause) {
      setProblem(errorMessage(cause, 'Nie udało się wylogować.'));
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleSelectWorkspace(workspaceId: string) {
    if (!session || workspaceId === session.activeWorkspaceId) return;
    setWorkspacePending(true);
    setWorkspaceError(null);
    try {
      const nextSession = await selectWorkspace(workspaceId);
      preserveOrFallbackRoute(activePath, nextSession);
    } catch (cause) {
      setWorkspaceError(errorMessage(cause, 'Nie udało się zmienić workspace.'));
      throw cause;
    } finally {
      setWorkspacePending(false);
    }
  }

  async function handleNotificationMutation(
    action: () => Promise<void>,
  ) {
    await action();
    await loadNotifications();
  }

  async function handleOperationAction(
    operation: ShellOperation,
  ) {
    if (!operation.action) return;
    setOperationError(null);
    try {
      if (operation.action === 'retry') {
        await bffClient.retryIntegrationJob(operation.id);
      } else {
        await bffClient.cancelIntegrationJob(operation.id);
      }
      await loadOperations();
    } catch (cause) {
      setOperationError(errorMessage(cause, 'Nie udało się wykonać akcji operacji.'));
    }
  }

  return (
    <ProductShellFrame
      activePath={activePath}
      activeTenantId={session?.activeTenantId}
      activeUserId={session?.userId}
      activeWorkspaceId={session?.activeWorkspaceId}
      commands={commands}
      loggingOut={loggingOut}
      navigationGroups={navigationGroups}
      notificationError={notificationError}
      notificationUnreadCount={notificationUnreadCount}
      notifications={notifications}
      onLogout={() => void handleLogout()}
      onMarkAllNotificationsRead={() => handleNotificationMutation(
        () => bffClient.markAllNotificationsRead(),
      )}
      onMarkNotificationRead={(notification) => handleNotificationMutation(
        () => bffClient.markNotificationRead(notification.id),
      )}
      onMarkNotificationUnread={(notification) => handleNotificationMutation(
        () => bffClient.markNotificationUnread(notification.id),
      )}
      onNavigate={navigate}
      onOperationAction={(operation) => void handleOperationAction(operation)}
      onSelectWorkspace={(workspaceId) => handleSelectWorkspace(workspaceId)}
      onSnoozeNotification={(notification, until) => handleNotificationMutation(
        () => bffClient.snoozeNotification(notification.id, until),
      )}
      onUnsnoozeNotification={(notification) => handleNotificationMutation(
        () => bffClient.unsnoozeNotification(notification.id),
      )}
      operationError={operationError}
      operations={operations}
      problem={problem}
      user={{
        displayName: user?.displayName ?? 'Użytkownik PapaData',
        email: user?.email ?? session?.userId ?? 'Aktywna sesja',
        role,
      }}
      workspaceError={workspaceError}
      workspacePending={workspacePending}
      workspaces={workspaces}
    >
      <ErrorBoundary
        description="Ten ekran napotkał nieoczekiwany błąd renderowania. Spróbuj ponownie lub przejdź do innego miejsca w aplikacji z nawigacji."
        errorCode="SCREEN_RUNTIME_CRASH"
        title="Nie udało się wyświetlić tego ekranu"
      >
        {children}
      </ErrorBoundary>
    </ProductShellFrame>
  );
}

function mapNotification(notification: BffNotification): ShellNotification {
  const priority = normalizePriority(notification.priority);
  const category = notificationCategory(notification.type);
  const route = notificationRoute(notification.type);

  return {
    actionLabel: route ? 'Otwórz kontekst' : null,
    actionPath: route,
    canSnooze: priority !== 'critical',
    category,
    createdAt: notification.createdAt,
    id: notification.id,
    message: notification.message,
    priority,
    readAt: notification.readAt,
    snoozedUntil: notification.snoozedUntil,
    time: relativeTime(notification.createdAt),
    title: notification.title,
    tone: notificationTone(priority, notification.type),
    unread: notification.status === 'unread',
  };
}

function normalizePriority(priority: string): ShellNotificationPriority {
  return priority === 'critical' || priority === 'high' ? priority : 'medium';
}

function notificationCategory(type: string): ShellNotificationCategory {
  if (type.includes('sync')) return 'integrations';
  if (type.includes('report')) return 'reports';
  if (type.includes('plan_limit')) return 'billing';
  if (type.includes('approval')) return 'support';
  if (
    type.includes('readiness')
    || type.includes('stale')
    || type.includes('inventory')
    || type.includes('returns')
  ) return 'data';
  return 'system';
}

function notificationRoute(type: string): string | null {
  if (type === 'plan_limit_reached') return '/app/billing/subskrypcja';
  if (type === 'approval_required') return '/app/decisions/centrum-decyzji';
  if (
    type === 'readiness_blocked'
    || type === 'stale_data'
    || type === 'high_returns'
    || type === 'inventory_shortage_risk'
    || type === 'report_ready'
  ) return '/app/command-center';
  return null;
}

function notificationTone(
  priority: ShellNotificationPriority,
  type: string,
): ShellTone {
  if (priority === 'critical') return 'critical';
  if (type === 'report_ready') return 'success';
  return priority === 'high' ? 'warning' : 'info';
}

function relativeTime(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return value;
  const delta = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 1) return 'przed chwilą';
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.floor(hours / 24);
  return `${days} dni temu`;
}

function canReadIntegrationJobs(capabilities: readonly string[]) {
  return capabilities.some((capability) => [
    'integrations.jobs.read',
    'integrations.read',
    'integrations.manage',
  ].includes(capability));
}

function canManageIntegrationJobs(capabilities: readonly string[]) {
  return capabilities.some((capability) => [
    'integrations.jobs.manage',
    'integrations.manage',
  ].includes(capability));
}

function mapIntegrationJob(
  job: BffIntegrationJob,
  capabilities: readonly string[],
): ShellOperation {
  const id = readString(job, 'id') ?? readString(job, 'sync_job_id') ?? 'unknown-job';
  const rawStatus = readString(job, 'status') ?? 'queued';
  const status = operationStatus(rawStatus);
  const provider = readString(job, 'provider_id') ?? readString(job, 'providerId') ?? 'Integracja';
  const jobKind = readString(job, 'job_kind') ?? readString(job, 'jobKind') ?? readString(job, 'operation') ?? 'synchronizacja';
  const streams = readStringArray(job, 'streams');
  const action = operationAction(status, canManageIntegrationJobs(capabilities));
  const progress = readNumber(job, 'progress');
  const startedAt = readString(job, 'started_at') ?? readString(job, 'startedAt') ?? readString(job, 'created_at') ?? null;

  return {
    action,
    actionLabel: action === 'retry' ? 'Ponów' : action === 'cancel' ? 'Anuluj' : null,
    description: streams.length > 0
      ? `${jobKindLabel(jobKind)} · ${streams.join(', ')}`
      : jobKindLabel(jobKind),
    errorCode: readString(job, 'error_code') ?? readString(job, 'errorCode'),
    id,
    progress: progress !== null ? Math.max(0, Math.min(100, progress)) : null,
    startedAt: startedAt ? formatShortDate(startedAt) : null,
    status,
    statusText: operationStatusLabel(rawStatus),
    title: `${providerLabel(provider)} — ${jobKindLabel(jobKind)}`,
  };
}

function operationStatus(rawStatus: string): ShellOperation['status'] {
  if (['failed', 'dlq'].includes(rawStatus)) return 'failed';
  if (['cancelled', 'cancel_requested'].includes(rawStatus)) return 'cancelled';
  if (['succeeded', 'recovered', 'partial_success'].includes(rawStatus)) return 'completed';
  if (['queued', 'rate_limited'].includes(rawStatus)) return 'queued';
  return 'running';
}

function operationAction(
  status: ShellOperation['status'],
  canManage: boolean,
): ShellOperationAction | null {
  if (!canManage) return null;
  if (status === 'failed') return 'retry';
  if (status === 'running' || status === 'queued') return 'cancel';
  return null;
}

function operationStatusLabel(rawStatus: string) {
  const labels: Record<string, string> = {
    cancel_requested: 'Anulowanie…',
    cancelled: 'Anulowane',
    dlq: 'Wymaga interwencji',
    failed: 'Błąd',
    fetching: 'Pobieranie',
    leased: 'Uruchamianie',
    normalizing: 'Normalizacja',
    partial_success: 'Częściowo zakończone',
    persisting_source: 'Zapis źródła',
    queued: 'W kolejce',
    rate_limited: 'Oczekiwanie na limit',
    recovered: 'Odzyskane',
    reconciling: 'Uzgadnianie',
    running: 'W toku',
    succeeded: 'Zakończone',
    writing_canonical: 'Zapis danych',
  };
  return labels[rawStatus] ?? rawStatus;
}

function providerLabel(provider: string) {
  const labels: Record<string, string> = {
    allegro: 'Allegro',
    baselinker: 'BaseLinker',
    ga4: 'Google Analytics 4',
    google_ads: 'Google Ads',
    meta_ads: 'Meta Ads',
    shopify: 'Shopify',
    woocommerce: 'WooCommerce',
  };
  return labels[provider] ?? provider;
}

function jobKindLabel(kind: string) {
  const labels: Record<string, string> = {
    backfill: 'Backfill',
    incremental_sync: 'Synchronizacja przyrostowa',
    initial_sync: 'Synchronizacja początkowa',
    recovery: 'Odzyskiwanie',
    retry: 'Ponowienie synchronizacji',
  };
  return labels[kind] ?? kind.replaceAll('_', ' ');
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(date);
}

function preserveOrFallbackRoute(
  activePath: string,
  session: BffSession,
) {
  const navigation = createRuntimeShellNavigation(session.capabilities);
  const available = navigation.flatMap((group) => group.items).filter((item) => !item.disabled);
  const currentStillAvailable = available.some((item) => (
    activePath === item.path || activePath.startsWith(`${item.path}/`)
  ));
  if (currentStillAvailable) return;
  navigate(available[0]?.path ?? '/app/command-center', { replace: true });
}

function readString(record: Readonly<Record<string, unknown>>, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function readNumber(record: Readonly<Record<string, unknown>>, key: string): number | null {
  const value = record[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readStringArray(record: Readonly<Record<string, unknown>>, key: string): readonly string[] {
  const value = record[key];
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : [];
}

function errorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
