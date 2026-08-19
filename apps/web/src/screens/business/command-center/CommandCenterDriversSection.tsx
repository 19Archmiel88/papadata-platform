import type {
  CommandCenterRecord,
} from '../../../../../../contracts/api-schemas';
import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  Button,
  CorrelationChart,
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
  CommandChartTableFallback,
  CommandRuntimeSourceSummary,
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import type {
  MetricRelationshipPoint,
} from './commandCenterOnePageModel';
import {
  buildMetricRelationshipPoints,
  findRecordById,
  formatMetricValue,
  openPapaAssistantForElement,
  resolveCorrelationCoefficient,
  resolveUnitLabel,
} from './commandCenterOnePageModel';

const driversElementId = 'command-sales-costs';
const relationshipPointCount = 8;

/**
 * Shared across both axes of the relationship charts — CorrelationChart
 * takes a single valueFormatter, so it must stay unit-agnostic. The unit
 * itself is carried in the axis label text instead.
 */
function formatRelationshipValue(value: number): string {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1 }).format(value);
}

function isRecord(
  record: CommandCenterRecord | null,
): record is CommandCenterRecord {
  return record !== null;
}

function resolveLensRecords(
  lens: CommandLens,
  records: readonly CommandCenterRecord[],
): readonly CommandCenterRecord[] {
  const ids = lens === 'cost'
    ? ['command-kpi-revenue', 'command-kpi-ad-cost']
    : lens === 'volume'
      ? ['command-kpi-orders', 'command-kpi-aov']
      : ['command-kpi-ad-cost', 'command-kpi-roas', 'command-kpi-cpa'];

  return ids
    .map((id) => findRecordById(records, id))
    .filter(isRecord);
}

function buildCostWaterfall(records: readonly CommandCenterRecord[]) {
  const revenue = findRecordById(records, 'command-kpi-revenue');
  const adCost = findRecordById(records, 'command-kpi-ad-cost');

  if (!revenue) {
    return null;
  }

  return (
    <WaterfallChart
      className="pd-command-center-one-page__chart-surface"
      items={[
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
      ]}
      showCumulative
      unit="PLN"
    />
  );
}

type RelationshipCopy = {
  readonly negative: string;
  readonly neutral: string;
  readonly positive: string;
};

/** |r| below this reads as "no meaningful pattern in this range", not a forced direction. */
const weakCorrelationThreshold = 0.15;

function resolveRelationshipInsight(
  correlation: number | null,
  copy: RelationshipCopy,
): string | null {
  if (correlation === null) {
    return null;
  }

  if (correlation >= weakCorrelationThreshold) {
    return copy.positive;
  }

  if (correlation <= -weakCorrelationThreshold) {
    return copy.negative;
  }

  return copy.neutral;
}

function buildRelationshipChart({
  ariaLabel,
  copy,
  points,
  xLabel,
  yLabel,
}: {
  readonly ariaLabel: string;
  readonly copy: RelationshipCopy;
  readonly points: readonly MetricRelationshipPoint[];
  readonly xLabel: string;
  readonly yLabel: string;
}) {
  const correlation = resolveCorrelationCoefficient(points);

  return (
    <CorrelationChart
      ariaLabel={ariaLabel}
      className="pd-command-center-one-page__chart-surface"
      correlation={correlation}
      driverHypothesis={resolveRelationshipInsight(correlation, copy)}
      points={points}
      trendline
      valueFormatter={formatRelationshipValue}
      variant="relationship"
      xLabel={xLabel}
      yLabel={yLabel}
    />
  );
}

function resolveAxisLabel(label: string, unit: CommandCenterRecord['unit']): string {
  const unitLabel = resolveUnitLabel(unit);

  return unitLabel ? `${label} (${unitLabel})` : label;
}

function buildVolumeCorrelation(records: readonly CommandCenterRecord[]) {
  const orders = findRecordById(records, 'command-kpi-orders');
  const aov = findRecordById(records, 'command-kpi-aov');

  if (!orders || !aov) {
    return null;
  }

  return buildRelationshipChart({
    ariaLabel: 'Zależność liczby zamówień i średniej wartości koszyka',
    copy: {
      negative: 'Wzrost liczby zamówień w tym zakresie obniża średni koszyk — wolumen rośnie kosztem jego wartości.',
      neutral: 'Wolumen zamówień i wartość koszyka zmieniają się w tym zakresie niezależnie od siebie.',
      positive: 'Więcej zamówień idzie w parze z wyższym koszykiem — wzrost napędzają razem wolumen i wartość koszyka.',
    },
    points: buildMetricRelationshipPoints(orders, aov, relationshipPointCount),
    xLabel: resolveAxisLabel('Zamówienia', orders.unit),
    yLabel: resolveAxisLabel('AOV', aov.unit),
  });
}

function buildEfficiencyCorrelation(records: readonly CommandCenterRecord[]) {
  const adCost = findRecordById(records, 'command-kpi-ad-cost');
  const roas = findRecordById(records, 'command-kpi-roas');

  if (!adCost || !roas) {
    return null;
  }

  return buildRelationshipChart({
    ariaLabel: 'Zależność kosztu mediów i zwrotu z reklam',
    copy: {
      negative: 'Wzrost kosztu mediów obniża ROAS w tym zakresie — typowy efekt malejących zwrotów przy skalowaniu wydatków.',
      neutral: 'ROAS pozostaje stabilny niezależnie od zmian kosztu mediów w tym zakresie.',
      positive: 'Koszt mediów i ROAS rosną razem — skalowanie wydatków nie psuje jeszcze efektywności.',
    },
    points: buildMetricRelationshipPoints(adCost, roas, relationshipPointCount),
    xLabel: resolveAxisLabel('Koszt mediów', adCost.unit),
    yLabel: resolveAxisLabel('ROAS', roas.unit),
  });
}

function buildLensVisualization(
  lens: CommandLens,
  records: readonly CommandCenterRecord[],
) {
  if (lens === 'cost') {
    return buildCostWaterfall(records);
  }

  if (lens === 'volume') {
    return buildVolumeCorrelation(records);
  }

  return buildEfficiencyCorrelation(records);
}

const metricLensTableColumns: readonly DataColumn[] = [
  { id: 'label', label: 'Metryka', sortable: true, width: 220 },
  { align: 'right', id: 'value', label: 'Wynik', sortable: true, width: 160 },
];

function buildMetricLensTableRows(
  lens: CommandLens,
  records: readonly CommandCenterRecord[],
): readonly DataRow[] {
  return resolveLensRecords(lens, records).map((record) => ({
    id: record.metricId,
    label: record.label,
    value: formatMetricValue(record.value, record.unit),
  }));
}

function buildRelationshipTableColumns(
  xLabel: string,
  yLabel: string,
): readonly DataColumn[] {
  return [
    { id: 'label', label: 'Punkt', sortable: true, width: 140 },
    { align: 'right', id: 'x', label: xLabel, sortable: true, width: 200 },
    { align: 'right', id: 'y', label: yLabel, sortable: true, width: 200 },
  ];
}

function buildRelationshipTableRows(
  points: readonly MetricRelationshipPoint[],
  xRecord: CommandCenterRecord,
  yRecord: CommandCenterRecord,
): readonly DataRow[] {
  return points.map((point) => ({
    id: point.id,
    label: point.label,
    x: formatMetricValue(point.x, xRecord.unit),
    y: formatMetricValue(point.y, yRecord.unit),
  }));
}

type LensTable = {
  readonly ariaLabel: string;
  readonly columns: readonly DataColumn[];
  readonly minWidth: number;
  readonly rows: readonly DataRow[];
  readonly sortColumnId: string;
};

function buildLensTable(
  lens: CommandLens,
  records: readonly CommandCenterRecord[],
): LensTable | null {
  if (lens === 'cost') {
    return {
      ariaLabel: 'Dane liczbowe dla perspektywy: Przychód vs koszty',
      columns: metricLensTableColumns,
      minWidth: 480,
      rows: buildMetricLensTableRows(lens, records),
      sortColumnId: 'value',
    };
  }

  const isVolume = lens === 'volume';
  const xRecord = findRecordById(records, isVolume ? 'command-kpi-orders' : 'command-kpi-ad-cost');
  const yRecord = findRecordById(records, isVolume ? 'command-kpi-aov' : 'command-kpi-roas');

  if (!xRecord || !yRecord) {
    return null;
  }

  return {
    ariaLabel: `Dane liczbowe dla perspektywy: ${isVolume ? 'Zamówienia vs AOV' : 'Koszt vs ROAS'}`,
    columns: buildRelationshipTableColumns(
      isVolume ? 'Zamówienia' : 'Koszt mediów',
      isVolume ? 'AOV' : 'ROAS',
    ),
    minWidth: 560,
    rows: buildRelationshipTableRows(
      buildMetricRelationshipPoints(xRecord, yRecord, relationshipPointCount),
      xRecord,
      yRecord,
    ),
    sortColumnId: 'x',
  };
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

export function CommandCenterDriversSection({
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
  const visualization = buildLensVisualization(activeLens, records);
  const table = buildLensTable(activeLens, records);

  return (
    <section
      aria-labelledby="command-center-sales-cost-title"
      className="pd-command-center-one-page__section"
    >
      <CommandSectionHeader
        actions={(
          <Button
            onClick={() => openPapaAssistantForElement(driversElementId)}
            size="small"
            variant="secondary"
          >
            Analizuj z Papą
          </Button>
        )}
        description="Trzy perspektywy na to, co napędza wynik. Metryki o różnych jednostkach nie są sztucznie rysowane na wspólnej osi."
        eyebrow="Drivery wyniku"
        title="Co napędza wynik"
        titleId="command-center-sales-cost-title"
      />

      <div className="pd-command-center-one-page__lens-switch">
        <SegmentedControl
          ariaLabel="Perspektywa analizy wyniku"
          items={buildLensItems(records)}
          onValueChange={(value) => onLensChange(value as CommandLens)}
          size="compact"
          value={activeLens}
        />
        <p>{lens.question}</p>
      </div>

      <div className="pd-command-center-one-page__runtime-split">
        <div className="pd-command-center-one-page__runtime-main-analysis">
          {visualization ?? (
            <EmptyState
              message="Dla wybranej perspektywy brakuje metryk w bieżącym zakresie danych."
              title="Brak danych dla tej perspektywy"
              variant="empty"
            />
          )}

          {table ? (
            <CommandChartTableFallback
              ariaLabel={table.ariaLabel}
              columns={table.columns}
              emptyMessage="Brak danych dla tej perspektywy."
              minWidth={table.minWidth}
              rows={table.rows}
              sortColumnId={table.sortColumnId}
            />
          ) : null}
        </div>

        {sourceRows.length > 0 ? (
          <CommandRuntimeSourceSummary
            id="command-section-traffic-sources"
            rows={sourceRows}
          />
        ) : null}
      </div>
    </section>
  );
}
