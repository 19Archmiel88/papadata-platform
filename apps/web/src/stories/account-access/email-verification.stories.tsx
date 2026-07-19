import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStorySurface } from '../../screens/account-access/AuthStorySurface';

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Dostęp do konta/Weryfikacja adresu e-mail',
  component: AuthStorySurface,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    initialTheme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
    initialVerificationState: {
      control: 'select',
      options: [
        'idle',
        'submitting',
        'invalid',
        'expired',
        'resent',
        'cooldown',
        'success',
      ],
    },
  },
} satisfies Meta<typeof AuthStorySurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmailVerificationPodstawowy: Story = {
  name: 'Podstawowa',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'idle',
  },
};

export const EmailVerificationWysylanie: Story = {
  name: 'Wysyłanie',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'submitting',
  },
};

export const EmailVerificationBlednyKod: Story = {
  name: 'Błędny kod',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'invalid',
  },
};

export const EmailVerificationKodWygasl: Story = {
  name: 'Kod wygasł',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'expired',
  },
};

export const EmailVerificationKodWyslanyPonownie: Story = {
  name: 'Kod wysłany ponownie',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'resent',
  },
};

export const EmailVerificationCooldown: Story = {
  name: 'Blokada ponownej wysyłki',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'cooldown',
  },
};

export const EmailVerificationKodPotwierdzony: Story = {
  name: 'Kod potwierdzony',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'success',
  },
};
