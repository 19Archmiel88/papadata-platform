import type {
  PapaScreenId,
} from '../runtime/screens/papa/papaData';

export type PapaScreenStorybookMeta = {
  readonly documentPath: string;
};

/**
 * documentPath only ever mattered to Storybook (ProductionStoryShell's
 * doc-link header) -- it used to live on PapaScreenDefinition itself, which
 * meant every production screen bundle shipped this doc metadata for no
 * runtime reason. Keyed on the same PapaScreenId rather than duplicating a
 * second screens list. Mirrors the businessScreenStorybookMeta pattern used
 * for the Command Center screens.
 */
export const papaScreenStorybookMeta: Readonly<
  Record<PapaScreenId, PapaScreenStorybookMeta>
> = {
  '50.01': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-01-panel-kontekstowy-papa.md' },
  '50.02': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-02-assistantshell.md' },
  '50.03': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-03-tryby-pracy.md' },
  '50.04': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-04-context-basket.md' },
  '50.05': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-05-odpowiedz-papa.md' },
  '50.06': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-06-dowody.md' },
  '50.07': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-07-confidence.md' },
  '50.08': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-08-laboratorium-ai.md' },
  '50.09': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-09-obserwacje.md' },
  '50.10': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-10-rekomendacje-i-warianty.md' },
  '50.11': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-11-propozycje-ai.md' },
  '50.12': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-12-ai-action-approval.md' },
  '50.13': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-13-ai-actions.md' },
  '50.14': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-14-zablokowane-dzialania-ai.md' },
  '50.15': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-15-historia-i-pamiec-papa.md' },
  '50.16': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-16-ustawienia-ai-i-governance.md' },
  '50.17': { documentPath: '15-papa-asystent-i-laboratorium-ai/50-17-warianty-papa.md' },
};
