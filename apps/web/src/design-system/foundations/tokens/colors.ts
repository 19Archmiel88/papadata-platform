import {
  papaDataRuntimeThemes,
} from '../runtime';

export const colorTokens = {
  brand: {
    deep: 'var(--pd-brand-deep)',
    main: 'var(--pd-brand)',
    strong: 'var(--pd-brand-strong)',
    highlight: 'var(--pd-brand-highlight)',
    accent: 'var(--pd-brand-accent)',
    line: 'var(--pd-brand-line)',
    ambient: 'var(--pd-brand-ambient)',
    onBrand: 'var(--pd-brand-on)',
    action: 'var(--pd-brand-action)',
    actionHover: 'var(--pd-brand-action-hover)',
    actionActive: 'var(--pd-brand-action-active)',
    actionOn: 'var(--pd-brand-action-on)',
    glow: 'var(--pd-brand-glow)',
  },

  semantic: {
    canvas: 'var(--pd-canvas)',
    surface: 'var(--pd-surface)',
    surfaceSubtle: 'var(--pd-surface-subtle)',
    surfaceRaised: 'var(--pd-surface-raised)',
    surfaceOverlay: 'var(--pd-surface-overlay)',
    surfaceActive: 'var(--pd-surface-active)',
    surfaceData: 'var(--pd-surface-data)',
    text: 'var(--pd-text)',
    textSecondary: 'var(--pd-text-secondary)',
    textMuted: 'var(--pd-text-muted)',
    separatorSubtle: 'var(--pd-separator-subtle)',
    separator: 'var(--pd-separator)',
    separatorStrong: 'var(--pd-separator-strong)',
    interactive: 'var(--pd-interactive)',
    interactiveHover: 'var(--pd-interactive-hover)',
    interactiveActive: 'var(--pd-interactive-active)',
    interactiveSubtle: 'var(--pd-interactive-subtle)',
    interactiveOn: 'var(--pd-interactive-on)',
    dataAccent: 'var(--pd-data-accent)',
    dataAccentHover: 'var(--pd-data-accent-hover)',
    dataAccentSubtle: 'var(--pd-data-accent-subtle)',
    dataSeries1: 'var(--pd-data-series-1)',
    dataSeries2: 'var(--pd-data-series-2)',
    dataSeries3: 'var(--pd-data-series-3)',
    dataSeries4: 'var(--pd-data-series-4)',
    dataSeries5: 'var(--pd-data-series-5)',
    dataSeries6: 'var(--pd-data-series-6)',
    dataActual: 'var(--pd-data-actual)',
    dataTarget: 'var(--pd-data-target)',
    dataForecast: 'var(--pd-data-forecast)',
    dataUncertainty: 'var(--pd-data-uncertainty)',
    dataPositive: 'var(--pd-data-positive)',
    dataNegative: 'var(--pd-data-negative)',
    dataNoData: 'var(--pd-data-no-data)',
    statusSuccess: 'var(--pd-status-success)',
    statusSuccessSubtle:
      'var(--pd-status-success-subtle)',
    statusWarning: 'var(--pd-status-warning)',
    statusWarningSubtle:
      'var(--pd-status-warning-subtle)',
    statusDanger: 'var(--pd-status-danger)',
    statusDangerSubtle:
      'var(--pd-status-danger-subtle)',
    statusNeutral: 'var(--pd-status-neutral)',
    statusNeutralSubtle:
      'var(--pd-status-neutral-subtle)',
    statusInfo: 'var(--pd-status-info)',
    statusInfoSubtle:
      'var(--pd-status-info-subtle)',
    focusVisible: 'var(--pd-focus-visible)',
    focusOnInteractive:
      'var(--pd-focus-on-interactive)',
    overlayScrim: 'var(--pd-overlay-scrim)',
    overlayScrimText: 'var(--pd-overlay-scrim-text)',
    overlayScrimTextMuted:
      'var(--pd-overlay-scrim-text-muted)',
    glassSurface: 'var(--pd-glass-surface)',
  },
} as const;

export const colorContract = {
  themes: papaDataRuntimeThemes,

  semanticRoles: Object.keys(
    colorTokens.semantic,
  ),

  brandRoles: Object.keys(colorTokens.brand),

  rules: {
    colorIsNeverTheOnlySignal: true,
    brandIsSeparateFromDataAndStatusSemantics: true,
    primaryActionsMayUseBrandFlow: true,
    neutralSurfacesRemainDominant: true,
    decorativeNeonIsForbidden: true,
    cssVariablesAreRuntimeSource: true,
  },
} as const;

export type PapaDataThemeName =
  typeof papaDataRuntimeThemes[number];

export type PapaDataSemanticColor =
  keyof typeof colorTokens.semantic;

export type PapaDataBrandColor =
  keyof typeof colorTokens.brand;
