import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, CalendarDays, Download, Search } from 'lucide-react';

import '../foundations/papadata-brand-surface.css';
import './dashboard-shell.css';

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
            <span className="pdd-control">
              <CalendarDays aria-hidden="true" size={15} />
              Ostatnie 30 dni
            </span>
            <span className="pdd-control">
              <Search aria-hidden="true" size={15} />
              Szukaj
            </span>
            <span className="pdd-control">
              <Download aria-hidden="true" size={15} />
              Eksport
            </span>
            <span className="pdd-control">
              <Bell aria-hidden="true" size={15} />
              Alerty
            </span>
          </div>

          <div className="pdd-kpi-grid">
            <article className="pdd-card">
              <span>ready</span>
              <strong>128 tys.</strong>
              <p>Dane kompletne dla jawnego zakresu.</p>
            </article>
            <article className="pdd-card">
              <span>partial</span>
              <strong>2 źródła</strong>
              <p>Brak traffic wpływa na interpretację.</p>
            </article>
            <article className="pdd-card">
              <span>stale</span>
              <strong>48 h</strong>
              <p>Ostatnia udana synchronizacja przekroczyła próg.</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

const meta = {
  title: 'PapaData/Dashboard/Komponenty',
  component: DashboardComponents,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DashboardComponents>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ZestawKomponentow: Story = {
  name: 'Zestaw komponentów',
};
