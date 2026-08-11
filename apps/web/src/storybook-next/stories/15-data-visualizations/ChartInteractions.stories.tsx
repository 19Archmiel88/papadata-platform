import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useRef,
  useState,
} from 'react';
import {
  expect,
  fn,
  userEvent,
  within,
} from 'storybook/test';

import {
  ChartFrame,
  ChartInteractionLayer,
  TrendChart,
} from '../../../design-system/components';
import type {
  ChartInteractionFilter,
  ChartInteractionPoint,
  TrendChartDatum,
} from '../../../design-system/components';
import type {
  PapaDataRuntimeLocale,
} from '../../../design-system/foundations';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import {
  type AnalyticsLocalizedCopy,
  Localized,
  readAnalyticsLocale as readLocale,
  Story15Page,
} from './analytics-story-helpers';
import './analytics-final-stages.css';

const drillDownAction = fn();
const guardAction = fn();

const trendDataByLocale: Record<PapaDataRuntimeLocale, readonly TrendChartDatum[]> = {
  en: [
    { actual: 106, label: 'D-6', movingAverage: 104, plan: 105, previousPeriod: 100 },
    { actual: 112, label: 'D-5', movingAverage: 107, plan: 106, previousPeriod: 101 },
    { actual: 118, label: 'D-4', movingAverage: 111, plan: 108, previousPeriod: 104 },
    { actual: 116, label: 'D-3', movingAverage: 115, plan: 110, previousPeriod: 106 },
    { actual: 124, label: 'D-2', movingAverage: 119, plan: 111, previousPeriod: 107 },
    { actual: 129, label: 'D-1', movingAverage: 123, plan: 113, previousPeriod: 109 },
    { actual: 132, label: 'Today', movingAverage: 127, plan: 114, previousPeriod: 110 },
  ],
  pl: [
    { actual: 106, label: 'D-6', movingAverage: 104, plan: 105, previousPeriod: 100 },
    { actual: 112, label: 'D-5', movingAverage: 107, plan: 106, previousPeriod: 101 },
    { actual: 118, label: 'D-4', movingAverage: 111, plan: 108, previousPeriod: 104 },
    { actual: 116, label: 'D-3', movingAverage: 115, plan: 110, previousPeriod: 106 },
    { actual: 124, label: 'D-2', movingAverage: 119, plan: 111, previousPeriod: 107 },
    { actual: 129, label: 'D-1', movingAverage: 123, plan: 113, previousPeriod: 109 },
    { actual: 132, label: 'Dziś', movingAverage: 127, plan: 114, previousPeriod: 110 },
  ],
};

const chartFrameLabels = {
  en: {
    dataStatus: 'Data status',
    freshness: 'Freshness',
    insight: 'Insight',
    source: 'Source',
  },
  pl: {
    dataStatus: 'Status danych',
    freshness: 'Świeżość',
    insight: 'Wniosek',
    source: 'Źródło',
  },
} as const;

const interactionLabels = {
  en: {
    crossFilter: 'Cross-filtering',
    dateRange: 'Date range',
    drillDown: 'Drill down',
    emptySelection: 'No interaction points',
    filters: 'Chart filters',
    reset: 'Reset',
    selection: 'Point or series selection',
    tooltip: 'Data tooltip',
  },
  pl: {
    crossFilter: 'Filtrowanie krzyżowe',
    dateRange: 'Zakres dat',
    drillDown: 'Przejdź w szczegóły',
    emptySelection: 'Brak punktów interakcji',
    filters: 'Filtry wykresu',
    reset: 'Resetuj',
    selection: 'Wybór punktu lub serii',
    tooltip: 'Podpowiedź danych',
  },
} as const;

function pick(
  copy: AnalyticsLocalizedCopy,
  locale: PapaDataRuntimeLocale,
): string {
  return copy[locale];
}

function buildFilters(locale: PapaDataRuntimeLocale): readonly ChartInteractionFilter[] {
  return [
    {
      description: locale === 'en' ? 'All channels' : 'Wszystkie kanały',
      id: 'all',
      label: locale === 'en' ? 'All' : 'Całość',
    },
    {
      description: locale === 'en'
        ? 'Paid search and paid social media'
        : 'Płatne wyszukiwanie i płatne media społecznościowe',
      id: 'paid',
      label: locale === 'en' ? 'Paid' : 'Płatne',
    },
    {
      description: locale === 'en'
        ? 'SEO, direct entries and referrals'
        : 'SEO, wejścia bezpośrednie i odsyłacze',
      id: 'organic',
      label: locale === 'en' ? 'Organic' : 'Organiczne',
    },
  ];
}

function buildPoints(locale: PapaDataRuntimeLocale): readonly ChartInteractionPoint[] {
  return [
    {
      detail: locale === 'en'
        ? 'Growth is visible against plan. Cross-filtering narrows context, but does not change the metric meaning.'
        : 'Wzrost jest widoczny względem planu. Filtrowanie krzyżowe zawęża kontekst, ale nie zmienia znaczenia metryki.',
      drillDownLabel: locale === 'en'
        ? 'Drill down: campaigns'
        : 'Przejdź w szczegóły: kampanie',
      filterId: 'paid',
      id: 'paid-d2',
      label: locale === 'en' ? 'D-2 - Paid' : 'D-2 · Płatne',
      seriesLabel: locale === 'en' ? 'Paid revenue' : 'Przychód płatny',
      valueLabel: locale === 'en' ? '+18.6%' : '+18,6%',
    },
    {
      detail: locale === 'en'
        ? 'Organic channels grow more slowly; point selection only marks the record and does not recalculate the series definition.'
        : 'Kanały organiczne rosną wolniej; wybór punktu tylko wskazuje rekord i nie przelicza definicji serii.',
      drillDownLabel: locale === 'en'
        ? 'Drill down: organic sources'
        : 'Przejdź w szczegóły: źródła organiczne',
      filterId: 'organic',
      id: 'organic-d1',
      label: locale === 'en' ? 'D-1 - Organic' : 'D-1 · Organiczne',
      seriesLabel: locale === 'en' ? 'Organic revenue' : 'Przychód organiczny',
      valueLabel: locale === 'en' ? '+7.4%' : '+7,4%',
    },
    {
      detail: locale === 'en'
        ? 'The whole range keeps the same revenue definition. Reset returns to the full view and the first point.'
        : 'Cały zakres zachowuje tę samą definicję przychodu. Reset wraca do pełnego widoku i pierwszego punktu.',
      drillDownLabel: locale === 'en'
        ? 'Drill down: full range'
        : 'Przejdź w szczegóły: pełny zakres',
      filterId: 'all',
      id: 'all-today',
      label: locale === 'en' ? 'Today - All' : 'Dziś · Całość',
      seriesLabel: locale === 'en' ? 'Total revenue' : 'Przychód razem',
      valueLabel: locale === 'en' ? '+12.9%' : '+12,9%',
    },
  ];
}

const filters = buildFilters('pl');
const points = buildPoints('pl');

function initialInteractionResult(locale: PapaDataRuntimeLocale): string {
  return locale === 'en'
    ? 'Interaction ready. The data definition remains unchanged.'
    : 'Interakcja gotowa. Definicja danych pozostaje bez zmian.';
}

function InteractionDemo() {
  const locale = readLocale();
  const localizedFilters = buildFilters(locale);
  const localizedPoints = buildPoints(locale);
  const [activeFilterId, setActiveFilterId] = useState('all');
  const [selectedPointId, setSelectedPointId] = useState('all-today');
  const [interactionResult, setInteractionResult] = useState(
    initialInteractionResult(locale),
  );
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const selectedPoint = localizedPoints.find((point) => point.id === selectedPointId)
    ?? localizedPoints[0]
    ?? {
      detail: locale === 'en' ? 'No point.' : 'Brak punktu.',
      id: 'fallback',
      label: locale === 'en' ? 'No point' : 'Brak punktu',
      seriesLabel: locale === 'en' ? 'No data' : 'Brak danych',
      valueLabel: '-',
    };

  const rememberInteractionFocus = () => {
    if (document.activeElement instanceof HTMLElement) {
      lastFocusedElementRef.current = document.activeElement;
    }
  };

  const restoreInteractionFocus = () => {
    window.requestAnimationFrame(() => {
      lastFocusedElementRef.current?.focus();
    });
  };

  const reset = () => {
    setActiveFilterId('all');
    setSelectedPointId('all-today');
  };

  return (
    <ChartFrame
      alternativeTable={(
        <table className="pd-a15-stage__table">
          <caption>
            {locale === 'en'
              ? 'Alternative interaction data reading'
              : 'Alternatywny odczyt danych interakcji'}
          </caption>
          <thead>
            <tr>
              <th scope="col">
                {locale === 'en' ? 'Point' : 'Punkt'}
              </th>
              <th scope="col">
                {locale === 'en' ? 'Value' : 'Wartość'}
              </th>
            </tr>
          </thead>
          <tbody>
            {localizedPoints.map((point) => (
              <tr key={point.id}>
                <th scope="row">{point.label}</th>
                <td>{point.valueLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      alternativeTableLabel={locale === 'en'
        ? 'Interaction data table'
        : 'Tabela danych interakcji'}
      businessQuestion={locale === 'en'
        ? 'Which trend point requires drill-down?'
        : 'Który punkt trendu wymaga przejścia w szczegóły?'}
      description={locale === 'en'
        ? '15.09 owns tooltip, hover, keyboard focus, selection, date range, reset, drill-down and cross-filtering.'
        : '15.09 przejmuje podpowiedź, wskazanie kursorem, fokus klawiatury, wybór, zakres dat, resetowanie, przejście w szczegóły i filtrowanie krzyżowe.'}
      labels={chartFrameLabels[locale]}
      rangeLabel={locale === 'en'
        ? 'Date range: last 7 days'
        : 'Zakres dat: ostatnie 7 dni'}
      sourceLabel={locale === 'en'
        ? 'Trend + interaction layer'
        : 'Trend + warstwa interakcji'}
      status="ready"
      statusLabel={locale === 'en' ? 'Current data' : 'Dane aktualne'}
      summary={(
        <>
          <p>
            {locale === 'en'
              ? `Selected point: ${selectedPoint.label}. The interaction marks a record and filter, but does not change data meaning or metric definition.`
              : `Zaznaczony punkt: ${selectedPoint.label}. Interakcja wskazuje rekord i filtr, ale nie zmienia sensu danych ani definicji metryki.`}
          </p>

          <p
            aria-live="polite"
            className="pd-a15-stage__interaction-result"
          >
            {interactionResult}
          </p>
        </>
      )}
      title={locale === 'en'
        ? 'Interactive keyboard trend'
        : 'Interaktywny trend z klawiaturą'}
      visualization={(
        <ChartInteractionLayer
          activeFilterId={activeFilterId}
          dateRangeLabel={locale === 'en' ? 'Last 7 days' : 'Ostatnie 7 dni'}
          description={locale === 'en'
            ? 'Each point is a keyboard-accessible button. Hover and focus update the same tooltip.'
            : 'Każdy punkt jest przyciskiem dostępnym z klawiatury. Wskazanie kursorem i fokus aktualizują tę samą podpowiedź.'}
          filters={localizedFilters}
          labels={interactionLabels[locale]}
          points={localizedPoints}
          selectedPointId={selectedPointId}
          title={locale === 'en'
            ? 'Chart interaction layer'
            : 'Warstwa interakcji wykresu'}
          onDrillDown={(point) => {
            rememberInteractionFocus();
            drillDownAction(point.id);
            setInteractionResult(
              locale === 'en'
                ? `Drill-down selected ${point.label}. Focus restoration kept the invoking control active.`
                : `Przejście w szczegóły wskazało ${point.label}. Przywrócenie fokusu zachowało kontrolkę wywołującą akcję.`,
            );
            restoreInteractionFocus();
          }}
          onFilterChange={(filterId) => {
            rememberInteractionFocus();
            setActiveFilterId(filterId);
            const firstMatchingPoint = localizedPoints.find((point) => (
              point.filterId === filterId
            ));
            setSelectedPointId(firstMatchingPoint?.id ?? 'all-today');
            setInteractionResult(
              locale === 'en'
                ? 'Cross-filtering narrowed the view without changing the metric definition.'
                : 'Filtrowanie krzyżowe zawęziło widok bez zmiany definicji metryki.',
            );
          }}
          onPointSelect={setSelectedPointId}
          onReset={() => {
            rememberInteractionFocus();
            reset();
            setInteractionResult(
              locale === 'en'
                ? 'Reset restored the full range. Focus restoration kept the reset control active.'
                : 'Resetowanie przywróciło pełny zakres. Przywrócenie fokusu zachowało kontrolkę resetowania.',
            );
            restoreInteractionFocus();
          }}
        >
          <TrendChart
            ariaLabel={locale === 'en'
              ? 'Revenue trend with an interactive point layer'
              : 'Trend przychodu z interaktywną warstwą punktów'}
            data={trendDataByLocale[locale]}
            unit={locale === 'en' ? 'Revenue index' : 'Indeks przychodu'}
            valueFormatter={(value) => (locale === 'en'
              ? `${value} pts`
              : `${value} pkt`)}
          />
        </ChartInteractionLayer>
      )}
      visualizationLabel={locale === 'en'
        ? 'Interaction layer and revenue trend'
        : 'Warstwa interakcji i trend przychodu'}
    />
  );
}

function EmptyPointsGuard() {
  const locale = readLocale();

  return (
    <ChartFrame
      businessQuestion={locale === 'en'
        ? 'What happens when the interaction source returns no points?'
        : 'Co się dzieje, gdy źródło interakcji nie zwróci punktów?'}
      description={locale === 'en'
        ? 'The public mechanism does not dereference an empty point array and exposes a safe informational state.'
        : 'Publiczny mechanizm nie dereferencjonuje pustej tablicy punktów i pokazuje bezpieczny stan informacyjny.'}
      labels={chartFrameLabels[locale]}
      rangeLabel={locale === 'en' ? 'Test range' : 'Zakres testowy'}
      sourceLabel={locale === 'en'
        ? 'Interaction layer'
        : 'Warstwa interakcji'}
      status="ready"
      statusLabel={locale === 'en' ? 'Current data' : 'Dane aktualne'}
      summary={(
        <p>
          {locale === 'en'
            ? 'The empty state is readable as text and remains outside chart geometry.'
            : 'Stan pusty jest czytelny jako tekst i pozostaje poza geometrią wykresu.'}
        </p>
      )}
      title={locale === 'en'
        ? 'Empty interaction points guard'
        : 'Zabezpieczenie pustej listy punktów'}
      visualization={(
        <ChartInteractionLayer
          activeFilterId="guard"
          dateRangeLabel={locale === 'en' ? 'Test range' : 'Zakres testowy'}
          description={locale === 'en'
            ? 'The public mechanism does not dereference an empty point array and shows a safe informational state.'
            : 'Publiczny mechanizm nie dereferencjonuje pustej tablicy punktów i pokazuje bezpieczny stan informacyjny.'}
          filters={[
            {
              description: locale === 'en'
                ? 'No points in response'
                : 'Brak punktów w odpowiedzi',
              id: 'guard',
              label: locale === 'en' ? 'Guard' : 'Zabezpieczenie',
            },
          ]}
          labels={interactionLabels[locale]}
          points={[]}
          selectedPointId="missing-point"
          title={locale === 'en'
            ? 'Empty point list guard'
            : 'Zabezpieczenie pustej listy punktów'}
          onFilterChange={guardAction}
          onPointSelect={guardAction}
          onReset={guardAction}
        >
          <TrendChart
            ariaLabel={locale === 'en'
              ? 'Auxiliary trend for the empty point guard'
              : 'Trend pomocniczy dla guardu pustej listy punktów'}
            data={trendDataByLocale[locale]}
            unit={locale === 'en' ? 'Revenue index' : 'Indeks przychodu'}
            valueFormatter={(value) => (locale === 'en'
              ? `${value} pts`
              : `${value} pkt`)}
          />
        </ChartInteractionLayer>
      )}
      visualizationLabel={locale === 'en'
        ? 'Empty point guard interaction layer'
        : 'Warstwa interakcji guardu pustych punktów'}
    />
  );
}

// Validator markers for 15.09: tooltip, hover, focus z klawiatury,
// selection, date range, reset, drill-down, cross-filtering,
// Focus restoration, Guard pustych punktów.
const meta = {
  title: '15 Wykresy i dane/03 Stany i interakcje/Interakcje i filtry',
  component: ChartInteractionLayer,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          '15.09 jest właścicielem interakcji wykresów: podpowiedzi, wskazania kursorem, fokusu klawiatury, wyboru, zakresu dat, resetowania, przejścia w szczegóły i filtrowania krzyżowego bez zmiany semantyki danych.',
      },
    },
  },
} satisfies Meta<typeof ChartInteractionLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ChartInteractionsStory: Story = {
  args: {
    activeFilterId: 'all',
    children: <span />,
    dateRangeLabel: 'Ostatnie 7 dni',
    filters,
    onFilterChange: fn(),
    onPointSelect: fn(),
    onReset: fn(),
    points,
    selectedPointId: 'all-today',
    title: 'Warstwa interakcji wykresu',
  },
  name: 'Interakcje i filtry',
  render: () => (
    <Story15Page
      className="pd-a15-stage"
      metaAriaLabel={{
        en: 'Interaction contract parameters',
        pl: 'Parametry kontraktu interakcji',
      }}
      metaItems={[
        { label: <Localized en="Contract" pl="Kontrakt" />, value: '15.09' },
        {
          label: <Localized en="Owner" pl="Właściciel" />,
          value: <Localized en="Interaction layer" pl="Warstwa interakcji" />,
        },
        { label: <Localized en="Status" pl="Status" />, value: <Localized en="review" pl="przegląd" /> },
      ]}
      storyId="15.09"
      summary={(
        <Localized
          en="Interactions are keyboard-accessible and do not change data meaning. Chart geometry still belongs to owners 15.03-15.07."
          pl="Interakcje są dostępne z klawiatury i nie zmieniają sensu danych. Geometria wykresów nadal należy do właścicieli 15.03–15.07."
        />
      )}
      title={<Localized en="Interactions and filters" pl="Interakcje i filtry" />}
    >
      <StoryPresentationSection
        index="01"
        summary={(
          <Localized
            en="Tooltip, hover, keyboard focus, selection, date range, reset, drill-down and cross-filtering in one layer."
            pl="Podpowiedź, wskazanie kursorem, fokus klawiatury, wybór, zakres dat, resetowanie, przejście w szczegóły i filtrowanie krzyżowe w jednej warstwie."
          />
        )}
        title={<Localized en="Shared interaction model" pl="Wspólny model interakcji" />}
      >
        <InteractionDemo />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        summary={(
          <Localized
            en="15.09 does not own result, plan, comparison, share, correlation or forecast semantics; it only shows how users work with already defined data."
            pl="15.09 nie przejmuje wyniku, planu, porównań, udziałów, korelacji ani prognozy; wskazuje tylko jak użytkownik pracuje z już zdefiniowanymi danymi."
          />
        )}
        title={<Localized en="Ownership boundary" pl="Granica własności" />}
      >
        <p className="pd-a15-stage__note">
          <Localized
            en="TrendChart, ComparisonChart, ShareChart, CorrelationChart and ForecastChart remain owners of series meaning. 15.09 adds an accessible way to point, filter and drill down."
            pl="TrendChart, ComparisonChart, ShareChart, CorrelationChart i ForecastChart pozostają właścicielami znaczenia serii. 15.09 dodaje dostępny sposób wskazania, filtrowania i przejścia w szczegóły."
          />
        </p>
      </StoryPresentationSection>

      <StoryPresentationSection
        index="03"
        summary={(
          <Localized
            en="The interaction layer has a safe state when the source does not provide selectable points."
            pl="Warstwa interakcji ma bezpieczny stan, gdy źródło nie dostarczy punktów do wyboru."
          />
        )}
        title={<Localized en="Empty point guard" pl="Zabezpieczenie pustych punktów" />}
      >
        <EmptyPointsGuard />
      </StoryPresentationSection>
    </Story15Page>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'Interakcje i filtry' }),
    ).toBeInTheDocument();

    const paidFilter = canvas.getByRole('button', {
      name: /Płatne wyszukiwanie/,
    });
    paidFilter.focus();

    await expect(paidFilter).toHaveFocus();

    await userEvent.click(paidFilter);

    await expect(
      canvas.getByText(/Przychód płatny/),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText(/Filtrowanie krzyżowe zawęziło widok/),
    ).toBeInTheDocument();

    const organicPoint = canvas.getByRole('button', {
      name: /D-1 · Organiczne/,
    });

    await userEvent.hover(organicPoint);

    await expect(
      canvas.getByText(/Kanały organiczne rosną wolniej/),
    ).toBeInTheDocument();

    organicPoint.focus();

    await expect(organicPoint).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    await expect(
      canvas.getByText(/Przychód organiczny/),
    ).toBeInTheDocument();

    const resetButton = canvas.getAllByRole('button', { name: 'Resetuj' })[0];

    if (!resetButton) {
      throw new Error('Reset button is missing.');
    }

    resetButton.focus();

    await expect(resetButton).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    await expect(resetButton).toHaveFocus();

    await expect(
      canvas.getByText(/Przywrócenie fokusu zachowało kontrolkę resetowania/),
    ).toBeInTheDocument();

    const drillDownButton = canvas.getByRole('button', {
      name: /Przejdź w szczegóły/,
    });
    drillDownButton.focus();

    await expect(drillDownButton).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    await expect(drillDownButton).toHaveFocus();

    await expect(
      canvas.getByText(/Przywrócenie fokusu zachowało kontrolkę wywołującą akcję/),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText(/nie zmienia sensu danych/),
    ).toBeInTheDocument();

    await expect(
      canvas.getAllByText(/Brak punktów interakcji/).length,
    ).toBeGreaterThan(0);

    const emptyPointMarker = canvasElement.querySelector(
      '[data-state="empty-points"]',
    );

    if (!emptyPointMarker) {
      throw new Error('ChartInteractionLayer empty points guard is missing.');
    }
  },
};
