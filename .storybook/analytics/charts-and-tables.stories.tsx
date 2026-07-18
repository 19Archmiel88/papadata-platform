import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart3, LineChart, Table2 } from 'lucide-react';

import '../foundations/papadata-brand-surface.css';
import './analytical-elements.css';

function ChartsAndTables() {
  return (
    <div
      className="pds-brand-surface pdx-shell"
      data-theme="dark"
      lang="pl"
    >
      <main className="pdx-main">
        <header className="pdx-header">
          <span>Elementy analityczne</span>
          <h1>Wykresy i tabele</h1>
          <p>
            Robocza reprezentacja ChartFrame, tabel i stanów danych bez
            importowania silnika wykresów do Storybookowego prototypu.
          </p>
        </header>

        <section className="pdx-grid pdx-grid--two">
          <article className="pdx-panel">
            <div className="pdx-panel-header">
              <h2>Plan vs wynik</h2>
              <BarChart3 aria-hidden="true" size={18} />
            </div>
            <div className="pdx-chart" aria-hidden="true">
              {[42, 51, 63, 48, 74, 82, 69, 88, 73, 91].map((value) => (
                <span key={value} style={{ height: `${value}%` }} />
              ))}
            </div>
          </article>

          <article className="pdx-panel">
            <div className="pdx-panel-header">
              <h2>Przychód vs koszty</h2>
              <LineChart aria-hidden="true" size={18} />
            </div>
            <div className="pdx-line-chart" aria-hidden="true" />
          </article>
        </section>

        <section className="pdx-panel">
          <div className="pdx-panel-header">
            <h2>Tabela źródeł ruchu</h2>
            <Table2 aria-hidden="true" size={18} />
          </div>

          <table className="pdx-table">
            <thead>
              <tr>
                <th>Źródło</th>
                <th>Przychód</th>
                <th>Konwersja</th>
                <th>Stan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Organic search</td>
                <td>42 800 PLN</td>
                <td>3,8%</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>Paid social</td>
                <td>31 200 PLN</td>
                <td>2,4%</td>
                <td>partial</td>
              </tr>
              <tr>
                <td>Email</td>
                <td>18 900 PLN</td>
                <td>5,1%</td>
                <td>ready</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

const meta = {
  title: 'PapaData/Elementy analityczne/Wykresy i tabele',
  component: ChartsAndTables,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ChartsAndTables>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WidokAnalityczny: Story = {
  name: 'Widok analityczny',
};
