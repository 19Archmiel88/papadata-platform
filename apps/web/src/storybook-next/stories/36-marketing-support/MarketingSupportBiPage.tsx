import type {
  ChangeEvent,
  CSSProperties,
  FormEvent,
} from 'react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Button,
  Panel,
  PriorityBand,
  StatusBadge,
} from '../../../design-system';
import {
  architectureDomains,
  briefAreaOptions,
  briefUrgencyOptions,
  caseTypeDistribution,
  contextPackMetrics,
  impactSeriesByWindow,
  impactWindowOptions,
  marketingBriefDefault,
  marketingCaseFilterOptions,
  marketingCases,
  marketingEntitlement,
  marketingSuggestions,
  marketingSupportRoleLabels,
  marketingSupportTabs,
  rbacColumns,
  recommendationHistory,
  roadmapItems,
} from './MarketingSupportBiPage.data';
import type {
  ImpactWindow,
  MarketingBriefDraft,
  MarketingCaseFilter,
  MarketingCaseStatus,
  MarketingSuggestionArea,
  MarketingSupportCase,
  MarketingSupportRole,
  MarketingSupportTabId,
  MarketingSupportTone,
} from './MarketingSupportBiPage.data';
import './MarketingSupportBiPage.css';

const noop = () => undefined;

const chartColors = {
  amber: 'rgb(var(--pd-msbi-amber-500))',
  emerald: 'rgb(var(--pd-msbi-emerald-600))',
  indigo: 'rgb(var(--pd-msbi-indigo-600))',
  rose: 'rgb(var(--pd-msbi-rose-600))',
  slate: 'rgb(var(--pd-msbi-slate-500))',
} as const satisfies Record<MarketingSupportTone, string>;

const tooltipStyle: CSSProperties = {
  background: 'rgb(58 58 54)',
  border: '1px solid rgb(96 96 88)',
  borderRadius: 'var(--pd-radius-control)',
  boxShadow: '0 16px 34px rgb(0 0 0 / 0.20)',
  color: 'white',
  fontSize: 12,
};

type CaseMutation = {
  readonly status?: MarketingCaseStatus;
  readonly timelineEntry?: {
    readonly text: string;
    readonly time: string;
  };
};

function cloneMarketingCase(supportCase: MarketingSupportCase): MarketingSupportCase {
  return {
    ...supportCase,
    recommendation: {
      ...supportCase.recommendation,
      ...(supportCase.recommendation.actionPlan
        ? {
          actionPlan: supportCase.recommendation.actionPlan.map((item) => ({ ...item })),
        }
        : {}),
    },
    timeline: supportCase.timeline.map((item) => ({ ...item })),
  };
}

export function MarketingSupportBiPage() {
  const [activeTab, setActiveTab] = useState<MarketingSupportTabId>('overview');
  const [role, setRole] = useState<MarketingSupportRole>('client');
  const [selectedCaseId, setSelectedCaseId] = useState('MS-2026-0182');
  const [caseFilter, setCaseFilter] = useState<MarketingCaseFilter>('all');
  const [briefStep, setBriefStep] = useState(1);
  const [briefDraft, setBriefDraft] = useState<MarketingBriefDraft>(marketingBriefDefault);
  const [impactWindow, setImpactWindow] = useState<ImpactWindow>(7);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [scanStamp, setScanStamp] = useState('GA4 + Meta Ads zsynchronizowane');
  const [toast, setToast] = useState('Sekcja Wsparcie w marketingu gotowa');
  const [cases, setCases] = useState<MarketingSupportCase[]>(() => marketingCases.map(cloneMarketingCase));

  const selectedCase = cases.find((supportCase) => supportCase.id === selectedCaseId) ?? cases[0];

  function changeTab(tabId: MarketingSupportTabId) {
    setActiveTab(tabId);
    if (tabId === 'workspace') setToast('Otworzono Workspace Wsparcia Marketingowego');
  }

  function openCaseDetail(caseId: string) {
    setSelectedCaseId(caseId);
    setActiveTab('workspace');
    setToast(`Otworzono sprawę ${caseId}`);
  }

  function prefillBrief(subject: string, area: MarketingSuggestionArea, problem: string) {
    setBriefDraft({
      ...marketingBriefDefault,
      area,
      problem,
      subject,
    });
    setBriefStep(1);
    setActiveTab('brief-builder');
    setToast('Brief został wstępnie uzupełniony przez Papa AI');
  }

  function updateCase(caseId: string, mutation: CaseMutation) {
    setCases((currentCases) => currentCases.map((supportCase) => {
      if (supportCase.id !== caseId) return supportCase;

      return {
        ...supportCase,
        status: mutation.status ?? supportCase.status,
        timeline: mutation.timelineEntry ? [...supportCase.timeline, mutation.timelineEntry] : supportCase.timeline,
      };
    }));
  }

  function handleCustomerDecision(caseId: string, decisionType: 'accept' | 'clarification' | 'reject') {
    if (decisionType === 'accept') {
      updateCase(caseId, {
        status: 'Pomiar efektu',
        timelineEntry: {
          text: 'Klient AKCEPTOWAŁ rekomendację. Uruchomiono Action Plan.',
          time: 'Dzisiaj',
        },
      });
      setToast(`Decyzja została zarejestrowana dla sprawy ${caseId}`);
      return;
    }

    if (decisionType === 'reject') {
      updateCase(caseId, {
        status: 'Odrzucona',
        timelineEntry: {
          text: 'Klient zdecydował o niewdrażaniu rekomendacji.',
          time: 'Dzisiaj',
        },
      });
      setToast('Rekomendacja oznaczona jako niewdrażana');
      return;
    }

    setToast('Wysyłanie prośby o doprecyzowanie do eksperta');
  }

  return (
    <main className="pd-msbi" data-testid="marketing-support-bi-page">
      <MarketingSupportAnchorNav activeTab={activeTab} onTabChange={changeTab} />

      <MarketingSupportHeader
        onRoleToggle={() => setRole(role === 'client' ? 'admin' : 'client')}
        role={role}
      />

      <div className="pd-msbi__content">
        {activeTab === 'overview' ? (
          <MarketingSupportOverview
            onCreateBrief={prefillBrief}
            onOpenBrief={() => changeTab('brief-builder')}
            onOpenCase={openCaseDetail}
            onOpenQuote={() => setQuoteOpen(true)}
          />
        ) : null}
        {activeTab === 'workspace' ? (
          <MarketingCaseWorkspace
            caseFilter={caseFilter}
            cases={cases}
            onCaseFilterChange={setCaseFilter}
            onCreateBrief={() => changeTab('brief-builder')}
            onDecision={handleCustomerDecision}
            onSelectCase={setSelectedCaseId}
            selectedCase={selectedCase}
          />
        ) : null}
        {activeTab === 'brief-builder' ? (
          <MarketingBriefBuilder
            draft={briefDraft}
            onDraftChange={setBriefDraft}
            onSaveDraft={() => setToast('Szkic zapisany w pamięci lokalnej przeglądarki')}
            onScan={() => {
              setScanStamp('Skaner Papa AI zaktualizował próbkę danych z ostatnich 28 dni');
              setToast('Skaner Papa AI zaktualizował Context Pack');
            }}
            onStepChange={setBriefStep}
            onSubmit={() => {
              setActiveTab('workspace');
              setBriefStep(1);
              setToast('Brief został pomyślnie wysłany do backendu API (/dashboard/support/threads)');
            }}
            scanStamp={scanStamp}
            step={briefStep}
          />
        ) : null}
        {activeTab === 'outcomes' ? (
          <MarketingOutcomes
            impactWindow={impactWindow}
            onImpactWindowChange={setImpactWindow}
          />
        ) : null}
        {activeTab === 'architecture' ? <MarketingArchitecture /> : null}
      </div>

      <MarketingQuoteModal
        onClose={() => setQuoteOpen(false)}
        onSubmit={() => {
          setQuoteOpen(false);
          setToast('Wniosek o wycenę przesłany. Obiekt MarketingSupportQuote stworzony ze stanem DRAFT');
        }}
        open={quoteOpen}
        role={role}
      />
      <MarketingSupportToast message={toast} />
    </main>
  );
}

export function MarketingSupportHeader({
  onRoleToggle = noop,
  role = 'client',
}: {
  readonly onRoleToggle?: () => void;
  readonly role?: MarketingSupportRole;
}) {
  return (
    <header className="pd-msbi-header">
      <div className="pd-msbi-header__inner">
        <div className="pd-msbi-header__top">
          <div className="pd-msbi-brand">
            <span>PAPA</span>
            <div>
              <div className="pd-msbi-title-row">
                <strong>Wsparcie w marketingu</strong>
                <em>ID-11 · Business</em>
              </div>
              <p>Marketing Advisory & Execution Support</p>
            </div>
          </div>

          <div className="pd-msbi-role-panel">
            <div>
              <strong>Firma Demo Sp. z o.o.</strong>
              <span>Plan: <b>Professional</b></span>
            </div>
            <button className="pd-msbi-role-button" onClick={onRoleToggle} type="button">
              Rola: <strong>{marketingSupportRoleLabels[role]}</strong>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Floating pill nav that appears on scroll -- same pattern as every other BI mockup (Command Center/Campaigns/Orders/Products/Customers/Traffic), replacing the header-embedded nav bar. */
function MarketingSupportAnchorNav({
  activeTab = 'overview',
  onTabChange = noop,
}: {
  readonly activeTab?: MarketingSupportTabId;
  readonly onTabChange?: (tabId: MarketingSupportTabId) => void;
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(globalThis.scrollY > 24);
    }

    handleScroll();
    globalThis.addEventListener('scroll', handleScroll, { passive: true });
    return () => globalThis.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      aria-label="Zakładki Wsparcia Marketingowego"
      className={isScrolled ? 'pd-msbi-nav is-visible' : 'pd-msbi-nav'}
    >
      <div>
        {marketingSupportTabs.map((tab) => (
          <button
            className={activeTab === tab.id ? 'is-active' : ''}
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id);
              globalThis.scrollTo({ behavior: 'smooth', top: 0 });
            }}
            type="button"
          >
            {tab.label}
            {tab.badge ? <span>{tab.badge}</span> : null}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function MarketingSupportOverview({
  onCreateBrief = noop,
  onOpenBrief = noop,
  onOpenCase = noop,
  onOpenQuote = noop,
}: {
  readonly onCreateBrief?: (subject: string, area: MarketingSuggestionArea, problem: string) => void;
  readonly onOpenBrief?: () => void;
  readonly onOpenCase?: (caseId: string) => void;
  readonly onOpenQuote?: () => void;
}) {
  return (
    <section className="pd-msbi-tab" id="tab-overview">
      <div className="pd-msbi-intro">
        <div>
          <h1>Wsparcie w marketingu</h1>
          <p>Uzyskaj ustrukturyzowaną rekomendację opartą na danych PapaData, skonsultuj krytyczną decyzję marketingową z ekspertem i śledź jej realny wpływ biznesowy. To nie jest zwykły system ticketów - PapaData zna już Twój biznes, e-commerce i kampanie.</p>
        </div>
        <Button onClick={onOpenBrief} variant="primary">
          Poproś o rekomendację
          <span>→</span>
        </Button>
      </div>

      <MarketingPriorityCallout onOpenCase={() => onOpenCase('MS-2026-0182')} />
      <MarketingSuggestionsGrid onCreateBrief={onCreateBrief} />

      <div className="pd-msbi-overview-grid">
        <MarketingEntitlementCard onOpenQuote={onOpenQuote} />
        <MarketingCaseTypeChart />
      </div>
    </section>
  );
}

function MarketingPriorityCallout({
  onOpenCase,
}: {
  readonly onOpenCase: () => void;
}) {
  return (
    <PriorityBand
      actions={(
        <Button onClick={onOpenCase} variant="primary">
          Zobacz rekomendację i podjęcie decyzji
        </Button>
      )}
      badgeLabel="Papa · Wymaga Decyzji"
      timestampLabel="Oczekuje od 2 dni"
      title="Rekomendacja alokacji budżetu Meta Ads czeka na Twoją decyzję"
    >
      <p>Ekspert Anna Kowalska zakończyła analizę przypadku <strong>MS-2026-0182</strong>. Wykryto ujemną marżę po marketingu na 14 produktach z kampanii Prospecting.</p>
      <p>Szacowany wpływ: <strong>+18 000 zł marży/m-c</strong></p>
    </PriorityBand>
  );
}

function MarketingSuggestionsGrid({
  onCreateBrief,
}: {
  readonly onCreateBrief: (subject: string, area: MarketingSuggestionArea, problem: string) => void;
}) {
  return (
    <Panel
      bordered={false}
      collapsed={false}
      collapsible={false}
      description="Automatyczny skaner danych PapaData"
      eyebrow="Papa AI"
      padding="md"
      title="Sugerowane tematy konsultacji na podstawie anomalii"
    >
      <div className="pd-msbi-suggestion-grid">
        {marketingSuggestions.map((suggestion) => (
          <article className="pd-msbi-suggestion-card" key={suggestion.title}>
            <div>
              <div className="pd-msbi-suggestion-card__meta">
                <StatusBadge status="Sygnał" text={suggestion.metric} tone={suggestionTone(suggestion.tone)} />
                <em>{suggestion.detected}</em>
              </div>
              <h3>{suggestion.title}</h3>
              <p>{suggestion.summary}</p>
            </div>
            <div className="pd-msbi-suggestion-card__footer">
              <span>Auto-pack danych: Gotowy</span>
              <Button onClick={() => onCreateBrief(suggestion.title, suggestion.area, suggestion.problem)} size="small" variant="secondary">
                Utwórz brief →
              </Button>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function suggestionTone(tone: MarketingSupportTone): 'critical' | 'warning' | 'success' | 'info' | 'neutral' {
  switch (tone) {
    case 'rose':
      return 'critical';
    case 'amber':
      return 'warning';
    case 'emerald':
      return 'success';
    case 'indigo':
      return 'info';
    default:
      return 'neutral';
  }
}

function MarketingEntitlementCard({
  onOpenQuote,
}: {
  readonly onOpenQuote: () => void;
}) {
  const progress = (marketingEntitlement.briefUsed / marketingEntitlement.briefLimit) * 100;

  return (
    <section className="pd-msbi-entitlement">
      <div>
        <div className="pd-msbi-entitlement__head">
          <span>Twój Poziom Wsparcia</span>
          <em>{marketingEntitlement.status}</em>
        </div>
        <h2>{marketingEntitlement.plan}</h2>
        <p>{marketingEntitlement.summary}</p>

        <div className="pd-msbi-entitlement__usage">
          <div>
            <span>Briefy w pakiecie:</span>
            <strong>{marketingEntitlement.briefUsed} / {marketingEntitlement.briefLimit} wykorzystane</strong>
          </div>
          <div className="pd-msbi-progress"><i style={{ width: `${progress}%` }} /></div>
          <div>
            <span>Gwarancja SLA: <strong>{marketingEntitlement.sla}</strong></span>
            <span>Dedykowany opiekun: <strong>{marketingEntitlement.advisor}</strong></span>
          </div>
        </div>
      </div>

      <div className="pd-msbi-entitlement__footer">
        <span>Potrzebujesz więcej wsparcia?</span>
        <button onClick={onOpenQuote} type="button">Poproś o wycenę →</button>
      </div>
    </section>
  );
}

export function MarketingCaseTypeChart() {
  return (
    <section className="pd-msbi-chart-panel pd-msbi-chart-panel--wide">
      <div className="pd-msbi-chart-panel__head">
        <div>
          <h3>Rozkład tematyczny zgłaszanych spraw</h3>
          <p>Najczęstsze obszary decyzji marketingowych w Twoim sklepie</p>
        </div>
        <span>Suma: 12 spraw</span>
      </div>
      <div className="pd-msbi-chart" role="img" aria-label="Rozkład tematyczny zgłaszanych spraw">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              cx="50%"
              cy="50%"
              data={caseTypeDistribution}
              dataKey="value"
              innerRadius={58}
              nameKey="label"
              outerRadius={92}
              paddingAngle={2}
            >
              {caseTypeDistribution.map((entry) => (
                <Cell fill={chartColors[entry.tone]} key={entry.label} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function MarketingCaseWorkspace({
  caseFilter = 'all',
  cases = marketingCases,
  onCaseFilterChange = noop,
  onCreateBrief = noop,
  onDecision = noop,
  onSelectCase = noop,
  selectedCase = marketingCases[0],
}: {
  readonly caseFilter?: MarketingCaseFilter;
  readonly cases?: readonly MarketingSupportCase[];
  readonly onCaseFilterChange?: (filter: MarketingCaseFilter) => void;
  readonly onCreateBrief?: () => void;
  readonly onDecision?: (caseId: string, decision: 'accept' | 'clarification' | 'reject') => void;
  readonly onSelectCase?: (caseId: string) => void;
  readonly selectedCase?: MarketingSupportCase;
}) {
  const visibleCases = useMemo(() => cases.filter((supportCase) => {
    if (caseFilter === 'all') return true;
    return supportCase.area === caseFilter;
  }), [caseFilter, cases]);

  return (
    <section className="pd-msbi-tab" id="tab-workspace">
      <div className="pd-msbi-workspace-head">
        <div>
          <h1>Workspace Wsparcia Marketingowego</h1>
          <p>Przeglądaj aktywne briefy, analizuj kontekst danych, czytaj rekomendacje ekspertów i zatwierdzaj plany wdrożeń.</p>
        </div>
        <div>
          <select
            aria-label="Filtr obszaru spraw"
            onChange={(event) => onCaseFilterChange(event.target.value as MarketingCaseFilter)}
            value={caseFilter}
          >
            {marketingCaseFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button className="pd-msbi-primary-button" onClick={onCreateBrief} type="button">+ Nowy brief</button>
        </div>
      </div>

      <div className="pd-msbi-master-detail">
        <aside className="pd-msbi-case-list" aria-label="Lista briefów i spraw">
          <div className="pd-msbi-case-list__head">
            <span>LISTA BRIEFÓW I SPRAW</span>
            <strong>{visibleCases.length}</strong>
          </div>
          <div>
            {visibleCases.map((supportCase) => (
              <button
                className={selectedCase.id === supportCase.id ? `is-active pd-msbi-case-card--${statusTone(supportCase.status)}` : `pd-msbi-case-card--${statusTone(supportCase.status)}`}
                key={supportCase.id}
                onClick={() => onSelectCase(supportCase.id)}
                type="button"
              >
                <div>
                  <code>{supportCase.id}</code>
                  <span className={`pd-msbi-badge pd-msbi-badge--${statusTone(supportCase.status)}`}>{supportCase.status}</span>
                </div>
                <strong>{supportCase.subject}</strong>
                <p>Obszar: <b>{supportCase.area}</b> · Ekspert: <b>{shortExpertName(supportCase.expert)}</b></p>
                <small>{caseStatusLine(supportCase)}</small>
              </button>
            ))}
          </div>
        </aside>

        <MarketingCaseInspector
          onDecision={onDecision}
          selectedCase={selectedCase}
        />
      </div>
    </section>
  );
}

function MarketingCaseInspector({
  onDecision,
  selectedCase,
}: {
  readonly onDecision: (caseId: string, decision: 'accept' | 'clarification' | 'reject') => void;
  readonly selectedCase: MarketingSupportCase;
}) {
  return (
    <section className="pd-msbi-inspector">
      <div className="pd-msbi-inspector__head">
        <div>
          <div>
            <code>{selectedCase.id}</code>
            <span className={`pd-msbi-badge pd-msbi-badge--${statusTone(selectedCase.status)}`}>{selectedCase.status}</span>
            <span className="pd-msbi-badge pd-msbi-badge--slate">{selectedCase.area}</span>
          </div>
          <h2>{selectedCase.subject}</h2>
        </div>
        <div>
          <span>Termin biznesowy: <strong>{selectedCase.deadline}</strong></span>
          <span>Ekspert: <strong>{selectedCase.expert}</strong></span>
        </div>
      </div>

      <div className="pd-msbi-inspector__body">
        <div className="pd-msbi-problem-grid">
          <InfoBlock label="Opis Obserwowanego Problemu" value={selectedCase.problem} />
          <InfoBlock label="Oczekiwana Decyzja Biznesowa" strong value={selectedCase.decisionNeeded} />
        </div>

        <MarketingContextPack caseData={selectedCase} />

        <div className="pd-msbi-ai-preanalysis">
          <div>
            <span>PAPA AI · WSTĘPNA DIAGNOZA</span>
            <em>Wygenerowano automatycznie</em>
          </div>
          <p>{selectedCase.aiPreAnalysis}</p>
        </div>

        {selectedCase.recommendation.ready ? (
          <MarketingRecommendation
            onDecision={onDecision}
            selectedCase={selectedCase}
          />
        ) : (
          <div className="pd-msbi-pending-analysis">
            <strong>Analiza ekspercka w toku</strong>
            <p>Ekspert {selectedCase.expert} weryfikuje hipotezy z zespołem Papa AI. Rekomendacja zostanie opublikowana zgodnie z SLA.</p>
          </div>
        )}

        <MarketingTimeline selectedCase={selectedCase} />
      </div>
    </section>
  );
}

function InfoBlock({
  label,
  strong = false,
  value,
}: {
  readonly label: string;
  readonly strong?: boolean;
  readonly value: string;
}) {
  return (
    <article>
      <span>{label}</span>
      <p className={strong ? 'is-strong' : undefined}>{value}</p>
    </article>
  );
}

function MarketingContextPack({
  caseData,
}: {
  readonly caseData: MarketingSupportCase;
}) {
  return (
    <section className="pd-msbi-context-pack">
      <div>
        <strong>
          <span>CONTEXT PACK</span>
          Dołączony Snapshot Danych PapaData
        </strong>
        <em>Proweniencja: {caseData.dataSnapshot.provenance}</em>
      </div>
      <div className="pd-msbi-snapshot-grid">
        <MetricSnapshot label="Wydatki" value={caseData.dataSnapshot.metrics.spend} />
        <MetricSnapshot label="ROAS" tone="rose" value={caseData.dataSnapshot.metrics.roas} />
        <MetricSnapshot label="CPC" tone="amber" value={caseData.dataSnapshot.metrics.cpc} />
        <MetricSnapshot label="Wskaźnik CR" value={caseData.dataSnapshot.metrics.cr} />
      </div>
    </section>
  );
}

function MetricSnapshot({
  label,
  tone = 'slate',
  value,
}: {
  readonly label: string;
  readonly tone?: MarketingSupportTone;
  readonly value: string;
}) {
  return (
    <article className="pd-msbi-metric-snapshot">
      <span>{label}</span>
      <strong className={`pd-msbi-text-${tone}`}>{value}</strong>
    </article>
  );
}

function MarketingRecommendation({
  onDecision,
  selectedCase,
}: {
  readonly onDecision: (caseId: string, decision: 'accept' | 'clarification' | 'reject') => void;
  readonly selectedCase: MarketingSupportCase;
}) {
  return (
    <section className="pd-msbi-recommendation">
      <div className="pd-msbi-recommendation__head">
        <div>
          <span>EKSPERT PAPADATA</span>
          <h3>Rekomendacja i Plan Działań</h3>
        </div>
        <em>Pewność: {selectedCase.recommendation.confidence}</em>
      </div>
      <div>
        <span>Wniosek i Rekomendowane Działanie</span>
        <p>{selectedCase.recommendation.summary}</p>
      </div>
      <div className="pd-msbi-impact-box">
        <strong>Oczekiwany wpływ biznesowy (Estymacja):</strong>
        <span>{selectedCase.recommendation.expectedImpact}</span>
      </div>
      <div className="pd-msbi-action-plan">
        <span>Plan Działań (Action Plan)</span>
        {(selectedCase.recommendation.actionPlan ?? []).map((item, index) => (
          <div key={`${selectedCase.id}-${item.task}`}>
            <p>{index + 1}. {item.task}</p>
            <em>{item.owner}</em>
          </div>
        ))}
      </div>
      <div className="pd-msbi-recommendation__actions">
        <button className="pd-msbi-muted-button" onClick={() => onDecision(selectedCase.id, 'clarification')} type="button">Potrzebuję wyjaśnienia</button>
        <button className="pd-msbi-danger-light-button" onClick={() => onDecision(selectedCase.id, 'reject')} type="button">Nie wdrażam</button>
        <button className="pd-msbi-success-button" onClick={() => onDecision(selectedCase.id, 'accept')} type="button">Akceptuję i wdrażam plan</button>
      </div>
    </section>
  );
}

function MarketingTimeline({
  selectedCase,
}: {
  readonly selectedCase: MarketingSupportCase;
}) {
  return (
    <section className="pd-msbi-timeline">
      <h3>Historia sprawy i Komunikacja (Timeline)</h3>
      {selectedCase.timeline.map((item) => (
        <div key={`${selectedCase.id}-${item.time}-${item.text}`}>
          <time>{item.time}</time>
          <span>• {item.text}</span>
        </div>
      ))}
    </section>
  );
}

export function MarketingBriefBuilder({
  draft = marketingBriefDefault,
  onDraftChange = noop,
  onSaveDraft = noop,
  onScan = noop,
  onStepChange = noop,
  onSubmit = noop,
  scanStamp = 'GA4 + Meta Ads zsynchronizowane',
  step = 1,
}: {
  readonly draft?: MarketingBriefDraft;
  readonly onDraftChange?: (draft: MarketingBriefDraft) => void;
  readonly onSaveDraft?: () => void;
  readonly onScan?: () => void;
  readonly onStepChange?: (step: number) => void;
  readonly onSubmit?: () => void;
  readonly scanStamp?: string;
  readonly step?: number;
}) {
  function update<K extends keyof MarketingBriefDraft>(key: K, value: MarketingBriefDraft[K]) {
    onDraftChange({
      ...draft,
      [key]: value,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 4) {
      onStepChange(step + 1);
      return;
    }

    onSubmit();
  }

  return (
    <section className="pd-msbi-tab" id="tab-brief-builder">
      <div className="pd-msbi-brief">
        <div>
          <h1>Nowy Brief Marketingowy (Wniosek o Rekomendację)</h1>
          <p>Nie musisz pisać wszystkiego od zera. Wypełnij ustrukturyzowane pytania, a silnik PapaData automatycznie dołączy aktualny snapshot metryk, kampanii i produktów z Twojego konta.</p>
        </div>

        <MarketingWizardSteps step={step} />

        <form className="pd-msbi-brief-form" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="pd-msbi-form-step">
              <label>
                <span>Temat zgłoszenia / sprawy *</span>
                <input
                  onChange={(event) => update('subject', event.target.value)}
                  placeholder="np. Spadek ROAS w Meta Ads po zmianie kreacji wideo"
                  required
                  type="text"
                  value={draft.subject}
                />
              </label>
              <div className="pd-msbi-form-grid">
                <label>
                  <span>Obszar marketingowy *</span>
                  <select onChange={(event) => update('area', event.target.value as MarketingSuggestionArea)} value={draft.area}>
                    {briefAreaOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Pilność biznesowa klienta *</span>
                  <select onChange={(event) => update('urgency', event.target.value as MarketingBriefDraft['urgency'])} value={draft.urgency}>
                    {briefUrgencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                <span>Co dokładnie obserwujesz? (Opis problemu) *</span>
                <textarea
                  onChange={(event) => update('problem', event.target.value)}
                  placeholder="Opisz zauważone zmiany, spadek wskaźników lub wątpliwości..."
                  required
                  rows={3}
                  value={draft.problem}
                />
              </label>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="pd-msbi-form-step">
              <label>
                <span>Jakiej decyzji biznesowej oczekujesz od eksperta? *</span>
                <textarea
                  onChange={(event) => update('decisionNeeded', event.target.value)}
                  placeholder="np. Czy wyłączyć nowe kreacje wideo i wrócić do statyków, czy zmniejszyć budżet prospectingowy o 20%?"
                  required
                  rows={3}
                  value={draft.decisionNeeded}
                />
              </label>
              <div className="pd-msbi-form-grid">
                <label>
                  <span>Wymagany termin biznesowy (Requested Deadline)</span>
                  <input onChange={(event) => update('deadline', event.target.value)} type="date" value={draft.deadline} />
                  <small>To jest Twój oczekiwany termin decyzji, a nie sztywne SLA gwarantowane.</small>
                </label>
                <label>
                  <span>Osoba decyzyjna po Twojej stronie</span>
                  <input onChange={(event) => update('decisionMaker', event.target.value)} placeholder="np. Anna Kowalska (E-commerce Manager)" type="text" value={draft.decisionMaker} />
                </label>
              </div>
            </div>
          ) : null}

          {step === 3 ? <MarketingContextPackPreview onScan={onScan} scanStamp={scanStamp} /> : null}
          {step === 4 ? <MarketingBriefSummary draft={draft} /> : null}

          <div className="pd-msbi-wizard-actions">
            {step > 1 ? (
              <button className="pd-msbi-muted-button" onClick={() => onStepChange(step - 1)} type="button">
                ← Wstecz
              </button>
            ) : <span />}
            <div>
              <button className="pd-msbi-link-button" onClick={onSaveDraft} type="button">Zapisz jako szkic</button>
              <button className={step === 4 ? 'pd-msbi-success-button' : 'pd-msbi-primary-button'} type="submit">
                {step === 4 ? 'Wyślij brief do analizy →' : 'Przejdź dalej →'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

function MarketingWizardSteps({
  step,
}: {
  readonly step: number;
}) {
  const labels = ['1. Cel & Problem', '2. Wymagana Decyzja', '3. Context Pack (AI)', '4. Podsumowanie & Wysłanie'];

  return (
    <div className="pd-msbi-wizard-steps">
      {labels.map((label, index) => (
        <span className={index + 1 === step ? 'is-active' : ''} key={label}>{label}</span>
      ))}
    </div>
  );
}

function MarketingContextPackPreview({
  onScan,
  scanStamp,
}: {
  readonly onScan: () => void;
  readonly scanStamp: string;
}) {
  return (
    <section className="pd-msbi-context-preview">
      <div className="pd-msbi-context-preview__head">
        <div>
          <span>PAPA AI</span>
          <h4>Automatyczny Context Pack</h4>
        </div>
        <button onClick={onScan} type="button">Ponów skanowanie</button>
      </div>
      <p>PapaData przeszukała dane historyczne z ostatnich 28 dni. Zapobiegnie to konieczności przekazywania nam zrzutów ekranu czy ręcznych tabel.</p>
      <div className="pd-msbi-context-preview__snapshot">
        <div>
          <span>Zakres dat: <strong>01.08.2026 - 28.08.2026</strong></span>
          <em>✓ {scanStamp}</em>
        </div>
        <div className="pd-msbi-context-preview__metrics">
          {contextPackMetrics.map((metric) => (
            <MetricSnapshot key={metric.label} label={metric.label} tone={metric.tone} value={metric.value} />
          ))}
        </div>
        <p><strong>Ochrona prywatności (Privacy by Design):</strong> Żadne dane osobowe klientów (PII) ani pojedyncze zamówienia nie są dołączane do paczki.</p>
      </div>
    </section>
  );
}

function MarketingBriefSummary({
  draft,
}: {
  readonly draft: MarketingBriefDraft;
}) {
  const areaLabel = briefAreaOptions.find((option) => option.value === draft.area)?.label ?? draft.area;
  const urgencyLabel = briefUrgencyOptions.find((option) => option.value === draft.urgency)?.label ?? draft.urgency;

  return (
    <section className="pd-msbi-brief-summary">
      <h4>Podsumowanie zgłoszenia przed wysłaniem</h4>
      <div>
        <span>Temat: <strong>{draft.subject || 'Brak'}</strong></span>
        <span>Obszar: <strong>{areaLabel}</strong></span>
        <span>Pilność: <strong>{urgencyLabel}</strong></span>
        <span>Oczekiwany termin: <strong>{draft.deadline || 'Nieokreślony'}</strong></span>
      </div>
      <p><span>Wymagana decyzja:</span>{draft.decisionNeeded || 'Brak opisanej decyzji'}</p>
      <em>✓ Realne połączenie API: POST /dashboard/support/threads aktywne.</em>
    </section>
  );
}

export function MarketingOutcomes({
  impactWindow = 7,
  onImpactWindowChange = noop,
}: {
  readonly impactWindow?: ImpactWindow;
  readonly onImpactWindowChange?: (window: ImpactWindow) => void;
}) {
  return (
    <section className="pd-msbi-tab" id="tab-outcomes">
      <div className="pd-msbi-outcomes">
        <div className="pd-msbi-outcomes__head">
          <div>
            <h1>Biblioteka Rekomendacji & Pomiar Wyników</h1>
            <p>Śledź realne efekty wdrożonych rekomendacji w czasie. PapaData mierzy wskaźniki przed i po wdrożeniu, zachowując bezstronność (nie przypisujemy ślepej przyczynowości).</p>
          </div>
          <div className="pd-msbi-impact-toggle" role="group" aria-label="Zakres pomiaru efektu">
            {impactWindowOptions.map((option) => (
              <button
                className={impactWindow === option.value ? 'is-active' : ''}
                key={option.value}
                onClick={() => onImpactWindowChange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <MarketingImpactChart impactWindow={impactWindow} />
        <MarketingRecommendationHistory />
      </div>
    </section>
  );
}

function MarketingImpactChart({
  impactWindow,
}: {
  readonly impactWindow: ImpactWindow;
}) {
  return (
    <section className="pd-msbi-impact-chart-panel">
      <div>
        <h3>Ewolucja wskaźnika ROAS przed i po wdrożeniu (Przykładowa sprawa MS-2026-0175)</h3>
        <span>Zmiana po wdrożeniu: +22.6% ROAS</span>
      </div>
      <div className="pd-msbi-chart" role="img" aria-label={`Ewolucja ROAS ${impactWindow} dni po wdrożeniu`}>
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={impactSeriesByWindow[impactWindow]} margin={{ bottom: 8, left: 0, right: 16, top: 12 }}>
            <CartesianGrid stroke="rgb(var(--pd-msbi-slate-200))" vertical={false} />
            <XAxis dataKey="label" stroke="rgb(var(--pd-msbi-slate-500))" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis domain={[2, 5]} stroke="rgb(var(--pd-msbi-slate-500))" tick={{ fontSize: 11 }} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line dataKey="roas" name="ROAS Rzeczywisty" stroke={chartColors.emerald} strokeWidth={3} type="monotone" />
            <Line dataKey="baseline" dot={false} name="Mediana przed wdrożeniem (Baseline)" stroke="rgb(var(--pd-msbi-slate-400))" strokeDasharray="5 5" strokeWidth={2} type="monotone" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function MarketingRecommendationHistory() {
  return (
    <section className="pd-msbi-history">
      <h3>Historia zrealizowanych rekomendacji</h3>
      <div className="pd-msbi-table-wrap">
        <table className="pd-msbi-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Sprawa / Temat</th>
              <th>Obszar</th>
              <th>Rekomendacja</th>
              <th>Decyzja</th>
              <th>Wynik po wdrożeniu</th>
            </tr>
          </thead>
          <tbody>
            {recommendationHistory.map((item) => (
              <tr key={`${item.date}-${item.subject}`}>
                <td><code>{item.date}</code></td>
                <td><strong>{item.subject}</strong></td>
                <td><span className="pd-msbi-badge pd-msbi-badge--indigo">{item.area}</span></td>
                <td>{item.recommendation}</td>
                <td><span className={`pd-msbi-badge pd-msbi-badge--${item.decisionTone}`}>{item.decision}</span></td>
                <td>{item.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function MarketingArchitecture() {
  return (
    <section className="pd-msbi-tab" id="tab-architecture">
      <div className="pd-msbi-architecture">
        <div>
          <h1>Specyfikacja Architektoniczna & Model Danych</h1>
          <p>Syntetyczny podsumowanie audytu repozytorium, docelowej architektury informacji (IA), modelu uprawnień RBAC oraz harmonogramu realizacji P0-P2.</p>
        </div>
        <MarketingDomainMatrix />
        <MarketingRbacMatrix />
        <MarketingRoadmap />
      </div>
    </section>
  );
}

function MarketingDomainMatrix() {
  return (
    <section className="pd-msbi-domain-grid">
      {architectureDomains.map((domain) => (
        <article className={`pd-msbi-domain-card pd-msbi-domain-card--${domain.tone}`} key={domain.title}>
          <h3>{domain.title}</h3>
          <p>{domain.body}</p>
          <ul>
            {domain.examples.map((example) => (
              <li key={example}>• {example}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}

function MarketingRbacMatrix() {
  return (
    <section className="pd-msbi-rbac">
      <div>
        <h3>Granularny Model Uprawnień RBAC</h3>
        <p>Separacja roli Klienta od Operatora/Eksperta</p>
      </div>
      <div className="pd-msbi-rbac-grid">
        {rbacColumns.map((column) => (
          <article key={column.title}>
            <h4>{column.title}</h4>
            {column.capabilities.map((capability) => (
              <div key={capability.name}>
                <code>{capability.name}</code>
                <span className={`pd-msbi-text-${capability.tone}`}>{capability.value}</span>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}

function MarketingRoadmap() {
  return (
    <section className="pd-msbi-roadmap">
      <h3>Plan Wdrożenia (Roadmapa P0 → P1 → P2)</h3>
      <div>
        {roadmapItems.map((item) => (
          <article className={`pd-msbi-roadmap-card pd-msbi-roadmap-card--${item.tone}`} key={item.label}>
            <span>{item.label}</span>
            <h4>{item.title}</h4>
            <ul>
              {item.items.map((entry) => (
                <li key={entry}>• {entry}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function MarketingQuoteModal({
  onClose,
  onSubmit,
  open,
  role,
}: {
  readonly onClose: () => void;
  readonly onSubmit: () => void;
  readonly open: boolean;
  readonly role: MarketingSupportRole;
}) {
  if (!open) return null;

  return (
    <div className="pd-msbi-modal-overlay">
      <section aria-label="Zapytanie o wycenę usłu niestandardowej" aria-modal="true" className="pd-msbi-modal" role="dialog">
        <div className="pd-msbi-modal__head">
          <div>
            <h3>Zapytanie o wycenę usłu niestandardowej</h3>
            <p>MarketingSupportQuote Workflow</p>
          </div>
          <button aria-label="Zamknij wycenę" onClick={onClose} type="button">×</button>
        </div>
        <label>
          <span>Zakres prac / audytu</span>
          <input defaultValue="Pełna przebudowa feedu produktowego pod Google Ads" type="text" />
        </label>
        {role === 'client' ? (
          <div className="pd-msbi-rbac-warning">
            Nie posiadasz uprawnienia <code>marketing_support.quote.accept</code>. Zapytanie zostanie przesłane do akceptacji właściciela workspace.
          </div>
        ) : null}
        <div className="pd-msbi-price-box">
          <div><span>Szacowana cena netto:</span><strong>1 200,00 PLN</strong></div>
          <div><span>VAT (23%):</span><strong>276,00 PLN</strong></div>
          <div><span>Razem brutto:</span><strong>1 476,00 PLN</strong></div>
        </div>
        <div className="pd-msbi-modal-actions">
          <button className="pd-msbi-muted-button" onClick={onClose} type="button">Anuluj</button>
          <button className="pd-msbi-primary-button" onClick={onSubmit} type="button">Wyślij zapytanie o wycenę</button>
        </div>
      </section>
    </div>
  );
}

function MarketingSupportToast({
  message,
}: {
  readonly message: string;
}) {
  return (
    <output className="pd-msbi-toast" aria-live="polite">
      {message}
    </output>
  );
}

function statusTone(status: MarketingCaseStatus): MarketingSupportTone {
  if (status === 'Czeka na decyzję') return 'amber';
  if (status === 'Analiza w toku') return 'indigo';
  if (status === 'Pomiar efektu') return 'emerald';
  if (status === 'Odrzucona') return 'rose';
  return 'slate';
}

function caseStatusLine(supportCase: MarketingSupportCase) {
  if (supportCase.status === 'Czeka na decyzję') return 'Rekomendacja gotowa (SLA: dotrzymane)';
  if (supportCase.status === 'Pomiar efektu') return '✓ Wdrożono · Pomiar ROAS po 14 dniach';
  return 'Analiza danych GA4 & WooCommerce';
}

function shortExpertName(expert: string) {
  const [firstName, lastName] = expert.split(' ');
  return `${firstName} ${lastName?.[0] ?? ''}.`;
}
