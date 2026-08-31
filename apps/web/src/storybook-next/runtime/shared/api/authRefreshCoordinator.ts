export type AuthRuntimeEvent =
  | { readonly type: 'logout'; readonly reason: 'logout' | 'logout-all' | 'refresh-failed' | 'session-revoked' }
  | { readonly type: 'refresh-failed' }
  | { readonly type: 'refresh-started' }
  | { readonly type: 'refresh-succeeded' }
  | { readonly type: 'session-updated' };

export type AuthRefreshCoordinator = {
  readonly coordinateRefresh: <T>(input: {
    readonly afterExternal: () => Promise<T>;
    readonly perform: () => Promise<T>;
  }) => Promise<T>;
  readonly publish: (event: AuthRuntimeEvent) => void;
  readonly subscribe: (listener: (event: AuthRuntimeEvent) => void) => () => void;
};

const authChannelName = 'papadata.auth-session-runtime.v1';
const authRefreshLockName = 'papadata.auth.refresh';
const authRefreshStorageLockKey = 'papadata.auth.refresh.lock.v1';
const refreshWaitTimeoutMs = 15_000;
const storageLockTtlMs = 10_000;

type LockManager = {
  readonly request: <T>(
    name: string,
    options: { readonly ifAvailable?: boolean; readonly mode?: 'exclusive' },
    callback: (lock: unknown | null) => Promise<T>,
  ) => Promise<T>;
};

export class BrowserAuthRefreshCoordinator implements AuthRefreshCoordinator {
  private readonly channel: BroadcastChannel | null;
  private readonly listeners = new Set<(event: AuthRuntimeEvent) => void>();
  private readonly ownerId = createOwnerId();
  private externalRefreshActive = false;

  constructor() {
    this.channel = typeof BroadcastChannel === 'function'
      ? new BroadcastChannel(authChannelName)
      : null;
    this.channel?.addEventListener('message', (event: MessageEvent<unknown>) => {
      const message = readAuthRuntimeEvent(event.data);
      if (!message) return;
      this.applyRemoteEvent(message);
      this.emit(message);
    });
  }

  async coordinateRefresh<T>(input: {
    readonly afterExternal: () => Promise<T>;
    readonly perform: () => Promise<T>;
  }): Promise<T> {
    if (this.externalRefreshActive) {
      await this.waitForExternalRefresh();
      return input.afterExternal();
    }

    const locks = readLockManager();
    if (locks) {
      return locks.request(authRefreshLockName, { ifAvailable: true, mode: 'exclusive' }, async (lock) => {
        if (!lock) {
          await this.waitForExternalRefresh();
          return input.afterExternal();
        }
        return this.performRefresh(input.perform);
      });
    }

    if (!this.acquireStorageLock()) {
      await this.waitForExternalRefresh();
      return input.afterExternal();
    }

    try {
      return await this.performRefresh(input.perform);
    } finally {
      this.releaseStorageLock();
    }
  }

  publish(event: AuthRuntimeEvent): void {
    this.applyRemoteEvent(event);
    this.emit(event);
    this.channel?.postMessage(event);
  }

  subscribe(listener: (event: AuthRuntimeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async performRefresh<T>(perform: () => Promise<T>): Promise<T> {
    this.publish({ type: 'refresh-started' });
    try {
      const result = await perform();
      this.publish({ type: 'refresh-succeeded' });
      return result;
    } catch (cause) {
      this.publish({ type: 'refresh-failed' });
      throw cause;
    }
  }

  private waitForExternalRefresh(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Global `setTimeout`/`clearTimeout`, not `window.*` -- identical in
      // a browser (where `window` just aliases the global object), but
      // this coordinator's `coordinateRefresh` also runs in non-window
      // test/runtime contexts where only the global timer functions exist.
      const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error('Timed out waiting for another tab to finish session refresh.'));
      }, refreshWaitTimeoutMs);
      const unsubscribe = this.subscribe((event) => {
        if (event.type === 'refresh-succeeded') {
          clearTimeout(timeout);
          unsubscribe();
          resolve();
        }
        if (event.type === 'refresh-failed' || event.type === 'logout') {
          clearTimeout(timeout);
          unsubscribe();
          reject(new Error('Session refresh failed in another tab.'));
        }
      });
    });
  }

  private applyRemoteEvent(event: AuthRuntimeEvent): void {
    if (event.type === 'refresh-started') {
      this.externalRefreshActive = true;
      return;
    }
    if (event.type === 'refresh-succeeded' || event.type === 'refresh-failed' || event.type === 'logout') {
      this.externalRefreshActive = false;
    }
  }

  private emit(event: AuthRuntimeEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  private acquireStorageLock(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      const now = Date.now();
      const current = readStorageLock(window.localStorage.getItem(authRefreshStorageLockKey));
      if (current && current.expiresAt > now && current.ownerId !== this.ownerId) {
        this.externalRefreshActive = true;
        return false;
      }
      window.localStorage.setItem(
        authRefreshStorageLockKey,
        JSON.stringify({ expiresAt: now + storageLockTtlMs, ownerId: this.ownerId }),
      );
      const stored = readStorageLock(window.localStorage.getItem(authRefreshStorageLockKey));
      return stored?.ownerId === this.ownerId;
    } catch {
      return true;
    }
  }

  private releaseStorageLock(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = readStorageLock(window.localStorage.getItem(authRefreshStorageLockKey));
      if (stored?.ownerId === this.ownerId) {
        window.localStorage.removeItem(authRefreshStorageLockKey);
      }
    } catch {
      // Best-effort fallback lock cleanup.
    }
  }
}

export class MemoryAuthRefreshCoordinator implements AuthRefreshCoordinator {
  private readonly listeners = new Set<(event: AuthRuntimeEvent) => void>();
  private refreshPromise: Promise<unknown> | null = null;

  async coordinateRefresh<T>(input: {
    readonly afterExternal: () => Promise<T>;
    readonly perform: () => Promise<T>;
  }): Promise<T> {
    if (this.refreshPromise) {
      await this.refreshPromise;
      return input.afterExternal();
    }

    this.publish({ type: 'refresh-started' });
    const refresh = input.perform()
      .then((result) => {
        this.publish({ type: 'refresh-succeeded' });
        return result;
      })
      .catch((cause: unknown) => {
        this.publish({ type: 'refresh-failed' });
        throw cause;
      })
      .finally(() => {
        this.refreshPromise = null;
      });
    this.refreshPromise = refresh;
    return refresh;
  }

  publish(event: AuthRuntimeEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  subscribe(listener: (event: AuthRuntimeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

function readLockManager(): LockManager | null {
  if (typeof navigator === 'undefined') return null;
  // Cast to a standalone shape (not intersected with the real `Navigator`)
  // so this stays a genuine runtime check: current DOM lib typings already
  // declare `navigator.locks` as always-present, which would make an
  // `Navigator & {...}` intersection's `?.` check tautological under
  // `tsc` even though older/unsupported browsers can still lack it.
  const candidate = navigator as unknown as { readonly locks?: LockManager };
  return typeof candidate.locks?.request === 'function' ? candidate.locks : null;
}

function readAuthRuntimeEvent(value: unknown): AuthRuntimeEvent | null {
  if (!isRecord(value) || typeof value.type !== 'string') return null;
  if (
    value.type === 'refresh-started'
    || value.type === 'refresh-succeeded'
    || value.type === 'refresh-failed'
    || value.type === 'session-updated'
  ) {
    return { type: value.type };
  }
  if (value.type === 'logout') {
    const reason = value.reason;
    return reason === 'logout'
      || reason === 'logout-all'
      || reason === 'refresh-failed'
      || reason === 'session-revoked'
      ? { type: 'logout', reason }
      : { type: 'logout', reason: 'logout' };
  }
  return null;
}

function readStorageLock(value: string | null): { readonly expiresAt: number; readonly ownerId: string } | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!isRecord(parsed)) return null;
    return typeof parsed.expiresAt === 'number' && typeof parsed.ownerId === 'string'
      ? { expiresAt: parsed.expiresAt, ownerId: parsed.ownerId }
      : null;
  } catch {
    return null;
  }
}

function createOwnerId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
