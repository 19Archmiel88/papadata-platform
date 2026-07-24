import type { IsoDateTime, TenantWorkspaceScope } from "./index.js";

export const readinessDimensions = [
  "completeness",
  "freshness",
  "schema",
  "currency",
  "lineage",
  "overlap",
  "financial_integrity",
  "uniqueness",
  "source_coverage",
] as const;

export type ReadinessDimension = (typeof readinessDimensions)[number];

export type DimensionAssessment = {
  readonly dimension: ReadinessDimension;
  readonly state: "ready" | "partial" | "blocked" | "unknown";
  readonly score: number | null;
  readonly limitations: readonly string[];
  readonly evidenceReferences: readonly string[];
};

export type DatasetReadinessAssessment = TenantWorkspaceScope & {
  readonly assessmentId: string;
  readonly dataset: string;
  readonly periodFrom: IsoDateTime;
  readonly periodTo: IsoDateTime;
  readonly currency: string;
  readonly timezone: string;
  readonly dimensions: readonly DimensionAssessment[];
  readonly allowedKpis: readonly string[];
  readonly blockedKpis: readonly string[];
  readonly owner: string;
  readonly nextActions: readonly string[];
  readonly assessedAt: IsoDateTime;
};
