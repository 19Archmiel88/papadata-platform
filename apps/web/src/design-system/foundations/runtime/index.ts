export const papaDataRuntimeThemes = [
  'light',
  'dark',
] as const;

export const papaDataRuntimeLocales = [
  'pl',
  'en',
] as const;

export const papaDataRuntimeDensities = [
  'comfortable',
  'compact',
] as const;

export const papaDataRuntimeMotionModes = [
  'full',
  'reduced',
] as const;

export type PapaDataRuntimeTheme =
  typeof papaDataRuntimeThemes[number];

export type PapaDataRuntimeLocale =
  typeof papaDataRuntimeLocales[number];

export type PapaDataRuntimeDensity =
  typeof papaDataRuntimeDensities[number];

export type PapaDataRuntimeMotion =
  typeof papaDataRuntimeMotionModes[number];

export type PapaDataRuntimeGlobals = {
  readonly theme: PapaDataRuntimeTheme;
  readonly locale: PapaDataRuntimeLocale;
  readonly density: PapaDataRuntimeDensity;
  readonly motion: PapaDataRuntimeMotion;
};

export type PapaDataRuntimeGlobalsInput = Partial<
  Record<keyof PapaDataRuntimeGlobals, unknown>
>;

export const defaultPapaDataRuntimeGlobals =
  {
    theme: 'light',
    locale: 'pl',
    density: 'comfortable',
    motion: 'full',
  } as const satisfies PapaDataRuntimeGlobals;

function includesValue<const Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value {
  return (
    typeof value === 'string'
    && values.includes(value as Value)
  );
}

export function readPapaDataSystemMotionPreference(): PapaDataRuntimeMotion {
  if (
    typeof window !== 'undefined'
    && window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
  ) {
    return 'reduced';
  }

  return defaultPapaDataRuntimeGlobals.motion;
}

export function normalizePapaDataRuntimeGlobals(
  input: PapaDataRuntimeGlobalsInput = {},
): PapaDataRuntimeGlobals {
  return {
    theme: includesValue(
      papaDataRuntimeThemes,
      input.theme,
    )
      ? input.theme
      : defaultPapaDataRuntimeGlobals.theme,

    locale: includesValue(
      papaDataRuntimeLocales,
      input.locale,
    )
      ? input.locale
      : defaultPapaDataRuntimeGlobals.locale,

    density: includesValue(
      papaDataRuntimeDensities,
      input.density,
    )
      ? input.density
      : defaultPapaDataRuntimeGlobals.density,

    motion: includesValue(
      papaDataRuntimeMotionModes,
      input.motion,
    )
      ? input.motion
      : defaultPapaDataRuntimeGlobals.motion,
  };
}

export function getInitialPapaDataRuntimeGlobals(
  input: PapaDataRuntimeGlobalsInput = {},
): PapaDataRuntimeGlobals {
  return normalizePapaDataRuntimeGlobals({
    motion: readPapaDataSystemMotionPreference(),
    ...input,
  });
}

function getEffectivePapaDataMotion(
  requestedMotion: PapaDataRuntimeMotion,
): PapaDataRuntimeMotion {
  return readPapaDataSystemMotionPreference() === 'reduced'
    ? 'reduced'
    : requestedMotion;
}

export function getPapaDataRuntimeAttributes(
  input: PapaDataRuntimeGlobalsInput = {},
) {
  const globals =
    normalizePapaDataRuntimeGlobals(input);
  const effectiveMotion =
    getEffectivePapaDataMotion(globals.motion);

  return {
    'data-theme': globals.theme,
    'data-locale': globals.locale,
    'data-density': globals.density,
    'data-motion': effectiveMotion,
    'data-motion-requested': globals.motion,
  } as const;
}

export function applyPapaDataRuntimeGlobals(
  target: HTMLElement,
  input: PapaDataRuntimeGlobalsInput = {},
): PapaDataRuntimeGlobals {
  const requestedGlobals =
    normalizePapaDataRuntimeGlobals(input);
  const globals = {
    ...requestedGlobals,
    motion: getEffectivePapaDataMotion(
      requestedGlobals.motion,
    ),
  } satisfies PapaDataRuntimeGlobals;

  target.setAttribute(
    'data-theme',
    globals.theme,
  );
  target.setAttribute(
    'data-locale',
    globals.locale,
  );
  target.setAttribute(
    'data-density',
    globals.density,
  );
  target.setAttribute(
    'data-motion',
    globals.motion,
  );
  target.setAttribute(
    'data-motion-requested',
    requestedGlobals.motion,
  );

  if (target.tagName.toLowerCase() === 'html') {
    target.setAttribute(
      'lang',
      globals.locale,
    );
  }

  return globals;
}

export {
  formatPapaDataCurrency,
  formatPapaDataDate,
  formatPapaDataDateRange,
  formatPapaDataNumber,
  formatPapaDataPercent,
  formatPapaDataRelativeTime,
  getPapaDataIntlLocale,
} from './formatters';
