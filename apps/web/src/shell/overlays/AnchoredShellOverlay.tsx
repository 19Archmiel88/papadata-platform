import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
} from 'react';
import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import {
  OverlayRoot,
} from '../../design-system';
import './anchored-shell-overlay.css';

export type AnchoredShellOverlayProps = {
  readonly align?: 'start' | 'end';
  readonly children: ReactNode;
  readonly className?: string;
  readonly description?: string | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly title: string;
  readonly trigger: ReactElement;
  readonly width?: 'medium' | 'wide';
};

export function AnchoredShellOverlay({
  align = 'end',
  children,
  className,
  description = null,
  onOpenChange,
  open,
  title,
  trigger,
  width = 'medium',
}: AnchoredShellOverlayProps) {
  const panelId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ left: 16, right: 16, top: 72 });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof window === 'undefined') return;
    const rect = anchor.getBoundingClientRect();
    setPosition({
      left: Math.max(12, rect.left),
      right: Math.max(12, window.innerWidth - rect.right),
      top: Math.max(12, rect.bottom + 10),
    });
  }, []);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;

    updatePosition();
    const previousActive = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const frame = window.requestAnimationFrame(() => {
      const autofocus = panelRef.current?.querySelector<HTMLElement>('[data-autofocus="true"]');
      const first = panelRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      (autofocus ?? first ?? panelRef.current)?.focus();
    });

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target)
        || anchorRef.current?.contains(target)
      ) {
        return;
      }
      onOpenChange(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      onOpenChange(false);
    }

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown, true);
      if (previousActive?.isConnected) {
        window.requestAnimationFrame(() => previousActive.focus());
      }
    };
  }, [onOpenChange, open, updatePosition]);

  const triggerProps = trigger.props as {
    readonly onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
  };
  const originalOnClick = triggerProps.onClick;
  const triggerElement = cloneElement(
    trigger as ReactElement<Record<string, unknown>>,
    {
      'aria-controls': open ? panelId : undefined,
      'aria-expanded': open,
      'aria-haspopup': 'dialog',
      onClick: (event: ReactMouseEvent<HTMLElement>) => {
        originalOnClick?.(event);
        if (!event.defaultPrevented) onOpenChange(!open);
      },
    },
  );

  const style = {
    '--pd-shell-overlay-left': `${position.left}px`,
    '--pd-shell-overlay-right': `${position.right}px`,
    '--pd-shell-overlay-top': `${position.top}px`,
  } as CSSProperties;

  return (
    <>
      <span className="pd-shell-anchored-overlay__trigger" ref={anchorRef}>
        {triggerElement}
      </span>

      <OverlayRoot
        backdrop="none"
        className="pd-shell-anchored-overlay-root"
        open={open}
        zIndex={30}
      >
        <section
          aria-describedby={description ? descriptionId : undefined}
          aria-labelledby={titleId}
          className={`pd-shell-anchored-overlay ${className ?? ''}`.trim()}
          data-align={align}
          data-width={width}
          id={panelId}
          ref={panelRef}
          role="dialog"
          style={style}
          tabIndex={-1}
        >
          <header className="pd-shell-anchored-overlay__header">
            <div>
              <h2 id={titleId}>{title}</h2>
              {description ? <p id={descriptionId}>{description}</p> : null}
            </div>
            <button
              aria-label="Zamknij"
              className="pd-shell-anchored-overlay__close"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              ×
            </button>
          </header>
          <div className="pd-shell-anchored-overlay__body">
            {children}
          </div>
        </section>
      </OverlayRoot>
    </>
  );
}
