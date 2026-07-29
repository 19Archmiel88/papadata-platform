import {
  papaDataRuntimeMotionModes,
} from '../runtime';

export const motionTokens = {
  modes: papaDataRuntimeMotionModes,

  duration: {
    instant: 'var(--pd-motion-duration-instant)',
    fast: 'var(--pd-motion-duration-fast)',
    standard:
      'var(--pd-motion-duration-standard)',
    deliberate:
      'var(--pd-motion-duration-deliberate)',
  },

  easing: {
    standard:
      'var(--pd-motion-easing-standard)',
    emphasized:
      'var(--pd-motion-easing-emphasized)',
  },

  distance: 'var(--pd-motion-distance)',
} as const;
