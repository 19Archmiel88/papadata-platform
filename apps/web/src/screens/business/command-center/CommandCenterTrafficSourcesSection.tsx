import type {
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  EmptyState,
  ShareChart,
} from '../../../design-system';
import {
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  formatMetricValue,
} from './commandCenterOnePageModel';

function resolveShareTotal(rows: readonly DataRow[]): number {
  return rows.reduce((sum, row) => sum + Number(row.rawRevenue ?? 0), 0);
}

function buildShareSegments(rows: readonly DataRow[]) {
  const total = Math.max(resolveShareTotal(rows), 1);

  return rows.map((row) => {
    const value = Number(row.rawRevenue ?? 0);

    return {
      id: String(row.id),
      label: String(row.source),
      percent: (value / total) * 100,
      value,
    };
  });
}

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
        eyebrow="Źródła ruchu"
        title="Przychód według źródeł ruchu"
        titleId="command-center-traffic-sources-title"
      />
      {sourceRows.length === 0 ? (
        <EmptyState
          message="Kontrakt Centrum Dowodzenia nie dostarcza jeszcze podziału przychodu na źródła ruchu dla wybranego zakresu."
          title="Brak podziału na źródła ruchu"
          variant="configuration"
        />
      ) : (
        // The question here is "what share of revenue comes from where", so the
        // part-to-whole form answers it directly; the ranked table moved to the
        // register at the bottom of the page.
        <ShareChart
          ariaLabel="Udział źródeł ruchu w przychodzie"
          className="pd-command-center-one-page__chart-surface"
          display="donut"
          segments={buildShareSegments(sourceRows)}
          total={resolveShareTotal(sourceRows)}
          valueFormatter={(value) => formatMetricValue(value, 'currency')}
        />
      )}
    </section>
  );
}
