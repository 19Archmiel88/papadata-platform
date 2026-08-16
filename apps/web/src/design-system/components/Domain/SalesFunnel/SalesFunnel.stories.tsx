import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  SalesFunnel,
} from './SalesFunnel';
import type {
  SalesFunnelProps,
} from './SalesFunnel';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_sales_funnel' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/SalesFunnel',
  component: SalesFunnel,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof SalesFunnel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    context: workspaceContext,
    onOpenStep: () => undefined,
    steps: [
      { id: 'visit', label: 'Sesje', visitors: 52000, conversionRate: 1, dropoffRate: 0 },
      { id: 'cart', label: 'Koszyk', visitors: 9700, conversionRate: 0.186, dropoffRate: 0.814 },
      { id: 'checkout', label: 'Checkout', visitors: 4200, conversionRate: 0.433, dropoffRate: 0.567 },
      { id: 'purchase', label: 'Zakup', visitors: 2380, conversionRate: 0.567, dropoffRate: 0.433 },
    ],
  } satisfies SalesFunnelProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Sprzedaż krok po kroku')).toBeInTheDocument();
  },
};
