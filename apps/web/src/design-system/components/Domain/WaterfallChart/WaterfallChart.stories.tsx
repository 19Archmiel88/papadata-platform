import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  WaterfallChart,
} from './WaterfallChart';
import type {
  WaterfallChartProps,
} from './WaterfallChart';

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/WaterfallChart',
  component: WaterfallChart,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof WaterfallChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    items: [
      { id: 'start', label: 'Przychód bazowy', value: 184000, kind: 'start' },
      { id: 'paid', label: 'Paid search', value: 14200, kind: 'increase' },
      { id: 'stock', label: 'Braki magazynowe', value: -7400, kind: 'decrease' },
      { id: 'total', label: 'Wynik końcowy', value: 190800, kind: 'total' },
    ],
    showCumulative: true,
    unit: 'PLN',
  } satisfies WaterfallChartProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Waterfall')).toBeInTheDocument();
  },
};
