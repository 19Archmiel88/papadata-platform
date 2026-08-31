import {
  describe,
  expect,
  it,
} from 'vitest';

import { BffProblem, type BffSession } from '../api/bffClient';
import {
  authSessionReducer,
  reauthLevelFromError,
  type AuthSessionRuntimeState,
} from './authSessionRuntime';

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

const initializing: AuthSessionRuntimeState = {
  problem: null,
  reauth: null,
  session: null,
  status: 'initializing',
};

describe('authSessionReducer', () => {
  it('bootstrap-succeeded with a session -> authenticated', () => {
    const session = fakeSession();
    const next = authSessionReducer(initializing, { session, type: 'bootstrap-succeeded' });
    expect(next.status).toBe('authenticated');
    expect(next.session).toBe(session);
  });

  it('bootstrap-succeeded with null -> anonymous', () => {
    const next = authSessionReducer(initializing, { session: null, type: 'bootstrap-succeeded' });
    expect(next.status).toBe('anonymous');
    expect(next.session).toBeNull();
  });

  it('bootstrap-failed -> service_unavailable, carrying the problem message', () => {
    const next = authSessionReducer(initializing, { problem: 'BFF is unavailable.', type: 'bootstrap-failed' });
    expect(next.status).toBe('service_unavailable');
    expect(next.problem).toBe('BFF is unavailable.');
  });

  it('logged-out clears the session and returns to anonymous from any prior state', () => {
    const authenticated: AuthSessionRuntimeState = {
      problem: null,
      reauth: null,
      session: fakeSession(),
      status: 'authenticated',
    };
    const next = authSessionReducer(authenticated, { type: 'logged-out' });
    expect(next.status).toBe('anonymous');
    expect(next.session).toBeNull();
  });

  it('session-applied merges into the existing session rather than replacing it (preserves fields a partial response omits)', () => {
    const authenticated: AuthSessionRuntimeState = {
      problem: null,
      reauth: null,
      session: fakeSession({
        user: { displayName: 'Ana', email: 'ana@papadata.pl', userId: 'user-1' },
      }),
      status: 'authenticated',
    };
    // A session-assurance response (stepUp/verifyMfa) whose publicSession()
    // omits `user`.
    const { user: _omitted, ...partial } = fakeSession({ authLevel: 'step_up' });
    const next = authSessionReducer(authenticated, { session: partial as BffSession, type: 'session-applied' });

    expect(next.status).toBe('authenticated');
    expect(next.session?.authLevel).toBe('step_up');
    expect(next.session?.user).toEqual({ displayName: 'Ana', email: 'ana@papadata.pl', userId: 'user-1' });
  });

  it('reauth-required sets the level and returnTo without discarding the current session', () => {
    const authenticated: AuthSessionRuntimeState = {
      problem: null,
      reauth: null,
      session: fakeSession(),
      status: 'authenticated',
    };
    const next = authSessionReducer(authenticated, {
      level: 'mfa',
      returnTo: '/app/reports',
      type: 'reauth-required',
    });
    expect(next.status).toBe('reauth_required');
    expect(next.reauth).toEqual({ level: 'mfa', returnTo: '/app/reports' });
    expect(next.session).not.toBeNull();
  });
});

describe('reauthLevelFromError (Blocker 2: structural, non-heuristic flow selection)', () => {
  it('routes to the mfa flow for a 403 with requiredAuthLevel=mfa', () => {
    const problem = new BffProblem(403, 'REQUEST_REJECTED', 'Required authentication level is missing.', {
      requiredAuthLevel: 'mfa',
    });
    expect(reauthLevelFromError(problem)).toBe('mfa');
  });

  it('routes to the step-up flow for a 403 with requiredAuthLevel=step_up', () => {
    const problem = new BffProblem(403, 'REQUEST_REJECTED', 'Required authentication level is missing.', {
      requiredAuthLevel: 'step_up',
    });
    expect(reauthLevelFromError(problem)).toBe('step_up');
  });

  it('does not route a plain capability-denied 403 (no requiredAuthLevel) to any reauth flow', () => {
    const problem = new BffProblem(403, 'REQUEST_REJECTED', 'Required capability is missing.');
    expect(reauthLevelFromError(problem)).toBeNull();
  });

  it('never defaults an unrecognized 403 to step_up', () => {
    const problem = new BffProblem(403, 'REQUEST_REJECTED', 'Something about authentication level and step-up.');
    // No requiredAuthLevel was set on this BffProblem (simulating a 403
    // whose body happens to mention these words in free text) -- must stay
    // null, proving there is no text-based fallback left in this path.
    expect(reauthLevelFromError(problem)).toBeNull();
  });

  it('a 401 never routes to a reauth flow even if requiredAuthLevel were somehow present', () => {
    const problem = new BffProblem(401, 'SESSION_EXPIRED', 'Session expired.', { requiredAuthLevel: 'mfa' });
    expect(reauthLevelFromError(problem)).toBeNull();
  });

  it('a non-BffProblem error never routes to a reauth flow', () => {
    expect(reauthLevelFromError(new Error('network down'))).toBeNull();
    expect(reauthLevelFromError('unexpected')).toBeNull();
  });
});
