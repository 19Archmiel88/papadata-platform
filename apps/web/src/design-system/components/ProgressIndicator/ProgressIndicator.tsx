import type {
  CSSProperties,
  HTMLAttributes,
} from 'react';
import {
  forwardRef,
  useId,
} from 'react';

import {
  joinClassNames,
} from '../Field/fieldUtils';
import '../Loading/loading.css';

export type ProgressIndicatorTone =
  | 'critical'
  | 'neutral'
  | 'success'
  | 'warning';

export type ProgressIndicatorProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
> & {
  readonly description?: string | null;
  readonly indeterminate: boolean;
  readonly label: string;
  readonly max: number;
  readonly showValue: boolean;
  readonly tone?: ProgressIndicatorTone;
  readonly value: number | null;
};

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(
    Math.max(value, min),
    max,
  );
}

export const ProgressIndicator = forwardRef<
  HTMLDivElement,
  ProgressIndicatorProps
>(function ProgressIndicator(
  {
    className,
    description = null,
    indeterminate,
    label,
    max,
    showValue,
    style,
    tone = 'neutral',
    value,
    ...props
  },
  ref,
) {
  const labelId = useId();
  const descriptionId = useId();
  const safeMax = max > 0
    ? max
    : 100;
  const safeValue =
    value === null
      ? 0
      : clamp(
          value,
          0,
          safeMax,
        );
  const percentage = Math.round(
    (safeValue / safeMax) * 100,
  );
  const progressStyle = {
    ...style,
    '--pd-progress-value': `${percentage}%`,
  } as CSSProperties;
  const describedBy =
    description
      ? descriptionId
      : undefined;
  const valueLabel = indeterminate
    ? 'W toku'
    : `${percentage}%`;

  return (
    <div
      {...props}
      ref={ref}
      className={joinClassNames(
        'pd-progress-indicator',
        className,
      )}
      data-indeterminate={indeterminate}
      data-tone={tone}
      style={progressStyle}
    >
      <div className="pd-progress-indicator__header">
        <p
          className="pd-progress-indicator__label"
          id={labelId}
        >
          {label}
        </p>
        {showValue ? (
          <span className="pd-progress-indicator__value">
            {valueLabel}
          </span>
        ) : null}
      </div>

      {description ? (
        <p
          className="pd-progress-indicator__description"
          id={descriptionId}
        >
          {description}
        </p>
      ) : null}

      <div
        aria-describedby={describedBy}
        aria-labelledby={labelId}
        aria-valuemax={safeMax}
        aria-valuemin={0}
        aria-valuenow={indeterminate ? undefined : safeValue}
        aria-valuetext={
          indeterminate
            ? `${label}: w toku`
            : `${label}: ${percentage}%`
        }
        className="pd-progress-indicator__track"
        role="progressbar"
      >
        <span
          aria-hidden="true"
          className="pd-progress-indicator__fill"
        />
      </div>
    </div>
  );
});
