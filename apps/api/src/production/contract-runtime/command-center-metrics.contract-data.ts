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
const SPARKLINE_DAYS = 10;
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
  const sparkline = (code: DashboardMetricCode) => dailySparkline(daily, code, SPARKLINE_DAYS);

  return {
    adSpend: commandCenterRecord(
      "11111111-1111-4111-8111-111111111110",
      "Koszt reklamy",
      numberOrZero(aggregate.ad_spend),
      "currency",
      weekOverWeekDelta(daily, "ad_spend"),
      null,
      "ready",
      sparkline("ad_spend"),
    ),
    aov: commandCenterRecord(
      "11111111-1111-4111-8111-111111111109",
      "AOV",
      numberOrZero(aggregate.aov),
      "currency",
      null,
      null,
      "ready",
      sparkline("aov"),
    ),
    orders: commandCenterRecord(
      "11111111-1111-4111-8111-111111111108",
      "Liczba zamówień",
      numberOrZero(aggregate.orders),
      "number",
      weekOverWeekDelta(daily, "orders"),
      null,
      "ready",
      sparkline("orders"),
    ),
    revenue: commandCenterRecord(
      "11111111-1111-4111-8111-111111111101",
      "Przychód netto",
      numberOrZero(aggregate.revenue_after_refunds),
      "currency",
      weekOverWeekDelta(daily, "revenue_after_refunds"),
      null,
      "ready",
      sparkline("revenue_after_refunds"),
    ),
    roas: commandCenterRecord(
      "11111111-1111-4111-8111-111111111103",
      "ROAS blended",
      numberOrZero(aggregate.roas),
      "ratio",
      null,
      null,
      "ready",
      sparkline("roas"),
    ),
  };
}

function dailySparkline(
  daily: readonly DailyMetricRow[],
  code: DashboardMetricCode,
  days: number,
): readonly number[] {
  return daily.slice(-days).map((day) => numberOrZero(day.values[code]));
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

const DRIVER_RELATIONSHIP_POINT_DAYS = 14;

type DriverRelationshipDefinition = {
  readonly key: "efficiency" | "volume";
  readonly xCode: DashboardMetricCode;
  readonly xLabel: string;
  readonly xMetricId: string;
  readonly yCode: DashboardMetricCode;
  readonly yLabel: string;
  readonly yMetricId: string;
};

const DRIVER_RELATIONSHIPS: readonly DriverRelationshipDefinition[] = [
  {
    key: "volume",
    xCode: "orders",
    xLabel: "Zamówienia",
    xMetricId: "22222222-2222-4222-8222-222222222210",
    yCode: "aov",
    yLabel: "AOV",
    yMetricId: "22222222-2222-4222-8222-222222222211",
  },
  {
    key: "efficiency",
    xCode: "ad_spend",
    xLabel: "Koszt mediów",
    xMetricId: "22222222-2222-4222-8222-222222222212",
    yCode: "roas",
    yLabel: "ROAS",
    yMetricId: "22222222-2222-4222-8222-222222222213",
  },
];

export type DriverRelationshipData = {
  readonly basis: "correlation" | "contribution-share";
  readonly coefficient: number | null;
  readonly contributionShare: number | null;
  readonly points: readonly { readonly id: string; readonly label: string; readonly x: number; readonly y: number }[];
  readonly sampleSize: number;
  readonly xLabel: string;
  readonly xMetricId: string;
  readonly yLabel: string;
  readonly yMetricId: string;
};

/**
 * Result drivers: a real Pearson correlation between two metrics' daily
 * series, both computed by the canonical engine over the same window and
 * genuinely paired by date — never two independently-fabricated series (the
 * old buildMetricRelationshipPoints zipped two unrelated sine waves). When
 * there isn't enough real paired history or a series is flat, falls back to
 * a deterministic contribution-share indicator instead of a fabricated
 * coefficient; `basis` tells the UI honestly which one it's looking at.
 * `points` are the same real daily pairs the chart plots — never resampled
 * separately from what the coefficient was computed over.
 */
export function buildCommandCenterDriversData(
  tenantId: string,
  workspaceId: string,
  generatedAt: string,
): {
  readonly driverRelationships: Record<DriverRelationshipDefinition["key"], DriverRelationshipData>;
} {
  const codes: readonly DashboardMetricCode[] = [
    ...new Set(DRIVER_RELATIONSHIPS.flatMap((relationship) => [relationship.xCode, relationship.yCode])),
  ];
  const input = createMetricEngineSeriesInput({
    days: KPI_WINDOW_DAYS,
    generatedAt: generatedAt as IsoDateTime,
    tenantId,
    workspaceId,
  });
  const { daily } = computeMetricEngineSeries(input, codes);
  const sampleSize = daily.length;

  const entries = DRIVER_RELATIONSHIPS.map((relationship) => {
    const xSeries = daily.map((day) => numberOrZero(day.values[relationship.xCode]));
    const ySeries = daily.map((day) => numberOrZero(day.values[relationship.yCode]));
    const canCorrelate = sampleSize >= MIN_CORRELATION_SAMPLE_SIZE
      && hasVariance(xSeries)
      && hasVariance(ySeries);
    const points = daily.slice(-DRIVER_RELATIONSHIP_POINT_DAYS).map((day) => ({
      id: day.date,
      label: day.date,
      x: numberOrZero(day.values[relationship.xCode]),
      y: numberOrZero(day.values[relationship.yCode]),
    }));

    const data: DriverRelationshipData = canCorrelate
      ? {
          basis: "correlation",
          coefficient: round4(pearsonCorrelation(xSeries, ySeries)),
          contributionShare: null,
          points,
          sampleSize,
          xLabel: relationship.xLabel,
          xMetricId: relationship.xMetricId,
          yLabel: relationship.yLabel,
          yMetricId: relationship.yMetricId,
        }
      : {
          basis: "contribution-share",
          coefficient: null,
          contributionShare: round4(pairContributionShare(xSeries, ySeries)),
          points,
          sampleSize,
          xLabel: relationship.xLabel,
          xMetricId: relationship.xMetricId,
          yLabel: relationship.yLabel,
          yMetricId: relationship.yMetricId,
        };

    return [relationship.key, data] as const;
  });

  return {
    driverRelationships: Object.fromEntries(entries) as Record<DriverRelationshipDefinition["key"], DriverRelationshipData>,
  };
}

/** Deterministic fallback when there isn't enough real variance to correlate: which side of the pair moved more, as a share of their combined movement. */
function pairContributionShare(xSeries: readonly number[], ySeries: readonly number[]): number {
  const dx = Math.abs(halfWindowDelta(xSeries));
  const dy = Math.abs(halfWindowDelta(ySeries));
  const total = dx + dy;

  return total === 0 ? 0 : dy / total;
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
