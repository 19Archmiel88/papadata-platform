import { businessDateShift, type BusinessMetricId, type BusinessOverview } from './business-overview.js';
import { commerceDay, commerceSum, type CommerceRange, type OrdersPortfolio } from './commerce-portfolio.js';
import type { GrowthPortfolio } from './campaign-growth.js';
const number=(v: number | null | undefined) => typeof v==='number'&&Number.isFinite(v)?v:null;
type Values=Record<BusinessMetricId,number|null>;
function amounts(orders: OrdersPortfolio, ads: GrowthPortfolio | null, date?: string): Values {
  const rows=orders.records.filter(row=>row.qualified&&(!date||commerceDay(row.orderedAt,orders.meta.range.timezone)===date));
  const refunds=orders.refunds.filter(row=>!date||commerceDay(row.occurredAt,orders.meta.range.timezone)===date);
  const observations=ads?.observations.filter(row=>(!date||row.date===date)&&row.currency===orders.meta.currency)??[];
  const gross=orders.meta.currency?commerceSum(rows.map(row=>row.gross)):null;
  const returned=orders.meta.currency?commerceSum(refunds.map(row=>row.amount)):null;
  // Refund absence is not an observed zero. Payment/shipping costs and net tax base remain unknown.
  return {gross,orders:rows.length?rows.length:null,refunds:returned,afterRefunds:gross===null||returned===null?null:gross-returned,
    adSpend:orders.meta.currency?commerceSum(observations.map(row=>row.spend)):null,margin:null};
}
export function projectBusinessOverview(current: OrdersPortfolio, previous: OrdersPortfolio, ads: GrowthPortfolio|null, previousAds: GrowthPortfolio|null,
  comparison: CommerceRange, mode:'previous'|'year', decisions:BusinessOverview['decisions'], advertisingProblem:string|null, comparisonAllowed=true): BusinessOverview {
  const compatible=comparisonAllowed&&current.meta.currency!==null&&current.meta.currency===previous.meta.currency&&current.meta.sourceId===previous.meta.sourceId;
  const now=amounts(current,ads),before=amounts(previous,previousAds);
  const definitions: Record<BusinessMetricId,string>={
    gross:'Suma brutto kwalifikowanych zamowien wedlug daty zrodla. Nie oznacza przychodu netto ani potwierdzonych wplat.',
    orders:'Liczba zachowanych zamowien kwalifikowanych przez isRevenueQualifyingStatus. Brak obserwacji nie jest dowodem zera.',
    refunds:'Kwota refundacji wedlug daty refundacji, takze dla zamowien z poprzednich okresow. Nie jest stopa zwrotow kohorty.',
    afterRefunds:'Brutto kwalifikowanych zamowien minus zaobserwowane refundacje w okresie; rozne populacje zdarzen, nie kwota netto.',
    adSpend:'Koszt raportowany przez konta Google/Meta workspace w wybranej walucie. Nie jest przypisany do wybranego sklepu.',
    margin:'Wymaga potwierdzonych kwot netto, kosztu towaru oraz kosztow realizacji. Bez nich nie wyliczamy marzy biznesowej.',
  };
  const adStamps=ads?.sources.filter(s=>s.provider==='google_ads'||s.provider==='meta_ads').map(s=>s.synchronizedAt)??[];
  const adSync=adStamps.length&&adStamps.every(Boolean)?adStamps.filter((v):v is string=>v!==null).sort()[0]??null:null;
  const metrics=(Object.keys(definitions) as BusinessMetricId[]).map(id=>({id,value:number(now[id]),previous:compatible?number(before[id]):null,
    unit:id==='orders'?'count' as const:'money' as const,definition:definitions[id],
    limitation:!comparisonAllowed?'Brak uprawnienia do porownania okresow. Wynik poprzedni pozostaje niedostepny.':id==='margin'?definitions.margin:now[id]===null?'Nie ma kompletu potwierdzonych obserwacji dla tej miary.':!compatible?'Brak porownywalnej waluty/zrodla poprzedniego okresu.':null,
    observedRecords:id==='adSpend'?ads?.observations.length??0:id==='refunds'?current.refunds.length:current.records.length,
    synchronizedAt:id==='adSpend'?adSync:current.meta.lastSuccessfulSyncAt}));
  const count=Math.round((Date.parse(current.meta.range.to)-Date.parse(current.meta.range.from))/86400000)+1;
  const points=Array.from({length:Math.max(0,Math.min(366,count))},(_,i)=>{const date=businessDateShift(current.meta.range.from,i),previousDate=businessDateShift(comparison.from,i);
    const empty:Values={gross:null,orders:null,refunds:null,afterRefunds:null,adSpend:null,margin:null};
    return {date,previousDate,values:amounts(current,ads,date),previous:compatible?amounts(previous,previousAds,previousDate):empty};});
  return {version:'business.overview.v1',meta:{...current.meta,limitations:[...current.meta.limitations,
    'Porownanie korzysta z aktualnie zachowanych wersji danych obu okresow, nie historycznych migawek raportu.',
    'Konta reklamowe workspace nie sa automatycznie przypisane do wybranego zrodla zamowien. Nie wyliczamy z tego pozornej marzy ani ROAS sklepu.']},
    comparisonAllowed,comparison,comparisonMode:mode,metrics,points,decisions,advertising:{status:ads?'ready':'unavailable',limitation:advertisingProblem,
      sources:ads?.sources.filter(s=>s.provider==='google_ads'||s.provider==='meta_ads').map(s=>({id:s.id,label:s.label,synchronizedAt:s.synchronizedAt}))??[]}};
}
