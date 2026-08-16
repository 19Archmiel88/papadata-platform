import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  PlanPerformance,
} from './PlanPerformance';
import type {
  PlanPerformanceProps,
} from './PlanPerformance';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_plan' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/PlanPerformance',
  component: PlanPerformance,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof PlanPerformance>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    actualSeries: { id: 'actual', label: 'Wynik', points: [{ x: '2026-08-14', y: 86 }, { x: '2026-08-15', y: 91 }], unit: '%' },
    context: workspaceContext,
    gapToTarget: -7.4,
    pace: 'behind',
    planSeries: { id: 'plan', label: 'Plan', points: [{ x: '2026-08-14', y: 94 }, { x: '2026-08-15', y: 98 }], unit: '%' },
  } satisfies PlanPerformanceProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Realizacja celu')).toBeInTheDocument();
  },
};
