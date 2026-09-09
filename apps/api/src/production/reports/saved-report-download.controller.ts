import { BadRequestException, Controller, Get, Inject, NotFoundException, Param, PayloadTooLargeException, Query } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ProductionDatabase } from '@papadata/database';
import { renderSavedReportCsv, renderSavedReportHtml, renderSavedReportJson, type SavedReportDownload } from '@papadata/contracts';
import { parseReportsStore } from '@papadata/contracts/saved-reports';
import { Principal } from '../auth/principal.decorator.js';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { AuditDeniedAccess, OperationId, RequireAuthLevel, RequireCapabilities } from '../auth/route-policy.js';
import { AuditService } from '../audit/audit.service.js';
@Controller('v1/saved-reports')
export class SavedReportDownloadController {
  constructor(@Inject(ProductionDatabase) private readonly database:ProductionDatabase,@Inject(AuditService) private readonly audit:AuditService){}
  @Get(':id/versions/:version/download') @OperationId('saved-reports.download') @RequireCapabilities('reports.read','reports.download') @RequireAuthLevel('step_up') @AuditDeniedAccess()
  async download(@Principal() principal:RequestPrincipal,@Param('id') id:string,@Param('version') versionValue:string,@Query('format') format:string):Promise<{data:SavedReportDownload}> {
    if(!/^[A-Za-z0-9_.:-]{1,160}$/.test(id)||!/^\d{1,8}$/.test(versionValue)||!['html','csv','json'].includes(format))throw new BadRequestException('Invalid report download.');
    const version=Number(versionValue);
    const report=await this.database.withTenantWorkspace(principal.tenantId,principal.workspaceId,async client=>{
      const result=await client.query<{document:unknown}>('SELECT document FROM app.saved_reports WHERE tenant_id=$1 AND workspace_id=$2 AND report_id=$3',[principal.tenantId,principal.workspaceId,id]);
      if(!result.rows[0])throw new NotFoundException('Report not available in this workspace.');
      return parseReportsStore(JSON.stringify({schema:1,workspace:principal.workspaceId,reports:[result.rows[0].document]}),principal.workspaceId).reports[0];
    });
    const selected=report?.versions.find(item=>item.number===version);if(!selected||!report)throw new NotFoundException('Report version is not available.');
    const content=format==='html'?renderSavedReportHtml(selected):format==='csv'?renderSavedReportCsv(selected):renderSavedReportJson(report,version);
    if(Buffer.byteLength(content)>12*1024*1024)throw new PayloadTooLargeException('Report export exceeds 12 MiB.');
    await this.audit.append({tenantId:principal.tenantId,workspaceId:principal.workspaceId,actorId:principal.userId,actorType:'user',action:'saved-reports.download',resourceType:'saved_report',resourceId:id,outcome:'success',correlationId:randomUUID(),metadata:{version,format}});
    return {data:{filename:`papadata-raport-v${version}.${format}`,content,mediaType:format==='html'?'text/html':format==='csv'?'text/csv;charset=utf-8':'application/json',reportId:id,version,format:format as SavedReportDownload['format']}};
  }
}
