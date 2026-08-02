import type {
  HTMLAttributes,
  ReactNode,
} from 'react';
import {
  forwardRef,
} from 'react';

import {
  joinClassNames,
} from '../Field/fieldUtils';
import '../Filters/filters.css';

export type ToolbarProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
> & {
  readonly compact?: boolean;
  readonly description?: string | null;
  readonly end?: ReactNode;
  readonly start?: ReactNode;
  readonly title?: string | null;
};

export const Toolbar = forwardRef<
  HTMLDivElement,
  ToolbarProps
>(function Toolbar(
  {
    className,
    compact = false,
    description = null,
    end = null,
    start = null,
    title = null,
    ...props
  },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={joinClassNames(
        'pd-toolbar',
        className,
      )}
      data-compact={compact ? true : undefined}
    >
      {title || description ? (
        <div className="pd-toolbar__meta">
          {title ? (
            <p className="pd-toolbar__title">
              {title}
            </p>
          ) : null}
          {description ? (
            <p className="pd-toolbar__description">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="pd-toolbar__bar">
        <div className="pd-toolbar__start">
          {start}
        </div>
        <div className="pd-toolbar__end">
          {end}
        </div>
      </div>
    </div>
  );
});
