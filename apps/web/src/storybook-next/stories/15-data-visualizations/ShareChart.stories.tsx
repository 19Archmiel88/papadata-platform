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
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import {
  AnalyticsChartSurface,
  Localized,
  readAnalyticsLocale as readLocale,
  Story15Page,
} from './analytics-story-helpers';
import './share-chart-showcase.css';

const channelShareSegments: readonly ShareChartSegment[] = [
  {
    id: 'search',
    label: 'Wyszukiwarka',
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
    label: 'Bezpośredni',
    value: 34779,
    percent: 14,
  },
  {
    id: 'email',
    label: 'E-mail',
    value: 14905,
    percent: 6,
  },
  {
    id: 'affiliate',
    label: 'Partnerzy',
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
    label: 'Ruch organiczny po uzgodnieniu atrybucji przychodu',
    value: 142000,
    percent: 42,
  },
  {
    id: 'paid-reconciled',
    label: 'Płatne kampanie mediowe z opóźnionymi oknami konwersji',
    value: 108000,
    percent: 32,
  },
  {
    id: 'retention-reconciled',
    label: 'Automatyzacje cyklu życia i retencji po filtrowaniu zgód',
    value: 88000,
    percent: 26,
  },
];

const shareSegmentLabelCopy: Record<
  string,
  Record<PapaDataRuntimeLocale, string>
> = {
  affiliate: {
    en: 'Affiliates',
    pl: 'Partnerzy',
  },
  coffee: {
    en: 'Coffee',
    pl: 'Kawa',
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
    en: 'Filters',
    pl: 'Filtry',
  },
  grinders: {
    en: 'Grinders',
    pl: 'Młynki',
  },
  meta: {
    en: 'Meta',
    pl: 'Meta',
  },
  new: {
    en: 'New customers',
    pl: 'Nowi klienci',
  },
  'organic-reconciled': {
    en: 'Organic traffic after revenue attribution reconciliation',
    pl: 'Ruch organiczny po uzgodnieniu atrybucji przychodu',
  },
  'paid-reconciled': {
    en: 'Paid media campaigns with delayed conversion windows',
    pl: 'Płatne kampanie mediowe z opóźnionymi oknami konwersji',
  },
  retention: {
    en: 'Retention',
    pl: 'Retencja',
  },
  'retention-reconciled': {
    en: 'Lifecycle and retention automations after consent filtering',
    pl: 'Automatyzacje cyklu życia i retencji po filtrowaniu zgód',
  },
  returning: {
    en: 'Returning customers',
    pl: 'Powracający klienci',
  },
  search: {
    en: 'Search',
    pl: 'Wyszukiwarka',
  },
  sets: {
    en: 'Sets',
    pl: 'Zestawy',
  },
  single: {
    en: 'Shopify',
    pl: 'Shopify',
  },
};

function localizeShareSegments(
  segments: readonly ShareChartSegment[],
  locale: PapaDataRuntimeLocale,
): readonly ShareChartSegment[] {
  return segments.map((segment) => ({
    ...segment,
    label: shareSegmentLabelCopy[segment.id]?.[locale] ?? segment.label,
  }));
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
          : 'Wyszukiwarka i Meta wyjaśniają łącznie 78% przychodu. Wykres odpowiada na strukturę, a nie zmianę okres do okresu.'
      }
      title={
        locale === 'en'
          ? 'Search and Meta dominate revenue structure'
          : 'Wyszukiwarka i Meta dominują strukturę przychodu'
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
          segments={localizeShareSegments(channelShareSegments, locale)}
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
  const localizedProductMixSegments = localizeShareSegments(
    productMixSegments,
    locale,
  );
  const localizedCustomerMixSegments = localizeShareSegments(
    customerMixSegments,
    locale,
  );

  return (
    <div className="pd-share-story__variants">
      <article className="pd-share-story__variant">
        <header>
          <span>pierścień</span>
          <h3>
            {locale === 'en'
              ? 'Few segments, clear whole'
              : 'Mało segmentów, czytelna całość'}
          </h3>
          <p>
            {locale === 'en'
              ? 'Donut is reserved for a small number of distinguishable segments and always keeps a textual legend.'
              : 'Wykres pierścieniowy jest zarezerwowany dla małej liczby rozróżnialnych segmentów i zawsze zachowuje tekstową legendę.'}
          </p>
        </header>

        <AnalyticsChartSurface
          businessQuestion={{
            en: 'What is the product revenue mix?',
            pl: 'Jaka jest struktura przychodu produktów?',
          }}
          description={{
            en: 'The donut variant stays inside ChartFrame and keeps a textual legend as the accessible source of segment meaning.',
            pl: 'Wariant pierścieniowy pozostaje w ChartFrame i zachowuje tekstową legendę jako dostępne źródło znaczenia segmentów.',
          }}
          rangeLabel={{
            en: 'Product mix',
            pl: 'Struktura produktów',
          }}
          sourceLabel="ShareChart / ChartFrame"
          title={{
            en: 'Product revenue mix as donut',
            pl: 'Struktura przychodu produktów jako pierścień',
          }}
          visualizationLabel={{
            en: 'Product revenue mix as donut',
            pl: 'Struktura przychodu produktów jako wykres pierścieniowy',
          }}
        >
          <ShareChart
            ariaLabel={
              locale === 'en'
                ? 'Product revenue mix as donut'
                : 'Struktura przychodu produktów jako wykres pierścieniowy'
            }
            display="donut"
            percentFormatter={(value) => (
              formatPercent(value, locale)
            )}
            segments={localizedProductMixSegments}
            total={126960}
            valueFormatter={(value) => (
              formatCurrency(value, locale)
            )}
          />
        </AnalyticsChartSurface>
      </article>

      <article className="pd-share-story__variant">
        <header>
          <span>słupki</span>
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

        <AnalyticsChartSurface
          businessQuestion={{
            en: 'Which product group has the largest share?',
            pl: 'Która grupa produktów ma największy udział?',
          }}
          description={{
            en: 'Share bars improve comparability without changing the part-to-whole question.',
            pl: 'Słupki udziału zwiększają porównywalność bez zmiany pytania o część całości.',
          }}
          rangeLabel={{
            en: 'Product mix',
            pl: 'Struktura produktów',
          }}
          sourceLabel="ShareChart / ChartFrame"
          title={{
            en: 'Product revenue mix as share bars',
            pl: 'Struktura przychodu produktów jako słupki',
          }}
          visualizationLabel={{
            en: 'Product revenue mix as share bars',
            pl: 'Struktura przychodu produktów jako słupki udziału',
          }}
        >
          <ShareChart
            ariaLabel={
              locale === 'en'
                ? 'Product revenue mix as share bars'
                : 'Struktura przychodu produktów jako słupki udziału'
            }
            display="bar"
            percentFormatter={(value) => (
              formatPercent(value, locale)
            )}
            segments={localizedProductMixSegments}
            total={126960}
            valueFormatter={(value) => (
              formatCurrency(value, locale)
            )}
          />
        </AnalyticsChartSurface>
      </article>

      <article className="pd-share-story__variant">
        <header>
          <span>skumulowane</span>
          <h3>
            {locale === 'en'
              ? 'Compact 100% structure'
              : 'Kompaktowa struktura 100%'}
          </h3>
          <p>
            {locale === 'en'
              ? 'A stacked bar compresses the whole into one line while the legend remains the accessible explanation.'
              : 'Słupek skumulowany kompresuje całość do jednej linii, a legenda pozostaje dostępnym objaśnieniem.'}
          </p>
        </header>

        <AnalyticsChartSurface
          businessQuestion={{
            en: 'How does revenue split between returning and new customers?',
            pl: 'Jak przychód dzieli się między klientów powracających i nowych?',
          }}
          description={{
            en: 'The stacked variant compresses the whole into one track while ChartFrame keeps source, status and summary text.',
            pl: 'Wariant skumulowany kompresuje całość do jednej ścieżki, a ChartFrame utrzymuje źródło, status i wniosek.',
          }}
          rangeLabel={{
            en: 'Customer mix',
            pl: 'Struktura klientów',
          }}
          sourceLabel="ShareChart / ChartFrame"
          title={{
            en: 'Customer revenue split',
            pl: 'Podział przychodu klientów',
          }}
          visualizationLabel={{
            en: 'Customer revenue split as a stacked share bar',
            pl: 'Podział przychodu klientów jako skumulowany słupek udziału',
          }}
        >
          <ShareChart
            ariaLabel={
              locale === 'en'
                ? 'Customer revenue split as a stacked share bar'
                : 'Podział przychodu klientów jako skumulowany słupek udziału'
            }
            display="stacked"
            percentFormatter={(value) => (
              formatPercent(value, locale)
            )}
            segments={localizedCustomerMixSegments}
            total={248420}
            valueFormatter={(value) => (
              formatCurrency(value, locale)
            )}
          />
        </AnalyticsChartSurface>
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
            : 'Używaj do pytań część–całość: udział kanałów, struktura produktów, struktura klientów lub struktura przychodu.'}
        </dd>
      </div>

      <div>
        <dt>ComparisonChart</dt>
        <dd>
          {locale === 'en'
            ? 'Use when the question is which category is bigger, ranked or above a benchmark.'
            : 'Używaj, gdy pytanie brzmi: która kategoria jest większa, wyżej w rankingu albo ponad punktem odniesienia.'}
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
        {/* Validator marker: negative values. */}
        <dt>wartości ujemne</dt>
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
  const locale = readLocale();

  return (
    <div className="pd-share-story__variants">
      <article className="pd-share-story__variant">
        <header>
          <span>{locale === 'en' ? 'long copy' : 'długi tekst'}</span>
          <h3>
            {locale === 'en'
              ? 'Revenue mix after attribution and consent reconciliation'
              : 'Struktura przychodu po uzgodnieniu atrybucji i zgód'}
          </h3>
          <p>
            {locale === 'en'
              ? 'Long segment labels wrap in the HTML legend and metadata without widening the chart or adding horizontal page scroll.'
              : 'Długie etykiety segmentów zawijają się w legendzie HTML i metadanych bez poszerzania wykresu ani dodawania poziomego przewijania strony.'}
          </p>
        </header>

        <AnalyticsChartSurface
          businessQuestion={{
            en: 'Can long segment labels stay readable?',
            pl: 'Czy długie etykiety segmentów pozostają czytelne?',
          }}
          description={{
            en: 'Long labels are a reflow case for the shared data surface, not a new share-chart surface.',
            pl: 'Długie etykiety są przypadkiem reflow wspólnej powierzchni danych, nie nową powierzchnią wykresu udziałów.',
          }}
          rangeLabel={{
            en: 'Long-copy regression',
            pl: 'Regresja długiego tekstu',
          }}
          sourceLabel="ShareChart / ChartFrame"
          title={{
            en: 'Revenue mix after attribution and consent reconciliation',
            pl: 'Struktura przychodu po uzgodnieniu atrybucji i zgód',
          }}
          visualizationLabel={{
            en: 'Revenue mix after attribution and consent reconciliation',
            pl: 'Struktura przychodu po uzgodnieniu atrybucji i zgód',
          }}
        >
          <ShareChart
            ariaLabel={
              locale === 'en'
                ? 'Revenue mix after attribution and consent reconciliation'
                : 'Struktura przychodu po uzgodnieniu atrybucji i zgód'
            }
            display="bar"
            labels={{
              legend: locale === 'en'
                ? 'Revenue share segments after attribution and consent reconciliation'
                : 'Segmenty udziału przychodu po uzgodnieniu atrybucji i zgód',
            }}
            percentFormatter={(value) => (
              formatPercent(value, locale)
            )}
            segments={localizeShareSegments(longCopySegments, locale)}
            total={338000}
            valueFormatter={(value) => (
              formatCurrency(value, locale)
            )}
          />
        </AnalyticsChartSurface>
      </article>

      <article className="pd-share-story__variant">
        <header>
          <span>{locale === 'en' ? 'single segment' : 'jeden segment'}</span>
          <h3>
            {locale === 'en'
              ? 'One segment still remains a 100% structure'
              : 'Jeden segment nadal pozostaje strukturą 100%'}
          </h3>
          <p>
            {locale === 'en'
              ? 'A single segment does not activate a separate component. Legend and metadata keep the same contract.'
              : 'Pojedynczy segment nie uruchamia osobnego komponentu. Legenda i metadane zachowują ten sam kontrakt.'}
          </p>
        </header>

        <AnalyticsChartSurface
          businessQuestion={{
            en: 'Does a single segment preserve the same contract?',
            pl: 'Czy pojedynczy segment zachowuje ten sam kontrakt?',
          }}
          description={{
            en: 'One segment still renders text, value and 100% structure inside the shared ChartFrame surface.',
            pl: 'Jeden segment nadal renderuje tekst, wartość i strukturę 100% we wspólnej powierzchni ChartFrame.',
          }}
          rangeLabel={{
            en: 'Single segment',
            pl: 'Jeden segment',
          }}
          sourceLabel="ShareChart / ChartFrame"
          title={{
            en: 'Single segment share',
            pl: 'Udział jednego segmentu',
          }}
          visualizationLabel={{
            en: 'Single segment share of the whole',
            pl: 'Udział jednego segmentu w całości',
          }}
        >
          <ShareChart
            ariaLabel={
              locale === 'en'
                ? 'Single segment share of the whole'
                : 'Udział jednego segmentu w całości'
            }
            display="stacked"
            segments={localizeShareSegments([
              {
                id: 'single',
                label: 'Shopify',
                value: 248420,
                percent: 100,
              },
            ], locale)}
            total={248420}
            valueFormatter={(value) => (
              formatCurrency(value, locale)
            )}
          />
        </AnalyticsChartSurface>
      </article>
    </div>
  );
}

const meta = {
  title: '15 Wykresy i dane/02 Rodziny wykresów/Udziały i struktura',
  component: ShareChart,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'ShareChart jest właścicielem wykonania 15.05. Recharts odpowiada za geometrię wariantów pierścieniowych, słupkowych i skumulowanych, a PapaData za semantykę udziału, legendę, wartości tekstowe, responsywność i dostępność.',
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
    <Story15Page
      className="pd-share-story"
      metaAriaLabel={{
        en: 'ShareChart contract parameters',
        pl: 'Parametry kontraktu ShareChart',
      }}
      metaItems={[
        {
          label: <Localized pl="Kontrakt" en="Contract" />,
          value: '15.05',
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
      storyId="15.05"
      summary={(
        <Localized
          en="ShareChart owns part-to-whole questions: donut, bar and stacked variants show segment share without taking over comparisons, trends, tables or interactions."
          pl="ShareChart odpowiada za pytania część–całość: wariant pierścieniowy, słupkowy i skumulowany pokazują udział segmentów bez przejmowania porównań, trendów, tabel ani interakcji."
        />
      )}
      title={(
        <Localized
          en="A share chart should show the structure of a whole, not replace comparison or trend."
          pl="Udział ma pokazywać strukturę całości, a nie zastępować porównania albo trendu."
        />
      )}
    >
      <StoryPresentationSection
        index="01"
        summary="ChartFrame konsumuje gotowy ShareChart. Status, źródła, świeżość i wniosek pozostają w powierzchni nadrzędnej, a wizualizacja odpowiada tylko za strukturę udziałów."
        title="Kanoniczna kompozycja"
      >
        <CanonicalShareComposition />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        summary="Wariant pierścieniowy pokazuje małą liczbę segmentów. Słupki wzmacniają porównywalność udziałów. Słupek skumulowany kompresuje strukturę 100%."
        title="Pierścień, słupki i struktura 100%"
      >
        <ShareVariants />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="03"
        summary="ShareChart nie przejmuje pytań o ranking, czas, rekordy ani wartości ujemne. Te odpowiedzialności zostają u właściwych właścicieli."
        title="Granice względem innych wykresów"
      >
        <DecisionGuide />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="04"
        summary="Długi tekst i pojedynczy segment zachowują legendę, metadane oraz brak poziomego przewijania."
        title="Długi tekst i przypadki brzegowe"
      >
        <LongCopyAndEdgeCases />
      </StoryPresentationSection>
    </Story15Page>
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
      canvas.getByText('wartości ujemne'),
    ).toBeInTheDocument();
  },
};
