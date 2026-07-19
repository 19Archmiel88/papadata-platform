import { describe, expect, it } from 'vitest';

import { canonicalStoryFixtures } from '../../shared/test';
import { buildReferenceSlice, validateReferenceSlice } from './referenceSlice';

describe('reference slice Fali 1', () => {
  it('buduje pełny przepływ od SessionContext do decyzji człowieka', () => {
    const slice = buildReferenceSlice(canonicalStoryFixtures.ctx_owner_ready.context);

    expect(slice.provider.providerId).toBe('woocommerce');
    expect(slice.flow.map((stage) => stage.stageId)).toEqual([
      'login',
      'session-context',
      'workspace',
      'integration',
      'sync',
      'canonical',
      'kpi',
      'decision',
    ]);
    expect(slice.auditTrail.map((event) => event.eventType)).toContain(
      'decision.human_approved',
    );
  });

  it('zachowuje lineage, readiness i evidence w MetricSnapshot', () => {
    const slice = buildReferenceSlice(canonicalStoryFixtures.ctx_owner_ready.context);

    expect(validateReferenceSlice(slice)).toEqual([]);
    expect(slice.metricSnapshot.readiness.scope.dataLayer).toBe('ready_kpi');
    expect(slice.metricSnapshot.evidence).toHaveLength(1);
    expect(slice.metricSnapshot.lineage[0]?.sourceRecordId).toBe(
      slice.sourceRecord.sourceRecordId,
    );
    expect(slice.metricSnapshot.value).not.toBeNull();
  });
});
