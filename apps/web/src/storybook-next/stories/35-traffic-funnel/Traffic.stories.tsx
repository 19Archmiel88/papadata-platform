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
  TrafficModuleData,
} from '../../../screens/analytics';
import {
  analyticsModuleStorybookMeta,
} from '../../data/analyticsModuleStorybookMeta';
import {
  TrafficWorkspace,
} from '../../production/AnalyticsDomainWorkspaces';
import {
  ProductionStoryShell,
} from '../../production/ProductionStoryShell';

const meta = {
  title: '35 Ruch na stronie i lejek sprzedażowy/Ekrany produkcyjne',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;
type ScreenId =
  | '35.01'
  | '35.02'
  | '35.03'
  | '35.04'
  | '35.05'
  | '35.06'
  | '35.07'
  | '35.08'
  | '35.09';

const definitions = analyticsScreenDefinitions.filter(
  (definition) => definition.id.startsWith('35.'),
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
        owner: 'Traffic',
        sectionId: '35',
        sectionLabel: 'Ruch na stronie i lejek sprzedażowy',
        status: 'runtime + target states',
      }}
    >
      <TrafficWorkspace
        data={createAnalyticsStorybookData(definition) as TrafficModuleData}
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
      await expect(screen.getByRole('navigation', { name: 'Widoki ruchu i lejka' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Co sprawdzić w ruchu przed interpretacją sprzedaży' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Kolejka analityki ruchu' })).toBeInTheDocument();
      await expect(screen.getAllByRole('heading', {
        level: definition.variant === 'event-quality' || definition.variant === 'landing-pages' ? 3 : 2,
        name: trafficVariantHeading[definition.variant as keyof typeof trafficVariantHeading],
      })[0]).toBeInTheDocument();
      await expect(screen.queryByRole('button', { name: 'Eksportuj widok' })).not.toBeInTheDocument();
      await expect(screen.queryByText('Enterprise BI')).not.toBeInTheDocument();
      await expect(element).toHaveAttribute('data-screen-variant', definition.variant);
    },
  };
}

const trafficVariantHeading = {
  channels: 'Kanały według ruchu, konwersji i przychodu',
  'event-quality': 'Diagnostyka',
  funnel: 'Mapa ścieżki i jakość zdarzeń',
  'funnel-definitions': 'Kontraktowe definicje lejka',
  'funnel-step': 'Szczegół najsłabszego kroku',
  'ga4-orders': 'Spójność ruchu z warstwą zamówień',
  'landing-pages': 'Strony wejścia',
  overview: 'Mapa ścieżki i jakość zdarzeń',
  variants: 'Stany produkcyjne ruchu i lejka',
} as const;

export const Screen35_01Story = {
  ...createStory('35.01'),
  name: '35.01 Przegląd ruchu',
} satisfies Story;

export const Screen35_02Story = {
  ...createStory('35.02'),
  name: '35.02 Kanały',
} satisfies Story;

export const Screen35_03Story = {
  ...createStory('35.03'),
  name: '35.03 Lejek - widok',
} satisfies Story;

export const Screen35_04Story = {
  ...createStory('35.04'),
  name: '35.04 Lejek - szczegóły kroku',
} satisfies Story;

export const Screen35_05Story = {
  ...createStory('35.05'),
  name: '35.05 Definicje lejka',
} satisfies Story;

export const Screen35_06Story = {
  ...createStory('35.06'),
  name: '35.06 GA4 vs zamówienia',
} satisfies Story;

export const Screen35_07Story = {
  ...createStory('35.07'),
  name: '35.07 Jakość zdarzeń',
} satisfies Story;

export const Screen35_08Story = {
  ...createStory('35.08'),
  name: '35.08 Strony wejścia',
} satisfies Story;

export const Screen35_09Story = {
  ...createStory('35.09'),
  name: '35.09 Warianty ruchu',
} satisfies Story;
