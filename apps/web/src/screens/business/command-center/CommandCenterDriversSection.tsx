import type {
  CommandCenterRecord,
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
  CommandRuntimeSourceSummary,
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

const contributionSharePercentFormatter = new Intl.NumberFormat('pl-PL', {
  maximumFractionDigits: 0,
  style: 'percent',
});

/**
 * When the backend had enough real paired history to correlate, this reads
 * the real coefficient's direction. When it didn't (basis ===
 * 'contribution-share'), it never guesses a direction — it says so
 * explicitly and reports the simpler, honestly-labeled deterministic
 * indicator instead (see command-center-metrics.contract-data.ts on the
 * backend for how that fallback is computed).
 */
function resolveRelationshipInsight(
  relationship: DriverRelationshipView,
  copy: RelationshipCopy,
): string {
  if (relationship.basis === 'contribution-share') {
    const share = contributionSharePercentFormatter.format(relationship.contributionShare ?? 0);

    return `Za mało realnego zróżnicowania w tym oknie (n=${relationship.sampleSize}), żeby policzyć korelację. Prostszy wskaźnik: ${relationship.yLabel} odpowiada za ${share} łącznej zmiany obu metryk.`;
  }

  const correlation = relationship.coefficient ?? 0;

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

function buildVolumeCorrelation(driverRelationships: DriverRelationships | null) {
  if (!driverRelationships) {
    return null;
  }

  return buildRelationshipChart({
    ariaLabel: 'Zależność liczby zamówień i średniej wartości koszyka',
    copy: {
      negative: 'Wzrost liczby zamówień w tym zakresie obniża średni koszyk — wolumen rośnie kosztem jego wartości.',
      neutral: 'Wolumen zamówień i wartość koszyka zmieniają się w tym zakresie niezależnie od siebie.',
      positive: 'Więcej zamówień idzie w parze z wyższym koszykiem — wzrost napędzają razem wolumen i wartość koszyka.',
    },
    relationship: driverRelationships.volume,
  });
}

function buildEfficiencyCorrelation(driverRelationships: DriverRelationships | null) {
  if (!driverRelationships) {
    return null;
  }

  return buildRelationshipChart({
    ariaLabel: 'Zależność kosztu mediów i zwrotu z reklam',
    copy: {
      negative: 'Wzrost kosztu mediów obniża ROAS w tym zakresie — typowy efekt malejących zwrotów przy skalowaniu wydatków.',
      neutral: 'ROAS pozostaje stabilny niezależnie od zmian kosztu mediów w tym zakresie.',
      positive: 'Koszt mediów i ROAS rosną razem — skalowanie wydatków nie psuje jeszcze efektywności.',
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
    return buildVolumeCorrelation(driverRelationships);
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

  const isVolume = lens === 'volume';
  const relationship = isVolume ? driverRelationships.volume : driverRelationships.efficiency;

  return {
    ariaLabel: `Dane liczbowe dla perspektywy: ${isVolume ? 'Zamówienia vs AOV' : 'Koszt vs ROAS'}`,
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
  sourceRows,
}: {
  readonly activeLens: CommandLens;
  readonly driverRelationships: DriverRelationships | null;
  readonly onLensChange: (lens: CommandLens) => void;
  readonly records: readonly CommandCenterRecord[];
  readonly sourceRows: readonly DataRow[];
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
