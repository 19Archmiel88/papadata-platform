import { describe, expect, it } from 'vitest';

import {
  asCapability,
  asTenantId,
  asUserId,
  asWorkspaceId,
} from '../../domain-contracts';
import { createApplicationSessionContext } from '../../shell';
import { asProviderId } from './integrationContracts';
import {
  createDefaultIntegrationContext,
  createWave2Runtime,
} from './localIntegrationRuntime';

function createForeignContext() {
  const context = createApplicationSessionContext({
    tenantId: asTenantId('ten_baltic'),
    userId: asUserId('usr_multi_org'),
    workspaceId: asWorkspaceId('wrk_baltic_marketplace'),
  });

  return {
    ...context,
    capabilities: [
      ...context.capabilities,
      asCapability('integration:backfill'),
      asCapability('integration:connect'),
      asCapability('integration:disconnect'),
      asCapability('integration:read'),
      asCapability('integration:replay'),
      asCapability('integration:sync'),
    ],
    entitlements: [
      ...context.entitlements,
      {
        capability: asCapability('integrations:commerce'),
        enabled: true,
        limitations: [],
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      },
    ],
  };
}

function connectMain() {
  const runtime = createWave2Runtime({ testMode: true });
  const context = createDefaultIntegrationContext();
  const { connection } = runtime.createConnection(context, {
    externalAccountRef: 'woo_account_northstar',
    grantedScopes: ['orders:read', 'products:read', 'refunds:read'],
    idempotencyKey: 'idem_security_connect',
    providerId: asProviderId('woocommerce'),
    requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
  });

  return {
    connection,
    context,
    runtime,
  };
}

describe('Fala 2 integration tenant/workspace isolation', () => {
  it('nie ujawnia obcego connection przy odczycie lub mutacji', () => {
    const { connection, runtime } = connectMain();
    const foreignContext = createForeignContext();

    expect(() =>
      runtime.createSyncJob(foreignContext, {
        connectionId: connection.id,
        idempotencyKey: 'idem_foreign_sync',
        range: {
          from: '2026-07-01T00:00:00.000Z',
          mode: 'bounded',
          to: '2026-07-19T00:00:00.000Z',
        },
        streams: ['orders'],
        type: 'INITIAL',
      }),
    ).toThrow('NOT_FOUND');
  });

  it('odrzuca webhook wskazujący obce connection', () => {
    const { connection, runtime } = connectMain();
    const foreignContext = createForeignContext();
    const timestamp = '2026-07-19T00:00:00.000Z';

    expect(() =>
      runtime.handleWebhook(foreignContext, asProviderId('woocommerce'), {
        body: {
          connectionId: connection.id,
          eventId: 'wh_evt_foreign',
          eventType: 'order.updated',
          occurredAt: timestamp,
          payloadRef: 'payload://foreign',
        },
        headers: {
          signature: runtime.signWebhookForTest(connection.id, 'wh_evt_foreign', timestamp),
          timestamp,
        },
      }),
    ).toThrow('NOT_FOUND');
  });

  it('nie pozwala replay z obcym tenantem ani workspace', () => {
    const { connection, context, runtime } = connectMain();
    const foreignContext = createForeignContext();
    const { job } = runtime.createSyncJob(context, {
      connectionId: connection.id,
      idempotencyKey: 'idem_security_timeout',
      range: {
        from: '2026-07-01T00:00:00.000Z',
        mode: 'bounded',
        to: '2026-07-19T00:00:00.000Z',
      },
      streams: ['orders'],
      type: 'INITIAL',
    });
    runtime.setFailureInjection({ errorClass: 'TIMEOUT', kind: 'timeout' });
    runtime.runJob(context, job.id);
    runtime.runJob(context, job.id);
    runtime.runJob(context, job.id);

    expect(runtime.getSnapshot().dlq).toHaveLength(1);
    expect(() =>
      runtime.replayFromDlq(foreignContext, {
        idempotencyKey: 'idem_foreign_replay',
        jobId: job.id,
        reason: 'bad_scope',
        ticket: 'INC-FOREIGN',
      }),
    ).toThrow('NOT_FOUND');
  });

  it('ten sam external ID w dwóch workspace nie koliduje w source records', () => {
    const runtime = createWave2Runtime({ testMode: true });
    const mainContext = createDefaultIntegrationContext();
    const foreignContext = createForeignContext();
    const mainConnection = runtime.createConnection(mainContext, {
      externalAccountRef: 'woo_account_northstar',
      grantedScopes: ['orders:read', 'products:read', 'refunds:read'],
      idempotencyKey: 'idem_main_external',
      providerId: asProviderId('woocommerce'),
      requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
    }).connection;
    const foreignConnection = runtime.createConnection(foreignContext, {
      externalAccountRef: 'woo_account_baltic',
      grantedScopes: ['orders:read', 'products:read', 'refunds:read'],
      idempotencyKey: 'idem_foreign_external',
      providerId: asProviderId('woocommerce'),
      requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
    }).connection;
    const mainJob = runtime.createSyncJob(mainContext, {
      connectionId: mainConnection.id,
      idempotencyKey: 'idem_main_external_sync',
      range: {
        from: '2026-07-01T00:00:00.000Z',
        mode: 'bounded',
        to: '2026-07-19T00:00:00.000Z',
      },
      streams: ['orders'],
      type: 'INITIAL',
    }).job;
    const foreignJob = runtime.createSyncJob(foreignContext, {
      connectionId: foreignConnection.id,
      idempotencyKey: 'idem_foreign_external_sync',
      range: {
        from: '2026-07-01T00:00:00.000Z',
        mode: 'bounded',
        to: '2026-07-19T00:00:00.000Z',
      },
      streams: ['orders'],
      type: 'INITIAL',
    }).job;

    runtime.runJob(mainContext, mainJob.id);
    runtime.runJob(foreignContext, foreignJob.id);

    const records = runtime.getSnapshot().records.filter(
      (record) => record.externalId === 'woo_order_1001',
    );
    expect(records).toHaveLength(2);
    expect(new Set(records.map((record) => record.workspaceId)).size).toBe(2);
  });
});
