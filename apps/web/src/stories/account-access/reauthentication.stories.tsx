import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStorySurface } from '../../screens/account-access/AuthStorySurface';

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Dostęp do konta/Ponowne uwierzytelnienie',
  component: AuthStorySurface,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AuthStorySurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PonowneUwierzytelnienie: Story = {
  name: 'Potwierdzenie operacji',
  args: {
    initialScreen: 'reauthentication',
    initialTheme: 'dark',
  },
};
