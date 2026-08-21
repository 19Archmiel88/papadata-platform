import type {
  AnalyticsScreenId,
} from '../../screens/analytics/analyticsModuleData';

export type AnalyticsModuleStorybookMeta = {
  readonly documentPath: string;
};

/**
 * documentPath only ever mattered to Storybook (ProductionStoryShell's
 * doc-link header) -- it used to live on AnalyticsScreenDefinition itself,
 * which meant every production screen bundle shipped this doc metadata for
 * no runtime reason. Keyed on the same AnalyticsScreenId rather than
 * duplicating a second screens list. Mirrors the businessScreenStorybookMeta
 * pattern used for the Command Center screens.
 */
export const analyticsModuleStorybookMeta: Readonly<
  Record<AnalyticsScreenId, AnalyticsModuleStorybookMeta>
> = {
  '31.01': { documentPath: '08-kampanie-platne/31-01-przeglad.md' },
  '31.02': { documentPath: '08-kampanie-platne/31-02-lista-kampanii.md' },
  '31.03': { documentPath: '08-kampanie-platne/31-03-szczegoly-kampanii.md' },
  '31.04': { documentPath: '08-kampanie-platne/31-04-atrybucja-i-sprzedaz.md' },
  '31.05': { documentPath: '08-kampanie-platne/31-05-budzet.md' },
  '31.06': { documentPath: '08-kampanie-platne/31-06-diagnostyka.md' },
  '31.07': { documentPath: '08-kampanie-platne/31-07-rekomendacje-kontekst-domenowy.md' },
  '31.08': { documentPath: '08-kampanie-platne/31-08-warianty-kampanii.md' },
  '32.01': { documentPath: '09-zamowienia/32-01-przeglad.md' },
  '32.02': { documentPath: '09-zamowienia/32-02-lista.md' },
  '32.03': { documentPath: '09-zamowienia/32-03-szczegoly.md' },
  '32.04': { documentPath: '09-zamowienia/32-04-os-zdarzen.md' },
  '32.05': { documentPath: '09-zamowienia/32-05-porownanie-zrodel.md' },
  '32.06': { documentPath: '09-zamowienia/32-06-rekoncyliacja-skrot.md' },
  '32.07': { documentPath: '09-zamowienia/32-07-eksport.md' },
  '32.08': { documentPath: '09-zamowienia/32-08-warianty-zamowien.md' },
  '33.01': { documentPath: '10-produkty/33-01-przeglad.md' },
  '33.02': { documentPath: '10-produkty/33-02-katalog.md' },
  '33.03': { documentPath: '10-produkty/33-03-szczegoly.md' },
  '33.04': { documentPath: '10-produkty/33-04-mapowanie.md' },
  '33.05': { documentPath: '10-produkty/33-05-oferty.md' },
  '33.06': { documentPath: '10-produkty/33-06-wydajnosc.md' },
  '33.07': { documentPath: '10-produkty/33-07-kolejka-brakow.md' },
  '33.08': { documentPath: '10-produkty/33-08-analiza-wplywu.md' },
  '33.09': { documentPath: '10-produkty/33-09-warianty-produktow.md' },
  '34.01': { documentPath: '11-klienci/34-01-przeglad.md' },
  '34.02': { documentPath: '11-klienci/34-02-segmenty.md' },
  '34.03': { documentPath: '11-klienci/34-03-kohorty.md' },
  '34.04': { documentPath: '11-klienci/34-04-szczegoly-pseudonimizowane.md' },
  '34.05': { documentPath: '11-klienci/34-05-konflikty-tozsamosci.md' },
  '34.06': { documentPath: '11-klienci/34-06-prywatnosc.md' },
  '34.07': { documentPath: '11-klienci/34-07-analiza-wplywu.md' },
  '34.08': { documentPath: '11-klienci/34-08-warianty-klientow.md' },
  '35.01': { documentPath: '12-ruch-i-lejek/35-01-przeglad-ruchu.md' },
  '35.02': { documentPath: '12-ruch-i-lejek/35-02-kanaly.md' },
  '35.03': { documentPath: '12-ruch-i-lejek/35-03-lejek-widok.md' },
  '35.04': { documentPath: '12-ruch-i-lejek/35-04-lejek-szczegoly-kroku.md' },
  '35.05': { documentPath: '12-ruch-i-lejek/35-05-definicje-lejka.md' },
  '35.06': { documentPath: '12-ruch-i-lejek/35-06-ga4-vs-zamowienia.md' },
  '35.07': { documentPath: '12-ruch-i-lejek/35-07-jakosc-zdarzen.md' },
  '35.08': { documentPath: '12-ruch-i-lejek/35-08-strony-wejscia.md' },
  '35.09': { documentPath: '12-ruch-i-lejek/35-09-warianty-ruchu.md' },
};
