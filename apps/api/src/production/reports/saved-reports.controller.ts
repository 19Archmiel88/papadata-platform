import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { Principal } from '../auth/principal.decorator.js';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { AuditDeniedAccess, OperationId, RequireAuthLevel, RequireCapabilities } from '../auth/route-policy.js';
import { SavedReportsService } from './saved-reports.service.js';

@Controller('v1/saved-reports')
export class SavedReportsController {
  constructor(@Inject(SavedReportsService) private readonly service: SavedReportsService) {}

  @Get()
  @OperationId('saved-reports.read')
  @RequireCapabilities('reports.read')
  async read(@Principal() principal: RequestPrincipal) {
    return { data: await this.service.read(principal) };
  }

  @Post('preview')
  @OperationId('saved-reports.preview')
  @RequireCapabilities('reports.read', 'reports.create', 'analytics.metrics.read')
  @RequireAuthLevel('mfa')
  @AuditDeniedAccess()
  async preview(@Principal() principal: RequestPrincipal, @Body() body: unknown) {
    return { data: await this.service.preview(principal, body) };
  }

  @Post('commands')
  @OperationId('saved-reports.command')
  @RequireCapabilities('reports.read', 'reports.create')
  @RequireAuthLevel('mfa')
  @AuditDeniedAccess()
  async command(@Principal() principal: RequestPrincipal, @Body() body: unknown) {
    return { data: await this.service.command(principal, body) };
  }
}
