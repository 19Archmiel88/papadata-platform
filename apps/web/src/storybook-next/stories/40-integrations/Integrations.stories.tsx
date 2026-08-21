import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  createIntegrationsStorybookData,
  integrationScreenDefinitions,
} from '../../../screens/integrations';
import {
  integrationsScreenStorybookMeta,
} from '../../data/integrationsScreenStorybookMeta';
import {
  IntegrationsProductWorkspace,
} from '../../production/OperationalDomainWorkspaces';
import {
  ProductionStoryShell,
} from '../../production/ProductionStoryShell';

const meta = {
  title: '40 Integracje i synchronizacja/Ekrany produkcyjne',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;
type ScreenId =
  | '40.01'
  | '40.02'
  | '40.03'
  | '40.04'
  | '40.05'
  | '40.06'
  | '40.07'
  | '40.08'
  | '40.09'
  | '40.10';

const definitions = integrationScreenDefinitions;

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
        documentPath: integrationsScreenStorybookMeta[id].documentPath,
        owner: 'Integrations',
        sectionId: '40',
        sectionLabel: 'Integracje i synchronizacja',
      }}
    >
      <IntegrationsProductWorkspace
        data={createIntegrationsStorybookData(definition)}
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
      await expect(screen.getByRole('navigation', { name: 'Widoki integracji' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Co trzeba sprawdzić w integracjach teraz' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Kolejka integracji do obsługi' })).toBeInTheDocument();
      await expect(screen.getAllByRole('heading', { level: 2, name: integrationVariantHeading[definition.variant] })[0]).toBeInTheDocument();
      await expect(element).toHaveAttribute('data-screen-variant', definition.variant);
      if (definition.variant === 'detail') {
        await expect(screen.getByRole('heading', { level: 3, name: 'Shopify Orders' })).toBeInTheDocument();
      } else if (definition.variant === 'catalog') {
        await expect(screen.getByRole('table', { name: /Integracje i synchronizacja/u })).toBeInTheDocument();
      }
    },
  };
}

const integrationVariantHeading = {
  catalog: 'Źródła danych według świeżości i błędów',
  connect: 'Kreator połączenia bez uruchamiania OAuth',
  detail: 'Integracja, zakres danych i ostatnie zdarzenia',
  disconnect: 'Skutki odłączenia przed operacją destrukcyjną',
  history: 'Historia synchronizacji',
  'provider-outage': 'Źródła dotknięte awarią providera',
  reconnect: 'Ponowne połączenie bez mutacji tokenu',
  scope: 'Zakres synchronizacji i wpływ na produkt',
  'sync-run': 'Przebieg synchronizacji krok po kroku',
  variants: 'Stany produkcyjne integracji',
} as const;

export const Screen40_01Story = {
  ...createStory('40.01'),
  name: '40.01 Katalog integracji',
} satisfies Story;

export const Screen40_02Story = {
  ...createStory('40.02'),
  name: '40.02 Kreator połączenia',
} satisfies Story;

export const Screen40_03Story = {
  ...createStory('40.03'),
  name: '40.03 Szczegóły integracji',
} satisfies Story;

export const Screen40_04Story = {
  ...createStory('40.04'),
  name: '40.04 Historia synchronizacji',
} satisfies Story;

export const Screen40_05Story = {
  ...createStory('40.05'),
  name: '40.05 Przebieg synchronizacji',
} satisfies Story;

export const Screen40_06Story = {
  ...createStory('40.06'),
  name: '40.06 Zakres synchronizacji',
} satisfies Story;

export const Screen40_07Story = {
  ...createStory('40.07'),
  name: '40.07 Ponowne połączenie',
} satisfies Story;

export const Screen40_08Story = {
  ...createStory('40.08'),
  name: '40.08 Odłączenie',
} satisfies Story;

export const Screen40_09Story = {
  ...createStory('40.09'),
  name: '40.09 Awaria providera',
} satisfies Story;

export const Screen40_10Story = {
  ...createStory('40.10'),
  name: '40.10 Warianty integracji',
} satisfies Story;
