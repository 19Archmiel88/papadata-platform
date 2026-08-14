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
  OrdersModuleData,
} from '../../../screens/analytics';
import {
  OrdersWorkspace,
} from '../../production/AnalyticsDomainWorkspaces';
import {
  ProductionStoryShell,
} from '../../production/ProductionStoryShell';

const meta = {
  title: '32 Zamówienia/Ekrany produkcyjne',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;
type ScreenId =
  | '32.01'
  | '32.02'
  | '32.03'
  | '32.04'
  | '32.05'
  | '32.06'
  | '32.07'
  | '32.08';

const definitions = analyticsScreenDefinitions.filter(
  (definition) => definition.id.startsWith('32.'),
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
        owner: 'Orders',
        sectionId: '32',
        sectionLabel: 'Zamówienia',
        status: 'runtime + target states',
      }}
    >
      <OrdersWorkspace
        data={createAnalyticsStorybookData(definition) as OrdersModuleData}
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
      await expect(screen.getByRole('navigation', { name: 'Widoki zamówień' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Co trzeba obsłużyć w zamówieniach teraz' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Kolejka obsługi zamówień' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: orderVariantHeading[definition.variant as keyof typeof orderVariantHeading] })).toBeInTheDocument();
      await expect(screen.queryByRole('button', { name: 'Eksportuj widok' })).not.toBeInTheDocument();
      await expect(screen.queryByText('Enterprise BI')).not.toBeInTheDocument();
      await expect(element).toHaveAttribute('data-screen-variant', definition.variant);
    },
  };
}

const orderVariantHeading = {
  detail: 'Zamówienie bez ujawniania danych poza kontraktem',
  export: 'Pakiet eksportu bez uruchamiania operacji pobrania',
  list: 'Rejestr operacyjny zamówień',
  overview: 'Obsługa zamówień według ryzyka',
  reconciliation: 'Skrót zgodności zamówień i źródeł',
  'source-comparison': 'Wartość i ryzyko według źródła zamówień',
  timeline: 'Chronologia zamówień i statusów',
  variants: 'Stany produkcyjne zamówień',
} as const;

export const Screen32_01Story = {
  ...createStory('32.01'),
  name: '32.01 Przegląd',
} satisfies Story;

export const Screen32_02Story = {
  ...createStory('32.02'),
  name: '32.02 Lista',
} satisfies Story;

export const Screen32_03Story = {
  ...createStory('32.03'),
  name: '32.03 Szczegóły',
} satisfies Story;

export const Screen32_04Story = {
  ...createStory('32.04'),
  name: '32.04 Oś zdarzeń',
} satisfies Story;

export const Screen32_05Story = {
  ...createStory('32.05'),
  name: '32.05 Porównanie źródeł',
} satisfies Story;

export const Screen32_06Story = {
  ...createStory('32.06'),
  name: '32.06 Rekoncyliacja - skrót',
} satisfies Story;

export const Screen32_07Story = {
  ...createStory('32.07'),
  name: '32.07 Eksport',
} satisfies Story;

export const Screen32_08Story = {
  ...createStory('32.08'),
  name: '32.08 Warianty zamówień',
} satisfies Story;
