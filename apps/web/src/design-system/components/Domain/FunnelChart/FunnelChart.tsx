import type {
  BaseComponentContractKeys,
  ContractFunnelChartProps,
  HTMLAttributes,
} from '../domainShared';
import {
  formatInteger,
  formatPercent,
  forwardRef,
  joinClassNames,
  useId,
} from '../domainShared';

export type FunnelChartProps = Omit<
  ContractFunnelChartProps,
  BaseComponentContractKeys
> & HTMLAttributes<HTMLElement>;

export const FunnelChart = forwardRef<HTMLElement, FunnelChartProps>(
  function FunnelChart(
    {
      className,
      orientation,
      showDropoff,
      steps,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const maxValue = Math.max(...steps.map((step) => step.value), 1);

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-funnel-chart', className)}
        data-orientation={orientation}
      >
        <h2 id={titleId}>Lejek sprzedaży</h2>
        <ol className="pd-funnel-chart__steps">
          {steps.map((step, index) => {
            const width = Math.max((step.value / maxValue) * 100, 6);
            const previous = steps[index - 1];
            const dropoff = previous
              ? 1 - (step.value / Math.max(previous.value, 1))
              : 0;

            return (
              <li key={step.id}>
                <div>
                  <span>{step.label}</span>
                  <strong>{formatInteger(step.value)}</strong>
                </div>
                <span
                  aria-hidden="true"
                  className="pd-funnel-chart__bar"
                >
                  <span style={{ inlineSize: `${width}%` }} />
                </span>
                <span>
                  CR {step.conversionRate === null ? '—' : formatPercent(step.conversionRate)}
                  {showDropoff && index > 0 ? ` · odpływ ${formatPercent(dropoff)}` : ''}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    );
  },
);
