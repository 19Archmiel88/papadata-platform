import type { ReactNode } from 'react';
import type { CommerceMeta } from '@papadata/contracts';
import { Button } from '../../design-system';
import { ProductDateControl } from '../shared/ProductDateControl';
import { useProductLocale } from '../shared/useProductLocale';
import { contextualProductLink, currentProductSourcePath, productRoutes, useProductQuery } from '../../runtime/app/routing/productRoutes';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import './commerce-workspace.css';
export function commerceSourcePath(meta:CommerceMeta|null,inventoryAsOf?:string):string {
  const source=new URL(currentProductSourcePath(),window.location.origin);
  if(meta?.sourceId)source.searchParams.set('sourceId',meta.sourceId);
  if(meta?.currency)source.searchParams.set('currency',meta.currency);
  if(inventoryAsOf)source.searchParams.set('inventoryAsOf',inventoryAsOf);
  return source.pathname+source.search;
}
export function CommerceScope({title,description,meta,onReload,template,inventoryAsOf,children,summarySuffix}:{readonly title:string;readonly description:string;readonly meta:CommerceMeta|null;readonly onReload?:()=>void;readonly inventoryAsOf?:string;readonly children?:ReactNode;readonly summarySuffix?:string;readonly template:'overview'|'orders'|'products'|'inventory'}) {
  const {params,update}=useProductQuery(),{t}=useProductLocale(),navigate=useShellNavigate();
  const link=(target:string,extras:Record<string,string|null>={})=>contextualProductLink(target,{sourceId:meta?.sourceId??params.get('sourceId'),currency:meta?.currency??params.get('currency'),returnTo:commerceSourcePath(meta,inventoryAsOf),...extras});
  return <>
    <header className="pd-product-data__head"><div><h1>{title}</h1><p>{description}</p></div>
      <div className="pd-product-data__toolbar"><ProductDateControl label={t('Okres sprzedaży','Sales period')} clearParams={['orderId','productId']}/><Button variant="secondary" onClick={onReload} disabled={!onReload}>{t('Odśwież','Refresh')}</Button></div>
    </header>
    <div className="pd-commerce__scope-bar">
    <details className="pd-commerce__scope-disclosure" open={!meta?.sourceId || undefined}>
      <summary><span>{meta?.sources.find(source=>source.id===meta.sourceId)?.name??t('Wybierz źródło','Select source')} · {meta?.currency??t('Wszystkie waluty','All currencies')}{summarySuffix ? ` · ${summarySuffix}` : ''}</span><span className="pd-commerce__scope-edit">{t('Zmień','Change')}</span></summary>
      <div className="pd-product-data__toolbar pd-commerce__scope">
      <label>{t('Źródło zamówień i produktów','Orders and products source')}
        <select value={params.get('sourceId')??meta?.sourceId??''} onChange={event=>update({sourceId:event.target.value||null,currency:null,orderId:null,productId:null})} disabled={!meta?.sources.length}>
          <option value="">{t('Wybierz jedno źródło','Select one source')}</option>
          {meta?.sources.map(source=><option key={source.id} value={source.id}>{source.name} · {source.provider}</option>)}
        </select></label>
      <label>{t('Waluta','Currency')}<select value={params.get('currency')??meta?.currency??''} onChange={event=>update({currency:event.target.value||null,orderId:null,productId:null})} disabled={!meta?.currencies.some(c=>c!=='XXX')}>
        <option value="">{t('Bez sumowania walut','Do not sum currencies')}</option>{meta?.currencies.filter(c=>c!=='XXX').map(c=><option key={c}>{c}</option>)}
      </select></label>
      <Button variant="ghost" size="small" onClick={()=>update({sourceId:null,currency:null,provider:null,orderId:null,productId:null})}>{t('Reset źródła','Reset source')}</Button>
      {children}
      </div>
    </details>
      <div className="pd-commerce__actions"><Button variant="secondary" size="small" disabled={!meta?.sourceId} onClick={()=>navigate(link(productRoutes.reports,{reportTemplate:template,reportMode:'create'}))}>{t('Przygotuj raport','Prepare report')}</Button>
      <Button variant="ghost" size="small" onClick={()=>navigate(link(productRoutes.assistant))}>{t('Papa Asystent','Papa Assistant')}</Button></div>
    </div>

  </>;
}
