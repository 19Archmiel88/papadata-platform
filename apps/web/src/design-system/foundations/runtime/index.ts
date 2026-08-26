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

const papaDataRuntimeStorageKey =
  'papadata.runtime-preferences.v1';

export const papaDataRuntimePreferenceChangeEvent =
  'papadata-runtime-preference-change';

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
    ...readStoredPapaDataRuntimeGlobals(),
    ...input,
  });
}

export function readStoredPapaDataRuntimeGlobals():
  PapaDataRuntimeGlobalsInput {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(
      papaDataRuntimeStorageKey,
    );

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === 'object'
      ? parsed as PapaDataRuntimeGlobalsInput
      : {};
  } catch {
    return {};
  }
}

export function writeStoredPapaDataRuntimeGlobals(
  input: PapaDataRuntimeGlobalsInput,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const nextGlobals = normalizePapaDataRuntimeGlobals({
      ...readStoredPapaDataRuntimeGlobals(),
      ...input,
    });

    window.localStorage.setItem(
      papaDataRuntimeStorageKey,
      JSON.stringify(nextGlobals),
    );
  } catch {
    // Runtime preferences are progressive enhancement only.
  }
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

export function applyStoredPapaDataRuntimePreference(
  input: PapaDataRuntimeGlobalsInput,
): PapaDataRuntimeGlobals {
  if (typeof document === 'undefined') {
    return normalizePapaDataRuntimeGlobals(input);
  }

  writeStoredPapaDataRuntimeGlobals(input);

  const globals = getInitialPapaDataRuntimeGlobals({
    density: document.documentElement.dataset.density,
    locale: document.documentElement.dataset.locale,
    motion:
      document.documentElement.dataset.motionRequested
      ?? document.documentElement.dataset.motion,
    theme: document.documentElement.dataset.theme,
    ...input,
  });

  const targets = new Set<HTMLElement>([
    document.documentElement,
    ...Array.from(
      document.querySelectorAll<HTMLElement>('.pd-storybook-canvas'),
    ),
  ]);

  targets.forEach((target) => {
    applyPapaDataRuntimeGlobals(target, globals);
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(
        papaDataRuntimePreferenceChangeEvent,
        { detail: globals },
      ),
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
