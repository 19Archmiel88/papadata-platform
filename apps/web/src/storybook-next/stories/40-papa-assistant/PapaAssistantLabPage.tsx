import type {
  FormEvent,
} from 'react';
import {
  useMemo,
  useState,
} from 'react';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Icon,
  PriorityBand,
} from '../../../design-system';
import type {
  PapaDataIconName,
} from '../../../design-system';
import {
  papaLabAggregations,
  papaLabArtifactRows,
  papaLabBusinessDatasets,
  papaLabCanvasTabs,
  papaLabCausalBasePoints,
  papaLabChartLabels,
  papaLabChartTypes,
  papaLabCompliancePillars,
  papaLabConfidenceSegments,
  papaLabContextBasketSeed,
  papaLabDataStatus,
  papaLabDecisionStates,
  papaLabDecisionTransitions,
  papaLabHistorySections,
  papaLabInspectorTabs,
  papaLabLibrarySections,
  papaLabModeResponses,
  papaLabOverviewCards,
  papaLabPalettes,
  papaLabRefusalReasons,
  papaLabRunStates,
  papaLabSavedCharts,
  papaLabTabs,
  papaLabTimeframes,
  papaLabWorkbenchAnalyses,
  papaLabWorkbenchModes,
  papaLabWorkModes,
} from './PapaAssistantLabPage.data';
import type {
  PapaLabBusinessDatasetId,
  PapaLabCanvasTabId,
  PapaLabChartTypeId,
  PapaLabContextBasketItem,
  PapaLabDecisionStateId,
  PapaLabInspectorTabId,
  PapaLabPaletteId,
  PapaLabRunStateId,
  PapaLabSavedChart,
  PapaLabTabId,
  PapaLabTone,
  PapaLabWorkbenchModeId,
  PapaLabWorkModeId,
} from './PapaAssistantLabPage.data';
import './PapaAssistantLabPage.css';

type PapaLabCanvasToolId =
  | 'brief'
  | 'chart'
  | 'reports'
  | 'whatIf';

export type PapaAssistantLabPageProps = {
  readonly initialCanvasTab?: PapaLabCanvasTabId;
  readonly initialCanvasTool?: PapaLabCanvasToolId;
  readonly initialFocusMode?: boolean;
  readonly initialInspectorTab?: PapaLabInspectorTabId;
  readonly initialMode?: PapaLabWorkbenchModeId;
  readonly initialRunState?: PapaLabRunStateId;
  readonly initialTab?: PapaLabTabId;
};

export function PapaAssistantLabPage({
  initialCanvasTab = 'result',
  initialCanvasTool = 'brief',
  initialFocusMode = false,
  initialInspectorTab = 'context',
  initialMode = 'diagnosis',
  initialRunState = 'completed',
}: PapaAssistantLabPageProps) {
  return (
    <PapaLabWorkbench
      initialCanvasTab={initialCanvasTab}
      initialCanvasTool={initialCanvasTool}
      initialFocusMode={initialFocusMode}
      initialInspectorTab={initialInspectorTab}
      initialMode={initialMode}
      initialRunState={initialRunState}
    />
  );
}

export function PapaLabWorkbench({
  initialCanvasTab = 'result',
  initialCanvasTool = 'brief',
  initialFocusMode = false,
  initialInspectorTab = 'context',
  initialMode = 'diagnosis',
  initialRunState = 'completed',
}: Omit<PapaAssistantLabPageProps, 'initialTab'>) {
  const [activeMode, setActiveMode] = useState<PapaLabWorkbenchModeId>(initialMode);
  const [activeCanvasTab, setActiveCanvasTab] = useState<PapaLabCanvasTabId>(initialCanvasTab);
  const [activeInspectorTab, setActiveInspectorTab] = useState<PapaLabInspectorTabId>(initialInspectorTab);
  const [canvasTool, setCanvasTool] = useState<PapaLabCanvasToolId>(initialCanvasTool);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(initialFocusMode);
  const [runState, setRunState] = useState<PapaLabRunStateId>(initialRunState);
  const [contextItems, setContextItems] = useState<readonly PapaLabContextBasketItem[]>(papaLabContextBasketSeed);
  const [currentDecisionState, setCurrentDecisionState] = useState<PapaLabDecisionStateId>('needsReview');
  const [decisionAuditLog, setDecisionAuditLog] = useState<readonly string[]>([
    '[10:42:01] AI utworzyło propozycję. Status: proposed.',
    '[10:42:31] Propozycja skierowana do przeglądu. Status: needsReview.',
  ]);

  function addContextItem(item: Omit<PapaLabContextBasketItem, 'id'>) {
    setContextItems((currentItems) => [
      ...currentItems,
      {
        ...item,
        id: `cb-workbench-${currentItems.length + 1}`,
      },
    ]);
  }

  function removeContextItem(id: string) {
    setContextItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  function transitionDecision(nextState: PapaLabDecisionStateId) {
    const time = new Date().toTimeString().split(' ')[0];
    setCurrentDecisionState(nextState);
    setDecisionAuditLog((currentLog) => [
      ...currentLog,
      `[${time}] DecisionQueue -> ${nextState}`,
    ]);
  }

  return (
    <main
      className="pd-pal pd-pal--workbench"
      data-focus-mode={isFocusMode ? 'true' : 'false'}
      data-inspector-collapsed={isInspectorCollapsed ? 'true' : 'false'}
      data-sidebar-collapsed={isSidebarCollapsed ? 'true' : 'false'}
      data-testid="papa-assistant-lab-page"
    >
      <PapaLabTopBar
        activeMode={activeMode}
        isFocusMode={isFocusMode}
        isInspectorCollapsed={isInspectorCollapsed}
        isSidebarCollapsed={isSidebarCollapsed}
        onFocusModeToggle={() => setIsFocusMode((currentValue) => !currentValue)}
        onInspectorToggle={() => setIsInspectorCollapsed((currentValue) => !currentValue)}
        onModeChange={(mode) => {
          setActiveMode(mode);
          if (mode === 'decision') {
            setActiveCanvasTab('comparison');
            setCanvasTool('whatIf');
          }
          if (mode === 'report') {
            setActiveCanvasTab('project');
            setCanvasTool('chart');
          }
        }}
        onRun={() => setRunState('running')}
        onSave={() => setRunState('draft')}
        onSidebarToggle={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
        runState={runState}
      />

      <div className="pd-pal-workbench__body">
        {isSidebarCollapsed || isFocusMode ? null : (
          <PapaLabSidebar
            onNewAnalysis={() => {
              setRunState('draft');
              setActiveCanvasTab('project');
              setCanvasTool('brief');
            }}
          />
        )}

        <PapaLabCanvas
          activeCanvasTab={activeCanvasTab}
          activeMode={activeMode}
          canvasTool={canvasTool}
          onCanvasTabChange={setActiveCanvasTab}
          onCanvasToolChange={setCanvasTool}
        />

        {isInspectorCollapsed || isFocusMode ? null : (
          <PapaLabInspector
            activeInspectorTab={activeInspectorTab}
            contextItems={contextItems}
            currentDecisionState={currentDecisionState}
            decisionAuditLog={decisionAuditLog}
            onContextAdd={addContextItem}
            onContextRemove={removeContextItem}
            onDecisionTransition={transitionDecision}
            onInspectorTabChange={setActiveInspectorTab}
            runState={runState}
          />
        )}
      </div>
    </main>
  );
}

function PapaLabTopBar({
  activeMode,
  isFocusMode,
  isInspectorCollapsed,
  isSidebarCollapsed,
  onFocusModeToggle,
  onInspectorToggle,
  onModeChange,
  onRun,
  onSave,
  onSidebarToggle,
  runState,
}: {
  readonly activeMode: PapaLabWorkbenchModeId;
  readonly isFocusMode: boolean;
  readonly isInspectorCollapsed: boolean;
  readonly isSidebarCollapsed: boolean;
  readonly onFocusModeToggle: () => void;
  readonly onInspectorToggle: () => void;
  readonly onModeChange: (mode: PapaLabWorkbenchModeId) => void;
  readonly onRun: () => void;
  readonly onSave: () => void;
  readonly onSidebarToggle: () => void;
  readonly runState: PapaLabRunStateId;
}) {
  const runStateDefinition = findRunState(runState);

  return (
    <header className="pd-pal-top-bar">
      <div className="pd-pal-top-bar__title">
        <Icon decorative name="assistant" size={20} />
        <h1>Laboratorium Papa Asystenta</h1>
        <span className={`pd-pal-workbench-badge pd-pal-workbench-badge--${runStateDefinition.tone}`}>
          {runStateDefinition.label}
        </span>
      </div>

      <nav aria-label="Tryby Laboratorium" className="pd-pal-mode-switcher">
        {papaLabWorkbenchModes.map((mode) => (
          <button
            aria-current={activeMode === mode.id ? 'page' : undefined}
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            type="button"
          >
            <Icon decorative name={mode.icon} size={20} />
            <span>{mode.label}</span>
          </button>
        ))}
      </nav>

      <div className="pd-pal-top-bar__actions" aria-label="Akcje Laboratorium">
        <button
          aria-label={isSidebarCollapsed ? 'Pokaż analizy' : 'Ukryj analizy'}
          aria-pressed={!isSidebarCollapsed}
          className="pd-pal-icon-action"
          onClick={onSidebarToggle}
          title={isSidebarCollapsed ? 'Pokaż analizy' : 'Ukryj analizy'}
          type="button"
        >
          <Icon decorative name="menu" size={20} />
          <span>{isSidebarCollapsed ? 'Pokaż analizy' : 'Ukryj analizy'}</span>
        </button>
        <button
          aria-label={isInspectorCollapsed ? 'Pokaż inspektor' : 'Ukryj inspektor'}
          aria-pressed={!isInspectorCollapsed}
          className="pd-pal-icon-action"
          onClick={onInspectorToggle}
          title={isInspectorCollapsed ? 'Pokaż inspektor' : 'Ukryj inspektor'}
          type="button"
        >
          <Icon decorative name="data" size={20} />
          <span>{isInspectorCollapsed ? 'Pokaż inspektor' : 'Ukryj inspektor'}</span>
        </button>
        <button
          aria-label="Tryb skupienia"
          aria-pressed={isFocusMode}
          className="pd-pal-icon-action"
          onClick={onFocusModeToggle}
          type="button"
        >
          <Icon decorative name="search" size={20} />
          <span>Tryb skupienia</span>
        </button>
        <button className="pd-pal-secondary-action" onClick={onSave} type="button">
          <Icon decorative name="data" size={16} />
          <span>Zapisz</span>
        </button>
        <button className="pd-pal-run-action" onClick={onRun} type="button">
          <Icon decorative name="integration" size={16} />
          <span>Uruchom analizę</span>
        </button>
        <button aria-label="Więcej opcji" className="pd-pal-kebab-action" type="button">
          <Icon decorative name="menu" size={20} />
        </button>
      </div>
    </header>
  );
}

function PapaLabSidebar({
  onNewAnalysis,
}: {
  readonly onNewAnalysis: () => void;
}) {
  return (
    <aside aria-label="Nawigacja operacyjna Laboratorium" className="pd-pal-sidebar">
      <section className="pd-pal-sidebar__section">
        <header>
          <h2>Analizy</h2>
          <button onClick={onNewAnalysis} type="button">
            + Nowa analiza
          </button>
        </header>

        <div className="pd-pal-analysis-list">
          {papaLabWorkbenchAnalyses.map((analysis, index) => (
            <button
              aria-current={index === 0 ? 'page' : undefined}
              key={analysis.id}
              type="button"
            >
              <span className={`pd-pal-analysis-list__dot pd-pal-analysis-list__dot--${analysis.marker}`} aria-hidden="true" />
              <span>
                <strong>{analysis.name}</strong>
                <small>{analysis.meta}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="pd-pal-sidebar__section">
        <header>
          <h2>Biblioteka</h2>
          <span>24</span>
        </header>
        <div className="pd-pal-sidebar-list">
          {papaLabLibrarySections.map((item) => (
            <button key={item.label} type="button">
              <Icon decorative name={item.icon} size={16} />
              <span>{item.label}</span>
              <small>{item.count}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="pd-pal-sidebar__section">
        <header>
          <h2>Historia</h2>
          <span>48</span>
        </header>
        <div className="pd-pal-sidebar-list">
          {papaLabHistorySections.map((item) => (
            <button key={item.label} type="button">
              <Icon decorative name={item.icon} size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

function PapaLabCanvas({
  activeCanvasTab,
  activeMode,
  canvasTool,
  onCanvasTabChange,
  onCanvasToolChange,
}: {
  readonly activeCanvasTab: PapaLabCanvasTabId;
  readonly activeMode: PapaLabWorkbenchModeId;
  readonly canvasTool: PapaLabCanvasToolId;
  readonly onCanvasTabChange: (tab: PapaLabCanvasTabId) => void;
  readonly onCanvasToolChange: (tool: PapaLabCanvasToolId) => void;
}) {
  return (
    <section aria-label="AI Workbench" className="pd-pal-canvas">
      <header className="pd-pal-canvas__header">
        <div>
          <h2>
            <Icon decorative name="assistant" size={20} />
            AI Workbench
          </h2>
        </div>
        <div aria-label="Zakładki canvasu" className="pd-pal-canvas-tabs" role="tablist">
          {papaLabCanvasTabs.map((tab) => (
            <button
              aria-selected={activeCanvasTab === tab.id}
              key={tab.id}
              onClick={() => onCanvasTabChange(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="pd-pal-canvas__scroll">
        {activeCanvasTab === 'project' ? (
          <PapaLabProjectCanvas
            canvasTool={canvasTool}
            onCanvasToolChange={onCanvasToolChange}
          />
        ) : null}
        {activeCanvasTab === 'result' ? (
          <PapaLabResultCanvas activeMode={activeMode} />
        ) : null}
        {activeCanvasTab === 'comparison' ? (
          <PapaLabComparisonCanvas />
        ) : null}
      </div>
    </section>
  );
}

function PapaLabProjectCanvas({
  canvasTool,
  onCanvasToolChange,
}: {
  readonly canvasTool: PapaLabCanvasToolId;
  readonly onCanvasToolChange: (tool: PapaLabCanvasToolId) => void;
}) {
  const [instruction, setInstruction] = useState('Zdiagnozuj spadek konwersji checkout i przygotuj rekomendację możliwą do zatwierdzenia przez człowieka.');
  const [monthlyLimit, setMonthlyLimit] = useState(42);

  return (
    <div className="pd-pal-canvas-stack">
      <section className="pd-pal-work-panel pd-pal-work-panel--project">
        <header className="pd-pal-work-panel__header">
          <div>
            <h3>Projekt analizy</h3>
            <p>Cel, KPI, datasety, filtry, założenia i koszt uruchomienia.</p>
          </div>
          <span className="pd-pal-workbench-badge pd-pal-workbench-badge--slate">draft</span>
        </header>

        <div className="pd-pal-project-grid">
          <label>
            <span>Cel</span>
            <input defaultValue="Wyjaśnić spadek CR w checkout mobile" type="text" />
          </label>
          <label>
            <span>KPI</span>
            <select defaultValue="conversion">
              <option value="conversion">CR, checkout drop-off, płatności failed</option>
              <option value="margin">AOV, marża, CAC</option>
              <option value="returns">Zwroty, reklamacje, SLA</option>
            </select>
          </label>
          <label>
            <span>Datasety</span>
            <select defaultValue="sales">
              <option value="sales">orders, sessions, payments, erp_stock</option>
              <option value="ads">google_ads, meta_ads, attribution</option>
              <option value="support">returns, complaints, procedures</option>
            </select>
          </label>
          <label>
            <span>Okres</span>
            <select defaultValue="7d">
              <option value="7d">Ostatnie 7 dni</option>
              <option value="30d">Ostatnie 30 dni</option>
              <option value="90d">Ostatnie 90 dni</option>
            </select>
          </label>
          <label>
            <span>Filtry</span>
            <input defaultValue="device=mobile, payment_status=failed" type="text" />
          </label>
          <label>
            <span>Koszt / limit</span>
            <input
              max={120}
              min={5}
              onChange={(event) => setMonthlyLimit(Number(event.currentTarget.value))}
              type="range"
              value={monthlyLimit}
            />
            <small>{monthlyLimit} PLN limitu analizy</small>
          </label>
        </div>

        <label className="pd-pal-project-instruction">
          <span>Prompt / instrukcja</span>
          <textarea
            onChange={(event) => setInstruction(event.currentTarget.value)}
            rows={4}
            value={instruction}
          />
        </label>

        <div className="pd-pal-project-checks" aria-label="Założenia i wykluczenia">
          <label><input defaultChecked type="checkbox" /> Wyklucz transakcje testowe</label>
          <label><input defaultChecked type="checkbox" /> Użyj tylko jawnych źródeł evidence</label>
          <label><input type="checkbox" /> Uwzględnij sezonowość rok do roku</label>
        </div>
      </section>

      <section className="pd-pal-work-panel">
        <header className="pd-pal-work-panel__header">
          <div>
            <h3>Dodaj artefakt</h3>
            <p>Narzędzia działają w canvasie i zapisują wynik do raportu lub porównania.</p>
          </div>
        </header>
        <div className="pd-pal-tool-switcher" role="tablist" aria-label="Narzędzia canvasu">
          {([
            ['brief', 'Brief analizy', 'assistant'],
            ['chart', 'Wykres', 'trend'],
            ['whatIf', 'What-If', 'integration'],
            ['reports', 'Report Canvas', 'data'],
          ] as const).map(([tool, label, icon]) => (
            <button
              aria-selected={canvasTool === tool}
              key={tool}
              onClick={() => onCanvasToolChange(tool)}
              role="tab"
              type="button"
            >
              <Icon decorative name={icon} size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {canvasTool === 'chart' ? <PapaLabChartStudioTool /> : null}
        {canvasTool === 'whatIf' ? <PapaLabWhatIfTool /> : null}
        {canvasTool === 'reports' ? <PapaLabEmbeddedReportCanvas /> : null}
        {canvasTool === 'brief' ? (
          <div className="pd-pal-tool-brief">
            <ResponseList
              label="Wybrane wejścia"
              values={[
                'KPI: CR, drop-off checkout, payment failed rate.',
                'Źródła: orders, sessions, payments, erp_stock.',
                'Wykluczenia: transakcje testowe i ruch botów.',
              ]}
            />
            <ResponseList
              label="Koszt i governance"
              values={[
                'Limit kosztu: 42 PLN.',
                'Wykonanie akcji możliwe dopiero po zatwierdzeniu w DecisionQueue.',
              ]}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}

function PapaLabResultCanvas({
  activeMode,
}: {
  readonly activeMode: PapaLabWorkbenchModeId;
}) {
  const response = papaLabModeResponses[activeMode];

  return (
    <div className="pd-pal-result-layout">
      <section className="pd-pal-work-panel pd-pal-result-assistant" aria-label="Odpowiedź Papa Asystenta">
        <header className="pd-pal-assistant-shell__topbar">
          <div className="pd-pal-brand pd-pal-brand--compact">
            <div className="pd-pal-brand__mark" aria-hidden="true">
              P
            </div>
            <div>
              <span>Papa Asystent</span>
              <small>Analityka biznesowa</small>
            </div>
          </div>
          <span className="pd-pal-workbench-badge pd-pal-workbench-badge--emerald">Pewność: wysoka</span>
        </header>

        <div className="pd-pal-result-response">
          <StructuredResponse response={response} />
        </div>
      </section>

      <section className="pd-pal-work-panel">
        <header className="pd-pal-work-panel__header">
          <div>
            <h3>Trend konwersji checkout (7 dni)</h3>
            <p>Live preview z aktualnego Context Basket.</p>
          </div>
          <span className="pd-pal-workbench-badge pd-pal-workbench-badge--indigo">line</span>
        </header>
        <ChartPreview
          chartType="line"
          datasetId="conversion"
          palette="indigo"
          title="Trend konwersji checkout"
        />
      </section>

      <section className="pd-pal-work-panel pd-pal-next-step-panel">
        <header className="pd-pal-work-panel__header">
          <div>
            <h3>Następne kroki</h3>
            <p>Jawne kroki biznesowe, bez prywatnego rozumowania modelu.</p>
          </div>
        </header>
        {response.nextSteps.map((step, index) => (
          <label key={step}>
            <input defaultChecked={index === 0} type="checkbox" />
            <span>{step}</span>
          </label>
        ))}
        <label>
          <input type="checkbox" />
          <span>Monitoruj konwersję i błędy API przez 24h.</span>
        </label>
      </section>
    </div>
  );
}

function PapaLabComparisonCanvas() {
  const simulationData = useMemo(() => buildCausalSimulationData(15, 0, 5), []);

  return (
    <div className="pd-pal-canvas-stack">
      <section className="pd-pal-work-panel">
        <header className="pd-pal-work-panel__header">
          <div>
            <h3>Porównanie wariantów i rekomendacji</h3>
            <p>Warianty, wpływ, ryzyko, koszt i evidence w jednym widoku.</p>
          </div>
          <span className="pd-pal-workbench-badge pd-pal-workbench-badge--emerald">Scenariusz aktywny</span>
        </header>

        <div className="pd-pal-variant-grid">
          {[
            ['Bazowy', '2.14%', 'Obecna trajektoria bez zmian', 'slate'],
            ['Prawdopodobny', '2.31%', '+8% po cache i retry płatności', 'indigo'],
            ['Optymistyczny', '2.53%', '+18% przy poprawie UX i cache', 'emerald'],
            ['Pesymistyczny', '1.75%', '-18% jeśli błędy ERP wrócą', 'rose'],
          ].map(([name, value, detail, tone]) => (
            <article className={`pd-pal-variant-card pd-pal-variant-card--${tone}`} key={name}>
              <span>{name}</span>
              <strong>{value}</strong>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pd-pal-work-panel">
        <header className="pd-pal-work-panel__header">
          <div>
            <h3>Trajektoria scenariuszy</h3>
            <p>Bazowy, prawdopodobny, optymistyczny i pesymistyczny.</p>
          </div>
        </header>
        <div className="pd-pal-chart pd-pal-chart--tall" role="img" aria-label="Porównanie scenariuszy What-If">
          <ResponsiveContainer>
            <RechartsLineChart data={simulationData}>
              <CartesianGrid stroke="rgb(var(--pd-pal-slate-200))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line dataKey="probable" name="Scenariusz prawdopodobny" stroke="rgb(var(--pd-pal-indigo-600))" strokeWidth={3} type="monotone" />
              <Line dataKey="optimistic" name="Wariant optymistyczny (+18%)" stroke="rgb(var(--pd-pal-emerald-600))" strokeDasharray="5 5" strokeWidth={2} type="monotone" />
              <Line dataKey="pessimistic" name="Wariant pesymistyczny (-18%)" stroke="rgb(var(--pd-pal-rose-600))" strokeDasharray="2 2" strokeWidth={2} type="monotone" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="pd-pal-work-panel pd-pal-comparison-matrix">
        <h3>Macierz decyzji</h3>
        <div>
          <span>Wpływ</span>
          <strong>+0.39 p.p.</strong>
        </div>
        <div>
          <span>Ryzyko</span>
          <strong>Ograniczone</strong>
        </div>
        <div>
          <span>Koszt</span>
          <strong>42 PLN + DevOps</strong>
        </div>
        <div>
          <span>Evidence</span>
          <strong>4 źródła</strong>
        </div>
      </section>
    </div>
  );
}

function PapaLabInspector({
  activeInspectorTab,
  contextItems,
  currentDecisionState,
  decisionAuditLog,
  onContextAdd,
  onContextRemove,
  onDecisionTransition,
  onInspectorTabChange,
  runState,
}: {
  readonly activeInspectorTab: PapaLabInspectorTabId;
  readonly contextItems: readonly PapaLabContextBasketItem[];
  readonly currentDecisionState: PapaLabDecisionStateId;
  readonly decisionAuditLog: readonly string[];
  readonly onContextAdd: (item: Omit<PapaLabContextBasketItem, 'id'>) => void;
  readonly onContextRemove: (id: string) => void;
  readonly onDecisionTransition: (state: PapaLabDecisionStateId) => void;
  readonly onInspectorTabChange: (tab: PapaLabInspectorTabId) => void;
  readonly runState: PapaLabRunStateId;
}) {
  return (
    <aside aria-label="Inspektor analizy" className="pd-pal-inspector">
      <div className="pd-pal-inspector-tabs" role="tablist" aria-label="Zakładki inspectora">
        {papaLabInspectorTabs.map((tab) => (
          <button
            aria-selected={activeInspectorTab === tab.id}
            key={tab.id}
            onClick={() => onInspectorTabChange(tab.id)}
            role="tab"
            type="button"
          >
            <Icon decorative name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="pd-pal-inspector__scroll">
        {activeInspectorTab === 'context' ? (
          <PapaLabContextInspector
            items={contextItems}
            onAdd={onContextAdd}
            onRemove={onContextRemove}
          />
        ) : null}
        {activeInspectorTab === 'evidence' ? <PapaLabEvidenceInspector /> : null}
        {activeInspectorTab === 'quality' ? (
          <PapaLabQualityInspector runState={runState} />
        ) : null}
        {activeInspectorTab === 'actions' ? (
          <PapaLabActionsInspector
            auditLog={decisionAuditLog}
            currentState={currentDecisionState}
            onTransition={onDecisionTransition}
          />
        ) : null}
      </div>
    </aside>
  );
}

function PapaLabContextInspector({
  items,
  onAdd,
  onRemove,
}: {
  readonly items: readonly PapaLabContextBasketItem[];
  readonly onAdd: (item: Omit<PapaLabContextBasketItem, 'id'>) => void;
  readonly onRemove: (id: string) => void;
}) {
  const [draftType, setDraftType] = useState<PapaLabContextBasketItem['type']>('KPI');
  const [draftName, setDraftName] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draftName.trim();
    if (!name) return;
    onAdd({
      freshness: 'Real-time',
      name,
      scope: 'Dodany z workbencha',
      type: draftType,
    });
    setDraftName('');
  }

  return (
    <section className="pd-pal-inspector-panel" aria-labelledby="pd-pal-context-inspector-title">
      <header>
        <h3 id="pd-pal-context-inspector-title">Context Basket</h3>
        <span>{items.length} elementów</span>
      </header>

      <form className="pd-pal-inspector-form" onSubmit={handleSubmit}>
        <label>
          <span>Typ</span>
          <select
            onChange={(event) => setDraftType(event.currentTarget.value as PapaLabContextBasketItem['type'])}
            value={draftType}
          >
            <option value="KPI">KPI</option>
            <option value="Wykres">Wykres / fragment wykresu</option>
            <option value="Tabela">Wiersze tabeli</option>
            <option value="Rekomendacja">Rekomendacja</option>
            <option value="Plik">Plik</option>
            <option value="Raport">Raport</option>
            <option value="Procedura">Procedura</option>
          </select>
        </label>
        <label>
          <span>Nazwa</span>
          <input
            onChange={(event) => setDraftName(event.currentTarget.value)}
            placeholder="np. Bounce checkout mobile"
            type="text"
            value={draftName}
          />
        </label>
        <button type="submit">Dodaj do Context Basket</button>
      </form>

      <div className="pd-pal-context-list pd-pal-context-list--workbench">
        {items.map((item) => (
          <article className="pd-pal-context-item" key={item.id}>
            <span className="pd-pal-context-item__icon" aria-hidden="true">
              <Icon decorative name={iconForContextType(item.type)} size={16} />
            </span>
            <div>
              <h4>{item.name}</h4>
              <p>{item.scope} | {item.freshness}</p>
            </div>
            <button
              aria-label={`Usuń ${item.name}`}
              onClick={() => onRemove(item.id)}
              type="button"
            >
              Usuń
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function PapaLabEvidenceInspector() {
  return (
    <section className="pd-pal-inspector-panel" aria-labelledby="pd-pal-evidence-inspector-title">
      <header>
        <h3 id="pd-pal-evidence-inspector-title">Dowody i źródła</h3>
        <span>4 źródła</span>
      </header>
      <div className="pd-pal-evidence-list">
        {[
          ['orders.checkout_events', 'Dataset | snapshot 2025-05-18 10:35', 'Filtr: payment_status=failed'],
          ['payments.gateway_logs', 'Lineage: Stripe -> PapaData DWH', 'Zakres: 12-18 maj 2025'],
          ['erp.stock_updates', 'Ograniczenie: 504 Timeout w API ERP', 'Audit: retry policy active'],
          ['SOP-09 Procedura Reklamacji', 'Dokumentacja | v2.4', 'Użycie: interpretacja ograniczeń operacyjnych'],
        ].map(([name, meta, detail]) => (
          <article key={name}>
            <Icon decorative name="security" size={16} />
            <div>
              <h4>{name}</h4>
              <p>{meta}</p>
              <small>{detail}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PapaLabQualityInspector({
  runState,
}: {
  readonly runState: PapaLabRunStateId;
}) {
  const runStateDefinition = findRunState(runState);

  return (
    <section className="pd-pal-inspector-panel" aria-labelledby="pd-pal-quality-inspector-title">
      <header>
        <h3 id="pd-pal-quality-inspector-title">Jakość danych</h3>
        <span>{runStateDefinition.label}</span>
      </header>

      <div className="pd-pal-quality-grid">
        <article>
          <span>Confidence</span>
          <strong>wysoka</strong>
          <small>3 poziomy</small>
        </article>
        <article>
          <span>Świeżość</span>
          <strong>0-5m</strong>
          <small>Real-time</small>
        </article>
        <article>
          <span>Kompletność</span>
          <strong>92%</strong>
          <small>Dobra</small>
        </article>
        <article>
          <span>Readiness</span>
          <strong>gotowe</strong>
          <small>Możliwa rekomendacja</small>
        </article>
      </div>

      <ResponseList
        label="Brakujące dane"
        values={[
          'Logi VPS dla pełnej ścieżki błędu ERP.',
          '8% sesji zablokowanych przez AdBlock.',
        ]}
      />
      <ResponseList
        label="Ograniczenia"
        values={[
          'Symulacja zakłada stałe koszty konkurencji.',
          'Akcje wymagają capability manage_campaigns.',
        ]}
      />
      <article className="pd-pal-refusal-preview pd-pal-refusal-preview--compact">
        <strong>Refusal reason</strong>
        <p>Brak odmowy dla bieżącego wyniku. W przypadku danych niewystarczających użyj kodu insufficient_evidence.</p>
      </article>
    </section>
  );
}

function PapaLabActionsInspector({
  auditLog,
  currentState,
  onTransition,
}: {
  readonly auditLog: readonly string[];
  readonly currentState: PapaLabDecisionStateId;
  readonly onTransition: (state: PapaLabDecisionStateId) => void;
}) {
  const currentStateDefinition = papaLabDecisionStates.find((state) => state.id === currentState);
  const transitions = papaLabDecisionTransitions[currentState];

  return (
    <section className="pd-pal-inspector-panel" aria-labelledby="pd-pal-actions-inspector-title">
      <header>
        <h3 id="pd-pal-actions-inspector-title">Akcja w kolejce</h3>
        <span className={`pd-pal-state-badge pd-pal-state-badge--${currentStateDefinition?.tone ?? 'slate'}`}>
          {currentState}
        </span>
      </header>

      <article className="pd-pal-action-card">
        <small>DQ-2026-8891</small>
        <h4>Alokacja budżetu Google Ads (+15%)</h4>
        <p>Wymagany przegląd człowieka przed wykonaniem operacji w integracji.</p>
        <div className="pd-pal-button-row">
          {transitions.map((nextState) => (
            <button
              key={nextState}
              onClick={() => onTransition(nextState)}
              type="button"
            >
              {transitionLabel(nextState)}
            </button>
          ))}
        </div>
      </article>

      <section className="pd-pal-audit-log pd-pal-audit-log--workbench" aria-label="Audit trail DecisionQueue">
        <h4>Audit trail</h4>
        <div>
          {auditLog.slice(-4).map((item, index) => (
            <p key={`${item}-${index}`}>{item}</p>
          ))}
        </div>
      </section>
    </section>
  );
}

function PapaLabChartStudioTool() {
  const [chartType, setChartType] = useState<PapaLabChartTypeId>('line');
  const [datasetId, setDatasetId] = useState<PapaLabBusinessDatasetId>('conversion');
  const [timeframe, setTimeframe] = useState('30d');
  const [aggregation, setAggregation] = useState('avg');
  const [palette, setPalette] = useState<PapaLabPaletteId>('indigo');
  const [title, setTitle] = useState('Trend konwersji checkout');
  const [savedCharts, setSavedCharts] = useState<readonly PapaLabSavedChart[]>(papaLabSavedCharts);
  const dataset = findDataset(datasetId);

  function addChartToReport() {
    setSavedCharts((currentCharts) => [
      ...currentCharts,
      {
        id: `workbench-chart-${currentCharts.length + 1}`,
        metric: dataset.metric,
        title: title.trim() || 'Wykres Laboratorium',
        type: chartType,
      },
    ]);
  }

  return (
    <div className="pd-pal-tool-grid pd-pal-tool-grid--chart">
      <section className="pd-pal-tool-config" aria-labelledby="pd-pal-workbench-chart-config-title">
        <h4 id="pd-pal-workbench-chart-config-title">Konfigurator wykresu</h4>
        <div className="pd-pal-chart-type-grid">
          {papaLabChartTypes.map((type) => (
            <button
              aria-pressed={chartType === type.id}
              key={type.id}
              onClick={() => setChartType(type.id)}
              type="button"
            >
              <Icon decorative name={type.icon} size={16} />
              <span>{type.label}</span>
            </button>
          ))}
        </div>
        <label className="pd-pal-control">
          <span>Seria</span>
          <select
            onChange={(event) => setDatasetId(event.currentTarget.value as PapaLabBusinessDatasetId)}
            value={datasetId}
          >
            {papaLabBusinessDatasets.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <div className="pd-pal-control-grid">
          <label className="pd-pal-control">
            <span>Okres</span>
            <select onChange={(event) => setTimeframe(event.currentTarget.value)} value={timeframe}>
              {papaLabTimeframes.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="pd-pal-control">
            <span>Agregacja</span>
            <select onChange={(event) => setAggregation(event.currentTarget.value)} value={aggregation}>
              {papaLabAggregations.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="pd-pal-fieldset">
          <legend>Paleta</legend>
          <div className="pd-pal-palette-row">
            {papaLabPalettes.map((item) => (
              <label key={item.id}>
                <input
                  checked={palette === item.id}
                  name="pd-pal-workbench-studio-color"
                  onChange={() => setPalette(item.id)}
                  type="radio"
                />
                <span className={`pd-pal-swatch ${item.swatchClassName}`} aria-hidden="true" />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="pd-pal-control">
          <span>Tytuł</span>
          <input
            onChange={(event) => setTitle(event.currentTarget.value)}
            type="text"
            value={title}
          />
        </label>
        <button className="pd-pal-primary-action" onClick={addChartToReport} type="button">
          Dodaj wykres do Report Canvas
        </button>
      </section>

      <section className="pd-pal-tool-preview" aria-labelledby="pd-pal-workbench-preview-title">
        <header className="pd-pal-work-panel__header">
          <div>
            <h4 id="pd-pal-workbench-preview-title">{title || 'Podgląd wykresu'}</h4>
            <p>Zakres: {timeframe} | Agregacja: {aggregation}</p>
          </div>
          <span className="pd-pal-workbench-badge pd-pal-workbench-badge--indigo">{chartType}</span>
        </header>
        <ChartPreview
          chartType={chartType}
          datasetId={datasetId}
          palette={palette}
          title={title}
        />
      </section>

      <section className="pd-pal-tool-report-canvas" aria-labelledby="pd-pal-workbench-report-canvas-title">
        <header className="pd-pal-work-panel__header">
          <div>
            <h4 id="pd-pal-workbench-report-canvas-title">Report Canvas</h4>
            <p>{savedCharts.length} wykresów w zestawie.</p>
          </div>
        </header>
        <div className="pd-pal-saved-chart-grid">
          {savedCharts.map((chart) => (
            <article className="pd-pal-saved-chart" key={chart.id}>
              <header>
                <strong>{chart.title}</strong>
                <span>{chart.type}</span>
              </header>
              <MiniChart chart={chart} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function PapaLabWhatIfTool() {
  const [adBudget, setAdBudget] = useState(15);
  const [price, setPrice] = useState(0);
  const [ux, setUx] = useState(5);
  const [nlPrompt, setNlPrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const simulationData = useMemo(
    () => buildCausalSimulationData(adBudget, price, ux),
    [adBudget, price, ux],
  );

  function handleNlSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nlPrompt.trim()) return;
    setGeneratedPrompt(nlPrompt.trim());
    setNlPrompt('');
  }

  return (
    <div className="pd-pal-tool-grid pd-pal-tool-grid--what-if">
      <section className="pd-pal-tool-config" aria-labelledby="pd-pal-workbench-what-if-title">
        <h4 id="pd-pal-workbench-what-if-title">Parametry scenariusza</h4>
        <ScenarioSlider
          help="Wpływ na zasięg i unikalne sesje"
          label="Budżet Marketingowy Ads"
          max={100}
          min={-50}
          onChange={setAdBudget}
          step={5}
          value={adBudget}
        />
        <ScenarioSlider
          help="Elastyczność popytowa i marża"
          label="Cena Produktu (AOV)"
          max={50}
          min={-30}
          onChange={setPrice}
          step={2}
          value={price}
        />
        <ScenarioSlider
          help="Redukcja porzuceń koszyka"
          label="Optymalizacja UX Checkout"
          max={30}
          min={-10}
          onChange={setUx}
          step={1}
          value={ux}
        />
        <form className="pd-pal-nl-form" onSubmit={handleNlSubmit}>
          <h4>Natural Language Chart Synthesizer</h4>
          <label className="pd-pal-sr-only" htmlFor="pd-pal-workbench-nl-chart-input">
            Komenda Natural Language Chart Synthesizer
          </label>
          <input
            id="pd-pal-workbench-nl-chart-input"
            onChange={(event) => setNlPrompt(event.currentTarget.value)}
            placeholder="np. pokaż wpływ cache na checkout mobile"
            type="text"
            value={nlPrompt}
          />
          <button type="submit">Wygeneruj wykres AI</button>
          {generatedPrompt ? (
            <p className="pd-pal-nl-form__status">Wykres AI: {generatedPrompt.slice(0, 48)}</p>
          ) : null}
        </form>
      </section>

      <section className="pd-pal-tool-preview" aria-labelledby="pd-pal-workbench-trajectory-title">
        <header className="pd-pal-work-panel__header">
          <div>
            <h4 id="pd-pal-workbench-trajectory-title">Trajektoria scenariuszy</h4>
            <p>Bazowy, prawdopodobny, optymistyczny i pesymistyczny.</p>
          </div>
          <span className="pd-pal-workbench-badge pd-pal-workbench-badge--emerald">aktywny</span>
        </header>
        <div className="pd-pal-chart pd-pal-chart--tall" role="img" aria-label="Wykres symulacji What-If">
          <ResponsiveContainer>
            <RechartsLineChart data={simulationData}>
              <CartesianGrid stroke="rgb(var(--pd-pal-slate-200))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line dataKey="probable" name="Scenariusz prawdopodobny" stroke="rgb(var(--pd-pal-indigo-600))" strokeWidth={3} type="monotone" />
              <Line dataKey="optimistic" name="Wariant optymistyczny (+18%)" stroke="rgb(var(--pd-pal-emerald-600))" strokeDasharray="5 5" strokeWidth={2} type="monotone" />
              <Line dataKey="pessimistic" name="Wariant pesymistyczny (-18%)" stroke="rgb(var(--pd-pal-rose-600))" strokeDasharray="2 2" strokeWidth={2} type="monotone" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="pd-pal-risk-radar" aria-labelledby="pd-pal-workbench-risk-title">
        <div>
          <h4 id="pd-pal-workbench-risk-title">Compliance / risk radar</h4>
          <p>Ocena ryzyka służy do przeglądu. Nie wykonuje automatycznie operacji.</p>
        </div>
        <div className="pd-pal-chart pd-pal-chart--radar" role="img" aria-label="Radar zgodności AI Act">
          <ResponsiveContainer>
            <RechartsRadarChart data={papaLabCompliancePillars}>
              <PolarGrid stroke="rgb(var(--pd-pal-slate-200))" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[50, 100]} tick={{ fontSize: 9 }} />
              <Radar
                dataKey="score"
                fill="rgb(var(--pd-pal-indigo-600) / 0.24)"
                name="Indeks audytowy Papa AI"
                stroke="rgb(var(--pd-pal-indigo-600))"
              />
              <Tooltip />
            </RechartsRadarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function PapaLabEmbeddedReportCanvas() {
  return (
    <div className="pd-pal-tool-report-canvas pd-pal-tool-report-canvas--standalone">
      <header className="pd-pal-work-panel__header">
        <div>
          <h4>Biblioteka artefaktów i raportów</h4>
          <p>Report jobs, eksporty i artefakty AI dostępne bez opuszczania workbencha.</p>
        </div>
      </header>
      <div className="pd-pal-table-wrap">
        <table className="pd-pal-table">
          <thead>
            <tr>
              <th>Nazwa artefaktu</th>
              <th>Typ</th>
              <th>Wersja</th>
              <th>Status joba</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {papaLabArtifactRows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td><span className="pd-pal-pill pd-pal-pill--blue">{row.type}</span></td>
                <td>{row.version}</td>
                <td><span className="pd-pal-pill pd-pal-pill--emerald">{row.status}</span></td>
                <td><button type="button">{row.action}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PapaLabHeader({
  activeTab,
  onTabChange,
}: {
  readonly activeTab: PapaLabTabId;
  readonly onTabChange: (tab: PapaLabTabId) => void;
}) {
  return (
    <header className="pd-pal-header">
      <div className="pd-pal-header__inner">
        <div className="pd-pal-header__top">
          <div className="pd-pal-brand">
            <div className="pd-pal-brand__mark" aria-hidden="true">
              P
            </div>
            <div className="pd-pal-brand__copy">
              <div className="pd-pal-brand__title-row">
                <h1>Papa Asystent</h1>
                <span className="pd-pal-pill pd-pal-pill--indigo">
                  AI Analytics & Builder
                </span>
              </div>
              <p>Kontekstowa warstwa analityki, raportowania i symulacji PapaData</p>
            </div>
          </div>

          <div className="pd-pal-status" aria-label="Status systemu">
            <span className="pd-pal-status__dot" aria-hidden="true" />
            <span>Studio Wykresów: Gotowe do projektowania</span>
          </div>
        </div>

        <nav
          aria-label="Sekcje Laboratorium Papa Asystenta"
          className="pd-pal-tabs"
        >
          {papaLabTabs.map((tab) => (
            <button
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className="pd-pal-tabs__item"
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              type="button"
            >
              <Icon decorative name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function PapaLabTabPanel({
  activeTab,
}: {
  readonly activeTab: PapaLabTabId;
}) {
  switch (activeTab) {
    case 'shell':
      return <AssistantShellSimulator />;
    case 'context':
      return <ContextBasketPanel />;
    case 'queue':
      return <DecisionQueueSimulator />;
    case 'analytics':
      return <EvidenceAndRefusalsPanel />;
    case 'builder':
      return <ChartStudioBuilder />;
    case 'innovation':
      return <CausalScenarioSimulator />;
    case 'lab':
      return <PapaLabReports />;
    case 'overview':
    default:
      return <PapaLabOverview />;
  }
}

export function PapaLabOverview() {
  return (
    <section className="pd-pal-stack" aria-labelledby="pd-pal-overview-title">
      <IntroPanel
        body="Ten widok przedstawia fundamenty architektoniczne modułu Papa Asystent. Moduł nie jest prostym chatbotem dyskusyjnym ani odizolowanym silnikiem LLM, pełni rolę kontekstowej warstwy analitycznej i wizualizacyjnej AI działającej bezpośrednio nad panelem operacyjnym PapaData. Poznaj główne zasady zaufania, granice uprawnień oraz model współpracy człowieka z systemem AI."
        id="pd-pal-overview-title"
        title="Konstrukcja i Rola Modułu Papa Asystent"
      />

      <PriorityBand
        actions={(
          <aside className="pd-pal-hero-band__policy" aria-label="Polityka bezpieczeństwa">
            <span>Polityka Bezpieczeństwa</span>
            <strong>Human-in-the-Loop</strong>
            <small>Brak zmian bez zatwierdzenia</small>
          </aside>
        )}
        aria-label="Najkrótsza definicja produktu"
        badgeLabel="Najkrótsza definicja produktu"
        title="Papa Asystent = Analityka + Studio Wykresów + Symulacje What-If + Bezpieczne AI Actions"
        tone="hero"
      >
        <p>
          Asystent czyta dane workspace, aktywny ekran, filtry, wykresy i uprawnienia użytkownika. Pozwala na samodzielne komponowanie dynamicznych raportów graficznych oraz przeprowadzenie symulacji przyczynowo-skutkowych przed podjęciem decyzji biznesowej.
        </p>
      </PriorityBand>

      <div className="pd-pal-card-grid pd-pal-card-grid--thirds">
        {papaLabOverviewCards.map((card) => (
          <section
            className={`pd-pal-section-card pd-pal-section-card--${card.tone}`}
            key={card.title}
          >
            <span className="pd-pal-section-card__icon" aria-hidden="true">
              <Icon decorative name={card.icon} size={20} />
            </span>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </section>
        ))}
      </div>
    </section>
  );
}

export function AssistantShellSimulator() {
  const [activeMode, setActiveMode] = useState<PapaLabWorkModeId>('brief');
  const [composerValue, setComposerValue] = useState('');
  const [lastPrompt, setLastPrompt] = useState('Wygeneruj analizę i rekomendacje dla aktywnego ekranu.');
  const response = papaLabModeResponses[activeMode];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!composerValue.trim()) return;
    setLastPrompt(composerValue.trim());
    setComposerValue('');
  }

  return (
    <section className="pd-pal-stack" aria-labelledby="pd-pal-shell-title">
      <IntroPanel
        body="Ten moduł pozwala przetestować architekturę interfejsu AssistantShell. Wybierz jeden z 6 oficjalnych trybów pracy, aby zaobserwować dynamiczną generację ustrukturyzowanej odpowiedzi, weryfikację evidence oraz obowiązkowy baner transparentności zgodny z Art. 50 EU AI Act."
        id="pd-pal-shell-title"
        title="Interaktywny Symulator Interfejsu AssistantShell"
      />

      <div className="pd-pal-split pd-pal-split--shell">
        <section className="pd-pal-panel" aria-labelledby="pd-pal-mode-title">
          <h3 id="pd-pal-mode-title">Wybierz Tryb Pracy Asystenta</h3>
          <div className="pd-pal-mode-list">
            {papaLabWorkModes.map((mode) => (
              <button
                aria-pressed={activeMode === mode.id}
                className="pd-pal-mode-list__item"
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                type="button"
              >
                <Icon decorative name={mode.icon} size={20} />
                <span>
                  <strong>{mode.label}</strong>
                  <small>{mode.summary}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="pd-pal-assistant-shell" aria-label="Symulator rozmowy Papa Asystenta">
          <header className="pd-pal-assistant-shell__topbar">
            <div className="pd-pal-brand pd-pal-brand--compact">
              <div className="pd-pal-brand__mark" aria-hidden="true">
                P
              </div>
              <div>
                <span>Papa Asystent</span>
                <small>Kontekstowa analityka biznesowa</small>
              </div>
            </div>
            <span className="pd-pal-pill pd-pal-pill--emerald">AI Active</span>
          </header>

          <div className="pd-pal-ai-notice">
            <Icon decorative name="warning" size={20} />
            <div>
              <strong>Obowiązkowa informacja AI (EU AI Act Article 50)</strong>
              <p>Odpowiada Papa Asystent AI. Wynik jest generowany automatycznie na podstawie danych workspace i aktywnych filtrów.</p>
            </div>
          </div>

          <div className="pd-pal-thread" aria-label="Wiadomości symulatora">
            <article className="pd-pal-message pd-pal-message--user">
              <span>Użytkownik (Tryb: {activeMode.toUpperCase()})</span>
              <p>{lastPrompt}</p>
            </article>

            <article className="pd-pal-message pd-pal-message--assistant">
              <header>
                <span>
                  <span className="pd-pal-message__dot" aria-hidden="true" />
                  Papa Asystent
                </span>
                <strong>Confidence: Wysoka</strong>
              </header>

              <StructuredResponse response={response} />
            </article>
          </div>

          <form className="pd-pal-composer" onSubmit={handleSubmit}>
            <label className="pd-pal-sr-only" htmlFor="pd-pal-composer-input">
              Zadaj pytanie dotyczące aktywnego ekranu lub danych
            </label>
            <input
              id="pd-pal-composer-input"
              onChange={(event) => setComposerValue(event.currentTarget.value)}
              placeholder="Zadaj pytanie dotyczące aktywnego ekranu lub danych..."
              type="text"
              value={composerValue}
            />
            <button type="submit">
              <span>Wyślij</span>
              <Icon decorative name="integration" size={16} />
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}

function StructuredResponse({
  response,
}: {
  readonly response: typeof papaLabModeResponses[PapaLabWorkModeId];
}) {
  return (
    <div className="pd-pal-structured-response">
      <ResponseList label="Fakty" values={response.facts} />
      <ResponseList label="Interpretacje" values={response.interpretations} />
      <ResponseList label="Hipotezy" values={response.hypotheses} />

      <div className="pd-pal-recommendation-callout">
        <div>
          <strong>Rekomendacja AI</strong>
          <span>Prognoza AI</span>
        </div>
        <p>{response.recommendations[0]}</p>
      </div>

      <ResponseList label="Ograniczenia" values={response.limitations} />
      <ResponseList label="Następne kroki" values={response.nextSteps} />
    </div>
  );
}

function ResponseList({
  label,
  values,
}: {
  readonly label: string;
  readonly values: readonly string[];
}) {
  return (
    <div className="pd-pal-response-list">
      <strong>{label}</strong>
      <ul>
        {values.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
    </div>
  );
}

export function ContextBasketPanel() {
  const [items, setItems] = useState<readonly PapaLabContextBasketItem[]>(papaLabContextBasketSeed);
  const [draftType, setDraftType] = useState<PapaLabContextBasketItem['type']>('KPI');
  const [draftName, setDraftName] = useState('');
  const [draftFreshness, setDraftFreshness] = useState('Przed chwilą (Real-time)');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draftName.trim();
    if (!name) return;

    setItems((currentItems) => [
      ...currentItems,
      {
        freshness: draftFreshness.trim() || 'Real-time',
        id: `cb-${currentItems.length + 1}`,
        name,
        scope: 'Dodany z widoku',
        type: draftType,
      },
    ]);
    setDraftName('');
  }

  return (
    <section className="pd-pal-stack" aria-labelledby="pd-pal-context-title">
      <IntroPanel
        body="Papa Asystent nie pobiera abstrakcyjnych danych. Użytkownik może świadomie dodawać i usuwać obiekty z ekranu do tzw. Context Basket: KPI, fragmenty wykresów, wiersze tabel, raporty czy procedury pomocy."
        id="pd-pal-context-title"
        title="Zarządzanie Koszykiem Kontekstu (Context Basket)"
      />

      <div className="pd-pal-split pd-pal-split--context">
        <section className="pd-pal-panel" aria-labelledby="pd-pal-context-form-title">
          <h3 id="pd-pal-context-form-title">Dodaj Nowy Element do Koszyka</h3>

          <form className="pd-pal-form" onSubmit={handleSubmit}>
            <label>
              <span>Typ Obiektu</span>
              <select
                onChange={(event) => setDraftType(event.currentTarget.value as PapaLabContextBasketItem['type'])}
                value={draftType}
              >
                <option value="KPI">KPI Metric (np. MRR, Konwersja)</option>
                <option value="Wykres">Fragment Wykresu (Trend 30d)</option>
                <option value="Tabela">Wiersze Tabeli (Zamówienia)</option>
                <option value="Procedura">Procedura Pomocy (SOP-04)</option>
              </select>
            </label>

            <label>
              <span>Nazwa Obiektu</span>
              <input
                onChange={(event) => setDraftName(event.currentTarget.value)}
                placeholder="np. Współczynnik Odrzuceń Koszyka"
                type="text"
                value={draftName}
              />
            </label>

            <label>
              <span>Świeżość</span>
              <input
                onChange={(event) => setDraftFreshness(event.currentTarget.value)}
                type="text"
                value={draftFreshness}
              />
            </label>

            <button className="pd-pal-primary-action" type="submit">
              Dodaj do Context Basket
            </button>
          </form>
        </section>

        <section className="pd-pal-panel pd-pal-panel--list" aria-labelledby="pd-pal-context-list-title">
          <header className="pd-pal-panel__header">
            <div>
              <h3 id="pd-pal-context-list-title">Zawartość Context Basket</h3>
              <p>Elementy aktualnie przekazywane do promptu Papa Asystenta</p>
            </div>
            <span className="pd-pal-pill pd-pal-pill--indigo">{items.length} elementy</span>
          </header>

          <div className="pd-pal-context-list">
            {items.map((item) => (
              <article className="pd-pal-context-item" key={item.id}>
                <span className="pd-pal-context-item__icon" aria-hidden="true">
                  <Icon decorative name={iconForContextType(item.type)} size={16} />
                </span>
                <div>
                  <h4>{item.name}</h4>
                  <p>Zakres: {item.scope} | Świeżość: {item.freshness}</p>
                </div>
                <button
                  onClick={() => setItems((currentItems) => currentItems.filter((candidate) => candidate.id !== item.id))}
                  type="button"
                >
                  Usuń
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export function DecisionQueueSimulator() {
  const [currentState, setCurrentState] = useState<PapaLabDecisionStateId>('proposed');
  const [auditLog, setAuditLog] = useState<readonly string[]>([
    '[10:42:01] System AI utworzył wniosek akcji. Status: proposed.',
  ]);
  const transitions = papaLabDecisionTransitions[currentState];
  const currentStateDefinition = papaLabDecisionStates.find((state) => state.id === currentState);

  function transitionTo(nextState: PapaLabDecisionStateId) {
    const time = new Date().toTimeString().split(' ')[0];
    setCurrentState(nextState);
    setAuditLog((currentLog) => [
      ...currentLog,
      `[${time}] DecisionQueue -> ${nextState}`,
    ]);
  }

  return (
    <section className="pd-pal-stack" aria-labelledby="pd-pal-queue-title">
      <IntroPanel
        body="Papa Asystent działa według rygorystycznej zasady: AI tworzy wyłącznie propozycje akcji (Proposals). Zmiany trafiają do bezpiecznej kolejki DecisionQueue. Ten symulator prezentuje pełną maszynę stanów (12 stanów)."
        id="pd-pal-queue-title"
        title="Transakcyjność i Bezpieczeństwo Execucji: DecisionQueue"
      />

      <div className="pd-pal-split pd-pal-split--queue">
        <section className="pd-pal-panel" aria-labelledby="pd-pal-state-machine-title">
          <h3 id="pd-pal-state-machine-title">Maszyna Stanów Decyzji</h3>

          <article className="pd-pal-decision-card">
            <header>
              <div>
                <span>ID Akcji: DQ-2026-8891</span>
                <h4>Alokacja budżetu reklamowego Google Ads (+15%)</h4>
              </div>
              <span className={`pd-pal-state-badge pd-pal-state-badge--${currentStateDefinition?.tone ?? 'slate'}`}>
                {currentState}
              </span>
            </header>

            <section aria-label="Symuluj przejście stanów">
              <span>Symuluj przejście stanów:</span>
              <div className="pd-pal-button-row">
                {transitions.map((nextState) => (
                  <button
                    key={nextState}
                    onClick={() => transitionTo(nextState)}
                    type="button"
                  >
                    {transitionLabel(nextState)}
                  </button>
                ))}
              </div>
            </section>
          </article>

          <section className="pd-pal-audit-log" aria-labelledby="pd-pal-audit-title">
            <h4 id="pd-pal-audit-title">Ścieżka Audytowa Transakcji (Audit Trail)</h4>
            <div>
              {auditLog.map((item, index) => (
                <p key={`${item}-${index}`}>{item}</p>
              ))}
            </div>
          </section>
        </section>

        <section className="pd-pal-panel" aria-labelledby="pd-pal-state-dictionary-title">
          <h3 id="pd-pal-state-dictionary-title">Słownik Stanów DecisionQueue</h3>
          <div className="pd-pal-state-list">
            {papaLabDecisionStates.map((state) => (
              <article className="pd-pal-state-list__item" key={state.id}>
                <strong className={`pd-pal-tone-text pd-pal-tone-text--${state.tone}`}>{state.id}</strong>
                <span>{state.description}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export function EvidenceAndRefusalsPanel() {
  const [selectedReason, setSelectedReason] = useState<(typeof papaLabRefusalReasons)[number]>(
    papaLabRefusalReasons[0],
  );

  return (
    <section className="pd-pal-stack" aria-labelledby="pd-pal-evidence-title">
      <IntroPanel
        body="Zgodnie ze specyfikacją, Asystent posługuje się wyłącznie 3 dyskretnymi poziomami zaufania: wysoka, ograniczona, niewystarczająca i generuje formalny kod odmowy AIRefusalReason."
        id="pd-pal-evidence-title"
        title="Pewność (Confidence), Jakość Danych i Mechanizmy Odmów"
      />

      <div className="pd-pal-card-grid pd-pal-card-grid--halves">
        <section className="pd-pal-panel" aria-labelledby="pd-pal-confidence-chart-title">
          <h3 id="pd-pal-confidence-chart-title">Rozkład Poziomów Zaufania (Confidence)</h3>
          <div className="pd-pal-chart" role="img" aria-label="Wykres pierścieniowy poziomów zaufania">
            <ResponsiveContainer>
              <RechartsPieChart>
                <Pie
                  data={papaLabConfidenceSegments}
                  dataKey="value"
                  innerRadius="58%"
                  nameKey="name"
                  outerRadius="82%"
                  paddingAngle={3}
                >
                  {papaLabConfidenceSegments.map((segment) => (
                    <Cell
                      fill={toneColor(segment.tone)}
                      key={segment.name}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="pd-pal-panel" aria-labelledby="pd-pal-data-status-chart-title">
          <h3 id="pd-pal-data-status-chart-title">Status Świeżości i Jakości Danych</h3>
          <div className="pd-pal-chart" role="img" aria-label="Wykres słupkowy statusu danych">
            <ResponsiveContainer>
              <RechartsBarChart data={papaLabDataStatus}>
                <CartesianGrid stroke="rgb(var(--pd-pal-slate-200))" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="rgb(var(--pd-pal-indigo-600))" radius={[6, 6, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="pd-pal-panel" aria-labelledby="pd-pal-refusal-title">
        <h3 id="pd-pal-refusal-title">Symulator Kodów Odmów AI (AIRefusalReason)</h3>
        <div className="pd-pal-refusal-grid">
          {papaLabRefusalReasons.map((reason) => (
            <button
              aria-pressed={selectedReason.code === reason.code}
              key={reason.code}
              onClick={() => setSelectedReason(reason)}
              type="button"
            >
              {reason.code}
            </button>
          ))}
        </div>

        <article className="pd-pal-refusal-preview">
          <strong>
            Kod Odmowy:{' '}
            <code>{selectedReason.code}</code>
          </strong>
          <p>&quot;{selectedReason.text}&quot;</p>
        </article>
      </section>
    </section>
  );
}

export function ChartStudioBuilder() {
  const [chartType, setChartType] = useState<PapaLabChartTypeId>('line');
  const [datasetId, setDatasetId] = useState<PapaLabBusinessDatasetId>('sales');
  const [timeframe, setTimeframe] = useState('30d');
  const [aggregation, setAggregation] = useState('sum');
  const [palette, setPalette] = useState<PapaLabPaletteId>('indigo');
  const [title, setTitle] = useState('Wskaźnik Sprzedaży i Dynamiki Q3');
  const [savedCharts, setSavedCharts] = useState<readonly PapaLabSavedChart[]>(papaLabSavedCharts);
  const dataset = findDataset(datasetId);

  function addChartToDashboard() {
    setSavedCharts((currentCharts) => [
      ...currentCharts,
      {
        id: `sc-${currentCharts.length + 1}`,
        metric: dataset.metric,
        title: title.trim() || 'Wykres Klienta',
        type: chartType,
      },
    ]);
  }

  return (
    <section className="pd-pal-stack" aria-labelledby="pd-pal-builder-title">
      <section className="pd-pal-panel pd-pal-panel--intro">
        <div>
          <span className="pd-pal-pill pd-pal-pill--indigo">Nowość w Interfejsie</span>
          <h2 id="pd-pal-builder-title">Studio Wykresów & Visual Report Builder</h2>
          <p>
            Pozwól klientom projektować własny szablon raportu graficznego. Wybieraj typy wykresów z biblioteki, dostosowuj serie danych, dobieraj unikalną paletę barwną i podglądaj efekt na żywo.
          </p>
        </div>
        <button className="pd-pal-primary-action" onClick={addChartToDashboard} type="button">
          Dodaj Zaprojektowany Wykres do Raportu
        </button>
      </section>

      <div className="pd-pal-split pd-pal-split--builder">
        <section className="pd-pal-panel" aria-labelledby="pd-pal-chart-config-title">
          <h3 id="pd-pal-chart-config-title">Konfigurator Wykresu</h3>

          <div className="pd-pal-fieldset">
            <span>1. Wybierz Typ Wykresu</span>
            <div className="pd-pal-chart-type-grid">
              {papaLabChartTypes.map((type) => (
                <button
                  aria-pressed={chartType === type.id}
                  key={type.id}
                  onClick={() => setChartType(type.id)}
                  type="button"
                >
                  <Icon decorative name={type.icon} size={16} />
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="pd-pal-control">
            <span>2. Seria Danych Biznesowych</span>
            <select
              onChange={(event) => setDatasetId(event.currentTarget.value as PapaLabBusinessDatasetId)}
              value={datasetId}
            >
              {papaLabBusinessDatasets.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="pd-pal-control-grid">
            <label className="pd-pal-control">
              <span>Zakres Czasu</span>
              <select onChange={(event) => setTimeframe(event.currentTarget.value)} value={timeframe}>
                {papaLabTimeframes.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className="pd-pal-control">
              <span>Agregacja</span>
              <select onChange={(event) => setAggregation(event.currentTarget.value)} value={aggregation}>
                {papaLabAggregations.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="pd-pal-fieldset">
            <legend>3. Paleta Kolorów Wykresu</legend>
            <div className="pd-pal-palette-row">
              {papaLabPalettes.map((item) => (
                <label key={item.id}>
                  <input
                    checked={palette === item.id}
                    name="pd-pal-studio-color"
                    onChange={() => setPalette(item.id)}
                    type="radio"
                  />
                  <span className={`pd-pal-swatch ${item.swatchClassName}`} aria-hidden="true" />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="pd-pal-control">
            <span>Tytuł Wykresu na Raporce</span>
            <input
              onChange={(event) => setTitle(event.currentTarget.value)}
              type="text"
              value={title}
            />
          </label>

          <p className="pd-pal-config-summary">
            Zakres: {timeframe} | Agregacja: {aggregation}
          </p>
        </section>

        <div className="pd-pal-stack">
          <section className="pd-pal-panel" aria-labelledby="pd-pal-preview-title">
            <header className="pd-pal-panel__header">
              <div>
                <h3 id="pd-pal-preview-title">{title || 'Podgląd Wykresu'}</h3>
                <p>Renderowany w czasie rzeczywistym w Storybooku przez Recharts.</p>
              </div>
              <span className="pd-pal-pill pd-pal-pill--indigo">{chartType.toUpperCase()}</span>
            </header>

            <ChartPreview
              chartType={chartType}
              datasetId={datasetId}
              palette={palette}
              title={title}
            />
          </section>

          <section className="pd-pal-panel" aria-labelledby="pd-pal-report-canvas-title">
            <header className="pd-pal-panel__header">
              <h3 id="pd-pal-report-canvas-title">Twój Spersonalizowany Układ Raportu (Report Canvas)</h3>
              <span>{savedCharts.length} wykresów w zestawie</span>
            </header>

            <div className="pd-pal-saved-chart-grid">
              {savedCharts.map((chart) => (
                <article className="pd-pal-saved-chart" key={chart.id}>
                  <header>
                    <strong>{chart.title}</strong>
                    <span>{chart.type}</span>
                  </header>
                  <MiniChart chart={chart} />
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

export function CausalScenarioSimulator() {
  const [adBudget, setAdBudget] = useState(15);
  const [price, setPrice] = useState(0);
  const [ux, setUx] = useState(5);
  const [nlPrompt, setNlPrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const simulationData = useMemo(
    () => buildCausalSimulationData(adBudget, price, ux),
    [adBudget, price, ux],
  );

  function handleNlSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nlPrompt.trim()) return;
    setGeneratedPrompt(nlPrompt.trim());
    setNlPrompt('');
  }

  return (
    <section className="pd-pal-stack" aria-labelledby="pd-pal-causal-title">
      <section className="pd-pal-hero-band pd-pal-hero-band--innovation">
        <div>
          <span className="pd-pal-pill pd-pal-pill--amber">Unikat na Rynku Polskim</span>
          <span className="pd-pal-kicker">Autonomous Autonomous Causal Engine</span>
          <h2 id="pd-pal-causal-title">AI Causal Scenario Simulator & Natural Language Chart Synthesizer</h2>
          <p>
            Większość polskich narzędzi raportowych tworzy statyczne zestawienia wstecz. Papa Asystent wprowdza symulator przyczynowo-skutkowy ad-hoc: manipuluj zmiennymi bizasowymi, a AI w czasie rzeczywistym przeliczy optymistyczny, bazowy i pesymistyczny wariant przyszłej konwersji na wykresie oraz oceni wskaźnik ryzyka zgodności z EU AI Act Risk Audit.
          </p>
        </div>
      </section>

      <div className="pd-pal-split pd-pal-split--innovation">
        <section className="pd-pal-panel" aria-labelledby="pd-pal-sliders-title">
          <h3 id="pd-pal-sliders-title">Suwaki Scenariusza &quot;What-If&quot;</h3>
          <ScenarioSlider
            help="Wpływ na zasięg i unikalne sesje"
            label="Budżet Marketingowy Ads"
            max={100}
            min={-50}
            onChange={setAdBudget}
            step={5}
            value={adBudget}
          />
          <ScenarioSlider
            help="Elastyczność popytowa i marża"
            label="Cena Produktu (AOV)"
            max={50}
            min={-30}
            onChange={setPrice}
            step={2}
            value={price}
          />
          <ScenarioSlider
            help="Redukcja porzuceń koszyka"
            label="Optymalizacja UX Checkout"
            max={30}
            min={-10}
            onChange={setUx}
            step={1}
            value={ux}
          />

          <form className="pd-pal-nl-form" onSubmit={handleNlSubmit}>
            <h4>Natural Language Chart Synthesizer</h4>
            <p>Wpisz komendę, aby AI automatycznie wygenerowało dedykowany wykres:</p>
            <label className="pd-pal-sr-only" htmlFor="pd-pal-nl-chart-input">
              Komenda Natural Language Chart Synthesizer
            </label>
            <input
              id="pd-pal-nl-chart-input"
              onChange={(event) => setNlPrompt(event.currentTarget.value)}
              placeholder="np. Wygeneruj korelację między czasem w appce a Churn"
              type="text"
              value={nlPrompt}
            />
            <button type="submit">Wygeneruj Wykres AI</button>
            {generatedPrompt ? (
              <p className="pd-pal-nl-form__status">Wykres AI: {generatedPrompt.slice(0, 48)}</p>
            ) : null}
          </form>
        </section>

        <div className="pd-pal-stack">
          <section className="pd-pal-panel" aria-labelledby="pd-pal-trajectory-title">
            <header className="pd-pal-panel__header">
              <div>
                <h3 id="pd-pal-trajectory-title">Trajektoria Przyczynowo-Skutkowa (Symulacja Prodyktywna)</h3>
                <p>Kalkulacja wariantów: Bazowy, Scenariusz Prawdopodobny, Scenariusz Skrajny</p>
              </div>
              <span className="pd-pal-pill pd-pal-pill--emerald">Scenariusz: Aktywny</span>
            </header>
            <div className="pd-pal-chart pd-pal-chart--tall" role="img" aria-label="Wykres symulacji przyczynowo-skutkowej">
              <ResponsiveContainer>
                <RechartsLineChart data={simulationData}>
                  <CartesianGrid stroke="rgb(var(--pd-pal-slate-200))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line dataKey="probable" name="Scenariusz Prawdopodobny" stroke="rgb(var(--pd-pal-indigo-600))" strokeWidth={3} type="monotone" />
                  <Line dataKey="optimistic" name="Wariant Optymistyczny (+18%)" stroke="rgb(var(--pd-pal-emerald-600))" strokeDasharray="5 5" strokeWidth={2} type="monotone" />
                  <Line dataKey="pessimistic" name="Wariant Pesymistyczny (-18%)" stroke="rgb(var(--pd-pal-rose-600))" strokeDasharray="2 2" strokeWidth={2} type="monotone" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="pd-pal-panel pd-pal-compliance" aria-labelledby="pd-pal-compliance-title">
            <div>
              <span className="pd-pal-kicker">Wbudowany Moduł Audytowy</span>
              <h3 id="pd-pal-compliance-title">EU AI Act Compliance & Risk Radar</h3>
              <p>
                Każdy wygenerowany raport i symulacja w czasie rzeczywistym przechodzi audyt 5 filarów transparentności: brak stronniczości (Bias Check), jawność źródeł (Evidence Trace), pewność statystyczna, bezpieczeństwo danych i sterowanie człowiekiem.
              </p>
              <div className="pd-pal-score-row">
                <span><strong>94 / 100</strong>Score Zgodności AI Act</span>
                <span><strong>Niski</strong>Poziom Ryzyka EU</span>
              </div>
            </div>

            <div className="pd-pal-chart pd-pal-chart--radar" role="img" aria-label="Radar zgodności EU AI Act">
              <ResponsiveContainer>
                <RechartsRadarChart data={papaLabCompliancePillars}>
                  <PolarGrid stroke="rgb(var(--pd-pal-slate-200))" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[50, 100]} tick={{ fontSize: 9 }} />
                  <Radar
                    dataKey="score"
                    fill="rgb(var(--pd-pal-indigo-600) / 0.24)"
                    name="Indeks Audytowy Papa AI"
                    stroke="rgb(var(--pd-pal-indigo-600))"
                  />
                  <Tooltip />
                </RechartsRadarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

export function PapaLabReports() {
  return (
    <section className="pd-pal-stack" aria-labelledby="pd-pal-reports-title">
      <IntroPanel
        body="Laboratorium to pełnoekranowe środowisko pracy analitycznej. Umożliwia zarządzenie biblioteką artefaktów, zlecaniem asynchronicznych zadań generowania raportów oraz eksportem wniosków przez interfejsy MCP."
        id="pd-pal-reports-title"
        title="Laboratorium Papa (PapaScreen), Raporty i AI Act"
      />

      <div className="pd-pal-split pd-pal-split--reports">
        <section className="pd-pal-panel" aria-labelledby="pd-pal-artifact-library-title">
          <h3 id="pd-pal-artifact-library-title">Biblioteka Artefaktów i Raportów</h3>
          <div className="pd-pal-table-wrap">
            <table className="pd-pal-table">
              <thead>
                <tr>
                  <th>Nazwa Artefaktu</th>
                  <th>Typ</th>
                  <th>Wersja</th>
                  <th>Status Joba</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {papaLabArtifactRows.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td><span className="pd-pal-pill pd-pal-pill--blue">{row.type}</span></td>
                    <td>{row.version}</td>
                    <td><span className="pd-pal-pill pd-pal-pill--emerald">{row.status}</span></td>
                    <td><button type="button">{row.action}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="pd-pal-panel" aria-labelledby="pd-pal-export-title">
          <h3 id="pd-pal-export-title">Eksport & Wymogi AI Act</h3>
          <article className="pd-pal-export-card">
            <strong>Wymagana Etykieta Zewnętrzna</strong>
            <p>Wszystkie treści opuszczające system zostają opatrzone oznaczeniem:</p>
            <code>Wygenerowano przez Papa AI</code>
          </article>
        </section>
      </div>
    </section>
  );
}

function ChartPreview({
  chartType,
  datasetId,
  palette,
  title,
}: {
  readonly chartType: PapaLabChartTypeId;
  readonly datasetId: PapaLabBusinessDatasetId;
  readonly palette: PapaLabPaletteId;
  readonly title: string;
}) {
  const dataset = findDataset(datasetId);
  const chartData = buildDatasetChartData(datasetId);
  const color = paletteColor(palette);

  if (chartType === 'doughnut') {
    return (
      <div className="pd-pal-chart" role="img" aria-label={`Wykres pierścieniowy: ${title}`}>
        <ResponsiveContainer>
          <RechartsPieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius="54%"
              nameKey="label"
              outerRadius="82%"
              paddingAngle={2}
            >
              {chartData.map((item, index) => (
                <Cell
                  fill={sliceColor(index)}
                  key={item.label}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === 'radar') {
    return (
      <div className="pd-pal-chart" role="img" aria-label={`Wykres radarowy: ${title}`}>
        <ResponsiveContainer>
          <RechartsRadarChart data={chartData}>
            <PolarGrid stroke="rgb(var(--pd-pal-slate-200))" />
            <PolarAngleAxis dataKey="label" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fontSize: 9 }} />
            <Radar
              dataKey="value"
              fill={paletteFill(palette)}
              name={dataset.metric}
              stroke={color}
            />
            <Tooltip />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === 'bar') {
    return (
      <div className="pd-pal-chart" role="img" aria-label={`Wykres słupkowy: ${title}`}>
        <ResponsiveContainer>
          <RechartsBarChart data={chartData}>
            <CartesianGrid stroke="rgb(var(--pd-pal-slate-200))" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill={color} name={dataset.metric} radius={[6, 6, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="pd-pal-chart" role="img" aria-label={`Wykres liniowy: ${title}`}>
      <ResponsiveContainer>
        <RechartsLineChart data={chartData}>
          <CartesianGrid stroke="rgb(var(--pd-pal-slate-200))" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line
            dataKey="value"
            dot={{ r: 3 }}
            name={dataset.metric}
            stroke={color}
            strokeWidth={3}
            type="monotone"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniChart({
  chart,
}: {
  readonly chart: PapaLabSavedChart;
}) {
  return (
    <ChartPreview
      chartType={chart.type === 'radar' ? 'radar' : chart.type === 'doughnut' ? 'doughnut' : 'bar'}
      datasetId="sales"
      palette="indigo"
      title={chart.title}
    />
  );
}

function ScenarioSlider({
  help,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  readonly help: string;
  readonly label: string;
  readonly max: number;
  readonly min: number;
  readonly onChange: (value: number) => void;
  readonly step: number;
  readonly value: number;
}) {
  const inputId = `pd-pal-slider-${label.replaceAll(' ', '-').toLowerCase()}`;

  return (
    <label className="pd-pal-slider" htmlFor={inputId}>
      <span>
        <strong>{label}</strong>
        <output htmlFor={inputId}>{formatSigned(value)}%</output>
      </span>
      <input
        id={inputId}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        step={step}
        type="range"
        value={value}
      />
      <small>{help}</small>
    </label>
  );
}

function IntroPanel({
  body,
  id,
  title,
}: {
  readonly body: string;
  readonly id: string;
  readonly title: string;
}) {
  return (
    <section className="pd-pal-panel pd-pal-panel--intro">
      <h2 id={id}>{title}</h2>
      <p>{body}</p>
    </section>
  );
}

function PapaLabFooter() {
  return (
    <footer className="pd-pal-footer">
      <strong>PapaData Platform</strong>
      <span>2026 Papa Asystent Module. Zgodność z EU AI Act Article 50.</span>
      <span>Studio Wykresów Klienta</span>
      <span>What-If Causal Simulator</span>
      <span>Recharts Storybook</span>
    </footer>
  );
}

function buildDatasetChartData(datasetId: PapaLabBusinessDatasetId) {
  const dataset = findDataset(datasetId);
  return papaLabChartLabels.map((label, index) => ({
    label,
    value: dataset.values[index] ?? 0,
  }));
}

function buildCausalSimulationData(
  adBudget: number,
  price: number,
  ux: number,
) {
  const probableFactor = 1 + ((adBudget * 0.4) + (ux * 0.8) - (price * 0.3)) / 100;
  const optimisticFactor = probableFactor * 1.18;
  const pessimisticFactor = probableFactor * 0.82;

  return papaLabCausalBasePoints.map((point) => ({
    month: point.month,
    optimistic: Math.round(point.base * optimisticFactor),
    pessimistic: Math.round(point.base * pessimisticFactor),
    probable: Math.round(point.base * probableFactor),
  }));
}

function findDataset(datasetId: PapaLabBusinessDatasetId) {
  return papaLabBusinessDatasets.find((item) => item.id === datasetId) ?? papaLabBusinessDatasets[0];
}

function findRunState(runState: PapaLabRunStateId) {
  return papaLabRunStates.find((item) => item.id === runState) ?? papaLabRunStates[0];
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

function iconForContextType(type: PapaLabContextBasketItem['type']): PapaDataIconName {
  switch (type) {
    case 'KPI':
      return 'trend';
    case 'Wykres':
      return 'data';
    case 'Tabela':
      return 'products';
    case 'Plik':
    case 'Raport':
      return 'data';
    case 'Rekomendacja':
      return 'decisions';
    case 'Procedura':
    default:
      return 'help';
  }
}

function paletteColor(palette: PapaLabPaletteId): string {
  switch (palette) {
    case 'amber':
      return 'rgb(var(--pd-pal-amber-600))';
    case 'emerald':
      return 'rgb(var(--pd-pal-emerald-600))';
    case 'teal':
      return 'rgb(var(--pd-pal-teal-600))';
    case 'indigo':
    default:
      return 'rgb(var(--pd-pal-indigo-600))';
  }
}

function paletteFill(palette: PapaLabPaletteId): string {
  switch (palette) {
    case 'amber':
      return 'rgb(var(--pd-pal-amber-600) / 0.24)';
    case 'emerald':
      return 'rgb(var(--pd-pal-emerald-600) / 0.24)';
    case 'teal':
      return 'rgb(var(--pd-pal-teal-600) / 0.24)';
    case 'indigo':
    default:
      return 'rgb(var(--pd-pal-indigo-600) / 0.24)';
  }
}

function sliceColor(index: number): string {
  const colors = [
    'rgb(var(--pd-pal-indigo-600))',
    'rgb(var(--pd-pal-emerald-600))',
    'rgb(var(--pd-pal-amber-600))',
    'rgb(var(--pd-pal-blue-600))',
    'rgb(var(--pd-pal-teal-600))',
    'rgb(var(--pd-pal-rose-600))',
  ] as const;

  return colors[index % colors.length];
}

function toneColor(tone: PapaLabTone): string {
  switch (tone) {
    case 'amber':
      return 'rgb(var(--pd-pal-amber-600))';
    case 'blue':
      return 'rgb(var(--pd-pal-blue-600))';
    case 'emerald':
      return 'rgb(var(--pd-pal-emerald-600))';
    case 'rose':
      return 'rgb(var(--pd-pal-rose-600))';
    case 'teal':
      return 'rgb(var(--pd-pal-teal-600))';
    case 'slate':
      return 'rgb(var(--pd-pal-slate-500))';
    case 'indigo':
    default:
      return 'rgb(var(--pd-pal-indigo-600))';
  }
}

function transitionLabel(state: PapaLabDecisionStateId): string {
  const labels: Partial<Record<PapaLabDecisionStateId, string>> = {
    approved: 'Zatwierdź akcję',
    compensated: 'Zapisz kompensację',
    deferred: 'Odłóż',
    executing: 'Wykonaj w integracji',
    expired: 'Oznacz jako expired',
    failed: 'Sukces częściowy / błąd',
    invalidated: 'Unieważnij',
    needsReview: 'Wsiądz do przeglądu',
    partiallySucceeded: 'Sukces częściowy',
    rejected: 'Odrzuć',
    succeeded: 'Sukces (succeeded)',
  };

  return labels[state] ?? `Resetuj cykl: ${state}`;
}
