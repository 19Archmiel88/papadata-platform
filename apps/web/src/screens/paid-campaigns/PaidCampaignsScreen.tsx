import { useAssistantAnalysisContext } from '../../runtime/shell/papa-assistant/useAssistantAnalysisContext';
import { commandCenterDemoRange } from '../../fixtures/command-center/commandCenterDemoSeed';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import {
  CampaignAnalysisHeader,
  CampaignPerformance,
  CampaignTable,
  CampaignEvidence,
  CampaignBudgetComparison,
  campaignTabs,
} from './CampaignAnalysis';
import type { CampaignTab, CampaignDetail } from './CampaignAnalysis';
import { campaignDemoDays, deriveCampaignAnalysis } from './CampaignAnalysis.data';
import type { CampaignChannel, CampaignDay } from './CampaignAnalysis.data';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button, Icon, ProductSectionFrame } from '../../design-system';
import {
  paidCampaignsAlerts,
  paidCampaignsAttributionData,
  paidCampaignsBudgetPlan,
  paidCampaignsCreativeMetrics,
  paidCampaignsCreatives,
  paidCampaignsPerformers,
  paidCampaignsPlatformCards,
  paidCampaignsPlatformComparison,
  paidCampaignsRealityGap,
  paidCampaignsSectionsById,
} from '../../fixtures/paid-campaigns/paidCampaignsDemoSeed';
import type {
  PaidCampaignsAiContextKey,
  PaidCampaignsDecision,
  PaidCampaignsMetricBadge,
  PaidCampaignsSectionId,
  PaidCampaignsTone,
} from '../../fixtures/paid-campaigns/paidCampaignsDemoSeed';
import './PaidCampaignsScreen.css';

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

export type PaidCampaignsScreenProps = {
  readonly initialSection?: PaidCampaignsSectionId;
  readonly section?: 'performance' | 'table';
  readonly observations?: readonly CampaignDay[] | null;
  readonly state?: 'ready' | 'loading' | 'error';
  readonly onRetry?: () => void;
};

export function PaidCampaignsScreen({
  initialSection = 'wynik',
  section,
  observations = campaignDemoDays,
  state = 'ready',
  onRetry,
}: PaidCampaignsScreenProps) {
  const { dateRange } = useShellDateRange();
  const [tab, setTab] = useState<CampaignTab>(() => {
    const requested =
      new URLSearchParams(window.location.search).get('campaignView') ?? initialSection;
    return campaignTabs.find((item) => item.id === requested)?.id ?? 'wynik';
  });
  const [channel, setChannel] = useState<CampaignChannel>(() => {
    const value = new URLSearchParams(window.location.search).get('channel');
    return value === 'google_ads' || value === 'meta_ads' ? value : 'all';
  });
  const [comparison, setComparison] = useState<'previous_period' | 'previous_year'>(() =>
    new URLSearchParams(window.location.search).get('compare') === 'previous_year'
      ? 'previous_year'
      : 'previous_period',
  );
  const [detail, setDetail] = useState<CampaignDetail>(null);
  const analysis = useMemo(
    () => deriveCampaignAnalysis(dateRange, channel, comparison, observations ?? []),
    [dateRange, channel, comparison, observations],
  );
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('campaignView', tab);
    url.searchParams.set('channel', channel);
    url.searchParams.set('compare', comparison);
    window.history.replaceState(window.history.state, '', url);
  }, [tab, channel, comparison]);
  useAssistantAnalysisContext({ title: 'Kampanie płatne', route: '/app/campaigns', readiness: state === 'ready' ? (analysis.complete ? 'ready' : 'partial') : state,
    source: observations === campaignDemoDays ? 'Dane demonstracyjne kampanii' : 'Dane kampanii workspace’u',
    metrics: state === 'ready' && analysis.rows.length ? { 'Wydatki (PLN)': analysis.current.spend, 'Przychód (PLN)': analysis.current.revenue, ROAS: analysis.current.roas } : {},
    filters: { Kanał: channel, Porównanie: comparison, Widok: tab }, tables: ['Kampanie'], charts: ['Trend kampanii'] });
  const askPapa = () =>
    window.dispatchEvent(
      new CustomEvent('papadata:papa-assistant', {
        detail: { action: 'analyze-screen', mode: 'screen' },
      }),
    );
  const analytical = tab === 'wynik' || tab === 'kampanie' || Boolean(section);
  const showData = analysis.valid && analysis.rows.length > 0;
  return (
    <div className="pd-campaign-analysis" data-testid="paid-campaigns-bi-page">
      {!section && (
        <CampaignAnalysisHeader
          tab={tab}
          onTab={setTab}
          channel={channel}
          onChannel={setChannel}
          comparison={comparison}
          onComparison={setComparison}
        />
      )}
      {state === 'loading' ? (
        <section className="pd-campaign-analysis__empty" aria-busy="true"><p role="status">Wczytywanie analizy kampanii…</p></section>
      ) : state === 'error' || observations === null ? (
        <section className="pd-campaign-analysis__empty"><h2>Nie udało się wczytać kampanii</h2><p>Zakres i filtry zostały zachowane.</p>{onRetry && <Button onClick={onRetry}>Spróbuj ponownie</Button>}</section>
      ) : analytical ? (
        !analysis.valid ? (
          <p className="pd-campaign-analysis__empty" role="alert">
            Wybierz poprawny okres obejmujący od 1 do 366 dni.
          </p>
        ) : !showData ? (
          <section className="pd-campaign-analysis__empty">
            <h2>Brak danych kampanii w tym okresie</h2>
            <p>Zmień zakres lub kanał reklamowy, aby sprawdzić dostępne obserwacje.</p>
          </section>
        ) : (
          <>
            {(section === 'performance' || (!section && tab === 'wynik')) && (
              <CampaignPerformance analysis={analysis} onDetail={setDetail} />
            )}
            {section !== 'performance' && (
              <CampaignTable analysis={analysis} onDetail={setDetail} />
            )}
            {!section && tab === 'wynik' && (
              <details className="pd-campaign-analysis__additional">
                <summary>Platformy i sygnały historyczne · sierpień 2026</summary>
                <div className="pd-pcbi">
                  <PaidCampaignsPlatformsSection onTabChange={() => setTab('kampanie')} />
                  <PaidCampaignsRisksSection
                    onTabChange={() => setTab('kampanie')}
                    onOpenAiContext={askPapa}
                  />
                </div>
              </details>
            )}
          </>
        )
      ) : (
        <div className="pd-pcbi pd-campaign-analysis__details">
          {tab === 'atrybucja' && <PaidCampaignsAttribution />}
          {tab === 'kreacje' && <PaidCampaignsCreativeIntelligence onOpenAiContext={askPapa} />}
          {tab === 'budzet' && (
            <>
              <PaidCampaignsBudgetPacing />
              <PaidCampaignsBudgetSimulator />
            </>
          )}
        </div>
      )}
      <CampaignEvidence
        key={
          detail?.type === 'campaign'
            ? detail.id
            : detail?.type === 'metric'
              ? detail.metric
              : 'closed'
        }
        detail={detail}
        analysis={analysis}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}

export function PaidCampaignsResultSection() {
  return <PaidCampaignsScreen section="performance" />;
}
export function PaidCampaignsCampaignTable() {
  return <PaidCampaignsScreen section="table" />;
}

function PaidCampaignsSectionFrame({
  accentClassName,
  actions = null,
  children,
  collapsedSummary,
  description,
  expanded = true,
  onExpandedChange = noop,
  section,
}: {
  readonly accentClassName?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly collapsedSummary: string;
  readonly description?: ReactNode;
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly section: (typeof paidCampaignsSectionsById)[PaidCampaignsSectionId];
}) {
  const bodyId = `pd-pcbi-${section.id}-content`;

  return (
    <ProductSectionFrame
      accentClassName={accentClassName}
      actions={
        <>
          {expanded ? actions : null}
          {onExpandedChange !== noop && (          <button
            aria-controls={bodyId}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Zwiń' : 'Rozwiń'} sekcję ${section.title}`}
            className="pd-pcbi-section-toggle"
            onClick={() => onExpandedChange(!expanded)}
            type="button"
          >
            <span className="pd-pcbi-section-toggle__label">{expanded ? 'Zwiń' : 'Rozwiń'}</span>
            <span aria-hidden="true" className="pd-pcbi-section-toggle__icon">
              <svg height="14" viewBox="0 0 24 24" width="14">
                <path
                  d="m6 9 6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </span>
          </button>)}
        </>
      }
      className="pd-pcbi-section-frame"
      data-collapsed={expanded ? undefined : 'true'}
      description={
        expanded ? (
          description ? (
            <span>{description}</span>
          ) : null
        ) : (
          <span className="pd-pcbi-section-summary">{collapsedSummary}</span>
        )
      }
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      {expanded ? (
        <div className="pd-pcbi-section-content" id={bodyId}>
          {children}
        </div>
      ) : null}
    </ProductSectionFrame>
  );
}

export function PaidCampaignsPlatformsSection({
  expanded = true,
  onExpandedChange = noop,
  onTabChange = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onTabChange?: (tab: PaidCampaignsSectionId) => void;
}) {
  const section = paidCampaignsSectionsById.platformy;

  return (
    <PaidCampaignsSectionFrame
      collapsedSummary={`${paidCampaignsPlatformCards.length} platformy aktywne · ${paidCampaignsPerformers.filter((performer) => performer.group === 'bottom').length} kampanie wymagają reakcji`}
      description="Relacja udziału w wydatkach do udziału w generowanym przychodzie wg platformy oraz kampanie o największej dodatniej i ujemnej dźwigni finansowej."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
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
              <RechartsBarChart
                data={paidCampaignsPlatformComparison}
                margin={{ bottom: 8, left: 0, right: 18, top: 8 }}
              >
                <CartesianGrid stroke="rgb(var(--pd-pcbi-slate-200))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `${value}%`}
                  width={42}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="budgetShare"
                  fill={chartColors.indigo}
                  name="Udział w Budżecie (%)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="revenueShare"
                  fill={chartColors.emerald}
                  name="Udział w Przychodzie (%)"
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          <div className="pd-pcbi-platform-cards">
            {paidCampaignsPlatformCards.map((platform) => (
              <article className="pd-pcbi-platform-card" key={platform.label}>
                <div>
                  <strong>
                    {platform.label}
                  </strong>
                  <DecisionBadge decision={platform.decision as PaidCampaignsDecision} />
                </div>
                <p>
                  Spend: {platform.spend} <span>({platform.share})</span>
                </p>
                <p>Przychód: {platform.revenue}</p>
                <p>
                  ROAS: {platform.roas} | nCAC: {platform.ncac}
                </p>
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
            <button
              className="pd-pcbi-link-button"
              onClick={() => onTabChange('kampanie')}
              type="button"
            >
              Wszystkie kampanie ➔
            </button>
          </div>

          <PerformerList group="top" title="Najwyższa efektywność" />
          <PerformerList group="bottom" title="Do sprawdzenia" />
        </section>
      </section>
    </PaidCampaignsSectionFrame>
  );
}

export function PaidCampaignsRisksSection({
  expanded = true,
  onExpandedChange = noop,
  onOpenAiContext = noop,
  onTabChange = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onOpenAiContext?: (contextKey: PaidCampaignsAiContextKey) => void;
  readonly onTabChange?: (tab: PaidCampaignsSectionId) => void;
}) {
  const section = paidCampaignsSectionsById.ryzyka;

  return (
    <PaidCampaignsSectionFrame
      actions={<span className="pd-pcbi-pill pd-pcbi-pill--rose-soft">3 Zdarzenia</span>}
      collapsedSummary={`${paidCampaignsAlerts.length} zdarzenia wymagające uwagi`}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
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
    </PaidCampaignsSectionFrame>
  );
}

export function PaidCampaignsCreativeIntelligence({
  expanded = true,
  onExpandedChange = noop,
  onOpenAiContext = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onOpenAiContext?: (contextKey: PaidCampaignsAiContextKey) => void;
}) {
  const section = paidCampaignsSectionsById.kreacje;

  return (
    <PaidCampaignsSectionFrame
      actions={
        <button
          className="pd-pcbi-warning-action"
          onClick={() => onOpenAiContext('creative_analysis')}
          type="button"
        >
          <Icon decorative name="assistant" size={16} />
          <span>Rekomendacja Kreacji Papa</span>
        </button>
      }
      collapsedSummary={`${paidCampaignsCreatives.length} kreacji monitorowanych · wykrywanie wypalenia (fatigue)`}
      description={
        <>
          <span className="pd-pcbi-pill pd-pcbi-pill--amber-strong">
            ESTYMACJA MODELOWANA — ASSET INTEGRATION PARTIAL
          </span>
          <br />
          Wykrywanie Creative Fatigue (Wypalenia Kreacji) na podstawie nasycenia częstotliwością
          oraz dynamiki CTR/CPC.
        </>
      }
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <div className="pd-pcbi-card-grid pd-pcbi-card-grid--thirds">
        {paidCampaignsCreativeMetrics.map((metric) => (
          <article className="pd-pcbi-panel pd-pcbi-creative-metric" key={metric.label}>
            <div>
              <strong>{metric.label}</strong>
              <span className={`pd-pcbi-pill pd-pcbi-pill--${metric.tone}-soft`}>
                {metric.badge}
              </span>
            </div>
            <h3 className={`pd-pcbi-tone-text pd-pcbi-tone-text--${metric.tone}`}>
              {metric.value}
            </h3>
            <p>{metric.body}</p>
          </article>
        ))}
      </div>

      <div className="pd-pcbi-creative-grid">
        {paidCampaignsCreatives.map((creative) => (
          <article
            className={`pd-pcbi-creative-card pd-pcbi-creative-card--${creative.tone}`}
            key={creative.id}
          >
            <div className="pd-pcbi-creative-card__body">
              <div className="pd-pcbi-creative-card__head">
                <span className={`pd-pcbi-pill pd-pcbi-pill--${creative.tone}-soft`}>
                  {creative.status}
                </span>
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
    </PaidCampaignsSectionFrame>
  );
}

export function PaidCampaignsAttribution({
  expanded = true,
  onExpandedChange = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
}) {
  const section = paidCampaignsSectionsById.atrybucja;

  return (
    <PaidCampaignsSectionFrame
      collapsedSummary="Porównanie modeli atrybucji · wykrywanie over-reportingu Meta/Google"
      description="Porównanie podziału zasług dla konwersji pomiędzy poszczególnymi modelami atrybucyjnymi oraz wykrywanie over-reportingu platform reklamowych."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <section className="pd-pcbi-two-column">
        <article className="pd-pcbi-panel" aria-labelledby="pd-pcbi-attribution-chart-title">
          <h3 id="pd-pcbi-attribution-chart-title">Przypisany Przychód wg Modelu (PLN)</h3>
          <div className="pd-pcbi-chart">
            <ResponsiveContainer height="100%" width="100%">
              <RechartsBarChart
                data={paidCampaignsAttributionData}
                margin={{ bottom: 8, left: 0, right: 18, top: 8 }}
              >
                <CartesianGrid stroke="rgb(var(--pd-pcbi-slate-200))" vertical={false} />
                <XAxis dataKey="model" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `${Number(value) / 1000}k zł`}
                  width={58}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="google"
                  fill={chartColors.blue}
                  name="Google Ads Attributed Rev"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="meta"
                  fill={chartColors.indigo}
                  name="Meta Ads Attributed Rev"
                  radius={[4, 4, 0, 0]}
                />
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
              <article
                className={`pd-pcbi-reality-item pd-pcbi-reality-item--${item.tone}`}
                key={item.label}
              >
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
    </PaidCampaignsSectionFrame>
  );
}

export function PaidCampaignsBudgetPacing({
  expanded = true,
  onExpandedChange = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
}) {
  const spent = deriveCampaignAnalysis(commandCenterDemoRange).current.spend;
  const percent = (spent / paidCampaignsBudgetPlan.monthlyBudget) * 100;
  return (
    <PaidCampaignsSectionFrame
      section={paidCampaignsSectionsById.budzet}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      collapsedSummary={`Wydano ${formatCurrency(spent)}`}
      description="Zamknięty okres: 1–31 sierpnia 2026. Plan jest wartością przykładową."
    >
      <div className="pd-campaign-analysis__evidence">
        <dl>
          <div>
            <dt>Plan miesięczny</dt>
            <dd>{formatCurrency(paidCampaignsBudgetPlan.monthlyBudget)}</dd>
          </div>
          <div>
            <dt>Wydano</dt>
            <dd>{formatCurrency(spent)}</dd>
          </div>
          <div>
            <dt>Wykorzystanie planu</dt>
            <dd>{percent.toFixed(1).replace('.', ',')}%</dd>
          </div>
          <div>
            <dt>Pozostało w planie</dt>
            <dd>{formatCurrency(paidCampaignsBudgetPlan.monthlyBudget - spent)}</dd>
          </div>
        </dl>
        <p>Miesiąc jest zakończony — pokazujemy wynik, bez prognozy pozostałych dni.</p>
      </div>
    </PaidCampaignsSectionFrame>
  );
}
export function PaidCampaignsBudgetSimulator({
  expanded = true,
  onExpandedChange = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
}) {
  return (
    <PaidCampaignsSectionFrame
      section={paidCampaignsSectionsById.symulator}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      collapsedSummary="Porównanie wariantów kosztu"
      description="Wariant wydatków dla okresu 31 dni."
    >
      <div className="pd-campaign-analysis__evidence">
        <CampaignBudgetComparison
          spend={deriveCampaignAnalysis(commandCenterDemoRange).current.spend}
          days={31}
        />
      </div>
    </PaidCampaignsSectionFrame>
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
      {paidCampaignsPerformers
        .filter((performer) => performer.group === group)
        .map((performer) => (
          <article
            className={`pd-pcbi-performer pd-pcbi-performer--${performer.tone}`}
            key={performer.name}
          >
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

function DataQualityBadge({ badge }: { readonly badge: PaidCampaignsMetricBadge }) {
  return (
    <span className={`pd-pcbi-data-badge pd-pcbi-data-badge--${badgeTone(badge)}`}>{badge}</span>
  );
}

function DecisionBadge({ decision }: { readonly decision: PaidCampaignsDecision }) {
  return (
    <span className={`pd-pcbi-decision-badge pd-pcbi-decision-badge--${decisionTone(decision)}`}>
      {decision}
    </span>
  );
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('pl-PL')} zł`;
}

function formatDecimal(value: number) {
  return value.toFixed(2).replace('.', ',');
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
