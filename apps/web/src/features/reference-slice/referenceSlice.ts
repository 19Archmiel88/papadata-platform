import { z } from 'zod';

import {
  asAuditEventId,
  asBusinessFactId,
  asCanonicalRecordId,
  asCorrelationId,
  asEvidenceReferenceId,
  asMetricDefinitionId,
  asMetricSnapshotId,
  asOperationId,
  asSourceRecordId,
  auditEventSchema,
  canonicalDataRecordSchema,
  domainContractVersion,
  evidenceReferenceSchema,
  lineageSchema,
  metricDefinitionSchema,
  metricSnapshotSchema,
  operationStatusSchema,
  readinessSchema,
  sourceDataRecordSchema,
  validateMetricSnapshotInvariants,
  type ApplicationSessionContext,
  type AuditEvent,
  type CanonicalDataRecord,
  type EvidenceReference,
  type Lineage,
  type MetricDefinition,
  type MetricSnapshot,
  type OperationStatus,
  type SourceDataRecord,
} from '../../domain-contracts';
import { createApplicationSessionContext } from '../../shell/sessionContext';

export const referenceProviderSchema = z.object({
  name: z.string().min(1),
  providerId: z.literal('woocommerce'),
  scopes: z.array(z.string().min(1)),
});

export type ReferenceProvider = z.infer<typeof referenceProviderSchema>;

export const referenceFlowStageSchema = z.object({
  auditEventType: z.string().min(3),
  label: z.string().min(1),
  stageId: z.string().min(1),
  status: z.enum([
    'success',
    'loading',
    'empty',
    'partial',
    'error',
    'cancelled',
    'recovery',
  ]),
});

export type ReferenceFlowStage = z.infer<typeof referenceFlowStageSchema>;

export type ReferenceRecommendation = {
  confidence: 'medium';
  limitations: readonly string[];
  recommendationId: string;
  requiresHumanDecision: true;
  text: string;
};

export type ReferenceSlice = {
  auditTrail: readonly AuditEvent[];
  canonicalRecord: CanonicalDataRecord;
  commandCenterReadiness: OperationStatus['readiness'];
  evidence: readonly EvidenceReference[];
  flow: readonly ReferenceFlowStage[];
  initialSyncOperation: OperationStatus;
  lineage: Lineage;
  metricDefinition: MetricDefinition;
  metricSnapshot: MetricSnapshot;
  provider: ReferenceProvider;
  recommendation: ReferenceRecommendation;
  sourceRecord: SourceDataRecord;
};

export const pilotProvider = referenceProviderSchema.parse({
  name: 'WooCommerce',
  providerId: 'woocommerce',
  scopes: ['orders:read', 'products:read', 'refunds:read'],
});

export const referenceMetricDefinition = metricDefinitionSchema.parse({
  definition:
    'Suma przychodów netto z zamówień po odjęciu zwrotów, lokalna dla workspace i waluty.',
  metricId: asMetricDefinitionId('met_net_revenue'),
  name: 'Przychód netto',
  unit: 'PLN',
  version: '2026.07.1',
});

function buildReadiness(context: ApplicationSessionContext) {
  return readinessSchema.parse({
    evaluatedAt: '2026-07-19T00:00:00.000Z',
    limitations: [],
    scope: {
      currency: context.currency,
      dataLayer: 'ready_kpi',
      period: {
        from: '2026-07-01T00:00:00.000Z',
        to: '2026-07-19T00:00:00.000Z',
      },
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    },
    state: 'ready',
  });
}

function buildEvidence(context: ApplicationSessionContext): EvidenceReference {
  return evidenceReferenceSchema.parse({
    evidenceId: asEvidenceReferenceId('evd_reference_slice_orders'),
    label: 'Zamówienia i zwroty po synchronizacji początkowej',
    source: 'woocommerce.orders',
    tenantId: context.tenant.tenantId,
    uri: 'papadata://evidence/reference-slice/orders',
    workspaceId: context.activeWorkspace.workspaceId,
  });
}

function buildAuditTrail(context: ApplicationSessionContext): readonly AuditEvent[] {
  const scope = {
    tenantId: context.tenant.tenantId,
    workspaceId: context.activeWorkspace.workspaceId,
  };
  const actor = {
    actorId: context.user.userId,
    roles: context.memberships.map((membership) => membership.role),
  };
  const events = [
    ['aud_reference_login', 'auth.login_succeeded'],
    ['aud_reference_session', 'session.context_resolved'],
    ['aud_reference_workspace', 'auth.workspace_changed'],
    ['aud_reference_connect', 'integration.connected'],
    ['aud_reference_sync', 'integration.initial_sync_succeeded'],
    ['aud_reference_canonical', 'data.canonical_dataset_ready'],
    ['aud_reference_kpi', 'metric.snapshot_ready'],
    ['aud_reference_evidence', 'evidence.attached'],
    ['aud_reference_recommendation', 'ai.recommendation_needs_review'],
    ['aud_reference_decision', 'decision.human_approved'],
  ] as const;

  return events.map(([auditEventId, eventType]) =>
    auditEventSchema.parse({
      actor,
      auditEventId: asAuditEventId(auditEventId),
      correlationId: context.correlationId,
      eventType,
      occurredAt: '2026-07-19T00:00:00.000Z',
      result: 'success',
      source: 'app_shell',
      ...scope,
    }),
  );
}

export function buildReferenceSlice(
  context: ApplicationSessionContext = createApplicationSessionContext(),
): ReferenceSlice {
  const scope = {
    tenantId: context.tenant.tenantId,
    workspaceId: context.activeWorkspace.workspaceId,
  };
  const sourceRecord = sourceDataRecordSchema.parse({
    layer: 'source',
    payloadHash: 'sha256:reference-order-001',
    sourceRecordId: asSourceRecordId('src_reference_order_001'),
    ...scope,
  });
  const canonicalRecord = canonicalDataRecordSchema.parse({
    canonicalRecordId: asCanonicalRecordId('can_reference_order_001'),
    layer: 'canonical',
    sourceRecordId: sourceRecord.sourceRecordId,
    ...scope,
  });
  const lineage = lineageSchema.parse({
    canonicalRecordId: canonicalRecord.canonicalRecordId,
    sourceRecordId: sourceRecord.sourceRecordId,
    ...scope,
  });
  const evidence = buildEvidence(context);
  const readiness = buildReadiness(context);
  const initialSyncOperation = operationStatusSchema.parse({
    contractVersion: domainContractVersion,
    correlationId: asCorrelationId('cor_reference_sync'),
    limitations: [],
    operationId: asOperationId('op_reference_initial_sync'),
    readiness,
    status: 'succeeded',
    ...scope,
  });
  const metricSnapshot = metricSnapshotSchema.parse({
    currency: context.currency,
    evidence: [evidence],
    factReferences: [
      {
        factId: asBusinessFactId('fact_reference_order_001'),
        sourceRecordId: sourceRecord.sourceRecordId,
      },
    ],
    generatedAt: '2026-07-19T00:00:00.000Z',
    lineage: [lineage],
    metricDefinitionVersion: referenceMetricDefinition.version,
    metricId: referenceMetricDefinition.metricId,
    readiness,
    snapshotId: asMetricSnapshotId('snp_reference_net_revenue'),
    value: '128900.00',
    ...scope,
  });

  return {
    auditTrail: buildAuditTrail(context),
    canonicalRecord,
    commandCenterReadiness: readiness,
    evidence: [evidence],
    flow: [
      {
        auditEventType: 'auth.login_succeeded',
        label: 'Logowanie',
        stageId: 'login',
        status: 'success',
      },
      {
        auditEventType: 'session.context_resolved',
        label: 'SessionContext',
        stageId: 'session-context',
        status: 'success',
      },
      {
        auditEventType: 'auth.workspace_changed',
        label: 'Workspace',
        stageId: 'workspace',
        status: 'success',
      },
      {
        auditEventType: 'integration.connected',
        label: 'Integracja',
        stageId: 'integration',
        status: 'success',
      },
      {
        auditEventType: 'integration.initial_sync_succeeded',
        label: 'Sync',
        stageId: 'sync',
        status: 'success',
      },
      {
        auditEventType: 'data.canonical_dataset_ready',
        label: 'Canonical dataset',
        stageId: 'canonical',
        status: 'success',
      },
      {
        auditEventType: 'metric.snapshot_ready',
        label: 'KPI',
        stageId: 'kpi',
        status: 'success',
      },
      {
        auditEventType: 'decision.human_approved',
        label: 'Decyzja',
        stageId: 'decision',
        status: 'success',
      },
    ].map((stage) => referenceFlowStageSchema.parse(stage)),
    initialSyncOperation,
    lineage,
    metricDefinition: referenceMetricDefinition,
    metricSnapshot,
    provider: pilotProvider,
    recommendation: {
      confidence: 'medium',
      limitations: ['Rekomendacja nie wykonuje autonomicznych działań finansowych.'],
      recommendationId: 'rec_reference_margin_review',
      requiresHumanDecision: true,
      text: 'Zweryfikuj spadek marży w kampanii lipcowej przed zmianą budżetu.',
    },
    sourceRecord,
  };
}

export function validateReferenceSlice(slice: ReferenceSlice): readonly string[] {
  return validateMetricSnapshotInvariants(slice.metricSnapshot).map(
    (violation) => violation.code,
  );
}
