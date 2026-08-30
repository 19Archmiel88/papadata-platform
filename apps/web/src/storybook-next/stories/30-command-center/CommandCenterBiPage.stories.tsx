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
  CommandCenterBiPage,
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
} from './CommandCenterBiPage';
import {
  commandCenterSectionsById,
  commandProducts,
  commandRisks,
} from './CommandCenterBiPage.data';
import type {
  CommandProductSort,
  CommandRisk,
  CommandRiskStatus,
} from './CommandCenterBiPage.data';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: '30 Centrum Dowodzenia',
  component: CommandCenterBiPage,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CommandCenterBiPage>;

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

function ProductsHarness() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<CommandProductSort>('gmv');
  const products = commandProducts
    .filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
    .sort((left, right) => (sort === 'margin' ? right.margin - left.margin : right.gmv - left.gmv));

  return (
    <StoryFrame>
      <CommandProductsSection
        onProductSearchChange={setSearch}
        onProductSortChange={setSort}
        productSearch={search}
        productSort={sort}
        products={products}
      />
    </StoryFrame>
  );
}

function RisksHarness() {
  const [risks, setRisks] = useState<CommandRisk[]>(() => commandRisks.map((risk) => ({ ...risk })));

  function updateRisk(id: string, status: CommandRiskStatus) {
    setRisks((prevRisks) => prevRisks.map((risk) => (risk.id === id ? { ...risk, status } : risk)));
  }

  return (
    <StoryFrame>
      <CommandRisksSection
        onRiskStatusChange={updateRisk}
        risks={risks}
      />
    </StoryFrame>
  );
}

export const Overview: Story = {
  name: 'Całość',
  render: () => (
    <StorybookProductShellFrame activePath="/app/command-center">
      <CommandCenterBiPage />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: commandCenterSectionsById.pulse.title })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: commandCenterSectionsById.guardian.title })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: commandCenterSectionsById.funnel.title })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: commandCenterSectionsById['data-health'].title })).toBeInTheDocument();

    const analyzeButtons = await canvas.findAllByRole('button', { name: 'Analizuj →' });
    await userEvent.click(analyzeButtons[0]);
    await expect(await canvas.findByRole('dialog', { name: 'Papa Asystent AI' })).toBeInTheDocument();
  },
};

export const Kpi: Story = {
  name: 'KPI',
  render: () => (
    <StoryFrame>
      <CommandPulseSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: commandCenterSectionsById.pulse.title })).toBeInTheDocument();
    await expect(await canvas.findByText('128 450')).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Koszt Reklamy' }));
    await expect(await canvas.findByRole('img', { name: 'Dynamika Czasowa: Koszt Reklamy' })).toBeInTheDocument();
  },
};

export const Guardian: Story = {
  name: 'Guardian',
  render: () => (
    <StoryFrame>
      <CommandGuardianSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: commandCenterSectionsById.guardian.title })).toBeInTheDocument();
    await expect(await canvas.findByText('Syntetyczna Narracja Papa Guardian')).toBeInTheDocument();
    await expect(await canvas.findByText('Rekomendacje z priorytetem ("Decyzje na teraz")')).toBeInTheDocument();
  },
};

export const Plan: Story = {
  name: 'Plan vs Wynik',
  render: () => (
    <StoryFrame>
      <CommandPlanSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: commandCenterSectionsById.plan.title })).toBeInTheDocument();
    await expect(await canvas.findByText('97.9%')).toBeInTheDocument();
  },
};

export const Drivers: Story = {
  name: 'Drivery wyniku',
  render: () => (
    <StoryFrame>
      <CommandDriversSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: commandCenterSectionsById.drivers.title })).toBeInTheDocument();
    await expect(await canvas.findByRole('img', { name: 'Kaskada Zmiany Wyniku' })).toBeInTheDocument();
  },
};

export const Risks: Story = {
  name: 'Ryzyka i alerty',
  render: () => <RisksHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: commandCenterSectionsById.alerts.title })).toBeInTheDocument();
    await expect(await canvas.findByText('Konwersja na krok Checkout spadła o 14%')).toBeInTheDocument();
    await userEvent.click(await canvas.findAllByRole('button', { name: 'Przyjmij' }).then((buttons) => buttons[0]));
    await expect((await canvas.findAllByText('Przyjęte do wiadomości')).length).toBeGreaterThan(0);
  },
};

export const Funnel: Story = {
  name: 'Lejek konwersji',
  render: () => (
    <StoryFrame>
      <CommandFunnelSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: commandCenterSectionsById.funnel.title })).toBeInTheDocument();
    await expect(await canvas.findByText('4. Zakup')).toBeInTheDocument();
  },
};

export const Sources: Story = {
  name: 'Źródła przychodu',
  render: () => (
    <StoryFrame>
      <CommandSourcesSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: commandCenterSectionsById.sources.title })).toBeInTheDocument();
    await expect((await canvas.findAllByText('Paid Ads (Meta/Google)')).length).toBeGreaterThan(0);
  },
};

export const Products: Story = {
  name: 'Produkty',
  render: () => <ProductsHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: commandCenterSectionsById.products.title })).toBeInTheDocument();
    await expect(await canvas.findByRole('img', { name: 'Macierz Marża vs Przychód' })).toBeInTheDocument();
    await userEvent.type(await canvas.findByRole('searchbox', { name: 'Szukaj produktu' }), 'SmartBand');
    await expect(await canvas.findByText('Akcesorium SmartBand X')).toBeInTheDocument();
    await expect(canvas.queryByText('Zestaw Premium Alpha V2')).not.toBeInTheDocument();
  },
};

export const Customers: Story = {
  name: 'Struktura klientów',
  render: () => (
    <StoryFrame>
      <CommandCustomersSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: commandCenterSectionsById.customers.title })).toBeInTheDocument();
    await expect(await canvas.findByText('Powracający klienci')).toBeInTheDocument();
  },
};

export const DataHealth: Story = {
  name: 'Stan integracji i pochodzenie danych',
  render: () => (
    <StoryFrame>
      <CommandDataHealthSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: commandCenterSectionsById['data-health'].title })).toBeInTheDocument();
    await expect(await canvas.findByText('Shopify Storefront')).toBeInTheDocument();
  },
};

export const PapaAiInteractions: Story = {
  name: 'Interakcje Papa AI',
  render: () => (
    <StorybookProductShellFrame activePath="/app/command-center">
      <CommandCenterBiPage />
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
