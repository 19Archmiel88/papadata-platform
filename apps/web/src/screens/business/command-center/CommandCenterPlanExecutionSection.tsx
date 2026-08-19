import {
  useId,
  useState,
} from 'react';
import type {
  PlanTrajectoryPointView,
} from '../../../../../../contracts/api-schemas';
import {
  CommandCenterPlanTrajectoryChart,
} from './CommandCenterPlanTrajectoryChart';
import './command-center-plan-execution.css';

export type CommandCenterPlanExecutionSectionProps = {
  readonly forecastMethod: 'linear-run-rate' | null;
  readonly forecastTotal: number | null;
  readonly planTotal: number | null;
  readonly trajectory: readonly PlanTrajectoryPointView[];
};

const currencyFormatter = new Intl.NumberFormat('pl-PL', {
  currency: 'PLN',
  maximumFractionDigits: 0,
  style: 'currency',
});

const percentFormatter = new Intl.NumberFormat('pl-PL', {
  maximumFractionDigits: 1,
  style: 'percent',
});

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'short',
});

function formatPercentOfPlan(value: number | null, planTotal: number | null): string | null {
  if (value === null || planTotal === null || planTotal === 0) {
    return null;
  }

  return `${percentFormatter.format(value / planTotal)} planu`;
}

export function CommandCenterPlanExecutionSection({
  forecastMethod,
  forecastTotal,
  planTotal,
  trajectory,
}: CommandCenterPlanExecutionSectionProps) {
  const [isTableVisible, setIsTableVisible] = useState(false);
  const tableId = useId();

  const actualTotal = trajectory.some((point) => point.actual !== null)
    ? trajectory.reduce((sum, point) => sum + (point.actual ?? 0), 0)
    : null;
  const gap = forecastTotal !== null && planTotal !== null
    ? forecastTotal - planTotal
    : null;
  const resultLabel = formatPercentOfPlan(actualTotal, planTotal);
  const forecastLabel = formatPercentOfPlan(forecastTotal, planTotal);
  const statusAbovePlan = gap !== null && gap >= 0;

  const summaryCards = [
    {
      helper: resultLabel,
      id: 'result',
      label: 'Wykonanie',
      meta: 'Suma zamówień do dziś',
      tone: 'neutral' as const,
      value: actualTotal,
    },
    {
      helper: null,
      id: 'target',
      label: 'Cel okresu',
      meta: 'Plan',
      tone: 'neutral' as const,
      value: planTotal,
    },
    {
      helper: forecastLabel,
      id: 'forecast',
      label: 'Prognoza końcowa',
      meta: forecastMethod === 'linear-run-rate'
        ? 'Ekstrapolacja liniowa bieżącego tempa'
        : 'Szacunek na koniec okresu',
      tone: 'accent' as const,
      value: forecastTotal,
    },
    {
      helper: null,
      id: 'gap',
      label: 'Gap do celu',
      meta: gap === null
        ? 'Brak danych'
        : gap >= 0 ? 'Bufor ponad plan' : 'Poniżej planu',
      tone: gap === null ? 'neutral' as const : gap >= 0 ? 'positive' as const : 'negative' as const,
      value: gap,
    },
  ];

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

        {gap !== null ? (
          <div className="pd-command-plan-section__status">
            <span
              className="pd-command-plan-section__status-dot"
              data-tone={statusAbovePlan ? 'positive' : 'negative'}
            />
            <span>{statusAbovePlan ? 'Status: powyżej celu' : 'Status: poniżej celu'}</span>
            {forecastLabel ? <strong>{forecastLabel}</strong> : null}
          </div>
        ) : null}
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
              {card.value === null ? '—' : currencyFormatter.format(card.value)}
            </p>

            <div className="pd-command-plan-summary-card__meta">
              {card.helper ? <span>{card.helper}</span> : null}
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
              Kumulacja przychodu, plan okresu i projekcja końca okresu.
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

        <CommandCenterPlanTrajectoryChart trajectory={trajectory} />

        {isTableVisible ? (
          <div
            className="pd-command-plan-table"
            id={tableId}
          >
            <div className="pd-command-plan-table__header">
              <span>Szczegółowa tabela trajektorii planu — dokładnie te dane, które renderuje wykres powyżej</span>
              <span>Jednostka: PLN</span>
            </div>

            <div className="pd-command-plan-table__scroll">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Wykonanie</th>
                    <th>Plan</th>
                    <th>Prognoza</th>
                    <th>Gap do planu</th>
                  </tr>
                </thead>

                <tbody>
                  {trajectory.map((point) => {
                    const observed = point.actual ?? point.forecast;
                    const rowGap = observed === null ? null : observed - point.plan;

                    return (
                      <tr key={point.date}>
                        <th scope="row">{dateFormatter.format(new Date(point.date))}</th>
                        <td>{point.actual === null ? '—' : currencyFormatter.format(point.actual)}</td>
                        <td>{currencyFormatter.format(point.plan)}</td>
                        <td>{point.forecast === null ? '—' : currencyFormatter.format(point.forecast)}</td>
                        <td>{rowGap === null ? '—' : currencyFormatter.format(rowGap)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </article>
    </section>
  );
}
