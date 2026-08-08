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
  ShareChart,
} from '../../../design-system/components';
import type {
  ShareChartSegment,
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
import './share-chart-showcase.css';

const channelShareSegments: readonly ShareChartSegment[] = [
  {
    id: 'search',
    label: 'Search',
    value: 114300,
    percent: 46,
  },
  {
    id: 'meta',
    label: 'Meta',
    value: 79494,
    percent: 32,
  },
  {
    id: 'direct',
    label: 'Direct',
    value: 34779,
    percent: 14,
  },
  {
    id: 'email',
    label: 'Email',
    value: 14905,
    percent: 6,
  },
  {
    id: 'affiliate',
    label: 'Affiliate',
    value: 4968,
    percent: 2,
  },
];

const productMixSegments: readonly ShareChartSegment[] = [
  {
    id: 'grinders',
    label: 'Młynki',
    value: 48200,
    percent: 38,
  },
  {
    id: 'coffee',
    label: 'Kawa',
    value: 37840,
    percent: 30,
  },
  {
    id: 'sets',
    label: 'Zestawy',
    value: 29500,
    percent: 23,
  },
  {
    id: 'filters',
    label: 'Filtry',
    value: 11420,
    percent: 9,
  },
];

const customerMixSegments: readonly ShareChartSegment[] = [
  {
    id: 'returning',
    label: 'Powracający klienci',
    value: 164000,
    percent: 66,
  },
  {
    id: 'new',
    label: 'Nowi klienci',
    value: 84420,
    percent: 34,
  },
];

const longCopySegments: readonly ShareChartSegment[] = [
  {
    id: 'organic-reconciled',
    label: 'Organic search after revenue attribution reconciliation',
    value: 142000,
    percent: 42,
  },
  {
    id: 'paid-reconciled',
    label: 'Paid media campaigns with delayed conversion windows',
    value: 108000,
    percent: 32,
  },
  {
    id: 'retention-reconciled',
    label: 'Lifecycle and retention automations after consent filtering',
    value: 88000,
    percent: 26,
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

function formatCurrency(
  value: number,
  locale: PapaDataRuntimeLocale,
): string {
  const formatted = formatCompactValue(
    value,
    locale,
  );

  return locale === 'en'
    ? `PLN ${formatted}`
    : `${formatted} zł`;
}

function formatPercent(
  value: number,
  locale: PapaDataRuntimeLocale,
): string {
  return new Intl.NumberFormat(
    locale === 'en'
      ? 'en-GB'
      : 'pl-PL',
    {
      maximumFractionDigits: 1,
      style: 'percent',
    },
  ).format(value / 100);
}

function CanonicalShareComposition() {
  const locale = readLocale();

  return (
    <ChartFrame
      businessQuestion={
        locale === 'en'
          ? 'What is the current revenue structure by acquisition channel?'
          : 'Jak wygląda bieżąca struktura przychodu według kanałów akwizycji?'
      }
      description={
        locale === 'en'
          ? 'ShareChart shows part-to-whole composition. ChartFrame keeps status, freshness, source and the business conclusion.'
          : 'ShareChart pokazuje relację części do całości. ChartFrame utrzymuje status, świeżość, źródło i wniosek biznesowy.'
      }
      freshnessLabel={formatPapaDataRelativeTime(
        -9,
        'minute',
        locale,
      )}
      rangeLabel={
        locale === 'en'
          ? 'Last 30 days'
          : 'Ostatnie 30 dni'
      }
      sourceLabel="GA4 + Shop"
      status="ready"
      statusLabel={
        locale === 'en'
          ? 'Current data'
          : 'Dane aktualne'
      }
      summary={
        locale === 'en'
          ? 'Search and Meta jointly explain 78% of revenue. The chart answers composition, not period-to-period change.'
          : 'Search i Meta wyjaśniają łącznie 78% przychodu. Wykres odpowiada na strukturę, a nie zmianę okres do okresu.'
      }
      title={
        locale === 'en'
          ? 'Search and Meta dominate revenue structure'
          : 'Search i Meta dominują strukturę przychodu'
      }
      visualization={(
        <ShareChart
          ariaLabel={
            locale === 'en'
              ? 'Revenue share by acquisition channel'
              : 'Udział przychodu według kanału akwizycji'
          }
          display="donut"
          labels={{
            legend: locale === 'en'
              ? 'Revenue share segments'
              : 'Segmenty udziału przychodu',
            total: locale === 'en'
              ? 'Total'
              : 'Razem',
          }}
          percentFormatter={(value) => (
            formatPercent(value, locale)
          )}
          segments={channelShareSegments}
          total={248420}
          valueFormatter={(value) => (
            formatCurrency(value, locale)
          )}
        />
      )}
      visualizationLabel={
        locale === 'en'
          ? 'Channel revenue share'
          : 'Udział przychodu kanałów'
      }
    />
  );
}

function ShareVariants() {
  const locale = readLocale();

  return (
    <div className="pd-share-story__variants">
      <article className="pd-share-story__variant">
        <header>
          <span>donut</span>
          <h3>
            {locale === 'en'
              ? 'Few segments, clear whole'
              : 'Mało segmentów, czytelna całość'}
          </h3>
          <p>
            {locale === 'en'
              ? 'Donut is reserved for a small number of distinguishable segments and always keeps a textual legend.'
              : 'Donut jest zarezerwowany dla małej liczby rozróżnialnych segmentów i zawsze zachowuje tekstową legendę.'}
          </p>
        </header>

        <ShareChart
          ariaLabel={
            locale === 'en'
              ? 'Product revenue mix as donut'
              : 'Mix przychodu produktów jako donut'
          }
          display="donut"
          percentFormatter={(value) => (
            formatPercent(value, locale)
          )}
          segments={productMixSegments}
          total={126960}
          valueFormatter={(value) => (
            formatCurrency(value, locale)
          )}
        />
      </article>

      <article className="pd-share-story__variant">
        <header>
          <span>bar</span>
          <h3>
            {locale === 'en'
              ? 'Readable share ranking'
              : 'Czytelny ranking udziałów'}
          </h3>
          <p>
            {locale === 'en'
              ? 'Horizontal bars keep labels and values close when the user needs to compare segment weights.'
              : 'Poziome słupki utrzymują etykiety i wartości blisko siebie, gdy użytkownik porównuje wagę segmentów.'}
          </p>
        </header>

        <ShareChart
          ariaLabel={
            locale === 'en'
              ? 'Product revenue mix as share bars'
              : 'Mix przychodu produktów jako słupki udziału'
          }
          display="bar"
          percentFormatter={(value) => (
            formatPercent(value, locale)
          )}
          segments={productMixSegments}
          total={126960}
          valueFormatter={(value) => (
            formatCurrency(value, locale)
          )}
        />
      </article>

      <article className="pd-share-story__variant">
        <header>
          <span>stacked</span>
          <h3>
            {locale === 'en'
              ? 'Compact 100% structure'
              : 'Kompaktowa struktura 100%'}
          </h3>
          <p>
            {locale === 'en'
              ? 'A stacked bar compresses the whole into one line while the legend remains the accessible explanation.'
              : 'Stacked bar kompresuje całość do jednej linii, a legenda pozostaje dostępnym objaśnieniem.'}
          </p>
        </header>

        <ShareChart
          ariaLabel={
            locale === 'en'
              ? 'Customer revenue split as a stacked share bar'
              : 'Podział przychodu klientów jako stacked share bar'
          }
          display="stacked"
          percentFormatter={(value) => (
            formatPercent(value, locale)
          )}
          segments={customerMixSegments}
          total={248420}
          valueFormatter={(value) => (
            formatCurrency(value, locale)
          )}
        />
      </article>
    </div>
  );
}

function DecisionGuide() {
  const locale = readLocale();

  return (
    <dl className="pd-share-story__decision-guide">
      <div>
        <dt>ShareChart</dt>
        <dd>
          {locale === 'en'
            ? 'Use for part-to-whole questions: channel share, product mix, customer mix or revenue composition.'
            : 'Używaj do pytań część–całość: udział kanałów, mix produktów, mix klientów lub struktura przychodu.'}
        </dd>
      </div>

      <div>
        <dt>ComparisonChart</dt>
        <dd>
          {locale === 'en'
            ? 'Use when the question is which category is bigger, ranked or above a benchmark.'
            : 'Używaj, gdy pytanie brzmi: która kategoria jest większa, wyżej w rankingu albo ponad benchmarkiem.'}
        </dd>
      </div>

      <div>
        <dt>TrendChart</dt>
        <dd>
          {locale === 'en'
            ? 'Use when the x-axis is continuous time and the question is temporal change.'
            : 'Używaj, gdy oś X jest ciągłym czasem, a pytanie dotyczy zmiany w czasie.'}
        </dd>
      </div>

      <div>
        <dt>DataTable</dt>
        <dd>
          {locale === 'en'
            ? 'Use when exact records, sorting or row actions matter more than the visual share.'
            : 'Używaj, gdy dokładne rekordy, sortowanie albo akcje wiersza są ważniejsze niż wizualny udział.'}
        </dd>
      </div>

      <div>
        <dt>negative values</dt>
        <dd>
          {locale === 'en'
            ? 'ShareChart does not encode negative values. A negative contribution belongs to ComparisonChart or WaterfallChart, not to part-to-whole composition.'
            : 'ShareChart nie koduje wartości ujemnych. Ujemny wkład należy do ComparisonChart albo WaterfallChart, nie do kompozycji część–całość.'}
        </dd>
      </div>
    </dl>
  );
}

function LongCopyAndEdgeCases() {
  return (
    <div className="pd-share-story__variants">
      <article className="pd-share-story__variant">
        <header>
          <span>long copy</span>
          <h3>
            Revenue structure after attribution and consent reconciliation
          </h3>
          <p>
            Long segment labels wrap in the HTML legend and metadata
            without widening the plot or adding horizontal page scroll.
          </p>
        </header>

        <ShareChart
          ariaLabel="Revenue structure after attribution and consent reconciliation"
          display="bar"
          labels={{
            legend:
              'Revenue share segments after attribution and consent reconciliation',
          }}
          percentFormatter={(value) => (
            formatPercent(value, 'en')
          )}
          segments={longCopySegments}
          total={338000}
          valueFormatter={(value) => (
            formatCurrency(value, 'en')
          )}
        />
      </article>

      <article className="pd-share-story__variant">
        <header>
          <span>single segment</span>
          <h3>Jeden segment nadal pozostaje strukturą 100%</h3>
          <p>
            Pojedynczy segment nie uruchamia osobnego komponentu.
            Legenda i metadane zachowują ten sam kontrakt.
          </p>
        </header>

        <ShareChart
          ariaLabel="Udział jednego segmentu w całości"
          display="stacked"
          segments={[
            {
              id: 'single',
              label: 'Shopify',
              value: 248420,
              percent: 100,
            },
          ]}
          total={248420}
          valueFormatter={(value) => (
            formatCurrency(value, 'pl')
          )}
        />
      </article>
    </div>
  );
}

const meta = {
  title: '15 Wykresy i dane/Udziały i struktura',
  component: ShareChart,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'ShareChart jest runtime ownerem 15.05. Recharts odpowiada za geometrię donut/bar/stacked, a PapaData za semantykę udziału, legendę, wartości tekstowe, responsywność i dostępność.',
      },
    },
  },
} satisfies Meta<typeof ShareChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ShareChartStory: Story = {
  args: {
    ariaLabel: 'Udział przychodu według kanału akwizycji',
    display: 'donut',
    segments: channelShareSegments,
    total: 248420,
  },
  name: 'Udziały i struktura',
  render: () => (
    <StoryPresentationPage
      className="pd-share-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry kontraktu ShareChart"
          items={[
            {
              label: 'Kontrakt',
              value: '15.05',
            },
            {
              label: 'Engine',
              value: 'Recharts',
            },
            {
              label: 'Status',
              value: 'review',
            },
          ]}
        />
      )}
      sectionCode="15"
      sectionLabel="Wykresy i dane"
      storyId="15.05"
      summary="ShareChart odpowiada za pytania część–całość: donut, bar i stacked pokazują udział segmentów bez przejmowania porównań, trendów, tabel ani interakcji."
      title="Udział ma pokazywać strukturę całości, a nie zastępować porównania albo trendu."
    >
      <StoryPresentationSection
        index="01"
        summary="ChartFrame konsumuje gotowy ShareChart. Status, źródła, świeżość i wniosek pozostają w kontenerze, a wizualizacja odpowiada tylko za strukturę udziałów."
        title="Kanoniczna kompozycja"
      >
        <CanonicalShareComposition />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        summary="Donut pokazuje małą liczbę segmentów. Bar wzmacnia porównywalność udziałów. Stacked bar kompresuje strukturę 100%."
        title="Donut, bar i stacked"
      >
        <ShareVariants />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="03"
        summary="ShareChart nie przejmuje pytań o ranking, czas, rekordy ani wartości ujemne. Te odpowiedzialności zostają u właściwych ownerów."
        title="Granice względem innych wykresów"
      >
        <DecisionGuide />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="04"
        summary="Długi copy i pojedynczy segment zachowują legendę, metadane oraz brak poziomego scrolla."
        title="Długi copy i przypadki brzegowe"
      >
        <LongCopyAndEdgeCases />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole(
        'group',
        {
          name: 'Udział przychodu według kanału akwizycji',
        },
      ),
    ).toBeInTheDocument();

    for (const display of [
      'donut',
      'bar',
      'stacked',
    ] as const) {
      const element = canvasElement.querySelector(
        `[data-component="share-chart"][data-display="${display}"]`,
      );

      if (!element) {
        throw new Error(
          `Missing ShareChart display: ${display}`,
        );
      }

      await expect(element).toHaveAttribute(
        'data-display',
        display,
      );
    }

    await expect(
      canvas.getByText('ComparisonChart'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('TrendChart'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('DataTable'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('negative values'),
    ).toBeInTheDocument();
  },
};
