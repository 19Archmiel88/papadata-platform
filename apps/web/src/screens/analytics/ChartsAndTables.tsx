import { BarChart3, LineChart, Table2 } from 'lucide-react';

import {
  analyticalChartBars,
  analyticalTrafficRows,
} from '../../fixtures/analytics';
import '../../design-system/foundations/papadata-brand-surface.css';
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
              {analyticalChartBars.map((value) => (
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
              {analyticalTrafficRows.map((row) => (
                <tr key={row.source}>
                  <td>{row.source}</td>
                  <td>{row.revenue}</td>
                  <td>{row.conversion}</td>
                  <td>{row.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export { ChartsAndTables };
