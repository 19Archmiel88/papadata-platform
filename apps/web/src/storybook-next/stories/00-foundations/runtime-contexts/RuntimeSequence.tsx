import type { ReactNode } from 'react';

import type { EvidenceAction } from './runtime-context-data';

type RuntimeSequenceProps = {
  readonly children: ReactNode;
  readonly evidenceLabel: string;
  readonly title: string;
};

export function RuntimeSequence({
  children,
  evidenceLabel,
  title,
}: RuntimeSequenceProps) {
  return (
    <section className="pd-c83-sequence" aria-label={title}>
      <header className="pd-c83-sequence__header">
        <h3>{title}</h3>
        <p>{evidenceLabel}</p>
      </header>
      <div className="pd-c83-sequence__body">
        {children}
      </div>
    </section>
  );
}

type EvidenceLogProps = {
  readonly actions: readonly EvidenceAction[];
};

export function EvidenceLog({
  actions,
}: EvidenceLogProps) {
  return (
    <output
      aria-live="polite"
      className="pd-c83-evidence"
    >
      <span>Dowód działania</span>
      <strong>{actions[0]?.label ?? 'Czekam na interakcję w dokumencie.'}</strong>
    </output>
  );
}
