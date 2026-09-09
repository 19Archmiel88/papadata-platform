import {BadRequestException,ConflictException,ForbiddenException,Inject,Injectable,NotFoundException,ServiceUnavailableException} from '@nestjs/common';
import type {OnModuleDestroy} from '@nestjs/common';
import {createHash} from 'node:crypto';
import {AiBudgetGuard,LocalDeterministicProvider,OpenAiCompatibleProvider,redactText,type AiProviderAdapter} from '@papadata/ai-runtime';
import {AssistantConversationRepository,BillingRepository,ProductionDatabase} from '@papadata/database';
import type {AssistantRun,AssistantStreamEvent} from '@papadata/contracts';
import type {RequestPrincipal} from '../auth/request-principal.js';
import {LivePrincipalAuthorizationService} from '../auth/live-principal-authorization.service.js';
import {PRINCIPAL_SESSION_STORE,type PrincipalSessionStore} from '../auth/principal.service.js';
import {generatePapaAnswer} from '../contract-runtime/papa-conversation.real-source.js';
import {object,onlyKeys,string,uuid} from '../platform-operations/validation.js';
import {AssistantWorkspaceService} from './assistant-workspace.service.js';
const columns='id,conversation_id AS "conversationId",case_thread_id AS "caseThreadId",status,partial_text AS "partialText",result,error_code AS "errorCode",native_streaming AS "nativeStreaming",updated_at::text AS "updatedAt"';
const terminal=(status:string)=>!['queued','running'].includes(status);
function positive(name:string,fallback:number){const v=Number(process.env[name]??fallback);if(!Number.isFinite(v)||v<=0)throw new Error(`Invalid ${name}`);return v;}
function providerConfig():{provider:AiProviderAdapter;modelId:string;nativeStreaming:boolean;reserve:number}{
 if(process.env.PAPADATA_PAPA_REMOTE_ENABLED!=='true')return {provider:new LocalDeterministicProvider(),modelId:'local-deterministic',nativeStreaming:false,reserve:0};
 const endpoint=process.env.PAPADATA_PAPA_REMOTE_ENDPOINT??'',key=process.env.PAPADATA_PAPA_REMOTE_API_KEY??'',modelId=process.env.PAPADATA_PAPA_REMOTE_MODEL??'';
 const allow=(process.env.PAPADATA_PAPA_REMOTE_ALLOWED_HOSTS??'').split(',').map(x=>x.trim().toLowerCase());const url=new URL(endpoint);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||!allow.includes(url.hostname.toLowerCase())||key.length<12||!modelId||modelId.length>150)throw new Error('Remote AI configuration is incomplete or unsafe.');
 const suffix='/chat/completions';if(!url.pathname.endsWith(suffix))throw new Error('Remote endpoint must end with /chat/completions.');
 const baseUrl=new URL(url.href);baseUrl.pathname=url.pathname.slice(0,-suffix.length)||'/';
 const reserve=Math.ceil(positive('PAPADATA_PAPA_REMOTE_RESERVE_MINOR_PER_CALL',50)),upstream=new OpenAiCompatibleProvider({providerId:'configured-chat-provider',endpoint:baseUrl.href.replace(/\/$/,''),apiKey:key,timeoutMs:90_000,maxAttempts:1});
 // Safety reservation, deliberately not a claim of measured vendor billing.
 const provider:AiProviderAdapter={providerId:upstream.providerId,complete:(r,s)=>upstream.complete(r,s),stream:(r,s)=>upstream.stream(r,s),embed:(r,s)=>upstream.embed(r,s),health:s=>upstream.health(s),cancel:id=>upstream.cancel(id),generate:(r,s)=>upstream.generate(r,s),estimateCost:r=>({...upstream.estimateCost(r),costMinor:reserve})};
 return {provider,modelId,nativeStreaming:true,reserve};
}
@Injectable()
export class AssistantRunService implements OnModuleDestroy{
 private readonly active=new Map<string,AbortController>();
 private readonly repository:AssistantConversationRepository;
 private readonly billing:BillingRepository;
 constructor(@Inject(ProductionDatabase)db:ProductionDatabase,@Inject(AssistantWorkspaceService)private readonly workspace:AssistantWorkspaceService,@Inject(LivePrincipalAuthorizationService)private readonly authorization:LivePrincipalAuthorizationService,@Inject(PRINCIPAL_SESSION_STORE)private readonly sessions:PrincipalSessionStore){this.repository=new AssistantConversationRepository(db);this.billing=new BillingRepository(db);}
 onModuleDestroy(){for(const c of this.active.values())c.abort('server_shutdown');}
 async currentAuthority(p:RequestPrincipal):Promise<void>{
  const session=await this.sessions.findSession(p.sessionId);
  if(!session||session.revokedAt||Date.parse(session.expiresAt)<=Date.now()||session.userId!==p.userId||session.activeTenantId!==p.tenantId||session.activeWorkspaceId!==p.workspaceId)throw new ForbiddenException('Session or workspace changed.');
  const result=await this.authorization.authorize({principal:p,requiredCapabilities:['ai.assistant.run','ai.history.read']});if(!result.allowed)throw new ForbiddenException('Assistant permission changed.');
 }
 async start(p:RequestPrincipal,input:unknown):Promise<AssistantRun>{
  const b=object(input);onlyKeys(b,['requestId','conversationId','caseThreadId','prompt','attachmentIds','useMemory']);
  const id=uuid(b.requestId),conversationId=uuid(b.conversationId),caseThreadId=b.caseThreadId?uuid(b.caseThreadId):null,prompt=string(b.prompt,1,8000);
  if(!Array.isArray(b.attachmentIds)||b.attachmentIds.length>5||typeof b.useMemory!=='boolean')throw new BadRequestException('Invalid context selection.');
  const ids=[...new Set(b.attachmentIds.map(uuid))],useMemory=b.useMemory;
  await this.currentAuthority(p);const thread=await this.workspace.requireThread(p,conversationId);if(thread.thread_kind!=='conversation'||thread.archived_at)throw new ConflictException('Use an active conversation.');
  if(caseThreadId){const child=await this.workspace.requireThread(p,caseThreadId);if(child.thread_kind!=='case'||child.parent_thread_id!==conversationId||child.archived_at)throw new BadRequestException('Case does not belong to the conversation.');}
  const prefs=await this.workspace.preferences(p);if(!['context','evidence','metrics'].every(tool=>prefs.allowedReadTools.includes(tool)))throw new ForbiddenException('Grounded generation requires context, evidence and metric access.');
  const additional=await this.workspace.additionalContext(p,conversationId,ids,useMemory);
  let config:ReturnType<typeof providerConfig>;try{config=providerConfig();}catch{throw new ServiceUnavailableException('Configured AI provider is unavailable.');}
  const hash=createHash('sha256').update(JSON.stringify({conversationId,caseThreadId,prompt,ids,useMemory,policyVersion:prefs.version})).digest('hex');
  const created=await this.workspace.scoped(p,async c=>{
   await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`assistant-run:${p.tenantId}:${p.workspaceId}`]);
   const prior=(await c.query<{request_hash:string;user_id:string}>('SELECT request_hash,user_id FROM app.assistant_generation_runs WHERE tenant_id=$1 AND workspace_id=$2 AND id=$3',[p.tenantId,p.workspaceId,id])).rows[0];
   if(prior){if(prior.request_hash!==hash||prior.user_id!==p.userId)throw new ConflictException('Run identifier has different content or policy.');return false;}
   await c.query(`UPDATE app.assistant_generation_runs SET status='interrupted',error_code='WORKER_INTERRUPTED',updated_at=now() WHERE tenant_id=$1 AND workspace_id=$2 AND status IN('queued','running') AND updated_at<now()-interval '3 minutes'`,[p.tenantId,p.workspaceId]);
   const count=(await c.query<{count:number}>('SELECT count(*)::int AS count FROM app.assistant_generation_runs WHERE tenant_id=$1 AND workspace_id=$2 AND status IN(\'queued\',\'running\')',[p.tenantId,p.workspaceId])).rows[0]?.count??0;
   if(count>=1)throw new ConflictException('A generation is already active in this workspace. Wait or cancel it.');
   const spent=(await c.query<{workspace:string;actor:string}>(`SELECT coalesce(sum(reserved_cost_minor),0)::text AS workspace,coalesce(sum(reserved_cost_minor) FILTER(WHERE user_id=$3),0)::text AS actor FROM app.assistant_generation_runs WHERE tenant_id=$1 AND workspace_id=$2 AND created_at>=date_trunc('month',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'`,[p.tenantId,p.workspaceId,p.userId])).rows[0];
   if(Number(spent?.workspace??0)+config.reserve>positive('AI_WORKSPACE_BUDGET_MINOR_PER_MONTH',20000)||Number(spent?.actor??0)+config.reserve>positive('AI_USER_BUDGET_MINOR_PER_MONTH',4000))throw new ForbiddenException('Monthly AI safety allocation exhausted. Cancelled calls also count.');
   await c.query(`INSERT INTO app.assistant_generation_runs(id,tenant_id,workspace_id,user_id,conversation_id,case_thread_id,request_hash,status,native_streaming,reserved_cost_minor) VALUES($1,$2,$3,$4,$5,$6,$7,'queued',$8,$9)`,[id,p.tenantId,p.workspaceId,p.userId,conversationId,caseThreadId,hash,config.nativeStreaming,config.reserve]);return true;
  });
  if(created){const controller=new AbortController();this.active.set(id,controller);void this.execute(p,id,conversationId,caseThreadId,prompt,additional,prefs,config,controller).catch(()=>undefined);}
  return this.read(p,id);
 }
 private async execute(p:RequestPrincipal,id:string,conversationId:string,caseThreadId:string|null,prompt:string,additional:string[],prefs:Awaited<ReturnType<AssistantWorkspaceService['preferences']>>,config:ReturnType<typeof providerConfig>,controller:AbortController){
  let accumulated='',lastWrite=0;const timer=setTimeout(()=>controller.abort('generation_timeout'),110_000);
  const heartbeat=setInterval(()=>{void this.read(p,id).then(async run=>{await this.currentAuthority(p);const policy=await this.workspace.preferences(p);if(policy.version!==prefs.version||run.status==='cancelled')controller.abort('policy_or_state_changed');}).catch(()=>controller.abort('authorization_unavailable'));},1500);
  try{
   const updated=await this.workspace.scoped(p,async c=>(await c.query(`UPDATE app.assistant_generation_runs SET status='running',updated_at=now() WHERE tenant_id=$1 AND workspace_id=$2 AND id=$3 AND status='queued' RETURNING id`,[p.tenantId,p.workspaceId,id])).rows.length);if(!updated)return;
   const result=await generatePapaAnswer({repository:this.repository,billing:this.billing,budgetGuard:new AiBudgetGuard(),provider:config.provider,modelId:config.modelId,maxOutputTokens:config.nativeStreaming?1536:512,tenantId:p.tenantId,workspaceId:p.workspaceId,userId:p.userId,conversationId,caseThreadId,parentConversationId:null,prompt,idempotencyKey:`run:${id}`,signal:controller.signal,historyEnabled:prefs.historyEnabled,contextDays:prefs.contextDays,supplementaryContext:additional,
    ...(config.nativeStreaming?{onDelta:async(chunk:string)=>{controller.signal.throwIfAborted();accumulated+=chunk;if(Date.now()-lastWrite>200){lastWrite=Date.now();await this.workspace.scoped(p,c=>c.query(`UPDATE app.assistant_generation_runs SET partial_text=$4,updated_at=now() WHERE tenant_id=$1 AND workspace_id=$2 AND id=$3 AND status='running'`,[p.tenantId,p.workspaceId,id,redactText(accumulated)]));}}}:{})});
   if(!result)throw new Error('THREAD_UNAVAILABLE');await this.currentAuthority(p);controller.signal.throwIfAborted();
   await this.workspace.scoped(p,c=>c.query(`UPDATE app.assistant_generation_runs SET status='completed',result=$4::jsonb,partial_text='',updated_at=now() WHERE tenant_id=$1 AND workspace_id=$2 AND id=$3 AND status='running'`,[p.tenantId,p.workspaceId,id,JSON.stringify(result)]));
  }catch{
   await this.workspace.scoped(p,c=>c.query(`UPDATE app.assistant_generation_runs SET status=$4,error_code=$5,partial_text=$6,updated_at=now() WHERE tenant_id=$1 AND workspace_id=$2 AND id=$3 AND status IN('queued','running')`,[p.tenantId,p.workspaceId,id,controller.signal.aborted?'cancelled':'failed',controller.signal.aborted?'GENERATION_STOPPED':'GENERATION_FAILED',redactText(accumulated)]));
  }finally{clearInterval(heartbeat);clearTimeout(timer);this.active.delete(id);}
 }
 async read(p:RequestPrincipal,id:string):Promise<AssistantRun>{return this.workspace.scoped(p,async c=>{
  await c.query(`UPDATE app.assistant_generation_runs SET status='interrupted',error_code='PROCESS_INTERRUPTED',updated_at=now() WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3 AND id=$4 AND status IN('queued','running') AND updated_at<now()-interval '3 minutes'`,[p.tenantId,p.workspaceId,p.userId,uuid(id)]);
  const row=(await c.query<AssistantRun>(`SELECT ${columns} FROM app.assistant_generation_runs WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3 AND id=$4`,[p.tenantId,p.workspaceId,p.userId,id])).rows[0];if(!row)throw new NotFoundException('Run not found.');return row;
 });}
 async cancel(p:RequestPrincipal,id:string):Promise<object>{uuid(id);const run=await this.read(p,id);if(terminal(run.status))return {id,status:run.status};await this.workspace.scoped(p,c=>c.query(`UPDATE app.assistant_generation_runs SET status='cancelled',error_code='CANCEL_REQUESTED',updated_at=now() WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3 AND id=$4 AND status IN('queued','running')`,[p.tenantId,p.workspaceId,p.userId,id]));this.active.get(id)?.abort('user_cancelled');return {id,status:'cancelled'};}
 async *events(p:RequestPrincipal,id:string,signal:AbortSignal):AsyncIterable<string>{
  let previous='';const deadline=Date.now()+100_000;
  while(!signal.aborted&&Date.now()<deadline){await this.currentAuthority(p);const run=await this.read(p,id);let event:AssistantStreamEvent;
   if(run.status==='completed')event={type:'completed',result:run.result};
   else if(terminal(run.status))event={type:'stopped',status:run.status as 'failed'|'cancelled'|'interrupted',code:run.errorCode??'GENERATION_STOPPED'};
   else if(run.partialText!==previous){event={type:'delta',text:run.partialText};previous=run.partialText;}
   else event={type:'run',runId:id,nativeStreaming:run.nativeStreaming};
   // Delta is a replacement snapshot, not append; reconnects cannot duplicate text.
   yield `data: ${JSON.stringify(event)}\n\n`;if(terminal(run.status))return;
   await new Promise<void>(resolve=>{const t=setTimeout(done,500);function done(){clearTimeout(t);signal.removeEventListener('abort',done);resolve();}signal.addEventListener('abort',done,{once:true});});
  }
 }
}
