export type AuthScreen =
  | 'login'
  | 'register'
  | 'emailVerification'
  | 'mfa'
  | 'verification'
  | 'recovery'
  | 'invitation'
  | 'signedOut'
  | 'authUnavailable'
  | 'accessBlocked'
  | 'reauthentication'
  | 'accessResolution'
  | 'complete';

export type LoginState =
  | 'default'
  | 'submitting'
  | 'invalidCredentials'
  | 'providerUnavailable';

export type VerificationKind = 'emailVerification' | 'mfa';

export type VerificationCodeState =
  | 'idle'
  | 'incomplete'
  | 'submitting'
  | 'invalid'
  | 'expired'
  | 'resent'
  | 'cooldown'
  | 'success';

export const verificationCodeLength = 6;
export const verificationCooldownSeconds = 60;
export const staticCooldownSeconds = 42;

export const verificationCodeSettings: Record<
  VerificationKind,
  {
    changeLabel: string;
    changeTarget: AuthScreen;
    fieldLabel: string;
    headerEyebrow: string;
    headerText: string;
    headerTitle: string;
    name: string;
    resendLabel: string;
    submitLabel: string;
  }
> = {
  emailVerification: {
    changeLabel: 'Zmień adres e-mail',
    changeTarget: 'recovery',
    fieldLabel: 'Kod weryfikacyjny',
    headerEyebrow: 'Kod e-mail',
    headerText:
      'Wpisz 6-cyfrowy kod wysłany na a***@northstar.example.',
    headerTitle: 'Potwierdź adres e-mail',
    name: 'email-verification-code',
    resendLabel: 'Wyślij kod ponownie',
    submitLabel: 'Potwierdź adres',
  },
  mfa: {
    changeLabel: 'Wróć do logowania',
    changeTarget: 'login',
    fieldLabel: 'Kod bezpieczeństwa',
    headerEyebrow: 'Kod bezpieczeństwa',
    headerText:
      'Wpisz 6-cyfrowy kod, aby dokończyć bezpieczne logowanie.',
    headerTitle: 'Potwierdź logowanie',
    name: 'mfa-code',
    resendLabel: 'Wyślij kod ponownie',
    submitLabel: 'Potwierdź logowanie',
  },
};

export const authIdentityFixture = {
  email: 'anna@northstar.example',
  fullName: 'Anna Kowalska',
  invitationIdentifier: 'INV-NR-2048',
  organizationName: 'Northstar Retail',
} as const;

export type AuthCodeExample = {
  disabled?: boolean;
  errorMessage?: string;
  id: string;
  initialValue: string;
  invalid?: boolean;
  label: string;
};

export const authCodeExamples: readonly AuthCodeExample[] = [
  {
    id: 'component-code-empty',
    initialValue: '',
    label: 'Kod dostępu — pusty',
  },
  {
    id: 'component-code-partial',
    initialValue: '123',
    label: 'Kod dostępu — częściowy',
  },
  {
    id: 'component-code-complete',
    initialValue: '123456',
    label: 'Kod dostępu — kompletny',
  },
  {
    errorMessage:
      'Kod jest nieprawidłowy. Sprawdź wpisane cyfry i spróbuj ponownie.',
    id: 'component-code-invalid',
    initialValue: '',
    invalid: true,
    label: 'Kod dostępu — błędny',
  },
  {
    disabled: true,
    id: 'component-code-disabled',
    initialValue: '123456',
    label: 'Kod dostępu — nieaktywny',
  },
];
