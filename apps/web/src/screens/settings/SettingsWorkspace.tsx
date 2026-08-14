import type {
  DataColumn,
  DataRow,
} from '../../../../../contracts/component-shared';
import {
  Button,
  DataStatusBanner,
  DataTable,
  InlineNotice,
  MetricCard,
  PageHeader,
  SectionNavigation,
} from '../../design-system';
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
} from './settingsData';
import type {
  SettingsScreenDefinition,
  SettingsWorkspaceData,
} from './settingsData';
import './settings-workspace.css';

export type SettingsWorkspaceProps = {
  readonly data: SettingsWorkspaceData;
  readonly definition: SettingsScreenDefinition;
  readonly mode?: 'runtime' | 'storybook';
};

export function SettingsWorkspace({
  data,
  definition,
  mode = 'runtime',
}: SettingsWorkspaceProps) {
  return (
    <section
      aria-label={`Ustawienia: ${definition.displayTitle}`}
      className="pd-settings-workspace"
      data-mode={mode}
      data-operation-id={definition.operationId ?? 'storybook-policy'}
      data-screen-id={definition.id}
      data-settings-variant={definition.variant}
    >
      <PageHeader
        className="pd-settings-workspace__header"
        actions={(
          <Button size="small" variant="secondary">
            Odśwież ustawienia
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
        ariaLabel="Widoki: Ustawienia, zespół i bezpieczeństwo"
        className="pd-settings-workspace__navigation"
        items={getSettingsNavigation()}
        orientation="horizontal"
        size="compact"
      />

      <DataStatusBanner
        blockingIssues={[
          { id: 'settings-mfa-gap', label: 'Niepełne MFA członków', severity: 'warning' },
        ]}
        context={data.context}
        readiness={data.summary.readiness}
        sources={[...data.sources]}
      />

      <SettingsSummary data={data} />

      <SettingsContent
        data={data}
        definition={definition}
      />
    </section>
  );
}

function SettingsSummary({
  data,
}: {
  readonly data: SettingsWorkspaceData;
}) {
  return (
    <dl className="pd-settings-workspace__summary" aria-label="Podsumowanie ustawień">
      <div>
        <dt>Członkowie</dt>
        <dd>{data.summary.activeMembers}</dd>
      </div>
      <div>
        <dt>Zaproszenia</dt>
        <dd>{data.summary.pendingInvites}</dd>
      </div>
      <div>
        <dt>MFA</dt>
        <dd>{formatPercent(data.summary.mfaCoverage)}</dd>
      </div>
      <div>
        <dt>Ryzyka</dt>
        <dd>{data.summary.openRisks}</dd>
      </div>
    </dl>
  );
}

function SettingsContent({
  data,
  definition,
}: {
  readonly data: SettingsWorkspaceData;
  readonly definition: SettingsScreenDefinition;
}) {
  switch (definition.variant) {
    case 'workspace':
      return (
        <>
          <SettingsMetrics data={data} />
          <InlineNotice
            message="Zmiany regionu, retencji i domyślnych ról wymagają osobnej mutacji i potwierdzenia. Storybook pokazuje tylko stan odczytu."
            title="Przestrzeń pracy bez mutacji"
            tone="info"
          />
          <RoleTable rows={settingsRoleRows(data.roles)} />
        </>
      );
    case 'memberships':
      return <MemberTable rows={settingsMemberRows(data.members)} />;
    case 'roles':
      return <RoleTable rows={settingsRoleRows(data.roles)} />;
    case 'account-security':
      return (
        <>
          <SettingsMetrics data={data} />
          <MemberTable rows={settingsMemberRows(data.members)} />
        </>
      );
    case 'sessions':
      return <SessionTable rows={settingsSessionRows(data.sessions)} />;
    case 'audit':
      return <AuditTable rows={settingsAuditRows(data.audit)} />;
    case 'privacy':
      return (
        <>
          <InlineNotice
            message="Prywatność pokazuje retencję, maskowanie i ograniczenia eksportu. Żaden eksport danych osobowych nie jest wykonywany w Storybooku."
            title="Prywatność w trybie odczytu"
            tone="warning"
          />
          <AuditTable rows={settingsAuditRows(data.audit)} />
        </>
      );
    case 'support-access':
      return (
        <>
          <InlineNotice
            message="Dostęp wsparcia jest czasowy, audytowany i ograniczony uprawnieniami. Storybook nie wykonuje włączenia ani odwołania dostępu."
            title="Dostęp wsparcia wymaga zgody"
            tone="warning"
          />
          <SupportAccessTable rows={settingsSupportAccessRows(data.supportAccess)} />
          <AuditTable rows={settingsAuditRows(data.audit)} />
        </>
      );
    case 'settings-variants':
      return (
        <>
          <InlineNotice
            message="Ten widok jest dokumentem wariantów Storybooka: nie ma ścieżki aplikacyjnej, endpointu ani fikcyjnego kontraktu operacji."
            title="Warianty bez transportu runtime"
            tone="info"
          />
          <VariantTable rows={settingsVariantRows(data.variants)} />
        </>
      );
    case 'organization':
    default:
      return (
        <>
          <SettingsMetrics data={data} />
          <MemberTable rows={settingsMemberRows(data.members)} />
        </>
      );
  }
}

function SettingsMetrics({
  data,
}: {
  readonly data: SettingsWorkspaceData;
}) {
  return (
    <section className="pd-settings-workspace__section">
      <header>
        <h2>Stan bezpieczeństwa</h2>
        <p>Metryki kontrolne organizacji i przestrzeni pracy bez wykonywania zmian administracyjnych.</p>
      </header>
      <div className="pd-settings-workspace__metric-strip">
        <MetricCard
          label="Aktywni członkowie"
          metricId="settings-active-members"
          status="ready"
          statusLabel="Dane aktualne"
          unit="osoby"
          value={String(data.summary.activeMembers)}
        />
        <MetricCard
          label="Pokrycie MFA"
          metricId="settings-mfa-coverage"
          signal="warning"
          status="partial"
          statusLabel="Wymaga domknięcia"
          unit="%"
          value={String(Math.round(data.summary.mfaCoverage * 100))}
        />
        <MetricCard
          label="Ryzyka"
          metricId="settings-open-risks"
          status={data.summary.openRisks > 0 ? 'partial' : 'ready'}
          statusLabel={data.summary.openRisks > 0 ? 'Do przeglądu' : 'Czysto'}
          unit="zdarzenia"
          value={String(data.summary.openRisks)}
        />
      </div>
    </section>
  );
}

function MemberTable({ rows }: { readonly rows: readonly DataRow[] }) {
  return (
    <SettingsTable
      ariaLabel="Członkostwa przestrzeni pracy"
      columns={settingsMemberColumns}
      emptyTitle="Brak członków"
      heading="Członkostwa"
      rows={rows}
      summary="Członkowie, zaproszenia i status MFA."
    />
  );
}

function RoleTable({ rows }: { readonly rows: readonly DataRow[] }) {
  return (
    <SettingsTable
      ariaLabel="Role i uprawnienia"
      columns={settingsRoleColumns}
      emptyTitle="Brak ról"
      heading="Role i uprawnienia"
      rows={rows}
      summary="Zakresy dostępu i role z dostępem wrażliwym."
    />
  );
}

function SessionTable({ rows }: { readonly rows: readonly DataRow[] }) {
  return (
    <SettingsTable
      ariaLabel="Sesje użytkownika"
      columns={settingsSessionColumns}
      emptyTitle="Brak sesji"
      heading="Sesje"
      rows={rows}
      summary="Urządzenia, lokalizacje i ostatnia aktywność."
    />
  );
}

function AuditTable({ rows }: { readonly rows: readonly DataRow[] }) {
  return (
    <SettingsTable
      ariaLabel="Zdarzenia audytu"
      columns={settingsAuditColumns}
      emptyTitle="Brak zdarzeń"
      heading="Audyt"
      rows={rows}
    summary="Zdarzenia bezpieczeństwa bez sekretów i bez danych osobowych."
    />
  );
}

function SupportAccessTable({ rows }: { readonly rows: readonly DataRow[] }) {
  return (
    <SettingsTable
      ariaLabel="Dostęp wsparcia"
      columns={settingsSupportAccessColumns}
      emptyTitle="Brak dostępu wsparcia"
      heading="Dostęp wsparcia"
      rows={rows}
      summary="Zakres, właściciel, wygaśnięcie i ślad audytowy dostępu wsparcia."
    />
  );
}

function VariantTable({ rows }: { readonly rows: readonly DataRow[] }) {
  return (
    <SettingsTable
      ariaLabel="Warianty ustawień"
      columns={settingsVariantColumns}
      emptyTitle="Brak wariantów"
      heading="Warianty ustawień"
      rows={rows}
      summary="Macierz stanów, kompozycji i ograniczeń dla powierzchni ustawień."
    />
  );
}

function SettingsTable({
  ariaLabel,
  columns,
  emptyTitle,
  heading,
  rows,
  summary,
}: {
  readonly ariaLabel: string;
  readonly columns: readonly DataColumn[];
  readonly emptyTitle: string;
  readonly heading: string;
  readonly rows: readonly DataRow[];
  readonly summary: string;
}) {
  return (
    <section className="pd-settings-workspace__section">
      <header>
        <h2>{heading}</h2>
        <p>{summary}</p>
      </header>
      <DataTable
        ariaLabel={ariaLabel}
        columns={columns}
        emptyMessage="Brak danych dla bieżącej przestrzeni pracy."
        emptyTitle={emptyTitle}
        loading={false}
        minWidth={860}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={`${rows.length} rekordy`}
      />
    </section>
  );
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 0,
    style: 'percent',
  }).format(value);
}
