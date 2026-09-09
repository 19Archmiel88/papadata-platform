import { useRef, useState } from 'react';
import type { GrowthBudgetCommand, GrowthBudgetPlan, GrowthPortfolio } from '@papadata/contracts/campaign-growth';
import { CampaignGrowthScreen } from '../../screens/paid-campaigns/growth/CampaignGrowthScreen';
import { bffClient } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { useRemoteResource } from '../../runtime/shared/data/useRemoteResource';
import { useAnalyticsExport } from '../../runtime/shared/data/useAnalyticsExport';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
export function CampaignsPage() {
    const runtime = useAuthSessionRuntimeContext(), { dateRange, dateRangeKey } = useShellDateRange(), { params, location } = useProductQuery();
    const scope = `${runtime.session?.activeTenantId}:${runtime.session?.activeWorkspaceId}:${runtime.session?.userId}`;
    const query = Object.fromEntries(['channel', 'campaignId', 'currency'].flatMap(key => params.get(key) ? [[key, params.get(key)!]] : []));
    // Read-only future dates are admitted for planning, never presented as observations.
    const rangeQuery = { ...query, planning: (params.get('campaignView') === 'budzet' || (!params.get('campaignView') && location.split('?')[0]?.endsWith('/budzet'))) ? 'true' : 'false' };
    const key = `${scope}:${dateRangeKey}:${JSON.stringify(rangeQuery)}`;
    const active = useRef(key);
    active.current = key;
    const [warning, setWarning] = useState<string | null>(null);
    const resource = useRemoteResource(key, async (signal) => {
        const portfolio = await bffClient.readDomainScreen<GrowthPortfolio>('/api/v1/campaigns/growth', { dateRange, query: rangeQuery, signal });
        if (portfolio.version !== 'campaigns.growth.v1')
            throw new Error('Unsupported campaign contract version.');
        return portfolio;
    });
    const exporter = useAnalyticsExport(scope, dateRange);
    const save = async (command: GrowthBudgetCommand): Promise<GrowthBudgetPlan> => {
        const response = await runtime.runAuthenticatedCommand(() => bffClient.saveCampaignBudgetPlan(command), location);
        if (active.current !== key)
            throw new Error('The workspace or campaign scope changed during the operation.');
        try {
            const fresh = await bffClient.readDomainScreen<GrowthPortfolio>('/api/v1/campaigns/growth', { dateRange, query: rangeQuery });
            if (active.current !== key)
                throw new Error('The scope changed during the read.');
            resource.replace(fresh);
            setWarning(null);
        }
        catch {
            if (active.current !== key)
                throw new Error('The scope changed. Reopen the current plan.');
            // A persisted response is not converted into a failed mutation after readback failure.
            if (resource.data)
                resource.replace({ ...resource.data, budgetPlans: [...resource.data.budgetPlans.filter(plan => plan.id !== response.plan.id), response.plan], budgetHistory: [response.event, ...resource.data.budgetHistory] });
            setWarning('Plan saved. Readback failed; refresh before making another change. Provider limits were not changed.');
        }
        return response.plan;
    };
    return <>{warning && <p role="status">{warning}</p>}<CampaignGrowthScreen key={scope} data={resource.data} state={resource.state} problem={resource.problem} onReload={() => void resource.reload()} onSavePlan={runtime.session?.capabilities.includes('workspace.manage') ? save : undefined} exportBusy={exporter.busy} exportProblem={exporter.problem} onExport={runtime.session?.capabilities.includes('analytics.metrics.export') ? (view, context) => void exporter.download('campaigns', { ...query, view, columns: context.columns.filter(id => id !== 'compare' && id !== 'sample').join(','), search: context.search, sortBy: context.sort?.columnId, sortDirection: context.sort?.direction,
            format: view === 'creatives' ? params.get('creativeFormat') : null, sample: view === 'creatives' ? params.get('creativeSample') : null }) : undefined}/></>;
}
