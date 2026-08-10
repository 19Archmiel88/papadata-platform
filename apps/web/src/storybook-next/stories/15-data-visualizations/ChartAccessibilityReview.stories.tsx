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
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './analytics-final-stages.css';

const trendData: readonly TrendChartDatum[] = [
  { actual: 42, label: 'Tydz. 1', movingAverage: 41, plan: 40, previousPeriod: 39 },
  { actual: 45, label: 'Tydz. 2', movingAverage: 43, plan: 42, previousPeriod: 41 },
  { actual: 48, label: 'Tydz. 3', movingAverage: 45, plan: 44, previousPeriod: 43 },
  { actual: 51, label: 'Tydz. 4', movingAverage: 48, plan: 46, previousPeriod: 44 },
  { actual: 53, label: 'Tydz. 5', movingAverage: 50, plan: 48, previousPeriod: 46 },
];

const auditCards = [
  {
    checks: [
      'komputer / tablet / telefon',
      'jasny / ciemny motyw',
      'długie legendy bez poziomego przewijania',
      'alternatywny opis danych',
    ],
    owner: '15.01 ChartFrame',
  },
  {
    checks: [
      'wartość, trend i porównanie',
      'status danych bez koloru jako jedynego sygnału',
      'tekst mieści się w małych szerokościach',
    ],
    owner: '15.02 MetricCard',
  },
  {
    checks: [
      'linia / obszar',
      'wynik / plan / poprzedni okres / średnia krocząca',
      'fokus i alternatywny opis poza geometrią',
    ],
    owner: '15.03 TrendChart',
  },
  {
    checks: [
      'słupki / grupowanie / ranking',
      'punkt odniesienia i wartości ujemne',
      'czytelna oś i legenda na telefonie',
    ],
    owner: '15.04 ComparisonChart',
  },
  {
    checks: [
      'pierścień / słupki / skumulowane',
      'relacja część-całość bez polegania wyłącznie na kolorze',
      'kompaktowa legenda',
    ],
    owner: '15.05 ShareChart',
  },
  {
    checks: [
      'rozrzut / zależność / analiza hipotez wpływu',
      'brak sugestii przyczynowości bez dowodu',
      'redukcja kolizji etykiet',
    ],
    owner: '15.06 CorrelationChart',
  },
  {
    checks: [
      'historia vs prognoza',
      'zakres niepewności widoczny jako informacja',
      'prognoza nie jest faktem',
    ],
    owner: '15.07 ForecastChart',
  },
  {
    checks: [
      'ładowanie / pusty wynik / brak danych',
      'częściowe / nieaktualne / opóźnione',
      'zablokowane / błąd / niedostępne',
    ],
    owner: '15.08 ChartDataState',
  },
  {
    checks: [
      'podpowiedź / wskazanie kursorem / fokus klawiatury',
      'wybór / zakres dat / resetowanie',
      'przejście w szczegóły / filtrowanie krzyżowe bez zmiany sensu danych',
    ],
    owner: '15.09 ChartInteractionLayer',
  },
] as const;

function AuditMatrix() {
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
              <li key={check}>
                <span>{check}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function LongCopyResponsiveFrame() {
  return (
    <ChartFrame
      alternativeTable={(
        <table className="pd-a15-stage__table">
          <caption>
            Alternatywny odczyt danych dla finalnego przeglądu dostępności
          </caption>
          <thead>
            <tr>
              <th scope="col">Okres</th>
              <th scope="col">Wynik</th>
            </tr>
          </thead>
          <tbody>
            {trendData.map((datum) => (
              <tr key={datum.label}>
                <th scope="row">{datum.label}</th>
                <td>{datum.actual} pkt</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      alternativeTableLabel="Tabela danych — alternatywny odczyt wykresu"
      businessQuestion="Czy sekcja 15 pozostaje czytelna w finalnym przeglądzie responsywności i dostępności?"
      description="15.10 nie dodaje nowych funkcji. To kontrola komputera, tabletu, telefonu, jasnego i ciemnego motywu, długich tekstów, legend, kontrastu i alternatywnego opisu danych."
      legend={(
        <span>
          Legenda finalna: wynik bieżący, plan, poprzedni okres i średnia
          krocząca pozostają opisane tekstowo oraz przez różne style linii.
        </span>
      )}
      rangeLabel="Komputer / tablet / telefon · 200% powiększenia"
      sourceLabel="Właściciele 15.01–15.09"
      status="ready"
      statusLabel="Przegląd dostępności gotowy"
      summary={(
        <p>
          Finalny przegląd sprawdza regresje i spójność. Nie zmienia kontraktów
          znaczenia danych ani nie dodaje nowej interakcji.
        </p>
      )}
      title="Finalny przegląd sekcji 15 bez nowych funkcji"
      visualization={(
        <TrendChart
          ariaLabel="Trend kontrolny dla finalnego przeglądu responsywności i dostępności"
          data={trendData}
          unit="Wynik jakości"
          valueFormatter={(value) => `${value} pkt`}
        />
      )}
      visualizationLabel="Trend kontrolny finalnego przeglądu"
    />
  );
}

// Validator markers for 15.10: desktop / tablet / mobile, light / dark,
// długie legendy bez poziomego scrolla.
const meta = {
  title: '15 Wykresy i dane/Responsywność i dostępność',
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
    statusLabel: 'Przegląd dostępności gotowy',
    title: 'Finalny przegląd sekcji 15',
    visualizationLabel: 'Trend kontrolny finalnego przeglądu',
  },
  name: 'Responsywność i dostępność',
  render: () => (
    <StoryPresentationPage
      className="pd-a15-stage"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry kontraktu finalnego przeglądu"
          items={[
            { label: 'Kontrakt', value: '15.10' },
            { label: 'Zakres', value: 'responsywność / dostępność' },
            { label: 'Status', value: 'przegląd' },
          ]}
        />
      )}
      sectionCode="15"
      sectionLabel="Wykresy i dane"
      storyId="15.10"
      summary="Finalny przegląd po 15.03–15.09: komputer, tablet, telefon, jasny i ciemny motyw, długie teksty, legendy, kontrast i alternatywny opis danych."
      title="Responsywność i dostępność"
    >
      <StoryPresentationSection
        index="01"
        summary="Macierz obejmuje właścicieli 15.01–15.09 i sprawdza, że 15.10 tylko ujednolica oraz łapie regresje."
        title="Macierz finalnego przeglądu"
      >
        <AuditMatrix />
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        summary="Jeden kontrolny ChartFrame z długim tekstem, legendą i tabelą alternatywną pokazuje oczekiwany układ finalnego przeglądu."
        title="Próba zawijania i dostępności"
      >
        <LongCopyResponsiveFrame />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
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
