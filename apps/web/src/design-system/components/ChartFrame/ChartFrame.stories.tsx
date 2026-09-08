import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  ChartFrame,
} from './ChartFrame';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Wykresy i analityka/ChartFrame',
  component: ChartFrame,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    businessQuestion: 'Czy przychód rośnie zgodnie z planem?',
    freshnessLabel: 'Zaktualizowano 18 min temu',
    rangeLabel: '1–29 sie 2026',
    sourceLabel: 'WooCommerce, Google Ads',
    status: 'ready',
    statusLabel: 'Dane gotowe',
    title: 'Przychód dzienny',
    visualizationLabel: 'Wykres przychodu dziennego',
  },
} satisfies Meta<typeof ChartFrame>;

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
      className="pd-chart-frame-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const placeholderVisualization = (
  <div style={{ display: 'grid', placeItems: 'center', minHeight: '160px', color: 'var(--pd-text-muted)', fontSize: 'var(--pd-type-size-caption)' }}>
    <Localized pl="Ciało wykresu (TrendChart, ComparisonChart…)" en="Chart body (TrendChart, ComparisonChart…)" />
  </div>
);

export const ChartFrameStory: Story = {
  name: 'ChartFrame',
  render: (args) => (
    <StoryPresentationPage
      className="pd-chart-frame-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry ChartFrame', en: 'ChartFrame parameters' })}
          items={[
            { label: <Localized pl="Rola" en="Role" />, value: copy({ pl: 'powłoka wokół ciała wykresu', en: 'shell around the chart body' }) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="chart-frame"
      summary={
        <Localized
          pl="Wspólna powłoka dla każdego wykresu: pytanie biznesowe, status danych, źródło, świeżość i sloty na akcje/legendę/filtry. Ciało wykresu (visualization) przekazujesz jako slot — ChartFrame nie renderuje samego wykresu."
          en="A shared shell for every chart: business question, data status, source, freshness and slots for actions/legend/filters. The chart body (visualization) is passed as a slot — ChartFrame does not render the chart itself."
        />
      }
      title={<Localized pl="Pytanie biznesowe zanim wykres." en="The business question before the chart." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="chart-frame-controlled" style={{ maxWidth: '640px' }}>
          <ChartFrame {...args} visualization={placeholderVisualization} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Stany gotowości danych" en="Data readiness states" />}>
        <div data-testid="chart-frame-states" style={{ display: 'grid', gap: 'var(--pd-space-6)', maxWidth: '640px' }}>
          <ChartFrame businessQuestion={copy({ pl: 'Jak zmienia się ROAS?', en: 'How is ROAS changing?' })} status="loading" statusLabel={copy({ pl: 'Ładowanie…', en: 'Loading…' })} title={copy({ pl: 'ROAS', en: 'ROAS' })} visualizationLabel={copy({ pl: 'Wykres ROAS', en: 'ROAS chart' })} />
          <ChartFrame businessQuestion={copy({ pl: 'Skąd pochodzi ruch?', en: 'Where does traffic come from?' })} status="providerError" statusLabel={copy({ pl: 'Problem providera', en: 'Provider error' })} stateMessage={copy({ pl: 'Meta API nie odpowiada. Ostatnie poprawne dane: 13:42.', en: 'Meta API is not responding. Last valid data: 13:42.' })} title={copy({ pl: 'Kampanie płatne — Meta', en: 'Paid campaigns — Meta' })} visualizationLabel={copy({ pl: 'Wykres kampanii Meta', en: 'Meta campaigns chart' })} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('chart-frame-controlled')).toHaveTextContent('Przychód dzienny');
    await expect(canvas.getByTestId('chart-frame-states').children).toHaveLength(2);
  },
};
