import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useState,
} from 'react';
import {
  expect,
  fn,
  userEvent,
  within,
} from 'storybook/test';

import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  ChartFrame,
  DataTable,
  SegmentedControl,
  TextAction,
} from '../../../design-system/components';
import type {
  AnalyticsDataState,
} from '../../../design-system/components';
import {
  formatPapaDataCurrency,
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

const papaAction = fn();
const retryAction = fn();
const sourcesAction = fn();

const tableColumns: readonly DataColumn[] = [
  {
    id: 'period',
    label: 'Okres',
  },
  {
    align: 'right',
    id: 'revenue',
    label: 'Przychód',
  },
  {
    align: 'right',
    id: 'cost',
    label: 'Koszt reklamy',
  },
];

function readLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}

function buildTableRows(
  locale: PapaDataRuntimeLocale,
): readonly DataRow[] {
  return [
    {
      id: 'period-01',
      period: '01–10',
      revenue: formatPapaDataCurrency(82400, locale),
      cost: formatPapaDataCurrency(18900, locale),
    },
    {
      id: 'period-02',
      period: '11–20',
      revenue: formatPapaDataCurrency(96200, locale),
      cost: formatPapaDataCurrency(20100, locale),
    },
    {
      id: 'period-03',
      period: '21–30',
      revenue: formatPapaDataCurrency(111600, locale),
      cost: formatPapaDataCurrency(22400, locale),
    },
  ];
}

function CompositionFixtureGraphic() {
  return (
    <svg
      aria-label="Przychód rośnie szybciej niż koszt reklamy, a wynik pozostaje powyżej punktu odniesienia."
      className="pd-viz-story__composition-fixture"
      role="img"
      viewBox="0 0 760 330"
    >
      <g className="grid">
        <line x1="56" y1="56" x2="724" y2="56" />
        <line x1="56" y1="132" x2="724" y2="132" />
        <line x1="56" y1="208" x2="724" y2="208" />
        <line x1="56" y1="284" x2="724" y2="284" />
      </g>
      <path
        className="range"
        d="M68 248 C160 214 218 222 302 170 S470 116 704 66 L704 104 C486 142 424 170 310 202 S166 252 68 272 Z"
      />
      <path
        className="revenue"
        d="M68 258 C160 218 218 226 302 176 S470 120 704 76"
      />
      <path
        className="cost"
        d="M68 274 C178 254 252 252 350 218 S526 188 704 160"
      />
      <path
        className="benchmark"
        d="M68 212 C222 210 376 202 704 182"
      />
      <circle
        className="point"
        cx="470"
        cy="120"
        r="6"
      />
    </svg>
  );
}

function ChartLegend() {
  return (
    <ul className="pd-viz-story__legend">
      <li data-series="revenue">Przychód</li>
      <li data-series="cost">Koszt reklamy</li>
      <li data-series="benchmark">Punkt odniesienia</li>
    </ul>
  );
}

function AlternativeTable() {
  const tableRows = buildTableRows(readLocale());

  return (
    <DataTable
      ariaLabel="Dane przychodu i kosztu reklamy"
      columns={tableColumns}
      emptyMessage="Brak danych dla wybranego zakresu."
      loading={false}
      pagination={null}
      rowCount={tableRows.length}
      rows={tableRows}
      selectedRowIds={[]}
      sort={null}
      summary="Dane źródłowe dla trzech części bieżącego okresu."
    />
  );
}

function ReadyChartFrame({
  longCopy = false,
  status = 'ready',
  statusLabel = 'Dane aktualne',
  withFilters = true,
}: {
  readonly longCopy?: boolean;
  readonly status?: AnalyticsDataState;
  readonly statusLabel?: string;
  readonly withFilters?: boolean;
}) {
  const locale = readLocale();
  const [period, setPeriod] = useState('30');

  return (
    <ChartFrame
      actions={(
        <TextAction
          onClick={sourcesAction}
          size="small"
          tone="muted"
        >
          Pokaż źródła
        </TextAction>
      )}
      alternativeTable={<AlternativeTable />}
      alternativeTableLabel="Tabela danych"
      annotation={(
        <div className="pd-viz-story__annotation">
          <strong>{formatPapaDataPercent(0.186, locale)}</strong>
          <span>po zmianie budżetu</span>
        </div>
      )}
      businessQuestion={longCopy
        ? 'Czy wzrost budżetu akwizycji poprawił rentowność kampanii bez pogorszenia marży kontrybucyjnej w całym oknie porównania?'
        : 'Czy wzrost budżetu poprawił rentowność kampanii?'}
      description={longCopy
        ? 'Przychód, koszt reklamy i operacyjny punkt odniesienia są pokazane razem, aby decyzja nie wymagała przełączania między niepowiązanymi kartami panelu.'
        : 'Przychód, koszt reklamy i punkt odniesienia w jednym zadaniu decyzyjnym.'}
      filters={withFilters ? (
        <SegmentedControl
          ariaLabel="Zakres dat wykresu"
          items={[
            { label: '7 dni', value: '7' },
            { label: '30 dni', value: '30' },
            { label: '90 dni', value: '90' },
          ]}
          size="default"
          value={period}
          onValueChange={setPeriod}
        />
      ) : undefined}
      freshnessLabel={formatPapaDataRelativeTime(-8, 'minute', locale)}
      legend={<ChartLegend />}
      labels={longCopy ? {
        dataStatus: 'Status danych',
        freshness: 'Świeżość',
        insight: 'Wniosek',
        source: 'Źródło',
      } : undefined}
      papaAction={{
        label: 'Wyjaśnij z Papa',
        onAction: papaAction,
      }}
      rangeLabel="Porównanie: poprzedni okres"
      sourceLabel="Shopify + Google Ads + Meta Ads"
      status={status}
      statusLabel={statusLabel}
      summary={(
        <p>
          Przychód rośnie szybciej niż koszt reklamy. Największy efekt pojawia się
          po zmianie budżetu, ale dwa dni mają niższą jakość atrybucji.
        </p>
      )}
      title="Rentowność kampanii"
      visualization={<CompositionFixtureGraphic />}
      visualizationLabel="Trend przychodu, kosztu reklamy i punktu odniesienia"
    />
  );
}

function ProcessingChartFrame() {
  return (
    <ChartFrame
      businessQuestion="Czy wzrost budżetu poprawił rentowność kampanii?"
      description="Powierzchnia zachowuje kontekst i geometrię podczas pobierania danych."
      freshnessLabel="Trwa synchronizacja"
      sourceLabel="Shopify + Ads"
      status="processing"
      statusLabel="Przetwarzanie"
      title="Rentowność kampanii"
      visualizationLabel="Trend rentowności kampanii"
    />
  );
}

function NoDataChartFrame() {
  return (
    <ChartFrame
      businessQuestion="Czy wzrost budżetu poprawił rentowność kampanii?"
      description="Brak danych nie usuwa pytania biznesowego ani informacji o źródle."
      sourceLabel="Shopify + Ads"
      stateAction={{
        label: 'Ponów pobieranie',
        onAction: retryAction,
      }}
      stateMessage="Dla tego zakresu nie ma jeszcze danych spełniających minimalny próg kompletności."
      status="noData"
      statusLabel="Brak danych"
      title="Rentowność kampanii"
      visualizationLabel="Trend rentowności kampanii"
    />
  );
}

const meta = {
  title: '15 Wykresy i dane/ChartFrame',
  component: ChartFrame,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'ChartFrame jest kanonicznym kontenerem wizualizacji analitycznej. Składa status, metadane, filtry, gotową wizualizację, legendę, wniosek i alternatywną tabelę bez przejmowania odpowiedzialności konkretnego typu wykresu.',
      },
    },
  },
} satisfies Meta<typeof ChartFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ChartFrameStory: Story = {
  args: {
    businessQuestion: 'Czy wzrost budżetu poprawił rentowność kampanii?',
    status: 'ready',
    statusLabel: 'Dane aktualne',
    title: 'Rentowność kampanii',
    visualizationLabel: 'Trend rentowności kampanii',
  },
  name: 'Kontener wykresu',
  render: () => (
    <StoryPresentationPage
      className="pd-viz-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry kontraktu ChartFrame"
          items={[
            { label: 'Kontrakt', value: '15.01' },
            { label: 'Przekazanie', value: '05.03 → 15.01' },
            { label: 'Status', value: 'przegląd' },
          ]}
        />
      )}
      sectionCode="15"
      sectionLabel="Wykresy i dane"
      storyId="15.01"
      summary="ChartFrame organizuje jedno pytanie biznesowe i jedną wizualizację. Nie implementuje własnego wykresu, wyboru zakresu, przycisku ani tabeli."
      title="Jedna powierzchnia analityczna, jeden właściciel kompozycji."
    >
      <StoryPresentationSection
        index="01"
        summary="Pełny wariant konsumuje gotową wizualizację, istniejące kontrolki i DataTable. Przykład wykresu pokazuje wyłącznie miejsce kompozycyjne; styl linii, punktu odniesienia i serii nie jest kontraktem 15.01 i należy do 15.03+."
        title="Kanoniczna kompozycja"
      >
        <p className="pd-viz-story__fixture-note">
          Przykład kompozycyjny — nie definiuje języka wizualnego wykresów.
        </p>
        <div className="pd-viz-story__variant-list">
          <div className="pd-viz-story__variant-row">
            <div className="pd-viz-story__row-copy">
              <h3>Z filtrem</h3>
              <p>Zakres czasu jest kontrolką ekranu nadrzędnego i nie tworzy dodatkowej powierzchni ChartFrame.</p>
            </div>
            <ReadyChartFrame />
          </div>
          <div className="pd-viz-story__variant-row">
            <div className="pd-viz-story__row-copy">
              <h3>Bez filtra</h3>
              <p>Ten sam kontrakt działa bez paska filtrów, gdy ekran nie wymaga wyboru zakresu.</p>
            </div>
            <ReadyChartFrame withFilters={false} />
          </div>
        </div>
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        summary="ChartFrame zachowuje nagłówek i kontekst. Stan danych zmienia region danych, nie tworzy innego układu."
        title="Stany reprezentatywne"
      >
        <div className="pd-viz-story__state-list">
          <div className="pd-viz-story__state-row">
            <div className="pd-viz-story__row-copy">
              <h3>Częściowe dane</h3>
              <p>Wizualizacja pozostaje dostępna, a status jawnie informuje o ograniczeniu.</p>
            </div>
            <ReadyChartFrame
              status="partial"
              statusLabel="Dane częściowe"
            />
          </div>
          <div className="pd-viz-story__state-row">
            <div className="pd-viz-story__row-copy">
              <h3>Przetwarzanie</h3>
              <p>Kontekst nie znika podczas synchronizacji.</p>
            </div>
            <ProcessingChartFrame />
          </div>
          <div className="pd-viz-story__state-row">
            <div className="pd-viz-story__row-copy">
              <h3>Brak danych</h3>
              <p>Akcja naprawcza jest częścią stanu, a nie martwą kontrolką.</p>
            </div>
            <NoDataChartFrame />
          </div>
        </div>
      </StoryPresentationSection>

      <StoryPresentationSection
        index="03"
        summary="Długie pytanie i opis nie wymuszają poziomego przewijania ani drugiego wariantu komponentu."
        title="Długi tekst i zawijanie"
      >
        <div className="pd-viz-story__long-copy">
          <ReadyChartFrame longCopy />
        </div>
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const papaButtons = canvas.getAllByRole('button', {
      name: 'Wyjaśnij z Papa',
    });
    await userEvent.click(papaButtons[0]!);
    await expect(papaAction).toHaveBeenCalled();

    const sourceButtons = canvas.getAllByRole('button', {
      name: 'Pokaż źródła',
    });
    await userEvent.click(sourceButtons[0]!);
    await expect(sourcesAction).toHaveBeenCalled();

    const rangeGroups = canvas.getAllByRole('radiogroup', {
      name: 'Zakres dat wykresu',
    });
    const firstRangeGroup = rangeGroups[0];
    if (!firstRangeGroup) {
      throw new Error('Missing date-range segmented control.');
    }
    const rangeControl = within(firstRangeGroup);
    const ninetyDays = rangeControl.getByRole('radio', {
      name: '90 dni',
    });
    await userEvent.click(ninetyDays);
    await expect(ninetyDays).toHaveAttribute('aria-checked', 'true');

    const details = canvas.getAllByText('Tabela danych')[0];
    if (!details) {
      throw new Error('Missing alternative table disclosure.');
    }
    await userEvent.click(details);
    await expect(
      canvas.getAllByRole('table').length,
    ).toBeGreaterThan(0);

    const retryButtons = canvas.getAllByRole('button', {
      name: 'Ponów pobieranie',
    });
    await userEvent.click(retryButtons[0]!);
    await expect(retryAction).toHaveBeenCalled();
  },
};
