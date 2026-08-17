import type {
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  EmptyState,
} from '../../../design-system';
import {
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  formatPercent,
} from './commandCenterOnePageModel';

export function CommandCenterCustomerSplitSection({
  customerRows,
}: {
  readonly customerRows: readonly DataRow[];
}) {
  const returningRevenue = Number(customerRows.find((row) => row.id === 'returning')?.rawRevenue ?? 0);
  const totalRevenue = Math.max(customerRows.reduce((sum, row) => sum + Number(row.rawRevenue ?? 0), 0), 1);

  return (
    <section
      aria-labelledby="command-center-customers-title"
      className="pd-command-center-one-page__section"
    >
      <CommandSectionHeader
        eyebrow="Klienci"
        title="Powracający vs nowi"
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
      <div className="pd-command-center-one-page__customer-compare">
        {customerRows.map((row) => (
          <article key={String(row.id)}>
            <h3>{row.segment}</h3>
            <dl>
              <div><dt>Liczba klientów</dt><dd>{row.customers}</dd></div>
              <div><dt>Przychód</dt><dd>{row.revenue}</dd></div>
              <div><dt>Śr. produktów</dt><dd>{row.productsPerOrder}</dd></div>
              <div><dt>ARPU</dt><dd>{row.arpu}</dd></div>
              <div><dt>Częstotliwość</dt><dd>{row.frequency}</dd></div>
            </dl>
          </article>
        ))}
        <div className="pd-command-center-one-page__customer-orbit">
          <strong>{formatPercent(returningRevenue / totalRevenue)}</strong>
          <span>przychodu z klientów powracających</span>
        </div>
      </div>
      </>
      )}
    </section>
  );
}
