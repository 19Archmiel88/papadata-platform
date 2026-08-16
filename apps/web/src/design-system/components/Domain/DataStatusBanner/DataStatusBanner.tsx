import type {
  ContractDataStatusBannerProps,
  HTMLAttributes,
} from '../domainShared';
import {
  StatusBadge,
  TextAction,
  formatDateTime,
  formatPercent,
  formatWorkspaceLabel,
  forwardRef,
  joinClassNames,
  resolveIssueTone,
  resolveReadinessLabel,
  resolveReadinessTone,
  useId,
} from '../domainShared';

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
