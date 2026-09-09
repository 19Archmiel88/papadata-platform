import { useMemo, useState } from 'react';
import { ProductDataState } from '../../screens/shared/ProductDataState';
import { Button } from '../../design-system';
import { IntegrationsWorkspace } from '../../runtime/integrations/IntegrationsWorkspace';
import { createIntegrationsRuntimeFallbackData, type IntegrationRuntimeSource, type IntegrationRuntimeCatalogProvider, type IntegrationsRuntimeView } from '../../runtime/integrations/integrationsData';
import { IntegrationConnectDialog } from '../../screens/platform-operations/IntegrationConnectDialog';
import { IntegrationOperationDialog, type IntegrationOperation } from '../../screens/platform-operations/IntegrationOperationDialog';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
import { useProductLocale } from '../../screens/shared/useProductLocale';
import { QualityOperationsDemo } from './OperationsScenarios';
import type { OperationsScenarioProps } from './OperationsScenarios';
import '../../screens/platform-operations/operations.css';

/** Same workspace and forms as production, with explicitly local fixture actions. */
export function IntegrationOperationsDemo({state='ready',readonly=false,initialView,empty=false,failSave=false}:OperationsScenarioProps){
 const {t}=useProductLocale(),query=useProductQuery(),[base,setBase]=useState<IntegrationsRuntimeView>(()=>createIntegrationsRuntimeFallbackData());
 const [connect,setConnect]=useState<{provider:IntegrationRuntimeCatalogProvider;source?:IntegrationRuntimeSource}|null>(null),[notice,setNotice]=useState<string|null>(null),[backfill,setBackfill]=useState<IntegrationOperation|null>(null);
 const runtime=useMemo<IntegrationsRuntimeView>(()=>({...base,demo:true,status:{...base.status,sources:empty?[]:base.status.sources.map(row=>({...row,canManage:!readonly,scopeVersion:row.scopeVersion??0,credentialVersion:row.credentialVersion??1})),...(empty?{summary:{...base.status.summary,activeSources:0,actionRequired:0,syncingSources:0,completenessPercentage:0,queuedBackfills:0,runningBackfills:0,lockedBackfills:0,healthTitle:'Demo: brak zrodel',healthDescription:'Dodaj pierwsze zrodlo.'},alerts:[],plan:{...base.status.plan,dataSourcesUsed:0}}:{})}}),[base,readonly,empty]);
 const local=()=>{if(failSave)throw new globalThis.Error('Demo: operacja odrzucona.');setNotice(t('Demo: tylko zmiana lokalna. Nie wyslano zlecenia do dostawcy.','Demo: local change only. No provider request was sent.'));};
 const quality=query.params.get('integrationArea')==='data-quality'||(initialView==='data-quality'&&!query.params.has('integrationArea'));
 if(state==='forbidden')return <ProductDataState state="forbidden"/>;
 if(quality)return <><Button variant="ghost" onClick={()=>query.update({integrationArea:'sources'})}>{t('Wroc do zrodel','Back to sources')}</Button><QualityOperationsDemo state={state} readonly={readonly}/></>;
 return <div className="pd-operations"><p role="status">{t('Demonstracja Integracji. Nie wpisuj prawdziwych sekretow. Wszystkie operacje sa lokalne.','Integration demonstration. Do not enter real secrets. All operations are local.')}</p>{notice&&<p role="status">{notice}</p>}
 <Button variant="secondary" onClick={()=>query.update({integrationArea:'data-quality'})}>{t('Jakosc i pochodzenie danych','Data quality and lineage')}</Button>
 <IntegrationsWorkspace mode="storybook" runtime={runtime} loading={state==='loading'} problem={state==='error'?t('Demo: blad odczytu.','Demo: read failed.'):state==='offline'?t('Demo: offline.','Demo: offline.'):null} initialArea={initialView==='catalog'?'catalog':'sources'} onReload={()=>setNotice('Demo: bez odczytu API.')}
 onBeginConnect={readonly?undefined:(provider,source)=>setConnect({provider,source})}
 onDisconnectConnection={readonly?undefined:async source=>{local();setBase(value=>({...value,status:{...value.status,sources:value.status.sources.map(row=>row.integrationId===source.integrationId?{...row,connectionStatus:'DISCONNECTED',dataSourceStatus:'DISCONNECTED',canManage:false}:row)}}));}}
 onUpdateSourceScope={readonly?undefined:async(source,streams)=>{local();setBase(value=>({...value,status:{...value.status,sources:value.status.sources.map(row=>row.integrationId===source.integrationId?{...row,selectedStreams:streams,scopeVersion:(row.scopeVersion??0)+1}:row)}}));}}
 onSourceCommand={readonly?undefined:async(source,action)=>{if(action==='backfill'){setBackfill({kind:'backfill',source,streams:source.selectedStreams});return;}local();}}/>
 {connect&&<IntegrationConnectDialog demo provider={connect.provider} source={connect.source} capabilities={{enabled:true,reason:'Demo: no Secret Manager call',storage:'gcp_secret_manager',transport:'https_required',automaticOAuth:false}} onClose={()=>setConnect(null)} onTest={async()=>{local();return {provider:connect.provider.provider,canSave:true,formValidation:{status:'passed',message:'Demo: lokalny scenariusz',fieldErrors:{}},providerTest:{status:'passed',message:'Demo: nie sprawdzono prawdziwego API.'}};}} onSave={async input=>{local();return {connectionId:input.connectionId??input.requestId,credentialVersion:input.expectedVersion+1,status:'active',synchronizationStarted:false};}} onSaved={()=>{setConnect(null);setNotice(t('Demo: kreator zakonczony. Nie utworzono prawdziwego polaczenia ani zadania.','Demo: wizard finished. No real connection or job was created.'));}}/>}
 {backfill&&<IntegrationOperationDialog operation={backfill} onClose={()=>setBackfill(null)} onConfirm={async()=>{local();setBackfill(null);}}/>}
 </div>;
}
