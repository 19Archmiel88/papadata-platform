import type {
  BaseComponentContractKeys,
  ContractWaterfallChartProps,
  HTMLAttributes,
} from '../domainShared';
import {
  formatUnitValue,
  forwardRef,
  joinClassNames,
  useId,
} from '../domainShared';

export type WaterfallChartProps = Omit<
  ContractWaterfallChartProps,
  BaseComponentContractKeys
> & HTMLAttributes<HTMLElement>;

export const WaterfallChart = forwardRef<HTMLElement, WaterfallChartProps>(
  function WaterfallChart(
    {
      className,
      items,
      showCumulative,
      unit,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const maxValue = Math.max(...items.map((item) => Math.abs(item.value)), 1);
    let runningTotal = 0;
    const rows = items.map((item) => {
      if (item.kind === 'start' || item.kind === 'total') {
        runningTotal = item.value;
      } else {
        runningTotal += item.value;
      }

      return {
        ...item,
        cumulativeValue: runningTotal,
      };
    });

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-waterfall-chart', className)}
      >
        <h2 id={titleId}>Waterfall</h2>
        <ol className="pd-waterfall-chart__items">
          {rows.map((item) => (
            <li key={item.id} data-kind={item.kind}>
              <div>
                <span>{item.label}</span>
                <strong>{formatUnitValue(item.value, unit)}</strong>
              </div>
              <span
                aria-hidden="true"
                className="pd-waterfall-chart__bar"
              >
                <span
                  style={{
                    inlineSize: `${Math.max((Math.abs(item.value) / maxValue) * 100, 8)}%`,
                  }}
                />
              </span>
              {showCumulative ? (
                <span>Kumulacja {formatUnitValue(item.cumulativeValue, unit)}</span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    );
  },
);
