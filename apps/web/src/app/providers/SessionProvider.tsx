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

type SessionContextValue = {
  readonly status: SessionStatus;
  readonly session: BffSession | null;
  readonly user: AuthenticatedUser | null;
  readonly error: string | null;
  readonly login: (input: {
    readonly email: string;
    readonly password: string;
    readonly rememberDevice?: boolean;
  }) => Promise<void>;
  readonly register: (input: {
    readonly email: string;
    readonly fullName: string;
    readonly organizationName: string;
    readonly password: string;
    readonly workspaceName: string;
  }) => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly refresh: () => Promise<void>;
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

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const nextSession = await bffClient.readSession();
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setStatus(nextSession ? 'authenticated' : 'anonymous');
    } catch (cause) {
      setSession(null);
      setUser(null);
      setError(errorMessage(cause));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (input: {
    readonly email: string;
    readonly password: string;
    readonly rememberDevice?: boolean;
  }) => {
    const result = await bffClient.login(input);
    setSession(result.session);
    setUser(result.user);
    setError(null);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (input: {
    readonly email: string;
    readonly fullName: string;
    readonly organizationName: string;
    readonly password: string;
    readonly workspaceName: string;
  }) => {
    const result = await bffClient.register(input);
    setSession(result.session);
    setUser(result.user);
    setError(null);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await bffClient.logout();
    setSession(null);
    setUser(null);
    setError(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo<SessionContextValue>(() => ({
    error,
    login,
    logout,
    refresh,
    register,
    session,
    status,
    user,
  }), [error, login, logout, refresh, register, session, status, user]);

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

function errorMessage(cause: unknown): string {
  return cause instanceof Error
    ? cause.message
    : 'Nie udało się sprawdzić sesji.';
}
