import { cleanProductContextPath, type SupportTicketDetail } from '@papadata/contracts';
import { SupportTicketThread, type TicketCommandHandler } from './SupportTicketThread';
import { useEffect,useRef,useState } from 'react';
import type { SupportContext,SupportTicket,SupportTicketInput } from '@papadata/contracts';
import { Button,Dialog,ExplorerTable,ProductSectionFrame } from '../../design-system';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import { contextualProductLink,productRoutes,useProductQuery } from '../../runtime/app/routing/productRoutes';
import { safeReturnTo } from '../../runtime/app/routing/navigation';
import type { RemoteState } from '../../runtime/shared/data/useRemoteResource';
import { safeRandomUUID } from '../../runtime/shared/id/safeRandomUUID';
import { ProductDataState } from '../shared/ProductDataState';
import { useProductLocale } from '../shared/useProductLocale';
import { helpProcedures } from './helpContent';
export type HelpCenterViewProps={tickets?:readonly SupportTicket[];total?:number;state?:RemoteState;problem?:string|null;onReload?:()=>void;onSubmit?:(request:SupportTicketInput)=>Promise<SupportTicket>;demo?:boolean;pageSize?:number;deliveryWarning?:string|null;ticketDetail?:SupportTicketDetail|null;ticketState?:RemoteState;ticketProblem?:string|null;onReloadTicket?:()=>void;onTicketCommand?:TicketCommandHandler};
export function HelpCenterView({tickets=[],total=tickets.length,state='ready',problem,onReload,onSubmit,demo=false,pageSize=50,deliveryWarning,ticketDetail,ticketState='ready',ticketProblem,onReloadTicket,onTicketCommand}:HelpCenterViewProps){
 const {t,language}=useProductLocale(),{params,update}=useProductQuery(),navigate=useShellNavigate();
 const search=params.get('helpSearch')??'',category=params.get('helpCategory')??'all',procedure=helpProcedures.find(p=>p.id===params.get('procedure'));
 const requested=params.get('topic');
 const [kind,setKind]=useState<SupportTicketInput['kind']|null>(null),[subject,setSubject]=useState(''),[message,setMessage]=useState(''),[included,setIncluded]=useState(true),[pending,setPending]=useState(false),[failure,setFailure]=useState<string|null>(null),[created,setCreated]=useState<SupportTicket|null>(null);
 useEffect(()=>{const protect=(event:BeforeUnloadEvent)=>{if(kind&&!created&&(subject.trim()||message.trim())){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',protect);return()=>window.removeEventListener('beforeunload',protect);},[kind,created,subject,message]);
 const requestId=useRef(safeRandomUUID()),requestSignature=useRef(''),inFlight=useRef(false);
 const ticketPage=Math.max(1,Number(params.get('ticketPage'))||1),ticketSearch=params.get('ticketSearch')??'',ticketStatus=params.get('ticketStatus')??'all';
 const rows=helpProcedures.filter(p=>(category==='all'||category===p.category)&&[...p.title,...p.summary].join(' ').toLocaleLowerCase(language).includes(search.trim().toLocaleLowerCase(language)));
 const source=params.get('returnTo')?safeReturnTo(params.get('returnTo')):'/app/help';
 const [context,setContext]=useState<SupportContext>({sourcePath:'/app/help',topic:null,procedureId:null});
 function captureContext():SupportContext{
  return {sourcePath:cleanProductContextPath(source)??'/app/help',topic:requested?.slice(0,120)||null,procedureId:procedure?.id??null};
 }
 function open(next:SupportTicketInput['kind']){setContext(captureContext());update({procedure:null,ticketId:null});requestId.current=safeRandomUUID();setKind(next);setSubject(procedure?t(...procedure.title):'');setMessage('');setIncluded(true);setFailure(null);setCreated(null);}
 async function submit(){
  if(!kind||pending||inFlight.current||!onSubmit)return;
  inFlight.current=true;setPending(true);setFailure(null);
  const body={kind,subject,message,context:included?context:null};const signature=JSON.stringify(body);
  if(requestSignature.current!==signature){requestId.current=safeRandomUUID();requestSignature.current=signature;}
  try{setCreated(await onSubmit({requestId:requestId.current,...body}));}
  catch(error){setFailure(error instanceof Error?error.message:t('Nie zapisano zgłoszenia.','The request was not saved.'));}
  finally{inFlight.current=false;setPending(false);}
 }
 const labels={received:t('Przyjęte do kolejki','Received in queue'),in_progress:t('W obsłudze','In progress'),waiting_for_user:t('Oczekuje na odpowiedź','Waiting for response'),resolved:t('Rozwiązane','Resolved')};
 return <div className="pd-product-data pd-help-workspace" data-testid="help-center-bi-page">
  <header className="pd-product-data__head"><div><h1>{t('Centrum Pomocy','Help Center')}</h1><p>{t('Znajdź procedurę, zachowaj kontekst problemu i sprawdź status swojej sprawy.','Find guidance, preserve the problem context and check your request status.')}</p></div><div className="pd-product-data__toolbar"><Button onClick={()=>open('technical')}>{t('Zgłoś problem','Report a problem')}</Button><Button variant="secondary" onClick={()=>open('consultation')}>{t('Poproś o konsultację','Request a consultation')}</Button></div></header>
  {demo&&<p className="pd-product-data__notice">{t('Demonstracja. Zmiany spraw są lokalne i znikają po przeładowaniu; brak wysyłki do serwera.','Demonstration. Request changes are local and reset on reload; nothing is submitted to a server.')}</p>}
  {requested&&<p>{t('Kontekst problemu','Problem context')}: <code>{requested}</code> <Button size="small" variant="ghost" onClick={()=>navigate(source)}>{t('Wróć do analizy','Return to the analysis')}</Button></p>}
  <div className="pd-product-data__toolbar"><label>{t('Szukaj w bazie wiedzy','Search the knowledge base')}<input placeholder={t('Np. synchronizacja, faktura, dostęp…','E.g. synchronization, invoice, access…')} type="search" value={search} onChange={e=>update({helpSearch:e.target.value})}/></label><label>{t('Temat','Topic')}<select value={category} onChange={e=>update({helpCategory:e.target.value})}>{[['all',t('Wszystkie','All')],['data',t('Dane i integracje','Data and integrations')],['analysis',t('Analizy','Analytics')],['access',t('Dostęp','Access')],['assistant',t('Papa Asystent','Papa Assistant')]].map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label></div>
  <ProductSectionFrame className="pd-help-guides" icon="help" title={t('Procedury i wyjaśnienia','Guidance and explanations')} description={t('Znajdź odpowiedź i przejdź do właściwego miejsca w aplikacji.','Find an answer and open the relevant area of the app.')}>
   <div className="pd-product-data__grid">{rows.map(p=><article key={p.id}><h3>{t(...p.title)}</h3><p>{t(...p.summary)}</p><Button variant="secondary" onClick={()=>update({procedure:p.id})}>{t('Otwórz procedurę','Open guidance')}</Button></article>)}</div>{!rows.length&&<ProductDataState state="empty" problem={t('Zmień zapytanie lub zgłoś problem z własnym opisem.','Change the query or report the problem in your own words.')}/>}
  </ProductSectionFrame>
  <ProductSectionFrame className="pd-help-assistant" icon="assistant" title={t('Pomoc z kontekstem analizy','Help in the context of your analysis')} description={t('Przejdź do rozmowy z zachowanym kontekstem bieżącej analizy.','Continue your conversation with the current analysis context.')}><Button variant="secondary" onClick={()=>navigate(contextualProductLink(productRoutes.assistant,{helpTopic:requested,prompt:search||null}))}>{t('Otwórz Papa Asystenta','Open Papa Assistant')}</Button></ProductSectionFrame>
  <ProductSectionFrame icon="data" title={t('Sprawy tego workspace','Workspace requests')} description={t(`Ostatnie ${tickets.length} z ${total} spraw. Prośba o konsultację nie jest rezerwacją terminu.`,`Latest ${tickets.length} of ${total} requests. A consultation request is not a booked appointment.`)} actions={onReload?<Button variant="ghost" size="small" onClick={onReload}>{t('Odśwież','Refresh')}</Button>:null}>
   <div className="pd-product-data__toolbar"><label>{t('Szukaj w sprawach','Search requests')}<input type="search" value={ticketSearch} maxLength={160} onChange={e=>update({ticketSearch:e.target.value,ticketPage:null})}/></label><label>{t('Status','Status')}<select value={ticketStatus} onChange={e=>update({ticketStatus:e.target.value,ticketPage:null})}><option value="all">{t('Wszystkie','All')}</option>{Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>
   {deliveryWarning&&<p role="alert">{deliveryWarning}</p>}
   <ProductDataState state={state} problem={problem} onRetry={onReload}><ExplorerTable rows={tickets} manualSearch searchQuery={ticketSearch} onSearchQueryChange={value=>update({ticketSearch:value,ticketPage:null})} canExport={false} ariaLabel={t('Sprawy wsparcia','Support requests')} columns={[
    {id:'number',label:t('Numer sprawy','Request number'),required:true,render:row=><Button variant="ghost" size="small" onClick={()=>update({ticketId:row.id,procedure:null})}>{row.number}</Button>},{id:'subject',label:t('Temat','Subject')},{id:'status',label:t('Status','Status'),render:row=>labels[row.status]??row.status},
    {id:'createdAt',label:t('Utworzono','Created'),render:row=>new Intl.DateTimeFormat(language,{dateStyle:'medium',timeStyle:'short'}).format(new Date(row.createdAt))}]} emptyTitle={t('Brak zapisanych spraw','No saved requests')} emptyMessage={t('Zapisane zgłoszenie pojawi się tutaj po odpowiedzi serwera.','A submitted request appears here after the server responds.')}/></ProductDataState>
   <div className="pd-product-data__toolbar"><span>{t('Strona','Page')} {ticketPage} / {Math.max(1,Math.ceil(total/pageSize))}</span><Button size="small" variant="ghost" disabled={ticketPage<=1||state==='loading'} onClick={()=>update({ticketPage:String(ticketPage-1)})}>{t('Poprzednia','Previous')}</Button><Button size="small" variant="ghost" disabled={ticketPage*pageSize>=total||state==='loading'} onClick={()=>update({ticketPage:String(ticketPage+1)})}>{t('Następna','Next')}</Button></div>
  </ProductSectionFrame>
  <SupportTicketThread ticket={ticketDetail} state={ticketState} problem={ticketProblem} onRetry={onReloadTicket} onCommand={onTicketCommand}/>
  <Dialog open={Boolean(procedure)} onOpenChange={open=>{if(!open)update({procedure:null});}} title={procedure?t(...procedure.title):t('Procedura','Guidance')} description={procedure?t(...procedure.summary):null} modal closeOnEscape dismissible>
   {procedure&&<><ol>{procedure.steps.map((step,index)=><li key={index}><p>{t(...step)}</p></li>)}</ol><div className="pd-product-data__toolbar"><Button variant="secondary" onClick={()=>navigate(contextualProductLink(procedure.route))}>{t('Otwórz obszar','Open the area')}</Button><Button onClick={()=>open('technical')}>{t('Problem nadal występuje','The problem persists')}</Button></div></>}
  </Dialog>
  <Dialog open={Boolean(kind)} onOpenChange={open=>{if(!open&&!pending&&(created||(!subject.trim()&&!message.trim())||window.confirm(t('Odrzucić niezapisane zgłoszenie?','Discard the unsaved request?')))){setKind(null);setFailure(null);}}} title={kind==='consultation'?t('Prośba o konsultację','Consultation request'):t('Nowe zgłoszenie','New support request')} description={t('Sprawa jest widoczna dla osób z dostępem do tego workspace.','The request is visible to people with access to this workspace.')} modal closeOnEscape={!pending} dismissible={!pending}>
   {created?<div role="status"><h3>{t('Zapisano sprawę','Request saved')}</h3><p><code>{created.number}</code></p><p>{t('Zapisano w kolejce serwera. Nie potwierdzono doręczenia e-maila, przydziału konsultanta ani terminu spotkania.','Saved in the server queue. Email delivery, consultant assignment and a meeting time have not been confirmed.')}</p><Button onClick={()=>{setKind(null);update({ticketId:created.id});}}>{t('Zamknij','Close')}</Button></div>:<form onSubmit={e=>{e.preventDefault();void submit();}} className="pd-product-data__form">
    <label>{t('Temat','Subject')}<input required minLength={5} maxLength={160} value={subject} onChange={e=>setSubject(e.target.value)} disabled={pending}/></label><label>{t('Opis i oczekiwany rezultat','Description and expected result')}<textarea required minLength={20} maxLength={10000} rows={6} value={message} onChange={e=>setMessage(e.target.value)} disabled={pending}/></label>
    <p>{t('Nie wpisuj haseł, tokenów, kodów MFA ani danych klientów.','Do not include passwords, tokens, MFA codes or customer personal data.')}</p><label><input type="checkbox" checked={included} onChange={e=>setIncluded(e.target.checked)} disabled={pending}/>{t('Dołącz poniższy kontekst','Attach the context below')}</label>{included&&<pre className="pd-product-data__context">{JSON.stringify(context,null,2)}</pre>}
    {kind==='consultation'&&<p>{t('Dostępność kalendarza nie jest podłączona. Wysyłasz prośbę o ustalenie terminu, nie rezerwację.','Calendar availability is not connected. This requests scheduling; it does not reserve a slot.')}</p>}
    {failure&&<p role="alert">{failure}</p>}{!onSubmit&&<p role="status">{t('Wysyłka nie jest dostępna w tym scenariuszu.','Submission is not available in this scenario.')}</p>}
    <div className="pd-product-data__toolbar"><Button type="submit" disabled={pending||!onSubmit}>{pending?t('Zapisywanie…','Saving…'):t('Wyślij zgłoszenie','Submit request')}</Button><Button variant="secondary" disabled={pending} onClick={()=>{if((!subject.trim()&&!message.trim())||window.confirm(t('Odrzucić niezapisane zgłoszenie?','Discard the unsaved request?')))setKind(null);}}>{t('Anuluj','Cancel')}</Button></div>
   </form>}
  </Dialog>
 </div>;
}
