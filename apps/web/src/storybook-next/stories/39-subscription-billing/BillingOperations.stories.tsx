import type { Meta, StoryObj } from '@storybook/react-vite';
import { BillingOperationsDemo } from '../../../fixtures/platform-operations/OperationsScenarios';
import type { OperationsScenarioProps } from '../../../fixtures/platform-operations/OperationsScenarios';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';
// Brak meta.component celowo: BillingOperationsDemo to Storybook-only wrapper
// scenariuszowy (OperationsScenarioProps: initialView/state/empty/readonly/failSave),
// nie realny kontrakt propsów BillingOperationsScreen (data/state/problem/onReload/
// onSession/demo). Wskazanie BillingOperationsScreen jako component sfałszowałoby
// panel Controls — pokazywałby propsy, których żadna story tu nie ustawia.
const meta = { id: 'papadata-billing-operations', title: 'ADMINISTRACJA/Subskrypcja i płatności/Operacje', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
function renderStory(args:OperationsScenarioProps) { return <StorybookProductShellFrame activePath="/app/billing"><BillingOperationsDemo {...args} /></StorybookProductShellFrame>; }
export const Overview: Story = { render: renderStory };
export const Plans: Story = { render: renderStory, args: {initialView:'plans'} };
export const Invoices: Story = { render: renderStory, args: {initialView:'invoices'} };
export const PaymentMethods: Story = { render: renderStory, args: {initialView:'payment'} };
export const Usage: Story = { render: renderStory, args: {initialView:'usage'} };
export const Loading: Story = {render:renderStory,args:{state:'loading'}};
export const Empty: Story = {render:renderStory,args:{empty:true}};
export const ReadOnly: Story = {render:renderStory,args:{readonly:true}};
export const ErrorState: Story = {render:renderStory,args:{state:'error'}};
export const Offline: Story = {render:renderStory,args:{state:'offline'}};
export const Forbidden: Story = {render:renderStory,args:{state:'forbidden'}};
export const SaveFailure: Story = {render:renderStory,args:{failSave:true}};
