export const typographyTokens = {
  families: {
    /**
     * Jedyny krój interfejsowy PapaData.
     *
     * Zastosowanie:
     * - nagłówki;
     * - tekst podstawowy;
     * - opisy;
     * - etykiety;
     * - nawigacja;
     * - formularze;
     * - przyciski;
     * - komunikaty.
     */
    sans: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'sans-serif',
    ].join(', '),

    /**
     * Jedyny krój danych technicznych PapaData.
     *
     * Zastosowanie:
     * - KPI;
     * - kwoty;
     * - procenty;
     * - cyfry tabularne;
     * - identyfikatory;
     * - kody;
     * - wartości techniczne.
     */
    mono: [
      '"JetBrains Mono"',
      'ui-monospace',
      'SFMono-Regular',
      'Consolas',
      'monospace',
    ].join(', '),
  },

  usage: {
    interface: 'Inter',
    data: 'JetBrains Mono',
  },

  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
  },

  sizes: {
    micro: '11px',
    caption: '12px',
    bodySmall: '13px',
    body: '14px',
    bodyLarge: '16px',
    section: '18px',
    metric: '24px',
    page: '32px',
    display: '40px',
  },

  lineHeights: {
    compact: 1.2,
    heading: 1.3,
    normal: 1.55,
    relaxed: 1.65,
  },

  letterSpacing: {
    display: '-0.035em',
    heading: '-0.02em',
    normal: '0',
    data: '-0.015em',
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
    'Inter',
    'JetBrains Mono',
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
