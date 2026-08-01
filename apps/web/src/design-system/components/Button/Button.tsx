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
  | 'danger'
  | 'link';

export type ButtonSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'sm'
  | 'md'
  | 'lg';

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'aria-busy'
  | 'children'
> & {
  readonly buttonType?: 'button' | 'submit' | 'reset';
  readonly children?: ReactNode;
  readonly endIcon?: ReactNode;
  readonly fullWidth?: boolean;
  readonly leadingIcon?: ReactNode;
  readonly loading?: boolean;
  readonly loadingLabel?: string;
  readonly size?: ButtonSize;
  readonly startIcon?: ReactNode;
  readonly text?: string;
  readonly trailingIcon?: ReactNode;
  readonly variant?: ButtonVariant;
};

function normalizeButtonSize(size: ButtonSize): Exclude<ButtonSize, 'sm' | 'md' | 'lg'> {
  switch (size) {
    case 'sm':
      return 'small';
    case 'md':
      return 'medium';
    case 'lg':
      return 'large';
    default:
      return size;
  }
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function Button(
  {
    buttonType,
    children,
    className,
    disabled = false,
    endIcon,
    fullWidth = false,
    leadingIcon,
    loading = false,
    loadingLabel,
    size = 'medium',
    startIcon,
    text,
    trailingIcon,
    type = 'button',
    variant = 'primary',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const resolvedSize = normalizeButtonSize(size);
  const resolvedStartIcon = startIcon ?? leadingIcon;
  const resolvedEndIcon = endIcon ?? trailingIcon;
  const resolvedType = type ?? buttonType ?? 'button';
  const rootClassName = [
    'pd-button',
    `pd-button--${variant}`,
    `pd-button--${resolvedSize}`,
    fullWidth ? 'pd-button--full-width' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const content =
    loading && loadingLabel
      ? loadingLabel
      : children ?? text ?? '';

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
      data-size={resolvedSize}
      data-variant={variant}
      disabled={isDisabled}
      type={resolvedType}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="pd-button__spinner"
        />
      ) : null}

      {!loading && resolvedStartIcon ? (
        <span
          aria-hidden="true"
          className="pd-button__icon"
        >
          {resolvedStartIcon}
        </span>
      ) : null}

      <span className="pd-button__label">
        {content}
      </span>

      {!loading && resolvedEndIcon ? (
        <span
          aria-hidden="true"
          className="pd-button__icon"
        >
          {resolvedEndIcon}
        </span>
      ) : null}
    </button>
  );
});
