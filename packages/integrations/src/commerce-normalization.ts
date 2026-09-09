/** Additive enrichment only: legacy canonical fields are not reinterpreted in place. */
type ObjectValue = Readonly<Record<string, unknown>>;
const object=(v: unknown): ObjectValue => typeof v==='object'&&v!==null&&!Array.isArray(v)?v as ObjectValue:{};
function at(v: unknown, path: string): unknown {return path.split('.').reduce<unknown>((a,k)=>object(a)[k],v);}
function text(v: unknown): string | null {return typeof v==='string'&&v.trim()?v.trim():typeof v==='number'&&Number.isFinite(v)?String(v):null;}
function number(v: unknown): number | null {return (typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v)) ? Number(v) : null;}
function date(v: unknown, gmt=false): string | null {
  const t=text(v);if(!t)return null;
  const iso=gmt&&!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(t)?`${t}Z`:t;
  if(!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(iso)||!Number.isFinite(Date.parse(iso)))return null;
  return new Date(iso).toISOString();
}
const array=(v: unknown): readonly unknown[] => Array.isArray(v)?v:[];
const add=(a: number|null,b: number|null)=>a===null||b===null?null:a+b;
function wcLine(value: unknown) {
  const line=object(value),net=number(line.total),tax=number(line.total_tax);
  return {id:text(line.id),productId:text(line.variation_id)&&number(line.variation_id)!==0?text(line.variation_id):text(line.product_id),
    parentProductId:text(line.product_id),sku:text(line.sku),name:text(line.name),quantity:number(line.quantity),
    net,tax,gross:add(net,tax),cogs:null};
}
function shopifyLine(value: unknown) {
  const line=object(value);
  // original unit price is not a discounted line total. Do not multiply and label it paid sales.
  return {id:text(line.id),productId:text(at(line,'variant.id'))??text(at(line,'product.id')),parentProductId:text(at(line,'product.id')),
    sku:text(line.sku),name:text(line.name),quantity:number(line.quantity),net:null,tax:null,gross:number(at(line,'discountedTotalSet.shopMoney.amount')),cogs:null};
}
export function normalizeCommerceDetails(provider: string, stream: string, payload: unknown, observedAt: string): Record<string,unknown> | null {
  if(!['orders','products','inventory','refunds'].includes(stream))return null;
  const p=object(payload),nested=Object.keys(object(p.product)).length?object(p.product):p;
  if(stream==='orders') {
    if(provider==='woocommerce'){
      const gross=number(p.total),tax=number(p.total_tax),status=text(p.status)?.toLowerCase();
      return {schema:1,observedAt,orderedAt:date(p.date_created_gmt,true),paidAt:date(p.date_paid_gmt,true),completedAt:date(p.date_completed_gmt,true),
        payment:status==='refunded'?'refunded':status==='failed'?'failed':date(p.date_paid_gmt,true)||status==='processing'||status==='completed'?'paid':status==='pending'||status==='on-hold'?'pending':'unknown',
        fulfillment:status==='completed'?'fulfilled':status==='cancelled'?'cancelled':status==='processing'?'processing':status==='pending'||status==='on-hold'?'pending':'unknown',
        paymentMethod:text(p.payment_method_title)??text(p.payment_method),
        shippingMethod:array(p.shipping_lines).map(v=>text(object(v).method_title)).filter(Boolean).join(' / ')||null,
        gross,net:gross===null||tax===null?null:gross-tax,tax,discount: number(p.discount_total),discountBasis:'net',
        shippingCharged: add(number(p.shipping_total),number(p.shipping_tax)),
        lines:array(p.line_items).map(wcLine),linesComplete:Array.isArray(p.line_items)};
    }
    if(provider==='shopify'){
      const financial=text(p.displayFinancialStatus)?.toLowerCase(),fulfillment=text(p.displayFulfillmentStatus)?.toLowerCase();
      const rawLines=object(p.lineItems),lineInfo=object(rawLines.pageInfo);
      return {schema:1,observedAt,orderedAt:date(p.createdAt),paidAt:null,completedAt:null,
        payment:financial==='paid'?'paid':financial==='refunded'?'refunded':financial==='partially_refunded'||financial==='partially_paid'?'partial':financial==='pending'||financial==='authorized'?'pending':'unknown',
        fulfillment:p.cancelledAt?'cancelled':fulfillment==='fulfilled'?'fulfilled':fulfillment==='unfulfilled'?'pending':fulfillment==='partial'?'processing':'unknown',
        paymentMethod:null,shippingMethod:null,gross:number(at(p,'currentTotalPriceSet.shopMoney.amount')),net:null,tax:null,discount:null,discountBasis:'unknown',shippingCharged:null,
        lines:array(rawLines.nodes).map(shopifyLine),linesComplete:lineInfo.hasNextPage===false};
    }
    const legacyLines=array(p.products).length?array(p.products):array(p.items);
    return {schema:1,observedAt,orderedAt:null,paidAt:null,completedAt:null,payment:'unknown',fulfillment:'unknown',
      lines:legacyLines.map(value=>{const line=object(value);return {id:text(line.id),productId:text(line.product_id)??text(line.productId)??text(at(line,'product.id'))??text(at(line,'offer.id')),sku:text(line.sku),name:text(line.name),quantity:number(line.quantity)??number(line.qty),gross:null,net:null,tax:null,cogs:null};}),linesComplete:false};
  }
  if(stream==='products'||stream==='inventory'){
    const categories=array(nested.categories).map(v=>text(object(v).name)).filter(Boolean);
    return {schema:1,observedAt,category:categories.join(' / ')||text(nested.productType),
      sku:text(nested.sku),parentProductId:text(nested.parent_id),
      unitCost:null,reserved:null,leadTimeDays:null,warehouse:text(p.inventory_id)??text(p.location_id),
      sourceTimestamp:provider==='woocommerce'?date(nested.date_modified_gmt,true):date(nested.updatedAt)};
  }
  return {schema:1,observedAt,occurredAt:provider==='woocommerce'?date(p.date_created_gmt,true):date(p.createdAt),
    orderId:text(p.order_id)??text(p.orderId),currency:text(p.currency)??text(at(p,'totalRefundedSet.shopMoney.currencyCode')),
    amount:number(p.amount)??number(at(p,'totalRefundedSet.shopMoney.amount')),status:text(p.status)};
}
