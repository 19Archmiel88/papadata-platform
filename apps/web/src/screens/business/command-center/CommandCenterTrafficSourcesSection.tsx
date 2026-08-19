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
  sourceColumns,
} from './commandCenterOnePageModel';

const trafficSourcesElementId = 'command-traffic-sources';

export function CommandCenterTrafficSourcesSection({
  sourceRows,
}: {
  readonly sourceRows: readonly DataRow[];
}) {
  return (
    <section
      aria-labelledby="command-center-traffic-sources-title"
      className="pd-command-center-one-page__section"
    >
      <CommandSectionHeader
        actions={(
          <Button
            onClick={() => openPapaAssistantForElement(trafficSourcesElementId)}
            size="small"
            variant="secondary"
          >
            Analizuj z Papą
          </Button>
        )}
        description="Ranking kanałów pokazuje, gdzie powstaje przychód. W runtime one-page ten sam kontekst jest włączony bezpośrednio do sekcji driverów wyniku."
        eyebrow="Źródła"
        title="Kanały przychodu"
        titleId="command-center-traffic-sources-title"
      />
      {sourceRows.length === 0 ? (
        <EmptyState
          message="Kontrakt Centrum Dowodzenia nie dostarcza jeszcze podziału przychodu na źródła ruchu dla wybranego zakresu."
          title="Brak podziału na źródła ruchu"
          variant="configuration"
        />
      ) : (
        <>
          <ComparisonChart
            ariaLabel="Ranking źródeł ruchu według przychodu"
            className="pd-command-center-one-page__chart-surface"
            data={[...sourceRows]
              .sort((left, right) => Number(right.rawRevenue ?? 0) - Number(left.rawRevenue ?? 0))
              .map((row) => ({
                id: String(row.id),
                label: String(row.source),
                values: {
                  revenue: Number(row.rawRevenue ?? 0),
                },
              }))}
            series={[{ key: 'revenue', label: 'Przychód' }]}
            unit="PLN"
            valueFormatter={(value) => formatMetricValue(value, 'currency')}
            variant="ranking"
          />

          <CommandChartTableFallback
            ariaLabel="Źródła ruchu: sesje, użytkownicy, przychód, CR i CTR"
            columns={sourceColumns}
            emptyMessage="Brak źródeł ruchu."
            minWidth={980}
            rows={sourceRows}
            sortColumnId="revenue"
          />
        </>
      )}
    </section>
  );
}
