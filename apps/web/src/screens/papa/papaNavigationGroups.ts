import {
  papaScreenDefinitions,
} from './papaData';
import type {
  PapaScreenDefinition,
  PapaScreenVariant,
} from './papaData';

export type PapaNavigationGroupId =
  | 'conversation'
  | 'context-evidence'
  | 'laboratory'
  | 'ai-actions'
  | 'history-governance';

export type PapaNavigationGroup = {
  readonly id: PapaNavigationGroupId;
  readonly label: string;
  readonly memberVariants: readonly PapaScreenVariant[];
};

export const papaNavigationGroups: readonly PapaNavigationGroup[] = [
  {
    id: 'conversation',
    label: 'Rozmowa',
    memberVariants: [
      'context-panel',
      'assistant-shell',
      'answer',
      'observations',
    ],
  },
  {
    id: 'context-evidence',
    label: 'Kontekst i dowody',
    memberVariants: [
      'context-basket',
      'evidence',
    ],
  },
  {
    id: 'laboratory',
    label: 'Laboratorium',
    memberVariants: [
      'lab',
    ],
  },
  {
    id: 'ai-actions',
    label: 'Działania AI',
    memberVariants: [
      'proposals',
      'action-approval',
      'actions',
    ],
  },
  {
    id: 'history-governance',
    label: 'Historia i ustawienia',
    memberVariants: [
      'history-memory',
      'governance',
    ],
  },
] as const;

export function resolvePapaNavigationGroup(
  variant: PapaScreenVariant,
): PapaNavigationGroup {
  return papaNavigationGroups.find((group) => (
    group.memberVariants.includes(variant)
  )) ?? papaNavigationGroups[0];
}

export function isPapaConversationVariant(
  variant: PapaScreenVariant,
): boolean {
  return resolvePapaNavigationGroup(variant).id === 'conversation';
}

export function getPapaGroupNavigation(): readonly {
  readonly href: string;
  readonly id: PapaNavigationGroupId;
  readonly label: string;
}[] {
  return papaNavigationGroups.map((group) => {
    const primary = papaScreenDefinitions.find((definition) => (
      definition.variant === group.memberVariants[0]
    ));

    return {
      href: primary?.routeBase ?? '/app/papa/panel-kontekstowy-papa',
      id: group.id,
      label: group.label,
    };
  });
}

export function getPapaGroupMembers(
  groupId: PapaNavigationGroupId,
): readonly PapaScreenDefinition[] {
  const group = papaNavigationGroups.find((item) => item.id === groupId);

  if (!group) {
    return [];
  }

  return papaScreenDefinitions.filter((definition) => (
    group.memberVariants.includes(definition.variant)
    && definition.routeBase !== null
  ));
}
