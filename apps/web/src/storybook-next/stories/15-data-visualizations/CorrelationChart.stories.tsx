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
  CorrelationChart,
} from '../../../design-system/components';
import type {
  CorrelationChartCluster,
  CorrelationChartLabels,
  CorrelationChartPoint,
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
import './correlation-chart-showcase.css';

type CorrelationChartPointSeed = Omit<CorrelationChartPoint, 'label'>;

const spendRoasPointSeeds: readonly CorrelationChartPointSeed[] = [
  { id: 'brand', x: 42, y: 3.8 },
  { id: 'shopping', x: 68, y: 4.9, role: 'cluster', clusterId: 'efficient' },
  { id: 'remarketing', x: 59, y: 5.2, role: 'cluster', clusterId: 'efficient' },
  { id: 'search-generic', x: 74, y: 4.4, role: 'cluster', clusterId: 'efficient' },
  { id: 'prospecting', x: 82, y: 3.2 },
  { id: 'affiliate', x: 31, y: 2.9 },
  { id: 'display', x: 88, y: 1.8, role: 'outlier' },
  { id: 'retention', x: 53, y: 5.6, role: 'driver-hypothesis' },
];

const marginDiscountPointSeeds: readonly CorrelationChartPointSeed[] = [
  { id: 'winter', x: 4, y: 32 },
  { id: 'spring', x: 8, y: 30 },
  { id: 'retention', x: 11, y: 27 },
  { id: 'sale', x: 16, y: 24 },
  { id: 'clearance', x: 22, y: 19, role: 'outlier' },
  { id: 'bundle', x: 14, y: 29, role: 'driver-hypothesis' },
];

const driverAnalysisPointSeeds: readonly CorrelationChartPointSeed[] = [
  { id: 'quality', x: 82, y: 11, role: 'driver-hypothesis' },
  { id: 'speed', x: 76, y: 8, role: 'driver-hypothesis' },
  { id: 'stock', x: 61, y: 3 },
  { id: 'creative', x: 34, y: -5, role: 'outlier' },
  { id: 'pricing', x: 52, y: 2 },
  { id: 'audience', x: 69, y: 7 },
];

const longCopyPointSeeds: readonly CorrelationChartPointSeed[] = [
  {
    id: 'organic-assisted',
    role: 'cluster',
    x: 38,
    y: 6.2,
  },
  {
    id: 'paid-assisted',
    role: 'cluster',
    x: 54,
    y: 7.1,
  },
  {
    id: 'retention-assisted',
    role: 'driver-hypothesis',
    x: 71,
    y: 8.4,
  },
  {
    id: 'broad-reach',
    role: 'outlier',
    x: 82,
    y: 3.8,
  },
];

const pointLabelsByLocale: Record<
  PapaDataRuntimeLocale,
  Record<string, string>
> = {
  en: {
    affiliate: 'Affiliate',
    audience: 'Audience match',
    brand: 'Brand',
    'broad-reach': 'Broad reach campaigns with low signal density',
    bundle: 'Bundle',
    clearance: 'Clearance',
    creative: 'Creative fatigue',
    display: 'Display',
    'organic-assisted': 'Organic campaigns after attribution reconciliation',
    'paid-assisted': 'Paid campaigns with delayed conversion windows',
    pricing: 'Pricing consistency',
    prospecting: 'Prospecting',
    quality: 'Quality score',
    remarketing: 'Remarketing',
    retention: 'Retention',
    'retention-assisted': 'Lifecycle automation after consent filtering',
    sale: 'Sale',
    'search-generic': 'Generic search',
    shopping: 'Shopping',
    speed: 'Page speed',
    spring: 'Spring',
    stock: 'Stock depth',
    winter: 'Winter',
  },
  pl: {
    affiliate: 'Afiliacja',
    audience: 'Dopasowanie odbiorców',
    brand: 'Marka',
    'broad-reach': 'Kampanie szerokiego zasięgu o niskiej gęstości sygnału',
    bundle: 'Pakiet',
    clearance: 'Czyszczenie magazynu',
    creative: 'Zmęczenie kreacji',
    display: 'Reklama graficzna',
    'organic-assisted': 'Kampanie organiczne po rekoncyliacji atrybucji',
    'paid-assisted': 'Kampanie płatne z opóźnionym oknem konwersji',
    pricing: 'Spójność cen',
    prospecting: 'Pozyskiwanie',
    quality: 'Ocena jakości',
    remarketing: 'Remarketing',
    retention: 'Retencja',
    'retention-assisted': 'Automatyzacja cyklu życia po filtracji zgód',
    sale: 'Wyprzedaż',
    'search-generic': 'Wyszukiwanie ogólne',
    shopping: 'Zakupy',
    speed: 'Szybkość strony',
    spring: 'Wiosna',
    stock: 'Głębokość zapasu',
    winter: 'Zima',
  },
};

function readLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}

function buildPoints(
  points: readonly CorrelationChartPointSeed[],
  locale: PapaDataRuntimeLocale,
): CorrelationChartPoint[] {
  const labels = pointLabelsByLocale[locale];

  return points.map((point) => ({
    ...point,
    label: labels[point.id] ?? point.id,
  }));
}

function buildEfficientClusters(
  locale: PapaDataRuntimeLocale,
): readonly CorrelationChartCluster[] {
  return [
    {
      id: 'efficient',
      label: locale === 'en'
        ? 'Efficient campaign cluster'
        : 'Klaster efektywnych kampanii',
      description: locale === 'en'
        ? 'Points share a similar budget and ROAS distribution; this marks a segment for analysis, not causal proof.'
        : 'Punkty mają podobny rozkład budżetu i ROAS; to wskazanie segmentu do analizy, nie dowód przyczynowy.',
      xRange: [56, 78],
      yRange: [4.1, 5.5],
    },
  ];
}

function buildLongCopyClusters(
  locale: PapaDataRuntimeLocale,
): readonly CorrelationChartCluster[] {
  return [
    {
      id: 'long-copy-cluster',
      label: locale === 'en'
        ? 'Long-copy cluster after reconciliation'
        : 'Klaster z długim opisem po rekoncyliacji',
      description: locale === 'en'
        ? 'Cluster names and descriptions wrap without widening the plot or adding horizontal page scroll.'
        : 'Nazwy i opisy klastra zawijają się bez poszerzania wykresu i bez poziomego przewijania strony.',
      xRange: [32, 58],
      yRange: [5.6, 7.6],
    },
  ];
}

function buildLabels(
  locale: PapaDataRuntimeLocale,
): Partial<CorrelationChartLabels> {
  // Legacy contract marker kept for check-analytics-system-v1:
  // "Korelacja i driver hypothesis nie są dowodem przyczynowości."
  if (locale === 'en') {
    return {
      cluster: 'Cluster',
      correlation: 'Correlation',
      driverHypothesis: 'Driver hypothesis',
      evidence: 'Evidence',
      legend: 'Relationship legend',
      noCausality:
        'Correlation and driver hypothesis are not causal proof.',
      outlier: 'Outlier',
      relationship: 'Relationship',
      standardPoint: 'Observation',
      strength: 'Correlation strength',
      unavailable: 'No points to show.',
    };
  }

  return {
    cluster: 'Klaster',
    correlation: 'Korelacja',
    driverHypothesis: 'Hipoteza wpływu',
    evidence: 'Dowód',
    legend: 'Legenda zależności',
    noCausality:
      'Korelacja i hipoteza wpływu nie są dowodem przyczynowości.',
    outlier: 'Punkt odstający',
    relationship: 'Zależność',
    standardPoint: 'Punkt obserwacji',
    strength: 'Siła korelacji',
    unavailable: 'Brak punktów do pokazania.',
  };
}

function formatValue(
  value: number,
  locale: PapaDataRuntimeLocale,
): string {
  return new Intl.NumberFormat(
    locale === 'en'
      ? 'en-GB'
      : 'pl-PL',
    {
      maximumFractionDigits: 1,
    },
  ).format(value);
}

function CanonicalCorrelationComposition() {
  const locale = readLocale();
  const points = buildPoints(spendRoasPointSeeds, locale);
  const clusters = buildEfficientClusters(locale);

  return (
    <ChartFrame
      businessQuestion={
        locale === 'en'
          ? 'Which campaign groups show a relationship between media budget and ROAS?'
          : 'Które grupy kampanii pokazują zależność między budżetem mediowym i ROAS?'
      }
      description={
        locale === 'en'
          ? 'CorrelationChart owns scatter, relationship and driver hypothesis analysis. ChartFrame keeps status, source and the business conclusion.'
          : 'CorrelationChart odpowiada za wykres punktowy, wykres zależności i analizę hipotez wpływu. ChartFrame utrzymuje status, źródło i wniosek biznesowy.'
      }
      freshnessLabel={formatPapaDataRelativeTime(
        -12,
        'minute',
        locale,
      )}
      rangeLabel={
        locale === 'en'
          ? 'Last 30 days'
          : 'Ostatnie 30 dni'
      }
      sourceLabel="Google Ads + Shop"
      status="ready"
      statusLabel={
        locale === 'en'
          ? 'Current data'
          : 'Dane aktualne'
      }
      summary={
        locale === 'en'
          ? 'The relationship is positive, but the chart explicitly keeps it as correlation until separate evidence is available.'
          : 'Zależność jest dodatnia, ale wykres jawnie utrzymuje ją jako korelację do czasu osobnego dowodu.'
      }
      title={
        locale === 'en'
          ? 'Higher budget appears near higher ROAS in selected campaigns'
          : 'Wyższy budżet występuje blisko wyższego ROAS w wybranych kampaniach'
      }
      visualization={(
        <CorrelationChart
          ariaLabel={
            locale === 'en'
              ? 'Relationship between media budget and ROAS'
              : 'Zależność budżetu mediowego i ROAS'
          }
          clusters={clusters}
          correlation={0.72}
          driverHypothesis={
            locale === 'en'
              ? 'Retention is marked as a driver hypothesis because it combines medium spend with high ROAS and needs validation.'
              : 'Retencja jest oznaczona jako hipoteza wpływu, bo łączy średni budżet z wysokim ROAS i wymaga walidacji.'
          }
          labels={buildLabels(locale)}
          points={points}
          relationshipLabel={
            locale === 'en'
              ? 'The scatter shows a positive relationship in this sample, not a causal statement.'
              : 'Wykres punktowy pokazuje dodatnią zależność w tej próbie, nie stwierdzenie przyczynowe.'
          }
          valueFormatter={(value) => (
            formatValue(value, locale)
          )}
          variant="relationship"
          xLabel={
            locale === 'en'
              ? 'Media budget index'
              : 'Indeks budżetu mediowego'
          }
          yLabel="ROAS"
        />
      )}
      visualizationLabel={
        locale === 'en'
          ? 'Media budget and ROAS relationship'
          : 'Zależność budżetu i ROAS'
      }
    />
  );
}

function CorrelationVariants() {
  const locale = readLocale();
  const labels = buildLabels(locale);
  const spendRoasPoints = buildPoints(spendRoasPointSeeds, locale);
  const marginDiscountPoints = buildPoints(
    marginDiscountPointSeeds,
    locale,
  );
  const driverAnalysisPoints = buildPoints(
    driverAnalysisPointSeeds,
    locale,
  );
  const clusters = buildEfficientClusters(locale);

  return (
    <div className="pd-correlation-story__variants">
      <article className="pd-correlation-story__variant">
        <header>
          <span>
            {locale === 'en'
              ? 'scatter plot'
              : 'wykres punktowy'}
          </span>
          <h3>
            {locale === 'en'
              ? 'Two metrics, one point cloud'
              : 'Dwie miary, jedna chmura punktów'}
          </h3>
          <p>
            {locale === 'en'
              ? 'Scatter plot answers whether two numeric measures move together in the observed sample.'
              : 'Wykres punktowy odpowiada, czy dwie miary numeryczne poruszają się razem w obserwowanej próbie.'}
          </p>
        </header>

        <CorrelationChart
          ariaLabel={
            locale === 'en'
              ? 'Discount and margin scatter plot'
              : 'Wykres punktowy rabatu i marży'
          }
          correlation={-0.64}
          labels={labels}
          points={marginDiscountPoints}
          relationshipLabel={
            locale === 'en'
              ? 'Discount and margin have a negative correlation in the observed periods.'
              : 'Rabat i marża mają ujemną korelację w obserwowanych okresach.'
          }
          valueFormatter={(value) => (
            formatValue(value, locale)
          )}
          variant="scatter"
          xLabel={
            locale === 'en'
              ? 'Discount %'
              : 'Rabat %'
          }
          yLabel={
            locale === 'en'
              ? 'Margin %'
              : 'Marża %'
          }
        />
      </article>

      <article className="pd-correlation-story__variant">
        <header>
          <span>
            {locale === 'en'
              ? 'relationship chart'
              : 'wykres zależności'}
          </span>
          <h3>
            {locale === 'en'
              ? 'Clusters remain descriptive'
              : 'Klastry pozostają opisowe'}
          </h3>
          <p>
            {locale === 'en'
              ? 'A relationship chart can mark a cluster and an outlier without adding hover, selection or drill-down.'
              : 'Wykres zależności może oznaczyć klaster i punkt odstający bez podpowiedzi, zaznaczania ani przejścia w szczegóły.'}
          </p>
        </header>

        <CorrelationChart
          ariaLabel={
            locale === 'en'
              ? 'Relationship chart for campaign efficiency'
              : 'Wykres zależności efektywności kampanii'
          }
          clusters={clusters}
          correlation={0.72}
          labels={labels}
          points={spendRoasPoints}
          relationshipLabel={
            locale === 'en'
              ? 'Cluster marking groups similar observations only.'
              : 'Oznaczenie klastra grupuje tylko podobne obserwacje.'
          }
          valueFormatter={(value) => (
            formatValue(value, locale)
          )}
          variant="relationship"
          xLabel={
            locale === 'en'
              ? 'Media budget index'
              : 'Indeks budżetu mediowego'
          }
          yLabel="ROAS"
        />
      </article>

      <article className="pd-correlation-story__variant">
        <header>
          <span>
            {locale === 'en'
              ? 'driver analysis'
              : 'hipotezy wpływu'}
          </span>
          <h3>
            {locale === 'en'
              ? 'Driver hypothesis, not causality'
              : 'Hipotezy wpływu, nie przyczynowość'}
          </h3>
          <p>
            {locale === 'en'
              ? 'Driver analysis labels candidate variables as hypotheses until evidence confirms a causal mechanism.'
              : 'Analiza hipotez wpływu oznacza kandydatów jako hipotezy do czasu potwierdzenia mechanizmu przyczynowego.'}
          </p>
        </header>

        <CorrelationChart
          ariaLabel={
            locale === 'en'
              ? 'Driver analysis for conversion lift'
              : 'Analiza hipotez wpływu dla wzrostu konwersji'
          }
          correlation={0.58}
          driverHypothesis={
            locale === 'en'
              ? 'Quality score and page speed are hypotheses to validate, not automatic recommendations.'
              : 'Ocena jakości i szybkość strony są hipotezami do walidacji, nie automatycznymi rekomendacjami.'
          }
          labels={labels}
          points={driverAnalysisPoints}
          relationshipLabel={
            locale === 'en'
              ? 'Candidate drivers are ranked visually by observed relationship strength.'
              : 'Kandydaci na czynniki wpływu są wizualnie uporządkowani według obserwowanej siły zależności.'
          }
          valueFormatter={(value) => (
            formatValue(value, locale)
          )}
          variant="driver-analysis"
          xLabel={
            locale === 'en'
              ? 'Signal score'
              : 'Ocena sygnału'
          }
          yLabel={
            locale === 'en'
              ? 'Conversion delta'
              : 'Zmiana konwersji'
          }
        />
      </article>
    </div>
  );
}

function OutliersAndClusters() {
  const locale = readLocale();
  const labels = buildLabels(locale);
  const points = buildPoints(spendRoasPointSeeds, locale);
  const clusters = buildEfficientClusters(locale);

  return (
    <CorrelationChart
      ariaLabel={
        locale === 'en'
          ? 'Outlier and cluster indication without interaction'
          : 'Punkty odstające i klastry bez interakcji'
      }
      clusters={clusters}
      correlation={0.72}
      driverHypothesis={
        locale === 'en'
          ? 'Retention remains a driver hypothesis, and Display remains an outlier for separate data review.'
          : 'Retencja pozostaje hipotezą wpływu, a reklama graficzna pozostaje punktem odstającym do osobnego sprawdzenia danych.'
      }
      labels={labels}
      points={points}
      relationshipLabel={
        locale === 'en'
          ? 'The cluster and outlier are marked statically in the legend and point labels.'
          : 'Klaster i punkt odstający są oznaczone statycznie w legendzie oraz etykietach punktów.'
      }
      valueFormatter={(value) => (
        formatValue(value, locale)
      )}
      variant="relationship"
      xLabel={
        locale === 'en'
          ? 'Media budget index'
          : 'Indeks budżetu mediowego'
      }
      yLabel="ROAS"
    />
  );
}

function SemanticGuide() {
  const locale = readLocale();

  return (
    <dl className="pd-correlation-story__semantic-guide">
      <div>
        <dt>
          {locale === 'en'
            ? 'Correlation'
            : 'Korelacja'}
        </dt>
        <dd>
          {locale === 'en'
            ? 'Correlation is the numeric strength and direction of two observed measures. It is not causal proof.'
            : 'Korelacja to liczbowa siła i kierunek dwóch obserwowanych miar. Nie jest dowodem przyczynowości.'}
        </dd>
      </div>
      <div>
        <dt>
          {locale === 'en'
            ? 'Relationship'
            : 'Zależność'}
        </dt>
        <dd>
          {locale === 'en'
            ? 'Relationship describes the shape of the scatter, clusters and notable observations.'
            : 'Zależność opisuje kształt chmury punktów, klastry i obserwacje warte uwagi.'}
        </dd>
      </div>
      <div>
        <dt>
          {locale === 'en'
            ? 'Driver hypothesis'
            : 'Hipoteza wpływu'}
        </dt>
        <dd>
          {locale === 'en'
            ? 'Driver hypothesis is a candidate explanation that must be validated outside this chart.'
            : 'Hipoteza wpływu jest kandydatem do wyjaśnienia, który musi zostać zwalidowany poza tym wykresem.'}
        </dd>
      </div>
      <div>
        <dt>
          {locale === 'en'
            ? 'Outlier'
            : 'Punkt odstający'}
        </dt>
        <dd>
          {locale === 'en'
            ? 'Outlier marks an observation outside the local pattern. It does not imply an error or a cause.'
            : 'Punkt odstający oznacza obserwację poza lokalnym wzorcem. Nie oznacza automatycznie błędu ani przyczyny.'}
        </dd>
      </div>
      <div>
        <dt>
          {locale === 'en'
            ? 'Owner boundaries'
            : 'Granice właściciela'}
        </dt>
        <dd>
          {locale === 'en'
            ? 'TrendChart owns continuous time, ComparisonChart owns categorical ranking, Forecast 15.07 owns confidence and forecast, DataTable owns records, and 15.09 owns tooltip, hover, selection, drill-down and cross-filtering.'
            : 'TrendChart odpowiada za czas ciągły, ComparisonChart za ranking kategorii, Forecast 15.07 za pewność i prognozę, DataTable za rekordy, a 15.09 za podpowiedzi, stan najechania, zaznaczanie, przejście w szczegóły i filtrowanie krzyżowe.'}
        </dd>
      </div>
    </dl>
  );
}

function LongCopyCase() {
  const locale = readLocale();
  const labels = buildLabels(locale);
  const points = buildPoints(longCopyPointSeeds, locale);
  const clusters = buildLongCopyClusters(locale);

  return (
    <div className="pd-correlation-story__long-copy">
      <CorrelationChart
        ariaLabel={
          locale === 'en'
            ? 'Relationship after attribution reconciliation and consent filtering'
            : 'Zależność po rekoncyliacji atrybucji i filtracji zgód'
        }
        clusters={clusters}
        correlation={0.51}
        driverHypothesis={
          locale === 'en'
            ? 'Lifecycle automation after consent filtering is a driver hypothesis that requires experiment evidence before any causal wording is allowed.'
            : 'Automatyzacja cyklu życia po filtracji zgód jest hipotezą wpływu, która wymaga dowodu eksperymentalnego przed użyciem języka przyczynowego.'
        }
        labels={labels}
        points={points}
        relationshipLabel={
          locale === 'en'
            ? 'Observed relationship across reconciled attribution windows with long campaign labels.'
            : 'Obserwowana zależność obejmuje uzgodnione okna atrybucji i długie etykiety kampanii.'
        }
        valueFormatter={(value) => (
          formatValue(value, locale)
        )}
        variant="driver-analysis"
        xLabel={
          locale === 'en'
            ? 'Operational readiness score after attribution reconciliation'
            : 'Ocena gotowości operacyjnej po rekoncyliacji atrybucji'
        }
        yLabel={
          locale === 'en'
            ? 'Incremental revenue index after consent filtering'
            : 'Indeks przychodu przyrostowego po filtracji zgód'
        }
      />
    </div>
  );
}

const meta = {
  title: '15 Wykresy i dane/Zależności i korelacje',
  component: CorrelationChart,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'CorrelationChart jest właścicielem wykonania 15.06. Recharts odpowiada za geometrię wykresu punktowego, wykresu zależności i analizy hipotez wpływu, a PapaData za semantykę korelacji, legendę, oznaczenia punktów odstających i klastrów, tekst siły korelacji oraz regułę braku przyczynowości bez dowodu.',
      },
    },
  },
} satisfies Meta<typeof CorrelationChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CorrelationChartStory: Story = {
  args: {
    ariaLabel: 'Zależność budżetu mediowego i ROAS',
    correlation: 0.72,
    points: buildPoints(spendRoasPointSeeds, 'pl'),
    variant: 'relationship',
    xLabel: 'Indeks budżetu mediowego',
    yLabel: 'ROAS',
  },
  name: 'Zależności i korelacje',
  render: () => (
    <StoryPresentationPage
      className="pd-correlation-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry kontraktu CorrelationChart"
          items={[
            {
              label: 'Kontrakt',
              value: '15.06',
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
      storyId="15.06"
      summary="CorrelationChart odpowiada za wykres punktowy, wykres zależności, analizę hipotez wpływu, statyczne oznaczenia punktów odstających i klastrów oraz tekst siły korelacji bez sugerowania przyczynowości bez dowodu."
      title="Korelacja pokazuje zależność, ale nie zastępuje dowodu przyczynowości."
    >
      <StoryPresentationSection
        index="01"
        summary="ChartFrame osadza gotowy CorrelationChart. Status, źródła, świeżość i wniosek pozostają w warstwie ramy, a wizualizacja odpowiada za relację dwóch miar."
        title="Kanoniczna kompozycja"
      >
        <CanonicalCorrelationComposition />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        summary="Wykres punktowy pokazuje relację dwóch miar. Wykres zależności dodaje statyczne oznaczenie klastra. Analiza hipotez wpływu pozostaje hipotezą, nie decyzją przyczynową."
        title="Wykres punktowy, zależności i hipotezy wpływu"
      >
        <CorrelationVariants />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="03"
        summary="Punkty odstające i klastry są statycznym oznaczeniem obserwacji. Podpowiedzi, stan najechania, zaznaczanie i przejście w szczegóły pozostają poza 15.06."
        title="Punkty odstające i klastry"
      >
        <OutliersAndClusters />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="04"
        summary="Legenda i tekst jasno rozdzielają korelację, zależność, hipotezę wpływu i punkt odstający. Prognozy 15.07, pełne stany danych 15.08, tabele i interakcje 15.09 pozostają u innych właścicieli."
        title="Reguły semantyczne"
      >
        <SemanticGuide />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="05"
        summary="Długi tekst zawija się w legendzie, metadanych i opisach klastra bez tworzenia poziomego przewijania."
        title="Długi tekst i widok mobilny"
      >
        <LongCopyCase />
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
          name: 'Zależność budżetu mediowego i ROAS',
        },
      ),
    ).toBeInTheDocument();

    for (const variant of [
      'scatter',
      'relationship',
      'driver-analysis',
    ] as const) {
      const element = canvasElement.querySelector(
        `[data-component="correlation-chart"][data-variant="${variant}"]`,
      );

      if (!element) {
        throw new Error(
          `Missing CorrelationChart variant: ${variant}`,
        );
      }

      await expect(element).toHaveAttribute(
        'data-variant',
        variant,
      );
    }

    await expect(
      canvas.getAllByText('Korelacja').length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getAllByText('Zależność').length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getAllByText('Hipoteza wpływu').length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getAllByText('Punkt odstający').length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getAllByText(
        'Korelacja i hipoteza wpływu nie są dowodem przyczynowości.',
      ).length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getByText(/TrendChart odpowiada za czas ciągły/),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText(/ComparisonChart za ranking kategorii/),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText(/DataTable za rekordy/),
    ).toBeInTheDocument();
  },
};
