import {Body,Controller,Get,Post,Inject} from '@nestjs/common';
import {Principal} from '../auth/principal.decorator.js';
import {OperationId,RequireCapabilities,AuditDeniedAccess} from '../auth/route-policy.js';
import type {RequestPrincipal} from '../auth/request-principal.js';
import {AccessLifecycleService} from './access-lifecycle.service.js';
@Controller('v1/access/lifecycle')
export class AccessLifecycleController{
 constructor(@Inject(AccessLifecycleService)private readonly service:AccessLifecycleService){}
 @Get() @OperationId('access.lifecycle.read') @RequireCapabilities('workspace.read') @AuditDeniedAccess()
 async read(@Principal() p:RequestPrincipal){return {data:await this.service.read(p)};}
 @Post('company') @OperationId('access.lifecycle.company.save') @RequireCapabilities('workspace.manage') @AuditDeniedAccess()
 async company(@Principal() p:RequestPrincipal,@Body() b:unknown){return {data:await this.service.company(p,b)};}
 @Post('consents') @OperationId('access.lifecycle.consents.accept') @RequireCapabilities('workspace.read') @AuditDeniedAccess()
 async consent(@Principal() p:RequestPrincipal,@Body() b:unknown){return {data:await this.service.consent(p,b)};}
 @Post('complete') @OperationId('access.lifecycle.complete') @RequireCapabilities('workspace.read') @AuditDeniedAccess()
 async complete(@Principal() p:RequestPrincipal,@Body() b:unknown){return {data:await this.service.complete(p,b)};}
}
