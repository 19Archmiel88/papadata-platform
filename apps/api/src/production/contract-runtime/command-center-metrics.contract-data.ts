import type { IsoDateTime } from "@papadata/contracts";
import {
  computeMetricEngineSeries,
  type DashboardMetricCode,
  type MetricReadiness,
} from "../../metrics/metricEngineCore.ts";
import {
  createRealMetricEngineInput,
  type CommandCenterDataSource,
} from "./command-center-metrics.real-source.ts";
import {
  commandCenterRecord,
  type CommandCenterReadiness,
  type CommandCenterRuntimeRecord,
} from "./command-center-record.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_TIMEZONE = "Europe/Warsaw";
const KPI_WINDOW_DAYS = 30;
const SPARKLINE_DAYS = 10;
const MIN_CORRELATION_SAMPLE_SIZE = 14;
const PLAN_GROWTH_FACTOR = 1.08;
const PLAN_ACTUAL_DAYS = 21;
const PLAN_FORECAST_DAYS = 9;
const MAX_WINDOW_DAYS = 366;

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

type MetricWindow = {
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
function resolveMetricWindow(
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
  readonly aov: CommandCenterRuntimeRecord;
  readonly adSpend: CommandCenterRuntimeRecord;
  readonly roas: CommandCenterRuntimeRecord;
}> {
  const codes: readonly DashboardMetricCode[] = [
    "revenue_after_refunds",
    "orders",
    "ad_spend",
    "aov",
    "roas",
  ];
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
  const { aggregate, daily, readiness } = computeMetricEngineSeries(input, codes);
  const sparkline = (code: DashboardMetricCode) => dailySparkline(daily, code, SPARKLINE_DAYS);
  const recordReadiness = (code: DashboardMetricCode) => toCommandCenterReadiness(readiness[code]);

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
    ),
  };
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
 * transparent run-rate benchmark — previous daily average x
 * PLAN_GROWTH_FACTOR — never a fabricated, approved business target), and a
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
  const current = computeMetricEngineSeries(currentInput, ["revenue_after_refunds"]);
  const previous = computeMetricEngineSeries(previousInput, ["revenue_after_refunds"]);

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
  const previousAverage = previousIsReady
    && previousTotalValue !== null
    && previous.daily.length > 0
    ? previousTotalValue / previous.daily.length
    : 0;
  const dailyBenchmark = previousAverage > 0 ? previousAverage * PLAN_GROWTH_FACTOR : 0;
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
  const codes: readonly DashboardMetricCode[] = [
    "orders",
    "gross_order_value",
    EFFICIENCY_RELATIONSHIP.xCode,
    EFFICIENCY_RELATIONSHIP.yCode,
  ];
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
  const { daily } = computeMetricEngineSeries(input, codes);

  return {
    driverRelationships: {
      efficiency: buildCorrelationRelationship(daily, EFFICIENCY_RELATIONSHIP),
      volume: buildVolumeDecomposition(daily),
    },
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
