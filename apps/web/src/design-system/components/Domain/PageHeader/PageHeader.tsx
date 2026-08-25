import type {
  ContractPageHeaderProps,
  HTMLAttributes,
  PageHeaderContractRuntimeKeys,
  ReactNode,
} from '../domainShared';
import {
  forwardRef,
  joinClassNames,
  useId,
} from '../domainShared';
import {
  Breadcrumbs,
} from '../../Breadcrumbs';

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
            <Breadcrumbs
              ariaLabel="Ścieżka ekranu"
              className="pd-page-header__breadcrumbs"
              items={breadcrumbs.map((item, index) => ({
                current: index === breadcrumbs.length - 1,
                href: item.href,
                id: `page-header-breadcrumb-${index}-${item.label}`,
                label: item.label,
              }))}
              maxVisible={5}
            />
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
