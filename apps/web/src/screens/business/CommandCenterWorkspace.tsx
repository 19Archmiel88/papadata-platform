import type {
  MouseEvent,
} from 'react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Button,
  InlineNotice,
  PageHeader,
  SectionNavigation,
} from '../../design-system';
import type {
  AnalyticsDataState,
} from '../../design-system';
import type {
  PapaScreenContextElement,
} from '../../shell/papa-assistant';
import {
  formatShellDateRangeLabel,
  useShellDateRange,
} from '../../shell/app-shell';
import {
  useRegisterScreenContext,
} from '../../shell/papa-assistant';
import {
  businessScreenDefinitions,
  defaultWorkspaceContext,
} from './businessData';
import {
  CommandCenterOnePage,
} from './command-center';
import {
  CommandAnalyticsSection,
} from './command-center/commandCenterLegacyAnalytics';
import {
  CommandDataStatus,
  CommandDecisionBoard,
  CommandExecutiveBrief,
  CommandMetricSection,
  CommandRecordsSection,
  CommandSummaryStrip,
  buildCommandRows,
  renderVariant,
} from './command-center/commandCenterLegacyVariants';
import {
  buildOperationalDecisions,
  openPapaAssistant,
} from './command-center/commandCenterOnePageModel';
import {
  formatMetricValue,
  formatShortTime,
  formatSignedPercent,
  resolveDataStateLabel,
  resolveReadinessLabel,
} from './commandCenterWorkspaceFormatters';
import type {
  BusinessScreenData,
  BusinessScreenDefinition,
} from './businessData';
import './command-center-workspace.css';

type CommandCenterData = Extract<
  BusinessScreenData,
  { readonly group: 'command-center' }
>;

export type CommandCenterWorkspaceProps = {
  readonly data: CommandCenterData | null;
  readonly definition: BusinessScreenDefinition;
  readonly loading?: boolean;
  readonly mode?: 'runtime' | 'storybook';
  readonly onReload?: (() => void) | undefined;
  readonly problem?: string | null;
};

type CommandNavigationItem = {
  readonly href: string;
  readonly id: string;
  readonly label: string;
};

const commandCenterScreenNavigation: readonly CommandNavigationItem[] = (
  businessScreenDefinitions
    .filter((item) => (
      item.group === 'command-center'
      && item.id !== '30.14'
    ))
    .map((item) => ({
      href: item.route,
      id: item.id,
      label: item.displayTitle,
    }))
);

const commandCenterRuntimeNavigation = [
  {
    href: '#command-section-kpi',
    id: 'command-section-kpi',
    label: 'KPI',
  },
  {
    href: '#command-section-plan',
    id: 'command-section-plan',
    label: 'Plan vs Prognoza',
  },
] as const satisfies readonly CommandNavigationItem[];

/** Scroll distance before the runtime section rail may appear at all. */
const runtimeNavigationRevealOffset = 116;

/** Ignore sub-pixel jitter; only a deliberate gesture toggles the rail. */
const runtimeNavigationDirectionThreshold = 4;

/**
 * The product shell scrolls in an inner container, not the window, so the rail
 * has to listen wherever the workspace actually scrolls.
 */
function resolveScrollContainer(
  element: HTMLElement | null,
): HTMLElement | Window {
  if (!element || typeof window === 'undefined') {
    return window;
  }

  let current = element.parentElement;

  while (current) {
    const { overflowY } = window.getComputedStyle(current);

    if (
      (overflowY === 'auto' || overflowY === 'scroll')
      && current.scrollHeight > current.clientHeight
    ) {
      return current;
    }

    current = current.parentElement;
  }

  return window;
}

export function CommandCenterWorkspace({
  data,
  definition,
  loading = false,
  mode = 'runtime',
  onReload,
  problem = null,
}: CommandCenterWorkspaceProps) {
  const {
    dateRange,
  } = useShellDateRange();
  const workspaceContext = {
    ...defaultWorkspaceContext,
    range: dateRange,
  };
  const dataState = resolveDataState({
    data,
    loading,
    problem,
  });
  const [activeRuntimeSectionId, setActiveRuntimeSectionId] = useState<string>(
    commandCenterRuntimeNavigation[0]?.id ?? 'command-section-kpi',
  );
  const [isRuntimeNavigationVisible, setRuntimeNavigationVisible] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const isRuntimeOnePage = mode === 'runtime';
  const navigationItems = isRuntimeOnePage
    ? commandCenterRuntimeNavigation
    : commandCenterScreenNavigation;
  const pageHeadingTitle = isRuntimeOnePage
    ? 'Centrum Dowodzenia'
    : definition.displayTitle;
  const pageHeadingSubtitle = isRuntimeOnePage
    ? 'Landing page w przebudowie: aktywne sekcje to KPI oraz Plan vs Prognoza.'
    : definition.summary;

  useEffect(() => {
    if (!isRuntimeOnePage || typeof window === 'undefined') {
      return undefined;
    }

    const targets = commandCenterRuntimeNavigation.flatMap((item) => {
      const target = item.href.startsWith('#')
        ? document.getElementById(item.href.slice(1))
        : null;

      return target ? [{ id: item.id, target }] : [];
    });

    if (targets.length === 0) {
      return undefined;
    }

    const hashTarget = commandCenterRuntimeNavigation.find((item) => (
      item.href === window.location.hash
    ));

    if (hashTarget) {
      setActiveRuntimeSectionId(hashTarget.id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => (
            Math.abs(left.boundingClientRect.top)
            - Math.abs(right.boundingClientRect.top)
          ));
        const firstVisible = visible[0];

        if (!firstVisible) {
          return;
        }

        const matched = targets.find(({ target }) => (
          target === firstVisible.target
        ));

        if (matched) {
          setActiveRuntimeSectionId(matched.id);
        }
      },
      {
        root: null,
        rootMargin: '-18% 0px -62% 0px',
        threshold: [0.08, 0.18, 0.32],
      },
    );

    targets.forEach(({ target }) => observer.observe(target));

    return () => {
      observer.disconnect();
    };
  }, [isRuntimeOnePage]);

  useEffect(() => {
    if (!isRuntimeOnePage || typeof window === 'undefined') {
      return undefined;
    }

    // The product shell is `height: 100dvh; overflow: hidden` and scrolls in an
    // inner container, so window.scrollY never moves. Resolve the real scroller.
    const scroller = resolveScrollContainer(rootRef.current);
    const readOffset = () => (
      scroller === window
        ? window.scrollY
        : (scroller as HTMLElement).scrollTop
    );

    let animationFrameId: number | null = null;
    let previousOffset = readOffset();

    const updateVisibility = () => {
      animationFrameId = null;

      const offset = readOffset();
      const delta = offset - previousOffset;

      previousOffset = offset;

      if (window.location.hash.length > 1) {
        setRuntimeNavigationVisible(true);

        return;
      }

      if (offset <= runtimeNavigationRevealOffset) {
        setRuntimeNavigationVisible(false);

        return;
      }

      if (delta > runtimeNavigationDirectionThreshold) {
        setRuntimeNavigationVisible(true);

        return;
      }

      if (delta < -runtimeNavigationDirectionThreshold) {
        setRuntimeNavigationVisible(false);
      }
    };

    const requestVisibilityUpdate = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(updateVisibility);
    };

    scroller.addEventListener('scroll', requestVisibilityUpdate, {
      passive: true,
    });
    window.addEventListener('hashchange', updateVisibility);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      scroller.removeEventListener('scroll', requestVisibilityUpdate);
      window.removeEventListener('hashchange', updateVisibility);
    };
  }, [isRuntimeOnePage]);

  const issues = problem
    ? [
        {
          id: `${definition.id}-api-problem`,
          label: 'Odczyt danych jest niedostępny',
          severity: 'critical' as const,
        },
      ]
    : buildIssues(data);
  const screenContext = useMemo(() => ({
    activeSection: pageHeadingTitle,
    breadcrumbs: [
      'Aplikacja',
      'Centrum Dowodzenia',
      pageHeadingTitle,
    ],
    charts: buildCommandScreenCharts(data, definition),
    elements: buildCommandScreenElements(data),
    evidence: data ? data.evidence.map<PapaScreenContextElement>((item) => ({
      description: item.source,
      id: item.id,
      kind: 'evidence',
      label: item.label,
      source: item.source,
      status: `${Math.round((item.confidence ?? 0) * 100)}% confidence`,
    })) : [],
    filters: [
      {
        id: 'command-center-date-range',
        kind: 'filter' as const,
        label: 'Zakres dat',
        value: formatShellDateRangeLabel(dateRange),
      },
    ],
    metrics: buildCommandScreenMetrics(data),
    operationId: definition.operationId,
    readiness: data
      ? resolveDataStateLabel(dataState)
      : loading
        ? 'Ładowanie'
        : problem
          ? 'Błąd'
          : 'Brak danych',
    recommendations: data ? data.recommendations.slice(0, 4).map<PapaScreenContextElement>((item) => ({
      description: item.rationale,
      id: item.recommendationId,
      kind: 'recommendation',
      label: item.title,
      status: `${Math.round((item.confidence ?? 0) * 100)}% confidence`,
      value: item.impact,
    })) : [],
    route: isRuntimeOnePage ? '/app/command-center' : definition.route,
    screenId: definition.id,
    summary: pageHeadingSubtitle,
    tables: data ? [
      {
        description: 'Tabela alternatywna dla metryk i decyzji widoku.',
        id: `${definition.id}-records-table`,
        kind: 'table' as const,
        label: 'Rejestr operacyjny',
        value: `${data.records.length} pozycji`,
      },
    ] : [],
    title: pageHeadingTitle,
  }), [
    data,
    dataState,
    dateRange,
    definition,
    isRuntimeOnePage,
    loading,
    pageHeadingSubtitle,
    pageHeadingTitle,
    problem,
  ]);

  useRegisterScreenContext(screenContext);

  return (
    <section
      ref={rootRef}
      aria-busy={loading || undefined}
      aria-label={`Centrum Dowodzenia: ${pageHeadingTitle}`}
      className="pd-command-center-workspace pd-command-center-one-page"
      data-command-center-variant={definition.variant}
      data-data-state={dataState}
      data-refreshing={(loading && data) ? 'true' : undefined}
      data-mode={mode}
      data-screen-id={definition.id}
    >
      {isRuntimeOnePage ? null : (
      <PageHeader
        className="pd-command-center-workspace__header"
        breadcrumbs={[
          {
            href: '/app',
            label: 'Aplikacja',
          },
          {
            href: '/app/command-center',
            label: 'Centrum Dowodzenia',
          },
          {
            href: null,
            label: pageHeadingTitle,
          },
        ]}
        meta={[
          {
            label: 'Zakres',
            value: formatShellDateRangeLabel(dateRange),
          },
          {
            label: 'Segment',
            value: 'Commerce PL',
          },
          {
            label: 'Odświeżono',
            value: data ? formatShortTime(data.generatedAt) : '—',
          },
        ]}
        subtitle={pageHeadingSubtitle}
        title={pageHeadingTitle}
        actions={(
          <div className="pd-command-center-workspace__header-actions">
            <Button
              size="small"
              variant="secondary"
              onClick={() => openPapaAssistant({
                action: 'report',
                mode: 'report',
              })}
            >
              Raport Papa
            </Button>
            {onReload ? (
            <Button
              loading={loading}
              loadingLabel="Odświeżanie"
              size="small"
              variant="secondary"
              onClick={onReload}
            >
              Odśwież dane
            </Button>
            ) : null}
          </div>
        )}
      />
      )}

      {(!isRuntimeOnePage || (isRuntimeNavigationVisible && navigationItems.length > 1)) ? (
        <SectionNavigation
          activeId={isRuntimeOnePage ? activeRuntimeSectionId : definition.id}
          ariaLabel="Sekcje Centrum Dowodzenia"
          className="pd-command-center-workspace__navigation pd-command-center-one-page__navigation"
          itemProps={isRuntimeOnePage
            ? (item) => ({
                onClick: (event) => {
                  handleRuntimeNavigationClick(
                    item,
                    event,
                    setActiveRuntimeSectionId,
                  );
                },
              })
            : undefined}
          items={navigationItems}
          orientation="horizontal"
          size="compact"
          sticky
        />
      ) : null}

      {problem ? (
        <InlineNotice
          message={problem}
          title="Nie udało się pobrać danych"
          tone="critical"
        />
      ) : null}

      {data ? (
        <CommandCenterContent
          data={data}
          dataState={dataState}
          definition={definition}
          issues={issues}
          mode={mode}
          workspaceContext={workspaceContext}
        />
      ) : (
        <InlineNotice
          message={
            loading
              ? 'Widok zachowuje strukturę bez prezentowania fałszywych zer.'
              : 'Dane pojawią się po poprawnej odpowiedzi dla bieżącego workspace.'
          }
          title={loading ? 'Pobieramy aktualny stan' : 'Brak danych dla widoku'}
          tone={problem ? 'critical' : 'info'}
        />
      )}
    </section>
  );
}

function CommandCenterContent({
  data,
  dataState,
  definition,
  issues,
  mode,
  workspaceContext,
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
  readonly definition: BusinessScreenDefinition;
  readonly issues: readonly {
    readonly id: string;
    readonly label: string;
    readonly severity: 'critical' | 'warning';
  }[];
  readonly mode: NonNullable<CommandCenterWorkspaceProps['mode']>;
  readonly workspaceContext: typeof defaultWorkspaceContext;
}) {
  const rows = buildCommandRows(data.records, definition.variant);
  const decisions = buildOperationalDecisions(data.records, definition.variant);

  if (mode === 'runtime') {
    return (
      <CommandCenterOnePage
        data={data}
        dataState={dataState}
      />
    );
  }

  if (definition.variant === 'overview') {
    return (
      <>
        <CommandExecutiveBrief
          data={data}
          decisions={decisions}
        />

        <CommandSummaryStrip
          data={data}
          dataState={dataState}
        />

        <CommandDataStatus
          data={data}
          dataState={dataState}
          issues={issues}
          workspaceContext={workspaceContext}
        />

        <CommandAnalyticsSection
          data={data}
          dataState={dataState}
          definition={definition}
          workspaceContext={workspaceContext}
        />

        <CommandDecisionBoard
          decisions={decisions}
          title="Decyzje do obsłużenia"
        />

        <CommandMetricSection
          dataState={dataState}
          eyebrow="Stan biznesu"
          records={data.records}
          title="Wynik, ryzyko i tempo"
        />

        <CommandRecordsSection
          data={data}
          description="Rejestr pozostaje alternatywą tabelaryczną dla briefu: wynik, cel, wpływ, właściciel i następny krok."
          rows={rows}
          title="Rejestr operacyjny"
        />
      </>
    );
  }

  return (
    <>
      <CommandSummaryStrip
        data={data}
        dataState={dataState}
      />

      <CommandDataStatus
        data={data}
        dataState={dataState}
        issues={issues}
        workspaceContext={workspaceContext}
      />

      <CommandMetricSection
        dataState={dataState}
        eyebrow="KPI widoku"
        records={data.records}
        title="Karty KPI z mini trendem"
      />

      <CommandAnalyticsSection
        data={data}
        dataState={dataState}
        definition={definition}
        workspaceContext={workspaceContext}
      />

      <CommandDecisionBoard
        compact
        decisions={decisions}
        title="Kontekst operacyjny"
      />

      {renderVariant({
        data,
        dataState,
        decisions,
        definition,
        rows,
      })}
    </>
  );
}

function handleRuntimeNavigationClick(
  item: CommandNavigationItem,
  event: MouseEvent<HTMLAnchorElement>,
  setActiveRuntimeSectionId: (id: string) => void,
): void {
  if (!item.href.startsWith('#')) {
    return;
  }

  event.preventDefault();
  setActiveRuntimeSectionId(item.id);

  const target = document.getElementById(item.href.slice(1));
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  if (target) {
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  window.history.replaceState(
    window.history.state,
    '',
    `/app/command-center${item.href}`,
  );
}

function buildIssues(
  data: CommandCenterData | null,
) {
  if (!data) {
    return [];
  }

  if (data.summary.critical > 0) {
    return [
      {
        id: `${data.operationId}-critical`,
        label: `${data.summary.critical} blokady krytyczne`,
        severity: 'critical' as const,
      },
    ];
  }

  if (data.summary.warning > 0) {
    return [
      {
        id: `${data.operationId}-warning`,
        label: `${data.summary.warning} ostrzeżenia danych`,
        severity: 'warning' as const,
      },
    ];
  }

  return [];
}

function buildCommandScreenMetrics(
  data: CommandCenterData | null,
): readonly PapaScreenContextElement[] {
  if (!data) {
    return [];
  }

  return data.records.slice(0, 6).map((record) => ({
    description: record.target === null
      ? 'Metryka bez celu w bieżącym kontrakcie.'
      : `Cel: ${formatMetricValue(record.target, record.unit)}`,
    id: record.metricId,
    kind: 'metric' as const,
    label: record.label,
    status: resolveReadinessLabel(record.readiness),
    value: formatMetricValue(record.value, record.unit),
  }));
}

function buildCommandScreenElements(
  data: CommandCenterData | null,
): readonly PapaScreenContextElement[] {
  if (!data) {
    return [];
  }

  return data.records.slice(0, 8).map((record) => ({
    description: record.delta === null
      ? 'Brak zmiany dla bieżącego zakresu.'
      : `Zmiana: ${formatSignedPercent(record.delta)}`,
    id: `${record.metricId}-record`,
    kind: 'record' as const,
    label: record.label,
    status: resolveReadinessLabel(record.readiness),
    value: formatMetricValue(record.value, record.unit),
  }));
}

function buildCommandScreenCharts(
  data: CommandCenterData | null,
  definition: BusinessScreenDefinition,
): readonly PapaScreenContextElement[] {
  if (!data) {
    return [];
  }

  const charts: PapaScreenContextElement[] = [
    {
      description: 'Sekcja metryk i porównań widoczna na ekranie.',
      id: `${definition.id}-metric-chart`,
      kind: 'chart',
      label: `${definition.displayTitle}: wizualizacja metryk`,
      value: `${data.records.length} metryk`,
    },
  ];

  if (data.funnelSteps.length > 0) {
    charts.push({
      description: 'Lejek sprzedażowy z konwersją i odpływem.',
      id: `${definition.id}-funnel-chart`,
      kind: 'chart',
      label: 'Lejek sprzedażowy',
      value: `${data.funnelSteps.length} kroków`,
    });
  }

  if (data.waterfall.length > 0) {
    charts.push({
      description: 'Waterfall wyniku dla bieżącego zakresu.',
      id: `${definition.id}-waterfall-chart`,
      kind: 'chart',
      label: 'Waterfall wyniku',
      value: `${data.waterfall.length} pozycji`,
    });
  }

  return charts;
}

function resolveDataState({
  data,
  loading,
  problem,
}: {
  readonly data: CommandCenterData | null;
  readonly loading: boolean;
  readonly problem: string | null;
}): AnalyticsDataState {
  // A refresh that still has the previous payload is not a "loading" screen:
  // the sections keep the old values and animate into the new ones, so only a
  // genuinely empty first load falls back to skeletons.
  if (loading && !data) {
    return 'loading';
  }

  if (problem) {
    return 'error';
  }

  if (!data || data.summary.total === 0) {
    return 'noData';
  }

  if (data.summary.critical > 0) {
    return 'partial';
  }

  if (data.summary.warning > 0) {
    return 'stale';
  }

  return 'ready';
}
