import type {
  CommandCenterRecord,
  DriverDecompositionView,
  DriverRelationshipPointView,
  DriverRelationshipView,
  DriverRelationships,
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
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  findRecordById,
  formatMetricValue,
  openPapaAssistantForElement,
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

const currencyFormatter = new Intl.NumberFormat('pl-PL', {
  currency: 'PLN',
  maximumFractionDigits: 0,
  style: 'currency',
});

/**
 * Marginal response computed client-side from the same real (x, y) pairs the
 * chart plots — first half of the window vs. second half, both real spend
 * and real attributed-revenue observations. This is deliberately never sent
 * as its own backend field: it is exactly derivable from `points`, so
 * computing it here can never disagree with what's drawn.
 */
function resolveMarginalResponse(points: readonly DriverRelationshipPointView[]): number | null {
  if (points.length < 4) {
    return null;
  }

  const half = Math.floor(points.length / 2);
  const firstHalf = points.slice(0, half);
  const secondHalf = points.slice(half);
  const average = (values: readonly number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const deltaX = average(secondHalf.map((point) => point.x)) - average(firstHalf.map((point) => point.x));
  const deltaY = average(secondHalf.map((point) => point.y)) - average(firstHalf.map((point) => point.y));

  return deltaX === 0 ? null : deltaY / deltaX;
}

/**
 * When the backend has enough real paired observations, this reads the
 * Pearson coefficient's direction. Otherwise it reports insufficient data
 * without inventing a replacement statistic. Never phrased as one metric
 * "causing" the other — correlation is not a causal claim.
 */
function resolveRelationshipInsight(
  relationship: DriverRelationshipView,
  copy: RelationshipCopy,
): string {
  if (relationship.basis === 'insufficient-data') {
    return `Za mało realnych, sparowanych obserwacji lub zbyt małe zróżnicowanie danych (n=${relationship.sampleSize}), żeby wiarygodnie policzyć korelację. Pokazujemy wyłącznie realne punkty, bez zastępczego wskaźnika.`;
  }

  const correlation = relationship.coefficient ?? 0;
  const marginal = resolveMarginalResponse(relationship.points);
  const marginalNote = marginal === null
    ? ''
    : ` Krańcowo w tym oknie (druga połowa vs. pierwsza): +1 PLN wydatku ≈ ${currencyFormatter.format(marginal)} przychodu z reklam.`;

  if (correlation >= weakCorrelationThreshold) {
    return `${copy.positive}${marginalNote}`;
  }

  if (correlation <= -weakCorrelationThreshold) {
    return `${copy.negative}${marginalNote}`;
  }

  return `${copy.neutral}${marginalNote}`;
}

function buildRelationshipChart({
  ariaLabel,
  copy,
  relationship,
}: {
  readonly ariaLabel: string;
  readonly copy: RelationshipCopy;
  readonly relationship: DriverRelationshipView;
}) {
  const isCorrelation = relationship.basis === 'correlation';

  return (
    <CorrelationChart
      ariaLabel={ariaLabel}
      className="pd-command-center-one-page__chart-surface"
      correlation={isCorrelation ? relationship.coefficient : null}
      driverHypothesis={resolveRelationshipInsight(relationship, copy)}
      points={relationship.points}
      trendline={isCorrelation}
      valueFormatter={formatRelationshipValue}
      variant="relationship"
      xLabel={relationship.xLabel}
      yLabel={relationship.yLabel}
    />
  );
}

/**
 * Orders x AOV decomposition, rendered the same way as the cost lens's
 * revenue waterfall: start value, the two effects (each an increase or a
 * decrease depending on sign), and the end value as a running total. This
 * replaces a scatter/correlation view on purpose — see
 * command-center-metrics.contract-data.ts for why correlating orders
 * against AOV directly would have been statistically spurious.
 */
function buildVolumeWaterfall(driverRelationships: DriverRelationships | null) {
  if (!driverRelationships) {
    return null;
  }

  const decomposition = driverRelationships.volume;

  if (decomposition.sampleSize === 0) {
    return null;
  }

  return (
    <WaterfallChart
      className="pd-command-center-one-page__chart-surface"
      items={[
        {
          id: 'start',
          kind: 'start' as const,
          label: 'Przychód (I połowa okresu)',
          value: decomposition.startValue,
        },
        {
          id: 'volume',
          kind: decomposition.volumeEffect >= 0 ? 'increase' as const : 'decrease' as const,
          label: `Wpływ: ${decomposition.volumeLabel}`,
          value: decomposition.volumeEffect,
        },
        {
          id: 'price',
          kind: decomposition.priceEffect >= 0 ? 'increase' as const : 'decrease' as const,
          label: `Wpływ: ${decomposition.priceLabel}`,
          value: decomposition.priceEffect,
        },
        {
          id: 'end',
          kind: 'total' as const,
          label: 'Przychód (II połowa okresu)',
          value: decomposition.endValue,
        },
      ]}
      showCumulative
      unit="PLN"
    />
  );
}

function buildEfficiencyCorrelation(driverRelationships: DriverRelationships | null) {
  if (!driverRelationships) {
    return null;
  }

  return buildRelationshipChart({
    ariaLabel: 'Zależność kosztu mediów i przychodu przypisanego reklamom',
    copy: {
      negative: 'Wzrost kosztu mediów idzie w parze ze spadkiem przychodu przypisanego reklamom w tym zakresie.',
      neutral: 'Przychód przypisany reklamom zmienia się w tym zakresie niezależnie od kosztu mediów.',
      positive: 'Koszt mediów i przychód przypisany reklamom rosną razem w tym zakresie.',
    },
    relationship: driverRelationships.efficiency,
  });
}

function buildLensVisualization(
  lens: CommandLens,
  records: readonly CommandCenterRecord[],
  driverRelationships: DriverRelationships | null,
) {
  if (lens === 'cost') {
    return buildCostWaterfall(records);
  }

  if (lens === 'volume') {
    return buildVolumeWaterfall(driverRelationships);
  }

  return buildEfficiencyCorrelation(driverRelationships);
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

/** Rows built from the exact same `points` the chart plots — a real tabular alternative, never resampled separately. */
function buildRelationshipTableRows(
  points: readonly DriverRelationshipPointView[],
): readonly DataRow[] {
  return points.map((point) => ({
    id: point.id,
    label: point.label,
    x: formatRelationshipValue(point.x),
    y: formatRelationshipValue(point.y),
  }));
}

const decompositionTableColumns: readonly DataColumn[] = [
  { id: 'label', label: 'Krok', sortable: false, width: 220 },
  { align: 'right', id: 'value', label: 'Wartość', sortable: false, width: 180 },
];

/** Rows built from the exact same four figures the waterfall plots. */
function buildDecompositionTableRows(
  decomposition: DriverDecompositionView,
): readonly DataRow[] {
  return [
    { id: 'start', label: 'Przychód (I połowa okresu)', value: currencyFormatter.format(decomposition.startValue) },
    { id: 'volume', label: `Wpływ: ${decomposition.volumeLabel}`, value: currencyFormatter.format(decomposition.volumeEffect) },
    { id: 'price', label: `Wpływ: ${decomposition.priceLabel}`, value: currencyFormatter.format(decomposition.priceEffect) },
    { id: 'end', label: 'Przychód (II połowa okresu)', value: currencyFormatter.format(decomposition.endValue) },
  ];
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
  driverRelationships: DriverRelationships | null,
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

  if (!driverRelationships) {
    return null;
  }

  if (lens === 'volume') {
    return {
      ariaLabel: 'Dane liczbowe dla perspektywy: Zamówienia vs AOV',
      columns: decompositionTableColumns,
      minWidth: 420,
      rows: buildDecompositionTableRows(driverRelationships.volume),
      sortColumnId: 'label',
    };
  }

  const relationship = driverRelationships.efficiency;

  return {
    ariaLabel: 'Dane liczbowe dla perspektywy: Koszt vs przychód z reklam',
    columns: buildRelationshipTableColumns(relationship.xLabel, relationship.yLabel),
    minWidth: 560,
    rows: buildRelationshipTableRows(relationship.points),
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
  driverRelationships,
  onLensChange,
  records,
}: {
  readonly activeLens: CommandLens;
  readonly driverRelationships: DriverRelationships | null;
  readonly onLensChange: (lens: CommandLens) => void;
  readonly records: readonly CommandCenterRecord[];
}) {
  const lens = findCommandLens(activeLens);
  const visualization = buildLensVisualization(activeLens, records, driverRelationships);
  const table = buildLensTable(activeLens, records, driverRelationships);

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
    </section>
  );
}
