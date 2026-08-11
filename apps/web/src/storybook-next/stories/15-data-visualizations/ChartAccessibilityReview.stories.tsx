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
  TrendChart,
} from '../../../design-system/components';
import type {
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

const trendDataByLocale: Record<PapaDataRuntimeLocale, readonly TrendChartDatum[]> = {
  en: [
    { actual: 42, label: 'Week 1', movingAverage: 41, plan: 40, previousPeriod: 39 },
    { actual: 45, label: 'Week 2', movingAverage: 43, plan: 42, previousPeriod: 41 },
    { actual: 48, label: 'Week 3', movingAverage: 45, plan: 44, previousPeriod: 43 },
    { actual: 51, label: 'Week 4', movingAverage: 48, plan: 46, previousPeriod: 44 },
    { actual: 53, label: 'Week 5', movingAverage: 50, plan: 48, previousPeriod: 46 },
  ],
  pl: [
    { actual: 42, label: 'Tydz. 1', movingAverage: 41, plan: 40, previousPeriod: 39 },
    { actual: 45, label: 'Tydz. 2', movingAverage: 43, plan: 42, previousPeriod: 41 },
    { actual: 48, label: 'Tydz. 3', movingAverage: 45, plan: 44, previousPeriod: 43 },
    { actual: 51, label: 'Tydz. 4', movingAverage: 48, plan: 46, previousPeriod: 44 },
    { actual: 53, label: 'Tydz. 5', movingAverage: 50, plan: 48, previousPeriod: 46 },
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

type AuditCard = {
  readonly checks: readonly AnalyticsLocalizedCopy[];
  readonly owner: string;
};

const auditCards: readonly AuditCard[] = [
  {
    checks: [
      {
        en: 'desktop / tablet / phone',
        pl: 'komputer / tablet / telefon',
      },
      {
        en: 'light / dark theme',
        pl: 'jasny / ciemny motyw',
      },
      {
        en: 'long legends without horizontal scrolling',
        pl: 'długie legendy bez poziomego przewijania',
      },
      {
        en: 'alternative data description',
        pl: 'alternatywny opis danych',
      },
    ],
    owner: '15.01 ChartFrame',
  },
  {
    checks: [
      {
        en: 'value, trend and comparison',
        pl: 'wartość, trend i porównanie',
      },
      {
        en: 'data status without color as the only signal',
        pl: 'status danych bez koloru jako jedynego sygnału',
      },
      {
        en: 'text fits small widths',
        pl: 'tekst mieści się w małych szerokościach',
      },
    ],
    owner: '15.02 MetricCard',
  },
  {
    checks: [
      {
        en: 'line / area',
        pl: 'linia / obszar',
      },
      {
        en: 'result / plan / previous period / moving average',
        pl: 'wynik / plan / poprzedni okres / średnia krocząca',
      },
      {
        en: 'focus and alternative description outside geometry',
        pl: 'fokus i alternatywny opis poza geometrią',
      },
    ],
    owner: '15.03 TrendChart',
  },
  {
    checks: [
      {
        en: 'bars / grouping / ranking',
        pl: 'słupki / grupowanie / ranking',
      },
      {
        en: 'benchmark and negative values',
        pl: 'punkt odniesienia i wartości ujemne',
      },
      {
        en: 'readable axis and legend on phone',
        pl: 'czytelna oś i legenda na telefonie',
      },
    ],
    owner: '15.04 ComparisonChart',
  },
  {
    checks: [
      {
        en: 'donut / bars / stacked',
        pl: 'pierścień / słupki / skumulowane',
      },
      {
        en: 'part-to-whole relation without relying only on color',
        pl: 'relacja część-całość bez polegania wyłącznie na kolorze',
      },
      {
        en: 'compact legend',
        pl: 'kompaktowa legenda',
      },
    ],
    owner: '15.05 ShareChart',
  },
  {
    checks: [
      {
        en: 'scatter / dependency / impact hypothesis analysis',
        pl: 'rozrzut / zależność / analiza hipotez wpływu',
      },
      {
        en: 'no causality suggestion without evidence',
        pl: 'brak sugestii przyczynowości bez dowodu',
      },
      {
        en: 'reduced label collisions',
        pl: 'redukcja kolizji etykiet',
      },
    ],
    owner: '15.06 CorrelationChart',
  },
  {
    checks: [
      {
        en: 'history vs forecast',
        pl: 'historia vs prognoza',
      },
      {
        en: 'uncertainty range visible as information',
        pl: 'zakres niepewności widoczny jako informacja',
      },
      {
        en: 'forecast is not a fact',
        pl: 'prognoza nie jest faktem',
      },
    ],
    owner: '15.07 ForecastChart',
  },
  {
    checks: [
      {
        en: 'loading / empty result / no data',
        pl: 'ładowanie / pusty wynik / brak danych',
      },
      {
        en: 'partial / stale / delayed',
        pl: 'częściowe / nieaktualne / opóźnione',
      },
      {
        en: 'blocked / error / unavailable',
        pl: 'zablokowane / błąd / niedostępne',
      },
    ],
    owner: '15.08 ChartDataState',
  },
  {
    checks: [
      {
        en: 'tooltip / hover / keyboard focus',
        pl: 'podpowiedź / wskazanie kursorem / fokus klawiatury',
      },
      {
        en: 'selection / date range / reset',
        pl: 'wybór / zakres dat / resetowanie',
      },
      {
        en: 'drill-down / cross-filtering without changing data meaning',
        pl: 'przejście w szczegóły / filtrowanie krzyżowe bez zmiany sensu danych',
      },
    ],
    owner: '15.09 ChartInteractionLayer',
  },
];

function pick(
  copy: AnalyticsLocalizedCopy,
  locale: PapaDataRuntimeLocale,
): string {
  return copy[locale];
}

function AuditMatrix({
  locale,
}: {
  readonly locale: PapaDataRuntimeLocale;
}) {
  return (
    <div className="pd-a15-stage__grid">
      {auditCards.map((card) => (
        <article
          className="pd-a15-stage__audit-card"
          key={card.owner}
        >
          <h3>{card.owner}</h3>
          <ul className="pd-a15-stage__audit-list">
            {card.checks.map((check) => (
              <li key={pick(check, locale)}>
                <span>{pick(check, locale)}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function LongCopyResponsiveFrame({
  locale,
}: {
  readonly locale: PapaDataRuntimeLocale;
}) {
  const trendData = trendDataByLocale[locale];

  return (
    <ChartFrame
      alternativeTable={(
        <table className="pd-a15-stage__table">
          <caption>
            {locale === 'en'
              ? 'Alternative data reading for the final accessibility review'
              : 'Alternatywny odczyt danych dla finalnego przeglądu dostępności'}
          </caption>
          <thead>
            <tr>
              <th scope="col">
                {locale === 'en' ? 'Period' : 'Okres'}
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
                <td>
                  {locale === 'en'
                    ? `${datum.actual} pts`
                    : `${datum.actual} pkt`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      alternativeTableLabel={locale === 'en'
        ? 'Data table - alternative chart reading'
        : 'Tabela danych — alternatywny odczyt wykresu'}
      businessQuestion={locale === 'en'
        ? 'Does section 15 remain readable in the final responsive and accessibility review?'
        : 'Czy sekcja 15 pozostaje czytelna w finalnym przeglądzie responsywności i dostępności?'}
      description={locale === 'en'
        ? '15.10 does not add new features. It checks desktop, tablet, phone, light and dark theme, long text, legends, contrast and alternative data description.'
        : '15.10 nie dodaje nowych funkcji. To kontrola komputera, tabletu, telefonu, jasnego i ciemnego motywu, długich tekstów, legend, kontrastu i alternatywnego opisu danych.'}
      labels={chartFrameLabels[locale]}
      legend={(
        <span>
          {locale === 'en'
            ? 'Final legend: current result, plan, previous period and moving average remain described in text and by distinct data colors; dash is reserved for uncertainty or forecast boundary semantics.'
            : 'Legenda finalna: wynik bieżący, plan, poprzedni okres i średnia krocząca pozostają opisane tekstowo oraz przez różne style linii.'}
        </span>
      )}
      rangeLabel={locale === 'en'
        ? 'Desktop / tablet / phone - 200% zoom'
        : 'Komputer / tablet / telefon · 200% powiększenia'}
      sourceLabel={locale === 'en'
        ? 'Owners 15.01-15.09'
        : 'Właściciele 15.01–15.09'}
      status="ready"
      statusLabel={locale === 'en'
        ? 'Current data'
        : 'Dane aktualne'}
      summary={(
        <p>
          {locale === 'en'
            ? 'The final review checks regressions and consistency. It does not change data-meaning contracts or add a new interaction.'
            : 'Finalny przegląd sprawdza regresje i spójność. Nie zmienia kontraktów znaczenia danych ani nie dodaje nowej interakcji.'}
        </p>
      )}
      title={locale === 'en'
        ? 'Final section 15 review without new features'
        : 'Finalny przegląd sekcji 15 bez nowych funkcji'}
      visualization={(
        <TrendChart
          ariaLabel={locale === 'en'
            ? 'Control trend for the final responsive and accessibility review'
            : 'Trend kontrolny dla finalnego przeglądu responsywności i dostępności'}
          data={trendData}
          unit={locale === 'en' ? 'Quality score' : 'Wynik jakości'}
          valueFormatter={(value) => (locale === 'en'
            ? `${value} pts`
            : `${value} pkt`)}
        />
      )}
      visualizationLabel={locale === 'en'
        ? 'Final review control trend'
        : 'Trend kontrolny finalnego przeglądu'}
    />
  );
}

// Validator markers for 15.10: desktop / tablet / mobile, light / dark,
// długie legendy bez poziomego scrolla.
const meta = {
  title: '15 Wykresy i dane/04 Jakość prezentacji/Responsywność i dostępność',
  component: ChartFrame,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          '15.10 jest finalnym przeglądem responsywności i dostępności dla sekcji 15. Nie dodaje nowych funkcji ani nowych właścicieli geometrii wykresów.',
      },
    },
  },
} satisfies Meta<typeof ChartFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ChartAccessibilityReviewStory: Story = {
  args: {
    businessQuestion: 'Czy sekcja 15 pozostaje czytelna?',
    status: 'ready',
    statusLabel: 'Dane aktualne',
    title: 'Finalny przegląd sekcji 15',
    visualizationLabel: 'Trend kontrolny finalnego przeglądu',
  },
  name: 'Responsywność i dostępność',
  render: () => {
    const locale = readLocale();

    return (
      <Story15Page
        className="pd-a15-stage"
        metaAriaLabel={{
          en: 'Final review contract parameters',
          pl: 'Parametry kontraktu finalnego przeglądu',
        }}
        metaItems={[
          { label: <Localized en="Contract" pl="Kontrakt" />, value: '15.10' },
          { label: <Localized en="Scope" pl="Zakres" />, value: <Localized en="responsive / accessibility" pl="responsywność / dostępność" /> },
          { label: <Localized en="Status" pl="Status" />, value: <Localized en="review" pl="przegląd" /> },
        ]}
        storyId="15.10"
        summary={(
          <Localized
            en="Final review after 15.03-15.09: desktop, tablet, phone, light and dark theme, long text, legends, contrast and alternative data description."
            pl="Finalny przegląd po 15.03–15.09: komputer, tablet, telefon, jasny i ciemny motyw, długie teksty, legendy, kontrast i alternatywny opis danych."
          />
        )}
        title={<Localized en="Responsiveness and accessibility" pl="Responsywność i dostępność" />}
      >
        <StoryPresentationSection
          index="01"
          summary={(
            <Localized
              en="The matrix covers owners 15.01-15.09 and verifies that 15.10 only unifies and catches regressions."
              pl="Macierz obejmuje właścicieli 15.01–15.09 i sprawdza, że 15.10 tylko ujednolica oraz łapie regresje."
            />
          )}
          title={<Localized en="Final review matrix" pl="Macierz finalnego przeglądu" />}
        >
          <AuditMatrix locale={locale} />
        </StoryPresentationSection>

        <StoryPresentationSection
          index="02"
          summary={(
            <Localized
              en="One control ChartFrame with long text, legend and alternative table shows the expected final review layout."
              pl="Jeden kontrolny ChartFrame z długim tekstem, legendą i tabelą alternatywną pokazuje oczekiwany układ finalnego przeglądu."
            />
          )}
          title={<Localized en="Wrapping and accessibility probe" pl="Próba zawijania i dostępności" />}
        >
          <LongCopyResponsiveFrame locale={locale} />
        </StoryPresentationSection>
      </Story15Page>
    );
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'Responsywność i dostępność' }),
    ).toBeInTheDocument();

    for (const marker of [
      'komputer / tablet / telefon',
      'jasny / ciemny motyw',
      'długie legendy bez poziomego przewijania',
      'alternatywny opis danych',
      '15.08 ChartDataState',
      '15.09 ChartInteractionLayer',
      'nie dodaje nowych funkcji',
    ]) {
      await expect(
        canvas.getAllByText(new RegExp(marker)).length,
      ).toBeGreaterThan(0);
    }
  },
};
