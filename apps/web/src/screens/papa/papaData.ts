import type {
  DataColumn,
  DataRow,
} from '../../../../../contracts/component-shared';
import type {
  DataSourceRef,
  EvidenceRef,
  ReadinessState,
  WorkspaceContext,
} from '../../../../../contracts/ui-contract-types';

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
  readonly documentPath: string;
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
  readonly status: 'new' | 'review' | 'approved' | 'rejected';
  readonly impact: 'low' | 'medium' | 'high';
  readonly dueAt: string;
};

export type PapaActionRecord = {
  readonly id: string;
  readonly label: string;
  readonly owner: string;
  readonly status: 'draft' | 'approval' | 'blocked' | 'ready';
  readonly operationId: string | null;
  readonly risk: 'low' | 'medium' | 'high';
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

export type PapaWorkspaceData = {
  readonly generatedAt: string;
  readonly context: WorkspaceContext;
  readonly contextItems: readonly PapaContextItem[];
  readonly actions: readonly PapaActionRecord[];
  readonly decisions: readonly PapaDecision[];
  readonly evidence: readonly PapaEvidenceItem[];
  readonly memory: readonly PapaMemoryRecord[];
  readonly modeRecords: readonly PapaModeRecord[];
  readonly sources: readonly DataSourceRef[];
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
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-01-panel-kontekstowy-papa.md',
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
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-02-assistantshell.md',
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
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-03-tryby-pracy.md',
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
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-04-context-basket.md',
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
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-05-odpowiedz-papa.md',
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
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-06-dowody.md',
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
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-07-confidence.md',
    id: '50.07',
    operationId: null,
    route: null,
    routeBase: null,
    summary: 'Polityka poziomu pewności dla Papa bez ścieżki aplikacyjnej i bez fikcyjnego endpointu.',
    variant: 'confidence',
  },
  {
    apiPath: '/api/v1/papa/laboratorium-ai',
    displayTitle: 'Laboratorium AI',
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-08-laboratorium-ai.md',
    id: '50.08',
    operationId: 'papa.lab.read',
    route: '/app/papa/laboratorium-ai',
    routeBase: '/app/papa/laboratorium-ai',
    summary: 'Eksperymenty AI w trybie odczytu z kontekstem, dowodami i ochroną przed mutacjami.',
    variant: 'lab',
  },
  {
    apiPath: '/api/v1/papa/obserwacje',
    displayTitle: 'Obserwacje',
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-09-obserwacje.md',
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
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-10-rekomendacje-i-warianty.md',
    id: '50.10',
    operationId: null,
    route: null,
    routeBase: null,
    summary: 'Storybookowa macierz rekomendacji i wariantów bez fikcyjnej operacji zapisu.',
    variant: 'recommendation-variants',
  },
  {
    apiPath: '/api/v1/papa/propozycje-ai',
    displayTitle: 'Propozycje AI',
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-11-propozycje-ai.md',
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
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-12-ai-action-approval.md',
    id: '50.12',
    operationId: 'papa.action-approval.read',
    route: '/app/papa/ai-action-approval',
    routeBase: '/app/papa/ai-action-approval',
    summary: 'Powierzchnia akceptacji działań AI z ryzykiem, dowodami i blokadą pozornych mutacji.',
    variant: 'action-approval',
  },
  {
    apiPath: '/api/v1/papa/ai-actions',
    displayTitle: 'Działania AI',
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-13-ai-actions.md',
    id: '50.13',
    operationId: 'papa.actions.read',
    route: '/app/papa/ai-actions',
    routeBase: '/app/papa/ai-actions',
    summary: 'Rejestr działań AI z kontraktem operacji, statusem i zespołem odpowiedzialnym.',
    variant: 'actions',
  },
  {
    apiPath: null,
    displayTitle: 'Zablokowane działania AI',
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-14-zablokowane-dzialania-ai.md',
    id: '50.14',
    operationId: null,
    route: null,
    routeBase: null,
    summary: 'Polityka zablokowanych działań AI bez ścieżki aplikacyjnej i bez fikcyjnego endpointu.',
    variant: 'blocked-actions',
  },
  {
    apiPath: '/api/v1/papa/historia-i-pamiec-papa',
    displayTitle: 'Historia i pamięć Papa',
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-15-historia-i-pamiec-papa.md',
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
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-16-ustawienia-ai-i-governance.md',
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
    documentPath: '15-papa-asystent-i-laboratorium-ai/50-17-warianty-papa.md',
    id: '50.17',
    operationId: null,
    route: null,
    routeBase: null,
    summary: 'Storybookowa macierz wariantów Papa bez ścieżki aplikacyjnej i bez fikcyjnej operacji zapisu.',
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
  { id: 'operationId', label: 'Operacja', sortable: true },
];

export const papaMemoryColumns: readonly DataColumn[] = [
  { id: 'event', label: 'Zdarzenie', sortable: true, width: 280 },
  { id: 'source', label: 'Źródło', sortable: true },
  { id: 'retention', label: 'Retencja', sortable: true },
  { id: 'timestamp', label: 'Czas', sortable: true },
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
  { allowedUse: 'Projekt akcji z wpływem i ryzykiem', blockedUse: 'Wykonanie mutacji bez kontraktu operacji', id: 'papa-mode-draft', mode: 'Przygotuj akcję', requiresApproval: 'Tak' },
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
    contextItems,
    decisions,
    evidence,
    generatedAt,
    memory,
    modeRecords,
    sources,
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
    operationId: record.operationId ? 'osobny kontrakt' : 'brak - zablokowane',
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
    default:
      return 'Niskie';
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
