import type {
  ReactNode,
} from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  BffReportRecord,
  PapaAnswerRecord,
} from '../../shared/api/bffClient';
import {
  bffClient,
} from '../../shared/api/bffClient';
import type {
  PapaChatMessage,
} from '../../screens/papa/papaData';
import type {
  PapaScreenContextSnapshot,
} from './ScreenContextProvider';

export type PapaAssistantMode =
  | 'screen'
  | 'element'
  | 'report';

export type PapaAssistantOpenAction =
  | 'analyze-screen'
  | 'open'
  | 'open-element'
  | 'report';

export type PapaAssistantOpenRequest = {
  readonly action: PapaAssistantOpenAction;
  readonly elementId?: string | null;
  readonly id: string;
  readonly mode?: PapaAssistantMode | null;
};

export type PapaAssistantRuntimeScope = {
  readonly tenantId: string | null;
  readonly userId: string | null;
  readonly workspaceId: string | null;
};

export type PapaAssistantReportFormat =
  | 'csv'
  | 'pdf'
  | 'xlsx';

export type PapaAssistantReportScope =
  | 'metrics'
  | 'recommendations'
  | 'screen'
  | 'tables';

export type PapaAssistantReportArtifact = {
  readonly chartCount: number;
  readonly dateRangeLabel: string;
  readonly description: string;
  readonly evidenceCount: number;
  readonly format: PapaAssistantReportFormat;
  readonly generatedAt: string;
  readonly id: string;
  readonly metricCount: number;
  readonly owner: string;
  readonly recommendationCount: number;
  readonly route: string;
  readonly scope: PapaAssistantReportScope;
  readonly screenTitle: string;
  readonly serverReportId: string;
  readonly size: number;
  readonly snapshotId: string;
  readonly status: BffReportRecord['status'];
  readonly tableCount: number;
  readonly title: string;
};

type PapaAssistantRuntimeState = {
  readonly caseThreadIdsByElement: Readonly<Record<string, string>>;
  readonly composerDrafts: Readonly<Record<string, string>>;
  readonly conversationId: string | null;
  readonly elementError: string | null;
  readonly elementMessages: readonly PapaChatMessage[];
  readonly elementSubmitting: boolean;
  readonly lastSnapshot: PapaScreenContextSnapshot | null;
  readonly mainError: string | null;
  readonly mainSubmitting: boolean;
  readonly messages: readonly PapaChatMessage[];
  readonly parentConversationId: string | null;
  readonly reportError: string | null;
  readonly reports: readonly PapaAssistantReportArtifact[];
};

type PapaAssistantRuntimeContextValue = PapaAssistantRuntimeState & {
  readonly addElementMessages:
    (messages: readonly PapaChatMessage[]) => void;
  readonly addMainMessages:
    (messages: readonly PapaChatMessage[]) => void;
  readonly captureContext: (
    snapshot: PapaScreenContextSnapshot,
    captureReason: string,
  ) => Promise<void>;
  readonly clearComposerDraft: (scope: string) => void;
  readonly createReport: (
    snapshot: PapaScreenContextSnapshot,
    format: PapaAssistantReportFormat,
    scope: PapaAssistantReportScope,
  ) => Promise<PapaAssistantReportArtifact>;
  readonly downloadReport: (
    report: PapaAssistantReportArtifact,
  ) => Promise<void>;
  readonly rememberSnapshot: (snapshot: PapaScreenContextSnapshot) => void;
  readonly resetConversation: () => void;
  readonly scope: PapaAssistantRuntimeScope;
  readonly setComposerDraft: (scope: string, draft: string) => void;
  readonly submitElementMessage: (
    elementId: string,
    prompt: string,
  ) => Promise<void>;
  readonly submitMainMessage: (prompt: string) => Promise<void>;
};

const fallbackScope: PapaAssistantRuntimeScope = {
  tenantId: null,
  userId: null,
  workspaceId: null,
};

const fallbackRuntimeState: PapaAssistantRuntimeState = {
  caseThreadIdsByElement: {},
  composerDrafts: {},
  conversationId: null,
  elementError: null,
  elementMessages: [],
  elementSubmitting: false,
  lastSnapshot: null,
  mainError: null,
  mainSubmitting: false,
  messages: [],
  parentConversationId: null,
  reportError: null,
  reports: [],
};

const PapaAssistantRuntimeStateContext =
  createContext<PapaAssistantRuntimeContextValue>({
    ...fallbackRuntimeState,
    addElementMessages: () => undefined,
    addMainMessages: () => undefined,
    captureContext: () => Promise.resolve(),
    clearComposerDraft: () => undefined,
    createReport: () => Promise.reject(new Error('Brak aktywnego runtime Papa.')),
    downloadReport: () => Promise.reject(new Error('Brak aktywnego runtime Papa.')),
    rememberSnapshot: () => undefined,
    resetConversation: () => undefined,
    scope: fallbackScope,
    setComposerDraft: () => undefined,
    submitElementMessage: () => Promise.resolve(),
    submitMainMessage: () => Promise.resolve(),
  });

export function PapaAssistantRuntimeProvider({
  children,
  scope = fallbackScope,
}: {
  readonly children: ReactNode;
  readonly scope?: PapaAssistantRuntimeScope;
}) {
  const storageKey = useMemo(() => (
    resolveRuntimeStorageKey(scope)
  ), [scope]);
  const [state, setState] = useState<PapaAssistantRuntimeState>(() => (
    readStoredRuntimeState(storageKey)
  ));
  const stateRef = useRef(state);
  const storageKeyRef = useRef(storageKey);

  useEffect(() => {
    if (storageKeyRef.current === storageKey) {
      return;
    }

    storageKeyRef.current = storageKey;
    setState(readStoredRuntimeState(storageKey));
  }, [storageKey]);

  useEffect(() => {
    stateRef.current = state;
    writeStoredRuntimeState(storageKey, state);
  }, [state, storageKey]);

  useEffect(() => {
    const conversationId = state.conversationId;
    if (!conversationId || !scope.workspaceId || !scope.tenantId) {
      return;
    }

    let active = true;

    void hydrateConversation(conversationId, state.caseThreadIdsByElement)
      .then(({ elementMessages, messages }) => {
        if (!active) return;
        setState((current) => {
          if (current.conversationId !== conversationId) {
            return current;
          }

          return {
            ...current,
            elementMessages: mergeMessages(current.elementMessages, elementMessages),
            messages: mergeMessages(current.messages, messages),
          };
        });
      })
      .catch(() => {
        // A stale scoped conversation id must not expose data. Clearing the
        // id forces the next interaction to start a new tenant-safe thread.
        if (!active) return;
        setState((current) => (
          current.conversationId === conversationId
            ? {
                ...current,
                caseThreadIdsByElement: {},
                conversationId: null,
                elementMessages: [],
                messages: [],
              }
            : current
        ));
      });

    return () => {
      active = false;
    };
  }, [scope.tenantId, scope.workspaceId, state.conversationId]);

  const addMainMessages = useCallback((
    messages: readonly PapaChatMessage[],
  ) => {
    if (messages.length === 0) return;
    setState((current) => ({
      ...current,
      messages: mergeMessages(current.messages, messages),
    }));
  }, []);

  const addElementMessages = useCallback((
    messages: readonly PapaChatMessage[],
  ) => {
    if (messages.length === 0) return;
    setState((current) => ({
      ...current,
      elementMessages: mergeMessages(current.elementMessages, messages),
    }));
  }, []);

  const rememberSnapshot = useCallback((
    snapshot: PapaScreenContextSnapshot,
  ) => {
    setState((current) => ({ ...current, lastSnapshot: snapshot }));
  }, []);

  const setComposerDraft = useCallback((scopeKey: string, draft: string) => {
    setState((current) => ({
      ...current,
      composerDrafts: {
        ...current.composerDrafts,
        [scopeKey]: draft,
      },
    }));
  }, []);

  const clearComposerDraft = useCallback((scopeKey: string) => {
    setState((current) => {
      const { [scopeKey]: _removed, ...nextDrafts } = current.composerDrafts;
      void _removed;
      return { ...current, composerDrafts: nextDrafts };
    });
  }, []);

  const captureContext = useCallback(async (
    snapshot: PapaScreenContextSnapshot,
    captureReason: string,
  ): Promise<void> => {
    setState((current) => ({
      ...current,
      lastSnapshot: snapshot,
      mainError: null,
    }));

    try {
      const result = await bffClient.capturePapaContext({
        captureReason,
        conversationId: stateRef.current.conversationId,
        idempotencyKey: stableIdempotencyKey(
          `papa-context-${snapshot.snapshotId}-${captureReason}`,
        ),
        parentConversationId: null,
        snapshot: snapshot as unknown as Record<string, unknown>,
        title: snapshot.title,
      });

      setState((current) => ({
        ...current,
        conversationId: result.conversationId,
      }));
    } catch (error) {
      const message = describePapaError(error);
      setState((current) => ({ ...current, mainError: message }));
      throw error;
    }
  }, []);

  const submitMainMessage = useCallback(async (
    prompt: string,
  ): Promise<void> => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const userMessage = createPapaAssistantMessage({
      author: 'user',
      body: trimmed,
      evidenceIds: [],
    });

    setState((current) => ({
      ...current,
      mainError: null,
      mainSubmitting: true,
      messages: mergeMessages(current.messages, [userMessage]),
    }));

    try {
      const result = await bffClient.generatePapaAnswer({
        caseThreadId: null,
        conversationId: stateRef.current.conversationId,
        idempotencyKey: stableIdempotencyKey(`papa-answer-${userMessage.id}`),
        parentConversationId: null,
        prompt: trimmed,
      });

      setState((current) => ({
        ...current,
        conversationId: result.conversationId,
        mainSubmitting: false,
        messages: mergeMessages(current.messages, [
          papaAnswerRecordToMessage(result.record),
        ]),
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        mainError: describePapaError(error),
        mainSubmitting: false,
      }));
      throw error;
    }
  }, []);

  const submitElementMessage = useCallback(async (
    elementId: string,
    prompt: string,
  ): Promise<void> => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const userMessage = createPapaAssistantMessage({
      author: 'user',
      body: trimmed,
      contextItemId: elementId,
      evidenceIds: [],
    });

    setState((current) => ({
      ...current,
      elementError: null,
      elementMessages: mergeMessages(current.elementMessages, [userMessage]),
      elementSubmitting: true,
    }));

    try {
      const mainConversationId = await ensureMainConversation(
        stateRef.current,
        elementId,
      );
      const caseThreadId = await ensureCaseThread(
        stateRef.current,
        mainConversationId,
        elementId,
      );
      const result = await bffClient.generatePapaAnswer({
        caseThreadId,
        conversationId: mainConversationId,
        idempotencyKey: stableIdempotencyKey(`papa-case-answer-${userMessage.id}`),
        parentConversationId: null,
        prompt: trimmed,
      });

      setState((current) => ({
        ...current,
        caseThreadIdsByElement: {
          ...current.caseThreadIdsByElement,
          [elementId]: result.caseThreadId ?? caseThreadId,
        },
        conversationId: mainConversationId,
        elementMessages: mergeMessages(current.elementMessages, [
          papaAnswerRecordToMessage(result.record, elementId),
        ]),
        elementSubmitting: false,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        elementError: describePapaError(error),
        elementSubmitting: false,
      }));
      throw error;
    }
  }, []);

  const createReport = useCallback(async (
    snapshot: PapaScreenContextSnapshot,
    format: PapaAssistantReportFormat,
    reportScope: PapaAssistantReportScope,
  ): Promise<PapaAssistantReportArtifact> => {
    const range = resolveSnapshotDateRange(snapshot);
    const idempotencyKey = stableIdempotencyKey(
      `papa-report-${snapshot.snapshotId}-${reportScope}-${format}`,
    );

    try {
      const record = await bffClient.createPapaReport({
        dateFrom: range.from,
        dateTo: range.to,
        filters: {
          chartIds: snapshot.charts.map((item) => item.id),
          evidenceIds: snapshot.evidence.map((item) => item.id),
          metricIds: snapshot.metrics.map((item) => item.id),
          recommendationIds: snapshot.recommendations.map((item) => item.id),
          route: snapshot.route,
          scope: reportScope,
          screenId: snapshot.screenId,
          snapshotId: snapshot.snapshotId,
          tableIds: snapshot.tables.map((item) => item.id),
        },
        format,
        idempotencyKey,
        reportType: 'papa-laboratory',
      });
      const report = buildServerReportArtifact(snapshot, reportScope, format, record);

      setState((current) => ({
        ...current,
        lastSnapshot: snapshot,
        reportError: null,
        reports: [
          report,
          ...current.reports.filter((item) => item.id !== report.id),
        ].slice(0, 12),
      }));

      return report;
    } catch (error) {
      setState((current) => ({
        ...current,
        reportError: describePapaError(error),
      }));
      throw error;
    }
  }, []);

  const downloadReport = useCallback(async (
    report: PapaAssistantReportArtifact,
  ): Promise<void> => {
    try {
      const latest = await bffClient.readPapaReport(report.serverReportId);
      const refreshed = {
        ...report,
        size: latest.size_bytes ?? report.size,
        status: latest.status,
      };

      setState((current) => ({
        ...current,
        reportError: null,
        reports: current.reports.map((item) => (
          item.id === report.id ? refreshed : item
        )),
      }));

      if (latest.status !== 'ready') {
        throw new Error(
          latest.status === 'failed'
            ? `Raport nie został wygenerowany (${latest.error_code ?? 'nieznany błąd'}).`
            : 'Raport jest jeszcze przetwarzany. Spróbuj ponownie za chwilę.',
        );
      }

      const download = await bffClient.getPapaReportDownload(report.serverReportId);
      if (typeof window !== 'undefined') {
        window.open(download.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      setState((current) => ({
        ...current,
        reportError: describePapaError(error),
      }));
      throw error;
    }
  }, []);

  const resetConversation = useCallback(() => {
    setState({
      ...fallbackRuntimeState,
      messages: [
        createPapaAssistantMessage({
          author: 'system',
          body: 'Nowa rozmowa Papa została rozpoczęta jawnie przez użytkownika.',
          evidenceIds: [],
        }),
      ],
    });
  }, []);

  const value = useMemo<PapaAssistantRuntimeContextValue>(() => ({
    ...state,
    addElementMessages,
    addMainMessages,
    captureContext,
    clearComposerDraft,
    createReport,
    downloadReport,
    rememberSnapshot,
    resetConversation,
    scope,
    setComposerDraft,
    submitElementMessage,
    submitMainMessage,
  }), [
    addElementMessages,
    addMainMessages,
    captureContext,
    clearComposerDraft,
    createReport,
    downloadReport,
    rememberSnapshot,
    resetConversation,
    scope,
    setComposerDraft,
    state,
    submitElementMessage,
    submitMainMessage,
  ]);

  return (
    <PapaAssistantRuntimeStateContext.Provider value={value}>
      {children}
    </PapaAssistantRuntimeStateContext.Provider>
  );
}

export function usePapaAssistantRuntime(): PapaAssistantRuntimeContextValue {
  return useContext(PapaAssistantRuntimeStateContext);
}

export function createPapaAssistantMessage({
  author,
  body,
  contextItemId,
  evidenceIds,
}: {
  readonly author: PapaChatMessage['author'];
  readonly body: string;
  readonly contextItemId?: string;
  readonly evidenceIds: readonly string[];
}): PapaChatMessage {
  return {
    author,
    body,
    contextItemId,
    createdAt: new Date().toISOString(),
    evidenceIds,
    id: `papa-message-${author}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
}

function papaAnswerRecordToMessage(
  record: PapaAnswerRecord,
  contextItemId?: string,
): PapaChatMessage {
  return {
    approvalRequired: record.approvalRequired,
    author: record.role,
    body: record.content,
    confidence: record.confidence,
    contextItemId,
    createdAt: record.createdAt,
    evidenceIds: record.evidence.map((item) => item.evidenceId),
    id: record.messageId,
    isRefusal: record.status === 'blocked',
    riskLevel: record.riskLevel,
  };
}

async function hydrateConversation(
  conversationId: string,
  caseThreadIdsByElement: Readonly<Record<string, string>>,
): Promise<{
  readonly elementMessages: readonly PapaChatMessage[];
  readonly messages: readonly PapaChatMessage[];
}> {
  const main = await bffClient.readPapaAnswers(conversationId);
  const messages = [...main.records]
    .reverse()
    .map((record) => papaAnswerRecordToMessage(record));
  const caseEntries = Object.entries(caseThreadIdsByElement);
  const caseResults = await Promise.all(caseEntries.map(async ([elementId, threadId]) => {
    const result = await bffClient.readPapaAnswers(threadId);
    return [...result.records]
      .reverse()
      .map((record) => papaAnswerRecordToMessage(record, elementId));
  }));

  return {
    elementMessages: caseResults.flat(),
    messages,
  };
}

async function ensureMainConversation(
  state: PapaAssistantRuntimeState,
  elementId: string,
): Promise<string> {
  if (state.conversationId) return state.conversationId;
  if (!state.lastSnapshot) {
    throw new Error(
      `Nie można utworzyć sprawy „${elementId}” bez snapshotu kontekstu. Najpierw przeanalizuj ekran.`,
    );
  }

  const result = await bffClient.capturePapaContext({
    captureReason: 'case-parent-context',
    conversationId: null,
    idempotencyKey: stableIdempotencyKey(
      `papa-main-${state.lastSnapshot.snapshotId}`,
    ),
    parentConversationId: null,
    snapshot: state.lastSnapshot as unknown as Record<string, unknown>,
    title: state.lastSnapshot.title,
  });
  return result.conversationId;
}

async function ensureCaseThread(
  state: PapaAssistantRuntimeState,
  mainConversationId: string,
  elementId: string,
): Promise<string> {
  const existing = state.caseThreadIdsByElement[elementId];
  if (existing) return existing;
  if (!state.lastSnapshot) {
    throw new Error('Brak snapshotu kontekstu dla sprawy AI.');
  }

  const result = await bffClient.capturePapaContext({
    captureReason: `case:${elementId}`,
    conversationId: null,
    idempotencyKey: stableIdempotencyKey(
      `papa-case-${mainConversationId}-${elementId}`,
    ),
    parentConversationId: mainConversationId,
    snapshot: {
      ...state.lastSnapshot,
      caseElementId: elementId,
    },
    title: `Sprawa Papa: ${elementId}`,
  });
  return result.conversationId;
}

function describePapaError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Papa nie mógł przetworzyć tego żądania.';
}

export function resolvePapaMainDraftScope(): string {
  return 'main';
}

export function resolvePapaElementDraftScope(elementId: string): string {
  return `element-${elementId}`;
}

function resolveRuntimeStorageKey(
  scope: PapaAssistantRuntimeScope,
): string | null {
  if (!scope.tenantId || !scope.workspaceId || !scope.userId) {
    return null;
  }

  return [
    'papadata.papa-assistant-runtime.v4',
    scope.tenantId,
    scope.workspaceId,
    scope.userId,
  ].map(sanitizeStorageSegment).join(':');
}

function sanitizeStorageSegment(value: string): string {
  return encodeURIComponent(value).slice(0, 180);
}

type StoredPapaRuntimeState = {
  readonly caseThreadIdsByElement: Readonly<Record<string, string>>;
  readonly composerDrafts: Readonly<Record<string, string>>;
  readonly conversationId: string | null;
  readonly parentConversationId: string | null;
};

function readStoredRuntimeState(
  storageKey: string | null,
): PapaAssistantRuntimeState {
  if (typeof window === 'undefined' || !storageKey) {
    return fallbackRuntimeState;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return fallbackRuntimeState;
    const parsed = JSON.parse(raw) as unknown;
    if (!isStoredRuntimeState(parsed)) return fallbackRuntimeState;

    return {
      ...fallbackRuntimeState,
      caseThreadIdsByElement: parsed.caseThreadIdsByElement,
      composerDrafts: parsed.composerDrafts,
      conversationId: parsed.conversationId,
      parentConversationId: parsed.parentConversationId,
    };
  } catch {
    return fallbackRuntimeState;
  }
}

function writeStoredRuntimeState(
  storageKey: string | null,
  state: PapaAssistantRuntimeState,
): void {
  if (typeof window === 'undefined' || !storageKey) return;

  const safeState: StoredPapaRuntimeState = {
    caseThreadIdsByElement: state.caseThreadIdsByElement,
    composerDrafts: state.composerDrafts,
    conversationId: state.conversationId,
    parentConversationId: state.parentConversationId,
  };

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(safeState));
  } catch {
    // Scoped continuity is a progressive enhancement. Business snapshots,
    // reports and message bodies are intentionally never persisted here.
  }
}

function isStoredRuntimeState(value: unknown): value is StoredPapaRuntimeState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;

  return (
    (record.conversationId === null || typeof record.conversationId === 'string')
    && (record.parentConversationId === null || typeof record.parentConversationId === 'string')
    && isStringRecord(record.caseThreadIdsByElement)
    && isStringRecord(record.composerDrafts)
  );
}

function isStringRecord(
  value: unknown,
): value is Readonly<Record<string, string>> {
  return Boolean(value)
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.values(value as Record<string, unknown>).every((item) => (
      typeof item === 'string'
    ));
}

function mergeMessages(
  current: readonly PapaChatMessage[],
  incoming: readonly PapaChatMessage[],
): readonly PapaChatMessage[] {
  const byId = new Map<string, PapaChatMessage>();
  [...current, ...incoming].forEach((message) => byId.set(message.id, message));
  return [...byId.values()].sort((left, right) => (
    left.createdAt.localeCompare(right.createdAt)
  ));
}

function stableIdempotencyKey(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9._:-]/gu, '-')
    .slice(0, 128);
}

function resolveSnapshotDateRange(
  snapshot: PapaScreenContextSnapshot,
): { readonly from: string; readonly to: string } {
  if (snapshot.dateRange) {
    return {
      from: snapshot.dateRange.from,
      to: snapshot.dateRange.to,
    };
  }

  const now = new Date();
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: now.toISOString() };
}

function buildServerReportArtifact(
  snapshot: PapaScreenContextSnapshot,
  reportScope: PapaAssistantReportScope,
  format: PapaAssistantReportFormat,
  record: BffReportRecord,
): PapaAssistantReportArtifact {
  return {
    chartCount: snapshot.charts.length,
    dateRangeLabel: snapshot.dateRangeLabel,
    description: `Raport backendowy dla snapshotu ${snapshot.snapshotId}.`,
    evidenceCount: snapshot.evidence.length,
    format: 'csv',
    generatedAt: record.created_at,
    id: `papa-report-${record.id}`,
    metricCount: snapshot.metrics.length,
    owner: snapshot.userLabel,
    recommendationCount: snapshot.recommendations.length,
    route: snapshot.route,
    scope: reportScope,
    screenTitle: snapshot.title,
    serverReportId: record.id,
    size: record.size_bytes ?? 0,
    snapshotId: snapshot.snapshotId,
    status: record.status,
    tableCount: snapshot.tables.length,
    title: `Raport Papa: ${snapshot.title}`,
  };
}
