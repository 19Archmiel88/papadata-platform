import {
  CONTRACT_VERSION,
  type BackendServiceManifest,
  type ServiceReadiness,
} from "@papadata/contracts";
import { databaseBoundaryManifest } from "@papadata/database";

export const workerServiceManifest = {
  serviceName: "worker",
  contractVersion: CONTRACT_VERSION,
  readiness: "not_configured",
  capabilities: [
    "async-job-boundary",
    "checkpoint-contract",
    "tenant-workspace-scope",
  ],
  limitations: [
    "Queue runtime is not implemented in this L2 skeleton.",
    "Job processors, persistence and Docker Compose are outside this prompt.",
  ],
} as const satisfies BackendServiceManifest;

export const getWorkerReadiness = (): ServiceReadiness => ({
  serviceName: workerServiceManifest.serviceName,
  contractVersion: workerServiceManifest.contractVersion,
  state: workerServiceManifest.readiness,
  dependencies: [
    {
      name: "database",
      state: databaseBoundaryManifest.readiness,
    },
  ],
  limitations: workerServiceManifest.limitations,
});
