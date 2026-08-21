import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  analyticsScreenDefinitions,
  createAnalyticsStorybookData,
} from '../../../screens/analytics';
import type {
  ProductsModuleData,
} from '../../../screens/analytics';
import {
  analyticsModuleStorybookMeta,
} from '../../data/analyticsModuleStorybookMeta';
import {
  ProductsWorkspace,
} from '../../production/AnalyticsDomainWorkspaces';
import {
  ProductionStoryShell,
} from '../../production/ProductionStoryShell';

const meta = {
  title: '33 Produkty/Ekrany produkcyjne',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;
type ScreenId =
  | '33.01'
  | '33.02'
  | '33.03'
  | '33.04'
  | '33.05'
  | '33.06'
  | '33.07'
  | '33.08'
  | '33.09';

const definitions = analyticsScreenDefinitions.filter(
  (definition) => definition.id.startsWith('33.'),
);

function getDefinition(id: ScreenId) {
  const definition = definitions.find((item) => item.id === id);
  if (!definition) throw new Error(`Missing definition for ${id}`);
  return definition;
}

function ModuleStoryPage({ id }: { readonly id: ScreenId }) {
  const definition = getDefinition(id);
  return (
    <ProductionStoryShell
      contract={{
        ...definition,
        documentPath: analyticsModuleStorybookMeta[id].documentPath,
        owner: 'Products',
        sectionId: '33',
        sectionLabel: 'Produkty',
        status: 'runtime + target states',
      }}
    >
      <ProductsWorkspace
        data={createAnalyticsStorybookData(definition) as ProductsModuleData}
        definition={definition}
        mode="storybook"
      />
    </ProductionStoryShell>
  );
}

function createStory(id: ScreenId): Story {
  const definition = getDefinition(id);
  return {
    name: definition.displayTitle,
    render: () => <ModuleStoryPage id={id} />,
    play: async ({ canvasElement }) => {
      const element = canvasElement.querySelector(`[data-screen-id="${id}"]`);
      if (!(element instanceof HTMLElement)) throw new Error(`Screen ${id} is not rendered.`);
      const screen = within(element);
      await expect(screen.getByRole('heading', { level: 1, name: definition.displayTitle })).toBeInTheDocument();
      await expect(screen.getByRole('navigation', { name: 'Widoki produktów' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Co naprawić w katalogu przed kolejną decyzją' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Kolejka merchandisingowa' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: productVariantHeading[definition.variant as keyof typeof productVariantHeading] })).toBeInTheDocument();
      await expect(screen.queryByRole('button', { name: 'Eksportuj widok' })).not.toBeInTheDocument();
      await expect(screen.queryByText('Enterprise BI')).not.toBeInTheDocument();
      await expect(element).toHaveAttribute('data-screen-variant', definition.variant);
    },
  };
}

const productVariantHeading = {
  catalog: 'Katalog produktów i szybkie filtrowanie',
  detail: 'Produkt w kontekście sprzedaży i mapowania',
  gaps: 'Kolejka braków katalogowych',
  impact: 'Wpływ braków produktowych na sprzedaż',
  mapping: 'Jakość mapowania SKU',
  offers: 'Oferty i gotowość ekspozycji produktu',
  overview: 'Produkty według wyniku i ryzyka katalogowego',
  performance: 'Ranking produktów według wyniku i marży',
  variants: 'Stany produkcyjne katalogu',
} as const;

export const Screen33_01Story = {
  ...createStory('33.01'),
  name: '33.01 Przegląd',
} satisfies Story;

export const Screen33_02Story = {
  ...createStory('33.02'),
  name: '33.02 Katalog',
} satisfies Story;

export const Screen33_03Story = {
  ...createStory('33.03'),
  name: '33.03 Szczegóły',
} satisfies Story;

export const Screen33_04Story = {
  ...createStory('33.04'),
  name: '33.04 Mapowanie',
} satisfies Story;

export const Screen33_05Story = {
  ...createStory('33.05'),
  name: '33.05 Oferty',
} satisfies Story;

export const Screen33_06Story = {
  ...createStory('33.06'),
  name: '33.06 Wydajność',
} satisfies Story;

export const Screen33_07Story = {
  ...createStory('33.07'),
  name: '33.07 Kolejka braków',
} satisfies Story;

export const Screen33_08Story = {
  ...createStory('33.08'),
  name: '33.08 Analiza wpływu',
} satisfies Story;

export const Screen33_09Story = {
  ...createStory('33.09'),
  name: '33.09 Warianty produktów',
} satisfies Story;
