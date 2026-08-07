import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import {
  forwardRef,
} from 'react';

import './button.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger';

export type ButtonSize =
  | 'small'
  | 'medium'
  | 'large';

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'aria-busy'
  | 'children'
> & {
  readonly children: ReactNode;
  readonly endIcon?: ReactNode;
  readonly fullWidth?: boolean;
  readonly loading?: boolean;
  readonly loadingLabel?: string;
  readonly size?: ButtonSize;
  readonly startIcon?: ReactNode;
  readonly variant?: ButtonVariant;
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function Button(
  {
    children,
    className,
    disabled = false,
    endIcon,
    fullWidth = false,
    loading = false,
    loadingLabel,
    size = 'medium',
    startIcon,
    type = 'button',
    variant = 'primary',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const rootClassName = [
    'pd-button',
    `pd-button--${variant}`,
    `pd-button--${size}`,
    fullWidth ? 'pd-button--full-width' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const content = loading && loadingLabel
    ? loadingLabel
    : children;

  return (
    <button
      {...props}
      ref={ref}
      aria-busy={loading ? true : undefined}
      className={rootClassName}
      data-disabled={isDisabled ? true : undefined}
      data-full-width={fullWidth ? true : undefined}
      data-interactive-tone={
        variant === 'primary' || variant === 'danger'
          ? 'primary'
          : undefined
      }
      data-loading={loading ? true : undefined}
      data-size={size}
      data-variant={variant}
      disabled={isDisabled}
      type={type}
    >
      <span className="pd-button__content" data-slot="activity-line-owner">
        {loading ? (
          <span
            aria-hidden="true"
            className="pd-button__spinner"
          />
        ) : null}

        {!loading && startIcon ? (
          <span
            aria-hidden="true"
            className="pd-button__icon"
          >
            {startIcon}
          </span>
        ) : null}

        <span className="pd-button__label">
          {content}
        </span>

        {!loading && endIcon ? (
          <span
            aria-hidden="true"
            className="pd-button__icon"
          >
            {endIcon}
          </span>
        ) : null}

        <span
          aria-hidden="true"
          className="pd-button__activity-line"
          data-slot="activity-line"
        />
      </span>
    </button>
  );
});
