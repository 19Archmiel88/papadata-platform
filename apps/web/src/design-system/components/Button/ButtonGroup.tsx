import type {
  HTMLAttributes,
  ReactNode,
} from 'react';
import {
  forwardRef,
} from 'react';

import './button-group.css';

export type ButtonGroupOrientation =
  | 'horizontal'
  | 'vertical';

export type ButtonGroupProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-orientation'
  | 'children'
  | 'role'
> & {
  readonly children: ReactNode;
  readonly label: string;
  readonly orientation?: ButtonGroupOrientation;
};

export const ButtonGroup = forwardRef<
  HTMLDivElement,
  ButtonGroupProps
>(function ButtonGroup(
  {
    children,
    className,
    label,
    orientation = 'horizontal',
    ...props
  },
  ref,
) {
  const rootClassName = [
    'pd-button-group',
    `pd-button-group--${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const accessibleLabel = label.trim();

  return (
    <div
      {...props}
      ref={ref}
      aria-label={accessibleLabel || undefined}
      aria-labelledby={undefined}
      aria-orientation={undefined}
      className={rootClassName}
      data-orientation={orientation}
      role="group"
    >
      {children}
    </div>
  );
});
