import {
  useState,
} from 'react';
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
import type {
  SubscriptionBillingCycle,
  SubscriptionBillingScreenData,
} from '../../../screens/subscription-billing/SubscriptionBillingScreen.model';
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

function downloadDemoInvoice(data: SubscriptionBillingScreenData, invoiceId: string) {
  const invoice = data.invoices?.find((item) => item.id === invoiceId);
  if (!invoice) return;

  const content = [
    'PapaData — dokument demonstracyjny',
    `Faktura: ${invoice.number}`,
    `Data wystawienia: ${invoice.issuedAt}`,
    `Kwota: ${invoice.amount.amount} ${invoice.amount.currency}`,
    `Status: ${invoice.status}`,
  ].join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${invoice.number.replaceAll('/', '-')}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function InteractiveBillingStory() {
  const [data, setData] = useState<SubscriptionBillingScreenData>(subscriptionBillingDemoSeed);

  function updateCycle(cycle: SubscriptionBillingCycle) {
    setData((current) => {
      const plan = current.plans?.find((item) => item.code === current.currentPlan.code);
      const amount = cycle === 'annual' ? plan?.annualPrice ?? current.subscription.amount : plan?.monthlyPrice ?? current.subscription.amount;
      return {
        ...current,
        billing: current.billing ? { ...current.billing, cycle } : current.billing,
        subscription: { ...current.subscription, amount },
      };
    });
  }

  function updatePlan(planCode: string, cycle: SubscriptionBillingCycle) {
    setData((current) => {
      const plan = current.plans?.find((item) => item.code === planCode);
      if (!plan) return current;
      const amount = cycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
      return {
        ...current,
        currentPlan: {
          ...current.currentPlan,
          code: plan.code,
          monthlyPrice: plan.monthlyPrice,
          name: plan.name,
        },
        subscription: {
          ...current.subscription,
          amount,
          status: 'active',
        },
      };
    });
  }

  return (
    <StorybookProductShellFrame activePath="/app/billing/subskrypcja">
      <SubscriptionBillingScreen
        data={data}
        state="ready"
        onAutoRenewChange={(enabled) => setData((current) => ({
          ...current,
          billing: current.billing ? { ...current.billing, autoRenew: enabled } : current.billing,
        }))}
        onBillingCycleChange={updateCycle}
        onCancelSubscription={() => setData((current) => ({
          ...current,
          billing: current.billing ? { ...current.billing, autoRenew: false } : current.billing,
          subscription: { ...current.subscription, status: 'cancelled' },
        }))}
        onInvoiceDownload={(invoiceId) => downloadDemoInvoice(data, invoiceId)}
        onPaymentMethodChange={() => setData((current) => ({
          ...current,
          billing: current.billing ? {
            ...current.billing,
            paymentMethodLabel: current.billing.paymentMethodLabel?.includes('4242')
              ? 'Mastercard •••• 4444 · ważna do 11/30'
              : 'Visa •••• 4242 · ważna do 08/29',
          } : current.billing,
        }))}
        onPlanChange={updatePlan}
        onReload={() => setData((current) => ({ ...current }))}
      />
    </StorybookProductShellFrame>
  );
}

export const FullPage: Story = {
  name: 'Widok pełny',
  args: {
    data: subscriptionBillingDemoSeed,
    state: 'ready',
  },
  render: () => <InteractiveBillingStory />,
};
