import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  BusinessScreen,
  businessScreenDefinitions,
  createStorybookBusinessData,
} from '../../../screens/business';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: '30 Centrum Dowodzenia/Ekrany produkcyjne',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type CommandCenterStoryId =
  | '30.01'
  | '30.02'
  | '30.03'
  | '30.04'
  | '30.05'
  | '30.06'
  | '30.07'
  | '30.08'
  | '30.09'
  | '30.10'
  | '30.11'
  | '30.12'
  | '30.13';

const definitions = businessScreenDefinitions.filter(
  (definition) => definition.group === 'command-center',
);

function getDefinition(id: CommandCenterStoryId) {
  const definition = definitions.find((item) => item.id === id);

  if (!definition) {
    throw new Error(`Missing Command Center definition for ${id}`);
  }

  return definition;
}

function CommandCenterStoryPage({
  id,
}: {
  readonly id: CommandCenterStoryId;
}) {
  const definition = getDefinition(id);

  return (
    <StoryPresentationPage
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Status ekranu Command Center"
          items={[
            {
              label: 'Owner',
              value: 'Command Center',
            },
            {
              label: 'Status',
              value: 'production-screen',
            },
            {
              label: 'Dokument',
              value: `docs/specyfikacja-docelowa/${definition.documentPath}`,
            },
          ]}
        />
      )}
      sectionCode="30"
      sectionLabel="Centrum Dowodzenia"
      storyId={definition.id}
      summary={definition.summary}
      title={definition.displayTitle}
    >
      <StoryPresentationSection
        index={definition.id.split('.')[1] ?? '01'}
        layout="full"
        summary="Storybook pokazuje ekran produkcyjny z danymi kontraktowymi fixture; runtime pobiera dane przez BFF."
        title="Ekran produkcyjny"
      >
        <BusinessScreen
          data={createStorybookBusinessData(definition)}
          definition={definition}
          mode="storybook"
        />
      </StoryPresentationSection>
    </StoryPresentationPage>
  );
}

function createStory(id: CommandCenterStoryId): Story {
  const definition = getDefinition(id);

  return {
    name: definition.storyName,
    render: () => (
      <CommandCenterStoryPage id={id} />
    ),
    play: async ({ canvasElement }) => {
      const screenElement = canvasElement.querySelector(
        `[data-screen-id="${id}"]`,
      );

      if (!(screenElement instanceof HTMLElement)) {
        throw new Error(`Command Center screen ${id} is not rendered.`);
      }

      const screen = within(screenElement);

      await expect(
        screen.getByRole('heading', { name: definition.displayTitle }),
      ).toBeInTheDocument();
      await expect(
        screen.getByRole('navigation', { name: 'Widoki Centrum Dowodzenia' }),
      ).toBeInTheDocument();
      await expect(
        screen.queryByRole('button', { name: 'Eksportuj widok' }),
      ).not.toBeInTheDocument();
      await expect(
        screen.queryByText('Enterprise BI'),
      ).not.toBeInTheDocument();
      await expect(
        screenElement,
      ).toHaveAttribute(
        'data-command-center-variant',
        definition.variant,
      );

      if (id === '30.01') {
        await expect(
          screen.getByRole('heading', { name: 'Najważniejsze sygnały' }),
        ).toBeInTheDocument();
        await expect(
          screen.getByRole('heading', { name: 'Najważniejsze wyniki' }),
        ).toBeInTheDocument();
      }

      if (id === '30.10') {
        await expect(
          screen.getByRole('heading', { name: 'Lejek sprzedażowy' }),
        ).toBeInTheDocument();
      }

      if (id === '30.11') {
        await expect(
          screen.getByRole('heading', { name: 'Rekomendacje do oceny' }),
        ).toBeInTheDocument();
      }

      if (id === '30.13') {
        await expect(
          screen.getByRole('heading', { name: 'Składniki zmiany' }),
        ).toBeInTheDocument();
      }
    },
  };
}

export const CommandCenterOverviewStory = createStory('30.01');
export const CommandCenterAttentionQueueStory = createStory('30.02');
export const CommandCenterKpiStory = createStory('30.03');
export const CommandCenterPlanPerformanceStory = createStory('30.04');
export const CommandCenterDriversStory = createStory('30.05');
export const CommandCenterSalesSourcesStory = createStory('30.06');
export const CommandCenterTrafficStory = createStory('30.07');
export const CommandCenterProductsStory = createStory('30.08');
export const CommandCenterCustomersStory = createStory('30.09');
export const CommandCenterFunnelStory = createStory('30.10');
export const CommandCenterRecommendationsStory = createStory('30.11');
export const CommandCenterSalesSignalsStory = createStory('30.12');
export const CommandCenterWaterfallStory = createStory('30.13');
