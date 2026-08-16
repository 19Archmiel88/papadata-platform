import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  AttributionComparison,
} from './AttributionComparison';
import type {
  AttributionComparisonProps,
} from './AttributionComparison';

const workspaceContext = {
  locale: 'pl',
  tenantId: 'tenant-papadata',
  workspaceId: 'workspace_acquisition',
} as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/AttributionComparison',
  component: AttributionComparison,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof AttributionComparison>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    context: workspaceContext,
    models: [
      { id: 'last-click', label: 'Last click', revenue: 186000, roas: 3.4, confidence: 0.72 },
      { id: 'data-driven', label: 'Data driven', revenue: 214000, roas: 4.1, confidence: 0.84 },
      { id: 'first-click', label: 'First click', revenue: 151000, roas: 2.8, confidence: 0.63 },
    ],
    onSelectModel: () => undefined,
    selectedModelId: 'data-driven',
  } satisfies AttributionComparisonProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Model atrybucji')).toBeInTheDocument();
  },
};
