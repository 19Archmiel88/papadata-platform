import type {
  HTMLAttributes,
  MutableRefObject,
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
import './alert-dialog.css';

export type AlertDialogProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
  | 'title'
> & {
  readonly cancelLabel: string | null;
  readonly closeOnEscape?: boolean;
  readonly confirmLabel: string;
  readonly destructive: boolean;
  readonly hostId?: string;
  readonly message: string;
  readonly onCancel?: (() => void) | undefined;
  readonly onConfirm?: (() => void) | undefined;
  readonly onOpenChange?:
    | ((
        open: boolean,
        reason: OverlayCloseReason,
      ) => void)
    | undefined;
  readonly open: boolean;
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

function useAlertDialogEscape(
  open: boolean,
  closeOnEscape: boolean,
  panelRef: MutableRefObject<HTMLElement | null>,
  onCancel: (() => void) | undefined,
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
      onCancel?.();
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
    onCancel,
    onOpenChange,
    open,
    panelRef,
  ]);
}

export const AlertDialog = forwardRef<
  HTMLDivElement,
  AlertDialogProps
>(function AlertDialog(
  {
    cancelLabel,
    className,
    closeOnEscape = true,
    confirmLabel,
    destructive,
    hostId,
    message,
    onCancel,
    onConfirm,
    onOpenChange,
    open,
    title,
    ...props
  },
  ref,
) {
  const titleId = useId();
  const messageId = useId();
  const panelRef =
    useRef<HTMLDivElement | null>(null);

  useOverlayFocusRestore(
    open,
    panelRef,
    true,
  );
  useAlertDialogEscape(
    open,
    closeOnEscape,
    panelRef,
    onCancel,
    onOpenChange,
  );

  return (
    <OverlayRoot
      backdrop="subtle"
      hostId={hostId}
      lockScroll
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
        aria-describedby={resolveDescribedBy(messageId)}
        aria-labelledby={titleId}
        aria-modal="true"
        className={joinClassNames(
          'pd-overlay-surface',
          'pd-alert-dialog',
          className,
        )}
        data-component="AlertDialog"
        data-destructive={destructive ? true : undefined}
        data-state={open ? 'open' : 'closed'}
        data-tone={
          destructive
            ? 'danger'
            : 'default'
        }
        role="alertdialog"
      >
        <header className="pd-overlay-surface__header">
          <div className="pd-overlay-surface__heading">
            <h2
              className="pd-overlay-surface__title"
              id={titleId}
            >
              {title}
            </h2>
            <p
              className="pd-overlay-surface__description"
              id={messageId}
            >
              {message}
            </p>
          </div>
        </header>

        <footer className="pd-overlay-surface__footer pd-alert-dialog__actions">
          {cancelLabel ? (
            <Button
              onClick={() => {
                onCancel?.();
                requestClose(
                  onOpenChange,
                  'secondary-action',
                );
              }}
              size="small"
              type="button"
              variant="ghost"
            >
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            data-autofocus="true"
            onClick={() => {
              onConfirm?.();
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
            {confirmLabel}
          </Button>
        </footer>
      </div>
    </OverlayRoot>
  );
});
