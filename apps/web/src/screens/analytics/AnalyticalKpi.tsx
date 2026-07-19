
import { analyticalKpiCards } from '../../fixtures/analytics';
import { Surface } from '../../design-system';
import '../../design-system/foundations/papadata-brand-surface.css';
import { TargetScreenShell } from '../shared/TargetScreenShell';
import './analytical-elements.css';

function AnalyticalKpi() {
  return (
    <TargetScreenShell
      className="pdx-shell"
      initialTheme="dark"
      mainClassName="pdx-main"
    >
        <header className="pdx-header">
          <span>Elementy analityczne</span>
          <h1>KPI</h1>
          <p>
            Karty KPI pokazują wartość, zakres, świeżość i ograniczenia
            interpretacji.
          </p>
        </header>

        <section className="pdx-grid">
          {analyticalKpiCards.map((card) => (
            <Surface className="pdx-card" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.description}</p>
            </Surface>
          ))}
        </section>
    </TargetScreenShell>
  );
}

export { AnalyticalKpi };
