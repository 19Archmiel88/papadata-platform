import assert from 'node:assert/strict';
import test from 'node:test';

import {
  exportArtifactTableCsv,
  getPrimaryArtifact,
  papaAiTransparencyCopy,
  papaAssistantFixture,
  papaDataStatuses,
  papaDecisionQueueStatuses,
  papaExportStatuses,
  papaRefusalReasons,
  papaReportJobStatuses,
  validatePapaAssistantFixture,
} from './index';

test('Papa Assistant fixture exposes complete model state', () => {
  assert.deepEqual(validatePapaAssistantFixture(papaAssistantFixture), []);
  assert.equal(papaAssistantFixture.context.tenant, 'tenant-papadata-demo');
  assert.equal(papaAssistantFixture.context.workspace, 'Commerce PL');
  assert.ok(papaAssistantFixture.context.capabilities.includes('papa.action.approve.high_risk'));
});

test('Papa Assistant state lists are complete and explicit', () => {
  assert.deepEqual(
    papaAssistantFixture.decisions.map((item) => item.status),
    [...papaDecisionQueueStatuses],
  );
  assert.deepEqual(
    papaAssistantFixture.reports.map((item) => item.status),
    [...papaReportJobStatuses],
  );
  assert.deepEqual(
    papaAssistantFixture.exports.map((item) => item.status),
    [...papaExportStatuses],
  );
  assert.deepEqual(
    papaAssistantFixture.refusals.map((item) => item.reason),
    [...papaRefusalReasons],
  );
  assert.ok(papaDataStatuses.includes('restricted'));
  assert.ok(!papaDataStatuses.includes(['b', 'locked'].join('') as never));
});

test('Papa Assistant requires approval, revalidation and audit before execution', () => {
  assert.ok(papaAssistantFixture.recommendations.every((item) => item.requiresApproval));
  assert.ok(papaAssistantFixture.decisions.every((item) => item.revalidation.length > 0));
  assert.ok(papaAssistantFixture.decisions.every((item) => item.audit.length > 0));
  assert.ok(papaAssistantFixture.operations.some((item) => item.status === 'recovery'));
});

test('ArtifactTable CSV export respects visible columns', () => {
  const csv = exportArtifactTableCsv(getPrimaryArtifact(), [
    'metric',
    'withAction',
  ]);

  assert.match(csv, /"Metryka","Po wdrożeniu"/u);
  assert.match(csv, /"ROAS blended","3,2"/u);
  assert.doesNotMatch(csv, /Bez działania/u);
});

test('AI transparency copy is present for assistant, recommendations, reports and refusals', () => {
  assert.match(papaAiTransparencyCopy.assistant, /Odpowiada Papa Asystent AI/u);
  assert.match(papaAiTransparencyCopy.recommendation, /Rekomendacja wygenerowana przez AI/u);
  assert.match(papaAiTransparencyCopy.report, /Raport wygenerowany przez Papa Asystenta AI/u);
  assert.match(papaAiTransparencyCopy.refusal, /nie może przygotować odpowiedzi/u);
});
