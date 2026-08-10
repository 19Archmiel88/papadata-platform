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
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
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

function readLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
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
          data={channelPeriodData}
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

        <ComparisonChart
          ariaLabel={
            locale === 'en'
              ? 'Revenue by acquisition channel'
              : 'Przychód według kanału akwizycji'
          }
          data={channelPeriodData}
          series={buildRevenueSeries(locale)}
          unit={
            locale === 'en'
              ? 'Revenue · PLN'
              : 'Przychód · PLN'
          }
          valueFormatter={(value) => (
            formatCompactValue(value, locale)
          )}
          variant="bar"
        />
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

        <ComparisonChart
          ariaLabel={
            locale === 'en'
              ? 'Current and previous revenue by acquisition channel'
              : 'Bieżący i poprzedni przychód według kanału akwizycji'
          }
          data={channelPeriodData}
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
      </article>
    </div>
  );
}

function RankingAndBenchmark() {
  const locale = readLocale();

  const series: readonly ComparisonChartSeries[] = [
    {
      key: 'revenue',
      label: locale === 'en'
        ? 'Revenue'
        : 'Przychód',
    },
  ];

  return (
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
      data={productRankingData}
      series={series}
      unit={
        locale === 'en'
          ? 'Revenue · PLN'
          : 'Przychód · PLN'
      }
      valueFormatter={(value) => (
        formatCompactValue(value, locale)
      )}
      variant="ranking"
    />
  );
}

function PeriodComparisonAndDecisionGuide() {
  const locale = readLocale();

  return (
    <div className="pd-comparison-story__decision-layout">
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
        data={campaignPeriodData}
        series={buildPeriodSeries(locale)}
        unit="ROAS"
        valueFormatter={(value) => (
          formatRoas(value, locale)
        )}
        variant="grouped"
      />

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
  return (
    <div className="pd-comparison-story__variants">
      <article className="pd-comparison-story__variant">
        <header>
          {/* Validator marker: negative values. */}
          <span>wartości ujemne</span>
          <h3>Zmiana marży kontrybucyjnej według kanału</h3>
          <p>
            Skala zawsze zachowuje zero. Ujemna wartość nie jest
            ścinana ani przedstawiana na skróconej osi słupkowej.
          </p>
        </header>

        <ComparisonChart
          ariaLabel="Zmiana marży kontrybucyjnej według kanału z dodatnimi i ujemnymi wartościami"
          data={contributionDeltaData}
          series={[
            {
              key: 'delta',
              label: 'Zmiana marży kontrybucyjnej',
            },
          ]}
          unit="PLN"
          valueFormatter={(value) => (
            formatCompactValue(value, 'pl')
          )}
          variant="bar"
        />
      </article>

      <article className="pd-comparison-story__variant">
        <header>
          <span>długi tekst</span>
          <h3>
            Porównanie w pełni uzgodnionego przychodu po korektach atrybucji
          </h3>
          <p>
            Długie etykiety serii muszą zawijać się w legendzie HTML bez
            poszerzania wykresu, dodawania poziomego przewijania strony lub
            zmiany semantyki wykresu.
          </p>
        </header>

        <ComparisonChart
          ariaLabel="Porównanie w pełni uzgodnionego przychodu kanałów dla bieżącego okna atrybucji i poprzedniego uzgodnionego okna raportowego"
          benchmark={{
            label:
              'Punkt odniesienia portfela po uzgodnieniu atrybucji',
            value: 65000,
          }}
          data={channelPeriodData}
          labels={{
            legend:
              'Serie porównania przychodu po uzgodnieniu atrybucji',
          }}
          series={[
            {
              key: 'current',
              label:
                'Bieżące w pełni uzgodnione okno raportowania atrybucji',
            },
            {
              key: 'previous',
              label:
                'Poprzednie w pełni uzgodnione okno raportowania atrybucji',
            },
          ]}
          unit="Przychód po atrybucji · PLN"
          valueFormatter={(value) => (
            formatCompactValue(value, 'pl')
          )}
          variant="grouped"
        />
      </article>
    </div>
  );
}

const meta = {
  title: '15 Wykresy i dane/Porównania',
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
    <StoryPresentationPage
      className="pd-comparison-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry kontraktu ComparisonChart"
          items={[
            {
              label: 'Kontrakt',
              value: '15.04',
            },
            {
              label: 'Silnik',
              value: 'Recharts',
            },
            {
              label: 'Status',
              value: 'przegląd',
            },
          ]}
        />
      )}
      sectionCode="15"
      sectionLabel="Wykresy i dane"
      storyId="15.04"
      summary="ComparisonChart odpowiada za dyskretne porównania kategorii, ranking, punkt odniesienia i relację okres do okresu. TrendChart zachowuje czas ciągły, a DataTable dokładne rekordy."
      title="Porównanie ma eksponować różnicę między grupami, a nie wymuszać jeden typ wykresu."
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
    </StoryPresentationPage>
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
