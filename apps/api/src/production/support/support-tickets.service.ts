import { cleanProductContextPath } from '@papadata/contracts';
import { createHash } from 'node:crypto';
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductionDatabase } from '@papadata/database';
import type { SupportContext, SupportTicket, SupportTicketInput, SupportTicketDetail, SupportMessage, SupportTicketsPage, SupportTicketCommand } from '@papadata/contracts';
import type { RequestPrincipal } from '../auth/request-principal.js';
const record = (value: unknown): value is Record<string,unknown> => Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
const text = (value: unknown,min:number,max:number) => typeof value==='string'&&value.trim().length>=min&&value.length<=max;
function input(value: unknown): SupportTicketInput {
  if(!record(value)||!text(value.requestId,36,36)||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(String(value.requestId))||!['technical','consultation'].includes(String(value.kind))||!text(value.subject,5,160)||!text(value.message,20,10000))throw new BadRequestException('Uzupełnij temat (5-160 znaków) i opis (20-10000 znaków).');
  let context: SupportContext|null=null;
  if(value.context!=null){
    if(!record(value.context)||!text(value.context.sourcePath,4,4000))throw new BadRequestException('Nieprawidłowy kontekst sprawy.');
    const sourcePath=cleanProductContextPath(value.context.sourcePath);
    if(!sourcePath)throw new BadRequestException('Invalid application context.');
    const topic=value.context.topic,procedureId=value.context.procedureId;
    if(topic!=null&&!text(topic,1,120)||procedureId!=null&&!text(procedureId,1,120))throw new BadRequestException('Nieprawidłowy temat kontekstu.');
    context={sourcePath,topic:topic as string|null??null,procedureId:procedureId as string|null??null};
  }
  return {requestId:String(value.requestId),kind:value.kind as SupportTicketInput['kind'],subject:String(value.subject).trim(),message:String(value.message).trim(),context};
}
// Keep the stored message out of collection and idempotency replay responses.
function publicTicket(row:SupportTicket):SupportTicket{
 return {id:row.id,number:row.number,kind:row.kind,subject:row.subject,status:row.status,createdAt:row.createdAt,context:row.context,consultationConfirmed:false};
}
@Injectable()
export class SupportTicketsService {
  constructor(@Inject(ProductionDatabase) private readonly database: ProductionDatabase){}
  async list(principal: RequestPrincipal,query:Record<string,unknown>={}):Promise<SupportTicketsPage>{
    const page=Number(query.page??1),pageSize=50,search=String(query.search??'').trim(),status=String(query.status??'all');
    if(!Number.isSafeInteger(page)||page<1||page>10000||search.length>160||!['all','received','in_progress','waiting_for_user','resolved'].includes(status))throw new BadRequestException('Invalid support filters.');
    return this.database.withTenantWorkspace(principal.tenantId,principal.workspaceId,async client=>{
      const escaped=search.replace(/[\\%_]/g,'\\$&');
      const args=[principal.tenantId,principal.workspaceId,status,`%${escaped}%`];
      const where=`tenant_id=$1 AND workspace_id=$2 AND ($3='all' OR document->>'status'=$3) AND (document->>'subject' ILIKE $4 OR document->>'number' ILIKE $4)`;
      const count=await client.query<{total:string}>(`SELECT COUNT(*) AS total FROM app.support_tickets WHERE ${where}`,args);
      const rows=await client.query<{document:SupportTicket}>(`SELECT document FROM app.support_tickets WHERE ${where} ORDER BY created_at DESC,ticket_id DESC LIMIT $5 OFFSET $6`,[...args,pageSize,(page-1)*pageSize]);
      return {records:rows.rows.map(row=>publicTicket(row.document)),total:Number(count.rows[0]?.total??0),page,pageSize};
    });
  }
  private detail(row:{document:SupportTicket & {message?:string;messages?:SupportMessage[];version?:number;updatedAt?:string};created_by_user_id:string},principal:RequestPrincipal):SupportTicketDetail {
    const doc=row.document;
    const messages=doc.messages??[{id:doc.id,authorId:row.created_by_user_id,at:doc.createdAt,text:doc.message??'',kind:'message' as const}];
    return {...publicTicket(doc),version:doc.version??1,updatedAt:doc.updatedAt??doc.createdAt,messages,canRespond:row.created_by_user_id===principal.userId||principal.capabilities.includes('workspace.manage')};
  }
  private id(value:string):void {
    if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value))throw new BadRequestException('Invalid request identifier.');
  }
  async read(principal:RequestPrincipal,id:string):Promise<SupportTicketDetail>{
    this.id(id);
    return this.database.withTenantWorkspace(principal.tenantId,principal.workspaceId,async client=>{
      const rows=await client.query<{document:SupportTicket;created_by_user_id:string}>('SELECT document,created_by_user_id FROM app.support_tickets WHERE tenant_id=$1 AND workspace_id=$2 AND ticket_id=$3',[principal.tenantId,principal.workspaceId,id]);
      if(!rows.rows[0])throw new NotFoundException('Request is not available in this workspace.');
      return this.detail(rows.rows[0],principal);
    });
  }
  async command(principal:RequestPrincipal,id:string,value:unknown):Promise<SupportTicketDetail>{
    this.id(id);
    if(!record(value)||!text(value.requestId,36,36)||!Number.isSafeInteger(value.expectedVersion)||Number(value.expectedVersion)<1||!['reply','resolve','reopen'].includes(String(value.action))||!text(value.message,5,5000))throw new BadRequestException('Provide an action, current version and message (5-5000 characters).');
    this.id(String(value.requestId));
    const command:SupportTicketCommand={requestId:String(value.requestId),expectedVersion:Number(value.expectedVersion),action:value.action as SupportTicketCommand['action'],message:String(value.message).trim()};
    const hash=createHash('sha256').update(JSON.stringify({actor:principal.userId,id,command})).digest('hex');
    return this.database.withTenantWorkspace(principal.tenantId,principal.workspaceId,async client=>{
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`support-command:${principal.tenantId}:${principal.workspaceId}:${command.requestId}`]);
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`support:${principal.tenantId}:${principal.workspaceId}:${id}`]);
      const rows=await client.query<{document:SupportTicket;created_by_user_id:string}>('SELECT document,created_by_user_id FROM app.support_tickets WHERE tenant_id=$1 AND workspace_id=$2 AND ticket_id=$3 FOR UPDATE',[principal.tenantId,principal.workspaceId,id]);
      if(!rows.rows[0])throw new NotFoundException('Request is not available in this workspace.');
      const current=this.detail(rows.rows[0],principal);
      if(!current.canRespond)throw new ForbiddenException('Only the requester or a workspace manager may update this request.');
      const previous=await client.query<{request_hash:string;response:SupportTicketDetail}>('SELECT request_hash,response FROM app.support_ticket_commands WHERE tenant_id=$1 AND workspace_id=$2 AND request_id=$3',[principal.tenantId,principal.workspaceId,command.requestId]);
      if(previous.rows[0]){if(previous.rows[0].request_hash!==hash)throw new ConflictException('Idempotency key was used for another operation.');return previous.rows[0].response;}
      if(current.version!==command.expectedVersion)throw new ConflictException('The request changed in another session. Refresh before submitting again.');
      if(current.messages.length>=1000)throw new ConflictException('Request history limit reached. No messages were removed.');
      if(command.action==='reopen'&&current.status!=='resolved'||command.action!=='reopen'&&current.status==='resolved')throw new ConflictException('Reopen a resolved request before replying.');
      const at=new Date().toISOString(),status=command.action==='resolve'?'resolved':command.action==='reopen'||current.status==='waiting_for_user'?'received':current.status;
      const next:SupportTicketDetail={...current,status,version:current.version+1,updatedAt:at,messages:[...current.messages,{id:command.requestId,authorId:principal.userId,at,text:command.message,kind:command.action==='resolve'?'resolved':command.action==='reopen'?'reopened':'message'}]};
      const {canRespond:_,...document}=next;
      const json=JSON.stringify(document);
      if(Buffer.byteLength(json,'utf8')>1024*1024)throw new ConflictException('Request history exceeds 1 MiB. No data was removed.');
      await client.query('UPDATE app.support_tickets SET document=$4::jsonb,updated_at=now() WHERE tenant_id=$1 AND workspace_id=$2 AND ticket_id=$3',[principal.tenantId,principal.workspaceId,id,json]);
      await client.query('INSERT INTO app.support_ticket_commands(tenant_id,workspace_id,ticket_id,request_id,request_hash,response) VALUES($1,$2,$3,$4,$5,$6::jsonb)',[principal.tenantId,principal.workspaceId,id,command.requestId,hash,JSON.stringify(next)]);
      return next;
    });
  }
  async create(principal: RequestPrincipal,value:unknown):Promise<SupportTicket>{
    const request=input(value), hash=createHash('sha256').update(JSON.stringify(request)).digest('hex');
    return this.database.withTenantWorkspace(principal.tenantId,principal.workspaceId,async client=>{
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`support:${principal.tenantId}:${principal.workspaceId}:${request.requestId}`]);
      const existing=await client.query<{request_hash:string;document:SupportTicket;created_by_user_id:string}>('SELECT request_hash,document,created_by_user_id FROM app.support_tickets WHERE tenant_id=$1 AND workspace_id=$2 AND ticket_id=$3',[principal.tenantId,principal.workspaceId,request.requestId]);
      if(existing.rows[0]){if(existing.rows[0].created_by_user_id!==principal.userId)throw new ConflictException('Request identifier is already in use.');if(existing.rows[0].request_hash!==hash)throw new ConflictException('Ta sprawa została już zapisana z inną treścią. Sprawdź historię zgłoszeń.');return publicTicket(existing.rows[0].document);}
      const ticket:SupportTicket={id:request.requestId,number:`HELP-${request.requestId.toUpperCase()}`,kind:request.kind,subject:request.subject,status:'received',createdAt:new Date().toISOString(),context:request.context,consultationConfirmed:false};
      await client.query('INSERT INTO app.support_tickets(tenant_id,workspace_id,ticket_id,request_hash,created_by_user_id,document) VALUES($1,$2,$3,$4,$5,$6::jsonb)',[principal.tenantId,principal.workspaceId,request.requestId,hash,principal.userId,JSON.stringify({...ticket,message:request.message})]);
      // Persisted queue only. No claim of email delivery, assigned agent, or a booked slot.
      return ticket;
    });
  }
}
