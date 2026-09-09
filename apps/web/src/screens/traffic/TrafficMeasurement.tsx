import type { TrafficPortfolio } from '@papadata/contracts';
import { Button, Drawer } from '../../design-system';
import { useProductQuery, contextualProductLink, productRoutes } from '../../runtime/app/routing/productRoutes';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import { formatProductMoney, useProductLocale } from '../shared/useProductLocale';
const definitions: Readonly<Record<string, readonly [
    string,
    string
]>> = {
    session_start: ['Rozpoczęcie sesji; niezależny licznik zdarzeń.', 'Session start; an independent event counter.'],
    view_item: ['Wyświetlenie produktu. Jedna osoba może wywołać wiele zdarzeń.', 'Product view. One person may trigger multiple events.'],
    add_to_cart: ['Dodanie produktu do koszyka, nie liczba unikalnych koszyków.', 'Adding an item to a cart, not a count of unique carts.'],
    begin_checkout: ['Rozpoczęcie procesu zamówienia; powtórzenia są możliwe.', 'Beginning checkout; repeated events are possible.'],
    purchase: ['Zdarzenie zakupu w GA4; wymaga poprawnego transaction_id i deduplikacji pomiaru.', 'A GA4 purchase event; measurement needs a valid transaction_id and deduplication.'],
};
export function TrafficMeasurementComparison({ data }: {
    readonly data: TrafficPortfolio;
}) {
    const { t, language } = useProductLocale(), { params, update } = useProductQuery(), navigate = useShellNavigate();
    const sources = data.current.orderSources;
    const requestedSource = params.get('orderSource');
    const source = requestedSource ? sources.find(row => row.connectionId === requestedSource) : sources[0];
    const currencies = [...new Set([...data.current.metrics.revenue, ...(source?.revenue ?? [])].map(row => row.currency))].filter(v => v !== 'XXX');
    const currency = currencies.includes(params.get('comparisonCurrency') ?? '') ? params.get('comparisonCurrency')! : currencies.length === 1 ? currencies[0] : null;
    const ga4 = data.current.metrics.revenue.find(row => row.currency === currency)?.amount ?? null;
    const store = source?.revenue.find(row => row.currency === currency)?.amount ?? null;
    const unfiltered = !data.scope.channel && !data.scope.device && !data.scope.country;
    const singleSource = data.scope.connectedSources === 1;
    const compatibleCalendar = data.scope.propertyTimezones.length === 1 && data.scope.propertyTimezones[0] === data.scope.timezone;
    const eligible = unfiltered && singleSource && compatibleCalendar;
    const delta = eligible && ga4 !== null && store !== null ? ga4 - store : null;
    const number = (v: number | null | undefined) => v == null ? '—' : new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(v);
    const money = (v: number | null) => formatProductMoney(currency ? { amount: v, currency } : null, language);
    return <div className="pd-product-data__stack"><div className="pd-product-data__toolbar"><label>{t('Porównaj ze źródłem zamówień', 'Compare with order source')}<select value={source?.connectionId ?? ''} onChange={e => update({ orderSource: e.target.value })}><option value="" disabled>{t('Wybierz', 'Select')}</option>{sources.map(row => <option value={row.connectionId} key={row.connectionId}>{row.provider} / {row.connectionId}</option>)}</select></label><label>{t('Waluta porównania wartości', 'Value comparison currency')}<select value={currency ?? ''} onChange={e => update({ comparisonCurrency: e.target.value })}><option value="">{t('Wybierz walutę', 'Select currency')}</option>{currencies.map(v => <option key={v}>{v}</option>)}</select></label></div>
 <div className="pd-product-data__table-scroll">{requestedSource && !source && <p role="status">{t('Wybrane w URL źródło nie jest dostępne. Wybierz ponownie.', 'The source selected in the URL is unavailable. Select another source.')}</p>}<table className="pd-product-data__table"><thead><tr><th>{t('Perspektywa', 'Perspective')}</th><th>{t('Transakcje / zamówienia', 'Transactions / orders')}</th><th>{t('Wartość', 'Value')} ({currency ?? '—'})</th></tr></thead><tbody><tr><th scope="row">GA4</th><td>{number(data.current.metrics.transactions)}</td><td>{money(ga4)}</td></tr><tr><th scope="row">{source?.provider ?? t('Brak zamówień', 'No orders')}</th><td>{number(source?.orders)}</td><td>{money(store)}</td></tr><tr><th scope="row">{t('Różnica raportowanych wartości', 'Difference in reported values')}</th><td>—</td><td>{money(delta)}</td></tr></tbody></table></div>
 {!eligible && <p className="pd-product-data__notice">{t('Różnicę wartości wyliczamy dopiero dla jednej usługi GA4, bez filtrów kanału/urządzenia/kraju i zgodnej strefy kalendarza. Brak zgodności nie jest wynikiem zerowym.', 'A value difference is calculated only for one GA4 property, without channel/device/country filters and with matching calendar timezones. An incompatible scope is not a zero.')}</p>}
 <p>{t('Różnica nie jest uzgodnieniem transaction_id. Zgody, blokady pomiaru, status zamówienia, zwroty, daty i waluty mogą zmieniać wyniki. Nie sumujemy sklepów z integratorami.', 'The difference is not a transaction_id reconciliation. Consent, blocked measurement, order status, refunds, dates and currencies can change results. Stores are not added to integrators.')}</p>
 <Button variant="secondary" onClick={() => navigate(contextualProductLink(productRoutes.decisions, { domain: 'traffic', title: t('Wyjaśnij rozbieżność GA4 i zamówień', 'Investigate the GA4/order discrepancy'), orderSource: source?.connectionId, comparisonCurrency: currency }))}>{t('Zapisz problem jako decyzję', 'Prepare a decision')}</Button></div>;
}
export function TrafficEventDetails({ data }: {
    readonly data: TrafficPortfolio;
}) {
    const { t, language } = useProductLocale(), { params, update } = useProductQuery(), navigate = useShellNavigate();
    const id = params.get('trafficEvent'), step = data.current.events.find(row => row.id === id), previous = data.previous?.events.find(row => row.id === id);
    const number = (v: number | null | undefined) => v == null ? '—' : new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(v);
    return <Drawer open={Boolean(id)} dismissible side="right" width={520} title={t('Definicja i szczegóły kroku', 'Step definition and details')} description={id} onOpenChange={open => {
            if (!open)
                update({ trafficEvent: null });
        }}>{step ? <>
 <h3><code>{step.event}</code> → <code>{step.nextEvent}</code></h3><p>{definitions[step.event] ? t(...definitions[step.event]) : step.event}</p><p>{definitions[step.nextEvent] ? t(...definitions[step.nextEvent]) : step.nextEvent}</p>
 <dl className="pd-product-data__facts"><div><dt>{t('Licznik w zakresie', 'Count in range')}</dt><dd>{number(step.count)}</dd></div><div><dt>{t('Licznik kolejnego zdarzenia', 'Next event count')}</dt><dd>{number(step.nextCount)}</dd></div><div><dt>{t('Różnica liczników, nie odpływ osób', 'Counter difference, not people abandoning')}</dt><dd>{number(step.difference)}</dd></div><div><dt>{t('Poprzedni okres', 'Previous period')}</dt><dd>{number(previous?.count)} → {number(previous?.nextCount)}</dd></div></dl>
 <p className="pd-product-data__notice">{t('Ten model nie zawiera kolejności zdarzeń w sesji. Nie nazywamy różnicy utraconymi klientami. Do lejka sekwencyjnego potrzeba odrębnego raportu lub danych zdarzeniowych.', 'This model has no within-session event order. Counter differences are not lost customers. A sequential funnel requires a separate report or event-level data.')}</p>
 <Button variant="secondary" onClick={() => navigate(contextualProductLink(productRoutes.help, { topic: 'ga4-funnel-definitions', trafficEvent: step.event }))}>{t('Procedura diagnostyczna', 'Diagnostic procedure')}</Button>
 </> : <p role="status">{t('Ten krok nie jest dostępny w bieżącym zakresie.', 'This step is unavailable in the current range.')}</p>}</Drawer>;
}
