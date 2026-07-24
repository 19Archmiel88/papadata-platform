import type {
  CorrelationId,
  CursorPage,
  IdempotencyKey,
  IsoDateTime,
  OperationId,
  TenantId,
  TenantWorkspaceScope,
  WorkspaceId,
} from "./index.js";

export const mvpIntegrationCatalogProviderIds = [
  "woocommerce",
  "shopify",
  "baselinker",
  "allegro",
  "google_ads",
  "meta_ads",
  "ga4",
] as const;

export type MvpIntegrationCatalogProviderId =
  (typeof mvpIntegrationCatalogProviderIds)[number];

export const sandboxIntegrationProviderIds = [
  "woocommerce",
  "allegro",
  "google_ads",
  "meta_ads",
] as const satisfies readonly MvpIntegrationCatalogProviderId[];

export type SandboxIntegrationProviderId =
  (typeof sandboxIntegrationProviderIds)[number];

export const integrationEnvironmentStates = [
  "not_implemented",
  "adapter_implemented",
  "sandbox_verified",
  "environment_configured",
  "runtime_enabled",
  "pilot_ready",
  "production_verified",
] as const;

export type IntegrationEnvironmentState =
  (typeof integrationEnvironmentStates)[number];

export type ProviderEnvironmentAvailability = {
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly local: IntegrationEnvironmentState;
  readonly ci: IntegrationEnvironmentState;
  readonly development: IntegrationEnvironmentState;
  readonly staging: IntegrationEnvironmentState;
  readonly production: IntegrationEnvironmentState;
  readonly limitations: readonly string[];
};

export const integrationJobStates = [
  "queued",
  "running",
  "retry_wait",
  "partial_success",
  "succeeded",
  "failed",
  "cancelled",
  "dlq",
] as const;

export type IntegrationJobState = (typeof integrationJobStates)[number];

export const integrationFailureClasses = [
  "authentication",
  "authorization",
  "validation",
  "rate_limit",
  "transient",
  "provider_outage",
  "permanent",
  "cancelled",
] as const;

export type IntegrationFailureClass =
  (typeof integrationFailureClasses)[number];

export type IntegrationProviderDescriptor = {
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly displayName: string;
  readonly category: "commerce" | "advertising" | "analytics";
  readonly supportedStreams: readonly string[];
  readonly requiredScopes: readonly string[];
  readonly optionalScopes: readonly string[];
  readonly supportsWebhooks: boolean;
};

export type IntegrationConnectionView = TenantWorkspaceScope & {
  readonly connectionId: string;
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly status:
    | "draft"
    | "connected"
    | "reauthorization_required"
    | "disabled"
    | "deleted";
  readonly selectedAccountId: string | null;
  readonly grantedScopes: readonly string[];
  readonly missingScopes: readonly string[];
  readonly credentialExpiresAt: IsoDateTime | null;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
};

export type IntegrationJobView = TenantWorkspaceScope & {
  readonly jobId: string;
  readonly connectionId: string;
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly operation:
    | "initial_sync"
    | "incremental_sync"
    | "backfill"
    | "reprocess"
    | "reconcile";
  readonly state: IntegrationJobState;
  readonly failureClass: IntegrationFailureClass | null;
  readonly from: IsoDateTime | null;
  readonly to: IsoDateTime | null;
  readonly checkpoint: string | null;
  readonly attempt: number;
  readonly maxAttempts: number;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
};

export const integrationApiPaths = {
  providers: "/v1/integrations/providers",
  connections: "/v1/integrations/connections",
  connection: "/v1/integrations/connections/:id",
  account: "/v1/integrations/connections/:id/account",
  sync: "/v1/integrations/connections/:id/sync",
  backfill: "/v1/integrations/connections/:id/backfill",
  reauthorize: "/v1/integrations/connections/:id/reauthorize",
  connectionJobs: "/v1/integrations/connections/:id/jobs",
  job: "/v1/integrations/jobs/:id",
  retryJob: "/v1/integrations/jobs/:id/retry",
  cancelJob: "/v1/integrations/jobs/:id/cancel",
  replayDlq: "/v1/integrations/dlq/:id/replay",
  webhook: "/v1/integrations/webhooks/:provider",
} as const;

export type CreateIntegrationConnectionRequest = {
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly credentialReference: string;
  readonly requestedScopes: readonly string[];
  readonly idempotencyKey: IdempotencyKey;
};

export type SelectIntegrationAccountRequest = {
  readonly accountId: string;
  readonly expectedVersion?: string;
};

export type StartIntegrationSyncRequest = {
  readonly streams: readonly string[];
  readonly idempotencyKey: IdempotencyKey;
};

export type StartIntegrationBackfillRequest = StartIntegrationSyncRequest & {
  readonly from: IsoDateTime;
  readonly to: IsoDateTime;
};

export type IntegrationListResponse = CursorPage<IntegrationConnectionView>;

export type IntegrationOperationAccepted = TenantWorkspaceScope & {
  readonly operationId: OperationId;
  readonly jobId: string;
  readonly correlationId: CorrelationId;
};

export type IntegrationRequestContext = {
  readonly tenantId: TenantId;
  readonly workspaceId: WorkspaceId;
  readonly correlationId: CorrelationId;
};
