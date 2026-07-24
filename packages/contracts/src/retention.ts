import type { IsoDateTime, TenantWorkspaceScope } from "./index.js";

export type DataInventoryEntry = TenantWorkspaceScope & {
  readonly inventoryId: string;
  readonly system: string;
  readonly dataset: string;
  readonly dataCategory: string;
  readonly retentionClass: string;
  readonly retentionDays: number;
  readonly deletionMethod: string;
  readonly legalHold: boolean;
  readonly backupCutoffDays: number;
  readonly owner: string;
};

export type DeletionLedgerEntry = TenantWorkspaceScope & {
  readonly deletionId: string;
  readonly inventoryId: string;
  readonly subjectReference: string;
  readonly requestedAt: IsoDateTime;
  readonly completedAt: IsoDateTime | null;
  readonly status: "requested" | "running" | "partial" | "completed" | "failed";
  readonly systems: readonly {
    readonly system: string;
    readonly status: "pending" | "deleted" | "not_found" | "failed";
    readonly evidenceReference: string | null;
  }[];
  readonly correlationId: string;
};
