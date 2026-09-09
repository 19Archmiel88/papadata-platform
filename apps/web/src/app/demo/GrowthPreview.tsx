import { useMemo, useState } from 'react';
import type { GrowthBudgetPlan, GrowthPortfolio } from '@papadata/contracts/campaign-growth';
import { campaignGrowthFixture } from '../../fixtures/paid-campaigns/campaignGrowthFixture';
import { CampaignGrowthScreen, type CampaignGrowthScreenProps } from '../../screens/paid-campaigns/growth/CampaignGrowthScreen';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
/** Preview-only state; no provider operation or production persistence. */
export default function GrowthPreview() {
    const args: CampaignGrowthScreenProps = { data: null, state: 'ready' };
    const { dateRange } = useShellDateRange(), { params } = useProductQuery();
    const fixture = useMemo(() => args.data ?? campaignGrowthFixture(dateRange), [args.data, dateRange.from, dateRange.to, dateRange.timezone]);
    const [saved, setSaved] = useState<readonly GrowthBudgetPlan[]>([]);
    const channel = params.get('channel'), campaign = params.get('campaignId'), currency = params.get('currency');
    const data: GrowthPortfolio = { ...fixture, scope: { ...fixture.scope, provider: channel === 'google_ads' || channel === 'meta_ads' ? channel : null, campaignKey: campaign, currency },
        budgetPlans: [...fixture.budgetPlans.filter(plan => !saved.some(item => item.campaignKey === plan.campaignKey)), ...saved].filter(plan => plan.from === dateRange.from && plan.to === dateRange.to),
        campaigns: fixture.campaigns.filter(row => (!channel || channel === 'all' || channel === row.provider) && (!campaign || campaign === row.id) && (!currency || currency === row.currency)),
        creatives: fixture.creatives.filter(row => (!channel || channel === 'all' || channel === row.provider) && (!campaign || campaign === row.campaignKey) && (!currency || currency === row.currency)),
        observations: fixture.observations.filter(row => (!channel || channel === 'all' || channel === row.provider) && (!campaign || fixture.campaigns.find(item => item.id === campaign)?.campaignId === row.campaignId) && (!currency || currency === row.currency)) };
    return <CampaignGrowthScreen {...args} data={data} demo onSavePlan={async (command) => {
            const current = data.budgetPlans.find(plan => plan.campaignKey === command.campaignKey);
            if ((current?.version ?? 0) !== command.expectedVersion)
                throw new Error('Demo: plan version changed.');
            const next: GrowthBudgetPlan = { ...command, id: current?.id ?? command.requestId, version: command.expectedVersion + 1, target: 'internal_plan', updatedBy: 'demo-owner', updatedAt: new Date().toISOString() };
            setSaved(plans => [...plans.filter(plan => plan.id !== next.id), next]);
            return next;
        }}/>;
}
