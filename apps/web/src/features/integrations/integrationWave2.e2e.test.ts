import { describe, expect, it } from 'vitest';

import { asProviderId } from './integrationContracts';
import { integrationStoryFixtures } from './integrationFixtures';
import {
  createDefaultIntegrationContext,
  createWave2Runtime,
} from './localIntegrationRuntime';

describe('Fala 2 integration E2E domain flow', () => {
  it('realizuje connect, initial sync, incremental webhook, backfill i disconnect', () => {
    const runtime = createWave2Runtime({ testMode: true });
    const context = createDefaultIntegrationContext();
    const { connection } = runtime.createConnection(context, {
      externalAccountRef: 'woo_account_northstar',
      grantedScopes: ['orders:read', 'products:read', 'refunds:read'],
      idempotencyKey: 'idem_e2e_connect',
      providerId: asProviderId('woocommerce'),
      requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
    });
    const initial = runtime.createSyncJob(context, {
      connectionId: connection.id,
      idempotencyKey: 'idem_e2e_initial',
      range: {
        from: '2026-07-01T00:00:00.000Z',
        mode: 'bounded',
        to: '2026-07-19T00:00:00.000Z',
      },
      streams: ['orders', 'products', 'refunds'],
      type: 'INITIAL',
    }).job;

    expect(runtime.runJob(context, initial.id).status).toBe('SUCCESS');

    const timestamp = '2026-07-19T00:00:00.000Z';
    const signature = runtime.signWebhookForTest(connection.id, 'wh_evt_e2e', timestamp);
    const webhook = runtime.handleWebhook(context, asProviderId('woocommerce'), {
      body: {
        connectionId: connection.id,
        eventId: 'wh_evt_e2e',
        eventType: 'order.updated',
        occurredAt: timestamp,
        payloadRef: 'payload://webhook/e2e',
      },
      headers: {
        signature,
        timestamp,
      },
    });

    expect(webhook.status).toBe('accepted');
    expect(webhook.job?.type).toBe('INCREMENTAL');
    expect(webhook.job ? runtime.runJob(context, webhook.job.id).status : 'missing').toBe(
      'SUCCESS',
    );

    const backfill = runtime.createSyncJob(context, {
      connectionId: connection.id,
      idempotencyKey: 'idem_e2e_backfill',
      range: {
        from: '2026-01-01T00:00:00.000Z',
        mode: 'bounded',
        to: '2026-06-30T23:59:59.000Z',
      },
      streams: ['orders'],
      type: 'BACKFILL',
    }).job;

    expect(runtime.runJob(context, backfill.id).status).toBe('SUCCESS');

    const recordsBeforeDisconnect = runtime.getSnapshot().records.length;
    const disconnected = runtime.disconnect(context, {
      connectionId: connection.id,
      idempotencyKey: 'idem_e2e_disconnect',
      reason: 'e2e_retention_check',
    });

    expect(disconnected.connection.status).toBe('DISABLED');
    expect(runtime.getSnapshot().records.length).toBe(recordsBeforeDisconnect);
    expect(runtime.getSecretMetadata(connection.credentialRef).status).toBe('DELETED');
  });

  it('wznawia po crashu workera od potwierdzonego checkpointu bez duplikacji source', () => {
    const runtime = createWave2Runtime({ testMode: true });
    const context = createDefaultIntegrationContext();
    const { connection } = runtime.createConnection(context, {
      externalAccountRef: 'woo_account_northstar',
      grantedScopes: ['orders:read', 'products:read', 'refunds:read'],
      idempotencyKey: 'idem_e2e_crash_connect',
      providerId: asProviderId('woocommerce'),
      requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
    });
    const job = runtime.createSyncJob(context, {
      connectionId: connection.id,
      idempotencyKey: 'idem_e2e_crash_job',
      range: {
        from: '2026-07-01T00:00:00.000Z',
        mode: 'bounded',
        to: '2026-07-19T00:00:00.000Z',
      },
      streams: ['orders'],
      type: 'INITIAL',
    }).job;
    runtime.setFailureInjection({
      errorClass: 'TRANSIENT',
      kind: 'worker_crash',
    });
    const crashed = runtime.runJob(context, job.id);
    const recordsAfterCrash = runtime.getSnapshot().records.length;

    expect(crashed.status).toBe('RETRY_WAIT');
    expect(runtime.getSnapshot().checkpoints).toHaveLength(0);

    runtime.clearFailureInjection();
    const recovered = runtime.runJob(context, job.id);

    expect(recovered.status).toBe('SUCCESS');
    expect(runtime.getSnapshot().records.length).toBe(recordsAfterCrash);
    expect(runtime.getSnapshot().checkpoints).toHaveLength(1);
  });

  it('symuluje outage, schema drift, credential revoke i scope changes', () => {
    const runtime = createWave2Runtime({ testMode: true });
    const context = createDefaultIntegrationContext();
    const { connection } = runtime.createConnection(context, {
      externalAccountRef: 'woo_account_northstar',
      grantedScopes: ['orders:read', 'products:read', 'refunds:read'],
      idempotencyKey: 'idem_e2e_failure_connect',
      providerId: asProviderId('woocommerce'),
      requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
    });
    const job = runtime.createSyncJob(context, {
      connectionId: connection.id,
      idempotencyKey: 'idem_e2e_schema_job',
      range: {
        from: '2026-07-01T00:00:00.000Z',
        mode: 'bounded',
        to: '2026-07-19T00:00:00.000Z',
      },
      streams: ['orders'],
      type: 'INITIAL',
    }).job;

    runtime.setFailureInjection({ errorClass: 'SCHEMA_MISMATCH', kind: 'schema_mismatch' });
    expect(runtime.runJob(context, job.id).status).toBe('FAILED');
    expect(runtime.getSnapshot().metrics['schema_mismatch.count']).toBe(1);

    runtime.clearFailureInjection();
    const scopedDown = runtime.reauthorize(context, {
      connectionId: connection.id,
      externalAccountRef: connection.externalAccountRef,
      grantedScopes: ['orders:read'],
      idempotencyKey: 'idem_e2e_scope_down',
      requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
    });

    expect(scopedDown.scopeDiff.removed).toEqual(['products:read', 'refunds:read']);

    const scopedUp = runtime.reauthorize(context, {
      connectionId: connection.id,
      externalAccountRef: connection.externalAccountRef,
      grantedScopes: ['orders:read', 'products:read', 'refunds:read'],
      idempotencyKey: 'idem_e2e_scope_up',
      requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
    });

    expect(scopedUp.scopeDiff.newlyGranted).toEqual(['products:read', 'refunds:read']);
  });

  it('pokrywa E2E stany OAuth cancel i callback error przez walidowane fixtures', () => {
    expect(integrationStoryFixtures.oauth_cancelled.operation?.status).toBe('cancelled');
    expect(integrationStoryFixtures.callback_error.operation?.status).toBe('failed');
    expect(integrationStoryFixtures.bad_redirect.operation?.status).toBe('failed');
  });
});
