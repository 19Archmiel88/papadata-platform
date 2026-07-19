import { createServer as createNetServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, type Page, test } from 'playwright/test';
import { createServer, type ViteDevServer } from 'vite';

import {
  localAuthFixtureNow,
  localAuthFixturePasswords,
  localAuthInvitationTokens,
  localAuthPasswordResetTokens,
} from '../src/fixtures/auth-domain';
import {
  createLocalTestAuthHttpServer,
  type StartedAuthHttpServer,
} from '../src/server/auth/authHttpServer';

type BrowserApiResponse<TBody = unknown> = {
  body: TBody;
  status: number;
};

type TestRuntime = {
  auth: StartedAuthHttpServer;
  clock: MutableClock;
  frontendUrl: string;
  vite: ViteDevServer;
};

type MutableClock = {
  advance(milliseconds: number): void;
  now(): Date;
};

const dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(dirname, '..');

let runtime: TestRuntime | undefined;

test.afterEach(async () => {
  if (!runtime) {
    return;
  }

  await runtime.vite.close();
  await new Promise<void>((resolve, reject) => {
    runtime?.auth.server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
  runtime = undefined;
});

test('login without MFA, restore after reload, expiry and logout use HTTP cookies', async ({ page }) => {
  runtime = await startRuntime();
  await page.goto(runtime.frontendUrl);

  await page.getByRole('textbox', { name: 'Hasło' }).fill(localAuthFixturePasswords.analyst);
  await page.getByRole('button', { name: /Zaloguj/i }).click();
  await expect(page.getByText(/Sesja aktywna/i)).toBeVisible();

  const currentBeforeReload = await browserGet(page, '/session/current');
  await page.reload();
  const currentAfterReload = await browserGet(page, '/session/current');

  expect(currentBeforeReload.status).toBe(200);
  expect(currentAfterReload.status).toBe(200);

  runtime.clock.advance(31 * 60 * 1000);

  const expired = await browserGet(page, '/session/current');

  expect(expired.status).toBe(401);
  expect(errorCode(expired.body)).toBe('SESSION_EXPIRED');

  await page.reload();
  await page.getByRole('textbox', { name: 'Hasło' }).fill(localAuthFixturePasswords.analyst);
  await page.getByRole('button', { name: /Zaloguj/i }).click();
  await expect(page.getByText(/Sesja aktywna/i)).toBeVisible();

  const logout = await browserPost(page, '/session/logout');
  const afterLogout = await browserGet(page, '/session/current');

  expect(logout.status).toBe(200);
  expect(afterLogout.status).toBe(401);
});

test('login with MFA and reauthentication can revoke another session', async ({ page }) => {
  runtime = await startRuntime();
  await page.goto(runtime.frontendUrl);

  await loginOwnerWithMfa(page);
  await loginOwnerWithMfa(page);
  await page.getByRole('button', { name: /Ponowne uwierzytelnienie/i }).click();
  await page.getByRole('textbox', { name: 'Hasło' }).fill(localAuthFixturePasswords.owner);
  await page.getByRole('button', { name: /Potwierdź/i }).click();
  await expect(page.getByText(/Potwierdzenie ważne/i)).toBeVisible();
  await page.getByRole('button', { name: /Sesje/i }).click();
  await page.getByRole('button', { name: /Unieważnij pozostałe/i }).click();
  await expect(page.getByText(/Pozostałe sesje zostały unieważnione/i)).toBeVisible();
});

test('forgot password reset, active invitation, expired invitation and email mismatch stay server-side', async ({ page }) => {
  runtime = await startRuntime();
  await page.goto(runtime.frontendUrl);

  await page.getByRole('button', { name: /Odzyskiwanie/i }).click();
  await page.getByRole('button', { name: /Wyślij instrukcje/i }).click();
  await expect(page.getByText(/wyślemy dalsze instrukcje/i)).toBeVisible();
  await page.getByRole('button', { name: /Reset hasła/i }).click();
  await page.getByRole('textbox', { name: 'Token procesu' }).fill(localAuthPasswordResetTokens.rst_active_analyst);
  await page.getByRole('button', { name: /Ustaw hasło/i }).click();
  await expect(page.getByText(/Hasło zostało zmienione/i)).toBeVisible();
  await page.getByRole('button', { name: /Zaproszenie/i }).click();
  await page.getByRole('textbox', { name: 'Hasło' }).fill('InvitedAdminPassphrase123');
  await page.getByRole('textbox', { name: 'Token zaproszenia' }).fill(localAuthInvitationTokens.inv_active_new_admin);
  await page.getByRole('button', { name: /Przyjmij zaproszenie/i }).click();
  await expect(page.getByText(/Zaproszenie zostało zaakceptowane/i)).toBeVisible();

  const expiredInvitation = await browserPost(page, '/invitations/check', {
    email: 'expired@northstar.example',
    token: localAuthInvitationTokens.inv_expired,
  });
  const mismatch = await browserPost(page, '/invitations/check', {
    email: 'someone-else@northstar.example',
    token: localAuthInvitationTokens.inv_membership_conflict,
  });

  expect(expiredInvitation.status).toBe(400);
  expect(errorCode(expiredInvitation.body)).toBe('INVITATION_EXPIRED');
  expect(mismatch.status).toBe(400);
  expect(errorCode(mismatch.body)).toBe('INVITATION_EMAIL_MISMATCH');
});

test('workspace selection, no membership, CSRF rejection, foreign workspace and deny-by-default are backend decisions', async ({ page }) => {
  runtime = await startRuntime();
  await page.goto(runtime.frontendUrl);

  await browserPost(page, '/session/login', {
    email: 'multi-workspace@northstar.example',
    password: localAuthFixturePasswords.multiWorkspace,
  });

  const selected = await browserPost(page, '/context/select', {
    organizationId: 'org_northstar',
    workspaceId: 'wrk_northstar_lab',
  });

  expect(selected.status).toBe(200);
  expect(valueStatus(selected.body)).toBe('workspace_not_ready');

  const csrfRejected = await browserPost(
    page,
    '/session/login',
    {
      email: 'analyst@northstar.example',
      password: localAuthFixturePasswords.analyst,
    },
    false,
  );

  expect(csrfRejected.status).toBe(403);
  expect(errorCode(csrfRejected.body)).toBe('CSRF_INVALID');

  await browserPost(page, '/session/login', {
    email: 'viewer@northstar.example',
    password: localAuthFixturePasswords.viewer,
  });

  const deniedByDefault = await browserPost(page, '/authz/check', {
    capability: 'auth:invitation:create',
    organizationId: 'org_northstar',
    workspaceId: 'wrk_northstar_main',
  });
  const foreignWorkspace = await browserPost(page, '/authz/check', {
    capability: 'auth:session:list',
    organizationId: 'org_baltic',
    workspaceId: 'wrk_baltic_marketplace',
  });

  expect(deniedByDefault.status).toBe(403);
  expect(errorCode(deniedByDefault.body)).toBe('FORBIDDEN');
  expect(foreignWorkspace.status).toBe(403);
  expect(errorCode(foreignWorkspace.body)).toBe('FORBIDDEN');

  await browserPost(page, '/session/login', {
    email: 'nomembership@northstar.example',
    password: localAuthFixturePasswords.noMembership,
  });

  const noMembership = await browserPost(page, '/authz/check', {
    capability: 'auth:session:list',
    organizationId: 'org_northstar',
    workspaceId: 'wrk_northstar_main',
  });

  expect(noMembership.status).toBe(403);
  expect(errorCode(noMembership.body)).toBe('FORBIDDEN');
});

async function startRuntime(): Promise<TestRuntime> {
  const clock = mutableClock();
  const authPort = await reservePort();
  const frontendPort = await reservePort();
  const authHost = `127.0.0.1:${authPort}`;
  const frontendHost = `127.0.0.1:${frontendPort}`;
  const authOrigin = `http://${authHost}`;
  const frontendUrl = `http://${frontendHost}`;
  const auth = await createLocalTestAuthHttpServer({
    allowedHosts: [authHost, frontendHost],
    allowedOrigins: [frontendUrl],
    environment: 'test',
    now: clock.now,
  });

  await new Promise<void>((resolve) => {
    auth.server.listen(authPort, '127.0.0.1', resolve);
  });

  const vite = await createServer({
    configFile: path.join(appRoot, 'vite.config.ts'),
    root: appRoot,
    server: {
      host: '127.0.0.1',
      port: frontendPort,
      proxy: {
        '/api/auth': {
          changeOrigin: false,
          target: authOrigin,
        },
      },
      strictPort: true,
    },
  });

  await vite.listen();

  return {
    auth,
    clock,
    frontendUrl,
    vite,
  };
}

async function browserGet<TBody = unknown>(
  page: Page,
  path: string,
): Promise<BrowserApiResponse<TBody>> {
  return await page.evaluate(async (apiPath) => {
    const response = await fetch(`/api/auth${apiPath}`, {
      credentials: 'include',
      method: 'GET',
    });

    return {
      body: await response.json() as TBody,
      status: response.status,
    };
  }, path);
}

async function browserPost<TBody = unknown>(
  page: Page,
  path: string,
  body?: unknown,
  csrf = true,
): Promise<BrowserApiResponse<TBody>> {
  return await page.evaluate(
    async ({ apiPath, payload, withCsrf }) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (withCsrf) {
        const csrfResponse = await fetch('/api/auth/csrf', {
          credentials: 'include',
          method: 'GET',
        });
        const csrfPayload = await csrfResponse.json() as { csrfToken: string };
        headers['X-PapaData-CSRF'] = csrfPayload.csrfToken;
      }

      const response = await fetch(`/api/auth${apiPath}`, {
        body: payload === undefined ? undefined : JSON.stringify(payload),
        credentials: 'include',
        headers,
        method: 'POST',
      });

      return {
        body: await response.json() as TBody,
        status: response.status,
      };
    },
    {
      apiPath: path,
      payload: body,
      withCsrf: csrf,
    },
  );
}

async function loginOwnerWithMfa(page: Page): Promise<void> {
  const login = await browserPost(page, '/session/login', {
    email: 'owner@northstar.example',
    password: localAuthFixturePasswords.owner,
  });

  expect(valueStatus(login.body)).toBe('mfa_required');

  const challengeId = challengeIdFrom(login.body);

  expect(challengeId).toBeTruthy();

  await browserPost(page, '/mfa/challenge/verify', {
    challengeId,
    code: '123456',
  });
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

        reject(new Error('Unable to reserve a test port.'));
      });
    });
  });
}

function errorCode(body: unknown): string | undefined {
  if (!isRecord(body) || !isRecord(body.error)) {
    return undefined;
  }

  const code = body.error.code;
  return typeof code === 'string' ? code : undefined;
}

function valueStatus(body: unknown): string | undefined {
  if (!isRecord(body)) {
    return undefined;
  }

  if (typeof body.status === 'string' && body.status !== 'success') {
    return body.status;
  }

  if (isRecord(body.value) && typeof body.value.status === 'string') {
    return body.value.status;
  }

  return undefined;
}

function challengeIdFrom(body: unknown): string | undefined {
  if (!isRecord(body) || !isRecord(body.challenge)) {
    return undefined;
  }

  const challengeId = body.challenge.challengeId;
  return typeof challengeId === 'string' ? challengeId : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
