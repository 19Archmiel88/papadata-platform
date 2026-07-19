import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStorySurface } from '../../screens/account-access/AuthStorySurface';

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Dostęp do konta/Zarządzanie sesjami',
  component: AuthStorySurface,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AuthStorySurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SesjaZakonczona: Story = {
  name: 'Sesja zakończona',
  args: {
    initialScreen: 'signedOut',
    initialTheme: 'dark',
  },
};
