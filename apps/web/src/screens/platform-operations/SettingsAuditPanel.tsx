import type { SettingsAuditPage } from '@papadata/contracts';
import { Button, ProductSectionFrame } from '../../design-system';
import { useProductLocale } from '../shared/useProductLocale';
export function SettingsAuditPanel({page,onMore,onFirst}:{page:SettingsAuditPage;onMore?:()=>void;onFirst?:()=>void}){
 const {t}=useProductLocale();
 return <ProductSectionFrame icon="security" title={t('Dziennik audytu','Audit trail')} description={t('Zdarzenia bieżącego workspace. Odczyt listy nie jest weryfikacją łańcucha podpisów.','Events in the current workspace. Reading the list is not cryptographic chain verification.')}>
 {page.events.length===0?<p>{t('Brak zdarzeń w tym zakresie.','No events in this range.')}</p>:<div className="pd-operations__table" tabIndex={0}><table><thead><tr><th>{t('Czas / numer','Time / sequence')}</th><th>{t('Aktor','Actor')}</th><th>{t('Operacja','Operation')}</th><th>{t('Wynik','Outcome')}</th><th>{t('Zasób','Resource')}</th></tr></thead><tbody>{page.events.map(row=><tr key={row.id}><td>{row.createdAt}<br/>#{row.sequence}</td><td>{row.actor}</td><td>{row.action}</td><td>{row.outcome}</td><td>{row.resource}<br/>{row.resourceId??'--'}</td></tr>)}</tbody></table></div>}
 <div className="pd-operations__actions">{onFirst&&<Button variant="ghost" onClick={onFirst}>{t('Najnowsze','Latest')}</Button>}{onMore&&page.hasMore&&<Button variant="secondary" onClick={onMore}>{t('Starsze zdarzenia','Older events')}</Button>}</div>
 </ProductSectionFrame>;
}
