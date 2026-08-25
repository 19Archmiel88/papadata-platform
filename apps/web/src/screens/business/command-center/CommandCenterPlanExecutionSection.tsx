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

  return `${percentFormatter.format(value / planTotal)} benchmarku`;
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
  const hasBenchmark = planTotal !== null && planTotal > 0;
  const gap = forecastTotal !== null && hasBenchmark
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
      meta: 'Przychód netto do dziś',
      tone: 'neutral' as const,
      value: actualTotal,
    },
    {
      helper: null,
      id: 'target',
      label: 'Benchmark okresu',
      meta: hasBenchmark
        ? 'Poprzedni równoważny okres × 1,08'
        : 'Brak danych poprzedniego okresu',
      tone: 'neutral' as const,
      value: hasBenchmark ? planTotal : null,
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
      label: 'Odchylenie od benchmarku',
      meta: gap === null
        ? 'Brak danych'
        : gap >= 0 ? 'Bufor ponad benchmark' : 'Poniżej benchmarku',
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
        <div>
          <h2
            className="pd-command-plan-section__title"
            id="command-plan-title"
          >
            Plan vs Benchmark
          </h2>

          <p className="pd-command-plan-section__description">
            Benchmark to średni dzienny przychód z bezpośrednio poprzedniego, równoważnego okresu × 1,08. To punkt odniesienia, nie zatwierdzony budżet ani plan finansowy.
          </p>
        </div>

        {gap !== null ? (
          <div className="pd-command-plan-section__status">
            <span
              className="pd-command-plan-section__status-dot"
              data-tone={statusAbovePlan ? 'positive' : 'negative'}
            />
            <span>{statusAbovePlan ? 'Status: powyżej benchmarku' : 'Status: poniżej benchmarku'}</span>
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
              Dzienne tempo przychodu vs benchmark i prognoza
            </h3>

            <p className="pd-command-plan-trajectory__description">
              Dzienny przychód netto, dzienny benchmark poprzedniego okresu i liniowa projekcja pozostałych dni.
            </p>
          </div>

          <button
            aria-controls={tableId}
            aria-expanded={isTableVisible}
            className="pd-command-plan-trajectory__table-trigger"
            onClick={() => setIsTableVisible((current) => !current)}
            type="button"
          >
            {isTableVisible ? 'Ukryj dane benchmarku' : 'Pokaż dane benchmarku'}
          </button>
        </div>

        <CommandCenterPlanTrajectoryChart
          forecastTotal={forecastTotal}
          planTotal={planTotal}
          trajectory={trajectory}
        />

        {isTableVisible ? (
          <div
            className="pd-command-plan-table"
            id={tableId}
          >
            <div className="pd-command-plan-table__header">
              <span>Szczegółowa tabela trajektorii — dokładnie te dane, które renderuje wykres powyżej</span>
              <span>Jednostka: PLN</span>
            </div>

            <div className="pd-command-plan-table__scroll">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Wykonanie</th>
                    <th>Benchmark</th>
                    <th>Prognoza</th>
                    <th>Odchylenie od benchmarku</th>
                  </tr>
                </thead>

                <tbody>
                  {trajectory.map((point) => {
                    const observed = point.actual ?? point.forecast;
                    const rowGap = observed === null || point.plan <= 0
                      ? null
                      : observed - point.plan;

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
