import { useSyncExternalStore } from 'react';
import {
  formatPapaDataCurrency,
  formatPapaDataNumber,
  papaDataRuntimePreferenceChangeEvent,
} from '../../design-system/foundations';

function read(): 'pl' | 'en' {
  return typeof document !== 'undefined' && document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}
// Non-hook locale read for plain (non-component) formatting helpers that can't call useProductLocale.
// Reads the same source as the hook, just without the useSyncExternalStore subscription.
export const readProductLocale = read;
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
  const locale = language.startsWith('en') ? 'en' : 'pl';
  if (/^[A-Z]{3}$/.test(value.currency) && value.currency !== 'XXX') {
    return formatPapaDataCurrency(value.amount, locale, value.currency);
  }
  return `${formatPapaDataNumber(value.amount, locale)} (${value.currency || '?'})`;
}
