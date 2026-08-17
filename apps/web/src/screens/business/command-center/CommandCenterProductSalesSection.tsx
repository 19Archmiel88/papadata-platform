import type {
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  ComparisonChart,
  EmptyState,
} from '../../../design-system';
import {
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  formatMetricValue,
} from './commandCenterOnePageModel';

export function CommandCenterProductSalesSection({
  productRows,
}: {
  readonly productRows: readonly DataRow[];
}) {
  return (
    <section
      aria-labelledby="command-center-products-title"
      className="pd-command-center-one-page__section"
    >
      <CommandSectionHeader
        eyebrow="Produkty"
        title="Sprzedaż produktów"
        titleId="command-center-products-title"
      />
      {productRows.length === 0 ? (
        <EmptyState
          message="Kontrakt Centrum Dowodzenia nie dostarcza jeszcze sprzedaży w podziale na produkty dla wybranego zakresu."
          title="Brak danych produktowych"
          variant="configuration"
        />
      ) : (
        // Products used to be the only floor without a chart, which made it read
        // as a data dump between two analytical sections.
        <ComparisonChart
          ariaLabel="Przychód według produktów"
          className="pd-command-center-one-page__chart-surface"
          data={[...productRows]
            .sort((left, right) => (
              Number(right.rawRevenue ?? 0) - Number(left.rawRevenue ?? 0)
            ))
            .slice(0, 10)
            .map((row) => ({
              id: String(row.id),
              label: String(row.product),
              values: {
                revenue: Number(row.rawRevenue ?? 0),
              },
            }))}
          series={[{ key: 'revenue', label: 'Przychód' }]}
          unit="PLN"
          valueFormatter={(value) => formatMetricValue(value, 'currency')}
          variant="ranking"
        />
      )}
    </section>
  );
}
