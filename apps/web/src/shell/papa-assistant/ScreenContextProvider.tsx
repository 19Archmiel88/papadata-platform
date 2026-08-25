import type {
  ReactNode,
} from 'react';
import type {
  DateRange,
} from '../../../../../contracts/ui-contract-types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type PapaScreenContextElementKind =
  | 'chart'
  | 'decision'
  | 'evidence'
  | 'filter'
  | 'metric'
  | 'recommendation'
  | 'record'
  | 'table';

export type PapaScreenContextElement = {
  readonly description?: string | null;
  readonly evidenceIds?: readonly string[];
  readonly id: string;
  readonly kind: PapaScreenContextElementKind;
  readonly label: string;
  readonly owner?: string | null;
  readonly source?: string | null;
  readonly status?: string | null;
  readonly value?: string | null;
};

export type PapaScreenContextRegistration = {
  readonly activeSection?: string | null;
  readonly breadcrumbs?: readonly string[];
  readonly charts?: readonly PapaScreenContextElement[];
  readonly elements?: readonly PapaScreenContextElement[];
  readonly evidence?: readonly PapaScreenContextElement[];
  readonly filters?: readonly PapaScreenContextElement[];
  readonly metrics?: readonly PapaScreenContextElement[];
  readonly operationId?: string | null;
  readonly readiness?: string | null;
  readonly recommendations?: readonly PapaScreenContextElement[];
  readonly route: string;
  readonly screenId?: string | null;
  readonly summary?: string | null;
  readonly tables?: readonly PapaScreenContextElement[];
  readonly title: string;
};

export type PapaScreenContext = Required<
  Pick<
    PapaScreenContextRegistration,
    | 'breadcrumbs'
    | 'charts'
    | 'elements'
    | 'evidence'
    | 'filters'
    | 'metrics'
    | 'recommendations'
    | 'tables'
  >
> & {
  readonly activeSection: string | null;
  readonly dateRange: DateRange | null;
  readonly dateRangeLabel: string;
  readonly operationId: string | null;
  readonly readiness: string | null;
  readonly route: string;
  readonly screenId: string | null;
  readonly sectionLabel: string;
  readonly summary: string | null;
  readonly title: string;
  readonly updatedAt: string;
  readonly userLabel: string;
  readonly workspaceId: string | null;
  readonly workspaceName: string;
};

export type PapaScreenContextSnapshot = PapaScreenContext & {
  readonly captureReason: string;
  readonly capturedAt: string;
  readonly snapshotId: string;
};

type PapaScreenContextValue = {
  readonly captureCurrentScreenContext:
    (captureReason: string) => PapaScreenContextSnapshot;
  readonly currentContext: PapaScreenContext;
  readonly registerScreenContext:
    (registration: PapaScreenContextRegistration) => () => void;
};

const fallbackContext: PapaScreenContext = {
  activeSection: null,
  breadcrumbs: ['Aplikacja'],
  charts: [],
  dateRange: null,
  dateRangeLabel: 'Bieżący zakres',
  elements: [],
  evidence: [],
  filters: [],
  metrics: [],
  operationId: null,
  readiness: null,
  recommendations: [],
  route: '/app',
  screenId: null,
  sectionLabel: 'PapaData',
  summary: null,
  tables: [],
  title: 'PapaData',
  updatedAt: new Date(0).toISOString(),
  userLabel: 'Aktywny użytkownik',
  workspaceId: null,
  workspaceName: 'Workspace',
};

const PapaScreenContextState =
  createContext<PapaScreenContextValue>({
    captureCurrentScreenContext: () => ({
      ...fallbackContext,
      captureReason: 'fallback',
      capturedAt: new Date().toISOString(),
      snapshotId: 'papa-context-fallback',
    }),
    currentContext: fallbackContext,
    registerScreenContext: () => () => undefined,
  });

export function PapaScreenContextProvider({
  activePath,
  children,
  dateRange,
  dateRangeLabel,
  sectionLabel,
  userLabel,
  workspaceId,
  workspaceName,
}: {
  readonly activePath: string;
  readonly children: ReactNode;
  readonly dateRange: DateRange;
  readonly dateRangeLabel: string;
  readonly sectionLabel: string;
  readonly userLabel: string;
  readonly workspaceId?: string | null;
  readonly workspaceName: string;
}) {
  const [registration, setRegistration] =
    useState<PapaScreenContextRegistration | null>(null);

  const baseContext = useMemo<PapaScreenContext>(() => ({
    ...fallbackContext,
    breadcrumbs: ['Aplikacja', sectionLabel],
    dateRange,
    dateRangeLabel,
    route: activePath,
    sectionLabel,
    title: sectionLabel,
    updatedAt: new Date().toISOString(),
    userLabel,
    workspaceId: workspaceId ?? null,
    workspaceName,
  }), [
    activePath,
    dateRange,
    dateRangeLabel,
    sectionLabel,
    userLabel,
    workspaceId,
    workspaceName,
  ]);

  useEffect(() => {
    setRegistration(null);
  }, [
    activePath,
  ]);

  const currentContext = useMemo<PapaScreenContext>(() => {
    if (!registration) {
      return baseContext;
    }

    return {
      ...baseContext,
      activeSection: registration.activeSection ?? null,
      breadcrumbs: registration.breadcrumbs ?? baseContext.breadcrumbs,
      charts: registration.charts ?? [],
      elements: registration.elements ?? [],
      evidence: registration.evidence ?? [],
      filters: registration.filters ?? [],
      metrics: registration.metrics ?? [],
      operationId: registration.operationId ?? null,
      readiness: registration.readiness ?? null,
      recommendations: registration.recommendations ?? [],
      route: registration.route,
      screenId: registration.screenId ?? null,
      summary: registration.summary ?? null,
      tables: registration.tables ?? [],
      title: registration.title,
      updatedAt: new Date().toISOString(),
    };
  }, [
    baseContext,
    registration,
  ]);

  const registerScreenContext = useCallback((
    nextRegistration: PapaScreenContextRegistration,
  ) => {
    setRegistration(nextRegistration);

    return () => {
      setRegistration((current) => (
        current?.route === nextRegistration.route
        && current?.screenId === nextRegistration.screenId
          ? null
          : current
      ));
    };
  }, []);

  const captureCurrentScreenContext = useCallback((
    captureReason: string,
  ): PapaScreenContextSnapshot => {
    const capturedAt = new Date().toISOString();

    return {
      ...currentContext,
      captureReason,
      capturedAt,
      snapshotId: `papa-context-${Date.now()}`,
    };
  }, [
    currentContext,
  ]);

  const value = useMemo<PapaScreenContextValue>(() => ({
    captureCurrentScreenContext,
    currentContext,
    registerScreenContext,
  }), [
    captureCurrentScreenContext,
    currentContext,
    registerScreenContext,
  ]);

  return (
    <PapaScreenContextState.Provider value={value}>
      {children}
    </PapaScreenContextState.Provider>
  );
}

export function usePapaScreenContext(): PapaScreenContextValue {
  return useContext(PapaScreenContextState);
}

export function useRegisterScreenContext(
  registration: PapaScreenContextRegistration,
) {
  const {
    registerScreenContext,
  } = usePapaScreenContext();

  useEffect(() => (
    registerScreenContext(registration)
  ), [
    registerScreenContext,
    registration,
  ]);
}
