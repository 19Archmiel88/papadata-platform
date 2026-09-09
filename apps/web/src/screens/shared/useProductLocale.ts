import { useSyncExternalStore } from 'react';
import { papaDataRuntimePreferenceChangeEvent } from '../../design-system/foundations';

function read(): 'pl' | 'en' {
  return typeof document !== 'undefined' && document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}
function subscribe(listener: () => void) {
  window.addEventListener(papaDataRuntimePreferenceChangeEvent, listener);
  window.addEventListener('storage', listener);
  return () => { window.removeEventListener(papaDataRuntimePreferenceChangeEvent, listener); window.removeEventListener('storage', listener); };
}
export function useProductLocale() {
  const locale = useSyncExternalStore(subscribe, read, () => 'pl' as const);
  return { locale, language: locale === 'en' ? 'en-US' : 'pl-PL', t: (pl: string, en: string) => locale === 'en' ? en : pl };
}
export function formatProductMoney(value: { readonly amount: number | null; readonly currency: string } | null | undefined, language = 'pl-PL'): string {
  if (!value || value.amount === null || !Number.isFinite(value.amount)) return '—';
  if (/^[A-Z]{3}$/.test(value.currency) && value.currency !== 'XXX') {
    return new Intl.NumberFormat(language, { style: 'currency', currency: value.currency, maximumFractionDigits: 2 }).format(value.amount);
  }
  return `${new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(value.amount)} (${value.currency || '?'})`;
}
