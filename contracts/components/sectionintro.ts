import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface SectionIntroProps extends BaseComponentProps {
  eyebrow: string | null;
  title: string;
  description: string;
  actionId: string | null;
}

export type SectionIntroEvent = ComponentEvent<{ type: 'sectionintro'; value?: string | number | boolean | null }>;
