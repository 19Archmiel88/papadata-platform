import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  BrowserAuthRefreshCoordinator,
} from './authRefreshCoordinator';
import {
  BffClient,
  type BffSession,
} from './bffClient';

// Regression coverage for Phase 8 §24/§31: the production auth runtime must
// never persist a password, an access/refresh token, or a fabricated
// session/capability grant to localStorage or sessionStorage. This exercises
// real login -> authenticated command -> refresh -> logout traffic through
// BffClient (which never touches storage itself) and, separately, through
// the coordinator's storage-lock fallback (the one code path that *does*
// touch localStorage, used only when the Web Locks API is unavailable) --
// and asserts on actual behavior, not just a source grep.

const SECRET_PASSWORD = 'correct horse battery staple 42';
const SECRET_REFRESH_TOKEN = 'refresh-token-should-never-be-stored';
const SECRET_ACCESS_TOKEN = 'access-token-should-never-be-stored';

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();
  readonly writes: { readonly key: string; readonly value: string }[] = [];

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
    this.writes.push({ key, value });
  }
}

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

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json', ...headers },
    status,
  });
}

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe('storage security regression (Phase 8 §24, §31)', () => {
  it('a full login -> read -> refresh -> logout lifecycle never writes the password or any token to localStorage', async () => {
    const storage = new MemoryStorage();
    (globalThis as { window?: unknown }).window = { localStorage: storage };

    let sessionValid = true;
    const fetchImpl = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
      const path = typeof input === 'string' ? input : input.toString();
      const method = (init.method ?? 'GET').toUpperCase();
      if (method === 'POST' && path === '/api/v1/auth/login') {
        return jsonResponse(200, {
          data: {
            session: fakeSession(),
            user: { displayName: 'Ana', email: 'ana@papadata.pl', userId: 'user-1' },
          },
        }, {
          'set-cookie': `pd_refresh=${SECRET_REFRESH_TOKEN}; HttpOnly`,
        });
      }
      if (method === 'GET' && path === '/api/csrf') {
        return jsonResponse(200, { data: { csrfToken: 'csrf-token-1' } });
      }
      if (method === 'GET' && path === '/api/v1/probe') {
        if (!sessionValid) {
          return jsonResponse(401, { error: { code: 'SESSION_EXPIRED' } });
        }
        return jsonResponse(200, { data: { accessToken: SECRET_ACCESS_TOKEN, ok: true } });
      }
      if (method === 'POST' && path === '/api/v1/auth/refresh') {
        sessionValid = true;
        return jsonResponse(200, { data: { session: fakeSession() } });
      }
      if (method === 'POST' && path === '/api/v1/auth/logout') {
        return jsonResponse(200, { data: { loggedOut: true } });
      }
      throw new Error(`Unhandled mock route: ${method} ${path}`);
    };

    const client = new BffClient({ fetchImpl });

    await client.login({ email: 'ana@papadata.pl', password: SECRET_PASSWORD });
    await client.readDomainScreen('/api/v1/probe');
    sessionValid = false;
    await client.readDomainScreen('/api/v1/probe'); // triggers a 401 -> refresh -> retry cycle
    await client.logout();

    expect(storage.writes).toHaveLength(0);

    for (const write of storage.writes) {
      expect(write.value).not.toContain(SECRET_PASSWORD);
      expect(write.value).not.toContain(SECRET_REFRESH_TOKEN);
      expect(write.value).not.toContain(SECRET_ACCESS_TOKEN);
    }
  });

  it('the coordinator storage-lock fallback (used only without the Web Locks API) writes nothing but opaque {ownerId, expiresAt} coordination metadata', async () => {
    const storage = new MemoryStorage();
    // Simulate a browser without navigator.locks by presenting a
    // navigator-shaped object with no `.locks`, forcing the fallback path.
    (globalThis as { window?: unknown; navigator?: unknown }).window = { localStorage: storage };
    const originalNavigator = (globalThis as { navigator?: unknown }).navigator;
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });

    try {
      const coordinator = new BrowserAuthRefreshCoordinator();
      await coordinator.coordinateRefresh({
        afterExternal: async () => 'unused',
        perform: async () => 'refreshed-session-placeholder',
      });

      expect(storage.writes.length).toBeGreaterThan(0);
      for (const write of storage.writes) {
        expect(write.key).toBe('papadata.auth.refresh.lock.v1');
        const parsed = JSON.parse(write.value) as Record<string, unknown>;
        expect(Object.keys(parsed).sort()).toEqual(['expiresAt', 'ownerId']);
        expect(write.value).not.toContain(SECRET_PASSWORD);
        expect(write.value).not.toContain(SECRET_REFRESH_TOKEN);
        expect(write.value).not.toContain(SECRET_ACCESS_TOKEN);
      }
    } finally {
      Object.defineProperty(globalThis, 'navigator', { configurable: true, value: originalNavigator });
    }
  });
});
