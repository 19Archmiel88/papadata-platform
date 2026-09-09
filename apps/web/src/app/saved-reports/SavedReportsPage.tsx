import { downloadReport } from '../../screens/saved-reports/SavedReports.export';
import { useEffect, useRef } from 'react';
import { useLocationPath } from '../../runtime/app/routing/navigation';
import { bffClient } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { useRemoteResource } from '../../runtime/shared/data/useRemoteResource';
import { safeRandomUUID } from '../../runtime/shared/id/safeRandomUUID';
import { SavedReportsScreen } from '../../screens/saved-reports/SavedReportsScreen';
import type { ReportCommand, ReportsStore } from '../../screens/saved-reports/SavedReports.model';
const emptyStore:ReportsStore={schema:1,workspace:'',reports:[]};
export function SavedReportsPage(){
 const runtime=useAuthSessionRuntimeContext(),location=useLocationPath(),session=runtime.session;
 const scope=`${session?.activeTenantId}:${session?.activeWorkspaceId}:${session?.userId}`;
 const active=useRef(scope);active.current=scope;
 useEffect(()=>{active.current=scope;return()=>{active.current='';};},[scope]);
 const retries=useRef(new Map<string,string>());
 const resource=useRemoteResource(scope,signal=>bffClient.readSavedReports(signal));
 async function command(input:ReportCommand){
   const signature=JSON.stringify({scope,input});
   const key=retries.current.get(signature)??safeRandomUUID();retries.current.set(signature,key);
   const result=await runtime.runAuthenticatedCommand(()=>bffClient.commandSavedReports(input,key),location);
   if(active.current!==scope)throw new Error('Workspace changed during the operation.');
   retries.current.delete(signature);resource.replace(result);return result;
 }
 return <SavedReportsScreen key={scope} data={resource.data??{...emptyStore,workspace:session?.activeWorkspaceId??''}}
   mode="live" persistenceKey={null} currentActorId={session?.userId??''}
   canManage={Boolean(session?.capabilities.includes('reports.create'))}
   state={resource.state} errorMessage={resource.problem??undefined}
   canDownload={Boolean(session?.capabilities.includes('reports.download'))}
   onDownload={async (id,version,format)=>{
     const result=await runtime.runAuthenticatedCommand(()=>bffClient.downloadSavedReport(id,version,format),location);
     if(active.current!==scope)throw new Error('Workspace changed during download.');
     if(result.reportId!==id||result.version!==version||result.format!==format||typeof result.content!=='string'||result.filename!==`papadata-raport-v${version}.${format}`)throw new Error('Invalid report download response.');
     downloadReport(result.content,result.mediaType,result.filename);
   }}
   onRetry={()=>void resource.reload()} onCommand={command}
   build={async config=>{const result=await runtime.runAuthenticatedCommand(()=>bffClient.previewSavedReport(config),location);if(active.current!==scope)throw new Error('Workspace changed during preview.');return result;}}/>;
}
