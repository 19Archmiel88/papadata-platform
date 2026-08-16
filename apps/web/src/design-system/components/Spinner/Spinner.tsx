import type {
  CSSProperties,
  HTMLAttributes,
} from 'react';
import {
  forwardRef,
} from 'react';

import {
  joinClassNames,
} from '../Field/fieldUtils';
import '../Loading/loading.css';

export type SpinnerProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  | 'children'
> & {
  readonly delayMs: number;
  readonly inline?: boolean;
  readonly label: string;
  readonly showLabel?: boolean;
  readonly size: number;
};

export const Spinner = forwardRef<
  HTMLSpanElement,
  SpinnerProps
>(function Spinner(
  {
    className,
    delayMs,
    inline = true,
    label,
    showLabel = false,
    size,
    style,
    ...props
  },
  ref,
) {
  const normalizedSize = Math.max(size, 12);
  const spinnerStyle = {
    ...style,
    '--pd-spinner-size': `${normalizedSize}px`,
    '--pd-spinner-delay': `${Math.max(delayMs, 0)}ms`,
  } as CSSProperties;

  return (
    <span
      {...props}
      ref={ref}
      aria-atomic="true"
      aria-live="polite"
      className={joinClassNames(
        'pd-spinner',
        className,
      )}
      data-inline={inline}
      data-show-label={showLabel ? 'true' : undefined}
      role="status"
      style={spinnerStyle}
    >
      <span
        aria-hidden="true"
        className="pd-spinner__glyph"
      >
        <span className="pd-spinner__ring" />
      </span>
      <span
        className={joinClassNames(
          'pd-spinner__label',
          showLabel ? null : 'pd-visually-hidden',
        )}
      >
        {label}
      </span>
    </span>
  );
});
