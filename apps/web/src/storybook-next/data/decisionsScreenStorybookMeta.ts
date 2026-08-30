import type {
  DecisionsScreenId,
} from '../runtime/screens/decisions/decisionsData';

export type DecisionsScreenStorybookMeta = {
  readonly documentPath: string;
};

/**
 * documentPath only ever mattered to Storybook (ProductionStoryShell's
 * doc-link header) -- it used to live on DecisionsScreenDefinition itself,
 * which meant every production screen bundle shipped this doc metadata for
 * no runtime reason. Keyed on the same DecisionsScreenId rather than
 * duplicating a second screens list. Mirrors the businessScreenStorybookMeta
 * pattern used for the Command Center screens.
 */
export const decisionsScreenStorybookMeta: Readonly<
  Record<DecisionsScreenId, DecisionsScreenStorybookMeta>
> = {
  '80.01': { documentPath: '18-wsparcie-marketingowe-decyzje-dzialania/80-01-centrum-decyzji.md' },
  '80.02': { documentPath: '18-wsparcie-marketingowe-decyzje-dzialania/80-02-obserwacje.md' },
  '80.03': { documentPath: '18-wsparcie-marketingowe-decyzje-dzialania/80-03-rekomendacje.md' },
  '80.04': { documentPath: '18-wsparcie-marketingowe-decyzje-dzialania/80-04-rejestr-decyzji.md' },
  '80.05': { documentPath: '18-wsparcie-marketingowe-decyzje-dzialania/80-05-brief-dzialania.md' },
  '80.06': { documentPath: '18-wsparcie-marketingowe-decyzje-dzialania/80-06-szczegoly-dzialania.md' },
  '80.07': { documentPath: '18-wsparcie-marketingowe-decyzje-dzialania/80-07-pomiar.md' },
  '80.08': { documentPath: '18-wsparcie-marketingowe-decyzje-dzialania/80-08-biblioteka-dzialan.md' },
  '80.09': { documentPath: '18-wsparcie-marketingowe-decyzje-dzialania/80-09-powiazania-z-modulami-i-sprawami.md' },
  '80.10': { documentPath: '18-wsparcie-marketingowe-decyzje-dzialania/80-10-warianty-decyzji-i-dzialan.md' },
};
