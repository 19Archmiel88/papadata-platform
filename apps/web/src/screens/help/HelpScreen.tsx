import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from '../../design-system';
import { useSession } from '../../app/providers';
import { bffClient } from '../../shared/api/bffClient';
import './help-screen.css';

type HelpRecord = {
  readonly data?: Readonly<Record<string, unknown>>;
  readonly externalKey?: string;
  readonly id?: string;
  readonly status?: string;
};

type HelpRuntimeResponse = {
  readonly items?: readonly HelpRecord[];
  readonly source?: string;
};

const helpRoutes: Readonly<Record<string, {
  readonly apiPath: `/api/v1/${string}`;
  readonly description: string;
  readonly title: string;
}>> = {
  '/app/help/strona-glowna-pomocy': {
    apiPath: '/api/v1/help/strona-glowna-pomocy',
    description: 'Procedury, materiały pomocy i kontakt ze wsparciem w kontekście aktywnego workspace.',
    title: 'Centrum Pomocy',
  },
  '/app/help/procedury': {
    apiPath: '/api/v1/help/procedury',
    description: 'Procedury operacyjne dostępne dla bieżącego kontekstu.',
    title: 'Procedury',
  },
  '/app/help/szczegoly-procedury': {
    apiPath: '/api/v1/help/szczegoly-procedury',
    description: 'Szczegóły wybranej procedury pomocy.',
    title: 'Szczegóły procedury',
  },
  '/app/help/lista-wynikow': {
    apiPath: '/api/v1/help/lista-wynikow',
    description: 'Wyniki wyszukiwania w centrum pomocy.',
    title: 'Wyniki pomocy',
  },
  '/app/help/zgloszenie-wsparcia': {
    apiPath: '/api/v1/help/zgloszenie-wsparcia',
    description: 'Informacje potrzebne do przygotowania zgłoszenia wsparcia.',
    title: 'Zgłoszenie wsparcia',
  },
};

export function HelpScreen({
  path,
}: {
  readonly path: string;
}) {
  const route = useMemo(
    () => helpRoutes[path] ?? helpRoutes['/app/help/strona-glowna-pomocy'],
    [path],
  );
  const { session } = useSession();
  const [data, setData] = useState<HelpRuntimeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!route) return;
    setLoading(true);
    setError(null);
    try {
      setData(await bffClient.readDomainScreen<HelpRuntimeResponse>(route.apiPath));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nie udało się odczytać centrum pomocy.');
    } finally {
      setLoading(false);
    }
  }, [route]);

  useEffect(() => {
    void load();
  }, [load, session?.activeWorkspaceId]);

  if (!route) return null;

  return (
    <section className="pd-help-runtime">
      <PageHeader
        actions={(
          <Button
            disabled={loading}
            onClick={() => void load()}
            size="small"
            variant="secondary"
          >
            {loading ? 'Odświeżanie…' : 'Odśwież'}
          </Button>
        )}
        breadcrumbs={[
          { href: '/app', label: 'Aplikacja' },
          { href: null, label: route.title },
        ]}
        subtitle={route.description}
        title={route.title}
      />

      {loading ? (
        <div className="pd-help-runtime__loading" aria-label="Ładowanie pomocy">
          <Skeleton height="5rem" lines={1} shape="rect" width="100%" />
          <Skeleton height="8rem" lines={1} shape="rect" width="100%" />
        </div>
      ) : error ? (
        <ErrorState
          errorCode="HELP_RUNTIME_ERROR"
          message={error}
          onRetry={() => void load()}
          recoverable
          title="Centrum Pomocy jest chwilowo niedostępne"
          variant="system"
        />
      ) : (data?.items ?? []).length === 0 ? (
        <EmptyState
          message="Backend nie zwrócił jeszcze opublikowanych materiałów pomocy dla tego widoku. Nie pokazujemy treści demonstracyjnych."
          title="Brak materiałów"
          variant="empty"
        />
      ) : (
        <div className="pd-help-runtime__list" role="list">
          {(data?.items ?? []).map((item, index) => (
            <article
              className="pd-help-runtime__item"
              key={item.id ?? item.externalKey ?? index}
              role="listitem"
            >
              <header>
                <h2>{readText(item.data, 'title') ?? item.externalKey ?? `Materiał ${index + 1}`}</h2>
                {item.status ? <span>{item.status}</span> : null}
              </header>
              <p>
                {readText(item.data, 'summary')
                  ?? readText(item.data, 'description')
                  ?? 'Materiał pomocy jest dostępny w aktywnym kontekście.'}
              </p>
              {readText(item.data, 'body') ? (
                <div className="pd-help-runtime__body">
                  {readText(item.data, 'body')}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function readText(
  data: Readonly<Record<string, unknown>> | undefined,
  key: string,
) {
  const value = data?.[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}
