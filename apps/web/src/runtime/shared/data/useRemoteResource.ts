import { useCallback, useEffect, useRef, useState } from 'react';
import { BffProblem } from '../api/bffClient';

export type RemoteState = 'loading' | 'ready' | 'error' | 'forbidden' | 'offline';
export type RemoteResource<T> = {
  readonly data: T | null;
  readonly state: RemoteState;
  readonly problem: string | null;
  readonly reload: () => Promise<T | null>;
  readonly replace: (data: T) => boolean;
};

/**
 * A resource is identified by tenant, workspace, user, dates and filters.
 * Never expose the preceding key's data, even during the render before an
 * effect runs. Abort is an optimization; the epoch is the correctness guard.
 */
export function useRemoteResource<T>(
  key: string,
  read: (signal: AbortSignal) => Promise<T>,
): RemoteResource<T> {
  const reader = useRef(read);
  reader.current = read;
  const activeKey = useRef(key);
  activeKey.current = key;
  const epoch = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const [result, update] = useState<{
    key: string; data: T | null; state: RemoteState; problem: string | null;
  }>({ key, data: null, state: 'loading', problem: null });

  const reload = useCallback(async (): Promise<T | null> => {
    const ticket = ++epoch.current;
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    update({ key, data: null, state: 'loading', problem: null });
    try {
      const data = await reader.current(request.signal);
      if (ticket !== epoch.current || request.signal.aborted || activeKey.current !== key) return null;
      update({ key, data, state: 'ready', problem: null });
      return data;
    } catch (cause) {
      if (ticket !== epoch.current || request.signal.aborted || activeKey.current !== key) return null;
      const offline = typeof navigator !== 'undefined' && !navigator.onLine;
      const forbidden = cause instanceof BffProblem && cause.status === 403;
      update({ key, data: null, state: offline ? 'offline' : forbidden ? 'forbidden' : 'error',
        problem: cause instanceof Error ? cause.message : 'Nie udało się pobrać danych.' });
      return null;
    }
  }, [key]);

  useEffect(() => {
    void reload();
    return () => { ++epoch.current; controller.current?.abort(); };
  }, [reload]);
  const replace = useCallback((data: T): boolean => {
    if (activeKey.current !== key) return false;
    ++epoch.current;
    controller.current?.abort();
    update({key, data, state:'ready', problem:null});
    return true;
  }, [key]);
  const current = result.key === key ? result : { data: null, state: 'loading' as const, problem: null };
  return { data: current.data, state: current.state, problem: current.problem, reload, replace };
}
