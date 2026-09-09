import {productsRouteView} from '../../runtime/app/routing/commerceRoutes';
import type { ProductPortfolio } from '@papadata/contracts';
import { ProductsWorkspaceScreen } from '../../screens/products/ProductsWorkspaceScreen';
import { bffClient } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { useRemoteResource } from '../../runtime/shared/data/useRemoteResource';
import { useAnalyticsExport } from '../../runtime/shared/data/useAnalyticsExport';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
export function ProductsPage() {
  const {session}=useAuthSessionRuntimeContext(),{dateRange,dateRangeKey}=useShellDateRange(),{params,location}=useProductQuery();
  const scope=`${session?.activeTenantId}:${session?.activeWorkspaceId}:${session?.userId}`;
  const query=Object.fromEntries(['sourceId','currency','inventoryAsOf'].flatMap(key=>params.get(key)?[[key,params.get(key)!]]:[]));
  const resource=useRemoteResource(`${scope}:${dateRangeKey}:${JSON.stringify(query)}`,async signal=>{
    const data=await bffClient.readDomainScreen<ProductPortfolio>('/api/v1/commerce/products',{dateRange,query,signal});
    if(!data?.meta||data.inventoryMode!=='last_retained_observation'||!Array.isArray(data.records))throw new Error('Niezgodna odpowiedz API Produktow.');return data;
  });
  const exporter=useAnalyticsExport(scope,dateRange);
  return <ProductsWorkspaceScreen initialView={productsRouteView(location)} key={scope} data={resource.data} state={resource.state} problem={resource.problem} onReload={()=>void resource.reload()} exportBusy={exporter.busy} exportProblem={exporter.problem}
    onExport={session?.capabilities.includes('analytics.metrics.export')?context=>exporter.download('products',{...query,sourceId:resource.data?.meta.sourceId??query.sourceId,currency:resource.data?.meta.currency??query.currency,inventoryAsOf:resource.data?.inventoryAsOf??query.inventoryAsOf,search:context.search,category:params.get('productCategory'),filter:params.get('productFilter'),sortBy:context.sort?.columnId,direction:context.sort?.direction,columns:context.columns.filter(k=>['sku','name','category','gross','net','units','margin','quantity','observedAt','currency'].includes(k)).join(',')}):undefined}/>;
}
