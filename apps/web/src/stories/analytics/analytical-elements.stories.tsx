import type { Meta, StoryObj } from '@storybook/react-vite';

import { AnalyticalKpi } from '../../screens/analytics/AnalyticalKpi';

const meta = {
  title: 'PapaData/Elementy analityczne/KPI',
  component: AnalyticalKpi,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AnalyticalKpi>;

export default meta;

type Story = StoryObj<typeof meta>;

export const KartyKpi: Story = {
  name: 'Karty KPI',
};
