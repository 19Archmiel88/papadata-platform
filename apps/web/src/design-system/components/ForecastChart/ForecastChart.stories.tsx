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
  ForecastChart,
} from './ForecastChart';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const actual = [
  { label: '1 sie', value: 9800 },
  { label: '8 sie', value: 10400 },
  { label: '15 sie', value: 9600 },
  { label: '22 sie', value: 11200 },
  { label: '29 sie', value: null },
  { label: '5 wrz', value: null },
];

const forecast = [
  { label: '1 sie', value: null },
  { label: '8 sie', value: null },
  { label: '15 sie', value: null },
  { label: '22 sie', value: 11200 },
  { label: '29 sie', value: 11800 },
  { label: '5 wrz', value: 12400 },
];

const lowerBound = [
  { label: '1 sie', value: null },
  { label: '8 sie', value: null },
  { label: '15 sie', value: null },
  { label: '22 sie', value: 11200 },
  { label: '29 sie', value: 10600 },
  { label: '5 wrz', value: 10900 },
];

const upperBound = [
  { label: '1 sie', value: null },
  { label: '8 sie', value: null },
  { label: '15 sie', value: null },
  { label: '22 sie', value: 11200 },
  { label: '29 sie', value: 13000 },
  { label: '5 wrz', value: 13900 },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Wykresy i analityka/ForecastChart',
  component: ForecastChart,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    actual,
    ariaLabel: 'Prognoza przychodu',
    confidence: 0.7,
    forecast,
    horizonLabel: 'Prognoza na 2 tygodnie',
    lowerBound,
    quality: { description: 'Oparta na 90 dniach historii bez istotnych anomalii.', label: 'Wysoka jakość', level: 'high' },
    unit: 'zł',
    upperBound,
  },
} satisfies Meta<typeof ForecastChart>;

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
      className="pd-forecast-chart-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const ForecastChartStory: Story = {
  name: 'ForecastChart',
  render: (args) => (
    <StoryPresentationPage
      className="pd-forecast-chart-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry ForecastChart', en: 'ForecastChart parameters' })}
          items={[
            { label: <Localized pl="quality.level" en="quality.level" />, value: 'high / medium / limited' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="forecast-chart"
      summary={
        <Localized
          pl="Wynik rzeczywisty + prognoza z pasmem niepewności (lowerBound/upperBound) i jawną oceną jakości prognozy. targetValue to płaska linia referencyjna dla jednej znanej wartości — nigdy fabrykowana krzywa celu."
          en="Actual result + forecast with an uncertainty band (lowerBound/upperBound) and an explicit forecast-quality rating. targetValue is a flat reference line for one known value — never a fabricated target curve."
        />
      }
      title={<Localized pl="Prognoza, która przyznaje się do niepewności." en="A forecast that admits its own uncertainty." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="forecast-controlled" style={{ height: '320px' }}>
          <ForecastChart {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Niska jakość / cel" en="Limited quality / target" />}>
        <div data-testid="forecast-limited" style={{ height: '320px' }}>
          <ForecastChart
            actual={actual}
            ariaLabel={copy({ pl: 'Prognoza o ograniczonej jakości', en: 'Limited-quality forecast' })}
            forecast={forecast}
            lowerBound={lowerBound}
            quality={{ description: copy({ pl: 'Za mało historii, aby ufać przedziałowi ufności.', en: 'Not enough history to trust the confidence band.' }), label: copy({ pl: 'Ograniczona jakość', en: 'Limited quality' }), level: 'limited' }}
            targetLabel={copy({ pl: 'Cel kwartalny', en: 'Quarterly target' })}
            targetValue={11000}
            unit="zł"
            upperBound={upperBound}
          />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('forecast-controlled')).toBeInTheDocument();
    await expect(canvas.getByTestId('forecast-limited')).toBeInTheDocument();
  },
};
