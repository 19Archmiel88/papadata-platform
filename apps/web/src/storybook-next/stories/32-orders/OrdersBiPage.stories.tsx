import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  ReactNode,
} from 'react';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import {
  OrderExplorer,
  OrdersBiPage,
  OrdersDiscountsAndReturns,
  OrdersExecutiveInsight,
  OrdersLifecycleFlow,
  OrdersPaymentsAndShipping,
  OrdersPurchaseFunnel,
  OrdersResultSection,
} from './OrdersBiPage';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: '32 Zamówienia',
  component: OrdersBiPage,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof OrdersBiPage>;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryFrame({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-obi">
      <div className="pd-obi__content">
        {children}
      </div>
    </main>
  );
}

export const Overview: Story = {
  name: 'Całość',
  render: () => (
    <StorybookProductShellFrame activePath="/app/orders">
      <OrdersBiPage />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Wynik operacyjny' })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Eksplorator zamówień' })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Rabaty i zwroty' })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Podsumowanie Papa AI' })).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: 'Pokaż 63 krytyczne zamówienia' }));
    await expect(await canvas.findByText('#WC-19482')).toBeInTheDocument();
    await expect(await canvas.findByText('#BL-88225')).toBeInTheDocument();
  },
};

export const Result: Story = {
  name: 'Wynik operacyjny',
  render: () => (
    <StoryFrame>
      <OrdersResultSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Wynik operacyjny' })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: '214 zamówień przekroczyło cel SLA (>36 godzin)' })).toBeInTheDocument();
    await expect(await canvas.findByText('1,45 mln zł')).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'AOV Trend' }));
    await expect(await canvas.findByText('AOV (zł)')).toBeInTheDocument();
  },
};

export const Lifecycle: Story = {
  name: 'Realizacja zamówień',
  render: () => (
    <StoryFrame>
      <OrdersLifecycleFlow />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Realizacja zamówień' })).toBeInTheDocument();
    await expect(await canvas.findByRole('button', { name: /🚨 Po SLA/u })).toBeInTheDocument();
  },
};

export const Explorer: Story = {
  name: 'Eksplorator zamówień',
  render: () => (
    <StoryFrame>
      <OrderExplorer />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Eksplorator zamówień' })).toBeInTheDocument();
    await userEvent.type(await canvas.findByRole('searchbox', { name: 'Szukaj ID, SKU, kanału' }), 'SKU-301');
    await expect(await canvas.findByText('#BL-88219')).toBeInTheDocument();
    await expect(canvas.queryByText('#WC-19482')).not.toBeInTheDocument();
  },
};

export const PaymentsAndShipping: Story = {
  name: 'Płatności i dostawa',
  render: () => (
    <StoryFrame>
      <OrdersPaymentsAndShipping />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Płatności i dostawa' })).toBeInTheDocument();
    await expect(await canvas.findByText(/Alert Koncentracji Płatności/u)).toBeInTheDocument();
    await expect(await canvas.findByText('Kurier DPD')).toBeInTheDocument();
  },
};

export const DiscountsAndReturns: Story = {
  name: 'Rabaty i zwroty',
  render: () => (
    <StoryFrame>
      <OrdersDiscountsAndReturns />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Rabaty i zwroty' })).toBeInTheDocument();
    await expect(await canvas.findByText('WELCOME10')).toBeInTheDocument();
    await expect(await canvas.findByText('Koszulka Oversize (SKU-102)')).toBeInTheDocument();
  },
};

export const Funnel: Story = {
  name: 'Lejek zakupowy',
  render: () => (
    <StoryFrame>
      <OrdersPurchaseFunnel />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Lejek zakupowy' })).toBeInTheDocument();
    await expect(await canvas.findByText('✓ 15,6% Overall')).toBeInTheDocument();
  },
};

export const PapaSummary: Story = {
  name: 'Podsumowanie Papa AI',
  render: () => (
    <StoryFrame>
      <OrdersExecutiveInsight />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Podsumowanie Papa AI' })).toBeInTheDocument();
    await expect(await canvas.findByText('PAPA INSIGHT')).toBeInTheDocument();
  },
};

export const PapaAiInteractions: Story = {
  name: 'Interakcje Papa AI',
  render: () => (
    <StorybookProductShellFrame activePath="/app/orders">
      <OrdersBiPage />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const badges = await canvas.findAllByRole('button', { name: 'L1 Pomiar' });
    await userEvent.click(badges[0]);
    await expect(await canvas.findByRole('dialog', { name: 'Provenance danych zamówień' })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Zamknij provenance' }));

    const detailButtons = await canvas.findAllByRole('button', { name: 'Szczegóły →' });
    await userEvent.click(detailButtons[0]);
    await expect(await canvas.findByRole('dialog', { name: 'Order Drawer' })).toBeInTheDocument();
    await expect(await canvas.findByText('Papa AI dla tego Zamówienia')).toBeInTheDocument();
  },
};
