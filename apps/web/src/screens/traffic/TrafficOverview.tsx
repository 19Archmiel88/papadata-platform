import { useState, type ReactNode } from 'react';
import type { TrafficDimensionRow, TrafficFrame } from '@papadata/contracts';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button, ProductSectionFrame } from '../../design-system';
import { MetricSummary, ProductDataState } from '../shared/ProductDataState';
import { formatProductMoney, useProductLocale } from '../shared/useProductLocale';

export function trafficRangeLabel(frame: Pick<TrafficFrame, 'from' | 'to'>, language: string): string {
  const from = new Date(`${frame.from}T00:00:00Z`);
  const to = new Date(`${frame.to}T00:00:00Z`);
  if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || from > to) return `${frame.from} – ${frame.to}`;
  return new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).formatRange(from, to);
}

export function TrafficOverview({ current, previous, trendTable, onChannel, onChannels }: {
  readonly current: TrafficFrame;
  readonly previous: TrafficFrame | null;
  readonly trendTable: ReactNode;
  readonly onChannel: (row: TrafficDimensionRow) => void;
  readonly onChannels: () => void;
}) {
  const { t, language } = useProductLocale();
  const [metric, setMetric] = useState<'sessions' | 'transactions'>('sessions');
  const n = (value: number | null) => value === null ? '—' : new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(value);
  const money = (frame: TrafficFrame) => frame.metrics.revenue.length
    ? frame.metrics.revenue.map(value => formatProductMoney(value, language)).join(' / ') : '—';
  const ratio = current.metrics.purchasePerSession;
  const pct = ratio === null ? '—' : new Intl.NumberFormat(language, { style: 'percent', maximumFractionDigits: 1 }).format(ratio);
  const leaders = [...current.channels].sort((a, b) => (b.sessions ?? -1) - (a.sessions ?? -1) || a.id.localeCompare(b.id)).slice(0, 5);
  const title = metric === 'sessions' ? t('Trend sesji', 'Session trend') : t('Trend transakcji GA4', 'GA4 transaction trend');
  const seriesLabel = metric === 'sessions' ? t('Sesje', 'Sessions') : t('Transakcje GA4', 'GA4 transactions');
  const day = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : value;
  const availableDays = current.trend.filter(row => row[metric] !== null).length;

  return <div className="pd-traffic-portfolio__overview">
    <dl className="pd-product-data__metrics" aria-label={t('Główne wskaźniki ruchu', 'Key traffic metrics')}>
      <MetricSummary label={t('Sesje', 'Sessions')} value={n(current.metrics.sessions)} description={t('Sesje raportowane przez GA4.', 'Sessions reported by GA4.')} />
      <MetricSummary label={t('Transakcje GA4', 'GA4 transactions')} value={n(current.metrics.transactions)} description={t('Zakupy, bez pozostałych kluczowych zdarzeń.', 'Purchases, excluding other key events.')} />
      <MetricSummary label={t('Zakupy / sesja', 'Purchases / session')} value={pct} description={t('Transakcje / sesje, nie udział sesji z zakupem.', 'Transactions / sessions, not the share of purchasing sessions.')} />
      <MetricSummary label={t('Przychód GA4', 'GA4 revenue')} value={money(current)} description={t('Osobno dla każdej waluty; bez przeliczenia kursów.', 'Per currency; no currency conversion.')} />
    </dl>
    <div className="pd-traffic-portfolio__analysis">
      <ProductSectionFrame icon="trend" title={title} description={t('Dni w strefie usługi GA4. Brak pomiaru nie oznacza zera.', 'Days use the GA4 property timezone. Missing measurement is not zero.')}
        actions={<label className="pd-traffic-portfolio__chart-control"><span className="pd-visually-hidden">{t('Miara trendu ruchu', 'Traffic trend metric')}</span>
          <select value={metric} onChange={event => setMetric(event.target.value as typeof metric)}>
            <option value="sessions">{t('Sesje', 'Sessions')}</option><option value="transactions">{t('Transakcje GA4', 'GA4 transactions')}</option>
          </select></label>}>
        {current.sourceRows ? <>
          <p className="pd-traffic-portfolio__chart-context">{trafficRangeLabel(current, language)} · {t(`Dni z wynikiem: ${availableDays}`, `Days with a result: ${availableDays}`)}</p>
          <div className="pd-product-data__chart" role="img" aria-label={`${title}, ${trafficRangeLabel(current, language)}. ${t('Tabela wartości poniżej.', 'Values table below.')}`}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={[...current.trend]} margin={{ top: 12, right: 12, bottom: 4, left: 0 }} accessibilityLayer>
                <CartesianGrid stroke="var(--pd-separator)" vertical={false} />
                <XAxis dataKey="label" tickFormatter={day} minTickGap={35} tickLine={false} axisLine={false} tick={{ fill: 'var(--pd-text-muted)', fontSize: 12 }} />
                <YAxis tickFormatter={value => n(Number(value))} width={52} tickLine={false} axisLine={false} tick={{ fill: 'var(--pd-text-muted)', fontSize: 12 }} />
                <Tooltip labelFormatter={label => day(String(label))} formatter={value => typeof value === 'number' ? n(value) : '—'}
                  contentStyle={{ background: 'var(--pd-surface-overlay)', color: 'var(--pd-text)', border: '1px solid var(--pd-separator-strong)', borderRadius: 6 }}
                  labelStyle={{ color: 'var(--pd-text)' }} itemStyle={{ color: 'var(--pd-text-secondary)' }} />
                <Line dataKey={metric} name={seriesLabel} stroke="var(--pd-data-series-1)" strokeWidth={2.5} dot={availableDays === 1} connectNulls={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <details className="pd-traffic-portfolio__trend-data"><summary>{t('Dane trendu', 'Trend data')}</summary>{trendTable}</details>
        </> : <ProductDataState state="empty" />}
      </ProductSectionFrame>
      <aside className="pd-traffic-portfolio__channels" aria-labelledby="traffic-top-channels-title">
        <h2 id="traffic-top-channels-title">{t('Skąd przychodzi ruch', 'Where traffic comes from')}</h2>
        <p>{t('Kanały z największą liczbą sesji.', 'Channels with the most sessions.')}</p>
        {leaders.length ? <ol>{leaders.map((row, index) => <li key={row.id}>
          <button type="button" onClick={() => onChannel(row)}>
            <span className="pd-traffic-portfolio__rank" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span>{row.label}<small>{t('Transakcje GA4', 'GA4 transactions')}: {n(row.transactions)}</small></span>
            <strong>{n(row.sessions)}<small>{t('sesje', 'sessions')}</small></strong>
          </button>
        </li>)}</ol> : <p>{t('Brak danych kanałów w tym zakresie.', 'No channel data for this period.')}</p>}
        <Button variant="ghost" size="small" onClick={onChannels}>{t('Wszystkie kanały →', 'All channels →')}</Button>
      </aside>
    </div>
    {previous && <ProductSectionFrame icon="calendar" title={t('Porównanie okresów', 'Period comparison')} description={t('Te same filtry. Brak wyniku poprzedniego okresu pozostaje oznaczony jako niedostępny.', 'The same filters apply. Missing prior-period results remain unavailable.')}>
      <div className="pd-product-data__table-scroll" tabIndex={0} role="region" aria-label={t('Porównanie okresów ruchu', 'Traffic period comparison')}>
        <table className="pd-product-data__table pd-traffic-portfolio__comparison"><thead><tr><th scope="col">{t('Metryka', 'Metric')}</th><th scope="col">{trafficRangeLabel(current, language)}</th><th scope="col">{trafficRangeLabel(previous, language)}</th></tr></thead><tbody>
          <tr><th scope="row">{t('Sesje', 'Sessions')}</th><td>{n(current.metrics.sessions)}</td><td>{n(previous.metrics.sessions)}</td></tr>
          <tr><th scope="row">{t('Transakcje GA4', 'GA4 transactions')}</th><td>{n(current.metrics.transactions)}</td><td>{n(previous.metrics.transactions)}</td></tr>
          <tr><th scope="row">{t('Przychód GA4', 'GA4 revenue')}</th><td>{money(current)}</td><td>{money(previous)}</td></tr>
        </tbody></table>
      </div>
    </ProductSectionFrame>}
  </div>;
}
