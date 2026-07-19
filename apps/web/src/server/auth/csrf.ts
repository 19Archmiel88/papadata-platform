import type { IncomingMessage } from 'node:http';

import { authCsrfCookieName, getCookie } from './cookies';

export type CsrfValidationOptions = {
  allowedHosts: readonly string[];
  allowedOrigins: readonly string[];
};

export type CsrfValidationResult =
  | {
      valid: true;
    }
  | {
      reason: 'host_mismatch' | 'missing_origin' | 'origin_mismatch' | 'token_mismatch';
      valid: false;
    };

export function createCsrfToken(now: Date, entropy: () => string): string {
  return `csrf_${now.getTime().toString(36)}_${entropy()}`;
}

export function validateCsrfRequest(
  request: IncomingMessage,
  options: CsrfValidationOptions,
): CsrfValidationResult {
  const host = request.headers.host;

  if (!host || !options.allowedHosts.includes(host)) {
    return {
      reason: 'host_mismatch',
      valid: false,
    };
  }

  const origin = request.headers.origin;

  if (!origin) {
    return {
      reason: 'missing_origin',
      valid: false,
    };
  }

  if (!options.allowedOrigins.includes(origin)) {
    return {
      reason: 'origin_mismatch',
      valid: false,
    };
  }

  const headerToken = getSingleHeader(request.headers['x-papadata-csrf']);
  const cookieToken = getCookie(request, authCsrfCookieName);

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return {
      reason: 'token_mismatch',
      valid: false,
    };
  }

  return {
    valid: true,
  };
}

function getSingleHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
