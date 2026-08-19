import type { IsoDateTime } from "@papadata/contracts";
import {
  computeMetricEngineSeries,
  createMetricEngineSeriesInput,
  type DashboardMetricCode,
} from "../../metrics/metricEngineCore.ts";
import {
  commandCenterRecord,
  type CommandCenterRuntimeRecord,
} from "./command-center-record.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const KPI_WINDOW_DAYS = 30;
const MIN_CORRELATION_SAMPLE_SIZE = 14;
const PLAN_GROWTH_FACTOR = 1.08;
const PLAN_ACTUAL_DAYS = 21;
const PLAN_FORECAST_DAYS = 9;

type DailyMetricRow = {
  readonly date: string;
  readonly values: Partial<Record<DashboardMetricCode, string | null>>;
};

/**
 * Real AOV/ad_spend/ROAS/revenue/orders KPI records, computed by the
 * canonical metric engine instead of hardcoded literals. Ad spend is read
 * directly from the ad_spend metric — never derived as revenue / ROAS,
 * which would silently assume a revenue semantics the engine doesn't
 * guarantee.
 */
export function buildCommandCenterKpiOverrides(
  tenantId: string,
  workspaceId: string,
  generatedAt: string,
): {
  readonly revenue: CommandCenterRuntimeRecord;
  readonly orders: CommandCenterRuntimeRecord;
  readonly aov: CommandCenterRuntimeRecord;
  readonly adSpend: CommandCenterRuntimeRecord;
  readonly roas: CommandCenterRuntimeRecord;
} {
  const codes: readonly DashboardMetricCode[] = [
    "revenue_after_refunds",
    "orders",
    "ad_spend",
    "aov",
    "roas",
  ];
  const input = createMetricEngineSeriesInput({
    days: KPI_WINDOW_DAYS,
    generatedAt: generatedAt as IsoDateTime,
    tenantId,
    workspaceId,
  });
  const { aggregate, daily } = computeMetricEngineSeries(input, codes);

  return {
    adSpend: commandCenterRecord(
      "11111111-1111-4111-8111-111111111110",
      "Koszt reklamy",
      numberOrZero(aggregate.ad_spend),
      "currency",
      weekOverWeekDelta(daily, "ad_spend"),
      null,
      "ready",
    ),
    aov: commandCenterRecord(
      "11111111-1111-4111-8111-111111111109",
      "AOV",
      numberOrZero(aggregate.aov),
      "currency",
      null,
      null,
      "ready",
    ),
    orders: commandCenterRecord(
      "11111111-1111-4111-8111-111111111108",
      "Liczba zamówień",
      numberOrZero(aggregate.orders),
      "number",
      weekOverWeekDelta(daily, "orders"),
      null,
      "ready",
    ),
    revenue: commandCenterRecord(
      "11111111-1111-4111-8111-111111111101",
      "Przychód netto",
      numberOrZero(aggregate.revenue_after_refunds),
      "currency",
      weekOverWeekDelta(daily, "revenue_after_refunds"),
      null,
      "ready",
    ),
    roas: commandCenterRecord(
      "11111111-1111-4111-8111-111111111103",
      "ROAS blended",
      numberOrZero(aggregate.roas),
      "ratio",
      null,
      null,
      "ready",
    ),
  };
}

/**
 * Plan vs Prognoza trajectory: real daily actuals from the canonical metric
 * engine for the elapsed window, plan spread evenly across the whole window
 * (no real budgeting subsystem exists yet — target growth over run-rate is
 * a transparent placeholder, not a fabricated business goal), and a
 * deterministic linear run-rate forecast for the remaining days. No ML, no
 * curve-fitting: forecastMethod documents exactly what was computed.
 */
export function buildCommandCenterPlanPerformanceData(
  tenantId: string,
  workspaceId: string,
  generatedAt: string,
): {
  readonly trajectory: readonly { date: string; actual: number | null; plan: number; forecast: number | null }[];
  readonly planTotal: number;
  readonly forecastTotal: number;
  readonly forecastMethod: "linear-run-rate";
} {
  const input = createMetricEngineSeriesInput({
    days: PLAN_ACTUAL_DAYS,
    generatedAt: generatedAt as IsoDateTime,
    tenantId,
    workspaceId,
  });
  const { aggregate, daily } = computeMetricEngineSeries(input, ["revenue_after_refunds"]);

  const actualTotal = numberOrZero(aggregate.revenue_after_refunds);
  const dailyAverage = daily.length > 0 ? actualTotal / daily.length : 0;
  const dailyPlan = dailyAverage * PLAN_GROWTH_FACTOR;
  const totalDays = PLAN_ACTUAL_DAYS + PLAN_FORECAST_DAYS;
  const planTotal = round2(dailyPlan * totalDays);
  const forecastTotal = round2(actualTotal + dailyAverage * PLAN_FORECAST_DAYS);
  const windowEndMs = Date.parse(generatedAt);

  const trajectory = [
    ...daily.map((day) => ({
      actual: round2(numberOrZero(day.values.revenue_after_refunds)),
      date: `${day.date}T00:00:00.000Z`,
      forecast: null,
      plan: round2(dailyPlan),
    })),
    ...Array.from({ length: PLAN_FORECAST_DAYS }, (_unused, index) => ({
      actual: null,
      date: new Date(windowEndMs + index * DAY_MS).toISOString(),
      forecast: round2(dailyAverage),
      plan: round2(dailyPlan),
    })),
  ];

  return {
    forecastMethod: "linear-run-rate" as const,
    forecastTotal,
    planTotal,
    trajectory,
  };
}

const DRIVER_CANDIDATES: readonly {
  readonly code: DashboardMetricCode;
  readonly label: string;
  readonly metricId: string;
}[] = [
  { code: "ad_spend", label: "Wydatki na reklamę", metricId: "22222222-2222-4222-8222-222222222201" },
  { code: "platform_attributed_conversions", label: "Konwersje reklamowe", metricId: "22222222-2222-4222-8222-222222222202" },
  { code: "aov", label: "Średnia wartość zamówienia", metricId: "22222222-2222-4222-8222-222222222203" },
];

/**
 * Result drivers: a real Pearson correlation between each candidate metric's
 * daily series and revenue, both computed by the canonical engine over the
 * same window — never two independently-fabricated series. When there
 * isn't enough real paired history (or a series is flat), falls back to a
 * deterministic contribution-share indicator instead of a fabricated
 * coefficient; `basis` tells the UI honestly which one it's looking at.
 */
export function buildCommandCenterDriversData(
  tenantId: string,
  workspaceId: string,
  generatedAt: string,
): {
  readonly drivers: readonly {
    readonly metricId: string;
    readonly label: string;
    readonly basis: "correlation" | "contribution-share";
    readonly coefficient: number | null;
    readonly contributionShare: number | null;
    readonly sampleSize: number;
  }[];
} {
  const codes: readonly DashboardMetricCode[] = [
    "revenue_after_refunds",
    ...DRIVER_CANDIDATES.map((candidate) => candidate.code),
  ];
  const input = createMetricEngineSeriesInput({
    days: KPI_WINDOW_DAYS,
    generatedAt: generatedAt as IsoDateTime,
    tenantId,
    workspaceId,
  });
  const { daily } = computeMetricEngineSeries(input, codes);
  const outcomeSeries = daily.map((day) => numberOrZero(day.values.revenue_after_refunds));
  const sampleSize = daily.length;

  const drivers = DRIVER_CANDIDATES.map((candidate) => {
    const driverSeries = daily.map((day) => numberOrZero(day.values[candidate.code]));
    const canCorrelate = sampleSize >= MIN_CORRELATION_SAMPLE_SIZE
      && hasVariance(driverSeries)
      && hasVariance(outcomeSeries);

    if (canCorrelate) {
      return {
        basis: "correlation" as const,
        coefficient: round4(pearsonCorrelation(driverSeries, outcomeSeries)),
        contributionShare: null,
        label: candidate.label,
        metricId: candidate.metricId,
        sampleSize,
      };
    }

    return {
      basis: "contribution-share" as const,
      coefficient: null,
      contributionShare: round4(contributionShare(candidate.code, daily)),
      label: candidate.label,
      metricId: candidate.metricId,
      sampleSize,
    };
  });

  return { drivers };
}

function contributionShare(code: DashboardMetricCode, daily: readonly DailyMetricRow[]): number {
  const deltas = DRIVER_CANDIDATES.map((candidate) =>
    Math.abs(halfWindowDelta(daily.map((day) => numberOrZero(day.values[candidate.code])))));
  const totalAbsDelta = deltas.reduce((sum, value) => sum + value, 0);

  if (totalAbsDelta === 0) {
    return 0;
  }

  const index = DRIVER_CANDIDATES.findIndex((candidate) => candidate.code === code);
  return deltas[index] / totalAbsDelta;
}

function halfWindowDelta(series: readonly number[]): number {
  if (series.length < 2) {
    return 0;
  }

  const half = Math.floor(series.length / 2);
  return average(series.slice(half)) - average(series.slice(0, half));
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

  const recentSum = sumValues(daily.slice(-7), code);
  const priorSum = sumValues(daily.slice(-14, -7), code);

  if (priorSum === 0) {
    return null;
  }

  return round4((recentSum - priorSum) / priorSum);
}

function sumValues(rows: readonly DailyMetricRow[], code: DashboardMetricCode): number {
  return rows.reduce((sum, row) => sum + numberOrZero(row.values[code]), 0);
}

function numberOrZero(value: string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}
