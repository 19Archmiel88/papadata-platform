import { BadRequestException, Controller, Get, Inject, PayloadTooLargeException, Query } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { CommerceOrder, CommerceProduct, CommerceRefund } from '@papadata/contracts';
import { CommerceService } from './commerce.service.js';
import { Principal } from '../auth/principal.decorator.js';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { AuditDeniedAccess, OperationId, RequireAuthLevel, RequireCapabilities } from '../auth/route-policy.js';
import { AuditService } from '../audit/audit.service.js';
type Cell=string|number|null;
function cell(v:Cell):string {if(v===null)return '';let s=String(v);if(typeof v==='string'&&/^[\s\x00-\x1f]*[=+@-]/u.test(s))s=`'${s}`;return `"${s.replaceAll('"','""')}"`;}
function columns(query:Record<string,unknown>,allowed:readonly string[]):string[]{
  if(query.columns!=null&&typeof query.columns!=='string')throw new BadRequestException('Invalid columns.');
  const selected=typeof query.columns==='string'?query.columns.split(','):[...allowed];
  if(!selected.length||selected.length>30||selected.some(k=>!allowed.includes(k)))throw new BadRequestException('Invalid columns.');
  return [...new Set([...selected,'currency'])];
}
@Controller('v1/commerce')
export class CommerceController {
  constructor(@Inject(CommerceService) private readonly service:CommerceService,@Inject(AuditService) private readonly audit:AuditService){}
  @Get('orders') @OperationId('commerce.orders.read') @RequireCapabilities('analytics.metrics.read') @AuditDeniedAccess()
  async orders(@Principal() principal:RequestPrincipal,@Query() query:Record<string,unknown>){return {data:await this.service.orders(principal,query)};}
  @Get('products') @OperationId('commerce.products.read') @RequireCapabilities('analytics.metrics.read') @AuditDeniedAccess()
  async products(@Principal() principal:RequestPrincipal,@Query() query:Record<string,unknown>){return {data:await this.service.products(principal,query)};}
  private async file(principal:RequestPrincipal,kind:string,from:string,to:string,headers:string[],rows:Cell[][]){
    const content='\uFEFF'+[headers,...rows].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
    if(Buffer.byteLength(content)>12*1024*1024)throw new PayloadTooLargeException('Export exceeds 12 MiB. Narrow the scope.');
    await this.audit.append({tenantId:principal.tenantId,workspaceId:principal.workspaceId,actorId:principal.userId,actorType:'user',action:`commerce.${kind}.export`,resourceType:kind,resourceId:null,outcome:'success',correlationId:randomUUID(),metadata:{from,to,rows:rows.length,columns:headers}});
    return {data:{filename:`papadata-${kind}-${from}-${to}.csv`,content,rowCount:rows.length,columns:headers}};
  }
  @Get('orders/export') @OperationId('commerce.orders.export') @RequireCapabilities('analytics.metrics.read','analytics.metrics.export') @RequireAuthLevel('step_up') @AuditDeniedAccess()
  async exportOrders(@Principal() principal:RequestPrincipal,@Query() query:Record<string,unknown>){
    if(query.view!=null&&!['orders','refunds'].includes(String(query.view)))throw new BadRequestException('Invalid export view.');
    const data=await this.service.orders(principal,query);
    if(query.view==='refunds') {
      const headers=columns(query,['externalId','orderId','occurredAt','amount','status','currency']);
      return this.file(principal,'orders-refunds',data.meta.range.from,data.meta.range.to,headers,data.refunds.map(row=>headers.map(k=>row[k as keyof CommerceRefund] as Cell)));
    }
    const headers=columns(query,['number','orderedAt','status','payment','fulfillment','gross','net','discount','currency']);
    return this.file(principal,'orders',data.meta.range.from,data.meta.range.to,headers,data.records.map(row=>headers.map(k=>row[k as keyof CommerceOrder] as Cell)));
  }
  @Get('products/export') @OperationId('commerce.products.export') @RequireCapabilities('analytics.metrics.read','analytics.metrics.export') @RequireAuthLevel('step_up') @AuditDeniedAccess()
  async exportProducts(@Principal() principal:RequestPrincipal,@Query() query:Record<string,unknown>){
    const data=await this.service.products(principal,query),headers=columns(query,['sku','name','category','gross','net','units','margin','quantity','observedAt','currency']);
    for(const column of ['observedAt','inventoryAsOf'])if(!headers.includes(column))headers.push(column);
    return this.file(principal,'products',data.meta.range.from,data.meta.range.to,headers,data.records.map(row=>headers.map(k=>k==='inventoryAsOf'?data.inventoryAsOf:k==='quantity'?row.stock.quantity:k==='observedAt'?row.stock.observedAt:row[k as keyof CommerceProduct] as Cell)));
  }
}
