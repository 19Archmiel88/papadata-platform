import { useSyncExternalStore } from 'react';

const navigationEvent = 'papadata:navigation';

export function navigate(
  to: string,
  options: {
    readonly replace?: boolean;
  } = {},
): void {
  const url = new URL(to, window.location.origin);
  if (url.origin !== window.location.origin) {
    throw new Error('Application navigation must stay on the current origin.');
  }

  if (options.replace) {
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  } else {
    window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  window.dispatchEvent(new Event(navigationEvent));
}

export function useLocationPath(): string {
  return useSyncExternalStore(
    subscribe,
    snapshot,
    () => '/',
  );
}

export function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/app';
  const url = new URL(value, window.location.origin);
  return url.origin === window.location.origin
    ? `${url.pathname}${url.search}${url.hash}`
    : '/app';
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  window.addEventListener(navigationEvent, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(navigationEvent, onChange);
  };
}

function snapshot(): string {
  return `${window.location.pathname}${window.location.search}`;
}
