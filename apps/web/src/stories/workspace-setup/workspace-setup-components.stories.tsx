import type { Meta, StoryObj } from '@storybook/react-vite';

import { WorkspaceSetupComponents } from '../../screens/workspace-setup/WorkspaceSetupComponents';

const meta = {
  title: 'PapaData/03 Wzorce/Zestawy ekranowe/Konfiguracja przestrzeni roboczej',
  component: WorkspaceSetupComponents,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof WorkspaceSetupComponents>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ZestawKomponentow: Story = {
  name: 'Przegląd',
};
