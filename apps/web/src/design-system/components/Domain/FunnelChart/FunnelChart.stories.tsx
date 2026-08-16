import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  FunnelChart,
} from './FunnelChart';
import type {
  FunnelChartProps,
} from './FunnelChart';

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/FunnelChart',
  component: FunnelChart,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof FunnelChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    orientation: 'vertical',
    showDropoff: true,
    steps: [
      { id: 'visit', label: 'Sesje', value: 52000, conversionRate: 1 },
      { id: 'cart', label: 'Dodanie do koszyka', value: 9700, conversionRate: 0.186 },
      { id: 'checkout', label: 'Checkout', value: 4200, conversionRate: 0.433 },
      { id: 'purchase', label: 'Zakup', value: 2380, conversionRate: 0.567 },
    ],
  } satisfies FunnelChartProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Lejek sprzedaży')).toBeInTheDocument();
  },
};
