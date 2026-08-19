import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  userEvent,
  waitFor,
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
  const sharedStatus = {
    status: 'ready' as const,
    statusLabel: '',
  };

  return (
    <>
      {/* Hero + priority 2×2 — dokładny układ centrum dowodzenia */}
      <div className="pd-viz-story__metric-composition">
        {/* Przychód hero */}
        <MetricCard
          {...sharedStatus}
          comparison={{
            direction: 'up',
            label: locale === 'en'
              ? '+12.4% period over period'
              : '+12,4% okres do okresu',
          }}
          definitionChangeLabel={null}
          density="regular"
          depth="hero"
          detailAction={{
            label: locale === 'en' ? 'KPI details' : 'Szczegóły KPI',
            onAction: showMetricDetail,
          }}
          deviationLabel={locale === 'en' ? '+4.1% vs plan' : '+4,1% wobec planu'}
          freshnessLabel={locale === 'en' ? 'fresh sources' : 'świeże źródła'}
          helpText={locale === 'en'
            ? 'Total store revenue for the selected period, before adjustments.'
            : 'Łączny przychód sklepu w wybranym okresie, przed dodatkowymi korektami.'}
          label={locale === 'en' ? 'Revenue' : 'Przychód'}
          metricId="revenue"
          signal="positive"
          sourceLabel={locale === 'en' ? 'Store + ads' : 'Sklep + reklamy'}
          /* Hero must carry the full information set — micro-trend, benchmarks,
             metadata and actions — not just the value and its delta. */
          sparklinePoints={[
            182, 191, 188, 204, 212, 208, 221,
            234, 229, 241, 238, 246, 244, 248,
          ]}
          targetLabel={locale === 'en' ? 'Target 238 600 PLN' : 'Cel 238 600 zł'}
          value={formatPapaDataCurrency(248420, locale)}
        />

        {/* Priority 2×2: Marża, Zamówienia, ROAS, Konwersja */}
        <div
          aria-label={locale === 'en' ? 'Priority KPI' : 'Priorytetowe KPI'}
          className="pd-viz-story__metric-priority-surface"
          role="list"
        >
          <MetricCard
            {...sharedStatus}
            comparison={{ direction: 'down', label: locale === 'en' ? '-2.4 pp' : '-2,4 p.p.' }}
            density="compact"
            depth="flat"
            emphasis="alert"
            label={locale === 'en' ? 'Gross margin' : 'Marża brutto'}
            metricId="gross-margin"
            role="listitem"
            signal="negative"
            sparklinePoints={[34.1, 33.8, 33.2, 32.6, 32.0, 31.7]}
            value={formatPapaDataPercent(0.317, locale)}
          />
          <MetricCard
            {...sharedStatus}
            comparison={{ direction: 'up', label: locale === 'en' ? '+8.1%' : '+8,1%' }}
            density="compact"
            depth="flat"
            label={locale === 'en' ? 'Orders' : 'Zamówienia'}
            metricId="orders"
            role="listitem"
            signal="positive"
            sparklinePoints={[1120, 1180, 1200, 1240, 1270, 1284]}
            value={formatPapaDataNumber(1284, locale)}
          />
          <MetricCard
            {...sharedStatus}
            comparison={{ direction: 'up', label: locale === 'en' ? '+18%' : '+18%' }}
            density="compact"
            depth="flat"
            label="ROAS"
            metricId="roas"
            role="listitem"
            signal="positive"
            sparklinePoints={[3.6, 3.8, 4.0, 4.2, 4.6, 4.82]}
            value={formatPapaDataNumber(4.82, locale)}
          />
          <MetricCard
            definitionChangeLabel={locale === 'en'
              ? 'Metric definition changed Aug 1'
              : 'Definicja zmieniona 1 sie'}
            density="compact"
            depth="flat"
            emphasis="recommendation"
            freshnessLabel={formatPapaDataRelativeTime(-8, 'minute', locale)}
            label={locale === 'en' ? 'Conversion' : 'Konwersja'}
            metricId="conversion"
            papaAction={{
              label: locale === 'en' ? 'Explain with Papa' : 'Wyjaśnij z Papa',
              onAction: explainMetric,
            }}
            role="listitem"
            signal="warning"
            sourceLabel="GA4"
            sparklinePoints={[4.8, 4.6, 4.4, 4.2, 4.0, 3.8]}
            status="partial"
            statusLabel={locale === 'en' ? 'Partial data' : 'Dane częściowe'}
            value={formatPapaDataPercent(0.038, locale)}
          />
        </div>
      </div>

      {/* Supporting strip — pozostałe KPI */}
      <div
        aria-label={locale === 'en' ? 'Remaining KPI' : 'Pozostałe KPI'}
        className="pd-viz-story__metric-supporting-strip"
        role="list"
      >
        {[
          { id: 'aov', label: locale === 'en' ? 'AOV' : 'AOV', value: formatPapaDataCurrency(193.5, locale), delta: 0.037, signal: 'positive' as const },
          { id: 'ad-cost', label: locale === 'en' ? 'Ad cost' : 'Koszt reklamy', value: formatPapaDataCurrency(51400, locale), delta: -0.07, signal: 'positive' as const },
          { id: 'cpa', label: 'CPA', value: formatPapaDataCurrency(40.1, locale), delta: -0.04, signal: 'positive' as const },
          { id: 'impressions', label: locale === 'en' ? 'Impressions' : 'Wyświetlenia', value: formatPapaDataNumber(1240000, locale), delta: -0.12, signal: 'negative' as const },
          { id: 'clicks', label: locale === 'en' ? 'Clicks' : 'Kliknięcia', value: formatPapaDataNumber(20088, locale), delta: -0.14, signal: 'negative' as const },
          { id: 'ctr', label: 'CTR', value: formatPapaDataPercent(0.0162, locale), delta: -0.03, signal: 'warning' as const },
        ].map((metric) => (
          <MetricCard
            comparison={{
              direction: metric.delta > 0 ? 'up' : metric.delta < 0 ? 'down' : 'flat',
              label: `${metric.delta > 0 ? '+' : ''}${(metric.delta * 100).toFixed(1)}%`,
            }}
            density="compact"
            depth="flat"
            key={metric.id}
            label={metric.label}
            metricId={metric.id}
            role="listitem"
            signal={metric.signal}
            status="ready"
            statusLabel=""
            value={metric.value}
          />
        ))}
      </div>
    </>
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
          pl="MetricCard odpowiada za KPI, jego porównanie i mikrotrend. Wariant hero jest zarezerwowany dla najważniejszego KPI, a wariant compact flat dla listy metryk rozdzielanych separatorami."
          en="MetricCard owns KPI, comparison and microtrend. Hero is reserved for the primary KPI, while compact flat is used for separator-based metric lists."
        />
      )}
      title={(
        <Localized
          pl="Wskaźnik ma pokazywać sygnał i hierarchię, nie budować kolejnego panelu w karcie."
          en="A metric should expose signal and hierarchy, not build another panel inside a card."
        />
      )}
    >
      <StoryPresentationSection
        index="01"
        summary="Przychód może mieć największą głębię. Pozostałe KPI schodzą do kompaktowej listy na separatorach."
        title="Hierarchia KPI"
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

      <StoryPresentationSection
        index="04"
        summary="Przycisk „?” otwiera wyjaśnienie metryki — dostępny z klawiatury (Tab, Enter/Spacja) i z widocznym pierścieniem fokusu."
        title="Wyjaśnienie metryki (helpText)"
      >
        <MetricCard
          helpText={locale === 'en'
            ? 'Share of sessions that completed a purchase in the selected period.'
            : 'Odsetek sesji zakończonych zakupem w wybranym okresie.'}
          label={locale === 'en' ? 'Conversion' : 'Konwersja'}
          metricId="help-text-demo"
          status="ready"
          statusLabel={locale === 'en' ? 'Fresh data' : 'Dane aktualne'}
          value={formatPapaDataPercent(0.038, locale)}
        />
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

    // Keyboard users reach the help trigger the same way userEvent.tab()
    // would land them here; focusing it directly keeps this assertion
    // stable regardless of how many focusable elements precede it on the
    // page, while still exercising the real :focus-within CSS that reveals
    // the popover for keyboard/screen-reader users.
    const helpTrigger = canvas.getByRole('button', {
      name: 'Wyjaśnienie metryki: Konwersja',
    });
    helpTrigger.focus();
    await expect(helpTrigger).toHaveFocus();
    // The popover fades in via CSS transition on :focus-within — wait for
    // it to finish rather than asserting mid-transition.
    await waitFor(() => {
      expect(
        canvas.getByText('Odsetek sesji zakończonych zakupem w wybranym okresie.'),
      ).toBeVisible();
    });

    await expect(
      canvas.getByText(/248[\s\u00a0]420,00[\s\u00a0]zł/),
    ).toBeInTheDocument();
  },
};
