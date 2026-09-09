import { Controller, Get, Inject, Query } from '@nestjs/common';
import { BusinessOverviewService } from './business-overview.service.js';
import { Principal } from '../auth/principal.decorator.js';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { AuditDeniedAccess, OperationId, RequireCapabilities } from '../auth/route-policy.js';
@Controller('v1/overview')
export class BusinessOverviewController {
  constructor(@Inject(BusinessOverviewService) private readonly service:BusinessOverviewService){}
  @Get('business') @OperationId('overview.business.read') @RequireCapabilities('analytics.command_center.read','analytics.metrics.read') @AuditDeniedAccess()
  async read(@Principal() principal:RequestPrincipal,@Query() query:Record<string,unknown>) {return {data:await this.service.read(principal,query)};}
}
