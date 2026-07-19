import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStorySurface } from '../../screens/account-access/AuthStorySurface';

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Dostęp do konta/MFA',
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
        'cooldown',
        'success',
      ],
    },
  },
} satisfies Meta<typeof AuthStorySurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MfaPodstawowy: Story = {
  name: 'Podstawowy',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'idle',
  },
};

export const MfaWysylanie: Story = {
  name: 'Wysyłanie',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'submitting',
  },
};

export const MfaBlednyKod: Story = {
  name: 'Błędny kod',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'invalid',
  },
};

export const MfaKodWygasl: Story = {
  name: 'Kod wygasł',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'expired',
  },
};

export const MfaCooldown: Story = {
  name: 'Blokada ponownej wysyłki',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'cooldown',
  },
};

export const MfaKodPotwierdzony: Story = {
  name: 'Kod potwierdzony',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'success',
  },
};
