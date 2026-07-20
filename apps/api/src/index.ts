import {
  CONTRACT_VERSION,
  type BackendServiceManifest,
  type ServiceReadiness,
} from "@papadata/contracts";
import { databaseBoundaryManifest } from "@papadata/database";

export const apiServiceManifest = {
  serviceName: "api",
  contractVersion: CONTRACT_VERSION,
  readiness: "not_configured",
  capabilities: [
    "transport-boundary",
    "domain-contracts",
    "tenant-workspace-scope",
  ],
  limitations: [
    "HTTP runtime is not implemented in this L2 skeleton.",
    "Auth, persistence and Docker Compose are outside this prompt.",
  ],
} as const satisfies BackendServiceManifest;

export const getApiReadiness = (): ServiceReadiness => ({
  serviceName: apiServiceManifest.serviceName,
  contractVersion: apiServiceManifest.contractVersion,
  state: apiServiceManifest.readiness,
  dependencies: [
    {
      name: "database",
      state: databaseBoundaryManifest.readiness,
    },
  ],
  limitations: apiServiceManifest.limitations,
});
