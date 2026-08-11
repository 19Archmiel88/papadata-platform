import type { ReactNode } from 'react';
import { useState } from 'react';

import { Button } from '../design-system';
import { useSession } from '../app/providers';
import { navigate } from '../app/routing/navigation';

export function AppShell({
  children,
}: {
  readonly children: ReactNode;
}) {
  const { logout, session, user } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function handleLogout() {
    setLoggingOut(true);
    setProblem(null);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (cause) {
      setProblem(cause instanceof Error ? cause.message : 'Nie udało się wylogować.');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="runtime-shell">
      <header className="runtime-shell__topbar">
        <button
          className="runtime-shell__brand"
          onClick={() => navigate('/app')}
          type="button"
        >
          PapaData
        </button>

        <div className="runtime-shell__identity">
          <div>
            <strong>{user?.displayName ?? 'Użytkownik PapaData'}</strong>
            <span>{user?.email ?? session?.userId ?? 'Aktywna sesja'}</span>
          </div>
          <Button
            loading={loggingOut}
            loadingLabel="Wylogowanie…"
            onClick={() => void handleLogout()}
            size="small"
            variant="secondary"
          >
            Wyloguj
          </Button>
        </div>
      </header>

      <div className="runtime-shell__body">
        <aside className="runtime-shell__sidebar" aria-label="Nawigacja główna">
          <button
            aria-current="page"
            className="runtime-shell__nav-item"
            onClick={() => navigate('/app')}
            type="button"
          >
            Centrum Dowodzenia
          </button>
        </aside>

        <main className="runtime-shell__content">
          {problem ? (
            <div className="runtime-alert" role="alert">
              {problem}
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
