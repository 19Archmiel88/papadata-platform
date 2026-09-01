import {
  useState,
} from 'react';
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
  ChartInteractionLayer,
} from './ChartInteractionLayer';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const filters = [
  { description: 'Wszystkie kanały', id: 'all', label: 'Wszystkie' },
  { description: 'Tylko płatne', id: 'paid', label: 'Płatne' },
  { description: 'Tylko organiczne', id: 'organic', label: 'Organiczne' },
];

const points = [
  { detail: '18 sie, Google Ads', drillDownLabel: 'Zobacz kampanie', filterId: 'paid', id: 'p1', label: '18 sie', seriesLabel: 'Przychód', valueLabel: '12 840 zł' },
  { detail: '19 sie, Organiczne', filterId: 'organic', id: 'p2', label: '19 sie', seriesLabel: 'Przychód', valueLabel: '9 120 zł' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Wykresy i analityka/ChartInteractionLayer',
  component: ChartInteractionLayer,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof ChartInteractionLayer>;

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
      className="pd-chart-interaction-layer-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

function InteractionDemo() {
  const [activeFilterId, setActiveFilterId] = useState('all');
  const [selectedPointId, setSelectedPointId] = useState('');

  return (
    <ChartInteractionLayer
      activeFilterId={activeFilterId}
      dateRangeLabel={copy({ pl: '1–29 sie 2026', en: 'Aug 1–29, 2026' })}
      description={copy({ pl: 'Kliknij punkt, aby zobaczyć szczegóły i przejść w głąb danych.', en: 'Click a point to see details and drill down.' })}
      filters={filters}
      points={points}
      selectedPointId={selectedPointId}
      title={copy({ pl: 'Przychód wg kanału', en: 'Revenue by channel' })}
      onDrillDown={fn()}
      onFilterChange={setActiveFilterId}
      onPointSelect={setSelectedPointId}
      onReset={() => {
        setActiveFilterId('all');
        setSelectedPointId('');
      }}
    >
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '160px', color: 'var(--pd-text-muted)', fontSize: 'var(--pd-type-size-caption)' }}>
        <Localized pl="Ciało wykresu (TrendChart, ComparisonChart…)" en="Chart body (TrendChart, ComparisonChart…)" />
      </div>
    </ChartInteractionLayer>
  );
}

export const ChartInteractionLayerStory: Story = {
  name: 'ChartInteractionLayer',
  render: () => (
    <StoryPresentationPage
      className="pd-chart-interaction-layer-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry ChartInteractionLayer', en: 'ChartInteractionLayer parameters' })}
          items={[
            { label: <Localized pl="Zakres" en="Scope" />, value: copy({ pl: 'filtry krzyżowe + wybór punktu + drill-down', en: 'cross-filters + point selection + drill-down' }) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="chart-interaction-layer"
      summary={
        <Localized
          pl="Otacza ciało wykresu (przekazane jako children) filtrami, stanem wybranego punktu i akcją przejścia w szczegóły. Nie rysuje samego wykresu — to warstwa interakcji, nie wizualizacji."
          en="Wraps the chart body (passed as children) with filters, selected-point state and a drill-down action. It does not draw the chart itself — this is an interaction layer, not a visualization."
        />
      }
      title={<Localized pl="Interakcja wokół wykresu, nie w środku." en="Interaction around the chart, not inside it." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="interaction-layer-demo">
          <InteractionDemo />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('interaction-layer-demo')).toHaveTextContent('Przychód wg kanału');
    await expect(canvas.getAllByRole('button', { name: filters[1]!.description })).toHaveLength(1);
  },
};
