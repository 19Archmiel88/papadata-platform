import type {
  PapaDataIconName,
} from '../../design-system';

export const helpSections = [
  {
    icon: 'help',
    id: 'kb',
    navLabel: 'Baza wiedzy',
    title: 'Baza Wiedzy & Procedury',
  },
  {
    icon: 'security',
    id: 'truth',
    navLabel: 'Truth Engine',
    title: 'Product Truth Engine',
  },
  {
    icon: 'data',
    id: 'context',
    navLabel: 'Kontekst',
    title: 'Context Pack & Eskalacja',
  },
  {
    icon: 'trend',
    id: 'domain',
    navLabel: 'Roadmapa',
    title: 'Podział Domenowy & Roadmapa',
  },
] as const satisfies readonly {
  readonly icon: PapaDataIconName;
  readonly id: string;
  readonly navLabel: string;
  readonly title: string;
}[];

export type HelpSectionId = typeof helpSections[number]['id'];

export const helpSectionsById = helpSections.reduce((accumulator, section) => {
  accumulator[section.id] = section;
  return accumulator;
}, {} as Record<HelpSectionId, typeof helpSections[number]>);
