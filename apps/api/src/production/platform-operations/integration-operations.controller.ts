import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { Principal } from '../auth/principal.decorator.js';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { AuditDeniedAccess, OperationId, RequireAuthLevel, RequireCapabilities } from '../auth/route-policy.js';
import { IntegrationOperationsService } from './integration-operations.service.js';
@Controller('v1')
export class IntegrationOperationsController {
 constructor(@Inject(IntegrationOperationsService) private readonly service:IntegrationOperationsService){}
 @Get('integrations/connections/:id/sync-scope') @OperationId('integrations.scope.current.read') @RequireCapabilities('integrations.connection.read') @AuditDeniedAccess()
 async scope(@Principal() p:RequestPrincipal,@Param('id') id:string){return {data:await this.service.scope(p,id)};}
 @Post('integrations/connections/:id/sync-scope') @OperationId('integrations.scope.save') @RequireCapabilities('integrations.connection.manage') @RequireAuthLevel('step_up') @AuditDeniedAccess()
 async save(@Principal() p:RequestPrincipal,@Param('id') id:string,@Body() body:unknown){return {data:await this.service.saveScope(p,id,body)};}
 @Get('data-quality/operations') @OperationId('data-quality.operations.read') @RequireCapabilities('integrations.connection.read') @AuditDeniedAccess()
 async quality(@Principal() p:RequestPrincipal){return {data:await this.service.quality(p)};}
 @Get('data-quality/operations/lineage') @OperationId('data-quality.operations.lineage.read') @RequireCapabilities('integrations.connection.read') @AuditDeniedAccess()
 async lineage(@Principal() p:RequestPrincipal,@Query('connectionId') connectionId:string,@Query('stream') stream:string){return {data:await this.service.lineage(p,connectionId,stream)};}
 @Post('data-quality/operations/reviews') @OperationId('data-quality.operations.review.save') @RequireCapabilities('integrations.jobs.manage') @RequireAuthLevel('step_up') @AuditDeniedAccess()
 async review(@Principal() p:RequestPrincipal,@Body() body:unknown){return {data:await this.service.review(p,body)};}
}
