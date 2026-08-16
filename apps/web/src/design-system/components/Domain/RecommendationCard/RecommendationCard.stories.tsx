import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  RecommendationCard,
} from './RecommendationCard';
import type {
  RecommendationCardProps,
} from './RecommendationCard';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_recommendations' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/RecommendationCard',
  component: RecommendationCard,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof RecommendationCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    context: workspaceContext,
    effort: 'medium',
    evidence: [
      { id: 'ev-1', label: 'ROAS kampanii', source: 'Meta Ads', confidence: 0.84 },
      { id: 'ev-2', label: 'Marża produktu', source: 'Shopify', confidence: 0.91 },
    ],
    impact: 'high',
    onApprove: () => undefined,
    onReject: () => undefined,
    recommendationId: 'REC-044',
    risk: 'low',
    title: 'Przesuń budżet do zestawu z dodatnią marżą',
  } satisfies RecommendationCardProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Przesuń budżet do zestawu z dodatnią marżą')).toBeInTheDocument();
  },
};
