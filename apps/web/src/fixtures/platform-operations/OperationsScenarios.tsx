import { useEffect, useState } from 'react';
import type { BillingOverview, SettingsOverview, QualityOverview } from '@papadata/contracts';
import type { RemoteState } from '../../runtime/shared/data/useRemoteResource';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
import { safeRandomUUID } from '../../runtime/shared/id/safeRandomUUID';
import { SettingsOperationsScreen, resolveSettingsView } from '../../screens/platform-operations/SettingsOperationsScreen';
import { SettingsTeamPanel } from '../../screens/platform-operations/SettingsTeamPanel';
import { SettingsSecurityPanel } from '../../screens/platform-operations/SettingsSecurityPanel';
import { SettingsPrivacyPanel } from '../../screens/platform-operations/SettingsPrivacyPanel';
import { SettingsAuditPanel } from '../../screens/platform-operations/SettingsAuditPanel';
import { SettingsGovernancePanel } from '../../screens/platform-operations/SettingsGovernancePanel';
import { BillingOperationsScreen } from '../../screens/platform-operations/BillingOperationsScreen';
import { DataQualityScreen } from '../../screens/platform-operations/DataQualityScreen';
import { billingOperationsFixture, settingsOperationsFixture, operationsTeamFixture, operationsSessionsFixture, operationsPrivacyFixture, operationsAuditFixture, qualityOperationsFixture, qualityLineageFixture } from './platformOperationsFixtures';
export type OperationsScenarioProps={state?:RemoteState;readonly?:boolean;initialView?:string;failSave?:boolean;empty?:boolean};
/** UI-only fixtures: no backend, payment, email, identity, or provider call. */
export function SettingsOperationsDemo({state='ready',readonly=false,initialView,failSave=false,empty=false}:OperationsScenarioProps){
 const [data,setData]=useState<SettingsOverview>(()=>structuredClone(settingsOperationsFixture)),[team,setTeam]=useState(()=>structuredClone(operationsTeamFixture)),[sessions,setSessions]=useState(()=>[...operationsSessionsFixture]),[privacy,setPrivacy]=useState(()=>[...operationsPrivacyFixture]),[notice,setNotice]=useState<string|null>(null);
 const {params,location,update}=useProductQuery(),view=resolveSettingsView(location,params.get('settingsView'));
 useEffect(()=>{if(initialView&&!new URLSearchParams(window.location.search).has('settingsView'))update({settingsView:initialView});},[initialView,update]);
 const local=()=>{if(failSave)throw new globalThis.Error('Demo: zapis odrzucony. Dane nie zostaly zmienione.');setNotice('Demo: operacja w pamieci widoku. Nie zapisano nic na serwerze.');};
 const display={...data,documents:empty?[]:data.documents.map(doc=>({...doc,canEdit:!readonly}))};
 return <>{notice&&<p role="status">{notice}</p>}<SettingsOperationsScreen data={display} state={state} demo problem={state==='error'?'Demonstracyjny blad odczytu':null} onReload={()=>setNotice('Demo: nie wywolano API.')} onSave={readonly?undefined:async(section,command)=>{local();const current=data.documents.find(doc=>doc.section===section)!;if(current.version!==command.expectedVersion)throw new globalThis.Error('Demo: konflikt wersji');const next={...current,version:current.version+1,values:command.values,updatedAt:new Date().toISOString()};setData(value=>({...value,documents:value.documents.map(doc=>doc.section===section?next:doc)}));return next;}}>
 {view==='team'&&<SettingsTeamPanel data={{...team,canManage:!readonly}} onInvite={async(email,role)=>{local();setTeam(v=>({...v,invitations:[...v.invitations,{id:safeRandomUUID(),email,role,status:'pending',createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+86400000).toISOString()}]}));}} onCancelInvitation={async id=>{local();setTeam(v=>({...v,invitations:v.invitations.filter(row=>row.id!==id)}));}} onMember={async(id,input)=>{local();setTeam(v=>({...v,members:v.members.map(row=>row.id===id?{...row,role:input.role??row.role,status:input.action==='revoke'?'revoked':row.status,version:row.version+1}:row)}));}}/>}
 {view==='security'&&<SettingsSecurityPanel sessions={sessions} mfaEnabled onRevoke={readonly?undefined:async id=>{local();setSessions(v=>v.filter(row=>row.sessionId!==id));}}/>}
 {view==='privacy'&&<SettingsPrivacyPanel requests={privacy} onCreate={readonly?undefined:async input=>{local();setPrivacy(v=>[{id:input.requestId,kind:input.requestType,subject:input.subjectReference,status:'pending',requestedAt:new Date().toISOString(),dueAt:new Date(Date.now()+30*86400000).toISOString(),completedAt:null,legalHold:false,targets:[]},...v]);}}/>}
 {view==='audit'&&<SettingsAuditPanel page={operationsAuditFixture}/>}
 {view==='ai'&&<SettingsGovernancePanel data={{mode:'demo',approval:true,scopeRequired:true,execute:'not_configured',rollback:'not_configured',counts:[]}}/>}
 </SettingsOperationsScreen></>;
}
export function BillingOperationsDemo({state='ready',readonly=false,initialView,empty=false,failSave=false}:OperationsScenarioProps){
 const {update}=useProductQuery(),[notice,setNotice]=useState<string|null>(null);
 useEffect(()=>{if(initialView&&!new URLSearchParams(window.location.search).has('billingView'))update({billingView:initialView});},[initialView,update]);
 const data:BillingOverview={...billingOperationsFixture,canManage:!readonly,...(empty?{mode:'disabled',offers:[],invoices:[],portalEnabled:false}:{} )};
 return <>{notice&&<p role="status">{notice}</p>}<BillingOperationsScreen data={data} state={state} demo problem={state==='error'?'Demonstracyjny blad odczytu':null} onReload={()=>setNotice('Demo: bez zapytania do Stripe.')} onSession={readonly?undefined:async()=>{if(failSave)throw new globalThis.Error('Demo: sesja platnicza nie zostala utworzona.');setNotice('Demo: bez przekierowania, bez platnosci i bez wywolania Stripe.');}}/></>;
}
export function QualityOperationsDemo({state='ready',readonly=false,initialView,empty=false,failSave=false}:OperationsScenarioProps){
 const [data,setData]=useState<QualityOverview>(()=>structuredClone(qualityOperationsFixture)),[notice,setNotice]=useState<string|null>(null),{update}=useProductQuery();
 useEffect(()=>{if(initialView&&!new URLSearchParams(window.location.search).has('qualityView'))update({qualityView:initialView});},[initialView,update]);
 return <>{notice&&<p role="status">{notice}</p>}<DataQualityScreen data={empty?{...data,datasets:[],runs:[],reviews:[]}:data} state={state} demo problem={state==='error'?'Demonstracyjny blad odczytu':null} onReload={()=>setNotice('Demo: nie wykonano ponownego przetwarzania.')} onSource={id=>setNotice(`Demo: wskazane zrodlo ${id}; brak operacji API.`)} onReview={readonly?undefined:async command=>{if(failSave)throw new globalThis.Error('Demo: przeglad nie zostal zapisany.');const prior=data.reviews.find(row=>row.connectionId===command.connectionId&&row.stream===command.stream);if((prior?.version??0)!==command.expectedVersion)throw new globalThis.Error('Demo: konflikt wersji');const row={...command,id:prior?.id??command.requestId,version:command.expectedVersion+1,updatedAt:new Date().toISOString()};setData(v=>({...v,reviews:[row,...v.reviews.filter(item=>item.id!==row.id)]}));return row;}} renderLineage={dataset=><div><p>Demonstracja pochodzenia: {dataset.stream}</p><pre>{JSON.stringify(qualityLineageFixture,null,2)}</pre></div>}/></>;
}
