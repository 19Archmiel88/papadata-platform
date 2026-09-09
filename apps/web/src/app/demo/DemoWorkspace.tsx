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
} from '../../fixtures/command-center/commandCenterDemoSeed';
const Overview=lazy(()=>import('../../fixtures/commerce/CommerceScenarios').then(m=>({default:m.OverviewScenario})));

const CampaignGrowth = lazy(() => import('./GrowthPreview'));
const Orders = lazy(() =>
  import('../../fixtures/commerce/CommerceScenarios').then((m) => ({ default: m.OrdersScenario })),
);
const Products = lazy(() =>
  import('../../fixtures/commerce/CommerceScenarios').then((m) => ({ default: m.ProductsScenario })),
);
const Customers = lazy(async () => {
  const [{ CustomerPortfolioView }, { customerPortfolioFixture }] = await Promise.all([
    import('../../screens/customers/CustomerPortfolioView'), import('../../fixtures/customers/customerPortfolioFixture'),
  ]);
  return { default: () => <CustomerPortfolioView data={customerPortfolioFixture} demo /> };
});
const Traffic = lazy(async () => {
  const [{ TrafficPortfolioView }, { trafficPortfolioFixture }] = await Promise.all([
    import('../../screens/traffic/TrafficPortfolioView'), import('../../fixtures/traffic/trafficPortfolioFixture'),
  ]);
  return { default: () => <TrafficPortfolioView data={trafficPortfolioFixture} demo /> };
});
const Decisions = lazy(() =>
  import('../../screens/decisions/DecisionsScreen').then((m) => ({
    default: m.DecisionsScreen,
  })),
);
const Settings = lazy(() => import('../../fixtures/platform-operations/OperationsScenarios').then(m=>({default:m.SettingsOperationsDemo})));
const Quality = lazy(() => import('../../fixtures/platform-operations/OperationsScenarios').then(m=>({default:m.QualityOperationsDemo})));
const Help = lazy(() =>
  import('../../screens/help-center/HelpCenterView').then((m) => ({
    default: m.HelpCenterView,
  })),
);
const Papa = lazy(() =>
  import('../../fixtures/saved-reports/SavedReportsDemo').then((m) => ({
    default: m.SavedReportsDemo,
  })),
);
const Billing = lazy(() => import('../../fixtures/platform-operations/OperationsScenarios').then(m=>({default:m.BillingOperationsDemo})));
const Integrations = lazy(() => import('../../fixtures/platform-operations/IntegrationOperationsDemo').then(m=>({default:m.IntegrationOperationsDemo})));

const views = {
  '/app/campaigns': CampaignGrowth,
  '/app/campaigns/growth': CampaignGrowth,
  '/app/campaigns/atrybucja-i-sprzedaz': CampaignGrowth,
  '/app/campaigns/kreacje': CampaignGrowth,
  '/app/campaigns/budzet': CampaignGrowth,
  '/app/campaigns/przeglad': CampaignGrowth,
  '/app/orders': Orders,
  '/app/products': Products,
  '/app/customers': Customers,
  '/app/traffic': Traffic,
  '/app/decisions': Decisions,
  '/app/decisions/centrum-decyzji': Decisions,
  '/app/settings': Settings,
  '/app/settings/organizacja': Settings,
  '/app/data-quality': Quality,
  '/app/help': Help,
  '/app/help/strona-glowna-pomocy': Help,
  '/app/reports': Papa,
  '/app/papa/raporty': Papa,
  '/app/papa': Papa,
  '/app/billing': Billing,
  '/app/billing/subskrypcja': Billing,
  '/app/integrations': Integrations,
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
  const View = views[path as keyof typeof views]??(path.startsWith('/app/orders/')?Orders:path.startsWith('/app/products/')?Products:null);
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
          <Overview />
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
