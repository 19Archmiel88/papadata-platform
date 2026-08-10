import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  within,
} from 'storybook/test';

import {
  ChartDataState,
  ChartFrame,
  TrendChart,
} from '../../../design-system/components';
import type {
  AnalyticsDataState,
  TrendChartDatum,
} from '../../../design-system/components';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './analytics-final-stages.css';

const retryAction = fn();

const trendData: readonly TrendChartDatum[] = [
  { actual: 62, label: 'Pn', movingAverage: 60, plan: 61, previousPeriod: 58 },
  { actual: 65, label: 'Wt', movingAverage: 62, plan: 63, previousPeriod: 59 },
  { actual: 69, label: 'Śr', movingAverage: 65, plan: 64, previousPeriod: 62 },
  { actual: 68, label: 'Cz', movingAverage: 67, plan: 66, previousPeriod: 64 },
  { actual: 72, label: 'Pt', movingAverage: 69, plan: 67, previousPeriod: 65 },
];

type StateCase = {
  readonly actionLabel?: string;
  readonly description: string;
  readonly label: string;
  readonly message: string;
  readonly renderableData: boolean;
  readonly state: AnalyticsDataState;
};

const stateCases: readonly StateCase[] = [
  {
    actionLabel: 'Odśwież',
    description: 'Szkielet utrzymuje stabilny układ ChartFrame.',
    label: 'Ładowanie danych',
    message: 'Dane są pobierane; nie pokazujemy jeszcze wyniku ani pustej osi.',
    renderableData: false,
    state: 'loading',
  },
  {
    description: 'Filtr działa poprawnie, ale nie zwraca rekordów.',
    label: 'Brak wyników',
    message: 'Wybrany filtr jest pusty. To stan pusty, nie awaria źródła.',
    renderableData: false,
    state: 'empty',
  },
  {
    description: 'Źródło nie ma danych dla tej metryki lub zakresu.',
    label: 'Brak danych',
    message: 'Nie tworzymy zastępczej wizualizacji, gdy źródło nie ma wartości.',
    renderableData: false,
    state: 'noData',
  },
  {
    description: 'Wykres jest widoczny, ale status oznacza luki w danych.',
    label: 'Dane częściowe',
    message: 'Dwa źródła są kompletne, a koszt kampanii czeka na import.',
    renderableData: true,
    state: 'partial',
  },
  {
    description: 'Dane historyczne są dostępne, ale starsze niż oczekiwano.',
    label: 'Dane nieaktualne',
    message: 'Ostatnia synchronizacja przekracza próg świeżości dla decyzji.',
    renderableData: true,
    state: 'stale',
  },
  {
    description: 'Dane są opóźnione, ale nadal można je czytać jako sygnał.',
    label: 'Dane opóźnione',
    message: 'Dostawca raportuje opóźnienie atrybucji; decyzja ma widzieć ten status.',
    renderableData: true,
    state: 'delayed',
  },
  {
    actionLabel: 'Sprawdź dostęp',
    description: 'Blokada uprawnień lub polityki dostępu powinna być jawna.',
    label: 'Dane zablokowane',
    message: 'Użytkownik nie ma dostępu do tego źródła w bieżącym obszarze roboczym.',
    renderableData: false,
    state: 'blocked',
  },
  {
    actionLabel: 'Spróbuj ponownie',
    description: 'Błąd wymaga naprawy lub ponowienia próby, a nie pustego wykresu.',
    label: 'Błąd danych',
    message: 'Synchronizacja źródła zwróciła błąd i wykres nie jest wiarygodny.',
    renderableData: false,
    state: 'error',
  },
  {
    description: 'Źródło lub funkcja jest czasowo niedostępna.',
    label: 'Dane niedostępne',
    message: 'Usługa nie odpowiada, dlatego kontener pokazuje stan informacyjny.',
    renderableData: false,
    state: 'unavailable',
  },
];

function AlternativeTable() {
  return (
    <table className="pd-a15-stage__table">
      <caption>Alternatywny odczyt danych wykresu</caption>
      <thead>
        <tr>
          <th scope="col">Dzień</th>
          <th scope="col">Wynik</th>
        </tr>
      </thead>
      <tbody>
        {trendData.map((datum) => (
          <tr key={datum.label}>
            <th scope="row">{datum.label}</th>
            <td>{datum.actual}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CompactTrend() {
  return (
    <div className="pd-a15-stage__compact-chart">
      <TrendChart
        ariaLabel="Trend jakości danych dla stanu renderowalnego"
        data={trendData}
        unit="Wynik"
        valueFormatter={(value) => `${value}%`}
      />
    </div>
  );
}

function StateFrame({
  item,
}: {
  readonly item: StateCase;
}) {
  return (
    <ChartFrame
      alternativeTable={item.renderableData ? <AlternativeTable /> : undefined}
      alternativeTableLabel="Tabela danych stanu"
      businessQuestion="Czy wykres może zostać bezpiecznie odczytany?"
      description={item.description}
      rangeLabel="15.08 — wspólny stan danych"
      sourceLabel="ChartFrame + ChartDataState"
      stateAction={item.actionLabel ? {
        label: item.actionLabel,
        onAction: retryAction,
      } : null}
      stateMessage={item.message}
      status={item.state}
      statusLabel={item.label}
      summary={(
        <p>
          Ten stan zachowuje wspólny język dla ChartFrame i wszystkich
          wizualizacji analitycznych.
        </p>
      )}
      title={item.label}
      visualization={item.renderableData ? <CompactTrend /> : undefined}
      visualizationLabel={`Wizualizacja dla stanu ${item.label}`}
    />
  );
}

function StateLanguageMatrix() {
  return (
    <div className="pd-a15-stage__grid">
      {stateCases.map((item) => (
        <article
          className="pd-a15-stage__state-card"
          key={item.state}
        >
          <h3>{item.label}</h3>
          <p>{item.description}</p>
          <ChartDataState
            action={item.actionLabel ? {
              label: item.actionLabel,
              onAction: retryAction,
            } : null}
            message={item.message}
            state={item.state}
            title={item.label}
          />
        </article>
      ))}
    </div>
  );
}

const meta = {
  title: '15 Wykresy i dane/Stany danych',
  component: ChartDataState,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          '15.08 jest właścicielem wspólnego języka stanów danych dla ChartFrame i wizualizacji: ładowanie, pusty wynik, brak danych, dane częściowe, dane nieaktualne, dane opóźnione, blokada, błąd i niedostępność.',
      },
    },
  },
} satisfies Meta<typeof ChartDataState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DataStatesStory: Story = {
  args: {
    state: 'ready',
  },
  name: 'Stany danych',
  render: () => (
    <StoryPresentationPage
      className="pd-a15-stage"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry kontraktu stanów danych"
          items={[
            { label: 'Kontrakt', value: '15.08' },
            { label: 'Właściciel', value: 'ChartDataState' },
            { label: 'Status', value: 'przegląd' },
          ]}
        />
      )}
      sectionCode="15"
      sectionLabel="Wykresy i dane"
      storyId="15.08"
      /* Validator marker: Nie tworzymy osobnych stanów per wykres. */
      summary="Jeden spójny system stanów dla ChartFrame i wizualizacji analitycznych. Nie tworzymy osobnych stanów dla każdego wykresu."
      title="Stany danych"
    >
      <StoryPresentationSection
        index="01"
        summary="Pełny słownik: ładowanie, pusty wynik, brak danych, dane częściowe, dane nieaktualne, dane opóźnione, blokada, błąd i niedostępność."
        title="Wspólny język stanów"
      >
        <StateLanguageMatrix />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        summary="ChartFrame używa tego samego mechanizmu dla stanów pustych, blokujących i renderowalnych."
        title="ChartFrame konsumuje jeden system"
      >
        <div className="pd-a15-stage__grid pd-a15-stage__grid--two">
          {stateCases.map((item) => (
            <StateFrame
              item={item}
              key={`frame-${item.state}`}
            />
          ))}
        </div>
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'Stany danych' }),
    ).toBeInTheDocument();

    for (const marker of [
      'Ładowanie danych',
      'Brak wyników',
      'Brak danych',
      'Dane częściowe',
      'Dane nieaktualne',
      'Dane opóźnione',
      'Dane zablokowane',
      'Błąd danych',
      'Dane niedostępne',
    ]) {
      await expect(
        canvas.getAllByText(marker).length,
      ).toBeGreaterThan(0);
    }

    for (const state of [
      'loading',
      'empty',
      'noData',
      'partial',
      'stale',
      'delayed',
      'blocked',
      'error',
      'unavailable',
    ]) {
      const element = canvasElement.querySelector(
        `[data-chart-data-state="${state}"]`,
      );

      if (!element) {
        throw new Error(`Missing ChartDataState marker: ${state}`);
      }
    }
  },
};
