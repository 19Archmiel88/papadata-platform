import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import {
  ComparisonChart,
  ShareChart,
  TrendChart,
} from '../../../design-system/components';
import type {
  ComparisonChartDatum,
  ComparisonChartSeries,
  ShareChartSegment,
  TrendChartDatum,
} from '../../../design-system/components';
import type {
  PapaDataRuntimeLocale,
} from '../../../design-system/foundations';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import {
  AnalyticsChartSurface,
  Localized,
  readAnalyticsLocale as readLocale,
  Story15Page,
} from './analytics-story-helpers';
import './interactive-chart-contract.css';

const trendData: readonly TrendChartDatum[] = [
  { actual: 118, label: '20.08', movingAverage: 115, plan: 116, previousPeriod: 108 },
  { actual: 126, label: '21.08', movingAverage: 119, plan: 118, previousPeriod: 110 },
  { actual: 133, label: '22.08', movingAverage: 123, plan: 121, previousPeriod: 114 },
  { actual: 129, label: '23.08', movingAverage: 126, plan: 123, previousPeriod: 117 },
  { actual: 141, label: '24.08', movingAverage: 132, plan: 126, previousPeriod: 119 },
  { actual: 148, label: '25.08', movingAverage: 139, plan: 129, previousPeriod: 122 },
  { actual: 153, label: '26.08', movingAverage: 146, plan: 132, previousPeriod: 126 },
];

const comparisonData: readonly ComparisonChartDatum[] = [
  { id: 'search', label: 'Search', values: { current: 153000, previous: 126000 } },
  { id: 'meta', label: 'Meta', values: { current: 98000, previous: 107000 } },
  { id: 'direct', label: 'Direct', values: { current: 72000, previous: 68000 } },
  { id: 'email', label: 'E-mail', values: { current: 51000, previous: 42000 } },
];

const comparisonSeries: readonly ComparisonChartSeries[] = [
  { key: 'current', label: 'Bieżący okres' },
  { key: 'previous', label: 'Poprzedni okres' },
];

const shareSegments: readonly ShareChartSegment[] = [
  { id: 'search', label: 'Search', percent: 42, value: 153000 },
  { id: 'meta', label: 'Meta', percent: 27, value: 98000 },
  { id: 'direct', label: 'Direct', percent: 19, value: 72000 },
  { id: 'email', label: 'E-mail', percent: 12, value: 51000 },
];

function formatCurrency(value: number, locale: PapaDataRuntimeLocale): string {
  return new Intl.NumberFormat(
    locale === 'en' ? 'en-GB' : 'pl-PL',
    {
      currency: 'PLN',
      maximumFractionDigits: 0,
      style: 'currency',
    },
  ).format(value);
}

function formatPercent(value: number, locale: PapaDataRuntimeLocale): string {
  return new Intl.NumberFormat(
    locale === 'en' ? 'en-GB' : 'pl-PL',
    {
      maximumFractionDigits: 1,
      style: 'percent',
    },
  ).format(value / 100);
}

function InteractiveChartContractDemo() {
  const locale = readLocale();

  return (
    <div className="pd-chart-contract-story__grid">
      <AnalyticsChartSurface
        businessQuestion={{
          en: 'Is revenue pacing above plan?',
          pl: 'Czy tempo przychodu jest powyżej planu?',
        }}
        description={{
          en: 'Line, plan, previous period and moving average share the same legend contract.',
          pl: 'Linia, plan, poprzedni okres i średnia krocząca korzystają z tego samego kontraktu legendy.',
        }}
        rangeLabel={{
          en: '20-26 Aug',
          pl: '20-26 sie',
        }}
        sourceLabel="ChartLegend + TrendChart"
        title={{
          en: 'Trend with shared series controls',
          pl: 'Trend ze wspólną kontrolą serii',
        }}
        visualizationLabel={{
          en: 'Revenue trend',
          pl: 'Trend przychodu',
        }}
      >
        <TrendChart
          ariaLabel={
            locale === 'en'
              ? 'Revenue trend with plan and previous period'
              : 'Trend przychodu z planem i poprzednim okresem'
          }
          data={trendData}
          labels={{
            actual: locale === 'en' ? 'Result' : 'Wynik',
            legend: locale === 'en' ? 'Chart series' : 'Serie wykresu',
            movingAverage: locale === 'en' ? 'Moving average' : 'Średnia krocząca',
            plan: locale === 'en' ? 'Plan' : 'Plan',
            previousPeriod: locale === 'en' ? 'Previous period' : 'Poprzedni okres',
          }}
          unit="PLN"
          valueFormatter={(value) => formatCurrency(value, locale)}
          variant="area"
        />
      </AnalyticsChartSurface>

      <div className="pd-chart-contract-story__split">
        <AnalyticsChartSurface
          businessQuestion={{
            en: 'Which channel changed the result?',
            pl: 'Który kanał zmienił wynik?',
          }}
          description={{
            en: 'Grouped bars use the same legend affordance as the line chart.',
            pl: 'Słupki grupowane używają tego samego zachowania legendy co wykres liniowy.',
          }}
          rangeLabel={{
            en: '20-26 Aug',
            pl: '20-26 sie',
          }}
          sourceLabel="ChartLegend + ComparisonChart"
          title={{
            en: 'Channel comparison',
            pl: 'Porównanie kanałów',
          }}
          visualizationLabel={{
            en: 'Grouped channel revenue',
            pl: 'Przychód kanałów w grupach',
          }}
        >
          <ComparisonChart
            ariaLabel={
              locale === 'en'
                ? 'Grouped channel revenue comparison'
                : 'Porównanie przychodu kanałów'
            }
            benchmark={{
              label: locale === 'en' ? 'Target' : 'Cel',
              value: 90000,
            }}
            data={comparisonData}
            labels={{
              legend: locale === 'en' ? 'Chart series' : 'Serie wykresu',
            }}
            series={comparisonSeries.map((series) => ({
              ...series,
              label: locale === 'en'
                ? series.label.replace('Bieżący okres', 'Current period').replace('Poprzedni okres', 'Previous period')
                : series.label,
            }))}
            unit="PLN"
            valueFormatter={(value) => formatCurrency(value, locale)}
            variant="grouped"
            visualStyle="vivid"
          />
        </AnalyticsChartSurface>

        <AnalyticsChartSurface
          businessQuestion={{
            en: 'How is revenue distributed?',
            pl: 'Jak rozkłada się przychód?',
          }}
          description={{
            en: 'The donut shares the same legend component and hides segments by id.',
            pl: 'Donut używa tego samego komponentu legendy i ukrywa segmenty po id.',
          }}
          rangeLabel={{
            en: '20-26 Aug',
            pl: '20-26 sie',
          }}
          sourceLabel="ChartLegend + ShareChart"
          title={{
            en: 'Revenue share',
            pl: 'Udział przychodu',
          }}
          visualizationLabel={{
            en: 'Revenue share by channel',
            pl: 'Udział przychodu według kanału',
          }}
        >
          <ShareChart
            ariaLabel={
              locale === 'en'
                ? 'Revenue share by channel'
                : 'Udział przychodu według kanału'
            }
            display="donut"
            labels={{
              legend: locale === 'en' ? 'Segments' : 'Segmenty',
              total: locale === 'en' ? 'Total' : 'Razem',
            }}
            percentFormatter={(value) => formatPercent(value, locale)}
            segments={shareSegments}
            total={374000}
            valueFormatter={(value) => formatCurrency(value, locale)}
          />
        </AnalyticsChartSurface>
      </div>
    </div>
  );
}

const meta = {
  title: '15 Wykresy i dane/03 Interakcje/Wspolny kontrakt wykresow',
  component: TrendChart,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Historia pokazuje jeden kontrakt interakcji serii dla wykresu liniowego, slupkowego i udzialowego.',
      },
    },
  },
} satisfies Meta<typeof TrendChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SharedLegendInteractions: Story = {
  name: 'Wspolne interakcje serii',
  render: () => (
    <Story15Page
      className="pd-chart-contract-story"
      metaAriaLabel={{
        en: 'Interactive chart contract parameters',
        pl: 'Parametry kontraktu interaktywnych wykresów',
      }}
      metaItems={[
        {
          label: <Localized pl="Kontrakt" en="Contract" />,
          value: '15.chart-legend',
        },
        {
          label: <Localized pl="Silnik" en="Engine" />,
          value: 'Recharts',
        },
        {
          label: <Localized pl="Komponent" en="Component" />,
          value: 'ChartLegend',
        },
      ]}
      storyId="15.chart-legend"
      summary={(
        <Localized
          en="One series interaction contract powers line, bar and share charts before the Command Center composes them into a page."
          pl="Jeden kontrakt interakcji serii zasila wykres liniowy, słupkowy i udziałowy zanim Centrum Dowodzenia złoży je w stronę."
        />
      )}
      title={(
        <Localized
          en="Interactive charts share one series control model."
          pl="Interaktywne wykresy mają jeden model kontroli serii."
        />
      )}
    >
      <StoryPresentationSection
        index="01"
        summary="Ten sam komponent legendy steruje widocznością serii i segmentów w trzech rodzinach wykresów."
        title="Kontrakt interakcji"
      >
        <InteractiveChartContractDemo />
      </StoryPresentationSection>
    </Story15Page>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const planToggle = await canvas.findByRole('button', {
      name: /Plan/u,
    });

    await userEvent.click(planToggle);
    await expect(planToggle).toHaveAttribute('aria-pressed', 'false');
  },
};
