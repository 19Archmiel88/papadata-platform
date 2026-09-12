import { businessComparison, businessDateShift, projectBusinessOverview, commerceOrderTotals, commerceProductTotals, type BusinessOverview, type CommerceMeta, type CommerceOrder, type CommerceProduct, type CommerceRange, type OrdersPortfolio, type ProductPortfolio } from '@papadata/contracts';
const sourceId='f05e21b8-90bd-41d4-bace-865be7d9a601';
export function commerceFixtureMeta(range:CommerceRange):CommerceMeta {
  return {mode:'demo',generatedAt:range.to+'T12:00:00Z',range,sourceId,currency:'PLN',currencies:['PLN'],quality:'partial',
    sources:[{id:sourceId,provider:'woocommerce',name:'Sklep demonstracyjny',status:'active',lastSuccessfulSyncAt:range.to+'T10:00:00Z',primary:true}],
    limitations:['Jawny scenariusz demonstracyjny. Nie potwierdza konfiguracji ani kompletności rzeczywistych danych.','Część danych kosztowych i magazynowych celowo niedostępna.'],lastSuccessfulSyncAt:range.to+'T10:00:00Z',historyFloor:range.from,recordsRead:24};
}
export function ordersFixture(range:CommerceRange):OrdersPortfolio {
  const records:CommerceOrder[]=Array.from({length:12},(_,i)=>{const gross=120+i*34,date=businessDateShift(range.to,-Math.min(i,Math.max(0,Math.floor((Date.parse(range.to)-Date.parse(range.from))/86400000))));
    return {id:`${sourceId}:demo-${i+1}`,externalId:`demo-${i+1}`,number:`DEMO-${String(1200+i)}`,sourceId,provider:'woocommerce',currency:'PLN',orderedAt:date+'T10:00:00Z',dateBasis:'source',observedAt:range.to+'T10:00:00Z',status:i===10?'pending':i===11?'failed':i===4?null:'completed',payment:i===10?'pending':i===11?'failed':i===4?'unknown':'paid',fulfillment:i===10?'pending':i===11?'unknown':'fulfilled',paymentMethod:i%2?'karta':'przelew',paidAt:i>1?null:date+'T10:02:00Z',completedAt:i>1?null:date+'T12:00:00Z',shippingMethod:'Kurier',gross,net:i===4?null:gross/1.23,tax:i===4?null:gross-gross/1.23,discount:0,shippingCharged:12,customerPseudonym:`Klient demo ${i+1}`,qualified:i!==10&&i!==11,
      lines:[{id:`demo-line-${i}`,productId:`${sourceId}:P-${i%4}`,sku:`DEMO-${i%4}`,name:`Produkt demo ${i%4+1}`,quantity:1,gross,net:i===4?null:gross/1.23,tax:i===4?null:gross-gross/1.23,cogs:null,basis:'confirmed'}],limitations:i===4?['Brak netto oraz statusu źródłowego.']:[]};});
  const meta=commerceFixtureMeta(range),refunds=[{id:`${sourceId}:refund-1`,externalId:'refund-1',sourceId,orderId:records[0]?.id??null,occurredAt:range.to+'T11:00:00Z',amount:24,currency:'PLN',status:'reported',observedAt:range.to+'T12:00:00Z'}];
  return {meta,records,refunds,totals:commerceOrderTotals(records,refunds,'PLN'),allPeriodOrders:records.length,filters:{search:'',queue:'all',sortBy:'orderedAt',direction:'desc'}};
}
export function productsFixture(range:CommerceRange,asOf:string=range.to):ProductPortfolio {
  const meta=commerceFixtureMeta(range);
  const records:CommerceProduct[]=Array.from({length:8},(_,i)=>{const gross=i===5?null:1200-i*110,net=gross===null?null:gross/1.23,cogs=i<3?600-i*55:null,margin=net===null||cogs===null?null:net-cogs;
    return {id:`${sourceId}:P-${i}:PLN`,externalId:`P-${i}`,sourceId,sku:`DEMO-${i}`,name:`Produkt demonstracyjny ${i+1}`,category:i%2?'Akcesoria':'Wyposażenie',status:'publish',mapped:i!==7,currency:'PLN',units:i===5?null:10-i,gross,net,cogs,margin,marginRate:margin===null||net===null?null:margin/net*100,lines:10-i,pricedLines:i===5?0:10-i,abc:i===5?null:i<3?'A':i<6?'B':'C',xyz:null,
      stock:{quantity:i===6?null:i===7?0:18+i,reserved:null,unitCost:null,currency:'PLN',observedAt:asOf+'T10:00:00Z',sourceTimestamp:null,kind:i===6?'unavailable':'catalog',warehouse:null},
      observations:range.from===range.to?[{date:range.to,units:i===5?null:5,gross:i===5?null:500}]:[{date:range.from,units:2,gross:200},{date:range.to,units:i===5?null:3,gross:i===5?null:300}]};});
  return {meta,records,inventoryAsOf:asOf,inventoryMode:'last_retained_observation',categories:['Akcesoria','Wyposażenie'],filters:{search:'',category:null,filter:'all',sortBy:'gross',direction:'desc'},totals:commerceProductTotals(records,'PLN')};
}
export function overviewFixture(range:CommerceRange,mode:'previous'|'year'='previous'):BusinessOverview {
  const order=ordersFixture(range),comparison=businessComparison(range,mode),previous=ordersFixture(comparison);
  return projectBusinessOverview(order,previous,null,null,comparison,mode,{status:'ready',total:0,records:[]},'Demonstracja: brak podlaczonego zrodla reklam.');
}
