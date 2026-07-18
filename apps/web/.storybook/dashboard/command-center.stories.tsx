import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, BadgeAlert, CheckCircle2, Sparkles } from 'lucide-react';

import '../foundations/papadata-brand-surface.css';
import './dashboard-shell.css';

function CommandCenterFocus() {
  return (
    <div
      className="pds-brand-surface pdd-shell"
      data-theme="dark"
      lang="pl"
    >
      <main className="pdd-main">
        <section className="pdd-panel">
          <div className="pdd-panel-header">
            <div>
              <h2>Centrum Dowodzenia</h2>
              <span>Najważniejszy wniosek, źródła i następne akcje</span>
            </div>
            <span className="pdd-chip pdd-chip--partial">partial</span>
          </div>

          <div className="pdd-kpi-grid">
            <article className="pdd-card">
              <span>Wniosek</span>
              <strong>Marża rośnie wolniej niż przychód</strong>
              <p>Wpływ: kampanie płatne i rabaty w 2 kategoriach.</p>
            </article>
            <article className="pdd-card">
              <span>Źródła</span>
              <strong>3 aktywne</strong>
              <p>Orders ready, campaigns partial, traffic stale.</p>
            </article>
            <article className="pdd-card">
              <span>Akcja</span>
              <strong>Przejrzyj kampanie</strong>
              <p>Najbliższy krok bez automatycznego działania AI.</p>
            </article>
          </div>

          <ul className="pdd-insight-list">
            <li>
              <Sparkles aria-hidden="true" size={16} />
              <span>
                Rekomendacja AI pokazuje ograniczenia danych i cytacje.
              </span>
            </li>
            <li>
              <BadgeAlert aria-hidden="true" size={16} />
              <span>
                Alerty nie są ukryte w tooltipach i mają tekstowy wpływ.
              </span>
            </li>
            <li>
              <CheckCircle2 aria-hidden="true" size={16} />
              <span>
                Akcja wymaga świadomego kliknięcia użytkownika.
              </span>
            </li>
          </ul>

          <button className="pdd-button" type="button">
            Otwórz analizę kampanii
            <ArrowRight aria-hidden="true" size={16} />
          </button>
        </section>
      </main>
    </div>
  );
}

const meta = {
  title: 'PapaData/Dashboard/Centrum Dowodzenia',
  component: CommandCenterFocus,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CommandCenterFocus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PriorytetDecyzyjny: Story = {
  name: 'Priorytet decyzyjny',
};
