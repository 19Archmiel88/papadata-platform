import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStorySurface } from '../../screens/account-access/AuthStorySurface';

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Dostęp do konta/Zaproszenie',
  component: AuthStorySurface,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AuthStorySurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AkceptacjaZaproszenia: Story = {
  name: 'Akceptacja zaproszenia',
  args: {
    initialScreen: 'invitation',
    initialTheme: 'dark',
  },
};
