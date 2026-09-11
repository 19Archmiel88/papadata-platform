import { CustomerCohortExplorer, CustomerDataQuality } from './CustomerCohortExplorer';
import type { AnalyticsExportContext } from '../../runtime/shared/data/useAnalyticsExport';
import { useMemo } from 'react';
import type { CustomersPortfolio, CustomerMoney, RealCustomersRecord } from '@papadata/contracts';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button, Drawer, ExplorerTable, ProductSectionFrame, type ExplorerTableColumn } from '../../design-system';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import { contextualProductLink, productRoutes, useProductQuery } from '../../runtime/app/routing/productRoutes';
import { useAssistantAnalysisContext } from '../../runtime/shell/papa-assistant/useAssistantAnalysisContext';
import type { RemoteState } from '../../runtime/shared/data/useRemoteResource';
import { MetricSummary, ProductDataState, ProductViewNav } from '../shared/ProductDataState';
import { ProductDateControl } from '../shared/ProductDateControl';
import { formatProductMoney, useProductLocale } from '../shared/useProductLocale';

type View = 'overview' | 'explorer' | 'cohorts' | 'value' | 'quality';
type Row = RealCustomersRecord & { readonly id: string };
export type CustomerPortfolioViewProps = {
  readonly data?: CustomersPortfolio | null;
  readonly state?: RemoteState;
  readonly problem?: string | null;
  readonly demo?: boolean;
  readonly onReload?: () => void;
  readonly detail?: RealCustomersRecord | null;
  readonly detailState?: RemoteState;
  readonly detailProblem?: string | null;
  readonly canReadDetail?: boolean;
  readonly onExport?: (context: AnalyticsExportContext) => Promise<void>;
  readonly exportBusy?: boolean;
  readonly exportProblem?: string | null;
};
const segmentNames: Readonly<Record<string, readonly [string, string]>> = {
  'At Risk': ['W ryzyku', 'At risk'], 'Champions': ['Najlepsi klienci', 'Champions'],
  'Hibernating': ['Nieaktywni', 'Lapsed'], 'Loyal Customers': ['Lojalni', 'Loyal'],
  'New': ['Nowi', 'New'], 'Potential Loyalists': ['Potencjalnie lojalni', 'Potential loyalists'],
};
const segmentKeys: Readonly<Record<string, string>> = { 'At Risk': 'atRisk', Champions: 'champions', Hibernating: 'hibernating', 'Loyal Customers': 'loyal', New: 'new', 'Potential Loyalists': 'potential' };

export function CustomerPortfolioView({ data = null, state = data ? 'ready' : 'loading', problem, demo = false,
  onReload, detail, detailState = 'ready', detailProblem, canReadDetail = demo, onExport, exportBusy = false, exportProblem }: CustomerPortfolioViewProps) {
  const { params, update } = useProductQuery();
  const { dateRange } = useShellDateRange();
  const navigate = useShellNavigate();
  const { t, language, locale } = useProductLocale();
  const requested = params.get('customerView');
  const view: View = requested === 'explorer' || requested === 'cohorts' || requested === 'value' || requested === 'quality' ? requested : 'overview';
  const search = params.get('customerSearch') ?? '';
  const segment = params.get('customerSegment') ?? '';
  const risk = params.get('customerRisk') ?? '';
  const selectedId = params.get('customerId');
  const sortId = params.get('customerSort') ?? 'ltv';
  const sortDirection = params.get('customerDirection') === 'asc' ? 'asc' : 'desc';
  const changeFilter = (values: Readonly<Record<string, string | null>>) => update({ ...values, customerCursor: null, customerId: null });
  const money = (value: CustomerMoney | null | undefined) => formatProductMoney(value, language);
  const n = (value: number | null | undefined) => value == null ? '—' : new Intl.NumberFormat(language).format(value);
  const pct = (value: number | null | undefined) => value == null ? '—' : new Intl.NumberFormat(language, { style: 'percent', maximumFractionDigits: 1 }).format(value);
  const segmentName = (value: string) => { const labels = segmentNames[value]; return labels ? labels[locale === 'en' ? 1 : 0] : value; };
  const totals = data?.portfolioTotals;
  const portfolioDay=data?new Intl.DateTimeFormat('en-CA',{timeZone:data.scope.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(data.scope.asOf)):dateRange.to;
  const filteredRows = useMemo(() => {
    const rows = data?.records ?? [];
    if (!demo) return rows;
    return rows.filter(row => (!search || row.customerPseudonym.toLowerCase().includes(search.toLowerCase()))
      && (!segment || segmentKeys[row.segmentLabel] === segment)
      && (!risk || (risk === 'at_risk' ? row.segmentLabel === 'At Risk' : risk === 'lapsed' ? row.segmentLabel === 'Hibernating' : !['At Risk', 'Hibernating'].includes(row.segmentLabel))));
  }, [data, demo, search, segment, risk]);
  const rows = filteredRows.map(row => ({ ...row, id: row.customerPseudonym }));
  const selected = demo ? rows.find(row => row.id === selectedId) ?? null : detail;
  const columns: readonly ExplorerTableColumn<Row>[] = [
    { id: 'customerPseudonym', label: t('Klient', 'Customer'), required: true, sortAccessor: row => row.customerPseudonym,
      render: row => <Button variant="ghost" size="small" disabled={!canReadDetail} title={!canReadDetail ? t('Wymagane uprawnienie do szczegółów pseudonimizowanych.', 'Pseudonymized detail permission is required.') : undefined} onClick={() => update({ customerId: row.id })}>{row.customerPseudonym}</Button> },
    { id: 'segmentLabel', label: t('Segment RFM', 'RFM segment'), render: row => <span className="pd-product-data__badge">{segmentName(row.segmentLabel)}</span>, csvValue: row => segmentName(row.segmentLabel) },
    { id: 'recencyDays', label: t('Dni od zakupu', 'Days since order'), align: 'right', sortAccessor: row => row.recencyDays },
    { id: 'ordersCount', label: t('Zamówienia historycznie', 'Historical orders'), align: 'right', sortAccessor: row => row.ordersCount },
    { id: 'ltv', label: t('Wartość zaobserwowana', 'Observed value'), align: 'right', render: row => money(row.ltv), csvValue: row => row.ltv.amount, sortAccessor: row => row.ltv.amount },
    { id: 'revenue', label: t('Przychód w okresie', 'Period revenue'), align: 'right', render: row => money(row.revenue), csvValue: row => row.revenue.amount, sortAccessor: row => row.revenue.amount },
    { id: 'rfmScore', label: 'RFM', defaultVisible: false },
  ];
  const source = demo ? t('Jawny scenariusz demonstracyjny', 'Explicit demonstration scenario') : t('Zamówienia kanoniczne', 'Canonical orders');
  useAssistantAnalysisContext({ title: t('Klienci', 'Customers'), route: '/app/customers', readiness: state === 'ready' ? 'partial' : state,
    source, metrics: { [t('Portfel klientów', 'Customer portfolio')]: totals?.totalCustomers, [t('Aktywni w okresie', 'Active in period')]: totals?.activeCustomers,
      [t('Przychód w okresie', 'Period revenue')]: totals?.totalWindowRevenue ? money(totals.totalWindowRevenue) : null },
    filters: { [t('Segment eksploratora', 'Explorer segment')]: segment || t('Wszystkie', 'All'), [t('Stan portfela na', 'Portfolio as of')]: data?.scope.asOf ?? dateRange.to },
    charts: [t('Trend dzienny', 'Daily trend')], tables: [t('Eksplorator klientów', 'Customer explorer'), t('Kohorty M1–M12', 'M1–M12 cohorts')] });
  const retentionLink = contextualProductLink(productRoutes.decisions, { intent: 'retention', domain: 'customers', segment: segment || 'atRisk', customerId: selectedId,
    title: t('Zweryfikować działanie retencyjne', 'Review a retention action') });
  return <div className="pd-product-data" data-testid="customers-bi-page">
    <header className="pd-product-data__head"><div><h1>{t('Klienci', 'Customers')}</h1>
      <p>{t('Portfel na koniec wybranego zakresu. Aktywność i sprzedaż wyłącznie w tym okresie.', 'Portfolio at the end of the selected range. Activity and sales relate only to that period.')}</p></div>
      <div className="pd-product-data__toolbar"><ProductDateControl label={t('Okres klientów', 'Customer period')} clearParams={['customerCursor', 'customerId']} />
        {onReload && <Button variant="secondary" size="small" disabled={state === 'loading'} onClick={onReload}>{t('Odśwież', 'Refresh')}</Button>}</div></header>
    <ProductViewNav label={t('Widoki Klientów', 'Customer views')} active={view} onChange={customerView => update({ customerView,customerId:null,customerCohort:null })}
      items={[{ id: 'overview', label: t('Wynik i retencja', 'Outcome and retention') }, { id: 'explorer', label: t('Eksplorator', 'Explorer') }, { id: 'cohorts', label: t('Kohorty', 'Cohorts') }, { id: 'value', label: t('Wartość i pozyskanie', 'Value and acquisition') }, {id:'quality',label:t('Jakość i prywatność','Quality and privacy')}]} />

    <ProductDataState provenance={data?{source:source,demo:demo,synchronizedAt:data.scope.synchronizedAt,calculatedAt:data.scope.calculatedAt,limitations:[
          ...(demo?[t('Dane demonstracyjne. Zmiana okresu nie pobiera danych serwera.', 'Demonstration data. Changing the period does not retrieve server data.')]:[]),
          t(`Dolna granica zapytania: ${data.scope.historyFrom.slice(0, 10)}; nie potwierdza kompletności historii. LTV oznacza zaobserwowany przychód brutto, nie prognozowaną wartość życiową ani marżę.`, `Query floor: ${data.scope.historyFrom.slice(0, 10)}; this does not confirm complete history. LTV means observed gross revenue, not predicted lifetime value or margin.`),
          t(`Waluta: ${data.currencyCoverage.reportingCurrency}; wyłączone zamówienia w innych walutach: ${data.currencyCoverage.excludedOrders}. Nie stosujemy domyślnego przelicznika FX.`, `Currency: ${data.currencyCoverage.reportingCurrency}; orders excluded in other currencies: ${data.currencyCoverage.excludedOrders}. No implicit FX conversion.`),
          t('RFM: kwintyle względem portfela z jednakowym wynikiem dla remisów. Filtry eksploratora nie zmieniają sum portfela.', 'RFM: portfolio-relative quintiles with identical scores for ties. Explorer filters do not change portfolio totals.'),
        ]}:undefined} state={state} problem={problem} onRetry={onReload}>
      {data && <>

        {data.summary.total === 0 && <ProductDataState state="empty" />}
        {data.summary.total > 0 && data.summary.total < 30 && <p className="pd-product-data__notice" role="status">{t('Mała próba: poniżej 30 klientów. Segmenty opisują portfel, nie potwierdzają istotności statystycznej.', 'Small sample: fewer than 30 customers. Segments describe this portfolio; they do not establish statistical significance.')}</p>}
        {view === 'overview' && data.summary.total > 0 && <>
          <dl className="pd-product-data__metrics">
            <MetricSummary label={t('Cały portfel', 'Whole portfolio')} value={n(totals?.totalCustomers)} description={t(`Stan na ${portfolioDay}; klienci nieaktywni pozostają w portfelu.`, `As of ${portfolioDay}; inactive customers remain included.`)} />
            <MetricSummary label={t('Aktywni w okresie', 'Active in period')} value={n(totals?.activeCustomers)} description={t('Co najmniej jedno kwalifikowane zamówienie w zakresie.', 'At least one qualifying order in the range.')} />
            <MetricSummary label={t('Nowi / powracający', 'New / returning')} value={`${n(totals?.newCustomers)} / ${n(totals?.returningCustomers)}`} description={t('Klienci unikalni w okresie; powracający nie obejmują nieaktywnych.', 'Unique period customers; returning excludes inactive customers.')} />
            <MetricSummary label={t('Przychód w okresie', 'Period revenue')} value={money(totals?.totalWindowRevenue)} description={t('Kwalifikowane zamówienia w walucie raportowania.', 'Qualifying orders in the reporting currency.')} />
          </dl>
          <ProductSectionFrame icon="trend" title={t('Trend klientów', 'Customer trend')} description={t('Dzienny przychód z pierwszych i kolejnych zakupów. Nie sumuj dziennych klientów jako unikalnych w całym okresie.', 'Daily revenue from first and subsequent purchases. Daily customer counts are not period-unique counts.')}>
            {data.trend.length ? <><div className="pd-product-data__chart" role="img" aria-label={t('Trend przychodu; te same dane w tabeli poniżej.', 'Revenue trend; the same values are in the following table.')}><ResponsiveContainer width="100%" height="100%"><LineChart data={[...data.trend]}>
              <CartesianGrid stroke="var(--pd-separator)" vertical={false} /><XAxis dataKey="date" minTickGap={35} /><YAxis tickLine={false} axisLine={false} width={56}/><Tooltip contentStyle={{background: 'var(--pd-surface)', border: '1px solid var(--pd-separator-strong)', borderRadius: 10, color: 'var(--pd-text)'}} labelStyle={{color: 'var(--pd-text)'}} /><Legend />
              <Line name={t('Pierwszy zakup', 'First purchase')} type="linear" dataKey="newRevenue" stroke="var(--pd-interactive)" dot={false} isAnimationActive={false} />
              <Line name={t('Kolejny zakup', 'Repeat purchase')} type="linear" dataKey="returningRevenue" stroke="var(--pd-text-secondary)" strokeDasharray="5 3" dot={false} isAnimationActive={false} />
            </LineChart></ResponsiveContainer></div><details><summary>{t('Tabela danych trendu', 'Trend data table')}</summary><div className="pd-product-data__table-scroll"><table className="pd-product-data__table"><thead><tr><th>{t('Dzień', 'Day')}</th><th>{t('Pierwszy zakup', 'First purchase')}</th><th>{t('Kolejne zakupy', 'Repeat purchases')}</th></tr></thead><tbody>{data.trend.map(point => <tr key={point.date}><th scope="row">{point.date}</th><td>{money({ amount: point.newRevenue, currency: data.currencyCoverage.reportingCurrency })}</td><td>{money({ amount: point.returningRevenue, currency: data.currencyCoverage.reportingCurrency })}</td></tr>)}</tbody></table></div></details></> : <ProductDataState state="empty" />}
          </ProductSectionFrame>
          <ProductSectionFrame icon="customers" title={t('Segmenty i priorytet retencji', 'Segments and retention priority')} description={t('Klasyfikacja na dzień stanu, a nie odfiltrowanie klientów bez zakupów.', 'Classification as of the snapshot date, not a removal of customers without recent purchases.')}>
            <div className="pd-product-data__grid">{data.segments.map(item => <div key={item.segmentId}><h3>{segmentName(item.segmentLabel)}</h3><p>{n(item.count)} · {money(item.revenue)}</p><Button size="small" variant="ghost" onClick={() => changeFilter({ customerView: 'explorer', customerSegment: segmentKeys[item.segmentLabel] ?? null })}>{t('Otwórz segment', 'Open segment')}</Button></div>)}</div>
            {data.priorityAlert && <p>{t('W ryzyku lub nieaktywni', 'At risk or lapsed')}: <strong>{n(data.priorityAlert.count)}</strong> · {t('historyczny przychód', 'historical revenue')}: {money(data.priorityAlert.revenue)}.</p>}
            <Button variant="secondary" onClick={() => navigate(retentionLink)}>{t('Przygotuj decyzję retencyjną', 'Prepare retention decision')}</Button>
            <p>{t('To otwiera Decyzje z kontekstem. Nie uruchamia kontaktu z klientem ani kampanii.', 'This opens Decisions with context. It does not contact customers or start a campaign.')}</p>
          </ProductSectionFrame>
        </>}
        {view === 'cohorts' && <CustomerCohortExplorer data={data}/>}
        {view === 'quality' && <CustomerDataQuality data={data}/>}
        {view === 'value' && data.summary.total > 0 && <>
          <dl className="pd-product-data__metrics"><MetricSummary label={t('Wartość zaobserwowana portfela', 'Observed portfolio value')} value={money(totals?.totalLtv)} description={t('Suma kwalifikowanego przychodu w dostępnej historii; nie prognoza.', 'Sum of qualifying revenue in available history; not a forecast.')} />
            <MetricSummary label={t('AOV historyczne', 'Historical AOV')} value={money(totals?.aovAllTime)} description={t('Przychód / liczba kwalifikowanych zamówień.', 'Revenue / qualifying order count.')} />
            <MetricSummary label={t('Koszt reklam / nowy klient', 'Ad spend / new customer')} value={data.cac?.cac == null ? '—' : money({ amount: data.cac.cac, currency: data.cac.spend.currency })} description={t('Wskaźnik blended, nie przypisany kanałowi CAC. Brak wydatków lub nowych klientów oznacza brak wyniku.', 'Blended ratio, not channel-attributed CAC. No spend or new customers means no value.')} /></dl>
          <ProductSectionFrame icon="trend" title={t('Koncentracja wartości — Pareto', 'Value concentration — Pareto')} description={t('Grupy A/B/C wypełniają kolejno progi 80% i 95% przychodu. Klient przekraczający próg pozostaje w wypełnianej grupie.', 'A/B/C groups fill the 80% and 95% revenue thresholds. A customer crossing a threshold remains in the group being filled.')}>
            <table className="pd-product-data__table"><thead><tr><th>{t('Grupa', 'Group')}</th><th>{t('Klienci', 'Customers')}</th><th>{t('Wartość', 'Value')}</th><th>{t('Udział narastająco', 'Cumulative share')}</th></tr></thead><tbody>{data.pareto.map(row => <tr key={row.bucket}><th scope="row">{row.bucket}</th><td>{n(row.customers)}</td><td>{money(row.revenue)}</td><td>{pct(row.cumulativeRevenueShare)}</td></tr>)}</tbody></table>
          </ProductSectionFrame>
          <ProductSectionFrame icon="products" title={t('Produkty w pierwszym i kolejnym zakupie', 'Products in first and repeat purchases')} description={t('Najwyższy przychód produktowy w wybranym okresie; nie dowód przyczynowy ani rekomendacja automatycznej wysyłki.', 'Highest product revenue in the selected period; not causal evidence or a recommendation for automatic messaging.')}>
            <div className="pd-product-data__grid">{([{ title: t('Pierwszy zakup', 'First purchase'), rows: data.affinity.newProducts }, { title: t('Kolejne zakupy', 'Repeat purchases'), rows: data.affinity.returningProducts }]).map(group => <div key={group.title}><h3>{group.title}</h3><table className="pd-product-data__table"><thead><tr><th>{t('Produkt', 'Product')}</th><th>{t('Zamówienia', 'Orders')}</th><th>{t('Przychód', 'Revenue')}</th></tr></thead><tbody>{group.rows.map(row => <tr key={row.name}><th scope="row">{row.name}</th><td>{n(row.orders)}</td><td>{money(row.revenue)}</td></tr>)}</tbody></table>{group.rows.length === 0 && <p>{t('Brak pozycji zamówień w tym zakresie.', 'No order-line data in this range.')}</p>}</div>)}</div>
          </ProductSectionFrame>
        </>}
      </>}
    </ProductDataState>
        {view === 'explorer' && <ProductDataState state={state} problem={problem} onRetry={onReload}><ProductSectionFrame icon="search" title={t('Eksplorator klientów', 'Customer explorer')} description={t('Filtry i sortowanie dotyczą pełnego portfela; tabela jest stronicowana przez API.', 'Filters and sorting apply to the whole portfolio; the API paginates the table.')}>
          <div className="pd-product-data__toolbar">
            <label>{t('Segment', 'Segment')}<select value={segment} onChange={event => changeFilter({ customerSegment: event.target.value })}><option value="">{t('Wszystkie', 'All')}</option>{Object.entries(segmentKeys).map(([label, value]) => <option key={value} value={value}>{segmentName(label)}</option>)}</select></label>
            <label>{t('Ryzyko', 'Risk')}<select value={risk} onChange={event => changeFilter({ customerRisk: event.target.value })}><option value="">{t('Wszystkie', 'All')}</option><option value="at_risk">{t('W ryzyku', 'At risk')}</option><option value="lapsed">{t('Nieaktywni', 'Lapsed')}</option><option value="active">{t('Pozostali', 'Other')}</option></select></label>
            <Button size="small" variant="ghost" onClick={() => changeFilter({ customerSegment: null, customerRisk: null, customerSearch: null })}>{t('Wyczyść filtry', 'Clear filters')}</Button>
          </div>
          {exportProblem && <p role="alert">{exportProblem}</p>}
          <ExplorerTable<Row> ariaLabel={t('Klienci', 'Customers')} columns={columns} rows={rows} canExport={demo || Boolean(onExport)} exportPending={exportBusy} exportFormats={onExport ? ['csv'] : ['csv','pdf']} onExport={onExport ? (_format, context) => void onExport(context) : undefined}
            loading={state === 'loading'} manualSearch={!demo} manualSorting={!demo} searchText={row => row.customerPseudonym} searchQuery={search}
            onSearchQueryChange={customerSearch => changeFilter({ customerSearch })} searchPlaceholder={t('Pseudonim klienta', 'Customer pseudonym')}
            sortState={demo ? undefined : { columnId: sortId, direction: sortDirection }}
            onSortStateChange={sort => changeFilter({ customerSort: sort.columnId, customerDirection: sort.direction })}
            collapsedRowCount={50} pageSize={50} />
          <div className="pd-product-data__toolbar"><p>{t('Wyniki filtra', 'Filtered results')}: {n(demo ? rows.length : data?.pageInfo.total)} · {t('na stronie', 'on this page')}: {n(rows.length)}</p>
            <div>{params.has('customerCursor') && <Button size="small" variant="ghost" onClick={() => update({ customerCursor: null })}>{t('Pierwsza strona', 'First page')}</Button>}
              {data?.pageInfo.nextCursor && <Button size="small" variant="secondary" onClick={() => update({ customerCursor: data?.pageInfo.nextCursor ?? null, customerId: null })}>{t('Następna strona', 'Next page')}</Button>}</div></div>
        </ProductSectionFrame></ProductDataState>}
    <Drawer open={Boolean(selectedId)} dismissible side="right" width={480} title={t('Szczegóły klienta', 'Customer detail')} description={selectedId} onOpenChange={open => { if (!open) update({ customerId: null }); }}>
      <ProductDataState state={!canReadDetail ? 'forbidden' : detailState==='ready'&&!selected?'empty':detailState} problem={detailProblem}>{selected && <>
        <dl className="pd-product-data__facts"><div><dt>{t('Pseudonim', 'Pseudonym')}</dt><dd>{selected.customerPseudonym}</dd></div><div><dt>{t('Segment', 'Segment')}</dt><dd>{segmentName(selected.segmentLabel)} · RFM {selected.rfmScore}</dd></div>
          <div><dt>{t('Dni od zakupu na dzień stanu', 'Days since purchase as of snapshot')}</dt><dd>{n(selected.recencyDays)}</dd></div><div><dt>{t('Wartość historyczna', 'Historical value')}</dt><dd>{money(selected.ltv)}</dd></div>
          <div><dt>{t('Przychód okresu', 'Period revenue')}</dt><dd>{money(selected.revenue)}</dd></div><div><dt>{t('Zgody marketingowe', 'Marketing consent')}</dt><dd>{t('Nieznane — nie jest to zgoda na kontakt.', 'Unknown — this is not consent to contact.')}</dd></div></dl>
        <p>{t('Nie wyświetlamy danych identyfikujących. Połączenie tożsamości wymaga osobnej, audytowanej procedury.', 'Identifying data is not displayed. Identity merging requires a separate audited procedure.')}</p>
        <Button variant="secondary" onClick={() => navigate(retentionLink)}>{t('Przejdź do Decyzji z kontekstem', 'Open Decisions with context')}</Button>
        <Button variant="ghost" onClick={() => navigate(contextualProductLink(productRoutes.help, { topic: 'customer-identity', customerId: selected.customerPseudonym }))}>{t('Zgłoś problem tożsamości', 'Report an identity issue')}</Button>
      </>}</ProductDataState>
    </Drawer>
  </div>;
}
