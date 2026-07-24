import { randomUUID } from "node:crypto";
import type {
  DatasetReadinessAssessment,
  DimensionAssessment,
  ReadinessDimension,
} from "@papadata/contracts";

export type ReadinessInput = Omit<
  DatasetReadinessAssessment,
  "assessmentId" | "dimensions" | "allowedKpis" | "blockedKpis" | "assessedAt"
> & {
  readonly dimensions: Readonly<Record<ReadinessDimension, DimensionAssessment>>;
  readonly requiredDimensionsByKpi: Readonly<Record<string, readonly ReadinessDimension[]>>;
};

export function evaluateDatasetReadiness(input: ReadinessInput): DatasetReadinessAssessment {
  const dimensions = Object.values(input.dimensions);
  const allowedKpis: string[] = [];
  const blockedKpis: string[] = [];
  for (const [kpi, requiredDimensions] of Object.entries(input.requiredDimensionsByKpi)) {
    const ready = requiredDimensions.every(
      (dimension) => input.dimensions[dimension].state === "ready",
    );
    (ready ? allowedKpis : blockedKpis).push(kpi);
  }
  return {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    assessmentId: randomUUID(),
    dataset: input.dataset,
    periodFrom: input.periodFrom,
    periodTo: input.periodTo,
    currency: input.currency,
    timezone: input.timezone,
    dimensions,
    allowedKpis,
    blockedKpis,
    owner: input.owner,
    nextActions: input.nextActions,
    assessedAt: new Date().toISOString() as DatasetReadinessAssessment["assessedAt"],
  };
}
