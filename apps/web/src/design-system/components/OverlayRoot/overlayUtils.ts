import type {
  MutableRefObject,
  Ref,
} from 'react';
import {
  useEffect,
  useState,
} from 'react';

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

function isHtmlElement(
  value: unknown,
): value is HTMLElement {
  return value instanceof HTMLElement;
}

export function getFocusableElements(
  root: HTMLElement | null,
) {
  if (!root) {
    return [];
  }

  return Array.from(
    root.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTOR,
    ),
  ).filter((element) => {
    if (element.hidden) {
      return false;
    }

    if (
      element.getAttribute('aria-hidden') === 'true'
    ) {
      return false;
    }

    return !element.hasAttribute('disabled');
  });
}

export function focusFirstElement(
  root: HTMLElement | null,
) {
  if (!root) {
    return false;
  }

  const autofocusTarget =
    root.querySelector<HTMLElement>(
      '[data-autofocus="true"]',
    );

  if (autofocusTarget) {
    autofocusTarget.focus();
    return true;
  }

  const firstFocusable =
    getFocusableElements(root)[0];

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

export function mergeRefs<T>(
  ...refs: Array<Ref<T> | undefined>
) {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(value);
        return;
      }

      (
        ref as MutableRefObject<T | null>
      ).current = value;
    });
  };
}

export function useOverlayFocusRestore(
  open: boolean,
  panelRef: MutableRefObject<HTMLElement | null>,
  modal: boolean,
) {
  useEffect(() => {
    if (
      !open
      || typeof document === 'undefined'
    ) {
      return;
    }

    const previousActiveElement =
      isHtmlElement(document.activeElement)
        ? document.activeElement
        : null;

    const frame = window.requestAnimationFrame(() => {
      focusFirstElement(panelRef.current);
    });

    const handleFocusIn = (event: FocusEvent) => {
      if (
        !modal
        || !panelRef.current
        || panelRef.current.contains(
          event.target as Node,
        )
      ) {
        return;
      }

      focusFirstElement(panelRef.current);
    };

    if (modal) {
      document.addEventListener(
        'focusin',
        handleFocusIn,
      );
    }

    return () => {
      window.cancelAnimationFrame(frame);

      if (modal) {
        document.removeEventListener(
          'focusin',
          handleFocusIn,
        );
      }

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
    modal,
    open,
    panelRef,
  ]);
}

export function useOverlayPortal(
  enabled: boolean,
  hostId = 'pd-overlay-root-host',
) {
  const [portalRoot, setPortalRoot] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    if (
      !enabled
      || typeof document === 'undefined'
    ) {
      setPortalRoot(null);
      return;
    }

    let root =
      document.getElementById(hostId);

    if (!root) {
      root = document.createElement('div');
      root.id = hostId;
      root.setAttribute(
        'data-pd-overlay-host',
        'true',
      );
      document.body.appendChild(root);
    }

    setPortalRoot(root);

    return () => {
      setPortalRoot(null);
    };
  }, [
    enabled,
    hostId,
  ]);

  return portalRoot;
}
