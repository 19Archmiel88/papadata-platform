import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  DecisionQueue,
} from './DecisionQueue';
import type {
  DecisionQueueProps,
} from './DecisionQueue';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_decisions' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/DecisionQueue',
  component: DecisionQueue,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof DecisionQueue>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    context: workspaceContext,
    decisions: [
      { id: 'DEC-101', title: 'Zamrozić kampanię o niskim ROAS', status: 'new', priority: 'high', dueAt: '2026-08-17', owner: 'Performance' },
      { id: 'DEC-102', title: 'Podnieść próg darmowej dostawy', status: 'review', priority: 'medium', dueAt: '2026-08-20', owner: 'Commerce' },
    ],
    onChangeStatus: () => undefined,
    onOpenDecision: () => undefined,
  } satisfies DecisionQueueProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Decyzje wymagające reakcji')).toBeInTheDocument();
  },
};
