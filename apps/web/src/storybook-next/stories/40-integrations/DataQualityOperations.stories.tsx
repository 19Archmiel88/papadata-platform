import type { Meta, StoryObj } from '@storybook/react-vite';
import { QualityOperationsDemo } from '../../../fixtures/platform-operations/OperationsScenarios';
import type { OperationsScenarioProps } from '../../../fixtures/platform-operations/OperationsScenarios';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';
const meta = { id: 'papadata-data-quality-operations', title: 'PLATFORMA/Jakosc danych/Operacje', component: QualityOperationsDemo, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof QualityOperationsDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
function renderStory(args:OperationsScenarioProps) { return <StorybookProductShellFrame activePath="/app/data-quality"><QualityOperationsDemo {...args} /></StorybookProductShellFrame>; }
export const Overview: Story = { render: renderStory };
export const Lineage: Story = { render: renderStory, args: {initialView:'lineage'} };
export const Reconciliation: Story = { render: renderStory, args: {initialView:'reconciliation'} };
export const SourcePolicy: Story = { render: renderStory, args: {initialView:'sources'} };
export const Loading: Story = {render:renderStory,args:{state:'loading'}};
export const Empty: Story = {render:renderStory,args:{empty:true}};
export const ReadOnly: Story = {render:renderStory,args:{readonly:true}};
export const ErrorState: Story = {render:renderStory,args:{state:'error'}};
export const Offline: Story = {render:renderStory,args:{state:'offline'}};
export const Forbidden: Story = {render:renderStory,args:{state:'forbidden'}};
export const SaveFailure: Story = {render:renderStory,args:{failSave:true}};
