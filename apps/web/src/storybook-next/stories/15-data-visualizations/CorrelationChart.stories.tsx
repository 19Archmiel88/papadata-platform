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

const spendRoasPoints: readonly CorrelationChartPoint[] = [
  { id: 'brand', label: 'Brand', x: 42, y: 3.8 },
  { id: 'shopping', label: 'Shopping', x: 68, y: 4.9, role: 'cluster', clusterId: 'efficient' },
  { id: 'remarketing', label: 'Remarketing', x: 59, y: 5.2, role: 'cluster', clusterId: 'efficient' },
  { id: 'search-generic', label: 'Generic search', x: 74, y: 4.4, role: 'cluster', clusterId: 'efficient' },
  { id: 'prospecting', label: 'Prospecting', x: 82, y: 3.2 },
  { id: 'affiliate', label: 'Affiliate', x: 31, y: 2.9 },
  { id: 'display', label: 'Display', x: 88, y: 1.8, role: 'outlier' },
  { id: 'retention', label: 'Retention', x: 53, y: 5.6, role: 'driver-hypothesis' },
];

const efficientCluster: readonly CorrelationChartCluster[] = [
  {
    id: 'efficient',
    label: 'Klaster efektywnych kampanii',
    description:
      'Punkty mają podobny rozkład budżetu i ROAS; to wskazanie segmentu do analizy, nie dowód przyczynowy.',
    xRange: [56, 78],
    yRange: [4.1, 5.5],
  },
];

const marginDiscountPoints: readonly CorrelationChartPoint[] = [
  { id: 'winter', label: 'Winter', x: 4, y: 32 },
  { id: 'spring', label: 'Spring', x: 8, y: 30 },
  { id: 'retention', label: 'Retention', x: 11, y: 27 },
  { id: 'sale', label: 'Sale', x: 16, y: 24 },
  { id: 'clearance', label: 'Clearance', x: 22, y: 19, role: 'outlier' },
  { id: 'bundle', label: 'Bundle', x: 14, y: 29, role: 'driver-hypothesis' },
];

const driverAnalysisPoints: readonly CorrelationChartPoint[] = [
  { id: 'quality', label: 'Quality score', x: 82, y: 11, role: 'driver-hypothesis' },
  { id: 'speed', label: 'Page speed', x: 76, y: 8, role: 'driver-hypothesis' },
  { id: 'stock', label: 'Stock depth', x: 61, y: 3 },
  { id: 'creative', label: 'Creative fatigue', x: 34, y: -5, role: 'outlier' },
  { id: 'pricing', label: 'Pricing consistency', x: 52, y: 2 },
  { id: 'audience', label: 'Audience match', x: 69, y: 7 },
];

const longCopyPoints: readonly CorrelationChartPoint[] = [
  {
    id: 'organic-assisted',
    label: 'Organic campaigns after attribution reconciliation',
    role: 'cluster',
    x: 38,
    y: 6.2,
  },
  {
    id: 'paid-assisted',
    label: 'Paid campaigns with delayed conversion windows',
    role: 'cluster',
    x: 54,
    y: 7.1,
  },
  {
    id: 'retention-assisted',
    label: 'Lifecycle automation after consent filtering',
    role: 'driver-hypothesis',
    x: 71,
    y: 8.4,
  },
  {
    id: 'broad-reach',
    label: 'Broad reach campaigns with low signal density',
    role: 'outlier',
    x: 82,
    y: 3.8,
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

function buildLabels(
  locale: PapaDataRuntimeLocale,
): Partial<CorrelationChartLabels> {
  if (locale === 'en') {
    return {
      cluster: 'Cluster',
      correlation: 'Correlation',
      driverHypothesis: 'driver hypothesis',
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

  return {};
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
          : 'CorrelationChart jest ownerem scatter, relationship i driver hypothesis analysis. ChartFrame utrzymuje status, źródło i wniosek biznesowy.'
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
          clusters={efficientCluster}
          correlation={0.72}
          driverHypothesis={
            locale === 'en'
              ? 'Retention is marked as a driver hypothesis because it combines medium spend with high ROAS and needs validation.'
              : 'Retention jest oznaczone jako driver hypothesis, bo łączy średni budżet z wysokim ROAS i wymaga walidacji.'
          }
          labels={buildLabels(locale)}
          points={spendRoasPoints}
          relationshipLabel={
            locale === 'en'
              ? 'The scatter shows a positive relationship in this sample, not a causal statement.'
              : 'Scatter pokazuje dodatnią zależność w tej próbie, nie stwierdzenie przyczynowe.'
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

  return (
    <div className="pd-correlation-story__variants">
      <article className="pd-correlation-story__variant">
        <header>
          <span>scatter plot</span>
          <h3>
            {locale === 'en'
              ? 'Two metrics, one point cloud'
              : 'Dwie miary, jedna chmura punktów'}
          </h3>
          <p>
            {locale === 'en'
              ? 'Scatter plot answers whether two numeric measures move together in the observed sample.'
              : 'Scatter plot odpowiada, czy dwie miary numeryczne poruszają się razem w obserwowanej próbie.'}
          </p>
        </header>

        <CorrelationChart
          ariaLabel={
            locale === 'en'
              ? 'Discount and margin scatter plot'
              : 'Scatter plot rabatu i marży'
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
          <span>relationship chart</span>
          <h3>
            {locale === 'en'
              ? 'Clusters remain descriptive'
              : 'Klastry pozostają opisowe'}
          </h3>
          <p>
            {locale === 'en'
              ? 'A relationship chart can mark a cluster and an outlier without adding hover, selection or drill-down.'
              : 'Relationship chart może oznaczyć klaster i outlier bez hover, selection ani drill-down.'}
          </p>
        </header>

        <CorrelationChart
          ariaLabel={
            locale === 'en'
              ? 'Relationship chart for campaign efficiency'
              : 'Relationship chart efektywności kampanii'
          }
          clusters={efficientCluster}
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
          <span>driver analysis</span>
          <h3>
            {locale === 'en'
              ? 'Driver hypothesis, not causality'
              : 'Driver hypothesis, nie przyczynowość'}
          </h3>
          <p>
            {locale === 'en'
              ? 'Driver analysis labels candidate variables as hypotheses until evidence confirms a causal mechanism.'
              : 'Driver analysis oznacza kandydatów jako hipotezy do czasu potwierdzenia mechanizmu przyczynowego.'}
          </p>
        </header>

        <CorrelationChart
          ariaLabel={
            locale === 'en'
              ? 'Driver analysis for conversion lift'
              : 'Driver analysis wzrostu konwersji'
          }
          correlation={0.58}
          driverHypothesis={
            locale === 'en'
              ? 'Quality score and page speed are hypotheses to validate, not automatic recommendations.'
              : 'Quality score i page speed są hipotezami do walidacji, nie automatycznymi rekomendacjami.'
          }
          labels={labels}
          points={driverAnalysisPoints}
          relationshipLabel={
            locale === 'en'
              ? 'Candidate drivers are ranked visually by observed relationship strength.'
              : 'Kandydaci driverów są wizualnie uporządkowani według obserwowanej siły zależności.'
          }
          valueFormatter={(value) => (
            formatValue(value, locale)
          )}
          variant="driver-analysis"
          xLabel={
            locale === 'en'
              ? 'Signal score'
              : 'Score sygnału'
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
  return (
    <CorrelationChart
      ariaLabel="Outlier i cluster indication bez interakcji"
      clusters={efficientCluster}
      correlation={0.72}
      driverHypothesis="Retention pozostaje hipotezą drivera, a Display pozostaje outlierem do osobnego sprawdzenia danych."
      points={spendRoasPoints}
      relationshipLabel="Klaster i outlier są oznaczeni statycznie w legendzie oraz etykietach punktów."
      valueFormatter={(value) => (
        formatValue(value, 'pl')
      )}
      variant="relationship"
      xLabel="Indeks budżetu mediowego"
      yLabel="ROAS"
    />
  );
}

function SemanticGuide() {
  const locale = readLocale();

  return (
    <dl className="pd-correlation-story__semantic-guide">
      <div>
        <dt>Korelacja</dt>
        <dd>
          {locale === 'en'
            ? 'Correlation is the numeric strength and direction of two observed measures. It is not causal proof.'
            : 'Korelacja to liczbowa siła i kierunek dwóch obserwowanych miar. Nie jest dowodem przyczynowości.'}
        </dd>
      </div>
      <div>
        <dt>Zależność</dt>
        <dd>
          {locale === 'en'
            ? 'Relationship describes the shape of the scatter, clusters and notable observations.'
            : 'Zależność opisuje kształt scattera, klastry i obserwacje warte uwagi.'}
        </dd>
      </div>
      <div>
        <dt>driver hypothesis</dt>
        <dd>
          {locale === 'en'
            ? 'Driver hypothesis is a candidate explanation that must be validated outside this chart.'
            : 'Driver hypothesis jest kandydatem do wyjaśnienia, który musi zostać zwalidowany poza tym wykresem.'}
        </dd>
      </div>
      <div>
        <dt>outlier</dt>
        <dd>
          {locale === 'en'
            ? 'Outlier marks an observation outside the local pattern. It does not imply an error or a cause.'
            : 'Outlier oznacza obserwację poza lokalnym wzorcem. Nie oznacza automatycznie błędu ani przyczyny.'}
        </dd>
      </div>
      <div>
        <dt>Granice ownera</dt>
        <dd>
          {locale === 'en'
            ? 'TrendChart owns continuous time, ComparisonChart owns categorical ranking, Forecast 15.07 owns confidence and forecast, DataTable owns records, and 15.09 owns tooltip, hover, selection, drill-down and cross-filtering.'
            : 'TrendChart posiada czas ciągły, ComparisonChart ranking kategorii, Forecast 15.07 confidence i prognozę, DataTable rekordy, a 15.09 tooltip, hover, selection, drill-down i cross-filtering.'}
        </dd>
      </div>
    </dl>
  );
}

function LongCopyCase() {
  return (
    <div className="pd-correlation-story__long-copy">
      <CorrelationChart
        ariaLabel="Relationship after attribution reconciliation and consent filtering"
        clusters={[
          {
            id: 'long-copy-cluster',
            label: 'Long-copy cluster after reconciliation',
            description:
              'Cluster names and descriptions wrap without widening the plot or adding horizontal page scroll.',
            xRange: [32, 58],
            yRange: [5.6, 7.6],
          },
        ]}
        correlation={0.51}
        driverHypothesis="Lifecycle automation after consent filtering is a driver hypothesis that requires experiment evidence before any causal wording is allowed."
        labels={buildLabels('en')}
        points={longCopyPoints}
        relationshipLabel="Observed relationship across reconciled attribution windows with long campaign labels."
        valueFormatter={(value) => (
          formatValue(value, 'en')
        )}
        variant="driver-analysis"
        xLabel="Operational readiness score after attribution reconciliation"
        yLabel="Incremental revenue index after consent filtering"
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
          'CorrelationChart jest runtime ownerem 15.06. Recharts odpowiada za geometrię scatter/relationship/driver analysis, a PapaData za semantykę korelacji, legendę, wskazanie outlier/cluster, copy siły korelacji i regułę braku przyczynowości bez dowodu.',
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
    points: spendRoasPoints,
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
      storyId="15.06"
      summary="CorrelationChart odpowiada za scatter plot, relationship chart, driver analysis, statyczne outlier/cluster indication i copy siły korelacji bez sugerowania przyczynowości bez dowodu."
      title="Korelacja pokazuje zależność, ale nie zastępuje dowodu przyczynowości."
    >
      <StoryPresentationSection
        index="01"
        summary="ChartFrame konsumuje gotowy CorrelationChart. Status, źródła, świeżość i wniosek pozostają w kontenerze, a wizualizacja odpowiada za relację dwóch miar."
        title="Kanoniczna kompozycja"
      >
        <CanonicalCorrelationComposition />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        summary="Scatter plot pokazuje relację dwóch miar. Relationship chart dodaje statyczne oznaczenie klastra. Driver analysis pozostaje hipotezą, nie decyzją przyczynową."
        title="Scatter plot, relationship chart i driver analysis"
      >
        <CorrelationVariants />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="03"
        summary="Outlier i cluster indication są statycznym oznaczeniem obserwacji. Tooltip, hover, selection i drill-down pozostają poza 15.06."
        title="Outlier i cluster indication"
      >
        <OutliersAndClusters />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="04"
        summary="Legenda i tekst jasno rozdzielają korelację, zależność, driver hypothesis i outlier. Forecast 15.07, pełne data states 15.08, tabele i interakcje 15.09 pozostają u innych ownerów."
        title="Reguły semantyczne"
      >
        <SemanticGuide />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="05"
        summary="Długi copy zawija się w legendzie, metadanych i opisach klastra bez tworzenia poziomego scrolla."
        title="Długi copy i mobile"
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
      canvas.getAllByText('driver hypothesis').length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getAllByText('Outlier').length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getAllByText(
        'Korelacja i driver hypothesis nie są dowodem przyczynowości.',
      ).length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getByText('TrendChart'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('ComparisonChart'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('DataTable'),
    ).toBeInTheDocument();
  },
};
