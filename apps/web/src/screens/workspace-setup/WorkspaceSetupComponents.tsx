import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  LockKeyhole,
  RefreshCw,
} from 'lucide-react';

import {
  ActionArrow,
  AppHeader,
  Button,
  InlineNotice,
  PageHeader,
  StatusBadge,
  Surface,
} from '../../design-system';
import '../../design-system/foundations/papadata-brand-surface.css';
import './workspace-setup.css';

function WorkspaceSetupComponents() {
  return (
    <div
      className="pds-brand-surface pdw-shell"
      data-theme="dark"
      lang="pl"
    >
      <AppHeader />

      <main className="pdw-main">
        <header className="pdw-header">
          <PageHeader
            className="pdw-heading"
            eyebrow="Konfiguracja przestrzeni roboczej"
            text="Elementy tej ścieżki korzystają ze wspólnych statusów, komunikatów i akcji PapaData."
            title="Komponenty konfiguracji workspace"
          />
        </header>

        <Surface className="pdw-panel">
          <div className="pdw-panel-header">
            <h2>Stany kanoniczne</h2>
          </div>

          <div className="pdw-grid">
            <Surface className="pdw-card">
              <div className="pdw-card-header">
                <h3>Gotowy</h3>
                <CheckCircle2 aria-hidden="true" size={18} />
              </div>
              <StatusBadge status="ready" />
              <p>Wymaganie gotowe i możliwe do kontynuowania.</p>
            </Surface>

            <Surface className="pdw-card">
              <div className="pdw-card-header">
                <h3>Oczekujący</h3>
                <Clock3 aria-hidden="true" size={18} />
              </div>
              <StatusBadge status="pending" />
              <p>System, dostawca albo administrator posiada następny krok.</p>
            </Surface>

            <Surface className="pdw-card">
              <div className="pdw-card-header">
                <h3>Opóźniony</h3>
                <DatabaseZap aria-hidden="true" size={18} />
              </div>
              <StatusBadge status="delayed" />
              <p>Dane istnieją, ale wpływ na KPI musi być jawny.</p>
            </Surface>

            <Surface className="pdw-card">
              <div className="pdw-card-header">
                <h3>Zablokowany</h3>
                <LockKeyhole aria-hidden="true" size={18} />
              </div>
              <StatusBadge status="blocked" />
              <p>Brak bezpiecznej ścieżki bez pomocy administratora.</p>
            </Surface>
          </div>
        </Surface>

        <Surface className="pdw-panel">
          <div className="pdw-panel-header">
            <h2>Akcje i odzyskanie działania</h2>
          </div>

          <div className="pdw-actions">
            <Button
              className="pdw-button"
              iconBefore={<RefreshCw aria-hidden="true" size={16} />}
              variant="secondary"
            >
              Ponów ocenę
            </Button>
            <Button
              className="pdw-button"
              variant="secondary"
            >
              Poproś administratora
            </Button>
            <Button
              className="pdw-button"
              iconAfter={<ActionArrow />}
              variant="primary"
            >
              Kontynuuj
            </Button>
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

          <InlineNotice tone="warning">
            Jeżeli krok nie może zostać ukończony samodzielnie, widok pokazuje
            bezpieczną ścieżkę do administratora workspace.
          </InlineNotice>
        </Surface>
      </main>
    </div>
  );
}

export { WorkspaceSetupComponents };
