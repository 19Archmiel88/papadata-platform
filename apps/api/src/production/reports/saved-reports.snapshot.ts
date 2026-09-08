import type { IsoDateTime } from '@papadata/contracts';
import { reportTemplate, type ReportConfig, type ReportMetric, type ReportSnapshot } from '@papadata/contracts/saved-reports';
import { computeMetricEngineSeries, isRevenueQualifyingOrder, type DashboardMetricCode, type MetricEngineInput } from '../../metrics/metricEngineCore.ts';
import { createRealMetricEngineInput, type CommandCenterDataSource } from '../contract-runtime/command-center-metrics.real-source.ts';
import { resolveMetricWindow } from '../contract-runtime/command-center-metrics.contract-data.ts';

const metricCodes: readonly DashboardMetricCode[] = ['revenue_after_refunds','product_revenue','product_margin','ad_spend','orders','gross_order_value','return_value','roas','platform_attributed_revenue','available_stock','stock_value','units_sold'];
const number = (v: string | null | undefined) => v != null && Number.isFinite(Number(v)) ? Number(v) : null;
const day = (v: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(v));

export async function buildLiveReportSnapshot(
  scope: { tenantId: string; workspaceId: string }, config: ReportConfig,
  dataSource: CommandCenterDataSource,
): Promise<ReportSnapshot> {
  const generatedAt = new Date().toISOString();
  // Resolve Warsaw calendar boundaries without the dashboard's fallback for future ranges.
  const anchor = new Date(Date.parse(config.to) + 3 * 86400000).toISOString();
  const window = resolveMetricWindow(anchor, config, 30);
  const input = await createRealMetricEngineInput({ ...scope, ...window, generatedAt: generatedAt as IsoDateTime, dataSource });
  return projectLiveReport(input, config);
}

export function projectLiveReport(original: MetricEngineInput, config: ReportConfig): ReportSnapshot {
  let input = original;
  if (config.template === 'campaigns' && config.filter !== 'all') input = {
    ...input,
    canonicalAdSpend: input.canonicalAdSpend.filter(r => r.providerId === config.filter),
    canonicalAttributedConversions: input.canonicalAttributedConversions.filter(r => r.providerId === config.filter),
  };
  if (config.template === 'orders' && config.filter !== 'all') {
    const provider = config.filter === 'WooCommerce' ? 'woocommerce' : 'baselinker';
    const orders = input.canonicalOrders.filter(r => r.providerId === provider);
    const ids = new Set(orders.map(r => r.canonicalOrderId));
    input = { ...input, canonicalOrders: orders, canonicalOrderLines: input.canonicalOrderLines.filter(r => ids.has(r.canonicalOrderId)), canonicalRefunds: input.canonicalRefunds.filter(r => r.providerId === provider) };
  }
  if ((config.template === 'products' || config.template === 'inventory') && config.filter !== 'all')
    throw new Error('Źródło produkcyjne nie udostępnia kategorii produktów. Wybierz wszystkie kategorie.');
  const series = computeMetricEngineSeries(input, metricCodes);
  const snapshot: ReportSnapshot = {
    generatedAt: input.generatedAt, mode: 'live', currency: 'PLN', timezone: 'Europe/Warsaw',
    scopeLabel: `${config.from} – ${config.to} · ${reportTemplate(config.template).filters.find(f => f.id === config.filter)?.label ?? config.filter}`,
    quality: 'complete', limitations: [], metrics: [], series: [], seriesMetric: '', columns: [], rows: [], sources: [],
  };
  const codeByMetric = new Map<string, DashboardMetricCode>();
  const add = (id: string, label: string, code: DashboardMetricCode | null, unit: ReportMetric['unit'], definition: string, computed?: number | null) => {
    const value = computed !== undefined ? computed : code ? number(series.aggregate[code]) : null;
    snapshot.metrics.push({ id, label, value, unit, definition });
    if (code) codeByMetric.set(id, code);
    if (config.metricIds.includes(id) && (value === null || (code && series.readiness[code] !== 'ready'))) {
      snapshot.quality = 'partial';
      snapshot.limitations.push(`${label}: ${code ? (series.reasonCodes[code]?.join(', ') || 'niepełne dane źródłowe') : definition}`);
    }
  };
  const inPeriod = (date: string) => date >= input.periodStart && date < input.periodEnd;
  const orders = input.canonicalOrders.filter(r => inPeriod(r.orderedAt) && r.currency === input.currency);
  const qualifying = orders.filter(isRevenueQualifyingOrder);
  const orderIds = new Set(qualifying.map(r => r.canonicalOrderId));
  const lines = input.canonicalOrderLines.filter(r => orderIds.has(r.canonicalOrderId));
  const hasOrders = orders.length > 0;
  if (config.template === 'overview') {
    add('revenue','Przychód po zwrotach (brutto)','revenue_after_refunds','PLN','Przychód kwalifikowanych zamówień pomniejszony o zwroty według silnika metryk. Kwoty brutto.');
    add('margin','Marża po marketingu',null,'PLN','Brak pełnych kosztów realizacji i podatku w źródle. Marża biznesowa pozostaje niedostępna.');
    add('marketingSpend','Koszt reklam','ad_spend','PLN','Wydatki reklamowe przypisane do wybranego okresu.');
    add('orders','Zamówienia kwalifikowane','orders','szt.','Liczba zamówień kwalifikowanych do przychodu.');
  } else if (config.template === 'campaigns') {
    add('spend','Koszt reklam','ad_spend','PLN','Wydatki wybranych kanałów reklamowych.');
    add('revenue','Przychód przypisany przez platformy','platform_attributed_revenue','PLN','Atrybucja platform reklamowych; nie jest deduplikowanym przychodem sklepu.');
    add('roas','ROAS','roas','×','Przychód przypisany przez platformy / koszt reklam.');
    add('ncac','Koszt nowego klienta',null,'PLN','Brak powiązania konwersji reklamowej z pierwszym zakupem klienta.');
    snapshot.limitations.push('Atrybucja pochodzi z platform reklamowych. Konwersje pomiędzy platformami mogą się pokrywać.');
    snapshot.columns = [{id:'campaign',label:'Id kampanii'},{id:'channel',label:'Kanał'},{id:'date',label:'Dzień'},{id:'spend',label:'Koszt',unit:'PLN'}];
    snapshot.rows = input.canonicalAdSpend.filter(r => r.date >= config.from && r.date <= config.to && r.currency === input.currency).map(r => ({id:r.canonicalAdSpendId,values:{campaign:r.campaignId,channel:r.providerId,date:r.date,spend:number(r.costAmount)}}));
  } else if (config.template === 'orders') {
    add('count','Zamówienia w okresie',null,'szt.','Wszystkie zamówienia w wybranym okresie i źródle.',hasOrders ? orders.length : null);
    add('gross','Wartość zamówień brutto',null,'PLN','Wszystkie zamówienia, również nieopłacone i anulowane.',hasOrders ? orders.reduce((s,r)=>s+Number(r.grossAmount),0) : null);
    add('late','Po terminie wysyłki',null,'szt.','Źródło kanoniczne nie zawiera terminów wysyłki.');
    add('refunded','Zwroty w okresie','return_value','PLN','Zwroty według daty zwrotu, także dla wcześniejszych zamówień.');
    snapshot.columns=[{id:'order',label:'Zamówienie'},{id:'date',label:'Data'},{id:'status',label:'Status źródłowy'},{id:'gross',label:'Wartość brutto',unit:'PLN'}];
    snapshot.rows=orders.map(r=>({id:r.canonicalOrderId,values:{order:r.orderNumber,date:day(r.orderedAt),status:r.status,gross:number(r.grossAmount)}}));
  } else if (config.template === 'products') {
    add('revenue','Sprzedaż produktów brutto','product_revenue','PLN','Wartość linii kwalifikowanych zamówień, przed zwrotami.');
    add('knownMargin','Marża według silnika metryk','product_margin','PLN','Sprzedaż produktów minus potwierdzony koszt. Definicja silnika metryk; nie obejmuje kosztów reklam i realizacji.');
    const productById=new Map(input.canonicalProducts.map(p=>[p.canonicalProductId,p]));
    const costSkus=new Set(input.productCosts.filter(c=>c.currency===input.currency).map(c=>c.sku));
    const total=lines.reduce((s,l)=>s+Number(l.grossAmount),0);
    const covered=lines.filter(l=>costSkus.has(productById.get(l.canonicalProductId ?? '')?.sku ?? '')).reduce((s,l)=>s+Number(l.grossAmount),0);
    add('costCoverage','Pokrycie przychodu kosztem',null,'%','Udział przychodu linii zamówień z potwierdzonym kosztem SKU.',total>0 ? 100*covered/total : null);
    add('units','Sprzedane sztuki','units_sold','szt.','Sztuki w kwalifikowanych zamówieniach.');
    snapshot.columns=[{id:'sku',label:'SKU'},{id:'name',label:'Produkt'},{id:'units',label:'Sztuki',unit:'szt.'},{id:'gross',label:'Sprzedaż brutto',unit:'PLN'}];
    const grouped=new Map<string,{units:number;gross:number}>();
    for(const l of lines){const id=l.canonicalProductId ?? 'unmapped';const r=grouped.get(id) ?? {units:0,gross:0};r.units+=l.quantity;r.gross+=Number(l.grossAmount);grouped.set(id,r);}
    snapshot.rows=[...grouped].map(([id,v])=>({id,values:{sku:productById.get(id)?.sku ?? null,name:productById.get(id)?.name ?? 'Produkt nieprzypisany',...v}}));
  } else {
    add('available','Dostępne sztuki','available_stock','szt.','Ostatni stan wskazanego głównego źródła magazynu w zakresie.');
    add('capital','Wartość magazynu według kosztu','stock_value','PLN','Stan głównego magazynu przemnożony przez potwierdzone koszty SKU.');
    add('atRisk','SKU zagrożone brakiem',null,'szt.','Brak terminów dostaw i progów bezpieczeństwa w źródle.');
    add('unknown','SKU bez pełnej oceny',null,'szt.','SKU w magazynie bez możliwości oceny terminu wyczerpania względem dostawy.',input.canonicalInventorySnapshots.length ? new Set(input.canonicalInventorySnapshots.map(r=>r.canonicalProductId ?? r.externalProductId)).size : null);
    snapshot.columns=[{id:'product',label:'Produkt / SKU'},{id:'available',label:'Dostępne sztuki',unit:'szt.'},{id:'date',label:'Stan na dzień'},{id:'source',label:'Źródło'}];
    const latest=new Map<string,MetricEngineInput['canonicalInventorySnapshots'][number]>();
    for(const r of input.canonicalInventorySnapshots){if(!inPeriod(r.snapshotAt))continue;const id=`${r.providerId}:${r.canonicalProductId ?? r.externalProductId}`;if(!latest.has(id)||latest.get(id)!.snapshotAt<r.snapshotAt)latest.set(id,r);}
    snapshot.rows=[...latest].map(([id,r])=>({id,values:{product:input.canonicalProducts.find(p=>p.canonicalProductId===r.canonicalProductId)?.sku ?? r.externalProductId,available:r.quantityAvailable,date:day(r.snapshotAt),source:r.providerId}}));
    snapshot.limitations.push('Tabela pokazuje ostatnie obserwacje każdego źródła w zakresie; KPI magazynowe korzystają wyłącznie ze wskazanego źródła głównego.');
  }
  snapshot.metrics=snapshot.metrics.filter(m=>config.metricIds.includes(m.id));
  const first=snapshot.metrics[0];
  if(first){snapshot.seriesMetric=first.label;const code=codeByMetric.get(first.id);snapshot.series=config.template==='inventory'||!code?[]:series.daily.map(d=>({date:d.date,value:number(d.values[code])}));}
  if(!snapshot.columns.length){snapshot.columns=[{id:'date',label:'Dzień'},{id:'value',label:snapshot.seriesMetric,unit:first?.unit}];snapshot.rows=snapshot.series.map(p=>({id:p.date,values:{date:p.date,value:p.value}}));}
  if(snapshot.rows.length>2000){snapshot.rows=snapshot.rows.slice(0,2000);snapshot.limitations.push('Tabela ograniczona do 2000 rekordów. KPI obejmują pełny dostępny zakres.');snapshot.quality='partial';}
  if(snapshot.metrics.every(m=>m.value===null)&&!snapshot.rows.length)snapshot.quality='empty';
  snapshot.sources=[{id:'canonical',label:'Dane kanoniczne workspace',detail:`Silnik metryk PapaData · ${config.from}–${config.to} · PLN · Europe/Warsaw. Braki danych zachowano jako niedostępne wartości.`,path:`/app/${config.template==='overview'?'command-center':config.template==='inventory'?'products':config.template}?from=${config.from}&to=${config.to}`}];
  return snapshot;
}
