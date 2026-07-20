export const CONTRACT_VERSION = "domain-contracts.v1";
export const API_VERSION = "v1";
export const API_BASE_PATH = `/${API_VERSION}`;

export const apiHeaders = {
  correlationId: "x-correlation-id",
  contractVersion: "x-contract-version",
  idempotencyKey: "idempotency-key",
  expectedVersion: "x-expected-version",
  etag: "etag",
  ifMatch: "if-match",
} as const;

declare const tenantIdBrand: unique symbol;
declare const workspaceIdBrand: unique symbol;
declare const operationIdBrand: unique symbol;
declare const correlationIdBrand: unique symbol;
declare const idempotencyKeyBrand: unique symbol;
declare const expectedVersionBrand: unique symbol;
declare const entityTagBrand: unique symbol;
declare const cursorBrand: unique symbol;
declare const isoDateTimeBrand: unique symbol;

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

export type IdempotencyKey = string & {
  readonly [idempotencyKeyBrand]: "IdempotencyKey";
};

export type ExpectedVersion = string & {
  readonly [expectedVersionBrand]: "ExpectedVersion";
};

export type EntityTag = string & {
  readonly [entityTagBrand]: "EntityTag";
};

export type Cursor = string & {
  readonly [cursorBrand]: "Cursor";
};

export type IsoDateTime = string & {
  readonly [isoDateTimeBrand]: "IsoDateTime";
};

export type TenantWorkspaceScope = {
  readonly tenantId: TenantId;
  readonly workspaceId: WorkspaceId;
};

export type VersionedApiPath = `${typeof API_BASE_PATH}/${string}`;

export const readinessStates = [
  "no_data",
  "partial",
  "delayed",
  "stale",
  "invalid",
  "conflicting",
  "processing",
  "ready",
  "resync_required",
  "manual_review_required",
] as const;

export type ReadinessState = (typeof readinessStates)[number];

export type Readiness = {
  readonly state: ReadinessState;
  readonly checkedAt: IsoDateTime;
  readonly limitations: readonly string[];
};

export type ContractEnvelopeMeta = TenantWorkspaceScope & {
  readonly contractVersion: typeof CONTRACT_VERSION;
  readonly correlationId: CorrelationId;
  readonly readiness: Readiness;
  readonly limitations: readonly string[];
};

export type ApiResponseEnvelope<TData> = {
  readonly data: TData;
  readonly meta: ContractEnvelopeMeta;
};

export type FieldError = {
  readonly field: string;
  readonly message: string;
};

export const apiErrorCodes = [
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "VALIDATION_FAILED",
  "DATA_NOT_READY",
  "RATE_LIMITED",
  "PROVIDER_UNAVAILABLE",
  "INTERNAL_ERROR",
] as const;

export type ApiErrorCode = (typeof apiErrorCodes)[number];

export type ApiError = {
  readonly code: ApiErrorCode;
  readonly message: string;
  readonly fieldErrors: readonly FieldError[];
  readonly impact: string;
  readonly nextActions: readonly string[];
  readonly retryable: boolean;
  readonly correlationId: CorrelationId;
  readonly contractVersion: typeof CONTRACT_VERSION;
};

export type ApiErrorEnvelope = {
  readonly error: ApiError;
};

export type CursorPageInfo = {
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly startCursor: Cursor | null;
  readonly endCursor: Cursor | null;
};

export type CursorPage<TItem> = {
  readonly items: readonly TItem[];
  readonly pageInfo: CursorPageInfo;
};

export type CursorPaginationRequest = {
  readonly first: number;
  readonly after?: Cursor;
};

export type ConcurrencyControl =
  | {
      readonly expectedVersion: ExpectedVersion;
      readonly etag?: never;
    }
  | {
      readonly expectedVersion?: never;
      readonly etag: EntityTag;
    };

export type CommandRequest<TPayload> = {
  readonly payload: TPayload;
  readonly idempotencyKey: IdempotencyKey;
  readonly concurrency?: ConcurrencyControl;
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

export type OperationAccepted = TenantWorkspaceScope & {
  readonly operationId: OperationId;
  readonly statusPath: VersionedApiPath;
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
