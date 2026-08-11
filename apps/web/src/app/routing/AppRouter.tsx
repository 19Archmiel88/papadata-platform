import { useEffect } from 'react';

import { Button } from '../../design-system';
import { AuthPage } from '../../features/auth/AuthPage';
import { CommandCenterScreen } from '../../screens/CommandCenterScreen';
import { AppShell } from '../../shell/AppShell';
import { useSession } from '../providers';
import {
  navigate,
  useLocationPath,
} from './navigation';

export function AppRouter() {
  const location = useLocationPath();
  const pathname = location.split('?')[0] || '/';
  const { refresh, status } = useSession();

  if (status === 'loading') {
    return (
      <main className="runtime-status">
        <p className="runtime-status__brand">PapaData</p>
        <h1>Sprawdzanie sesji…</h1>
        <p>Frontend odczytuje aktywną sesję z BFF.</p>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="runtime-status">
        <p className="runtime-status__brand">PapaData</p>
        <h1>Nie można uruchomić aplikacji</h1>
        <p>
          BFF nie odpowiedział poprawnie podczas bootstrapu sesji.
          Sprawdź production-parity i konfigurację origin/host.
        </p>
        <Button onClick={() => void refresh()} variant="secondary">
          Spróbuj ponownie
        </Button>
      </main>
    );
  }

  if (pathname === '/') {
    return <Redirect to={status === 'authenticated' ? '/app' : '/login'} />;
  }

  if (pathname === '/login') {
    return status === 'authenticated'
      ? <Redirect to="/app" />
      : <AuthPage mode="login" />;
  }

  if (pathname === '/register') {
    return status === 'authenticated'
      ? <Redirect to="/app" />
      : <AuthPage mode="register" />;
  }

  if (pathname === '/app' || pathname.startsWith('/app/')) {
    if (status !== 'authenticated') {
      const returnTo = encodeURIComponent(location);
      return <Redirect to={`/login?returnTo=${returnTo}`} />;
    }

    if (pathname === '/app' || pathname === '/app/command-center') {
      return (
        <AppShell>
          <CommandCenterScreen />
        </AppShell>
      );
    }

    return (
      <AppShell>
        <NotFound />
      </AppShell>
    );
  }

  return <NotFound />;
}

function Redirect({
  to,
}: {
  readonly to: string;
}) {
  useEffect(() => {
    navigate(to, { replace: true });
  }, [to]);

  return (
    <main className="runtime-status">
      <p>Przekierowanie…</p>
    </main>
  );
}

function NotFound() {
  return (
    <main className="runtime-status">
      <p className="runtime-status__brand">PapaData</p>
      <h1>Nie znaleziono strony</h1>
      <p>Ta trasa nie istnieje w aktualnym runtime produktu.</p>
      <Button onClick={() => navigate('/')} variant="secondary">
        Wróć do aplikacji
      </Button>
    </main>
  );
}
