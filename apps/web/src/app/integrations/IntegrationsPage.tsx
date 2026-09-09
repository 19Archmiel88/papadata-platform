import { useEffect, useRef, useState } from 'react';
import { Button } from '../../design-system';
import { bffClient } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { useRemoteResource } from '../../runtime/shared/data/useRemoteResource';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import { IntegrationsWorkspace } from '../../runtime/integrations/IntegrationsWorkspace';
import type { IntegrationProviderTestResult, IntegrationRuntimeSource, IntegrationRuntimeCatalogProvider } from '../../runtime/integrations/integrationsData';
import { IntegrationConnectDialog } from '../../screens/platform-operations/IntegrationConnectDialog';
import { IntegrationOperationDialog, type IntegrationOperation } from '../../screens/platform-operations/IntegrationOperationDialog';
import { IntegrationJobsPanel, integrationJobView } from '../../screens/platform-operations/IntegrationJobsPanel';
import { ProductDataState } from '../../screens/shared/ProductDataState';
import { useProductLocale } from '../../screens/shared/useProductLocale';
import { DataQualityPage } from '../data-quality/DataQualityPage';
import { loadIntegrationsRuntimeView } from './integrationsRuntimeAdapter';
export function IntegrationsPage(){
 const runtime=useAuthSessionRuntimeContext(),scope=`${runtime.session?.activeTenantId}:${runtime.session?.activeWorkspaceId}:${runtime.session?.userId}`;
 return <IntegrationsRuntime key={scope} scope={scope}/>;
}
function IntegrationsRuntime({scope}:{scope:string}){
 const runtime=useAuthSessionRuntimeContext(),{location,params,update}=useProductQuery(),navigate=useShellNavigate(),{t}=useProductLocale();
 const resource=useRemoteResource(scope,()=>loadIntegrationsRuntimeView(bffClient));
 const capabilities=useRemoteResource(scope,signal=>bffClient.readIntegrationProvisionCapabilities(signal));
 const [notice,setNotice]=useState<string|null>(null),[connect,setConnect]=useState<{provider:IntegrationRuntimeCatalogProvider;source?:IntegrationRuntimeSource}|null>(null),[pending,setPending]=useState<IntegrationOperation|null>(null);
 const completion=useRef<{resolve:()=>void;reject:(cause:Error)=>void}|null>(null);
 useEffect(()=>()=>{completion.current?.reject(new DOMException('Scope changed','AbortError'));completion.current=null;},[]);
 const command=<T,>(action:()=>Promise<T>)=>runtime.runAuthenticatedCommand(action,location);
 async function confirmedReload(){if(!await resource.reload())setNotice(t('Operacja potwierdzona. Ponowny odczyt nie powiodl sie; nie powtarzaj zapisu.','Operation confirmed. Readback failed; do not repeat the write.'));}
 function ask(operation:IntegrationOperation):Promise<void>{
  if(completion.current)return Promise.reject(new Error('Another operation is awaiting confirmation.'));
  setPending(operation);return new Promise<void>((resolve,reject)=>{completion.current={resolve,reject};});
 }
 function cancel(){completion.current?.reject(new DOMException('Cancelled','AbortError'));completion.current=null;setPending(null);}
 async function confirm(values:{from:string;to:string;reason:string;requestId:string}){
  if(!pending)return;
  if(pending.kind==='scope')await command(()=>bffClient.saveIntegrationScope(pending.source.integrationId,{requestId:values.requestId,expectedVersion:pending.source.scopeVersion??0,streams:pending.streams,reason:values.reason}));
  else await command(()=>bffClient.startIntegrationBackfill({requestId:values.requestId,connectionId:pending.source.integrationId,providerId:pending.source.provider,streams:pending.streams,from:values.from,to:values.to}));
  setNotice(t('Serwer potwierdzil operacje. Stan danych wymaga odczytu historii.','Server confirmed the operation. Check history for data status.'));
  completion.current?.resolve();completion.current=null;setPending(null);await confirmedReload();
 }
 if(params.get('integrationArea')==='data-quality'||location.split('?')[0]?.endsWith('/jakosc-danych'))return <><Button variant="ghost" onClick={()=>{update({integrationArea:'sources'});if(location.split('?')[0]?.endsWith('/jakosc-danych'))navigate('/app/integrations');}}>{t('Wroc do zrodel','Back to sources')}</Button><DataQualityPage/></>;
 const canManage=runtime.session?.capabilities.includes('integrations.connection.manage')===true;
 return <>
 {notice&&<p role="status">{notice}</p>}
 {capabilities.problem&&<p role="alert">{t('Kreator wymaga ponownego odczytu konfiguracji.','Connection setup requires configuration readback.')}</p>}
 <IntegrationsWorkspace mode="runtime" path={location} loading={resource.state==='loading'} problem={resource.problem} runtime={resource.data} partialFailures={resource.data?.partialFailures} onReload={()=>{void resource.reload();void capabilities.reload();}}
 onBeginConnect={canManage?(provider,source)=>setConnect({provider,source}):undefined}
 onDisconnectConnection={canManage?async source=>{await command(()=>bffClient.disconnectIntegrationConnection(source.integrationId));setNotice(t('Polaczenie odlaczone. Historia danych pozostala.','Connection disconnected. Historical data retained.'));await confirmedReload();}:undefined}
 onUpdateSourceScope={canManage?(source,streams)=>ask({kind:'scope',source,streams}):undefined}
 onSourceCommand={async(source,action)=>{
  if(action==='backfill')return ask({kind:'backfill',source,streams:source.selectedStreams});
  if(action==='sync'){await command(()=>bffClient.startIntegrationSync({connectionId:source.integrationId,providerId:source.provider,streams:source.selectedStreams}));await confirmedReload();return;}
  if(action==='plan'){navigate('/app/billing');return;}
  if(action==='fix'){navigate(`/app/data-quality?qualitySource=${encodeURIComponent(source.integrationId)}`);return;}
 }}/>
 {params.get('sourceId')&&<JobsRuntime key={`${scope}:${params.get('sourceId')}`} scope={scope} sourceId={params.get('sourceId')!}/>}
 {connect&&<IntegrationConnectDialog key={`${connect.provider.provider}:${connect.source?.integrationId??'new'}`} provider={connect.provider} source={connect.source} capabilities={capabilities.data} onClose={()=>setConnect(null)} onTest={async input=>{const result=await command(()=>bffClient.testIntegrationProvider(connect.provider.provider,input));if(result.provider!==connect.provider.provider||typeof result.canSave!=='boolean'||!result.formValidation||!result.providerTest)throw new Error('Invalid provider verification response.');return result as unknown as IntegrationProviderTestResult;}} onSave={input=>command(()=>bffClient.provisionIntegration(input))} onSaved={id=>{setConnect(null);update({integrationArea:'sources',sourceId:id,sourceTab:'sync'});void confirmedReload();}}/>}
 {pending&&<IntegrationOperationDialog key={`${pending.kind}:${pending.source.integrationId}`} operation={pending} onClose={cancel} onConfirm={confirm}/>}
 </>;
}
function JobsRuntime({scope,sourceId}:{scope:string;sourceId:string}){
 const runtime=useAuthSessionRuntimeContext(),{location}=useProductQuery(),resource=useRemoteResource(scope,async()=> (await bffClient.readIntegrationJobs()).map(integrationJobView));
 const [notice,setNotice]=useState<string|null>(null),{t}=useProductLocale();
 return <>{notice&&<p role="status">{notice}</p>}<ProductDataState state={resource.state} problem={resource.problem} onRetry={()=>void resource.reload()}>{resource.data&&<IntegrationJobsPanel jobs={resource.data.filter(row=>row.connectionId===sourceId)} onReload={()=>void resource.reload()} onCommand={runtime.session?.capabilities.includes('integrations.jobs.manage')?async(job,action)=>{await runtime.runAuthenticatedCommand(()=>action==='retry'?bffClient.retryIntegrationJob(job.id):bffClient.cancelIntegrationJob(job.id),location);if(!await resource.reload())setNotice(t('Polecenie przyjete. Ponowny odczyt zadan nie powiodl sie.','Command accepted. Job readback failed.'));}:undefined}/>}</ProductDataState></>;
}
