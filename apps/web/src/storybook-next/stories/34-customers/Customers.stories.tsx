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
  CustomersModuleData,
} from '../../../screens/analytics';
import {
  analyticsModuleStorybookMeta,
} from '../../data/analyticsModuleStorybookMeta';
import {
  CustomersWorkspace,
} from '../../production/AnalyticsDomainWorkspaces';
import {
  ProductionStoryShell,
} from '../../production/ProductionStoryShell';

const meta = {
  title: '34 Klienci/Ekrany produkcyjne',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;
type ScreenId =
  | '34.01'
  | '34.02'
  | '34.03'
  | '34.04'
  | '34.05'
  | '34.06'
  | '34.07'
  | '34.08';

const definitions = analyticsScreenDefinitions.filter(
  (definition) => definition.id.startsWith('34.'),
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
        owner: 'Customers',
        sectionId: '34',
        sectionLabel: 'Klienci',
        status: 'runtime + target states',
      }}
    >
      <CustomersWorkspace
        data={createAnalyticsStorybookData(definition) as CustomersModuleData}
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
      await expect(screen.getByRole('navigation', { name: 'Widoki klientów' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Co sprawdzić w klientach bez wychodzenia poza prywatność' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Kolejka prywatności i segmentacji' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: customerVariantHeading[definition.variant as keyof typeof customerVariantHeading] })).toBeInTheDocument();
      await expect(screen.queryByRole('button', { name: 'Eksportuj widok' })).not.toBeInTheDocument();
      await expect(screen.queryByText('Enterprise BI')).not.toBeInTheDocument();
      await expect(element).toHaveAttribute('data-screen-variant', definition.variant);
    },
  };
}

const customerVariantHeading = {
  cohorts: 'Retencja M0-M3 i wartość kohort',
  detail: 'Pseudonimizowany szczegół klienta',
  'identity-conflicts': 'Rekordy wymagające decyzji tożsamości',
  impact: 'Wpływ segmentów na sprzedaż i LTV',
  overview: 'Retencja M0-M3 i wartość kohort',
  privacy: 'Stan zgód i ograniczeń danych',
  segments: 'Segmenty bez danych osobowych',
  variants: 'Stany produkcyjne klientów',
} as const;

export const Screen34_01Story = {
  ...createStory('34.01'),
  name: '34.01 Przegląd',
} satisfies Story;

export const Screen34_02Story = {
  ...createStory('34.02'),
  name: '34.02 Segmenty',
} satisfies Story;

export const Screen34_03Story = {
  ...createStory('34.03'),
  name: '34.03 Kohorty',
} satisfies Story;

export const Screen34_04Story = {
  ...createStory('34.04'),
  name: '34.04 Szczegóły pseudonimizowane',
} satisfies Story;

export const Screen34_05Story = {
  ...createStory('34.05'),
  name: '34.05 Konflikty tożsamości',
} satisfies Story;

export const Screen34_06Story = {
  ...createStory('34.06'),
  name: '34.06 Prywatność',
} satisfies Story;

export const Screen34_07Story = {
  ...createStory('34.07'),
  name: '34.07 Analiza wpływu',
} satisfies Story;

export const Screen34_08Story = {
  ...createStory('34.08'),
  name: '34.08 Warianty klientów',
} satisfies Story;
