import { describe, expect, it } from 'vitest';

import { createReferenceWave3Pipeline } from './dataQualityTestUtils';
import { createDataQualityApi, createFuzzyMatchingPolicy } from './localDataQualityRuntime';

describe('Fala 3 local data quality runtime', () => {
  it('prowadzi source records Fali 2 do CanonicalOrder, lineage, quality i READY datasetu', () => {
    const { context, datasetId, integrationRuntime, runtime } =
      createReferenceWave3Pipeline();
    const snapshot = runtime.getSnapshot();
    const integrationSnapshot = integrationRuntime.getSnapshot();

    expect(integrationSnapshot.batches[0]?.counts).toMatchObject({
      accepted: 2,
      duplicated: 0,
      failed: 0,
      fetched: 2,
      quarantined: 0,
    });
    expect(integrationSnapshot.records.every((record) => record.classification)).toBe(true);
    expect(snapshot.normalizedRecords).toHaveLength(2);
    expect(snapshot.canonicalOrders).toHaveLength(2);
    expect(snapshot.lineage.filter((link) => link.contributionType === 'PRIMARY')).toHaveLength(2);
    expect(snapshot.datasets[0]?.readinessStatus).toBe('READY');
    expect(snapshot.qualityAssessments[0]?.result).toBe('PASS');
    expect(snapshot.readinessAssessments[0]?.allowedMetricCodes).toEqual([
      'order_count',
      'gross_revenue',
    ]);
    expect(snapshot.readinessAssessments[0]?.blockedMetricCodes).toContain(
      'revenue_after_fees',
    );
    expect(runtime.getReadiness(context, datasetId).data.status).toBe('READY');
  });

  it('utrzymuje jeden wkład kanoniczny przy retry i reprocessingu tej samej wersji', () => {
    const { context, datasetId, runtime } = createReferenceWave3Pipeline();
    const before = runtime.getSnapshot().canonicalOrders.length;
    const requested = runtime.requestReprocess(context, {
      datasetId,
      idempotencyKey: 'idem_wave3_reprocess_same_version',
      reason: 'quality_rule_revalidation',
    });
    const duplicate = runtime.requestReprocess(context, {
      datasetId,
      idempotencyKey: 'idem_wave3_reprocess_same_version',
      reason: 'quality_rule_revalidation',
    });
    const completed = runtime.runReprocess(context, requested.job.id);
    const after = runtime.getSnapshot().canonicalOrders.length;

    expect(duplicate.job.id).toBe(requested.job.id);
    expect(completed.status).toBe('SUCCESS');
    expect(after).toBe(before);
    expect(runtime.getImpactReports(context, datasetId).data[0]).toMatchObject({
      canonicalRecordDifference: { after: before, before, delta: 0 },
      readinessAfter: 'READY',
      readinessBefore: 'READY',
    });
  });

  it('zwraca reconciliation z exclusions, reason codes i evidence hash', () => {
    const { context, datasetId, runtime } = createReferenceWave3Pipeline();
    const reconciliation = runtime.getReconciliation(context, datasetId).data[0];

    expect(reconciliation).toMatchObject({
      canonicalFactCount: 2,
      reasonCodes: ['WITHIN_TOLERANCE'],
      status: 'PASS',
      tolerance: '0.01',
    });
    expect(reconciliation?.evidenceHash).toMatch(/^fnv1a:/);
  });

  it('obsługuje manual review ze stale version i nie podnosi readiness po samym zamknięciu issue', () => {
    const { context, datasetId, runtime } = createReferenceWave3Pipeline({
      payloadPatch: (payload, record) =>
        record.externalId === 'woo_order_1001'
          ? {
              ...payload,
              status: 'provider_new_status',
            }
          : payload,
    });
    const issueToAssign = runtime
      .listDataIssues(context)
      .data.find((candidate) => candidate.datasetId === datasetId);

    if (!issueToAssign) {
      throw new Error('EXPECTED_DATA_ISSUE_MISSING');
    }

    const issue = runtime.assignIssue(context, {
      issueId: issueToAssign.id,
      ownerId: 'data_steward',
    });

    expect(() =>
      runtime.reviewIssue(context, {
        after: { status: 'confirmed' },
        before: { status: 'unknown' },
        expectedVersion: 0,
        issueId: issue.id,
        rationale: 'stale manual review',
      }),
    ).toThrow('VERSION_CONFLICT');

    const decision = runtime.reviewIssue(context, {
      after: { status: 'confirmed' },
      before: { status: 'unknown' },
      expectedVersion: 1,
      issueId: issue.id,
      rationale: 'Potwierdzono mapping na podstawie source evidence.',
    });
    const resolved = runtime.resolveIssue(context, {
      evidenceRefs: decision.evidenceRefs,
      expectedVersion: 2,
      issueId: issue.id,
      rationale: 'Mapping potwierdzony, wymagany reprocess.',
      resolutionType: 'REPROCESS_REQUIRED',
    });

    expect(resolved.status).toBe('REPROCESSING');
    expect(runtime.getReadiness(context, datasetId).data.status).toBe('PARTIAL');
  });

  it('udostępnia typed API facade i dokumentuje wyłączone fuzzy matching', () => {
    const { context, datasetId, runtime } = createReferenceWave3Pipeline();
    const api = createDataQualityApi(runtime);

    expect(api.routes.datasetCollection).toBe('/v1/datasets');
    expect(api.listDatasets(context).data[0]?.id).toBe(datasetId);
    expect(api.getLineage(context, datasetId).data.length).toBeGreaterThan(0);
    expect(createFuzzyMatchingPolicy()).toMatchObject({
      enabled: false,
      version: 'fuzzy.disabled.2026-07',
    });
  });
});
