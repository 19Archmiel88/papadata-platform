import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  ReactNode,
} from 'react';
import {
  expect,
  fireEvent,
  userEvent,
  within,
} from 'storybook/test';

import {
  ProductAbcXyzMatrix,
  ProductAiInsightAudit,
  ProductBundleSimulator,
  ProductExplorer,
  ProductInventoryCapital,
  ProductLifecyclePortfolio,
  ProductPromotionsAndBasket,
  ProductResultSection,
  ProductsBiPage,
} from './ProductsBiPage';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: '33 Produkty',
  component: ProductsBiPage,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ProductsBiPage>;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryFrame({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-pbi">
      <div className="pd-pbi__content">
        {children}
      </div>
    </main>
  );
}

export const Overview: Story = {
  name: 'Całość',
  render: () => (
    <StorybookProductShellFrame activePath="/app/products">
      <ProductsBiPage />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Wynik produktowy' })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Eksplorator produktów' })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Symulator zestawów' })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Podsumowanie Papa AI' })).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: 'Pokaż 7 zagrożonych SKU' }));
    await expect((await canvas.findAllByText('SER-C-30')).length).toBeGreaterThan(0);
    await expect((await canvas.findAllByText('ZST-HC-REPAIR')).length).toBeGreaterThan(0);
  },
};

export const Result: Story = {
  name: 'Wynik produktowy',
  render: () => (
    <StoryFrame>
      <ProductResultSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Wynik produktowy' })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: '3 strategiczne SKU klasy AX wyprzedadzą się przed dostawą dostawcy' })).toBeInTheDocument();
    await expect(await canvas.findByText('1 450 200 zł')).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Wolumen (szt.)' }));
    await expect(await canvas.findByRole('img', { name: 'Wykres trendu: Wolumen (szt.)' })).toBeInTheDocument();
  },
};

export const Explorer: Story = {
  name: 'Eksplorator produktów',
  render: () => (
    <StoryFrame>
      <ProductExplorer />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Eksplorator produktów' })).toBeInTheDocument();
    await userEvent.type(await canvas.findByRole('searchbox', { name: 'Szukaj nazwy SKU lub kodu' }), 'RET');
    await expect(await canvas.findByText('OLK-RET-30')).toBeInTheDocument();
    await expect(canvas.queryByText('SER-C-30')).not.toBeInTheDocument();
  },
};

export const Portfolio: Story = {
  name: 'Portfolio produktów',
  render: () => (
    <StoryFrame>
      <ProductAbcXyzMatrix />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Portfolio produktów' })).toBeInTheDocument();
    await expect(await canvas.findByRole('button', { name: /AX/i })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Przełącz na widok tabeli A11y' }));
    await expect(await canvas.findByText('Tabela Dostępności (A11y) — Podsumowanie Segmentów ABC/XYZ')).toBeInTheDocument();
  },
};

export const Inventory: Story = {
  name: 'Zapasy i kapitał',
  render: () => (
    <StoryFrame>
      <ProductInventoryCapital />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Zapasy i kapitał' })).toBeInTheDocument();
    await expect(await canvas.findByText('38 400 zł zamrożonego kapitału')).toBeInTheDocument();
  },
};

export const PromotionsAndBasket: Story = {
  name: 'Promocje i koszyk',
  render: () => (
    <StoryFrame>
      <ProductPromotionsAndBasket />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Promocje i koszyk' })).toBeInTheDocument();
    await expect(await canvas.findByText("Serum Glow C 30ml (Oferta Lato '26)")).toBeInTheDocument();
    await expect(await canvas.findByText('Lift: 2.3x')).toBeInTheDocument();
  },
};

export const BundleSimulator: Story = {
  name: 'Symulator zestawów',
  render: () => (
    <StoryFrame>
      <ProductBundleSimulator />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Symulator zestawów' })).toBeInTheDocument();
    const discountSlider = await canvas.findByRole('slider');
    fireEvent.change(discountSlider, { target: { value: '20' } });
    await expect(await canvas.findByText('Rabat na zestaw bundle (%):')).toBeInTheDocument();
    await expect(await canvas.findByText('20%')).toBeInTheDocument();
  },
};

export const Lifecycle: Story = {
  name: 'Cykl życia produktów',
  render: () => (
    <StoryFrame>
      <ProductLifecyclePortfolio />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Cykl życia produktów' })).toBeInTheDocument();
    await expect(await canvas.findByText('Olejek Retinol 0.5%')).toBeInTheDocument();
  },
};

export const PapaSummary: Story = {
  name: 'Podsumowanie Papa AI',
  render: () => (
    <StoryFrame>
      <ProductAiInsightAudit />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Podsumowanie Papa AI' })).toBeInTheDocument();
    await expect(await canvas.findByText('SKU SER-C-30 ma 8 dni pokrycia.')).toBeInTheDocument();
  },
};

export const PapaAiInteractions: Story = {
  name: 'Interakcje Papa AI',
  render: () => (
    <StorybookProductShellFrame activePath="/app/products">
      <ProductsBiPage />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const badges = await canvas.findAllByRole('button', { name: /Pomiar/ });
    await userEvent.click(badges[0]);
    await expect(await canvas.findByRole('dialog', { name: 'Provenance danych produktów' })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Zamknij provenance' }));

    const detailButtons = await canvas.findAllByRole('button', { name: 'Szczegóły' });
    await userEvent.click(detailButtons[0]);
    await expect(await canvas.findByRole('dialog', { name: 'SKU Detail Drawer' })).toBeInTheDocument();
    await expect(await canvas.findByText('Historia Ceny Sprzedaży & Rabatu')).toBeInTheDocument();
  },
};
