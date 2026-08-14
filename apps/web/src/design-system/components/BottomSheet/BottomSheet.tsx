import type {
  HTMLAttributes,
  ReactNode,
} from 'react';
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
} from 'react';

import type {
  BottomSheetProps as ContractBottomSheetProps,
} from '../../../../../../contracts/components/bottomsheet';
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
import './bottom-sheet.css';

export type BottomSheetProps = Omit<
  ContractBottomSheetProps,
  | 'actions'
  | 'ariaLabel'
  | 'ariaLive'
  | 'context'
  | 'description'
  | 'disabled'
  | 'disabledReason'
  | 'evidence'
  | 'id'
  | 'label'
  | 'state'
  | 'testId'
  | 'variant'
> & HTMLAttributes<HTMLDivElement> & {
  readonly children?: ReactNode;
  readonly description?: string | null;
  readonly onOpenChange?:
    | ((
        open: boolean,
        reason: OverlayCloseReason,
      ) => void)
    | undefined;
  readonly primaryActionLabel?: string | null;
};

export const BottomSheet = forwardRef<
  HTMLDivElement,
  BottomSheetProps
>(function BottomSheet(
  {
    children,
    className,
    description = null,
    dismissible,
    onOpenChange,
    open,
    primaryActionLabel = null,
    snapPoint,
    title,
    ...props
  },
  ref,
) {
  const titleId = useId();
  const descriptionId = useId();
  const bodyId = useId();
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useOverlayFocusRestore(
    open,
    sheetRef,
    true,
  );

  useEffect(() => {
    if (
      !open
      || !dismissible
      || typeof document === 'undefined'
    ) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      onOpenChange?.(false, 'escape');
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dismissible, onOpenChange, open]);

  return (
    <OverlayRoot
      lockScroll
      open={open}
      onBackdropClick={
        dismissible
          ? () => {
              onOpenChange?.(false, 'backdrop');
            }
          : undefined
      }
    >
      <div
        {...props}
        ref={(node) => {
          sheetRef.current = node;

          if (typeof ref === 'function') {
            ref(node);
            return;
          }

          if (ref) {
            ref.current = node;
          }
        }}
        aria-describedby={resolveDescribedBy(
          description ? descriptionId : undefined,
          children ? bodyId : undefined,
        )}
        aria-labelledby={titleId}
        aria-modal="true"
        className={joinClassNames(
          'pd-overlay-surface',
          'pd-bottom-sheet',
          className,
        )}
        data-snap-point={snapPoint}
        role="dialog"
      >
        <header className="pd-overlay-surface__header">
          <div className="pd-overlay-surface__heading">
            <h2 id={titleId}>{title}</h2>
            {description ? (
              <p id={descriptionId}>{description}</p>
            ) : null}
          </div>
          {dismissible ? (
            <Button
              aria-label="Zamknij panel"
              size="small"
              variant="ghost"
              onClick={() => {
                onOpenChange?.(false, 'close-button');
              }}
            >
              Zamknij
            </Button>
          ) : null}
        </header>
        {children ? (
          <div
            className="pd-bottom-sheet__body"
            id={bodyId}
          >
            {children}
          </div>
        ) : null}
        {primaryActionLabel ? (
          <footer className="pd-overlay-surface__footer">
            <Button>{primaryActionLabel}</Button>
          </footer>
        ) : null}
      </div>
    </OverlayRoot>
  );
});
