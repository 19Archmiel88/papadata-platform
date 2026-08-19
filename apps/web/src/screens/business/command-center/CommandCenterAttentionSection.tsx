import type {
  CommandCenterRecord,
} from '../../../../../../contracts/api-schemas';
import {
  Button,
  InlineNotice,
  StatusBadge,
} from '../../../design-system';
import type {
  StatusBadgeTone,
} from '../../../design-system';
import {
  defaultWorkspaceContext,
} from '../businessData';
import {
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import type {
  CommandCenterData,
  CommandDecision,
  CommandSignalKind,
  OperationalPriority,
} from './commandCenterOnePageModel';
import {
  buildOperationalDecisions,
  findRecordById,
  formatSignedMetricValue,
  resolveNoActionProjection,
  resolveRecommendationCtaLabel,
  resolveRecommendationExecutionState,
  resolveRecommendationForRecord,
  resolveSignalImpactValue,
  resolveSignalKind,
} from './commandCenterOnePageModel';

const maxAttentionSignals = 4;

const signalKindLabels: Record<CommandSignalKind, string> = {
  data: 'Dane',
  opportunity: 'Szansa',
  risk: 'Ryzyko',
};

const signalKindTones: Record<CommandSignalKind, StatusBadgeTone> = {
  data: 'warning',
  opportunity: 'success',
  risk: 'critical',
};

const priorityLabels: Record<OperationalPriority, string> = {
  critical: 'Krytyczny',
  high: 'Wysoki',
  low: 'Niski',
  medium: 'Średni',
};

export function resolveAttentionCtaElementId(signalId: string): string {
  return `command-attention-cta-${signalId}`;
}

export type CommandAttentionSignal = {
  readonly decision: CommandDecision;
  readonly kind: CommandSignalKind;
  readonly record: CommandCenterRecord;
};

/** Top signals for the Attention section, capped and stripped of dismissed ones. */
export function buildAttentionSignals(
  data: CommandCenterData,
  dismissedSignalIds: ReadonlySet<string>,
): readonly CommandAttentionSignal[] {
  return buildOperationalDecisions(data.records)
    .filter((decision) => !dismissedSignalIds.has(decision.id))
    .slice(0, maxAttentionSignals)
    .flatMap((decision) => {
      const record = findRecordById(data.records, decision.id);

      if (!record) {
        return [];
      }

      return [{
        decision,
        kind: resolveSignalKind(record, decision),
        record,
      }];
    });
}

export function CommandCenterAttentionSection({
  data,
  dismissedSignalIds,
  onSelectSignal,
  selectedSignalId,
  workspaceContext,
}: {
  readonly data: CommandCenterData;
  readonly dismissedSignalIds: ReadonlySet<string>;
  readonly onSelectSignal: (signalId: string) => void;
  readonly selectedSignalId: string | null;
  readonly workspaceContext: typeof defaultWorkspaceContext;
}) {
  const signals = buildAttentionSignals(data, dismissedSignalIds);

  return (
    <section
      aria-labelledby="command-center-attention-title"
      className="pd-command-center-one-page__section pd-command-center-one-page__attention"
    >
      <CommandSectionHeader
        description="Priorytety są ułożone według wpływu biznesowego i gotowości danych. Otwórz pozycję, żeby przejść od sygnału do dowodów i decyzji."
        eyebrow="Priorytety"
        title="Co wymaga decyzji teraz"
        titleId="command-center-attention-title"
      />

      {signals.length > 0 ? (
        <div
          aria-label="Sygnały wymagające uwagi"
          className="pd-command-center-one-page__attention-list"
          role="list"
        >
          {signals.map((signal, index) => (
            <CommandAttentionCard
              data={data}
              isSelected={signal.decision.id === selectedSignalId}
              key={signal.decision.id}
              onSelect={onSelectSignal}
              rank={index + 1}
              signal={signal}
              workspaceContext={workspaceContext}
            />
          ))}
        </div>
      ) : (
        <InlineNotice
          message="Wszystkie metryki mieszczą się w oczekiwanym zakresie."
          title="Brak sygnałów wymagających uwagi"
          tone="success"
        />
      )}
    </section>
  );
}

function CommandAttentionCard({
  data,
  isSelected,
  onSelect,
  rank,
  signal,
  workspaceContext,
}: {
  readonly data: CommandCenterData;
  readonly isSelected: boolean;
  readonly onSelect: (signalId: string) => void;
  readonly rank: number;
  readonly signal: CommandAttentionSignal;
  readonly workspaceContext: typeof defaultWorkspaceContext;
}) {
  const {
    decision,
    kind,
    record,
  } = signal;
  const impactValue = resolveSignalImpactValue(record);
  const projection = resolveNoActionProjection(record, workspaceContext.range);
  const recommendation = resolveRecommendationForRecord(data.recommendations, record);
  const ctaLabel = recommendation
    ? resolveRecommendationCtaLabel(resolveRecommendationExecutionState())
    : 'Przejdź do decyzji';

  return (
    <article
      className="pd-command-center-one-page__attention-card"
      data-kind={kind}
      data-selected={isSelected || undefined}
      role="listitem"
    >
      <span
        aria-hidden="true"
        className="pd-command-center-one-page__attention-rank"
      >
        {String(rank).padStart(2, '0')}
      </span>

      <div className="pd-command-center-one-page__attention-card-body">
        <header>
          <div className="pd-command-center-one-page__attention-card-tags">
            <StatusBadge
              status="Typ sygnału"
              text={signalKindLabels[kind]}
              tone={signalKindTones[kind]}
            />
            <span>{priorityLabels[decision.priority]}</span>
          </div>
          <div className="pd-command-center-one-page__attention-card-heading">
            <h3>{decision.metricLabel}</h3>
          </div>
        </header>

        <p className="pd-command-center-one-page__attention-card-diagnosis">
          {decision.diagnosis}
        </p>

        <dl className="pd-command-center-one-page__attention-card-meta">
          {impactValue !== null ? (
            <div>
              <dt>Wpływ</dt>
              <dd>{formatSignedMetricValue(impactValue, record.unit)}</dd>
            </div>
          ) : null}

          {projection ? (
            <div>
              <dt>Bez działania</dt>
              <dd>{formatSignedMetricValue(projection.deltaValue, record.unit)} do końca okresu</dd>
            </div>
          ) : null}

          <div>
            <dt>Właściciel</dt>
            <dd>{decision.owner}</dd>
          </div>

          <div>
            <dt>Termin</dt>
            <dd>{decision.timebox}</dd>
          </div>
        </dl>
      </div>

      <Button
        id={resolveAttentionCtaElementId(decision.id)}
        onClick={() => onSelect(decision.id)}
        size="small"
        variant={isSelected ? 'primary' : 'secondary'}
      >
        {ctaLabel}
      </Button>
    </article>
  );
}
