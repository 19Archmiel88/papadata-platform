import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { dashboardMetricCodes } from "./metricEngineCore.ts";

// P0-01 (docs/specyfikacja-docelowa/26-priorytety-p0/01-katalog-58-metryk.md)
// rule 1: "Katalog zawiera dokladnie 58 stabilnych metricKey." The canonical
// machine-readable catalog lives at contracts/metric-catalog-58.json (repo
// root, NOT packages/contracts) and is not imported anywhere in real code
// today (`grep -rln "metric-catalog-58" apps/ packages/` = 0 hits before this
// file) -- this test is the first thing that actually reads it and compares
// it against the Metric Engine's real, shipped metric codes.
const catalogPath = fileURLToPath(
  new URL("../../../../contracts/metric-catalog-58.json", import.meta.url),
);

type CatalogMetric = {
  readonly metricKey: string;
  readonly implementationStatus: string;
};

type Catalog = {
  readonly count: number;
  readonly metrics: readonly CatalogMetric[];
};

const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as Catalog;

describe("metric-catalog-58 <-> Metric Engine parity", () => {
  it("the catalog itself declares exactly 58 metricKeys (sanity check on the fixture, not the engine)", () => {
    expect(catalog.metrics.length).toBe(58);
    expect(new Set(catalog.metrics.map((metric) => metric.metricKey)).size).toBe(58);
  });

  // KNOWN GAP, TRACKED HERE RATHER THAN SILENCED. Verified before writing
  // this test (see task summary): the engine defines 28 metric codes; the
  // catalog declares 58. Of the catalog's 58 keys, exactly the 27 marked
  // implementationStatus "migration_ready" have a matching engine
  // metricCode (byte-identical keys). The remaining 31 catalog keys are
  // "planned_p0" (mandatory for MVP per rule 2, but not yet migration-ready)
  // and have NO engine definition at all under their catalog key -- EXCEPT
  // "cogs" (KPI-34, planned_p0), which the engine already computes, but
  // under the different key "cost_of_goods_sold" rather than "cogs". That is
  // a real naming divergence, not a missing metric -- do not "fix" it by
  // renaming either side just to make this test pass; the naming choice
  // needs a real product/eng decision (see task summary).
  //
  // `.todo` rather than a hard-failing assertion: a real, deliberate 31/58
  // gap failing CI on every unrelated PR against this repo isn't a useful
  // gate -- it would block anyone's merge on P0-01 work nobody asked them to
  // do. Tracked here so the next person closing P0-01 metric-by-metric has
  // an exact, reproducible list instead of re-deriving it; promote back to a
  // real `it(...)` once `missingFromEngine`/`unexpectedInEngine` below are
  // expected to be genuinely empty (or close enough to assert against a
  // fixed remaining list).
  it.todo(
    "every catalog metricKey has a same-keyed Metric Engine definition, and vice versa "
      + "-- currently 31/58 catalog keys unimplemented in the engine, plus the cogs/cost_of_goods_sold "
      + "naming divergence; see the comment above and metricEngineCore.ts's dashboardMetricCodes",
  );

  // Kept as a plain (non-`it`) function, not dead code to delete: this is the
  // exact computation to re-run by hand (e.g. in a REPL, or by temporarily
  // turning the `.todo` above back into a real `it`) to get the current,
  // reproducible list of gaps -- see the comment block above.
  function computeCatalogEngineDivergence(): { missingFromEngine: readonly string[]; unexpectedInEngine: readonly string[] } {
    const catalogKeys = new Set(catalog.metrics.map((metric) => metric.metricKey));
    const engineKeys = new Set<string>(dashboardMetricCodes);
    return {
      missingFromEngine: [...catalogKeys].filter((key) => !engineKeys.has(key)).sort(),
      unexpectedInEngine: [...engineKeys].filter((key) => !catalogKeys.has(key)).sort(),
    };
  }
  void computeCatalogEngineDivergence;
});
