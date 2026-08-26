import type {
  HTMLAttributes,
  ReactNode,
} from 'react';

export type VisuallyHiddenProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  readonly as?: 'div' | 'span';
  readonly children: ReactNode;
};

/**
 * Keeps content in the DOM (and the accessibility tree) while removing it
 * from sighted, visual layout — reuses the existing `.pd-visually-hidden`
 * utility (foundations.css) instead of a bespoke clip-rect. Because that
 * class is `position: absolute`, a wrapped element also stops participating
 * in the parent's normal flow/grid, so no extra layout/gap changes are
 * needed at the call site to account for its removal.
 */
export function VisuallyHidden({
  as = 'span',
  children,
  ...rest
}: VisuallyHiddenProps) {
  const Component = as;

  return (
    <Component
      {...rest}
      className="pd-visually-hidden"
    >
      {children}
    </Component>
  );
}
