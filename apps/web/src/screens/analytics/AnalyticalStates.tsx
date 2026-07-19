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
import {
  StatusBadge,
  Surface,
} from '../../design-system';
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
          {analyticalStateCards.map((card, index) => (
            <Surface className="pdx-card" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.title}</strong>
              <StatusBadge
                status={
                  index === 0
                    ? 'ready'
                    : index === 1
                      ? 'warning'
                      : 'delayed'
                }
              />
              <p>{card.description}</p>
            </Surface>
          ))}
        </section>

        <section className="pdx-grid pdx-grid--two">
          <Surface className="pdx-panel">
            <div className="pdx-panel-header">
              <h2>Stany danych</h2>
              <StatusBadge status="warning" />
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
          </Surface>

          <Surface className="pdx-panel">
            <div className="pdx-panel-header">
              <h2>Jakość i świeżość</h2>
              <StatusBadge label="jakość danych" status="ready" />
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
          </Surface>
        </section>
      </main>
    </div>
  );
}

export { AnalyticalStates };
