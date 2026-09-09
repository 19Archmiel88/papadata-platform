import {BadRequestException,ConflictException,ForbiddenException,Inject,Injectable} from '@nestjs/common';
import {createHash} from 'node:crypto';
import {ProductionDatabase} from '@papadata/database';
import {isValidNip,normalizeNip,type AccessLifecycleStatus,type CompanyProfile,type LegalDocument} from '@papadata/contracts';
import type {RequestPrincipal} from '../auth/request-principal.js';
import {operation,type OperationClient} from '../platform-operations/operation-store.js';
import {object,onlyKeys,string,uuid,version} from '../platform-operations/validation.js';
import {AccessMailService} from './access-mail.service.js';
function documents():LegalDocument[]{
 const result:LegalDocument[]=[];
 for(const id of ['terms','privacy'] as const){const prefix=`PAPADATA_${id.toUpperCase()}`,v=process.env[`${prefix}_VERSION`],href=process.env[`${prefix}_URL`];if(!v||!href)continue;let url:URL;try{url=new URL(href);}catch{continue;}if(url.protocol!=='https:'||url.username||url.password||v.length>80)continue;result.push({id,version:v,url:url.href,required:true});}return result;
}
@Injectable()
export class AccessLifecycleService{
 constructor(@Inject(ProductionDatabase)private readonly db:ProductionDatabase,@Inject(AccessMailService)private readonly mail:AccessMailService){}
 private scoped<T>(p:RequestPrincipal,fn:(c:OperationClient)=>Promise<T>):Promise<T>{return this.db.withIdentityTenantWorkspace(createHash('sha256').update(`user:${p.userId}`).digest('hex'),p.userId,p.tenantId,p.workspaceId,fn);}
 async read(p:RequestPrincipal):Promise<AccessLifecycleStatus>{return this.scoped(p,async c=>{
  const user=(await c.query<{normalized_email:string;email_verified_at:string|null}>('SELECT normalized_email,email_verified_at FROM app.identity_users WHERE user_id=$1',[p.userId])).rows[0];if(!user)throw new ForbiddenException('Identity is unavailable.');
  const company=(await c.query<{version:number;profile:CompanyProfile;source:'manual'|'gus_bir'}>('SELECT version,profile,source FROM app.access_company_profiles WHERE tenant_id=$1 AND workspace_id=$2',[p.tenantId,p.workspaceId])).rows[0];
  const accepted=(await c.query<{id:string;version:string;acceptedAt:string}>(`SELECT document_id AS id,document_version AS version,accepted_at::text AS "acceptedAt" FROM app.access_consents WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3`,[p.tenantId,p.workspaceId,p.userId])).rows;
  const completed=(await c.query<{at:string}>(`SELECT completed_at::text AS at FROM app.access_completions WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3`,[p.tenantId,p.workspaceId,p.userId])).rows[0];
  const sources=(await c.query<{count:number;ready:number;last:string|null}>(`SELECT count(*)::int AS count,count(*) FILTER(WHERE EXISTS(SELECT 1 FROM app.source_batches b WHERE b.tenant_id=c.tenant_id AND b.workspace_id=c.workspace_id AND b.connection_id=c.connection_id AND b.status='success' AND b.record_count>0))::int AS ready,(SELECT max(j.completed_at)::text FROM app.sync_jobs j WHERE j.tenant_id=$1 AND j.workspace_id=$2 AND j.status IN('succeeded','partial_success','recovered')) AS last FROM app.integration_connections c WHERE c.tenant_id=$1 AND c.workspace_id=$2`,[p.tenantId,p.workspaceId])).rows[0];
  const docs=documents();return {email:user.normalized_email,emailVerified:!!user.email_verified_at,userId:p.userId,company:company?{version:company.version,values:company.profile,source:company.source}:null,documents:docs,documentsConfigured:docs.length===2,acceptedDocuments:accepted,completedAt:completed?.at??null,canEditCompany:p.capabilities.includes('workspace.manage'),integrationCount:sources?.count??0,readySourceCount:sources?.ready??0,lastSyncAt:sources?.last??null,mailAvailable:this.mail.available()};
 });}
 async company(p:RequestPrincipal,body:unknown):Promise<object>{
  if(!p.capabilities.includes('workspace.manage'))throw new ForbiddenException('Workspace management required.');
  const b=object(body);onlyKeys(b,['requestId','expectedVersion','values','prefilledFromLookup']);const id=uuid(b.requestId),v=version(b.expectedVersion),raw=object(b.values);onlyKeys(raw,['legalName','vatId','street','city','postalCode','country']);
  const values:CompanyProfile={legalName:string(raw.legalName,2,200),vatId:normalizeNip(string(raw.vatId,10,20)),street:string(raw.street,2,200),city:string(raw.city,2,120),postalCode:string(raw.postalCode,5,6),country:'PL'};
  if(raw.country!=='PL'||!isValidNip(values.vatId)||!/^\d{2}-?\d{3}$/.test(values.postalCode))throw new BadRequestException('Invalid Polish tax identity or postal code.');
  // Simple, explicit source tag (DOC-P0-005 task 6, "safer variant"): the
  // frontend flags a save as gus_bir only when it directly follows a
  // successful lookup prefill with no field changed (see AccessFlowScreen's
  // submit handler) -- there is no server-side re-derivation against
  // company_lookup_audit, so this is a UI-reported label for the audit
  // trail, not a guarantee re-verified server-side.
  const source:'manual'|'gus_bir'=b.prefilledFromLookup===true?'gus_bir':'manual';
  return this.scoped(p,c=>operation(c,p,id,'access.company.save',{v,values,source},async()=>{
   await c.query('SELECT workspace_id FROM app.workspaces WHERE tenant_id=$1 AND workspace_id=$2 FOR UPDATE',[p.tenantId,p.workspaceId]);
   const old=(await c.query<{version:number}>('SELECT version FROM app.access_company_profiles WHERE tenant_id=$1 AND workspace_id=$2',[p.tenantId,p.workspaceId])).rows[0];if((old?.version??0)!==v)throw new ConflictException('Company data changed. Reload before saving.');
   await c.query(`INSERT INTO app.access_company_profiles(tenant_id,workspace_id,version,profile,source,updated_by) VALUES($1,$2,$3,$4::jsonb,$5,$6) ON CONFLICT(tenant_id,workspace_id) DO UPDATE SET version=EXCLUDED.version,profile=EXCLUDED.profile,source=EXCLUDED.source,updated_by=EXCLUDED.updated_by,updated_at=now()`,[p.tenantId,p.workspaceId,v+1,JSON.stringify(values),source,p.userId]);return {version:v+1,values,source};
  }));
 }
 async consent(p:RequestPrincipal,body:unknown):Promise<object>{
  const b=object(body);onlyKeys(b,['requestId','documents']);const id=uuid(b.requestId),docs=documents();
  if(docs.length!==2)throw new ConflictException('Approved legal document versions are not configured.');
  if(!Array.isArray(b.documents)||b.documents.length!==docs.length||!docs.every(d=>b.documents instanceof Array&&b.documents.some(x=>x&&typeof x==='object'&&x.id===d.id&&x.version===d.version)))throw new BadRequestException('Accept the current document versions.');
  return this.scoped(p,c=>operation(c,p,id,'access.consents.accept',docs,async()=>{for(const d of docs)await c.query(`INSERT INTO app.access_consents(tenant_id,workspace_id,user_id,document_id,document_version,document_url) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,[p.tenantId,p.workspaceId,p.userId,d.id,d.version,d.url]);return {accepted:true};}));
 }
 async complete(p:RequestPrincipal,body:unknown):Promise<object>{
  const b=object(body);onlyKeys(b,['requestId']);const id=uuid(b.requestId);const status=await this.read(p);
  if(!status.emailVerified||!status.company||!status.documentsConfigured||!status.documents.every(d=>status.acceptedDocuments.some(a=>a.id===d.id&&a.version===d.version)))throw new ConflictException('Email, company profile and current document acceptance are required.');
  return this.scoped(p,c=>operation(c,p,id,'access.lifecycle.complete',{},async()=>{const result=await c.query<{at:string}>(`INSERT INTO app.access_completions(tenant_id,workspace_id,user_id) VALUES($1,$2,$3) ON CONFLICT(tenant_id,workspace_id,user_id) DO UPDATE SET completed_at=app.access_completions.completed_at RETURNING completed_at::text AS at`,[p.tenantId,p.workspaceId,p.userId]);return {completedAt:result.rows[0]!.at};}));
 }
}
