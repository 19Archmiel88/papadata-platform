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
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import {
  AnalyticsChartSurface,
  Localized,
  readAnalyticsLocale as readLocale,
  Story15Page,
} from './analytics-story-helpers';
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

function buildScenarios(
  locale: PapaDataRuntimeLocale,
): readonly ForecastChartScenario[] {
  return [
    {
      description: locale === 'en'
        ? 'The model keeps the current trend without an additional marketing impulse.'
        : 'Model utrzymuje bieżący trend bez dodatkowego impulsu marketingowego.',
      id: 'baseline',
      label: locale === 'en' ? 'Baseline' : 'Bazowy',
      tone: 'baseline',
      valueLabel: locale === 'en' ? '+10.3%' : '+10,3%',
    },
    {
      description: locale === 'en'
        ? 'Assumes better availability of top products and stable campaign costs.'
        : 'Zakłada poprawę dostępności top produktów i stabilne koszty kampanii.',
      id: 'optimistic',
      label: locale === 'en' ? 'Optimistic' : 'Optymistyczny',
      tone: 'optimistic',
      valueLabel: locale === 'en' ? '+17.9%' : '+17,9%',
    },
    {
      description: locale === 'en'
        ? 'Assumes delayed deliveries and higher signal dispersion across sources.'
        : 'Zakłada opóźnione dostawy i większy rozrzut sygnałów po źródłach.',
      id: 'conservative',
      label: locale === 'en' ? 'Conservative' : 'Konserwatywny',
      tone: 'conservative',
      valueLabel: locale === 'en' ? '+2.4%' : '+2,4%',
    },
  ];
}

const forecastPointLabelCopy: Record<
  string,
  Record<PapaDataRuntimeLocale, string>
> = {
  'Dziś': {
    en: 'Today',
    pl: 'Dziś',
  },
  'Wk 1': {
    en: 'Wk 1',
    pl: 'Tydz. 1',
  },
  'Wk 2': {
    en: 'Wk 2',
    pl: 'Tydz. 2',
  },
  'Wk 3': {
    en: 'Wk 3',
    pl: 'Tydz. 3',
  },
  'Wk 4': {
    en: 'Wk 4',
    pl: 'Tydz. 4',
  },
  'Wk 5': {
    en: 'Wk 5',
    pl: 'Tydz. 5',
  },
  'Wk 6': {
    en: 'Wk 6',
    pl: 'Tydz. 6',
  },
  'Wk 7': {
    en: 'Wk 7',
    pl: 'Tydz. 7',
  },
  'Wk 8': {
    en: 'Wk 8',
    pl: 'Tydz. 8',
  },
};

function localizeForecastSeries(
  data: readonly ForecastChartSeriesPoint[],
  locale: PapaDataRuntimeLocale,
): readonly ForecastChartSeriesPoint[] {
  return data.map((point) => ({
    ...point,
    label: forecastPointLabelCopy[point.label]?.[locale] ?? point.label,
  }));
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

function buildLabels(
  locale: PapaDataRuntimeLocale,
): Partial<ForecastChartLabels> {
  return {
    confidence: locale === 'en'
      ? 'Query confidence'
      : 'Pewność zapytania',
    forecastDisclaimer: locale === 'en'
      ? 'Forecast is not a fact. The "today" line separates history from forecast, and the band shows uncertainty.'
      : 'Prognoza nie jest faktem. Linia „dziś” oddziela historię od prognozy, a zakres pokazuje niepewność.',
  };
}

function RevenueAlternativeTable() {
  const locale = readLocale();

  return (
    <table className="pd-forecast-story__table">
      <caption>
        {locale === 'en'
          ? 'Forecast data split into historical and predicted periods'
          : 'Dane prognozy rozdzielone na okres historyczny i przewidywany'}
      </caption>
      <thead>
        <tr>
          <th scope="col">{locale === 'en' ? 'Period' : 'Okres'}</th>
          <th scope="col">{locale === 'en' ? 'History' : 'Historia'}</th>
          <th scope="col">{locale === 'en' ? 'Forecast' : 'Prognoza'}</th>
          <th scope="col">{locale === 'en' ? 'Uncertainty range' : 'Zakres niepewności'}</th>
        </tr>
      </thead>
      <tbody>
        {[
          {
            actual: 204800,
            forecast: null,
            label: locale === 'en' ? 'Today' : 'Dziś',
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
      alternativeTableLabel={locale === 'en'
        ? 'Forecast data table - alternative chart reading'
        : 'Tabela danych prognozy — alternatywny odczyt danych wykresu'}
      businessQuestion={
        locale === 'en'
          ? 'Where could revenue land over the next seven days?'
          : 'Gdzie może znaleźć się przychód w kolejnych siedmiu dniach?'
      }
      description={
        locale === 'en'
          ? 'ForecastChart owns the split between historical data, forecast, uncertainty band, query confidence and static scenarios.'
          : 'ForecastChart jest właścicielem rozdziału danych historycznych, prognozy, zakresu niepewności, pewności zapytania i scenariuszy statycznych.'
      }
      freshnessLabel={formatPapaDataRelativeTime(
        -18,
        'minute',
        locale,
      )}
      rangeLabel={
        locale === 'en'
          ? '7 days of history + 7 days of forecast'
          : '7 dni historii + 7 dni prognozy'
      }
      sourceLabel="Shop + MMM model"
      status="ready"
      statusLabel={
        locale === 'en'
          ? 'Current data'
          : 'Dane aktualne'
      }
      summary={
        locale === 'en'
          ? 'The baseline forecast increases, but the decision should use the uncertainty band and quality status, not the forecast line alone.'
          : 'Prognoza bazowa rośnie, ale decyzja ma używać zakresu niepewności i statusu jakości, nie samej linii prognozy.'
      }
      title={
        locale === 'en'
          ? 'Revenue forecast with uncertainty visible as a first-class signal'
          : 'Prognoza przychodu z niepewnością widoczną jako sygnał pierwszej klasy'
      }
      visualization={(
        <ForecastChart
          actual={localizeForecastSeries(actualRevenue, locale)}
          ariaLabel={
            locale === 'en'
              ? 'Revenue forecast with historical data and uncertainty band'
              : 'Prognoza przychodu z danymi historycznymi i zakresem niepewności'
          }
          confidence={0.78}
          forecast={localizeForecastSeries(forecastRevenue, locale)}
          horizonLabel={
            locale === 'en'
              ? '7-day horizon'
              : 'Horyzont 7 dni'
          }
          labels={buildLabels(locale)}
          lowerBound={localizeForecastSeries(lowerRevenue, locale)}
          quality={{
            description: locale === 'en'
              ? 'Recent backtests are stable, but promotions widen the forecast band.'
              : 'Ostatnie backtesty są stabilne, ale promocje poszerzają zakres prognozy.',
            label: locale === 'en'
              ? 'Moderate quality'
              : 'Jakość umiarkowana',
            level: 'medium',
          }}
          scenarios={buildScenarios(locale)}
          unit={locale === 'en' ? 'Revenue' : 'Przychód'}
          upperBound={localizeForecastSeries(upperRevenue, locale)}
          valueFormatter={(value) => formatCurrency(value, locale)}
        />
      )}
      visualizationLabel={
        locale === 'en'
          ? 'Revenue forecast'
          : 'Prognoza przychodu'
      }
    />
  );
}

function ForecastUncertaintyCase() {
  const locale = readLocale();
  const labels = buildLabels(locale);

  return (
    <div className="pd-forecast-story__variants">
      <article>
        <header>
          <span>{locale === 'en' ? 'history / forecast' : 'historia / prognoza'}</span>
          <h3>
            {locale === 'en'
              ? 'History and forecast stay solid, with the forecast using its own semantic data color'
              : 'Historia pozostaje linią ciągłą; prognoza jest przerywana'}
          </h3>
          <p>
            {locale === 'en'
              ? 'The visual language separates the predicted segment before the user reads the description.'
              : 'Język wizualny odróżnia odcinek przewidywany zanim użytkownik przeczyta opis.'}
          </p>
        </header>

        <AnalyticsChartSurface
          businessQuestion={{
            en: 'Where does history end and forecast begin?',
            pl: 'Gdzie kończy się historia i zaczyna prognoza?',
          }}
          description={{
            en: 'History and forecast are rendered in the shared data surface with text status and quality metadata.',
            pl: 'Historia i prognoza renderują się we wspólnej powierzchni danych z tekstowym statusem i metadanymi jakości.',
          }}
          rangeLabel={{
            en: 'Static 7-day horizon',
            pl: 'Statyczny horyzont 7 dni',
          }}
          sourceLabel="ForecastChart / ChartFrame"
          title={{
            en: 'Historical and forecast revenue split',
            pl: 'Rozdział przychodu historycznego i prognozowanego',
          }}
          visualizationLabel={{
            en: 'Historical and forecast revenue split',
            pl: 'Rozdział przychodu historycznego i prognozowanego',
          }}
        >
          <ForecastChart
            actual={localizeForecastSeries(actualRevenue, locale)}
            ariaLabel={
              locale === 'en'
                ? 'Historical and forecast revenue split'
                : 'Rozdział przychodu historycznego i prognozowanego'
            }
            confidence={0.78}
            forecast={localizeForecastSeries(forecastRevenue, locale)}
            horizonLabel={
              locale === 'en'
                ? 'Static 7-day horizon'
                : 'Statyczny horyzont 7 dni'
            }
            labels={labels}
            lowerBound={localizeForecastSeries(lowerRevenue, locale)}
            quality={{
              description: locale === 'en'
                ? 'Backtest error is sufficient for planning, not for financial close.'
                : 'Błąd backtestu wystarcza do planowania, nie do zamknięcia finansowego.',
              label: locale === 'en' ? 'Planning signal' : 'Sygnał planistyczny',
              level: 'medium',
            }}
            scenarios={buildScenarios(locale)}
            unit={locale === 'en' ? 'Revenue' : 'Przychód'}
            upperBound={localizeForecastSeries(upperRevenue, locale)}
            valueFormatter={(value) => formatCurrency(value, locale)}
          />
        </AnalyticsChartSurface>
      </article>

      <article>
        <header>
          <span>{locale === 'en' ? 'uncertainty range' : 'zakres niepewności'}</span>
          <h3>
            {locale === 'en'
              ? 'The band shows dispersion without creating a second forecast'
              : 'Pasmo pokazuje rozrzut bez tworzenia drugiej prognozy'}
          </h3>
          <p>
            {locale === 'en'
              ? 'Lower and upper bounds are supporting evidence. They do not replace the baseline line.'
              : 'Dolna i górna granica są dowodem pomocniczym. Nie zastępują linii bazowej.'}
          </p>
        </header>

        <AnalyticsChartSurface
          businessQuestion={{
            en: 'How wide is the forecast uncertainty?',
            pl: 'Jak szeroka jest niepewność prognozy?',
          }}
          description={{
            en: 'The uncertainty band is visible as information, not as a decorative fill.',
            pl: 'Pasmo niepewności jest widoczne jako informacja, nie dekoracyjne wypełnienie.',
          }}
          rangeLabel={{
            en: '4-week horizon',
            pl: 'Horyzont 4 tygodnie',
          }}
          sourceLabel="ForecastChart / ChartFrame"
          title={{
            en: 'Forecast quality score with uncertainty range',
            pl: 'Wynik jakości prognozy z zakresem niepewności',
          }}
          visualizationLabel={{
            en: 'Forecast quality score with uncertainty range',
            pl: 'Wynik jakości prognozy z zakresem niepewności',
          }}
        >
          <ForecastChart
            actual={localizeForecastSeries(confidenceRangeActual, locale)}
            ariaLabel={
              locale === 'en'
                ? 'Forecast quality score with uncertainty range'
                : 'Wynik jakości prognozy z zakresem niepewności'
            }
            confidence={0.64}
            forecast={localizeForecastSeries(confidenceRangeForecast, locale)}
            horizonLabel={
              locale === 'en'
                ? '4-week horizon'
                : 'Horyzont 4 tygodnie'
            }
            labels={labels}
            lowerBound={localizeForecastSeries(confidenceRangeLower, locale)}
            quality={{
              description: locale === 'en'
                ? 'The forecast widens after week six because signal sources diverge.'
                : 'Prognoza rozszerza się po szóstym tygodniu, bo źródła sygnałów się rozchodzą.',
              label: locale === 'en'
                ? 'Limited after week 6'
                : 'Ograniczona po 6 tygodniu',
              level: 'limited',
            }}
            scenarios={[]}
            unit={locale === 'en' ? 'Quality score' : 'Wynik jakości'}
            upperBound={localizeForecastSeries(confidenceRangeUpper, locale)}
            valueFormatter={(value) => formatPercent(value, locale)}
          />
        </AnalyticsChartSurface>
      </article>
    </div>
  );
}

function ForecastRules() {
  const locale = readLocale();

  return (
    <div className="pd-forecast-story__rules">
      {[
        {
          body: locale === 'en'
            ? 'ForecastChart shows history, forecast, uncertainty band, query confidence, prediction quality and a decision scenario. It does not take over 15.09 interactions.'
            : 'ForecastChart pokazuje historię, prognozę, zakres niepewności, pewność zapytania, jakość predykcji i scenariusz decyzyjny. Nie przejmuje interakcji z 15.09.',
          label: locale === 'en' ? '15.07 owner' : '15.07 właściciel',
        },
        {
          body: locale === 'en'
            ? 'Loading, no data, partial, stale, delayed, blocked, error and unavailable states stay in 15.08 as the shared ChartFrame system.'
            : 'Ładowanie, brak danych, dane częściowe, nieaktualne, opóźnione, zablokowane, błędne i niedostępne zostają w 15.08 jako wspólny system ChartFrame.',
          label: locale === 'en' ? '15.08 boundary' : '15.08 granica',
        },
        {
          body: locale === 'en'
            ? 'Tooltips, hover indication, point selection, drill-down and cross-filtering stay in 15.09, and the final responsive/accessibility pass stays in 15.10.'
            : 'Podpowiedzi, wskazania po najechaniu, wybór punktu, przejście w szczegół i filtrowanie krzyżowe zostają w 15.09, a finalny pass responsywności i dostępności w 15.10.',
          label: locale === 'en'
            ? '15.09 / 15.10 boundary'
            : '15.09 / 15.10 granica',
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
        {locale === 'en'
          ? 'Revenue forecast after delayed attribution reconciliation, product availability constraints and campaign budget normalization. Forecast is not a fact and must remain clearly separated from historical data.'
          : 'Prognoza przychodu po opóźnionej rekoncyliacji atrybucji, ograniczeniach dostępności produktów i normalizacji budżetu kampanii. Prognoza nie jest faktem i musi pozostać wyraźnie oddzielona od danych historycznych.'}
      </p>

      <AnalyticsChartSurface
        businessQuestion={{
          en: 'Can a long forecast explanation reflow inside the data surface?',
          pl: 'Czy długi opis prognozy zawija się w powierzchni danych?',
        }}
        description={{
          en: 'Long copy remains in ChartFrame and ForecastChart labels without a separate forecast surface.',
          pl: 'Długi tekst pozostaje w ChartFrame i etykietach ForecastChart bez osobnej powierzchni prognozy.',
        }}
        rangeLabel={{
          en: 'Long-copy regression',
          pl: 'Regresja długiego tekstu',
        }}
        sourceLabel="ForecastChart / ChartFrame"
        title={{
          en: 'Long forecast copy inside ChartFrame',
          pl: 'Długi tekst prognozy w ChartFrame',
        }}
        visualizationLabel={{
          en: 'Long revenue forecast with history, forecast period, uncertainty band, query confidence and static scenarios',
          pl: 'Długi opis prognozy przychodu z historią, okresem prognozowanym, zakresem niepewności, pewnością zapytania i scenariuszami statycznymi',
        }}
      >
        <ForecastChart
          actual={localizeForecastSeries(actualRevenue, locale)}
          ariaLabel={
            locale === 'en'
              ? 'Long revenue forecast with history, forecast period, uncertainty band, query confidence and static scenarios'
              : 'Długi opis prognozy przychodu z historią, okresem prognozowanym, zakresem niepewności, pewnością zapytania i scenariuszami statycznymi'
          }
          confidence={0.78}
          forecast={localizeForecastSeries(forecastRevenue, locale)}
          horizonLabel={locale === 'en'
            ? 'Operational 7-day horizon after attribution reconciliation'
            : 'Operacyjny horyzont 7 dni po rekoncyliacji atrybucji'}
          labels={{
            actual: locale === 'en'
              ? 'Historical data after attribution reconciliation'
              : 'Dane historyczne po rekoncyliacji atrybucji',
            confidence: locale === 'en' ? 'Query confidence' : 'Pewność zapytania',
            forecast: locale === 'en'
              ? 'Forecast period, not confirmed revenue'
              : 'Okres prognozowany, nie potwierdzony przychód',
            forecastDisclaimer: locale === 'en'
              ? 'Forecast is not a fact. It shows a possible result and uncertainty range.'
              : 'Prognoza nie jest faktem. Pokazuje możliwy wynik i zakres niepewności.',
            horizon: locale === 'en' ? 'Forecast horizon' : 'Horyzont prognozy',
            legend: locale === 'en' ? 'Forecast series' : 'Serie prognozy',
            quality: locale === 'en' ? 'Prediction quality' : 'Jakość predykcji',
            scenarios: locale === 'en' ? 'Decision scenarios' : 'Scenariusze decyzyjne',
            uncertainty: locale === 'en'
              ? 'Lower and upper uncertainty bounds'
              : 'Dolna i górna granica niepewności',
          }}
          lowerBound={localizeForecastSeries(lowerRevenue, locale)}
          quality={{
            description: locale === 'en'
              ? 'Backtests are stable for planning, but inventory constraints and campaign changes widen the band.'
              : 'Backtesty są stabilne dla planowania, ale ograniczenia stanów magazynowych i zmiany kampanii poszerzają zakres.',
            label: locale === 'en'
              ? 'Moderate quality with operational caveats'
              : 'Jakość umiarkowana z zastrzeżeniami operacyjnymi',
            level: 'medium',
          }}
          scenarios={buildScenarios(locale)}
          unit={locale === 'en'
            ? 'Revenue after attribution reconciliation'
            : 'Przychód po rekoncyliacji atrybucji'}
          upperBound={localizeForecastSeries(upperRevenue, locale)}
          valueFormatter={(value) => formatCurrency(value, locale)}
        />
      </AnalyticsChartSurface>
    </div>
  );
}

const meta = {
  title: '15 Wykresy i dane/02 Rodziny wykresów/Prognoza i AI',
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
    scenarios: buildScenarios('pl'),
    upperBound: upperRevenue,
  },
  name: 'Prognoza i AI',
  render: () => (
    <Story15Page
      className="pd-forecast-story"
      metaAriaLabel={{
        en: 'ForecastChart contract parameters',
        pl: 'Parametry kontraktu ForecastChart',
      }}
      metaItems={[
        {
          label: <Localized pl="Kontrakt" en="Contract" />,
          value: '15.07',
        },
        {
          label: <Localized pl="Silnik" en="Engine" />,
          value: 'Recharts',
        },
        {
          label: <Localized pl="Status" en="Status" />,
          value: <Localized pl="przegląd" en="review" />,
        },
      ]}
      storyId="15.07"
      summary={(
        <Localized
          en="ForecastChart owns forecast, uncertainty band, static scenarios, query confidence, prediction quality and a clear split between history and prediction."
          pl="ForecastChart odpowiada za prognozę, zakres niepewności, scenariusze statyczne, pewność zapytania, jakość predykcji i wyraźny rozdział między historią a przewidywaniem."
        />
      )}
      title={(
        <Localized
          en="Forecast is not a fact."
          pl="Prognoza nie jest faktem."
        />
      )}
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
    </Story15Page>
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
