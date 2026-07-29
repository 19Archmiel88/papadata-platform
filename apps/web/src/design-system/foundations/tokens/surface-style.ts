export const surfaceStyleTokens = {
  radius: {
    none: '0px',
    subtle: '2px',
    small: '4px',
    control: '6px',
    surface: '8px',
    overlay: '12px',
    pill: '999px',
  },

  border: {
    width: {
      none: '0px',
      subtle: '1px',
      strong: '2px',
    },

    style: {
      solid: 'solid',
      dashed: 'dashed',
    },

    role: {
      separator: 'var(--pd-border-subtle)',
      default: 'var(--pd-border-main)',
      strong: 'var(--pd-border-strong)',
      focus: 'var(--pd-brand-blue)',
      premium: 'var(--pd-brand-gold-border)',
    },
  },

  shadow: {
    none: 'none',

    popover:
      '0 8px 24px rgba(15, 23, 42, 0.14)',

    overlay:
      '0 14px 36px rgba(15, 23, 42, 0.18)',

    dialog:
      '0 24px 64px rgba(15, 23, 42, 0.22)',
  },

  focus: {
    floorHeight: '2px',
    floorInset: '4px',
    line: 'var(--pd-focus-line)',
  },
} as const;

export const surfaceStyleContract = {
  allowedRadiusValues: [
    0,
    2,
    4,
    6,
    8,
    12,
    999,
  ],

  borderWidths: [
    0,
    1,
    2,
  ],

  elevatedSurfaceTypes: [
    'popover',
    'dropdown',
    'tooltip',
    'drawer',
    'dialog',
    'floatingAssistant',
  ],

  rules: {
    ordinarySectionsUseShadow: false,
    ordinaryCardsUseShadow: false,
    internalElementsUseShadow: false,
    overlaysMayUseShadow: true,
    focusFloorIsRequired: true,
    radiusDependsOnComponentRole: true,
    bordersSupportHierarchy: true,
    excessiveRoundingIsForbidden: true,
  },
} as const;

export type SurfaceRadiusName =
  keyof typeof surfaceStyleTokens.radius;

export type SurfaceShadowName =
  keyof typeof surfaceStyleTokens.shadow;

export type SurfaceBorderWidthName =
  keyof typeof surfaceStyleTokens.border.width;
