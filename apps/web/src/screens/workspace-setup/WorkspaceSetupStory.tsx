import {
  AlertTriangle,
  ArrowRight,
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
        } as React.CSSProperties & Record<'--pdw-accent', string>
      }
    >
      <main className="pdw-main">
        <header className="pdw-header">
          <div className="pdw-heading">
            <span className="pdw-kicker">
              {definition.kicker}
            </span>
            <h1>{definition.title}</h1>
            <p>{definition.summary}</p>
          </div>

          <span className="pdw-status">
            <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
            PROPOSED
          </span>
        </header>

        <section className="pdw-layout" aria-label={definition.kicker}>
          <div className="pdw-panel">
            <div className="pdw-panel-header">
              <h2>Aktualna powierzchnia</h2>
              <span className="pdw-chip pdw-chip--ready">
                {definition.kicker}
              </span>
            </div>

            <div className="pdw-grid">
              {definition.cards.map((card) => (
                <article className="pdw-card" key={card.title}>
                  <div className="pdw-card-header">
                    <h3>{card.title}</h3>
                    <span className={`pdw-chip pdw-chip--${card.status}`}>
                      {card.label}
                    </span>
                  </div>
                  <p>{card.description}</p>
                </article>
              ))}
            </div>

            <div className="pdw-form-grid">
              <div className="pdw-field">
                <span>Capability</span>
                <strong>Sprawdzana po stronie runtime</strong>
              </div>
              <div className="pdw-field">
                <span>Źródło prawdy</span>
                <strong>Stan serwerowy, nie URL</strong>
              </div>
              <div className="pdw-field">
                <span>Recovery</span>
                <strong>Retry, prośba admina albo support</strong>
              </div>
              <div className="pdw-field">
                <span>Sekrety</span>
                <strong>Nigdy nieodtwarzane w formularzu</strong>
              </div>
            </div>

            <div className="pdw-actions">
              <button className="pdw-button" type="button">
                {definition.action}
                <ArrowRight aria-hidden="true" size={16} />
              </button>
              <button
                className="pdw-button pdw-button--secondary"
                type="button"
              >
                Poproś administratora
              </button>
            </div>
          </div>

          <aside className="pdw-side-panel" aria-label={definition.sideTitle}>
            <div className="pdw-card-header">
              <h3>{definition.sideTitle}</h3>
              <ShieldCheck aria-hidden="true" size={18} />
            </div>
            <p>
              Ten widok projektuje zadanie użytkownika bez
              implementowania runtime, routingu ani prawdziwego API.
            </p>

            <ol className="pdw-requirements">
              <li>
                <CheckCircle2 aria-hidden="true" size={16} />
                <span>Jedno główne działanie i jasny wpływ biznesowy.</span>
              </li>
              <li>
                <Clock3 aria-hidden="true" size={16} />
                <span>Stany waiting i delayed nie udają postępu.</span>
              </li>
              <li>
                <AlertTriangle aria-hidden="true" size={16} />
                <span>Braki uprawnień nie ujawniają danych wrażliwych.</span>
              </li>
            </ol>
          </aside>
        </section>
      </main>
    </div>
  );
}

export { WorkspaceSetupStory };
