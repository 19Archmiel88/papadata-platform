import type {
  PapaLabRuntimeState,
} from '../../runtime/shell/papa-assistant';
import {
  papaAssistantLabStages,
} from '../../screens/papa-assistant/lab/PapaAssistantLabScreen.model';
import type {
  PapaAssistantLabRunState,
  PapaAssistantLabScreenData,
} from '../../screens/papa-assistant/lab/PapaAssistantLabScreen.model';

export function createPapaAssistantLabRuntimeData(
  runtime: PapaLabRuntimeState,
): PapaAssistantLabScreenData {
  const primaryExperiment = runtime.experiments[0] ?? null;
  const confidenceValues = runtime.experiments
    .map((experiment) => experiment.confidence)
    .filter((value): value is number => value !== null);
  const averageConfidence = confidenceValues.length > 0
    ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
    : null;
  const chartPoints = runtime.experiments.flatMap((experiment, index) => {
    const baseline = experiment.baseline;
    const variant = experiment.variant;

    if (baseline === null && variant === null) return [];

    const probable = variant ?? baseline ?? 0;
    const base = baseline ?? probable;

    return [{
      label: `Wariant ${index + 1}`,
      optimistic: roundMetric(Math.max(probable, base) * 1.08),
      pessimistic: roundMetric(Math.min(probable, base) * 0.92),
      probable: roundMetric(probable),
    }];
  });
  const primaryDecision = runtime.decisions[0] ?? null;

  return {
    analyses: runtime.experiments.map((experiment) => ({
      id: experiment.id,
      meta: `${experiment.owner} · ${experiment.status}`,
      name: experiment.name,
      status: mapExperimentState(experiment.status),
    })),
    artifacts: runtime.experiments.map((experiment) => ({
      actionLabel: 'Otwórz szczegóły',
      id: `experiment-${experiment.id}`,
      name: experiment.name,
      status: experiment.status === 'completed'
        ? 'ready'
        : experiment.status === 'running'
          ? 'building'
          : 'stale',
      type: 'Eksperyment',
      version: experiment.reportId || 'Bez raportu',
    })),
    chart: {
      description: 'Wartości bazowe i wariantowe zapisanych eksperymentów Laboratorium.',
      points: chartPoints,
      status: runtime.loading
        ? 'loading'
        : runtime.error
          ? 'error'
          : chartPoints.length > 0
            ? 'ready'
            : 'noData',
      statusLabel: runtime.loading
        ? 'Ładowanie danych'
        : runtime.error
          ? 'Błąd danych'
          : chartPoints.length > 0
            ? 'Dane gotowe'
            : 'Brak pomiarów',
      title: 'Wynik eksperymentów Laboratorium',
    },
    confidenceLabel: averageConfidence === null
      ? 'Brak danych'
      : averageConfidence >= 0.85
        ? 'Wysoka'
        : averageConfidence >= 0.65
          ? 'Średnia'
          : 'Ograniczona',
    contextItems: [
      {
        detail: `${runtime.experiments.length} eksperymentów w bieżącym workspace`,
        id: 'runtime-experiments',
        label: 'Eksperymenty Laboratorium',
        type: 'Dane runtime',
      },
      {
        detail: `${runtime.decisions.length} decyzji · ${runtime.actions.length} działań`,
        id: 'runtime-decisions',
        label: 'Decyzje i działania AI',
        type: 'Governance',
      },
    ],
    decision: {
      audit: primaryDecision
        ? [`Status: ${primaryDecision.status}`, `Termin: ${primaryDecision.dueAt ?? 'nie określono'}`]
        : ['Brak decyzji wymagających przeglądu.'],
      id: primaryDecision?.id ?? 'Brak aktywnej decyzji',
      label: primaryDecision?.title ?? 'Nie utworzono decyzji dla tej analizy',
      owner: primaryDecision?.owner ?? 'Nie przypisano',
      status: primaryDecision ? decisionStatusLabel(primaryDecision.status) : 'Brak decyzji',
    },
    errorMessage: runtime.error,
    evidence: runtime.generatedAt
      ? [{
          detail: `Wygenerowano: ${formatRuntimeDate(runtime.generatedAt)}`,
          id: 'runtime-lab-result',
          label: 'Wynik Laboratorium',
          source: '/api/v1/papa/laboratorium-ai',
        }]
      : [],
    id: primaryExperiment?.id ?? 'runtime-lab',
    initialStage: 'diagnosis',
    initialView: 'result',
    loading: runtime.loading,
    project: {
      datasets: 'workspace',
      datasetOptions: [{ label: 'Dane aktywnego workspace', value: 'workspace' }],
      filters: '',
      goal: primaryExperiment?.name ?? 'Nowa analiza Laboratorium',
      instruction: primaryExperiment?.hypothesis ?? 'Opisz hipotezę, którą Laboratorium ma zweryfikować.',
      kpi: 'experiment-result',
      kpiOptions: [{ label: 'Wynik eksperymentu', value: 'experiment-result' }],
      limit: 42,
      period: 'current',
      periodOptions: [{ label: 'Bieżący zakres workspace', value: 'current' }],
    },
    quality: {
      completeness: averageConfidence === null ? 'Brak danych' : formatPercent(averageConfidence),
      freshness: runtime.generatedAt ? formatRuntimeDate(runtime.generatedAt) : 'Brak danych',
      issues: runtime.error
        ? [runtime.error]
        : chartPoints.length === 0
          ? ['Eksperymenty nie zawierają jeszcze wartości bazowej lub wariantowej.']
          : [],
      readiness: runtime.error
        ? 'Wymaga uwagi'
        : runtime.loading
          ? 'Wczytywanie'
          : chartPoints.length > 0
            ? 'Gotowe do analizy'
            : 'Oczekuje na pomiar',
      score: averageConfidence === null ? '—' : formatPercent(averageConfidence),
    },
    response: buildRuntimeResponses(runtime, primaryExperiment?.nextStep ?? null),
    runState: primaryExperiment ? mapExperimentState(primaryExperiment.status) : 'draft',
    sources: ['Laboratorium AI', 'Polityka governance'],
    stages: papaAssistantLabStages,
    timeframeLabel: 'Bieżący zakres workspace',
    title: primaryExperiment?.name ?? 'Laboratorium Papa Asystenta',
    updatedAtLabel: runtime.generatedAt ? formatRuntimeDate(runtime.generatedAt) : 'Brak synchronizacji',
  };
}

function buildRuntimeResponses(
  runtime: PapaLabRuntimeState,
  nextStep: string | null,
): PapaAssistantLabScreenData['response'] {
  const facts = [
    `${runtime.experiments.length} eksperymentów w Laboratorium.`,
    `${runtime.decisions.length} decyzji i ${runtime.actions.length} działań AI.`,
  ];
  const nextSteps = nextStep ? [nextStep] : ['Uzupełnij hipotezę i uruchom pierwszy pomiar.'];

  return {
    diagnosis: {
      facts,
      hypotheses: runtime.experiments.length > 0
        ? runtime.experiments.slice(0, 2).map((experiment) => experiment.hypothesis)
        : ['Brak zapisanej hipotezy do weryfikacji.'],
      interpretation: ['Laboratorium pokazuje wyłącznie dane dostępne w bieżącym workspace.'],
      nextSteps,
      recommendation: nextStep ?? 'Utwórz eksperyment, aby Papa mógł przygotować diagnozę.',
    },
    decision: {
      facts,
      hypotheses: ['Wariant wymaga oceny wpływu i ryzyka przed zatwierdzeniem.'],
      interpretation: [`${runtime.decisions.length} decyzji jest dostępnych do przeglądu.`],
      nextSteps,
      recommendation: runtime.decisions[0]?.title ?? 'Brak decyzji wymagających działania.',
    },
    report: {
      facts,
      hypotheses: ['Raport powinien zachować źródło i czas wygenerowania danych.'],
      interpretation: [`${runtime.experiments.filter((item) => item.reportId).length} eksperymentów ma przypisany raport.`],
      nextSteps,
      recommendation: 'Przygotuj raport tylko z eksperymentów zawierających pomiar.',
    },
    plan: {
      facts,
      hypotheses: ['Kolejne kroki wynikają z zapisanych eksperymentów i decyzji.'],
      interpretation: ['Plan powinien mieć właściciela oraz jawny status akceptacji.'],
      nextSteps,
      recommendation: nextStep ?? 'Przypisz właściciela i termin pierwszego działania.',
    },
  };
}

function mapExperimentState(
  state: 'cancelled' | 'completed' | 'draft' | 'paused' | 'running',
): PapaAssistantLabRunState {
  switch (state) {
    case 'completed': return 'completed';
    case 'running': return 'running';
    case 'paused': return 'partial';
    case 'cancelled': return 'error';
    case 'draft':
    default: return 'draft';
  }
}

function decisionStatusLabel(status: string): string {
  switch (status) {
    case 'approved': return 'Zatwierdzono';
    case 'rejected': return 'Odrzucono';
    case 'review': return 'Do przeglądu';
    case 'executing': return 'W realizacji';
    case 'monitoring': return 'Monitorowanie';
    case 'resolved': return 'Zamknięto';
    default: return status;
  }
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatRuntimeDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(date);
}

function roundMetric(value: number): number {
  return Math.round(value * 100) / 100;
}
