import {
  useId,
  useState,
} from 'react';
import type {
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  EmptyState,
  VisuallyHidden,
} from '../../../design-system';
import {
  CommandChartTableFallback,
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  formatInteger,
  formatPercent,
  sourceColumns,
} from './commandCenterOnePageModel';

const trafficViewBox = {
  height: 640,
  maxRowGap: 52,
  plotBottom: 520,
  plotLeft: 216,
  plotRight: 900,
  plotTop: 76,
  rowHeight: 20,
  width: 1000,
} as const;
const trafficTopLimit = 8;
const trafficAxisTicks = [0, 0.25, 0.5, 0.75, 1] as const;

const ratioFormatter = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 });
const compactCountFormatter = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1 });

type TrafficChartRow = {
  readonly cumulativeShare: number;
  readonly id: string;
  readonly index: number;
  readonly sessions: number;
  readonly sessionsPerUser: number | null;
  readonly share: number;
  readonly source: string;
  readonly users: number;
};

/**
 * Ordinal color: one hue, monotone lightness by rank — same principle as
 * the funnel/product charts (channels are already sorted by sessions, so
 * "swapping the order would change the meaning"). Reuses --pd-data-actual
 * for a consistent "this color = a real outcome metric" language.
 */
function resolveTrafficStepFill(index: number, total: number): string {
  const ratio = total > 1 ? index / (total - 1) : 0;
  const mixPercent = 100 - ratio * 55;

  return `color-mix(in srgb, var(--pd-data-actual) ${mixPercent.toFixed(1)}%, var(--pd-surface))`;
}

function resolveTrafficTooltipX(x: number): number {
  return x > trafficViewBox.plotRight - 190 ? x - 210 : x + 14;
}

// Same rationale as the product chart's truncateProductLabel: the rank
// gutter and label share a tight column, so long channel names (e.g.
// "Organic Social Media") need a hard cutoff, not just a visual guess.
function truncateChannelLabel(label: string): string {
  return label.length > 18 ? `${label.slice(0, 15)}...` : label;
}

function formatCompactCount(value: number): string {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1_000_000) {
    return `${compactCountFormatter.format(value / 1_000_000)} mln`;
  }

  if (absoluteValue >= 10_000) {
    return `${compactCountFormatter.format(value / 1_000)} tys.`;
  }

  return formatInteger(value);
}

function buildTrafficChartRows(
  sourceRows: readonly DataRow[],
): readonly TrafficChartRow[] {
  const sortedRows = [...sourceRows]
    .map((row) => ({
      id: String(row.id),
      sessions: Number(row.rawSessions ?? 0),
      source: String(row.source ?? ''),
      users: Number(row.rawUsers ?? 0),
    }))
    .sort((left, right) => right.sessions - left.sessions)
    .slice(0, trafficTopLimit);
  const totalSessions = sortedRows.reduce((sum, row) => sum + row.sessions, 0);
  let cumulativeSessions = 0;

  return sortedRows.map((row, index) => {
    cumulativeSessions += row.sessions;
    const share = totalSessions > 0 ? row.sessions / totalSessions : 0;
    const cumulativeShare = totalSessions > 0 ? cumulativeSessions / totalSessions : 0;
    const sessionsPerUser = row.users > 0 ? row.sessions / row.users : null;

    return {
      ...row,
      cumulativeShare,
      index,
      sessionsPerUser,
      share,
    };
  });
}

function resolveTrafficInsight(rows: readonly TrafficChartRow[]): string {
  const leader = rows[0] ?? null;

  if (!leader) {
    return 'Brak źródeł ruchu do analizy w bieżącym zakresie.';
  }

  const topThreeShare = rows.slice(0, 3).reduce((sum, row) => sum + row.share, 0);
  const ratioRows = rows.filter((row) => row.sessionsPerUser !== null);
  const mostEngaged = [...ratioRows]
    .sort((left, right) => (right.sessionsPerUser ?? 0) - (left.sessionsPerUser ?? 0))[0] ?? null;
  const leastEngaged = [...ratioRows]
    .sort((left, right) => (left.sessionsPerUser ?? 0) - (right.sessionsPerUser ?? 0))[0] ?? null;
  const engagementCopy = mostEngaged && leastEngaged && mostEngaged.id !== leastEngaged.id
    ? ` Najwyższe zaangażowanie: ${mostEngaged.source} (${ratioFormatter.format(mostEngaged.sessionsPerUser ?? 0)} sesji/użytkownika), najniższe: ${leastEngaged.source} (${ratioFormatter.format(leastEngaged.sessionsPerUser ?? 0)}).`
    : '';

  return `Top 3 źródeł odpowiada za ${formatPercent(topThreeShare)} sesji top listy. Lider: ${leader.source}, udział ${formatPercent(leader.share)}.${engagementCopy}`;
}

function CommandTrafficChannelsChart({
  sourceRows,
}: {
  readonly sourceRows: readonly DataRow[];
}) {
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const tooltipTitleId = useId();
  const rows = buildTrafficChartRows(sourceRows);
  const activeRow = rows.find((row) => row.id === activeRowId) ?? null;
  const leaderSessions = rows[0]?.sessions ?? 1;
  const plotWidth = trafficViewBox.plotRight - trafficViewBox.plotLeft;
  const plotHeight = trafficViewBox.plotBottom - trafficViewBox.plotTop;
  // Real GA4 channel counts vary a lot more than the top-8 product list does
  // (a store rarely has fewer than 8 products, but plenty of accounts only
  // run 4-6 channel groups) — spacing rows evenly across the fixed plot area
  // instead of a constant gap keeps the chart filled instead of leaving a
  // dead band under the last bar when fewer than trafficTopLimit rows exist.
  // maxRowGap is a floor, not a cap: at the full trafficTopLimit of 8 rows
  // the even split already exceeds it, matching the product chart's density.
  const rowGap = Math.max(trafficViewBox.maxRowGap, plotHeight / Math.max(rows.length, 1));
  const scaleX = (value: number) => (
    trafficViewBox.plotLeft
    + plotWidth * Math.max(0, Math.min(1, value / Math.max(leaderSessions, 1)))
  );

  function resolveRowY(index: number): number {
    return trafficViewBox.plotTop + index * rowGap;
  }

  const topThreeShare = rows.slice(0, 3).reduce((sum, row) => sum + row.share, 0);
  const totalSessions = rows.reduce((sum, row) => sum + row.sessions, 0);
  const totalUsers = rows.reduce((sum, row) => sum + row.users, 0);
  const overallSessionsPerUser = totalUsers > 0 ? totalSessions / totalUsers : null;
  const metrics = [
    {
      detail: 'suma źródeł widocznych na wykresie',
      label: 'Sesje top listy',
      tone: 'leader',
      value: formatInteger(totalSessions),
    },
    {
      detail: 'koncentracja ruchu',
      label: 'Udział TOP 3',
      tone: topThreeShare >= 0.7 ? 'warning' : 'neutral',
      value: formatPercent(topThreeShare),
    },
    {
      detail: 'użytkownicy w top liście',
      label: 'Łączna liczba użytkowników',
      tone: 'neutral',
      value: formatInteger(totalUsers),
    },
    {
      detail: 'sesje przypadające na użytkownika',
      label: 'Śr. sesji/użytkownika',
      tone: 'neutral',
      value: overallSessionsPerUser === null ? '—' : ratioFormatter.format(overallSessionsPerUser),
    },
  ] as const;

  return (
    <div
      aria-label="Analityka kanałów ruchu: sesje, użytkownicy i zaangażowanie"
      className="pd-command-traffic-visual"
      role="group"
    >
      <svg
        aria-hidden="true"
        className="pd-command-traffic-chart"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${trafficViewBox.width} ${trafficViewBox.height}`}
      >
        <rect
          className="pd-command-traffic-chart__plot-bg"
          height={plotHeight + 74}
          width={plotWidth}
          x={trafficViewBox.plotLeft}
          y={trafficViewBox.plotTop - 36}
        />

        {trafficAxisTicks.map((tick) => {
          const x = trafficViewBox.plotLeft + plotWidth * tick;

          return (
            <g key={`traffic-axis-${tick}`}>
              <line
                className="pd-command-traffic-chart__grid-line"
                x1={x}
                x2={x}
                y1={trafficViewBox.plotTop - 24}
                y2={trafficViewBox.plotBottom + 26}
              />
              <text
                className="pd-command-traffic-chart__axis-value"
                textAnchor="middle"
                x={x}
                y={trafficViewBox.plotBottom + 52}
              >
                {formatCompactCount(leaderSessions * tick)}
              </text>
            </g>
          );
        })}

        <text
          className="pd-command-traffic-chart__axis-title"
          x={trafficViewBox.plotLeft}
          y={trafficViewBox.plotTop - 56}
        >
          Sesje źródła
        </text>

        {rows.map((row, index) => {
          const y = resolveRowY(index);
          const barWidth = Math.max(scaleX(row.sessions) - trafficViewBox.plotLeft, 4);
          const ratioLabel = row.sessionsPerUser === null ? '—' : ratioFormatter.format(row.sessionsPerUser);

          return (
            <g key={row.id}>
              <text
                className="pd-command-traffic-chart__rank"
                textAnchor="end"
                x={trafficViewBox.plotLeft - 162}
                y={y + 15}
              >
                {String(row.index + 1).padStart(2, '0')}
              </text>
              <text
                className="pd-command-traffic-chart__source-label"
                textAnchor="end"
                x={trafficViewBox.plotLeft - 18}
                y={y + 15}
              >
                {truncateChannelLabel(row.source)}
              </text>
              <rect
                className="pd-command-traffic-chart__track"
                height={trafficViewBox.rowHeight}
                rx="6"
                width={plotWidth}
                x={trafficViewBox.plotLeft}
                y={y}
              />
              <rect
                className="pd-command-traffic-chart__bar"
                height={trafficViewBox.rowHeight}
                rx="6"
                style={{ fill: resolveTrafficStepFill(index, rows.length) }}
                width={barWidth}
                x={trafficViewBox.plotLeft}
                y={y}
              />
              <text
                className="pd-command-traffic-chart__value"
                x={trafficViewBox.plotLeft + barWidth + 12}
                y={y + 15}
              >
                {formatInteger(row.sessions)} sesji · {formatPercent(row.share)}
              </text>
              <text
                className="pd-command-traffic-chart__row-meta"
                x={trafficViewBox.plotLeft}
                y={y + 41}
              >
                {formatInteger(row.users)} użytk. · {ratioLabel} sesji/użytk. · skum. {formatPercent(row.cumulativeShare)}
              </text>

              {/* Mouse-only hit target — the whole chart is aria-hidden (the
                  real data lives in the always-reachable "Pokaż dane" table),
                  so a tab-focusable descendant here would be the
                  focusable-but-hidden anti-pattern, not an improvement. */}
              <rect
                className="pd-command-traffic-chart__hit-area"
                height={trafficViewBox.rowHeight + 26}
                width={plotWidth}
                x={trafficViewBox.plotLeft}
                y={y - 20}
                onMouseEnter={() => setActiveRowId(row.id)}
                onMouseLeave={() => setActiveRowId((current) => (current === row.id ? null : current))}
              />
            </g>
          );
        })}

        {activeRow ? (
          <g
            className="pd-command-traffic-chart__tooltip"
            transform={`translate(${resolveTrafficTooltipX(scaleX(activeRow.sessions))}, ${resolveRowY(activeRow.index) - 8})`}
          >
            <rect
              aria-labelledby={tooltipTitleId}
              height="112"
              rx="9"
              width="212"
            />
            <text
              className="pd-command-traffic-chart__tooltip-title"
              id={tooltipTitleId}
              x="14"
              y="22"
            >
              {activeRow.source}
            </text>
            <text
              className="pd-command-traffic-chart__tooltip-value"
              x="14"
              y="42"
            >
              {formatInteger(activeRow.sessions)} sesji
            </text>
            <text
              className="pd-command-traffic-chart__tooltip-detail"
              x="14"
              y="61"
            >
              Udział: {formatPercent(activeRow.share)} · skumulowany {formatPercent(activeRow.cumulativeShare)}
            </text>
            <text
              className="pd-command-traffic-chart__tooltip-detail"
              x="14"
              y="79"
            >
              {formatInteger(activeRow.users)} użytkowników · {activeRow.sessionsPerUser === null ? '—' : ratioFormatter.format(activeRow.sessionsPerUser)} sesji/użytk.
            </text>
          </g>
        ) : null}
      </svg>

      <ul className="pd-command-traffic-visual__metrics">
        {metrics.map((metric) => (
          <li
            data-tone={metric.tone}
            key={metric.label}
          >
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </li>
        ))}
      </ul>

      <p className="pd-command-traffic-visual__insight">
        {resolveTrafficInsight(rows)}
      </p>
    </div>
  );
}

export function CommandCenterTrafficSourcesSection({
  sourceRows,
}: {
  readonly sourceRows: readonly DataRow[];
}) {
  return (
    <section
      aria-labelledby="command-center-traffic-sources-title"
      className="pd-command-center-one-page__section"
    >
      <VisuallyHidden as="div">
        <CommandSectionHeader
          description="Ranking kanałów według sesji i użytkowników z GA4. Przychód per kanał nie jest jeszcze pokazywany: wymagałby łączenia dwóch różnych wymiarów atrybucji GA4, co ryzykowałoby błędne przypisanie konwersji do kanału."
          eyebrow="Źródła"
          title="Kanały ruchu"
          titleId="command-center-traffic-sources-title"
        />
      </VisuallyHidden>
      {sourceRows.length === 0 ? (
        <EmptyState
          message="Kontrakt Centrum Dowodzenia nie dostarcza jeszcze podziału ruchu na źródła dla wybranego zakresu."
          title="Brak podziału na źródła ruchu"
          variant="configuration"
        />
      ) : (
        <>
          <CommandTrafficChannelsChart sourceRows={sourceRows} />

          <CommandChartTableFallback
            ariaLabel="Źródła ruchu: sesje i użytkownicy"
            columns={sourceColumns}
            emptyMessage="Brak źródeł ruchu."
            minWidth={640}
            rows={sourceRows}
            sortColumnId="sessions"
          />
        </>
      )}
    </section>
  );
}
