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
  ForecastChart,
} from '../../../design-system/components';
import type {
  ForecastChartLabels,
  ForecastChartScenario,
  ForecastChartSeriesPoint,
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
import './forecast-chart-showcase.css';

const actualRevenue: readonly ForecastChartSeriesPoint[] = [
  { label: 'D-6', value: 184000 },
  { label: 'D-5', value: 188400 },
  { label: 'D-4', value: 191600 },
  { label: 'D-3', value: 195800 },
  { label: 'D-2', value: 199300 },
  { label: 'D-1', value: 201100 },
  { label: 'Dziś', value: 204800 },
];

const forecastRevenue: readonly ForecastChartSeriesPoint[] = [
  { label: 'Dziś', value: 204800 },
  { label: '+1', value: 207600 },
  { label: '+2', value: 210400 },
  { label: '+3', value: 213900 },
  { label: '+4', value: 216500 },
  { label: '+5', value: 219700 },
  { label: '+6', value: 222400 },
  { label: '+7', value: 225900 },
];

const lowerRevenue: readonly ForecastChartSeriesPoint[] = [
  { label: '+1', value: 203100 },
  { label: '+2', value: 204600 },
  { label: '+3', value: 206400 },
  { label: '+4', value: 207300 },
  { label: '+5', value: 208200 },
  { label: '+6', value: 209100 },
  { label: '+7', value: 209900 },
];

const upperRevenue: readonly ForecastChartSeriesPoint[] = [
  { label: '+1', value: 211900 },
  { label: '+2', value: 216100 },
  { label: '+3', value: 221500 },
  { label: '+4', value: 225800 },
  { label: '+5', value: 231300 },
  { label: '+6', value: 235500 },
  { label: '+7', value: 241700 },
];

const confidenceRangeActual: readonly ForecastChartSeriesPoint[] = [
  { label: 'Wk 1', value: 62 },
  { label: 'Wk 2', value: 64 },
  { label: 'Wk 3', value: 67 },
  { label: 'Wk 4', value: 66 },
];

const confidenceRangeForecast: readonly ForecastChartSeriesPoint[] = [
  { label: 'Wk 4', value: 66 },
  { label: 'Wk 5', value: 68 },
  { label: 'Wk 6', value: 70 },
  { label: 'Wk 7', value: 71 },
  { label: 'Wk 8', value: 73 },
];

const confidenceRangeLower: readonly ForecastChartSeriesPoint[] = [
  { label: 'Wk 5', value: 63 },
  { label: 'Wk 6', value: 62 },
  { label: 'Wk 7', value: 61 },
  { label: 'Wk 8', value: 60 },
];

const confidenceRangeUpper: readonly ForecastChartSeriesPoint[] = [
  { label: 'Wk 5', value: 73 },
  { label: 'Wk 6', value: 78 },
  { label: 'Wk 7', value: 82 },
  { label: 'Wk 8', value: 86 },
];

const scenariosPl: readonly ForecastChartScenario[] = [
  {
    description:
      'Model utrzymuje bieżący trend bez dodatkowego impulsu marketingowego.',
    id: 'baseline',
    label: 'Bazowy',
    tone: 'baseline',
    valueLabel: '+10,3%',
  },
  {
    description:
      'Zakłada poprawę dostępności top produktów i stabilne koszty kampanii.',
    id: 'optimistic',
    label: 'Optymistyczny',
    tone: 'optimistic',
    valueLabel: '+17,9%',
  },
  {
    description:
      'Zakłada opóźnione dostawy i większy rozrzut sygnałów po źródłach.',
    id: 'conservative',
    label: 'Konserwatywny',
    tone: 'conservative',
    valueLabel: '+2,4%',
  },
];

function readLocale(): PapaDataRuntimeLocale {
  return 'pl';
}

function formatCurrency(
  value: number,
  locale: PapaDataRuntimeLocale,
): string {
  const formatted = new Intl.NumberFormat(
    locale === 'en'
      ? 'en-GB'
      : 'pl-PL',
    {
      maximumFractionDigits: 0,
      notation: 'compact',
    },
  ).format(value);

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
      maximumFractionDigits: 0,
      style: 'percent',
    },
  ).format(value / 100);
}

function buildLabels(): Partial<ForecastChartLabels> {
  return {
    confidence: 'Pewność zapytania',
    forecastDisclaimer:
      'Prognoza nie jest faktem. Linia „dziś” oddziela historię od prognozy, a zakres pokazuje niepewność.',
  };
}

function RevenueAlternativeTable() {
  const locale = readLocale();

  return (
    <table className="pd-forecast-story__table">
      <caption>
        Dane prognozy rozdzielone na okres historyczny i przewidywany
      </caption>
      <thead>
        <tr>
          <th scope="col">Okres</th>
          <th scope="col">Historia</th>
          <th scope="col">Prognoza</th>
          <th scope="col">Zakres niepewności</th>
        </tr>
      </thead>
      <tbody>
        {[
          {
            actual: 204800,
            forecast: null,
            label: 'Dziś',
            range: null,
          },
          {
            actual: null,
            forecast: 213900,
            label: '+3',
            range: [206400, 221500] as const,
          },
          {
            actual: null,
            forecast: 225900,
            label: '+7',
            range: [209900, 241700] as const,
          },
        ].map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td>
              {row.actual == null
                ? '—'
                : formatCurrency(row.actual, locale)}
            </td>
            <td>
              {row.forecast == null
                ? '—'
                : formatCurrency(row.forecast, locale)}
            </td>
            <td>
              {row.range == null
                ? '—'
                : `${formatCurrency(row.range[0], locale)} – ${formatCurrency(row.range[1], locale)}`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CanonicalForecastComposition() {
  const locale = readLocale();

  return (
    <ChartFrame
      className="pd-forecast-story__chart-frame"
      alternativeTable={<RevenueAlternativeTable />}
      alternativeTableLabel="Tabela danych prognozy — alternatywny odczyt danych wykresu"
      businessQuestion={
        'Gdzie może znaleźć się przychód w kolejnych siedmiu dniach?'
      }
      description={
        'ForecastChart jest właścicielem rozdziału danych historycznych, prognozy, zakresu niepewności, pewności zapytania i scenariuszy statycznych.'
      }
      freshnessLabel={formatPapaDataRelativeTime(
        -18,
        'minute',
        locale,
      )}
      rangeLabel={
        '7 dni historii + 7 dni prognozy'
      }
      sourceLabel="Shop + MMM model"
      status="ready"
      statusLabel={
        'Model prognozy zaakceptowany'
      }
      summary={
        'Prognoza bazowa rośnie, ale decyzja ma używać zakresu niepewności i statusu jakości, nie samej linii prognozy.'
      }
      title={
        'Prognoza przychodu z niepewnością widoczną jako sygnał pierwszej klasy'
      }
      visualization={(
        <ForecastChart
          actual={actualRevenue}
          ariaLabel={
            'Prognoza przychodu z danymi historycznymi i zakresem niepewności'
          }
          confidence={0.78}
          forecast={forecastRevenue}
          horizonLabel={
            'Horyzont 7 dni'
          }
          labels={buildLabels()}
          lowerBound={lowerRevenue}
          quality={{
            description:
              'Ostatnie backtesty są stabilne, ale promocje poszerzają zakres prognozy.',
            label: 'Jakość umiarkowana',
            level: 'medium',
          }}
          scenarios={scenariosPl}
          unit="Przychód"
          upperBound={upperRevenue}
          valueFormatter={(value) => formatCurrency(value, locale)}
        />
      )}
      visualizationLabel={
        'Prognoza przychodu'
      }
    />
  );
}

function ForecastUncertaintyCase() {
  const locale = readLocale();
  const labels = buildLabels();

  return (
    <div className="pd-forecast-story__variants">
      <article>
        <header>
          <span>historia / prognoza</span>
          <h3>
            Historia pozostaje linią ciągłą; prognoza jest przerywana
          </h3>
          <p>
            Język wizualny odróżnia odcinek przewidywany zanim użytkownik
            przeczyta opis.
          </p>
        </header>

        <ForecastChart
          actual={actualRevenue}
          ariaLabel={
            'Rozdział przychodu historycznego i prognozowanego'
          }
          confidence={0.78}
          forecast={forecastRevenue}
          horizonLabel={
            'Statyczny horyzont 7 dni'
          }
          labels={labels}
          lowerBound={lowerRevenue}
          quality={{
            description:
              'Błąd backtestu wystarcza do planowania, nie do zamknięcia finansowego.',
            label: 'Sygnał planistyczny',
            level: 'medium',
          }}
          scenarios={scenariosPl}
          unit="Przychód"
          upperBound={upperRevenue}
          valueFormatter={(value) => formatCurrency(value, locale)}
        />
      </article>

      <article>
        <header>
          <span>zakres niepewności</span>
          <h3>
            Pasmo pokazuje rozrzut bez tworzenia drugiej prognozy
          </h3>
          <p>
            Dolna i górna granica są dowodem pomocniczym. Nie zastępują
            linii bazowej.
          </p>
        </header>

        <ForecastChart
          actual={confidenceRangeActual}
          ariaLabel={
            'Wynik jakości prognozy z zakresem niepewności'
          }
          confidence={0.64}
          forecast={confidenceRangeForecast}
          horizonLabel={
            'Horyzont 4 tygodnie'
          }
          labels={labels}
          lowerBound={confidenceRangeLower}
          quality={{
            description:
              'Prognoza rozszerza się po szóstym tygodniu, bo źródła sygnałów się rozchodzą.',
            label: 'Ograniczona po 6 tygodniu',
            level: 'limited',
          }}
          scenarios={[]}
          unit="Wynik jakości"
          upperBound={confidenceRangeUpper}
          valueFormatter={(value) => formatPercent(value, locale)}
        />
      </article>
    </div>
  );
}

function ForecastRules() {
  return (
    <div className="pd-forecast-story__rules">
      {[
        {
          body:
            'ForecastChart pokazuje historię, prognozę, zakres niepewności, pewność zapytania, jakość predykcji i scenariusz decyzyjny. Nie przejmuje interakcji z 15.09.',
          label: '15.07 właściciel',
        },
        {
          body:
            'Ładowanie, brak danych, dane częściowe, nieaktualne, opóźnione, zablokowane, błędne i niedostępne zostają w 15.08 jako wspólny system ChartFrame.',
          label: '15.08 granica',
        },
        {
          body:
            'Podpowiedzi, wskazania po najechaniu, wybór punktu, przejście w szczegół i filtrowanie krzyżowe zostają w 15.09, a finalny pass responsywności i dostępności w 15.10.',
          label: '15.09 / 15.10 granica',
        },
      ].map((item) => (
        <article key={item.label}>
          <span>{item.label}</span>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  );
}

function LongCopyForecast() {
  const locale = readLocale();

  return (
    <div className="pd-forecast-story__long-copy">
      <p>
        Prognoza przychodu po opóźnionej rekoncyliacji atrybucji,
        ograniczeniach dostępności produktów i normalizacji budżetu kampanii.
        Prognoza nie jest faktem i musi pozostać wyraźnie oddzielona od
        danych historycznych.
      </p>

      <ForecastChart
        actual={actualRevenue}
        ariaLabel="Długi opis prognozy przychodu z historią, okresem prognozowanym, zakresem niepewności, pewnością zapytania i scenariuszami statycznymi"
        confidence={0.78}
        forecast={forecastRevenue}
        horizonLabel="Operacyjny horyzont 7 dni po rekoncyliacji atrybucji"
        labels={{
          actual: 'Dane historyczne po rekoncyliacji atrybucji',
          confidence: 'Pewność zapytania',
          forecast: 'Okres prognozowany, nie potwierdzony przychód',
          forecastDisclaimer:
            'Prognoza nie jest faktem. Pokazuje możliwy wynik i zakres niepewności.',
          horizon: 'Horyzont prognozy',
          legend: 'Serie prognozy',
          quality: 'Jakość predykcji',
          scenarios: 'Scenariusze decyzyjne',
          uncertainty: 'Dolna i górna granica niepewności',
        }}
        lowerBound={lowerRevenue}
        quality={{
          description:
            'Backtesty są stabilne dla planowania, ale ograniczenia stanów magazynowych i zmiany kampanii poszerzają zakres.',
          label: 'Jakość umiarkowana z zastrzeżeniami operacyjnymi',
          level: 'medium',
        }}
        scenarios={scenariosPl}
        unit="Przychód po rekoncyliacji atrybucji"
        upperBound={upperRevenue}
        valueFormatter={(value) => formatCurrency(value, locale)}
      />
    </div>
  );
}

const meta = {
  title: '15 Wykresy i dane/Prognoza i AI',
  component: ForecastChart,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'ForecastChart jest runtime ownerem 15.07. Recharts odpowiada za geometrię serii historycznej, prognozy i zakresu niepewności, a PapaData za semantykę prognozy jako nie-faktu, pewność zapytania, jakość predykcji i statyczne scenariusze.',
      },
    },
  },
} satisfies Meta<typeof ForecastChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ForecastChartStory: Story = {
  args: {
    actual: actualRevenue,
    ariaLabel: 'Prognoza przychodu z danymi historycznymi i zakresem niepewności',
    confidence: 0.78,
    forecast: forecastRevenue,
    horizonLabel: 'Horyzont 7 dni',
    lowerBound: lowerRevenue,
    scenarios: scenariosPl,
    upperBound: upperRevenue,
  },
  name: 'Prognoza i AI',
  render: () => (
    <StoryPresentationPage
      className="pd-forecast-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry kontraktu ForecastChart"
          items={[
            {
              label: 'Kontrakt',
              value: '15.07',
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
      storyId="15.07"
      summary="ForecastChart odpowiada za prognozę, zakres niepewności, scenariusze statyczne, pewność zapytania, jakość predykcji i wyraźny rozdział między historią a przewidywaniem."
      title="Prognoza nie jest faktem."
    >
      <StoryPresentationSection
        index="01"
        summary="ChartFrame konsumuje ForecastChart. Kontener utrzymuje pytanie, status, źródła i wniosek, a wizualizacja rozdziela historię, prognozę i zakres niepewności."
        title="Kanoniczna kompozycja"
      >
        <CanonicalForecastComposition />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        summary="Historia, prognoza, dolna granica i górna granica pozostają oddzielnymi seriami. Prognoza ma linię przerywaną i opis pewności zapytania."
        title="Historia, prognoza i zakres niepewności"
      >
        <ForecastUncertaintyCase />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="03"
        summary="Ta sekcja jest granicą zakresu 15.07: scenariusz decyzyjny i jakość predykcji są statyczne, a pełne stany danych i interakcje przejmują kolejne etapy."
        title="Granica zakresu: scenariusze i jakość danych"
      >
        <ForecastRules />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="04"
        summary="Komponent zachowuje czytelność, gdy opis, legenda i scenariusze są dłuższe niż standardowe. To test zawijania, nie nowy wariant funkcjonalny."
        title="Długi tekst i zawijanie"
      >
        <LongCopyForecast />
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
          name: 'Prognoza przychodu z danymi historycznymi i zakresem niepewności',
        },
      ),
    ).toBeInTheDocument();

    const charts = canvasElement.querySelectorAll(
      '[data-component="forecast-chart"]',
    );

    await expect(charts.length).toBeGreaterThan(0);

    for (const series of [
      'actual',
      'forecast',
      'uncertainty',
      'scenario',
    ] as const) {
      const element = canvasElement.querySelector(
        `[data-series="${series}"]`,
      );

      if (!element) {
        throw new Error(`Missing ForecastChart series marker: ${series}`);
      }
    }

    await expect(
      canvasElement.querySelector('.recharts-tooltip-wrapper'),
    ).toBeNull();

    await expect(
      canvas.getByText('Tabela danych prognozy — alternatywny odczyt danych wykresu'),
    ).toBeInTheDocument();

    await expect(
      canvas.getAllByText(/Prognoza nie jest faktem/).length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getAllByText(/Pewność zapytania/).length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getAllByText(/Jakość predykcji/).length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getAllByText(/Scenariusze|Scenariusze decyzyjne/).length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getByText('15.08 granica'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText(/Podpowiedzi, wskazania po najechaniu/),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('15.09 / 15.10 granica'),
    ).toBeInTheDocument();
  },
};
