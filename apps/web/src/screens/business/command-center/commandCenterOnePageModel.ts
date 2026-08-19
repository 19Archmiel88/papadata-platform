import type {
  CommandCenterRecord,
  DecisionStatus,
  ReadinessStatus,
} from '../../../../../../contracts/api-schemas';
import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';
import type {
  DataSourceRef,
  DateRange,
} from '../../../../../../contracts/ui-contract-types';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import type {
  BusinessScreenData,
  BusinessScreenDefinition,
} from '../businessData';
import {
  formatInteger,
  formatMetricValue,
  formatPercent as formatWorkspacePercent,
  formatSignedPercent,
  resolveUnitLabel as resolveWorkspaceUnitLabel,
} from '../commandCenterWorkspaceFormatters';

export type CommandCenterData = Extract<
  BusinessScreenData,
  { readonly group: 'command-center' }
>;

export type CommandOnePageIssue = {
  readonly id: string;
  readonly label: string;
  readonly severity: 'critical' | 'warning';
};

export type OperationalPriority =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export type CommandRecordContext = {
  readonly businessImpact: string;
  readonly diagnosis: string;
  readonly evidenceLabel: string;
  readonly nextAction: string;
  readonly owner: string;
  readonly priority: OperationalPriority;
  readonly timebox: string;
};

export type CommandDecision = CommandRecordContext & {
  readonly deltaLabel: string;
  readonly id: string;
  readonly metricLabel: string;
  readonly readiness: ReadinessStatus;
  readonly valueLabel: string;
};

export type CommandSignalKind = 'data' | 'opportunity' | 'risk';

export type RecommendationExecutionMode = 'advisory' | 'executable' | 'guided';

export type RecommendationExecutionAvailability =
  | 'available'
  | 'needsUserAction'
  | 'prohibited'
  | 'unavailable';

export type RecommendationExecutionState = {
  readonly availability: RecommendationExecutionAvailability;
  readonly mode: RecommendationExecutionMode;
};

export type CommandNoActionProjection = {
  readonly deltaValue: number;
  readonly projectedValue: number;
};

export type CommandCenterVisitSnapshot = {
  readonly issueCount: number;
  readonly metrics: Readonly<Record<string, number>>;
  readonly recommendationCount: number;
  readonly savedAt: string;
};

export type CommandCenterVisitDigest = {
  readonly newIssueCount: number;
  readonly newRecommendationCount: number;
  readonly resolvedIssueCount: number;
  readonly shifts: readonly {
    readonly deltaRatio: number;
    readonly label: string;
    readonly metricId: string;
  }[];
};

export const sourceColumns: readonly DataColumn[] = [
  { id: 'source', label: 'Nazwa źródła ruchu', sortable: true, width: 240 },
  { align: 'right', id: 'sessions', label: 'Ilość sesji', sortable: true, width: 150 },
  { align: 'right', id: 'users', label: 'Ilość użytkowników', sortable: true, width: 170 },
  { align: 'right', id: 'revenue', label: 'Przychód', sortable: true, width: 160 },
  { align: 'right', id: 'cr', label: 'CR', sortable: true, width: 120 },
  { align: 'right', id: 'ctr', label: 'CTR', sortable: true, width: 120 },
];

export const customerColumns: readonly DataColumn[] = [
  { id: 'segment', label: 'Segment', sortable: true, width: 220 },
  { align: 'right', id: 'customers', label: 'Liczba klientów', sortable: true, width: 160 },
  { align: 'right', id: 'revenue', label: 'Przychód', sortable: true, width: 160 },
  { align: 'right', id: 'productsPerOrder', label: 'Śr. produktów', sortable: true, width: 160 },
  { align: 'right', id: 'arpu', label: 'ARPU', sortable: true, width: 140 },
  { align: 'right', id: 'frequency', label: 'Częstotliwość', sortable: true, width: 160 },
];

export const productColumns: readonly DataColumn[] = [
  { id: 'product', label: 'Produkt', sortable: true, width: 260 },
  { align: 'right', id: 'revenue', label: 'Przychód', sortable: true, width: 160 },
  { align: 'right', id: 'newRevenue', label: 'Przychód nowi klienci', sortable: true, width: 210 },
  { align: 'right', id: 'returningRevenue', label: 'Przychód powracający', sortable: true, width: 220 },
  { align: 'right', id: 'quantity', label: 'Ilość', sortable: true, width: 120 },
  { align: 'right', id: 'change', label: 'Zmiana', sortable: true, width: 120 },
];

export const commandColumns: readonly DataColumn[] = [
  { id: 'label', label: 'Obszar', sortable: true, width: 260 },
  { align: 'right', id: 'value', label: 'Wynik', sortable: true, width: 150 },
  { align: 'right', id: 'target', label: 'Cel', sortable: true, width: 150 },
  { align: 'right', id: 'delta', label: 'Zmiana', sortable: true, width: 120 },
  { id: 'impact', label: 'Wpływ', sortable: true, width: 240 },
  { id: 'nextAction', label: 'Następny krok', width: 300 },
  { id: 'owner', label: 'Właściciel', sortable: true, width: 220 },
  { id: 'readinessLabel', label: 'Stan danych', sortable: true, width: 160 },
];

/**
 * Executive KPI set for the one-page.
 *
 * Only metrics that are present in the contract, or that follow from present
 * metrics by real arithmetic (AOV = revenue / orders, ad cost = revenue / ROAS,
 * CPA = ad cost / orders), are emitted. Nothing is invented: a metric without
 * backing simply does not appear, and the sections fall back to their empty
 * states instead of showing a plausible-looking constant.
 *
 * The demo variant used by fixtures lives in {@link buildDemoExecutiveKpiRecords}.
 */
export function buildExecutiveKpiRecords(
  records: readonly CommandCenterRecord[],
): readonly CommandCenterRecord[] {
  const revenue = findRecordByLabel(records, ['przychod'])
    ?? records.find((record) => record.unit === 'currency')
    ?? null;
  const roas = findRecordByLabel(records, ['roas']) ?? null;
  const orders = findRecordByLabel(records, ['zakup', 'zamowien', 'orders']) ?? null;
  const conversion = findRecordByLabel(records, ['konwersja', 'cvr', 'koszyk']) ?? null;
  const margin = findRecordByLabel(records, ['marza', 'margin']) ?? null;

  const derived: CommandCenterRecord[] = [];

  const pushMapped = (
    source: CommandCenterRecord | null,
    metricId: string,
    label: string,
  ) => {
    if (!source) {
      return;
    }

    derived.push({
      ...source,
      label,
      metricId,
    });
  };

  pushMapped(revenue, 'command-kpi-revenue', 'Przychód');
  pushMapped(orders, 'command-kpi-orders', 'Liczba zakupów');
  pushMapped(margin, 'command-kpi-gross-margin', 'Marża brutto');
  pushMapped(conversion, 'command-kpi-conversion', 'Konwersja');
  pushMapped(roas, 'command-kpi-roas', 'ROAS');

  // AOV, ad cost and CPA are identities, not estimates — safe to derive.
  if (revenue && orders && orders.value > 0) {
    derived.push(makeCommandRecord(
      'command-kpi-aov',
      'AOV',
      revenue.value / orders.value,
      'currency',
      null,
      null,
      resolveDerivedReadiness(revenue.readiness, orders.readiness),
    ));
  }

  const adCostValue = revenue && roas && roas.value > 0
    ? revenue.value / roas.value
    : null;

  if (adCostValue !== null) {
    derived.push(makeCommandRecord(
      'command-kpi-ad-cost',
      'Koszt reklamy',
      adCostValue,
      'currency',
      null,
      null,
      resolveDerivedReadiness(revenue?.readiness, roas?.readiness),
    ));

    if (orders && orders.value > 0) {
      derived.push(makeCommandRecord(
        'command-kpi-cpa',
        'Koszt zakupu',
        adCostValue / orders.value,
        'currency',
        null,
        null,
        resolveDerivedReadiness(revenue?.readiness, roas?.readiness, orders.readiness),
      ));
    }
  }

  // Anything the contract carries but the mapping above did not claim stays
  // visible in the supporting strip rather than being silently dropped.
  const claimed = new Set([revenue, orders, margin, conversion, roas]
    .filter(isCommandCenterRecord)
    .map((record) => record.metricId));

  const passthrough = records.filter((record) => !claimed.has(record.metricId));

  return [...derived, ...passthrough];
}

function isCommandCenterRecord(
  record: CommandCenterRecord | null,
): record is CommandCenterRecord {
  return record !== null;
}

/**
 * Demo KPI set — plausible constants for Storybook fixtures and the localhost
 * dev fallback. Never reachable from a deployed runtime.
 */
export function buildDemoExecutiveKpiRecords(
  records: readonly CommandCenterRecord[],
): readonly CommandCenterRecord[] {
  const revenue = findRecordByLabel(records, ['przychod'])
    ?? records.find((record) => record.unit === 'currency')
    ?? null;
  const roas = findRecordByLabel(records, ['roas']) ?? null;
  const conversion = findRecordByLabel(records, ['konwersja', 'cvr', 'koszyk']) ?? null;
  const freshness = findRecordByLabel(records, ['swiezosc', 'event', 'ga4']) ?? null;
  const revenueValue = revenue?.value ?? 0;
  const roasValue = roas?.value ?? 4.1;
  const ordersValue = Math.max(Math.round(revenueValue / 168.65), 0);
  const aovValue = ordersValue > 0 ? revenueValue / ordersValue : 0;
  const adCostValue = roasValue > 0 ? revenueValue / roasValue : 0;
  const cpaValue = ordersValue > 0 ? adCostValue / ordersValue : 0;
  const cvrValue = conversion?.value ?? 0.031;
  const clicksValue = cvrValue > 0 ? Math.round(ordersValue / cvrValue) : 0;
  const ctrValue = 0.0162;
  const impressionsValue = ctrValue > 0 ? Math.round(clicksValue / ctrValue) : 0;

  return [
    makeCommandRecord('command-kpi-revenue', 'Przychód', revenueValue, 'currency', revenue?.delta ?? 0.12, revenue?.target ?? revenueValue * 1.08, revenue?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-orders', 'Liczba zakupów', ordersValue, 'number', 0.08, Math.round(ordersValue * 1.05), revenue?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-gross-margin', 'Marża brutto', 0.317, 'ratio', -0.024, 0.34, revenue?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-conversion', 'Konwersja', 0.038, 'ratio', -0.011, 0.045, revenue?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-aov', 'AOV', aovValue, 'currency', 0.037, aovValue * 1.04, revenue?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-ad-cost', 'Koszt reklamy', adCostValue, 'currency', -0.07, adCostValue * 0.94, resolveDerivedReadiness(roas?.readiness, revenue?.readiness)),
    makeCommandRecord('command-kpi-roas', 'ROAS', roasValue, 'ratio', roas?.delta ?? 0.18, roas?.target ?? 4.1, roas?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-cpa', 'Koszt zakupu', cpaValue, 'currency', -0.04, cpaValue * 0.92, resolveDerivedReadiness(roas?.readiness, revenue?.readiness)),
    makeCommandRecord('command-kpi-impressions', 'Wyświetlenia', impressionsValue, 'number', -0.12, impressionsValue * 1.08, freshness?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-clicks', 'Kliknięcia', clicksValue, 'number', -0.14, clicksValue * 1.06, freshness?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-ctr', 'CTR', ctrValue, 'percent', -0.03, 0.018, freshness?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-cvr', 'CVR', cvrValue, 'percent', conversion?.delta ?? -0.07, conversion?.target ?? 0.035, conversion?.readiness ?? 'partial'),
  ];
}

export function makeCommandRecord(
  metricId: string,
  label: string,
  value: number,
  unit: CommandCenterRecord['unit'],
  delta: number | null,
  target: number | null,
  readiness: ReadinessStatus,
): CommandCenterRecord {
  return {
    delta,
    label,
    metricId,
    readiness,
    target,
    unit,
    value,
  };
}

export function findRecordById(
  records: readonly CommandCenterRecord[],
  metricId: string,
): CommandCenterRecord | null {
  return records.find((record) => record.metricId === metricId) ?? null;
}

export function findRecordByLabel(
  records: readonly CommandCenterRecord[],
  keywords: readonly string[],
): CommandCenterRecord | null {
  return records.find((record) => {
    const label = normalizeLabel(record.label);

    return keywords.some((keyword) => label.includes(normalizeLabel(keyword)));
  }) ?? null;
}

export function resolveDerivedReadiness(
  ...statuses: readonly (ReadinessStatus | undefined)[]
): ReadinessStatus {
  if (statuses.includes('unavailable')) return 'unavailable';
  if (statuses.includes('stale')) return 'stale';
  if (statuses.includes('partial')) return 'partial';

  return 'ready';
}

const trustAttentionCompletenessThreshold = 0.9;

export type CommandCenterTrustSummary = {
  readonly attentionSourceCount: number;
  readonly completenessLabel: string;
};

/**
 * Aggregate for the Trust line in the command bar — "Dane aktualne · 96%
 * kompletności · 1 źródło wymaga uwagi". This is an aggregate, not the
 * source of truth: individual KPIs and analysis surfaces keep their own
 * local readiness independent of this summary.
 */
export function resolveTrustSummary(
  sources: readonly DataSourceRef[],
): CommandCenterTrustSummary | null {
  if (sources.length === 0) {
    return null;
  }

  const averageCompleteness = sources.reduce(
    (sum, source) => sum + source.completeness,
    0,
  ) / sources.length;

  return {
    attentionSourceCount: sources.filter(
      (source) => source.completeness < trustAttentionCompletenessThreshold,
    ).length,
    completenessLabel: formatPercent(averageCompleteness),
  };
}

export function buildDemoCommandSourceRows(records: readonly CommandCenterRecord[]): readonly DataRow[] {
  const revenue = findRecordById(records, 'command-kpi-revenue')?.value ?? 0;
  const model = [
    ['google', 'Google Ads / Search', 0.34, 0.041, 0.062],
    ['meta', 'Meta Ads', 0.28, 0.034, 0.038],
    ['organic', 'Organic Search', 0.24, 0.028, 0.047],
    ['newsletter', 'Newsletter', 0.08, 0.056, 0.091],
    ['tiktok', 'TikTok Ads', 0.06, 0.024, 0.029],
  ] as const;

  return model.map(([id, source, share, cr, ctr], index) => {
    const rawRevenue = revenue * share;
    const sessions = Math.max(Math.round(rawRevenue / Math.max(5.8 * (1 + index * 0.12), 1)), 0);

    return {
      cr: formatPercent(cr),
      ctr: formatPercent(ctr),
      id,
      rawRevenue,
      revenue: formatMetricValue(rawRevenue, 'currency'),
      sessions: formatInteger(sessions),
      share,
      source,
      users: formatInteger(Math.round(sessions * 0.79)),
    };
  });
}

export function buildDemoCommandCustomerRows(records: readonly CommandCenterRecord[]): readonly DataRow[] {
  const revenue = findRecordById(records, 'command-kpi-revenue')?.value ?? 0;
  const orders = findRecordById(records, 'command-kpi-orders')?.value ?? 0;
  const returningRevenue = revenue * 0.47;
  const newRevenue = revenue - returningRevenue;
  const returningCustomers = Math.max(Math.round(orders * 0.38), 1);
  const newCustomers = Math.max(Math.round(orders * 0.62), 1);

  return [
    {
      arpu: formatMetricValue(returningRevenue / returningCustomers, 'currency'),
      customers: formatInteger(returningCustomers),
      frequency: '1,86',
      id: 'returning',
      productsPerOrder: '2,6',
      rawRevenue: returningRevenue,
      revenue: formatMetricValue(returningRevenue, 'currency'),
      segment: 'Powracający klienci',
    },
    {
      arpu: formatMetricValue(newRevenue / newCustomers, 'currency'),
      customers: formatInteger(newCustomers),
      frequency: '1,08',
      id: 'new',
      productsPerOrder: '1,9',
      rawRevenue: newRevenue,
      revenue: formatMetricValue(newRevenue, 'currency'),
      segment: 'Nowi klienci',
    },
  ];
}

export function buildDemoCommandProductRows(records: readonly CommandCenterRecord[]): readonly DataRow[] {
  const revenue = findRecordById(records, 'command-kpi-revenue')?.value ?? 0;
  const products = [
    ['smartfon-x12', 'Smartfon X12', 0.18, 250, 0.15],
    ['laptop-pro', 'Laptop Pro', 0.24, 105, 0.08],
    ['sluchawki', 'Słuchawki bezprzewodowe', 0.09, 500, 0.23],
    ['tablet-air', 'Tablet Air', 0.11, 175, -0.05],
    ['smartwatch', 'Smartwatch Sport', 0.08, 280, 0.18],
    ['kamera', 'Kamera bezpieczeństwa', 0.06, 140, 0.02],
    ['glosnik', 'Głośnik Bluetooth', 0.05, 190, -0.03],
    ['powerbank', 'Powerbank 20000mAh', 0.04, 360, 0.12],
    ['drukarka', 'Drukarka laserowa', 0.07, 85, -0.07],
    ['monitor', 'Monitor 4K', 0.08, 125, 0.1],
  ] as const;

  return products.map(([id, product, share, quantity, change], index) => {
    const rawRevenue = revenue * share;
    const returningShare = 0.52 + (index % 3) * 0.04;

    return {
      change: formatSignedPercent(change),
      id,
      newRevenue: formatMetricValue(rawRevenue * (1 - returningShare), 'currency'),
      product,
      quantity: formatInteger(quantity),
      rawRevenue,
      returningRevenue: formatMetricValue(rawRevenue * returningShare, 'currency'),
      revenue: formatMetricValue(rawRevenue, 'currency'),
    };
  });
}

export type CommandCommittedAction = {
  readonly dueLabel: string;
  readonly expectedImpactLabel: string;
  readonly goal: string;
  readonly id: string;
  readonly measurement: {
    readonly baselineLabel: string;
    readonly resultLabel: string;
  } | null;
  readonly owner: string;
  readonly progress: number;
  readonly registryHref: `/app/decisions/${string}`;
  readonly status: DecisionStatus;
  readonly title: string;
};

/**
 * Command Center has no real "accepted decision" data source yet — the
 * `/app/decisions/*` module it would come from is itself Storybook-fixture
 * data today (see `decisionsData.ts`). Demo rows follow the same
 * `isLocalClientRuntimeAvailable()` gate as the other demo breakdowns in this
 * module; in a deployed runtime with no such data, the section renders
 * nothing rather than a fabricated list.
 */
export function buildDemoCommittedActions(): readonly CommandCommittedAction[] {
  return [
    {
      dueLabel: '18 sie 2026',
      expectedImpactLabel: '+6–8 tys. zł / mies.',
      goal: 'Poprawa ROAS o min. +0,8',
      id: 'committed-meta-budget',
      measurement: null,
      owner: 'Anna Kowalska',
      progress: 1,
      registryHref: '/app/decisions/rejestr-decyzji',
      status: 'approved',
      title: 'Plan działania — Meta Prospecting',
    },
    {
      dueLabel: '24 sie 2026',
      expectedImpactLabel: '+2–3 tys. zł / mies.',
      goal: 'Wzrost CTR o +15%',
      id: 'committed-creative-test',
      measurement: null,
      owner: 'Kamil Zieliński',
      progress: 0.6,
      registryHref: '/app/decisions/rejestr-decyzji',
      status: 'executing',
      title: 'Test kreatywów — Nowi klienci',
    },
    {
      dueLabel: '31 sie 2026',
      expectedImpactLabel: '+1–2 tys. zł / mies.',
      goal: 'Wzrost konwersji o +0,3 pp',
      id: 'committed-pdp-optimization',
      measurement: null,
      owner: 'Michał Nowak',
      progress: 0.2,
      registryHref: '/app/decisions/rejestr-decyzji',
      status: 'proposed',
      title: 'Optymalizacja stron produktowych',
    },
  ];
}

export function resolveCommittedActionStatusLabel(status: DecisionStatus): string {
  switch (status) {
    case 'proposed':
      return 'W przygotowaniu';
    case 'approved':
      return 'Gotowe do wdrożenia';
    case 'executing':
      return 'Weryfikacja po wdrożeniu';
    case 'measured':
      return 'Zmierzone';
    case 'rejected':
      return 'Odrzucone';
    default:
      return status;
  }
}

export function resolveCommittedActionStatusTone(
  status: DecisionStatus,
): 'critical' | 'info' | 'neutral' | 'success' | 'warning' {
  switch (status) {
    case 'proposed':
      return 'neutral';
    case 'approved':
      return 'success';
    case 'executing':
      return 'info';
    case 'measured':
      return 'success';
    case 'rejected':
      return 'critical';
    default:
      return 'neutral';
  }
}

export function resolveRecommendationProjectedValue(
  record: CommandCenterRecord,
  recommendation: CommandCenterData['recommendations'][number],
): number {
  const impactMultiplier = recommendation.impact === 'high'
    ? 0.12
    : recommendation.impact === 'medium'
      ? 0.07
      : 0.035;
  const confidenceMultiplier = Math.max(Math.min(recommendation.confidence, 1), 0.35);
  const adjustment = impactMultiplier * confidenceMultiplier;

  return isLowerBetterMetric(record)
    ? record.value * (1 - adjustment)
    : record.value * (1 + adjustment);
}

export function buildRecordSparklinePoints(
  record: CommandCenterRecord,
  pointCount: number,
): readonly number[] {
  const delta = record.delta ?? 0;
  const start = record.value / Math.max(0.22, 1 + delta);
  const amplitude = Math.max(Math.abs(record.value) * 0.035, 0.01);

  return Array.from({ length: pointCount }, (_, index) => {
    const ratio = pointCount <= 1 ? 1 : index / (pointCount - 1);
    const baseline = interpolateNumber(start, record.value, ratio);
    const wave = Math.sin((index + 1) * 1.41) * amplitude;

    return index === pointCount - 1
      ? record.value
      : clampMetricValue(baseline + wave, record.unit);
  });
}

export type MetricRelationshipPoint = {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
};

/**
 * Zips two records' synthesized histories (same technique as
 * {@link buildRecordSparklinePoints}) into paired (x, y) observations, so a
 * two-metric relationship chart can be built without the contract carrying
 * real day-by-day history.
 */
export function buildMetricRelationshipPoints(
  xRecord: CommandCenterRecord,
  yRecord: CommandCenterRecord,
  pointCount: number,
): readonly MetricRelationshipPoint[] {
  const xValues = buildRecordSparklinePoints(xRecord, pointCount);
  const yValues = buildRecordSparklinePoints(yRecord, pointCount);
  const lastIndex = xValues.length - 1;

  return xValues.map((x, index) => ({
    id: `point-${index}`,
    label: index === lastIndex ? 'Dziś' : `T-${lastIndex - index}`,
    x,
    y: yValues[index] ?? yRecord.value,
  }));
}

/** Pearson correlation coefficient; null when it is not defined (<2 points or a constant series). */
export function resolveCorrelationCoefficient(
  points: readonly MetricRelationshipPoint[],
): number | null {
  if (points.length < 2) {
    return null;
  }

  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;

  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;

  points.forEach((point) => {
    const dx = point.x - meanX;
    const dy = point.y - meanY;

    covariance += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  });

  const denominator = Math.sqrt(varianceX * varianceY);

  return denominator === 0 ? null : covariance / denominator;
}

export function resolveRuntimeForecastValue(record: CommandCenterRecord): number {
  const delta = record.delta ?? 0;
  const targetPressure = record.target === null
    ? 0
    : (record.target - record.value) * 0.34;

  return clampMetricValue(
    record.value * (1 + Math.max(Math.min(delta, 0.16), -0.16) * 0.42) + targetPressure,
    record.unit,
  );
}

export type CommandTrajectoryPoint = {
  readonly label: string;
  readonly value: number;
};

export type CommandTrajectory = {
  readonly actual: readonly CommandTrajectoryPoint[];
  readonly forecast: readonly CommandTrajectoryPoint[];
  readonly lowerBound: readonly CommandTrajectoryPoint[];
  readonly upperBound: readonly CommandTrajectoryPoint[];
};

/**
 * Trajectory for the Plan/Forecast chart: a stylized "so far" line (reusing
 * {@link buildRecordSparklinePoints}'s interpolation, the same technique
 * already shipped for MetricCard sparklines — the contract carries no real
 * day-by-day history) that hands off at "Dziś" to a two-point forecast
 * segment ending at {@link resolveRuntimeForecastValue}. The forecast's
 * first point repeats the last actual value so the two lines visually
 * connect at the handoff label. The uncertainty band pinches to zero at
 * "Dziś" and widens toward "Koniec okresu" as the unelapsed share of the
 * date range grows, so an early-period forecast reads as less certain than
 * one made near the period's end.
 */
export function buildRecordTrajectoryPoints(
  record: CommandCenterRecord,
  historyPointCount: number,
  paceRatio: number | null,
): CommandTrajectory {
  const historyValues = buildRecordSparklinePoints(record, historyPointCount);
  const lastIndex = historyValues.length - 1;

  const actual = historyValues.map((value, index) => ({
    label: index === lastIndex ? 'Dziś' : `T-${lastIndex - index}`,
    value,
  }));

  const lastActualValue = historyValues[lastIndex] ?? record.value;
  const forecastValue = resolveRuntimeForecastValue(record);
  const remainingRatio = paceRatio === null ? 0.5 : Math.max(Math.min(1 - paceRatio, 1), 0);
  const spread = Math.max(
    Math.abs(forecastValue - lastActualValue),
    Math.abs(forecastValue) * 0.04,
  ) * (0.5 + remainingRatio);

  return {
    actual,
    forecast: [
      { label: 'Dziś', value: lastActualValue },
      { label: 'Koniec okresu', value: forecastValue },
    ],
    lowerBound: [
      { label: 'Dziś', value: lastActualValue },
      { label: 'Koniec okresu', value: clampMetricValue(forecastValue - spread, record.unit) },
    ],
    upperBound: [
      { label: 'Dziś', value: lastActualValue },
      { label: 'Koniec okresu', value: clampMetricValue(forecastValue + spread, record.unit) },
    ],
  };
}

export function chooseComparableRecords(records: readonly CommandCenterRecord[]): readonly CommandCenterRecord[] {
  const comparable = records.filter((record) => record.target !== null || record.delta !== null);

  return comparable.length > 0 ? comparable : records;
}

export function resolveMetricSignal(record: CommandCenterRecord): 'negative' | 'neutral' | 'positive' | 'warning' {
  if (record.readiness !== 'ready') return 'warning';
  if (isMetricWorse(record)) return 'negative';
  if ((record.delta ?? 0) > 0) return isLowerBetterMetric(record) ? 'warning' : 'positive';

  return 'neutral';
}

export function resolveMetricEmphasis(record: CommandCenterRecord): 'alert' | 'default' | 'recommendation' {
  if (record.readiness !== 'ready' || isMetricWorse(record)) return 'alert';
  if ((record.delta ?? 0) > 0.08) return 'recommendation';

  return 'default';
}

export function resolveMetricRiskLabel(record: CommandCenterRecord): string | null {
  if (record.readiness === 'unavailable') return 'AI: blokada źródła danych';
  if (record.readiness === 'stale') return 'AI: ryzyko nieświeżych danych';
  if (record.readiness === 'partial') return 'AI: analiza częściowa';
  if (isMetricWorse(record)) return 'AI: wykryty spadek lub ryzyko';
  if (Math.abs(record.delta ?? 0) >= 0.15) return 'AI: anomalia dodatnia do potwierdzenia';

  return null;
}

export function resolveMetricStateMessage(record: CommandCenterRecord): string | null {
  const riskLabel = resolveMetricRiskLabel(record);

  return riskLabel ? `${riskLabel}. Zweryfikuj źródło i wpływ na wynik.` : null;
}

export function resolveMetricDeviationLabel(record: CommandCenterRecord): string | null {
  if (record.target === null) return null;

  return formatSignedMetricValue(record.value - record.target, record.unit);
}

export function resolveMetricFreshnessLabel(record: CommandCenterRecord): string {
  switch (record.readiness) {
    case 'ready':
      return 'świeże źródła';
    case 'partial':
      return 'częściowa synchronizacja';
    case 'stale':
      return 'wymaga odświeżenia';
    case 'unavailable':
      return 'źródło niedostępne';
    default:
      return 'status nieznany';
  }
}

export function resolveMetricSourceLabel(record: CommandCenterRecord): string {
  const label = normalizeLabel(record.label);

  if (label.includes('ga4') || label.includes('event') || label.includes('ruch')) return 'GA4';
  if (label.includes('meta')) return 'Meta Ads';
  if (label.includes('google') || label.includes('search') || label.includes('roas')) return 'Google Ads';
  if (label.includes('produkt') || label.includes('marza') || label.includes('bestseller')) return 'Shopify / katalog';
  if (label.includes('klien') || label.includes('repeat')) return 'CRM';

  return 'PapaData analytics';
}

export function isLowerBetterMetric(record: CommandCenterRecord): boolean {
  const label = normalizeLabel(record.label);

  return label.includes('koszt')
    || label.includes('cpa')
    || label.includes('odplyw')
    || label.includes('porzuc')
    || label.includes('brak')
    || label.includes('ryzyko')
    || label.includes('odrzucone')
    || label.includes('platnosci')
    || label.includes('zwroty')
    || label.includes('bez mapowania');
}

export function isMetricWorse(record: CommandCenterRecord): boolean {
  if (record.delta === null) return false;

  return isLowerBetterMetric(record)
    ? record.delta > 0
    : record.delta < 0;
}

/**
 * Ranks a record by how much it deserves a human's attention: unresolved
 * readiness problems first, then the size of an adverse move. Shared by the
 * Attention section and the legacy (Storybook-only) `CommandCenterWorkspace`
 * variant screens so both surfaces agree on what counts as urgent.
 */
export function attentionWeight(record: CommandCenterRecord): number {
  const readinessWeight = record.readiness === 'unavailable'
    ? 4
    : record.readiness === 'stale'
      ? 3
      : record.readiness === 'partial'
        ? 2
        : 0;
  const deltaWeight = isMetricWorse(record)
    ? Math.abs(record.delta ?? 0) * 10
    : Math.max(record.delta ?? 0, 0);

  return readinessWeight + deltaWeight;
}

/**
 * Classifies a metric into a diagnosis, owner, evidence and next action by
 * matching its label against known operational areas. This is the same
 * keyword-driven reasoning already reviewed and shipped for the legacy
 * per-screen Command Center views (moved here rather than duplicated so the
 * Attention section and those views share one derivation instead of two
 * diverging ones). `variant` narrows a couple of legacy, screen-specific
 * branches; the Attention section omits it and gets the generic fallback.
 */
export function getRecordContext(
  record: CommandCenterRecord,
  variant?: BusinessScreenDefinition['variant'],
): CommandRecordContext {
  const label = normalizeLabel(record.label);
  const worse = isMetricWorse(record);

  if (
    label.includes('platnosci')
    || label.includes('odrzucone')
  ) {
    return {
      businessImpact: 'Ryzyko utraty zakupów',
      diagnosis: 'Wzrost odrzuceń płatności może zaniżać zakup mimo zdrowego ruchu.',
      evidenceLabel: 'Bramka płatności, 3DS i błędy checkoutu',
      nextAction: 'Sprawdź płatności i błędy 3DS',
      owner: 'Payments / Ops',
      priority: 'critical',
      timebox: 'natychmiast',
    };
  }

  if (
    label.includes('konwersja')
    || label.includes('checkout')
    || label.includes('koszyk')
    || variant === 'funnel'
  ) {
    return {
      businessImpact: worse ? 'Ryzyko utraty zamówień' : 'Szansa poprawy zamówień',
      diagnosis: 'Odchylenie w ścieżce zakupowej bezpośrednio wpływa na wynik okresu.',
      evidenceLabel: 'GA4 checkout, koszyk, zakup i segment mobile',
      nextAction: 'Przejrzyj koszyk, checkout i mobile',
      owner: 'Growth / UX checkout',
      priority: worse || record.readiness !== 'ready' ? 'high' : 'medium',
      timebox: 'dzisiaj 12:00',
    };
  }

  if (
    label.includes('ga4')
    || label.includes('event')
    || label.includes('swiezosc')
    || label.includes('kompletnosc')
  ) {
    return {
      businessImpact: 'Ryzyko błędnej interpretacji',
      diagnosis: 'Niepełne lub opóźnione eventy obniżają zaufanie do decyzji w lejku i kampaniach.',
      evidenceLabel: 'Kolejka eventów, kompletność i ostatnia synchronizacja',
      nextAction: 'Zweryfikuj kolejkę eventów GA4',
      owner: 'Analityka danych',
      priority: record.readiness === 'stale' ? 'high' : 'medium',
      timebox: 'dzisiaj 11:00',
    };
  }

  if (
    label.includes('cpa')
    || label.includes('meta')
    || label.includes('ads')
  ) {
    return {
      businessImpact: worse ? 'Ryzyko przepalania budżetu' : 'Szansa przesunięcia budżetu',
      diagnosis: 'Kanał płatny wymaga kontroli kosztu i jakości konwersji przed skalowaniem.',
      evidenceLabel: 'Koszt, przychód, ROAS i kreacje kampanii',
      nextAction: 'Sprawdź budżet, CPA i kreacje kampanii',
      owner: 'Performance marketing',
      priority: worse || record.readiness !== 'ready' ? 'high' : 'medium',
      timebox: 'dzisiaj 14:00',
    };
  }

  if (
    label.includes('produkty')
    || label.includes('bestseller')
    || label.includes('mapowania')
    || label.includes('dostepnosc')
  ) {
    return {
      businessImpact: worse ? 'Ryzyko utraty popytu' : 'Szansa zwiększenia marży',
      diagnosis: 'Problemy katalogu i dostępności ograniczają sprzedaż mimo dobrego ruchu.',
      evidenceLabel: 'Katalog, feed, marża i dostępność bestsellerów',
      nextAction: 'Napraw mapowanie i dostępność bestsellerów',
      owner: 'Katalog produktów',
      priority: worse || record.readiness !== 'ready' ? 'high' : 'medium',
      timebox: 'dzisiaj 15:00',
    };
  }

  if (
    label.includes('klien')
    || label.includes('repeat')
    || label.includes('powracaj')
  ) {
    return {
      businessImpact: worse ? 'Ryzyko spadku retencji' : 'Szansa retencji',
      diagnosis: 'Zmiana segmentów klientów wpływa na powtarzalność przychodu i koszt pozyskania.',
      evidenceLabel: 'Segmenty, kohorty i pseudonimizowane agregaty',
      nextAction: 'Sprawdź segment powracających klientów',
      owner: 'CRM / Retencja',
      priority: worse ? 'high' : 'medium',
      timebox: 'jutro 10:00',
    };
  }

  if (
    label.includes('marza')
    || label.includes('mix')
  ) {
    return {
      businessImpact: worse ? 'Ryzyko spadku rentowności' : 'Szansa rentowności',
      diagnosis: 'Mix produktów i marża pokazują, czy wynik jest zdrowy, a nie tylko większy.',
      evidenceLabel: 'Marża brutto, mix produktów i przychód',
      nextAction: 'Utrzymaj ekspozycję produktów wysokomarżowych',
      owner: 'Merchandising',
      priority: worse ? 'high' : 'low',
      timebox: 'w tym tygodniu',
    };
  }

  if (
    label.includes('ai')
    || label.includes('pewnosc')
    || label.includes('decyzji')
  ) {
    return {
      businessImpact: worse ? 'Ryzyko słabej automatyzacji' : 'Lepsza jakość decyzji',
      diagnosis: 'Pewność rekomendacji pokazuje, czy AI ma wystarczające dowody do wsparcia decyzji.',
      evidenceLabel: 'Dowody, confidence score i zgodność ze źródłami',
      nextAction: worse
        ? 'Zwiększ próg akceptacji rekomendacji'
        : 'Utrzymaj tryb zatwierdzania przez człowieka',
      owner: 'AI / Analityka decyzji',
      priority: worse || record.readiness !== 'ready' ? 'high' : 'medium',
      timebox: 'dzisiaj 16:00',
    };
  }

  if (
    label.includes('google')
    || label.includes('search')
    || label.includes('roas')
    || label.includes('przychod')
    || label.includes('liczba zamowien')
  ) {
    return {
      businessImpact: worse ? 'Ryzyko spadku wyniku' : 'Stabilny wkład do wyniku',
      diagnosis: 'Obszar wspiera bieżący wynik, ale nadal wymaga kontroli celu i źródeł.',
      evidenceLabel: 'Przychód, zamówienia, koszt i cel okresu',
      nextAction: worse
        ? 'Sprawdź źródło spadku wyniku'
        : 'Utrzymaj obecne tempo i monitoruj cel',
      owner: 'Growth',
      priority: worse ? 'high' : 'low',
      timebox: worse ? 'dzisiaj 13:00' : 'monitoring',
    };
  }

  return {
    businessImpact: worse ? 'Ryzyko operacyjne' : 'Monitoring',
    diagnosis: 'Metryka wymaga oceny w kontekście celu, zakresu i jakości źródeł.',
    evidenceLabel: 'Wynik, cel i gotowość źródeł danych',
    nextAction: worse
      ? 'Sprawdź odchylenie i przypisz właściciela'
      : 'Monitoruj bez eskalacji',
    owner: variant === 'command-variants'
      ? 'Analityka biznesowa'
      : 'Właściciel obszaru',
    priority: worse || record.readiness !== 'ready' ? 'medium' : 'low',
    timebox: worse ? 'dzisiaj' : 'monitoring',
  };
}

/**
 * Top operational decisions across all records: readiness problems and
 * high/critical-priority moves, ranked by {@link attentionWeight} and
 * de-duplicated by next-action + owner so near-identical records don't repeat
 * the same card.
 */
export function buildOperationalDecisions(
  records: readonly CommandCenterRecord[],
  variant?: BusinessScreenDefinition['variant'],
): readonly CommandDecision[] {
  const decisions = [...records]
    .filter((record) => {
      const context = getRecordContext(record, variant);

      return record.readiness !== 'ready'
        || isMetricWorse(record)
        || context.priority === 'critical'
        || context.priority === 'high';
    })
    .sort((left, right) => (
      attentionWeight(right) - attentionWeight(left)
    ))
    .map((record) => {
      const context = getRecordContext(record, variant);

      return {
        ...context,
        deltaLabel: record.delta === null
          ? '—'
          : formatSignedPercent(record.delta),
        id: record.metricId,
        metricLabel: record.label,
        readiness: record.readiness,
        valueLabel: formatMetricValue(record.value, record.unit),
      };
    });

  const seenActions = new Set<string>();

  return decisions.filter((decision) => {
    const actionKey = normalizeLabel(`${decision.nextAction}-${decision.owner}`);

    if (seenActions.has(actionKey)) {
      return false;
    }

    seenActions.add(actionKey);
    return true;
  });
}

/** Ryzyko / Szansa / Dane badge for an Attention card, from its context. */
export function resolveSignalKind(
  record: CommandCenterRecord,
  context: CommandRecordContext,
): CommandSignalKind {
  if (record.readiness !== 'ready') return 'data';

  return context.businessImpact.toLocaleLowerCase('pl-PL').startsWith('szansa')
    || context.businessImpact.toLocaleLowerCase('pl-PL').startsWith('lepsza')
    ? 'opportunity'
    : 'risk';
}

/**
 * `RecommendationView` carries no integration/provider metadata, and no
 * write capability exists anywhere in this codebase for ad budgets, catalog
 * or pricing changes. Every real recommendation therefore resolves to
 * advisory/available. `guided`/`executable` are modeled so the CTA resolver
 * below is correct the day that capability exists, but nothing in this
 * module may produce them from data alone — that would be execution copy for
 * a runtime that can't execute it.
 */
export function resolveRecommendationExecutionState(): RecommendationExecutionState {
  return {
    availability: 'available',
    mode: 'advisory',
  };
}

export function resolveRecommendationCtaLabel(state: RecommendationExecutionState): string {
  if (state.mode === 'guided') {
    return state.availability === 'available'
      ? 'Pokaż instrukcję'
      : 'Wymaga połączenia providera';
  }

  if (state.mode === 'executable') {
    return state.availability === 'available'
      ? 'Sprawdź zmianę'
      : 'Wymaga zatwierdzenia dostępu';
  }

  return 'Zobacz plan działania';
}

/**
 * `RecommendationView` carries no metric reference (see
 * {@link resolveRecommendationRecordForLens}), so matching a record to "its"
 * recommendation is inferred from whether the recommendation text names the
 * record's label. A signal without a match genuinely has no AI recommendation
 * yet — the caller must render that honestly, not invent one.
 */
export function resolveRecommendationForRecord(
  recommendations: readonly CommandCenterData['recommendations'][number][],
  record: CommandCenterRecord,
): CommandCenterData['recommendations'][number] | null {
  const label = normalizeLabel(record.label);

  return recommendations.find((recommendation) => (
    normalizeLabel(`${recommendation.title} ${recommendation.rationale}`).includes(label)
  )) ?? null;
}

/** Shared sign+unit formatting for a delta-like value (see {@link resolveMetricDeviationLabel}). */
export function formatSignedMetricValue(
  value: number,
  unit: CommandCenterRecord['unit'],
): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';

  return `${sign}${formatMetricValue(Math.abs(value), unit)}`;
}

/**
 * The size of the current move in the metric's own unit (value × relative
 * delta) — the same arithmetic already used to size recommendation
 * simulations elsewhere in this module, framed here as "what this signal is
 * worth" rather than fabricated against an unrelated currency.
 */
export function resolveSignalImpactValue(record: CommandCenterRecord): number | null {
  return record.delta === null ? null : record.value * record.delta;
}

/**
 * "Jeśli nic nie zrobisz": extrapolates the metric's current trend to the
 * end of the active date range. Real arithmetic over real inputs (value,
 * delta, elapsed vs. remaining days) — not a fabricated constant. Returns
 * `null` when there isn't enough signal (no delta, or the range can't be
 * parsed) rather than a plausible-looking number.
 */
/** Share of the active date range that has already elapsed, in [0, 1]. `null` when the range can't be parsed. */
export function resolveRangeElapsedRatio(range: DateRange | undefined): number | null {
  if (!range) {
    return null;
  }

  const start = Date.parse(range.from);
  const end = Date.parse(range.to);
  const now = Date.now();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }

  return Math.max(Math.min((now - start) / (end - start), 1), 0);
}

export function resolveNoActionProjection(
  record: CommandCenterRecord,
  range: DateRange | undefined,
): CommandNoActionProjection | null {
  const elapsedRatio = resolveRangeElapsedRatio(range);

  if (record.delta === null || elapsedRatio === null) {
    return null;
  }

  const remainingRatio = 1 - elapsedRatio;

  if (remainingRatio <= 0) {
    return null;
  }

  // Trend so far, projected forward at the same rate for the rest of the
  // period, capped so a very early reading can't extrapolate to nonsense.
  const paceMultiplier = Math.min(remainingRatio / Math.max(elapsedRatio, 0.15), 3);
  const deltaValue = record.value * record.delta * paceMultiplier;

  return {
    deltaValue,
    projectedValue: clampMetricValue(record.value + deltaValue, record.unit),
  };
}

const visitSnapshotStorageKeyPrefix = 'papadata.command-center.last-visit.v1';

function resolveVisitSnapshotStorageKey(workspaceId: string): string {
  return `${visitSnapshotStorageKeyPrefix}.${workspaceId}`;
}

/** Reads the previous visit's snapshot from `localStorage`, if any. */
export function readCommandCenterVisitSnapshot(
  workspaceId: string,
): CommandCenterVisitSnapshot | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(resolveVisitSnapshotStorageKey(workspaceId));

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as CommandCenterVisitSnapshot;
  } catch {
    return null;
  }
}

/** Persists the current visit's snapshot for the next visit's diff. */
export function writeCommandCenterVisitSnapshot(
  workspaceId: string,
  snapshot: CommandCenterVisitSnapshot,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      resolveVisitSnapshotStorageKey(workspaceId),
      JSON.stringify(snapshot),
    );
  } catch {
    // Storage can be unavailable (private mode, quota) — the digest is
    // optional decoration, never a source of truth.
  }
}

export function buildCommandCenterVisitSnapshot(
  records: readonly CommandCenterRecord[],
  recommendationCount: number,
  issueCount: number,
): CommandCenterVisitSnapshot {
  const metrics: Record<string, number> = {};

  records.forEach((record) => {
    metrics[record.metricId] = record.value;
  });

  return {
    issueCount,
    metrics,
    recommendationCount,
    savedAt: new Date().toISOString(),
  };
}

/**
 * Compares the current visit against the last one seen in this browser and
 * returns a digest only when there's something worth surfacing — no prior
 * visit, or no meaningful change, both resolve to `null` so the digest strip
 * disappears rather than showing an empty or repetitive line.
 */
export function resolveCommandCenterVisitDigest(
  previous: CommandCenterVisitSnapshot | null,
  current: CommandCenterVisitSnapshot,
  records: readonly CommandCenterRecord[],
): CommandCenterVisitDigest | null {
  if (!previous) {
    return null;
  }

  const newRecommendationCount = Math.max(
    current.recommendationCount - previous.recommendationCount,
    0,
  );
  const newIssueCount = Math.max(current.issueCount - previous.issueCount, 0);
  const resolvedIssueCount = Math.max(previous.issueCount - current.issueCount, 0);

  const shifts = records
    .flatMap((record) => {
      const previousValue = previous.metrics[record.metricId];

      if (previousValue === undefined || previousValue === 0) {
        return [];
      }

      const deltaRatio = (record.value - previousValue) / Math.abs(previousValue);

      return Math.abs(deltaRatio) >= 0.03
        ? [{ deltaRatio, label: record.label, metricId: record.metricId }]
        : [];
    })
    .sort((left, right) => Math.abs(right.deltaRatio) - Math.abs(left.deltaRatio));

  if (
    newRecommendationCount === 0
    && newIssueCount === 0
    && resolvedIssueCount === 0
    && shifts.length === 0
  ) {
    return null;
  }

  return {
    newIssueCount,
    newRecommendationCount,
    resolvedIssueCount,
    shifts,
  };
}

/**
 * Canonical Papa Assistant opener. `ProductShellFrame` listens for the
 * `papadata:papa-assistant` event with this exact detail shape; a previous
 * version of this module dispatched a differently-named/-shaped event that no
 * listener consumed, which made every "Zbadaj z Papą" affordance in the
 * one-page a dead button. Do not diverge the two again.
 */
export function openPapaAssistant({
  action,
  elementId,
  mode,
}: {
  readonly action: 'analyze-screen' | 'open-element' | 'report';
  readonly elementId?: string;
  readonly mode: 'element' | 'report' | 'screen';
}): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('papadata:papa-assistant', {
    detail: {
      action,
      elementId,
      mode,
    },
  }));
}

export function openPapaAssistantForElement(elementId: string): void {
  openPapaAssistant({
    action: 'open-element',
    elementId,
    mode: 'element',
  });
}

export function openPapaAssistantWithScreenAnalysis(): void {
  openPapaAssistant({
    action: 'analyze-screen',
    mode: 'screen',
  });
}

/*
 * Formatters and readiness resolvers are owned by
 * `commandCenterWorkspaceFormatters.ts`. The one-page re-exports them so both
 * render paths format identically; only the two behavioural differences the
 * one-page relies on are wrapped below.
 */
export {
  formatInteger,
  formatMetricValue,
  formatShortTime,
  formatSignedPercent,
  mapReadinessToAnalyticsState,
  resolveDataStateLabel,
  resolveImpactLabel,
  resolveReadinessLabel,
} from '../commandCenterWorkspaceFormatters';

/** Charts need a printable unit, so the nullable workspace label is flattened. */
export function resolveUnitLabel(unit: CommandCenterRecord['unit']): string {
  return resolveWorkspaceUnitLabel(unit) ?? '';
}

/** Ratios reaching the one-page can be non-finite; never print "NaN%". */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return '\u2014';
  }

  return formatWorkspacePercent(value);
}

export function shortenMetricLabel(label: string): string {
  return label
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+vs\s+/gi, ' / ')
    .trim();
}

export function interpolateNumber(start: number, end: number, ratio: number): number {
  return start + (end - start) * ratio;
}

export function clampMetricValue(value: number, unit: CommandCenterRecord['unit']): number {
  if (!Number.isFinite(value)) return 0;
  if (unit === 'percent') return Math.max(Math.min(value, 1), 0);
  if (unit === 'ratio') return Math.max(value, 0);

  return Math.max(value, 0);
}

export function normalizeLabel(value: string): string {
  return value
    .toLocaleLowerCase('pl-PL')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l');
}
