export type CommandCenterReadiness = "partial" | "ready" | "stale" | "unavailable";

export type CommandCenterMetricUnit = "currency" | "duration" | "number" | "percent" | "ratio";

export type CommandCenterRuntimeRecord = {
  readonly delta: number | null;
  readonly label: string;
  readonly metricId: string;
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
): CommandCenterRuntimeRecord {
  return {
    delta,
    label,
    metricId,
    readiness,
    ...(sparkline ? { sparkline } : {}),
    target,
    unit,
    value,
  };
}
