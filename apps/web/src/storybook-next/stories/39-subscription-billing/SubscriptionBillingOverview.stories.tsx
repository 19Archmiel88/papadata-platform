import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';

import {
  subscriptionBillingDemoSeed,
} from '../../../fixtures/subscription-billing/subscriptionBillingDemoSeed';
import {
  SubscriptionBillingScreen,
} from '../../../screens/subscription-billing/SubscriptionBillingScreen';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: 'ADMINISTRACJA/Subskrypcja i płatności/Całość',
  component: SubscriptionBillingScreen,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SubscriptionBillingScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FullPage: Story = {
  name: 'Widok pełny',
  args: {
    data: subscriptionBillingDemoSeed,
    state: 'ready',
  },
  render: (args) => (
    <StorybookProductShellFrame activePath="/app/billing/subskrypcja">
      <SubscriptionBillingScreen {...args} />
    </StorybookProductShellFrame>
  ),
};
