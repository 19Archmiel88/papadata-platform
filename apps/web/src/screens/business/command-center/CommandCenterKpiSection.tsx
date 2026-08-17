import type {
  CommandCenterRecord,
} from '../../../../../../contracts/api-schemas';
import type {
  ReadinessState,
} from '../../../../../../contracts/ui-contract-types';
import {
  DataStatusBanner,
  MetricCard,
  MorningBrief,
} from '../../../design-system';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import {
  defaultWorkspaceContext,
} from '../businessData';
import {
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import type {
  CommandCenterData,
  CommandOnePageIssue,
} from './commandCenterOnePageModel';
import {
  buildRecordSparklinePoints,
  formatMetricValue,
  formatSignedPercent,
  mapReadinessToAnalyticsState,
  openPapaAssistantForElement,
  resolveMetricDeviationLabel,
  resolveMetricEmphasis,
  resolveMetricFreshnessLabel,
  resolveMetricRiskLabel,
  resolveMetricSignal,
  resolveMetricSourceLabel,
  resolveMetricStateMessage,
  resolveReadinessLabel,
} from './commandCenterOnePageModel';

type CommandMetricPresentation =
  | 'primary'
  | 'priority'
  | 'supporting';

type CommandMetricCardOptions = {
  readonly className: string;
  readonly dataState: AnalyticsDataState;
  readonly density: 'compact' | 'regular';
  readonly depth: 'flat' | 'hero';
  readonly presentation: CommandMetricPresentation;
  readonly role?: 'listitem';
  readonly sparklinePointCount: number;
};

type CommandPriorityMetricDefinition = {
  readonly key: string;
  readonly matchers: readonly string[];
};

const priorityMetricDefinitions: readonly CommandPriorityMetricDefinition[] = [
  {
    key: 'grossMargin',
    matchers: ['command-kpi-gross-margin', 'gross-margin', 'marża', 'marza', 'margin'],
  },
  {
    key: 'orders',
    matchers: ['command-kpi-orders', 'liczba zakupów', 'liczba zakupow', 'liczba zamówień', 'zamówienia', 'zamowienia', 'orders'],
  },
  {
    key: 'roas',
    matchers: ['command-kpi-roas', 'roas'],
  },
  {
    key: 'conversion',
    matchers: ['command-kpi-conversion', 'konwersja', 'conversion'],
  },
] as const;

const percentLikeMetricMatchers = [
  'command-kpi-gross-margin',
  'gross-margin',
  'marża',
  'marza',
  'margin',
  'command-kpi-conversion',
  'konwersja',
  'conversion',
] as const;

const percentValueFormatter = new Intl.NumberFormat('pl-PL', {
  maximumFractionDigits: 1,
  style: 'percent',
});

function normalizeMetricText(value: string): string {
  return value.toLocaleLowerCase('pl-PL');
}

function getMetricSearchText(record: CommandCenterRecord): string {
  return normalizeMetricText(`${record.metricId} ${record.label}`);
}

function matchesMetric(
  record: CommandCenterRecord,
  matchers: readonly string[],
): boolean {
  const searchText = getMetricSearchText(record);

  return matchers.some((matcher) => searchText.includes(normalizeMetricText(matcher)));
}

function isRevenueMetric(record: CommandCenterRecord): boolean {
  return matchesMetric(record, ['revenue', 'przychód', 'przychod']);
}

function findPriorityRecord(
  records: readonly CommandCenterRecord[],
  definition: CommandPriorityMetricDefinition,
): CommandCenterRecord | null {
  return records.find((record) => matchesMetric(record, definition.matchers)) ?? null;
}

function isCommandRecord(
  record: CommandCenterRecord | null,
): record is CommandCenterRecord {
  return record !== null;
}

function isPercentLikeMetric(record: CommandCenterRecord): boolean {
  return matchesMetric(record, percentLikeMetricMatchers);
}

function formatCommandMetricValue(record: CommandCenterRecord): string {
  if (record.value === null) {
    return formatMetricValue(record.value, record.unit);
  }

  if (isPercentLikeMetric(record)) {
    return percentValueFormatter.format(record.value);
  }

  return formatMetricValue(record.value, record.unit);
}

function buildMetricComparison(record: CommandCenterRecord) {
  if (record.delta === null) {
    return null;
  }

  return {
    direction: record.delta > 0
      ? 'up' as const
      : record.delta < 0
        ? 'down' as const
        : 'flat' as const,
    label: formatSignedPercent(record.delta),
  };
}

function resolveCommandMetricState(
  record: CommandCenterRecord,
  dataState: AnalyticsDataState,
): AnalyticsDataState {
  return record.readiness === 'ready'
    ? dataState
    : mapReadinessToAnalyticsState(record.readiness);
}

function resolveCommandMetricStatusLabel(
  record: CommandCenterRecord,
  presentation: CommandMetricPresentation,
): string {
  if (presentation === 'primary') {
    return '';
  }

  if (record.readiness === 'ready' || record.readiness === 'stale') {
    return '';
  }

  return resolveReadinessLabel(record.readiness);
}

function renderCommandMetricCard(
  record: CommandCenterRecord,
  options: CommandMetricCardOptions,
) {
  const isPrimary = options.presentation === 'primary';
  // The hero renders its micro-trend too now that `depth="hero"` shares the
  // standard layout instead of an early-return branch that dropped it.
  const showSparkline = options.presentation !== 'supporting';

  return (
    <MetricCard
      className={options.className}
      comparison={buildMetricComparison(record)}
      definitionChangeLabel={isPrimary ? resolveMetricRiskLabel(record) : null}
      density={options.density}
      depth={options.depth}
      deviationLabel={null}
      emphasis={resolveMetricEmphasis(record)}
      freshnessLabel={isPrimary ? resolveMetricFreshnessLabel(record) : null}
      key={record.metricId}
      label={record.label}
      metricId={record.metricId}
      papaAction={null}
      role={options.role}
      signal={resolveMetricSignal(record)}
      sourceLabel={isPrimary ? resolveMetricSourceLabel(record) : null}
      sparklinePoints={showSparkline
        ? buildRecordSparklinePoints(record, options.sparklinePointCount)
        : []}
      status={resolveCommandMetricState(record, options.dataState)}
      statusLabel={resolveCommandMetricStatusLabel(record, options.presentation)}
      stateMessage={resolveMetricStateMessage(record)}
      targetLabel={null}
      value={formatCommandMetricValue(record)}
    />
  );
}

export function CommandCenterKpiSection({
  data,
  dataState,
  issues,
  records,
  workspaceContext,
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
  readonly issues: readonly CommandOnePageIssue[];
  readonly records: readonly CommandCenterRecord[];
  readonly workspaceContext: typeof defaultWorkspaceContext;
}) {
  const primaryRecord = records.find(isRevenueMetric) ?? records[0] ?? null;
  const nonPrimaryRecords = primaryRecord
    ? records.filter((record) => record.metricId !== primaryRecord.metricId)
    : records;

  const priorityRecords = priorityMetricDefinitions
    .map((definition) => findPriorityRecord(nonPrimaryRecords, definition))
    .filter(isCommandRecord);

  const priorityMetricIds = new Set(
    priorityRecords.map((record) => record.metricId),
  );

  const supportingRecords = nonPrimaryRecords.filter(
    (record) => !priorityMetricIds.has(record.metricId),
  );

  return (
    <section
      aria-labelledby="command-center-kpi-title"
      className="pd-command-center-one-page__section pd-command-center-one-page__runtime-kpi"
    >
      <CommandSectionHeader
        eyebrow="KPI"
        title="Najważniejsze kafelki do analizy"
        titleId="command-center-kpi-title"
      />

      {/* The bespoke pill strip duplicated the command bar (range, refresh time,
          data state). Sources, readiness and blocking issues belong to the
          required DataStatusBanner instead. */}
      <DataStatusBanner
        blockingIssues={issues.map((issue) => ({
          id: issue.id,
          label: issue.label,
          severity: issue.severity,
        }))}
        className="pd-command-center-one-page__data-status"
        context={workspaceContext}
        readiness={mapDataStateToReadiness(dataState)}
        sources={[...data.sources]}
      />

      <div className="pd-command-center-one-page__kpi-composition">
        <div className="pd-command-center-one-page__kpi-main-grid">
          {primaryRecord ? renderCommandMetricCard(
            primaryRecord,
            {
              className: 'pd-command-center-one-page__metric pd-command-center-one-page__metric--primary',
              dataState,
              density: 'regular',
              depth: 'hero',
              presentation: 'primary',
              sparklinePointCount: 14,
            },
          ) : null}

          {priorityRecords.length > 0 ? (
            <div
              aria-label="Najważniejsze KPI po przychodzie"
              className="pd-command-center-one-page__priority-surface"
              role="list"
            >
              {priorityRecords.map((record) => renderCommandMetricCard(
                record,
                {
                  className: 'pd-command-center-one-page__metric pd-command-center-one-page__metric--priority',
                  dataState,
                  density: 'compact',
                  depth: 'flat',
                  presentation: 'priority',
                  role: 'listitem',
                  sparklinePointCount: 8,
                },
              ))}
            </div>
          ) : null}
        </div>

        {supportingRecords.length > 0 ? (
          <div
            aria-label="Pozostałe KPI"
            className="pd-command-center-one-page__supporting-strip"
            role="list"
          >
            {supportingRecords.map((record) => renderCommandMetricCard(
              record,
              {
                className: 'pd-command-center-one-page__metric pd-command-center-one-page__metric--supporting',
                dataState,
                density: 'compact',
                depth: 'flat',
                presentation: 'supporting',
                role: 'listitem',
                sparklinePointCount: 0,
              },
            ))}
          </div>
        ) : null}
      </div>

      <MorningBrief
        className="pd-command-center-one-page__morning-brief"
        context={workspaceContext}
        dataReadiness={mapDataStateToReadiness(dataState)}
        decisionsDue={issues.filter((issue) => issue.severity === 'critical').length}
        highlights={buildMorningBriefHighlights(records, issues)}
      />
    </section>
  );
}

function mapDataStateToReadiness(
  state: AnalyticsDataState,
): ReadinessState {
  switch (state) {
    case 'ready':
      return 'ready';
    case 'partial':
      return 'partial';
    case 'stale':
      return 'stale';
    case 'processing':
      return 'processing';
    case 'noData':
    case 'empty':
      return 'noData';
    case 'blocked':
      return 'blocked';
    default:
      return 'sourceError';
  }
}

function buildMorningBriefHighlights(
  records: readonly CommandCenterRecord[],
  issues: readonly CommandOnePageIssue[],
): Array<{
  readonly id: string;
  readonly metric: string;
  readonly severity: 'critical' | 'info' | 'warning';
  readonly title: string;
}> {
  // Issues from the data pipeline take priority
  const issueHighlights = issues.slice(0, 2).map((issue) => ({
    id: issue.id,
    metric: issue.label,
    severity: issue.severity,
    title: issue.severity === 'critical' ? 'Blokada wymaga reakcji' : 'Odchylenie do oceny',
  }));

  // Fill remaining slots with metric-based signals
  const metricHighlights = records
    .filter((record) => record.delta !== null && Math.abs(record.delta) >= 0.08)
    .slice(0, Math.max(0, 3 - issueHighlights.length))
    .map((record) => ({
      id: record.metricId,
      metric: record.label,
      severity: (record.delta ?? 0) < 0 ? 'warning' as const : 'info' as const,
      title: (record.delta ?? 0) < 0
        ? `Spadek ${record.label}`
        : `Wzrost ${record.label}`,
    }));

  return [...issueHighlights, ...metricHighlights];
}
