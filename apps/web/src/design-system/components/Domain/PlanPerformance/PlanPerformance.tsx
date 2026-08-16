import type {
  ContractPlanPerformanceProps,
  HTMLAttributes,
} from '../domainShared';
import {
  StatusBadge,
  formatSignedNumber,
  forwardRef,
  joinClassNames,
  resolvePaceLabel,
  resolvePaceTone,
  useId,
} from '../domainShared';

export type PlanPerformanceProps =
  ContractPlanPerformanceProps & HTMLAttributes<HTMLElement>;

export const PlanPerformance = forwardRef<HTMLElement, PlanPerformanceProps>(
  function PlanPerformance(
    {
      actualSeries: _actualSeries,
      className,
      gapToTarget,
      pace,
      planSeries: _planSeries,
      ...props
    },
    ref,
  ) {
    const titleId = useId();

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
      </section>
    );
  },
);
