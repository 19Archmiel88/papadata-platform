import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  LockKeyhole,
  RefreshCw,
} from 'lucide-react';

import '../foundations/papadata-brand-surface.css';
import './analytical-elements.css';

function AnalyticalStates() {
  return (
    <div
      className="pds-brand-surface pdx-shell"
      data-theme="dark"
      lang="pl"
    >
      <main className="pdx-main">
        <header className="pdx-header">
          <span>Elementy analityczne</span>
          <h1>Stany danych oraz jakość i świeżość</h1>
          <p>
            Każdy stan pokazuje wpływ biznesowy i następny krok, nie
            tylko kolor albo ikonę.
          </p>
        </header>

        <section className="pdx-grid">
          <article className="pdx-card">
            <span>ready</span>
            <strong>Gotowe</strong>
            <p>Zakres danych spełnia warunki KPI.</p>
          </article>
          <article className="pdx-card">
            <span>partial</span>
            <strong>Częściowe</strong>
            <p>Widoczny jest wpływ brakujących źródeł.</p>
          </article>
          <article className="pdx-card">
            <span>stale</span>
            <strong>Nieświeże</strong>
            <p>Ostatnia synchronizacja przekroczyła próg.</p>
          </article>
        </section>

        <section className="pdx-grid pdx-grid--two">
          <article className="pdx-panel">
            <div className="pdx-panel-header">
              <h2>Stany danych</h2>
              <span className="pdx-chip pdx-chip--partial">partial</span>
            </div>

            <ul className="pdx-state-list">
              <li>
                <CheckCircle2 aria-hidden="true" size={16} />
                <span>ready: dane kompletne i aktualne dla zakresu.</span>
              </li>
              <li>
                <DatabaseZap aria-hidden="true" size={16} />
                <span>syncing: trwa realne pobieranie albo przetwarzanie.</span>
              </li>
              <li>
                <Clock3 aria-hidden="true" size={16} />
                <span>waiting: następny krok ma provider albo administrator.</span>
              </li>
              <li>
                <LockKeyhole aria-hidden="true" size={16} />
                <span>permissionDenied: brak capability bez ujawniania danych.</span>
              </li>
            </ul>
          </article>

          <article className="pdx-panel">
            <div className="pdx-panel-header">
              <h2>Jakość i świeżość</h2>
              <span className="pdx-chip pdx-chip--ready">quality</span>
            </div>

            <ul className="pdx-quality-list">
              <li>
                <AlertTriangle aria-hidden="true" size={16} />
                <span>
                  Każda metryka wskazuje brakujące źródło i wpływ na
                  decyzję.
                </span>
              </li>
              <li>
                <RefreshCw aria-hidden="true" size={16} />
                <span>
                  Retry odróżnia ponowną ocenę gotowości od synchronizacji.
                </span>
              </li>
              <li>
                <CheckCircle2 aria-hidden="true" size={16} />
                <span>
                  Dane przykładowe nie udają danych klienta.
                </span>
              </li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}

const meta = {
  title: 'PapaData/Elementy analityczne/Stany danych',
  component: AnalyticalStates,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AnalyticalStates>;

export default meta;

type Story = StoryObj<typeof meta>;

export const JakoscISwiezosc: Story = {
  name: 'Jakość i świeżość danych',
};
