import { useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { growthMeasures, growthMetricIds, growthDayCount, growthDateShift, sortGrowthRows, type GrowthCampaign, type GrowthPortfolio } from '@papadata/contracts/campaign-growth';
import { Button, Drawer, ExplorerTable } from '../../../design-system';
import type { ExplorerTableColumn } from '../../../design-system/components/Domain/ExplorerTable/ExplorerTable';
import { useAssistantAnalysisContext } from '../../../runtime/shell/papa-assistant/useAssistantAnalysisContext';
import { useProductQuery, contextualProductLink, productRoutes } from '../../../runtime/app/routing/productRoutes';
import { useShellNavigate } from '../../../runtime/shell/app-shell/ShellNavigationContext';
import type { RemoteState } from '../../../runtime/shared/data/useRemoteResource';
import { DataProvenance, MetricSummary, ProductDataState, ProductViewNav } from '../../shared/ProductDataState';
import { ProductDateControl } from '../../shared/ProductDateControl';
import { useProductLocale } from '../../shared/useProductLocale';
import { growthLabels, growthMetric, growthMoney } from './growthPresentation';
import { GrowthAttribution } from './GrowthAttribution';
import { GrowthCreatives, type GrowthExport } from './GrowthCreatives';
import { GrowthBudget, type SaveGrowthPlan } from './GrowthBudget';
import './campaign-growth.css';
export type CampaignGrowthScreenProps = {
    readonly data: GrowthPortfolio | null;
    readonly state: RemoteState;
    readonly problem?: string | null;
    readonly onReload?: () => void;
    readonly onSavePlan?: SaveGrowthPlan;
    readonly onExport?: GrowthExport;
    readonly exportBusy?: boolean;
    readonly exportProblem?: string | null;
    readonly demo?: boolean;
    readonly initialView?: 'wynik' | 'kampanie' | 'atrybucja' | 'kreacje' | 'budzet';
};
export function CampaignGrowthScreen({ data, state, problem, onReload, onSavePlan, onExport, exportBusy, exportProblem, demo = false, initialView = 'wynik' }: CampaignGrowthScreenProps) {
    const navigate = useShellNavigate();
    const { t, language } = useProductLocale(), { params, update, location } = useProductQuery();
    const views = [{ id: 'wynik', label: t('Wynik', 'Overview') }, { id: 'kampanie', label: t('Kampanie', 'Campaigns') }, { id: 'atrybucja', label: t('Atrybucja', 'Attribution') }, { id: 'kreacje', label: t('Kreacje', 'Creatives') }, { id: 'budzet', label: t('Budżet', 'Budget') }];
    const aliasView = location.split('?')[0]?.endsWith('/budzet') ? 'budzet' : location.split('?')[0]?.endsWith('/kreacje') ? 'kreacje' : location.split('?')[0]?.endsWith('/atrybucja-i-sprzedaz') ? 'atrybucja' : initialView;
    const view = views.find(item => item.id === params.get('campaignView'))?.id ?? aliasView;
    const [evidence, setEvidence] = useState<{
        title: string;
        ids: readonly string[];
    } | null>(null);
    const currency = data?.scope.currency ?? (data?.choices.currencies.length === 1 ? data.choices.currencies[0]! : null);
    const metrics = currency && data ? growthMeasures(data.observations.filter(row => row.currency === currency)) : null;
    useAssistantAnalysisContext({ title: t('Kampanie płatne', 'Paid campaigns'), route: productRoutes.campaigns,
        readiness: state === 'ready' ? (data?.scope.readiness === 'empty' ? 'empty' : data?.scope.readiness ?? 'partial') : state === 'forbidden' ? 'blocked' : state === 'offline' ? 'error' : state,
        source: demo ? t('Demonstracja', 'Demonstration') : t('Raporty dostawców reklam; bez deduplikacji atrybucji', 'Advertising provider reports; attribution is not deduplicated'),
        metrics: metrics ? { spend: metrics.spend, revenue: metrics.revenue, ROAS: metrics.roas } : {}, filters: { view, currency: currency ?? 'mixed', channel: params.get('channel') ?? 'all', campaignId: params.get('campaignId') ?? 'all' }, tables: ['campaigns', 'creatives', 'attribution'], charts: ['reported spend and value'] });
    const activeCampaign = data?.campaigns.find(row => row.id === params.get('campaignDetail'));
    const search = params.get('campaignSearch') ?? '', sort = params.get('campaignSort') ?? 'spend', direction = params.get('campaignDirection') === 'asc' ? 'asc' : 'desc';
    const rows = data ? sortGrowthRows(data.campaigns.filter(row => !search || `${row.name} ${row.campaignId}`.toLowerCase().includes(search.toLowerCase())), { sort, direction }) : [];
    const columns: readonly ExplorerTableColumn<GrowthCampaign>[] = [{ id: 'name', label: t('Kampania', 'Campaign'), required: true, sortAccessor: row => row.name, render: row => <Button variant="ghost" size="small" onClick={() => update({ campaignDetail: row.id })}>{row.name}</Button> }, { id: 'provider', label: t('Kanał', 'Channel') }, { id: 'currency', label: t('Waluta', 'Currency'), required: true }, ...growthMetricIds.map(id => ({ id, label: t(...growthLabels[id]), align: 'right' as const, sortAccessor: (row: GrowthCampaign) => row[id], render: (row: GrowthCampaign) => growthMetric(row[id], id, row.currency, language) }))];
    const dayBuckets = new Map<string, GrowthPortfolio['observations']>();
    for (const row of data?.observations ?? [])
        if (row.currency === currency)
            dayBuckets.set(row.date, [...(dayBuckets.get(row.date) ?? []), row]);
    const points = data ? Array.from({ length: Math.max(0, Math.min(366, growthDayCount(data.scope.from, data.scope.to))) }, (_, i) => { const date = growthDateShift(data.scope.from, i); return { date, ...growthMeasures(dayBuckets.get(date) ?? []) }; }) : [];
    const displayState = state === 'ready' && data ? (data.scope.readiness === 'empty' ? 'partial' : data.scope.readiness) : state;
    const openEvidence = (title: string, ids: readonly string[]) => setEvidence({ title, ids });
    return <div className="pd-product-data pd-growth" data-testid="campaign-growth-screen">
    <header className="pd-growth__header"><div><p className="pd-growth__eyebrow">{t('Marketing / wyniki', 'Marketing / performance')}</p><h1>{t('Kampanie płatne', 'Paid campaigns')}</h1><p>{t('Wynik, wiarygodność pomiaru i kontrola planu.', 'Performance, measurement confidence and plan control.')}</p></div><div className="pd-product-data__toolbar"><ProductDateControl label={t('Okres kampanii', 'Campaign period')} allowFuture={view === 'budzet'} clearParams={['creativeId', 'campaignDetail']}/><Button variant="secondary" size="small" onClick={onReload} disabled={state === 'loading'}>{t('Odśwież dane', 'Refresh data')}</Button></div></header>
    <ProductViewNav label={t('Widoki kampanii', 'Campaign views')} active={view} items={views} onChange={id => update({ campaignView: id, creativeId: null, campaignDetail: null })}/>
    <div className="pd-product-data__toolbar pd-growth__scope">
      <label>{t('Kanał', 'Channel')}<select value={params.get('channel') ?? 'all'} onChange={e => update({ channel: e.target.value, campaignId: null, budgetCampaign: null, creativeId: null })}><option value="all">{t('Wszystkie', 'All')}</option><option value="google_ads">Google Ads</option><option value="meta_ads">Meta Ads</option></select></label>
      <label>{t('Kampania', 'Campaign')}<select value={params.get('campaignId') ?? ''} onChange={e => update({ campaignId: e.target.value, budgetCampaign: null, creativeId: null })}><option value="">{t('Wszystkie', 'All')}</option>{data?.choices.campaigns.filter(row => !params.get('channel') || params.get('channel') === 'all' || row.provider === params.get('channel')).map(row => <option key={row.id} value={row.id}>{row.name} ({row.currency})</option>)}</select></label>
      <label>{t('Waluta', 'Currency')}<select value={params.get('currency') ?? ''} onChange={e => update({ currency: e.target.value, campaignId: null, budgetCampaign: null, creativeId: null })}><option value="">{t('Każda osobno', 'Each separately')}</option>{data?.choices.currencies.map(value => <option key={value}>{value}</option>)}</select></label>
      <Button variant="ghost" size="small" onClick={() => navigate(contextualProductLink('/app/campaigns/przeglad'))}>{t('Dotychczasowa analiza główna', 'Existing main analysis')}</Button>
      <Button variant="ghost" size="small" onClick={() => navigate(contextualProductLink(productRoutes.assistant))}>{t('Analizuj z Papa', 'Analyze with Papa')}</Button>
      <Button variant="ghost" size="small" onClick={() => navigate(contextualProductLink(productRoutes.reports, { reportTemplate: 'campaigns' }))}>{t('Przygotuj raport', 'Prepare report')}</Button>
    </div>
    {exportProblem && <p role="alert">{exportProblem}</p>}
    {params.get("campaignDetail") && state !== "loading" && !activeCampaign && <p className="pd-product-data__notice" role="status">{t("Wybrana kampania nie jest dostępna w bieżącym zakresie.", "The selected campaign is unavailable in the current scope.")} <Button size="small" variant="ghost" onClick={() => update({ campaignDetail: null })}>{t("Zamknij szczegóły", "Close details")}</Button></p>}
    <ProductDataState state={displayState} problem={problem ?? (data?.scope.readiness === 'empty' ? t('Nie ma obserwacji w tym zakresie. Brak danych nie oznacza zerowych wydatków.', 'No observations in this range. Missing data does not imply zero spending.') : undefined)} onRetry={onReload}>
      {data && <><DataProvenance source={t('Połączone konta reklamowe / GA4 / sklep', 'Connected ad accounts / GA4 / store')} synchronizedAt={data.scope.synchronizedAt} calculatedAt={data.scope.calculatedAt} demo={demo} limitations={data.limitations.map(item => t(item.pl, item.en))}/>
      {(view === 'wynik' || view === 'kampanie') && <>
        {view === 'wynik' && <section className="pd-product-data__section"><h2>{t('Wynik raportowany', 'Reported performance')}</h2>{!currency && <p className="pd-product-data__notice">{t('Wybierz walutę dla KPI i trendu. Sumowanie walut jest wyłączone.', 'Select a currency for KPIs and trend. Cross-currency totals are disabled.')}</p>}<dl className="pd-product-data__metrics">{(['spend', 'revenue', 'roas', 'cpa'] as const).map(id => <MetricSummary key={id} label={t(...growthLabels[id])} value={growthMetric(metrics?.[id] ?? null, id, currency, language)} description={id === 'revenue' ? t('Wartość wg dostawców, nie uzgodniona sprzedaż sklepu', 'Provider-reported value, not reconciled store sales') : t('Wybrany zakres i waluta', 'Selected period and currency')}/>)}</dl>
        {currency && <><div className="pd-product-data__chart" role="img" aria-label={t('Trend kampanii; tabela danych poniżej', 'Campaign trend; data table below')}><ResponsiveContainer width="100%" height="100%"><LineChart data={points}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis /><Tooltip /><Line type="monotone" dataKey="spend" name={t('Wydatki', 'Spend')} stroke="var(--pd-growth-accent)" dot={false} connectNulls={false}/><Line type="monotone" dataKey="revenue" name={t('Wartość raportowana', 'Reported value')} stroke="var(--pd-growth-secondary)" dot={false} connectNulls={false}/></LineChart></ResponsiveContainer></div><details><summary>{t('Tabela trendu', 'Trend table')}</summary><div className="pd-product-data__table-wrap"><table><thead><tr><th>{t('Data', 'Date')}</th><th>{t('Wydatek', 'Spend')}</th><th>{t('Wartość', 'Value')}</th></tr></thead><tbody>{points.map(point => <tr key={point.date}><th scope="row">{point.date}</th><td>{growthMoney(point.spend, currency, language)}</td><td>{growthMoney(point.revenue, currency, language)}</td></tr>)}</tbody></table></div></details></>}</section>}
        <section className="pd-product-data__section"><h2>{t('Kampanie w zakresie', 'Campaigns in scope')}</h2><ExplorerTable ariaLabel={t('Wyniki kampanii', 'Campaign performance')} rows={rows} columns={columns} manualSearch manualSorting searchQuery={search} onSearchQueryChange={value => update({ campaignSearch: value })} sortState={{ columnId: sort, direction }} onSortStateChange={next => update({ campaignSort: next.columnId, campaignDirection: next.direction })} canExport={Boolean(onExport)} onExport={(_, context) => onExport?.('campaigns', context)} exportFormats={['csv']} exportPending={exportBusy} collapsedRowCount={10}/></section>
      </>}
      {view === 'atrybucja' && <GrowthAttribution data={data} onEvidence={openEvidence}/>}
      {view === 'kreacje' && <GrowthCreatives data={data} onExport={onExport} exportBusy={exportBusy} onEvidence={openEvidence}/>}
      {view === 'budzet' && <GrowthBudget data={data} onSave={onSavePlan} onReload={onReload}/>}
      </>}
    </ProductDataState>
    <Drawer open={Boolean(activeCampaign)} title={activeCampaign?.name ?? t('Kampania', 'Campaign')} description={activeCampaign?.provider ?? null} dismissible side="right" width={640} onOpenChange={open => {
            if (!open)
                update({ campaignDetail: null });
        }}>{activeCampaign && <><dl>{growthMetricIds.map(id => <div key={id}><dt>{t(...growthLabels[id])}</dt><dd>{growthMetric(activeCampaign[id], id, activeCampaign.currency, language)}</dd></div>)}</dl><div className="pd-product-data__toolbar"><Button onClick={() => update({ campaignId: activeCampaign.id, campaignView: 'kreacje', campaignDetail: null })}>{t('Kreacje kampanii', 'Campaign creatives')}</Button><Button variant="secondary" onClick={() => { update({ campaignDetail: null }); openEvidence(activeCampaign.name, activeCampaign.evidenceIds); }}>{t('Dowody', 'Evidence')}</Button></div></>}</Drawer>
    <Drawer open={Boolean(evidence)} title={evidence?.title ?? t('Dowody', 'Evidence')} description={t('Identyfikatory zaimportowanych rekordów, bez tokenów dostawców.', 'Imported record identifiers, without provider tokens.')} dismissible side="right" width={640} onOpenChange={open => {
            if (!open)
                setEvidence(null);
        }}><p>{t('Do 50 przykładowych rekordów pochodzenia, nie komplet danych do audytu.', 'Up to 50 provenance sample records, not a complete audit dataset.')}</p>{evidence?.ids.length ? <ul>{evidence.ids.map(id => <li key={id}><code>{id}</code></li>)}</ul> : <p>{t('Brak identyfikatorów dowodów.', 'No evidence identifiers available.')}</p>}<Button variant="secondary" onClick={() => navigate(contextualProductLink(productRoutes.integrations))}>{t('Sprawdź źródła', 'Inspect sources')}</Button></Drawer>
  </div>;
}
