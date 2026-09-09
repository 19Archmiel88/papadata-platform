import type { BffClient } from '../../runtime/shared/api/bffClient';
import type { IntegrationCatalogRuntime, IntegrationCompletenessRuntime, IntegrationLogsRuntime, IntegrationRuntimeLog, IntegrationRuntimeStatus, IntegrationsRuntimeView } from '../../runtime/integrations/integrationsData';
export type IntegrationPartialFailure={id:'catalog'|'logs'|'completeness';title:string;message:string};
function normalizedLog(log:IntegrationRuntimeLog):IntegrationRuntimeLog {
 if(!log||typeof log.jobId!=='string')throw new Error('Invalid integration job response.');
 return {...log,stages:Array.isArray(log.stages)?log.stages:null,impactNote:typeof log.impactNote==='string'?log.impactNote:null};
}
/** Read critical status separately from optional panels. Missing panels never become sample data. */
export async function loadIntegrationsRuntimeView(client:BffClient):Promise<IntegrationsRuntimeView & {partialFailures:readonly IntegrationPartialFailure[]}> {
 const [statusResult,catalogResult,logsResult,healthResult]=await Promise.allSettled([
  client.readIntegrationsStatus<IntegrationRuntimeStatus>(),client.readIntegrationsCatalog<IntegrationCatalogRuntime>(),
  client.readIntegrationsLogs<IntegrationLogsRuntime>(),client.readIntegrationsCompleteness<IntegrationCompletenessRuntime>(),
 ]);
 if(statusResult.status==='rejected')throw statusResult.reason;
 const raw=statusResult.value;if(!raw||!Array.isArray(raw.sources)||!raw.summary)throw new Error('Invalid integration status response.');
 const status:IntegrationRuntimeStatus={...raw,sources:raw.sources.map(source=>{
  if(typeof source.integrationId!=='string'||!Array.isArray(source.selectedStreams))throw new Error('Integration API does not include its synchronization scope. Deploy the matching API version.');
  return {...source,objectReadiness:Array.isArray(source.objectReadiness)?source.objectReadiness:[],schedule:typeof source.schedule==='string'?source.schedule:'Schedule not supplied by the source.',latestSyncRun:source.latestSyncRun?normalizedLog(source.latestSyncRun):null};
 })};
 const failures:IntegrationPartialFailure[]=[];
 if(catalogResult.status==='rejected')failures.push({id:'catalog',title:'Katalog niedostepny',message:'Lista dostawcow nie zostala odczytana. Nie zastapiono jej demonstracja.'});
 if(logsResult.status==='rejected')failures.push({id:'logs',title:'Historia niedostepna',message:'Brak odpowiedzi historii nie oznacza braku synchronizacji.'});
 if(healthResult.status==='rejected')failures.push({id:'completeness',title:'Szczegoly pokrycia niedostepne',message:'Pokazano tylko podsumowanie statusu. Szczegolowe pokrycie wymaga ponownego odczytu.'});
 const catalog=catalogResult.status==='fulfilled'?catalogResult.value:{generatedAt:raw.generatedAt,providers:[]};
 const logs:IntegrationLogsRuntime=logsResult.status==='fulfilled'?{...logsResult.value,logs:logsResult.value.logs.map(normalizedLog)}:{generatedAt:raw.generatedAt,logs:[]};
 const completeness:IntegrationCompletenessRuntime=healthResult.status==='fulfilled'?healthResult.value:{generatedAt:raw.generatedAt,global:{title:'Niepelny odczyt',percentage:raw.summary.completenessPercentage,description:'Tylko podsumowanie statusu; szczegoly nie zostaly pobrane.'},domains:[],sources:[],blockers:[]};
 if(!Array.isArray(catalog.providers)||!Array.isArray(logs.logs))throw new Error('Invalid integration response.');
 return {status,catalog,logs,completeness,demo:false,partialFailures:failures};
}
