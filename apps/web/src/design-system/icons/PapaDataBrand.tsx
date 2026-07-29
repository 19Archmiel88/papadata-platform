import type {
  HTMLAttributes,
} from 'react';

import './papa-data-brand.css';

export type PapaDataBrandSize =
  | 'small'
  | 'medium'
  | 'large';

export type PapaDataBrandProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children'
> & {
  readonly glow?: boolean;
  readonly label?: string;
  readonly showMark?: boolean;
  readonly showWordmark?: boolean;
  readonly size?: PapaDataBrandSize;
};

export function PapaDataBrand({
  className,
  glow = false,
  label = 'PapaData',
  showMark = true,
  showWordmark = true,
  size = 'medium',
  ...props
}: PapaDataBrandProps) {
  const rootClassName = [
    'pd-brand-lockup',
    `pd-brand-lockup--${size}`,
    glow ? 'pd-brand-lockup--glow' : null,
    !showMark ? 'pd-brand-lockup--wordmark-only' : null,
    !showWordmark ? 'pd-brand-lockup--mark-only' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      aria-label={label}
      className={rootClassName}
      role="img"
      {...props}
    >
      {showMark ? (
        <svg
          aria-hidden="true"
          className="pd-brand-lockup__mark"
          focusable="false"
          viewBox="0 0 72 72"
        >
          <path
            className="pd-brand-lockup__p"
            d="M13 61V11H37.5C52.5 11 61 19.2 61 31C61 42.8 52.5 51 37.5 51H27"
          />

          <path
            className="pd-brand-lockup__d"
            d="M29 21V41H37.5C45.7 41 50.5 37.2 50.5 31C50.5 24.8 45.7 21 37.5 21H29Z"
          />

          <g
            aria-hidden="true"
            className="pd-brand-lockup__bars"
          >
            <path
              className="pd-brand-lockup__bar-front pd-brand-lockup__bar-front--one"
              d="M27 57L34 53V64L27 68V57Z"
            />
            <path
              className="pd-brand-lockup__bar-top pd-brand-lockup__bar-top--one"
              d="M27 57L31 55L38 59L34 61L27 57Z"
            />
            <path
              className="pd-brand-lockup__bar-side pd-brand-lockup__bar-side--one"
              d="M34 61L38 59V64L34 66V61Z"
            />

            <path
              className="pd-brand-lockup__bar-front pd-brand-lockup__bar-front--two"
              d="M38 52L45 48V64L38 68V52Z"
            />
            <path
              className="pd-brand-lockup__bar-top pd-brand-lockup__bar-top--two"
              d="M38 52L42 50L49 54L45 56L38 52Z"
            />
            <path
              className="pd-brand-lockup__bar-side pd-brand-lockup__bar-side--two"
              d="M45 56L49 54V64L45 66V56Z"
            />

            <path
              className="pd-brand-lockup__bar-front pd-brand-lockup__bar-front--three"
              d="M49 46L56 42V64L49 68V46Z"
            />
            <path
              className="pd-brand-lockup__bar-top pd-brand-lockup__bar-top--three"
              d="M49 46L53 44L60 48L56 50L49 46Z"
            />
            <path
              className="pd-brand-lockup__bar-side pd-brand-lockup__bar-side--three"
              d="M56 50L60 48V64L56 66V50Z"
            />
          </g>
        </svg>
      ) : null}

      {showWordmark ? (
        <span
          aria-hidden="true"
          className="pd-brand-lockup__wordmark"
        >
          <span>Papa</span>
          <span>Data</span>
        </span>
      ) : null}
    </span>
  );
}
