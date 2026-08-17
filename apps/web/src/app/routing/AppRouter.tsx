import type { ReactNode } from 'react';
import {
  lazy,
  Suspense,
  useEffect,
} from 'react';

import {
  Button,
  Skeleton,
  Spinner,
} from '../../design-system/components';
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

const PapaScreen = lazy(async () => {
  const module = await import('../../screens/papa');

  return {
    default: module.PapaScreen,
  };
});

const CommandCenterScreen = lazy(async () => {
  const module = await import('../../screens/CommandCenterScreen');

  return {
    default: module.CommandCenterScreen,
  };
});

const SettingsRuntimeScreen = lazy(async () => {
  const module = await import('../../screens/settings');

  return {
    default: module.SettingsRuntimeScreen,
  };
});

const HelpScreen = lazy(async () => {
  const module = await import('../../screens/help');

  return {
    default: module.HelpScreen,
  };
});

export function AppRouter() {
  const location = useLocationPath();
  const pathname = location.split('?')[0] || '/';
  const { refresh, status } = useSession();

  if (status === 'loading') {
    return (
      <RuntimeLoadingScreen
        description="Weryfikujemy lokalną sesję klienta i konfigurację workspace."
        title="Sprawdzanie sesji"
      />
    );
  }

  if (status === 'error') {
    return (
      <main className="runtime-status runtime-status--message">
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


    if (pathname === '/app/settings') {
      return <Redirect to="/app/settings/organizacja" />;
    }

    if (pathname.startsWith('/app/settings/')) {
      return (
        <RouteSuspense>
          <AppShell>
            <SettingsRuntimeScreen path={pathname} />
          </AppShell>
        </RouteSuspense>
      );
    }

    if (pathname === '/app/help') {
      return <Redirect to="/app/help/strona-glowna-pomocy" />;
    }

    if (pathname.startsWith('/app/help/')) {
      return (
        <RouteSuspense>
          <AppShell>
            <HelpScreen path={pathname} />
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

    if (pathname === '/app/papa' || pathname.startsWith('/app/papa/')) {
      return (
        <RouteSuspense>
          <AppShell>
            <PapaScreen path={pathname} />
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
        <RuntimeLoadingScreen
          description="Przygotowujemy komponenty dashboardu i dane widoku."
          title="Ładowanie widoku"
        />
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
    <RuntimeLoadingScreen
      description="Przenosimy do właściwego widoku aplikacji."
      title="Przekierowanie"
    />
  );
}

function RuntimeLoadingScreen({
  description,
  title,
}: {
  readonly description: string;
  readonly title: string;
}) {
  return (
    <main
      aria-busy="true"
      className="runtime-status runtime-status--loading"
    >
      <section
        aria-label={title}
        className="runtime-status__stage"
      >
        <div className="runtime-status__brand-row">
          <p className="runtime-status__brand">PapaData</p>
          <Spinner
            delayMs={0}
            label={title}
            showLabel={false}
            size={18}
          />
        </div>

        <div className="runtime-status__copy">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <div
          aria-hidden="true"
          className="runtime-status__progress"
        >
          <span />
        </div>

        <div
          aria-hidden="true"
          className="runtime-status__blueprint"
        >
          <Skeleton
            height={16}
            lines={1}
            shape="rect"
            width="100%"
          />
          <div className="runtime-status__blueprint-grid">
            <Skeleton
              height={86}
              lines={1}
              shape="rect"
              width="100%"
            />
            <Skeleton
              height={86}
              lines={1}
              shape="rect"
              width="100%"
            />
            <Skeleton
              height={86}
              lines={1}
              shape="rect"
              width="100%"
            />
          </div>
          <Skeleton
            height={148}
            lines={1}
            shape="rect"
            width="100%"
          />
        </div>
      </section>
    </main>
  );
}

function NotFound() {
  return (
    <main className="runtime-status runtime-status--message">
      <p className="runtime-status__brand">PapaData</p>
      <h1>Nie znaleziono strony</h1>
      <p>Ta trasa nie istnieje w aktualnym runtime produktu.</p>
      <Button onClick={() => navigate('/')} variant="secondary">
        Wróć do aplikacji
      </Button>
    </main>
  );
}
