import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { OrdersScreen } from '../../../screens/orders/OrdersScreen';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';

const meta = {
  title: 'INTERNAL STORY SUPPORT/ANALIZA/Zamówienia',
  component: OrdersScreen,
  parameters: { a11y: { test: 'error' }, layout: 'fullscreen' },
} satisfies Meta<typeof OrdersScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
const render = (props: Parameters<typeof OrdersScreen>[0] = {}) => (
  <StorybookProductShellFrame activePath="/app/orders">
    <OrdersScreen {...props} />
  </StorybookProductShellFrame>
);

export const Overview: Story = {
  render: () => render(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('heading', { level: 1, name: 'Zamówienia' }),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByRole('heading', { name: 'Kolejka realizacji' }),
    ).toBeInTheDocument();
  },
};
export const Result: Story = {
  render: () => render({ section: 'result', initialView: 'queue' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Zamówienia w próbce')).toBeInTheDocument();
    await expect(
      await canvas.findByRole('button', { name: /Pokaż wymagające uwagi/ }),
    ).toBeInTheDocument();
  },
};
export const Lifecycle: Story = {
  render: () => render({ section: 'lifecycle', initialView: 'queue' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: /^Wysłane / }));
    await expect(await canvas.findByRole('button', { name: '#WC-19485' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: '#WC-19482' })).not.toBeInTheDocument();
  },
};
export const Explorer: Story = {
  render: () => render({ section: 'table', initialView: 'queue' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      await canvas.findByRole('searchbox', { name: 'Szukaj ID, SKU, produktu lub kanału' }),
      'SKU-301',
    );
    await expect(await canvas.findByRole('button', { name: '#BL-88219' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: '#WC-19482' })).not.toBeInTheDocument();
  },
};
export const PaymentsAndShipping: Story = {
  render: () => render({ initialView: 'payments' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('heading', { name: 'Płatności i dostawa' }),
    ).toBeInTheDocument();
    await expect(await canvas.findByText('Kurier DPD')).toBeInTheDocument();
  },
};
export const DiscountsAndReturns: Story = {
  render: () => render({ initialView: 'returns' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('heading', { name: 'Rabaty i zwroty' }),
    ).toBeInTheDocument();
    await expect(await canvas.findByText('WELCOME10')).toBeInTheDocument();
  },
};
export const Funnel: Story = {
  render: () => render({ initialView: 'funnel' }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', { name: 'Lejek zakupowy' }),
    ).toBeInTheDocument();
  },
};
export const PapaSummary: Story = {
  render: () => render({ initialView: 'insight' }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', {
        name: 'Podsumowanie Papa AI',
      }),
    ).toBeInTheDocument();
  },
};
export const EvidenceAndQueue: Story = {
  render: () => render({ initialView: 'queue' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const definitions = await canvas.findAllByRole('button', {
      name: 'Definicja i źródło',
    });
    await userEvent.click(definitions[0]);
    await expect(
      await body.findByRole('dialog', { name: 'Definicje i źródło zamówień' }),
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(await canvas.findByRole('button', { name: /Pokaż wymagające uwagi/ }));
    await userEvent.click(await canvas.findByRole('button', { name: '#WC-19482' }));
    const drawer = await body.findByRole('dialog', { name: 'Zamówienie #WC-19482' });
    await expect(
      within(drawer).getByRole('heading', { name: 'Następny krok' }),
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
  },
};
