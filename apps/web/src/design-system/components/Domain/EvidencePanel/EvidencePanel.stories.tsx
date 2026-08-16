import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  EvidencePanel,
} from './EvidencePanel';
import type {
  EvidencePanelProps,
} from './EvidencePanel';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_evidence' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/EvidencePanel',
  component: EvidencePanel,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof EvidencePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    confidence: 0.86,
    context: workspaceContext,
    evidence: [
      { id: 'ev-1', label: 'Spadek CR w koszyku', source: 'Shopify', confidence: 0.9 },
      { id: 'ev-2', label: 'Wzrost CPC w Meta', source: 'Meta Ads', confidence: 0.82 },
    ],
    onOpenEvidence: () => undefined,
    sources: [
      { provider: 'Shopify', dataset: 'orders', lastSyncAt: '2026-08-16T07:40:00+02:00', completeness: 0.98 },
      { provider: 'Meta Ads', dataset: 'campaigns', lastSyncAt: '2026-08-16T06:15:00+02:00', completeness: 0.91 },
    ],
  } satisfies EvidencePanelProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Źródła i pewność')).toBeInTheDocument();
  },
};
