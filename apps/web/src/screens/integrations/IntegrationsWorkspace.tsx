import type {
  DataRow,
} from '../../../../../contracts/component-shared';
import {
  Button,
  DataTable,
  InlineNotice,
  PageHeader,
  SectionNavigation,
  StatusBadge,
} from '../../design-system';
import {
  getIntegrationNavigation,
  integrationColumns,
  integrationRows,
  resolveIntegrationStatusLabel,
} from './integrationsData';
import type {
  IntegrationEvent,
  IntegrationRecord,
  IntegrationScreenDefinition,
  IntegrationsData,
} from './integrationsData';
import './integrations-workspace.css';

export type IntegrationsWorkspaceProps = {
  readonly data: IntegrationsData;
  readonly definition: IntegrationScreenDefinition;
  readonly mode?: 'runtime' | 'storybook';
  readonly path?: string;
};

export function IntegrationsWorkspace({
  data,
  definition,
  mode = 'runtime',
  path = definition.routeBase,
}: IntegrationsWorkspaceProps) {
  const rows = integrationRows(data.integrations);

  return (
    <section
      aria-label={`Integracje i synchronizacja: ${definition.displayTitle}`}
      className="pd-integrations-workspace"
      data-integration-variant={definition.variant}
      data-mode={mode}
      data-screen-id={definition.id}
    >
      <PageHeader
        className="pd-integrations-workspace__header"
        actions={(
          <Button size="small" variant="secondary">
            Odśwież status
          </Button>
        )}
        breadcrumbs={[
          { href: '/app', label: 'Aplikacja' },
          { href: '/app/integrations/katalog', label: 'Integracje' },
          { href: null, label: definition.displayTitle },
        ]}
        subtitle={definition.summary}
        title={definition.displayTitle}
      />

      <SectionNavigation
        activeId={definition.id}
        ariaLabel="Widoki: Integracje i synchronizacja"
        className="pd-integrations-workspace__navigation"
        items={getIntegrationNavigation()}
        orientation="horizontal"
        size="compact"
        sticky
      />

      <IntegrationSummary data={data} />

      <IntegrationContent
        data={data}
        definition={definition}
        path={path}
        rows={rows}
      />
    </section>
  );
}

function IntegrationSummary({
  data,
}: {
  readonly data: IntegrationsData;
}) {
  return (
    <dl className="pd-integrations-workspace__summary" aria-label="Podsumowanie integracji">
      <div>
        <dt>Połączone</dt>
        <dd>{data.summary.connected}/{data.summary.total}</dd>
      </div>
      <div>
        <dt>Synchronizacja</dt>
        <dd>{data.summary.syncing}</dd>
      </div>
      <div>
        <dt>Częściowe</dt>
        <dd>{data.summary.degraded}</dd>
      </div>
      <div>
        <dt>Aktualizacja</dt>
        <dd>{formatShortDate(data.generatedAt)}</dd>
      </div>
    </dl>
  );
}

function IntegrationContent({
  data,
  definition,
  path,
  rows,
}: {
  readonly data: IntegrationsData;
  readonly definition: IntegrationScreenDefinition;
  readonly path: string;
  readonly rows: readonly DataRow[];
}) {
  switch (definition.variant) {
    case 'connect':
      return (
        <>
          <InlineNotice
            message="Kreator pokazuje kroki i wymagane zakresy. Połączenie wymaga autoryzacji użytkownika przed zapisem dostępu."
            title="Kreator połączenia"
            tone="info"
          />
          <IntegrationSteps
            steps={['Wybór providera', 'Zakres uprawnień', 'Autoryzacja', 'Test połączenia']}
          />
          <IntegrationTable rows={rows} />
        </>
      );
    case 'detail':
      return (
        <>
          <IntegrationDetail
            integration={data.selectedIntegration ?? data.integrations[0] ?? null}
            path={path}
          />
          <EventsTimeline events={data.events} />
        </>
      );
    case 'history':
      return <EventsTimeline events={data.events} />;
    case 'sync-run':
      return (
        <>
          <IntegrationSteps
            steps={['Kolejka', 'Pobranie', 'Normalizacja', 'Walidacja', 'Publikacja']}
          />
          <EventsTimeline events={data.events} />
        </>
      );
    case 'scope':
      return (
        <>
          <InlineNotice
            message="Zakres synchronizacji opisuje obiekty i uprawnienia możliwe do odczytu; zmiana zakresu pozostaje poza tym ekranem."
            title="Zakres synchronizacji"
            tone="info"
          />
          <IntegrationTable rows={rows} />
        </>
      );
    case 'reconnect':
      return (
        <>
          <InlineNotice
            message="Ponowne połączenie zachowuje informację o wpływie na dane i prowadzi operatora do odnowienia autoryzacji."
            title="Wymaga odnowienia autoryzacji"
            tone="warning"
          />
          <IntegrationTable rows={rows} />
        </>
      );
    case 'disconnect':
      return (
        <>
          <InlineNotice
            message="Odłączenie jest destrukcyjne dla przyszłych synchronizacji, więc ekran pokazuje skutki i blokuje pozorną akcję usunięcia."
            title="Przegląd skutków odłączenia"
            tone="critical"
          />
          <IntegrationTable rows={rows} />
        </>
      );
    case 'provider-outage':
      return (
        <>
          <InlineNotice
            message="Provider zwraca błędy częściowe. Dane pozostają oznaczone jako niepełne do kolejnego udanego przebiegu."
            title="Awaria providera"
            tone="critical"
          />
          <EventsTimeline events={data.events} />
        </>
      );
    case 'variants':
      return (
        <>
          <InlineNotice
            message="Widok zbiera stany connected, syncing, degraded, disconnected, outage, empty i forbidden w jednym kontrakcie ekranu."
            title="Warianty integracji"
            tone="info"
          />
          <IntegrationTable rows={rows} />
        </>
      );
    case 'catalog':
    default:
      return <IntegrationTable rows={rows} />;
  }
}

function IntegrationTable({
  rows,
}: {
  readonly rows: readonly DataRow[];
}) {
  return (
    <section className="pd-integrations-workspace__section">
      <header>
        <h2>Integracje</h2>
        <p>Status połączeń, synchronizacji i błędów źródłowych.</p>
      </header>
      <DataTable
        ariaLabel="Integracje i synchronizacja"
        cellRenderers={{
          statusLabel: (row) => (
            <StatusBadge
              status="Integracja"
              text={String(row.statusLabel ?? '')}
              tone={resolveStatusTone(row.status as IntegrationRecord['status'])}
            />
          ),
        }}
        columns={integrationColumns}
        emptyMessage="Brak integracji dla bieżącego workspace."
        emptyTitle="Brak integracji"
        loading={false}
        minWidth={820}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={`${rows.length} integracji`}
      />
    </section>
  );
}

function IntegrationDetail({
  integration,
  path,
}: {
  readonly integration: IntegrationRecord | null;
  readonly path: string;
}) {
  if (!integration) {
    return (
      <InlineNotice
        message="Brak szczegółu integracji dla bieżącego wyboru."
        title="Brak szczegółu"
        tone="info"
      />
    );
  }

  return (
    <section className="pd-integrations-workspace__section">
      <header>
        <h2>{integration.name}</h2>
        <StatusBadge
          status="Integracja"
          text={resolveIntegrationStatusLabel(integration.status)}
          tone={resolveStatusTone(integration.status)}
        />
      </header>
      <dl className="pd-integrations-workspace__details">
        <div>
          <dt>Provider</dt>
          <dd>{integration.provider}</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{integration.owner}</dd>
        </div>
        <div>
          <dt>Obiekty</dt>
          <dd>{integration.objects.toLocaleString('pl-PL')}</dd>
        </div>
        <div>
          <dt>Ścieżka</dt>
          <dd>{path}</dd>
        </div>
      </dl>
    </section>
  );
}

function IntegrationSteps({
  steps,
}: {
  readonly steps: readonly string[];
}) {
  return (
    <section className="pd-integrations-workspace__section">
      <header>
        <h2>Przebieg</h2>
        <p>Kroki są prezentowane jako stan odczytu, bez wykonywania operacji połączenia.</p>
      </header>
      <ol className="pd-integrations-workspace__steps">
        {steps.map((step, index) => (
          <li key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EventsTimeline({
  events,
}: {
  readonly events: readonly IntegrationEvent[];
}) {
  return (
    <section className="pd-integrations-workspace__section">
      <header>
        <h2>Zdarzenia synchronizacji</h2>
        <p>Ostatnie zdarzenia źródeł, retry i blokad danych.</p>
      </header>
      <ol className="pd-integrations-workspace__events">
        {events.map((event) => (
          <li key={event.id}>
            <StatusBadge
              status="Zdarzenie"
              text={resolveEventStatusLabel(event.status)}
              tone={resolveEventTone(event.status)}
            />
            <div>
              <strong>{event.title}</strong>
              <span>{event.detail}</span>
              <small>{formatShortDate(event.timestamp)}</small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function resolveStatusTone(
  status: IntegrationRecord['status'],
) {
  switch (status) {
    case 'connected':
      return 'success';
    case 'degraded':
      return 'warning';
    case 'disconnected':
      return 'critical';
    case 'syncing':
      return 'processing';
  }
}

function resolveEventTone(
  status: IntegrationEvent['status'],
) {
  switch (status) {
    case 'done':
      return 'success';
    case 'failed':
      return 'critical';
    case 'queued':
      return 'neutral';
    case 'running':
      return 'processing';
  }
}

function resolveEventStatusLabel(
  status: IntegrationEvent['status'],
) {
  switch (status) {
    case 'done':
      return 'Zakończone';
    case 'failed':
      return 'Błąd';
    case 'queued':
      return 'W kolejce';
    case 'running':
      return 'W toku';
  }
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}
