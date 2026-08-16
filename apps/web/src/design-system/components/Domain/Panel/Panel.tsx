import type {
  BaseComponentContractKeys,
  ContractPanelProps,
  HTMLAttributes,
  ReactNode,
} from '../domainShared';
import {
  forwardRef,
  joinClassNames,
  useId,
} from '../domainShared';

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
