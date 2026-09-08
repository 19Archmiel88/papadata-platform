import { useAssistantAnalysisContext } from '../../runtime/shell/papa-assistant/useAssistantAnalysisContext';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Button, DateRangePicker, Drawer, Icon, Popover } from '../../design-system';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import {
  deriveOverview,
  overviewChange,
  overviewDayCount,
  overviewMoney,
  overviewNumber,
  overviewRangeLabel,
} from './CommandCenterScreen.data';
import {
  OverviewDataHealth,
  OverviewDecisions,
  OverviewDrivers,
  OverviewMetrics,
  OverviewTrend,
  overviewMetricDefinitions,
  overviewMetricLabels,
} from './OverviewSections';
import type {
  CommandCenterScreenData,
  OverviewComparison,
  OverviewDecision,
  OverviewMetric,
  OverviewSection,
} from './CommandCenterScreen.model';
import './CommandCenterScreen.css';

type Detail =
  | { readonly type: 'definition'; readonly metric: OverviewMetric }
  | { readonly type: 'decision'; readonly decision: OverviewDecision }
  | { readonly type: 'drivers' }
  | { readonly type: 'data' };
export type CommandCenterScreenProps = {
  readonly data: CommandCenterScreenData | null;
  readonly state?: 'ready' | 'loading' | 'error';
  readonly section?: OverviewSection;
  readonly onNavigate?: (path: string) => void;
  readonly onRetry?: () => void;
};
const presets = [
  { label: 'Ostatnie 7 dni', value: 'last7d' },
  { label: 'Ostatnie 30 dni', value: 'last30d' },
  { label: 'Ostatnie 90 dni', value: 'last90d' },
  { label: 'Bieżący miesiąc', value: 'monthToDate' },
  { label: 'Własny okres', value: 'custom' },
] as const;

const mobileQuery = '(max-width: 767px)';
function subscribeMobile(callback: () => void) {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}
const readMobile = () => window.matchMedia(mobileQuery).matches;
const serverMobile = () => false;

export function CommandCenterScreen({
  data,
  state = 'ready',
  section,
  onNavigate: navigateProp,
  onRetry,
}: CommandCenterScreenProps) {
  const shellNavigate = useShellNavigate();
  const isMobile = useSyncExternalStore(subscribeMobile, readMobile, serverMobile);
  const onNavigate = navigateProp ?? shellNavigate;
  const { dateRange, setDateRange } = useShellDateRange();
  const [comparison, setComparison] = useState<OverviewComparison>(() =>
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('compare') === 'previous_year'
      ? 'previous_year'
      : 'previous_period',
  );
  const [metric, setMetric] = useState<OverviewMetric>('margin');
  const [dateOpen, setDateOpen] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [shareMessage, setShareMessage] = useState('');
  const validRange = overviewDayCount(dateRange) > 0 && overviewDayCount(dateRange) <= 366;
  const result = useMemo(
    () => (data && validRange ? deriveOverview(data, dateRange, comparison, metric) : null),
    [data, dateRange, comparison, metric, validRange],
  );
  useEffect(() => {
    setShareMessage('');
  }, [dateRange, comparison]);
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('compare', comparison);
    window.history.replaceState(window.history.state, '', url);
  }, [comparison]);

  async function shareView() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage('Link do tego widoku został skopiowany.');
    } catch {
      setShareMessage('Skopiuj adres z paska przeglądarki — zawiera bieżący zakres i porównanie.');
    }
  }

  const title =
    detail?.type === 'definition'
      ? overviewMetricLabels[detail.metric]
      : detail?.type === 'decision'
        ? detail.decision.title
        : detail?.type === 'drivers'
          ? 'Jak obliczamy zmianę marży'
          : 'Gotowość danych';
  const hasData = result && result.currentDays > 0;
  const completeComparison =
    result &&
    result.currentDays === result.expectedDays &&
    result.previousDays === overviewDayCount(result.previousRange);
  const revenueChange = completeComparison
    ? overviewChange(result.current.revenue, result.previous.revenue)
    : null;
  const marginChange = completeComparison
    ? overviewChange(result.current.margin, result.previous.margin)
    : null;
  const summary = !hasData
    ? 'Brak obserwacji w wybranym okresie.'
    : !completeComparison
      ? 'Wybrany okres ma niepełne dane do porównania.'
      : marginChange === null
        ? 'Sprawdź wynik w wybranym okresie.'
        : `${revenueChange !== null && revenueChange >= 0 ? 'Sprzedaż rośnie.' : 'Sprzedaż spada.'} Marża po marketingu ${marginChange >= 0 ? 'wzrosła' : 'spadła'} o ${overviewNumber(Math.abs(marginChange), 1)}%.`;
  const ready = state === 'ready' && data && result;
  useAssistantAnalysisContext({ title: 'Przegląd biznesu', route: '/app/command-center', readiness: state,
    source: data?.mode === 'demo' ? 'Dane demonstracyjne przeglądu' : 'Dane workspace’u',
    metrics: state === 'ready' && result ? { 'Przychód (PLN)': result.current.revenue, 'Marża (PLN)': result.current.margin, 'Marketing (PLN)': result.current.marketingSpend, Zamówienia: result.current.orders } : {},
    filters: { Porównanie: comparison }, charts: ['Trend wyniku'], tables: ['Czynniki zmiany'] });
  const decisions =
    data && (!section || section === 'decisions') ? (
      <OverviewDecisions
        decisions={data.decisions}
        onEvidence={(decision) => setDetail({ type: 'decision', decision })}
        onNavigate={onNavigate}
      />
    ) : null;

  return (
    <div className="pd-overview" data-section={section}>
      {!section && (
        <>
          <header className="pd-overview__header">
            <div>
              <h1>Wynik biznesu</h1>
            </div>
            <div className="pd-overview__scope">
              <Popover
                anchorId="overview-date-trigger"
                modal={false}
                open={dateOpen}
                onOpenChange={setDateOpen}
                placement="bottom-end"
                title="Zakres analizy"
                trigger={
                  <Button id="overview-date-trigger" variant="secondary" size="small">
                    <span className="pd-overview__date-label">
                      <Icon decorative name="calendar" size={16} />
                      {overviewRangeLabel(dateRange)}
                      <span aria-hidden="true">⌄</span>
                    </span>
                  </Button>
                }
              >
                <DateRangePicker
                  label="Okres analizy"
                  timezone={dateRange.timezone}
                  value={dateRange}
                  presets={presets}
                  onChange={setDateRange}
                />
                {!validRange && (
                  <p role="alert">Wybierz poprawny okres obejmujący od 1 do 366 dni.</p>
                )}
                <Button
                  variant="primary"
                  size="small"
                  disabled={!validRange}
                  onClick={() => setDateOpen(false)}
                >
                  Gotowe
                </Button>
              </Popover>
              <label className="pd-overview__compare">
                <span className="pd-visually-hidden">Porównanie</span>
                <select
                  aria-label="Porównanie"
                  value={comparison}
                  onChange={(e) => setComparison(e.target.value as OverviewComparison)}
                >
                  <option value="previous_period">vs poprzedni okres</option>
                  <option value="previous_year">vs rok wcześniej</option>
                </select>
              </label>
              <Button
                className="pd-overview__share"
                aria-label="Udostępnij widok"
                variant="ghost"
                size="small"
                onClick={() => void shareView()}
              >
                <span aria-hidden="true">↗</span>
                <span className="pd-overview__share-label">Udostępnij</span>
              </Button>
            </div>
          </header>
          {data?.mode === 'demo' && (
            <p className="pd-overview__demo">
              <span />
              Dane przykładowe · tryb demonstracyjny
            </p>
          )}
          <p className="pd-overview__share-feedback" role="status">
            {shareMessage}
          </p>
        </>
      )}
      {state === 'loading' ? (
        <section className="pd-overview__loading" aria-busy="true" aria-label="Wczytywanie wyniku">
          <span />
          <div>
            {[0, 1, 2, 3].map((key) => (
              <i key={key} />
            ))}
          </div>
          <span />
          <p role="status">Wczytywanie wyniku biznesu…</p>
        </section>
      ) : !data || state === 'error' ? (
        <section className="pd-overview__empty">
          <Icon decorative name="warning" size={24} />
          <h2>Dane przeglądu są niedostępne</h2>
          <p>Nie udało się wczytać wyniku dla tego workspace. Sprawdź stan źródeł danych.</p>
          <div>
            {onRetry && <Button onClick={onRetry}>Spróbuj ponownie</Button>}
            <Button variant="secondary" onClick={() => onNavigate('/app/integrations/sources')}>
              Sprawdź integracje
            </Button>
          </div>
        </section>
      ) : !validRange ? (
        <p className="pd-overview__empty" role="alert">
          Wybierz poprawny okres obejmujący od 1 do 366 dni.
        </p>
      ) : !hasData ? (
        <section className="pd-overview__empty">
          <h2>Brak danych w tym okresie</h2>
          <p>
            Wybrano {overviewRangeLabel(dateRange)}. Zmień zakres lub sprawdź kompletność źródeł.
          </p>
          <Button variant="secondary" onClick={() => setDateOpen(true)}>
            Zmień okres
          </Button>
        </section>
      ) : (
        ready && (
          <>
            {!section && (
              <section className="pd-overview__diagnosis" aria-label="Podsumowanie wyniku">
                <div>
                  <h2>{summary}</h2>
                  <p>
                    {completeComparison
                      ? 'Porównanie: ' + overviewRangeLabel(result.previousRange)
                      : `${result.currentDays} z ${result.expectedDays} dni danych. Niepełnych okresów nie oceniamy kolorem sukcesu.`}{' '}
                    · {data.currency} · {data.timezone}
                  </p>
                </div>
                <button
                  type="button"
                  className="pd-overview__data-link"
                  onClick={() => setDetail({ type: 'data' })}
                >
                  Jakość danych <span aria-hidden="true">→</span>
                </button>
              </section>
            )}
            {(!section || section === 'metrics') && (
              <OverviewMetrics
                result={result}
                onDefinition={(key) => setDetail({ type: 'definition', metric: key })}
              />
            )}
            {isMobile && decisions}
            {(!section || section === 'trend' || section === 'drivers') && (
              <div className="pd-overview__analysis" data-isolated={Boolean(section)}>
                {(!section || section === 'trend') && (
                  <OverviewTrend result={result} metric={metric} onMetricChange={setMetric} />
                )}
                {(!section || section === 'drivers') &&
                  (completeComparison ? (
                    <OverviewDrivers
                      result={result}
                      onDetails={() => setDetail({ type: 'drivers' })}
                    />
                  ) : (
                    <section className="pd-overview__drivers">
                      <h2>Co zmieniło marżę?</h2>
                      <p>Uzupełnij dane obu okresów, aby obliczyć wkłady w zmianę wyniku.</p>
                    </section>
                  ))}
              </div>
            )}
            {!isMobile && decisions}
            {section === 'data' && (
              <OverviewDataHealth sources={data.sources} onNavigate={onNavigate} />
            )}
            {!section && (
              <footer className="pd-overview__footer">
                <span>Marża = sprzedaż netto − koszt produktów − realizacja − marketing</span>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setDetail({ type: 'definition', metric: 'margin' })}
                >
                  Definicje metryk
                </Button>
              </footer>
            )}
          </>
        )
      )}
      <Drawer
        title={title}
        description={
          detail?.type === 'decision'
            ? 'Sprawdź dowody przed podjęciem działania.'
            : 'Definicja i kontekst bieżącej analizy.'
        }
        side="right"
        width={520}
        dismissible
        open={detail !== null}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <div className="pd-overview__evidence">
          {data?.mode === 'demo' && (
            <p className="pd-overview__demo">
              Dane przykładowe — działania nie zmieniają zewnętrznych systemów.
            </p>
          )}
          {detail?.type === 'definition' && (
            <>
              <p>{overviewMetricDefinitions[detail.metric]}</p>
              <dl>
                <div>
                  <dt>Wybrany okres</dt>
                  <dd>{overviewRangeLabel(dateRange)}</dd>
                </div>
                <div>
                  <dt>Waluta / strefa</dt>
                  <dd>
                    {data?.currency} · {dateRange.timezone}
                  </dd>
                </div>
              </dl>
              {result && (
                <p>
                  Wynik:{' '}
                  <strong>
                    {detail.metric === 'newCustomers'
                      ? overviewNumber(result.current[detail.metric])
                      : overviewMoney(result.current[detail.metric])}
                  </strong>
                </p>
              )}
            </>
          )}
          {detail?.type === 'drivers' && result && (
            <>
              <p>
                Rozkład arytmetyczny pokazuje wkład poszczególnych pozycji rachunku w zmianę marży.
                Nie dowodzi przyczyny zmiany zachowania klientów.
              </p>
              <dl>
                <div>
                  <dt>Marża porównania</dt>
                  <dd>{overviewMoney(result.previous.margin)}</dd>
                </div>
                {result.drivers.map((driver) => (
                  <div key={driver.label}>
                    <dt>
                      {driver.label}
                      <small>{driver.explanation}</small>
                    </dt>
                    <dd>{overviewMoney(driver.value)}</dd>
                  </div>
                ))}
                <div>
                  <dt>Marża wybranego okresu</dt>
                  <dd>{overviewMoney(result.current.margin)}</dd>
                </div>
              </dl>
            </>
          )}
          {detail?.type === 'decision' && (
            <>
              <p>{detail.decision.reason}</p>
              <dl>
                {detail.decision.evidence.map((evidence) => (
                  <div key={evidence.label}>
                    <dt>{evidence.label}</dt>
                    <dd>{evidence.value}</dd>
                  </div>
                ))}
              </dl>
              <p>
                <strong>Właściciel:</strong> {detail.decision.owner} · {detail.decision.due}
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  const path = detail.decision.path;
                  setDetail(null);
                  onNavigate(path);
                }}
              >
                Otwórz analizę źródłową →
              </Button>
              <p className="pd-overview__quiet-state">
                Otwarcie analizy nie wykonuje rekomendacji ani nie zmienia budżetu.
              </p>
            </>
          )}
          {detail?.type === 'data' && data && (
            <OverviewDataHealth
              sources={data.sources}
              onNavigate={(path) => {
                setDetail(null);
                onNavigate(path);
              }}
            />
          )}
        </div>
      </Drawer>
    </div>
  );
}
