import {BadRequestException,ConflictException,ForbiddenException,Inject,Injectable,NotFoundException} from '@nestjs/common';
import {createHash} from 'node:crypto';
import {AssistantConversationRepository,ProductionDatabase} from '@papadata/database';
import {redactText} from '@papadata/ai-runtime';
import {assistantAttachmentByteLimit,assistantFileTypes,assistantReadTools,type AssistantAttachment,type AssistantMemory,type AssistantPreferences,type AssistantThread,type AssistantContextExport} from '@papadata/contracts';
import type {RequestPrincipal} from '../auth/request-principal.js';
import {operation,type OperationClient} from '../platform-operations/operation-store.js';
import {object,onlyKeys,string,uuid,version} from '../platform-operations/validation.js';
const noteColumns='id,title,content,version,created_at::text AS "createdAt",updated_at::text AS "updatedAt",expires_at::text AS "expiresAt"';
const attachmentColumns='id,conversation_id AS "conversationId",name,media_type AS "mediaType",bytes,sha256,left(content,240) AS excerpt,created_at::text AS "createdAt",expires_at::text AS "expiresAt"';
function boolean(value:unknown):boolean {if(typeof value!=='boolean')throw new BadRequestException('Expected boolean.');return value;}
@Injectable()
export class AssistantWorkspaceService {
 private readonly repository:AssistantConversationRepository;
 constructor(@Inject(ProductionDatabase)private readonly db:ProductionDatabase){this.repository=new AssistantConversationRepository(db);}
 scoped<T>(p:RequestPrincipal,fn:(c:OperationClient)=>Promise<T>):Promise<T>{return this.db.withTenantWorkspace(p.tenantId,p.workspaceId,fn);}
 async requireThread(p:RequestPrincipal,id:string):Promise<Record<string,unknown>>{
  const thread=await this.repository.findThread(p.tenantId,p.workspaceId,uuid(id));
  if(!thread)throw new NotFoundException('Thread not found in this workspace.');
  return thread;
 }
 async preferences(p:RequestPrincipal):Promise<AssistantPreferences>{return this.scoped(p,async c=>{
  const row=(await c.query<{version:number;history_enabled:boolean;context_days:number;memory_enabled:boolean;attachment_enabled:boolean;read_tools:string[]}>('SELECT * FROM app.assistant_preferences WHERE tenant_id=$1 AND workspace_id=$2',[p.tenantId,p.workspaceId])).rows[0];
  return {version:row?.version??0,historyEnabled:row?.history_enabled??true,contextDays:row?.context_days??30,memoryEnabled:row?.memory_enabled??false,attachmentEnabled:row?.attachment_enabled??false,allowedReadTools:row?.read_tools??['context','evidence','reports','metrics'],externalActionsEnabled:false,canEdit:p.capabilities.includes('workspace.manage')};
 });}
 async savePreferences(p:RequestPrincipal,input:unknown):Promise<object>{
  if(!p.capabilities.includes('workspace.manage'))throw new ForbiddenException('Workspace management required.');
  const b=object(input);onlyKeys(b,['requestId','expectedVersion','historyEnabled','contextDays','memoryEnabled','attachmentEnabled','allowedReadTools']);
  const id=uuid(b.requestId),v=version(b.expectedVersion),days=version(b.contextDays);
  const history=boolean(b.historyEnabled),memory=boolean(b.memoryEnabled),attachments=boolean(b.attachmentEnabled);
  if(days<1||days>365||!Array.isArray(b.allowedReadTools)||b.allowedReadTools.length>5||b.allowedReadTools.some(x=>!assistantReadTools.includes(x)))throw new BadRequestException('Unsupported policy value.');
  const tools=[...new Set<string>(b.allowedReadTools)];
  return this.scoped(p,c=>operation(c,p,id,'assistant.preferences.save',b,async()=>{
   await c.query('SELECT workspace_id FROM app.workspaces WHERE tenant_id=$1 AND workspace_id=$2 FOR UPDATE',[p.tenantId,p.workspaceId]);
   const old=(await c.query<{version:number}>('SELECT version FROM app.assistant_preferences WHERE tenant_id=$1 AND workspace_id=$2',[p.tenantId,p.workspaceId])).rows[0];
   if((old?.version??0)!==v)throw new ConflictException('Policy changed. Reload.');
   await c.query(`INSERT INTO app.assistant_preferences(tenant_id,workspace_id,version,history_enabled,context_days,memory_enabled,attachment_enabled,read_tools,updated_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(tenant_id,workspace_id) DO UPDATE SET version=EXCLUDED.version,history_enabled=EXCLUDED.history_enabled,context_days=EXCLUDED.context_days,memory_enabled=EXCLUDED.memory_enabled,attachment_enabled=EXCLUDED.attachment_enabled,read_tools=EXCLUDED.read_tools,updated_by=EXCLUDED.updated_by,updated_at=now()`,[p.tenantId,p.workspaceId,v+1,history,days,memory,attachments,tools,p.userId]);
   return {version:v+1};
  }));
 }
 async threads(p:RequestPrincipal,query:unknown):Promise<{records:AssistantThread[];hasMore:boolean}>{
  const q=object(query??{}),page=Math.min(version(Number(q.page??0)),1000),search=q.search?string(q.search,1,120):'',archived=q.archived==='true';
  return this.scoped(p,async c=>{const rows=(await c.query<AssistantThread>(`SELECT assistant_thread_id AS id,title,thread_kind AS kind,parent_thread_id AS "parentId",updated_at::text AS "updatedAt",archived_at::text AS "archivedAt",(created_by_user_id=$3) AS "canArchive" FROM app.assistant_threads WHERE tenant_id=$1 AND workspace_id=$2 AND created_by_user_id=$3 AND (archived_at IS NOT NULL)=$4 AND strpos(lower(title),lower($5))>0 ORDER BY updated_at DESC,assistant_thread_id DESC LIMIT 31 OFFSET $6`,[p.tenantId,p.workspaceId,p.userId,archived,search,page*30])).rows;return {records:rows.slice(0,30),hasMore:rows.length>30};});
 }
 async archive(p:RequestPrincipal,input:unknown):Promise<object>{
  const b=object(input);onlyKeys(b,['requestId','conversationId','archived']);const id=uuid(b.requestId),threadId=uuid(b.conversationId),archived=boolean(b.archived);
  return this.scoped(p,c=>operation(c,p,id,'assistant.thread.archive',{threadId,archived},async()=>{const result=await c.query(`UPDATE app.assistant_threads SET archived_at=CASE WHEN $5 THEN now() ELSE NULL END,updated_at=now() WHERE assistant_thread_id=$4 AND tenant_id=$1 AND workspace_id=$2 AND created_by_user_id=$3 RETURNING assistant_thread_id`,[p.tenantId,p.workspaceId,p.userId,threadId,archived]);if(!result.rows[0])throw new NotFoundException('Owned thread not found.');return {id:threadId,archived};}));
 }
 async memory(p:RequestPrincipal):Promise<AssistantMemory[]>{return this.scoped(p,async c=>(await c.query<AssistantMemory>(`SELECT ${noteColumns} FROM app.assistant_memory_notes WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3 AND (expires_at IS NULL OR expires_at>now()) ORDER BY updated_at DESC LIMIT 100`,[p.tenantId,p.workspaceId,p.userId])).rows);}
 async saveMemory(p:RequestPrincipal,input:unknown):Promise<object>{
  const b=object(input);onlyKeys(b,['requestId','id','expectedVersion','title','content','days']);const requestId=uuid(b.requestId),id=uuid(b.id),v=version(b.expectedVersion),days=version(b.days);
  if(days<1||days>365)throw new BadRequestException('Memory lifetime must be 1-365 days.');
  const title=redactText(string(b.title,2,100)),content=redactText(string(b.content,1,4000));
  const prefs=await this.preferences(p);if(!prefs.memoryEnabled)throw new ForbiddenException('Memory is disabled by workspace policy.');
  return this.scoped(p,c=>operation(c,p,requestId,'assistant.memory.save',{id,v,title,content,days},async()=>{
   await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`assistant-memory:${p.tenantId}:${p.workspaceId}:${p.userId}`]);
   await c.query('DELETE FROM app.assistant_memory_notes WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3 AND expires_at<=now()',[p.tenantId,p.workspaceId,p.userId]);
   const old=(await c.query<{version:number}>('SELECT version FROM app.assistant_memory_notes WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3 AND id=$4 FOR UPDATE',[p.tenantId,p.workspaceId,p.userId,id])).rows[0];
   if((old?.version??0)!==v)throw new ConflictException('Memory version changed.');
   if(!old){const count=(await c.query<{count:number}>('SELECT count(*)::int AS count FROM app.assistant_memory_notes WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3',[p.tenantId,p.workspaceId,p.userId])).rows[0]?.count??0;if(count>=100)throw new ConflictException('Memory limit reached. Remove expired notes.');
    await c.query('INSERT INTO app.assistant_memory_notes(id,tenant_id,workspace_id,user_id,title,content,expires_at) VALUES($1,$2,$3,$4,$5,$6,now()+($7::int*interval \'1 day\'))',[id,p.tenantId,p.workspaceId,p.userId,title,content,days]);
   }else await c.query(`UPDATE app.assistant_memory_notes SET title=$5,content=$6,version=version+1,updated_at=now(),expires_at=now()+($7::int*interval '1 day') WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3 AND id=$4`,[p.tenantId,p.workspaceId,p.userId,id,title,content,days]);
   // Replay receipts contain no note body, so deletion does not retain it there.
   return {id,version:v+1};
  }));
 }
 async deleteMemory(p:RequestPrincipal,input:unknown):Promise<object>{
  const b=object(input);onlyKeys(b,['requestId','id','expectedVersion']);const requestId=uuid(b.requestId),id=uuid(b.id),v=version(b.expectedVersion);
  return this.scoped(p,c=>operation(c,p,requestId,'assistant.memory.delete',{id,v},async()=>{const result=await c.query('DELETE FROM app.assistant_memory_notes WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3 AND id=$4 AND version=$5 RETURNING id',[p.tenantId,p.workspaceId,p.userId,id,v]);if(!result.rows[0])throw new ConflictException('Memory missing or version changed.');return {id,deleted:true};}));
 }
 async attachments(p:RequestPrincipal,threadId:string):Promise<AssistantAttachment[]>{await this.requireThread(p,threadId);return this.scoped(p,async c=>(await c.query<AssistantAttachment>(`SELECT ${attachmentColumns} FROM app.assistant_text_attachments WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3 AND conversation_id=$4 AND expires_at>now() ORDER BY created_at DESC LIMIT 10`,[p.tenantId,p.workspaceId,p.userId,threadId])).rows);}
 async attach(p:RequestPrincipal,input:unknown):Promise<object>{
  const b=object(input);onlyKeys(b,['requestId','conversationId','name','content']);const id=uuid(b.requestId),threadId=uuid(b.conversationId);
  await this.requireThread(p,threadId);const prefs=await this.preferences(p);if(!prefs.attachmentEnabled)throw new ForbiddenException('Attachments are disabled by workspace policy.');
  const name=string(b.name,1,100).replace(/[^a-zA-Z0-9_. -]/g,'_'),ext=name.split('.').at(-1)?.toLowerCase()??'';
  if(!Object.hasOwn(assistantFileTypes,ext))throw new BadRequestException('Only UTF-8 TXT, MD, CSV and JSON are supported.');
  const raw=string(b.content,1,assistantAttachmentByteLimit);if(Buffer.byteLength(raw,'utf8')>assistantAttachmentByteLimit)throw new BadRequestException('Attachment is too large.');
  if(ext==='json'){try{JSON.parse(raw);}catch{throw new BadRequestException('Invalid JSON.');}}
  const content=redactText(raw),bytes=Buffer.byteLength(content),sha=createHash('sha256').update(content).digest('hex'),mediaType=assistantFileTypes[ext as keyof typeof assistantFileTypes];
  return this.scoped(p,c=>operation(c,p,id,'assistant.attachment.add',{threadId,name,sha},async()=>{
   await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`assistant-files:${p.tenantId}:${p.workspaceId}:${p.userId}:${threadId}`]);
   await c.query('DELETE FROM app.assistant_text_attachments WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3 AND expires_at<=now()',[p.tenantId,p.workspaceId,p.userId]);
   const count=(await c.query<{count:number}>('SELECT count(*)::int AS count FROM app.assistant_text_attachments WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3 AND conversation_id=$4',[p.tenantId,p.workspaceId,p.userId,threadId])).rows[0]?.count??0;if(count>=5)throw new ConflictException('At most five attachments per conversation.');
   await c.query(`INSERT INTO app.assistant_text_attachments(id,tenant_id,workspace_id,user_id,conversation_id,name,media_type,bytes,sha256,content,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now()+interval '7 days')`,[id,p.tenantId,p.workspaceId,p.userId,threadId,name,mediaType,bytes,sha,content]);return {id,bytes,sha256:sha};
  }));
 }
 async detach(p:RequestPrincipal,input:unknown):Promise<object>{const b=object(input);onlyKeys(b,['requestId','id']);const id=uuid(b.id),requestId=uuid(b.requestId);return this.scoped(p,c=>operation(c,p,requestId,'assistant.attachment.delete',{id},async()=>{await c.query('DELETE FROM app.assistant_text_attachments WHERE id=$4 AND tenant_id=$1 AND workspace_id=$2 AND user_id=$3',[p.tenantId,p.workspaceId,p.userId,id]);return {id,deleted:true};}));}
 async additionalContext(p:RequestPrincipal,threadId:string,ids:readonly string[],useMemory:boolean):Promise<string[]>{
  const prefs=await this.preferences(p);if(ids.length&&!prefs.attachmentEnabled)throw new ForbiddenException('Attachments are disabled.');if(useMemory&&(!prefs.memoryEnabled||!prefs.allowedReadTools.includes('memory')))throw new ForbiddenException('Memory is disabled.');
  const result:string[]=[];
  if(ids.length){const rows=await this.scoped(p,async c=>(await c.query<{id:string;name:string;content:string}>('SELECT id,name,content FROM app.assistant_text_attachments WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3 AND conversation_id=$4 AND id=ANY($5::uuid[]) AND expires_at>now()',[p.tenantId,p.workspaceId,p.userId,threadId,ids])).rows);if(rows.length!==ids.length)throw new NotFoundException('Attachment missing or expired.');for(const row of rows)result.push(`FILE ${row.name}\n${row.content}`);}
  if(useMemory)for(const note of await this.memory(p))result.push(`PERSONAL NOTE ${note.title}\n${note.content}`);
  if(result.join('\n').length>16_000)throw new BadRequestException('Selected reference context exceeds 16000 characters. Reduce attachments or memory.');
  return result;
 }
 async diagnostics(p:RequestPrincipal,query:unknown):Promise<Record<string,unknown>>{
  const q=object(query??{}),conversationId=uuid(q.conversationId),kind=string(q.kind,1,20);
  await this.requireThread(p,conversationId);const prefs=await this.preferences(p);
  if(!prefs.allowedReadTools.includes('evidence'))throw new ForbiddenException('Evidence is disabled by workspace policy.');
  const scope={tenantId:p.tenantId,workspaceId:p.workspaceId,conversationId,limit:30};
  if(kind==='contracts')return this.repository.readAssistantAiAnswerContracts({...scope,answerMessageId:null});
  if(kind==='provenance')return this.repository.readAssistantMetricProvenance({...scope,snapshotId:null});
  if(kind==='provider')return this.repository.readAssistantProviderGovernanceEvents({...scope,answerMessageId:null,operationId:null});
  if(kind==='privacy')return this.repository.readAssistantPrivacyRedactionEvents({...scope,operationId:null,stage:null,includeBlocked:true});
  throw new BadRequestException('Unsupported diagnostic kind.');
 }
 async notifications(p:RequestPrincipal):Promise<Record<string,unknown>>{return this.repository.readAssistantAiNotifications({tenantId:p.tenantId,workspaceId:p.workspaceId,caseId:null,caseThreadId:null,includeRead:true,includeSnoozed:true,limit:50});}
 async notification(p:RequestPrincipal,input:unknown):Promise<object>{
  const b=object(input);onlyKeys(b,['requestId','notificationId','action','snoozedUntil']);uuid(b.requestId);
  const notificationId=uuid(b.notificationId),scope={tenantId:p.tenantId,workspaceId:p.workspaceId,notificationId};
  const present=await this.scoped(p,async c=>(await c.query('SELECT assistant_ai_notification_id,severity FROM app.assistant_ai_notifications WHERE tenant_id=$1 AND workspace_id=$2 AND assistant_ai_notification_id=$3',[p.tenantId,p.workspaceId,notificationId])).rows[0]);
  if(!present)throw new NotFoundException('Notification not found.');
  if(b.action==='snooze'&&present.severity==='critical')throw new ConflictException('Critical notifications cannot be snoozed.');
  if(b.action==='read')return {record:await this.repository.markAssistantAiNotificationRead({...scope,read:true})};
  if(b.action==='unsnooze')return {record:await this.repository.snoozeAssistantAiNotification({...scope,snoozedUntil:null})};
  if(b.action==='snooze'){const date=string(b.snoozedUntil,20,40),time=Date.parse(date);if(!Number.isFinite(time)||time<=Date.now()||time>Date.now()+7*86400000)throw new BadRequestException('Snooze must be in the next seven days.');return {record:await this.repository.snoozeAssistantAiNotification({...scope,snoozedUntil:date})};}
  throw new BadRequestException('Unsupported notification command.');
 }
 async export(p:RequestPrincipal,threadId:string):Promise<AssistantContextExport>{
  const thread=await this.requireThread(p,threadId),prefs=await this.preferences(p);if(!prefs.allowedReadTools.includes('context'))throw new ForbiddenException('Context export is disabled by workspace policy.');
  const snapshot=await this.repository.findLatestSnapshot({tenantId:p.tenantId,workspaceId:p.workspaceId,threadId});
  const messages=await this.repository.listMessages({tenantId:p.tenantId,workspaceId:p.workspaceId,threadId,limit:100});
  const evidence=await this.scoped(p,async c=>(await c.query<Record<string,unknown>>(`SELECT e.* FROM app.assistant_evidence e JOIN app.assistant_messages m ON m.assistant_message_id=e.assistant_message_id AND m.tenant_id=e.tenant_id AND m.workspace_id=e.workspace_id WHERE e.tenant_id=$1 AND e.workspace_id=$2 AND m.assistant_thread_id=$3 ORDER BY e.created_at DESC,e.assistant_evidence_id DESC LIMIT 100`,[p.tenantId,p.workspaceId,threadId])).rows);
  // Export explicit fields, never provider credentials or internal raw SQL rows.
  const data:AssistantContextExport={schema:'papadata.context.v1',exportedAt:new Date().toISOString(),workspaceId:p.workspaceId,conversationId:threadId,title:String(thread.title),snapshot:prefs.allowedReadTools.includes('context')?snapshot?.snapshot??null:null,
   messages:[...messages].reverse().map(row=>({id:row.assistant_message_id,role:row.role,content:row.content,createdAt:row.created_at,confidence:row.confidence})),
   evidence:prefs.allowedReadTools.includes('evidence')?evidence.slice(0,100).map(row=>({id:row.assistant_evidence_id,source:row.source_type,reference:row.source_ref,metricCode:row.metric_code,collectedAt:row.created_at})):[],limits:{messageLimit:100,evidenceLimit:100}};
  if(Buffer.byteLength(JSON.stringify(data))>2*1024*1024)throw new ConflictException('Export exceeds 2 MiB. Use a smaller conversation.');
  return data;
 }
}
