import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
} from 'react';
import {
  useEffect,
  useRef,
} from 'react';

import type {
  PapaDataIconName,
} from '../../icons';
import {
  Icon,
} from '../../icons';
import {
  joinClassNames,
} from '../Field/fieldUtils';
import '../Navigation/navigation.css';

export type SectionNavigationItem = {
  readonly badge?: string;
  readonly disabled?: boolean;
  readonly href: string;
  readonly icon?: PapaDataIconName;
  readonly id: string;
  readonly label: string;
};

export type SectionNavigationProps = Omit<
  HTMLAttributes<HTMLElement>,
  | 'children'
> & {
  readonly activeId: string;
  readonly ariaLabel?: string;
  readonly itemProps?:
    | ((
        item: SectionNavigationItem,
      ) => AnchorHTMLAttributes<HTMLAnchorElement>)
    | undefined;
  readonly items: readonly SectionNavigationItem[];
  readonly orientation:
    | 'horizontal'
    | 'vertical';
  readonly size?: 'compact' | 'default';
  readonly sticky?: boolean;
};

export function SectionNavigation({
  activeId,
  ariaLabel = 'Nawigacja sekcji',
  className,
  itemProps,
  items,
  orientation,
  size = 'default',
  sticky = false,
  ...props
}: SectionNavigationProps) {
  const navigationRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sticky || orientation !== 'horizontal') {
      return;
    }

    const navigation = navigationRef.current;
    const activeItem = navigation?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    );

    if (!navigation || !activeItem) {
      return;
    }

    const navigationRect = navigation.getBoundingClientRect();
    const activeRect = activeItem.getBoundingClientRect();
    const activeOverflow =
      activeRect.left < navigationRect.left
      || activeRect.right > navigationRect.right;

    if (!activeOverflow) {
      return;
    }

    navigation.scrollTo({
      behavior: 'auto',
      left:
        navigation.scrollLeft
        + activeRect.left
        - navigationRect.left
        - (navigationRect.width - activeRect.width) / 2,
    });
  }, [
    activeId,
    orientation,
    sticky,
  ]);

  return (
    <nav
      {...props}
      ref={navigationRef}
      aria-label={ariaLabel}
      className={joinClassNames(
        'pd-section-navigation',
        className,
      )}
      data-orientation={orientation}
      data-size={size}
      data-sticky={sticky ? true : undefined}
    >
      {items.map((item) => {
        const extraProps =
          itemProps?.(item) ?? {};

        return item.disabled ? (
          <span
            key={item.id}
            aria-disabled="true"
            className="pd-section-navigation__item"
          >
            {item.icon ? (
              <Icon
                decorative
                name={item.icon}
                size={16}
              />
            ) : null}
            <span>{item.label}</span>
            {item.badge ? (
              <span className="pd-section-navigation__badge">
                {item.badge}
              </span>
            ) : null}
          </span>
        ) : (
          <a
            key={item.id}
            {...extraProps}
            aria-current={
              item.id === activeId
                ? 'page'
                : undefined
            }
            className={joinClassNames(
              'pd-section-navigation__item',
              extraProps.className,
            )}
            href={item.href}
          >
            {item.icon ? (
              <Icon
                decorative
                name={item.icon}
                size={16}
              />
            ) : null}
            <span>{item.label}</span>
            {item.badge ? (
              <span className="pd-section-navigation__badge">
                {item.badge}
              </span>
            ) : null}
          </a>
        );
      })}
    </nav>
  );
}
