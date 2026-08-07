import type {
  HTMLAttributes,
} from 'react';
import {
  forwardRef,
  memo,
} from 'react';

import './papa-data-brand.css';

export type PapaDataBrandSize =
  | 'small'
  | 'medium'
  | 'large';

export type PapaDataBrandVariant =
  | 'lockup'
  | 'mark'
  | 'wordmark'
  | 'decorative';

export type PapaDataBrandProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  | 'aria-hidden'
  | 'aria-label'
  | 'aria-labelledby'
  | 'children'
  | 'role'
> & {
  readonly decorative?: boolean;
  readonly label?: string;
  readonly showMark?: boolean;
  readonly showWordmark?: boolean;
  readonly size?: PapaDataBrandSize;
  readonly variant?: PapaDataBrandVariant;
};

function PapaDataBrandMark() {
  return (
    <svg
      aria-hidden="true"
      className="pd-brand-lockup__mark"
      focusable="false"
      viewBox="0 0 100 100"
    >
      <path
        className="svg-stroke-layer"
        d="M50 55 L85 72.5 L50 90 L15 72.5 Z"
        fill="var(--brand-logo-base-fill)"
        stroke="var(--brand-logo-base-stroke)"
        strokeLinejoin="round"
      />
      <path
        className="svg-stroke-layer"
        d="M50 35 L85 52.5 L50 70 L15 52.5 Z"
        fill="var(--brand-logo-mid-fill)"
        stroke="var(--pd-brand-line)"
        strokeLinejoin="round"
      />
      <path
        className="svg-stroke-layer"
        d="M50 15 L85 32.5 L50 50 L15 32.5 Z"
        fill="var(--pd-brand)"
        stroke="var(--pd-brand)"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PapaDataWordmark() {
  return (
    <span
      aria-hidden="true"
      className="pd-brand-lockup__wordmark font-inter"
    >
      <span className="pd-brand-lockup__wordmark-prefix">
        Papa
      </span>
      <span className="pd-brand-lockup__wordmark-suffix pd-text-brand">
        Data
      </span>
    </span>
  );
}

function getDefaultLabel({
  showMark,
  showWordmark,
}: {
  readonly showMark: boolean;
  readonly showWordmark: boolean;
}) {
  if (showMark && showWordmark) {
    return 'PapaData logo';
  }

  if (showMark) {
    return 'PapaData sygnet';
  }

  if (showWordmark) {
    return 'PapaData logotyp';
  }

  return 'PapaData';
}

export const PapaDataBrand = memo(
  forwardRef<HTMLSpanElement, PapaDataBrandProps>(
    function PapaDataBrand(
      {
        className,
        decorative = false,
        label,
        showMark = true,
        showWordmark = true,
        size = 'medium',
        variant = 'lockup',
        ...props
      },
      ref,
    ) {
      const resolvedShowMark =
        variant === 'wordmark'
          ? false
          : variant === 'mark' || variant === 'decorative'
            ? true
            : showMark;
      const resolvedShowWordmark =
        variant === 'mark'
          ? false
          : variant === 'wordmark' || variant === 'decorative'
            ? true
            : showWordmark;
      const isDecorative =
        decorative || variant === 'decorative';
      const resolvedLabel =
        label
        ?? getDefaultLabel({
          showMark: resolvedShowMark,
          showWordmark: resolvedShowWordmark,
        });
      const isInformative =
        !isDecorative && resolvedLabel.trim().length > 0;
      const rootClassName = [
        'pd-lockup',
        'pd-brand-lockup',
        `pd-brand-lockup--${size}`,
        `pd-brand-lockup--${variant}`,
        resolvedShowMark && !resolvedShowWordmark
          ? 'pd-lockup--mark-only pd-brand-lockup--mark-only'
          : null,
        !resolvedShowMark && resolvedShowWordmark
          ? 'pd-lockup--wordmark-only pd-brand-lockup--wordmark-only'
          : null,
        isDecorative ? 'pd-brand-lockup--decorative' : null,
        className,
      ]
        .filter(Boolean)
        .join(' ');

      return (
        <span
          {...props}
          ref={ref}
          aria-hidden={isInformative ? undefined : true}
          aria-label={isInformative ? resolvedLabel : undefined}
          className={rootClassName}
          data-decorative={isDecorative ? true : undefined}
          data-size={size}
          data-variant={variant}
          role={isInformative ? 'img' : undefined}
          tabIndex={undefined}
        >
          {resolvedShowMark ? <PapaDataBrandMark /> : null}
          {resolvedShowWordmark ? <PapaDataWordmark /> : null}
        </span>
      );
    },
  ),
);

PapaDataBrand.displayName = 'PapaDataBrand';
