export type CommandCenterReadiness = "partial" | "ready" | "stale" | "unavailable";

export type CommandCenterMetricUnit = "currency" | "duration" | "number" | "percent" | "ratio";

export type CommandCenterRuntimeRecord = {
  readonly delta: number | null;
  readonly label: string;
  // Provider ids and last successful sync backing this KPI's value -- see
  // metricEngineCore.ts's computeMetricEngineSeries/MetricSnapshotRecord.
  // Empty/null for cards not (yet) driven by a single versioned metric code.
  readonly lastSuccessfulSyncAt: string | null;
  readonly metricId: string;
  readonly providers: readonly string[];
  readonly readiness: CommandCenterReadiness;
  readonly sparkline?: readonly number[];
  readonly target: number | null;
  readonly unit: CommandCenterMetricUnit;
  readonly value: number;
};

export function commandCenterRecord(
  metricId: string,
  label: string,
  value: number,
  unit: CommandCenterMetricUnit,
  delta: number | null,
  target: number | null,
  readiness: CommandCenterReadiness,
  sparkline?: readonly number[],
  providers: readonly string[] = [],
  lastSuccessfulSyncAt: string | null = null,
): CommandCenterRuntimeRecord {
  return {
    delta,
    label,
    lastSuccessfulSyncAt,
    metricId,
    providers,
    readiness,
    ...(sparkline ? { sparkline } : {}),
    target,
    unit,
    value,
  };
}
