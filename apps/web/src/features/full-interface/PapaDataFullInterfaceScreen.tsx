import {
  Bot,
  Building2,
  CalendarDays,
  Command,
  FileText,
  Gauge,
  Home,
  Layers3,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Sparkles,
  Table2,
} from 'lucide-react';
import {
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  AppHeader,
  Button,
  InlineNotice,
  PageHeader,
  Surface,
} from '../../design-system';
import {
  ActionCard,
  ApprovalBar,
  AssistantComposer,
  AssistantEvidence,
  AssistantMessage,
  AssistantThreadItem,
  AssistantToolActivity,
  Breadcrumbs,
  Checkbox,
  Combobox,
  ComponentSample,
  DataFreshness,
  DataIssueCard,
  DataQualityIndicator,
  DataVisualization,
  DatePicker,
  DateRangePicker,
  DecisionCard,
  Dialog,
  Drawer,
  DropdownMenu,
  ErrorState,
  EvidencePanel,
  ExportStatus,
  IconButton,
  IntegrationCard,
  LimitationList,
  LinkButton,
  LoadingState,
  MetricCard,
  MotionPanel,
  OperationTracker,
  Pagination,
  PlanLimit,
  Popover,
  Progress,
  ReadinessBadge,
  ReadinessBanner,
  RecommendationCard,
  ReportCard,
  SearchField,
  Select,
  Skeleton,
  Spinner,
  Switch,
  SystemStateBadge,
  Tabs,
  TextArea,
  Toast,
  Tooltip,
  UsageMeter,
} from './FullInterfaceComponents';
import {
  customerWorkspaceScreens,
  dateFilters,
  fullInterfaceFixture,
  getInternalFixture,
  getScreenFixture,
  internalControlPlaneScreens,
  requiredSystemStates,
} from './fullInterfaceFixtures';
import {
  type FullInterfaceFixture,
  type UIInternalFixture,
  type UIReadiness,
  type UIScreenFixture,
  type UISystemState,
  type UIViewport,
} from './fullInterfaceContracts';

export type FullInterfaceSurface =
  | 'foundations'
  | 'primitives'
  | 'customer_workspace'
  | 'charts'
  | 'assistant'
  | 'internal_control_plane';

export type PapaDataFullInterfaceScreenProps = {
  fixture?: FullInterfaceFixture;
  internalId?: string;
  screenId?: string;
  state?: UISystemState;
  surface?: FullInterfaceSurface;
  theme?: 'light' | 'dark';
  viewport?: UIViewport;
};

const surfaces = [
  {
    icon: <Home aria-hidden="true" size={16} />,
    id: 'foundations',
    label: '00-foundations',
  },
  {
    icon: <Layers3 aria-hidden="true" size={16} />,
    id: 'primitives',
    label: '05-primitives',
  },
  {
    icon: <LayoutDashboard aria-hidden="true" size={16} />,
    id: 'customer_workspace',
    label: 'Customer Workspace',
  },
  {
    icon: <Table2 aria-hidden="true" size={16} />,
    id: 'charts',
    label: 'Wykresy i daty',
  },
  {
    icon: <Bot aria-hidden="true" size={16} />,
    id: 'assistant',
    label: 'Papa Asystent',
  },
  {
    icon: <ShieldCheck aria-hidden="true" size={16} />,
    id: 'internal_control_plane',
    label: 'Internal Control Plane',
  },
] as const satisfies readonly {
  icon: ReactNode;
  id: FullInterfaceSurface;
  label: string;
}[];

function readinessFromState(state: UISystemState, fallback: UIReadiness): UIReadiness {
  if (state === 'ready' || state === 'success') {
    return 'READY';
  }

  if (state === 'partial' || state === 'warning') {
    return 'PARTIAL';
  }

  if (state === 'stale' || state === 'delayed') {
    return 'STALE';
  }

  if (state === 'loading' || state === 'processing') {
    return 'PROCESSING';
  }

  if (state === 'empty' || state === 'no_data' || state === 'insufficient_data') {
    return 'EMPTY';
  }

  if (state === 'blocked' || state === 'blocked_by_policy' || state === 'forbidden') {
    return 'BLOCKED';
  }

  if (state === 'invalid' || state === 'error' || state === 'provider_error') {
    return 'INVALID';
  }

  if (state === 'needs_review') {
    return 'NEEDS_REVIEW';
  }

  return fallback;
}

export function PapaDataFullInterfaceScreen({
  fixture = fullInterfaceFixture,
  internalId,
  screenId,
  state,
  surface = 'customer_workspace',
  theme = 'dark',
  viewport = 'desktop',
}: PapaDataFullInterfaceScreenProps) {
  const [activeSurface, setActiveSurface] =
    useState<FullInterfaceSurface>(surface);
  const [language, setLanguage] = useState<'pl' | 'en'>('pl');
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>(theme);
  const screen = useMemo(() => getScreenFixture(screenId), [screenId]);
  const internal = useMemo(() => getInternalFixture(internalId), [internalId]);
  const effectiveState = state ?? screen.state;

  return (
    <div
      className="pds-brand-surface pdui-shell"
      data-theme={activeTheme}
      data-viewport={viewport}
      lang={language}
    >
      <AppHeader
        language={language}
        onLanguageChange={setLanguage}
        onThemeChange={setActiveTheme}
        theme={activeTheme}
        trailing={
          <div className="pdui-header-context">
            <span>{fixture.tenantId}</span>
            <span>{fixture.workspaceId}</span>
            <ReadinessBadge readiness={readinessFromState(effectiveState, screen.readiness)} />
          </div>
        }
      />

      <div className="pdui-layout">
        <aside className="pdui-sidebar" aria-label="Nawigacja pełnego UI">
          <div className="pdui-sidebar__brand">
            <Building2 aria-hidden="true" size={18} />
            <span>PapaData UI</span>
          </div>
          {surfaces.map((item) => (
            <button
              aria-current={activeSurface === item.id ? 'page' : undefined}
              className="pdui-sidebar__button"
              key={item.id}
              onClick={() => setActiveSurface(item.id)}
              type="button"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <main className="pdui-main">
          {activeSurface === 'foundations' ? (
            <FoundationsView fixture={fixture} state={effectiveState} />
          ) : null}
          {activeSurface === 'primitives' ? (
            <ComponentCatalogView fixture={fixture} state={effectiveState} />
          ) : null}
          {activeSurface === 'customer_workspace' ? (
            <CustomerWorkspaceView
              fixture={fixture}
              screen={screen}
              state={effectiveState}
              viewport={viewport}
            />
          ) : null}
          {activeSurface === 'charts' ? (
            <ChartsAndDateView fixture={fixture} />
          ) : null}
          {activeSurface === 'assistant' ? (
            <AssistantView fixture={fixture} state={effectiveState} />
          ) : null}
          {activeSurface === 'internal_control_plane' ? (
            <InternalControlPlaneView
              fixture={fixture}
              selected={internal}
              state={effectiveState}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function FoundationsView({
  fixture,
  state,
}: {
  fixture: FullInterfaceFixture;
  state: UISystemState;
}) {
  return (
    <MotionPanel className="pdui-stack">
      <PageHeader
        eyebrow={fixture.version}
        text="Storybook jako kontrakt stanów produkcyjnych dla Customer Workspace, AI i Control Plane."
        title="Pełny interfejs PapaData"
      >
        <div className="pdui-toolbar">
          <Breadcrumbs />
          <SystemStateBadge state={state} />
        </div>
      </PageHeader>

      <section className="pdui-foundation-grid">
        <Surface className="pdui-panel">
          <h2>Tokeny i motywy</h2>
          <p>Warstwa korzysta z istniejących zmiennych `pds-*`, light/dark i focus-visible.</p>
          <div className="pdui-token-grid" aria-label="Próbki tokenów">
            {['primary', 'secondary', 'success', 'warning', 'danger', 'surface'].map((token) => (
              <span className={`pdui-token-swatch pdui-token-swatch--${token}`} key={token}>
                {token}
              </span>
            ))}
          </div>
        </Surface>

        <Surface className="pdui-panel">
          <h2>Stany systemowe</h2>
          <div className="pdui-state-grid">
            {requiredSystemStates.map((item) => (
              <SystemStateBadge key={item} state={item} />
            ))}
          </div>
        </Surface>

        <Surface className="pdui-panel">
          <h2>Źródła i zakres</h2>
          <dl className="pdui-definition-list">
            <div>
              <dt>tenantId</dt>
              <dd>{fixture.tenantId}</dd>
            </div>
            <div>
              <dt>workspaceId</dt>
              <dd>{fixture.workspaceId}</dd>
            </div>
            <div>
              <dt>timezone</dt>
              <dd>{fixture.timezone}</dd>
            </div>
            <div>
              <dt>currency</dt>
              <dd>{fixture.currency}</dd>
            </div>
          </dl>
        </Surface>
      </section>
    </MotionPanel>
  );
}

function ComponentCatalogView({
  fixture,
  state,
}: {
  fixture: FullInterfaceFixture;
  state: UISystemState;
}) {
  const [group, setGroup] = useState<'primitive' | 'domain'>('primitive');
  const visibleComponents = fixture.components.filter((component) => component.group === group);

  return (
    <MotionPanel className="pdui-stack">
      <PageHeader
        eyebrow="05-primitives"
        text="Katalog bazowych i domenowych elementów UI, bez podmiany istniejącego design systemu."
        title="Biblioteka komponentów PapaData"
      />

      <div className="pdui-toolbar">
        <Button
          onClick={() => setGroup('primitive')}
          variant={group === 'primitive' ? 'primary' : 'secondary'}
        >
          Podstawowe
        </Button>
        <Button
          onClick={() => setGroup('domain')}
          variant={group === 'domain' ? 'primary' : 'secondary'}
        >
          Domenowe
        </Button>
        <Popover />
        <DropdownMenu />
        <Tooltip />
      </div>

      <section className="pdui-component-grid">
        {visibleComponents.map((component) => (
          <Surface className="pdui-component-tile" key={component.name}>
            <div>
              <span className="pdui-kicker">{component.contract}</span>
              <h2>{component.name}</h2>
              <p>{component.description}</p>
            </div>
            <ComponentSample name={component.name} state={state} />
            <div className="pdui-card-row">
              {component.states.slice(0, 3).map((item) => (
                <SystemStateBadge key={item} state={item} />
              ))}
            </div>
          </Surface>
        ))}
      </section>

      <Surface className="pdui-panel">
        <h2>Formularze i interakcje</h2>
        <div className="pdui-form-grid">
          <SearchField label="Szukaj w Storybooku" placeholder="KPI, readiness, action" />
          <TextArea label="Uzasadnienie decyzji" helper="Treść trafia do draftu, nie wykonuje operacji." />
          <Checkbox label="Pokaż ograniczenia" />
          <Switch label="Tryb keyboard review" />
          <Select />
          <Combobox />
          <DatePicker />
          <DateRangePicker />
          <Dialog />
          <Tabs />
          <Pagination />
          <Progress value={72} />
          <Spinner />
        </div>
      </Surface>
    </MotionPanel>
  );
}

function CustomerWorkspaceView({
  fixture,
  screen,
  state,
  viewport,
}: {
  fixture: FullInterfaceFixture;
  screen: UIScreenFixture;
  state: UISystemState;
  viewport: UIViewport;
}) {
  const readiness = readinessFromState(state, screen.readiness);

  return (
    <MotionPanel className="pdui-stack">
      <WorkspaceTopBar fixture={fixture} screen={screen} state={state} />
      <div className="pdui-workspace-layout">
        <WorkspaceNavigation activeId={screen.id} compact={viewport === 'mobile'} />
        <section className="pdui-workspace-main" aria-label={screen.title}>
          {state === 'loading' ? (
            <LoadingState
              action={<Skeleton />}
              text="Dane poprzedniego workspace nie są renderowane podczas zmiany kontekstu."
              title="Ładowanie widoku"
            />
          ) : null}

          {state === 'empty' || state === 'no_data' || state === 'insufficient_data' ? (
            <Surface className="pdui-state-panel">
              <SystemStateBadge state={state} />
              <h1>{screen.title}</h1>
              <p>Brak danych jest jawny i nie jest prezentowany jako zero.</p>
              <LinkButton href="#integrations">Przejdź do integracji</LinkButton>
            </Surface>
          ) : null}

          {state === 'error' || state === 'provider_error' || state === 'invalid' ? (
            <ErrorState
              action={<Button variant="secondary">Ponów bez zmiany zakresu</Button>}
              text="Retry jest dostępny tylko dla idempotentnej operacji i zachowuje operationId."
              title={state === 'provider_error' ? 'Provider zgłosił błąd' : 'Widok wymaga recovery'}
            />
          ) : null}

          {state === 'forbidden' || state === 'blocked' || state === 'blocked_by_policy' || state === 'expired' ? (
            <Surface className="pdui-state-panel" role={state === 'forbidden' ? 'alert' : 'status'}>
              <SystemStateBadge state={state} />
              <h1>{state === 'expired' ? 'Sesja wygasła' : 'Dostęp ograniczony'}</h1>
              <p>
                UI nie ujawnia danych zasobu i nie traktuje ukrycia elementu jako kontroli bezpieczeństwa.
              </p>
              <Button variant="secondary">
                {state === 'expired' ? 'Wróć po logowaniu' : 'Poproś właściciela o dostęp'}
              </Button>
            </Surface>
          ) : null}

          {!['loading', 'empty', 'no_data', 'insufficient_data', 'error', 'provider_error', 'invalid', 'forbidden', 'blocked', 'blocked_by_policy', 'expired'].includes(state) ? (
            <>
              <PageHeader
                eyebrow={screen.category}
                text={screen.description}
                title={screen.title}
              >
                <div className="pdui-toolbar">
                  <ReadinessBadge readiness={readiness} />
                  <DataQualityIndicator readiness={readiness} />
                  <DataFreshness timestamp={screen.chart.lastSync} />
                </div>
              </PageHeader>

              <ReadinessBanner
                nextAction={screen.nextActions[0] ?? 'Otwórz evidence panel.'}
                readiness={readiness}
              />

              <section className="pdui-metrics-grid">
                {screen.metrics.map((metric) => (
                  <MetricCard key={metric.label} metric={{ ...metric, readiness }} />
                ))}
              </section>

              <section className="pdui-two-column">
                <DataVisualization chart={{ ...screen.chart, readiness }} />
                <EvidencePanel evidence={screen.evidence} />
              </section>

              <section className="pdui-two-column">
                <Surface className="pdui-panel">
                  <h2>Operacje i next actions</h2>
                  <OperationTracker operationId={`operation:${screen.id}:storybook`} state={state} />
                  <ApprovalBar state={state === 'cancelled' ? 'cancelled' : 'needs_review'} />
                  <div className="pdui-action-grid">
                    <RecommendationCard state="needs_review" />
                    <DecisionCard state={state === 'success' ? 'success' : 'needs_review'} />
                    <ActionCard state={state === 'processing' ? 'processing' : 'ready'} />
                    <ReportCard state={state === 'stale' ? 'stale' : 'ready'} />
                  </div>
                </Surface>

                <Surface className="pdui-panel">
                  <h2>Audit i ograniczenia</h2>
                  <ul className="pdui-audit-list">
                    {screen.auditEvents.map((event) => (
                      <li key={event}>{event}</li>
                    ))}
                  </ul>
                  <LimitationList limitations={screen.alerts} />
                  <Drawer>
                    <span>Trust Drawer dla {screen.title}</span>
                  </Drawer>
                </Surface>
              </section>
            </>
          ) : null}
        </section>
      </div>
    </MotionPanel>
  );
}

function WorkspaceTopBar({
  fixture,
  screen,
  state,
}: {
  fixture: FullInterfaceFixture;
  screen: UIScreenFixture;
  state: UISystemState;
}) {
  return (
    <Surface className="pdui-workspace-topbar">
      <div>
        <span className="pdui-kicker">Customer Workspace</span>
        <strong>{fixture.tenantId} / {fixture.workspaceId}</strong>
      </div>
      <div className="pdui-toolbar">
        <span>{fixture.currency}</span>
        <span>{fixture.timezone}</span>
        <SystemStateBadge state={state} />
        <IconButton label="Otwórz command palette">
          <Command aria-hidden="true" size={17} />
        </IconButton>
        <Search aria-hidden="true" size={17} />
      </div>
      <span className="pdui-kicker">{screen.requiredCapability}</span>
    </Surface>
  );
}

function WorkspaceNavigation({
  activeId,
  compact,
}: {
  activeId: string;
  compact: boolean;
}) {
  const visibleScreens = compact
    ? customerWorkspaceScreens.filter((screen) =>
        ['command_center', 'papa_assistant', 'notifications', 'actions', 'subscription_usage'].includes(screen.id),
      )
    : customerWorkspaceScreens;

  return (
    <nav className="pdui-workspace-nav" aria-label="Customer Workspace screens">
      {visibleScreens.map((screen) => (
        <a
          aria-current={screen.id === activeId ? 'page' : undefined}
          href={`#${screen.id}`}
          key={screen.id}
        >
          <span>{screen.title}</span>
          <ReadinessBadge readiness={screen.readiness} />
        </a>
      ))}
    </nav>
  );
}

function ChartsAndDateView({ fixture }: { fixture: FullInterfaceFixture }) {
  return (
    <MotionPanel className="pdui-stack">
      <PageHeader
        eyebrow="40-analytics"
        text="Wrappery wykresów mają tytuł, opis, jednostkę, źródła, readiness, tooltipowy kontekst i tabelę alternatywną."
        title="Wykresy, tabele i filtry dat"
      />

      <Surface className="pdui-panel">
        <div className="pdui-panel-heading">
          <CalendarDays aria-hidden="true" size={18} />
          <h2>Kalendarze i zakresy</h2>
        </div>
        <div className="pdui-date-filter-grid">
          {dateFilters.map((filter) => (
            <div className="pdui-date-filter" key={filter.label}>
              <strong>{filter.label}</strong>
              <span>{filter.comparison}</span>
              <small>{filter.timezone}</small>
              <small>{filter.disabledReason}</small>
            </div>
          ))}
        </div>
      </Surface>

      <section className="pdui-chart-grid">
        {fixture.charts.map((chart) => (
          <Surface className="pdui-panel" key={chart.chartType}>
            <DataVisualization chart={chart} />
          </Surface>
        ))}
      </section>
    </MotionPanel>
  );
}

function AssistantView({
  fixture,
  state,
}: {
  fixture: FullInterfaceFixture;
  state: UISystemState;
}) {
  return (
    <MotionPanel className="pdui-stack">
      <PageHeader
        eyebrow="80-assistant"
        text="Deterministyczny interfejs rozmowy z evidence, limitations, confidence, refusal i draftem działania."
        title="Papa Asystent"
      >
        <div className="pdui-toolbar">
          <SystemStateBadge state={state} />
          <ReadinessBadge readiness={readinessFromState(state, 'NEEDS_REVIEW')} />
          <Button iconBefore={<Sparkles aria-hidden="true" size={16} />}>Zapisz do biblioteki</Button>
          <Button iconBefore={<FileText aria-hidden="true" size={16} />}>Eksportuj briefing</Button>
        </div>
      </PageHeader>

      <div className="pdui-assistant-layout">
        <aside className="pdui-assistant-threads" aria-label="Wątki Asystenta">
          <AssistantThreadItem active title={fixture.assistant.threadTitle} />
          {['Diagnoza ROAS', 'Brief tygodniowy', 'Alert synchronizacji'].map((title) => (
            <AssistantThreadItem key={title} title={title} />
          ))}
          <Button iconBefore={<Bot aria-hidden="true" size={16} />}>Nowy wątek</Button>
        </aside>

        <section className="pdui-assistant-main" aria-label="Historia rozmowy">
          <div className="pdui-assistant-modebar">
            {['Decyzja', 'Diagnoza', 'Raport', 'Plan działań', 'Prognoza', 'Alert', 'Brief dla zespołu'].map((mode) => (
              <button
                aria-pressed={mode === fixture.assistant.mode}
                key={mode}
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>
          {fixture.assistant.messages.map((message, index) => (
            <AssistantMessage
              author={message.author}
              key={`${message.author}-${index}`}
              state={message.state}
            >
              {message.body}
            </AssistantMessage>
          ))}
          <AssistantToolActivity activity={fixture.assistant.toolActivity} />
          <AssistantComposer />
        </section>

        <aside className="pdui-assistant-side" aria-label="Evidence odpowiedzi">
          <AssistantEvidence evidence={fixture.assistant.evidence} />
          <LimitationList limitations={fixture.assistant.limitations} />
          <Surface className="pdui-panel">
            <h2>Draft działania</h2>
            <ApprovalBar state="needs_review" />
            <OperationTracker operationId="operation:ai:proposal" state={state === 'cancelled' ? 'cancelled' : 'needs_review'} />
            <InlineNotice tone="warning">
              Działanie nie zostanie wykonane bez approval, reauth i revalidation.
            </InlineNotice>
          </Surface>
        </aside>
      </div>
    </MotionPanel>
  );
}

function InternalControlPlaneView({
  fixture,
  selected,
  state,
}: {
  fixture: FullInterfaceFixture;
  selected: UIInternalFixture;
  state: UISystemState;
}) {
  return (
    <MotionPanel className="pdui-stack pdui-internal">
      <PageHeader
        eyebrow="120-internal-control-plane"
        text="Wewnętrzny interfejs operacyjny jest oddzielony od Customer Workspace i nie pokazuje payloadów bez JIT."
        title="Internal Control Plane"
      >
        <div className="pdui-toolbar">
          <ShieldCheck aria-hidden="true" size={17} />
          <span>Internal Support/Operations</span>
          <SystemStateBadge state={state} />
        </div>
      </PageHeader>

      <div className="pdui-workspace-layout">
        <nav className="pdui-workspace-nav pdui-workspace-nav--internal" aria-label="Control Plane screens">
          {internalControlPlaneScreens.map((screen) => (
            <a
              aria-current={screen.id === selected.id ? 'page' : undefined}
              href={`#${screen.id}`}
              key={screen.id}
            >
              <span>{screen.title}</span>
              <span>{screen.owner}</span>
            </a>
          ))}
        </nav>

        <section className="pdui-workspace-main" aria-label={selected.title}>
          <PageHeader
            eyebrow={selected.gate}
            text={`${selected.owner}. Dostęp JIT i audit są wymagane dla operacji supportowych.`}
            title={selected.title}
          />
          <section className="pdui-metrics-grid">
            {selected.metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </section>
          <Surface className="pdui-panel">
            <div className="pdui-panel-heading">
              <Gauge aria-hidden="true" size={18} />
              <h2>Kolejka kontroli</h2>
            </div>
            <table className="pdui-table">
              <caption>{selected.title} / lista operacyjna</caption>
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Status</th>
                  <th>Wpływ</th>
                </tr>
              </thead>
              <tbody>
                {selected.rows.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td><SystemStateBadge state={row.status} /></td>
                    <td>{row.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Surface>
          <section className="pdui-action-grid">
            <DataIssueCard state={state} />
            <IntegrationCard state={state === 'provider_error' ? 'provider_error' : 'ready'} />
            <UsageMeter metric={selected.metrics[0]} />
            <PlanLimit value={selected.metrics[1]?.value ?? '0%'} />
            <ExportStatus state={state} />
            <Toast />
          </section>
          <InlineNotice tone="warning">
            Control Plane nie jest Customer Workspace. Widok redaguje dane wrażliwe i wymaga JIT dla supportu.
          </InlineNotice>
        </section>
      </div>
      <span className="pdui-sr-only">{fixture.generatedAt}</span>
    </MotionPanel>
  );
}
