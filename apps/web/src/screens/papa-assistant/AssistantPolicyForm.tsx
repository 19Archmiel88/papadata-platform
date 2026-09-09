import {useEffect,useState} from 'react';
import {assistantReadTools,type AssistantPreferences} from '@papadata/contracts';
import {Button,Dialog} from '../../design-system';
import '../../runtime/shell/papa-assistant/assistant-workspace.css';
export function AssistantPolicyForm({data,onSave,busy=false}:{data:AssistantPreferences;onSave:(values:AssistantPreferences)=>Promise<void>;busy?:boolean}){
 const [draft,setDraft]=useState(data),[confirm,setConfirm]=useState(false),[error,setError]=useState('');
 useEffect(()=>{setDraft(data);setConfirm(false);},[data]);const dirty=JSON.stringify(data)!==JSON.stringify(draft);
 useEffect(()=>{if(!dirty)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 const tool=(name:string)=>setDraft(d=>({...d,allowedReadTools:d.allowedReadTools.includes(name)?d.allowedReadTools.filter(t=>t!==name):[...d.allowedReadTools,name]}));
 return <><form className="pd-assistant-workspace__form" onSubmit={e=>{e.preventDefault();setConfirm(true);}}><fieldset disabled={busy||!data.canEdit}><legend>Polityka aktywnego workspace’u · wersja {data.version}</legend>
 <label><input type="checkbox" checked={draft.historyEnabled} onChange={e=>setDraft(d=>({...d,historyEnabled:e.target.checked}))}/>Dołączaj poprzednie wiadomości do modelu</label><label>Okno kontekstu (dni)<input type="number" min={1} max={365} value={draft.contextDays} required onChange={e=>setDraft(d=>({...d,contextDays:Number(e.target.value)}))}/></label>
 <p>To ograniczenie historii wysyłanej przy nowym pytaniu, nie kasowanie audytu ani zapisanych rozmów.</p>
 <label><input type="checkbox" checked={draft.memoryEnabled} onChange={e=>setDraft(d=>({...d,memoryEnabled:e.target.checked}))}/>Zezwalaj na pamięć osobistą</label><label><input type="checkbox" checked={draft.attachmentEnabled} onChange={e=>setDraft(d=>({...d,attachmentEnabled:e.target.checked}))}/>Zezwalaj na pliki tekstowe</label>
 <fieldset><legend>Odczyty dopuszczone do pracy AI</legend>{assistantReadTools.map(name=><label key={name}><input type="checkbox" checked={draft.allowedReadTools.includes(name)} onChange={()=>tool(name)}/>{name}</label>)}</fieldset><p>Wyłączenie context, evidence lub metrics blokuje generowanie; nie jest obejściem wymogu dowodów. Uprawnienia użytkownika nadal obowiązują.</p>
 <Button type="submit" disabled={!dirty}>Przejrzyj zmianę</Button><Button variant="ghost" onClick={()=>setDraft(data)}>Anuluj zmiany</Button></fieldset></form>
 {!data.canEdit&&<p>Zmiana zasad wymaga workspace.manage i ponownego uwierzytelnienia.</p>}
 <p>Wykonywanie i cofanie zewnętrznych AI Actions pozostaje zablokowane. Te ustawienia nie udzielają dostępu do narzędzi wykonawczych.</p>
 <Dialog open={confirm} onOpenChange={open=>{if(!busy)setConfirm(open);}} title="Zatwierdź politykę AI" description="Zmiana dotyczy wszystkich użytkowników workspace’u. Aktywne zadanie może zostać przerwane po zmianie polityki." modal closeOnEscape={!busy} dismissible={!busy}>
 <dl>{(['historyEnabled','contextDays','memoryEnabled','attachmentEnabled','allowedReadTools'] as const).filter(key=>JSON.stringify(data[key])!==JSON.stringify(draft[key])).map(key=><div key={key}><dt>{key}</dt><dd>{JSON.stringify(data[key])} → {JSON.stringify(draft[key])}</dd></div>)}</dl>{error&&<p role="alert">{error}</p>}
 <Button disabled={busy} onClick={()=>{setError('');void onSave(draft).then(()=>setConfirm(false)).catch(cause=>setError(cause instanceof Error?cause.message:'Zapis nie powiódł się.'));}}>Zatwierdzam zmianę</Button><Button variant="ghost" disabled={busy} onClick={()=>setConfirm(false)}>Wróć</Button></Dialog></>;
}
