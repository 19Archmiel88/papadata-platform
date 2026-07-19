import {
  Bell,
  CalendarDays,
  Download,
  Search,
  type LucideIcon,
} from 'lucide-react';

import {
  dashboardComponentCards,
  dashboardComponentControls,
  type DashboardComponentControlIcon,
} from '../../fixtures/dashboard';
import '../../design-system/foundations/papadata-brand-surface.css';
import './dashboard-shell.css';

const componentControlIconByName: Record<
  DashboardComponentControlIcon,
  LucideIcon
> = {
  bell: Bell,
  calendarDays: CalendarDays,
  download: Download,
  search: Search,
};

function DashboardComponents() {
  return (
    <div
      className="pds-brand-surface pdd-shell"
      data-theme="dark"
      lang="pl"
    >
      <main className="pdd-main">
        <section className="pdd-panel">
          <div className="pdd-panel-header">
            <h2>Komponenty dashboardu</h2>
            <span>Toolbar, KPI, tabela i status danych</span>
          </div>

          <div className="pdd-controls">
            {dashboardComponentControls.map((control) => {
              const ControlIcon = componentControlIconByName[control.icon];

              return (
                <span className="pdd-control" key={control.label}>
                  <ControlIcon aria-hidden="true" size={15} />
                  {control.label}
                </span>
              );
            })}
          </div>

          <div className="pdd-kpi-grid">
            {dashboardComponentCards.map((card) => (
              <article className="pdd-card" key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export { DashboardComponents };
