import type {
  HTMLAttributes,
} from '../domainShared';
import {
  forwardRef,
  joinClassNames,
  useEffect,
  useState,
} from '../domainShared';
import type {
  PapaDataIconName,
} from '../../../icons';
import {
  Icon,
} from '../../../icons';
import './product-section-topbar.css';

export type ProductSectionTopbarItem = {
  readonly icon?: PapaDataIconName;
  readonly id: string;
  readonly label: string;
};

export type ProductSectionTopbarProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  readonly activeId?: string;
  readonly ariaLabel?: string;
  readonly items: readonly ProductSectionTopbarItem[];
  readonly onActiveIdChange?: (id: string) => void;
  readonly scrollThreshold?: number;
};

/**
 * Shared floating pill nav every BI dashboard page (Command Center, Paid
 * Campaigns, Orders, ...) uses to jump between its own sections: hidden
 * until the page scrolls past `scrollThreshold`, then a sticky centered
 * pill bar. One shared component instead of a copy-pasted anchor nav per
 * module.
 */
export const ProductSectionTopbar = forwardRef<HTMLElement, ProductSectionTopbarProps>(
  function ProductSectionTopbar(
    {
      activeId,
      ariaLabel = 'Nawigacja sekcji',
      className,
      items,
      onActiveIdChange,
      scrollThreshold = 24,
      ...props
    },
    ref,
  ) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
      function readScrollTop(target: EventTarget | Document | null): number {
        if (!target || target === document || target === globalThis) {
          return globalThis.scrollY;
        }

        return (target as HTMLElement).scrollTop;
      }

      function handleScroll(event?: Event) {
        setIsScrolled(readScrollTop(event?.target ?? null) > scrollThreshold);
      }

      handleScroll();
      // Host pages (the product shell in particular) scroll an inner
      // container, not the window — scroll events don't bubble, so the
      // listener must run in the capture phase to observe them regardless
      // of which ancestor actually scrolls.
      globalThis.addEventListener('scroll', handleScroll, { capture: true, passive: true });
      return () => globalThis.removeEventListener('scroll', handleScroll, { capture: true });
    }, [scrollThreshold]);

    return (
      <nav
        {...props}
        ref={ref}
        aria-label={ariaLabel}
        className={joinClassNames('pd-section-topbar', className)}
        data-visible={isScrolled ? 'true' : 'false'}
      >
        <div className="pd-section-topbar__list">
          {items.map((item) => (
            <a
              aria-current={item.id === activeId ? 'page' : undefined}
              className="pd-section-topbar__item"
              href={`#${item.id}`}
              key={item.id}
              onClick={(event) => {
                event.preventDefault();
                onActiveIdChange?.(item.id);
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {item.icon ? (
                <Icon decorative name={item.icon} size={16} />
              ) : null}
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    );
  },
);

ProductSectionTopbar.displayName = 'ProductSectionTopbar';
