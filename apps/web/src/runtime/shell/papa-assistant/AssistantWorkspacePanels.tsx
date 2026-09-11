import {AssistantPolicyForm} from '../../../screens/papa-assistant/AssistantPolicyForm';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AssistantPreferences, AssistantThread, AssistantMemory, AssistantAttachment, AssistantContextExport } from '@papadata/contracts';
import { assistantAttachmentByteLimit } from '@papadata/contracts';
import { Button, Dialog } from '../../../design-system';
import { usePapaAssistantRuntime } from './PapaAssistantRuntimeContext';
import { safeRandomUUID } from '../../shared/id/safeRandomUUID';
import { isRecord } from './assistantModel';
import { bffClient } from '../../shared/api/bffClient';
import './assistant-workspace.css';
import { readProductLocale } from '../../../screens/shared/useProductLocale';

type ReadPath=Parameters<typeof bffClient.readAssistantWorkspace>[0];
function useWorkspace<T>(path:ReadPath|null){
 const runtime=usePapaAssistantRuntime(),[data,update]=useState<T|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(false),[revision,bump]=useState(0);
 useEffect(()=>{let active=true;const controller=new AbortController();update(null);setError('');
  if(!path||!runtime.gateway.workspace){setLoading(false);return;}
  setLoading(true);void runtime.gateway.workspace.readAssistantWorkspace<T>(path,controller.signal).then(value=>{if(active)update(value);}).catch(cause=>{if(active)setError(cause instanceof Error?cause.message:'Nie udało się odczytać danych.');}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;controller.abort();};
 },[path,revision,runtime.gateway]);
 return {data,error,loading,reload:()=>bump(n=>n+1)};
}
function State({loading,error,children}:{loading:boolean;error:string;children?:ReactNode}){return <>{loading&&<p role="status">Wczytywanie danych…</p>}{error&&<p role="alert" className="pd-assistant__error">{error}</p>}{!loading&&!error&&children}</>;}
function useMutation(){
 const runtime=usePapaAssistantRuntime(),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[error,setError]=useState(''),lock=useRef(false),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const run=async(fn:()=>Promise<unknown>,then?:()=>void)=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');setNotice('');
  try{await runtime.runCommand(fn);if(alive.current){setNotice('Serwer potwierdził operację.');then?.();}}catch(cause){if(alive.current)setError(cause instanceof Error?cause.message:'Operacja nie powiodła się.');}finally{lock.current=false;if(alive.current)setBusy(false);}};
 return {busy,notice,error,run};
}
function DemoNote(){const {demo,gateway}=usePapaAssistantRuntime();return !gateway.workspace?<p className="pd-assistant__note">{demo?'Demonstracja: poniższe operacje wymagają sesji API. Nie zapisujemy fikcyjnego potwierdzenia.':'Ten transport nie udostępnia operacji workspace’u.'}</p>:null;}
const stamp=(value:string|null)=>value?new Date(value).toLocaleString(readProductLocale()==='en'?'en-US':'pl-PL'):'bez terminu';

export function AssistantHistoryPanel(){
 const runtime=usePapaAssistantRuntime(),[search,setSearch]=useState(''),[filter,setFilter]=useState(''),[page,setPage]=useState(0),[archived,setArchived]=useState(false),mutation=useMutation();
 const resource=useWorkspace<{records:AssistantThread[];hasMore:boolean}>(`threads?search=${encodeURIComponent(filter)}&page=${page}&archived=${archived}`);
 return <section className="pd-assistant__section"><h2>Rozmowy i wątki spraw</h2><p>Twoje wątki w aktywnym workspace. Archiwizacja ukrywa wątek, ale nie usuwa historii.</p><DemoNote/>
 <form className="pd-assistant-workspace__form" onSubmit={e=>{e.preventDefault();setFilter(search.trim());setPage(0);}}><label>Szukaj tytułu<input maxLength={120} value={search} onChange={e=>setSearch(e.target.value)}/></label><Button type="submit" variant="secondary">Szukaj</Button><label><input type="checkbox" checked={archived} onChange={e=>{setArchived(e.target.checked);setPage(0);}}/>Archiwum</label></form>
 <State loading={resource.loading} error={resource.error||mutation.error}/>{mutation.notice&&<p role="status">{mutation.notice}</p>}
 {resource.data?.records.length===0&&<p>Brak wątków dla wybranego filtra.</p>}
 <ul className="pd-assistant__timeline">{resource.data?.records.map(thread=><li key={thread.id}><strong>{thread.title}</strong><p>{thread.kind==='case'?'Sprawa':'Rozmowa'} · {stamp(thread.updatedAt)}</p><code>{thread.id}</code>{thread.parentId&&<p>Wątek nadrzędny: <code>{thread.parentId}</code></p>}
 <div className="pd-assistant__actions"><Button disabled={runtime.busy} onClick={()=>void runtime.restoreConversation(thread.id)}>Otwórz ten wątek</Button>{thread.canArchive&&<Button variant="secondary" disabled={mutation.busy||runtime.busy} onClick={()=>void mutation.run(()=>runtime.gateway.workspace!.commandAssistantWorkspace('threads/archive',{requestId:safeRandomUUID(),conversationId:thread.id,archived:!archived}),resource.reload)}>{archived?'Przywróć z archiwum':'Archiwizuj'}</Button>}</div></li>)}</ul>
 <div className="pd-assistant__actions"><Button variant="ghost" disabled={!page||resource.loading} onClick={()=>setPage(n=>n-1)}>Poprzednie</Button><span>Strona {page+1}</span><Button variant="ghost" disabled={!resource.data?.hasMore||resource.loading||page>=1000} onClick={()=>setPage(n=>n+1)}>Następne</Button><Button variant="ghost" onClick={resource.reload}>Odśwież</Button></div>
 </section>;
}

export function AssistantMemoryPanel(){
 const runtime=usePapaAssistantRuntime(),resource=useWorkspace<AssistantMemory[]>('memory'),policy=useWorkspace<AssistantPreferences>('preferences'),mutation=useMutation();
 const [editing,setEditing]=useState<AssistantMemory|null>(null),[title,setTitle]=useState(''),[content,setContent]=useState(''),[days,setDays]=useState(30),[deleting,setDeleting]=useState<AssistantMemory|null>(null);
 const request=useRef<{signature:string;id:string;noteId:string}|null>(null);
 const clear=()=>{setEditing(null);setTitle('');setContent('');request.current=null;};
 const save=()=>{const signature=JSON.stringify([editing?.id,editing?.version,title,content,days]);if(request.current?.signature!==signature)request.current={signature,id:safeRandomUUID(),noteId:editing?.id??safeRandomUUID()};const current=request.current;
  return mutation.run(()=>runtime.gateway.workspace!.commandAssistantWorkspace('memory',{requestId:current.id,id:current.noteId,expectedVersion:editing?.version??0,title:title.trim(),content:content.trim(),days}),()=>{clear();resource.reload();});};
 return <section className="pd-assistant__section"><h2>Pamięć osobista</h2><p>Notatki należą do Twojego konta w tym workspace. Są używane tylko po zaznaczeniu „Dołącz pamięć” przy pytaniu. Nie zapisuj haseł ani danych wrażliwych.</p><DemoNote/>
 <State loading={resource.loading||policy.loading} error={resource.error||policy.error||mutation.error}/>{mutation.notice&&<p role="status">{mutation.notice}</p>}
 {!policy.data?.memoryEnabled&&<p>Pamięć jest wyłączona w polityce workspace’u. Istniejące notatki możesz przeglądać i usuwać.</p>}
 <form className="pd-assistant-workspace__form" onSubmit={e=>{e.preventDefault();void save();}}><h3>{editing?'Edytuj notatkę':'Nowa notatka'}</h3><label>Tytuł<input required minLength={2} maxLength={100} value={title} onChange={e=>setTitle(e.target.value)}/></label><label>Treść<textarea required maxLength={4000} value={content} onChange={e=>setContent(e.target.value)}/></label><label>Ważność w dniach<input type="number" min={1} max={365} required value={days} onChange={e=>setDays(Number(e.target.value))}/></label><div className="pd-assistant__actions"><Button type="submit" disabled={mutation.busy||!policy.data?.memoryEnabled||!runtime.gateway.workspace}>Zapisz notatkę</Button><Button variant="ghost" disabled={mutation.busy} onClick={clear}>Anuluj edycję</Button></div></form>
 <ul className="pd-assistant__timeline">{resource.data?.map(note=><li key={note.id}><h3>{note.title}</h3><p className="pd-assistant-workspace__text">{note.content}</p><small>Wersja {note.version} · wygasa {stamp(note.expiresAt)}</small><div className="pd-assistant__actions"><Button variant="secondary" disabled={mutation.busy} onClick={()=>{setEditing(note);setTitle(note.title);setContent(note.content);}}>Edytuj</Button><Button variant="ghost" disabled={mutation.busy} onClick={()=>setDeleting(note)}>Usuń</Button></div></li>)}</ul>
 <Dialog open={!!deleting} onOpenChange={open=>{if(!open&&!mutation.busy)setDeleting(null);}} title="Usunąć notatkę?" description="Usunięta notatka nie będzie dołączana do nowych odpowiedzi. Nie usuwa to wcześniejszych rozmów." modal closeOnEscape={!mutation.busy} dismissible={!mutation.busy}><Button disabled={mutation.busy} onClick={()=>{if(deleting)void mutation.run(()=>runtime.gateway.workspace!.commandAssistantWorkspace('memory/delete',{requestId:safeRandomUUID(),id:deleting.id,expectedVersion:deleting.version}),()=>{setDeleting(null);resource.reload();});}}>Potwierdzam usunięcie</Button><Button variant="ghost" disabled={mutation.busy} onClick={()=>setDeleting(null)}>Anuluj</Button></Dialog>
 </section>;
}

export function AssistantFilesPanel(){
 const runtime=usePapaAssistantRuntime(),policy=useWorkspace<AssistantPreferences>('preferences'),resource=useWorkspace<AssistantAttachment[]>(runtime.conversationId?`attachments/${runtime.conversationId}`:null),mutation=useMutation();
 const [file,setFile]=useState<{name:string;content:string}|null>(null),[problem,setProblem]=useState(''),[deleting,setDeleting]=useState<AssistantAttachment|null>(null);
 const input=useRef<HTMLInputElement>(null),readEpoch=useRef(0),request=useRef<{signature:string;id:string}|null>(null);
 useEffect(()=>()=>{readEpoch.current++;},[]);
 const select=async(f:File|undefined)=>{const version=++readEpoch.current;setProblem('');setFile(null);if(!f)return;try{if(f.size>assistantAttachmentByteLimit||!/[.](txt|md|csv|json)$/i.test(f.name))throw new Error('Dopuszczalne: TXT/MD/CSV/JSON UTF-8 do 128 KiB.');const content=new TextDecoder('utf-8',{fatal:true}).decode(await f.arrayBuffer());if(!content.trim()||content.includes('\x00'))throw new Error('Plik musi zawierać tekst.');if(version===readEpoch.current){setFile({name:f.name,content});request.current=null;}}catch(e){if(version===readEpoch.current)setProblem(e instanceof Error?e.message:'Nie udało się odczytać pliku.');}};
 const upload=()=>mutation.run(async()=>{if(!file)return;const id=await runtime.ensureConversation(),signature=JSON.stringify([id,file.name,file.content]);if(request.current?.signature!==signature)request.current={signature,id:safeRandomUUID()};await runtime.gateway.workspace!.commandAssistantWorkspace('attachments',{requestId:request.current.id,conversationId:id,...file});},()=>{setFile(null);if(input.current)input.current.value='';resource.reload();});
 return <section className="pd-assistant-workspace__files"><h3>Pliki odniesienia</h3><p>Plik do 128 KiB; wybrane pliki i notatki razem do 16 000 znaków. Cały prompt ma osobny limit 32 000 znaków. Przekroczenie blokuje generowanie zamiast cichego obcinania danych.</p><p>Do 5 plików tekstowych na rozmowę; ważność 7 dni. Oznacz wybrane pliki przed pytaniem. Zawartość jest materiałem, nie instrukcją ani automatycznie dowodem prawdziwości.</p><DemoNote/>
 <State loading={resource.loading||policy.loading} error={problem||resource.error||policy.error||mutation.error}/>{mutation.notice&&<p role="status">{mutation.notice}</p>}
 <label>Wybierz plik<input ref={input} type="file" accept=".txt,.md,.csv,.json" disabled={runtime.busy||mutation.busy||!policy.data?.attachmentEnabled} onChange={e=>void select(e.target.files?.[0])}/></label>
 {!policy.data?.attachmentEnabled&&<p>Dołączanie plików jest wyłączone w ustawieniach AI.</p>}
 {file&&<div className="pd-assistant__artifact"><h4>Podgląd przed przesłaniem: {file.name}</h4><p>Sprawdź treść. Redakcja serwerowa nie gwarantuje wykrycia wszystkich sekretów.</p><pre>{file.content.slice(0,3000)}</pre><p>{file.content.length>3000?'Podgląd pokazuje pierwsze 3000 znaków; zostanie wysłany cały plik.':''}</p><Button disabled={mutation.busy||runtime.busy||!runtime.snapshot} onClick={()=>void upload()}>Prześlij do tej rozmowy</Button><Button variant="ghost" disabled={mutation.busy} onClick={()=>setFile(null)}>Anuluj</Button></div>}
 <ul className="pd-assistant__context-list">{resource.data?.map(attachment=><li key={attachment.id}><label><input type="checkbox" disabled={runtime.busy} checked={runtime.attachmentIds.includes(attachment.id)} onChange={()=>runtime.toggleAttachment(attachment.id)}/><span><strong>{attachment.name}</strong><small>{attachment.bytes} bajtów · wygasa {stamp(attachment.expiresAt)}</small><small>{attachment.excerpt}</small></span></label><Button size="small" variant="ghost" disabled={mutation.busy||runtime.busy} onClick={()=>setDeleting(attachment)}>Usuń plik</Button></li>)}</ul>
 <label><input type="checkbox" disabled={runtime.busy||!policy.data?.memoryEnabled||!policy.data.allowedReadTools.includes('memory')} checked={runtime.useMemory} onChange={e=>runtime.setUseMemory(e.target.checked)}/>Dołącz aktywne notatki z pamięci osobistej do następnego pytania</label>
 <Dialog open={!!deleting} onOpenChange={open=>{if(!open&&!mutation.busy)setDeleting(null);}} title="Usunąć plik z rozmowy?" description="Plik zostanie usunięty z biblioteki. Tekst już wykorzystany w zapisanej odpowiedzi pozostaje w historii." modal closeOnEscape={!mutation.busy} dismissible={!mutation.busy}><Button disabled={mutation.busy} onClick={()=>{if(deleting)void mutation.run(()=>runtime.gateway.workspace!.commandAssistantWorkspace('attachments/delete',{id:deleting.id,requestId:safeRandomUUID()}),()=>{runtime.removeAttachment(deleting.id);setDeleting(null);resource.reload();});}}>Usuń plik</Button><Button variant="ghost" disabled={mutation.busy} onClick={()=>setDeleting(null)}>Anuluj</Button></Dialog>
 </section>;
}

export function AssistantPolicyPanel(){
 const runtime=usePapaAssistantRuntime(),resource=useWorkspace<AssistantPreferences>('preferences'),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),request=useRef<{signature:string;id:string}|null>(null),lock=useRef(false),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 async function save(draft:AssistantPreferences){if(lock.current)return;lock.current=true;setBusy(true);const signature=JSON.stringify(draft);if(request.current?.signature!==signature)request.current={signature,id:safeRandomUUID()};
  try{await runtime.runCommand(()=>runtime.gateway.workspace!.commandAssistantWorkspace('preferences',{requestId:request.current!.id,expectedVersion:draft.version,historyEnabled:draft.historyEnabled,contextDays:draft.contextDays,memoryEnabled:draft.memoryEnabled,attachmentEnabled:draft.attachmentEnabled,allowedReadTools:draft.allowedReadTools}));if(alive.current){setNotice('Polityka zapisana. Trwa odczyt nowej wersji.');resource.reload();}request.current=null;}finally{lock.current=false;if(alive.current)setBusy(false);}}
 return <section className="pd-assistant__section"><h2>Zasady pracy i pamieci</h2><DemoNote/><State loading={resource.loading} error={resource.error}/>{notice&&<p role="status">{notice}</p>}{resource.data&&<AssistantPolicyForm data={resource.data} busy={busy} onSave={save}/>}<Button variant="ghost" onClick={resource.reload}>Odswiez polityke</Button></section>;
}

export function AssistantExportPanel(){
 const runtime=usePapaAssistantRuntime(),[preview,setPreview]=useState<AssistantContextExport|null>(null),mutation=useMutation();
 const load=()=>mutation.run(async()=>{if(!runtime.conversationId)throw new Error('Wybierz zapisaną rozmowę.');const value=await runtime.gateway.workspace!.readAssistantWorkspace<AssistantContextExport>(`export/${runtime.selectedElementId?runtime.caseThreadIds[runtime.selectedElementId]??runtime.conversationId:runtime.conversationId}`);setPreview(value);});
 const download=()=>{if(!preview)return;const url=URL.createObjectURL(new Blob([JSON.stringify(preview,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`papa-context-${preview.conversationId}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <section className="pd-assistant__section"><h2>Eksport kontekstu i MCP</h2><p>Eksport wymaga uprawnień do historii i pobierania raportów oraz step-up. Zawiera migawkę ekranu, maksymalnie 100 wiadomości i 100 dowodów. Nie obejmuje plików ani notatek pamięci.</p><DemoNote/><State loading={mutation.busy} error={mutation.error}/><Button disabled={!runtime.gateway.workspace||!runtime.conversationId||mutation.busy} onClick={()=>void load()}>Przygotuj i pokaż zakres eksportu</Button>
 {preview&&<div className="pd-assistant__artifact"><h3>{preview.title}</h3><p>{preview.messages.length} wiadomości · {preview.evidence.length} dowodów · {stamp(preview.exportedAt)}</p><p>Sprawdź dane przed przekazaniem do innego narzędzia.</p><details><summary>Cała zawartość pliku JSON</summary><pre>{JSON.stringify(preview,null,2)}</pre></details><Button onClick={download}>Pobierz zatwierdzony podgląd</Button></div>}
 <h3>Lokalny, tylko do odczytu serwer MCP</h3><p>Dołączony skrypt <code>tools/papa-context-mcp.mjs</code> czyta wyłącznie jawnie wskazany plik tego eksportu. Nie łączy się z API, nie dziedziczy sesji i nie wykonuje akcji w Twoim workspace. Dostęp do pliku musi kontrolować właściciel komputera.</p><pre>node tools/papa-context-mcp.mjs /pelna/sciezka/papa-context.json</pre><p>Serwerowy MCP z autoryzacją online i narzędziami wykonawczymi nie jest włączony.</p></section>;
}

const diagnostics=[['contracts','Struktura odpowiedzi','contracts',['thesis','confidence','riskLevel','humanRequired','limitations']],['provenance','Pochodzenie metryk','snapshots',['sourceModule','metricIdentifiers','dateRange','currency','freshness','dataQuality']],['provider','Dostawca i koszty','events',['providerName','modelName','status','cost','timeoutMs','retryCount','errorCode']],['privacy','Redakcja danych','events',['stage','policyVersion','detectedCategories','fieldsRedacted','blocked','blockReason']]] as const;
export function AssistantDiagnosticsPanel(){
 const runtime=usePapaAssistantRuntime(),[kind,setKind]=useState<(typeof diagnostics)[number][0]>('contracts');const thread=runtime.selectedElementId?runtime.caseThreadIds[runtime.selectedElementId]??runtime.conversationId:runtime.conversationId;
 const resource=useWorkspace<unknown>(thread?`diagnostics?kind=${kind}&conversationId=${encodeURIComponent(thread)}`:null),descriptor=diagnostics.find(d=>d[0]===kind)!;
 const raw=isRecord(resource.data)?resource.data[descriptor[2]]:null,records=Array.isArray(raw)?raw.filter(isRecord):[];
 return <section className="pd-assistant__section"><h2>Dowody, pochodzenie i ograniczenia</h2><p>Ostatnie 30 zapisanych rekordów tej rozmowy. Brak rekordu nie jest potwierdzeniem poprawności. Koszt może być rezerwacją bezpieczeństwa lub estymacją, nie rachunkiem dostawcy.</p><DemoNote/><label>Rodzaj danych<select value={kind} onChange={e=>setKind(e.target.value as typeof kind)}>{diagnostics.map(d=><option key={d[0]} value={d[0]}>{d[1]}</option>)}</select></label><State loading={resource.loading} error={resource.error}/>{!thread&&<p>Wybierz rozmowę, aby odczytać dowody.</p>}{thread&&!resource.loading&&!resource.error&&!records.length&&<p>Brak zapisanych rekordów tego rodzaju.</p>}
 {records.map((row,index)=><article className="pd-assistant__artifact" key={String(row.id??index)}><h3>{descriptor[1]} · {index+1}</h3><dl>{descriptor[3].map(key=><div key={key}><dt>{key}</dt><dd className="pd-assistant-workspace__text">{row[key]===null||row[key]===undefined?'Nie podano':typeof row[key]==='string'?row[key]:JSON.stringify(row[key])}</dd></div>)}</dl><small>{typeof row.createdAt==='string'?stamp(row.createdAt):''}</small></article>)}</section>;
}
export function AssistantNotificationsPanel(){
 const runtime=usePapaAssistantRuntime(),resource=useWorkspace<{notifications:Record<string,unknown>[]}>('notifications'),mutation=useMutation();
 const command=(id:string,action:'read'|'snooze'|'unsnooze')=>mutation.run(()=>runtime.gateway.workspace!.commandAssistantWorkspace('notifications',{requestId:safeRandomUUID(),notificationId:id,action,...(action==='snooze'?{snoozedUntil:new Date(Date.now()+3600000).toISOString()}:{})}),resource.reload);
 return <section className="pd-assistant__section"><h2>Powiadomienia AI</h2><p>Ostatnie 50 powiadomień workspace’u, także odroczonych i przeczytanych. Oznaczenie odczytu jest wspólne dla workspace’u, nie prywatne.</p><DemoNote/><State loading={resource.loading} error={resource.error||mutation.error}/>{mutation.notice&&<p role="status">{mutation.notice}</p>}{resource.data?.notifications.length===0&&<p>Brak powiadomień.</p>}
 {resource.data?.notifications.map(row=><article className="pd-assistant__artifact" key={String(row.id)}><h3>{String(row.title??'Powiadomienie')}</h3><p>{String(row.message??'')}</p><small>{String(row.severity??'')} · {row.readAt?'przeczytane':'nieprzeczytane'}</small><div className="pd-assistant__actions"><Button variant="secondary" disabled={mutation.busy||!!row.readAt} onClick={()=>void command(String(row.id),'read')}>Oznacz jako przeczytane</Button><Button variant="ghost" disabled={mutation.busy||row.severity==='critical'} onClick={()=>void command(String(row.id),row.snoozedUntil?'unsnooze':'snooze')}>{row.snoozedUntil?'Zakończ odroczenie':'Odrocz na godzinę'}</Button>{typeof row.caseThreadId==='string'&&<Button variant="ghost" disabled={runtime.busy} onClick={()=>void runtime.restoreConversation(String(row.caseThreadId))}>Otwórz powiązaną sprawę</Button>}</div></article>)}<Button variant="ghost" onClick={resource.reload}>Odśwież</Button></section>;
}
