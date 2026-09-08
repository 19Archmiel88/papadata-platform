import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';

import {
  createSubscriptionBillingDemoState,
  subscriptionBillingDemoSeed,
} from '../../../fixtures/subscription-billing/subscriptionBillingDemoSeed';
import {
  SubscriptionBillingScreen,
} from '../../../screens/subscription-billing/SubscriptionBillingScreen';
import type {
  SubscriptionBillingScreenProps,
} from '../../../screens/subscription-billing/SubscriptionBillingScreen.model';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: 'ADMINISTRACJA/Subskrypcja i płatności/Stany',
  component: SubscriptionBillingScreen,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SubscriptionBillingScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

function renderState(args: SubscriptionBillingScreenProps) {
  return (
    <StorybookProductShellFrame activePath="/app/billing/subskrypcja">
      <SubscriptionBillingScreen {...args} />
    </StorybookProductShellFrame>
  );
}

export const Active: Story = {
  name: 'Aktywna',
  args: {
    data: subscriptionBillingDemoSeed,
    state: 'ready',
  },
  render: renderState,
};

export const Trial: Story = {
  name: 'Okres próbny',
  args: {
    data: createSubscriptionBillingDemoState('trial'),
    state: 'ready',
  },
  render: renderState,
};

export const PastDue: Story = {
  name: 'Płatność zaległa',
  args: {
    data: createSubscriptionBillingDemoState('pastDue'),
    state: 'ready',
  },
  render: renderState,
};

export const Cancelled: Story = {
  name: 'Anulowana',
  args: {
    data: createSubscriptionBillingDemoState('cancelled'),
    state: 'ready',
  },
  render: renderState,
};

export const Loading: Story = {
  name: 'Ładowanie',
  args: {
    data: null,
    state: 'loading',
  },
  render: renderState,
};

export const Partial: Story = {
  name: 'Dane częściowe',
  args: {
    data: subscriptionBillingDemoSeed,
    state: 'partial',
  },
  render: renderState,
};

export const ErrorState: Story = {
  name: 'Błąd',
  args: {
    data: null,
    problem: 'Nie udało się połączyć z usługą rozliczeniową.',
    state: 'error',
  },
  render: renderState,
};

export const Forbidden: Story = {
  name: 'Brak dostępu',
  args: {
    data: null,
    state: 'forbidden',
  },
  render: renderState,
};
