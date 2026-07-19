import { createServer as createNetServer } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';

import {
  localAuthCapabilities,
  localAuthFixtureNow,
  localAuthFixturePasswords,
  localAuthInvitationTokens,
  localAuthPasswordResetTokens,
} from '../../fixtures/auth-domain';
import type { AuthError, LoginOutcome, SessionResult } from '../../contracts/auth';
import { createLocalTestAuthHttpServer, type StartedAuthHttpServer } from './authHttpServer';

type JsonResponse<TBody = unknown> = {
  body: TBody;
  headers: Headers;
  status: number;
};

type MutableClock = {
  advance(milliseconds: number): void;
  now(): Date;
};

const startedServers: StartedAuthHttpServer[] = [];

afterEach(async () => {
  const servers = startedServers.splice(0);

  await Promise.all(
    servers.map(
      (started) =>
        new Promise<void>((resolve, reject) => {
          started.server.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        }),
    ),
  );
});

describe('server auth HTTP security boundary', () => {
  it('requires cookie-backed sessions and CSRF for state-changing operations', async () => {
    const { client } = await startAuthServer();
    const missing = await client.get<SessionResult>('/session/current');
    const rejected = await client.post<LoginOutcome>(
      '/session/login',
      {
        email: 'analyst@northstar.example',
        password: localAuthFixturePasswords.analyst,
      },
      { csrf: false },
    );

    expect(missing.status).toBe(401);
    expect(missing.body.status).toBe('missing');
    expect(rejected.status).toBe(403);
    expect(errorCode(rejected.body)).toBe('CSRF_INVALID');
  });

  it('sets an HttpOnly session cookie without exposing the cookie value as public state', async () => {
    const { client } = await startAuthServer();
    const login = await client.post<LoginOutcome>('/session/login', {
      email: 'analyst@northstar.example',
      password: localAuthFixturePasswords.analyst,
      returnUrl: 'https://evil.example/steal',
    });
    const cookie = client.cookie('pda_session');

    expect(login.status).toBe(200);
    expect(login.body.status).toBe('authenticated');
    expect(client.lastSetCookie()).toContain('HttpOnly');
    expect(client.lastSetCookie()).not.toContain('Secure');
    expect(cookie).toBeTruthy();

    if (login.body.status === 'authenticated' && cookie) {
      expect(login.body.session.sessionId).not.toBe(cookie);
      expect(login.body.returnUrl).toBe('/');
    }
  });

  it('expires, revokes, rotates and detects reuse of cookie sessions', async () => {
    const clock = mutableClock();
    const { client } = await startAuthServer(clock);

    await loginAnalyst(client);
    clock.advance(31 * 60 * 1000);

    const expired = await client.get<SessionResult>('/session/current');

    expect(expired.status).toBe(401);
    expect(errorCode(expired.body)).toBe('SESSION_EXPIRED');

    const { client: rotatedClient } = await startAuthServer();
    rotatedClient.setCookie('pda_session', 'attacker_fixed_session');
    await loginAnalyst(rotatedClient);

    const loginCookie = rotatedClient.cookie('pda_session');
    const refreshed = await rotatedClient.post<SessionResult>('/session/refresh');
    const refreshedCookie = rotatedClient.cookie('pda_session');

    expect(loginCookie).toBeTruthy();
    expect(loginCookie).not.toBe('attacker_fixed_session');
    expect(refreshed.status).toBe(200);
    expect(refreshedCookie).toBeTruthy();
    expect(refreshedCookie).not.toBe(loginCookie);

    if (loginCookie) {
      const oldCookieClient = rotatedClient.clone();
      oldCookieClient.setCookie('pda_session', loginCookie);
      const reused = await oldCookieClient.post<SessionResult>('/session/refresh');

      expect(reused.status).toBe(401);
      expect(errorCode(reused.body)).toBe('REFRESH_REUSE_DETECTED');
    }

    await rotatedClient.post('/session/logout');

    const revoked = await rotatedClient.get<SessionResult>('/session/current');

    expect(revoked.status).toBe(401);
    expect(revoked.body.status).toBe('missing');
  });

  it('denies wrong organization, wrong workspace, foreign workspace, no membership and missing capability', async () => {
    const { client } = await startAuthServer();

    await loginAnalyst(client);

    const missingCapability = await client.post('/authz/check', {
      capability: localAuthCapabilities.createInvitation,
      organizationId: 'org_northstar',
      workspaceId: 'wrk_northstar_main',
    });
    const wrongWorkspace = await client.post('/authz/check', {
      capability: localAuthCapabilities.listSessions,
      organizationId: 'org_baltic',
      workspaceId: 'wrk_baltic_marketplace',
    });
    const wrongOrganization = await client.post('/context/validate', {
      organizationId: 'org_unknown',
      workspaceId: 'wrk_northstar_main',
    });

    expect(missingCapability.status).toBe(403);
    expect(errorCode(missingCapability.body)).toBe('FORBIDDEN');
    expect(wrongWorkspace.status).toBe(403);
    expect(errorCode(wrongWorkspace.body)).toBe('FORBIDDEN');
    expect(wrongOrganization.status).toBe(403);

    const { client: noMembershipClient } = await startAuthServer();
    const login = await noMembershipClient.post<LoginOutcome>('/session/login', {
      email: 'nomembership@northstar.example',
      password: localAuthFixturePasswords.noMembership,
    });
    const denied = await noMembershipClient.post('/authz/check', {
      capability: localAuthCapabilities.listSessions,
      organizationId: 'org_northstar',
      workspaceId: 'wrk_northstar_main',
    });

    expect(login.body.status).toBe('authenticated');
    expect(denied.status).toBe(403);
    expect(errorCode(denied.body)).toBe('FORBIDDEN');
  });

  it('enforces one-time reset, invitation and recovery code use', async () => {
    const { client } = await startAuthServer();
    const expiredReset = await client.post('/password/reset/validate', {
      token: localAuthPasswordResetTokens.rst_expired_viewer,
    });
    const reset = await client.post('/password/reset/confirm', {
      confirmPassword: 'AnalystNextPassphrase123',
      newPassword: 'AnalystNextPassphrase123',
      token: localAuthPasswordResetTokens.rst_active_analyst,
    });
    const reusedReset = await client.post('/password/reset/confirm', {
      confirmPassword: 'AnalystOtherPassphrase123',
      newPassword: 'AnalystOtherPassphrase123',
      token: localAuthPasswordResetTokens.rst_active_analyst,
    });
    const expiredInvitation = await client.post('/invitations/check', {
      email: 'expired@northstar.example',
      token: localAuthInvitationTokens.inv_expired,
    });
    const invitation = await client.post<LoginOutcome>('/invitations/accept', {
      email: 'new-admin@northstar.example',
      password: 'InvitedAdminPassphrase123',
      token: localAuthInvitationTokens.inv_active_new_admin,
    });
    const reusedInvitation = await client.post<LoginOutcome>('/invitations/accept', {
      email: 'new-admin@northstar.example',
      password: 'InvitedAdminPassphrase123',
      token: localAuthInvitationTokens.inv_active_new_admin,
    });

    expect(expiredReset.status).toBe(400);
    expect(errorCode(expiredReset.body)).toBe('RESET_TOKEN_EXPIRED');
    expect(reset.status).toBe(200);
    expect(reusedReset.status).toBe(400);
    expect(errorCode(reusedReset.body)).toBe('RESET_TOKEN_USED');
    expect(expiredInvitation.status).toBe(400);
    expect(errorCode(expiredInvitation.body)).toBe('INVITATION_EXPIRED');
    expect(invitation.status).toBe(200);
    expect(reusedInvitation.status).toBe(400);
    expect(errorCode(reusedInvitation.body)).toBe('INVITATION_USED');

    const { client: recoveryClient } = await startAuthServer();
    const firstLogin = await recoveryClient.post<LoginOutcome>('/session/login', {
      email: 'owner@northstar.example',
      password: localAuthFixturePasswords.owner,
    });

    expect(firstLogin.body.status).toBe('mfa_required');

    if (firstLogin.body.status !== 'mfa_required') {
      return;
    }

    const firstRecovery = await recoveryClient.post<LoginOutcome>('/mfa/recovery/use', {
      challengeId: firstLogin.body.challenge.challengeId,
      code: '101010',
    });
    const secondLogin = await recoveryClient.post<LoginOutcome>('/session/login', {
      email: 'owner@northstar.example',
      password: localAuthFixturePasswords.owner,
    });

    expect(firstRecovery.body.status).toBe('authenticated');
    expect(secondLogin.body.status).toBe('mfa_required');

    if (secondLogin.body.status !== 'mfa_required') {
      return;
    }

    const reusedRecovery = await recoveryClient.post<LoginOutcome>('/mfa/recovery/use', {
      challengeId: secondLogin.body.challenge.challengeId,
      code: '101010',
    });

    expect(reusedRecovery.status).toBe(401);
    expect(errorCode(reusedRecovery.body)).toBe('MFA_INVALID');
  });

  it('rate limits repeated MFA failures and keeps unknown-user responses neutral', async () => {
    const { client } = await startAuthServer();
    const login = await client.post<LoginOutcome>('/session/login', {
      email: 'owner@northstar.example',
      password: localAuthFixturePasswords.owner,
    });

    expect(login.body.status).toBe('mfa_required');

    if (login.body.status !== 'mfa_required') {
      return;
    }

    await client.post('/mfa/challenge/verify', {
      challengeId: login.body.challenge.challengeId,
      code: '000000',
    });
    await client.post('/mfa/challenge/verify', {
      challengeId: login.body.challenge.challengeId,
      code: '000000',
    });
    await client.post('/mfa/challenge/verify', {
      challengeId: login.body.challenge.challengeId,
      code: '000000',
    });
    const limited = await client.post('/mfa/challenge/verify', {
      challengeId: login.body.challenge.challengeId,
      code: '000000',
    });

    expect(errorCode(limited.body)).toBe('MFA_RETRY_LIMITED');

    const known = await client.post<LoginOutcome>('/session/login', {
      email: 'analyst@northstar.example',
      password: 'WrongPassphrase123',
    });
    const unknown = await client.post<LoginOutcome>('/session/login', {
      email: 'unknown@northstar.example',
      password: 'WrongPassphrase123',
    });
    const knownReset = await client.post('/password/recovery/start', {
      email: 'viewer@northstar.example',
    });
    const unknownReset = await client.post('/password/recovery/start', {
      email: 'ghost@northstar.example',
    });

    expect(errorMessage(known.body)).toBe(errorMessage(unknown.body));
    expect(successMessage(knownReset.body)).toBe(successMessage(unknownReset.body));
  });

  it('does not write passwords, raw tokens, MFA codes or cookie values to audit output', async () => {
    const { client } = await startAuthServer();

    await client.post('/session/login', {
      email: 'owner@northstar.example',
      password: localAuthFixturePasswords.owner,
    });
    await client.post('/password/reset/validate', {
      token: localAuthPasswordResetTokens.rst_used_owner,
    });

    const cookie = client.cookie('pda_session');
    const audit = await client.get('/local-test/audit');
    const serialized = JSON.stringify(audit.body);

    expect(serialized).not.toContain(localAuthFixturePasswords.owner);
    expect(serialized).not.toContain(localAuthPasswordResetTokens.rst_used_owner);
    expect(serialized).not.toContain('123456');

    if (cookie) {
      expect(serialized).not.toContain(cookie);
    }
  });
});

async function startAuthServer(clock: MutableClock = mutableClock()) {
  const port = await reservePort();
  const host = `127.0.0.1:${port}`;
  const origin = `http://${host}`;
  const started = await createLocalTestAuthHttpServer({
    allowedHosts: [host],
    allowedOrigins: [origin],
    environment: 'test',
    now: clock.now,
  });

  await new Promise<void>((resolve) => {
    started.server.listen(port, '127.0.0.1', resolve);
  });
  startedServers.push(started);

  return {
    client: new AuthTestClient(origin, `${origin}/api/auth`),
    clock,
    started,
  };
}

class AuthTestClient {
  private csrfToken: string | undefined;

  private readonly cookies = new Map<string, string>();

  private readonly baseUrl: string;

  private lastSetCookieHeader = '';

  private readonly origin: string;

  constructor(origin: string, baseUrl: string) {
    this.baseUrl = baseUrl;
    this.origin = origin;
  }

  clone(): AuthTestClient {
    const cloned = new AuthTestClient(this.origin, this.baseUrl);

    for (const [name, value] of this.cookies.entries()) {
      cloned.cookies.set(name, value);
    }

    cloned.csrfToken = this.csrfToken;
    return cloned;
  }

  cookie(name: string): string | undefined {
    return this.cookies.get(name);
  }

  lastSetCookie(): string {
    return this.lastSetCookieHeader;
  }

  setCookie(name: string, value: string): void {
    this.cookies.set(name, value);
  }

  async get<TBody = unknown>(path: string): Promise<JsonResponse<TBody>> {
    return this.request(path, { method: 'GET' });
  }

  async post<TBody = unknown>(
    path: string,
    body?: unknown,
    options: { csrf: boolean } = { csrf: true },
  ): Promise<JsonResponse<TBody>> {
    if (options.csrf && !this.csrfToken) {
      await this.loadCsrf();
    }

    return this.request(path, {
      body,
      csrf: options.csrf,
      method: 'POST',
    });
  }

  private async loadCsrf(): Promise<void> {
    const response = await this.get<{ csrfToken: string }>('/csrf');
    this.csrfToken = response.body.csrfToken;
  }

  private async request<TBody>(
    path: string,
    init: {
      body?: unknown;
      csrf?: boolean;
      method: 'GET' | 'POST';
    },
  ): Promise<JsonResponse<TBody>> {
    const headers = new Headers();
    headers.set('Origin', this.origin);

    const cookieHeader = this.cookieHeader();

    if (cookieHeader) {
      headers.set('Cookie', cookieHeader);
    }

    if (init.method === 'POST') {
      headers.set('Content-Type', 'application/json');

      if (init.csrf && this.csrfToken) {
        headers.set('X-PapaData-CSRF', this.csrfToken);
      }
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      headers,
      method: init.method,
    });

    this.storeSetCookie(response.headers);

    return {
      body: await response.json() as TBody,
      headers: response.headers,
      status: response.status,
    };
  }

  private cookieHeader(): string {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
      .join('; ');
  }

  private storeSetCookie(headers: Headers): void {
    const setCookieHeaders = getSetCookie(headers);
    this.lastSetCookieHeader = setCookieHeaders.join('\n');

    for (const setCookie of setCookieHeaders) {
      const [pair = ''] = setCookie.split(';');
      const [name = '', value = ''] = pair.split('=');

      if (!name) {
        continue;
      }

      if (setCookie.includes('Max-Age=0')) {
        this.cookies.delete(name);
      } else {
        this.cookies.set(name, decodeURIComponent(value));
      }
    }
  }
}

async function loginAnalyst(client: AuthTestClient): Promise<void> {
  const login = await client.post<LoginOutcome>('/session/login', {
    email: 'analyst@northstar.example',
    password: localAuthFixturePasswords.analyst,
  });

  expect(login.status).toBe(200);
  expect(login.body.status).toBe('authenticated');
}

function mutableClock(): MutableClock {
  let current = new Date(localAuthFixtureNow);

  return {
    advance(milliseconds) {
      current = new Date(current.getTime() + milliseconds);
    },
    now() {
      return new Date(current);
    },
  };
}

async function reservePort(): Promise<number> {
  return await new Promise<number>((resolve, reject) => {
    const server = createNetServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => {
        if (typeof address === 'object' && address) {
          resolve(address.port);
          return;
        }

        reject(new Error('Unable to reserve test port.'));
      });
    });
  });
}

function getSetCookie(headers: Headers): string[] {
  const withSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (withSetCookie.getSetCookie) {
    return withSetCookie.getSetCookie();
  }

  const header = headers.get('set-cookie');
  return header ? [header] : [];
}

function errorCode(body: unknown): AuthError['code'] | undefined {
  const error = errorFromBody(body);
  return error?.code;
}

function errorMessage(body: unknown): string | undefined {
  const error = errorFromBody(body);
  return error?.message;
}

function successMessage(body: unknown): string | undefined {
  if (!isRecord(body) || body.status !== 'success' || !isRecord(body.value)) {
    return undefined;
  }

  const message = body.value.neutralMessage;
  return typeof message === 'string' ? message : undefined;
}

function errorFromBody(body: unknown): AuthError | undefined {
  if (!isRecord(body)) {
    return undefined;
  }

  if (isRecord(body.error) && typeof body.error.code === 'string') {
    return body.error as AuthError;
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
