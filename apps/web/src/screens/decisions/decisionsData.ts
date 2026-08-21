import type {
  DataColumn,
  DataRow,
} from '../../../../../contracts/component-shared';

export type DecisionsScreenId =
  | '80.01'
  | '80.02'
  | '80.03'
  | '80.04'
  | '80.05'
  | '80.06'
  | '80.07'
  | '80.08'
  | '80.09'
  | '80.10';

export type DecisionsScreenVariant =
  | 'center'
  | 'observations'
  | 'recommendations'
  | 'registry'
  | 'action-brief'
  | 'action-detail'
  | 'measurement'
  | 'action-library'
  | 'relations'
  | 'decision-variants';

export type DecisionsScreenDefinition = {
  readonly apiPath: `/api/v1/${string}` | null;
  readonly displayTitle: string;
  readonly id: DecisionsScreenId;
  readonly operationId: string | null;
  readonly route: `/app/${string}` | null;
  readonly routeBase: `/app/${string}` | null;
  readonly summary: string;
  readonly variant: DecisionsScreenVariant;
};

export type DecisionsWorkspaceData = {
  readonly generatedAt: string;
  readonly kpis: readonly {
    readonly hint: string;
    readonly label: string;
    readonly value: string;
  }[];
  readonly decisionQueue: readonly {
    readonly detail: string;
    readonly due: string;
    readonly id: string;
    readonly impact: string;
    readonly priority: 'critical' | 'high' | 'low' | 'medium';
    readonly status: string;
    readonly title: string;
  }[];
  readonly observationRows: readonly DataRow[];
  readonly recommendationRows: readonly DataRow[];
  readonly registryRows: readonly DataRow[];
  readonly actionRows: readonly DataRow[];
  readonly measurementRows: readonly DataRow[];
  readonly relationRows: readonly DataRow[];
  readonly variantRows: readonly DataRow[];
};

export const decisionsScreenDefinitions: readonly DecisionsScreenDefinition[] = [
  {
    apiPath: '/api/v1/decisions/centrum-decyzji',
    displayTitle: 'Centrum decyzji',
    id: '80.01',
    operationId: 'decisions.center.read',
    route: '/app/decisions/centrum-decyzji',
    routeBase: '/app/decisions/centrum-decyzji',
    summary: 'Priorytety marketingowe, kolejka decyzji i wpływ rekomendacji na KPI.',
    variant: 'center',
  },
  {
    apiPath: '/api/v1/decisions/obserwacje',
    displayTitle: 'Obserwacje',
    id: '80.02',
    operationId: 'decisions.observations.read',
    route: '/app/decisions/obserwacje',
    routeBase: '/app/decisions/obserwacje',
    summary: 'Obserwacje z danych, pewność, źródła i powiązane działania.',
    variant: 'observations',
  },
  {
    apiPath: '/api/v1/decisions/rekomendacje',
    displayTitle: 'Rekomendacje',
    id: '80.03',
    operationId: 'decisions.rekomendacje.read',
    route: '/app/decisions/rekomendacje',
    routeBase: '/app/decisions/rekomendacje',
    summary: 'Rekomendacje do działań z opisem wpływu, ryzyka i wymaganej akceptacji.',
    variant: 'recommendations',
  },
  {
    apiPath: '/api/v1/decisions/rejestr-decyzji',
    displayTitle: 'Rejestr decyzji',
    id: '80.04',
    operationId: 'decisions.registry.read',
    route: '/app/decisions/rejestr-decyzji',
    routeBase: '/app/decisions/rejestr-decyzji',
    summary: 'Historia decyzji, właściciel, status, uzasadnienie i ślad dowodowy.',
    variant: 'registry',
  },
  {
    apiPath: '/api/v1/decisions/brief-dzialania',
    displayTitle: 'Plan działania',
    id: '80.05',
    operationId: 'decisions.action-brief.read',
    route: '/app/decisions/brief-dzialania',
    routeBase: '/app/decisions/brief-dzialania',
    summary: 'Brief działania marketingowego z celem, hipotezą, ownerem i warunkami startu.',
    variant: 'action-brief',
  },
  {
    apiPath: '/api/v1/decisions/szczegoly-dzialania',
    displayTitle: 'Szczegóły działania',
    id: '80.06',
    operationId: 'decisions.action-detail.read',
    route: '/app/decisions/szczegoly-dzialania/act-001',
    routeBase: '/app/decisions/szczegoly-dzialania',
    summary: 'Szczegóły działania, zależności, checklista wykonania i wynik po publikacji.',
    variant: 'action-detail',
  },
  {
    apiPath: '/api/v1/decisions/pomiar',
    displayTitle: 'Pomiar',
    id: '80.07',
    operationId: 'decisions.measurement.read',
    route: '/app/decisions/pomiar',
    routeBase: '/app/decisions/pomiar',
    summary: 'Pomiar efektu decyzji, baseline, wynik, confidence i źródła danych.',
    variant: 'measurement',
  },
  {
    apiPath: '/api/v1/decisions/biblioteka-dzialan',
    displayTitle: 'Biblioteka działań',
    id: '80.08',
    operationId: 'decisions.action-library.read',
    route: '/app/decisions/biblioteka-dzialan',
    routeBase: '/app/decisions/biblioteka-dzialan',
    summary: 'Biblioteka powtarzalnych działań marketingowych z guardrailami i wymaganiami danych.',
    variant: 'action-library',
  },
  {
    apiPath: '/api/v1/decisions/powiazania-z-modulami-i-sprawami',
    displayTitle: 'Powiązania z modułami',
    id: '80.09',
    operationId: 'decisions.relations.read',
    route: '/app/decisions/powiazania-z-modulami-i-sprawami',
    routeBase: '/app/decisions/powiazania-z-modulami-i-sprawami',
    summary: 'Powiązania decyzji z kampaniami, segmentami, produktami i sprawami operacyjnymi.',
    variant: 'relations',
  },
  {
    apiPath: null,
    displayTitle: 'Warianty',
    id: '80.10',
    operationId: null,
    route: null,
    routeBase: null,
    summary: 'Zestaw stanów decyzji: szkic, do zatwierdzenia, zablokowana, zmierzona i zarchiwizowana.',
    variant: 'decision-variants',
  },
] as const;

export const decisionsNavigationItems = decisionsScreenDefinitions.map((definition) => ({
  href: definition.routeBase ?? '/app/decisions/centrum-decyzji',
  id: definition.id,
  label: definition.displayTitle,
}));

export const observationColumns: readonly DataColumn[] = [
  { id: 'signal', label: 'Obserwacja', sortable: true, width: 260 },
  { id: 'source', label: 'Źródło', sortable: true },
  { align: 'right', id: 'confidence', label: 'Pewność', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
];

export const recommendationColumns: readonly DataColumn[] = [
  { id: 'recommendation', label: 'Rekomendacja', sortable: true, width: 280 },
  { id: 'impact', label: 'Wpływ', sortable: true },
  { id: 'risk', label: 'Ryzyko', sortable: true },
  { id: 'approval', label: 'Akceptacja', sortable: true },
];

export const registryColumns: readonly DataColumn[] = [
  { id: 'decision', label: 'Decyzja', sortable: true, width: 260 },
  { id: 'owner', label: 'Owner', sortable: true },
  { id: 'date', label: 'Data', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
];

export const actionColumns: readonly DataColumn[] = [
  { id: 'action', label: 'Działanie', sortable: true, width: 260 },
  { id: 'channel', label: 'Kanał', sortable: true },
  { id: 'guardrail', label: 'Guardrail', sortable: true },
  { id: 'state', label: 'Stan', sortable: true },
];

export const measurementColumns: readonly DataColumn[] = [
  { id: 'metric', label: 'Metryka', sortable: true, width: 220 },
  { align: 'right', id: 'baseline', label: 'Baseline', sortable: true },
  { align: 'right', id: 'result', label: 'Wynik', sortable: true },
  { id: 'confidence', label: 'Confidence', sortable: true },
];

export const relationColumns: readonly DataColumn[] = [
  { id: 'object', label: 'Obiekt', sortable: true, width: 240 },
  { id: 'module', label: 'Moduł', sortable: true },
  { id: 'relation', label: 'Relacja', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
];

export const decisionVariantColumns: readonly DataColumn[] = [
  { id: 'variant', label: 'Wariant', sortable: true, width: 240 },
  { id: 'state', label: 'Stan', sortable: true },
  { id: 'risk', label: 'Ryzyko', sortable: true },
  { id: 'evidence', label: 'Dowód', sortable: true },
];

export function findDecisionsScreenDefinition(path: string): DecisionsScreenDefinition | null {
  const normalizedPath = path === '/app/decisions'
    ? '/app/decisions/centrum-decyzji'
    : path;

  return decisionsScreenDefinitions.find((definition) => (
    Boolean(definition.routeBase)
    && (
      normalizedPath === definition.routeBase
      || normalizedPath.startsWith(`${definition.routeBase}/`)
    )
  )) ?? decisionsScreenDefinitions[0] ?? null;
}

export function createDecisionsStorybookData(): DecisionsWorkspaceData {
  return {
    generatedAt: '2026-08-14T12:00:00Z',
    kpis: [
      { label: 'Otwarte decyzje', value: '12', hint: '3 wymagają ownera' },
      { label: 'Potencjalny wpływ', value: '+184 tys. PLN', hint: 'Modelowany uplift 30 dni' },
      { label: 'Confidence', value: '82%', hint: 'Dane kompletne dla 7 z 9 źródeł' },
      { label: 'Zmierzone wyniki', value: '5', hint: '2 wyniki nadal w oknie pomiaru' },
    ],
    decisionQueue: [
      {
        detail: 'Budżet kampanii brandowej przekracza plan, a ROAS spada poniżej progu.',
        due: 'dziś',
        id: 'decision-budget',
        impact: '+42 tys. PLN',
        priority: 'critical',
        status: 'Approval',
        title: 'Korekta budżetu Google Ads',
      },
      {
        detail: 'Segment klientów powracających ma wysoki potencjał cross-sell po ostatniej dostawie.',
        due: '48 h',
        id: 'decision-segment',
        impact: '+31 tys. PLN',
        priority: 'high',
        status: 'Do decyzji',
        title: 'Aktywuj segment powracających',
      },
      {
        detail: 'Niespójność danych kosztu reklam blokuje pełny pomiar wyniku.',
        due: '3 dni',
        id: 'decision-data',
        impact: 'Ryzyko pomiaru',
        priority: 'medium',
        status: 'Czeka na dane',
        title: 'Uzupełnij koszt Meta Ads',
      },
    ],
    observationRows: [
      { id: 'obs-1', confidence: '88%', signal: 'Spadek ROAS kampanii brandowej', source: 'Google Ads + Orders', status: 'Potwierdzona' },
      { id: 'obs-2', confidence: '76%', signal: 'Wzrost koszyka w segmencie returning', source: 'Customers', status: 'Do decyzji' },
      { id: 'obs-3', confidence: '64%', signal: 'Nieciągłość eventów GA4', source: 'Traffic', status: 'Wymaga danych' },
    ],
    recommendationRows: [
      { id: 'rec-1', approval: 'Wymaga ownera', impact: '+42 tys. PLN', recommendation: 'Przesuń 18% budżetu do kampanii non-brand', risk: 'Średnie' },
      { id: 'rec-2', approval: 'Step-up', impact: '+31 tys. PLN', recommendation: 'Uruchom cross-sell dla returning customers', risk: 'Niskie' },
      { id: 'rec-3', approval: 'Blocked', impact: 'Ryzyko pomiaru', recommendation: 'Wstrzymaj decyzje zależne od Meta Ads', risk: 'Wysokie' },
    ],
    registryRows: [
      { id: 'reg-1', date: '2026-08-12', decision: 'Zwiększ budżet kampanii produktowej', owner: 'Growth', status: 'Zmierzone' },
      { id: 'reg-2', date: '2026-08-10', decision: 'Wyłącz zestaw reklam o niskim ROAS', owner: 'Marketing', status: 'W toku' },
      { id: 'reg-3', date: '2026-08-08', decision: 'Przetestuj próg darmowej dostawy', owner: 'Commerce', status: 'Oczekuje wyniku' },
    ],
    actionRows: [
      { id: 'act-1', action: 'Zmiana budżetu kampanii', channel: 'Google Ads', guardrail: 'Approval + budget cap', state: 'Gotowe do akceptacji' },
      { id: 'act-2', action: 'Segment cross-sell', channel: 'Email/CRM', guardrail: 'Consent check', state: 'Projekt' },
      { id: 'act-3', action: 'Pauza kampanii', channel: 'Meta Ads', guardrail: 'Measurement lock', state: 'Zablokowane' },
    ],
    measurementRows: [
      { id: 'mea-1', baseline: '3,1x', confidence: 'Wysokie', metric: 'ROAS', result: '3,8x' },
      { id: 'mea-2', baseline: '126 PLN', confidence: 'Średnie', metric: 'CAC', result: '112 PLN' },
      { id: 'mea-3', baseline: '4,4%', confidence: 'Niskie', metric: 'CVR', result: '4,7%' },
    ],
    relationRows: [
      { id: 'rel-1', module: 'Kampanie płatne', object: 'Google Ads / Brand', relation: 'Źródło rekomendacji', status: 'Aktywne' },
      { id: 'rel-2', module: 'Klienci', object: 'Returning segment', relation: 'Segment docelowy', status: 'Aktywne' },
      { id: 'rel-3', module: 'Jakość danych', object: 'Meta Ads cost', relation: 'Bloker pomiaru', status: 'Wymaga danych' },
    ],
    variantRows: [
      { id: 'var-1', evidence: 'Attribution + orders', risk: 'Mutacja bez approval', state: 'Approval', variant: 'Rekomendacja do akceptacji' },
      { id: 'var-2', evidence: 'Brak kosztu reklamy', risk: 'Błędny pomiar', state: 'Blocked', variant: 'Decyzja zablokowana' },
      { id: 'var-3', evidence: 'Wynik po 14 dniach', risk: 'Fałszywy sukces', state: 'Measured', variant: 'Decyzja zmierzona' },
    ],
  };
}
