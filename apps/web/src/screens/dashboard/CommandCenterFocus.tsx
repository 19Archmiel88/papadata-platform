import {
  BadgeAlert,
  CheckCircle2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import {
  ActionArrow,
  Button,
  StatusBadge,
  Surface,
} from '../../design-system';
import {
  commandCenterCards,
  commandCenterSignals,
  type CommandCenterSignalIcon,
} from '../../fixtures/dashboard';
import '../../design-system/foundations/papadata-brand-surface.css';
import { TargetScreenShell } from '../shared/TargetScreenShell';
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
    <TargetScreenShell
      className="pdd-shell pdd-shell--standalone"
      initialTheme="dark"
      mainClassName="pdd-main pdd-main--standalone"
    >
        <Surface className="pdd-panel">
          <div className="pdd-panel-header">
            <div>
              <h2>Centrum Dowodzenia</h2>
              <span>Najważniejszy wniosek, źródła i następne akcje</span>
            </div>
            <StatusBadge status="warning" />
          </div>

          <div className="pdd-kpi-grid">
            {commandCenterCards.map((card) => (
              <Surface className="pdd-card" key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <p>{card.description}</p>
              </Surface>
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

          <Button
            className="pdd-button"
            iconAfter={<ActionArrow />}
            variant="primary"
          >
            Otwórz analizę kampanii
          </Button>
        </Surface>
    </TargetScreenShell>
  );
}

export { CommandCenterFocus };
