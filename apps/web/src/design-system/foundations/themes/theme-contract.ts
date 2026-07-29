export const papaDataThemes = [
  'light',
  'dark',
] as const;

export type PapaDataTheme =
  typeof papaDataThemes[number];

export const defaultPapaDataTheme:
  PapaDataTheme = 'light';
