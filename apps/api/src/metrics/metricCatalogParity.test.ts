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

  // INTENTIONALLY RED. Verified before writing this test (see task summary):
  // the engine defines 28 metric codes; the catalog declares 58. Of the
  // catalog's 58 keys, exactly the 27 marked implementationStatus
  // "migration_ready" have a matching engine metricCode (byte-identical
  // keys). The remaining 31 catalog keys are "planned_p0" (mandatory for MVP
  // per rule 2, but not yet migration-ready) and have NO engine definition
  // at all under their catalog key -- EXCEPT "cogs" (KPI-34, planned_p0),
  // which the engine already computes, but under the different key
  // "cost_of_goods_sold" rather than "cogs". That is a real naming
  // divergence, not a missing metric -- do not "fix" it by renaming either
  // side to make this test pass; the naming choice needs a real product/eng
  // decision (see task summary). This test exists to keep that gap visible
  // and enumerated, not to be silenced.
  it("every catalog metricKey has a same-keyed Metric Engine definition, and vice versa", () => {
    const catalogKeys = new Set(catalog.metrics.map((metric) => metric.metricKey));
    const engineKeys = new Set<string>(dashboardMetricCodes);

    const missingFromEngine = [...catalogKeys]
      .filter((key) => !engineKeys.has(key))
      .sort();
    const unexpectedInEngine = [...engineKeys]
      .filter((key) => !catalogKeys.has(key))
      .sort();

    expect(
      missingFromEngine,
      `${missingFromEngine.length} catalog metricKey(s) have no matching Metric Engine definition: `
        + `${missingFromEngine.join(", ")}. Each is "planned_p0" work per the P0-01 spec, still open.`,
    ).toEqual([]);
    expect(
      unexpectedInEngine,
      `${unexpectedInEngine.length} engine metricCode(s) are not declared in the canonical catalog: `
        + `${unexpectedInEngine.join(", ")}. "cost_of_goods_sold" is the known case (implements the `
        + `catalog's "cogs", KPI-34, under a different key) -- see this test's file comment.`,
    ).toEqual([]);
  });
});
