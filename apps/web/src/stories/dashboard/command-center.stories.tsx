import type { Meta, StoryObj } from '@storybook/react-vite';

import { CommandCenterFocus } from '../../screens/dashboard/CommandCenterFocus';

const meta = {
  title: 'PapaData/Dashboard/Centrum Dowodzenia',
  component: CommandCenterFocus,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CommandCenterFocus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PriorytetDecyzyjny: Story = {
  name: 'Priorytet decyzyjny',
};
