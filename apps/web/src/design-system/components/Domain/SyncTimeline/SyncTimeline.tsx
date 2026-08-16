import type {
  ContractSyncTimelineProps,
  HTMLAttributes,
} from '../domainShared';
import {
  StatusBadge,
  TextAction,
  formatDateTime,
  formatInteger,
  forwardRef,
  joinClassNames,
  resolveSyncStatusLabel,
  resolveSyncStatusTone,
  useId,
} from '../domainShared';

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
