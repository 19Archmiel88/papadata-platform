import {
  ArrowRight,
  BadgeAlert,
  CheckCircle2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import {
  commandCenterCards,
  commandCenterSignals,
  type CommandCenterSignalIcon,
} from '../../fixtures/dashboard';
import '../../design-system/foundations/papadata-brand-surface.css';
import './dashboard-shell.css';

const commandCenterSignalIconByName: Record<
  CommandCenterSignalIcon,
  LucideIcon
> = {
  badgeAlert: BadgeAlert,
  checkCircle: CheckCircle2,
  sparkles: Sparkles,
};

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
            {commandCenterCards.map((card) => (
              <article className="pdd-card" key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <p>{card.description}</p>
              </article>
            ))}
          </div>

          <ul className="pdd-insight-list">
            {commandCenterSignals.map((signal) => {
              const SignalIcon = commandCenterSignalIconByName[signal.icon];

              return (
                <li key={signal.text}>
                  <SignalIcon aria-hidden="true" size={16} />
                  <span>{signal.text}</span>
                </li>
              );
            })}
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

export { CommandCenterFocus };
