import { usePrefersReducedMotion } from './useChartMotion';

/**
 * Framer Motion needs numeric duration/easing, so these restate the CSS
 * token families --pd-motion-duration-* and --pd-motion-easing-* the same way
 * chartMotionDurationMs restates --pd-motion-duration-deliberate for
 * Recharts — a single, deliberate concession, not a second source of truth
 * to maintain by hand across every component.
 */
export const overlayTransition = { duration: 0.22, ease: [0.16, 1, 0.3, 1] } as const;
export const tabPanelTransition = { duration: 0.18, ease: [0.2, 0, 0, 1] } as const;
export const cardHoverTransition = { duration: 0.18, ease: [0.2, 0, 0, 1] } as const;

export type MotionPresets = {
  readonly overlay: typeof overlayTransition | { readonly duration: 0 };
  readonly tabPanel: typeof tabPanelTransition | { readonly duration: 0 };
  readonly cardHover: typeof cardHoverTransition | { readonly duration: 0 };
  readonly reduced: boolean;
};

/** Framer Motion transition presets shared across Papa Lab/Chat surfaces. */
export function useMotionPresets(): MotionPresets {
  const reduced = usePrefersReducedMotion();

  return {
    overlay: reduced ? { duration: 0 } : overlayTransition,
    tabPanel: reduced ? { duration: 0 } : tabPanelTransition,
    cardHover: reduced ? { duration: 0 } : cardHoverTransition,
    reduced,
  };
}
