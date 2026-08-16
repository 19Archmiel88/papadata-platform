import type {
  ContractSalesSourcesProps,
  HTMLAttributes,
} from '../domainShared';
import {
  StatusBadge,
  TextAction,
  formatCurrency,
  forwardRef,
  joinClassNames,
  resolveReadinessLabel,
  resolveReadinessTone,
  useId,
} from '../domainShared';

export type SalesSourcesProps =
  ContractSalesSourcesProps & HTMLAttributes<HTMLElement>;

export const SalesSources = forwardRef<HTMLElement, SalesSourcesProps>(
  function SalesSources(
    {
      className,
      compareToPrevious = false,
      onOpenSource,
      sources,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const totalRevenue = sources.reduce((sum, item) => sum + item.revenue, 0);

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-sales-sources', className)}
      >
        <header className="pd-sales-sources__header">
          <div>
            <p>Źródła sprzedaży</p>
            <h2 id={titleId}>Kanały i udział w przychodzie</h2>
          </div>
          <StatusBadge
            status="Porównanie"
            text={compareToPrevious ? 'z poprzednim okresem' : 'bieżący okres'}
            tone="info"
          />
        </header>
        <ul className="pd-sales-sources__list">
          {sources.map((source) => {
            const share = totalRevenue > 0
              ? source.revenue / totalRevenue
              : 0;

            return (
              <li key={source.id}>
                <div>
                  <strong>{source.channel}</strong>
                  <span>{source.orders} zamówień · marża {source.margin ?? 0}%</span>
                </div>
                <div className="pd-sales-sources__bar">
                  <span aria-hidden="true">
                    <span style={{ inlineSize: `${share * 100}%` }} />
                  </span>
                  <b>{formatCurrency(source.revenue)}</b>
                </div>
                <StatusBadge
                  status="Stan danych"
                  text={resolveReadinessLabel(source.readiness)}
                  tone={resolveReadinessTone(source.readiness)}
                />
                {onOpenSource ? (
                  <TextAction
                    size="small"
                    onClick={() => {
                      onOpenSource({
                        action: 'open-source',
                        componentId: 'SalesSources',
                        sourceId: source.id,
                      });
                    }}
                  >
                    Otwórz
                  </TextAction>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    );
  },
);
