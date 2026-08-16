import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  Panel,
} from './Panel';
import type {
  PanelProps,
} from './Panel';

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/Panel',
  component: Panel,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof Panel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    bordered: true,
    children: <p>Panel roboczy trzyma realny kontekst decyzji, a nie dekoracyjny wrapper Storybooka.</p>,
    collapsed: false,
    collapsible: true,
    description: 'Warstwa produkcyjna do grupowania danych, dowodów albo rekomendacji.',
    eyebrow: 'Warstwa danych',
    padding: 'md',
    title: 'Panel decyzji',
    tone: 'data',
  } satisfies PanelProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Panel decyzji')).toBeInTheDocument();
  },
};
