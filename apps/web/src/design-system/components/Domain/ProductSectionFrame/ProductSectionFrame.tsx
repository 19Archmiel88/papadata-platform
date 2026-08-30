import type {
  HTMLAttributes,
  ReactNode,
} from '../domainShared';
import {
  forwardRef,
  joinClassNames,
  useId,
} from '../domainShared';
import type {
  PapaDataIconName,
} from '../../../icons';
import {
  Icon,
} from '../../../icons';
import './product-section-frame.css';

export type ProductSectionFrameProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  readonly accentClassName?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly description?: ReactNode;
  readonly icon: PapaDataIconName;
  readonly title: string;
};

/**
 * Shared "big card" frame every BI dashboard section (Command Center,
 * Paid Campaigns, Orders, ...) renders inside: icon + title + optional
 * description in the header, an optional actions/toolbar slot, and the
 * section body below — one shared radius/shadow/padding/typography
 * contract instead of copy-pasted per-module CSS.
 */
export const ProductSectionFrame = forwardRef<HTMLElement, ProductSectionFrameProps>(
  function ProductSectionFrame(
    {
      accentClassName,
      actions = null,
      children,
      className,
      description = null,
      icon,
      title,
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
        className={joinClassNames('pd-section-frame', className)}
      >
        <header className="pd-section-frame__head">
          <div className={joinClassNames('pd-section-frame__heading', accentClassName)}>
            <Icon className="pd-section-frame__icon" decorative name={icon} size={20} />
            <div className="pd-section-frame__heading-text">
              <h2 className="pd-section-frame__title" id={titleId}>{title}</h2>
              {description ? (
                <p className="pd-section-frame__description">{description}</p>
              ) : null}
            </div>
          </div>
          {actions ? (
            <div className="pd-section-frame__actions">{actions}</div>
          ) : null}
        </header>
        <div className="pd-section-frame__body">{children}</div>
      </section>
    );
  },
);

ProductSectionFrame.displayName = 'ProductSectionFrame';
