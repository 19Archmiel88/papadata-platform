import type {
  ContractFunnelStepProps,
  HTMLAttributes,
} from '../domainShared';
import {
  TextAction,
  formatInteger,
  formatPercent,
  forwardRef,
  joinClassNames,
} from '../domainShared';

export type FunnelStepProps =
  ContractFunnelStepProps & HTMLAttributes<HTMLElement>;

export const FunnelStep = forwardRef<HTMLElement, FunnelStepProps>(
  function FunnelStep(
    {
      className,
      conversions,
      conversionRate,
      label,
      onInspect,
      stepId,
      visitors,
      ...props
    },
    ref,
  ) {
    return (
      <article
        {...props}
        ref={ref}
        className={joinClassNames('pd-funnel-step', className)}
      >
        <div>
          <p>{stepId}</p>
          <h3>{label}</h3>
        </div>
        <dl>
          <div>
            <dt>Wejścia</dt>
            <dd>{formatInteger(visitors)}</dd>
          </div>
          <div>
            <dt>Konwersje</dt>
            <dd>{formatInteger(conversions)}</dd>
          </div>
          <div>
            <dt>CR</dt>
            <dd>{formatPercent(conversionRate)}</dd>
          </div>
        </dl>
        {onInspect ? (
          <TextAction
            size="small"
            onClick={() => {
              onInspect({
                action: 'inspect-step',
                componentId: 'FunnelStep',
                stepId,
              });
            }}
          >
            Analizuj
          </TextAction>
        ) : null}
      </article>
    );
  },
);
