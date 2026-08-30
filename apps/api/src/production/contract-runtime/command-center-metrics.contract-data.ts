import type { IsoDateTime } from "@papadata/contracts";
import {
  centsToDecimal,
  computeMetricEngineSeries,
  decimalToCents,
  isRevenueQualifyingOrder,
  type DashboardMetricCode,
  type MetricEngineInput,
  type MetricReadiness,
} from "../../metrics/metricEngineCore.ts";
import {
  createRealMetricEngineInput,
  dedupeGa4CanonicalRows,
  readEntity,
  readEntityNumber,
  readEntityString,
  readRowString,
  type CommandCenterDataSource,
} from "./command-center-metrics.real-source.ts";
import {
  commandCenterRecord,
  type CommandCenterReadiness,
  type CommandCenterRuntimeRecord,
} from "./command-center-record.js";
import {
  classifyCustomerOrders,
  CUSTOMER_HISTORY_FLOOR,
} from "./customer-lifecycle.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_TIMEZONE = "Europe/Warsaw";
const KPI_WINDOW_DAYS = 30;
const SPARKLINE_DAYS = 10;
const MIN_CORRELATION_SAMPLE_SIZE = 14;
const PLAN_ACTUAL_DAYS = 21;
const PLAN_FORECAST_DAYS = 9;
const MAX_WINDOW_DAYS = 366;

const COMMAND_CENTER_METRIC_CODES: readonly DashboardMetricCode[] = [
  "ad_spend",
  "aov",
  "gross_order_value",
  "orders",
  "platform_attributed_conversions",
  "platform_attributed_revenue",
  "product_margin",
  "product_revenue",
  "return_value",
  "revenue_after_refunds",
  "roas",
];

const PLAN_PERFORMANCE_METRIC_CODES: readonly DashboardMetricCode[] = [
  "revenue_after_refunds",
];

type MetricEngineSeries = ReturnType<typeof computeMetricEngineSeries>;

const commandCenterSeriesByInput = new WeakMap<MetricEngineInput, MetricEngineSeries>();

type DailyMetricRow = {
  readonly date: string;
  readonly values: Partial<Record<DashboardMetricCode, string | null>>;
};

/** The date-only range the UI's date-range picker sends (`YYYY-MM-DD`, inclusive on both ends). */
export type CommandCenterDateRangeInput = {
  readonly from: string;
  readonly timezone?: string | null;
  readonly to: string;
};

type DateOnlyParts = {
  readonly day: number;
  readonly month: number;
  readonly year: number;
};

export type MetricWindow = {
  readonly periodEnd: IsoDateTime;
  readonly periodStart: IsoDateTime;
  readonly timezone: string;
};

type PlanWindow = MetricWindow & {
  readonly actualFromDateOnly: string;
  readonly actualToDateOnly: string;
  readonly forecastDays: number;
  readonly priorPeriodEnd: IsoDateTime;
  readonly priorPeriodStart: IsoDateTime;
};

function parseDateOnly(value: string): DateOnlyParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return candidate.getUTCFullYear() === year
    && candidate.getUTCMonth() === month - 1
    && candidate.getUTCDate() === day
    ? { day, month, year }
    : null;
}

function isValidDateOnly(value: string): boolean {
  return parseDateOnly(value) !== null;
}

function normalizeTimeZone(value: string | null | undefined): string {
  if (!value) {
    return DEFAULT_TIMEZONE;
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date(0));
    return value;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

function datePartsInTimeZone(isoDateTime: string, timezone: string): DateOnlyParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: timezone,
    year: "numeric",
  }).formatToParts(new Date(isoDateTime));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    day: Number(values.day),
    month: Number(values.month),
    year: Number(values.year),
  };
}

function dateOnlyInTimeZone(isoDateTime: string, timezone: string): string {
  const { day, month, year } = datePartsInTimeZone(isoDateTime, timezone);
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function timeZoneOffsetMs(instantMs: number, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone: timezone,
    year: "numeric",
  }).formatToParts(new Date(instantMs));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const representedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return representedAsUtc - Math.floor(instantMs / 1000) * 1000;
}

/** Converts a local calendar midnight in the requested IANA timezone to its UTC instant. */
function dateOnlyToIso(dateOnly: string, timezone: string): IsoDateTime {
  const parsed = parseDateOnly(dateOnly);
  if (!parsed) {
    throw new Error(`Invalid date-only value: ${dateOnly}`);
  }

  const wallClockUtc = Date.UTC(parsed.year, parsed.month - 1, parsed.day);
  let instantMs = wallClockUtc;

  // Two passes resolve DST offsets around the target wall-clock instant.
  for (let pass = 0; pass < 3; pass += 1) {
    instantMs = wallClockUtc - timeZoneOffsetMs(instantMs, timezone);
  }

  return new Date(instantMs).toISOString() as IsoDateTime;
}

function addDaysToDateOnly(dateOnly: string, days: number): string {
  const parsed = parseDateOnly(dateOnly);
  if (!parsed) {
    throw new Error(`Invalid date-only value: ${dateOnly}`);
  }

  return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

function daysBetweenDateOnly(fromDateOnly: string, toDateOnly: string): number {
  const from = parseDateOnly(fromDateOnly);
  const to = parseDateOnly(toDateOnly);
  if (!from || !to) {
    return 0;
  }

  const fromMs = Date.UTC(from.year, from.month - 1, from.day);
  const toMs = Date.UTC(to.year, to.month - 1, to.day);
  return Math.max(0, Math.round((toMs - fromMs) / DAY_MS));
}

/** Caps an inclusive caller-supplied range to MAX_WINDOW_DAYS without moving `to`. */
function capRangeFrom(from: string, to: string): string {
  return daysBetweenDateOnly(from, to) >= MAX_WINDOW_DAYS
    ? addDaysToDateOnly(to, -(MAX_WINDOW_DAYS - 1))
    : from;
}

/**
 * Turns the UI's inclusive local-calendar range into the metric engine's
 * [periodStart, periodEnd) UTC window while preserving the request timezone.
 * A date such as 2026-08-20 in Europe/Warsaw starts at 2026-08-19T22:00Z,
 * not midnight UTC. That distinction is material for transactions around
 * day boundaries and DST changes.
 */
// Exported so sibling real-data builders (e.g. orders-analytics.real-source.ts)
// resolve the same UTC window from a UI date-range picker instead of a
// second, driftable copy of this timezone-aware logic.
export function resolveMetricWindow(
  generatedAt: string,
  dateRange: CommandCenterDateRangeInput | null,
  fallbackDays: number,
): MetricWindow {
  const timezone = normalizeTimeZone(dateRange?.timezone);
  const todayDateOnly = dateOnlyInTimeZone(generatedAt, timezone);
  const fallbackFromDateOnly = addDaysToDateOnly(todayDateOnly, -(fallbackDays - 1));
  const fallback = {
    periodEnd: generatedAt as IsoDateTime,
    periodStart: dateOnlyToIso(fallbackFromDateOnly, timezone),
    timezone,
  };

  if (
    !dateRange
    || !isValidDateOnly(dateRange.from)
    || !isValidDateOnly(dateRange.to)
    || dateRange.from > dateRange.to
  ) {
    return fallback;
  }

  const periodStart = dateOnlyToIso(capRangeFrom(dateRange.from, dateRange.to), timezone);
  const exclusiveEnd = dateOnlyToIso(addDaysToDateOnly(dateRange.to, 1), timezone);
  const periodEnd = Date.parse(exclusiveEnd) < Date.parse(generatedAt)
    ? exclusiveEnd
    : (generatedAt as IsoDateTime);

  return Date.parse(periodEnd) > Date.parse(periodStart)
    ? { periodEnd, periodStart, timezone }
    : fallback;
}

/**
 * Resolves the elapsed selected period, its equally-sized immediately
 * preceding comparison period, and remaining future days. The previous
 * period is what the benchmark is computed from; no current-period value is
 * allowed to manufacture its own target.
 */
function resolvePlanWindow(
  generatedAt: string,
  dateRange: CommandCenterDateRangeInput | null,
): PlanWindow {
  const timezone = normalizeTimeZone(dateRange?.timezone);
  const todayDateOnly = dateOnlyInTimeZone(generatedAt, timezone);
  const fallbackActualFrom = addDaysToDateOnly(todayDateOnly, -(PLAN_ACTUAL_DAYS - 1));
  const fallbackPriorTo = addDaysToDateOnly(fallbackActualFrom, -1);
  const fallbackPriorFrom = addDaysToDateOnly(fallbackPriorTo, -(PLAN_ACTUAL_DAYS - 1));
  const fallback: PlanWindow = {
    actualFromDateOnly: fallbackActualFrom,
    actualToDateOnly: todayDateOnly,
    forecastDays: PLAN_FORECAST_DAYS,
    periodEnd: generatedAt as IsoDateTime,
    periodStart: dateOnlyToIso(fallbackActualFrom, timezone),
    priorPeriodEnd: dateOnlyToIso(fallbackActualFrom, timezone),
    priorPeriodStart: dateOnlyToIso(fallbackPriorFrom, timezone),
    timezone,
  };

  if (
    !dateRange
    || !isValidDateOnly(dateRange.from)
    || !isValidDateOnly(dateRange.to)
    || dateRange.from > dateRange.to
  ) {
    return fallback;
  }

  const boundedFrom = capRangeFrom(dateRange.from, dateRange.to);
  const actualToDateOnly = dateRange.to < todayDateOnly ? dateRange.to : todayDateOnly;
  if (boundedFrom > actualToDateOnly) {
    return fallback;
  }

  const periodStart = dateOnlyToIso(boundedFrom, timezone);
  const periodEnd = actualToDateOnly === todayDateOnly
    ? (generatedAt as IsoDateTime)
    : dateOnlyToIso(addDaysToDateOnly(actualToDateOnly, 1), timezone);
  const forecastDays = dateRange.to > todayDateOnly
    ? daysBetweenDateOnly(todayDateOnly, dateRange.to)
    : 0;
  const actualDays = daysBetweenDateOnly(boundedFrom, actualToDateOnly) + 1;
  const priorToDateOnly = addDaysToDateOnly(boundedFrom, -1);
  const priorFromDateOnly = addDaysToDateOnly(priorToDateOnly, -(actualDays - 1));

  return Date.parse(periodEnd) > Date.parse(periodStart)
    ? {
        actualFromDateOnly: boundedFrom,
        actualToDateOnly,
        forecastDays,
        periodEnd,
        periodStart,
        priorPeriodEnd: periodStart,
        priorPeriodStart: dateOnlyToIso(priorFromDateOnly, timezone),
        timezone,
      }
    : fallback;
}

function computeCommandCenterMetricSeries(input: MetricEngineInput): MetricEngineSeries {
  const cached = commandCenterSeriesByInput.get(input);
  if (cached) {
    return cached;
  }

  const series = computeMetricEngineSeries(input, COMMAND_CENTER_METRIC_CODES);
  commandCenterSeriesByInput.set(input, series);
  return series;
}

/**
 * Real AOV/ad_spend/ROAS/revenue/orders KPI records, computed by the
 * canonical metric engine instead of hardcoded literals. Ad spend is read
 * directly from the ad_spend metric — never derived as revenue / ROAS,
 * which would silently assume a revenue semantics the engine doesn't
 * guarantee.
 */
export async function buildCommandCenterKpiOverrides(
  tenantId: string,
  workspaceId: string,
  generatedAt: string,
  dataSource: CommandCenterDataSource,
  dateRange: CommandCenterDateRangeInput | null = null,
): Promise<{
  readonly revenue: CommandCenterRuntimeRecord;
  readonly orders: CommandCenterRuntimeRecord;
  readonly cartConversion: CommandCenterRuntimeRecord;
  readonly aov: CommandCenterRuntimeRecord;
  readonly adSpend: CommandCenterRuntimeRecord;
  readonly roas: CommandCenterRuntimeRecord;
  readonly cpa: CommandCenterRuntimeRecord;
  readonly ga4Freshness: CommandCenterRuntimeRecord;
  readonly grossMargin: CommandCenterRuntimeRecord;
}> {
  const { periodEnd, periodStart, timezone } = resolveMetricWindow(generatedAt, dateRange, KPI_WINDOW_DAYS);
  const planWindow = resolvePlanWindow(generatedAt, dateRange);
  const [input, currentTrafficRows, previousTrafficRows, currentEventRows, previousEventRows] = await Promise.all([
    createRealMetricEngineInput({
      dataSource,
      generatedAt: generatedAt as IsoDateTime,
      periodEnd,
      periodStart,
      tenantId,
      timezone,
      workspaceId,
    }),
    dataSource.listCanonicalRecords(tenantId, workspaceId, {
      businessTimeFrom: periodStart,
      businessTimeTo: periodEnd,
      streams: ["traffic"],
    }),
    dataSource.listCanonicalRecords(tenantId, workspaceId, {
      businessTimeFrom: planWindow.priorPeriodStart,
      businessTimeTo: planWindow.priorPeriodEnd,
      streams: ["traffic"],
    }),
    dataSource.listCanonicalRecords(tenantId, workspaceId, {
      businessTimeFrom: periodStart,
      businessTimeTo: periodEnd,
      streams: ["events"],
    }),
    dataSource.listCanonicalRecords(tenantId, workspaceId, {
      businessTimeFrom: planWindow.priorPeriodStart,
      businessTimeTo: planWindow.priorPeriodEnd,
      streams: ["events"],
    }),
  ]);
  const { aggregate, daily, lastSuccessfulSyncAt, providers, readiness } = computeCommandCenterMetricSeries(input);
  const currentFunnel = aggregateFunnelSteps(dedupeGa4CanonicalRows(currentEventRows, "events"));
  const previousFunnel = aggregateFunnelSteps(dedupeGa4CanonicalRows(previousEventRows, "events"));
  const currentCartConversion = cartConversionRate(currentFunnel);
  const previousCartConversion = cartConversionRate(previousFunnel);
  const currentGa4Freshness = averageTrafficCompleteness(dedupeGa4CanonicalRows(currentTrafficRows, "traffic"));
  const previousGa4Freshness = averageTrafficCompleteness(dedupeGa4CanonicalRows(previousTrafficRows, "traffic"));
  const attributedConversions = numberOrNull(aggregate.platform_attributed_conversions);
  const adSpendValue = numberOrNull(aggregate.ad_spend);
  const grossMargin = grossMarginFromKnownProductCosts(input);
  const cpa = adSpendValue !== null && attributedConversions !== null && attributedConversions > 0
    ? adSpendValue / attributedConversions
    : null;
  const derivedReady = (...values: readonly (number | null)[]): CommandCenterReadiness => (
    values.every((value) => value !== null) ? "ready" : "unavailable"
  );
  const sparkline = (code: DashboardMetricCode) => dailySparkline(daily, code, SPARKLINE_DAYS);
  const recordReadiness = (code: DashboardMetricCode) => toCommandCenterReadiness(readiness[code]);
  const recordProviders = (code: DashboardMetricCode) => providers[code] ?? [];
  const recordSyncAt = (code: DashboardMetricCode) => lastSuccessfulSyncAt[code] ?? null;
  // cpa is derived from two metric codes (adSpend / attributedConversions),
  // not one -- combine both, mirroring providersFor's per-metric attribution
  // instead of fabricating a single source.
  const cpaProviders = [...new Set([...recordProviders("ad_spend"), ...recordProviders("platform_attributed_conversions")])].sort();
  const cpaSyncAt = [recordSyncAt("ad_spend"), recordSyncAt("platform_attributed_conversions")]
    .filter((value): value is IsoDateTime => value !== null)
    .sort()
    .at(-1) ?? null;

  return {
    adSpend: commandCenterRecord(
      "11111111-1111-4111-8111-111111111110",
      "Koszt reklamy",
      numberOrZero(aggregate.ad_spend),
      "currency",
      weekOverWeekDelta(daily, "ad_spend"),
      null,
      recordReadiness("ad_spend"),
      sparkline("ad_spend"),
      recordProviders("ad_spend"),
      recordSyncAt("ad_spend"),
    ),
    aov: commandCenterRecord(
      "11111111-1111-4111-8111-111111111109",
      "AOV",
      numberOrZero(aggregate.aov),
      "currency",
      null,
      null,
      recordReadiness("aov"),
      sparkline("aov"),
      recordProviders("aov"),
      recordSyncAt("aov"),
    ),
    cartConversion: commandCenterRecord(
      "11111111-1111-4111-8111-111111111102",
      "Konwersja koszyka",
      currentCartConversion ?? 0,
      "percent",
      relativeDelta(currentCartConversion, previousCartConversion),
      0.035,
      derivedReady(currentCartConversion),
    ),
    cpa: commandCenterRecord(
      "11111111-1111-4111-8111-111111111111",
      "CPA",
      cpa ?? 0,
      "currency",
      null,
      cpa === null ? null : cpa * 0.92,
      derivedReady(cpa),
      undefined,
      cpaProviders,
      cpaSyncAt,
    ),
    ga4Freshness: commandCenterRecord(
      "11111111-1111-4111-8111-111111111104",
      "Kompletność danych GA4",
      currentGa4Freshness ?? 0,
      "percent",
      relativeDelta(currentGa4Freshness, previousGa4Freshness),
      0.98,
      derivedReady(currentGa4Freshness),
    ),
    grossMargin: commandCenterRecord(
      "11111111-1111-4111-8111-111111111105",
      "Marża brutto",
      grossMargin ?? 0,
      "percent",
      null,
      0.34,
      derivedReady(grossMargin),
    ),
    orders: commandCenterRecord(
      "11111111-1111-4111-8111-111111111108",
      "Liczba zamówień",
      numberOrZero(aggregate.orders),
      "number",
      weekOverWeekDelta(daily, "orders"),
      null,
      recordReadiness("orders"),
      sparkline("orders"),
      recordProviders("orders"),
      recordSyncAt("orders"),
    ),
    revenue: commandCenterRecord(
      "11111111-1111-4111-8111-111111111101",
      "Przychód netto",
      numberOrZero(aggregate.revenue_after_refunds),
      "currency",
      weekOverWeekDelta(daily, "revenue_after_refunds"),
      null,
      recordReadiness("revenue_after_refunds"),
      sparkline("revenue_after_refunds"),
      recordProviders("revenue_after_refunds"),
      recordSyncAt("revenue_after_refunds"),
    ),
    roas: commandCenterRecord(
      "11111111-1111-4111-8111-111111111103",
      "ROAS blended",
      numberOrZero(aggregate.roas),
      "ratio",
      null,
      null,
      recordReadiness("roas"),
      sparkline("roas"),
      recordProviders("roas"),
      recordSyncAt("roas"),
    ),
  };
}

function relativeDelta(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) {
    return null;
  }

  return round4((current - previous) / previous);
}

function grossMarginFromKnownProductCosts(input: MetricEngineInput): number | null {
  const qualifyingOrders = new Set(
    input.canonicalOrders
      .filter((order) => order.currency === input.currency && isRevenueQualifyingOrder(order))
      .map((order) => order.canonicalOrderId),
  );
  const productById = new Map(input.canonicalProducts.map((product) => [product.canonicalProductId, product] as const));
  const costBySku = new Map(
    input.productCosts
      .filter((cost) => cost.currency === input.currency)
      .map((cost) => [cost.sku, Number(cost.unitCostAmount)] as const),
  );
  let revenue = 0;
  let cost = 0;

  for (const line of input.canonicalOrderLines) {
    if (!qualifyingOrders.has(line.canonicalOrderId) || !line.canonicalProductId) {
      continue;
    }

    const product = productById.get(line.canonicalProductId);
    const unitCost = product?.sku ? costBySku.get(product.sku) : undefined;
    const grossAmount = Number(line.grossAmount);
    if (unitCost === undefined || !Number.isFinite(grossAmount)) {
      continue;
    }

    revenue += grossAmount;
    cost += unitCost * line.quantity;
  }

  return revenue > 0 ? round4((revenue - cost) / revenue) : null;
}

function dailySparkline(
  daily: readonly DailyMetricRow[],
  code: DashboardMetricCode,
  days: number,
): readonly number[] {
  // Missing observations are unknown, not zero. Compress only the visible
  // tail's real values; MetricCard already suppresses a sparkline with fewer
  // than two points, which is more honest than drawing invented zero dips.
  return daily.slice(-days).flatMap((day) => {
    const value = numberOrNull(day.values[code]);
    return value === null ? [] : [value];
  });
}

/**
 * Trajectory for the "Plan vs Benchmark" section: real daily actuals from the
 * canonical metric engine over the selected date range's elapsed days, a
 * benchmark line spread evenly across the whole range (no real
 * budgeting/planning subsystem exists yet, so this is deliberately a
 * transparent previous-period run-rate benchmark — previous daily average,
 * never a fabricated, approved business target — and a
 * deterministic linear run-rate forecast for the range's remaining days. No
 * ML, no curve-fitting: forecastMethod documents exactly what was computed.
 * The frontend must present `planTotal`/`trajectory.plan` as a benchmark or
 * run-rate, not as "Cel okresu" / "Plan" / "Gap do celu" — those words claim
 * a real business plan this system does not have.
 */
export async function buildCommandCenterPlanPerformanceData(
  tenantId: string,
  workspaceId: string,
  generatedAt: string,
  dataSource: CommandCenterDataSource,
  dateRange: CommandCenterDateRangeInput | null = null,
): Promise<{
  readonly trajectory: readonly { date: string; actual: number | null; plan: number; forecast: number | null }[];
  readonly planTotal: number;
  readonly forecastTotal: number;
  readonly forecastMethod: "linear-run-rate";
  readonly benchmarkSemantics: "previous-period-run-rate";
}> {
  const {
    actualToDateOnly,
    forecastDays,
    periodEnd,
    periodStart,
    priorPeriodEnd,
    priorPeriodStart,
    timezone,
  } = resolvePlanWindow(generatedAt, dateRange);
  const [currentInput, previousInput] = await Promise.all([
    createRealMetricEngineInput({
      dataSource,
      generatedAt: generatedAt as IsoDateTime,
      periodEnd,
      periodStart,
      tenantId,
      timezone,
      workspaceId,
    }),
    createRealMetricEngineInput({
      dataSource,
      generatedAt: generatedAt as IsoDateTime,
      periodEnd: priorPeriodEnd,
      periodStart: priorPeriodStart,
      tenantId,
      timezone,
      workspaceId,
    }),
  ]);
  // This endpoint only needs revenue-after-refunds. Computing the full
  // Command Center metric set for both windows duplicated expensive daily
  // fact expansion and pushed a 90-day request past the BFF 5s timeout.
  // The previous period is aggregate-only because no previous daily points
  // are rendered; the current period keeps daily points for the trajectory.
  const current = computeMetricEngineSeries(currentInput, PLAN_PERFORMANCE_METRIC_CODES);
  const previous = computeMetricEngineSeries(
    previousInput,
    PLAN_PERFORMANCE_METRIC_CODES,
    { includeDaily: false },
  );

  const actualTotalValue = numberOrNull(current.aggregate.revenue_after_refunds);
  const previousTotalValue = numberOrNull(previous.aggregate.revenue_after_refunds);
  const actualTotal = actualTotalValue ?? 0;
  const dailyAverage = actualTotalValue !== null && current.daily.length > 0
    ? actualTotalValue / current.daily.length
    : 0;
  // A benchmark is shown only when the previous period is genuinely usable.
  // Its daily average is the whole-period aggregate divided by calendar days,
  // so a legitimate zero-sales day stays zero rather than being dropped from
  // the denominator. Unknown/incomplete previous data produces no benchmark.
  const previousIsReady = previous.readiness.revenue_after_refunds === "ready";
  // resolvePlanWindow always constructs the previous period with the same
  // number of local calendar days as the current elapsed period. Reuse the
  // current day count rather than materializing a previous daily series that
  // the response never exposes.
  const previousAverage = previousIsReady
    && previousTotalValue !== null
    && current.daily.length > 0
    ? previousTotalValue / current.daily.length
    : 0;
  const dailyBenchmark = previousAverage > 0 ? previousAverage : 0;
  const totalDays = current.daily.length + forecastDays;
  const planTotal = round2(dailyBenchmark * totalDays);
  const forecastTotal = round2(actualTotal + dailyAverage * forecastDays);

  const trajectory = [
    ...current.daily.map((day) => ({
      actual: numberOrNull(day.values.revenue_after_refunds),
      date: dateOnlyToIso(day.date, timezone),
      forecast: null,
      plan: round2(dailyBenchmark),
    })),
    ...Array.from({ length: forecastDays }, (_unused, index) => ({
      actual: null,
      date: dateOnlyToIso(addDaysToDateOnly(actualToDateOnly, index + 1), timezone),
      forecast: round2(dailyAverage),
      plan: round2(dailyBenchmark),
    })),
  ];

  return {
    benchmarkSemantics: "previous-period-run-rate" as const,
    forecastMethod: "linear-run-rate" as const,
    forecastTotal,
    planTotal,
    trajectory,
  };
}

const DRIVER_RELATIONSHIP_POINT_DAYS = 14;

type CorrelationDriverDefinition = {
  readonly xCode: DashboardMetricCode;
  readonly xLabel: string;
  readonly xMetricId: string;
  readonly yCode: DashboardMetricCode;
  readonly yLabel: string;
  readonly yMetricId: string;
};

/**
 * Efficiency is correlated against attributed ad revenue, never ROAS.
 * ROAS = platform_attributed_revenue / ad_spend, so correlating ad_spend
 * against ROAS would measure ad_spend against a ratio that already has
 * ad_spend in its own denominator — a spurious "ratio correlation"
 * (Pearson, 1897), not a real efficiency signal: scaling spend up
 * mechanically pulls that ratio down even with no real change in campaign
 * quality. Correlating spend directly against the revenue it's attributed
 * to producing is the "response" relationship marketers actually care
 * about, and doesn't share a variable with itself on both axes.
 */
const EFFICIENCY_RELATIONSHIP: CorrelationDriverDefinition = {
  xCode: "ad_spend",
  xLabel: "Koszt mediów",
  xMetricId: "22222222-2222-4222-8222-222222222212",
  yCode: "platform_attributed_revenue",
  yLabel: "Przychód z reklam (attributed)",
  yMetricId: "22222222-2222-4222-8222-222222222213",
};

export type DriverRelationshipData = {
  readonly basis: "correlation" | "insufficient-data";
  readonly coefficient: number | null;
  readonly points: readonly { readonly id: string; readonly label: string; readonly x: number; readonly y: number }[];
  readonly sampleSize: number;
  readonly xLabel: string;
  readonly xMetricId: string;
  readonly yLabel: string;
  readonly yMetricId: string;
};

export type DriverDecompositionData = {
  readonly basis: "decomposition";
  readonly endValue: number;
  readonly priceEffect: number;
  readonly priceLabel: string;
  readonly sampleSize: number;
  readonly startValue: number;
  readonly unit: "currency";
  readonly volumeEffect: number;
  readonly volumeLabel: string;
};

/**
 * A real Pearson correlation between two metrics' daily series, both
 * computed by the canonical engine over the same window and genuinely
 * paired by date — never two independently-fabricated series (the old
 * the old implementation independently generated unrelated sample curves). When
 * there isn't enough real paired history or a series is flat, returns an
 * explicit `insufficient-data` basis with no replacement statistic.
 * `points` are the same real daily pairs the chart plots — never resampled
 * separately from what the coefficient was computed over.
 */
function buildCorrelationRelationship(
  daily: readonly DailyMetricRow[],
  definition: CorrelationDriverDefinition,
): DriverRelationshipData {
  const realPairs = daily.flatMap((day) => {
    const x = numberOrNull(day.values[definition.xCode]);
    const y = numberOrNull(day.values[definition.yCode]);

    return x === null || y === null
      ? []
      : [{ id: day.date, label: day.date, x, y }];
  });
  // The coefficient, sample size and chart must describe the exact same
  // observations. Keeping only the visible tail also prevents an r computed
  // over a hidden 30-day population from being presented beside 14 points.
  const points = realPairs.slice(-DRIVER_RELATIONSHIP_POINT_DAYS);
  const xSeries = points.map((point) => point.x);
  const ySeries = points.map((point) => point.y);
  const sampleSize = points.length;
  const canCorrelate = sampleSize >= MIN_CORRELATION_SAMPLE_SIZE
    && hasVariance(xSeries)
    && hasVariance(ySeries);

  return {
    basis: canCorrelate ? "correlation" : "insufficient-data",
    coefficient: canCorrelate ? round4(pearsonCorrelation(xSeries, ySeries)) : null,
    points,
    sampleSize,
    xLabel: definition.xLabel,
    xMetricId: definition.xMetricId,
    yLabel: definition.yLabel,
    yMetricId: definition.yMetricId,
  };
}

/**
 * Revenue split into a volume effect and a basket-value (AOV) effect using
 * exact algebra — gross_order_value == orders * aov by construction, always
 * — instead of correlating orders against AOV directly. That correlation
 * would be spurious for the same reason ad_spend-vs-ROAS is: AOV's formula
 * divides by orders, so "orders is correlated with AOV" is partly just the
 * shared denominator, not a real economic relationship. This sequential
 * decomposition instead attributes the real change in gross order value
 * between the first and second half of the window exactly to (a) how much
 * order count moved, valued at the old basket size, then (b) how much the
 * basket size moved, valued at the new order count. The two effects always
 * sum exactly to the real change — no statistical residual, nothing to
 * misread as causal from a coefficient.
 */
function buildVolumeDecomposition(daily: readonly DailyMetricRow[]): DriverDecompositionData {
  const pairedRows = daily.filter((day) => (
    numberOrNull(day.values.orders) !== null
    && numberOrNull(day.values.gross_order_value) !== null
  ));
  const half = Math.floor(pairedRows.length / 2);
  const firstHalf = pairedRows.slice(0, half);
  const secondHalf = pairedRows.slice(half);

  const ordersA = averageMetricValue(firstHalf, "orders");
  const ordersB = averageMetricValue(secondHalf, "orders");
  const grossA = averageMetricValue(firstHalf, "gross_order_value");
  const grossB = averageMetricValue(secondHalf, "gross_order_value");
  const aovA = ordersA > 0 ? grossA / ordersA : 0;
  const aovB = ordersB > 0 ? grossB / ordersB : 0;

  const sampleSize = pairedRows.length;

  return {
    basis: "decomposition",
    endValue: round2(ordersB * aovB),
    priceEffect: round2(ordersB * (aovB - aovA)),
    priceLabel: "Wartość koszyka (AOV)",
    sampleSize,
    startValue: round2(ordersA * aovA),
    unit: "currency",
    volumeEffect: round2((ordersB - ordersA) * aovA),
    volumeLabel: "Liczba zamówień",
  };
}

function averageMetricValue(rows: readonly DailyMetricRow[], code: DashboardMetricCode): number {
  if (rows.length === 0) {
    return 0;
  }

  return rows.reduce((sum, row) => sum + numberOrZero(row.values[code]), 0) / rows.length;
}

/**
 * Result drivers for the two "Drivery wyniku" lenses: revenue's Orders x AOV
 * decomposition (exact algebra, see {@link buildVolumeDecomposition}) and
 * marketing's ad_spend-vs-attributed-revenue correlation (see
 * {@link buildCorrelationRelationship}). Neither implies causation from a
 * coefficient — the UI must not claim one metric "causes" a move in another
 * from either of these.
 */
export async function buildCommandCenterDriversData(
  tenantId: string,
  workspaceId: string,
  generatedAt: string,
  dataSource: CommandCenterDataSource,
  dateRange: CommandCenterDateRangeInput | null = null,
): Promise<{
  readonly driverRelationships: {
    readonly efficiency: DriverRelationshipData;
    readonly volume: DriverDecompositionData;
  };
}> {
  const { periodEnd, periodStart, timezone } = resolveMetricWindow(generatedAt, dateRange, KPI_WINDOW_DAYS);
  const input = await createRealMetricEngineInput({
    dataSource,
    generatedAt: generatedAt as IsoDateTime,
    periodEnd,
    periodStart,
    tenantId,
    timezone,
    workspaceId,
  });
  const { daily } = computeCommandCenterMetricSeries(input);

  return {
    driverRelationships: {
      efficiency: buildCorrelationRelationship(daily, EFFICIENCY_RELATIONSHIP),
      volume: buildVolumeDecomposition(daily),
    },
  };
}

export type TrafficSourceRow = {
  readonly sessions: number;
  readonly source: string;
  readonly users: number;
};

type FunnelStepAggregate = {
  readonly order: number;
  readonly stepId: string;
  readonly label: string;
  readonly entrants: number;
  readonly completions: number;
};

export type CustomerSegmentRow = {
  readonly id: "new" | "returning";
  readonly segment: string;
  readonly customers: number;
  readonly revenue: string;
  readonly rawRevenue: number;
  readonly productsPerOrder: number;
  readonly arpu: number;
  readonly frequency: number;
};

export type CommittedActionRow = {
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
  readonly status: "approved" | "executing" | "measured" | "proposed" | "rejected";
  readonly title: string;
};

const COMMAND_CENTER_FUNNEL_STAGES = [
  { eventName: "session_start", label: "Sesja → widok produktu", stepId: "session_start" },
  { eventName: "view_item", label: "Widok produktu → dodanie do koszyka", stepId: "view_item" },
  { eventName: "add_to_cart", label: "Koszyk → rozpoczęcie checkoutu", stepId: "add_to_cart" },
  { eventName: "begin_checkout", label: "Checkout → zakup", stepId: "begin_checkout" },
  { eventName: "purchase", label: "Zakup", stepId: "purchase" },
] as const;

function aggregateFunnelSteps(rows: readonly Record<string, unknown>[]): readonly FunnelStepAggregate[] {
  const usersByEvent = new Map<string, number>();

  for (const row of rows) {
    if (readRowString(row.provider_id) !== "ga4" || readRowString(row.stream) !== "events") {
      continue;
    }

    const entity = readEntity(row.canonical_payload);
    const eventName = readEntityString(entity, "eventName");
    if (!eventName) {
      continue;
    }

    const users = readEntityNumber(entity, "users") ?? readEntityNumber(entity, "eventCount") ?? 0;
    usersByEvent.set(eventName, (usersByEvent.get(eventName) ?? 0) + Math.max(0, users));
  }

  return COMMAND_CENTER_FUNNEL_STAGES.slice(0, -1).map((stage, index) => {
    const next = COMMAND_CENTER_FUNNEL_STAGES[index + 1]!;
    return {
      completions: usersByEvent.get(next.eventName) ?? 0,
      entrants: usersByEvent.get(stage.eventName) ?? 0,
      label: stage.label,
      order: index,
      stepId: stage.stepId,
    };
  });
}

function cartConversionRate(steps: readonly FunnelStepAggregate[]): number | null {
  const checkout = steps.find((step) => {
    const id = step.stepId.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
    return id === "checkout" || id === "checkout_start" || id === "begin_checkout";
  });

  if (checkout) {
    return checkout.entrants > 0
      ? round4(checkout.completions / checkout.entrants)
      : null;
  }

  // Compatibility fallback for older canonical traffic rows that did not
  // identify the checkout step explicitly. This preserves the former
  // first-to-last funnel ratio without overriding the cart-specific metric
  // when a real checkout step is available.
  const first = steps[0];
  const last = steps[steps.length - 1];

  if (!first || !last || first.entrants <= 0) {
    return null;
  }

  return round4(last.completions / first.entrants);
}

function averageTrafficCompleteness(rows: readonly Record<string, unknown>[]): number | null {
  const values = rows.flatMap((row) => {
    if (readRowString(row.provider_id) !== "ga4" || readRowString(row.stream) !== "traffic") {
      return [];
    }

    const payload = row.canonical_payload;
    if (!isRecord(payload) || !isRecord(payload.quality)) {
      return [];
    }
    const status = payload.quality.status;
    if (status === "valid") {
      return [1];
    }
    if (status !== "partial") {
      return [];
    }
    const missingCount = Array.isArray(payload.quality.missingFields)
      ? payload.quality.missingFields.length
      : 1;
    return [Math.max(0, 1 - missingCount * 0.25)];
  });

  return values.length > 0 ? round4(average(values)) : null;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Sessions/users per GA4 channel group (`traffic` stream, dimension
 * `sessionDefaultChannelGroup`) for the selected window. Deliberately
 * excludes revenue/CR/CTR: GA4 reports revenue/conversions against a
 * different dimension (`sessionSourceMedium`, the separate `conversions`
 * stream) than the channel group read here, and joining across two
 * different session-attribution dimensions would silently misattribute
 * conversions to the wrong channel. Only GA4 rows are read — no other
 * provider produces a `traffic` stream today.
 */
export async function buildCommandCenterTrafficSourcesData(
  tenantId: string,
  workspaceId: string,
  generatedAt: string,
  dataSource: CommandCenterDataSource,
  dateRange: CommandCenterDateRangeInput | null = null,
): Promise<{ readonly trafficSources: readonly TrafficSourceRow[] }> {
  const { periodEnd, periodStart } = resolveMetricWindow(generatedAt, dateRange, KPI_WINDOW_DAYS);
  const rows = await dataSource.listCanonicalRecords(tenantId, workspaceId, {
    businessTimeFrom: periodStart,
    businessTimeTo: periodEnd,
    streams: ["traffic"],
  });

  const byChannel = new Map<string, { sessions: number; users: number }>();
  for (const row of dedupeGa4CanonicalRows(rows, "traffic")) {
    const entity = readEntity(row.canonical_payload);
    const source = readEntityString(entity, "channel") ?? readEntityString(entity, "source");
    if (!source) {
      continue;
    }
    const entry = byChannel.get(source) ?? { sessions: 0, users: 0 };
    entry.sessions += readEntityNumber(entity, "sessions") ?? 0;
    entry.users += readEntityNumber(entity, "users") ?? 0;
    byChannel.set(source, entry);
  }

  const trafficSources = [...byChannel.entries()]
    .map(([source, totals]) => ({ source, ...totals }))
    .sort((left, right) => right.sessions - left.sessions);

  return { trafficSources };
}

export async function buildCommandCenterFunnelData(
  tenantId: string,
  workspaceId: string,
  generatedAt: string,
  dataSource: CommandCenterDataSource,
  dateRange: CommandCenterDateRangeInput | null = null,
): Promise<{
  readonly steps: readonly { readonly stepId: string; readonly label: string; readonly entrants: number; readonly completions: number; readonly conversionRate: number }[];
}> {
  const { periodEnd, periodStart } = resolveMetricWindow(generatedAt, dateRange, KPI_WINDOW_DAYS);
  const rows = await dataSource.listCanonicalRecords(tenantId, workspaceId, {
    businessTimeFrom: periodStart,
    businessTimeTo: periodEnd,
    streams: ["events"],
  });

  return {
    steps: aggregateFunnelSteps(dedupeGa4CanonicalRows(rows, "events")).map((step) => ({
      completions: Math.round(step.completions),
      conversionRate: step.entrants > 0 ? round4(step.completions / step.entrants) : 0,
      entrants: Math.round(step.entrants),
      label: step.label,
      stepId: step.stepId,
    })),
  };
}

export async function buildCommandCenterCustomerSegmentsData(
  tenantId: string,
  workspaceId: string,
  generatedAt: string,
  dataSource: CommandCenterDataSource,
  dateRange: CommandCenterDateRangeInput | null = null,
): Promise<{ readonly customerSegments: readonly CustomerSegmentRow[] }> {
  const { periodEnd, periodStart, timezone } = resolveMetricWindow(generatedAt, dateRange, KPI_WINDOW_DAYS);
  // New-vs-returning can only be decided from a customer's FULL order
  // history, not just this window (see customer-lifecycle.ts) -- so both
  // fetches reach back to the real ingestion floor, not periodStart.
  const [allTimeInput, rows] = await Promise.all([
    createRealMetricEngineInput({
      dataSource,
      generatedAt: generatedAt as IsoDateTime,
      periodEnd,
      periodStart: CUSTOMER_HISTORY_FLOOR as IsoDateTime,
      tenantId,
      timezone,
      workspaceId,
    }),
    dataSource.listCanonicalRecords(tenantId, workspaceId, {
      businessTimeFrom: CUSTOMER_HISTORY_FLOOR,
      businessTimeTo: periodEnd,
      streams: ["orders"],
    }),
  ]);
  const qualifyingOrders = allTimeInput.canonicalOrders.filter(
    (order) => order.currency === allTimeInput.currency && isRevenueQualifyingOrder(order),
  );
  const classified = classifyCustomerOrders(qualifyingOrders, rows);
  const entityByOrderId = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    const providerId = readRowString(row.provider_id);
    const externalId = readRowString(row.external_id);
    if (providerId && externalId) {
      entityByOrderId.set(`${providerId}:${externalId}`, readEntity(row.canonical_payload));
    }
  }
  const bySegment = new Map<"new" | "returning", {
    readonly customers: Set<string>;
    orders: number;
    quantity: number;
    revenue: number;
  }>();

  for (const { customerReference, isFirstOrder, order } of classified) {
    // Only orders that actually fall in the reporting window count toward
    // this window's new/returning totals -- a customer's history outside the
    // window is only used above to decide isFirstOrder correctly.
    if (order.orderedAt < periodStart || order.orderedAt >= periodEnd) {
      continue;
    }
    const entity = entityByOrderId.get(order.canonicalOrderId) ?? {};
    const revenue = Number.parseFloat(order.grossAmount);
    if (!Number.isFinite(revenue)) {
      continue;
    }

    const segment = isFirstOrder ? "new" : "returning";
    const entry = bySegment.get(segment) ?? {
      customers: new Set<string>(),
      orders: 0,
      quantity: 0,
      revenue: 0,
    };
    entry.customers.add(customerReference);
    entry.orders += 1;
    entry.revenue += revenue;
    entry.quantity += orderQuantity(entity);
    bySegment.set(segment, entry);
  }

  const rowsOut: CustomerSegmentRow[] = [];
  for (const [id, entry] of bySegment.entries()) {
    const customers = Math.max(entry.customers.size, 1);
    rowsOut.push({
      arpu: round2(entry.revenue / customers),
      customers: entry.customers.size,
      frequency: round2(entry.orders / customers),
      id,
      productsPerOrder: entry.orders > 0 ? round2(entry.quantity / entry.orders) : 0,
      rawRevenue: round2(entry.revenue),
      revenue: round2(entry.revenue).toFixed(2),
      segment: id === "returning" ? "Powracający klienci" : "Nowi klienci",
    });
  }

  return {
    customerSegments: rowsOut.sort((left, right) => right.rawRevenue - left.rawRevenue),
  };
}

function orderQuantity(entity: Record<string, unknown>): number {
  const lineItems = entity.lineItems;
  if (!Array.isArray(lineItems)) {
    return 0;
  }

  return lineItems.reduce((sum, line) => {
    if (typeof line !== "object" || line === null || Array.isArray(line)) {
      return sum;
    }

    const quantity = readEntityNumber(line as Record<string, unknown>, "quantity");
    return sum + (quantity ?? 0);
  }, 0);
}

export type ProductSalesRow = {
  readonly canonicalProductId: string;
  readonly changePercent: number | null;
  readonly productName: string;
  readonly quantity: number;
  readonly revenue: string;
};

type ProductLineTotals = { revenueCents: bigint; quantity: number };

/**
 * Sums real order-line grossAmount/quantity per product, counting only
 * lines whose order is revenue-qualifying (mirrors
 * REVENUE_EXCLUDED_ORDER_STATUSES exactly via the exported
 * `isRevenueQualifyingOrder` — same rule the metric engine itself uses for
 * revenue_after_refunds, so this breakdown never disagrees with the
 * headline KPI about which orders count). A line without a resolved
 * canonicalProductId is dropped rather than grouped under a fabricated
 * "unknown product" bucket.
 */
function aggregateRevenueQualifyingProductLines(input: MetricEngineInput): Map<string, ProductLineTotals> {
  const revenueQualifyingOrderIds = new Set(
    input.canonicalOrders
      .filter((order) => order.currency === input.currency && isRevenueQualifyingOrder(order))
      .map((order) => order.canonicalOrderId),
  );
  const totals = new Map<string, ProductLineTotals>();

  for (const line of input.canonicalOrderLines) {
    if (!line.canonicalProductId || !revenueQualifyingOrderIds.has(line.canonicalOrderId)) {
      continue;
    }
    const entry = totals.get(line.canonicalProductId) ?? { quantity: 0, revenueCents: 0n };
    entry.revenueCents += decimalToCents(line.grossAmount);
    entry.quantity += line.quantity;
    totals.set(line.canonicalProductId, entry);
  }

  return totals;
}

/**
 * Real per-product revenue/quantity for the selected window, from each
 * order's real line items, plus period-over-period change against the
 * immediately preceding, equally-sized period (same window resolution as
 * "Plan vs Benchmark", see resolvePlanWindow). Deliberately has no
 * new-customer/returning-customer revenue split: that requires a canonical
 * customer identity this system does not have yet (same blocker as the
 * Customer Split section), so it is left out entirely rather than
 * approximated.
 */
export async function buildCommandCenterProductSalesData(
  tenantId: string,
  workspaceId: string,
  generatedAt: string,
  dataSource: CommandCenterDataSource,
  dateRange: CommandCenterDateRangeInput | null = null,
): Promise<{ readonly productSales: readonly ProductSalesRow[] }> {
  const { periodEnd, periodStart, priorPeriodEnd, priorPeriodStart, timezone } = resolvePlanWindow(
    generatedAt,
    dateRange,
  );
  const [currentInput, previousInput] = await Promise.all([
    createRealMetricEngineInput({
      dataSource, generatedAt: generatedAt as IsoDateTime, periodEnd, periodStart, tenantId, timezone, workspaceId,
    }),
    createRealMetricEngineInput({
      dataSource,
      generatedAt: generatedAt as IsoDateTime,
      periodEnd: priorPeriodEnd,
      periodStart: priorPeriodStart,
      tenantId,
      timezone,
      workspaceId,
    }),
  ]);

  const currentTotals = aggregateRevenueQualifyingProductLines(currentInput);
  const previousTotals = aggregateRevenueQualifyingProductLines(previousInput);
  const productNames = new Map(
    currentInput.canonicalProducts.map((product) => [product.canonicalProductId, product.name] as const),
  );

  const productSales = [...currentTotals.entries()]
    .sort(([, left], [, right]) => (
      right.revenueCents > left.revenueCents ? 1 : right.revenueCents < left.revenueCents ? -1 : 0
    ))
    .map(([canonicalProductId, totals]) => {
      const previous = previousTotals.get(canonicalProductId);
      const changePercent = previous && previous.revenueCents > 0n
        ? round2((Number(totals.revenueCents - previous.revenueCents) / Number(previous.revenueCents)) * 100)
        : null;

      return {
        canonicalProductId,
        changePercent,
        productName: productNames.get(canonicalProductId) ?? canonicalProductId,
        quantity: totals.quantity,
        revenue: centsToDecimal(totals.revenueCents),
      };
    });

  return { productSales };
}

export function buildCommandCenterRecommendationsData(
  _records: readonly CommandCenterRuntimeRecord[],
): {
  readonly recommendations: readonly {
    readonly confidence: number;
    readonly impact: "high" | "low" | "medium";
    readonly rationale: string;
    readonly recommendationId: string;
    readonly title: string;
  }[];
} {
  // Command Center does not yet have a persisted recommendation/AI inference
  // source. Returning an empty collection is deliberate: deterministic rules
  // must not be presented as AI output with fabricated confidence scores.
  return { recommendations: [] };
}

export function buildCommandCenterCommittedActionsData(
  _records: readonly CommandCenterRuntimeRecord[],
): { readonly committedActions: readonly CommittedActionRow[] } {
  // Actions belong to the decisions/action registry. Until this endpoint is
  // backed by that persisted source, do not manufacture owners, due dates,
  // progress, statuses or measurements.
  return { committedActions: [] };
}

export async function buildCommandCenterWaterfallData(
  tenantId: string,
  workspaceId: string,
  generatedAt: string,
  dataSource: CommandCenterDataSource,
  dateRange: CommandCenterDateRangeInput | null = null,
): Promise<{
  readonly waterfall: readonly { readonly key: string; readonly label: string; readonly value: number; readonly cumulativeValue: number }[];
}> {
  const { periodEnd, periodStart, timezone } = resolveMetricWindow(generatedAt, dateRange, KPI_WINDOW_DAYS);
  const input = await createRealMetricEngineInput({
    dataSource,
    generatedAt: generatedAt as IsoDateTime,
    periodEnd,
    periodStart,
    tenantId,
    timezone,
    workspaceId,
  });
  const { aggregate } = computeCommandCenterMetricSeries(input);
  const gross = numberOrZero(aggregate.gross_order_value);
  const returns = numberOrZero(aggregate.return_value);
  const adSpend = numberOrZero(aggregate.ad_spend);
  const productRevenue = numberOrZero(aggregate.product_revenue);
  const productMargin = numberOrZero(aggregate.product_margin);
  const productCost = Math.max(productRevenue - productMargin, 0);
  const items = [
    { key: "gross", label: "Przychód brutto", value: gross },
    { key: "refunds", label: "Zwroty", value: -returns },
    { key: "product-cost", label: "Koszt produktów", value: -productCost },
    { key: "ad-spend", label: "Koszt reklam", value: -adSpend },
  ];
  let cumulative = 0;
  const waterfall = items.map((item) => {
    cumulative = round2(cumulative + item.value);
    return { ...item, cumulativeValue: cumulative };
  });

  return {
    waterfall: [
      ...waterfall,
      {
        cumulativeValue: cumulative,
        key: "contribution",
        label: "Wynik po kosztach",
        value: cumulative,
      },
    ],
  };
}

function pearsonCorrelation(xs: readonly number[], ys: readonly number[]): number {
  const meanX = average(xs);
  const meanY = average(ys);
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let index = 0; index < xs.length; index += 1) {
    const dx = xs[index] - meanX;
    const dy = ys[index] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}

function hasVariance(series: readonly number[]): boolean {
  return series.some((value) => value !== series[0]);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function weekOverWeekDelta(daily: readonly DailyMetricRow[], code: DashboardMetricCode): number | null {
  if (daily.length < 14) {
    return null;
  }

  const recentValues = daily.slice(-7).map((row) => numberOrNull(row.values[code]));
  const priorValues = daily.slice(-14, -7).map((row) => numberOrNull(row.values[code]));

  // A missing daily metric is unknown, not zero. Do not manufacture a WoW
  // delta from an incomplete pair of weeks.
  const recentNumbers = recentValues.filter((value): value is number => value !== null);
  const priorNumbers = priorValues.filter((value): value is number => value !== null);
  if (recentNumbers.length !== 7 || priorNumbers.length !== 7) {
    return null;
  }

  const recentSum = recentNumbers.reduce((sum, value) => sum + value, 0);
  const priorSum = priorNumbers.reduce((sum, value) => sum + value, 0);

  if (priorSum === 0) {
    return null;
  }

  return round4((recentSum - priorSum) / priorSum);
}

function numberOrNull(value: string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function numberOrZero(value: string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}


function toCommandCenterReadiness(readiness: MetricReadiness | undefined): CommandCenterReadiness {
  switch (readiness) {
    case "ready":
      return "ready";
    case "partial":
      return "partial";
    case "stale":
      return "stale";
    default:
      // "invalid"/"no_data"/"unavailable"/undefined all mean the same thing
      // to the dashboard: don't show this as usable, ready data.
      return "unavailable";
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}
