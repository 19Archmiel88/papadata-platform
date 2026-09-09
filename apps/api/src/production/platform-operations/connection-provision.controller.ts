import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { Principal } from '../auth/principal.decorator.js';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { AuditDeniedAccess, OperationId, RequireAuthLevel, RequireCapabilities } from '../auth/route-policy.js';
import { ConnectionProvisionService } from './connection-provision.service.js';
@Controller('v1/integrations/provision')
export class ConnectionProvisionController {
 constructor(@Inject(ConnectionProvisionService) private readonly service:ConnectionProvisionService){}
 @Get() @OperationId('integrations.provision.capabilities') @RequireCapabilities('integrations.catalog.read') @AuditDeniedAccess()
 read(){return {data:this.service.capabilities()};}
 @Post() @OperationId('integrations.credentials.provision') @RequireCapabilities('integrations.connection.manage','integrations.credentials.manage') @RequireAuthLevel('step_up') @AuditDeniedAccess()
 write(@Principal() p:RequestPrincipal,@Body() body:unknown){return this.service.provision(p,body).then(data=>({data}));}
}
