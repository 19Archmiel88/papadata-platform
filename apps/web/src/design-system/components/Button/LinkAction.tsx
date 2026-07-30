import type {
  AnchorHTMLAttributes,
  ReactNode,
} from 'react';
import {
  forwardRef,
} from 'react';

import './text-action.css';

export type LinkActionTone =
  | 'default'
  | 'muted'
  | 'danger';

export type LinkActionSize =
  | 'small'
  | 'medium';

export type LinkActionProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  | 'children'
  | 'href'
  | 'role'
  | 'type'
> & {
  readonly children: ReactNode;
  readonly endIcon?: ReactNode;
  readonly href: string;
  readonly size?: LinkActionSize;
  readonly startIcon?: ReactNode;
  readonly tone?: LinkActionTone;
};

export const LinkAction = forwardRef<
  HTMLAnchorElement,
  LinkActionProps
>(function LinkAction(
  {
    children,
    className,
    endIcon,
    href,
    size = 'medium',
    startIcon,
    tone = 'default',
    ...props
  },
  ref,
) {
  const rootClassName = [
    'pd-inline-action',
    'pd-inline-action--anchor',
    `pd-inline-action--${tone}`,
    `pd-inline-action--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      {...props}
      ref={ref}
      className={rootClassName}
      data-action-kind="link"
      data-size={size}
      data-tone={tone}
      href={href}
      role={undefined}
      type={undefined}
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
    </a>
  );
});
