import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  FunnelStep,
} from './FunnelStep';
import type {
  FunnelStepProps,
} from './FunnelStep';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_funnel' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/FunnelStep',
  component: FunnelStep,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof FunnelStep>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    context: workspaceContext,
    conversionRate: 0.433,
    conversions: 4200,
    label: 'Checkout',
    nextStepId: 'purchase',
    onInspect: () => undefined,
    previousStepId: 'cart',
    stepId: 'checkout',
    visitors: 9700,
  } satisfies FunnelStepProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Checkout')).toBeInTheDocument();
  },
};
