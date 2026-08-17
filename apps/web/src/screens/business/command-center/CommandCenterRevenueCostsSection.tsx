import type {
  CommandCenterRecord,
} from '../../../../../../contracts/api-schemas';
import type {
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  ComparisonChart,
  EmptyState,
  SegmentedControl,
  WaterfallChart,
} from '../../../design-system';
import type {
  CommandLens,
  CommandLensDefinition,
} from './commandCenterLens';
import {
  commandLensDefinitions,
  findCommandLens,
  isCommandLensAvailable,
} from './commandCenterLens';
import {
  CommandRuntimeSourceSummary,
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  findRecordById,
  formatMetricValue,
  shortenMetricLabel,
} from './commandCenterOnePageModel';

function buildLensChart(
  lens: CommandLens,
  records: readonly CommandCenterRecord[],
) {
  const revenue = findRecordById(records, 'command-kpi-revenue');
  const adCost = findRecordById(records, 'command-kpi-ad-cost');
  const orders = findRecordById(records, 'command-kpi-orders');
  const aov = findRecordById(records, 'command-kpi-aov');
  const roas = findRecordById(records, 'command-kpi-roas');
  const cpa = findRecordById(records, 'command-kpi-cpa');

  if (lens === 'cost') {
    if (!revenue) {
      return null;
    }

    // Revenue → ad cost → what is left. A bridge answers "what ate the result"
    // in a way that two bars next to each other never do.
    const items = [
      {
        id: 'revenue',
        kind: 'start' as const,
        label: revenue.label,
        value: revenue.value,
      },
      ...(adCost ? [{
        id: 'ad-cost',
        kind: 'decrease' as const,
        label: adCost.label,
        value: -adCost.value,
      }] : []),
      {
        id: 'contribution',
        kind: 'total' as const,
        label: 'Po koszcie mediów',
        value: revenue.value - (adCost?.value ?? 0),
      },
    ];

    return (
      <WaterfallChart
        className="pd-command-center-one-page__chart-surface"
        items={items}
        showCumulative
        unit="PLN"
      />
    );
  }

  if (lens === 'volume') {
    const series = [orders, aov].filter(isRecord);

    if (series.length === 0) {
      return null;
    }

    return (
      <ComparisonChart
        ariaLabel="Wolumen zamówień wobec wartości koszyka"
        className="pd-command-center-one-page__chart-surface"
        data={series.map((record) => ({
          id: record.metricId,
          label: shortenMetricLabel(record.label),
          values: {
            current: record.value,
            target: record.target ?? record.value,
          },
        }))}
        series={[
          { key: 'current', label: 'Wynik' },
          { key: 'target', label: 'Cel' },
        ]}
        unit=""
        valueFormatter={(value) => formatMetricValue(value, series[0]?.unit ?? 'number')}
        variant="grouped"
      />
    );
  }

  const series = [adCost, roas, cpa].filter(isRecord);

  if (series.length === 0) {
    return null;
  }

  return (
    <ComparisonChart
      ariaLabel="Efektywność ruchu płatnego: koszt, ROAS i koszt zakupu"
      className="pd-command-center-one-page__chart-surface"
      data={series.map((record) => ({
        id: record.metricId,
        label: shortenMetricLabel(record.label),
        values: {
          current: record.value,
        },
      }))}
      series={[{ key: 'current', label: 'Wynik' }]}
      unit=""
      valueFormatter={(value) => formatMetricValue(value, 'number')}
      variant="ranking"
    />
  );
}

function isRecord(
  record: CommandCenterRecord | null,
): record is CommandCenterRecord {
  return record !== null;
}

function buildLensItems(
  records: readonly CommandCenterRecord[],
): readonly {
  readonly disabled: boolean;
  readonly label: string;
  readonly value: string;
}[] {
  return commandLensDefinitions.map((lens: CommandLensDefinition) => ({
    disabled: !isCommandLensAvailable(lens, records),
    label: lens.label,
    value: lens.value,
  }));
}

export function CommandCenterRevenueCostsSection({
  activeLens,
  onLensChange,
  records,
  sourceRows,
}: {
  readonly activeLens: CommandLens;
  readonly onLensChange: (lens: CommandLens) => void;
  readonly records: readonly CommandCenterRecord[];
  readonly sourceRows: readonly DataRow[];
}) {
  const lens = findCommandLens(activeLens);
  const chart = buildLensChart(activeLens, records);

  return (
    <section
      aria-labelledby="command-center-sales-cost-title"
      className="pd-command-center-one-page__section"
    >
      <CommandSectionHeader
        eyebrow="Sprzedaż i koszty"
        title="Przychód vs koszty oraz mix źródeł"
        titleId="command-center-sales-cost-title"
      />

      <div className="pd-command-center-one-page__lens-switch">
        <SegmentedControl
          ariaLabel="Perspektywa analizy sprzedaży i kosztów"
          items={buildLensItems(records)}
          onValueChange={(value) => onLensChange(value as CommandLens)}
          size="compact"
          value={activeLens}
        />
        <p>{lens.question}</p>
      </div>

      <div className="pd-command-center-one-page__runtime-split">
        {chart ?? (
          <EmptyState
            message="Dla wybranej perspektywy brakuje metryk w bieżącym zakresie danych."
            title="Brak danych dla tej perspektywy"
            variant="empty"
          />
        )}
        {sourceRows.length > 0 ? (
          <CommandRuntimeSourceSummary rows={sourceRows} />
        ) : null}
      </div>
    </section>
  );
}
