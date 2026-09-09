import { useAnalyticsExport } from '../../runtime/shared/data/useAnalyticsExport';
import { CustomerPortfolioView } from '../../screens/customers/CustomerPortfolioView';
import { bffClient } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { useRemoteResource } from '../../runtime/shared/data/useRemoteResource';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
import { customerQuery, loadCustomerDetail, loadCustomerPortfolio } from './customersRuntimeAdapter';

export function CustomersPage() {
  const runtime = useAuthSessionRuntimeContext();
  const { dateRange, dateRangeKey } = useShellDateRange();
  const { params } = useProductQuery();
  const session = runtime.session;
  const scope = `${session?.activeTenantId}:${session?.activeWorkspaceId}:${session?.userId}`;
  const exporter = useAnalyticsExport(scope, dateRange);
  const query = JSON.stringify(customerQuery(params));
  const resource = useRemoteResource(`${scope}:${dateRangeKey}:${query}`, signal => loadCustomerPortfolio(bffClient, dateRange, params, signal));
  const selectedId = params.get('customerId');
  const canReadDetail = session?.capabilities.includes('privacy.audit.read') ?? false;
  const detail = useRemoteResource(`${scope}:${dateRangeKey}:${selectedId}:${canReadDetail}`, signal =>
    selectedId && canReadDetail ? loadCustomerDetail(bffClient, dateRange, selectedId, signal) : Promise.resolve(null));
  return <CustomerPortfolioView key={scope} data={resource.data} state={resource.state} problem={resource.problem} onReload={() => void resource.reload()}
    detail={detail.data} detailState={detail.state} detailProblem={detail.problem} canReadDetail={canReadDetail} exportBusy={exporter.busy} exportProblem={exporter.problem}
    onExport={session?.capabilities.includes('analytics.metrics.export') ? context => exporter.download('customers', { ...customerQuery(params), columns:context.columns.join(','), cursor:null }) : undefined} />;
}
