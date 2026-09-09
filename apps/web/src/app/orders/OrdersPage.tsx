import {ordersRouteView} from '../../runtime/app/routing/commerceRoutes';
import type { OrdersPortfolio } from '@papadata/contracts';
import { OrdersWorkspaceScreen } from '../../screens/orders/OrdersWorkspaceScreen';
import { bffClient } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { useRemoteResource } from '../../runtime/shared/data/useRemoteResource';
import { useAnalyticsExport } from '../../runtime/shared/data/useAnalyticsExport';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
export function OrdersPage() {
  const {session}=useAuthSessionRuntimeContext(),{dateRange,dateRangeKey}=useShellDateRange(),{params,location}=useProductQuery();
  const scope=`${session?.activeTenantId}:${session?.activeWorkspaceId}:${session?.userId}`;
  const query=Object.fromEntries(['sourceId','currency'].flatMap(key=>params.get(key)?[[key,params.get(key)!]]:[]));
  const resource=useRemoteResource(`${scope}:${dateRangeKey}:${JSON.stringify(query)}`,async signal=>{
    const data=await bffClient.readDomainScreen<OrdersPortfolio>('/api/v1/commerce/orders',{dateRange,query,signal});
    if(!data?.meta||!Array.isArray(data.records)||!Array.isArray(data.refunds))throw new Error('Niezgodna odpowiedz API Zamowien.');return data;
  });
  const exporter=useAnalyticsExport(scope,dateRange);
  return <OrdersWorkspaceScreen initialView={ordersRouteView(location)} key={scope} data={resource.data} state={resource.state} problem={resource.problem} onReload={()=>void resource.reload()} exportBusy={exporter.busy} exportProblem={exporter.problem}
    onExport={session?.capabilities.includes('analytics.metrics.export')?(view,context)=>exporter.download('orders',{...query,sourceId:resource.data?.meta.sourceId??query.sourceId,currency:resource.data?.meta.currency??query.currency,view,search:context.search,queue:params.get('orderQueue'),sortBy:context.sort?.columnId,direction:context.sort?.direction,columns:context.columns.filter(k=>['number','orderedAt','status','payment','fulfillment','gross','net','discount','currency','externalId','orderId','occurredAt','amount'].includes(k)).join(',')}):undefined}/>;
}
