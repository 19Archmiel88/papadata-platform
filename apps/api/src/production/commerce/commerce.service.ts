import { BadRequestException, Inject, Injectable, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import { ProductionDatabase } from '@papadata/database';
import { commerceDay, commerceOrderSorts, commerceProductSorts, type CommerceOrderFilters, type CommerceProductFilters, type CommerceSource, type OrdersPortfolio, type ProductPortfolio } from '@papadata/contracts';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { growthRange } from '../campaigns/campaign-growth.service.js';
import { projectOrders, projectProducts, type CommerceInput } from './commerce.projection.js';
const iso=(value:unknown)=>value instanceof Date?value.toISOString():typeof value==='string'&&Number.isFinite(Date.parse(value))?new Date(value).toISOString():null;
function text(query:Record<string,unknown>,key:string,max=500):string|null {
  const value=query[key];if(value==null||value==='')return null;
  if(typeof value!=='string'||value.length>max||/[\x00-\x1f]/.test(value))throw new BadRequestException(`Invalid ${key}.`);
  return value;
}
function choice<T extends string>(value:string|null,allowed:readonly T[],fallback:T):T {
  if(value===null)return fallback;if(!allowed.includes(value as T))throw new BadRequestException('Unsupported filter or sort.');return value as T;
}
export function orderFilters(q:Record<string,unknown>):CommerceOrderFilters {
  return {search:text(q,'search',200)??'',queue:choice(text(q,'queue'),['all','paid','pending','failed','fulfilled','cancelled','unknown'] as const,'all'),
    sortBy:choice(text(q,'sortBy'),commerceOrderSorts,'orderedAt'),direction:choice(text(q,'direction'),['asc','desc'] as const,'desc')};
}
export function productFilters(q:Record<string,unknown>):CommerceProductFilters {
  return {search:text(q,'search',200)??'',category:text(q,'category',200),filter:choice(text(q,'filter'),['all','missing_cost','unmapped','no_stock','missing_stock'] as const,'all'),
    sortBy:choice(text(q,'sortBy'),commerceProductSorts,'gross'),direction:choice(text(q,'direction'),['asc','desc'] as const,'desc')};
}
@Injectable()
export class CommerceService {
  constructor(@Inject(ProductionDatabase) private readonly database: ProductionDatabase) {}
  async input(principal:Pick<RequestPrincipal,'tenantId'|'workspaceId'>, query:Record<string,unknown>):Promise<CommerceInput> {
    const range=growthRange(query),generatedAt=new Date().toISOString(),inventoryAsOf=text(query,'inventoryAsOf',10)??commerceDay(generatedAt,range.timezone)!;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(inventoryAsOf)||!Number.isFinite(Date.parse(inventoryAsOf))||new Date(inventoryAsOf).toISOString().slice(0,10)!==inventoryAsOf||inventoryAsOf>'2100-12-31'||inventoryAsOf<'2020-01-01'||inventoryAsOf>commerceDay(generatedAt,range.timezone)!)throw new BadRequestException('Invalid inventory date.');
    const sourceId=text(query,'sourceId',36),provider=text(query,'provider',50),requestedCurrency=text(query,'currency',3);
    if(sourceId&&!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(sourceId))throw new BadRequestException('Invalid source identifier.');
    if(requestedCurrency&&(!/^[A-Z]{3}$/.test(requestedCurrency)||requestedCurrency==='XXX'))throw new BadRequestException('Select a known currency.');
    const scope=[principal.tenantId,principal.workspaceId];
    return this.database.withTenantWorkspace(principal.tenantId,principal.workspaceId,async client=>{
      const connections=await client.query<{id:string;provider:string;name:string;status:string;inventory_primary:boolean}>(
        `SELECT connection_id::text AS id,provider_id AS provider,COALESCE(account_name,provider_id) AS name,status,is_primary_inventory_source AS inventory_primary
         FROM app.integration_connections WHERE tenant_id=$1 AND workspace_id=$2 AND deleted_at IS NULL
         AND provider_id IN ('woocommerce','shopify','baselinker','allegro') ORDER BY provider_id,connection_id`,scope);
      const checkpoints=await client.query<{connection_id:string;stream:string;at:Date|null}>(
        `SELECT connection_id::text,stream,updated_at AS at FROM app.sync_checkpoints WHERE tenant_id=$1 AND workspace_id=$2 AND stream IN ('orders','products','inventory','refunds')`,scope);
      const sources:CommerceSource[]=connections.rows.map(row=>({id:row.id,provider:row.provider,name:row.name,status:row.status,primary:row.inventory_primary,
        lastSuccessfulSyncAt:checkpoints.rows.filter(c=>c.connection_id===row.id&&c.stream==='orders').map(c=>iso(c.at)).filter((v):v is string=>v!==null).sort().at(0)??null}));
      const eligible=provider?sources.filter(s=>s.provider===provider):sources;
      const selected=sourceId?sources.find(s=>s.id===sourceId):eligible.length===1?eligible[0]:null;
      if(sourceId&&!selected)throw new NotFoundException('Source not found in this workspace.');
      if(provider&&selected&&selected.provider!==provider)throw new BadRequestException('Source and provider do not match.');
      if(!selected)return {records:[],sources,sourceId:null,generatedAt,inventoryAsOf,range,requestedCurrency};
      // Bound the read before transferring it out of PostgreSQL. No silent truncation.
      // Last retained canonical versions: history of mutable records is not reconstructed here.
      const size=await client.query<{rows:string;bytes:string}>(`SELECT COUNT(*)::text AS rows,COALESCE(SUM(pg_column_size(canonical_payload)),0)::text AS bytes
        FROM app.integration_canonical_records WHERE tenant_id=$1 AND workspace_id=$2 AND connection_id=$3::uuid AND stream IN ('orders','products','inventory','refunds')`,[...scope,selected.id]);
      if(Number(size.rows[0]?.rows??0)>100000||Number(size.rows[0]?.bytes??0)>64*1024*1024)throw new PayloadTooLargeException('Retained source exceeds bounded read capacity. A paginated warehouse projection is required.');
      const result=await client.query<Record<string,unknown>>(`SELECT canonical_record_id AS id,connection_id::text,provider_id,stream,external_id,
        canonical_payload,ingested_at,updated_at,business_time AS effective_time FROM app.integration_canonical_records
        WHERE tenant_id=$1 AND workspace_id=$2 AND connection_id=$3::uuid AND stream IN ('orders','products','inventory','refunds')
        ORDER BY stream,canonical_record_id LIMIT 100001`,[...scope,selected.id]);
      if(result.rows.length>100000)throw new PayloadTooLargeException('Source exceeds 100000 retained commerce records. A paginated warehouse read is required; no partial result returned.');
      return {records:result.rows,sources,sourceId:selected.id,generatedAt,inventoryAsOf,range,requestedCurrency};
    });
  }
  async orders(principal:Pick<RequestPrincipal,'tenantId'|'workspaceId'>,query:Record<string,unknown>):Promise<OrdersPortfolio>{
    const result=projectOrders(await this.input(principal,query),orderFilters(query));
    if(result.records.length>10000||result.refunds.length>10000||Buffer.byteLength(JSON.stringify(result))>12*1024*1024)throw new PayloadTooLargeException('Response exceeds safe display limit. Narrow period, search, status or currency.');
    return result;
  }
  async products(principal:Pick<RequestPrincipal,'tenantId'|'workspaceId'>,query:Record<string,unknown>):Promise<ProductPortfolio>{
    const result=projectProducts(await this.input(principal,query),productFilters(query));
    if(result.records.length>10000||Buffer.byteLength(JSON.stringify(result))>12*1024*1024)throw new PayloadTooLargeException('Response exceeds safe display limit. Narrow product filters.');
    return result;
  }
}
