import type {
  BusinessScreenId,
} from '../../screens/business/businessData';

export type BusinessScreenStorybookMeta = {
  readonly documentPath: string;
  readonly storyName: string;
};

/**
 * documentPath/storyName only ever mattered to Storybook (ProductionStoryShell's
 * doc-link header, and this catalog's story titles) -- they used to live on
 * BusinessScreenDefinition itself, which meant every production screen bundle
 * shipped this doc/story metadata for no runtime reason. Keyed on the same
 * BusinessScreenId rather than duplicating a second screens list.
 */
export const businessScreenStorybookMeta: Readonly<
  Record<BusinessScreenId, BusinessScreenStorybookMeta>
> = {
  '30.01': {
    documentPath: '07-centrum-dowodzenia/30-01-widok-glowny.md',
    storyName: '30.01 Widok główny',
  },
  '30.02': {
    documentPath: '07-centrum-dowodzenia/30-02-kolejka-uwagi.md',
    storyName: '30.02 Kolejka uwagi',
  },
  '30.03': {
    documentPath: '07-centrum-dowodzenia/30-03-kpi.md',
    storyName: '30.03 KPI',
  },
  '30.04': {
    documentPath: '07-centrum-dowodzenia/30-04-plan-vs-wynik.md',
    storyName: '30.04 Plan vs wynik',
  },
  '30.05': {
    documentPath: '07-centrum-dowodzenia/30-05-drivery-wyniku.md',
    storyName: '30.05 Drivery wyniku',
  },
  '30.06': {
    documentPath: '07-centrum-dowodzenia/30-06-zrodla-sprzedazy.md',
    storyName: '30.06 Źródła sprzedaży',
  },
  '30.07': {
    documentPath: '07-centrum-dowodzenia/30-07-ruch.md',
    storyName: '30.07 Ruch',
  },
  '30.08': {
    documentPath: '07-centrum-dowodzenia/30-08-produkty.md',
    storyName: '30.08 Produkty',
  },
  '30.09': {
    documentPath: '07-centrum-dowodzenia/30-09-klienci.md',
    storyName: '30.09 Klienci',
  },
  '30.10': {
    documentPath: '07-centrum-dowodzenia/30-10-lejek.md',
    storyName: '30.10 Lejek',
  },
  '30.11': {
    documentPath: '07-centrum-dowodzenia/30-11-rekomendacje-ai-skrot.md',
    storyName: '30.11 Rekomendacje AI',
  },
  '30.12': {
    documentPath: '07-centrum-dowodzenia/30-12-sygnaly-sprzedazowe.md',
    storyName: '30.12 Sygnały sprzedażowe',
  },
  '30.13': {
    documentPath: '07-centrum-dowodzenia/30-13-waterfall.md',
    storyName: '30.13 Waterfall',
  },
  '30.14': {
    documentPath: '07-centrum-dowodzenia/30-14-warianty-centrum-dowodzenia.md',
    storyName: '30.14 Analiza wariantów',
  },
  '31.01': {
    documentPath: '08-kampanie-platne/31-01-przeglad.md',
    storyName: '31.01 Przegląd',
  },
  '31.02': {
    documentPath: '08-kampanie-platne/31-02-lista-kampanii.md',
    storyName: '31.02 Lista kampanii',
  },
  '31.03': {
    documentPath: '08-kampanie-platne/31-03-szczegoly-kampanii.md',
    storyName: '31.03 Szczegóły kampanii',
  },
  '31.04': {
    documentPath: '08-kampanie-platne/31-04-atrybucja-i-sprzedaz.md',
    storyName: '31.04 Atrybucja',
  },
  '31.05': {
    documentPath: '08-kampanie-platne/31-05-budzet.md',
    storyName: '31.05 Budżet',
  },
  '31.06': {
    documentPath: '08-kampanie-platne/31-06-diagnostyka.md',
    storyName: '31.06 Diagnostyka',
  },
};
