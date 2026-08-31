import {
  describe,
  expect,
  it,
} from 'vitest';

import { BffClient, BffProblem } from './bffClient';

// Blocker 2 (Phase 8): BffProblem.requiredAuthLevel must come from a
// structural field on the response body -- set by CapabilityGuard on the
// API (forwarded verbatim by the BFF's proxy as an ApiProblem) or by the
// BFF's own two auth-level guards (session-assurance's
// issueStepUp/disableMfa) -- never inferred by scanning message/detail text.

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  });
}

function clientReturning(response: Response): BffClient {
  return new BffClient({ fetchImpl: async () => response });
}

describe('BffClient requiredAuthLevel mapping (structural, not text-parsed)', () => {
  it('maps an API-proxied ApiProblem carrying requiredAuthLevel=mfa', async () => {
    const client = clientReturning(jsonResponse(403, {
      code: 'REQUEST_REJECTED',
      correlationId: 'corr-1',
      detail: 'Required authentication level is missing.',
      recoverable: false,
      requiredAuthLevel: 'mfa',
      status: 403,
      title: 'Access denied',
      type: 'https://papadata.pl/problems/request-rejected',
    }));

    const rejection = await client.readDomainScreen('/api/v1/probe').catch((error: unknown) => error);
    expect(rejection).toBeInstanceOf(BffProblem);
    expect((rejection as BffProblem).requiredAuthLevel).toBe('mfa');
  });

  it('maps a BFF-native structured 403 carrying requiredAuthLevel=step_up', async () => {
    const client = clientReturning(jsonResponse(403, {
      error: { code: 'STEP_UP_ASSURANCE_REQUIRED', message: 'Step-up assurance is required.' },
      requiredAuthLevel: 'step_up',
    }));

    const rejection = await client.readDomainScreen('/api/v1/probe').catch((error: unknown) => error);
    expect(rejection).toBeInstanceOf(BffProblem);
    expect((rejection as BffProblem).requiredAuthLevel).toBe('step_up');
  });

  it('a plain capability-denied 403 (no requiredAuthLevel field) maps to null -- not a guessed level', async () => {
    const client = clientReturning(jsonResponse(403, {
      error: { code: 'REQUEST_REJECTED', message: 'Required capability is missing.' },
    }));

    const rejection = await client.readDomainScreen('/api/v1/probe').catch((error: unknown) => error);
    expect(rejection).toBeInstanceOf(BffProblem);
    expect((rejection as BffProblem).requiredAuthLevel).toBeNull();
  });

  it('a 403 whose message text mentions "step-up"/"mfa" but has no structured field still maps to null', async () => {
    // Regression guard for the removed text-scanning heuristic: prose
    // containing these words must never be enough on its own.
    const client = clientReturning(jsonResponse(403, {
      error: { code: 'REQUEST_REJECTED', message: 'This operation may require step-up or mfa in the future.' },
    }));

    const rejection = await client.readDomainScreen('/api/v1/probe').catch((error: unknown) => error);
    expect((rejection as BffProblem).requiredAuthLevel).toBeNull();
  });

  it('an unrecognized requiredAuthLevel value is ignored rather than passed through', async () => {
    const client = clientReturning(jsonResponse(403, {
      error: { code: 'REQUEST_REJECTED', message: 'Denied.' },
      requiredAuthLevel: 'admin',
    }));

    const rejection = await client.readDomainScreen('/api/v1/probe').catch((error: unknown) => error);
    expect((rejection as BffProblem).requiredAuthLevel).toBeNull();
  });

  it('a 401 never carries requiredAuthLevel even if the body has one (structural gate is on status===403)', async () => {
    // A 401 triggers BffClient's own refresh-then-retry cascade (unlike the
    // 403 cases above, which never attempt refresh), so this needs a
    // multi-route mock rather than one fixed Response: the probe endpoint
    // always 401s (with a stray requiredAuthLevel field that must be
    // ignored), CSRF and refresh both succeed so the retry actually reaches
    // assertOk a second time instead of failing earlier in the cascade.
    const fetchImpl = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
      const path = typeof input === 'string' ? input : input.toString();
      const method = (init.method ?? 'GET').toUpperCase();
      if (method === 'GET' && path === '/api/csrf') {
        return jsonResponse(200, { data: { csrfToken: 'csrf-token' } });
      }
      if (method === 'POST' && path === '/api/v1/auth/refresh') {
        return jsonResponse(200, {
          data: {
            session: {
              activeTenantId: 'tenant-1',
              activeWorkspaceId: 'workspace-1',
              authLevel: 'session',
              capabilities: [],
              expiresAt: new Date(Date.now() + 60_000).toISOString(),
              memberships: [],
              sessionId: 'session-1',
              userId: 'user-1',
            },
          },
        });
      }
      return jsonResponse(401, {
        error: { code: 'SESSION_EXPIRED', message: 'Session expired.' },
        requiredAuthLevel: 'mfa',
      });
    };
    const client = new BffClient({ fetchImpl });

    const rejection = await client.readDomainScreen('/api/v1/probe').catch((error: unknown) => error);
    expect(rejection).toBeInstanceOf(BffProblem);
    expect((rejection as BffProblem).status).toBe(401);
    expect((rejection as BffProblem).requiredAuthLevel).toBeNull();
  });
});
