import { useState } from 'react';
import { businessChange, type BusinessMetricId, type BusinessOverview } from '@papadata/contracts';
import { Button, Dialog } from '../../design-system';
import type { RemoteState } from '../../runtime/shared/data/useRemoteResource';
import { useProductQuery, contextualProductLink, productRoutes } from '../../runtime/app/routing/productRoutes';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import { useAssistantAnalysisContext } from '../../runtime/shell/papa-assistant/useAssistantAnalysisContext';
import { MetricSummary, ProductDataState } from '../shared/ProductDataState';
import { useProductLocale } from '../shared/useProductLocale';
import { CommerceScope, commerceSourcePath } from '../commerce/CommerceScope';
import { CommerceTrend } from '../commerce/CommerceTrend';
import { commerceMoney, commerceNumber, commerceState, commerceTimestamp } from '../commerce/commercePresentation';
import './business-overview.css';

export const businessLabels: Record<BusinessMetricId, readonly [string, string]> = {
  gross: ['Brutto kwalifikowane', 'Qualified gross'],
  orders: ['Zamówienia kwalifikowane', 'Qualified orders'],
  refunds: ['Refundacje w okresie', 'Refund flow'],
  afterRefunds: ['Brutto minus refundacje', 'Gross less refund flow'],
  adSpend: ['Koszt reklam workspace', 'Workspace advertising cost'],
  margin: ['Marża biznesowa', 'Business margin'],
};
export type BusinessOverviewProps = {
  readonly data: BusinessOverview | null;
  readonly state: RemoteState;
  readonly problem?: string | null;
  readonly onReload?: () => void;
};

export function BusinessOverviewScreen({ data, state, problem, onReload }: BusinessOverviewProps) {
  const { t, language } = useProductLocale();
  const { params, update } = useProductQuery();
  const navigate = useShellNavigate();
  const [detailId, setDetailId] = useState<BusinessMetricId | null>(null);
  const detail = data?.metrics.find(item => item.id === detailId);
  const metric: BusinessMetricId = Object.keys(businessLabels).includes(params.get('overviewMetric') ?? '')
    ? params.get('overviewMetric') as BusinessMetricId : 'gross';
  const format = (value: number | null | undefined, id: BusinessMetricId) => id === 'orders'
    ? commerceNumber(value, language) : commerceMoney(value, data?.meta.currency, language);
  const date = (value: string) => new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
  const link = (target: string, extras: Record<string, string | null> = {}) => contextualProductLink(target, {
    sourceId: data?.meta.sourceId ?? null, currency: data?.meta.currency ?? null,
    returnTo: commerceSourcePath(data?.meta ?? null), ...extras,
  });
  const missing = data?.metrics.filter(item => item.value === null) ?? [];
  useAssistantAnalysisContext({
    title: 'Centrum Dowodzenia', route: productRoutes.overview,
    readiness: state === 'ready' ? data?.meta.quality ?? 'empty' : state, source: 'business.overview.v1',
    metrics: Object.fromEntries(data?.metrics.map(row => [businessLabels[row.id][0], row.value]) ?? []),
    tables: ['Wynik bieżący i poprzedni'], charts: ['Trend wyniku'],
  });

  return <div className="pd-product-data pd-commerce pd-business-overview">
    <CommerceScope title={t('Centrum Dowodzenia', 'Command Center')} description={t('Sprzedaż, trend i decyzje do podjęcia.', 'Sales, trends and decisions to make.')} meta={data?.meta ?? null} onReload={onReload} template="overview"
      summarySuffix={data?.comparisonAllowed ? (params.get('compare') === 'year' ? t('Porównanie: rok wcześniej', 'Compare: year earlier') : t('Porównanie: poprzedni okres', 'Compare: previous period')) : undefined}>
      <label>{t('Porównanie', 'Compare')}<select disabled={!data?.comparisonAllowed} value={params.get('compare') === 'year' ? 'year' : 'previous'} onChange={event => update({ compare: event.target.value })}>
        <option value="previous">{t('Poprzedni okres', 'Previous period')}</option>
        <option value="year">{t('Rok wcześniej', 'Year earlier')}</option>
      </select></label>
      {data && !data.comparisonAllowed && <span role="status">{t('Brak uprawnienia do porównania.', 'No permission to compare.')}</span>}
    </CommerceScope>
    <ProductDataState state={commerceState(data?.meta, state)} onRetry={onReload}
      problem={problem ?? (data?.meta.quality === 'selection_required' ? t('Wybierz jedno źródło sprzedaży.', 'Select one sales source.') : undefined)}
      provenance={data ? {
        source: data.meta.sources.find(s => s.id === data.meta.sourceId)?.name ?? t('Źródło sprzedaży', 'Sales source'),
        synchronizedAt: data.meta.lastSuccessfulSyncAt, calculatedAt: data.meta.generatedAt,
        limitations: data.meta.limitations, demo: data.meta.mode === 'demo',
      } : undefined}>
      {data && <>
        <dl className="pd-product-data__metrics">
          {data.metrics.map(item => {
            const change = data.comparisonAllowed ? businessChange(item.value, item.previous) : null;
            const comparison = change === null ? t('Bez porównania', 'No comparison') : `${change > 0 ? '+' : ''}${commerceNumber(change, language)}% ${t('do poprzedniego zakresu', 'vs comparison period')}`;
            return <MetricSummary key={item.id} label={t(...businessLabels[item.id])} value={format(item.value, item.id)}
              onDetails={() => setDetailId(item.id)} description={item.value === null ? t('Brak danych do wyliczenia', 'Data unavailable') : comparison}/>;
          })}
        </dl>
        <div className="pd-commerce__analysis">
          <CommerceTrend title={t('Trend sprzedaży', 'Sales trend')}
            controls={<label className="pd-business-overview__trend-control"><span>{t('Miara', 'Metric')}</span><select value={metric} onChange={event => update({ overviewMetric: event.target.value })}>
              {Object.entries(businessLabels).map(([id, label]) => <option key={id} value={id}>{t(...label)}</option>)}
            </select></label>}
            description={`${date(data.meta.range.from)} – ${date(data.meta.range.to)}${data.comparisonAllowed ? ` · ${t('porównanie', 'comparison')}: ${date(data.comparison.from)} – ${date(data.comparison.to)}` : ''}`}
            points={data.points.map(row => ({ date: row.date, value: row.values[metric], previous: data.comparisonAllowed ? row.previous[metric] : undefined, previousDate: data.comparisonAllowed ? row.previousDate : undefined }))}
            unit={metric === 'orders' ? t('szt.', 'units') : data.meta.currency ?? t('Waluta nieustalona', 'Currency unavailable')}/>
          <div className="pd-business-overview__aside">
            <aside className="pd-commerce__side">
              <h2>{t('Otwarte decyzje', 'Open decisions')}</h2>
              {data.decisions.status === 'ready' ? data.decisions.records.length ? <ul>
                {data.decisions.records.map(item => <li key={item.id}>
                  <Button variant="ghost" size="small" onClick={() => navigate(link(productRoutes.decisions, { decisionId: item.id }))}>{item.title}</Button>
                  <small>{item.owner ?? t('Brak właściciela', 'No owner')} · {item.due ?? t('Bez terminu', 'No due date')} · {item.status}</small>
                </li>)}
              </ul> : <p className="pd-commerce__muted">{t('Nie masz otwartych decyzji w rejestrze.', 'No open decisions in the register.')}</p> : <p role="status">{data.decisions.status === 'forbidden' ? t('Brak dostępu do decyzji.', 'No access to decisions.') : t('Nie udało się pobrać decyzji.', 'Could not load decisions.')}</p>}
              {data.decisions.status === 'ready' && <Button variant="secondary" size="small" onClick={() => navigate(link(productRoutes.decisions))}>{t('Otwórz rejestr', 'Open register')}{data.decisions.total !== null && data.decisions.total !== undefined ? ` (${data.decisions.total})` : ''}</Button>}
            </aside>
            {missing.length > 0 && <aside className="pd-commerce__side pd-business-overview__missing">
              <h2>{t('Uzupełnij dane', 'Complete your data')}</h2>
              <p className="pd-commerce__muted">{t('Tych wyników jeszcze nie można wyliczyć:', 'These results cannot be calculated yet:')}</p>
              <ul>{missing.map(item => <li key={item.id}><button type="button" onClick={() => setDetailId(item.id)}>{t(...businessLabels[item.id])}<span aria-hidden="true"> →</span></button></li>)}</ul>
              <Button size="small" variant="secondary" onClick={() => navigate(link(productRoutes.integrations))}>{t('Sprawdź źródła', 'Inspect sources')}</Button>
            </aside>}
          </div>
        </div>
        <nav className="pd-business-overview__links" aria-label={t('Przejdź do analizy', 'Continue analysis')}>
          <span>{t('Analizuj dalej', 'Explore further')}</span>
          <Button size="small" variant="ghost" onClick={() => navigate(link(productRoutes.orders))}>{t('Zamówienia', 'Orders')} →</Button>
          <Button size="small" variant="ghost" onClick={() => navigate(link(productRoutes.products))}>{t('Produkty', 'Products')} →</Button>
          <Button size="small" variant="ghost" onClick={() => navigate(link(productRoutes.campaigns, { sourceId: null }))}>{t('Kampanie', 'Campaigns')} →</Button>
        </nav>
      </>}
    </ProductDataState>
    <Dialog className="pd-business-overview__metric-dialog" open={Boolean(detail)} title={detail ? t(...businessLabels[detail.id]) : ''} description={null} modal closeOnEscape closeOnBackdrop onOpenChange={open => { if (!open) setDetailId(null); }}>
      {detail && <div className="pd-product-data">
        <dl className="pd-product-data__facts"><div><dt>{t('Wynik', 'Result')}</dt><dd>{format(detail.value, detail.id)}</dd></div>{data?.comparisonAllowed && <div><dt>{t('Porównywany okres', 'Comparison period')}</dt><dd>{format(detail.previous, detail.id)}</dd></div>}</dl>
        <p>{detail.definition}</p>
        {detail.limitation && detail.limitation.trim() !== detail.definition.trim() && <p>{detail.limitation}</p>}
        {detail.id === 'adSpend' && data?.advertising.limitation && <p>{data.advertising.limitation}</p>}
        <p className="pd-commerce__muted">{t('Synchronizacja źródła', 'Source synchronization')}: {detail.synchronizedAt ? commerceTimestamp(detail.synchronizedAt, data?.meta.range.timezone ?? 'Europe/Warsaw', language) : t('Brak potwierdzenia', 'Not confirmed')}</p>
        <Button variant="secondary" onClick={() => navigate(link(productRoutes.integrations))}>{t('Sprawdź źródła', 'Inspect sources')}</Button>
      </div>}
    </Dialog>
  </div>;
}
