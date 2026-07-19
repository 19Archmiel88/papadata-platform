import { describe, expect, it } from 'vitest';

import {
  sanitizeReturnUrl,
  validatePasswordResetConfirm,
  validateLoginInput,
} from './validation';

describe('auth validation', () => {
  it('keeps only same-origin relative return URLs', () => {
    expect(sanitizeReturnUrl('/dashboard?range=30d')).toBe('/dashboard?range=30d');
    expect(sanitizeReturnUrl('https://evil.example/dashboard')).toBe('/');
    expect(sanitizeReturnUrl('//evil.example/dashboard')).toBe('/');
    expect(sanitizeReturnUrl('/auth/login?returnUrl=/dashboard')).toBe('/');
  });

  it('returns validation error for malformed login data', () => {
    const result = validateLoginInput({
      email: 'not-an-email',
      password: '',
      returnUrl: '/dashboard',
    });

    expect(result.success).toBe(false);
  });

  it('rejects password reset confirmation mismatch', () => {
    const result = validatePasswordResetConfirm({
      confirmPassword: 'DifferentPassphrase123',
      newPassword: 'ValidPassphrase123',
      token: 'reset-active-analyst-token',
    });

    expect(result.success).toBe(false);
  });
});
