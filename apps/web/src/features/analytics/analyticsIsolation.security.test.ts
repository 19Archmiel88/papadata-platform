import { describe, expect, it } from 'vitest';

import { asWorkspaceId } from '../../domain-contracts';
import {
  analyticsCachePolicyVersion,
  analyticsProjectionVersion,
  createAnalyticsCacheKey,
} from './analyticsContracts';
import {
  createForeignWave4Context,
  createReferenceWave4Analytics,
  createWave4Context,
  wave4Period,
} from './analyticsTestUtils';
import { LocalAnalyticsRuntime } from './localAnalyticsRuntime';

describe('Fala 4 analytics tenant/workspace isolation', () => {
  it('nie ujawnia obcego snapshotu, evidence, lineage, reconciliation ani exportu', () => {
    const { context, runtime } = createReferenceWave4Analytics();
    const foreignContext = createForeignWave4Context();
    const snapshot = runtime.getMetricHistory(context, 'order_count')[0];

    if (!snapshot) {
      throw new Error('SNAPSHOT_MISSING');
    }

    const exportObject = runtime.requestMetricExport(context, {
      metricSnapshotIds: [snapshot.id],
      period: wave4Period,
    });

    expect(() => runtime.getMetricSnapshot(foreignContext, snapshot.id)).toThrow('NOT_FOUND');
    expect(() => runtime.getSnapshotEvidence(foreignContext, snapshot.id)).toThrow('NOT_FOUND');
    expect(() => runtime.getSnapshotLineage(foreignContext, snapshot.id)).toThrow('NOT_FOUND');
    expect(() => runtime.getSnapshotReconciliation(foreignContext, snapshot.id)).toThrow('NOT_FOUND');
    expect(() => runtime.getMetricExport(foreignContext, exportObject.id)).toThrow('NOT_FOUND');
    expect(runtime.getMonitoring().crossWorkspaceDenyCount).toBeGreaterThan(0);
  });

  it('odrzuca capability bypass i entitlement bypass', () => {
    const runtime = new LocalAnalyticsRuntime();
    const context = createWave4Context();
    const noCapability = {
      ...context,
      capabilities: [],
      entitlements: [],
    };
    const noEntitlement = {
      ...context,
      entitlements: [],
    };

    expect(() => runtime.listMetricDefinitions(noCapability)).toThrow('CAPABILITY_REQUIRED');
    expect(() => runtime.listMetricDefinitions(noEntitlement)).toThrow('ENTITLEMENT_REQUIRED');
  });

  it('cache key izoluje tenant, workspace, readiness i wersję definicji', () => {
    const context = createWave4Context();
    const base = {
      currency: context.currency,
      dataScope: 'orders',
      metricCode: 'gross_revenue' as const,
      metricDefinitionVersion: 'metric.gross-revenue.v1',
      period: wave4Period,
      policyVersion: analyticsCachePolicyVersion,
      projectionVersion: analyticsProjectionVersion,
      readiness: 'READY' as const,
      tenantId: context.tenant.tenantId,
      timezone: context.timezone,
      workspaceId: context.activeWorkspace.workspaceId,
    };

    expect(createAnalyticsCacheKey(base)).not.toBe(
      createAnalyticsCacheKey({
        ...base,
        readiness: 'PARTIAL',
      }),
    );
    expect(createAnalyticsCacheKey(base)).not.toBe(
      createAnalyticsCacheKey({
        ...base,
        workspaceId: asWorkspaceId('wrk_baltic_marketplace'),
      }),
    );
  });

  it('odrzuca spóźnioną odpowiedź starego workspace po zmianie kontekstu', () => {
    const { context, runtime } = createReferenceWave4Analytics();
    const wrongToken = {
      tenantId: context.tenant.tenantId,
      workspaceId: asWorkspaceId('wrk_baltic_marketplace'),
    };

    expect(() =>
      runtime.getMetricSnapshots(context, {
        requestToken: wrongToken,
      }),
    ).toThrow('STALE_WORKSPACE_RESPONSE');
  });

  it('zmiana workspace czyści cache i zamyka szczegóły', () => {
    const { context, runtime } = createReferenceWave4Analytics();
    runtime.getCommandCenterProjection(context);
    const response = runtime.createWorkspaceSwitchResponse(context, {
      tenantId: context.tenant.tenantId,
      workspaceId: asWorkspaceId('wrk_baltic_marketplace'),
    });

    expect(response).toMatchObject({
      accepted: true,
      cacheCleared: true,
      detailsClosed: true,
    });
  });
});
