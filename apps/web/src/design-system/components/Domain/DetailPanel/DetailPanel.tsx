import type {
  BaseComponentContractKeys,
  ContractDetailPanelProps,
  HTMLAttributes,
  ReactNode,
} from '../domainShared';
import {
  forwardRef,
  joinClassNames,
  useId,
} from '../domainShared';

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
