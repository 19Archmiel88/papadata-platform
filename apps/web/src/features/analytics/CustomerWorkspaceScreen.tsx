import {
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  Download,
  FileClock,
  GitBranch,
  Info,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  PanelRightOpen,
  RefreshCw,
  ShieldCheck,
  TableProperties,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import '../../design-system/foundations/papadata-brand-surface.css';
import { asEvidenceReferenceId } from '../../domain-contracts';
import {
  PermissionBoundary,
  SessionContextProvider,
} from '../../shell';
import {
  EvidencePanel,
  WorkspaceContextBar,
} from '../../shared/patterns';
import { Button, Surface } from '../../shared/ui';
import {
  analyticsCapabilities,
  type AnalyticsReadinessStatus,
  type KpiProjection,
  type ModuleProjection,
} from './analyticsContracts';
import {
  analyticsStoryFixtures,
  type AnalyticsFixtureId,
  type AnalyticsStoryFixture,
} from './analyticsFixtures';

type CustomerWorkspaceScreenProps = {
  fixture?: AnalyticsStoryFixture;
  fixtureId?: AnalyticsFixtureId;
  theme?: 'light' | 'dark' | 'high-contrast';
};

const grid = {
  display: 'grid',
  gap: '1rem',
} as const;

const cluster = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.6rem',
} as const;

const muted = {
  color: 'var(--pds-color-text-muted, #8f98aa)',
  margin: 0,
} as const;

const pill = {
  border: '1px solid var(--pds-color-border, rgba(148, 163, 184, 0.28))',
  borderRadius: '999px',
  color: 'var(--pds-color-text-muted, #8f98aa)',
  fontSize: '0.8rem',
  padding: '0.22rem 0.5rem',
} as const;

const iconButton = {
  alignItems: 'center',
  border: '1px solid var(--pds-color-border, rgba(148, 163, 184, 0.3))',
  borderRadius: '8px',
  display: 'inline-flex',
  gap: '0.4rem',
  justifyContent: 'center',
  minHeight: '2.25rem',
  padding: '0.4rem 0.65rem',
} as const;

const navigationGroups = [
  {
    items: ['Command Center', 'Zadania dla mnie', 'Alerty i zmiany'],
    label: 'Start',
  },
  {
    items: [
      'Przegląd',
      'Sprzedaż D2C',
      'Marketplace',
      'Marketing i atrybucja',
      'Koszty i rentowność',
      'Biblioteka KPI',
    ],
    label: 'Wyniki',
  },
  {
    items: ['Obserwacje', 'Rekomendacje', 'Decyzje', 'Działania', 'Pomiar rezultatów'],
    label: 'Decyzje i działania',
  },
  {
    items: [
      'Przegląd jakości',
      'Datasety',
      'Problemy jakości',
      'Konflikty i duplikaty',
      'Lineage',
      'Source authority',
    ],
    label: 'Zaufanie do danych',
  },
  {
    items: ['Katalog źródeł', 'Połączenia', 'Synchronizacje', 'Historia i zdarzenia'],
    label: 'Integracje',
  },
  {
    items: ['Postęp', 'Zakres i cele', 'Kryteria sukcesu', 'Bramy i dowody', 'Ocena końcowa'],
    label: 'Pilotaż',
  },
  {
    items: ['Plan i zakres', 'Użycie i limity', 'Overage', 'Faktury', 'Metody płatności'],
    label: 'Użycie i plan',
  },
  {
    items: [
      'Organizacja',
      'Workspace',
      'Użytkownicy i role',
      'Bezpieczeństwo',
      'Dane, eksport i retencja',
      'AI',
      'Powiadomienia',
      'Audyt',
    ],
    label: 'Ustawienia',
  },
] as const;

function readinessLabel(readiness: AnalyticsReadinessStatus): string {
  const labels: Record<AnalyticsReadinessStatus, string> = {
    BLOCKED: 'Zablokowane',
    EMPTY: 'Brak danych',
    INVALID: 'Nieprawidłowe',
    PARTIAL: 'Częściowe',
    PROCESSING: 'Przetwarzanie',
    READY: 'Gotowe',
    RECALCULATION_REQUIRED: 'Wymaga przeliczenia',
    STALE: 'Nieświeże',
  };

  return labels[readiness];
}

function readinessTone(readiness: AnalyticsReadinessStatus): string {
  if (readiness === 'READY') {
    return 'rgba(34, 197, 94, 0.45)';
  }

  if (readiness === 'INVALID' || readiness === 'BLOCKED') {
    return 'rgba(248, 113, 113, 0.54)';
  }

  if (readiness === 'PARTIAL' || readiness === 'RECALCULATION_REQUIRED') {
    return 'rgba(251, 191, 36, 0.54)';
  }

  return 'rgba(96, 165, 250, 0.45)';
}

function formatMetric(kpi: KpiProjection): string {
  if (kpi.snapshot.value === null) {
    return 'nieopublikowane';
  }

  if (kpi.snapshot.unit === 'money') {
    return `${new Intl.NumberFormat('pl-PL', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(Number(kpi.snapshot.value))} ${kpi.snapshot.currency ?? ''}`;
  }

  return new Intl.NumberFormat('pl-PL').format(Number(kpi.snapshot.value));
}

function ShellNavigation({ module }: { module: ModuleProjection }) {
  return (
    <nav
      aria-label="Nawigacja Customer Workspace"
      style={{
        ...grid,
        alignSelf: 'start',
        borderRight: '1px solid var(--pds-color-border, rgba(148, 163, 184, 0.22))',
        maxHeight: 'calc(100vh - 2rem)',
        overflow: 'auto',
        paddingRight: '0.8rem',
      }}
    >
      <strong style={{ fontSize: '1.1rem' }}>PapaData</strong>
      {navigationGroups.map((group) => (
        <section key={group.label} style={{ ...grid, gap: '0.4rem' }}>
          <span style={{ ...muted, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            {group.label}
          </span>
          {group.items.map((item) => {
            const active =
              item === 'Command Center' ||
              item === module.title ||
              (item === 'Sprzedaż D2C' && module.moduleId === 'd2c') ||
              (item === 'Przegląd jakości' && module.moduleId === 'data_health');
            const gated =
              ['Rekomendacje', 'AI', 'Faktury', 'Metody płatności', 'Overage'].includes(item);

            return (
              <button
                aria-current={active ? 'page' : undefined}
                disabled={gated}
                key={item}
                style={{
                  ...iconButton,
                  background: active
                    ? 'rgba(94, 162, 255, 0.16)'
                    : 'transparent',
                  color: gated
                    ? 'var(--pds-color-text-muted, #8f98aa)'
                    : 'var(--pds-color-text, #f8fafc)',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
                type="button"
              >
                <span>{item}</span>
                {gated ? <LockKeyhole aria-hidden="true" size={14} /> : <ChevronRight aria-hidden="true" size={14} />}
              </button>
            );
          })}
        </section>
      ))}
    </nav>
  );
}

function MobileNavigation() {
  return (
    <nav
      aria-label="Nawigacja mobilna"
      style={{
        ...cluster,
        border: '1px solid var(--pds-color-border, rgba(148, 163, 184, 0.22))',
        borderRadius: '8px',
        justifyContent: 'space-between',
        padding: '0.35rem',
      }}
    >
      {['Start', 'Wyniki', 'Działania', 'Alerty', 'Więcej'].map((item) => (
        <button key={item} style={{ ...iconButton, flex: '1 1 5rem' }} type="button">
          {item}
        </button>
      ))}
    </nav>
  );
}

function KpiCard({
  kpi,
  onDrillDown,
  onTrust,
}: {
  kpi: KpiProjection;
  onDrillDown: (label: string) => void;
  onTrust: (label: string) => void;
}) {
  return (
    <Surface
      style={{
        ...grid,
        borderColor: readinessTone(kpi.snapshot.readiness),
        minHeight: '13rem',
        padding: '1rem',
      }}
    >
      <span style={cluster}>
        {kpi.snapshot.readiness === 'READY' ? (
          <CheckCircle2 aria-hidden="true" size={18} />
        ) : (
          <AlertTriangle aria-hidden="true" size={18} />
        )}
        <strong>{kpi.snapshot.metricCode}</strong>
      </span>
      <span style={{ fontSize: '1.65rem', fontWeight: 750 }}>
        {formatMetric(kpi)}
      </span>
      <p style={muted}>{kpi.snapshot.readinessReasons[0]?.businessImpact}</p>
      <div style={cluster}>
        <span style={pill}>{readinessLabel(kpi.snapshot.readiness)}</span>
        <span style={pill}>{kpi.snapshot.metricDefinitionVersion}</span>
        <span style={pill}>{kpi.snapshot.periodStart.slice(0, 10)} - {kpi.snapshot.periodEnd.slice(0, 10)}</span>
      </div>
      <div style={cluster}>
        <Button onClick={() => onTrust(kpi.snapshot.metricCode)} style={iconButton} type="button">
          <PanelRightOpen aria-hidden="true" size={16} />
          Trust
        </Button>
        <Button onClick={() => onDrillDown(kpi.snapshot.metricCode)} style={iconButton} type="button">
          <GitBranch aria-hidden="true" size={16} />
          Drill-down
        </Button>
      </div>
    </Surface>
  );
}

function AccessibleTrend({ kpi }: { kpi: KpiProjection }) {
  const values = kpi.trend
    .map((point) => (point.value === null ? 0 : Number(point.value)))
    .filter((value) => Number.isFinite(value));
  const max = Math.max(1, ...values);

  return (
    <div style={grid}>
      <div
        aria-label={`Trend ${kpi.snapshot.metricCode}`}
        role="img"
        style={{
          alignItems: 'end',
          display: 'grid',
          gap: '0.5rem',
          gridTemplateColumns: `repeat(${kpi.trend.length}, minmax(4rem, 1fr))`,
          minHeight: '8rem',
        }}
      >
        {kpi.trend.map((point) => {
          const value = point.value === null ? 0 : Number(point.value);
          const height = `${Math.max(8, (value / max) * 100)}%`;

          return (
            <div key={point.label} style={{ ...grid, alignItems: 'end', height: '8rem' }}>
              <span
                style={{
                  background: point.readiness === 'READY' ? '#69d381' : '#f3c75c',
                  borderRadius: '6px 6px 0 0',
                  minHeight: '0.5rem',
                  height,
                }}
              />
              <span style={{ ...muted, fontSize: '0.8rem' }}>{point.label}</span>
            </div>
          );
        })}
      </div>
      <table>
        <caption style={{ textAlign: 'left' }}>Alternatywa tabelaryczna trendu</caption>
        <thead>
          <tr>
            <th scope="col">Okres</th>
            <th scope="col">Wartość</th>
            <th scope="col">Readiness</th>
          </tr>
        </thead>
        <tbody>
          {kpi.trend.map((point) => (
            <tr key={point.label}>
              <td>{point.label}</td>
              <td>{point.value ?? 'brak publikacji'}</td>
              <td>{point.readiness}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersTable({ module }: { module: ModuleProjection }) {
  const table = module.tables[0];

  if (!table) {
    return (
      <p style={muted}>
        Ten moduł nie publikuje tabeli, bo wymagany dataset pozostaje gated.
      </p>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <caption style={{ textAlign: 'left' }}>
          Dane projekcji z pagination/sort stable w Query Service
        </caption>
        <thead>
          <tr>
            {table.columns.map((column) => (
              <th key={column.key} scope="col">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.id}>
              {table.columns.map((column) => (
                <td key={column.key}>{String(row.cells[column.key] ?? 'brak')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrustDrawerPanel({ fixture }: { fixture: AnalyticsStoryFixture }) {
  const trust = fixture.trustDrawer;

  return (
    <aside
      aria-labelledby="trust-drawer-title"
      style={{
        ...grid,
        alignSelf: 'start',
        borderLeft: '1px solid var(--pds-color-border, rgba(148, 163, 184, 0.22))',
        maxHeight: 'calc(100vh - 2rem)',
        overflow: 'auto',
        paddingLeft: '0.9rem',
      }}
    >
      <span style={cluster}>
        <ShieldCheck aria-hidden="true" size={18} />
        <strong id="trust-drawer-title">Trust Drawer</strong>
      </span>
      <Surface style={{ ...grid, padding: '1rem' }}>
        <strong>{trust.definition.name}</strong>
        <p style={muted}>{trust.definition.businessDescription}</p>
        <span style={pill}>Owner: {trust.definition.owner}</span>
        <span style={pill}>Formula: {trust.definition.formulaVersion}</span>
        <span style={pill}>Snapshot: {trust.snapshot.id}</span>
        <span style={pill}>Reconciliation: {trust.reconciliation.status}</span>
      </Surface>
      <Surface style={{ ...grid, padding: '1rem' }}>
        <strong>Lineage i source evidence</strong>
        <span style={pill}>Canonical: {fixture.drillDown.canonicalOrderIds.length}</span>
        <span style={pill}>Source records: {fixture.drillDown.sourceRecordIds.length}</span>
        <span style={pill}>Conflicts: {trust.conflicts.length}</span>
        <span style={pill}>Duplicates: {trust.duplicates.length}</span>
      </Surface>
      <p style={muted}>{trust.nextAction}</p>
    </aside>
  );
}

function ModuleSection({
  fixture,
  onActivity,
}: {
  fixture: AnalyticsStoryFixture;
  onActivity: (value: string) => void;
}) {
  const module = fixture.module;

  return (
    <section aria-labelledby="module-title" style={grid}>
      <Surface style={{ ...grid, padding: '1rem' }}>
        <span style={cluster}>
          <Boxes aria-hidden="true" size={18} />
          <strong id="module-title">{module.title}</strong>
          <span style={pill}>{module.status}</span>
          <span style={pill}>{readinessLabel(module.meta.readiness)}</span>
        </span>
        <p style={muted}>{module.description}</p>
        {module.status !== 'IMPLEMENTED' ? (
          <p role="status" style={{ margin: 0 }}>
            Moduł jest jawnie gated/blocked: {module.meta.limitations.join(' ')}
          </p>
        ) : null}
      </Surface>

      {module.kpis.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
          }}
        >
          {module.kpis.map((kpi) => (
            <KpiCard
              key={kpi.snapshot.id}
              kpi={kpi}
              onDrillDown={(label) => onActivity(`Drill-down otwarty: ${label}`)}
              onTrust={(label) => onActivity(`Trust Drawer otwarty: ${label}`)}
            />
          ))}
        </div>
      ) : null}

      {module.kpis[0] ? (
        <Surface style={{ ...grid, padding: '1rem' }}>
          <span style={cluster}>
            <LineChart aria-hidden="true" size={18} />
            <strong>Trend i evidence</strong>
          </span>
          <AccessibleTrend kpi={module.kpis[0]} />
        </Surface>
      ) : null}

      <Surface style={{ ...grid, padding: '1rem' }}>
        <span style={cluster}>
          <TableProperties aria-hidden="true" size={18} />
          <strong>Drill-down table</strong>
        </span>
        <OrdersTable module={module} />
      </Surface>
    </section>
  );
}

function CustomerWorkspaceContent({
  fixture,
  theme,
}: {
  fixture: AnalyticsStoryFixture;
  theme: CustomerWorkspaceScreenProps['theme'];
}) {
  const [activity, setActivity] = useState('Brak lokalnej akcji w tej sesji.');
  const evidence = useMemo(
    () =>
      fixture.commandCenter.meta.evidenceReferences.map((ref, index) => ({
        evidenceId: asEvidenceReferenceId(`ev_wave4_${fixture.fixtureId}_${index}`),
        label: ref,
        source: 'analytics.v1',
        tenantId: fixture.context.tenant.tenantId,
        workspaceId: fixture.context.activeWorkspace.workspaceId,
      })),
    [fixture],
  );
  const firstKpi = fixture.commandCenter.kpis[0];

  return (
    <div
      data-theme={theme === 'light' ? 'light' : 'dark'}
      style={{
        ...grid,
        margin: '0 auto',
        maxWidth: '1480px',
      }}
    >
      <MobileNavigation />
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'minmax(13rem, 0.22fr) minmax(0, 1fr) minmax(18rem, 0.28fr)',
        }}
      >
        <ShellNavigation module={fixture.module} />
        <main aria-labelledby="wave4-title" style={grid}>
          <WorkspaceContextBar context={fixture.context} />

          <Surface
            style={{
              ...grid,
              borderColor: readinessTone(fixture.commandCenter.meta.readiness),
              padding: '1.25rem',
            }}
          >
            <span style={{ color: 'var(--pds-color-accent, #5ea2ff)', fontWeight: 700 }}>
              Analytics Platform / Metrics / Customer Workspace
            </span>
            <h1 id="wave4-title" style={{ fontSize: '2rem', margin: 0 }}>
              {fixture.title}
            </h1>
            <p style={{ margin: 0 }}>
              {fixture.notes[0]}
            </p>
            <div style={cluster}>
              <span style={pill}>{readinessLabel(fixture.commandCenter.meta.readiness)}</span>
              <span style={pill}>{fixture.commandCenter.meta.currency}</span>
              <span style={pill}>{fixture.commandCenter.meta.timezone}</span>
              <span style={pill}>{fixture.commandCenter.meta.projectionVersion}</span>
            </div>
          </Surface>

          {fixture.state === 'permission' ? (
            <Surface style={{ ...grid, padding: '1rem' }}>
              <span style={cluster}>
                <LockKeyhole aria-hidden="true" size={18} />
                <strong>Brak dostępu</strong>
              </span>
              <p style={muted}>
                Query Service wymaga capability i entitlement dla aktywnego workspace.
              </p>
            </Surface>
          ) : null}

          <PermissionBoundary
            capability={analyticsCapabilities.viewCommandCenter}
            explanation="Brak capability analytics:command-center:view w aktywnym workspace."
          >
            <section aria-labelledby="command-center-title" style={grid}>
              <Surface style={{ ...grid, padding: '1rem' }}>
                <span style={cluster}>
                  <LayoutDashboard aria-hidden="true" size={18} />
                  <strong id="command-center-title">Command Center</strong>
                </span>
                <div
                  style={{
                    display: 'grid',
                    gap: '0.8rem',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
                  }}
                >
                  <span style={pill}>READY: {fixture.commandCenter.readinessSummary.ready}</span>
                  <span style={pill}>PARTIAL: {fixture.commandCenter.readinessSummary.partial}</span>
                  <span style={pill}>INVALID: {fixture.commandCenter.readinessSummary.invalid}</span>
                  <span style={pill}>BLOCKED: {fixture.commandCenter.readinessSummary.blocked}</span>
                </div>
                <p style={muted}>
                  Następne działanie: {fixture.commandCenter.nextBestAction.title}
                </p>
              </Surface>

              <div
                style={{
                  display: 'grid',
                  gap: '1rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
                }}
              >
                <Surface style={{ ...grid, padding: '1rem' }}>
                  <span style={cluster}>
                    <Bell aria-hidden="true" size={18} />
                    <strong>Alerty</strong>
                  </span>
                  {fixture.commandCenter.alerts.length === 0 ? (
                    <p style={muted}>Brak nowych alertów.</p>
                  ) : fixture.commandCenter.alerts.map((alert) => (
                    <button
                      key={alert.id}
                      onClick={() => setActivity(`Alert otwarty: ${alert.title}`)}
                      style={{ ...iconButton, justifyContent: 'flex-start' }}
                      type="button"
                    >
                      <AlertTriangle aria-hidden="true" size={16} />
                      {alert.title}
                    </button>
                  ))}
                </Surface>
                <Surface style={{ ...grid, padding: '1rem' }}>
                  <span style={cluster}>
                    <ClipboardList aria-hidden="true" size={18} />
                    <strong>Zadania</strong>
                  </span>
                  {fixture.commandCenter.tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setActivity(`Zadanie otwarte: ${task.title}`)}
                      style={{ ...iconButton, justifyContent: 'flex-start' }}
                      type="button"
                    >
                      <CheckCircle2 aria-hidden="true" size={16} />
                      {task.title}
                    </button>
                  ))}
                </Surface>
              </div>
            </section>
          </PermissionBoundary>

          <ModuleSection fixture={fixture} onActivity={setActivity} />

          <Surface style={{ ...grid, padding: '1rem' }}>
            <span style={cluster}>
              <Database aria-hidden="true" size={18} />
              <strong>KPI Detail</strong>
            </span>
            {firstKpi ? (
              <>
                <p style={muted}>{firstKpi.snapshot.readinessReasons[0]?.summary}</p>
                <div style={cluster}>
                  <Button onClick={() => setActivity(`Eksport gotowy: ${fixture.exportObject.id}`)} style={iconButton} type="button">
                    <Download aria-hidden="true" size={16} />
                    Export
                  </Button>
                  <Button onClick={() => setActivity('Recalculation request przyjęty lokalnie.')} style={iconButton} type="button">
                    <RefreshCw aria-hidden="true" size={16} />
                    Recalculate
                  </Button>
                </div>
              </>
            ) : (
              <p style={muted}>Brak opublikowanego KPI w tej projekcji.</p>
            )}
          </Surface>

          <Surface style={{ ...grid, padding: '1rem' }}>
            <span style={cluster}>
              <FileClock aria-hidden="true" size={18} />
              <strong aria-live="polite">Aktywność</strong>
            </span>
            <p style={{ margin: 0 }}>{activity}</p>
          </Surface>

          <EvidencePanel
            evidence={evidence}
          />
        </main>
        <TrustDrawerPanel fixture={fixture} />
      </div>
      <Surface style={{ ...grid, padding: '1rem' }}>
        <span style={cluster}>
          <Info aria-hidden="true" size={18} />
          <strong>Zakres gated/blocked</strong>
        </span>
        <p style={muted}>
          Products, Customers, Traffic, Paid Campaigns, Marketplace, Marketing Attribution
          i Profitability pozostają jawnie gated albo blocked, jeżeli brakuje
          zatwierdzonej definicji, adaptera, datasetu albo kosztu produktu.
        </p>
      </Surface>
      <div aria-hidden="true" style={{ display: 'none' }}>
        <BarChart3 />
        <Users />
      </div>
    </div>
  );
}

export function CustomerWorkspaceScreen({
  fixture,
  fixtureId = 'default',
  theme = 'dark',
}: CustomerWorkspaceScreenProps) {
  const selectedFixture = fixture ?? analyticsStoryFixtures[fixtureId];

  return (
    <SessionContextProvider initialContext={selectedFixture.context}>
      <div
        className="pds-brand-surface"
        style={{
          minHeight: '100vh',
          padding: '1rem',
        }}
      >
        <CustomerWorkspaceContent fixture={selectedFixture} theme={theme} />
      </div>
    </SessionContextProvider>
  );
}
