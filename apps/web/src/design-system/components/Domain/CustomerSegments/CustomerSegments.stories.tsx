import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  CustomerSegments,
} from './CustomerSegments';
import type {
  CustomerSegmentsProps,
} from './CustomerSegments';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_customers' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/CustomerSegments',
  component: CustomerSegments,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof CustomerSegments>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    context: workspaceContext,
    onSelectSegment: () => undefined,
    segments: [
      { id: 'loyal', label: 'Lojalni kupujący', customers: 3820, revenue: 418000, ltv: 420, churnRisk: 0.08 },
      { id: 'risk', label: 'Ryzyko churn', customers: 910, revenue: 96000, ltv: 180, churnRisk: 0.27 },
      { id: 'new', label: 'Nowi klienci', customers: 1640, revenue: 151000, ltv: 120, churnRisk: 0.13 },
    ],
    selectedSegmentId: 'risk',
  } satisfies CustomerSegmentsProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Klienci i wartość')).toBeInTheDocument();
  },
};
