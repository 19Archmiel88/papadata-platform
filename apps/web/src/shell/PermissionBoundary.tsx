import type { ReactNode } from 'react';

import type { Capability } from '../domain-contracts';
import { useCapability } from './sessionContext';

export type PermissionBoundaryMode = 'hidden' | 'disabled' | 'explain';

type PermissionBoundaryProps = {
  capability: Capability;
  children: ReactNode;
  explanation?: string;
  mode?: PermissionBoundaryMode;
};

export function PermissionBoundary({
  capability,
  children,
  explanation,
  mode = 'explain',
}: PermissionBoundaryProps) {
  const decision = useCapability(capability);

  if (decision.allowed) {
    return children;
  }

  if (mode === 'hidden') {
    return null;
  }

  const message =
    explanation ?? decision.explanation ?? 'Ta akcja wymaga dodatkowych uprawnień.';

  if (mode === 'disabled') {
    return (
      <div
        aria-disabled="true"
        data-permission-state="disabled"
        style={{ opacity: 0.54, pointerEvents: 'none' }}
      >
        {children}
      </div>
    );
  }

  return (
    <div data-permission-state="explained" style={{ display: 'grid', gap: '0.5rem' }}>
      <div aria-disabled="true" style={{ opacity: 0.54, pointerEvents: 'none' }}>
        {children}
      </div>
      <p
        role="note"
        style={{
          color: 'var(--pds-color-text-muted, #8f98aa)',
          fontSize: '0.875rem',
          margin: 0,
        }}
      >
        {message}
      </p>
    </div>
  );
}
