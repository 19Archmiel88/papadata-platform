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
  type PapaDataRuntimeLocale,
} from '../../../design-system/foundations';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './visualization-showcase.css';

const explainMetric = fn();
const showMetricDetail = fn();

function readLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}

const meta = {
  title: '15 Wykresy i dane/MetricCard',
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
          label: 'Szczegóły KPI',
          onAction: showMetricDetail,
        }}
        label="Przychód"
        metricId="revenue"
        value={formatPapaDataCurrency(248420, locale)}
      />
      <MetricCard
        {...sharedMetadata}
        comparison={{
          direction: 'up',
          label: '+12,4% okres do okresu',
        }}
        label="Zamówienia"
        metricId="orders"
        signal="positive"
        value={formatPapaDataNumber(1284, locale)}
      />
      <MetricCard
        {...sharedMetadata}
        comparison={{
          direction: 'flat',
          label: 'Stabilnie względem poprzedniego okresu',
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
          label: '-2,4 p.p. okres do okresu',
        }}
        deviationLabel="-1,1 p.p. do planu"
        label="Marża brutto"
        metricId="gross-margin"
        signal="negative"
        value={formatPapaDataPercent(0.317, locale)}
      />
      <MetricCard
        {...sharedMetadata}
        comparison={{
          direction: 'down',
          label: 'Koszt spadł o 7,8% — kierunek korzystny',
        }}
        label="Koszt reklamy"
        metricId="ad-cost"
        signal="positive"
        sparklinePoints={[61, 59, 60, 55, 53, 54, 49, 47, 45]}
        value={formatPapaDataCurrency(38200, locale)}
      />
      <MetricCard
        definitionChangeLabel="Definicja metryki zmieniona 1 sie"
        emphasis="recommendation"
        freshnessLabel={formatPapaDataRelativeTime(-8, 'minute', locale)}
        label="Konwersja"
        metricId="conversion"
        papaAction={{
          label: 'Wyjaśnij z Papa',
          onAction: explainMetric,
        }}
        signal="warning"
        sourceLabel="GA4 + zamówienia"
        sparklinePoints={[48, 50, 49, 46, 44, 45, 42, 41, 40]}
        status="partial"
        statusLabel="Dane częściowe"
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
        label="Przychód"
        metricId="revenue-processing"
        status="processing"
        statusLabel="Przetwarzanie"
        value={null}
      />
      <MetricCard
        label="ROAS"
        metricId="roas-no-data"
        stateMessage="Połącz konto reklamowe albo zmień zakres, aby policzyć ROAS."
        status="noData"
        statusLabel="Brak danych"
        value={null}
      />
      <MetricCard
        comparison={{
          direction: 'down',
          label: '-4,1% okres do okresu',
        }}
        emphasis="alert"
        freshnessLabel={formatPapaDataRelativeTime(-2, 'hour', locale)}
        label="Marża brutto"
        metricId="margin-stale"
        signal="warning"
        sourceLabel="Sklep"
        status="stale"
        statusLabel="Dane nieświeże"
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
  render: () => (
    <StoryPresentationPage
      className="pd-viz-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry kontraktu MetricCard"
          items={[
            { label: 'Kontrakt', value: '15.02' },
            { label: 'Handoff', value: '05.03 → 15.02' },
            { label: 'Status', value: 'review' },
          ]}
        />
      )}
      sectionCode="15"
      sectionLabel="Wykresy i dane"
      storyId="15.02"
      summary="MetricCard odpowiada za KPI, jego porównanie i mikrotrend. Nie jest małym ChartFrame i nie wprowadza własnych kontrolek."
      title="Wskaźnik ma pokazywać sygnał, nie budować kolejny dashboard w karcie."
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
        summary="Processing, no data i stale zachowują tożsamość metryki i nie udają pełnej wartości."
        title="Stany danych"
      >
        <MetricStates />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="03"
        summary="Długi tytuł i opis porównania zawijają się bez poziomego scrolla."
        title="Długi copy i reflow"
      >
        <div className="pd-viz-story__long-copy">
          <MetricCard
            comparison={{
              direction: 'down',
              label: 'Down 3.8 percentage points compared with the same acquisition cohort in the previous fully reconciled reporting window',
            }}
            freshnessLabel={formatPapaDataRelativeTime(-18, 'minute', 'en')}
            label="Contribution margin after advertising costs for returning customers"
            labels={{
              dataStatus: 'Data status',
              deviation: 'Deviation',
              target: 'Target',
            }}
            metricId="long-copy-margin"
            signal="negative"
            sourceLabel="commerce + advertising + attribution"
            sparklinePoints={[58, 57, 55, 56, 51, 49, 50, 46, 43]}
            status="partial"
            statusLabel="Partial data"
            value={formatPapaDataPercent(0.279, 'en')}
          />
        </div>
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
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
      canvas.getByLabelText(/Przychód: 248[\s\u00a0]420,00[\s\u00a0]zł/),
    ).toBeInTheDocument();
  },
};
