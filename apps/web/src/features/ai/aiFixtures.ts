import { z } from 'zod';

import {
  applicationSessionContextSchema,
} from '../../domain-contracts';
import {
  actionProposalSchema,
  actionSchema,
  aiGovernanceSchema,
  aiHistorySchema,
  aiRuntimeStateSchema,
  aiSettingsSchema,
  aiStructuredOutputSchema,
  asAIUseCaseId,
  decisionSchema,
  gateS3ReportSchema,
  insightSchema,
  laboratoryExperimentSchema,
  modelRunSchema,
  observationSchema,
  outcomeSchema,
  recommendationSchema,
  type AIRuntimeState,
} from './aiContracts';
import {
  createReferenceWave5AI,
} from './aiTestUtils';

const fixtureIds = [
  'default',
  'assistant_disabled',
  'assistant_gated',
  'assistant_permission_denied',
  'assistant_entitlement_required',
  'assistant_building_context',
  'assistant_streaming',
  'assistant_ready_answer',
  'assistant_partial_answer',
  'assistant_stale_warning',
  'assistant_no_data_refusal',
  'assistant_invalid_refusal',
  'assistant_blocked_refusal',
  'assistant_out_of_scope_refusal',
  'assistant_injection_blocked',
  'assistant_evidence_unavailable',
  'assistant_provider_timeout',
  'assistant_provider_error',
  'assistant_cost_limit',
  'assistant_cancelled',
  'assistant_workspace_changed',
  'assistant_session_expired',
  'laboratory_new_experiment',
  'laboratory_use_case_selection',
  'laboratory_dataset_selection',
  'laboratory_running',
  'laboratory_answered',
  'laboratory_compare_runs',
  'laboratory_model_changed',
  'laboratory_data_version_changed',
  'laboratory_partial_context',
  'laboratory_restricted_source',
  'laboratory_export',
  'laboratory_archived',
  'laboratory_retention_expired',
  'laboratory_deletion_pending',
  'recommendation_proposed',
  'recommendation_needs_review',
  'recommendation_accepted',
  'recommendation_rejected',
  'recommendation_deferred',
  'recommendation_need_more_data',
  'recommendation_modified',
  'recommendation_expired',
  'recommendation_invalidated',
  'recommendation_no_owner',
  'recommendation_stale_version',
  'recommendation_second_approval_required',
  'action_proposal',
  'action_scope_preview',
  'action_impact_preview',
  'action_reauthentication',
  'action_approved',
  'action_rejected',
  'action_executing',
  'action_success',
  'action_failed',
  'action_cancelled',
  'action_compensated',
  'action_target_changed',
  'action_permission_revoked',
  'action_gated',
  'action_prohibited',
  'provenance_complete_evidence',
  'provenance_partial_evidence',
  'provenance_historical_snapshot',
  'provenance_restricted_evidence',
  'provenance_missing_evidence',
  'provenance_model_changed',
  'provenance_retention_warning',
  'settings',
  'history',
  'governance',
] as const;

export const aiFixtureIdSchema = z.enum(fixtureIds);
export type AIFixtureId = z.infer<typeof aiFixtureIdSchema>;

const aiStorySectionSchema = z.enum([
  'assistant',
  'laboratory',
  'recommendation',
  'action',
  'provenance',
  'settings',
  'history',
  'governance',
]);

export const aiStoryFixtureSchema = z.object({
  action: actionSchema.nullable(),
  assistant: z.object({
    messages: z.array(z.string().min(1)),
    nextAction: z.string().min(1),
    refusalCode: z.string().min(1).nullable(),
    status: aiRuntimeStateSchema,
    summary: z.string().min(1),
  }),
  context: applicationSessionContextSchema,
  decision: decisionSchema.nullable(),
  experiment: laboratoryExperimentSchema.nullable(),
  fixtureId: aiFixtureIdSchema,
  gateS3: gateS3ReportSchema,
  governance: aiGovernanceSchema,
  history: aiHistorySchema,
  insight: insightSchema.nullable(),
  notes: z.array(z.string().min(1)),
  observation: observationSchema.nullable(),
  outcome: outcomeSchema.nullable(),
  output: aiStructuredOutputSchema,
  proposal: actionProposalSchema.nullable(),
  recommendation: recommendationSchema.nullable(),
  run: modelRunSchema,
  section: aiStorySectionSchema,
  settings: aiSettingsSchema,
  title: z.string().min(1),
});

export type AIStoryFixture = z.infer<typeof aiStoryFixtureSchema>;

function clone<T>(value: T): T {
  return structuredClone(value);
}

function createBaseFixture(): AIStoryFixture {
  const reference = createReferenceWave5AI();
  const observations = reference.runtime.generateObservations(reference.context);
  const observation = observations[0];

  if (!observation) {
    throw new Error('AI_FIXTURE_WITHOUT_OBSERVATION');
  }

  const insight = reference.runtime.generateInsight(
    reference.context,
    observation.id,
    reference.result.run.id,
  );
  const recommendation = reference.runtime.draftRecommendation(
    reference.context,
    insight.id,
    reference.result.run.id,
  );
  const decision = reference.runtime.recordDecision(reference.context, recommendation.id, {
    expectedRecommendationVersion: recommendation.version,
    outcome: 'ACCEPT',
    rationale: 'Akceptuję rekomendację w zakresie widocznego evidence.',
  });
  const proposal = reference.runtime.createActionProposal(reference.context, {
    decisionId: decision.id,
    recommendationId: recommendation.id,
  });
  const approvedProposal = reference.runtime.approveActionProposal(
    reference.context,
    proposal.id,
    {
      reauthenticationCode: 'reauth-confirmed',
    },
  );
  const execution = reference.runtime.executeActionProposal(
    reference.context,
    approvedProposal.id,
    {
      expectedTargetVersion: approvedProposal.targetVersion,
      idempotencyKey: approvedProposal.idempotencyKey,
    },
  );
  const outcome = reference.runtime.createOutcome(reference.context, execution.action.id);
  const experiment = reference.runtime.createLaboratoryExperiment(reference.context, {
    allowedDatasetIds: reference.result.contextManifest.datasetReferences,
    allowedMetricCodes: ['order_count', 'gross_revenue', 'net_revenue'],
    contextGoal: 'Porównaj KPI sprzedażowe i zapisz ograniczenia.',
    period: reference.aiContext.period,
    useCaseId: asAIUseCaseId('uc_laboratory_analysis'),
  });
  reference.runtime.runLaboratoryExperiment(reference.context, experiment.id);
  const evaluation = reference.runtime.runEvaluationSuite(reference.context);

  return aiStoryFixtureSchema.parse({
    action: execution.action,
    assistant: {
      messages: [
        'Użytkownik: Wyjaśnij aktualny Command Center.',
        `Papa Asystent: ${reference.result.output.summary}`,
      ],
      nextAction: 'Utwórz insight i recommendation draft.',
      refusalCode: null,
      status: reference.result.output.status,
      summary: reference.result.output.summary,
    },
    context: reference.context,
    decision,
    experiment,
    fixtureId: 'default',
    gateS3: reference.runtime.getGateS3Report(),
    governance: reference.runtime.getGovernance(reference.context),
    history: reference.runtime.getHistory(reference.context),
    insight,
    notes: [
      `Evaluation ${evaluation.id}: tenant/workspace/secret/tool leakage = 0.`,
      'Production AI jest zablokowane przez Gate S3 do niezależnych ocen.',
    ],
    observation,
    outcome,
    output: reference.result.output,
    proposal: approvedProposal,
    recommendation,
    run: reference.result.run,
    section: 'assistant',
    settings: reference.runtime.getSettings(reference.context),
    title: 'Papa Asystent, decyzje i AI Actions',
  });
}

const baseFixture = createBaseFixture();

function withAssistantState(
  fixtureId: AIFixtureId,
  title: string,
  status: AIRuntimeState,
  summary: string,
  options: {
    nextAction?: string;
    refusalCode?: string | null;
  } = {},
): AIStoryFixture {
  const fixture = clone(baseFixture);

  return aiStoryFixtureSchema.parse({
    ...fixture,
    assistant: {
      messages: [
        fixture.assistant.messages[0],
        `Papa Asystent: ${summary}`,
      ],
      nextAction: options.nextAction ?? 'Sprawdź evidence i ograniczenia.',
      refusalCode: options.refusalCode ?? null,
      status,
      summary,
    },
    fixtureId,
    notes: [summary, ...fixture.notes],
    section: 'assistant',
    title,
  });
}

function withSection(
  fixtureId: AIFixtureId,
  title: string,
  section: AIStoryFixture['section'],
  note: string,
): AIStoryFixture {
  const fixture = clone(baseFixture);

  return aiStoryFixtureSchema.parse({
    ...fixture,
    fixtureId,
    notes: [note, ...fixture.notes],
    section,
    title,
  });
}

export const aiStoryFixtures: Record<AIFixtureId, AIStoryFixture> = {
  action_approved: withSection('action_approved', 'AI Actions: approved', 'action', 'Proposal posiada approval człowieka.'),
  action_cancelled: withSection('action_cancelled', 'AI Actions: cancelled', 'action', 'Proposal można anulować przed wykonaniem.'),
  action_compensated: withSection('action_compensated', 'AI Actions: compensated', 'action', 'Kompensacja jest widoczna w historii działania.'),
  action_executing: withSection('action_executing', 'AI Actions: executing', 'action', 'Trwa idempotentne wykonanie po rewalidacji.'),
  action_failed: withSection('action_failed', 'AI Actions: failed', 'action', 'Błąd wykonania zachowuje audit i recovery.'),
  action_gated: withSection('action_gated', 'AI Actions: gated', 'action', 'Działanie pozostaje gated bez wymaganych bram.'),
  action_impact_preview: withSection('action_impact_preview', 'AI Actions: impact preview', 'action', 'Widoczny jest spodziewany wpływ i ryzyka.'),
  action_permission_revoked: withSection('action_permission_revoked', 'AI Actions: permission revoked', 'action', 'Cofnięcie capability blokuje execution.'),
  action_prohibited: withSection('action_prohibited', 'AI Actions: prohibited', 'action', 'Płatności, role, source authority i KPI approval są zabronione.'),
  action_proposal: withSection('action_proposal', 'AI Actions: proposal', 'action', 'ActionProposal nie wykonuje działania bez approval.'),
  action_reauthentication: withSection('action_reauthentication', 'AI Actions: reauthentication', 'action', 'Istotne działanie wymaga reauthentication.'),
  action_rejected: withSection('action_rejected', 'AI Actions: rejected', 'action', 'Człowiek może odrzucić propozycję.'),
  action_scope_preview: withSection('action_scope_preview', 'AI Actions: scope preview', 'action', 'Scope preview pokazuje tenant/workspace i target.'),
  action_success: withSection('action_success', 'AI Actions: success', 'action', 'Execution zakończone i outcome plan utworzony.'),
  action_target_changed: withSection('action_target_changed', 'AI Actions: target changed', 'action', 'Zmiana targetVersion blokuje wykonanie.'),
  assistant_blocked_refusal: withAssistantState('assistant_blocked_refusal', 'Papa Asystent: blocked refusal', 'BLOCKED_BY_POLICY', 'Dane są zablokowane dla AI.', { refusalCode: 'DATA_BLOCKED' }),
  assistant_building_context: withAssistantState('assistant_building_context', 'Papa Asystent: building context', 'BUILDING_CONTEXT', 'Buduję ContextManifest z dozwolonych MetricSnapshot.'),
  assistant_cancelled: withAssistantState('assistant_cancelled', 'Papa Asystent: cancelled', 'CANCELLED', 'Run anulowany; stream i cache workspace są zatrzymane.'),
  assistant_cost_limit: withAssistantState('assistant_cost_limit', 'Papa Asystent: cost limit', 'COST_LIMIT_REACHED', 'Limit kosztu runu został osiągnięty.', { refusalCode: 'COST_LIMIT_REACHED' }),
  assistant_disabled: withAssistantState('assistant_disabled', 'Papa Asystent: disabled', 'DISABLED', 'AI jest wyłączone dla workspace.'),
  assistant_entitlement_required: withAssistantState('assistant_entitlement_required', 'Papa Asystent: entitlement required', 'BLOCKED_BY_POLICY', 'Workspace nie ma wymaganego entitlementu AI.', { refusalCode: 'ENTITLEMENT_REQUIRED' }),
  assistant_evidence_unavailable: withAssistantState('assistant_evidence_unavailable', 'Papa Asystent: evidence unavailable', 'BLOCKED_BY_POLICY', 'Brak evidence w dozwolonym zakresie.', { refusalCode: 'EVIDENCE_UNAVAILABLE' }),
  assistant_gated: withAssistantState('assistant_gated', 'Papa Asystent: gated', 'BLOCKED_BY_POLICY', 'Gate S3 blokuje produkcyjne AI.', { refusalCode: 'GATE_NOT_SATISFIED' }),
  assistant_injection_blocked: withAssistantState('assistant_injection_blocked', 'Papa Asystent: injection blocked', 'INJECTION_BLOCKED', 'Wykryto prompt injection.', { refusalCode: 'INJECTION_DETECTED' }),
  assistant_invalid_refusal: withAssistantState('assistant_invalid_refusal', 'Papa Asystent: invalid refusal', 'REJECTED', 'KPI invalid nie może być analizowane.', { refusalCode: 'DATA_INVALID' }),
  assistant_no_data_refusal: withAssistantState('assistant_no_data_refusal', 'Papa Asystent: no data refusal', 'INSUFFICIENT_DATA', 'Brakuje danych do odpowiedzialnej analizy.', { refusalCode: 'INSUFFICIENT_DATA' }),
  assistant_out_of_scope_refusal: withAssistantState('assistant_out_of_scope_refusal', 'Papa Asystent: out of scope', 'BLOCKED_BY_POLICY', 'Pytanie wykracza poza zatwierdzony use case.', { refusalCode: 'OUT_OF_SCOPE' }),
  assistant_partial_answer: withAssistantState('assistant_partial_answer', 'Papa Asystent: partial answer', 'NEEDS_REVIEW', 'Analiza partial pokazuje brakujące kanały i ograniczenia.'),
  assistant_permission_denied: withAssistantState('assistant_permission_denied', 'Papa Asystent: permission denied', 'BLOCKED_BY_POLICY', 'Użytkownik nie ma capability AI.', { refusalCode: 'PERMISSION_DENIED' }),
  assistant_provider_error: withAssistantState('assistant_provider_error', 'Papa Asystent: provider error', 'PROVIDER_ERROR', 'Provider zwrócił kontrolowany błąd.', { refusalCode: 'PROVIDER_UNAVAILABLE' }),
  assistant_provider_timeout: withAssistantState('assistant_provider_timeout', 'Papa Asystent: provider timeout', 'PROVIDER_ERROR', 'Timeout providera został zmapowany na refusal.', { refusalCode: 'PROVIDER_UNAVAILABLE' }),
  assistant_ready_answer: withAssistantState('assistant_ready_answer', 'Papa Asystent: ready answer', 'ANSWERED', baseFixture.assistant.summary),
  assistant_session_expired: withAssistantState('assistant_session_expired', 'Papa Asystent: session expired', 'REJECTED', 'Sesja wygasła; wymagana ponowna autoryzacja.'),
  assistant_stale_warning: withAssistantState('assistant_stale_warning', 'Papa Asystent: stale warning', 'NEEDS_REVIEW', 'Dane są stale i nie mogą być opisane jako bieżące.'),
  assistant_streaming: withAssistantState('assistant_streaming', 'Papa Asystent: streaming', 'GENERATING', 'Streaming odpowiedzi w toku; użytkownik może anulować.'),
  assistant_workspace_changed: withAssistantState('assistant_workspace_changed', 'Papa Asystent: workspace changed', 'CANCELLED', 'Zmiana workspace zatrzymała stream i odrzuciła późną odpowiedź.'),
  default: baseFixture,
  governance: withSection('governance', 'AI Governance', 'governance', 'Internal Control Plane pokazuje rejestry, Gate S3, koszt i incydenty.'),
  history: withSection('history', 'AI History', 'history', 'Historia obejmuje threads, runs, evidence, decyzje, koszt i deletion status.'),
  laboratory_answered: withSection('laboratory_answered', 'Laboratorium AI: answered', 'laboratory', 'Run laboratorium zakończony structured output.'),
  laboratory_archived: withSection('laboratory_archived', 'Laboratorium AI: archived', 'laboratory', 'Eksperyment można zarchiwizować zgodnie z retencją.'),
  laboratory_compare_runs: withSection('laboratory_compare_runs', 'Laboratorium AI: compare runs', 'laboratory', 'Porównanie runów pokazuje model, prompt, dane i koszt.'),
  laboratory_data_version_changed: withSection('laboratory_data_version_changed', 'Laboratorium AI: data version changed', 'laboratory', 'Ponowny run wskazuje nową wersję danych.'),
  laboratory_dataset_selection: withSection('laboratory_dataset_selection', 'Laboratorium AI: dataset selection', 'laboratory', 'Użytkownik wybiera tylko dozwolone datasety i KPI.'),
  laboratory_deletion_pending: withSection('laboratory_deletion_pending', 'Laboratorium AI: deletion pending', 'laboratory', 'Deletion propaguje do cache, memory, vector index i providerów.'),
  laboratory_export: withSection('laboratory_export', 'Laboratorium AI: export', 'laboratory', 'Eksport laboratorium jest kontrolowany i audytowany.'),
  laboratory_model_changed: withSection('laboratory_model_changed', 'Laboratorium AI: model changed', 'laboratory', 'Widoczna jest zmiana modelu i wersji promptu.'),
  laboratory_new_experiment: withSection('laboratory_new_experiment', 'Laboratorium AI: new experiment', 'laboratory', 'Nowy eksperyment wymaga zatwierdzonego use case.'),
  laboratory_partial_context: withSection('laboratory_partial_context', 'Laboratorium AI: partial context', 'laboratory', 'Partial context pokazuje brakujące dane.'),
  laboratory_restricted_source: withSection('laboratory_restricted_source', 'Laboratorium AI: restricted source', 'laboratory', 'Źródło spoza scope jest odrzucone.'),
  laboratory_retention_expired: withSection('laboratory_retention_expired', 'Laboratorium AI: retention expired', 'laboratory', 'Po retencji artefakt nie jest dostępny do nowego runu.'),
  laboratory_running: withSection('laboratory_running', 'Laboratorium AI: running', 'laboratory', 'Run pokazuje model, prompt, koszt i cancel.'),
  laboratory_use_case_selection: withSection('laboratory_use_case_selection', 'Laboratorium AI: use case selection', 'laboratory', 'Lista zawiera wyłącznie approved use cases.'),
  provenance_complete_evidence: withSection('provenance_complete_evidence', 'Provenance: complete evidence', 'provenance', 'Panel pokazuje pełne evidence i usage.'),
  provenance_historical_snapshot: withSection('provenance_historical_snapshot', 'Provenance: historical snapshot', 'provenance', 'Historyczny snapshot zachowuje wersję definicji.'),
  provenance_missing_evidence: withSection('provenance_missing_evidence', 'Provenance: missing evidence', 'provenance', 'Missing evidence blokuje odpowiedź.'),
  provenance_model_changed: withSection('provenance_model_changed', 'Provenance: model changed', 'provenance', 'Zmiana modelu jest widoczna bez chain-of-thought.'),
  provenance_partial_evidence: withSection('provenance_partial_evidence', 'Provenance: partial evidence', 'provenance', 'Partial evidence pokazuje limitations.'),
  provenance_restricted_evidence: withSection('provenance_restricted_evidence', 'Provenance: restricted evidence', 'provenance', 'Restricted evidence nie ujawnia danych poza scope.'),
  provenance_retention_warning: withSection('provenance_retention_warning', 'Provenance: retention warning', 'provenance', 'Panel pokazuje retention status i deletion status.'),
  recommendation_accepted: withSection('recommendation_accepted', 'Recommendation: accepted', 'recommendation', 'Decyzja ACCEPT jest ludzka i audytowana.'),
  recommendation_deferred: withSection('recommendation_deferred', 'Recommendation: deferred', 'recommendation', 'DEFER zachowuje rationale i deadline.'),
  recommendation_expired: withSection('recommendation_expired', 'Recommendation: expired', 'recommendation', 'Expired recommendation wymaga ponownej analizy.'),
  recommendation_invalidated: withSection('recommendation_invalidated', 'Recommendation: invalidated', 'recommendation', 'Zmiana danych może invalidować insight i recommendation.'),
  recommendation_modified: withSection('recommendation_modified', 'Recommendation: modified', 'recommendation', 'MODIFY wymaga zachowania wersji rekomendacji.'),
  recommendation_need_more_data: withSection('recommendation_need_more_data', 'Recommendation: need more data', 'recommendation', 'NEED_MORE_DATA nie wykonuje action.'),
  recommendation_needs_review: withSection('recommendation_needs_review', 'Recommendation: needs review', 'recommendation', 'Human review wymagany przed decyzją.'),
  recommendation_no_owner: withSection('recommendation_no_owner', 'Recommendation: no owner', 'recommendation', 'Brak ownera blokuje odpowiedzialną decyzję.'),
  recommendation_proposed: withSection('recommendation_proposed', 'Recommendation: proposed', 'recommendation', 'Recommendation jest propozycją, nie działaniem.'),
  recommendation_rejected: withSection('recommendation_rejected', 'Recommendation: rejected', 'recommendation', 'REJECT zapisuje rationale człowieka.'),
  recommendation_second_approval_required: withSection('recommendation_second_approval_required', 'Recommendation: second approval required', 'recommendation', 'Wyższe ryzyko wymaga drugiego approval.'),
  recommendation_stale_version: withSection('recommendation_stale_version', 'Recommendation: stale version', 'recommendation', 'Stale version blokuje decyzję.'),
  settings: withSection('settings', 'AI Settings', 'settings', 'Ustawienia pokazują use cases, modele, retencję, oversight i wyłączenie AI.'),
};
