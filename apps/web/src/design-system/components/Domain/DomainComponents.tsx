import type {
  FormEvent,
  HTMLAttributes,
  ReactNode,
} from 'react';
import {
  forwardRef,
  useId,
  useState,
} from 'react';

import type {
  AttributionComparisonProps as ContractAttributionComparisonProps,
  BudgetPacingProps as ContractBudgetPacingProps,
  CohortMatrixProps as ContractCohortMatrixProps,
  CustomerSegmentsProps as ContractCustomerSegmentsProps,
  DataStatusBannerProps as ContractDataStatusBannerProps,
  DecisionQueueProps as ContractDecisionQueueProps,
  EvidencePanelProps as ContractEvidencePanelProps,
  FunnelStepProps as ContractFunnelStepProps,
  LineageGraphProps as ContractLineageGraphProps,
  MorningBriefProps as ContractMorningBriefProps,
  PairingFlowProps as ContractPairingFlowProps,
  PlanPerformanceProps as ContractPlanPerformanceProps,
  ReconciliationPanelProps as ContractReconciliationPanelProps,
  RecommendationCardProps as ContractRecommendationCardProps,
  ResultDriversProps as ContractResultDriversProps,
  SalesFunnelProps as ContractSalesFunnelProps,
  SalesSourcesProps as ContractSalesSourcesProps,
  SyncTimelineProps as ContractSyncTimelineProps,
} from '../../../../../../contracts/domain-component-contracts';
import type {
  DecisionCardProps as ContractDecisionCardProps,
} from '../../../../../../contracts/components/decisioncard';
import type {
  DetailPanelProps as ContractDetailPanelProps,
} from '../../../../../../contracts/components/detailpanel';
import type {
  FunnelChartProps as ContractFunnelChartProps,
} from '../../../../../../contracts/components/funnelchart';
import type {
  PageHeaderProps as ContractPageHeaderProps,
} from '../../../../../../contracts/components/pageheader';
import type {
  PanelProps as ContractPanelProps,
} from '../../../../../../contracts/components/panel';
import type {
  WaterfallChartProps as ContractWaterfallChartProps,
} from '../../../../../../contracts/components/waterfallchart';
import type {
  PapaDataIconName,
} from '../../icons';
import {
  Button,
  TextAction,
} from '../Button';
import {
  InlineNotice,
} from '../InlineNotice';
import {
  ProgressIndicator,
} from '../ProgressIndicator';
import {
  StatusBadge,
} from '../StatusBadge';
import type {
  StatusBadgeTone,
} from '../Feedback/feedbackTone';
import {
  Textarea,
} from '../Field';
import {
  joinClassNames,
} from '../Field/fieldUtils';
import './domain-components.css';

type BaseComponentContractKeys =
  | 'actions'
  | 'ariaLabel'
  | 'ariaLive'
  | 'context'
  | 'description'
  | 'disabled'
  | 'disabledReason'
  | 'evidence'
  | 'id'
  | 'label'
  | 'state'
  | 'testId'
  | 'variant';

type PageHeaderContractRuntimeKeys =
  | BaseComponentContractKeys
  | 'primaryActionId'
  | 'secondaryActionIds';

export type PageHeaderProps = Omit<
  ContractPageHeaderProps,
  PageHeaderContractRuntimeKeys
> & HTMLAttributes<HTMLElement> & {
  readonly description?: string | null;
  readonly actions?: ReactNode;
  readonly meta?: readonly {
    readonly label: string;
    readonly value: ReactNode;
  }[];
};

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  function PageHeader(
    {
      actions = null,
      breadcrumbs,
      className,
      description = null,
      meta = [],
      subtitle,
      title,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const descriptionId = useId();
    const describedBy = description || subtitle
      ? descriptionId
      : undefined;

    return (
      <header
        {...props}
        ref={ref}
        aria-describedby={describedBy}
        aria-labelledby={titleId}
        className={joinClassNames('pd-page-header', className)}
      >
        <div className="pd-page-header__main">
          {breadcrumbs.length > 0 ? (
            <nav
              aria-label="Ścieżka ekranu"
              className="pd-page-header__breadcrumbs"
            >
              <ol>
                {breadcrumbs.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <a href={item.href}>{item.label}</a>
                    ) : (
                      <span aria-current="page">{item.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <div className="pd-page-header__heading">
            <h1 id={titleId}>{title}</h1>
            {subtitle || description ? (
              <p id={descriptionId}>
                {subtitle ?? description}
              </p>
            ) : null}
          </div>
        </div>

        {meta.length > 0 ? (
          <dl
            aria-label="Metadane ekranu"
            className="pd-page-header__meta"
          >
            {meta.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {actions ? (
          <div className="pd-page-header__actions">
            {actions}
          </div>
        ) : null}
      </header>
    );
  },
);

export type PanelProps = Omit<
  ContractPanelProps,
  BaseComponentContractKeys
> & HTMLAttributes<HTMLElement> & {
  readonly description?: string | null;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly eyebrow?: string | null;
  readonly tone?: 'default' | 'data' | 'warning' | 'critical';
};

export const Panel = forwardRef<HTMLElement, PanelProps>(
  function Panel(
    {
      actions = null,
      bordered,
      children,
      className,
      collapsed,
      collapsible,
      description = null,
      eyebrow = null,
      padding,
      title,
      tone = 'default',
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const descriptionId = useId();
    const hasHeader = Boolean(title || eyebrow || description || actions);

    return (
      <section
        {...props}
        ref={ref}
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={title ? titleId : undefined}
        className={joinClassNames('pd-panel', className)}
        data-bordered={bordered ? true : undefined}
        data-collapsed={collapsed ? true : undefined}
        data-collapsible={collapsible ? true : undefined}
        data-padding={padding}
        data-tone={tone}
      >
        {hasHeader ? (
          <header className="pd-panel__header">
            <div>
              {eyebrow ? (
                <p className="pd-panel__eyebrow">{eyebrow}</p>
              ) : null}
              {title ? (
                <h2 id={titleId}>{title}</h2>
              ) : null}
              {description ? (
                <p id={descriptionId}>{description}</p>
              ) : null}
            </div>
            {actions ? (
              <div className="pd-panel__actions">{actions}</div>
            ) : null}
          </header>
        ) : null}
        {!collapsed ? (
          <div className="pd-panel__body">{children}</div>
        ) : null}
      </section>
    );
  },
);

export type DetailPanelProps = Omit<
  ContractDetailPanelProps,
  BaseComponentContractKeys
> & HTMLAttributes<HTMLElement> & {
  readonly action?: ReactNode;
};

export const DetailPanel = forwardRef<HTMLElement, DetailPanelProps>(
  function DetailPanel(
    {
      action = null,
      className,
      open,
      recordId,
      sections,
      title,
      width,
      ...props
    },
    ref,
  ) {
    const titleId = useId();

    if (!open) {
      return null;
    }

    return (
      <aside
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-detail-panel', className)}
        data-record-id={recordId}
        data-width={width}
      >
        <header className="pd-detail-panel__header">
          <div>
            <p>Rekord</p>
            <h2 id={titleId}>{title}</h2>
          </div>
          {action}
        </header>

        <div className="pd-detail-panel__sections">
          {sections.map((section) => (
            <section key={section.id}>
              <h3>{section.title}</h3>
              <dl>
                {section.fields.map((field) => (
                  <div key={field.label}>
                    <dt>{field.label}</dt>
                    <dd>{field.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </aside>
    );
  },
);

export type DataStatusBannerProps =
  ContractDataStatusBannerProps & HTMLAttributes<HTMLElement>;

export const DataStatusBanner = forwardRef<
  HTMLElement,
  DataStatusBannerProps
>(function DataStatusBanner(
  {
    blockingIssues,
    className,
    context,
    onOpenIssue,
    readiness,
    sources,
    ...props
  },
  ref,
) {
  const titleId = useId();
  const issueCount = blockingIssues.length;
  const tone = resolveReadinessTone(readiness);

  return (
    <section
      {...props}
      ref={ref}
      aria-labelledby={titleId}
      className={joinClassNames('pd-data-status-banner', className)}
      data-readiness={readiness}
    >
      <div className="pd-data-status-banner__main">
        <StatusBadge
          status="Stan danych"
          text={resolveReadinessLabel(readiness)}
          tone={tone}
        />
        <div>
          <h2 id={titleId}>Status danych</h2>
          <p>
            Obszar roboczy {formatWorkspaceLabel(context.workspaceId)};
            źródła: {sources.length}; aktywne ograniczenia: {issueCount}.
          </p>
        </div>
      </div>

      <dl className="pd-data-status-banner__sources">
        {sources.map((source) => (
          <div key={`${source.provider}-${source.dataset}`}>
            <dt>{source.provider}</dt>
            <dd>
              {source.dataset} · kompletność {formatPercent(source.completeness)}
              {' · '}
              {formatDateTime(source.lastSyncAt)}
            </dd>
          </div>
        ))}
      </dl>

      {issueCount > 0 ? (
        <ul className="pd-data-status-banner__issues">
          {blockingIssues.map((issue) => (
            <li key={issue.id}>
              <StatusBadge
                status="Problem danych"
                text={issue.label}
                tone={resolveIssueTone(issue.severity)}
              />
              {onOpenIssue ? (
                <TextAction
                  size="small"
                  onClick={() => {
                    onOpenIssue({
                      action: 'open-issue',
                      componentId: 'DataStatusBanner',
                      issueId: issue.id,
                      screenId: props.id,
                    });
                  }}
                >
                  Szczegóły
                </TextAction>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
});

export type EvidencePanelProps =
  ContractEvidencePanelProps & HTMLAttributes<HTMLElement>;

export const EvidencePanel = forwardRef<HTMLElement, EvidencePanelProps>(
  function EvidencePanel(
    {
      className,
      confidence,
      evidence,
      onOpenEvidence,
      sources,
      ...props
    },
    ref,
  ) {
    const titleId = useId();

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-evidence-panel', className)}
      >
        <header className="pd-evidence-panel__header">
          <div>
            <p>Dowody</p>
            <h2 id={titleId}>Źródła i pewność</h2>
          </div>
          <StatusBadge
            status="Pewność"
            text={formatPercent(confidence)}
            tone={confidence >= 0.8 ? 'success' : 'warning'}
          />
        </header>

        <ul className="pd-evidence-panel__list">
          {evidence.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.label}</strong>
                <span>{item.source}</span>
              </div>
              {onOpenEvidence ? (
                <TextAction
                  size="small"
                  onClick={() => {
                    onOpenEvidence({
                      action: 'open-evidence',
                      componentId: 'EvidencePanel',
                      evidenceId: item.id,
                    });
                  }}
                >
                  Otwórz
                </TextAction>
              ) : null}
            </li>
          ))}
        </ul>

        <dl className="pd-evidence-panel__sources">
          {sources.map((source) => (
            <div key={`${source.provider}-${source.dataset}`}>
              <dt>{source.dataset}</dt>
              <dd>{source.provider} · {formatDateTime(source.lastSyncAt)}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  },
);

export type RecommendationCardProps =
  ContractRecommendationCardProps & HTMLAttributes<HTMLElement>;

export const RecommendationCard = forwardRef<
  HTMLElement,
  RecommendationCardProps
>(function RecommendationCard(
  {
    className,
    effort,
    evidence,
    impact,
    onApprove,
    onReject,
    recommendationId,
    risk,
    title,
    ...props
  },
  ref,
) {
  const titleId = useId();

  return (
    <article
      {...props}
      ref={ref}
      aria-labelledby={titleId}
      className={joinClassNames('pd-recommendation-card', className)}
      data-risk={risk}
    >
      <header className="pd-recommendation-card__header">
        <div>
          <p>Rekomendacja</p>
          <h3 id={titleId}>{title}</h3>
        </div>
        <StatusBadge
          status="Wpływ"
          text={resolveImpactLabel(impact)}
          tone={resolveImpactTone(impact)}
        />
      </header>

      <dl className="pd-recommendation-card__meta">
        <div>
          <dt>Nakład</dt>
          <dd>{resolveImpactLabel(effort)}</dd>
        </div>
        <div>
          <dt>Ryzyko</dt>
          <dd>{resolveImpactLabel(risk)}</dd>
        </div>
        <div>
          <dt>Dowody</dt>
          <dd>{evidence.length}</dd>
        </div>
      </dl>

      <div className="pd-recommendation-card__actions">
        {onApprove ? (
          <Button
            size="small"
            onClick={() => {
              onApprove({
                action: 'approve',
                componentId: 'RecommendationCard',
                recommendationId,
              });
            }}
          >
            Zatwierdź
          </Button>
        ) : null}
        {onReject ? (
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              onReject({
                action: 'reject',
                componentId: 'RecommendationCard',
                recommendationId,
              });
            }}
          >
            Odrzuć
          </Button>
        ) : null}
      </div>
    </article>
  );
});

export type DecisionCardProps = Omit<
  ContractDecisionCardProps,
  BaseComponentContractKeys
> & HTMLAttributes<HTMLElement> & {
  readonly action?: ReactNode;
  readonly priority?: 'low' | 'medium' | 'high';
};

export const DecisionCard = forwardRef<HTMLElement, DecisionCardProps>(
  function DecisionCard(
    {
      action = null,
      className,
      decisionId,
      dueAt,
      impact,
      owner,
      priority = 'medium',
      status,
      title,
      ...props
    },
    ref,
  ) {
    const titleId = useId();

    return (
      <article
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-decision-card', className)}
        data-impact={impact}
        data-priority={priority}
      >
        <header className="pd-decision-card__header">
          <div>
            <p>{decisionId}</p>
            <h3 id={titleId}>{title}</h3>
          </div>
          <StatusBadge
            status="Status decyzji"
            text={resolveDecisionStatusLabel(status)}
            tone={resolveDecisionTone(status)}
          />
        </header>
        <dl className="pd-decision-card__meta">
          <div>
            <dt>Wpływ</dt>
            <dd>{resolveImpactLabel(impact)}</dd>
          </div>
          <div>
            <dt>Właściciel</dt>
            <dd>{owner ?? 'Nieprzypisane'}</dd>
          </div>
          <div>
            <dt>Termin</dt>
            <dd>{dueAt ? formatDate(dueAt) : 'Bez terminu'}</dd>
          </div>
        </dl>
        {action ? (
          <div className="pd-decision-card__action">{action}</div>
        ) : null}
      </article>
    );
  },
);

export type DecisionQueueProps =
  ContractDecisionQueueProps & HTMLAttributes<HTMLElement>;

export const DecisionQueue = forwardRef<HTMLElement, DecisionQueueProps>(
  function DecisionQueue(
    {
      className,
      decisions,
      onChangeStatus,
      onOpenDecision,
      ...props
    },
    ref,
  ) {
    const titleId = useId();

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-decision-queue', className)}
      >
        <header className="pd-decision-queue__header">
          <div>
            <p>Kolejka uwagi</p>
            <h2 id={titleId}>Decyzje wymagające reakcji</h2>
          </div>
          <StatusBadge
            status="Liczba decyzji"
            text={`${decisions.length}`}
            tone="warning"
          />
        </header>
        <div className="pd-decision-queue__list">
          {decisions.map((decision) => (
            <DecisionCard
              key={decision.id}
              decisionId={decision.id}
              dueAt={decision.dueAt ?? null}
              impact={decision.priority}
              owner={decision.owner ?? null}
              priority={decision.priority}
              status={mapQueueDecisionStatus(decision.status)}
              title={decision.title}
              action={(
                <div className="pd-decision-queue__actions">
                  <TextAction
                    size="small"
                    onClick={() => {
                      onOpenDecision({
                        action: 'open-decision',
                        componentId: 'DecisionQueue',
                        decisionId: decision.id,
                      });
                    }}
                  >
                    Otwórz
                  </TextAction>
                  {onChangeStatus ? (
                    <TextAction
                      size="small"
                      tone="muted"
                      onClick={() => {
                        onChangeStatus({
                          action: 'change-status',
                          componentId: 'DecisionQueue',
                          decisionId: decision.id,
                          status: 'review',
                        });
                      }}
                    >
                      Do review
                    </TextAction>
                  ) : null}
                </div>
              )}
            />
          ))}
        </div>
      </section>
    );
  },
);

export type MorningBriefProps =
  ContractMorningBriefProps & HTMLAttributes<HTMLElement>;

export const MorningBrief = forwardRef<HTMLElement, MorningBriefProps>(
  function MorningBrief(
    {
      className,
      dataReadiness,
      decisionsDue,
      highlights,
      onOpenHighlight,
      ...props
    },
    ref,
  ) {
    const titleId = useId();

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-morning-brief', className)}
      >
        <header className="pd-morning-brief__header">
          <div>
            <p>Brief poranny</p>
            <h2 id={titleId}>Najważniejsze sygnały</h2>
          </div>
          <StatusBadge
            status="Stan danych"
            text={resolveReadinessLabel(dataReadiness)}
            tone={resolveReadinessTone(dataReadiness)}
          />
        </header>
        <ul className="pd-morning-brief__list">
          {highlights.map((highlight) => (
            <li key={highlight.id}>
              <StatusBadge
                status="Priorytet"
                text={resolveSeverityLabel(highlight.severity)}
                tone={resolveIssueTone(highlight.severity)}
              />
              <div>
                <strong>{highlight.title}</strong>
                <span>{highlight.metric}</span>
              </div>
              {onOpenHighlight ? (
                <TextAction
                  size="small"
                  onClick={() => {
                    onOpenHighlight({
                      action: 'open-highlight',
                      componentId: 'MorningBrief',
                      highlightId: highlight.id,
                    });
                  }}
                >
                  Otwórz
                </TextAction>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="pd-morning-brief__footer">
          Decyzje do obsłużenia dzisiaj: {decisionsDue}.
        </p>
      </section>
    );
  },
);

export type AssistantComposerProps = HTMLAttributes<HTMLElement> & {
  readonly attachments: readonly {
    readonly id: string;
    readonly name: string;
    readonly size: number;
  }[];
  readonly contextItemIds: readonly string[];
  readonly label: string;
  readonly onSubmit?: ((value: string) => void) | undefined;
  readonly placeholder: string;
  readonly submitting: boolean;
  readonly value: string;
};

export const AssistantComposer = forwardRef<
  HTMLElement,
  AssistantComposerProps
>(function AssistantComposer(
  {
    attachments,
    className,
    contextItemIds,
    label,
    onSubmit,
    placeholder,
    submitting,
    value,
    ...props
  },
  ref,
) {
  const [draft, setDraft] = useState(value);
  const statusId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();

    if (!trimmed || submitting) {
      return;
    }

    onSubmit?.(trimmed);
  }

  return (
    <section
      {...props}
      ref={ref}
      className={joinClassNames('pd-assistant-composer', className)}
    >
      <form onSubmit={handleSubmit}>
        <Textarea
          helperText={`${contextItemIds.length} elementy kontekstu · ${attachments.length} załączniki`}
          label={label}
          placeholder={placeholder}
          rows={4}
          value={draft}
          onChange={(event) => {
            setDraft(event.currentTarget.value);
          }}
        />
        <div className="pd-assistant-composer__footer">
          <span id={statusId} role="status">
            {submitting ? 'Wysyłanie zapytania' : 'Gotowe do wysłania'}
          </span>
          <Button
            disabled={draft.trim().length === 0 || submitting}
            loading={submitting}
            loadingLabel="Wysyłanie"
            size="small"
            type="submit"
          >
            Zapytaj Papa
          </Button>
        </div>
      </form>
    </section>
  );
});

export type ResultDriversProps =
  ContractResultDriversProps & HTMLAttributes<HTMLElement>;

export const ResultDrivers = forwardRef<HTMLElement, ResultDriversProps>(
  function ResultDrivers(
    {
      baselineValue,
      className,
      currentValue,
      drivers,
      onInspectDriver,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const delta = currentValue - baselineValue;

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-result-drivers', className)}
      >
        <header className="pd-result-drivers__header">
          <div>
            <p>Drivery wyniku</p>
            <h2 id={titleId}>Wpływ czynników na zmianę</h2>
          </div>
          <StatusBadge
            status="Zmiana"
            text={formatSignedNumber(delta)}
            tone={delta >= 0 ? 'success' : 'warning'}
          />
        </header>

        <ul className="pd-result-drivers__list">
          {drivers.map((driver) => (
            <li key={driver.id} data-direction={driver.direction}>
              <div>
                <strong>{driver.label}</strong>
                <span>{driver.evidence.length} dowody</span>
              </div>
              <span>{formatSignedNumber(driver.contribution)}</span>
              {onInspectDriver ? (
                <TextAction
                  size="small"
                  onClick={() => {
                    onInspectDriver({
                      action: 'inspect-driver',
                      componentId: 'ResultDrivers',
                      driverId: driver.id,
                    });
                  }}
                >
                  Inspekcja
                </TextAction>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    );
  },
);

export type SalesSourcesProps =
  ContractSalesSourcesProps & HTMLAttributes<HTMLElement>;

export const SalesSources = forwardRef<HTMLElement, SalesSourcesProps>(
  function SalesSources(
    {
      className,
      compareToPrevious = false,
      onOpenSource,
      sources,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const totalRevenue = sources.reduce((sum, item) => sum + item.revenue, 0);

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-sales-sources', className)}
      >
        <header className="pd-sales-sources__header">
          <div>
            <p>Źródła sprzedaży</p>
            <h2 id={titleId}>Kanały i udział w przychodzie</h2>
          </div>
          <StatusBadge
            status="Porównanie"
            text={compareToPrevious ? 'z poprzednim okresem' : 'bieżący okres'}
            tone="info"
          />
        </header>
        <ul className="pd-sales-sources__list">
          {sources.map((source) => {
            const share = totalRevenue > 0
              ? source.revenue / totalRevenue
              : 0;

            return (
              <li key={source.id}>
                <div>
                  <strong>{source.channel}</strong>
                  <span>{source.orders} zamówień · marża {source.margin ?? 0}%</span>
                </div>
                <div className="pd-sales-sources__bar">
                  <span aria-hidden="true">
                    <span style={{ inlineSize: `${share * 100}%` }} />
                  </span>
                  <b>{formatCurrency(source.revenue)}</b>
                </div>
                <StatusBadge
                  status="Stan danych"
                  text={resolveReadinessLabel(source.readiness)}
                  tone={resolveReadinessTone(source.readiness)}
                />
                {onOpenSource ? (
                  <TextAction
                    size="small"
                    onClick={() => {
                      onOpenSource({
                        action: 'open-source',
                        componentId: 'SalesSources',
                        sourceId: source.id,
                      });
                    }}
                  >
                    Otwórz
                  </TextAction>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    );
  },
);

export type FunnelStepProps =
  ContractFunnelStepProps & HTMLAttributes<HTMLElement>;

export const FunnelStep = forwardRef<HTMLElement, FunnelStepProps>(
  function FunnelStep(
    {
      className,
      conversions,
      conversionRate,
      label,
      onInspect,
      stepId,
      visitors,
      ...props
    },
    ref,
  ) {
    return (
      <article
        {...props}
        ref={ref}
        className={joinClassNames('pd-funnel-step', className)}
      >
        <div>
          <p>{stepId}</p>
          <h3>{label}</h3>
        </div>
        <dl>
          <div>
            <dt>Wejścia</dt>
            <dd>{formatInteger(visitors)}</dd>
          </div>
          <div>
            <dt>Konwersje</dt>
            <dd>{formatInteger(conversions)}</dd>
          </div>
          <div>
            <dt>CR</dt>
            <dd>{formatPercent(conversionRate)}</dd>
          </div>
        </dl>
        {onInspect ? (
          <TextAction
            size="small"
            onClick={() => {
              onInspect({
                action: 'inspect-step',
                componentId: 'FunnelStep',
                stepId,
              });
            }}
          >
            Analizuj
          </TextAction>
        ) : null}
      </article>
    );
  },
);

export type FunnelChartProps = Omit<
  ContractFunnelChartProps,
  BaseComponentContractKeys
> & HTMLAttributes<HTMLElement>;

export const FunnelChart = forwardRef<HTMLElement, FunnelChartProps>(
  function FunnelChart(
    {
      className,
      orientation,
      showDropoff,
      steps,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const maxValue = Math.max(...steps.map((step) => step.value), 1);

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-funnel-chart', className)}
        data-orientation={orientation}
      >
        <h2 id={titleId}>Lejek sprzedaży</h2>
        <ol className="pd-funnel-chart__steps">
          {steps.map((step, index) => {
            const width = Math.max((step.value / maxValue) * 100, 6);
            const previous = steps[index - 1];
            const dropoff = previous
              ? 1 - (step.value / Math.max(previous.value, 1))
              : 0;

            return (
              <li key={step.id}>
                <div>
                  <span>{step.label}</span>
                  <strong>{formatInteger(step.value)}</strong>
                </div>
                <span
                  aria-hidden="true"
                  className="pd-funnel-chart__bar"
                >
                  <span style={{ inlineSize: `${width}%` }} />
                </span>
                <span>
                  CR {step.conversionRate === null ? '—' : formatPercent(step.conversionRate)}
                  {showDropoff && index > 0 ? ` · odpływ ${formatPercent(dropoff)}` : ''}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    );
  },
);

export type WaterfallChartProps = Omit<
  ContractWaterfallChartProps,
  BaseComponentContractKeys
> & HTMLAttributes<HTMLElement>;

export const WaterfallChart = forwardRef<HTMLElement, WaterfallChartProps>(
  function WaterfallChart(
    {
      className,
      items,
      showCumulative,
      unit,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const maxValue = Math.max(...items.map((item) => Math.abs(item.value)), 1);

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-waterfall-chart', className)}
      >
        <h2 id={titleId}>Waterfall</h2>
        <ol className="pd-waterfall-chart__items">
          {items.map((item) => (
            <li key={item.id} data-kind={item.kind}>
              <div>
                <span>{item.label}</span>
                <strong>{formatUnitValue(item.value, unit)}</strong>
              </div>
              <span
                aria-hidden="true"
                className="pd-waterfall-chart__bar"
              >
                <span
                  style={{
                    inlineSize: `${Math.max((Math.abs(item.value) / maxValue) * 100, 8)}%`,
                  }}
                />
              </span>
              {showCumulative ? (
                <span>Kumulacja widoczna w tabeli alternatywnej</span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    );
  },
);

export type BudgetPacingProps =
  ContractBudgetPacingProps & HTMLAttributes<HTMLElement>;

export const BudgetPacing = forwardRef<HTMLElement, BudgetPacingProps>(
  function BudgetPacing(
    {
      actualSpend,
      campaignId,
      className,
      evidence,
      forecastSpend,
      onCreateDecision,
      plannedSpend,
      recommendation = null,
      status,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const spendRatio = plannedSpend > 0
      ? actualSpend / plannedSpend
      : 0;
    const forecastRatio = plannedSpend > 0
      ? forecastSpend / plannedSpend
      : 0;

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-budget-pacing', className)}
        data-status={status}
      >
        <header className="pd-budget-pacing__header">
          <div>
            <p>{campaignId}</p>
            <h2 id={titleId}>Pacing budżetu</h2>
          </div>
          <StatusBadge
            status="Pacing"
            text={resolveBudgetPacingLabel(status)}
            tone={resolveBudgetPacingTone(status)}
          />
        </header>
        <ProgressIndicator
          description={`Wydano ${formatCurrency(actualSpend)} z planu ${formatCurrency(plannedSpend)}.`}
          indeterminate={false}
          label="Wydanie budżetu"
          max={100}
          showValue
          tone={resolveBudgetPacingProgressTone(status)}
          value={Math.round(spendRatio * 100)}
        />
        <ProgressIndicator
          description={`Prognoza końca okresu: ${formatCurrency(forecastSpend)}.`}
          indeterminate={false}
          label="Prognoza względem planu"
          max={100}
          showValue
          tone={forecastRatio > 1 ? 'warning' : 'success'}
          value={Math.round(forecastRatio * 100)}
        />
        {recommendation ? (
          <InlineNotice
            message={recommendation}
            title="Rekomendacja budżetowa"
            tone="info"
          />
        ) : null}
        <div className="pd-budget-pacing__footer">
          <span>{evidence.length} dowody źródłowe</span>
          {onCreateDecision ? (
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                onCreateDecision({
                  action: 'create-decision',
                  campaignId,
                  componentId: 'BudgetPacing',
                });
              }}
            >
              Utwórz decyzję
            </Button>
          ) : null}
        </div>
      </section>
    );
  },
);

export type AttributionComparisonProps =
  ContractAttributionComparisonProps & HTMLAttributes<HTMLFieldSetElement>;

export const AttributionComparison = forwardRef<
  HTMLFieldSetElement,
  AttributionComparisonProps
>(function AttributionComparison(
  {
    className,
    models,
    onSelectModel,
    selectedModelId,
    ...props
  },
  ref,
) {
  const legendId = useId();

  return (
    <fieldset
      {...props}
      ref={ref}
      className={joinClassNames('pd-attribution-comparison', className)}
    >
      <legend id={legendId}>Model atrybucji</legend>
      <div
        aria-labelledby={legendId}
        className="pd-attribution-comparison__models"
        role="radiogroup"
      >
        {models.map((model) => (
          <label key={model.id}>
            <input
              checked={model.id === selectedModelId}
              name={legendId}
              type="radio"
              value={model.id}
              onChange={() => {
                onSelectModel?.({
                  action: 'select-model',
                  componentId: 'AttributionComparison',
                  modelId: model.id,
                });
              }}
            />
            <span>
              <strong>{model.label}</strong>
              <span>{formatCurrency(model.revenue)} · ROAS {formatNumber(model.roas)}</span>
              <span>Pewność {formatPercent(model.confidence)}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
});

export type PlanPerformanceProps =
  ContractPlanPerformanceProps & HTMLAttributes<HTMLElement>;

export const PlanPerformance = forwardRef<HTMLElement, PlanPerformanceProps>(
  function PlanPerformance(
    {
      actualSeries: _actualSeries,
      className,
      gapToTarget,
      pace,
      planSeries: _planSeries,
      ...props
    },
    ref,
  ) {
    const titleId = useId();

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-plan-performance', className)}
        data-pace={pace}
      >
        <header className="pd-plan-performance__header">
          <div>
            <p>Plan vs wynik</p>
            <h2 id={titleId}>Realizacja celu</h2>
          </div>
          <StatusBadge
            status="Tempo"
            text={resolvePaceLabel(pace)}
            tone={resolvePaceTone(pace)}
          />
        </header>
        <dl className="pd-plan-performance__meta">
          <div>
            <dt>Luka do celu</dt>
            <dd>{formatSignedNumber(gapToTarget)}</dd>
          </div>
          <div>
            <dt>Stan</dt>
            <dd>{resolvePaceLabel(pace)}</dd>
          </div>
        </dl>
      </section>
    );
  },
);

export type ReconciliationPanelProps =
  ContractReconciliationPanelProps & HTMLAttributes<HTMLElement>;

export const ReconciliationPanel = forwardRef<
  HTMLElement,
  ReconciliationPanelProps
>(function ReconciliationPanel(
  {
    className,
    conflicts,
    onResolveConflict,
    ...props
  },
  ref,
) {
  const titleId = useId();

  return (
    <section
      {...props}
      ref={ref}
      aria-labelledby={titleId}
      className={joinClassNames('pd-reconciliation-panel', className)}
    >
      <header className="pd-reconciliation-panel__header">
        <div>
          <p>Rekoncyliacja</p>
          <h2 id={titleId}>Konflikty źródeł</h2>
        </div>
        <StatusBadge
          status="Konflikty"
          text={`${conflicts.length}`}
          tone={conflicts.length > 0 ? 'warning' : 'success'}
        />
      </header>
      <ul className="pd-reconciliation-panel__list">
        {conflicts.map((conflict) => (
          <li key={conflict.id}>
            <div>
              <strong>{conflict.entityType}</strong>
              <span>{conflict.sourceA} ↔ {conflict.sourceB}</span>
              {conflict.proposedResolution ? (
                <span>{conflict.proposedResolution}</span>
              ) : null}
            </div>
            {onResolveConflict ? (
              <TextAction
                size="small"
                onClick={() => {
                  onResolveConflict({
                    action: 'resolve-conflict',
                    componentId: 'ReconciliationPanel',
                    conflictId: conflict.id,
                    resolution: conflict.proposedResolution ?? 'manual-review',
                  });
                }}
              >
                Rozwiąż
              </TextAction>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
});

export type SyncTimelineProps =
  ContractSyncTimelineProps & HTMLAttributes<HTMLElement>;

export const SyncTimeline = forwardRef<HTMLElement, SyncTimelineProps>(
  function SyncTimeline(
    {
      className,
      onOpenRun,
      runs,
      ...props
    },
    ref,
  ) {
    const titleId = useId();

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-sync-timeline', className)}
      >
        <header className="pd-sync-timeline__header">
          <div>
            <p>Synchronizacja</p>
            <h2 id={titleId}>Ostatnie przebiegi</h2>
          </div>
          <StatusBadge
            status="Przebiegi"
            text={`${runs.length}`}
            tone="info"
          />
        </header>
        <ol className="pd-sync-timeline__list">
          {runs.map((run) => (
            <li key={run.id} data-status={run.status}>
              <div>
                <strong>{run.provider}</strong>
                <span>
                  {resolveSyncStatusLabel(run.status)} · {formatDateTime(run.startedAt)}
                </span>
                {typeof run.recordsProcessed === 'number' ? (
                  <span>{formatInteger(run.recordsProcessed)} rekordów</span>
                ) : null}
              </div>
              <StatusBadge
                status="Sync"
                text={resolveSyncStatusLabel(run.status)}
                tone={resolveSyncStatusTone(run.status)}
              />
              {onOpenRun ? (
                <TextAction
                  size="small"
                  onClick={() => {
                    onOpenRun({
                      action: 'open-run',
                      componentId: 'SyncTimeline',
                      runId: run.id,
                    });
                  }}
                >
                  Log
                </TextAction>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    );
  },
);

export type LineageGraphProps =
  ContractLineageGraphProps & HTMLAttributes<HTMLElement>;

export const LineageGraph = forwardRef<HTMLElement, LineageGraphProps>(
  function LineageGraph(
    {
      className,
      edges,
      nodes,
      onOpenNode,
      rootRecordId,
      ...props
    },
    ref,
  ) {
    const titleId = useId();

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-lineage-graph', className)}
      >
        <header className="pd-lineage-graph__header">
          <div>
            <p>{rootRecordId}</p>
            <h2 id={titleId}>Pochodzenie danych</h2>
          </div>
          <StatusBadge
            status="Węzły"
            text={`${nodes.length}`}
            tone="info"
          />
        </header>
        <ol className="pd-lineage-graph__nodes">
          {nodes.map((node) => (
            <li key={node.id}>
              <div>
                <strong>{node.label}</strong>
                <span>{node.type}</span>
              </div>
              <StatusBadge
                status="Stan danych"
                text={resolveReadinessLabel(node.status)}
                tone={resolveReadinessTone(node.status)}
              />
              {onOpenNode ? (
                <TextAction
                  size="small"
                  onClick={() => {
                    onOpenNode({
                      action: 'open-node',
                      componentId: 'LineageGraph',
                      nodeId: node.id,
                    });
                  }}
                >
                  Otwórz
                </TextAction>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="pd-lineage-graph__edges" role="status">
          Relacje pochodzenia: {edges.length}
        </p>
      </section>
    );
  },
);

export type CohortMatrixProps =
  ContractCohortMatrixProps & HTMLAttributes<HTMLElement>;

export const CohortMatrix = forwardRef<HTMLElement, CohortMatrixProps>(
  function CohortMatrix(
    {
      className,
      cohortMetric,
      columns,
      onSelectCohort,
      rows,
      selectedCohortId = null,
      ...props
    },
    ref,
  ) {
    const titleId = useId();

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-cohort-matrix', className)}
      >
        <header className="pd-cohort-matrix__header">
          <div>
            <p>{cohortMetric}</p>
            <h2 id={titleId}>Macierz kohort</h2>
          </div>
        </header>
        <div className="pd-cohort-matrix__scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Kohorta</th>
                {columns.map((column) => (
                  <th key={column} scope="col">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.cohortId} data-selected={row.cohortId === selectedCohortId ? true : undefined}>
                  <th scope="row">
                    {onSelectCohort ? (
                      <TextAction
                        size="small"
                        onClick={() => {
                          onSelectCohort({
                            action: 'select-cohort',
                            cohortId: row.cohortId,
                            componentId: 'CohortMatrix',
                          });
                        }}
                      >
                        {row.label}
                      </TextAction>
                    ) : row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td key={`${row.cohortId}-${columns[index]}`}>
                      {value === null ? 'Brak danych' : formatPercent(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  },
);

export type CustomerSegmentsProps =
  ContractCustomerSegmentsProps & HTMLAttributes<HTMLElement>;

export const CustomerSegments = forwardRef<HTMLElement, CustomerSegmentsProps>(
  function CustomerSegments(
    {
      className,
      onSelectSegment,
      segments,
      selectedSegmentId = null,
      ...props
    },
    ref,
  ) {
    const titleId = useId();

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-customer-segments', className)}
      >
        <header className="pd-customer-segments__header">
          <div>
            <p>Segmenty</p>
            <h2 id={titleId}>Klienci i wartość</h2>
          </div>
          <StatusBadge status="Segmenty" text={`${segments.length}`} tone="info" />
        </header>
        <ul className="pd-customer-segments__list">
          {segments.map((segment) => (
            <li key={segment.id} data-selected={segment.id === selectedSegmentId ? true : undefined}>
              <div>
                <strong>{segment.label}</strong>
                <span>{formatInteger(segment.customers)} klientów</span>
              </div>
              <span>{formatCurrency(segment.revenue)}</span>
              {typeof segment.churnRisk === 'number' ? (
                <StatusBadge
                  status="Churn"
                  text={formatPercent(segment.churnRisk)}
                  tone={segment.churnRisk > 0.18 ? 'warning' : 'success'}
                />
              ) : null}
              {onSelectSegment ? (
                <TextAction
                  size="small"
                  onClick={() => {
                    onSelectSegment({
                      action: 'select-segment',
                      componentId: 'CustomerSegments',
                      segmentId: segment.id,
                    });
                  }}
                >
                  Wybierz
                </TextAction>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    );
  },
);

export type SalesFunnelProps =
  ContractSalesFunnelProps & HTMLAttributes<HTMLElement>;

export const SalesFunnel = forwardRef<HTMLElement, SalesFunnelProps>(
  function SalesFunnel(
    {
      className,
      onOpenStep,
      steps,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const maxVisitors = Math.max(...steps.map((step) => step.visitors), 1);

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-sales-funnel', className)}
      >
        <header className="pd-sales-funnel__header">
          <div>
            <p>Lejek</p>
            <h2 id={titleId}>Sprzedaż krok po kroku</h2>
          </div>
        </header>
        <ol className="pd-sales-funnel__steps">
          {steps.map((step) => (
            <li key={step.id}>
              <div>
                <strong>{step.label}</strong>
                <span>{formatInteger(step.visitors)} wejść · CR {formatPercent(step.conversionRate)}</span>
              </div>
              <span className="pd-sales-funnel__bar" aria-hidden="true">
                <span style={{ inlineSize: `${Math.max((step.visitors / maxVisitors) * 100, 8)}%` }} />
              </span>
              <StatusBadge
                status="Dropoff"
                text={formatPercent(step.dropoffRate)}
                tone={step.dropoffRate > 0.35 ? 'warning' : 'info'}
              />
              {onOpenStep ? (
                <TextAction
                  size="small"
                  onClick={() => {
                    onOpenStep({
                      action: 'open-step',
                      componentId: 'SalesFunnel',
                      stepId: step.id,
                    });
                  }}
                >
                  Otwórz
                </TextAction>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    );
  },
);

export type PairingFlowProps =
  ContractPairingFlowProps & HTMLAttributes<HTMLElement>;

export const PairingFlow = forwardRef<HTMLElement, PairingFlowProps>(
  function PairingFlow(
    {
      className,
      deviceStatus = undefined,
      onCancel,
      onConfirm,
      onStart,
      provider,
      sessionId = undefined,
      steps,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const activeChallenge = steps.find((step) => step.challengeCode);

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-pairing-flow', className)}
      >
        <header className="pd-pairing-flow__header">
          <div>
            <p>{provider}</p>
            <h2 id={titleId}>Parowanie integracji</h2>
          </div>
          {deviceStatus ? (
            <StatusBadge
              status="Urządzenie"
              text={resolveDevicePairingLabel(deviceStatus)}
              tone={deviceStatus === 'paired' ? 'success' : 'warning'}
            />
          ) : null}
        </header>
        <ol className="pd-pairing-flow__steps">
          {steps.map((step) => (
            <li key={step.id}>
              <div>
                <strong>{step.label}</strong>
                {step.challengeCode ? (
                  <span>Kod: {step.challengeCode}</span>
                ) : null}
              </div>
              <StatusBadge
                status="Krok"
                text={resolvePairingStepLabel(step.status)}
                tone={resolvePairingStepTone(step.status)}
              />
            </li>
          ))}
        </ol>
        <div className="pd-pairing-flow__actions">
          <Button
            size="small"
            onClick={() => {
              onStart({
                action: 'start-pairing',
                componentId: 'PairingFlow',
                provider,
              });
            }}
          >
            Rozpocznij
          </Button>
          <Button
            disabled={!activeChallenge}
            size="small"
            variant="secondary"
            onClick={() => {
              if (!activeChallenge?.challengeCode) {
                return;
              }

              onConfirm({
                action: 'confirm-pairing',
                challengeCode: activeChallenge.challengeCode,
                componentId: 'PairingFlow',
                itemId: sessionId,
              });
            }}
          >
            Potwierdź kod
          </Button>
          {onCancel ? (
            <Button
              size="small"
              variant="ghost"
              onClick={() => {
                onCancel({
                  action: 'cancel-pairing',
                  componentId: 'PairingFlow',
                  itemId: sessionId,
                });
              }}
            >
              Anuluj
            </Button>
          ) : null}
        </div>
      </section>
    );
  },
);

function formatWorkspaceLabel(value: string): string {
  return value
    .replace(/^workspace[_-]?/u, '')
    .replace(/[_-]+/gu, ' ');
}

function resolveReadinessLabel(value: string): string {
  switch (value) {
    case 'ready':
      return 'Gotowe';
    case 'partial':
      return 'Częściowe';
    case 'stale':
      return 'Nieświeże';
    case 'processing':
      return 'Przetwarzanie';
    case 'noData':
      return 'Brak danych';
    case 'sourceError':
      return 'Błąd źródła';
    case 'blocked':
      return 'Zablokowane';
    case 'unavailable':
      return 'Niedostępne';
    default:
      return value;
  }
}

function resolveReadinessTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'ready':
      return 'success';
    case 'partial':
    case 'stale':
    case 'processing':
      return 'warning';
    case 'sourceError':
    case 'blocked':
    case 'unavailable':
      return 'critical';
    case 'noData':
    default:
      return 'neutral';
  }
}

function resolveIssueTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'critical':
    case 'error':
      return 'critical';
    case 'warning':
      return 'warning';
    case 'info':
    default:
      return 'info';
  }
}

function resolveSeverityLabel(value: string): string {
  switch (value) {
    case 'critical':
      return 'Krytyczne';
    case 'warning':
      return 'Ostrzeżenie';
    case 'info':
    default:
      return 'Informacja';
  }
}

function resolveImpactLabel(value: string): string {
  switch (value) {
    case 'high':
      return 'Wysoki';
    case 'medium':
      return 'Średni';
    case 'low':
      return 'Niski';
    default:
      return value;
  }
}

function resolveImpactTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'high':
      return 'success';
    case 'medium':
      return 'warning';
    case 'low':
    default:
      return 'info';
  }
}

function resolveDecisionStatusLabel(value: string): string {
  switch (value) {
    case 'proposed':
      return 'Propozycja';
    case 'approved':
      return 'Zatwierdzona';
    case 'rejected':
      return 'Odrzucona';
    case 'executing':
      return 'W realizacji';
    case 'measured':
      return 'Zmierzona';
    default:
      return value;
  }
}

function resolveDecisionTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'approved':
    case 'measured':
      return 'success';
    case 'rejected':
      return 'critical';
    case 'executing':
    case 'proposed':
    default:
      return 'warning';
  }
}

function mapQueueDecisionStatus(
  value: 'new' | 'review' | 'approved' | 'rejected' | 'measured',
): 'proposed' | 'approved' | 'rejected' | 'executing' | 'measured' {
  switch (value) {
    case 'approved':
    case 'rejected':
    case 'measured':
      return value;
    case 'review':
      return 'executing';
    case 'new':
    default:
      return 'proposed';
  }
}

function resolveBudgetPacingLabel(value: string): string {
  switch (value) {
    case 'underPace':
      return 'Poniżej tempa';
    case 'onPace':
      return 'W tempie';
    case 'overPace':
      return 'Powyżej tempa';
    case 'risk':
      return 'Ryzyko';
    default:
      return value;
  }
}

function resolveBudgetPacingTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'onPace':
      return 'success';
    case 'risk':
      return 'critical';
    case 'underPace':
    case 'overPace':
    default:
      return 'warning';
  }
}

function resolveSyncStatusLabel(value: string): string {
  switch (value) {
    case 'queued':
      return 'W kolejce';
    case 'running':
      return 'W toku';
    case 'partial':
      return 'Częściowo';
    case 'completed':
      return 'Zakończone';
    case 'failed':
      return 'Błąd';
    default:
      return value;
  }
}

function resolveSyncStatusTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'critical';
    case 'partial':
    case 'running':
    case 'queued':
    default:
      return 'warning';
  }
}

function resolvePairingStepLabel(value: string): string {
  switch (value) {
    case 'notStarted':
      return 'Nie rozpoczęto';
    case 'active':
      return 'Aktywny';
    case 'waitingForProvider':
      return 'Czeka na providera';
    case 'verified':
      return 'Zweryfikowany';
    case 'failed':
      return 'Błąd';
    case 'expired':
      return 'Wygasł';
    default:
      return value;
  }
}

function resolvePairingStepTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'verified':
      return 'success';
    case 'failed':
    case 'expired':
      return 'critical';
    case 'active':
    case 'waitingForProvider':
      return 'warning';
    case 'notStarted':
    default:
      return 'neutral';
  }
}

function resolveDevicePairingLabel(value: string): string {
  switch (value) {
    case 'unpaired':
      return 'Niepołączone';
    case 'pending':
      return 'Oczekuje';
    case 'paired':
      return 'Połączone';
    case 'revoked':
      return 'Odwołane';
    default:
      return value;
  }
}

function resolveBudgetPacingProgressTone(
  value: string,
): 'critical' | 'neutral' | 'success' | 'warning' {
  switch (value) {
    case 'onPace':
      return 'success';
    case 'risk':
      return 'critical';
    case 'underPace':
    case 'overPace':
    default:
      return 'warning';
  }
}

function resolvePaceLabel(value: string): string {
  switch (value) {
    case 'behind':
      return 'Poniżej planu';
    case 'onTrack':
      return 'Zgodnie z planem';
    case 'ahead':
      return 'Powyżej planu';
    default:
      return value;
  }
}

function resolvePaceTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'ahead':
    case 'onTrack':
      return 'success';
    case 'behind':
    default:
      return 'warning';
  }
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSignedNumber(value: number): string {
  const formatted = formatNumber(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    currency: 'PLN',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

function formatPercent(value: number): string {
  const normalized = Math.abs(value) <= 1
    ? value
    : value / 100;

  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(normalized);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
  }).format(date);
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatUnitValue(value: number, unit: string): string {
  if (unit === 'PLN') {
    return formatCurrency(value);
  }

  return `${formatSignedNumber(value)} ${unit}`;
}

export type DomainIconName = PapaDataIconName;
