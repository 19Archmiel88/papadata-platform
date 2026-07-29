export const spacingTokens = {
  /**
   * Wszystkie odstępy produktu wynikają
   * z bazowej jednostki 4 px.
   */
  unit: 4,

  space: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },

  semantic: {
    inlineTight: '4px',
    inline: '8px',
    control: '12px',
    group: '16px',
    block: '24px',
    section: '48px',
    page: '64px',
  },

  layout: {
    contentMaxWidth: '1180px',

    pagePadding: {
      desktop: '48px',
      tablet: '32px',
      mobile: '16px',
    },

    grid: {
      desktop: {
        columns: 12,
        gap: '24px',
      },

      tablet: {
        columns: 8,
        gap: '20px',
      },

      mobile: {
        columns: 4,
        gap: '16px',
      },
    },

    breakpoints: {
      mobile: '390px',
      tablet: '834px',
      desktop: '1440px',
      wide: '1920px',
    },
  },

  density: {
    comfortable: {
      controlHeight: '40px',
      tableRowHeight: '48px',
      sectionGap: '48px',
    },

    compact: {
      controlHeight: '32px',
      tableRowHeight: '40px',
      sectionGap: '40px',
    },
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
  keyof typeof spacingTokens.density;
