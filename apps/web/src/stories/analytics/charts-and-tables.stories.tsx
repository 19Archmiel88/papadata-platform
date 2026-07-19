import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChartsAndTables } from '../../screens/analytics/ChartsAndTables';

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Analityka',
  component: ChartsAndTables,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ChartsAndTables>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WidokAnalityczny: Story = {
  name: 'Wykresy i tabele',
};

export const Wykresy: Story = {
  args: {},
};

export const Tabele: Story = {
  args: {},
};
