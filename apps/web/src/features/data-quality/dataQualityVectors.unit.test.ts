import { describe, expect, it } from 'vitest';

import {
  asIntegrationSourceRecordId,
  asProviderId,
} from '../integrations/integrationContracts';
import { createWave2Runtime } from '../integrations/localIntegrationRuntime';
import {
  createReferenceWave3Pipeline,
  createWave3Context,
  wave3Period,
} from './dataQualityTestUtils';
import { LocalDataQualityRuntime } from './localDataQualityRuntime';

describe('Fala 3 data test vectors', () => {
  it('brak rekordów daje NO_DATA i nie generuje zera', () => {
    const integrationRuntime = createWave2Runtime({ testMode: true });
    const context = createWave3Context();
    integrationRuntime.createConnection(context, {
      externalAccountRef: 'woo_account_northstar',
      grantedScopes: ['orders:read', 'products:read', 'refunds:read'],
      idempotencyKey: 'idem_wave3_no_data_connect',
      providerId: asProviderId('woocommerce'),
      requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
    });
    const runtime = new LocalDataQualityRuntime();
    const result = runtime.processSourceSnapshot(context, {
      ...integrationRuntime.getSnapshot(),
      currency: 'PLN',
      period: wave3Period,
      payloadResolver: () => {
        throw new Error('NO_PAYLOAD_EXPECTED');
      },
      timezone: 'Europe/Warsaw',
    });

    expect(result.dataset.readinessStatus).toBe('NO_DATA');
    expect(result.readiness.limitations[0]?.code).toBe('NO_DATA_IS_NOT_ZERO');
    expect(result.canonicalOrders).toHaveLength(0);
  });

  it('rozróżnia jawne zero od braku wartości', () => {
    const { runtime } = createReferenceWave3Pipeline({
      payloadPatch: (payload, record) =>
        record.externalId === 'woo_order_1001'
          ? {
              ...payload,
              discount: 0,
              refund: 0,
            }
          : payload,
    });
    const normalized = runtime
      .getSnapshot()
      .normalizedRecords.find((record) => record.data.externalOrderId === 'woo_order_1001');

    expect(normalized?.data.zeroEvidenceFields).toEqual(
      expect.arrayContaining(['discount', 'refund']),
    );
    expect(normalized?.data.amounts.shipping).toBe('19');
  });

  it('invalid type, missing required field i unknown currency blokują readiness', () => {
    const { runtime } = createReferenceWave3Pipeline({
      payloadPatch: (payload, record) =>
        record.externalId === 'woo_order_1001'
          ? {
              ...payload,
              currency: 'XYZ',
              gross: false,
              orderNumber: '',
            }
          : payload,
    });
    const dataset = runtime.getSnapshot().datasets[0];
    const issueClasses = runtime.getSnapshot().issues.map((issue) => issue.class);

    expect(dataset?.readinessStatus).toBe('INVALID');
    expect(issueClasses).toEqual(
      expect.arrayContaining([
        'normalization.INVALID_NUMBER',
        'normalization.MISSING_REQUIRED_FIELD',
        'normalization.UNKNOWN_CURRENCY',
      ]),
    );
  });

  it('unknown status daje PARTIAL i blokuje KPI wrażliwe na kwalifikację', () => {
    const { runtime } = createReferenceWave3Pipeline({
      payloadPatch: (payload, record) =>
        record.externalId === 'woo_order_1001'
          ? {
              ...payload,
              status: 'awaiting-provider-review',
            }
          : payload,
    });
    const snapshot = runtime.getSnapshot();

    expect(snapshot.datasets[0]?.readinessStatus).toBe('PARTIAL');
    expect(snapshot.issues.map((issue) => issue.class)).toContain(
      'normalization.UNKNOWN_STATUS',
    );
  });

  it('duplicate business fact tworzy jeden canonical contribution i zachowuje excluded lineage', () => {
    const integrationRuntime = createWave2Runtime({ testMode: true });
    const context = createWave3Context();
    const connection = integrationRuntime.createConnection(context, {
      externalAccountRef: 'woo_account_northstar',
      grantedScopes: ['orders:read', 'products:read', 'refunds:read'],
      idempotencyKey: 'idem_wave3_duplicate_connect',
      providerId: asProviderId('woocommerce'),
      requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
    }).connection;
    const job = integrationRuntime.createSyncJob(context, {
      connectionId: connection.id,
      idempotencyKey: 'idem_wave3_duplicate_sync',
      range: { mode: 'bounded', ...wave3Period },
      streams: ['orders'],
      type: 'INITIAL',
    }).job;
    integrationRuntime.runJob(context, job.id);
    const snapshot = integrationRuntime.getSnapshot();
    const firstOrder = snapshot.records.find(
      (record) => record.externalId === 'woo_order_1001',
    );

    if (!firstOrder) {
      throw new Error('REFERENCE_ORDER_MISSING');
    }

    const duplicateRecord = {
      ...firstOrder,
      contentHash: `${firstOrder.contentHash}:copy`,
      id: asIntegrationSourceRecordId('srcint_9999'),
      providerRevision: 'rev_2',
    };
    const runtime = new LocalDataQualityRuntime();
    const result = runtime.processSourceSnapshot(context, {
      ...snapshot,
      currency: 'PLN',
      period: wave3Period,
      payloadResolver: (record) =>
        record.id === duplicateRecord.id
          ? integrationRuntime.getSourcePayloadForPipeline(context, firstOrder.id)
          : integrationRuntime.getSourcePayloadForPipeline(context, record.id),
      records: [...snapshot.records, duplicateRecord],
      timezone: 'Europe/Warsaw',
    });

    expect(result.canonicalOrders).toHaveLength(2);
    expect(result.lineage.filter((link) => link.contributionType === 'EXCLUDED')).toHaveLength(1);
    expect(result.overlaps[0]?.status).toBe('RESOLVED');
  });

  it('financial integrity poza tolerancją daje INVALID i reconciliation FAIL', () => {
    const { runtime } = createReferenceWave3Pipeline({
      payloadPatch: (payload, record) =>
        record.externalId === 'woo_order_1001'
          ? {
              ...payload,
              lineGrossTotal: 300,
            }
          : payload,
    });
    const snapshot = runtime.getSnapshot();

    expect(snapshot.datasets[0]?.readinessStatus).toBe('INVALID');
    expect(snapshot.qualityAssessments[0]?.financialIntegrity.status).toBe('FAIL');
  });

  it('deletion ledger przechodzi verification i restore respektuje verified scope', () => {
    const { context, datasetId, runtime } = createReferenceWave3Pipeline();
    const entry = runtime.createDeletionLedgerEntry(context, {
      datasetId,
      reason: 'tenant_requested_erasure',
    });
    const verified = runtime.verifyDeletionLedgerEntry(context, entry.deletionId);

    expect(verified.status).toBe('VERIFIED');
    expect(verified.systems.every((system) => system.status === 'VERIFIED')).toBe(true);
    expect(runtime.restoreRespectsDeletionLedger(context)).toBe(true);
  });
});
