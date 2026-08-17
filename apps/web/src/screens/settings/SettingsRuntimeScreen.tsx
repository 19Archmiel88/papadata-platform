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
  InlineNotice,
  PageHeader,
  SectionNavigation,
  Skeleton,
} from '../../design-system';
import { useSession } from '../../app/providers';
import { bffClient } from '../../shared/api/bffClient';
import {
  findSettingsRuntimeDefinition,
  settingsRuntimeDefinitions,
} from './settingsRuntimeDefinitions';
import type {
  SettingsRuntimeDefinition,
} from './settingsRuntimeDefinitions';
import './settings-runtime.css';

type RuntimeRecord = {
  readonly data?: Readonly<Record<string, unknown>>;
  readonly externalKey?: string;
  readonly id?: string;
  readonly status?: string;
  readonly updatedAt?: string;
};

type RuntimeSettingsResponse = {
  readonly items?: readonly RuntimeRecord[];
  readonly operationId?: string;
  readonly source?: string;
};

export function SettingsRuntimeScreen({
  path,
}: {
  readonly path: string;
}) {
  const definition = useMemo(
    () => findSettingsRuntimeDefinition(path) ?? settingsRuntimeDefinitions[0],
    [path],
  );
  const { session } = useSession();
  const [data, setData] = useState<RuntimeSettingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!definition?.apiPath) {
      setData({ items: [], source: 'no-runtime-operation' });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await bffClient.readDomainScreen<RuntimeSettingsResponse>(definition.apiPath);
      setData(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nie udało się odczytać ustawień.');
    } finally {
      setLoading(false);
    }
  }, [definition]);

  useEffect(() => {
    void load();
  }, [load, session?.activeWorkspaceId]);

  if (!definition) return null;

  return (
    <section className="pd-settings-runtime" data-screen-id={definition.id}>
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
          { href: '/app/settings/organizacja', label: 'Ustawienia' },
          { href: null, label: definition.displayTitle },
        ]}
        subtitle={definition.summary}
        title={definition.displayTitle}
      />

      <SectionNavigation
        activeId={definition.id}
        ariaLabel="Widoki ustawień"
        items={settingsRuntimeDefinitions.flatMap((item) => (
          item.routeBase
            ? [{ href: item.routeBase, id: item.id, label: item.displayTitle }]
            : []
        ))}
        orientation="horizontal"
        size="compact"
        sticky
      />

      <RuntimeSessionContext definition={definition} />

      {loading ? (
        <div className="pd-settings-runtime__loading" aria-label="Ładowanie ustawień">
          <Skeleton height="5rem" lines={1} shape="rect" width="100%" />
          <Skeleton height="8rem" lines={1} shape="rect" width="100%" />
        </div>
      ) : error ? (
        <ErrorState
          errorCode="SETTINGS_RUNTIME_ERROR"
          message={error}
          onRetry={() => void load()}
          recoverable
          title="Nie udało się odczytać ustawień"
          variant="system"
        />
      ) : (
        <RuntimeRecords
          definition={definition}
          records={data?.items ?? []}
          source={data?.source ?? null}
        />
      )}
    </section>
  );
}

function RuntimeSessionContext({
  definition,
}: {
  readonly definition: SettingsRuntimeDefinition;
}) {
  const { session } = useSession();
  if (!session) return null;

  if (definition.variant === 'sessions') {
    return (
      <section className="pd-settings-runtime__session-card" aria-labelledby="current-session-title">
        <div>
          <span className="pd-settings-runtime__eyebrow">Aktualna sesja</span>
          <h2 id="current-session-title">To urządzenie</h2>
        </div>
        <dl>
          <div><dt>Session ID</dt><dd>{session.sessionId}</dd></div>
          <div><dt>Poziom uwierzytelnienia</dt><dd>{session.authLevel}</dd></div>
          <div><dt>Workspace</dt><dd>{session.activeWorkspaceId}</dd></div>
          <div><dt>Wygasa</dt><dd>{formatDateTime(session.expiresAt)}</dd></div>
        </dl>
      </section>
    );
  }

  if (definition.variant === 'account-security') {
    return (
      <InlineNotice
        message={`Aktywna sesja działa z poziomem „${session.authLevel}”. Operacje wrażliwe są dodatkowo chronione przez backend capability i step-up/MFA.`}
        title="Bezpieczeństwo aktywnej sesji"
        tone="info"
      />
    );
  }

  return null;
}

function RuntimeRecords({
  definition,
  records,
  source,
}: {
  readonly definition: SettingsRuntimeDefinition;
  readonly records: readonly RuntimeRecord[];
  readonly source: string | null;
}) {
  if (records.length === 0) {
    return (
      <EmptyState
        message={`Backend nie zwrócił jeszcze dodatkowych rekordów dla widoku „${definition.displayTitle}”. Dane sesji i uprawnienia nadal pochodzą z aktywnego kontekstu runtime.`}
        title="Brak dodatkowych danych"
        variant="empty"
      />
    );
  }

  return (
    <section className="pd-settings-runtime__records" aria-label={`Dane: ${definition.displayTitle}`}>
      <header>
        <div>
          <span className="pd-settings-runtime__eyebrow">Źródło runtime</span>
          <h2>Dane aktywnego workspace</h2>
        </div>
        {source ? <span className="pd-settings-runtime__source">{source}</span> : null}
      </header>
      <div className="pd-settings-runtime__record-grid">
        {records.map((record, index) => (
          <article className="pd-settings-runtime__record" key={record.id ?? record.externalKey ?? index}>
            <header>
              <h3>{record.externalKey ?? record.id ?? `Rekord ${index + 1}`}</h3>
              {record.status ? <span>{record.status}</span> : null}
            </header>
            {record.data ? <RuntimeData data={record.data} /> : null}
            {record.updatedAt ? <small>Aktualizacja: {formatDateTime(record.updatedAt)}</small> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function RuntimeData({
  data,
}: {
  readonly data: Readonly<Record<string, unknown>>;
}) {
  const entries = Object.entries(data).filter(([, value]) => (
    typeof value === 'string'
    || typeof value === 'number'
    || typeof value === 'boolean'
    || value === null
  ));

  if (entries.length === 0) {
    return <pre className="pd-settings-runtime__json">{JSON.stringify(data, null, 2)}</pre>;
  }

  return (
    <dl className="pd-settings-runtime__data-list">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt>{humanize(key)}</dt>
          <dd>{value === null ? '—' : String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function humanize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/gu, '$1 $2')
    .replaceAll('_', ' ')
    .replace(/^./u, (letter) => letter.toUpperCase());
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
