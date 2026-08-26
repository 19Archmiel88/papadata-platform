import type {
  CSSProperties,
  HTMLAttributes,
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

export type DrawerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
  | 'title'
> & {
  readonly children?: ReactNode;
  readonly description?: string | null;
  readonly dismissible: boolean;
  readonly hostId?: string;
  readonly onOpenChange?:
    | ((
        open: boolean,
        reason: OverlayCloseReason,
      ) => void)
    | undefined;
  readonly open: boolean;
  readonly primaryActionLabel?: string | null;
  readonly secondaryActionLabel?: string | null;
  readonly side: 'left' | 'right';
  readonly title: string;
  readonly width: number;
};

export const Drawer = forwardRef<
  HTMLDivElement,
  DrawerProps
>(function Drawer(
  {
    children,
    className,
    description = null,
    dismissible,
    hostId,
    onOpenChange,
    open,
    primaryActionLabel = null,
    secondaryActionLabel = null,
    side,
    style,
    title,
    width,
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
      onOpenChange?.(
        false,
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
    dismissible,
    onOpenChange,
    open,
  ]);

  return (
    <OverlayRoot
      lockScroll
      hostId={hostId}
      onBackdropClick={
        dismissible
          ? () => {
              onOpenChange?.(
                false,
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
        aria-modal="true"
        className={joinClassNames(
          'pd-overlay-surface',
          'pd-drawer',
          className,
        )}
        data-side={side}
        role="dialog"
        style={{
          ...style,
          '--pd-drawer-width': `${width}px`,
        } as CSSProperties}
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
                onOpenChange?.(
                  false,
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
                  onOpenChange?.(
                    false,
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
                  onOpenChange?.(
                    false,
                    'primary-action',
                  );
                }}
                size="small"
                type="button"
                variant="primary"
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
