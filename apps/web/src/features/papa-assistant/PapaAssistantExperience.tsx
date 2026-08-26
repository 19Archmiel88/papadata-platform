import type {
  CSSProperties,
  FormEvent,
  ReactNode,
} from 'react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Button,
  Icon,
  StatusBadge,
} from '../../design-system';
import type {
  PapaDataIconName,
} from '../../design-system';
import type {
  PapaArtifact,
  PapaArtifactColumn,
  PapaArtifactRow,
  PapaAssistantFixture,
  PapaAssistantMode,
  PapaBriefing,
  PapaConfidenceLevel,
  PapaContextBasketItem,
  PapaDecisionQueueItem,
  PapaExportJob,
  PapaOperation,
  PapaRefusal,
  PapaRecommendation as PapaRecommendationRecord,
  PapaReportJob,
  PapaToolActivity,
  PapaTone,
} from './assistantTypes';
import {
  exportArtifactTableCsv,
  papaAssistantModes,
  toneForConfidence,
  toneForDataStatus,
  toneForDecisionStatus,
  toneForReportStatus,
} from './assistantTypes';
import {
  papaAiTransparencyCopy,
  papaAssistantFixture,
} from './papaAssistantData';
import './papa-assistant-experience.css';

const panelStorageKey = 'papadata.papa-assistant.panel-width.v1';

const modeCopy: Record<PapaAssistantMode, string> = {
  actionPlan: 'Plan działań',
  decision: 'Decyzja',
  diagnosis: 'Diagnoza',
  interpretation: 'Interpretacja',
  quickBrief: 'Szybki brief',
  report: 'Raport',
};

type PapaSurfaceProps = {
  readonly data?: PapaAssistantFixture;
};

type AssistantShellProps = PapaSurfaceProps & {
  readonly density?: 'comfortable' | 'compact';
  readonly initialMode?: PapaAssistantMode;
  readonly initialView?:
    | 'artifact'
    | 'conversation'
    | 'execution'
    | 'history'
    | 'report'
    | 'sources';
  readonly presentation?: 'full' | 'panel' | 'split';
};

export function AssistantShell({
  data = papaAssistantFixture,
  density = 'comfortable',
  initialMode = 'quickBrief',
  initialView = 'conversation',
  presentation = 'full',
}: AssistantShellProps) {
  const [activeMode, setActiveMode] = useState<PapaAssistantMode>(initialMode);
  const [activeView, setActiveView] = useState(initialView);
  const [panelWidth, setPanelWidth] = useState(460);
  const [pinned, setPinned] = useState(presentation === 'split');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = Number(window.localStorage.getItem(panelStorageKey));
    if (Number.isFinite(stored) && stored >= 420 && stored <= 720) {
      setPanelWidth(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(panelStorageKey, String(panelWidth));
    }
  }, [
    panelWidth,
  ]);

  const style = {
    '--pd-pa-panel-width': `${panelWidth}px`,
  } as CSSProperties;

  return (
    <section
      aria-labelledby="pd-pa-shell-title"
      className="pd-pa-shell"
      data-density={density}
      data-pinned={pinned ? 'true' : 'false'}
      data-presentation={presentation}
      style={style}
    >
      <div className="pd-pa-shell__workbench" aria-label="Papa Asystent workspace">
        <Header
          activeMode={activeMode}
          activeView={activeView}
          onPinnedChange={setPinned}
          pinned={pinned}
        />

        <ContextSummary data={data} />

        <ModeSwitcher
          activeMode={activeMode}
          onModeChange={setActiveMode}
        />

        <nav className="pd-pa-view-tabs" aria-label="Widoki Papa Asystenta">
          {[
            ['conversation', 'Rozmowa'],
            ['sources', 'Źródła'],
            ['artifact', 'Artefakt'],
            ['report', 'Raport'],
            ['execution', 'Execution'],
            ['history', 'Historia'],
          ].map(([id, label]) => (
            <button
              aria-current={activeView === id ? 'page' : undefined}
              key={id}
              type="button"
              onClick={() => setActiveView(id as typeof activeView)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="pd-pa-shell__body">
          <main className="pd-pa-shell__conversation" aria-label="Rozmowa i artefakty">
            {activeView === 'conversation' ? (
              <Conversation data={data} streaming />
            ) : null}

            {activeView === 'sources' ? (
              <EvidencePanel data={data} />
            ) : null}

            {activeView === 'artifact' ? (
              <ArtifactRegion data={data} />
            ) : null}

            {activeView === 'report' ? (
              <ReportJob data={data} />
            ) : null}

            {activeView === 'execution' ? (
              <DecisionQueue data={data} />
            ) : null}

            {activeView === 'history' ? (
              <HistoryAndAudit data={data} />
            ) : null}
          </main>

          <aside className="pd-pa-shell__inspector" aria-label="Evidence i status operacji">
            <ToolActivity data={data} />
            <OperationStatus data={data} />
            <ContextBasket data={data} compact />
          </aside>
        </div>

        <Composer
          activeMode={activeMode}
          data={data}
          onModeChange={setActiveMode}
        />
      </div>

      <aside className="pd-pa-shell__resize" aria-label="Ustawienia panelu">
        <label>
          <span>Szerokość panelu</span>
          <input
            aria-label="Szerokość panelu Papa Asystenta"
            max={720}
            min={420}
            step={20}
            type="range"
            value={panelWidth}
            onChange={(event) => {
              setPanelWidth(Number(event.currentTarget.value));
            }}
          />
        </label>
      </aside>
    </section>
  );
}

function Header({
  activeMode,
  activeView,
  onPinnedChange,
  pinned,
}: {
  readonly activeMode: PapaAssistantMode;
  readonly activeView: string;
  readonly onPinnedChange: (nextPinned: boolean) => void;
  readonly pinned: boolean;
}) {
  return (
    <header className="pd-pa-header">
      <div className="pd-pa-header__identity">
        <span className="pd-pa-header__mark" aria-hidden="true">
          <Icon decorative name="assistant" size={24} />
        </span>
        <div>
          <p>Odpowiada system AI</p>
          <h1 id="pd-pa-shell-title">Papa Asystent</h1>
        </div>
      </div>
      <div className="pd-pa-header__meta">
        <StatusBadge
          status="Tryb"
          text={modeCopy[activeMode]}
          tone="info"
        />
        <StatusBadge
          status="Widok"
          text={viewLabel(activeView)}
          tone="neutral"
        />
        <Button
          size="small"
          startIcon={<Icon decorative name={pinned ? 'success' : 'integration'} size={16} />}
          variant={pinned ? 'primary' : 'secondary'}
          onClick={() => onPinnedChange(!pinned)}
        >
          {pinned ? 'Przypięty' : 'Przypnij'}
        </Button>
      </div>
      <p className="pd-pa-transparency">{papaAiTransparencyCopy.assistant}</p>
    </header>
  );
}

export function ContextSummary({
  data = papaAssistantFixture,
}: PapaSurfaceProps) {
  const context = data.context;

  return (
    <section
      aria-labelledby="pd-pa-context-title"
      className="pd-pa-context"
    >
      <header>
        <span>Kontekst jawny</span>
        <h2 id="pd-pa-context-title">ContextSummary</h2>
      </header>
      <dl className="pd-pa-context__grid">
        <Field label="Tenant" value={context.tenant} />
        <Field label="Workspace" value={context.workspace} />
        <Field label="Ekran" value={context.activeScreen} />
        <Field label="Zakres dat" value={context.dateRange} />
        <Field label="Filtry" value={context.filters.join(', ')} />
        <Field label="KPI" value={context.kpis.join(', ')} />
        <Field label="Wykresy" value={context.charts.join(', ')} />
        <Field label="Tabele" value={context.tables.join(', ')} />
        <Field label="Źródła" value={data.evidence.map((item) => item.source).join(', ')} />
        <Field label="Jakość danych" value={data.evidence.map((item) => `${item.dataset}: ${item.completeness}`).join(', ')} />
        <Field label="Capability" value={context.capabilities.join(', ')} />
        <Field label="Narzędzia" value={context.tools.join(', ')} />
      </dl>
    </section>
  );
}

function Field({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function ModeSwitcher({
  activeMode,
  onModeChange,
}: {
  readonly activeMode: PapaAssistantMode;
  readonly onModeChange: (mode: PapaAssistantMode) => void;
}) {
  return (
    <section className="pd-pa-mode" aria-label="Tryby pracy Papa Asystenta">
      {papaAssistantModes.map((mode) => (
        <button
          aria-pressed={activeMode === mode}
          key={mode}
          type="button"
          onClick={() => onModeChange(mode)}
        >
          {modeCopy[mode]}
        </button>
      ))}
    </section>
  );
}

export function Conversation({
  data = papaAssistantFixture,
  streaming = false,
}: PapaSurfaceProps & {
  readonly streaming?: boolean;
}) {
  return (
    <section
      aria-labelledby="pd-pa-conversation-title"
      className="pd-pa-conversation"
    >
      <header>
        <div>
          <span>Conversation</span>
          <h2 id="pd-pa-conversation-title">Odpowiedź z facts, interpretations, hypotheses, recommendations, limitations i next steps</h2>
        </div>
        <Button
          size="small"
          startIcon={<Icon decorative name="warning" size={16} />}
          variant="secondary"
        >
          Stop generation
        </Button>
      </header>

      <div
        aria-atomic="true"
        aria-live="polite"
        className="pd-pa-live-region"
        role="status"
      >
        {streaming ? 'Papa Asystent generuje odpowiedź w stabilnych fragmentach.' : 'Papa Asystent jest gotowy.'}
      </div>

      <ol className="pd-pa-message-list">
        {data.conversation.map((message) => (
          <li
            className="pd-pa-message"
            data-author={message.author}
            key={message.id}
          >
            <header>
              <strong>{message.author === 'assistant' ? 'Papa Asystent AI' : message.author === 'user' ? 'Użytkownik' : 'System'}</strong>
              <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
            </header>
            <p>{message.body}</p>
            {message.answer ? (
              <StructuredAnswer answer={message.answer} />
            ) : null}
            {message.evidenceIds.length > 0 ? (
              <span className="pd-pa-message__evidence">
                Evidence: {message.evidenceIds.join(', ')}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function StructuredAnswer({
  answer,
}: {
  readonly answer: NonNullable<PapaAssistantFixture['conversation'][number]['answer']>;
}) {
  return (
    <div className="pd-pa-answer-grid">
      {[
        ['facts', 'Fakty', answer.facts],
        ['interpretations', 'Interpretacje', answer.interpretations],
        ['hypotheses', 'Hipotezy', answer.hypotheses],
        ['recommendations', 'Rekomendacje', answer.recommendations],
        ['limitations', 'Ograniczenia', answer.limitations],
        ['suggestedNextSteps', 'Następne kroki', answer.suggestedNextSteps],
      ].map(([key, label, values]) => (
        <section key={String(key)}>
          <h3>{String(label)}</h3>
          <ul>
            {(values as readonly string[]).map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function ToolActivity({
  data = papaAssistantFixture,
}: PapaSurfaceProps) {
  return (
    <section
      aria-labelledby="pd-pa-tool-title"
      className="pd-pa-panel pd-pa-tool"
    >
      <header>
        <span>ToolActivity</span>
        <h2 id="pd-pa-tool-title">Co Asystent sprawdza</h2>
      </header>
      <ol>
        {data.toolActivity.map((item) => (
          <li key={item.id}>
            <StatusDot status={item.status} />
            <div>
              <strong>{item.title}</strong>
              <span>{item.source}</span>
              <p>{item.detail}</p>
              <small>
                {item.requiresApproval ? 'Wymaga approval' : 'Nie wymaga approval'} · Evidence {item.evidenceIds.length}
              </small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function EvidencePanel({
  data = papaAssistantFixture,
}: PapaSurfaceProps) {
  return (
    <section
      aria-labelledby="pd-pa-evidence-title"
      className="pd-pa-evidence"
    >
      <header>
        <div>
          <span>EvidencePanel</span>
          <h2 id="pd-pa-evidence-title">Dowody i ograniczenia odpowiedzi</h2>
        </div>
        <StatusBadge
          status="Confidence"
          text="opisowy, bez fałszywego procentu"
          tone="info"
        />
      </header>
      <div className="pd-pa-evidence__grid">
        {data.evidence.map((item) => (
          <article key={item.id} data-confidence={item.confidence}>
            <header>
              <div>
                <span>{item.source}</span>
                <h3>{item.title}</h3>
              </div>
              <StatusBadge
                status="Confidence"
                text={item.confidence}
                tone={toneForConfidence(item.confidence)}
              />
            </header>
            <dl>
              <Field label="Dataset" value={item.dataset} />
              <Field label="Snapshot" value={item.snapshot} />
              <Field label="Zakres" value={item.dateRange} />
              <Field label="Filtry" value={item.filters} />
              <Field label="Świeżość" value={item.freshness} />
              <Field label="Kompletność" value={item.completeness} />
              <Field label="Estymacje" value={item.estimation} />
              <Field label="Ograniczenia" value={item.limitations} />
              <Field label="Lineage" value={item.lineage} />
              <Field label="Audyt" value={item.audit} />
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ContextBasket({
  compact = false,
  data = papaAssistantFixture,
}: PapaSurfaceProps & {
  readonly compact?: boolean;
}) {
  return (
    <section
      aria-labelledby="pd-pa-basket-title"
      className="pd-pa-panel pd-pa-basket"
      data-compact={compact ? 'true' : 'false'}
    >
      <header>
        <span>ContextBasket</span>
        <h2 id="pd-pa-basket-title">Koszyk kontekstu</h2>
      </header>
      <ul>
        {data.basket.map((item) => (
          <li key={item.id}>
            <span className="pd-pa-basket__type">{basketTypeLabel(item.type)}</span>
            <div>
              <strong>{item.label}</strong>
              <span>{item.source} · {item.range}</span>
              <small>Świeżość {item.freshness}</small>
            </div>
            {item.removable ? (
              <button aria-label={`Usuń z kontekstu: ${item.label}`} type="button">
                ×
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ArtifactRegion({
  data = papaAssistantFixture,
}: PapaSurfaceProps) {
  return (
    <section
      aria-labelledby="pd-pa-artifact-region-title"
      className="pd-pa-artifacts"
    >
      <header>
        <div>
          <span>ArtifactRegion</span>
          <h2 id="pd-pa-artifact-region-title">Artefakty bez zagnieżdżonych modali</h2>
        </div>
        <StatusBadge
          status="Route backed"
          text="workspace"
          tone="success"
        />
      </header>
      <div className="pd-pa-artifacts__grid">
        {data.artifacts.map((artifact) => (
          <ArtifactTable
            artifact={artifact}
            key={artifact.id}
          />
        ))}
      </div>
    </section>
  );
}

export function ArtifactTable({
  artifact,
}: {
  readonly artifact: PapaArtifact;
}) {
  const [query, setQuery] = useState('');
  const [sortColumn, setSortColumn] = useState(artifact.columns[0]?.id ?? '');
  const [visibleColumnIds, setVisibleColumnIds] = useState<readonly string[]>(
    artifact.columns.map((column) => column.id),
  );

  const visibleColumns = artifact.columns.filter((column) => (
    visibleColumnIds.includes(column.id)
  ));
  const filteredRows = useMemo(() => (
    artifact.rows
      .filter((row) => Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase()))
      .sort((first, second) => String(first[sortColumn] ?? '').localeCompare(String(second[sortColumn] ?? ''), 'pl'))
  ), [
    artifact.rows,
    query,
    sortColumn,
  ]);
  const csv = exportArtifactTableCsv(artifact, visibleColumnIds);

  return (
    <article
      aria-labelledby={`${artifact.id}-title`}
      className="pd-pa-artifact-table"
      data-status={artifact.status}
    >
      <header>
        <div>
          <span>{artifact.type}</span>
          <h3 id={`${artifact.id}-title`}>{artifact.title}</h3>
        </div>
        <StatusBadge
          status="Status artefaktu"
          text={artifact.status}
          tone={toneForDataStatus(artifact.status)}
        />
      </header>

      <div className="pd-pa-artifact-table__toolbar">
        <label>
          <span>Szukaj</span>
          <input
            aria-label={`Szukaj w tabeli ${artifact.title}`}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </label>
        <label>
          <span>Sortuj</span>
          <select
            aria-label={`Sortowanie tabeli ${artifact.title}`}
            value={sortColumn}
            onChange={(event) => setSortColumn(event.currentTarget.value)}
          >
            {artifact.columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.label}
              </option>
            ))}
          </select>
        </label>
        <Button
          size="small"
          variant="secondary"
          onClick={() => void csv.length}
        >
          CSV
        </Button>
        <Button size="small" variant="secondary">
          Zapisz widok
        </Button>
      </div>

      <fieldset className="pd-pa-artifact-table__columns">
        <legend>Widoczność kolumn</legend>
        {artifact.columns.map((column) => (
          <label key={column.id}>
            <input
              checked={visibleColumnIds.includes(column.id)}
              type="checkbox"
              onChange={(event) => {
                setVisibleColumnIds((current) => (
                  event.currentTarget.checked
                    ? [
                        ...current,
                        column.id,
                      ]
                    : current.filter((id) => id !== column.id)
                ));
              }}
            />
            <span>{column.label}</span>
          </label>
        ))}
      </fieldset>

      <div className="pd-pa-artifact-table__scroller">
        <table aria-label={`ArtifactTable ${artifact.title}`}>
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th key={column.id} scope="col">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={rowKey(row, visibleColumns)}>
                {visibleColumns.map((column) => (
                  <td key={column.id}>{row[column.id]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export function Recommendation({
  data = papaAssistantFixture,
  recommendation = data.recommendations[0] ?? null,
}: PapaSurfaceProps & {
  readonly recommendation?: PapaRecommendationRecord | null;
}) {
  if (!recommendation) {
    return null;
  }

  return (
    <article
      aria-labelledby={`${recommendation.id}-title`}
      className="pd-pa-recommendation"
    >
      <header>
        <div>
          <span>Recommendation</span>
          <h2 id={`${recommendation.id}-title`}>{recommendation.title}</h2>
        </div>
        <StatusBadge
          status="Status rekomendacji"
          text={recommendation.status}
          tone={recommendation.status === 'zrealizowana' ? 'success' : 'warning'}
        />
      </header>
      <p className="pd-pa-transparency">{papaAiTransparencyCopy.recommendation}</p>
      <div className="pd-pa-scenario-grid">
        <Scenario item={recommendation.current} />
        <Scenario item={recommendation.noAction} />
        <Scenario item={recommendation.withAction} />
      </div>
      <dl className="pd-pa-recommendation__meta">
        <Field label="Wpływ" value={recommendation.impact} />
        <Field label="Ryzyko" value={recommendation.risk} />
        <Field label="Właściciel" value={recommendation.owner} />
        <Field label="Horyzont" value={recommendation.horizon} />
        <Field label="Confidence" value={recommendation.confidence} />
        <Field label="Evidence" value={recommendation.evidenceIds.join(', ')} />
      </dl>
      <section>
        <h3>Założenia</h3>
        <ul>
          {recommendation.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function Scenario({
  item,
}: {
  readonly item: PapaRecommendationRecord['current'];
}) {
  return (
    <section className="pd-pa-scenario">
      <span>{item.label}</span>
      <strong>{item.value}</strong>
      <small>{item.metric} · {item.delta}</small>
    </section>
  );
}

export function DecisionQueue({
  data = papaAssistantFixture,
}: PapaSurfaceProps) {
  return (
    <section
      aria-labelledby="pd-pa-decision-title"
      className="pd-pa-decision"
    >
      <header>
        <div>
          <span>DecisionQueue</span>
          <h2 id="pd-pa-decision-title">Proposal, approval, revalidation, execution, audit i recovery</h2>
        </div>
        <StatusBadge
          status="Statusy"
          text={`${data.decisions.length} kompletne`}
          tone="success"
        />
      </header>
      <div className="pd-pa-decision__grid">
        {data.decisions.map((item) => (
          <DecisionItem item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function DecisionItem({
  item,
}: {
  readonly item: PapaDecisionQueueItem;
}) {
  return (
    <article data-status={item.status}>
      <header>
        <strong>{item.title}</strong>
        <StatusBadge
          status="DecisionQueue"
          text={item.status}
          tone={toneForDecisionStatus(item.status)}
        />
      </header>
      <dl>
        <Field label="Konto" value={item.approver} />
        <Field label="Integracja" value={item.integration} />
        <Field label="Zakres i termin" value={formatDate(item.dueAt)} />
        <Field label="Rollback" value={item.canRollback ? 'dostępny' : 'kontrolowany'} />
        <Field label="Ryzyka" value={item.risk} />
        <Field label="Skutki uboczne" value={item.sideEffects} />
        <Field label="Revalidation" value={item.revalidation} />
        <Field label="Audit" value={item.audit} />
      </dl>
    </article>
  );
}

export function ReportJob({
  data = papaAssistantFixture,
}: PapaSurfaceProps) {
  return (
    <section
      aria-labelledby="pd-pa-report-title"
      className="pd-pa-report"
    >
      <header>
        <div>
          <span>ReportJob</span>
          <h2 id="pd-pa-report-title">Raporty, briefing i eksport</h2>
        </div>
        <StatusBadge
          status="Asynchroniczne"
          text="job queue"
          tone="info"
        />
      </header>
      <p className="pd-pa-transparency">{papaAiTransparencyCopy.report}</p>
      <div className="pd-pa-report__grid">
        {data.reports.map((job) => (
          <ReportJobCard job={job} key={job.id} />
        ))}
      </div>
      <ExportAndMcp data={data} />
    </section>
  );
}

function ReportJobCard({
  job,
}: {
  readonly job: PapaReportJob;
}) {
  return (
    <article>
      <header>
        <strong>{job.title}</strong>
        <StatusBadge
          status="Report job"
          text={job.status}
          tone={toneForReportStatus(job.status)}
        />
      </header>
      <p>{job.channel}</p>
      <div
        aria-label={`${job.title}: ${job.progress}%`}
        className="pd-pa-progress"
        role="progressbar"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={job.progress}
      >
        <span style={{ inlineSize: `${job.progress}%` }} />
      </div>
      <small>Artefakt: {job.artifactId}</small>
    </article>
  );
}

export function AIRefusal({
  data = papaAssistantFixture,
  refusal = data.refusals[0] ?? null,
}: PapaSurfaceProps & {
  readonly refusal?: PapaRefusal | null;
}) {
  if (!refusal) {
    return null;
  }

  return (
    <article
      aria-labelledby={`${refusal.id}-title`}
      className="pd-pa-refusal"
    >
      <header>
        <span>AIRefusal</span>
        <h2 id={`${refusal.id}-title`}>{refusal.title}</h2>
      </header>
      <p>{papaAiTransparencyCopy.refusal}</p>
      <dl>
        <Field label="Powód" value={refusal.reason} />
        <Field label="Szczegóły" value={refusal.detail} />
        <Field label="Evidence" value={refusal.evidenceIds.join(', ') || 'brak wystarczającego evidence'} />
      </dl>
    </article>
  );
}

export function OperationStatus({
  data = papaAssistantFixture,
}: PapaSurfaceProps) {
  return (
    <section
      aria-labelledby="pd-pa-operation-title"
      className="pd-pa-panel pd-pa-operation"
    >
      <header>
        <span>OperationStatus</span>
        <h2 id="pd-pa-operation-title">Status operacji</h2>
      </header>
      <ol>
        {data.operations.map((operation) => (
          <OperationItem item={operation} key={operation.id} />
        ))}
      </ol>
    </section>
  );
}

function OperationItem({
  item,
}: {
  readonly item: PapaOperation;
}) {
  return (
    <li>
      <StatusDot status={item.status} />
      <div>
        <strong>{item.title}</strong>
        <span>{item.detail}</span>
        <small>Recovery: {item.recovery}</small>
      </div>
    </li>
  );
}

export function Composer({
  activeMode = 'quickBrief',
  data = papaAssistantFixture,
  onModeChange,
}: PapaSurfaceProps & {
  readonly activeMode?: PapaAssistantMode;
  readonly onModeChange?: ((mode: PapaAssistantMode) => void) | undefined;
}) {
  const [draft, setDraft] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const prompts = [
    'Podsumuj aktywny ekran z evidence.',
    'Wyjaśnij zmianę ROAS i ograniczenia.',
    'Przygotuj proposal bez execution.',
  ];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.trim().length === 0) {
      return;
    }

    setSubmitted(true);
  }

  return (
    <section
      aria-labelledby="pd-pa-composer-title"
      className="pd-pa-composer"
    >
      <header>
        <div>
          <span>Composer</span>
          <h2 id="pd-pa-composer-title">Pytanie do Papa Asystenta</h2>
        </div>
        <StatusBadge
          status="Kontekst"
          text={`${data.basket.length} elementy`}
          tone="info"
        />
      </header>
      <form onSubmit={submit}>
        <div className="pd-pa-composer__row">
          <label>
            <span>Tryb</span>
            <select
              aria-label="Wybierz tryb pracy"
              value={activeMode}
              onChange={(event) => onModeChange?.(event.currentTarget.value as PapaAssistantMode)}
            >
              {papaAssistantModes.map((mode) => (
                <option key={mode} value={mode}>
                  {modeCopy[mode]}
                </option>
              ))}
            </select>
          </label>
          <Button
            size="small"
            startIcon={<Icon decorative name="data" size={16} />}
            variant="secondary"
          >
            Załącz kontekst
          </Button>
        </div>
        <textarea
          aria-label="Treść pytania do Papa Asystenta"
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
        />
        <div className="pd-pa-composer__prompts" aria-label="Gotowe prompty">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setDraft(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
        <footer>
          <span role="status">{submitted ? 'Pytanie przygotowane z jawnego kontekstu.' : 'Gotowe do wysłania.'}</span>
          <Button
            disabled={draft.trim().length === 0}
            size="small"
            startIcon={<Icon decorative name="assistant" size={16} />}
            type="submit"
          >
            Wyślij
          </Button>
        </footer>
      </form>
    </section>
  );
}

export function InlineAssistant({
  data = papaAssistantFixture,
}: PapaSurfaceProps) {
  const item = data.basket[0];

  if (!item) {
    return null;
  }

  return (
    <section
      aria-labelledby="pd-pa-inline-title"
      className="pd-pa-inline"
    >
      <header>
        <span>InlineAssistant</span>
        <h2 id="pd-pa-inline-title">{item.label}</h2>
        <StatusBadge
          status="Źródło"
          text={item.source}
          tone="info"
        />
      </header>
      <p>{papaAiTransparencyCopy.assistant}</p>
      <dl>
        <Field label="Zakres" value={item.range} />
        <Field label="Filtry" value={data.context.filters.join(', ')} />
        <Field label="Świeżość" value={item.freshness} />
      </dl>
      <Conversation data={data} />
      <Button size="small" variant="secondary">
        Przejdź do panelu bez utraty rozmowy
      </Button>
    </section>
  );
}

export function PapaAssistantLaboratory({
  data = papaAssistantFixture,
}: PapaSurfaceProps) {
  return (
    <section
      aria-labelledby="pd-pa-lab-title"
      className="pd-pa-lab"
    >
      <header className="pd-pa-lab__hero">
        <div>
          <span>Laboratorium Papa Asystenta</span>
          <h1 id="pd-pa-lab-title">Decyzje, diagnozy, raporty i plan działań</h1>
          <p>
            Pełne miejsce pracy z AI: rekomendacje, biblioteka, briefingi, eksport i MCP bez wykonywania zmian biznesowych bez approval.
          </p>
        </div>
        <dl>
          <Field label="Zakres danych" value={data.context.dateRange} />
          <Field label="Rekomendacje" value={String(data.recommendations.length)} />
          <Field label="Biblioteka" value={String(data.library.length)} />
          <Field label="Jakość danych" value={data.evidence.map((item) => item.completeness).join(', ')} />
        </dl>
      </header>

      <nav className="pd-pa-lab__tabs" aria-label="Sekcje Laboratorium">
        {[
          'Zapytaj',
          'Rekomendacje',
          'Biblioteka',
          'Briefingi',
          'Eksport i MCP',
        ].map((item) => (
          <a href={`#${slug(item)}`} key={item}>{item}</a>
        ))}
      </nav>

      <div className="pd-pa-lab__grid">
        <section id="zapytaj">
          <AssistantShell data={data} density="compact" presentation="panel" />
        </section>
        <section id="rekomendacje">
          <Recommendation data={data} />
          <DecisionQueue data={data} />
        </section>
        <section id="biblioteka">
          <Library data={data} />
        </section>
        <section id="briefingi">
          <Briefings data={data} />
          <ReportJob data={data} />
        </section>
        <section id="eksport-i-mcp">
          <ExportAndMcp data={data} />
          <EvidencePanel data={data} />
        </section>
      </div>
    </section>
  );
}

export function AssistantContextFlow({
  data = papaAssistantFixture,
}: PapaSurfaceProps) {
  return (
    <section className="pd-pa-flow" aria-labelledby="pd-pa-flow-context-title">
      <h1 id="pd-pa-flow-context-title">AssistantContext</h1>
      <Process
        items={[
          'Użytkownik otwiera ekran',
          'Papa Asystent dostaje kontekst ekranu',
          'Użytkownik wybiera tryb albo zadaje pytanie',
          'Papa analizuje dane z evidence',
          'Pokazuje odpowiedź strukturalną, confidence i ograniczenia',
          'Tworzy artefakt i propozycję do approval',
          'Po revalidation wynik trafia do historii, audytu i recovery',
        ]}
      />
      <ContextSummary data={data} />
    </section>
  );
}

export function ReportJobFlow({
  data = papaAssistantFixture,
}: PapaSurfaceProps) {
  return (
    <section className="pd-pa-flow" aria-labelledby="pd-pa-flow-report-title">
      <h1 id="pd-pa-flow-report-title">ReportJob</h1>
      <Process
        items={[
          'Draft raportu powstaje w kontekście Asystenta',
          'Report job trafia do kolejki',
          'Postęp jest trwały i widoczny w OperationStatus',
          'Ready publikuje raport do biblioteki',
          'Zakończenie trafia do powiadomień i historii',
        ]}
      />
      <ReportJob data={data} />
    </section>
  );
}

export function AIRefusalFlow({
  data = papaAssistantFixture,
}: PapaSurfaceProps) {
  return (
    <section className="pd-pa-flow" aria-labelledby="pd-pa-flow-refusal-title">
      <h1 id="pd-pa-flow-refusal-title">AIRefusal</h1>
      <Process
        items={[
          'Papa wykrywa brak evidence, scope, capability albo prompt injection',
          'Odmowa pokazuje powód tekstowo',
          'UI nie sugeruje wykonania akcji',
          'Użytkownik dostaje najbezpieczniejszy następny krok',
        ]}
      />
      <div className="pd-pa-refusal-grid">
        {data.refusals.map((refusal) => (
          <AIRefusal
            data={data}
            key={refusal.id}
            refusal={refusal}
          />
        ))}
      </div>
    </section>
  );
}

function Library({
  data,
}: {
  readonly data: PapaAssistantFixture;
}) {
  return (
    <section className="pd-pa-library" aria-labelledby="pd-pa-library-title">
      <h2 id="pd-pa-library-title">Biblioteka</h2>
      <div>
        {data.library.map((item) => (
          <article key={item.id}>
            <header>
              <strong>{item.name}</strong>
              <StatusBadge
                status="Status"
                text={item.status}
                tone={toneForDataStatus(item.status)}
              />
            </header>
            <dl>
              <Field label="Typ" value={item.type} />
              <Field label="Autor" value={item.author} />
              <Field label="Data" value={item.date} />
              <Field label="Zakres" value={item.range} />
              <Field label="Źródła" value={item.sources} />
              <Field label="Wersja" value={item.version} />
              <Field label="Analiza" value={item.link} />
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function Briefings({
  data,
}: {
  readonly data: PapaAssistantFixture;
}) {
  return (
    <section className="pd-pa-briefings" aria-labelledby="pd-pa-briefings-title">
      <h2 id="pd-pa-briefings-title">Briefingi i analizy</h2>
      <div>
        {data.briefings.map((briefing) => (
          <BriefingItem briefing={briefing} key={briefing.id} />
        ))}
      </div>
    </section>
  );
}

function BriefingItem({
  briefing,
}: {
  readonly briefing: PapaBriefing;
}) {
  return (
    <article>
      <header>
        <strong>{briefing.topic}</strong>
        <StatusBadge
          status="Briefing"
          text={briefing.status}
          tone={toneForReportStatus(briefing.status)}
        />
      </header>
      <dl>
        <Field label="Cel" value={briefing.purpose} />
        <Field label="Kontekst" value={briefing.context} />
        <Field label="Oczekiwany wynik" value={briefing.expectedOutcome} />
        <Field label="Obszar" value={briefing.area} />
        <Field label="Kanał" value={briefing.channel} />
        <Field label="Priorytet" value={briefing.priority} />
        <Field label="Termin" value={formatDate(briefing.dueAt)} />
        <Field label="Właściciel" value={briefing.owner} />
        <Field label="Załączniki" value={briefing.attachments.join(', ')} />
        <Field label="Report job" value={briefing.reportJobId} />
      </dl>
    </article>
  );
}

function ExportAndMcp({
  data,
}: {
  readonly data: PapaAssistantFixture;
}) {
  return (
    <section className="pd-pa-export" aria-labelledby="pd-pa-export-title">
      <h2 id="pd-pa-export-title">Eksport PDF/CSV, biblioteka, workflow i MCP</h2>
      <div>
        {data.exports.map((item) => (
          <ExportItem item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function ExportItem({
  item,
}: {
  readonly item: PapaExportJob;
}) {
  return (
    <article>
      <header>
        <strong>{item.label}</strong>
        <StatusBadge
          status="Eksport"
          text={item.status}
          tone={item.status === 'ready' ? 'success' : item.status === 'generating' ? 'warning' : 'critical'}
        />
      </header>
      <span>{item.destination}</span>
    </article>
  );
}

function HistoryAndAudit({
  data,
}: {
  readonly data: PapaAssistantFixture;
}) {
  return (
    <section className="pd-pa-history" aria-labelledby="pd-pa-history-title">
      <header>
        <span>Historia decyzji i działań</span>
        <h2 id="pd-pa-history-title">Rekomendacja, symulacja, approval, harmonogram, execution, wynik i audyt</h2>
      </header>
      <div className="pd-pa-history__toolbar">
        <label>
          <span>Szukaj</span>
          <input aria-label="Szukaj w historii Papa" type="search" />
        </label>
        <Button size="small" variant="secondary">Eksport historii</Button>
      </div>
      <ol>
        {data.auditTrail.map((event) => (
          <li key={event.id}>
            <time dateTime={event.timestamp}>{formatDate(event.timestamp)}</time>
            <strong>{event.title}</strong>
            <span>{event.detail}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Process({
  items,
}: {
  readonly items: readonly string[];
}) {
  return (
    <ol className="pd-pa-process" aria-label="Minimalny przebieg użytkownika">
      {items.map((item) => (
        <li key={item}>
          <Icon decorative name="success" size={16} />
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function StatusDot({
  status,
}: {
  readonly status: PapaOperation['status'];
}) {
  const icon: PapaDataIconName = status === 'failed' || status === 'recovery'
    ? 'warning'
    : status === 'succeeded'
      ? 'success'
      : 'assistant';

  return (
    <span
      aria-hidden="true"
      className="pd-pa-status-dot"
      data-tone={operationTone(status)}
    >
      <Icon decorative name={icon} size={16} />
    </span>
  );
}

function operationTone(status: PapaOperation['status']): PapaTone {
  switch (status) {
    case 'succeeded':
      return 'success';
    case 'failed':
      return 'critical';
    case 'executing':
    case 'generating':
    case 'needsReview':
    case 'queued':
      return 'warning';
    case 'recovery':
    default:
      return 'info';
  }
}

function basketTypeLabel(type: PapaContextBasketItem['type']): string {
  switch (type) {
    case 'chart':
      return 'Wykres';
    case 'chartRange':
      return 'Zakres';
    case 'file':
      return 'Plik';
    case 'helpProcedure':
      return 'Pomoc';
    case 'kpi':
      return 'KPI';
    case 'recommendation':
      return 'Rekomendacja';
    case 'report':
      return 'Raport';
    case 'tableRow':
    default:
      return 'Tabela';
  }
}

function rowKey(
  row: PapaArtifactRow,
  columns: readonly PapaArtifactColumn[],
) {
  return columns.map((column) => row[column.id]).join('|');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replaceAll(' ', '-')
    .replaceAll('ł', 'l');
}

function viewLabel(view: string) {
  switch (view) {
    case 'sources':
      return 'Źródła';
    case 'artifact':
      return 'Artefakt';
    case 'report':
      return 'Raport';
    case 'execution':
      return 'Execution';
    case 'history':
      return 'Historia';
    case 'conversation':
    default:
      return 'Rozmowa';
  }
}

export type {
  AssistantShellProps,
  PapaSurfaceProps,
};
