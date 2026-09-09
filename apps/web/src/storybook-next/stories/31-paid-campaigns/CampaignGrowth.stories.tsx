import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { campaignGrowthFixture } from '../../../fixtures/paid-campaigns/campaignGrowthFixture';
import { CampaignGrowthScreen, type CampaignGrowthScreenProps } from '../../../screens/paid-campaigns/growth/CampaignGrowthScreen';
import { useShellDateRange } from '../../../runtime/shell/app-shell/ShellDateRangeContext';
import { useProductQuery } from '../../../runtime/app/routing/productRoutes';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';
import type { GrowthBudgetPlan, GrowthPortfolio } from '@papadata/contracts/campaign-growth';
function Scenario(args: CampaignGrowthScreenProps) {
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
                throw new globalThis.Error('Demo: plan version changed.');
            const next: GrowthBudgetPlan = { ...command, id: current?.id ?? command.requestId, version: command.expectedVersion + 1, target: 'internal_plan', updatedBy: 'demo-owner', updatedAt: new Date().toISOString() };
            setSaved(plans => [...plans.filter(plan => plan.id !== next.id), next]);
            return next;
        }}/>;
}
const meta = { id: 'papadata-campaign-growth', title: 'ANALIZA/Kampanie płatne/Analytics Growth', component: CampaignGrowthScreen, parameters: { layout: 'fullscreen' }, args: { data: null, state: 'ready' } } satisfies Meta<typeof CampaignGrowthScreen>;
export default meta;
type Story = StoryObj<typeof meta>;

function renderStory(args: CampaignGrowthScreenProps) {
    return (
        <StorybookProductShellFrame activePath="/app/campaigns">
            <Scenario {...args} />
        </StorybookProductShellFrame>
    );
}

export const Overview: Story = { render: renderStory, name: 'Wynik i kampanie' };
export const Attribution: Story = { render: renderStory, name: 'Atrybucja / perspektywy', args: { initialView: 'atrybucja' } };
export const Creatives: Story = { render: renderStory, name: 'Kreacje / galeria i porównanie', args: { initialView: 'kreacje' } };
export const Budget: Story = { render: renderStory, name: 'Budżet / plan i symulacja', args: { initialView: 'budzet' } };
export const Loading: Story = { render: renderStory, args: { state: 'loading' } };
const emptyFixture = campaignGrowthFixture();
export const Empty: Story = { render: renderStory, args: { data: { ...emptyFixture, campaigns: [], creatives: [], observations: [], attribution: [], budgetPlans: [], scope: { ...emptyFixture.scope, readiness: 'empty' } } } };
export const Error: Story = { render: renderStory, args: { state: 'error', problem: 'Demonstracja: odczyt dostawcy nie powiódł się.' } };
export const Forbidden: Story = { render: renderStory, args: { state: 'forbidden' } };
export const Offline: Story = { render: renderStory, args: { state: 'offline' } };
const staleFixture = campaignGrowthFixture();
export const Stale: Story = { render: renderStory, args: { data: { ...staleFixture, scope: { ...staleFixture.scope, readiness: 'stale', synchronizedAt: '2026-08-01T00:00:00Z' } } } };
