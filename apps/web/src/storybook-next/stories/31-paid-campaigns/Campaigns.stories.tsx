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
  CampaignsModuleData,
} from '../../../screens/analytics';
import {
  CampaignsWorkspace,
} from '../../production/AnalyticsDomainWorkspaces';
import {
  ProductionStoryShell,
} from '../../production/ProductionStoryShell';

const meta = {
  title: '31 Kampanie płatne/Ekrany produkcyjne',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;
type ScreenId =
  | '31.01'
  | '31.02'
  | '31.03'
  | '31.04'
  | '31.05'
  | '31.06'
  | '31.07'
  | '31.08';

const definitions = analyticsScreenDefinitions.filter(
  (definition) => definition.id.startsWith('31.'),
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
        owner: 'Paid Campaigns',
        sectionId: '31',
        sectionLabel: 'Kampanie płatne',
        status: 'runtime + target states',
      }}
    >
      <CampaignsWorkspace
        data={createAnalyticsStorybookData(definition) as CampaignsModuleData}
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
      await expect(screen.getByRole('navigation', { name: 'Widoki kampanii płatnych' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Co zmienić w płatnym ruchu teraz' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Decyzje budżetowe do obsługi' })).toBeInTheDocument();
      await expect(screen.queryByRole('button', { name: 'Eksportuj widok' })).not.toBeInTheDocument();
      await expect(screen.queryByText('Enterprise BI')).not.toBeInTheDocument();
      await expect(element).toHaveAttribute('data-screen-variant', definition.variant);

      if (id === '31.01') {
        await expect(screen.getByRole('heading', { name: 'Portfel kampanii według ryzyka' })).toBeInTheDocument();
        await expect(screen.getByRole('heading', { name: 'Udział kanałów i odpowiedzialność' })).toBeInTheDocument();
      }

      if (id === '31.02') {
        await expect(screen.getByRole('heading', { name: 'Portfel kampanii i szybkie filtrowanie' })).toBeInTheDocument();
      }

      if (id === '31.03') {
        await expect(screen.getByRole('heading', { name: 'Kampania w kontekście budżetu i wyniku' })).toBeInTheDocument();
      }

      if (id === '31.04') {
        await expect(screen.getByRole('heading', { name: 'Wkład źródeł w sprzedaż' })).toBeInTheDocument();
      }

      if (id === '31.05') {
        await expect(screen.getByRole('heading', { name: 'Wykorzystanie budżetu i ryzyko przepalenia' })).toBeInTheDocument();
      }

      if (id === '31.06') {
        await expect(screen.getByRole('heading', { name: 'Blokady danych i kampanii przed decyzją' })).toBeInTheDocument();
      }

      if (id === '31.07') {
        await expect(screen.getByRole('heading', { name: 'Rekomendacje do oceny przez człowieka' })).toBeInTheDocument();
      }

      if (id === '31.08') {
        await expect(screen.getByRole('heading', { name: 'Jak ekran zachowuje się w stanach produkcyjnych' })).toBeInTheDocument();
      }
    },
  };
}

export const Screen31_01Story = {
  ...createStory('31.01'),
  name: '31.01 Przegląd',
} satisfies Story;

export const Screen31_02Story = {
  ...createStory('31.02'),
  name: '31.02 Lista kampanii',
} satisfies Story;

export const Screen31_03Story = {
  ...createStory('31.03'),
  name: '31.03 Szczegóły kampanii',
} satisfies Story;

export const Screen31_04Story = {
  ...createStory('31.04'),
  name: '31.04 Atrybucja i sprzedaż',
} satisfies Story;

export const Screen31_05Story = {
  ...createStory('31.05'),
  name: '31.05 Budżet',
} satisfies Story;

export const Screen31_06Story = {
  ...createStory('31.06'),
  name: '31.06 Diagnostyka',
} satisfies Story;

export const Screen31_07Story = {
  ...createStory('31.07'),
  name: '31.07 Rekomendacje - kontekst domenowy',
} satisfies Story;

export const Screen31_08Story = {
  ...createStory('31.08'),
  name: '31.08 Warianty kampanii',
} satisfies Story;
