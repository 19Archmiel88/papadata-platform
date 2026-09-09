import {commerceRouteState} from '../../../runtime/app/routing/commerceRoutes';
import { cleanProductContextPath, productContextKeys } from '@papadata/contracts';
const sharedKeys: readonly string[] = [...productContextKeys,'returnTo','domain','title','prompt','topic','helpTopic','reportTemplate','__pdRoute','globals','settingsView','auditBefore','billingView','billingCycle','invoiceAfter','qualityView','qualitySource','qualityStream','qualityQuery','integrationArea','sourceId','sourceTab','integrationQuery','integrationProvider','integrationStatus','integrationCatalogQuery','integrationCatalogCategory'];
function restoreManagerScope() {
  if (typeof window === 'undefined' || window.parent === window) return;
  try {
    const parent = new URL(window.parent.location.href);
    if (!parent.searchParams.has('path')) return;
    const iframe = new URL(window.location.href);
    for (const key of sharedKeys) {
      const value = parent.searchParams.get(key);
      if (value && value.length <= 6000) iframe.searchParams.set(key,value);
    }
    window.history.replaceState(window.history.state,'',iframe);
  } catch { /* Embedding can be cross-origin. */ }
}
restoreManagerScope();
export function registerStorybookRoute(path: string): void {
  const source=cleanProductContextPath(path);
  if (!source) return;
  const iframe=new URL(window.location.href);
  if (iframe.pathname !== '/iframe.html') return;
  const canonical=new URL(source,iframe.origin).pathname;
  const existing=cleanProductContextPath(iframe.searchParams.get('__pdRoute'));
  const current=existing?new URL(existing,iframe.origin).pathname:null;
  if(!current || (current!==canonical&&!current.startsWith(canonical+'/')))
    iframe.searchParams.set('__pdRoute',canonical);
  window.history.replaceState(window.history.state,'',iframe);
}
const stories: Readonly<Record<string, string>> = {
  '/app': 'papadata-business-overview--overview',
  '/app/command-center': 'papadata-business-overview--overview',
  '/app/campaigns/przeglad': 'analiza-kampanie-płatne-całość--overview',
  '/app/campaigns/lista-kampanii': 'analiza-kampanie-płatne-całość--overview',
  '/app/campaigns': 'papadata-campaign-growth--overview',
  '/app/orders': 'papadata-orders-workspace--overview',
  '/app/products': 'papadata-products-workspace--overview',
  '/app/customers': 'analiza-klienci-całość--overview',
  '/app/traffic': 'analiza-ruch-na-stronie-całość--overview',
  '/app/assistant': 'papa-asystent-przebudowa--full-page',
  '/app/reports': 'raporty-zapisane-raporty-całość--library',
  '/app/decisions': 'decyzje-centrum-decyzji-całość--overview',
  '/app/help': 'papadata-help-workspace--overview',
  '/app/integrations': 'papadata-integration-operations--sources',
  '/app/papa': 'raporty-zapisane-raporty-całość--library',
  '/app/integrations/sources': 'papadata-integration-operations--sources',
  '/app/settings': 'papadata-settings-operations--overview',
  '/app/settings/organizacja': 'papadata-settings-operations--organization',
  '/app/data-quality': 'papadata-data-quality-operations--overview',
  '/app/billing': 'papadata-billing-operations--overview',
  '/app/billing/subskrypcja': 'papadata-billing-operations--overview',
  '/app/decisions/centrum-decyzji': 'decyzje-centrum-decyzji-całość--overview',
  '/app/help/strona-glowna-pomocy': 'papadata-help-workspace--overview',
};
export function storybookHref(path: string): string {
  const destination=new URL(path,window.location.origin);
  const commerce=commerceRouteState(destination.pathname);
  if(commerce&&!destination.searchParams.has(commerce.key))destination.searchParams.set(commerce.key,commerce.value);
  const campaignAlias:Readonly<Record<string,string>>={
    '/app/campaigns/atrybucja-i-sprzedaz':'atrybucja',
    '/app/campaigns/kreacje':'kreacje',
    '/app/campaigns/budzet':'budzet',
  };
  if(campaignAlias[destination.pathname]&&!destination.searchParams.has('campaignView'))
    destination.searchParams.set('campaignView',campaignAlias[destination.pathname]!);
  if (destination.origin !== window.location.origin) throw new Error('Story navigation must stay on the current origin.');
  const matching=Object.keys(stories).filter(key => destination.pathname===key || destination.pathname.startsWith(key+'/')).sort((a,b)=>b.length-a.length)[0];
  const story=matching ? stories[matching] : null;
  if (!story) return destination.pathname+destination.search;
  const url=new URL('/iframe.html',window.location.origin);
  url.searchParams.set('id',story);url.searchParams.set('viewMode','story');
  for (const key of sharedKeys) {
    const value=destination.searchParams.get(key);
    if(value && value.length<=6000)url.searchParams.set(key,value);
  }
  url.searchParams.set('__pdRoute',destination.pathname);
  const currentGlobals=new URL(window.location.href).searchParams.get('globals');
  url.searchParams.set('globals',currentGlobals??`theme:${document.documentElement.dataset.theme??'light'};locale:${document.documentElement.dataset.locale??'pl'}`);
  return url.toString();
}
export function navigateStorybook(path:string) {
  const href=storybookHref(path),target=new URL(href,window.location.origin);
  if(window.parent===window || !target.searchParams.has('id')) {window.location.assign(href);return;}
  const manager=new URL(window.parent.location.href);
  manager.searchParams.set('path',`/story/${target.searchParams.get('id')}`);
  for(const key of sharedKeys) {
    const value=target.searchParams.get(key);
    if(value)manager.searchParams.set(key,value);else manager.searchParams.delete(key);
  }
  window.parent.location.assign(manager);
}
// Keep filter changes on refresh/back in the manager, without mutating production routes.
if(typeof window!=='undefined' && window.parent!==window) {
  const synchronize=()=>{
    try {
      const manager=new URL(window.parent.location.href),iframe=new URL(window.location.href);
      if(!manager.searchParams.has('path'))return;
      for(const key of sharedKeys){const v=iframe.searchParams.get(key);if(v)manager.searchParams.set(key,v);else manager.searchParams.delete(key);}
      window.parent.history.replaceState(window.parent.history.state,'',manager);
    }catch{/* Cross-origin access is not required. */}
  };
  window.addEventListener('papadata:navigation',synchronize);
  window.addEventListener('popstate',synchronize);
}
