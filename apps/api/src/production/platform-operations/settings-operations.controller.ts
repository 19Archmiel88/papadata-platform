import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { Principal } from '../auth/principal.decorator.js';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { AuditDeniedAccess, OperationId, RequireAuthLevel, RequireCapabilities } from '../auth/route-policy.js';
import { SettingsOperationsService } from './settings-operations.service.js';
@Controller('v1/settings/operations')
export class SettingsOperationsController {
 constructor(@Inject(SettingsOperationsService) private readonly service:SettingsOperationsService){}
 @Get() @OperationId('settings.operations.read') @RequireCapabilities('workspace.read') @AuditDeniedAccess()
 async read(@Principal() p:RequestPrincipal){return {data:await this.service.read(p)};}
 @Post('sections/:section') @OperationId('settings.operations.save') @RequireCapabilities('workspace.read') @RequireAuthLevel('step_up') @AuditDeniedAccess()
 async save(@Principal() p:RequestPrincipal,@Param('section') section:string,@Body() body:unknown){return {data:await this.service.save(p,section,body)};}
 @Get('team') @OperationId('settings.operations.team.read') @RequireCapabilities('tenant.membership.read') @AuditDeniedAccess()
 async team(@Principal() p:RequestPrincipal){return {data:await this.service.team(p)};}
 @Post('members/:id') @OperationId('settings.operations.member.command') @RequireCapabilities('tenant.membership.manage') @RequireAuthLevel('step_up') @AuditDeniedAccess()
 async member(@Principal() p:RequestPrincipal,@Param('id') id:string,@Body() body:unknown){return {data:await this.service.member(p,id,body)};}
 @Get('privacy') @OperationId('settings.operations.privacy.read') @RequireCapabilities('privacy.dsar.manage') @AuditDeniedAccess()
 async privacy(@Principal() p:RequestPrincipal){return {data:await this.service.privacy(p)};}
 @Get('audit') @OperationId('settings.operations.audit.read') @RequireCapabilities('audit.read') @AuditDeniedAccess()
 async audit(@Principal() p:RequestPrincipal,@Query('before') before?:string){return {data:await this.service.audit(p,before)};}
}
