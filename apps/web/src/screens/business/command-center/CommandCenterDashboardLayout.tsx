import type {
  ReactNode,
} from 'react';

import './command-center-dashboard-layout.css';

export type CommandCenterDashboardLayoutProps = {
  readonly actions: ReactNode;
  readonly customers: ReactNode;
  readonly decisionWorkspace: ReactNode;
  readonly drivers: ReactNode;
  readonly funnel: ReactNode;
  readonly kpis: ReactNode;
  readonly plan: ReactNode;
  readonly priorities: ReactNode;
  readonly products: ReactNode;
  readonly traffic: ReactNode;
};

export function CommandCenterDashboardLayout({
  actions,
  customers,
  decisionWorkspace,
  drivers,
  funnel,
  kpis,
  plan,
  priorities,
  products,
  traffic,
}: CommandCenterDashboardLayoutProps) {
  return (
    <div className="pd-command-center-dashboard-layout">
      <div className="pd-command-center-dashboard-layout__kpis">
        {kpis}
      </div>

      <div className="pd-command-center-dashboard-layout__body">
        <div className="pd-command-center-dashboard-layout__primary-stack">
          <div className="pd-command-center-dashboard-layout__plan">
            {plan}
          </div>

          <div className="pd-command-center-dashboard-layout__drivers">
            {drivers}
          </div>

          <div className="pd-command-center-dashboard-layout__traffic">
            {traffic}
          </div>

          <div className="pd-command-center-dashboard-layout__customers">
            {customers}
          </div>

          <div className="pd-command-center-dashboard-layout__decision-workspace">
            {decisionWorkspace}
          </div>
        </div>

        <div className="pd-command-center-dashboard-layout__secondary-stack">
          <div className="pd-command-center-dashboard-layout__priorities">
            {priorities}
          </div>

          <div className="pd-command-center-dashboard-layout__funnel">
            {funnel}
          </div>

          <div className="pd-command-center-dashboard-layout__products">
            {products}
          </div>

          <div className="pd-command-center-dashboard-layout__actions">
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}
