import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  ReactNode,
} from 'react';
import {
  useState,
} from 'react';
import {
  expect,
  fireEvent,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

import {
  TrafficChannelExplorer,
  TrafficDeviceGeoPerformance,
  TrafficFunnelSimulation,
  TrafficGovernanceBacklog,
  TrafficLandingPageExplorer,
  TrafficPapaTerminal,
  TrafficResultSection,
  TrafficTrackingQuality,
  TrafficScreen,
} from '../../../screens/traffic/TrafficScreen';
import {
  funnelScenario,
  trafficSections,
  trafficSectionsById,
} from '../../../screens/traffic/TrafficScreen.data';
import type {
  LandingPageTone,
  PapaTerminalType,
  TrafficBacklogFilter,
  TrafficTrendMode,
} from '../../../screens/traffic/TrafficScreen.data';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: 'INTERNAL STORY SUPPORT/ANALIZA/Ruch na stronie',
  component: TrafficScreen,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TrafficScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryFrame({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-tbi">
      <div className="pd-tbi__content">
        {children}
      </div>
    </main>
  );
}

function ResultHarness() {
  const [metric, setMetric] = useState<TrafficTrendMode>('sessions');

  return (
    <StoryFrame>
      <TrafficResultSection metric={metric} onMetricChange={setMetric} />
    </StoryFrame>
  );
}

function ChannelsHarness() {
  return (
    <StoryFrame>
      <TrafficChannelExplorer />
    </StoryFrame>
  );
}

function LandingHarness() {
  const [filter, setFilter] = useState<LandingPageTone>('all');

  return (
    <StoryFrame>
      <TrafficLandingPageExplorer
        filter={filter}
        onFilterChange={setFilter}
      />
    </StoryFrame>
  );
}

function FunnelHarness() {
  const [rate, setRate] = useState<number>(funnelScenario.baseCompletionRate);

  return (
    <StoryFrame>
      <TrafficFunnelSimulation
        completionRate={rate}
        onCompletionRateChange={setRate}
      />
    </StoryFrame>
  );
}

function AlertsHarness() {
  const [filter, setFilter] = useState<TrafficBacklogFilter>('all');

  return (
    <StoryFrame>
      <TrafficGovernanceBacklog filter={filter} onFilterChange={setFilter} />
    </StoryFrame>
  );
}

function PapaHarness() {
  const [terminalType, setTerminalType] = useState<PapaTerminalType>('ready');

  return (
    <StoryFrame>
      <TrafficPapaTerminal terminalType={terminalType} onTerminalTypeChange={setTerminalType} />
    </StoryFrame>
  );
}

export const Overview: Story = {
  name: 'Całość',
  render: () => (
    <StorybookProductShellFrame activePath="/app/traffic">
      <TrafficScreen />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { name: 'Ruch na stronie', level: 1 })).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('.pd-section-frame')).toHaveLength(trafficSections.length);
    await expect(Array.from(canvasElement.querySelectorAll('.pd-section-frame')).map((section) => section.id)).toEqual(
      trafficSections.map((section) => section.id),
    );

    for (const section of trafficSections) {
      await expect(await canvas.findByRole('heading', { name: section.title })).toBeInTheDocument();
      await expect(canvasElement.ownerDocument.querySelector(`a[href="#${section.id}"]`)).toHaveTextContent(section.navLabel);
    }

    const funnelNavItem = canvasElement.ownerDocument.querySelector<HTMLAnchorElement>(`a[href="#${trafficSectionsById.lejek.id}"]`);
    await expect(funnelNavItem).toBeInTheDocument();
    fireEvent.click(funnelNavItem!);
    await waitFor(() => expect(funnelNavItem).toHaveAttribute('aria-current', 'page'));

    // A global date-range/device filter bar (`.pd-tbi-select-filter`) was
    // asserted here previously but no longer exists on this screen -- the
    // shared shell date range is not yet wired into Traffic (tracked
    // separately in the rebuild audit). Removed rather than patched to a
    // stand-in element, per this repo's convention of not carrying stale
    // assertions for UI that hasn't been rebuilt yet.

    await userEvent.click(await canvas.findByRole('button', { name: 'Pełna analiza Papa AI' }));
    await expect(await canvas.findByText(/\[PAPA AI DIAGNOSTIC REPORT: MOBILE CONVERSION DROP\]/u)).toBeInTheDocument();

    // Drawer and the row-actions menu both portal to #pd-overlay-root-host
    // in document.body (see the identical pattern in
    // Integrations.story-support.tsx), so they must be queried via `body`,
    // not `canvas`. TrafficLandingPageExplorer renders row actions through
    // ExplorerTable's shared row-actions menu (DataTable's "<label> dla
    // wiersza <id>" trigger), not a standalone "Szczegóły ➔" button.
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findAllByRole('button', { name: /Akcje dla wiersza/u }).then((buttons) => buttons[0]!));
    await userEvent.click(await body.findByRole('menuitem', { name: 'Otwórz szczegóły' }));
    await expect(await body.findByRole('dialog', { name: 'Landing Page Drawer' })).toBeInTheDocument();
    await expect((await body.findAllByText('/products/serum-c-vitamin')).length).toBeGreaterThan(0);
    await expect(await body.findByText('Obserwacja Papa AI dla tej strony:')).toBeInTheDocument();

    // Story musi kończyć interakcję w stanie startowym -- w przeciwnym razie
    // ktoś oglądający "Widok pełny" ręcznie w Storybooku widzi drawer
    // pozostawiony otwarty i stronę przewiniętą do sekcji "Lejek konwersji"
    // po automatycznym uruchomieniu play().
    await userEvent.click(await body.findByRole('button', { name: 'Zamknij Szczegóły Strony' }));
    await expect(body.queryByRole('dialog', { name: 'Landing Page Drawer' })).not.toBeInTheDocument();

    const topNavItem = canvasElement.ownerDocument.querySelector<HTMLAnchorElement>(`a[href="#${trafficSectionsById.wynik.id}"]`);
    await expect(topNavItem).toBeInTheDocument();
    fireEvent.click(topNavItem!);
    await waitFor(() => expect(topNavItem).toHaveAttribute('aria-current', 'page'));
  },
};

export const Result: Story = {
  name: 'Sekcje — Wynik ruchu',
  render: () => <ResultHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: trafficSectionsById.wynik.title })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Urządzenia mobilne odpowiadają za 71.4% ruchu, ale CR jest o 38.2% niższy niż desktop' })).toBeInTheDocument();
    await expect(await canvas.findByText('128 420')).toBeInTheDocument();
    await expect(await canvas.findByText('1 188 220 zł')).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: 'CR %' }));
    await expect(await canvas.findByRole('img', { name: 'Trend ruchu: CR %' })).toBeInTheDocument();
  },
};

export const Channels: Story = {
  name: 'Sekcje — Kanały ruchu',
  render: () => <ChannelsHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: trafficSectionsById.kanaly.title })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Ekosystem Kanałów Ruchu (Channel Mix Taxonomy)' })).toBeInTheDocument();
    await userEvent.type(await canvas.findByRole('searchbox', { name: 'Szukaj kanału lub źródła' }), 'Email');
    await expect(await canvas.findByText('Email')).toBeInTheDocument();
    await expect(canvas.queryByText('Paid Social')).not.toBeInTheDocument();
  },
};

export const EntryPages: Story = {
  name: 'Sekcje — Strony wejścia',
  render: () => <LandingHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: trafficSectionsById.strony.title })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Problem z trackingiem' }));
    await expect(await canvas.findByText('/checkout/step-1')).toBeInTheDocument();
    await expect(await canvas.findByText('Brak danych (N/A)')).toBeInTheDocument();
  },
};

export const Funnel: Story = {
  name: 'Sekcje — Lejek konwersji',
  render: () => <FunnelHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: trafficSectionsById.lejek.title })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Spójny Lejek Konwersji Onsite (Session-Scoped Funnel)' })).toBeInTheDocument();
    await expect(await canvas.findByText('Rozpoczęcie Checkoutu')).toBeInTheDocument();
  },
};

export const DeviceGeo: Story = {
  name: 'Sekcje — Urządzenia i geografia',
  render: () => (
    <StoryFrame>
      <TrafficDeviceGeoPerformance />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: trafficSectionsById.urzadzenia.title })).toBeInTheDocument();
    await expect(await canvas.findByText('Mobile (Smartfony)')).toBeInTheDocument();
    await expect(await canvas.findByText('Polska (Poland)')).toBeInTheDocument();
  },
};

export const DataQuality: Story = {
  name: 'Sekcje — Jakość danych',
  render: () => (
    <StoryFrame>
      <TrafficTrackingQuality />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: trafficSectionsById.jakosc.title })).toBeInTheDocument();
    await expect(await canvas.findByText('94.3%')).toBeInTheDocument();
  },
};

export const Alerts: Story = {
  name: 'Stany — Alerty i anomalie',
  render: () => <AlertsHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: trafficSectionsById.alerty.title })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Rozbudowa P1 (5)' }));
    await expect(await canvas.findByText('Brak modułu Landing Page Explorer')).toBeInTheDocument();
    await expect(canvas.queryByText('Brak ID-6 w canonical product surface registry')).not.toBeInTheDocument();
  },
};

export const PapaDiagnostics: Story = {
  name: 'Sekcje — Diagnostyka Papa AI',
  render: () => <PapaHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: trafficSectionsById['papa-ai'].title })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Terminal Diagnostyczny Papa AI (Traffic Intelligence Prompt)' })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Diagnoza GA4 vs Commerce Gap' }));
    await expect(await canvas.findByText(/\[PAPA AI DIAGNOSTIC REPORT: GA4 VS COMMERCE RECONCILIATION\]/u)).toBeInTheDocument();
  },
};
