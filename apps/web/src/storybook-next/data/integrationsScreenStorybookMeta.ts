import type {
  IntegrationScreenId,
} from '../../screens/integrations/integrationsData';

export type IntegrationsScreenStorybookMeta = {
  readonly documentPath: string;
};

/**
 * documentPath only ever mattered to Storybook (ProductionStoryShell's
 * doc-link header) -- it used to live on IntegrationScreenDefinition itself,
 * which meant every production screen bundle shipped this doc metadata for
 * no runtime reason. Keyed on the same IntegrationScreenId rather than
 * duplicating a second screens list. Mirrors the businessScreenStorybookMeta
 * pattern used for the Command Center screens.
 */
export const integrationsScreenStorybookMeta: Readonly<
  Record<IntegrationScreenId, IntegrationsScreenStorybookMeta>
> = {
  '40.01': { documentPath: '13-integracje-i-synchronizacja/40-01-katalog-integracji.md' },
  '40.02': { documentPath: '13-integracje-i-synchronizacja/40-02-kreator-polaczenia.md' },
  '40.03': { documentPath: '13-integracje-i-synchronizacja/40-03-szczegoly-integracji.md' },
  '40.04': { documentPath: '13-integracje-i-synchronizacja/40-04-historia-synchronizacji.md' },
  '40.05': { documentPath: '13-integracje-i-synchronizacja/40-05-przebieg-synchronizacji.md' },
  '40.06': { documentPath: '13-integracje-i-synchronizacja/40-06-zakres-synchronizacji.md' },
  '40.07': { documentPath: '13-integracje-i-synchronizacja/40-07-ponowne-polaczenie.md' },
  '40.08': { documentPath: '13-integracje-i-synchronizacja/40-08-odlaczenie.md' },
  '40.09': { documentPath: '13-integracje-i-synchronizacja/40-09-awaria-providera.md' },
  '40.10': { documentPath: '13-integracje-i-synchronizacja/40-10-warianty-integracji.md' },
};
