import type {
  DataColumn,
  DataRow,
} from '../../../../../../../contracts/component-shared';
import type {
  DataSourceRef,
  EvidenceRef,
  ReadinessState,
  WorkspaceContext,
} from '../../../../../../../contracts/ui-contract-types';

export type PapaScreenId =
  | '50.01'
  | '50.02'
  | '50.03'
  | '50.04'
  | '50.05'
  | '50.06'
  | '50.07'
  | '50.08'
  | '50.09'
  | '50.10'
  | '50.11'
  | '50.12'
  | '50.13'
  | '50.14'
  | '50.15'
  | '50.16'
  | '50.17';

export type PapaScreenVariant =
  | 'context-panel'
  | 'assistant-shell'
  | 'work-modes'
  | 'context-basket'
  | 'answer'
  | 'evidence'
  | 'confidence'
  | 'lab'
  | 'observations'
  | 'recommendation-variants'
  | 'proposals'
  | 'action-approval'
  | 'actions'
  | 'blocked-actions'
  | 'history-memory'
  | 'governance'
  | 'variants';

export type PapaScreenDefinition = {
  readonly apiPath: `/api/v1/${string}` | null;
  readonly displayTitle: string;
  readonly id: PapaScreenId;
  readonly operationId: string | null;
  readonly route: `/app/${string}` | null;
  readonly routeBase: `/app/${string}` | null;
  readonly summary: string;
  readonly variant: PapaScreenVariant;
};

export type PapaContextItem = {
  readonly id: string;
  readonly label: string;
  readonly kind: 'metric' | 'record' | 'segment' | 'decision';
  readonly source: string;
  readonly confidence: number;
  readonly retention: string;
};

export type PapaEvidenceItem = {
  readonly id: string;
  readonly claim: string;
  readonly source: string;
  readonly confidence: number;
  readonly freshnessAt: string;
};

export type PapaDecision = {
  readonly id: string;
  readonly title: string;
  readonly owner: string;
  readonly status:
    | 'new' | 'review' | 'approved' | 'rejected'
    | 'scheduled' | 'executing' | 'monitoring' | 'resolved' | 'dismissed';
  readonly impact: 'low' | 'medium' | 'high';
  readonly dueAt: string | null;
};

export type PapaActionRecord = {
  readonly id: string;
  readonly label: string;
  readonly owner: string;
  readonly status: 'draft' | 'approval' | 'blocked' | 'ready';
  readonly operationId: string | null;
  readonly risk: 'low' | 'medium' | 'high' | 'unknown';
};

export type PapaModeRecord = {
  readonly id: string;
  readonly mode: string;
  readonly allowedUse: string;
  readonly requiresApproval: string;
  readonly blockedUse: string;
};

export type PapaMemoryRecord = {
  readonly id: string;
  readonly event: string;
  readonly source: string;
  readonly retention: string;
  readonly timestamp: string;
};

export type PapaAssistantStatus = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly state: 'ready' | 'attention' | 'blocked' | 'learning' | 'offline';
  readonly metric: string;
  readonly value: string;
  readonly owner: string;
  readonly updatedAt: string;
  readonly evidenceIds: readonly string[];
};

export type PapaRecommendationRecord = {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly impact: 'low' | 'medium' | 'high';
  readonly effort: 'low' | 'medium' | 'high';
  readonly risk: 'low' | 'medium' | 'high';
  readonly owner: string;
  readonly nextStep: string;
  readonly status: 'draft' | 'recommended' | 'needs-approval' | 'blocked';
  readonly evidenceIds: readonly string[];
};

export type PapaChatMessage = {
  readonly id: string;
  readonly author: 'user' | 'assistant' | 'system';
  readonly body: string;
  readonly createdAt: string;
  readonly contextItemId?: string;
  readonly evidenceIds: readonly string[];
  /**
   * Structured fields from a real papa.answer.generate/read response.
   * Absent for locally-generated system messages (e.g. "new conversation
   * started") and for pre-backend fixture data — PapaMessageThread falls
   * back to text heuristics only when these are undefined.
   */
  readonly approvalRequired?: boolean;
  readonly confidence?: number | null;
  readonly isRefusal?: boolean;
  readonly riskLevel?: 'critical' | 'high' | 'low' | 'medium';
};

export type PapaElementThread = {
  readonly elementId: string;
  readonly elementLabel: string;
  readonly elementKind: 'metric' | 'record' | 'segment' | 'decision' | 'action';
  readonly status: 'ready' | 'partial' | 'blocked';
  readonly messages: readonly PapaChatMessage[];
};

export type PapaLabExperiment = {
  readonly id: string;
  readonly name: string;
  readonly hypothesis: string;
  readonly status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  readonly owner: string;
  /**
   * `null` when the persisted experiment has no parseable measured value yet
   * (e.g. `measuredOutcome`/`baseline` JSON without a numeric field) — never
   * fabricated as `0`. Consumers must render an explicit "no data" state.
   */
  readonly confidence: number | null;
  readonly baseline: number | null;
  readonly variant: number | null;
  readonly nextStep: string;
  readonly reportId: string;
};

export type PapaReportArtifact = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: 'ready' | 'building' | 'stale';
  readonly formats: readonly ('pdf' | 'csv')[];
  readonly generatedAt: string;
  readonly owner: string;
  readonly datasets: readonly string[];
};

export type PapaAssistantTrendDatum = {
  readonly label: string;
  readonly actual: number;
  readonly plan: number;
  readonly movingAverage: number;
};

export type PapaWorkspaceData = {
  readonly generatedAt: string;
  readonly context: WorkspaceContext;
  readonly contextItems: readonly PapaContextItem[];
  readonly actions: readonly PapaActionRecord[];
  readonly assistantTrend: readonly PapaAssistantTrendDatum[];
  readonly chatMessages: readonly PapaChatMessage[];
  readonly decisions: readonly PapaDecision[];
  readonly elementThreads: readonly PapaElementThread[];
  readonly evidence: readonly PapaEvidenceItem[];
  readonly labExperiments: readonly PapaLabExperiment[];
  readonly memory: readonly PapaMemoryRecord[];
  readonly modeRecords: readonly PapaModeRecord[];
  readonly recommendations: readonly PapaRecommendationRecord[];
  readonly reports: readonly PapaReportArtifact[];
  readonly sources: readonly DataSourceRef[];
  readonly statuses: readonly PapaAssistantStatus[];
  readonly summary: {
    readonly readiness: ReadinessState;
    readonly contextItems: number;
    readonly decisionsDue: number;
    readonly evidenceCount: number;
    readonly confidence: number;
  };
};

export const papaScreenDefinitions: readonly PapaScreenDefinition[] = [
  {
    apiPath: '/api/v1/papa/panel-kontekstowy-papa',
    displayTitle: 'Panel kontekstowy Papa',
    id: '50.01',
    operationId: 'papa.context-panel.read',
    route: '/app/papa/panel-kontekstowy-papa',
    routeBase: '/app/papa/panel-kontekstowy-papa',
    summary: 'Panel kontekstu AI ze stanem danych, dowodami, poziomem pewności i decyzjami bez wykonywania akcji.',
    variant: 'context-panel',
  },
  {
    apiPath: '/api/v1/papa/assistantshell',
    displayTitle: 'Powłoka asystenta',
    id: '50.02',
    operationId: 'papa.assistant-shell.read',
    route: '/app/papa/assistantshell',
    routeBase: '/app/papa/assistantshell',
    summary: 'Powłoka asystenta z kompozytorem, kontekstem i statusem danych.',
    variant: 'assistant-shell',
  },
  {
    apiPath: null,
    displayTitle: 'Tryby pracy',
    id: '50.03',
    operationId: null,
    route: null,
    routeBase: null,
    summary: 'Macierz trybów pracy Papa bez ścieżki aplikacyjnej i bez fikcyjnej operacji zapisu.',
    variant: 'work-modes',
  },
  {
    apiPath: '/api/v1/papa/context-basket',
    displayTitle: 'Koszyk kontekstu',
    id: '50.04',
    operationId: 'papa.context-basket.read',
    route: '/app/papa/context-basket',
    routeBase: '/app/papa/context-basket',
    summary: 'Koszyk kontekstu używany przez Papa, z pochodzeniem, poziomem pewności i retencją.',
    variant: 'context-basket',
  },
  {
    apiPath: '/api/v1/papa/odpowiedz-papa',
    displayTitle: 'Odpowiedź Papa',
    id: '50.05',
    operationId: 'papa.answer.read',
    route: '/app/papa/odpowiedz-papa',
    routeBase: '/app/papa/odpowiedz-papa',
    summary: 'Odpowiedź AI z twierdzeniami, dowodami, ograniczeniami i decyzją do zatwierdzenia.',
    variant: 'answer',
  },
  {
    apiPath: '/api/v1/papa/dowody',
    displayTitle: 'Dowody',
    id: '50.06',
    operationId: 'papa.evidence.read',
    route: '/app/papa/dowody',
    routeBase: '/app/papa/dowody',
    summary: 'Dowody Papa z pochodzeniem, świeżością, poziomem pewności i ograniczeniami interpretacji.',
    variant: 'evidence',
  },
  {
    apiPath: null,
    displayTitle: 'Poziom pewności',
    id: '50.07',
    operationId: null,
    route: null,
    routeBase: null,
    summary: 'Polityka poziomu pewności dla Papa przy danych pełnych, częściowych i wymagających zatwierdzenia.',
    variant: 'confidence',
  },
  {
    apiPath: '/api/v1/papa/laboratorium-ai',
    displayTitle: 'Laboratorium AI',
    id: '50.08',
    operationId: 'papa.lab.read',
    route: '/app/papa/laboratorium-ai',
    routeBase: '/app/papa/laboratorium-ai',
    summary: 'Eksperymenty AI z kontekstem, dowodami i kontrolą działań wymagających zgody.',
    variant: 'lab',
  },
  {
    apiPath: '/api/v1/papa/obserwacje',
    displayTitle: 'Obserwacje',
    id: '50.09',
    operationId: 'papa.observations.read',
    route: '/app/papa/obserwacje',
    routeBase: '/app/papa/obserwacje',
    summary: 'Obserwacje Papa powiązane z metrykami, dowodami i decyzjami do przeglądu.',
    variant: 'observations',
  },
  {
    apiPath: null,
    displayTitle: 'Rekomendacje i warianty',
    id: '50.10',
    operationId: null,
    route: null,
    routeBase: null,
    summary: 'Macierz rekomendacji i wariantów pokazująca gotowość, ryzyko i wymagane zatwierdzenia.',
    variant: 'recommendation-variants',
  },
  {
    apiPath: '/api/v1/papa/propozycje-ai',
    displayTitle: 'Propozycje AI',
    id: '50.11',
    operationId: 'papa.proposals.read',
    route: '/app/papa/propozycje-ai',
    routeBase: '/app/papa/propozycje-ai',
    summary: 'Lista propozycji AI z zespołem odpowiedzialnym, ryzykiem i statusem zatwierdzenia.',
    variant: 'proposals',
  },
  {
    apiPath: '/api/v1/papa/ai-action-approval',
    displayTitle: 'Akceptacja działań AI',
    id: '50.12',
    operationId: 'papa.action-approval.read',
    route: '/app/papa/ai-action-approval',
    routeBase: '/app/papa/ai-action-approval',
    summary: 'Powierzchnia akceptacji działań AI z ryzykiem, dowodami i wymaganym zatwierdzeniem.',
    variant: 'action-approval',
  },
  {
    apiPath: '/api/v1/papa/ai-actions',
    displayTitle: 'Działania AI',
    id: '50.13',
    operationId: 'papa.actions.read',
    route: '/app/papa/ai-actions',
    routeBase: '/app/papa/ai-actions',
    summary: 'Rejestr działań AI ze statusem, ryzykiem i zespołem odpowiedzialnym.',
    variant: 'actions',
  },
  {
    apiPath: null,
    displayTitle: 'Zablokowane działania AI',
    id: '50.14',
    operationId: null,
    route: null,
    routeBase: null,
    summary: 'Polityka zablokowanych działań AI z powodem blokady i wymaganym właścicielem.',
    variant: 'blocked-actions',
  },
  {
    apiPath: '/api/v1/papa/historia-i-pamiec-papa',
    displayTitle: 'Historia i pamięć Papa',
    id: '50.15',
    operationId: 'papa.history-memory.read',
    route: '/app/papa/historia-i-pamiec-papa',
    routeBase: '/app/papa/historia-i-pamiec-papa',
    summary: 'Historia odpowiedzi, pamięć kontekstu i retencja informacji używanych przez Papa.',
    variant: 'history-memory',
  },
  {
    apiPath: '/api/v1/papa/ustawienia-ai-i-governance',
    displayTitle: 'Ustawienia AI i nadzór',
    id: '50.16',
    operationId: 'papa.governance.read',
    route: '/app/papa/ustawienia-ai-i-governance',
    routeBase: '/app/papa/ustawienia-ai-i-governance',
    summary: 'Ustawienia nadzoru AI, wymagane zgody i blokady działań wysokiego ryzyka.',
    variant: 'governance',
  },
  {
    apiPath: null,
    displayTitle: 'Warianty Papa',
    id: '50.17',
    operationId: null,
    route: null,
    routeBase: null,
    summary: 'Macierz wariantów Papa dla trybów pracy, pewności i ograniczeń działań AI.',
    variant: 'variants',
  },
] as const;

export const papaContextColumns: readonly DataColumn[] = [
  { id: 'label', label: 'Element kontekstu', sortable: true, width: 260 },
  { id: 'kindLabel', label: 'Typ', sortable: true },
  { id: 'source', label: 'Źródło', sortable: true },
  { align: 'right', id: 'confidence', label: 'Pewność', sortable: true },
  { id: 'retention', label: 'Retencja', sortable: true },
];

export const papaEvidenceColumns: readonly DataColumn[] = [
  { id: 'claim', label: 'Twierdzenie', sortable: true, width: 320 },
  { id: 'source', label: 'Źródło', sortable: true },
  { align: 'right', id: 'confidence', label: 'Pewność', sortable: true },
  { id: 'freshnessAt', label: 'Świeżość', sortable: true },
];

export const papaModeColumns: readonly DataColumn[] = [
  { id: 'mode', label: 'Tryb', sortable: true, width: 220 },
  { id: 'allowedUse', label: 'Dozwolone użycie', sortable: false },
  { id: 'requiresApproval', label: 'Wymaga zgody', sortable: false },
  { id: 'blockedUse', label: 'Zablokowane użycie', sortable: false },
];

export const papaActionColumns: readonly DataColumn[] = [
  { id: 'label', label: 'Działanie', sortable: true, width: 280 },
  { id: 'owner', label: 'Zespół', sortable: true },
  { id: 'statusLabel', label: 'Status', sortable: true },
  { id: 'riskLabel', label: 'Ryzyko', sortable: true },
  { id: 'operationId', label: 'Wykonanie', sortable: true },
];

export const papaMemoryColumns: readonly DataColumn[] = [
  { id: 'event', label: 'Zdarzenie', sortable: true, width: 280 },
  { id: 'source', label: 'Źródło', sortable: true },
  { id: 'retention', label: 'Retencja', sortable: true },
  { id: 'timestamp', label: 'Czas', sortable: true },
];

export const papaLabExperimentColumns: readonly DataColumn[] = [
  { id: 'name', label: 'Eksperyment', sortable: true, width: 280 },
  { id: 'statusLabel', label: 'Status', sortable: true },
  { id: 'owner', label: 'Właściciel', sortable: true },
  { align: 'right', id: 'confidence', label: 'Pewność', sortable: true },
  { align: 'right', id: 'uplift', label: 'Różnica', sortable: true },
  { id: 'nextStep', label: 'Następny krok', sortable: false },
];

export const papaReportColumns: readonly DataColumn[] = [
  { id: 'title', label: 'Raport', sortable: true, width: 280 },
  { id: 'statusLabel', label: 'Status', sortable: true },
  { id: 'formats', label: 'Formaty', sortable: false },
  { id: 'owner', label: 'Właściciel', sortable: true },
  { id: 'generatedAt', label: 'Wygenerowano', sortable: true },
];

const generatedAt = '2026-08-14T10:40:00+02:00';

const contextItems: readonly PapaContextItem[] = [
  { confidence: 0.92, id: 'papa-context-margin', kind: 'metric', label: 'Marża brutto MTD', retention: '30 dni', source: 'orders.daily_fact' },
  { confidence: 0.86, id: 'papa-context-campaigns', kind: 'record', label: 'Koszty kampanii częściowe', retention: '14 dni', source: 'Google Ads' },
  { confidence: 0.81, id: 'papa-context-segment', kind: 'segment', label: 'Klienci powracający z ryzykiem odejścia', retention: '30 dni', source: 'CRM' },
  { confidence: 0.88, id: 'papa-context-decision', kind: 'decision', label: 'Decyzja budżetowa Q3', retention: '90 dni', source: 'Kolejka decyzji' },
];

const evidence: readonly PapaEvidenceItem[] = [
  { claim: 'Wzrost kosztu kliknięcia obniża ROAS w Google Ads.', confidence: 0.86, freshnessAt: '2026-08-14T09:30:00+02:00', id: 'papa-evidence-roas', source: 'Google Ads + zamówienia' },
  { claim: 'Segment klientów powracających utrzymuje wyższą marżę mimo niższego wolumenu.', confidence: 0.82, freshnessAt: '2026-08-14T08:50:00+02:00', id: 'papa-evidence-repeat', source: 'CRM + Shopify' },
  { claim: 'Niepełne koszty kampanii ograniczają pewność rekomendacji.', confidence: 0.78, freshnessAt: '2026-08-14T08:36:00+02:00', id: 'papa-evidence-gap', source: 'Jakość danych' },
];

const decisions: readonly PapaDecision[] = [
  { dueAt: '2026-08-14T16:00:00+02:00', id: 'papa-decision-budget', impact: 'high', owner: 'Media płatne', status: 'review', title: 'Przesunięcie budżetu do kampanii brand search' },
  { dueAt: '2026-08-15T11:00:00+02:00', id: 'papa-decision-retention', impact: 'medium', owner: 'CRM', status: 'new', title: 'Test oferty dla klientów powracających' },
];

const actions: readonly PapaActionRecord[] = [
  { id: 'papa-action-budget', label: 'Przygotuj zmianę budżetu Google Ads', operationId: 'papa.action-approval.read', owner: 'Media płatne', risk: 'high', status: 'approval' },
  { id: 'papa-action-brief', label: 'Wygeneruj brief dla CRM', operationId: 'papa.actions.read', owner: 'CRM', risk: 'medium', status: 'ready' },
  { id: 'papa-action-export', label: 'Eksportuj dane klientów do modelu', operationId: null, owner: 'Bezpieczeństwo', risk: 'high', status: 'blocked' },
  { id: 'papa-action-note', label: 'Zapisz obserwację do decyzji', operationId: 'papa.proposals.read', owner: 'Operacje', risk: 'low', status: 'draft' },
];

const modeRecords: readonly PapaModeRecord[] = [
  { allowedUse: 'Wyjaśnienie metryki i wskazanie źródeł', blockedUse: 'Automatyczna zmiana budżetu', id: 'papa-mode-read', mode: 'Czytaj', requiresApproval: 'Nie' },
  { allowedUse: 'Przygotowanie rekomendacji do kolejki', blockedUse: 'Samodzielne zatwierdzenie decyzji', id: 'papa-mode-recommend', mode: 'Rekomenduj', requiresApproval: 'Tak' },
  { allowedUse: 'Projekt akcji z wpływem i ryzykiem', blockedUse: 'Samodzielne wykonanie bez zgody', id: 'papa-mode-draft', mode: 'Przygotuj akcję', requiresApproval: 'Tak' },
  { allowedUse: 'Analiza offline na danych z pamięci podręcznej', blockedUse: 'Mutacje i eksport danych osobowych', id: 'papa-mode-offline', mode: 'Offline', requiresApproval: 'Nie dotyczy' },
];

const memory: readonly PapaMemoryRecord[] = [
  { event: 'Odpowiedź o marży MTD', id: 'papa-memory-margin', retention: '30 dni', source: 'Historia odpowiedzi', timestamp: '2026-08-14T09:44:00+02:00' },
  { event: 'Kontekst kampanii zapisany do koszyka', id: 'papa-memory-context', retention: '14 dni', source: 'Koszyk kontekstu', timestamp: '2026-08-14T09:12:00+02:00' },
  { event: 'Propozycja budżetu przekazana do przeglądu', id: 'papa-memory-decision', retention: '90 dni', source: 'Kolejka decyzji', timestamp: '2026-08-13T16:20:00+02:00' },
];

const sources: readonly DataSourceRef[] = [
  { completeness: 0.992, dataset: 'orders', lastSyncAt: '2026-08-14T09:42:00+02:00', provider: 'Shopify' },
  { completeness: 0.947, dataset: 'campaign_costs', lastSyncAt: '2026-08-14T08:36:00+02:00', provider: 'Google Ads' },
  { completeness: 0.884, dataset: 'customers', lastSyncAt: '2026-08-13T21:18:00+02:00', provider: 'CRM' },
];

const statuses: readonly PapaAssistantStatus[] = [
  {
    description: 'Kontekst jest spójny, ale niepełne koszty kampanii obniżają poziom automatyzacji.',
    evidenceIds: ['papa-evidence-gap'],
    id: 'papa-status-readiness',
    metric: 'Gotowość',
    owner: 'Papa Asystent',
    state: 'attention',
    title: 'Gotowość odpowiedzi',
    updatedAt: '2026-08-14T10:40:00+02:00',
    value: 'Częściowa',
  },
  {
    description: 'Dowody sprzedażowe i marżowe są świeże oraz połączone ze źródłami danych.',
    evidenceIds: ['papa-evidence-repeat', 'papa-evidence-roas'],
    id: 'papa-status-evidence',
    metric: 'Dowody',
    owner: 'Analityka danych',
    state: 'ready',
    title: 'Dowody i pochodzenie',
    updatedAt: '2026-08-14T09:42:00+02:00',
    value: '3 źródła',
  },
  {
    description: 'Rekomendacje budżetowe wymagają zatwierdzenia, zanim trafią do systemów kampanii.',
    evidenceIds: ['papa-evidence-roas'],
    id: 'papa-status-approval',
    metric: 'Akcje',
    owner: 'Media płatne',
    state: 'learning',
    title: 'Akceptacja działań',
    updatedAt: '2026-08-14T10:22:00+02:00',
    value: '2 do decyzji',
  },
  {
    description: 'Eksport danych klientów do modelu pozostaje zablokowany do zgody bezpieczeństwa.',
    evidenceIds: ['papa-evidence-gap'],
    id: 'papa-status-governance',
    metric: 'Ryzyko',
    owner: 'Bezpieczeństwo',
    state: 'blocked',
    title: 'Granice prywatności',
    updatedAt: '2026-08-14T10:12:00+02:00',
    value: '1 blokada',
  },
];

const recommendations: readonly PapaRecommendationRecord[] = [
  {
    effort: 'medium',
    evidenceIds: ['papa-evidence-roas', 'papa-evidence-gap'],
    id: 'papa-rec-brand-search',
    impact: 'high',
    nextStep: 'Przekaż do akceptacji budżetu i zachowaj dowody ROAS.',
    owner: 'Media płatne',
    risk: 'medium',
    status: 'needs-approval',
    summary: 'Przesuń część budżetu do kampanii brand search, ale wykonanie zostaw w kolejce akceptacji.',
    title: 'Przesuń budżet do kampanii o wyższej intencji',
  },
  {
    effort: 'low',
    evidenceIds: ['papa-evidence-repeat'],
    id: 'papa-rec-retention',
    impact: 'medium',
    nextStep: 'Wygeneruj brief CRM i dołącz segment klientów powracających.',
    owner: 'CRM',
    risk: 'low',
    status: 'recommended',
    summary: 'Uruchom wariant oferty dla klientów powracających, bo segment utrzymuje marżę przy niższym wolumenie.',
    title: 'Test retencyjny dla klientów powracających',
  },
  {
    effort: 'medium',
    evidenceIds: ['papa-evidence-gap'],
    id: 'papa-rec-cost-quality',
    impact: 'medium',
    nextStep: 'Sprawdź mapowanie kosztów kampanii przed automatyzacją kolejnych wniosków.',
    owner: 'Analityka danych',
    risk: 'high',
    status: 'blocked',
    summary: 'Najpierw domknij brakujące koszty reklamowe, ponieważ obniżają pewność każdej rekomendacji budżetowej.',
    title: 'Domknij jakość danych kampanii',
  },
];

const chatMessages: readonly PapaChatMessage[] = [
  {
    author: 'user',
    body: 'Co wymaga decyzji człowieka przed zmianą budżetu?',
    createdAt: '2026-08-14T10:01:00+02:00',
    evidenceIds: [],
    id: 'papa-chat-user-budget',
  },
  {
    author: 'assistant',
    body: 'Zmiana budżetu kampanii wymaga akceptacji, bo koszty kampanii są częściowe. Papa może przygotować rekomendację i dowody, ale nie wykona mutacji samodzielnie.',
    createdAt: '2026-08-14T10:01:14+02:00',
    evidenceIds: ['papa-evidence-roas', 'papa-evidence-gap'],
    id: 'papa-chat-assistant-budget',
  },
  {
    author: 'system',
    body: 'Wątek zachowuje conversationId między panelem Papa i Laboratorium AI.',
    createdAt: '2026-08-14T10:02:00+02:00',
    evidenceIds: [],
    id: 'papa-chat-system-conversation',
  },
];

const elementThreads: readonly PapaElementThread[] = [
  {
    elementId: 'papa-context-margin',
    elementKind: 'metric',
    elementLabel: 'Marża brutto MTD',
    messages: [
      {
        author: 'assistant',
        body: 'Marża rośnie dzięki klientom powracającym. Wniosek jest mocny, bo łączy zamówienia z CRM.',
        contextItemId: 'papa-context-margin',
        createdAt: '2026-08-14T10:03:20+02:00',
        evidenceIds: ['papa-evidence-repeat'],
        id: 'papa-element-margin-answer',
      },
    ],
    status: 'ready',
  },
  {
    elementId: 'papa-context-campaigns',
    elementKind: 'record',
    elementLabel: 'Koszty kampanii częściowe',
    messages: [
      {
        author: 'assistant',
        body: 'Ten element ogranicza pewność rekomendacji. Najpierw trzeba potwierdzić kompletność kosztów Google Ads.',
        contextItemId: 'papa-context-campaigns',
        createdAt: '2026-08-14T10:04:10+02:00',
        evidenceIds: ['papa-evidence-gap'],
        id: 'papa-element-campaigns-answer',
      },
    ],
    status: 'partial',
  },
  {
    elementId: 'papa-action-export',
    elementKind: 'action',
    elementLabel: 'Eksport danych klientów do modelu',
    messages: [
      {
        author: 'assistant',
        body: 'Eksport jest zablokowany bez osobnej zgody bezpieczeństwa i maskowania danych.',
        contextItemId: 'papa-action-export',
        createdAt: '2026-08-14T10:05:05+02:00',
        evidenceIds: ['papa-evidence-gap'],
        id: 'papa-element-export-answer',
      },
    ],
    status: 'blocked',
  },
];

const labExperiments: readonly PapaLabExperiment[] = [
  {
    baseline: 3.1,
    confidence: 0.84,
    hypothesis: 'Brand search poprawi konwersję bez podnoszenia ryzyka utraty marży.',
    id: 'papa-lab-brand-search',
    name: 'Budżet brand search',
    nextStep: 'Zatwierdź test budżetu w kolejce decyzji.',
    owner: 'Media płatne',
    reportId: 'papa-report-weekly',
    status: 'completed',
    variant: 3.6,
  },
  {
    baseline: 36,
    confidence: 0.82,
    hypothesis: 'Oferta retencyjna utrzyma marżę klientów powracających.',
    id: 'papa-lab-retention',
    name: 'Oferta retencyjna CRM',
    nextStep: 'Wygeneruj brief i listę segmentów bez eksportu PII.',
    owner: 'CRM',
    reportId: 'papa-report-retention',
    status: 'running',
    variant: 39,
  },
  {
    baseline: 94,
    confidence: 0.68,
    hypothesis: 'Kompletność kosztów reklamowych podniesie pewność rekomendacji powyżej progu akceptacji.',
    id: 'papa-lab-cost-quality',
    name: 'Jakość kosztów kampanii',
    nextStep: 'Uzupełnij mapowanie kosztów przed generacją działań.',
    owner: 'Analityka danych',
    reportId: 'papa-report-data-quality',
    status: 'paused',
    variant: 98,
  },
];

const reports: readonly PapaReportArtifact[] = [
  {
    datasets: ['orders.daily_fact', 'campaign_costs', 'recommendations'],
    description: 'Podsumowanie rekomendacji, dowodów, ryzyka i decyzji do zatwierdzenia.',
    formats: ['pdf', 'csv'],
    generatedAt: '2026-08-14T10:40:00+02:00',
    id: 'papa-report-weekly',
    owner: 'Papa Asystent',
    status: 'ready',
    title: 'Raport decyzji Papa',
  },
  {
    datasets: ['crm_segments', 'orders.daily_fact'],
    description: 'Wyniki wariantu CRM, segmenty, dowody i następne kroki dla zespołu retencji.',
    formats: ['pdf', 'csv'],
    generatedAt: '2026-08-14T10:18:00+02:00',
    id: 'papa-report-retention',
    owner: 'CRM',
    status: 'ready',
    title: 'Raport eksperymentu retencyjnego',
  },
  {
    datasets: ['campaign_costs', 'data_quality_rules'],
    description: 'Lista braków danych, wpływ na poziom pewności i zalecane naprawy integracji.',
    formats: ['csv'],
    generatedAt: '2026-08-14T08:36:00+02:00',
    id: 'papa-report-data-quality',
    owner: 'Analityka danych',
    status: 'stale',
    title: 'Raport jakości danych AI',
  },
];

const assistantTrend: readonly PapaAssistantTrendDatum[] = [
  { actual: 72, label: '01 sie', movingAverage: 71, plan: 70 },
  { actual: 76, label: '04 sie', movingAverage: 73, plan: 72 },
  { actual: 81, label: '07 sie', movingAverage: 77, plan: 75 },
  { actual: 84, label: '10 sie', movingAverage: 80, plan: 78 },
  { actual: 86, label: '14 sie', movingAverage: 83, plan: 82 },
];

export function findPapaScreenDefinition(
  idOrRoute: string,
): PapaScreenDefinition | null {
  const normalized = idOrRoute.split('?')[0] ?? idOrRoute;
  return papaScreenDefinitions.find((definition) => (
    definition.id === idOrRoute
    || definition.routeBase === normalized
  )) ?? null;
}

export function getPapaNavigation() {
  return papaScreenDefinitions
    .filter((definition) => definition.routeBase !== null)
    .map((definition) => ({
      href: definition.routeBase ?? '/app/papa/panel-kontekstowy-papa',
      id: definition.id,
      label: definition.displayTitle,
    }));
}

export function createPapaStorybookData(): PapaWorkspaceData {
  return {
    context: {
      locale: 'pl',
      range: { from: '2026-08-01', preset: 'monthToDate', timezone: 'Europe/Warsaw', to: '2026-08-14' },
      tenantId: 'tenant-papadata-demo',
      userId: 'user-papa',
      workspaceId: 'workspace-commerce-pl',
    },
    actions,
    assistantTrend,
    chatMessages,
    contextItems,
    decisions,
    elementThreads,
    evidence,
    generatedAt,
    labExperiments,
    memory,
    modeRecords,
    recommendations,
    reports,
    sources,
    statuses,
    summary: {
      confidence: 0.84,
      contextItems: contextItems.length,
      decisionsDue: decisions.length,
      evidenceCount: evidence.length,
      readiness: 'partial',
    },
  };
}

export function papaActionRows(
  records: readonly PapaActionRecord[],
): readonly DataRow[] {
  return records.map((record) => ({
    id: record.id,
    label: record.label,
    operationId: record.operationId ? 'Wymaga zatwierdzenia' : 'Zablokowane',
    owner: record.owner,
    risk: record.risk,
    riskLabel: resolveRiskLabel(record.risk),
    status: record.status,
    statusLabel: resolveActionStatusLabel(record.status),
  }));
}

export function papaMemoryRows(
  records: readonly PapaMemoryRecord[],
): readonly DataRow[] {
  return records.map((record) => ({
    event: record.event,
    id: record.id,
    retention: record.retention,
    source: record.source,
    timestamp: formatDateTime(record.timestamp),
  }));
}

export function papaContextRows(
  records: readonly PapaContextItem[],
): readonly DataRow[] {
  return records.map((record) => ({
    confidence: formatPercent(record.confidence),
    id: record.id,
    kind: record.kind,
    kindLabel: resolveContextKindLabel(record.kind),
    label: record.label,
    retention: record.retention,
    source: record.source,
  }));
}

export function papaEvidenceRows(
  records: readonly PapaEvidenceItem[],
): readonly DataRow[] {
  return records.map((record) => ({
    claim: record.claim,
    confidence: formatPercent(record.confidence),
    freshnessAt: formatDateTime(record.freshnessAt),
    id: record.id,
    source: record.source,
  }));
}

export function papaModeRows(
  records: readonly PapaModeRecord[],
): readonly DataRow[] {
  return records.map((record) => ({
    allowedUse: record.allowedUse,
    blockedUse: record.blockedUse,
    id: record.id,
    mode: record.mode,
    requiresApproval: record.requiresApproval,
  }));
}

export function papaLabExperimentRows(
  records: readonly PapaLabExperiment[],
): readonly DataRow[] {
  return records.map((record) => ({
    confidence: record.confidence === null ? 'Brak danych' : formatPercent(record.confidence),
    id: record.id,
    name: record.name,
    nextStep: record.nextStep,
    owner: record.owner,
    status: record.status,
    statusLabel: resolveLabStatusLabel(record.status),
    uplift: record.variant === null || record.baseline === null
      ? 'Brak danych'
      : formatSignedNumber(record.variant - record.baseline),
  }));
}

export function papaReportRows(
  records: readonly PapaReportArtifact[],
): readonly DataRow[] {
  return records.map((record) => ({
    formats: record.formats.map((format) => format.toUpperCase()).join(', '),
    generatedAt: formatDateTime(record.generatedAt),
    id: record.id,
    owner: record.owner,
    status: record.status,
    statusLabel: resolveReportStatusLabel(record.status),
    title: record.title,
  }));
}

export function papaEvidenceRefs(
  records: readonly PapaEvidenceItem[],
): readonly EvidenceRef[] {
  return records.map((record) => ({
    confidence: record.confidence,
    id: record.id,
    label: record.claim,
    source: record.source,
  }));
}

export function resolvePapaDecisionCardStatus(
  status: PapaDecision['status'],
): 'approved' | 'rejected' | 'measured' | 'proposed' | 'executing' {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'rejected':
    case 'dismissed':
      return 'rejected';
    case 'review':
    case 'executing':
    case 'monitoring':
      return 'executing';
    case 'resolved':
      return 'measured';
    case 'scheduled':
    case 'new':
    default:
      return 'proposed';
  }
}

function resolveContextKindLabel(
  kind: PapaContextItem['kind'],
): string {
  switch (kind) {
    case 'decision':
      return 'Decyzja';
    case 'metric':
      return 'Metryka';
    case 'record':
      return 'Rekord';
    case 'segment':
    default:
      return 'Segment';
  }
}

function resolveActionStatusLabel(
  status: PapaActionRecord['status'],
): string {
  switch (status) {
    case 'approval':
      return 'Do akceptacji';
    case 'blocked':
      return 'Zablokowane';
    case 'ready':
      return 'Gotowe';
    case 'draft':
    default:
      return 'Szkic';
  }
}

function resolveRiskLabel(
  risk: PapaActionRecord['risk'],
): string {
  switch (risk) {
    case 'high':
      return 'Wysokie';
    case 'medium':
      return 'Średnie';
    case 'low':
      return 'Niskie';
    case 'unknown':
    default:
      return 'Nieznane';
  }
}

function resolveLabStatusLabel(
  status: PapaLabExperiment['status'],
): string {
  switch (status) {
    case 'cancelled':
      return 'Anulowany';
    case 'completed':
      return 'Zakończony';
    case 'draft':
      return 'Szkic';
    case 'paused':
      return 'Wstrzymany';
    case 'running':
    default:
      return 'W toku';
  }
}

function resolveReportStatusLabel(
  status: PapaReportArtifact['status'],
): string {
  switch (status) {
    case 'building':
      return 'Budowany';
    case 'stale':
      return 'Nieświeży';
    case 'ready':
    default:
      return 'Gotowy';
  }
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(value);
}

function formatSignedNumber(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    signDisplay: 'always',
  }).format(value);
}
