import type {
  ContractCustomerSegmentsProps,
  HTMLAttributes,
} from '../domainShared';
import {
  StatusBadge,
  TextAction,
  formatCurrency,
  formatInteger,
  formatPercent,
  forwardRef,
  joinClassNames,
  useId,
} from '../domainShared';

export type CustomerSegmentsProps =
  ContractCustomerSegmentsProps & HTMLAttributes<HTMLElement>;

export const CustomerSegments = forwardRef<HTMLElement, CustomerSegmentsProps>(
  function CustomerSegments(
    {
      className,
      onSelectSegment,
      segments,
      selectedSegmentId = null,
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
        className={joinClassNames('pd-customer-segments', className)}
      >
        <header className="pd-customer-segments__header">
          <div>
            <p>Segmenty</p>
            <h2 id={titleId}>Klienci i wartość</h2>
          </div>
          <StatusBadge status="Segmenty" text={`${segments.length}`} tone="info" />
        </header>
        <ul className="pd-customer-segments__list">
          {segments.map((segment) => (
            <li key={segment.id} data-selected={segment.id === selectedSegmentId ? true : undefined}>
              <div>
                <strong>{segment.label}</strong>
                <span>{formatInteger(segment.customers)} klientów</span>
              </div>
              <span>{formatCurrency(segment.revenue)}</span>
              {typeof segment.churnRisk === 'number' ? (
                <StatusBadge
                  status="Churn"
                  text={formatPercent(segment.churnRisk)}
                  tone={segment.churnRisk > 0.18 ? 'warning' : 'success'}
                />
              ) : null}
              {onSelectSegment ? (
                <TextAction
                  size="small"
                  onClick={() => {
                    onSelectSegment({
                      action: 'select-segment',
                      componentId: 'CustomerSegments',
                      segmentId: segment.id,
                    });
                  }}
                >
                  Wybierz
                </TextAction>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    );
  },
);
