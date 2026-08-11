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
  TrendChart,
} from '../../../design-system/components';
import type {
  TrendChartDatum,
} from '../../../design-system/components';
import {
  formatPapaDataNumber,
  formatPapaDataRelativeTime,
  type PapaDataRuntimeLocale,
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
import './trend-chart-showcase.css';

const trendDataSeed = [
  {
    actual: 3.92,
    label: {
      en: 'Jul 1',
      pl: '1 lip',
    },
    movingAverage: 3.92,
    plan: 4.35,
    previousPeriod: 3.72,
  },
  {
    actual: 4.08,
    label: {
      en: 'Jul 4',
      pl: '4 lip',
    },
    movingAverage: 4,
    plan: 4.37,
    previousPeriod: 3.81,
  },
  {
    actual: 4.02,
    label: {
      en: 'Jul 7',
      pl: '7 lip',
    },
    movingAverage: 4.01,
    plan: 4.39,
    previousPeriod: 3.87,
  },
  {
    actual: 4.24,
    label: {
      en: 'Jul 10',
      pl: '10 lip',
    },
    movingAverage: 4.09,
    plan: 4.41,
    previousPeriod: 3.94,
  },
  {
    actual: 4.36,
    label: {
      en: 'Jul 13',
      pl: '13 lip',
    },
    movingAverage: 4.18,
    plan: 4.43,
    previousPeriod: 4.01,
  },
  {
    actual: 4.28,
    label: {
      en: 'Jul 16',
      pl: '16 lip',
    },
    movingAverage: 4.23,
    plan: 4.45,
    previousPeriod: 4.08,
  },
  {
    actual: 4.51,
    label: {
      en: 'Jul 19',
      pl: '19 lip',
    },
    movingAverage: 4.31,
    plan: 4.47,
    previousPeriod: 4.12,
  },
  {
    actual: 4.63,
    label: {
      en: 'Jul 22',
      pl: '22 lip',
    },
    movingAverage: 4.4,
    plan: 4.49,
    previousPeriod: 4.18,
  },
  {
    actual: 4.57,
    label: {
      en: 'Jul 25',
      pl: '25 lip',
    },
    movingAverage: 4.48,
    plan: 4.5,
    previousPeriod: 4.24,
  },
  {
    actual: 4.74,
    label: {
      en: 'Jul 28',
      pl: '28 lip',
    },
    movingAverage: 4.56,
    plan: 4.5,
    previousPeriod: 4.29,
  },
  {
    actual: 4.82,
    label: {
      en: 'Jul 31',
      pl: '31 lip',
    },
    movingAverage: 4.65,
    plan: 4.5,
    previousPeriod: 4.34,
  },
];

function buildTrendData(
  locale: PapaDataRuntimeLocale,
): readonly TrendChartDatum[] {
  return trendDataSeed.map((datum) => ({
    ...datum,
    label: datum.label[locale],
  }));
}

function buildLineData(
  locale: PapaDataRuntimeLocale,
): readonly TrendChartDatum[] {
  return buildTrendData(locale).map((datum) => ({
    actual: datum.actual,
    label: datum.label,
    plan: datum.plan,
  }));
}

function buildLabels(locale: PapaDataRuntimeLocale) {
  if (locale === 'en') {
    return {
      actual: 'Actual',
      legend: 'Chart series',
      movingAverage: '7-day moving average',
      plan: 'Plan',
      previousPeriod: 'Previous period',
    } as const;
  }

  return {
    actual: 'Wynik',
    legend: 'Serie wykresu',
    movingAverage: 'Średnia krocząca 7 dni',
    plan: 'Plan',
    previousPeriod: 'Poprzedni okres',
  } as const;
}

function formatValue(
  value: number,
  locale: PapaDataRuntimeLocale,
): string {
  return formatPapaDataNumber(value, locale);
}

function CanonicalTrend() {
  const locale = readLocale();
  const labels = buildLabels(locale);
  const trendData = buildTrendData(locale);

  return (
    <ChartFrame
      businessQuestion={
        locale === 'en'
          ? 'Is ROAS improving against the operating plan?'
          : 'Czy ROAS poprawia się względem planu operacyjnego?'
      }
      description={
        locale === 'en'
          ? 'Actual performance, plan, previous period and the moving average share one temporal scale.'
          : 'Wynik, plan, poprzedni okres i średnia krocząca korzystają z jednej skali czasu.'
      }
      freshnessLabel={formatPapaDataRelativeTime(-6, 'minute', locale)}
      rangeLabel={locale === 'en' ? '1–31 Jul · daily' : '1–31 lip · dzień'}
      sourceLabel="Google Ads + Shop"
      status="ready"
      statusLabel={locale === 'en' ? 'Current data' : 'Dane aktualne'}
      summary={
        locale === 'en'
          ? 'ROAS moved above plan in the final part of the month while the moving average confirms that the change is not a single-day spike.'
          : 'ROAS wyszedł ponad plan w końcowej części miesiąca, a średnia krocząca potwierdza, że zmiana nie jest jednodniowym skokiem.'
      }
      title={
        locale === 'en'
          ? 'ROAS is now above plan'
          : 'ROAS wyszedł ponad plan'
      }
      visualization={(
        <TrendChart
          ariaLabel={
            locale === 'en'
              ? 'ROAS trend with actual result, plan, previous period and 7-day moving average'
              : 'Trend ROAS z wynikiem, planem, poprzednim okresem i średnią kroczącą 7 dni'
          }
          data={trendData}
          labels={labels}
          unit="ROAS"
          valueFormatter={(value) => formatValue(value, locale)}
          variant="area"
        />
      )}
      visualizationLabel={
        locale === 'en'
          ? 'ROAS trend'
          : 'Trend ROAS'
      }
    />
  );
}

function TrendVariants() {
  const locale = readLocale();
  const labels = buildLabels(locale);
  const trendData = buildTrendData(locale);
  const lineData = buildLineData(locale);

  return (
    <div className="pd-trend-story__variants">
      <article className="pd-trend-story__variant">
        <header>
          <span>linia</span>
          <h3>
            {locale === 'en'
              ? 'Actual result against plan'
              : 'Wynik względem planu'}
          </h3>
          <p>
            {locale === 'en'
              ? 'The primary line remains dominant while plan and previous-period series use distinct data colors instead of dashed substitutes.'
              : 'Główna linia pozostaje dominująca, a plan korzysta z przerywanego kodowania referencyjnego.'}
          </p>
        </header>

        <AnalyticsChartSurface
          businessQuestion={{
            en: 'Is actual ROAS above plan?',
            pl: 'Czy wynik ROAS jest powyżej planu?',
          }}
          description={{
            en: 'The line variant keeps a zero private surface: ChartFrame owns status and metadata, TrendChart owns only temporal geometry.',
            pl: 'Wariant liniowy nie tworzy własnej powierzchni: ChartFrame utrzymuje status i metadane, a TrendChart wyłącznie geometrię czasu.',
          }}
          rangeLabel={{
            en: '1-31 Jul',
            pl: '1-31 lip',
          }}
          sourceLabel="TrendChart / ChartFrame"
          title={{
            en: 'Line trend against plan',
            pl: 'Trend liniowy względem planu',
          }}
          visualizationLabel={{
            en: 'Line ROAS trend with actual result and plan',
            pl: 'Liniowy trend ROAS z wynikiem i planem',
          }}
        >
          <TrendChart
            ariaLabel={
              locale === 'en'
                ? 'Line ROAS trend with actual result and plan'
                : 'Liniowy trend ROAS z wynikiem i planem'
            }
            data={lineData}
            labels={labels}
            unit="ROAS"
            valueFormatter={(value) => formatValue(value, locale)}
            variant="line"
          />
        </AnalyticsChartSurface>
      </article>

      <article className="pd-trend-story__variant">
        <header>
          <span>obszar</span>
          <h3>
            {locale === 'en'
              ? 'Actual, context and smoothing'
              : 'Wynik, kontekst i wygładzenie'}
          </h3>
          <p>
            {locale === 'en'
              ? 'Area adds restrained emphasis without obscuring plan, previous period or the moving average.'
              : 'Wariant obszarowy wzmacnia serię aktualną bez zasłaniania planu, poprzedniego okresu ani średniej kroczącej.'}
          </p>
        </header>

        <AnalyticsChartSurface
          businessQuestion={{
            en: 'Is the improvement sustained?',
            pl: 'Czy poprawa jest trwała?',
          }}
          description={{
            en: 'The area variant remains a chart family example inside the shared data surface from 00.',
            pl: 'Wariant obszarowy pozostaje przykładem rodziny wykresów osadzonym we wspólnej powierzchni danych z 00.',
          }}
          rangeLabel={{
            en: '1-31 Jul',
            pl: '1-31 lip',
          }}
          sourceLabel="TrendChart / ChartFrame"
          title={{
            en: 'Area trend with context',
            pl: 'Trend obszarowy z kontekstem',
          }}
          visualizationLabel={{
            en: 'Area ROAS trend with actual result, plan, previous period and moving average',
            pl: 'Obszarowy trend ROAS z wynikiem, planem, poprzednim okresem i średnią kroczącą',
          }}
        >
          <TrendChart
            ariaLabel={
              locale === 'en'
                ? 'Area ROAS trend with actual result, plan, previous period and moving average'
                : 'Obszarowy trend ROAS z wynikiem, planem, poprzednim okresem i średnią kroczącą'
            }
            data={trendData}
            labels={labels}
            unit="ROAS"
            valueFormatter={(value) => formatValue(value, locale)}
            variant="area"
          />
        </AnalyticsChartSurface>
      </article>
    </div>
  );
}

function LongCopyTrend() {
  const locale = readLocale();
  const trendData = buildTrendData(locale);

  return (
    <div className="pd-trend-story__long-copy">
      <p>
        {locale === 'en'
          ? 'Revenue efficiency after advertising costs compared with the previous fully reconciled reporting period and the continuously recalculated seven-day moving average.'
          : 'Efektywność przychodu po kosztach reklamy w porównaniu z poprzednim, w pełni uzgodnionym okresem raportowym oraz stale przeliczana średnia krocząca z siedmiu dni.'}
      </p>

      <AnalyticsChartSurface
        businessQuestion={{
          en: 'Does the long operational label still reflow?',
          pl: 'Czy długi opis operacyjny nadal się zawija?',
        }}
        description={{
          en: 'Long labels stay inside ChartFrame and do not widen the page or create a private chart surface.',
          pl: 'Długie etykiety pozostają w ChartFrame i nie poszerzają strony ani nie tworzą prywatnej powierzchni wykresu.',
        }}
        rangeLabel={{
          en: 'Long-copy regression',
          pl: 'Regresja długiego tekstu',
        }}
        sourceLabel="TrendChart / ChartFrame"
        title={{
          en: 'Long-copy trend inside the data surface',
          pl: 'Trend z długim tekstem w powierzchni danych',
        }}
        visualizationLabel={{
          en: 'Revenue efficiency trend with actual result, operating plan, previous reconciled period and recalculated moving average',
          pl: 'Trend efektywności przychodu po kosztach reklamy z wynikiem, planem operacyjnym, poprzednim uzgodnionym okresem i stale przeliczaną średnią kroczącą z siedmiu dni',
        }}
      >
        <TrendChart
          ariaLabel={
            locale === 'en'
              ? 'Revenue efficiency trend with actual result, operating plan, previous reconciled period and recalculated seven-day moving average'
              : 'Trend efektywności przychodu po kosztach reklamy z wynikiem, planem operacyjnym, poprzednim uzgodnionym okresem i stale przeliczaną średnią kroczącą z siedmiu dni'
          }
          data={trendData}
          labels={{
            actual: locale === 'en' ? 'Actual' : 'Wynik',
            legend: locale === 'en' ? 'Chart series' : 'Serie wykresu',
            movingAverage: locale === 'en'
              ? '7-day moving average, continuously recalculated'
              : 'Średnia krocząca 7 dni, stale przeliczana',
            plan: locale === 'en' ? 'Operating plan' : 'Plan operacyjny',
            previousPeriod: locale === 'en'
              ? 'Previous reconciled period'
              : 'Poprzedni uzgodniony okres',
          }}
          unit="ROAS"
          valueFormatter={(value) => formatPapaDataNumber(value, locale)}
          variant="line"
        />
      </AnalyticsChartSurface>
    </div>
  );
}

const meta = {
  title: '15 Wykresy i dane/02 Rodziny wykresów/Trendy',
  component: TrendChart,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'TrendChart jest właścicielem wykonania 15.03. Recharts odpowiada za geometrię i skale, a PapaData za semantykę wyniku, planu, poprzedniego okresu, średniej kroczącej, tokeny, legendę i dostępność.',
      },
    },
  },
} satisfies Meta<typeof TrendChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TrendChartStory: Story = {
  args: {
    ariaLabel: 'Trend ROAS',
    data: buildTrendData('pl'),
    unit: 'ROAS',
    variant: 'line',
  },
  name: 'Trendy',
  render: () => (
    <Story15Page
      className="pd-trend-story"
      metaAriaLabel={{
        en: 'TrendChart contract parameters',
        pl: 'Parametry kontraktu TrendChart',
      }}
      metaItems={[
        {
          label: <Localized pl="Kontrakt" en="Contract" />,
          value: '15.03',
        },
        {
          label: <Localized pl="Silnik" en="Engine" />,
          value: 'Recharts',
        },
        {
          label: <Localized pl="Status" en="Status" />,
          value: <Localized pl="zaakceptowany" en="accepted" />,
        },
      ]}
      storyId="15.03"
      summary={(
        <Localized
          en="TrendChart defines one professional visual language for trends. ChartFrame remains the owner of composition, status, sources and actions."
          pl="TrendChart ustala jeden profesjonalny język wizualny trendów. ChartFrame pozostaje właścicielem kompozycji, statusu, źródeł i akcji."
        />
      )}
      title={(
        <Localized
          en="A trend should encode time and reference, not decorate a dashboard."
          pl="Trend ma kodować czas i odniesienie, a nie dekorować pulpit."
        />
      )}
    >
      <StoryPresentationSection
        index="01"
        summary="ChartFrame konsumuje gotową wizualizację TrendChart. Silnik wykresu nie przejmuje nagłówka, filtrów ani statusów danych."
        title="Kanoniczna kompozycja"
      >
        <CanonicalTrend />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        summary="Wariant liniowy i obszarowy należą do tej samej rodziny. Znaczenie serii pozostaje stałe i nie zależy wyłącznie od koloru."
        title="Linia i obszar"
      >
        <TrendVariants />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="03"
        summary="Długie etykiety serii zawijają się bez poziomego przewijania i bez zmiany semantyki wykresu."
        title="Długi tekst i zawijanie"
      >
        <LongCopyTrend />
      </StoryPresentationSection>
    </Story15Page>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    const canonicalTrend = canvas.getByRole('group', {
      name: 'Trend ROAS z wynikiem, planem, poprzednim okresem i średnią kroczącą 7 dni',
    });

    await expect(canonicalTrend).toBeInTheDocument();

    const lineVariant = canvasElement.querySelector(
      '[data-component="trend-chart"][data-variant="line"]',
    );
    const areaVariant = canvasElement.querySelector(
      '[data-component="trend-chart"][data-variant="area"]',
    );

    if (!lineVariant || !areaVariant) {
      throw new Error('Missing required TrendChart line/area variants.');
    }

    await expect(lineVariant).toHaveAttribute('data-variant', 'line');
    await expect(areaVariant).toHaveAttribute('data-variant', 'area');

    await expect(canvas.getAllByText('Wynik').length).toBeGreaterThan(0);
    await expect(canvas.getAllByText('Plan').length).toBeGreaterThan(0);
    await expect(canvas.getAllByText('Poprzedni okres').length).toBeGreaterThan(0);
    await expect(canvas.getAllByText('Średnia krocząca 7 dni').length).toBeGreaterThan(0);
  },
};
