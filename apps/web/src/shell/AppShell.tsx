import type { ReactNode } from 'react';
import { useState } from 'react';

import { useSession } from '../app/providers';
import {
  navigate,
  useLocationPath,
} from '../app/routing/navigation';
import {
  ProductShellFrame,
} from './app-shell';

export function AppShell({
  children,
}: {
  readonly children: ReactNode;
}) {
  const { logout, session, user } = useSession();
  const activePath = useLocationPath().split('?')[0] || '/app';
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
    <ProductShellFrame
      activePath={activePath}
      loggingOut={loggingOut}
      onLogout={() => void handleLogout()}
      onNavigate={navigate}
      problem={problem}
      user={{
        displayName: user?.displayName ?? 'Użytkownik PapaData',
        email: user?.email ?? session?.userId ?? 'Aktywna sesja',
        role: 'Użytkownik',
      }}
    >
      {children}
    </ProductShellFrame>
  );
}
