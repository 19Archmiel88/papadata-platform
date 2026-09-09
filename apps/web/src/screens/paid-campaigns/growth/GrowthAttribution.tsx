import type { GrowthAttribution as Attribution, GrowthPortfolio } from '@papadata/contracts/campaign-growth';
import { Button } from '../../../design-system';
import { useProductQuery } from '../../../runtime/app/routing/productRoutes';
import { useProductLocale } from '../../shared/useProductLocale';
import { growthMoney, growthNumber } from './growthPresentation';
export function GrowthAttribution({ data, onEvidence }: {
    readonly data: GrowthPortfolio;
    readonly onEvidence: (title: string, ids: readonly string[]) => void;
}) {
    const { t, language } = useProductLocale();
    const { params, update } = useProductQuery();
    const model = params.get('attributionModel') ?? '', window = params.get('attributionWindow') ?? '';
    const rows = data.attribution.filter(row => (!model || row.model === model) && (!window || row.attributionWindow === window));
    const left = rows.find(row => row.id === params.get('attributionLeft')) ?? rows[0];
    const right = rows.find(row => row.id === params.get('attributionRight')) ?? rows.find(row => row.id !== left?.id);
    const comparable = left && right && left.id !== right.id && left.currency === right.currency && left.currency !== 'XXX';
    const delta = comparable && left.revenue !== null && right.revenue !== null ? left.revenue - right.revenue : null;
    const sourceLabel = (row: Attribution) => `${row.label} · ${row.currency} · ${row.model ?? t('model nieznany', 'unknown model')}`;
    return <div className="pd-growth__stack">
    <section className="pd-product-data__section">
      <h2>{t('Jedna sprzedaż, różne perspektywy pomiaru', 'One business, different measurement perspectives')}</h2>
      <p>{t('Porównuj raporty, nie sumuj przypisanej sprzedaży. Model i okno pochodzą z zapisanych danych; wybór nie przelicza historii na nowy model.', 'Compare reports, do not add attributed sales. Model and window come from recorded data; selecting one does not recompute history.')}</p>
      <div className="pd-product-data__toolbar">
        <label>{t('Model w danych', 'Recorded model')}<select value={model} onChange={e => update({ attributionModel: e.target.value, attributionLeft: null, attributionRight: null })}><option value="">{t('Wszystkie / nieznany', 'All / unknown')}</option>{data.choices.models.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>{t('Okno w danych', 'Recorded window')}<select value={window} onChange={e => update({ attributionWindow: e.target.value, attributionLeft: null, attributionRight: null })}><option value="">{t('Wszystkie / nieznane', 'All / unknown')}</option>{data.choices.windows.map(value => <option key={value}>{value}</option>)}</select></label>
      </div>
      {!data.choices.windows.length && <p className="pd-product-data__notice">{t('Nie otrzymano metadanych okien. Nie przypisujemy automatycznie 7 dni kliknięcia / 1 dnia wyświetlenia.', 'No window metadata was received. Seven-day click / one-day view is not assumed.')}</p>}
      <div className="pd-growth__compare">
        {(['Left', 'Right'] as const).map((side, index) => {
            const row = index === 0 ? left : right;
            return <article key={side}>
          <label>{index === 0 ? t('Perspektywa A', 'Perspective A') : t('Perspektywa B', 'Perspective B')}<select value={row?.id ?? ''} onChange={e => update({ [`attribution${side}`]: e.target.value })}><option value="" disabled>{t('Wybierz źródło', 'Select source')}</option>{rows.map(item => <option key={item.id} value={item.id}>{sourceLabel(item)}</option>)}</select></label>
          {row ? <><h3>{row.label}</h3><strong className="pd-growth__large">{growthMoney(row.revenue, row.currency, language)}</strong><p>{t('Konwersje / zamówienia', 'Conversions / orders')}: {growthNumber(row.conversions, language, 2)}</p>
          <dl><div><dt>{t('Populacja', 'Population')}</dt><dd>{row.population === 'campaign_filter' ? t('Bieżące filtry kampanii', 'Current campaign filters') : t('Całe źródło, bez mapowania kampanii', 'Whole source, no campaign mapping')}</dd></div><div><dt>{t('Model / okno', 'Model / window')}</dt><dd>{row.model ?? '—'} / {row.attributionWindow ?? '—'}</dd></div><div><dt>{t('Podstawa daty', 'Date basis')}</dt><dd>{row.timeBasis === 'provider_reporting_date' ? t('Dzień raportowy dostawcy', 'Provider reporting day') : t('Czas biznesowy zamówienia w imporcie', 'Imported order business time')}</dd></div><div><dt>{t('Synchronizacja', 'Synchronized')}</dt><dd>{row.synchronizedAt ?? t('Nieznana', 'Unknown')}</dd></div></dl>
          <Button variant="secondary" size="small" onClick={() => onEvidence(row.label, row.evidenceIds)}>{t('Pochodzenie danych', 'Data provenance')}</Button></> : <p>{t('Brak drugiego źródła w zakresie.', 'No second source in this range.')}</p>}
        </article>;
        })}
      </div>
      <p className="pd-growth__delta">{t('Różnica raportów A − B', 'Report difference A − B')}: <strong>{growthMoney(delta, left?.currency ?? null, language)}</strong></p>
      <p className="pd-product-data__notice">{!comparable ? t('Do porównania wartości wybierz dwa różne raporty w tej samej znanej walucie.', 'Select two different reports in the same known currency to compare amounts.') : t('To różnica raportowana, nie luka przychodu ani dowód dodatkowej sprzedaży. Zamówienia i GA4 nie dziedziczą filtra kampanii bez uzgodnionego mapowania.', 'This is a reporting difference, not lost revenue or incremental sales. Store and GA4 data do not inherit campaign filters without a reconciled mapping.')}</p>
    </section>
    <section className="pd-product-data__section"><h2>{t('Wszystkie perspektywy', 'All perspectives')}</h2><div className="pd-product-data__table-wrap"><table><thead><tr><th>{t('Źródło', 'Source')}</th><th>{t('Model / okno', 'Model / window')}</th><th>{t('Wartość', 'Value')}</th><th>{t('Konwersje', 'Conversions')}</th><th>{t('Dowody', 'Evidence')}</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><th scope="row">{row.label} ({row.currency})</th><td>{row.model ?? '—'} / {row.attributionWindow ?? '—'}</td><td>{growthMoney(row.revenue, row.currency, language)}</td><td>{growthNumber(row.conversions, language, 2)}</td><td><Button variant="ghost" size="small" onClick={() => onEvidence(row.label, row.evidenceIds)}>{t('Pokaż', 'Show')}</Button></td></tr>)}</tbody></table></div>{!rows.length && <p role="status">{t('Brak raportów dla tych filtrów.', 'No reports for these filters.')}</p>}</section>
  </div>;
}
