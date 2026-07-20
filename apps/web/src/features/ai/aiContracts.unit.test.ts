import { describe, expect, it } from 'vitest';

import {
  aiApiRoutes,
  aiContractVersion,
  aiGateS3Version,
  aiModelRegistry,
  aiProviderRegistry,
  aiRouteSet,
  aiStructuredOutputSchema,
  approvedAIUseCases,
  asAIUseCaseId,
  type AIRefusalCode,
} from './aiContracts';

describe('Fala 5 AI contracts', () => {
  it('publikuje pełny kontrakt AI Platform i zatwierdzony rejestr use case', () => {
    expect(aiContractVersion).toBe('ai-platform.v1');
    expect(approvedAIUseCases.map((useCase) => useCase.id)).toEqual([
      'uc_contextual_kpi_explanation',
      'uc_command_center_analysis',
      'uc_anomaly_interpretation',
      'uc_data_quality_explanation',
      'uc_campaign_analysis',
      'uc_marketplace_analysis',
      'uc_profitability_explanation',
      'uc_recommendation_drafting',
      'uc_decision_documentation',
      'uc_laboratory_analysis',
      'uc_action_proposal_generation',
    ]);
    expect(
      approvedAIUseCases.every((useCase) => useCase.status === 'APPROVED'),
    ).toBe(true);
    expect(
      approvedAIUseCases.find(
        (useCase) => useCase.id === asAIUseCaseId('uc_action_proposal_generation'),
      ),
    ).toMatchObject({
      humanOversightLevel: 'REAUTH_AND_APPROVAL',
      workspaceScope: 'CURRENT_WORKSPACE',
    });
  });

  it('rozdziela provider registry od model registry i blokuje model produkcyjny', () => {
    expect(aiProviderRegistry.map((provider) => provider.code)).toEqual([
      'papadata_local_synthetic',
      'external_llm_placeholder',
    ]);
    expect(aiModelRegistry.map((model) => model.code)).toEqual([
      'papadata_structured_synthetic_v1',
      'production_model_pending_gate_s3',
    ]);
    expect(aiModelRegistry[0]).toMatchObject({
      structuredOutput: true,
      toolSupport: true,
      status: 'APPROVED_FOR_SYNTHETIC',
    });
    expect(aiModelRegistry[1]).toMatchObject({
      providerCode: 'external_llm_placeholder',
      status: 'EVALUATION',
    });
  });

  it('wymaga FACT, INTERPRETATION, HYPOTHESIS, RECOMMENDATION i refusal contract', () => {
    const refusalCodes: AIRefusalCode[] = [
      'INSUFFICIENT_DATA',
      'DATA_NOT_READY',
      'DATA_INVALID',
      'DATA_BLOCKED',
      'STALE_FOR_CURRENT_DECISION',
      'PERMISSION_DENIED',
      'ENTITLEMENT_REQUIRED',
      'OUT_OF_SCOPE',
      'UNSUPPORTED_USE_CASE',
      'EVIDENCE_UNAVAILABLE',
      'CONFLICT_UNRESOLVED',
      'SAFETY_POLICY_BLOCK',
      'PROVIDER_UNAVAILABLE',
      'COST_LIMIT_REACHED',
      'GATE_NOT_SATISFIED',
      'INJECTION_DETECTED',
    ];

    expect(refusalCodes).toHaveLength(16);
    expect(aiStructuredOutputSchema.shape.facts).toBeDefined();
    expect(aiStructuredOutputSchema.shape.interpretations).toBeDefined();
    expect(aiStructuredOutputSchema.shape.hypotheses).toBeDefined();
    expect(aiStructuredOutputSchema.shape.recommendations).toBeDefined();
    expect(aiStructuredOutputSchema.shape.refusal).toBeDefined();
  });

  it('rejestruje endpointy API wymagane przez Falę 5', () => {
    expect(aiGateS3Version).toBe('ai-gate-s3.2026-07');
    expect(aiApiRoutes).toContain('GET /v1/ai/use-cases');
    expect(aiApiRoutes).toContain('POST /v1/ai/threads/{threadId}/messages');
    expect(aiApiRoutes).toContain('POST /v1/action-proposals/{proposalId}/execute');
    expect(aiApiRoutes).toContain('GET /v1/outcomes/{outcomeId}');
    expect(aiRouteSet.has('POST /v1/ai/laboratory/runs/{runId}/export')).toBe(true);
  });
});
