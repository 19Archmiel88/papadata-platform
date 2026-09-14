import {BadRequestException,Inject,Injectable} from '@nestjs/common';
import {randomUUID} from 'node:crypto';
import {ProductionDatabase} from '@papadata/database';
import {CONTRACT_VERSION,parseCookieConsentCategories,type CookieConsentCategories,type CookieConsentDecision,type CookieConsentStatus} from '@papadata/contracts';
import type {RequestPrincipal} from '../auth/request-principal.js';
import {AuditService} from '../audit/audit.service.js';
import {ProductionConfigurationError} from '../config.js';
import {uuid} from '../platform-operations/validation.js';
import {LegalDocumentsService} from '../legal-documents/legal-documents.service.js';

// Cookie-policy version has no existing document/contract to derive from
// Ops bumps PAPADATA_COOKIE_CONSENT_VERSION when the cookie policy changes.
// A silent fallback would prevent fresh consent collection after that bump.
function currentCookieConsentVersion():string{
 const version=process.env.PAPADATA_COOKIE_CONSENT_VERSION?.trim();
 if(!version)throw new ProductionConfigurationError('PAPADATA_COOKIE_CONSENT_VERSION is required.');
 if(version.length>80)throw new ProductionConfigurationError('PAPADATA_COOKIE_CONSENT_VERSION must be at most 80 characters.');
 return version;
}

type ConsentRow={
 readonly categories:Record<string,unknown>;
 readonly version:string;
 readonly updated_at:string;
};

function toStatus(row:ConsentRow|undefined):CookieConsentStatus{
 const currentVersion=currentCookieConsentVersion();
 if(!row)return {currentVersion,decision:null};
 const c=row.categories;
 const decision:CookieConsentDecision={
  categories:{
   analytics:c.analytics===true,
   marketing:c.marketing===true,
   necessary:true,
   preferences:c.preferences===true,
  },
  decidedAt:row.updated_at,
  version:row.version,
 };
 return {currentVersion,decision};
}

@Injectable()
export class CookieConsentService{
 constructor(
  @Inject(ProductionDatabase) private readonly db:ProductionDatabase,
  @Inject(AuditService) private readonly audit:AuditService,
  @Inject(LegalDocumentsService) private readonly legalDocuments:LegalDocumentsService,
 ){}

 async read(rawSubjectId:unknown):Promise<CookieConsentStatus>{
  const subjectId=uuid(rawSubjectId);
  const row=await this.db.withCookieConsentSubject(subjectId,async c=>{
   const result=await c.query<ConsentRow>('SELECT categories,version,updated_at::text FROM app.cookie_consents WHERE subject_id=$1',[subjectId]);
   return result.rows[0];
  });
  const status=toStatus(row);
  this.warnIfCookiePolicyVersionDrifted(status.currentVersion);
  return status;
 }

 async write(rawSubjectId:unknown,body:unknown,principal:RequestPrincipal|null,correlationId:string):Promise<CookieConsentStatus>{
  const subjectId=uuid(rawSubjectId);
  const categories=readSelection(body);
  const version=currentCookieConsentVersion();
  const userId=principal?.userId??null;
  const tenantId=principal?.tenantId??null;
  const workspaceId=principal?.workspaceId??null;

  const {row,inserted}=await this.db.withCookieConsentSubject(subjectId,async c=>{
   const result=await c.query<ConsentRow&{inserted:boolean}>(
    `INSERT INTO app.cookie_consents(consent_id,subject_id,user_id,tenant_id,workspace_id,categories,version)
     VALUES($1,$2,$3,$4,$5,$6::jsonb,$7)
     ON CONFLICT(subject_id) DO UPDATE SET
       user_id=EXCLUDED.user_id,tenant_id=EXCLUDED.tenant_id,workspace_id=EXCLUDED.workspace_id,
       categories=EXCLUDED.categories,version=EXCLUDED.version,updated_at=now()
     RETURNING categories,version,updated_at::text,(xmax=0) AS inserted`,
    [randomUUID(),subjectId,userId,tenantId,workspaceId,JSON.stringify(categories),version],
   );
   return {row:result.rows[0]!,inserted:result.rows[0]!.inserted};
  });

  await this.recordAudit({categories,correlationId,inserted,principal,subjectId});
  const status=toStatus(row);
  this.warnIfCookiePolicyVersionDrifted(status.currentVersion);
  return status;
 }

 // PAPADATA_COOKIE_CONSENT_VERSION stays the source of truth for cookie
 // consent freshness (see BATCH F report): app.legal_documents has no
 // provisioned cookie_policy row in most environments yet, so keying
 // consent freshness off it directly would turn "no cookie policy
 // published" into "no one can save cookie consent" -- a regression of
 // BATCH E. Once a cookie_policy document is published, its version and
 // this env var are expected to represent the same policy change and
 // should be bumped together; this best-effort, fire-and-forget check
 // makes a silent drift between them visible in logs without adding a
 // hard runtime dependency or changing read()/write()'s fail mode.
 private warnIfCookiePolicyVersionDrifted(currentVersion:string):void{
  this.legalDocuments.activeVersion('cookie_policy')
   .then(activeVersion=>{
    if(activeVersion&&activeVersion!==currentVersion){
     console.warn('Cookie policy document version does not match PAPADATA_COOKIE_CONSENT_VERSION.',{activeVersion,currentVersion});
    }
   })
   .catch(()=>undefined);
 }

 // Authenticated writes go through the canonical hash-chained audit trail
 // (AuditService -> app.security_audit_events), exactly like every other
 // production write in this codebase. Anonymous writes have no tenant to
 // scope a chain by -- AuditRepository.append()/withTenantWorkspace both
 // hard-require one -- so they go to app.audit_events instead: a plain,
 // already-provisioned table (tenant_id is nullable there) whose own
 // compliance index was written explicitly expecting 'cookie_consent.%'
 // actions (see packages/database/migrations/000003_compliance_notifications.sql).
 // Not a parallel audit architecture -- each write goes to the one existing
 // table actually able to represent its scope. The insert runs under the
 // same cookie-consent subject scope as the consent row itself (see
 // migration 0071) -- app.audit_events' RLS policy only recognizes an
 // anonymous cookie_consent.* row whose resource_id matches that scope.
 private async recordAudit(input:{
  readonly categories:CookieConsentCategories;
  readonly correlationId:string;
  readonly inserted:boolean;
  readonly principal:RequestPrincipal|null;
  readonly subjectId:string;
 }):Promise<void>{
  const action=input.inserted?'cookie_consent.created':'cookie_consent.updated';
  const metadata={categories:input.categories,subjectId:input.subjectId};
  if(input.principal){
   await this.audit.append({
    action,
    actorId:input.principal.userId,
    actorType:'user',
    correlationId:input.correlationId,
    metadata,
    outcome:'success',
    resourceId:input.subjectId,
    resourceType:'cookie_consent',
    tenantId:input.principal.tenantId,
    workspaceId:input.principal.workspaceId,
   });
   return;
  }
  await this.db.withCookieConsentSubject(input.subjectId,async c=>{
   await c.query(
    `INSERT INTO app.audit_events(event_id,tenant_id,workspace_id,actor_type,actor_id,action,resource_type,resource_id,correlation_id,contract_version,metadata)
     VALUES($1,NULL,NULL,'system',NULL,$2,'cookie_consent',$3,$4,$5,$6::jsonb)`,
    [randomUUID(),action,input.subjectId,input.correlationId,CONTRACT_VERSION,JSON.stringify(metadata)],
   );
  });
 }
}

function readSelection(value:unknown):CookieConsentCategories{
 try{
  return parseCookieConsentCategories(value);
 }catch(error){
  throw new BadRequestException(error instanceof Error?error.message:'Invalid cookie consent categories.');
 }
}
