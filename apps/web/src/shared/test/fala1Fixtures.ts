import { z } from 'zod';

import {
  applicationSessionContextSchema,
  asBusinessFactId,
  asCanonicalRecordId,
  asCorrelationId,
  asDataIssueId,
  asEvidenceReferenceId,
  asMembershipId,
  asMetricDefinitionId,
  asMetricSnapshotId,
  asOperationId,
  asSourceRecordId,
  asTenantId,
  asUserId,
  asWorkspaceId,
  dataIssueSchema,
  domainContractVersion,
  evidenceReferenceSchema,
  metricSnapshotSchema,
  operationStatusSchema,
  readinessSchema,
  type ApplicationSessionContext,
  type DataLayer,
  type Entitlement,
  type Readiness,
  type ReadinessState,
} from '../../domain-contracts';
import {
  createApplicationSessionContext,
  foundationCapabilities,
  type WorkspaceScope,
} from '../../shell/sessionContext';

const northstarMain: WorkspaceScope = {
  tenantId: asTenantId('ten_northstar'),
  workspaceId: asWorkspaceId('wrk_northstar_main'),
};

const northstarLab: WorkspaceScope = {
  tenantId: asTenantId('ten_northstar'),
  workspaceId: asWorkspaceId('wrk_northstar_lab'),
};

const canonicalFixtureIds = [
  'ctx_owner_ready',
  'ctx_admin_partial',
  'ctx_analyst_invalid',
  'ctx_viewer_forbidden',
  'ctx_ops_jit',
  'integration_reauth',
  'sync_retry_wait',
  'quality_conflict',
  'metric_definition_changed',
  'ai_insufficient_data',
  'ai_needs_review',
  'billing_past_due',
] as const;

export const canonicalFixtureIdSchema = z.enum(canonicalFixtureIds);
export type CanonicalStoryFixtureId = z.infer<typeof canonicalFixtureIdSchema>;

function makeReadiness(
  state: ReadinessState,
  scope: WorkspaceScope = northstarMain,
  dataLayer: DataLayer = 'ready_dataset',
  limitations: readonly string[] = [],
): Readiness {
  return readinessSchema.parse({
    evaluatedAt: '2026-07-19T00:00:00.000Z',
    limitations: [...limitations],
    scope: {
      currency: 'PLN',
      dataLayer,
      period: {
        from: '2026-07-01T00:00:00.000Z',
        to: '2026-07-19T00:00:00.000Z',
      },
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
    },
    state,
  });
}

const sharedEvidence = evidenceReferenceSchema.parse({
  evidenceId: asEvidenceReferenceId('evd_reference_orders'),
  label: 'Zamówienia WooCommerce z lipca',
  source: 'woocommerce.orders',
  tenantId: northstarMain.tenantId,
  uri: 'papadata://evidence/woocommerce/orders/july',
  workspaceId: northstarMain.workspaceId,
});

const ownerReady = createApplicationSessionContext({
  readiness: makeReadiness('ready'),
  tenantId: northstarMain.tenantId,
  userId: asUserId('usr_owner'),
  workspaceId: northstarMain.workspaceId,
});

const adminPartial = createApplicationSessionContext({
  readiness: makeReadiness(
    'partial',
    northstarLab,
    'ready_dataset',
    ['Brakuje danych historycznych sprzed pierwszego backfillu.'],
  ),
  tenantId: northstarLab.tenantId,
  userId: asUserId('usr_multi_workspace'),
  workspaceId: northstarLab.workspaceId,
});

const analystInvalid = createApplicationSessionContext({
  readiness: makeReadiness(
    'invalid',
    northstarMain,
    'ready_dataset',
    ['Wykryto konflikt waluty w części rekordów.'],
  ),
  tenantId: northstarMain.tenantId,
  userId: asUserId('usr_analyst'),
  workspaceId: northstarMain.workspaceId,
});

const viewerForbidden = applicationSessionContextSchema.parse({
  ...createApplicationSessionContext({
    readiness: makeReadiness('ready'),
    tenantId: northstarMain.tenantId,
    userId: asUserId('usr_viewer'),
    workspaceId: northstarMain.workspaceId,
  }),
  capabilities: [],
  entitlements: [],
});

const opsJit = createApplicationSessionContext({
  memberships: [
    {
      membershipId: asMembershipId('mem_ops_jit'),
      role: 'internal_support_operations',
      status: 'active',
      tenantId: northstarMain.tenantId,
      userId: asUserId('usr_owner'),
      workspaceId: northstarMain.workspaceId,
    },
  ],
  readiness: makeReadiness('manual_review_required'),
  tenantId: northstarMain.tenantId,
  userId: asUserId('usr_owner'),
  workspaceId: northstarMain.workspaceId,
});

function withDisabledBillingEntitlement(
  context: ApplicationSessionContext,
): ApplicationSessionContext {
  const billingEntitlement: Entitlement = {
    capability: foundationCapabilities.billingRead,
    enabled: false,
    limitations: ['Plan workspace jest po terminie płatności.'],
    tenantId: context.tenant.tenantId,
  };

  return applicationSessionContextSchema.parse({
    ...context,
    capabilities: [...context.capabilities, foundationCapabilities.billingRead],
    entitlements: [
      ...context.entitlements.filter(
        (entitlement) => entitlement.capability !== foundationCapabilities.billingRead,
      ),
      billingEntitlement,
    ],
  });
}

const retryOperation = operationStatusSchema.parse({
  contractVersion: domainContractVersion,
  correlationId: asCorrelationId('cor_sync_retry_wait'),
  limitations: ['Provider zwrócił limit rate limit, retry jest bezpieczny.'],
  operationId: asOperationId('op_sync_retry_wait'),
  readiness: makeReadiness('processing'),
  status: 'retrying',
  tenantId: northstarMain.tenantId,
  workspaceId: northstarMain.workspaceId,
});

const metricChangedSnapshot = metricSnapshotSchema.parse({
  currency: 'PLN',
  evidence: [sharedEvidence],
  factReferences: [
    {
      factId: asBusinessFactId('fact_order_revenue_001'),
      sourceRecordId: asSourceRecordId('src_woo_order_001'),
    },
  ],
  generatedAt: '2026-07-19T00:00:00.000Z',
  lineage: [
    {
      canonicalRecordId: asCanonicalRecordId('can_order_001'),
      sourceRecordId: asSourceRecordId('src_woo_order_001'),
      tenantId: northstarMain.tenantId,
      workspaceId: northstarMain.workspaceId,
    },
  ],
  metricDefinitionVersion: '2026.07.1',
  metricId: asMetricDefinitionId('met_net_revenue'),
  readiness: makeReadiness(
    'ready',
    northstarMain,
    'ready_kpi',
    ['Definicja KPI została zmieniona i wymaga porównania z poprzednią wersją.'],
  ),
  snapshotId: asMetricSnapshotId('snp_net_revenue_changed'),
  tenantId: northstarMain.tenantId,
  value: '128900.00',
  workspaceId: northstarMain.workspaceId,
});

export const canonicalStoryFixtureSchema = z.object({
  context: applicationSessionContextSchema,
  dataIssues: z.array(dataIssueSchema),
  evidence: z.array(evidenceReferenceSchema),
  fixtureId: canonicalFixtureIdSchema,
  metricSnapshot: metricSnapshotSchema.optional(),
  operation: operationStatusSchema.optional(),
  readiness: readinessSchema,
});

export type CanonicalStoryFixture = z.infer<typeof canonicalStoryFixtureSchema>;

function makeFixture(input: CanonicalStoryFixture): CanonicalStoryFixture {
  return canonicalStoryFixtureSchema.parse(input);
}

export const canonicalStoryFixtures = {
  ai_insufficient_data: makeFixture({
    context: analystInvalid,
    dataIssues: [],
    evidence: [],
    fixtureId: 'ai_insufficient_data',
    readiness: makeReadiness(
      'no_data',
      northstarMain,
      'ready_kpi',
      ['AI nie otrzyma danych bez gotowego KPI i evidence.'],
    ),
  }),
  ai_needs_review: makeFixture({
    context: opsJit,
    dataIssues: [],
    evidence: [sharedEvidence],
    fixtureId: 'ai_needs_review',
    readiness: makeReadiness(
      'manual_review_required',
      northstarMain,
      'ready_kpi',
      ['Rekomendacja wymaga akceptacji człowieka przed działaniem.'],
    ),
  }),
  billing_past_due: makeFixture({
    context: withDisabledBillingEntitlement(ownerReady),
    dataIssues: [],
    evidence: [],
    fixtureId: 'billing_past_due',
    readiness: makeReadiness(
      'partial',
      northstarMain,
      'ready_dataset',
      ['Dostęp do części funkcji jest ograniczony przez billing.'],
    ),
  }),
  ctx_admin_partial: makeFixture({
    context: adminPartial,
    dataIssues: [],
    evidence: [],
    fixtureId: 'ctx_admin_partial',
    readiness: makeReadiness('partial', northstarLab),
  }),
  ctx_analyst_invalid: makeFixture({
    context: analystInvalid,
    dataIssues: [
      dataIssueSchema.parse({
        issueId: asDataIssueId('iss_invalid_currency'),
        message: 'Rekordy źródłowe zawierają mieszane waluty.',
        severity: 'blocking',
        tenantId: northstarMain.tenantId,
        workspaceId: northstarMain.workspaceId,
      }),
    ],
    evidence: [],
    fixtureId: 'ctx_analyst_invalid',
    readiness: makeReadiness('invalid'),
  }),
  ctx_ops_jit: makeFixture({
    context: opsJit,
    dataIssues: [],
    evidence: [sharedEvidence],
    fixtureId: 'ctx_ops_jit',
    readiness: makeReadiness('manual_review_required'),
  }),
  ctx_owner_ready: makeFixture({
    context: ownerReady,
    dataIssues: [],
    evidence: [sharedEvidence],
    fixtureId: 'ctx_owner_ready',
    readiness: makeReadiness('ready'),
  }),
  ctx_viewer_forbidden: makeFixture({
    context: viewerForbidden,
    dataIssues: [],
    evidence: [],
    fixtureId: 'ctx_viewer_forbidden',
    readiness: makeReadiness('ready'),
  }),
  integration_reauth: makeFixture({
    context: ownerReady,
    dataIssues: [],
    evidence: [],
    fixtureId: 'integration_reauth',
    operation: operationStatusSchema.parse({
      contractVersion: domainContractVersion,
      correlationId: asCorrelationId('cor_integration_reauth'),
      limitations: ['Provider wymaga ponownej autoryzacji dostępu.'],
      operationId: asOperationId('op_integration_reauth'),
      readiness: makeReadiness('resync_required'),
      status: 'waiting_for_user',
      tenantId: northstarMain.tenantId,
      workspaceId: northstarMain.workspaceId,
    }),
    readiness: makeReadiness('resync_required'),
  }),
  metric_definition_changed: makeFixture({
    context: ownerReady,
    dataIssues: [],
    evidence: [sharedEvidence],
    fixtureId: 'metric_definition_changed',
    metricSnapshot: metricChangedSnapshot,
    readiness: metricChangedSnapshot.readiness,
  }),
  quality_conflict: makeFixture({
    context: analystInvalid,
    dataIssues: [
      dataIssueSchema.parse({
        issueId: asDataIssueId('iss_quality_conflict'),
        message: 'Ten sam fakt biznesowy ma sprzeczne wartości w dwóch źródłach.',
        severity: 'error',
        tenantId: northstarMain.tenantId,
        workspaceId: northstarMain.workspaceId,
      }),
    ],
    evidence: [sharedEvidence],
    fixtureId: 'quality_conflict',
    readiness: makeReadiness('conflicting'),
  }),
  sync_retry_wait: makeFixture({
    context: ownerReady,
    dataIssues: [],
    evidence: [],
    fixtureId: 'sync_retry_wait',
    operation: retryOperation,
    readiness: retryOperation.readiness ?? makeReadiness('processing'),
  }),
} satisfies Record<CanonicalStoryFixtureId, CanonicalStoryFixture>;

export type MockServiceHandler = {
  fixtureId: CanonicalStoryFixtureId;
  method: 'GET' | 'POST';
  path: string;
  response: CanonicalStoryFixture;
};

export const foundationMockHandlers: readonly MockServiceHandler[] = [
  {
    fixtureId: 'ctx_owner_ready',
    method: 'GET',
    path: '/api/session-context',
    response: canonicalStoryFixtures.ctx_owner_ready,
  },
  {
    fixtureId: 'sync_retry_wait',
    method: 'GET',
    path: '/api/operations/op_sync_retry_wait',
    response: canonicalStoryFixtures.sync_retry_wait,
  },
  {
    fixtureId: 'metric_definition_changed',
    method: 'GET',
    path: '/api/metrics/met_net_revenue/snapshots/current',
    response: canonicalStoryFixtures.metric_definition_changed,
  },
];

export function validateCanonicalStoryFixtures(
  fixtures: Record<CanonicalStoryFixtureId, CanonicalStoryFixture> = canonicalStoryFixtures,
): readonly CanonicalStoryFixture[] {
  return canonicalFixtureIds.map((fixtureId) =>
    canonicalStoryFixtureSchema.parse(fixtures[fixtureId]),
  );
}
