import { useState } from 'react';
import { filterGrowthCreatives, growthMetricIds, type GrowthCreative, type GrowthPortfolio } from '@papadata/contracts/campaign-growth';
import { Button, Drawer, ExplorerTable } from '../../../design-system';
import type { ExplorerTableColumn } from '../../../design-system/components/Domain/ExplorerTable/ExplorerTable';
import { useProductLocale } from '../../shared/useProductLocale';
import { useProductQuery } from '../../../runtime/app/routing/productRoutes';
import { growthLabels, growthMetric } from './growthPresentation';
export type GrowthExport = (view: 'campaigns' | 'creatives', context: {
    readonly columns: readonly string[];
    readonly search: string;
    readonly sort: {
        readonly columnId: string;
        readonly direction: 'asc' | 'desc';
    } | null;
}) => void;
function Material({ row }: {
    readonly row: GrowthCreative;
}) {
    const { t } = useProductLocale();
    const [failed, setFailed] = useState(false);
    const [load, setLoad] = useState(false);
    return <div className="pd-growth__material">{row.media.imageUrl && load && !failed ? <img src={row.media.imageUrl} alt={row.name} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)}/> : <p>{row.media.headline ?? t('Materiał graficzny niedostępny', 'Image unavailable')}</p>}{row.media.imageUrl && !load && <Button variant="secondary" size="small" onClick={() => setLoad(true)}>{t("Wczytaj obraz od dostawcy", "Load image from provider")}</Button>}{failed && <p role="status">{t("Obraz jest niedostępny.", "The image is unavailable.")}</p>}{row.media.body && <p>{row.media.body}</p>}<small>{t('Podgląd zapisanych zasobów, nie finalnego placementu.', 'Preview of recorded assets, not a rendered placement.')}</small></div>;
}
export function GrowthCreatives({ data, onExport, exportBusy, onEvidence }: {
    readonly data: GrowthPortfolio;
    readonly onExport?: GrowthExport;
    readonly exportBusy?: boolean;
    readonly onEvidence: (title: string, ids: readonly string[]) => void;
}) {
    const { t, language } = useProductLocale();
    const { params, update } = useProductQuery();
    const filter = { search: params.get('creativeSearch'), format: params.get('creativeFormat'), sample: params.get('creativeSample'), sort: params.get('creativeSort'), direction: params.get('creativeDirection') };
    const rows = filterGrowthCreatives(data.creatives, filter);
    const selected = (params.get('creativeCompare') ?? '').split('|').filter(id => data.creatives.some(row => row.id === id)).slice(0, 4);
    const detail = data.creatives.find(row => row.id === params.get('creativeId'));
    const gallery = params.get('creativeLayout') !== 'table';
    const pageSize = 24, pages = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = Math.max(1, Math.min(pages, Number(params.get('creativePage')) || 1));
    const galleryRows = rows.slice((page - 1) * pageSize, page * pageSize);
    const toggle = (id: string) => { const next = selected.includes(id) ? selected.filter(v => v !== id) : selected.length < 4 ? [...selected, id] : selected; update({ creativeCompare: next.join('|') }); };
    const columns: readonly ExplorerTableColumn<GrowthCreative>[] = [
        { id: 'name', label: t('Kreacja', 'Creative'), required: true, sortAccessor: row => row.name, render: row => <Button variant="ghost" size="small" onClick={() => update({ creativeId: row.id })}>{row.name}</Button> },
        { id: 'campaignName', label: t('Kampania', 'Campaign') }, { id: 'currency', label: t('Waluta', 'Currency'), required: true },
        ...growthMetricIds.map(id => ({ id, label: t(...growthLabels[id]), align: 'right' as const, sortAccessor: (row: GrowthCreative) => row[id], render: (row: GrowthCreative) => growthMetric(row[id], id, row.currency, language) })),
        { id: 'sample', label: t('Próba', 'Sample'), render: row => row.smallSample ? t('Mała / niepełna', 'Small / incomplete') : t('Próg diagnostyczny osiągnięty', 'Diagnostic threshold reached') },
        { id: 'compare', label: t('Porównanie', 'Compare'), render: row => <input type="checkbox" aria-label={`${t('Porównaj', 'Compare')} ${row.name}`} checked={selected.includes(row.id)} disabled={!selected.includes(row.id) && selected.length >= 4} onChange={() => toggle(row.id)}/> },
    ];
    return <div className="pd-growth__stack"><section className="pd-product-data__section"><h2>{t('Kreacje i wyniki reklam', 'Creatives and ad performance')}</h2>
    <p>{t('Próg diagnostyczny: 1000 wyświetleń i 10 konwersji. Nie oznacza istotności statystycznej. Nie sumuj kreacji z sumą kampanii.', 'Diagnostic threshold: 1,000 impressions and 10 conversions. This is not statistical significance. Do not add creative totals to campaign totals.')}</p>
    <div className="pd-product-data__toolbar"><label>{t('Szukaj', 'Search')}<input type="search" value={filter.search ?? ''} onChange={e => update({ creativeSearch: e.target.value, creativePage: null })}/></label><label>{t('Format', 'Format')}<select value={filter.format ?? ''} onChange={e => update({ creativeFormat: e.target.value, creativePage: null })}><option value="">{t('Wszystkie', 'All')}</option>{[...new Set(data.creatives.flatMap(row => row.format ? [row.format] : []))].map(value => <option key={value}>{value}</option>)}</select></label><label>{t('Próba', 'Sample')}<select value={filter.sample ?? 'all'} onChange={e => update({ creativeSample: e.target.value, creativePage: null })}><option value="all">{t('Wszystkie', 'All')}</option><option value="small">{t('Mała / niepełna', 'Small / incomplete')}</option><option value="enough">{t('Powyżej progu', 'Above threshold')}</option></select></label>
    <label>{t('Sortowanie', 'Sort')}<select value={filter.sort ?? 'spend'} onChange={e => update({ creativeSort: e.target.value, creativePage: null })}><option value="name">{t('Nazwa', 'Name')}</option>{growthMetricIds.map(id => <option key={id} value={id}>{t(...growthLabels[id])}</option>)}</select></label><label>{t('Kolejność', 'Direction')}<select value={filter.direction ?? 'desc'} onChange={e => update({ creativeDirection: e.target.value, creativePage: null })}><option value="desc">{t('Malejąco', 'Descending')}</option><option value="asc">{t('Rosnąco', 'Ascending')}</option></select></label>
    <Button size="small" variant={gallery ? 'primary' : 'secondary'} onClick={() => update({ creativeLayout: 'gallery' })}>{t('Galeria', 'Gallery')}</Button><Button size="small" variant={!gallery ? 'primary' : 'secondary'} onClick={() => update({ creativeLayout: 'table' })}>{t('Tabela', 'Table')}</Button>
    </div>
    {params.get('creativeId') && !detail && <p className="pd-product-data__notice" role="status">{t('Wybrana kreacja jest niedostępna w tym zakresie.', 'The selected creative is unavailable in this scope.')} <Button size="small" variant="ghost" onClick={() => update({ creativeId: null })}>{t('Zamknij szczegóły', 'Close details')}</Button></p>}
    {!rows.length && <p role="status">{t('Brak kreacji w tym zakresie. Sprawdź filtry lub synchronizację danych reklam.', 'No creatives in this range. Check filters or synchronize ad-level data.')}</p>}
    {gallery ? <div className="pd-growth__gallery">{galleryRows.map(row => <article key={row.id}><Material row={row}/><h3><Button variant="ghost" size="small" onClick={() => update({ creativeId: row.id })}>{row.name}</Button></h3><p>{row.campaignName} · {row.provider} · {row.currency}</p><dl>{(['spend', 'revenue', 'roas', 'ctr'] as const).map(key => <div key={key}><dt>{t(...growthLabels[key])}</dt><dd>{growthMetric(row[key], key, row.currency, language)}</dd></div>)}</dl><label><input type="checkbox" checked={selected.includes(row.id)} disabled={!selected.includes(row.id) && selected.length >= 4} onChange={() => toggle(row.id)}/>{t('Porównaj', 'Compare')}</label>{row.smallSample && <p className="pd-product-data__notice">{t('Mała lub niepełna próba', 'Small or incomplete sample')}</p>}</article>)}</div> :
            <ExplorerTable ariaLabel={t('Wyniki kreacji', 'Creative performance')} columns={columns} rows={rows} searchQuery={filter.search ?? ''} onSearchQueryChange={value => update({ creativeSearch: value })} manualSearch manualSorting sortState={{ columnId: filter.sort ?? 'spend', direction: filter.direction === 'asc' ? 'asc' : 'desc' }} onSortStateChange={sort => update({ creativeSort: sort.columnId, creativeDirection: sort.direction })} canExport={Boolean(onExport)} onExport={(_, context) => onExport?.('creatives', context)} exportPending={exportBusy} exportFormats={['csv']} collapsedRowCount={10}/>}
    {gallery && pages > 1 && <nav className="pd-product-data__toolbar" aria-label={t("Strony galerii", "Gallery pages")}><Button variant="secondary" size="small" disabled={page <= 1} onClick={() => update({ creativePage: String(page - 1) })}>{t("Poprzednia", "Previous")}</Button><span>{page} / {pages}</span><Button variant="secondary" size="small" disabled={page >= pages} onClick={() => update({ creativePage: String(page + 1) })}>{t("Następna", "Next")}</Button></nav>}
    {gallery && onExport && <Button size="small" variant="secondary" disabled={exportBusy} onClick={() => onExport('creatives', { columns: ['name', 'campaignName', 'currency', ...growthMetricIds], search: filter.search ?? '', sort: { columnId: filter.sort ?? 'spend', direction: filter.direction === 'asc' ? 'asc' : 'desc' } })}>CSV</Button>}
  </section>
  {selected.length > 0 && <section className="pd-product-data__section"><div className="pd-product-data__toolbar"><h2>{t('Porównanie wybranych kreacji', 'Selected creative comparison')} ({selected.length}/4)</h2><Button size="small" variant="secondary" onClick={() => update({ creativeCompare: null })}>{t('Wyczyść', 'Clear')}</Button></div><div className="pd-product-data__table-wrap"><table><thead><tr><th>{t('Metryka', 'Metric')}</th>{selected.map(id => <th key={id}>{data.creatives.find(row => row.id === id)?.name}</th>)}</tr></thead><tbody>{growthMetricIds.map(key => <tr key={key}><th scope="row">{t(...growthLabels[key])}</th>{selected.map(id => { const row = data.creatives.find(item => item.id === id)!; return <td key={id}>{growthMetric(row[key], key, row.currency, language)}</td>; })}</tr>)}</tbody></table></div><p>{t('Porównanie opisowe. Różne budżety, waluty i ekspozycja nie tworzą eksperymentu A/B.', 'Descriptive comparison. Different budgets, currencies and exposure are not an A/B experiment.')}</p></section>}
  <Drawer open={Boolean(detail)} title={detail?.name ?? t('Kreacja', 'Creative')} description={detail?.campaignName ?? null} dismissible side="right" width={640} onOpenChange={open => {
            if (!open)
                update({ creativeId: null });
        }}>{detail && <><Material key={detail.id} row={detail}/><dl>{growthMetricIds.map(key => <div key={key}><dt>{t(...growthLabels[key])}</dt><dd>{growthMetric(detail[key], key, detail.currency, language)}</dd></div>)}</dl><p>{detail.firstDate} — {detail.lastDate} · {detail.observedDays} {t('dni z danymi', 'observed days')}</p>{detail.media.destinationUrl && <a href={detail.media.destinationUrl} target="_blank" rel="noopener noreferrer">{t('Otwórz stronę docelową', 'Open destination')}</a>}<Button variant="secondary" onClick={() => { update({ creativeId: null }); onEvidence(detail.name, detail.evidenceIds); }}>{t('Pochodzenie danych', 'Data provenance')}</Button></>}</Drawer>
  </div>;
}
