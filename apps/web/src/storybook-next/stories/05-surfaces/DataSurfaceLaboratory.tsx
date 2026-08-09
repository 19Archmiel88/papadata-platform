import { useState } from 'react';

import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  Button,
  DataTable,
  Drawer,
  InlineNotice,
  StatusBadge,
} from '../../../design-system/components';
import type {
  AnalyticsDataState,
} from '../../../design-system/components';
import {
  resolveAnalyticsDataStateTone,
} from '../../../design-system/components/Analytics';
import {
  formatPapaDataCurrency,
  formatPapaDataNumber,
  formatPapaDataPercent,
} from '../../../design-system/foundations';
import {
  DecisionRows,
  Localized,
  ReviewBadge,
  StoryPage,
  StorySection,
  copy,
  readLocale,
} from './remaining-story-shared';
import './remaining-story-shared.css';
import './data-surface-laboratory.css';

type LocalizedCopy = {
  readonly pl: string;
  readonly en: string;
};

function PromotedOwnerNotice({
  owner,
  title,
  description,
}: {
  readonly owner: string;
  readonly title: LocalizedCopy;
  readonly description: LocalizedCopy;
}) {
  return (
    <div className="pd-s53-promoted-owner">
      <div>
        <ReviewBadge tone="success">{owner}</ReviewBadge>
        <strong>{copy(title)}</strong>
      </div>
      <p>{copy(description)}</p>
    </div>
  );
}

type ChartKind = 'waterfall' | 'funnel';

type ChartDescriptor = {
  readonly name: string;
  readonly purpose: LocalizedCopy;
  readonly layers: LocalizedCopy;
  readonly question: LocalizedCopy;
  readonly metric: LocalizedCopy;
  readonly source: string;
  readonly range: LocalizedCopy;
  readonly reference: LocalizedCopy;
};

const chartCopy: Record<ChartKind, ChartDescriptor> = {
  waterfall: {
    name: 'WaterfallChart',
    purpose: {
      pl: 'Składowe zmiany wyniku od wartości początkowej do końcowej.',
      en: 'Components of change from starting value to final result.',
    },
    layers: {
      pl: 'start · wzrost · spadek · total',
      en: 'start · increase · decrease · total',
    },
    question: {
      pl: 'Co zbudowało zmianę marży?',
      en: 'What drove the margin change?',
    },
    metric: {
      pl: 'Marża brutto',
      en: 'Gross margin',
    },
    source: 'ERP + Ads',
    range: {
      pl: 'Miesiąc do miesiąca',
      en: 'Month over month',
    },
    reference: {
      pl: '31,4% → 34,1%',
      en: '31.4% → 34.1%',
    },
  },
  funnel: {
    name: 'FunnelChart',
    purpose: {
      pl: 'Konwersja etapów z czytelnym miejscem największego odpływu.',
      en: 'Stage conversion with a clear largest drop-off point.',
    },
    layers: {
      pl: 'etapy · konwersja · drop-off',
      en: 'stages · conversion · drop-off',
    },
    question: {
      pl: 'Na którym etapie tracimy użytkowników?',
      en: 'At which stage do we lose users?',
    },
    metric: {
      pl: 'Konwersja lejka',
      en: 'Funnel conversion',
    },
    source: 'GA4 + Shop',
    range: {
      pl: '7 dni',
      en: '7 days',
    },
    reference: {
      pl: 'Sesja → zakup · 3,8%',
      en: 'Session → purchase · 3.8%',
    },
  },
};

function ChartGraphic({ kind }: { readonly kind: ChartKind }) {
  return (
    <svg
      aria-hidden="true"
      className="pd-s53-chart-svg"
      viewBox="0 0 420 210"
    >
      <g className="pd-s53-chart-grid-lines">
        <line x1="48" y1="34" x2="392" y2="34" />
        <line x1="48" y1="82" x2="392" y2="82" />
        <line x1="48" y1="130" x2="392" y2="130" />
        <line x1="48" y1="178" x2="392" y2="178" />
        <line x1="48" y1="24" x2="48" y2="178" />
      </g>

      {kind === 'waterfall' ? (
        <>
          <rect className="pd-s53-chart-bar pd-s53-chart-bar--series-1" x="60" y="112" width="42" height="66" />
          <rect className="pd-s53-chart-bar pd-s53-chart-bar--positive" x="128" y="72" width="42" height="40" />
          <rect className="pd-s53-chart-bar pd-s53-chart-bar--negative" x="196" y="98" width="42" height="26" />
          <rect className="pd-s53-chart-bar pd-s53-chart-bar--positive" x="264" y="54" width="42" height="44" />
          <rect className="pd-s53-chart-bar pd-s53-chart-bar--series-2" x="332" y="54" width="42" height="124" />
          <path className="pd-s53-chart-connector" d="M102 112 H128 M170 72 H196 M238 98 H264 M306 54 H332" />
          <g className="pd-s53-chart-labels">
            <text textAnchor="middle" x="81" y="198">
              {copy({ pl: 'start', en: 'start' })}
            </text>
            <text textAnchor="middle" x="149" y="198">
              {copy({ pl: 'cena', en: 'price' })}
            </text>
            <text textAnchor="middle" x="217" y="198">Ads</text>
            <text textAnchor="middle" x="285" y="198">Mix</text>
            <text textAnchor="middle" x="353" y="198">
              {copy({ pl: 'wynik', en: 'result' })}
            </text>
          </g>
        </>
      ) : null}

      {kind === 'funnel' ? (
        <>
          <path className="pd-s53-chart-funnel pd-s53-chart-funnel--a" d="M78 38 H350 L320 72 H108 Z" />
          <path className="pd-s53-chart-funnel pd-s53-chart-funnel--b" d="M116 86 H312 L284 120 H144 Z" />
          <path className="pd-s53-chart-funnel pd-s53-chart-funnel--c" d="M154 134 H274 L252 168 H176 Z" />
          <g className="pd-s53-chart-labels">
            <text textAnchor="middle" x="214" y="59">
              {copy({ pl: 'Sesje · 100%', en: 'Sessions · 100%' })}
            </text>
            <text textAnchor="middle" x="214" y="107">
              {copy({ pl: 'Produkt · 31%', en: 'Product · 31%' })}
            </text>
            <text textAnchor="middle" x="214" y="155">
              {copy({ pl: 'Zakup · 3,8%', en: 'Purchase · 3.8%' })}
            </text>
          </g>
        </>
      ) : null}
    </svg>
  );
}

function ChartFamilies() {
  return (
    <div className="pd-s53-chart-family-list">
      {(Object.keys(chartCopy) as ChartKind[]).map((kind) => {
        const descriptor = chartCopy[kind];

        return (
          <article className="pd-s53-chart-family" key={kind}>
            <header>
              <div>
                <span>{descriptor.name}</span>
                <h3>{copy(descriptor.purpose)}</h3>
              </div>
              <ReviewBadge tone="info">{copy(descriptor.layers)}</ReviewBadge>
            </header>

            <div className="pd-s53-chart-family__body">
              <div className="pd-s53-chart-family__visual">
                <ChartGraphic kind={kind} />
              </div>

              <dl>
                <div>
                  <dt><Localized pl="Pytanie" en="Question" /></dt>
                  <dd>{copy(descriptor.question)}</dd>
                </div>
                <div>
                  <dt><Localized pl="Metryka" en="Metric" /></dt>
                  <dd>{copy(descriptor.metric)}</dd>
                </div>
                <div>
                  <dt><Localized pl="Źródło" en="Source" /></dt>
                  <dd>{descriptor.source}</dd>
                </div>
                <div>
                  <dt><Localized pl="Zakres" en="Range" /></dt>
                  <dd>{copy(descriptor.range)}</dd>
                </div>
                <div>
                  <dt><Localized pl="Odniesienie" en="Reference" /></dt>
                  <dd>{copy(descriptor.reference)}</dd>
                </div>
              </dl>
            </div>
          </article>
        );
      })}
    </div>
  );
}

type ProductRow = {
  readonly id: string;
  readonly product: string;
  readonly orders: number;
  readonly revenue: number;
  readonly margin: number;
  readonly status: Extract<
    AnalyticsDataState,
    'ready' | 'partial' | 'stale'
  >;
};

const tableRows: readonly ProductRow[] = [
  { id: 'p-101', product: 'Młynek Pro', orders: 184, revenue: 48200, margin: 0.312, status: 'ready' },
  { id: 'p-102', product: 'Kawa Classic', orders: 162, revenue: 37840, margin: 0.286, status: 'partial' },
  { id: 'p-103', product: 'Filtry 100', orders: 128, revenue: 18420, margin: 0.341, status: 'stale' },
  { id: 'p-104', product: 'Zestaw Barista', orders: 96, revenue: 29500, margin: 0.304, status: 'ready' },
];

function buildTableColumns(): readonly DataColumn[] {
  return [
    { id: 'product', label: copy({ pl: 'Produkt', en: 'Product' }), sortable: true },
    { align: 'right', id: 'orders', label: copy({ pl: 'Zamówienia', en: 'Orders' }), sortable: true },
    { align: 'right', id: 'revenue', label: copy({ pl: 'Przychód', en: 'Revenue' }), sortable: true },
    { align: 'right', id: 'margin', label: copy({ pl: 'Marża', en: 'Margin' }), sortable: true },
    { id: 'status', label: copy({ pl: 'Status danych', en: 'Data status' }) },
  ];
}

const tableStatusCopy: Record<
  ProductRow['status'],
  LocalizedCopy
> = {
  ready: { pl: 'Gotowe', en: 'Ready' },
  partial: { pl: 'Częściowe', en: 'Partial' },
  stale: { pl: 'Nieaktualne', en: 'Stale' },
};

type ProductSortState = {
  readonly columnId: string;
  readonly direction: 'asc' | 'desc';
};

function resolveProductSortValue(
  row: ProductRow,
  columnId: string,
): number | string {
  if (columnId === 'orders') {
    return row.orders;
  }

  if (columnId === 'revenue') {
    return row.revenue;
  }

  if (columnId === 'margin') {
    return row.margin;
  }

  if (columnId === 'status') {
    return copy(tableStatusCopy[row.status]);
  }

  return row.product;
}

function compareProductSortValues(
  left: number | string,
  right: number | string,
  locale: string,
): number {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return String(left).localeCompare(String(right), locale, {
    numeric: true,
    sensitivity: 'base',
  });
}

function sortProductRows(
  rows: readonly ProductRow[],
  sort: ProductSortState | null,
  locale: string,
): readonly ProductRow[] {
  if (!sort) {
    return rows;
  }

  return [...rows].sort((leftRow, rightRow) => {
    const result = compareProductSortValues(
      resolveProductSortValue(leftRow, sort.columnId),
      resolveProductSortValue(rightRow, sort.columnId),
      locale,
    );

    return sort.direction === 'desc'
      ? result * -1
      : result;
  });
}

function DataTableSurface() {
  const locale = readLocale();
  const [sort, setSort] = useState<ProductSortState | null>({
    columnId: 'revenue',
    direction: 'desc',
  });
  const [layer, setLayer] = useState<
    'detail' | 'export' | 'papa' | null
  >(null);
  const [activeRow, setActiveRow] = useState<ProductRow | null>(null);
  const columns = buildTableColumns();
  const sortedProductRows = sortProductRows(tableRows, sort, locale);
  const dataRows: readonly DataRow[] = sortedProductRows.map((row) => ({
    id: row.id,
    product: row.product,
    orders: formatPapaDataNumber(row.orders, locale),
    revenue: formatPapaDataCurrency(row.revenue, locale),
    margin: formatPapaDataPercent(row.margin, locale),
    status: copy(tableStatusCopy[row.status]),
  }));
  const statusToneMap = {
    [copy(tableStatusCopy.ready)]: 'success',
    [copy(tableStatusCopy.partial)]: 'warning',
    [copy(tableStatusCopy.stale)]: 'warning',
  } as const;

  const sortedColumn = sort
    ? columns.find(({ id }) => id === sort.columnId)
    : null;

  const sortDescription = sort
    ? `${sortedColumn?.label ?? sort.columnId} · ${copy({
        pl: sort.direction === 'desc' ? 'malejąco' : 'rosnąco',
        en: sort.direction === 'desc' ? 'descending' : 'ascending',
      })}`
    : copy({ pl: 'Brak sortowania', en: 'No sorting' });

  const openRowLayer = (
    rowId: string,
    nextLayer: 'detail' | 'export' | 'papa',
  ) => {
    const row = tableRows.find((item) => item.id === rowId) ?? null;
    setActiveRow(row);
    setLayer(nextLayer);
  };

  const closeRowLayer = () => {
    setLayer(null);
    setActiveRow(null);
  };

  return (
    <div className="pd-s53-table-composition">
      <p className="pd-s53-owner-note">
        <Localized
          pl="Owner bazowej tabeli: 10.07 / DataTable. Laboratorium pokazuje wyłącznie użycie tabeli w powierzchni oraz handoff warstw szczegółów, eksportu i wyjaśnienia."
          en="Base table owner: 10.07 / DataTable. The laboratory only demonstrates table composition and the handoff for detail, export and explanation layers."
        />
      </p>

      <div className="pd-s53-table-context">
        <header>
          <div>
            <span><Localized pl="Powierzchnia operacyjna" en="Operational surface" /></span>
            <h3><Localized pl="Produkty i wyniki sprzedaży" en="Products and sales results" /></h3>
          </div>

          <StatusBadge
            status={copy({ pl: 'Status danych', en: 'Data status' })}
            text={copy({ pl: 'Gotowe', en: 'Ready' })}
            tone="success"
          />
        </header>

        <div className="pd-s53-table-context__meta">
          <div>
            <span><Localized pl="Zakres" en="Range" /></span>
            <strong><Localized pl="4 produkty · 30 dni" en="4 products · 30 days" /></strong>
          </div>
          <div>
            <span><Localized pl="Sortowanie" en="Sorting" /></span>
            <strong>{sortDescription}</strong>
          </div>
          <div>
            <span><Localized pl="Źródła" en="Sources" /></span>
            <strong>Shop · ERP</strong>
          </div>
        </div>
      </div>

      <DataTable
        actionsMenuItems={() => [
          {
            icon: 'data',
            id: 'detail',
            label: copy({ pl: 'Pokaż szczegóły', en: 'Show details' }),
          },
          {
            icon: 'assistant',
            id: 'papa',
            label: copy({ pl: 'Wyjaśnij z Papa', en: 'Explain with Papa' }),
          },
          {
            id: 'export',
            label: copy({ pl: 'Podgląd eksportu', en: 'Export preview' }),
          },
        ]}
        ariaLabel={copy({ pl: 'Produkty i wyniki sprzedaży', en: 'Products and sales results' })}
        columns={columns}
        density="comfortable"
        emptyMessage={copy({ pl: 'Brak produktów dla bieżącego kontekstu.', en: 'No products for the current context.' })}
        loading={false}
        pagination={null}
        rowCount={dataRows.length}
        rows={dataRows}
        selectedRowIds={[]}
        sort={sort}
        statusColumn={{
          columnId: 'status',
          label: copy({ pl: 'Status danych', en: 'Data status' }),
          mapTone: statusToneMap,
        }}
        summary={copy({
          pl: 'Kanoniczny DataTable bez domyślnego zaznaczenia. Akcje rekordu otwierają warstwy zamiast rozbudowywać tabelę lokalnym silnikiem.',
          en: 'Canonical DataTable with no default selection. Row actions open layers instead of extending the table with a local engine.',
        })}
        onAction={(rowId, actionId) => {
          if (actionId === 'detail') {
            openRowLayer(rowId, 'detail');
            return;
          }

          if (actionId === 'papa') {
            openRowLayer(rowId, 'papa');
            return;
          }

          if (actionId === 'export') {
            openRowLayer(rowId, 'export');
          }
        }}
        onSortChange={(columnId) => {
          setSort((current) => {
            if (current?.columnId === columnId) {
              return {
                columnId,
                direction: current.direction === 'asc' ? 'desc' : 'asc',
              };
            }

            return {
              columnId,
              direction: 'asc',
            };
          });
        }}
      />

      <Drawer
        dismissible
        description={activeRow?.product ?? null}
        open={layer === 'detail'}
        side="right"
        title={copy({ pl: 'Szczegóły rekordu', en: 'Record details' })}
        width={460}
        onOpenChange={(open) => {
          if (open) {
            setLayer('detail');
            return;
          }

          closeRowLayer();
        }}
      >
        {activeRow ? (
          <dl className="pd-s53-detail-list">
            <div><dt>ID</dt><dd>{activeRow.id}</dd></div>
            <div><dt><Localized pl="Zamówienia" en="Orders" /></dt><dd>{formatPapaDataNumber(activeRow.orders, locale)}</dd></div>
            <div><dt><Localized pl="Przychód" en="Revenue" /></dt><dd>{formatPapaDataCurrency(activeRow.revenue, locale)}</dd></div>
            <div><dt><Localized pl="Marża" en="Margin" /></dt><dd>{formatPapaDataPercent(activeRow.margin, locale)}</dd></div>
          </dl>
        ) : null}
      </Drawer>

      <Drawer
        dismissible
        description={activeRow?.product ?? null}
        open={layer === 'export'}
        side="right"
        title={copy({ pl: 'Podgląd eksportu', en: 'Export preview' })}
        width={440}
        onOpenChange={(open) => {
          if (open) {
            setLayer('export');
            return;
          }

          closeRowLayer();
        }}
      >
        <InlineNotice
          message={copy({
            pl: '05.03 pokazuje wyłącznie warstwę podglądu. Pełny workflow eksportu tabeli należy do 18.04 i nie jest implementowany drugi raz w Laboratorium.',
            en: '05.03 demonstrates the preview layer only. The full table export workflow belongs to 18.04 and is not reimplemented in the Laboratory.',
          })}
          title={copy({ pl: 'Handoff eksportu', en: 'Export handoff' })}
          tone="info"
        />
      </Drawer>

      <Drawer
        dismissible
        description={activeRow?.product ?? null}
        open={layer === 'papa'}
        side="right"
        title={copy({ pl: 'Wyjaśnij z Papa', en: 'Explain with Papa' })}
        width={440}
        onOpenChange={(open) => {
          if (open) {
            setLayer('papa');
            return;
          }

          closeRowLayer();
        }}
      >
        <InlineNotice
          message={copy({
            pl: 'Papa interpretuje wybrany rekord w kontekście danych. Warstwa korzysta z istniejącej roli akcji asystenta i nie tworzy nowego typu panelu tabeli.',
            en: 'Papa interprets the selected record in data context. The layer uses the existing assistant action role and does not create a new table-panel type.',
          })}
          title={copy({ pl: 'Kontekst rekordu', en: 'Record context' })}
          tone="info"
        />
      </Drawer>
    </div>
  );
}

const surfaceStates: readonly {
  readonly id: AnalyticsDataState;
  readonly title: LocalizedCopy;
  readonly body: LocalizedCopy;
  readonly value: LocalizedCopy;
  readonly meta: LocalizedCopy;
}[] = [
  {
    id: 'processing',
    title: { pl: 'Przetwarzanie', en: 'Processing' },
    body: {
      pl: 'Geometria pozostaje stabilna, a użytkownik widzi zakres trwającej synchronizacji.',
      en: 'Geometry stays stable while the user sees the scope of the running synchronization.',
    },
    value: { pl: 'Aktualizacja…', en: 'Updating…' },
    meta: { pl: 'Synchronizacja 3 z 5 źródeł', en: 'Synchronizing 3 of 5 sources' },
  },
  {
    id: 'noData',
    title: { pl: 'Brak danych', en: 'No data' },
    body: {
      pl: 'Powierzchnia zachowuje miejsce danych i wyjaśnia, dlaczego bieżący zakres jest pusty.',
      en: 'The surface preserves the data region and explains why the current range is empty.',
    },
    value: { pl: 'Brak wyniku', en: 'No result' },
    meta: { pl: 'Zakres 1–31 lip 2026', en: 'Range Jul 1–31, 2026' },
  },
  {
    id: 'partial',
    title: { pl: 'Dane częściowe', en: 'Partial data' },
    body: {
      pl: 'Wynik pozostaje dostępny, ale jego kompletność jest jawnie ograniczona.',
      en: 'The result remains available while its completeness is explicitly limited.',
    },
    value: { pl: '214 800 zł', en: 'PLN 214,800' },
    meta: { pl: '3 z 5 źródeł gotowe', en: '3 of 5 sources ready' },
  },
  {
    id: 'stale',
    title: { pl: 'Dane nieaktualne', en: 'Stale data' },
    body: {
      pl: 'Ostatni poprawny wynik pozostaje czytelny razem z czasem jego odświeżenia.',
      en: 'The last valid result remains readable together with its refresh time.',
    },
    value: { pl: '248 420 zł', en: 'PLN 248,420' },
    meta: { pl: 'Ostatnie poprawne dane: 09:42', en: 'Last valid data: 09:42' },
  },
  {
    id: 'providerError',
    title: { pl: 'Błąd dostawcy', en: 'Provider error' },
    body: {
      pl: 'Błąd wskazuje konkretne źródło bez niszczenia geometrii pozostałej powierzchni.',
      en: 'The error identifies a specific source without breaking the geometry of the remaining surface.',
    },
    value: { pl: 'Źródło niedostępne', en: 'Source unavailable' },
    meta: { pl: 'Google Ads · autoryzacja', en: 'Google Ads · authorization' },
  },
];

function SurfaceStateVisual({
  state,
}: {
  readonly state: (typeof surfaceStates)[number];
}) {
  return (
    <div className="pd-s53-state-surface" data-state={state.id}>
      <header>
        <span><Localized pl="Przychód kanałów" en="Channel revenue" /></span>
        <strong>{copy(state.value)}</strong>
      </header>

      <div className="pd-s53-state-surface__plot" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <footer>{copy(state.meta)}</footer>
    </div>
  );
}

function SurfaceStates() {
  return (
    <div className="pd-s53-state-list">
      {surfaceStates.map((state) => (
        <article key={state.id}>
          <header>
            <StatusBadge
              status={copy({ pl: 'Status danych', en: 'Data status' })}
              text={copy(state.title)}
              tone={resolveAnalyticsDataStateTone(state.id)}
            />
            <code>{state.id}</code>
          </header>

          <SurfaceStateVisual state={state} />

          <p>{copy(state.body)}</p>
        </article>
      ))}
    </div>
  );
}

function WorkPanels() {
  const [panel, setPanel] = useState<
    'evidence' | 'recommendation' | 'workspace' | null
  >(null);

  return (
    <div className="pd-s53-work-context">
      <div className="pd-s53-work-context__base">
        <header>
          <div>
            <span><Localized pl="Kontekst decyzji" en="Decision context" /></span>
            <h3>
              <Localized
                pl="Kampania Search · rentowność"
                en="Search campaign · profitability"
              />
            </h3>
          </div>

          <StatusBadge
            status={copy({ pl: 'Status decyzji', en: 'Decision status' })}
            text={copy({ pl: 'Wymaga decyzji', en: 'Decision required' })}
            tone="warning"
          />
        </header>

        <div className="pd-s53-work-context__metrics">
          <div>
            <span>ROAS</span>
            <strong>4,82</strong>
            <small><Localized pl="cel 4,50" en="target 4.50" /></small>
          </div>
          <div>
            <span><Localized pl="Przychód" en="Revenue" /></span>
            <strong>+18,6%</strong>
            <small><Localized pl="vs poprzedni okres" en="vs previous period" /></small>
          </div>
          <div>
            <span><Localized pl="Atrybucja" en="Attribution" /></span>
            <strong><Localized pl="Częściowa" en="Partial" /></strong>
            <small><Localized pl="2 dni opóźnienia" en="2 days delayed" /></small>
          </div>
        </div>

        <div className="pd-s53-work-context__signal">
          <div>
            <span><Localized pl="Sygnał" en="Signal" /></span>
            <strong>
              <Localized
                pl="Rentowność rośnie, ale jakość atrybucji ogranicza pewność decyzji."
                en="Profitability is improving, but attribution quality limits decision confidence."
              />
            </strong>
          </div>

          <svg aria-hidden="true" viewBox="0 0 360 90">
            <path className="pd-s53-work-context__benchmark" d="M10 58 H350" />
            <path
              className="pd-s53-work-context__trend"
              d="M10 70 C54 64 78 68 112 52 S172 44 208 38 S278 34 350 18"
            />
            <circle cx="350" cy="18" r="4" />
          </svg>
        </div>

        <p>
          <Localized
            pl="Dowody i rekomendacje otwierają się jako warstwy. Nie są kolejnymi blokami dokładanymi pod powierzchnią danych."
            en="Evidence and recommendations open as layers. They are not additional blocks appended below the data surface."
          />
        </p>

        <div className="pd-s53-work-context__actions">
          <Button
            onClick={() => setPanel('evidence')}
            size="small"
            variant="secondary"
          >
            <Localized pl="Otwórz dowody" en="Open evidence" />
          </Button>

          <Button
            onClick={() => setPanel('recommendation')}
            size="small"
            variant="secondary"
          >
            <Localized pl="Otwórz rekomendację" en="Open recommendation" />
          </Button>

          <Button
            onClick={() => setPanel('workspace')}
            size="small"
            variant="secondary"
          >
            <Localized pl="Otwórz panel roboczy" en="Open workspace" />
          </Button>
        </div>
      </div>

      <Drawer
        dismissible
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPanel(null);
          }
        }}
        side="right"
        title={
          panel === 'evidence'
            ? copy({ pl: 'Dowody', en: 'Evidence' })
            : panel === 'recommendation'
              ? copy({ pl: 'Rekomendacja', en: 'Recommendation' })
              : copy({ pl: 'Panel roboczy', en: 'Workspace' })
        }
        width={480}
        description={copy({
          pl: 'Warstwa kontekstowa z Escape i przywróceniem fokusu.',
          en: 'Contextual layer with Escape and focus restoration.',
        })}
      >
        {panel === 'evidence' ? (
          <ul className="pd-s53-evidence-list">
            <li>
              <Localized
                pl="Przychód +18,6% po zmianie budżetu"
                en="Revenue +18.6% after budget change"
              />
            </li>
            <li>
              <Localized
                pl="Atrybucja częściowa przez 2 dni"
                en="Partial attribution for 2 days"
              />
            </li>
            <li>
              <Localized
                pl="Benchmark kategorii +11,2%"
                en="Category benchmark +11.2%"
              />
            </li>
          </ul>
        ) : null}

        {panel === 'recommendation' ? (
          <InlineNotice
            message={copy({
              pl: 'Utrzymaj budżet przez 7 dni i ponownie oceń jakość atrybucji.',
              en: 'Keep the budget for 7 days and reassess attribution quality.',
            })}
            title={copy({
              pl: 'Rekomendacja Papa',
              en: 'Papa recommendation',
            })}
            tone="info"
          />
        ) : null}

        {panel === 'workspace' ? (
          <div className="pd-s53-workspace-lines" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

function DataSurfaceAntiExample() {
  return (
    <div className="pd-s53-anti-example">
      <div className="pd-s53-anti-example__diagram" aria-hidden="true">
        <div className="pd-s53-anti-example__cards">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="pd-s53-anti-example__nested">
          <div>
            <span />
            <span />
          </div>
          <div />
        </div>
      </div>

      <div className="pd-s53-anti-example__scroll" aria-hidden="true">
        <span />
      </div>

      <p>
        <Localized
          pl="Antywzorzec: każdy fragment danych dostaje własną kartę, kolejne panele są zagnieżdżane, a brak decyzji układowej maskuje sztuczny poziomy scrollbar."
          en="Anti-pattern: every data fragment gets its own card, more panels are nested inside it, and a fake horizontal scrollbar masks the lack of a layout decision."
        />
      </p>
    </div>
  );
}

function Roles() {
  const roles: readonly {
    readonly role: LocalizedCopy;
    readonly description: LocalizedCopy;
  }[] = [
    {
      role: { pl: 'KPI', en: 'KPI' },
      description: {
        pl: 'Szybki sygnał i kierunek trendu',
        en: 'A quick signal and trend direction',
      },
    },
    {
      role: { pl: 'Wykres', en: 'Chart' },
      description: {
        pl: 'Relacja, porównanie lub struktura',
        en: 'A relationship, comparison or structure',
      },
    },
    {
      role: { pl: 'Tabela', en: 'Table' },
      description: {
        pl: 'Dokładny zestaw rekordów i działania',
        en: 'An exact record set and actions',
      },
    },
    {
      role: { pl: 'Szczegóły', en: 'Details' },
      description: {
        pl: 'Warstwa jednego rekordu',
        en: 'A layer for one record',
      },
    },
    {
      role: { pl: 'Dowody', en: 'Evidence' },
      description: {
        pl: 'Źródła wspierające decyzję',
        en: 'Sources supporting a decision',
      },
    },
    {
      role: { pl: 'Rekomendacja', en: 'Recommendation' },
      description: {
        pl: 'Proponowany następny krok',
        en: 'A proposed next step',
      },
    },
    {
      role: { pl: 'Status danych', en: 'Data status' },
      description: {
        pl: 'Jakość, świeżość i dostępność',
        en: 'Quality, freshness and availability',
      },
    },
  ];

  return (
    <div className="pd-s53-role-ledger">
      {roles.map(({ role, description }) => (
        <div key={copy(role)}>
          <strong>{copy(role)}</strong>
          <p>{copy(description)}</p>
          <span>
            <Localized
              pl="Własna rola lub cykl interakcji"
              en="Own role or interaction cycle"
            />
          </span>
        </div>
      ))}
    </div>
  );
}

export function DataSurfaceLaboratory() {
  return (
    <StoryPage
      handoff={
        <Localized
          pl="10 / 15 / 18 — komponenty i wzorce danych"
          en="10 / 15 / 18 — data components and patterns"
        />
      }
      id="05.03"
      status="review"
      title={<Localized pl="Powierzchnie danych" en="Data surfaces" />}
      summary={
        <Localized
          pl="Panel istnieje tylko wtedy, gdy ma własną rolę, stan albo cykl interakcji. Dane, warstwy i działania nie tworzą poziomego scrolla ani kart wewnątrz kart."
          en="A panel exists only when it has its own role, state or interaction cycle. Data, layers and actions create neither horizontal scrolling nor cards inside cards."
        />
      }
      variants={
        <Localized
          pl="role · handoff KPI · handoff wykresów · handoff ChartFrame · tabela · stany · warstwy"
          en="roles · KPI handoff · charts · ChartFrame handoff · table · states · layers"
        />
      }
    >
      <StorySection
        index="01"
        title={<Localized pl="Role powierzchni" en="Surface roles" />}
      >
        <Roles />
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="KPI — handoff" en="KPI — handoff" />}
        summary={
          <Localized
            pl="Warianty KPI zostały promowane do runtime ownera. Laboratorium nie utrzymuje drugiego katalogu MetricCard."
            en="KPI variants have been promoted to the runtime owner. The laboratory no longer maintains a second MetricCard catalogue."
          />
        }
      >
        <PromotedOwnerNotice
          owner="15.02 MetricCard"
          title={{
            pl: 'Promowane do Wykresy i dane',
            en: 'Promoted to Data visualizations',
          }}
          description={{
            pl: 'Pełny kontrakt KPI, mikrotrendów, stanów i akcji jest od tej chwili własnością 15.02.',
            en: 'The full KPI, microtrend, state and action contract is now owned by 15.02.',
          }}
        />
      </StorySection>

      <StorySection
        index="03"
        title={<Localized pl="Rodziny wykresów" en="Chart families" />}
        summary={
          <Localized
            pl="Trend, porównania, udziały, korelacje i prognozy zostały promowane do 15.03, 15.04, 15.05, 15.06 i 15.07. Laboratorium zachowuje wyłącznie handoff, a pozostałe rodziny czekają na ownerów kolejnych etapów."
            en="Trend, comparison, share composition, correlation and forecasts have been promoted to 15.03, 15.04, 15.05, 15.06 and 15.07. The laboratory keeps only the handoff while the remaining families wait for later owners."
          />
        }
      >
        <PromotedOwnerNotice
          owner="15.03 TrendChart"
          title={{
            pl: 'Promowane do Wykresy i dane',
            en: 'Promoted to Data visualizations',
          }}
          description={{
            pl: 'Line, area, actual, plan, poprzedni okres i średnia krocząca są od tej chwili kontraktem runtime 15.03.',
            en: 'Line, area, actual, plan, previous period and moving average are now the 15.03 runtime contract.',
          }}
        />
        <PromotedOwnerNotice
          owner="15.04 ComparisonChart"
          title={{
            pl: 'Promowane do Wykresy i dane',
            en: 'Promoted to Data visualizations',
          }}
          description={{
            pl: 'Bar, grouped bar, ranking, benchmark i porównanie okresów są od tej chwili kontraktem runtime 15.04.',
            en: 'Bar, grouped bar, ranking, benchmark and period comparison are now the 15.04 runtime contract.',
          }}
        />
        <PromotedOwnerNotice
          owner="15.05 ShareChart"
          title={{
            pl: 'Promowane do Wykresy i dane',
            en: 'Promoted to Data visualizations',
          }}
          description={{
            pl: 'Donut, bar, stacked i part-to-whole są od tej chwili kontraktem runtime 15.05.',
            en: 'Donut, bar, stacked and part-to-whole composition are now the 15.05 runtime contract.',
          }}
        />
        <PromotedOwnerNotice
          owner="15.06 CorrelationChart"
          title={{
            pl: 'Promowane do Wykresy i dane',
            en: 'Promoted to Data visualizations',
          }}
          description={{
            pl: 'Scatter plot, relationship chart, driver hypothesis oraz statyczne outlier/cluster indication są od tej chwili kontraktem runtime 15.06.',
            en: 'Scatter plot, relationship chart, driver hypothesis and static outlier/cluster indication are now the 15.06 runtime contract.',
          }}
        />
        <PromotedOwnerNotice
          owner="15.07 ForecastChart"
          title={{
            pl: 'Promowane do Wykresy i dane',
            en: 'Promoted to Data visualizations',
          }}
          description={{
            pl: 'Actual, forecast, uncertainty band, confidence, quality i statyczne scenariusze są od tej chwili kontraktem runtime 15.07.',
            en: 'Actual, forecast, uncertainty band, confidence, quality and static scenarios are now the 15.07 runtime contract.',
          }}
        />
        <ChartFamilies />
      </StorySection>

      <StorySection
        index="04"
        title={<Localized pl="ChartFrame — handoff" en="ChartFrame — handoff" />}
        summary={
          <Localized
            pl="Pełny kontener wykresu został promowany do runtime ownera. 05.03 zachowuje wyłącznie zapis decyzji."
            en="The full chart container has been promoted to the runtime owner. 05.03 keeps only the decision record."
          />
        }
      >
        <PromotedOwnerNotice
          owner="15.01 ChartFrame"
          title={{
            pl: 'Promowane do Wykresy i dane',
            en: 'Promoted to Data visualizations',
          }}
          description={{
            pl: 'Nagłówek, status, metadane, wizualizacja, legenda, wniosek i tabela alternatywna są teraz kontraktem 15.01.',
            en: 'Header, status, metadata, visualization, legend, insight and alternative table are now the 15.01 contract.',
          }}
        />
      </StorySection>

      <StorySection
        index="05"
        title={<Localized pl="Tabela — handoff i użycie" en="Table — handoff and usage" />}
        summary={
          <Localized
            pl="05.03 konsumuje 10.07 / DataTable. Szczegóły, podgląd eksportu i wyjaśnienie pozostają warstwami, bez lokalnego silnika tabeli i bez lokalnego Selecta."
            en="05.03 consumes 10.07 / DataTable. Details, export preview and explanation remain layers, with no local table engine or local Select."
          />
        }
      >
        <DataTableSurface />
      </StorySection>

      <StorySection
        index="06"
        title={<Localized pl="Stany powierzchni" en="Surface states" />}
        summary={
          <Localized
            pl="Stany układają się pionowo lub w elastycznej siatce bez poziomego przewijania."
            en="States stack vertically or in a flexible grid without horizontal scrolling."
          />
        }
      >
        <SurfaceStates />
      </StorySection>

      <StorySection
        index="07"
        title={<Localized pl="Panele robocze w kontekście" en="Work panels in context" />}
        summary={
          <Localized
            pl="Powierzchnia pokazuje kontekst decyzji na canvasie, a dowody, rekomendacja i workspace otwierają się dopiero jako rzeczywiste warstwy."
            en="The surface shows decision context on the canvas, while evidence, recommendation and workspace open only as real layers."
          />
        }
      >
        <WorkPanels />
      </StorySection>

      <StorySection
        index="08"
        title={<Localized pl="Decyzja i antyprzykład" en="Decision and anti-example" />}
      >
        <DecisionRows
          accepted={
            <Localized
              pl="Jedna rola powierzchni, jawne stany, detale w warstwach, brak domyślnego zaznaczenia i brak poziomego scrolla."
              en="One surface role, explicit states, details in layers, no default selection and no horizontal scrolling."
            />
          }
          rejected={
            <Localized
              pl="Tabela i panele przedłużają stronę, wszystkie warianty są obok siebie, a poziomy scrollbar zastępuje decyzję układową."
              en="The table and panels extend the page, all variants sit side by side, and a horizontal scrollbar replaces a layout decision."
            />
          }
        />
        <DataSurfaceAntiExample />
      </StorySection>
    </StoryPage>
  );
}