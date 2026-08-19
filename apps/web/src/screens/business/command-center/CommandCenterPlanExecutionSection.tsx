import {
  useId,
  useState,
} from 'react';
import {
  CommandCenterPlanTrajectoryChart,
} from './CommandCenterPlanTrajectoryChart';
import './command-center-plan-execution.css';

const summaryCards = [
  {
    helper: '108,6% planu',
    id: 'result',
    label: 'Wykonanie',
    meta: 'Aktualny stan',
    tone: 'positive',
    value: '76 033 zł',
  },
  {
    helper: '100% planu',
    id: 'target',
    label: 'Cel okresu',
    meta: 'Cel bazowy',
    tone: 'neutral',
    value: '70 000 zł',
  },
  {
    helper: '111,2% celu',
    id: 'forecast',
    label: 'Prognoza końcowa',
    meta: 'Szacunek na koniec',
    tone: 'accent',
    value: '77 814 zł',
  },
  {
    helper: 'Bufor ponad plan',
    id: 'gap',
    label: 'Gap do celu',
    meta: '+7 814 zł zapasu',
    tone: 'positive',
    value: '+7 814 zł',
  },
] as const;

const tableRows = [
  {
    forecast: '77 814 zł',
    gap: '+7 814 zł',
    id: 'revenue',
    metric: 'Przychód całkowity',
    result: '76 033 zł',
    target: '70 000 zł',
  },
] as const;

export function CommandCenterPlanExecutionSection() {
  const [isTableVisible, setIsTableVisible] = useState(false);
  const tableId = useId();

  return (
    <section
      aria-labelledby="command-plan-title"
      className="pd-command-plan-section"
    >
      <div className="pd-command-plan-section__heading">
        <h2
          className="pd-command-plan-section__title"
          id="command-plan-title"
        >
          Plan vs Prognoza
        </h2>

        <div className="pd-command-plan-section__status">
          <span className="pd-command-plan-section__status-dot" />
          <span>Status: powyżej celu</span>
          <strong>111,2%</strong>
        </div>
      </div>

      <div className="pd-command-plan-section__summary">
        {summaryCards.map((card) => (
          <article
            className="pd-command-plan-summary-card"
            data-tone={card.tone}
            key={card.id}
          >
            <p className="pd-command-plan-summary-card__label">
              {card.label}
            </p>

            <p className="pd-command-plan-summary-card__value">
              {card.value}
            </p>

            <div className="pd-command-plan-summary-card__meta">
              <span>{card.helper}</span>
              <span>{card.meta}</span>
            </div>
          </article>
        ))}
      </div>

      <article className="pd-command-plan-trajectory">
        <div className="pd-command-plan-trajectory__header">
          <div>
            <h3 className="pd-command-plan-trajectory__title">
              Trajektoria tempa okresu vs cel i prognoza
            </h3>

            <p className="pd-command-plan-trajectory__description">
              Kumulacja przychodu, plan okresu i projekcja końca miesiąca.
            </p>
          </div>

          <button
            aria-controls={tableId}
            aria-expanded={isTableVisible}
            className="pd-command-plan-trajectory__table-trigger"
            onClick={() => setIsTableVisible((current) => !current)}
            type="button"
          >
            {isTableVisible ? 'Ukryj dane planu' : 'Pokaż dane planu'}
          </button>
        </div>

        <CommandCenterPlanTrajectoryChart />

        {isTableVisible ? (
          <div
            className="pd-command-plan-table"
            id={tableId}
          >
            <div className="pd-command-plan-table__header">
              <span>Szczegółowa tabela trajektorii planu</span>
              <span>Jednostka: PLN</span>
            </div>

            <div className="pd-command-plan-table__scroll">
              <table>
                <thead>
                  <tr>
                    <th>Metryka</th>
                    <th>Wynik</th>
                    <th>Cel</th>
                    <th>Prognoza</th>
                    <th>Gap do celu</th>
                  </tr>
                </thead>

                <tbody>
                  {tableRows.map((row) => (
                    <tr key={row.id}>
                      <th scope="row">{row.metric}</th>
                      <td>{row.result}</td>
                      <td>{row.target}</td>
                      <td>{row.forecast}</td>
                      <td>{row.gap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </article>
    </section>
  );
}
