import { describe, expect, it } from 'vitest';

import {
  asCheckpointId,
  asConnectionId,
  asProviderId,
  asSourceBatchId,
  assertCheckpointCanAdvance,
  calculateScopeDiff,
  canTransitionConnection,
  canTransitionJob,
  createCommandFingerprint,
  retryDecisionForError,
  syncCheckpointSchema,
} from './integrationContracts';
import {
  asTenantId,
  asWorkspaceId,
  domainContractVersion,
} from '../../domain-contracts';

describe('Fala 2 integration contracts', () => {
  it('waliduje przejścia statusów connection i jobów', () => {
    expect(canTransitionConnection('NOT_CONNECTED', 'CONNECTING')).toBe(true);
    expect(canTransitionConnection('ACTIVE', 'NOT_CONNECTED')).toBe(false);
    expect(canTransitionJob('QUEUED', 'RUNNING')).toBe(true);
    expect(canTransitionJob('SUCCESS', 'RUNNING')).toBe(false);
  });

  it('liczy scope diff dla granted, missing i removed scopes', () => {
    const diff = calculateScopeDiff({
      granted: ['orders:read'],
      optional: ['products:read'],
      previousGranted: ['orders:read', 'refunds:read'],
      requested: ['orders:read', 'products:read'],
      required: ['orders:read'],
    });

    expect(diff.missingRequired).toEqual([]);
    expect(diff.missingOptional).toEqual(['products:read']);
    expect(diff.removed).toEqual(['refunds:read']);
  });

  it('utrwala retry matrix dla głównych klas błędów', () => {
    expect(retryDecisionForError('AUTH', 1, 3).connectionStatus).toBe('REAUTH_REQUIRED');
    expect(retryDecisionForError('RATE_LIMIT', 1, 3, 120)).toMatchObject({
      jobStatus: 'RETRY_WAIT',
      retryAfterSeconds: 120,
    });
    expect(retryDecisionForError('TIMEOUT', 3, 3)).toMatchObject({
      jobStatus: 'DLQ',
      sendToDlq: true,
    });
    expect(retryDecisionForError('SCHEMA_MISMATCH', 1, 3).retryable).toBe(false);
  });

  it('blokuje cofnięcie checkpointu i konflikt wersji', () => {
    const previous = syncCheckpointSchema.parse({
      connectionId: asConnectionId('conn_woo_001'),
      contractVersion: domainContractVersion,
      cursor: 'page_1',
      id: asCheckpointId('chk_conn_woo_001_orders'),
      lastBatchId: asSourceBatchId('batch_001'),
      lastEventId: 'evt_001',
      recordVersion: 2,
      stream: 'orders',
      tenantId: asTenantId('ten_northstar'),
      timestamp: '2026-07-19T00:00:00.000Z',
      watermark: '2026-07-19T00:00:00.000Z',
      workspaceId: asWorkspaceId('wrk_northstar_main'),
    });
    const next = syncCheckpointSchema.parse({
      ...previous,
      lastBatchId: asSourceBatchId('batch_002'),
      recordVersion: 3,
      timestamp: '2026-07-19T00:01:00.000Z',
      watermark: '2026-07-19T00:01:00.000Z',
    });

    expect(() => assertCheckpointCanAdvance(previous, next)).not.toThrow();
    expect(() =>
      assertCheckpointCanAdvance(previous, {
        ...next,
        recordVersion: 2,
      }),
    ).toThrow('CHECKPOINT_VERSION_CONFLICT');
    expect(() =>
      assertCheckpointCanAdvance(previous, {
        ...next,
        watermark: '2026-07-18T00:00:00.000Z',
      }),
    ).toThrow('CHECKPOINT_CANNOT_MOVE_BACKWARD');
  });

  it('tworzy stabilny fingerprint komendy niezależny od kolejności pól', () => {
    const left = createCommandFingerprint({
      providerId: asProviderId('woocommerce'),
      streams: ['orders'],
      type: 'INITIAL',
    });
    const right = createCommandFingerprint({
      streams: ['orders'],
      type: 'INITIAL',
      providerId: asProviderId('woocommerce'),
    });

    expect(left).toBe(right);
  });
});
