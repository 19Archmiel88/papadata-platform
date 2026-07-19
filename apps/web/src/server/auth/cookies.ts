import type { IncomingMessage, ServerResponse } from 'node:http';

export type AuthCookieOptions = {
  domain?: string;
  environment: 'local' | 'production' | 'test';
  maxAgeSeconds: number;
  path: string;
  sameSite: 'Lax' | 'Strict';
};

export const authSessionCookieName = 'pda_session';
export const authCsrfCookieName = 'pda_csrf';

export function getCookie(request: IncomingMessage, name: string): string | undefined {
  const header = request.headers.cookie;

  if (!header) {
    return undefined;
  }

  const pairs = header.split(';');

  for (const pair of pairs) {
    const [rawKey, ...rawValue] = pair.trim().split('=');

    if (rawKey === name) {
      return decodeURIComponent(rawValue.join('='));
    }
  }

  return undefined;
}

export function setSessionCookie(
  response: ServerResponse,
  value: string,
  options: AuthCookieOptions,
): void {
  appendSetCookie(
    response,
    serializeCookie(authSessionCookieName, value, {
      ...options,
      httpOnly: true,
    }),
  );
}

export function clearSessionCookie(
  response: ServerResponse,
  options: AuthCookieOptions,
): void {
  appendSetCookie(
    response,
    serializeCookie(authSessionCookieName, '', {
      ...options,
      httpOnly: true,
      maxAgeSeconds: 0,
    }),
  );
}

export function setCsrfCookie(
  response: ServerResponse,
  value: string,
  options: AuthCookieOptions,
): void {
  appendSetCookie(
    response,
    serializeCookie(authCsrfCookieName, value, {
      ...options,
      httpOnly: false,
    }),
  );
}

function appendSetCookie(response: ServerResponse, cookie: string): void {
  const existing = response.getHeader('Set-Cookie');

  if (!existing) {
    response.setHeader('Set-Cookie', cookie);
    return;
  }

  if (Array.isArray(existing)) {
    response.setHeader('Set-Cookie', [...existing, cookie]);
    return;
  }

  response.setHeader('Set-Cookie', [String(existing), cookie]);
}

function serializeCookie(
  name: string,
  value: string,
  options: AuthCookieOptions & {
    httpOnly: boolean;
  },
): string {
  const attributes = [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${options.maxAgeSeconds}`,
    `Path=${options.path}`,
    `SameSite=${options.sameSite}`,
  ];

  if (options.domain) {
    attributes.push(`Domain=${options.domain}`);
  }

  if (options.httpOnly) {
    attributes.push('HttpOnly');
  }

  if (options.environment === 'production') {
    attributes.push('Secure');
  }

  return attributes.join('; ');
}
