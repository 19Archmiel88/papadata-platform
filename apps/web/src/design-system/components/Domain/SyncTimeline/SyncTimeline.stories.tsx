import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  SyncTimeline,
} from './SyncTimeline';
import type {
  SyncTimelineProps,
} from './SyncTimeline';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_sync' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/SyncTimeline',
  component: SyncTimeline,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof SyncTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    context: workspaceContext,
    onOpenRun: () => undefined,
    runs: [
      { id: 'run-1', provider: 'shopify', status: 'completed', startedAt: '2026-08-16T06:00:00+02:00', endedAt: '2026-08-16T06:04:00+02:00', recordsProcessed: 2480 },
      { id: 'run-2', provider: 'meta', status: 'partial', startedAt: '2026-08-16T06:10:00+02:00', recordsProcessed: 1280 },
      { id: 'run-3', provider: 'google', status: 'running', startedAt: '2026-08-16T06:30:00+02:00' },
    ],
  } satisfies SyncTimelineProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Ostatnie przebiegi')).toBeInTheDocument();
  },
};
