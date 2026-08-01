import type {
  HTMLAttributes,
  ReactElement,
} from 'react';
import {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import {
  joinClassNames,
} from '../Field/fieldUtils';
import '../OverlayRoot/overlay.css';

export type TooltipProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  | 'children'
> & {
  readonly content: string;
  readonly delayMs: number;
  readonly interactive: boolean;
  readonly placement: 'top' | 'right' | 'bottom' | 'left';
  readonly trigger: ReactElement<any>;
};

export const Tooltip = forwardRef<
  HTMLSpanElement,
  TooltipProps
>(function Tooltip(
  {
    className,
    content,
    delayMs,
    interactive,
    placement,
    trigger,
    ...props
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const rootRef =
    useRef<HTMLSpanElement | null>(null);
  const timerRef =
    useRef<number | null>(null);
  const tooltipId = useId();
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      setOpen(false);
    };

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  function openTooltip() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setOpen(true);
    }, Math.max(delayMs, 0));
  }

  function closeTooltip() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    setOpen(false);
  }

  const triggerElement = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<any>, {
        'aria-describedby':
          open
            ? tooltipId
            : undefined,
        onBlur: (
          event: React.FocusEvent<HTMLElement>,
        ) => {
          (
            triggerProps.onBlur as
              | ((
                  event: React.FocusEvent<HTMLElement>,
                ) => void)
              | undefined
          )?.(event);

          if (
            interactive
            && rootRef.current?.contains(
              event.relatedTarget as Node,
            )
          ) {
            return;
          }

          closeTooltip();
        },
        onFocus: (
          event: React.FocusEvent<HTMLElement>,
        ) => {
          (
            triggerProps.onFocus as
              | ((
                  event: React.FocusEvent<HTMLElement>,
                ) => void)
              | undefined
          )?.(event);
          openTooltip();
        },
        onMouseEnter: (
          event: React.MouseEvent<HTMLElement>,
        ) => {
          (
            triggerProps.onMouseEnter as
              | ((
                  event: React.MouseEvent<HTMLElement>,
                ) => void)
              | undefined
          )?.(event);
          openTooltip();
        },
        onMouseLeave: (
          event: React.MouseEvent<HTMLElement>,
        ) => {
          (
            triggerProps.onMouseLeave as
              | ((
                  event: React.MouseEvent<HTMLElement>,
                ) => void)
              | undefined
          )?.(event);

          if (
            interactive
            && rootRef.current?.contains(
              event.relatedTarget as Node,
            )
          ) {
            return;
          }

          closeTooltip();
        },
      })
    : trigger;

  return (
    <span
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
        'pd-tooltip',
        className,
      )}
      onBlur={(event) => {
        if (
          interactive
          && event.relatedTarget instanceof Node
          && event.currentTarget.contains(
            event.relatedTarget,
          )
        ) {
          return;
        }

        closeTooltip();
      }}
      onMouseLeave={(event) => {
        if (
          interactive
          && event.relatedTarget instanceof Node
          && event.currentTarget.contains(
            event.relatedTarget,
          )
        ) {
          return;
        }

        closeTooltip();
      }}
    >
      {triggerElement}
      {open ? (
        <span
          className="pd-tooltip__bubble"
          data-placement={placement}
          id={tooltipId}
          onBlur={(event) => {
            if (
              interactive
              && event.relatedTarget instanceof Node
              && event.currentTarget.contains(
                event.relatedTarget,
              )
            ) {
              return;
            }

            closeTooltip();
          }}
          onFocus={() => {
            if (interactive) {
              setOpen(true);
            }
          }}
          onMouseEnter={() => {
            if (interactive) {
              setOpen(true);
            }
          }}
          onMouseLeave={() => {
            if (interactive) {
              closeTooltip();
            }
          }}
          role="tooltip"
        >
          <p>{content}</p>
        </span>
      ) : null}
    </span>
  );
});
