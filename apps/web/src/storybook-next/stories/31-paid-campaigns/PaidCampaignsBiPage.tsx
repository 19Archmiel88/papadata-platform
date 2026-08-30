import type {
  FormEvent,
} from 'react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Button,
  Icon,
  MetricCard,
  PriorityBand,
  ProductSectionFrame,
  ProductSectionTopbar,
} from '../../../design-system';
import {
  paidCampaignsAiResponses,
  paidCampaignsAlerts,
  paidCampaignsAttributionData,
  paidCampaignsBudgetPlan,
  paidCampaignsCampaigns,
  paidCampaignsCreativeMetrics,
  paidCampaignsCreatives,
  paidCampaignsDecisionOptions,
  paidCampaignsDrawerAdGroups,
  paidCampaignsDrawerDivergence,
  paidCampaignsKpis,
  paidCampaignsPerformers,
  paidCampaignsPlatformCards,
  paidCampaignsPlatformComparison,
  paidCampaignsProvenanceDict,
  paidCampaignsRealityGap,
  paidCampaignsSections,
  paidCampaignsSectionsById,
  paidCampaignsTrendLabels,
  paidCampaignsTrendModes,
  paidCampaignsTrendSeries,
} from './PaidCampaignsBiPage.data';
import type {
  PaidCampaign,
  PaidCampaignsAiContextKey,
  PaidCampaignsDecision,
  PaidCampaignsDecisionFilter,
  PaidCampaignsMetricBadge,
  PaidCampaignsPlatformFilter,
  PaidCampaignsProvenanceKey,
  PaidCampaignsSectionId,
  PaidCampaignsTone,
  PaidCampaignsTrendMode,
} from './PaidCampaignsBiPage.data';
import './PaidCampaignsBiPage.css';

export type PaidCampaignsBiPageProps = {
  readonly initialSection?: PaidCampaignsSectionId;
};

type AiMessage =
  | {
      readonly id: string;
      readonly prompt: string;
      readonly type: 'user';
    }
  | {
      readonly contextKey: PaidCampaignsAiContextKey;
      readonly id: string;
      readonly type: 'context';
    };

const chartColors = {
  amber: 'rgb(var(--pd-pcbi-amber-500))',
  blue: 'rgb(var(--pd-pcbi-blue-500))',
  emerald: 'rgb(var(--pd-pcbi-emerald-500))',
  indigo: 'rgb(var(--pd-pcbi-indigo-600))',
  pink: 'rgb(var(--pd-pcbi-pink-500))',
  rose: 'rgb(var(--pd-pcbi-rose-500))',
  sky: 'rgb(var(--pd-pcbi-sky-600))',
  slate: 'rgb(var(--pd-pcbi-slate-500))',
  violet: 'rgb(var(--pd-pcbi-violet-500))',
} as const;

const noop = () => undefined;

export function PaidCampaignsBiPage({
  initialSection = 'wynik',
}: PaidCampaignsBiPageProps) {
  const [activeSection, setActiveSection] = useState<PaidCampaignsSectionId>(initialSection);
  const [selectedProvenance, setSelectedProvenance] = useState<PaidCampaignsProvenanceKey | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const selectedCampaign = paidCampaignsCampaigns.find((campaign) => campaign.id === selectedCampaignId) ?? null;

  function handleSectionChange(section: PaidCampaignsSectionId) {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleAiContext(contextKey: PaidCampaignsAiContextKey) {
    setIsAiOpen(true);
    setAiMessages((current) => [
      ...current,
      {
        contextKey,
        id: `${contextKey}-${current.length}`,
        type: 'context',
      },
    ]);
  }

  function handleAiPrompt(prompt: string) {
    setAiMessages((current) => [
      ...current,
      {
        id: `user-${current.length}`,
        prompt,
        type: 'user',
      },
      {
        contextKey: 'skaluj_google',
        id: `fallback-${current.length}`,
        type: 'context',
      },
    ]);
  }

  return (
    <main className="pd-pcbi" data-testid="paid-campaigns-bi-page">
      <ProductSectionTopbar
        activeId={activeSection}
        ariaLabel="Sekcje Kampanii Płatnych"
        items={paidCampaignsSections.map((section) => ({
          id: section.id,
          label: section.navLabel,
        }))}
        onActiveIdChange={(id) => handleSectionChange(id as PaidCampaignsSectionId)}
      />

      <div className="pd-pcbi__content">
        <PaidCampaignsResultSection
          onOpenAiContext={handleAiContext}
          onOpenProvenance={setSelectedProvenance}
          onTabChange={handleSectionChange}
        />
        <PaidCampaignsPlatformsSection onTabChange={handleSectionChange} />
        <PaidCampaignsRisksSection
          onOpenAiContext={handleAiContext}
          onTabChange={handleSectionChange}
        />
        <PaidCampaignsCampaignTable onOpenCampaign={setSelectedCampaignId} />
        <PaidCampaignsCreativeIntelligence onOpenAiContext={handleAiContext} />
        <PaidCampaignsAttribution />
        <PaidCampaignsBudgetPacing />
        <PaidCampaignsBudgetSimulator />
      </div>

      <ProvenanceModal
        metricKey={selectedProvenance}
        onClose={() => setSelectedProvenance(null)}
      />
      <CampaignDrawer
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaignId(null)}
        onOpenAiContext={handleAiContext}
      />
      <AiAssistantDrawer
        isOpen={isAiOpen}
        messages={aiMessages}
        onClose={() => setIsAiOpen(false)}
        onPromptSubmit={handleAiPrompt}
        onSelectContext={handleAiContext}
      />
      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={() => setIsExportOpen(false)}
      />
    </main>
  );
}

function Dropdown({
  ariaLabel,
  onChange,
  options,
  value,
}: {
  readonly ariaLabel: string;
  readonly onChange: (value: string) => void;
  readonly options: readonly {
    readonly label: string;
    readonly value: string;
  }[];
  readonly value: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="pd-pcbi-dropdown" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="pd-pcbi-dropdown__trigger"
        onClick={() => setOpen((prevOpen) => !prevOpen)}
        type="button"
      >
        {activeOption?.label}
        <svg aria-hidden="true" height="14" viewBox="0 0 24 24" width="14">
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>
      {open ? (
        <ul aria-label={ariaLabel} className="pd-pcbi-dropdown__list" role="listbox">
          {options.map((option) => (
            <li
              aria-selected={option.value === value}
              className={option.value === value ? 'is-selected' : ''}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              role="option"
            >
              {option.label}
              {option.value === value ? (
                <svg aria-hidden="true" height="14" viewBox="0 0 24 24" width="14">
                  <path d="m5 13 4 4L19 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}


export function PaidCampaignsResultSection({
  onOpenAiContext = noop,
  onOpenProvenance = noop,
  onTabChange = noop,
}: {
  readonly onOpenAiContext?: (contextKey: PaidCampaignsAiContextKey) => void;
  readonly onOpenProvenance?: (metricKey: PaidCampaignsProvenanceKey) => void;
  readonly onTabChange?: (tab: PaidCampaignsSectionId) => void;
}) {
  const [trendMode, setTrendMode] = useState<PaidCampaignsTrendMode>('financial');
  const trendChartData = useMemo(() => buildTrendChartData(trendMode), [trendMode]);
  const section = paidCampaignsSectionsById.wynik;

  return (
    <ProductSectionFrame
      actions={(
        <div className="pd-pcbi-result-stat">
          📍 Progu Break-even ROAS dla biznesu: <strong>3,10</strong> | Target ROAS: <strong>3,80</strong>
        </div>
      )}
      description="Odpowiedź na pytania: Ile wydajemy, jaki jest realny przychód przypisany, które kanały budują wartość, a które przepalają budżet."
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <PriorityBand
        actions={(
          <>
            <Button
              onClick={() => onOpenAiContext('skaluj_google')}
              startIcon={<Icon decorative name="assistant" size={16} />}
              variant="primary"
            >
              Przeanalizuj plan z Papa
            </Button>
            <Button onClick={() => onTabChange('kampanie')} variant="secondary">
              Zobacz dane kampanii ➔
            </Button>
          </>
        )}
        aria-label="Rekomendacja numer jeden"
        badgeLabel="Rekomendacja #1: Skaluj"
        timestampLabel="Google Ads (Shopping / Performance Max) · Pewność AI: 82%"
        title="Zwiększ budżet Google Shopping o +15% do +20% (ok. +8 000 PLN / mies.)"
      >
        <p>
          <strong>Uzasadnienie:</strong> ROAS wynosi <strong>5,42</strong> (32% powyżej celu 3,80), nCAC utrzymuje się na poziomie <strong>78 PLN</strong> (vs limit 100 PLN), a nasycenie częstotliwością nie wykazuje oznak fatigue. Meta Ads wykazuje spadek rentowności – sugerujemy przesunięcie alokacji.
        </p>
        <p className="pd-pcbi-hero__meta">
          <span>📈 Potencjalny wpływ: <strong>+18 400 PLN przychodu / mies.</strong></span>
          <span>⏱️ Horyzont: <strong>7 dni</strong></span>
          <span>⚠️ Model atrybucji: <strong>Last Click (Pomiar/Estymacja)</strong></span>
        </p>
      </PriorityBand>

      <section className="pd-pcbi-kpi-grid" aria-label="Główne KPI kampanii płatnych">
        {paidCampaignsKpis.map((kpi) => {
          const cleanBadge = kpi.badge.replace(/[[\]]/g, '');
          return (
            <MetricCard
              comparison={{ direction: kpi.change.startsWith('-') ? 'down' : kpi.change.startsWith('+') ? 'up' : 'flat', label: `${kpi.change} · ${kpi.note}` }}
              detailAction={{ label: `${cleanBadge} · Źródło i wzór`, onAction: () => onOpenProvenance(kpi.key) }}
              key={kpi.key}
              label={kpi.label}
              metricId={`campaigns-kpi-${kpi.key}`}
              signal={kpi.change.startsWith('-') ? 'negative' : kpi.change.startsWith('+') ? 'positive' : 'neutral'}
              status="ready"
              statusLabel={cleanBadge}
              value={kpi.value}
            />
          );
        })}
      </section>

      <section className="pd-pcbi-panel pd-pcbi-panel--chart" aria-labelledby="pd-pcbi-trend-title">
        <div className="pd-pcbi-panel__head">
          <div>
            <h3 id="pd-pcbi-trend-title">Trend Wyników w Czasie</h3>
            <p>Przełączaj perspektywę analityczną, aby ocenić dynamikę skali i efektywności.</p>
          </div>
          <div className="pd-pcbi-segmented" role="group" aria-label="Tryb trendu wyników">
            {paidCampaignsTrendModes.map((mode) => (
              <button
                className="pd-pcbi-segmented__item"
                data-active={trendMode === mode.id ? 'true' : 'false'}
                key={mode.id}
                onClick={() => setTrendMode(mode.id)}
                type="button"
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        <div className="pd-pcbi-chart" data-testid="paid-campaigns-trend-chart">
          <ResponsiveContainer height="100%" width="100%">
            <RechartsLineChart data={trendChartData} margin={{ bottom: 8, left: 0, right: 18, top: 8 }}>
              <CartesianGrid stroke="rgb(var(--pd-pcbi-slate-200))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={54} />
              <Tooltip />
              <Legend />
              {paidCampaignsTrendSeries[trendMode].map((series) => (
                <Line
                  dataKey={series.key}
                  dot={false}
                  key={series.key}
                  name={series.label}
                  stroke={chartColors[series.color]}
                  strokeDasharray={series.dash ? '5 5' : undefined}
                  strokeWidth={series.dash ? 2 : 3}
                  type="monotone"
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </ProductSectionFrame>
  );
}

export function PaidCampaignsPlatformsSection({
  onTabChange = noop,
}: {
  readonly onTabChange?: (tab: PaidCampaignsSectionId) => void;
}) {
  const section = paidCampaignsSectionsById.platformy;

  return (
    <ProductSectionFrame
      description="Relacja udziału w wydatkach do udziału w generowanym przychodzie wg platformy oraz kampanie o największej dodatniej i ujemnej dźwigni finansowej."
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <section className="pd-pcbi-two-column">
        <section className="pd-pcbi-panel" aria-labelledby="pd-pcbi-platform-title">
          <div className="pd-pcbi-panel__head pd-pcbi-panel__head--compact">
            <div>
              <h3 id="pd-pcbi-platform-title">Porównanie Platform Reklamowych</h3>
              <p>Relacja udziału w wydatkach do udziału w generowanym przychodzie</p>
            </div>
            <span className="pd-pcbi-pill pd-pcbi-pill--indigo-soft">2 Aktywne źródła</span>
          </div>

          <div className="pd-pcbi-chart pd-pcbi-chart--short">
            <ResponsiveContainer height="100%" width="100%">
              <RechartsBarChart data={paidCampaignsPlatformComparison} margin={{ bottom: 8, left: 0, right: 18, top: 8 }}>
                <CartesianGrid stroke="rgb(var(--pd-pcbi-slate-200))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(value) => `${value}%`} width={42} />
                <Tooltip />
                <Legend />
                <Bar dataKey="budgetShare" fill={chartColors.indigo} name="Udział w Budżecie (%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenueShare" fill={chartColors.emerald} name="Udział w Przychodzie (%)" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          <div className="pd-pcbi-platform-cards">
            {paidCampaignsPlatformCards.map((platform) => (
              <article className="pd-pcbi-platform-card" key={platform.label}>
                <div>
                  <strong>{platform.marker} {platform.label}</strong>
                  <DecisionBadge decision={platform.decision as PaidCampaignsDecision} />
                </div>
                <p>Spend: {platform.spend} <span>({platform.share})</span></p>
                <p>Przychód: {platform.revenue}</p>
                <p>ROAS: {platform.roas} | nCAC: {platform.ncac}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pd-pcbi-panel" aria-labelledby="pd-pcbi-performers-title">
          <div className="pd-pcbi-panel__head pd-pcbi-panel__head--compact">
            <div>
              <h3 id="pd-pcbi-performers-title">Liderzy i Wypalające się Kampanie</h3>
              <p>Kampanie o największej dodatniej i ujemnej dźwigni finansowej</p>
            </div>
            <button className="pd-pcbi-link-button" onClick={() => onTabChange('kampanie')} type="button">
              Wszystkie kampanie (14) ➔
            </button>
          </div>

          <PerformerList group="top" title="💚 Najwyższa Wydajność (Top Performers)" />
          <PerformerList group="bottom" title="🛑 Wymagają Reakcji (Underperformers)" />
        </section>
      </section>
    </ProductSectionFrame>
  );
}

export function PaidCampaignsRisksSection({
  onOpenAiContext = noop,
  onTabChange = noop,
}: {
  readonly onOpenAiContext?: (contextKey: PaidCampaignsAiContextKey) => void;
  readonly onTabChange?: (tab: PaidCampaignsSectionId) => void;
}) {
  const section = paidCampaignsSectionsById.ryzyka;

  return (
    <ProductSectionFrame
      actions={<span className="pd-pcbi-pill pd-pcbi-pill--rose-soft">3 Zdarzenia</span>}
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
        <div className="pd-pcbi-alert-grid">
          {paidCampaignsAlerts.map((alert) => (
            <article className={`pd-pcbi-alert pd-pcbi-alert--${alert.tone}`} key={alert.label}>
              <div>
                <strong>{alert.label}</strong>
                <span>{alert.platform}</span>
              </div>
              <p>{alert.body}</p>
              <button
                className="pd-pcbi-link-button"
                onClick={() => {
                  if ('tab' in alert && alert.tab) onTabChange(alert.tab);
                  if ('contextKey' in alert && alert.contextKey) onOpenAiContext(alert.contextKey);
                }}
                type="button"
              >
                {alert.action}
              </button>
            </article>
          ))}
        </div>
    </ProductSectionFrame>
  );
}

const decisionDropdownOptions = paidCampaignsDecisionOptions.map((decision) => ({
  label: decision === 'all' ? 'Wszystkie decyzje' : decision,
  value: decision,
}));

export function PaidCampaignsCampaignTable({
  onOpenCampaign = noop,
  platformFilter = 'all',
}: {
  readonly onOpenCampaign?: (campaignId: string) => void;
  readonly platformFilter?: PaidCampaignsPlatformFilter;
}) {
  const [query, setQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<PaidCampaignsDecisionFilter>('all');
  const section = paidCampaignsSectionsById.kampanie;

  const filteredCampaigns = useMemo(
    () => paidCampaignsCampaigns.filter((campaign) => {
      const normalizedQuery = query.trim().toLowerCase();
      const matchesPlatform = platformFilter === 'all' || campaign.platform === platformFilter;
      const matchesSearch = !normalizedQuery
        || campaign.name.toLowerCase().includes(normalizedQuery)
        || campaign.id.toLowerCase().includes(normalizedQuery);
      const matchesDecision = decisionFilter === 'all' || campaign.decision === decisionFilter;
      return matchesPlatform && matchesSearch && matchesDecision;
    }),
    [decisionFilter, platformFilter, query],
  );

  return (
    <ProductSectionFrame
      actions={(
        <div className="pd-pcbi-table-toolbar__controls">
          <input
            aria-label="Szukaj nazwy lub ID kampanii"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj nazwy lub ID kampanii..."
            type="search"
            value={query}
          />
          <Dropdown
            ariaLabel="Filtr decyzji kampanii"
            onChange={(value) => setDecisionFilter(value as PaidCampaignsDecisionFilter)}
            options={decisionDropdownOptions}
            value={decisionFilter}
          />
        </div>
      )}
      description="Unikalne identyfikatory z baz danych PapaData. Kliknij wiersz, aby otworzyć panel drill-down."
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-pcbi-panel pd-pcbi-table-card">
        <div className="pd-pcbi-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Status & Decyzja</th>
                <th>Kampania (ID)</th>
                <th>Platforma</th>
                <th>Wydatki</th>
                <th>Przychód Przyp.</th>
                <th>ROAS</th>
                <th>CPA</th>
                <th>nCAC</th>
                <th>CTR / CPC</th>
                <th>Nadwyżka Mediowa</th>
                <th>Akcja</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td className="pd-pcbi-empty-cell" colSpan={11}>
                    Brak kampanii spełniających podane kryteria filtracji.
                  </td>
                </tr>
              ) : filteredCampaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td>
                    <DecisionBadge decision={campaign.decision} />
                  </td>
                  <td>
                    <strong>{campaign.name}</strong>
                    <span>{campaign.id}</span>
                  </td>
                  <td>{platformLabel(campaign.platform)}</td>
                  <td>{formatCurrency(campaign.spend)}</td>
                  <td>{formatCurrency(campaign.revenue)}</td>
                  <td className={`pd-pcbi-roas pd-pcbi-roas--${roasTone(campaign.roas)}`}>
                    {formatDecimal(campaign.roas)}
                  </td>
                  <td>{campaign.cpa} zł</td>
                  <td>{campaign.ncac} zł</td>
                  <td>{formatDecimal(campaign.ctr)}% / {formatDecimal(campaign.cpc)} zł</td>
                  <td className="pd-pcbi-table-accent">{formatCurrency(campaign.surplus)}</td>
                  <td>
                    <button className="pd-pcbi-drill-button" onClick={() => onOpenCampaign(campaign.id)} type="button">
                      Drill-down ➔
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pd-pcbi-table-footer">
          <span>Pokazano {filteredCampaigns.length} z 6 aktywnych kampanii w wybranym okresie</span>
          <span>Baza: fact_ads_daily • Currency: PLN</span>
        </div>
      </div>
    </ProductSectionFrame>
  );
}

export function PaidCampaignsCreativeIntelligence({
  onOpenAiContext = noop,
}: {
  readonly onOpenAiContext?: (contextKey: PaidCampaignsAiContextKey) => void;
}) {
  const section = paidCampaignsSectionsById.kreacje;

  return (
    <ProductSectionFrame
      actions={(
        <button className="pd-pcbi-warning-action" onClick={() => onOpenAiContext('creative_analysis')} type="button">
          <Icon decorative name="assistant" size={16} />
          <span>Rekomendacja Kreacji Papa</span>
        </button>
      )}
      description={(
        <>
          <span className="pd-pcbi-pill pd-pcbi-pill--amber-strong">ESTYMACJA MODELOWANA — ASSET INTEGRATION PARTIAL</span>
          <br />
          Wykrywanie Creative Fatigue (Wypalenia Kreacji) na podstawie nasycenia częstotliwością oraz dynamiki CTR/CPC.
        </>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-pcbi-card-grid pd-pcbi-card-grid--thirds">
        {paidCampaignsCreativeMetrics.map((metric) => (
          <article className="pd-pcbi-panel pd-pcbi-creative-metric" key={metric.label}>
            <div>
              <strong>{metric.label}</strong>
              <span className={`pd-pcbi-pill pd-pcbi-pill--${metric.tone}-soft`}>{metric.badge}</span>
            </div>
            <h3 className={`pd-pcbi-tone-text pd-pcbi-tone-text--${metric.tone}`}>{metric.value}</h3>
            <p>{metric.body}</p>
          </article>
        ))}
      </div>

      <div className="pd-pcbi-creative-grid">
        {paidCampaignsCreatives.map((creative) => (
          <article className={`pd-pcbi-creative-card pd-pcbi-creative-card--${creative.tone}`} key={creative.id}>
            <div className="pd-pcbi-creative-card__body">
              <div className="pd-pcbi-creative-card__head">
                <span className={`pd-pcbi-pill pd-pcbi-pill--${creative.tone}-soft`}>{creative.status}</span>
                <span>{creative.id}</span>
              </div>
              <div className="pd-pcbi-creative-preview">
                <span aria-hidden="true">{creative.previewIcon}</span>
                <span>{creative.preview}</span>
              </div>
              <div>
                <h3>{creative.name}</h3>
                <p>Format: {creative.format}</p>
              </div>
              <dl className="pd-pcbi-mini-metrics">
                {creative.stats.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}:</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="pd-pcbi-creative-card__footer">
              <button
                className="pd-pcbi-link-button"
                onClick={() => {
                  if (creative.id === 'ad_meta_882') onOpenAiContext('creative_fatigue_replace');
                }}
                type="button"
              >
                {creative.action}
              </button>
            </div>
          </article>
        ))}
      </div>
    </ProductSectionFrame>
  );
}

export function PaidCampaignsAttribution() {
  const section = paidCampaignsSectionsById.atrybucja;

  return (
    <ProductSectionFrame
      description={(
        <>
          <span className="pd-pcbi-pill pd-pcbi-pill--violet-strong">MODELOWANA ATRYBUCJA CROSS-CHANNEL</span>
          <br />
          Porównanie podziału zasług dla konwersji pomiędzy poszczególnymi modelami atrybucyjnymi oraz wykrywanie over-reportingu platform reklamowych.
        </>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <section className="pd-pcbi-two-column">
        <article className="pd-pcbi-panel" aria-labelledby="pd-pcbi-attribution-chart-title">
          <h3 id="pd-pcbi-attribution-chart-title">Przypisany Przychód wg Modelu (PLN)</h3>
          <div className="pd-pcbi-chart">
            <ResponsiveContainer height="100%" width="100%">
              <RechartsBarChart data={paidCampaignsAttributionData} margin={{ bottom: 8, left: 0, right: 18, top: 8 }}>
                <CartesianGrid stroke="rgb(var(--pd-pcbi-slate-200))" vertical={false} />
                <XAxis dataKey="model" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `${Number(value) / 1000}k zł`} width={58} />
                <Tooltip />
                <Legend />
                <Bar dataKey="google" fill={chartColors.blue} name="Google Ads Attributed Rev" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meta" fill={chartColors.indigo} name="Meta Ads Attributed Rev" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="pd-pcbi-panel" aria-labelledby="pd-pcbi-reality-gap-title">
          <div className="pd-pcbi-panel__head pd-pcbi-panel__head--compact">
            <div>
              <h3 id="pd-pcbi-reality-gap-title">Commerce Reality Gap (Deduplikacja Sprzedaży)</h3>
              <p>Dlaczego Meta i Google przypisują sobie te same transakcje?</p>
            </div>
          </div>
          <div className="pd-pcbi-reality-list">
            {paidCampaignsRealityGap.map((item) => (
              <article className={`pd-pcbi-reality-item pd-pcbi-reality-item--${item.tone}`} key={item.label}>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.body}</p>
                </div>
                <span>{item.value}</span>
              </article>
            ))}
          </div>
        </article>
      </section>
    </ProductSectionFrame>
  );
}

export function PaidCampaignsBudgetPacing() {
  const section = paidCampaignsSectionsById.budzet;

  return (
    <ProductSectionFrame
      actions={(
        <div className="pd-pcbi-budget-stat">
          <span>Plan Miesięczny Budżetu:</span>
          <strong>{formatCurrency(paidCampaignsBudgetPlan.monthlyBudget)}</strong>
        </div>
      )}
      description={`Miesiąc: ${paidCampaignsBudgetPlan.month} • Dzień ${paidCampaignsBudgetPlan.passedDays} z ${paidCampaignsBudgetPlan.totalDays} (${paidCampaignsBudgetPlan.pacing}% upływu czasu)`}
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-pcbi-pacing">
        <div>
          <span>Wydano: {formatCurrency(paidCampaignsBudgetPlan.currentSpend)} ({paidCampaignsBudgetPlan.pacing}%)</span>
          <span>Prognoza na koniec miesiąca (Forecast): {formatCurrency(paidCampaignsBudgetPlan.forecast)} (-5.1% underpacing)</span>
        </div>
        <div className="pd-pcbi-pacing__bar" aria-label="Pacing budżetu">
          <span className="pd-pcbi-pacing__spent" style={{ width: `${paidCampaignsBudgetPlan.pacing}%` }} />
          <span className="pd-pcbi-pacing__forecast" style={{ width: '30.3%' }} />
          <span className="pd-pcbi-pacing__reserve" style={{ width: `${paidCampaignsBudgetPlan.reservePercent}%` }} />
        </div>
      </div>
    </ProductSectionFrame>
  );
}

export function PaidCampaignsBudgetSimulator() {
  const [metaBudget, setMetaBudget] = useState<number>(paidCampaignsBudgetPlan.metaBudget);
  const [googleBudget, setGoogleBudget] = useState<number>(paidCampaignsBudgetPlan.googleBudget);
  const simulation = useMemo(() => calculateSimulation(metaBudget, googleBudget), [googleBudget, metaBudget]);
  const simulatorChartData = useMemo(() => [
    {
      currentPlan: 325800,
      label: 'Przychód (PLN)',
      scenario: simulation.revenue,
    },
    {
      currentPlan: 421000,
      label: 'ROAS (x10k PLN)',
      scenario: Math.round(simulation.roas * 100000),
    },
  ], [simulation.revenue, simulation.roas]);
  const section = paidCampaignsSectionsById.symulator;

  function reset() {
    setMetaBudget(paidCampaignsBudgetPlan.metaBudget);
    setGoogleBudget(paidCampaignsBudgetPlan.googleBudget);
  }

  return (
    <ProductSectionFrame
      actions={<button className="pd-pcbi-dark-button" onClick={reset} type="button">Resetuj do obecnego planu</button>}
      description={(
        <>
          <span className="pd-pcbi-pill pd-pcbi-pill--indigo-strong">PAPA WHAT-IF SIMULATOR</span>
          {' '}
          <span className="pd-pcbi-pill pd-pcbi-pill--amber-strong">[SYMULACJA MODELOWANA — NIE JEST GWARANCJĄ WYNIKU]</span>
          <br />
          Przesuwaj budżet pomiędzy kanałami, aby zobaczyć symulowany wpływ na całkowity przychód i ROAS.
        </>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
        <div className="pd-pcbi-simulator__grid">
          <div className="pd-pcbi-simulator__controls">
            <BudgetRange
              color="indigo"
              label="🔷 Meta Ads Budżet"
              max={60000}
              min={20000}
              onChange={setMetaBudget}
              value={metaBudget}
            />
            <BudgetRange
              color="emerald"
              label="🔵 Google Ads Budżet"
              max={60000}
              min={20000}
              onChange={setGoogleBudget}
              value={googleBudget}
            />
            <dl className="pd-pcbi-simulator__summary">
              <div>
                <dt>Łączny Budżet Symulacji:</dt>
                <dd>{formatCurrency(simulation.totalBudget)}</dd>
              </div>
              <div>
                <dt>Zmiana vs Obecny:</dt>
                <dd>{formatSignedCurrency(simulation.budgetDelta)}</dd>
              </div>
            </dl>
          </div>

          <div className="pd-pcbi-simulator__results">
            <div className="pd-pcbi-simulator-metrics">
              <article>
                <span>Prognozowany Przychód</span>
                <strong>{formatCurrency(simulation.revenue)}</strong>
                <small>{formatSignedCurrency(simulation.revenueDelta)}</small>
              </article>
              <article>
                <span>Prognozowany ROAS</span>
                <strong>{formatDecimal(simulation.roas)}</strong>
                <small>{formatSignedNumber(simulation.roasDelta)} vs base</small>
              </article>
              <article>
                <span>Prognozowany nCAC</span>
                <strong>{simulation.ncac} zł</strong>
                <small>Model proxy order conversion</small>
              </article>
            </div>
            <div className="pd-pcbi-chart pd-pcbi-chart--short">
              <ResponsiveContainer height="100%" width="100%">
                <RechartsBarChart data={simulatorChartData} margin={{ bottom: 8, left: 0, right: 18, top: 8 }}>
                  <CartesianGrid stroke="rgb(var(--pd-pcbi-slate-700))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: chartColors.slate, fontSize: 11 }} />
                  <YAxis tick={{ fill: chartColors.slate, fontSize: 11 }} width={62} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="currentPlan" fill={chartColors.slate} name="Obecny Plan" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="scenario" fill={chartColors.emerald} name="Symulowany Scenariusz" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
    </ProductSectionFrame>
  );
}

function PerformerList({
  group,
  title,
}: {
  readonly group: 'bottom' | 'top';
  readonly title: string;
}) {
  return (
    <div className="pd-pcbi-performer-group">
      <span>{title}</span>
      {paidCampaignsPerformers.filter((performer) => performer.group === group).map((performer) => (
        <article className={`pd-pcbi-performer pd-pcbi-performer--${performer.tone}`} key={performer.name}>
          <div>
            <strong>{performer.name}</strong>
            <p>
              Spend: {performer.spend} | Przychód: {performer.revenue}
              {'reason' in performer && performer.reason ? ` (${performer.reason})` : ''}
            </p>
          </div>
          <div>
            <strong>ROAS {performer.roas}</strong>
            <DecisionBadge decision={performer.decision as PaidCampaignsDecision} />
          </div>
        </article>
      ))}
    </div>
  );
}

function BudgetRange({
  color,
  label,
  max,
  min,
  onChange,
  value,
}: {
  readonly color: 'emerald' | 'indigo';
  readonly label: string;
  readonly max: number;
  readonly min: number;
  readonly onChange: (value: number) => void;
  readonly value: number;
}) {
  return (
    <label className="pd-pcbi-budget-range">
      <span>
        <strong>{label}</strong>
        <b className={`pd-pcbi-tone-text pd-pcbi-tone-text--${color}`}>{formatCurrency(value)}</b>
      </span>
      <input
        aria-label={label}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={1000}
        type="range"
        value={value}
      />
      <small>
        <span>20k zł</span>
        <span>Obecnie: {color === 'indigo' ? '41.2k' : '36.2k'}</span>
        <span>60k zł</span>
      </small>
    </label>
  );
}

function ProvenanceModal({
  metricKey,
  onClose,
}: {
  readonly metricKey: PaidCampaignsProvenanceKey | null;
  readonly onClose: () => void;
}) {
  if (!metricKey) return null;
  const provenance = paidCampaignsProvenanceDict[metricKey];

  return (
    <div className="pd-pcbi-modal-backdrop">
      <section aria-label="Data Lineage" aria-modal="true" className="pd-pcbi-modal" role="dialog">
        <header className="pd-pcbi-modal__head">
          <div>
            <DataQualityBadge badge={provenance.badge} />
            <h2>{provenance.name}</h2>
          </div>
          <button aria-label="Zamknij provenance" onClick={onClose} type="button">✕</button>
        </header>
        <div className="pd-pcbi-modal__body">
          <section>
            <strong>Definicja i Wzór Matematyczny:</strong>
            <code>{provenance.formula}</code>
          </section>
          <section>
            <strong>Źródła Danych (Data Lineage):</strong>
            <ul>
              {provenance.sources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </section>
          <div className="pd-pcbi-modal__facts">
            <div>
              <span>Świeżość Danych:</span>
              <strong>{provenance.freshness}</strong>
            </div>
            <div>
              <span>Model Atrybucji:</span>
              <strong>{provenance.model}</strong>
            </div>
          </div>
          <section>
            <strong>Ograniczenia i Luki w Danych:</strong>
            <p>{provenance.limitations}</p>
          </section>
        </div>
        <footer>
          <button className="pd-pcbi-dark-button" onClick={onClose} type="button">Zamknij</button>
        </footer>
      </section>
    </div>
  );
}

function CampaignDrawer({
  campaign,
  onClose,
  onOpenAiContext,
}: {
  readonly campaign: PaidCampaign | null;
  readonly onClose: () => void;
  readonly onOpenAiContext: (contextKey: PaidCampaignsAiContextKey) => void;
}) {
  if (!campaign) return null;

  return (
    <div className="pd-pcbi-drawer-backdrop">
      <aside aria-label="Campaign drill-down" aria-modal="true" className="pd-pcbi-drawer" role="dialog">
        <header className="pd-pcbi-drawer__head">
          <div>
            <div className="pd-pcbi-inline-pills">
              <span className="pd-pcbi-pill pd-pcbi-pill--indigo-strong">{campaign.platform === 'google_ads' ? 'Google Ads' : 'Meta Ads'}</span>
              <DecisionBadge decision={campaign.decision} />
            </div>
            <h2>{campaign.name}</h2>
            <p>ID: {campaign.id}</p>
          </div>
          <button aria-label="Zamknij szczegóły kampanii" onClick={onClose} type="button">✕</button>
        </header>
        <div className="pd-pcbi-drawer__body">
          <dl className="pd-pcbi-drawer-metrics">
            <div>
              <dt>Wydatki</dt>
              <dd>{formatCurrency(campaign.spend)}</dd>
            </div>
            <div>
              <dt>Przychód</dt>
              <dd>{formatCurrency(campaign.revenue)}</dd>
            </div>
            <div>
              <dt>ROAS</dt>
              <dd>{formatDecimal(campaign.roas)}</dd>
            </div>
            <div>
              <dt>CPA</dt>
              <dd>{campaign.cpa} zł</dd>
            </div>
          </dl>
          <section>
            <h3>Dlaczego wynik tej kampanii się zmienił? (Divergence Analysis)</h3>
            <ul className="pd-pcbi-evidence-list">
              {paidCampaignsDrawerDivergence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>Grupy Reklam w Kampanii (Ad Sets / Ad Groups)</h3>
            <div className="pd-pcbi-adgroup-list">
              {paidCampaignsDrawerAdGroups.map((group) => (
                <article key={group.label}>
                  <div>
                    <strong>{group.label}</strong>
                    <p>Spend: {group.spend} | ROAS: {group.roas}</p>
                  </div>
                  <span>{group.status}</span>
                </article>
              ))}
            </div>
          </section>
          <section className="pd-pcbi-ai-diagnosis">
            <span>PAPA AI DIAGNOZA KAMPANII</span>
            <p>Kampania wykazuje wyjątkowo wysoką efektywność. Zalecane podniesienie budżetu o 15% bez ryzyka natychmiastowego nasycenia grupy.</p>
          </section>
        </div>
        <footer className="pd-pcbi-drawer__footer">
          <button onClick={onClose} type="button">Zamknij</button>
          <button onClick={() => onOpenAiContext('skaluj_google')} type="button">
            <Icon decorative name="assistant" size={16} />
            <span>Zapytaj Papa Asystenta o tę kampanię</span>
          </button>
        </footer>
      </aside>
    </div>
  );
}

function AiAssistantDrawer({
  isOpen,
  messages,
  onClose,
  onPromptSubmit,
  onSelectContext,
}: {
  readonly isOpen: boolean;
  readonly messages: readonly AiMessage[];
  readonly onClose: () => void;
  readonly onPromptSubmit: (prompt: string) => void;
  readonly onSelectContext: (contextKey: PaidCampaignsAiContextKey) => void;
}) {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim()) return;
    onPromptSubmit(prompt.trim());
    setPrompt('');
  }

  return (
    <div className="pd-pcbi-drawer-backdrop">
      <aside aria-label="Papa Asystent Decyzyjny" aria-modal="true" className="pd-pcbi-ai-drawer" role="dialog">
        <header className="pd-pcbi-ai-drawer__head">
          <div>
            <span aria-hidden="true">
              <Icon decorative name="assistant" size={16} />
            </span>
            <div>
              <h2>Papa Asystent Decyzyjny</h2>
              <p>Kontekst: Paid Campaigns BI</p>
            </div>
          </div>
          <button aria-label="Zamknij Papa AI" onClick={onClose} type="button">✕</button>
        </header>

        <div className="pd-pcbi-ai-drawer__body">
          <article className="pd-pcbi-ai-welcome">
            <p><strong>Cześć! Jestem Twoim Asystentem Decision Intelligence PapaData.</strong></p>
            <p>Przenalizowałem aktualne fakty reklamowe z Meta Ads i Google Ads. O czym chcesz porozmawiać?</p>
            <div>
              <button onClick={() => onSelectContext('skaluj_google')} type="button">💡 Dlaczego skalować Google?</button>
              <button onClick={() => onSelectContext('creative_analysis')} type="button">🖼️ Co zrobić z kreacjami Meta?</button>
            </div>
          </article>

          {messages.map((message) => {
            if (message.type === 'user') {
              return (
                <article className="pd-pcbi-user-message" key={message.id}>
                  {message.prompt}
                </article>
              );
            }

            return (
              <AiResponseCard contextKey={message.contextKey} key={message.id} />
            );
          })}
        </div>

        <form className="pd-pcbi-ai-drawer__form" onSubmit={handleSubmit}>
          <input
            aria-label="Zadaj pytanie Papa"
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Zadaj pytanie Papa (np. Gdzie tracimy budżet?)..."
            type="text"
            value={prompt}
          />
          <button type="submit">Wyślij</button>
        </form>
      </aside>
    </div>
  );
}

function AiResponseCard({
  contextKey,
}: {
  readonly contextKey: PaidCampaignsAiContextKey;
}) {
  const response = paidCampaignsAiResponses[contextKey];
  return (
    <article className={`pd-pcbi-ai-response pd-pcbi-ai-response--${response.tone}`}>
      {response.sections.map((section) => (
        <section key={section.label}>
          <span className={`pd-pcbi-pill pd-pcbi-pill--${section.tone ?? response.tone}-strong`}>{section.label}</span>
          {section.body.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>
      ))}
    </article>
  );
}

function ExportReportModal({
  isOpen,
  onClose,
  onExport,
}: {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onExport: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="pd-pcbi-modal-backdrop">
      <section aria-label="Eksport Raportu Kampanii Płatnych" aria-modal="true" className="pd-pcbi-modal pd-pcbi-modal--narrow" role="dialog">
        <header className="pd-pcbi-modal__head">
          <h2>Eksport Raportu Kampanii Płatnych</h2>
          <button aria-label="Zamknij eksport" onClick={onClose} type="button">✕</button>
        </header>
        <div className="pd-pcbi-export-options">
          <span>Format pliku:</span>
          <label>
            <input defaultChecked name="exportFormat" type="radio" value="csv" />
            <strong>Plik CSV (Dane surowe)</strong>
          </label>
          <label>
            <input name="exportFormat" type="radio" value="pdf" />
            <strong>PDF Executive Report</strong>
          </label>
        </div>
        <div className="pd-pcbi-export-meta">
          <strong>Zawarte Metadane:</strong>
          <span>• Zakres: Ostatnie 30 dni</span>
          <span>• Model Atrybucji: Last Click</span>
          <span>• Timestamp: 2026-08-27 22:04</span>
          <span>• Badges Jakości Danych (Pomiar / Estymacja)</span>
        </div>
        <footer>
          <button onClick={onClose} type="button">Anuluj</button>
          <button className="pd-pcbi-dark-button" onClick={onExport} type="button">Generuj i pobierz</button>
        </footer>
      </section>
    </div>
  );
}

function DataQualityBadge({
  badge,
}: {
  readonly badge: PaidCampaignsMetricBadge;
}) {
  return (
    <span className={`pd-pcbi-data-badge pd-pcbi-data-badge--${badgeTone(badge)}`}>
      {badge}
    </span>
  );
}

function DecisionBadge({
  decision,
}: {
  readonly decision: PaidCampaignsDecision;
}) {
  return (
    <span className={`pd-pcbi-decision-badge pd-pcbi-decision-badge--${decisionTone(decision)}`}>
      {decision}
    </span>
  );
}

function buildTrendChartData(mode: PaidCampaignsTrendMode) {
  const series = paidCampaignsTrendSeries[mode];
  return paidCampaignsTrendLabels.map((label, index) => {
    const item: Record<string, number | string> = { label };
    series.forEach((entry) => {
      item[entry.key] = entry.values[index] ?? 0;
    });
    return item;
  });
}

function calculateSimulation(metaBudget: number, googleBudget: number) {
  const totalBudget = metaBudget + googleBudget;
  const budgetDelta = totalBudget - paidCampaignsBudgetPlan.currentSpend;
  const projectedMetaRevenue = metaBudget * 3.15;
  const projectedGoogleRevenue = googleBudget * 5.20;
  const revenue = Math.round(projectedMetaRevenue + projectedGoogleRevenue);
  const roas = revenue / totalBudget;
  const ncac = Math.round(totalBudget / (revenue / 3400));

  return {
    budgetDelta,
    ncac,
    revenue,
    revenueDelta: revenue - 325800,
    roas,
    roasDelta: roas - 4.21,
    totalBudget,
  };
}

function platformLabel(platform: PaidCampaign['platform']) {
  return platform === 'google_ads' ? '🔵 Google' : '🔷 Meta';
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('pl-PL')} zł`;
}

function formatSignedCurrency(value: number) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toLocaleString('pl-PL')} zł`;
}

function formatDecimal(value: number) {
  return value.toFixed(2).replace('.', ',');
}

function formatSignedNumber(value: number) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatDecimal(value)}`;
}

function badgeTone(badge: PaidCampaignsMetricBadge): PaidCampaignsTone {
  if (badge === '[POMIAR]') return 'emerald';
  if (badge === '[ESTYMACJA]') return 'amber';
  if (badge === '[WYLICZONE]') return 'violet';
  return 'slate';
}

function decisionTone(decision: PaidCampaignsDecision): PaidCampaignsTone {
  if (decision === 'SKALUJ') return 'emerald';
  if (decision === 'UTRZYMAJ') return 'blue';
  if (decision === 'MONITORUJ') return 'amber';
  return 'rose';
}

function roasTone(roas: number): PaidCampaignsTone {
  if (roas >= 3.8) return 'emerald';
  if (roas < 3.1) return 'rose';
  return 'slate';
}
