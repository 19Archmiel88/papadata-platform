export const surfaceStyleTokens = {
  radius: {
    none: 'var(--pd-radius-none)',
    subtle: 'var(--pd-radius-subtle)',
    small: 'var(--pd-radius-small)',
    control: 'var(--pd-radius-control)',
    surface: 'var(--pd-radius-surface)',
    overlay: 'var(--pd-radius-overlay)',
    pill: 'var(--pd-radius-pill)',
  },

  border: {
    width: {
      none: 'var(--pd-border-width-none)',
      subtle: 'var(--pd-border-width-subtle)',
      strong: 'var(--pd-border-width-strong)',
    },

    style: {
      solid: 'solid',
      dashed: 'dashed',
    },

    role: {
      separator: 'var(--pd-separator-subtle)',
      default: 'var(--pd-separator)',
      strong: 'var(--pd-separator-strong)',
      focus: 'var(--pd-focus-visible)',
      interactive: 'var(--pd-border-interactive)',
      danger: 'var(--pd-border-danger)',
    },
  },

  shadow: {
    none: 'var(--pd-shadow-none)',
    control: 'var(--pd-shadow-control)',
    raised: 'var(--pd-shadow-raised)',
    overlay: 'var(--pd-shadow-overlay)',
    floating: 'var(--pd-shadow-floating)',
  },

  focus: {
    width: 'var(--pd-focus-width)',
    offset: 'var(--pd-focus-offset)',
    ringSize: 'var(--pd-focus-ring-size)',
    line: 'var(--pd-focus-visible)',
    ring: 'var(--pd-focus-ring)',
    onInteractive: 'var(--pd-focus-on-interactive)',
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
    'raised',
    'overlay',
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
