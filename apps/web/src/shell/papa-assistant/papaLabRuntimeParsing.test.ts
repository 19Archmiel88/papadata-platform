import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildModeRecordsFromGovernance,
  normalizeLabActionStatus,
  normalizeLabDecisionStatus,
  normalizeRiskLevelToImpact,
  readPapaGovernancePolicy,
  readPapaGovernanceSummary,
  readPapaLabActions,
  readPapaLabDecisions,
  readPapaLabExperiments,
} from './papaLabRuntimeParsing';

test('readPapaLabExperiments leaves baseline/variant/confidence null when the source JSON has no parseable number, never fabricating 0', () => {
  const [experiment] = readPapaLabExperiments({
    experiments: [{
      id: 'exp-1',
      status: 'draft',
      title: 'Test',
    }],
  });

  assert.equal(experiment?.baseline, null);
  assert.equal(experiment?.variant, null);
  assert.equal(experiment?.confidence, null);
});

test('readPapaLabExperiments parses a real measured baseline/variant', () => {
  const [experiment] = readPapaLabExperiments({
    experiments: [{
      baseline: 3.1,
      id: 'exp-1',
      measuredOutcome: { value: 3.6 },
      status: 'completed',
      title: 'Test',
    }],
  });

  assert.equal(experiment?.baseline, 3.1);
  assert.equal(experiment?.variant, 3.6);
});

test('readPapaLabActions reports risk as unknown, never a guessed level, because assistant_action_proposals has no risk column', () => {
  const [action] = readPapaLabActions({
    actions: [{ id: 'act-1', operationId: 'papa.ai.action.execute', status: 'proposed' }],
  });

  assert.equal(action?.risk, 'unknown');
});

test('normalizeLabActionStatus buckets every real backend status into one of the 4 UI states', () => {
  assert.equal(normalizeLabActionStatus('proposed'), 'draft');
  assert.equal(normalizeLabActionStatus('validated'), 'ready');
  assert.equal(normalizeLabActionStatus('approval_required'), 'approval');
  assert.equal(normalizeLabActionStatus('approved'), 'ready');
  assert.equal(normalizeLabActionStatus('rejected'), 'blocked');
  assert.equal(normalizeLabActionStatus('blocked'), 'blocked');
  assert.equal(normalizeLabActionStatus('executed'), 'ready');
  assert.equal(normalizeLabActionStatus('rolled_back'), 'blocked');
});

test('normalizeLabDecisionStatus passes through all 8 real assistant_decisions statuses and falls back for unknown input', () => {
  for (const status of [
    'review', 'approved', 'rejected', 'scheduled', 'executing', 'monitoring', 'resolved', 'dismissed',
  ]) {
    assert.equal(normalizeLabDecisionStatus(status), status);
  }
  assert.equal(normalizeLabDecisionStatus('nonsense'), 'review');
  assert.equal(normalizeLabDecisionStatus(undefined), 'review');
});

test('normalizeRiskLevelToImpact maps critical/high to high, medium to medium, and unrecognised/absent to the same low default the rest of the file already uses', () => {
  assert.equal(normalizeRiskLevelToImpact('critical'), 'high');
  assert.equal(normalizeRiskLevelToImpact('high'), 'high');
  assert.equal(normalizeRiskLevelToImpact('medium'), 'medium');
  assert.equal(normalizeRiskLevelToImpact('low'), 'low');
  assert.equal(normalizeRiskLevelToImpact('unknown'), 'low');
  assert.equal(normalizeRiskLevelToImpact(null), 'low');
});

test('readPapaLabDecisions derives impact from the linked recommendation risk level, not a fabricated constant', () => {
  const [decision] = readPapaLabDecisions({
    decisions: [{
      decision: 'Zwiększ budżet kampanii',
      id: 'dec-1',
      recommendationId: 'rec-1',
      status: 'review',
    }],
    recommendations: [{ id: 'rec-1', riskLevel: 'critical' }],
  });

  assert.equal(decision?.impact, 'high');
  assert.equal(decision?.dueAt, null);
});

test('readPapaGovernancePolicy and readPapaGovernanceSummary return null for a missing/malformed payload rather than a fabricated default policy', () => {
  assert.equal(readPapaGovernancePolicy({}), null);
  assert.equal(readPapaGovernanceSummary({}), null);
});

test('readPapaGovernancePolicy parses a real governance payload', () => {
  const policy = readPapaGovernancePolicy({
    governance: {
      aiMode: 'read_only_mvp',
      approvalRequiredForExternalEffects: true,
      externalEffects: { execute: 'blocked', rollback: 'blocked' },
      idempotencyRequiredForCommands: true,
      tenantWorkspaceScopeRequired: true,
    },
  });

  assert.equal(policy?.aiMode, 'read_only_mvp');
  assert.equal(policy?.approvalRequiredForExternalEffects, true);
});

test('buildModeRecordsFromGovernance returns an empty list (not a fabricated fallback record) when governance is unavailable', () => {
  assert.deepEqual(buildModeRecordsFromGovernance(null), []);
});

test('buildModeRecordsFromGovernance derives its single record from real governance flags', () => {
  const [record] = buildModeRecordsFromGovernance({
    aiMode: 'read_only_mvp',
    approvalRequiredForExternalEffects: true,
    externalEffects: { execute: 'blocked', rollback: 'blocked' },
    idempotencyRequiredForCommands: true,
    tenantWorkspaceScopeRequired: true,
  });

  assert.equal(record?.mode, 'read_only_mvp');
  assert.equal(record?.requiresApproval, 'Tak — każda akcja zewnętrzna');
});
