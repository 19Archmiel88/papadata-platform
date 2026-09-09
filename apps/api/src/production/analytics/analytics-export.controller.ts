import { filterTrafficRows } from '@papadata/contracts';
import { filterGrowthCreatives, sortGrowthRows, growthMetricIds, type GrowthCampaign, type GrowthCreative } from '@papadata/contracts/campaign-growth';
import { CampaignGrowthService } from '../campaigns/campaign-growth.service.js';
import { randomUUID } from "node:crypto";
import { BadRequestException, Controller, Get, Inject, PayloadTooLargeException, Query } from "@nestjs/common";
import { IntegrationRepository, ProductionDatabase } from "@papadata/database";
import type { CustomersFilters, TrafficDimensionRow } from "@papadata/contracts";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import { AuditDeniedAccess, OperationId, RequireAuthLevel, RequireCapabilities } from "../auth/route-policy.js";
import { AuditService } from "../audit/audit.service.js";
import { buildCustomerPortfolio } from "../contract-runtime/customers-analytics.real-source.js";
import { fetchTrafficPortfolio } from "../contract-runtime/traffic-portfolio.real-source.js";
import { resolveMetricWindow } from "../contract-runtime/command-center-metrics.contract-data.js";

type Cell = string | number | null;
const text = (query: Record<string,unknown>, key: string, maximum = 300) => {
  const value = query[key];
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.length > maximum) throw new BadRequestException(`Invalid ${key}.`);
  return value;
};
function csvCell(value: Cell): string {
  if (value === null) return '';
  let string = String(value);
  // Neutralize spreadsheet formulas, including those preceded by control/space characters.
  if (typeof value === 'string' && /^[\s\x00-\x1f]*[=+@-]/u.test(string)) string = `'${string}`;
  return `"${string.replaceAll('"','""')}"`;
}
function columns(query: Record<string,unknown>, allowed: readonly string[]) {
  const requested = text(query,'columns',1000)?.split(',') ?? [...allowed];
  if (!requested.length || requested.some(id => !allowed.includes(id))) throw new BadRequestException('Unsupported export columns.');
  return [...new Set(requested)];
}
function dates(query: Record<string,unknown>) {
  const from=text(query,'from'),to=text(query,'to'),timezone=text(query,'timezone',100);
  if (!from || !to) throw new BadRequestException('An explicit date range is required.');
  const validDate=(v:string)=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
  if(!validDate(from)||!validDate(to)||from>to||(Date.parse(to)-Date.parse(from))/86400000>=366) throw new BadRequestException('Select a valid range of at most 366 days.');
  if(timezone){try{new Intl.DateTimeFormat('en',{timeZone:timezone}).format();}catch{throw new BadRequestException('Invalid timezone.');}}
  const now=new Date(),tz=timezone??'Europe/Warsaw';
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
  const today=`${parts.year}-${parts.month}-${parts.day}`;
  if(from>today||to>today)throw new BadRequestException('The export range cannot include future days.');
  const dateRange = {from,to,timezone};
  try { resolveMetricWindow(new Date().toISOString(),dateRange,30); } catch { throw new BadRequestException('Invalid date range or timezone.'); }
  return dateRange;
}
@Controller("v1/analytics/exports")
export class AnalyticsExportController {
  private readonly source: IntegrationRepository;
  constructor(@Inject(ProductionDatabase) database: ProductionDatabase, @Inject(AuditService) private readonly audit: AuditService, @Inject(CampaignGrowthService) private readonly campaignsService: CampaignGrowthService) { this.source=new IntegrationRepository(database); }
  private async file(principal: RequestPrincipal, source: string, range: {from:string;to:string}, headers: string[], rows: Cell[][]) {
    if (rows.length > 50000) throw new PayloadTooLargeException('Export exceeds 50000 rows. Narrow the filters.');
    const content='﻿'+[headers,...rows].map(row => row.map(csvCell).join(',')).join('\r\n')+'\r\n';
    if (Buffer.byteLength(content,'utf8') > 12 * 1024 * 1024) throw new PayloadTooLargeException('Export exceeds 12 MiB. Narrow the filters.');
    await this.audit.append({tenantId:principal.tenantId,workspaceId:principal.workspaceId,actorId:principal.userId,actorType:'user',action:'analytics.export.csv',resourceType:source,resourceId:null,outcome:'success',correlationId:randomUUID(),metadata:{from:range.from,to:range.to,columns:headers,rows:rows.length}});
    return {data:{filename:`papadata-${source}-${range.from}-${range.to}.csv`,content,rowCount:rows.length,columns:headers}};
  }
  @Get('campaigns')
  @OperationId('analytics.campaigns.export.csv')
  @RequireCapabilities('analytics.metrics.read','analytics.metrics.export')
  @RequireAuthLevel('step_up')
  @AuditDeniedAccess()
  async campaigns(@Principal() principal:RequestPrincipal,@Query() query:Record<string,unknown>){
    const range=dates(query), view=text(query,'view')??'campaigns';
    if(view!=='campaigns'&&view!=='creatives')throw new BadRequestException('Unsupported campaign export.');
    const allowed=view==='creatives'?['name','campaignName','currency',...growthMetricIds]:['name','provider','currency',...growthMetricIds];
    const requested=columns(query,allowed);if(!requested.includes('currency'))requested.push('currency');
    const sort=text(query,'sortBy'),direction=text(query,'sortDirection'),search=text(query,'search'),format=text(query,'format'),sample=text(query,'sample');
    if(sort&&sort!=='name'&&!(growthMetricIds as readonly string[]).includes(sort))throw new BadRequestException('Unsupported campaign sort.');
    if(direction&&direction!=='asc'&&direction!=='desc')throw new BadRequestException('Invalid sort direction.');
    if(sample&&!['all','small','enough'].includes(sample))throw new BadRequestException('Invalid sample filter.');
    const data=await this.campaignsService.read(principal,{...query,planning:'false'});
    const filtered:readonly(GrowthCampaign|GrowthCreative)[]=view==='creatives'
      ?filterGrowthCreatives(data.creatives,{search,format,sample,sort,direction})
      :sortGrowthRows(data.campaigns.filter(row=>!search||`${row.name} ${row.campaignId}`.toLowerCase().includes(search.toLowerCase())),{sort,direction});
    return this.file(principal,view==='creatives'?'campaigns-creatives':'campaigns',range,requested,filtered.map(row=>requested.map(key=>{
      const value=(row as unknown as Record<string,unknown>)[key];return typeof value==='number'||typeof value==='string'?value:null;
    })));
  }
  @Get("customers")
  @OperationId("analytics.customers.export.csv")
  @RequireCapabilities("analytics.metrics.read", "analytics.metrics.export")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  async customers(@Principal() principal: RequestPrincipal, @Query() query: Record<string,unknown>) {
    const dateRange=dates(query), segment=text(query,'segment'),risk=text(query,'riskStatus'), sort=text(query,'sortBy'),direction=text(query,'sortDirection');
    if (segment && !['atRisk','champions','hibernating','loyal','new','potential'].includes(segment)) throw new BadRequestException('Invalid customer segment.');
    if (risk && !['at_risk','active','lapsed'].includes(risk)) throw new BadRequestException('Invalid customer risk.');
    if (sort && !['ltv','revenue','ordersCount','recencyDays','customerPseudonym'].includes(sort)) throw new BadRequestException('Invalid customer sort.');
    if (direction && direction !== 'asc' && direction !== 'desc') throw new BadRequestException('Invalid sort direction.');
    const filters: CustomersFilters = {segment:segment?[segment as NonNullable<CustomersFilters['segment']>[number]]:null,riskStatus:risk?[risk as NonNullable<CustomersFilters['riskStatus']>[number]]:null,search:text(query,'search'),sortBy:sort as CustomersFilters['sortBy'],sortDirection:direction as CustomersFilters['sortDirection']};
    const requested=columns(query,['customerPseudonym','segmentLabel','recencyDays','ordersCount','ltv','revenue','currency','rfmScore']);
    if ((requested.includes('ltv') || requested.includes('revenue')) && !requested.includes('currency')) requested.push('currency');
    let data;
    try { data=await buildCustomerPortfolio({dataSource:this.source,dateRange,filters,generatedAt:new Date().toISOString(),tenantId:principal.tenantId,workspaceId:principal.workspaceId,exportAll:true}); }
    catch(error) { if(error instanceof Error && error.message==='CUSTOMER_EXPORT_TOO_LARGE') throw new PayloadTooLargeException('Export exceeds 50000 customers. Narrow the filters.'); throw error; }
    return this.file(principal,'customers',dateRange,requested,data.records.map(row => requested.map(key => {
      if(key==='ltv' || key==='revenue') return row[key].amount;
      if(key==='currency') return row.revenue.currency;
      const value=row[key as keyof typeof row]; return typeof value==='number' || typeof value==='string' ? value : null;
    })));
  }
  @Get("traffic")
  @OperationId("analytics.traffic.export.csv")
  @RequireCapabilities("analytics.metrics.read", "analytics.metrics.export")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  async traffic(@Principal() principal: RequestPrincipal, @Query() query: Record<string,unknown>) {
    const dateRange=dates(query),view=text(query,'view') ?? 'channels';
    if(!['channels','landingPages','devices','countries','trend'].includes(view)) throw new BadRequestException('Unsupported traffic export view.');
    const requested=columns(query,['label','sessions','transactions','purchasePerSession','engagementRate','revenue']);
    const data=await fetchTrafficPortfolio({dataSource:this.source,tenantId:principal.tenantId,workspaceId:principal.workspaceId,dateRange,generatedAt:new Date().toISOString(),filters:{sourceId:text(query,'sourceId'),channel:text(query,'channel'),device:text(query,'device'),country:text(query,'country')}});
    const search=text(query,'search')?.trim().toLowerCase(),sort=text(query,'sortBy'),direction=text(query,'sortDirection');
    if (sort && !['label','sessions','transactions','purchasePerSession','engagementRate'].includes(sort)) throw new BadRequestException('Unsupported sort column.');
    if(direction && direction!=='asc' && direction!=='desc') throw new BadRequestException('Invalid sort direction.');
    const rows=filterTrafficRows(data.current[view as 'channels'|'landingPages'|'devices'|'countries'|'trend'],search??'',sort??null,direction??null);
    const currencies=[...new Set(rows.flatMap(row=>row.revenue.map(amount=>amount.currency)))].sort();
    const headers=requested.flatMap(key=>key==='revenue'?currencies.map(currency=>`revenue_${currency}`):[key]);
    return this.file(principal,`traffic-${view.toLowerCase()}`,dateRange,headers,rows.map(row=>requested.flatMap(key=>{
      if(key==='revenue')return currencies.map(currency=>row.revenue.find(value=>value.currency===currency)?.amount ?? null);
      const value=row[key as keyof TrafficDimensionRow];return [typeof value==='string'||typeof value==='number'?value:null];
    })));
  }
}
