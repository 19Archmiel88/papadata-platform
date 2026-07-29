export const colorTokens = {
  light: {
    canvas: '#F8FAFC',
    surfaceMain: '#FFFFFF',
    surfaceSection: '#F1F5F9',
    surfaceActive: '#E2E8F0',

    borderMain: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    borderStrong: '#CBD5E1',

    textMain: '#0F172A',
    textSecondary: '#475467',
    textMuted: '#64748B',
  },

  dark: {
    canvas: '#0B0D11',
    surfaceMain: '#11141A',
    surfaceSection: '#161A21',
    surfaceActive: '#1C212A',

    borderMain: '#2A303A',
    borderSubtle: '#20252D',
    borderStrong: '#3A424F',

    textMain: '#F1F3F5',
    textSecondary: '#9AA1AB',
    textMuted: '#7F8792',
  },

  accents: {
    brandBlueLight: '#3B66D9',
    brandBlueDark: '#4F7DF3',

    brandGoldLight: '#A36310',
    brandGoldDark: '#E0B75B',

    brandGoldSurfaceLight: '#FFF4DE',
    brandGoldSurfaceDark: '#241B0E',

    brandGoldBorderLight: '#D8B36A',
    brandGoldBorderDark: '#6F5525',

    tealLight: '#0D9488',
    tealDark: '#2AB7A9',

    lightBlueLight: '#2563EB',
    lightBlueDark: '#6FA8FF',

    aiLight: '#6366F1',
    aiDark: '#8B7BE8',
  },

  statuses: {
    light: {
      success: '#15803D',
      info: '#2563EB',
      warning: '#C25A1B',
      error: '#D9364F',
      critical: '#9F1239',
      processing: '#0F8F9D',
      pending: '#7C5CC4',
      partial: '#B7791F',
      disabled: '#64748B',
      noData: '#94A3B8',
    },

    dark: {
      success: '#45B982',
      info: '#6FA8FF',
      warning: '#E3944C',
      error: '#EE6A78',
      critical: '#FB7185',
      processing: '#36BEC8',
      pending: '#A894EA',
      partial: '#D5A84B',
      disabled: '#7F8792',
      noData: '#707986',
    },
  },

  data: {
    light: {
      actual: '#3B66D9',
      comparison: '#0D9488',
      aiForecast: '#6366F1',
      afterRecommendation: '#16A36A',
      anomaly: '#D9364F',
      noData: '#94A3B8',
    },

    dark: {
      actual: '#4F7DF3',
      comparison: '#2AB7A9',
      aiForecast: '#8B7BE8',
      afterRecommendation: '#48C78E',
      anomaly: '#EE6A78',
      noData: '#707986',
    },
  },
} as const;

export const colorContract = {
  themes: [
    'light',
    'dark',
  ],

  productAccents: [
    'brandBlue',
    'brandGold',
    'teal',
    'ai',
  ],

  operationalStatuses: [
    'success',
    'info',
    'warning',
    'error',
    'critical',
    'processing',
    'pending',
    'partial',
    'disabled',
    'noData',
  ],

  dataSeries: [
    'actual',
    'comparison',
    'aiForecast',
    'afterRecommendation',
    'anomaly',
    'noData',
  ],

  rules: {
    colorIsNeverTheOnlySignal: true,
    brandGoldIsNotWarning: true,
    aiUsesDedicatedColor: true,
    warningUsesOrange: true,
    statusMeaningIsGlobal: true,
    neutralSurfacesRemainDominant: true,
    decorativeNeonIsForbidden: true,
  },
} as const;

export type PapaDataThemeName =
  | 'light'
  | 'dark';

export type PapaDataStatusColor =
  keyof typeof colorTokens.statuses.light;

export type PapaDataDataColor =
  keyof typeof colorTokens.data.light;
