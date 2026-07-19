import type { Meta, StoryObj } from '@storybook/react-vite';

import { DashboardComponents } from '../../screens/dashboard/DashboardComponents';

const meta = {
  title: 'PapaData/02 Komponenty/Nawigacja',
  component: DashboardComponents,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DashboardComponents>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ZestawKomponentow: Story = {
  name: 'Zestaw komponentów',
};
