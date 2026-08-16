import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  DataStatusBanner,
} from './DataStatusBanner';
import type {
  DataStatusBannerProps,
} from './DataStatusBanner';

const workspaceContext = {
  locale: 'pl',
  range: { from: '2026-08-01', preset: 'monthToDate', timezone: 'Europe/Warsaw', to: '2026-08-16' },
  tenantId: 'tenant-papadata',
  workspaceId: 'workspace_command_center',
} as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/DataStatusBanner',
  component: DataStatusBanner,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof DataStatusBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    blockingIssues: [
      { id: 'late-meta', label: 'Meta Ads opóźnione 2h', severity: 'warning' },
    ],
    context: workspaceContext,
    onOpenIssue: () => undefined,
    readiness: 'partial',
    sources: [
      { provider: 'Shopify', dataset: 'orders', lastSyncAt: '2026-08-16T07:40:00+02:00', completeness: 0.99 },
      { provider: 'Meta Ads', dataset: 'campaign_spend', lastSyncAt: '2026-08-16T05:10:00+02:00', completeness: 0.82 },
    ],
  } satisfies DataStatusBannerProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Status danych')).toBeInTheDocument();
  },
};
