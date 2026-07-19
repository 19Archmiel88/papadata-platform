import type { Meta, StoryObj } from '@storybook/react-vite';

import { AnalyticalStates } from '../../screens/analytics/AnalyticalStates';

const meta = {
  title: 'PapaData/Elementy analityczne/Stany danych',
  component: AnalyticalStates,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AnalyticalStates>;

export default meta;

type Story = StoryObj<typeof meta>;

export const JakoscISwiezosc: Story = {
  name: 'Jakość i świeżość danych',
};
