import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react';

import {
  BffProblem,
  type BffClient,
  type BffSession,
} from '../api/bffClient';

// Explicit bootstrap states (Phase 8 auth/session runtime). The React UI
// must not render authenticated/privileged surfaces before bootstrap
// settles into one of the terminal states below, and must not trust any
// capability cache from a previous browser session -- the BFF is always
// re-asked via BffClient.readSession().
export type AuthBootstrapStatus =
  | 'anonymous'
  | 'authenticated'
  | 'initializing'
  | 'reauth_required'
  | 'service_unavailable';

export type AuthSessionRuntimeState = {
  readonly problem: string | null;
  // Set only while status === 'reauth_required': the level the backend
  // demanded (mfa vs step_up) and the app path to return to once the user
  // clears it. Never carries a token or session payload.
  readonly reauth: { readonly level: 'mfa' | 'step_up'; readonly returnTo: string | null } | null;
  readonly session: BffSession | null;
  readonly status: AuthBootstrapStatus;
};

export type AuthSessionRuntime = AuthSessionRuntimeState & {
  // Applies a session returned directly by a mutation this tab just
  // performed (login/register/mfa/step-up/workspace-select) for immediate
  // feedback, without waiting on the (also-fired) cross-tab event refetch.
  // Merges rather than replaces: some BFF responses (e.g. session-assurance
  // publicSession()) omit fields like `user` that a fuller session
  // response carries -- merging preserves them instead of letting the UI
  // silently regress to a fallback display value.
  readonly applySession: (session: BffSession) => void;
  // Wraps an authenticated command; on a 403 that carries a structured
  // requiredAuthLevel, routes the runtime into 'reauth_required' instead of
  // treating it as a generic failure. Never retries the wrapped action
  // automatically -- the caller decides whether re-invoking after
  // clearing the requirement is safe (idempotency-key-backed writes only).
  readonly runAuthenticatedCommand: <T>(action: () => Promise<T>, currentPath: string) => Promise<T>;
  readonly retryBootstrap: () => Promise<void>;
};

const initialState: AuthSessionRuntimeState = {
  problem: null,
  reauth: null,
  session: null,
  status: 'initializing',
};

// The runtime's state transitions as a pure reducer, separated from the
// React binding below specifically so this logic (bootstrap states,
// cross-tab logout, session merge-on-update, reauth routing) is testable
// without a DOM renderer -- see authSessionRuntime.test.ts.
export type AuthSessionRuntimeEvent =
  | { readonly type: 'bootstrap-started' }
  | { readonly type: 'bootstrap-succeeded'; readonly session: BffSession | null }
  | { readonly type: 'bootstrap-failed'; readonly problem: string }
  | { readonly type: 'session-applied'; readonly session: BffSession }
  | { readonly type: 'logged-out' }
  | { readonly type: 'reauth-required'; readonly level: 'mfa' | 'step_up'; readonly returnTo: string | null };

export function authSessionReducer(
  state: AuthSessionRuntimeState,
  event: AuthSessionRuntimeEvent,
): AuthSessionRuntimeState {
  switch (event.type) {
    case 'bootstrap-started':
      return { ...state, problem: null, status: 'initializing' };
    case 'bootstrap-succeeded':
      return {
        problem: null,
        reauth: null,
        session: event.session,
        status: event.session ? 'authenticated' : 'anonymous',
      };
    case 'bootstrap-failed':
      return {
        problem: event.problem,
        reauth: null,
        session: null,
        status: 'service_unavailable',
      };
    case 'logged-out':
      return {
        problem: null,
        reauth: null,
        session: null,
        status: 'anonymous',
      };
    case 'session-applied':
      return {
        problem: null,
        reauth: null,
        session: state.session ? { ...state.session, ...event.session } : event.session,
        status: 'authenticated',
      };
    case 'reauth-required':
      return {
        ...state,
        reauth: { level: event.level, returnTo: event.returnTo },
        status: 'reauth_required',
      };
    default:
      return state;
  }
}

// Pure flow-selection decision: does this failure mean the runtime should
// route into a reauth flow, and at which level? Deliberately narrow --
// only a 403 carrying a *structured* requiredAuthLevel (BffClient reads it
// directly off the response body; see bffClient.ts's readRequiredAuthLevel)
// qualifies. A 401 (session lifecycle -- handled entirely by the refresh
// path, never by this function) or a plain 403 with no requiredAuthLevel
// (ordinary capability/scope denial) must both resolve to `null`, never a
// guessed level.
export function reauthLevelFromError(cause: unknown): 'mfa' | 'step_up' | null {
  return cause instanceof BffProblem && cause.status === 403 && cause.requiredAuthLevel
    ? cause.requiredAuthLevel
    : null;
}

export function useAuthSessionRuntime(client: BffClient): AuthSessionRuntime {
  const [state, dispatch] = useReducer(authSessionReducer, initialState);
  const mountedRef = useRef(true);

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const bootstrap = useCallback(async () => {
    dispatch({ type: 'bootstrap-started' });
    try {
      const session = await client.readSession();
      if (!mountedRef.current) return;
      dispatch({ type: 'bootstrap-succeeded', session });
    } catch (cause) {
      if (!mountedRef.current) return;
      dispatch({ type: 'bootstrap-failed', problem: readProblemMessage(cause) });
    }
  }, [client]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const unsubscribe = client.subscribeAuthEvents((event) => {
      if (event.type === 'logout') {
        if (!mountedRef.current) return;
        dispatch({ type: 'logged-out' });
        return;
      }

      if (event.type === 'session-updated') {
        // The event carries no session payload by design (nothing
        // security-relevant crosses the cross-tab channel), so this tab
        // re-reads the session from the BFF to sync -- covers both a
        // sibling tab's login/refresh/workspace-switch and this tab's own
        // mutations (applySession already applied those instantly; this
        // is a self-correcting confirmation, not the primary path).
        void client.readSession().then((session) => {
          if (!mountedRef.current || !session) return;
          dispatch({ type: 'session-applied', session });
        }).catch(() => {
          // A sibling tab may be mid-transition (e.g. about to log out);
          // the next event or an explicit retry will reconcile. A
          // transient refetch failure here must not surface as a hard
          // error over an otherwise-unrelated state change.
        });
      }
    });
    return unsubscribe;
  }, [client]);

  const applySession = useCallback((session: BffSession) => {
    dispatch({ type: 'session-applied', session });
  }, []);

  const runAuthenticatedCommand = useCallback(async <T,>(
    action: () => Promise<T>,
    currentPath: string,
  ): Promise<T> => {
    try {
      return await action();
    } catch (cause) {
      const level = reauthLevelFromError(cause);
      if (level) dispatch({ type: 'reauth-required', level, returnTo: currentPath });
      throw cause;
    }
  }, []);

  return {
    ...state,
    applySession,
    retryBootstrap: bootstrap,
    runAuthenticatedCommand,
  };
}

function readProblemMessage(cause: unknown): string {
  if (cause instanceof BffProblem) return cause.message;
  return cause instanceof Error ? cause.message : 'Runtime BFF is unavailable.';
}
