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
  title: '30 Centrum Dowodzenia/One-page runtime',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const onePageDefinition = businessScreenDefinitions.find(
  (definition) => definition.group === 'command-center' && definition.id === '30.01',
);

if (!onePageDefinition) {
  throw new Error('Missing Command Center definition for 30.01');
}

const definition = onePageDefinition;

/**
 * The runtime one-page is what `/app/command-center` actually renders. It is a
 * different composition from the storybook per-screen renderer, so it needs its
 * own coverage — the 30.01–30.14 stories cannot reach this DOM.
 */
export const CommandCenterOnePageStory: Story = {
  name: '30.00 Centrum Dowodzenia — one-page',
  render: () => (
    <ProductionStoryShell
      canvasSummary="Runtime one-page: pasek dowodzenia, sekcje z kotwicami i pełny rejestr. Storybook używa danych fixture."
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
        mode="runtime"
      />
    </ProductionStoryShell>
  ),
  play: async ({ canvasElement }) => {
    const screenElement = canvasElement.querySelector(
      '[data-screen-id="30.01"]',
    );

    if (!(screenElement instanceof HTMLElement)) {
      throw new Error('Command Center one-page is not rendered.');
    }

    const screen = within(screenElement);

    await expect(screenElement).toHaveAttribute('data-mode', 'runtime');

    // The runtime CSS layer is keyed on this class; without it the section rail,
    // separators and hero surface silently fall back to unstyled defaults.
    await expect(screenElement).toHaveClass('pd-command-center-one-page');

    // KPI section — hero + 2×2 priority surface per spec 30.03.
    await expect(
      screen.getByRole('heading', { name: 'Najważniejsze kafelki do analizy' }),
    ).toBeInTheDocument();
    // DataStatusBanner is a required domain component for screens 30.01–30.13.
    await expect(
      screen.getByRole('heading', { name: 'Status danych' }),
    ).toBeInTheDocument();
    await expect(
      screen.getByRole('list', { name: 'Najważniejsze KPI po przychodzie' }),
    ).toBeInTheDocument();

    // MorningBrief is a required domain component for section 30.
    await expect(
      screen.getByRole('heading', { name: 'Najważniejsze sygnały' }),
    ).toBeInTheDocument();

    // Command bar replaces PageHeader in runtime and must keep both actions.
    await expect(
      screen.getByRole('button', { name: 'Raport Papa' }),
    ).toBeInTheDocument();

    // Every navigable section must exist as a scroll anchor.
    for (const anchorId of [
      'command-section-kpi',
      'command-section-plan',
      'command-section-sales-costs',
      'command-section-traffic-sources',
      'command-section-customers',
      'command-section-products',
      'command-section-funnel',
      'command-section-recommendations',
      'command-section-records',
    ]) {
      await expect(
        screenElement.querySelector(`#${anchorId}`),
      ).toBeInstanceOf(HTMLElement);
    }
  },
};
