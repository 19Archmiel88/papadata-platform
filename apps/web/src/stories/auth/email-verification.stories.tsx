import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStorySurface } from '../../screens/account-access/AuthStorySurface';

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Dostęp do konta/Weryfikacja adresu e-mail',
  component: AuthStorySurface,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AuthStorySurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podstawowa: Story = {
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'idle',
  },
};

export const BlednyKod: Story = {
  name: 'Błędny kod',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'invalid',
  },
};

export const KodWygasl: Story = {
  name: 'Kod wygasł',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'expired',
  },
};

export const KodWyslanyPonownie: Story = {
  name: 'Kod wysłany ponownie',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'resent',
  },
};

export const Cooldown: Story = {
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'cooldown',
  },
};

export const Sukces: Story = {
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'success',
  },
};
