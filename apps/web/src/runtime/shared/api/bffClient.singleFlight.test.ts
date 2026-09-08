import {
  describe,
  expect,
  it,
} from 'vitest';

import { MemoryAuthRefreshCoordinator } from './authRefreshCoordinator';
import {
  BffClient,
  BffProblem,
  type BffSession,
} from './bffClient';

function fakeSession(overrides: Partial<BffSession> = {}): BffSession {
  return {
    activeTenantId: 'tenant-1',
    activeWorkspaceId: 'workspace-1',
    authLevel: 'session',
    capabilities: ['analytics.read'],
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    memberships: [
      {
        capabilities: ['analytics.read'],
        roles: ['Member'],
        tenantId: 'tenant-1',
        workspaceId: 'workspace-1',
      },
    ],
    sessionId: 'session-1',
    userId: 'user-1',
    ...overrides,
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  });
}

type RouteHandler = () => Response;

function createFetchMock(routes: Record<string, RouteHandler>) {
  const calls: { readonly method: string; readonly path: string }[] = [];
  const fetchImpl = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
    const path = typeof input === 'string' ? input : input.toString();
    const method = (init.method ?? 'GET').toUpperCase();
    calls.push({ method, path });
    const handler = routes[`${method} ${path}`];
    if (!handler) throw new Error(`Unhandled mock route: ${method} ${path}`);
    return handler();
  };
  return { calls, fetchImpl };
}

function countCalls(calls: readonly { readonly method: string; readonly path: string }[], method: string, path: string): number {
  return calls.filter((call) => call.method === method && call.path === path).length;
}

function newClient(fetchImpl: ReturnType<typeof createFetchMock>['fetchImpl']): BffClient {
  return new BffClient({
    coordinator: new MemoryAuthRefreshCoordinator(),
    csrfToken: 'seed-csrf-token',
    fetchImpl,
  });
}

describe('BffClient single-flight refresh (Phase 8 §28)', () => {
  it('A+B: 8 parallel reads that all hit 401 trigger exactly one refresh, and every request succeeds after a single retry', async () => {
    let sessionValid = false;
    const { calls, fetchImpl } = createFetchMock({
      'GET /api/v1/probe': () => (
        sessionValid
          ? jsonResponse(200, { data: { ok: true } })
          : jsonResponse(401, { error: { code: 'SESSION_EXPIRED' } })
      ),
      'POST /api/v1/auth/refresh': () => {
        sessionValid = true;
        return jsonResponse(200, { data: { session: fakeSession() } });
      },
    });
    const client = newClient(fetchImpl);

    const results = await Promise.all(
      Array.from({ length: 8 }, () => client.readDomainScreen<{ readonly ok: boolean }>('/api/v1/probe')),
    );

    expect(results).toHaveLength(8);
    expect(results.every((result) => result.ok)).toBe(true);
    expect(countCalls(calls, 'POST', '/api/v1/auth/refresh')).toBe(1);
    expect(countCalls(calls, 'GET', '/api/v1/probe')).toBe(16); // 8 initial 401s + 8 retries
  });

  it('C: if refresh fails, every pending request gets a terminal rejection and no further refresh is attempted', async () => {
    const { calls, fetchImpl } = createFetchMock({
      'GET /api/v1/probe': () => jsonResponse(401, { error: { code: 'SESSION_EXPIRED' } }),
      'POST /api/v1/auth/refresh': () => jsonResponse(401, { error: { code: 'REFRESH_TOKEN_REUSE_DETECTED' } }),
    });
    const client = newClient(fetchImpl);

    const outcomes = await Promise.allSettled(
      Array.from({ length: 8 }, () => client.readDomainScreen('/api/v1/probe')),
    );

    expect(outcomes.every((outcome) => outcome.status === 'rejected')).toBe(true);
    expect(countCalls(calls, 'POST', '/api/v1/auth/refresh')).toBe(1);
  });

  it('D: a retry that still gets 401 after a successful refresh does not start a second refresh loop', async () => {
    const { calls, fetchImpl } = createFetchMock({
      // The read endpoint stays unauthorized regardless of refresh outcome
      // (e.g. the caller lost a capability, not just a stale token).
      'GET /api/v1/probe': () => jsonResponse(401, { error: { code: 'SESSION_EXPIRED' } }),
      'POST /api/v1/auth/refresh': () => jsonResponse(200, { data: { session: fakeSession() } }),
    });
    const client = newClient(fetchImpl);

    await expect(client.readDomainScreen('/api/v1/probe')).rejects.toBeInstanceOf(BffProblem);
    expect(countCalls(calls, 'POST', '/api/v1/auth/refresh')).toBe(1);
    expect(countCalls(calls, 'GET', '/api/v1/probe')).toBe(2); // initial + exactly one retry
  });

  it('E: a 403 never triggers a refresh', async () => {
    const { calls, fetchImpl } = createFetchMock({
      'GET /api/v1/probe': () => jsonResponse(403, { error: { code: 'CAPABILITY_DENIED' } }),
      'POST /api/v1/auth/refresh': () => jsonResponse(200, { data: { session: fakeSession() } }),
    });
    const client = newClient(fetchImpl);

    await expect(client.readDomainScreen('/api/v1/probe')).rejects.toMatchObject({ status: 403 });
    expect(countCalls(calls, 'POST', '/api/v1/auth/refresh')).toBe(0);
  });

  it('F: a 500 rejects without fabricating a session and without triggering a refresh', async () => {
    const { calls, fetchImpl } = createFetchMock({
      'GET /api/v1/probe': () => jsonResponse(500, { error: { code: 'INTERNAL' } }),
      'POST /api/v1/auth/refresh': () => jsonResponse(200, { data: { session: fakeSession() } }),
    });
    const client = newClient(fetchImpl);

    await expect(client.readDomainScreen('/api/v1/probe')).rejects.toMatchObject({ status: 500 });
    expect(countCalls(calls, 'POST', '/api/v1/auth/refresh')).toBe(0);
  });

  it('a network failure surfaces as NETWORK_UNAVAILABLE and never fabricates a session', async () => {
    const fetchImpl = async (): Promise<Response> => {
      throw new TypeError('Failed to fetch');
    };
    const client = newClient(fetchImpl);

    await expect(client.readDomainScreen('/api/v1/probe')).rejects.toMatchObject({
      code: 'NETWORK_UNAVAILABLE',
      status: 0,
    });
  });
});
