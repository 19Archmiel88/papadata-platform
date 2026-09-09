import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { IntegrationRepository, ProductionDatabase } from '@papadata/database';
import { businessComparison, projectBusinessOverview, type BusinessOverview } from '@papadata/contracts';
import { CommerceService, orderFilters } from './commerce.service.js';
import { projectOrders } from './commerce.projection.js';
import { readGrowthPortfolio } from '../campaigns/campaign-growth.source.js';
import { DecisionsService } from '../decisions/decisions.service.js';
import type { RequestPrincipal } from '../auth/request-principal.js';
@Injectable()
export class BusinessOverviewService {
  constructor(@Inject(CommerceService) private readonly commerce:CommerceService,
    @Inject(ProductionDatabase) private readonly database:ProductionDatabase,
    @Inject(DecisionsService) private readonly decisions:DecisionsService) {}
  async read(principal:RequestPrincipal, query:Record<string,unknown>):Promise<BusinessOverview> {
    if(!principal.capabilities.includes('analytics.command_center.read')||!principal.capabilities.includes('analytics.metrics.read'))throw new ForbiddenException('Missing overview capability.');
    const comparisonAllowed=principal.capabilities.includes('analytics.metrics.compare');
    if(query.compare!=null&&!['previous','year'].includes(String(query.compare)))throw new BadRequestException('Invalid comparison.');
    const mode=query.compare==='year'?'year':'previous',input=await this.commerce.input(principal,query),comparison=businessComparison(input.range,mode);
    const filters=orderFilters({}),current=projectOrders(input,filters),previous=projectOrders({...input,range:comparison,requestedCurrency:current.meta.currency},filters);
    const repo=new IntegrationRepository(this.database);
    const advertising=async(range:typeof input.range)=>readGrowthPortfolio({dataSource:repo,tenantId:principal.tenantId,workspaceId:principal.workspaceId,
      range,filters:{currency:current.meta.currency},generatedAt:input.generatedAt,plans:[],history:[],canManagePlans:false});
    // Optional panels fail explicitly; an unavailable subsource does not fabricate an empty successful result.
    const [adResult,previousAdResult]=await Promise.allSettled([advertising(input.range),comparisonAllowed?advertising(comparison):Promise.resolve(null)]);
    let decisionPanel:BusinessOverview['decisions']={status:'forbidden',total:null,records:[]};
    if(principal.capabilities.includes('workspace.read')) {
      try { const result=await this.decisions.read(principal);
        const open=result.decisions.filter(row=>!['completed','rejected'].includes(row.status));
        const priorities={high:0,medium:1,low:2};
        decisionPanel={status:'ready',total:open.length,records:open.sort((a,b)=>priorities[a.priority]-priorities[b.priority]||(a.due??'9999').localeCompare(b.due??'9999')||a.id.localeCompare(b.id)).slice(0,8)
          .map(({id,title,priority,status,owner,due})=>({id,title,priority,status,owner,due}))};
      } catch {decisionPanel={status:'unavailable',total:null,records:[]};}
    }
    return projectBusinessOverview(current,previous,adResult.status==='fulfilled'?adResult.value:null,previousAdResult.status==='fulfilled'?previousAdResult.value:null,
      comparison,mode,decisionPanel,adResult.status==='rejected'||previousAdResult.status==='rejected'?'Nie udalo sie odczytac jednego z okresow reklamowych. Ponow odczyt.':null,comparisonAllowed);
  }
}
