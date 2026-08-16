import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  DecisionCard,
} from './DecisionCard';
import type {
  DecisionCardProps,
} from './DecisionCard';

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/DecisionCard',
  component: DecisionCard,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof DecisionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    decisionId: 'DEC-2026-082',
    dueAt: '2026-08-19',
    impact: 'high',
    owner: 'Growth Lead',
    priority: 'high',
    status: 'executing',
    title: 'Przesuń budżet do kampanii z lepszą marżą',
  } satisfies DecisionCardProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Przesuń budżet do kampanii z lepszą marżą')).toBeInTheDocument();
  },
};
