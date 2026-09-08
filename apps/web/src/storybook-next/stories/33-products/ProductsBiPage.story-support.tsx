import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import { ProductsScreen } from '../../../screens/products/ProductsScreen';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';
const meta = {
  title: 'INTERNAL STORY SUPPORT/ANALIZA/Produkty',
  component: ProductsScreen,
  parameters: { layout: 'fullscreen', a11y: { test: 'error' } },
} satisfies Meta<typeof ProductsScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
const render = (props: Parameters<typeof ProductsScreen>[0] = {}) => (
  <StorybookProductShellFrame activePath="/app/products">
    <ProductsScreen {...props} />
  </StorybookProductShellFrame>
);
export const Overview: Story = {
  render: () => render(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('heading', { level: 1, name: 'Produkty' }),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByRole('heading', { name: 'Co buduje marżę' }),
    ).toBeInTheDocument();
  },
};
export const Result: Story = {
  render: () => render({ initialView: 'profitability', section: 'result' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Marża z rozliczonym kosztem')).toBeInTheDocument();
    await expect(
      await canvas.findByRole('button', { name: 'Sprawdź brak kosztu' }),
    ).toBeInTheDocument();
  },
};
export const Explorer: Story = {
  render: () => render({ initialView: 'profitability', section: 'explorer' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      await canvas.findByRole('searchbox', { name: 'Szukaj produktu lub SKU' }),
      'RET',
    );
    await expect(await canvas.findByRole('button', { name: /Olejek Retinol/ })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /Serum Glow/ })).not.toBeInTheDocument();
  },
};
export const Portfolio: Story = {
  render: () => render({ initialView: 'portfolio' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: /Bez klasyfikacji/ }));
    await expect(await canvas.findByRole('button', { name: /Olejek Retinol/ })).toBeInTheDocument();
    await userEvent.click(await canvas.findByText('Pokaż wartości i zasady klasyfikacji'));
    await expect(
      await canvas.findByRole('table', { name: 'Segmenty z tej samej tabeli produktów' }),
    ).toBeInTheDocument();
  },
};
export const Inventory: Story = {
  render: () => render({ initialView: 'inventory' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('heading', { name: 'Zapasy i kapitał' }),
    ).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: /^Ryzyko braku / }));
    await expect(await canvas.findByRole('table', { name: 'Tabela zapasów' })).toBeInTheDocument();
  },
};
export const PromotionsAndBasket: Story = {
  render: () => render({ initialView: 'offers' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('heading', { name: 'Promocje i analiza koszyka' }),
    ).toBeInTheDocument();
    await expect(await canvas.findByText('842')).toBeInTheDocument();
  },
};
export const BundleSimulator: Story = {
  render: () => render({ initialView: 'offers' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = await canvas.findByRole('slider', { name: 'Rabat na zestaw' });
    fireEvent.change(slider, { target: { value: '20' } });
    await expect(await canvas.findByText('20%')).toBeInTheDocument();
    await userEvent.selectOptions(await canvas.findByLabelText('Produkt 2'), 'OLK-RET-30');
    await expect(await canvas.findByRole('status')).toHaveTextContent('Wybierz dwa różne produkty');
  },
};
export const Lifecycle: Story = {
  render: () => render({ initialView: 'lifecycle' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('heading', { name: 'Cykl życia produktów' }),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByRole('button', { name: 'Olejek Retinol 0.5% 30ml' }),
    ).toBeInTheDocument();
  },
};
export const PapaSummary: Story = {
  render: () => render({ initialView: 'insights' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('heading', { name: 'Wnioski i dowody' }),
    ).toBeInTheDocument();
    await expect(
      (await canvas.findAllByRole('button', { name: /^Sprawdź / })).length,
    ).toBeGreaterThan(0);
  },
};
export const EvidenceAndRisk: Story = {
  render: () => render({ initialView: 'profitability' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole('button', { name: 'Sprawdź brak kosztu' }));
    const dialog = await body.findByRole('dialog', { name: 'Olejek Retinol 0.5% 30ml' });
    await expect(
      within(dialog).getByText(/Nie przyjmujemy kosztu równego zero/),
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(await canvas.findByRole('button', { name: /^Sprawdź zagrożone SKU/ }));
    await expect(
      await canvas.findByRole('heading', { name: 'Zapasy i kapitał' }),
    ).toBeInTheDocument();
    await expect(await canvas.findByRole('button', { name: /^Ryzyko braku / })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};
