import type {
  HTMLAttributes,
  ReactNode,
} from '../domainShared';
import {
  forwardRef,
  joinClassNames,
  useId,
} from '../domainShared';
import './priority-band.css';

export type PriorityBandTone = 'attention' | 'hero';

export type PriorityBandProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  readonly actions?: ReactNode;
  readonly badgeLabel?: string | null;
  readonly children?: ReactNode;
  readonly timestampLabel?: string | null;
  readonly title: string;
  readonly tone?: PriorityBandTone;
};

export const PriorityBand = forwardRef<HTMLElement, PriorityBandProps>(
  function PriorityBand(
    {
      actions = null,
      badgeLabel = null,
      children = null,
      className,
      timestampLabel = null,
      title,
      tone = 'attention',
      ...props
    },
    ref,
  ) {
    const hasMeta = Boolean(badgeLabel || timestampLabel);
    const titleId = useId();

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-priority-band', className)}
        data-tone={tone}
      >
        <div className="pd-priority-band__body">
          {hasMeta ? (
            <div className="pd-priority-band__meta">
              {badgeLabel ? (
                <span className="pd-priority-band__badge">{badgeLabel}</span>
              ) : null}
              {timestampLabel ? (
                <span className="pd-priority-band__timestamp">{timestampLabel}</span>
              ) : null}
            </div>
          ) : null}

          <h2 className="pd-priority-band__title" id={titleId}>{title}</h2>

          {children ? (
            <div className="pd-priority-band__description">{children}</div>
          ) : null}
        </div>

        {actions ? (
          <div className="pd-priority-band__actions">{actions}</div>
        ) : null}
      </section>
    );
  },
);

PriorityBand.displayName = 'PriorityBand';
