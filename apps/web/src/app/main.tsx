import { isAssistantPath } from '../runtime/shell/papa-assistant/assistantModel';
import { lazy, StrictMode, Suspense, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

import '../design-system/foundations/foundations.css';
import {
  applyPapaDataRuntimeGlobals,
  getInitialPapaDataRuntimeGlobals,
} from '../design-system/foundations/runtime/index';

import { navigate, useLocationPath } from '../runtime/app/routing/navigation';
import {
  createRuntimeShellCommands,
  createRuntimeShellNavigation,
  ProductShellFrame,
  type ShellUser,
  type ShellWorkspace,
} from '../runtime/shell/index';
import type { AnalyticsModuleGroup } from '../runtime/analytics/analyticsModuleData';
import { bffClient, type BffSession } from '../runtime/shared/api/bffClient';
import {
  AuthSessionRuntimeProvider,
  type AuthSessionRuntime,
  useAuthSessionRuntime,
} from '../runtime/shared/auth/authSessionRuntime';
import './runtime-app.css';

import {isAccessRoute} from './access/accessRoutes';
import {RenderBoundary} from '../runtime/shared/errors/RenderBoundary';
const AccessRouter=lazy(()=>import('./access/AccessRouter').then(module=>({default:module.AccessRouter})));
const DataQualityPage=lazy(()=>import('./data-quality/DataQualityPage').then(module=>({default:module.DataQualityPage})));
const CampaignsPage=lazy(()=>import('./campaigns/CampaignsPage').then(module=>({default:module.CampaignsPage})));
const HelpPage=lazy(()=>import('./help/HelpPage').then(module=>({default:module.HelpPage})));
const DecisionsPage=lazy(()=>import('./decisions/DecisionsPage').then(module=>({default:module.DecisionsPage})));
const TrafficPage=lazy(()=>import('./traffic/TrafficPage').then(module=>({default:module.TrafficPage})));
const CustomersPage=lazy(()=>import('./customers/CustomersPage').then(module=>({default:module.CustomersPage})));
const PapaAssistantExperience=lazy(()=>import('../runtime/shell/papa-assistant/PapaAssistantExperience').then(module=>({default:module.PapaAssistantExperience})));
const CommandCenterPage=lazy(()=>import('./command-center/CommandCenterPage').then(module=>({default:module.CommandCenterPage})));
const AnalyticsModuleScreen=lazy(()=>import('../runtime/analytics/AnalyticsModuleScreen').then(module=>({default:module.AnalyticsModuleScreen})));
const SavedReportsPage=lazy(()=>import('./saved-reports/SavedReportsPage').then(module=>({default:module.SavedReportsPage})));
const SubscriptionBillingPage=lazy(()=>import('./subscription-billing/SubscriptionBillingPage').then(module=>({default:module.SubscriptionBillingPage})));
const IntegrationsPage=lazy(()=>import('./integrations/IntegrationsPage').then(module=>({default:module.IntegrationsPage})));
const SettingsPage=lazy(()=>import('./settings/SettingsPage').then(module=>({default:module.SettingsPage})));
const OrdersPage=lazy(()=>import('./orders/OrdersPage').then(module=>({default:module.OrdersPage})));
const ProductsPage=lazy(()=>import('./products/ProductsPage').then(module=>({default:module.ProductsPage})));

applyPapaDataRuntimeGlobals(document.documentElement, getInitialPapaDataRuntimeGlobals());

const DemoWorkspace = import.meta.env.DEV ? lazy(() => import('./demo/DemoWorkspace')) : null;
function AppEntry() {
  const path = useLocationPath().split('?')[0];
  return DemoWorkspace && (path === '/preview' || path.startsWith('/preview/')) ? (
    <Suspense fallback={<main className="pd-runtime-loading">Wczytywanie podglądu…</main>}>
      <DemoWorkspace />
    </Suspense>
  ) : (
    <RuntimeApp />
  );
}

function RuntimeApp() {
  const locationPath = useLocationPath();
  const runtime = useAuthSessionRuntime(bffClient);
  const authRoute = isAccessRoute(locationPath);

  if (runtime.status === 'initializing') {
    return <main className="pd-runtime-loading">Ładowanie PapaData...</main>;
  }

  const showAuthSurface =
    runtime.status === 'service_unavailable' ||
    runtime.status === 'reauth_required' ||
    authRoute ||
    runtime.status === 'anonymous';

  if (showAuthSurface) {
    return <RenderBoundary key={locationPath.split('?')[0]}><Suspense fallback={<main className="pd-runtime-loading" role="status">Wczytywanie dostępu…</main>}><AccessRouter locationPath={locationPath} runtime={runtime} /></Suspense></RenderBoundary>;
  }

  return runtime.session ? (
    <AuthenticatedRuntimeShell
      key={`${runtime.session.activeTenantId}:${runtime.session.activeWorkspaceId}:${runtime.session.userId}`}
      activePath={locationPath.startsWith('/app') ? locationPath : '/app'}
      runtime={runtime}
      session={runtime.session}
    />
  ) : null;
}

function AuthenticatedRuntimeShell({
  activePath,
  runtime,
  session,
}: {
  readonly activePath: string;
  readonly runtime: AuthSessionRuntime;
  readonly session: BffSession;
}) {
  const navigationGroups = useMemo(
    () => createRuntimeShellNavigation(session.capabilities),
    [session.capabilities],
  );
  const commands = useMemo(() => createRuntimeShellCommands(navigationGroups), [navigationGroups]);
  const analyticsGroup = resolveAnalyticsGroup(activePath);
  const activePathname = activePath.split('?', 1)[0] ?? activePath;

  return (
    <AuthSessionRuntimeProvider value={runtime}>
    <ProductShellFrame
      runPapaCommand={(operation) => runtime.runAuthenticatedCommand(operation, activePath)}
      activePath={activePath}
      activeTenantId={session.activeTenantId}
      activeUserId={session.userId}
      activeWorkspaceId={session.activeWorkspaceId}
      commands={commands}
      navigationGroups={navigationGroups}
      onLogout={async () => {
        // bffClient.logout() ends the local session (and, for an
        // already-expired one, swallows the resulting 401) by publishing
        // a 'logout' event -- the session runtime's subscription reacts
        // to that and transitions to anonymous, including in every other
        // open tab, so no local state needs clearing here.
        await bffClient.logout();
        navigate('/auth/logged-out');
      }}
      onNavigate={navigate}
      onSelectWorkspace={async (workspaceId) => {
        const nextSession = await runtime.runAuthenticatedCommand(
          () => bffClient.selectWorkspace(workspaceId),
          activePath,
        );
        runtime.applySession(nextSession);
      }}
      user={sessionToShellUser(session)}
      workspaces={sessionToShellWorkspaces(session)}
    >
      <RenderBoundary key={activePathname}><Suspense fallback={<section className="pd-runtime-loading" role="status">Wczytywanie widoku…</section>}>
      {isAssistantPath(activePath) ? (
        <PapaAssistantExperience />
      ) : activePathname === '/app/decisions' || activePathname.startsWith('/app/decisions/') ? (
        <DecisionsPage />
      ) : isSavedReportsPath(activePath) ? (
        <SavedReportsPage />
      ) : isSubscriptionBillingPath(activePath) ? (
        <SubscriptionBillingPage />
      ) : activePathname === '/app/data-quality' || activePathname.startsWith('/app/data-quality/') ? (
        <DataQualityPage />
      ) : isIntegrationsPath(activePath) ? (
        <IntegrationsPage />
      ) : isSettingsPath(activePath) ? (
        <SettingsPage />
      ) : isHelpPath(activePath) ? (
        <HelpPage />
      ) : activePathname === '/app' || activePathname === '/app/command-center' ? (
        <CommandCenterPage />
      ) : analyticsGroup === 'campaigns' && ['/app/campaigns','/app/campaigns/growth','/app/campaigns/atrybucja-i-sprzedaz','/app/campaigns/kreacje','/app/campaigns/budzet'].includes(activePathname) ? (
        <CampaignsPage />
      ) : analyticsGroup === 'orders' ? (
        <OrdersPage />
      ) : analyticsGroup === 'products' ? (
        <ProductsPage />
      ) : analyticsGroup === 'customers' ? (
        <CustomersPage />
      ) : analyticsGroup === 'traffic' ? (
        <TrafficPage />
      ) : analyticsGroup ? (
        <AnalyticsModuleScreen group={analyticsGroup} path={activePath} />
      ) : (
        <section>
          <h1>
            {navigationGroups
              .flatMap((group) => group.items)
              .find((item) => item.path === activePath)?.label ?? 'Nie znaleziono strony'}
          </h1>
          <p>Ten widok nie jest dostępny w bieżącym środowisku.</p>
          <a href="/app/command-center">Wróć do przeglądu</a>
        </section>
      )}
      </Suspense></RenderBoundary>
    </ProductShellFrame>
    </AuthSessionRuntimeProvider>
  );
}

function isSavedReportsPath(path: string): boolean {
  const pathname = path.split('?', 1)[0] ?? path;
  return pathname === '/app/papa' || pathname === '/app/reports' || pathname === '/app/papa/raporty';
}

function isSubscriptionBillingPath(path: string): boolean {
  const pathname = path.split('?', 1)[0] ?? path;
  return pathname === '/app/billing' || pathname.startsWith('/app/billing/');
}

function isIntegrationsPath(path: string): boolean {
  const pathname = path.split('?', 1)[0] ?? path;
  return pathname === '/app/integrations' || pathname.startsWith('/app/integrations/');
}

function isSettingsPath(path: string): boolean {
  const pathname = path.split('?', 1)[0] ?? path;
  return pathname === '/app/settings' || pathname.startsWith('/app/settings/');
}

function isHelpPath(path: string): boolean {
  const pathname = path.split('?', 1)[0] ?? path;
  return pathname === '/app/help' || pathname.startsWith('/app/help/');
}

const analyticsGroupRoutePrefixes = {
  campaigns: '/app/campaigns',
  customers: '/app/customers',
  orders: '/app/orders',
  products: '/app/products',
  traffic: '/app/traffic',
} satisfies Record<AnalyticsModuleGroup, `/app/${string}`>;

function resolveAnalyticsGroup(path: string): AnalyticsModuleGroup | null {
  const pathname = path.split('?', 1)[0] ?? path;
  const entry = Object.entries(analyticsGroupRoutePrefixes).find(
    ([, prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return entry ? (entry[0] as AnalyticsModuleGroup) : null;
}

function sessionToShellUser(session: BffSession): ShellUser {
  return {
    displayName: session.user?.displayName ?? 'Użytkownik PapaData',
    email: session.user?.email ?? session.userId,
  };
}

function sessionToShellWorkspaces(session: BffSession): readonly ShellWorkspace[] {
  return session.memberships.map((membership) => ({
    capabilities: membership.capabilities,
    id: membership.workspaceId,
    name: membership.workspaceName ?? membership.workspaceId,
    role: membership.roles[0] ?? 'Użytkownik',
    statusText: 'Aktywny',
    tone: 'success',
  }));
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root mount point.');

createRoot(root).render(
  <StrictMode>
    <AppEntry />
  </StrictMode>,
);
