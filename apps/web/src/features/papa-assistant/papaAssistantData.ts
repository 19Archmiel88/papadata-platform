import type {
  PapaArtifact,
  PapaAssistantFixture,
  PapaDecisionQueueItem,
  PapaExportJob,
  PapaRefusal,
  PapaReportJob,
} from './assistantTypes';
import {
  papaDecisionQueueStatuses,
  papaExportStatuses,
  papaRefusalReasons,
  papaReportJobStatuses,
} from './assistantTypes';

export const papaAiTransparencyCopy = {
  assistant:
    'Odpowiada Papa Asystent AI. Wynik jest generowany automatycznie na podstawie danych workspace, aktywnych filtrów i dostępnych źródeł. Sprawdź evidence, aktualność danych i ograniczenia przed podjęciem decyzji.',
  refusal:
    'Papa Asystent nie może przygotować odpowiedzi, ponieważ dostępne dane, uprawnienia albo evidence są niewystarczające.',
  recommendation:
    'Rekomendacja wygenerowana przez AI. Wdrożenie wymaga zatwierdzenia użytkownika i ponownej walidacji danych.',
  report:
    'Raport wygenerowany przez Papa Asystenta AI. Zawiera dane, wnioski i rekomendacje z określonego zakresu. Przed użyciem operacyjnym sprawdź źródła, kompletność danych i poziom pewności.',
} as const;

const primaryArtifact: PapaArtifact = {
  columns: [
    { id: 'metric', label: 'Metryka' },
    { id: 'current', label: 'Teraz' },
    { id: 'noAction', label: 'Bez działania' },
    { id: 'withAction', label: 'Po wdrożeniu' },
    { id: 'evidence', label: 'Evidence' },
  ],
  id: 'artifact-margin-simulation',
  rows: [
    {
      current: '18,4%',
      evidence: 'orders.daily_fact + Google Ads',
      metric: 'Marża brutto',
      noAction: '17,6%',
      withAction: '19,2%',
    },
    {
      current: '64 200 PLN',
      evidence: 'campaign_costs snapshot 2026-08-26',
      metric: 'Koszt mediowy',
      noAction: '67 900 PLN',
      withAction: '62 700 PLN',
    },
    {
      current: '2,9',
      evidence: 'attribution_model_v3',
      metric: 'ROAS blended',
      noAction: '2,6',
      withAction: '3,2',
    },
  ],
  status: 'ready',
  title: 'Symulacja wpływu rekomendacji',
  type: 'table',
};

export const papaAssistantFixture: PapaAssistantFixture = {
  alerts: [
    'Świeżość Google Ads jest częściowa: ostatni snapshot ma 52 minuty.',
    'Eksport PII wymaga osobnego approval security.',
  ],
  artifacts: [
    primaryArtifact,
    {
      columns: [
        { id: 'step', label: 'Krok' },
        { id: 'owner', label: 'Właściciel' },
        { id: 'due', label: 'Termin' },
        { id: 'approval', label: 'Approval' },
      ],
      id: 'artifact-action-plan',
      rows: [
        { approval: 'Wymagane', due: '2026-08-26 16:00', owner: 'Media paid', step: 'Zweryfikuj koszty Google Ads' },
        { approval: 'Wymagane', due: '2026-08-27 10:00', owner: 'Growth lead', step: 'Potwierdź limit przesunięcia budżetu' },
        { approval: 'Po revalidation', due: '2026-08-27 12:00', owner: 'Papa Asystent', step: 'Przygotuj draft zmiany' },
      ],
      status: 'partial',
      title: 'Plan działań po rekomendacji',
      type: 'actionPlan',
    },
  ],
  auditTrail: [
    {
      detail: 'Snapshot ekranu i filtrów został zapisany przed analizą.',
      id: 'audit-context',
      timestamp: '2026-08-26T10:04:00+02:00',
      title: 'Capture context',
    },
    {
      detail: 'Rekomendacja została oznaczona jako AI i przekazana do DecisionQueue.',
      id: 'audit-proposal',
      timestamp: '2026-08-26T10:06:00+02:00',
      title: 'Proposal created',
    },
    {
      detail: 'Revalidation wymaga świeżego kosztu kampanii przed execution.',
      id: 'audit-revalidation',
      timestamp: '2026-08-26T10:07:00+02:00',
      title: 'Revalidation required',
    },
  ],
  basket: [
    {
      freshness: '52 min',
      id: 'basket-kpi-roas',
      label: 'ROAS blended MTD',
      range: '01.08.2026-26.08.2026',
      removable: true,
      source: 'Command Center KPI',
      type: 'kpi',
    },
    {
      freshness: '18 min',
      id: 'basket-chart-margin',
      label: 'Trend marży brutto',
      range: 'MTD, segment powracający',
      removable: true,
      source: 'Wykres marży',
      type: 'chart',
    },
    {
      freshness: '1 h',
      id: 'basket-table-campaign',
      label: 'Wiersze kampanii brand search',
      range: '12 zaznaczonych rekordów',
      removable: true,
      source: 'Tabela kampanii',
      type: 'tableRow',
    },
    {
      freshness: 'wersja 4',
      id: 'basket-report-q3',
      label: 'Raport rentowności Q3',
      range: 'Q3 draft',
      removable: true,
      source: 'Biblioteka raportów',
      type: 'report',
    },
  ],
  briefings: [
    {
      area: 'Paid media',
      attachments: ['artifact-margin-simulation', 'evidence-costs'],
      channel: 'Brief zespołu',
      context: 'Workspace Commerce PL, MTD, filtr paid + returning customers',
      dueAt: '2026-08-27T09:00:00+02:00',
      expectedOutcome: 'Decyzja o przesunięciu budżetu po walidacji kosztów.',
      id: 'brief-paid-media',
      owner: 'Growth lead',
      priority: 'high',
      purpose: 'Przygotować wspólny brief dla paid media i finance.',
      reportJobId: 'report-generating',
      status: 'generating',
      topic: 'Rentowność paid media MTD',
    },
  ],
  context: {
    activeScreen: 'Centrum Dowodzenia',
    capabilities: [
      'analytics.read',
      'papa.answer.generate',
      'papa.report.create',
      'papa.action.propose',
      'papa.action.approve.high_risk',
    ],
    charts: [
      'Trend marży',
      'Koszt kampanii',
      'Konwersja segmentów',
    ],
    dateRange: '01.08.2026-26.08.2026',
    filters: [
      'kanał: paid',
      'segment: returning customers',
      'waluta: PLN',
    ],
    kpis: [
      'ROAS blended',
      'Marża brutto',
      'Koszt pozyskania',
    ],
    locale: 'pl',
    tables: [
      'campaign_costs',
      'orders.daily_fact',
      'customer_segments',
    ],
    tenant: 'tenant-papadata-demo',
    tools: [
      'screen_context.capture',
      'evidence.read',
      'report.job.create',
      'decision.queue.propose',
      'export.prepare',
    ],
    workspace: 'Commerce PL',
  },
  conversation: [
    {
      author: 'user',
      body: 'Dlaczego ROAS spadł mimo wzrostu przychodu?',
      createdAt: '2026-08-26T10:04:12+02:00',
      evidenceIds: [],
      id: 'conversation-user-roas',
    },
    {
      answer: {
        facts: [
          'Przychód MTD rośnie o 8,1%, ale koszt mediowy rośnie szybciej.',
          'Google Ads ma częściowy snapshot kosztów, więc wniosek wymaga revalidation przed akcją.',
        ],
        hypotheses: [
          'Największy wpływ ma wzrost CPC w kampanii brand search.',
          'Segment powracający utrzymuje marżę, ale wolumen nowych klientów obniża blended ROAS.',
        ],
        interpretations: [
          'Spadek ROAS wynika z kosztu pozyskania, a nie z utraty konwersji koszyka.',
          'Rekomendacja jest decyzyjna, ale execution musi przejść approval.',
        ],
        limitations: [
          'Brakuje pełnego kosztu kampanii z ostatnich 60 minut.',
          'Model atrybucji pokazuje wpływ na poziomie kampanii, nie pojedynczej kreacji.',
        ],
        recommendations: [
          'Przygotuj proposal przesunięcia budżetu do kampanii o wyższej intencji.',
          'Nie wykonuj zmiany bez zatwierdzenia człowieka i revalidation kosztów.',
        ],
        suggestedNextSteps: [
          'Otwórz DecisionQueue i zatwierdź zakres zmiany.',
          'Utwórz briefing dla paid media z artefaktem symulacji.',
        ],
      },
      author: 'assistant',
      body: papaAiTransparencyCopy.assistant,
      createdAt: '2026-08-26T10:04:19+02:00',
      evidenceIds: ['evidence-costs', 'evidence-margin', 'evidence-lineage'],
      id: 'conversation-assistant-roas',
    },
    {
      author: 'system',
      body: 'Streaming jest agregowany do stabilnych zdań; live region komunikuje status generowania bez odczytywania każdego tokenu.',
      createdAt: '2026-08-26T10:04:21+02:00',
      evidenceIds: [],
      id: 'conversation-system-streaming',
    },
  ],
  decisions: papaDecisionQueueStatuses.map<PapaDecisionQueueItem>((status, index) => ({
    approver: index % 2 === 0 ? 'Growth lead' : 'Finance owner',
    audit: `audit-${status}`,
    canRollback: !['executing', 'succeeded'].includes(status),
    dueAt: `2026-08-${String(26 + (index % 3)).padStart(2, '0')}T1${index % 8}:00:00+02:00`,
    id: `decision-${status}`,
    integration: index % 3 === 0 ? 'Google Ads' : index % 3 === 1 ? 'CRM' : 'Biblioteka',
    revalidation: index % 2 === 0 ? 'wymagana przed execution' : 'świeża walidacja kosztu i zakresu',
    risk: index % 4 === 0 ? 'wysokie' : index % 4 === 1 ? 'średnie' : 'niskie',
    sideEffects: index % 3 === 0 ? 'zmiana budżetu i harmonogramu kampanii' : 'zapis artefaktu oraz powiadomienie zespołu',
    status,
    title: `DecisionQueue ${status}`,
  })),
  evidence: [
    {
      audit: 'audit-context',
      completeness: '94%',
      confidence: 'ograniczona',
      dataset: 'campaign_costs',
      dateRange: '01.08.2026-26.08.2026',
      estimation: 'bez swobodnego procentu confidence; poziom opisowy',
      filters: 'kanał paid, kampanie aktywne',
      freshness: '52 min',
      id: 'evidence-costs',
      limitations: 'koszty z ostatniej godziny mogą się jeszcze domknąć',
      lineage: 'Google Ads -> bff.campaign_costs -> dashboard snapshot',
      snapshot: 'snapshot-costs-2026-08-26-1004',
      source: 'Google Ads',
      title: 'Koszty kampanii',
    },
    {
      audit: 'audit-context',
      completeness: '99%',
      confidence: 'wysoka',
      dataset: 'orders.daily_fact',
      dateRange: '01.08.2026-26.08.2026',
      estimation: 'fakty sprzedażowe bez prognozy AI',
      filters: 'orders settled, PLN',
      freshness: '18 min',
      id: 'evidence-margin',
      limitations: 'zwroty po dacie snapshotu nie są jeszcze zaksięgowane',
      lineage: 'Shopify -> warehouse.orders -> margin model',
      snapshot: 'snapshot-margin-2026-08-26-1004',
      source: 'Shopify',
      title: 'Marża i zamówienia',
    },
    {
      audit: 'audit-revalidation',
      completeness: '87%',
      confidence: 'ograniczona',
      dataset: 'attribution_model_v3',
      dateRange: 'MTD',
      estimation: 'symulacja AI oznaczona jako prognoza',
      filters: 'paid + returning customers',
      freshness: '1 h',
      id: 'evidence-lineage',
      limitations: 'atrybucja nie wyjaśnia pojedynczych kreacji',
      lineage: 'warehouse -> feature store -> recommendation engine',
      snapshot: 'snapshot-attribution-2026-08-26-1004',
      source: 'Model atrybucji',
      title: 'Lineage rekomendacji',
    },
  ],
  exports: papaExportStatuses.map<PapaExportJob>((status, index) => ({
    destination: ([
      'pdf',
      'csv',
      'brief zespołu',
      'biblioteka',
      'workflow',
      'mcp',
    ] as const)[index % 6],
    id: `export-${status.replace(' ', '-')}`,
    label: `Eksport ${status}`,
    status,
  })),
  library: [
    {
      author: 'Papa Asystent AI',
      date: '2026-08-26',
      id: 'library-report-margin',
      link: '/app/papa/library/report-margin',
      name: 'Rentowność paid media MTD',
      range: '01.08.2026-26.08.2026',
      sources: '3 evidence',
      status: 'ready',
      type: 'raport',
      version: 'v4',
    },
    {
      author: 'Growth lead',
      date: '2026-08-25',
      id: 'library-brief-crm',
      link: '/app/papa/library/brief-crm',
      name: 'Brief CRM returning customers',
      range: 'MTD',
      sources: 'CRM + orders',
      status: 'stale',
      type: 'brief',
      version: 'v2',
    },
  ],
  operations: [
    {
      detail: 'Report job czeka na domknięcie danych kampanii.',
      id: 'operation-queued',
      recovery: 'Ponów po synchronizacji albo zawęź zakres dat.',
      status: 'queued',
      title: 'queued',
    },
    {
      detail: 'Papa generuje draft raportu i artefakt CSV.',
      id: 'operation-generating',
      recovery: 'Można zatrzymać generowanie bez utraty kontekstu.',
      status: 'generating',
      title: 'generating',
    },
    {
      detail: 'Proposal wymaga decyzji człowieka.',
      id: 'operation-review',
      recovery: 'Zachowaj evidence i poproś approvera o akceptację.',
      status: 'needsReview',
      title: 'needsReview',
    },
    {
      detail: 'Execution trwa po approval i revalidation.',
      id: 'operation-executing',
      recovery: 'Śledź audyt i przygotowany rollback.',
      status: 'executing',
      title: 'executing',
    },
    {
      detail: 'Akcja zakończona, wynik trafia do historii.',
      id: 'operation-succeeded',
      recovery: 'Porównaj prognozę z wynikiem rzeczywistym.',
      status: 'succeeded',
      title: 'succeeded',
    },
    {
      detail: 'Nie udało się odświeżyć danych kampanii.',
      id: 'operation-failed',
      recovery: 'Wymagane ponowienie po sprawdzeniu integracji.',
      status: 'failed',
      title: 'failed',
    },
    {
      detail: 'Cofnięcie albo kompensacja jest proponowana po wyniku częściowym.',
      id: 'operation-recovery',
      recovery: 'Wykonaj recovery dopiero po zgodzie właściciela.',
      status: 'recovery',
      title: 'recovery',
    },
  ],
  recommendations: [
    {
      assumptions: [
        'Koszty Google Ads zostaną potwierdzone przed execution.',
        'Limit budżetu dziennego nie przekroczy polityki workspace.',
      ],
      confidence: 'ograniczona',
      current: { delta: '0', label: 'Stan obecny', metric: 'ROAS', value: '2,9' },
      evidenceIds: ['evidence-costs', 'evidence-lineage'],
      horizon: '7 dni',
      id: 'recommendation-budget',
      impact: '+0,3 ROAS po revalidation',
      noAction: { delta: '-0,3', label: 'Bez działania', metric: 'ROAS', value: '2,6' },
      owner: 'Media paid',
      requiresApproval: true,
      risk: 'średnie',
      status: 'do decyzji',
      title: 'Przesuń część budżetu do kampanii o wyższej intencji',
      withAction: { delta: '+0,3', label: 'Po wdrożeniu', metric: 'ROAS', value: '3,2' },
    },
    {
      assumptions: [
        'Segment CRM jest aktualny do poprzedniego wieczora.',
        'Oferta retencyjna nie wpływa na rabaty hurtowe.',
      ],
      confidence: 'wysoka',
      current: { delta: '0', label: 'Stan obecny', metric: 'Marża', value: '18,4%' },
      evidenceIds: ['evidence-margin'],
      horizon: '14 dni',
      id: 'recommendation-retention',
      impact: '+0,8 p.p. marży',
      noAction: { delta: '-0,2 p.p.', label: 'Bez działania', metric: 'Marża', value: '18,2%' },
      owner: 'CRM',
      requiresApproval: true,
      risk: 'niskie',
      status: 'w planie',
      title: 'Utwórz briefing CRM dla klientów powracających',
      withAction: { delta: '+0,8 p.p.', label: 'Po wdrożeniu', metric: 'Marża', value: '19,2%' },
    },
  ],
  refusals: papaRefusalReasons.map<PapaRefusal>((reason) => ({
    detail: refusalDetail(reason),
    evidenceIds: reason === 'prompt_injection_detected'
      ? []
      : ['evidence-costs'],
    id: `refusal-${reason}`,
    reason,
    title: `Odmowa: ${reason}`,
  })),
  reports: papaReportJobStatuses.map<PapaReportJob>((status, index) => ({
    artifactId: index % 2 === 0 ? 'artifact-margin-simulation' : 'artifact-action-plan',
    channel: index % 2 === 0 ? 'PDF + biblioteka' : 'CSV + MCP',
    id: `report-${status}`,
    progress: status === 'ready'
      ? 100
      : status === 'generating'
        ? 62
        : status === 'queued'
          ? 12
          : 0,
    status,
    title: `ReportJob ${status}`,
  })),
  toolActivity: [
    {
      detail: 'Czyta tenant, workspace, ekran, zakres dat i filtry przed odpowiedzią.',
      evidenceIds: ['evidence-lineage'],
      id: 'tool-context',
      requiresApproval: false,
      source: 'screen_context.capture',
      status: 'succeeded',
      title: 'Jawny kontekst',
    },
    {
      detail: 'Porównuje snapshot kosztów kampanii z zamówieniami i modelem atrybucji.',
      evidenceIds: ['evidence-costs', 'evidence-margin'],
      id: 'tool-evidence',
      requiresApproval: false,
      source: 'evidence.read',
      status: 'succeeded',
      title: 'Evidence read',
    },
    {
      detail: 'Przygotowuje proposal; execution wymaga approval oraz revalidation.',
      evidenceIds: ['evidence-lineage'],
      id: 'tool-proposal',
      requiresApproval: true,
      source: 'decision.queue.propose',
      status: 'needsReview',
      title: 'AI Action proposal',
    },
  ],
};

export function getPrimaryArtifact(): PapaArtifact {
  return primaryArtifact;
}

export function validatePapaAssistantFixture(
  fixture: PapaAssistantFixture,
): readonly string[] {
  const errors: string[] = [];
  const decisionStatuses = new Set(fixture.decisions.map((item) => item.status));
  const reportStatuses = new Set(fixture.reports.map((item) => item.status));
  const exportStatuses = new Set(fixture.exports.map((item) => item.status));
  const refusalReasons = new Set(fixture.refusals.map((item) => item.reason));

  for (const status of papaDecisionQueueStatuses) {
    if (!decisionStatuses.has(status)) {
      errors.push(`Missing DecisionQueue status ${status}`);
    }
  }

  for (const status of papaReportJobStatuses) {
    if (!reportStatuses.has(status)) {
      errors.push(`Missing ReportJob status ${status}`);
    }
  }

  for (const status of papaExportStatuses) {
    if (!exportStatuses.has(status)) {
      errors.push(`Missing export status ${status}`);
    }
  }

  for (const reason of papaRefusalReasons) {
    if (!refusalReasons.has(reason)) {
      errors.push(`Missing AIRefusal reason ${reason}`);
    }
  }

  if (fixture.context.tenant.length === 0 || fixture.context.workspace.length === 0) {
    errors.push('Context must expose tenant and workspace.');
  }

  if (fixture.evidence.length === 0) {
    errors.push('Evidence list must not be empty.');
  }

  if (!fixture.recommendations.every((item) => item.requiresApproval)) {
    errors.push('Recommendations must require explicit approval.');
  }

  if (!fixture.decisions.every((item) => item.revalidation.length > 0 && item.audit.length > 0)) {
    errors.push('DecisionQueue items must expose revalidation and audit.');
  }

  return errors;
}

function refusalDetail(reason: PapaRefusal['reason']): string {
  switch (reason) {
    case 'insufficient_evidence':
      return 'Evidence nie wystarcza do wniosku operacyjnego.';
    case 'insufficient_data':
      return 'Dane są niepełne dla wybranego zakresu.';
    case 'out_of_scope':
      return 'Żądanie wychodzi poza scope tenant/workspace.';
    case 'missing_capability':
      return 'Użytkownik nie ma capability wymaganej do tej analizy.';
    case 'prompt_injection_detected':
      return 'Wykryto próbę przejęcia instrukcji z danych źródłowych.';
    case 'forbidden_operation':
      return 'Operacja jest zabroniona polityką workspace.';
    case 'cost_or_limit_exceeded':
      return 'Koszt albo limit generowania został przekroczony.';
    case 'approval_required':
    default:
      return 'Wymagane jest approval człowieka przed przygotowaniem execution.';
  }
}
