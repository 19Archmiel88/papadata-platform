import type { BusinessOverview } from '@papadata/contracts';
import { BusinessOverviewScreen } from '../../screens/command-center/BusinessOverviewScreen';
import { bffClient } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { useRemoteResource } from '../../runtime/shared/data/useRemoteResource';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
export function CommandCenterPage() {
  const {session}=useAuthSessionRuntimeContext(),{dateRange,dateRangeKey}=useShellDateRange(),{params}=useProductQuery();
  const scope=`${session?.activeTenantId}:${session?.activeWorkspaceId}:${session?.userId}`;
  const query=Object.fromEntries(['sourceId','currency','compare'].flatMap(key=>params.get(key)?[[key,params.get(key)!]]:[]));
  const resource=useRemoteResource(`${scope}:${dateRangeKey}:${JSON.stringify(query)}`,async signal=>{
    const data=await bffClient.readDomainScreen<BusinessOverview>('/api/v1/overview/business',{dateRange,query,signal});
    if(data?.version!=='business.overview.v1')throw new Error('Niezgodna wersja modelu Centrum Dowodzenia.');return data;
  });
  return <BusinessOverviewScreen key={scope} data={resource.data} state={resource.state} problem={resource.problem} onReload={()=>void resource.reload()}/>;
}
