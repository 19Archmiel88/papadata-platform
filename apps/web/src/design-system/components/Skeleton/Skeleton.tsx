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

export type SkeletonShape =
  | 'circle'
  | 'rect'
  | 'text';

export type SkeletonProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
> & {
  readonly animated?: boolean;
  readonly height: number | string;
  readonly lines: number;
  readonly shape: SkeletonShape;
  readonly width: number | string;
};

function resolveDimension(
  value: number | string,
) {
  return typeof value === 'number'
    ? `${value}px`
    : value;
}

function resolveLineWidth(
  index: number,
  total: number,
) {
  if (total === 1) {
    return '100%';
  }

  if (index === total - 1) {
    return '72%';
  }

  return index % 2 === 0
    ? '100%'
    : '92%';
}

export const Skeleton = forwardRef<
  HTMLDivElement,
  SkeletonProps
>(function Skeleton(
  {
    animated = true,
    className,
    height,
    lines,
    shape,
    style,
    width,
    ...props
  },
  ref,
) {
  const resolvedHeight = resolveDimension(height);
  const resolvedWidth = resolveDimension(width);
  const lineCount =
    shape === 'text'
      ? Math.max(lines, 1)
      : 1;

  const skeletonStyle = {
    ...style,
    '--pd-skeleton-height': resolvedHeight,
    '--pd-skeleton-width': resolvedWidth,
  } as CSSProperties;

  return (
    <div
      {...props}
      ref={ref}
      aria-hidden="true"
      className={joinClassNames(
        'pd-skeleton',
        className,
      )}
      data-animated={animated}
      data-shape={shape}
      style={skeletonStyle}
    >
      {Array.from({
        length: lineCount,
      }).map((_, index) => {
        const lineStyle =
          shape === 'text'
            ? ({
                width: resolveLineWidth(
                  index,
                  lineCount,
                ),
              } as CSSProperties)
            : ({
                width: resolvedWidth,
                height:
                  shape === 'circle'
                    ? resolvedWidth
                    : resolvedHeight,
              } as CSSProperties);

        return (
          <span
            className="pd-skeleton__line"
            data-shape={shape}
            key={`${shape}-${index}`}
            style={lineStyle}
          />
        );
      })}
    </div>
  );
});
