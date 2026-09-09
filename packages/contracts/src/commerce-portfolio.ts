/** Read-only commerce analytics. Null is unavailable, never an inferred zero. */
export type CommerceRange = { readonly from: string; readonly to: string; readonly timezone: string };
export type CommercePayment = 'paid' | 'pending' | 'failed' | 'refunded' | 'partial' | 'unknown';
export type CommerceFulfillment = 'fulfilled' | 'processing' | 'pending' | 'cancelled' | 'unknown';
export type CommerceQuality = 'ready' | 'partial' | 'stale' | 'empty' | 'selection_required';
export type CommerceSource = {
  readonly id: string; readonly provider: string; readonly name: string; readonly status: string;
  readonly lastSuccessfulSyncAt: string | null; readonly primary: boolean;
};
export type CommerceMeta = {
  readonly mode: 'live' | 'demo'; readonly generatedAt: string; readonly range: CommerceRange;
  readonly sourceId: string | null; readonly sources: readonly CommerceSource[];
  readonly currency: string | null; readonly currencies: readonly string[];
  readonly quality: CommerceQuality; readonly limitations: readonly string[];
  readonly lastSuccessfulSyncAt: string | null;
  readonly historyFloor: string | null; readonly recordsRead: number;
};
export type CommerceLine = {
  readonly id: string; readonly productId: string | null; readonly sku: string | null;
  readonly name: string | null; readonly quantity: number | null;
  readonly gross: number | null; readonly net: number | null; readonly tax: number | null;
  readonly cogs: number | null; readonly basis: 'confirmed' | 'legacy_unknown';
};
export type CommerceOrder = {
  readonly id: string; readonly externalId: string; readonly number: string;
  readonly sourceId: string; readonly provider: string; readonly currency: string;
  readonly orderedAt: string | null; readonly dateBasis: 'source' | 'legacy_effective_time';
  readonly observedAt: string | null; readonly status: string | null;
  readonly payment: CommercePayment; readonly paymentMethod: string | null;
  readonly paidAt: string | null; readonly fulfillment: CommerceFulfillment;
  readonly completedAt: string | null; readonly shippingMethod: string | null;
  readonly gross: number | null; readonly net: number | null; readonly tax: number | null;
  readonly discount: number | null; readonly shippingCharged: number | null;
  readonly customerPseudonym: string | null; readonly qualified: boolean;
  readonly lines: readonly CommerceLine[]; readonly limitations: readonly string[];
};
export type CommerceRefund = {
  readonly id: string; readonly sourceId: string; readonly externalId: string;
  readonly orderId: string | null; readonly occurredAt: string | null; readonly amount: number | null;
  readonly currency: string; readonly status: string | null; readonly observedAt: string | null;
};
export type CommerceTotals = {
  readonly orderCount: number; readonly qualifiedCount: number;
  readonly gross: number | null; readonly qualifiedGross: number | null; readonly net: number | null;
  readonly discounts: number | null; readonly refundValue: number | null;
  readonly grossKnown: number; readonly netKnown: number; readonly discountKnown: number;
  readonly refundKnown: number; readonly currency: string | null;
};
export type OrdersPortfolio = {
  readonly meta: CommerceMeta; readonly records: readonly CommerceOrder[];
  /** Refund flow by refund date, independent of the order cohort and queue filter. */
  readonly refunds: readonly CommerceRefund[]; readonly totals: CommerceTotals;
  readonly allPeriodOrders: number; readonly filters: CommerceOrderFilters;
};
export type CommerceStock = {
  readonly quantity: number | null; readonly reserved: number | null; readonly unitCost: number | null;
  readonly currency: string | null; readonly observedAt: string | null; readonly sourceTimestamp: string | null;
  readonly kind: 'inventory' | 'catalog' | 'unavailable';
  readonly warehouse: string | null;
};
export type CommerceProduct = {
  readonly id: string; readonly externalId: string; readonly sourceId: string;
  readonly sku: string | null; readonly name: string; readonly category: string | null;
  readonly status: string | null; readonly mapped: boolean;
  readonly currency: string; readonly units: number | null; readonly gross: number | null;
  readonly net: number | null; readonly cogs: number | null; readonly margin: number | null;
  readonly marginRate: number | null; readonly lines: number; readonly pricedLines: number;
  readonly abc: 'A' | 'B' | 'C' | null; readonly xyz: 'X' | 'Y' | 'Z' | null;
  readonly stock: CommerceStock; readonly observations: readonly {readonly date: string; readonly units: number | null; readonly gross: number | null}[];
};
export type ProductPortfolio = {
  readonly meta: CommerceMeta; readonly records: readonly CommerceProduct[];
  readonly inventoryAsOf: string; readonly inventoryMode: 'last_retained_observation';
  readonly categories: readonly string[]; readonly filters: CommerceProductFilters;
  readonly totals: { readonly products: number; readonly units: number | null; readonly gross: number | null;
    readonly net: number | null; readonly knownMargin: number | null; readonly costCoverage: number | null;
    readonly inventoryKnown: number; readonly inventoryQuantity: number | null };
};
export type CommerceOrderFilters = {
  readonly search: string; readonly queue: 'all' | 'paid' | 'pending' | 'failed' | 'fulfilled' | 'cancelled' | 'unknown';
  readonly sortBy: 'number' | 'orderedAt' | 'gross' | 'payment'; readonly direction: 'asc' | 'desc';
};
export type CommerceProductFilters = {
  readonly search: string; readonly category: string | null;
  readonly filter: 'all' | 'missing_cost' | 'unmapped' | 'no_stock' | 'missing_stock';
  readonly sortBy: 'name' | 'sku' | 'gross' | 'units' | 'margin' | 'quantity'; readonly direction: 'asc' | 'desc';
};
export const commerceOrderSorts = ['number','orderedAt','gross','payment'] as const;
export const commerceProductSorts = ['name','sku','gross','units','margin','quantity'] as const;
export function commerceSum(values: readonly (number | null)[]): number | null {
  if (!values.length || values.some(value => value === null || !Number.isFinite(value))) return null;
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}
export function commerceDay(value: string | null, timezone: string): string | null {
  if (!value || !Number.isFinite(Date.parse(value))) return null;
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'})
    .formatToParts(new Date(value));
  const part = (kind: string) => parts.find(p => p.type === kind)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}
/** Locale-independent stable ordering shared with CSV/report projection; nulls stay last. */
export function commerceSort<Row extends {readonly id: string}>(rows: readonly Row[], value: (row: Row) => string | number | null, direction: 'asc' | 'desc'): Row[] {
  return [...rows].sort((a,b) => {
    const x=value(a),y=value(b);
    if (x===null || y===null) return x===y ? a.id.localeCompare(b.id) : x===null ? 1 : -1;
    const delta=typeof x==='number'&&typeof y==='number' ? x-y : String(x).localeCompare(String(y),'pl',{numeric:true});
    return delta===0 ? a.id.localeCompare(b.id) : direction==='desc' ? -delta : delta;
  });
}
export function filterCommerceOrders(rows: readonly CommerceOrder[], filters: CommerceOrderFilters): CommerceOrder[] {
  const search=filters.search.trim().toLocaleLowerCase('pl');
  const matches=rows.filter(row => (!search || [row.number,row.externalId,row.id].some(x=>x.toLocaleLowerCase('pl').includes(search))) &&
    (filters.queue==='all'||(filters.queue==='fulfilled'||filters.queue==='cancelled' ? row.fulfillment===filters.queue : row.payment===filters.queue)));
  return commerceSort(matches,row=>row[filters.sortBy],filters.direction);
}
export function filterCommerceProducts(rows: readonly CommerceProduct[], filters: CommerceProductFilters): CommerceProduct[] {
  const search=filters.search.trim().toLocaleLowerCase('pl');
  const matches=rows.filter(row => (!search || [row.name,row.sku??'',row.externalId].some(x=>x.toLocaleLowerCase('pl').includes(search))) &&
    (!filters.category || row.category===filters.category) && (filters.filter==='all' ||
      (filters.filter==='missing_cost' ? row.lines>0&&row.cogs===null : filters.filter==='unmapped' ? !row.mapped :
       filters.filter==='no_stock' ? row.stock.quantity===0 : row.stock.quantity===null)));
  return commerceSort(matches,row=>filters.sortBy==='quantity'?row.stock.quantity:row[filters.sortBy],filters.direction);
}

/** The same table selection is summarized by UI, API and CSV/report generation. */
export function commerceOrderTotals(records:readonly CommerceOrder[],refunds:readonly CommerceRefund[],currency:string|null):CommerceTotals {
  const qualified=records.filter(row=>row.qualified);
  return {orderCount:records.length,qualifiedCount:qualified.length,
    gross:currency?commerceSum(records.map(row=>row.gross)):null,
    qualifiedGross:currency?commerceSum(qualified.map(row=>row.gross)):null,
    net:currency?commerceSum(records.map(row=>row.net)):null,
    discounts:currency?commerceSum(records.map(row=>row.discount)):null,
    refundValue:currency?commerceSum(refunds.map(row=>row.amount)):null,currency,
    grossKnown:records.filter(row=>row.gross!==null).length,netKnown:records.filter(row=>row.net!==null).length,
    discountKnown:records.filter(row=>row.discount!==null).length,refundKnown:refunds.filter(row=>row.amount!==null).length};
}
export function commerceProductTotals(records:readonly CommerceProduct[],currency:string|null):ProductPortfolio['totals'] {
  const known=records.filter(row=>row.gross!==null),covered=known.filter(row=>row.cogs!==null&&row.net!==null);
  const gross=commerceSum(known.map(row=>row.gross));
  return {products:records.length,units:commerceSum(records.map(row=>row.units)),gross:currency?commerceSum(records.map(row=>row.gross)):null,
    net:currency?commerceSum(records.map(row=>row.net)):null,knownMargin:currency?commerceSum(records.filter(row=>row.margin!==null).map(row=>row.margin)):null,
    costCoverage:currency&&gross!==null&&gross>0?covered.reduce((sum,row)=>sum+(row.gross??0),0)/gross*100:null,
    inventoryKnown:new Set(records.filter(row=>row.stock.quantity!==null).map(row=>row.externalId)).size,
    inventoryQuantity:commerceSum([...new Map(records.map(row=>[row.externalId,row.stock.quantity])).values()])};
}
