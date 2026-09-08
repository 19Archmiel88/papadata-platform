import { useState } from 'react';
import {
  Button,
  DateRangePicker,
  Drawer,
  ExplorerTable,
  MetricCard,
  Popover,
} from '../../design-system';
import type { ExplorerTableColumn } from '../../design-system';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { overviewRangeLabel } from '../command-center/CommandCenterScreen.data';
import {
  deriveOrdersAnalysis,
  filterOrderQueue,
  fulfillmentLabel,
  isOrderLate,
  orderQueueLabels,
} from './OrdersAnalysis.data';
import type { OrderQueue, OrderSource } from './OrdersAnalysis.data';
import { sampleOrders, ordersProvenanceDict } from './OrdersScreen.data';
import type { SampleOrder, OrdersProvenanceKey } from './OrdersScreen.data';
import {
  OrdersPaymentsAndShipping,
  OrdersDiscountsAndReturns,
  OrdersPurchaseFunnel,
  OrdersExecutiveInsight,
} from './OrdersDetailSections';
import './OrdersAnalysis.css';
export {
  OrdersPaymentsAndShipping,
  OrdersDiscountsAndReturns,
  OrdersPurchaseFunnel,
  OrdersExecutiveInsight,
} from './OrdersDetailSections';

const tabs = [
  { id: 'queue', label: 'Realizacja' },
  { id: 'payments', label: 'Płatności i dostawa' },
  { id: 'returns', label: 'Rabaty i zwroty' },
  { id: 'funnel', label: 'Lejek zakupowy' },
  { id: 'insight', label: 'Wnioski' },
] as const;
type OrderView = (typeof tabs)[number]['id'];
type OrderDetail =
  | { kind: 'order'; id: string }
  | { kind: 'definition' }
  | { kind: 'provenance'; key: OrdersProvenanceKey }
  | null;
const money = (value: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
function readParam(key: string) {
  return typeof window === 'undefined'
    ? null
    : new URLSearchParams(window.location.search).get(key);
}
function writeParam(key: string, value: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState(null, '', url);
}

export function OrdersScreen({
  observations = sampleOrders,
  state = 'ready',
  onRetry,
  initialView,
  section,
}: {
  readonly observations?: readonly SampleOrder[] | null;
  readonly state?: 'ready' | 'loading' | 'error';
  readonly onRetry?: () => void;
  readonly initialView?: OrderView;
  readonly section?: 'result' | 'lifecycle' | 'table';
} = {}) {
  const { dateRange, setDateRange } = useShellDateRange();
  const [dateOpen, setDateOpen] = useState(false);
  const [view, setView] = useState<OrderView>(
    () => initialView ?? tabs.find((t) => t.id === readParam('orderView'))?.id ?? 'queue',
  );
  const [source, setSource] = useState<OrderSource>(() => {
    const value = readParam('orderSource');
    return value === 'WooCommerce' || value === 'BaseLinker' ? value : 'all';
  });
  const [queue, setQueue] = useState<OrderQueue>(() => {
    const value = readParam('orderQueue');
    return value && value in orderQueueLabels ? (value as OrderQueue) : 'all';
  });
  const [detail, setDetail] = useState<OrderDetail>(null);
  const analysis = deriveOrdersAnalysis(dateRange, source, observations ?? []);
  const activeOrder =
    detail?.kind === 'order' ? analysis.rows.find((order) => order.id === detail.id) : null;
  const provenance = detail?.kind === 'provenance' ? ordersProvenanceDict[detail.key] : null;
  const selectQueue = (value: OrderQueue) => {
    setQueue(value);
    writeParam('orderQueue', value);
  };
  const openOrder = (id: string) => setDetail({ kind: 'order', id });
  const openProvenance = (key: OrdersProvenanceKey) => setDetail({ kind: 'provenance', key });
  const columns: readonly ExplorerTableColumn<SampleOrder>[] = [
    {
      id: 'id',
      label: 'Zamówienie',
      required: true,
      sortAccessor: (row) => row.id,
      csvValue: (row) => row.id,
      render: (row) => (
        <button
          type="button"
          className="pd-orders-analysis__order-link"
          onClick={() => openOrder(row.id)}
        >
          {row.id}
        </button>
      ),
    },
    {
      id: 'date',
      label: 'Złożono',
      sortAccessor: (row) => row.date,
      csvValue: (row) => row.date,
      render: (row) => (
        <span>
          {row.date.slice(8, 10)}.{row.date.slice(5, 7)} · {row.date.slice(11)}
        </span>
      ),
    },
    {
      id: 'channel',
      label: 'Źródło',
      sortAccessor: (row) => row.channel,
      csvValue: (row) => row.channel,
      render: (row) => row.channel,
    },
    {
      id: 'gross',
      label: 'Wartość brutto',
      align: 'right',
      sortAccessor: (row) => row.grossValue,
      csvValue: (row) => row.grossValue,
      render: (row) => money(row.grossValue),
    },
    {
      id: 'payment',
      label: 'Płatność',
      csvValue: (row) => (row.paymentStatus === 'Paid' ? 'Opłacone' : 'Błąd płatności'),
      render: (row) => (
        <span data-tone={row.paymentStatus === 'Failed' ? 'danger' : undefined}>
          {row.paymentStatus === 'Paid' ? 'Opłacone' : 'Błąd płatności'}
        </span>
      ),
    },
    {
      id: 'fulfillment',
      label: 'Realizacja',
      csvValue: fulfillmentLabel,
      render: fulfillmentLabel,
    },
    {
      id: 'sla',
      label: 'Termin realizacji',
      csvValue: (row) => (isOrderLate(row) ? row.slaHours : row.slaStatus),
      render: (row) => (
        <span
          data-tone={
            isOrderLate(row) ? 'danger' : row.slaStatus === 'warning' ? 'warning' : undefined
          }
        >
          {isOrderLate(row)
            ? `Po terminie · ${row.slaHours}`
            : row.fulfillmentStatus === 'Fulfilled'
              ? 'Zrealizowane'
              : row.slaStatus === 'warning'
                ? 'Blisko terminu'
                : 'W terminie'}
        </span>
      ),
    },
    {
      id: 'refund',
      label: 'Zwrot brutto',
      align: 'right',
      defaultVisible: false,
      sortAccessor: (row) => row.refund,
      csvValue: (row) => row.refund,
      render: (row) => (row.refund > 0 ? money(row.refund) : '—'),
    },
  ];

  return (
    <div className="pd-orders-analysis" data-testid="orders-bi-page">
      <header className="pd-orders-analysis__header">
        <div>
          <h1>Zamówienia</h1>
          <p>Od wykrycia problemu do konkretnego zamówienia.</p>
        </div>
        {view === 'queue' ? (
          <Popover
            anchorId="orders-date-trigger"
            title="Okres zamówień"
            modal={false}
            placement="bottom-end"
            open={dateOpen}
            onOpenChange={setDateOpen}
            trigger={
              <Button variant="secondary" size="small">
                {overviewRangeLabel(dateRange)} <span aria-hidden="true">⌄</span>
              </Button>
            }
          >
            <DateRangePicker
              label="Okres zamówień"
              value={dateRange}
              timezone={dateRange.timezone}
              onChange={setDateRange}
              presets={[
                { label: 'Ostatnie 7 dni', value: 'last7d' },
                { label: 'Ostatnie 30 dni', value: 'last30d' },
                { label: 'Własny okres', value: 'custom' },
              ]}
            />
            {!analysis.valid && <p role="alert">Wybierz okres od 1 do 366 dni.</p>}
            <Button size="small" disabled={!analysis.valid} onClick={() => setDateOpen(false)}>
              Gotowe
            </Button>
          </Popover>
        ) : (
          <p>Analiza szczegółowa · 1–31 sie 2026</p>
        )}
      </header>
      <nav className="pd-orders-analysis__tabs" aria-label="Widoki zamówień">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            aria-current={view === tab.id ? 'page' : undefined}
            onClick={() => {
              setView(tab.id);
              writeParam('orderView', tab.id);
              setDetail(null);
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="pd-orders-analysis__context">
        <p>
          {view === 'queue'
            ? 'Dane przykładowe · próbka zamówień z sierpnia 2026 · PLN · data złożenia'
            : 'Zapisany przykład analizy miesięcznej · niezależny od próbki kolejki realizacji'}
        </p>
        {view === 'queue' && (
          <select
            aria-label="Źródło zamówień"
            value={source}
            onChange={(event) => {
              setSource(event.target.value as OrderSource);
              writeParam('orderSource', event.target.value);
              setDetail(null);
            }}
          >
            <option value="all">Wszystkie źródła</option>
            <option value="WooCommerce">WooCommerce</option>
            <option value="BaseLinker">BaseLinker</option>
          </select>
        )}
      </div>
      {state === 'loading' ? (
        <section className="pd-orders-analysis__state" role="status">
          <h2>Wczytywanie zamówień…</h2>
          <p>Przygotowujemy kolejkę i podsumowanie.</p>
        </section>
      ) : state === 'error' || observations === null ? (
        <section className="pd-orders-analysis__state" role="alert">
          <h2>Nie udało się wczytać zamówień</h2>
          <p>Wynik jest niedostępny.</p>
          {onRetry && <Button onClick={onRetry}>Spróbuj ponownie</Button>}
        </section>
      ) : view === 'queue' ? (
        <>
          {!analysis.valid ? (
            <section className="pd-orders-analysis__state" role="alert">
              <h2>Wybierz poprawny okres</h2>
              <p>Zakres może obejmować od 1 do 366 dni.</p>
            </section>
          ) : analysis.rows.length === 0 ? (
            <section className="pd-orders-analysis__state">
              <h2>Brak zamówień w tym zakresie</h2>
              <p>Zmień okres lub źródło. Przykładowe zamówienia pochodzą z 25–28 sierpnia 2026.</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSource('all');
                  writeParam('orderSource', 'all');
                  setDateRange({
                    ...dateRange,
                    from: '2026-08-01',
                    to: '2026-08-31',
                    preset: 'custom',
                  });
                }}
              >
                Pokaż przykładowy sierpień
              </Button>
            </section>
          ) : (
            <>
              {section !== 'table' && section !== 'lifecycle' && (
                <>
                  <section
                    className="pd-orders-analysis__diagnosis"
                    aria-labelledby="orders-diagnosis-title"
                  >
                    <span className="pd-orders-analysis__eyebrow">Wynik operacyjny</span>
                    <h2 id="orders-diagnosis-title">
                      {analysis.counts.attention
                        ? `${analysis.counts.attention} ${analysis.counts.attention === 1 ? 'zamówienie wymaga' : 'zamówienia wymagają'} uwagi`
                        : 'Brak pilnych problemów w tej próbce'}
                    </h2>
                    <p>
                      Po terminie realizacji: <strong>{analysis.late.length}</strong>. Błędy
                      płatności: <strong>{analysis.counts.payment_failed}</strong>. Zacznij od
                      opłaconych zamówień czekających na wysyłkę.
                    </p>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => selectQueue('attention')}
                    >
                      Pokaż wymagające uwagi · {analysis.counts.attention}
                    </Button>
                  </section>
                  <section
                    className="pd-orders-analysis__kpis"
                    aria-label="Podsumowanie próbki zamówień"
                  >
                    {[
                      {
                        id: 'count',
                        label: 'Zamówienia w próbce',
                        value: String(analysis.counts.all),
                        note: 'W wybranym okresie i źródle',
                      },
                      {
                        id: 'gross',
                        label: 'Wartość zamówień brutto',
                        value: money(analysis.gross),
                        note: 'Wartość rekordów, także nieopłaconych',
                      },
                      {
                        id: 'dispatch',
                        label: 'Opłacone, do wysłania',
                        value: String(analysis.counts.processing),
                        note: 'Oczekujące i w realizacji',
                      },
                      {
                        id: 'refund',
                        label: 'Zwroty brutto',
                        value: money(analysis.refunded),
                        note: 'Zwroty zamówień z wybranego okresu',
                      },
                    ].map((metric) => (
                      <MetricCard
                        key={metric.id}
                        metricId={`orders-${metric.id}`}
                        depth="flat"
                        label={metric.label}
                        value={metric.value}
                        status="ready"
                        statusLabel=""
                        signal="neutral"
                        helpText={metric.note}
                        detailAction={{
                          label: 'Definicja i źródło',
                          onAction: () => setDetail({ kind: 'definition' }),
                        }}
                      />
                    ))}
                  </section>
                </>
              )}
              <section className="pd-orders-analysis__queue" aria-labelledby="orders-queue-title">
                <div className="pd-orders-analysis__section-heading">
                  <div>
                    <h2 id="orders-queue-title">Kolejka realizacji</h2>
                    <p>
                      Liczniki odnoszą się do wybranego okresu i źródła; filtry mogą obejmować te
                      same zamówienia.
                    </p>
                  </div>
                </div>
                <div
                  className="pd-orders-analysis__filters"
                  role="group"
                  aria-label="Filtry kolejki realizacji"
                >
                  {(Object.keys(orderQueueLabels) as OrderQueue[]).map((item) => (
                    <button
                      type="button"
                      key={item}
                      aria-pressed={queue === item}
                      onClick={() => selectQueue(item)}
                    >
                      {orderQueueLabels[item]} <span>{analysis.counts[item]}</span>
                    </button>
                  ))}
                </div>
                <ExplorerTable
                  ariaLabel="Lista zamówień"
                  columns={columns}
                  rows={filterOrderQueue(analysis.rows, queue)}
                  searchLabel="Szukaj ID, SKU, produktu lub kanału"
                  searchPlaceholder="Szukaj zamówienia lub produktu…"
                  searchText={(order) =>
                    [
                      order.id,
                      order.channel,
                      ...order.items.flatMap((item) => [item.sku, item.name]),
                    ].join(' ')
                  }
                  exportFilenameBase={`zamowienia-${dateRange.from}-${dateRange.to}`}
                  emptyMessage="Brak zamówień dla wybranego filtra i wyszukiwania."
                  onRowClick={(order) => openOrder(order.id)}
                />
                <p className="pd-orders-analysis__note">
                  To demonstracyjna próbka rekordów, nie pełna sprzedaż sklepu. Jej sumy nie
                  odpowiadają agregatom przeglądu biznesu.
                </p>
              </section>
            </>
          )}
        </>
      ) : (
        <div className="pd-obi pd-orders-analysis__details">
          {view === 'payments' && <OrdersPaymentsAndShipping onOpenProvenance={openProvenance} />}
          {view === 'returns' && <OrdersDiscountsAndReturns onOpenProvenance={openProvenance} />}
          {view === 'funnel' && <OrdersPurchaseFunnel onOpenProvenance={openProvenance} />}
          {view === 'insight' && <OrdersExecutiveInsight />}
        </div>
      )}
      <Drawer
        open={detail !== null}
        title={
          activeOrder
            ? `Zamówienie ${activeOrder.id}`
            : (provenance?.title ?? 'Definicje i źródło zamówień')
        }
        description="Zapisany przykład danych · sierpień 2026"
        side="right"
        width={540}
        dismissible
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <div className="pd-orders-analysis__evidence">
          {activeOrder ? (
            <>
              <p>
                {activeOrder.channel} · identyfikator klienta {activeOrder.customerId}
              </p>
              <section>
                <h3>Realizacja</h3>
                <dl>
                  <div>
                    <dt>Złożono</dt>
                    <dd>{activeOrder.date}</dd>
                  </div>
                  <div>
                    <dt>Płatność</dt>
                    <dd data-tone={activeOrder.paymentStatus === 'Failed' ? 'danger' : undefined}>
                      {activeOrder.paymentStatus === 'Paid' ? 'Opłacone' : 'Błąd płatności'} ·{' '}
                      {activeOrder.paymentProvider}
                    </dd>
                  </div>
                  <div>
                    <dt>Status wysyłki</dt>
                    <dd>{fulfillmentLabel(activeOrder)}</dd>
                  </div>
                  <div>
                    <dt>Termin realizacji</dt>
                    <dd data-tone={isOrderLate(activeOrder) ? 'danger' : undefined}>
                      {isOrderLate(activeOrder)
                        ? activeOrder.slaHours
                        : activeOrder.fulfillmentStatus === 'Fulfilled'
                          ? 'Zrealizowane'
                          : activeOrder.slaStatus === 'warning'
                            ? 'Blisko terminu'
                            : 'W terminie'}
                    </dd>
                  </div>
                </dl>
              </section>
              <section>
                <h3>Wartości z rekordu</h3>
                <dl>
                  <div>
                    <dt>Wartość brutto</dt>
                    <dd>{money(activeOrder.grossValue)}</dd>
                  </div>
                  <div>
                    <dt>Wartość netto</dt>
                    <dd>{money(activeOrder.netValue)}</dd>
                  </div>
                  <div>
                    <dt>Rabat · {activeOrder.discountCode}</dt>
                    <dd>{money(activeOrder.discount)}</dd>
                  </div>
                  <div>
                    <dt>Zwrot brutto</dt>
                    <dd>{money(activeOrder.refund)}</dd>
                  </div>
                </dl>
                <p>
                  Brakuje kosztu produktów, kosztu dostawy i dat poszczególnych zdarzeń. Marża oraz
                  czas wysyłki pozostają niedostępne.
                </p>
              </section>
              <section>
                <h3>Produkty</h3>
                {activeOrder.items.map((item) => (
                  <article key={item.sku}>
                    <strong>{item.name}</strong>
                    <p>
                      {item.sku} · {item.qty} szt. · cena w rekordzie {money(item.price)}
                    </p>
                  </article>
                ))}
              </section>
              <section className="pd-orders-analysis__next-step">
                <h3>Następny krok</h3>
                <p>
                  {activeOrder.paymentStatus === 'Failed'
                    ? 'Sprawdź wynik transakcji u operatora płatności, zanim skierujesz zamówienie do wysyłki.'
                    : isOrderLate(activeOrder)
                      ? 'Sprawdź kompletację i dostępność produktów w systemie realizacji. Ustal termin wysyłki opłaconego zamówienia.'
                      : activeOrder.refund > 0
                        ? 'Sprawdź powód i rozliczenie zwrotu w systemie źródłowym.'
                        : 'Sprawdź aktualny status w systemie źródłowym przed podjęciem działania.'}
                </p>
                <p>Podgląd nie zmienia zamówienia ani nie wysyła wiadomości.</p>
              </section>
            </>
          ) : provenance ? (
            <>
              <h3>Źródło</h3>
              <p>{provenance.source}</p>
              <h3>Pokrycie</h3>
              <p>{provenance.coverage}</p>
              <h3>Definicja</h3>
              <p>{provenance.notes}</p>
              <p>Dane tego przykładu dotyczą pełnego sierpnia 2026.</p>
            </>
          ) : (
            <>
              <h3>Zakres i kompletność</h3>
              <p>
                KPI oraz liczniki kolejki liczymy z tych samych rekordów po wyborze daty złożenia i
                źródła. Dane są przykładowe; próba nie stanowi pełnego rejestru sprzedaży.
              </p>
              <p>
                Filtr kolejki i wyszukiwanie zawężają tabelę. KPI pozostają podsumowaniem całego
                wybranego okresu i źródła.
              </p>
              <h3>Wartości pieniężne</h3>
              <p>
                Wartość brutto jest sumą wartości zapisanych w zamówieniach, także tych z błędem
                płatności. Zwroty są sumą zwrotów tych zamówień, niezależnie od daty zwrotu. Nie
                odejmujemy rabatu drugi raz i nie wyliczamy marży bez kosztów.
              </p>
              <h3>Termin realizacji</h3>
              <p>
                Po terminie oznacza niewysłane zamówienie ze statusem przekroczenia celu realizacji.
                Opóźnienie wysłanego zamówienia nie zwiększa aktywnej kolejki problemów. Stan jest
                zapisanym przykładem, nie zegarem działającym na żywo.
              </p>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
}
