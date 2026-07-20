import {
  AlertTriangle,
  ArrowRightLeft,
  Blocks,
  CheckCircle2,
  Database,
  FileClock,
  GitBranch,
  ListChecks,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';

import '../../design-system/foundations/papadata-brand-surface.css';
import { asEvidenceReferenceId } from '../../domain-contracts';
import {
  PermissionBoundary,
  SessionContextProvider,
} from '../../shell';
import {
  EvidencePanel,
  OperationTracker,
  WorkspaceContextBar,
} from '../../shared/patterns';
import { Button, Surface } from '../../shared/ui';
import {
  dataQualityCapabilities,
  type DatasetReadinessStatus,
  type QualityDimensionResult,
} from './dataQualityContracts';
import {
  dataQualityStoryFixtures,
  type DataQualityFixtureId,
  type DataQualityStoryFixture,
} from './dataQualityFixtures';

type DataQualityCenterScreenProps = {
  fixture?: DataQualityStoryFixture;
  fixtureId?: DataQualityFixtureId;
  theme?: 'light' | 'dark';
};

const grid = {
  display: 'grid',
  gap: '1rem',
} as const;

const cluster = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.6rem',
} as const;

const muted = {
  color: 'var(--pds-color-text-muted, #8f98aa)',
  margin: 0,
} as const;

const pill = {
  border: '1px solid var(--pds-color-border, rgba(148, 163, 184, 0.28))',
  borderRadius: '999px',
  color: 'var(--pds-color-text-muted, #8f98aa)',
  fontSize: '0.8rem',
  padding: '0.22rem 0.5rem',
} as const;

function statusLabel(status: DatasetReadinessStatus): string {
  const labels: Record<DatasetReadinessStatus, string> = {
    BLOCKED: 'Zablokowany',
    DELAYED: 'Opóźniony',
    INGESTING: 'Pobieranie',
    INVALID: 'Nieprawidłowy',
    NO_DATA: 'Brak danych',
    PARTIAL: 'Częściowy',
    PROCESSING: 'Przetwarzanie',
    READY: 'Gotowy',
    RESYNC_REQUIRED: 'Wymaga resynchronizacji',
  };

  return labels[status];
}

function statusTone(status: DatasetReadinessStatus): string {
  if (status === 'READY') {
    return 'rgba(34, 197, 94, 0.45)';
  }

  if (status === 'INVALID' || status === 'BLOCKED') {
    return 'rgba(248, 113, 113, 0.52)';
  }

  if (status === 'PARTIAL' || status === 'PROCESSING' || status === 'RESYNC_REQUIRED') {
    return 'rgba(251, 191, 36, 0.52)';
  }

  return 'rgba(96, 165, 250, 0.45)';
}

function DimensionRow({
  label,
  result,
}: {
  label: string;
  result: QualityDimensionResult;
}) {
  const icon =
    result.status === 'PASS' ? (
      <CheckCircle2 aria-hidden="true" size={17} />
    ) : (
      <AlertTriangle aria-hidden="true" size={17} />
    );

  return (
    <li
      style={{
        ...grid,
        borderTop: '1px solid var(--pds-color-border, rgba(148, 163, 184, 0.22))',
        listStyle: 'none',
        padding: '0.8rem 0 0',
      }}
    >
      <span style={{ ...cluster, justifyContent: 'space-between' }}>
        <span style={cluster}>
          {icon}
          <strong>{label}</strong>
        </span>
        <span style={pill}>{result.status}</span>
      </span>
      <p style={muted}>{result.impact}</p>
      <span style={cluster}>
        <span style={pill}>Wartość: {result.value}</span>
        <span style={pill}>Próg: {result.threshold}</span>
      </span>
    </li>
  );
}

function DataQualityContent({ fixture }: { fixture: DataQualityStoryFixture }) {
  const [activity, setActivity] = useState('Brak lokalnej komendy w tej sesji.');
  const evidence = fixture.readiness.evidenceRefs.map((ref, index) => ({
    evidenceId: asEvidenceReferenceId(`ev_${fixture.fixtureId}_${index}`),
    label: ref,
    source: 'data-quality.v1',
    tenantId: fixture.context.tenant.tenantId,
    workspaceId: fixture.context.activeWorkspace.workspaceId,
  }));
  const dimensions = [
    ['Completeness', fixture.quality.completeness],
    ['Freshness', fixture.quality.freshness],
    ['Schema', fixture.quality.schema],
    ['Uniqueness', fixture.quality.uniqueness],
    ['Overlap', fixture.quality.overlap],
    ['Financial integrity', fixture.quality.financialIntegrity],
    ['Currency', fixture.quality.currency],
    ['Status mapping', fixture.quality.statusMapping],
    ['Lineage', fixture.quality.lineage],
  ] as const;

  const recordActivity = (label: string) => {
    setActivity(`${label}: komenda przyjęta w fixture ${fixture.fixtureId}.`);
  };

  return (
    <div style={{ ...grid, margin: '0 auto', maxWidth: '1240px' }}>
      <WorkspaceContextBar context={fixture.context} />

      <section
        aria-labelledby="data-quality-title"
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(min(100%, 22rem), 0.65fr)',
        }}
      >
        <div style={grid}>
          <Surface
            style={{
              ...grid,
              borderColor: statusTone(fixture.dataset.readinessStatus),
              padding: '1.25rem',
            }}
          >
            <span style={{ color: 'var(--pds-color-accent, #5ea2ff)', fontWeight: 700 }}>
              Jakość danych i integralność
            </span>
            <h1 id="data-quality-title" style={{ fontSize: '2rem', margin: 0 }}>
              {fixture.title}
            </h1>
            <p style={{ margin: 0 }}>{fixture.impact}</p>
            <div style={cluster}>
              <span style={pill}>{statusLabel(fixture.dataset.readinessStatus)}</span>
              <span style={pill}>{fixture.dataset.type}</span>
              <span style={pill}>{fixture.dataset.currency ?? 'waluta nieustalona'}</span>
              <span style={pill}>{fixture.dataset.timezone}</span>
            </div>
          </Surface>

          <Surface style={{ ...grid, padding: '1rem' }}>
            <span style={cluster}>
              <ListChecks aria-hidden="true" size={18} />
              <strong>Readiness i wpływ KPI</strong>
            </span>
            <div style={{ ...cluster, alignItems: 'stretch' }}>
              <span style={pill}>Dozwolone: {fixture.readiness.allowedMetricCodes.join(', ') || 'brak'}</span>
              <span style={pill}>Zablokowane: {fixture.readiness.blockedMetricCodes.join(', ') || 'brak'}</span>
              <span style={pill}>Rule: {fixture.readiness.ruleVersion}</span>
            </div>
            <p style={muted}>{fixture.nextAction}</p>
          </Surface>

          {fixture.operation ? (
            <OperationTracker
              operation={{
                contractVersion: 'domain-contracts.v1',
                correlationId: fixture.operation.correlationId,
                limitations: [],
                operationId: fixture.operation.operationId,
                status:
                  fixture.operation.status === 'completed'
                    ? 'succeeded'
                    : fixture.operation.status === 'error'
                      ? 'failed'
                      : 'processing',
                tenantId: fixture.operation.tenantId,
                workspaceId: fixture.operation.workspaceId,
              }}
            />
          ) : null}

          <Surface style={{ ...grid, padding: '1rem' }}>
            <span style={cluster}>
              <ShieldCheck aria-hidden="true" size={18} />
              <strong>Wymiary jakości</strong>
            </span>
            <ul style={{ ...grid, margin: 0, padding: 0 }}>
              {dimensions.map(([label, result]) => (
                <DimensionRow key={label} label={label} result={result} />
              ))}
            </ul>
          </Surface>

          <Surface style={{ ...grid, padding: '1rem' }}>
            <span style={cluster}>
              <GitBranch aria-hidden="true" size={18} />
              <strong>Lineage</strong>
            </span>
            <p style={muted}>
              CanonicalOrder → SourceContribution → SourceRecord → SourceBatch → SyncJob →
              IntegrationConnection → Provider.
            </p>
            <div style={cluster}>
              <span style={pill}>PRIMARY: {fixture.quality.lineage.value}</span>
              <span style={pill}>Authority: {fixture.sourceAuthorityRules[0]?.version ?? 'brak'}</span>
              <span style={pill}>Dedupe: {fixture.dataset.canonicalModelVersion}</span>
            </div>
          </Surface>

          <Surface style={{ ...grid, padding: '1rem' }}>
            <span style={cluster}>
              <ArrowRightLeft aria-hidden="true" size={18} />
              <strong>Reconciliation</strong>
            </span>
            <div style={cluster}>
              <span style={pill}>{fixture.reconciliation.status}</span>
              <span style={pill}>Source: {fixture.reconciliation.sourceRecordCount}</span>
              <span style={pill}>Canonical: {fixture.reconciliation.canonicalFactCount}</span>
              <span style={pill}>Tolerance: {fixture.reconciliation.tolerance}</span>
            </div>
            <p style={muted}>Reason codes: {fixture.reconciliation.reasonCodes.join(', ')}</p>
          </Surface>
        </div>

        <aside style={grid}>
          {fixture.context.featureFlags.expiredSession ? (
            <Surface role="alert" style={{ ...grid, padding: '1rem' }}>
              <span style={cluster}>
                <LockKeyhole aria-hidden="true" size={18} />
                <strong>Sesja wygasła</strong>
              </span>
              <p style={muted}>Operacje jakości danych wymagają nowego SessionContext.</p>
            </Surface>
          ) : null}

          <Surface style={{ ...grid, padding: '1rem' }}>
            <span style={cluster}>
              <Database aria-hidden="true" size={18} />
              <strong>Source coverage</strong>
            </span>
            <span style={pill}>Records: {fixture.readiness.sourceCoverage.sourceRecords}</span>
            <span style={pill}>
              Streams: {fixture.readiness.sourceCoverage.streamsWithData.join(', ') || 'brak'}
            </span>
            <span style={pill}>
              Providers: {fixture.readiness.sourceCoverage.providerIds.join(', ') || 'brak'}
            </span>
          </Surface>

          <Surface style={{ ...grid, padding: '1rem' }}>
            <span style={cluster}>
              <Blocks aria-hidden="true" size={18} />
              <strong>DataIssue</strong>
            </span>
            {fixture.issues.length > 0 ? (
              fixture.issues.map((issue) => (
                <div key={issue.id} style={grid}>
                  <span style={cluster}>
                    <span style={pill}>{issue.severity}</span>
                    <span style={pill}>{issue.status}</span>
                  </span>
                  <strong>{issue.class}</strong>
                  <p style={muted}>{issue.impact}</p>
                  <p style={muted}>Owner: {issue.ownerId ?? 'brak'}</p>
                </div>
              ))
            ) : (
              <p style={muted}>Brak otwartych DataIssue dla tego zakresu.</p>
            )}
          </Surface>

          <Surface style={{ ...grid, padding: '1rem' }}>
            <span style={cluster}>
              <FileClock aria-hidden="true" size={18} />
              <strong>Impact old/new</strong>
            </span>
            {fixture.impactReports.length > 0 ? (
              fixture.impactReports.map((report) => (
                <div key={report.id} style={grid}>
                  <span style={pill}>Readiness: {report.readinessBefore} → {report.readinessAfter}</span>
                  <span style={pill}>
                    Canonical delta: {report.canonicalRecordDifference.delta}
                  </span>
                  <span style={pill}>Included: {report.newlyIncludedRecords}</span>
                  <span style={pill}>Excluded: {report.newlyExcludedRecords}</span>
                </div>
              ))
            ) : (
              <p style={muted}>Brak raportu wpływu dla aktualnej wersji.</p>
            )}
          </Surface>

          <PermissionBoundary
            capability={dataQualityCapabilities.reprocess}
            explanation="Reprocessing wymaga capability oraz walidacji zakresu po stronie API."
            mode="explain"
          >
            <div style={{ ...grid, gridTemplateColumns: '1fr 1fr' }}>
              <Button onClick={() => recordActivity('Review')} variant="secondary">
                Review
              </Button>
              <Button onClick={() => recordActivity('Reprocess')} variant="primary">
                Reprocess
              </Button>
              <Button onClick={() => recordActivity('Assign')} variant="secondary">
                Assign
              </Button>
              <Button onClick={() => recordActivity('Resolve')} variant="secondary">
                Resolve
              </Button>
            </div>
          </PermissionBoundary>

          <Surface aria-live="polite" style={{ padding: '1rem' }}>
            <span style={cluster}>
              <RefreshCw aria-hidden="true" size={18} />
              <strong>Aktywność</strong>
            </span>
            <p style={muted}>{activity}</p>
          </Surface>

          <EvidencePanel evidence={evidence} />
        </aside>
      </section>
    </div>
  );
}

export function DataQualityCenterScreen({
  fixture,
  fixtureId = 'ready',
  theme = 'dark',
}: DataQualityCenterScreenProps) {
  const resolvedFixture = fixture ?? dataQualityStoryFixtures[fixtureId];

  return (
    <main
      className="pds-brand-surface pds-foundation-stage"
      data-theme={theme}
      lang="pl"
      style={{ minHeight: '100vh', padding: '1.25rem' }}
    >
      <SessionContextProvider initialContext={resolvedFixture.context}>
        <DataQualityContent fixture={resolvedFixture} />
      </SessionContextProvider>
    </main>
  );
}
