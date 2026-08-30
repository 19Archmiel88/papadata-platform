import type {
  DataQualityScreenId,
} from '../runtime/screens/data-quality/dataQualityData';

export type DataQualityScreenStorybookMeta = {
  readonly documentPath: string;
};

/**
 * documentPath only ever mattered to Storybook (ProductionStoryShell's
 * doc-link header) -- it used to live on DataQualityScreenDefinition itself,
 * which meant every production screen bundle shipped this doc metadata for
 * no runtime reason. Keyed on the same DataQualityScreenId rather than
 * duplicating a second screens list. Mirrors the businessScreenStorybookMeta
 * pattern used for the Command Center screens.
 */
export const dataQualityScreenStorybookMeta: Readonly<
  Record<DataQualityScreenId, DataQualityScreenStorybookMeta>
> = {
  '41.01': { documentPath: '14-jakosc-danych-i-integralnosc/41-01-centrum-jakosci.md' },
  '41.02': { documentPath: '14-jakosc-danych-i-integralnosc/41-02-zbior-danych.md' },
  '41.03': { documentPath: '14-jakosc-danych-i-integralnosc/41-03-pochodzenie-danych.md' },
  '41.04': { documentPath: '14-jakosc-danych-i-integralnosc/41-04-nakladanie-zrodel.md' },
  '41.05': { documentPath: '14-jakosc-danych-i-integralnosc/41-05-nadrzednosc-zrodla.md' },
  '41.06': { documentPath: '14-jakosc-danych-i-integralnosc/41-06-konflikty.md' },
  '41.07': { documentPath: '14-jakosc-danych-i-integralnosc/41-07-przeglad-reczny.md' },
  '41.08': { documentPath: '14-jakosc-danych-i-integralnosc/41-08-ponowne-przetwarzanie.md' },
  '41.09': { documentPath: '14-jakosc-danych-i-integralnosc/41-09-rekoncyliacja.md' },
  '41.10': { documentPath: '14-jakosc-danych-i-integralnosc/41-10-warianty-jakosci-danych.md' },
};
