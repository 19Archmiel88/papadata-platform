import {
  Activity,
  Archive,
  BadgeCheck,
  Beaker,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileClock,
  Fingerprint,
  History,
  KeyRound,
  Landmark,
  ListChecks,
  Lock,
  PauseCircle,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  SquarePen,
  XCircle,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

import {
  AppHeader,
  Button,
  InlineNotice,
  PageHeader,
  StatusBadge,
  type StatusBadgeStatus,
} from '../../shared/ui';
import type { AIStoryFixture } from './aiFixtures';
import type { AIRuntimeState } from './aiContracts';
import './ai-surfaces.css';

type AISurfacesScreenProps = {
  fixture: AIStoryFixture;
  theme?: 'light' | 'dark' | 'high-contrast';
};

const sectionLabels: Record<AIStoryFixture['section'], string> = {
  action: 'AI Actions',
  assistant: 'Papa Asystent',
  governance: 'AI Governance',
  history: 'AI History',
  laboratory: 'Laboratorium AI',
  provenance: 'Provenance',
  recommendation: 'Decyzje',
  settings: 'AI Settings',
};

const sectionIcons: Record<AIStoryFixture['section'], ReactNode> = {
  action: <Play aria-hidden="true" size={16} />,
  assistant: <Bot aria-hidden="true" size={16} />,
  governance: <ShieldCheck aria-hidden="true" size={16} />,
  history: <History aria-hidden="true" size={16} />,
  laboratory: <Beaker aria-hidden="true" size={16} />,
  provenance: <Fingerprint aria-hidden="true" size={16} />,
  recommendation: <ClipboardCheck aria-hidden="true" size={16} />,
  settings: <KeyRound aria-hidden="true" size={16} />,
};

const statusToBadge: Record<AIRuntimeState, StatusBadgeStatus> = {
  ANSWERED: 'ready',
  BLOCKED_BY_POLICY: 'blocked',
  BUILDING_CONTEXT: 'inProgress',
  CANCELLED: 'inactive',
  COST_LIMIT_REACHED: 'warning',
  DISABLED: 'inactive',
  EXPIRED: 'inactive',
  GENERATING: 'inProgress',
  INJECTION_BLOCKED: 'blocked',
  INSUFFICIENT_DATA: 'noData',
  NEEDS_REVIEW: 'warning',
  PROVIDER_ERROR: 'error',
  REJECTED: 'error',
} as const;

function money(value: string) {
  return `${value} PLN`;
}

export function AISurfacesScreen({
  fixture,
  theme = 'dark',
}: AISurfacesScreenProps) {
  const [activeSection, setActiveSection] =
    useState<AIStoryFixture['section']>(fixture.section);
  const [activity, setActivity] = useState('Evidence i provenance gotowe.');
  const [streaming, setStreaming] = useState(
    fixture.assistant.status === 'GENERATING',
  );
  const themeMode = theme === 'light' ? 'light' : 'dark';
  const visibleSection = activeSection;
  const sections = useMemo(
    () => Object.keys(sectionLabels) as AIStoryFixture['section'][],
    [],
  );

  return (
    <div className="ai-shell" data-contrast={theme} data-theme={themeMode}>
      <AppHeader
        language="pl"
        theme={themeMode}
        trailing={
          <StatusBadge
            label={fixture.gateS3.productionAIBlocked ? 'production blocked' : 'gate ready'}
            status={fixture.gateS3.productionAIBlocked ? 'blocked' : 'ready'}
          />
        }
      />

      <main className="ai-shell__main">
        <PageHeader
          eyebrow="Fala 5"
          text="Insights, decyzje, Papa Asystent, Laboratorium AI i kontrolowane AI Actions."
          title={fixture.title}
        >
          <div className="ai-meta-row" aria-label="Zakres AI">
            <span>{fixture.context.tenant.name}</span>
            <span>{fixture.context.activeWorkspace.name}</span>
            <span>{fixture.context.currency}</span>
            <span>{fixture.context.timezone}</span>
          </div>
        </PageHeader>

        <nav className="ai-nav" aria-label="Powierzchnie AI">
          {sections.map((section) => (
            <button
              aria-current={visibleSection === section ? 'page' : undefined}
              className="ai-nav__button"
              key={section}
              onClick={() => {
                setActiveSection(section);
                setActivity(`${sectionLabels[section]} otwarte.`);
              }}
              type="button"
            >
              {sectionIcons[section]}
              <span>{sectionLabels[section]}</span>
            </button>
          ))}
        </nav>

        <div className="ai-grid">
          <section className="ai-workspace" aria-label={sectionLabels[visibleSection]}>
            {visibleSection === 'assistant' ? (
              <AssistantPanel
                activity={activity}
                fixture={fixture}
                onActivity={setActivity}
                onStreamingChange={setStreaming}
                streaming={streaming}
              />
            ) : null}
            {visibleSection === 'laboratory' ? (
              <LaboratoryPanel fixture={fixture} onActivity={setActivity} />
            ) : null}
            {visibleSection === 'recommendation' ? (
              <DecisionPanel fixture={fixture} onActivity={setActivity} />
            ) : null}
            {visibleSection === 'action' ? (
              <ActionPanel fixture={fixture} onActivity={setActivity} />
            ) : null}
            {visibleSection === 'provenance' ? (
              <ProvenancePanel fixture={fixture} onActivity={setActivity} />
            ) : null}
            {visibleSection === 'settings' ? (
              <SettingsPanel fixture={fixture} onActivity={setActivity} />
            ) : null}
            {visibleSection === 'history' ? (
              <HistoryPanel fixture={fixture} onActivity={setActivity} />
            ) : null}
            {visibleSection === 'governance' ? (
              <GovernancePanel fixture={fixture} onActivity={setActivity} />
            ) : null}
          </section>

          <aside className="ai-side" aria-label="Gate, koszt i evidence">
            <StatusBadge
              label={fixture.assistant.status.toLowerCase().replaceAll('_', ' ')}
              status={statusToBadge[fixture.assistant.status]}
            />
            <Metric label="Koszt runu" value={money(fixture.run.cost)} />
            <Metric label="Evidence" value={String(fixture.output.evidenceReferences.length)} />
            <Metric label="Gate S3" value={fixture.gateS3.productionAIBlocked ? 'blocked' : 'ready'} />
            <InlineNotice tone={fixture.gateS3.productionAIBlocked ? 'warning' : 'success'}>
              {fixture.gateS3.productionAIBlocked
                ? 'Production AI pozostaje zablokowane do niezależnych ocen.'
                : 'Gate S3 spełniony.'}
            </InlineNotice>
            <div className="ai-activity" role="status">
              <Activity aria-hidden="true" size={16} />
              <span>{activity}</span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

type PanelProps = {
  fixture: AIStoryFixture;
  onActivity: (message: string) => void;
};

function AssistantPanel({
  activity,
  fixture,
  onActivity,
  onStreamingChange,
  streaming,
}: PanelProps & {
  activity: string;
  onStreamingChange: (streaming: boolean) => void;
  streaming: boolean;
}) {
  return (
    <div className="ai-panel">
      <PanelHeader
        icon={<Bot aria-hidden="true" size={20} />}
        kicker="Papa Asystent"
        title="Kontekstowa analiza widoku"
      />
      <ContextManifest fixture={fixture} />
      <div className="ai-chat" aria-label="Historia rozmowy">
        {fixture.assistant.messages.map((message) => (
          <p key={message}>{message}</p>
        ))}
        {streaming ? (
          <p className="ai-stream">
            <Sparkles aria-hidden="true" size={16} />
            Streaming odpowiedzi...
          </p>
        ) : null}
      </div>
      <ResponseParts fixture={fixture} />
      <div className="ai-actions-row">
        <Button
          iconBefore={<FileClock aria-hidden="true" size={16} />}
          onClick={() => onActivity('Evidence otwarte dla odpowiedzi AI.')}
        >
          Evidence
        </Button>
        <Button
          iconBefore={<SquarePen aria-hidden="true" size={16} />}
          onClick={() => onActivity('Recommendation draft przygotowany.')}
        >
          Draft recommendation
        </Button>
        <Button
          iconBefore={<PauseCircle aria-hidden="true" size={16} />}
          onClick={() => {
            onStreamingChange(false);
            onActivity('Run anulowany przez użytkownika.');
          }}
        >
          Cancel
        </Button>
        <Button
          iconBefore={<RefreshCw aria-hidden="true" size={16} />}
          onClick={() => onActivity('Retry zachowuje ten sam scope i policy.')}
        >
          Retry
        </Button>
      </div>
      <InlineNotice tone={fixture.assistant.refusalCode ? 'warning' : 'info'}>
        {fixture.assistant.refusalCode
          ? `Refusal: ${fixture.assistant.refusalCode}`
          : activity}
      </InlineNotice>
    </div>
  );
}

function LaboratoryPanel({ fixture, onActivity }: PanelProps) {
  return (
    <div className="ai-panel">
      <PanelHeader
        icon={<Beaker aria-hidden="true" size={20} />}
        kicker="Laboratorium AI"
        title="Kontrolowany eksperyment analityczny"
      />
      <div className="ai-form-grid">
        <Field label="Use case" value={fixture.experiment?.useCaseId ?? 'uc_laboratory_analysis'} />
        <Field label="Workspace" value={fixture.context.activeWorkspace.name} />
        <Field label="Datasety" value={fixture.experiment?.allowedDatasetIds.join(', ') ?? 'orders'} />
        <Field label="KPI" value={fixture.experiment?.allowedMetricCodes.join(', ') ?? 'order_count'} />
        <Field label="Model" value={fixture.run.modelCode} />
        <Field label="Prompt" value={fixture.run.promptTemplateVersion} />
      </div>
      <div className="ai-actions-row">
        <Button iconBefore={<Play aria-hidden="true" size={16} />} onClick={() => onActivity('Run laboratorium uruchomiony.')}>
          Run
        </Button>
        <Button iconBefore={<ListChecks aria-hidden="true" size={16} />} onClick={() => onActivity('Porównanie runów gotowe.')}>
          Compare
        </Button>
        <Button iconBefore={<Archive aria-hidden="true" size={16} />} onClick={() => onActivity('Eksperyment zarchiwizowany zgodnie z retencją.')}>
          Archive
        </Button>
      </div>
      <EvidenceTable fixture={fixture} />
    </div>
  );
}

function DecisionPanel({ fixture, onActivity }: PanelProps) {
  return (
    <div className="ai-panel">
      <PanelHeader
        icon={<ClipboardCheck aria-hidden="true" size={20} />}
        kicker="Obserwacje, insighty i decyzje"
        title={fixture.recommendation?.content ?? 'Recommendation draft'}
      />
      <div className="ai-timeline">
        <TimelineItem label="Observation" value={fixture.observation?.title ?? 'Observation unavailable'} />
        <TimelineItem label="Insight" value={fixture.insight?.interpretation ?? 'Insight pending'} />
        <TimelineItem label="Recommendation" value={fixture.recommendation?.status ?? 'PROPOSED'} />
        <TimelineItem label="Decision" value={fixture.decision?.outcome ?? 'NEEDS_REVIEW'} />
      </div>
      <div className="ai-actions-row">
        <Button iconBefore={<CheckCircle2 aria-hidden="true" size={16} />} onClick={() => onActivity('Decyzja ACCEPT zapisana z rationale.')}>
          Accept
        </Button>
        <Button iconBefore={<XCircle aria-hidden="true" size={16} />} onClick={() => onActivity('Decyzja REJECT zapisana.')}>
          Reject
        </Button>
        <Button iconBefore={<SquarePen aria-hidden="true" size={16} />} onClick={() => onActivity('Wymagane dodatkowe dane przed decyzją.')}>
          Need data
        </Button>
      </div>
    </div>
  );
}

function ActionPanel({ fixture, onActivity }: PanelProps) {
  return (
    <div className="ai-panel">
      <PanelHeader
        icon={<Play aria-hidden="true" size={20} />}
        kicker="AI Actions"
        title="Proposal, approval, revalidation, execution"
      />
      <div className="ai-form-grid">
        <Field label="Target" value={`${fixture.proposal?.targetType ?? 'TASK'}:${fixture.proposal?.targetId ?? 'draft'}`} />
        <Field label="Action type" value={fixture.proposal?.actionType ?? 'CREATE_TASK'} />
        <Field label="Approval" value={fixture.proposal?.requiredApproval ?? 'REAUTH_AND_APPROVAL'} />
        <Field label="Idempotency" value={fixture.proposal?.idempotencyKey ?? 'required'} />
        <Field label="Outcome" value={fixture.outcome?.resultAfterAction ?? 'PENDING'} />
        <Field label="Compensation" value={fixture.proposal?.compensatingAction ?? 'available'} />
      </div>
      <div className="ai-actions-row">
        <Button iconBefore={<Lock aria-hidden="true" size={16} />} onClick={() => onActivity('Reauthentication potwierdzona.')}>
          Reauth
        </Button>
        <Button iconBefore={<BadgeCheck aria-hidden="true" size={16} />} onClick={() => onActivity('Proposal approved by human.')}>
          Approve
        </Button>
        <Button iconBefore={<Play aria-hidden="true" size={16} />} onClick={() => onActivity('Execution revalidated and idempotent.')}>
          Execute
        </Button>
      </div>
    </div>
  );
}

function ProvenancePanel({ fixture, onActivity }: PanelProps) {
  return (
    <div className="ai-panel">
      <PanelHeader
        icon={<Fingerprint aria-hidden="true" size={20} />}
        kicker="AI Provenance"
        title="Podstawa odpowiedzi bez chain-of-thought"
      />
      <div className="ai-form-grid">
        <Field label="Use case" value={fixture.run.useCaseId} />
        <Field label="Provider" value={fixture.run.providerCode} />
        <Field label="Model" value={`${fixture.run.modelCode}/${fixture.run.modelVersion}`} />
        <Field label="Prompt" value={fixture.run.promptTemplateVersion} />
        <Field label="Retrieval" value={fixture.run.retrievalPolicyVersion} />
        <Field label="Cost" value={money(fixture.run.cost)} />
      </div>
      <EvidenceTable fixture={fixture} />
      <Button iconBefore={<FileClock aria-hidden="true" size={16} />} onClick={() => onActivity('Audit reference otwarte.')}>
        Audit reference
      </Button>
    </div>
  );
}

function SettingsPanel({ fixture, onActivity }: PanelProps) {
  return (
    <div className="ai-panel">
      <PanelHeader
        icon={<KeyRound aria-hidden="true" size={20} />}
        kicker="AI Settings"
        title="Use cases, modele, retencja i oversight"
      />
      <div className="ai-form-grid">
        <Field label="Workspace AI" value={fixture.settings.workspaceAIEnabled ? 'enabled' : 'disabled'} />
        <Field label="Memory" value={fixture.settings.memoryEnabled ? 'enabled' : 'disabled'} />
        <Field label="Oversight" value={fixture.settings.humanOversightLevel} />
        <Field label="Retention" value={fixture.settings.retentionPolicyId} />
        <Field label="User limit" value={money(fixture.settings.userCostLimit)} />
        <Field label="Models" value={fixture.settings.allowedModelCodes.join(', ')} />
      </div>
      <Button iconBefore={<Lock aria-hidden="true" size={16} />} onClick={() => onActivity('AI disabled flag zapisany w ustawieniach workspace.')}>
        Toggle workspace AI
      </Button>
    </div>
  );
}

function HistoryPanel({ fixture, onActivity }: PanelProps) {
  return (
    <div className="ai-panel">
      <PanelHeader
        icon={<History aria-hidden="true" size={20} />}
        kicker="AI History"
        title="Threads, runs, evidence, decisions, cost"
      />
      <div className="ai-form-grid">
        <Field label="Threads" value={String(fixture.history.threadIds.length)} />
        <Field label="Runs" value={String(fixture.history.runIds.length)} />
        <Field label="Recommendations" value={String(fixture.history.recommendationIds.length)} />
        <Field label="Decisions" value={String(fixture.history.decisionIds.length)} />
        <Field label="Cost" value={money(fixture.history.cost)} />
        <Field label="Deletion" value={fixture.history.deletionStatus} />
      </div>
      <Button iconBefore={<Archive aria-hidden="true" size={16} />} onClick={() => onActivity('Deletion request propagowany do zależnych artefaktów.')}>
        Delete thread
      </Button>
    </div>
  );
}

function GovernancePanel({ fixture, onActivity }: PanelProps) {
  return (
    <div className="ai-panel">
      <PanelHeader
        icon={<ShieldCheck aria-hidden="true" size={20} />}
        kicker="Internal Control Plane"
        title="AI Governance i Gate S3"
      />
      <div className="ai-form-grid">
        <Field label="Use cases" value={String(fixture.governance.useCaseRegister.length)} />
        <Field label="Providers" value={fixture.governance.providerRegistry.map((provider) => provider.code).join(', ')} />
        <Field label="Models" value={fixture.governance.modelRegistry.map((model) => model.code).join(', ')} />
        <Field label="Audit events" value={String(fixture.governance.auditCount)} />
        <Field label="Gate S3" value={fixture.governance.gateS3.productionAIBlocked ? 'NOT SATISFIED' : 'SATISFIED'} />
        <Field label="Incidents" value={String(fixture.governance.incidents.length)} />
      </div>
      <div className="ai-gate-list">
        {fixture.gateS3.requirements.map((requirement) => (
          <div className="ai-gate-list__item" key={requirement.requirementId}>
            <StatusBadge
              label={requirement.status.toLowerCase().replaceAll('_', ' ')}
              status={requirement.status === 'SATISFIED' ? 'ready' : 'blocked'}
            />
            <span>{requirement.description}</span>
          </div>
        ))}
      </div>
      <Button iconBefore={<Landmark aria-hidden="true" size={16} />} onClick={() => onActivity('Gate S3 evidence package otwarte.')}>
        Gate evidence
      </Button>
    </div>
  );
}

function PanelHeader({
  icon,
  kicker,
  title,
}: {
  icon: ReactNode;
  kicker: string;
  title: string;
}) {
  return (
    <header className="ai-panel__header">
      <span className="ai-panel__icon">{icon}</span>
      <div>
        <p>{kicker}</p>
        <h2>{title}</h2>
      </div>
    </header>
  );
}

function ContextManifest({ fixture }: { fixture: AIStoryFixture }) {
  return (
    <div className="ai-context" aria-label="ContextManifest">
      <span>{fixture.output.scope.surface}</span>
      <span>{fixture.output.scope.resourceType}</span>
      <span>{fixture.output.readiness}</span>
      <span>{fixture.output.period.from.slice(0, 10)} - {fixture.output.period.to.slice(0, 10)}</span>
    </div>
  );
}

function ResponseParts({ fixture }: { fixture: AIStoryFixture }) {
  const parts = [
    ...fixture.output.facts,
    ...fixture.output.interpretations,
    ...fixture.output.hypotheses,
    ...fixture.output.recommendations,
  ];

  return (
    <div className="ai-response-parts">
      {parts.map((part) => (
        <article className="ai-response-part" key={`${part.kind}-${part.label}`}>
          <span>{part.kind}</span>
          <h3>{part.label}</h3>
          <p>{part.content}</p>
          <small>{part.evidenceReferences.length} evidence</small>
        </article>
      ))}
    </div>
  );
}

function EvidenceTable({ fixture }: { fixture: AIStoryFixture }) {
  return (
    <div className="ai-table-wrap">
      <table className="ai-table">
        <caption>Evidence i limitations</caption>
        <thead>
          <tr>
            <th scope="col">Evidence</th>
            <th scope="col">Readiness</th>
            <th scope="col">Limitation</th>
          </tr>
        </thead>
        <tbody>
          {fixture.output.evidenceReferences.map((evidenceId) => (
            <tr key={evidenceId}>
              <td>{evidenceId}</td>
              <td>{fixture.output.readiness}</td>
              <td>{fixture.output.limitations[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="ai-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="ai-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="ai-timeline__item">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}
