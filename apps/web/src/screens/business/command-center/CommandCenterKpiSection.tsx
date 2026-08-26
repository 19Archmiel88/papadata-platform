import {
  Fragment,
} from 'react';

import type {
  CommandCenterRecord,
} from '../../../../../../contracts/api-schemas';
import {
  MetricCard,
  VisuallyHidden,
} from '../../../design-system';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import {
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  formatMetricValue,
  formatSignedPercent,
  mapReadinessToAnalyticsState,
  resolveMetricDeviationLabel,
  resolveMetricFreshnessLabel,
  resolveMetricSignal,
  resolveMetricSourceLabel,
  resolveReadinessLabel,
} from './commandCenterOnePageModel';

// The eight executive KPI use canonical contract records. Metrics without a
// trustworthy source (currently e.g. margin, cart conversion or CPA) remain
// explicit unavailable cards instead of being reconstructed from unrelated
// values. Fixed ids keep the 2×4 executive layout stable.
const executiveKpiOrder = [
  'command-kpi-revenue',
  'command-kpi-orders',
  'command-kpi-gross-margin',
  'command-kpi-conversion',
  'command-kpi-aov',
  'command-kpi-ad-cost',
  'command-kpi-roas',
  'command-kpi-cpa',
] as const;

// Purely a quiet visual grouping over the same fixed 2×4 order above — the
// grid layout, card count and metricId order are untouched. Splits the wall
// of 8 cards into "what we sold" vs. "what it cost to sell it", the same way
// this row already reads left-to-right.
const executiveKpiGroups = [
  {
    metricIds: executiveKpiOrder.slice(0, 4),
    title: 'Wynik sprzedaży',
  },
  {
    metricIds: executiveKpiOrder.slice(4),
    title: 'Efektywność i marketing',
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

function matchesMetric(
  record: CommandCenterRecord,
  matchers: readonly string[],
): boolean {
  const searchText = normalizeMetricText(`${record.metricId} ${record.label}`);

  return matchers.some((matcher) => searchText.includes(normalizeMetricText(matcher)));
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

function formatCommandTargetLabel(record: CommandCenterRecord): string | null {
  if (record.target === null) {
    return null;
  }

  const formattedTarget = isPercentLikeMetric(record)
    ? percentValueFormatter.format(record.target)
    : formatMetricValue(record.target, record.unit);

  return formattedTarget;
}

const commandMetricHelpTexts: Record<string, string> = {
  'command-kpi-ad-cost': 'Łączny koszt kampanii reklamowych w wybranym okresie. Pomaga ocenić presję kosztową marketingu.',
  'command-kpi-aov': 'Średnia wartość brutto zamówienia: wartość brutto zamówień podzielona przez liczbę zamówień.',
  'command-kpi-conversion': 'Odsetek ruchu, który zakończył się zakupem. Pokazuje skuteczność ścieżki od wejścia do transakcji.',
  'command-kpi-cpa': 'Koszt pozyskania przypisanego do płatnych działań. Wymaga liczby zakupów przypisanych reklamom; bez tego źródła metryka pozostaje niedostępna.',
  'command-kpi-gross-margin': 'Część przychodu pozostająca po odjęciu kosztu sprzedanych produktów. Im wyżej, tym zdrowsza sprzedaż.',
  'command-kpi-orders': 'Liczba sfinalizowanych zakupów w wybranym okresie.',
  'command-kpi-revenue': 'Łączny przychód ze sprzedaży w wybranym okresie przed dodatkowymi korektami finansowymi.',
  'command-kpi-roas': 'Zwrot z wydatków reklamowych: przychód przypisany reklamom podzielony przez koszt reklamy.',
};

function resolveCommandMetricHelpText(record: CommandCenterRecord): string {
  return commandMetricHelpTexts[record.metricId]
    ?? `${record.label}: metryka operacyjna używana do oceny wyniku w Centrum Dowodzenia.`;
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

// Feeds MetricCard's inline target-progress bar — a glance-able companion to
// the existing Cel/Odchylenie numbers, not a replacement for them.
function resolveTargetProgressRatio(record: CommandCenterRecord): number | null {
  if (record.value === null || record.target === null || record.target === 0) {
    return null;
  }

  return record.value / record.target;
}

function resolveCommandMetricState(
  record: CommandCenterRecord,
  dataState: AnalyticsDataState,
): AnalyticsDataState {
  return record.readiness === 'ready'
    ? dataState
    : mapReadinessToAnalyticsState(record.readiness);
}

// Revenue is the one KPI the whole grid is oriented around — every other
// number here explains or feeds into it — so it alone carries the
// "recommendation" emphasis border. The rest stay density="compact" and
// visually equal-weight, per MetricCard's own API rather than a bespoke
// per-card CSS override.
const primaryKpiMetricId = 'command-kpi-revenue';

function renderKpiCard(
  record: CommandCenterRecord,
  dataState: AnalyticsDataState,
) {
  const isPrimary = record.metricId === primaryKpiMetricId;
  const isUnavailable = record.readiness === 'unavailable';

  return (
    <MetricCard
      comparison={isUnavailable ? null : buildMetricComparison(record)}
      density="compact"
      deviationLabel={resolveMetricDeviationLabel(record)}
      emphasis={isPrimary ? 'recommendation' : 'default'}
      freshnessLabel={resolveMetricFreshnessLabel(record)}
      helpText={resolveCommandMetricHelpText(record)}
      key={record.metricId}
      label={record.label}
      metricId={record.metricId}
      progressRatio={isUnavailable ? null : resolveTargetProgressRatio(record)}
      role="listitem"
      signal={resolveMetricSignal(record)}
      sourceLabel={resolveMetricSourceLabel(record)}
      sparklinePoints={isUnavailable ? [] : (record.sparkline ?? [])}
      stateMessage={isUnavailable ? 'Brak wiarygodnego źródła danych dla tej metryki.' : null}
      status={resolveCommandMetricState(record, dataState)}
      statusLabel={record.readiness === 'ready' ? '' : resolveReadinessLabel(record.readiness)}
      targetLabel={isUnavailable ? null : formatCommandTargetLabel(record)}
      value={isUnavailable ? null : formatCommandMetricValue(record)}
    />
  );
}

/**
 * The executive KPI grid — 8 business-critical metrics (revenue, orders,
 * gross margin, conversion, AOV, ad cost, ROAS, CPA) in a fixed 2×4 layout,
 * each card carrying its target, deviation-to-target, source, freshness and
 * a short metric explanation exposed through the info trigger. This is the
 * first section of the one-page — orientation on the numbers comes before
 * any deeper decision queue.
 */
export function CommandCenterKpiSection({
  dataState,
  records,
}: {
  readonly dataState: AnalyticsDataState;
  readonly records: readonly CommandCenterRecord[];
}) {
  const kpiGroups = executiveKpiGroups.map((group) => ({
    records: group.metricIds
      .map((metricId) => records.find((record) => record.metricId === metricId) ?? null)
      .filter(isCommandRecord),
    title: group.title,
  }));

  const hasKpiRecords = kpiGroups.some((group) => group.records.length > 0);

  return (
    <section
      aria-labelledby="command-center-kpi-title"
      className="pd-command-center-one-page__section pd-command-center-one-page__runtime-kpi"
    >
      <VisuallyHidden as="div">
        <CommandSectionHeader
          eyebrow="KPI"
          title="Najważniejsze KPI okresu"
          titleId="command-center-kpi-title"
        />
      </VisuallyHidden>

      {hasKpiRecords ? (
        <div
          aria-label="Najważniejsze KPI okresu"
          className="pd-command-center-one-page__kpi-grid"
          role="list"
        >
          {kpiGroups.map((group) => (
            group.records.length > 0 ? (
              <Fragment key={group.title}>
                <VisuallyHidden as="div">
                  <p className="pd-command-center-one-page__kpi-group-title">
                    {group.title}
                  </p>
                </VisuallyHidden>

                {group.records.map((record) => renderKpiCard(record, dataState))}
              </Fragment>
            ) : null
          ))}
        </div>
      ) : null}
    </section>
  );
}
