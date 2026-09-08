import { PapaAssistantExperience } from '../../runtime/shell/papa-assistant/PapaAssistantExperience';
import { isAssistantPath } from '../../runtime/shell/papa-assistant/assistantModel';
import { lazy, Suspense } from 'react';
import {
  ProductShellFrame,
  defaultShellNavigation,
  defaultShellUser,
  defaultShellWorkspaces,
  createRuntimeShellCommands,
} from '../../runtime/shell';
import { navigate, useLocationPath } from '../../runtime/app/routing/navigation';
import {
  commandCenterDemoRange,
  commandCenterDemoSeed,
} from '../../fixtures/command-center/commandCenterDemoSeed';
import { CommandCenterScreen } from '../../screens/command-center/CommandCenterScreen';

const Campaigns = lazy(() =>
  import('../../screens/paid-campaigns/PaidCampaignsScreen').then((m) => ({
    default: m.PaidCampaignsScreen,
  })),
);
const Orders = lazy(() =>
  import('../../screens/orders/OrdersScreen').then((m) => ({ default: m.OrdersScreen })),
);
const Products = lazy(() =>
  import('../../screens/products/ProductsScreen').then((m) => ({ default: m.ProductsScreen })),
);
const Customers = lazy(() =>
  import('../../screens/customers/CustomersScreen').then((m) => ({ default: m.CustomersScreen })),
);
const Traffic = lazy(() =>
  import('../../screens/traffic/TrafficScreen').then((m) => ({ default: m.TrafficScreen })),
);
const Decisions = lazy(() =>
  import('../../screens/decisions/DecisionsScreen').then((m) => ({
    default: m.DecisionsScreen,
  })),
);
const Settings = lazy(() =>
  import('../../screens/settings-governance/SettingsGovernanceScreen').then((m) => ({
    default: m.SettingsGovernanceScreen,
  })),
);
const Help = lazy(() =>
  import('../../screens/help-center/HelpCenterScreen').then((m) => ({
    default: m.HelpCenterScreen,
  })),
);
const Papa = lazy(() =>
  import('../../screens/saved-reports/SavedReportsScreen').then((m) => ({
    default: m.SavedReportsScreen,
  })),
);
const Billing = lazy(async () => {
  const [{ SubscriptionBillingScreen }, { subscriptionBillingDemoSeed }] = await Promise.all([
    import('../../screens/subscription-billing/SubscriptionBillingScreen'),
    import('../../fixtures/subscription-billing/subscriptionBillingDemoSeed'),
  ]);
  return { default: () => <SubscriptionBillingScreen data={subscriptionBillingDemoSeed} /> };
});
const Integrations = lazy(async () => {
  const [{ IntegrationsWorkspace }, { createIntegrationsRuntimeFallbackData }] = await Promise.all([
    import('../../runtime/integrations/IntegrationsWorkspace'),
    import('../../runtime/integrations/integrationsData'),
  ]);
  return {
    // Same no-op simulation Storybook's own story-support uses (see
    // Integrations.story-support.tsx) -- /preview has no session to call
    // real operations against, but passing these means every action button
    // (connect, test, disconnect, sync/backfill) actually completes instead
    // of silently doing nothing when the handler prop is left undefined.
    default: () => (
      <IntegrationsWorkspace
        mode="storybook"
        runtime={createIntegrationsRuntimeFallbackData()}
        onCreateConnection={async () => {}}
        onDisconnectConnection={async () => {}}
        onProviderTest={async (provider) => ({
          canSave: provider.connectable,
          formValidation: {
            fieldErrors: {},
            message: 'Dane mają poprawny format.',
            status: 'passed',
          },
          provider: provider.provider,
          providerTest: {
            message: provider.connectable
              ? 'Połączenie z API dostawcy zostało zwalidowane pomyślnie.'
              : 'Readiness providera blokuje test produkcyjny.',
            status: provider.connectable ? 'passed' : 'failed',
          },
        })}
        onSourceCommand={async () => {}}
      />
    ),
  };
});

const views = {
  '/app/campaigns': Campaigns,
  '/app/orders': Orders,
  '/app/products': Products,
  '/app/customers': Customers,
  '/app/traffic': Traffic,
  '/app/decisions/centrum-decyzji': Decisions,
  '/app/settings/organizacja': Settings,
  '/app/help/strona-glowna-pomocy': Help,
  '/app/papa': Papa,
  '/app/billing/subskrypcja': Billing,
  '/app/integrations/sources': Integrations,
};
const previewHref = (path: string) => {
  const target = new URL(path, window.location.origin);
  const query = new URLSearchParams(window.location.search);
  target.searchParams.forEach((value, key) => query.set(key, value));
  return target.pathname.replace(/^\/app(?=\/|$)/, '/preview') + (query.size ? `?${query}` : '');
};

/** Development-only composition of the actual product screens; no authentication or API calls are mocked. */
export default function DemoWorkspace() {
  const location = useLocationPath().split('?')[0];
  const path =
    location === '/preview' || location === '/preview/'
      ? '/app/command-center'
      : location.replace(/^\/preview/, '/app');
  const View = views[path as keyof typeof views];
  const go = (target: string) => navigate(previewHref(target));
  const groups = defaultShellNavigation.map((group) => ({
    ...group,
    items: group.items.map((item) => ({ ...item, href: previewHref(item.path) })),
  }));
  return (
    <ProductShellFrame
      papaDemo
      activePath={path}
      activeWorkspaceId="commerce"
      initialDateRange={commandCenterDemoRange}
      navigationGroups={groups}
      commands={createRuntimeShellCommands(groups)}
      workspaces={defaultShellWorkspaces.slice(0, 1)}
      user={defaultShellUser}
      onNavigate={go}
    >
      {path !== '/app/command-center' &&
        path !== '/app/campaigns' &&
        path !== '/app/orders' &&
        path !== '/app/products' &&
        path !== '/app/papa' &&
        path !== '/app/decisions/centrum-decyzji' && (
          <div className="pd-preview-notice" role="note">
            Podgląd produktu · dane przykładowe · połączenia i płatności nie są aktywne
          </div>
        )}
      <Suspense fallback={<p role="status">Wczytywanie widoku…</p>}>
        {isAssistantPath(path) ? (
          <PapaAssistantExperience />
        ) : path === '/app/command-center' ? (
          <CommandCenterScreen data={commandCenterDemoSeed} />
        ) : View ? (
          <View />
        ) : (
          <section>
            <h1>Nie znaleziono strony</h1>
            <p>Ten adres nie odpowiada widokowi PapaData.</p>
            <a href={previewHref('/app/command-center')}>Wróć do przeglądu</a>
          </section>
        )}
      </Suspense>
    </ProductShellFrame>
  );
}
