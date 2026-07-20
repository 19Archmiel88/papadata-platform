import { z } from 'zod';

import {
  asCapability,
  contractVersionSchema,
  correlationIdSchema,
  dataClassificationSchema,
  operationIdSchema,
  retentionClassSchema,
  tenantIdSchema,
  workspaceIdSchema,
  type Capability,
  type CorrelationId,
} from '../../domain-contracts';

const integrationIdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z][a-z0-9_:-]*$/);

const isoDateTimeSchema = z.string().datetime({ offset: true });

export const integrationContractVersion = 'integration-adapter.v1' as const;
export const integrationPolicyVersion = 'integration-policy.2026-07' as const;

export const providerIdSchema = integrationIdSchema.brand<'IntegrationProviderId'>();
export const connectionIdSchema = integrationIdSchema.brand<'IntegrationConnectionId'>();
export const syncJobIdSchema = integrationIdSchema.brand<'SyncJobId'>();
export const checkpointIdSchema = integrationIdSchema.brand<'SyncCheckpointId'>();
export const sourceBatchIdSchema = integrationIdSchema.brand<'SourceBatchId'>();
export const integrationSourceRecordIdSchema =
  integrationIdSchema.brand<'IntegrationSourceRecordId'>();
export const credentialRefSchema = integrationIdSchema.brand<'CredentialRef'>();
export const idempotencyKeySchema = z.string().min(8).max(128);
export const outboxEventIdSchema = integrationIdSchema.brand<'OutboxEventId'>();
export const webhookEventIdSchema = integrationIdSchema.brand<'WebhookEventId'>();

export type IntegrationProviderId = z.infer<typeof providerIdSchema>;
export type IntegrationConnectionId = z.infer<typeof connectionIdSchema>;
export type SyncJobId = z.infer<typeof syncJobIdSchema>;
export type SyncCheckpointId = z.infer<typeof checkpointIdSchema>;
export type SourceBatchId = z.infer<typeof sourceBatchIdSchema>;
export type IntegrationSourceRecordId = z.infer<typeof integrationSourceRecordIdSchema>;
export type CredentialRef = z.infer<typeof credentialRefSchema>;
export type OutboxEventId = z.infer<typeof outboxEventIdSchema>;
export type WebhookEventId = z.infer<typeof webhookEventIdSchema>;

export function asProviderId(value: string): IntegrationProviderId {
  return providerIdSchema.parse(value);
}

export function asConnectionId(value: string): IntegrationConnectionId {
  return connectionIdSchema.parse(value);
}

export function asSyncJobId(value: string): SyncJobId {
  return syncJobIdSchema.parse(value);
}

export function asCheckpointId(value: string): SyncCheckpointId {
  return checkpointIdSchema.parse(value);
}

export function asSourceBatchId(value: string): SourceBatchId {
  return sourceBatchIdSchema.parse(value);
}

export function asIntegrationSourceRecordId(value: string): IntegrationSourceRecordId {
  return integrationSourceRecordIdSchema.parse(value);
}

export function asCredentialRef(value: string): CredentialRef {
  return credentialRefSchema.parse(value);
}

export function asOutboxEventId(value: string): OutboxEventId {
  return outboxEventIdSchema.parse(value);
}

export function asWebhookEventId(value: string): WebhookEventId {
  return webhookEventIdSchema.parse(value);
}

export const integrationCapabilities = {
  backfill: asCapability('integration:backfill'),
  connect: asCapability('integration:connect'),
  disconnect: asCapability('integration:disconnect'),
  manageProvider: asCapability('integration:provider:manage'),
  read: asCapability('integration:read'),
  replay: asCapability('integration:replay'),
  sync: asCapability('integration:sync'),
} as const satisfies Record<string, Capability>;

export const catalogStatusSchema = z.enum(['identified', 'catalogued', 'retired']);
export const adapterStatusSchema = z.enum(['planned', 'implemented', 'verified']);
export const environmentStatusSchema = z.enum([
  'not_configured',
  'configured',
  'verified',
]);
export const runtimeAvailabilitySchema = z.enum(['disabled', 'pilot', 'available']);
export const operationalReadinessSchema = z.enum([
  'not_ready',
  'pilot_ready',
  'production_verified',
]);

export type CatalogStatus = z.infer<typeof catalogStatusSchema>;
export type AdapterStatus = z.infer<typeof adapterStatusSchema>;
export type EnvironmentStatus = z.infer<typeof environmentStatusSchema>;
export type RuntimeAvailability = z.infer<typeof runtimeAvailabilitySchema>;
export type OperationalReadiness = z.infer<typeof operationalReadinessSchema>;

export const integrationProviderSchema = z.object({
  adapterContractVersion: z.literal(integrationContractVersion),
  adapterStatus: adapterStatusSchema,
  businessDescription: z.string().min(1),
  catalogStatus: catalogStatusSchema,
  category: z.enum(['commerce', 'marketplace', 'ads', 'analytics']),
  dependencies: z.array(z.string()).default([]),
  environmentStatus: environmentStatusSchema,
  evidenceReferences: z.array(z.string()).default([]),
  lastAssessedAt: isoDateTimeSchema,
  name: z.string().min(1),
  operationalReadiness: operationalReadinessSchema,
  optionalScopes: z.array(z.string()).default([]),
  owner: z.string().min(1),
  providerId: providerIdSchema,
  requiredCapabilities: z.array(z.string()).default([]),
  requiredEntitlements: z.array(z.string()).default([]),
  requiredScopes: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  runtimeAvailability: runtimeAvailabilitySchema,
  supportedEnvironments: z.array(z.enum(['local', 'ci', 'development', 'staging'])),
  supportedStreams: z.array(z.string()).default([]),
  supportedUseCases: z.array(z.string()).default([]),
});

export type IntegrationProvider = z.infer<typeof integrationProviderSchema>;

export const integrationErrorClassSchema = z.enum([
  'AUTH',
  'REVOKED',
  'RATE_LIMIT',
  'TRANSIENT',
  'TIMEOUT',
  'SCHEMA_MISMATCH',
  'PERMISSION',
  'SCOPE',
  'NOT_FOUND',
  'VALIDATION_DATA',
  'BUG',
  'INVARIANT',
]);

export type IntegrationErrorClass = z.infer<typeof integrationErrorClassSchema>;

export const safeIntegrationErrorSchema = z.object({
  code: z.string().min(1),
  correlationId: correlationIdSchema,
  errorClass: integrationErrorClassSchema,
  impact: z.string().min(1),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  nextAction: z.string().min(1),
  retry: z.object({
    retryAfterSeconds: z.number().int().positive().nullable(),
    retryable: z.boolean(),
  }),
});

export type SafeIntegrationError = z.infer<typeof safeIntegrationErrorSchema>;

export const integrationConnectionStatusSchema = z.enum([
  'NOT_CONNECTED',
  'CONNECTING',
  'ACTIVE',
  'SYNCING',
  'LIMITED_ACCESS',
  'REAUTH_REQUIRED',
  'RETRY_WAIT',
  'ERROR',
  'DISABLED',
]);

export type IntegrationConnectionStatus = z.infer<
  typeof integrationConnectionStatusSchema
>;

export const scopeDiffSchema = z.object({
  granted: z.array(z.string()),
  missingRequired: z.array(z.string()),
  missingOptional: z.array(z.string()),
  newlyGranted: z.array(z.string()),
  removed: z.array(z.string()),
  requested: z.array(z.string()),
});

export type ScopeDiff = z.infer<typeof scopeDiffSchema>;

export const integrationConnectionSchema = z.object({
  connectedAt: isoDateTimeSchema.nullable(),
  credentialRef: credentialRefSchema,
  externalAccountRef: z.string().min(1),
  grantedScopes: z.array(z.string()),
  id: connectionIdSchema,
  lastError: safeIntegrationErrorSchema.nullable(),
  lastScopeDiff: scopeDiffSchema.nullable(),
  lastSuccessfulSyncAt: isoDateTimeSchema.nullable(),
  policyVersion: z.literal(integrationPolicyVersion),
  providerId: providerIdSchema,
  status: integrationConnectionStatusSchema,
  tenantId: tenantIdSchema,
  validatedAt: isoDateTimeSchema.nullable(),
  version: z.number().int().nonnegative(),
  workspaceId: workspaceIdSchema,
  expiresAt: isoDateTimeSchema.nullable(),
});

export type IntegrationConnection = z.infer<typeof integrationConnectionSchema>;

export const connectionTransitionSchema = z.object({
  connectionId: connectionIdSchema,
  correlationId: correlationIdSchema,
  from: integrationConnectionStatusSchema,
  reason: z.string().min(1),
  to: integrationConnectionStatusSchema,
  version: z.number().int().positive(),
});

export type ConnectionTransition = z.infer<typeof connectionTransitionSchema>;

const allowedConnectionTransitions: Record<
  IntegrationConnectionStatus,
  readonly IntegrationConnectionStatus[]
> = {
  ACTIVE: [
    'SYNCING',
    'LIMITED_ACCESS',
    'REAUTH_REQUIRED',
    'RETRY_WAIT',
    'ERROR',
    'DISABLED',
  ],
  CONNECTING: ['ACTIVE', 'LIMITED_ACCESS', 'REAUTH_REQUIRED', 'ERROR', 'DISABLED'],
  DISABLED: ['ACTIVE', 'ERROR'],
  ERROR: ['REAUTH_REQUIRED', 'RETRY_WAIT', 'DISABLED', 'ACTIVE'],
  LIMITED_ACCESS: ['ACTIVE', 'SYNCING', 'REAUTH_REQUIRED', 'ERROR', 'DISABLED'],
  NOT_CONNECTED: ['CONNECTING', 'DISABLED'],
  REAUTH_REQUIRED: ['CONNECTING', 'ACTIVE', 'LIMITED_ACCESS', 'DISABLED', 'ERROR'],
  RETRY_WAIT: ['ACTIVE', 'SYNCING', 'ERROR', 'DISABLED'],
  SYNCING: ['ACTIVE', 'LIMITED_ACCESS', 'RETRY_WAIT', 'ERROR', 'DISABLED'],
};

export function canTransitionConnection(
  from: IntegrationConnectionStatus,
  to: IntegrationConnectionStatus,
): boolean {
  return from === to || allowedConnectionTransitions[from].includes(to);
}

export function transitionConnection(
  connection: IntegrationConnection,
  input: {
    correlationId: CorrelationId;
    lastError?: SafeIntegrationError | null;
    reason: string;
    status: IntegrationConnectionStatus;
    timestamp: string;
  },
): {
  connection: IntegrationConnection;
  transition: ConnectionTransition;
} {
  if (!canTransitionConnection(connection.status, input.status)) {
    throw new Error(`CONNECTION_STATUS_CONFLICT:${connection.status}->${input.status}`);
  }

  const nextVersion = connection.version + 1;
  const nextConnection = integrationConnectionSchema.parse({
    ...connection,
    connectedAt:
      input.status === 'ACTIVE' && connection.connectedAt === null
        ? input.timestamp
        : connection.connectedAt,
    lastError: input.lastError ?? null,
    status: input.status,
    validatedAt:
      input.status === 'ACTIVE' || input.status === 'LIMITED_ACCESS'
        ? input.timestamp
        : connection.validatedAt,
    version: nextVersion,
  });

  return {
    connection: nextConnection,
    transition: connectionTransitionSchema.parse({
      connectionId: connection.id,
      correlationId: input.correlationId,
      from: connection.status,
      reason: input.reason,
      to: input.status,
      version: nextVersion,
    }),
  };
}

export const scopeUseCasePolicySchema = z.object({
  impactWhenMissing: z.string().min(1),
  minimalScopes: z.array(z.string()),
  optionalScopes: z.array(z.string()).default([]),
  purpose: z.string().min(1),
  useCase: z.string().min(1),
});

export const scopePolicySchema = z.object({
  owner: z.string().min(1),
  providerId: providerIdSchema,
  useCases: z.array(scopeUseCasePolicySchema),
  validFrom: isoDateTimeSchema,
  version: z.literal(integrationPolicyVersion),
});

export type ScopePolicy = z.infer<typeof scopePolicySchema>;

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

export function calculateScopeDiff(input: {
  granted: readonly string[];
  previousGranted?: readonly string[];
  requested: readonly string[];
  required: readonly string[];
  optional?: readonly string[];
}): ScopeDiff {
  const granted = uniqueSorted(input.granted);
  const previousGranted = new Set(input.previousGranted ?? []);
  const grantedSet = new Set(granted);
  const requested = uniqueSorted(input.requested);

  return scopeDiffSchema.parse({
    granted,
    missingOptional: uniqueSorted(
      (input.optional ?? []).filter((scope) => !grantedSet.has(scope)),
    ),
    missingRequired: uniqueSorted(
      input.required.filter((scope) => !grantedSet.has(scope)),
    ),
    newlyGranted: uniqueSorted(granted.filter((scope) => !previousGranted.has(scope))),
    removed: uniqueSorted(
      [...previousGranted].filter((scope) => !grantedSet.has(scope)),
    ),
    requested,
  });
}

export const credentialStatusSchema = z.enum([
  'ACTIVE',
  'ROTATING',
  'REVOKED',
  'DELETED',
  'EXPIRED',
]);

export type CredentialStatus = z.infer<typeof credentialStatusSchema>;

export const credentialMetadataSchema = z.object({
  connectionId: connectionIdSchema,
  createdAt: isoDateTimeSchema,
  expiresAt: isoDateTimeSchema.nullable(),
  lastRotatedAt: isoDateTimeSchema.nullable(),
  providerId: providerIdSchema,
  ref: credentialRefSchema,
  status: credentialStatusSchema,
  tenantId: tenantIdSchema,
  version: z.number().int().positive(),
  workspaceId: workspaceIdSchema,
});

export type CredentialMetadata = z.infer<typeof credentialMetadataSchema>;

export const syncJobTypeSchema = z.enum([
  'INITIAL',
  'INCREMENTAL',
  'BACKFILL',
  'CATCH_UP',
  'REPLAY',
  'RECOVERY',
]);

export const syncJobStatusSchema = z.enum([
  'QUEUED',
  'RUNNING',
  'RETRY_WAIT',
  'PARTIAL_SUCCESS',
  'SUCCESS',
  'FAILED',
  'CANCELLED',
  'DLQ',
]);

export type SyncJobType = z.infer<typeof syncJobTypeSchema>;
export type SyncJobStatus = z.infer<typeof syncJobStatusSchema>;

export const syncRangeSchema = z.object({
  from: isoDateTimeSchema.nullable(),
  mode: z.enum(['bounded', 'cursor']),
  to: isoDateTimeSchema.nullable(),
});

export const syncProgressSchema = z.object({
  currentStream: z.string().nullable(),
  errors: z.number().int().nonnegative(),
  pages: z.number().int().nonnegative(),
  recordsFetched: z.number().int().nonnegative(),
  recordsStored: z.number().int().nonnegative(),
  streamsCompleted: z.number().int().nonnegative(),
  streamsTotal: z.number().int().positive(),
});

export type SyncRange = z.infer<typeof syncRangeSchema>;
export type SyncProgress = z.infer<typeof syncProgressSchema>;

export const syncJobSchema = z.object({
  attempt: z.number().int().nonnegative(),
  checkpointRef: checkpointIdSchema.nullable(),
  commandFingerprint: z.string().min(1),
  connectionId: connectionIdSchema,
  createdAt: isoDateTimeSchema,
  errorClass: integrationErrorClassSchema.nullable(),
  finishedAt: isoDateTimeSchema.nullable(),
  id: syncJobIdSchema,
  idempotencyKey: idempotencyKeySchema,
  progress: syncProgressSchema,
  providerId: providerIdSchema,
  range: syncRangeSchema,
  retryBudget: z.number().int().nonnegative(),
  startedAt: isoDateTimeSchema.nullable(),
  status: syncJobStatusSchema,
  streams: z.array(z.string()).min(1),
  tenantId: tenantIdSchema,
  type: syncJobTypeSchema,
  workspaceId: workspaceIdSchema,
});

export type SyncJob = z.infer<typeof syncJobSchema>;

const allowedJobTransitions: Record<SyncJobStatus, readonly SyncJobStatus[]> = {
  CANCELLED: [],
  DLQ: ['QUEUED'],
  FAILED: ['QUEUED', 'DLQ'],
  PARTIAL_SUCCESS: ['SUCCESS', 'FAILED'],
  QUEUED: ['RUNNING', 'CANCELLED'],
  RETRY_WAIT: ['RUNNING', 'DLQ', 'FAILED', 'CANCELLED'],
  RUNNING: ['RETRY_WAIT', 'PARTIAL_SUCCESS', 'SUCCESS', 'FAILED', 'DLQ', 'CANCELLED'],
  SUCCESS: [],
};

export function canTransitionJob(from: SyncJobStatus, to: SyncJobStatus): boolean {
  return from === to || allowedJobTransitions[from].includes(to);
}

export function transitionJob(
  job: SyncJob,
  status: SyncJobStatus,
  timestamp: string,
  errorClass: IntegrationErrorClass | null = null,
): SyncJob {
  if (!canTransitionJob(job.status, status)) {
    throw new Error(`SYNC_JOB_STATUS_CONFLICT:${job.status}->${status}`);
  }

  return syncJobSchema.parse({
    ...job,
    errorClass,
    finishedAt:
      status === 'SUCCESS' ||
      status === 'FAILED' ||
      status === 'PARTIAL_SUCCESS' ||
      status === 'DLQ' ||
      status === 'CANCELLED'
        ? timestamp
        : job.finishedAt,
    startedAt: status === 'RUNNING' && job.startedAt === null ? timestamp : job.startedAt,
    status,
  });
}

export const syncCheckpointSchema = z.object({
  connectionId: connectionIdSchema,
  contractVersion: contractVersionSchema,
  cursor: z.string().nullable(),
  id: checkpointIdSchema,
  lastBatchId: sourceBatchIdSchema.nullable(),
  lastEventId: z.string().nullable(),
  recordVersion: z.number().int().nonnegative(),
  stream: z.string().min(1),
  tenantId: tenantIdSchema,
  timestamp: isoDateTimeSchema,
  watermark: isoDateTimeSchema.nullable(),
  workspaceId: workspaceIdSchema,
});

export type SyncCheckpoint = z.infer<typeof syncCheckpointSchema>;

export function assertCheckpointCanAdvance(
  previous: SyncCheckpoint | null,
  next: SyncCheckpoint,
): void {
  if (!previous) {
    return;
  }

  if (
    previous.tenantId !== next.tenantId ||
    previous.workspaceId !== next.workspaceId ||
    previous.connectionId !== next.connectionId ||
    previous.stream !== next.stream
  ) {
    throw new Error('CHECKPOINT_SCOPE_MISMATCH');
  }

  if (next.recordVersion <= previous.recordVersion) {
    throw new Error('CHECKPOINT_VERSION_CONFLICT');
  }

  if (previous.watermark && next.watermark && next.watermark < previous.watermark) {
    throw new Error('CHECKPOINT_CANNOT_MOVE_BACKWARD');
  }
}

export const sourceBatchSchema = z.object({
  checkpointAfter: checkpointIdSchema.nullable(),
  checkpointBefore: checkpointIdSchema.nullable(),
  completedAt: isoDateTimeSchema.nullable(),
  connectionId: connectionIdSchema,
  contractVersion: contractVersionSchema,
  correlationId: correlationIdSchema,
  counts: z.object({
    accepted: z.number().int().nonnegative(),
    duplicated: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
    fetched: z.number().int().nonnegative(),
    quarantined: z.number().int().nonnegative(),
  }),
  createdAt: isoDateTimeSchema,
  id: sourceBatchIdSchema,
  jobId: syncJobIdSchema,
  providerId: providerIdSchema,
  range: syncRangeSchema,
  status: z.enum(['OPEN', 'COMMITTED', 'QUARANTINED', 'FAILED']),
  stream: z.string().min(1),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type SourceBatch = z.infer<typeof sourceBatchSchema>;

export const sourceRecordSchema = z.object({
  classification: dataClassificationSchema,
  connectionId: connectionIdSchema,
  contentHash: z.string().min(1),
  contractVersion: contractVersionSchema,
  externalId: z.string().min(1),
  fetchedAt: isoDateTimeSchema,
  id: integrationSourceRecordIdSchema,
  payloadRef: z.string().min(1),
  providerEventTime: isoDateTimeSchema.nullable(),
  providerId: providerIdSchema,
  providerRevision: z.string().nullable(),
  retentionClass: retentionClassSchema,
  sourceBatchId: sourceBatchIdSchema,
  stream: z.string().min(1),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type SourceRecord = z.infer<typeof sourceRecordSchema>;

export const idempotencyRecordSchema = z.object({
  commandFingerprint: z.string().min(1),
  createdAt: isoDateTimeSchema,
  idempotencyKey: idempotencyKeySchema,
  operationId: operationIdSchema,
  resultRef: z.string().min(1),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type IdempotencyRecord = z.infer<typeof idempotencyRecordSchema>;

export const outboxEventSchema = z.object({
  attempts: z.number().int().nonnegative(),
  eventId: outboxEventIdSchema,
  eventType: z.string().min(1),
  occurredAt: isoDateTimeSchema,
  operationId: operationIdSchema.optional(),
  payload: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  publishedAt: isoDateTimeSchema.nullable(),
  status: z.enum(['PENDING', 'PUBLISHED', 'FAILED']),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type OutboxEvent = z.infer<typeof outboxEventSchema>;

export const integrationWebhookEnvelopeSchema = z.object({
  connectionId: connectionIdSchema,
  eventId: webhookEventIdSchema,
  eventType: z.string().min(1),
  occurredAt: isoDateTimeSchema,
  payloadRef: z.string().min(1),
  providerId: providerIdSchema,
  receivedAt: isoDateTimeSchema,
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type IntegrationWebhookEnvelope = z.infer<
  typeof integrationWebhookEnvelopeSchema
>;

export const retryDecisionSchema = z.object({
  connectionStatus: integrationConnectionStatusSchema.optional(),
  jobStatus: syncJobStatusSchema,
  nextAction: z.string().min(1),
  retryAfterSeconds: z.number().int().positive().nullable(),
  retryable: z.boolean(),
  sendToDlq: z.boolean(),
});

export type RetryDecision = z.infer<typeof retryDecisionSchema>;

export function retryDecisionForError(
  errorClass: IntegrationErrorClass,
  attempt: number,
  retryBudget: number,
  retryAfterSeconds?: number,
): RetryDecision {
  if (errorClass === 'AUTH' || errorClass === 'REVOKED') {
    return retryDecisionSchema.parse({
      connectionStatus: 'REAUTH_REQUIRED',
      jobStatus: 'FAILED',
      nextAction: 'Reconnect connection.',
      retryAfterSeconds: null,
      retryable: false,
      sendToDlq: false,
    });
  }

  if (errorClass === 'RATE_LIMIT') {
    return retryDecisionSchema.parse({
      connectionStatus: 'RETRY_WAIT',
      jobStatus: 'RETRY_WAIT',
      nextAction: 'Wait for provider retryAfter.',
      retryAfterSeconds: retryAfterSeconds ?? 60,
      retryable: true,
      sendToDlq: false,
    });
  }

  if (errorClass === 'TRANSIENT' || errorClass === 'TIMEOUT') {
    const retryable = attempt < retryBudget;

    return retryDecisionSchema.parse({
      jobStatus: retryable ? 'RETRY_WAIT' : 'DLQ',
      nextAction: retryable ? 'Retry with exponential backoff.' : 'Manual DLQ replay.',
      retryAfterSeconds: retryable ? Math.min(900, 2 ** Math.max(1, attempt) * 10) : null,
      retryable,
      sendToDlq: !retryable,
    });
  }

  if (errorClass === 'SCHEMA_MISMATCH') {
    return retryDecisionSchema.parse({
      jobStatus: 'FAILED',
      nextAction: 'Quarantine payload and request adapter review.',
      retryAfterSeconds: null,
      retryable: false,
      sendToDlq: false,
    });
  }

  if (errorClass === 'PERMISSION' || errorClass === 'SCOPE') {
    return retryDecisionSchema.parse({
      connectionStatus: 'LIMITED_ACCESS',
      jobStatus: 'FAILED',
      nextAction: 'Reconnect with required scope.',
      retryAfterSeconds: null,
      retryable: false,
      sendToDlq: false,
    });
  }

  if (errorClass === 'VALIDATION_DATA') {
    return retryDecisionSchema.parse({
      jobStatus: 'PARTIAL_SUCCESS',
      nextAction: 'Quarantine invalid records and continue independent streams.',
      retryAfterSeconds: null,
      retryable: false,
      sendToDlq: false,
    });
  }

  return retryDecisionSchema.parse({
    jobStatus: 'DLQ',
    nextAction: 'Incident review and guarded replay.',
    retryAfterSeconds: null,
    retryable: false,
    sendToDlq: true,
  });
}

export const createConnectionRequestSchema = z.object({
  externalAccountRef: z.string().min(1),
  grantedScopes: z.array(z.string()),
  idempotencyKey: idempotencyKeySchema,
  providerId: providerIdSchema,
  requestedScopes: z.array(z.string()),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export const syncJobRequestSchema = z.object({
  connectionId: connectionIdSchema,
  idempotencyKey: idempotencyKeySchema,
  range: syncRangeSchema,
  streams: z.array(z.string()).min(1),
  tenantId: tenantIdSchema,
  type: syncJobTypeSchema,
  workspaceId: workspaceIdSchema,
});

export const integrationCommandResponseSchema = z.object({
  contractVersion: contractVersionSchema,
  correlationId: correlationIdSchema,
  operationId: operationIdSchema,
  status: z.enum(['accepted', 'completed', 'partial', 'error']),
});

export type CreateConnectionRequest = z.infer<typeof createConnectionRequestSchema>;
export type SyncJobRequest = z.infer<typeof syncJobRequestSchema>;
export type IntegrationCommandResponse = z.infer<
  typeof integrationCommandResponseSchema
>;

export const integrationApiRoutes = {
  connection: '/v1/integration-connections/{connectionId}',
  connectionCollection: '/v1/integration-connections',
  disconnect: '/v1/integration-connections/{connectionId}/disconnect',
  operation: '/v1/operations/{operationId}',
  provider: '/v1/integration-providers/{providerId}',
  providerCollection: '/v1/integration-providers',
  reauthorize: '/v1/integration-connections/{connectionId}/reauthorize',
  syncJobs: '/v1/integration-connections/{connectionId}/sync-jobs',
  webhook: '/v1/webhooks/{providerId}',
} as const;

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

export function createDeterministicHash(value: unknown): string {
  const text = stableStringify(value);
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fnv1a:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function createCommandFingerprint(command: unknown): string {
  return createDeterministicHash(command);
}
