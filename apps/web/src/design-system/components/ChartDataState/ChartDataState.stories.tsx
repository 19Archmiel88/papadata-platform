import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  within,
} from 'storybook/test';

import {
  ChartDataState,
} from './ChartDataState';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Wykresy i analityka/ChartDataState',
  component: ChartDataState,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    state: 'empty',
  },
} satisfies Meta<typeof ChartDataState>;

export default meta;

type Story = StoryObj<typeof meta>;


function StorySection({
  children,
  index,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly index: string;
  readonly summary?: ReactNode;
  readonly title: ReactNode;
}) {
  return (
    <StoryPresentationSection
      className="pd-chart-data-state-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const states = ['loading', 'empty', 'noData', 'partial', 'stale', 'blocked', 'error', 'unavailable', 'delayed'] as const;

export const ChartDataStateStory: Story = {
  name: 'ChartDataState',
  render: (args) => (
    <StoryPresentationPage
      className="pd-chart-data-state-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry ChartDataState', en: 'ChartDataState parameters' })}
          items={[
            { label: <Localized pl="Stany" en="States" />, value: String(states.length) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="chart-data-state"
      summary={
        <Localized
          pl="Zajmuje miejsce ciała wykresu, gdy nie ma czego rysować — z domyślnym tekstem dla każdego z 10 stanów AnalyticsDataState (poza ready/processing/conflict, które chart pokazuje inaczej)."
          en="Occupies the chart body's place when there is nothing to draw — with default copy for each of the 10 AnalyticsDataState values (besides ready/processing/conflict, which the chart handles differently)."
        />
      }
      title={<Localized pl="Miejsce wykresu, kiedy nie ma wykresu." en="Where the chart goes when there is no chart." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="chart-data-state-controlled" style={{ maxWidth: '480px' }}>
          <ChartDataState {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Wszystkie stany" en="All states" />}>
        <div className="pd-f0-icon-groups" data-testid="chart-data-state-all">
          {states.map((state) => (
            <article key={state}>
              <h3><code>{state}</code></h3>
              <div>
                <ChartDataState state={state} />
              </div>
            </article>
          ))}
        </div>
      </StorySection>

      <StorySection index="03" title={<Localized pl="Z akcją" en="With an action" />}>
        <div data-testid="chart-data-state-action" style={{ maxWidth: '480px' }}>
          <ChartDataState action={{ label: copy({ pl: 'Połącz źródło', en: 'Connect source' }), onAction: fn() }} state="empty" />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('chart-data-state-controlled')).toBeInTheDocument();
    await expect(canvas.getByTestId('chart-data-state-all').children).toHaveLength(states.length);
    await expect(canvas.getByTestId('chart-data-state-action')).toBeInTheDocument();
  },
};
