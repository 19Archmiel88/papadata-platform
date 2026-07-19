import { describe, expect, it } from 'vitest';

import {
  asBusinessFactId,
  asCanonicalRecordId,
  asCorrelationId,
  asEvidenceReferenceId,
  asMetricDefinitionId,
  asMetricSnapshotId,
  asOperationId,
  asSourceRecordId,
  domainContractVersion,
  errorEnvelopeSchema,
  lineageSchema,
  membershipSchema,
  metricDefinitionSchema,
  metricSnapshotSchema,
  operationStatusSchema,
  readinessSchema,
  resolveWorkspaceChange,
  sourceDataRecordSchema,
  tenantSchema,
  validateLayerPromotionInvariants,
  validateLineageInvariants,
  validateMetricSnapshotInvariants,
  validateTenantWorkspacePair,
  workspaceSchema,
} from '../domain-contracts';
import {
  localAuthMemberships,
  localAuthTenants,
  localAuthWorkspaces,
} from '../fixtures/auth-domain';

const evaluatedAt = '2026-07-19T00:00:00.000Z';
const tenantId = localAuthTenants[0].tenantId;
const workspaceId = localAuthWorkspaces[0].workspaceId;

function readyKpiReadiness() {
  return readinessSchema.parse({
    evaluatedAt,
    scope: {
      currency: 'PLN',
      dataLayer: 'ready_kpi',
      period: {
        from: '2026-07-01T00:00:00.000Z',
        to: '2026-07-31T23:59:59.000Z',
      },
      tenantId,
      workspaceId,
    },
    state: 'ready',
  });
}

function metricSnapshot() {
  return metricSnapshotSchema.parse({
    currency: 'PLN',
    evidence: [
      {
        evidenceId: asEvidenceReferenceId('ev_orders_july'),
        label: 'Zamówienia lipiec',
        source: 'WooCommerce',
        tenantId,
        workspaceId,
      },
    ],
    factReferences: [
      {
        factId: asBusinessFactId('fact_order_1'),
        sourceRecordId: asSourceRecordId('src_order_1'),
      },
    ],
    generatedAt: evaluatedAt,
    lineage: [
      {
        canonicalRecordId: asCanonicalRecordId('can_order_1'),
        sourceRecordId: asSourceRecordId('src_order_1'),
        tenantId,
        workspaceId,
      },
    ],
    metricDefinitionVersion: 'v1',
    metricId: asMetricDefinitionId('metric_revenue'),
    readiness: readyKpiReadiness(),
    snapshotId: asMetricSnapshotId('snap_revenue_july'),
    tenantId,
    value: '1250.00',
    workspaceId,
  });
}

describe('Fala 0 domain contracts', () => {
  it('validates auth fixtures with the same tenant and workspace schemas as API contracts', () => {
    expect(() => localAuthTenants.forEach((tenant) => tenantSchema.parse(tenant))).not.toThrow();
    expect(() =>
      localAuthWorkspaces.forEach((workspace) => workspaceSchema.parse(workspace)),
    ).not.toThrow();
    expect(() =>
      localAuthMemberships.forEach((membership) => membershipSchema.parse(membership)),
    ).not.toThrow();

    for (const workspace of localAuthWorkspaces) {
      expect(
        validateTenantWorkspacePair(
          {
            tenantId: workspace.tenantId,
            workspaceId: workspace.workspaceId,
          },
          localAuthTenants,
          localAuthWorkspaces,
        ),
      ).toMatchObject({ ok: true });
    }
  });

  it('rejects tenant and workspace mismatch before authorization decisions reuse state', () => {
    const mismatch = validateTenantWorkspacePair(
      {
        tenantId: localAuthTenants[0].tenantId,
        workspaceId: localAuthWorkspaces[3].workspaceId,
      },
      localAuthTenants,
      localAuthWorkspaces,
    );
    const change = resolveWorkspaceChange(
      {
        tenantId: localAuthTenants[0].tenantId,
        workspaceId: localAuthWorkspaces[0].workspaceId,
      },
      {
        tenantId: localAuthTenants[0].tenantId,
        workspaceId: localAuthWorkspaces[1].workspaceId,
      },
    );

    expect(mismatch).toEqual({
      errorCode: 'WORKSPACE_TENANT_MISMATCH',
      ok: false,
    });
    expect(change).toMatchObject({
      changed: true,
      resetScopes: ['cache', 'drafts', 'workspace_data'],
      transferAllowed: false,
    });
  });

  it('keeps data layer and KPI invariants explicit and testable', () => {
    const snapshot = metricSnapshot();
    const noDataSnapshot = metricSnapshotSchema.parse({
      ...snapshot,
      readiness: {
        ...snapshot.readiness,
        state: 'no_data',
      },
      value: null,
    });
    const noDataAsZero = metricSnapshotSchema.parse({
      ...noDataSnapshot,
      value: '0',
    });
    const duplicatedFact = metricSnapshotSchema.parse({
      ...snapshot,
      factReferences: [
        ...snapshot.factReferences,
        {
          factId: snapshot.factReferences[0].factId,
          sourceRecordId: asSourceRecordId('src_order_2'),
        },
      ],
    });

    expect(validateMetricSnapshotInvariants(noDataSnapshot)).toEqual([]);
    expect(validateMetricSnapshotInvariants(noDataAsZero)).toContainEqual(
      expect.objectContaining({ code: 'NO_DATA_MUST_NOT_BE_ZERO' }),
    );
    expect(validateMetricSnapshotInvariants(duplicatedFact)).toContainEqual(
      expect.objectContaining({ code: 'BUSINESS_FACT_USED_MORE_THAN_ONCE' }),
    );
    expect(validateLayerPromotionInvariants('canonical', 'ready_kpi')).toContainEqual(
      expect.objectContaining({ code: 'CANONICAL_IS_NOT_READY_DATASET' }),
    );
    expect(validateLayerPromotionInvariants('ready_dataset', 'ready_kpi')).toContainEqual(
      expect.objectContaining({ code: 'READY_DATASET_IS_NOT_READY_KPI' }),
    );
  });

  it('versions metric definitions, operation contracts, errors and lineage', () => {
    expect(() =>
      metricDefinitionSchema.parse({
        definition: 'Przychód po rabatach bez podatku.',
        metricId: asMetricDefinitionId('metric_revenue'),
        name: 'Przychód',
        unit: 'currency',
        version: 'v1',
      }),
    ).not.toThrow();
    expect(() =>
      sourceDataRecordSchema.parse({
        layer: 'source',
        payloadHash: 'sha256:orders',
        sourceRecordId: asSourceRecordId('src_order_1'),
        tenantId,
        workspaceId,
      }),
    ).not.toThrow();
    expect(() =>
      lineageSchema.parse({
        canonicalRecordId: asCanonicalRecordId('can_order_1'),
        sourceRecordId: asSourceRecordId('src_order_1'),
        tenantId,
        workspaceId,
      }),
    ).not.toThrow();
    expect(validateLineageInvariants({
      canonicalRecordId: asCanonicalRecordId('can_order_1'),
      sourceRecordId: asSourceRecordId('src_order_1'),
      tenantId,
      workspaceId,
    })).toEqual([]);
    expect(() =>
      operationStatusSchema.parse({
        contractVersion: domainContractVersion,
        correlationId: asCorrelationId('corr_operation'),
        operationId: asOperationId('op_backfill_1'),
        readiness: readyKpiReadiness(),
        status: 'processing',
        tenantId,
        workspaceId,
      }),
    ).not.toThrow();
    expect(() =>
      errorEnvelopeSchema.parse({
        contractVersion: domainContractVersion,
        correlationId: asCorrelationId('corr_error'),
        error: {
          code: 'WORKSPACE_TENANT_MISMATCH',
          errorClass: 'authorization',
          message: 'Workspace nie należy do tenanta.',
          retrySafe: false,
        },
        status: 'error',
        tenantId,
        workspaceId,
      }),
    ).not.toThrow();
  });
});
