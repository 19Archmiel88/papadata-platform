import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import {
  forwardRef,
} from 'react';

import './text-action.css';

export type TextActionTone =
  | 'default'
  | 'muted'
  | 'danger';

export type TextActionSize =
  | 'small'
  | 'medium';

export type TextActionProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'children'
  | 'role'
> & {
  readonly children: ReactNode;
  readonly endIcon?: ReactNode;
  readonly size?: TextActionSize;
  readonly startIcon?: ReactNode;
  readonly tone?: TextActionTone;
};

export const TextAction = forwardRef<
  HTMLButtonElement,
  TextActionProps
>(function TextAction(
  {
    children,
    className,
    endIcon,
    size = 'medium',
    startIcon,
    tone = 'default',
    type = 'button',
    ...props
  },
  ref,
) {
  const rootClassName = [
    'pd-inline-action',
    'pd-inline-action--button',
    `pd-inline-action--${tone}`,
    `pd-inline-action--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...props}
      ref={ref}
      className={rootClassName}
      data-action-kind="text"
      data-size={size}
      data-tone={tone}
      role={undefined}
      type={type}
    >
      {startIcon ? (
        <span
          aria-hidden="true"
          className="pd-inline-action__icon"
        >
          {startIcon}
        </span>
      ) : null}

      <span className="pd-inline-action__label">
        {children}
      </span>

      {endIcon ? (
        <span
          aria-hidden="true"
          className="pd-inline-action__icon"
        >
          {endIcon}
        </span>
      ) : null}
    </button>
  );
});
