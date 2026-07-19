import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStorySurface } from '../../screens/account-access/AuthStorySurface';

const meta = {
  title: 'PapaData/Dostęp do konta/Proces dostępu',
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
    initialScreen: {
      control: 'select',
      options: [
        'login',
        'register',
        'emailVerification',
        'mfa',
        'recovery',
        'invitation',
        'signedOut',
        'authUnavailable',
        'accessBlocked',
        'reauthentication',
        'accessResolution',
        'complete',
      ],
    },
    initialTheme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
    initialVerificationState: {
      control: 'select',
      options: [
        'idle',
        'incomplete',
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

export const CalyProces: Story = {
  name: 'Cały proces',
  args: {
    initialScreen: 'login',
    initialTheme: 'dark',
  },
};

export const Logowanie: Story = {
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
  name: 'Provider niedostępny',
  args: {
    initialLoginState: 'providerUnavailable',
    initialScreen: 'login',
    initialTheme: 'dark',
  },
};

export const Rejestracja: Story = {
  name: 'Rejestracja — wariant warunkowy',
  args: {
    initialScreen: 'register',
    initialTheme: 'dark',
  },
};

export const EmailVerificationPodstawowy: Story = {
  name: 'Email verification — podstawowy',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'idle',
  },
};

export const EmailVerificationWysylanie: Story = {
  name: 'Email verification — wysyłanie',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'submitting',
  },
};

export const EmailVerificationBlednyKod: Story = {
  name: 'Email verification — błędny kod',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'invalid',
  },
};

export const EmailVerificationKodWygasl: Story = {
  name: 'Email verification — kod wygasł',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'expired',
  },
};

export const EmailVerificationKodWyslanyPonownie: Story = {
  name: 'Email verification — kod wysłany ponownie',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'resent',
  },
};

export const EmailVerificationCooldown: Story = {
  name: 'Email verification — cooldown',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'cooldown',
  },
};

export const EmailVerificationKodPotwierdzony: Story = {
  name: 'Email verification — kod potwierdzony',
  args: {
    initialScreen: 'emailVerification',
    initialTheme: 'dark',
    initialVerificationState: 'success',
  },
};

export const MfaPodstawowy: Story = {
  name: 'MFA — podstawowy',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'idle',
  },
};

export const MfaWysylanie: Story = {
  name: 'MFA — wysyłanie',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'submitting',
  },
};

export const MfaBlednyKod: Story = {
  name: 'MFA — błędny kod',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'invalid',
  },
};

export const MfaKodWygasl: Story = {
  name: 'MFA — kod wygasł',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'expired',
  },
};

export const MfaCooldown: Story = {
  name: 'MFA — cooldown',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'cooldown',
  },
};

export const MfaKodPotwierdzony: Story = {
  name: 'MFA — kod potwierdzony',
  args: {
    initialScreen: 'mfa',
    initialTheme: 'dark',
    initialVerificationState: 'success',
  },
};

export const OdzyskiwanieDostepu: Story = {
  name: 'Odzyskiwanie dostępu',
  args: {
    initialScreen: 'recovery',
    initialTheme: 'dark',
  },
};

export const AkceptacjaZaproszenia: Story = {
  name: 'Akceptacja zaproszenia',
  args: {
    initialScreen: 'invitation',
    initialTheme: 'dark',
  },
};

export const SesjaZakonczona: Story = {
  name: 'Sesja zakończona',
  args: {
    initialScreen: 'signedOut',
    initialTheme: 'dark',
  },
};

export const StanDostepuNiedostepny: Story = {
  name: 'Stan dostępu niedostępny',
  args: {
    initialScreen: 'authUnavailable',
    initialTheme: 'dark',
  },
};

export const DostepZablokowany: Story = {
  name: 'Dostęp zablokowany',
  args: {
    initialScreen: 'accessBlocked',
    initialTheme: 'dark',
  },
};

export const PonowneUwierzytelnienie: Story = {
  name: 'Ponowne uwierzytelnienie',
  args: {
    initialScreen: 'reauthentication',
    initialTheme: 'dark',
  },
};

export const RozwiazanieDostepu: Story = {
  name: 'Rozwiązanie dostępu',
  args: {
    initialScreen: 'accessResolution',
    initialTheme: 'dark',
  },
};

export const DostepGotowy: Story = {
  name: 'Dostęp gotowy',
  args: {
    initialScreen: 'complete',
    initialTheme: 'dark',
  },
};
