import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react';
import {
  forwardRef,
  useEffect,
} from 'react';
import {
  createPortal,
} from 'react-dom';

import {
  joinClassNames,
} from '../Field/fieldUtils';
import {
  useOverlayPortal,
} from './overlayUtils';
import './overlay.css';

export type OverlayRootBackdrop =
  | 'none'
  | 'subtle';

export type OverlayRootProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
> & {
  readonly backdrop?: OverlayRootBackdrop;
  readonly children?: ReactNode;
  readonly hostId?: string;
  readonly lockScroll?: boolean;
  readonly onBackdropClick?: (() => void) | undefined;
  readonly open: boolean;
  readonly zIndex?: number;
};

export const OverlayRoot = forwardRef<
  HTMLDivElement,
  OverlayRootProps
>(function OverlayRoot(
  {
    backdrop = 'subtle',
    children,
    className,
    hostId,
    lockScroll = false,
    onBackdropClick,
    open,
    style,
    zIndex,
    ...props
  },
  ref,
) {
  const portalRoot = useOverlayPortal(
    open,
    hostId,
  );
  const rootStyle = {
    ...style,
    '--pd-overlay-z-index':
      zIndex ?? undefined,
  } as CSSProperties;

  useEffect(() => {
    if (
      !open
      || !lockScroll
      || typeof document === 'undefined'
    ) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    lockScroll,
    open,
  ]);

  if (
    !open
    || !portalRoot
  ) {
    return null;
  }

  return createPortal(
    <div
      {...props}
      ref={ref}
      className={joinClassNames(
        'pd-overlay-root',
        className,
      )}
      data-backdrop={backdrop}
      style={rootStyle}
    >
      {backdrop === 'subtle' ? (
        <div
          aria-hidden="true"
          className="pd-overlay-root__scrim"
          onClick={onBackdropClick}
        />
      ) : null}
      <div className="pd-overlay-root__viewport">
        {children}
      </div>
    </div>,
    portalRoot,
  );
});
