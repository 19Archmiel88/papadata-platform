import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  LockKeyhole,
  RefreshCw,
} from 'lucide-react';

import '../../design-system/foundations/papadata-brand-surface.css';
import './workspace-setup.css';

function WorkspaceSetupComponents() {
  return (
    <div
      className="pds-brand-surface pdw-shell"
      data-theme="dark"
      lang="pl"
    >
      <main className="pdw-main">
        <header className="pdw-header">
          <div className="pdw-heading">
            <span className="pdw-kicker">
              Katalog projektowy
            </span>
            <h1>Komponenty konfiguracji workspace</h1>
            <p>
              Tymczasowy zestaw elementów do oceny stanów bez
              tworzenia produkcyjnego design systemu.
            </p>
          </div>
        </header>

        <section className="pdw-panel">
          <div className="pdw-panel-header">
            <h2>Stany kanoniczne</h2>
          </div>

          <div className="pdw-grid">
            <article className="pdw-card">
              <div className="pdw-card-header">
                <h3>ready</h3>
                <CheckCircle2 aria-hidden="true" size={18} />
              </div>
              <p>Wymaganie gotowe i możliwe do kontynuowania.</p>
            </article>

            <article className="pdw-card">
              <div className="pdw-card-header">
                <h3>waiting</h3>
                <Clock3 aria-hidden="true" size={18} />
              </div>
              <p>System, provider albo administrator posiada następny krok.</p>
            </article>

            <article className="pdw-card">
              <div className="pdw-card-header">
                <h3>stale / partial</h3>
                <DatabaseZap aria-hidden="true" size={18} />
              </div>
              <p>Dane istnieją, ale wpływ na KPI musi być jawny.</p>
            </article>

            <article className="pdw-card">
              <div className="pdw-card-header">
                <h3>blocked</h3>
                <LockKeyhole aria-hidden="true" size={18} />
              </div>
              <p>Brak bezpiecznej ścieżki bez recovery albo supportu.</p>
            </article>
          </div>
        </section>

        <section className="pdw-panel">
          <div className="pdw-panel-header">
            <h2>Akcje i recovery</h2>
          </div>

          <div className="pdw-actions">
            <button className="pdw-button" type="button">
              Ponów ocenę
              <RefreshCw aria-hidden="true" size={16} />
            </button>
            <button
              className="pdw-button pdw-button--secondary"
              type="button"
            >
              Poproś administratora
            </button>
            <button
              className="pdw-button pdw-button--secondary"
              type="button"
            >
              Otwórz diagnostykę
            </button>
          </div>

          <ul className="pdw-requirements">
            <li>
              <AlertTriangle aria-hidden="true" size={16} />
              <span>
                Widok nie pokazuje pól sekretów użytkownikowi bez
                capability.
              </span>
            </li>
            <li>
              <CheckCircle2 aria-hidden="true" size={16} />
              <span>
                Każda akcja opisuje wpływ i najbliższy bezpieczny krok.
              </span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export { WorkspaceSetupComponents };
