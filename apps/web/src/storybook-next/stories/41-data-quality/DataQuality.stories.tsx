import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  createDataQualityStorybookData,
  dataQualityScreenDefinitions,
} from '../../../screens/data-quality';
import {
  DataQualityProductWorkspace,
} from '../../production/OperationalDomainWorkspaces';
import {
  ProductionStoryShell,
} from '../../production/ProductionStoryShell';

const meta = {
  title: '41 Jakość danych i integralność/Ekrany produkcyjne',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;
type ScreenId =
  | '41.01'
  | '41.02'
  | '41.03'
  | '41.04'
  | '41.05'
  | '41.06'
  | '41.07'
  | '41.08'
  | '41.09'
  | '41.10';

const definitions = dataQualityScreenDefinitions;
const variantHeading = {
  conflicts: 'Konflikty źródeł do rozstrzygnięcia',
  dataset: 'Rejestr zbiorów danych',
  lineage: 'Pochodzenie danych i transformacje',
  'manual-review': 'Przegląd ręczny rekordów',
  'quality-center': 'Zbiory danych według gotowości',
  reconciliation: 'Rekoncyliacja źródeł',
  reprocessing: 'Ponowne przetwarzanie bez uruchamiania zadania',
  'source-overlap': 'Nakładanie źródeł według pola',
  'source-priority': 'Priorytet źródeł dla pól krytycznych',
  variants: 'Stany produkcyjne jakości danych',
} satisfies Record<(typeof definitions)[number]['variant'], string>;

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
        owner: 'Jakość danych',
        sectionId: '41',
        sectionLabel: 'Jakość danych i integralność',
      }}
    >
      <DataQualityProductWorkspace
        data={createDataQualityStorybookData(definition)}
        definition={definition}
      />
    </ProductionStoryShell>
  );
}

function createStory(id: ScreenId): Story {
  const definition = getDefinition(id);

  return {
    render: () => <ModuleStoryPage id={id} />,
    play: async ({ canvasElement }) => {
      const element = canvasElement.querySelector(`[data-screen-id="${id}"]`);
      if (!(element instanceof HTMLElement)) throw new Error(`Screen ${id} is not rendered.`);
      const screen = within(element);
      await expect(screen.getByRole('heading', { level: 1, name: definition.displayTitle })).toBeInTheDocument();
      await expect(screen.getByRole('navigation', { name: 'Widoki jakości danych' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Co trzeba sprawdzić w jakości danych teraz' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Kolejka decyzji jakości danych' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: variantHeading[definition.variant] })).toBeInTheDocument();
      await expect(element).toHaveAttribute('data-screen-variant', definition.variant);

      if (definition.variant === 'source-overlap' || definition.variant === 'source-priority') {
        await expect(screen.getByRole('table', { name: /Reguły jakości źródeł/u })).toBeInTheDocument();
      } else if (definition.variant === 'conflicts') {
        await expect(screen.getByRole('table', { name: /Konflikty jakości danych/u })).toBeInTheDocument();
      } else if (definition.variant === 'manual-review') {
        await expect(screen.getByRole('table', { name: /Kolejka ręcznego przeglądu/u })).toBeInTheDocument();
      } else if (definition.variant === 'dataset' || definition.variant === 'quality-center') {
        await expect(screen.getByRole('table', { name: /Zbiory jakości danych/u })).toBeInTheDocument();
      }
    },
  };
}

export const Screen41_01Story = {
  ...createStory('41.01'),
  name: '41.01 Centrum jakości',
} satisfies Story;

export const Screen41_02Story = {
  ...createStory('41.02'),
  name: '41.02 Zbiór danych',
} satisfies Story;

export const Screen41_03Story = {
  ...createStory('41.03'),
  name: '41.03 Pochodzenie danych',
} satisfies Story;

export const Screen41_04Story = {
  ...createStory('41.04'),
  name: '41.04 Nakładanie źródeł',
} satisfies Story;

export const Screen41_05Story = {
  ...createStory('41.05'),
  name: '41.05 Nadrzędność źródła',
} satisfies Story;

export const Screen41_06Story = {
  ...createStory('41.06'),
  name: '41.06 Konflikty',
} satisfies Story;

export const Screen41_07Story = {
  ...createStory('41.07'),
  name: '41.07 Przegląd ręczny',
} satisfies Story;

export const Screen41_08Story = {
  ...createStory('41.08'),
  name: '41.08 Ponowne przetwarzanie',
} satisfies Story;

export const Screen41_09Story = {
  ...createStory('41.09'),
  name: '41.09 Rekoncyliacja',
} satisfies Story;

export const Screen41_10Story = {
  ...createStory('41.10'),
  name: '41.10 Warianty jakości danych',
} satisfies Story;
