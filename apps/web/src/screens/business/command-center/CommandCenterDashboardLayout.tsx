import type {
  ReactNode,
} from 'react';

import './command-center-dashboard-layout.css';

export type CommandCenterDashboardLayoutProps = {
  readonly customers: ReactNode;
  readonly drivers: ReactNode;
  readonly funnel: ReactNode;
  readonly kpis: ReactNode;
  readonly plan: ReactNode;
  readonly products: ReactNode;
  readonly traffic: ReactNode;
};

export function CommandCenterDashboardLayout({
  customers,
  drivers,
  funnel,
  kpis,
  plan,
  products,
  traffic,
}: CommandCenterDashboardLayoutProps) {
  return (
    <div className="pd-command-center-dashboard-layout">
      {kpis}
      {plan}
      {drivers}
      {funnel}
      {products}
      {traffic}
      {customers}
    </div>
  );
}
