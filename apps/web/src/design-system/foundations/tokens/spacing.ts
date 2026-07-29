import {
  papaDataRuntimeDensities,
} from '../runtime';

export const spacingTokens = {
  space: {
    0: 'var(--pd-space-0)',
    1: 'var(--pd-space-1)',
    2: 'var(--pd-space-2)',
    3: 'var(--pd-space-3)',
    4: 'var(--pd-space-4)',
    5: 'var(--pd-space-5)',
    6: 'var(--pd-space-6)',
    8: 'var(--pd-space-8)',
    10: 'var(--pd-space-10)',
    12: 'var(--pd-space-12)',
    16: 'var(--pd-space-16)',
    20: 'var(--pd-space-20)',
    24: 'var(--pd-space-24)',
  },

  semantic: {
    inlineTight: 'var(--pd-space-1)',
    inline: 'var(--pd-space-2)',
    control: 'var(--pd-space-3)',
    group: 'var(--pd-space-4)',
    block: 'var(--pd-space-6)',
    section: 'var(--pd-density-section-gap)',
    page: 'var(--pd-layout-page-padding)',
  },

  layout: {
    contentMaxWidth:
      'var(--pd-layout-content-max-width)',
    pagePadding: 'var(--pd-layout-page-padding)',

    breakpoints: {
      mobile: '390px',
      tablet: '834px',
      desktop: '1440px',
      wide: '1920px',
    },
  },

  density: {
    modes: papaDataRuntimeDensities,
    controlHeight:
      'var(--pd-density-control-height)',
    rowHeight: 'var(--pd-density-row-height)',
    surfacePadding:
      'var(--pd-density-surface-padding)',
    sectionGap: 'var(--pd-density-section-gap)',
    inlineGap: 'var(--pd-density-inline-gap)',
  },
} as const;

export const spacingContract = {
  baseUnit: 4,

  allowedScale: [
    0,
    4,
    8,
    12,
    16,
    20,
    24,
    32,
    40,
    48,
    64,
    80,
    96,
  ],

  responsiveColumns: {
    desktop: 12,
    tablet: 8,
    mobile: 4,
  },

  rules: {
    arbitrarySpacingIsForbidden: true,
    nestedCardSpacingIsForbidden: true,
    sectionsPreferWhitespace: true,
    separatorsSupportSpacing: true,
    responsiveLayoutIsRequired: true,
    contentUsesMaximumWidth: true,
  },
} as const;

export type SpacingTokenName =
  keyof typeof spacingTokens.space;

export type LayoutBreakpointName =
  keyof typeof spacingTokens.layout.breakpoints;

export type InterfaceDensity =
  typeof papaDataRuntimeDensities[number];
