import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import {
  IntegrationsWorkspace,
} from '../../../runtime/integrations/index';
import {
  createIntegrationsProviderOutageFallbackData,
  createIntegrationsRuntimeFallbackData,
} from '../../../runtime/integrations/integrationsData';
import type {
  IntegrationWorkspaceTabId,
} from '../../../runtime/integrations/integrationsData';

const meta = {
  title: 'INTERNAL STORY SUPPORT/DANE I INTEGRACJE/Integracje',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type ScreenId =
  | 'sources'
  | 'catalog'
  | 'dataQuality'
  | 'workspaceOverview'
  | 'workspaceData'
  | 'workspaceSync'
  | 'workspaceSyncRun'
  | 'workspaceConfig'
  | 'connectWizard'
  | 'reconnectWizard'
  | 'disconnectDialog'
  | 'providerOutage';

type ScreenConfig = {
  readonly area?: 'sources' | 'catalog' | 'data-quality';
  readonly runtime: ReturnType<typeof createIntegrationsRuntimeFallbackData>;
  readonly sourceId?: string;
  readonly workspaceTab?: IntegrationWorkspaceTabId;
};

const defaultRuntime = createIntegrationsRuntimeFallbackData();
const outageRuntime = createIntegrationsProviderOutageFallbackData();
/** BaseLinker is already connected in the default fallback data (5/7 sources) — this variant frees
 * it up so the "Połącz źródło" wizard story can demonstrate a genuine from-scratch connect flow. */
const freshCatalogRuntime = {
  ...defaultRuntime,
  catalog: {
    ...defaultRuntime.catalog,
    providers: defaultRuntime.catalog.providers.map((provider) => (
      provider.provider === 'baselinker' ? { ...provider, connectedCount: 0 } : provider
    )),
  },
};

const screenConfig: Record<ScreenId, ScreenConfig> = {
  catalog: { area: 'catalog', runtime: defaultRuntime },
  connectWizard: { area: 'catalog', runtime: freshCatalogRuntime },
  dataQuality: { area: 'data-quality', runtime: defaultRuntime },
  disconnectDialog: { area: 'sources', runtime: defaultRuntime },
  providerOutage: { runtime: outageRuntime, sourceId: 'src-meta-ads', workspaceTab: 'overview' },
  reconnectWizard: { area: 'sources', runtime: defaultRuntime },
  sources: { area: 'sources', runtime: defaultRuntime },
  workspaceConfig: { runtime: defaultRuntime, sourceId: 'src-woocommerce', workspaceTab: 'config' },
  workspaceData: { runtime: defaultRuntime, sourceId: 'src-woocommerce', workspaceTab: 'data' },
  workspaceOverview: { runtime: defaultRuntime, sourceId: 'src-woocommerce', workspaceTab: 'overview' },
  workspaceSync: { runtime: defaultRuntime, sourceId: 'src-woocommerce', workspaceTab: 'sync' },
  workspaceSyncRun: { runtime: defaultRuntime, sourceId: 'src-google-ads', workspaceTab: 'sync' },
};

function ModuleStoryPage({
  id,
}: {
  readonly id: ScreenId;
}) {
  const config = screenConfig[id];
  return (
    <StorybookProductShellFrame activePath="/app/integrations/sources">
    <IntegrationsWorkspace
      initialArea={config.area}
      initialSourceId={config.sourceId ?? null}
      initialWorkspaceTab={config.workspaceTab}
      mode="storybook"
      runtime={config.runtime}
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
    </StorybookProductShellFrame>
  );
}

function createStory(id: ScreenId): Story {
  return {
    render: () => <ModuleStoryPage id={id} />,
  };
}

export const SourcesStory = {
  ...createStory('sources'),
  name: 'Źródła',
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    await expect(screen.getByRole('navigation', { name: 'Obszary integracji' })).toBeInTheDocument();
    await expect(screen.getByRole('table', { name: 'Źródła danych i jakość danych' })).toBeInTheDocument();
    await expect(screen.getAllByRole('button', { name: 'Otwórz' })[0]).toBeInTheDocument();
    await expect(screen.getAllByRole('button', { name: 'Połącz ponownie' }).length).toBeGreaterThan(0);
  },
} satisfies Story;

export const CatalogStory = {
  ...createStory('catalog'),
  name: 'Katalog',
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    await expect(screen.getByText('Twój zestaw źródeł')).toBeInTheDocument();
    await expect(screen.getAllByText('WooCommerce')[0]).toBeInTheDocument();
    await expect(screen.getAllByRole('button', { name: 'Zarządzaj' })[0]).toBeInTheDocument();
  },
} satisfies Story;

export const DataQualityStory = {
  ...createStory('dataQuality'),
  name: 'Jakość danych',
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    await expect(screen.getByText('Gotowość obszarów')).toBeInTheDocument();
    await expect(screen.getByRole('table', { name: 'Historia pobrań danych' })).toBeInTheDocument();
  },
} satisfies Story;

export const WorkspaceOverviewStory = {
  ...createStory('workspaceOverview'),
  name: 'Szczegóły integracji — Przegląd',
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    await expect(screen.getByText('Stan integracji')).toBeInTheDocument();
    await expect(screen.getByText('Wpływ na PapaData')).toBeInTheDocument();
  },
} satisfies Story;

export const WorkspaceDataStory = {
  ...createStory('workspaceData'),
  name: 'Szczegóły integracji — Dane',
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    await expect(screen.getByText('Zakres danych')).toBeInTheDocument();
    await expect(screen.getByText('Gotowość danych')).toBeInTheDocument();
    await expect(screen.getByText('Wpływ na KPI')).toBeInTheDocument();
  },
} satisfies Story;

export const WorkspaceSyncStory = {
  ...createStory('workspaceSync'),
  name: 'Synchronizacja',
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    await expect(screen.getByText('Historia synchronizacji')).toBeInTheDocument();
  },
} satisfies Story;

export const WorkspaceSyncRunStory = {
  ...createStory('workspaceSyncRun'),
  name: 'Szczegóły runu',
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    await expect(screen.getByText(/Walidacja/u)).toBeInTheDocument();
    await expect(screen.getByText(/rekordów odrzuconych/u)).toBeInTheDocument();
    await expect(screen.getByRole('button', { name: 'Ponów zakres' })).toBeInTheDocument();
  },
} satisfies Story;

export const WorkspaceConfigStory = {
  ...createStory('workspaceConfig'),
  name: 'Konfiguracja',
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    await expect(screen.getByText('Strefa niebezpieczna')).toBeInTheDocument();
    await expect(screen.getByRole('button', { name: 'Odłącz integrację' })).toBeInTheDocument();
  },
} satisfies Story;

// Dialog/Drawer/AlertDialog/Menu all portal to #pd-overlay-root-host in document.body (see
// OverlayRoot), so their content sits outside canvasElement's subtree — query it via `body`,
// mirroring the pattern OverlayRoot.stories.tsx itself uses.

export const ConnectWizardStory = {
  ...createStory('connectWizard'),
  name: 'Połącz źródło',
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    const body = within(document.body);
    const user = userEvent.setup();
    const baselinkerCard = screen.getByText('BaseLinker').closest('article');
    if (!baselinkerCard) throw new Error('Missing BaseLinker card');
    await user.click(within(baselinkerCard).getByRole('button', { name: 'Połącz' }));
    await expect(body.getByRole('heading', { name: 'Połącz BaseLinker' })).toBeInTheDocument();
    await expect(body.getByText('Konto')).toBeInTheDocument();
  },
} satisfies Story;

export const ReconnectWizardStory = {
  ...createStory('reconnectWizard'),
  name: 'Ponowne połączenie',
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    const body = within(document.body);
    const user = userEvent.setup();
    const table = screen.getByRole('table', { name: 'Źródła danych i jakość danych' });
    await user.click(within(table).getByRole('button', { name: 'Połącz ponownie' }));
    await expect(body.getByRole('heading', { name: 'Połącz Google Ads' })).toBeInTheDocument();
  },
} satisfies Story;

export const DisconnectDialogStory = {
  ...createStory('disconnectDialog'),
  name: 'Odłączenie',
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    const body = within(document.body);
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: /dla wiersza/u })[0]);
    await user.click(await body.findByRole('menuitem', { name: 'Odłącz' }));
    await expect(body.getByRole('heading', { name: 'Odłączyć to źródło?' })).toBeInTheDocument();
    await expect(body.getByRole('button', { name: 'Odłącz źródło' })).toBeInTheDocument();
  },
} satisfies Story;

export const ProviderOutageStory = {
  ...createStory('providerOutage'),
  name: 'Awaria providera',
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    await expect(screen.getByText('Problem providera', { selector: '.pd-int-outage-card__title' })).toBeInTheDocument();
    await expect(screen.getByText(/Meta API nie odpowiada/u)).toBeInTheDocument();
    await expect(screen.getByText(/inne źródła działają bez zakłóceń/iu)).toBeInTheDocument();
  },
} satisfies Story;
