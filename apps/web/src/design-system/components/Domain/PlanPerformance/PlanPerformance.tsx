import type {
  ChartSeries,
  ContractPlanPerformanceProps,
  HTMLAttributes,
} from '../domainShared';
import {
  StatusBadge,
  TrendChart,
  formatSignedNumber,
  forwardRef,
  joinClassNames,
  resolvePaceLabel,
  resolvePaceTone,
  useId,
} from '../domainShared';

export type PlanPerformanceProps =
  ContractPlanPerformanceProps & HTMLAttributes<HTMLElement>;

type PlanPerformanceDatum = {
  readonly actual: number | null;
  readonly label: string;
  readonly plan: number | null;
};

/**
 * Aligns the plan and actual series on their shared x values so the chart shows
 * one row per period even when a series is missing a point.
 */
function buildPlanPerformanceData(
  actualSeries: ChartSeries | undefined,
  planSeries: ChartSeries | undefined,
): readonly PlanPerformanceDatum[] {
  const actualPoints = actualSeries?.points ?? [];
  const planPoints = planSeries?.points ?? [];

  const orderedKeys: string[] = [];
  const seenKeys = new Set<string>();

  for (const point of [...actualPoints, ...planPoints]) {
    if (!seenKeys.has(point.x)) {
      seenKeys.add(point.x);
      orderedKeys.push(point.x);
    }
  }

  return orderedKeys.map((key) => {
    const actualPoint = actualPoints.find((point) => point.x === key);
    const planPoint = planPoints.find((point) => point.x === key);

    return {
      actual: actualPoint?.y ?? null,
      label: actualPoint?.label ?? planPoint?.label ?? key,
      plan: planPoint?.y ?? null,
    };
  });
}

export const PlanPerformance = forwardRef<HTMLElement, PlanPerformanceProps>(
  function PlanPerformance(
    {
      actualSeries,
      className,
      confidenceBand: _confidenceBand,
      context: _context,
      forecastSeries: _forecastSeries,
      gapToTarget,
      onRangeChange: _onRangeChange,
      pace,
      planSeries,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const data = buildPlanPerformanceData(actualSeries, planSeries);

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-plan-performance', className)}
        data-pace={pace}
      >
        <header className="pd-plan-performance__header">
          <div>
            <p>Plan vs wynik</p>
            <h2 id={titleId}>Realizacja celu</h2>
          </div>
          <StatusBadge
            status="Tempo"
            text={resolvePaceLabel(pace)}
            tone={resolvePaceTone(pace)}
          />
        </header>
        <dl className="pd-plan-performance__meta">
          <div>
            <dt>Luka do celu</dt>
            <dd>{formatSignedNumber(gapToTarget)}</dd>
          </div>
          <div>
            <dt>Stan</dt>
            <dd>{resolvePaceLabel(pace)}</dd>
          </div>
        </dl>
        {data.length > 0 ? (
          <TrendChart
            ariaLabel="Realizacja planu w czasie: wynik i plan"
            className="pd-plan-performance__chart"
            data={data}
            unit={actualSeries?.unit ?? planSeries?.unit ?? null}
            variant="line"
          />
        ) : null}
      </section>
    );
  },
);
