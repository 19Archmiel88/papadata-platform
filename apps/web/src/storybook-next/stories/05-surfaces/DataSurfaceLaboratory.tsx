import { useMemo, useState } from 'react';

import { Button, Drawer, InlineNotice, TextAction } from '../../../design-system/components';
import {
  KpiSparkline,
  type KpiSparklineTone,
  type KpiSparklineTrend,
} from './KpiSparkline';
import { DataSurfaceSelect } from './DataSurfaceSelect';
import {
  DecisionRows,
  Localized,
  ReviewBadge,
  StoryPage,
  StorySection,
  copy,
} from './remaining-story-shared';
import './remaining-story-shared.css';
import './data-surface-laboratory.css';

type KpiSample = {
  readonly label: { readonly pl: string; readonly en: string };
  readonly value: string;
  readonly context: { readonly pl: string; readonly en: string };
  readonly helper: { readonly pl: string; readonly en: string };
  readonly trend: KpiSparklineTrend;
  readonly signal: KpiSparklineTone;
  readonly points: readonly number[];
};

const kpiSamples: readonly KpiSample[] = [
  { label: { pl: 'Przychód', en: 'Revenue' }, value: '248 420 zł', context: { pl: '+12,4% okres do okresu', en: '+12.4% period over period' }, helper: { pl: 'Sygnał dodatni · trend wzrostowy · 30 dni', en: 'Positive signal · upward trend · 30 days' }, trend: 'up', signal: 'positive', points: [31, 34, 33, 39, 43, 42, 48, 54, 58] },
  { label: { pl: 'Zamówienia', en: 'Orders' }, value: '1 284', context: { pl: '+6,8% przy stabilnym AOV', en: '+6.8% with stable AOV' }, helper: { pl: 'Sygnał dodatni · trend wzrostowy · 30 dni', en: 'Positive signal · upward trend · 30 days' }, trend: 'up', signal: 'positive', points: [42, 41, 45, 47, 46, 52, 55, 54, 60] },
  { label: { pl: 'ROAS', en: 'ROAS' }, value: '4,82', context: { pl: 'Powyżej celu 4,40', en: 'Above 4.40 target' }, helper: { pl: 'Sygnał dodatni · trend stabilny · 30 dni', en: 'Positive signal · stable trend · 30 days' }, trend: 'flat', signal: 'positive', points: [49, 50, 48, 51, 50, 49, 51, 50, 50] },
  { label: { pl: 'Koszt reklamy', en: 'Ad cost' }, value: '38 200 zł', context: { pl: 'Spadek kosztu jest korzystny', en: 'Lower cost is beneficial' }, helper: { pl: 'Sygnał dodatni · trend spadkowy · 30 dni', en: 'Positive signal · downward trend · 30 days' }, trend: 'down', signal: 'positive', points: [61, 59, 60, 55, 53, 54, 49, 47, 45] },
  { label: { pl: 'Marża brutto', en: 'Gross margin' }, value: '31,7%', context: { pl: '-2,4 p.p. okres do okresu', en: '-2.4 pp period over period' }, helper: { pl: 'Sygnał ujemny · trend spadkowy · 30 dni', en: 'Negative signal · downward trend · 30 days' }, trend: 'down', signal: 'negative', points: [58, 57, 55, 56, 51, 49, 50, 46, 43] },
  { label: { pl: 'Wartość zapasów', en: 'Inventory value' }, value: '46 800 zł', context: { pl: 'Bez istotnej zmiany', en: 'No material change' }, helper: { pl: 'Sygnał neutralny · trend stabilny · 30 dni', en: 'Neutral signal · stable trend · 30 days' }, trend: 'flat', signal: 'neutral', points: [50, 49, 51, 50, 50, 52, 50, 49, 50] },
];

const kpiBadgeTone: Record<
  KpiSparklineTone,
  'neutral' | 'success' | 'warning' | 'critical'
> = {
  positive: 'success',
  negative: 'critical',
  neutral: 'neutral',
  warning: 'warning',
};

function KpiVariants() {
  return (
    <div className="pd-s53-kpi-grid">
      {kpiSamples.map((sample) => (
        <article className="pd-s53-kpi" key={`${sample.value}-${sample.label.pl}`}>
          <header>
            <span>{copy(sample.label)}</span>
            <ReviewBadge tone={kpiBadgeTone[sample.signal]}>{copy(sample.helper)}</ReviewBadge>
          </header>
          <strong>{sample.value}</strong>
          <p>{copy(sample.context)}</p>
          <KpiSparkline points={sample.points} tone={sample.signal} trend={sample.trend} />
          <small><Localized pl="Źródło: sklep + reklamy · odświeżono 8 min temu" en="Source: store + ads · refreshed 8 min ago" /></small>
        </article>
      ))}
    </div>
  );
}

type ChartKind = 'trend' | 'comparison' | 'share' | 'correlation' | 'forecast' | 'waterfall' | 'funnel';

const chartCopy: Record<ChartKind, { readonly name: string; readonly purpose: { readonly pl: string; readonly en: string }; readonly layers: { readonly pl: string; readonly en: string } }> = {
  trend: { name: 'TrendChart', purpose: { pl: 'Trend w czasie z benchmarkiem i adnotacją.', en: 'Time trend with benchmark and annotation.' }, layers: { pl: 'seria · benchmark · punkt · zakres', en: 'series · benchmark · point · range' } },
  comparison: { name: 'ComparisonChart', purpose: { pl: 'Porównanie kategorii i delty.', en: 'Category comparison and delta.' }, layers: { pl: 'wartość · baza · delta', en: 'value · baseline · delta' } },
  share: { name: 'ShareChart', purpose: { pl: 'Udział segmentów w całości.', en: 'Segment share of a whole.' }, layers: { pl: 'segmenty · udział · total', en: 'segments · share · total' } },
  correlation: { name: 'CorrelationChart', purpose: { pl: 'Relacja dwóch zmiennych i trendline.', en: 'Relationship of two variables and trendline.' }, layers: { pl: 'oś X/Y · punkty · trendline', en: 'X/Y axes · points · trendline' } },
  forecast: { name: 'ForecastChart', purpose: { pl: 'Actual, forecast i przedział ufności.', en: 'Actual, forecast and confidence interval.' }, layers: { pl: 'actual · forecast · confidence', en: 'actual · forecast · confidence' } },
  waterfall: { name: 'WaterfallChart', purpose: { pl: 'Składowe zmiany wyniku.', en: 'Components of result change.' }, layers: { pl: 'start · wzrost · spadek · total', en: 'start · increase · decrease · total' } },
  funnel: { name: 'FunnelChart', purpose: { pl: 'Konwersja etapów i drop-off.', en: 'Stage conversion and drop-off.' }, layers: { pl: 'etapy · konwersja · drop-off', en: 'stages · conversion · drop-off' } },
};

function ChartGraphic({ kind }: { readonly kind: ChartKind }) {
  return (
    <svg aria-hidden="true" className="pd-s53-chart-svg" viewBox="0 0 420 210">
      <g className="pd-s53-chart-grid-lines">
        <line x1="48" y1="34" x2="392" y2="34" />
        <line x1="48" y1="82" x2="392" y2="82" />
        <line x1="48" y1="130" x2="392" y2="130" />
        <line x1="48" y1="178" x2="392" y2="178" />
        <line x1="48" y1="24" x2="48" y2="178" />
      </g>
      {kind === 'trend' ? (
        <>
          <path className="pd-s53-chart-range" d="M54 150 C110 126 142 138 194 104 S292 78 382 46 L382 74 C298 98 256 110 198 132 S116 154 54 170 Z" />
          <path className="pd-s53-chart-line" d="M54 158 C110 132 142 140 194 108 S292 82 382 52" />
          <path className="pd-s53-chart-benchmark" d="M54 126 C142 124 238 118 382 108" />
          <circle className="pd-s53-chart-point" cx="294" cy="80" r="5" />
          <line className="pd-s53-chart-annotation" x1="294" y1="80" x2="330" y2="48" />
        </>
      ) : null}
      {kind === 'comparison' ? (
        <>
          {[0, 1, 2, 3].map((index) => <rect className="pd-s53-chart-bar" height={54 + index * 20} key={index} width="34" x={70 + index * 76} y={124 - index * 20} />)}
          <line className="pd-s53-chart-benchmark" x1="56" y1="92" x2="370" y2="92" />
        </>
      ) : null}
      {kind === 'share' ? (
        <>
          <circle className="pd-s53-chart-donut-base" cx="132" cy="104" r="58" />
          <path className="pd-s53-chart-donut-a" d="M132 46 A58 58 0 0 1 184 130" />
          <path className="pd-s53-chart-donut-b" d="M184 130 A58 58 0 0 1 98 151" />
          <rect className="pd-s53-chart-legend" x="244" y="66" width="104" height="10" />
          <rect className="pd-s53-chart-legend" x="244" y="98" width="76" height="10" />
          <rect className="pd-s53-chart-legend" x="244" y="130" width="92" height="10" />
        </>
      ) : null}
      {kind === 'correlation' ? (
        <>
          <path className="pd-s53-chart-benchmark" d="M70 160 L360 50" />
          {[[86, 152], [124, 142], [168, 118], [212, 116], [258, 86], [306, 76], [350, 52]].map(([cx, cy]) => <circle className="pd-s53-chart-dot" cx={cx} cy={cy} key={`${cx}-${cy}`} r="5" />)}
        </>
      ) : null}
      {kind === 'forecast' ? (
        <>
          <path className="pd-s53-chart-range" d="M232 92 L382 42 L382 128 L232 120 Z" />
          <path className="pd-s53-chart-line" d="M54 154 C116 138 174 110 232 92" />
          <path className="pd-s53-chart-forecast" d="M232 92 C284 72 330 58 382 42" />
          <line className="pd-s53-chart-annotation" x1="232" y1="48" x2="232" y2="168" />
        </>
      ) : null}
      {kind === 'waterfall' ? (
        <>
          <rect className="pd-s53-chart-bar" x="64" y="112" width="42" height="66" />
          <rect className="pd-s53-chart-bar pd-s53-chart-bar--positive" x="132" y="72" width="42" height="40" />
          <rect className="pd-s53-chart-bar pd-s53-chart-bar--negative" x="200" y="98" width="42" height="26" />
          <rect className="pd-s53-chart-bar pd-s53-chart-bar--positive" x="268" y="54" width="42" height="44" />
          <rect className="pd-s53-chart-bar" x="336" y="54" width="42" height="124" />
          <path className="pd-s53-chart-connector" d="M106 112 H132 M174 72 H200 M242 98 H268 M310 54 H336" />
        </>
      ) : null}
      {kind === 'funnel' ? (
        <>
          <path className="pd-s53-chart-funnel" d="M78 38 H350 L320 72 H108 Z" />
          <path className="pd-s53-chart-funnel pd-s53-chart-funnel--b" d="M116 86 H312 L284 120 H144 Z" />
          <path className="pd-s53-chart-funnel pd-s53-chart-funnel--c" d="M154 134 H274 L252 168 H176 Z" />
        </>
      ) : null}
    </svg>
  );
}

function ChartFamilies() {
  return (
    <div className="pd-s53-chart-family-list">
      {(Object.keys(chartCopy) as ChartKind[]).map((kind) => (
        <article className="pd-s53-chart-family" key={kind}>
          <header>
            <div><span>{chartCopy[kind].name}</span><h3>{copy(chartCopy[kind].purpose)}</h3></div>
            <ReviewBadge tone="info">{copy(chartCopy[kind].layers)}</ReviewBadge>
          </header>
          <div className="pd-s53-chart-family__body">
            <ChartGraphic kind={kind} />
            <dl>
              <div><dt><Localized pl="Pytanie" en="Question" /></dt><dd><Localized pl="Co zmieniło się i dlaczego?" en="What changed and why?" /></dd></div>
              <div><dt><Localized pl="Źródło" en="Source" /></dt><dd>Store + Ads</dd></div>
              <div><dt><Localized pl="Zakres" en="Range" /></dt><dd><Localized pl="30 dni · porównanie okresu" en="30 days · period comparison" /></dd></div>
            </dl>
          </div>
        </article>
      ))}
    </div>
  );
}

function ChartFrame() {
  const [period, setPeriod] = useState<'7' | '30' | 'custom'>('30');
  const [detail, setDetail] = useState<'insight' | 'data' | 'sources'>('insight');

  return (
    <article className="pd-s53-chartframe">
      <header className="pd-s53-chartframe__header">
        <div>
          <span><Localized pl="Pytanie biznesowe" en="Business question" /></span>
          <h3><Localized pl="Czy wzrost budżetu poprawił rentowność kampanii?" en="Did the budget increase improve campaign profitability?" /></h3>
          <p><Localized pl="Przychód, koszt reklamy i benchmark w jednym zadaniu decyzyjnym." en="Revenue, ad cost and benchmark in one decision task." /></p>
        </div>
        <ReviewBadge tone="success"><Localized pl="Dane aktualne · 8 min" en="Fresh data · 8 min" /></ReviewBadge>
      </header>
      <div className="pd-s53-chartframe__controls" role="group" aria-label={copy({ pl: 'Zakres dat wykresu', en: 'Chart date range' })}>
        {(['7', '30', 'custom'] as const).map((item) => (
          <button data-lab-control="segmented-option" aria-pressed={period === item} key={item} onClick={() => setPeriod(item)} type="button">{item === '7' ? <Localized pl="7 dni" en="7 days" /> : item === '30' ? <Localized pl="30 dni" en="30 days" /> : <Localized pl="Własny zakres" en="Custom range" />}</button>
        ))}
        <span><Localized pl="Porównanie: poprzedni okres" en="Comparison: previous period" /></span>
      </div>
      <div className="pd-s53-chartframe__visual">
        <div className="pd-s53-chartframe__axis" aria-hidden="true"><span>300k</span><span>200k</span><span>100k</span><span>0</span></div>
        <svg aria-label={copy({ pl: 'Przychód rośnie szybciej niż koszt reklamy; benchmark pozostaje poniżej wyniku', en: 'Revenue grows faster than ad cost; benchmark remains below the result' })} role="img" viewBox="0 0 760 330">
          <g className="pd-s53-chart-grid-lines"><line x1="56" y1="56" x2="724" y2="56" /><line x1="56" y1="132" x2="724" y2="132" /><line x1="56" y1="208" x2="724" y2="208" /><line x1="56" y1="284" x2="724" y2="284" /></g>
          <path className="pd-s53-chartframe__range" d="M68 248 C160 214 218 222 302 170 S470 116 704 66 L704 104 C486 142 424 170 310 202 S166 252 68 272 Z" />
          <path className="pd-s53-chartframe__revenue" d="M68 258 C160 218 218 226 302 176 S470 120 704 76" />
          <path className="pd-s53-chartframe__cost" d="M68 274 C178 254 252 252 350 218 S526 188 704 160" />
          <path className="pd-s53-chartframe__benchmark" d="M68 212 C222 210 376 202 704 182" />
          <circle className="pd-s53-chartframe__point" cx="470" cy="120" r="6" />
          <line className="pd-s53-chart-annotation" x1="470" y1="120" x2="540" y2="72" />
        </svg>
        <div className="pd-s53-chartframe__annotation"><strong>+18,6%</strong><span><Localized pl="po zmianie budżetu" en="after budget change" /></span></div>
      </div>
      <div className="pd-s53-chartframe__legend"><span data-series="revenue"><Localized pl="Przychód" en="Revenue" /></span><span data-series="cost"><Localized pl="Koszt reklamy" en="Ad cost" /></span><span data-series="benchmark">Benchmark</span></div>
      <div className="pd-s53-chartframe__details">
        <div role="tablist" aria-label={copy({ pl: 'Szczegóły wykresu', en: 'Chart details' })}>
          {(['insight', 'data', 'sources'] as const).map((item) => <button data-lab-control="tab" aria-selected={detail === item} key={item} onClick={() => setDetail(item)} role="tab" type="button">{item === 'insight' ? <Localized pl="Wniosek" en="Insight" /> : item === 'data' ? <Localized pl="Tabela danych" en="Data table" /> : <Localized pl="Źródła" en="Sources" />}</button>)}
        </div>
        <div role="tabpanel">
          {detail === 'insight' ? <p><Localized pl="Przychód rośnie szybciej niż koszt reklamy. Największy efekt pojawia się po zmianie budżetu, ale dwa dni mają niższą jakość atrybucji." en="Revenue grows faster than ad cost. The largest lift follows the budget change, but two days have lower attribution quality." /></p> : null}
          {detail === 'data' ? <table><thead><tr><th><Localized pl="Okres" en="Period" /></th><th><Localized pl="Przychód" en="Revenue" /></th><th><Localized pl="Koszt" en="Cost" /></th></tr></thead><tbody><tr><td>01–10</td><td>82 400 zł</td><td>18 900 zł</td></tr><tr><td>11–20</td><td>96 200 zł</td><td>20 100 zł</td></tr><tr><td>21–30</td><td>111 600 zł</td><td>22 400 zł</td></tr></tbody></table> : null}
          {detail === 'sources' ? <p>Shopify · Google Ads · Meta Ads · <Localized pl="odświeżono 8 min temu" en="refreshed 8 min ago" /></p> : null}
        </div>
      </div>
    </article>
  );
}

type TableRow = { readonly id: string; readonly product: string; readonly orders: number; readonly revenue: string; readonly margin: string; readonly status: 'ready' | 'partial' | 'stale' };
type TableColumn = 'orders' | 'revenue' | 'margin' | 'status';
type TableSort = 'product' | 'orders-desc' | 'revenue-desc';
type TableStatusFilter = 'all' | 'ready' | 'attention';
type TableDensity = 'comfortable' | 'compact';

const tableRows: readonly TableRow[] = [
  { id: 'p-101', product: 'Młynek Pro', orders: 184, revenue: '48 200 zł', margin: '31,2%', status: 'ready' },
  { id: 'p-102', product: 'Kawa Classic', orders: 162, revenue: '37 840 zł', margin: '28,6%', status: 'partial' },
  { id: 'p-103', product: 'Filtry 100', orders: 128, revenue: '18 420 zł', margin: '34,1%', status: 'stale' },
  { id: 'p-104', product: 'Zestaw Barista', orders: 96, revenue: '29 500 zł', margin: '30,4%', status: 'ready' },
];

const tableColumnOptions: readonly { readonly id: TableColumn; readonly label: { readonly pl: string; readonly en: string } }[] = [
  { id: 'orders', label: { pl: 'Zamówienia', en: 'Orders' } },
  { id: 'revenue', label: { pl: 'Przychód', en: 'Revenue' } },
  { id: 'margin', label: { pl: 'Marża', en: 'Margin' } },
  { id: 'status', label: { pl: 'Status danych', en: 'Data status' } },
];

const tableStatusCopy: Record<TableRow['status'], { readonly pl: string; readonly en: string }> = {
  ready: { pl: 'Gotowe', en: 'Ready' },
  partial: { pl: 'Częściowe', en: 'Partial' },
  stale: { pl: 'Nieaktualne', en: 'Stale' },
};

function revenueValue(value: string) {
  return Number(value.replace(/[^0-9]/g, ''));
}

function DataTableSurface() {
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TableStatusFilter>('all');
  const [period, setPeriod] = useState<'30' | 'mtd'>('30');
  const [sort, setSort] = useState<TableSort>('revenue-desc');
  const [density, setDensity] = useState<TableDensity>('comfortable');
  const [visibleColumns, setVisibleColumns] = useState<readonly TableColumn[]>(['orders', 'revenue', 'margin', 'status']);
  const [page, setPage] = useState(0);
  const [drawer, setDrawer] = useState<'export' | 'detail' | 'columns' | null>(null);
  const [detailRow, setDetailRow] = useState<TableRow | null>(null);
  const [exportMode, setExportMode] = useState<'visible' | 'selected' | 'all'>('visible');
  const pageSize = 2;

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rows = tableRows.filter((row) => {
      const matchesQuery = normalizedQuery.length === 0 || row.product.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'ready' ? row.status === 'ready' : row.status !== 'ready');
      return matchesQuery && matchesStatus;
    });

    return [...rows].sort((left, right) => {
      if (sort === 'orders-desc') return right.orders - left.orders;
      if (sort === 'revenue-desc') return revenueValue(right.revenue) - revenueValue(left.revenue);
      return left.product.localeCompare(right.product, 'pl');
    });
  }, [query, sort, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
  const visibleRows = collapsed ? pageRows.slice(0, 1) : pageRows;
  const activeFilterCount = Number(query.trim().length > 0) + Number(statusFilter !== 'all') + Number(period !== '30');
  const allVisiblePageRowsSelected = pageRows.length > 0 && pageRows.every((row) => selected.includes(row.id));

  const openDetail = (row: TableRow) => {
    setDetailRow(row);
    setDrawer('detail');
  };

  const toggleColumn = (column: TableColumn) => {
    setVisibleColumns((current) => current.includes(column) ? current.filter((item) => item !== column) : [...current, column]);
  };

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setPeriod('30');
    setPage(0);
  };

  const togglePageSelection = (checked: boolean) => {
    const pageIds = pageRows.map((row) => row.id);
    setSelected((current) => checked ? Array.from(new Set([...current, ...pageIds])) : current.filter((id) => !pageIds.includes(id)));
  };

  return (
    <div className="pd-s53-table-surface" data-density={density}>
      <header className="pd-s53-table-toolbar">
        <div className="pd-s53-table-toolbar__filters">
          <label><span><Localized pl="Szukaj produkt" en="Search product" /></span><input onChange={(event) => { setQuery(event.target.value); setPage(0); }} type="search" value={query} /></label>
          <DataSurfaceSelect
            label={copy({ pl: 'Status', en: 'Status' })}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(0);
            }}
            options={[
              { value: 'all', label: copy({ pl: 'Wszystkie', en: 'All' }) },
              { value: 'ready', label: copy({ pl: 'Gotowe', en: 'Ready' }) },
              { value: 'attention', label: copy({ pl: 'Wymagają uwagi', en: 'Needs attention' }) },
            ] as const}
            value={statusFilter}
          />
          <DataSurfaceSelect
            label={copy({ pl: 'Zakres', en: 'Range' })}
            onValueChange={(value) => {
              setPeriod(value);
              setPage(0);
            }}
            options={[
              { value: '30', label: copy({ pl: '30 dni', en: '30 days' }) },
              { value: 'mtd', label: copy({ pl: 'Miesiąc do dziś', en: 'Month to date' }) },
            ] as const}
            value={period}
          />
          <DataSurfaceSelect
            label={copy({ pl: 'Sortowanie', en: 'Sorting' })}
            onValueChange={setSort}
            options={[
              { value: 'revenue-desc', label: copy({ pl: 'Przychód malejąco', en: 'Revenue descending' }) },
              { value: 'orders-desc', label: copy({ pl: 'Zamówienia malejąco', en: 'Orders descending' }) },
              { value: 'product', label: copy({ pl: 'Produkt A–Z', en: 'Product A–Z' }) },
            ] as const}
            value={sort}
          />
        </div>
        <div className="pd-s53-table-toolbar__actions">
          <span>{activeFilterCount > 0 ? copy({ pl: `Aktywne filtry: ${activeFilterCount}`, en: `Active filters: ${activeFilterCount}` }) : copy({ pl: 'Brak aktywnych filtrów', en: 'No active filters' })}</span>
          {activeFilterCount > 0 ? <TextAction onClick={resetFilters} size="small" ><Localized pl="Wyczyść filtry" en="Clear filters" /></TextAction> : null}
          <Button onClick={() => setDensity((current) => current === 'comfortable' ? 'compact' : 'comfortable')} size="small" variant="secondary" aria-pressed={density === 'compact'}>{density === 'compact' ? <Localized pl="Gęstość: kompaktowa" en="Density: compact" /> : <Localized pl="Gęstość: wygodna" en="Density: comfortable" />}</Button>
          <Button onClick={() => setDrawer('columns')} size="small" variant="secondary"><Localized pl="Kolumny" en="Columns" /></Button>
          <Button onClick={() => setCollapsed((current) => !current)} size="small" variant="secondary" aria-expanded={!collapsed}>{collapsed ? <Localized pl="Rozwiń tabelę" en="Expand table" /> : <Localized pl="Zwiń do 1 wiersza" en="Collapse to 1 row" />}</Button>
          <Button onClick={() => setDrawer('export')} size="small" variant="secondary"><Localized pl="Eksport" en="Export" /></Button>
        </div>
      </header>

      {selected.length > 0 ? (
        <div className="pd-s53-table-bulk" role="status">
          <strong>{copy({ pl: `Zaznaczono: ${selected.length}`, en: `Selected: ${selected.length}` })}</strong>
          <div><Button onClick={() => { setExportMode('selected'); setDrawer('export'); }} size="small" variant="secondary"><Localized pl="Eksportuj zaznaczone" en="Export selected" /></Button><TextAction onClick={() => setSelected([])} size="small"><Localized pl="Wyczyść wybór" en="Clear selection" /></TextAction></div>
        </div>
      ) : null}

      <div className="pd-s53-table-wrap">
        <table>
          <caption><Localized pl={period === '30' ? 'Produkty · ostatnie 30 dni. Domyślnie żaden rekord nie jest zaznaczony.' : 'Produkty · miesiąc do dziś. Domyślnie żaden rekord nie jest zaznaczony.'} en={period === '30' ? 'Products · last 30 days. No record is selected by default.' : 'Products · month to date. No record is selected by default.'} /></caption>
          <thead><tr><th><input aria-label={copy({ pl: 'Zaznacz rekordy na bieżącej stronie', en: 'Select records on the current page' })} checked={allVisiblePageRowsSelected} onChange={(event) => togglePageSelection(event.target.checked)} type="checkbox" /></th><th><Localized pl="Produkt" en="Product" /></th>{visibleColumns.includes('orders') ? <th><Localized pl="Zamówienia" en="Orders" /></th> : null}{visibleColumns.includes('revenue') ? <th><Localized pl="Przychód" en="Revenue" /></th> : null}{visibleColumns.includes('margin') ? <th><Localized pl="Marża" en="Margin" /></th> : null}{visibleColumns.includes('status') ? <th>Status</th> : null}<th><Localized pl="Akcja" en="Action" /></th></tr></thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id} data-selected={selected.includes(row.id) || undefined}>
                <td data-label={copy({ pl: 'Wybór', en: 'Select' })}><input aria-label={`${copy({ pl: 'Zaznacz', en: 'Select' })} ${row.product}`} checked={selected.includes(row.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id))} type="checkbox" /></td>
                <th data-label={copy({ pl: 'Produkt', en: 'Product' })} scope="row">{row.product}</th>
                {visibleColumns.includes('orders') ? <td data-label={copy({ pl: 'Zamówienia', en: 'Orders' })}>{row.orders}</td> : null}
                {visibleColumns.includes('revenue') ? <td data-label={copy({ pl: 'Przychód', en: 'Revenue' })}>{row.revenue}</td> : null}
                {visibleColumns.includes('margin') ? <td data-label={copy({ pl: 'Marża', en: 'Margin' })}>{row.margin}</td> : null}
                {visibleColumns.includes('status') ? <td data-label="Status"><ReviewBadge tone={row.status === 'ready' ? 'success' : row.status === 'partial' ? 'warning' : 'info'}>{copy(tableStatusCopy[row.status])}</ReviewBadge></td> : null}
                <td data-label={copy({ pl: 'Akcja', en: 'Action' })}><TextAction onClick={() => openDetail(row)} size="small"><Localized pl="Szczegóły" en="Details" /></TextAction></td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleRows.length === 0 ? <div className="pd-s53-table-empty"><strong><Localized pl="Brak wyników" en="No results" /></strong><p><Localized pl="Zmień wyszukiwanie lub wyczyść filtry. Stan pusty nie zastępuje tabeli poziomym scrollem." en="Change the search or clear filters. The empty state does not replace the table with horizontal scrolling." /></p><Button onClick={resetFilters} size="small" variant="secondary"><Localized pl="Wyczyść filtry" en="Clear filters" /></Button></div> : null}
      </div>
      <footer className="pd-s53-table-footer"><span>{filtered.length} <Localized pl="rekordy" en="records" /></span><nav aria-label={copy({ pl: 'Paginacja tabeli', en: 'Table pagination' })}><TextAction disabled={currentPage === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} size="small"><Localized pl="Poprzednia" en="Previous" /></TextAction><span>{copy({ pl: `Strona ${currentPage + 1} z ${pageCount}`, en: `Page ${currentPage + 1} of ${pageCount}` })}</span><TextAction disabled={currentPage >= pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} size="small"><Localized pl="Następna" en="Next" /></TextAction></nav></footer>

      <Drawer dismissible open={drawer === 'columns'} onOpenChange={(open) => setDrawer(open ? 'columns' : null)} side="right" title={copy({ pl: 'Widoczne kolumny', en: 'Visible columns' })} width={400} description={copy({ pl: 'Produkt, wybór i akcja pozostają zawsze widoczne.', en: 'Product, selection and action always remain visible.' })}>
        <fieldset className="pd-s53-column-options"><legend><Localized pl="Kolumny opcjonalne" en="Optional columns" /></legend>{tableColumnOptions.map((column) => <label key={column.id}><input checked={visibleColumns.includes(column.id)} onChange={() => toggleColumn(column.id)} type="checkbox" />{copy(column.label)}</label>)}</fieldset>
      </Drawer>

      <Drawer dismissible open={drawer === 'export'} onOpenChange={(open) => setDrawer(open ? 'export' : null)} primaryActionLabel={copy({ pl: 'Eksportuj CSV', en: 'Export CSV' })} secondaryActionLabel={copy({ pl: 'Anuluj', en: 'Cancel' })} side="right" title={copy({ pl: 'Podgląd eksportu', en: 'Export preview' })} width={420} description={copy({ pl: 'Warstwa nie przedłuża tabeli i przywraca fokus po zamknięciu.', en: 'The layer does not extend the table and restores focus after closing.' })}>
        <fieldset className="pd-s53-export-options"><legend><Localized pl="Zakres danych" en="Data scope" /></legend><label><input checked={exportMode === 'visible'} name="export" onChange={() => setExportMode('visible')} type="radio" /><Localized pl="Bieżący widok i widoczne kolumny" en="Current view and visible columns" /></label><label><input checked={exportMode === 'selected'} disabled={selected.length === 0} name="export" onChange={() => setExportMode('selected')} type="radio" /><Localized pl="Zaznaczone rekordy" en="Selected records" /></label><label><input checked={exportMode === 'all'} name="export" onChange={() => setExportMode('all')} type="radio" /><Localized pl="Wszystkie dozwolone rekordy" en="All allowed records" /></label></fieldset>
        <InlineNotice message={copy({ pl: 'Eksport nie obejmuje niedostępnych pól technicznych ani danych wyłączonych przez capability.', en: 'Export excludes unavailable technical fields and data blocked by capability.' })} title={copy({ pl: 'Polityka danych', en: 'Data policy' })} tone="info" />
      </Drawer>

      <Drawer dismissible open={drawer === 'detail'} onOpenChange={(open) => setDrawer(open ? 'detail' : null)} side="right" title={copy({ pl: 'Szczegóły rekordu', en: 'Record details' })} width={460} description={detailRow?.product ?? null}>
        {detailRow ? <dl className="pd-s53-detail-list"><div><dt>ID</dt><dd>{detailRow.id}</dd></div><div><dt><Localized pl="Zamówienia" en="Orders" /></dt><dd>{detailRow.orders}</dd></div><div><dt><Localized pl="Przychód" en="Revenue" /></dt><dd>{detailRow.revenue}</dd></div><div><dt><Localized pl="Marża" en="Margin" /></dt><dd>{detailRow.margin}</dd></div></dl> : null}
      </Drawer>
    </div>
  );
}

const surfaceStates = [
  { id: 'processing', tone: 'info' as const, title: { pl: 'Przetwarzanie', en: 'Processing' }, body: { pl: 'Geometria pozostaje stabilna, a postęp ma tekstowy opis.', en: 'Geometry stays stable and progress has a text description.' } },
  { id: 'no data', tone: 'neutral' as const, title: { pl: 'Brak danych', en: 'No data' }, body: { pl: 'Powierzchnia wyjaśnia, dlaczego zestaw jest pusty i co można zrobić.', en: 'The surface explains why the set is empty and what can be done.' } },
  { id: 'partial', tone: 'warning' as const, title: { pl: 'Dane częściowe', en: 'Partial data' }, body: { pl: 'Wynik jest dostępny, ale dwa źródła nie zakończyły synchronizacji.', en: 'The result is available, but two sources have not finished syncing.' } },
  { id: 'stale', tone: 'warning' as const, title: { pl: 'Dane nieaktualne', en: 'Stale data' }, body: { pl: 'Widoczna jest data ostatniego poprawnego odświeżenia.', en: 'The last successful refresh date is visible.' } },
  { id: 'provider error', tone: 'critical' as const, title: { pl: 'Błąd dostawcy', en: 'Provider error' }, body: { pl: 'Komunikat wskazuje konkretne źródło i bezpieczne działanie naprawcze.', en: 'The message identifies the source and a safe recovery action.' } },
] as const;

function SurfaceStates() {
  return <div className="pd-s53-state-list">{surfaceStates.map((state) => <article key={state.id}><header><ReviewBadge tone={state.tone}>{state.id}</ReviewBadge><h3>{copy(state.title)}</h3></header><p>{copy(state.body)}</p><div aria-hidden="true"><span /><span /><span /></div></article>)}</div>;
}

function WorkPanels() {
  const [panel, setPanel] = useState<'evidence' | 'recommendation' | 'workspace' | null>(null);
  return (
    <div className="pd-s53-work-context">
      <div className="pd-s53-work-context__base">
        <header><div><span><Localized pl="Kontekst decyzji" en="Decision context" /></span><h3><Localized pl="Kampania Search · rentowność" en="Search campaign · profitability" /></h3></div><ReviewBadge tone="warning"><Localized pl="Wymaga decyzji" en="Decision required" /></ReviewBadge></header>
        <p><Localized pl="Dowody i rekomendacje otwierają się jako warstwy. Nie są kolejnymi blokami pod powierzchnią danych." en="Evidence and recommendations open as layers. They are not additional blocks below the data surface." /></p>
        <div><Button onClick={() => setPanel('evidence')} size="small" variant="secondary"><Localized pl="Otwórz dowody" en="Open evidence" /></Button><Button onClick={() => setPanel('recommendation')} size="small" variant="secondary"><Localized pl="Otwórz rekomendację" en="Open recommendation" /></Button><Button onClick={() => setPanel('workspace')} size="small" variant="secondary"><Localized pl="Otwórz panel roboczy" en="Open workspace" /></Button></div>
      </div>
      <Drawer dismissible open={panel !== null} onOpenChange={(open) => setPanel(open ? panel : null)} side="right" title={panel === 'evidence' ? copy({ pl: 'Dowody', en: 'Evidence' }) : panel === 'recommendation' ? copy({ pl: 'Rekomendacja', en: 'Recommendation' }) : copy({ pl: 'Panel roboczy', en: 'Workspace' })} width={480} description={copy({ pl: 'Warstwa kontekstowa z Escape i przywróceniem fokusu.', en: 'Contextual layer with Escape and focus restoration.' })}>
        {panel === 'evidence' ? <ul><li><Localized pl="Przychód +18,6% po zmianie budżetu" en="Revenue +18.6% after budget change" /></li><li><Localized pl="Atrybucja częściowa przez 2 dni" en="Partial attribution for 2 days" /></li><li><Localized pl="Benchmark kategorii +11,2%" en="Category benchmark +11.2%" /></li></ul> : null}
        {panel === 'recommendation' ? <InlineNotice message={copy({ pl: 'Utrzymaj budżet przez 7 dni i ponownie oceń jakość atrybucji.', en: 'Keep the budget for 7 days and reassess attribution quality.' })} title={copy({ pl: 'Rekomendacja Papa', en: 'Papa recommendation' })} tone="info" /> : null}
        {panel === 'workspace' ? <div className="pd-s53-workspace-lines" aria-hidden="true"><span /><span /><span /><span /></div> : null}
      </Drawer>
    </div>
  );
}

function Roles() {
  const roles = [
    { role: 'KPI', description: { pl: 'Szybki sygnał i kierunek trendu', en: 'A quick signal and trend direction' } },
    { role: 'Chart', description: { pl: 'Relacja, porównanie lub struktura', en: 'A relationship, comparison or structure' } },
    { role: 'Table', description: { pl: 'Dokładny zestaw rekordów i działania', en: 'An exact record set and actions' } },
    { role: 'Details', description: { pl: 'Warstwa jednego rekordu', en: 'A layer for one record' } },
    { role: 'Evidence', description: { pl: 'Źródła wspierające decyzję', en: 'Sources supporting a decision' } },
    { role: 'Recommendation', description: { pl: 'Proponowany następny krok', en: 'A proposed next step' } },
    { role: 'Data status', description: { pl: 'Jakość, świeżość i dostępność', en: 'Quality, freshness and availability' } },
  ] as const;
  return <div className="pd-s53-role-ledger">{roles.map(({ role, description }) => <div key={role}><strong>{role}</strong><p>{copy(description)}</p><span><Localized pl="Własna rola lub cykl interakcji" en="Own role or interaction cycle" /></span></div>)}</div>;
}

export function DataSurfaceLaboratory() {
  return (
    <StoryPage handoff={<Localized pl="10 / 15 / 18 — komponenty i wzorce danych" en="10 / 15 / 18 — data components and patterns" />} id="05.03" title={<Localized pl="Powierzchnie danych" en="Data surfaces" />} summary={<Localized pl="Panel istnieje tylko wtedy, gdy ma własną rolę, stan albo cykl interakcji. Dane, warstwy i działania nie tworzą poziomego scrolla ani kart wewnątrz kart." en="A panel exists only when it has its own role, state or interaction cycle. Data, layers and actions create neither horizontal scrolling nor cards inside cards." />} variants={<Localized pl="role · KPI · wykresy · ChartFrame · tabela · stany · warstwy" en="roles · KPI · charts · ChartFrame · table · states · layers" />}>
      <StorySection index="01" title={<Localized pl="Role powierzchni" en="Surface roles" />}><Roles /></StorySection>
      <StorySection index="02" title={<Localized pl="Warianty KPI" en="KPI variants" />} summary={<Localized pl="Każdy lokalny wariant 05.03 ma mikrowykres wzrostowy, spadkowy albo stabilny. Kierunek nie zależy wyłącznie od koloru." en="Every local 05.03 variant has an upward, downward or stable microchart. Direction does not rely on color alone." />}><KpiVariants /></StorySection>
      <StorySection index="03" title={<Localized pl="Rodziny wykresów" en="Chart families" />} summary={<Localized pl="Każda rodzina pokazuje znaczenie kontraktowe, warstwy i metadane, a nie dekoracyjny szkic." en="Each family shows contract meaning, layers and metadata rather than a decorative sketch." />}><ChartFamilies /></StorySection>
      <StorySection index="04" title={<Localized pl="Pełny ChartFrame" en="Full ChartFrame" />} summary={<Localized pl="Jedno pytanie, jedna wizualizacja i progresywne ujawnianie szczegółów. Zoom, brush i pan pozostają poza zatwierdzonym kontraktem." en="One question, one visualization and progressive disclosure. Zoom, brush and pan remain outside the approved contract." />}><ChartFrame /></StorySection>
      <StorySection index="05" title={<Localized pl="System tabeli" en="Table system" />} summary={<Localized pl="Tabela nie zaznacza rekordu domyślnie. Szczegóły i eksport otwierają się jako warstwy z systemu OverlayRoot/Drawer." en="The table selects no record by default. Details and export open as OverlayRoot/Drawer layers." />}><DataTableSurface /></StorySection>
      <StorySection index="06" title={<Localized pl="Stany powierzchni" en="Surface states" />} summary={<Localized pl="Stany układają się pionowo lub w elastycznej siatce bez poziomego przewijania." en="States stack vertically or in a flexible grid without horizontal scrolling." />}><SurfaceStates /></StorySection>
      <StorySection index="07" title={<Localized pl="Panele robocze w kontekście" en="Work panels in context" />}><WorkPanels /></StorySection>
      <StorySection index="08" title={<Localized pl="Decyzja i antyprzykład" en="Decision and anti-example" />}><DecisionRows accepted={<Localized pl="Jedna rola powierzchni, jawne stany, detale w warstwach, brak domyślnego zaznaczenia i brak poziomego scrolla." en="One surface role, explicit states, details in layers, no default selection and no horizontal scrolling." />} rejected={<Localized pl="Tabela i panele przedłużają stronę, wszystkie warianty są obok siebie, a poziomy scrollbar zastępuje decyzję układową." en="The table and panels extend the page, all variants sit side by side, and a horizontal scrollbar replaces a layout decision." />} /></StorySection>
    </StoryPage>
  );
}
