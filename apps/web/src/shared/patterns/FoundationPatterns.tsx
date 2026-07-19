import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import { Button, Surface } from '../../design-system';
import type {
  ApplicationSessionContext,
  DataIssue,
  EvidenceReference,
  OperationStatus,
  Readiness,
  ReadinessState,
} from '../../domain-contracts';

const gridStyle: CSSProperties = {
  display: 'grid',
  gap: '0.75rem',
};

const clusterStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.6rem',
};

const mutedTextStyle: CSSProperties = {
  color: 'var(--pds-color-text-muted, #8f98aa)',
  margin: 0,
};

const pillStyle: CSSProperties = {
  border: '1px solid var(--pds-color-border, rgba(148, 163, 184, 0.28))',
  borderRadius: '999px',
  color: 'var(--pds-color-text-muted, #8f98aa)',
  fontSize: '0.82rem',
  padding: '0.25rem 0.55rem',
};

function readinessTone(state: ReadinessState): 'danger' | 'info' | 'success' | 'warning' {
  if (state === 'ready') {
    return 'success';
  }

  if (state === 'invalid' || state === 'conflicting') {
    return 'danger';
  }

  if (state === 'processing' || state === 'manual_review_required') {
    return 'warning';
  }

  return 'info';
}

function readinessLabel(state: ReadinessState): string {
  const labels: Record<ReadinessState, string> = {
    conflicting: 'Konflikt danych',
    delayed: 'Opóźnione dane',
    invalid: 'Nieprawidłowe dane',
    manual_review_required: 'Wymaga przeglądu',
    no_data: 'Brak danych',
    partial: 'Częściowe dane',
    processing: 'Przetwarzanie',
    ready: 'Gotowe',
    resync_required: 'Wymagana resynchronizacja',
    stale: 'Nieaktualne dane',
  };

  return labels[state];
}

function operationLabel(status: OperationStatus['status']): string {
  const labels: Record<OperationStatus['status'], string> = {
    blocked: 'Zablokowana',
    cancelled: 'Anulowana',
    expired: 'Wygasła',
    failed: 'Błąd',
    partial: 'Częściowa',
    processing: 'W toku',
    queued: 'W kolejce',
    recovery_required: 'Wymaga recovery',
    requested: 'Zgłoszona',
    retrying: 'Ponawianie',
    succeeded: 'Zakończona',
    waiting_for_provider: 'Czeka na providera',
    waiting_for_user: 'Czeka na użytkownika',
  };

  return labels[status];
}

export function WorkspaceContextBar({
  context,
}: {
  context: ApplicationSessionContext;
}) {
  return (
    <Surface
      aria-label="Aktywny kontekst workspace"
      style={{ ...clusterStyle, justifyContent: 'space-between', padding: '0.9rem 1rem' }}
    >
      <span style={clusterStyle}>
        <ShieldCheck aria-hidden="true" size={18} />
        <strong>{context.tenant.name}</strong>
        <span aria-hidden="true">/</span>
        <span>{context.activeWorkspace.name}</span>
      </span>
      <span style={clusterStyle}>
        <span style={pillStyle}>{context.locale}</span>
        <span style={pillStyle}>{context.currency}</span>
        <span style={pillStyle}>{context.timezone}</span>
      </span>
    </Surface>
  );
}

export function ReadinessBanner({ readiness }: { readiness: Readiness }) {
  const tone = readinessTone(readiness.state);
  const Icon =
    tone === 'success'
      ? CheckCircle2
      : tone === 'danger'
        ? XCircle
        : tone === 'warning'
          ? AlertTriangle
          : Clock3;

  return (
    <Surface
      role={tone === 'danger' ? 'alert' : 'status'}
      style={{
        ...gridStyle,
        borderColor:
          tone === 'success'
            ? 'rgba(34, 197, 94, 0.45)'
            : tone === 'danger'
              ? 'rgba(248, 113, 113, 0.52)'
              : tone === 'warning'
                ? 'rgba(251, 191, 36, 0.52)'
                : 'rgba(96, 165, 250, 0.45)',
        padding: '1rem',
      }}
    >
      <span style={clusterStyle}>
        <Icon aria-hidden="true" size={19} />
        <strong>{readinessLabel(readiness.state)}</strong>
        <span style={pillStyle}>{readiness.scope.dataLayer}</span>
      </span>
      {readiness.limitations.length > 0 ? (
        <ul style={{ ...gridStyle, margin: 0, paddingLeft: '1.2rem' }}>
          {readiness.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      ) : (
        <p style={mutedTextStyle}>Zakres ma aktualną gotowość operacyjną.</p>
      )}
    </Surface>
  );
}

export function OperationTracker({ operation }: { operation: OperationStatus }) {
  return (
    <Surface
      aria-live="polite"
      style={{ ...gridStyle, padding: '1rem' }}
    >
      <span style={clusterStyle}>
        <Clock3 aria-hidden="true" size={18} />
        <strong>{operationLabel(operation.status)}</strong>
        <span style={pillStyle}>{operation.operationId}</span>
      </span>
      <p style={mutedTextStyle}>Correlation ID: {operation.correlationId}</p>
      {operation.limitations.length > 0 ? (
        <p style={mutedTextStyle}>{operation.limitations.join(' ')}</p>
      ) : null}
    </Surface>
  );
}

export function EvidencePanel({
  evidence,
}: {
  evidence: readonly EvidenceReference[];
}) {
  return (
    <Surface style={{ ...gridStyle, padding: '1rem' }}>
      <span style={clusterStyle}>
        <FileText aria-hidden="true" size={18} />
        <strong>Evidence</strong>
      </span>
      {evidence.length > 0 ? (
        <ul style={{ ...gridStyle, margin: 0, padding: 0 }}>
          {evidence.map((item) => (
            <li
              key={item.evidenceId}
              style={{
                ...gridStyle,
                borderTop: '1px solid var(--pds-color-border, rgba(148, 163, 184, 0.22))',
                listStyle: 'none',
                paddingTop: '0.75rem',
              }}
            >
              <strong>{item.label}</strong>
              <span style={mutedTextStyle}>{item.source}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={mutedTextStyle}>Brak evidence dla tego zakresu.</p>
      )}
    </Surface>
  );
}

export function DataIssuePanel({ issues }: { issues: readonly DataIssue[] }) {
  if (issues.length === 0) {
    return null;
  }

  return (
    <Surface role="alert" style={{ ...gridStyle, padding: '1rem' }}>
      <span style={clusterStyle}>
        <AlertTriangle aria-hidden="true" size={18} />
        <strong>Data issues</strong>
      </span>
      <ul style={{ ...gridStyle, margin: 0, paddingLeft: '1.2rem' }}>
        {issues.map((issue) => (
          <li key={issue.issueId}>
            <strong>{issue.severity}:</strong> {issue.message}
          </li>
        ))}
      </ul>
    </Surface>
  );
}

export function DecisionCard({
  action,
  evidence,
  recommendation,
  title,
}: {
  action?: ReactNode;
  evidence: readonly EvidenceReference[];
  recommendation: string;
  title: string;
}) {
  return (
    <Surface style={{ ...gridStyle, padding: '1rem' }}>
      <span style={clusterStyle}>
        <Database aria-hidden="true" size={18} />
        <strong>{title}</strong>
      </span>
      <p style={{ margin: 0 }}>{recommendation}</p>
      <p style={mutedTextStyle}>Evidence: {evidence.length}</p>
      {action ?? <Button variant="primary">Zatwierdź decyzję</Button>}
    </Surface>
  );
}

export function StandardEmptyState({
  action,
  title = 'Brak danych',
}: {
  action?: ReactNode;
  title?: string;
}) {
  return (
    <Surface style={{ ...gridStyle, padding: '1rem', textAlign: 'center' }}>
      <Database aria-hidden="true" size={28} style={{ marginInline: 'auto' }} />
      <strong>{title}</strong>
      <p style={mutedTextStyle}>Po gotowym dataset pokażemy KPI i evidence.</p>
      {action}
    </Surface>
  );
}

export function StandardErrorState({
  action,
  title = 'Nie udało się pobrać danych',
}: {
  action?: ReactNode;
  title?: string;
}) {
  return (
    <Surface role="alert" style={{ ...gridStyle, padding: '1rem', textAlign: 'center' }}>
      <AlertCircle aria-hidden="true" size={28} style={{ marginInline: 'auto' }} />
      <strong>{title}</strong>
      <p style={mutedTextStyle}>Operacja ma correlationId w logach audytu.</p>
      {action}
    </Surface>
  );
}

export function ExpiredSessionState() {
  return (
    <StandardErrorState
      action={<Button variant="secondary">Zaloguj ponownie</Button>}
      title="Sesja wygasła"
    />
  );
}

export function PartialState({ readiness }: { readiness: Readiness }) {
  return (
    <ReadinessBanner readiness={readiness} />
  );
}
