import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStorySurface } from '../../screens/account-access/AuthStorySurface';

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Dostęp do konta/Logowanie',
  component: AuthStorySurface,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    initialLoginState: {
      control: 'select',
      options: [
        'default',
        'submitting',
        'invalidCredentials',
        'providerUnavailable',
      ],
    },
    initialTheme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
  },
} satisfies Meta<typeof AuthStorySurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CalyProces: Story = {
  name: 'Cały proces',
  args: {
    initialScreen: 'login',
    initialTheme: 'dark',
  },
};

export const Logowanie: Story = {
  name: 'Podstawowy',
  args: {
    initialLoginState: 'default',
    initialScreen: 'login',
    initialTheme: 'dark',
  },
};

export const LogowanieWTrakcie: Story = {
  name: 'Stan wysyłania',
  args: {
    initialLoginState: 'submitting',
    initialScreen: 'login',
    initialTheme: 'dark',
  },
};

export const LogowanieBledneDane: Story = {
  name: 'Błędne dane',
  args: {
    initialLoginState: 'invalidCredentials',
    initialScreen: 'login',
    initialTheme: 'dark',
  },
};

export const LogowanieProviderNiedostepny: Story = {
  name: 'Dostawca niedostępny',
  args: {
    initialLoginState: 'providerUnavailable',
    initialScreen: 'login',
    initialTheme: 'dark',
  },
};
