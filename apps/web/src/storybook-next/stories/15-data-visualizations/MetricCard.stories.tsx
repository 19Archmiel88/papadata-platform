import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  userEvent,
  within,
} from 'storybook/test';

import {
  MetricCard,
} from '../../../design-system/components';
import {
  formatPapaDataCurrency,
  formatPapaDataNumber,
  formatPapaDataPercent,
  formatPapaDataRelativeTime,
} from '../../../design-system/foundations';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import {
  Localized,
  readAnalyticsLocale as readLocale,
  Story15Page,
} from './analytics-story-helpers';
import './visualization-showcase.css';

const explainMetric = fn();
const showMetricDetail = fn();

const meta = {
  title: '15 Wykresy i dane/01 Powierzchnie analityczne/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'MetricCard jest kanoniczną powierzchnią KPI. Wartość, porównanie, cel, odchylenie, status i mikrotrend są składane bez tworzenia drugiego ChartFrame.',
      },
    },
  },
} satisfies Meta<typeof MetricCard>;

export default meta;

type Story = StoryObj<typeof meta>;

function MetricVariants() {
  const locale = readLocale();
  const sharedMetadata = {
    freshnessLabel: formatPapaDataRelativeTime(-8, 'minute', locale),
    sourceLabel: locale === 'en' ? 'Store + ads' : 'Sklep + reklamy',
    status: 'ready' as const,
    statusLabel: locale === 'en' ? 'Current data' : 'Dane aktualne',
  };

  return (
    <div className="pd-viz-story__metric-grid">
      <MetricCard
        {...sharedMetadata}
        detailAction={{
          label: locale === 'en' ? 'KPI details' : 'Szczegóły KPI',
          onAction: showMetricDetail,
        }}
        label={locale === 'en' ? 'Revenue' : 'Przychód'}
        metricId="revenue"
        value={formatPapaDataCurrency(248420, locale)}
      />
      <MetricCard
        {...sharedMetadata}
        comparison={{
          direction: 'up',
          label: locale === 'en'
            ? '+12.4% period over period'
            : '+12,4% okres do okresu',
        }}
        label={locale === 'en' ? 'Orders' : 'Zamówienia'}
        metricId="orders"
        signal="positive"
        value={formatPapaDataNumber(1284, locale)}
      />
      <MetricCard
        {...sharedMetadata}
        comparison={{
          direction: 'flat',
          label: locale === 'en'
            ? 'Stable versus the previous period'
            : 'Stabilnie względem poprzedniego okresu',
        }}
        label="ROAS"
        metricId="roas"
        signal="positive"
        sparklinePoints={[4.82, 4.82, 4.82, 4.82, 4.82]}
        targetLabel={formatPapaDataNumber(4.4, locale)}
        value={formatPapaDataNumber(4.82, locale)}
      />
      <MetricCard
        {...sharedMetadata}
        comparison={{
          direction: 'down',
          label: locale === 'en'
            ? '-2.4 pp period over period'
            : '-2,4 p.p. okres do okresu',
        }}
        deviationLabel={locale === 'en' ? '-1.1 pp to plan' : '-1,1 p.p. do planu'}
        label={locale === 'en' ? 'Gross margin' : 'Marża brutto'}
        metricId="gross-margin"
        signal="negative"
        value={formatPapaDataPercent(0.317, locale)}
      />
      <MetricCard
        {...sharedMetadata}
        comparison={{
          direction: 'down',
          label: locale === 'en'
            ? 'Cost down 7.8% - favorable direction'
            : 'Koszt spadł o 7,8% — kierunek korzystny',
        }}
        label={locale === 'en' ? 'Ad cost' : 'Koszt reklamy'}
        metricId="ad-cost"
        signal="positive"
        sparklinePoints={[61, 59, 60, 55, 53, 54, 49, 47, 45]}
        value={formatPapaDataCurrency(38200, locale)}
      />
      <MetricCard
        definitionChangeLabel={locale === 'en'
          ? 'Metric definition changed on Aug 1'
          : 'Definicja metryki zmieniona 1 sie'}
        emphasis="recommendation"
        freshnessLabel={formatPapaDataRelativeTime(-8, 'minute', locale)}
        label={locale === 'en' ? 'Conversion' : 'Konwersja'}
        metricId="conversion"
        papaAction={{
          label: locale === 'en' ? 'Explain with Papa' : 'Wyjaśnij z Papa',
          onAction: explainMetric,
        }}
        signal="warning"
        sourceLabel={locale === 'en' ? 'GA4 + orders' : 'GA4 + zamówienia'}
        sparklinePoints={[48, 50, 49, 46, 44, 45, 42, 41, 40]}
        status="partial"
        statusLabel={locale === 'en' ? 'Partial data' : 'Dane częściowe'}
        value={formatPapaDataPercent(0.038, locale)}
      />
    </div>
  );
}

function MetricStates() {
  const locale = readLocale();

  return (
    <div className="pd-viz-story__metric-state-grid">
      <MetricCard
        label={locale === 'en' ? 'Revenue' : 'Przychód'}
        metricId="revenue-processing"
        status="processing"
        statusLabel={locale === 'en' ? 'Processing' : 'Przetwarzanie'}
        value={null}
      />
      <MetricCard
        label="ROAS"
        metricId="roas-no-data"
        stateMessage={locale === 'en'
          ? 'Connect an ad account or change the range to calculate ROAS.'
          : 'Połącz konto reklamowe albo zmień zakres, aby policzyć ROAS.'}
        status="noData"
        statusLabel={locale === 'en' ? 'No data' : 'Brak danych'}
        value={null}
      />
      <MetricCard
        comparison={{
          direction: 'down',
          label: locale === 'en'
            ? '-4.1% period over period'
            : '-4,1% okres do okresu',
        }}
        emphasis="alert"
        freshnessLabel={formatPapaDataRelativeTime(-2, 'hour', locale)}
        label={locale === 'en' ? 'Gross margin' : 'Marża brutto'}
        metricId="margin-stale"
        signal="warning"
        sourceLabel={locale === 'en' ? 'Store' : 'Sklep'}
        status="stale"
        statusLabel={locale === 'en' ? 'Stale data' : 'Dane nieświeże'}
        value={formatPapaDataPercent(0.294, locale)}
      />
    </div>
  );
}

export const MetricCardStory: Story = {
  args: {
    label: 'Przychód',
    metricId: 'revenue',
    status: 'ready',
    statusLabel: 'Dane aktualne',
    value: '248 420',
  },
  name: 'Karta wskaźnika',
  render: () => {
    const locale = readLocale();

    return (
    <Story15Page
      className="pd-viz-story"
      metaAriaLabel={{
        pl: 'Parametry kontraktu MetricCard',
        en: 'MetricCard contract parameters',
      }}
      metaItems={[
        {
          label: <Localized pl="Kontrakt" en="Contract" />,
          value: '15.02',
        },
        {
          label: <Localized pl="Przekazanie" en="Handoff" />,
          value: '05.03 -> 15.02',
        },
        {
          label: <Localized pl="Status" en="Status" />,
          value: <Localized pl="przegląd" en="review" />,
        },
      ]}
      storyId="15.02"
      summary={(
        <Localized
          pl="MetricCard odpowiada za KPI, jego porównanie i mikrotrend. Nie jest małym ChartFrame i nie wprowadza własnych kontrolek."
          en="MetricCard owns the KPI, comparison and microtrend. It is not a small ChartFrame and does not add private controls."
        />
      )}
      title={(
        <Localized
          pl="Wskaźnik ma pokazywać sygnał, nie budować kolejnego panelu w karcie."
          en="A metric should expose the signal, not build another panel inside a card."
        />
      )}
    >
      <StoryPresentationSection
        index="01"
        summary="Wariant wynika z potrzebnych danych. Publiczne API nie wymusza sześciu wzajemnie wykluczających się typów karty."
        title="Warianty kontraktowe"
      >
        <MetricVariants />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        summary="Przetwarzanie, brak danych i dane nieaktualne zachowują tożsamość metryki i nie udają pełnej wartości."
        title="Stany danych"
      >
        <MetricStates />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="03"
        summary="Długi tytuł i opis porównania zawijają się bez poziomego przewijania."
        title="Długi tekst i zawijanie"
      >
        <div className="pd-viz-story__long-copy">
          <MetricCard
            comparison={{
              direction: 'down',
              label: locale === 'en'
                ? 'Down 3.8 pp versus the same acquisition cohort in the previous fully reconciled reporting window'
                : 'Spadek o 3,8 p.p. względem tej samej kohorty akwizycji w poprzednim, w pełni uzgodnionym oknie raportowym',
            }}
            freshnessLabel={formatPapaDataRelativeTime(-18, 'minute', locale)}
            label={locale === 'en'
              ? 'Contribution margin after advertising costs for returning customers'
              : 'Marża kontrybucyjna po kosztach reklamy dla powracających klientów'}
            labels={{
              dataStatus: locale === 'en' ? 'Data status' : 'Status danych',
              deviation: locale === 'en' ? 'Deviation' : 'Odchylenie',
              target: locale === 'en' ? 'Target' : 'Cel',
            }}
            metricId="long-copy-margin"
            signal="negative"
            sourceLabel={locale === 'en'
              ? 'commerce + ads + attribution'
              : 'handel + reklamy + atrybucja'}
            sparklinePoints={[58, 57, 55, 56, 51, 49, 50, 46, 43]}
            status="partial"
            statusLabel={locale === 'en' ? 'Partial data' : 'Dane częściowe'}
            value={formatPapaDataPercent(0.279, locale)}
          />
        </div>
      </StoryPresentationSection>
    </Story15Page>
    );
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const explainButton = canvas.getByRole('button', {
      name: 'Wyjaśnij z Papa',
    });
    await userEvent.click(explainButton);
    await expect(explainMetric).toHaveBeenCalled();

    const detailButton = canvas.getByRole('button', {
      name: 'Szczegóły KPI',
    });
    await userEvent.click(detailButton);
    await expect(showMetricDetail).toHaveBeenCalled();

    await expect(
      canvas.getByText(/248[\s\u00a0]420,00[\s\u00a0]zł/),
    ).toBeInTheDocument();
  },
};
