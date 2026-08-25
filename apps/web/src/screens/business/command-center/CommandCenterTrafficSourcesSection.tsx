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
  formatInteger,
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
        description="Ranking kanałów według sesji i użytkowników z GA4. Przychód per kanał nie jest jeszcze pokazywany: wymagałby łączenia dwóch różnych wymiarów atrybucji GA4, co ryzykowałoby błędne przypisanie konwersji do kanału."
        eyebrow="Źródła"
        title="Kanały ruchu"
        titleId="command-center-traffic-sources-title"
      />
      {sourceRows.length === 0 ? (
        <EmptyState
          message="Kontrakt Centrum Dowodzenia nie dostarcza jeszcze podziału ruchu na źródła dla wybranego zakresu."
          title="Brak podziału na źródła ruchu"
          variant="configuration"
        />
      ) : (
        <>
          <ComparisonChart
            ariaLabel="Ranking źródeł ruchu według sesji"
            className="pd-command-center-one-page__chart-surface"
            data={[...sourceRows]
              .sort((left, right) => Number(right.rawSessions ?? 0) - Number(left.rawSessions ?? 0))
              .map((row) => ({
                id: String(row.id),
                label: String(row.source),
                values: {
                  sessions: Number(row.rawSessions ?? 0),
                },
              }))}
            series={[{ key: 'sessions', label: 'Sesje' }]}
            valueFormatter={(value) => formatInteger(value)}
            variant="ranking"
            visualStyle="vivid"
          />

          <CommandChartTableFallback
            ariaLabel="Źródła ruchu: sesje i użytkownicy"
            columns={sourceColumns}
            emptyMessage="Brak źródeł ruchu."
            minWidth={640}
            rows={sourceRows}
            sortColumnId="sessions"
          />
        </>
      )}
    </section>
  );
}
