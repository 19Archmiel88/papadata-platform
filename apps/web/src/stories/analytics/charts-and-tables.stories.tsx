import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChartsAndTables } from '../../screens/analytics/ChartsAndTables';

const meta = {
  title: 'PapaData/Elementy analityczne/Wykresy i tabele',
  component: ChartsAndTables,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ChartsAndTables>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WidokAnalityczny: Story = {
  name: 'Widok analityczny',
};
