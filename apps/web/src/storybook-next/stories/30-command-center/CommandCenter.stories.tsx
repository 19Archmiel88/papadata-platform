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
import {
  ProductionStoryShell,
} from '../../production/ProductionStoryShell';

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
  | '30.13'
  | '30.14';

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
    <ProductionStoryShell
      canvasSummary="Storybook pokazuje ekran produkcyjny z danymi kontraktowymi fixture; runtime pobiera dane przez BFF."
      contract={{
        ...definition,
        owner: 'Command Center',
        sectionId: '30',
        sectionLabel: 'Centrum Dowodzenia',
        status: 'production-screen',
      }}
    >
      <BusinessScreen
        data={createStorybookBusinessData(definition)}
        definition={definition}
        mode="storybook"
      />
    </ProductionStoryShell>
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
        screen.getByRole('heading', { level: 1, name: definition.displayTitle }),
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
          screen.getByRole('heading', { name: 'Co wymaga decyzji teraz' }),
        ).toBeInTheDocument();
        await expect(
          screen.getByRole('heading', { name: 'Decyzje do obsłużenia' }),
        ).toBeInTheDocument();
        await expect(
          screen.getByRole('heading', { name: 'Rejestr operacyjny' }),
        ).toBeInTheDocument();
      }

      if (id === '30.02') {
        await expect(
          screen.getByRole('heading', { name: 'Kolejka reakcji według wpływu' }),
        ).toBeInTheDocument();
      }

      if (id === '30.03') {
        await expect(
          screen.getByRole('heading', { name: 'Rejestr KPI' }),
        ).toBeInTheDocument();
        // Below 860px the spec swaps the table for a card list, so the register
        // is asserted in whichever representation the viewport exposes.
        const kpiTable = screen.queryByRole('table', {
          name: 'Rejestr KPI — Centrum Dowodzenia',
        });
        const kpiMobileList = screen.queryByRole('list', {
          name: 'Rejestr KPI — lista mobilna',
        });

        await expect(kpiTable ?? kpiMobileList).toBeInTheDocument();
      }

      if (id === '30.04') {
        await expect(
          screen.getByRole('heading', { name: 'Wartości planu i wykonania' }),
        ).toBeInTheDocument();
      }

      if (id === '30.05') {
        await expect(
          screen.getByRole('heading', { name: 'Metryki źródłowe' }),
        ).toBeInTheDocument();
      }

      if (id === '30.06') {
        await expect(
          screen.getByRole('heading', { name: 'Wyniki według źródeł' }),
        ).toBeInTheDocument();
      }

      if (id === '30.07') {
        await expect(
          screen.getByRole('heading', { name: 'Ruch i jakość danych' }),
        ).toBeInTheDocument();
      }

      if (id === '30.08') {
        await expect(
          screen.getByRole('heading', { name: 'Kondycja katalogu i bestsellerów' }),
        ).toBeInTheDocument();
        await expect(
          screen.getByRole('heading', { name: 'Kondycja produktów' }),
        ).toBeInTheDocument();
      }

      if (id === '30.09') {
        await expect(
          screen.getByRole('heading', { name: 'Segmenty i retencja' }),
        ).toBeInTheDocument();
        await expect(
          screen.getByRole('heading', { name: 'Kondycja klientów' }),
        ).toBeInTheDocument();
        // Privacy notice required by spec (PII masking)
        await expect(
          screen.getByText('Prywatność klientów'),
        ).toBeInTheDocument();
      }

      if (id === '30.12') {
        await expect(
          screen.getByRole('heading', { name: 'Sygnały do oceny' }),
        ).toBeInTheDocument();
      }

      if (id === '30.10') {
        await expect(
          screen.getByRole('heading', { name: 'Lejek sprzedażowy i największy odpływ' }),
        ).toBeInTheDocument();
        await expect(
          screen.getByText('Największa strata'),
        ).toBeInTheDocument();
      }

      if (id === '30.11') {
        await expect(
          screen.getByRole('heading', { name: 'Rekomendacje do oceny' }),
        ).toBeInTheDocument();
      }

      if (id === '30.13') {
        await expect(
          screen.getByRole('heading', { name: 'Składniki zmiany i narracja planu' }),
        ).toBeInTheDocument();
      }

      if (id === '30.14') {
        await expect(
          screen.getByRole('heading', { name: 'Jak ekran zachowuje się w stanach produkcyjnych' }),
        ).toBeInTheDocument();
      }
    },
  };
}

export const CommandCenterOverviewStory = {
  ...createStory('30.01'),
  name: '30.01 Widok główny',
} satisfies Story;

export const CommandCenterAttentionQueueStory = {
  ...createStory('30.02'),
  name: '30.02 Kolejka uwagi',
} satisfies Story;

export const CommandCenterKpiStory = {
  ...createStory('30.03'),
  name: '30.03 KPI',
} satisfies Story;

export const CommandCenterPlanPerformanceStory = {
  ...createStory('30.04'),
  name: '30.04 Plan vs wynik',
} satisfies Story;

export const CommandCenterDriversStory = {
  ...createStory('30.05'),
  name: '30.05 Drivery wyniku',
} satisfies Story;

export const CommandCenterSalesSourcesStory = {
  ...createStory('30.06'),
  name: '30.06 Źródła sprzedaży',
} satisfies Story;

export const CommandCenterTrafficStory = {
  ...createStory('30.07'),
  name: '30.07 Ruch',
} satisfies Story;

export const CommandCenterProductsStory = {
  ...createStory('30.08'),
  name: '30.08 Produkty',
} satisfies Story;

export const CommandCenterCustomersStory = {
  ...createStory('30.09'),
  name: '30.09 Klienci',
} satisfies Story;

export const CommandCenterFunnelStory = {
  ...createStory('30.10'),
  name: '30.10 Lejek',
} satisfies Story;

export const CommandCenterRecommendationsStory = {
  ...createStory('30.11'),
  name: '30.11 Rekomendacje AI',
} satisfies Story;

export const CommandCenterSalesSignalsStory = {
  ...createStory('30.12'),
  name: '30.12 Sygnały sprzedażowe',
} satisfies Story;

export const CommandCenterWaterfallStory = {
  ...createStory('30.13'),
  name: '30.13 Waterfall',
} satisfies Story;

export const CommandCenterVariantsStory = {
  ...createStory('30.14'),
  name: '30.14 Warianty Centrum Dowodzenia',
} satisfies Story;
