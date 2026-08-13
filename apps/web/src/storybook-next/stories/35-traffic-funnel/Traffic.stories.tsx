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
  | '35.08';

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
    <StoryPresentationPage
      headerAside={(
        <StoryPresentationMeta
          ariaLabel='Status ekranu Ruch na stronie i lejek sprzedażowy'
          items={[
            { label: 'Owner', value: 'Traffic' },
            { label: 'Status', value: 'runtime + target states' },
            { label: 'Dokument', value: `docs/specyfikacja-docelowa/${definition.documentPath}` },
          ]}
        />
      )}
      sectionCode='35'
      sectionLabel='Ruch na stronie i lejek sprzedażowy'
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
      await expect(screen.getByRole('navigation', { name: `Widoki: Ruch na stronie i lejek sprzedażowy` })).toBeInTheDocument();
      await expect(screen.queryByRole('button', { name: 'Eksportuj widok' })).not.toBeInTheDocument();
      await expect(screen.queryByText('Enterprise BI')).not.toBeInTheDocument();
      await expect(element).toHaveAttribute('data-analytics-variant', definition.variant);
    },
  };
}

export const Screen35_01Story = createStory('35.01');
export const Screen35_02Story = createStory('35.02');
export const Screen35_03Story = createStory('35.03');
export const Screen35_04Story = createStory('35.04');
export const Screen35_05Story = createStory('35.05');
export const Screen35_06Story = createStory('35.06');
export const Screen35_07Story = createStory('35.07');
export const Screen35_08Story = createStory('35.08');
