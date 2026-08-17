import {
  useEffect,
  useState,
} from 'react';

/**
 * Chart transition length, mirroring `--pd-motion-duration-deliberate`.
 * Recharts needs a number, so the token value is restated here rather than
 * scattered as a magic literal across every chart component.
 */
export const chartMotionDurationMs = 240;

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }

  return window.matchMedia(reducedMotionQuery).matches;
}

/**
 * Live reduced-motion preference.
 *
 * CSS `@media (prefers-reduced-motion)` blocks have no effect on Recharts
 * animations — those are driven in JS — so charts have to read the preference
 * themselves.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(prefersReducedMotion);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const query = window.matchMedia(reducedMotionQuery);
    const sync = () => {
      setReduced(query.matches);
    };

    sync();
    query.addEventListener('change', sync);

    return () => {
      query.removeEventListener('change', sync);
    };
  }, []);

  return reduced;
}

export type ChartMotion = {
  readonly animationDuration: number;
  readonly isAnimationActive: boolean;
};

/** Animation props shared by every chart in the design system. */
export function useChartMotion(): ChartMotion {
  const reduced = usePrefersReducedMotion();

  return {
    animationDuration: reduced ? 0 : chartMotionDurationMs,
    isAnimationActive: !reduced,
  };
}
