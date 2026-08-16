import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  ReconciliationPanel,
} from './ReconciliationPanel';
import type {
  ReconciliationPanelProps,
} from './ReconciliationPanel';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_reconciliation' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/ReconciliationPanel',
  component: ReconciliationPanel,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof ReconciliationPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    conflicts: [
      { id: 'conflict-1', entityType: 'Zamówienie', sourceA: 'Shopify', sourceB: 'ERP', proposedResolution: 'Przyjąć wartość z ERP po korekcie zwrotu' },
      { id: 'conflict-2', entityType: 'Koszt reklamy', sourceA: 'Meta Ads', sourceB: 'Import CSV', proposedResolution: 'Wymaga ręcznej weryfikacji' },
    ],
    context: workspaceContext,
    onResolveConflict: () => undefined,
  } satisfies ReconciliationPanelProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Konflikty źródeł')).toBeInTheDocument();
  },
};
