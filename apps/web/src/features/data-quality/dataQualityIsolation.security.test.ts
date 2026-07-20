import { describe, expect, it } from 'vitest';

import { asProviderId } from '../integrations/integrationContracts';
import { createWave2Runtime } from '../integrations/localIntegrationRuntime';
import {
  createForeignWave3Context,
  createReferenceWave3Pipeline,
  createWave3Context,
  wave3Period,
} from './dataQualityTestUtils';
import { LocalDataQualityRuntime } from './localDataQualityRuntime';

describe('Fala 3 data quality tenant/workspace isolation', () => {
  it('nie ujawnia obcego datasetu, readiness, lineage ani reconciliation', () => {
    const { datasetId, runtime } = createReferenceWave3Pipeline();
    const foreignContext = createForeignWave3Context();

    expect(() => runtime.getDataset(foreignContext, datasetId)).toThrow('NOT_FOUND');
    expect(() => runtime.getReadiness(foreignContext, datasetId)).toThrow('NOT_FOUND');
    expect(() => runtime.getLineage(foreignContext, datasetId)).toThrow('NOT_FOUND');
    expect(() => runtime.getReconciliation(foreignContext, datasetId)).toThrow('NOT_FOUND');
    expect(runtime.getSnapshot().monitoring.metrics.cross_workspace_deny).toBeGreaterThan(0);
  });

  it('odrzuca reprocess obcego datasetu i podmianę workspaceId', () => {
    const { datasetId, runtime } = createReferenceWave3Pipeline();
    const foreignContext = createForeignWave3Context();

    expect(() =>
      runtime.requestReprocess(foreignContext, {
        datasetId,
        idempotencyKey: 'idem_foreign_reprocess',
        reason: 'foreign_scope_attempt',
      }),
    ).toThrow('NOT_FOUND');
  });

  it('odrzuca manual review obcego issue', () => {
    const { context, runtime } = createReferenceWave3Pipeline({
      payloadPatch: (payload, record) =>
        record.externalId === 'woo_order_1001'
          ? {
              ...payload,
              status: 'provider_new_status',
            }
          : payload,
    });
    const issue = runtime.listDataIssues(context).data[0];
    const foreignContext = createForeignWave3Context();

    if (!issue) {
      throw new Error('EXPECTED_DATA_ISSUE_MISSING');
    }

    expect(() =>
      runtime.reviewIssue(foreignContext, {
        after: { status: 'confirmed' },
        before: { status: 'unknown' },
        expectedVersion: 0,
        issueId: issue.id,
        rationale: 'foreign review attempt',
      }),
    ).toThrow('NOT_FOUND');
  });

  it('ten sam external ID w dwóch workspace daje odrębne canonical orders i lineage', () => {
    const integrationRuntime = createWave2Runtime({ testMode: true });
    const mainContext = createWave3Context();
    const foreignContext = createForeignWave3Context();
    const mainConnection = integrationRuntime.createConnection(mainContext, {
      externalAccountRef: 'woo_account_northstar',
      grantedScopes: ['orders:read', 'products:read', 'refunds:read'],
      idempotencyKey: 'idem_wave3_main_connect',
      providerId: asProviderId('woocommerce'),
      requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
    }).connection;
    const foreignConnection = integrationRuntime.createConnection(foreignContext, {
      externalAccountRef: 'woo_account_baltic',
      grantedScopes: ['orders:read', 'products:read', 'refunds:read'],
      idempotencyKey: 'idem_wave3_foreign_connect',
      providerId: asProviderId('woocommerce'),
      requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
    }).connection;
    const mainJob = integrationRuntime.createSyncJob(mainContext, {
      connectionId: mainConnection.id,
      idempotencyKey: 'idem_wave3_main_sync',
      range: { mode: 'bounded', ...wave3Period },
      streams: ['orders'],
      type: 'INITIAL',
    }).job;
    const foreignJob = integrationRuntime.createSyncJob(foreignContext, {
      connectionId: foreignConnection.id,
      idempotencyKey: 'idem_wave3_foreign_sync',
      range: { mode: 'bounded', ...wave3Period },
      streams: ['orders'],
      type: 'INITIAL',
    }).job;
    integrationRuntime.runJob(mainContext, mainJob.id);
    integrationRuntime.runJob(foreignContext, foreignJob.id);

    const runtime = new LocalDataQualityRuntime();
    const snapshot = integrationRuntime.getSnapshot();
    const mainResult = runtime.processSourceSnapshot(mainContext, {
      ...snapshot,
      currency: 'PLN',
      period: wave3Period,
      payloadResolver: (record) =>
        integrationRuntime.getSourcePayloadForPipeline(mainContext, record.id),
      timezone: 'Europe/Warsaw',
    });
    const foreignResult = runtime.processSourceSnapshot(foreignContext, {
      ...snapshot,
      currency: 'PLN',
      period: wave3Period,
      payloadResolver: (record) =>
        integrationRuntime.getSourcePayloadForPipeline(foreignContext, record.id),
      timezone: 'Europe/Warsaw',
    });

    expect(mainResult.canonicalOrders).toHaveLength(2);
    expect(foreignResult.canonicalOrders).toHaveLength(2);
    expect(mainResult.canonicalOrders[0]?.id).not.toBe(foreignResult.canonicalOrders[0]?.id);
    expect(
      runtime
        .getLineage(mainContext, mainResult.dataset.id)
        .data.every((link) => link.workspaceId === mainContext.activeWorkspace.workspaceId),
    ).toBe(true);
  });
});
