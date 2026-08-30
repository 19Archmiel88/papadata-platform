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
  CustomerAcquisitionQuality,
  CustomerAiRetentionModule,
  CustomerCohortRetention,
  CustomerExplorer,
  CustomerProductAffinity,
  CustomerResultSection,
  CustomerRfmSegmentation,
  CustomersBiPage,
  CustomerValuePareto,
} from './CustomersBiPage';
import {
  customerAiInsights,
  customerFreshInsight,
  customerSections,
  customerSectionsById,
} from './CustomersBiPage.data';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: '34 Klienci',
  component: CustomersBiPage,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CustomersBiPage>;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryFrame({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-cbi">
      <div className="pd-cbi__content">
        {children}
      </div>
    </main>
  );
}

type StoryCustomerAiInsight = typeof customerAiInsights[number] | typeof customerFreshInsight;

function PapaSummaryHarness() {
  const [insights, setInsights] = useState<StoryCustomerAiInsight[]>(() => [...customerAiInsights]);

  return (
    <StoryFrame>
      <CustomerAiRetentionModule
        insights={insights}
        onGenerate={() => setInsights((prevInsights) => [customerFreshInsight, ...prevInsights])}
      />
    </StoryFrame>
  );
}

export const Overview: Story = {
  name: 'Całość',
  render: () => (
    <StorybookProductShellFrame activePath="/app/customers">
      <CustomersBiPage />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvasElement.querySelectorAll('.pd-section-frame')).toHaveLength(customerSections.length);
    await expect(Array.from(canvasElement.querySelectorAll('.pd-section-frame')).map((section) => section.id)).toEqual(
      customerSections.map((section) => section.id),
    );

    for (const section of customerSections) {
      await expect(await canvas.findByRole('heading', { name: section.title })).toBeInTheDocument();
      await expect(canvasElement.ownerDocument.querySelector(`a[href="#${section.id}"]`)).toHaveTextContent(section.navLabel);
    }

    const valueNavItem = canvasElement.ownerDocument.querySelector<HTMLAnchorElement>(`a[href="#${customerSectionsById.wartosc.id}"]`);
    await expect(valueNavItem).toBeInTheDocument();
    fireEvent.click(valueNavItem!);
    await waitFor(() => expect(valueNavItem).toHaveAttribute('aria-current', 'page'));

    const badges = await canvas.findAllByRole('button', { name: /Wyliczone/u });
    await userEvent.click(badges[0]!);
    await expect(await canvas.findByRole('dialog', { name: 'Provenance danych klientów' })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Zamknij provenance' }));

    await userEvent.click(await canvas.findByRole('button', { name: 'Pokaż 318 klientów' }));
    await expect(await canvas.findByText(/B18F92/u)).toBeInTheDocument();
    await expect(await canvas.findByText(/C33190/u)).toBeInTheDocument();

    await userEvent.click(await canvas.findAllByRole('button', { name: 'Szczegóły →' }).then((buttons) => buttons[0]!));
    await expect(await canvas.findByRole('dialog', { name: 'Customer Drawer' })).toBeInTheDocument();
    await expect(await canvas.findByText('Privacy status: Hashed Identity (No PII Leaked)')).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Zamknij Customer Drawer' }));
  },
};

export const Result: Story = {
  name: 'Wynik klientów',
  render: () => (
    <StoryFrame>
      <CustomerResultSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: customerSectionsById.wynik.title })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: '318 klientów wysokiej wartości (Champions/Loyal) przekroczyło cykl ponownego zakupu' })).toBeInTheDocument();
    await expect(await canvas.findByText('3 842')).toBeInTheDocument();
    await expect(await canvas.findByText('High-Value At-Risk')).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: 'Przychód (zł)' }));
    await expect(await canvas.findByRole('img', { name: 'Trend klientów: Przychód (zł)' })).toBeInTheDocument();
  },
};

export const Retention: Story = {
  name: 'Retencja klientów',
  render: () => (
    <StoryFrame>
      <CustomerCohortRetention />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: customerSectionsById.retencja.title })).toBeInTheDocument();
    await userEvent.selectOptions(await canvas.findByLabelText('Wizualizuj kohortę:'), '2026-03');
    await expect(await canvas.findByDisplayValue('Marzec 2026 (1 742 cust)')).toBeInTheDocument();
    await expect(await canvas.findByText('M0 → M1 (spadek o 63.2 pp)')).toBeInTheDocument();
  },
};

export const Segmentation: Story = {
  name: 'Segmentacja klientów',
  render: () => (
    <StoryFrame>
      <CustomerRfmSegmentation />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: customerSectionsById.segmentacja.title })).toBeInTheDocument();
    await expect((await canvas.findAllByText('Champions')).length).toBeGreaterThan(0);
    await expect((await canvas.findAllByText('Hibernating')).length).toBeGreaterThan(0);
  },
};

export const Value: Story = {
  name: 'Wartość klienta',
  render: () => (
    <StoryFrame>
      <CustomerValuePareto />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: customerSectionsById.wartosc.title })).toBeInTheDocument();
    await expect(await canvas.findByText(/812 zł/u)).toBeInTheDocument();
  },
};

export const Acquisition: Story = {
  name: 'Pozyskanie klientów',
  render: () => (
    <StoryFrame>
      <CustomerAcquisitionQuality />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: customerSectionsById.pozyskanie.title })).toBeInTheDocument();
    await expect((await canvas.findAllByText('Google Ads')).length).toBeGreaterThan(0);
    await expect(await canvas.findByText('98.0x')).toBeInTheDocument();
  },
};

export const ProductPreferences: Story = {
  name: 'Preferencje produktowe',
  render: () => (
    <StoryFrame>
      <CustomerProductAffinity />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: customerSectionsById.preferencje.title })).toBeInTheDocument();
    await expect(await canvas.findByText('Serum Witamina C 30ml')).toBeInTheDocument();
    await expect(await canvas.findByText('Refill Serum Witamina C 50ml')).toBeInTheDocument();
  },
};

export const Explorer: Story = {
  name: 'Eksplorator klientów',
  render: () => (
    <StoryFrame>
      <CustomerExplorer />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: customerSectionsById.eksplorator.title })).toBeInTheDocument();
    await userEvent.type(await canvas.findByRole('searchbox', { name: 'Szukaj ID lub hashu' }), 'F22');
    await expect(await canvas.findByText(/F22B88/u)).toBeInTheDocument();
    await expect(canvas.queryByText(/A73F21/u)).not.toBeInTheDocument();
  },
};

export const PapaSummary: Story = {
  name: 'Podsumowanie Papa AI',
  render: () => <PapaSummaryHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: customerSectionsById.insight.title })).toBeInTheDocument();
    await expect(await canvas.findByText('Spadek Retencji M1 Kohorty Majowej')).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: 'Wygeneruj Nowy Insight' }));
    await expect(await canvas.findByText('Nowy Wnioski: Optymalizacja Interpurchase Cycle')).toBeInTheDocument();
  },
};
