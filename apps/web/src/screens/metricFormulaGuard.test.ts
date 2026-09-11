import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// P0-01 rule 3 (docs/specyfikacja-docelowa/26-priorytety-p0/01-katalog-58-metryk.md):
// "Frontend, raporty i AI nie zawieraja wlasnych formul. Pobieraja ten sam
// snapshotId z backendowego Metric Engine." apps/web already has dozens of
// small screen-local derived-data helpers in *.data.ts files -- retroactively
// removing all of them is a separate, much bigger refactor and deliberately
// out of scope here. This is a *regression* guard: it allowlists today's
// known SQL-like/manual-ratio occurrences (found by running the same
// detector this test uses, before writing it) and fails on anything NEW.

const srcRoot = fileURLToPath(new URL('..', import.meta.url));

// AnalyticsModuleWorkspace.tsx does not match the *.data.ts naming
// convention the rest of this scan relies on, but the same audit that
// found the *.data.ts occurrences also found an inline money-ratio formula
// here (see ALLOWLISTED_MATCHES) -- named explicitly rather than widening
// the glob to every *Workspace.tsx, which would pull in unrelated files.
const EXTRA_FILES: readonly string[] = ['runtime/analytics/AnalyticsModuleWorkspace.tsx'];

const scannedFiles = [...globSync('**/*.data.ts', { cwd: srcRoot }), ...EXTRA_FILES].sort();

// Narrow and high-precision on purpose: an early draft matched *any*
// "identifier / identifier" division and it flagged relative import paths
// such as '../../../../../contracts/ui-contract-types' (the "/" in the
// path). Two real shapes instead:
// - literal SQL-style aggregation keywords (SUM(/AVG(/COUNT() -- exactly
//   the shape of metricEngineCore.ts's own `formula` strings, e.g.
//   "SUM(canonical_orders.gross_amount)" -- a sign a backend-shaped
//   formula got copied into the frontend instead of a snapshot being
//   consumed.
// - manual division between two `.amount`-suffixed accessors (e.g.
//   `revenue.amount / spend.amount`), the money-ratio shape a metric like
//   roas/aov already owns in the Metric Engine.
const FORMULA_PATTERNS: readonly RegExp[] = [
  /\b(?:SUM|AVG|COUNT)\s*\(/,
  /[A-Za-z_][\w.]*\.amount\s*\/\s*[A-Za-z_][\w.]*\.amount/,
];

// Known, audited-and-accepted as of this task (2026-09-09):
// - OrdersScreen.data.ts:96/117 are demo-fixture `source:` string labels
//   describing where a mocked KPI notionally comes from (not executable
//   code).
// - AnalyticsModuleWorkspace.tsx:995/1615 are real inline ratios (budget
//   utilization, ROAS-shaped revenue/spend) computed client-side -- a real,
//   pre-existing instance of the exact drift P0-01 rule 3 forbids, called
//   out in the task summary as an observation, not fixed here (retrofitting
//   it to consume a Metric Engine snapshot is a separate, larger change).
// Keyed by "relative/path:lineNumber" so a *new* match on an
// already-allowlisted file (a different line) still fails the test.
const ALLOWLISTED_MATCHES = new Set<string>([
  'screens/orders/OrdersScreen.data.ts:96',
  'screens/orders/OrdersScreen.data.ts:117',
  'runtime/analytics/AnalyticsModuleWorkspace.tsx:1001',
  'runtime/analytics/AnalyticsModuleWorkspace.tsx:1621',
]);

type FormulaMatch = { readonly key: string; readonly snippet: string };

function findFormulaMatches(relativePath: string): readonly FormulaMatch[] {
  const text = readFileSync(join(srcRoot, relativePath), 'utf8');
  const matches: FormulaMatch[] = [];

  text.split('\n').forEach((line, index) => {
    if (FORMULA_PATTERNS.some((pattern) => pattern.test(line))) {
      matches.push({ key: `${relativePath}:${index + 1}`, snippet: line.trim() });
    }
  });

  return matches;
}

describe('frontend does not grow new local Metric Engine formulas', () => {
  it('scans apps/web/src *.data.ts files (+ AnalyticsModuleWorkspace.tsx) for SUM(/AVG(/COUNT(-style or manual money-ratio formulas', () => {
    // Sanity: the scan itself is not accidentally a no-op.
    expect(scannedFiles.length).toBeGreaterThan(0);

    const unexpected = scannedFiles
      .flatMap((file) => findFormulaMatches(file))
      .filter((match) => !ALLOWLISTED_MATCHES.has(match.key));

    const message = [
      `${unexpected.length} new SQL-like/manual-ratio formula pattern(s) found outside the allowlist:`,
      ...unexpected.map((match) => `  ${match.key}: ${match.snippet}`),
      '',
      'Per P0-01 rule 3, the frontend must consume a Metric Engine snapshot instead of computing its own',
      'formula. If this really is a new local formula, wire it to a real snapshot instead -- or, only if it',
      "is definitely not a business-metric formula (e.g. a UI-only layout ratio), add it to this test's",
      'ALLOWLISTED_MATCHES with a comment explaining why.',
    ].join('\n');

    expect(unexpected, message).toEqual([]);
  });

  it('the allowlist has no stale entries (every allowlisted key is still a real match today)', () => {
    const actualKeys = new Set(scannedFiles.flatMap((file) => findFormulaMatches(file)).map((match) => match.key));
    const staleEntries = [...ALLOWLISTED_MATCHES].filter((key) => !actualKeys.has(key));

    expect(staleEntries).toEqual([]);
  });
});
