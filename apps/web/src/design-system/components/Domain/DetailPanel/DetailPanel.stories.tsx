import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  DetailPanel,
} from './DetailPanel';
import type {
  DetailPanelProps,
} from './DetailPanel';

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/DetailPanel',
  component: DetailPanel,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof DetailPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    open: true,
    recordId: 'ORD-10045',
    sections: [
      { id: 'source', title: 'Źródło', fields: [{ label: 'Kanał', value: 'Google Ads' }, { label: 'Koszt', value: '12 400 zł' }] },
      { id: 'decision', title: 'Decyzja', fields: [{ label: 'Status', value: 'W review' }, { label: 'Właściciel', value: 'Growth Lead' }] },
    ],
    title: 'Szczegóły rekordu decyzyjnego',
    width: 'md',
  } satisfies DetailPanelProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Szczegóły rekordu decyzyjnego')).toBeInTheDocument();
  },
};
