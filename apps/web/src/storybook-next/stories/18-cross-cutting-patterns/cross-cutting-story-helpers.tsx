import type {
  PapaDataRuntimeLocale,
} from '../../../design-system/foundations/runtime';

export type LocalizedCopy = {
  readonly en: string;
  readonly pl: string;
};

export function readLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}

export function copy(value: LocalizedCopy) {
  return readLocale() === 'en' ? value.en : value.pl;
}

export function Localized({
  en,
  pl,
}: LocalizedCopy) {
  return <>{copy({ en, pl })}</>;
}
