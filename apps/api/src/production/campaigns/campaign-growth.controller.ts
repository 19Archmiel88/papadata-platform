import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { Principal } from '../auth/principal.decorator.js';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { AuditDeniedAccess, OperationId, RequireAuthLevel, RequireCapabilities } from '../auth/route-policy.js';
import { CampaignGrowthService } from './campaign-growth.service.js';
@Controller('v1/campaigns')
export class CampaignGrowthController {
    constructor(
    @Inject(CampaignGrowthService)
    private readonly service: CampaignGrowthService) { }
    @Get('growth')
    @OperationId('campaigns.growth.read')
    @RequireCapabilities('analytics.metrics.read')
    @AuditDeniedAccess()
    async read(
    @Principal()
    principal: RequestPrincipal, 
    @Query()
    query: Record<string, unknown>) {
        return { data: await this.service.read(principal, query) };
    }
    @Post('budget-plans')
    @OperationId('campaigns.budget.plan.save')
    @RequireCapabilities('analytics.metrics.read', 'workspace.manage')
    @RequireAuthLevel('step_up')
    @AuditDeniedAccess()
    async save(
    @Principal()
    principal: RequestPrincipal, 
    @Body()
    body: unknown) {
        return { data: await this.service.savePlan(principal, body) };
    }
}
