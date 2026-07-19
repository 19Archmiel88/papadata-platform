import { z } from 'zod';

export const domainContractVersion = 'domain-contracts.v1' as const;

export const contractVersionSchema = z.literal(domainContractVersion);

const idValueSchema = z
  .string()
  .min(1)
  .regex(/^[a-z][a-z0-9_:-]*$/);

const isoDateTimeSchema = z.string().datetime({ offset: true });

export const tenantIdSchema = idValueSchema.brand<'TenantId'>();
export const workspaceIdSchema = idValueSchema.brand<'WorkspaceId'>();
export const userIdSchema = idValueSchema.brand<'UserId'>();
export const membershipIdSchema = idValueSchema.brand<'MembershipId'>();
export const sessionIdSchema = idValueSchema.brand<'SessionId'>();
export const invitationIdSchema = idValueSchema.brand<'InvitationId'>();
export const authChallengeIdSchema = idValueSchema.brand<'AuthChallengeId'>();
export const passwordResetIdSchema = idValueSchema.brand<'PasswordResetId'>();
export const auditEventIdSchema = idValueSchema.brand<'AuditEventId'>();
export const correlationIdSchema = idValueSchema.brand<'CorrelationId'>();
export const operationIdSchema = idValueSchema.brand<'OperationId'>();
export const metricDefinitionIdSchema = idValueSchema.brand<'MetricDefinitionId'>();
export const metricSnapshotIdSchema = idValueSchema.brand<'MetricSnapshotId'>();
export const sourceRecordIdSchema = idValueSchema.brand<'SourceRecordId'>();
export const canonicalRecordIdSchema = idValueSchema.brand<'CanonicalRecordId'>();
export const evidenceReferenceIdSchema = idValueSchema.brand<'EvidenceReferenceId'>();
export const dataIssueIdSchema = idValueSchema.brand<'DataIssueId'>();
export const businessFactIdSchema = idValueSchema.brand<'BusinessFactId'>();

export type TenantId = z.infer<typeof tenantIdSchema>;
export type WorkspaceId = z.infer<typeof workspaceIdSchema>;
export type UserId = z.infer<typeof userIdSchema>;
export type MembershipId = z.infer<typeof membershipIdSchema>;
export type SessionId = z.infer<typeof sessionIdSchema>;
export type InvitationId = z.infer<typeof invitationIdSchema>;
export type AuthChallengeId = z.infer<typeof authChallengeIdSchema>;
export type PasswordResetId = z.infer<typeof passwordResetIdSchema>;
export type AuditEventId = z.infer<typeof auditEventIdSchema>;
export type CorrelationId = z.infer<typeof correlationIdSchema>;
export type OperationId = z.infer<typeof operationIdSchema>;
export type MetricDefinitionId = z.infer<typeof metricDefinitionIdSchema>;
export type MetricSnapshotId = z.infer<typeof metricSnapshotIdSchema>;
export type SourceRecordId = z.infer<typeof sourceRecordIdSchema>;
export type CanonicalRecordId = z.infer<typeof canonicalRecordIdSchema>;
export type EvidenceReferenceId = z.infer<typeof evidenceReferenceIdSchema>;
export type DataIssueId = z.infer<typeof dataIssueIdSchema>;
export type BusinessFactId = z.infer<typeof businessFactIdSchema>;

export function asTenantId(value: string): TenantId {
  return tenantIdSchema.parse(value);
}

export function asWorkspaceId(value: string): WorkspaceId {
  return workspaceIdSchema.parse(value);
}

export function asUserId(value: string): UserId {
  return userIdSchema.parse(value);
}

export function asMembershipId(value: string): MembershipId {
  return membershipIdSchema.parse(value);
}

export function asSessionId(value: string): SessionId {
  return sessionIdSchema.parse(value);
}

export function asInvitationId(value: string): InvitationId {
  return invitationIdSchema.parse(value);
}

export function asAuthChallengeId(value: string): AuthChallengeId {
  return authChallengeIdSchema.parse(value);
}

export function asPasswordResetId(value: string): PasswordResetId {
  return passwordResetIdSchema.parse(value);
}

export function asAuditEventId(value: string): AuditEventId {
  return auditEventIdSchema.parse(value);
}

export function asCorrelationId(value: string): CorrelationId {
  return correlationIdSchema.parse(value);
}

export function asOperationId(value: string): OperationId {
  return operationIdSchema.parse(value);
}

export function asMetricDefinitionId(value: string): MetricDefinitionId {
  return metricDefinitionIdSchema.parse(value);
}

export function asMetricSnapshotId(value: string): MetricSnapshotId {
  return metricSnapshotIdSchema.parse(value);
}

export function asSourceRecordId(value: string): SourceRecordId {
  return sourceRecordIdSchema.parse(value);
}

export function asCanonicalRecordId(value: string): CanonicalRecordId {
  return canonicalRecordIdSchema.parse(value);
}

export function asEvidenceReferenceId(value: string): EvidenceReferenceId {
  return evidenceReferenceIdSchema.parse(value);
}

export function asDataIssueId(value: string): DataIssueId {
  return dataIssueIdSchema.parse(value);
}

export function asBusinessFactId(value: string): BusinessFactId {
  return businessFactIdSchema.parse(value);
}

export const roleCatalog = [
  'tenant_owner',
  'workspace_admin',
  'analyst',
  'marketing_operator',
  'viewer',
  'billing_admin',
  'auditor_security',
  'internal_support_operations',
] as const;

export const roleSchema = z.enum(roleCatalog);
export type Role = z.infer<typeof roleSchema>;

export const capabilitySchema = z
  .string()
  .min(3)
  .regex(/^[a-z0-9:-]+$/)
  .brand<'Capability'>();

export type Capability = z.infer<typeof capabilitySchema>;

export function asCapability(value: string): Capability {
  return capabilitySchema.parse(value);
}

export const dataScopeCatalog = ['none', 'own', 'workspace', 'tenant'] as const;
export const dataScopeSchema = z.enum(dataScopeCatalog);
export type DataScope = z.infer<typeof dataScopeSchema>;

export const tenantStatusCatalog = ['active', 'blocked', 'suspended'] as const;
export const tenantStatusSchema = z.enum(tenantStatusCatalog);

export const workspaceStatusCatalog = ['ready', 'not_ready', 'blocked', 'no_data'] as const;
export const workspaceStatusSchema = z.enum(workspaceStatusCatalog);

export const membershipStatusCatalog = ['active', 'inactive', 'blocked'] as const;
export const membershipStatusSchema = z.enum(membershipStatusCatalog);

export const processStatusCatalog = [
  'requested',
  'queued',
  'processing',
  'waiting_for_provider',
  'waiting_for_user',
  'retrying',
  'partial',
  'succeeded',
  'failed',
  'cancelled',
  'expired',
  'blocked',
  'recovery_required',
] as const;

export const processStatusSchema = z.enum(processStatusCatalog);
export type ProcessStatus = z.infer<typeof processStatusSchema>;

export const errorClassCatalog = [
  'validation',
  'authentication',
  'authorization',
  'not_found',
  'conflict',
  'rate_limited',
  'provider_unavailable',
  'timeout',
  'data_quality',
  'readiness',
  'precondition',
  'security',
  'internal',
] as const;

export const errorClassSchema = z.enum(errorClassCatalog);
export type ErrorClass = z.infer<typeof errorClassSchema>;

export const dataLayerCatalog = [
  'source',
  'normalized',
  'canonical',
  'ready_dataset',
  'ready_kpi',
  'evidence',
] as const;

export const dataLayerSchema = z.enum(dataLayerCatalog);
export type DataLayer = z.infer<typeof dataLayerSchema>;

export const readinessStateCatalog = [
  'no_data',
  'partial',
  'delayed',
  'stale',
  'invalid',
  'conflicting',
  'processing',
  'ready',
  'resync_required',
  'manual_review_required',
] as const;

export const readinessStateSchema = z.enum(readinessStateCatalog);
export type ReadinessState = z.infer<typeof readinessStateSchema>;

export const systemStateCatalog = [
  'loading',
  'processing',
  'empty',
  'no_data',
  'partial_data',
  'delayed_data',
  'stale_data',
  'conflicting_data',
  'error',
  'no_access',
  'expired_session',
  'expired_link',
  'success',
  'warning',
  'integration_disconnected',
  'integration_syncing',
  'integration_error',
  'reauthorization_required',
  'data_quality_warning',
  'no_data_for_ai',
  'insufficient_permissions_for_ai',
  'workspace_not_ready',
  'workspace_blocked',
  'sync_failed',
  'sync_in_progress',
  'resync_required',
] as const;

export const systemStateSchema = z.enum(systemStateCatalog);
export type SystemState = z.infer<typeof systemStateSchema>;

export const timeRangeSchema = z.object({
  from: isoDateTimeSchema,
  to: isoDateTimeSchema,
});

export const currencyCodeSchema = z.string().regex(/^[A-Z]{3}$/);

export const readinessScopeSchema = z.object({
  currency: currencyCodeSchema.optional(),
  dataLayer: dataLayerSchema,
  period: timeRangeSchema.optional(),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export const readinessSchema = z.object({
  evaluatedAt: isoDateTimeSchema,
  limitations: z.array(z.string()).default([]),
  scope: readinessScopeSchema,
  state: readinessStateSchema,
});

export type Readiness = z.infer<typeof readinessSchema>;

export const tenantSchema = z.object({
  name: z.string().min(1),
  status: tenantStatusSchema,
  tenantId: tenantIdSchema,
});

export type Tenant = z.infer<typeof tenantSchema>;

export const workspaceSchema = z.object({
  name: z.string().min(1),
  readiness: readinessSchema.optional(),
  status: workspaceStatusSchema,
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type Workspace = z.infer<typeof workspaceSchema>;

export const membershipSchema = z.object({
  membershipId: membershipIdSchema,
  role: roleSchema,
  status: membershipStatusSchema,
  tenantId: tenantIdSchema,
  userId: userIdSchema,
  workspaceId: workspaceIdSchema,
});

export type Membership = z.infer<typeof membershipSchema>;

export const entitlementSchema = z.object({
  capability: capabilitySchema,
  enabled: z.boolean(),
  limitations: z.array(z.string()).default([]),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema.optional(),
});

export type Entitlement = z.infer<typeof entitlementSchema>;

export const sessionUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  mfaEnabled: z.boolean(),
  status: z.enum([
    'active',
    'blocked',
    'password_change_required',
    'password_reset_required',
  ]),
  userId: userIdSchema,
});

export type SessionUser = z.infer<typeof sessionUserSchema>;

export const sessionContextSchema = z.object({
  actorId: userIdSchema,
  capabilities: z.array(capabilitySchema).default([]),
  contractVersion: contractVersionSchema,
  correlationId: correlationIdSchema,
  dataScope: dataScopeSchema,
  roles: z.array(roleSchema),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type SessionContext = z.infer<typeof sessionContextSchema>;

export const applicationSessionContextSchema = z.object({
  activeWorkspace: workspaceSchema,
  capabilities: z.array(capabilitySchema),
  contractVersion: contractVersionSchema,
  correlationId: correlationIdSchema,
  currency: currencyCodeSchema,
  entitlements: z.array(entitlementSchema),
  featureFlags: z.record(z.string(), z.boolean()),
  locale: z.string().min(2),
  memberships: z.array(membershipSchema),
  tenant: tenantSchema,
  timezone: z.string().min(1),
  user: sessionUserSchema,
  workspaces: z.array(workspaceSchema),
});

export type ApplicationSessionContext = z.infer<typeof applicationSessionContextSchema>;

export const dataIssueSchema = z.object({
  issueId: dataIssueIdSchema,
  message: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'blocking']),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type DataIssue = z.infer<typeof dataIssueSchema>;

export const evidenceReferenceSchema = z.object({
  evidenceId: evidenceReferenceIdSchema,
  label: z.string().min(1),
  source: z.string().min(1),
  tenantId: tenantIdSchema,
  uri: z.string().min(1).optional(),
  workspaceId: workspaceIdSchema,
});

export type EvidenceReference = z.infer<typeof evidenceReferenceSchema>;

export const errorEnvelopeSchema = z.object({
  contractVersion: contractVersionSchema,
  correlationId: correlationIdSchema,
  error: z.object({
    code: z.string().min(1),
    errorClass: errorClassSchema,
    message: z.string().min(1),
    retrySafe: z.boolean(),
  }),
  limitations: z.array(z.string()).default([]),
  readiness: readinessSchema.optional(),
  status: z.literal('error'),
  tenantId: tenantIdSchema.optional(),
  workspaceId: workspaceIdSchema.optional(),
});

export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;

export const operationStatusSchema = z.object({
  contractVersion: contractVersionSchema,
  correlationId: correlationIdSchema,
  limitations: z.array(z.string()).default([]),
  operationId: operationIdSchema,
  readiness: readinessSchema.optional(),
  status: processStatusSchema,
  tenantId: tenantIdSchema.optional(),
  workspaceId: workspaceIdSchema.optional(),
});

export type OperationStatus = z.infer<typeof operationStatusSchema>;

export const auditEventSchema = z.object({
  actor: z
    .object({
      actorId: userIdSchema,
      roles: z.array(roleSchema),
    })
    .optional(),
  auditEventId: auditEventIdSchema,
  correlationId: correlationIdSchema,
  eventType: z
    .string()
    .min(3)
    .regex(/^[a-z0-9_.:-]+$/),
  occurredAt: isoDateTimeSchema,
  reason: z.string().min(1).optional(),
  result: z.enum(['success', 'failure', 'denied']),
  source: z.enum([
    'api_client',
    'app_shell',
    'auth_server',
    'local_auth_adapter',
    'storybook',
    'test',
    'web_ui',
  ]),
  tenantId: tenantIdSchema.optional(),
  workspaceId: workspaceIdSchema.optional(),
});

export type AuditEvent = z.infer<typeof auditEventSchema>;

export const workspaceCacheKeySchema = z.object({
  contractVersion: contractVersionSchema,
  scope: z.string().min(1),
  tenantId: tenantIdSchema,
  version: z.string().min(1),
  workspaceId: workspaceIdSchema,
});

export type WorkspaceCacheKey = z.infer<typeof workspaceCacheKeySchema>;

export function createWorkspaceCacheKey(input: WorkspaceCacheKey): string {
  const key = workspaceCacheKeySchema.parse(input);

  return [
    key.contractVersion,
    key.tenantId,
    key.workspaceId,
    key.scope,
    key.version,
  ].join(':');
}

export const resourceScopeSchema = z.discriminatedUnion('resourceKind', [
  z.object({
    resourceKind: z.literal('global'),
  }),
  z.object({
    resourceKind: z.literal('tenant'),
    tenantId: tenantIdSchema,
  }),
  z.object({
    resourceKind: z.literal('workspace'),
    tenantId: tenantIdSchema,
    workspaceId: workspaceIdSchema,
  }),
]);

export type ResourceScope = z.infer<typeof resourceScopeSchema>;

export type TenantWorkspaceValidation =
  | {
      ok: true;
      tenantId: TenantId;
      workspaceId: WorkspaceId;
    }
  | {
      errorCode: 'TENANT_NOT_FOUND' | 'WORKSPACE_NOT_FOUND' | 'WORKSPACE_TENANT_MISMATCH';
      ok: false;
    };

export function validateTenantWorkspacePair(
  input: {
    tenantId: TenantId;
    workspaceId: WorkspaceId;
  },
  tenants: readonly Pick<Tenant, 'tenantId'>[],
  workspaces: readonly Pick<Workspace, 'tenantId' | 'workspaceId'>[],
): TenantWorkspaceValidation {
  if (!tenants.some((tenant) => tenant.tenantId === input.tenantId)) {
    return { errorCode: 'TENANT_NOT_FOUND', ok: false };
  }

  const workspace = workspaces.find(
    (candidate) => candidate.workspaceId === input.workspaceId,
  );

  if (!workspace) {
    return { errorCode: 'WORKSPACE_NOT_FOUND', ok: false };
  }

  if (workspace.tenantId !== input.tenantId) {
    return { errorCode: 'WORKSPACE_TENANT_MISMATCH', ok: false };
  }

  return {
    ok: true,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
  };
}

export const workspaceScopedStatePolicy = {
  transferAllowed: false,
  resetScopes: ['cache', 'drafts', 'workspace_data'] as const,
} as const;

export type WorkspaceScopedResetScope =
  (typeof workspaceScopedStatePolicy.resetScopes)[number];

export type WorkspaceChangeResolution = {
  changed: boolean;
  next: {
    tenantId: TenantId;
    workspaceId: WorkspaceId;
  };
  previous?: {
    tenantId: TenantId;
    workspaceId: WorkspaceId;
  };
  resetScopes: readonly WorkspaceScopedResetScope[];
  transferAllowed: false;
};

export function resolveWorkspaceChange(
  previous: { tenantId: TenantId; workspaceId: WorkspaceId } | undefined,
  next: { tenantId: TenantId; workspaceId: WorkspaceId },
): WorkspaceChangeResolution {
  const changed =
    !previous ||
    previous.tenantId !== next.tenantId ||
    previous.workspaceId !== next.workspaceId;

  return {
    changed,
    next,
    previous,
    resetScopes: changed ? workspaceScopedStatePolicy.resetScopes : [],
    transferAllowed: false,
  };
}

export const sourceDataRecordSchema = z.object({
  layer: z.literal('source'),
  payloadHash: z.string().min(1),
  sourceRecordId: sourceRecordIdSchema,
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export const canonicalDataRecordSchema = z.object({
  canonicalRecordId: canonicalRecordIdSchema,
  layer: z.literal('canonical'),
  sourceRecordId: sourceRecordIdSchema,
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export const lineageSchema = z.object({
  canonicalRecordId: canonicalRecordIdSchema,
  sourceRecordId: sourceRecordIdSchema,
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type SourceDataRecord = z.infer<typeof sourceDataRecordSchema>;
export type CanonicalDataRecord = z.infer<typeof canonicalDataRecordSchema>;
export type Lineage = z.infer<typeof lineageSchema>;

export const metricDefinitionSchema = z.object({
  definition: z.string().min(1),
  metricId: metricDefinitionIdSchema,
  name: z.string().min(1),
  unit: z.string().min(1),
  version: z.string().min(1),
});

export type MetricDefinition = z.infer<typeof metricDefinitionSchema>;

export const businessFactReferenceSchema = z.object({
  factId: businessFactIdSchema,
  sourceRecordId: sourceRecordIdSchema,
});

export const metricSnapshotSchema = z.object({
  currency: currencyCodeSchema.optional(),
  evidence: z.array(evidenceReferenceSchema),
  factReferences: z.array(businessFactReferenceSchema),
  generatedAt: isoDateTimeSchema,
  lineage: z.array(lineageSchema),
  metricDefinitionVersion: z.string().min(1),
  metricId: metricDefinitionIdSchema,
  readiness: readinessSchema,
  snapshotId: metricSnapshotIdSchema,
  tenantId: tenantIdSchema,
  value: z.union([z.string(), z.null()]),
  workspaceId: workspaceIdSchema,
});

export type MetricSnapshot = z.infer<typeof metricSnapshotSchema>;

export type DomainInvariantViolationCode =
  | 'NO_DATA_MUST_NOT_BE_ZERO'
  | 'BUSINESS_FACT_USED_MORE_THAN_ONCE'
  | 'SOURCE_RECORD_IS_CANONICAL_RECORD'
  | 'CANONICAL_IS_NOT_READY_DATASET'
  | 'READY_DATASET_IS_NOT_READY_KPI'
  | 'READINESS_SCOPE_MISMATCH';

export type DomainInvariantViolation = {
  code: DomainInvariantViolationCode;
  message: string;
};

export function validateMetricSnapshotInvariants(
  snapshot: MetricSnapshot,
): readonly DomainInvariantViolation[] {
  const violations: DomainInvariantViolation[] = [];

  if (snapshot.readiness.state === 'no_data' && snapshot.value !== null) {
    violations.push({
      code: 'NO_DATA_MUST_NOT_BE_ZERO',
      message: 'Brak danych musi pozostać wartością null, a nie zerem.',
    });
  }

  const factIds = new Set<BusinessFactId>();

  for (const reference of snapshot.factReferences) {
    if (factIds.has(reference.factId)) {
      violations.push({
        code: 'BUSINESS_FACT_USED_MORE_THAN_ONCE',
        message: 'Jeden fakt biznesowy może zasilić KPI tylko raz.',
      });
      break;
    }

    factIds.add(reference.factId);
  }

  if (
    snapshot.readiness.scope.tenantId !== snapshot.tenantId ||
    snapshot.readiness.scope.workspaceId !== snapshot.workspaceId ||
    snapshot.readiness.scope.dataLayer !== 'ready_kpi'
  ) {
    violations.push({
      code: 'READINESS_SCOPE_MISMATCH',
      message: 'Readiness KPI jest lokalne dla tenanta, workspace, zakresu i waluty.',
    });
  }

  return violations;
}

export function validateLineageInvariants(
  lineage: Lineage,
): readonly DomainInvariantViolation[] {
  if (lineage.sourceRecordId === (lineage.canonicalRecordId as unknown as SourceRecordId)) {
    return [
      {
        code: 'SOURCE_RECORD_IS_CANONICAL_RECORD',
        message: 'Source data i canonical data muszą pozostać różnymi warstwami.',
      },
    ];
  }

  return [];
}

export function validateLayerPromotionInvariants(
  fromLayer: DataLayer,
  toLayer: DataLayer,
): readonly DomainInvariantViolation[] {
  if (fromLayer === 'canonical' && toLayer === 'ready_kpi') {
    return [
      {
        code: 'CANONICAL_IS_NOT_READY_DATASET',
        message: 'Canonical data nie mogą automatycznie stać się ready KPI.',
      },
    ];
  }

  if (fromLayer === 'ready_dataset' && toLayer === 'ready_kpi') {
    return [
      {
        code: 'READY_DATASET_IS_NOT_READY_KPI',
        message: 'Ready dataset wymaga osobnej readiness dla KPI.',
      },
    ];
  }

  return [];
}
