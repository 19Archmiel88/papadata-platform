import type { ReactNode } from 'react';
import {
  lazy,
  Suspense,
  useEffect,
} from 'react';

import { Button } from '../../design-system/components/Button';
import {
  PublicTopbar,
} from '../../shell/topbar';
import { useSession } from '../providers';
import {
  navigate,
  useLocationPath,
} from './navigation';

const AuthPage = lazy(async () => {
  const module = await import('../../features/auth/AuthPage');

  return {
    default: module.AuthPage,
  };
});

const AppShell = lazy(async () => {
  const module = await import('../../shell/AppShell');

  return {
    default: module.AppShell,
  };
});

const CampaignsScreen = lazy(async () => {
  const module = await import('../../screens/CampaignsScreen');

  return {
    default: module.CampaignsScreen,
  };
});

const CustomersScreen = lazy(async () => {
  const module = await import('../../screens/CustomersScreen');

  return {
    default: module.CustomersScreen,
  };
});

const OrdersScreen = lazy(async () => {
  const module = await import('../../screens/OrdersScreen');

  return {
    default: module.OrdersScreen,
  };
});

const ProductsScreen = lazy(async () => {
  const module = await import('../../screens/ProductsScreen');

  return {
    default: module.ProductsScreen,
  };
});

const TrafficScreen = lazy(async () => {
  const module = await import('../../screens/TrafficScreen');

  return {
    default: module.TrafficScreen,
  };
});

const BillingScreen = lazy(async () => {
  const module = await import('../../screens/billing');

  return {
    default: module.BillingScreen,
  };
});

const DecisionsScreen = lazy(async () => {
  const module = await import('../../screens/decisions');

  return {
    default: module.DecisionsScreen,
  };
});

const CommandCenterScreen = lazy(async () => {
  const module = await import('../../screens/CommandCenterScreen');

  return {
    default: module.CommandCenterScreen,
  };
});

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
    return <Redirect to={status === 'authenticated' ? '/app' : '/auth'} />;
  }

  if (pathname === '/auth') {
    return status === 'authenticated'
      ? <Redirect to="/app" />
      : (
          <RouteSuspense>
            <PublicAuthShell>
              <AuthPage mode="entry" />
            </PublicAuthShell>
          </RouteSuspense>
        );
  }

  if (pathname === '/login') {
    return status === 'authenticated'
      ? <Redirect to="/app" />
      : (
          <RouteSuspense>
            <PublicAuthShell>
              <AuthPage mode="login" />
            </PublicAuthShell>
          </RouteSuspense>
        );
  }

  if (pathname === '/register') {
    return status === 'authenticated'
      ? <Redirect to="/app" />
      : (
          <RouteSuspense>
            <PublicAuthShell>
              <AuthPage mode="register" />
            </PublicAuthShell>
          </RouteSuspense>
        );
  }

  if (pathname === '/mfa') {
    return status === 'anonymous'
      ? <Redirect to="/login" />
      : (
          <RouteSuspense>
            <PublicAuthShell>
              <AuthPage mode="mfa" />
            </PublicAuthShell>
          </RouteSuspense>
        );
  }

  if (pathname === '/recover-access') {
    return status === 'authenticated'
      ? <Redirect to="/app" />
      : (
          <RouteSuspense>
            <PublicAuthShell>
              <AuthPage mode="recover" />
            </PublicAuthShell>
          </RouteSuspense>
        );
  }

  if (pathname === '/app' || pathname.startsWith('/app/')) {
    if (status !== 'authenticated') {
      const returnTo = encodeURIComponent(location);
      return <Redirect to={`/auth?returnTo=${returnTo}`} />;
    }

    if (pathname === '/app' || pathname.startsWith('/app/command-center')) {
      return (
        <RouteSuspense>
          <AppShell>
            <CommandCenterScreen path={pathname} />
          </AppShell>
        </RouteSuspense>
      );
    }

    if (pathname === '/app/campaigns' || pathname.startsWith('/app/campaigns/')) {
      return (
        <RouteSuspense>
          <AppShell>
            <CampaignsScreen path={pathname} />
          </AppShell>
        </RouteSuspense>
      );
    }

    if (pathname === '/app/orders' || pathname.startsWith('/app/orders/')) {
      return (
        <RouteSuspense>
          <AppShell>
            <OrdersScreen path={pathname} />
          </AppShell>
        </RouteSuspense>
      );
    }

    if (pathname === '/app/products' || pathname.startsWith('/app/products/')) {
      return (
        <RouteSuspense>
          <AppShell>
            <ProductsScreen path={pathname} />
          </AppShell>
        </RouteSuspense>
      );
    }

    if (pathname === '/app/customers' || pathname.startsWith('/app/customers/')) {
      return (
        <RouteSuspense>
          <AppShell>
            <CustomersScreen path={pathname} />
          </AppShell>
        </RouteSuspense>
      );
    }

    if (pathname === '/app/traffic' || pathname.startsWith('/app/traffic/')) {
      return (
        <RouteSuspense>
          <AppShell>
            <TrafficScreen path={pathname} />
          </AppShell>
        </RouteSuspense>
      );
    }


    if (pathname === '/app/billing' || pathname.startsWith('/app/billing/')) {
      return (
        <RouteSuspense>
          <AppShell>
            <BillingScreen path={pathname} />
          </AppShell>
        </RouteSuspense>
      );
    }

    if (pathname === '/app/decisions' || pathname.startsWith('/app/decisions/')) {
      return (
        <RouteSuspense>
          <AppShell>
            <DecisionsScreen path={pathname} />
          </AppShell>
        </RouteSuspense>
      );
    }

    return (
      <RouteSuspense>
        <AppShell>
          <NotFound />
        </AppShell>
      </RouteSuspense>
    );
  }

  return <NotFound />;
}

function PublicAuthShell({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <div className="pd-auth-route-shell">
      <PublicTopbar onNavigate={navigate} />
      {children}
    </div>
  );
}

function RouteSuspense({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <Suspense
      fallback={(
        <main className="runtime-status">
          <p className="runtime-status__brand">PapaData</p>
          <h1>Ładowanie widoku…</h1>
          <p>Frontend przygotowuje ekran runtime.</p>
        </main>
      )}
    >
      {children}
    </Suspense>
  );
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
