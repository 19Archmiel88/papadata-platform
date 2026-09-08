import { anchoredPosition, type AnchoredPlacement } from './anchoredPosition';
export type { AnchoredPlacement } from './anchoredPosition';
import type { CSSProperties, MutableRefObject, Ref } from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';

export type OverlayCloseReason =
  | 'backdrop'
  | 'close-button'
  | 'escape'
  | 'outside'
  | 'primary-action'
  | 'secondary-action'
  | 'trigger';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function isHtmlElement(value: unknown): value is HTMLElement {
  return value instanceof HTMLElement;
}

export function getFocusableElements(root: HTMLElement | null) {
  if (!root) {
    return [];
  }

  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
    if (element.hidden || !element.checkVisibility()) {
      return false;
    }

    if (element.getAttribute('aria-hidden') === 'true') {
      return false;
    }

    return !element.hasAttribute('disabled');
  });
}

export function focusFirstElement(root: HTMLElement | null) {
  if (!root) {
    return false;
  }

  const autofocusTarget = root.querySelector<HTMLElement>('[data-autofocus="true"]');

  if (autofocusTarget) {
    autofocusTarget.focus();
    return true;
  }

  const firstFocusable = getFocusableElements(root)[0];

  if (firstFocusable) {
    firstFocusable.focus();
    return true;
  }

  if (!root.hasAttribute('tabindex')) {
    root.tabIndex = -1;
  }

  root.focus();
  return true;
}

export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(value);
        return;
      }

      (ref as MutableRefObject<T | null>).current = value;
    });
  };
}

export function useOverlayFocusRestore(
  open: boolean,
  panelRef: MutableRefObject<HTMLElement | null>,
  modal: boolean,
) {
  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }

    const previousActiveElement = isHtmlElement(document.activeElement)
      ? document.activeElement
      : null;

    let frame = 0;
    const focusMountedPanel = () => {
      // OverlayRoot creates its portal in an effect. The first animation frame
      // can precede the panel's commit, so wait for the actual DOM node.
      if (!panelRef.current) {
        frame = window.requestAnimationFrame(focusMountedPanel);
        return;
      }
      focusFirstElement(panelRef.current);
    };
    frame = window.requestAnimationFrame(focusMountedPanel);

    const isTopModal = () => {
      const panels = Array.from(
        document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]'),
      ).filter((panel) => panel.checkVisibility());
      return panels.at(-1) === panelRef.current;
    };

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !isTopModal()) return;
      const elements = getFocusableElements(panelRef.current);
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) {
        event.preventDefault();
        focusFirstElement(panelRef.current);
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || !panelRef.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (
        !modal ||
        !panelRef.current ||
        !isTopModal() ||
        panelRef.current.contains(event.target as Node)
      ) {
        return;
      }

      focusFirstElement(panelRef.current);
    };

    if (modal) {
      document.addEventListener('keydown', handleTab);
      document.addEventListener('focusin', handleFocusIn);
    }

    return () => {
      window.cancelAnimationFrame(frame);

      if (modal) {
        document.removeEventListener('keydown', handleTab);
        document.removeEventListener('focusin', handleFocusIn);
      }

      if (previousActiveElement && previousActiveElement.isConnected) {
        window.requestAnimationFrame(() => {
          previousActiveElement.focus();
        });
      }
    };
  }, [modal, open, panelRef]);
}

export function useOverlayPortal(enabled: boolean, hostId = 'pd-overlay-root-host') {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      setPortalRoot(null);
      return;
    }

    let root = document.getElementById(hostId);

    if (!root) {
      root = document.createElement('div');
      root.id = hostId;
      root.setAttribute('data-pd-overlay-host', 'true');
      document.body.appendChild(root);
    }

    setPortalRoot(root);

    return () => {
      setPortalRoot(null);
    };
  }, [enabled, hostId]);

  return portalRoot;
}

// Anchors a portaled panel to its trigger via getBoundingClientRect + a
// viewport-relative `position: fixed` style -- needed because these panels
// are rendered at document.body (see useOverlayPortal) to escape any
// ancestor with overflow:hidden/auto (product shell scroll locks, table
// cell text-truncation wrappers, etc.), so plain CSS position:absolute
// relative to the trigger's own positioned parent is no longer available.
export function useAnchoredPosition(
  anchorRef: MutableRefObject<HTMLElement | null>,
  open: boolean,
  placement: AnchoredPlacement,
  panelRef: MutableRefObject<HTMLElement | null>,
  gap = 6,
): CSSProperties | null {
  const [style, setStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!open || typeof window === 'undefined') {
      setStyle(null);
      return undefined;
    }

    let frame = 0;
    const observer = new ResizeObserver(updatePosition);
    function updatePosition() {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;
      const position = anchoredPosition(
        anchor.getBoundingClientRect(),
        panel.getBoundingClientRect(),
        { width: window.innerWidth, height: window.innerHeight },
        placement,
        gap,
      );
      const next: CSSProperties = { position: 'fixed', overflowY: 'auto', ...position };
      setStyle((previous) =>
        previous &&
        Object.entries(next).every(([key, value]) => previous[key as keyof CSSProperties] === value)
          ? previous
          : next,
      );
    }

    // The portal host is created in an effect, so it may mount after this layout effect.
    function observeMountedPanel() {
      if (!anchorRef.current || !panelRef.current) {
        frame = window.requestAnimationFrame(observeMountedPanel);
        return;
      }
      observer.observe(anchorRef.current);
      observer.observe(panelRef.current);
      updatePosition();
    }
    observeMountedPanel();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [anchorRef, gap, open, placement, panelRef]);

  return style;
}
