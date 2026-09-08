import { useState } from 'react';
import { Button } from '../../design-system/components/Button';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import { reportDate, reportNumber } from './SavedReports.build';
import type { ReportConfig, ReportSnapshot } from './SavedReports.model';

export function ReportDocument({
  config,
  snapshot,
  preview = false,
}: {
  config: ReportConfig;
  snapshot: ReportSnapshot;
  preview?: boolean;
}) {
  const go = useShellNavigate(),
    [limit, setLimit] = useState(20);
  const values = snapshot.series.flatMap((p) => (p.value === null ? [] : [p.value])),
    min = Math.min(0, ...values),
    max = Math.max(1, ...values),
    span = max - min || 1;
  const x = (i: number) => 56 + (i * 704) / Math.max(1, snapshot.series.length - 1),
    y = (v: number) => 174 - ((v - min) * 144) / span;
  const segments: string[] = [];
  let current = '';
  snapshot.series.forEach((p, i) => {
    if (p.value === null) {
      if (current) segments.push(current);
      current = '';
    } else current += `${current ? ' L' : 'M'}${x(i)},${y(p.value)}`;
  });
  if (current) segments.push(current);
  const quality = {
    complete: 'Zakres kompletny',
    partial: 'Wynik z ograniczeniami',
    empty: 'Brak obserwacji w tym zakresie',
  }[snapshot.quality];
  return (
    <article
      className="pd-reports-document"
      aria-label={preview ? 'Podgląd raportu' : 'Zapisany raport'}
    >
      <header className="pd-reports-document__head">
        <div className="pd-reports-eyebrow">
          PAPADATA / {preview ? 'PODGLĄD RAPORTU' : 'ZAPISANY WYNIK'}
        </div>
        <h2>{config.title || 'Raport bez tytułu'}</h2>
        {config.question && <p className="pd-reports-question">{config.question}</p>}
        <div className="pd-reports-document__scope">
          <span>{snapshot.scopeLabel}</span>
          <span
            className="pd-reports-tag"
            data-tone={snapshot.quality === 'complete' ? 'success' : 'warning'}
          >
            {quality}
          </span>
        </div>
      </header>
      <div className="pd-reports-metrics">
        {snapshot.metrics.map((m) => (
          <div className="pd-reports-metric" key={m.id}>
            <span>{m.label}</span>
            <strong>{reportNumber(m.value, m.unit)}</strong>
            <details>
              <summary>Jak liczymy</summary>
              <p>{m.definition}</p>
            </details>
          </div>
        ))}
      </div>
      {config.chart !== 'none' && values.length > 0 && (
        <section className="pd-reports-section">
          <div className="pd-reports-section__heading">
            <h3>{snapshot.seriesMetric}</h3>
            <span>Obserwacje dzienne</span>
          </div>
          <svg
            className="pd-reports-chart"
            viewBox="0 0 800 210"
            role="img"
            aria-label={`${snapshot.seriesMetric}. ${values.length} dostępnych obserwacji. Wartości w tabeli dziennej poniżej.`}
          >
            {[min, (min + max) / 2, max].map((v, i) => (
              <g key={i}>
                <line x1="56" x2="760" y1={y(v)} y2={y(v)} className="pd-reports-chart__grid" />
                <text x="48" y={y(v) + 4} textAnchor="end">
                  {Math.abs(v) >= 1000 ? `${Math.round(v / 1000)} tys.` : Math.round(v)}
                </text>
              </g>
            ))}
            {config.chart === 'bar'
              ? snapshot.series.map(
                  (p, i) =>
                    p.value !== null && (
                      <rect
                        key={p.date}
                        x={x(i) - Math.min(12, 270 / snapshot.series.length)}
                        y={Math.min(y(0), y(p.value))}
                        width={Math.min(24, 540 / snapshot.series.length)}
                        height={Math.max(1, Math.abs(y(p.value) - y(0)))}
                        className="pd-reports-chart__bar"
                      />
                    ),
                )
              : segments.map((d, i) => <path key={i} d={d} className="pd-reports-chart__line" />)}
            {snapshot.series.length === 1 && snapshot.series[0].value !== null && (
              <circle
                cx={x(0)}
                cy={y(snapshot.series[0].value)}
                r="4"
                className="pd-reports-chart__bar"
              />
            )}
            <text x="56" y="204">
              {snapshot.series[0]?.date}
            </text>
            <text x="760" y="204" textAnchor="end">
              {snapshot.series.at(-1)?.date}
            </text>
          </svg>
          <details className="pd-reports-daily">
            <summary>Otwórz dane wykresu ({snapshot.series.length} dni)</summary>
            <div
              className="pd-reports-table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Dane dzienne wykresu"
            >
              <table>
                <thead>
                  <tr>
                    <th scope="col">Dzień</th>
                    <th scope="col">{snapshot.seriesMetric}</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.series.map((p) => (
                    <tr key={p.date}>
                      <td>{p.date}</td>
                      <td>{reportNumber(p.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
      )}
      {config.notes && (
        <section className="pd-reports-note">
          <span className="pd-reports-eyebrow">KOMENTARZ AUTORA</span>
          <p>{config.notes}</p>
        </section>
      )}
      <section className="pd-reports-section">
        <div className="pd-reports-section__heading">
          <h3>Dane raportu</h3>
          <span>
            {snapshot.rows.length} {snapshot.rows.length === 1 ? 'wiersz' : 'wierszy'} · brak
            danych: —
          </span>
        </div>
        {snapshot.rows.length ? (
          <>
            <div
              className="pd-reports-table-scroll"
              role="region"
              aria-label="Tabela danych raportu"
              tabIndex={0}
            >
              <table>
                <thead>
                  <tr>
                    {snapshot.columns.map((c) => (
                      <th scope="col" key={c.id}>
                        {c.label}
                        {c.unit && <small>{c.unit}</small>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {snapshot.rows.slice(0, limit).map((r) => (
                    <tr key={r.id}>
                      {snapshot.columns.map((c) => (
                        <td key={c.id} data-numeric={typeof r.values[c.id] === 'number'}>
                          {typeof r.values[c.id] === 'number'
                            ? reportNumber(r.values[c.id] as number)
                            : (r.values[c.id] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {limit < snapshot.rows.length && (
              <Button variant="ghost" onClick={() => setLimit((n) => n + 50)}>
                Pokaż kolejne wiersze ({Math.min(limit, snapshot.rows.length)} z{' '}
                {snapshot.rows.length})
              </Button>
            )}
          </>
        ) : (
          <p className="pd-reports-muted">
            W tym okresie i filtrze źródło nie zawiera obserwacji. Braków nie zastępujemy zerami.
          </p>
        )}
      </section>
      <section className="pd-reports-section pd-reports-sources">
        <h3>Źródła i ograniczenia</h3>
        {snapshot.sources.map((s) => (
          <div key={s.id} className="pd-reports-source">
            <div>
              <strong>{s.label}</strong>
              <p>{s.detail}</p>
            </div>
            {s.path && (
              <Button variant="ghost" onClick={() => go(s.path!)}>
                Otwórz źródło ↗
              </Button>
            )}
          </div>
        ))}
        {snapshot.limitations.length > 0 && (
          <ul>
            {snapshot.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        )}
        <p className="pd-reports-footnote">
          {snapshot.mode === 'demo' ? 'Dane przykładowe' : 'Dane produkcyjne'} · przeliczono{' '}
          {reportDate(snapshot.generatedAt)} · {snapshot.timezone}. Zapisany wynik nie zmienia się
          wraz z filtrami strony.
        </p>
      </section>
    </article>
  );
}
