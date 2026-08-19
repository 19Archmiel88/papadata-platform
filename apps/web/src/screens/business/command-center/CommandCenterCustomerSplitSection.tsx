import type {
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  Button,
  EmptyState,
  ShareChart,
} from '../../../design-system';
import {
  CommandChartTableFallback,
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  customerColumns,
  formatMetricValue,
  formatPercent,
  openPapaAssistantForElement,
} from './commandCenterOnePageModel';

const customerSplitElementId = 'command-customer-split';

export function CommandCenterCustomerSplitSection({
  customerRows,
}: {
  readonly customerRows: readonly DataRow[];
}) {
  const returningRevenue = Number(customerRows.find((row) => row.id === 'returning')?.rawRevenue ?? 0);
  const totalRevenue = Math.max(customerRows.reduce((sum, row) => sum + Number(row.rawRevenue ?? 0), 0), 1);
  const returningShare = Math.min(Math.max(returningRevenue / totalRevenue, 0), 1);
  const newShare = 1 - returningShare;

  return (
    <section
      aria-labelledby="command-center-customers-title"
      className="pd-command-center-one-page__section pd-command-center-one-page__customer-section"
    >
      <CommandSectionHeader
        actions={(
          <Button
            onClick={() => openPapaAssistantForElement(customerSplitElementId)}
            size="small"
            variant="secondary"
          >
            Analizuj z Papą
          </Button>
        )}
        description="Udział przychodu i podstawowa ekonomika segmentów nowych i powracających klientów."
        eyebrow="Klienci"
        title="Nowi i powracający"
        titleId="command-center-customers-title"
      />
      {customerRows.length === 0 ? (
        <EmptyState
          message="Kontrakt Centrum Dowodzenia nie dostarcza jeszcze podziału na klientów nowych i powracających dla wybranego zakresu."
          title="Brak segmentów klientów"
          variant="configuration"
        />
      ) : (
        <>
          <div className="pd-command-center-one-page__customer-split">
            <div className="pd-command-center-one-page__customer-summary">
              <p>
                <strong>{formatPercent(returningShare)}</strong>
                <span>przychodu generują klienci powracający</span>
              </p>

              <ShareChart
                ariaLabel={`${formatPercent(returningShare)} przychodu od klientów powracających i ${formatPercent(newShare)} od nowych`}
                display="donut"
                segments={customerRows.map((row) => ({
                  id: String(row.id),
                  label: String(row.segment),
                  percent: (Number(row.rawRevenue ?? 0) / totalRevenue) * 100,
                  value: Number(row.rawRevenue ?? 0),
                }))}
                total={totalRevenue}
                valueFormatter={(value) => formatMetricValue(value, 'currency')}
              />
            </div>

            <div className="pd-command-center-one-page__customer-segments">
              {customerRows.map((row) => (
                <article key={String(row.id)}>
                  <header>
                    <h3>{row.segment}</h3>
                    <strong>{row.revenue}</strong>
                  </header>
                  <dl>
                    <div><dt>Klienci</dt><dd>{row.customers}</dd></div>
                    <div><dt>ARPU</dt><dd>{row.arpu}</dd></div>
                    <div><dt>Śr. produktów</dt><dd>{row.productsPerOrder}</dd></div>
                    <div><dt>Częstotliwość</dt><dd>{row.frequency}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          </div>

          <CommandChartTableFallback
            ariaLabel="Segmenty klientów: liczba, przychód, ARPU i częstotliwość"
            columns={customerColumns}
            emptyMessage="Brak segmentów klientów."
            minWidth={920}
            rows={customerRows}
            sortColumnId="revenue"
          />
        </>
      )}
    </section>
  );
}
