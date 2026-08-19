import type {
  MouseEvent,
  ReactNode,
} from 'react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  CommandCenterRecord,
  ReadinessStatus,
} from '../../../../../contracts/api-schemas';
import type {
  DataColumn,
  DataRow,
} from '../../../../../contracts/component-shared';
import type {
  DateRange,
  ReadinessState,
} from '../../../../../contracts/ui-contract-types';
import {
  Button,
  ChartFrame,
  ChartInteractionLayer,
  ComparisonChart,
  DataStatusBanner,
  DataTable,
  FunnelChart,
  InlineNotice,
  MetricCard,
  PageHeader,
  SectionNavigation,
  StatusBadge,
  TrendChart,
  WaterfallChart,
} from '../../design-system';
import type {
  AnalyticsDataState,
} from '../../design-system';
import type {
  ChartInteractionPoint,
} from '../../design-system/components/ChartInteractionLayer';
import type {
  TrendChartDatum,
} from '../../design-system/components/TrendChart';
import {
  formatShellDateRangeLabel,
  useShellDateRange,
} from '../../shell/app-shell';
import type {
  PapaScreenContextElement,
} from '../../shell/papa-assistant';
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
  attentionWeight,
  buildOperationalDecisions,
  getRecordContext,
  openPapaAssistant,
  openPapaAssistantForElement,
  openPapaAssistantWithScreenAnalysis,
} from './command-center/commandCenterOnePageModel';
import type {
  CommandDecision,
  OperationalPriority,
} from './command-center/commandCenterOnePageModel';
import {
  formatInteger,
  formatMetricValue,
  formatPercent,
  formatShortTime,
  formatSignedPercent,
  mapReadinessToAnalyticsState,
  resolveDataStateLabel,
  resolveDataStateTone,
  resolveImpactLabel,
  resolveReadinessLabel,
  resolveReadinessState,
  resolveReadinessTone,
  resolveUnitLabel,
  slugify,
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

const commandColumns: readonly DataColumn[] = [
  {
    id: 'label',
    label: 'Obszar',
    sortable: true,
    width: 260,
  },
  {
    align: 'right',
    id: 'value',
    label: 'Wynik',
    sortable: true,
    width: 150,
  },
  {
    align: 'right',
    id: 'target',
    label: 'Cel',
    sortable: true,
    width: 150,
  },
  {
    align: 'right',
    id: 'delta',
    label: 'Zmiana',
    sortable: true,
    width: 120,
  },
  {
    id: 'impact',
    label: 'Wpływ',
    sortable: true,
    width: 240,
  },
  {
    id: 'nextAction',
    label: 'Następny krok',
    width: 300,
  },
  {
    id: 'owner',
    label: 'Właściciel',
    sortable: true,
    width: 220,
  },
  {
    id: 'readinessLabel',
    label: 'Stan danych',
    sortable: true,
    width: 160,
  },
];

const trendColumns: readonly DataColumn[] = [
  {
    id: 'label',
    label: 'Punkt',
    sortable: true,
    width: 140,
  },
  {
    align: 'right',
    id: 'actual',
    label: 'Wynik',
    sortable: true,
    width: 150,
  },
  {
    align: 'right',
    id: 'plan',
    label: 'Plan',
    sortable: true,
    width: 150,
  },
  {
    align: 'right',
    id: 'previousPeriod',
    label: 'Poprzedni okres',
    sortable: true,
    width: 170,
  },
  {
    align: 'right',
    id: 'movingAverage',
    label: 'Średnia',
    sortable: true,
    width: 150,
  },
  {
    id: 'analysis',
    label: 'Status AI',
    width: 230,
  },
];

const impactColumns: readonly DataColumn[] = [
  {
    id: 'label',
    label: 'KPI',
    sortable: true,
    width: 240,
  },
  {
    align: 'right',
    id: 'impact',
    label: 'Odchylenie',
    sortable: true,
    width: 140,
  },
  {
    id: 'status',
    label: 'Status AI',
    sortable: true,
    width: 180,
  },
  {
    id: 'recommendation',
    label: 'Rekomendacja',
    width: 340,
  },
];

const readinessToneMap = {
  Częściowe: 'warning',
  Gotowe: 'success',
  Niedostępne: 'danger',
  Nieświeże: 'warning',
} satisfies Record<string, 'danger' | 'success' | 'warning'>;

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

const commandFallbackDateRange = {
  from: '2026-08-01',
  preset: 'monthToDate',
  timezone: 'Europe/Warsaw',
  to: '2026-08-12',
} as const satisfies DateRange;

type CommandAiSignal = {
  readonly description: string;
  readonly evidence: string;
  readonly id: string;
  readonly label: string;
  readonly severity: 'critical' | 'info' | 'success' | 'warning';
  readonly status: string;
};

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


function CommandSummaryStrip({
  data,
  dataState,
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
}) {
  const attentionCount = data.summary.warning + data.summary.critical;

  return (
    <dl
      aria-label="Podsumowanie stanu Centrum Dowodzenia"
      className="pd-command-center-workspace__summary"
    >
      <div>
        <dt>Stan danych</dt>
        <dd>
          <StatusBadge
            status="Stan danych"
            text={resolveDataStateLabel(dataState)}
            tone={resolveDataStateTone(dataState)}
          />
        </dd>
      </div>
      <div>
        <dt>Gotowe</dt>
        <dd>{data.summary.ready}/{data.summary.total}</dd>
      </div>
      <div>
        <dt>Wymagają uwagi</dt>
        <dd>{attentionCount}</dd>
      </div>
      <div>
        <dt>Odświeżono</dt>
        <dd>{formatShortTime(data.generatedAt)}</dd>
      </div>
    </dl>
  );
}

function CommandDataStatus({
  data,
  dataState,
  issues,
  workspaceContext,
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
  readonly issues: readonly {
    readonly id: string;
    readonly label: string;
    readonly severity: 'critical' | 'warning';
  }[];
  readonly workspaceContext: typeof defaultWorkspaceContext;
}) {
  if (data.sources.length === 0 && issues.length === 0) {
    return null;
  }

  return (
    <DataStatusBanner
      blockingIssues={[...issues]}
      className="pd-command-center-workspace__data-status"
      context={workspaceContext}
      readiness={resolveReadinessState(dataState)}
      sources={[...data.sources]}
    />
  );
}

function CommandAnalyticsSection({
  data,
  dataState,
  definition,
  workspaceContext,
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
  readonly definition: BusinessScreenDefinition;
  readonly workspaceContext: typeof defaultWorkspaceContext;
}) {
  const focusRecords = chooseAnalyticRecords(
    data.records,
    definition.variant,
  );

  if (focusRecords.length === 0) {
    return null;
  }

  const primaryRecord = focusRecords[0];

  if (!primaryRecord) {
    return null;
  }

  return (
    <section
      aria-labelledby="command-center-analytics-title"
      className="pd-command-center-workspace__section pd-command-center-workspace__analytics-section"
    >
      <CommandSectionHeader
        eyebrow="Analiza"
        title="Trend, zoom i statusy AI"
        trailing={`${focusRecords.length} KPI w analizie`}
        titleId="command-center-analytics-title"
      />

      <div className="pd-command-center-workspace__analytics-grid">
        <CommandTrendAnalysisFrame
          data={data}
          dataState={dataState}
          definition={definition}
          record={primaryRecord}
          workspaceContext={workspaceContext}
        />

        <CommandImpactAnalysisFrame
          dataState={dataState}
          definition={definition}
          records={focusRecords}
          workspaceContext={workspaceContext}
        />
      </div>

      <CommandAiSignalBoard
        definition={definition}
        records={focusRecords}
      />
    </section>
  );
}

function CommandTrendAnalysisFrame({
  data,
  dataState,
  definition,
  record,
  workspaceContext,
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
  readonly definition: BusinessScreenDefinition;
  readonly record: CommandCenterRecord;
  readonly workspaceContext: typeof defaultWorkspaceContext;
}) {
  const range = resolveWorkspaceDateRange(workspaceContext.range);
  const rangeLabel = formatShellDateRangeLabel(range);
  const trendData = buildRecordTrendData(
    record,
    range,
    definition.variant,
  );
  const trendRows = buildTrendRows(
    trendData,
    record.unit,
  );
  const chartStatus = record.readiness === 'ready'
    ? dataState
    : mapReadinessToAnalyticsState(record.readiness);

  return (
    <ChartFrame
      alternativeTable={(
        <DataTable
          ariaLabel={`Tabela trendu: ${record.label}`}
          columns={trendColumns}
          density="compact"
          emptyMessage="Brak punktów trendu."
          loading={false}
          minWidth={760}
          rowCount={trendRows.length}
          rows={trendRows}
          selectedRowIds={[]}
          sort={null}
        />
      )}
      alternativeTableLabel="Dane trendu"
      businessQuestion="Co zmieniło się w zakresie"
      className="pd-command-center-workspace__analysis-frame"
      description="Trend reaguje na szybki zakres dat i wskazuje plan, poprzedni okres oraz średnią kroczącą."
      freshnessLabel={formatShortTime(data.generatedAt)}
      papaAction={{
        label: 'Analizuj ekran',
        onAction: openPapaAssistantWithScreenAnalysis,
      }}
      rangeLabel={rangeLabel}
      sourceLabel={resolveMetricSourceLabel(record)}
      status={chartStatus}
      statusLabel={resolveReadinessLabel(record.readiness)}
      summary={(
        <CommandPapaTrendSummary
          record={record}
          trendData={trendData}
        />
      )}
      title={`Trend: ${record.label}`}
      visualization={(
        <CommandInteractiveTrend
          data={trendData}
          definition={definition}
          record={record}
          rangeLabel={rangeLabel}
        />
      )}
      visualizationLabel={`Interaktywny trend KPI ${record.label}`}
    />
  );
}

function CommandImpactAnalysisFrame({
  dataState,
  definition,
  records,
  workspaceContext,
}: {
  readonly dataState: AnalyticsDataState;
  readonly definition: BusinessScreenDefinition;
  readonly records: readonly CommandCenterRecord[];
  readonly workspaceContext: typeof defaultWorkspaceContext;
}) {
  const range = resolveWorkspaceDateRange(workspaceContext.range);
  const comparable = records
    .filter((record) => record.delta !== null)
    .slice(0, 8);
  const rankingRows = buildImpactRows(comparable);

  return (
    <ChartFrame
      alternativeTable={(
        <DataTable
          ariaLabel="Tabela wpływu i ryzyka KPI"
          columns={impactColumns}
          density="compact"
          emptyMessage="Brak metryk z policzoną zmianą."
          loading={false}
          minWidth={860}
          rowCount={rankingRows.length}
          rows={rankingRows}
          selectedRowIds={[]}
          sort={null}
        />
      )}
      alternativeTableLabel="Dane wpływu"
      businessQuestion="Które KPI wymagają uwagi"
      className="pd-command-center-workspace__analysis-frame"
      description="Ranking słupkowy pokazuje skalę odchylenia, a status AI rozróżnia anomalię, spadek i ryzyko danych."
      freshnessLabel="ciągła kontrola"
      papaAction={{
        label: 'Wyjaśnij ranking',
        onAction: openPapaAssistantWithScreenAnalysis,
      }}
      rangeLabel={formatShellDateRangeLabel(range)}
      sourceLabel="PapaData analytics"
      status={dataState}
      statusLabel={resolveDataStateLabel(dataState)}
      summary={(
        <CommandPapaImpactSummary
          definition={definition}
          records={records}
        />
      )}
      title="Ranking wpływu i ryzyka"
      visualization={(
        comparable.length > 0 ? (
          <ComparisonChart
            ariaLabel="Ranking wpływu KPI"
            benchmark={{
              label: 'próg uwagi',
              value: 8,
            }}
            data={comparable.map((record) => ({
              id: record.metricId,
              label: shortenMetricLabel(record.label),
              values: {
                impact: Math.round(Math.abs(record.delta ?? 0) * 1000) / 10,
              },
            }))}
            series={[
              {
                key: 'impact',
                label: 'Odchylenie',
              },
            ]}
            unit="%"
            valueFormatter={formatImpactPercentPoint}
            variant="ranking"
          />
        ) : null
      )}
      visualizationLabel="Słupkowy ranking wpływu KPI"
    />
  );
}

function CommandInteractiveTrend({
  data,
  definition,
  rangeLabel,
  record,
}: {
  readonly data: readonly TrendChartDatum[];
  readonly definition: BusinessScreenDefinition;
  readonly rangeLabel: string;
  readonly record: CommandCenterRecord;
}) {
  const basePointId = data[data.length - 1]?.label ?? 'latest';
  const [activeFilterId, setActiveFilterId] = useState('full');
  const [selectedPointId, setSelectedPointId] = useState(basePointId);
  const visibleData = filterTrendData(
    data,
    activeFilterId,
    record,
  );
  const points = buildTrendInteractionPoints(
    visibleData,
    record,
  );
  const selectedPoint = points.find((point) => point.id === selectedPointId)
    ?? points[points.length - 1]
    ?? null;

  return (
    <ChartInteractionLayer
      activeFilterId={activeFilterId}
      dateRangeLabel={rangeLabel}
      description="Najedź lub przejdź fokusem po punktach analizy, żeby zobaczyć komentarz Papa Asystenta."
      filters={[
        {
          description: 'Pełny zakres danych wykresu',
          id: 'full',
          label: 'Pełny zakres',
        },
        {
          description: 'Zoom na ostatnie punkty bieżącego zakresu',
          id: 'zoom',
          label: 'Zoom',
        },
        {
          description: 'Punkty ze spadkiem, anomalią albo ryzykiem danych',
          id: 'risk',
          label: 'Ryzyka AI',
        },
      ]}
      onDrillDown={() => openPapaAssistantWithScreenAnalysis()}
      onFilterChange={(filterId) => {
        setActiveFilterId(filterId);
        const nextData = filterTrendData(
          data,
          filterId,
          record,
        );
        setSelectedPointId(nextData[nextData.length - 1]?.label ?? basePointId);
      }}
      onPointSelect={setSelectedPointId}
      onReset={() => {
        setActiveFilterId('full');
        setSelectedPointId(basePointId);
      }}
      points={points}
      selectedPointId={selectedPoint?.id ?? basePointId}
      title={`Zoom i punkty analizy ${definition.displayTitle}`}
    >
      <TrendChart
        ariaLabel={`Trend ${record.label}`}
        data={visibleData}
        unit={resolveUnitLabel(record.unit)}
        valueFormatter={(value) => formatMetricValue(value, record.unit)}
        variant={record.readiness === 'ready' ? 'area' : 'line'}
      />
    </ChartInteractionLayer>
  );
}

function CommandAiSignalBoard({
  definition,
  records,
}: {
  readonly definition: BusinessScreenDefinition;
  readonly records: readonly CommandCenterRecord[];
}) {
  const signals = records
    .slice(0, 6)
    .map((record) => buildAiSignal(record, definition.variant));

  return (
    <div
      aria-label="Statusy AI dla metryk Centrum Dowodzenia"
      className="pd-command-center-workspace__ai-signal-board"
    >
      {signals.map((signal) => (
        <article
          data-severity={signal.severity}
          key={signal.id}
        >
          <header>
            <span>{signal.status}</span>
            <strong>{signal.label}</strong>
          </header>
          <p>{signal.description}</p>
          <small>{signal.evidence}</small>
        </article>
      ))}
    </div>
  );
}

function CommandPapaTrendSummary({
  record,
  trendData,
}: {
  readonly record: CommandCenterRecord;
  readonly trendData: readonly TrendChartDatum[];
}) {
  const last = trendData[trendData.length - 1];
  const previous = trendData[trendData.length - 2];
  const movement = last?.actual != null && previous?.actual != null
    ? last.actual - previous.actual
    : 0;
  const trendLabel = movement < 0
    ? 'spadek w ostatnim punkcie'
    : movement > 0
      ? 'wzrost w ostatnim punkcie'
      : 'stabilizacja';

  return (
    <div className="pd-command-center-workspace__papa-summary">
      <strong>{resolveMetricRiskLabel(record) ?? `AI widzi ${trendLabel}.`}</strong>
      <p>{getRecordContext(record, 'kpi').diagnosis}</p>
    </div>
  );
}

function CommandPapaImpactSummary({
  definition,
  records,
}: {
  readonly definition: BusinessScreenDefinition;
  readonly records: readonly CommandCenterRecord[];
}) {
  const risky = records.filter((record) => (
    isMetricWorse(record)
    || record.readiness !== 'ready'
  ));
  const firstRisk = risky[0] ?? records[0] ?? null;

  return (
    <div className="pd-command-center-workspace__papa-summary">
      <strong>
        {firstRisk
          ? getRecordContext(firstRisk, definition.variant).nextAction
          : 'Brak eskalacji w bieżącym zakresie.'}
      </strong>
      <p>
        Papa Asystent porównuje odchylenie, stan danych i właściciela decyzji,
        żeby odróżnić zwykły wzrost od anomalii wymagającej reakcji.
      </p>
    </div>
  );
}

function renderVariant({
  data,
  dataState,
  decisions,
  definition,
  rows,
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
  readonly decisions: readonly CommandDecision[];
  readonly definition: BusinessScreenDefinition;
  readonly rows: readonly DataRow[];
}) {
  switch (definition.variant) {
    case 'attention':
      return (
        <>
          <CommandAttentionSection
            decisions={decisions}
            records={data.records}
            title="Kolejka reakcji według wpływu"
          />
          <CommandRecordsSection
            data={data}
            description="Każda pozycja ma jawny wpływ, właściciela i kolejny krok, żeby kolejka nie była tylko listą odchyleń."
            rows={rows}
            title="Pełny rejestr"
          />
        </>
      );

    case 'kpi':
      return (
        <>
          <CommandRecordsSection
            data={data}
            description="Wynik, cel, zmiana, wpływ i właściciel bez syntetycznych serii trendu."
            rows={rows}
            title="Rejestr KPI"
          />
        </>
      );

    case 'plan':
      return (
        <>
          <CommandPlanSection
            dataState={dataState}
            records={data.records}
          />
          <CommandRecordsSection
            data={data}
            description="Tabela pozostaje źródłem dokładnych wartości dla porównania planu i wykonania."
            rows={rows}
            title="Wartości planu i wykonania"
          />
        </>
      );

    case 'drivers':
      return (
        <>
          <CommandDriversSection records={data.records} />
          <CommandRecordsSection
            data={data}
            description="Ranking rozróżnia dobre i złe zmiany: wzrost przychodu pomaga, ale wzrost CPA albo zwrotów wymaga reakcji."
            rows={rows}
            title="Metryki źródłowe"
          />
        </>
      );

    case 'sales-sources':
      return (
        <>
          <CommandSalesSourcesSection records={data.records} />
          <CommandRecordsSection
            data={data}
            description="Tabela pod spodem pokazuje dokładne wartości kanałów razem z odpowiedzialnością za następny krok."
            rows={rows}
            title="Wyniki według źródeł"
          />
        </>
      );

    case 'traffic':
      return (
        <>
          <CommandTrafficSection
            funnelSteps={data.funnelSteps}
            records={data.records}
          />
          <CommandRecordsSection
            data={data}
            description="Ruch, konwersja i jakość eventów w jednym rejestrze z jawnie widocznym stanem danych."
            rows={rows}
            title="Ruch i jakość danych"
          />
        </>
      );

    case 'products':
      return (
        <>
          <CommandEntityHealthSection
            eyebrow="Produkty"
            records={data.records}
            title="Kondycja katalogu i bestsellerów"
          />
          <CommandRecordsSection
            data={data}
            description="Przegląd metryk produktowych bez lokalnego duplikowania katalogu produktów."
            rows={rows}
            title="Kondycja produktów"
          />
        </>
      );

    case 'customers':
      return (
        <>
          <InlineNotice
            message="Widok prezentuje wyłącznie agregaty i pseudonimizowane informacje dopuszczone do tego zakresu."
            title="Prywatność klientów"
            tone="info"
          />
          <CommandEntityHealthSection
            eyebrow="Klienci"
            records={data.records}
            title="Segmenty i retencja"
          />
          <CommandRecordsSection
            data={data}
            description="Kondycja segmentów i metryk klientów bez ujawniania PII."
            rows={rows}
            title="Kondycja klientów"
          />
        </>
      );

    case 'funnel':
      return (
        <>
          <CommandSectionHeader
            eyebrow="Lejek"
            title="Lejek sprzedażowy i największy odpływ"
          />
          {data.funnelSteps.length > 0 ? (
            <>
              <CommandFunnelSummary steps={data.funnelSteps} />
              <FunnelChart
                className="pd-command-center-workspace__chart-surface"
                orientation="horizontal"
                showDropoff
                steps={data.funnelSteps.map((step) => ({
                  conversionRate: step.conversionRate,
                  id: step.stepId,
                  label: step.label,
                  value: step.completions,
                }))}
              />
              <ol className="pd-command-center-workspace__funnel-steps">
                {data.funnelSteps.map((step, index) => (
                  <li key={step.stepId}>
                    <span>{step.label}</span>
                    <strong>{formatInteger(step.completions)}</strong>
                    <small>
                      CR {formatPercent(step.conversionRate)}
                      {index > 0
                        ? ` · odpływ ${formatPercent(resolveStepDropoff(data.funnelSteps, index))}`
                        : ''}
                    </small>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <InlineNotice
              message="Dla bieżącego zakresu nie ma jeszcze kroków lejka do pokazania."
              title="Brak danych lejka"
              tone="info"
            />
          )}
        </>
      );

    case 'recommendations':
      return (
        <CommandRecommendationsSection
          data={data}
          decisions={decisions}
        />
      );

    case 'sales-signals':
      return (
        <>
          <CommandAttentionSection
            decisions={decisions}
            records={data.records}
            title="Sygnały do oceny"
          />
          <CommandRecordsSection
            data={data}
            description="Pełny rejestr sygnałów sprzedażowych z przypisaniem odpowiedzialności."
            rows={rows}
            title="Rejestr sygnałów"
          />
        </>
      );

    case 'waterfall':
      return (
        <>
          <CommandSectionHeader
            eyebrow="Zmiana wyniku"
            title="Składniki zmiany i narracja planu"
            trailing={`${data.waterfall.length} pozycji`}
          />
          {data.waterfall.length > 0 ? (
            <>
              <CommandWaterfallNarrative items={data.waterfall} />
              <WaterfallChart
                className="pd-command-center-workspace__chart-surface"
                items={data.waterfall.map((item) => ({
                  id: item.key,
                  kind: item.key === 'plan'
                    ? 'start'
                    : item.value < 0
                    ? 'decrease'
                    : item.key === 'actual'
                      ? 'total'
                      : 'increase',
                  label: item.label,
                  value: item.value,
                }))}
                showCumulative
                unit="PLN"
              />
            </>
          ) : (
            <InlineNotice
              message="Dla bieżącego zakresu nie ma jeszcze składników zmiany wyniku."
              title="Brak danych waterfall"
              tone="info"
            />
          )}
          <CommandRecordsSection
            data={data}
            description="Metryki bazowe pozostają dostępne pod wizualizacją."
            rows={rows}
            title="Metryki bazowe"
          />
        </>
      );

    case 'command-variants':
      return (
        <>
          <CommandVariantsSection records={data.records} />
          <CommandRecordsSection
            data={data}
            description="Tabela pokazuje scenariusze wyniku, cel, zmianę, jakość danych i właściciela kolejnego kroku."
            rows={rows}
            title="Rejestr scenariuszy"
          />
        </>
      );

    default:
      return (
        <CommandRecordsSection
          data={data}
          description="Dane ekranu są prezentowane bez tworzenia lokalnych wartości zastępczych."
          rows={rows}
          title={definition.displayTitle}
        />
      );
  }
}

function CommandExecutiveBrief({
  data,
  decisions,
}: {
  readonly data: CommandCenterData;
  readonly decisions: readonly CommandDecision[];
}) {
  const hero = decisions[0];
  const revenue = data.records.find((record) => (
    normalizeLabel(record.label).includes('przychod')
  ));
  const conversion = data.records.find((record) => (
    normalizeLabel(record.label).includes('konwersja')
  ));

  return (
    <section
      aria-labelledby="command-center-executive-brief-title"
      className="pd-command-center-workspace__executive-brief"
    >
      <div className="pd-command-center-workspace__executive-main">
        <p>Brief operacyjny</p>
        <h2 id="command-center-executive-brief-title">
          Co wymaga decyzji teraz
        </h2>
        <strong>
          {hero
            ? hero.nextAction
            : 'Brak pilnych decyzji.'}
        </strong>
        <span>
          {hero
            ? `${hero.businessImpact} · ${hero.owner} · ${hero.timebox}`
            : 'Zespół może pracować w trybie monitoringu.'}
        </span>
      </div>

      <dl className="pd-command-center-workspace__executive-stats">
        <div>
          <dt>Przychód</dt>
          <dd>{revenue ? formatMetricValue(revenue.value, revenue.unit) : '—'}</dd>
          <dd className="pd-command-center-workspace__stat-hint">{revenue?.delta === null || !revenue ? '—' : formatSignedPercent(revenue.delta)}</dd>
        </div>
        <div>
          <dt>Konwersja</dt>
          <dd>{conversion ? formatMetricValue(conversion.value, conversion.unit) : '—'}</dd>
          <dd className="pd-command-center-workspace__stat-hint">{conversion?.target === null || !conversion ? 'bez celu' : `cel ${formatMetricValue(conversion.target, conversion.unit)}`}</dd>
        </div>
        <div>
          <dt>Do reakcji</dt>
          <dd>{decisions.length}</dd>
          <dd className="pd-command-center-workspace__stat-hint">{data.summary.warning + data.summary.critical} ograniczenia danych</dd>
        </div>
      </dl>
    </section>
  );
}

function CommandDecisionBoard({
  compact = false,
  decisions,
  title,
}: {
  readonly compact?: boolean;
  readonly decisions: readonly CommandDecision[];
  readonly title: string;
}) {
  const visibleDecisions = compact
    ? decisions.slice(0, 2)
    : decisions.slice(0, 4);

  return (
    <section
      aria-labelledby={`command-center-decisions-${slugify(title)}`}
      className="pd-command-center-workspace__section"
      data-compact={compact ? true : undefined}
    >
      <CommandSectionHeader
        eyebrow="Decyzje"
        title={title}
        titleId={`command-center-decisions-${slugify(title)}`}
        trailing={`${decisions.length} pozycji`}
      />

      {visibleDecisions.length > 0 ? (
        <ol className="pd-command-center-workspace__decision-board">
          {visibleDecisions.map((decision) => (
            <li
              key={decision.id}
              data-priority={decision.priority}
            >
              <div className="pd-command-center-workspace__decision-main">
                <span>{resolvePriorityLabel(decision.priority)}</span>
                <strong>{decision.nextAction}</strong>
                <p>{decision.diagnosis}</p>
              </div>
              <dl>
                <div>
                  <dt>Metryka</dt>
                  <dd>{decision.metricLabel}</dd>
                </div>
                <div>
                  <dt>Wpływ</dt>
                  <dd>{decision.businessImpact}</dd>
                </div>
                <div>
                  <dt>Właściciel</dt>
                  <dd>{decision.owner}</dd>
                </div>
                <div>
                  <dt>Termin</dt>
                  <dd>{decision.timebox}</dd>
                </div>
              </dl>
              <StatusBadge
                status="Stan danych"
                text={resolveReadinessLabel(decision.readiness)}
                tone={resolveReadinessTone(decision.readiness)}
              />
            </li>
          ))}
        </ol>
      ) : (
        <InlineNotice
          message="Wszystkie bieżące metryki są stabilne albo mają niski wpływ operacyjny."
          title="Brak pilnych decyzji"
          tone="success"
        />
      )}
    </section>
  );
}

function CommandAttentionSection({
  decisions,
  records,
  title,
}: {
  readonly decisions: readonly CommandDecision[];
  readonly records: readonly CommandCenterRecord[];
  readonly title: string;
}) {
  const attention = [...records]
    .filter((record) => (
      record.readiness !== 'ready'
      || isMetricWorse(record)
    ))
    .sort((left, right) => (
      attentionWeight(right) - attentionWeight(left)
    ));

  return (
    <section
      aria-labelledby="command-center-attention-title"
      className="pd-command-center-workspace__section"
    >
      <CommandSectionHeader
        eyebrow="Uwaga"
        title={title}
        trailing={`${attention.length} pozycji`}
        titleId="command-center-attention-title"
      />

      {decisions.length > 0 ? (
        <ul className="pd-command-center-workspace__attention-list">
          {decisions.map((decision) => (
            <li
              key={decision.id}
              data-priority={decision.priority}
            >
              <div>
                <strong>{decision.nextAction}</strong>
                <span>{decision.metricLabel} · {decision.valueLabel} · {decision.businessImpact}</span>
                <small>{decision.owner} · {decision.timebox}</small>
              </div>
              <span>{decision.deltaLabel}</span>
              <StatusBadge
                status="Stan danych"
                text={resolveReadinessLabel(decision.readiness)}
                tone={resolveReadinessTone(decision.readiness)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <InlineNotice
          message="Brak metryk wymagających reakcji."
          title="Brak pozycji wymagających uwagi"
          tone="success"
        />
      )}
    </section>
  );
}

function CommandMetricSection({
  dataState,
  eyebrow,
  records,
  title,
}: {
  readonly dataState: AnalyticsDataState;
  readonly eyebrow: string;
  readonly records: readonly CommandCenterRecord[];
  readonly title: string;
}) {
  const metrics = [...records]
    .sort((left, right) => (
      attentionWeight(right) - attentionWeight(left)
    ))
    .slice(0, 4);

  return (
    <section
      aria-labelledby="command-center-kpi-title"
      className="pd-command-center-workspace__section"
    >
      <CommandSectionHeader
        eyebrow={eyebrow}
        title={title}
        trailing={`${metrics.length} metryk`}
        titleId="command-center-kpi-title"
      />

      <div className="pd-command-center-workspace__metric-grid">
        {metrics.map((record) => (
          <MetricCard
            className="pd-command-center-workspace__metric"
            comparison={
              record.delta === null
                ? null
                : {
                    direction: record.delta > 0
                      ? 'up'
                      : record.delta < 0
                        ? 'down'
                        : 'flat',
                    label: formatSignedPercent(record.delta),
                  }
            }
            definitionChangeLabel={resolveMetricRiskLabel(record)}
            deviationLabel={resolveMetricDeviationLabel(record)}
            emphasis={resolveMetricEmphasis(record)}
            freshnessLabel={resolveMetricFreshnessLabel(record)}
            key={record.metricId}
            label={record.label}
            metricId={record.metricId}
            papaAction={{
              label: 'Wyjaśnij z Papa',
              onAction: () => openPapaAssistantForElement(record.metricId),
            }}
            signal={resolveMetricSignal(record)}
            sourceLabel={resolveMetricSourceLabel(record)}
            sparklinePoints={buildRecordSparklinePoints(record, 14)}
            status={
              record.readiness === 'ready'
                ? dataState
                : mapReadinessToAnalyticsState(record.readiness)
            }
            statusLabel={resolveReadinessLabel(record.readiness)}
            stateMessage={resolveMetricStateMessage(record)}
            targetLabel={
              record.target === null
                ? null
                : `Cel: ${formatMetricValue(record.target, record.unit)}`
            }
            value={formatMetricValue(record.value, record.unit)}
          />
        ))}
      </div>
    </section>
  );
}


function resolveRuntimeForecastValue(record: CommandCenterRecord): number {
  if (record.target === null) {
    return record.value;
  }

  const confidence = record.delta === null
    ? 0.72
    : record.delta >= 0
      ? 0.86
      : 0.64;

  return record.value + ((record.target - record.value) * confidence);
}

function CommandPlanSection({
  dataState,
  records,
}: {
  readonly dataState: AnalyticsDataState;
  readonly records: readonly CommandCenterRecord[];
}) {
  const comparable = chooseComparableRecords(records);

  return (
    <section
      aria-labelledby="command-center-plan-title"
      className="pd-command-center-workspace__section"
    >
      <CommandSectionHeader
        eyebrow="Plan vs wynik"
        title="Plan vs wynik — prognoza dowiezienia"
        titleId="command-center-plan-title"
      />

      {comparable.length > 0 ? (
        <div
          aria-label="Skrót planu, wyniku i prognozy"
          className="pd-command-center-workspace__plan-summary"
        >
          {comparable.slice(0, 3).map((record) => (
            <article key={record.metricId}>
              <span>{record.label}</span>
              <strong>{formatMetricValue(record.value, record.unit)}</strong>
              <p>
                Cel {record.target === null ? '—' : formatMetricValue(record.target, record.unit)} · Prognoza {formatMetricValue(resolveRuntimeForecastValue(record), record.unit)}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      {comparable.length >= 2 ? (
        <ComparisonChart
          ariaLabel="Porównanie wyniku, celu i prognozy"
          className="pd-command-center-workspace__chart-surface pd-command-center-workspace__chart-surface--forecast"
          data={comparable.map((record) => ({
            id: record.metricId,
            label: record.label,
            values: {
              actual: record.value,
              projected: resolveRuntimeForecastValue(record),
              target: record.target,
            },
          }))}
          series={[
            {
              key: 'actual',
              label: 'Wynik',
            },
            {
              key: 'target',
              label: 'Cel',
            },
            {
              key: 'projected',
              label: 'Prognoza',
            },
          ]}
          unit={resolveUnitLabel(comparable[0]?.unit)}
          valueFormatter={(value) => (
            formatMetricValue(value, comparable[0]?.unit ?? 'number')
          )}
          variant="grouped"
        />
      ) : (
        <InlineNotice
          message="Kontrakt nie zwrócił co najmniej dwóch KPI o wspólnej jednostce i zdefiniowanym celu."
          title="Porównanie wykresowe niedostępne"
          tone={dataState === 'error' ? 'critical' : 'info'}
        />
      )}
    </section>
  );
}

function CommandDriversSection({
  records,
}: {
  readonly records: readonly CommandCenterRecord[];
}) {
  const drivers = [...records]
    .filter((record) => record.delta !== null)
    .sort((left, right) => (
      Math.abs(right.delta ?? 0) - Math.abs(left.delta ?? 0)
    ))
    .slice(0, 8);
  const maxDelta = Math.max(
    ...drivers.map((record) => Math.abs(record.delta ?? 0)),
    0.01,
  );

  return (
    <section
      aria-labelledby="command-center-drivers-title"
      className="pd-command-center-workspace__section"
    >
      <CommandSectionHeader
        eyebrow="Drivery"
        title="Największe zmiany"
        titleId="command-center-drivers-title"
      />

      {drivers.length > 0 ? (
        <ol className="pd-command-center-workspace__driver-list">
          {drivers.map((record) => {
            const delta = record.delta ?? 0;

            return (
              <li
                key={record.metricId}
                data-direction={delta < 0 ? 'negative' : 'positive'}
              >
                <div>
                  <strong>{record.label}</strong>
                  <span>
                    {formatMetricValue(record.value, record.unit)}
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className="pd-command-center-workspace__driver-track"
                >
                  <span
                    style={{
                      inlineSize: `${Math.max(
                        (Math.abs(delta) / maxDelta) * 100,
                        4,
                      )}%`,
                    }}
                  />
                </span>
                <b>{formatSignedPercent(delta)}</b>
              </li>
            );
          })}
        </ol>
      ) : (
        <InlineNotice
          message="Dla bieżących metryk nie zwrócono wartości zmiany."
          title="Brak danych o driverach"
          tone="info"
        />
      )}
    </section>
  );
}

function CommandSalesSourcesSection({
  records,
}: {
  readonly records: readonly CommandCenterRecord[];
}) {
  const revenueRecords = records.filter((record) => (
    record.unit === 'currency'
  ));
  const total = revenueRecords.reduce((sum, record) => sum + record.value, 0);

  return (
    <section
      aria-labelledby="command-center-sales-sources-title"
      className="pd-command-center-workspace__section"
    >
      <CommandSectionHeader
        eyebrow="Kanały"
        title="Udział w przychodzie i decyzje kanałowe"
        titleId="command-center-sales-sources-title"
      />

      <ul className="pd-command-center-workspace__source-mix">
        {revenueRecords.map((record) => {
          const share = total > 0
            ? record.value / total
            : 0;
          const context = getRecordContext(record, 'sales-sources');

          return (
            <li key={record.metricId}>
              <div>
                <strong>{record.label}</strong>
                <span>{context.nextAction}</span>
              </div>
              <span
                aria-hidden="true"
                className="pd-command-center-workspace__source-track"
              >
                <span style={{ inlineSize: `${Math.max(share * 100, 4)}%` }} />
              </span>
              <dl>
                <div>
                  <dt>Przychód</dt>
                  <dd>{formatMetricValue(record.value, record.unit)}</dd>
                </div>
                <div>
                  <dt>Udział</dt>
                  <dd>{formatPercent(share)}</dd>
                </div>
                <div>
                  <dt>Właściciel</dt>
                  <dd>{context.owner}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CommandTrafficSection({
  funnelSteps,
  records,
}: {
  readonly funnelSteps: CommandCenterData['funnelSteps'];
  readonly records: readonly CommandCenterRecord[];
}) {
  const eventQuality = records.find((record) => (
    normalizeLabel(record.label).includes('event')
    || normalizeLabel(record.label).includes('ga4')
  ));

  return (
    <section
      aria-labelledby="command-center-traffic-title"
      className="pd-command-center-workspace__section"
    >
      <CommandSectionHeader
        eyebrow="Ruch"
        title="Ścieżka od sesji do zakupu"
        titleId="command-center-traffic-title"
      />

      <div className="pd-command-center-workspace__journey-grid">
        {funnelSteps.map((step, index) => (
          <article key={step.stepId}>
            <span>{index + 1}</span>
            <strong>{step.label}</strong>
            <dl>
              <div>
                <dt>Wejścia</dt>
                <dd>{formatInteger(step.entrants)}</dd>
              </div>
              <div>
                <dt>Konwersje</dt>
                <dd>{formatInteger(step.completions)}</dd>
              </div>
              <div>
                <dt>CR</dt>
                <dd>{formatPercent(step.conversionRate)}</dd>
              </div>
              <div>
                <dt>Odpływ</dt>
                <dd>{index === 0 ? '—' : formatPercent(resolveStepDropoff(funnelSteps, index))}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      {eventQuality ? (
        <InlineNotice
          message={`${getRecordContext(eventQuality, 'traffic').nextAction} Stan: ${formatMetricValue(eventQuality.value, eventQuality.unit)} przy celu ${eventQuality.target === null ? '—' : formatMetricValue(eventQuality.target, eventQuality.unit)}.`}
          title="Jakość pomiaru wpływa na interpretację lejka"
          tone={eventQuality.readiness === 'ready' ? 'success' : 'warning'}
        />
      ) : null}
    </section>
  );
}

function CommandEntityHealthSection({
  eyebrow,
  records,
  title,
}: {
  readonly eyebrow: string;
  readonly records: readonly CommandCenterRecord[];
  readonly title: string;
}) {
  return (
    <section
      aria-labelledby={`command-center-entity-${slugify(title)}`}
      className="pd-command-center-workspace__section"
    >
      <CommandSectionHeader
        eyebrow={eyebrow}
        title={title}
        titleId={`command-center-entity-${slugify(title)}`}
      />

      <div className="pd-command-center-workspace__entity-grid">
        {records.map((record) => {
          const context = getRecordContext(record, 'products');

          return (
            <article
              key={record.metricId}
              data-priority={context.priority}
            >
              <header>
                <span>{context.businessImpact}</span>
                <StatusBadge
                  status="Stan danych"
                  text={resolveReadinessLabel(record.readiness)}
                  tone={resolveReadinessTone(record.readiness)}
                />
              </header>
              <strong>{record.label}</strong>
              <dl>
                <div>
                  <dt>Wynik</dt>
                  <dd>{formatMetricValue(record.value, record.unit)}</dd>
                </div>
                <div>
                  <dt>Cel</dt>
                  <dd>{record.target === null ? '—' : formatMetricValue(record.target, record.unit)}</dd>
                </div>
                <div>
                  <dt>Zmiana</dt>
                  <dd>{record.delta === null ? '—' : formatSignedPercent(record.delta)}</dd>
                </div>
              </dl>
              <p>{context.nextAction}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CommandFunnelSummary({
  steps,
}: {
  readonly steps: CommandCenterData['funnelSteps'];
}) {
  const worstIndex = steps.reduce((currentWorst, _step, index) => {
    if (index === 0) {
      return currentWorst;
    }

    return resolveStepDropoff(steps, index) > resolveStepDropoff(steps, currentWorst)
      ? index
      : currentWorst;
  }, steps.length > 1 ? 1 : 0);
  const worstStep = steps[worstIndex];
  const previousStep = steps[worstIndex - 1];
  const lost = previousStep
    ? Math.max(previousStep.completions - worstStep.completions, 0)
    : 0;

  return (
    <div className="pd-command-center-workspace__funnel-summary">
      <div>
        <span>Największa strata</span>
        <strong>{previousStep ? `${previousStep.label} → ${worstStep.label}` : '—'}</strong>
        <p>{formatInteger(lost)} utraconych przejść · odpływ {formatPercent(resolveStepDropoff(steps, worstIndex))}</p>
      </div>
      <div>
        <span>Następny krok</span>
        <strong>Sprawdź checkout mobile i błędy płatności</strong>
        <p>Priorytet dla Growth, UX checkout i Payments.</p>
      </div>
    </div>
  );
}

function CommandRecommendationsSection({
  data,
  decisions,
}: {
  readonly data: CommandCenterData;
  readonly decisions: readonly CommandDecision[];
}) {
  return (
    <section
      aria-labelledby="command-center-recommendations-title"
      className="pd-command-center-workspace__section"
    >
      <CommandSectionHeader
        eyebrow="AI"
        title="Rekomendacje do oceny"
        titleId="command-center-recommendations-title"
      />

      {data.recommendations.length > 0 ? (
        <div className="pd-command-center-workspace__recommendations">
          {data.recommendations.map((recommendation, index) => {
            const projectedRecord = resolveRecommendationRecord(
              data.records,
              decisions,
              index,
            );
            const projectedValue = projectedRecord
              ? resolveRecommendationProjectedValue(projectedRecord, recommendation)
              : null;

            return (
              <article key={recommendation.recommendationId}>
                <div>
                  <strong>{recommendation.title}</strong>
                  <p>{recommendation.rationale}</p>
                  <span>
                    Decyzja powiązana: {projectedRecord?.label ?? decisions[0]?.metricLabel ?? 'brak pilnej decyzji'}
                  </span>
                </div>
                <div className="pd-command-center-workspace__recommendation-impact">
                  <dl>
                    <div>
                      <dt>Wpływ</dt>
                      <dd>{resolveImpactLabel(recommendation.impact)}</dd>
                    </div>
                    <div>
                      <dt>Pewność</dt>
                      <dd>{formatPercent(recommendation.confidence)}</dd>
                    </div>
                    <div>
                      <dt>Tryb</dt>
                      <dd>Do zatwierdzenia przez człowieka</dd>
                    </div>
                  </dl>

                  {projectedRecord && projectedValue !== null ? (
                    <ComparisonChart
                      ariaLabel={`Symulacja wpływu rekomendacji: ${recommendation.title}`}
                      className="pd-command-center-workspace__recommendation-chart"
                      data={[
                        {
                          id: projectedRecord.metricId,
                          label: shortenMetricLabel(projectedRecord.label),
                          values: {
                            current: projectedRecord.value,
                            projected: projectedValue,
                          },
                        },
                      ]}
                      series={[
                        {
                          key: 'current',
                          label: 'Obecnie',
                        },
                        {
                          key: 'projected',
                          label: 'Po wdrożeniu',
                        },
                      ]}
                      unit={resolveUnitLabel(projectedRecord.unit)}
                      valueFormatter={(value) => (
                        formatMetricValue(value, projectedRecord.unit)
                      )}
                      variant="grouped"
                    />
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <InlineNotice
          message="Brak rekomendacji wymagających oceny."
          title="Brak rekomendacji"
          tone="info"
        />
      )}
    </section>
  );
}


function resolveRecommendationRecord(
  records: readonly CommandCenterRecord[],
  decisions: readonly CommandDecision[],
  index: number,
): CommandCenterRecord | null {
  const decision = decisions[index] ?? decisions[0] ?? null;

  if (decision) {
    const matchingRecord = records.find((record) => (
      record.label === decision.metricLabel
    ));

    if (matchingRecord) {
      return matchingRecord;
    }
  }

  const comparable = chooseComparableRecords(records);

  return comparable[index % Math.max(comparable.length, 1)]
    ?? records[index % Math.max(records.length, 1)]
    ?? null;
}

function resolveRecommendationProjectedValue(
  record: CommandCenterRecord,
  recommendation: CommandCenterData['recommendations'][number],
): number {
  const impactMultiplier = recommendation.impact === 'high'
    ? 0.12
    : recommendation.impact === 'medium'
      ? 0.07
      : 0.035;
  const confidenceMultiplier = Math.max(
    Math.min(recommendation.confidence, 1),
    0.35,
  );
  const adjustment = impactMultiplier * confidenceMultiplier;

  return isLowerBetterMetric(record)
    ? record.value * (1 - adjustment)
    : record.value * (1 + adjustment);
}

function CommandWaterfallNarrative({
  items,
}: {
  readonly items: CommandCenterData['waterfall'];
}) {
  const plan = items.find((item) => item.key === 'plan');
  const actual = items.find((item) => item.key === 'actual');
  const positive = items
    .filter((item) => item.value > 0 && item.key !== 'plan' && item.key !== 'actual')
    .reduce((sum, item) => sum + item.value, 0);
  const negative = items
    .filter((item) => item.value < 0)
    .reduce((sum, item) => sum + item.value, 0);

  return (
    <dl className="pd-command-center-workspace__waterfall-narrative">
      <div>
        <dt>Plan</dt>
        <dd>{plan ? formatMetricValue(plan.value, 'currency') : '—'}</dd>
      </div>
      <div>
        <dt>Wkład dodatni</dt>
        <dd>{formatMetricValue(positive, 'currency')}</dd>
      </div>
      <div>
        <dt>Ryzyka</dt>
        <dd>{formatMetricValue(negative, 'currency')}</dd>
      </div>
      <div>
        <dt>Wynik</dt>
        <dd>{actual ? formatMetricValue(actual.value, 'currency') : '—'}</dd>
      </div>
    </dl>
  );
}

function CommandVariantsSection({
  records,
}: {
  readonly records: readonly CommandCenterRecord[];
}) {
  const comparable = chooseComparableRecords(records);

  return (
    <section
      aria-labelledby="command-center-variants-title"
      className="pd-command-center-workspace__section"
    >
      <CommandSectionHeader
        eyebrow="Warianty"
        title="Scenariusze wyniku dla wybranego zakresu"
        trailing={`${records.length} scenariusze`}
        titleId="command-center-variants-title"
      />

      {comparable.length >= 2 ? (
        <ComparisonChart
          ariaLabel="Porównanie scenariuszy z celem"
          className="pd-command-center-workspace__chart-surface"
          data={comparable.map((record) => ({
            id: record.metricId,
            label: record.label,
            values: {
              actual: record.value,
              target: record.target,
            },
          }))}
          series={[
            {
              key: 'actual',
              label: 'Wynik',
            },
            {
              key: 'target',
              label: 'Cel',
            },
          ]}
          unit={resolveUnitLabel(comparable[0]?.unit)}
          valueFormatter={(value) => (
            formatMetricValue(value, comparable[0]?.unit ?? 'number')
          )}
          variant="grouped"
        />
      ) : null}

      <div className="pd-command-center-workspace__variant-matrix">
        {records.map((record) => {
          const context = getRecordContext(record, 'command-variants');

          return (
            <article key={record.metricId}>
              <StatusBadge
                status="Stan danych"
                text={resolveReadinessLabel(record.readiness)}
                tone={resolveReadinessTone(record.readiness)}
              />
              <strong>{record.label}</strong>
              <dl>
                <div>
                  <dt>Wynik</dt>
                  <dd>{formatMetricValue(record.value, record.unit)}</dd>
                </div>
                <div>
                  <dt>Cel</dt>
                  <dd>{record.target === null ? '—' : formatMetricValue(record.target, record.unit)}</dd>
                </div>
                <div>
                  <dt>Zmiana</dt>
                  <dd>{record.delta === null ? '—' : formatSignedPercent(record.delta)}</dd>
                </div>
              </dl>
              <p>{context.nextAction}</p>
              <span>{context.evidenceLabel}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CommandRecordsSection({
  data,
  description,
  rows,
  title,
}: {
  readonly data: CommandCenterData;
  readonly description?: string;
  readonly rows: readonly DataRow[];
  readonly title: string;
}) {
  const showPagination = Boolean(
    data.pageInfo.nextCursor
    || (data.pageInfo.total ?? 0) > rows.length,
  );

  return (
    <section
      aria-labelledby={`command-center-table-${slugify(title)}`}
      className="pd-command-center-workspace__section"
    >
      <CommandSectionHeader
        eyebrow="Dane"
        title={title}
        titleId={`command-center-table-${slugify(title)}`}
      />

      {description ? (
        <p className="pd-command-center-workspace__section-description">
          {description}
        </p>
      ) : null}

      <ol
        aria-label={`${title} — lista mobilna`}
        className="pd-command-center-workspace__mobile-records"
      >
        {rows.map((row) => (
          <li key={row.id}>
            <div>
              <strong>{formatDataRowCell(row.label)}</strong>
              <span>{formatDataRowCell(row.value)} · {formatDataRowCell(row.delta)}</span>
            </div>
            <p>{formatDataRowCell(row.nextAction)}</p>
            <dl>
              <div>
                <dt>Właściciel</dt>
                <dd>{formatDataRowCell(row.owner)}</dd>
              </div>
              <div>
                <dt>Wpływ</dt>
                <dd>{formatDataRowCell(row.impact)}</dd>
              </div>
            </dl>
            <StatusBadge
              status="Stan danych"
              text={formatDataRowCell(row.readinessLabel)}
              tone={resolveReadinessLabelTone(formatDataRowCell(row.readinessLabel))}
            />
          </li>
        ))}
      </ol>

      <DataTable
        ariaLabel={`${title} — Centrum Dowodzenia`}
        className="pd-command-center-workspace__table"
        columns={commandColumns}
        density="compact"
        emptyMessage="Brak metryk dla bieżącego widoku."
        loading={false}
        minWidth={1600}
        cellRenderers={{
          delta: (row) => (
            <span
              className="pd-command-center-workspace__delta"
              data-direction={resolveDeltaDirection(formatDataRowCell(row.delta))}
            >
              {formatDataRowCell(row.delta)}
            </span>
          ),
          impact: (row) => (
            <span className="pd-command-center-workspace__table-copy">
              {formatDataRowCell(row.impact)}
            </span>
          ),
          nextAction: (row) => (
            <span className="pd-command-center-workspace__table-copy pd-command-center-workspace__table-copy--action">
              {formatDataRowCell(row.nextAction)}
            </span>
          ),
          owner: (row) => (
            <span className="pd-command-center-workspace__table-copy pd-command-center-workspace__table-copy--owner">
              {formatDataRowCell(row.owner)}
            </span>
          ),
        }}
        pagination={
          showPagination
            ? {
                cursor: null,
                loading: false,
                nextCursor: data.pageInfo.nextCursor,
                previousCursor: null,
                summary: 'Pełny zakres',
              }
            : null
        }
        rowCount={rows.length}
        rowHeaderColumnId="label"
        rows={rows}
        selectedRowIds={[]}
        sort={{
          columnId: 'value',
          direction: 'desc',
        }}
        statusColumn={{
          columnId: 'readinessLabel',
          label: 'Stan danych',
          mapTone: readinessToneMap,
        }}
        summary={title}
      />
    </section>
  );
}

function CommandSectionHeader({
  eyebrow,
  title,
  titleId,
  trailing,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly titleId?: string;
  readonly trailing?: string;
}) {
  return (
    <header className="pd-command-center-workspace__section-header">
      <div>
        <p>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
      </div>
      {trailing ? <span>{trailing}</span> : null}
    </header>
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

function getCommandCenterDefinition(
  id: BusinessScreenDefinition['id'],
): BusinessScreenDefinition | null {
  const definition = businessScreenDefinitions.find((item) => (
    item.group === 'command-center'
    && item.id === id
  ));

  return definition ?? null;
}

function resolveWorkspaceDateRange(
  range: DateRange | undefined,
): DateRange {
  return range ?? commandFallbackDateRange;
}

function chooseAnalyticRecords(
  records: readonly CommandCenterRecord[],
  variant: BusinessScreenDefinition['variant'],
): readonly CommandCenterRecord[] {
  const relevant = records.filter((record) => (
    record.delta !== null
    || record.target !== null
    || record.readiness !== 'ready'
  ));

  return [...(relevant.length > 0 ? relevant : records)]
    .sort((left, right) => {
      const priorityDelta = attentionWeight(right) - attentionWeight(left);

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      const leftContext = getRecordContext(left, variant);
      const rightContext = getRecordContext(right, variant);

      return resolvePriorityScore(rightContext.priority)
        - resolvePriorityScore(leftContext.priority);
    })
    .slice(0, 6);
}

function buildRecordSparklinePoints(
  record: CommandCenterRecord,
  pointCount: number,
): readonly number[] {
  return buildRecordTrendData(
    record,
    resolveWorkspaceDateRange(defaultWorkspaceContext.range),
    'kpi',
    pointCount,
  )
    .map((datum) => datum.actual)
    .filter((value): value is number => typeof value === 'number');
}

function buildRecordTrendData(
  record: CommandCenterRecord,
  range: DateRange,
  variant: BusinessScreenDefinition['variant'],
  requestedPointCount?: number,
): readonly TrendChartDatum[] {
  const pointCount = requestedPointCount
    ?? resolveTrendPointCount(range);
  const labels = buildTrendLabels(
    range,
    pointCount,
  );
  const aggregateMetric = shouldRenderCumulativeTrend(record);
  const lowerIsBetter = isLowerBetterMetric(record);
  const finalValue = record.value;
  const finalTarget = record.target;
  const delta = record.delta ?? 0;
  const safeDeltaBase = Math.max(0.22, 1 + delta);
  const comparisonBase = finalValue / safeDeltaBase;
  const startRatio = aggregateMetric
    ? 0.08
    : 1;
  const startValue = aggregateMetric
    ? finalValue * startRatio
    : comparisonBase;
  const planStart = finalTarget === null
    ? null
    : aggregateMetric
      ? finalTarget * startRatio
      : finalTarget;
  const amplitude = resolveTrendAmplitude(record);
  const actualValues: number[] = [];

  return labels.map((label, index) => {
    const ratio = pointCount <= 1
      ? 1
      : index / (pointCount - 1);
    const curveRatio = aggregateMetric
      ? Math.pow(ratio, 1.05)
      : ratio;
    const plan = finalTarget === null
      ? null
      : aggregateMetric
        ? interpolateNumber(planStart ?? 0, finalTarget, curveRatio)
        : finalTarget;
    const baseActual = aggregateMetric
      ? interpolateNumber(startValue, finalValue, curveRatio)
      : interpolateNumber(startValue, finalValue, ratio);
    const wave = (
      Math.sin((index + 1) * 1.43 + variant.length * 0.13)
      + Math.cos((index + 2) * 0.71)
    ) * amplitude;
    const anomalyShift = resolveTrendAnomalyShift({
      lowerIsBetter,
      record,
      ratio,
    });
    const actual = index === pointCount - 1
      ? finalValue
      : clampMetricValue(
          baseActual + wave + anomalyShift,
          record.unit,
        );
    const previousPeriod = clampMetricValue(
      actual * resolvePreviousPeriodFactor(delta),
      record.unit,
    );

    actualValues.push(actual);

    return {
      actual,
      label,
      movingAverage: resolveMovingAverage(actualValues),
      plan,
      previousPeriod,
    };
  });
}

function buildTrendRows(
  data: readonly TrendChartDatum[],
  unit: CommandCenterRecord['unit'],
): readonly DataRow[] {
  return data.map((datum) => ({
    actual: datum.actual === null
      ? '—'
      : formatMetricValue(datum.actual, unit),
    analysis: resolveTrendPointAnalysis(datum, unit),
    id: datum.label,
    label: datum.label,
    movingAverage: datum.movingAverage === null || datum.movingAverage === undefined
      ? '—'
      : formatMetricValue(datum.movingAverage, unit),
    plan: datum.plan === null || datum.plan === undefined
      ? '—'
      : formatMetricValue(datum.plan, unit),
    previousPeriod: datum.previousPeriod === null || datum.previousPeriod === undefined
      ? '—'
      : formatMetricValue(datum.previousPeriod, unit),
  }));
}

function buildImpactRows(
  records: readonly CommandCenterRecord[],
): readonly DataRow[] {
  return records.map((record) => {
    const signal = buildAiSignal(record, 'kpi');

    return {
      id: record.metricId,
      impact: record.delta === null
        ? '—'
        : formatSignedPercent(record.delta),
      label: record.label,
      recommendation: getRecordContext(record, 'kpi').nextAction,
      status: signal.status,
    };
  });
}

function buildTrendInteractionPoints(
  data: readonly TrendChartDatum[],
  record: CommandCenterRecord,
): readonly ChartInteractionPoint[] {
  return data.map((datum) => {
    const actual = datum.actual ?? 0;
    const plan = datum.plan ?? null;
    const hasRisk = plan !== null
      && isTrendPointAgainstPlan(
        actual,
        plan,
        record,
      );

    return {
      detail: hasRisk
        ? `${record.label}: punkt odbiega od planu. ${getRecordContext(record, 'kpi').nextAction}.`
        : `${record.label}: punkt mieści się w oczekiwanym rytmie dla wybranego zakresu.`,
      drillDownLabel: 'Analizuj z Papa',
      filterId: hasRisk ? 'risk' : 'full',
      id: datum.label,
      label: datum.label,
      seriesLabel: record.label,
      valueLabel: formatMetricValue(actual, record.unit),
    };
  });
}

function filterTrendData(
  data: readonly TrendChartDatum[],
  filterId: string,
  record: CommandCenterRecord,
): readonly TrendChartDatum[] {
  if (filterId === 'zoom') {
    return data.slice(-Math.min(7, data.length));
  }

  if (filterId === 'risk') {
    const riskData = data.filter((datum) => (
      datum.actual !== null
      && datum.plan !== null
      && datum.plan !== undefined
      && isTrendPointAgainstPlan(
        datum.actual,
        datum.plan,
        record,
      )
    ));

    return riskData.length >= 2
      ? riskData
      : data.slice(-Math.min(7, data.length));
  }

  return data;
}

function buildAiSignal(
  record: CommandCenterRecord,
  variant: BusinessScreenDefinition['variant'],
): CommandAiSignal {
  const context = getRecordContext(record, variant);
  const delta = record.delta ?? 0;

  if (record.readiness === 'unavailable') {
    return {
      description: 'Brakuje źródła lub odczyt jest zablokowany, więc AI nie powinno automatyzować decyzji.',
      evidence: context.evidenceLabel,
      id: `${record.metricId}-ai-blocked`,
      label: record.label,
      severity: 'critical',
      status: 'Ryzyko danych',
    };
  }

  if (record.readiness === 'stale' || record.readiness === 'partial') {
    return {
      description: `${context.nextAction}. Interpretacja wyniku jest ograniczona przez stan danych.`,
      evidence: context.evidenceLabel,
      id: `${record.metricId}-ai-data-risk`,
      label: record.label,
      severity: 'warning',
      status: record.readiness === 'stale'
        ? 'Nieświeże dane'
        : 'Częściowe dane',
    };
  }

  if (isMetricWorse(record)) {
    return {
      description: `${context.diagnosis} Papa rekomenduje reakcję: ${context.nextAction}.`,
      evidence: context.evidenceLabel,
      id: `${record.metricId}-ai-drop`,
      label: record.label,
      severity: 'warning',
      status: 'Spadek / anomalia',
    };
  }

  if (Math.abs(delta) >= 0.15) {
    return {
      description: 'Zmiana jest większa niż zwykły próg obserwacji; warto potwierdzić źródło i wpływ.',
      evidence: context.evidenceLabel,
      id: `${record.metricId}-ai-anomaly`,
      label: record.label,
      severity: 'info',
      status: 'Anomalia wzrostu',
    };
  }

  return {
    description: `${context.nextAction}. Brak pilnej eskalacji w bieżącym zakresie.`,
    evidence: context.evidenceLabel,
    id: `${record.metricId}-ai-stable`,
    label: record.label,
    severity: 'success',
    status: 'Stabilne',
  };
}

function resolveMetricSignal(
  record: CommandCenterRecord,
): 'negative' | 'neutral' | 'positive' | 'warning' {
  if (record.readiness !== 'ready') {
    return 'warning';
  }

  if (isMetricWorse(record)) {
    return 'negative';
  }

  if ((record.delta ?? 0) > 0) {
    return isLowerBetterMetric(record)
      ? 'warning'
      : 'positive';
  }

  return 'neutral';
}

function resolveMetricEmphasis(
  record: CommandCenterRecord,
): 'alert' | 'default' | 'recommendation' {
  if (record.readiness !== 'ready' || isMetricWorse(record)) {
    return 'alert';
  }

  if ((record.delta ?? 0) > 0.08) {
    return 'recommendation';
  }

  return 'default';
}

function resolveMetricRiskLabel(
  record: CommandCenterRecord,
): string | null {
  if (record.readiness === 'unavailable') {
    return 'AI: blokada źródła danych';
  }

  if (record.readiness === 'stale') {
    return 'AI: ryzyko nieświeżych danych';
  }

  if (record.readiness === 'partial') {
    return 'AI: analiza częściowa';
  }

  if (isMetricWorse(record)) {
    return 'AI: wykryty spadek lub ryzyko';
  }

  if (Math.abs(record.delta ?? 0) >= 0.15) {
    return 'AI: anomalia dodatnia do potwierdzenia';
  }

  return null;
}

function resolveMetricStateMessage(
  record: CommandCenterRecord,
): string | null {
  const riskLabel = resolveMetricRiskLabel(record);

  return riskLabel
    ? `${riskLabel}. ${getRecordContext(record, 'kpi').nextAction}.`
    : null;
}

function resolveMetricDeviationLabel(
  record: CommandCenterRecord,
): string | null {
  if (record.target === null) {
    return null;
  }

  const difference = record.value - record.target;
  const sign = difference > 0
    ? '+'
    : difference < 0
      ? '-'
      : '';

  return `${sign}${formatMetricValue(Math.abs(difference), record.unit)}`;
}

function resolveMetricFreshnessLabel(
  record: CommandCenterRecord,
): string {
  switch (record.readiness) {
    case 'ready':
      return 'świeże źródła';
    case 'partial':
      return 'częściowa synchronizacja';
    case 'stale':
      return 'wymaga odświeżenia';
    case 'unavailable':
      return 'źródło niedostępne';
    default:
      return 'status nieznany';
  }
}

function resolveMetricSourceLabel(
  record: CommandCenterRecord,
): string {
  const label = normalizeLabel(record.label);

  if (label.includes('ga4') || label.includes('event') || label.includes('ruch')) {
    return 'GA4';
  }

  if (label.includes('meta')) {
    return 'Meta Ads';
  }

  if (label.includes('google') || label.includes('search') || label.includes('roas')) {
    return 'Google Ads';
  }

  if (label.includes('produkt') || label.includes('marza') || label.includes('bestseller')) {
    return 'Shopify / katalog';
  }

  if (label.includes('klien') || label.includes('repeat')) {
    return 'CRM';
  }

  return 'PapaData analytics';
}

function resolveTrendPointAnalysis(
  datum: TrendChartDatum,
  unit: CommandCenterRecord['unit'],
): string {
  if (datum.actual === null) {
    return 'brak wyniku';
  }

  if (datum.plan !== null && datum.plan !== undefined) {
    const distance = datum.actual - datum.plan;
    const absolute = Math.abs(distance);
    const threshold = Math.max(Math.abs(datum.plan) * 0.04, 0.01);

    if (absolute >= threshold) {
      return distance < 0
        ? `poniżej planu o ${formatMetricValue(absolute, unit)}`
        : `powyżej planu o ${formatMetricValue(absolute, unit)}`;
    }
  }

  return 'w rytmie zakresu';
}

function resolveTrendPointCount(
  range: DateRange,
): number {
  const days = getCommandDateRangeDayCount(range);

  if (days <= 1) {
    return 8;
  }

  if (days <= 7) {
    return Math.max(days, 4);
  }

  if (days <= 30) {
    return 16;
  }

  return 24;
}

function buildTrendLabels(
  range: DateRange,
  pointCount: number,
): readonly string[] {
  const days = getCommandDateRangeDayCount(range);

  if (days <= 1) {
    return Array.from({ length: pointCount }, (_item, index) => {
      const hour = Math.round((index / Math.max(pointCount - 1, 1)) * 23);

      return `${String(hour).padStart(2, '0')}:00`;
    });
  }

  const from = parseCommandDate(range.from)
    ?? new Date(`${commandFallbackDateRange.from}T00:00:00.000Z`);
  const to = parseCommandDate(range.to)
    ?? new Date(`${commandFallbackDateRange.to}T00:00:00.000Z`);
  const span = Math.max(to.getTime() - from.getTime(), 0);

  return Array.from({ length: pointCount }, (_item, index) => {
    const ratio = pointCount <= 1
      ? 1
      : index / (pointCount - 1);
    const date = new Date(from.getTime() + span * ratio);

    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      timeZone: range.timezone,
    }).format(date);
  });
}

function getCommandDateRangeDayCount(
  range: DateRange,
): number {
  const from = parseCommandDate(range.from);
  const to = parseCommandDate(range.to);

  if (!from || !to) {
    switch (range.preset) {
      case 'last90d':
        return 90;
      case 'last30d':
        return 30;
      case 'last7d':
        return 7;
      case 'today':
      default:
        return 1;
    }
  }

  const dayMs = 24 * 60 * 60 * 1_000;

  return Math.max(
    Math.round((to.getTime() - from.getTime()) / dayMs) + 1,
    1,
  );
}

function parseCommandDate(
  value: string,
): Date | null {
  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function shouldRenderCumulativeTrend(
  record: CommandCenterRecord,
): boolean {
  return record.unit === 'currency'
    || (
      record.unit === 'number'
      && !normalizeLabel(record.label).includes('cpa')
      && !normalizeLabel(record.label).includes('produkty bez')
    );
}

function resolveTrendAmplitude(
  record: CommandCenterRecord,
): number {
  if (record.unit === 'percent' || record.unit === 'ratio') {
    return Math.max(Math.abs(record.value) * 0.018, 0.0015);
  }

  if (record.unit === 'duration') {
    return Math.max(Math.abs(record.value) * 0.015, 0.08);
  }

  return Math.max(Math.abs(record.value) * 0.018, 1);
}

function resolveTrendAnomalyShift({
  lowerIsBetter,
  ratio,
  record,
}: {
  readonly lowerIsBetter: boolean;
  readonly ratio: number;
  readonly record: CommandCenterRecord;
}): number {
  const isRiskWindow = ratio > 0.58 && ratio < 0.78;

  if (!isRiskWindow || !isMetricWorse(record)) {
    return 0;
  }

  const shift = resolveTrendAmplitude(record) * 2.5;

  return lowerIsBetter
    ? shift
    : -shift;
}

function resolvePreviousPeriodFactor(
  delta: number,
): number {
  if (delta === 0) {
    return 0.97;
  }

  return Math.max(
    0.6,
    Math.min(1.4, 1 - delta * 0.62),
  );
}

function resolveMovingAverage(
  values: readonly number[],
): number {
  const slice = values.slice(-3);
  const sum = slice.reduce((total, value) => total + value, 0);

  return sum / Math.max(slice.length, 1);
}

function interpolateNumber(
  from: number,
  to: number,
  ratio: number,
): number {
  return from + (to - from) * ratio;
}

function clampMetricValue(
  value: number,
  unit: CommandCenterRecord['unit'],
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (unit === 'percent') {
    return Math.min(Math.max(value, 0), 1.5);
  }

  if (unit === 'ratio') {
    return Math.max(value, 0);
  }

  if (unit === 'currency' || unit === 'number') {
    return Math.max(value, 0);
  }

  return value;
}

function isTrendPointAgainstPlan(
  actual: number,
  plan: number,
  record: CommandCenterRecord,
): boolean {
  const threshold = Math.max(Math.abs(plan) * 0.035, 0.01);

  return isLowerBetterMetric(record)
    ? actual - plan > threshold
    : plan - actual > threshold;
}

function isLowerBetterMetric(
  record: CommandCenterRecord,
): boolean {
  const label = normalizeLabel(record.label);

  return [
    'cpa',
    'koszt',
    'odrzucone',
    'platnosci',
    'zwroty',
    'bez mapowania',
    'odplyw',
  ].some((keyword) => label.includes(keyword));
}

function resolvePriorityScore(
  priority: OperationalPriority,
): number {
  switch (priority) {
    case 'critical':
      return 4;
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
    default:
      return 1;
  }
}

function shortenMetricLabel(
  value: string,
): string {
  return value.length > 28
    ? `${value.slice(0, 25)}...`
    : value;
}

function formatImpactPercentPoint(
  value: number,
): string {
  return `${new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

function formatDataRowCell(
  value: DataRow[string],
): string {
  if (value === null || value === undefined) {
    return '—';
  }

  return String(value);
}

function resolveDeltaDirection(
  value: string,
): 'down' | 'flat' | 'none' | 'up' {
  if (value === '—') {
    return 'none';
  }

  if (value.startsWith('-')) {
    return 'down';
  }

  if (value.startsWith('+')) {
    return value === '+0%' || value === '+0,0%'
      ? 'flat'
      : 'up';
  }

  return 'flat';
}

function resolveReadinessLabelTone(
  value: string,
): 'critical' | 'neutral' | 'success' | 'warning' {
  switch (value) {
    case 'Gotowe':
      return 'success';
    case 'Częściowe':
    case 'Nieświeże':
      return 'warning';
    case 'Niedostępne':
      return 'critical';
    default:
      return 'neutral';
  }
}

function buildCommandRows(
  records: readonly CommandCenterRecord[],
  variant: BusinessScreenDefinition['variant'],
): readonly DataRow[] {
  return records.map((record) => {
    const context = getRecordContext(record, variant);

    return {
      delta: record.delta === null
        ? '—'
        : formatSignedPercent(record.delta),
      id: record.metricId,
      impact: context.businessImpact,
      label: record.label,
      nextAction: context.nextAction,
      owner: context.owner,
      readinessLabel: resolveReadinessLabel(record.readiness),
      target: record.target === null
        ? '—'
        : formatMetricValue(record.target, record.unit),
      value: formatMetricValue(record.value, record.unit),
    };
  });
}

function isMetricWorse(
  record: CommandCenterRecord,
): boolean {
  if (record.delta === null) {
    return record.readiness === 'unavailable';
  }

  const label = normalizeLabel(record.label);
  const lowerIsBetter = [
    'cpa',
    'koszt',
    'odrzucone',
    'platnosci',
    'zwroty',
    'bez mapowania',
    'odplyw',
  ].some((keyword) => label.includes(keyword));

  if (lowerIsBetter) {
    return record.delta > 0;
  }

  return record.delta < 0;
}

function normalizeLabel(
  value: string,
): string {
  return value
    .toLocaleLowerCase('pl-PL')
    .normalize('NFD')
    .replace(/ł/gu, 'l')
    .replace(/[\u0300-\u036f]/gu, '');
}

function resolvePriorityLabel(
  priority: OperationalPriority,
): string {
  switch (priority) {
    case 'critical':
      return 'Krytyczne';
    case 'high':
      return 'Wysokie';
    case 'medium':
      return 'Średnie';
    case 'low':
      return 'Niskie';
    default:
      return priority;
  }
}

function resolveStepDropoff(
  steps: CommandCenterData['funnelSteps'],
  index: number,
): number {
  const step = steps[index];
  const previous = steps[index - 1];

  if (!step || !previous) {
    return 0;
  }

  return 1 - (step.completions / Math.max(previous.completions, 1));
}

function chooseComparableRecords(
  records: readonly CommandCenterRecord[],
): readonly CommandCenterRecord[] {
  const candidates = records.filter((record) => record.target !== null);
  const counts = new Map<CommandCenterRecord['unit'], number>();

  candidates.forEach((record) => {
    counts.set(
      record.unit,
      (counts.get(record.unit) ?? 0) + 1,
    );
  });

  let selectedUnit: CommandCenterRecord['unit'] | null = null;
  let selectedCount = 0;

  counts.forEach((count, unit) => {
    if (count > selectedCount) {
      selectedCount = count;
      selectedUnit = unit;
    }
  });

  if (!selectedUnit) {
    return [];
  }

  return candidates
    .filter((record) => record.unit === selectedUnit)
    .slice(0, 6);
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
