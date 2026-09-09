import type { Meta, StoryObj } from '@storybook/react-vite';
import { IntegrationOperationsDemo } from '../../../fixtures/platform-operations/IntegrationOperationsDemo';
import type { OperationsScenarioProps } from '../../../fixtures/platform-operations/OperationsScenarios';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';
const meta = { id: 'papadata-integration-operations', title: 'PLATFORMA/Integracje/Operacje', component: IntegrationOperationsDemo, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof IntegrationOperationsDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
function renderStory(args:OperationsScenarioProps) { return <StorybookProductShellFrame activePath="/app/integrations"><IntegrationOperationsDemo {...args} /></StorybookProductShellFrame>; }
export const Sources: Story = { render: renderStory };
export const Catalog: Story = { render: renderStory, args: {initialView:'catalog'} };
export const Loading: Story = {render:renderStory,args:{state:'loading'}};
export const Empty: Story = {render:renderStory,args:{empty:true}};
export const ReadOnly: Story = {render:renderStory,args:{readonly:true}};
export const ErrorState: Story = {render:renderStory,args:{state:'error'}};
export const Offline: Story = {render:renderStory,args:{state:'offline'}};
export const Forbidden: Story = {render:renderStory,args:{state:'forbidden'}};
export const SaveFailure: Story = {render:renderStory,args:{failSave:true}};
