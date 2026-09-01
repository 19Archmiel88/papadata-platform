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
  TrendChart,
} from './TrendChart';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const data = [
  { actual: 9800, label: '1 sie', plan: 9500, previousPeriod: 8900 },
  { actual: 10400, label: '8 sie', plan: 9700, previousPeriod: 9100 },
  { actual: 9600, label: '15 sie', plan: 9900, previousPeriod: 9300 },
  { actual: 11200, label: '22 sie', plan: 10100, previousPeriod: 9500 },
  { actual: 12840, label: '29 sie', plan: 10300, previousPeriod: 9800 },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Wykresy i analityka/TrendChart',
  component: TrendChart,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    ariaLabel: 'Przychód dzienny w czasie',
    data,
    unit: 'zł',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['line', 'area'] },
  },
} satisfies Meta<typeof TrendChart>;

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
      className="pd-trend-chart-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const TrendChartStory: Story = {
  name: 'TrendChart',
  render: (args) => (
    <StoryPresentationPage
      className="pd-trend-chart-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry TrendChart', en: 'TrendChart parameters' })}
          items={[
            { label: <Localized pl="Serie" en="Series" />, value: 'actual / plan / previousPeriod / movingAverage' },
            { label: <Localized pl="Warianty" en="Variants" />, value: 'line / area' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="trend-chart"
      summary={
        <Localized
          pl="Wynik w czasie na tle planu i poprzedniego okresu — dzienny/tygodniowy przychód, ROAS, ruch. Renderuj wewnątrz ChartFrame, nie samodzielnie na ekranie."
          en="A result over time against plan and the previous period — daily/weekly revenue, ROAS, traffic. Render inside ChartFrame, not standalone on a screen."
        />
      }
      title={<Localized pl="Wynik na tle planu, w czasie." en="A result against plan, over time." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany (line)" en="Controlled (line)" />}>
        <div data-testid="trend-line" style={{ height: '280px' }}>
          <TrendChart {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Wariant area" en="Area variant" />}>
        <div data-testid="trend-area" style={{ height: '280px' }}>
          <TrendChart ariaLabel={copy({ pl: 'Przychód, wariant obszarowy', en: 'Revenue, area variant' })} data={data} unit="zł" variant="area" />
        </div>
      </StorySection>

      <StorySection index="03" title={<Localized pl="Puste dane" en="Empty data" />}>
        <div data-testid="trend-empty" style={{ height: '220px' }}>
          <TrendChart ariaLabel={copy({ pl: 'Brak danych trendu', en: 'No trend data' })} data={[]} unit="zł" />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('trend-line')).toBeInTheDocument();
    await expect(canvas.getByTestId('trend-area')).toBeInTheDocument();
    await expect(canvas.getByTestId('trend-empty')).toBeInTheDocument();
  },
};
