import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  bffClient,
  type AuthenticatedUser,
  type BffSession,
} from '../../shared/api/bffClient';

export type SessionStatus =
  | 'loading'
  | 'anonymous'
  | 'authenticated'
  | 'error';

type LoginInput = {
  readonly email: string;
  readonly password: string;
  readonly rememberDevice?: boolean;
};

type RegisterInput = {
  readonly email: string;
  readonly fullName: string;
  readonly organizationName: string;
  readonly password: string;
  readonly workspaceName: string;
};

type SessionContextValue = {
  readonly status: SessionStatus;
  readonly session: BffSession | null;
  readonly user: AuthenticatedUser | null;
  readonly error: string | null;
  readonly login: (input: LoginInput) => Promise<BffSession>;
  readonly register: (input: RegisterInput) => Promise<BffSession>;
  readonly logout: () => Promise<void>;
  readonly refresh: () => Promise<void>;
  // For flows whose session-establishing call doesn't go through login()/
  // register() directly — currently only the OAuth callback landing page,
  // which already has the fresh {session, user} in its own response and
  // shouldn't need a second round-trip to /session just to apply it.
  readonly applySession: (session: BffSession, user: AuthenticatedUser | null) => void;
  readonly selectWorkspace: (workspaceId: string) => Promise<BffSession>;
  readonly stepUp: (code: string, operationScope: string) => Promise<BffSession>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [session, setSession] = useState<BffSession | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyAuthenticated = useCallback((
    nextSession: BffSession,
    nextUser: AuthenticatedUser | null,
  ) => {
    setSession(nextSession);
    setUser(nextUser);
    setError(null);
    setStatus('authenticated');
  }, []);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const nextSession = await bffClient.readSession();

      if (nextSession) {
        applyAuthenticated(nextSession, nextSession.user ?? null);
      } else {
        setSession(null);
        setUser(null);
        setStatus('anonymous');
      }
    } catch (cause) {
      setSession(null);
      setUser(null);
      setError(toErrorMessage(cause));
      setStatus('error');
    }
  }, [applyAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (input: LoginInput) => {
    const result = await bffClient.login(input);
    applyAuthenticated(result.session, result.user);
    return result.session;
  }, [applyAuthenticated]);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await bffClient.register(input);
    applyAuthenticated(result.session, result.user);
    return result.session;
  }, [applyAuthenticated]);

  const logout = useCallback(async () => {
    await bffClient.logout();
    setSession(null);
    setUser(null);
    setError(null);
    setStatus('anonymous');
  }, []);

  const selectWorkspace = useCallback(async (workspaceId: string) => {
    setError(null);
    const nextSession = await bffClient.selectWorkspace(workspaceId);
    setSession(nextSession);
    setStatus('authenticated');
    return nextSession;
  }, []);

  const stepUp = useCallback(async (code: string, operationScope: string) => {
    setError(null);
    const result = await bffClient.stepUp({ code, operationScope });
    setSession(result.session);
    setStatus('authenticated');
    return result.session;
  }, []);

  const value = useMemo<SessionContextValue>(() => ({
    applySession: applyAuthenticated,
    error,
    login,
    logout,
    refresh,
    register,
    selectWorkspace,
    session,
    status,
    stepUp,
    user,
  }), [applyAuthenticated, error, login, logout, refresh, register, selectWorkspace, session, status, stepUp, user]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);

  if (!value) {
    throw new Error('useSession must be used inside SessionProvider.');
  }

  return value;
}

function toErrorMessage(cause: unknown): string {
  return cause instanceof Error
    ? cause.message
    : 'Nie udało się sprawdzić sesji.';
}
