import { useState } from 'react';
import type { Meta } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ProductsScreen } from '../../../screens/products/ProductsScreen';
import { productDemoData } from '../../../screens/products/ProductsScreen.data';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';
const meta = {
  title: 'ANALIZA/Produkty/Stany',
  parameters: { layout: 'fullscreen', a11y: { test: 'error' } },
} satisfies Meta;
export default meta;
export const Loading = {
  name: 'Wczytywanie',
  render: () => (
    <StorybookProductShellFrame activePath="/app/products">
      <ProductsScreen state="loading" />
    </StorybookProductShellFrame>
  ),
};
export const Empty = {
  name: 'Brak danych',
  render: () => (
    <StorybookProductShellFrame activePath="/app/products">
      <ProductsScreen data={{ ...productDemoData, products: [], days: [], inventory: [] }} />
    </StorybookProductShellFrame>
  ),
};
export const Partial = {
  name: 'Niepełne obserwacje',
  render: () => (
    <StorybookProductShellFrame activePath="/app/products">
      <ProductsScreen
        data={{
          ...productDemoData,
          days: productDemoData.days.filter((day) => day.date !== '2026-08-12'),
        }}
      />
    </StorybookProductShellFrame>
  ),
};
function RetryExample() {
  const [failed, setFailed] = useState(true);
  return <ProductsScreen state={failed ? 'error' : 'ready'} onRetry={() => setFailed(false)} />;
}
export const Error = {
  name: 'Błąd i ponowienie',
  render: () => (
    <StorybookProductShellFrame activePath="/app/products">
      <RetryExample />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Spróbuj ponownie' }));
    await expect(
      await canvas.findByRole('heading', { name: 'Co buduje marżę' }),
    ).toBeInTheDocument();
  },
};
