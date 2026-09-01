import type {
  AnalyticsDataState,
  PapaDataIconName,
} from '../../../design-system';

export type PapaAssistantLabStageId =
  | 'diagnosis'
  | 'decision'
  | 'report'
  | 'plan';

export type PapaAssistantLabViewId =
  | 'project'
  | 'result'
  | 'comparison';

export type PapaAssistantLabLayerId =
  | 'analyses'
  | 'context'
  | 'evidence'
  | 'quality'
  | 'decisions'
  | 'artifacts';

export type PapaAssistantLabRunState =
  | 'draft'
  | 'running'
  | 'completed'
  | 'partial'
  | 'noData'
  | 'error'
  | 'aiRefusal'
  | 'failed'
  | 'permissionDenied';

export type PapaAssistantLabOption = {
  readonly label: string;
  readonly value: string;
};

export type PapaAssistantLabStage = {
  readonly id: PapaAssistantLabStageId;
  readonly icon: PapaDataIconName;
  readonly label: string;
  readonly summary: string;
};

export type PapaAssistantLabAnalysis = {
  readonly id: string;
  readonly meta: string;
  readonly name: string;
  readonly status: PapaAssistantLabRunState;
};

export type PapaAssistantLabContextItem = {
  readonly detail: string;
  readonly id: string;
  readonly label: string;
  readonly type: string;
};

export type PapaAssistantLabEvidenceItem = {
  readonly detail: string;
  readonly id: string;
  readonly label: string;
  readonly source: string;
};

export type PapaAssistantLabArtifact = {
  readonly actionLabel: string;
  readonly id: string;
  readonly name: string;
  readonly status: 'ready' | 'building' | 'stale';
  readonly type: string;
  readonly version: string;
};

export type PapaAssistantLabChartPoint = {
  readonly label: string;
  readonly optimistic: number;
  readonly pessimistic: number;
  readonly probable: number;
};

export type PapaAssistantLabProject = {
  readonly datasets: string;
  readonly datasetOptions: readonly PapaAssistantLabOption[];
  readonly filters: string;
  readonly goal: string;
  readonly instruction: string;
  readonly kpi: string;
  readonly kpiOptions: readonly PapaAssistantLabOption[];
  readonly limit: number;
  readonly period: string;
  readonly periodOptions: readonly PapaAssistantLabOption[];
};

export type PapaAssistantLabScreenData = {
  readonly analyses: readonly PapaAssistantLabAnalysis[];
  readonly artifacts: readonly PapaAssistantLabArtifact[];
  readonly chart: {
    readonly description: string;
    readonly points: readonly PapaAssistantLabChartPoint[];
    readonly status: AnalyticsDataState;
    readonly statusLabel: string;
    readonly title: string;
  };
  readonly confidenceLabel: string;
  readonly contextItems: readonly PapaAssistantLabContextItem[];
  readonly decision: {
    readonly audit: readonly string[];
    readonly id: string;
    readonly label: string;
    readonly owner: string;
    readonly status: string;
  };
  readonly errorMessage?: string | null;
  readonly evidence: readonly PapaAssistantLabEvidenceItem[];
  readonly id: string;
  readonly initialStage: PapaAssistantLabStageId;
  readonly initialView: PapaAssistantLabViewId;
  readonly loading: boolean;
  readonly project: PapaAssistantLabProject;
  readonly quality: {
    readonly completeness: string;
    readonly freshness: string;
    readonly issues: readonly string[];
    readonly readiness: string;
    readonly score: string;
  };
  readonly response: Record<PapaAssistantLabStageId, {
    readonly facts: readonly string[];
    readonly hypotheses: readonly string[];
    readonly interpretation: readonly string[];
    readonly nextSteps: readonly string[];
    readonly recommendation: string;
  }>;
  readonly runState: PapaAssistantLabRunState;
  readonly sources: readonly string[];
  readonly stages: readonly PapaAssistantLabStage[];
  readonly timeframeLabel: string;
  readonly title: string;
  readonly updatedAtLabel: string;
};

export type PapaAssistantLabProjectDraft = {
  readonly datasets: string;
  readonly filters: string;
  readonly goal: string;
  readonly instruction: string;
  readonly kpi: string;
  readonly limit: number;
  readonly period: string;
};

export const papaAssistantLabStages: readonly PapaAssistantLabStage[] = [
  {
    id: 'diagnosis',
    icon: 'warning',
    label: 'Diagnoza',
    summary: 'Źródła problemu, fakty, hipotezy i ograniczenia danych.',
  },
  {
    id: 'decision',
    icon: 'decisions',
    label: 'Decyzja',
    summary: 'Warianty działania, wpływ i kontrola człowieka.',
  },
  {
    id: 'report',
    icon: 'data',
    label: 'Raport',
    summary: 'Artefakty, wykresy i wyniki gotowe do udostępnienia.',
  },
  {
    id: 'plan',
    icon: 'calendar',
    label: 'Plan działań',
    summary: 'Kolejne kroki, właściciele, terminy i status wykonania.',
  },
];
