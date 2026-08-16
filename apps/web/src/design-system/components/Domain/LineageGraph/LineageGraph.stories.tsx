import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  LineageGraph,
} from './LineageGraph';
import type {
  LineageGraphProps,
} from './LineageGraph';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_lineage' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/LineageGraph',
  component: LineageGraph,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof LineageGraph>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    context: workspaceContext,
    edges: [
      { from: 'shopify-orders', to: 'orders-normalized', reason: 'normalizacja zamówień' },
      { from: 'orders-normalized', to: 'gross-margin', reason: 'kalkulacja marży' },
    ],
    nodes: [
      { id: 'shopify-orders', label: 'Shopify orders', status: 'ready', type: 'source' },
      { id: 'orders-normalized', label: 'Orders normalized', status: 'partial', type: 'transform' },
      { id: 'gross-margin', label: 'Gross margin', status: 'ready', type: 'metric' },
    ],
    onOpenNode: () => undefined,
    rootRecordId: 'metric:gross-margin',
  } satisfies LineageGraphProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Pochodzenie danych')).toBeInTheDocument();
  },
};
