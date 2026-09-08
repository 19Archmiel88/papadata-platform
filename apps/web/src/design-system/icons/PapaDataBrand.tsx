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
      <path fill="var(--pd-interactive)" fillRule="evenodd" d="M18 12h34c20 0 32 11 32 29S72 70 52 70H38v18H18V12Zm20 18v22h14c9 0 13-4 13-11s-4-11-13-11H38Z" />
      <path fill="var(--pd-brand-mark-detail)" d="m18 67 20-11v14L18 81V67Z" />
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
