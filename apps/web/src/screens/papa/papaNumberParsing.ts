/**
 * Shared numeric parsing helpers for Papa runtime data mapping. Every
 * function here returns `null` (never a fabricated `0`) when a value can't
 * be honestly parsed — callers must render an explicit "no data" state
 * rather than silently treating an unparseable value as zero.
 */

export function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Parses a percentage out of a free-text status string, e.g. "92% confidence".
 */
export function parseConfidence(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.match(/(\d+(?:[.,]\d+)?)\s*%/u);
  if (!match?.[1]) return null;
  const parsed = Number(match[1].replace(',', '.')) / 100;
  return Number.isFinite(parsed) ? clamp(parsed) : null;
}

/**
 * Parses a display-formatted numeric string (pl-PL locale conventions:
 * space as thousands separator, comma as decimal separator, optional unit
 * suffix like "PLN"/"%") into a plain number. Used for
 * `PapaScreenContextElement.value` snapshots, which are always strings.
 */
export function parseElementNumericValue(value: string | null | undefined): number | null {
  if (!value) return null;
  const stripped = value
    .replaceAll(/[\s\u00a0]/gu, '')
    .replace(/[a-zA-ZżźćńółęąśŻŹĆŃÓŁĘĄŚ%]+$/u, '');
  const normalized = stripped.replace(',', '.');
  if (normalized.length === 0 || !/^-?\d+(\.\d+)?$/u.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
