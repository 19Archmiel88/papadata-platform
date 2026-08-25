import {
  useState,
} from 'react';

import {
  AlertDialog,
  Button,
  DecisionCard,
  EvidencePanel,
  SegmentedControl,
  StatusBadge,
  Tabs,
} from '../../design-system';
import {
  papaEvidenceRefs,
  resolvePapaDecisionCardStatus,
} from './papaData';
import type {
  PapaWorkspaceData,
} from './papaData';
import {
  PapaAssistantChat,
  PapaElementChat,
  PapaReportCenter,
  resolveElementStatusText,
  resolveElementStatusTone,
} from './PapaAssistantPanels';
import {
  usePapaAssistantRuntime,
} from '../../shell/papa-assistant';
import './papa-conversation-workspace.css';

type PapaConversationCenterMode =
  | 'chat'
  | 'element'
  | 'report';

type PapaConversationRightTab =
  | 'context'
  | 'evidence'
  | 'actions';

type PapaConversationMobilePane =
  | 'threads'
  | 'center'
  | 'right';

export function PapaConversationWorkspace({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  const {
    conversationId,
    resetConversation,
  } = usePapaAssistantRuntime();
  const [centerMode, setCenterMode] =
    useState<PapaConversationCenterMode>('chat');
  const [rightTab, setRightTab] =
    useState<PapaConversationRightTab>('context');
  const [mobilePane, setMobilePane] =
    useState<PapaConversationMobilePane>('center');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [selectedCaseElementId, setSelectedCaseElementId] = useState<string | null>(null);

  const pendingDecisions = data.decisions.filter((decision) => (
    decision.status === 'new' || decision.status === 'review'
  ));

  function handleResetConfirm() {
    resetConversation();
    setCenterMode('chat');
    setRightTab('context');
    setResetConfirmOpen(false);
  }

  function openCaseThread(elementId: string) {
    setSelectedCaseElementId(elementId);
    setCenterMode('element');
    setMobilePane('center');
  }

  return (
    <section
      aria-label="Rozmowa Papa Asystenta"
      className="pd-papa-conversation-workspace"
    >
      <div className="pd-papa-conversation-workspace__mobile-switch">
        <SegmentedControl
          ariaLabel="Widoczny panel rozmowy"
          items={[
            { label: 'Sprawy', value: 'threads' },
            { label: 'Czat', value: 'center' },
            { label: 'Kontekst', value: 'right' },
          ]}
          size="compact"
          value={mobilePane}
          onValueChange={(value) => {
            if (isMobilePane(value)) {
              setMobilePane(value);
            }
          }}
        />
      </div>

      <aside
        aria-label="Wątki i sprawy"
        className="pd-papa-conversation-workspace__threads"
        data-mobile-visible={mobilePane === 'threads'}
      >
        <header className="pd-papa-conversation-workspace__threads-header">
          <div>
            <span>Conversation ID</span>
            <strong>{conversationId}</strong>
          </div>
          <Button
            size="small"
            variant="ghost"
            onClick={() => setResetConfirmOpen(true)}
          >
            Nowa rozmowa
          </Button>
        </header>

        <dl className="pd-papa-conversation-workspace__threads-summary">
          <div>
            <dt>Sprawy</dt>
            <dd>{data.elementThreads.length}</dd>
          </div>
          <div>
            <dt>Decyzje</dt>
            <dd>{pendingDecisions.length}</dd>
          </div>
        </dl>

        <ol
          aria-label="Wątki spraw AI"
          className="pd-papa-conversation-workspace__case-list"
        >
          {data.elementThreads.length === 0 ? (
            <li className="pd-papa-conversation-workspace__case-empty">
              Brak wątków spraw w bieżącym zakresie.
            </li>
          ) : (
            data.elementThreads.map((thread) => (
              <li key={thread.elementId}>
                <button
                  type="button"
                  onClick={() => openCaseThread(thread.elementId)}
                >
                  <span>{thread.elementLabel}</span>
                  <StatusBadge
                    status="Stan"
                    text={resolveElementStatusText(thread.status)}
                    tone={resolveElementStatusTone(thread.status)}
                  />
                </button>
              </li>
            ))
          )}
        </ol>
      </aside>

      <div
        className="pd-papa-conversation-workspace__center"
        data-mobile-visible={mobilePane === 'center'}
      >
        <Tabs
          activation="manual"
          activeId={centerMode}
          ariaLabel="Tryb rozmowy Laboratorium"
          items={[
            {
              icon: 'assistant',
              id: 'chat',
              label: 'Rozmowa',
              panel: <PapaAssistantChat data={data} />,
            },
            {
              disabled: data.elementThreads.length === 0,
              icon: 'data',
              id: 'element',
              label: 'Sprawa',
              panel: (
                <PapaElementChat
                  data={data}
                  initialElementId={selectedCaseElementId ?? undefined}
                  key={selectedCaseElementId ?? 'default-case'}
                />
              ),
            },
            {
              icon: 'decisions',
              id: 'report',
              label: 'Raport',
              panel: (
                <div className="pd-papa-conversation-workspace__report-tab">
                  <PapaReportCenter data={data} />
                </div>
              ),
            },
          ]}
          orientation="horizontal"
          size="compact"
          onActiveIdChange={(nextId) => {
            if (isCenterMode(nextId)) {
              setCenterMode(nextId);
            }
          }}
        />
      </div>

      <aside
        aria-label="Kontekst, dowody i akcje"
        className="pd-papa-conversation-workspace__right"
        data-mobile-visible={mobilePane === 'right'}
      >
        <Tabs
          activation="manual"
          activeId={rightTab}
          ariaLabel="Panel kontekstu Laboratorium"
          items={[
            {
              id: 'context',
              label: 'Koszyk',
              panel: (
                <ContextRailList data={data} />
              ),
            },
            {
              badge: data.evidence.length > 0 ? String(data.evidence.length) : undefined,
              id: 'evidence',
              label: 'Dowody',
              panel: (
                <EvidencePanel
                  confidence={data.summary.confidence}
                  context={data.context}
                  evidence={[...papaEvidenceRefs(data.evidence)]}
                  sources={[...data.sources]}
                />
              ),
            },
            {
              badge: pendingDecisions.length > 0 ? String(pendingDecisions.length) : undefined,
              id: 'actions',
              label: 'Akcje',
              panel: (
                <div className="pd-papa-conversation-workspace__decisions">
                  {data.decisions.length === 0 ? (
                    <p className="pd-papa-conversation-workspace__case-empty">
                      Brak decyzji do akceptacji w bieżącej rozmowie.
                    </p>
                  ) : (
                    data.decisions.map((decision) => (
                      <DecisionCard
                        decisionId={decision.id}
                        dueAt={decision.dueAt}
                        impact={decision.impact}
                        key={decision.id}
                        owner={decision.owner}
                        priority={decision.impact}
                        status={resolvePapaDecisionCardStatus(decision.status)}
                        title={decision.title}
                      />
                    ))
                  )}
                </div>
              ),
            },
          ]}
          orientation="horizontal"
          size="compact"
          onActiveIdChange={(nextId) => {
            if (isRightTab(nextId)) {
              setRightTab(nextId);
            }
          }}
        />
      </aside>

      <AlertDialog
        cancelLabel="Zostaw rozmowę"
        confirmLabel="Rozpocznij od nowa"
        destructive
        message="To rozpocznie nową rozmowę w bieżącym workspace i wyczyści lokalne drafty. Poprzednia historia pozostaje na serwerze zgodnie z retencją."
        open={resetConfirmOpen}
        title="Rozpocząć nową rozmowę?"
        onCancel={() => setResetConfirmOpen(false)}
        onConfirm={handleResetConfirm}
        onOpenChange={(nextOpen) => setResetConfirmOpen(nextOpen)}
      />
    </section>
  );
}

function ContextRailList({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  if (data.contextItems.length === 0) {
    return (
      <p className="pd-papa-conversation-workspace__case-empty">
        Brak elementów kontekstu w bieżącej rozmowie.
      </p>
    );
  }

  return (
    <ul
      aria-label="Koszyk kontekstu Papa"
      className="pd-papa-conversation-workspace__context-list"
    >
      {data.contextItems.map((item) => (
        <li key={item.id}>
          <div>
            <strong>{item.label}</strong>
            <span>{item.kind} · {item.source}</span>
          </div>
          <dl>
            <div>
              <dt>Pewność</dt>
              <dd>{Math.round(item.confidence * 100)}%</dd>
            </div>
            <div>
              <dt>Retencja</dt>
              <dd>{item.retention}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

function isCenterMode(
  value: string,
): value is PapaConversationCenterMode {
  return value === 'chat'
    || value === 'element'
    || value === 'report';
}

function isRightTab(
  value: string,
): value is PapaConversationRightTab {
  return value === 'context'
    || value === 'evidence'
    || value === 'actions';
}

function isMobilePane(
  value: string,
): value is PapaConversationMobilePane {
  return value === 'threads'
    || value === 'center'
    || value === 'right';
}
