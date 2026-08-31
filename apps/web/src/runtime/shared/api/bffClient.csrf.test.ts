import {
  describe,
  expect,
  it,
} from 'vitest';

import { MemoryAuthRefreshCoordinator } from './authRefreshCoordinator';
import {
  BffClient,
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

describe('BffClient CSRF lifecycle (Phase 8 §29)', () => {
  it('fetches the CSRF token once and reuses the cache across subsequent authenticated commands', async () => {
    const { calls, fetchImpl } = createFetchMock({
      'GET /api/csrf': () => jsonResponse(200, { data: { csrfToken: 'csrf-abc' } }),
      'POST /api/v1/notifications/n1/read': () => jsonResponse(200, { data: {} }),
      'POST /api/v1/notifications/read-all': () => jsonResponse(200, { data: {} }),
    });
    const client = new BffClient({ coordinator: new MemoryAuthRefreshCoordinator(), fetchImpl });

    await client.markNotificationRead('n1');
    await client.markAllNotificationsRead();

    expect(countCalls(calls, 'GET', '/api/csrf')).toBe(1);
    const commandCalls = calls.filter((call) => call.method === 'POST' && call.path.startsWith('/api/v1/notifications'));
    expect(commandCalls).toHaveLength(2);
  });

  it('clears the CSRF cache on logout, so the next authenticated command re-fetches a fresh token', async () => {
    let csrfCallCount = 0;
    const { fetchImpl } = createFetchMock({
      'GET /api/csrf': () => {
        csrfCallCount += 1;
        return jsonResponse(200, { data: { csrfToken: `csrf-${csrfCallCount}` } });
      },
      'POST /api/v1/auth/logout': () => jsonResponse(200, { data: { loggedOut: true } }),
      'POST /api/v1/notifications/read-all': () => jsonResponse(200, { data: {} }),
    });
    const client = new BffClient({ coordinator: new MemoryAuthRefreshCoordinator(), fetchImpl });

    await client.markAllNotificationsRead();
    expect(csrfCallCount).toBe(1);

    await client.logout();
    await client.markAllNotificationsRead();
    expect(csrfCallCount).toBe(2);
  });

  it('a cached CSRF token survives a session refresh without being re-fetched (token is session-bound, sessionId is unchanged by refresh)', async () => {
    let sessionValid = false;
    let csrfCallCount = 0;
    const { fetchImpl } = createFetchMock({
      'GET /api/csrf': () => {
        csrfCallCount += 1;
        return jsonResponse(200, { data: { csrfToken: 'csrf-stable' } });
      },
      'GET /api/v1/probe': () => (
        sessionValid
          ? jsonResponse(200, { data: { ok: true } })
          : jsonResponse(401, { error: { code: 'SESSION_EXPIRED' } })
      ),
      'POST /api/v1/auth/refresh': () => {
        sessionValid = true;
        return jsonResponse(200, { data: { session: fakeSession() } });
      },
      'POST /api/v1/notifications/read-all': () => jsonResponse(200, { data: {} }),
    });
    const client = new BffClient({ coordinator: new MemoryAuthRefreshCoordinator(), fetchImpl });

    // Prime the CSRF cache via an ordinary authenticated command.
    await client.markAllNotificationsRead();
    expect(csrfCallCount).toBe(1);

    // Force a 401 -> refresh -> retry cycle; refresh itself needs a CSRF
    // token too, but should reuse the cached one instead of fetching again.
    await client.readDomainScreen('/api/v1/probe');
    expect(csrfCallCount).toBe(1);
  });

  it('never sends the CSRF token as a bearer/authorization credential -- only as the dedicated header', async () => {
    const { fetchImpl } = createFetchMock({
      'GET /api/csrf': () => jsonResponse(200, { data: { csrfToken: 'csrf-xyz' } }),
      'POST /api/v1/notifications/read-all': () => jsonResponse(200, { data: {} }),
    });
    const seenHeaders: Headers[] = [];
    const inspectingFetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
      seenHeaders.push(new Headers(init.headers));
      return fetchImpl(input, init);
    };
    const client = new BffClient({ coordinator: new MemoryAuthRefreshCoordinator(), fetchImpl: inspectingFetch });

    await client.markAllNotificationsRead();

    for (const headers of seenHeaders) {
      expect(headers.has('authorization')).toBe(false);
    }
    const commandHeaders = seenHeaders[seenHeaders.length - 1];
    expect(commandHeaders.get('x-papadata-csrf')).toBe('csrf-xyz');
  });
});
