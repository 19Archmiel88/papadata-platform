import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  AnalyticsModuleWorkspace,
  analyticsScreenDefinitions,
  createAnalyticsStorybookData,
} from '../../../screens/analytics';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';

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
  | '34.07';

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
    <StoryPresentationPage
      headerAside={(
        <StoryPresentationMeta
          ariaLabel='Status ekranu Klienci'
          items={[
            { label: 'Owner', value: 'Customers' },
            { label: 'Status', value: 'runtime + target states' },
            { label: 'Dokument', value: `docs/specyfikacja-docelowa/${definition.documentPath}` },
          ]}
        />
      )}
      sectionCode='34'
      sectionLabel='Klienci'
      storyId={definition.id}
      summary={definition.summary}
      title={definition.displayTitle}
    >
      <StoryPresentationSection
        index={definition.id.split('.')[1] ?? '01'}
        layout="full"
        summary="Widok używa lokalnych danych kontraktowych Storybooka; runtime pobiera ten sam kształt przez BFF."
        title="Ekran produkcyjny"
      >
        <AnalyticsModuleWorkspace
          data={createAnalyticsStorybookData(definition)}
          definition={definition}
          mode="storybook"
          path={definition.requiresResourceId ? `${definition.routeBase}/storybook-resource` : definition.routeBase}
        />
      </StoryPresentationSection>
    </StoryPresentationPage>
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
      await expect(screen.getByRole('heading', { name: definition.displayTitle })).toBeInTheDocument();
      await expect(screen.getByRole('navigation', { name: `Widoki: Klienci` })).toBeInTheDocument();
      await expect(screen.queryByRole('button', { name: 'Eksportuj widok' })).not.toBeInTheDocument();
      await expect(screen.queryByText('Enterprise BI')).not.toBeInTheDocument();
      await expect(element).toHaveAttribute('data-analytics-variant', definition.variant);
    },
  };
}

export const Screen34_01Story = createStory('34.01');
export const Screen34_02Story = createStory('34.02');
export const Screen34_03Story = createStory('34.03');
export const Screen34_04Story = createStory('34.04');
export const Screen34_05Story = createStory('34.05');
export const Screen34_06Story = createStory('34.06');
export const Screen34_07Story = createStory('34.07');
