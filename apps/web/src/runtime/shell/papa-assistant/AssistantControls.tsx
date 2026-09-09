import { useEffect, useRef, type ReactNode } from 'react';

const paths = {
  plus: 'M12 5v14M5 12h14',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  chevron: 'm8 10 4 4 4-4',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  send: 'M12 19V5m-6 6 6-6 6 6',
  expand: 'M14 4h6v6M20 4l-7 7M10 20H4v-6m0 6 7-7',
  pin: 'm9 3 6 0-1 6 4 4v2H6v-2l4-4-1-6Zm3 12v6',
  close: 'm6 6 12 12M6 18 18 6',
  stop: 'M7 7h10v10H7Z',
  history: 'M3 11a9 9 0 1 1 2.7 7.4M3 5v6h6m3-4v5l3 2',
} as const;

export function AssistantControlIcon({ name }: { readonly name: keyof typeof paths }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === 'more' ? 3.5 : 1.7} strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}

/** A native disclosure keeps its controls inside the drawer's focus boundary. */
export function AssistantDisclosure({ label, children, iconOnly = false, active = false }: {
  readonly label: string; readonly children: ReactNode; readonly iconOnly?: boolean; readonly active?: boolean;
}) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (disclosure.current && !disclosure.current.contains(event.target as Node)) disclosure.current.open = false;
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);

  return <details ref={disclosure} className="pd-assistant__disclosure" onBlur={event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) event.currentTarget.open = false;
  }} onKeyDown={event => {
    if (event.key === 'Escape' && event.currentTarget.open) {
      event.preventDefault(); event.stopPropagation(); event.currentTarget.open = false;
      event.currentTarget.querySelector('summary')?.focus();
    }
  }}>
    <summary className={iconOnly ? 'pd-assistant__icon-button' : 'pd-assistant__tools-trigger'} aria-label={iconOnly ? label : undefined} title={iconOnly ? label : undefined} data-active={active || undefined}>
      {iconOnly ? <AssistantControlIcon name="more" /> : <>{label}<AssistantControlIcon name="chevron" /></>}
    </summary>
    <div className="pd-assistant__disclosure-panel" onClick={event => {
      if ((event.target as HTMLElement).closest('button') && disclosure.current) {
        disclosure.current.open = false;
        disclosure.current.querySelector('summary')?.focus();
      }
    }}>{children}</div>
  </details>;
}
