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
import {
  PapaDataBrand,
} from '../../icons';
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
  const spinnerStyle = {
    ...style,
    '--pd-spinner-size': `${size}px`,
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
      role="status"
      style={spinnerStyle}
    >
      <span
        aria-hidden="true"
        className="pd-spinner__glyph"
      >
        <PapaDataBrand
          decorative
          variant="mark"
        />
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
