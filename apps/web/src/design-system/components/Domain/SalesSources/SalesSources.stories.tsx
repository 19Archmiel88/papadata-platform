import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  SalesSources,
} from './SalesSources';
import type {
  SalesSourcesProps,
} from './SalesSources';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_sales_sources' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/SalesSources',
  component: SalesSources,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof SalesSources>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    compareToPrevious: true,
    context: workspaceContext,
    onOpenSource: () => undefined,
    sources: [
      { id: 'organic', channel: 'Organic', revenue: 146000, orders: 840, margin: 32, readiness: 'ready' },
      { id: 'paid', channel: 'Paid social', revenue: 124000, orders: 610, margin: 24, readiness: 'partial' },
      { id: 'email', channel: 'Email', revenue: 92000, orders: 520, margin: 37, readiness: 'ready' },
    ],
  } satisfies SalesSourcesProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Kanały i udział w przychodzie')).toBeInTheDocument();
  },
};
