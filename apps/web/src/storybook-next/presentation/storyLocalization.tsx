import type {
  PapaDataRuntimeLocale,
} from '../../design-system/foundations';

export type LocalizedCopy = {
  readonly pl: string;
  readonly en: string;
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

export function readTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.dataset.theme === 'dark'
    ? 'dark'
    : 'light';
}

export function Localized({
  pl,
  en,
}: LocalizedCopy) {
  return <>{copy({ pl, en })}</>;
}
