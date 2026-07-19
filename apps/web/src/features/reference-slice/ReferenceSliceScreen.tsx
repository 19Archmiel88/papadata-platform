import { CheckCircle2 } from 'lucide-react';

import { PermissionBoundary, foundationCapabilities, useSessionContext } from '../../shell';
import '../../design-system/foundations/papadata-brand-surface.css';
import {
  DataIssuePanel,
  DecisionCard,
  EvidencePanel,
  OperationTracker,
  ReadinessBanner,
  WorkspaceContextBar,
} from '../../shared/patterns';
import { Button, Surface } from '../../shared/ui';
import type { CanonicalStoryFixture } from '../../shared/test';
import { buildReferenceSlice, type ReferenceSlice } from './referenceSlice';

type ReferenceSliceScreenProps = {
  fixture?: CanonicalStoryFixture;
  slice?: ReferenceSlice;
  theme?: 'light' | 'dark';
};

const shellGridStyle = {
  display: 'grid',
  gap: '1rem',
} as const;

export function ReferenceSliceScreen({
  fixture,
  slice,
  theme = 'dark',
}: ReferenceSliceScreenProps) {
  const sessionContext = useSessionContext();
  const context = fixture?.context ?? sessionContext;
  const resolvedSlice = slice ?? buildReferenceSlice(context);
  const readiness = fixture?.readiness ?? resolvedSlice.metricSnapshot.readiness;
  const operation = fixture?.operation ?? resolvedSlice.initialSyncOperation;

  return (
    <main
      className="pds-brand-surface pds-foundation-stage"
      data-theme={theme}
      lang="pl"
      style={{
        minHeight: '100vh',
        padding: '1.25rem',
      }}
    >
      <div style={{ ...shellGridStyle, margin: '0 auto', maxWidth: '1180px' }}>
        <WorkspaceContextBar context={context} />

        <section
          aria-labelledby="reference-slice-title"
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 24rem), 1fr))',
          }}
        >
          <div style={shellGridStyle}>
            <Surface style={{ ...shellGridStyle, padding: '1.25rem' }}>
              <span style={{ color: 'var(--pds-color-accent, #5ea2ff)', fontWeight: 700 }}>
                {resolvedSlice.provider.name}
              </span>
              <h1 id="reference-slice-title" style={{ fontSize: '2rem', margin: 0 }}>
                Command Center po pierwszej synchronizacji
              </h1>
              <p style={{ color: 'var(--pds-color-text-muted, #8f98aa)', margin: 0 }}>
                {resolvedSlice.metricDefinition.name}: {resolvedSlice.metricSnapshot.value}{' '}
                {resolvedSlice.metricSnapshot.currency}
              </p>
            </Surface>

            <Surface style={{ padding: '1rem' }}>
              <ol
                aria-label="Przebieg pionu referencyjnego"
                style={{
                  display: 'grid',
                  gap: '0.75rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))',
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                }}
              >
                {resolvedSlice.flow.map((stage) => (
                  <li
                    key={stage.stageId}
                    style={{
                      border: '1px solid var(--pds-color-border, rgba(148, 163, 184, 0.24))',
                      borderRadius: '8px',
                      display: 'grid',
                      gap: '0.45rem',
                      minHeight: '5.5rem',
                      padding: '0.75rem',
                    }}
                  >
                    <CheckCircle2 aria-hidden="true" size={18} />
                    <strong>{stage.label}</strong>
                  </li>
                ))}
              </ol>
            </Surface>

            <ReadinessBanner readiness={readiness} />
            <OperationTracker operation={operation} />
            <DataIssuePanel issues={fixture?.dataIssues ?? []} />
          </div>

          <aside style={shellGridStyle}>
            <EvidencePanel evidence={fixture?.evidence ?? resolvedSlice.evidence} />
            <PermissionBoundary
              capability={foundationCapabilities.recommendationDecide}
              explanation="Rekomendacja wymaga capability do decyzji w aktywnym workspace."
              mode="explain"
            >
              <DecisionCard
                action={<Button variant="primary">Zatwierdź decyzję</Button>}
                evidence={fixture?.evidence ?? resolvedSlice.evidence}
                recommendation={resolvedSlice.recommendation.text}
                title="Rekomendacja"
              />
            </PermissionBoundary>
          </aside>
        </section>
      </div>
    </main>
  );
}
