import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  IntegrationsWorkspace,
} from '../../runtime/screens/integrations/index';
import {
  createIntegrationsRuntimeFallbackData,
  integrationScreenDefinitions,
} from '../../runtime/screens/integrations/integrationsData';

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

const storyPaths: Record<ScreenId, string> = {
  '40.01': '/app/integrations/sources',
  '40.02': '/app/integrations/add',
  '40.03': '/app/integrations/sources',
  '40.04': '/app/integrations/data-health',
  '40.05': '/app/integrations/data-health',
  '40.06': '/app/integrations/add',
  '40.07': '/app/integrations/sources',
  '40.08': '/app/integrations/sources',
  '40.09': '/app/integrations/sources',
  '40.10': '/app/integrations/data-health',
};

function getDefinition(id: ScreenId) {
  const definition = integrationScreenDefinitions.find((item) => item.id === id);
  if (!definition) throw new Error(`Missing definition for ${id}`);
  return definition;
}

function ModuleStoryPage({
  id,
}: {
  readonly id: ScreenId;
}) {
  return (
    <IntegrationsWorkspace
      definition={getDefinition(id)}
      mode="storybook"
      path={storyPaths[id]}
      runtime={createIntegrationsRuntimeFallbackData()}
      onProviderTest={async (provider) => ({
        canSave: provider.connectable,
        formValidation: {
          fieldErrors: {},
          message: 'Dane mają poprawny format.',
          status: 'passed',
        },
        provider: provider.provider,
        providerTest: {
          message: provider.connectable
            ? 'Połączenie z API dostawcy zostało zwalidowane pomyślnie.'
            : 'Readiness providera blokuje test produkcyjny.',
          status: provider.connectable ? 'passed' : 'failed',
        },
      })}
    />
  );
}

function createStory(id: ScreenId): Story {
  return {
    render: () => <ModuleStoryPage id={id} />,
    play: async ({ canvasElement }) => {
      const screen = within(canvasElement);
      await expect(screen.getByRole('heading', { level: 1, name: 'Integracje i Jakość Danych' })).toBeInTheDocument();
      await expect(screen.getByRole('navigation', { name: 'Tabs' })).toBeInTheDocument();
      if (storyPaths[id].endsWith('/add')) {
        await expect(screen.getByText('Rekomendowana Ścieżka Integracji PapaData')).toBeInTheDocument();
        await expect(screen.getAllByRole('button', { name: 'Połącz' })[0]).toBeInTheDocument();
      } else if (storyPaths[id].endsWith('/data-health')) {
        await expect(screen.getByRole('heading', { name: 'Gotowość Obszarów Biznesowych' })).toBeInTheDocument();
        await expect(screen.getByRole('table', { name: 'Historia pobrań danych' })).toBeInTheDocument();
      } else {
        await expect(screen.getByRole('table', { name: 'Źródła danych i jakość danych' })).toBeInTheDocument();
        await expect(screen.getAllByRole('button', { name: /Napraw/u })[0]).toBeInTheDocument();
      }
    },
  };
}

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
