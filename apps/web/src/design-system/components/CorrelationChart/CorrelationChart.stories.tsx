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
  CorrelationChart,
} from './CorrelationChart';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const points = [
  { id: 'p1', label: '1 sie', x: 1200, y: 8400 },
  { id: 'p2', label: '8 sie', x: 1450, y: 9600 },
  { id: 'p3', label: '15 sie', x: 1380, y: 9100 },
  { id: 'p4', label: '22 sie', role: 'outlier' as const, x: 2200, y: 9300 },
  { id: 'p5', label: '29 sie', role: 'driver-hypothesis' as const, x: 1900, y: 12840 },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Wykresy i analityka/CorrelationChart',
  component: CorrelationChart,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    ariaLabel: 'Zależność wydatku reklamowego od przychodu',
    correlation: 0.78,
    points,
    trendline: true,
    xLabel: 'Wydatek reklamowy (zł)',
    yLabel: 'Przychód (zł)',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['scatter', 'relationship', 'driver-analysis'] },
  },
} satisfies Meta<typeof CorrelationChart>;

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
      className="pd-correlation-chart-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const CorrelationChartStory: Story = {
  name: 'CorrelationChart',
  render: (args) => (
    <StoryPresentationPage
      className="pd-correlation-chart-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry CorrelationChart', en: 'CorrelationChart parameters' })}
          items={[
            { label: <Localized pl="correlation" en="correlation" />, value: '-1…1, null = nieznana' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="correlation-chart"
      summary={
        <Localized
          pl="Zależność dwóch zmiennych — nigdy nie sugeruje przyczynowości silniej, niż na to pozwala evidence. driverHypothesis i evidence.level ograniczają język do tego, co dane naprawdę pokazują."
          en="The relationship between two variables — never implies causation more strongly than evidence allows. driverHypothesis and evidence.level keep the language to what the data actually shows."
        />
      }
      title={<Localized pl="Zależność, opisana ostrożnie." en="A relationship, described carefully." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="correlation-controlled" style={{ height: '320px' }}>
          <CorrelationChart {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Z hipotezą i dowodem" en="With a hypothesis and evidence" />}>
        <div data-testid="correlation-evidence" style={{ height: '320px' }}>
          <CorrelationChart
            ariaLabel={copy({ pl: 'Zależność z hipotezą', en: 'Relationship with a hypothesis' })}
            correlation={0.62}
            driverHypothesis={copy({ pl: 'Wzrost wydatku reklamowego może napędzać przychód, ale nie jest to potwierdzone przyczynowo.', en: 'Higher ad spend may drive revenue, but this is not confirmed as causal.' })}
            evidence={{ description: copy({ pl: 'Oparte na korelacji z ostatnich 90 dni.', en: 'Based on correlation over the last 90 days.' }), label: copy({ pl: 'Hipoteza', en: 'Hypothesis' }), level: 'driver-hypothesis' }}
            points={points}
            trendline
            xLabel={copy({ pl: 'Wydatek reklamowy (zł)', en: 'Ad spend (zł)' })}
            yLabel={copy({ pl: 'Przychód (zł)', en: 'Revenue (zł)' })}
          />
        </div>
      </StorySection>

      <StorySection index="03" title={<Localized pl="Brak korelacji" en="No correlation" />}>
        <div data-testid="correlation-null" style={{ height: '260px' }}>
          <CorrelationChart ariaLabel={copy({ pl: 'Brak wystarczających danych', en: 'Not enough data' })} correlation={null} points={[]} xLabel={copy({ pl: 'X', en: 'X' })} yLabel={copy({ pl: 'Y', en: 'Y' })} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('correlation-controlled')).toBeInTheDocument();
    await expect(canvas.getByTestId('correlation-evidence')).toBeInTheDocument();
    await expect(canvas.getByTestId('correlation-null')).toBeInTheDocument();
  },
};
