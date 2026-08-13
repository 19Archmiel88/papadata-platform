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
  | '32.07';

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
    <StoryPresentationPage
      headerAside={(
        <StoryPresentationMeta
          ariaLabel='Status ekranu Zamówienia'
          items={[
            { label: 'Owner', value: 'Orders' },
            { label: 'Status', value: 'runtime + target states' },
            { label: 'Dokument', value: `docs/specyfikacja-docelowa/${definition.documentPath}` },
          ]}
        />
      )}
      sectionCode='32'
      sectionLabel='Zamówienia'
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
      await expect(screen.getByRole('navigation', { name: `Widoki: Zamówienia` })).toBeInTheDocument();
      await expect(screen.queryByRole('button', { name: 'Eksportuj widok' })).not.toBeInTheDocument();
      await expect(screen.queryByText('Enterprise BI')).not.toBeInTheDocument();
      await expect(element).toHaveAttribute('data-analytics-variant', definition.variant);
    },
  };
}

export const Screen32_01Story = createStory('32.01');
export const Screen32_02Story = createStory('32.02');
export const Screen32_03Story = createStory('32.03');
export const Screen32_04Story = createStory('32.04');
export const Screen32_05Story = createStory('32.05');
export const Screen32_06Story = createStory('32.06');
export const Screen32_07Story = createStory('32.07');
