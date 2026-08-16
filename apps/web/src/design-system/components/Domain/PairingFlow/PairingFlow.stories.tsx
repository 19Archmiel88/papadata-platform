import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  PairingFlow,
} from './PairingFlow';
import type {
  PairingFlowProps,
} from './PairingFlow';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_integrations' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/PairingFlow',
  component: PairingFlow,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof PairingFlow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    context: workspaceContext,
    deviceStatus: 'pending',
    onCancel: () => undefined,
    onConfirm: () => undefined,
    onStart: () => undefined,
    provider: 'shopify',
    sessionId: 'pair-shopify-001',
    steps: [
      { id: 'start', label: 'Rozpoczęcie sesji', status: 'verified' },
      { id: 'code', label: 'Kod autoryzacyjny', status: 'active', challengeCode: '842 193' },
      { id: 'verify', label: 'Weryfikacja połączenia', status: 'waitingForProvider' },
    ],
  } satisfies PairingFlowProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Parowanie integracji')).toBeInTheDocument();
  },
};
