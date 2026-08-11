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

const retryAction = fn();

const trendDataByLocale: Record<PapaDataRuntimeLocale, readonly TrendChartDatum[]> = {
  en: [
    { actual: 62, label: 'Mon', movingAverage: 60, plan: 61, previousPeriod: 58 },
    { actual: 65, label: 'Tue', movingAverage: 62, plan: 63, previousPeriod: 59 },
    { actual: 69, label: 'Wed', movingAverage: 65, plan: 64, previousPeriod: 62 },
    { actual: 68, label: 'Thu', movingAverage: 67, plan: 66, previousPeriod: 64 },
    { actual: 72, label: 'Fri', movingAverage: 69, plan: 67, previousPeriod: 65 },
  ],
  pl: [
    { actual: 62, label: 'Pn', movingAverage: 60, plan: 61, previousPeriod: 58 },
    { actual: 65, label: 'Wt', movingAverage: 62, plan: 63, previousPeriod: 59 },
    { actual: 69, label: 'Śr', movingAverage: 65, plan: 64, previousPeriod: 62 },
    { actual: 68, label: 'Cz', movingAverage: 67, plan: 66, previousPeriod: 64 },
    { actual: 72, label: 'Pt', movingAverage: 69, plan: 67, previousPeriod: 65 },
  ],
};

type StateCase = {
  readonly actionLabel?: AnalyticsLocalizedCopy;
  readonly description: AnalyticsLocalizedCopy;
  readonly label: AnalyticsLocalizedCopy;
  readonly message: AnalyticsLocalizedCopy;
  readonly renderableData: boolean;
  readonly state: AnalyticsDataState;
};

const stateCases: readonly StateCase[] = [
  {
    actionLabel: {
      en: 'Refresh',
      pl: 'Odśwież',
    },
    description: {
      en: 'The skeleton preserves a stable ChartFrame layout.',
      pl: 'Szkielet utrzymuje stabilny układ ChartFrame.',
    },
    label: {
      en: 'Loading data',
      pl: 'Ładowanie danych',
    },
    message: {
      en: 'Data is being fetched; the result and empty axis are not shown yet.',
      pl: 'Dane są pobierane; nie pokazujemy jeszcze wyniku ani pustej osi.',
    },
    renderableData: false,
    state: 'loading',
  },
  {
    description: {
      en: 'The filter works correctly, but returns no records.',
      pl: 'Filtr działa poprawnie, ale nie zwraca rekordów.',
    },
    label: {
      en: 'No results',
      pl: 'Brak wyników',
    },
    message: {
      en: 'The selected filter is empty. This is an empty state, not a source failure.',
      pl: 'Wybrany filtr jest pusty. To stan pusty, nie awaria źródła.',
    },
    renderableData: false,
    state: 'empty',
  },
  {
    description: {
      en: 'The source has no data for this metric or range.',
      pl: 'Źródło nie ma danych dla tej metryki lub zakresu.',
    },
    label: {
      en: 'No data',
      pl: 'Brak danych',
    },
    message: {
      en: 'We do not create a replacement visualization when the source has no values.',
      pl: 'Nie tworzymy zastępczej wizualizacji, gdy źródło nie ma wartości.',
    },
    renderableData: false,
    state: 'noData',
  },
  {
    description: {
      en: 'The chart is visible, but the status marks gaps in the data.',
      pl: 'Wykres jest widoczny, ale status oznacza luki w danych.',
    },
    label: {
      en: 'Partial data',
      pl: 'Dane częściowe',
    },
    message: {
      en: 'Two sources are complete and campaign cost is waiting for import.',
      pl: 'Dwa źródła są kompletne, a koszt kampanii czeka na import.',
    },
    renderableData: true,
    state: 'partial',
  },
  {
    description: {
      en: 'Historical data is available, but older than expected.',
      pl: 'Dane historyczne są dostępne, ale starsze niż oczekiwano.',
    },
    label: {
      en: 'Stale data',
      pl: 'Dane nieaktualne',
    },
    message: {
      en: 'The last sync exceeds the freshness threshold for decisions.',
      pl: 'Ostatnia synchronizacja przekracza próg świeżości dla decyzji.',
    },
    renderableData: true,
    state: 'stale',
  },
  {
    description: {
      en: 'Data is delayed, but can still be read as a signal.',
      pl: 'Dane są opóźnione, ale nadal można je czytać jako sygnał.',
    },
    label: {
      en: 'Delayed data',
      pl: 'Dane opóźnione',
    },
    message: {
      en: 'The provider reports attribution delay; the decision must see that status.',
      pl: 'Dostawca raportuje opóźnienie atrybucji; decyzja ma widzieć ten status.',
    },
    renderableData: true,
    state: 'delayed',
  },
  {
    actionLabel: {
      en: 'Check access',
      pl: 'Sprawdź dostęp',
    },
    description: {
      en: 'Access or policy blocking should be explicit.',
      pl: 'Blokada uprawnień lub polityki dostępu powinna być jawna.',
    },
    label: {
      en: 'Blocked data',
      pl: 'Dane zablokowane',
    },
    message: {
      en: 'The user cannot access this source in the current workspace.',
      pl: 'Użytkownik nie ma dostępu do tego źródła w bieżącym obszarze roboczym.',
    },
    renderableData: false,
    state: 'blocked',
  },
  {
    actionLabel: {
      en: 'Try again',
      pl: 'Spróbuj ponownie',
    },
    description: {
      en: 'An error requires repair or retry, not an empty chart.',
      pl: 'Błąd wymaga naprawy lub ponowienia próby, a nie pustego wykresu.',
    },
    label: {
      en: 'Data error',
      pl: 'Błąd danych',
    },
    message: {
      en: 'Source synchronization returned an error and the chart is not reliable.',
      pl: 'Synchronizacja źródła zwróciła błąd i wykres nie jest wiarygodny.',
    },
    renderableData: false,
    state: 'error',
  },
  {
    description: {
      en: 'The source or feature is temporarily unavailable.',
      pl: 'Źródło lub funkcja jest czasowo niedostępna.',
    },
    label: {
      en: 'Unavailable data',
      pl: 'Dane niedostępne',
    },
    message: {
      en: 'The service is not responding, so the container shows an informational state.',
      pl: 'Usługa nie odpowiada, dlatego kontener pokazuje stan informacyjny.',
    },
    renderableData: false,
    state: 'unavailable',
  },
];

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

function pick(
  copy: AnalyticsLocalizedCopy,
  locale: PapaDataRuntimeLocale,
): string {
  return copy[locale];
}

function AlternativeTable({
  locale,
}: {
  readonly locale: PapaDataRuntimeLocale;
}) {
  const trendData = trendDataByLocale[locale];

  return (
    <table className="pd-a15-stage__table">
      <caption>
        {locale === 'en'
          ? 'Alternative chart data reading'
          : 'Alternatywny odczyt danych wykresu'}
      </caption>
      <thead>
        <tr>
          <th scope="col">
            {locale === 'en' ? 'Day' : 'Dzień'}
          </th>
          <th scope="col">
            {locale === 'en' ? 'Score' : 'Wynik'}
          </th>
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

function CompactTrend({
  locale,
}: {
  readonly locale: PapaDataRuntimeLocale;
}) {
  return (
    <div className="pd-a15-stage__compact-chart">
      <TrendChart
        ariaLabel={locale === 'en'
          ? 'Data quality trend for a renderable state'
          : 'Trend jakości danych dla stanu renderowalnego'}
        data={trendDataByLocale[locale]}
        unit={locale === 'en' ? 'Score' : 'Wynik'}
        valueFormatter={(value) => `${value}%`}
      />
    </div>
  );
}

function StateFrame({
  item,
  locale,
}: {
  readonly item: StateCase;
  readonly locale: PapaDataRuntimeLocale;
}) {
  const label = pick(item.label, locale);

  return (
    <ChartFrame
      alternativeTable={item.renderableData ? <AlternativeTable locale={locale} /> : undefined}
      alternativeTableLabel={locale === 'en'
        ? 'State data table'
        : 'Tabela danych stanu'}
      businessQuestion={locale === 'en'
        ? 'Can the chart be safely read?'
        : 'Czy wykres może zostać bezpiecznie odczytany?'}
      description={pick(item.description, locale)}
      labels={chartFrameLabels[locale]}
      rangeLabel={locale === 'en'
        ? '15.08 - shared data state'
        : '15.08 — wspólny stan danych'}
      sourceLabel="ChartFrame + ChartDataState"
      stateAction={item.actionLabel ? {
        label: pick(item.actionLabel, locale),
        onAction: retryAction,
      } : null}
      stateMessage={pick(item.message, locale)}
      status={item.state}
      statusLabel={label}
      summary={(
        <p>
          <Localized
            en="This state keeps one shared language for ChartFrame and all analytical visualizations."
            pl="Ten stan zachowuje wspólny język dla ChartFrame i wszystkich wizualizacji analitycznych."
          />
        </p>
      )}
      title={label}
      visualization={item.renderableData ? <CompactTrend locale={locale} /> : undefined}
      visualizationLabel={locale === 'en'
        ? `Visualization for ${label}`
        : `Wizualizacja dla stanu ${label}`}
    />
  );
}

function StateLanguageMatrix({
  locale,
}: {
  readonly locale: PapaDataRuntimeLocale;
}) {
  return (
    <div className="pd-a15-stage__grid">
      {stateCases.map((item) => {
        const label = pick(item.label, locale);

        return (
          <article
            className="pd-a15-stage__state-card"
            key={item.state}
          >
            <h3>{label}</h3>
            <p>{pick(item.description, locale)}</p>
            <ChartDataState
              action={item.actionLabel ? {
                label: pick(item.actionLabel, locale),
                onAction: retryAction,
              } : null}
              message={pick(item.message, locale)}
              state={item.state}
              title={label}
            />
          </article>
        );
      })}
    </div>
  );
}

const meta = {
  title: '15 Wykresy i dane/03 Stany i interakcje/Stany danych',
  component: ChartDataState,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          '15.08 jest właścicielem analitycznego języka stanów danych dla ChartFrame i wizualizacji. Wygląd ogólnych komunikatów, badge’y i toastów pozostaje w 00 / Powierzchnie i komunikaty.',
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
  render: () => {
    const locale = readLocale();

    return (
      <Story15Page
        className="pd-a15-stage"
        metaAriaLabel={{
          en: 'Data states contract parameters',
          pl: 'Parametry kontraktu stanów danych',
        }}
        metaItems={[
          { label: <Localized en="Contract" pl="Kontrakt" />, value: '15.08' },
          { label: <Localized en="Owner" pl="Właściciel" />, value: 'ChartDataState' },
          { label: <Localized en="Status" pl="Status" />, value: <Localized en="review" pl="przegląd" /> },
        ]}
        storyId="15.08"
        /* Validator marker: Nie tworzymy osobnych stanów per wykres. */
        summary={(
          <Localized
            en="One consistent analytical state system for ChartFrame and visualizations. We do not create separate states for each chart or a private notification system."
            pl="Jeden spójny system stanów analitycznych dla ChartFrame i wizualizacji. Nie tworzymy osobnych stanów dla każdego wykresu ani prywatnego systemu komunikatów."
          />
        )}
        title={<Localized en="Data states" pl="Stany danych" />}
      >
        <StoryPresentationSection
          index="01"
          summary={(
            <Localized
              en="Analytical vocabulary: loading, empty result, no data, partial data, stale data, delayed data, blocked, error and unavailable."
              pl="Analityczny słownik: ładowanie, pusty wynik, brak danych, dane częściowe, dane nieaktualne, dane opóźnione, blokada, błąd i niedostępność."
            />
          )}
          title={<Localized en="Analytical data-state language" pl="Analityczny język stanów danych" />}
        >
          <StateLanguageMatrix locale={locale} />
        </StoryPresentationSection>

        <StoryPresentationSection
          index="02"
          summary={(
            <Localized
              en="ChartFrame uses the same mechanism for empty, blocking and renderable states."
              pl="ChartFrame używa tego samego mechanizmu dla stanów pustych, blokujących i renderowalnych."
            />
          )}
          title={<Localized en="ChartFrame consumes one system" pl="ChartFrame konsumuje jeden system" />}
        >
          <div className="pd-a15-stage__grid pd-a15-stage__grid--two">
            {stateCases.map((item) => (
              <StateFrame
                item={item}
                key={`frame-${item.state}`}
                locale={locale}
              />
            ))}
          </div>
        </StoryPresentationSection>
      </Story15Page>
    );
  },
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
