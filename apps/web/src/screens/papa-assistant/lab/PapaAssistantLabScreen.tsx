import {
  useEffect,
  useState,
} from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Button,
  ChartFrame,
  Checkbox,
  Drawer,
  Icon,
  IconButton,
  InlineNotice,
  Select,
  StatusBadge,
  Tabs,
  Textarea,
  TextField,
  Tooltip,
} from '../../../design-system';
import type {
  PapaDataIconName,
  StatusBadgeTone,
} from '../../../design-system';
import type {
  PapaAssistantLabArtifact,
  PapaAssistantLabLayerId,
  PapaAssistantLabProjectDraft,
  PapaAssistantLabRunState,
  PapaAssistantLabScreenData,
  PapaAssistantLabStageId,
  PapaAssistantLabViewId,
} from './PapaAssistantLabScreen.model';
import './PapaAssistantLabScreen.css';

export type PapaAssistantLabCanvasToolId =
  | 'brief'
  | 'chart'
  | 'reports'
  | 'whatIf';

export type PapaAssistantLabScreenProps = {
  readonly data: PapaAssistantLabScreenData;
  readonly initialCanvasTab?: PapaAssistantLabViewId;
  readonly initialCanvasTool?: PapaAssistantLabCanvasToolId;
  readonly initialFocusMode?: boolean;
  readonly initialInspectorTab?: 'actions' | 'context' | 'evidence' | 'quality';
  readonly initialMode?: PapaAssistantLabStageId;
  readonly initialRunState?: PapaAssistantLabRunState;
  readonly onArtifactAction?: ((artifact: PapaAssistantLabArtifact) => void) | undefined;
  readonly onDecisionApprove?: (() => void | Promise<void>) | undefined;
  readonly onRun?: ((draft: PapaAssistantLabProjectDraft) => void | Promise<void>) | undefined;
  readonly onSave?: ((draft: PapaAssistantLabProjectDraft) => void | Promise<void>) | undefined;
};

export function PapaAssistantLabScreen({
  data,
  initialCanvasTab,
  initialCanvasTool: _initialCanvasTool,
  initialFocusMode = false,
  initialInspectorTab: _initialInspectorTab,
  initialMode,
  initialRunState,
  onArtifactAction,
  onDecisionApprove,
  onRun,
  onSave,
}: PapaAssistantLabScreenProps) {
  const [activeStage, setActiveStage] = useState<PapaAssistantLabStageId>(
    initialMode ?? data.initialStage,
  );
  const [activeView, setActiveView] = useState<PapaAssistantLabViewId>(
    initialCanvasTab ?? data.initialView,
  );
  const [activeLayer, setActiveLayer] = useState<PapaAssistantLabLayerId | null>(null);
  const [focusMode, setFocusMode] = useState(initialFocusMode);
  const [runState, setRunState] = useState<PapaAssistantLabRunState>(
    initialRunState ?? data.runState,
  );
  const [draftState, setDraftState] = useState<'dirty' | 'saved'>('saved');
  const [project, setProject] = useState<PapaAssistantLabProjectDraft>(() => ({
    datasets: data.project.datasets,
    filters: data.project.filters,
    goal: data.project.goal,
    instruction: data.project.instruction,
    kpi: data.project.kpi,
    limit: data.project.limit,
    period: data.project.period,
  }));

  useEffect(() => {
    setActiveStage(initialMode ?? data.initialStage);
    setActiveView(initialCanvasTab ?? data.initialView);
    setRunState(initialRunState ?? data.runState);
    setProject({
      datasets: data.project.datasets,
      filters: data.project.filters,
      goal: data.project.goal,
      instruction: data.project.instruction,
      kpi: data.project.kpi,
      limit: data.project.limit,
      period: data.project.period,
    });
    setDraftState('saved');
  }, [data.id, initialCanvasTab, initialMode, initialRunState]);

  const response = data.response[activeStage];
  const activeStageDefinition = data.stages.find((stage) => stage.id === activeStage)
    ?? data.stages[0];

  function updateProject(patch: Partial<PapaAssistantLabProjectDraft>) {
    setProject((current) => ({
      ...current,
      ...patch,
    }));
    setDraftState('dirty');
  }

  function changeStage(stage: PapaAssistantLabStageId) {
    setActiveStage(stage);
    setActiveLayer(null);

    if (stage === 'decision') {
      setActiveView('comparison');
      return;
    }

    if (stage === 'report') {
      setActiveView('result');
      return;
    }

    if (stage === 'plan') {
      setActiveView('result');
      return;
    }

    setActiveView('result');
  }

  function handleSave() {
    setDraftState('saved');
    void onSave?.(project);
  }

  function handleRun() {
    setRunState('running');
    setDraftState('saved');
    void onRun?.(project);
  }

  const viewItems = [
    {
      id: 'project',
      label: 'Konfiguracja',
      panel: (
        <PapaLabProjectPanel
          data={data}
          draftState={draftState}
          onChange={updateProject}
          project={project}
        />
      ),
    },
    {
      id: 'result',
      label: 'Wynik',
      panel: (
        <PapaLabResultPanel
          data={data}
          nextSteps={response.nextSteps}
        />
      ),
    },
    {
      id: 'comparison',
      label: 'Warianty',
      panel: <PapaLabComparisonPanel data={data} />,
    },
  ];

  return (
    <main
      className="pd-pala"
      data-focus-mode={focusMode ? 'true' : undefined}
      data-testid="papa-assistant-lab-page"
    >
      <header className="pd-pala__hero">
        <div className="pd-pala__heading">
          <span className="pd-pala__eyebrow">Laboratorium Papa Asystenta</span>
          <h1>{data.title}</h1>
          <dl className="pd-pala__metadata" aria-label="Kontekst analizy">
            <div>
              <dt>Zakres</dt>
              <dd>{data.timeframeLabel}</dd>
            </div>
            <div>
              <dt>Źródła</dt>
              <dd>{data.sources.length}</dd>
            </div>
            <div>
              <dt>Pewność</dt>
              <dd>{data.confidenceLabel}</dd>
            </div>
            <div>
              <dt>Aktualizacja</dt>
              <dd>{data.updatedAtLabel}</dd>
            </div>
          </dl>
        </div>

        <div className="pd-pala__hero-actions" aria-label="Akcje analizy">
          <StatusBadge
            status="Status analizy"
            text={runStateLabel(runState)}
            tone={runStateTone(runState)}
          />
          <Button
            disabled={draftState === 'saved'}
            onClick={handleSave}
            size="small"
            startIcon={<Icon decorative name="data" size={16} />}
            variant="secondary"
          >
            {draftState === 'dirty' ? 'Zapisz szkic' : 'Szkic zapisany'}
          </Button>
          <Button
            disabled={runState === 'error' || data.loading}
            loading={runState === 'running'}
            loadingLabel="Przeliczanie…"
            onClick={handleRun}
            size="small"
            startIcon={<Icon decorative name="integration" size={16} />}
          >
            Przelicz analizę
          </Button>
        </div>
      </header>

      <nav aria-label="Etapy pracy w Laboratorium" className="pd-pala__workflow">
        {data.stages.map((stage, index) => (
          <Button
            aria-current={activeStage === stage.id ? 'step' : undefined}
            className="pd-pala__workflow-step"
            key={stage.id}
            onClick={() => changeStage(stage.id)}
            size="small"
            startIcon={<Icon decorative name={stage.icon} size={16} />}
            variant="ghost"
          >
            <span className="pd-pala__workflow-number">{index + 1}</span>
            {stage.label}
          </Button>
        ))}
      </nav>

      {data.errorMessage ? (
        <InlineNotice
          className="pd-pala__notice"
          message={data.errorMessage}
          title="Nie udało się odświeżyć wszystkich danych Laboratorium"
          tone="warning"
        />
      ) : null}

      <div className="pd-pala__workspace">
        {!focusMode ? (
          <PapaLabToolRail
            activeLayer={activeLayer}
            onLayerChange={setActiveLayer}
          />
        ) : null}

        <section className="pd-pala__canvas" aria-label="Obszar roboczy analizy">
          <div className="pd-pala__canvas-toolbar">
            <div>
              <span>{activeStageDefinition?.label}</span>
              <p>{activeStageDefinition?.summary}</p>
            </div>
            <div className="pd-pala__context-actions" aria-label="Skrót kontekstu">
              <Button onClick={() => setActiveLayer('context')} size="small" variant="ghost">
                Kontekst <strong>{data.contextItems.length}</strong>
              </Button>
              <Button onClick={() => setActiveLayer('evidence')} size="small" variant="ghost">
                Dowody <strong>{data.evidence.length}</strong>
              </Button>
              <Button onClick={() => setActiveLayer('quality')} size="small" variant="ghost">
                Jakość <strong>{data.quality.score}</strong>
              </Button>
              <Tooltip
                content={focusMode ? 'Wyłącz tryb skupienia' : 'Ukryj narzędzia i skup się na analizie'}
                delayMs={250}
                interactive={false}
                placement="bottom"
                trigger={(
                  <IconButton
                    icon="search"
                    label={focusMode ? 'Wyłącz tryb skupienia' : 'Włącz tryb skupienia'}
                    onClick={() => {
                      setFocusMode((current) => !current);
                      setActiveLayer(null);
                    }}
                    pressed={focusMode}
                    size="small"
                    variant="ghost"
                  />
                )}
              />
            </div>
          </div>

          <div className="pd-pala__scroll">
            <section className="pd-pala__answer" aria-labelledby="pd-pala-answer-title">
              <span className="pd-pala__eyebrow">Odpowiedź Papa Asystenta</span>
              <h2 id="pd-pala-answer-title">{response.recommendation}</h2>
              <div className="pd-pala__reasoning-summary">
                <ResponseColumn label="Fakty" values={response.facts} />
                <ResponseColumn label="Interpretacja" values={response.interpretation} />
                <ResponseColumn label="Hipotezy" values={response.hypotheses} />
              </div>
            </section>

            <Tabs
              activation="automatic"
              activeId={activeView}
              ariaLabel="Widok analizy"
              className="pd-pala__view-tabs"
              items={viewItems}
              onActiveIdChange={(nextId) => setActiveView(nextId as PapaAssistantLabViewId)}
              orientation="horizontal"
              size="compact"
            />
          </div>
        </section>
      </div>

      <PapaLabDrawer
        activeLayer={activeLayer}
        data={data}
        onArtifactAction={onArtifactAction}
        onClose={() => setActiveLayer(null)}
        onDecisionApprove={onDecisionApprove}
      />
    </main>
  );
}

export function PapaLabWorkbench(props: PapaAssistantLabScreenProps) {
  return <PapaAssistantLabScreen {...props} />;
}

function PapaLabToolRail({
  activeLayer,
  onLayerChange,
}: {
  readonly activeLayer: PapaAssistantLabLayerId | null;
  readonly onLayerChange: (layer: PapaAssistantLabLayerId | null) => void;
}) {
  const tools: readonly {
    readonly icon: PapaDataIconName;
    readonly id: PapaAssistantLabLayerId;
    readonly label: string;
  }[] = [
    { icon: 'menu', id: 'analyses', label: 'Analizy' },
    { icon: 'data', id: 'context', label: 'Kontekst' },
    { icon: 'security', id: 'evidence', label: 'Dowody' },
    { icon: 'warning', id: 'quality', label: 'Jakość i ryzyko' },
    { icon: 'decisions', id: 'decisions', label: 'Decyzja' },
    { icon: 'integration', id: 'artifacts', label: 'Artefakty' },
  ];

  return (
    <aside aria-label="Narzędzia Laboratorium" className="pd-pala__tool-rail">
      {tools.map((tool) => (
        <div className="pd-pala__tool" key={tool.id}>
          <Tooltip
            content={tool.label}
            delayMs={250}
            interactive={false}
            placement="right"
            trigger={(
              <IconButton
                icon={tool.icon}
                label={tool.label}
                onClick={() => onLayerChange(activeLayer === tool.id ? null : tool.id)}
                pressed={activeLayer === tool.id}
                size="medium"
                variant="ghost"
              />
            )}
          />
          <span>{tool.label}</span>
        </div>
      ))}
    </aside>
  );
}

function PapaLabProjectPanel({
  data,
  draftState,
  onChange,
  project,
}: {
  readonly data: PapaAssistantLabScreenData;
  readonly draftState: 'dirty' | 'saved';
  readonly onChange: (patch: Partial<PapaAssistantLabProjectDraft>) => void;
  readonly project: PapaAssistantLabProjectDraft;
}) {
  const [excludeTests, setExcludeTests] = useState(true);
  const [evidenceOnly, setEvidenceOnly] = useState(true);
  const [includeSeasonality, setIncludeSeasonality] = useState(false);

  return (
    <section className="pd-pala__panel" aria-labelledby="pd-pala-project-title">
      <header className="pd-pala__section-heading">
        <div>
          <h3 id="pd-pala-project-title">Konfiguracja analizy</h3>
          <p>Cel, dane, filtry, założenia i limit kosztu.</p>
        </div>
        <StatusBadge
          status="Stan formularza"
          text={draftState === 'dirty' ? 'Niezapisane zmiany' : 'Szkic zapisany'}
          tone={draftState === 'dirty' ? 'warning' : 'neutral'}
        />
      </header>

      <div className="pd-pala__form-grid">
        <TextField
          label="Cel"
          onChange={(event) => onChange({ goal: event.currentTarget.value })}
          value={project.goal}
        />
        <Select
          label="KPI"
          onChange={(event) => onChange({ kpi: event.currentTarget.value })}
          options={data.project.kpiOptions}
          placeholder="Wybierz KPI"
          value={project.kpi}
        />
        <Select
          label="Datasety"
          onChange={(event) => onChange({ datasets: event.currentTarget.value })}
          options={data.project.datasetOptions}
          placeholder="Wybierz źródła danych"
          value={project.datasets}
        />
        <Select
          label="Okres"
          onChange={(event) => onChange({ period: event.currentTarget.value })}
          options={data.project.periodOptions}
          placeholder="Wybierz okres"
          value={project.period}
        />
        <TextField
          helperText="Użyj składni pole=wartość. Filtry oddziel przecinkami."
          label="Filtry"
          onChange={(event) => onChange({ filters: event.currentTarget.value })}
          value={project.filters}
        />
        <label className="pd-pala__range-field">
          <span>Limit kosztu</span>
          <input
            max={120}
            min={5}
            onChange={(event) => onChange({ limit: Number(event.currentTarget.value) })}
            type="range"
            value={project.limit}
          />
          <strong>{project.limit} PLN</strong>
        </label>
      </div>

      <Textarea
        helperText="Instrukcja jest widoczna w audycie i nie uruchamia działania bez akceptacji."
        label="Prompt / instrukcja"
        onChange={(event) => onChange({ instruction: event.currentTarget.value })}
        rows={4}
        value={project.instruction}
      />

      <fieldset className="pd-pala__checks">
        <legend>Założenia i wykluczenia</legend>
        <Checkbox
          checked={excludeTests}
          label="Wyklucz transakcje testowe"
          onChange={(event) => setExcludeTests(event.currentTarget.checked)}
          value="exclude-tests"
        />
        <Checkbox
          checked={evidenceOnly}
          label="Użyj tylko jawnych źródeł dowodowych"
          onChange={(event) => setEvidenceOnly(event.currentTarget.checked)}
          value="evidence-only"
        />
        <Checkbox
          checked={includeSeasonality}
          label="Uwzględnij sezonowość rok do roku"
          onChange={(event) => setIncludeSeasonality(event.currentTarget.checked)}
          value="seasonality"
        />
      </fieldset>
    </section>
  );
}

function PapaLabResultPanel({
  data,
  nextSteps,
}: {
  readonly data: PapaAssistantLabScreenData;
  readonly nextSteps: readonly string[];
}) {
  return (
    <div className="pd-pala__panel-stack">
      <PapaLabTrendChart data={data} />
      <section className="pd-pala__panel" aria-labelledby="pd-pala-next-steps-title">
        <header className="pd-pala__section-heading">
          <div>
            <h3 id="pd-pala-next-steps-title">Następne kroki</h3>
            <p>Jawny plan działania do przeglądu przez właściciela procesu.</p>
          </div>
        </header>
        <ol className="pd-pala__next-steps">
          {nextSteps.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function PapaLabComparisonPanel({
  data,
}: {
  readonly data: PapaAssistantLabScreenData;
}) {
  const lastPoint = data.chart.points[data.chart.points.length - 1];

  return (
    <div className="pd-pala__panel-stack">
      <section className="pd-pala__panel" aria-labelledby="pd-pala-variants-title">
        <header className="pd-pala__section-heading">
          <div>
            <h3 id="pd-pala-variants-title">Porównanie wariantów</h3>
            <p>Wpływ, ryzyko i koszt w jednym widoku decyzyjnym.</p>
          </div>
        </header>
        <div className="pd-pala__variant-grid">
          <VariantCard detail="Obecna trajektoria bez zmian" label="Bazowy" tone="neutral" value="100" />
          <VariantCard detail="Cache i ponowienie płatności" label="Prawdopodobny" tone="info" value={String(lastPoint?.probable ?? '—')} />
          <VariantCard detail="Pełna poprawa UX i integracji" label="Optymistyczny" tone="success" value={String(lastPoint?.optimistic ?? '—')} />
          <VariantCard detail="Nawrót błędów ERP" label="Pesymistyczny" tone="critical" value={String(lastPoint?.pessimistic ?? '—')} />
        </div>
      </section>

      <PapaLabTrendChart data={data} />

      <section className="pd-pala__decision-matrix" aria-label="Macierz decyzji">
        <div><span>Wpływ</span><strong>+0,39 p.p.</strong></div>
        <div><span>Ryzyko</span><strong>Ograniczone</strong></div>
        <div><span>Koszt</span><strong>{data.project.limit} PLN + praca zespołu</strong></div>
        <div><span>Dowody</span><strong>{data.evidence.length} źródła</strong></div>
      </section>
    </div>
  );
}

function PapaLabTrendChart({
  data,
}: {
  readonly data: PapaAssistantLabScreenData;
}) {
  return (
    <ChartFrame
      businessQuestion="Jak zmieni się konwersja po wdrożeniu rekomendacji?"
      className="pd-pala__chart-frame"
      description={data.chart.description}
      freshnessLabel={data.updatedAtLabel}
      legend={(
        <ul className="pd-pala__legend" aria-label="Serie wykresu">
          <li data-series="probable">Prawdopodobny</li>
          <li data-series="optimistic">Optymistyczny</li>
          <li data-series="pessimistic">Pesymistyczny</li>
        </ul>
      )}
      rangeLabel={data.timeframeLabel}
      sourceLabel={data.sources.join(', ')}
      status={data.loading ? 'loading' : data.chart.status}
      statusLabel={data.loading ? 'Ładowanie danych' : data.chart.statusLabel}
      title={data.chart.title}
      visualization={(
        <div className="pd-pala__chart">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={data.chart.points} margin={{ bottom: 8, left: 0, right: 12, top: 12 }}>
              <CartesianGrid stroke="var(--pd-separator-subtle)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--pd-text-secondary)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--pd-text-secondary)', fontSize: 11 }} width={40} />
              <RechartsTooltip
                contentStyle={{
                  background: 'var(--pd-surface-overlay)',
                  border: '1px solid var(--pd-separator)',
                  borderRadius: 'var(--pd-radius-control)',
                  color: 'var(--pd-text)',
                }}
              />
              <Line dataKey="probable" dot={{ r: 3 }} name="Prawdopodobny" stroke="var(--pd-data-series-1)" strokeWidth={3} type="monotone" />
              <Line dataKey="optimistic" dot={false} name="Optymistyczny" stroke="var(--pd-data-positive)" strokeDasharray="6 5" strokeWidth={2} type="monotone" />
              <Line dataKey="pessimistic" dot={false} name="Pesymistyczny" stroke="var(--pd-data-negative)" strokeDasharray="3 4" strokeWidth={2} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      visualizationLabel="Porównanie prognozowanego przebiegu trzech wariantów"
    />
  );
}

function PapaLabDrawer({
  activeLayer,
  data,
  onArtifactAction,
  onClose,
  onDecisionApprove,
}: {
  readonly activeLayer: PapaAssistantLabLayerId | null;
  readonly data: PapaAssistantLabScreenData;
  readonly onArtifactAction?: ((artifact: PapaAssistantLabArtifact) => void) | undefined;
  readonly onClose: () => void;
  readonly onDecisionApprove?: (() => void | Promise<void>) | undefined;
}) {
  const layer = activeLayer ?? 'context';

  return (
    <Drawer
      className="pd-pala__drawer"
      description={layerDescription(layer)}
      dismissible
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open={activeLayer !== null}
      side="right"
      title={layerTitle(layer)}
      width={520}
    >
      {layer === 'analyses' ? <AnalysesDrawer data={data} /> : null}
      {layer === 'context' ? <ContextDrawer data={data} /> : null}
      {layer === 'evidence' ? <EvidenceDrawer data={data} /> : null}
      {layer === 'quality' ? <QualityDrawer data={data} /> : null}
      {layer === 'decisions' ? (
        <DecisionDrawer data={data} onDecisionApprove={onDecisionApprove} />
      ) : null}
      {layer === 'artifacts' ? (
        <ArtifactsDrawer data={data} onArtifactAction={onArtifactAction} />
      ) : null}
    </Drawer>
  );
}

function AnalysesDrawer({ data }: { readonly data: PapaAssistantLabScreenData }) {
  return (
    <div className="pd-pala__drawer-list">
      {data.analyses.map((analysis) => (
        <button aria-current={analysis.id === data.id ? 'page' : undefined} key={analysis.id} type="button">
          <span>
            <strong>{analysis.name}</strong>
            <small>{analysis.meta}</small>
          </span>
          <StatusBadge status="Status" text={runStateLabel(analysis.status)} tone={runStateTone(analysis.status)} />
        </button>
      ))}
    </div>
  );
}

function ContextDrawer({ data }: { readonly data: PapaAssistantLabScreenData }) {
  return (
    <div className="pd-pala__drawer-list">
      {data.contextItems.map((item) => (
        <article key={item.id}>
          <Icon decorative name="data" size={20} />
          <div><strong>{item.label}</strong><p>{item.detail}</p></div>
          <span>{item.type}</span>
        </article>
      ))}
    </div>
  );
}

function EvidenceDrawer({ data }: { readonly data: PapaAssistantLabScreenData }) {
  return (
    <div className="pd-pala__drawer-list">
      {data.evidence.map((item) => (
        <article key={item.id}>
          <Icon decorative name="security" size={20} />
          <div><strong>{item.label}</strong><p>{item.source}</p><small>{item.detail}</small></div>
        </article>
      ))}
    </div>
  );
}

function QualityDrawer({ data }: { readonly data: PapaAssistantLabScreenData }) {
  return (
    <div className="pd-pala__drawer-stack">
      <dl className="pd-pala__quality-grid">
        <div><dt>Wynik jakości</dt><dd>{data.quality.score}</dd></div>
        <div><dt>Kompletność</dt><dd>{data.quality.completeness}</dd></div>
        <div><dt>Świeżość</dt><dd>{data.quality.freshness}</dd></div>
        <div><dt>Gotowość</dt><dd>{data.quality.readiness}</dd></div>
      </dl>
      <ResponseColumn label="Ograniczenia danych" values={data.quality.issues} />
    </div>
  );
}

function DecisionDrawer({
  data,
  onDecisionApprove,
}: {
  readonly data: PapaAssistantLabScreenData;
  readonly onDecisionApprove?: (() => void | Promise<void>) | undefined;
}) {
  return (
    <div className="pd-pala__drawer-stack">
      <article className="pd-pala__decision-card">
        <small>{data.decision.id}</small>
        <h3>{data.decision.label}</h3>
        <p>Właściciel: {data.decision.owner}</p>
        <StatusBadge status="Status decyzji" text={data.decision.status} tone="warning" />
        <Button onClick={() => void onDecisionApprove?.()} size="small">Zatwierdź decyzję</Button>
      </article>
      <section>
        <h3>Historia decyzji</h3>
        <ol className="pd-pala__audit-list">
          {data.decision.audit.map((item) => <li key={item}>{item}</li>)}
        </ol>
      </section>
    </div>
  );
}

function ArtifactsDrawer({
  data,
  onArtifactAction,
}: {
  readonly data: PapaAssistantLabScreenData;
  readonly onArtifactAction?: ((artifact: PapaAssistantLabArtifact) => void) | undefined;
}) {
  return (
    <div className="pd-pala__artifact-list">
      {data.artifacts.map((artifact) => (
        <article key={artifact.id}>
          <div>
            <span>{artifact.type}</span>
            <h3>{artifact.name}</h3>
            <p>{artifact.version}</p>
          </div>
          <StatusBadge
            status="Status artefaktu"
            text={artifactStatusLabel(artifact.status)}
            tone={artifact.status === 'ready' ? 'success' : artifact.status === 'building' ? 'processing' : 'warning'}
          />
          <Button onClick={() => onArtifactAction?.(artifact)} size="small" variant="secondary">
            {artifact.actionLabel}
          </Button>
        </article>
      ))}
    </div>
  );
}

function ResponseColumn({
  label,
  values,
}: {
  readonly label: string;
  readonly values: readonly string[];
}) {
  return (
    <section className="pd-pala__response-column">
      <h3>{label}</h3>
      <ul>{values.map((value) => <li key={value}>{value}</li>)}</ul>
    </section>
  );
}

function VariantCard({
  detail,
  label,
  tone,
  value,
}: {
  readonly detail: string;
  readonly label: string;
  readonly tone: StatusBadgeTone;
  readonly value: string;
}) {
  return (
    <article className="pd-pala__variant-card">
      <StatusBadge status="Wariant" text={label} tone={tone} />
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function runStateLabel(state: PapaAssistantLabRunState): string {
  switch (state) {
    case 'draft': return 'Szkic';
    case 'running': return 'Przeliczanie';
    case 'completed': return 'Ukończono';
    case 'partial': return 'Dane częściowe';
    case 'noData': return 'Brak danych';
    case 'error': return 'Błąd';
    case 'aiRefusal': return 'Odmowa AI';
    case 'failed': return 'Analiza nieudana';
    case 'permissionDenied': return 'Brak uprawnień';
  }
}

function runStateTone(state: PapaAssistantLabRunState): StatusBadgeTone {
  switch (state) {
    case 'completed': return 'success';
    case 'running': return 'processing';
    case 'partial': return 'warning';
    case 'error': return 'critical';
    case 'aiRefusal': return 'warning';
    case 'failed': return 'critical';
    case 'permissionDenied': return 'critical';
    case 'draft':
    case 'noData':
    default: return 'neutral';
  }
}

function layerTitle(layer: PapaAssistantLabLayerId): string {
  switch (layer) {
    case 'analyses': return 'Analizy i historia';
    case 'context': return 'Kontekst analizy';
    case 'evidence': return 'Dowody i pochodzenie';
    case 'quality': return 'Jakość danych i ryzyko';
    case 'decisions': return 'Decyzja i akceptacja';
    case 'artifacts': return 'Biblioteka artefaktów';
  }
}

function layerDescription(layer: PapaAssistantLabLayerId): string {
  switch (layer) {
    case 'analyses': return 'Wybierz istniejącą analizę lub wróć do ostatniej pracy.';
    case 'context': return 'Jawne elementy kontekstu używane przez Papa Asystenta.';
    case 'evidence': return 'Źródła wspierające wnioski i rekomendacje.';
    case 'quality': return 'Kompletność, świeżość i ograniczenia danych.';
    case 'decisions': return 'Kontrola człowieka, właściciel i historia decyzji.';
    case 'artifacts': return 'Raporty i artefakty dostępne bez zasłaniania obszaru analizy.';
  }
}

function artifactStatusLabel(status: PapaAssistantLabArtifact['status']): string {
  switch (status) {
    case 'ready': return 'Gotowy';
    case 'building': return 'W przygotowaniu';
    case 'stale': return 'Wymaga odświeżenia';
  }
}
