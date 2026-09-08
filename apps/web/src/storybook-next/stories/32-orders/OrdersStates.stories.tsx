import { useState } from 'react';
import type { Meta } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { OrdersScreen } from '../../../screens/orders/OrdersScreen';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';
const meta = {
  title: 'ANALIZA/Zamówienia/Stany',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
export const Loading = {
  name: 'Wczytywanie',
  render: () => (
    <StorybookProductShellFrame activePath="/app/orders">
      <OrdersScreen state="loading" />
    </StorybookProductShellFrame>
  ),
};
export const Empty = {
  name: 'Brak danych',
  render: () => (
    <StorybookProductShellFrame activePath="/app/orders">
      <OrdersScreen observations={[]} />
    </StorybookProductShellFrame>
  ),
};
function RetryExample() {
  const [failed, setFailed] = useState(true);
  return <OrdersScreen state={failed ? 'error' : 'ready'} onRetry={() => setFailed(false)} />;
}
export const Error = {
  name: 'Błąd i ponowienie',
  render: () => (
    <StorybookProductShellFrame activePath="/app/orders">
      <RetryExample />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Spróbuj ponownie' }));
    await expect(
      await canvas.findByRole('heading', { name: 'Kolejka realizacji' }),
    ).toBeInTheDocument();
  },
};
