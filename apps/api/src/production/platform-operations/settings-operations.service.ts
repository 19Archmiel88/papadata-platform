import { createHash } from 'node:crypto';
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductionDatabase } from '@papadata/database';
import { assignableTeamRoles, isSettingSection, settingScope, settingSections, type SettingDocument, type SettingSection, type SettingsOverview, type SettingValues, type TeamOverview, type TeamMember } from '@papadata/contracts';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { operation, type OperationClient } from './operation-store.js';
import { object, onlyKeys, string, uuid, version } from './validation.js';
import { LivePrincipalAuthorizationService } from '../auth/live-principal-authorization.service.js';

function validateValues(section: SettingSection, input: unknown): SettingValues {
 const raw=object(input), out: Record<string,string|number|boolean>={};
 const keys: Record<SettingSection,readonly string[]>={
  profile:['name','language','theme','timezone'], organization:['name'], workspace:['name'],
  analytics:['revenueGoal','currency','timezone'], notifications:['digestOptIn','integrationAlerts','billingAlerts'],
 };
 onlyKeys(raw,keys[section]);
 if(keys[section].some(key=>!(key in raw)))throw new BadRequestException('All section fields are required.');
 for(const key of keys[section]){
  const value=raw[key];
  if(key==='revenueGoal') {if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1e12)throw new BadRequestException('Goal must be between 0 and 1e12.');out[key]=value;}
  else if(section==='notifications'){if(typeof value!=='boolean')throw new BadRequestException('Expected a boolean preference.');out[key]=value;}
  else {const text=string(value,1,key==='name'?160:80);if(key==='language'&&!['pl','en'].includes(text)||key==='theme'&&!['system','light','dark'].includes(text)||key==='currency'&&!['PLN','EUR','USD'].includes(text))throw new BadRequestException('Unsupported preference.');if(key==='timezone'){try{new Intl.DateTimeFormat('en',{timeZone:text});}catch{throw new BadRequestException('Invalid time zone.');}}out[key]=text;}
 }
 return out;
}
@Injectable()
export class SettingsOperationsService {
 constructor(@Inject(ProductionDatabase) private readonly db: ProductionDatabase, @Inject(LivePrincipalAuthorizationService) private readonly authorization:LivePrincipalAuthorizationService){}
 private canEdit(p:RequestPrincipal,section:SettingSection):boolean {
  return settingScope(section)==='self'||(section==='organization'?p.capabilities.includes('tenant.membership.manage'):p.capabilities.includes('workspace.manage'));
 }
 private scoped<T>(p:RequestPrincipal,fn:(client:OperationClient)=>Promise<T>):Promise<T>{
  return this.db.withIdentityTenantWorkspace(createHash('sha256').update(`user:${p.userId}`).digest('hex'),p.userId,p.tenantId,p.workspaceId,fn);
 }
 async read(p:RequestPrincipal):Promise<SettingsOverview>{
  return this.scoped(p,async c=>{
   const account=await c.query<{name:string;email:string;mfa_enabled:boolean}>(`SELECT full_name AS name,email,EXISTS(SELECT 1 FROM app.security_mfa_enrollments e WHERE e.tenant_id=$2 AND e.user_id=u.user_id::text AND e.method='totp' AND e.status='active') AS mfa_enabled FROM app.users u WHERE user_id=$1`,[p.userId,p.tenantId]);
   const user=account.rows[0];if(!user)throw new NotFoundException('Account unavailable.');
   const names=await c.query<{tenant_name:string;workspace_name:string}>(`SELECT t.name AS tenant_name,w.name AS workspace_name FROM app.tenants t JOIN app.workspaces w USING(tenant_id) WHERE t.tenant_id=$1 AND w.workspace_id=$2`,[p.tenantId,p.workspaceId]);
   const tenantName=names.rows[0]?.tenant_name??'',workspaceName=names.rows[0]?.workspace_name??'';
   const rows=await c.query<{section:SettingSection;version:number;values:SettingValues;updated_at:string}>(`SELECT section,version,config_json AS "values",updated_at::text FROM app.platform_setting_documents WHERE tenant_id=$1 AND ((scope_kind='self' AND scope_id=$2) OR (scope_kind='tenant' AND scope_id=$1) OR(scope_kind='workspace' AND scope_id=$3))`,[p.tenantId,p.userId,p.workspaceId]);
   const defaults:Record<SettingSection,SettingValues>={profile:{name:user.name,language:'pl',theme:'system',timezone:'Europe/Warsaw'},organization:{name:tenantName},workspace:{name:workspaceName},analytics:{revenueGoal:0,currency:'PLN',timezone:'Europe/Warsaw'},notifications:{digestOptIn:false,integrationAlerts:true,billingAlerts:true}};
   return {version:'settings.operations.v1',user:{id:p.userId,name:user.name,email:user.email,mfaEnabled:user.mfa_enabled},tenantName,workspaceName,documents:settingSections.map(section=>{const saved=rows.rows.find(row=>row.section===section);return {section,scope:settingScope(section),version:saved?.version??0,values:{...(saved?.values??defaults[section]),...(['profile','organization','workspace'].includes(section)?{name:defaults[section].name!}:{})},updatedAt:saved?.updated_at??null,canEdit:this.canEdit(p,section)};})};
  });
 }
 async save(p:RequestPrincipal,sectionName:string,value:unknown):Promise<SettingDocument>{
  if(!isSettingSection(sectionName))throw new NotFoundException('Unknown setting section.');
  const section=sectionName,raw=object(value);onlyKeys(raw,['requestId','expectedVersion','values']);
  const required = settingScope(section)==='self' ? 'workspace.read' : section==='organization' ? 'tenant.membership.manage' : 'workspace.manage';
  if(!(await this.authorization.authorize({principal:p,requiredCapabilities:[required]})).allowed)throw new ForbiddenException('This setting requires administrative access.');
  // The generic route requires step-up; self preferences also follow it to avoid weaker mutation paths.
  const requestId=uuid(raw.requestId),expectedVersion=version(raw.expectedVersion),values=validateValues(section,raw.values),scope=settingScope(section),scopeId=scope==='self'?p.userId:scope==='tenant'?p.tenantId:p.workspaceId;
  return this.scoped(p,c=>operation(c,p,requestId,`settings.${section}.save`,{expectedVersion,values},async()=>{
   await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`setting:${p.tenantId}:${scope}:${scopeId}:${section}`]);
   const row=await c.query<{version:number}>('SELECT version FROM app.platform_setting_documents WHERE tenant_id=$1 AND scope_kind=$2 AND scope_id=$3 AND section=$4 FOR UPDATE',[p.tenantId,scope,scopeId,section]);
   if((row.rows[0]?.version??0)!==expectedVersion)throw new ConflictException('Settings changed in another session. Read the current version before saving.');
   if(section==='profile') {
    await c.query('UPDATE app.users SET full_name=$2,updated_at=now() WHERE user_id=$1',[p.userId,values.name]);
    await c.query('UPDATE app.identity_users SET display_name=$2,updated_at=now() WHERE user_id=$1',[p.userId,values.name]);
   }
   if(section==='organization')await c.query('UPDATE app.tenants SET name=$2,updated_at=now() WHERE tenant_id=$1',[p.tenantId,values.name]);
   if(section==='workspace')await c.query('UPDATE app.workspaces SET name=$3,updated_at=now() WHERE tenant_id=$1 AND workspace_id=$2',[p.tenantId,p.workspaceId,values.name]);
   const at=new Date().toISOString();
   await c.query(`INSERT INTO app.platform_setting_documents(tenant_id,scope_kind,scope_id,section,workspace_id,user_id,version,config_json,updated_by,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10) ON CONFLICT(tenant_id,scope_kind,scope_id,section) DO UPDATE SET version=EXCLUDED.version,config_json=EXCLUDED.config_json,updated_by=EXCLUDED.updated_by,updated_at=EXCLUDED.updated_at`,[p.tenantId,scope,scopeId,section,scope==='workspace'?p.workspaceId:null,scope==='self'?p.userId:null,expectedVersion+1,JSON.stringify(values),p.userId,at]);
   return {section,scope,version:expectedVersion+1,values,updatedAt:at,canEdit:true};
  }));
 }
 async team(p:RequestPrincipal):Promise<TeamOverview>{
  return this.scoped(p,async c=>{
   const members=await c.query<TeamMember>(`SELECT m.membership_id AS id,m.user_id AS "userId",u.full_name AS name,u.email,m.role,m.status,m.data_scope AS scope,m.operation_version AS version,EXISTS(SELECT 1 FROM app.security_mfa_enrollments e WHERE e.tenant_id=m.tenant_id::text AND e.user_id=u.user_id::text AND e.method='totp' AND e.status='active') AS "mfaEnabled" FROM app.memberships m JOIN app.users u USING(user_id) WHERE m.tenant_id=$1 AND m.workspace_id=$2 ORDER BY u.full_name,m.membership_id LIMIT 501`,[p.tenantId,p.workspaceId]);
   if(members.rows.length>500)throw new ConflictException('More than 500 members; use the administrative export rather than a truncated team list.');
   const invitations=await c.query<TeamOverview['invitations'][number]>(`SELECT invitation_id AS id,email,role,status,expires_at::text AS "expiresAt",created_at::text AS "createdAt" FROM app.invitations WHERE tenant_id=$1 AND workspace_id=$2 AND status='pending' ORDER BY created_at DESC LIMIT 501`,[p.tenantId,p.workspaceId]);
   if(invitations.rows.length>500)throw new ConflictException('Pending invitation limit exceeded.');
   return {members:members.rows,invitations:invitations.rows,canManage:p.capabilities.includes('tenant.membership.manage'),currentUserId:p.userId};
  });
 }
 async member(p:RequestPrincipal,id:string,value:unknown):Promise<{id:string;version:number;status:string;role:string}>{
  uuid(id);const raw=object(value);onlyKeys(raw,['requestId','expectedVersion','action','role','reason']);
  const requestId=uuid(raw.requestId),expectedVersion=version(raw.expectedVersion),action=string(raw.action),reason=string(raw.reason,10,1000);
  if(!['role','revoke'].includes(action))throw new BadRequestException('Unsupported member action.');
  const role=action==='role'?string(raw.role):null;
  if(role&&!(assignableTeamRoles as readonly string[]).includes(role))throw new BadRequestException('Ownership and support grants use a separate protected process.');
  return this.scoped(p,c=>operation(c,p,requestId,'settings.member.command',{id,expectedVersion,action,role,reason},async()=>{
   // Lock the workspace first, so concurrent removals cannot both pass ownership checks.
   await c.query('SELECT workspace_id FROM app.workspaces WHERE tenant_id=$1 AND workspace_id=$2 FOR UPDATE',[p.tenantId,p.workspaceId]);
   const rows=await c.query<{user_id:string;role:string;status:string;operation_version:number}>(`SELECT user_id,role,status,operation_version FROM app.memberships WHERE tenant_id=$1 AND workspace_id=$2 AND membership_id=$3 FOR UPDATE`,[p.tenantId,p.workspaceId,id]);
   const member=rows.rows[0];if(!member)throw new NotFoundException('Member unavailable in this workspace.');
   if(member.user_id===p.userId)throw new ForbiddenException('You cannot change your own access with this operation.');
   if(member.role==='Tenant Owner'||member.role==='Internal Support/Operations')throw new ForbiddenException('Owner and temporary support access are excluded from this operation.');
   if(member.status!=='active'||member.operation_version!==expectedVersion)throw new ConflictException('Membership changed. Reload the team.');
   const nextRole=role??member.role,nextStatus=action==='revoke'?'revoked':member.status;
   const dataScope=nextRole==='Billing Admin'?'billing':nextRole==='Auditor/Security'?'audit':'workspace';
   await c.query(`UPDATE app.memberships SET role=$4,status=$5,data_scope=$6,operation_version=operation_version+1,updated_at=now() WHERE tenant_id=$1 AND workspace_id=$2 AND membership_id=$3`,[p.tenantId,p.workspaceId,id,nextRole,nextStatus,dataScope]);
   return {id,version:expectedVersion+1,status:nextStatus,role:nextRole};
  }));
 }
 async privacy(p:RequestPrincipal){
  return this.db.withTenantWorkspace(p.tenantId,p.workspaceId,async c=>{
   const rows=await c.query<{id:string;kind:string;status:string;subject:string;requestedAt:string;dueAt:string;completedAt:string|null;legalHold:boolean;targets:{system:string;status:string;errorCode:string|null}[]}>(`SELECT r.id,r.request_type AS kind,r.status,r.subject_reference AS subject,r.requested_at::text AS "requestedAt",r.due_at::text AS "dueAt",r.completed_at::text AS "completedAt",r.legal_hold AS "legalHold",COALESCE((SELECT jsonb_agg(jsonb_build_object('system',t.system,'status',t.status,'errorCode',t.error_code)) FROM app.privacy_request_targets t WHERE t.request_id=r.id),'[]'::jsonb) AS targets FROM app.privacy_requests r WHERE r.tenant_id=$1 AND r.workspace_id=$2 ORDER BY r.requested_at DESC LIMIT 100`,[p.tenantId,p.workspaceId]);
   return {records:rows.rows,limit:100};
  });
 }
 async audit(p:RequestPrincipal,before?:string) {
  if(before && !/^\d+$/.test(before))throw new BadRequestException('Invalid audit cursor.');
  return this.db.withTenantWorkspace(p.tenantId,p.workspaceId,async c=>{
   const rows=await c.query<{id:string;sequence:string;action:string;outcome:string;actor:string;resource:string;resourceId:string|null;createdAt:string;correlationId:string}>(`SELECT id,sequence_number::text AS sequence,action,outcome,actor_id AS actor,resource_type AS resource,resource_id AS "resourceId",created_at::text AS "createdAt",correlation_id AS "correlationId" FROM app.security_audit_events WHERE tenant_id=$1 AND workspace_id=$2 AND ($3::bigint IS NULL OR sequence_number<$3::bigint) ORDER BY sequence_number DESC LIMIT 101`,[p.tenantId,p.workspaceId,before??null]);
   return {events:rows.rows.slice(0,100),hasMore:rows.rows.length>100,nextCursor:rows.rows.length>100?rows.rows[99]!.sequence:null,chainVerified:false as const};
  });
 }

}
