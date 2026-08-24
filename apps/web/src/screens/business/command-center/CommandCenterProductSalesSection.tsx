import type {
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  Button,
  ComparisonChart,
  EmptyState,
} from '../../../design-system';
import {
  CommandChartTableFallback,
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  formatMetricValue,
  openPapaAssistantForElement,
  productColumns,
} from './commandCenterOnePageModel';

const productSalesElementId = 'command-product-sales';

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
        actions={(
          <Button
            onClick={() => openPapaAssistantForElement(productSalesElementId)}
            size="small"
            variant="secondary"
          >
            Analizuj z Papą
          </Button>
        )}
        description="Ranking produktów według przychodu pozwala szybko znaleźć pozycje, które realnie przesuwają wynik okresu."
        eyebrow="Produkty"
        title="Najlepiej sprzedające się produkty"
        titleId="command-center-products-title"
      />
      {productRows.length === 0 ? (
        <EmptyState
          message="Kontrakt Centrum Dowodzenia nie dostarcza jeszcze sprzedaży w podziale na produkty dla wybranego zakresu."
          title="Brak danych produktowych"
          variant="configuration"
        />
      ) : (
        <>
          <ComparisonChart
            ariaLabel="Przychód według produktów"
            className="pd-command-center-one-page__chart-surface"
            data={[...productRows]
              .sort((left, right) => (
                Number(right.rawRevenue ?? 0) - Number(left.rawRevenue ?? 0)
              ))
              .slice(0, 8)
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
            visualStyle="vivid"
          />

          <CommandChartTableFallback
            ariaLabel="Produkty: przychód, ilość i zmiana"
            columns={productColumns}
            emptyMessage="Brak danych produktowych."
            minWidth={660}
            rows={productRows}
            sortColumnId="revenue"
          />
        </>
      )}
    </section>
  );
}
