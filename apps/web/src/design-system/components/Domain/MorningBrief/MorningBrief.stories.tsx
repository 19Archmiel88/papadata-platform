import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  MorningBrief,
} from './MorningBrief';
import type {
  MorningBriefProps,
} from './MorningBrief';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_morning' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/MorningBrief',
  component: MorningBrief,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof MorningBrief>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    context: workspaceContext,
    dataReadiness: 'partial',
    decisionsDue: 4,
    highlights: [
      { id: 'h1', title: 'ROAS spadł poniżej celu', metric: '-14% dzień do dnia', severity: 'warning' },
      { id: 'h2', title: 'Magazyn blokuje bestseller', metric: '3 dni zapasu', severity: 'critical' },
      { id: 'h3', title: 'Kanał organiczny rośnie', metric: '+9,2% przychodu', severity: 'info' },
    ],
    onOpenHighlight: () => undefined,
  } satisfies MorningBriefProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Najważniejsze sygnały')).toBeInTheDocument();
  },
};
