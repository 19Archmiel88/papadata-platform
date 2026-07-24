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
    "local-health-runtime",
    "auth-http-boundary",
    "tenant-workspace-policy",
    "invitations-http-boundary",
    "onboarding-http-boundary",
    "privacy-consent-http-boundary",
    "legal-documents-http-boundary",
    "durable-notifications-http-boundary",
    "sandbox-integration-adapters",
    "canonical-data-runtime",
    "checkpoint-retry-boundary",
    "product-mapping-policy",
    "metric-engine-runtime",
    "dashboard-api-boundary",
    "metric-readiness-projections",
    "worker-job-orchestration",
    "report-export-http-boundary",
    "assistant-evidence-approval-boundary",
    "billing-sandbox-lifecycle",
  ],
  limitations: [
    "Local Docker Compose exposes health, readiness, auth, tenant/workspace, compliance, dashboard and remaining backend endpoints.",
    "Prompt 6 integration persistence is modeled by SQL migrations and an in-memory sandbox runtime.",
    "Prompt 7 dashboard endpoints use local MetricSnapshot projections.",
    "Prompt 8 reports write local sandbox files and keep durable SQL contracts for persistence.",
    "Persistent pg repositories are outside this prompt.",
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
