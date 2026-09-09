import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { SettingCommand, SettingDocument, SettingsOverview } from '@papadata/contracts';
import { Button, ProductSectionFrame } from '../../design-system';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
import { safeRandomUUID } from '../../runtime/shared/id/safeRandomUUID';
import type { RemoteState } from '../../runtime/shared/data/useRemoteResource';
import { ProductDataState, ProductViewNav } from '../shared/ProductDataState';
import { useProductLocale } from '../shared/useProductLocale';
import { OperationsFrame, OperationsDialog, OperationError } from './OperationsFrame';
export const settingsViewIds=['profile','security','organization','workspace','team','analytics','ai','notifications','privacy','audit'] as const;
export type SettingsView=typeof settingsViewIds[number];
export function resolveSettingsView(location:string,requested:string|null):SettingsView{
 if((settingsViewIds as readonly string[]).includes(requested??''))return requested as SettingsView;
 const aliases:Record<string,SettingsView>={konto:'profile',bezpieczenstwo:'security',organizacja:'organization',firma:'organization',workspace:'workspace',zespol:'team',czlonkostwa:'team',analityka:'analytics',powiadomienia:'notifications',prywatnosc:'privacy',audyt:'audit'};
 return aliases[location.split('?')[0]!.split('/').at(-1)??'']??'profile';
}
const labels:Record<SettingsView,[string,string]>={profile:['Konto','Account'],security:['Bezpieczenstwo','Security'],organization:['Firma','Organization'],workspace:['Workspace','Workspace'],team:['Zespol','Team'],analytics:['Analityka','Analytics'],ai:['Papa AI','Papa AI'],notifications:['Powiadomienia','Notifications'],privacy:['Prywatnosc','Privacy'],audit:['Audyt','Audit']};
export type SettingsOperationsScreenProps={data:SettingsOverview|null;state:RemoteState;problem?:string|null;onReload?:()=>void;onSave?:(section:SettingDocument['section'],command:SettingCommand)=>Promise<SettingDocument>;children?:ReactNode;demo?:boolean};
export function SettingsOperationsScreen({data,state,problem,onReload,onSave,children,demo}:SettingsOperationsScreenProps){
 const {t}=useProductLocale(),{params,update,location}=useProductQuery(),view=resolveSettingsView(location,params.get('settingsView'));
 const doc=data?.documents.find(item=>item.section===view),[dirty,setDirty]=useState(false),[nextView,setNextView]=useState<SettingsView|'reload'|null>(null);
 const change=(id:SettingsView)=>{if(dirty){setNextView(id);return;}update({settingsView:id});};
 useEffect(()=>{setDirty(false);},[view]);
 return <OperationsFrame title={t('Ustawienia','Settings')} description={t('Ustawienia konta, organizacji i workspace maja osobne zakresy zapisu.','Account, organization and workspace settings have separate write scopes.')} onReload={onReload?()=>{if(dirty)setNextView('reload');else onReload();}:undefined} demo={demo}>
 <ProductViewNav label={t('Sekcje ustawien','Settings sections')} active={view} items={settingsViewIds.map(id=>({id,label:t(...labels[id])}))} onChange={change}/>
 <ProductDataState state={state} problem={problem} onRetry={onReload}>{data&&<>{doc?<ProductSectionFrame icon={view==='profile'?'customers':'data'} title={t(...labels[view])} description={`${t('Zakres','Scope')}: ${doc.scope} / ${t('Wersja','Version')}: ${doc.version}`}><SettingEditor key={`${doc.section}:${doc.version}`} document={doc} onDirty={setDirty} onSave={onSave} demo={demo}/></ProductSectionFrame>:['profile','organization','workspace','analytics','notifications'].includes(view)?<p>{t('Brak danych tej sekcji. Odswiez dane zamiast zapisywac puste wartosci.','No data for this section. Refresh rather than saving empty values.')}</p>:children}</>}</ProductDataState>
 <OperationsDialog open={nextView!==null} title={t('Niezapisane zmiany','Unsaved changes')} onClose={()=>setNextView(null)}><p>{t('Zmiany formularza nie zostaly zapisane. Odrzucic je i przejsc dalej?','The form has unsaved changes. Discard them and continue?')}</p><div className="pd-operations__actions"><Button variant="secondary" onClick={()=>setNextView(null)}>{t('Zostan','Stay')}</Button><Button onClick={()=>{if(nextView){setDirty(false);if(nextView==='reload')onReload?.();else update({settingsView:nextView});setNextView(null);}}}>{t('Odrzuc zmiany','Discard changes')}</Button></div></OperationsDialog>
 </OperationsFrame>;
}
function SettingEditor({document:doc,onSave,onDirty,demo}:{document:SettingDocument;onDirty:(value:boolean)=>void;onSave:SettingsOperationsScreenProps['onSave'];demo?:boolean}){
 const {t}=useProductLocale(),[values,setValues]=useState<Record<string,string|number|boolean>>({...doc.values}),[confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null),[success,setSuccess]=useState(false);
 const dirty=JSON.stringify(values)!==JSON.stringify(doc.values),request=useRef<{body:string;id:string}|null>(null);
 useEffect(()=>{onDirty(dirty);},[dirty,onDirty]);
 useEffect(()=>{if(!dirty)return;const prevent=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',prevent);return()=>window.removeEventListener('beforeunload',prevent);},[dirty]);
 const names:Record<string,[string,string]>={name:['Nazwa','Name'],language:['Jezyk','Language'],theme:['Motyw','Theme'],timezone:['Strefa czasowa','Time zone'],revenueGoal:['Cel przychodu','Revenue goal'],currency:['Waluta celu','Goal currency'],digestOptIn:['Zapisz preferencje podsumowan','Store digest preference'],integrationAlerts:['Preferencja alertow integracji','Integration alert preference'],billingAlerts:['Preferencja alertow rozliczen','Billing alert preference']};
 async function save(){if(!onSave||busy)return;setBusy(true);setError(null);const body=JSON.stringify(values);if(request.current?.body!==body)request.current={body,id:safeRandomUUID()};try{await onSave(doc.section,{requestId:request.current.id,expectedVersion:doc.version,values});setSuccess(true);setConfirm(false);onDirty(false);}catch(cause){setError(cause instanceof Error?cause.message:t('Zapis nie powiodl sie','Save failed'));}finally{setBusy(false);}}
 const options:Record<string,readonly string[]>={language:['pl','en'],theme:['system','light','dark'],currency:['PLN','EUR','USD']};
 return <form className="pd-operations__form" onSubmit={e=>{e.preventDefault();setConfirm(true);}}>
 {doc.version===0&&<p>{t('Wartosci poczatkowe. Ten zestaw preferencji nie zostal jeszcze zapisany.','Initial values. These preferences have not yet been saved.')}</p>}
 {Object.entries(values).map(([key,value])=>typeof value==='boolean'?<label className="pd-operations__check" key={key}><input type="checkbox" checked={value} disabled={!doc.canEdit||!onSave||busy} onChange={e=>setValues(v=>({...v,[key]:e.target.checked}))}/>{t(...(names[key]??[key,key]))}</label>:<label key={key}>{t(...(names[key]??[key,key]))}{options[key]?<select value={String(value)} disabled={!doc.canEdit||!onSave||busy} onChange={e=>setValues(v=>({...v,[key]:e.target.value}))}>{options[key]!.map(option=><option key={option}>{option}</option>)}</select>:<input required type={typeof value==='number'?'number':'text'} min={typeof value==='number'?0:undefined} step={typeof value==='number'?'0.01':undefined} maxLength={160} value={value} disabled={!doc.canEdit||!onSave||busy} onChange={e=>setValues(v=>({...v,[key]:typeof value==='number'?Number(e.target.value):e.target.value}))}/>}</label>)}
 {doc.section==='analytics'&&<p>{t('Cel i waluta sa konfiguracja planu workspace. Zapis nie przelicza historycznych danych ani nie zmienia ich strefy czasowej.','Goal and currency configure workspace planning. Saving does not recalculate historical data or change its time zone.')}</p>}
 {doc.section==='notifications'&&<p>{t('Zapis dotyczy preferencji. Ta paczka nie uruchamia nowych wysylek e-mail i nie wylacza obowiazkowych komunikatow bezpieczenstwa.','Saving stores preferences. This package does not activate new email deliveries or suppress mandatory security messages.')}</p>}
 {doc.section==='organization'&&<p>{t('Nazwa wyswietlana organizacji. Dane prawne i podatkowe na fakturach zmienisz u dostawcy rozliczen.','Organization display name. Legal and tax invoice details are maintained with the billing provider.')}</p>}
 <OperationError message={error}/>{success&&<p role="status">{demo?t('Demo: zapis lokalny.','Demo: local save.'):t('Zapis potwierdzony przez serwer.','Save confirmed by the server.')}</p>}
 <div className="pd-operations__actions"><Button type="submit" disabled={!dirty||!doc.canEdit||!onSave||busy}>{t('Przejrzyj i zapisz','Review and save')}</Button><Button type="button" variant="ghost" disabled={!dirty||busy} onClick={()=>{setValues({...doc.values});setError(null);setSuccess(false);}}>{t('Anuluj zmiany','Discard changes')}</Button></div>
 <OperationsDialog open={confirm} title={t('Potwierdz zmiane ustawien','Confirm settings change')} busy={busy} onClose={()=>setConfirm(false)}><dl>{Object.entries(values).filter(([key,value])=>value!==doc.values[key]).map(([key,value])=><div key={key}><dt>{t(...(names[key]??[key,key]))}</dt><dd>{String(doc.values[key])} &rarr; {String(value)}</dd></div>)}</dl><OperationError message={error}/><Button type="button" disabled={busy} onClick={()=>void save()}>{busy?t('Zapisywanie','Saving'):t('Potwierdz zapis','Confirm save')}</Button></OperationsDialog>
 </form>;
}
