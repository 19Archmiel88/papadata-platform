import type {
  CSSProperties,
  HTMLAttributes,
} from 'react';

import {
  joinClassNames,
} from '../Field/fieldUtils';
import './chart-legend.css';

export type ChartLegendSwatch = 'line' | 'square';

export type ChartLegendLineStyle =
  | 'solid'
  | 'dashed'
  | 'dotted';

export type ChartLegendItem = {
  readonly color?: string;
  readonly disabled?: boolean;
  readonly id: string;
  readonly label: string;
  readonly lineStyle?: ChartLegendLineStyle;
  readonly readonly?: boolean;
  readonly swatch?: ChartLegendSwatch;
  readonly valueLabel?: string | null;
};

export type ChartLegendProps = Omit<
  HTMLAttributes<HTMLOListElement>,
  | 'children'
  | 'onToggle'
> & {
  readonly ariaLabel: string;
  readonly isVisible?: (id: string) => boolean;
  readonly items: readonly ChartLegendItem[];
  readonly onToggle?: (id: string) => void;
  readonly size?: 'default' | 'compact';
};

function buildSwatchStyle(color: string | undefined): CSSProperties | undefined {
  if (!color) {
    return undefined;
  }

  return {
    '--pd-chart-legend-color': color,
  } as CSSProperties;
}

export function ChartLegend({
  ariaLabel,
  className,
  isVisible,
  items,
  onToggle,
  size = 'default',
  ...props
}: ChartLegendProps) {
  return (
    <ol
      {...props}
      aria-label={ariaLabel}
      className={joinClassNames(
        'pd-chart-legend',
        className,
      )}
      data-size={size}
    >
      {items.map((item) => {
        const visible = isVisible?.(item.id) ?? true;
        const interactive = Boolean(onToggle) && !item.readonly && !item.disabled;
        const content = (
          <>
            <span
              aria-hidden="true"
              className="pd-chart-legend__swatch"
              data-line-style={item.lineStyle ?? 'solid'}
              data-swatch={item.swatch ?? 'line'}
              style={buildSwatchStyle(item.color)}
            />
            <span className="pd-chart-legend__label">{item.label}</span>
            {item.valueLabel ? (
              <span className="pd-chart-legend__value">{item.valueLabel}</span>
            ) : null}
          </>
        );

        return (
          <li
            data-active={visible ? undefined : 'false'}
            data-disabled={item.disabled ? 'true' : undefined}
            data-readonly={item.readonly ? 'true' : undefined}
            key={item.id}
          >
            {interactive ? (
              <button
                aria-pressed={visible}
                disabled={item.disabled}
                onClick={() => onToggle?.(item.id)}
                type="button"
              >
                {content}
              </button>
            ) : (
              <span className="pd-chart-legend__static">
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
