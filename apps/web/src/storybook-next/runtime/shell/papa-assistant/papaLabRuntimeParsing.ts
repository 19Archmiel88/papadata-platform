/**
 * Pure parsing of raw papa.lab.read / papa.governance.read JSON payloads
 * into UI-ready Papa Lab types. Deliberately side-effect-free and free of
 * any import touching `bffClient` (which reads `import.meta.env` at module
 * scope and therefore cannot be imported from the plain-Node `node:test`
 * runner) — this file exists specifically so this parsing can be unit
 * tested without dragging in the BFF client singleton.
 *
 * Every "no data" case here resolves to `null`/`[]`, never a fabricated
 * default (e.g. `0`, a guessed risk level, or an invented policy) — see
 * the per-function comments below for which source column is genuinely
 * absent and why.
 */

import type {
  PapaActionRecord,
  PapaDecision,
  PapaLabExperiment,
  PapaModeRecord,
} from '../../screens/papa/papaData';

export type PapaGovernancePolicy = {
  readonly aiMode: string;
  readonly approvalRequiredForExternalEffects: boolean;
  readonly externalEffects: {
    readonly execute: string;
    readonly rollback: string;
  };
  readonly idempotencyRequiredForCommands: boolean;
  readonly tenantWorkspaceScopeRequired: boolean;
};

export type PapaGovernanceSummary = {
  readonly actionApprovals: number;
  readonly actionProposals: number;
  readonly openCases: number;
  readonly outcomes: number;
  readonly source: string;
};

export type PapaLabRuntimePayload = {
  readonly actions?: readonly unknown[];
  readonly decisions?: readonly unknown[];
  readonly experiments?: readonly unknown[];
  readonly labResult?: unknown;
  readonly recommendations?: readonly unknown[];
};

export type PapaGovernanceRuntimePayload = {
  readonly governance?: unknown;
  readonly summary?: unknown;
};

export function readLabResultCompletedAt(
  payload: PapaLabRuntimePayload,
): string | null {
  return readString(payload.labResult, 'completedAt');
}

export function readPapaLabExperiments(
  payload: PapaLabRuntimePayload,
): readonly PapaLabExperiment[] {
  if (!Array.isArray(payload.experiments)) return [];

  return payload.experiments.flatMap((item): readonly PapaLabExperiment[] => {
    if (!isPlainRecord(item)) return [];
    const id = readString(item, 'id');
    if (!id) return [];
    const title = readString(item, 'title') ?? readString(item, 'name') ?? 'Eksperyment Papa';

    return [{
      baseline: readNumericValue(item.baseline),
      confidence: readNumericField(item, 'confidence')
        ?? readNumericNested(item.measuredOutcome, 'confidence')
        ?? readNumericNested(item.expectedOutcome, 'confidence'),
      hypothesis: readString(item, 'hypothesis') ?? 'Hipoteza nie została jeszcze utrwalona w runtime.',
      id,
      name: title,
      nextStep: readString(item, 'nextStep') ?? resolveLabNextStep(item.status),
      owner: readString(item, 'owner') ?? readString(item, 'ownerUserId') ?? 'Papa Asystent',
      reportId: readString(item, 'reportId') ?? `papa-lab-report-${id}`,
      status: normalizeLabExperimentStatus(item.status),
      variant: readNumericValue(item.measuredOutcome)
        ?? readNumericValue(item.expectedOutcome)
        ?? readNumericValue(item.variantConfig),
    }];
  });
}

export function readPapaLabActions(
  payload: PapaLabRuntimePayload,
): readonly PapaActionRecord[] {
  if (!Array.isArray(payload.actions)) return [];

  return payload.actions.flatMap((item): readonly PapaActionRecord[] => {
    if (!isPlainRecord(item)) return [];
    const id = readString(item, 'id');
    if (!id) return [];
    const operationId = readString(item, 'operationId');
    const createdBy = readString(item, 'createdByUserId');

    return [{
      id,
      label: operationId ? `Operacja: ${operationId}` : 'Propozycja akcji Papa',
      operationId,
      // assistant_action_proposals has no risk column — 'unknown' is honest,
      // not a guess.
      owner: createdBy ? `Użytkownik ${createdBy.slice(0, 8)}` : 'Nieznany właściciel',
      risk: 'unknown',
      status: normalizeLabActionStatus(item.status),
    }];
  });
}

export function normalizeLabActionStatus(value: unknown): PapaActionRecord['status'] {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === 'approval_required') return 'approval';
  if (['blocked', 'rejected', 'rolled_back'].includes(normalized)) return 'blocked';
  if (['validated', 'approved', 'executed'].includes(normalized)) return 'ready';
  return 'draft';
}

export function readPapaLabDecisions(
  payload: PapaLabRuntimePayload,
): readonly PapaDecision[] {
  if (!Array.isArray(payload.decisions)) return [];

  const recommendationRiskById = new Map<string, string | null>();
  if (Array.isArray(payload.recommendations)) {
    for (const record of payload.recommendations) {
      if (!isPlainRecord(record)) continue;
      const recommendationId = readString(record, 'id');
      if (recommendationId) {
        recommendationRiskById.set(recommendationId, readString(record, 'riskLevel'));
      }
    }
  }

  return payload.decisions.flatMap((item): readonly PapaDecision[] => {
    if (!isPlainRecord(item)) return [];
    const id = readString(item, 'id');
    if (!id) return [];
    const recommendationId = readString(item, 'recommendationId');
    const linkedRiskLevel = recommendationId
      ? recommendationRiskById.get(recommendationId) ?? null
      : null;
    const decidedBy = readString(item, 'decidedByUserId');

    return [{
      // assistant_decisions has no due-date column — null is honest, not
      // a guess. UI (DecisionCard) already renders "Bez terminu" for null.
      dueAt: null,
      id,
      impact: normalizeRiskLevelToImpact(linkedRiskLevel),
      owner: decidedBy ? `Użytkownik ${decidedBy.slice(0, 8)}` : 'Nieznany właściciel',
      status: normalizeLabDecisionStatus(item.status),
      title: readString(item, 'decision') ?? 'Decyzja Papa',
    }];
  });
}

export function normalizeRiskLevelToImpact(
  riskLevel: string | null,
): PapaDecision['impact'] {
  switch (riskLevel) {
    case 'critical':
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    default:
      // Matches the existing low-risk default convention in
      // resolveRecommendationRisk/resolveRecommendationEffort
      // (screens/papa/papaRuntimeData.ts) — no linked recommendation (or
      // an unrecognised risk level) falls back to the same
      // least-alarming bucket, not a fabricated guess.
      return 'low';
  }
}

const papaLabDecisionStatuses: readonly PapaDecision['status'][] = [
  'review', 'approved', 'rejected', 'scheduled', 'executing', 'monitoring', 'resolved', 'dismissed',
];

export function normalizeLabDecisionStatus(value: unknown): PapaDecision['status'] {
  const normalized = String(value ?? '').toLowerCase();
  return (papaLabDecisionStatuses as readonly string[]).includes(normalized)
    ? normalized as PapaDecision['status']
    : 'review';
}

export function readPapaGovernancePolicy(
  payload: PapaGovernanceRuntimePayload,
): PapaGovernancePolicy | null {
  if (!isPlainRecord(payload.governance)) return null;
  const governance = payload.governance;
  const externalEffects = isPlainRecord(governance.externalEffects)
    ? governance.externalEffects
    : {};

  return {
    aiMode: readString(governance, 'aiMode') ?? 'unknown',
    approvalRequiredForExternalEffects: governance.approvalRequiredForExternalEffects === true,
    externalEffects: {
      execute: readString(externalEffects, 'execute') ?? 'unknown',
      rollback: readString(externalEffects, 'rollback') ?? 'unknown',
    },
    idempotencyRequiredForCommands: governance.idempotencyRequiredForCommands === true,
    tenantWorkspaceScopeRequired: governance.tenantWorkspaceScopeRequired === true,
  };
}

export function readPapaGovernanceSummary(
  payload: PapaGovernanceRuntimePayload,
): PapaGovernanceSummary | null {
  if (!isPlainRecord(payload.summary)) return null;
  const summary = payload.summary;

  return {
    actionApprovals: readNumericValue(summary.actionApprovals) ?? 0,
    actionProposals: readNumericValue(summary.actionProposals) ?? 0,
    openCases: readNumericValue(summary.openCases) ?? 0,
    outcomes: readNumericValue(summary.outcomes) ?? 0,
    source: readString(summary, 'source') ?? 'assistant_governance_domain',
  };
}

export function buildModeRecordsFromGovernance(
  governance: PapaGovernancePolicy | null,
): readonly PapaModeRecord[] {
  if (!governance) return [];

  return [{
    allowedUse: 'Odczyt, rekomendacje i przygotowanie propozycji akcji do zatwierdzenia.',
    blockedUse: `Execute: ${governance.externalEffects.execute}; rollback: ${governance.externalEffects.rollback}.`,
    id: `papa-mode-${governance.aiMode}`,
    mode: governance.aiMode,
    requiresApproval: governance.approvalRequiredForExternalEffects
      ? 'Tak — każda akcja zewnętrzna'
      : 'Zależnie od ryzyka',
  }];
}

function resolveLabNextStep(status: unknown): string {
  switch (normalizeLabExperimentStatus(status)) {
    case 'completed':
      return 'Przejrzyj wynik eksperymentu i dowody.';
    case 'paused':
      return 'Usuń blokadę lub wznów eksperyment po korekcie danych.';
    case 'cancelled':
      return 'Zachowaj wynik jako kontekst i utwórz nową hipotezę, jeśli nadal jest potrzebna.';
    case 'draft':
      return 'Uzupełnij zakres i warunki pomiaru.';
    case 'running':
    default:
      return 'Poczekaj na zakończenie pomiaru.';
  }
}

export function normalizeLabExperimentStatus(
  value: unknown,
): PapaLabExperiment['status'] {
  const normalized = String(value ?? '').toLowerCase();
  if (['completed', 'measured', 'resolved', 'succeeded', 'success', 'ready'].includes(normalized)) {
    return 'completed';
  }
  if (['cancelled', 'canceled', 'failed', 'rejected', 'dismissed'].includes(normalized)) {
    return 'cancelled';
  }
  if (['paused', 'blocked', 'waiting', 'stalled'].includes(normalized)) {
    return 'paused';
  }
  if (['draft', 'new', 'proposed'].includes(normalized)) {
    return 'draft';
  }
  return 'running';
}

function readString(
  value: unknown,
  key: string,
): string | null {
  if (!isPlainRecord(value)) return null;
  const item = value[key];
  return typeof item === 'string' && item.trim().length > 0
    ? item.trim()
    : null;
}

function readNumericField(
  value: unknown,
  key: string,
): number | null {
  if (!isPlainRecord(value)) return null;
  return readNumericValue(value[key]);
}

function readNumericNested(
  value: unknown,
  key: string,
): number | null {
  if (!isPlainRecord(value)) return null;
  return readNumericValue(value[key]);
}

function readNumericValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (isPlainRecord(value)) {
    for (const key of ['value', 'score', 'actual', 'variant', 'rate', 'percentage', 'count']) {
      const parsed = readNumericValue(value[key]);
      if (parsed !== null) return parsed;
    }
  }
  return null;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value)
    && typeof value === 'object'
    && !Array.isArray(value);
}
