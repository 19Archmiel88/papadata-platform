import type {
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactElement,
} from 'react';
import {
  cloneElement,
  isValidElement,
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
import {
  findEnabledIndex,
  findFirstEnabledIndex,
} from '../Navigation/navigationUtils';
import {
  mergeRefs,
} from '../OverlayRoot/overlayUtils';
import '../Navigation/navigation.css';

export type MenuItem =
  | {
      readonly id: string;
      readonly disabled?: boolean;
      readonly destructive?: boolean;
      readonly icon?: PapaDataIconName;
      readonly kind?: 'item';
      readonly label: string;
      readonly shortcut?: string;
    }
  | {
      readonly id: string;
      readonly kind: 'separator';
    };

export type MenuCloseReason =
  | 'action'
  | 'escape'
  | 'outside'
  | 'trigger';

export type MenuProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
> & {
  readonly activeItemId: string | null;
  readonly emptyLabel?: string;
  readonly items: readonly MenuItem[];
  readonly onAction?:
    | ((
        itemId: string,
      ) => void)
    | undefined;
  readonly onActiveItemIdChange?:
    | ((
        itemId: string | null,
      ) => void)
    | undefined;
  readonly onOpenChange?:
    | ((
        open: boolean,
        reason: MenuCloseReason,
      ) => void)
    | undefined;
  readonly open: boolean;
  readonly placement:
    | 'bottom-end'
    | 'bottom-start'
    | 'right-start';
  readonly trigger: ReactElement<any>;
};

function isInteractiveItem(
  item: MenuItem,
): item is Extract<MenuItem, {
  readonly id: string;
  readonly label: string;
}> {
  return item.kind !== 'separator';
}

export function Menu({
  activeItemId,
  className,
  emptyLabel = 'Brak dostępnych akcji.',
  items,
  onAction,
  onActiveItemIdChange,
  onOpenChange,
  open,
  placement,
  trigger,
  ...props
}: MenuProps) {
  const rootRef =
    useRef<HTMLDivElement | null>(null);
  const panelRef =
    useRef<HTMLDivElement | null>(null);
  const triggerRef =
    useRef<HTMLElement | null>(null);
  const itemRefs = useRef<
    Record<string, HTMLButtonElement | null>
  >({});
  const triggerProps =
    (trigger as ReactElement<any>).props as Record<
      string,
      unknown
    >;
  const interactiveItems = items.filter(
    isInteractiveItem,
  );
  const firstEnabledIndex =
    findFirstEnabledIndex(
      interactiveItems,
    );
  const resolvedActiveId =
    activeItemId
    ?? interactiveItems[firstEnabledIndex]?.id
    ?? null;

  const focusItem = (
    itemId: string | null,
  ) => {
    if (!itemId) {
      return;
    }

    itemRefs.current[itemId]?.focus();
  };

  const setActiveFromIndex = (
    index: number,
  ) => {
    const item = interactiveItems[index];

    if (!item || item.disabled) {
      return;
    }

    onActiveItemIdChange?.(item.id);
    focusItem(item.id);
  };

  useEffect(() => {
    if (
      !open
      || typeof document === 'undefined'
    ) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      focusItem(resolvedActiveId);
    });

    const handlePointerDown = (
      event: PointerEvent,
    ) => {
      if (
        rootRef.current
        && !rootRef.current.contains(
          event.target as Node,
        )
      ) {
        onOpenChange?.(
          false,
          'outside',
        );
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (
        rootRef.current
        && !rootRef.current.contains(
          event.target as Node,
        )
      ) {
        onOpenChange?.(
          false,
          'outside',
        );
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      onOpenChange?.(
        false,
        'escape',
      );
    };

    document.addEventListener(
      'pointerdown',
      handlePointerDown,
    );
    document.addEventListener(
      'focusin',
      handleFocusIn,
    );
    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener(
        'pointerdown',
        handlePointerDown,
      );
      document.removeEventListener(
        'focusin',
        handleFocusIn,
      );
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    onOpenChange,
    open,
    resolvedActiveId,
  ]);

  const triggerElement = isValidElement(trigger)
    ? cloneElement(
        trigger as ReactElement<any>,
        {
          'aria-expanded': open,
          'aria-haspopup': 'menu',
          onClick: (
            event: React.MouseEvent<HTMLElement>,
          ) => {
            (
              triggerProps.onClick as
                | ((
                    nextEvent: React.MouseEvent<HTMLElement>,
                  ) => void)
                | undefined
            )?.(event);

            if (event.defaultPrevented) {
              return;
            }

            onOpenChange?.(
              !open,
              'trigger',
            );
          },
          onKeyDown: (
            event: ReactKeyboardEvent<HTMLElement>,
          ) => {
            (
              triggerProps.onKeyDown as
                | ((
                    nextEvent: ReactKeyboardEvent<HTMLElement>,
                  ) => void)
                | undefined
            )?.(event);

            if (event.defaultPrevented) {
              return;
            }

            if (
              event.key === 'ArrowDown'
              || event.key === 'Enter'
              || event.key === ' '
            ) {
              event.preventDefault();
              onOpenChange?.(
                true,
                'trigger',
              );
            }
          },
          ref: mergeRefs(
            triggerRef,
          ),
        },
      )
    : trigger;

  return (
    <div
      {...props}
      ref={rootRef}
      className={joinClassNames(
        'pd-menu',
        className,
      )}
    >
      <div className="pd-menu__trigger">
        {triggerElement}
      </div>

      {open ? (
        <div
          ref={panelRef}
          className="pd-menu__panel"
          data-placement={placement}
        >
          {interactiveItems.length === 0 ? (
            <div className="pd-menu__empty">
              {emptyLabel}
            </div>
          ) : (
            <ul
              aria-orientation="vertical"
              className="pd-menu__list"
              role="menu"
            >
              {items.map((item) => {
                if (
                  item.kind === 'separator'
                ) {
                  return (
                    <li
                      key={item.id}
                      aria-hidden="true"
                      className="pd-menu__separator"
                      role="separator"
                    />
                  );
                }

                const isActive =
                  item.id
                  === resolvedActiveId;
                const currentIndex =
                  interactiveItems.findIndex(
                    (candidate) =>
                      candidate.id === item.id,
                  );

                return (
                  <li
                    key={item.id}
                    role="none"
                  >
                    <button
                      ref={(node) => {
                        itemRefs.current[item.id] = node;
                      }}
                      aria-disabled={
                        item.disabled
                          ? true
                          : undefined
                      }
                      className="pd-menu__item"
                      data-active={isActive}
                      data-destructive={
                        item.destructive
                          ? true
                          : undefined
                      }
                      role="menuitem"
                      tabIndex={
                        isActive
                          ? 0
                          : -1
                      }
                      type="button"
                      onClick={() => {
                        if (item.disabled) {
                          return;
                        }

                        onAction?.(item.id);
                        onOpenChange?.(
                          false,
                          'action',
                        );
                      }}
                      onFocus={() => {
                        if (item.disabled) {
                          return;
                        }

                        onActiveItemIdChange?.(
                          item.id,
                        );
                      }}
                      onKeyDown={(event) => {
                        if (item.disabled) {
                          return;
                        }

                        if (
                          event.key === 'ArrowDown'
                        ) {
                          event.preventDefault();

                          const nextIndex =
                            findEnabledIndex(
                              interactiveItems,
                              currentIndex,
                              1,
                            );

                          if (nextIndex >= 0) {
                            setActiveFromIndex(
                              nextIndex,
                            );
                          }

                          return;
                        }

                        if (
                          event.key === 'ArrowUp'
                        ) {
                          event.preventDefault();

                          const nextIndex =
                            findEnabledIndex(
                              interactiveItems,
                              currentIndex,
                              -1,
                            );

                          if (nextIndex >= 0) {
                            setActiveFromIndex(
                              nextIndex,
                            );
                          }

                          return;
                        }

                        if (event.key === 'Home') {
                          event.preventDefault();

                          if (firstEnabledIndex >= 0) {
                            setActiveFromIndex(
                              firstEnabledIndex,
                            );
                          }

                          return;
                        }

                        if (event.key === 'End') {
                          event.preventDefault();

                          const lastEnabledIndex = findEnabledIndex(
                            interactiveItems,
                            0,
                            -1,
                          );

                          if (lastEnabledIndex >= 0) {
                            setActiveFromIndex(
                              lastEnabledIndex,
                            );
                          }

                          return;
                        }

                        if (
                          event.key === 'Enter'
                          || event.key === ' '
                        ) {
                          event.preventDefault();
                          onAction?.(item.id);
                          onOpenChange?.(
                            false,
                            'action',
                          );
                        }
                      }}
                    >
                      {item.icon ? (
                        <Icon
                          decorative
                          name={item.icon}
                          size={16}
                        />
                      ) : null}
                      <span className="pd-menu__item-label">
                        {item.label}
                      </span>
                      {item.shortcut ? (
                        <span className="pd-menu__item-shortcut">
                          {item.shortcut}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
