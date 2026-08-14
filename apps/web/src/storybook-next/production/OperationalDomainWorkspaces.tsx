import type {
  DataColumn,
  DataRow,
} from '../../../../../contracts/component-shared';
import {
  DataTable,
  InlineNotice,
  PageHeader,
  ProgressIndicator,
  SectionNavigation,
  StatusBadge,
} from '../../design-system';
import type {
  StatusBadgeTone,
} from '../../design-system';
import type {
  DataQualityScreenDefinition,
  DataQualityWorkspaceData,
} from '../../screens/data-quality/dataQualityData';
import {
  conflictColumns,
  conflictRows,
  dataQualityColumns,
  dataQualityRows,
  getDataQualityNavigation,
  reviewColumns,
  reviewRows,
  resolveReadinessLabel,
  sourceQualityColumns,
  sourceQualityRows,
  variantColumns,
  variantRows,
} from '../../screens/data-quality/dataQualityData';
import type {
  IntegrationScreenDefinition,
  IntegrationsData,
} from '../../screens/integrations/integrationsData';
import {
  integrationColumns,
  integrationScreenDefinitions,
  integrationRows,
  resolveIntegrationStatusLabel,
} from '../../screens/integrations/integrationsData';
import type {
  PapaScreenDefinition,
  PapaWorkspaceData,
} from '../../screens/papa/papaData';
import {
  getPapaNavigation,
  papaActionColumns,
  papaActionRows,
  papaContextColumns,
  papaContextRows,
  papaEvidenceColumns,
  papaEvidenceRows,
  papaMemoryColumns,
  papaMemoryRows,
  papaModeColumns,
  papaModeRows,
} from '../../screens/papa/papaData';
import type {
  SettingsScreenDefinition,
  SettingsWorkspaceData,
} from '../../screens/settings/settingsData';
import {
  getSettingsNavigation,
  settingsAuditColumns,
  settingsAuditRows,
  settingsMemberColumns,
  settingsMemberRows,
  settingsRoleColumns,
  settingsRoleRows,
  settingsSessionColumns,
  settingsSessionRows,
  settingsSupportAccessColumns,
  settingsSupportAccessRows,
  settingsVariantColumns,
  settingsVariantRows,
} from '../../screens/settings/settingsData';
import {
  ProductionScreenCanvas,
} from './ProductionStoryShell';

type StatusTone =
  | 'critical'
  | 'info'
  | 'neutral'
  | 'success'
  | 'warning';

type OperationalDecisionItem = {
  readonly detail: string;
  readonly due: string;
  readonly id: string;
  readonly metric: string;
  readonly owner: string;
  readonly priority: 'critical' | 'high' | 'low' | 'medium';
  readonly status: string;
  readonly title: string;
};

const integrationNavigationItems = integrationScreenDefinitions.map((definition) => ({
  href: definition.routeBase,
  id: definition.id,
  label: resolveIntegrationNavigationLabel(definition),
}));

const dataQualityNavigationItems = getDataQualityNavigation();

const papaNavigationItems = getPapaNavigation();

const settingsNavigationItems = getSettingsNavigation();

function percent(value: number) {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(value);
}

function number(value: number) {
  return new Intl.NumberFormat('pl-PL').format(value);
}

function dateTime(value: string | null) {
  if (!value) return 'Brak synchronizacji';
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}

function readinessTone(value: string): StatusTone {
  if (value === 'ready' || value === 'connected' || value === 'active') return 'success';
  if (value === 'blocked' || value === 'sourceError' || value === 'failed' || value === 'high') return 'critical';
  if (value === 'partial' || value === 'stale' || value === 'warning' || value === 'degraded' || value === 'queued' || value === 'running' || value === 'syncing') return 'warning';
  if (value === 'info' || value === 'medium') return 'info';
  return 'neutral';
}

function statusBadge(status: string, text: string) {
  return (
    <StatusBadge
      status="Status"
      text={resolveOperationalStatusText(text)}
      tone={readinessTone(status)}
    />
  );
}

function KpiStrip({
  items,
}: {
  readonly items: readonly {
    readonly label: string;
    readonly value: string;
    readonly hint: string;
  }[];
}) {
  return (
    <dl className="pd-production-kpis">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
          <dd className="pd-production-kpis__hint">{item.hint}</dd>
        </div>
      ))}
    </dl>
  );
}

function ReadOnlyTable({
  ariaLabel,
  columns,
  rowHeaderColumnId,
  rows,
  summary,
}: {
  readonly ariaLabel: string;
  readonly columns: readonly DataColumn[];
  readonly rowHeaderColumnId?: string;
  readonly rows: readonly DataRow[];
  readonly summary: string;
}) {
  return (
    <div className="pd-production-table">
      <DataTable
        ariaLabel={ariaLabel}
        columns={columns}
        density="compact"
        emptyMessage="Fixture Storybooka nie zawiera danych dla tego widoku."
        loading={false}
        minWidth={760}
        rowCount={rows.length}
        rowHeaderColumnId={rowHeaderColumnId}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={summary}
      />
    </div>
  );
}

function StatusList({
  items,
}: {
  readonly items: readonly {
    readonly detail: string;
    readonly id: string;
    readonly status: string;
    readonly title: string;
  }[];
}) {
  return (
    <ul className="pd-production-list">
      {items.map((item) => (
        <li key={item.id}>
          <div className="pd-production-row">
            <strong>{item.title}</strong>
            {statusBadge(item.status, item.status)}
          </div>
          <span>{item.detail}</span>
        </li>
      ))}
    </ul>
  );
}

function ProcessRail({
  activeId,
  items,
}: {
  readonly activeId: string;
  readonly items: readonly {
    readonly detail: string;
    readonly id: string;
    readonly label: string;
    readonly status: string;
  }[];
}) {
  return (
    <ol className="pd-production-process" aria-label="Kroki procesu">
      {items.map((item) => (
        <li
          data-active={item.id === activeId ? 'true' : undefined}
          key={item.id}
        >
          <div>
            <strong>{item.label}</strong>
            <span>{item.detail}</span>
          </div>
          {statusBadge(item.status, item.status)}
        </li>
      ))}
    </ol>
  );
}

export function IntegrationsProductWorkspace({
  data,
  definition,
}: {
  readonly data: IntegrationsData;
  readonly definition: IntegrationScreenDefinition;
}) {
  const context = buildIntegrationContext(data, definition);

  return (
    <ProductionScreenCanvas
      className="pd-production-canvas--integrations"
      label={`Ekran integracji: ${definition.displayTitle}`}
      screenId={definition.id}
      variant={definition.variant}
    >
      <IntegrationScreenHeader
        context={context}
        definition={definition}
      />

      <IntegrationHealthStrip
        items={[
          { hint: 'wszystkie źródła w przestrzeni pracy', label: 'Integracje', value: number(data.summary.total) },
          { hint: 'gotowe do analityki', label: 'Połączone', value: number(data.summary.connected) },
          { hint: 'częściowe lub w toku', label: 'Częściowe', value: number(data.summary.degraded + data.summary.syncing) },
          { hint: 'błędy w ostatnim przebiegu', label: 'Błędy', value: number(context.errorCount) },
        ]}
      />

      <IntegrationCommandBrief
        context={context}
        definition={definition}
      />

      <IntegrationDecisionQueue
        items={context.decisions}
      />

      {renderIntegrationVariant(definition, data, context)}
    </ProductionScreenCanvas>
  );
}

function IntegrationScreenHeader({
  context,
  definition,
}: {
  readonly context: ReturnType<typeof buildIntegrationContext>;
  readonly definition: IntegrationScreenDefinition;
}) {
  const statusTone: StatusBadgeTone = context.degraded.length > 0 || context.disconnected.length > 0
    ? 'warning'
    : 'success';

  return (
    <>
      <PageHeader
        actions={(
          <StatusBadge
            status="Stan"
            text={statusTone === 'success' ? 'Gotowe' : 'Częściowe'}
            tone={statusTone}
          />
        )}
        breadcrumbs={[
          { href: '/app', label: 'Aplikacja' },
          { href: '/app/integrations/katalog', label: 'Integracje i synchronizacja' },
          { href: null, label: definition.displayTitle },
        ]}
        className="pd-production-domain-header"
        meta={[
          { label: 'Źródła', value: number(context.data.summary.total) },
          { label: 'Błędy', value: number(context.errorCount) },
          { label: 'Odświeżono', value: context.lastSyncLabel },
        ]}
        subtitle={definition.summary}
        title={definition.displayTitle}
      />
      <SectionNavigation
        activeId={definition.id}
        ariaLabel="Widoki integracji"
        className="pd-production-domain-nav"
        items={integrationNavigationItems}
        orientation="horizontal"
        size="compact"
      />
    </>
  );
}

function IntegrationHealthStrip({
  items,
}: {
  readonly items: readonly {
    readonly hint: string;
    readonly label: string;
    readonly value: string;
  }[];
}) {
  return (
    <dl className="pd-domain-health-strip">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
          <dd className="pd-domain-health-strip__hint">{item.hint}</dd>
        </div>
      ))}
    </dl>
  );
}

function IntegrationCommandBrief({
  context,
  definition,
}: {
  readonly context: ReturnType<typeof buildIntegrationContext>;
  readonly definition: IntegrationScreenDefinition;
}) {
  const selected = context.selected;
  const warning = definition.variant === 'provider-outage'
    || definition.variant === 'disconnect'
    || context.errorCount > 0;

  return (
    <section className="pd-domain-command-brief" aria-label="Brief synchronizacji">
      <header>
        <p className="pd-production-eyebrow">Brief synchronizacji</p>
        <h2>Co trzeba sprawdzić w integracjach teraz</h2>
        <span>{warning
          ? 'Najpierw źródła częściowe, odłączone i błędy ostatniego przebiegu. Mutacje pozostają poza Storybookiem.'
          : 'Źródła są gotowe do analityki; ekran pokazuje zakres, świeżość i skutki bez kontaktu z providerem.'}</span>
      </header>
      <aside>
        <span>{selected ? selected.name : 'Brak wybranej integracji'}</span>
        <strong>{selected ? resolveIntegrationStatusLabel(selected.status) : 'Brak'}</strong>
        <StatusBadge
          status="Sygnał"
          text={warning ? 'Do przeglądu' : 'Pod kontrolą'}
          tone={warning ? 'warning' : 'success'}
        />
      </aside>
    </section>
  );
}

function IntegrationDecisionQueue({
  items,
}: {
  readonly items: readonly OperationalDecisionItem[];
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Decyzje</p>
          <h2>Kolejka integracji do obsługi</h2>
        </div>
        <span>{number(items.length)} decyzje</span>
      </header>
      <ol className="pd-domain-decision-grid">
        {items.map((item) => (
          <li data-priority={item.priority} key={item.id}>
            <div>
              <StatusBadge
                status="Priorytet"
                text={resolveOperationalPriorityLabel(item.priority)}
                tone={resolveOperationalPriorityTone(item.priority)}
              />
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <dl>
              <div><dt>Metryka</dt><dd>{item.metric}</dd></div>
              <div><dt>Właściciel</dt><dd>{item.owner}</dd></div>
              <div><dt>Termin</dt><dd>{item.due}</dd></div>
              <div><dt>Status</dt><dd>{item.status}</dd></div>
            </dl>
            <StatusBadge status="Stan" text={item.status} tone={resolveOperationalPriorityTone(item.priority)} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function renderIntegrationVariant(
  definition: IntegrationScreenDefinition,
  data: IntegrationsData,
  context: ReturnType<typeof buildIntegrationContext>,
) {
  switch (definition.variant) {
    case 'catalog':
      return (
        <>
          <IntegrationCatalogBoard data={data} context={context} />
          <IntegrationTableSection
            rows={integrationRows(data.integrations)}
            title="Rejestr integracji i świeżości danych"
          />
        </>
      );
    case 'connect':
      return (
        <>
          <IntegrationWizard
            activeId="scope"
            title="Kreator połączenia bez uruchamiania OAuth"
          />
          <IntegrationScopeSection />
        </>
      );
    case 'detail':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Szczegół</p>
              <h2>Integracja, zakres danych i ostatnie zdarzenia</h2>
            </div>
            <StatusBadge
              status="Integracja"
              text={context.selected ? resolveIntegrationStatusLabel(context.selected.status) : 'Brak'}
              tone={context.selected ? resolveIntegrationTone(context.selected.status) : 'neutral'}
            />
          </header>
          {context.selected ? (
            <div className="pd-domain-split">
              <article className="pd-domain-card">
                <h3>{context.selected.name}</h3>
                <dl className="pd-production-facts">
                  <div><dt>Provider</dt><dd>{context.selected.provider}</dd></div>
                  <div><dt>Właściciel</dt><dd>{context.selected.owner}</dd></div>
                  <div><dt>Ostatnia synchronizacja</dt><dd>{dateTime(context.selected.lastSyncAt)}</dd></div>
                  <div><dt>Obiekty</dt><dd>{number(context.selected.objects)}</dd></div>
                  <div><dt>Błędy</dt><dd>{number(context.selected.errors)}</dd></div>
                </dl>
              </article>
              <article className="pd-domain-card">
                <h3>Zdarzenia synchronizacji</h3>
                <IntegrationEventList events={data.events.slice(0, 4)} />
              </article>
            </div>
          ) : <InlineNotice message="Fixture nie wskazuje integracji szczegółowej." title="Brak szczegółu" tone="info" />}
        </section>
      );
    case 'history':
      return <IntegrationEventsSection data={data} title="Historia synchronizacji" />;
    case 'sync-run':
      return (
        <>
          <IntegrationWizard
            activeId="sync"
            title="Przebieg synchronizacji krok po kroku"
          />
          <IntegrationEventsSection data={data} title="Zdarzenia synchronizacji" />
        </>
      );
    case 'scope':
      return <IntegrationScopeSection />;
    case 'reconnect':
      return (
        <>
          <IntegrationWizard
            activeId="review"
            title="Ponowne połączenie bez mutacji tokenu"
          />
          <IntegrationCatalogBoard data={data} context={context} />
        </>
      );
    case 'disconnect':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Odłączenie</p>
              <h2>Skutki odłączenia przed operacją destrukcyjną</h2>
              <p>Storybook pokazuje wpływ na dane, raporty i retry, ale nie wykonuje odłączenia.</p>
            </div>
            <StatusBadge status="Operacja" text="Wymaga potwierdzenia" tone="warning" />
          </header>
          <div className="pd-domain-card-grid">
            {data.integrations.slice(0, 4).map((item) => (
              <article key={item.id}>
                <StatusBadge status="Integracja" text={resolveIntegrationStatusLabel(item.status)} tone={resolveIntegrationTone(item.status)} />
                <h3>{item.name}</h3>
                <p>Odłączenie zatrzyma świeżość danych dla obszaru właściciela: {item.owner}.</p>
                <strong>{number(item.objects)} obiektów</strong>
              </article>
            ))}
          </div>
        </section>
      );
    case 'provider-outage':
      return (
        <>
          <IntegrationOutageBoard context={context} />
          <IntegrationEventsSection data={data} title="Zdarzenia synchronizacji" />
        </>
      );
    case 'variants':
      return (
        <>
          <section className="pd-production-section">
            <header>
              <div>
                <p className="pd-production-eyebrow">Warianty</p>
                <h2>Stany produkcyjne integracji</h2>
              </div>
              <span>7 stanów</span>
            </header>
            <div className="pd-domain-state-grid">
              {[
                { detail: 'Źródło połączone i gotowe do analityki.', id: 'connected', status: 'Połączona', title: 'Połączone', tone: 'success' as const, value: number(data.summary.connected) },
                { detail: 'Synchronizacja trwa, ekran pokazuje postęp bez wymuszania retry.', id: 'syncing', status: 'W toku', title: 'Synchronizacja', tone: 'warning' as const, value: number(data.summary.syncing) },
                { detail: 'Dane częściowe wymagają oznaczenia w ekranach zależnych.', id: 'degraded', status: 'Częściowa', title: 'Częściowe', tone: 'warning' as const, value: number(data.summary.degraded) },
                { detail: 'Źródło odłączone bez świeżości i bez obiektów.', id: 'disconnected', status: 'Odłączona', title: 'Odłączone', tone: 'critical' as const, value: number(data.summary.disconnected) },
                { detail: 'Awaria providera filtruje rejestr do źródeł problemowych.', id: 'outage', status: 'Awaria', title: 'Provider', tone: 'critical' as const, value: number(context.outageRows.length) },
                { detail: 'Pusty katalog zachowuje shell i komunikat.', id: 'empty', status: 'Pusty', title: 'Brak źródeł', tone: 'neutral' as const, value: '0' },
                { detail: 'Brak uprawnień zatrzymuje akcje połączenia.', id: 'forbidden', status: 'Blokada', title: 'Dostęp', tone: 'critical' as const, value: '403' },
              ].map((item) => (
                <article key={item.id}>
                  <StatusBadge status="Stan" text={item.status} tone={item.tone} />
                  <strong>{item.value}</strong>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </section>
          <IntegrationCatalogBoard data={data} context={context} />
        </>
      );
    default:
      return (
        <InlineNotice
          message={`Wariant ${definition.variant} nie ma jeszcze dedykowanej kompozycji w tym module.`}
          title="Brak kompozycji"
          tone="warning"
        />
      );
  }
}

function IntegrationCatalogBoard({
  context,
  data,
}: {
  readonly context: ReturnType<typeof buildIntegrationContext>;
  readonly data: IntegrationsData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Katalog</p>
          <h2>Źródła danych według świeżości i błędów</h2>
        </div>
        <span>{number(data.integrations.length)} integracji</span>
      </header>
      <div className="pd-domain-card-grid">
        {data.integrations.map((item) => (
          <article data-priority={item.errors > 0 || item.status === 'disconnected' ? 'high' : 'low'} key={item.id}>
            <StatusBadge status="Integracja" text={resolveIntegrationStatusLabel(item.status)} tone={resolveIntegrationTone(item.status)} />
            <h3>{item.name}</h3>
            <p>{item.provider} · właściciel {item.owner}</p>
            <ProgressIndicator
              description={`${number(item.objects)} obiektów, ${number(item.errors)} błędów`}
              indeterminate={item.status === 'syncing'}
              label={`Świeżość ${item.name}`}
              max={100}
              showValue
              tone={item.errors > 0 || item.status === 'degraded' ? 'warning' : item.status === 'disconnected' ? 'critical' : 'success'}
              value={item.status === 'disconnected' ? 0 : item.errors > 0 ? 72 : 96}
            />
          </article>
        ))}
      </div>
      {context.outageRows.length > 0 ? (
        <InlineNotice
          message={`${number(context.outageRows.length)} źródła wymagają oznaczenia częściowych danych w ekranach zależnych.`}
          title="Częściowa kompletność integracji"
          tone="warning"
        />
      ) : null}
    </section>
  );
}

function IntegrationWizard({
  activeId,
  title,
}: {
  readonly activeId: string;
  readonly title: string;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Proces</p>
          <h2>{title}</h2>
        </div>
        <StatusBadge status="Tryb" text="Tylko podgląd" tone="info" />
      </header>
      <ProcessRail
        activeId={activeId}
        items={[
          { detail: 'Wybór providera, tenant i typ danych.', id: 'provider', label: 'Wybór providera', status: 'connected' },
          { detail: 'Zamówienia, refundacje, klienci i koszty kampanii.', id: 'scope', label: 'Zakres i uprawnienia', status: activeId === 'scope' ? 'syncing' : 'connected' },
          { detail: 'Aktualny przebieg pobierania i kompaktowania danych.', id: 'sync', label: 'Synchronizacja', status: activeId === 'sync' ? 'running' : 'queued' },
          { detail: 'Wpływ na raporty, świeżość, retry i ograniczenia.', id: 'review', label: 'Przegląd skutków', status: activeId === 'review' ? 'warning' : 'queued' },
        ]}
      />
    </section>
  );
}

function IntegrationScopeSection() {
  const rows: readonly DataRow[] = [
    { freshness: '15 min', id: 'orders', impact: 'Przychód, refundacje, LTV', object: 'Zamówienia', permission: 'read_orders' },
    { freshness: '60 min', id: 'customers', impact: 'Segmenty, kohorty, retencja', object: 'Klienci', permission: 'read_customers' },
    { freshness: '120 min', id: 'ads', impact: 'ROAS, CAC, tempo budżetu', object: 'Koszty kampanii', permission: 'ads.readonly' },
  ];
  const columns: readonly DataColumn[] = [
    { id: 'object', label: 'Obiekt', sortable: true },
    { id: 'permission', label: 'Zakres', sortable: true },
    { id: 'freshness', label: 'Świeżość', sortable: true },
    { id: 'impact', label: 'Wpływ produktu', sortable: false },
  ];

  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Zakres</p>
          <h2>Zakres synchronizacji i wpływ na produkt</h2>
        </div>
        <span>{number(rows.length)} obiekty</span>
      </header>
      <ReadOnlyTable
        ariaLabel="Zakres synchronizacji integracji"
        columns={columns}
        rowHeaderColumnId="object"
        rows={rows}
        summary="Zakres obiektów i uprawnień synchronizacji."
      />
    </section>
  );
}

function IntegrationEventsSection({
  data,
  title,
}: {
  readonly data: IntegrationsData;
  readonly title: string;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Historia</p>
          <h2>{title}</h2>
          <p>Oś pokazuje przebieg, retry i blokady bez uruchamiania ponownej synchronizacji.</p>
        </div>
        <span>{number(data.events.length)} zdarzenia</span>
      </header>
      <IntegrationEventList events={data.events} />
    </section>
  );
}

function IntegrationEventList({
  events,
}: {
  readonly events: IntegrationsData['events'];
}) {
  return (
    <StatusList
      items={events.map((event) => ({
        detail: `${dateTime(event.timestamp)} · ${event.detail}`,
        id: event.id,
        status: event.status,
        title: event.title,
      }))}
    />
  );
}

function IntegrationOutageBoard({
  context,
}: {
  readonly context: ReturnType<typeof buildIntegrationContext>;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Awaria</p>
          <h2>Źródła dotknięte awarią providera</h2>
        </div>
        <span>{number(context.outageRows.length)} źródła</span>
      </header>
      {context.outageRows.length > 0 ? (
        <div className="pd-domain-card-grid">
          {context.outageRows.map((item) => (
            <article data-priority="critical" key={item.id}>
              <StatusBadge status="Integracja" text={resolveIntegrationStatusLabel(item.status)} tone={resolveIntegrationTone(item.status)} />
              <h3>{item.name}</h3>
              <p>{item.provider} · właściciel {item.owner}</p>
              <dl className="pd-production-facts">
                <div><dt>Ostatnia synchronizacja</dt><dd>{dateTime(item.lastSyncAt)}</dd></div>
                <div><dt>Błędy</dt><dd>{number(item.errors)}</dd></div>
                <div><dt>Obiekty</dt><dd>{number(item.objects)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <InlineNotice
          message="Fixture nie zawiera awarii providera dla bieżącego zakresu."
          title="Brak awarii"
          tone="success"
        />
      )}
    </section>
  );
}

function IntegrationTableSection({
  rows,
  title,
}: {
  readonly rows: readonly DataRow[];
  readonly title: string;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Rejestr</p>
          <h2>{title}</h2>
        </div>
        <span>{number(rows.length)} rekordów</span>
      </header>
      <ReadOnlyTable
        ariaLabel="Integracje i synchronizacja"
        columns={integrationColumns}
        rowHeaderColumnId="name"
        rows={rows}
        summary="Źródła, właściciele, świeżość i błędy synchronizacji."
      />
    </section>
  );
}

function buildIntegrationContext(
  data: IntegrationsData,
  definition: IntegrationScreenDefinition,
) {
  const selected = data.selectedIntegration ?? data.integrations[0] ?? null;
  const degraded = data.integrations.filter((item) => item.status === 'degraded');
  const disconnected = data.integrations.filter((item) => item.status === 'disconnected');
  const syncing = data.integrations.filter((item) => item.status === 'syncing');
  const outageRows = data.integrations.filter((item) => item.status === 'degraded' || item.status === 'disconnected' || item.errors > 0);
  const errorCount = data.integrations.reduce((total, item) => total + item.errors, 0);
  const lastSyncAt = data.integrations
    .map((item) => item.lastSyncAt)
    .filter((value): value is string => value !== null)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
  const decisions: readonly OperationalDecisionItem[] = [
    {
      detail: 'Źródła częściowe powinny oznaczać dane zależne jako ograniczone przed interpretacją raportów.',
      due: 'dzisiaj 11:00',
      id: 'integrations-degraded',
      metric: `${number(degraded.length)} częściowe`,
      owner: 'Analityka danych',
      priority: degraded.length > 0 ? 'high' : 'low',
      status: degraded.length > 0 ? 'Do przeglądu' : 'Pod kontrolą',
      title: 'Oznacz częściową kompletność źródeł',
    },
    {
      detail: 'Odłączone integracje blokują świeżość i powinny trafić do reconnect flow zamiast cichego pominięcia.',
      due: 'dzisiaj 14:00',
      id: 'integrations-disconnected',
      metric: `${number(disconnected.length)} odłączone`,
      owner: 'Operations',
      priority: disconnected.length > 0 ? 'critical' : 'low',
      status: disconnected.length > 0 ? 'Wymaga połączenia' : 'Pod kontrolą',
      title: 'Przywróć odłączone integracje',
    },
    {
      detail: definition.variant === 'disconnect'
        ? 'Przed odłączeniem pokaż skutki dla raportów, LTV i kosztów kampanii.'
        : 'Zakres uprawnień musi być jawny, zanim operator uzna źródło za gotowe.',
      due: 'jutro 10:00',
      id: 'integrations-scope',
      metric: 'zakres obiektów',
      owner: 'Product Ops',
      priority: definition.variant === 'disconnect' ? 'high' : 'medium',
      status: 'Do potwierdzenia',
      title: 'Zweryfikuj zakres synchronizacji',
    },
  ];

  return {
    data,
    decisions,
    degraded,
    disconnected,
    errorCount,
    lastSyncLabel: dateTime(lastSyncAt),
    outageRows,
    selected,
    syncing,
  };
}

function resolveIntegrationNavigationLabel(definition: IntegrationScreenDefinition): string {
  switch (definition.id) {
    case '40.01':
      return 'Katalog';
    case '40.02':
      return 'Kreator';
    case '40.03':
      return 'Szczegół';
    case '40.04':
      return 'Historia';
    case '40.05':
      return 'Przebieg';
    case '40.06':
      return 'Zakres';
    case '40.07':
      return 'Ponowne';
    case '40.08':
      return 'Odłączenie';
    case '40.09':
      return 'Awaria';
    case '40.10':
      return 'Warianty';
    default:
      return definition.displayTitle;
  }
}

function resolveOperationalPriorityLabel(priority: OperationalDecisionItem['priority']): string {
  switch (priority) {
    case 'critical':
      return 'Krytyczne';
    case 'high':
      return 'Wysokie';
    case 'medium':
      return 'Średnie';
    case 'low':
    default:
      return 'Niskie';
  }
}

function resolveOperationalPriorityTone(priority: OperationalDecisionItem['priority']): StatusBadgeTone {
  switch (priority) {
    case 'critical':
      return 'critical';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
    default:
      return 'success';
  }
}

function resolveIntegrationTone(status: IntegrationsData['integrations'][number]['status']): StatusBadgeTone {
  switch (status) {
    case 'connected':
      return 'success';
    case 'syncing':
      return 'warning';
    case 'degraded':
      return 'warning';
    case 'disconnected':
      return 'critical';
    default:
      return 'neutral';
  }
}

function resolveOperationalStatusText(text: string): string {
  switch (text) {
    case 'connected':
      return 'Połączone';
    case 'degraded':
      return 'Częściowe';
    case 'disconnected':
      return 'Odłączone';
    case 'syncing':
    case 'running':
      return 'W toku';
    case 'queued':
      return 'W kolejce';
    case 'done':
      return 'Gotowe';
    case 'failed':
      return 'Błąd';
    case 'ready':
      return 'Gotowe';
    case 'partial':
      return 'Częściowe';
    case 'blocked':
      return 'Zablokowane';
    case 'warning':
      return 'Ostrzeżenie';
    case 'manual':
      return 'Ręczna';
    case 'auto':
      return 'Automatyczna';
    case 'new':
      return 'Nowe';
    case 'review':
      return 'W przeglądzie';
    case 'approved':
      return 'Zatwierdzone';
    case 'rejected':
      return 'Odrzucone';
    case 'active':
      return 'Aktywne';
    case 'invited':
      return 'Zaproszenie';
    case 'disabled':
      return 'Wyłączone';
    case 'current':
      return 'Bieżąca';
    case 'expired':
      return 'Wygasła';
    case 'time-boxed':
      return 'Czasowy';
    case 'pending-review':
      return 'Do przeglądu';
    case 'draft':
      return 'Szkic';
    case 'approval':
      return 'Do akceptacji';
    case 'high':
      return 'Wysokie';
    case 'medium':
      return 'Średnie';
    case 'low':
      return 'Niskie';
    default:
      return text;
  }
}

export function DataQualityProductWorkspace({
  data,
  definition,
}: {
  readonly data: DataQualityWorkspaceData;
  readonly definition: DataQualityScreenDefinition;
}) {
  const context = buildDataQualityContext(data, definition);

  return (
    <ProductionScreenCanvas
      className="pd-production-canvas--data-quality"
      label={`Ekran jakości danych: ${definition.displayTitle}`}
      screenId={definition.id}
      variant={definition.variant}
    >
      <DataQualityScreenHeader
        context={context}
        definition={definition}
      />

      <DataQualityHealthStrip
        items={[
          { hint: 'źródła z aktualnego zakresu', label: 'Zbiory', value: number(data.datasets.length) },
          { hint: 'gotowe do decyzji', label: 'Gotowe', value: number(data.summary.completeDatasets) },
          { hint: 'wymagają wyjaśnienia', label: 'Konflikty', value: number(data.summary.conflicts) },
          { hint: 'najpilniejsza kolejka', label: 'Przegląd', value: number(data.reviewItems.length) },
        ]}
      />

      <DataQualityCommandBrief
        context={context}
        definition={definition}
      />

      <DataQualityDecisionQueue items={context.decisions} />

      {renderDataQualityVariant(definition, data, context)}
    </ProductionScreenCanvas>
  );
}

function DataQualityScreenHeader({
  context,
  definition,
}: {
  readonly context: ReturnType<typeof buildDataQualityContext>;
  readonly definition: DataQualityScreenDefinition;
}) {
  const statusTone: StatusBadgeTone = context.criticalDiagnostics.length > 0 || context.staleDatasets.length > 0
    ? 'warning'
    : 'success';

  return (
    <>
      <PageHeader
        actions={(
          <StatusBadge
            status="Stan"
            text={statusTone === 'success' ? 'Gotowe' : 'Częściowe'}
            tone={statusTone}
          />
        )}
        breadcrumbs={[
          { href: '/app', label: 'Aplikacja' },
          { href: '/app/data-quality/centrum-jakosci', label: 'Jakość danych i integralność' },
          { href: null, label: definition.displayTitle },
        ]}
        className="pd-production-domain-header"
        meta={[
          { label: 'Zbiory', value: number(context.data.datasets.length) },
          { label: 'Konflikty', value: number(context.data.summary.conflicts) },
          { label: 'Odświeżono', value: context.lastSyncLabel },
        ]}
        subtitle={definition.summary}
        title={definition.displayTitle}
      />
      <SectionNavigation
        activeId={definition.id}
        ariaLabel="Widoki jakości danych"
        className="pd-production-domain-nav"
        items={dataQualityNavigationItems}
        orientation="horizontal"
        size="compact"
      />
    </>
  );
}

function DataQualityHealthStrip({
  items,
}: {
  readonly items: readonly {
    readonly hint: string;
    readonly label: string;
    readonly value: string;
  }[];
}) {
  return (
    <dl className="pd-domain-health-strip">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
          <dd className="pd-domain-health-strip__hint">{item.hint}</dd>
        </div>
      ))}
    </dl>
  );
}

function DataQualityCommandBrief({
  context,
  definition,
}: {
  readonly context: ReturnType<typeof buildDataQualityContext>;
  readonly definition: DataQualityScreenDefinition;
}) {
  return (
    <section className="pd-domain-command-brief" aria-label="Priorytet jakości danych">
      <header>
        <span>Dane</span>
        <h2>Co trzeba sprawdzić w jakości danych teraz</h2>
        <strong>{context.brief}</strong>
        <p>{definition.summary}</p>
      </header>
      <aside>
        <span>Największy wpływ</span>
        <strong>{context.focusMetric}</strong>
        <p>{context.focusDetail}</p>
      </aside>
    </section>
  );
}

function DataQualityDecisionQueue({
  items,
}: {
  readonly items: readonly OperationalDecisionItem[];
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Kolejka decyzji jakości danych</h2>
        <span>{items.length} pozycji</span>
      </header>
      <ol className="pd-domain-decision-grid">
        {items.map((item) => (
          <li data-priority={item.priority} key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <dl>
              <div>
                <dt>Priorytet</dt>
                <dd>
                  <StatusBadge
                    status="Priorytet"
                    text={resolveOperationalPriorityLabel(item.priority)}
                    tone={resolveOperationalPriorityTone(item.priority)}
                  />
                </dd>
              </div>
              <div>
                <dt>Metryka</dt>
                <dd>{item.metric}</dd>
              </div>
              <div>
                <dt>Zespół</dt>
                <dd>{item.owner}</dd>
              </div>
              <div>
                <dt>Termin</dt>
                <dd>{item.due}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}

function renderDataQualityVariant(
  definition: DataQualityScreenDefinition,
  data: DataQualityWorkspaceData,
  context: ReturnType<typeof buildDataQualityContext>,
) {
  switch (definition.variant) {
    case 'dataset':
      return (
        <>
          <DataQualityDatasetBoard data={data} />
          <DataQualityTableSection
            ariaLabel="Zbiory jakości danych"
            columns={dataQualityColumns}
            heading="Rejestr zbiorów danych"
            rowHeaderColumnId="name"
            rows={dataQualityRows(data.datasets)}
            summary="Zbiory danych, kompletność, świeżość i konflikty."
          />
          <DataQualityMobileDatasets data={data} />
        </>
      );
    case 'lineage':
      return (
        <>
          <section className="pd-production-section">
            <header>
              <h2>Pochodzenie danych i transformacje</h2>
              <span>{data.sourceRecords.length} reguły</span>
            </header>
            <ProcessRail
              activeId="resolve"
              items={[
                { detail: 'Shopify, GA4, CRM i koszty reklamowe wchodzą jako źródła kontraktowe.', id: 'sources', label: 'Źródła', status: 'ready' },
                { detail: 'Normalizacja mapuje zamówienia, koszty i zdarzenia do wspólnego modelu.', id: 'normalize', label: 'Normalizacja', status: 'ready' },
                { detail: 'Reguły nadrzędności wskazują, który zapis wygrywa przy konflikcie.', id: 'resolve', label: 'Rozstrzygnięcie', status: 'partial' },
                { detail: 'Metryki sprzedaży i marży pokazują ograniczenia razem z wynikiem.', id: 'publish', label: 'Publikacja', status: 'queued' },
              ]}
            />
          </section>
          <DataQualityRulesBoard data={data} />
        </>
      );
    case 'source-overlap':
      return (
        <>
          <DataQualityRulesBoard data={data} />
          <DataQualityTableSection
            ariaLabel="Reguły jakości źródeł"
            columns={sourceQualityColumns}
            heading="Nakładanie źródeł według pola"
            rowHeaderColumnId="label"
            rows={sourceQualityRows(data.sourceRecords)}
            summary="Reguły porównania źródeł i decyzje nadrzędności."
          />
        </>
      );
    case 'source-priority':
      return (
        <>
          <DataQualityPriorityBoard data={data} />
          <DataQualityTableSection
            ariaLabel="Reguły jakości źródeł"
            columns={sourceQualityColumns}
            heading="Nadrzędność źródła"
            rowHeaderColumnId="label"
            rows={sourceQualityRows(data.sourceRecords)}
            summary="Reguły nadrzędności dla pól krytycznych."
          />
        </>
      );
    case 'conflicts':
      return (
        <>
          <DataQualityConflictBoard data={data} />
          <DataQualityTableSection
            ariaLabel="Konflikty jakości danych"
            columns={conflictColumns}
            heading="Konflikty źródeł do rozstrzygnięcia"
            rowHeaderColumnId="entityType"
            rows={conflictRows(data.conflicts)}
            summary="Konflikty źródeł wraz z proponowanym rozstrzygnięciem."
          />
        </>
      );
    case 'manual-review':
      return (
        <>
          <DataQualityReviewBoard data={data} />
          <DataQualityTableSection
            ariaLabel="Kolejka ręcznego przeglądu"
            columns={reviewColumns}
            heading="Przegląd ręczny rekordów"
            rowHeaderColumnId="title"
            rows={reviewRows(data.reviewItems)}
            summary="Elementy wymagające decyzji człowieka przed dalszym przetwarzaniem."
          />
        </>
      );
    case 'reprocessing':
      return (
        <>
          <section className="pd-production-section">
            <header>
              <h2>Ponowne przetwarzanie bez uruchamiania zadania</h2>
              <span>5 kroków</span>
            </header>
            <ProcessRail
              activeId="impact"
              items={[
                { detail: 'Zakres obejmuje zbiory z konfliktem lub nieświeżą synchronizacją.', id: 'scope', label: 'Zakres danych', status: 'ready' },
                { detail: 'Sprawdzenie uprawnień oraz blokad prywatności przed przygotowaniem operacji.', id: 'policy', label: 'Kontrole', status: 'ready' },
                { detail: 'Oszacowanie wpływu na metryki sprzedaży, marży i atrybucji.', id: 'impact', label: 'Wpływ', status: 'partial' },
                { detail: 'Operator potwierdza zakres poza tym widokiem.', id: 'approval', label: 'Potwierdzenie', status: 'queued' },
                { detail: 'Dopiero osobna mutacja dodaje zadanie do kolejki.', id: 'queue', label: 'Kolejka', status: 'blocked' },
              ]}
            />
          </section>
          <DataQualityDatasetBoard data={data} />
        </>
      );
    case 'reconciliation':
      return (
        <>
          <DataQualityReconciliationBoard data={data} />
          <DataQualityTableSection
            ariaLabel="Konflikty jakości danych"
            columns={conflictColumns}
            heading="Skrót rekoncyliacji źródeł"
            rowHeaderColumnId="entityType"
            rows={conflictRows(data.conflicts)}
            summary="Konflikty źródeł wraz z proponowanym rozstrzygnięciem."
          />
        </>
      );
    case 'variants':
      return (
        <section className="pd-production-section">
          <header>
            <h2>Stany produkcyjne jakości danych</h2>
            <span>{data.variants.length} warianty</span>
          </header>
          <OperationalStateGrid
            items={data.variants.map((item) => ({
              condition: item.condition,
              detail: `${item.composition}. ${item.limitation}`,
              id: item.id,
              label: item.variant,
              status: item.variant,
              tone: item.variant === 'konflikt' ? 'warning' : item.variant === 'offline' ? 'critical' : item.variant === 'częściowe' ? 'warning' : 'success',
            }))}
          />
        </section>
      );
    case 'quality-center':
    default:
      return (
        <>
          <DataQualityDatasetBoard data={data} />
          <DataQualityConflictBoard data={data} />
          <DataQualityTableSection
            ariaLabel="Zbiory jakości danych"
            columns={dataQualityColumns}
            heading="Najważniejsze zbiory i ograniczenia"
            rowHeaderColumnId="name"
            rows={dataQualityRows(data.datasets)}
            summary="Zbiory danych, kompletność, świeżość i konflikty."
          />
          <DataQualityMobileDatasets data={data} />
        </>
      );
  }
}

function DataQualityDatasetBoard({
  data,
}: {
  readonly data: DataQualityWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Zbiory danych według gotowości</h2>
        <span>{data.datasets.length} zbiory</span>
      </header>
      <div className="pd-quality-cockpit" aria-label="Zbiory i blokady jakości danych">
        <div className="pd-quality-cockpit__column">
          <h3>Stan zbiorów</h3>
          {data.datasets.map((dataset) => (
            <div className="pd-quality-dataset" key={dataset.id}>
              <div className="pd-production-row">
                <strong>{dataset.name}</strong>
                <StatusBadge
                  status="Stan"
                  text={resolveReadinessLabel(dataset.readiness)}
                  tone={readinessTone(dataset.readiness)}
                />
              </div>
              <span>{dataset.owner} · {number(dataset.records)} rekordów · odświeżono {dateTime(dataset.freshnessAt)}</span>
              <ProgressIndicator
                description={`${dataset.conflicts} konfliktów w zakresie`}
                indeterminate={false}
                label={`Kompletność ${dataset.name}`}
                max={100}
                showValue
                tone={dataset.readiness === 'ready' ? 'success' : 'warning'}
                value={Math.round(dataset.completeness * 100)}
              />
            </div>
          ))}
        </div>
        <div className="pd-quality-cockpit__column">
          <h3>Ograniczenia</h3>
          <StatusList
            items={data.diagnostics.map((item) => ({
              detail: `${item.source} · ${number(item.affectedRecords)} rekordów`,
              id: item.id,
              status: item.severity,
              title: item.label,
            }))}
          />
        </div>
        <div className="pd-quality-cockpit__column">
          <h3>Źródła</h3>
          <dl className="pd-production-facts">
            {data.sources.map((source) => (
              <div key={`${source.provider}-${source.dataset}`}>
                <dt>{source.provider}</dt>
                <dd>{percent(source.completeness)} · {dateTime(source.lastSyncAt)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function DataQualityRulesBoard({
  data,
}: {
  readonly data: DataQualityWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Reguły porównania źródeł</h2>
        <span>{data.sourceRecords.length} reguły</span>
      </header>
      <div className="pd-domain-card-grid">
        {data.sourceRecords.map((record) => (
          <article data-priority={record.confidence < 0.8 ? 'high' : 'medium'} key={record.id}>
            <header className="pd-production-row">
              <h3>{record.label}</h3>
              <StatusBadge
                status="Pewność"
                text={percent(record.confidence)}
                tone={record.confidence < 0.8 ? 'warning' : 'success'}
              />
            </header>
            <p>{record.rule}</p>
            <dl>
              <div>
                <dt>Źródło nadrzędne</dt>
                <dd>{record.primarySource}</dd>
              </div>
              <div>
                <dt>Źródło porównane</dt>
                <dd>{record.secondarySource}</dd>
              </div>
              <div>
                <dt>Nakładanie</dt>
                <dd>{record.overlapPercent.toLocaleString('pl-PL')}%</dd>
              </div>
              <div>
                <dt>Decyzja</dt>
                <dd>{record.confidence < 0.8 ? 'Do ręcznego przeglądu' : 'Może zasilać metryki'}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function DataQualityPriorityBoard({
  data,
}: {
  readonly data: DataQualityWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Priorytet źródeł dla pól krytycznych</h2>
        <span>{data.sourceRecords.length} pól</span>
      </header>
      <ul className="pd-domain-record-list">
        {data.sourceRecords.map((record) => (
          <li key={record.id}>
            <div>
              <strong>{record.label}</strong>
              <span>{record.rule}</span>
            </div>
            <span>{record.primarySource} nad {record.secondarySource}</span>
            <b>{percent(record.confidence)}</b>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DataQualityConflictBoard({
  data,
}: {
  readonly data: DataQualityWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Konflikty wpływające na decyzje</h2>
        <span>{data.conflicts.length} konflikty</span>
      </header>
      <div className="pd-domain-card-grid">
        {data.conflicts.map((conflict) => (
          <article data-priority={conflict.impact === 'high' ? 'critical' : conflict.impact === 'medium' ? 'high' : 'low'} key={conflict.id}>
            <header className="pd-production-row">
              <h3>{conflict.entityType}</h3>
              <StatusBadge
                status="Wpływ"
                text={resolveOperationalStatusText(conflict.impact)}
                tone={conflict.impact === 'high' ? 'critical' : conflict.impact === 'medium' ? 'warning' : 'success'}
              />
            </header>
            <p>{conflict.proposedResolution}</p>
            <dl>
              <div>
                <dt>Źródła</dt>
                <dd>{conflict.sourceA} / {conflict.sourceB}</dd>
              </div>
              <div>
                <dt>Kolejka</dt>
                <dd>{resolveOperationalStatusText(conflict.queue)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function DataQualityReviewBoard({
  data,
}: {
  readonly data: DataQualityWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Kolejka ręcznego przeglądu</h2>
        <span>{data.reviewItems.length} pozycje</span>
      </header>
      <ul className="pd-domain-record-list">
        {data.reviewItems.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <span>{item.owner} · termin {dateTime(item.dueAt)}</span>
            </div>
            <StatusBadge
              status="Status"
              text={resolveOperationalStatusText(item.status)}
              tone={item.status === 'blocked' ? 'critical' : item.status === 'approved' ? 'success' : 'warning'}
            />
            <b>{percent(item.confidence)}</b>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DataQualityReconciliationBoard({
  data,
}: {
  readonly data: DataQualityWorkspaceData;
}) {
  const manualCount = data.conflicts.filter((conflict) => conflict.queue === 'manual').length;
  const blockedCount = data.conflicts.filter((conflict) => conflict.queue === 'blocked').length;

  return (
    <section className="pd-production-section">
      <header>
        <h2>Rekoncyliacja źródeł</h2>
        <span>{manualCount + blockedCount} do decyzji</span>
      </header>
      <div className="pd-domain-split">
        <article className="pd-domain-card">
          <h3>Ręczne rozstrzygnięcie</h3>
          <dl>
            <div>
              <dt>Pozycje</dt>
              <dd>{manualCount}</dd>
            </div>
            <div>
              <dt>Zasada</dt>
              <dd>człowiek potwierdza zwycięskie źródło</dd>
            </div>
          </dl>
        </article>
        <article className="pd-domain-card">
          <h3>Zablokowane</h3>
          <dl>
            <div>
              <dt>Pozycje</dt>
              <dd>{blockedCount}</dd>
            </div>
            <div>
              <dt>Przyczyna</dt>
              <dd>brak pełnego źródła kosztu lub tożsamości</dd>
            </div>
          </dl>
        </article>
        <article className="pd-domain-card">
          <h3>Gotowe automatycznie</h3>
          <dl>
            <div>
              <dt>Pozycje</dt>
              <dd>{data.conflicts.filter((conflict) => conflict.queue === 'auto').length}</dd>
            </div>
            <div>
              <dt>Warunek</dt>
              <dd>reguła nadrzędności jest jednoznaczna</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}

function DataQualityTableSection({
  ariaLabel,
  columns,
  heading,
  rowHeaderColumnId,
  rows,
  summary,
}: {
  readonly ariaLabel: string;
  readonly columns: readonly DataColumn[];
  readonly heading: string;
  readonly rowHeaderColumnId: string;
  readonly rows: readonly DataRow[];
  readonly summary: string;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>{heading}</h2>
        <span>{rows.length} rekordy</span>
      </header>
      <ReadOnlyTable
        ariaLabel={ariaLabel}
        columns={columns}
        rowHeaderColumnId={rowHeaderColumnId}
        rows={rows}
        summary={summary}
      />
    </section>
  );
}

function OperationalStateGrid({
  items,
}: {
  readonly items: readonly {
    readonly condition: string;
    readonly detail: string;
    readonly id: string;
    readonly label: string;
    readonly status: string;
    readonly tone: StatusBadgeTone;
  }[];
}) {
  return (
    <div className="pd-domain-state-grid">
      {items.map((item) => (
        <article key={item.id}>
          <header className="pd-production-row">
            <strong>{item.label}</strong>
            <StatusBadge
              status="Stan"
              text={item.status}
              tone={item.tone}
            />
          </header>
          <p>{item.condition}</p>
          <p>{item.detail}</p>
        </article>
      ))}
    </div>
  );
}

function DataQualityMobileDatasets({
  data,
}: {
  readonly data: DataQualityWorkspaceData;
}) {
  return (
    <ul className="pd-domain-mobile-records" aria-label="Zbiory jakości danych na małym ekranie">
      {data.datasets.map((dataset) => (
        <li key={dataset.id}>
          <header>
            <strong>{dataset.name}</strong>
            <span>{dataset.owner}</span>
          </header>
          <dl>
            <div>
              <dt>Kompletność</dt>
              <dd>{percent(dataset.completeness)}</dd>
            </div>
            <div>
              <dt>Konflikty</dt>
              <dd>{dataset.conflicts}</dd>
            </div>
            <div>
              <dt>Odświeżono</dt>
              <dd>{dateTime(dataset.freshnessAt)}</dd>
            </div>
          </dl>
          <StatusBadge
            status="Stan"
            text={resolveReadinessLabel(dataset.readiness)}
            tone={readinessTone(dataset.readiness)}
          />
        </li>
      ))}
    </ul>
  );
}

function buildDataQualityContext(
  data: DataQualityWorkspaceData,
  definition: DataQualityScreenDefinition,
) {
  const staleDatasets = data.datasets.filter((dataset) => dataset.readiness === 'stale');
  const criticalDiagnostics = data.diagnostics.filter((diagnostic) => diagnostic.severity === 'critical');
  const topConflict = [...data.conflicts].sort((a, b) => (
    dataQualityImpactWeight(b.impact) - dataQualityImpactWeight(a.impact)
  ))[0] ?? null;
  const focusDataset = staleDatasets[0] ?? data.datasets.find((dataset) => dataset.conflicts > 0) ?? data.datasets[0];
  const lastSync = data.sources
    .map((source) => source.lastSyncAt)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? data.generatedAt;

  return {
    brief: topConflict
      ? `${topConflict.entityType}: ${topConflict.proposedResolution}`
      : 'Brak konfliktów blokujących decyzję biznesową.',
    criticalDiagnostics,
    data,
    decisions: [
      {
        detail: criticalDiagnostics[0]?.label ?? 'Najpierw potwierdzić świeżość zbiorów z największym wpływem.',
        due: 'dzisiaj 12:00',
        id: 'dq-decision-stale',
        metric: focusDataset ? `${focusDataset.conflicts} konfliktów` : '0 konfliktów',
        owner: focusDataset?.owner ?? 'Analityka',
        priority: criticalDiagnostics.length > 0 ? 'critical' : 'medium',
        status: 'partial',
        title: focusDataset ? `Zweryfikować ${focusDataset.name}` : 'Zweryfikować zbiory',
      },
      {
        detail: topConflict?.proposedResolution ?? 'Reguły nadrzędności mogą zasilać metryki bez ręcznej blokady.',
        due: 'dzisiaj 14:30',
        id: 'dq-decision-conflict',
        metric: `${data.conflicts.length} konflikty`,
        owner: 'Jakość danych',
        priority: topConflict?.impact === 'high' ? 'high' : 'medium',
        status: 'warning',
        title: 'Rozstrzygnąć reguły źródeł',
      },
      {
        detail: `${data.reviewItems.length} pozycje oczekują na decyzję człowieka przed dalszym przetwarzaniem.`,
        due: 'jutro 10:00',
        id: 'dq-decision-review',
        metric: `${data.reviewItems.length} pozycje`,
        owner: 'Operacje danych',
        priority: data.reviewItems.some((item) => item.status === 'blocked') ? 'high' : 'low',
        status: 'queued',
        title: 'Domknąć ręczny przegląd',
      },
    ] satisfies readonly OperationalDecisionItem[],
    focusDetail: focusDataset
      ? `${focusDataset.owner} · kompletność ${percent(focusDataset.completeness)} · ${number(focusDataset.records)} rekordów`
      : 'Brak zbioru o podwyższonym ryzyku.',
    focusMetric: focusDataset?.name ?? definition.displayTitle,
    lastSyncLabel: dateTime(lastSync),
    staleDatasets,
  };
}

function dataQualityImpactWeight(impact: DataQualityWorkspaceData['conflicts'][number]['impact']): number {
  switch (impact) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
    default:
      return 1;
  }
}

export function PapaDecisionWorkspace({
  data,
  definition,
}: {
  readonly data: PapaWorkspaceData;
  readonly definition: PapaScreenDefinition;
}) {
  const context = buildPapaContext(data, definition);

  return (
    <ProductionScreenCanvas
      className="pd-production-canvas--papa"
      label={`Ekran Papa: ${definition.displayTitle}`}
      screenId={definition.id}
      variant={definition.variant}
    >
      <PapaScreenHeader
        context={context}
        definition={definition}
      />

      <PapaHealthStrip
        items={[
          { hint: 'elementy w koszyku', label: 'Kontekst', value: number(data.summary.contextItems) },
          { hint: 'powiązane z odpowiedzią', label: 'Dowody', value: number(data.summary.evidenceCount) },
          { hint: 'średnia dla wniosku', label: 'Pewność', value: percent(data.summary.confidence) },
          { hint: 'czekają na człowieka', label: 'Decyzje', value: number(data.summary.decisionsDue) },
        ]}
      />

      <PapaCommandBrief
        context={context}
        definition={definition}
      />

      <PapaDecisionQueue items={context.decisions} />

      {renderPapaVariant(definition, data, context)}
    </ProductionScreenCanvas>
  );
}

function PapaScreenHeader({
  context,
  definition,
}: {
  readonly context: ReturnType<typeof buildPapaContext>;
  readonly definition: PapaScreenDefinition;
}) {
  return (
    <>
      <PageHeader
        actions={(
          <StatusBadge
            status="Tryb"
            text={context.requiresHuman ? 'Wymaga akceptacji' : 'Gotowe do odczytu'}
            tone={context.requiresHuman ? 'warning' : 'success'}
          />
        )}
        breadcrumbs={[
          { href: '/app', label: 'Aplikacja' },
          { href: '/app/papa/panel-kontekstowy-papa', label: 'Papa Asystent' },
          { href: null, label: definition.displayTitle },
        ]}
        className="pd-production-domain-header"
        meta={[
          { label: 'Kontekst', value: number(context.data.summary.contextItems) },
          { label: 'Dowody', value: number(context.data.summary.evidenceCount) },
          { label: 'Odświeżono', value: context.lastEvidenceLabel },
        ]}
        subtitle={definition.summary}
        title={definition.displayTitle}
      />
      <SectionNavigation
        activeId={definition.id}
        ariaLabel="Widoki Papa"
        className="pd-production-domain-nav"
        items={papaNavigationItems}
        orientation="horizontal"
        size="compact"
      />
    </>
  );
}

function PapaHealthStrip({
  items,
}: {
  readonly items: readonly {
    readonly hint: string;
    readonly label: string;
    readonly value: string;
  }[];
}) {
  return (
    <dl className="pd-domain-health-strip">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
          <dd className="pd-domain-health-strip__hint">{item.hint}</dd>
        </div>
      ))}
    </dl>
  );
}

function PapaCommandBrief({
  context,
  definition,
}: {
  readonly context: ReturnType<typeof buildPapaContext>;
  readonly definition: PapaScreenDefinition;
}) {
  return (
    <section className="pd-domain-command-brief" aria-label="Bezpieczna rekomendacja Papa">
      <header>
        <span>Papa</span>
        <h2>Co Papa może bezpiecznie zasugerować teraz</h2>
        <strong>{context.recommendation}</strong>
        <p>{definition.summary}</p>
      </header>
      <aside>
        <span>Ograniczenie</span>
        <strong>{context.guardrail}</strong>
        <p>{context.guardrailDetail}</p>
      </aside>
    </section>
  );
}

function PapaDecisionQueue({
  items,
}: {
  readonly items: readonly OperationalDecisionItem[];
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Kolejka decyzji Papa</h2>
        <span>{items.length} pozycje</span>
      </header>
      <ol className="pd-domain-decision-grid">
        {items.map((item) => (
          <li data-priority={item.priority} key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <dl>
              <div>
                <dt>Priorytet</dt>
                <dd>
                  <StatusBadge
                    status="Priorytet"
                    text={resolveOperationalPriorityLabel(item.priority)}
                    tone={resolveOperationalPriorityTone(item.priority)}
                  />
                </dd>
              </div>
              <div>
                <dt>Metryka</dt>
                <dd>{item.metric}</dd>
              </div>
              <div>
                <dt>Zespół</dt>
                <dd>{item.owner}</dd>
              </div>
              <div>
                <dt>Termin</dt>
                <dd>{item.due}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}

function renderPapaVariant(
  definition: PapaScreenDefinition,
  data: PapaWorkspaceData,
  context: ReturnType<typeof buildPapaContext>,
) {
  switch (definition.variant) {
    case 'assistant-shell':
      return (
        <>
          <PapaAssistantComposerBoard data={data} />
          <PapaContextBoard data={data} />
        </>
      );
    case 'work-modes':
      return <PapaModeBoard data={data} />;
    case 'context-basket':
      return (
        <>
          <PapaContextBoard data={data} />
          <PapaTableSection
            ariaLabel="Kontekst Papa"
            columns={papaContextColumns}
            heading="Koszyk kontekstu"
            rowHeaderColumnId="label"
            rows={papaContextRows(data.contextItems)}
            summary="Koszyk kontekstu, źródła i retencja używana przez Papa."
          />
        </>
      );
    case 'answer':
      return (
        <>
          <PapaAnswerBoard context={context} data={data} />
          <PapaEvidenceBoard data={data} />
        </>
      );
    case 'evidence':
      return (
        <>
          <PapaEvidenceBoard data={data} />
          <PapaTableSection
            ariaLabel="Dowody odpowiedzi Papa"
            columns={papaEvidenceColumns}
            heading="Ledger dowodów odpowiedzi"
            rowHeaderColumnId="claim"
            rows={papaEvidenceRows(data.evidence)}
            summary="Dowody, świeżość i pewność odpowiedzi Papa."
          />
        </>
      );
    case 'confidence':
      return <PapaConfidenceBoard data={data} />;
    case 'lab':
      return (
        <>
          <PapaLabBoard data={data} />
          <PapaActionBoard
            actions={data.actions}
            heading="Eksperymenty i szkice działań"
          />
        </>
      );
    case 'observations':
      return (
        <>
          <PapaObservationBoard data={data} />
          <PapaEvidenceBoard data={data} />
        </>
      );
    case 'recommendation-variants':
      return (
        <>
          <PapaRecommendationVariants data={data} />
          <PapaModeBoard data={data} />
        </>
      );
    case 'proposals':
      return (
        <>
          <PapaActionBoard
            actions={data.actions.filter((action) => action.status !== 'blocked')}
            heading="Propozycje AI do decyzji człowieka"
          />
          <PapaTableSection
            ariaLabel="Działania AI Papa"
            columns={papaActionColumns}
            heading="Rejestr propozycji AI"
            rowHeaderColumnId="label"
            rows={papaActionRows(data.actions.filter((action) => action.status !== 'blocked'))}
            summary="Działania AI z zespołem, ryzykiem i kontraktem operacji."
          />
        </>
      );
    case 'action-approval':
      return <PapaApprovalBoard data={data} />;
    case 'actions':
      return (
        <>
          <PapaActionBoard
            actions={data.actions}
            heading="Działania AI według ryzyka"
          />
          <PapaTableSection
            ariaLabel="Działania AI Papa"
            columns={papaActionColumns}
            heading="Rejestr działań AI"
            rowHeaderColumnId="label"
            rows={papaActionRows(data.actions)}
            summary="Działania AI z zespołem, ryzykiem i kontraktem operacji."
          />
        </>
      );
    case 'blocked-actions':
      return (
        <PapaActionBoard
          actions={data.actions.filter((action) => action.status === 'blocked')}
          heading="Zablokowane działania AI"
        />
      );
    case 'history-memory':
      return (
        <>
          <PapaMemoryBoard data={data} />
          <PapaTableSection
            ariaLabel="Historia i pamięć Papa"
            columns={papaMemoryColumns}
            heading="Historia i pamięć kontekstu"
            rowHeaderColumnId="event"
            rows={papaMemoryRows(data.memory)}
            summary="Zdarzenia pamięci Papa i polityka retencji."
          />
        </>
      );
    case 'governance':
      return (
        <>
          <PapaGovernanceBoard data={data} />
          <PapaModeBoard data={data} />
        </>
      );
    case 'variants':
      return (
        <section className="pd-production-section">
          <header>
            <h2>Stany produkcyjne Papa</h2>
            <span>{data.modeRecords.length} warianty</span>
          </header>
          <OperationalStateGrid
            items={data.modeRecords.map((item) => ({
              condition: item.allowedUse,
              detail: `Wymaga zgody: ${item.requiresApproval}. Blokada: ${item.blockedUse}.`,
              id: item.id,
              label: item.mode,
              status: item.requiresApproval === 'Tak' ? 'Do akceptacji' : 'Do odczytu',
              tone: item.requiresApproval === 'Tak' ? 'warning' : 'success',
            }))}
          />
        </section>
      );
    case 'context-panel':
    default:
      return (
        <>
          <PapaContextBoard data={data} />
          <PapaAnswerBoard context={context} data={data} />
        </>
      );
  }
}

function PapaContextBoard({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Koszyk kontekstu i ograniczenia odpowiedzi</h2>
        <span>{data.contextItems.length} elementy</span>
      </header>
      <div className="pd-papa-cockpit" aria-label="Kontekst Papa">
        <div className="pd-papa-cockpit__column">
          <h3>Kontekst</h3>
          {data.contextItems.map((item) => (
            <div className="pd-papa-decision__step" key={item.id}>
              <strong>{item.label}</strong>
              <span>{resolvePapaContextKind(item.kind)} · {item.source} · retencja {item.retention}</span>
              <ProgressIndicator
                description="Pewność dopasowania do pytania"
                indeterminate={false}
                label={`Pewność ${item.label}`}
                max={100}
                showValue
                tone={item.confidence < 0.82 ? 'warning' : 'success'}
                value={Math.round(item.confidence * 100)}
              />
            </div>
          ))}
        </div>
        <div className="pd-papa-cockpit__column">
          <h3>Źródła</h3>
          <dl className="pd-production-facts">
            {data.sources.map((source) => (
              <div key={`${source.provider}-${source.dataset}`}>
                <dt>{source.provider}</dt>
                <dd>{percent(source.completeness)} · {dateTime(source.lastSyncAt)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="pd-papa-cockpit__column">
          <h3>Ograniczenia</h3>
          <StatusList
            items={[
              { detail: 'Niepełne koszty kampanii obniżają pewność rekomendacji budżetowej.', id: 'cost-gap', status: 'warning', title: 'Koszty kampanii' },
              { detail: 'Eksport danych klientów pozostaje zablokowany bez osobnej zgody security.', id: 'pii-export', status: 'blocked', title: 'Dane osobowe' },
              { detail: 'Każde działanie wysokiego ryzyka wymaga zatwierdzenia człowieka.', id: 'approval', status: 'approval', title: 'Akceptacja' },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function PapaAssistantComposerBoard({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Powłoka asystenta z bezpiecznym kompozytorem</h2>
        <span>tryb odczytu</span>
      </header>
      <div className="pd-domain-card-grid">
        <article data-priority="medium">
          <h3>Pytanie operatora</h3>
          <p>Dlaczego marża rośnie mimo częściowego spadku konwersji i co wymaga decyzji człowieka?</p>
          <dl>
            <div>
              <dt>Kontekst</dt>
              <dd>{data.summary.contextItems} elementy</dd>
            </div>
            <div>
              <dt>Zasada</dt>
              <dd>brak automatycznej mutacji</dd>
            </div>
          </dl>
        </article>
        <article data-priority="high">
          <h3>Odpowiedź robocza</h3>
          <p>Papa może przygotować rekomendację, ale działania budżetowe trafiają do kolejki akceptacji z dowodami i ryzykiem.</p>
          <dl>
            <div>
              <dt>Pewność</dt>
              <dd>{percent(data.summary.confidence)}</dd>
            </div>
            <div>
              <dt>Decyzje</dt>
              <dd>{data.summary.decisionsDue}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}

function PapaAnswerBoard({
  context,
  data,
}: {
  readonly context: ReturnType<typeof buildPapaContext>;
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Odpowiedź Papa z dowodami i limitem pewności</h2>
        <span>{percent(data.summary.confidence)}</span>
      </header>
      <div className="pd-papa-answer">
        <p>{context.recommendation}</p>
        <ProgressIndicator
          description="Pewność liczona z dowodów, świeżości źródeł i braków danych."
          indeterminate={false}
          label="Poziom pewności odpowiedzi"
          max={100}
          showValue
          tone={data.summary.confidence < 0.9 ? 'warning' : 'success'}
          value={Math.round(data.summary.confidence * 100)}
        />
      </div>
    </section>
  );
}

function PapaEvidenceBoard({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Dowody wykorzystane w odpowiedzi</h2>
        <span>{data.evidence.length} dowody</span>
      </header>
      <div className="pd-domain-card-grid">
        {data.evidence.map((item) => (
          <article data-priority={item.confidence < 0.8 ? 'high' : 'medium'} key={item.id}>
            <header className="pd-production-row">
              <h3>{item.claim}</h3>
              <StatusBadge
                status="Pewność"
                text={percent(item.confidence)}
                tone={item.confidence < 0.8 ? 'warning' : 'success'}
              />
            </header>
            <dl>
              <div>
                <dt>Źródło</dt>
                <dd>{item.source}</dd>
              </div>
              <div>
                <dt>Świeżość</dt>
                <dd>{dateTime(item.freshnessAt)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function PapaConfidenceBoard({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Poziom pewności odpowiedzi</h2>
        <span>{percent(data.summary.confidence)}</span>
      </header>
      <div className="pd-domain-split">
        <article className="pd-domain-card">
          <h3>Co wzmacnia wynik</h3>
          <p>Dowody sprzedażowe i marżowe są świeże oraz spójne z kontekstem zamówień.</p>
        </article>
        <article className="pd-domain-card">
          <h3>Co ogranicza automatyzację</h3>
          <p>Koszty reklamowe są częściowe, więc Papa nie może samodzielnie zatwierdzić zmiany budżetu.</p>
        </article>
        <article className="pd-domain-card">
          <h3>Wymagana decyzja</h3>
          <p>Człowiek zatwierdza lub odrzuca rekomendację po sprawdzeniu dowodów.</p>
        </article>
      </div>
    </section>
  );
}

function PapaLabBoard({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Laboratorium AI bez wykonywania akcji</h2>
        <span>{data.actions.length} szkice</span>
      </header>
      <ProcessRail
        activeId="draft"
        items={[
          { detail: 'Operator wybiera koszyk kontekstu z jawnych źródeł.', id: 'context', label: 'Kontekst', status: 'ready' },
          { detail: 'Papa przygotowuje wariant odpowiedzi i zapisuje dowody.', id: 'answer', label: 'Odpowiedź', status: 'ready' },
          { detail: 'Działanie powstaje jako szkic bez mutacji systemowej.', id: 'draft', label: 'Szkic działania', status: 'partial' },
          { detail: 'Zatwierdzenie człowieka jest wymagane poza tym widokiem.', id: 'approval', label: 'Akceptacja', status: 'queued' },
        ]}
      />
    </section>
  );
}

function PapaObservationBoard({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Obserwacje powiązane z decyzjami</h2>
        <span>{data.decisions.length} decyzje</span>
      </header>
      <ul className="pd-domain-record-list">
        {data.decisions.map((decision) => (
          <li key={decision.id}>
            <div>
              <strong>{decision.title}</strong>
              <span>{decision.owner} · termin {dateTime(decision.dueAt)}</span>
            </div>
            <StatusBadge
              status="Status"
              text={resolveOperationalStatusText(decision.status)}
              tone={decision.status === 'approved' ? 'success' : decision.status === 'rejected' ? 'critical' : 'warning'}
            />
            <b>{resolveOperationalStatusText(decision.impact)}</b>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PapaRecommendationVariants({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Rekomendacje i warianty odpowiedzi</h2>
        <span>{data.modeRecords.length} tryby</span>
      </header>
      <div className="pd-domain-card-grid">
        {data.modeRecords.map((mode) => (
          <article data-priority={mode.requiresApproval === 'Tak' ? 'high' : 'low'} key={mode.id}>
            <h3>{mode.mode}</h3>
            <p>{mode.allowedUse}</p>
            <dl>
              <div>
                <dt>Wymaga zgody</dt>
                <dd>{mode.requiresApproval}</dd>
              </div>
              <div>
                <dt>Zablokowane</dt>
                <dd>{mode.blockedUse}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function PapaActionBoard({
  actions,
  heading,
}: {
  readonly actions: ReadonlyArray<PapaWorkspaceData['actions'][number]>;
  readonly heading: string;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>{heading}</h2>
        <span>{actions.length} działania</span>
      </header>
      <div className="pd-domain-card-grid">
        {actions.map((action) => (
          <article data-priority={action.risk === 'high' ? 'critical' : action.risk === 'medium' ? 'high' : 'low'} key={action.id}>
            <header className="pd-production-row">
              <h3>{action.label}</h3>
              <StatusBadge
                status="Status"
                text={resolveOperationalStatusText(action.status)}
                tone={action.status === 'blocked' ? 'critical' : action.status === 'approval' ? 'warning' : 'success'}
              />
            </header>
            <dl>
              <div>
                <dt>Zespół</dt>
                <dd>{action.owner}</dd>
              </div>
              <div>
                <dt>Ryzyko</dt>
                <dd>{resolveOperationalStatusText(action.risk)}</dd>
              </div>
              <div>
                <dt>Operacja</dt>
                <dd>{action.operationId ? 'osobny kontrakt' : 'zablokowana'}</dd>
              </div>
              <div>
                <dt>Warunek</dt>
                <dd>{action.status === 'blocked' ? 'wymaga decyzji security' : 'wymaga potwierdzenia człowieka'}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function PapaApprovalBoard({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  const approvalActions = data.actions.filter((action) => action.status === 'approval');

  return (
    <>
      <section className="pd-production-section">
        <header>
          <h2>Akceptacja działania AI</h2>
          <span>{approvalActions.length} do akceptacji</span>
        </header>
        <InlineNotice
          message="Ten ekran nie zatwierdza działania. Pokazuje ryzyko, dowody i wymagany kontrakt przed osobną mutacją."
          title="Akceptacja bez mutacji"
          tone="warning"
        />
      </section>
      <PapaActionBoard
        actions={approvalActions}
        heading="Działania oczekujące na akceptację"
      />
      <PapaEvidenceBoard data={data} />
    </>
  );
}

function PapaMemoryBoard({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Historia i pamięć kontekstu</h2>
        <span>{data.memory.length} zdarzenia</span>
      </header>
      <ul className="pd-domain-record-list">
        {data.memory.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.event}</strong>
              <span>{item.source} · retencja {item.retention}</span>
            </div>
            <span>{dateTime(item.timestamp)}</span>
            <b>{item.retention}</b>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PapaGovernanceBoard({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Nadzór AI i reguły użycia</h2>
        <span>{data.modeRecords.length} reguły</span>
      </header>
      <div className="pd-domain-split">
        <article className="pd-domain-card">
          <h3>Bez automatycznych mutacji</h3>
          <p>Wszystkie działania wysokiego ryzyka pozostają szkicem albo wymagają osobnej akceptacji.</p>
        </article>
        <article className="pd-domain-card">
          <h3>Dowody obowiązkowe</h3>
          <p>Odpowiedź musi wskazywać źródło, świeżość i poziom pewności przed rekomendacją.</p>
        </article>
        <article className="pd-domain-card">
          <h3>Prywatność</h3>
          <p>Eksport danych klientów do modelu jest zablokowany bez formalnej zgody security.</p>
        </article>
      </div>
    </section>
  );
}

function PapaModeBoard({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Tryby pracy Papa i granice użycia</h2>
        <span>{data.modeRecords.length} tryby</span>
      </header>
      <div className="pd-domain-card-grid">
        {data.modeRecords.map((mode) => (
          <article data-priority={mode.requiresApproval === 'Tak' ? 'high' : 'low'} key={mode.id}>
            <h3>{mode.mode}</h3>
            <p>{mode.allowedUse}</p>
            <dl>
              <div>
                <dt>Wymaga zgody</dt>
                <dd>{mode.requiresApproval}</dd>
              </div>
              <div>
                <dt>Zablokowane</dt>
                <dd>{mode.blockedUse}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function PapaTableSection({
  ariaLabel,
  columns,
  heading,
  rowHeaderColumnId,
  rows,
  summary,
}: {
  readonly ariaLabel: string;
  readonly columns: readonly DataColumn[];
  readonly heading: string;
  readonly rowHeaderColumnId: string;
  readonly rows: readonly DataRow[];
  readonly summary: string;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>{heading}</h2>
        <span>{rows.length} rekordy</span>
      </header>
      <ReadOnlyTable
        ariaLabel={ariaLabel}
        columns={columns}
        rowHeaderColumnId={rowHeaderColumnId}
        rows={rows}
        summary={summary}
      />
    </section>
  );
}

function buildPapaContext(
  data: PapaWorkspaceData,
  definition: PapaScreenDefinition,
) {
  const topDecision = [...data.decisions].sort((a, b) => papaImpactWeight(b.impact) - papaImpactWeight(a.impact))[0] ?? null;
  const blockedAction = data.actions.find((action) => action.status === 'blocked') ?? null;
  const lastEvidence = [...data.evidence]
    .map((item) => item.freshnessAt)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? data.generatedAt;
  const requiresHuman = data.actions.some((action) => action.status === 'approval' || action.status === 'blocked');

  return {
    data,
    decisions: [
      {
        detail: topDecision
          ? `${topDecision.owner} musi potwierdzić wpływ przed zmianą w systemie.`
          : 'Brak decyzji wymagającej akceptacji.',
        due: topDecision ? dateTime(topDecision.dueAt) : 'brak terminu',
        id: 'papa-decision-business',
        metric: topDecision ? resolveOperationalStatusText(topDecision.impact) : 'Niskie',
        owner: topDecision?.owner ?? 'Operacje',
        priority: topDecision?.impact === 'high' ? 'critical' : topDecision?.impact === 'medium' ? 'high' : 'low',
        status: topDecision?.status ?? 'ready',
        title: topDecision?.title ?? 'Brak pilnej decyzji',
      },
      {
        detail: `${data.summary.evidenceCount} dowody i ${data.summary.contextItems} elementy kontekstu ograniczają halucynacje i martwe akcje.`,
        due: 'ciągłe',
        id: 'papa-decision-evidence',
        metric: percent(data.summary.confidence),
        owner: 'Papa',
        priority: data.summary.confidence < 0.9 ? 'medium' : 'low',
        status: 'partial',
        title: 'Utrzymać odpowiedź w granicach dowodów',
      },
      {
        detail: blockedAction
          ? `${blockedAction.label} pozostaje zablokowane do decyzji security.`
          : 'Brak zablokowanych akcji w bieżącym wariancie.',
        due: blockedAction ? 'formalna zgoda' : 'nie dotyczy',
        id: 'papa-decision-security',
        metric: blockedAction ? 'Zablokowane' : 'Gotowe',
        owner: blockedAction?.owner ?? 'Bezpieczeństwo',
        priority: blockedAction ? 'high' : 'low',
        status: blockedAction ? 'blocked' : 'ready',
        title: 'Sprawdzić granice bezpieczeństwa',
      },
    ] satisfies readonly OperationalDecisionItem[],
    guardrail: blockedAction ? 'Akcja zablokowana' : 'Tylko rekomendacja',
    guardrailDetail: blockedAction
      ? `${blockedAction.label} nie ma zgody na wykonanie ani eksport danych.`
      : 'Papa może wyjaśnić, przygotować szkic i dodać decyzję do kolejki, ale nie wykonuje mutacji.',
    lastEvidenceLabel: dateTime(lastEvidence),
    recommendation: topDecision
      ? `${topDecision.title}: przygotować rekomendację z dowodami i przekazać do akceptacji zespołu ${topDecision.owner}.`
      : `${definition.displayTitle}: pokazać kontekst, dowody i ograniczenia bez wykonywania akcji.`,
    requiresHuman,
  };
}

function papaImpactWeight(impact: PapaWorkspaceData['decisions'][number]['impact']): number {
  switch (impact) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
    default:
      return 1;
  }
}

function resolvePapaContextKind(kind: PapaWorkspaceData['contextItems'][number]['kind']): string {
  switch (kind) {
    case 'decision':
      return 'Decyzja';
    case 'metric':
      return 'Metryka';
    case 'record':
      return 'Rekord';
    case 'segment':
    default:
      return 'Segment';
  }
}

export function SettingsAdminWorkspace({
  data,
  definition,
}: {
  readonly data: SettingsWorkspaceData;
  readonly definition: SettingsScreenDefinition;
}) {
  const context = buildSettingsContext(data, definition);

  return (
    <ProductionScreenCanvas
      className="pd-production-canvas--settings"
      label={`Ekran ustawień: ${definition.displayTitle}`}
      screenId={definition.id}
      variant={definition.variant}
    >
      <SettingsScreenHeader
        context={context}
        definition={definition}
      />

      <SettingsHealthStrip
        items={[
          { hint: 'aktywni w przestrzeni pracy', label: 'Członkowie', value: number(data.summary.activeMembers) },
          { hint: 'czekają na decyzję', label: 'Zaproszenia', value: number(data.summary.pendingInvites) },
          { hint: 'pokrycie kont', label: 'MFA', value: percent(data.summary.mfaCoverage) },
          { hint: 'zdarzenia wysokiego ryzyka', label: 'Ryzyka', value: number(data.summary.openRisks) },
        ]}
      />

      <SettingsCommandBrief
        context={context}
        definition={definition}
      />

      <SettingsDecisionQueue items={context.decisions} />

      {renderSettingsVariant(definition, data, context)}
    </ProductionScreenCanvas>
  );
}

function SettingsScreenHeader({
  context,
  definition,
}: {
  readonly context: ReturnType<typeof buildSettingsContext>;
  readonly definition: SettingsScreenDefinition;
}) {
  return (
    <>
      <PageHeader
        actions={(
          <StatusBadge
            status="Stan"
            text={context.hasRisk ? 'Wymaga przeglądu' : 'Gotowe'}
            tone={context.hasRisk ? 'warning' : 'success'}
          />
        )}
        breadcrumbs={[
          { href: '/app', label: 'Aplikacja' },
          { href: '/app/settings/organizacja', label: 'Ustawienia i bezpieczeństwo' },
          { href: null, label: definition.displayTitle },
        ]}
        className="pd-production-domain-header"
        meta={[
          { label: 'Członkowie', value: number(context.data.summary.activeMembers) },
          { label: 'Ryzyka', value: number(context.data.summary.openRisks) },
          { label: 'Odświeżono', value: context.lastAuditLabel },
        ]}
        subtitle={definition.summary}
        title={definition.displayTitle}
      />
      <SectionNavigation
        activeId={definition.id}
        ariaLabel="Widoki ustawień"
        className="pd-production-domain-nav"
        items={settingsNavigationItems}
        orientation="horizontal"
        size="compact"
      />
    </>
  );
}

function SettingsHealthStrip({
  items,
}: {
  readonly items: readonly {
    readonly hint: string;
    readonly label: string;
    readonly value: string;
  }[];
}) {
  return (
    <dl className="pd-domain-health-strip">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
          <dd className="pd-domain-health-strip__hint">{item.hint}</dd>
        </div>
      ))}
    </dl>
  );
}

function SettingsCommandBrief({
  context,
  definition,
}: {
  readonly context: ReturnType<typeof buildSettingsContext>;
  readonly definition: SettingsScreenDefinition;
}) {
  return (
    <section className="pd-domain-command-brief" aria-label="Priorytet ustawień i bezpieczeństwa">
      <header>
        <span>Administracja</span>
        <h2>Co trzeba sprawdzić w ustawieniach teraz</h2>
        <strong>{context.brief}</strong>
        <p>{definition.summary}</p>
      </header>
      <aside>
        <span>Największe ryzyko</span>
        <strong>{context.focusMetric}</strong>
        <p>{context.focusDetail}</p>
      </aside>
    </section>
  );
}

function SettingsDecisionQueue({
  items,
}: {
  readonly items: readonly OperationalDecisionItem[];
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Kolejka decyzji administracyjnych</h2>
        <span>{items.length} pozycje</span>
      </header>
      <ol className="pd-domain-decision-grid">
        {items.map((item) => (
          <li data-priority={item.priority} key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <dl>
              <div>
                <dt>Priorytet</dt>
                <dd>
                  <StatusBadge
                    status="Priorytet"
                    text={resolveOperationalPriorityLabel(item.priority)}
                    tone={resolveOperationalPriorityTone(item.priority)}
                  />
                </dd>
              </div>
              <div>
                <dt>Metryka</dt>
                <dd>{item.metric}</dd>
              </div>
              <div>
                <dt>Zespół</dt>
                <dd>{item.owner}</dd>
              </div>
              <div>
                <dt>Termin</dt>
                <dd>{item.due}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}

function renderSettingsVariant(
  definition: SettingsScreenDefinition,
  data: SettingsWorkspaceData,
  context: ReturnType<typeof buildSettingsContext>,
) {
  switch (definition.variant) {
    case 'workspace':
      return (
        <>
          <SettingsWorkspacePolicyBoard data={data} />
          <SettingsTableSection
            ariaLabel="Role i uprawnienia"
            columns={settingsRoleColumns}
            heading="Role domyślne i zakres przestrzeni pracy"
            rowHeaderColumnId="role"
            rows={settingsRoleRows(data.roles)}
            summary="Role, zakresy i dostęp wrażliwy."
          />
        </>
      );
    case 'memberships':
      return (
        <>
          <SettingsMembersBoard data={data} />
          <SettingsTableSection
            ariaLabel="Członkostwa przestrzeni pracy"
            columns={settingsMemberColumns}
            heading="Członkostwa i zaproszenia"
            rowHeaderColumnId="person"
            rows={settingsMemberRows(data.members)}
            summary="Członkowie, zaproszenia, MFA i ostatnia aktywność."
          />
        </>
      );
    case 'roles':
      return (
        <>
          <SettingsRolesBoard data={data} />
          <SettingsTableSection
            ariaLabel="Role i uprawnienia"
            columns={settingsRoleColumns}
            heading="Role i zakresy uprawnień"
            rowHeaderColumnId="role"
            rows={settingsRoleRows(data.roles)}
            summary="Role, zakresy i dostęp wrażliwy."
          />
        </>
      );
    case 'account-security':
      return (
        <>
          <SettingsSecurityBoard data={data} />
          <SettingsTableSection
            ariaLabel="Członkostwa przestrzeni pracy"
            columns={settingsMemberColumns}
            heading="Kontrola MFA członków"
            rowHeaderColumnId="person"
            rows={settingsMemberRows(data.members)}
            summary="Członkowie, MFA i ostatnia aktywność."
          />
        </>
      );
    case 'sessions':
      return (
        <>
          <SettingsSessionsBoard data={data} />
          <SettingsTableSection
            ariaLabel="Sesje użytkownika"
            columns={settingsSessionColumns}
            heading="Aktywne i historyczne sesje"
            rowHeaderColumnId="device"
            rows={settingsSessionRows(data.sessions)}
            summary="Aktywne i historyczne sesje użytkownika."
          />
        </>
      );
    case 'audit':
      return (
        <>
          <SettingsAuditBoard data={data} />
          <SettingsTableSection
            ariaLabel="Zdarzenia audytu"
            columns={settingsAuditColumns}
            heading="Zdarzenia audytu bezpieczeństwa"
            rowHeaderColumnId="event"
            rows={settingsAuditRows(data.audit)}
            summary="Zdarzenia audytu bez ujawniania sekretów."
          />
        </>
      );
    case 'privacy':
      return (
        <>
          <SettingsPrivacyBoard />
          <SettingsTableSection
            ariaLabel="Zdarzenia audytu"
            columns={settingsAuditColumns}
            heading="Prywatność i eksport danych"
            rowHeaderColumnId="event"
            rows={settingsAuditRows(data.audit)}
            summary="Zdarzenia audytu powiązane z eksportem, retencją i maskowaniem."
          />
        </>
      );
    case 'support-access':
      return (
        <>
          <SettingsSupportBoard data={data} />
          <SettingsTableSection
            ariaLabel="Dostęp wsparcia"
            columns={settingsSupportAccessColumns}
            heading="Zakres dostępu wsparcia"
            rowHeaderColumnId="scope"
            rows={settingsSupportAccessRows(data.supportAccess)}
            summary="Zakresy dostępu wsparcia i ślad audytowy."
          />
        </>
      );
    case 'settings-variants':
      return (
        <section className="pd-production-section">
          <header>
            <h2>Stany produkcyjne ustawień</h2>
            <span>{data.variants.length} warianty</span>
          </header>
          <OperationalStateGrid
            items={data.variants.map((item) => ({
              condition: item.condition,
              detail: `${item.composition}. ${item.constraint}.`,
              id: item.id,
              label: item.variant,
              status: item.variant,
              tone: item.variant === 'Brak dostępu' ? 'critical' : item.variant === 'Częściowe' || item.variant === 'Offline' ? 'warning' : 'success',
            }))}
          />
        </section>
      );
    case 'organization':
    default:
      return (
        <>
          <SettingsOrganizationBoard data={data} context={context} />
          <SettingsMembersBoard data={data} />
        </>
      );
  }
}

function SettingsOrganizationBoard({
  context,
  data,
}: {
  readonly context: ReturnType<typeof buildSettingsContext>;
  readonly data: SettingsWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Organizacja i odpowiedzialność administracyjna</h2>
        <span>{data.members.length} członkowie</span>
      </header>
      <div className="pd-settings-console" aria-label="Konsola ustawień i bezpieczeństwa">
        <nav className="pd-settings-console__column" aria-label="Zakres ustawień">
          {settingsNavigationItems.slice(0, 6).map((item) => (
            <div className="pd-settings-nav" key={item.id}>
              <strong>{item.label}</strong>
              <span>{item.id === context.definition.id ? 'aktywny widok' : 'dostępne w sekcji 60'}</span>
            </div>
          ))}
        </nav>
        <div className="pd-settings-console__column">
          <h3>Kontrola organizacji</h3>
          <p>Widok pokazuje odpowiedzialność, zakres dostępu i status bezpieczeństwa bez formularzy mutujących.</p>
          <KpiStrip
            items={[
              { hint: 'aktywni użytkownicy', label: 'Członkowie', value: String(data.summary.activeMembers) },
              { hint: 'czekają na akceptację', label: 'Zaproszenia', value: String(data.summary.pendingInvites) },
              { hint: 'pokrycie kont', label: 'MFA', value: percent(data.summary.mfaCoverage) },
              { hint: 'zdarzenia wysokiego ryzyka', label: 'Ryzyka', value: String(data.summary.openRisks) },
            ]}
          />
        </div>
        <aside className="pd-settings-console__column" aria-label="Kontrole bezpieczeństwa">
          <h3>Kontrole bezpieczeństwa</h3>
          <StatusList
            items={[
              { detail: 'Role wrażliwe wymagają śladu audytu i potwierdzenia właściciela organizacji.', id: 'roles', status: 'warning', title: 'Zakres ról' },
              { detail: `${percent(data.summary.mfaCoverage)} członków ma włączone MFA.`, id: 'mfa', status: data.summary.mfaCoverage >= 0.8 ? 'connected' : 'warning', title: 'MFA' },
              { detail: `${data.summary.openRisks} zdarzeń wysokiego ryzyka w bieżącym zakresie.`, id: 'audit', status: data.summary.openRisks > 0 ? 'high' : 'connected', title: 'Audyt' },
            ]}
          />
        </aside>
      </div>
    </section>
  );
}

function SettingsWorkspacePolicyBoard({
  data,
}: {
  readonly data: SettingsWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Polityka przestrzeni pracy i retencji</h2>
        <span>{data.roles.length} role</span>
      </header>
      <div className="pd-domain-split">
        <article className="pd-domain-card">
          <h3>Region danych</h3>
          <p>Europe/Warsaw, retencja raportowa 90 dni i bezpieczne ograniczenia eksportu.</p>
        </article>
        <article className="pd-domain-card">
          <h3>Role domyślne</h3>
          <p>Nowe zaproszenia startują od odczytu ograniczonego, a awans wymaga audytu.</p>
        </article>
        <article className="pd-domain-card">
          <h3>Zmiany administracyjne</h3>
          <p>Ten ekran pokazuje stan i skutki; mutacje wymagają osobnego potwierdzenia.</p>
        </article>
      </div>
    </section>
  );
}

function SettingsMembersBoard({
  data,
}: {
  readonly data: SettingsWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Członkowie, zaproszenia i MFA</h2>
        <span>{data.members.length} osoby</span>
      </header>
      <ul className="pd-domain-record-list">
        {data.members.map((member) => (
          <li key={member.id}>
            <div>
              <strong>{member.person}</strong>
              <span>{member.role} · ostatnio {dateTime(member.lastSeenAt)}</span>
            </div>
            <StatusBadge
              status="MFA"
              text={member.mfa ? 'Włączone' : 'Brak'}
              tone={member.mfa ? 'success' : 'warning'}
            />
            <b>{resolveOperationalStatusText(member.status)}</b>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SettingsRolesBoard({
  data,
}: {
  readonly data: SettingsWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Role i dostęp wrażliwy</h2>
        <span>{data.roles.length} role</span>
      </header>
      <div className="pd-domain-card-grid">
        {data.roles.map((role) => (
          <article data-priority={role.sensitiveAccess ? 'high' : 'low'} key={role.id}>
            <header className="pd-production-row">
              <h3>{role.role}</h3>
              <StatusBadge
                status="Dostęp"
                text={role.sensitiveAccess ? 'Wrażliwy' : 'Ograniczony'}
                tone={role.sensitiveAccess ? 'warning' : 'success'}
              />
            </header>
            <p>{role.scope}</p>
            <dl>
              <div>
                <dt>Członkowie</dt>
                <dd>{role.members}</dd>
              </div>
              <div>
                <dt>Warunek zmiany</dt>
                <dd>{role.sensitiveAccess ? 'audyt i potwierdzenie' : 'standardowa decyzja administratora'}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsSecurityBoard({
  data,
}: {
  readonly data: SettingsWorkspaceData;
}) {
  const missingMfa = data.members.filter((member) => !member.mfa);

  return (
    <section className="pd-production-section">
      <header>
        <h2>Bezpieczeństwo kont i brakujące MFA</h2>
        <span>{missingMfa.length} do domknięcia</span>
      </header>
      <div className="pd-domain-card-grid">
        {missingMfa.map((member) => (
          <article data-priority={member.status === 'active' ? 'high' : 'medium'} key={member.id}>
            <h3>{member.person}</h3>
            <p>{member.role} · ostatnia aktywność {dateTime(member.lastSeenAt)}</p>
            <dl>
              <div>
                <dt>MFA</dt>
                <dd>Brak</dd>
              </div>
              <div>
                <dt>Działanie</dt>
                <dd>wymusić konfigurację lub ograniczyć dostęp</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsSessionsBoard({
  data,
}: {
  readonly data: SettingsWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Sesje i urządzenia</h2>
        <span>{data.sessions.length} sesje</span>
      </header>
      <ul className="pd-domain-record-list">
        {data.sessions.map((session) => (
          <li key={session.id}>
            <div>
              <strong>{session.device}</strong>
              <span>{session.location} · ostatnio {dateTime(session.lastSeenAt)}</span>
            </div>
            <StatusBadge
              status="Status"
              text={resolveOperationalStatusText(session.status)}
              tone={session.status === 'expired' ? 'neutral' : 'success'}
            />
            <b>{session.location}</b>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SettingsAuditBoard({
  data,
}: {
  readonly data: SettingsWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Ślad audytu i ryzyko zdarzeń</h2>
        <span>{data.audit.length} zdarzenia</span>
      </header>
      <div className="pd-domain-card-grid">
        {data.audit.map((event) => (
          <article data-priority={event.risk === 'high' ? 'critical' : event.risk === 'medium' ? 'high' : 'low'} key={event.id}>
            <header className="pd-production-row">
              <h3>{event.event}</h3>
              <StatusBadge
                status="Ryzyko"
                text={resolveOperationalStatusText(event.risk)}
                tone={event.risk === 'high' ? 'critical' : event.risk === 'medium' ? 'warning' : 'success'}
              />
            </header>
            <dl>
              <div>
                <dt>Aktor</dt>
                <dd>{event.actor}</dd>
              </div>
              <div>
                <dt>Zasób</dt>
                <dd>{event.resource}</dd>
              </div>
              <div>
                <dt>Czas</dt>
                <dd>{dateTime(event.timestamp)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsPrivacyBoard() {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Prywatność, retencja i ograniczenia eksportu</h2>
        <span>3 kontrole</span>
      </header>
      <div className="pd-domain-split">
        <article className="pd-domain-card">
          <h3>Maskowanie danych</h3>
          <p>Dane osobowe nie są ujawniane w widokach administracyjnych bez osobnego uprawnienia.</p>
        </article>
        <article className="pd-domain-card">
          <h3>Retencja</h3>
          <p>Historia audytu i sesji ma jawny okres przechowywania oraz ślad dostępu.</p>
        </article>
        <article className="pd-domain-card">
          <h3>Eksport</h3>
          <p>Eksport wrażliwy pozostaje zablokowany do formalnego potwierdzenia.</p>
        </article>
      </div>
    </section>
  );
}

function SettingsSupportBoard({
  data,
}: {
  readonly data: SettingsWorkspaceData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>Dostęp wsparcia i okno czasowe</h2>
        <span>{data.supportAccess.length} zakresy</span>
      </header>
      <ul className="pd-domain-record-list">
        {data.supportAccess.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.scope}</strong>
              <span>{item.holder} · wygasa {dateTime(item.expiresAt)}</span>
            </div>
            <StatusBadge
              status="Status"
              text={resolveOperationalStatusText(item.status)}
              tone={item.status === 'disabled' ? 'neutral' : item.status === 'pending-review' ? 'warning' : 'success'}
            />
            <b>{item.auditTrail}</b>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SettingsTableSection({
  ariaLabel,
  columns,
  heading,
  rowHeaderColumnId,
  rows,
  summary,
}: {
  readonly ariaLabel: string;
  readonly columns: readonly DataColumn[];
  readonly heading: string;
  readonly rowHeaderColumnId: string;
  readonly rows: readonly DataRow[];
  readonly summary: string;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>{heading}</h2>
        <span>{rows.length} rekordy</span>
      </header>
      <ReadOnlyTable
        ariaLabel={ariaLabel}
        columns={columns}
        rowHeaderColumnId={rowHeaderColumnId}
        rows={rows}
        summary={summary}
      />
    </section>
  );
}

function buildSettingsContext(
  data: SettingsWorkspaceData,
  definition: SettingsScreenDefinition,
) {
  const riskyAudit = data.audit.find((event) => event.risk === 'high') ?? null;
  const missingMfa = data.members.filter((member) => !member.mfa);
  const sensitiveRoles = data.roles.filter((role) => role.sensitiveAccess);
  const pendingSupport = data.supportAccess.find((item) => item.status === 'pending-review') ?? null;
  const lastAudit = [...data.audit]
    .map((event) => event.timestamp)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? data.generatedAt;

  return {
    brief: riskyAudit
      ? `${riskyAudit.event}: sprawdzić aktora, zasób i zasadność dostępu.`
      : 'Brak zdarzeń wysokiego ryzyka w bieżącym zakresie.',
    data,
    decisions: [
      {
        detail: missingMfa.length > 0
          ? `${missingMfa.length} konta nie mają pełnego MFA albo są zaproszeniami bez domknięcia.`
          : 'Pokrycie MFA jest kompletne.',
        due: 'dzisiaj 13:00',
        id: 'settings-decision-mfa',
        metric: percent(data.summary.mfaCoverage),
        owner: 'Bezpieczeństwo',
        priority: missingMfa.some((member) => member.status === 'active') ? 'high' : 'medium',
        status: 'warning',
        title: 'Domknąć MFA członków',
      },
      {
        detail: `${sensitiveRoles.length} role mają dostęp wrażliwy i wymagają cyklicznego przeglądu.`,
        due: 'dzisiaj 15:00',
        id: 'settings-decision-roles',
        metric: `${sensitiveRoles.length} role`,
        owner: 'Administrator',
        priority: sensitiveRoles.length > 0 ? 'high' : 'low',
        status: 'partial',
        title: 'Zweryfikować role wrażliwe',
      },
      {
        detail: pendingSupport
          ? `${pendingSupport.scope} czeka na potwierdzenie właściciela organizacji.`
          : 'Dostęp wsparcia jest wyłączony albo ograniczony czasowo.',
        due: pendingSupport ? dateTime(pendingSupport.expiresAt) : 'brak',
        id: 'settings-decision-support',
        metric: pendingSupport ? 'Do przeglądu' : 'Gotowe',
        owner: pendingSupport?.holder ?? 'Właściciel organizacji',
        priority: pendingSupport ? 'medium' : 'low',
        status: pendingSupport ? 'queued' : 'ready',
        title: 'Sprawdzić dostęp wsparcia',
      },
    ] satisfies readonly OperationalDecisionItem[],
    definition,
    focusDetail: riskyAudit
      ? `${riskyAudit.actor} · ${riskyAudit.resource} · ${dateTime(riskyAudit.timestamp)}`
      : `${missingMfa.length} konta bez pełnego MFA.`,
    focusMetric: riskyAudit?.event ?? 'MFA członków',
    hasRisk: data.summary.openRisks > 0 || missingMfa.length > 0,
    lastAuditLabel: dateTime(lastAudit),
  };
}
