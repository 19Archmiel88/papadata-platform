import { filterTrafficRows } from '@papadata/contracts';
import { TrafficMeasurementComparison, TrafficEventDetails } from './TrafficMeasurement';
import type { AnalyticsExportContext } from '../../runtime/shared/data/useAnalyticsExport';
import type { TrafficPortfolio, TrafficDimensionRow, TrafficAmount } from '@papadata/contracts';
import { Button, Drawer, ExplorerTable, ProductSectionFrame, type ExplorerTableColumn } from '../../design-system';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { contextualProductLink, productRoutes, useProductQuery } from '../../runtime/app/routing/productRoutes';
import { useAssistantAnalysisContext } from '../../runtime/shell/papa-assistant/useAssistantAnalysisContext';
import type { RemoteState } from '../../runtime/shared/data/useRemoteResource';
import { DataProvenance, ProductDataState, ProductViewNav } from '../shared/ProductDataState';
import { AnalysisScope } from '../shared/AnalysisScope';
import { ProductDateControl } from '../shared/ProductDateControl';
import { TrafficOverview, trafficRangeLabel } from './TrafficOverview';
import './traffic-portfolio.css';
import { formatProductMoney, useProductLocale } from '../shared/useProductLocale';

type View = 'overview' | 'channels' | 'landingPages' | 'devices' | 'countries' | 'funnel' | 'quality';
export type TrafficPortfolioViewProps = {
  readonly data?: TrafficPortfolio | null; readonly state?: RemoteState; readonly problem?: string | null;
  readonly demo?: boolean; readonly onReload?: () => void;
  readonly onExport?: (view: string, context: AnalyticsExportContext) => Promise<void>; readonly exportBusy?: boolean; readonly exportProblem?: string | null;
};
export function TrafficPortfolioView({ data = null, state = data ? 'ready' : 'loading', problem, demo = false, onReload, onExport, exportBusy, exportProblem }: TrafficPortfolioViewProps) {
  const { params, update, location } = useProductQuery();
  const { dateRange } = useShellDateRange();
  const navigate = useShellNavigate();
  const { t, language } = useProductLocale();
  const paths: Record<string, View> = { kanaly: 'channels', 'strony-wejscia': 'landingPages', 'lejek-widok': 'funnel', 'lejek-szczegoly-kroku': 'funnel', 'definicje-lejka': 'funnel', 'jakosc-zdarzen': 'quality', 'ga4-vs-zamowienia': 'funnel' };
  const requested = params.get('trafficView') ?? paths[location.split('?')[0]?.split('/').at(-1) ?? ''];
  const view: View = ['channels','landingPages','devices','countries','funnel','quality'].includes(requested ?? '') ? requested as View : 'overview';
  const search = params.get('trafficSearch') ?? '';
  const channel = params.get('channel') ?? '', device = params.get('device') ?? '', country = params.get('country') ?? '';
  const changeFilter = (values: Readonly<Record<string, string | null>>) => update({ ...values, trafficId: null, trafficDetail: null, trafficEvent: null });
  const current = data?.current;
  const n = (value: number | null | undefined) => value == null ? '—' : new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(value);
  const pct = (value: number | null | undefined) => value == null ? '—' : new Intl.NumberFormat(language, { style: 'percent', maximumFractionDigits: 1 }).format(value);
  const money = (values: readonly TrafficAmount[] | undefined) => values?.length ? values.map(value => formatProductMoney(value, language)).join(' / ') : '—';
  const choices = (items: readonly string[] | undefined, selected: string) => [...new Set([...(items ?? []), ...(selected ? [selected] : [])])];
  const showDetail = (kind: string, row: TrafficDimensionRow) => update({ trafficDetail: kind, trafficId: row.id });
  const columns = (kind: string): readonly ExplorerTableColumn<TrafficDimensionRow>[] => [
    { id: 'label', label: t('Wymiar', 'Dimension'), required: true, render: row => <Button variant="ghost" size="small" onClick={() => showDetail(kind,row)}>{row.label}</Button>, csvValue: row => row.label, sortAccessor: row => row.label },
    { id: 'sessions', label: t('Sesje', 'Sessions'), align: 'right', render: row => n(row.sessions), csvValue: row => row.sessions ?? '', sortAccessor: row => row.sessions ?? -1 },
    { id: 'transactions', label: t('Transakcje GA4', 'GA4 transactions'), align: 'right', render: row => n(row.transactions), csvValue: row => row.transactions ?? '', sortAccessor: row => row.transactions ?? -1 },
    { id: 'purchasePerSession', label: t('Zakupy / sesja', 'Purchases / session'), align: 'right', render: row => pct(row.purchasePerSession), csvValue: row => row.purchasePerSession ?? '', sortAccessor: row => row.purchasePerSession ?? -1 },
    { id: 'engagementRate', label: t('Zaangażowanie', 'Engagement rate'), align: 'right', render: row => pct(row.engagementRate), csvValue: row => row.engagementRate ?? '', sortAccessor: row => row.engagementRate ?? -1 },
    { id: 'revenue', label: t('Przychód GA4', 'GA4 revenue'), align: 'right', render: row => money(row.revenue), csvValue: row => money(row.revenue) },
  ];
  const table = (kind: string, title: string, rows: readonly TrafficDimensionRow[]) => <ExplorerTable<TrafficDimensionRow> ariaLabel={title} columns={columns(kind)} rows={filterTrafficRows(rows,search,params.get('trafficSort'),params.get('trafficDirection'))} manualSearch manualSorting
    sortState={{columnId:params.get('trafficSort')??'sessions',direction:params.get('trafficDirection')==='asc'?'asc':'desc'}} onSortStateChange={sort=>update({trafficSort:sort.columnId,trafficDirection:sort.direction})}
    searchQuery={search} onSearchQueryChange={trafficSearch => update({ trafficSearch })} searchText={row => row.label} searchLabel={t('Szukaj', 'Search')}
    searchPlaceholder={t('Filtruj widoczną tabelę', 'Filter the visible table')} collapsedRowCount={10} pageSize={25} canExport={demo || Boolean(onExport)} exportPending={exportBusy} exportFormats={onExport ? ['csv'] : ['csv','pdf']} onExport={onExport ? (_format,context) => void onExport(kind,context) : undefined}
    emptyTitle={t('Brak rekordów', 'No records')} emptyMessage={t('Sprawdź filtry i zakres synchronizacji.', 'Check filters and synchronization coverage.')} />;
  const selectedKind = params.get('trafficDetail'), selectedId = params.get('trafficId');
  const detailRows = selectedKind === 'channels' ? current?.channels : selectedKind === 'landingPages' ? current?.landingPages : selectedKind === 'devices' ? current?.devices : selectedKind === 'countries' ? current?.countries : selectedKind === 'trend' ? current?.trend : [];
  const selected = detailRows?.find(row => row.id === selectedId);
  const metrics = current?.metrics;
  useAssistantAnalysisContext({ title: t('Ruch na stronie', 'Website traffic'), route: '/app/traffic', readiness: state === 'ready' ? 'partial' : state,
    source: demo ? t('Dane demonstracyjne', 'Demonstration data') : 'GA4',
    metrics: { [t('Sesje', 'Sessions')]: metrics?.sessions, [t('Transakcje GA4', 'GA4 transactions')]: metrics?.transactions, [t('Przychód GA4', 'GA4 revenue')]: metrics ? money(metrics.revenue) : null },
    filters: { [t('Kanał', 'Channel')]: channel || t('Wszystkie', 'All'), [t('Urządzenie', 'Device')]: device || t('Wszystkie', 'All'), [t('Kraj', 'Country')]: country || t('Wszystkie', 'All'), [t('Okres', 'Period')]: `${dateRange.from} - ${dateRange.to}` },
    charts: [t('Trend sesji', 'Session trend')], tables: [t('Kanały', 'Channels'), t('Strony wejścia', 'Landing pages'), t('Zdarzenia', 'Events')] });
  return <div className="pd-product-data pd-traffic-portfolio" data-testid="traffic-bi-page">
    <header className="pd-product-data__head"><div><h1>{t('Ruch na stronie', 'Website traffic')}</h1><p>{t('Od pozyskania do zakupu, z jawnym zakresem pomiaru i ograniczeniami.', 'From acquisition to purchase, with explicit measurement scope and limitations.')}</p></div>
      <div className="pd-product-data__toolbar"><ProductDateControl displayLabel={trafficRangeLabel(dateRange, language)} label={t('Okres ruchu', 'Traffic period')} clearParams={['trafficId','trafficDetail']} />{onReload && <Button variant="secondary" size="small" disabled={state === 'loading'} onClick={onReload}>{t('Odczytaj ponownie', 'Reload data')}</Button>}</div></header>
    <ProductViewNav label={t('Widoki Ruchu', 'Traffic views')} active={view} onChange={trafficView => update({ trafficView, trafficSearch: null, trafficId:null,trafficDetail:null,trafficEvent:null })} items={[
      { id: 'overview', label: t('Wynik', 'Overview') }, { id: 'channels', label: t('Kanały', 'Channels') }, { id: 'landingPages', label: t('Strony wejścia', 'Landing pages') },
      { id: 'devices', label: t('Urządzenia', 'Devices') }, { id: 'countries', label: t('Geografia', 'Geography') }, { id: 'funnel', label: t('Lejek i zamówienia', 'Funnel and orders') }, { id: 'quality', label: t('Jakość pomiaru', 'Measurement quality') }]} />
    <AnalysisScope summary={[
      data?.choices.sources?.find(source => source.id === params.get('sourceId'))?.label ?? (params.get('sourceId') ? t('Wybrane źródło GA4', 'Selected GA4 source') : t('Wszystkie usługi GA4', 'All GA4 properties')),
      channel || t('Wszystkie kanały', 'All channels'), device, country,
      params.get('compare') === 'previous' ? t('Porównanie z poprzednim okresem', 'Previous period comparison') : null,
    ].filter(Boolean).join(' · ')}>
      <label>{t('Usługa GA4','GA4 property')}<select value={params.get('sourceId')??''} onChange={e=>changeFilter({sourceId:e.target.value,channel:null,device:null,country:null})}><option value="">{t('Wszystkie połączenia','All connections')}</option>{data?.choices.sources?.map(source=><option key={source.id} value={source.id}>{source.label}</option>)}</select></label>
      <label>{t('Kanał', 'Channel')}<select value={channel} onChange={event => changeFilter({ channel: event.target.value })}><option value="">{t('Wszystkie', 'All')}</option>{choices(data?.choices.channels, channel).map(item => <option key={item}>{item}</option>)}</select></label>
      <label>{t('Urządzenie', 'Device')}<select value={device} onChange={event => changeFilter({ device: event.target.value })}><option value="">{t('Wszystkie', 'All')}</option>{choices(data?.choices.devices, device).map(item => <option key={item}>{item}</option>)}</select></label>
      <label>{t('Kraj', 'Country')}<select value={country} onChange={event => changeFilter({ country: event.target.value })}><option value="">{t('Wszystkie', 'All')}</option>{choices(data?.choices.countries,country).map(item => <option key={item}>{item}</option>)}</select></label>
      <label>{t('Porównanie', 'Comparison')}<select value={params.get('compare') === 'previous' ? 'previous' : ''} onChange={event => changeFilter({ compare: event.target.value })}><option value="">{t('Bez porównania', 'No comparison')}</option><option value="previous">{t('Poprzedni równy okres', 'Previous equal period')}</option></select></label>
      <Button variant="ghost" size="small" onClick={() => changeFilter({ channel: null, device: null, country: null, sourceId:null, compare:null, trafficSearch: null })}>{t('Wyczyść filtry', 'Clear filters')}</Button>
    </AnalysisScope>
    {exportProblem && <p role="alert">{exportProblem}</p>}
    <ProductDataState state={state} problem={problem} onRetry={onReload}>{data && current && <>
      <p className="pd-traffic-portfolio__context">
        {demo ? t('Demo', 'Demo') : t('Dane', 'Data')}: {trafficRangeLabel(current, language)} · GA4
        {(current.from !== dateRange.from || current.to !== dateRange.to) && <span data-mismatch role="status">{t('Wybrany zakres różni się od okresu wyświetlonych danych.', 'The selected range differs from the period of the displayed data.')}</span>}
      </p>
      {view !== 'quality' && data.findings.some(item => item.severity !== 'info') && <div className="pd-traffic-portfolio__quality-notice" role="status">
        <span>{t('Pomiar wymaga uwagi', 'Measurement needs attention')} · {data.findings.filter(item => item.severity !== 'info').length}</span>
        <Button variant="ghost" size="small" onClick={() => update({trafficView:'quality',trafficId:null,trafficDetail:null})}>{t('Sprawdź jakość pomiaru', 'Review measurement quality')}</Button>
      </div>}
      {view === 'overview' && <TrafficOverview current={current} previous={data.previous}
        trendTable={table('trend', t('Dane trendu', 'Trend data'), current.trend)}
        onChannel={row => showDetail('channels', row)}
        onChannels={() => update({ trafficView: 'channels', trafficSearch: null, trafficId: null, trafficDetail: null, trafficEvent: null })} />}
      {(view === 'channels' || view === 'landingPages') && <ProductSectionFrame icon="data" title={view === 'channels' ? t('Kanały pozyskania','Acquisition channels') : t('Strony wejścia','Landing pages')} description={t('Filtry globalne dotyczą tego samego okresu. Wyszukiwanie ogranicza widoczną tabelę.', 'Global filters apply to the same period. Search filters the visible table.')}>
        {table(view,view === 'channels' ? t('Kanały','Channels') : t('Strony wejścia','Landing pages'),view === 'channels' ? current.channels : current.landingPages)}
      </ProductSectionFrame>}
      {view === 'devices' && <><ProductSectionFrame icon="data" title={t('Urządzenia','Devices')} description={t('Odrębny przekrój, nie zastępuje go wybór daty.','This is a separate breakdown; selecting dates does not filter devices.')}>{table('devices',t('Urządzenia','Devices'),current.devices)}</ProductSectionFrame></>}
      {view === 'countries' && <><ProductSectionFrame icon="data" title={t('Geografia','Geography')} description={t('Kraj raportowany przez GA4, bez ustalania lokalizacji konkretnej osoby.','Country reported by GA4, not the location of an identified person.')}>{table('countries',t('Kraje','Countries'),current.countries)}</ProductSectionFrame></>}
      {view === 'funnel' && <><ProductSectionFrame icon="trend" title={t('Zdarzenia lejka','Funnel events')} description={t('Niezależne liczniki zdarzeń, nie sekwencyjny lejek osób. Nie mieszamy liczby zdarzeń z liczbą użytkowników.','Independent event counts, not a sequential people funnel. Event and user counts are not mixed.')}>
        <div className="pd-product-data__table-scroll"><table className="pd-product-data__table"><thead><tr><th>{t('Zdarzenie','Event')}</th><th>{t('Liczba','Count')}</th><th>{t('Kolejne zdarzenie','Next event')}</th><th>{t('Liczba','Count')}</th><th>{t('Stosunek','Ratio')}</th><th>{t('Różnica','Difference')}</th></tr></thead><tbody>{current.events.map(step => <tr key={step.id}><th scope="row"><Button variant="ghost" size="small" onClick={()=>update({trafficEvent:step.id,trafficId:null,trafficDetail:null})}><code>{step.event}</code></Button></th><td>{n(step.count)}</td><td><code>{step.nextEvent}</code></td><td>{n(step.nextCount)}</td><td>{pct(step.eventRatio)}</td><td>{n(step.difference)}</td></tr>)}</tbody></table></div>
        <p>{t('Brak zdarzenia może oznaczać brak pomiaru. Wartość powyżej 100% pozostaje widoczna jako sygnał diagnostyczny, nie jest przycinana.','A missing event can mean missing measurement. Values above 100% remain visible as diagnostics, rather than being clamped.')}</p>
        <Button variant="secondary" onClick={() => navigate(contextualProductLink(productRoutes.help,{topic:'ga4-funnel-definitions'}))}>{t('Definicje i naprawa pomiaru','Definitions and measurement repair')}</Button>
      </ProductSectionFrame><ProductSectionFrame icon="data" title={t('GA4 a zamówienia','GA4 versus orders')} description={t('GA4 ma filtry ruchu; zamówienia są pokazane dla całego okresu i osobno dla każdego połączenia. To porównanie populacji, nie uzgodnione przypisanie transakcji.','GA4 uses traffic filters; orders cover the full period and each connection separately. This compares populations, not reconciled transaction attribution.')}>
        <TrafficMeasurementComparison data={data}/>
      </ProductSectionFrame></>}
      {view === 'quality' && <ProductSectionFrame icon="warning" title={t('Jakość i backlog pomiaru','Measurement quality and backlog')} description={t('Faktyczne ograniczenia danych. Otwórz pomoc, integrację lub decyzję z zachowanym kontekstem.','Actual data limitations. Open help, an integration or a decision with the same context.')}>
        <div className="pd-product-data__stack">{data.findings.map(item => <article key={item.id}><h3><code>{item.id}</code></h3><p>{t(item.messagePl,item.messageEn)}</p><Button variant="secondary" size="small" onClick={() => navigate(contextualProductLink(productRoutes[item.target],{ topic: item.id, source: 'traffic' }))}>{t('Przejdź do rozwiązania','Open resolution')}</Button></article>)}</div>
      </ProductSectionFrame>}
      <DataProvenance source="Google Analytics 4" demo={demo} synchronizedAt={data.scope.synchronizedAt} calculatedAt={data.scope.calculatedAt}
        limitations={[...(demo ? [t('Dane przykładowe; zmiany dat i filtrów nie przeliczają tego scenariusza.', 'Demonstration data; changing dates and filters does not recalculate this scenario.')] : []), t(`Strefy GA4: ${data.scope.propertyTimezones.join(', ') || '?'}. Strefa workspace: ${data.scope.timezone}.`, `GA4 timezones: ${data.scope.propertyTimezones.join(', ') || '?'}. Workspace timezone: ${data.scope.timezone}.`),
          t('Odczyt API nie wywołuje synchronizacji u dostawcy. Dodatkowe przekroje mogą mieć krótszą historię niż raport zbiorczy.', 'Reading the API does not synchronize the provider. Additional breakdowns may have less history than the aggregate report.')]} />
    </>}</ProductDataState>
    {data&&<TrafficEventDetails data={data}/>}
    <Drawer open={Boolean(selectedId)} dismissible side="right" width={480} title={t('Szczegóły przekroju','Breakdown detail')} description={selectedId} onOpenChange={open => { if(!open) update({trafficId:null,trafficDetail:null}); }}>
      <ProductDataState state={state === 'ready' && !selected ? 'empty' : state} problem={problem}>{selected && <><h3>{selected.label}</h3><dl className="pd-product-data__facts"><div><dt>{t('Sesje','Sessions')}</dt><dd>{n(selected.sessions)}</dd></div><div><dt>{t('Transakcje','Transactions')}</dt><dd>{n(selected.transactions)}</dd></div><div><dt>{t('Przychód','Revenue')}</dt><dd>{money(selected.revenue)}</dd></div><div><dt>{t('Rekordy źródłowe','Source records')}</dt><dd>{selected.sourceRows}</dd></div></dl>
        <Button variant="secondary" onClick={() => navigate(contextualProductLink(productRoutes.decisions,{ domain:'traffic', intent:'measurement', trafficId:selected.id, trafficDetail:selectedKind }))}>{t('Przygotuj decyzję z kontekstem','Prepare a contextual decision')}</Button></>}</ProductDataState>
    </Drawer>
  </div>;
}
