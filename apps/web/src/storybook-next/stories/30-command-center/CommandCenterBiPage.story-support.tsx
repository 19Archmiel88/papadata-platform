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
  userEvent,
  within,
} from 'storybook/test';

import {
  CommandCenterScreen,
  CommandCustomersSection,
  CommandDataHealthSection,
  CommandDriversSection,
  CommandFunnelSection,
  CommandGuardianSection,
  CommandPlanSection,
  CommandProductsSection,
  CommandPulseSection,
  CommandRisksSection,
  CommandSourcesSection,
} from '../../../screens/command-center/CommandCenterScreen';
import {
  commandCenterOverviewFixture,
} from '../../fixtures/command-center/commandCenterOverviewFixture';
import type {
  CommandCenterSection,
  CommandProductData,
  CommandProductSort,
  CommandRisk,
  CommandRiskStatus,
} from '../../../screens/command-center/CommandCenterScreen.model';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: 'INTERNAL STORY SUPPORT/ANALIZA/Centrum Dowodzenia',
  component: CommandCenterScreen,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CommandCenterScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryFrame({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-ccbi">
      <div className="pd-ccbi__content">
        {children}
      </div>
    </main>
  );
}

const storyData = commandCenterOverviewFixture;

function section(id: CommandCenterSection['id']) {
  return storyData.sections.find((item) => item.id === id) ?? storyData.sections[0];
}

function ProductsHarness() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<CommandProductSort>('gmv');
  const products = storyData.products
    .filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
    .sort((left, right) => (sort === 'margin' ? right.margin - left.margin : right.gmv - left.gmv));

  return (
    <StoryFrame>
      <CommandProductsSection
        products={products}
        section={section('products')}
        onProductSearchChange={setSearch}
        onProductSortChange={setSort}
        productSearch={search}
        productSort={sort}
      />
    </StoryFrame>
  );
}

function RisksHarness() {
  const [risks, setRisks] = useState<CommandRisk[]>(() => storyData.risks.map((risk) => ({ ...risk })));

  function updateRisk(id: string, status: CommandRiskStatus) {
    setRisks((prevRisks) => prevRisks.map((risk) => (risk.id === id ? { ...risk, status } : risk)));
  }

  return (
    <StoryFrame>
      <CommandRisksSection
        risks={risks}
        section={section('alerts')}
        onRiskStatusChange={updateRisk}
      />
    </StoryFrame>
  );
}

export const Overview: Story = {
  name: 'Całość',
  render: () => (
    <StorybookProductShellFrame activePath="/app/command-center">
      <CommandCenterScreen data={storyData} />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: section('pulse').title })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: section('guardian').title })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: section('funnel').title })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: section('data-health').title })).toBeInTheDocument();

    const analyzeButtons = await canvas.findAllByRole('button', { name: 'Analizuj →' });
    await userEvent.click(analyzeButtons[0]);
    await expect(await canvas.findByRole('dialog', { name: 'Papa Asystent AI' })).toBeInTheDocument();
  },
};

export const Kpi: Story = {
  name: 'Sekcje — KPI',
  render: () => (
    <StoryFrame>
      <CommandPulseSection
        compareMode={storyData.compareMode}
        dateRange="30d"
        kpis={storyData.kpis}
        section={section('pulse')}
        timeSeries={storyData.timeSeries}
        trendMetrics={storyData.trendMetrics}
      />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: section('pulse').title })).toBeInTheDocument();
    await expect(await canvas.findByText('128 450')).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Koszt Reklamy' }));
    await expect(await canvas.findByRole('img', { name: 'Dynamika Czasowa: Koszt Reklamy' })).toBeInTheDocument();
  },
};

export const Guardian: Story = {
  name: 'Sekcje — Guardian',
  render: () => (
    <StoryFrame>
      <CommandGuardianSection
        decisions={storyData.decisions}
        guardian={storyData.guardian}
        section={section('guardian')}
      />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: section('guardian').title })).toBeInTheDocument();
    await expect(await canvas.findByText('Syntetyczna Narracja Papa Guardian')).toBeInTheDocument();
    await expect(await canvas.findByText('Rekomendacje z priorytetem ("Decyzje na teraz")')).toBeInTheDocument();
  },
};

export const Plan: Story = {
  name: 'Sekcje — Plan i wynik',
  render: () => (
    <StoryFrame>
      <CommandPlanSection plan={storyData.plan} section={section('plan')} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: section('plan').title })).toBeInTheDocument();
    await expect(await canvas.findByText('97.9%')).toBeInTheDocument();
  },
};

export const Drivers: Story = {
  name: 'Sekcje — Czynniki wyniku',
  render: () => (
    <StoryFrame>
      <CommandDriversSection driversWaterfall={storyData.driversWaterfall} section={section('drivers')} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: section('drivers').title })).toBeInTheDocument();
    await expect(await canvas.findByRole('img', { name: 'Kaskada Zmiany Wyniku' })).toBeInTheDocument();
  },
};

export const Risks: Story = {
  name: 'Sekcje — Ryzyka i alerty',
  render: () => <RisksHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: section('alerts').title })).toBeInTheDocument();
    await expect(await canvas.findByText('Konwersja na krok Checkout spadła o 14%')).toBeInTheDocument();
    await userEvent.click(await canvas.findAllByRole('button', { name: 'Przyjmij' }).then((buttons) => buttons[0]));
    await expect((await canvas.findAllByText('Przyjęte do wiadomości')).length).toBeGreaterThan(0);
  },
};

export const Funnel: Story = {
  name: 'Sekcje — Lejek konwersji',
  render: () => (
    <StoryFrame>
      <CommandFunnelSection funnel={storyData.funnel} section={section('funnel')} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: section('funnel').title })).toBeInTheDocument();
    await expect(await canvas.findByText('4. Zakup')).toBeInTheDocument();
  },
};

export const Sources: Story = {
  name: 'Sekcje — Źródła przychodu',
  render: () => (
    <StoryFrame>
      <CommandSourcesSection section={section('sources')} sources={storyData.sources} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: section('sources').title })).toBeInTheDocument();
    await expect((await canvas.findAllByText('Paid Ads (Meta/Google)')).length).toBeGreaterThan(0);
  },
};

export const Products: Story = {
  name: 'Sekcje — Produkty',
  render: () => <ProductsHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: section('products').title })).toBeInTheDocument();
    await expect(await canvas.findByRole('img', { name: 'Macierz Marża vs Przychód' })).toBeInTheDocument();
    await userEvent.type(await canvas.findByRole('searchbox', { name: 'Szukaj produktu' }), 'SmartBand');
    await expect(await canvas.findByText('Akcesorium SmartBand X')).toBeInTheDocument();
    await expect(canvas.queryByText('Zestaw Premium Alpha V2')).not.toBeInTheDocument();
  },
};

export const Customers: Story = {
  name: 'Sekcje — Struktura klientów',
  render: () => (
    <StoryFrame>
      <CommandCustomersSection
        customerCohorts={storyData.customerCohorts}
        customers={storyData.customers}
        section={section('customers')}
      />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: section('customers').title })).toBeInTheDocument();
    await expect(await canvas.findByText('Powracający klienci')).toBeInTheDocument();
  },
};

export const DataHealth: Story = {
  name: 'Sekcje — Stan integracji i pochodzenie danych',
  render: () => (
    <StoryFrame>
      <CommandDataHealthSection integrations={storyData.integrations} meta={storyData.meta} section={section('data-health')} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: section('data-health').title })).toBeInTheDocument();
    await expect(await canvas.findByText('Shopify Storefront')).toBeInTheDocument();
  },
};

export const PapaAiInteractions: Story = {
  name: 'Interakcje — Papa AI',
  render: () => (
    <StorybookProductShellFrame activePath="/app/command-center">
      <CommandCenterScreen data={storyData} />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const simulationButtons = await canvas.findAllByRole('button', { name: 'Symuluj wpływ' });
    await userEvent.click(simulationButtons[0]);
    await expect(await canvas.findByRole('dialog', { name: 'Symulator Scenariuszy What-If' })).toBeInTheDocument();
    await expect((await canvas.findAllByText('Optymalizacja budżetu kampanii retargetingowych')).length).toBeGreaterThan(0);
  },
};
