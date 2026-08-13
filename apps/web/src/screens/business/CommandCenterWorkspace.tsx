import type {
  CommandCenterRecord,
  ReadinessStatus,
} from '../../../../../contracts/api-schemas';
import type {
  DataColumn,
  DataRow,
} from '../../../../../contracts/component-shared';
import type {
  ReadinessState,
} from '../../../../../contracts/ui-contract-types';
import {
  Button,
  ComparisonChart,
  DataStatusBanner,
  DataTable,
  FunnelChart,
  InlineNotice,
  MetricCard,
  MorningBrief,
  PageHeader,
  SectionNavigation,
  StatusBadge,
  WaterfallChart,
} from '../../design-system';
import type {
  AnalyticsDataState,
} from '../../design-system';
import {
  businessScreenDefinitions,
  defaultWorkspaceContext,
} from './businessData';
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
    label: 'Metryka',
    sortable: true,
    width: 240,
  },
  {
    align: 'right',
    id: 'value',
    label: 'Wynik',
    sortable: true,
  },
  {
    align: 'right',
    id: 'target',
    label: 'Cel',
    sortable: true,
  },
  {
    align: 'right',
    id: 'delta',
    label: 'Zmiana',
    sortable: true,
  },
  {
    id: 'readinessLabel',
    label: 'Readiness',
    sortable: true,
  },
];

const readinessToneMap = {
  Częściowe: 'warning',
  Gotowe: 'success',
  Niedostępne: 'danger',
  Nieświeże: 'warning',
} satisfies Record<string, 'danger' | 'success' | 'warning'>;

const commandCenterNavigation = businessScreenDefinitions
  .filter((item) => item.group === 'command-center')
  .map((item) => ({
    href: item.route,
    id: item.id,
    label: item.displayTitle,
  }));

export function CommandCenterWorkspace({
  data,
  definition,
  loading = false,
  mode = 'runtime',
  onReload,
  problem = null,
}: CommandCenterWorkspaceProps) {
  const dataState = resolveDataState({
    data,
    loading,
    problem,
  });
  const issues = problem
    ? [
        {
          id: `${definition.id}-api-problem`,
          label: 'Odczyt danych jest niedostępny',
          severity: 'critical' as const,
        },
      ]
    : buildIssues(data);

  return (
    <section
      aria-busy={loading || undefined}
      aria-label={`Centrum Dowodzenia: ${definition.displayTitle}`}
      className="pd-command-center-workspace"
      data-command-center-variant={definition.variant}
      data-mode={mode}
      data-screen-id={definition.id}
    >
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
            label: definition.displayTitle,
          },
        ]}
        subtitle={definition.summary}
        title={definition.displayTitle}
        actions={
          onReload ? (
            <Button
              loading={loading}
              loadingLabel="Odświeżanie"
              size="small"
              variant="secondary"
              onClick={onReload}
            >
              Odśwież dane
            </Button>
          ) : null
        }
      />

      <SectionNavigation
        activeId={definition.id}
        ariaLabel="Widoki Centrum Dowodzenia"
        className="pd-command-center-workspace__navigation"
        items={commandCenterNavigation}
        orientation="horizontal"
        size="compact"
      />

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
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
  readonly definition: BusinessScreenDefinition;
  readonly issues: readonly {
    readonly id: string;
    readonly label: string;
    readonly severity: 'critical' | 'warning';
  }[];
}) {
  const rows = buildCommandRows(data.records);

  if (definition.variant === 'overview') {
    return (
      <>
        <MorningBrief
          className="pd-command-center-workspace__morning-brief"
          context={defaultWorkspaceContext}
          dataReadiness={resolveSummaryReadiness(data)}
          decisionsDue={countAttentionRecords(data.records)}
          highlights={buildHighlights(data.records)}
        />

        <CommandSummaryStrip
          data={data}
          dataState={dataState}
        />

        <CommandDataStatus
          data={data}
          dataState={dataState}
          issues={issues}
        />

        <CommandRecordsSection
          data={data}
          description="Pełny rejestr KPI zwróconych przez endpoint widoku głównego."
          rows={rows}
          title="Najważniejsze wyniki"
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
      />

      {renderVariant({
        data,
        dataState,
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
        <dt>Readiness</dt>
        <dd>
          <StatusBadge
            status="Readiness"
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
        <dt>Aktualizacja</dt>
        <dd>{formatShortTime(data.generatedAt)}</dd>
      </div>
    </dl>
  );
}

function CommandDataStatus({
  data,
  dataState,
  issues,
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
  readonly issues: readonly {
    readonly id: string;
    readonly label: string;
    readonly severity: 'critical' | 'warning';
  }[];
}) {
  if (data.sources.length === 0 && issues.length === 0) {
    return null;
  }

  return (
    <DataStatusBanner
      blockingIssues={[...issues]}
      className="pd-command-center-workspace__data-status"
      context={defaultWorkspaceContext}
      readiness={resolveReadinessState(dataState)}
      sources={[...data.sources]}
    />
  );
}

function renderVariant({
  data,
  dataState,
  definition,
  rows,
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
  readonly definition: BusinessScreenDefinition;
  readonly rows: readonly DataRow[];
}) {
  switch (definition.variant) {
    case 'attention':
      return (
        <>
          <CommandAttentionSection
            records={data.records}
            title="Priorytety wymagające reakcji"
          />
          <CommandRecordsSection
            data={data}
            description="Rejestr metryk i sygnałów będących podstawą kolejki uwagi."
            rows={rows}
            title="Pełny rejestr"
          />
        </>
      );

    case 'kpi':
      return (
        <>
          <CommandMetricSection
            dataState={dataState}
            records={data.records}
          />
          <CommandRecordsSection
            data={data}
            description="Wynik, cel, zmiana i readiness bez syntetycznych serii trendu."
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
            description="Ranking opiera się wyłącznie na względnej zmianie dostarczonej przez kontrakt."
            rows={rows}
            title="Metryki źródłowe"
          />
        </>
      );

    case 'sales-sources':
      return (
        <CommandRecordsSection
          data={data}
          description="Widok nie tworzy syntetycznych udziałów kanałów, jeśli endpoint nie dostarcza osobnego modelu źródeł."
          rows={rows}
          title="Wyniki według źródeł"
        />
      );

    case 'traffic':
      return (
        <CommandRecordsSection
          data={data}
          description="Ruch, konwersja i jakość eventów w jednym rejestrze z jawnie widocznym readiness."
          rows={rows}
          title="Ruch i jakość danych"
        />
      );

    case 'products':
      return (
        <CommandRecordsSection
          data={data}
          description="Przegląd metryk produktowych bez lokalnego duplikowania katalogu produktów."
          rows={rows}
          title="Kondycja produktów"
        />
      );

    case 'customers':
      return (
        <>
          <InlineNotice
            message="Widok prezentuje wyłącznie agregaty i pseudonimizowane informacje dopuszczone przez kontrakt."
            title="Prywatność klientów"
            tone="info"
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
            title="Lejek sprzedażowy"
            trailing={`${data.funnelSteps.length} kroków`}
          />
          {data.funnelSteps.length > 0 ? (
            <>
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
                {data.funnelSteps.map((step) => (
                  <li key={step.stepId}>
                    <span>{step.label}</span>
                    <strong>{formatInteger(step.completions)}</strong>
                    <small>
                      CR {formatPercent(step.conversionRate)}
                    </small>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <InlineNotice
              message="Endpoint nie zwrócił kroków lejka dla bieżącego zakresu."
              title="Brak danych lejka"
              tone="info"
            />
          )}
        </>
      );

    case 'recommendations':
      return (
        <CommandRecommendationsSection data={data} />
      );

    case 'sales-signals':
      return (
        <>
          <CommandAttentionSection
            records={data.records}
            title="Sygnały wymagające interpretacji"
          />
          <CommandRecordsSection
            data={data}
            description="Pełny rejestr sygnałów sprzedażowych zwróconych przez endpoint."
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
            title="Składniki zmiany"
            trailing={`${data.waterfall.length} pozycji`}
          />
          {data.waterfall.length > 0 ? (
            <WaterfallChart
              className="pd-command-center-workspace__chart-surface"
              items={data.waterfall.map((item) => ({
                id: item.key,
                kind: item.value < 0
                  ? 'decrease'
                  : item.key === 'actual'
                    ? 'total'
                    : 'increase',
                label: item.label,
                value: item.value,
              }))}
              showCumulative
              unit="currency"
            />
          ) : (
            <InlineNotice
              message="Endpoint nie zwrócił składników waterfall dla bieżącego zakresu."
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

function CommandAttentionSection({
  records,
  title,
}: {
  readonly records: readonly CommandCenterRecord[];
  readonly title: string;
}) {
  const attention = [...records]
    .filter((record) => (
      record.readiness !== 'ready'
      || (record.delta ?? 0) < 0
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

      {attention.length > 0 ? (
        <ul className="pd-command-center-workspace__attention-list">
          {attention.map((record) => (
            <li key={record.metricId}>
              <div>
                <strong>{record.label}</strong>
                <span>
                  {formatMetricValue(record.value, record.unit)}
                  {record.target === null
                    ? ''
                    : ` · cel ${formatMetricValue(record.target, record.unit)}`}
                </span>
              </div>
              <span>
                {record.delta === null
                  ? '—'
                  : formatSignedPercent(record.delta)}
              </span>
              <StatusBadge
                status="Readiness"
                text={resolveReadinessLabel(record.readiness)}
                tone={resolveReadinessTone(record.readiness)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <InlineNotice
          message="W bieżącym zestawie nie ma metryk wymagających reakcji."
          title="Brak pozycji wymagających uwagi"
          tone="success"
        />
      )}
    </section>
  );
}

function CommandMetricSection({
  dataState,
  records,
}: {
  readonly dataState: AnalyticsDataState;
  readonly records: readonly CommandCenterRecord[];
}) {
  const metrics = [...records]
    .sort((left, right) => (
      Math.abs(right.delta ?? 0) - Math.abs(left.delta ?? 0)
    ))
    .slice(0, 4);

  return (
    <section
      aria-labelledby="command-center-kpi-title"
      className="pd-command-center-workspace__section"
    >
      <CommandSectionHeader
        eyebrow="KPI"
        title="Najważniejsze odchylenia"
        trailing={`${metrics.length} metryk`}
        titleId="command-center-kpi-title"
      />

      <div className="pd-command-center-workspace__metric-grid">
        {metrics.map((record) => (
          <MetricCard
            className="pd-command-center-workspace__metric"
            key={record.metricId}
            label={record.label}
            metricId={record.metricId}
            status={
              record.readiness === 'ready'
                ? dataState
                : mapReadinessToAnalyticsState(record.readiness)
            }
            statusLabel={resolveReadinessLabel(record.readiness)}
            targetLabel={
              record.target === null
                ? null
                : `Cel: ${formatMetricValue(record.target, record.unit)}`
            }
            value={formatMetricValue(record.value, record.unit)}
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
          />
        ))}
      </div>
    </section>
  );
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
        title="Porównanie z celem"
        trailing={
          comparable.length > 0
            ? `${comparable.length} porównywalne KPI`
            : 'brak porównania'
        }
        titleId="command-center-plan-title"
      />

      {comparable.length >= 2 ? (
        <ComparisonChart
          ariaLabel="Porównanie wyniku z celem"
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
        trailing={`${drivers.length} pozycji`}
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

function CommandRecommendationsSection({
  data,
}: {
  readonly data: CommandCenterData;
}) {
  return (
    <section
      aria-labelledby="command-center-recommendations-title"
      className="pd-command-center-workspace__section"
    >
      <CommandSectionHeader
        eyebrow="AI"
        title="Rekomendacje do oceny"
        trailing={`${data.recommendations.length} rekomendacji`}
        titleId="command-center-recommendations-title"
      />

      {data.recommendations.length > 0 ? (
        <div className="pd-command-center-workspace__recommendations">
          {data.recommendations.map((recommendation) => (
            <article key={recommendation.recommendationId}>
              <div>
                <strong>{recommendation.title}</strong>
                <p>{recommendation.rationale}</p>
              </div>
              <dl>
                <div>
                  <dt>Wpływ</dt>
                  <dd>{resolveImpactLabel(recommendation.impact)}</dd>
                </div>
                <div>
                  <dt>Confidence</dt>
                  <dd>{formatPercent(recommendation.confidence)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <InlineNotice
          message="Endpoint nie zwrócił rekomendacji dla bieżącego kontekstu."
          title="Brak rekomendacji"
          tone="info"
        />
      )}
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
  readonly description: string;
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
        trailing={`${rows.length} metryk`}
        titleId={`command-center-table-${slugify(title)}`}
      />

      <p className="pd-command-center-workspace__section-description">
        {description}
      </p>

      <DataTable
        ariaLabel={`${title} — Centrum Dowodzenia`}
        className="pd-command-center-workspace__table"
        columns={commandColumns}
        density="compact"
        emptyMessage="Brak metryk dla bieżącego widoku."
        loading={false}
        minWidth={720}
        pagination={
          showPagination
            ? {
                cursor: null,
                loading: false,
                nextCursor: data.pageInfo.nextCursor,
                previousCursor: null,
                summary: `${data.pageInfo.total} metryk`,
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
          label: 'Readiness',
          mapTone: readinessToneMap,
        }}
        summary={`${rows.length} metryk w bieżącym widoku.`}
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

function buildCommandRows(
  records: readonly CommandCenterRecord[],
): readonly DataRow[] {
  return records.map((record) => ({
    delta: record.delta === null
      ? '—'
      : formatSignedPercent(record.delta),
    id: record.metricId,
    label: record.label,
    readinessLabel: resolveReadinessLabel(record.readiness),
    target: record.target === null
      ? '—'
      : formatMetricValue(record.target, record.unit),
    value: formatMetricValue(record.value, record.unit),
  }));
}

function buildHighlights(
  records: readonly CommandCenterRecord[],
) {
  return [...records]
    .sort((left, right) => (
      attentionWeight(right) - attentionWeight(left)
    ))
    .slice(0, 3)
    .map((record) => ({
      id: record.metricId,
      metric: `${formatMetricValue(record.value, record.unit)} · ${resolveReadinessLabel(record.readiness)}`,
      severity: record.readiness === 'ready'
        && (record.delta ?? 0) >= 0
        ? 'info' as const
        : 'warning' as const,
      title: record.label,
    }));
}

function countAttentionRecords(
  records: readonly CommandCenterRecord[],
): number {
  return records.filter((record) => (
    record.readiness !== 'ready'
    || (record.delta ?? 0) < 0
  )).length;
}

function attentionWeight(
  record: CommandCenterRecord,
): number {
  const readinessWeight = record.readiness === 'unavailable'
    ? 4
    : record.readiness === 'stale'
      ? 3
      : record.readiness === 'partial'
        ? 2
        : 0;
  const deltaWeight = Math.max(
    -(record.delta ?? 0),
    0,
  );

  return readinessWeight + deltaWeight;
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

function resolveDataState({
  data,
  loading,
  problem,
}: {
  readonly data: CommandCenterData | null;
  readonly loading: boolean;
  readonly problem: string | null;
}): AnalyticsDataState {
  if (loading) {
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

function resolveDataStateLabel(
  state: AnalyticsDataState,
): string {
  switch (state) {
    case 'ready':
      return 'Gotowe';
    case 'loading':
      return 'Ładowanie';
    case 'partial':
      return 'Częściowe';
    case 'stale':
      return 'Nieświeże';
    case 'error':
      return 'Błąd źródła';
    case 'noData':
      return 'Brak danych';
    default:
      return state;
  }
}

function resolveDataStateTone(
  state: AnalyticsDataState,
): 'critical' | 'neutral' | 'success' | 'warning' {
  switch (state) {
    case 'ready':
      return 'success';
    case 'partial':
    case 'stale':
    case 'loading':
      return 'warning';
    case 'error':
      return 'critical';
    case 'noData':
    default:
      return 'neutral';
  }
}

function resolveReadinessState(
  state: AnalyticsDataState,
): ReadinessState {
  switch (state) {
    case 'ready':
      return 'ready';
    case 'loading':
      return 'processing';
    case 'partial':
      return 'partial';
    case 'stale':
      return 'stale';
    case 'error':
      return 'sourceError';
    case 'noData':
      return 'noData';
    default:
      return 'partial';
  }
}

function resolveSummaryReadiness(
  data: CommandCenterData,
): ReadinessState {
  if (data.summary.critical > 0) {
    return 'partial';
  }

  if (data.summary.warning > 0) {
    return 'stale';
  }

  return 'ready';
}

function mapReadinessToAnalyticsState(
  readiness: ReadinessStatus,
): AnalyticsDataState {
  switch (readiness) {
    case 'ready':
      return 'ready';
    case 'partial':
      return 'partial';
    case 'stale':
      return 'stale';
    case 'unavailable':
      return 'error';
    default:
      return 'partial';
  }
}

function resolveReadinessLabel(
  readiness: ReadinessStatus,
): string {
  switch (readiness) {
    case 'ready':
      return 'Gotowe';
    case 'partial':
      return 'Częściowe';
    case 'stale':
      return 'Nieświeże';
    case 'unavailable':
      return 'Niedostępne';
    default:
      return readiness;
  }
}

function resolveReadinessTone(
  readiness: ReadinessStatus,
): 'critical' | 'neutral' | 'success' | 'warning' {
  switch (readiness) {
    case 'ready':
      return 'success';
    case 'partial':
    case 'stale':
      return 'warning';
    case 'unavailable':
      return 'critical';
    default:
      return 'neutral';
  }
}

function resolveImpactLabel(
  impact: 'high' | 'low' | 'medium',
): string {
  switch (impact) {
    case 'high':
      return 'Wysoki';
    case 'medium':
      return 'Średni';
    case 'low':
      return 'Niski';
    default:
      return impact;
  }
}

function resolveUnitLabel(
  unit: CommandCenterRecord['unit'] | undefined,
): string | null {
  switch (unit) {
    case 'currency':
      return 'PLN';
    case 'percent':
      return '%';
    case 'duration':
      return 's';
    case 'ratio':
    case 'number':
      return null;
    default:
      return null;
  }
}

function formatMetricValue(
  value: number,
  unit: CommandCenterRecord['unit'],
): string {
  switch (unit) {
    case 'currency':
      return new Intl.NumberFormat('pl-PL', {
        currency: 'PLN',
        maximumFractionDigits: 0,
        style: 'currency',
      }).format(value);
    case 'percent':
      return new Intl.NumberFormat('pl-PL', {
        maximumFractionDigits: 1,
        style: 'percent',
      }).format(value);
    case 'duration':
      return `${new Intl.NumberFormat('pl-PL', {
        maximumFractionDigits: 1,
      }).format(value)} s`;
    case 'ratio':
    case 'number':
    default:
      return new Intl.NumberFormat('pl-PL', {
        maximumFractionDigits: 2,
      }).format(value);
  }
}

function formatSignedPercent(
  value: number,
): string {
  const formatted = new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    signDisplay: 'always',
    style: 'percent',
  }).format(value);

  return formatted;
}

function formatPercent(
  value: number,
): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(value);
}

function formatInteger(
  value: number,
): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShortTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: defaultWorkspaceContext.range?.timezone ?? 'UTC',
  }).format(date);
}

function slugify(
  value: string,
): string {
  return value
    .toLocaleLowerCase('pl-PL')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '');
}
