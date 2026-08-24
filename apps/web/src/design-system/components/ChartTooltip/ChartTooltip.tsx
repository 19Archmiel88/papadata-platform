import type {
  ReactNode,
} from 'react';
import type {
  TooltipContentProps,
  TooltipPayloadEntry,
} from 'recharts';

import './chart-tooltip.css';

function resolveEntryColor(entry: TooltipPayloadEntry): string | undefined {
  return entry.color ?? entry.stroke ?? entry.fill;
}

function resolveEntryDataKey(entry: TooltipPayloadEntry): string | undefined {
  return typeof entry.dataKey === 'string' ? entry.dataKey : undefined;
}

function ChartTooltipRow({
  color,
  detail,
  name,
  value,
}: {
  readonly color: string | undefined;
  readonly detail?: ReactNode;
  readonly name: ReactNode;
  readonly value: ReactNode;
}) {
  return (
    <div className="pd-chart-tooltip__row">
      <span className="pd-chart-tooltip__label">
        <span
          className="pd-chart-tooltip__key"
          style={color ? { background: color } : undefined}
        />
        {name}
      </span>
      <strong className="pd-chart-tooltip__value">{value}</strong>
      {detail ? <span className="pd-chart-tooltip__detail">{detail}</span> : null}
    </div>
  );
}

export type ChartCrosshairTooltipProps = TooltipContentProps & {
  readonly isSeriesVisible?: (dataKey: string) => boolean;
  readonly valueFormatter: (value: number) => string;
};

/** Line/area charts: every currently-visible series at the hovered X, one row each. */
export function ChartCrosshairTooltip({
  active,
  isSeriesVisible,
  label,
  payload,
  valueFormatter,
}: ChartCrosshairTooltipProps): ReactNode {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const rows = payload.filter((entry) => {
    if (typeof entry.value !== 'number') {
      return false;
    }

    // A stroke="none" Area is a decorative fill riding under a Line with the
    // same dataKey (the gradient-wash pattern) — real recharts item, but not
    // a second series a reader should see a second tooltip row for.
    if (entry.stroke === 'none') {
      return false;
    }

    const dataKey = resolveEntryDataKey(entry);

    return dataKey === undefined || !isSeriesVisible || isSeriesVisible(dataKey);
  });

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="pd-chart-tooltip" role="status">
      {label !== undefined ? <div className="pd-chart-tooltip__heading">{label}</div> : null}
      {rows.map((entry) => (
        <ChartTooltipRow
          color={resolveEntryColor(entry)}
          key={resolveEntryDataKey(entry) ?? String(entry.name)}
          name={entry.name}
          value={valueFormatter(entry.value as number)}
        />
      ))}
    </div>
  );
}

export type ChartMarkTooltipProps = TooltipContentProps & {
  readonly detail?: (entry: TooltipPayloadEntry) => ReactNode;
  readonly valueFormatter: (value: number) => string;
};

/** Bar/pie/scatter charts: just the hovered mark — the mark itself is the hit target, no crosshair. */
export function ChartMarkTooltip({
  active,
  detail,
  payload,
  valueFormatter,
}: ChartMarkTooltipProps): ReactNode {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const entry = payload[0]!;

  if (typeof entry.value !== 'number') {
    return null;
  }

  return (
    <div className="pd-chart-tooltip" role="status">
      <ChartTooltipRow
        color={resolveEntryColor(entry)}
        detail={detail ? detail(entry) : null}
        name={entry.name}
        value={valueFormatter(entry.value)}
      />
    </div>
  );
}
