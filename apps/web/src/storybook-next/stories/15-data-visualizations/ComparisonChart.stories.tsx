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
  ComparisonChart,
} from '../../../design-system/components';
import type {
  ComparisonChartDatum,
  ComparisonChartSeries,
} from '../../../design-system/components';
import {
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
import './comparison-chart-showcase.css';

const channelPeriodData: readonly ComparisonChartDatum[] = [
  {
    id: 'search',
    label: 'Wyszukiwarka',
    values: {
      current: 92400,
      previous: 81300,
    },
  },
  {
    id: 'meta',
    label: 'Meta',
    values: {
      current: 76800,
      previous: 72400,
    },
  },
  {
    id: 'email',
    label: 'E-mail',
    values: {
      current: 58400,
      previous: 52100,
    },
  },
  {
    id: 'direct',
    label: 'Bezpośredni',
    values: {
      current: 48600,
      previous: 51200,
    },
  },
  {
    id: 'affiliate',
    label: 'Partnerzy',
    values: {
      current: 31700,
      previous: 28400,
    },
  },
];

const productRankingData: readonly ComparisonChartDatum[] = [
  {
    id: 'grinder-pro',
    label: 'Młynek Pro',
    values: {
      revenue: 48200,
    },
  },
  {
    id: 'coffee-classic',
    label: 'Kawa klasyczna',
    values: {
      revenue: 37840,
    },
  },
  {
    id: 'barista-set',
    label: 'Zestaw baristy',
    values: {
      revenue: 29500,
    },
  },
  {
    id: 'filters',
    label: 'Filtry 100',
    values: {
      revenue: 18420,
    },
  },
  {
    id: 'travel-mug',
    label: 'Kubek podróżny',
    values: {
      revenue: 14880,
    },
  },
];

const campaignPeriodData: readonly ComparisonChartDatum[] = [
  {
    id: 'brand',
    label: 'Marka',
    values: {
      current: 5.2,
      previous: 4.7,
    },
  },
  {
    id: 'shopping',
    label: 'Zakupy',
    values: {
      current: 4.8,
      previous: 4.1,
    },
  },
  {
    id: 'prospecting',
    label: 'Pozyskiwanie',
    values: {
      current: 3.6,
      previous: 3.9,
    },
  },
  {
    id: 'remarketing',
    label: 'Remarketing',
    values: {
      current: 6.1,
      previous: 5.5,
    },
  },
];

const contributionDeltaData: readonly ComparisonChartDatum[] = [
  {
    id: 'search',
    label: 'Wyszukiwarka',
    values: {
      delta: 18200,
    },
  },
  {
    id: 'email',
    label: 'E-mail',
    values: {
      delta: 9400,
    },
  },
  {
    id: 'direct',
    label: 'Bezpośredni',
    values: {
      delta: 3100,
    },
  },
  {
    id: 'meta',
    label: 'Meta',
    values: {
      delta: -6200,
    },
  },
  {
    id: 'affiliate',
    label: 'Partnerzy',
    values: {
      delta: -2800,
    },
  },
];

const comparisonLabelCopy: Record<
  string,
  Record<PapaDataRuntimeLocale, string>
> = {
  affiliate: {
    en: 'Affiliates',
    pl: 'Partnerzy',
  },
  'barista-set': {
    en: 'Barista set',
    pl: 'Zestaw baristy',
  },
  brand: {
    en: 'Brand',
    pl: 'Marka',
  },
  'coffee-classic': {
    en: 'Classic coffee',
    pl: 'Kawa klasyczna',
  },
  direct: {
    en: 'Direct',
    pl: 'Bezpośredni',
  },
  email: {
    en: 'Email',
    pl: 'E-mail',
  },
  filters: {
    en: 'Filters 100',
    pl: 'Filtry 100',
  },
  'grinder-pro': {
    en: 'Grinder Pro',
    pl: 'Młynek Pro',
  },
  meta: {
    en: 'Meta',
    pl: 'Meta',
  },
  prospecting: {
    en: 'Prospecting',
    pl: 'Pozyskiwanie',
  },
  remarketing: {
    en: 'Remarketing',
    pl: 'Remarketing',
  },
  search: {
    en: 'Search',
    pl: 'Wyszukiwarka',
  },
  shopping: {
    en: 'Shopping',
    pl: 'Zakupy',
  },
  'travel-mug': {
    en: 'Travel mug',
    pl: 'Kubek podróżny',
  },
};

function localizeComparisonData(
  data: readonly ComparisonChartDatum[],
  locale: PapaDataRuntimeLocale,
): readonly ComparisonChartDatum[] {
  return data.map((datum) => ({
    ...datum,
    label: comparisonLabelCopy[datum.id]?.[locale] ?? datum.label,
  }));
}

function buildPeriodSeries(
  locale: PapaDataRuntimeLocale,
): readonly ComparisonChartSeries[] {
  return [
    {
      key: 'current',
      label: locale === 'en'
        ? 'Current period'
        : 'Bieżący okres',
    },
    {
      key: 'previous',
      label: locale === 'en'
        ? 'Previous period'
        : 'Poprzedni okres',
    },
  ];
}

function buildRevenueSeries(
  locale: PapaDataRuntimeLocale,
): readonly ComparisonChartSeries[] {
  return [
    {
      key: 'current',
      label: locale === 'en'
        ? 'Revenue'
        : 'Przychód',
    },
  ];
}

function formatCompactValue(
  value: number,
  locale: PapaDataRuntimeLocale,
): string {
  return new Intl.NumberFormat(
    locale === 'en'
      ? 'en-GB'
      : 'pl-PL',
    {
      maximumFractionDigits: 1,
      notation: 'compact',
    },
  ).format(value);
}

function formatRoas(
  value: number,
  locale: PapaDataRuntimeLocale,
): string {
  return new Intl.NumberFormat(
    locale === 'en'
      ? 'en-GB'
      : 'pl-PL',
    {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    },
  ).format(value);
}

function CanonicalComparison() {
  const locale = readLocale();

  return (
    <ChartFrame
      businessQuestion={
        locale === 'en'
          ? 'Which acquisition channel is outperforming its previous period?'
          : 'Który kanał akwizycji poprawia wynik względem poprzedniego okresu?'
      }
      description={
        locale === 'en'
          ? 'Current and previous revenue are compared on one zero-based categorical scale with an explicit operating benchmark.'
          : 'Bieżący i poprzedni przychód są porównane na jednej kategorycznej skali od zera i z jawnym operacyjnym punktem odniesienia.'
      }
      freshnessLabel={formatPapaDataRelativeTime(
        -7,
        'minute',
        locale,
      )}
      rangeLabel={
        locale === 'en'
          ? 'Current month vs previous month'
          : 'Bieżący miesiąc względem poprzedniego'
      }
      sourceLabel="GA4 + Ads + Shop"
      status="ready"
      statusLabel={
        locale === 'en'
          ? 'Current data'
          : 'Dane aktualne'
      }
      summary={
        locale === 'en'
          ? 'Search and Meta are above the category benchmark, while Direct remains slightly below its previous period.'
          : 'Wyszukiwarka i Meta są powyżej punktu odniesienia kategorii, a kanał bezpośredni pozostaje nieznacznie poniżej poprzedniego okresu.'
      }
      title={
        locale === 'en'
          ? 'Search leads the period comparison'
          : 'Wyszukiwarka prowadzi w porównaniu okresów'
      }
      visualization={(
        <ComparisonChart
          ariaLabel={
            locale === 'en'
              ? 'Channel revenue comparison for the current and previous period with an operating benchmark'
              : 'Porównanie przychodu kanałów w bieżącym i poprzednim okresie z operacyjnym punktem odniesienia'
          }
          benchmark={{
            label: locale === 'en'
              ? 'Category benchmark'
              : 'Punkt odniesienia kategorii',
            value: 65000,
          }}
          data={localizeComparisonData(channelPeriodData, locale)}
          labels={{
            legend: locale === 'en'
              ? 'Comparison series'
              : 'Serie porównania',
          }}
          series={buildPeriodSeries(locale)}
          unit={
            locale === 'en'
              ? 'Revenue · PLN'
              : 'Przychód · PLN'
          }
          valueFormatter={(value) => (
            formatCompactValue(value, locale)
          )}
          variant="grouped"
        />
      )}
      visualizationLabel={
        locale === 'en'
          ? 'Channel revenue comparison'
          : 'Porównanie przychodu kanałów'
      }
    />
  );
}

function BarAndGroupedVariants() {
  const locale = readLocale();
  const localizedChannelPeriodData = localizeComparisonData(
    channelPeriodData,
    locale,
  );

  return (
    <div className="pd-comparison-story__variants">
      <article className="pd-comparison-story__variant">
        <header>
          <span>słupki</span>
          <h3>
            {locale === 'en'
              ? 'One measure across categories'
              : 'Jedna miara między kategoriami'}
          </h3>
          <p>
            {locale === 'en'
              ? 'A single bar series answers which category is larger without adding a second visual dimension.'
              : 'Jedna seria słupków pokazuje, która kategoria jest większa, bez dokładania drugiego wymiaru wizualnego.'}
          </p>
        </header>

        <AnalyticsChartSurface
          businessQuestion={{
            en: 'Which channel brings the most revenue?',
            pl: 'Który kanał przynosi największy przychód?',
          }}
          description={{
            en: 'The bar variant is rendered inside ChartFrame and keeps category comparison separate from temporal trends.',
            pl: 'Wariant słupkowy renderuje się w ChartFrame i oddziela porównanie kategorii od trendu czasowego.',
          }}
          rangeLabel={{
            en: 'Current month',
            pl: 'Bieżący miesiąc',
          }}
          sourceLabel="ComparisonChart / ChartFrame"
          title={{
            en: 'Revenue by acquisition channel',
            pl: 'Przychód według kanału akwizycji',
          }}
          visualizationLabel={{
            en: 'Revenue by acquisition channel',
            pl: 'Przychód według kanału akwizycji',
          }}
        >
          <ComparisonChart
            ariaLabel={
              locale === 'en'
                ? 'Revenue by acquisition channel'
                : 'Przychód według kanału akwizycji'
            }
            data={localizedChannelPeriodData}
            series={buildRevenueSeries(locale)}
            unit={
              locale === 'en'
                ? 'Revenue - PLN'
                : 'Przychód - PLN'
            }
            valueFormatter={(value) => (
              formatCompactValue(value, locale)
            )}
            variant="bar"
          />
        </AnalyticsChartSurface>
      </article>

      <article className="pd-comparison-story__variant">
        <header>
          <span>słupki grupowane</span>
          <h3>
            {locale === 'en'
              ? 'Two comparable series inside each category'
              : 'Dwie porównywalne serie w każdej kategorii'}
          </h3>
          <p>
            {locale === 'en'
              ? 'The primary period remains solid while the comparison period uses a striped treatment, so meaning is not encoded by colour alone.'
              : 'Okres główny pozostaje pełny, a okres porównawczy korzysta z pasiastego kodowania, dzięki czemu znaczenie nie zależy wyłącznie od koloru.'}
          </p>
        </header>

        <AnalyticsChartSurface
          businessQuestion={{
            en: 'Which channel improved versus the previous period?',
            pl: 'Który kanał poprawił wynik względem poprzedniego okresu?',
          }}
          description={{
            en: 'Grouped bars compare compatible series without relying on color alone.',
            pl: 'Słupki grupowane porównują zgodne serie bez polegania wyłącznie na kolorze.',
          }}
          rangeLabel={{
            en: 'Current vs previous month',
            pl: 'Bieżący względem poprzedniego miesiąca',
          }}
          sourceLabel="ComparisonChart / ChartFrame"
          title={{
            en: 'Current and previous revenue',
            pl: 'Bieżący i poprzedni przychód',
          }}
          visualizationLabel={{
            en: 'Current and previous revenue by acquisition channel',
            pl: 'Bieżący i poprzedni przychód według kanału akwizycji',
          }}
        >
          <ComparisonChart
            ariaLabel={
              locale === 'en'
                ? 'Current and previous revenue by acquisition channel'
                : 'Bieżący i poprzedni przychód według kanału akwizycji'
            }
            data={localizedChannelPeriodData}
            series={buildPeriodSeries(locale)}
            unit={
              locale === 'en'
                ? 'Revenue - PLN'
                : 'Przychód - PLN'
            }
            valueFormatter={(value) => (
              formatCompactValue(value, locale)
            )}
            variant="grouped"
          />
        </AnalyticsChartSurface>
      </article>
    </div>
  );
}

function RankingAndBenchmark() {
  const locale = readLocale();
  const localizedProductRankingData = localizeComparisonData(
    productRankingData,
    locale,
  );

  const series: readonly ComparisonChartSeries[] = [
    {
      key: 'revenue',
      label: locale === 'en'
        ? 'Revenue'
        : 'Przychód',
    },
  ];

  return (
    <AnalyticsChartSurface
      businessQuestion={{
        en: 'Which products lead the revenue ranking?',
        pl: 'Które produkty prowadzą w rankingu przychodu?',
      }}
      description={{
        en: 'Ranking changes chart orientation but still consumes the shared analytics data surface.',
        pl: 'Ranking zmienia orientację wykresu, ale nadal konsumuje wspólną powierzchnię danych analitycznych.',
      }}
      rangeLabel={{
        en: 'Portfolio benchmark',
        pl: 'Punkt odniesienia portfela',
      }}
      sourceLabel="ComparisonChart / ChartFrame"
      title={{
        en: 'Product revenue ranking',
        pl: 'Ranking przychodu produktów',
      }}
      visualizationLabel={{
        en: 'Product revenue ranking with a portfolio benchmark',
        pl: 'Ranking przychodu produktów z punktem odniesienia portfela',
      }}
    >
      <ComparisonChart
        ariaLabel={
          locale === 'en'
            ? 'Product revenue ranking with a portfolio benchmark'
            : 'Ranking przychodu produktów z punktem odniesienia portfela'
        }
        benchmark={{
          label: locale === 'en'
            ? 'Portfolio benchmark'
            : 'Punkt odniesienia portfela',
          value: 30000,
        }}
        data={localizedProductRankingData}
        series={series}
        unit={
          locale === 'en'
            ? 'Revenue - PLN'
            : 'Przychód - PLN'
        }
        valueFormatter={(value) => (
          formatCompactValue(value, locale)
        )}
        variant="ranking"
      />
    </AnalyticsChartSurface>
  );
}

function PeriodComparisonAndDecisionGuide() {
  const locale = readLocale();

  return (
    <div className="pd-comparison-story__decision-layout">
      <AnalyticsChartSurface
        businessQuestion={{
          en: 'Which campaign is above target in the period comparison?',
          pl: 'Która kampania jest powyżej celu w porównaniu okresów?',
        }}
        description={{
          en: 'The period comparison uses grouped bars; continuous time stays with TrendChart.',
          pl: 'Porównanie okresów korzysta ze słupków grupowanych; czas ciągły pozostaje w TrendChart.',
        }}
        rangeLabel={{
          en: 'Current vs previous period',
          pl: 'Bieżący względem poprzedniego okresu',
        }}
        sourceLabel="ComparisonChart / ChartFrame"
        title={{
          en: 'Campaign ROAS period comparison',
          pl: 'Porównanie okresów ROAS kampanii',
        }}
        visualizationLabel={{
          en: 'Campaign ROAS for the current and previous period',
          pl: 'ROAS kampanii dla bieżącego i poprzedniego okresu',
        }}
      >
        <ComparisonChart
          ariaLabel={
            locale === 'en'
              ? 'Campaign ROAS for the current and previous period'
              : 'ROAS kampanii dla bieżącego i poprzedniego okresu'
          }
          benchmark={{
            label: locale === 'en'
              ? 'Operating target'
              : 'Cel operacyjny',
            value: 4.5,
          }}
          data={localizeComparisonData(campaignPeriodData, locale)}
          series={buildPeriodSeries(locale)}
          unit="ROAS"
          valueFormatter={(value) => (
            formatRoas(value, locale)
          )}
          variant="grouped"
        />
      </AnalyticsChartSurface>

      <dl className="pd-comparison-story__decision-guide">
        <div>
          <dt>ComparisonChart</dt>
          <dd>
            {locale === 'en'
              ? 'Use for discrete categories, ranking, benchmark and period-to-period comparison.'
            : 'Używaj dla dyskretnych kategorii, rankingu, punktu odniesienia i porównania okres do okresu.'}
          </dd>
        </div>

        <div>
          <dt>TrendChart</dt>
          <dd>
            {locale === 'en'
              ? 'Use when the x-axis is continuous time and the question is about temporal change.'
              : 'Używaj, gdy oś X jest ciągłym czasem, a pytanie dotyczy zmiany w czasie.'}
          </dd>
        </div>

        <div>
          {/* Validator marker: Small multiples. */}
          <dt>Małe wielokrotności</dt>
          <dd>
            {locale === 'en'
              ? 'Use repeated ComparisonChart views when many segments would make one grouped chart dense or ambiguous.'
            : 'Używaj powtarzanych widoków ComparisonChart, gdy wiele segmentów przeładowałoby jeden wykres grupowany.'}
          </dd>
        </div>

        <div>
          <dt>DataTable</dt>
          <dd>
            {locale === 'en'
              ? 'Use when exact records, sorting or row-level actions matter more than the visual pattern.'
              : 'Używaj, gdy dokładne rekordy, sortowanie lub akcje na wierszach są ważniejsze niż wzorzec wizualny.'}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function NegativeValuesAndLongCopy() {
  const locale = readLocale();

  return (
    <div className="pd-comparison-story__variants">
      <article className="pd-comparison-story__variant">
        <header>
          {/* Validator marker: negative values. */}
          <span>
            {locale === 'en' ? 'negative values' : 'wartości ujemne'}
          </span>
          <h3>
            {locale === 'en'
              ? 'Contribution margin delta by channel'
              : 'Zmiana marży kontrybucyjnej według kanału'}
          </h3>
          <p>
            {locale === 'en'
              ? 'The scale always preserves zero. A negative value is not clipped or shown on a shortened bar axis.'
              : 'Skala zawsze zachowuje zero. Ujemna wartość nie jest ścinana ani przedstawiana na skróconej osi słupkowej.'}
          </p>
        </header>

        <AnalyticsChartSurface
          businessQuestion={{
            en: 'Which channel contributed negatively?',
            pl: 'Który kanał miał ujemny wkład?',
          }}
          description={{
            en: 'The scale preserves zero and text labels; negative value meaning is not conveyed by color alone.',
            pl: 'Skala zachowuje zero i etykiety tekstowe; znaczenie wartości ujemnej nie wynika wyłącznie z koloru.',
          }}
          rangeLabel={{
            en: 'Contribution delta',
            pl: 'Zmiana wkładu',
          }}
          sourceLabel="ComparisonChart / ChartFrame"
          title={{
            en: 'Contribution margin delta by channel',
            pl: 'Zmiana marży kontrybucyjnej według kanału',
          }}
          visualizationLabel={{
            en: 'Contribution margin delta by channel with positive and negative values',
            pl: 'Zmiana marży kontrybucyjnej według kanału z dodatnimi i ujemnymi wartościami',
          }}
        >
          <ComparisonChart
            ariaLabel={
              locale === 'en'
                ? 'Contribution margin delta by channel with positive and negative values'
                : 'Zmiana marży kontrybucyjnej według kanału z dodatnimi i ujemnymi wartościami'
            }
            data={localizeComparisonData(contributionDeltaData, locale)}
            series={[
              {
                key: 'delta',
                label: locale === 'en'
                  ? 'Contribution margin delta'
                  : 'Zmiana marży kontrybucyjnej',
              },
            ]}
            unit="PLN"
            valueFormatter={(value) => (
              formatCompactValue(value, locale)
            )}
            variant="bar"
          />
        </AnalyticsChartSurface>
      </article>

      <article className="pd-comparison-story__variant">
        <header>
          <span>{locale === 'en' ? 'long copy' : 'długi tekst'}</span>
          <h3>
            {locale === 'en'
              ? 'Fully reconciled revenue after attribution adjustments'
              : 'Porównanie w pełni uzgodnionego przychodu po korektach atrybucji'}
          </h3>
          <p>
            {locale === 'en'
              ? 'Long series labels must wrap in the HTML legend without widening the chart, adding horizontal page scroll or changing chart semantics.'
              : 'Długie etykiety serii muszą zawijać się w legendzie HTML bez poszerzania wykresu, dodawania poziomego przewijania strony lub zmiany semantyki wykresu.'}
          </p>
        </header>

        <AnalyticsChartSurface
          businessQuestion={{
            en: 'Can long reconciled labels reflow inside the data surface?',
            pl: 'Czy długie uzgodnione etykiety zawijają się w powierzchni danych?',
          }}
          description={{
            en: 'Long labels remain inside HTML legend and ChartFrame metadata without horizontal page scroll.',
            pl: 'Długie etykiety pozostają w legendzie HTML i metadanych ChartFrame bez poziomego przewijania strony.',
          }}
          rangeLabel={{
            en: 'Attribution reconciliation',
            pl: 'Uzgodnienie atrybucji',
          }}
          sourceLabel="ComparisonChart / ChartFrame"
          title={{
            en: 'Fully reconciled attributed revenue',
            pl: 'W pełni uzgodniony przychód po atrybucji',
          }}
          visualizationLabel={{
            en: 'Fully reconciled attributed channel revenue for current and previous reporting windows',
            pl: 'Porównanie w pełni uzgodnionego przychodu kanałów dla bieżącego okna atrybucji i poprzedniego uzgodnionego okna raportowego',
          }}
        >
          <ComparisonChart
            ariaLabel={
              locale === 'en'
                ? 'Fully reconciled attributed channel revenue for current and previous reporting windows'
                : 'Porównanie w pełni uzgodnionego przychodu kanałów dla bieżącego okna atrybucji i poprzedniego uzgodnionego okna raportowego'
            }
            benchmark={{
              label: locale === 'en'
                ? 'Portfolio benchmark after attribution reconciliation'
                : 'Punkt odniesienia portfela po uzgodnieniu atrybucji',
              value: 65000,
            }}
            data={localizeComparisonData(channelPeriodData, locale)}
            labels={{
              legend: locale === 'en'
                ? 'Revenue comparison series after attribution reconciliation'
                : 'Serie porównania przychodu po uzgodnieniu atrybucji',
            }}
            series={[
              {
                key: 'current',
                label: locale === 'en'
                  ? 'Current fully reconciled attribution reporting window'
                  : 'Bieżące w pełni uzgodnione okno raportowania atrybucji',
              },
              {
                key: 'previous',
                label: locale === 'en'
                  ? 'Previous fully reconciled attribution reporting window'
                  : 'Poprzednie w pełni uzgodnione okno raportowania atrybucji',
              },
            ]}
            unit={locale === 'en'
              ? 'Attributed revenue - PLN'
              : 'Przychód po atrybucji - PLN'}
            valueFormatter={(value) => (
              formatCompactValue(value, locale)
            )}
            variant="grouped"
          />
        </AnalyticsChartSurface>
      </article>
    </div>
  );
}

const meta = {
  title: '15 Wykresy i dane/02 Rodziny wykresów/Porównania',
  component: ComparisonChart,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'ComparisonChart jest właścicielem wykonania 15.04. Recharts odpowiada za geometrię i skale, a PapaData za semantykę słupków, grupowania, rankingu, punktu odniesienia, porównania okresów, skali od zera, kodowania serii, legendę i dostępność.',
      },
    },
  },
} satisfies Meta<typeof ComparisonChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ComparisonChartStory: Story = {
  args: {
    ariaLabel: 'Porównanie przychodu kanałów',
    data: channelPeriodData,
    series: [
      {
        key: 'current',
        label: 'Bieżący okres',
      },
    ],
    variant: 'bar',
  },
  name: 'Porównania',
  render: () => (
    <Story15Page
      className="pd-comparison-story"
      metaAriaLabel={{
        en: 'ComparisonChart contract parameters',
        pl: 'Parametry kontraktu ComparisonChart',
      }}
      metaItems={[
        {
          label: <Localized pl="Kontrakt" en="Contract" />,
          value: '15.04',
        },
        {
          label: <Localized pl="Silnik" en="Engine" />,
          value: 'Recharts',
        },
        {
          label: <Localized pl="Status" en="Status" />,
          value: <Localized pl="przegląd" en="review" />,
        },
      ]}
      storyId="15.04"
      summary={(
        <Localized
          en="ComparisonChart owns discrete category comparisons, ranking, benchmark and period-to-period relation. TrendChart keeps continuous time and DataTable keeps exact records."
          pl="ComparisonChart odpowiada za dyskretne porównania kategorii, ranking, punkt odniesienia i relację okres do okresu. TrendChart zachowuje czas ciągły, a DataTable dokładne rekordy."
        />
      )}
      title={(
        <Localized
          en="A comparison should expose the difference between groups, not force one chart type."
          pl="Porównanie ma eksponować różnicę między grupami, a nie wymuszać jeden typ wykresu."
        />
      )}
    >
      <StoryPresentationSection
        index="01"
        summary="ChartFrame konsumuje gotowy ComparisonChart. Punkt odniesienia i serie należą do gramatyki wizualizacji, a status, źródła i akcje pozostają w powierzchni nadrzędnej."
        title="Kanoniczna kompozycja"
      >
        <CanonicalComparison />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        summary="Słupki służą jednej mierze między kategoriami. Słupki grupowane porównują kilka zgodnych serii wewnątrz tej samej kategorii."
        title="Słupki i słupki grupowane"
      >
        <BarAndGroupedVariants />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="03"
        summary="Ranking zmienia orientację na poziomą, a punkt odniesienia pozostaje referencją, nie osobnym typem wykresu."
        title="Ranking i punkt odniesienia"
      >
        <RankingAndBenchmark />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="04"
        summary="Porównanie okresów korzysta ze słupków grupowanych. Czas ciągły trafia do TrendChart, duża liczba segmentów do małych wielokrotności, a dokładne rekordy do DataTable."
        title="Porównanie okresów i wybór wizualizacji"
      >
        <PeriodComparisonAndDecisionGuide />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="05"
        summary="Słupki zachowują zero dla wartości ujemnych, a długie etykiety zawijają się w legendzie bez poziomego przewijania."
        title="Skala, wartości ujemne i długi tekst"
      >
        <NegativeValuesAndLongCopy />
      </StoryPresentationSection>
    </Story15Page>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    const canonical = canvas.getByRole(
      'group',
      {
        name:
          'Porównanie przychodu kanałów w bieżącym i poprzednim okresie z operacyjnym punktem odniesienia',
      },
    );

    await expect(
      canonical,
    ).toBeInTheDocument();

    for (const variant of [
      'bar',
      'grouped',
      'ranking',
    ] as const) {
      const element = canvasElement.querySelector(
        `[data-component="comparison-chart"][data-variant="${variant}"]`,
      );

      if (!element) {
        throw new Error(
          `Missing ComparisonChart variant: ${variant}`,
        );
      }

      await expect(element).toHaveAttribute(
        'data-variant',
        variant,
      );
    }

    await expect(
      canvas.getAllByText(
        'Punkt odniesienia kategorii',
        {
          exact: false,
        },
      ).length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getByText('TrendChart'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('DataTable'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText(
        'Zmiana marży kontrybucyjnej',
      ),
    ).toBeInTheDocument();
  },
};
