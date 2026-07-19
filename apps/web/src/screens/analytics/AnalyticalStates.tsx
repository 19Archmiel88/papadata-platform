import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  LockKeyhole,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';

import {
  analyticalQualityItems,
  analyticalStateCards,
  analyticalStateItems,
  type AnalyticalListIcon,
} from '../../fixtures/analytics';
import '../../design-system/foundations/papadata-brand-surface.css';
import './analytical-elements.css';

const analyticalListIconByName: Record<AnalyticalListIcon, LucideIcon> = {
  alertTriangle: AlertTriangle,
  checkCircle: CheckCircle2,
  clock: Clock3,
  databaseZap: DatabaseZap,
  lock: LockKeyhole,
  refresh: RefreshCw,
};

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
          {analyticalStateCards.map((card) => (
            <article className="pdx-card" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.title}</strong>
              <p>{card.description}</p>
            </article>
          ))}
        </section>

        <section className="pdx-grid pdx-grid--two">
          <article className="pdx-panel">
            <div className="pdx-panel-header">
              <h2>Stany danych</h2>
              <span className="pdx-chip pdx-chip--partial">partial</span>
            </div>

            <ul className="pdx-state-list">
              {analyticalStateItems.map((item) => {
                const ItemIcon = analyticalListIconByName[item.icon];

                return (
                  <li key={item.text}>
                    <ItemIcon aria-hidden="true" size={16} />
                    <span>{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="pdx-panel">
            <div className="pdx-panel-header">
              <h2>Jakość i świeżość</h2>
              <span className="pdx-chip pdx-chip--ready">quality</span>
            </div>

            <ul className="pdx-quality-list">
              {analyticalQualityItems.map((item) => {
                const ItemIcon = analyticalListIconByName[item.icon];

                return (
                  <li key={item.text}>
                    <ItemIcon aria-hidden="true" size={16} />
                    <span>{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}

export { AnalyticalStates };
