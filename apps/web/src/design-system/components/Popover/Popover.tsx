import type {
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactElement,
  ReactNode,
} from 'react';
import {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useRef,
} from 'react';

import {
  Button,
} from '../Button';
import {
  joinClassNames,
  resolveDescribedBy,
} from '../Field/fieldUtils';
import type {
  OverlayCloseReason,
} from '../OverlayRoot';
import {
  focusFirstElement,
  mergeRefs,
} from '../OverlayRoot/overlayUtils';
import '../OverlayRoot/overlay.css';

export type PopoverProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
> & {
  readonly actionLabel?: string | null;
  readonly anchorId: string;
  readonly children?: ReactNode;
  readonly description?: string | null;
  readonly modal: boolean;
  readonly onOpenChange?:
    | ((
        open: boolean,
        reason: OverlayCloseReason,
      ) => void)
    | undefined;
  readonly open: boolean;
  readonly placement: 'top' | 'right' | 'bottom' | 'left';
  readonly title?: string | null;
  readonly trigger: ReactElement<any>;
};

export const Popover = forwardRef<
  HTMLDivElement,
  PopoverProps
>(function Popover(
  {
    actionLabel = null,
    anchorId,
    children,
    className,
    description = null,
    modal,
    onOpenChange,
    open,
    placement,
    title = null,
    trigger,
    ...props
  },
  ref,
) {
  const rootRef =
    useRef<HTMLDivElement | null>(null);
  const panelRef =
    useRef<HTMLDivElement | null>(null);
  const triggerRef =
    useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const bodyId = useId();
  const describedBy = resolveDescribedBy(
    description
      ? descriptionId
      : undefined,
    children
      ? bodyId
      : undefined,
  );
  const panelId = useId();
  const triggerProps =
    (trigger as ReactElement<any>).props as Record<
      string,
      unknown
    >;

  useEffect(() => {
    if (
      !open
      || typeof document === 'undefined'
    ) {
      return;
    }

    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const frame = window.requestAnimationFrame(() => {
      focusFirstElement(panelRef.current);
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

      if (
        previousActiveElement
        && previousActiveElement.isConnected
      ) {
        window.requestAnimationFrame(() => {
          previousActiveElement.focus();
        });
      }
    };
  }, [
    onOpenChange,
    open,
  ]);

  const triggerElement = isValidElement(trigger)
    ? cloneElement(
        trigger as ReactElement<any>,
        {
        'aria-controls':
          open
            ? panelId
            : undefined,
        'aria-expanded': open,
        'aria-haspopup': 'dialog',
        id: anchorId,
        onClick: (
          event: React.MouseEvent<HTMLElement>,
        ) => {
          (
            triggerProps.onClick as
              | ((
                  event: React.MouseEvent<HTMLElement>,
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
                  event: ReactKeyboardEvent<HTMLElement>,
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
      ref={(node) => {
        rootRef.current = node;

        if (typeof ref === 'function') {
          ref(node);
          return;
        }

        if (ref) {
          ref.current = node;
        }
      }}
      className={joinClassNames(
        'pd-popover',
        className,
      )}
    >
      <span className="pd-popover__trigger">
        {triggerElement}
      </span>

      {open ? (
        <div
          aria-describedby={describedBy}
          aria-labelledby={
            title
              ? titleId
              : undefined
          }
          aria-modal={
            modal
              ? true
              : undefined
          }
          className={joinClassNames(
            'pd-overlay-surface',
            'pd-popover__panel',
          )}
          data-placement={placement}
          id={panelId}
          ref={panelRef}
          role="dialog"
          tabIndex={-1}
        >
          {title || description ? (
            <header className="pd-overlay-surface__header">
              <div className="pd-overlay-surface__heading">
                {title ? (
                  <h3
                    className="pd-overlay-surface__title"
                    id={titleId}
                  >
                    {title}
                  </h3>
                ) : null}
                {description ? (
                  <p
                    className="pd-overlay-surface__description"
                    id={descriptionId}
                  >
                    {description}
                  </p>
                ) : null}
              </div>
            </header>
          ) : null}

          {children ? (
            <div
              className="pd-overlay-surface__body"
              id={bodyId}
            >
              {children}
            </div>
          ) : null}

          {actionLabel ? (
            <footer className="pd-overlay-surface__footer">
              <Button
                data-autofocus="true"
                onClick={() => {
                  onOpenChange?.(
                    false,
                    'primary-action',
                  );
                }}
                size="small"
                type="button"
                variant="primary"
              >
                {actionLabel}
              </Button>
            </footer>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
