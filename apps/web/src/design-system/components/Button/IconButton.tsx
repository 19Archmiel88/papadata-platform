import type {
  ButtonHTMLAttributes,
} from 'react';
import {
  forwardRef,
} from 'react';

import {
  Icon,
} from '../../icons';
import type {
  PapaDataIconName,
} from '../../icons';

import './icon-button.css';

export type IconButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger';

export type IconButtonSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'sm'
  | 'md'
  | 'lg';

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'aria-busy'
  | 'aria-label'
  | 'aria-labelledby'
  | 'children'
  | 'role'
> & {
  readonly icon: PapaDataIconName;
  readonly label?: string;
  readonly loading?: boolean;
  readonly loadingLabel?: string;
  readonly pressed?: boolean | null;
  readonly size?: IconButtonSize;
  readonly tooltip?: string;
  readonly variant?: IconButtonVariant;
};

function normalizeIconButtonSize(size: IconButtonSize): Exclude<IconButtonSize, 'sm' | 'md' | 'lg'> {
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

export const IconButton = forwardRef<
  HTMLButtonElement,
  IconButtonProps
>(function IconButton(
  {
    className,
    disabled = false,
    icon,
    label,
    loading = false,
    loadingLabel,
    pressed,
    size = 'medium',
    tooltip,
    type = 'button',
    variant = 'secondary',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const resolvedSize = normalizeIconButtonSize(size);
  const resolvedLabel = label ?? tooltip ?? icon;
  const accessibleName =
    loading && loadingLabel
      ? loadingLabel
      : resolvedLabel;
  const rootClassName = [
    'pd-icon-button',
    `pd-icon-button--${variant}`,
    `pd-icon-button--${resolvedSize}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...props}
      ref={ref}
      aria-busy={loading ? true : undefined}
      aria-pressed={
        typeof pressed === 'boolean'
          ? pressed
          : undefined
      }
      aria-label={accessibleName}
      aria-labelledby={undefined}
      className={rootClassName}
      data-icon={icon}
      data-interactive-tone={
        variant === 'primary' || variant === 'danger'
          ? 'primary'
          : undefined
      }
      data-loading={loading ? true : undefined}
      data-size={resolvedSize}
      data-variant={variant}
      disabled={isDisabled}
      role={undefined}
      type={type}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="pd-icon-button__spinner"
        />
      ) : (
        <Icon decorative name={icon} size={20} />
      )}
    </button>
  );
});
