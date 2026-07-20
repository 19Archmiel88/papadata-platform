import {
  fullInterfaceContractVersion,
  fullInterfaceFixtureSchema,
  uiChartFixtureSchema,
  uiComponentFixtureSchema,
  uiDateFilterSchema,
  uiInternalFixtureSchema,
  uiScreenFixtureSchema,
  type FullInterfaceFixture,
  type UIChartFixture,
  type UIInternalFixture,
  type UIScreenFixture,
  type UISystemState,
} from './fullInterfaceContracts';

export const requiredSystemStates = [
  'loading',
  'empty',
  'no_data',
  'partial',
  'invalid',
  'stale',
  'delayed',
  'processing',
  'ready',
  'success',
  'warning',
  'error',
  'forbidden',
  'blocked',
  'expired',
  'cancelled',
  'needs_review',
  'provider_error',
  'insufficient_data',
  'blocked_by_policy',
] as const satisfies readonly UISystemState[];

const generatedAt = '2026-07-20T08:00:00.000Z';
const lastSync = '2026-07-20T07:40:00.000Z';

export const primitiveComponentNames = [
  'Button',
  'IconButton',
  'LinkButton',
  'TextField',
  'TextArea',
  'NumberField',
  'SearchField',
  'PasswordField',
  'CodeInput',
  'Checkbox',
  'RadioGroup',
  'Switch',
  'Select',
  'Combobox',
  'DatePicker',
  'DateRangePicker',
  'Popover',
  'Tooltip',
  'DropdownMenu',
  'ContextMenu',
  'Dialog',
  'AlertDialog',
  'Drawer',
  'Tabs',
  'Accordion',
  'Pagination',
  'Breadcrumbs',
  'Avatar',
  'Badge',
  'Tag',
  'Separator',
  'Skeleton',
  'Spinner',
  'Progress',
  'InlineNotice',
  'Toast',
  'EmptyState',
  'ErrorState',
] as const;

export const domainComponentNames = [
  'MetricCard',
  'MetricValue',
  'MetricDelta',
  'MetricTrend',
  'MetricStatus',
  'ReadinessBadge',
  'ReadinessBanner',
  'DataFreshness',
  'SourceBadge',
  'SourceLogo',
  'EvidencePanel',
  'EvidenceItem',
  'LimitationList',
  'ConfidenceIndicator',
  'DataQualityIndicator',
  'OperationTracker',
  'SyncProgress',
  'IntegrationCard',
  'IntegrationStatus',
  'DataIssueCard',
  'AlertCard',
  'RecommendationCard',
  'DecisionCard',
  'ApprovalBar',
  'ActionCard',
  'AuditEvent',
  'UsageMeter',
  'PlanLimit',
  'ReportCard',
  'ExportStatus',
  'AssistantMessage',
  'AssistantComposer',
  'AssistantThreadItem',
  'AssistantToolActivity',
  'AssistantEvidence',
] as const;

export const fullInterfaceComponents = uiComponentFixtureSchema.array().parse([
  ...primitiveComponentNames.map((name) => ({
    contract: 'PapaData design-system primitives',
    description: `${name} korzysta z tokenów PapaData, focus-visible i tekstowego stanu.`,
    group: 'primitive',
    name,
    states: ['ready', 'loading', 'error', 'forbidden'],
  })),
  ...domainComponentNames.map((name) => ({
    contract: 'PapaData domain UI patterns',
    description: `${name} pokazuje readiness, evidence, ograniczenie i następną akcję bez liczenia KPI w UI.`,
    group: 'domain',
    name,
    states: ['ready', 'partial', 'stale', 'blocked', 'needs_review'],
  })),
]);

export const chartFixtures = uiChartFixtureSchema.array().parse([
  {
    chartType: 'LineChart',
    description: 'Trend przychodu netto z wyraźnym zakresem źródeł.',
    interpretation: 'Przychód jest stabilny, ale ostatni punkt pozostaje częściowy.',
    lastSync,
    points: [
      { label: '1 lip', readiness: 'READY', value: 124000 },
      { label: '8 lip', readiness: 'READY', value: 138000 },
      { label: '15 lip', readiness: 'PARTIAL', value: 131500 },
      { label: '20 lip', readiness: 'PARTIAL', value: 142200 },
    ],
    readiness: 'PARTIAL',
    sources: ['WooCommerce orders', 'MetricSnapshot net_revenue'],
    tableAlternativeLabel: 'Tabela trendu przychodu netto',
    title: 'Przychód netto',
    unit: 'PLN',
  },
  {
    chartType: 'AreaChart',
    description: 'Wypełniony trend zamówień z informacją o świeżości.',
    interpretation: 'Wolumen zamówień rośnie, ale dane marketplace są gated.',
    lastSync,
    points: [
      { label: '1 lip', readiness: 'READY', value: 940 },
      { label: '8 lip', readiness: 'READY', value: 1012 },
      { label: '15 lip', readiness: 'READY', value: 1075 },
      { label: '20 lip', readiness: 'STALE', value: 1038 },
    ],
    readiness: 'STALE',
    sources: ['WooCommerce orders'],
    tableAlternativeLabel: 'Tabela wolumenu zamówień',
    title: 'Zamówienia w czasie',
    unit: 'orders',
  },
  {
    chartType: 'BarChart',
    description: 'Porównanie wartości według kanału.',
    interpretation: 'D2C jest gotowe, marketplace wymaga bramy integracji.',
    lastSync,
    points: [
      { label: 'D2C', readiness: 'READY', value: 76000 },
      { label: 'Marketplace', readiness: 'BLOCKED', value: null },
      { label: 'Wholesale', readiness: 'PARTIAL', value: 21800 },
    ],
    readiness: 'PARTIAL',
    sources: ['WooCommerce orders', 'Integration readiness'],
    tableAlternativeLabel: 'Tabela sprzedaży według kanału',
    title: 'Sprzedaż według kanału',
    unit: 'PLN',
  },
  {
    chartType: 'StackedBarChart',
    description: 'Koszyki kosztów klienta bez mieszania kosztów AI i sync.',
    interpretation: 'Koszt ręczny pozostaje widoczny jako osobny składnik COGS.',
    lastSync,
    points: [
      { label: 'Sync', readiness: 'READY', value: 38 },
      { label: 'AI', readiness: 'NEEDS_REVIEW', value: 22 },
      { label: 'Manual', readiness: 'PARTIAL', value: 17 },
    ],
    readiness: 'NEEDS_REVIEW',
    sources: ['Cost observability ledger'],
    tableAlternativeLabel: 'Tabela kosztów operacyjnych',
    title: 'Koszt operacyjny klienta',
    unit: 'score',
  },
  {
    chartType: 'PieChart',
    description: 'Udział źródeł w evidence packu.',
    interpretation: 'Evidence pochodzi głównie z WooCommerce i snapshotów KPI.',
    lastSync,
    points: [
      { label: 'WooCommerce', readiness: 'READY', value: 58 },
      { label: 'Metric Engine', readiness: 'READY', value: 31 },
      { label: 'Audit', readiness: 'READY', value: 11 },
    ],
    readiness: 'READY',
    sources: ['Evidence registry'],
    tableAlternativeLabel: 'Tabela udziału evidence',
    title: 'Źródła evidence',
    unit: '%',
  },
  {
    chartType: 'DonutChart',
    description: 'Czytelny udział limitów planu z tekstowym stanem.',
    interpretation: 'Plan jest bezpieczny, eksporty zbliżają się do limitu.',
    lastSync,
    points: [
      { label: 'Synchronizacje', readiness: 'READY', value: 62 },
      { label: 'Eksporty', readiness: 'NEEDS_REVIEW', value: 78 },
      { label: 'AI runs', readiness: 'NEEDS_REVIEW', value: 41 },
    ],
    readiness: 'NEEDS_REVIEW',
    sources: ['Usage meter'],
    tableAlternativeLabel: 'Tabela użycia planu',
    title: 'Użycie planu',
    unit: '%',
  },
  {
    chartType: 'FunnelChart',
    description: 'Lejek od ruchu do zamówienia bez ukrywania braków GA4.',
    interpretation: 'Lejek jest częściowy, bo GA4 pozostaje planowany.',
    lastSync,
    points: [
      { label: 'Sesje', readiness: 'BLOCKED', value: null },
      { label: 'Koszyk', readiness: 'PARTIAL', value: 1840 },
      { label: 'Zamówienia', readiness: 'READY', value: 1038 },
    ],
    readiness: 'PARTIAL',
    sources: ['WooCommerce orders', 'GA4 planned provider gate'],
    tableAlternativeLabel: 'Tabela lejka sprzedażowego',
    title: 'Ruch i lejek',
    unit: 'users',
  },
  {
    chartType: 'ComposedChart',
    description: 'Połączenie słupków i linii dla planu działań.',
    interpretation: 'Wartość rekomendacji jest hipotezą, a nie wykonanym wynikiem.',
    lastSync,
    points: [
      { label: 'Plan', readiness: 'READY', value: 4 },
      { label: 'W toku', readiness: 'PROCESSING', value: 3 },
      { label: 'Zmierzono', readiness: 'READY', value: 2 },
    ],
    readiness: 'PROCESSING',
    sources: ['Decision log', 'Outcome tracker'],
    tableAlternativeLabel: 'Tabela działań i wyników',
    title: 'Działania i rezultaty',
    unit: 'score',
  },
  {
    chartType: 'Sparkline',
    description: 'Mały trend dla karty metryki.',
    interpretation: 'Trend dodatni, ale decyzja wymaga evidence.',
    lastSync,
    points: [
      { label: 'T-3', readiness: 'READY', value: 12 },
      { label: 'T-2', readiness: 'READY', value: 16 },
      { label: 'T-1', readiness: 'READY', value: 14 },
      { label: 'T', readiness: 'READY', value: 19 },
    ],
    readiness: 'READY',
    sources: ['MetricSnapshot trend'],
    tableAlternativeLabel: 'Tabela mini trendu',
    title: 'Sparkline KPI',
    unit: 'score',
  },
  {
    chartType: 'TrendChart',
    description: 'Trend statusów synchronizacji z recovery.',
    interpretation: 'Retry jest bezpieczne tylko dla idempotentnej operacji.',
    lastSync,
    points: [
      { label: 'Queued', readiness: 'PROCESSING', value: 5 },
      { label: 'Retry', readiness: 'NEEDS_REVIEW', value: 2 },
      { label: 'Success', readiness: 'READY', value: 18 },
    ],
    readiness: 'NEEDS_REVIEW',
    sources: ['SyncJob ledger'],
    tableAlternativeLabel: 'Tabela trendu synchronizacji',
    title: 'Synchronizacja',
    unit: 'score',
  },
  {
    chartType: 'ComparisonChart',
    description: 'Porównanie bieżącego i poprzedniego okresu.',
    interpretation: 'Porównanie jest dostępne tylko w ramach historii planu.',
    lastSync,
    points: [
      { label: 'Poprzedni okres', readiness: 'READY', value: 118000 },
      { label: 'Bieżący okres', readiness: 'PARTIAL', value: 142200 },
    ],
    readiness: 'PARTIAL',
    sources: ['MetricSnapshot current', 'MetricSnapshot comparison'],
    tableAlternativeLabel: 'Tabela porównania okresów',
    title: 'Porównanie okresów',
    unit: 'PLN',
  },
]);

export const dateFilters = uiDateFilterSchema.array().parse([
  {
    comparison: 'Porównanie z poprzednim okresem',
    disabledReason: 'Historia planu pilotażowego kończy się po 90 dniach.',
    label: 'Ostatnie 7 dni',
    timezone: 'Europe/Warsaw',
  },
  {
    comparison: 'Poprzedni miesiąc',
    disabledReason: 'Zakres przed aktywacją workspace jest niedostępny.',
    label: 'Bieżący miesiąc',
    timezone: 'Europe/Warsaw',
  },
  {
    comparison: 'Zakres niestandardowy',
    disabledReason: 'Raport tygodniowy wymaga gotowego datasetu.',
    label: 'Ostatnie 30 dni',
    timezone: 'Europe/Warsaw',
  },
  {
    comparison: 'Brak porównania',
    disabledReason: 'Retencja evidence nie obejmuje starszych danych w tym planie.',
    label: 'Ostatnie 90 dni',
    timezone: 'Europe/Warsaw',
  },
]);

const screenBlueprints = [
  ['login_access_recovery', 'Logowanie i odzyskiwanie dostępu', '10-account-access', 'Bezpieczny dostęp, reset hasła, expired session i recovery bez ujawniania zasobu.', 'auth:session:start'],
  ['invitation_activation', 'Zaproszenie i aktywacja konta', '10-account-access', 'Jednorazowe zaproszenie z rolą, tenantem i workspace widocznymi przed aktywacją.', 'auth:invitation:accept'],
  ['mfa_recovery', 'MFA i recovery', '10-account-access', 'MFA dla operacji uprzywilejowanych oraz bezpieczny powrót do procesu.', 'auth:mfa:verify'],
  ['tenant_workspace_choice', 'Wybór tenant/workspace', '10-account-access', 'Jawny kontekst tenanta i workspace z czyszczeniem danych przy zmianie.', 'workspace:switch'],
  ['company_onboarding', 'Onboarding firmy', '20-onboarding', 'Kroki wdrożenia bez traktowania integracji jako gotowej przed bramami.', 'workspace:onboarding:write'],
  ['business_profile', 'Konfiguracja profilu biznesowego', '20-onboarding', 'Profil firmy jako dane biznesowe, nie granica izolacji technicznej.', 'workspace:profile:write'],
  ['command_center', 'Centrum Dowodzenia', '30-command-center', 'Główna powierzchnia decyzji z KPI, readiness, alertami i działaniami.', 'analytics:command-center:view'],
  ['campaigns', 'Kampanie', '40-analytics', 'Widok kampanii z jawnie zablokowanymi providerami spoza gotowości MVP.', 'analytics:paid-campaigns:view'],
  ['orders', 'Zamówienia', '40-analytics', 'Tabela zamówień oparta na gotowych snapshotach i lineage.', 'analytics:orders:view'],
  ['products', 'Produkty', '40-analytics', 'Analiza produktów z partial data i ograniczeniami danych kosztowych.', 'analytics:products:view'],
  ['customers', 'Klienci', '40-analytics', 'Segmenty klientów bez liczenia LTV w UI.', 'analytics:customers:view'],
  ['traffic_funnel', 'Ruch i lejek', '40-analytics', 'Lejek sprzedażowy z blokadą GA4 do czasu bram integracji.', 'analytics:traffic:view'],
  ['integrations', 'Integracje', '50-integrations', 'Katalog providerów MVP z WooCommerce jako pilot i pozostałymi gated.', 'integration:read'],
  ['integration_details', 'Szczegóły integracji', '50-integrations', 'Scopes, checkpoint, retry, reconnect, audit i runbook dla połączenia.', 'integration:read'],
  ['sync_history', 'Synchronizacja i historia synchronizacji', '50-integrations', 'Historia jobów z idempotencją, recovery i audit trail.', 'integration:sync:view'],
  ['data_quality', 'Jakość danych', '60-data-quality', 'Problemy jakości, wpływ na KPI i właściciel next action.', 'data-quality:read'],
  ['readiness', 'Readiness', '60-data-quality', 'Gotowość lokalna dla okresu, waluty i workspace.', 'data-quality:readiness:view'],
  ['conflicts_duplicates', 'Konflikty i duplikaty', '60-data-quality', 'Manual review dla konfliktów źródeł i duplikatów.', 'data-quality:issue:review'],
  ['reports_exports', 'Raporty i eksporty', '90-reports', 'Eksporty z evidence, retencją, statusem i recovery.', 'reports:export'],
  ['recommendations', 'Rekomendacje', '70-decisions', 'Rekomendacje jako draft decyzji człowieka, nie automatyczne działanie.', 'ai:recommendations:view'],
  ['decisions', 'Decyzje', '70-decisions', 'Rejestr decyzji, expiry, evidence i audit.', 'ai:decisions:view'],
  ['actions', 'Działania', '70-decisions', 'AI Actions z approval, reauth, revalidation i idempotency.', 'ai:actions:view'],
  ['outcomes', 'Rezultaty', '70-decisions', 'Pomiar wyniku po działaniu z oddzieleniem hipotezy od rezultatu.', 'ai:outcomes:view'],
  ['papa_assistant', 'Papa Asystent', '80-assistant', 'Rozmowa z evidence, limitations, confidence i refusal.', 'ai:assistant:view'],
  ['assistant_library', 'Biblioteka Asystenta', '80-assistant', 'Zapisane odpowiedzi i briefingi z retencją oraz źródłem.', 'ai:history:view'],
  ['briefings', 'Briefingi', '80-assistant', 'Brief dla zespołu na bazie dopuszczonych danych i evidence.', 'ai:assistant:run'],
  ['settings', 'Ustawienia', '100-settings', 'Ustawienia workspace, powiadomień, eksportów i AI bez decyzji backendowej w UI.', 'workspace:settings:view'],
  ['users_roles', 'Użytkownicy i role', '100-settings', 'Role jako pakiety capabilities i data scope.', 'access:members:view'],
  ['business_goals', 'Cele biznesowe', '100-settings', 'Cele pilotażu i kryteria sukcesu bez zmiany KPI.', 'workspace:goals:view'],
  ['subscription_usage', 'Subskrypcja i użycie', '110-billing', 'Billing, usage, limity i entitlements jako część MVP.', 'billing:usage:view'],
  ['notifications', 'Powiadomienia', '100-settings', 'Alerty bezpieczeństwa, integracji, eksportu i AI.', 'notifications:view'],
  ['help_center', 'Centrum pomocy', '100-settings', 'Pomoc i runbooki bez atrap operacji.', 'support:help:view'],
  ['legal_privacy', 'Dokumenty prawne i prywatność', '100-settings', 'Retencja, subprocessorzy i privacy controls.', 'privacy:documents:view'],
  ['customer_audit', 'Audyt dostępny klientowi', '100-settings', 'Append-only audit log z redakcją danych wrażliwych.', 'audit:view'],
] as const;

function chartForIndex(index: number): UIChartFixture {
  const chart = chartFixtures[index % chartFixtures.length] ?? chartFixtures[0];

  if (!chart) {
    throw new Error('FULL_UI_CHART_FIXTURE_MISSING');
  }

  return chart;
}

function screenStateForIndex(index: number): UISystemState {
  const cycle: readonly UISystemState[] = [
    'ready',
    'partial',
    'stale',
    'processing',
    'needs_review',
    'blocked',
  ];

  return cycle[index % cycle.length] ?? 'ready';
}

function readinessForState(state: UISystemState): UIScreenFixture['readiness'] {
  if (state === 'blocked' || state === 'blocked_by_policy') {
    return 'BLOCKED';
  }

  if (state === 'partial' || state === 'warning') {
    return 'PARTIAL';
  }

  if (state === 'stale' || state === 'delayed') {
    return 'STALE';
  }

  if (state === 'processing' || state === 'loading') {
    return 'PROCESSING';
  }

  if (state === 'needs_review') {
    return 'NEEDS_REVIEW';
  }

  if (state === 'empty' || state === 'no_data' || state === 'insufficient_data') {
    return 'EMPTY';
  }

  if (state === 'invalid' || state === 'error' || state === 'provider_error') {
    return 'INVALID';
  }

  return 'READY';
}

export const customerWorkspaceScreens = uiScreenFixtureSchema.array().parse(
  screenBlueprints.map(([id, title, category, description, requiredCapability], index) => {
    const state = screenStateForIndex(index);
    const chart = chartForIndex(index);

    return {
      alerts: [
        'Brak danych nie jest prezentowany jako zero.',
        'Dane i działania pozostają w aktywnym tenantId oraz workspaceId.',
      ],
      auditEvents: [
        `VIEW_OPENED:${id}`,
        `CONTEXT_VALIDATED:${requiredCapability}`,
      ],
      category,
      chart,
      description,
      evidence: [
        {
          id: `evidence:${id}:snapshot`,
          label: `Evidence dla ${title}`,
          limitation: state === 'ready' ? null : 'Zakres nie jest w pełni gotowy do decyzji automatycznej.',
          source: chart.sources[0] ?? 'PapaData fixture',
          timestamp: lastSync,
        },
        {
          id: `evidence:${id}:audit`,
          label: 'Audit i correlationId',
          limitation: null,
          source: 'domain-contracts.v1',
          timestamp: generatedAt,
        },
      ],
      id,
      metrics: [
        {
          delta: '+8,4%',
          evidenceId: `evidence:${id}:snapshot`,
          label: 'Przychód netto',
          limitation: state === 'ready' ? null : 'Wartość częściowa, wymagane sprawdzenie readiness.',
          readiness: readinessForState(state),
          source: 'MetricSnapshot',
          unit: 'currency',
          value: state === 'blocked' ? null : '142 200 PLN',
        },
        {
          delta: '0',
          evidenceId: `evidence:${id}:audit`,
          label: 'Otwarte działania',
          limitation: null,
          readiness: state === 'processing' ? 'PROCESSING' : 'READY',
          source: 'Decision log',
          unit: 'number',
          value: '7',
        },
        {
          delta: '-2,1 pp',
          evidenceId: `evidence:${id}:snapshot`,
          label: 'Gotowość danych',
          limitation: 'Readiness jest lokalne dla okresu, waluty i workspace.',
          readiness: readinessForState(state),
          source: 'Readiness assessment',
          unit: 'percent',
          value: state === 'blocked' ? null : '84%',
        },
      ],
      nextActions: [
        'Otwórz evidence panel.',
        'Sprawdź wpływ ograniczenia na decyzję.',
        'Wykonaj retry tylko dla operacji idempotentnej.',
      ],
      readiness: readinessForState(state),
      requiredCapability,
      sections: [
        {
          body: 'Zakres został zweryfikowany dla aktywnego tenanta i workspace.',
          title: 'Kontekst',
          tone: 'info',
        },
        {
          body: 'UI pokazuje status, wpływ biznesowy, limitation i następną akcję.',
          title: 'Stan operacyjny',
          tone: state === 'ready' ? 'success' : 'warning',
        },
        {
          body: 'Oficjalne KPI pochodzą z fixture MetricSnapshot i nie są wyliczane w komponencie.',
          title: 'KPI i evidence',
          tone: 'neutral',
        },
      ],
      state,
      title,
    };
  }),
);

const internalBlueprints = [
  ['customer_portfolio', 'Portfolio klientów', 'Customer Success', 'Gate portfolio'],
  ['global_alert_queue', 'Globalna kolejka alertów', 'Operations', 'Gate incident'],
  ['workload_queue', 'Workload queue', 'Operations', 'Gate workload'],
  ['recovery_cases', 'Recovery cases', 'Reliability', 'Gate recovery'],
  ['support_cases', 'Support cases', 'Support', 'Gate support'],
  ['temporary_access_approvals', 'Temporary access approvals', 'Security', 'Gate JIT'],
  ['cost_observability', 'Cost Observability', 'Finance Ops', 'Gate cost'],
  ['customer_cost', 'Koszt klienta', 'Finance Ops', 'Gate margin'],
  ['provider_cost', 'Koszt providera', 'Finance Ops', 'Gate provider'],
  ['ai_cost', 'Koszt AI', 'AI Governance', 'Gate AI cost'],
  ['manual_work', 'Manual work', 'Operations', 'Gate manual'],
  ['gate_dashboard', 'Gate dashboard', 'Governance', 'Gate dashboard'],
  ['risk_register', 'Risk register', 'Risk', 'Gate risk'],
  ['control_register', 'Control register', 'Security', 'Gate control'],
  ['access_review', 'Access review', 'Security', 'Gate access'],
  ['backup_tests', 'Backup tests', 'Reliability', 'Gate continuity'],
  ['incident_register', 'Incident register', 'Security', 'Gate incident'],
  ['ai_use_case_register', 'AI use case register', 'AI Governance', 'Gate use case'],
  ['model_registry', 'Model registry', 'AI Governance', 'Gate model'],
  ['ai_evaluation_runs', 'AI evaluation runs', 'AI Governance', 'Gate S3'],
  ['ai_incident_register', 'AI incident register', 'AI Governance', 'Gate AI incident'],
] as const;

export const internalControlPlaneScreens = uiInternalFixtureSchema.array().parse(
  internalBlueprints.map(([id, title, owner, gate], index) => {
    const state = screenStateForIndex(index);

    return {
      gate,
      id,
      metrics: [
        {
          delta: '+2',
          evidenceId: `evidence:${id}:ops`,
          label: 'Otwarte sprawy',
          limitation: null,
          readiness: readinessForState(state),
          source: 'Internal ledger',
          unit: 'number',
          value: String(8 + index),
        },
        {
          delta: '-11%',
          evidenceId: `evidence:${id}:cost`,
          label: 'Ryzyko eskalacji',
          limitation: 'Wewnętrzny widok nie pokazuje payloadu klienta bez JIT.',
          readiness: state === 'blocked' ? 'BLOCKED' : 'READY',
          source: 'Control register',
          unit: 'percent',
          value: `${18 + index}%`,
        },
      ],
      owner,
      rows: [
        {
          impact: 'Wymaga właściciela i daty recovery.',
          label: `${title} / priorytet P1`,
          status: state,
        },
        {
          impact: 'Audit dostępny bez sekretów i payloadów.',
          label: `${gate} / evidence`,
          status: state === 'blocked' ? 'blocked_by_policy' : 'ready',
        },
      ],
      title,
    };
  }),
);

export const assistantFixture = {
  confidence: 'medium',
  evidence: [
    {
      id: 'evidence:assistant:net_revenue',
      label: 'MetricSnapshot net_revenue',
      limitation: 'Ostatni dzień jest częściowy.',
      source: 'analytics.v1',
      timestamp: lastSync,
    },
    {
      id: 'evidence:assistant:readiness',
      label: 'Readiness assessment',
      limitation: null,
      source: 'data-quality.v1',
      timestamp: generatedAt,
    },
  ],
  limitations: [
    'AI nie ustala KPI, readiness ani uprawnień.',
    'Action draft wymaga approval, reauth i revalidation.',
    'Production AI pozostaje zablokowane przez Gate S3.',
  ],
  messages: [
    {
      author: 'user',
      body: 'Wyjaśnij, czy mogę zwiększyć budżet kampanii w bieżącym tygodniu.',
      state: 'ready',
    },
    {
      author: 'tool',
      body: 'Metrics Query Service zwrócił READY i PARTIAL snapshoty z evidence packiem.',
      state: 'processing',
    },
    {
      author: 'assistant',
      body: 'Rekomenduję przygotować draft decyzji zamiast automatycznej zmiany budżetu. Przychód netto rośnie, ale dane atrybucyjne są częściowe.',
      state: 'needs_review',
    },
  ],
  mode: 'Decyzja',
  nextActions: [
    'Zapisz odpowiedź do biblioteki.',
    'Utwórz action draft bez wykonania.',
    'Eksportuj briefing z evidence.',
  ],
  threadTitle: 'Budżet kampanii i gotowość danych',
  toolActivity: 'Wywołanie narzędzia: metrics.queryService scoped tenant/workspace.',
} satisfies FullInterfaceFixture['assistant'];

export const fullInterfaceFixture = fullInterfaceFixtureSchema.parse({
  assistant: assistantFixture,
  charts: chartFixtures,
  components: fullInterfaceComponents,
  currency: 'PLN',
  dateFilters,
  generatedAt,
  internal: internalControlPlaneScreens,
  screens: customerWorkspaceScreens,
  tenantId: 'tenant_papadata_demo',
  timezone: 'Europe/Warsaw',
  version: fullInterfaceContractVersion,
  workspaceId: 'workspace_demo_pl',
});

export function getScreenFixture(
  screenId: string | undefined,
): UIScreenFixture {
  const fallback = customerWorkspaceScreens.find((screen) => screen.id === 'command_center');
  const screen = customerWorkspaceScreens.find((item) => item.id === screenId) ?? fallback;

  if (!screen) {
    throw new Error('FULL_UI_SCREEN_FIXTURE_MISSING');
  }

  return screen;
}

export function getInternalFixture(
  screenId: string | undefined,
): UIInternalFixture {
  const fallback = internalControlPlaneScreens[0];
  const screen =
    internalControlPlaneScreens.find((item) => item.id === screenId) ?? fallback;

  if (!screen) {
    throw new Error('FULL_UI_INTERNAL_FIXTURE_MISSING');
  }

  return screen;
}
