import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductionDatabase } from '@papadata/database';
import type { IntegrationScope, QualityOverview, QualityDataset, QualityReview, QualityLineage } from '@papadata/contracts';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { createProviderRegistry } from '../integrations/provider.factory.js';
import { operation } from './operation-store.js';
import { object, onlyKeys, string, uuid, version } from './validation.js';
@Injectable()
export class IntegrationOperationsService {
 private readonly registry=createProviderRegistry();
 constructor(@Inject(ProductionDatabase) private readonly db:ProductionDatabase){}
 async scope(p:RequestPrincipal,id:string):Promise<IntegrationScope>{
  uuid(id);
  return this.db.withTenantWorkspace(p.tenantId,p.workspaceId,async c=>{
   const connections=await c.query<{provider_id:string;updated_at:string}>('SELECT provider_id,updated_at::text FROM app.integration_connections WHERE tenant_id=$1 AND workspace_id=$2 AND connection_id=$3 AND deleted_at IS NULL',[p.tenantId,p.workspaceId,id]);
   const connection=connections.rows[0];if(!connection)throw new NotFoundException('Connection unavailable.');
   const supportedStreams=this.registry.listTargetDescriptors().find(provider=>provider.providerId===connection.provider_id)?.supportedStreams??[];
   const scope=await c.query<{version:number;streams:string[];updated_at:string}>('SELECT version,streams,updated_at::text FROM app.integration_sync_scopes WHERE tenant_id=$1 AND workspace_id=$2 AND connection_id=$3',[p.tenantId,p.workspaceId,id]);
   return {connectionId:id,version:scope.rows[0]?.version??0,streams:scope.rows[0]?.streams??supportedStreams,supportedStreams,updatedAt:scope.rows[0]?.updated_at??null};
  });
 }
 async saveScope(p:RequestPrincipal,id:string,input:unknown):Promise<IntegrationScope>{
  uuid(id);const raw=object(input);onlyKeys(raw,['requestId','expectedVersion','streams','reason']);
  const requestId=uuid(raw.requestId),expectedVersion=version(raw.expectedVersion),reason=string(raw.reason,10,1000);
  if(!Array.isArray(raw.streams)||raw.streams.length<1||raw.streams.length>30||raw.streams.some(v=>typeof v!=='string'))throw new BadRequestException('Select supported streams.');
  const streams=[...new Set(raw.streams as string[])].sort();
  return this.db.withTenantWorkspace(p.tenantId,p.workspaceId,c=>operation(c,p,requestId,'integrations.scope.save',{id,expectedVersion,streams,reason},async()=>{
   const connections=await c.query<{provider_id:string}>(`SELECT provider_id FROM app.integration_connections WHERE tenant_id=$1 AND workspace_id=$2 AND connection_id=$3 AND deleted_at IS NULL FOR UPDATE`,[p.tenantId,p.workspaceId,id]);
   if(!connections.rows[0])throw new NotFoundException('Connection unavailable.');
   const supportedStreams=this.registry.listTargetDescriptors().find(item=>item.providerId===connections.rows[0]!.provider_id)?.supportedStreams??[];
   if(streams.some(item=>!supportedStreams.includes(item)))throw new BadRequestException('Unsupported stream for this provider.');
   const prior=await c.query<{version:number}>('SELECT version FROM app.integration_sync_scopes WHERE tenant_id=$1 AND workspace_id=$2 AND connection_id=$3 FOR UPDATE',[p.tenantId,p.workspaceId,id]);
   if((prior.rows[0]?.version??0)!==expectedVersion)throw new ConflictException('The synchronization scope changed. Reload it before saving.');
   const at=new Date().toISOString();
   await c.query(`INSERT INTO app.integration_sync_scopes(tenant_id,workspace_id,connection_id,version,streams,updated_at,updated_by) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(tenant_id,workspace_id,connection_id) DO UPDATE SET version=EXCLUDED.version,streams=EXCLUDED.streams,updated_at=EXCLUDED.updated_at,updated_by=EXCLUDED.updated_by`,[p.tenantId,p.workspaceId,id,expectedVersion+1,streams,at,p.userId]);
   return {connectionId:id,version:expectedVersion+1,streams,supportedStreams,updatedAt:at};
  }));
 }
 async quality(p:RequestPrincipal):Promise<QualityOverview>{
  return this.db.withTenantWorkspace(p.tenantId,p.workspaceId,async c=>{
   const datasets=await c.query<QualityDataset>(`WITH src AS (SELECT connection_id,provider_id,stream,COUNT(*)::int AS records,MAX(ingested_at) AS ingested FROM app.source_records WHERE tenant_id=$1 AND workspace_id=$2 GROUP BY connection_id,provider_id,stream), canon AS (SELECT connection_id,stream,COUNT(*)::int AS records,MAX(business_time) AS business_at FROM app.integration_canonical_records WHERE tenant_id=$1 AND workspace_id=$2 GROUP BY connection_id,stream), batches AS (SELECT connection_id,stream,COUNT(*) FILTER(WHERE status IN ('partial','failed'))::int AS failed FROM app.source_batches WHERE tenant_id=$1 AND workspace_id=$2 GROUP BY connection_id,stream) SELECT src.connection_id AS "connectionId",src.provider_id AS provider,src.stream,src.records AS "sourceRecords",coalesce(canon.records,0) AS "canonicalRecords",src.ingested::text AS "lastIngestedAt",canon.business_at::text AS "lastBusinessAt",coalesce(batches.failed,0) AS "failedBatches" FROM src LEFT JOIN canon USING(connection_id,stream) LEFT JOIN batches USING(connection_id,stream) ORDER BY src.provider_id,src.connection_id,src.stream LIMIT 501`,[p.tenantId,p.workspaceId]);
   const runs=await c.query<QualityOverview['runs'][number]>(`SELECT reconciliation_run_id AS id,connection_id AS "connectionId",status,created_at::text AS "createdAt",jsonb_build_object('jobId',sync_job_id,'batchId',source_batch_id,'fetched',fetched_count,'source',persisted_source_count,'normalized',normalized_count,'canonical',canonical_count,'rejected',rejected_count,'duplicates',duplicate_count,'failed',failed_count) AS details FROM app.integration_reconciliation_runs WHERE tenant_id=$1 AND workspace_id=$2 ORDER BY created_at DESC LIMIT 100`,[p.tenantId,p.workspaceId]);
   const reviews=await c.query<QualityReview>(`SELECT review_id AS id,connection_id AS "connectionId",stream,disposition,note,updated_at::text AS "updatedAt",version FROM app.data_quality_reviews WHERE tenant_id=$1 AND workspace_id=$2 ORDER BY updated_at DESC LIMIT 501`,[p.tenantId,p.workspaceId]);
   return {version:'quality.operations.v1',datasets:datasets.rows.slice(0,500),runs:runs.rows,reviews:reviews.rows.slice(0,500),truncated:datasets.rows.length>500||reviews.rows.length>500,measuredAt:new Date().toISOString()};
  });
 }
 async lineage(p:RequestPrincipal,connectionId:string,stream:string):Promise<{records:readonly QualityLineage[];limit:number}>{
  uuid(connectionId);string(stream,1,50);
  return this.db.withTenantWorkspace(p.tenantId,p.workspaceId,async c=>{
   const rows=await c.query<QualityLineage>(`SELECT s.source_record_id AS "sourceId",r.canonical_record_id AS "canonicalId",encode(digest(s.external_id,'sha256'),'hex') AS "externalId",r.business_time::text AS "businessAt",s.ingested_at::text AS "ingestedAt",s.schema_version AS "schemaVersion",s.source_batch_id AS "batchId",s.payload_checksum AS checksum FROM app.source_records s LEFT JOIN app.integration_canonical_records r ON r.source_record_id=s.source_record_id AND r.tenant_id=s.tenant_id AND r.workspace_id=s.workspace_id WHERE s.tenant_id=$1 AND s.workspace_id=$2 AND s.connection_id=$3 AND s.stream=$4 ORDER BY s.ingested_at DESC,s.source_record_id LIMIT 100`,[p.tenantId,p.workspaceId,connectionId,stream]);
   return {records:rows.rows,limit:100};
  });
 }
 async review(p:RequestPrincipal,value:unknown):Promise<QualityReview>{
  const raw=object(value);onlyKeys(raw,['requestId','expectedVersion','connectionId','stream','disposition','note']);
  const requestId=uuid(raw.requestId),connectionId=uuid(raw.connectionId),stream=string(raw.stream,1,50),note=string(raw.note,10,4000),disposition=string(raw.disposition),expectedVersion=version(raw.expectedVersion);
  if(!['investigating','accepted_limitation','resolved'].includes(disposition))throw new BadRequestException('Unsupported review status.');
  return this.db.withTenantWorkspace(p.tenantId,p.workspaceId,c=>operation(c,p,requestId,'data-quality.review.save',{connectionId,stream,note,disposition,expectedVersion},async()=>{
   const connection=await c.query('SELECT connection_id FROM app.integration_connections WHERE tenant_id=$1 AND workspace_id=$2 AND connection_id=$3 FOR UPDATE',[p.tenantId,p.workspaceId,connectionId]);if(!connection.rows[0])throw new NotFoundException('Connection unavailable.');
   const dataset=await c.query('SELECT 1 FROM app.source_records WHERE tenant_id=$1 AND workspace_id=$2 AND connection_id=$3 AND stream=$4 LIMIT 1',[p.tenantId,p.workspaceId,connectionId,stream]);if(!dataset.rows[0])throw new NotFoundException('Dataset unavailable. Import records before recording a data review.');
   const prior=await c.query<{version:number}>('SELECT version FROM app.data_quality_reviews WHERE tenant_id=$1 AND workspace_id=$2 AND connection_id=$3 AND stream=$4 FOR UPDATE',[p.tenantId,p.workspaceId,connectionId,stream]);
   if((prior.rows[0]?.version??0)!==expectedVersion)throw new ConflictException('Review changed. Reload before saving.');
   const rows=await c.query<QualityReview>(`INSERT INTO app.data_quality_reviews(tenant_id,workspace_id,connection_id,stream,disposition,note,version,updated_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(tenant_id,workspace_id,connection_id,stream) DO UPDATE SET disposition=EXCLUDED.disposition,note=EXCLUDED.note,version=EXCLUDED.version,updated_by=EXCLUDED.updated_by,updated_at=now() RETURNING review_id AS id,connection_id AS "connectionId",stream,disposition,note,version,updated_at::text AS "updatedAt"`,[p.tenantId,p.workspaceId,connectionId,stream,disposition,note,expectedVersion+1,p.userId]);
   return rows.rows[0]!;
  }));
 }
}
