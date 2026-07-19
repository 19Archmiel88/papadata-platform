import {
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  HelpCircle,
  Home,
  LineChart,
  Megaphone,
  PackageSearch,
  PlugZap,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { PapaDataBrand } from '../../design-system/brand/PapaDataBrand';
import {
  dashboardChartBars,
  dashboardDecisionInsights,
  dashboardDefinitions,
  dashboardNavigationItems,
  dashboardSignalRows,
  dashboardTopbarControls,
  dashboardWorkspaceContext,
  type DashboardInsightIcon,
  type DashboardModule,
  type DashboardNavigationIcon,
  type DashboardTopbarIcon,
} from '../../fixtures/dashboard';
import '../../design-system/foundations/papadata-brand-surface.css';
import './dashboard-shell.css';

const navigationIconByName: Record<DashboardNavigationIcon, LucideIcon> = {
  home: Home,
  lineChart: LineChart,
  megaphone: Megaphone,
  packageSearch: PackageSearch,
  plugZap: PlugZap,
  settings: Settings,
  shoppingCart: ShoppingCart,
  users: Users,
};

const topbarIconByName: Record<DashboardTopbarIcon, LucideIcon> = {
  bell: Bell,
  calendarDays: CalendarDays,
  search: Search,
};

const insightIconByName: Record<DashboardInsightIcon, LucideIcon> = {
  checkCircle: CheckCircle2,
  circleDollar: CircleDollarSign,
  helpCircle: HelpCircle,
};

type DashboardStoryProps = {
  module: DashboardModule;
  theme: 'light' | 'dark';
};

function DashboardStory({ module, theme }: DashboardStoryProps) {
  const definition = dashboardDefinitions[module];

  return (
    <div
      className="pds-brand-surface pdd-shell"
      data-theme={theme}
      lang="pl"
    >
      <div className="pdd-app">
        <aside className="pdd-sidebar" aria-label="Nawigacja dashboardu">
          <PapaDataBrand className="pdd-brand" />

          <nav className="pdd-nav">
            {dashboardNavigationItems.map((item) => {
              const Icon = navigationIconByName[item.icon];
              return (
                <button
                  className={item.key === module ? 'is-active' : undefined}
                  key={item.key}
                  type="button"
                >
                  <Icon aria-hidden="true" size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="pdd-sidebar-footer">
            <strong>{dashboardWorkspaceContext.workspaceName}</strong>
            <span>
              {dashboardWorkspaceContext.timezone} · {dashboardWorkspaceContext.dataLabel}
            </span>
          </div>
        </aside>

        <section className="pdd-content">
          <header className="pdd-topbar">
            <div>
              <h1>{definition.headline}</h1>
              <p>{definition.summary}</p>
            </div>

            <div className="pdd-controls">
              {dashboardTopbarControls.map((control) => {
                const ControlIcon = topbarIconByName[control.icon];

                return (
                  <span className="pdd-control" key={control.label}>
                    <ControlIcon aria-hidden="true" size={15} />
                    {control.label}
                  </span>
                );
              })}
            </div>
          </header>

          <main className="pdd-main">
            <section className="pdd-summary">
              <article className="pdd-panel">
                <div className="pdd-panel-header">
                  <div>
                    <h2>{definition.module}</h2>
                    <span>Zakres, świeżość i dostępność danych</span>
                  </div>
                  <span className={`pdd-chip pdd-chip--${definition.status}`}>
                    {definition.status}
                  </span>
                </div>

                <div className="pdd-kpi-grid">
                  <div className="pdd-card">
                    <span>Wynik</span>
                    <strong>{definition.metricA}</strong>
                    <p>Porównanie do poprzedniego okresu.</p>
                  </div>
                  <div className="pdd-card">
                    <span>Świeżość</span>
                    <strong>{definition.metricB}</strong>
                    <p>Jawny wpływ na decyzje i KPI.</p>
                  </div>
                  <div className="pdd-card">
                    <span>Zakres</span>
                    <strong>{definition.metricC}</strong>
                    <p>Moduły, źródła albo alerty wymagające uwagi.</p>
                  </div>
                </div>

                <div className="pdd-chart" aria-hidden="true">
                  {dashboardChartBars.map((value) => (
                    <span
                      className="pdd-bar"
                      key={value}
                      style={{ height: `${value}%` }}
                    />
                  ))}
                </div>
              </article>

              <aside className="pdd-panel">
                <div className="pdd-panel-header">
                  <h2>Najbliższe decyzje</h2>
                  <Sparkles aria-hidden="true" size={17} />
                </div>

                <ul className="pdd-insight-list">
                  {dashboardDecisionInsights.map((insight) => {
                    const InsightIcon = insightIconByName[insight.icon];

                    return (
                      <li key={insight.text}>
                        <InsightIcon aria-hidden="true" size={16} />
                        <span>{insight.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </aside>
            </section>

            <table className="pdd-table">
              <thead>
                <tr>
                  <th>Sygnał</th>
                  <th>Źródło</th>
                  <th>Stan</th>
                  <th>Wpływ</th>
                </tr>
              </thead>
              <tbody>
                {dashboardSignalRows.map((row) => (
                  <tr key={row.signal}>
                    <td>{row.signal}</td>
                    <td>{row.source}</td>
                    <td>{row.state}</td>
                    <td>{row.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </main>
        </section>
      </div>
    </div>
  );
}

export { DashboardStory };
