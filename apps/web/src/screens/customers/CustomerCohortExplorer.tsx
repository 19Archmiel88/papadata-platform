import type { CustomersPortfolio } from '@papadata/contracts';
import { Button, Drawer, ProductSectionFrame } from '../../design-system';
import { useProductQuery, contextualProductLink, productRoutes } from '../../runtime/app/routing/productRoutes';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import { ProductDataState } from '../shared/ProductDataState';
import { useProductLocale } from '../shared/useProductLocale';
export function CustomerCohortExplorer({ data }: {
    readonly data: CustomersPortfolio;
}) {
    const { params, update } = useProductQuery(), { t, language } = useProductLocale(), navigate = useShellNavigate();
    const month = Math.max(1, Math.min(12, Number(params.get('cohortPeriod')) || 1));
    const minimum = ['30', '100'].includes(params.get('cohortSample') ?? '') ? Number(params.get('cohortSample')) : 0;
    const complete = params.get('cohortComplete') === 'true', selected = data.cohorts.find(row => row.cohortKey === params.get('customerCohort'));
    const ids = (params.get('cohortCompare') ?? '').split('|').filter(id => data.cohorts.some(row => row.cohortKey === id)).slice(0, 3);
    const rows = data.cohorts.filter(row => row.users >= minimum && (!complete || row.retention.find(cell => cell.monthOffset === month)?.complete));
    const rate = (value: number | null | undefined) => value == null ? '—' : new Intl.NumberFormat(language, { style: 'percent', maximumFractionDigits: 1 }).format(value);
    const number = (value: number) => new Intl.NumberFormat(language).format(value);
    const comparisons = ids.map(id => data.cohorts.find(row => row.cohortKey === id)!).map(cohort => ({ cohort, cell: cohort.retention.find(cell => cell.monthOffset === month) }));
    function toggle(id: string) { const next = ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id].slice(0, 3); update({ cohortCompare: next.length ? next.join('|') : null }); }
    return <ProductSectionFrame icon="calendar" title={t('Kohorty i retencja', 'Cohorts and retention')} description={t('Kohorta to miesiąc pierwszego zaobserwowanego kwalifikowanego zakupu. M1 to powrót w następnym miesiącu; nie retencja skumulowana.', 'A cohort is the month of the first observed qualifying purchase. M1 is a return in the following month, not cumulative retention.')}>
  <div className="pd-product-data__toolbar"><label>{t('Porównuj okres', 'Compare period')}<select value={month} onChange={e => update({ cohortPeriod: e.target.value })}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>M{i + 1}</option>)}</select></label><label>{t('Minimalna próba', 'Minimum sample')}<select value={minimum} onChange={e => update({ cohortSample: e.target.value === '0' ? null : e.target.value })}><option value="0">{t('Każda', 'Any')}</option><option value="30">30</option><option value="100">100</option></select></label><label><input type="checkbox" checked={complete} onChange={e => update({ cohortComplete: e.target.checked ? 'true' : null })}/>{t('Tylko zakończone okresy', 'Completed observation periods only')}</label></div>
  <p>{t('Wybierz maksymalnie 3 kohorty. Oznaczenie małej próby (<30) jest progiem diagnostycznym, nie testem istotności statystycznej.', 'Select up to 3 cohorts. The small-sample mark (<30) is a diagnostic threshold, not a statistical significance test.')}</p>
  {!!comparisons.length && <div className="pd-product-data__grid">{comparisons.map(({ cohort, cell }, index) => {
                const baseline = comparisons[0]?.cell?.rate, delta = index > 0 && cell?.rate != null && baseline != null ? (cell.rate - baseline) * 100 : null;
                return <article key={cohort.cohortKey}><h3>{cohort.cohortKey} · M{month}</h3><strong>{rate(cell?.rate)}</strong><p>{cell?.complete ? `${number(cell.retainedUsers)} / ${number(cell.eligibleUsers)}` : t('Okres niezakończony', 'Incomplete period')}</p>{delta != null && <p>{new Intl.NumberFormat(language, { signDisplay: 'always', maximumFractionDigits: 1 }).format(delta)} {t('p.p. względem', 'pp versus')} {comparisons[0]!.cohort.cohortKey}</p>}</article>;
            })}</div>}
  <div className="pd-product-data__table-scroll"><table className="pd-product-data__table"><caption>{t('Miesięczna retencja klientów. Kreska oznacza brak zakończonej obserwacji, nie wynik zerowy.', 'Monthly customer retention. A dash is an incomplete observation, not a zero result.')}</caption><thead><tr><th>{t('Porównaj', 'Compare')}</th><th>{t('Kohorta', 'Cohort')}</th><th>{t('Klienci', 'Customers')}</th>{Array.from({ length: 12 }, (_, i) => <th key={i}>M{i + 1}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.cohortKey}><td><input type="checkbox" aria-label={t('Porównaj kohortę', 'Compare cohort') + ' ' + row.cohortKey} checked={ids.includes(row.cohortKey)} disabled={!ids.includes(row.cohortKey) && ids.length >= 3} onChange={() => toggle(row.cohortKey)}/></td><th scope="row"><Button variant="ghost" size="small" onClick={() => update({ customerCohort: row.cohortKey, customerId: null })}>{row.cohortKey}</Button></th><td>{number(row.users)}{row.users < 30 ? ' *' : ''}</td>{row.retention.map(cell => <td key={cell.monthOffset} title={cell.complete ? `${cell.retainedUsers} / ${cell.eligibleUsers}` : t('Okres niezakończony', 'Incomplete period')}>{rate(cell.rate)}</td>)}</tr>)}</tbody></table></div>
  {!rows.length && <ProductDataState state="empty" problem={t('Brak kohort spełniających te filtry.', 'No cohorts match these filters.')}/>}
  <Drawer open={Boolean(selected)} side="right" width={560} dismissible title={t('Szczegóły kohorty', 'Cohort detail')} description={selected?.cohortKey ?? null} onOpenChange={open => {
            if (!open)
                update({ customerCohort: null });
        }}>{selected && <>
   <p>{t('Klienci na początku kohorty', 'Customers at cohort start')}: {number(selected.users)}</p><p>{t('Niepełna historia importu może przesunąć pierwszy zaobserwowany zakup. Nie deklarujemy pierwszego zakupu w całym życiu klienta.', 'Incomplete import history can shift the first observed purchase. This is not necessarily the first lifetime purchase.')}</p>
   <table className="pd-product-data__table"><thead><tr><th>{t('Okres', 'Period')}</th><th>{t('Powracający', 'Retained')}</th><th>{t('Uprawnieni do obserwacji', 'Eligible')}</th><th>{t('Retencja', 'Retention')}</th></tr></thead><tbody>{selected.retention.map(cell => <tr key={cell.monthOffset}><th>M{cell.monthOffset}</th><td>{cell.complete ? number(cell.retainedUsers) : '—'}</td><td>{cell.complete ? number(cell.eligibleUsers) : '—'}</td><td>{rate(cell.rate)}</td></tr>)}</tbody></table>
   <Button onClick={() => navigate(contextualProductLink(productRoutes.decisions, { domain: 'customers', title: t('Ocenić retencję kohorty', 'Review cohort retention') + ' ' + selected.cohortKey, customerCohort: selected.cohortKey }))}>{t('Przygotuj decyzję', 'Prepare a decision')}</Button>
  </>}</Drawer>
 </ProductSectionFrame>;
}
export function CustomerDataQuality({ data }: {
    readonly data: CustomersPortfolio;
}) {
    const { t, language } = useProductLocale(), navigate = useShellNavigate(), c = data.coverage;
    const n = (value: number | undefined) => value == null ? '—' : new Intl.NumberFormat(language).format(value);
    return <ProductSectionFrame icon="data" title={t('Jakość portfela i prywatność', 'Portfolio quality and privacy')} description={t('Wskaźniki dotyczą dostępnych zamówień, a nie pełnej populacji osób odwiedzających sklep.', 'Metrics cover available orders, not the entire population visiting the store.')}>
  <dl className="pd-product-data__facts">{[
            [t('Kwalifikowane zamówienia w walucie raportu', 'Qualifying orders in reporting currency'), n(c?.qualifyingOrders)],
            [t('Zamówienia przypisane jednoznacznie', 'Unambiguously assigned orders'), n(c?.classifiedOrders)],
            [t('Bez referencji klienta', 'Missing customer reference'), n(c?.missingReferenceOrders)],
            [t('Wyłączone konflikty tożsamości', 'Excluded identity conflicts'), n(c?.ambiguousOrders)],
            [t('Grupy identyfikatorów wspólnych dla wielu źródeł', 'Identifiers shared by multiple sources'), n(c?.conflictGroups)],
            [t('Najstarszy zaobserwowany zakup', 'Earliest observed purchase'), c?.firstObservedOrderAt ? new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeZone: data.scope.timezone }).format(new Date(c.firstObservedOrderAt)) : '—'],
        ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
  <p>{t('Powtarzający się identyfikator w niezależnych kontach nie jest automatycznie scalany. Niejednoznaczne zamówienia są wyłączone z segmentacji i wymagają przeglądu.', 'A repeated identifier in independent accounts is not automatically merged. Ambiguous orders are excluded from segmentation and require review.')}</p>
  <p>{t('Zgody marketingowe: nieznane. Pseudonim nie jest anonimizacją. Działanie retencyjne wymaga osobnej oceny zgód i uprawnień.', 'Marketing consent: unknown. Pseudonymization is not anonymization. Retention actions need separate consent and permission review.')}</p>
  <details><summary>{t('Definicja segmentów RFM', 'RFM segment definitions')}</summary><p>{t('R/F/M to kwintyle portfela z jednakową oceną dla remisów. Nowy: pierwszy zaobserwowany zakup w okresie. Najlepsi: R,F,M co najmniej 4. Lojalni: R,F,M co najmniej 3. W ryzyku: R do 2 oraz F lub M co najmniej 3. Nieaktywni: pozostałe R do 2. Reszta: potencjalnie lojalni.', 'R/F/M are portfolio quintiles with equal scores for ties. New: first observed purchase in the period. Champions: R,F,M at least 4. Loyal: R,F,M at least 3. At risk: R at most 2 and F or M at least 3. Lapsed: other R at most 2. Remaining: potential loyalists.')}</p></details>
  <div className="pd-product-data__toolbar"><Button variant="secondary" onClick={() => navigate(contextualProductLink(productRoutes.help, { topic: 'customer-identity' }))}>{t('Zgłoś problem mapowania', 'Report a mapping issue')}</Button><Button variant="ghost" onClick={() => navigate(contextualProductLink(productRoutes.integrations))}>{t('Sprawdź historię źródeł', 'Review source history')}</Button></div>
 </ProductSectionFrame>;
}
