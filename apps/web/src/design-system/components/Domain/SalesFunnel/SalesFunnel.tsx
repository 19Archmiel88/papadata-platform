import type {
  ContractSalesFunnelProps,
  HTMLAttributes,
} from '../domainShared';
import {
  StatusBadge,
  TextAction,
  formatInteger,
  formatPercent,
  forwardRef,
  joinClassNames,
  useId,
} from '../domainShared';

export type SalesFunnelProps =
  ContractSalesFunnelProps & HTMLAttributes<HTMLElement>;

export const SalesFunnel = forwardRef<HTMLElement, SalesFunnelProps>(
  function SalesFunnel(
    {
      className,
      onOpenStep,
      steps,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const maxVisitors = Math.max(...steps.map((step) => step.visitors), 1);

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-sales-funnel', className)}
      >
        <header className="pd-sales-funnel__header">
          <div>
            <p>Lejek</p>
            <h2 id={titleId}>Sprzedaż krok po kroku</h2>
          </div>
        </header>
        <ol className="pd-sales-funnel__steps">
          {steps.map((step) => (
            <li key={step.id}>
              <div>
                <strong>{step.label}</strong>
                <span>{formatInteger(step.visitors)} wejść · CR {formatPercent(step.conversionRate)}</span>
              </div>
              <span className="pd-sales-funnel__bar" aria-hidden="true">
                <span style={{ inlineSize: `${Math.max((step.visitors / maxVisitors) * 100, 8)}%` }} />
              </span>
              <StatusBadge
                status="Dropoff"
                text={formatPercent(step.dropoffRate)}
                tone={step.dropoffRate > 0.35 ? 'warning' : 'info'}
              />
              {onOpenStep ? (
                <TextAction
                  size="small"
                  onClick={() => {
                    onOpenStep({
                      action: 'open-step',
                      componentId: 'SalesFunnel',
                      stepId: step.id,
                    });
                  }}
                >
                  Otwórz
                </TextAction>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    );
  },
);
