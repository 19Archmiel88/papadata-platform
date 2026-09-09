import { useId, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Button,
  DateRangePicker,
  Drawer,
  ExplorerTable,
  MetricCard,
  Popover,
} from '../../design-system';
import type { ExplorerTableColumn } from '../../design-system';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import {
  overviewChange,
  overviewDayCount,
  overviewMoney,
  overviewNumber,
  overviewRangeLabel,
  overviewShortDate,
} from '../command-center/CommandCenterScreen.data';
import { campaignBudgetScenario } from './CampaignAnalysis.data';
import type { CampaignAnalysis, CampaignChannel, CampaignResult } from './CampaignAnalysis.data';
import './CampaignAnalysis.css';

export const campaignMetricLabels = {
  spend: 'Wydatki reklamowe',
  revenue: 'Przychód przypisany',
  roas: 'ROAS',
  ncac: 'Koszt nowego klienta',
} as const;
export type CampaignMetric = keyof typeof campaignMetricLabels;
export type CampaignDetail =
  | { readonly type: 'metric'; readonly metric: CampaignMetric }
  | { readonly type: 'campaign'; readonly id: string }
  | null;
const metricDefinitions: Record<CampaignMetric, string> = {
  spend:
    'Suma kosztów reklamowych Google Ads i Meta Ads w wybranym okresie. Zmiana samego kosztu nie jest oceną rentowności.',
  revenue:
    'Przychód netto przypisany do ostatniego płatnego kliknięcia przed zakupem (last click). Jest wynikiem modelu atrybucji i nie odpowiada całej sprzedaży sklepu.',
  roas: 'Przychód przypisany podzielony przez wydatki reklamowe. Cel 3,10× jest założeniem analizy; bez pełnego kosztu produktów i realizacji nie określa progu rentowności.',
  ncac: 'Wydatki reklamowe podzielone przez liczbę nowych klientów przypisanych kampaniom. Wynik łączny jest liczony z sum, a nie jako średnia kosztów kampanii. W przykładzie cel wynosi maksymalnie 100 zł.',
};
const numeric = (n: number | null, decimal = 0) => (n === null ? '—' : overviewNumber(n, decimal));
const money = (n: number | null) => (n === null ? '—' : overviewMoney(n));
const channelLabel = (channel: CampaignResult['channel']) =>
  channel === 'google_ads' ? 'Google Ads' : 'Meta Ads';
export const campaignTabs = [
  { id: 'wynik', label: 'Efektywność' },
  { id: 'kampanie', label: 'Kampanie' },
  { id: 'atrybucja', label: 'Atrybucja' },
  { id: 'kreacje', label: 'Kreacje' },
  { id: 'budzet', label: 'Budżet' },
] as const;
export type CampaignTab = (typeof campaignTabs)[number]['id'];

export function CampaignAnalysisHeader({
  tab,
  onTab,
  channel,
  onChannel,
  comparison,
  onComparison,
}: {
  readonly tab: CampaignTab;
  readonly onTab: (tab: CampaignTab) => void;
  readonly channel: CampaignChannel;
  readonly onChannel: (channel: CampaignChannel) => void;
  readonly comparison: 'previous_period' | 'previous_year';
  readonly onComparison: (value: 'previous_period' | 'previous_year') => void;
}) {
  const { dateRange, setDateRange } = useShellDateRange();
  const [open, setOpen] = useState(false);
  const valid = overviewDayCount(dateRange) > 0 && overviewDayCount(dateRange) <= 366;
  const analytical = tab === 'wynik' || tab === 'kampanie';
  return (
    <>
      <header className="pd-campaign-analysis__header">
        <div>
          <h1>Kampanie płatne</h1>
          <p>Koszt pozyskania, wynik kampanii i miejsca wymagające uwagi.</p>
        </div>
        <div className="pd-campaign-analysis__scope">
          {analytical ? (
            <>
              <Popover
                anchorId="campaign-date-trigger"
                modal={false}
                placement="bottom-end"
                open={open}
                onOpenChange={setOpen}
                title="Okres kampanii"
                trigger={
                  <Button variant="secondary" size="small">
                    {overviewRangeLabel(dateRange)} <span aria-hidden="true">⌄</span>
                  </Button>
                }
              >
                <DateRangePicker
                  label="Okres kampanii"
                  value={dateRange}
                  timezone={dateRange.timezone}
                  onChange={setDateRange}
                  presets={[
                    { label: 'Ostatnie 7 dni', value: 'last7d' },
                    { label: 'Ostatnie 30 dni', value: 'last30d' },
                    { label: 'Własny okres', value: 'custom' },
                  ]}
                />
                {!valid && <p role="alert">Wybierz okres od 1 do 366 dni.</p>}
                <Button size="small" disabled={!valid} onClick={() => setOpen(false)}>
                  Gotowe
                </Button>
              </Popover>
              <select
                aria-label="Porównanie kampanii"
                value={comparison}
                onChange={(e) => onComparison(e.target.value as typeof comparison)}
              >
                <option value="previous_period">vs poprzedni okres</option>
                <option value="previous_year">vs rok wcześniej</option>
              </select>
            </>
          ) : (
            <p>Analiza szczegółowa · 1–31 sie 2026</p>
          )}
        </div>
      </header>
      <nav aria-label="Widoki kampanii" className="pd-campaign-analysis__tabs">
        {campaignTabs.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-current={tab === item.id ? 'page' : undefined}
            onClick={() => onTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="pd-campaign-analysis__context">
        {analytical && (
          <label className="pd-campaign-analysis__channel">
            Kanał
          <select
            aria-label="Kanał reklamowy"
            value={channel}
            onChange={(e) => onChannel(e.target.value as CampaignChannel)}
          >
            <option value="all">Wszystkie kanały</option>
            <option value="google_ads">Google Ads</option>
            <option value="meta_ads">Meta Ads</option>
          </select>
          </label>
        )}
        <p>Dane przykładowe · ostatnie kliknięcie · PLN · Europe/Warsaw</p>
      </div>
    </>
  );
}

export function CampaignPerformance({
  analysis,
  onDetail,
}: {
  readonly analysis: CampaignAnalysis;
  readonly onDetail: (detail: CampaignDetail) => void;
}) {
  const [metric, setMetric] = useState<'ncac' | 'roas' | 'spend'>('ncac');
  const { current, previous, attention } = analysis;
  const plural = new Intl.PluralRules('pl').select(attention.length);
  const attentionLabel =
    plural === 'one'
      ? 'kampania wymaga'
      : plural === 'few'
        ? 'kampanie wymagają'
        : 'kampanii wymaga';
  const goal = metric === 'ncac' ? 100 : metric === 'roas' ? 3.1 : null;
  const value = (n: number | null) => (metric === 'roas' ? `${numeric(n, 2)}×` : money(n));
  const daysLabel = overviewRangeLabel(analysis.range);
  return (
    <section aria-label="Efektywność kampanii">
      <div className="pd-campaign-analysis__diagnosis">
        <h2>
          {attention.length
            ? `${attention.length} ${attentionLabel} sprawdzenia kosztu pozyskania lub danych.`
            : 'Koszt pozyskania mieści się w celach kampanii.'}
        </h2>
        <p>
          Ocena opiera się na koszcie nowego klienta i kompletności kosztów.{' '}
          {!analysis.complete
            ? 'Porównanie okresów jest niepełne.'
            : `Porównanie: ${overviewRangeLabel(analysis.previousRange)}.`}
        </p>
      </div>
      <section className="pd-campaign-analysis__metrics" aria-label="Główne miary kampanii">
        {(Object.keys(campaignMetricLabels) as CampaignMetric[]).map((key) => {
          const raw = current[key],
            baseline = previous[key];
          const change =
            analysis.complete && raw !== null && baseline !== null
              ? overviewChange(raw, baseline)
              : null;
          const roundedChange = change === null ? null : Math.round(change * 10) / 10;
          const direction =
            roundedChange === null || roundedChange === 0
              ? 'flat'
              : roundedChange > 0
                ? 'up'
                : 'down';
          const signal =
            roundedChange === null || roundedChange === 0 || key === 'spend'
              ? 'neutral'
              : (key === 'ncac' ? roundedChange < 0 : roundedChange > 0)
                ? 'positive'
                : 'negative';
          return (
            <MetricCard
              key={key}
              depth="flat"
              label={campaignMetricLabels[key]}
              metricId={`campaign-${key}`}
              status="ready"
              statusLabel=""
              value={key === 'roas' ? `${numeric(raw, 2)}×` : money(raw)}
              signal={signal}
              comparison={{
                direction,
                label:
                  change === null
                    ? 'Brak pełnego porównania'
                    : `${numeric(Math.abs(change), 1)}% vs porównanie`,
              }}
              detailAction={{
                label: 'Definicja i źródło',
                onAction: () => onDetail({ type: 'metric', metric: key }),
              }}
            />
          );
        })}
      </section>
      <div className="pd-campaign-analysis__analysis">
        <section className="pd-campaign-analysis__trend">
          <div className="pd-campaign-analysis__section-heading">
            <div>
              <h2>{campaignMetricLabels[metric]}</h2>
              <p>
                {metric === 'ncac'
                  ? 'zł / nowego klienta'
                  : metric === 'roas'
                    ? 'Przychód przypisany / wydatki'
                    : 'zł / dzień'}
              </p>
            </div>
            <select
              aria-label="Miara trendu kampanii"
              value={metric}
              onChange={(e) => setMetric(e.target.value as typeof metric)}
            >
              <option value="ncac">Koszt nowego klienta</option>
              <option value="roas">ROAS</option>
              <option value="spend">Wydatki</option>
            </select>
          </div>
          <div className="pd-campaign-analysis__legend">
            <span><i aria-hidden="true" /> Wybrany okres</span>
            {goal !== null && <span><i data-goal aria-hidden="true" /> Cel {value(goal)}</span>}
          </div>
          <div
            className="pd-campaign-analysis__plot"
            role="img"
            aria-label={`${campaignMetricLabels[metric]}, ${daysLabel}. Wartości w tabeli poniżej.`}
          >
            {/* minWidth/minHeight give recharts a fallback render size for the
                very first ResizeObserver tick (before the grid layout settles),
                which otherwise measures 0x0 and logs a console warning -- seen
                in the evidence-drawer interaction scenario. */}
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={240}>
              <LineChart
                data={analysis.points}
                margin={{ left: 0, right: 16, top: 12, bottom: 4 }}
                accessibilityLayer
              >
                <CartesianGrid vertical={false} stroke="var(--pd-separator)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={overviewShortDate}
                  minTickGap={40}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--pd-text-muted)', fontSize: 12 }}
                />
                <YAxis
                  width={48}
                  domain={[0, 'auto']}
                  tickFormatter={(v) => numeric(v, metric === 'roas' ? 1 : 0)}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--pd-text-muted)', fontSize: 12 }}
                />
                <Tooltip
                  labelFormatter={(label) => overviewShortDate(String(label))}
                  formatter={(v) => (typeof v === 'number' ? value(v) : 'Brak danych')}
                  contentStyle={{
                    background: 'var(--pd-surface-raised)',
                    color: 'var(--pd-text)',
                    border: '1px solid var(--pd-separator-strong)',
                    borderRadius: 8,
                  }}
                />
                {goal !== null && (
                  <ReferenceLine
                    y={goal}
                    stroke="var(--pd-status-warning)"
                    strokeDasharray="5 4"
                    ifOverflow="extendDomain"
                  />
                )}
                <Line
                  name={campaignMetricLabels[metric]}
                  dataKey={metric}
                  stroke="var(--pd-data-series-1)"
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <details className="pd-campaign-analysis__values">
            <summary>Pokaż wartości trendu</summary>
            <div tabIndex={0} role="region" aria-label="Wartości trendu kampanii">
              <table>
                <caption>
                  {campaignMetricLabels[metric]} · {daysLabel}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Data</th>
                    <th scope="col">Wynik</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.points.map((point) => (
                    <tr key={point.date}>
                      <th scope="row">{overviewShortDate(point.date)}</th>
                      <td>{value(point[metric])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
        <aside className="pd-campaign-analysis__attention">
          <h2>Do sprawdzenia <span aria-hidden="true">{attention.length}</span></h2>
          <div className="pd-campaign-analysis__attention-list" tabIndex={0} role="region" aria-label="Kampanie wymagające sprawdzenia">
          {attention.length ? (
            attention.map((campaign) => (
              <article key={campaign.id}>
                <h3>{campaign.name}</h3>
                <p>
                  {channelLabel(campaign.channel)} · koszt klienta{' '}
                  <strong
                    data-tone={
                      campaign.ncac !== null && campaign.ncac > campaign.cacGoal
                        ? 'danger'
                        : undefined
                    }
                  >
                    {money(campaign.ncac)}
                  </strong>
                </p>
                <p>
                  {campaign.costCoverage < 100
                    ? `Kompletność kosztów produktów i realizacji: ${campaign.costCoverage}%.`
                    : `Cel kosztu klienta: maks. ${campaign.cacGoal} zł.`}
                </p>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => onDetail({ type: 'campaign', id: campaign.id })}
                >
                  Sprawdź dowody →
                </Button>
              </article>
            ))
          ) : (
            <p>Brak kampanii poza celem w wybranym zakresie.</p>
          )}
          </div>
          <p>Sprawdzenie sygnału poprzedza decyzję o zmianie budżetu.</p>
        </aside>
      </div>
    </section>
  );
}

export function CampaignTable({
  analysis,
  onDetail,
}: {
  readonly analysis: CampaignAnalysis;
  readonly onDetail: (detail: CampaignDetail) => void;
}) {
  const [attentionOnly, setAttentionOnly] = useState(false);
  const columns: readonly ExplorerTableColumn<CampaignResult>[] = [
    {
      id: 'name',
      label: 'Kampania',
      required: true,
      sortAccessor: (r) => r.name,
      csvValue: (r) => r.name,
      render: (r) => (
        <button
          className="pd-campaign-analysis__campaign-link"
          type="button"
          onClick={() => onDetail({ type: 'campaign', id: r.id })}
        >
          {r.name}
        </button>
      ),
    },
    {
      id: 'channel',
      label: 'Kanał',
      csvValue: (r) => channelLabel(r.channel),
      render: (r) => channelLabel(r.channel),
    },
    {
      id: 'spend',
      label: 'Wydatki',
      align: 'right',
      sortAccessor: (r) => r.spend,
      csvValue: (r) => r.spend,
      render: (r) => money(r.spend),
    },
    {
      id: 'revenue',
      label: 'Przychód przypisany',
      align: 'right',
      defaultVisible: false,
      sortAccessor: (r) => r.revenue,
      csvValue: (r) => r.revenue,
      render: (r) => money(r.revenue),
    },
    {
      id: 'roas',
      label: 'ROAS',
      align: 'right',
      sortAccessor: (r) => r.roas ?? -1,
      csvValue: (r) => r.roas ?? '',
      render: (r) => `${numeric(r.roas, 2)}×`,
    },
    {
      id: 'ncac',
      label: 'Koszt klienta',
      align: 'right',
      sortAccessor: (r) => r.ncac ?? -1,
      csvValue: (r) => r.ncac ?? '',
      render: (r) => (
        <span data-tone={r.ncac !== null && r.ncac > r.cacGoal ? 'danger' : undefined}>
          {money(r.ncac)}
        </span>
      ),
    },
    {
      id: 'costCoverage',
      label: 'Koszty produktów i realizacji',
      csvValue: (r) => r.costCoverage,
      render: (r) =>
        r.costCoverage === 100 ? (
          'Kompletne'
        ) : (
          <span data-tone="warning">{r.costCoverage}% · brak części kosztów</span>
        ),
    },
  ];
  return (
    <section className="pd-campaign-analysis__table" aria-labelledby="campaign-table-title">
      <div className="pd-campaign-analysis__section-heading">
        <div>
          <h2 id="campaign-table-title">Kampanie</h2>
          <p>Kliknij nazwę, aby otworzyć dowody i wariant budżetu.</p>
        </div>
        <Button
          variant="secondary"
          size="small"
          aria-pressed={attentionOnly}
          onClick={() => setAttentionOnly(!attentionOnly)}
        >
          Wymagają uwagi · {analysis.attention.length}
        </Button>
      </div>
      <ExplorerTable
        ariaLabel="Analiza kampanii"
        columns={columns}
        rows={attentionOnly ? analysis.attention : analysis.rows}
        searchFields={['name', 'id']}
        searchLabel="Szukaj nazwy lub ID kampanii"
        searchPlaceholder="Szukaj kampanii…"
        exportFilenameBase={`kampanie-${analysis.range.from}-${analysis.range.to}`}
        onRowClick={(row) => onDetail({ type: 'campaign', id: row.id })}
      />
    </section>
  );
}

export function CampaignEvidence({
  detail,
  analysis,
  onClose,
}: {
  readonly detail: CampaignDetail;
  readonly analysis: CampaignAnalysis;
  readonly onClose: () => void;
}) {
  const campaign =
    detail?.type === 'campaign' ? analysis.rows.find((r) => r.id === detail.id) : null;
  const title =
    detail?.type === 'metric'
      ? campaignMetricLabels[detail.metric]
      : (campaign?.name ?? 'Dowody kampanii');
  return (
    <Drawer
      open={detail !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={title}
      description="Źródła, założenia i możliwy następny krok."
      side="right"
      width={520}
      dismissible
    >
      <div className="pd-campaign-analysis__evidence">
        <p className="pd-campaign-analysis__quiet">
          Dane przykładowe · {overviewRangeLabel(analysis.range)} · last click
        </p>
        {detail?.type === 'metric' && (
          <>
            <p>{metricDefinitions[detail.metric]}</p>
            <p>
              Wynik:{' '}
              <strong>
                {detail.metric === 'roas'
                  ? `${numeric(analysis.current[detail.metric], 2)}×`
                  : money(analysis.current[detail.metric])}
              </strong>
            </p>
          </>
        )}
        {campaign && (
          <>
            <dl>
              <div>
                <dt>Kanał</dt>
                <dd>{channelLabel(campaign.channel)}</dd>
              </div>
              <div>
                <dt>Wydatki reklamowe</dt>
                <dd>{money(campaign.spend)}</dd>
              </div>
              <div>
                <dt>Nowi klienci</dt>
                <dd>{numeric(campaign.newCustomers)}</dd>
              </div>
              <div>
                <dt>Koszt nowego klienta / cel</dt>
                <dd>
                  {money(campaign.ncac)} / maks. {campaign.cacGoal} zł
                </dd>
              </div>
              <div>
                <dt>ROAS / cel</dt>
                <dd>{numeric(campaign.roas, 2)}× / 3,10×</dd>
              </div>
              <div>
                <dt>Kompletność kosztów produktów i realizacji</dt>
                <dd>{campaign.costCoverage}%</dd>
              </div>
            </dl>
            <p>
              {campaign.ncac !== null && campaign.ncac > campaign.cacGoal
                ? 'Koszt klienta przekracza cel. Sprawdź jakość pozyskania i udział powracających klientów przed ograniczeniem wydatków.'
                : 'Koszt klienta mieści się w celu. Sam ten wskaźnik nie potwierdza rentowności ani możliwości skalowania.'}
            </p>
            {campaign.costCoverage < 100 && (
              <p data-tone="warning">
                Brakuje części kosztów produktów i realizacji. Ocena marży pozostaje niepełna.
              </p>
            )}
            <CampaignBudgetComparison
              spend={campaign.spend}
              days={overviewDayCount(analysis.range)}
            />
          </>
        )}
      </div>
    </Drawer>
  );
}

export function CampaignBudgetComparison({
  spend,
  days,
}: {
  readonly spend: number;
  readonly days: number;
}) {
  const id = useId();
  const [change, setChange] = useState(0);
  const scenario = campaignBudgetScenario(spend, change, days);
  return (
    <section className="pd-campaign-analysis__scenario">
      <h3>Porównaj wariant budżetu</h3>
      <label htmlFor={id}>
        Zmiana wydatków: {change > 0 ? '+' : ''}
        {change}%
      </label>
      <input
        id={id}
        aria-label="Zmiana wydatków w wariancie"
        type="range"
        min={-30}
        max={30}
        step={5}
        value={change}
        onChange={(e) => setChange(Number(e.target.value))}
      />
      <dl>
        <div>
          <dt>Obecne wydatki w okresie</dt>
          <dd>{money(spend)}</dd>
        </div>
        <div>
          <dt>Wariant dla okresu tej samej długości</dt>
          <dd>{money(scenario.spend)}</dd>
        </div>
        <div>
          <dt>Różnica kosztu</dt>
          <dd>{money(scenario.delta)}</dd>
        </div>
      </dl>
      <p>
        To porównanie kosztów przy stałej długości okresu. Przychód i liczba klientów nie są
        prognozowane. Wariant nie zmienia budżetu w Google Ads ani Meta Ads.
      </p>
      <Button size="small" variant="secondary" onClick={() => setChange(0)} disabled={change === 0}>
        Przywróć obecne wydatki
      </Button>
    </section>
  );
}
