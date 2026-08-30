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
  TrafficBiPage,
  TrafficChannelExplorer,
  TrafficDeviceGeoPerformance,
  TrafficFunnelSimulation,
  TrafficGovernanceBacklog,
  TrafficLandingPageExplorer,
  TrafficPapaTerminal,
  TrafficResultSection,
  TrafficTrackingQuality,
} from './TrafficBiPage';
import {
  funnelScenario,
  trafficSections,
  trafficSectionsById,
} from './TrafficBiPage.data';
import type {
  LandingPageTone,
  PapaTerminalType,
  TrafficBacklogFilter,
  TrafficTrendMode,
} from './TrafficBiPage.data';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: '35 Ruch na stronie',
  component: TrafficBiPage,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TrafficBiPage>;

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
  const [search, setSearch] = useState('');

  return (
    <StoryFrame>
      <TrafficChannelExplorer onSearchChange={setSearch} searchValue={search} />
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
      <TrafficBiPage />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { level: 1, name: 'Ruch na stronie' })).toBeInTheDocument();
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

    await userEvent.selectOptions(await canvas.findByLabelText('Okres:'), '7d');
    await expect(await canvas.findByDisplayValue('Ostatnie 7 dni')).toBeInTheDocument();
    await userEvent.selectOptions(await canvas.findByLabelText('Urządzenie:'), 'mobile');
    await expect(await canvas.findByDisplayValue('Mobile (Smartfony)')).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: 'Pełna analiza Papa AI' }));
    await expect(await canvas.findByText(/\[PAPA AI DIAGNOSTIC REPORT: MOBILE CONVERSION DROP\]/u)).toBeInTheDocument();

    const detailsButtons = await canvas.findAllByRole('button', { name: 'Szczegóły ➔' });
    await userEvent.click(detailsButtons[0]!);
    await expect(await canvas.findByRole('dialog', { name: 'Landing Page Drawer' })).toBeInTheDocument();
    await expect((await canvas.findAllByText('/products/serum-c-vitamin')).length).toBeGreaterThan(0);
    await expect(await canvas.findByText('Papa AI Insight dla tej strony:')).toBeInTheDocument();
  },
};

export const Result: Story = {
  name: 'Wynik ruchu',
  render: () => <ResultHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: trafficSectionsById.wynik.title })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Urządzenia mobilne odpowiadają za 71.4% ruchu, ale CR jest o 38.2% niższy niż desktop' })).toBeInTheDocument();
    await expect(await canvas.findByText('128 420')).toBeInTheDocument();
    await expect(await canvas.findByText('1 188 220 zł')).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: 'Conversion Rate %' }));
    await expect(await canvas.findByRole('img', { name: 'Trend ruchu: Conversion Rate %' })).toBeInTheDocument();
  },
};

export const Channels: Story = {
  name: 'Kanały ruchu',
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
  name: 'Strony wejścia',
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
  name: 'Lejek konwersji',
  render: () => <FunnelHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: trafficSectionsById.lejek.title })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Spójny Lejek Konwersji Onsite (Session-Scoped Funnel)' })).toBeInTheDocument();
    await expect(await canvas.findByText('Rozpoczęcie Checkoutu')).toBeInTheDocument();
  },
};

export const DeviceGeo: Story = {
  name: 'Urządzenia i geografia',
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
  name: 'Jakość danych',
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
  name: 'Alerty i anomalie',
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
  name: 'Diagnostyka Papa AI',
  render: () => <PapaHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: trafficSectionsById['papa-ai'].title })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Terminal Diagnostyczny Papa AI (Traffic Intelligence Prompt)' })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Diagnoza GA4 vs Commerce Gap' }));
    await expect(await canvas.findByText(/\[PAPA AI DIAGNOSTIC REPORT: GA4 VS COMMERCE RECONCILIATION\]/u)).toBeInTheDocument();
  },
};
