import {Body,Controller,Get,Inject,Param,Post,Query,Req,Res} from '@nestjs/common';
import type {FastifyRequest,FastifyReply} from 'fastify';
import {Readable} from 'node:stream';
import {Principal} from '../auth/principal.decorator.js';
import {OperationId,RequireCapabilities,RequireAuthLevel,AuditDeniedAccess} from '../auth/route-policy.js';
import type {RequestPrincipal} from '../auth/request-principal.js';
import {AuditService} from '../audit/audit.service.js';
import type {RequestWithContext} from '../observability/request-context.js';
import {AssistantWorkspaceService} from './assistant-workspace.service.js';
import {AssistantRunService} from './assistant-run.service.js';
@Controller('v1/papa/workspace')
export class AssistantWorkspaceController{
 constructor(@Inject(AssistantWorkspaceService)private readonly workspace:AssistantWorkspaceService,@Inject(AssistantRunService)private readonly runs:AssistantRunService,@Inject(AuditService)private readonly audit:AuditService){}
 @Get('preferences') @OperationId('papa.workspace.preferences.read') @RequireCapabilities('ai.history.read') @AuditDeniedAccess()
 async preferences(@Principal()p:RequestPrincipal){return {data:await this.workspace.preferences(p)};}
 @Post('preferences') @OperationId('papa.workspace.preferences.save') @RequireCapabilities('workspace.manage') @RequireAuthLevel('step_up') @AuditDeniedAccess()
 async savePreferences(@Principal()p:RequestPrincipal,@Body()b:unknown){return {data:await this.workspace.savePreferences(p,b)};}
 @Get('threads') @OperationId('papa.workspace.threads.read') @RequireCapabilities('ai.history.read') @AuditDeniedAccess()
 async threads(@Principal()p:RequestPrincipal,@Query()q:unknown){return {data:await this.workspace.threads(p,q)};}
 @Post('threads/archive') @OperationId('papa.workspace.threads.archive') @RequireCapabilities('ai.history.read') @AuditDeniedAccess()
 async archive(@Principal()p:RequestPrincipal,@Body()b:unknown){return {data:await this.workspace.archive(p,b)};}
 @Get('memory') @OperationId('papa.workspace.memory.read') @RequireCapabilities('ai.history.read') @AuditDeniedAccess()
 async memory(@Principal()p:RequestPrincipal){return {data:await this.workspace.memory(p)};}
 @Post('memory') @OperationId('papa.workspace.memory.save') @RequireCapabilities('ai.assistant.run') @AuditDeniedAccess()
 async saveMemory(@Principal()p:RequestPrincipal,@Body()b:unknown){return {data:await this.workspace.saveMemory(p,b)};}
 @Post('memory/delete') @OperationId('papa.workspace.memory.delete') @RequireCapabilities('ai.history.read') @AuditDeniedAccess()
 async deleteMemory(@Principal()p:RequestPrincipal,@Body()b:unknown){return {data:await this.workspace.deleteMemory(p,b)};}
 @Get('attachments/:threadId') @OperationId('papa.workspace.attachments.read') @RequireCapabilities('ai.history.read') @AuditDeniedAccess()
 async attachments(@Principal()p:RequestPrincipal,@Param('threadId')id:string){return {data:await this.workspace.attachments(p,id)};}
 @Post('attachments') @OperationId('papa.workspace.attachments.add') @RequireCapabilities('ai.assistant.run') @AuditDeniedAccess()
 async attach(@Principal()p:RequestPrincipal,@Body()b:unknown){return {data:await this.workspace.attach(p,b)};}
 @Post('attachments/delete') @OperationId('papa.workspace.attachments.delete') @RequireCapabilities('ai.history.read') @AuditDeniedAccess()
 async detach(@Principal()p:RequestPrincipal,@Body()b:unknown){return {data:await this.workspace.detach(p,b)};}
 @Post('runs') @OperationId('papa.workspace.runs.create') @RequireCapabilities('ai.assistant.run','ai.history.read') @AuditDeniedAccess()
 async start(@Principal()p:RequestPrincipal,@Body()b:unknown){return {data:await this.runs.start(p,b)};}
 @Get('runs/:id') @OperationId('papa.workspace.runs.read') @RequireCapabilities('ai.history.read') @AuditDeniedAccess()
 async run(@Principal()p:RequestPrincipal,@Param('id')id:string){return {data:await this.runs.read(p,id)};}
 @Post('runs/:id/cancel') @OperationId('papa.workspace.runs.cancel') @RequireCapabilities('ai.assistant.run') @AuditDeniedAccess()
 async cancel(@Principal()p:RequestPrincipal,@Param('id')id:string){return {data:await this.runs.cancel(p,id)};}
 @Get('runs/:id/events') @OperationId('papa.workspace.runs.stream') @RequireCapabilities('ai.assistant.run','ai.history.read') @AuditDeniedAccess()
 async events(@Principal()p:RequestPrincipal,@Param('id')id:string,@Res()reply:FastifyReply){
  await this.runs.read(p,id);await this.runs.currentAuthority(p);
  const controller=new AbortController(),closed=()=>controller.abort();reply.raw.once('close',closed);
  const stream=Readable.from(this.runs.events(p,id,controller.signal));stream.once('close',()=>{reply.raw.off('close',closed);controller.abort();});
  reply.header('Content-Type','text/event-stream; charset=utf-8').header('Cache-Control','no-store').header('X-Accel-Buffering','no').send(stream);
 }
 @Get('diagnostics') @OperationId('papa.workspace.diagnostics.read') @RequireCapabilities('ai.history.read') @AuditDeniedAccess()
 async diagnostics(@Principal()p:RequestPrincipal,@Query()q:unknown){return {data:await this.workspace.diagnostics(p,q)};}
 @Get('notifications') @OperationId('papa.workspace.notifications.read') @RequireCapabilities('ai.history.read') @AuditDeniedAccess()
 async notifications(@Principal()p:RequestPrincipal){return {data:await this.workspace.notifications(p)};}
 @Post('notifications') @OperationId('papa.workspace.notifications.update') @RequireCapabilities('ai.history.read') @AuditDeniedAccess()
 async notification(@Principal()p:RequestPrincipal,@Body()b:unknown){return {data:await this.workspace.notification(p,b)};}
 @Get('export/:threadId') @OperationId('papa.workspace.context.export') @RequireCapabilities('ai.history.read','reports.download') @RequireAuthLevel('step_up') @AuditDeniedAccess()
 async export(@Principal()p:RequestPrincipal,@Param('threadId')id:string,@Req()r:FastifyRequest){
  const data=await this.workspace.export(p,id),context=r as unknown as RequestWithContext;
  await this.audit.append({action:'papa.workspace.context.export',actorId:p.userId,actorType:'user',correlationId:context.correlationId??'unknown',metadata:{conversationId:id},outcome:'success',resourceId:id,resourceType:'assistant_context',tenantId:p.tenantId,workspaceId:p.workspaceId});return {data};
 }
}
