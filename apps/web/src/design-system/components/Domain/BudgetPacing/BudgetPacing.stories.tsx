import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  BudgetPacing,
} from './BudgetPacing';
import type {
  BudgetPacingProps,
} from './BudgetPacing';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_campaigns' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/BudgetPacing',
  component: BudgetPacing,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof BudgetPacing>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    actualSpend: 42000,
    campaignId: 'META-PL-RET-042',
    context: workspaceContext,
    evidence: [
      { id: 'ev-spend', label: 'Wydatki dzienne', source: 'Meta Ads', confidence: 0.91 },
      { id: 'ev-roas', label: 'ROAS kampanii', source: 'PapaData', confidence: 0.86 },
    ],
    forecastSpend: 69000,
    onCreateDecision: () => undefined,
    plannedSpend: 60000,
    recommendation: 'Przenieś 12% budżetu do zestawu z wyższym ROAS i stabilną dostępnością produktów.',
    status: 'overPace',
  } satisfies BudgetPacingProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Pacing budżetu')).toBeInTheDocument();
  },
};
