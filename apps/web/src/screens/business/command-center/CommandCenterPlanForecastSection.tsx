import type {
  CommandCenterRecord,
} from '../../../../../../contracts/api-schemas';
import {
  ComparisonChart,
} from '../../../design-system';
import {
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  chooseComparableRecords,
  formatMetricValue,
  resolveRuntimeForecastValue,
  shortenMetricLabel,
} from './commandCenterOnePageModel';

export function CommandCenterPlanForecastSection({
  records,
}: {
  readonly records: readonly CommandCenterRecord[];
}) {
  const comparable = chooseComparableRecords(records).slice(0, 4);

  return (
    <section
      aria-labelledby="command-center-plan-title"
      className="pd-command-center-one-page__section"
    >
      <CommandSectionHeader
        eyebrow="Plan vs wynik"
        title="Plan vs wynik — prognoza dowiezienia"
        titleId="command-center-plan-title"
      />
      <div className="pd-command-center-one-page__plan-summary">
        {comparable.slice(0, 3).map((record) => (
          <article key={record.metricId}>
            <span>{record.label}</span>
            <strong>{formatMetricValue(record.value, record.unit)}</strong>
            <small>
              Cel {record.target === null ? '—' : formatMetricValue(record.target, record.unit)} · Prognoza {formatMetricValue(resolveRuntimeForecastValue(record), record.unit)}
            </small>
          </article>
        ))}
      </div>
      <ComparisonChart
        ariaLabel="Porównanie wyniku, celu i prognozy"
        className="pd-command-center-one-page__chart-surface"
        data={comparable.map((record) => ({
          id: record.metricId,
          label: shortenMetricLabel(record.label),
          values: {
            actual: record.value,
            forecast: resolveRuntimeForecastValue(record),
            target: record.target ?? record.value,
          },
        }))}
        series={[
          { key: 'actual', label: 'Wynik' },
          { key: 'target', label: 'Cel' },
          { key: 'forecast', label: 'Prognoza' },
        ]}
        unit=""
        valueFormatter={(value) => formatMetricValue(value, comparable[0]?.unit ?? 'number')}
        variant="grouped"
      />
    </section>
  );
}
