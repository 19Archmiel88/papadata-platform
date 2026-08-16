import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  DecisionsWorkspace,
  createDecisionsStorybookData,
  decisionsScreenDefinitions,
} from '../../../screens/decisions';
import type {
  DecisionsScreenDefinition,
} from '../../../screens/decisions';
import {
  ProductionStoryShell,
} from '../../production/ProductionStoryShell';

const meta = {
  title: '80 Decyzje, działania i pomiar/Ekrany produkcyjne',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;
type ScreenId = DecisionsScreenDefinition['id'];

function getDefinition(id: ScreenId) {
  const definition = decisionsScreenDefinitions.find((item) => item.id === id);
  if (!definition) throw new Error(`Missing definition for ${id}`);
  return definition;
}

function ModuleStoryPage({ id }: { readonly id: ScreenId }) {
  const definition = getDefinition(id);

  return (
    <ProductionStoryShell
      contract={{
        ...definition,
        owner: 'Decyzje i działania',
        sectionId: '80',
        sectionLabel: 'Decyzje, działania i pomiar',
      }}
    >
      <DecisionsWorkspace
        data={createDecisionsStorybookData()}
        definition={definition}
        mode="storybook"
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
      await expect(screen.getByRole('navigation', { name: 'Widoki decyzji i działań' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Co trzeba rozstrzygnąć teraz' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Kolejka decyzji marketingowych' })).toBeInTheDocument();
      await expect(element).toHaveAttribute('data-screen-variant', definition.variant);
    },
  };
}

export const Screen80_01Story = { ...createStory('80.01'), name: '80.01 Centrum decyzji' } satisfies Story;
export const Screen80_02Story = { ...createStory('80.02'), name: '80.02 Obserwacje' } satisfies Story;
export const Screen80_03Story = { ...createStory('80.03'), name: '80.03 Rekomendacje' } satisfies Story;
export const Screen80_04Story = { ...createStory('80.04'), name: '80.04 Rejestr decyzji' } satisfies Story;
export const Screen80_05Story = { ...createStory('80.05'), name: '80.05 Brief działania' } satisfies Story;
export const Screen80_06Story = { ...createStory('80.06'), name: '80.06 Szczegóły działania' } satisfies Story;
export const Screen80_07Story = { ...createStory('80.07'), name: '80.07 Pomiar' } satisfies Story;
export const Screen80_08Story = { ...createStory('80.08'), name: '80.08 Biblioteka działań' } satisfies Story;
export const Screen80_09Story = { ...createStory('80.09'), name: '80.09 Powiązania' } satisfies Story;
export const Screen80_10Story = { ...createStory('80.10'), name: '80.10 Warianty decyzji' } satisfies Story;
