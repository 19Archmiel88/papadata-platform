import { useState } from 'react';
import type { QualityDataset } from '@papadata/contracts';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { bffClient } from '../../runtime/shared/api/bffClient';
import { useRemoteResource } from '../../runtime/shared/data/useRemoteResource';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import { DataQualityScreen } from '../../screens/platform-operations/DataQualityScreen';
import { ProductDataState } from '../../screens/shared/ProductDataState';
import { useProductLocale } from '../../screens/shared/useProductLocale';
export function DataQualityPage(){
 const runtime=useAuthSessionRuntimeContext(),scope=`${runtime.session?.activeTenantId}:${runtime.session?.activeWorkspaceId}:${runtime.session?.userId}`;
 return <QualityRuntime key={scope} scope={scope}/>;
}
function QualityRuntime({scope}:{scope:string}){
 const runtime=useAuthSessionRuntimeContext(),{location}=useProductQuery(),navigate=useShellNavigate(),{t}=useProductLocale(),[notice,setNotice]=useState<string|null>(null);
 const resource=useRemoteResource(scope,signal=>bffClient.readDataQuality(signal));
 return <>{notice&&<p role="status">{notice}</p>}<DataQualityScreen data={resource.data} state={resource.state} problem={resource.problem} onReload={()=>void resource.reload()} onSource={id=>navigate(`/app/integrations?sourceId=${encodeURIComponent(id)}&sourceTab=sync`)} renderLineage={dataset=><LineageRuntime key={`${scope}:${dataset.connectionId}:${dataset.stream}`} scope={scope} dataset={dataset}/>} onReview={runtime.session?.capabilities.includes('integrations.jobs.manage')?async input=>{const response=await runtime.runAuthenticatedCommand(()=>bffClient.saveDataReview(input),location);if(resource.data)resource.replace({...resource.data,reviews:[response,...resource.data.reviews.filter(row=>row.id!==response.id)]});setNotice(t('Ocena zapisana. Rekordy zrodlowe i wyniki rekoncyliacji nie zostaly zmienione.','Review saved. Source records and reconciliation results were not modified.'));return response;}:undefined}/></>;
}
function LineageRuntime({scope,dataset}:{scope:string;dataset:QualityDataset}){
 const {t}=useProductLocale(),resource=useRemoteResource(`${scope}:${dataset.connectionId}:${dataset.stream}`,signal=>bffClient.readDataLineage(dataset.connectionId,dataset.stream,signal));
 return <ProductDataState state={resource.state} problem={resource.problem} onRetry={()=>void resource.reload()}>{resource.data&&<><p>{t('Ostatnie 100 rekordow. Identyfikatory zewnetrzne sa pseudonimizowane; dane surowe nie sa ujawniane.','Latest 100 records. External identifiers are pseudonymized; raw payloads are not exposed.')}</p>{resource.data.records.length===0?<p>{t('Brak rekordow pochodzenia.','No lineage records.')}</p>:<div className="pd-operations__table"><table><thead><tr><th>{t('Zrodlo / kanoniczny','Source / canonical')}</th><th>{t('Partia','Batch')}</th><th>{t('Data biznesowa','Business time')}</th><th>{t('Import / schemat','Ingestion / schema')}</th></tr></thead><tbody>{resource.data.records.map(row=><tr key={row.sourceId}><td>{row.sourceId}<br/>{row.canonicalId??t('Brak rekordu kanonicznego','No canonical record')}</td><td>{row.batchId}<details><summary>{t('Skrot zrodla','Source fingerprint')}</summary><p>{row.checksum??'--'}</p></details></td><td>{row.businessAt??'--'}</td><td>{row.ingestedAt}<br/>{row.schemaVersion}</td></tr>)}</tbody></table></div>}</>}</ProductDataState>;
}
