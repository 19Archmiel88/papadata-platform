export const CONTRACT_VERSION = "domain-contracts.v1";

declare const tenantIdBrand: unique symbol;
declare const workspaceIdBrand: unique symbol;
declare const operationIdBrand: unique symbol;
declare const correlationIdBrand: unique symbol;

export type TenantId = string & {
  readonly [tenantIdBrand]: "TenantId";
};

export type WorkspaceId = string & {
  readonly [workspaceIdBrand]: "WorkspaceId";
};

export type OperationId = string & {
  readonly [operationIdBrand]: "OperationId";
};

export type CorrelationId = string & {
  readonly [correlationIdBrand]: "CorrelationId";
};

export type TenantWorkspaceScope = {
  readonly tenantId: TenantId;
  readonly workspaceId: WorkspaceId;
};

export type ContractEnvelopeMeta = TenantWorkspaceScope & {
  readonly contractVersion: typeof CONTRACT_VERSION;
  readonly correlationId: CorrelationId;
  readonly limitations: readonly string[];
};

export const operationStates = [
  "queued",
  "running",
  "retry_wait",
  "succeeded",
  "partial",
  "failed",
  "cancelled",
  "dlq",
] as const;

export type OperationState = (typeof operationStates)[number];

export type OperationStatus = TenantWorkspaceScope & {
  readonly operationId: OperationId;
  readonly state: OperationState;
  readonly progressPercent: number;
  readonly retryable: boolean;
};

export type ServiceReadinessState =
  | "not_configured"
  | "ready"
  | "blocked";

export type ServiceDependencyReadiness = {
  readonly name: string;
  readonly state: ServiceReadinessState;
};

export type ServiceReadiness = {
  readonly serviceName: string;
  readonly contractVersion: typeof CONTRACT_VERSION;
  readonly state: ServiceReadinessState;
  readonly dependencies: readonly ServiceDependencyReadiness[];
  readonly limitations: readonly string[];
};

export type BackendServiceManifest = {
  readonly serviceName: "api" | "worker" | "database";
  readonly contractVersion: typeof CONTRACT_VERSION;
  readonly readiness: ServiceReadinessState;
  readonly capabilities: readonly string[];
  readonly limitations: readonly string[];
};
