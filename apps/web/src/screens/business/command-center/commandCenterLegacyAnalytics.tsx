import { useState } from 'react';
import type {
  CommandCenterRecord,
} from '../../../../../../contracts/api-schemas';
import type {
  DataRow,
} from '../../../../../../contracts/component-shared';
import type {
  DateRange,
} from '../../../../../../contracts/ui-contract-types';
import {
  ChartFrame,
  ChartInteractionLayer,
  ComparisonChart,
  DataTable,
  TrendChart,
} from '../../../design-system';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import type {
  ChartInteractionPoint,
} from '../../../design-system/components/ChartInteractionLayer';
import type {
  TrendChartDatum,
} from '../../../design-system/components/TrendChart';
import { formatShellDateRangeLabel } from '../../../shell/app-shell';
import type {
  BusinessScreenData,
  BusinessScreenDefinition,
} from '../businessData';
import {
  attentionWeight,
  clampMetricValue,
  getRecordContext,
  interpolateNumber,
  isLowerBetterMetric,
  isMetricWorse,
  normalizeLabel,
  openPapaAssistantWithScreenAnalysis,
  resolveMetricRiskLabel,
  resolveMetricSourceLabel,
} from './commandCenterOnePageModel';
import {
  formatMetricValue,
  formatShortTime,
  formatSignedPercent,
  mapReadinessToAnalyticsState,
  resolveDataStateLabel,
  resolveReadinessLabel,
  resolveUnitLabel,
} from '../commandCenterWorkspaceFormatters';
import { CommandSectionHeader } from './commandCenterLegacyVariants';

type CommandCenterData = Extract<
  BusinessScreenData,
  { readonly group: 'command-center' }
>;

type CommandAiSignal = {
  readonly description: string;
  readonly evidence: string;
  readonly id: string;
  readonly label: string;
  readonly severity: 'critical' | 'info' | 'success' | 'warning';
  readonly status: string;
};

const trendColumns = [
  { id: 'label', label: 'Punkt', sortable: true, width: 140 },
  { align: 'right', id: 'actual', label: 'Wynik', sortable: true, width: 150 },
  { align: 'right', id: 'plan', label: 'Plan', sortable: true, width: 150 },
  { align: 'right', id: 'previousPeriod', label: 'Poprzedni okres', sortable: true, width: 170 },
  { align: 'right', id: 'movingAverage', label: 'Średnia', sortable: true, width: 150 },
  { id: 'analysis', label: 'Status AI', width: 230 },
] as const;

const impactColumns = [
  { id: 'label', label: 'KPI', sortable: true, width: 240 },
  { align: 'right', id: 'impact', label: 'Odchylenie', sortable: true, width: 140 },
  { id: 'status', label: 'Status AI', sortable: true, width: 180 },
  { id: 'recommendation', label: 'Rekomendacja', width: 340 },
] as const;

/**
 * The legacy storybook-mode Command Center screens (30.02-30.14) have no
 * real day-by-day history to plot — the API contract only carries a current
 * value/delta/target per record. This synthesizes a plausible trend curve
 * from that single point (wave + anomaly-window shift) purely so the
 * `TrendChart`/mini-sparkline visuals have something to render in that
 * fixture-driven view. It must never be mistaken for real history: the
 * modern runtime path (CommandCenterOnePage) does not use this — its KPI
 * sparklines and Plan vs Benchmark trajectory come from the real backend
 * daily series (see contract-runtime's computeMetricEngineSeries).
 */
export function buildLegacyDemoTrendData(
  record: CommandCenterRecord,
  range: DateRange,
  variant: BusinessScreenDefinition['variant'],
  requestedPointCount?: number,
): readonly TrendChartDatum[] {
  const pointCount = requestedPointCount
    ?? resolveTrendPointCount(range);
  const labels = buildTrendLabels(
    range,
    pointCount,
  );
  const aggregateMetric = shouldRenderCumulativeTrend(record);
  const lowerIsBetter = isLowerBetterMetric(record);
  const finalValue = record.value;
  const finalTarget = record.target;
  const delta = record.delta ?? 0;
  const safeDeltaBase = Math.max(0.22, 1 + delta);
  const comparisonBase = finalValue / safeDeltaBase;
  const startRatio = aggregateMetric
    ? 0.08
    : 1;
  const startValue = aggregateMetric
    ? finalValue * startRatio
    : comparisonBase;
  const planStart = finalTarget === null
    ? null
    : aggregateMetric
      ? finalTarget * startRatio
      : finalTarget;
  const amplitude = resolveTrendAmplitude(record);
  const actualValues: number[] = [];

  return labels.map((label, index) => {
    const ratio = pointCount <= 1
      ? 1
      : index / (pointCount - 1);
    const curveRatio = aggregateMetric
      ? Math.pow(ratio, 1.05)
      : ratio;
    const plan = finalTarget === null
      ? null
      : aggregateMetric
        ? interpolateNumber(planStart ?? 0, finalTarget, curveRatio)
        : finalTarget;
    const baseActual = aggregateMetric
      ? interpolateNumber(startValue, finalValue, curveRatio)
      : interpolateNumber(startValue, finalValue, ratio);
    const wave = (
      Math.sin((index + 1) * 1.43 + variant.length * 0.13)
      + Math.cos((index + 2) * 0.71)
    ) * amplitude;
    const anomalyShift = resolveTrendAnomalyShift({
      lowerIsBetter,
      record,
      ratio,
    });
    const actual = index === pointCount - 1
      ? finalValue
      : clampMetricValue(
          baseActual + wave + anomalyShift,
          record.unit,
        );
    const previousPeriod = clampMetricValue(
      actual * resolvePreviousPeriodFactor(delta),
      record.unit,
    );

    actualValues.push(actual);

    return {
      actual,
      label,
      movingAverage: resolveMovingAverage(actualValues),
      plan,
      previousPeriod,
    };
  });
}

/** Same synthesized-history technique as {@link buildLegacyDemoTrendData}, reduced to bare values for MetricCard's sparkline. */
export function buildLegacyDemoSparklinePoints(
  record: CommandCenterRecord,
  pointCount: number,
): readonly number[] {
  return buildLegacyDemoTrendData(
    record,
    resolveWorkspaceDateRange(undefined),
    'kpi',
    pointCount,
  )
    .map((datum) => datum.actual)
    .filter((value): value is number => typeof value === 'number');
}

export function chooseAnalyticRecords(
  records: readonly CommandCenterRecord[],
  variant: BusinessScreenDefinition['variant'],
): readonly CommandCenterRecord[] {
  const relevant = records.filter((record) => (
    record.delta !== null
    || record.target !== null
    || record.readiness !== 'ready'
  ));

  return [...(relevant.length > 0 ? relevant : records)]
    .sort((left, right) => {
      const priorityDelta = attentionWeight(right) - attentionWeight(left);

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      const leftContext = getRecordContext(left, variant);
      const rightContext = getRecordContext(right, variant);

      return resolvePriorityScore(rightContext.priority)
        - resolvePriorityScore(leftContext.priority);
    })
    .slice(0, 6);
}

export function CommandAnalyticsSection({
  data,
  dataState,
  definition,
  workspaceContext,
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
  readonly definition: BusinessScreenDefinition;
  readonly workspaceContext: { readonly range?: DateRange };
}) {
  const focusRecords = chooseAnalyticRecords(
    data.records,
    definition.variant,
  );

  if (focusRecords.length === 0) {
    return null;
  }

  const primaryRecord = focusRecords[0];

  if (!primaryRecord) {
    return null;
  }

  return (
    <section
      aria-labelledby="command-center-analytics-title"
      className="pd-command-center-workspace__section pd-command-center-workspace__analytics-section"
    >
      <CommandSectionHeader
        eyebrow="Analiza"
        title="Trend, zoom i statusy AI"
        trailing={`${focusRecords.length} KPI w analizie`}
        titleId="command-center-analytics-title"
      />

      <div className="pd-command-center-workspace__analytics-grid">
        <CommandTrendAnalysisFrame
          data={data}
          dataState={dataState}
          definition={definition}
          record={primaryRecord}
          workspaceContext={workspaceContext}
        />

        <CommandImpactAnalysisFrame
          dataState={dataState}
          definition={definition}
          records={focusRecords}
          workspaceContext={workspaceContext}
        />
      </div>

      <CommandAiSignalBoard
        definition={definition}
        records={focusRecords}
      />
    </section>
  );
}

function CommandTrendAnalysisFrame({
  data,
  dataState,
  definition,
  record,
  workspaceContext,
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
  readonly definition: BusinessScreenDefinition;
  readonly record: CommandCenterRecord;
  readonly workspaceContext: { readonly range?: DateRange };
}) {
  const range = resolveWorkspaceDateRange(workspaceContext.range);
  const rangeLabel = formatShellDateRangeLabel(range);
  const trendData = buildLegacyDemoTrendData(
    record,
    range,
    definition.variant,
  );
  const trendRows = buildTrendRows(
    trendData,
    record.unit,
  );
  const chartStatus = record.readiness === 'ready'
    ? dataState
    : mapReadinessToAnalyticsState(record.readiness);

  return (
    <ChartFrame
      alternativeTable={(
        <DataTable
          ariaLabel={`Tabela trendu: ${record.label}`}
          columns={[...trendColumns]}
          density="compact"
          emptyMessage="Brak punktów trendu."
          loading={false}
          minWidth={760}
          rowCount={trendRows.length}
          rows={trendRows}
          selectedRowIds={[]}
          sort={null}
        />
      )}
      alternativeTableLabel="Dane trendu"
      businessQuestion="Co zmieniło się w zakresie"
      className="pd-command-center-workspace__analysis-frame"
      description="Trend reaguje na szybki zakres dat i wskazuje plan, poprzedni okres oraz średnią kroczącą."
      freshnessLabel={formatShortTime(data.generatedAt)}
      papaAction={{
        label: 'Analizuj ekran',
        onAction: openPapaAssistantWithScreenAnalysis,
      }}
      rangeLabel={rangeLabel}
      sourceLabel={resolveMetricSourceLabel(record)}
      status={chartStatus}
      statusLabel={resolveReadinessLabel(record.readiness)}
      summary={(
        <CommandPapaTrendSummary
          record={record}
          trendData={trendData}
        />
      )}
      title={`Trend: ${record.label}`}
      visualization={(
        <CommandInteractiveTrend
          data={trendData}
          definition={definition}
          record={record}
          rangeLabel={rangeLabel}
        />
      )}
      visualizationLabel={`Interaktywny trend KPI ${record.label}`}
    />
  );
}

function CommandImpactAnalysisFrame({
  dataState,
  definition,
  records,
  workspaceContext,
}: {
  readonly dataState: AnalyticsDataState;
  readonly definition: BusinessScreenDefinition;
  readonly records: readonly CommandCenterRecord[];
  readonly workspaceContext: { readonly range?: DateRange };
}) {
  const range = resolveWorkspaceDateRange(workspaceContext.range);
  const comparable = records
    .filter((record) => record.delta !== null)
    .slice(0, 8);
  const rankingRows = buildImpactRows(comparable);

  return (
    <ChartFrame
      alternativeTable={(
        <DataTable
          ariaLabel="Tabela wpływu i ryzyka KPI"
          columns={[...impactColumns]}
          density="compact"
          emptyMessage="Brak metryk z policzoną zmianą."
          loading={false}
          minWidth={860}
          rowCount={rankingRows.length}
          rows={rankingRows}
          selectedRowIds={[]}
          sort={null}
        />
      )}
      alternativeTableLabel="Dane wpływu"
      businessQuestion="Które KPI wymagają uwagi"
      className="pd-command-center-workspace__analysis-frame"
      description="Ranking słupkowy pokazuje skalę odchylenia, a status AI rozróżnia anomalię, spadek i ryzyko danych."
      freshnessLabel="ciągła kontrola"
      papaAction={{
        label: 'Wyjaśnij ranking',
        onAction: openPapaAssistantWithScreenAnalysis,
      }}
      rangeLabel={formatShellDateRangeLabel(range)}
      sourceLabel="PapaData analytics"
      status={dataState}
      statusLabel={resolveDataStateLabel(dataState)}
      summary={(
        <CommandPapaImpactSummary
          definition={definition}
          records={records}
        />
      )}
      title="Ranking wpływu i ryzyka"
      visualization={(
        comparable.length > 0 ? (
          <ComparisonChart
            ariaLabel="Ranking wpływu KPI"
            benchmark={{
              label: 'próg uwagi',
              value: 8,
            }}
            data={comparable.map((record) => ({
              id: record.metricId,
              label: truncateChartLabel(record.label),
              values: {
                impact: Math.round(Math.abs(record.delta ?? 0) * 1000) / 10,
              },
            }))}
            series={[
              {
                key: 'impact',
                label: 'Odchylenie',
              },
            ]}
            unit="%"
            valueFormatter={formatImpactPercentPoint}
            variant="ranking"
          />
        ) : null
      )}
      visualizationLabel="Słupkowy ranking wpływu KPI"
    />
  );
}

function CommandInteractiveTrend({
  data,
  definition,
  rangeLabel,
  record,
}: {
  readonly data: readonly TrendChartDatum[];
  readonly definition: BusinessScreenDefinition;
  readonly rangeLabel: string;
  readonly record: CommandCenterRecord;
}) {
  const basePointId = data[data.length - 1]?.label ?? 'latest';
  const [activeFilterId, setActiveFilterId] = useState('full');
  const [selectedPointId, setSelectedPointId] = useState(basePointId);
  const visibleData = filterTrendData(
    data,
    activeFilterId,
    record,
  );
  const points = buildTrendInteractionPoints(
    visibleData,
    record,
  );
  const selectedPoint = points.find((point) => point.id === selectedPointId)
    ?? points[points.length - 1]
    ?? null;

  return (
    <ChartInteractionLayer
      activeFilterId={activeFilterId}
      dateRangeLabel={rangeLabel}
      description="Najedź lub przejdź fokusem po punktach analizy, żeby zobaczyć komentarz Papa Asystenta."
      filters={[
        {
          description: 'Pełny zakres danych wykresu',
          id: 'full',
          label: 'Pełny zakres',
        },
        {
          description: 'Zoom na ostatnie punkty bieżącego zakresu',
          id: 'zoom',
          label: 'Zoom',
        },
        {
          description: 'Punkty ze spadkiem, anomalią albo ryzykiem danych',
          id: 'risk',
          label: 'Ryzyka AI',
        },
      ]}
      onDrillDown={() => openPapaAssistantWithScreenAnalysis()}
      onFilterChange={(filterId) => {
        setActiveFilterId(filterId);
        const nextData = filterTrendData(
          data,
          filterId,
          record,
        );
        setSelectedPointId(nextData[nextData.length - 1]?.label ?? basePointId);
      }}
      onPointSelect={setSelectedPointId}
      onReset={() => {
        setActiveFilterId('full');
        setSelectedPointId(basePointId);
      }}
      points={points}
      selectedPointId={selectedPoint?.id ?? basePointId}
      title={`Zoom i punkty analizy ${definition.displayTitle}`}
    >
      <TrendChart
        ariaLabel={`Trend ${record.label}`}
        data={visibleData}
        unit={resolveUnitLabel(record.unit)}
        valueFormatter={(value) => formatMetricValue(value, record.unit)}
        variant={record.readiness === 'ready' ? 'area' : 'line'}
      />
    </ChartInteractionLayer>
  );
}

function CommandAiSignalBoard({
  definition,
  records,
}: {
  readonly definition: BusinessScreenDefinition;
  readonly records: readonly CommandCenterRecord[];
}) {
  const signals = records
    .slice(0, 6)
    .map((record) => buildAiSignal(record, definition.variant));

  return (
    <div
      aria-label="Statusy AI dla metryk Centrum Dowodzenia"
      className="pd-command-center-workspace__ai-signal-board"
    >
      {signals.map((signal) => (
        <article
          data-severity={signal.severity}
          key={signal.id}
        >
          <header>
            <span>{signal.status}</span>
            <strong>{signal.label}</strong>
          </header>
          <p>{signal.description}</p>
          <small>{signal.evidence}</small>
        </article>
      ))}
    </div>
  );
}

function CommandPapaTrendSummary({
  record,
  trendData,
}: {
  readonly record: CommandCenterRecord;
  readonly trendData: readonly TrendChartDatum[];
}) {
  const last = trendData[trendData.length - 1];
  const previous = trendData[trendData.length - 2];
  const movement = last?.actual != null && previous?.actual != null
    ? last.actual - previous.actual
    : 0;
  const trendLabel = movement < 0
    ? 'spadek w ostatnim punkcie'
    : movement > 0
      ? 'wzrost w ostatnim punkcie'
      : 'stabilizacja';

  return (
    <div className="pd-command-center-workspace__papa-summary">
      <strong>{resolveMetricRiskLabel(record) ?? `AI widzi ${trendLabel}.`}</strong>
      <p>{getRecordContext(record, 'kpi').diagnosis}</p>
    </div>
  );
}

function CommandPapaImpactSummary({
  definition,
  records,
}: {
  readonly definition: BusinessScreenDefinition;
  readonly records: readonly CommandCenterRecord[];
}) {
  const risky = records.filter((record) => (
    isMetricWorse(record)
    || record.readiness !== 'ready'
  ));
  const firstRisk = risky[0] ?? records[0] ?? null;

  return (
    <div className="pd-command-center-workspace__papa-summary">
      <strong>
        {firstRisk
          ? getRecordContext(firstRisk, definition.variant).nextAction
          : 'Brak eskalacji w bieżącym zakresie.'}
      </strong>
      <p>
        Papa Asystent porównuje odchylenie, stan danych i właściciela decyzji,
        żeby odróżnić zwykły wzrost od anomalii wymagającej reakcji.
      </p>
    </div>
  );
}

function buildTrendRows(
  data: readonly TrendChartDatum[],
  unit: CommandCenterRecord['unit'],
): readonly DataRow[] {
  return data.map((datum) => ({
    actual: datum.actual === null
      ? '—'
      : formatMetricValue(datum.actual, unit),
    analysis: resolveTrendPointAnalysis(datum, unit),
    id: datum.label,
    label: datum.label,
    movingAverage: datum.movingAverage === null || datum.movingAverage === undefined
      ? '—'
      : formatMetricValue(datum.movingAverage, unit),
    plan: datum.plan === null || datum.plan === undefined
      ? '—'
      : formatMetricValue(datum.plan, unit),
    previousPeriod: datum.previousPeriod === null || datum.previousPeriod === undefined
      ? '—'
      : formatMetricValue(datum.previousPeriod, unit),
  }));
}

function buildImpactRows(
  records: readonly CommandCenterRecord[],
): readonly DataRow[] {
  return records.map((record) => {
    const signal = buildAiSignal(record, 'kpi');

    return {
      id: record.metricId,
      impact: record.delta === null
        ? '—'
        : formatSignedPercent(record.delta),
      label: record.label,
      recommendation: getRecordContext(record, 'kpi').nextAction,
      status: signal.status,
    };
  });
}

function buildTrendInteractionPoints(
  data: readonly TrendChartDatum[],
  record: CommandCenterRecord,
): readonly ChartInteractionPoint[] {
  return data.map((datum) => {
    const actual = datum.actual ?? 0;
    const plan = datum.plan ?? null;
    const hasRisk = plan !== null
      && isTrendPointAgainstPlan(
        actual,
        plan,
        record,
      );

    return {
      detail: hasRisk
        ? `${record.label}: punkt odbiega od planu. ${getRecordContext(record, 'kpi').nextAction}.`
        : `${record.label}: punkt mieści się w oczekiwanym rytmie dla wybranego zakresu.`,
      drillDownLabel: 'Analizuj z Papa',
      filterId: hasRisk ? 'risk' : 'full',
      id: datum.label,
      label: datum.label,
      seriesLabel: record.label,
      valueLabel: formatMetricValue(actual, record.unit),
    };
  });
}

function filterTrendData(
  data: readonly TrendChartDatum[],
  filterId: string,
  record: CommandCenterRecord,
): readonly TrendChartDatum[] {
  if (filterId === 'zoom') {
    return data.slice(-Math.min(7, data.length));
  }

  if (filterId === 'risk') {
    const riskData = data.filter((datum) => (
      datum.actual !== null
      && datum.plan !== null
      && datum.plan !== undefined
      && isTrendPointAgainstPlan(
        datum.actual,
        datum.plan,
        record,
      )
    ));

    return riskData.length >= 2
      ? riskData
      : data.slice(-Math.min(7, data.length));
  }

  return data;
}

function buildAiSignal(
  record: CommandCenterRecord,
  variant: BusinessScreenDefinition['variant'],
): CommandAiSignal {
  const context = getRecordContext(record, variant);
  const delta = record.delta ?? 0;

  if (record.readiness === 'unavailable') {
    return {
      description: 'Brakuje źródła lub odczyt jest zablokowany, więc AI nie powinno automatyzować decyzji.',
      evidence: context.evidenceLabel,
      id: `${record.metricId}-ai-blocked`,
      label: record.label,
      severity: 'critical',
      status: 'Ryzyko danych',
    };
  }

  if (record.readiness === 'stale' || record.readiness === 'partial') {
    return {
      description: `${context.nextAction}. Interpretacja wyniku jest ograniczona przez stan danych.`,
      evidence: context.evidenceLabel,
      id: `${record.metricId}-ai-data-risk`,
      label: record.label,
      severity: 'warning',
      status: record.readiness === 'stale'
        ? 'Nieświeże dane'
        : 'Częściowe dane',
    };
  }

  if (isMetricWorse(record)) {
    return {
      description: `${context.diagnosis} Papa rekomenduje reakcję: ${context.nextAction}.`,
      evidence: context.evidenceLabel,
      id: `${record.metricId}-ai-drop`,
      label: record.label,
      severity: 'warning',
      status: 'Spadek / anomalia',
    };
  }

  if (Math.abs(delta) >= 0.15) {
    return {
      description: 'Zmiana jest większa niż zwykły próg obserwacji; warto potwierdzić źródło i wpływ.',
      evidence: context.evidenceLabel,
      id: `${record.metricId}-ai-anomaly`,
      label: record.label,
      severity: 'info',
      status: 'Anomalia wzrostu',
    };
  }

  return {
    description: `${context.nextAction}. Brak pilnej eskalacji w bieżącym zakresie.`,
    evidence: context.evidenceLabel,
    id: `${record.metricId}-ai-stable`,
    label: record.label,
    severity: 'success',
    status: 'Stabilne',
  };
}

function resolveTrendPointAnalysis(
  datum: TrendChartDatum,
  unit: CommandCenterRecord['unit'],
): string {
  if (datum.actual === null) {
    return 'brak wyniku';
  }

  if (datum.plan !== null && datum.plan !== undefined) {
    const distance = datum.actual - datum.plan;
    const absolute = Math.abs(distance);
    const threshold = Math.max(Math.abs(datum.plan) * 0.04, 0.01);

    if (absolute >= threshold) {
      return distance < 0
        ? `poniżej planu o ${formatMetricValue(absolute, unit)}`
        : `powyżej planu o ${formatMetricValue(absolute, unit)}`;
    }
  }

  return 'w rytmie zakresu';
}

function resolveTrendPointCount(
  range: DateRange,
): number {
  const days = getCommandDateRangeDayCount(range);

  if (days <= 1) {
    return 8;
  }

  if (days <= 7) {
    return Math.max(days, 4);
  }

  if (days <= 30) {
    return 16;
  }

  return 24;
}

function buildTrendLabels(
  range: DateRange,
  pointCount: number,
): readonly string[] {
  const days = getCommandDateRangeDayCount(range);

  if (days <= 1) {
    return Array.from({ length: pointCount }, (_item, index) => {
      const hour = Math.round((index / Math.max(pointCount - 1, 1)) * 23);

      return `${String(hour).padStart(2, '0')}:00`;
    });
  }

  const from = parseCommandDate(range.from)
    ?? new Date(`${commandFallbackDateRange.from}T00:00:00.000Z`);
  const to = parseCommandDate(range.to)
    ?? new Date(`${commandFallbackDateRange.to}T00:00:00.000Z`);
  const span = Math.max(to.getTime() - from.getTime(), 0);

  return Array.from({ length: pointCount }, (_item, index) => {
    const ratio = pointCount <= 1
      ? 1
      : index / (pointCount - 1);
    const date = new Date(from.getTime() + span * ratio);

    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      timeZone: range.timezone,
    }).format(date);
  });
}

function getCommandDateRangeDayCount(
  range: DateRange,
): number {
  const from = parseCommandDate(range.from);
  const to = parseCommandDate(range.to);

  if (!from || !to) {
    switch (range.preset) {
      case 'last90d':
        return 90;
      case 'last30d':
        return 30;
      case 'last7d':
        return 7;
      case 'today':
      default:
        return 1;
    }
  }

  const dayMs = 24 * 60 * 60 * 1_000;

  return Math.max(
    Math.round((to.getTime() - from.getTime()) / dayMs) + 1,
    1,
  );
}

function parseCommandDate(
  value: string,
): Date | null {
  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function shouldRenderCumulativeTrend(
  record: CommandCenterRecord,
): boolean {
  return record.unit === 'currency'
    || (
      record.unit === 'number'
      && !normalizeLabel(record.label).includes('cpa')
      && !normalizeLabel(record.label).includes('produkty bez')
    );
}

function resolveTrendAmplitude(
  record: CommandCenterRecord,
): number {
  if (record.unit === 'percent' || record.unit === 'ratio') {
    return Math.max(Math.abs(record.value) * 0.018, 0.0015);
  }

  if (record.unit === 'duration') {
    return Math.max(Math.abs(record.value) * 0.015, 0.08);
  }

  return Math.max(Math.abs(record.value) * 0.018, 1);
}

function resolveTrendAnomalyShift({
  lowerIsBetter,
  ratio,
  record,
}: {
  readonly lowerIsBetter: boolean;
  readonly ratio: number;
  readonly record: CommandCenterRecord;
}): number {
  const isRiskWindow = ratio > 0.58 && ratio < 0.78;

  if (!isRiskWindow || !isMetricWorse(record)) {
    return 0;
  }

  const shift = resolveTrendAmplitude(record) * 2.5;

  return lowerIsBetter
    ? shift
    : -shift;
}

function resolvePreviousPeriodFactor(
  delta: number,
): number {
  if (delta === 0) {
    return 0.97;
  }

  return Math.max(
    0.6,
    Math.min(1.4, 1 - delta * 0.62),
  );
}

function resolveMovingAverage(
  values: readonly number[],
): number {
  const slice = values.slice(-3);
  const sum = slice.reduce((total, value) => total + value, 0);

  return sum / Math.max(slice.length, 1);
}

function isTrendPointAgainstPlan(
  actual: number,
  plan: number,
  record: CommandCenterRecord,
): boolean {
  const threshold = Math.max(Math.abs(plan) * 0.035, 0.01);

  return isLowerBetterMetric(record)
    ? actual - plan > threshold
    : plan - actual > threshold;
}

function resolvePriorityScore(
  priority: 'critical' | 'high' | 'low' | 'medium',
): number {
  switch (priority) {
    case 'critical':
      return 4;
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
    default:
      return 1;
  }
}

/** Truncates a label for fixed-width chart axes — distinct from model.ts's shortenMetricLabel, which strips "(...)"/" vs " for prose, not layout. */
export function truncateChartLabel(
  value: string,
): string {
  return value.length > 28
    ? `${value.slice(0, 25)}...`
    : value;
}

function formatImpactPercentPoint(
  value: number,
): string {
  return `${new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

const commandFallbackDateRange = {
  from: '2026-08-01',
  preset: 'monthToDate',
  timezone: 'Europe/Warsaw',
  to: '2026-08-12',
} as const satisfies DateRange;

function resolveWorkspaceDateRange(
  range: DateRange | undefined,
): DateRange {
  return range ?? commandFallbackDateRange;
}
