import type {AssistantPreferences} from '@papadata/contracts';
import {AssistantPolicyForm} from '../../screens/papa-assistant/AssistantPolicyForm';
import {safeRandomUUID} from '../../runtime/shared/id/safeRandomUUID';
import { useEffect, useRef, useState } from 'react';
import type { SettingCommand, SettingDocument, SettingsOverview } from '@papadata/contracts';
import { bffClient } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { useRemoteResource } from '../../runtime/shared/data/useRemoteResource';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
import { applyStoredPapaDataRuntimePreference } from '../../design-system/foundations';
import { SettingsOperationsScreen, resolveSettingsView, type SettingsView } from '../../screens/platform-operations/SettingsOperationsScreen';
import { SettingsTeamPanel } from '../../screens/platform-operations/SettingsTeamPanel';
import { SettingsSecurityPanel } from '../../screens/platform-operations/SettingsSecurityPanel';
import { SettingsPrivacyPanel } from '../../screens/platform-operations/SettingsPrivacyPanel';
import { SettingsAuditPanel } from '../../screens/platform-operations/SettingsAuditPanel';
import { SettingsGovernancePanel, parseSettingsGovernance } from '../../screens/platform-operations/SettingsGovernancePanel';
import { MfaSetupDialog } from '../../screens/platform-operations/MfaSetupDialog';
import { ProductDataState } from '../../screens/shared/ProductDataState';
import { useProductLocale } from '../../screens/shared/useProductLocale';
export function SettingsPage(){
 const runtime=useAuthSessionRuntimeContext();
 const scope=`${runtime.session?.activeTenantId}:${runtime.session?.activeWorkspaceId}:${runtime.session?.userId}`;
 return <SettingsRuntime key={scope} scope={scope}/>;
}
function SettingsRuntime({scope}:{scope:string}){
 const runtime=useAuthSessionRuntimeContext(),{params,location}=useProductQuery(),{t}=useProductLocale(),active=useRef<string|null>(scope);active.current=scope;
 useEffect(()=>{active.current=scope;return()=>{active.current=null;};},[scope]);
 const [notice,setNotice]=useState<string|null>(null);
 const resource=useRemoteResource(scope,signal=>bffClient.readSettingsOperations(signal));
 const view=resolveSettingsView(location,params.get('settingsView'));
 async function save(section:SettingDocument['section'],input:SettingCommand):Promise<SettingDocument>{
  const result=await runtime.runAuthenticatedCommand(()=>bffClient.saveSettingsSection(section,input),location);
  if(active.current!==scope)throw new Error('Workspace changed. Reopen settings.');
  if(resource.data)resource.replace({...resource.data,documents:resource.data.documents.map(doc=>doc.section===section?result:doc)});
  setNotice(t('Zapis potwierdzony przez serwer.','Save confirmed by the server.'));
  if(section==='profile'){
   const theme=result.values.theme==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):result.values.theme;
   applyStoredPapaDataRuntimePreference({locale:result.values.language,theme});
  }
  try{const fresh=await bffClient.readSettingsOperations();if(active.current===scope)resource.replace(fresh);}catch{if(active.current===scope)setNotice(t('Zapis potwierdzony. Ponowny odczyt nie powiodl sie; odswiez przed kolejna zmiana.','Save confirmed. Readback failed; refresh before making another change.'));}
  return result;
 }
 return <>{notice&&<p role="status">{notice}</p>}<SettingsOperationsScreen data={resource.data} state={resource.state} problem={resource.problem} onReload={()=>void resource.reload()} onSave={save}>
 {resource.data&&<SettingsAuxiliary key={`${scope}:${view}`} scope={scope} view={view} settings={resource.data} onNotice={setNotice} onSettingsReload={()=>void resource.reload()}/>}
 </SettingsOperationsScreen></>;
}
function SettingsAuxiliary({scope,view,settings,onNotice,onSettingsReload}:{scope:string;view:SettingsView;settings:SettingsOverview;onNotice:(message:string)=>void;onSettingsReload:()=>void}){
 if(view==='team')return <TeamRuntime scope={scope} onNotice={onNotice}/>;
 if(view==='security')return <SecurityRuntime scope={scope} settings={settings} onSettingsReload={onSettingsReload}/>;
 if(view==='privacy')return <PrivacyRuntime scope={scope} onNotice={onNotice}/>;
 if(view==='audit')return <AuditRuntime scope={scope}/>;
 if(view==='ai')return <GovernanceRuntime scope={scope}/>;
 return null;
}
function TeamRuntime({scope,onNotice}:{scope:string;onNotice:(message:string)=>void}){
 const runtime=useAuthSessionRuntimeContext(),{location}=useProductQuery(),{t}=useProductLocale();
 const resource=useRemoteResource(scope,signal=>bffClient.readOperationsTeam(signal));
 async function command(action:()=>Promise<unknown>){
  await runtime.runAuthenticatedCommand(action,location);
  onNotice(t('Operacja zespolu potwierdzona przez serwer.','Team operation confirmed by the server.'));
  if(!await resource.reload())onNotice(t('Operacja zespolu potwierdzona. Ponowny odczyt nie powiodl sie.','Team operation confirmed. Readback failed.'));
 }
 return <ProductDataState state={resource.state} problem={resource.problem} onRetry={()=>void resource.reload()}>{resource.data&&<SettingsTeamPanel data={resource.data} onInvite={resource.data.canManage?(email,role)=>command(()=>bffClient.inviteMember({email,role})):undefined} onCancelInvitation={resource.data.canManage?id=>command(()=>bffClient.revokeInvitation(id)):undefined} onMember={resource.data.canManage?(id,input)=>command(()=>bffClient.commandOperationsMember(id,input)):undefined}/>}</ProductDataState>;
}
function SecurityRuntime({scope,settings,onSettingsReload}:{scope:string;settings:SettingsOverview;onSettingsReload:()=>void}){
 const runtime=useAuthSessionRuntimeContext(),{location}=useProductQuery(),[mfa,setMfa]=useState(false);
 const resource=useRemoteResource(scope,()=>bffClient.listSessions());
 return <><ProductDataState state={resource.state} problem={resource.problem} onRetry={()=>void resource.reload()}>{resource.data&&<SettingsSecurityPanel sessions={resource.data} mfaEnabled={settings.user.mfaEnabled} onConfigureMfa={!settings.user.mfaEnabled&&runtime.session?.capabilities.includes('auth.mfa.enroll')?()=>setMfa(true):undefined} onDisableMfa={runtime.session?.capabilities.includes('auth.mfa.manage')?()=>runtime.runAuthenticatedCommand(()=>bffClient.disableMfa(),location):undefined} onRevoke={async id=>{await runtime.runAuthenticatedCommand(()=>bffClient.revokeSession(id,runtime.session?.sessionId),location);await resource.reload();}}/>}</ProductDataState>
 <MfaSetupDialog open={mfa} onClose={()=>setMfa(false)} onEnroll={()=>runtime.runAuthenticatedCommand(()=>bffClient.enrollMfa({accountName:settings.user.email}),location)} onConfirm={async code=>{const result=await bffClient.confirmMfa({code});if(!result.verified)throw new Error('Invalid MFA code.');runtime.applySession(result.session);onSettingsReload();}}/></>;
}
function PrivacyRuntime({scope,onNotice}:{scope:string;onNotice:(message:string)=>void}){
 const runtime=useAuthSessionRuntimeContext(),{location}=useProductQuery(),{t}=useProductLocale(),resource=useRemoteResource(scope,signal=>bffClient.readPrivacyRequests(signal));
 return <ProductDataState state={resource.state} problem={resource.problem} onRetry={()=>void resource.reload()}>{resource.data&&<SettingsPrivacyPanel requests={resource.data.records} onCreate={runtime.session?.capabilities.includes('privacy.dsar.manage')?async input=>{await runtime.runAuthenticatedCommand(()=>bffClient.registerPrivacyRequest(input),location);onNotice(t('Wniosek zarejestrowany do weryfikacji.','Request registered for verification.'));if(!await resource.reload())onNotice(t('Wniosek zarejestrowany. Odswiez liste; nie wysylaj go ponownie.','Request registered. Refresh the list; do not submit it again.'));}:undefined}/>}</ProductDataState>;
}
function AuditRuntime({scope}:{scope:string}){
 const {params,update}=useProductQuery(),before=params.get('auditBefore')??undefined;
 const resource=useRemoteResource(`${scope}:${before??''}`,signal=>bffClient.readSettingsAudit(before,signal));
 return <ProductDataState state={resource.state} problem={resource.problem} onRetry={()=>void resource.reload()}>{resource.data&&<SettingsAuditPanel page={resource.data} onFirst={before?()=>update({auditBefore:null}):undefined} onMore={resource.data.nextCursor?()=>update({auditBefore:resource.data?.nextCursor??null}):undefined}/>}</ProductDataState>;
}
function GovernanceRuntime({scope}:{scope:string}){
 const runtime=useAuthSessionRuntimeContext(),{location}=useProductQuery(),[busy,setBusy]=useState(false),lock=useRef(false),active=useRef(true),request=useRef<{signature:string;id:string}|null>(null);
 const resource=useRemoteResource(scope,async()=>parseSettingsGovernance(await bffClient.readPapaGovernance()));
 const policy=useRemoteResource(`${scope}:policy`,signal=>bffClient.readAssistantWorkspace<AssistantPreferences>('preferences',signal));
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 async function save(draft:AssistantPreferences){if(lock.current)return;lock.current=true;setBusy(true);const signature=JSON.stringify(draft);if(request.current?.signature!==signature)request.current={signature,id:safeRandomUUID()};try{await runtime.runAuthenticatedCommand(()=>bffClient.commandAssistantWorkspace('preferences',{requestId:request.current!.id,expectedVersion:draft.version,historyEnabled:draft.historyEnabled,contextDays:draft.contextDays,memoryEnabled:draft.memoryEnabled,attachmentEnabled:draft.attachmentEnabled,allowedReadTools:draft.allowedReadTools}),location);if(!await policy.reload())throw new Error('Zapis potwierdzony, ale odczyt nie powiodl sie. Odswiez polityke.');request.current=null;}finally{lock.current=false;if(active.current)setBusy(false);}}
 return <><ProductDataState state={resource.state} problem={resource.problem} onRetry={()=>void resource.reload()}>{resource.data&&<SettingsGovernancePanel data={resource.data}/>}</ProductDataState><ProductDataState state={policy.state} problem={policy.problem} onRetry={()=>void policy.reload()}>{policy.data&&<AssistantPolicyForm data={policy.data} onSave={save} busy={busy}/>}</ProductDataState></>;
}
