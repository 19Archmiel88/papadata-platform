export const motionTokens = {
  duration: {
    instant: '80ms',
    fast: '140ms',
    standard: '200ms',
    deliberate: '280ms',
  },

  easing: {
    standard:
      'cubic-bezier(0.2, 0, 0, 1)',
    emphasized:
      'cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;
