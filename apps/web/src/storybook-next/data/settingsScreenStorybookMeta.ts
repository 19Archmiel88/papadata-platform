import type {
  SettingsScreenId,
} from '../../screens/settings/settingsData';

export type SettingsScreenStorybookMeta = {
  readonly documentPath: string;
};

/**
 * documentPath only ever mattered to Storybook (ProductionStoryShell's
 * doc-link header) -- it used to live on SettingsScreenDefinition itself,
 * which meant every production screen bundle shipped this doc metadata for
 * no runtime reason. Keyed on the same SettingsScreenId rather than
 * duplicating a second screens list. Mirrors the businessScreenStorybookMeta
 * pattern used for the Command Center screens.
 */
export const settingsScreenStorybookMeta: Readonly<
  Record<SettingsScreenId, SettingsScreenStorybookMeta>
> = {
  '60.01': { documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-01-organizacja.md' },
  '60.02': { documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-02-workspace.md' },
  '60.03': { documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-03-czlonkostwa.md' },
  '60.04': { documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-04-role-i-uprawnienia.md' },
  '60.05': { documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-05-bezpieczenstwo-konta.md' },
  '60.06': { documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-06-sesje.md' },
  '60.07': { documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-07-audyt.md' },
  '60.08': { documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-08-prywatnosc.md' },
  '60.09': { documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-09-dostep-wsparcia.md' },
  '60.10': { documentPath: '16-ustawienia-zespol-bezpieczenstwo/60-10-warianty-ustawien.md' },
};
