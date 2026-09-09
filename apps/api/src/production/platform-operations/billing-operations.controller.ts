import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { Principal } from '../auth/principal.decorator.js';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { AuditDeniedAccess, OperationId, RequireAuthLevel, RequireCapabilities } from '../auth/route-policy.js';
import { BillingOperationsService } from './billing-operations.service.js';
@Controller('v1/billing/operations')
export class BillingOperationsController {
 constructor(@Inject(BillingOperationsService) private readonly service:BillingOperationsService){}
 @Get() @OperationId('billing.operations.read') @RequireCapabilities('billing.read') @AuditDeniedAccess()
 async read(@Principal() p:RequestPrincipal,@Query('after') cursor?:string){return {data:await this.service.read(p,cursor)};}
 @Post('sessions') @OperationId('billing.operations.session.create') @RequireCapabilities('billing.manage') @RequireAuthLevel('step_up') @AuditDeniedAccess()
 async session(@Principal() p:RequestPrincipal,@Body() body:unknown){return {data:await this.service.session(p,body)};}
}
