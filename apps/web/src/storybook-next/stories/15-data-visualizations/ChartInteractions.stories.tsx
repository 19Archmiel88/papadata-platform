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
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './analytics-final-stages.css';

const drillDownAction = fn();
const guardAction = fn();

const trendData: readonly TrendChartDatum[] = [
  { actual: 106, label: 'D-6', movingAverage: 104, plan: 105, previousPeriod: 100 },
  { actual: 112, label: 'D-5', movingAverage: 107, plan: 106, previousPeriod: 101 },
  { actual: 118, label: 'D-4', movingAverage: 111, plan: 108, previousPeriod: 104 },
  { actual: 116, label: 'D-3', movingAverage: 115, plan: 110, previousPeriod: 106 },
  { actual: 124, label: 'D-2', movingAverage: 119, plan: 111, previousPeriod: 107 },
  { actual: 129, label: 'D-1', movingAverage: 123, plan: 113, previousPeriod: 109 },
  { actual: 132, label: 'Dziś', movingAverage: 127, plan: 114, previousPeriod: 110 },
];

const filters: readonly ChartInteractionFilter[] = [
  {
    description: 'Wszystkie kanały',
    id: 'all',
    label: 'Całość',
  },
  {
    description: 'Płatne wyszukiwanie i płatne media społecznościowe',
    id: 'paid',
    label: 'Płatne',
  },
  {
    description: 'SEO, wejścia bezpośrednie i odsyłacze',
    id: 'organic',
    label: 'Organiczne',
  },
];

const points: readonly ChartInteractionPoint[] = [
  {
    detail:
      'Wzrost jest widoczny względem planu. Filtrowanie krzyżowe zawęża kontekst, ale nie zmienia znaczenia metryki.',
    drillDownLabel: 'Przejdź w szczegóły: kampanie',
    filterId: 'paid',
    id: 'paid-d2',
    label: 'D-2 · Płatne',
    seriesLabel: 'Przychód płatny',
    valueLabel: '+18,6%',
  },
  {
    detail:
      'Kanały organiczne rosną wolniej; wybór punktu tylko wskazuje rekord i nie przelicza definicji serii.',
    drillDownLabel: 'Przejdź w szczegóły: źródła organiczne',
    filterId: 'organic',
    id: 'organic-d1',
    label: 'D-1 · Organiczne',
    seriesLabel: 'Przychód organiczny',
    valueLabel: '+7,4%',
  },
  {
    detail:
      'Cały zakres zachowuje tę samą definicję przychodu. Reset wraca do pełnego widoku i pierwszego punktu.',
    drillDownLabel: 'Przejdź w szczegóły: pełny zakres',
    filterId: 'all',
    id: 'all-today',
    label: 'Dziś · Całość',
    seriesLabel: 'Przychód razem',
    valueLabel: '+12,9%',
  },
];

function InteractionDemo() {
  const [activeFilterId, setActiveFilterId] = useState('all');
  const [selectedPointId, setSelectedPointId] = useState('all-today');
  const [interactionResult, setInteractionResult] = useState(
    'Interakcja gotowa. Definicja danych pozostaje bez zmian.',
  );
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const selectedPoint = points.find((point) => point.id === selectedPointId)
    ?? points[0]
    ?? {
      detail: 'Brak punktu.',
      id: 'fallback',
      label: 'Brak punktu',
      seriesLabel: 'Brak danych',
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
          <caption>Alternatywny odczyt danych interakcji</caption>
          <thead>
            <tr>
              <th scope="col">Punkt</th>
              <th scope="col">Wartość</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.id}>
                <th scope="row">{point.label}</th>
                <td>{point.valueLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      alternativeTableLabel="Tabela danych interakcji"
      businessQuestion="Który punkt trendu wymaga przejścia w szczegóły?"
      description="15.09 przejmuje podpowiedź, wskazanie kursorem, fokus klawiatury, wybór, zakres dat, resetowanie, przejście w szczegóły i filtrowanie krzyżowe."
      rangeLabel="Zakres dat: ostatnie 7 dni"
      sourceLabel="TrendChart + ChartInteractionLayer"
      status="ready"
      statusLabel="Interakcje gotowe"
      summary={(
        <>
          <p>
            Zaznaczony punkt: {selectedPoint.label}. Interakcja wskazuje rekord
            i filtr, ale nie zmienia sensu danych ani definicji metryki.
          </p>

          <p
            aria-live="polite"
            className="pd-a15-stage__interaction-result"
          >
            {interactionResult}
          </p>
        </>
      )}
      title="Interaktywny trend z klawiaturą"
      visualization={(
        <ChartInteractionLayer
          activeFilterId={activeFilterId}
          dateRangeLabel="Ostatnie 7 dni"
          description="Każdy punkt jest przyciskiem dostępnym z klawiatury. Wskazanie kursorem i fokus aktualizują tę samą podpowiedź."
          filters={filters}
          points={points}
          selectedPointId={selectedPointId}
          title="Warstwa interakcji wykresu"
          onDrillDown={(point) => {
            rememberInteractionFocus();
            drillDownAction(point.id);
            setInteractionResult(
              `Przejście w szczegóły wskazało ${point.label}. Przywrócenie fokusu zachowało kontrolkę wywołującą akcję.`,
            );
            restoreInteractionFocus();
          }}
          onFilterChange={(filterId) => {
            rememberInteractionFocus();
            setActiveFilterId(filterId);
            const firstMatchingPoint = points.find((point) => (
              point.filterId === filterId
            ));
            setSelectedPointId(firstMatchingPoint?.id ?? 'all-today');
            setInteractionResult(
              'Filtrowanie krzyżowe zawęziło widok bez zmiany definicji metryki.',
            );
          }}
          onPointSelect={setSelectedPointId}
          onReset={() => {
            rememberInteractionFocus();
            reset();
            setInteractionResult(
              'Resetowanie przywróciło pełny zakres. Przywrócenie fokusu zachowało kontrolkę resetowania.',
            );
            restoreInteractionFocus();
          }}
        >
          <TrendChart
            ariaLabel="Trend przychodu z interaktywną warstwą punktów"
            data={trendData}
            unit="Indeks przychodu"
            valueFormatter={(value) => `${value} pkt`}
          />
        </ChartInteractionLayer>
      )}
      visualizationLabel="Warstwa interakcji i trend przychodu"
    />
  );
}

function EmptyPointsGuard() {
  return (
    <ChartInteractionLayer
      activeFilterId="guard"
      dateRangeLabel="Zakres testowy"
      description="Publiczny mechanizm nie dereferencjonuje pustej tablicy punktów i pokazuje bezpieczny stan informacyjny."
      filters={[
        {
          description: 'Brak punktów w odpowiedzi',
          id: 'guard',
          label: 'Zabezpieczenie',
        },
      ]}
      labels={{
        emptySelection: 'Brak punktów interakcji',
      }}
      points={[]}
      selectedPointId="missing-point"
      title="Zabezpieczenie pustej listy punktów"
      onFilterChange={guardAction}
      onPointSelect={guardAction}
      onReset={guardAction}
    >
      <TrendChart
        ariaLabel="Trend pomocniczy dla guardu pustej listy punktów"
        data={trendData}
        unit="Indeks przychodu"
        valueFormatter={(value) => `${value} pkt`}
      />
    </ChartInteractionLayer>
  );
}

// Validator markers for 15.09: tooltip, hover, focus z klawiatury,
// selection, date range, reset, drill-down, cross-filtering,
// Focus restoration, Guard pustych punktów.
const meta = {
  title: '15 Wykresy i dane/Interakcje i filtry',
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
    <StoryPresentationPage
      className="pd-a15-stage"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry kontraktu interakcji"
          items={[
            { label: 'Kontrakt', value: '15.09' },
            { label: 'Właściciel', value: 'ChartInteractionLayer' },
            { label: 'Status', value: 'przegląd' },
          ]}
        />
      )}
      sectionCode="15"
      sectionLabel="Wykresy i dane"
      storyId="15.09"
      summary="Interakcje są dostępne z klawiatury i nie zmieniają sensu danych. Geometria wykresów nadal należy do właścicieli 15.03–15.07."
      title="Interakcje i filtry"
    >
      <StoryPresentationSection
        index="01"
        summary="Podpowiedź, wskazanie kursorem, fokus klawiatury, wybór, zakres dat, resetowanie, przejście w szczegóły i filtrowanie krzyżowe w jednej warstwie."
        title="Wspólny model interakcji"
      >
        <InteractionDemo />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        summary="15.09 nie przejmuje wyniku, planu, porównań, udziałów, korelacji ani prognozy; wskazuje tylko jak użytkownik pracuje z już zdefiniowanymi danymi."
        title="Granica własności"
      >
        <p className="pd-a15-stage__note">
          TrendChart, ComparisonChart, ShareChart, CorrelationChart i
          ForecastChart pozostają właścicielami znaczenia serii. 15.09
          dodaje dostępny sposób wskazania, filtrowania i przejścia w szczegóły.
        </p>
      </StoryPresentationSection>

      <StoryPresentationSection
        index="03"
        summary="Warstwa interakcji ma bezpieczny stan, gdy źródło nie dostarczy punktów do wyboru."
        title="Zabezpieczenie pustych punktów"
      >
        <EmptyPointsGuard />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'Interakcje i filtry' }),
    ).toBeInTheDocument();

    const paidFilter = canvas.getByRole('button', { name: /Płatne/ });
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
