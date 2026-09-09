import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { ProductionDatabase, BillingRepository } from '@papadata/database';
import { entitlementsForMigratedPlan, type IntegrationProvisionCapabilities, type IntegrationProvisionResult } from '@papadata/contracts';
import { IntegrationSecretProvisioner, parseCredentialSecret } from '@papadata/integrations';
import { createProviderRegistry } from '../integrations/provider.factory.js';
import { isMvpProviderId, testProviderCredential } from '../integrations/integration-runtime.js';
import { AuditService } from '../audit/audit.service.js';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { object, onlyKeys, string, uuid, version } from './validation.js';
import { operation } from './operation-store.js';

@Injectable()
export class ConnectionProvisionService {
 constructor(@Inject(ProductionDatabase) private readonly db:ProductionDatabase,@Inject(AuditService) private readonly audit:AuditService){}
 capabilities():IntegrationProvisionCapabilities {
  const enabled=IntegrationSecretProvisioner.ready();return {enabled,reason:enabled?'Server-side Secret Manager provisioning configured. Provider access is verified before activation.':'An administrator must configure the Secret Manager project, replica location and workload identity permissions.',storage:'gcp_secret_manager',transport:'https_required',automaticOAuth:false};
 }
 async provision(p:RequestPrincipal,value:unknown):Promise<IntegrationProvisionResult>{
  const raw=object(value);onlyKeys(raw,['requestId','provider','displayName','streams','material','connectionId','expectedVersion']);
  const requestId=uuid(raw.requestId),provider=string(raw.provider),name=string(raw.displayName,1,160),expectedVersion=version(raw.expectedVersion);
  if(!isMvpProviderId(provider))throw new BadRequestException('Unknown integration provider.');
  if(!IntegrationSecretProvisioner.ready())throw new ServiceUnavailableException(this.capabilities().reason);
  const descriptor=createProviderRegistry().listTargetDescriptors().find(row=>row.providerId===provider);
  if(!descriptor||!Array.isArray(raw.streams)||raw.streams.length<1||raw.streams.length>20||raw.streams.some(s=>typeof s!=='string'||!descriptor.supportedStreams.includes(s)))throw new BadRequestException('Choose supported synchronization streams.');
  const streams=[...new Set(raw.streams as string[])].sort(),materialRaw=object(raw.material);
  const allowed:Record<string,readonly string[]>={
   woocommerce:['storeUrl','consumerKey','consumerSecret','webhookSecret'],shopify:['shopDomain','accessToken','apiVersion','webhookSecret'],baselinker:['token'],allegro:['accessToken','refreshToken','clientId','clientSecret','expiresAt','marketplaceId'],google_ads:['developerToken','customerId','loginCustomerId','accessToken','refreshToken','clientId','clientSecret','expiresAt','apiVersion'],meta_ads:['accountId','accessToken','apiVersion','appSecret'],ga4:['propertyId','accessToken','refreshToken','clientId','clientSecret','expiresAt'],
  };
  onlyKeys(materialRaw,allowed[provider]!);
  const materialInput=Object.fromEntries(Object.entries(materialRaw).filter(([,v])=>v!=='').map(([k,v])=>[k,string(v,1,4096)]));
  let parsed:ReturnType<typeof parseCredentialSecret>;
  try{parsed=parseCredentialSecret(provider,JSON.stringify(materialInput));}catch{throw new BadRequestException('Incomplete credential material.');}
  const payload=JSON.stringify(parsed.material),fingerprint=createHash('sha256').update(payload).digest('hex');
  const connectionId=raw.connectionId?uuid(raw.connectionId):connectionUuid(p,requestId);
  const reconnect=Boolean(raw.connectionId);
  if(!reconnect&&expectedVersion!==0)throw new ConflictException('A new connection starts at version zero.');
  const subscription=await new BillingRepository(this.db).readSubscription(p.tenantId,p.workspaceId);
  return this.db.withTenantWorkspace(p.tenantId,p.workspaceId,c=>operation(c,p,requestId,'integration.credentials.provision',{provider,name,streams,connectionId,expectedVersion,fingerprint},async()=>{
   await c.query('SELECT workspace_id FROM app.workspaces WHERE tenant_id=$1 AND workspace_id=$2 FOR UPDATE',[p.tenantId,p.workspaceId]);
   const existing=(await c.query<{provider_id:string;credential_version:number;external_account_id:string|null;deleted_at:string|null;credential_ref:string|null}>(`SELECT provider_id,credential_version,external_account_id,deleted_at::text,credential_ref FROM app.integration_connections WHERE tenant_id=$1 AND workspace_id=$2 AND connection_id=$3 FOR UPDATE`,[p.tenantId,p.workspaceId,connectionId])).rows[0];
   if(reconnect&&(!existing||existing.deleted_at))throw new NotFoundException('Connection unavailable.');
   if(existing&&(existing.provider_id!==provider||existing.credential_version!==expectedVersion))throw new ConflictException('Connection changed. Reload before replacing credentials.');
   if(!reconnect){const count=(await c.query<{count:string}>('SELECT count(*)::text FROM app.integration_connections WHERE tenant_id=$1 AND workspace_id=$2 AND deleted_at IS NULL AND status<>\'disconnected\'',[p.tenantId,p.workspaceId])).rows[0];if(Number(count?.count??0)>=entitlementsForMigratedPlan(subscription.planId).maxDataSources)throw new ConflictException('Plan source limit reached.');}
   if(provider==='woocommerce'){
    let url:URL;try{url=new URL(String(materialInput.storeUrl));}catch{throw new BadRequestException('Invalid store address.');}
    if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw new BadRequestException('Store credentials require an HTTPS URL without userinfo, query or fragment.');
   }
   if(provider==='baselinker'&&reconnect)throw new ConflictException('BaseLinker reconnect requires an account-identity discovery adapter; credentials cannot be replaced blindly.');
   // Do not trust the browser test or a supplied OAuth-authorized flag.
   const health=await testProviderCredential(provider,materialInput);
   if(!health.canSave)throw new BadRequestException({code:'INTEGRATION_PROVIDER_REJECTED',message:health.providerTest.message});
   let account=String(materialInput.customerId??materialInput.accountId??materialInput.propertyId??materialInput.shopDomain??materialInput.storeUrl??'');
   if(provider==='baselinker')account=existing?.external_account_id??`baselinker:${connectionId}`;
   if(provider==='allegro')throw new ConflictException('Allegro account identity must be selected through its dedicated account discovery flow; this provisioning path is disabled.');
   if(!account)throw new BadRequestException('A provider account must be specified.');
   if(provider==='woocommerce'){const url=new URL(account);if(url.protocol!=='https:')throw new BadRequestException('Production store credentials require HTTPS.');url.search='';url.hash='';account=url.origin+url.pathname.replace(/\/$/,'');}
   if(provider==='google_ads')account=account.replace(/-/g,'');
   if(provider==='meta_ads')account=account.replace(/^act_/,'');
   if(existing?.external_account_id&&existing.external_account_id!==account)throw new ConflictException('Reconnect cannot silently change the provider account. Add a separate source.');
   const duplicate=await c.query(`SELECT connection_id FROM app.integration_connections WHERE tenant_id=$1 AND workspace_id=$2 AND provider_id=$3 AND external_account_id=$4 AND connection_id<>$5`,[p.tenantId,p.workspaceId,provider,account,connectionId]);
   if(duplicate.rows.length)throw new ConflictException('This provider account already has a connection, including disconnected history. Reopen the existing source.');
   let secret:{resource:string;version:string};
   try{secret=await new IntegrationSecretProvisioner().write({tenantId:p.tenantId,workspaceId:p.workspaceId,connectionId,requestId,provider,payload});}catch{throw new ServiceUnavailableException('Credential storage failed. No connection was activated. Retry the same request after the administrator checks Secret Manager.');}
   const ref=`credential:${connectionId}:${requestId}`;
   if(!existing)await c.query(`INSERT INTO app.integration_connections(connection_id,tenant_id,workspace_id,provider_id,status,external_account_id,account_name,credential_ref,requested_scopes,granted_scopes,idempotency_key,credential_version) VALUES($1,$2,$3,$4,'active',$5,$6,$7,$8::jsonb,'[]'::jsonb,$9,1)`,[connectionId,p.tenantId,p.workspaceId,provider,account,name,ref,JSON.stringify(descriptor.requiredScopes),requestId]);
   else await c.query(`UPDATE app.integration_connections SET status='active',account_name=$4,credential_ref=$5,credential_version=credential_version+1,reauthorized_at=now(),updated_at=now() WHERE tenant_id=$1 AND workspace_id=$2 AND connection_id=$3`,[p.tenantId,p.workspaceId,connectionId,name,ref]);
   await c.query(`UPDATE app.integration_credentials SET status='revoked',rotation_state='revoked',revoked_at=now(),updated_at=now() WHERE tenant_id=$1 AND workspace_id=$2 AND connection_id=$3 AND revoked_at IS NULL`,[p.tenantId,p.workspaceId,connectionId]);
   await c.query(`INSERT INTO app.integration_credentials(tenant_id,workspace_id,connection_id,provider_id,secret_reference,credential_reference,secret_resource,active_version,status,rotation_state,issued_at,last_verified_at,required_scopes,granted_scopes) VALUES($1,$2,$3,$4,$5,$5,$6,$7,'active','active',now(),now(),$8::jsonb,'[]'::jsonb)`,[p.tenantId,p.workspaceId,connectionId,provider,ref,secret.resource,secret.version,JSON.stringify(descriptor.requiredScopes)]);
   await c.query(`INSERT INTO app.integration_sync_scopes(tenant_id,workspace_id,connection_id,streams,version,updated_by) VALUES($1,$2,$3,$4,1,$5) ON CONFLICT(tenant_id,workspace_id,connection_id) DO UPDATE SET streams=EXCLUDED.streams,version=app.integration_sync_scopes.version+1,updated_by=EXCLUDED.updated_by,updated_at=now()`,[p.tenantId,p.workspaceId,connectionId,streams,p.userId]);
   // Explicit, provider/connection-scoped success audit -- in addition to (not
   // instead of) AuditDeniedAccess on the controller route and
   // CommandExecutionInterceptor's own generic api_command success audit,
   // which fires for every authenticated POST but carries no provider or
   // connectionId. Distinguishing connect vs reconnect in `action` itself
   // (rather than always using the shared 'integrations.credentials.provision'
   // operationId) matters because this one method serves both. No try/catch:
   // an audit failure must fail the request, same policy as
   // integration.controller.ts's createConnection()/disconnect().
   await this.audit.append({tenantId:p.tenantId,workspaceId:p.workspaceId,actorId:p.userId,actorType:'user',action:reconnect?'integrations.connection.reconnect':'integrations.connection.connect',resourceType:'integration_connection',resourceId:connectionId,outcome:'success',correlationId:requestId,metadata:{provider,account,streams,connectionVersion:expectedVersion+1}});
   return {connectionId,status:'active' as const,credentialVersion:expectedVersion+1,synchronizationStarted:false as const};
  }));
 }
}
function connectionUuid(p:RequestPrincipal,requestId:string):string {const h=createHash('sha256').update(`${p.tenantId}:${p.workspaceId}:${requestId}`).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;}
