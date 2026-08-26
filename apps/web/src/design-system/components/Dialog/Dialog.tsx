import type {
  HTMLAttributes,
  MutableRefObject,
  ReactNode,
} from 'react';
import {
  forwardRef,
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
import {
  OverlayRoot,
} from '../OverlayRoot';
import type {
  OverlayCloseReason,
} from '../OverlayRoot';
import {
  useOverlayFocusRestore,
} from '../OverlayRoot/overlayUtils';
import '../OverlayRoot/overlay.css';

export type DialogProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
  | 'title'
> & {
  readonly children?: ReactNode;
  readonly closeOnBackdrop?: boolean;
  readonly closeOnEscape: boolean;
  readonly description: string | null;
  readonly destructive?: boolean;
  readonly dismissible?: boolean;
  readonly hostId?: string;
  readonly modal: boolean;
  readonly onOpenChange?:
    | ((
        open: boolean,
        reason: OverlayCloseReason,
      ) => void)
    | undefined;
  readonly open: boolean;
  readonly primaryActionLabel?: string | null;
  readonly secondaryActionLabel?: string | null;
  readonly title: string;
};

function requestClose(
  onOpenChange:
    | ((
        open: boolean,
        reason: OverlayCloseReason,
      ) => void)
    | undefined,
  reason: OverlayCloseReason,
) {
  onOpenChange?.(
    false,
    reason,
  );
}

function useOverlayEscape(
  open: boolean,
  closeOnEscape: boolean,
  panelRef: MutableRefObject<HTMLElement | null>,
  onOpenChange:
    | ((
        open: boolean,
        reason: OverlayCloseReason,
      ) => void)
    | undefined,
) {
  useEffect(() => {
    if (
      !open
      || !closeOnEscape
      || typeof document === 'undefined'
    ) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      requestClose(
        onOpenChange,
        'escape',
      );
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
  }, [
    closeOnEscape,
    onOpenChange,
    open,
    panelRef,
  ]);
}

export const Dialog = forwardRef<
  HTMLDivElement,
  DialogProps
>(function Dialog(
  {
    children,
    className,
    closeOnBackdrop = false,
    closeOnEscape,
    description,
    destructive = false,
    dismissible = true,
    hostId,
    modal,
    onOpenChange,
    open,
    primaryActionLabel = null,
    secondaryActionLabel = null,
    title,
    ...props
  },
  ref,
) {
  const titleId = useId();
  const descriptionId = useId();
  const bodyId = useId();
  const panelRef =
    useRef<HTMLDivElement | null>(null);
  const describedBy = resolveDescribedBy(
    description
      ? descriptionId
      : undefined,
    children
      ? bodyId
      : undefined,
  );

  useOverlayFocusRestore(
    open,
    panelRef,
    modal,
  );
  useOverlayEscape(
    open,
    closeOnEscape,
    panelRef,
    onOpenChange,
  );

  return (
    <OverlayRoot
      backdrop="subtle"
      hostId={hostId}
      lockScroll={modal}
      onBackdropClick={
        closeOnBackdrop
          ? () => {
              requestClose(
                onOpenChange,
                'backdrop',
              );
            }
          : undefined
      }
      open={open}
    >
      <div
        {...props}
        ref={(node) => {
          panelRef.current = node;

          if (typeof ref === 'function') {
            ref(node);
            return;
          }

          if (ref) {
            ref.current = node;
          }
        }}
        aria-describedby={describedBy}
        aria-labelledby={titleId}
        aria-modal={modal}
        className={joinClassNames(
          'pd-overlay-surface',
          'pd-dialog',
          className,
        )}
        data-state={open ? 'open' : 'closed'}
        data-tone={
          destructive
            ? 'danger'
            : 'default'
        }
        role="dialog"
      >
        <header className="pd-overlay-surface__header">
          <div className="pd-overlay-surface__heading">
            <h2
              className="pd-overlay-surface__title"
              id={titleId}
            >
              {title}
            </h2>
            {description ? (
              <p
                className="pd-overlay-surface__description"
                id={descriptionId}
              >
                {description}
              </p>
            ) : null}
          </div>
          {dismissible ? (
            <Button
              className="pd-overlay-surface__close"
              onClick={() => {
                requestClose(
                  onOpenChange,
                  'close-button',
                );
              }}
              size="small"
              type="button"
              variant="ghost"
            >
              <span
                aria-hidden="true"
                className="pd-overlay-surface__close-glyph"
              >
                ×
              </span>
              <span className="pd-overlay-surface__close-label">
                Zamknij
              </span>
            </Button>
          ) : null}
        </header>

        {children ? (
          <div
            className="pd-overlay-surface__body"
            id={bodyId}
          >
            {children}
          </div>
        ) : null}

        {primaryActionLabel || secondaryActionLabel ? (
          <footer className="pd-overlay-surface__footer">
            {secondaryActionLabel ? (
              <Button
                onClick={() => {
                  requestClose(
                    onOpenChange,
                    'secondary-action',
                  );
                }}
                size="small"
                type="button"
                variant="ghost"
              >
                {secondaryActionLabel}
              </Button>
            ) : null}
            {primaryActionLabel ? (
              <Button
                data-autofocus="true"
                onClick={() => {
                  requestClose(
                    onOpenChange,
                    'primary-action',
                  );
                }}
                size="small"
                type="button"
                variant={
                  destructive
                    ? 'danger'
                    : 'primary'
                }
              >
                {primaryActionLabel}
              </Button>
            ) : null}
          </footer>
        ) : null}
      </div>
    </OverlayRoot>
  );
});
