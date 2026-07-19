import * as v from 'valibot';

import type {
  AuthError,
  InvitationAcceptInput,
  PasswordChangeInput,
  LoginInput,
  PasswordResetConfirmInput,
  PasswordResetValidateInput,
  PasswordResetStartInput,
  ReauthenticationInput,
} from '../contracts/auth';

const passwordMinimumLength = 12;

const emailSchema = v.pipe(
  v.string(),
  v.trim(),
  v.email('Podaj poprawny adres e-mail.'),
);

const newPasswordSchema = v.pipe(
  v.string(),
  v.minLength(
    passwordMinimumLength,
    'Hasło musi mieć co najmniej 12 znaków.',
  ),
  v.regex(/[a-z]/, 'Hasło wymaga małej litery.'),
  v.regex(/[A-Z]/, 'Hasło wymaga wielkiej litery.'),
  v.regex(/[0-9]/, 'Hasło wymaga cyfry.'),
);

export const loginInputSchema = v.object({
  email: emailSchema,
  password: v.pipe(
    v.string(),
    v.minLength(1, 'Hasło jest wymagane.'),
  ),
  returnUrl: v.optional(v.string()),
});

export const passwordResetStartSchema = v.object({
  email: emailSchema,
});

export const passwordResetConfirmSchema = v.object({
  confirmPassword: v.string(),
  newPassword: newPasswordSchema,
  token: v.pipe(v.string(), v.minLength(16, 'Link jest nieprawidłowy.')),
});

export const passwordChangeSchema = v.object({
  confirmPassword: v.string(),
  currentPassword: v.pipe(v.string(), v.minLength(1, 'Aktualne hasło jest wymagane.')),
  newPassword: newPasswordSchema,
  sessionId: v.pipe(v.string(), v.minLength(1)),
});

export const passwordResetValidateSchema = v.object({
  token: v.pipe(v.string(), v.minLength(16, 'Link jest nieprawidłowy.')),
});

export const invitationAcceptSchema = v.object({
  email: emailSchema,
  password: v.optional(
    v.pipe(
      v.string(),
      v.minLength(
        passwordMinimumLength,
        'Hasło musi mieć co najmniej 12 znaków.',
      ),
    ),
  ),
  token: v.pipe(v.string(), v.minLength(16, 'Zaproszenie jest nieprawidłowe.')),
});

export const reauthenticationSchema = v.object({
  password: v.pipe(v.string(), v.minLength(1, 'Hasło jest wymagane.')),
  purpose: v.picklist([
    'change_password',
    'disable_mfa',
    'regenerate_recovery_codes',
    'revoke_session',
    'admin_action',
    'export',
    'ai_action',
  ]),
  sessionId: v.pipe(v.string(), v.minLength(1)),
});

export const mfaCodeSchema = v.pipe(
  v.string(),
  v.trim(),
  v.regex(/^[0-9]{6}$/, 'Kod MFA ma sześć cyfr.'),
);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateLoginInput(input: LoginInput) {
  return v.safeParse(loginInputSchema, input);
}

export function validatePasswordResetStart(input: PasswordResetStartInput) {
  return v.safeParse(passwordResetStartSchema, input);
}

export function validatePasswordResetConfirm(input: PasswordResetConfirmInput) {
  const result = v.safeParse(passwordResetConfirmSchema, input);

  if (!result.success) {
    return result;
  }

  if (result.output.newPassword !== result.output.confirmPassword) {
    return {
      ...result,
      issues: [
        {
          expected: 'matching password confirmation',
          input: result.output.confirmPassword,
          kind: 'validation',
          message: 'Potwierdzenie hasła musi być zgodne z nowym hasłem.',
          received: 'different value',
          type: 'custom',
        },
      ],
      success: false as const,
    };
  }

  return result;
}

export function validatePasswordChange(input: PasswordChangeInput) {
  const result = v.safeParse(passwordChangeSchema, input);

  if (!result.success) {
    return result;
  }

  if (result.output.newPassword !== result.output.confirmPassword) {
    return {
      ...result,
      issues: [
        {
          expected: 'matching password confirmation',
          input: result.output.confirmPassword,
          kind: 'validation',
          message: 'Potwierdzenie hasła musi być zgodne z nowym hasłem.',
          received: 'different value',
          type: 'custom',
        },
      ],
      success: false as const,
    };
  }

  return result;
}

export function validatePasswordResetToken(input: PasswordResetValidateInput) {
  return v.safeParse(passwordResetValidateSchema, input);
}

export function validateInvitationAccept(input: InvitationAcceptInput) {
  return v.safeParse(invitationAcceptSchema, input);
}

export function validateReauthentication(input: ReauthenticationInput) {
  return v.safeParse(reauthenticationSchema, input);
}

export function validationAuthError(message = 'Sprawdź dane formularza.'): AuthError {
  return {
    code: 'VALIDATION_ERROR',
    message,
    retrySafe: true,
  };
}

export function sanitizeReturnUrl(returnUrl: string | undefined): string {
  if (!returnUrl) {
    return '/';
  }

  try {
    const decodedUrl = decodeURIComponent(returnUrl.trim());

    if (!decodedUrl.startsWith('/') || decodedUrl.startsWith('//')) {
      return '/';
    }

    const parsed = new URL(decodedUrl, 'https://app.papadata.local');

    if (parsed.origin !== 'https://app.papadata.local') {
      return '/';
    }

    if (parsed.pathname.startsWith('/auth')) {
      return '/';
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/';
  }
}
