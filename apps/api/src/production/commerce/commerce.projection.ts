import { isRevenueQualifyingStatus } from '../../metrics/metricEngineCore.js';
import { createHash } from 'node:crypto';
import {
  commerceDay, commerceSum, commerceOrderTotals, commerceProductTotals, filterCommerceOrders, filterCommerceProducts,
  type CommerceFulfillment, type CommerceLine, type CommerceMeta, type CommerceOrder, type CommerceOrderFilters,
  type CommercePayment, type CommerceProduct, type CommerceProductFilters, type CommerceRange,
  type CommerceRefund, type CommerceSource, type CommerceStock, type OrdersPortfolio, type ProductPortfolio,
} from '@papadata/contracts';
export type CommerceInput = {
  readonly records: readonly Record<string, unknown>[]; readonly sources: readonly CommerceSource[];
  readonly sourceId: string | null; readonly generatedAt: string; readonly inventoryAsOf: string;
  readonly range: CommerceRange; readonly requestedCurrency: string | null;
};
export const object = (v: unknown): Record<string, unknown> => typeof v==='object'&&v!==null&&!Array.isArray(v)?v as Record<string,unknown>:{};
const text = (v: unknown): string | null => typeof v==='string'&&v.trim()?v.trim():typeof v==='number'&&Number.isFinite(v)?String(v):null;
const number = (v: unknown): number | null => (typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v))?Number(v):null;
const iso = (v: unknown): string | null => v instanceof Date?v.toISOString():typeof v==='string'&&Number.isFinite(Date.parse(v))?new Date(v).toISOString():null;
const currency = (v: unknown): string => typeof v==='string'&&/^[A-Z]{3}$/.test(v)&&v!=='XXX'?v:'XXX';
const array = (v: unknown): readonly unknown[] => Array.isArray(v)?v:[];
const key = (connection: string, external: string) => `${connection}:${encodeURIComponent(external)}`;
const entity = (row: Record<string,unknown>) => object(object(row.canonical_payload).entity);
const observed = (row: Record<string,unknown>) => iso(object(entity(row).commerce).observedAt)??iso(row.updated_at)??iso(row.ingested_at);
const inRange = (value: string | null, range: CommerceRange) => {const day=commerceDay(value,range.timezone);return day!==null&&day>=range.from&&day<=range.to;};
const paymentStates: readonly string[]=['paid','pending','failed','refunded','partial','unknown'];
const fulfillmentStates: readonly string[]=['fulfilled','processing','pending','cancelled','unknown'];

function order(row: Record<string,unknown>): CommerceOrder | null {
  const sourceId=text(row.connection_id),externalId=text(row.external_id),provider=text(row.provider_id);
  if(!sourceId||!externalId||!provider)return null;
  const e=entity(row),details=object(e.commerce),rich=details.schema===1;
  const current=text(e.status)?.toLowerCase()??null;
  let payment: CommercePayment = paymentStates.includes(String(details.payment))?details.payment as CommercePayment:'unknown';
  let fulfillment: CommerceFulfillment = fulfillmentStates.includes(String(details.fulfillment))?details.fulfillment as CommerceFulfillment:'unknown';
  if(!rich && ['woocommerce','shopify'].includes(provider)){
    payment=current&&['paid','completed','processing'].includes(current)?'paid':current==='refunded'?'refunded':current==='failed'?'failed':current&&['pending','on-hold','authorized'].includes(current)?'pending':'unknown';
    const reported=text(e.fulfillmentStatus)?.toLowerCase();
    fulfillment=current==='cancelled'?'cancelled':reported==='fulfilled'||provider==='woocommerce'&&current==='completed'?'fulfilled':provider==='woocommerce'&&current==='processing'?'processing':'unknown';
  }
  const gross=number(details.gross)??number(e.grossAmount),net=number(details.net),tax=number(details.tax);
  const lines=(rich&&Array.isArray(details.lines)?array(details.lines):array(e.lineItems)).map((v,index): CommerceLine=>{
    const line=object(v),id=text(line.productId)??text(line.externalProductId);
    return {id:`${key(sourceId,externalId)}:${index}`,productId:id?key(sourceId,id):null,sku:text(line.sku),name:text(line.name),quantity:number(line.quantity),
      gross:rich?number(line.gross):null,net:rich?number(line.net):null,tax:rich?number(line.tax):null,cogs:rich?number(line.cogs):null,
      basis:rich?'confirmed':'legacy_unknown'};
  });
  const reference=text(e.customerReference);
  return {id:key(sourceId,externalId),externalId,number:text(e.orderNumber)??externalId,sourceId,provider,currency:currency(e.currency),
    orderedAt:iso(details.orderedAt)??iso(object(row.canonical_payload).occurredAt)??iso(row.effective_time),dateBasis:iso(details.orderedAt)?'source':'legacy_effective_time',
    observedAt:observed(row),status:text(e.status),payment,fulfillment,paymentMethod:text(details.paymentMethod),paidAt:iso(details.paidAt),completedAt:iso(details.completedAt),shippingMethod:text(details.shippingMethod),
    gross,net,tax,discount:number(details.discount),shippingCharged:number(details.shippingCharged),
    customerPseudonym:reference?`Klient ${createHash('sha256').update(`${sourceId}:${reference}`).digest('hex').slice(0,12)}`:null,
    qualified:isRevenueQualifyingStatus(text(e.status)),lines,
    limitations:[...(!rich?['Rekord sprzed rozszerzenia importu: brak rozdzielenia kwot linii netto/brutto. Wymagana ponowna synchronizacja.']:[]),
      ...(!iso(details.orderedAt)?['Data pochodzi z dotychczasowego czasu rekordu; nie potwierdzono osobnego czasu utworzenia zamówienia.']:[]),
      ...(details.linesComplete!==true?['Źródło nie potwierdza pełnej listy pozycji zamówienia.']:[]),
      ...(net===null?['Brak potwierdzonej wartości netto.']:[])]};
}
function refund(row: Record<string,unknown>, orders: ReadonlyMap<string,CommerceOrder>): CommerceRefund | null {
  const sourceId=text(row.connection_id),externalId=text(row.external_id);if(!sourceId||!externalId)return null;
  const e=entity(row),d=object(e.commerce),orderExternal=text(d.orderId)??text(e.orderId),orderId=orderExternal?key(sourceId,orderExternal):null;
  const amount=number(d.amount)??number(e.amount);
  return {id:key(sourceId,externalId),sourceId,externalId,orderId,occurredAt:iso(d.occurredAt)??iso(object(row.canonical_payload).occurredAt)??iso(row.effective_time),
    amount:amount===null?null:Math.abs(amount),currency:currency(d.currency??e.currency??(orderId?orders.get(orderId)?.currency:null)),status:text(d.status)??text(e.status),observedAt:observed(row)};
}
function meta(input: CommerceInput, currencies: readonly string[], records: number, extra: readonly string[]): CommerceMeta {
  const source=input.sources.find(s=>s.id===input.sourceId),chosen=input.requestedCurrency??(currencies.length===1&&currencies[0]!=='XXX'?currencies[0]!:null);
  const limitations=[
    'Wyniki dotyczą zachowanych rekordów jednego połączenia. Nie deduplikujemy zamówień między sklepem, integratorem i marketplace.',
    'Brak rekordu nie jest dowodem zera. Synchronizacja nie potwierdza kompletności historii ani rozliczenia płatności.',
    ...(source&&source.status!=='active'?[`Zrodlo ma status ${source.status}; widok opisuje ostatnio zachowane dane, nie aktywne polaczenie.`]:[]),
    ...(!input.sourceId?['Wybierz jedno źródło sprzedaży. Brak automatycznego sumowania nakładających się źródeł.']:[]),
    ...(!chosen&&currencies.length>1?['Wybierz walutę. Kwoty w różnych walutach nie są sumowane.']:[]),
    ...(input.requestedCurrency&&!currencies.includes(input.requestedCurrency)?['Wybrana waluta nie występuje w zachowanym zakresie.']:[]),...extra];
  const last=source?.lastSuccessfulSyncAt??null;
  const stale=last!==null && Date.parse(input.generatedAt)-Date.parse(last)>86400000;
  return {mode:'live',generatedAt:input.generatedAt,range:input.range,sourceId:input.sourceId,sources:input.sources,currency:chosen,currencies,
    quality:!input.sourceId?'selection_required':!records?'empty':stale?'stale':'partial',limitations:[...new Set(limitations)],lastSuccessfulSyncAt:last,historyFloor:input.records.map(row=>iso(object(row.canonical_payload).occurredAt)??iso(row.effective_time)).filter((v):v is string=>v!==null).sort()[0]??null,recordsRead:input.records.length};
}
function allOrders(input: CommerceInput): CommerceOrder[] {
  // Canonical storage retains the last version. The key includes connection, never only provider.
  return input.records.filter(row=>row.stream==='orders'&&row.connection_id===input.sourceId).flatMap(row=>{const mapped=order(row);return mapped?[mapped]:[];});
}
export function projectOrders(input: CommerceInput, filters: CommerceOrderFilters): OrdersPortfolio {
  const all=allOrders(input),lookup=new Map(all.map(row=>[row.id,row]));
  const period=all.filter(row=>inRange(row.orderedAt,input.range));
  const refunds=input.records.filter(row=>row.stream==='refunds'&&row.connection_id===input.sourceId).flatMap(row=>{const mapped=refund(row,lookup);return mapped&&inRange(mapped.occurredAt,input.range)?[mapped]:[];});
  const currencies=[...new Set([...period.map(r=>r.currency),...refunds.map(r=>r.currency)])].sort();
  const m=meta(input,currencies,period.length+refunds.length,['Zwroty poniżej są przepływem według daty refundacji, nie stopą zwrotów kohorty zamówień.',
    'Status płatności pochodzi z zamówienia, nie z niezależnego rejestru operatora. Brak terminów wysyłki nie jest SLA=0.',
    `Zachowane zamowienia bez daty: ${all.filter(row=>!row.orderedAt).length}. Nie mozna przypisac ich do wybranego okresu.`]);
  const filtered=filterCommerceOrders(period.filter(row=>!m.currency||row.currency===m.currency),filters);
  const events=refunds.filter(row=>!m.currency||row.currency===m.currency);
  return {meta:m,records:filtered,refunds:events,allPeriodOrders:period.length,filters,totals:commerceOrderTotals(filtered,events,m.currency)};
}
const emptyStock: CommerceStock = {quantity:null,reserved:null,unitCost:null,currency:null,observedAt:null,sourceTimestamp:null,kind:'unavailable',warehouse:null};
export function projectProducts(input: CommerceInput, filters: CommerceProductFilters): ProductPortfolio {
  const orders=allOrders(input).filter(row=>row.qualified&&inRange(row.orderedAt,input.range));
  const currencies=[...new Set(orders.map(r=>r.currency))].sort();
  const m=meta(input,currencies,orders.length,['Wartości produktów pochodzą z pozycji kwalifikowanych zamówień, przed refundacją. Nie są pełnym wynikiem firmy.',
    'Magazyn ma osobną datę stanu. Bieżący magazyn nie jest odtwarzany z daty analizy sprzedaży.',
    'Baza kanoniczna zachowuje ostatnią wersję rekordu. Starszej obserwacji nadpisanej synchronizacją nie można odtworzyć.',
    'ABC dotyczy znanej wartości brutto w wybranym źródle/walucie. XYZ i prognoza braku nie są wyliczane z niepełnej historii.',
    `Kwalifikowane zamowienia bez dostepnych pozycji: ${orders.filter(row=>!row.lines.length).length}/${orders.length}. Ich wartosc nie jest przypisywana arbitralnie produktom.`]);
  const catalog=new Map<string,{e:Record<string,unknown>;row:Record<string,unknown>}>();
  for(const row of input.records)if(row.stream==='products'&&row.connection_id===input.sourceId){const id=text(row.external_id);if(id)catalog.set(key(input.sourceId!,id),{e:entity(row),row});}
  const groups=new Map<string,{currency:string;productId:string;sku:string|null;name:string|null;lines:CommerceLine[];days:Map<string,CommerceLine[]>}>();
  const skuMap=new Map<string,string[]>();
  for(const [id,{e}] of catalog){const sku=text(e.sku);if(sku)skuMap.set(sku,[...(skuMap.get(sku)??[]),id]);}
  for(const row of orders){if(m.currency&&row.currency!==m.currency)continue;
    for(const line of row.lines){const matches=line.sku?skuMap.get(line.sku):undefined;
      const productId=line.productId??(matches?.length===1?matches[0]!:key(row.sourceId,`unmapped:${line.id}`));
      const id=`${productId}:${row.currency}`,g=groups.get(id)??{currency:row.currency,productId,sku:line.sku,name:line.name,lines:[],days:new Map<string,CommerceLine[]>()};
      g.lines.push(line);const date=commerceDay(row.orderedAt,input.range.timezone);if(date)g.days.set(date,[...(g.days.get(date)??[]),line]);groups.set(id,g);
    }
  }
  const activeProducts=new Set([...groups.values()].map(g=>g.productId));
  for(const [productId,{e}] of catalog){if(!activeProducts.has(productId))groups.set(`${productId}:${m.currency??'XXX'}`,{currency:m.currency??'XXX',productId,sku:text(e.sku),name:text(e.name),lines:[],days:new Map()});}
  const stockRows=new Map<string,Record<string,unknown>[]>();
  for(const row of input.records)if(row.stream==='inventory'&&row.connection_id===input.sourceId){const id=text(entity(row).productId)??text(row.external_id),at=commerceDay(observed(row),input.range.timezone);
    if(id&&at&&at<=input.inventoryAsOf)stockRows.set(key(input.sourceId!,id),[...(stockRows.get(key(input.sourceId!,id))??[]),row]);}
  const stock=(productId:string):CommerceStock=>{
    const inventory=stockRows.get(productId)??[],byWarehouse=new Map<string,Record<string,unknown>>();
    for(const row of inventory){const warehouse=text(entity(row).inventoryId)??'';const old=byWarehouse.get(warehouse);if(!old||(observed(row)??'')>(observed(old)??''))byWarehouse.set(warehouse,row);}
    // Multiple warehouses are not added: overlapping stock/location semantics are not guaranteed.
    if(byWarehouse.size>1)return {...emptyStock,warehouse:'multiple'};
    const r=[...byWarehouse.values()][0],c=catalog.get(productId),fallback=c?.row;
    const candidate=r??fallback;if(!candidate)return emptyStock;
    const at=observed(candidate),date=commerceDay(at,input.range.timezone);if(!date||date>input.inventoryAsOf)return emptyStock;
    const e=entity(candidate),d=object(e.commerce);
    return {quantity:number(r?e.availableQuantity:e.inventoryQuantity),reserved:number(d.reserved),unitCost:number(d.unitCost),currency:currency(e.currency),observedAt:at,sourceTimestamp:iso(d.sourceTimestamp),kind:r?'inventory':'catalog',warehouse:text(e.inventoryId)??text(d.warehouse)};
  };
  let rows:CommerceProduct[]=[...groups].map(([id,g])=>{const c=catalog.get(g.productId),d=object(c?.e.commerce),gross=commerceSum(g.lines.map(line=>line.gross)),net=commerceSum(g.lines.map(line=>line.net)),cogs=commerceSum(g.lines.map(line=>line.cogs));
    const margin=net===null||cogs===null?null:net-cogs;
    return {id,externalId:g.productId.split(':').slice(1).join(':'),sourceId:input.sourceId??'',sku:text(c?.e.sku)??g.sku,name:text(c?.e.name)??g.name??'Produkt bez mapowania',category:text(d.category)??text(c?.e.category),status:text(c?.e.status),mapped:Boolean(c),currency:g.currency,units:commerceSum(g.lines.map(line=>line.quantity)),gross,net,cogs,margin,marginRate:margin===null||net===null||net<=0?null:margin/net*100,lines:g.lines.length,pricedLines:g.lines.filter(line=>line.gross!==null).length,abc:null,xyz:null,stock:stock(g.productId),observations:[...g.days].sort(([a],[b])=>a.localeCompare(b)).map(([date,ls])=>({date,units:commerceSum(ls.map(l=>l.quantity)),gross:commerceSum(ls.map(l=>l.gross))}))};});
  const known=rows.filter(row=>row.gross!==null&&row.gross>=0&&row.currency===m.currency),total=commerceSum(known.map(row=>row.gross));
  let cum=0;const abc=new Map<string,'A'|'B'|'C'>();
  if(total!==null&&total>0)for(const row of [...known].sort((a,b)=>b.gross!-a.gross!||a.id.localeCompare(b.id))){const before=cum/total;abc.set(row.id,before<.8?'A':before<.95?'B':'C');cum+=row.gross!;}
  rows=rows.map(row=>({...row,abc:abc.get(row.id)??null}));
  const categories=[...new Set(rows.flatMap(row=>row.category?[row.category]:[]))].sort();
  const records=filterCommerceProducts(rows,filters);
  const updatedMeta={...m,quality:!input.sourceId?'selection_required' as const:!rows.length?'empty' as const:m.quality==='stale'?'stale' as const:'partial' as const};
  return {meta:updatedMeta,records,inventoryAsOf:input.inventoryAsOf,inventoryMode:'last_retained_observation',categories,filters,
    totals:commerceProductTotals(records,m.currency)};
}
