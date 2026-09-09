export type CommerceRouteState={readonly key:'orderView';readonly value:'orders'|'payments'|'refunds'|'quality'}|{readonly key:'productView';readonly value:'sales'|'inventory'|'structure'|'quality'};
export function commerceRouteState(value:string):CommerceRouteState|null {
  const pathname=value.split(/[?#]/)[0]??'';
  const orders:Readonly<Record<string,'orders'|'payments'|'refunds'|'quality'>>={'platnosci':'payments','płatności':'payments','payments':'payments','zwroty':'refunds','refunds':'refunds','jakosc':'quality','quality':'quality','rekoncyliacja-skrot':'quality','porownanie-zrodel':'quality'};
  const products:Readonly<Record<string,'sales'|'inventory'|'structure'|'quality'>>={'magazyn':'inventory','inventory':'inventory','abc':'structure','xyz':'structure','jakosc':'quality','quality':'quality','mapowanie':'quality','kolejka-brakow':'quality'};
  const parts=pathname.replace(/^\/preview(?=\/|$)/,'/app').split('/'),group=parts[2],section=parts[3];
  return group==='orders'?{key:'orderView',value:orders[section??'']??'orders'}:group==='products'?{key:'productView',value:products[section??'']??'sales'}:null;
}

export function ordersRouteView(path:string):'orders'|'payments'|'refunds'|'quality' {const state=commerceRouteState(path);return state?.key==='orderView'?state.value:'orders';}
export function productsRouteView(path:string):'sales'|'inventory'|'structure'|'quality' {const state=commerceRouteState(path);return state?.key==='productView'?state.value:'sales';}
