import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  FileCheck2,
  Gauge,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Store,
  Waypoints,
  type LucideIcon,
} from 'lucide-react';
import type { CSSProperties } from 'react';

import {
  ActionArrow,
  AppHeader,
  Button,
  InlineNotice,
  PageHeader,
  StatusBadge,
  Surface,
  type StatusBadgeStatus,
} from '../../design-system';
import {
  workspaceSurfaces,
  type WorkspaceSurface,
  type WorkspaceSurfaceIcon,
} from '../../fixtures/workspace';
import '../../design-system/foundations/papadata-brand-surface.css';
import './workspace-setup.css';

const surfaceIconByName: Record<WorkspaceSurfaceIcon, LucideIcon> = {
  building: Building2,
  databaseZap: DatabaseZap,
  fileCheck: FileCheck2,
  gauge: Gauge,
  lock: LockKeyhole,
  refresh: RefreshCw,
  store: Store,
  waypoints: Waypoints,
};

const workspaceStatusByCardStatus = {
  blocked: 'blocked',
  pending: 'pending',
  ready: 'ready',
} as const satisfies Record<
  'blocked' | 'pending' | 'ready',
  StatusBadgeStatus
>;

type WorkspaceSetupStoryProps = {
  surface: WorkspaceSurface;
  theme: 'light' | 'dark';
};

function WorkspaceSetupStory({
  surface,
  theme,
}: WorkspaceSetupStoryProps) {
  const definition = workspaceSurfaces[surface];
  const Icon = surfaceIconByName[definition.icon];

  return (
    <div
      className="pds-brand-surface pdw-shell"
      data-theme={theme}
      lang="pl"
      style={
        {
          '--pdw-accent': definition.accent,
        } as CSSProperties & Record<'--pdw-accent', string>
      }
    >
      <AppHeader />

      <main className="pdw-main">
        <header className="pdw-header">
          <PageHeader
            className="pdw-heading"
            eyebrow={definition.kicker}
            text={definition.summary}
            title={definition.title}
          />

          <StatusBadge
            className="pdw-status"
            label="krok aktywny"
            status="active"
          />
        </header>

        <section className="pdw-layout" aria-label={definition.kicker}>
          <Surface className="pdw-panel">
            <div className="pdw-panel-header">
              <div>
                <h2>Aktualny krok</h2>
                <span>{definition.kicker}</span>
              </div>
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            </div>

            <div className="pdw-grid">
              {definition.cards.map((card) => (
                <Surface className="pdw-card" key={card.title}>
                  <div className="pdw-card-header">
                    <h3>{card.title}</h3>
                    <StatusBadge
                      label={card.label}
                      status={workspaceStatusByCardStatus[card.status]}
                    />
                  </div>
                  <p>{card.description}</p>
                </Surface>
              ))}
            </div>

            {surface === 'dataSource' ? <DataSourceClientSummary /> : null}

            <div className="pdw-actions">
              <Button
                className="pdw-button"
                iconAfter={<ActionArrow />}
                variant="primary"
              >
                {definition.action}
              </Button>
              <Button
                className="pdw-button"
                variant="secondary"
              >
                Poproś administratora
              </Button>
            </div>
          </Surface>

          <Surface className="pdw-side-panel" aria-label={definition.sideTitle}>
            <div className="pdw-card-header">
              <h3>{definition.sideTitle}</h3>
              <ShieldCheck aria-hidden="true" size={18} />
            </div>
            <p>
              Użytkownik widzi wpływ na gotowość dashboardu i najbliższy
              bezpieczny krok bez szczegółów technicznych.
            </p>

            <ol className="pdw-requirements">
              <li>
                <CheckCircle2 aria-hidden="true" size={16} />
                <span>Jedno główne działanie i jasny wpływ biznesowy.</span>
              </li>
              <li>
                <Clock3 aria-hidden="true" size={16} />
                <span>Stany oczekiwania nie udają zakończonego postępu.</span>
              </li>
              <li>
                <AlertTriangle aria-hidden="true" size={16} />
                <span>Braki uprawnień nie ujawniają danych wrażliwych.</span>
              </li>
            </ol>
          </Surface>
        </section>
      </main>
    </div>
  );
}

function DataSourceClientSummary() {
  return (
    <div className="pdw-client-summary">
      <InlineNotice title="Wybrany dostawca" tone="info">
        Shopify z katalogu MVP. Połączymy zamówienia, produkty, klientów i
        stany produktów potrzebne do pierwszych KPI.
      </InlineNotice>

      <InlineNotice title="Odzyskanie po błędzie" tone="warning">
        Jeśli połączenie się nie powiedzie, użytkownik może ponowić próbę albo
        poprosić administratora workspace o wykonanie połączenia.
      </InlineNotice>
    </div>
  );
}

export { WorkspaceSetupStory };
