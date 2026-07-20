import { describe, expect, it } from 'vitest';

import {
  asProviderId,
  type IntegrationConnection,
  type SyncJob,
} from './integrationContracts';
import {
  createDefaultIntegrationContext,
  createIntegrationApi,
  createWave2Runtime,
} from './localIntegrationRuntime';

function connectFull() {
  const runtime = createWave2Runtime({ testMode: true });
  const context = createDefaultIntegrationContext();
  const { connection, operation, scopeDiff } = runtime.createConnection(context, {
    externalAccountRef: 'woo_account_northstar',
    grantedScopes: ['orders:read', 'products:read', 'refunds:read'],
    idempotencyKey: 'idem_connect_full',
    providerId: asProviderId('woocommerce'),
    requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
  });

  return {
    connection,
    context,
    operation,
    runtime,
    scopeDiff,
  };
}

function createInitialJob(
  runtime: ReturnType<typeof createWave2Runtime>,
  context: ReturnType<typeof createDefaultIntegrationContext>,
  connection: IntegrationConnection,
  idempotencyKey = 'idem_initial_sync',
): SyncJob {
  return runtime.createSyncJob(context, {
    connectionId: connection.id,
    idempotencyKey,
    range: {
      from: '2026-07-01T00:00:00.000Z',
      mode: 'bounded',
      to: '2026-07-19T00:00:00.000Z',
    },
    streams: ['orders', 'products', 'refunds'],
    type: 'INITIAL',
  }).job;
}

describe('Fala 2 local integration runtime', () => {
  it('udostępnia tylko providera z kompletnym adapterem i uprawnieniami', () => {
    const runtime = createWave2Runtime({ testMode: true });
    const context = createDefaultIntegrationContext();

    expect(runtime.listProviders().map((provider) => provider.providerId)).toContain('shopify');
    expect(runtime.listAvailableProviders(context).map((provider) => provider.providerId)).toEqual([
      'woocommerce',
    ]);
  });

  it('wykonuje connect end-to-end bez ujawnienia credential', () => {
    const { connection, operation, runtime, scopeDiff } = connectFull();
    const secretMetadata = runtime.getSecretMetadata(connection.credentialRef);

    expect(connection.status).toBe('ACTIVE');
    expect(operation.operationId).toBeTruthy();
    expect(scopeDiff.missingRequired).toEqual([]);
    expect(secretMetadata).not.toHaveProperty('encryptedMaterial');
    expect(runtime.getSnapshot().auditEvents.map((event) => event.eventType)).toEqual([
      'INTEGRATION_CONNECT_STARTED',
      'INTEGRATION_CONNECT_COMPLETED',
    ]);
  });

  it('wykrywa limited access przy brakujących scopes i nie promuje readiness danych', () => {
    const runtime = createWave2Runtime({ testMode: true });
    const context = createDefaultIntegrationContext();
    const { connection, scopeDiff } = runtime.createConnection(context, {
      externalAccountRef: 'woo_account_northstar',
      grantedScopes: [],
      idempotencyKey: 'idem_connect_limited',
      providerId: asProviderId('woocommerce'),
      requestedScopes: ['orders:read', 'products:read'],
    });

    expect(connection.status).toBe('LIMITED_ACCESS');
    expect(scopeDiff.missingRequired).toEqual(['orders:read', 'products:read']);
  });

  it('wykonuje initial sync, zapisuje source przed checkpointem i publikuje outbox', () => {
    const { connection, context, runtime } = connectFull();
    const job = createInitialJob(runtime, context, connection);
    const result = runtime.runJob(context, job.id);
    const snapshot = runtime.getSnapshot();
    const sourceIndex = runtime
      .getWriteOrder()
      .findIndex((entry) => entry.startsWith('source:'));
    const checkpointIndex = runtime
      .getWriteOrder()
      .findIndex((entry) => entry.startsWith('checkpoint:'));

    expect(result.status).toBe('SUCCESS');
    expect(snapshot.records.length).toBeGreaterThan(0);
    expect(snapshot.checkpoints.length).toBe(3);
    expect(sourceIndex).toBeGreaterThanOrEqual(0);
    expect(checkpointIndex).toBeGreaterThan(sourceIndex);
    expect(runtime.publishOutbox().every((event) => event.status === 'PUBLISHED')).toBe(true);
  });

  it('utrzymuje idempotencję komend i blokuje konflikt fingerprinta', () => {
    const { connection, context, runtime } = connectFull();
    const first = createInitialJob(runtime, context, connection, 'idem_same_sync');
    const second = createInitialJob(runtime, context, connection, 'idem_same_sync');

    expect(second.id).toBe(first.id);
    expect(() =>
      runtime.createSyncJob(context, {
        connectionId: connection.id,
        idempotencyKey: 'idem_same_sync',
        range: {
          from: '2026-06-01T00:00:00.000Z',
          mode: 'bounded',
          to: '2026-07-19T00:00:00.000Z',
        },
        streams: ['orders'],
        type: 'BACKFILL',
      }),
    ).toThrow('IDEMPOTENCY_FINGERPRINT_CONFLICT');
  });

  it('obsługuje rate limit, retry wait, DLQ i kontrolowany replay', () => {
    const { connection, context, runtime } = connectFull();
    const job = createInitialJob(runtime, context, connection, 'idem_rate_limit');
    runtime.setFailureInjection({
      errorClass: 'RATE_LIMIT',
      kind: 'rate_limit',
      retryAfterSeconds: 120,
    });
    const retry = runtime.runJob(context, job.id);

    expect(retry.status).toBe('RETRY_WAIT');
    expect(runtime.getSnapshot().metrics['rate_limit.count']).toBe(1);

    runtime.setFailureInjection({
      errorClass: 'TIMEOUT',
      kind: 'timeout',
    });
    runtime.runJob(context, job.id);
    const dlq = runtime.runJob(context, job.id);

    expect(dlq.status).toBe('DLQ');
    expect(runtime.getSnapshot().dlq).toHaveLength(1);

    runtime.clearFailureInjection();
    const replay = runtime.replayFromDlq(context, {
      idempotencyKey: 'idem_replay_timeout',
      jobId: dlq.id,
      reason: 'runbook_replay',
      ticket: 'INC-2026-001',
    });

    expect(replay.type).toBe('REPLAY');
    expect(replay.tenantId).toBe(job.tenantId);
    expect(replay.workspaceId).toBe(job.workspaceId);
  });

  it('obsługuje reconnect, scope decrease i disconnect z credential deletion', () => {
    const { connection, context, runtime } = connectFull();
    const reauthorized = runtime.reauthorize(context, {
      connectionId: connection.id,
      externalAccountRef: connection.externalAccountRef,
      grantedScopes: ['orders:read'],
      idempotencyKey: 'idem_reauth_scope_decrease',
      requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
    });

    expect(reauthorized.connection.status).toBe('ACTIVE');
    expect(reauthorized.scopeDiff.removed).toEqual(['products:read', 'refunds:read']);

    const disconnected = runtime.disconnect(context, {
      connectionId: connection.id,
      idempotencyKey: 'idem_disconnect',
      reason: 'user_requested',
    });

    expect(disconnected.connection.status).toBe('DISABLED');
    expect(runtime.getSecretMetadata(connection.credentialRef).status).toBe('DELETED');
  });

  it('raportuje częściowy błąd revoke zamiast fałszywego sukcesu', () => {
    const { connection, context, runtime } = connectFull();
    runtime.setFailureInjection({
      errorClass: 'TRANSIENT',
      kind: 'revoke_failure',
    });
    const result = runtime.disconnect(context, {
      connectionId: connection.id,
      idempotencyKey: 'idem_disconnect_failure',
      reason: 'incident_test',
    });

    expect(result.operation.status).toBe('partial');
    expect(result.partialFailure?.code).toBe('PROVIDER_REVOKE_FAILED');
    expect(result.connection.status).toBe('ERROR');
  });

  it('weryfikuje webhook signature, timestamp, replay i tworzy incremental job', () => {
    const { connection, context, runtime } = connectFull();
    const timestamp = '2026-07-19T00:00:00.000Z';
    const signature = runtime.signWebhookForTest(connection.id, 'wh_evt_001', timestamp);
    const request = {
      body: {
        connectionId: connection.id,
        eventId: 'wh_evt_001',
        eventType: 'order.updated',
        occurredAt: timestamp,
        payloadRef: 'payload://webhook/wh_evt_001',
      },
      headers: {
        signature,
        timestamp,
      },
    };

    const accepted = runtime.handleWebhook(context, asProviderId('woocommerce'), request);
    const duplicate = runtime.handleWebhook(context, asProviderId('woocommerce'), request);
    const invalidSignature = runtime.handleWebhook(context, asProviderId('woocommerce'), {
      ...request,
      body: {
        ...request.body,
        eventId: 'wh_evt_002',
      },
      headers: {
        signature: 'invalid',
        timestamp,
      },
    });

    expect(accepted.status).toBe('accepted');
    expect(accepted.job?.type).toBe('INCREMENTAL');
    expect(duplicate.status).toBe('duplicate');
    expect(invalidSignature.status).toBe('invalid_signature');
  });

  it('udostępnia typed API facade ze stabilnymi endpointami', () => {
    const runtime = createWave2Runtime({ testMode: true });
    const api = createIntegrationApi(runtime);

    expect(api.routes.providerCollection).toBe('/v1/integration-providers');
    expect(api.listProviders().map((provider) => provider.providerId)).toContain('woocommerce');
  });
});
