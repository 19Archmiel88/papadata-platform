import type {
  ReactNode,
} from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  createPapaStorybookData,
} from '../../screens/papa/papaData';
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

export type PapaAssistantReportFormat =
  | 'csv'
  | 'pdf';

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
  readonly size: number;
  readonly snapshot: PapaScreenContextSnapshot;
  readonly snapshotId: string;
  readonly status: 'ready';
  readonly tableCount: number;
  readonly title: string;
};

type PapaAssistantRuntimeState = {
  readonly conversationId: string;
  readonly elementMessages: readonly PapaChatMessage[];
  readonly lastSnapshot: PapaScreenContextSnapshot | null;
  readonly messages: readonly PapaChatMessage[];
  readonly reports: readonly PapaAssistantReportArtifact[];
};

type PapaAssistantRuntimeContextValue = PapaAssistantRuntimeState & {
  readonly addElementMessages:
    (messages: readonly PapaChatMessage[]) => void;
  readonly addMainMessages:
    (messages: readonly PapaChatMessage[]) => void;
  readonly createReport: (
    snapshot: PapaScreenContextSnapshot,
    format: PapaAssistantReportFormat,
    scope: PapaAssistantReportScope,
  ) => PapaAssistantReportArtifact;
  readonly rememberSnapshot: (snapshot: PapaScreenContextSnapshot) => void;
  readonly resetConversation: () => void;
};

const papaAssistantRuntimeStorageKey =
  'papadata.papa-assistant-runtime.v1';

const fallbackRuntimeState: PapaAssistantRuntimeState = {
  conversationId: 'conv-papa-local-client',
  elementMessages: [],
  lastSnapshot: null,
  messages: createPapaStorybookData().chatMessages,
  reports: [],
};

const PapaAssistantRuntimeStateContext =
  createContext<PapaAssistantRuntimeContextValue>({
    ...fallbackRuntimeState,
    addElementMessages: () => undefined,
    addMainMessages: () => undefined,
    createReport: (snapshot, format, scope) => (
      buildPapaAssistantReportArtifact(snapshot, format, scope)
    ),
    rememberSnapshot: () => undefined,
    resetConversation: () => undefined,
  });

export function PapaAssistantRuntimeProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [state, setState] = useState<PapaAssistantRuntimeState>(
    readStoredRuntimeState,
  );

  useEffect(() => {
    writeStoredRuntimeState(state);
  }, [
    state,
  ]);

  const addMainMessages = useCallback((
    messages: readonly PapaChatMessage[],
  ) => {
    if (messages.length === 0) {
      return;
    }

    setState((current) => ({
      ...current,
      messages: [
        ...current.messages,
        ...messages,
      ],
    }));
  }, []);

  const addElementMessages = useCallback((
    messages: readonly PapaChatMessage[],
  ) => {
    if (messages.length === 0) {
      return;
    }

    setState((current) => ({
      ...current,
      elementMessages: [
        ...current.elementMessages,
        ...messages,
      ],
    }));
  }, []);

  const rememberSnapshot = useCallback((
    snapshot: PapaScreenContextSnapshot,
  ) => {
    setState((current) => ({
      ...current,
      lastSnapshot: snapshot,
    }));
  }, []);

  const createReport = useCallback((
    snapshot: PapaScreenContextSnapshot,
    format: PapaAssistantReportFormat,
    scope: PapaAssistantReportScope,
  ) => {
    const report = buildPapaAssistantReportArtifact(
      snapshot,
      format,
      scope,
    );

    setState((current) => ({
      ...current,
      lastSnapshot: snapshot,
      reports: [
        report,
        ...current.reports,
      ].slice(0, 12),
    }));

    return report;
  }, []);

  const resetConversation = useCallback(() => {
    setState({
      conversationId: `conv-papa-local-${Date.now()}`,
      elementMessages: [],
      lastSnapshot: null,
      messages: [
        createPapaAssistantMessage({
          author: 'system',
          body: 'Nowa rozmowa Papa została rozpoczęta jawnie przez użytkownika.',
          evidenceIds: [],
        }),
      ],
      reports: [],
    });
  }, []);

  const value = useMemo<PapaAssistantRuntimeContextValue>(() => ({
    ...state,
    addElementMessages,
    addMainMessages,
    createReport,
    rememberSnapshot,
    resetConversation,
  }), [
    addElementMessages,
    addMainMessages,
    createReport,
    rememberSnapshot,
    resetConversation,
    state,
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

export function downloadPapaAssistantReport(
  report: PapaAssistantReportArtifact,
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const blob = report.format === 'pdf'
    ? buildPapaReportPdfBlob(report)
    : buildPapaReportCsvBlob(report);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${report.id}.${report.format}`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

function readStoredRuntimeState(): PapaAssistantRuntimeState {
  if (typeof window === 'undefined') {
    return fallbackRuntimeState;
  }

  try {
    const raw = window.localStorage.getItem(
      papaAssistantRuntimeStorageKey,
    );

    if (!raw) {
      return fallbackRuntimeState;
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!isRuntimeState(parsed)) {
      return fallbackRuntimeState;
    }

    return parsed;
  } catch {
    return fallbackRuntimeState;
  }
}

function writeStoredRuntimeState(
  state: PapaAssistantRuntimeState,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      papaAssistantRuntimeStorageKey,
      JSON.stringify(state),
    );
  } catch {
    // Runtime continuity is local-only progressive enhancement.
  }
}

function isRuntimeState(value: unknown): value is PapaAssistantRuntimeState {
  return Boolean(value)
    && typeof value === 'object'
    && typeof (value as PapaAssistantRuntimeState).conversationId === 'string'
    && Array.isArray((value as PapaAssistantRuntimeState).messages)
    && Array.isArray((value as PapaAssistantRuntimeState).elementMessages)
    && Array.isArray((value as PapaAssistantRuntimeState).reports);
}

function buildPapaAssistantReportArtifact(
  snapshot: PapaScreenContextSnapshot,
  format: PapaAssistantReportFormat,
  scope: PapaAssistantReportScope,
): PapaAssistantReportArtifact {
  const generatedAt = new Date().toISOString();
  const title = `Raport Papa: ${snapshot.title}`;
  const description =
    `Snapshot ${snapshot.snapshotId}, zakres ${snapshot.dateRangeLabel}, workspace ${snapshot.workspaceName}.`;
  const report = {
    chartCount: snapshot.charts.length,
    dateRangeLabel: snapshot.dateRangeLabel,
    description,
    evidenceCount: snapshot.evidence.length,
    format,
    generatedAt,
    id: `papa-report-${scope}-${snapshot.screenId ?? 'screen'}-${Date.now()}`,
    metricCount: snapshot.metrics.length,
    owner: snapshot.userLabel,
    recommendationCount: snapshot.recommendations.length,
    route: snapshot.route,
    scope,
    screenTitle: snapshot.title,
    size: 0,
    snapshot,
    snapshotId: snapshot.snapshotId,
    status: 'ready' as const,
    tableCount: snapshot.tables.length,
    title,
  };

  return {
    ...report,
    size: estimateReportSize(report),
  };
}

function buildPapaReportCsvBlob(
  report: PapaAssistantReportArtifact,
): Blob {
  const rows = buildReportRows(report);
  const csv = rows
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\n');

  return new Blob([csv], {
    type: 'text/csv;charset=utf-8',
  });
}

function buildPapaReportPdfBlob(
  report: PapaAssistantReportArtifact,
): Blob {
  const lines = buildReportRows(report)
    .map((row) => row.filter(Boolean).join(' | '))
    .slice(0, 34)
    .map(toPdfText);
  const content = [
    'BT',
    '/F1 11 Tf',
    '42 760 Td',
    ...lines.flatMap((line, index) => [
      index === 0 ? '' : '0 -18 Td',
      `(${escapePdfText(line)}) Tj`,
    ]).filter(Boolean),
    'ET',
  ].join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  pdf += offsets.slice(1).map((offset) => (
    `${String(offset).padStart(10, '0')} 00000 n `
  )).join('\n');
  pdf += `\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], {
    type: 'application/pdf',
  });
}

function buildReportRows(
  report: PapaAssistantReportArtifact,
): readonly string[][] {
  const snapshot = report.snapshot;
  const rows: string[][] = [
    ['Raport', report.title],
    ['Format', report.format.toUpperCase()],
    ['Zakres', report.dateRangeLabel],
    ['Workspace', snapshot.workspaceName],
    ['Ekran', report.screenTitle],
    ['Route', report.route],
    ['Snapshot', report.snapshotId],
    ['Wygenerowano', formatDateTime(report.generatedAt)],
    ['Readiness', snapshot.readiness ?? 'Kontekst powłoki'],
    ['Filtry', snapshot.filters.map(formatContextElement).join(' | ')],
    [],
  ];

  if (report.scope === 'screen' || report.scope === 'metrics') {
    rows.push(
      ['Metryki', 'Wartość', 'Status', 'Opis'],
      ...snapshot.metrics.map((item) => [
        item.label,
        item.value ?? '',
        item.status ?? '',
        item.description ?? '',
      ]),
      [],
    );
  }

  if (report.scope === 'screen' || report.scope === 'recommendations') {
    rows.push(
      ['Rekomendacje', 'Następny krok', 'Status', 'Właściciel'],
      ...snapshot.recommendations.map((item) => [
        item.label,
        item.value ?? item.description ?? '',
        item.status ?? '',
        item.owner ?? '',
      ]),
      [],
    );
  }

  if (report.scope === 'screen' || report.scope === 'tables') {
    rows.push(
      ['Tabele', 'Zakres danych', 'Opis', 'Status'],
      ...snapshot.tables.map((item) => [
        item.label,
        item.value ?? '',
        item.description ?? '',
        item.status ?? '',
      ]),
      [],
    );
  }

  rows.push(
    ['Wykresy', 'Zakres', 'Opis', 'Status'],
    ...snapshot.charts.map((item) => [
      item.label,
      item.value ?? '',
      item.description ?? '',
      item.status ?? '',
    ]),
    [],
    ['Dowody', 'Źródło', 'Confidence', 'Opis'],
    ...snapshot.evidence.map((item) => [
      item.label,
      item.source ?? '',
      item.status ?? '',
      item.description ?? '',
    ]),
  );

  return rows;
}

function formatContextElement(
  element: { readonly label: string; readonly value?: string | null },
): string {
  return element.value
    ? `${element.label}: ${element.value}`
    : element.label;
}

function estimateReportSize(
  report: Omit<PapaAssistantReportArtifact, 'size'>,
): number {
  return JSON.stringify({
    chartCount: report.chartCount,
    dateRangeLabel: report.dateRangeLabel,
    evidenceCount: report.evidenceCount,
    metricCount: report.metricCount,
    recommendationCount: report.recommendationCount,
    route: report.route,
    scope: report.scope,
    snapshotId: report.snapshotId,
    tableCount: report.tableCount,
    title: report.title,
  }).length + buildReportRows({
    ...report,
    size: 0,
  }).flat().join('').length;
}

function escapeCsvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function toPdfText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replaceAll('ł', 'l')
    .replaceAll('Ł', 'L')
    .replace(/[^\x20-\x7E]/gu, '');
}

function escapePdfText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)');
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}
