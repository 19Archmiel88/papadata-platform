import { useAnalyticsExport } from '../../runtime/shared/data/useAnalyticsExport';
import type { TrafficPortfolio } from '@papadata/contracts';
import { TrafficPortfolioView } from '../../screens/traffic/TrafficPortfolioView';
import { bffClient } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { useRemoteResource } from '../../runtime/shared/data/useRemoteResource';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
export function TrafficPage() {
  const { session } = useAuthSessionRuntimeContext();
  const { dateRange, dateRangeKey } = useShellDateRange();
  const { params } = useProductQuery();
  const scope = `${session?.activeTenantId}:${session?.activeWorkspaceId}:${session?.userId}`;
  const exporter = useAnalyticsExport(scope, dateRange);
  const query = Object.fromEntries(['channel','device','country','compare','sourceId'].flatMap(key => params.get(key) ? [[key, params.get(key)!]] : []));
  const resource = useRemoteResource(`${session?.activeTenantId}:${session?.activeWorkspaceId}:${session?.userId}:${dateRangeKey}:${JSON.stringify(query)}`, async signal => {
    const data = await bffClient.readDomainScreen<{portfolio: TrafficPortfolio}>('/api/v1/traffic/przeglad-ruchu', { dateRange, query, signal });
    if (data?.portfolio?.version !== 'traffic.portfolio.v1') throw new Error('Niezgodna wersja API Ruchu. Wymagany traffic.portfolio.v1.');
    return data.portfolio;
  });
  return <TrafficPortfolioView key={scope} data={resource.data} state={resource.state} problem={resource.problem} onReload={() => void resource.reload()} exportBusy={exporter.busy} exportProblem={exporter.problem}
    onExport={session?.capabilities.includes('analytics.metrics.export') ? (view,context) => exporter.download('traffic',{...query,view,search:context.search,sortBy:context.sort?.columnId,sortDirection:context.sort?.direction,columns:context.columns.join(',')}) : undefined} />;
}
