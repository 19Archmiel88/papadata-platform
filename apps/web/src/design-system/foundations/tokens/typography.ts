export const typographyTokens = {
  families: {
    sans: 'var(--pd-font-sans)',
    mono: 'var(--pd-font-mono)',
  },

  usage: {
    interface: 'Inter',
    data: 'JetBrains Mono',
  },

  weights: {
    regular: 'var(--pd-font-weight-regular)',
    medium: 'var(--pd-font-weight-medium)',
    semibold: 'var(--pd-font-weight-semibold)',
  },

  sizes: {
    micro: 'var(--pd-type-size-micro)',
    caption: 'var(--pd-type-size-caption)',
    bodySmall: 'var(--pd-type-size-body-small)',
    body: 'var(--pd-type-size-body)',
    bodyLarge: 'var(--pd-type-size-body-large)',
    section: 'var(--pd-type-size-section)',
    metric: 'var(--pd-type-size-metric)',
    page: 'var(--pd-type-size-page)',
    display: 'var(--pd-type-size-display)',
    pageMobile: 'var(--pd-type-size-page-mobile)',
    displayMobile: 'var(--pd-type-size-display-mobile)',
  },

  lineHeights: {
    compact: 'var(--pd-line-height-compact)',
    heading: 'var(--pd-line-height-heading)',
    pageMobile: 'var(--pd-line-height-page-mobile)',
    displayMobile: 'var(--pd-line-height-display-mobile)',
    normal: 'var(--pd-line-height-normal)',
    relaxed: 'var(--pd-line-height-relaxed)',
  },

  letterSpacing: {
    display: 'var(--pd-letter-spacing)',
    heading: 'var(--pd-letter-spacing)',
    normal: 'var(--pd-letter-spacing)',
    data: 'var(--pd-letter-spacing)',
  },

  numeric: {
    variant: 'tabular-nums lining-nums',
  },
} as const;

export const typographyContract = {
  interfaceFont: 'Inter',
  dataFont: 'JetBrains Mono',

  allowedFontFamilies: [
    'Inter',
    'JetBrains Mono',
  ],

  forbiddenFontFamilies: [
  ],

  rules: {
    headingsUseInterfaceFont: true,
    bodyUsesInterfaceFont: true,
    navigationUsesInterfaceFont: true,
    formsUseInterfaceFont: true,
    buttonsUseInterfaceFont: true,

    metricsMayUseDataFont: true,
    identifiersUseDataFont: true,
    technicalValuesUseDataFont: true,

    ordinaryDescriptionsUseDataFont: false,
    navigationUsesDataFont: false,
    buttonsUseDataFont: false,
  },
} as const;

export type PapaDataInterfaceFont =
  typeof typographyContract.interfaceFont;

export type PapaDataDataFont =
  typeof typographyContract.dataFont;
