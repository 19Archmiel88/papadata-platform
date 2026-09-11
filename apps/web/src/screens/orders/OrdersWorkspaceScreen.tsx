import { commerceOrderTotals, commerceOrderSorts, filterCommerceOrders, type CommerceOrder, type CommerceOrderFilters, type OrdersPortfolio } from '@papadata/contracts';
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
import { commerceMoney, commerceNumber, commerceState, commerceTimestamp, fulfillmentLabels, paymentLabels } from '../commerce/commercePresentation';
export type OrdersWorkspaceProps={readonly data:OrdersPortfolio|null;readonly state:RemoteState;readonly problem?:string|null;readonly onReload?:()=>void;
  readonly exportBusy?:boolean;readonly exportProblem?:string|null;readonly onExport?:(view:'orders'|'refunds',context:AnalyticsExportContext)=>void;readonly initialView?:'orders'|'payments'|'refunds'|'quality'};
export function OrdersWorkspaceScreen({data,state,problem,onReload,exportBusy,exportProblem,onExport,initialView='orders'}:OrdersWorkspaceProps) {
  const {t,language}=useProductLocale(),{params,update}=useProductQuery(),navigate=useShellNavigate();
  const views=[{id:'orders',label:t('Eksplorator','Explorer')},{id:'payments',label:t('Płatności i realizacja','Payments and fulfillment')},{id:'refunds',label:t('Refundacje','Refunds')},{id:'quality',label:t('Jakość i definicje','Quality and definitions')}] as const;
  const view=views.find(item=>item.id===params.get('orderView'))?.id??initialView;
  const queues=['all','paid','pending','failed','fulfilled','cancelled','unknown'] as const;
  const filters:CommerceOrderFilters={search:params.get('orderSearch')??'',queue:queues.find(v=>v===params.get('orderQueue'))??'all',sortBy:commerceOrderSorts.find(v=>v===params.get('orderSort'))??'orderedAt',direction:params.get('orderDirection')==='asc'?'asc':'desc'};
  const rows=filterCommerceOrders(data?.records??[],filters),totals=commerceOrderTotals(rows,data?.refunds??[],data?.meta.currency??null);
  const selected=data?.records.find(row=>row.id===params.get('orderId')),zone=data?.meta.range.timezone??'Europe/Warsaw';
  const n=(v:number|null|undefined)=>commerceNumber(v,language),money=(v:number|null|undefined,c=data?.meta.currency)=>commerceMoney(v,c,language);
  const link=(target:string,extras:Record<string,string|null>={})=>contextualProductLink(target,{sourceId:data?.meta.sourceId??null,currency:data?.meta.currency??null,returnTo:commerceSourcePath(data?.meta??null),...extras});
  useAssistantAnalysisContext({title:'Zamówienia',route:productRoutes.orders,readiness:state==='ready'?data?.meta.quality??'empty':state,source:'commerce.orders.v1',
    metrics:{'Zamówienia w tabeli':data?rows.length:null,'Brutto kwalifikowane':totals.qualifiedGross,'Kwota refundacji według ich daty':totals.refundValue},tables:['Zamówienia','Refundacje'],filters:{...filters}});
  const columns:readonly ExplorerTableColumn<CommerceOrder>[]=[
    {id:'number',label:t('Zamówienie','Order'),required:true,sortAccessor:row=>row.number,render:row=><Button size="small" variant="ghost" onClick={()=>update({orderId:row.id})}>{row.number}</Button>},
    {id:'orderedAt',label:t('Utworzone','Created'),sortAccessor:row=>row.orderedAt,render:row=>commerceTimestamp(row.orderedAt,zone,language)},
    {id:'payment',label:t('Płatność','Payment'),sortAccessor:row=>row.payment,render:row=><span className="pd-product-data__badge">{t(...paymentLabels[row.payment])}</span>},
    {id:'fulfillment',label:t('Realizacja','Fulfillment'),render:row=>t(...fulfillmentLabels[row.fulfillment])},
    {id:'gross',label:t('Brutto','Gross'),align:'right',sortAccessor:row=>row.gross,render:row=>money(row.gross,row.currency)},
    {id:'net',label:t('Netto','Net'),align:'right',render:row=>money(row.net,row.currency)},
    {id:'status',label:t('Status źródłowy','Source status'),defaultVisible:false,render:row=>row.status??'—'},
  ];
  const payCounts=Object.keys(paymentLabels).map(id=>({id,label:t(...paymentLabels[id as keyof typeof paymentLabels]),count:rows.filter(row=>row.payment===id).length}));
  return <div className="pd-product-data pd-commerce">
    <CommerceScope title={t('Zamówienia','Orders')} description={t('Wynik, stan płatności i realizacji z jednego wskazanego źródła.','Performance, payment and fulfillment from one explicitly selected source.')} meta={data?.meta??null} onReload={onReload} template="orders"/>
    <ProductViewNav label={t('Widoki zamówień','Order views')} active={view} items={views} onChange={value=>update({orderView:value,orderId:null})}/>
    {exportProblem&&<p role="alert">{exportProblem}</p>}
    <ProductDataState provenance={data?{source:data.meta.sources.find(s=>s.id===data.meta.sourceId)?.name??t('Wybór źródła','Source selection'),synchronizedAt:data.meta.lastSuccessfulSyncAt,calculatedAt:data.meta.generatedAt,limitations:data.meta.limitations,demo:data.meta.mode==='demo'}:undefined} state={commerceState(data?.meta,state)} problem={problem??(data?.meta.quality==='selection_required'?t('Wybierz jedno zrodlo w filtrze powyzej. Nie laczymy nakladajacych sie kont.','Choose one source above. Overlapping accounts are not combined.'):undefined)} onRetry={onReload}>
    {data&&<>

      <dl className="pd-product-data__metrics"><MetricSummary label={t('Zamówienia w tabeli','Orders in table')} value={n(rows.length)} description={t('Po filtrach i wyszukiwaniu.','After filters and search.')}/>
        <MetricSummary label={t('Brutto kwalifikowane','Qualified gross')} value={money(totals.qualifiedGross)} description={t('Przed refundacjami, według reguł kwalifikacji metryk.','Before refunds, using metric qualification rules.')}/>
        <MetricSummary label={t('Kwota netto wszystkich zamówień','Net amount of all orders')} value={money(totals.net)} description={t(`Potwierdzone kwoty: ${totals.netKnown}/${rows.length}.`,`Confirmed amounts: ${totals.netKnown}/${rows.length}.`)}/>
        <MetricSummary label={t('Refundacje w okresie','Refunds in period')} value={money(totals.refundValue)} description={t('Według daty refundacji, niezależnie od filtra tabeli zamówień.','By refund date, independent of the order-table filter.')}/></dl>
      {view==='orders'&&<section className="pd-product-data__section"><h2>{t('Rejestr zamówień','Order register')}</h2>
        <ExplorerTable ariaLabel={t('Zamówienia w wybranym okresie','Orders in the selected period')} rows={rows} columns={columns} manualSearch manualSorting
          searchQuery={filters.search} onSearchQueryChange={value=>update({orderSearch:value,orderId:null})} searchLabel={t('Szukaj numeru zamówienia','Search order number')} searchPlaceholder={t('Numer lub identyfikator','Number or identifier')}
          sortState={{columnId:filters.sortBy,direction:filters.direction}} onSortStateChange={next=>update({orderSort:commerceOrderSorts.includes(next.columnId as typeof filters.sortBy)?next.columnId:'orderedAt',orderDirection:next.direction})}
          filters={<label>{t('Kolejka','Queue')}<select value={filters.queue} onChange={event=>update({orderQueue:event.target.value,orderId:null})}>{queues.map(id=><option key={id} value={id}>{id==='all'?t('Wszystkie','All'):id==='fulfilled'||id==='cancelled'?t(...fulfillmentLabels[id]):t(...paymentLabels[id])}</option>)}</select></label>}
          canExport={Boolean(onExport)} exportFormats={['csv']} exportPending={exportBusy} onExport={(_,ctx)=>onExport?.('orders',ctx)} collapsedRowCount={10} pageSize={25}/>
        <p className="pd-commerce__muted">{t('Eksport zawiera cały wyfiltrowany zakres, nie tylko bieżącą stronę. Status nie jest dowodem wpłaty z banku.','Export includes the full filtered selection, not just the current page. Status is not a bank-payment receipt.')}</p>
      </section>}
      {view==='payments'&&<div className="pd-product-data__grid"><section className="pd-product-data__section"><h2>{t('Status płatności','Payment status')}</h2><table className="pd-product-data__table"><thead><tr><th scope="col">{t('Stan','State')}</th><th scope="col">{t('Liczba','Count')}</th></tr></thead><tbody>{payCounts.map(row=><tr key={row.id}><th scope="row">{row.label}</th><td>{row.count}</td></tr>)}</tbody></table><p>{t('Liczniki opisują wyłącznie wczytane zamówienia po filtrach, nie całą populację sklepu.','Counts describe loaded, filtered orders, not the complete store population.')}</p></section>
        <section className="pd-commerce__side"><h2>{t('Co wymaga sprawdzenia','What needs attention')}</h2><p>{t(`Nieustalony stan płatności: ${rows.filter(row=>row.payment==='unknown').length}.`,`Unknown payment status: ${rows.filter(row=>row.payment==='unknown').length}.`)}</p><p>{t('Brak potwierdzonych terminów wysyłki i rejestru operatora. Nie wyliczamy opóźnień ani nie uruchamiamy ponownej płatności.','Shipping deadlines and the payment-processor ledger are unavailable. No lateness is inferred and no payment is retried.')}</p><Button variant="secondary" onClick={()=>navigate(link(productRoutes.decisions,{title:t('Przegląd płatności zamówień','Review order payments'),domain:'orders'}))}>{t('Przygotuj decyzję','Prepare decision')}</Button></section></div>}
      {view==='refunds'&&<section className="pd-product-data__section"><div className="pd-product-data__toolbar"><h2>{t('Zdarzenia refundacji','Refund events')}</h2>{onExport&&<Button variant="secondary" disabled={exportBusy} onClick={()=>onExport('refunds',{columns:['externalId','orderId','occurredAt','amount','status','currency'],search:'',sort:null})}>{t('Eksportuj refundacje CSV','Export refunds CSV')}</Button>}</div>
        <p>{t('Kwoty według daty refundacji. Zamówienie może być spoza zakresu. To nie jest operacja zwrotu pieniędzy.','Amounts are grouped by refund date. The order may be outside the period. This does not issue a refund.')}</p>
        <div className="pd-product-data__table-scroll" tabIndex={0} role="region" aria-label={t('Refundacje','Refunds')}><table className="pd-product-data__table"><thead><tr>{['ID','Data / Date','Zamówienie / Order','Kwota / Amount','Status'].map(label=><th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{data.refunds.map(row=><tr key={row.id}><th scope="row">{row.externalId}</th><td>{commerceTimestamp(row.occurredAt,zone,language)}</td><td>{row.orderId??'—'}</td><td>{money(row.amount,row.currency)}</td><td>{row.status??'—'}</td></tr>)}</tbody></table></div>
        {!data.refunds.length&&<p>{t('Brak zachowanych zdarzeń refundacji. Nie oznacza to, że ich kwota wynosi zero.','No retained refund events. This does not establish a zero refunded amount.')}</p>}
      </section>}
      {view==='quality'&&<section className="pd-product-data__section"><h2>{t('Granice analizy zamówień','Order-analysis boundaries')}</h2>
        <p>{t('Statusy wykluczone z przychodu zgodnie z istniejącym silnikiem metryk: anulowane, pending, on-hold, failed, refunded, draft, trash i voided. Nieznany lub pusty status jest kwalifikowany przez istniejący kontrakt; wymaga przeglądu.','Revenue qualification follows the existing metric engine: cancelled, pending, on-hold, failed, refunded, draft, trash and voided are excluded. Unknown or empty status qualifies under the existing contract and requires review.')}</p>
        <p>{t('Kwota zamówienia, kwota wpłaty i przychód to odrębne pojęcia. Rabat WooCommerce jest kwotą netto. Koszt wysyłki naliczony klientowi nie jest kosztem realizacji sklepu.','Order value, received payment and revenue are different concepts. WooCommerce discount is net. Shipping charged to the customer is not the merchant fulfillment cost.')}</p>
        <p>{t('Z agregatów zamówień nie odtwarzamy sekwencyjnego lejka sesji. Przejdź do Ruchu, aby sprawdzić pomiar GA4.','Order aggregates do not reconstruct a sequential session funnel. Open Traffic to inspect GA4 measurement.')}</p>
        <div className="pd-product-data__toolbar"><Button variant="secondary" onClick={()=>navigate(link(productRoutes.traffic,{sourceId:null}))}>{t('Pomiar ruchu','Traffic measurement')}</Button><Button variant="ghost" onClick={()=>navigate(link(productRoutes.integrations))}>{t('Synchronizacja źródła','Source synchronization')}</Button></div>
      </section>}
    </>}
    </ProductDataState>
    {params.get('orderId')&&state==='ready'&&data&&!selected&&<p role="status">{t('Wybrane zamówienie nie jest dostępne w tym zakresie.','The selected order is not available in this range.')} <Button variant="ghost" size="small" onClick={()=>update({orderId:null})}>{t('Wyczyść wybór','Clear selection')}</Button></p>}
    <Drawer open={Boolean(selected)&&state==='ready'} title={selected?.number??t('Zamówienie','Order')} description={t('Odczyt danych źródłowych. Bez operacji finansowych.','Read-only source data. No financial operations.')} dismissible side="right" width={700} onOpenChange={open=>{if(!open)update({orderId:null});}}>
      {selected&&<div className="pd-commerce__detail"><dl className="pd-product-data__facts">{[[t('Status źródłowy','Source status'),selected.status??'—'],[t('Płatność','Payment'),t(...paymentLabels[selected.payment])],[t('Realizacja','Fulfillment'),t(...fulfillmentLabels[selected.fulfillment])],[t('Metoda płatności','Payment method'),selected.paymentMethod??'—'],[t('Klient pseudonimizowany','Pseudonymized customer'),selected.customerPseudonym??'—'],[t('Brutto','Gross'),money(selected.gross,selected.currency)],[t('Netto','Net'),money(selected.net,selected.currency)],[t('Podatek','Tax'),money(selected.tax,selected.currency)]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <h3>{t('Potwierdzone znaczniki czasu','Reported timestamps')}</h3><dl className="pd-product-data__facts">{[[t('Utworzenie','Created'),selected.orderedAt],[t('Opłacenie','Paid'),selected.paidAt],[t('Realizacja','Completed'),selected.completedAt],[t('Obserwacja w PapaData','Observed in PapaData'),selected.observedAt]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{commerceTimestamp(value,zone,language)}</dd></div>)}</dl>
        <h3>{t('Pozycje','Line items')}</h3><div className="pd-product-data__table-scroll" tabIndex={0} role="region" aria-label={t('Pozycje zamówienia','Order items')}><table className="pd-product-data__table"><thead><tr><th scope="col">{t('Produkt / SKU','Product / SKU')}</th><th scope="col">{t('Ilość','Quantity')}</th><th scope="col">{t('Brutto','Gross')}</th><th scope="col">{t('Netto','Net')}</th></tr></thead><tbody>{selected.lines.map(row=><tr key={row.id}><th scope="row">{row.name??row.sku??row.productId??'—'}</th><td>{n(row.quantity)}</td><td>{money(row.gross,selected.currency)}</td><td>{money(row.net,selected.currency)}</td></tr>)}</tbody></table></div>
        {selected.limitations.map((text,i)=><p key={i} className="pd-commerce__muted">{text}</p>)}
        <Button variant="secondary" onClick={()=>navigate(link(productRoutes.decisions,{title:`${t('Analiza zamówienia','Review order')} ${selected.number}`,domain:'orders'}))}>{t('Przygotuj decyzję z kontekstem','Prepare a decision with context')}</Button>
      </div>}
    </Drawer>
  </div>;
}
