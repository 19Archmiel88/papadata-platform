import { useEffect, useState } from 'react';
import { commerceDay, commerceProductSorts, commerceProductTotals, commerceSum, filterCommerceProducts, type CommerceProduct, type CommerceProductFilters, type ProductPortfolio } from '@papadata/contracts';
import { Button, Drawer, ExplorerTable } from '../../design-system';
import type { ExplorerTableColumn } from '../../design-system/components/Domain/ExplorerTable/ExplorerTable';
import type { AnalyticsExportContext } from '../../runtime/shared/data/useAnalyticsExport';
import type { RemoteState } from '../../runtime/shared/data/useRemoteResource';
import { useProductQuery, contextualProductLink, productRoutes } from '../../runtime/app/routing/productRoutes';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import { useAssistantAnalysisContext } from '../../runtime/shell/papa-assistant/useAssistantAnalysisContext';
import { MetricSummary, ProductDataState, ProductViewNav } from '../shared/ProductDataState';
import { useProductLocale } from '../shared/useProductLocale';
import { CommerceScope, commerceSourcePath } from '../commerce/CommerceScope';
import { CommerceTrend } from '../commerce/CommerceTrend';
import { commerceMoney, commerceNumber, commerceState, commerceTimestamp } from '../commerce/commercePresentation';
export type ProductsWorkspaceProps={readonly data:ProductPortfolio|null;readonly state:RemoteState;readonly problem?:string|null;readonly onReload?:()=>void;
  readonly exportBusy?:boolean;readonly exportProblem?:string|null;readonly onExport?:(context:AnalyticsExportContext)=>void;readonly initialView?:'sales'|'inventory'|'structure'|'quality'};
function InventoryDate({value,timezone}:{readonly value:string;readonly timezone:string}) {
  const {t}=useProductLocale(),{update}=useProductQuery(),[draft,setDraft]=useState(value);
  useEffect(()=>setDraft(value),[value]);
  const today=commerceDay(new Date().toISOString(),timezone)??value;
  const valid=/^\d{4}-\d{2}-\d{2}$/.test(draft)&&Number.isFinite(Date.parse(draft))&&new Date(draft).toISOString().slice(0,10)===draft&&draft>='2020-01-01'&&draft<=today;
  return <form className="pd-commerce__stock-form" onSubmit={event=>{event.preventDefault();if(valid)update({inventoryAsOf:draft,productId:null});}}>
    <label>{t('Stan magazynu na dzień','Inventory as of')}<input type="date" value={draft} min="2020-01-01" max={today} aria-invalid={!valid} onChange={event=>setDraft(event.target.value)}/></label>
    <Button type="submit" disabled={!valid||draft===value}>{t('Zastosuj datę stanu','Apply inventory date')}</Button><Button type="button" variant="ghost" disabled={draft===value} onClick={()=>setDraft(value)}>{t('Anuluj','Cancel')}</Button>
    {!valid&&<p role="alert">{t('Podaj poprawną datę bez dnia przyszłego.','Enter a valid non-future date.')}</p>}
  </form>;
}
function ProductScenario({product}:{readonly product:CommerceProduct}) {
  const {t,language}=useProductLocale(),[discount,setDiscount]=useState('0'),[cost,setCost]=useState('');
  const rate=Number(discount),unitCost=cost.trim()===''?null:Number(cost),units=product.units;
  const valid=discount.trim()!==''&&Number.isFinite(rate)&&rate>=0&&rate<100&&unitCost!==null&&Number.isFinite(unitCost)&&unitCost>=0&&product.net!==null&&units!==null&&units>0;
  const net=valid?product.net!*(1-rate/100):null,margin=net===null?null:net-unitCost!*units!;
  return <section className="pd-product-data__section"><h3>{t('Scenariusz arytmetyczny','Arithmetic scenario')}</h3>
    <p>{t('Stały wolumen obserwowanych sztuk, cena netto obniżona o rabat i koszt jednostkowy wpisany jako założenie. To nie prognoza popytu ani operacja zmiany ceny.','Fixed observed unit volume, net price reduced by a discount and an assumed unit cost. This is not a demand forecast or a price-change operation.')}</p>
    <div className="pd-product-data__form"><label>{t('Założony rabat (%)','Assumed discount (%)')}<input type="number" min="0" max="99.99" step="0.1" value={discount} onChange={event=>setDiscount(event.target.value)}/></label>
    <label>{t('Założony koszt jednostkowy w walucie sprzedaży','Assumed unit cost in sales currency')}<input type="number" min="0" step="0.01" value={cost} onChange={event=>setCost(event.target.value)}/></label></div>
    <p>{t('Wynik scenariusza netto minus koszt (bez reklam i realizacji)','Scenario net less cost (excluding advertising and fulfillment)')}: <strong>{commerceMoney(margin,product.currency,language)}</strong></p>
    {!valid&&<p className="pd-commerce__muted">{t('Wymagane: potwierdzona suma netto, dodatnia liczba sztuk oraz poprawne założenia.','Requires confirmed net sales, positive units and valid assumptions.')}</p>}
  </section>;
}
export function ProductsWorkspaceScreen({data,state,problem,onReload,exportBusy,exportProblem,onExport,initialView='sales'}:ProductsWorkspaceProps) {
  const {t,language}=useProductLocale(),{params,update}=useProductQuery(),navigate=useShellNavigate();
  const views=[{id:'sales',label:t('Sprzedaż i wartość','Sales and value')},{id:'inventory',label:t('Stan magazynu','Inventory')},{id:'structure',label:t('Struktura ABC','ABC structure')},{id:'quality',label:t('Jakość i mapowanie','Quality and mapping')}] as const;
  const view=views.find(item=>item.id===params.get('productView'))?.id??initialView;
  const filterValues=['all','missing_cost','unmapped','no_stock','missing_stock'] as const;
  const filters:CommerceProductFilters={search:params.get('productSearch')??'',category:params.get('productCategory'),filter:filterValues.find(v=>v===params.get('productFilter'))??'all',sortBy:commerceProductSorts.find(v=>v===params.get('productSort'))??'gross',direction:params.get('productDirection')==='asc'?'asc':'desc'};
  const rows=filterCommerceProducts(data?.records??[],filters),totals=commerceProductTotals(rows,data?.meta.currency??null),selected=data?.records.find(row=>row.id===params.get('productId'));
  const n=(v:number|null|undefined)=>commerceNumber(v,language),money=(v:number|null|undefined,c=data?.meta.currency)=>commerceMoney(v,c,language),zone=data?.meta.range.timezone??'Europe/Warsaw';
  const link=(target:string,extras:Record<string,string|null>={})=>contextualProductLink(target,{sourceId:data?.meta.sourceId??null,currency:data?.meta.currency??null,returnTo:commerceSourcePath(data?.meta??null,data?.inventoryAsOf),inventoryAsOf:data?.inventoryAsOf??null,...extras});
  useAssistantAnalysisContext({title:'Produkty',route:productRoutes.products,readiness:state==='ready'?data?.meta.quality??'empty':state,source:'commerce.products.v1',metrics:{'Produkty po filtrach':data?rows.length:null,'Sprzedaż brutto':totals.gross,'Marża części z potwierdzonym kosztem':totals.knownMargin,'Magazyn obserwowany':totals.inventoryQuantity},filters:{inventoryAsOf:data?.inventoryAsOf??'',view},tables:['Produkty','Magazyn','ABC']});
  const basic:ExplorerTableColumn<CommerceProduct>[]=[{id:'name',label:t('Produkt','Product'),required:true,sortAccessor:row=>row.name,render:row=><Button variant="ghost" size="small" onClick={()=>update({productId:row.id})}>{row.name}</Button>},
    {id:'sku',label:'SKU',sortAccessor:row=>row.sku,render:row=>row.sku??'—'},
    {id:'category',label:t('Kategoria','Category'),defaultVisible:false,render:row=>row.category??'—'}];
  const columns:readonly ExplorerTableColumn<CommerceProduct>[]=view==='inventory'?[...basic,
    {id:'quantity',label:t('Dostępne w obserwacji','Available in observation'),align:'right',sortAccessor:row=>row.stock.quantity,render:row=>n(row.stock.quantity)},
    {id:'observedAt',label:t('Data odczytu stanu','Stock observation time'),render:row=>commerceTimestamp(row.stock.observedAt,zone,language)},
    {id:'currency',label:t('Waluta sprzedaży','Sales currency'),defaultVisible:false,render:row=>row.currency==='XXX'?'—':row.currency}
  ]:[...basic,
    {id:'units',label:t('Sztuki','Units'),align:'right',sortAccessor:row=>row.units,render:row=>n(row.units)},
    {id:'gross',label:t('Brutto przed zwrotami','Gross before refunds'),align:'right',sortAccessor:row=>row.gross,render:row=>money(row.gross,row.currency)},
    {id:'net',label:t('Netto','Net'),align:'right',render:row=>money(row.net,row.currency)},
    {id:'margin',label:t('Netto minus koszt towaru','Net less cost of goods'),align:'right',sortAccessor:row=>row.margin,render:row=>money(row.margin,row.currency)}];
  const filterNames:Record<typeof filterValues[number],readonly [string,string]>={all:['Wszystkie','All'],missing_cost:['Brak kosztu linii','Missing line cost'],unmapped:['Brak mapowania','Unmapped'],no_stock:['Zaobserwowane zero stanu','Observed zero stock'],missing_stock:['Brak stanu','Missing stock']};
  const filterControls=<><label>{t('Kategoria','Category')}<select value={filters.category??''} onChange={event=>update({productCategory:event.target.value||null,productId:null})}><option value="">{t('Wszystkie','All')}</option>{data?.categories.map(category=><option key={category}>{category}</option>)}</select></label>
    <label>{t('Zakres','Selection')}<select value={filters.filter} onChange={event=>update({productFilter:event.target.value,productId:null})}>{filterValues.map(id=><option key={id} value={id}>{t(...filterNames[id])}</option>)}</select></label></>;
  return <div className="pd-product-data pd-commerce">
    <CommerceScope title={t('Produkty','Products')} description={t('Sprzedaż z pozycji zamówień. Magazyn z osobną datą obserwacji.','Sales from order lines. Inventory with a separate observation date.')} meta={data?.meta??null} inventoryAsOf={data?.inventoryAsOf} onReload={onReload} template={view==='inventory'?'inventory':'products'}/>
    <ProductViewNav label={t('Widoki produktów','Product views')} active={view} items={views} onChange={value=>update({productView:value,productId:null})}/>
    {exportProblem&&<p role="alert">{exportProblem}</p>}
    <ProductDataState provenance={data?{source:data.meta.sources.find(s=>s.id===data.meta.sourceId)?.name??t('Wybór źródła','Source selection'),synchronizedAt:data.meta.lastSuccessfulSyncAt,calculatedAt:data.meta.generatedAt,limitations:data.meta.limitations,demo:data.meta.mode==='demo'}:undefined} state={commerceState(data?.meta,state)} problem={problem??(data?.meta.quality==='selection_required'?t('Wybierz jedno zrodlo w filtrze powyzej. Nie laczymy nakladajacych sie kont.','Choose one source above. Overlapping accounts are not combined.'):undefined)} onRetry={onReload}>
      {data&&<>

      <dl className="pd-product-data__metrics"><MetricSummary label={t('Produkty po filtrach','Products after filtering')} value={n(rows.length)} description={t('Katalog i nieprzypisane pozycje sprzedaży.','Catalog and unmapped sales lines.')}/>
        <MetricSummary label={t('Wartość brutto','Gross value')} value={money(totals.gross)} description={t('Brak wartości choć jednej pozycji pozostawia sumę nieustaloną.','One unavailable value leaves the full sum unavailable.')}/>
        <MetricSummary label={t('Pokrycie kosztami','Cost coverage')} value={totals.costCoverage===null?'—':`${n(totals.costCoverage)}%`} description={t('Udział znanego brutto z potwierdzonym netto i kosztem.','Share of known gross with confirmed net and cost.')}/>
        <MetricSummary label={t('Znany stan magazynu','Known inventory')} value={`${n(totals.inventoryKnown)} / ${n(new Set(rows.map(row=>row.externalId)).size)}`} description={t(`Ostatni zachowany odczyt nie później niż ${data.inventoryAsOf}.`,`Last retained observation no later than ${data.inventoryAsOf}.`)}/></dl>
      {view==='inventory'&&<section className="pd-product-data__section"><InventoryDate value={data.inventoryAsOf} timezone={zone}/><p>{t('To ostatnia zachowana obserwacja nie późniejsza niż wybrany dzień. Nie odtwarza stanu historycznego, który został nadpisany. Zmiana okresu sprzedaży nie zmienia tej daty.','This is the last retained observation at or before the selected day. It cannot reconstruct overwritten historical inventory. Changing the sales period does not change this date.')}</p></section>}
      {(view==='sales'||view==='inventory')&&<section className="pd-product-data__section"><h2>{view==='sales'?t('Wartość produktów','Product value'):t('Obserwacje magazynowe','Inventory observations')}</h2>
        <ExplorerTable ariaLabel={t('Produkty w zakresie','Products in scope')} rows={rows} columns={columns} filters={filterControls} manualSearch manualSorting
          searchQuery={filters.search} onSearchQueryChange={value=>update({productSearch:value,productId:null})} searchLabel={t('Szukaj produktu lub SKU','Search product or SKU')} searchPlaceholder={t('Nazwa, SKU lub ID','Name, SKU or ID')}
          sortState={{columnId:filters.sortBy,direction:filters.direction}} onSortStateChange={next=>update({productSort:commerceProductSorts.includes(next.columnId as typeof filters.sortBy)?next.columnId:'gross',productDirection:next.direction})}
          canExport={Boolean(onExport)} exportFormats={['csv']} exportPending={exportBusy} onExport={(_,context)=>onExport?.(context)} collapsedRowCount={10} pageSize={25}/>
        <p className="pd-commerce__muted">{t('CSV zawiera wyfiltrowane rekordy i osobną datę magazynu. Koszty jednostkowe i XYZ bez źródła nie są uzupełniane przykładowymi wartościami.','CSV includes filtered records and the separate inventory date. Missing unit costs or XYZ data are not filled with examples.')}</p>
      </section>}
      {view==='structure'&&<section className="pd-product-data__section"><h2>{t('Koncentracja znanej sprzedaży brutto','Concentration of known gross sales')}</h2>
        <p>{t('ABC jest wyliczone dla pełnego wybranego źródła i waluty, przed filtrem tabeli. Progi skumulowane: A do 80%, B do 95%, C pozostałe. To podział opisowy, nie rekomendacja zmiany zapasu.','ABC is calculated for the full selected source and currency, before the table filter. Cumulative thresholds: A up to 80%, B up to 95%, C the remainder. This is descriptive, not an inventory recommendation.')}</p>
        <table className="pd-product-data__table"><thead><tr><th scope="col">{t('Klasa','Class')}</th><th scope="col">{t('Produkty','Products')}</th><th scope="col">{t('Znane brutto','Known gross')}</th></tr></thead><tbody>{(['A','B','C',null] as const).map(group=>{const items=rows.filter(row=>row.abc===group);return <tr key={group??'unknown'}><th scope="row">{group??t('Nieustalone','Unknown')}</th><td>{items.length}</td><td>{data.meta.currency?money(commerceSum(items.map(row=>row.gross))):'—'}</td></tr>;})}</tbody></table>
        <p>{t('XYZ wymaga kompletnej historii zmienności popytu. Nie przypisujemy klas na podstawie brakujących dni ani samych sum zamówień.','XYZ requires complete demand-variability history. Classes are not assigned from missing days or order totals alone.')}</p>
      </section>}
      {view==='quality'&&<section className="pd-product-data__section"><h2>{t('Jakość powiązań i danych','Linkage and data quality')}</h2>
        <dl className="pd-product-data__facts"><div><dt>{t('Nieprzypisane pozycje produktów','Unmapped product groups')}</dt><dd>{rows.filter(row=>!row.mapped).length}</dd></div><div><dt>{t('Linie z potwierdzonym brutto','Lines with confirmed gross')}</dt><dd>{rows.reduce((n,row)=>n+row.pricedLines,0)} / {rows.reduce((n,row)=>n+row.lines,0)}</dd></div><div><dt>{t('Produkty z wieloma magazynami','Products with multiple warehouses')}</dt><dd>{rows.filter(row=>row.stock.warehouse==='multiple').length}</dd></div></dl>
        <p>{t('Powtarzające się SKU nie są mapowane arbitralnie. Wielu magazynów o niepotwierdzonej semantyce nie sumujemy. Starsze linie bez rozdzielenia netto/brutto wymagają ponownego importu.','Duplicate SKUs are not arbitrarily mapped. Warehouses with unconfirmed overlap semantics are not summed. Older lines without a net/gross distinction require reimport.')}</p>
        <div className="pd-product-data__toolbar"><Button variant="secondary" onClick={()=>navigate(link(productRoutes.dataQuality))}>{t('Sprawdź jakość danych','Inspect data quality')}</Button><Button variant="ghost" onClick={()=>navigate(link(productRoutes.decisions,{title:t('Uzupełnienie danych produktów','Complete product data'),domain:'products'}))}>{t('Przygotuj decyzję','Prepare decision')}</Button></div>
      </section>}
    </>}
    </ProductDataState>
    {params.get('productId')&&state==='ready'&&data&&!selected&&<p role="status">{t('Wybrany produkt jest niedostępny dla tego źródła, waluty lub zakresu.','The selected product is unavailable for this source, currency or range.')}<Button variant="ghost" size="small" onClick={()=>update({productId:null})}>{t('Wyczyść wybór','Clear selection')}</Button></p>}
    <Drawer open={Boolean(selected)&&state==='ready'} title={selected?.name??t('Produkt','Product')} description={selected?.sku??t('Brak SKU','SKU unavailable')} dismissible side="right" width={740} onOpenChange={open=>{if(!open)update({productId:null});}}>
      {selected&&<div className="pd-commerce__detail" key={selected.id}><dl className="pd-product-data__facts">{[[t('Brutto','Gross'),money(selected.gross,selected.currency)],[t('Netto','Net'),money(selected.net,selected.currency)],[t('Potwierdzony koszt towaru','Confirmed cost of goods'),money(selected.cogs,selected.currency)],[t('Mapowanie','Mapping'),selected.mapped?t('Potwierdzone ID','Confirmed ID'):t('Nieprzypisane','Unmapped')],[t('Stan magazynu','Inventory quantity'),n(selected.stock.quantity)],[t('Odczyt stanu','Inventory observed'),commerceTimestamp(selected.stock.observedAt,zone,language)]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <CommerceTrend title={t('Zaobserwowane sztuki w dniach sprzedaży','Observed units on sales days')} points={selected.observations.map(row=>({date:row.date,value:row.units}))} unit={t('szt.','units')}/>
        <ProductScenario product={selected}/>
        <Button variant="secondary" onClick={()=>navigate(link(productRoutes.decisions,{title:`${t('Analiza produktu','Review product')}: ${selected.name}`,domain:'products'}))}>{t('Przygotuj decyzję z kontekstem','Prepare a decision with context')}</Button>
      </div>}
    </Drawer>
  </div>;
}
