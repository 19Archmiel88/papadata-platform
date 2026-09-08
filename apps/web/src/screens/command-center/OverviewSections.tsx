import { useId } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '../../design-system';
import {
  overviewChange,
  overviewDayCount,
  overviewMoney,
  overviewNumber,
  overviewRangeLabel,
  overviewShortDate,
} from './CommandCenterScreen.data';
import type {
  CommandCenterScreenData,
  OverviewDecision,
  OverviewMetric,
  OverviewResult,
} from './CommandCenterScreen.model';

export const overviewMetricLabels: Record<OverviewMetric, string> = {
  revenue: 'Sprzedaż netto',
  margin: 'Marża po marketingu',
  marketingSpend: 'Koszt marketingu',
  newCustomers: 'Nowi klienci',
};
export const overviewMetricDefinitions: Record<OverviewMetric, string> = {
  revenue:
    'Wartość sprzedaży po zwrotach, bez VAT. Agregacja dziennych wartości netto w wybranym okresie.',
  margin:
    'Sprzedaż netto pomniejszona o koszt sprzedanych produktów, realizacji zamówień i marketingu. Nie obejmuje pozostałych kosztów stałych firmy.',
  marketingSpend:
    'Wydatki reklamowe ze źródeł marketingowych w wybranym okresie. Sam wzrost kosztu nie jest oceną rentowności.',
  newCustomers:
    'Liczba klientów z pierwszym zakupem w wybranym okresie. Każdy klient jest przypisany do daty pierwszego zakupu.',
};

export function OverviewMetrics({
  result,
  onDefinition,
}: {
  readonly result: OverviewResult;
  readonly onDefinition: (metric: OverviewMetric) => void;
}) {
  const comparable =
    result.currentDays === result.expectedDays &&
    result.previousDays === overviewDayCount(result.previousRange);
  return (
    <section className="pd-overview__metrics" aria-label="Główne wskaźniki">
      {(Object.keys(overviewMetricLabels) as OverviewMetric[]).map((metric) => {
        const change = comparable
          ? overviewChange(result.current[metric], result.previous[metric])
          : null;
        const tone =
          change === null || metric === 'marketingSpend'
            ? 'neutral'
            : change >= 0
              ? 'success'
              : 'danger';
        return (
          <div className="pd-overview__metric" key={metric}>
            <button
              type="button"
              className="pd-overview__metric-label"
              onClick={() => onDefinition(metric)}
              aria-label={`Definicja: ${overviewMetricLabels[metric]}`}
            >
              {overviewMetricLabels[metric]} <span aria-hidden="true">ⓘ</span>
            </button>
            <strong>
              {result.currentDays ? overviewNumber(result.current[metric]) : '—'}
              {metric !== 'newCustomers' && result.currentDays ? <span> zł</span> : null}
            </strong>
            <span className="pd-overview__change" data-tone={tone}>
              {change === null
                ? 'Brak pełnego porównania'
                : `${change >= 0 ? '↑' : '↓'} ${overviewNumber(Math.abs(change), 1)}% vs porównanie`}
            </span>
          </div>
        );
      })}
    </section>
  );
}

export function OverviewTrend({
  result,
  metric,
  onMetricChange,
}: {
  readonly result: OverviewResult;
  readonly metric: OverviewMetric;
  readonly onMetricChange: (metric: OverviewMetric) => void;
}) {
  const titleId = useId();
  const money = metric !== 'newCustomers';
  const unit = money ? 'zł / dzień' : 'osób / dzień';
  const value = (v: number) => (money ? overviewMoney(v) : overviewNumber(v));
  return (
    <section className="pd-overview__trend" aria-labelledby={titleId}>
      <div className="pd-overview__section-heading">
        <div>
          <h2 id={titleId}>Jak zmienia się wynik?</h2>
          <p>
            {overviewMetricLabels[metric]} · {unit}
          </p>
        </div>
        <label className="pd-overview__chart-select">
          <span className="pd-visually-hidden">Miara wykresu</span>
          <select
            aria-label="Miara wykresu"
            value={metric}
            onChange={(e) => onMetricChange(e.target.value as OverviewMetric)}
          >
            {Object.entries(overviewMetricLabels).map(([key, label]) => (
              <option value={key} key={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="pd-overview__legend">
        <span>
          <i />
          Wybrany okres
        </span>
        <span>
          <i data-comparison />
          Porównanie
        </span>
      </div>
      <div
        className="pd-overview__plot"
        role="img"
        aria-label={`${overviewMetricLabels[metric]}: ${overviewRangeLabel(result.range)}; porównanie ${overviewRangeLabel(result.previousRange)}. Tabela wartości poniżej.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={[...result.points]}
            margin={{ top: 12, right: 16, bottom: 4, left: 0 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} stroke="var(--pd-separator)" />
            <XAxis
              dataKey="date"
              tickFormatter={overviewShortDate}
              minTickGap={40}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--pd-text-muted)', fontSize: 12 }}
            />
            <YAxis
              width={50}
              tickFormatter={(v: number) =>
                Math.abs(v) >= 1000 ? `${overviewNumber(v / 1000, 0)} tys.` : overviewNumber(v)
              }
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--pd-text-muted)', fontSize: 12 }}
            />
            <Tooltip
              labelFormatter={(label) => overviewShortDate(String(label))}
              formatter={(v) => (typeof v === 'number' ? value(v) : 'Brak danych')}
              contentStyle={{
                background: 'var(--pd-surface-raised)',
                border: '1px solid var(--pd-separator-strong)',
                borderRadius: 8,
                color: 'var(--pd-text)',
                fontSize: 12,
              }}
            />
            <Line
              name="Porównanie"
              dataKey="previous"
              stroke="var(--pd-data-comparison)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
            <Line
              name="Wybrany okres"
              dataKey="current"
              stroke="var(--pd-data-series-1)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="pd-overview__chart-data">
        <summary>Pokaż dane wykresu</summary>
        <div
          className="pd-overview__table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Wartości wykresu"
        >
          <table>
            <caption>
              {overviewMetricLabels[metric]} · {unit}. Porównanie od{' '}
              {overviewShortDate(result.previousRange.from)}.
            </caption>
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Wybrany okres</th>
                <th scope="col">Porównanie</th>
              </tr>
            </thead>
            <tbody>
              {result.points.map((point) => (
                <tr key={point.date}>
                  <th scope="row">{overviewShortDate(point.date)}</th>
                  <td>{point.current === null ? 'Brak danych' : value(point.current)}</td>
                  <td>{point.previous === null ? 'Brak danych' : value(point.previous)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

export function OverviewDrivers({
  result,
  onDetails,
}: {
  readonly result: OverviewResult;
  readonly onDetails: () => void;
}) {
  return (
    <section className="pd-overview__drivers" aria-labelledby="overview-drivers-title">
      <h2 id="overview-drivers-title">Co zmieniło marżę?</h2>
      <p>Wkład w różnicę względem porównania</p>
      <dl>
        {result.drivers.map((driver) => (
          <div key={driver.label}>
            <dt>{driver.label}</dt>
            <dd data-tone={driver.value >= 0 ? 'success' : 'danger'}>
              {driver.value > 0 ? '+' : ''}
              {overviewMoney(driver.value)}
            </dd>
          </div>
        ))}
      </dl>
      <div className="pd-overview__driver-total">
        <span>Łączna zmiana</span>
        <strong>{overviewMoney(result.current.margin - result.previous.margin)}</strong>
      </div>
      <Button variant="ghost" size="small" onClick={onDetails}>
        Jak obliczamy różnicę <span aria-hidden="true">→</span>
      </Button>
    </section>
  );
}

export function OverviewDecisions({
  decisions,
  onEvidence,
  onNavigate,
}: {
  readonly decisions: readonly OverviewDecision[];
  readonly onEvidence: (decision: OverviewDecision) => void;
  readonly onNavigate: (path: string) => void;
}) {
  return (
    <section className="pd-overview__decisions" aria-labelledby="overview-decisions-title">
      <div className="pd-overview__section-heading">
        <div>
          <h2 id="overview-decisions-title">Decyzje na teraz</h2>
          <p>Bieżące sygnały · każda propozycja wymaga sprawdzenia</p>
        </div>
        <Button
          variant="ghost"
          size="small"
          onClick={() => onNavigate('/app/decisions/centrum-decyzji')}
        >
          Wszystkie decyzje <span aria-hidden="true">→</span>
        </Button>
      </div>
      {decisions.length ? (
        <div className="pd-overview__decision-list">
          <div className="pd-overview__decision-header" aria-hidden="true">
            <span>Priorytet / działanie</span>
            <span>Oczekiwany efekt</span>
            <span>Właściciel / termin</span>
            <span />
          </div>
          {decisions.map((decision, index) => (
            <article className="pd-overview__decision" key={decision.id}>
              <div className="pd-overview__decision-name">
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <h3>{decision.title}</h3>
              </div>
              <p className="pd-overview__decision-effect">{decision.effect}</p>
              <p className="pd-overview__decision-owner">
                {decision.owner}
                <span>{decision.due}</span>
              </p>
              <Button
                variant={index === 0 ? 'secondary' : 'ghost'}
                size="small"
                onClick={() => onEvidence(decision)}
              >
                Sprawdź dowody <span aria-hidden="true">→</span>
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <p className="pd-overview__quiet-state">
          Brak decyzji wymagających uwagi. Sprawdź wynik ponownie po aktualizacji danych.
        </p>
      )}
    </section>
  );
}

export function OverviewDataHealth({
  sources,
  onNavigate,
}: {
  readonly sources: CommandCenterScreenData['sources'];
  readonly onNavigate: (path: string) => void;
}) {
  return (
    <section className="pd-overview__data-health">
      <div className="pd-overview__section-heading">
        <div>
          <h2>Gotowość danych</h2>
          <p>Stan źródeł i ograniczenia analizy</p>
        </div>
        <Button
          variant="ghost"
          size="small"
          onClick={() => onNavigate('/app/integrations/sources')}
        >
          Otwórz integracje →
        </Button>
      </div>
      <ul>
        {sources.map((source) => (
          <li key={source.id}>
            <strong>{source.name}</strong>
            <span data-tone={source.status === 'ready' ? 'neutral' : 'warning'}>
              {source.detail}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
