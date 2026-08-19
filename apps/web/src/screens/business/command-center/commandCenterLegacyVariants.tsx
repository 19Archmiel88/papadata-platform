import type {
  CommandCenterRecord,
} from '../../../../../../contracts/api-schemas';
import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  ComparisonChart,
  DataStatusBanner,
  DataTable,
  FunnelChart,
  InlineNotice,
  MetricCard,
  StatusBadge,
  WaterfallChart,
} from '../../../design-system';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import {
  defaultWorkspaceContext,
} from '../businessData';
import type {
  BusinessScreenData,
  BusinessScreenDefinition,
} from '../businessData';
import {
  CommandAnalyticsSection,
  buildLegacyDemoSparklinePoints,
  truncateChartLabel,
} from './commandCenterLegacyAnalytics';
import {
  attentionWeight,
  getRecordContext,
  isMetricWorse,
  normalizeLabel,
  openPapaAssistantForElement,
  resolveMetricDeviationLabel,
  resolveMetricEmphasis,
  resolveMetricFreshnessLabel,
  resolveMetricRiskLabel,
  resolveMetricSignal,
  resolveMetricSourceLabel,
  resolveRecommendationProjectedValue,
  resolveRuntimeForecastValue,
} from './commandCenterOnePageModel';
import type {
  CommandDecision,
  OperationalPriority,
} from './commandCenterOnePageModel';
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
} from '../commandCenterWorkspaceFormatters';

type CommandCenterData = Extract<
  BusinessScreenData,
  { readonly group: 'command-center' }
>;

const commandColumns: readonly DataColumn[] = [
  { id: 'label', label: 'Obszar', sortable: true, width: 260 },
  { align: 'right', id: 'value', label: 'Wynik', sortable: true, width: 150 },
  { align: 'right', id: 'target', label: 'Cel', sortable: true, width: 150 },
  { align: 'right', id: 'delta', label: 'Zmiana', sortable: true, width: 120 },
  { id: 'impact', label: 'Wpływ', sortable: true, width: 240 },
  { id: 'nextAction', label: 'Następny krok', width: 300 },
  { id: 'owner', label: 'Właściciel', sortable: true, width: 220 },
  { id: 'readinessLabel', label: 'Stan danych', sortable: true, width: 160 },
];

const readinessToneMap = {
  Częściowe: 'warning',
  Gotowe: 'success',
  Niedostępne: 'danger',
  Nieświeże: 'warning',
} satisfies Record<string, 'danger' | 'success' | 'warning'>;

/**
 * Records comparable on the same chart axis: the largest same-unit group
 * among records that carry a target. This solves unit-matching for
 * ComparisonChart, a different problem from model.ts's chooseComparableRecords
 * (which just filters for target-or-delta presence) — despite the similar
 * name in the old single-file version, keep them distinct.
 */
function chooseSameUnitRecords(
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

function resolveMetricStateMessage(
  record: CommandCenterRecord,
): string | null {
  const riskLabel = resolveMetricRiskLabel(record);

  return riskLabel
    ? `${riskLabel}. ${getRecordContext(record, 'kpi').nextAction}.`
    : null;
}

export function renderVariant({
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

export function CommandExecutiveBrief({
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

export function CommandSummaryStrip({
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

export function CommandDataStatus({
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

export function CommandDecisionBoard({
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

export function CommandAttentionSection({
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

export function CommandMetricSection({
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
            sparklinePoints={buildLegacyDemoSparklinePoints(record, 14)}
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

function CommandPlanSection({
  dataState,
  records,
}: {
  readonly dataState: AnalyticsDataState;
  readonly records: readonly CommandCenterRecord[];
}) {
  const comparable = chooseSameUnitRecords(records);

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
                          label: truncateChartLabel(projectedRecord.label),
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

  const comparable = chooseSameUnitRecords(records);

  return comparable[index % Math.max(comparable.length, 1)]
    ?? records[index % Math.max(records.length, 1)]
    ?? null;
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
  const comparable = chooseSameUnitRecords(records);

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

export function CommandRecordsSection({
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

export function CommandSectionHeader({
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

export function buildCommandRows(
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
