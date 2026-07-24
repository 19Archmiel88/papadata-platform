import {
  CONTRACT_VERSION,
  type BackendServiceManifest,
  type ServiceReadiness,
  workerJobTypes,
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
    "local-health-runtime",
    "email-outbox-jobs",
    "sync-backfill-jobs",
    "readiness-metric-reprocessing-jobs",
    "notification-report-export-jobs",
    "ai-briefing-jobs",
    "cleanup-retry-dlq-jobs",
  ],
  limitations: [
    "Local Docker Compose exposes health and readiness endpoints plus the Prompt 8 job contract.",
    "Queue broker consumers are represented by the local worker contract and in-memory runtime tests.",
  ],
} as const satisfies BackendServiceManifest;

export const workerJobManifest = {
  contractVersion: CONTRACT_VERSION,
  jobTypes: workerJobTypes,
  retryPolicy: {
    backoff: "exponential",
    jitter: "deterministic-local",
    terminalState: "dlq",
  },
} as const;

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
