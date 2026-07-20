import {
  CONTRACT_VERSION,
  type BackendServiceManifest,
} from "@papadata/contracts";

export const databaseBoundaryManifest = {
  serviceName: "database",
  contractVersion: CONTRACT_VERSION,
  readiness: "not_configured",
  capabilities: [
    "tenant-workspace-boundary",
    "schema-boundary",
    "migration-placeholder",
  ],
  limitations: [
    "No database driver, schema or migration runtime is implemented in this L2 skeleton.",
  ],
} as const satisfies BackendServiceManifest;

export type DatabaseBoundaryManifest = typeof databaseBoundaryManifest;
