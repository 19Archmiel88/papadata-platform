import type { ReportConfig, ReportMetric, ReportSnapshot } from './saved-reports.js';
import { cleanProductContextPath } from './product-context.js';
import type { OrdersPortfolio, ProductPortfolio } from './commerce-portfolio.js';
import type { BusinessOverview } from './business-overview.js';
function sourcePath(config:ReportConfig,template:'orders'|'products'|'overview',sourceId:string|null,currency:string|null,inventoryAsOf?:string):string {
  const path=new URL(cleanProductContextPath(config.context?.sourcePath)??(`/app/${template==='overview'?'command-center':template}`),'https://context.invalid');
  for(const [key,value] of Object.entries({from:config.from,to:config.to,timezone:config.timezone??'Europe/Warsaw',sourceId,currency,inventoryAsOf}))if(value)path.searchParams.set(key,value);
  return cleanProductContextPath(path.pathname+path.search)??'/app';
}
function cap(snapshot:ReportSnapshot):ReportSnapshot {
  if(snapshot.rows.length>2000){snapshot.rows=snapshot.rows.slice(0,2000);snapshot.limitations.push('Tabela: pierwsze 2000 rekordow. Miary obejmuja pelny wybrany zakres. Do calosci danych uzyj CSV w analizie.');}
  snapshot.limitations=[...new Set(snapshot.limitations)].slice(0,30);
  // All projections expose uncertainty: no inferred full-source completeness.
  if(!snapshot.rows.length&&snapshot.metrics.every(m=>m.value===null))snapshot.quality='empty';
  return snapshot;
}
export function projectOrdersReport(data:OrdersPortfolio,config:ReportConfig):ReportSnapshot {
  const m=data.meta,totals=data.totals,currency=m.currency??'XXX';
  const all:ReportMetric[]=[{id:'count',label:'Zamowienia w wybranej tabeli',value:data.records.length?totals.orderCount:null,unit:'szt.',definition:'Zachowane zamowienia po filtrach i wyszukiwaniu.'},
    {id:'gross',label:'Wartosc zamowien brutto',value:totals.gross,unit:currency,definition:'Wszystkie zamowienia w wybranej tabeli, takze nieoplacone i anulowane; nie przychod netto.'},
    {id:'late',label:'Po terminie wysylki',value:null,unit:'szt.',definition:'Zrodlo nie potwierdza terminu realizacji. Brak wyniku nie jest zerem.'},
    {id:'refunded',label:'Refundacje wedlug daty refundacji',value:totals.refundValue,unit:currency,definition:'Przeplyw refundacji calego zrodla w okresie, niezalezny od filtra zamowien i od dat ich utworzenia.'}];
  return cap({mode:m.mode,generatedAt:m.generatedAt,currency,timezone:m.range.timezone,scopeLabel:`${m.range.from} - ${m.range.to} / ${m.sources.find(s=>s.id===m.sourceId)?.name??'source'} / ${currency}`,quality:'partial',
    limitations:[...m.limitations,'Raport korzysta z tego samego modelu i filtrow co Zamowienia. Nie przeprowadza operacji platnosci ani refundacji.'],metrics:all.filter(metric=>config.metricIds.includes(metric.id)),series:[],seriesMetric:'',
    columns:[{id:'number',label:'Zamowienie'},{id:'date',label:'Utworzono'},{id:'payment',label:'Platnosc'},{id:'fulfillment',label:'Realizacja'},{id:'gross',label:'Brutto',unit:currency},{id:'net',label:'Netto',unit:currency}],
    rows:data.records.map((row,i)=>({id:`order-${i+1}`,values:{number:row.number,date:row.orderedAt,payment:row.payment,fulfillment:row.fulfillment,gross:row.gross,net:row.net}})),
    sources:[{id:'orders',label:'Kanoniczne zamowienia jednego polaczenia',detail:`Ostatnia synchronizacja: ${m.lastSuccessfulSyncAt??'brak'}. Stan zachowanych rekordow w chwili generowania.`,path:sourcePath(config,'orders',m.sourceId,m.currency)}]});
}
export function projectProductsReport(data:ProductPortfolio,config:ReportConfig):ReportSnapshot {
  const m=data.meta,currency=m.currency??'XXX',stock=config.template==='inventory',totals=data.totals;
  const all:ReportMetric[]=stock?[
    {id:'available',label:'Dostepna ilosc w zachowanych obserwacjach',value:totals.inventoryQuantity,unit:'szt.',definition:'Suma tylko przy kompletnych wartosciach. Brak stanu jednego produktu powoduje brak pelnej sumy.'},
    {id:'capital',label:'Wartosc zapasu wedlug kosztu',value:null,unit:currency,definition:'Brak potwierdzonego kosztu jednostkowego i waluty zapasu.'},
    {id:'atRisk',label:'Zagrozone brakiem',value:null,unit:'szt.',definition:'Brak pelnej historii popytu i czasu dostawy; nie wyliczamy pozornej prognozy.'},
    {id:'unknown',label:'Produkty bez obserwacji stanu',value:data.records.length?new Set(data.records.filter(row=>row.stock.quantity===null).map(row=>row.externalId)).size:null,unit:'szt.',definition:'Nieustalony stan ostatniej zachowanej obserwacji, nie nieustalony prognozowany popyt.'},
  ]:[{id:'revenue',label:'Sprzedaz pozycji brutto przed refundacja',value:totals.gross,unit:currency,definition:'Pozycje kwalifikowanych zamowien w wybranym zrodle/walucie.'},
    {id:'knownMargin',label:'Netto minus koszt znanej czesci',value:totals.knownMargin,unit:currency,definition:'Wynik jedynie produktow z potwierdzonym netto i kosztem. Nie jest laczna marza portfela.'},
    {id:'costCoverage',label:'Pokrycie znanej sprzedazy kosztem',value:totals.costCoverage,unit:'%',definition:'Udzial znanej kwoty brutto z potwierdzonym netto i kosztem linii.'},
    {id:'units',label:'Sztuki w pozycjach',value:totals.units,unit:'szt.',definition:'Laczna ilosc, o ile wszystkie wartosci sa dostepne.'}];
  const metrics=all.filter(metric=>config.metricIds.includes(metric.id));
  const snapshot:ReportSnapshot={mode:m.mode,generatedAt:m.generatedAt,currency,timezone:m.range.timezone,scopeLabel:`${m.range.from} - ${m.range.to} / stan magazynu <= ${data.inventoryAsOf} / ${currency}`,quality:'partial',metrics,
    limitations:[...m.limitations,`Magazyn: ostatnia zachowana obserwacja nie pozniejsza niz ${data.inventoryAsOf}; nie odtworzona historia zapasu.`],series:[],seriesMetric:'',
    columns:stock?[{id:'name',label:'Produkt'},{id:'sku',label:'SKU'},{id:'quantity',label:'Ilosc'},{id:'observedAt',label:'Obserwacja stanu'},{id:'inventoryAsOf',label:'Wybrana data stanu'}]:[{id:'name',label:'Produkt'},{id:'sku',label:'SKU'},{id:'units',label:'Ilosc'},{id:'gross',label:'Brutto',unit:currency},{id:'net',label:'Netto',unit:currency},{id:'margin',label:'Netto minus koszt',unit:currency}],
    rows:data.records.map((row,i):ReportSnapshot['rows'][number]=>({id:`product-${i+1}`,values:stock?{name:row.name,sku:row.sku,quantity:row.stock.quantity,observedAt:row.stock.observedAt,inventoryAsOf:data.inventoryAsOf}:{name:row.name,sku:row.sku,units:row.units,gross:row.gross,net:row.net,margin:row.margin}})),
    sources:[{id:'products',label:'Model produktow i ostatnich obserwacji zapasu',detail:`Zrodlo ${m.sources.find(s=>s.id===m.sourceId)?.name??''}. Czas synchronizacji ${m.lastSuccessfulSyncAt??'brak'}.`,path:sourcePath(config,'products',m.sourceId,m.currency,data.inventoryAsOf)}]};
  return cap(snapshot);
}
export function projectBusinessReport(data:BusinessOverview,config:ReportConfig):ReportSnapshot {
  const currency=data.meta.currency??'XXX';
  const lookup={revenue:'afterRefunds',margin:'margin',marketingSpend:'adSpend',orders:'orders'} as const;
  const metrics:ReportMetric[]=config.metricIds.flatMap(id=>{const code=lookup[id as keyof typeof lookup],metric=data.metrics.find(item=>item.id===code);return metric?[{id,label:id==='revenue'?'Brutto minus refundacje':id==='marketingSpend'?'Koszt reklam workspace':id==='orders'?'Zamowienia kwalifikowane':'Marza biznesowa',value:metric.value,unit:metric.unit==='count'?'szt.':currency,definition:metric.definition}]:[];});
  const first=metrics[0],code=first?lookup[first.id as keyof typeof lookup]:null;
  const series=code?data.points.map(point=>({date:point.date,value:point.values[code]})):[];
  return cap({mode:data.meta.mode,generatedAt:data.meta.generatedAt,currency,timezone:data.meta.range.timezone,scopeLabel:`${data.meta.range.from} - ${data.meta.range.to} / ${currency}`,quality:'partial',metrics,series,seriesMetric:first?.label??'',
    limitations:[...data.meta.limitations,...data.metrics.flatMap(m=>m.limitation?[m.limitation]:[])],columns:[{id:'date',label:'Dzien'},{id:'value',label:first?.label??'Wynik',unit:first?.unit}],rows:series.map(row=>({id:row.date,values:{date:row.date,value:row.value}})),
    sources:[{id:'overview',label:'Model Centrum Dowodzenia',detail:'Ta sama projekcja danych co ekran. Braki kosztow i refundacji pozostaja nieustalone.',path:sourcePath(config,'overview',data.meta.sourceId,data.meta.currency)}]});
}
